"""
Sequence Modeling — Alternation & Streak Patterns  (Phase 3)
============================================================

Base-rate models treat each penalty as independent: "this taker goes left 55% of
the time." But some takers are sequential — they deliberately alternate sides, or
avoid repeating where they just went, or double down after a save. A keeper who
has seen the taker's last penalty can exploit that dependency.

This module estimates, per player, a first-order Markov tendency: P(next
direction | last direction), with Dirichlet smoothing toward the player's own
base rate so sparse transitions don't produce garbage. It also computes a single
"sequential dependence" score — how much the next direction actually depends on
the last one — so the UI can flag takers worth scouting sequentially vs. those
who are effectively memoryless.

All computation is leakage-safe: transitions are counted from a player's
chronological history, and the dependence score is descriptive (it summarizes the
observed history, not a forward prediction on held-out data).
"""

import numpy as np

DIRECTIONS = ["Left", "Center", "Right"]
ALPHA = 1.0  # Dirichlet smoothing toward the player's base rate (light, so
             # real sequential patterns surface on realistic sample sizes)


def _kl(p, q):
    p = np.clip(p, 1e-9, 1); q = np.clip(q, 1e-9, 1)
    return float(np.sum(p * np.log(p / q)))


def sequence_profile(directions_in_order, base_rate=None):
    """
    Build a first-order transition profile from a chronological list of a
    player's shot directions (e.g. ["Left","Right","Left",...]).

    Returns dict:
      transitions : {last_dir: {next_dir: prob}}   smoothed Markov matrix
      base_rate   : {dir: prob}                     player's overall rate
      dependence  : float 0..1                      how much next depends on last
                                                     (0 = memoryless, higher =
                                                     strongly sequential)
      pattern     : str   human label: 'alternator' | 'repeater' | 'memoryless'
      n_transitions : int
    """
    seq = [d for d in directions_in_order if d in DIRECTIONS]
    n = len(seq)

    if base_rate is None:
        counts = np.array([seq.count(d) for d in DIRECTIONS], dtype=float)
        base = counts / counts.sum() if counts.sum() > 0 else np.ones(3) / 3
    else:
        base = np.array([base_rate.get(d, 1 / 3) for d in DIRECTIONS])
        base = base / base.sum()

    base_dict = {d: round(float(b), 3) for d, b in zip(DIRECTIONS, base)}

    if n < 3:
        # Not enough history for a meaningful transition model.
        return {
            "transitions": {d: base_dict.copy() for d in DIRECTIONS},
            "base_rate": base_dict,
            "dependence": 0.0,
            "pattern": "memoryless",
            "n_transitions": max(0, n - 1),
        }

    # Count transitions last->next
    idx = {d: i for i, d in enumerate(DIRECTIONS)}
    M = np.zeros((3, 3))
    for a, b in zip(seq[:-1], seq[1:]):
        M[idx[a], idx[b]] += 1

    # Smooth each row toward the base rate
    trans = {}
    for i, last in enumerate(DIRECTIONS):
        row = M[i] + ALPHA * base
        row = row / row.sum()
        trans[last] = {d: round(float(p), 3) for d, p in zip(DIRECTIONS, row)}

    # Dependence: average KL divergence of each conditional row from the base
    # rate, weighted by how often that "last" state occurred. High = the next
    # direction genuinely shifts depending on the last one.
    last_counts = M.sum(axis=1)
    w = last_counts / last_counts.sum() if last_counts.sum() > 0 else np.ones(3) / 3
    dep = 0.0
    for i, last in enumerate(DIRECTIONS):
        row = np.array([trans[last][d] for d in DIRECTIONS])
        dep += w[i] * _kl(row, base)
    # Normalize to a roughly 0..1 scale (KL of ~0.7 nats is already very strong)
    dependence = float(np.clip(dep / 0.7, 0, 1))

    # Pattern label: compare P(repeat) vs P(switch) aggregated over the diagonal.
    p_repeat = float(np.mean([trans[d][d] for d in DIRECTIONS]))
    if dependence < 0.08:
        pattern = "memoryless"
    elif p_repeat < 0.30:
        pattern = "alternator"   # avoids repeating where they just went
    elif p_repeat > 0.42:
        pattern = "repeater"     # tends to go back to the same side
    else:
        pattern = "mixed"

    return {
        "transitions": trans,
        "base_rate": base_dict,
        "dependence": round(dependence, 3),
        "pattern": pattern,
        "n_transitions": int(last_counts.sum()),
    }


def next_direction_given_last(seq_profile, last_direction):
    """Convenience: pull P(next | last) from a sequence profile, falling back to
    the base rate if the last direction is unknown."""
    if last_direction in seq_profile["transitions"]:
        return seq_profile["transitions"][last_direction]
    return seq_profile["base_rate"]


if __name__ == "__main__":
    # Demo: a strict alternator vs a streaky repeater.
    alt = ["Left", "Right", "Left", "Right", "Left", "Right", "Left", "Right"]
    rep = ["Left", "Left", "Left", "Right", "Right", "Left", "Left", "Left"]
    print("Alternator:", sequence_profile(alt)["pattern"],
          "| dependence", sequence_profile(alt)["dependence"])
    print("  P(next|last=Left):", sequence_profile(alt)["transitions"]["Left"])
    print("Repeater:  ", sequence_profile(rep)["pattern"],
          "| dependence", sequence_profile(rep)["dependence"])
    print("  P(next|last=Left):", sequence_profile(rep)["transitions"]["Left"])
