"""
StatsBomb Open Data — Penalty Kick Extractor
=============================================

Extracts every penalty kick from StatsBomb's free open-data repository,
including 3D shot placement coordinates (where in the goal the ball went),
player info, match context, and classified shot zones.

Data source: https://github.com/statsbomb/open-data
License: Free for research & analytics — credit StatsBomb in publications.

Usage:
    python scraper.py                    # Extract all competitions
    python scraper.py --competition "Premier League"   # Filter by competition
    python scraper.py --output my_data.csv             # Custom output path
    python scraper.py --workers 10                     # Adjust parallelism

Output columns:
    match_id, competition, season, match_date, home_team, away_team,
    home_score, away_score, competition_stage, minute, second, period,
    is_shootout, player_name, player_id, team_name, goalkeeper_name,
    body_part, technique, outcome, xg, end_x, end_y, end_z,
    shot_zone_horizontal, shot_zone_vertical, shot_zone

Shot zone classification:
    - Horizontal: Left | Center | Right  (from the penalty taker's perspective)
    - Vertical:   Low | Mid | High
    - Combined:   e.g. "Bottom-Left", "Top-Right", "Mid-Center"

    Goal frame in StatsBomb coords:
        y-axis: 36.0 (left post) to 44.0 (right post), center = 40.0
        z-axis: 0.0  (ground)    to 2.67  (crossbar)
"""

import argparse
import csv
import json
import os
import sys
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

# ── Config ───────────────────────────────────────────────────────────
BASE_URL = "https://raw.githubusercontent.com/statsbomb/open-data/master/data"
USER_AGENT = "PenaltyKickPredictor/1.0 (github.com)"
DEFAULT_OUTPUT = "data/penalties_dataset.csv"
DEFAULT_WORKERS = 20
BATCH_LOG_INTERVAL = 250

# Goal frame boundaries (StatsBomb coordinate system)
GOAL_Y_LEFT = 36.0
GOAL_Y_RIGHT = 44.0
GOAL_Y_CENTER = 40.0
GOAL_Z_CROSSBAR = 2.67

# Zone thresholds (divide goal into 3x3 grid)
Y_LEFT_BOUND = GOAL_Y_LEFT + (GOAL_Y_RIGHT - GOAL_Y_LEFT) / 3     # ~38.67
Y_RIGHT_BOUND = GOAL_Y_LEFT + 2 * (GOAL_Y_RIGHT - GOAL_Y_LEFT) / 3  # ~41.33
Z_LOW_BOUND = GOAL_Z_CROSSBAR / 3     # ~0.89
Z_MID_BOUND = 2 * GOAL_Z_CROSSBAR / 3  # ~1.78


def fetch_json(url: str, retries: int = 3) -> dict | list | None:
    """Download and parse JSON from a URL with retries."""
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=20) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
            if attempt < retries - 1:
                time.sleep(1 * (attempt + 1))
    return None


def classify_horizontal(end_y: float) -> str:
    """Classify horizontal shot placement: Left | Center | Right."""
    if end_y < Y_LEFT_BOUND:
        return "Left"
    elif end_y > Y_RIGHT_BOUND:
        return "Right"
    return "Center"


def classify_vertical(end_z: float) -> str:
    """Classify vertical shot placement: Low | Mid | High."""
    if end_z < Z_LOW_BOUND:
        return "Low"
    elif end_z < Z_MID_BOUND:
        return "Mid"
    return "High"


def classify_zone(hz: str, vz: str) -> str:
    """Combine horizontal + vertical into a 9-zone label."""
    height_map = {"Low": "Bottom", "Mid": "Mid", "High": "Top"}
    return f"{height_map[vz]}-{hz}"


def extract_penalties_from_events(events: list, meta: dict) -> list[dict]:
    """Parse event JSON and return penalty kick records."""
    penalties = []

    for event in events:
        # Filter to Shot events of type Penalty
        if event.get("type", {}).get("name") != "Shot":
            continue
        shot = event.get("shot", {})
        if shot.get("type", {}).get("name") != "Penalty":
            continue

        # End location: where the ball ended up [x, y, z]
        end_loc = shot.get("end_location", [])
        end_x = end_loc[0] if len(end_loc) > 0 else None
        end_y = end_loc[1] if len(end_loc) > 1 else None
        end_z = end_loc[2] if len(end_loc) > 2 else None

        period = event.get("period")

        # Identify opposing goalkeeper from freeze frame
        goalkeeper_name = None
        for ff in shot.get("freeze_frame", []):
            if (ff.get("position", {}).get("name") == "Goalkeeper"
                    and ff.get("teammate") is False):
                goalkeeper_name = ff.get("player", {}).get("name")
                break

        # Classify shot zones
        hz = classify_horizontal(end_y) if end_y is not None else None
        vz = classify_vertical(end_z) if end_z is not None else None
        zone = classify_zone(hz, vz) if (hz and vz) else None

        penalties.append({
            "match_id": meta["match_id"],
            "competition": meta["competition"],
            "season": meta["season"],
            "match_date": meta["match_date"],
            "home_team": meta["home_team"],
            "away_team": meta["away_team"],
            "home_score": meta["home_score"],
            "away_score": meta["away_score"],
            "competition_stage": meta["competition_stage"],
            "minute": event.get("minute"),
            "second": event.get("second"),
            "period": period,
            "is_shootout": (period == 5),
            "player_name": event.get("player", {}).get("name"),
            "player_id": event.get("player", {}).get("id"),
            "team_name": event.get("team", {}).get("name"),
            "goalkeeper_name": goalkeeper_name,
            "body_part": shot.get("body_part", {}).get("name"),
            "technique": shot.get("technique", {}).get("name"),
            "outcome": shot.get("outcome", {}).get("name"),
            "xg": shot.get("statsbomb_xg"),
            "end_x": end_x,
            "end_y": end_y,
            "end_z": end_z,
            "shot_zone_horizontal": hz,
            "shot_zone_vertical": vz,
            "shot_zone": zone,
        })

    return penalties


def process_match(mid: int, meta: dict) -> list[dict]:
    """Download a match's events, extract penalties, return results."""
    events = fetch_json(f"{BASE_URL}/events/{mid}.json")
    if events is None:
        return []
    return extract_penalties_from_events(events, meta)


def main():
    parser = argparse.ArgumentParser(description="Extract penalty kick data from StatsBomb Open Data")
    parser.add_argument("--output", "-o", default=DEFAULT_OUTPUT, help="Output CSV path")
    parser.add_argument("--competition", "-c", default=None, help="Filter to a specific competition name")
    parser.add_argument("--workers", "-w", type=int, default=DEFAULT_WORKERS, help="Parallel download workers")
    args = parser.parse_args()

    print("=" * 60)
    print("⚽  STATSBOMB PENALTY KICK EXTRACTOR")
    print("=" * 60)

    # ── Step 1: Load competitions ────────────────────────────────
    print("\n[1/4] Fetching competition list...")
    competitions = fetch_json(f"{BASE_URL}/competitions.json")
    if not competitions:
        print("ERROR: Could not fetch competitions.json")
        sys.exit(1)

    if args.competition:
        competitions = [c for c in competitions
                        if args.competition.lower() in c["competition_name"].lower()]
        print(f"  Filtered to '{args.competition}': {len(competitions)} season(s)")
    else:
        print(f"  Found {len(competitions)} competition-seasons")

    # ── Step 2: Build match index ────────────────────────────────
    print("\n[2/4] Downloading match lists...")
    match_meta = {}
    for comp in competitions:
        cid, sid = comp["competition_id"], comp["season_id"]
        matches = fetch_json(f"{BASE_URL}/matches/{cid}/{sid}.json")
        if not matches:
            continue
        for m in matches:
            match_meta[m["match_id"]] = {
                "match_id": m["match_id"],
                "competition": comp["competition_name"],
                "season": comp["season_name"],
                "match_date": m.get("match_date", ""),
                "home_team": m["home_team"]["home_team_name"],
                "away_team": m["away_team"]["away_team_name"],
                "home_score": m.get("home_score"),
                "away_score": m.get("away_score"),
                "competition_stage": m.get("competition_stage", {}).get("name", ""),
            }
        print(f"  ✓ {comp['competition_name']} {comp['season_name']}: {len(matches)} matches")

    total_matches = len(match_meta)
    print(f"\n  Total: {total_matches} matches to process")

    # ── Step 3: Extract penalties ────────────────────────────────
    print(f"\n[3/4] Extracting penalties ({args.workers} workers)...")
    all_penalties = []
    done = 0

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {
            pool.submit(process_match, mid, meta): mid
            for mid, meta in match_meta.items()
        }
        for fut in as_completed(futures):
            all_penalties.extend(fut.result())
            done += 1
            if done % BATCH_LOG_INTERVAL == 0:
                print(f"  {done}/{total_matches} matches — {len(all_penalties)} penalties")

    all_penalties.sort(key=lambda x: (x["match_date"] or "", x["minute"] or 0))
    print(f"\n  ✓ Extracted {len(all_penalties)} penalties from {done} matches")

    # ── Step 4: Write output ─────────────────────────────────────
    print(f"\n[4/4] Writing to {args.output}...")
    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)

    if all_penalties:
        fieldnames = list(all_penalties[0].keys())
        with open(args.output, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_penalties)
        print(f"  ✓ Saved {len(all_penalties)} rows")
    else:
        print("  ⚠ No penalties found!")
        return

    # ── Summary ──────────────────────────────────────────────────
    n = len(all_penalties)
    has_zone = sum(1 for p in all_penalties if p["shot_zone"])
    shootouts = sum(1 for p in all_penalties if p["is_shootout"])
    players = len(set(p["player_name"] for p in all_penalties if p["player_name"]))
    dates = sorted(set(p["match_date"] for p in all_penalties if p["match_date"]))

    print(f"\n{'='*60}")
    print(f"DATASET SUMMARY")
    print(f"{'='*60}")
    print(f"  Penalties:      {n}")
    print(f"  With placement: {has_zone} ({100*has_zone/n:.1f}%)")
    print(f"  Shootout pens:  {shootouts}")
    print(f"  Unique takers:  {players}")
    print(f"  Date range:     {dates[0]} → {dates[-1]}")

    print(f"\n  Competitions:")
    cc = {}
    for p in all_penalties:
        cc[p["competition"]] = cc.get(p["competition"], 0) + 1
    for c, cnt in sorted(cc.items(), key=lambda x: -x[1]):
        print(f"    {c}: {cnt}")

    print(f"\n  Outcomes:")
    oc = {}
    for p in all_penalties:
        oc[p["outcome"]] = oc.get(p["outcome"], 0) + 1
    for o, cnt in sorted(oc.items(), key=lambda x: -x[1]):
        print(f"    {o}: {cnt} ({100*cnt/n:.1f}%)")

    print(f"\n  Shot zones:")
    zc = {}
    for p in all_penalties:
        if p["shot_zone"]:
            zc[p["shot_zone"]] = zc.get(p["shot_zone"], 0) + 1
    for z, cnt in sorted(zc.items(), key=lambda x: -x[1]):
        print(f"    {z}: {cnt} ({100*cnt/sum(zc.values()):.1f}%)")

    print(f"\n  Top 10 takers:")
    pc = {}
    for p in all_penalties:
        nm = p["player_name"]
        if nm:
            if nm not in pc:
                pc[nm] = [0, 0]
            pc[nm][0] += 1
            if p["outcome"] == "Goal":
                pc[nm][1] += 1
    for nm, (t, s) in sorted(pc.items(), key=lambda x: -x[1][0])[:10]:
        print(f"    {nm}: {t} taken, {s} scored ({100*s/t:.0f}%)")

    print(f"\nDone! Dataset saved to: {args.output}")


if __name__ == "__main__":
    main()
