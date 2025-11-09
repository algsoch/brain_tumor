# GitHub Actions - Keep Render Services Alive

## Overview
This GitHub Action automatically pings your Render services every 10 minutes to prevent them from spinning down due to inactivity on the free tier.

## How It Works

### Workflow: `keep-alive.yml`
- **Trigger**: Runs automatically every 10 minutes via cron schedule
- **Manual Trigger**: Can also be triggered manually from GitHub Actions tab
- **What it does**:
  1. Pings backend API health endpoint (`/health`)
  2. Pings frontend application homepage
  3. Waits 30 seconds for services to warm up
  4. Verifies backend API is responding
  5. Logs status and timestamps

### Services Monitored
- **Backend API**: `https://brain-tumor-api-yrxf.onrender.com`
- **Frontend**: `https://brain-tumor-detection-ai.onrender.com`

## Render Free Tier Limits
- **Hours per month**: 750 hours per service
- **Spin-down**: After 15 minutes of inactivity
- **Spin-up time**: 30-60 seconds on first request

## Running Every 10 Minutes
- **Daily pings**: 144 pings (24 hours × 6 pings/hour)
- **Monthly pings**: ~4,320 pings
- **Well within free tier limits**: ✅

## Manual Trigger
1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Keep Render Services Alive"
4. Click "Run workflow" button
5. Confirm with "Run workflow"

## Monitoring
View workflow runs in the Actions tab to see:
- Ping success/failure status
- Response codes from services
- Timestamps of each run
- Any errors or issues

## Cost
- **GitHub Actions**: FREE for public repositories
- **Render Services**: FREE tier (no credit card required)
- **Total Cost**: $0/month 💰

## Customization

### Change Ping Frequency
Edit `.github/workflows/keep-alive.yml`:
```yaml
schedule:
  - cron: '*/15 * * * *'  # Every 15 minutes
  - cron: '*/5 * * * *'   # Every 5 minutes (not recommended)
  - cron: '0 * * * *'     # Every hour
```

### Add More Services
Add additional steps in the workflow:
```yaml
- name: Ping Another Service
  run: |
    curl -s https://your-other-service.onrender.com/health
```

## Troubleshooting

### Services Still Spinning Down?
- Check GitHub Actions logs for failures
- Verify service URLs are correct
- Ensure services have health endpoints

### Workflow Not Running?
- Check if Actions are enabled in repository settings
- Verify cron syntax is correct
- Check for any GitHub outages

### High Response Times?
- Normal for first ping after spin-down (30-60s)
- Services will respond faster once warmed up
- Consider increasing wait time in workflow

## Benefits
✅ No manual intervention needed
✅ Services stay responsive 24/7
✅ Better user experience (no cold starts)
✅ Completely automated and free
✅ Logs available for monitoring

## Notes
- Render may still spin down services briefly during deployments
- First request after deployment may take longer
- This helps but doesn't guarantee 100% uptime on free tier
- Consider upgrading to paid tier for guaranteed uptime
