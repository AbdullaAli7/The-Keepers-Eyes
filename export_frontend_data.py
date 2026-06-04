"""
Export Frontend Data  (Phase 4)
===============================

Decouples the frontend from its hard-coded player blob. v1-v3 embedded ~49
players directly in TheKeepersEyes.jsx; this script converts the full
models/player_profiles.json (700+ players on the complete dataset) plus the raw
penalties into the compact JSON shape the React app consumes, written to
web/public/data.json.

This is what makes the app deployable with the WHOLE player set instead of a
baked-in subset, and lets you refresh the site by re-running training + this
export rather than editing source.

Usage:
    python export_frontend_data.py
    python export_frontend_data.py --min-pens 5 --out web/public/data.json
"""

import argparse
import json
import os

import pandas as pd

DIRECTIONS = ["Left", "Center", "Right"]


def _zone_from_yz(y, z):
    hz = "Left" if y < 38.67 else ("Right" if y > 41.33 else "Center")
    return hz


def build_player_entry(prof, shots_df):
    """Convert one profile + that player's raw shots into the frontend shape."""
    pid = prof["player_id"]
    dir_probs = prof["direction_probs"]
    sub = shots_df[shots_df["player_id"] == pid].sort_values(
        ["match_date", "minute", "second"], kind="mergesort"
    )

    # Individual shots (cap 15, most recent kept) for the heatmap.
    shots = []
    for _, r in sub.tail(15).iterrows():
        if pd.isna(r.get("end_y")) or pd.isna(r.get("end_z")):
            continue
        shots.append({
            "y": round(float(r["end_y"]), 1),
            "z": round(float(r["end_z"]), 1),
            "o": int(r["outcome"] == "Goal"),
            "so": bool(r.get("is_shootout", False)),
            "comp": str(r.get("competition", ""))[:22],
            "vs": str(r.get("away_team") if r.get("team_name") == r.get("home_team")
                      else r.get("home_team", "")),
        })

    # Last-5 form + streak from chronological outcomes.
    outcomes = (sub["outcome"] == "Goal").astype(int).tolist()
    last5 = f"{sum(outcomes[-5:])}/{min(5, len(outcomes))}"
    streak = 0; streak_t = "scored"
    for o in reversed(outcomes):
        if streak == 0:
            streak = 1; streak_t = "scored" if o else "missed"
        elif (o == 1) == (streak_t == "scored"):
            streak += 1
        else:
            break

    # Shootout vs in-game conversion.
    so = sub[sub["is_shootout"] == True] if "is_shootout" in sub.columns else sub.iloc[0:0]
    ig = sub[sub["is_shootout"] != True] if "is_shootout" in sub.columns else sub
    so_n = int(len(so))
    so_rate = round(float((so["outcome"] == "Goal").mean()), 3) if so_n else None
    ig_rate = round(float((ig["outcome"] == "Goal").mean()), 3) if len(ig) else None

    ks = prof.get("keeper_strategy", {})
    seq = prof.get("sequence", {})

    # Teams + competitions the player appears in (for the UI subtitle/search).
    teams = sorted(set(t for t in sub["team_name"].dropna().unique()))
    comps = sorted(set(c for c in sub["competition"].dropna().unique()))

    # cross-body vs natural: for a right-footer, natural side is the keeper's
    # right (taker's left); we approximate with the dominant non-center side.
    foot = prof["preferred_foot"]
    natural_dir = "Left" if foot == "Right Foot" else "Right"
    cross_dir = "Right" if foot == "Right Foot" else "Left"

    return {
        "id": pid,
        "name": prof["player_name"],
        "pens": prof["penalties_taken"],
        "goals": prof["goals_scored"],
        "rate": prof["conversion_rate"] or 0,
        "foot": foot,
        "dir": {k: round(dir_probs.get(k, 0), 3) for k in DIRECTIONS},
        "dir_ci": prof.get("direction_ci", {}),
        "zone": {k: round(v, 3) for k, v in prof.get("zone_probs", {}).items()},
        "height": {k: round(v, 3) for k, v in prof.get("height_probs", {}).items()},
        "top_dir": prof["most_likely_direction"],
        "top_zone": prof["most_likely_zone"],
        "conf": prof["confidence"],
        "pred": prof["predictability"],
        "shots": shots,
        "last5": last5,
        "streak": streak,
        "streak_t": streak_t,
        "so_n": so_n,
        "so_rate": so_rate,
        "ig_rate": ig_rate,
        "natural": dir_probs.get(natural_dir, 0),
        "cross": dir_probs.get(cross_dir, 0),
        "teams": teams or ["—"],
        "comps": comps,
        # Phase 3 fields surfaced to the UI:
        "ks": {k: ks.get("keeper_strategy", {}).get(k, 0) for k in DIRECTIONS},
        "ks_dive": ks.get("recommended_dive"),
        "ks_timing": ks.get("commit_timing"),
        "ks_exploit": ks.get("exploitability"),
        "seq_pattern": seq.get("pattern"),
        "seq_dep": seq.get("dependence"),
        # Legacy GK rec fields the existing UI expects:
        "gk_d": ks.get("recommended_dive", prof["most_likely_direction"]),
        "gk_c": "HIGH" if prof["confidence"] >= 0.8 else ("MEDIUM" if prof["confidence"] >= 0.5 else "LOW"),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--profiles", default="models/player_profiles.json")
    ap.add_argument("--data", default="data/penalties_dataset.csv")
    ap.add_argument("--out", default="web/public/data.json")
    ap.add_argument("--min-pens", type=int, default=5)
    args = ap.parse_args()

    prof_doc = json.load(open(args.profiles))
    profiles = prof_doc["profiles"]
    df = pd.read_csv(args.data)

    players = []
    for prof in profiles.values():
        if prof["penalties_taken"] >= args.min_pens:
            players.append(build_player_entry(prof, df))
    players.sort(key=lambda p: -p["pens"])

    pop = prof_doc["population_rates"]

    # Leaderboards
    lb_pred = sorted(players, key=lambda p: -p["pred"])[:10]
    lb_conv = sorted([p for p in players if p["pens"] >= 5], key=lambda p: -p["rate"])[:10]
    lb_exp = sorted(players, key=lambda p: -p["pens"])[:10]

    out = {
        "pop": pop,
        "players": players,
        "total": int(len(df)),
        "n_players": int(df["player_id"].nunique()),
        "lb": {
            "pred": [{"name": p["name"], "pens": p["pens"], "val": p["pred"], "dir": p["top_dir"]} for p in lb_pred],
            "conv": [{"name": p["name"], "pens": p["pens"], "val": p["rate"]} for p in lb_conv],
            "exp": [{"name": p["name"], "pens": p["pens"], "val": p["rate"]} for p in lb_exp],
        },
        "meta": {
            "intent_source": prof_doc.get("intent_source"),
            "generated_from": os.path.basename(args.profiles),
        },
    }

    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"✓ Exported {len(players)} players (>= {args.min_pens} pens) -> {args.out}")
    print(f"  Total penalties: {out['total']}, unique players: {out['n_players']}")


if __name__ == "__main__":
    main()
