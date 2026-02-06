#!/usr/bin/env python
"""
Import historic tournament data from the raw Excel file and output CSVs
ready to be loaded into Supabase.

Notes:
- Matches players by exact name only (fallback to case-insensitive if unique).
- Creates new players with slug if missing.
- Includes Summer Cup events, but does not apply bounty to points.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import os
import re
import unicodedata
import uuid
import zipfile
import xml.etree.ElementTree as ET


SHEET_NAME = "BD"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        default=r"C:\dev\la granja\data\BASE DE DATOS RAW.xlsx",
        help="Path to RAW Excel file",
    )
    parser.add_argument(
        "--out",
        default=r"C:\dev\la granja\data\normalized",
        help="Output directory for CSVs",
    )
    parser.add_argument(
        "--existing-players",
        default=r"C:\dev\la granja\data\players_rows.csv",
        help="Optional CSV export of existing players (id,name,...) to reuse IDs",
    )
    return parser.parse_args()


def normalize_text(value: str) -> str:
    value = value.strip()
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return value.upper()


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-{2,}", "-", value).strip("-")
    return value or "player"


def parse_float(value: str | int | float | None) -> float | None:
    if value is None:
        return None
    text = str(value).strip()
    if text in ("", "-", "x", "X"):
        return None
    text = text.replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return None


def parse_int(value: str | int | float | None) -> int | None:
    num = parse_float(value)
    if num is None:
        return None
    try:
        return int(round(num))
    except (TypeError, ValueError):
        return None


def excel_date_to_iso(value: float | None) -> str | None:
    if value is None:
        return None
    # Excel 1900 system
    base = dt.datetime(1899, 12, 30)
    date = base + dt.timedelta(days=value)
    return date.date().isoformat()


def parse_torneo_code(raw: str) -> tuple[str, int] | None:
    if not raw:
        return None
    code = str(raw).strip()
    code = code.replace(" ", "")
    match = re.match(r"^(Ap|Cl|Sm)(\d{4})$", code, re.IGNORECASE)
    if not match:
        return None
    prefix = match.group(1).lower()
    year = int(match.group(2))
    if prefix == "ap":
        return ("apertura", year)
    if prefix == "cl":
        return ("clausura", year)
    if prefix == "sm":
        return ("summer", year)
    return None


def parse_event_number(raw: str) -> int | None:
    if not raw:
        return None
    match = re.search(r"(\d+)", str(raw))
    if not match:
        return None
    return int(match.group(1))


def parse_position_number(pos_text: str, pos_label: str, players_count: int | None) -> int | None:
    pos_text_norm = normalize_text(pos_text or "")
    pos_label_norm = normalize_text(pos_label or "")

    mapping = {
        "PRIMERO": 1,
        "SEGUNDO": 2,
        "TERCERO": 3,
        "CUARTO": 4,
        "QUINTO": 5,
        "SEXTO": 6,
        "SEPTIMO": 7,
        "OCTAVO": 8,
        "NOVENO": 9,
    }

    if pos_text_norm in mapping:
        return mapping[pos_text_norm]

    if pos_text_norm == "ULTIMO":
        return players_count

    if pos_label_norm in ("ULTIMO", "ULTIMO-"):
        return players_count

    if pos_label_norm == "BURBUJA":
        return None

    match = re.search(r"(\d+)", pos_label_norm)
    if match:
        return int(match.group(1))

    return None


def load_sheet_rows(path: str, sheet_name: str) -> list[list[str]]:
    ns = {"ns": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

    with zipfile.ZipFile(path) as z:
        shared_strings = []
        if "xl/sharedStrings.xml" in z.namelist():
            sst = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in sst.findall("ns:si", ns):
                texts = [t.text or "" for t in si.findall(".//ns:t", ns)]
                shared_strings.append("".join(texts))

        wb = ET.fromstring(z.read("xl/workbook.xml"))
        sheets = wb.find("ns:sheets", ns)
        sheet_info = []
        for sheet in sheets.findall("ns:sheet", ns):
            name = sheet.attrib.get("name")
            rid = sheet.attrib.get(
                "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
            )
            sheet_info.append((name, rid))

        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rel_ns = {"r": "http://schemas.openxmlformats.org/package/2006/relationships"}
        rid_to_target = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels.findall("r:Relationship", rel_ns)}

        sheet_map = {name: rid for name, rid in sheet_info}
        if sheet_name not in sheet_map:
            raise RuntimeError(f"Sheet {sheet_name} not found")

        target = rid_to_target[sheet_map[sheet_name]]
        sheet_path = "xl/" + target
        xml = ET.fromstring(z.read(sheet_path))
        sheet_data = xml.find("ns:sheetData", ns)

        def cell_value(cell: ET.Element) -> str:
            t = cell.attrib.get("t")
            v = cell.find("ns:v", ns)
            if t == "s":
                if v is None:
                    return ""
                idx = int(v.text)
                return shared_strings[idx] if idx < len(shared_strings) else ""
            if t == "inlineStr":
                is_el = cell.find("ns:is", ns)
                if is_el is None:
                    return ""
                texts = [t_el.text or "" for t_el in is_el.findall(".//ns:t", ns)]
                return "".join(texts)
            if v is None:
                return ""
            return v.text or ""

        def col_index(cell_ref: str) -> int:
            col = ""
            for ch in cell_ref:
                if ch.isalpha():
                    col += ch
                else:
                    break
            idx = 0
            for ch in col:
                idx = idx * 26 + (ord(ch.upper()) - ord("A") + 1)
            return idx

        rows: list[list[str]] = []
        for row in sheet_data.findall("ns:row", ns):
            cells = row.findall("ns:c", ns)
            if not cells:
                rows.append([])
                continue
            max_col = max(col_index(c.attrib.get("r", "A")) for c in cells)
            row_vals = [""] * max_col
            for c in cells:
                ref = c.attrib.get("r", "A")
                idx = col_index(ref) - 1
                row_vals[idx] = cell_value(c)
            rows.append(row_vals)

    return rows


def main() -> None:
    args = parse_args()
    rows = load_sheet_rows(args.input, SHEET_NAME)
    header = rows[0]

    def get(row: list[str], idx: int) -> str:
        return row[idx] if idx < len(row) else ""

    # Column indexes
    IDX_TORNEO = 1
    IDX_FECHA_NUM = 2
    IDX_SEDE = 3
    IDX_FECHA_TXT = 4
    IDX_PLAYER = 5
    IDX_POS_TEXT = 6
    IDX_POS_LABEL = 7
    IDX_PLAYERS_COUNT = 13
    IDX_BOUNTY = 20
    IDX_POINTS = 21
    IDX_BOUNTY_CREDIT = 23

    seasons: dict[tuple[str, int], dict[str, str | int]] = {}
    events: dict[tuple[str, int, int], dict[str, str | int | None]] = {}
    players: dict[str, str] = {}
    slug_to_name: dict[str, str] = {}
    canonical_by_key: dict[str, str] = {}
    existing_name_to_id: dict[str, str] = {}
    existing_casefold_to_name: dict[str, str] = {}
    existing_ids: set[str] = set()
    new_player_ids: set[str] = set()

    if args.existing_players and os.path.exists(args.existing_players):
        with open(args.existing_players, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = (row.get("name") or "").strip()
                pid = (row.get("id") or "").strip()
                if not name or not pid:
                    continue
                existing_name_to_id[name] = pid
                existing_ids.add(pid)
                slug_to_name[pid] = name
        for name in existing_name_to_id:
            key = name.casefold()
            if key not in existing_casefold_to_name:
                existing_casefold_to_name[key] = name
            elif existing_casefold_to_name[key] != name:
                existing_casefold_to_name[key] = ""

    rows_total = 0
    rows_skipped = 0

    for row in rows[1:]:
        rows_total += 1
        torneo_code = str(get(row, IDX_TORNEO)).strip()
        if not torneo_code:
            rows_skipped += 1
            continue

        season_key = parse_torneo_code(torneo_code)
        if not season_key:
            rows_skipped += 1
            continue

        season_type, year = season_key
        if (season_type, year) not in seasons:
            season_id = str(uuid.uuid4())
            seasons[(season_type, year)] = {
                "id": season_id,
                "type": season_type,
                "year": year,
                "status": "finished" if year < dt.date.today().year else "active",
                "name": f"{season_type.capitalize()} {year}".replace("Summer", "Summer Cup"),
            }

        event_number = parse_event_number(get(row, IDX_FECHA_TXT))
        if not event_number:
            rows_skipped += 1
            continue

        event_key = (season_type, year, event_number)
        date_num = parse_float(get(row, IDX_FECHA_NUM))
        date_iso = excel_date_to_iso(date_num) if date_num is not None else None
        venue = str(get(row, IDX_SEDE)).strip() or None
        players_count = parse_int(get(row, IDX_PLAYERS_COUNT))

        if event_key not in events:
            events[event_key] = {
                "id": str(uuid.uuid4()),
                "season_id": seasons[(season_type, year)]["id"],
                "number": event_number,
                "date": date_iso,
                "status": "finished",
                "players_count": players_count,
                "venue": venue,
            }
        else:
            evt = events[event_key]
            if evt["date"] is None and date_iso:
                evt["date"] = date_iso
            if evt["venue"] is None and venue:
                evt["venue"] = venue
            if evt["players_count"] is None and players_count is not None:
                evt["players_count"] = players_count

        name_raw = str(get(row, IDX_PLAYER)).strip()
        if not name_raw:
            continue
        name_key = name_raw.casefold()
        if name_key in canonical_by_key:
            name = canonical_by_key[name_key]
        else:
            if name_raw in existing_name_to_id:
                canonical = name_raw
            else:
                candidate = existing_casefold_to_name.get(name_key, "")
                canonical = candidate or name_raw
            canonical_by_key[name_key] = canonical
            name = canonical
        if name not in players:
            existing_id = existing_name_to_id.get(name)
            if existing_id:
                players[name] = existing_id
            else:
                base_slug = slugify(name)
                slug = base_slug
                counter = 2
                while slug in slug_to_name and slug_to_name[slug] != name:
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                players[name] = slug
                slug_to_name[slug] = name
                new_player_ids.add(slug)

    results = []
    duplicates = 0
    seen = set()
    for row in rows[1:]:
        torneo_code = str(get(row, IDX_TORNEO)).strip()
        if not torneo_code:
            continue
        season_key = parse_torneo_code(torneo_code)
        if not season_key:
            continue
        season_type, year = season_key
        event_number = parse_event_number(get(row, IDX_FECHA_TXT))
        if not event_number:
            continue
        event_key = (season_type, year, event_number)
        event = events.get(event_key)
        if not event:
            continue

        name_raw = str(get(row, IDX_PLAYER)).strip()
        if not name_raw:
            continue
        name_key = name_raw.casefold()
        name = canonical_by_key.get(name_key, name_raw)
        player_id = players.get(name)
        if not player_id:
            continue

        key = (event["id"], player_id)
        if key in seen:
            duplicates += 1
            continue
        seen.add(key)

        pos_text = str(get(row, IDX_POS_TEXT)).strip()
        pos_label = str(get(row, IDX_POS_LABEL)).strip()
        players_count = event.get("players_count")
        position = parse_position_number(pos_text, pos_label, players_count)

        is_bubble = None
        if normalize_text(pos_label) == "BURBUJA":
            is_bubble = True

        bounty_count = parse_float(get(row, IDX_BOUNTY))
        bounty_credit = str(get(row, IDX_BOUNTY_CREDIT)).strip()
        if bounty_credit.lower() in ("x", "-", ""):
            bounty_credit = ""

        points = parse_float(get(row, IDX_POINTS)) or 0.0

        results.append(
            {
                "event_id": event["id"],
                "player_id": player_id,
                "position": position,
                "rebuys": 0,
                "points": points,
                "prize": 0,
                "position_text": pos_text,
                "position_label": pos_label,
                "is_bubble": None if is_bubble is None else str(is_bubble).lower(),
                "bounty_count": bounty_count,
                "bounty_credit_name": bounty_credit,
            }
        )

    out_dir = args.out
    os.makedirs(out_dir, exist_ok=True)

    def write_csv(filename: str, rows: list[dict], fieldnames: list[str]) -> None:
        path = os.path.join(out_dir, filename)
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for row in rows:
                writer.writerow(row)

    seasons_rows = list(seasons.values())
    events_rows = [
        {
            **evt,
            "date": evt.get("date") or "",
            "players_count": evt.get("players_count") if evt.get("players_count") is not None else 0,
            "venue": evt.get("venue") or "",
        }
        for evt in events.values()
    ]
    players_rows = [
        {"id": slug, "name": name}
        for name, slug in sorted(players.items())
        if slug in new_player_ids
    ]

    write_csv(
        "seasons.csv",
        seasons_rows,
        ["id", "type", "year", "status", "name"],
    )
    write_csv(
        "event_nights.csv",
        events_rows,
        ["id", "season_id", "number", "date", "status", "players_count", "venue"],
    )
    write_csv(
        "players.csv",
        players_rows,
        ["id", "name"],
    )
    results_rows = [
        {
            **row,
            "position": row.get("position") if row.get("position") is not None else 0,
            "is_bubble": row.get("is_bubble") if row.get("is_bubble") is not None else "false",
            "bounty_count": row.get("bounty_count") if row.get("bounty_count") is not None else 0,
        }
        for row in results
    ]

    write_csv(
        "event_results.csv",
        results_rows,
        [
            "event_id",
            "player_id",
            "position",
            "rebuys",
            "points",
            "prize",
            "position_text",
            "position_label",
            "is_bubble",
            "bounty_count",
            "bounty_credit_name",
        ],
    )

    summary = {
        "rows_total": rows_total,
        "rows_skipped": rows_skipped,
        "seasons": len(seasons_rows),
        "events": len(events_rows),
        "players": len(players_rows),
        "existing_players_matched": len(players) - len(players_rows),
        "results": len(results),
        "duplicates_skipped": duplicates,
        "output_dir": out_dir,
    }

    summary_path = os.path.join(out_dir, "import_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print("Import files generated:")
    for name in ["seasons.csv", "event_nights.csv", "players.csv", "event_results.csv", "import_summary.json"]:
        print(" -", os.path.join(out_dir, name))


if __name__ == "__main__":
    main()
