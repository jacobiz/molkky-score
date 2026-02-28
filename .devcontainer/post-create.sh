#!/bin/bash
set -e

# Install project dependencies
npm install

# Install Claude Code
curl -fsSL https://claude.ai/install.sh | bash

# Copy Claude credentials from host (mounted at /tmp/host-claude)
if [ -f /tmp/host-claude/.credentials.json ]; then
  mkdir -p ~/.claude
  cp /tmp/host-claude/.credentials.json ~/.claude/.credentials.json
fi

# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install speckit
~/.local/bin/uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
