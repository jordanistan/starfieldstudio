#!/usr/bin/env python3
"""Compare the fixed Starfield Pages review with the reviewed artifact."""

from __future__ import annotations

import argparse
from contextlib import contextmanager
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import time
from typing import Callable
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://jordanistan.github.io/starfieldstudio/"
PUBLIC_FILES = (
    "index.html",
    "privacy.html",
    "robots.txt",
    "sitemap.xml",
    "site-assets/favicon.svg",
    "site-assets/hero.svg",
    "site-assets/site.css",
    "site-assets/site.js",
    "site-assets/study-1.svg",
    "site-assets/study-2.svg",
    "site-assets/study-3.svg",
    "_headers",
)
CONTROL_FILES = (".nojekyll",)
EXPECTED_ARTIFACT = frozenset((*PUBLIC_FILES, *CONTROL_FILES))
URLS = {
    path: BASE_URL if path == "index.html" else BASE_URL + path
    for path in PUBLIC_FILES
}
ENDPOINTS = frozenset(URLS.values())
CONTENT_TYPES = {
    ".html": frozenset({"text/html"}),
    ".txt": frozenset({"text/plain"}),
    ".xml": frozenset({"application/xml", "text/xml"}),
    ".svg": frozenset({"image/svg+xml"}),
    ".css": frozenset({"text/css"}),
    ".js": frozenset({"application/javascript", "text/javascript"}),
    "": frozenset({"application/octet-stream", "text/plain"}),
}
LIMITS = {
    path: 512 * 1024 if Path(path).suffix in {".html", ".svg"} else 256 * 1024
    for path in PUBLIC_FILES
}
TIMEOUT_SECONDS = 20


class LiveReviewError(RuntimeError):
    """The public Pages review differs from the reviewed artifact."""


def validate_url(url: str) -> None:
    if url not in ENDPOINTS:
        raise LiveReviewError("endpoint changed")
    if "\\" in url or "%" in url or any(ord(character) < 0x21 for character in url):
        raise LiveReviewError("endpoint contains ambiguous data")
    parsed = urlsplit(url)
    try:
        port = parsed.port
    except ValueError as exc:
        raise LiveReviewError(f"invalid endpoint port: {exc}") from exc
    if parsed.scheme != "https" or parsed.hostname != "jordanistan.github.io":
        raise LiveReviewError("endpoint origin changed")
    if parsed.username is not None or parsed.password is not None or port is not None:
        raise LiveReviewError("endpoint contains credentials or an explicit port")
    if parsed.query or parsed.fragment or "/../" in parsed.path or "/./" in parsed.path:
        raise LiveReviewError("endpoint contains an unreviewed component")
    if not parsed.path.startswith("/starfieldstudio/"):
        raise LiveReviewError("repository path changed")


class ExactRedirectHandler(HTTPRedirectHandler):
    max_redirections = 2
    max_repeats = 1

    def __init__(self, expected: str) -> None:
        super().__init__()
        self.expected = expected

    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: ANN001
        validate_url(newurl)
        if newurl != self.expected:
            raise LiveReviewError("redirect destination changed")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def _read_bounded(response, limit: int) -> bytes:  # noqa: ANN001
    declared_length = response.headers.get("Content-Length")
    if declared_length is not None:
        try:
            declared = int(declared_length)
        except ValueError as exc:
            raise LiveReviewError("invalid Content-Length") from exc
        if declared < 0 or declared > limit:
            raise LiveReviewError("declared response exceeds byte limit")
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = response.read(min(64 * 1024, limit + 1 - total))
        if not chunk:
            return b"".join(chunks)
        total += len(chunk)
        if total > limit:
            raise LiveReviewError("streamed response exceeds byte limit")
        chunks.append(chunk)


def fetch_file(path: str, *, opener=None) -> bytes:
    if path not in PUBLIC_FILES:
        raise LiveReviewError("artifact path changed")
    url = URLS[path]
    validate_url(url)
    if opener is None:
        opener = build_opener(ExactRedirectHandler(url))
    expected_types = CONTENT_TYPES[Path(path).suffix]
    request = Request(
        url,
        method="GET",
        headers={
            "Accept": ", ".join(sorted(expected_types)),
            "Accept-Encoding": "identity",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "User-Agent": "starfieldstudio-live-review/1.0",
        },
    )
    try:
        with opener.open(request, timeout=TIMEOUT_SECONDS) as response:
            status = getattr(response, "status", None) or response.getcode()
            if status != 200:
                raise LiveReviewError(f"{path}: unexpected HTTP status {status}")
            if response.geturl() != url:
                raise LiveReviewError(f"{path}: final endpoint changed")
            content_type = response.headers.get_content_type()
            if content_type not in expected_types:
                raise LiveReviewError(f"{path}: unexpected content type {content_type}")
            return _read_bounded(response, LIMITS[path])
    except LiveReviewError:
        raise
    except OSError as exc:
        raise LiveReviewError(f"{path}: request failed") from exc


def verify_local_inventory(root: Path = ROOT) -> None:
    inventory = {
        str(candidate.relative_to(root))
        for candidate in root.rglob("*")
        if candidate.is_file()
    }
    if inventory != EXPECTED_ARTIFACT:
        missing = sorted(EXPECTED_ARTIFACT - inventory)
        extra = sorted(inventory - EXPECTED_ARTIFACT)
        raise LiveReviewError(f"artifact inventory changed: missing={missing}; extra={extra}")
    for path in EXPECTED_ARTIFACT:
        candidate = root / path
        if not candidate.is_file() or candidate.is_symlink():
            raise LiveReviewError(f"missing or unsafe reviewed file: {path}")


def verify_file(path: str, data: bytes, *, root: Path = ROOT) -> str:
    expected = (root / path).read_bytes()
    if data != expected:
        raise LiveReviewError(f"{path}: live bytes differ from the reviewed file")
    return hashlib.sha256(data).hexdigest()


def run(*, opener=None, root: Path) -> dict[str, object]:
    verify_local_inventory(root)
    hashes: dict[str, str] = {}
    total = 0
    for path in PUBLIC_FILES:
        data = fetch_file(path, opener=opener)
        total += len(data)
        hashes[path] = verify_file(path, data, root=root)
    return {"base_url": BASE_URL, "files": len(hashes), "bytes": total, "sha256": hashes}


@contextmanager
def checked_artifact(repo_root: Path = ROOT):
    """Stage and validate the exact artifact used by the Pages workflow."""
    with tempfile.TemporaryDirectory() as directory:
        staged = Path(directory) / "review"
        try:
            subprocess.run(
                [sys.executable, str(repo_root / "scripts/stage_review.py"), str(staged)],
                check=True,
            )
            subprocess.run(
                [sys.executable, str(repo_root / "scripts/check_review.py"), str(staged)],
                check=True,
            )
        except subprocess.CalledProcessError as exc:
            raise LiveReviewError("review artifact validation failed") from exc
        verify_local_inventory(staged)
        yield staged


def run_with_retries(
    *,
    attempts: int,
    delay: float,
    attempt: Callable[[], dict[str, object]] | None = None,
    sleeper: Callable[[float], None] = time.sleep,
) -> dict[str, object]:
    if not 1 <= attempts <= 12:
        raise LiveReviewError("attempt count must be between 1 and 12")
    if not 0 <= delay <= 60:
        raise LiveReviewError("retry delay must be between 0 and 60 seconds")
    attempt_fn = attempt
    if attempt_fn is None:
        def checked_attempt() -> dict[str, object]:
            with checked_artifact() as staged:
                return run(root=staged)
        attempt_fn = checked_attempt
    last_error: LiveReviewError | None = None
    for attempt_number in range(1, attempts + 1):
        try:
            return attempt_fn()
        except LiveReviewError as exc:
            last_error = exc
            if attempt_number < attempts:
                sleeper(delay)
    assert last_error is not None
    raise last_error


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--attempts", type=int, default=1)
    parser.add_argument("--delay", type=float, default=0)
    args = parser.parse_args(argv)
    evidence = run_with_retries(attempts=args.attempts, delay=args.delay)
    print("Starfield Pages live review passed: " + json.dumps(evidence, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
