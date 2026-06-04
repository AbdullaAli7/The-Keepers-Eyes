# 🧤 The Keeper's Eyes

An AI-powered penalty kick scouting tool that analyzes shot placement patterns to help goalkeepers predict where penalty takers will shoot.

## Overview

When soccer matches go to penalties, goalkeepers rely on scouting reports to anticipate each player's tendencies. **The Keeper's Eyes** automates this process by analyzing 1,481 penalties across 50+ competitions with precise 3D shot placement coordinates, then building statistical profiles that predict where each player is most likely to aim.

## Key Features

- **Player Scouting Reports** — Direction probabilities, zone heatmaps, and a clear "DIVE LEFT/RIGHT" recommendation with confidence level
- **3D Shot Placement Maps** — Every penalty plotted at its exact goal coordinates, color-coded by outcome
- **Dual Model Architecture** — Bayesian player profiles (for individual tendencies) combined with XGBoost classifiers (for interaction effects)
- **Honestly validated** — every accuracy number is out-of-fold / walk-forward (the model only ever uses penalties from *before* the one it's predicting), so the metrics reflect what a scout could actually know at kick time
- **49 player profiles** including Messi, Ronaldo, Kane, Mbappé, Neymar, and more

## How It Works

1. **Data Collection** (`scraper.py`) — Extracts penalty kick events from StatsBomb's open data repository, including 3D shot end-location coordinates (where in the goal the ball ended up)

2. **Model Training** (`train_model.py`) — Trains three models:
   - **Bayesian Player Profiles**: Dirichlet-smoothed probability distributions per player, with credible intervals. Players with more data get profiles reflecting their true tendencies; players with less data shrink toward population averages.
   - **XGBoost Direction Classifier**: Predicts Left/Center/Right using foot preference, leakage-free player history, shootout context, competition tier, **freeze-frame scene features** (goalkeeper pre-lean and depth, encroachment), and — when available — **run-up / body-pose features**.
   - **Ensemble**: Blends both models, weighting toward personal history as sample size grows.
   - **Recency weighting**: recent penalties count more (4-year half-life), because takers' tendencies drift over time.

3. **Pose Enrichment** (`pose_features.py`) — Optional scaffold that turns body-keypoint annotations (from MediaPipe / MoveNet / YOLOv8-pose) into the directional features that actually push accuracy past the history-only ceiling. NaN-aware, so it enriches the rows you annotate and stays silent elsewhere.

4. **Game Theory** (`game_theory.py`) — Computes the goalkeeper's *optimal mixed dive strategy* against each taker by solving the penalty as a zero-sum game (reach-aware payoffs, LP solver with a fictitious-play fallback). Turns the predictor into a decision-support system: instead of "dive right," it says "dive right 61% / left 36% / stay 3%, commit early" and flags how exploitable the taker is.

5. **Sequence Modeling** (`sequence_model.py`) — Estimates per-player first-order transition tendencies P(next direction | last direction) to catch alternators and streaky takers that base-rate models miss, plus a single "sequential dependence" score.

6. **Frontend** (`TheKeepersEyes.jsx` + `web/`) — A React scouting interface, now shipped as a deployable Vite project. Loads the full player set from `data.json` at runtime (falling back to an embedded subset). Features goal-face heatmaps, direction breakdowns, an **optimal-strategy panel** (mixed dive % + commit timing), **alternation tags**, a **Scout Card** print/PDF export, a **two-player Compare view**, and goalkeeper recommendations. See `web/README.md` for run + deploy instructions (GitHub Pages / Vercel configs included).

## Dataset

| Metric | Value |
|---|---|
| Total penalties | 1,481 |
| Unique takers | 776 |
| With 3D placement data | 99.9% |
| Competitions covered | 50+ |
| Date range | 1974–2025 |

Data sourced from [StatsBomb Open Data](https://github.com/statsbomb/open-data) (free for research & analytics).

## Model Performance

All metrics below are **out-of-fold / walk-forward**: when predicting a penalty, the model only sees that player's *prior* penalties (an expanding window in time) plus population priors. This is how a real scout works, and it's the only honest way to measure a tool like this.

| Metric | Value (direction L/C/R) |
|---|---|
| Validation | Stratified 5-fold OOF + temporal walk-forward |
| Accuracy | ~50–62% depending on dataset coverage |
| Majority baseline | ~44–47% |
| Calibration (ECE) | reported per run in `model_metadata.json` |

**Accuracy by prior-penalty depth** (the genuine "creatures of habit" effect):

| Player history available | Direction accuracy |
|---|---|
| Cold start (0 priors) | ≈ baseline |
| 3–7 prior penalties | small gain |
| 8+ prior penalties | larger gain |

The lift over baseline is real but modest — exactly in line with the published literature. **Context/history-only models top out around 60–65%; only video + body-pose models reach ~85–89%**, because they can read the kicker's run-up. (See `KeepersEyes_Roadmap.md` for the plan to add that signal.)

> ⚠️ **Note on a previous claim:** earlier versions reported "97% accuracy on 8+ penalty players." That figure was a **data-leakage artifact** — the model was evaluated on its training data, and the player-history features were computed from each player's *entire* career (including the penalty being predicted). It has been removed. The numbers above are leakage-free.

## Project Structure

```
├── scraper.py               # StatsBomb penalty data extractor
├── train_model.py            # Model training pipeline
├── TheKeepersEyes.jsx        # React frontend (self-contained)
├── data/
│   └── penalties_dataset.csv # Extracted penalty dataset
├── models/
│   ├── player_profiles.json  # Bayesian player profiles
│   ├── xgb_direction_3.json  # XGBoost direction model
│   ├── xgb_height_3.json     # XGBoost height model
│   ├── xgb_zone_9.json       # XGBoost 9-zone model
│   ├── model_metadata.json   # Training metrics & config
│   └── prediction_config.json
└── requirements.txt
```

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Scrape fresh data (optional — dataset included)
# Now also extracts freeze-frame scene features (GK pre-lean, depth, encroachment)
python scraper.py

# Train models (honest temporal validation, recency weighting on by default)
python train_model.py
python train_model.py --no-recency-weight   # ablation: equal weighting
python train_model.py --intent-source all   # profile on all attempts, not just goals

# (Optional) Enrich with run-up / body-pose features — the real accuracy unlock
python pose_features.py --keypoints poses.json --out data/pose_features.csv
python pose_features.py --merge data/penalties_dataset.csv data/pose_features.csv
python train_model.py   # pose features are auto-detected once merged

# The frontend is a self-contained React component (TheKeepersEyes.jsx)
```

## Tech Stack

- **Python** — Data extraction and model training
- **XGBoost** — Gradient-boosted classifier for direction/zone prediction
- **Bayesian Inference** — Dirichlet-smoothed player profiling
- **React** — Frontend scouting interface
- **StatsBomb Open Data** — Professional-grade event data

## Data Attribution

This project uses data from [StatsBomb](https://statsbomb.com/) via their open data initiative. StatsBomb data is free to use for research, analysis, and personal projects with appropriate credit.

## License

MIT
