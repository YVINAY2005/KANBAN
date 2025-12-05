#!/bin/bash
set -e

echo "Installing pnpm globally..."
npm install -g pnpm

echo "Navigating to frontend directory..."
cd frontend

echo "Installing dependencies..."
pnpm install

echo "Building application..."
pnpm build

echo "Build completed successfully!"
