#!/bin/bash
set -e

# Install GitHub CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt-get update && sudo apt-get install -y gh

# Authenticate gh CLI using .env token (if present)
if [ -f /workspaces/molkky-score/.env ]; then
  export $(cat /workspaces/molkky-score/.env | xargs)
  if [ -n "$GITHUB_TOKEN" ]; then
    gh auth login --with-token <<< "$GITHUB_TOKEN"
  fi
fi

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
