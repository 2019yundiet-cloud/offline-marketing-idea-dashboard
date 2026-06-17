create extension if not exists pgcrypto;

create or replace function public.offline_marketing_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.offline_marketing_files (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  basename text not null,
  folder text not null,
  extension text not null,
  title text,
  node_type text,
  status text,
  tags text[] not null default '{}',
  frontmatter jsonb not null default '{}'::jsonb,
  content text not null default '',
  content_sha256 text not null,
  size_bytes bigint not null default 0,
  file_mtime timestamptz,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offline_marketing_files_folder_idx
  on public.offline_marketing_files (folder);

create index if not exists offline_marketing_files_node_type_idx
  on public.offline_marketing_files (node_type);

create index if not exists offline_marketing_files_status_idx
  on public.offline_marketing_files (status);

create index if not exists offline_marketing_files_tags_idx
  on public.offline_marketing_files using gin (tags);

create index if not exists offline_marketing_files_frontmatter_idx
  on public.offline_marketing_files using gin (frontmatter);

create index if not exists offline_marketing_files_content_search_idx
  on public.offline_marketing_files using gin (to_tsvector('simple', content));

drop trigger if exists set_offline_marketing_files_updated_at
  on public.offline_marketing_files;

create trigger set_offline_marketing_files_updated_at
before update on public.offline_marketing_files
for each row
execute function public.offline_marketing_set_updated_at();

create table if not exists public.offline_marketing_links (
  id uuid primary key default gen_random_uuid(),
  source_path text not null references public.offline_marketing_files(path) on delete cascade,
  target_raw text not null,
  target_path text,
  target_heading text,
  link_label text not null default '',
  link_type text not null default 'wikilink',
  created_at timestamptz not null default now(),
  unique (source_path, target_raw, target_heading, link_label, link_type)
);

create index if not exists offline_marketing_links_source_idx
  on public.offline_marketing_links (source_path);

create index if not exists offline_marketing_links_target_idx
  on public.offline_marketing_links (target_path);

create or replace function public.replace_offline_marketing_links(
  links jsonb,
  source_paths text[]
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
begin
  delete from public.offline_marketing_links
  where source_path = any(source_paths);

  insert into public.offline_marketing_links (
    source_path,
    target_raw,
    target_path,
    target_heading,
    link_label,
    link_type
  )
  select
    item.source_path,
    item.target_raw,
    nullif(item.target_path, ''),
    nullif(item.target_heading, ''),
    coalesce(item.link_label, ''),
    coalesce(item.link_type, 'wikilink')
  from jsonb_to_recordset(links) as item(
    source_path text,
    target_raw text,
    target_path text,
    target_heading text,
    link_label text,
    link_type text
  )
  on conflict do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

alter table public.offline_marketing_files enable row level security;
alter table public.offline_marketing_links enable row level security;

revoke all on table public.offline_marketing_files from public, anon, authenticated;
revoke all on table public.offline_marketing_links from public, anon, authenticated;
grant select, insert, update, delete on table public.offline_marketing_files to service_role;
grant select, insert, update, delete on table public.offline_marketing_links to service_role;
revoke execute on function public.replace_offline_marketing_links(jsonb, text[]) from public, anon, authenticated;
grant execute on function public.replace_offline_marketing_links(jsonb, text[]) to service_role;

create or replace view public.offline_marketing_campaigns
with (security_invoker = true) as
select *
from public.offline_marketing_files
where node_type = 'campaign';

create or replace view public.offline_marketing_locations
with (security_invoker = true) as
select *
from public.offline_marketing_files
where node_type = 'location';

create or replace view public.offline_marketing_partners
with (security_invoker = true) as
select *
from public.offline_marketing_files
where node_type = 'partner';

create or replace view public.offline_marketing_assets
with (security_invoker = true) as
select *
from public.offline_marketing_files
where node_type = 'asset';

create or replace view public.offline_marketing_field_events
with (security_invoker = true) as
select *
from public.offline_marketing_files
where node_type = 'field-event';

create or replace view public.offline_marketing_metric_snapshots
with (security_invoker = true) as
select *
from public.offline_marketing_files
where node_type = 'metric-snapshot';

create or replace view public.offline_marketing_experiments
with (security_invoker = true) as
select *
from public.offline_marketing_files
where node_type = 'experiment';

create or replace view public.offline_marketing_insights
with (security_invoker = true) as
select *
from public.offline_marketing_files
where node_type = 'insight';

create or replace view public.offline_marketing_graph_edges
with (security_invoker = true) as
select
  source_path,
  target_path,
  target_raw,
  target_heading,
  link_label,
  link_type
from public.offline_marketing_links;

revoke all on table public.offline_marketing_campaigns from public, anon, authenticated;
revoke all on table public.offline_marketing_locations from public, anon, authenticated;
revoke all on table public.offline_marketing_partners from public, anon, authenticated;
revoke all on table public.offline_marketing_assets from public, anon, authenticated;
revoke all on table public.offline_marketing_field_events from public, anon, authenticated;
revoke all on table public.offline_marketing_metric_snapshots from public, anon, authenticated;
revoke all on table public.offline_marketing_experiments from public, anon, authenticated;
revoke all on table public.offline_marketing_insights from public, anon, authenticated;
revoke all on table public.offline_marketing_graph_edges from public, anon, authenticated;

grant select on table public.offline_marketing_campaigns to service_role;
grant select on table public.offline_marketing_locations to service_role;
grant select on table public.offline_marketing_partners to service_role;
grant select on table public.offline_marketing_assets to service_role;
grant select on table public.offline_marketing_field_events to service_role;
grant select on table public.offline_marketing_metric_snapshots to service_role;
grant select on table public.offline_marketing_experiments to service_role;
grant select on table public.offline_marketing_insights to service_role;
grant select on table public.offline_marketing_graph_edges to service_role;
