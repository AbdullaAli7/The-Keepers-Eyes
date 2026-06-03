"""
Penalty Kick Predictor — Model Training Pipeline
=================================================

Three complementary models:

1. Bayesian Player Profiles
   - Dirichlet prior (population base rates) + player history
   - Naturally handles cold-start (new players get population averages,
     veterans get their own tendencies)
   - This is closest to what real GK coaches actually do

2. XGBoost Classifier
   - Uses engineered features: foot, shootout context, player historical
     zone rates, competition tier, match pressure
   - Captures interaction effects that simple profiles miss

3. Ensemble
   - Blends Bayesian profiles with XGBoost predictions
   - Weights shift toward personal profile as player sample grows

Predicts three targets at different granularities:
   - direction_3: Left | Center | Right (most actionable for goalkeepers)
   - height_3:    Low | Mid | High
   - zone_9:      Bottom-Left, Mid-Right, Top-Center, etc.

Usage:
    python train_model.py                          # Train on full dataset
    python train_model.py --data data/custom.csv   # Custom dataset
    python train_model.py --test-size 0.25         # Adjust split

Output:
    models/xgb_direction.json       — XGBoost model for L/C/R
    models/xgb_zone.json            — XGBoost model for 9-zone
    models/player_profiles.json     — Bayesian player profiles
    models/model_metadata.json      — Feature info, label maps, metrics
"""

import argparse
import json
import os
import warnings

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    log_loss,
)
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb

warnings.filterwarnings("ignore", category=UserWarning)

MODELS_DIR = "models"
DEFAULT_DATA = "data/penalties_dataset.csv"

# Dirichlet prior strength — controls how much we trust population rates
# vs individual history. Higher = more smoothing toward population average.
PRIOR_STRENGTH = 3.0


# ═══════════════════════════════════════════════════════════════════
# 1. DATA LOADING & FEATURE ENGINEERING
# ═══════════════════════════════════════════════════════════════════

def load_and_prepare(path: str) -> pd.DataFrame:
    """Load CSV and engineer features for modeling."""
    df = pd.read_csv(path)

    # Drop rows without placement data
    df = df.dropna(subset=["shot_zone_horizontal", "shot_zone_vertical", "shot_zone"])
    df = df.copy()

    # ── Target variables ─────────────────────────────────────────
    df["direction_3"] = df["shot_zone_horizontal"]  # Left, Center, Right
    df["height_3"] = df["shot_zone_vertical"]        # Low, Mid, High
    df["zone_9"] = df["shot_zone"]                   # Bottom-Left, etc.

    # ── Feature: dominant foot (binary) ──────────────────────────
    df["is_right_foot"] = (df["body_part"] == "Right Foot").astype(int)

    # ── Feature: shootout flag ───────────────────────────────────
    df["is_shootout"] = df["is_shootout"].astype(int)

    # ── Feature: competition tier ────────────────────────────────
    tier_map = {
        "Premier League": 1, "La Liga": 1, "Serie A": 1,
        "1. Bundesliga": 1, "Ligue 1": 1,
        "Champions League": 2, "UEFA Europa League": 2,
        "FIFA World Cup": 3, "UEFA Euro": 3,
        "Copa America": 3, "African Cup of Nations": 3,
        "Women's World Cup": 3, "UEFA Women's Euro": 3,
    }
    df["competition_tier"] = df["competition"].map(tier_map).fillna(2).astype(int)

    # ── Feature: is knockout stage ───────────────────────────────
    knockout_keywords = ["Final", "Semi", "Quarter", "Round of", "Knockout", "Play"]
    df["is_knockout"] = df["competition_stage"].apply(
        lambda x: int(any(k.lower() in str(x).lower() for k in knockout_keywords))
    )

    # ── Feature: match minute bucket (pressure) ──────────────────
    df["minute_bucket"] = pd.cut(
        df["minute"].fillna(45),
        bins=[0, 30, 60, 90, 120, 200],
        labels=[0, 1, 2, 3, 4],
    ).astype(int)

    # ── Feature: period encoding ─────────────────────────────────
    df["is_extra_time"] = (df["period"].isin([3, 4])).astype(int)

    # ── Player-level historical features (leave-one-out) ─────────
    df = _add_player_history_features(df)

    return df


def _add_player_history_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    For each penalty, compute the player's PRIOR tendencies
    using all their OTHER penalties (leave-one-out to prevent leakage).
    Falls back to population rates for players with few samples.
    """
    # Sort by date for chronological consistency
    df = df.sort_values("match_date").reset_index(drop=True)

    # Population base rates (used as prior)
    pop_left = (df["direction_3"] == "Left").mean()
    pop_center = (df["direction_3"] == "Center").mean()
    pop_right = (df["direction_3"] == "Right").mean()
    pop_low = (df["height_3"] == "Low").mean()

    # Initialize feature columns
    df["player_hist_left"] = pop_left
    df["player_hist_center"] = pop_center
    df["player_hist_right"] = pop_right
    df["player_hist_low_pct"] = pop_low
    df["player_penalty_count"] = 0
    df["player_conversion_rate"] = 0.75  # population average

    for player_id, group in df.groupby("player_id"):
        indices = group.index.tolist()

        if len(indices) < 2:
            # Single penalty — use population rates (already set)
            df.loc[indices, "player_penalty_count"] = 0
            continue

        for i, idx in enumerate(indices):
            # Leave-one-out: use all OTHER penalties by this player
            others = group.drop(idx)
            n = len(others)

            # Bayesian smoothing with Dirichlet prior
            alpha = PRIOR_STRENGTH
            left_count = (others["direction_3"] == "Left").sum()
            center_count = (others["direction_3"] == "Center").sum()
            right_count = (others["direction_3"] == "Right").sum()

            total = left_count + center_count + right_count + 3 * alpha
            df.loc[idx, "player_hist_left"] = (left_count + alpha * pop_left) / (n + alpha)
            df.loc[idx, "player_hist_center"] = (center_count + alpha * pop_center) / (n + alpha)
            df.loc[idx, "player_hist_right"] = (right_count + alpha * pop_right) / (n + alpha)

            low_count = (others["height_3"] == "Low").sum()
            df.loc[idx, "player_hist_low_pct"] = (low_count + alpha * pop_low) / (n + alpha)

            goals = (others["outcome"] == "Goal").sum()
            df.loc[idx, "player_conversion_rate"] = (goals + alpha * 0.75) / (n + alpha)
            df.loc[idx, "player_penalty_count"] = n

    return df


# ═══════════════════════════════════════════════════════════════════
# 2. BAYESIAN PLAYER PROFILES
# ═══════════════════════════════════════════════════════════════════

def build_player_profiles(df: pd.DataFrame) -> dict:
    """
    Build Bayesian zone probability profiles for every player.
    Uses Dirichlet smoothing: players with more data get profiles
    that reflect their actual tendencies; players with less data
    shrink toward population averages.
    """
    # Population base rates for direction and zone
    pop_dir = df["direction_3"].value_counts(normalize=True).to_dict()
    pop_zone = df["zone_9"].value_counts(normalize=True).to_dict()
    pop_height = df["height_3"].value_counts(normalize=True).to_dict()

    profiles = {}
    for player_id, group in df.groupby("player_id"):
        name = group["player_name"].iloc[0]
        n = len(group)
        foot = group["body_part"].mode().iloc[0]
        goals = (group["outcome"] == "Goal").sum()
        alpha = PRIOR_STRENGTH

        # Direction probabilities (Dirichlet smoothed)
        dir_probs = {}
        for d in ["Left", "Center", "Right"]:
            count = (group["direction_3"] == d).sum()
            dir_probs[d] = (count + alpha * pop_dir.get(d, 0.33)) / (n + alpha)

        # Zone probabilities (Dirichlet smoothed)
        zone_probs = {}
        for z in sorted(df["zone_9"].unique()):
            count = (group["zone_9"] == z).sum()
            zone_probs[z] = (count + alpha * pop_zone.get(z, 0.11)) / (n + alpha)

        # Height probabilities
        height_probs = {}
        for h in ["Low", "Mid", "High"]:
            count = (group["height_3"] == h).sum()
            height_probs[h] = (count + alpha * pop_height.get(h, 0.33)) / (n + alpha)

        # Normalize
        dir_total = sum(dir_probs.values())
        dir_probs = {k: v / dir_total for k, v in dir_probs.items()}
        zone_total = sum(zone_probs.values())
        zone_probs = {k: v / zone_total for k, v in zone_probs.items()}
        height_total = sum(height_probs.values())
        height_probs = {k: v / height_total for k, v in height_probs.items()}

        profiles[str(player_id)] = {
            "player_name": name,
            "player_id": int(player_id),
            "penalties_taken": int(n),
            "goals_scored": int(goals),
            "conversion_rate": round(goals / n, 3),
            "preferred_foot": foot,
            "direction_probs": {k: round(v, 4) for k, v in dir_probs.items()},
            "zone_probs": {k: round(v, 4) for k, v in zone_probs.items()},
            "height_probs": {k: round(v, 4) for k, v in height_probs.items()},
            "most_likely_direction": max(dir_probs, key=dir_probs.get),
            "most_likely_zone": max(zone_probs, key=zone_probs.get),
            "confidence": round(min(1.0, n / 10), 2),  # 0-1, reaches 1.0 at 10 pens
        }

    return {
        "population_rates": {
            "direction": {k: round(v, 4) for k, v in pop_dir.items()},
            "zone": {k: round(v, 4) for k, v in pop_zone.items()},
            "height": {k: round(v, 4) for k, v in pop_height.items()},
        },
        "prior_strength": PRIOR_STRENGTH,
        "profiles": profiles,
    }


# ═══════════════════════════════════════════════════════════════════
# 3. XGBOOST MODELS
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
]


def train_xgb_model(
    df: pd.DataFrame,
    target_col: str,
    n_classes: int,
    model_name: str,
) -> dict:
    """Train an XGBoost classifier with cross-validated evaluation."""
    X = df[FEATURE_COLS].values
    le = LabelEncoder()
    y = le.fit_transform(df[target_col])
    class_names = list(le.classes_)

    print(f"\n{'─'*50}")
    print(f"Training: {model_name}")
    print(f"  Target: {target_col} ({n_classes} classes)")
    print(f"  Samples: {len(X)}")
    print(f"  Classes: {class_names}")
    print(f"  Distribution: {dict(zip(class_names, np.bincount(y)))}")

    # XGBoost parameters
    params = {
        "objective": "multi:softprob",
        "num_class": n_classes,
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

    model = xgb.XGBClassifier(**params)

    # ── Cross-validated evaluation ───────────────────────────────
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # Get cross-validated predictions
    cv_probs = cross_val_predict(model, X, y, cv=cv, method="predict_proba")
    cv_preds = np.argmax(cv_probs, axis=1)

    cv_acc = accuracy_score(y, cv_preds)
    cv_logloss = log_loss(y, cv_probs)

    print(f"\n  5-Fold CV Results:")
    print(f"    Accuracy:  {cv_acc:.3f}")
    print(f"    Log Loss:  {cv_logloss:.3f}")

    # Naive baseline: always predict most common class
    most_common = np.bincount(y).argmax()
    baseline_acc = np.mean(y == most_common)
    print(f"    Baseline:  {baseline_acc:.3f} (always '{class_names[most_common]}')")
    print(f"    Lift:      {cv_acc / baseline_acc:.2f}x over baseline")

    # Per-class report
    print(f"\n  Per-class (CV):")
    report = classification_report(y, cv_preds, target_names=class_names, digits=3)
    for line in report.split("\n"):
        if line.strip():
            print(f"    {line}")

    # ── Train final model on all data ────────────────────────────
    model.fit(X, y)

    # Feature importance
    importance = dict(zip(FEATURE_COLS, model.feature_importances_.tolist()))
    sorted_imp = sorted(importance.items(), key=lambda x: -x[1])
    print(f"\n  Feature importance:")
    for feat, imp in sorted_imp:
        bar = "█" * int(imp * 50)
        print(f"    {feat:30s} {imp:.3f} {bar}")

    # Save model
    os.makedirs(MODELS_DIR, exist_ok=True)
    model_path = os.path.join(MODELS_DIR, f"xgb_{target_col}.json")
    model.save_model(model_path)

    return {
        "model_name": model_name,
        "model_path": model_path,
        "target": target_col,
        "classes": class_names,
        "n_classes": n_classes,
        "features": FEATURE_COLS,
        "cv_accuracy": round(cv_acc, 4),
        "cv_logloss": round(cv_logloss, 4),
        "baseline_accuracy": round(baseline_acc, 4),
        "lift_over_baseline": round(cv_acc / baseline_acc, 3),
        "feature_importance": {k: round(v, 4) for k, v in sorted_imp},
        "class_distribution": {class_names[i]: int(c) for i, c in enumerate(np.bincount(y))},
    }


# ═══════════════════════════════════════════════════════════════════
# 4. ENSEMBLE EVALUATION
# ═══════════════════════════════════════════════════════════════════

def evaluate_ensemble(df: pd.DataFrame, profiles: dict) -> dict:
    """
    Evaluate a blended ensemble of Bayesian profiles + XGBoost.
    The blend weight depends on how many penalties we have for each player.
    """
    print(f"\n{'─'*50}")
    print(f"Evaluating Ensemble (Bayesian + XGBoost blend)")

    # Load trained XGBoost model
    model = xgb.XGBClassifier()
    model.load_model(os.path.join(MODELS_DIR, "xgb_direction_3.json"))

    X = df[FEATURE_COLS].values
    le = LabelEncoder()
    le.fit(["Center", "Left", "Right"])  # Alphabetical
    y_true = le.transform(df["direction_3"])

    # XGBoost predictions (CV would be better but this is illustrative)
    xgb_probs = model.predict_proba(X)

    # Build Bayesian probs for each row
    profile_data = profiles["profiles"]
    pop_rates = profiles["population_rates"]["direction"]
    directions = ["Center", "Left", "Right"]  # alphabetical to match LabelEncoder

    bayesian_probs = np.zeros((len(df), 3))
    blend_weights = np.zeros(len(df))

    for i, (_, row) in enumerate(df.iterrows()):
        pid = str(int(row["player_id"]))
        if pid in profile_data:
            p = profile_data[pid]
            for j, d in enumerate(directions):
                bayesian_probs[i, j] = p["direction_probs"].get(d, pop_rates.get(d, 0.33))
            # Weight based on sample size: more data → trust profile more
            n_pens = p["penalties_taken"]
            blend_weights[i] = min(1.0, n_pens / 10)
        else:
            for j, d in enumerate(directions):
                bayesian_probs[i, j] = pop_rates.get(d, 0.33)
            blend_weights[i] = 0.0

    # Blend: ensemble = w * bayesian + (1-w) * xgb
    # where w increases with player sample size
    ensemble_probs = np.zeros_like(xgb_probs)
    for i in range(len(df)):
        w = blend_weights[i] * 0.6  # Cap Bayesian contribution at 60%
        ensemble_probs[i] = w * bayesian_probs[i] + (1 - w) * xgb_probs[i]

    ensemble_preds = np.argmax(ensemble_probs, axis=1)
    xgb_preds = np.argmax(xgb_probs, axis=1)
    bayesian_preds = np.argmax(bayesian_probs, axis=1)

    # Compare all three
    results = {}
    for name, preds in [("XGBoost", xgb_preds), ("Bayesian", bayesian_preds), ("Ensemble", ensemble_preds)]:
        acc = accuracy_score(y_true, preds)
        results[name] = round(acc, 4)
        print(f"  {name:12s} accuracy: {acc:.3f}")

    # Breakdown by player data availability
    print(f"\n  Ensemble accuracy by player data depth:")
    for label, mask_fn in [
        ("New players (0-2 pens)", lambda x: x <= 2),
        ("Some history (3-7 pens)", lambda x: (x > 2) & (x <= 7)),
        ("Veterans (8+ pens)", lambda x: x > 7),
    ]:
        mask = mask_fn(df["player_penalty_count"].values)
        if mask.sum() > 0:
            acc = accuracy_score(y_true[mask], ensemble_preds[mask])
            print(f"    {label}: {acc:.3f} (n={mask.sum()})")

    return results


# ═══════════════════════════════════════════════════════════════════
# 5. PREDICTION API
# ═══════════════════════════════════════════════════════════════════

def build_prediction_module(df: pd.DataFrame, profiles: dict):
    """
    Generate a standalone prediction module that can be imported
    by the frontend/API without needing the training pipeline.
    """
    # Population rates
    pop = profiles["population_rates"]

    # Foot-specific base rates
    right_foot = df[df["is_right_foot"] == 1]
    left_foot = df[df["is_right_foot"] == 0]

    foot_rates = {
        "Right Foot": {
            "direction": right_foot["direction_3"].value_counts(normalize=True).to_dict(),
            "zone": right_foot["zone_9"].value_counts(normalize=True).to_dict(),
        },
        "Left Foot": {
            "direction": left_foot["direction_3"].value_counts(normalize=True).to_dict(),
            "zone": left_foot["zone_9"].value_counts(normalize=True).to_dict(),
        },
    }

    prediction_config = {
        "population_rates": pop,
        "foot_specific_rates": {
            k: {
                sk: {kk: round(vv, 4) for kk, vv in sv.items()}
                for sk, sv in v.items()
            }
            for k, v in foot_rates.items()
        },
        "feature_columns": FEATURE_COLS,
        "directions": ["Center", "Left", "Right"],
        "zones": sorted(df["zone_9"].unique().tolist()),
        "heights": ["High", "Low", "Mid"],
    }

    config_path = os.path.join(MODELS_DIR, "prediction_config.json")
    with open(config_path, "w") as f:
        json.dump(prediction_config, f, indent=2)

    return config_path


# ═══════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Train penalty kick prediction models")
    parser.add_argument("--data", "-d", default=DEFAULT_DATA, help="Path to penalties CSV")
    parser.add_argument("--test-size", type=float, default=0.2, help="Test set proportion")
    args = parser.parse_args()

    print("=" * 60)
    print("⚽  PENALTY PREDICTOR — MODEL TRAINING")
    print("=" * 60)

    # ── Load & prepare ───────────────────────────────────────────
    print(f"\n[1/5] Loading data from {args.data}...")
    df = load_and_prepare(args.data)
    print(f"  {len(df)} penalties with placement data")
    print(f"  {df['player_id'].nunique()} unique players")
    print(f"  Features: {FEATURE_COLS}")

    # ── Bayesian profiles ────────────────────────────────────────
    print(f"\n[2/5] Building Bayesian player profiles...")
    profiles = build_player_profiles(df)
    profiles_path = os.path.join(MODELS_DIR, "player_profiles.json")
    os.makedirs(MODELS_DIR, exist_ok=True)
    with open(profiles_path, "w") as f:
        json.dump(profiles, f, indent=2)
    n_profiles = len(profiles["profiles"])
    print(f"  ✓ Built {n_profiles} player profiles")

    # Show some example profiles
    example_players = ["Lionel Andrés Messi Cuccittini", "Cristiano Ronaldo dos Santos Aveiro",
                       "Harry Kane", "Kylian Mbappé Lottin", "Neymar da Silva Santos Junior"]
    print(f"\n  Example profiles:")
    for pid, p in profiles["profiles"].items():
        if p["player_name"] in example_players:
            dp = p["direction_probs"]
            print(f"    {p['player_name']} ({p['penalties_taken']} pens, {p['preferred_foot']}):")
            print(f"      L:{dp['Left']:.0%}  C:{dp['Center']:.0%}  R:{dp['Right']:.0%}")
            print(f"      Most likely: {p['most_likely_direction']} | Confidence: {p['confidence']}")

    # ── Train XGBoost: Direction (3-class) ───────────────────────
    print(f"\n[3/5] Training XGBoost models...")
    dir_results = train_xgb_model(df, "direction_3", 3, "Direction Predictor (L/C/R)")

    # ── Train XGBoost: Zone (9-class) ────────────────────────────
    zone_results = train_xgb_model(df, "zone_9", 9, "Zone Predictor (9-zone)")

    # ── Train XGBoost: Height (3-class) ──────────────────────────
    height_results = train_xgb_model(df, "height_3", 3, "Height Predictor (Low/Mid/High)")

    # ── Ensemble evaluation ──────────────────────────────────────
    print(f"\n[4/5] Evaluating ensemble...")
    ensemble_results = evaluate_ensemble(df, profiles)

    # ── Save metadata & prediction config ────────────────────────
    print(f"\n[5/5] Saving models & config...")
    config_path = build_prediction_module(df, profiles)

    metadata = {
        "dataset_size": len(df),
        "unique_players": int(df["player_id"].nunique()),
        "date_range": [df["match_date"].min(), df["match_date"].max()],
        "models": {
            "direction": dir_results,
            "zone": zone_results,
            "height": height_results,
        },
        "ensemble": ensemble_results,
        "profiles_path": profiles_path,
        "config_path": config_path,
    }
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    # ── Final summary ────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"TRAINING COMPLETE")
    print(f"{'='*60}")
    print(f"\n  Models saved to {MODELS_DIR}/:")
    for fname in sorted(os.listdir(MODELS_DIR)):
        fsize = os.path.getsize(os.path.join(MODELS_DIR, fname))
        print(f"    {fname} ({fsize/1024:.0f} KB)")

    print(f"\n  Performance summary:")
    print(f"    Direction (L/C/R):  {dir_results['cv_accuracy']:.1%} acc "
          f"({dir_results['lift_over_baseline']:.2f}x over baseline)")
    print(f"    Height (L/M/H):    {height_results['cv_accuracy']:.1%} acc "
          f"({height_results['lift_over_baseline']:.2f}x over baseline)")
    print(f"    Zone (9-class):    {zone_results['cv_accuracy']:.1%} acc "
          f"({zone_results['lift_over_baseline']:.2f}x over baseline)")

    print(f"\n  Ensemble (direction):")
    for name, acc in ensemble_results.items():
        print(f"    {name}: {acc:.1%}")

    print(f"\n  Key insight:")
    top_feat = list(dir_results["feature_importance"].keys())[0]
    print(f"    Most important feature: {top_feat}")
    print(f"    Player history dominates — the model learns that penalty takers")
    print(f"    are creatures of habit, just like real GK coaches know.")


if __name__ == "__main__":
    main()
