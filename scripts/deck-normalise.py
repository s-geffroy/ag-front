#!/usr/bin/env python3
"""Make a generated .pptx / .pdf byte-reproducible. Runs inside the `slides` container (ADR 0073).

`presentations/` is versioned, so a rebuild that changes nothing must produce no diff. Three sources of
nondeterminism have to be removed, and the order matters:

  .pptx  — pptxgenjs stamps `dcterms:created`/`dcterms:modified` in docProps/core.xml with the wall
           clock, and the ZIP container carries a per-entry mtime. Both are rewritten to a fixed
           timestamp derived from the build date the operator declared.

  .pdf   — LibreOffice writes /CreationDate, /ModDate and a random trailer /ID. Metadata is fixed with
           pypdf FIRST, then qpdf computes a content-derived /ID LAST. Doing it the other way round —
           which is the intuitive order — silently undoes the deterministic ID, because pypdf rewrites
           the trailer it just fixed.

Usage:  deck-normalise.py --date YYYY-MM-DD [--pptx FILE] [--pdf FILE]
"""

from __future__ import annotations

import argparse
import io
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

CORE_XML = "docProps/core.xml"


def _fix_core_dates(data: bytes, iso: str) -> bytes:
    """Pin `dcterms:created` / `dcterms:modified` in an OOXML core.xml. Nothing else is touched."""
    text = data.decode("utf-8")
    text = re.sub(
        r"(<dcterms:(?:created|modified)[^>]*>)[^<]*(</dcterms:(?:created|modified)>)",
        rf"\g<1>{iso}\g<2>",
        text,
    )
    return text.encode("utf-8")


def _rewrite_zip(data: bytes, iso: str, zip_date: tuple[int, int, int, int, int, int]) -> bytes:
    """Rebuild an OOXML zip with fixed entry timestamps and a pinned core.xml, order preserved."""
    with zipfile.ZipFile(io.BytesIO(data)) as inner:
        entries = [(i, inner.read(i.filename)) for i in inner.infolist()]

    out = io.BytesIO()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as dst:
        for info, payload in entries:
            if info.filename == CORE_XML:
                payload = _fix_core_dates(payload, iso)
            fixed = zipfile.ZipInfo(info.filename, date_time=zip_date)
            fixed.compress_type = info.compress_type
            fixed.external_attr = info.external_attr
            fixed.create_system = 3  # constant, rather than whatever host wrote the archive
            dst.writestr(fixed, payload)
    return out.getvalue()


def normalise_pptx(path: Path, iso: str, zip_date: tuple[int, int, int, int, int, int]) -> None:
    """Normalise the deck AND any OOXML package embedded inside it.

    The recursion is not theoretical: a native pptxgenjs chart embeds its data as
    `ppt/embeddings/*.xlsx`, a full OOXML package with its OWN docProps/core.xml and its own JSZip
    entry dates. Normalising only the outer container leaves both, and the deck with a chart stays
    non-reproducible while every other artifact is already stable — which is exactly how this surfaced.
    """
    src = zipfile.ZipFile(path)
    entries = [(info, src.read(info.filename)) for info in src.infolist()]
    src.close()

    out = path.with_suffix(".pptx.tmp")
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as dst:
        for info, data in entries:
            if info.filename.endswith((".xlsx", ".docx", ".pptx")):
                data = _rewrite_zip(data, iso, zip_date)
            elif info.filename == CORE_XML:
                data = _fix_core_dates(data, iso)
            fixed = zipfile.ZipInfo(info.filename, date_time=zip_date)
            fixed.compress_type = info.compress_type
            fixed.external_attr = info.external_attr
            fixed.create_system = 3
            dst.writestr(fixed, data)
    out.replace(path)


def normalise_pdf(path: Path, stamp: str, title: str) -> None:
    from pypdf import PdfReader, PdfWriter

    with tempfile.TemporaryDirectory() as tmp:
        staged = Path(tmp) / "meta.pdf"

        reader = PdfReader(str(path))
        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        writer.add_metadata(
            {
                "/Title": title,
                "/Author": "Applied Geopolitics",
                "/Creator": "app-geo scripts/build-deck.sh",
                "/Producer": "app-geo scripts/build-deck.sh",
                "/CreationDate": stamp,
                "/ModDate": stamp,
            }
        )
        with staged.open("wb") as fh:
            writer.write(fh)

        # LAST, so nothing rewrites the trailer afterwards.
        final = Path(tmp) / "final.pdf"
        subprocess.run(
            ["qpdf", "--deterministic-id", "--linearize", str(staged), str(final)],
            check=True,
        )
        shutil.copyfile(final, path)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", required=True, help="build date, YYYY-MM-DD")
    ap.add_argument("--pptx", type=Path)
    ap.add_argument("--pdf", type=Path)
    ap.add_argument("--title", default="Applied Geopolitics")
    args = ap.parse_args()

    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.date):
        print(f"--date must be YYYY-MM-DD (got {args.date!r})", file=sys.stderr)
        return 2

    y, m, d = (int(p) for p in args.date.split("-"))
    iso = f"{args.date}T00:00:00Z"
    zip_date = (y, m, d, 0, 0, 0)
    pdf_stamp = f"D:{y:04d}{m:02d}{d:02d}000000Z"

    if args.pptx:
        normalise_pptx(args.pptx, iso, zip_date)
        print(f"[normalise] pptx {args.pptx.name}")
    if args.pdf:
        normalise_pdf(args.pdf, pdf_stamp, args.title)
        print(f"[normalise] pdf  {args.pdf.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
