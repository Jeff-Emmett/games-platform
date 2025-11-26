#!/bin/bash

# Games Platform Deployment Script
# Deploy to Netcup RS 8000 server

set -e

echo "=================================="
echo "Games Platform Deployment"
echo "=================================="
echo ""

# Configuration
REMOTE_HOST="netcup"
REMOTE_USER="root"
DEPLOY_DIR="/opt/apps/games-platform"
DOMAIN="games.jeffemmett.com"

echo "Deployment Configuration:"
echo "  Remote Host: $REMOTE_HOST"
echo "  Deploy Directory: $DEPLOY_DIR"
echo "  Domain: $DOMAIN"
echo ""

# Confirm deployment
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

echo ""
echo "Step 1: Pushing to Gitea..."
git add .
git commit -m "Deploy games platform" || true
git push gitea main

echo ""
echo "Step 2: Connecting to RS 8000..."
ssh $REMOTE_HOST << 'ENDSSH'
set -e

# Create deployment directory
sudo mkdir -p /opt/apps/games-platform
cd /opt/apps/games-platform

# Clone or update repository
if [ -d ".git" ]; then
    echo "Updating repository..."
    git pull origin main
else
    echo "Cloning repository..."
    git clone https://gitea.jeffemmett.com/jeffemmett/games-platform.git .
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    # Generate random password
    DB_PASSWORD=$(openssl rand -base64 32)
    sed -i "s/changeme123/$DB_PASSWORD/g" .env
    echo "✓ Created .env with random database password"
fi

# Create data directories
echo "Creating data directories..."
sudo mkdir -p /data/games/{ps1,ps2,n64,snes,gba,gbc,nes,genesis,dreamcast,psp}
sudo chown -R $USER:$USER /data/games

# Build and start containers
echo "Building and starting containers..."
docker-compose down || true
docker-compose up -d --build

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 10

# Check health
echo "Checking service health..."
docker-compose ps

# Test backend
if curl -f http://localhost:8001/health > /dev/null 2>&1; then
    echo "✓ Backend is healthy"
else
    echo "✗ Backend health check failed"
    docker-compose logs backend
    exit 1
fi

# Test frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Frontend is healthy"
else
    echo "✗ Frontend health check failed"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "=================================="
echo "Deployment Complete!"
echo "=================================="
echo ""
echo "Access your games platform at:"
echo "  http://games.jeffemmett.com"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Restart:          docker-compose restart"
echo "  Stop:             docker-compose down"
echo "  Database access:  docker-compose exec postgres psql -U games_user games_platform"
echo ""
ENDSSH

echo ""
echo "✓ Deployment successful!"
echo ""
