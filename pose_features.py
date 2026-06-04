"""
Pose / Run-up Feature Scaffold  (Phase 2 — the real accuracy unlock)
====================================================================

Why this exists
---------------
History/context-only models top out around 60-65% on penalty direction. The
only thing that reliably pushes past that — into the ~85-89% range — is reading
the KICKER'S BODY in the final step before contact: hip orientation, plant-foot
direction, shoulder line, and run-up angle. Real goalkeepers do exactly this.

This module is the bridge. It does NOT require a full video pipeline to be
useful: you annotate a single frame ~1 step before ball contact (or let a pose
estimator do it), drop the keypoints in, and this module turns them into the
handful of features that actually carry directional signal. Those features then
merge into penalties_dataset.csv and flow straight into train_model.py.

Workflow
--------
1. For each penalty you want to enrich, grab one frame ~1 step before contact.
2. Run a pose estimator (MediaPipe Pose, MoveNet, or YOLOv8-pose) to get 2D
   body keypoints. Save them as a JSON list (see POSE_INPUT_SCHEMA below).
3. Run:  python pose_features.py --keypoints poses.json --out pose_features.csv
4. Merge into the main dataset:
       python pose_features.py --merge data/penalties_dataset.csv pose_features.csv
5. Add the pose feature names (POSE_FEATURE_COLS) to FEATURE_COLS in
   train_model.py. They're NaN-aware, so they go silent on un-annotated rows.

Keypoint convention
-------------------
We use the COCO-17 keypoint ordering that MoveNet / YOLOv8-pose emit:
   0 nose, 1 l_eye, 2 r_eye, 3 l_ear, 4 r_ear,
   5 l_shoulder, 6 r_shoulder, 7 l_elbow, 8 r_elbow, 9 l_wrist, 10 r_wrist,
   11 l_hip, 12 r_hip, 13 l_knee, 14 r_knee, 15 l_ankle, 16 r_ankle
Each keypoint is [x, y] (or [x, y, confidence]) in image pixels, origin top-left.

IMPORTANT — perspective normalization
-------------------------------------
Raw pixel angles depend on camera framing. We normalize everything to be
camera-agnostic by working with RELATIVE angles (hip line vs shoulder line,
plant foot vs hips) and SIGNED left/right tendencies from the kicker's frame of
reference. We also flip left-footers so "open body" always means the same thing.
This is a documented best-effort heuristic, not ground truth — annotate enough
samples and let the model learn the residual.
"""

import argparse
import csv
import json
import math
import os
import sys

# COCO-17 indices
NOSE, L_EYE, R_EYE, L_EAR, R_EAR = 0, 1, 2, 3, 4
L_SHO, R_SHO, L_ELB, R_ELB, L_WRI, R_WRI = 5, 6, 7, 8, 9, 10
L_HIP, R_HIP, L_KNE, R_KNE, L_ANK, R_ANK = 11, 12, 13, 14, 15, 16

POSE_INPUT_SCHEMA = {
    "penalty_id": "join key — match_id_minute_second or any stable id you assign",
    "is_right_foot": "1 if right-footed kicker (used to mirror lefties), optional",
    "keypoints": "list of 17 [x, y] (or [x, y, conf]) in COCO-17 order",
}

# Feature names produced by this module (mirror these into train_model FEATURE_COLS)
POSE_FEATURE_COLS = [
    "pose_hip_angle",       # signed hip-line angle vs horizontal (open/closed)
    "pose_shoulder_angle",  # signed shoulder-line angle vs horizontal
    "pose_torso_twist",     # shoulder_angle - hip_angle (separation)
    "pose_plant_foot_lr",   # plant foot horizontal offset vs hips (+ = toward kicker-right)
    "pose_lean_lr",         # head/torso lateral lean (+ = toward kicker-right)
    "pose_runup_side",      # approach side proxy from foot stagger (+ = from the right)
    "has_pose",             # 1 if pose features present
]


def _pt(kps, i):
    """Return (x, y) for keypoint i, or None if missing / low confidence."""
    if i >= len(kps) or kps[i] is None:
        return None
    p = kps[i]
    if len(p) >= 3 and p[2] is not None and p[2] < 0.2:
        return None
    if len(p) < 2:
        return None
    return (float(p[0]), float(p[1]))


def _angle_deg(a, b):
    """Signed angle (deg) of the line a->b relative to horizontal, image coords.
    Positive = b is lower-right of a in screen terms; we only use it relatively."""
    if a is None or b is None:
        return None
    return math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))


def _mid(a, b):
    if a is None or b is None:
        return None
    return ((a[0] + b[0]) / 2.0, (a[1] + b[1]) / 2.0)


def compute_pose_features(keypoints, is_right_foot=1):
    """
    Turn 17 COCO keypoints into the directional pose features.

    All horizontal signs are expressed from the KICKER'S frame: positive =
    toward the kicker's right. For left-footers we mirror the x-axis so "open
    body / plant-foot-right" carries the same meaning across footedness.

    Returns a dict of POSE_FEATURE_COLS (any can be None if keypoints missing).
    """
    out = {k: None for k in POSE_FEATURE_COLS}
    out["has_pose"] = 0
    if not keypoints:
        return out

    l_sho, r_sho = _pt(keypoints, L_SHO), _pt(keypoints, R_SHO)
    l_hip, r_hip = _pt(keypoints, L_HIP), _pt(keypoints, R_HIP)
    nose = _pt(keypoints, NOSE)
    l_ank, r_ank = _pt(keypoints, L_ANK), _pt(keypoints, R_ANK)

    # Need at least a torso to do anything useful
    if not (l_sho and r_sho and l_hip and r_hip):
        return out

    out["has_pose"] = 1
    mirror = -1.0 if not is_right_foot else 1.0  # flip x-sign for lefties

    # Shoulder + hip line orientation (relative angles, camera-agnostic-ish)
    sho_ang = _angle_deg(l_sho, r_sho)
    hip_ang = _angle_deg(l_hip, r_hip)
    if sho_ang is not None:
        out["pose_shoulder_angle"] = round(sho_ang, 2)
    if hip_ang is not None:
        out["pose_hip_angle"] = round(hip_ang, 2)
    if sho_ang is not None and hip_ang is not None:
        out["pose_torso_twist"] = round(sho_ang - hip_ang, 2)

    hip_mid = _mid(l_hip, r_hip)
    sho_mid = _mid(l_sho, r_sho)
    hip_width = abs(r_hip[0] - l_hip[0]) or 1.0  # scale normalizer

    # Plant foot lateral offset relative to hips. The plant foot is the one
    # NOT kicking; for a right-footer that's the left foot. Use whichever ankle
    # we have; offset normalized by hip width and signed to kicker frame.
    plant = l_ank if is_right_foot else r_ank
    if plant and hip_mid:
        out["pose_plant_foot_lr"] = round(mirror * (plant[0] - hip_mid[0]) / hip_width, 3)

    # Head / torso lateral lean
    if nose and hip_mid:
        out["pose_lean_lr"] = round(mirror * (nose[0] - hip_mid[0]) / hip_width, 3)

    # Run-up side proxy: stagger between the two ankles at plant
    if l_ank and r_ank:
        out["pose_runup_side"] = round(mirror * (r_ank[0] - l_ank[0]) / hip_width, 3)

    return out


def process_keypoints_file(path):
    """Read a pose-keypoints JSON and return rows of {penalty_id, **features}."""
    with open(path) as f:
        data = json.load(f)
    if isinstance(data, dict):
        data = [data]
    rows = []
    for entry in data:
        pid = entry.get("penalty_id")
        feats = compute_pose_features(
            entry.get("keypoints", []),
            int(entry.get("is_right_foot", 1)),
        )
        rows.append({"penalty_id": pid, **feats})
    return rows


def write_features_csv(rows, out_path):
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    cols = ["penalty_id"] + POSE_FEATURE_COLS
    with open(out_path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(rows)
    print(f"✓ Wrote {len(rows)} pose-feature rows -> {out_path}")


def merge_into_dataset(dataset_csv, pose_csv):
    """
    Left-merge pose features into the penalties dataset on a 'penalty_id' key.
    The dataset's penalty_id is derived as f"{match_id}_{minute}_{second}".
    Writes back in place (after a .bak backup).
    """
    import pandas as pd

    df = pd.read_csv(dataset_csv)
    df["penalty_id"] = (
        df["match_id"].astype(str) + "_"
        + df["minute"].astype("Int64").astype(str) + "_"
        + df["second"].astype("Int64").astype(str)
    )
    pose = pd.read_csv(pose_csv)
    merged = df.merge(pose, on="penalty_id", how="left")
    # Ensure has_pose is 0 (not NaN) where unmatched
    if "has_pose" in merged.columns:
        merged["has_pose"] = merged["has_pose"].fillna(0).astype(int)

    bak = dataset_csv + ".bak"
    df.to_csv(bak, index=False)
    merged.to_csv(dataset_csv, index=False)
    n = int(merged["has_pose"].sum()) if "has_pose" in merged.columns else 0
    print(f"✓ Merged pose features into {dataset_csv} ({n} rows enriched). Backup: {bak}")


def main():
    p = argparse.ArgumentParser(description="Pose/run-up feature scaffold")
    sub = p.add_subparsers(dest="cmd")

    p.add_argument("--keypoints", help="Input pose-keypoints JSON")
    p.add_argument("--out", default="data/pose_features.csv", help="Output features CSV")
    p.add_argument("--merge", nargs=2, metavar=("DATASET_CSV", "POSE_CSV"),
                   help="Merge a pose-features CSV into the penalties dataset")
    args = p.parse_args()

    if args.merge:
        merge_into_dataset(args.merge[0], args.merge[1])
        return
    if args.keypoints:
        rows = process_keypoints_file(args.keypoints)
        write_features_csv(rows, args.out)
        return
    p.print_help()
    print("\nExample keypoints JSON entry:")
    print(json.dumps({
        "penalty_id": "3773695_52_14",
        "is_right_foot": 1,
        "keypoints": [[0, 0]] * 17,
    }, indent=2))


if __name__ == "__main__":
    main()
