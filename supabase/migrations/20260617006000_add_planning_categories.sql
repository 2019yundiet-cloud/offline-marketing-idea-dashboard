alter table public.offline_marketing_ideas
  add column if not exists work_type text not null default '아이디어';

alter table public.offline_marketing_ideas
  add column if not exists project_name text not null default '';

alter table public.offline_marketing_ideas
  add column if not exists category_major text not null default '';

alter table public.offline_marketing_ideas
  add column if not exists category_sub text not null default '';

alter table public.offline_marketing_ideas
  drop constraint if exists offline_marketing_ideas_work_type_check;

alter table public.offline_marketing_ideas
  add constraint offline_marketing_ideas_work_type_check
  check (work_type in ('아이디어', '기획안', '프로젝트', '업무'));

create index if not exists offline_marketing_ideas_work_type_idx
  on public.offline_marketing_ideas (work_type);

create index if not exists offline_marketing_ideas_project_name_idx
  on public.offline_marketing_ideas (project_name);

create index if not exists offline_marketing_ideas_category_idx
  on public.offline_marketing_ideas (category_major, category_sub, store);

create table if not exists public.offline_marketing_categories (
  id text primary key,
  name text not null,
  level text not null default 'major',
  parent_id text not null default '',
  sort_order integer not null default 999,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offline_marketing_categories_level_check
    check (level in ('major', 'sub')),
  constraint offline_marketing_categories_parent_check
    check ((level = 'major' and parent_id = '') or (level = 'sub' and parent_id <> '')),
  unique (parent_id, level, name)
);

create index if not exists offline_marketing_categories_parent_idx
  on public.offline_marketing_categories (parent_id);

create index if not exists offline_marketing_categories_payload_idx
  on public.offline_marketing_categories using gin (payload);

drop trigger if exists set_offline_marketing_categories_updated_at
  on public.offline_marketing_categories;

create trigger set_offline_marketing_categories_updated_at
before update on public.offline_marketing_categories
for each row
execute function public.offline_marketing_set_updated_at();

alter table public.offline_marketing_categories enable row level security;

revoke all on table public.offline_marketing_categories from public, anon, authenticated;
grant select, insert, update, delete on table public.offline_marketing_categories to service_role;

insert into public.offline_marketing_categories (id, name, level, parent_id, sort_order)
values
  ('cat_interior', '인테리어', 'major', '', 10),
  ('cat_interior_store', '매장 환경', 'sub', 'cat_interior', 11),
  ('cat_marketing', '마케팅', 'major', '', 20),
  ('cat_marketing_online', '온라인마케팅', 'sub', 'cat_marketing', 21),
  ('cat_marketing_offline', '오프라인 마케팅', 'sub', 'cat_marketing', 22),
  ('cat_project', '프로젝트', 'major', '', 30),
  ('cat_project_plan', '기획안 관리', 'sub', 'cat_project', 31)
on conflict (id) do nothing;

create or replace view public.offline_marketing_idea_summary
with (security_invoker = true) as
select
  store,
  owner,
  status,
  priority,
  work_type,
  category_major,
  category_sub,
  count(*) as idea_count,
  max(updated_at) as last_updated_at
from public.offline_marketing_ideas
group by store, owner, status, priority, work_type, category_major, category_sub;

revoke all on table public.offline_marketing_idea_summary from public, anon, authenticated;
grant select on table public.offline_marketing_idea_summary to service_role;
