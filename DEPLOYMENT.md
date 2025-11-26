# Deployment Guide - Games Platform

## Prerequisites

- Netcup RS 8000 server with Docker and Docker Compose
- Domain configured: `games.jeffemmett.com`
- Git access to repository

## Quick Deploy

### 1. Clone Repository

```bash
# SSH into your RS 8000
ssh netcup

# Navigate to deployment directory
cd /opt/apps

# Clone repository
git clone https://gitea.jeffemmett.com/jeff/games-platform.git
cd games-platform
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit environment variables
nano .env

# Set a secure database password
# Update domain if needed
```

### 3. Create Data Directories

```bash
# Create persistent data directories
sudo mkdir -p /data/games
sudo chown -R $USER:$USER /data/games

# Create directory structure for platforms
mkdir -p /data/games/{ps1,ps2,n64,snes,gba,gbc,nes,genesis,dreamcast,psp}
```

### 4. Start Services

```bash
# Build and start all containers
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Verify Deployment

```bash
# Check backend health
curl http://localhost:8001/health

# Check frontend
curl http://localhost:3000

# Check database
docker-compose exec postgres psql -U games_user -d games_platform -c "SELECT COUNT(*) FROM platforms;"
```

## DNS Configuration

### Cloudflare DNS

Add an A record:
- Type: `A`
- Name: `games`
- Content: `159.195.32.209` (RS 8000 IP)
- Proxy status: Proxied (recommended)

## SSL/TLS Setup

### Option 1: Cloudflare (Recommended)

1. Set Cloudflare DNS to "Proxied"
2. Enable "Flexible" or "Full" SSL in Cloudflare dashboard
3. No additional nginx configuration needed

### Option 2: Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d games.jeffemmett.com

# Uncomment HTTPS server block in nginx/nginx.conf
# Update SSL certificate paths
# Restart nginx container
docker-compose restart nginx
```

## Adding Games

### Manual Upload

1. Navigate to the platform on the web UI
2. Use the upload feature (admin only)
3. Or copy ROMs directly:

```bash
# Copy ROM to appropriate platform directory
cp /path/to/game.iso /data/games/ps1/

# Update database (via API or manually)
```

### Via Game Requests

1. Users submit requests through the web UI
2. Admin approves requests
3. Worker service automatically downloads and installs
4. Game appears in library when complete

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f worker
docker-compose logs -f frontend
```

### Database Access

```bash
# Connect to database
docker-compose exec postgres psql -U games_user -d games_platform

# Useful queries
SELECT * FROM platforms;
SELECT title, platform_id, play_count FROM games ORDER BY play_count DESC LIMIT 10;
SELECT game_title, status FROM game_requests ORDER BY created_at DESC;
```

### Redis Queue

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Check queue length
LLEN game_install_queue

# View pending jobs
LRANGE game_install_queue 0 -1
```

## Backup & Restore

### Backup Database

```bash
# Backup database
docker-compose exec postgres pg_dump -U games_user games_platform > backup_$(date +%Y%m%d).sql

# Backup game files
tar -czf games_backup_$(date +%Y%m%d).tar.gz /data/games
```

### Restore Database

```bash
# Restore database
cat backup_20250101.sql | docker-compose exec -T postgres psql -U games_user games_platform

# Restore game files
tar -xzf games_backup_20250101.tar.gz -C /
```

## Updating

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Clean up old images
docker image prune -f
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Database not ready (wait a few seconds)
# - Port conflict (check if 8001 is in use)
```

### Worker not processing requests

```bash
# Check worker logs
docker-compose logs worker

# Check Redis connection
docker-compose exec redis redis-cli ping

# Manually inspect queue
docker-compose exec redis redis-cli LRANGE game_install_queue 0 -1
```

### Games won't load in emulator

- Check ROM file permissions: `ls -la /data/games/`
- Verify CORS headers in nginx config
- Check browser console for errors
- Ensure ROM path is correct in database

## Performance Tuning

### Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U games_user games_platform

# Add indexes for better performance
CREATE INDEX idx_games_favorite ON games(favorite) WHERE favorite = TRUE;
CREATE INDEX idx_games_last_played ON games(last_played DESC NULLS LAST);
```

### Nginx Caching

Edit `nginx/nginx.conf` to add caching for static assets:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=game_cache:10m max_size=1g;
```

## Security Considerations

1. **Change default password** in `.env`
2. **Restrict upload access** to authenticated users
3. **Use HTTPS** in production
4. **Implement rate limiting** (already configured in nginx)
5. **Regular backups** of database and game files
6. **Monitor disk usage** for game storage

## Resource Requirements

- **CPU**: 2-4 cores (more for PS2 emulation)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 100GB+ for game library
- **Network**: Broadband for game downloads
