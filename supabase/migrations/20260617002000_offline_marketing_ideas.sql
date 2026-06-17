create table if not exists public.offline_marketing_ideas (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  title text not null default '',
  store text not null default '',
  owner text not null default '',
  status text not null default 'idea',
  priority text not null default 'medium',
  idea_type text not null default '',
  description text not null default '',
  expected_impact text not null default '',
  next_action text not null default '',
  tags text[] not null default '{}',
  payload jsonb not null default '{}'::jsonb,
  saved_from text not null default 'idea-dashboard',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offline_marketing_ideas_store_check
    check (store = '' or store in ('머문래', '갤러리문래')),
  constraint offline_marketing_ideas_owner_check
    check (owner = '' or owner in ('준호', '동원', '보미')),
  constraint offline_marketing_ideas_status_check
    check (status in ('idea', 'discussion', 'planning', 'progress', 'done')),
  constraint offline_marketing_ideas_priority_check
    check (priority in ('low', 'medium', 'high', 'urgent'))
);

create index if not exists offline_marketing_ideas_store_idx
  on public.offline_marketing_ideas (store);

create index if not exists offline_marketing_ideas_owner_idx
  on public.offline_marketing_ideas (owner);

create index if not exists offline_marketing_ideas_status_idx
  on public.offline_marketing_ideas (status);

create index if not exists offline_marketing_ideas_priority_idx
  on public.offline_marketing_ideas (priority);

create index if not exists offline_marketing_ideas_tags_idx
  on public.offline_marketing_ideas using gin (tags);

create index if not exists offline_marketing_ideas_payload_idx
  on public.offline_marketing_ideas using gin (payload);

create index if not exists offline_marketing_ideas_content_search_idx
  on public.offline_marketing_ideas
  using gin (to_tsvector('simple', title || ' ' || description || ' ' || expected_impact || ' ' || next_action));

drop trigger if exists set_offline_marketing_ideas_updated_at
  on public.offline_marketing_ideas;

create trigger set_offline_marketing_ideas_updated_at
before update on public.offline_marketing_ideas
for each row
execute function public.offline_marketing_set_updated_at();

alter table public.offline_marketing_ideas enable row level security;

revoke all on table public.offline_marketing_ideas from public, anon, authenticated;
grant select, insert, update, delete on table public.offline_marketing_ideas to service_role;

create or replace view public.offline_marketing_idea_summary
with (security_invoker = true) as
select
  store,
  owner,
  status,
  priority,
  count(*) as idea_count,
  max(updated_at) as last_updated_at
from public.offline_marketing_ideas
group by store, owner, status, priority;

revoke all on table public.offline_marketing_idea_summary from public, anon, authenticated;
grant select on table public.offline_marketing_idea_summary to service_role;
