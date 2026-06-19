alter table public.offline_marketing_ideas
  add column if not exists links jsonb not null default '[]'::jsonb;

alter table public.offline_marketing_ideas
  add column if not exists attachments jsonb not null default '[]'::jsonb;

create index if not exists offline_marketing_ideas_links_idx
  on public.offline_marketing_ideas using gin (links);

create index if not exists offline_marketing_ideas_attachments_idx
  on public.offline_marketing_ideas using gin (attachments);
