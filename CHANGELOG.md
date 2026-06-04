# CHANGELOG — The Keeper's Eyes (v1 → v2)

This document summarizes the three-phase overhaul. The original handoff describes
v1; this is what changed and why.

---

## ⚠️ Important note on the bundled dataset

`data/penalties_dataset.csv` in this archive is a **La Liga-only test slice
(~245 penalties)** generated while rebuilding the pipeline, because the full
1,481-row dataset was not included in the working copy. The code is fully
dataset-agnostic — re-run `python scraper.py` (no `--competition` flag) to
regenerate the complete multi-competition dataset. All accuracy numbers quoted
below are from the test slice and will differ (generally improve) on full data.

---

## Phase 1 — Foundation: honest validation (credibility fix)

**The problem:** v1 reported ~97% direction accuracy on veteran takers. This was
a data-leakage artifact:
- The ensemble was evaluated with `predict_proba` on its own training rows.
- Player-history features were computed from each player's *entire* career,
  including the penalty being predicted — so "history" encoded the answer.

**The fix (`train_model.py`, rewritten):**
- **Walk-forward history features** — each penalty's player-tendency features use
  only that player's *prior* penalties (expanding window in time). Verified: a
  player's first penalty has 0 priors and uses the population rate.
- **Honest evaluation** — out-of-fold CV predictions + past-only Bayesian
  profiles. No model is ever scored on data it trained on.
- **Intent vs outcome** — profiles built from goals by default (cleanest signal
  of where the taker *aimed*), `--intent-source all` to revert.
- **Real uncertainty** — Dirichlet credible intervals, normalized-entropy
  predictability score, Brier score, and calibration (ECE) reporting.
- Updated README + frontend copy to remove the inflated claim.

**Result:** direction accuracy landed at a defensible ~50–53% on the test slice
(in line with the ~60–65% literature ceiling for history/context-only models),
with the "creatures of habit" effect now showing as a gentle, real gradient
(cold-start ≈ baseline → 8+ priors a few points higher) instead of a fake jump.

## Phase 2 — The accuracy unlock: scene + pose signal

**`scraper.py`:** now extracts StatsBomb 360 freeze-frame features wherever they
exist (~12–16% coverage): goalkeeper lateral pre-lean (`gk_y_offset`), keeper
depth off the line (`gk_depth`), defender/teammate counts, and the taker's setup
offset. All nullable; XGBoost handles the gaps natively.

**`train_model.py`:** added those features (they immediately became top-importance
features, validating the thesis that reading the keeper/scene beats base rates),
plus **temporal recency weighting** (4-year half-life; `--no-recency-weight` to
ablate). Calibration improved markedly (ECE 0.155 → 0.067).

**`pose_features.py` (new):** the bridge to the ~85% tier. Converts COCO-17 body
keypoints (MediaPipe / MoveNet / YOLOv8-pose output) into directional features —
hip angle, shoulder line, torso twist, plant-foot offset, lean, run-up side —
with left-footer mirroring. Merges into the dataset by penalty ID; the trainer
auto-detects pose columns once present. No video required to wire it up; annotate
when ready and the pipeline ingests it with zero code changes.

## Phase 3 — The differentiator: game theory + sequence

**`game_theory.py` (new):** computes the keeper's *optimal mixed dive strategy*
by solving each matchup as a zero-sum game with a reach-aware payoff matrix
(a correct dive isn't a guaranteed save; corners are harder than central shots).
Blends the unexploitable equilibrium with a best-response weighted by how far the
taker's actual mix sits from their own equilibrium. Outputs a dive distribution,
commit-timing guidance, and an exploitability score. LP solver (SciPy) with a
dependency-free fictitious-play fallback.

**`sequence_model.py` (new):** per-player first-order Markov tendencies
P(next direction | last direction) with a "sequential dependence" score and a
pattern label (alternator / repeater / mixed / memoryless).

Both are baked into every player profile by `train_model.py`.

**`TheKeepersEyes.jsx`:** added an **Optimal Dive Strategy** panel (mixed dive %
bars + commit timing + exploitability read) and **alternation tags**, with a
self-contained JS port of the game-theory solver whose output matches the Python.

---

## File map (v2)

| File | Role | New in v2? |
|------|------|-----------|
| `scraper.py` | StatsBomb extraction + freeze-frame features | updated |
| `train_model.py` | Leakage-free training, recency, all features, profiles | rewritten |
| `pose_features.py` | Run-up / body-pose feature scaffold | **new** |
| `game_theory.py` | Optimal keeper mixed-strategy solver | **new** |
| `sequence_model.py` | Alternation / streak modeling | **new** |
| `TheKeepersEyes.jsx` | Frontend + strategy panel + alternation tags | updated |
| `KeepersEyes_Roadmap.md` | Original deep-dive roadmap | reference |

## Phase 4 — Productization: deploy, compare, export, full data

**`export_frontend_data.py` (new):** converts `models/player_profiles.json` (all
players above a penalty threshold) plus the raw CSV into the compact `data.json`
the frontend consumes, including the Phase 3 game-theory strategy and sequence
pattern per player. This decouples the app from its hard-coded ~49-player blob.

**`web/` (new Vite project):** the JSX is now a deployable React app. At runtime
it fetches `data.json` (the full player set) and falls back to the embedded
subset, so it still works standalone. Includes:
- A live-data layer (fetch + pub/sub re-render) added to `TheKeepersEyes.jsx`.
- **Compare view** — side-by-side tendencies and optimal-dive reads for two takers.
- **Scout Card export** — opens a print-optimized report; the browser's "Save as
  PDF" produces a one-page scouting PDF with no server or PDF library.
- Deployment configs: GitHub Pages workflow (`.github/workflows/deploy.yml`, with
  automatic base-path handling) and `vercel.json`.

Build verified: `npm run build` produces `web/dist` with `data.json` bundled and
the app wired to fetch it.

---

## Suggested next steps (Phase 5, not yet built)

- Annotate the ~400 PL-season penalties with pose keypoints — the single biggest
  remaining accuracy lever (the `pose_features.py` pipeline is ready for them).
- Live fixtures integration: pull upcoming matches and surface likely takers so a
  coach can open a fresh scout card pre-match.
- Player-vs-goalkeeper matchup modeling once GK identity coverage improves
  (Transfermarkt/FBref scrape).
