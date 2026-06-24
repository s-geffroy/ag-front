# syntax=docker/dockerfile:1
#
# `tools` service — single Docker entry point for ALL project tooling
# (npm workspaces, builds, tests, agent-browser). Per CLAUDE.md, nothing
# runs on the host. See docs/decisions/0002-docker-tools-service.md.
# Pinned by digest-equivalent tag for reproducibility (matches the engines field, Node 22).
FROM node:22.23.0-bookworm-slim

# Runtime libraries needed by the headless Chromium that agent-browser drives.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl git \
      libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
      libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
      libgbm1 libasound2 libpango-1.0-0 libcairo2 libatspi2.0-0 \
      fonts-liberation fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# agent-browser CLI (pinned) baked into the image (binary in /usr/local/bin, world-readable).
RUN npm install -g agent-browser@0.27.0

# The container runs as the host-mapped UID/GID at runtime (compose `user:`),
# which is NOT a user known to the image. Give it a world-writable HOME and
# keep heavy caches inside the mounted workspace so they persist across `--rm`.
RUN mkdir -p /home/tools && chmod 0777 /home/tools
ENV HOME=/home/tools \
    npm_config_cache=/home/tools/.npm \
    npm_config_update_notifier=false \
    XDG_CACHE_HOME=/workspace/.cache

# Bake the Chromium that agent-browser drives INTO the image (HOME is set above, so it lands in
# /home/tools/.agent-browser). Honours the Docker-only rule: a fresh image needs no network for QA.
# a+rwX (not just a+rX): the host-mapped runtime UID must both launch the baked browser AND write its
# control socket into this dir, which the build created as root.
RUN agent-browser install && chmod -R a+rwX /home/tools/.agent-browser

WORKDIR /workspace

CMD ["bash"]
