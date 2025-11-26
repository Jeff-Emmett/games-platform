# Games Platform - Project Summary

## Overview

A self-hosted retro gaming platform that allows you to play classic games directly in your browser. Features a beautiful game library UI, browser-based emulation via EmulatorJS, and an automated game request system.

**Live URL**: https://games.jeffemmett.com

## Key Features

### 1. Game Library
- Beautiful grid layout with game cover thumbnails
- Search and filter by platform
- Game metadata (title, publisher, release year, genre)
- Play count tracking
- Favorites system

### 2. Browser-Based Emulation
- Play games directly in the browser (no downloads needed)
- Powered by EmulatorJS (RetroArch WASM cores)
- Keyboard and gamepad support
- Save states and screenshots
- Full-screen mode

### 3. Multi-Platform Support

Supports 10+ retro gaming platforms:
- **PlayStation 1** - Classic 3D games
- **Nintendo 64** - 3D platformers and action games
- **Super Nintendo** - 16-bit classics
- **Game Boy Advance** - Portable gaming
- **Game Boy Color** - Color handheld games
- **NES** - 8-bit classics
- **Sega Genesis** - Fast-paced action games (e.g., General Chaos)
- **Sega Dreamcast** - 128-bit console games
- **PlayStation 2** - Experimental (Kingdom Hearts, etc.)
- **PSP** - Portable PlayStation games

### 4. Game Request System
- Users can request new games to be added
- Admin approval workflow
- Automated installation via worker service
- Progress tracking (0-100%)
- Status notifications (pending, installing, installed, failed)

### 5. File Management
- Direct ROM/ISO upload
- Automatic file hashing (SHA256)
- Cover image and screenshot storage
- Efficient file serving with nginx

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     games.jeffemmett.com                 │
│                    (Nginx Reverse Proxy)                 │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌─────▼──────┐
│Frontend│      │  Backend   │
│ React  │      │  FastAPI   │
│TypeScript│    │   Python   │
└────────┘      └─────┬──────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    ┌────▼───┐   ┌───▼────┐  ┌───▼────┐
    │PostgreSQL   │ Redis  │  │Worker  │
    │Database │   │ Queue  │  │Service │
    └─────────┘   └────────┘  └────────┘
                                    │
                              ┌─────▼──────┐
                              │Game Storage│
                              │/data/games │
                              └────────────┘
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **React Router** for navigation
- **TanStack Query** for data fetching
- **EmulatorJS** for in-browser emulation
- **Vite** for build tooling

### Backend
- **FastAPI** (Python) - REST API
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **Redis** - Job queue
- **Celery/Custom Worker** - Background jobs

### Infrastructure
- **Docker Compose** - Container orchestration
- **Nginx** - Reverse proxy & static file serving
- **Netcup RS 8000** - Primary hosting server
- **Gitea** - Source control (primary)
- **GitHub** - Public mirror

## File Structure

```
games-platform/
├── backend/               # FastAPI backend
│   ├── main.py           # API endpoints
│   ├── models.py         # Database models
│   ├── schemas.py        # Pydantic schemas
│   ├── database.py       # DB connection
│   └── services/         # Business logic
│       ├── game_service.py
│       └── request_service.py
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   └── lib/          # API client
│   └── public/           # Static assets
├── worker/               # Background worker
│   └── worker.py         # Game installation jobs
├── database/             # Database setup
│   └── init.sql          # Schema & seed data
├── nginx/                # Nginx config
│   └── nginx.conf        # Reverse proxy rules
├── docker-compose.yml    # Service orchestration
├── deploy.sh             # Deployment script
├── dev.sh                # Development script
└── DEPLOYMENT.md         # Deployment guide
```

## Quick Start

### Local Development

```bash
cd /home/jeffe/Github/games-platform

# Start development environment
./dev.sh

# Access at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8001
# - API Docs: http://localhost:8001/docs
```

### Production Deployment

```bash
# Deploy to RS 8000
./deploy.sh

# Or manually:
ssh netcup
cd /opt/apps/games-platform
git pull
docker-compose up -d --build
```

## API Endpoints

### Games
- `GET /api/games` - List all games (with filters)
- `GET /api/games/{id}` - Get specific game
- `POST /api/games` - Create game entry
- `DELETE /api/games/{id}` - Delete game
- `POST /api/upload` - Upload ROM file

### Requests
- `GET /api/requests` - List game requests
- `POST /api/requests` - Submit new request
- `PUT /api/requests/{id}/approve` - Approve request
- `PUT /api/requests/{id}/reject` - Reject request

### Platforms
- `GET /api/platforms` - List all platforms

### Stats
- `GET /api/stats` - Platform statistics

## Database Schema

### Tables
1. **platforms** - Gaming platforms (PS1, N64, etc.)
2. **games** - Game library entries
3. **game_requests** - User-submitted game requests
4. **save_states** - Emulator save states

## Game Request Workflow

1. **User submits request** via web UI
   - Game title + platform
   - Optional email and notes

2. **Admin reviews request** in admin panel
   - Can approve or reject

3. **Worker processes approved requests**
   - Downloads ROM (from configured sources)
   - Extracts and verifies files
   - Creates database entry
   - Updates progress (0% → 100%)

4. **Game appears in library** when complete
   - Users can immediately play

## EmulatorJS Integration

Games are played using EmulatorJS, which provides:
- **RetroArch cores** compiled to WebAssembly
- **Save states** in browser localStorage
- **Gamepad API** support
- **Full-screen mode**
- **Screenshot capture**
- **Cheat code support** (some cores)

### Supported File Formats

| Platform | Extensions | Core |
|----------|-----------|------|
| PS1 | .iso, .bin, .cue, .pbp | mednafen_psx_hw |
| N64 | .z64, .n64, .v64 | mupen64plus_next |
| SNES | .smc, .sfc | snes9x |
| GBA | .gba | mgba |
| Genesis | .md, .bin, .gen | genesis_plus_gx |

## Storage Requirements

- **Per Game**: 10MB - 4GB depending on platform
- **Estimated Library Sizes**:
  - 100 SNES games: ~20GB
  - 50 PS1 games: ~100GB
  - 20 PS2 games: ~80GB

## Security Considerations

### Current Implementation
- Basic rate limiting via nginx
- CORS configured for API access
- File upload size limits (5GB)

### Recommended for Production
1. Add user authentication (OAuth/JWT)
2. Admin-only upload access
3. HTTPS with Let's Encrypt
4. Database backups
5. ROM file encryption at rest
6. Audit logging

## Future Enhancements

### Phase 1 (MVP) ✓
- [x] Game library UI
- [x] EmulatorJS integration
- [x] Basic platform support
- [x] Docker deployment

### Phase 2 (Planned)
- [ ] User authentication
- [ ] Multiple user accounts
- [ ] Personal save states per user
- [ ] Game ratings and reviews
- [ ] Advanced search (by developer, year, genre)

### Phase 3 (Advanced)
- [ ] Multiplayer support (netplay)
- [ ] Automatic ROM scraping from legal sources
- [ ] Cover art auto-fetch (IGDB, TheGamesDB)
- [ ] Achievement system
- [ ] Leaderboards
- [ ] Mobile-optimized controls

### Phase 4 (Integration)
- [ ] Integration with canvas-website
- [ ] Collaborative gaming sessions
- [ ] Stream to Twitch/YouTube
- [ ] Social features (friends, activity feed)

## Legal Considerations

**IMPORTANT**: This platform is for use with:
1. Games you legally own (backup copies)
2. Homebrew games
3. Abandonware (check local laws)
4. ROMs dumped from your own cartridges/discs

Do NOT use for piracy. Respect copyright laws in your jurisdiction.

## Support & Troubleshooting

### Common Issues

**Games won't load**
- Check ROM file path in database
- Verify file permissions
- Check browser console for errors
- Try different ROM format

**Upload fails**
- Check disk space
- Verify file size < 5GB
- Check nginx upload limits

**Emulator stuck loading**
- Clear browser cache
- Check ROM compatibility with core
- Some games require BIOS files

### Getting Help

- Check logs: `docker-compose logs -f`
- Database access: `docker-compose exec postgres psql -U games_user games_platform`
- Redis queue: `docker-compose exec redis redis-cli`

## Performance Benchmarks

**Expected Performance** (on RS 8000):
- SNES/GBA/Genesis: 60 FPS (perfect)
- N64: 40-60 FPS (depends on game)
- PS1: 50-60 FPS (most games)
- PS2: 15-30 FPS (experimental, not recommended)

**Client Requirements**:
- Modern browser (Chrome, Firefox, Edge)
- 4GB RAM minimum
- Decent GPU for PS1/N64 (integrated works for 2D)

## Contributing

This is a personal project but contributions welcome:
1. Fork on Gitea/GitHub
2. Create feature branch
3. Submit pull request
4. Ensure Docker builds pass

## License

MIT License - See LICENSE file for details

## Credits

- **EmulatorJS** - Browser emulation engine
- **RetroArch** - Emulator cores
- **FastAPI** - Backend framework
- **React** - Frontend framework
- **TailwindCSS** - Styling

Built with ❤️ by Jeff Emmett for games.jeffemmett.com
