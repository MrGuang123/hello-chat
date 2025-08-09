# Deployment Instructions

## Server (Cloudflare Worker)

### Development Deployment
```bash
# Set the API key for development environment
wrangler secret put DEEPSEEK_API_KEY --env dev

# Deploy to development
wrangler deploy --env dev
```

### Production Deployment
```bash
# Set the API key for production environment
wrangler secret put DEEPSEEK_API_KEY --env production

# Deploy to production
wrangler deploy --env production
```

### Local Development
```bash
# Start local development server
npm run dev
```

## Frontend (Cloudflare Pages)

### Production Deployment
1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare Pages or configure auto-deployment from Git

3. Set environment variables in Cloudflare Pages dashboard:
   - `REACT_APP_GRAPHQL_ENDPOINT`: Your deployed worker URL

### Environment URLs
- Development Worker: `https://deepseek-worker-dev.your-account.workers.dev`
- Production Worker: `https://deepseek-worker.your-account.workers.dev`