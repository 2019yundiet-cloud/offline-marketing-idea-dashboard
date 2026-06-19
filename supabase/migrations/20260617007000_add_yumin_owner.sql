alter table public.offline_marketing_ideas
  drop constraint if exists offline_marketing_ideas_owner_check;

alter table public.offline_marketing_ideas
  add constraint offline_marketing_ideas_owner_check
  check (owner = '' or owner in ('준호', '동원', '보미', '상준', '유민'));
