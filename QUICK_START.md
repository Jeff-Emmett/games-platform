# Quick Start Guide

## What You Have Now

A complete retro gaming platform ready to deploy to your RS 8000 server!

**Location**: `/home/jeffe/Github/games-platform`

## Features

- Beautiful game library UI with thumbnails
- Play games in your browser (EmulatorJS)
- Support for PS1, N64, SNES, Genesis, and more
- Game request system with automated installation
- Dockerized and ready to deploy

## Next Steps

### 1. Test Locally (Optional)

```bash
cd /home/jeffe/Github/games-platform

# Start development environment
./dev.sh

# Access at http://localhost:3000
# API docs at http://localhost:8001/docs
```

### 2. Push to Gitea

```bash
# Configure Gitea remote
git remote add gitea git@gitea.jeffemmett.com:jeff/games-platform.git

# Push to Gitea (primary repo)
git push gitea main

# Optional: Push to GitHub mirror
git remote add github git@github.com:Jeff-Emmett/games-platform.git
git push github main
```

### 3. Deploy to RS 8000

**Option A: Automatic Deployment**
```bash
./deploy.sh
```

**Option B: Manual Deployment**
```bash
# SSH to your server
ssh netcup

# Clone repository
sudo mkdir -p /opt/apps
cd /opt/apps
git clone https://gitea.jeffemmett.com/jeff/games-platform.git
cd games-platform

# Setup environment
cp .env.example .env
nano .env  # Edit database password

# Create data directories
sudo mkdir -p /data/games/{ps1,n64,snes,genesis,gba,gbc,nes,dreamcast,psp}
sudo chown -R $USER:$USER /data/games

# Start services
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f
```

### 4. Configure DNS

Add DNS record in Cloudflare:
- Type: `A`
- Name: `games`
- Content: `159.195.32.209` (your RS 8000 IP)
- Proxy: Enabled

### 5. Add Your First Game

**For testing with General Chaos (Sega Genesis):**

```bash
# SSH to server
ssh netcup

# Copy your ROM file to the server
# (From your local machine)
scp /path/to/general_chaos.bin netcup:/data/games/genesis/

# On the server, add to database
cd /opt/apps/games-platform
./scripts/add-sample-game.sh

# Or manually via API
curl -X POST "http://localhost:8001/api/games" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "General Chaos",
    "platform_id": 7,
    "rom_path": "/data/games/genesis/general_chaos.bin",
    "description": "Fast-paced action game",
    "release_year": 1994
  }'
```

### 6. Access Your Platform

Visit: **https://games.jeffemmett.com**

- Browse games in the library
- Click a game to play
- Submit game requests
- Enjoy retro gaming in your browser!

## File Checklist

Created files:
- [x] Backend API (FastAPI + PostgreSQL)
- [x] Frontend UI (React + TypeScript)
- [x] Database schema with 10+ platforms
- [x] Worker service for game installation
- [x] Docker Compose setup
- [x] Nginx reverse proxy configuration
- [x] EmulatorJS integration
- [x] Deployment scripts
- [x] Documentation

## Recommended: Add More Games

### Supported Platforms

1. **PlayStation 1** (platform_id: 1)
   - `.iso`, `.bin`, `.cue` files
   - Requires BIOS: `scph1001.bin`

2. **Nintendo 64** (platform_id: 2)
   - `.z64`, `.n64` files
   - No BIOS required

3. **SNES** (platform_id: 3)
   - `.smc`, `.sfc` files
   - No BIOS required

4. **Game Boy Advance** (platform_id: 4)
   - `.gba` files
   - Optional BIOS for better compatibility

5. **Sega Genesis** (platform_id: 7)
   - `.bin`, `.md`, `.gen` files
   - No BIOS required

### Adding Games

```bash
# Copy ROM to appropriate directory
cp game.rom /data/games/[platform]/

# Add via API or upload through web UI (when implemented)
```

## Troubleshooting

### Backend won't start
```bash
docker-compose logs backend
# Check database connection
# Wait for postgres to be ready
```

### Frontend shows blank page
```bash
docker-compose logs frontend
# Check if built correctly
# Verify API URL in .env
```

### Game won't load in emulator
- Check ROM file exists at specified path
- Verify file permissions
- Check browser console for errors
- Some games need BIOS files

### Can't upload files
- Check disk space: `df -h`
- Verify upload size limits in nginx.conf
- Check backend logs

## Next Enhancements

Once deployed, consider:

1. **Add SSL certificate** (Let's Encrypt or Cloudflare)
2. **User authentication** for uploads
3. **Automatic cover art** fetching
4. **Save states** in database
5. **Admin panel** for managing requests
6. **Integration** with canvas-website

## Resources

- **EmulatorJS Docs**: https://emulatorjs.org/
- **RetroArch Cores**: https://docs.libretro.com/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review DEPLOYMENT.md for detailed troubleshooting
3. Check PROJECT_SUMMARY.md for architecture details

Enjoy your retro gaming platform! 🎮
