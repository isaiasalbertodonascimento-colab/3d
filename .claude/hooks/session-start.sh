#!/bin/bash
set -euo pipefail

# Only run in Claude Code cloud sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# Global tools: ffmpeg is needed to encode the final video
if ! command -v ffmpeg >/dev/null; then
  apt-get update
  apt-get install -y ffmpeg
fi

# Python deps for make_music.py (system Python, no requirements file)
if ! python3 -I -c 'import numpy, scipy' 2>/dev/null; then
  python3 -m pip install numpy scipy
fi

# npm deps (three, fonts) — only reinstall when manifests or this script change
hashes=node_modules/.session-start.sha256
if ! sha256sum --check --status "$hashes" 2>/dev/null; then
  rm -f "$hashes"
  npm install
  sha256sum .claude/hooks/session-start.sh package.json package-lock.json > "$hashes" || rm -f "$hashes"
fi
