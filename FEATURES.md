# The Keeper's Eyes — Technical Feature Reference

A penalty-kick scouting and decision-support system built on StatsBomb open data.
This document describes every feature, the data and math behind it, and where it
lives in the codebase. Intended for a technical reader (engineer / analyst).

> **Validation note.** Every accuracy figure in this system is out-of-fold /
> walk-forward — the model only ever sees a player's penalties from *before* the
> one it is predicting. Direction accuracy lands around 55–63% depending on
> dataset coverage, consistent with the published ceiling for history/context
> models (~60–65%). Video+pose models reach ~85–89%; that gap is the motivation
> for the pose-feature pipeline below.

---

## 1. Data pipeline

### 1.1 Scraper — `scraper.py`
Streams match-event JSON from the StatsBomb open-data GitHub repo, filters for
penalty events, and emits `data/penalties_dataset.csv` (one row per penalty).

Key extracted fields: taker id/name, foot, outcome, `end_location` [x, y, z],
competition/season/stage, minute/second/period, shootout flag, and StatsBomb xG.

**Coordinate system.** Goal mouth is `y ∈ [36, 44]` (center 40), height
`z ∈ [0, 2.67]`. A 3×3 zone grid is derived: horizontal Left/Center/Right at
y-thresholds 38.67 / 41.33, vertical Low/Mid/High at z-thresholds 0.89 / 1.78.

**Freeze-frame features** (`extract_freeze_frame_features`). Where StatsBomb 360
freeze frames exist (~12–16% of penalties), we also extract pre-kick scene
signal: goalkeeper lateral offset from center (`gk_y_offset`), keeper depth off
the line (`gk_depth`), defender/teammate counts, and the taker's setup offset.
All nullable; downstream models treat missing values as "unknown."

### 1.2 Frontend data export — `export_frontend_data.py`
Converts `models/player_profiles.json` + the raw CSV into the compact
`web/public/data.json` the UI consumes (players above a `--min-pens` threshold).
Each player entry carries direction/zone/height probabilities, credible
intervals, shot list, form, the game-theory `ks` block, and the sequence
pattern. This decouples the frontend from any hard-coded player list.

---

## 2. Models — `train_model.py`

Three complementary models, all trained leakage-free.

### 2.1 Leakage-free history features
`_add_past_only_history_features` builds each penalty's player-tendency features
(`player_hist_left/center/right`, `player_hist_low_pct`, prior count, conversion)
from an **expanding window of that player's prior penalties only** — never the
penalty being predicted, never future penalties. This is the single most
important correctness property in the project: an earlier version computed these
over the full career, which leaked the label and produced a spurious ~97%
"accuracy." Verified: a player's first penalty has 0 priors and falls back to
population base rates.

### 2.2 Bayesian player profiles
Per player, a Dirichlet-smoothed distribution over direction, zone, and height.
Prior = population base rates, prior strength α = 3.0, so low-volume takers
shrink toward the population and high-volume takers reflect their own tendencies.
Profiles are built from **goals only** by default (`--intent-source goals`),
because a saved/off-target `end_location` reflects the keeper or a miss, not the
taker's intended target. Each profile also reports:
- **Credible intervals** (`direction_ci`) via Monte-Carlo draws from the Dirichlet
  posterior — real uncertainty, not a bare sample-size counter.
- **Predictability** = 1 − normalized Shannon entropy of the direction
  distribution (0 = unpredictable, 1 = one-trick).

### 2.3 XGBoost classifiers
Three targets: `direction_3` (L/C/R, primary), `height_3` (L/M/H), `zone_9`.
Features: foot, shootout/knockout/extra-time context, competition tier, bucketed
minute, the leakage-free history features, the freeze-frame scene features, and
— when present — pose features (§2.5). Metrics are 5-fold out-of-fold with
**recency-weighted** sample weights (exponential decay, 4-year half-life; toggle
with `--no-recency-weight`) so a 2024 penalty counts more than a 2008 one.

Reported per model: OOF accuracy, lift over the majority-class baseline, log
loss, multiclass Brier score, and Expected Calibration Error (ECE). Calibration
matters more than raw accuracy for a tool issuing probabilistic dive advice.

### 2.4 Ensemble
Blends Bayesian and XGBoost direction probabilities with weight
`w = min(1, n_prior/10) · 0.6` — more personal history → more trust in the
profile, capped at 60%. Evaluated walk-forward by prior-penalty depth so the
"creatures of habit" effect shows as a real gradient, not a leak.

### 2.5 Pose / run-up scaffold — `pose_features.py`
The bridge to the video-model accuracy tier. Converts COCO-17 body keypoints
(MediaPipe / MoveNet / YOLOv8-pose output) for a single pre-contact frame into
directional features: hip angle, shoulder line, torso twist, plant-foot offset,
lateral lean, and run-up side, with left-footer mirroring so signs are
consistent. Merges into the dataset by penalty id; `train_model.py` auto-detects
the columns. No video required to wire it up — annotate when ready and the
pipeline ingests it with zero code changes.

---

## 3. Game theory — `game_theory.py` (and JS mirror in the frontend)

The conceptual core: a penalty is a zero-sum game. Against a *sophisticated*
taker who randomizes, always diving the modal side is exploitable, so the
recommendation is an **optimal mixed strategy**, not a single direction.

**Payoff.** `save_prob(dive, shot) = reach(dive, shot) · (1 − finish(shot))`.
`reach` is a 3×3 matrix: a correct corner dive reaches ~0.65, staying central
reaches central shots ~0.90, wrong-way dives ~0.05. `finish` scales with the
taker's conversion and is slightly higher for corners than central shots. High
takers (lots of high shots) lower reach.

**Solution.** Solved as a zero-sum game by linear programming (SciPy) with a
dependency-free fictitious-play fallback. We then blend the unexploitable
equilibrium with the pure best-response to the taker's *actual* observed mix,
leaning toward exploitation in proportion to how far that mix sits from the
taker's own equilibrium (the **exploitability** score).

**Outputs** (`optimal_keeper_strategy`): the keeper's dive distribution, the
modal `recommended_dive`, `commit_timing` (early/balanced/late from mix
concentration), `exploitability`, and `edge_over_naive`. Note `edge_over_naive`
is often ~0 or slightly negative against a predictable taker — that is expected
and documented: naive diving is fine *until the taker adapts*; the mixed
strategy's value is robustness to adaptation.

The frontend re-implements this in JS (`keeperStrategy`) and its output matches
the Python within rounding, so the UI needs no backend at runtime.

---

## 4. Sequence modeling — `sequence_model.py`

Base-rate models assume each penalty is independent. Some takers are not: they
alternate sides, or repeat, after their last attempt. `sequence_profile` builds a
first-order Markov matrix P(next direction | last direction) from a player's
chronological history, Dirichlet-smoothed toward their own base rate (α = 1.0).

It reports a **dependence** score (weighted KL divergence of the conditional rows
from the base rate, normalized to ~0–1) and a **pattern** label: `alternator`
(avoids repeating), `repeater` (returns to the same side), `mixed`, or
`memoryless`. Empirically most takers are memoryless — which is itself a useful
scouting finding, not a null result. These fields are stored per profile and
feed both the UI and Duel mode.

---

## 5. Frontend — `TheKeepersEyes.jsx` (+ `web/` Vite app)

Single React component, self-contained styling (Barlow Condensed + DM Sans, dark
theme, `#00e676` accent). Ships as a deployable Vite project that fetches
`data.json` at runtime via a small pub/sub live-data layer (`useLiveData`,
`loadLiveData`), falling back to an embedded subset so it also works standalone.
Four pages.

### 5.1 Home
Population heatmap, headline stats, and leaderboards (most predictable, best
converters) sourced from the exported `lb` block.

### 5.2 Scout
The primary scouting view for one taker:
- **Shot-placement heatmap** (`GoalViz`) with individual shot dots (goals vs
  misses, shootouts ringed).
- **GK Recommendation** banner (modal dive + confidence).
- **Optimal Dive Strategy** (`OptimalStrategy`) — the game-theory mixed strategy
  rendered as % bars with commit-timing and an exploitability read.
- **Direction breakdown** vs population, stat pills (conversion, last-5, streak,
  shootout split, favored zone/height).
- **Alternation tag** (`SequenceTag`) when the taker's history shows a sequential
  pattern.
- **Scout Card export** (`exportScoutCard`) — opens a print-optimized one-page
  report in a new window; the browser's "Save as PDF" produces a shareable PDF
  with no server or PDF library.

### 5.3 Compare
Two-taker side-by-side (`ComparePage`, reusing `PlayerPicker`): a metrics table
(penalties, conversion, predictability, top direction, optimal dive, commit
timing, exploitability) with the better value highlighted per row, mirrored
direction bars, and dual heatmaps.

### 5.4 Duel — "Beat the Keeper" (`DuelPage`)
Inverts the product: **you** are the goalkeeper. Pick any taker (6 featured
quick-picks plus a search over the full roster), then dive before each of 5
kicks. This reuses the entire backend with no new modeling:

**Shot sampling** (`sampleDir`). The taker shoots from their real direction
distribution, nudged by their `seq_pattern`: an alternator's probability of
repeating the previous side is scaled by 0.45, a repeater's by 1.6. Verified by
Monte-Carlo: baseline sampling reproduces the taker's true split, and after a
Left shot an alternator correctly swings toward Right.

**Save resolution** (`makeDive`). Two independent factors:
- `reachP = REACH_DUEL[dive][shot]` — how well your chosen dive covers the shot's
  side (same reach values as the game-theory layer).
- `beatable = clamp(conv − 0.5, 0.15, 0.55)`, halved for central shots — the
  chance a correctly-read shot is still placed well enough to beat you, scaling
  with the taker's finishing quality.
- `saved` is true with probability `reachP · (1 − beatable)`.

This rebalanced formula (replacing an earlier, over-punishing one) makes a
correct corner read save ~45–52% against an average taker, ~39% against an elite
90% finisher, while wrong-way dives stay near-hopeless (~3–4%). Reading the side
right is genuinely rewarded; elite placement can still beat you. Staying central
against a central shot saves ~72–81%.

**Scoring.** After 5 kicks, the scorecard compares your empirical dive mix to the
game-theory optimal mix (`drift` = ½ · L1 distance, as a %) and labels you
predictable / fairly even / near-optimal, then shows what the model would have
done. A **win streak** (3+ saves extends it; best tracked) and a **share** action
(native share sheet, clipboard fallback) round out the loop.

> Tuning knobs for Duel realism live in `makeDive`: raise the `reachP` values or
> lower the `beatable` ceiling to make saves easier; the current values target
> "better than a real keeper's ~25% baseline, because you have the scouting
> data," which is the intended fantasy.

---

## 6. File map

| File | Role |
|------|------|
| `scraper.py` | StatsBomb extraction + freeze-frame features |
| `train_model.py` | Leakage-free training, recency weighting, profiles, metrics |
| `pose_features.py` | Run-up / body-pose feature scaffold |
| `game_theory.py` | Optimal keeper mixed-strategy solver |
| `sequence_model.py` | Alternation / streak modeling |
| `export_frontend_data.py` | Profiles + CSV → `web/public/data.json` |
| `TheKeepersEyes.jsx` | Full React app (Home / Scout / Compare / Duel) |
| `web/` | Vite project, deploy configs (GitHub Pages, Vercel) |

> Note: `TheKeepersEyes.jsx` currently exists at the repo root and at
> `web/src/TheKeepersEyes.jsx` and must be kept in sync; consolidating to the
> `web/src` copy as the single source of truth is recommended.
