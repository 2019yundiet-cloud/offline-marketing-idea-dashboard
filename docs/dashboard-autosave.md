# Dashboard Autosave

The offline marketing dashboard is designed around immediate persistence for idea upload and management.

## Local Run

```bash
npm run dashboard
```

Open the local URL printed by the server.

## Save Behavior

- Any input or select change schedules a save immediately.
- The server writes to `data/dashboard-ideas.json` first.
- If Supabase credentials exist in `.env`, the same row is upserted into `offline_marketing_ideas`.
- The browser never receives the Supabase service role key.
- Fixed users: 준호, 동원, 보미, 상준.
- Fixed stores: 머문래, 갤러리문래.
- Fixed stages: 아이디어, 논의, 상세기획, 진행, 완료.
- Fixed tags: 메뉴, 인테리어, 온라인마케팅, 오프라인 마케팅.

## Mobile Design

- iPhone-sized layouts use a sticky top bar, horizontal stage filter, card-style idea list, and bottom tab bar.
- Primary touch targets are at least 44px tall.
- Inputs use 16px text to avoid iOS focus zoom.
- The layout uses `viewport-fit=cover` and safe-area padding for modern iPhones.

## Supabase Table

Migration:

```text
supabase/migrations/20260617002000_offline_marketing_ideas.sql
```

Main table:

```text
public.offline_marketing_ideas
```

Summary view:

```text
public.offline_marketing_idea_summary
```
