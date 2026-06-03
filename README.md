# 🧤 The Keeper's Eyes

An AI-powered penalty kick scouting tool that analyzes shot placement patterns to help goalkeepers predict where penalty takers will shoot.

## Overview

When soccer matches go to penalties, goalkeepers rely on scouting reports to anticipate each player's tendencies. **The Keeper's Eyes** automates this process by analyzing 1,481 penalties across 50+ competitions with precise 3D shot placement coordinates, then building statistical profiles that predict where each player is most likely to aim.

## Key Features

- **Player Scouting Reports** — Direction probabilities, zone heatmaps, and a clear "DIVE LEFT/RIGHT" recommendation with confidence level
- **3D Shot Placement Maps** — Every penalty plotted at its exact goal coordinates, color-coded by outcome
- **Dual Model Architecture** — Bayesian player profiles (for individual tendencies) combined with XGBoost classifiers (for interaction effects)
- **97% accuracy** on players with 8+ penalty history — the more data, the more predictable the player becomes
- **49 player profiles** including Messi, Ronaldo, Kane, Mbappé, Neymar, and more

## How It Works

1. **Data Collection** (`scraper.py`) — Extracts penalty kick events from StatsBomb's open data repository, including 3D shot end-location coordinates (where in the goal the ball ended up)

2. **Model Training** (`train_model.py`) — Trains three models:
   - **Bayesian Player Profiles**: Dirichlet-smoothed probability distributions per player. Players with more data get profiles reflecting their true tendencies; players with less data shrink toward population averages.
   - **XGBoost Direction Classifier**: Predicts Left/Center/Right using features like foot preference, player historical tendencies, shootout context, and competition tier.
   - **Ensemble**: Blends both models, weighting toward personal history as sample size grows.

3. **Frontend** (`TheKeepersEyes.jsx`) — A React-based scouting interface with goal-face heatmaps, shot dot overlays, direction breakdowns, and goalkeeper recommendations.

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

| Player Data Depth | Direction Accuracy |
|---|---|
| New players (0-2 penalties) | 58.9% |
| Some history (3-7 penalties) | 87.6% |
| Veterans (8+ penalties) | 97.4% |

The core insight: penalty takers are creatures of habit. The more data you have, the more predictable they become — which is exactly what real goalkeepers know from studying film.

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
python scraper.py

# Train models
python train_model.py

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
