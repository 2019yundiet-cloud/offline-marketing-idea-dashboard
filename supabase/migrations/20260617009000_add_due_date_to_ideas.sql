alter table public.offline_marketing_ideas
  add column if not exists due_date date;

create index if not exists offline_marketing_ideas_due_date_idx
  on public.offline_marketing_ideas (due_date);
