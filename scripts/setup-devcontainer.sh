#!/bin/bash

# Script to assist with DevContainer setup

set -e

# Change to the project root directory
cd "$(dirname "$0")/.."

if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker Desktop."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "Rebuilding DevContainer..."

# Rebuild the DevContainer
if command -v code &> /dev/null; then
    code --install-extension ms-vscode-remote.remote-containers
    code --install-extension ms-vscode.vscode-typescript-next
    code -r .
else
    echo "Visual Studio Code command (code) is not found. Please ensure VSCode is installed."
fi

# Provide necessary information
if [ -f .env ]; then
    echo "Environment file (.env) found."
else
    echo "No .env file found. Creating from .env.example."
cp .env.example .env
fi

# Output current Docker version
docker --version
