#!/usr/bin/env bash
set -euo pipefail
echo "Installing FE dependencies with npm..."
npm install
echo "Building frontend..."
npm run build
echo "Build complete. Output in dist/"
