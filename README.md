# Games Platform - games.jeffemmett.com

A self-hosted retro gaming platform with browser-based emulation, game library management, and automated game installation.

## Features

- **Game Library**: Beautiful thumbnail-based UI for browsing your game collection
- **Browser Emulation**: Play games directly in the browser using EmulatorJS
- **Multi-Platform Support**: PS1, PS2, N64, SNES, GBA, NES, Genesis, and more
- **Game Request System**: Users can request games, triggering automated installation
- **Automated Installation**: Pipeline to fetch, verify, and install requested games
- **Metadata Management**: Rich game information, covers, screenshots
- **User Accounts**: Track favorites, play history, save states

## Architecture

```
games-platform/
├── frontend/          # React + TypeScript UI
├── backend/           # FastAPI game management API
├── emulator/          # EmulatorJS integration
├── worker/            # Game installation worker service
├── database/          # PostgreSQL schemas and migrations
└── docker/            # Docker Compose setup
```

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: FastAPI (Python), SQLAlchemy
- **Database**: PostgreSQL
- **Emulation**: EmulatorJS (RetroArch WASM)
- **Storage**: Local filesystem + Cloudflare R2 (optional)
- **Deployment**: Docker Compose on Netcup RS 8000

## Supported Platforms

- PlayStation 1 (PSX)
- PlayStation 2 (PS2 via browser limitations - experimental)
- Nintendo 64 (N64)
- Super Nintendo (SNES)
- Game Boy Advance (GBA)
- Game Boy Color (GBC)
- NES
- Sega Genesis
- Sega Dreamcast
- And more...

## Quick Start

```bash
# Clone and setup
cd /home/jeffe/Github/games-platform

# Start with Docker Compose
docker-compose up -d

# Access at http://games.jeffemmett.com
```

## Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Deployment

Deploys to Netcup RS 8000 via Docker Compose with:
- Nginx reverse proxy
- PostgreSQL database
- Redis for job queues
- Game storage volumes
