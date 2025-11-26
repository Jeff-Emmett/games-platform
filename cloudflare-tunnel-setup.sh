#!/bin/bash

# Cloudflare Tunnel Setup for Games Platform
# Run this script AFTER creating the tunnel in Cloudflare dashboard

set -e

echo "=========================================="
echo "Cloudflare Tunnel Setup - Games Platform"
echo "=========================================="
echo ""
echo "This script will complete the Cloudflare Tunnel setup."
echo ""
echo "Prerequisites:"
echo "1. You must have created a tunnel in Cloudflare dashboard"
echo "2. You need the tunnel token from Cloudflare"
echo ""
echo "Go to: https://one.dash.cloudflare.com/"
echo "Navigate to: Networks > Tunnels > Create a tunnel"
echo ""
read -p "Press Enter when you have your tunnel token ready..."
echo ""

# Get tunnel token
read -p "Paste your Cloudflare tunnel token (starts with 'eyJ...'): " TUNNEL_TOKEN

if [ -z "$TUNNEL_TOKEN" ]; then
    echo "Error: No token provided"
    exit 1
fi

echo ""
echo "Installing tunnel on RS 8000..."

ssh netcup << ENDSSH
set -e

echo "Installing cloudflared service..."
cloudflared service install $TUNNEL_TOKEN

echo "Starting cloudflared service..."
systemctl start cloudflared
systemctl enable cloudflared

echo "Checking service status..."
sleep 2
systemctl status cloudflared --no-pager

echo ""
echo "=========================================="
echo "Cloudflare Tunnel Installed!"
echo "=========================================="
echo ""
echo "Your games platform should now be accessible at:"
echo "  https://games.jeffemmett.com"
echo ""
echo "Useful commands:"
echo "  Check status: systemctl status cloudflared"
echo "  View logs:    journalctl -u cloudflared -f"
echo "  Restart:      systemctl restart cloudflared"
echo ""
ENDSSH

echo ""
echo "✓ Setup complete!"
echo ""
echo "Testing connection..."
sleep 5
curl -s -o /dev/null -w "Status: %{http_code}\n" https://games.jeffemmett.com || echo "Site might need a moment to come online..."
echo ""
