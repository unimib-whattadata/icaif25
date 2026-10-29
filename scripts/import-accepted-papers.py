#!/usr/bin/env python3
"""Extract publication fields from the organizers' accepted-paper workbook."""

import argparse
import json
import re
from pathlib import Path

import openpyxl


def clean(value):
    return re.sub(r"\s+", " ", str(value)).strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--updated", required=True)
    args = parser.parse_args()
    workbook = openpyxl.load_workbook(args.workbook, read_only=True, data_only=True)
    groups = []
    seen = set()
    for sheet, column, group_id, label in [
        ("oral presentation", 1, "oral", "Oral presentations"),
        ("poster", 1, "poster", "Poster presentations"),
        ("proccedings", 0, "proceedings-only", "Proceedings only"),
    ]:
        papers = []
        for row in workbook[sheet].values:
            paper_id = row[column]
            if not isinstance(paper_id, int):
                continue
            if paper_id in seen:
                raise ValueError(f"Duplicate paper ID: {paper_id}")
            seen.add(paper_id)
            title, authors = row[column + 1:column + 3]
            if not title or not authors:
                raise ValueError(f"Missing publication fields for paper {paper_id}")
            papers.append({"id": paper_id, "title": clean(title),
                           "authors": clean(authors).replace(")*", ")")})
        groups.append({"id": group_id, "label": label,
                       "papers": sorted(papers, key=lambda paper: paper["id"])})

    # Reconcile identifiers only. Do not export contacts, reviews or organizer notes.
    accepted_ids = {row[0] for row in workbook["all accepted"].iter_rows(min_row=2, values_only=True)
                    if isinstance(row[0], int)}
    if seen != accepted_ids:
        raise ValueError(f"Accepted-paper mismatch: missing {accepted_ids - seen}, extra {seen - accepted_ids}")
    destination = Path(__file__).resolve().parent.parent / "data/accepted-papers.json"
    destination.write_text(json.dumps({"updated": args.updated, "groups": groups},
                                     ensure_ascii=False, indent=2) + "\n")
    for group in groups:
        print(f'{group["label"]}: {len(group["papers"])}')
    print(f"Reconciled {len(seen)} accepted papers.")


if __name__ == "__main__":
    main()
