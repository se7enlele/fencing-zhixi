# Cloudflare Deploy

FencingAI is now deployed as a Cloudflare Worker with static assets.

Production:

- `https://fencingai.uk`
- `https://www.fencingai.uk`
- Worker: `fencingai`
- KV binding: `FOLLOWS`

## Deploy

```powershell
cd "C:\Users\admin\Documents\Fencing Zhixi"
npm run cf:deploy
```

The deploy command rebuilds `cloudflare/data/public-data.mjs` from local
`data/analysis`, uploads `web/` assets, and deploys the Worker.

## Data Model

Current Cloudflare version is a static data bundle plus KV follows:

- Score data: generated into `cloudflare/data/public-data.mjs`
- Followed athletes: Cloudflare KV namespace `FOLLOWS`
- Admin import: present but cloud commit is intentionally disabled until R2/KV
  ingestion is implemented

## Important

Do not depend on Aliyun ECS for `fencingai.uk` traffic. The domain route is now
bound to Cloudflare Worker routes in `wrangler.toml`.
