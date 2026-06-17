# Offline Marketing File Ops

This repository manages the dedicated offline marketing Obsidian graph, Git history, and Supabase sync assets.

## Main Folders

- `offline-marketing-graph/`: dedicated Obsidian vault for offline marketing notes and graph data
- `dashboard/`: local dashboard for idea upload, management, and autosave
- `supabase/`: database migrations for the offline marketing file index
- `scripts/`: local sync and validation scripts
- `docs/`: operating guides

## Daily Commands

```bash
npm run dashboard
npm run vault:check
npm run vault:sync:dry
npm run vault:sync
npm run git:offline-status
```

## Dashboard

Run `npm run dashboard` and open the printed local URL. Every changed idea field is saved automatically through the dashboard API. The API writes to `data/dashboard-ideas.json` first, then syncs to Supabase when `.env` contains `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

Dashboard users are fixed to 준호, 동원, 보미, 상준. Stores are fixed to 머문래 and 갤러리문래.
Dashboard tags are fixed to 메뉴, 인테리어, 온라인마케팅, 오프라인 마케팅.

## Git Scope

The repo is intended to track only offline marketing operating files: the Obsidian vault, Supabase migrations, sync scripts, and docs. Local secrets, Supabase temp state, and volatile Obsidian workspace state are ignored.

## Supabase Sync

See [docs/supabase-offline-marketing.md](docs/supabase-offline-marketing.md) for the setup flow.
