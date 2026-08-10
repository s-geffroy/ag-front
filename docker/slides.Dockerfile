# syntax=docker/dockerfile:1
#
# `slides` service — the ONLY place LibreOffice, poppler and the vendored `pptx` /
# `pdf` skill scripts run. Deliberately NOT folded into the tools image: it adds
# several hundred MB of office stack that every routine `npm install` would
# otherwise pay for, and it is needed only when a plaquette is (re)generated.
# See docs/decisions/0073-generateur-de-plaquettes.md.
#
#   docker compose -f docker/docker-compose.yml build tools   # must exist first
#   docker compose -f docker/docker-compose.yml build slides
FROM app-geo-tools:local

# libreoffice-impress: pptx -> pdf, the single conversion path (no second renderer).
# poppler-utils: pdftoppm, used by the pptx skill's thumbnail/QA flow.
# qpdf: deterministic PDF normalisation — presentations/ is versioned, so a rebuild
#       that changes only the creation date would pollute the history.
RUN apt-get update && apt-get install -y --no-install-recommends \
      libreoffice-impress \
      poppler-utils qpdf \
      python3 python3-venv \
      fontconfig \
    && rm -rf /var/lib/apt/lists/*

# Python deps of the vendored skills — a deliberate SUBSET. We author the deck with
# pptxgenjs and only ever validate / convert / thumbnail / normalise here, so the OCR
# and PDF-authoring halves of the `pdf` skill (pytesseract, pdf2image, reportlab) and
# markitdown are all left out. A venv because bookworm's python3 is PEP-668 managed.
ENV VIRTUAL_ENV=/opt/venv
ENV PATH=/opt/venv/bin:$PATH
# ENV alone is not enough: a LOGIN shell (`bash -lc …`) re-sources /etc/profile and clobbers PATH, so
# `python3` silently becomes the system one and every skill import fails with ModuleNotFoundError.
# Belt and braces, because that failure reads like a broken pip install rather than a PATH problem.
RUN printf 'PATH=/opt/venv/bin:$PATH\nexport PATH\n' > /etc/profile.d/10-venv.sh
RUN python3 -m venv "$VIRTUAL_ENV" \
 && pip install --no-cache-dir \
      lxml==5.3.0 \
      defusedxml==0.7.1 \
      Pillow==11.1.0 \
      pypdf==5.1.0 \
      pdfplumber==0.11.5 \
      fonttools==4.55.3

# House fonts as STATIC TTFs.
#
# Two traps this step exists to avoid:
#  1. @fontsource* in node_modules ships woff2 ONLY — unusable by LibreOffice and by
#     PowerPoint alike. The fonts have to come from somewhere else.
#  2. google/fonts ships Inter and Fraunces as VARIABLE fonts only, and LibreOffice
#     renders a variable font at its default instance while faking the other weights.
#     Faux-bold Fraunces on a title is exactly the drift the PDF is meant to remove,
#     so we instantiate real static cuts with fonttools instead of shipping the .vf.
#
# IBM Plex Mono already has static cuts upstream — take them as-is.
#
# The pinned coordinates are not free choices: `--update-name-table` refuses any value the font's STAT
# table does not name, so they must be nominal. Fraunces names opsz 9 / 72 / 144 only — 72pt is both the
# valid one and the right one, since it is the display cut and slide titles are display type.
ARG GOOGLE_FONTS=https://raw.githubusercontent.com/google/fonts/main/ofl
ARG FONTDIR=/usr/local/share/fonts/applied-geopolitics
RUN set -eux; \
    mkdir -p /tmp/vf "$FONTDIR"; \
    curl -fsSL -o /tmp/vf/Inter.ttf \
      "$GOOGLE_FONTS/inter/Inter%5Bopsz%2Cwght%5D.ttf"; \
    curl -fsSL -o /tmp/vf/Fraunces.ttf \
      "$GOOGLE_FONTS/fraunces/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf"; \
    for w in 400 600 700; do \
      fonttools varLib.instancer --update-name-table \
        -o "$FONTDIR/Inter-$w.ttf" /tmp/vf/Inter.ttf "wght=$w" "opsz=14"; \
    done; \
    for w in 600 700; do \
      fonttools varLib.instancer --update-name-table \
        -o "$FONTDIR/Fraunces-$w.ttf" /tmp/vf/Fraunces.ttf \
        "wght=$w" "opsz=72" "SOFT=0" "WONK=0"; \
    done; \
    for s in Regular Medium SemiBold Bold; do \
      curl -fsSL -o "$FONTDIR/IBMPlexMono-$s.ttf" \
        "$GOOGLE_FONTS/ibmplexmono/IBMPlexMono-$s.ttf"; \
    done; \
    rm -rf /tmp/vf; \
    chmod -R a+rX "$FONTDIR"; \
    fc-cache -f

# Fail the BUILD, not the deck. A missing family makes LibreOffice substitute in
# silence: the conversion still "succeeds" and the PDF quietly stops matching the
# .pptx. Catch it here, where it is a red build instead of a wrong deliverable.
RUN set -eux; \
    for fam in "Inter" "Fraunces" "IBM Plex Mono"; do \
      fc-list : family | tr ',' '\n' | sed 's/^ *//; s/ *$//' | grep -qx "$fam" \
        || { echo "FATAL: font family '$fam' is missing — LibreOffice would substitute silently"; exit 1; }; \
    done

# Degraded-client rendering for the substitution QA (ADR 0073 §6.3). Opt-in only:
#   FONTCONFIG_FILE=/etc/fonts/fontconfig-substitution-qa.xml
COPY docker/fontconfig-substitution-qa.xml /etc/fonts/fontconfig-substitution-qa.xml

WORKDIR /workspace
CMD ["bash"]
