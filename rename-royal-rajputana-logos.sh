#!/usr/bin/env bash

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
LOGO_DIR="$ROOT/public/assets/logos"

cd "$LOGO_DIR"

echo "Royal Rajputana Matrimony logo cleanup"
echo "--------------------------------------"

move_if_exists() {
  local old="$1"
  local new="$2"

  if [ -f "$old" ]; then
    mv "$old" "$new"
    echo "✓ $old"
    echo "  -> $new"
  else
    echo "• skipped: $old"
  fi
}

remove_if_exists() {
  local file="$1"

  if [ -f "$file" ]; then
    rm "$file"
    echo "✓ removed duplicate: $file"
  fi
}

# --------------------------------------------------
# Rename original unique logo assets
# --------------------------------------------------

move_if_exists \
  "ChatGPT Image Oct 15, 2026, 06_16_30 PM-1.png" \
  "royal-rajputana-logo-white-wide.png"

move_if_exists \
  "ChatGPT Image Oct 15, 2026, 06_16_36 PM-2.png" \
  "royal-rajputana-logo-white-stacked.png"

move_if_exists \
  "ChatGPT Image Oct 15, 2026, 06_16_46 PM-3.png" \
  "royal-rajputana-emblem-white.png"

move_if_exists \
  "ChatGPT Image Oct 15, 2026, 06_16_49 PM-4.png" \
  "royal-rajputana-app-icon.png"

move_if_exists \
  "ChatGPT Image Oct 15, 2026, 06_16_53 PM-5.png" \
  "royal-rajputana-logo-white-horizontal.png"

move_if_exists \
  "Royal Rajputana Matrimony Emblem.png" \
  "royal-rajputana-emblem-primary.png"

# --------------------------------------------------
# Remove exact duplicate second export set
# --------------------------------------------------

remove_if_exists \
  "ChatGPT Image Oct 15, 2026, 06_29_43 PM-1.png"

remove_if_exists \
  "ChatGPT Image Oct 15, 2026, 06_29_47 PM-2.png"

remove_if_exists \
  "ChatGPT Image Oct 15, 2026, 06_29_50 PM-3.png"

remove_if_exists \
  "ChatGPT Image Oct 15, 2026, 06_29_55 PM-4.png"

remove_if_exists \
  "ChatGPT Image Oct 15, 2026, 06_29_58 PM-5.png"

echo
echo "Final logo directory:"
echo "--------------------------------------"

ls -lh

echo
echo "Git changes:"
echo "--------------------------------------"

cd "$ROOT"

git status --short public/assets/logos

echo
echo "Logo cleanup complete."