#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies..."
npm install

echo "Building Angular application..."
npm run build

echo "Build complete. The server will start using 'npm run serve:ssr:app'."
