# Supabase for Offline Marketing Files

This setup stores the offline marketing Obsidian vault in Supabase as a queryable file and graph index.

## What Gets Synced

- Markdown notes from `offline-marketing-graph`
- Canvas files from `offline-marketing-graph`
- Frontmatter fields such as `type`, `status`, `tags`, and dates
- Full file content for search and audit
- Obsidian wikilinks and canvas file links as graph edges
- Dashboard ideas with tags, links, and image attachment metadata

## One-Time Supabase Setup

1. Create or choose a Supabase project for offline marketing files.
2. Link this repo to that project:

```bash
supabase login
supabase link --project-ref <project-ref>
```

3. Apply the schema:

```bash
supabase db push
```

4. Create a local `.env` from `.env.example` and fill:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
OFFLINE_MARKETING_VAULT=offline-marketing-graph
```

Keep `.env` uncommitted.

## Sync Workflow

Check the vault locally:

```bash
npm run vault:check
```

Preview what will sync:

```bash
npm run vault:sync:dry
```

Sync to Supabase:

```bash
npm run vault:sync
```

## Useful Tables and Views

- `offline_marketing_files`: one row per synced file
- `offline_marketing_links`: graph edges extracted from notes and canvas files
- `offline_marketing_ideas`: dashboard ideas, stages, owners, tags, links, and image attachments
- `offline_marketing_campaigns`: campaign notes
- `offline_marketing_locations`: location notes
- `offline_marketing_partners`: partner notes
- `offline_marketing_assets`: asset notes
- `offline_marketing_field_events`: field execution notes
- `offline_marketing_metric_snapshots`: performance snapshot notes
- `offline_marketing_insights`: insight notes

## Git Workflow

Review only the offline marketing management scope:

```bash
npm run git:offline-status
```

Recommended commit flow:

```bash
git add offline-marketing-graph supabase scripts docs README.md package.json .gitignore .gitattributes .env.example
git commit -m "Set up offline marketing file management"
```

Add a remote only after choosing the dedicated GitHub/Git server repository:

```bash
git remote add origin <repo-url>
git push -u origin main
```
