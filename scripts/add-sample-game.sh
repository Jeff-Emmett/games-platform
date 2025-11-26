#!/bin/bash

# Script to add a sample game for testing
# Usage: ./scripts/add-sample-game.sh

API_URL="http://localhost:8001"

echo "Adding sample game: General Chaos (Sega Genesis)"
echo ""

# Create sample game entry
curl -X POST "$API_URL/api/games" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "General Chaos",
    "platform_id": 7,
    "description": "A fast-paced action-strategy game where you control a squad of soldiers in chaotic battles. Features intense combat, multiple weapons, and hilarious animations.",
    "release_year": 1994,
    "publisher": "Electronic Arts",
    "developer": "Game Refuge Inc.",
    "genre": "Action/Strategy",
    "rom_path": "/data/games/genesis/general_chaos.bin",
    "file_size": 1048576,
    "cover_image": "https://via.placeholder.com/300x400?text=General+Chaos"
  }'

echo ""
echo ""
echo "Sample game added! You can now:"
echo "1. Copy a General Chaos ROM to /data/games/genesis/general_chaos.bin"
echo "2. View it at http://localhost:3000"
echo "3. Click to play in the browser!"
