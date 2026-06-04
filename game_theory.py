"""
Game-Theory Layer — Optimal Goalkeeper Strategy  (Phase 3, the differentiator)
==============================================================================

Why this exists
---------------
Every other part of this project answers "which way will the taker most likely
shoot?" That's the wrong question for a goalkeeper facing a *sophisticated*
taker, because a good taker randomizes. If a keeper always dives to the taker's
modal side, the taker simply stops going there. The right question is:

    "Given this taker's tendencies AND my own reach, what mix of dives
     minimizes my expected concession?"

That's a zero-sum game. This module turns the predictor into a decision-support
system by computing the keeper's minimax-optimal *mixed* strategy — e.g. "dive
right 63% / left 30% / stay 7%, commit late" — instead of a single deterministic
call. This is the conceptual jump from "stats lookup" to "optimization."

Model
-----
Players: the TAKER chooses a target direction d in {Left, Center, Right}; the
KEEPER chooses a dive action a in {Left, Center, Right} (stay = Center dive).

Payoff (probability the shot is SAVED, which the keeper maximizes and the taker
minimizes):
    save_prob(d, a) = reach(a, d) * (1 - finish_skill(d))
where
    reach(a, d)        — probability the keeper reaches a shot to d given dive a.
                         Diving the right way isn't a guaranteed save (a perfect
                         corner beats a correct dive); diving the wrong way
                         rarely saves. Encoded in a REACH matrix.
    finish_skill(d)    — probability the taker finishes cleanly to d when
                         unopposed (from their conversion / placement quality).

Because reach matters, the keeper's optimal mix is NOT simply "match the taker's
distribution." Against a taker who hammers the bottom corners (low reach), the
keeper may rationally commit early; against a taker who favors saveable mid-height
shots, staying central rises in value.

Solution
--------
3x3 zero-sum game solved by linear programming when SciPy is available, with a
robust fictitious-play fallback so the module has no hard dependency. Returns the
keeper's optimal mixed strategy, the game value (expected save rate under optimal
play), and the taker's own equilibrium mix (what a perfectly rational taker would
do — useful as a "this is how exploitable they are" yardstick).
"""

import numpy as np

DIRECTIONS = ["Left", "Center", "Right"]

# Reach matrix R[a][d]: P(keeper reaches a shot aimed at d | keeper dives a).
# Rows = keeper dive action, cols = shot direction. Tuned to plausible football
# values: a correct corner dive reaches ~⅔ of the time; staying central reaches
# central shots almost always but corners almost never; wrong-way dives ~rarely.
REACH = {
    #            shot Left  Center  Right
    "Left":    [0.65,      0.15,   0.05],
    "Center":  [0.10,      0.90,   0.10],
    "Right":   [0.05,      0.15,   0.65],
}


def _reach_matrix():
    return np.array([REACH[a] for a in DIRECTIONS])  # shape (3 actions, 3 dirs)


def _solve_zero_sum(payoff):
    """
    Solve a zero-sum game where the ROW player (keeper) maximizes the expected
    payoff and the COLUMN player (taker) minimizes it.

    payoff: (n_actions x n_dirs) matrix of save probabilities.
    Returns (keeper_mix, taker_mix, game_value).

    Tries SciPy linprog; falls back to fictitious play.
    """
    try:
        return _solve_linprog(payoff)
    except Exception:
        return _solve_fictitious_play(payoff)


def _solve_linprog(payoff):
    """Row player's maximin via LP. Shift payoff positive to keep value > 0."""
    from scipy.optimize import linprog

    A = payoff.astype(float)
    shift = -A.min() + 1.0
    A = A + shift  # ensure positive so 1/value is well-behaved
    n_act, n_dir = A.shape

    # Maximize v s.t. for every taker dir j: sum_i x_i * A[i,j] >= v, sum x = 1.
    # Standard transform: minimize sum p  s.t. A^T p >= 1, p >= 0; v = 1/sum p.
    c = np.ones(n_act)
    A_ub = -A.T            # -A^T p <= -1
    b_ub = -np.ones(n_dir)
    res = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=[(0, None)] * n_act, method="highs")
    if not res.success:
        raise RuntimeError("linprog failed")
    p = res.x
    v = 1.0 / p.sum()
    keeper_mix = p * v
    keeper_mix = keeper_mix / keeper_mix.sum()

    # Taker (column) equilibrium mix via the dual / best-response LP.
    c2 = -np.ones(n_dir)
    A_ub2 = A
    b_ub2 = np.ones(n_act)
    res2 = linprog(c2, A_ub=A_ub2, b_ub=b_ub2, bounds=[(0, None)] * n_dir, method="highs")
    q = res2.x
    taker_mix = q / q.sum() if q.sum() > 0 else np.ones(n_dir) / n_dir

    game_value = v - shift  # undo the shift
    return keeper_mix, taker_mix, game_value


def _solve_fictitious_play(payoff, iters=5000):
    """Dependency-free fallback: both players best-respond to the running
    empirical mix of the opponent. Converges to equilibrium for zero-sum games."""
    A = payoff.astype(float)
    n_act, n_dir = A.shape
    keeper_counts = np.zeros(n_act)
    taker_counts = np.zeros(n_dir)
    # seed
    keeper_counts[np.random.randint(n_act)] += 1
    taker_counts[np.random.randint(n_dir)] += 1
    for _ in range(iters):
        taker_mix = taker_counts / taker_counts.sum()
        # keeper maximizes expected save vs taker's empirical mix
        keeper_br = int(np.argmax(A @ taker_mix))
        keeper_counts[keeper_br] += 1
        keeper_mix = keeper_counts / keeper_counts.sum()
        # taker minimizes keeper's expected save vs keeper's empirical mix
        taker_br = int(np.argmin(keeper_mix @ A))
        taker_counts[taker_br] += 1
    keeper_mix = keeper_counts / keeper_counts.sum()
    taker_mix = taker_counts / taker_counts.sum()
    game_value = float(keeper_mix @ A @ taker_mix)
    return keeper_mix, taker_mix, game_value


def optimal_keeper_strategy(direction_probs, conversion_rate=0.78,
                            height_probs=None, reach=None):
    """
    Compute the keeper's optimal mixed strategy against a specific taker.

    Parameters
    ----------
    direction_probs : dict  {Left, Center, Right} -> prob   (the taker's observed
        directional tendency; used to derive how clean their finishing is per side)
    conversion_rate : float  the taker's overall conversion (finish quality proxy)
    height_probs : dict or None  {Low, Mid, High}; high-corner takers are harder
        to save even on a correct dive, so this lowers reach when present.
    reach : np.ndarray or None  override the default REACH matrix.

    Returns
    -------
    dict with:
      keeper_strategy : {dir: prob}      how often the keeper should commit each way
      recommended_dive : str             the modal action of the optimal mix
      taker_equilibrium : {dir: prob}    what a perfectly rational taker would do
      expected_save_rate : float         game value under optimal play
      naive_save_rate : float            save rate if keeper just dives the modal side
      edge_over_naive : float            save-rate difference vs always diving
                                         the modal side. Often near zero or
                                         slightly negative against a PREDICTABLE
                                         taker — that's expected: naive diving is
                                         fine until the taker adapts. The mixed
                                         strategy's value is robustness to
                                         adaptation, surfaced via exploitability.
      exploitability : float             how far the taker's actual mix is from
                                         their own equilibrium (0 = unexploitable)
      commit_timing : str                'early' | 'balanced' | 'late' guidance
    """
    R = reach if reach is not None else _reach_matrix()

    # Finish skill per direction: scale the taker's conversion by how much they
    # favor that side (a side they rarely use is, if anything, less practiced),
    # and bump corners (Left/Right) since unopposed corner finishes are cleaner.
    d = np.array([direction_probs.get(k, 1 / 3) for k in DIRECTIONS])
    d = d / d.sum() if d.sum() > 0 else np.ones(3) / 3
    corner_bonus = np.array([1.05, 0.90, 1.05])  # central shots a touch easier to save
    finish = np.clip(conversion_rate * corner_bonus, 0.05, 0.99)

    # If the taker loves high shots, reduce reach (harder to save up high).
    if height_probs:
        high = height_probs.get("High", 0.16)
        R = R.copy()
        R *= (1.0 - 0.5 * high)  # up to ~25% reach penalty for very high takers

    # Save-prob payoff matrix: keeper action (row) x shot direction (col)
    payoff = R * (1.0 - finish)[None, :]

    keeper_mix, taker_mix, value = _solve_zero_sum(payoff)

    # ── Best-response vs equilibrium (the scouting dial) ──────────────
    # The minimax mix above is the UNEXPLOITABLE strategy — correct against a
    # taker who will re-randomize the moment you deviate. But a scout is facing
    # THIS taker, whose tendencies (d) are observed and often far from their own
    # equilibrium. The pure best response to d maximizes saves against exactly
    # this taker but is itself exploitable if they adapt.
    #
    # We blend the two by how exploitable the taker actually is: the further
    # their real mix sits from their equilibrium, the more we lean on the
    # exploitative best response. A disciplined randomizer -> trust equilibrium.
    br_action = int(np.argmax(payoff @ d))              # best dive vs actual mix
    br_mix = np.zeros(3); br_mix[br_action] = 1.0
    exploit = float(np.abs(d - taker_mix).sum() / 2.0)  # 0..1
    lean = float(np.clip(exploit * 1.5, 0.0, 0.85))     # how far to exploit
    blended = (1 - lean) * keeper_mix + lean * br_mix
    blended = blended / blended.sum()

    keeper_strategy = {k: round(float(v), 3) for k, v in zip(DIRECTIONS, blended)}
    taker_equilibrium = {k: round(float(v), 3) for k, v in zip(DIRECTIONS, taker_mix)}

    # Naive baseline: keeper always dives the taker's modal direction.
    modal = int(np.argmax(d))
    naive_save = float(payoff[modal] @ d)
    # Expected save rate of the blended strategy vs THIS taker's actual mix.
    blended_save = float(blended @ payoff @ d)

    # Commit timing heuristic from how concentrated the optimal keeper mix is.
    top = max(keeper_strategy.values())
    timing = "early" if top > 0.6 else ("late" if top < 0.45 else "balanced")

    return {
        "keeper_strategy": keeper_strategy,
        "recommended_dive": DIRECTIONS[int(np.argmax(blended))],
        "taker_equilibrium": taker_equilibrium,
        "expected_save_rate": round(blended_save, 3),
        "naive_save_rate": round(naive_save, 3),
        "edge_over_naive": round(blended_save - naive_save, 3),
        "exploitability": round(exploit, 3),
        "commit_timing": timing,
    }


if __name__ == "__main__":
    # Demo: a right-heavy taker (e.g. Messi-like) vs a balanced one.
    print("Right-heavy taker (L31/C15/R54), 81% conversion:")
    s = optimal_keeper_strategy({"Left": 0.31, "Center": 0.15, "Right": 0.54}, 0.81)
    for k, v in s.items():
        print(f"  {k}: {v}")
    print("\nBalanced taker (L40/C20/R40), 75% conversion:")
    s2 = optimal_keeper_strategy({"Left": 0.40, "Center": 0.20, "Right": 0.40}, 0.75)
    for k, v in s2.items():
        print(f"  {k}: {v}")
