#!/usr/bin/env bash
# Verificación integral pre-commit: lint, build (type-check) y tests.
set -euo pipefail

echo "==> Running lint..."
npm run lint

echo "==> Running build (type-check + compile)..."
npm run build

echo "==> Running tests..."
npm run test

echo "==> All checks passed."
