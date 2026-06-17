#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run') || args.has('--check');
const checkOnly = args.has('--check');
const repoRoot = process.cwd();
loadDotEnv(path.join(repoRoot, '.env'));

const vaultDir = path.resolve(repoRoot, process.env.OFFLINE_MARKETING_VAULT || 'offline-marketing-graph');
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const schema = process.env.SUPABASE_SCHEMA || 'public';

if (!fs.existsSync(vaultDir)) {
  fail(`Vault directory not found: ${vaultDir}`);
}

const allFiles = walk(vaultDir)
  .filter((file) => ['.md', '.canvas'].includes(path.extname(file)))
  .sort();

const relFiles = allFiles.map((file) => toVaultPath(path.relative(vaultDir, file)));
const markdownTargets = buildMarkdownTargetIndex(relFiles);
const rows = [];
const links = [];
const unresolvedLinks = [];

for (const absolutePath of allFiles) {
  const relPath = toVaultPath(path.relative(vaultDir, absolutePath));
  const content = fs.readFileSync(absolutePath, 'utf8');
  const stat = fs.statSync(absolutePath);
  const parsed = parseFrontmatter(content);
  const title = inferTitle(content, relPath);
  const extension = path.extname(relPath);
  const folder = path.dirname(relPath) === '.' ? '.' : path.dirname(relPath);
  const tags = normalizeTags(parsed.frontmatter.tags);

  rows.push({
    path: relPath,
    basename: path.basename(relPath),
    folder,
    extension,
    title,
    node_type: stringValue(parsed.frontmatter.type),
    status: stringValue(parsed.frontmatter.status),
    tags,
    frontmatter: parsed.frontmatter,
    content,
    content_sha256: sha256(content),
    size_bytes: stat.size,
    file_mtime: stat.mtime.toISOString(),
    synced_at: new Date().toISOString()
  });

  const extracted = extension === '.canvas'
    ? extractCanvasLinks(content, relPath, markdownTargets)
    : extractWikiLinks(content, relPath, markdownTargets);

  for (const link of extracted) {
    links.push(link);
    if (!link.target_path && link.link_type !== 'external') {
      unresolvedLinks.push(`${relPath} -> ${link.target_raw}`);
    }
  }
}

printSummary({ rows, links, unresolvedLinks, vaultDir });

if (unresolvedLinks.length > 0 && checkOnly) {
  fail('Unresolved links found. Fix links above before syncing.');
}

if (dryRun) {
  process.exit(0);
}

if (!supabaseUrl || !serviceRoleKey) {
  fail('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Copy .env.example to .env first.');
}

await upsertFiles(rows);
await replaceLinks(links, rows.map((row) => row.path));
console.log(`Synced ${rows.length} files and ${links.length} graph links to Supabase.`);

function loadDotEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, '');
  }
}

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    if (entry.name === '.obsidian' && path.basename(dir) !== path.basename(vaultDir)) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '99-attachments') continue;
      results.push(...walk(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) {
    return { frontmatter: {}, body: content };
  }
  const end = content.indexOf('\n---', 4);
  if (end === -1) {
    return { frontmatter: {}, body: content };
  }
  const block = content.slice(4, end).trimEnd();
  const body = content.slice(content.indexOf('\n', end + 1) + 1);
  return { frontmatter: parseSimpleYaml(block), body };
}

function parseSimpleYaml(block) {
  const out = {};
  let currentArrayKey = null;
  for (const line of block.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const listItem = line.match(/^\s+-\s*(.*)$/);
    if (listItem && currentArrayKey) {
      out[currentArrayKey].push(parseScalar(listItem[1]));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawValue] = kv;
    if (rawValue === '') {
      out[key] = [];
      currentArrayKey = key;
    } else {
      out[key] = parseScalar(rawValue);
      currentArrayKey = null;
    }
  }
  return out;
}

function parseScalar(rawValue) {
  const value = rawValue.trim();
  if (value === '') return '';
  if (value === 'null') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((part) => parseScalar(part.trim()));
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value.replace(/^["']|["']$/g, '');
}

function normalizeTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function inferTitle(content, relPath) {
  const heading = content.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  return path.basename(relPath, path.extname(relPath));
}

function buildMarkdownTargetIndex(relFiles) {
  const index = new Map();
  for (const relPath of relFiles.filter((file) => file.endsWith('.md'))) {
    const withoutExt = relPath.slice(0, -3);
    index.set(withoutExt, relPath);
    index.set(path.basename(withoutExt), relPath);
    index.set(relPath, relPath);
  }
  return index;
}

function extractWikiLinks(content, sourcePath, targetIndex) {
  const out = [];
  const re = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;
  for (const match of content.matchAll(re)) {
    const targetRaw = match[1].trim();
    const targetHeading = match[2]?.trim() || '';
    const linkLabel = match[3]?.trim() || '';
    const targetPath = resolveTarget(targetRaw, targetIndex);
    out.push({
      source_path: sourcePath,
      target_raw: targetRaw,
      target_path: targetPath || '',
      target_heading: targetHeading,
      link_label: linkLabel,
      link_type: 'wikilink'
    });
  }
  return out;
}

function extractCanvasLinks(content, sourcePath, targetIndex) {
  const out = [];
  try {
    const canvas = JSON.parse(content);
    for (const node of canvas.nodes || []) {
      if (node.type !== 'file' || !node.file) continue;
      out.push({
        source_path: sourcePath,
        target_raw: node.file,
        target_path: resolveTarget(node.file.replace(/\.md$/, ''), targetIndex) || node.file,
        target_heading: '',
        link_label: '',
        link_type: 'canvas-file'
      });
    }
  } catch {
    out.push({
      source_path: sourcePath,
      target_raw: 'invalid-canvas-json',
      target_path: '',
      target_heading: '',
      link_label: '',
      link_type: 'canvas-error'
    });
  }
  return out;
}

function resolveTarget(targetRaw, targetIndex) {
  const normalized = toVaultPath(targetRaw).replace(/\.md$/, '');
  return targetIndex.get(normalized) || targetIndex.get(`${normalized}.md`) || '';
}

function toVaultPath(value) {
  return value.split(path.sep).join('/');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stringValue(value) {
  if (value === undefined || value === null || Array.isArray(value) || typeof value === 'object') return null;
  return String(value);
}

function printSummary({ rows, links, unresolvedLinks, vaultDir }) {
  const byType = rows.reduce((acc, row) => {
    const key = row.node_type || '(none)';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  console.log(`Vault: ${vaultDir}`);
  console.log(`Files: ${rows.length}`);
  console.log(`Links: ${links.length}`);
  console.log(`Unresolved links: ${unresolvedLinks.length}`);
  console.log('Types:');
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`  ${type}: ${count}`);
  }
  if (unresolvedLinks.length) {
    console.log('Unresolved:');
    for (const item of unresolvedLinks.slice(0, 50)) console.log(`  ${item}`);
    if (unresolvedLinks.length > 50) console.log(`  ... ${unresolvedLinks.length - 50} more`);
  }
}

async function upsertFiles(fileRows) {
  const endpoint = `${supabaseUrl}/rest/v1/offline_marketing_files?on_conflict=path`;
  for (const chunk of chunks(fileRows, 100)) {
    await supabaseFetch(endpoint, {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(chunk)
    });
  }
}

async function replaceLinks(linkRows, sourcePaths) {
  const endpoint = `${supabaseUrl}/rest/v1/rpc/replace_offline_marketing_links`;
  await supabaseFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      links: linkRows,
      source_paths: sourcePaths
    })
  });
}

async function supabaseFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Profile': schema,
      'Content-Profile': schema,
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const body = await response.text();
    fail(`Supabase request failed: ${response.status} ${response.statusText}\n${body}`);
  }
}

function chunks(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
