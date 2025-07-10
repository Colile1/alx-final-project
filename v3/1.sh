#!/bin/bash

# Define where Turso CLI was installed
TURSO_DIR="$HOME/.turso"
PROFILE_FILE="$HOME/.bashrc"

# 1. Add Turso to PATH if not already present
if ! grep -q 'export PATH="$HOME/.turso:$PATH"' "$PROFILE_FILE"; then
    echo 'Adding Turso CLI to PATH in .bashrc...'
    echo 'export PATH="$HOME/.turso:$PATH"' >> "$PROFILE_FILE"
    source "$PROFILE_FILE"
else
    echo 'Turso CLI already in PATH.'
fi

# 2. Verify Turso CLI
echo "Verifying Turso CLI..."
if command -v turso >/dev/null 2>&1; then
    echo "✅ Turso CLI is installed: $(turso --version)"
else
    echo "❌ Turso CLI is still not found. Please restart your terminal or run 'source ~/.bashrc'."
    exit 1
fi

# 3. Suggest login via CLI if browser not available
echo
echo "Next Step:"
echo "Run the following to authenticate your Turso CLI manually:"
echo "  turso auth login --no-browser"
