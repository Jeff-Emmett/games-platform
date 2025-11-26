# Cloudflare Tunnel Setup Guide

## Quick Setup (5 Minutes)

### Step 1: Create Tunnel in Cloudflare Dashboard

1. **Go to Cloudflare Zero Trust:**
   - Visit: https://one.dash.cloudflare.com/
   - Sign in with your Cloudflare account

2. **Navigate to Tunnels:**
   - Click **Networks** in the left sidebar
   - Click **Tunnels**
   - Click **Create a tunnel**

3. **Configure the tunnel:**
   - **Select connector type:** Cloudflared
   - Click **Next**

   - **Name your tunnel:** `games-platform` (or any name you prefer)
   - Click **Save tunnel**

   - **Install connector:**
     - Select **Debian** (since RS 8000 runs Ubuntu/Debian)
     - Copy the installation command (looks like: `cloudflared service install eyJ...`)
     - **Save this command** - you'll need it!

4. **Configure Public Hostname:**
   - **Public Hostname:**
     - Subdomain: `games`
     - Domain: `jeffemmett.com`
     - (Full URL will be: `games.jeffemmett.com`)

   - **Service:**
     - Type: `HTTP`
     - URL: `localhost:8080`

   - Click **Save tunnel**

### Step 2: Install on RS 8000

Option A - Use the helper script:
```bash
cd /home/jeffe/Github/games-platform
./cloudflare-tunnel-setup.sh
# Paste the token when prompted
```

Option B - Manual installation:
```bash
# SSH to server
ssh netcup

# Install the tunnel (paste the command from Step 1)
cloudflared service install eyJhIjoiY...YOUR_TOKEN_HERE...

# Start the service
systemctl start cloudflared
systemctl enable cloudflared

# Check status
systemctl status cloudflared
```

### Step 3: Verify

Visit: **https://games.jeffemmett.com**

You should see your games platform!

## Troubleshooting

### Check Tunnel Status

```bash
ssh netcup
systemctl status cloudflared
```

### View Logs

```bash
ssh netcup
journalctl -u cloudflared -f
```

### Restart Tunnel

```bash
ssh netcup
systemctl restart cloudflared
```

### Check if Containers are Running

```bash
ssh netcup
cd /opt/apps/games-platform
docker compose ps
```

### Test Backend Directly

```bash
ssh netcup
curl http://localhost:8001/health
# Should return: {"status":"healthy"}
```

### Test Frontend Directly

```bash
ssh netcup
curl http://localhost:3000
# Should return HTML
```

### Test Nginx Proxy

```bash
ssh netcup
curl http://localhost:8080/api/health
# Should return: {"status":"healthy"}
```

## Advanced Configuration

### Custom Tunnel Config

If you want more control, create a config file:

```bash
ssh netcup
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: games-platform
credentials-file: /root/.cloudflared/YOUR-TUNNEL-ID.json

ingress:
  # Games platform
  - hostname: games.jeffemmett.com
    service: http://localhost:8080

  # Catch-all rule (required)
  - service: http_status:404
EOF

# Restart with new config
systemctl restart cloudflared
```

### Multiple Services

You can route multiple services through the same tunnel:

```yaml
ingress:
  - hostname: games.jeffemmett.com
    service: http://localhost:8080

  - hostname: api.games.jeffemmett.com
    service: http://localhost:8001

  - service: http_status:404
```

## Cloudflare Tunnel Features

Once configured, you get:

✅ **Automatic HTTPS** - No need to manage SSL certificates
✅ **DDoS Protection** - Cloudflare's network protects you
✅ **No Open Ports** - No need to expose 80/443 on your server
✅ **Access Control** - Can add Cloudflare Access for authentication
✅ **Analytics** - View traffic stats in Cloudflare dashboard
✅ **WAF** - Web Application Firewall included

## Security Best Practices

1. **Enable Cloudflare Access** (optional):
   - Protect admin routes
   - Require email verification or SSO

2. **Configure WAF Rules**:
   - Block known attack patterns
   - Rate limit abusive IPs

3. **Monitor Logs**:
   ```bash
   journalctl -u cloudflared -f
   ```

4. **Keep Updated**:
   ```bash
   ssh netcup
   cloudflared update
   systemctl restart cloudflared
   ```

## DNS Configuration

Cloudflare Tunnel automatically creates the DNS record when you configure the public hostname in the dashboard. You don't need to manually add an A record!

The tunnel creates a CNAME record pointing to:
- `games.jeffemmett.com` → `<TUNNEL-ID>.cfargotunnel.com`

## Uninstall

If you need to remove the tunnel:

```bash
ssh netcup
systemctl stop cloudflared
systemctl disable cloudflared
cloudflared service uninstall
```

Then delete the tunnel in Cloudflare dashboard.

## Cost

Cloudflare Tunnels are **FREE** on the Free tier with:
- Unlimited bandwidth
- Unlimited requests
- Full DDoS protection
- Automatic SSL/TLS

Perfect for your games platform!

## Support

If issues persist:
1. Check Cloudflare dashboard for tunnel status
2. Review logs: `journalctl -u cloudflared -f`
3. Verify containers are running: `docker compose ps`
4. Test each component individually (see troubleshooting)
