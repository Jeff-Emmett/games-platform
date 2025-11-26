#!/bin/bash

# Development environment startup script

echo "=================================="
echo "Games Platform - Development Mode"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env from example..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo "⚠ Please review .env and update as needed"
fi

# Start services
echo ""
echo "Starting development environment..."
docker-compose up --build

# Cleanup function
cleanup() {
    echo ""
    echo "Stopping services..."
    docker-compose down
}

# Register cleanup on exit
trap cleanup EXIT
