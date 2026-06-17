insert into public.offline_marketing_files (
  path,
  basename,
  folder,
  extension,
  title,
  node_type,
  status,
  tags,
  frontmatter,
  content,
  content_sha256,
  size_bytes,
  file_mtime
)
values (
  'Home.md',
  'Home.md',
  '.',
  '.md',
  '오프라인 마케팅 그래프',
  'hub',
  'active',
  array['offline-marketing', 'hub'],
  '{"type":"hub","status":"active","created":"2026-06-17","tags":["offline-marketing","hub"]}'::jsonb,
  'Seed row. Run npm run vault:sync to replace with the current vault content.',
  repeat('0', 64),
  0,
  now()
)
on conflict (path) do nothing;
