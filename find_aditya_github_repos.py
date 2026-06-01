"""
Find public GitHub repositories associated with Aditya University and
Aditya Engineering College.

Discovery methods:
1. Fetch repositories from known GitHub organization handles.
2. Search public repositories by institution keywords.

Output:
    aditya_university_projects.csv

Optional authentication:
    Set GITHUB_TOKEN to a GitHub Personal Access Token to increase rate limits.

Example:
    PowerShell:
        $env:GITHUB_TOKEN = "github_pat_..."
        python find_aditya_github_repos.py

    macOS/Linux:
        export GITHUB_TOKEN="github_pat_..."
        python find_aditya_github_repos.py
"""

from __future__ import annotations

import csv
import os
import sys
import time
from email.utils import parsedate_to_datetime
from typing import Any

import requests


API_BASE = "https://api.github.com"
OUTPUT_FILE = "aditya_university_projects.csv"

ORG_HANDLES = [
    "adityaengineeringcollege",
    "aditya-engineering-college",
    "aec-edu",
]

SEARCH_QUERY = (
    '"Aditya University" OR "Aditya Engineering College" OR "Aditya Engineering"'
)


def build_headers() -> dict[str, str]:
    """Create GitHub API headers, adding a PAT when GITHUB_TOKEN is available."""
    token = os.getenv("GITHUB_TOKEN")
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "aditya-university-repo-discovery-script",
    }

    if token:
        headers["Authorization"] = f"Bearer {token}"
    else:
        print(
            "WARNING: GITHUB_TOKEN is not set. Continuing unauthenticated; "
            "GitHub API rate limits will be much lower.",
            file=sys.stderr,
        )

    return headers


def clean_text(value: Any) -> str:
    """Make text safe for CSV consumers by removing newlines and commas."""
    if value is None:
        return ""
    return " ".join(str(value).replace(",", " ").split())


def parse_next_link(link_header: str | None) -> str | None:
    """Return the URL for the next page from GitHub's Link header."""
    if not link_header:
        return None

    for part in link_header.split(","):
        section = part.strip().split(";")
        if len(section) < 2:
            continue
        url_part = section[0].strip()
        rel_part = section[1].strip()
        if rel_part == 'rel="next"':
            return url_part.strip("<>")
    return None


def sleep_until_rate_limit_resets(response: requests.Response) -> None:
    """Pause when GitHub reports that the current rate-limit bucket is empty."""
    remaining = response.headers.get("X-RateLimit-Remaining")
    reset = response.headers.get("X-RateLimit-Reset")

    if remaining != "0" or not reset:
        return

    try:
        wait_seconds = max(int(reset) - int(time.time()) + 2, 1)
    except ValueError:
        wait_seconds = 60

    print(f"Rate limit reached. Sleeping for {wait_seconds} seconds...")
    time.sleep(wait_seconds)


def request_json(
    session: requests.Session,
    url: str,
    params: dict[str, Any] | None = None,
) -> tuple[Any | None, requests.Response | None]:
    """
    Request JSON from GitHub with basic rate-limit and transient-error handling.

    Returns a tuple of (json_data, response). If a request cannot be completed,
    json_data is None.
    """
    for attempt in range(1, 4):
        response = session.get(url, params=params, timeout=30)

        if response.status_code == 403:
            sleep_until_rate_limit_resets(response)
            if response.headers.get("X-RateLimit-Remaining") == "0":
                continue

        if response.status_code in {500, 502, 503, 504}:
            wait_seconds = attempt * 2
            print(
                f"GitHub returned {response.status_code}. "
                f"Retrying in {wait_seconds} seconds..."
            )
            time.sleep(wait_seconds)
            continue

        if response.status_code == 404:
            return None, response

        if response.status_code == 422:
            print(
                f"GitHub rejected the request: {response.url}\n"
                f"Response: {response.text}",
                file=sys.stderr,
            )
            return None, response

        response.raise_for_status()
        return response.json(), response

    print(f"Failed after retries: {url}", file=sys.stderr)
    return None, None


def iter_paginated(
    session: requests.Session,
    url: str,
    params: dict[str, Any] | None = None,
    item_key: str | None = None,
) -> list[dict[str, Any]]:
    """
    Collect all pages from a GitHub endpoint.

    For normal list endpoints, GitHub returns a list.
    For search endpoints, GitHub returns an object containing an "items" list.
    """
    results: list[dict[str, Any]] = []
    next_url: str | None = url
    next_params = dict(params or {})
    next_params.setdefault("per_page", 100)

    while next_url:
        data, response = request_json(session, next_url, next_params)
        if data is None or response is None:
            break

        if item_key:
            page_items = data.get(item_key, [])
        else:
            page_items = data

        if isinstance(page_items, list):
            results.extend(page_items)

        next_url = parse_next_link(response.headers.get("Link"))
        next_params = None

    return results


def fetch_org_repositories(session: requests.Session) -> list[dict[str, Any]]:
    """Fetch all public repositories from the known organization handles."""
    repos: list[dict[str, Any]] = []

    for org in ORG_HANDLES:
        print(f"Fetching organization repositories: {org}")
        url = f"{API_BASE}/orgs/{org}/repos"
        org_repos = iter_paginated(
            session,
            url,
            params={"type": "public", "sort": "created", "direction": "desc"},
        )

        if not org_repos:
            print(f"  No repositories found or organization unavailable: {org}")
        else:
            print(f"  Found {len(org_repos)} repositories")

        repos.extend(org_repos)

    return repos


def search_keyword_repositories(session: requests.Session) -> list[dict[str, Any]]:
    """Search GitHub repositories with institution keyword phrases."""
    print("Searching repositories by keyword query")
    url = f"{API_BASE}/search/repositories"
    return iter_paginated(
        session,
        url,
        params={
            "q": SEARCH_QUERY,
            "sort": "updated",
            "order": "desc",
        },
        item_key="items",
    )


def extract_repository_fields(repo: dict[str, Any]) -> dict[str, Any]:
    """Normalize a GitHub repository API object into the CSV row schema."""
    owner = repo.get("owner") or {}
    return {
        "Repository Name": clean_text(repo.get("name")),
        "Owner/Author": clean_text(owner.get("login")),
        "Description": clean_text(repo.get("description")),
        "HTML URL": clean_text(repo.get("html_url")),
        "Primary Language": clean_text(repo.get("language")),
        "Created At Date": clean_text(repo.get("created_at")),
        "Star Count": repo.get("stargazers_count", 0),
        "GitHub ID": repo.get("id"),
    }


def deduplicate_repositories(repos: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Deduplicate repositories by GitHub id, falling back to html_url."""
    unique: dict[str, dict[str, Any]] = {}

    for repo in repos:
        key = str(repo.get("id") or repo.get("html_url") or "").strip()
        if not key:
            continue
        unique[key] = repo

    return list(unique.values())


def write_csv(rows: list[dict[str, Any]], output_file: str) -> None:
    """Write repository rows to a CSV file."""
    fieldnames = [
        "Repository Name",
        "Owner/Author",
        "Description",
        "HTML URL",
        "Primary Language",
        "Created At Date",
        "Star Count",
    ]

    with open(output_file, "w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fieldnames})


def main() -> None:
    """Run both discovery methods, deduplicate results, and export CSV output."""
    session = requests.Session()
    session.headers.update(build_headers())

    org_repos = fetch_org_repositories(session)
    search_repos = search_keyword_repositories(session)

    all_repos = org_repos + search_repos
    unique_repos = deduplicate_repositories(all_repos)

    rows = [extract_repository_fields(repo) for repo in unique_repos]
    rows.sort(key=lambda row: (row["Owner/Author"].lower(), row["Repository Name"].lower()))

    write_csv(rows, OUTPUT_FILE)

    print()
    print("Discovery complete.")
    print(f"Organization repositories fetched: {len(org_repos)}")
    print(f"Keyword search repositories fetched: {len(search_repos)}")
    print(f"Total unique projects found: {len(rows)}")
    print(f"CSV exported to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
