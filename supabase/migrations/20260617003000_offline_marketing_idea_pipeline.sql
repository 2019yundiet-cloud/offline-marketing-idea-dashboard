update public.offline_marketing_ideas
set status = case status
  when 'new' then 'idea'
  when 'review' then 'discussion'
  when 'planned' then 'planning'
  when 'doing' then 'progress'
  when 'hold' then 'discussion'
  else status
end
where status in ('new', 'review', 'planned', 'doing', 'hold');

alter table public.offline_marketing_ideas
  drop constraint if exists offline_marketing_ideas_status_check;

alter table public.offline_marketing_ideas
  add constraint offline_marketing_ideas_status_check
  check (status in ('idea', 'discussion', 'planning', 'progress', 'done'));
