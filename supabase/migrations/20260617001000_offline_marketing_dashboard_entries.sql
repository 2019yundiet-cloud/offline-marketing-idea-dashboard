create table if not exists public.offline_marketing_dashboard_entries (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  entry_date date not null default current_date,
  channel text not null default '',
  campaign text not null default '',
  location text not null default '',
  partner text not null default '',
  spend numeric(14, 2) not null default 0,
  leads integer not null default 0,
  orders integer not null default 0,
  revenue numeric(14, 2) not null default 0,
  notes text not null default '',
  payload jsonb not null default '{}'::jsonb,
  saved_from text not null default 'dashboard',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offline_marketing_dashboard_entries_date_idx
  on public.offline_marketing_dashboard_entries (entry_date desc);

create index if not exists offline_marketing_dashboard_entries_campaign_idx
  on public.offline_marketing_dashboard_entries (campaign);

create index if not exists offline_marketing_dashboard_entries_channel_idx
  on public.offline_marketing_dashboard_entries (channel);

create index if not exists offline_marketing_dashboard_entries_payload_idx
  on public.offline_marketing_dashboard_entries using gin (payload);

drop trigger if exists set_offline_marketing_dashboard_entries_updated_at
  on public.offline_marketing_dashboard_entries;

create trigger set_offline_marketing_dashboard_entries_updated_at
before update on public.offline_marketing_dashboard_entries
for each row
execute function public.offline_marketing_set_updated_at();

alter table public.offline_marketing_dashboard_entries enable row level security;

revoke all on table public.offline_marketing_dashboard_entries from public, anon, authenticated;
grant select, insert, update, delete on table public.offline_marketing_dashboard_entries to service_role;

create or replace view public.offline_marketing_dashboard_daily_summary
with (security_invoker = true) as
select
  entry_date,
  channel,
  count(*) as entry_count,
  sum(spend) as spend,
  sum(leads) as leads,
  sum(orders) as orders,
  sum(revenue) as revenue,
  case when sum(leads) > 0 then round(sum(spend) / sum(leads), 2) else null end as cpl,
  case when sum(orders) > 0 then round(sum(spend) / sum(orders), 2) else null end as cpa,
  case when sum(spend) > 0 then round(sum(revenue) / sum(spend), 2) else null end as roas
from public.offline_marketing_dashboard_entries
group by entry_date, channel;

revoke all on table public.offline_marketing_dashboard_daily_summary from public, anon, authenticated;
grant select on table public.offline_marketing_dashboard_daily_summary to service_role;
