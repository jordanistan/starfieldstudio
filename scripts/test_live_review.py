#!/usr/bin/env python3
"""Offline tests for the fixed-origin Starfield Pages verifier."""

from email.message import Message
import io
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from urllib.request import Request

from check_live_review import (
    BASE_URL,
    CONTENT_TYPES,
    ENDPOINTS,
    EXPECTED_ARTIFACT,
    LIMITS,
    PUBLIC_FILES,
    TIMEOUT_SECONDS,
    URLS,
    ExactRedirectHandler,
    LiveReviewError,
    fetch_file,
    run,
    run_with_retries,
    validate_url,
    verify_file,
    verify_local_inventory,
)


class FakeResponse:
    def __init__(
        self,
        body: bytes,
        *,
        url: str,
        content_type: str,
        status: int = 200,
        content_length: str | None = None,
    ) -> None:
        self.status = status
        self._url = url
        self._stream = io.BytesIO(body)
        self.headers = Message()
        self.headers["Content-Type"] = content_type
        if content_length is not None:
            self.headers["Content-Length"] = content_length

    def getcode(self) -> int:
        return self.status

    def geturl(self) -> str:
        return self._url

    def read(self, size: int = -1) -> bytes:
        return self._stream.read(size)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback) -> None:  # noqa: ANN001
        return None


class FakeOpener:
    def __init__(self, responses: list[FakeResponse]) -> None:
        self.responses = iter(responses)
        self.requests: list[tuple[Request, int | float | None]] = []

    def open(self, request: Request, timeout=None):  # noqa: ANN001
        self.requests.append((request, timeout))
        return next(self.responses)


def response_for(path: str, body: bytes) -> FakeResponse:
    content_type = sorted(CONTENT_TYPES[Path(path).suffix])[0]
    return FakeResponse(body, url=URLS[path], content_type=content_type)


class EndpointTests(unittest.TestCase):
    def test_only_exact_review_endpoints_are_allowed(self) -> None:
        for endpoint in ENDPOINTS:
            validate_url(endpoint)
        invalid = [
            "http://jordanistan.github.io/starfieldstudio/",
            "https://evil.example/starfieldstudio/",
            "https://user@jordanistan.github.io/starfieldstudio/",
            "https://jordanistan.github.io:443/starfieldstudio/",
            f"{BASE_URL}?x=1",
            f"{BASE_URL}#review",
            "https://jordanistan.github.io/%73tarfieldstudio/",
            "https://jordanistan.github.io/starfieldstudio/../index.html",
        ]
        for endpoint in invalid:
            with self.subTest(endpoint=endpoint), self.assertRaises(LiveReviewError):
                validate_url(endpoint)

    def test_redirects_revalidate_the_exact_destination(self) -> None:
        handler = ExactRedirectHandler(BASE_URL)
        request = Request(BASE_URL)
        redirected = handler.redirect_request(request, None, 302, "Found", {}, BASE_URL)
        self.assertEqual(redirected.full_url, BASE_URL)
        with self.assertRaises(LiveReviewError):
            handler.redirect_request(request, None, 302, "Found", {}, URLS["privacy.html"])


class FetchTests(unittest.TestCase):
    def test_get_is_bounded_and_has_no_ambient_credentials(self) -> None:
        opener = FakeOpener([response_for("index.html", b"reviewed")])
        self.assertEqual(fetch_file("index.html", opener=opener), b"reviewed")
        request, timeout = opener.requests[0]
        headers = {key.casefold(): value for key, value in request.header_items()}
        self.assertEqual(request.get_method(), "GET")
        self.assertEqual(timeout, TIMEOUT_SECONDS)
        self.assertEqual(headers["accept-encoding"], "identity")
        self.assertEqual(headers["cache-control"], "no-cache")
        self.assertEqual(headers["pragma"], "no-cache")
        for forbidden in ("authorization", "cookie", "referer"):
            self.assertNotIn(forbidden, headers)

    def test_status_type_final_url_and_declared_size_are_strict(self) -> None:
        path = "index.html"
        url = URLS[path]
        cases = [
            FakeResponse(b"x", url=url, content_type="text/html", status=503),
            FakeResponse(b"x", url=url, content_type="application/json"),
            FakeResponse(b"x", url=URLS["privacy.html"], content_type="text/html"),
            FakeResponse(
                b"x",
                url=url,
                content_type="text/html",
                content_length=str(LIMITS[path] + 1),
            ),
            FakeResponse(b"x", url=url, content_type="text/html", content_length="bad"),
        ]
        for response in cases:
            with self.subTest(response=response), self.assertRaises(LiveReviewError):
                fetch_file(path, opener=FakeOpener([response]))

    def test_streamed_limit_is_enforced(self) -> None:
        path = "robots.txt"
        previous = LIMITS[path]
        LIMITS[path] = 4
        try:
            with self.assertRaises(LiveReviewError):
                fetch_file(path, opener=FakeOpener([response_for(path, b"12345")]))
        finally:
            LIMITS[path] = previous

    def test_unknown_artifact_path_is_rejected(self) -> None:
        with self.assertRaises(LiveReviewError):
            fetch_file("secrets.txt", opener=FakeOpener([]))


class ArtifactTests(unittest.TestCase):
    def test_staged_inventory_matches_the_verifier(self) -> None:
        root = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as directory:
            staged = Path(directory) / "review"
            subprocess.run(
                [sys.executable, str(root / "scripts/stage_review.py"), str(staged)],
                check=True,
            )
            inventory = {
                str(path.relative_to(staged))
                for path in staged.rglob("*")
                if path.is_file()
            }
            self.assertEqual(inventory, EXPECTED_ARTIFACT)
            verify_local_inventory(staged)

    def test_exact_bytes_are_required(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            path = "index.html"
            (root / path).write_bytes(b"reviewed")
            self.assertEqual(len(verify_file(path, b"reviewed", root=root)), 64)
            with self.assertRaises(LiveReviewError):
                verify_file(path, b"changed", root=root)

    def test_inventory_rejects_missing_files_and_symlinks(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for path in EXPECTED_ARTIFACT:
                candidate = root / path
                candidate.parent.mkdir(parents=True, exist_ok=True)
                candidate.write_bytes(path.encode())
            missing = root / "privacy.html"
            missing.unlink()
            with self.assertRaises(LiveReviewError):
                verify_local_inventory(root)
            missing.symlink_to(root / "index.html")
            with self.assertRaises(LiveReviewError):
                verify_local_inventory(root)

    def test_inventory_rejects_extra_files(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for path in EXPECTED_ARTIFACT:
                candidate = root / path
                candidate.parent.mkdir(parents=True, exist_ok=True)
                candidate.write_bytes(path.encode())
            (root / "unexpected.txt").write_text("not reviewed")
            with self.assertRaises(LiveReviewError):
                verify_local_inventory(root)

    def test_full_run_fetches_every_public_file_in_order(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for path in EXPECTED_ARTIFACT:
                candidate = root / path
                candidate.parent.mkdir(parents=True, exist_ok=True)
                candidate.write_bytes(path.encode())
            opener = FakeOpener(
                [response_for(path, path.encode()) for path in PUBLIC_FILES]
            )
            evidence = run(opener=opener, root=root)
            self.assertEqual(evidence["files"], len(PUBLIC_FILES))
            self.assertEqual(
                [request.full_url for request, _ in opener.requests],
                [URLS[path] for path in PUBLIC_FILES],
            )

    def test_workflow_keeps_live_requests_on_trusted_main_after_deploy(self) -> None:
        root = Path(__file__).resolve().parents[1]
        workflow = (root / ".github/workflows/review-pages.yml").read_text()
        self.assertIn("permissions:\n  contents: read", workflow)
        self.assertGreaterEqual(workflow.count("persist-credentials: false"), 2)
        self.assertIn("python3 scripts/test_live_review.py", workflow)
        self.assertIn("needs: deploy", workflow)
        self.assertGreaterEqual(workflow.count("github.ref == 'refs/heads/main'"), 2)
        self.assertIn("python3 scripts/check_live_review.py", workflow)
        self.assertIn("--attempts 6 --delay 20", workflow)
        self.assertLess(workflow.index("id: deploy"), workflow.index("verify_live:"))

    def test_retry_arguments_are_bounded_before_network_access(self) -> None:
        for attempts, delay in ((0, 0), (13, 0), (1, -1), (1, 61)):
            with self.subTest(attempts=attempts, delay=delay), self.assertRaises(LiveReviewError):
                run_with_retries(attempts=attempts, delay=delay)

    def test_retry_is_bounded_and_stops_after_success(self) -> None:
        calls = 0
        sleeps: list[float] = []

        def attempt() -> dict[str, object]:
            nonlocal calls
            calls += 1
            if calls < 3:
                raise LiveReviewError("cached prior deployment")
            return {"files": len(PUBLIC_FILES)}

        evidence = run_with_retries(
            attempts=6,
            delay=20,
            attempt=attempt,
            sleeper=sleeps.append,
        )
        self.assertEqual(evidence["files"], len(PUBLIC_FILES))
        self.assertEqual(calls, 3)
        self.assertEqual(sleeps, [20, 20])


if __name__ == "__main__":
    unittest.main()
