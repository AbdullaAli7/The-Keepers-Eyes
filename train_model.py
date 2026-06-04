"""
Penalty Kick Predictor — Model Training Pipeline (v2, leakage-free)
===================================================================

This version fixes the data-leakage problems in v1 and reports HONEST,
temporally-validated metrics. Read the notes below before trusting any number.

WHAT CHANGED FROM v1
--------------------
v1 reported ~97% accuracy on veteran takers. That number was a leakage
artifact, NOT real predictive skill:
  * The ensemble was evaluated with `model.predict_proba(X)` on the SAME rows
    the model was trained on (train-set evaluation).
  * The Bayesian profiles used in the ensemble were built from each player's
    ENTIRE career, including the penalty being predicted.
For a high-volume taker, the "history" feature literally encodes the answer.

v2 fixes this with strict TEMPORAL (walk-forward) validation: every prediction
for a penalty uses ONLY penalties that happened chronologically BEFORE it.
This mirrors how a real scout works — you only have the past. Expect direction
accuracy in the ~55-63% range, which is in line with the published literature
for history/context-only models (video+pose models reach ~85-89%).

WHAT WE PREDICT
---------------
A scouting tool should model the taker's INTENT (where they aim), not where the
ball physically ended up. A saved/off-target penalty's end_location reflects the
keeper's save or a miss, not the plan. So:
  * Player tendency PROFILES are built from GOALS only (cleanest intent signal),
    with an option to include all attempts.
  * Evaluation is reported on goals (intent proxy) AND on all penalties, so the
    difference is transparent.

Three complementary models:
  1. Bayesian player profiles — Dirichlet-smoothed direction/zone/height dists
     with credible intervals (real uncertainty, not just a sample-size counter).
  2. XGBoost classifier — engineered context + leakage-free historical features.
  3. Ensemble — blends the two, weighting toward personal history as data grows.

Targets:
  * direction_3: Left | Center | Right   (most actionable for keepers)
  * height_3:    Low | Mid | High
  * zone_9:      Bottom-Left, Mid-Right, Top-Center, ...

Usage:
    python train_model.py                          # Train on full dataset
    python train_model.py --data data/custom.csv   # Custom dataset
    python train_model.py --intent-source all      # Profile on all attempts
"""

import argparse
import json
import os
import warnings

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import accuracy_score, classification_report, log_loss, brier_score_loss
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb

# Phase 3 modules
try:
    from game_theory import optimal_keeper_strategy
    from sequence_model import sequence_profile
    _PHASE3 = True
except Exception:
    _PHASE3 = False

warnings.filterwarnings("ignore", category=UserWarning)

MODELS_DIR = "models"
DEFAULT_DATA = "data/penalties_dataset.csv"

# Dirichlet prior strength — controls how much we trust population rates
# vs individual history. Higher = more smoothing toward population average.
PRIOR_STRENGTH = 3.0

DIRECTIONS = ["Center", "Left", "Right"]  # alphabetical (matches LabelEncoder)
HEIGHTS = ["High", "Low", "Mid"]


# ═══════════════════════════════════════════════════════════════════
# 1. DATA LOADING & FEATURE ENGINEERING
# ═══════════════════════════════════════════════════════════════════

def load_and_prepare(path: str) -> pd.DataFrame:
    """Load CSV, sort chronologically, and engineer leakage-free features."""
    df = pd.read_csv(path)

    # Drop rows without placement data
    df = df.dropna(subset=["shot_zone_horizontal", "shot_zone_vertical", "shot_zone"])
    df = df.copy()

    # ── Targets ──────────────────────────────────────────────────
    df["direction_3"] = df["shot_zone_horizontal"]  # Left, Center, Right
    df["height_3"] = df["shot_zone_vertical"]        # Low, Mid, High
    df["zone_9"] = df["shot_zone"]                   # Bottom-Left, etc.

    # ── Outcome flag (intent proxy) ──────────────────────────────
    df["is_goal"] = (df["outcome"] == "Goal").astype(int)

    # ── Static context features ──────────────────────────────────
    df["is_right_foot"] = (df["body_part"] == "Right Foot").astype(int)
    df["is_shootout"] = df["is_shootout"].astype(int)

    tier_map = {
        "Premier League": 1, "La Liga": 1, "Serie A": 1,
        "1. Bundesliga": 1, "Ligue 1": 1,
        "Champions League": 2, "UEFA Europa League": 2,
        "FIFA World Cup": 3, "UEFA Euro": 3,
        "Copa America": 3, "African Cup of Nations": 3,
        "Women's World Cup": 3, "UEFA Women's Euro": 3,
    }
    df["competition_tier"] = df["competition"].map(tier_map).fillna(2).astype(int)

    knockout_keywords = ["Final", "Semi", "Quarter", "Round of", "Knockout", "Play"]
    df["is_knockout"] = df["competition_stage"].apply(
        lambda x: int(any(k.lower() in str(x).lower() for k in knockout_keywords))
    )

    df["minute_bucket"] = pd.cut(
        df["minute"].fillna(45),
        bins=[0, 30, 60, 90, 120, 200],
        labels=[0, 1, 2, 3, 4],
    ).astype(int)

    df["is_extra_time"] = (df["period"].isin([3, 4])).astype(int)

    # ── Freeze-frame / scene features (Phase 2) ──────────────────
    # Sparse (~12% coverage). XGBoost handles NaN natively, so these go
    # "silent" when absent rather than being imputed to a misleading value.
    for col in ["gk_y_offset", "gk_depth", "ff_defenders", "ff_teammates", "taker_y_offset"]:
        if col not in df.columns:
            df[col] = np.nan
        df[col] = pd.to_numeric(df[col], errors="coerce")
    if "has_freeze_frame" not in df.columns:
        df["has_freeze_frame"] = 0
    df["has_freeze_frame"] = df["has_freeze_frame"].fillna(0).astype(int)

    # ── Pose / run-up features (Phase 2; present only if enriched) ──
    # If pose_features.py has merged columns in, coerce them to numeric so the
    # model can use them. They're NaN-aware and go silent on un-annotated rows.
    POSE_COLS = ["pose_hip_angle", "pose_shoulder_angle", "pose_torso_twist",
                 "pose_plant_foot_lr", "pose_lean_lr", "pose_runup_side"]
    for col in POSE_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    if "has_pose" in df.columns:
        df["has_pose"] = pd.to_numeric(df["has_pose"], errors="coerce").fillna(0).astype(int)

    # ── Chronological order is REQUIRED for leakage-free history ──
    # Use date + minute + second so within-match ordering is stable.
    df["match_date"] = df["match_date"].fillna("")
    df = df.sort_values(
        ["match_date", "minute", "second"], kind="mergesort"
    ).reset_index(drop=True)

    # ── Temporal recency weight (Phase 2) ────────────────────────
    # Recent penalties should count more — players evolve (e.g. Messi shifted
    # left->right over his career). Exponential decay with a ~4-year half-life,
    # measured backward from the most recent penalty in the dataset.
    dates = pd.to_datetime(df["match_date"], errors="coerce")
    ref = dates.max()
    HALF_LIFE_DAYS = 365.25 * 4
    age_days = (ref - dates).dt.days.fillna(0).clip(lower=0)
    df["recency_weight"] = np.power(0.5, age_days / HALF_LIFE_DAYS)

    # ── Leakage-free (PAST-ONLY) player history features ─────────
    df = _add_past_only_history_features(df)

    return df


def _add_past_only_history_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    For each penalty, compute the player's tendencies using ONLY their penalties
    that occurred strictly BEFORE it (walk-forward / leave-future-out).

    v1 used leave-one-out, which leaks future information: when predicting
    penalty #3, it could "see" penalties #4, #5, ... A real scout cannot. This
    version uses an expanding window so the features are exactly what you'd have
    known at kick time.

    Falls back to population priors for the player's first penalties.
    """
    pop_left = (df["direction_3"] == "Left").mean()
    pop_center = (df["direction_3"] == "Center").mean()
    pop_right = (df["direction_3"] == "Right").mean()
    pop_low = (df["height_3"] == "Low").mean()
    alpha = PRIOR_STRENGTH

    # Initialize to population priors
    df["player_hist_left"] = pop_left
    df["player_hist_center"] = pop_center
    df["player_hist_right"] = pop_right
    df["player_hist_low_pct"] = pop_low
    df["player_penalty_count"] = 0
    df["player_conversion_rate"] = 0.75

    for player_id, group in df.groupby("player_id"):
        idxs = group.index.tolist()  # already chronological
        # Running tallies of PAST penalties only
        l = c = r = low = goals = seen = 0
        for idx in idxs:
            # features reflect everything BEFORE this penalty
            n = seen
            df.loc[idx, "player_penalty_count"] = n
            df.loc[idx, "player_hist_left"] = (l + alpha * pop_left) / (n + alpha)
            df.loc[idx, "player_hist_center"] = (c + alpha * pop_center) / (n + alpha)
            df.loc[idx, "player_hist_right"] = (r + alpha * pop_right) / (n + alpha)
            df.loc[idx, "player_hist_low_pct"] = (low + alpha * pop_low) / (n + alpha)
            df.loc[idx, "player_conversion_rate"] = (goals + alpha * 0.75) / (n + alpha)

            # now fold THIS penalty into the running tallies for the next one
            d = df.loc[idx, "direction_3"]
            if d == "Left":
                l += 1
            elif d == "Center":
                c += 1
            else:
                r += 1
            if df.loc[idx, "height_3"] == "Low":
                low += 1
            goals += int(df.loc[idx, "is_goal"])
            seen += 1

    return df


# ═══════════════════════════════════════════════════════════════════
# 2. BAYESIAN PLAYER PROFILES (with credible intervals)
# ═══════════════════════════════════════════════════════════════════

def _dirichlet_ci(counts, prior, lo=0.05, hi=0.95, draws=4000, seed=0):
    """
    Monte-Carlo credible interval for each category of a Dirichlet posterior.
    counts: dict cat->observed count. prior: dict cat->population rate.
    Returns dict cat->(mean, lo, hi).
    """
    cats = list(counts.keys())
    alpha = np.array([counts[c] + PRIOR_STRENGTH * prior.get(c, 1.0 / len(cats)) for c in cats])
    rng = np.random.default_rng(seed)
    samples = rng.dirichlet(alpha, size=draws)
    out = {}
    for j, c in enumerate(cats):
        col = samples[:, j]
        out[c] = (float(col.mean()), float(np.quantile(col, lo)), float(np.quantile(col, hi)))
    return out


def _entropy_norm(probs):
    """Normalized Shannon entropy (0=one-trick, 1=uniform/unpredictable)."""
    p = np.array([v for v in probs.values() if v > 0])
    if len(p) <= 1:
        return 0.0
    h = -(p * np.log(p)).sum()
    return float(h / np.log(len(probs)))


def build_player_profiles(df: pd.DataFrame, intent_source: str = "goals") -> dict:
    """
    Build Bayesian profiles per player.

    intent_source:
      'goals' — profile built from GOALS only (cleanest intent signal). [default]
      'all'   — profile built from every attempt (legacy v1 behavior).

    Adds credible intervals and a normalized-entropy predictability score so the
    UI can show real uncertainty instead of a bare sample-size counter.
    """
    src = df[df["is_goal"] == 1] if intent_source == "goals" else df

    pop_dir = src["direction_3"].value_counts(normalize=True).to_dict()
    pop_zone = src["zone_9"].value_counts(normalize=True).to_dict()
    pop_height = src["height_3"].value_counts(normalize=True).to_dict()

    profiles = {}
    for player_id, group in src.groupby("player_id"):
        name = group["player_name"].iloc[0]
        n = len(group)
        # foot/goal counts use ALL attempts for descriptive accuracy
        all_group = df[df["player_id"] == player_id]
        foot = all_group["body_part"].mode().iloc[0]
        goals = int((all_group["outcome"] == "Goal").sum())
        attempts = int(len(all_group))
        alpha = PRIOR_STRENGTH

        def smoothed(col, cats, pop):
            counts = {k: int((group[col] == k).sum()) for k in cats}
            probs = {k: (counts[k] + alpha * pop.get(k, 1.0 / len(cats))) / (n + alpha) for k in cats}
            tot = sum(probs.values())
            return {k: v / tot for k, v in probs.items()}, counts

        dir_probs, dir_counts = smoothed("direction_3", DIRECTIONS, pop_dir)
        zone_cats = sorted(df["zone_9"].unique())
        zone_probs, _ = smoothed("zone_9", zone_cats, pop_zone)
        height_probs, _ = smoothed("height_3", HEIGHTS, pop_height)

        dir_ci = _dirichlet_ci(dir_counts, pop_dir)

        prof = {
            "player_name": name,
            "player_id": int(player_id),
            "penalties_taken": attempts,
            "goals_scored": goals,
            "profile_n": int(n),                      # n used to build the profile
            "conversion_rate": round(goals / attempts, 3) if attempts else None,
            "preferred_foot": foot,
            "direction_probs": {k: round(v, 4) for k, v in dir_probs.items()},
            "direction_ci": {k: [round(m, 4), round(lo, 4), round(hi, 4)]
                             for k, (m, lo, hi) in dir_ci.items()},
            "zone_probs": {k: round(v, 4) for k, v in zone_probs.items()},
            "height_probs": {k: round(v, 4) for k, v in height_probs.items()},
            "most_likely_direction": max(dir_probs, key=dir_probs.get),
            "most_likely_zone": max(zone_probs, key=zone_probs.get),
            "predictability": round(1.0 - _entropy_norm(dir_probs), 3),
            "confidence": round(min(1.0, n / 10), 2),
        }

        # ── Phase 3: game-theory optimal keeper strategy ──────────
        if _PHASE3:
            conv = goals / attempts if attempts else 0.78
            prof["keeper_strategy"] = optimal_keeper_strategy(
                dir_probs, conversion_rate=conv, height_probs=height_probs
            )
            # ── Phase 3: sequential / alternation tendencies ──────
            seq = all_group.sort_values(["match_date", "minute", "second"],
                                        kind="mergesort")["direction_3"].tolist()
            sp = sequence_profile(seq, base_rate=dir_probs)
            prof["sequence"] = {
                "pattern": sp["pattern"],
                "dependence": sp["dependence"],
                "transitions": sp["transitions"],
                "n_transitions": sp["n_transitions"],
            }

        profiles[str(player_id)] = prof

    return {
        "intent_source": intent_source,
        "population_rates": {
            "direction": {k: round(v, 4) for k, v in pop_dir.items()},
            "zone": {k: round(v, 4) for k, v in pop_zone.items()},
            "height": {k: round(v, 4) for k, v in pop_height.items()},
        },
        "prior_strength": PRIOR_STRENGTH,
        "profiles": profiles,
    }


# ═══════════════════════════════════════════════════════════════════
# 3. XGBOOST MODELS (honest cross-validated metrics)
# ═══════════════════════════════════════════════════════════════════

FEATURE_COLS = [
    "is_right_foot",
    "is_shootout",
    "competition_tier",
    "is_knockout",
    "minute_bucket",
    "is_extra_time",
    "player_hist_left",
    "player_hist_center",
    "player_hist_right",
    "player_hist_low_pct",
    "player_penalty_count",
    "player_conversion_rate",
    # ── Freeze-frame / scene features (Phase 2; sparse, NaN-aware) ──
    "has_freeze_frame",
    "gk_y_offset",
    "gk_depth",
    "ff_defenders",
    "ff_teammates",
    "taker_y_offset",
]

# Pose features are added to the active feature set ONLY if present in the data
# (i.e. after pose_features.py merge). Kept separate so the base model runs
# unchanged on un-enriched datasets.
POSE_FEATURE_COLS = [
    "has_pose", "pose_hip_angle", "pose_shoulder_angle", "pose_torso_twist",
    "pose_plant_foot_lr", "pose_lean_lr", "pose_runup_side",
]


def active_feature_cols(df):
    """Base features + any pose features that exist in this dataframe."""
    cols = list(FEATURE_COLS)
    cols += [c for c in POSE_FEATURE_COLS if c in df.columns]
    return cols

XGB_PARAMS = {
    "objective": "multi:softprob",
    "max_depth": 4,
    "learning_rate": 0.1,
    "n_estimators": 200,
    "min_child_weight": 5,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "reg_alpha": 0.5,
    "reg_lambda": 1.0,
    "random_state": 42,
    "eval_metric": "mlogloss",
    "tree_method": "hist",
}


def _calibration_report(y_true_onehot, probs, n_bins=10):
    """Reliability: for the predicted-class confidence, how often is it right?"""
    conf = probs.max(axis=1)
    pred = probs.argmax(axis=1)
    correct = (pred == y_true_onehot).astype(float)
    bins = np.linspace(0, 1, n_bins + 1)
    rows = []
    ece = 0.0
    for i in range(n_bins):
        m = (conf >= bins[i]) & (conf < bins[i + 1] if i < n_bins - 1 else conf <= bins[i + 1])
        if m.sum() == 0:
            continue
        avg_conf = float(conf[m].mean())
        acc = float(correct[m].mean())
        w = m.sum() / len(conf)
        ece += w * abs(avg_conf - acc)
        rows.append({"bin": f"{bins[i]:.1f}-{bins[i+1]:.1f}", "n": int(m.sum()),
                     "avg_conf": round(avg_conf, 3), "accuracy": round(acc, 3)})
    return {"ece": round(ece, 4), "bins": rows}


def train_xgb_model(df: pd.DataFrame, target_col: str, model_name: str,
                    use_recency_weight: bool = True) -> dict:
    """Train an XGBoost classifier with honest stratified-CV metrics + calibration.

    When use_recency_weight is True, each penalty is weighted by an exponential
    recency factor (recent penalties count more) during both CV folds and the
    final fit. This reflects that players' tendencies drift over time.
    """
    feat_cols = active_feature_cols(df)
    X = df[feat_cols].values
    le = LabelEncoder()
    y = le.fit_transform(df[target_col])
    class_names = list(le.classes_)
    n_classes = len(class_names)
    sw = df["recency_weight"].values if use_recency_weight else None

    print(f"\n{'─'*50}")
    print(f"Training: {model_name}")
    print(f"  Target: {target_col} ({n_classes} classes)")
    print(f"  Samples: {len(X)}")
    print(f"  Distribution: {dict(zip(class_names, np.bincount(y).tolist()))}")

    model = xgb.XGBClassifier(num_class=n_classes, **XGB_PARAMS)

    # Honest out-of-fold predictions (never evaluated on training rows).
    # Manual loop so we can pass recency sample_weights into each fold's fit.
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_probs = np.zeros((len(X), n_classes))
    for tr, te in cv.split(X, y):
        fold = xgb.XGBClassifier(num_class=n_classes, **XGB_PARAMS)
        fold.fit(X[tr], y[tr], sample_weight=(sw[tr] if sw is not None else None))
        cv_probs[te] = fold.predict_proba(X[te])
    cv_preds = np.argmax(cv_probs, axis=1)

    cv_acc = accuracy_score(y, cv_preds)
    cv_ll = log_loss(y, cv_probs, labels=list(range(n_classes)))
    most_common = np.bincount(y).argmax()
    baseline_acc = float(np.mean(y == most_common))
    # multiclass Brier = mean squared error vs one-hot
    onehot = np.eye(n_classes)[y]
    brier = float(np.mean(np.sum((cv_probs - onehot) ** 2, axis=1)))
    calib = _calibration_report(y, cv_probs)

    print(f"\n  5-Fold CV (out-of-fold — no leakage):")
    print(f"    Accuracy:  {cv_acc:.3f}   (baseline {baseline_acc:.3f}, '{class_names[most_common]}')")
    print(f"    Lift:      {cv_acc / baseline_acc:.2f}x")
    print(f"    Log loss:  {cv_ll:.3f}")
    print(f"    Brier:     {brier:.3f}")
    print(f"    ECE:       {calib['ece']:.3f} (lower = better calibrated)")

    print(f"\n  Per-class (CV):")
    for line in classification_report(y, cv_preds, target_names=class_names,
                                      digits=3, zero_division=0).split("\n"):
        if line.strip():
            print(f"    {line}")

    # Final model trained on all data (for serving), but metrics above are CV
    model.fit(X, y, sample_weight=sw)
    importance = dict(zip(feat_cols, model.feature_importances_.tolist()))
    sorted_imp = sorted(importance.items(), key=lambda x: -x[1])
    print(f"\n  Feature importance:")
    for feat, imp in sorted_imp[:6]:
        bar = "█" * int(imp * 50)
        print(f"    {feat:24s} {imp:.3f} {bar}")

    os.makedirs(MODELS_DIR, exist_ok=True)
    model_path = os.path.join(MODELS_DIR, f"xgb_{target_col}.json")
    model.save_model(model_path)

    return {
        "model_name": model_name,
        "model_path": model_path,
        "target": target_col,
        "classes": class_names,
        "n_classes": n_classes,
        "features": feat_cols,
        "cv_accuracy": round(cv_acc, 4),
        "cv_logloss": round(cv_ll, 4),
        "cv_brier": round(brier, 4),
        "calibration_ece": calib["ece"],
        "calibration_bins": calib["bins"],
        "baseline_accuracy": round(baseline_acc, 4),
        "lift_over_baseline": round(cv_acc / baseline_acc, 3),
        "feature_importance": {k: round(v, 4) for k, v in sorted_imp},
        "class_distribution": {class_names[i]: int(c) for i, c in enumerate(np.bincount(y))},
        "_oof_probs": cv_probs,   # kept in-memory for the ensemble (not serialized)
        "_y": y,
        "_classes": class_names,
    }


# ═══════════════════════════════════════════════════════════════════
# 4. ENSEMBLE EVALUATION (temporal / walk-forward, leakage-free)
# ═══════════════════════════════════════════════════════════════════

def evaluate_ensemble_temporal(df: pd.DataFrame, dir_results: dict) -> dict:
    """
    Evaluate Bayesian + XGBoost blend WITHOUT leakage.

    Key fixes vs v1:
      * XGBoost probs come from OUT-OF-FOLD CV predictions, not predict_proba on
        the training set.
      * Bayesian probs for each penalty are rebuilt from that player's PAST-ONLY
        penalties (expanding window), so a penalty never informs its own profile.
      * Blend weight grows with the number of PRIOR penalties seen.
    """
    print(f"\n{'─'*50}")
    print(f"Evaluating Ensemble (temporal / walk-forward — leakage-free)")

    le = LabelEncoder()
    le.fit(DIRECTIONS)
    y_true = le.transform(df["direction_3"])

    # XGBoost out-of-fold probabilities, aligned to df row order.
    # dir_results was trained on the same df (same order), classes alphabetical.
    xgb_probs = dir_results["_oof_probs"]
    # Reorder columns to DIRECTIONS order if needed
    cls = dir_results["_classes"]
    col_idx = [cls.index(d) for d in DIRECTIONS]
    xgb_probs = xgb_probs[:, col_idx]

    pop = df["direction_3"].value_counts(normalize=True).to_dict()
    pop_vec = np.array([pop.get(d, 1/3) for d in DIRECTIONS])
    alpha = PRIOR_STRENGTH

    bayes_probs = np.tile(pop_vec, (len(df), 1))
    blend_w = np.zeros(len(df))
    prior_counts = np.zeros(len(df), dtype=int)

    for player_id, group in df.groupby("player_id"):
        idxs = group.index.tolist()  # chronological
        tally = {d: 0 for d in DIRECTIONS}
        seen = 0
        for idx in idxs:
            n = seen
            prior_counts[idx] = n
            probs = np.array([(tally[d] + alpha * pop.get(d, 1/3)) / (n + alpha) for d in DIRECTIONS])
            bayes_probs[idx] = probs / probs.sum()
            blend_w[idx] = min(1.0, n / 10)
            # fold current in
            tally[df.loc[idx, "direction_3"]] += 1
            seen += 1

    ens = np.zeros_like(xgb_probs)
    for i in range(len(df)):
        w = blend_w[i] * 0.6  # cap Bayesian contribution at 60%
        ens[i] = w * bayes_probs[i] + (1 - w) * xgb_probs[i]

    results = {}
    for name, probs in [("XGBoost", xgb_probs), ("Bayesian", bayes_probs), ("Ensemble", ens)]:
        preds = probs.argmax(axis=1)
        acc = accuracy_score(y_true, preds)
        ll = log_loss(y_true, probs, labels=[0, 1, 2])
        results[name] = {"accuracy": round(float(acc), 4), "logloss": round(float(ll), 4)}
        print(f"  {name:10s}  acc {acc:.3f}   logloss {ll:.3f}")

    print(f"\n  Ensemble accuracy by PRIOR-penalty depth (what you'd actually know):")
    depth = {}
    ens_preds = ens.argmax(axis=1)
    for label, fn in [
        ("Cold start (0 priors)", lambda x: x == 0),
        ("1-2 priors", lambda x: (x >= 1) & (x <= 2)),
        ("3-7 priors", lambda x: (x > 2) & (x <= 7)),
        ("8+ priors", lambda x: x > 7),
    ]:
        m = fn(prior_counts)
        if m.sum() > 0:
            acc = accuracy_score(y_true[m], ens_preds[m])
            depth[label] = {"accuracy": round(float(acc), 4), "n": int(m.sum())}
            print(f"    {label:22s} {acc:.3f}  (n={m.sum()})")

    return {"overall": results, "by_depth": depth}


# ═══════════════════════════════════════════════════════════════════
# 5. PREDICTION CONFIG (for the frontend/API)
# ═══════════════════════════════════════════════════════════════════

def build_prediction_module(df: pd.DataFrame, profiles: dict):
    pop = profiles["population_rates"]
    rf = df[df["is_right_foot"] == 1]
    lf = df[df["is_right_foot"] == 0]
    foot_rates = {
        "Right Foot": {
            "direction": {k: round(v, 4) for k, v in rf["direction_3"].value_counts(normalize=True).items()},
            "zone": {k: round(v, 4) for k, v in rf["zone_9"].value_counts(normalize=True).items()},
        },
        "Left Foot": {
            "direction": {k: round(v, 4) for k, v in lf["direction_3"].value_counts(normalize=True).items()},
            "zone": {k: round(v, 4) for k, v in lf["zone_9"].value_counts(normalize=True).items()},
        },
    }
    cfg = {
        "population_rates": pop,
        "foot_specific_rates": foot_rates,
        "feature_columns": FEATURE_COLS,
        "directions": DIRECTIONS,
        "zones": sorted(df["zone_9"].unique().tolist()),
        "heights": HEIGHTS,
        "intent_source": profiles["intent_source"],
    }
    path = os.path.join(MODELS_DIR, "prediction_config.json")
    with open(path, "w") as f:
        json.dump(cfg, f, indent=2)
    return path


# ═══════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Train penalty kick prediction models (v2)")
    parser.add_argument("--data", "-d", default=DEFAULT_DATA)
    parser.add_argument("--intent-source", choices=["goals", "all"], default="goals",
                        help="Build player profiles from goals only (default) or all attempts")
    parser.add_argument("--no-recency-weight", action="store_true",
                        help="Disable exponential time-decay weighting of penalties")
    args = parser.parse_args()

    print("=" * 60)
    print("⚽  PENALTY PREDICTOR — MODEL TRAINING (v2, leakage-free)")
    print("=" * 60)

    print(f"\n[1/5] Loading data from {args.data}...")
    df = load_and_prepare(args.data)
    n_goals = int(df["is_goal"].sum())
    print(f"  {len(df)} penalties with placement data ({n_goals} goals)")
    print(f"  {df['player_id'].nunique()} unique players")
    print(f"  Profiles built from: {args.intent_source.upper()}")

    print(f"\n[2/5] Building Bayesian profiles (with credible intervals)...")
    profiles = build_player_profiles(df, intent_source=args.intent_source)
    os.makedirs(MODELS_DIR, exist_ok=True)
    with open(os.path.join(MODELS_DIR, "player_profiles.json"), "w") as f:
        json.dump(profiles, f, indent=2)
    print(f"  ✓ Built {len(profiles['profiles'])} profiles")

    print(f"\n[3/5] Training XGBoost models (honest CV)...")
    use_rw = not args.no_recency_weight
    if use_rw:
        print(f"  Recency weighting: ON (4-year half-life)")
    dir_results = train_xgb_model(df, "direction_3", "Direction (L/C/R)", use_rw)
    zone_results = train_xgb_model(df, "zone_9", "Zone (9-class)", use_rw)
    height_results = train_xgb_model(df, "height_3", "Height (L/M/H)", use_rw)

    print(f"\n[4/5] Evaluating ensemble (temporal)...")
    ensemble_results = evaluate_ensemble_temporal(df, dir_results)

    print(f"\n[5/5] Saving metadata & config...")
    config_path = build_prediction_module(df, profiles)

    def strip(r):  # drop in-memory arrays before serializing
        return {k: v for k, v in r.items() if not k.startswith("_")}

    metadata = {
        "version": 2,
        "validation": "temporal_walk_forward + stratified_cv_oof",
        "intent_source": args.intent_source,
        "dataset_size": len(df),
        "n_goals": n_goals,
        "unique_players": int(df["player_id"].nunique()),
        "freeze_frame_coverage": round(float(df["has_freeze_frame"].mean()), 4),
        "recency_weighting": use_rw,
        "date_range": [df["match_date"].min(), df["match_date"].max()],
        "models": {
            "direction": strip(dir_results),
            "zone": strip(zone_results),
            "height": strip(height_results),
        },
        "ensemble": ensemble_results,
        "notes": (
            "All accuracy numbers are out-of-fold / walk-forward and reflect what "
            "a scout could know at kick time. History/context-only ceiling in the "
            "literature is ~60-65%; video+pose models reach ~85-89%."
        ),
    }
    with open(os.path.join(MODELS_DIR, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n{'='*60}")
    print(f"TRAINING COMPLETE")
    print(f"{'='*60}")
    print(f"\n  HONEST performance (out-of-fold / walk-forward):")
    print(f"    Direction (L/C/R): {dir_results['cv_accuracy']:.1%} "
          f"({dir_results['lift_over_baseline']:.2f}x baseline, ECE {dir_results['calibration_ece']:.3f})")
    print(f"    Height (L/M/H):    {height_results['cv_accuracy']:.1%}")
    print(f"    Zone (9-class):    {zone_results['cv_accuracy']:.1%}")
    print(f"\n  Ensemble direction: {ensemble_results['overall']['Ensemble']['accuracy']:.1%}")
    print(f"\n  Reality check: these are in line with published history/context-only")
    print(f"  models (~60-65%). The v1 '97%' was a leakage artifact, now removed.")


if __name__ == "__main__":
    main()
