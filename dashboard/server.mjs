#!/usr/bin/env node
import fsSync, { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(repoRoot, 'data');
const ideasFile = path.join(dataDir, 'dashboard-ideas.json');
const categoriesFile = path.join(dataDir, 'dashboard-categories.json');

const USERS = ['준호', '동원', '보미', '상준', '유민'];
const STORES = ['머문래', '갤러리문래'];
const STATUSES = ['idea', 'discussion', 'planning', 'progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const WORK_TYPES = ['아이디어', '기획안', '프로젝트', '업무'];
const MAX_LINKS = 12;
const MAX_ATTACHMENTS = 4;
const MAX_ATTACHMENT_DATA_URL_LENGTH = 700000;
const DEFAULT_CATEGORIES = [
  { id: 'cat_interior', level: 'major', parent_id: '', name: '인테리어', sort_order: 10 },
  { id: 'cat_interior_store', level: 'sub', parent_id: 'cat_interior', name: '매장 환경', sort_order: 11 },
  { id: 'cat_marketing', level: 'major', parent_id: '', name: '마케팅', sort_order: 20 },
  { id: 'cat_marketing_online', level: 'sub', parent_id: 'cat_marketing', name: '온라인마케팅', sort_order: 21 },
  { id: 'cat_marketing_offline', level: 'sub', parent_id: 'cat_marketing', name: '오프라인 마케팅', sort_order: 22 },
  { id: 'cat_project', level: 'major', parent_id: '', name: '프로젝트', sort_order: 30 },
  { id: 'cat_project_plan', level: 'sub', parent_id: 'cat_project', name: '기획안 관리', sort_order: 31 }
];
const REMOVED_DEFAULT_CATEGORY_IDS = new Set(['cat_menu', 'cat_menu_new']);

loadDotEnv(path.join(repoRoot, '.env'));

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseSchema = process.env.SUPABASE_SCHEMA || 'public';
const preferredPort = Number(process.env.DASHBOARD_PORT || 4321);
const supabaseEnabled = Boolean(supabaseUrl && serviceRoleKey);

await fs.mkdir(dataDir, { recursive: true });
await ensureJsonFile(ideasFile, []);
await ensureJsonFile(categoriesFile, DEFAULT_CATEGORIES);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/api/health') {
      return sendJson(res, 200, {
        ok: true,
        supabaseEnabled,
        storage: supabaseEnabled ? 'local+supabase' : 'local',
        users: USERS,
        stores: STORES
      });
    }

    if (url.pathname === '/api/ideas' && req.method === 'GET') {
      const ideas = await readIdeas();
      return sendJson(res, 200, { ideas, supabaseEnabled, users: USERS, stores: STORES });
    }

    if (url.pathname === '/api/categories' && req.method === 'GET') {
      const categories = await readCategories();
      return sendJson(res, 200, { categories, supabaseEnabled, stores: STORES });
    }

    if (url.pathname === '/api/ideas' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const saved = await saveIdea(body);
      return sendJson(res, 200, { idea: saved, supabaseEnabled });
    }

    if (url.pathname === '/api/categories' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const saved = await saveCategory(body);
      return sendJson(res, 200, { category: saved, supabaseEnabled });
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      return serveStatic(url.pathname, res);
    }

    return sendJson(res, 405, { error: 'method_not_allowed' });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'server_error', message: error.message });
  }
});

const actualPort = await listenWithFallback(server, preferredPort);
console.log(`Offline marketing idea dashboard: http://localhost:${actualPort}`);
console.log(`Storage: ${supabaseEnabled ? 'local file + Supabase' : 'local file only'}`);

async function listenWithFallback(instance, port) {
  for (let candidate = port; candidate < port + 20; candidate += 1) {
    try {
      await new Promise((resolve, reject) => {
        const onError = (error) => {
          instance.off('listening', onListening);
          reject(error);
        };
        const onListening = () => {
          instance.off('error', onError);
          resolve();
        };
        instance.once('error', onError);
        instance.once('listening', onListening);
        instance.listen(candidate, '127.0.0.1');
      });
      return candidate;
    } catch (error) {
      if (error.code !== 'EADDRINUSE') throw error;
    }
  }
  throw new Error(`No free port found from ${port} to ${port + 19}`);
}

async function serveStatic(requestPath, res) {
  const safePath = requestPath === '/' ? '/index.html' : decodeURIComponent(requestPath);
  const fullPath = path.resolve(publicDir, `.${safePath}`);
  if (!fullPath.startsWith(publicDir)) {
    return sendText(res, 403, 'Forbidden');
  }
  try {
    const stat = await fs.stat(fullPath);
    if (!stat.isFile()) return sendText(res, 404, 'Not found');
    res.writeHead(200, {
      'Content-Type': contentType(fullPath),
      'Content-Length': stat.size,
      'Cache-Control': 'no-store'
    });
    createReadStream(fullPath).pipe(res);
  } catch {
    sendText(res, 404, 'Not found');
  }
}

async function readIdeas() {
  if (supabaseEnabled) {
    try {
      return await readSupabaseIdeas();
    } catch (error) {
      console.warn(`Supabase read failed, using local file: ${error.message}`);
    }
  }
  return readLocalIdeas();
}

async function readCategories() {
  if (supabaseEnabled) {
    try {
      return mergeCategories(await readSupabaseCategories());
    } catch (error) {
      console.warn(`Supabase category read failed, using local file: ${error.message}`);
    }
  }
  return mergeCategories(await readLocalCategories());
}

async function saveIdea(input) {
  const now = new Date().toISOString();
  const idea = normalizeIdea(input, now);
  await saveLocalIdea(idea);
  if (supabaseEnabled) {
    try {
      await saveSupabaseIdea(idea);
      idea.remote_status = 'synced';
    } catch (error) {
      console.warn(`Supabase write failed, kept local save: ${error.message}`);
      idea.remote_status = 'local_only';
      idea.remote_error = error.message;
    }
  } else {
    idea.remote_status = 'local_only';
  }
  await saveLocalIdea(idea);
  return idea;
}

async function saveCategory(input) {
  const now = new Date().toISOString();
  const category = normalizeCategory({ ...input, updated_at: now, created_at: input?.created_at || now });
  if (!category) throw new Error('invalid_category');
  await saveLocalCategory(category);
  if (supabaseEnabled) {
    try {
      await saveSupabaseCategory(category);
      category.remote_status = 'synced';
    } catch (error) {
      console.warn(`Supabase category write failed, kept local save: ${error.message}`);
      category.remote_status = 'local_only';
      category.remote_error = error.message;
    }
  } else {
    category.remote_status = 'local_only';
  }
  await saveLocalCategory(category);
  return category;
}

function normalizeIdea(input, now) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const clientId = stringValue(safeInput.client_id) || createClientId();
  const createdAt = stringValue(safeInput.created_at) || now;
  const tags = normalizeTags(safeInput.tags);
  const links = normalizeLinks(safeInput.links || safeInput.payload?.links || '');
  const attachments = normalizeAttachments(safeInput.attachments || safeInput.payload?.attachments || []);
  return {
    client_id: clientId,
    title: stringValue(safeInput.title),
    work_type: allowedValue(safeInput.work_type, WORK_TYPES) || '아이디어',
    project_name: stringValue(safeInput.project_name),
    category_major: stringValue(safeInput.category_major),
    category_sub: stringValue(safeInput.category_sub),
    store: allowedValue(safeInput.store, STORES),
    owner: allowedValue(safeInput.owner, USERS),
    status: allowedValue(safeInput.status, STATUSES) || 'idea',
    priority: allowedValue(safeInput.priority, PRIORITIES) || 'medium',
    idea_type: stringValue(safeInput.idea_type),
    description: stringValue(safeInput.description),
    expected_impact: stringValue(safeInput.expected_impact),
    next_action: stringValue(safeInput.next_action),
    tags,
    links,
    attachments,
    payload: {
      source: 'idea-dashboard',
      raw: safeInput.payload?.raw || {},
      links,
      attachments,
      category: {
        major: stringValue(safeInput.category_major),
        subcategory: stringValue(safeInput.category_sub)
      }
    },
    saved_from: 'idea-dashboard',
    created_at: createdAt,
    updated_at: now
  };
}

async function readLocalIdeas() {
  const text = await fs.readFile(ideasFile, 'utf8');
  const ideas = JSON.parse(text);
  return ideas.sort(sortIdeas);
}

async function readLocalCategories() {
  const text = await fs.readFile(categoriesFile, 'utf8');
  return mergeCategories(JSON.parse(text));
}

async function saveLocalIdea(idea) {
  const ideas = await readLocalIdeas();
  const index = ideas.findIndex((item) => item.client_id === idea.client_id);
  if (index >= 0) ideas[index] = { ...ideas[index], ...idea };
  else ideas.push(idea);
  await fs.writeFile(ideasFile, `${JSON.stringify(ideas.sort(sortIdeas), null, 2)}\n`, 'utf8');
}

async function saveLocalCategory(category) {
  const categories = await readLocalCategories();
  const index = categories.findIndex((item) => item.id === category.id);
  if (index >= 0) categories[index] = { ...categories[index], ...category };
  else categories.push(category);
  await fs.writeFile(categoriesFile, `${JSON.stringify(mergeCategories(categories), null, 2)}\n`, 'utf8');
}

async function readSupabaseIdeas() {
  const endpoint = `${supabaseUrl}/rest/v1/offline_marketing_ideas?select=*&order=updated_at.desc&limit=500`;
  const response = await supabaseFetch(endpoint, { method: 'GET' });
  return response.map(fromSupabaseRow);
}

async function readSupabaseCategories() {
  const endpoint = `${supabaseUrl}/rest/v1/offline_marketing_categories?select=*&order=sort_order.asc,name.asc`;
  const response = await supabaseFetch(endpoint, { method: 'GET' });
  return response.map(fromSupabaseCategory).filter(Boolean);
}

async function saveSupabaseIdea(idea) {
  const endpoint = `${supabaseUrl}/rest/v1/offline_marketing_ideas?on_conflict=client_id`;
  await supabaseFetch(endpoint, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify(toSupabaseRow(idea))
  });
}

async function saveSupabaseCategory(category) {
  const endpoint = `${supabaseUrl}/rest/v1/offline_marketing_categories?on_conflict=id`;
  await supabaseFetch(endpoint, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify(toSupabaseCategory(category))
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
      'Accept-Profile': supabaseSchema,
      'Content-Profile': supabaseSchema,
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function toSupabaseRow(idea) {
  return {
    client_id: idea.client_id,
    title: idea.title,
    work_type: idea.work_type,
    project_name: idea.project_name,
    category_major: idea.category_major,
    category_sub: idea.category_sub,
    store: idea.store,
    owner: idea.owner,
    status: idea.status,
    priority: idea.priority,
    idea_type: idea.idea_type,
    description: idea.description,
    expected_impact: idea.expected_impact,
    next_action: idea.next_action,
    tags: idea.tags,
    links: idea.links,
    attachments: idea.attachments,
    payload: idea.payload,
    saved_from: idea.saved_from
  };
}

function fromSupabaseRow(row) {
  return {
    client_id: row.client_id,
    title: row.title || '',
    work_type: row.work_type || '아이디어',
    project_name: row.project_name || '',
    category_major: row.category_major || row.payload?.category?.major || '',
    category_sub: row.category_sub || row.payload?.category?.subcategory || '',
    store: row.store || '',
    owner: row.owner || '',
    status: row.status || 'idea',
    priority: row.priority || 'medium',
    idea_type: row.idea_type || '',
    description: row.description || '',
    expected_impact: row.expected_impact || '',
    next_action: row.next_action || '',
    tags: row.tags || [],
    links: normalizeLinks(row.links || row.payload?.links || []),
    attachments: normalizeAttachments(row.attachments || row.payload?.attachments || []),
    payload: row.payload || {},
    saved_from: row.saved_from || 'idea-dashboard',
    created_at: row.created_at,
    updated_at: row.updated_at,
    remote_status: 'synced'
  };
}

function toSupabaseCategory(category) {
  return {
    id: category.id,
    name: category.name,
    level: category.level,
    parent_id: category.parent_id,
    sort_order: category.sort_order,
    payload: category.payload || {}
  };
}

function fromSupabaseCategory(row) {
  return normalizeCategory({
    id: row.id,
    name: row.name,
    level: row.level,
    parent_id: row.parent_id || '',
    sort_order: row.sort_order,
    payload: row.payload || {},
    created_at: row.created_at,
    updated_at: row.updated_at,
    remote_status: 'synced'
  });
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return {};
  return JSON.parse(text);
}

async function ensureJsonFile(filePath, fallback) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, `${JSON.stringify(fallback, null, 2)}\n`, 'utf8');
  }
}

function sortIdeas(a, b) {
  return `${b.updated_at || ''}${b.created_at || ''}`.localeCompare(`${a.updated_at || ''}${a.created_at || ''}`);
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map(stringValue).filter(Boolean);
  return stringValue(value)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeLinks(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeLink).filter(Boolean).slice(0, MAX_LINKS);
  }
  return stringValue(value)
    .split(/\r?\n/)
    .map(normalizeLink)
    .filter(Boolean)
    .slice(0, MAX_LINKS);
}

function normalizeLink(value) {
  const source = value && typeof value === 'object' ? value : {};
  const line = typeof value === 'string' ? value.trim() : '';
  const parts = line ? line.split('|') : [];
  const labelText = source.label || (parts.length > 1 ? parts.shift().trim() : '');
  const urlText = source.url || (parts.length ? parts.join('|').trim() : line);
  const url = normalizeHttpUrl(urlText);
  if (!url) return null;
  const label = stringValue(labelText || deriveLinkLabel(url));
  return {
    id: stringValue(source.id) || stableId('link', `${label}|${url}`),
    label,
    url
  };
}

function normalizeHttpUrl(value) {
  let candidate = stringValue(value);
  if (!candidate) return '';
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  try {
    const url = new URL(candidate);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function deriveLinkLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function normalizeAttachments(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_ATTACHMENTS).map((item) => {
    const dataUrl = stringValue(item?.data_url);
    if (!dataUrl.startsWith('data:image/')) return null;
    if (dataUrl.length > MAX_ATTACHMENT_DATA_URL_LENGTH) return null;
    const name = stringValue(item?.name) || 'photo.jpg';
    return {
      id: stringValue(item?.id) || stableId('photo', `${name}|${dataUrl.slice(0, 80)}`),
      kind: 'image',
      name,
      type: stringValue(item?.type) || 'image/jpeg',
      size: Number(item?.size || 0),
      data_url: dataUrl,
      created_at: stringValue(item?.created_at)
    };
  }).filter(Boolean);
}

function mergeCategories(categories) {
  const merged = new Map();
  for (const category of DEFAULT_CATEGORIES) {
    const normalized = normalizeCategory(category);
    if (normalized) merged.set(normalized.id, normalized);
  }
  for (const category of categories || []) {
    const normalized = normalizeCategory(category);
    if (isRemovedDefaultCategory(normalized)) continue;
    if (normalized) merged.set(normalized.id, normalized);
  }
  return [...merged.values()].sort(sortCategories);
}

function normalizeCategory(category) {
  const name = stringValue(category?.name);
  const level = category?.level === 'sub' ? 'sub' : 'major';
  const parentId = level === 'sub' ? stringValue(category?.parent_id) : '';
  const id = stringValue(category?.id) || createCategoryId(level, name, parentId);
  if (!name) return null;
  return {
    id,
    name,
    level,
    parent_id: parentId,
    sort_order: Number(category?.sort_order || 999),
    payload: category?.payload || {},
    created_at: stringValue(category?.created_at),
    updated_at: stringValue(category?.updated_at),
    remote_status: category?.remote_status,
    remote_error: category?.remote_error
  };
}

function isRemovedDefaultCategory(category) {
  return Boolean(category && (
    REMOVED_DEFAULT_CATEGORY_IDS.has(category.id) ||
    REMOVED_DEFAULT_CATEGORY_IDS.has(category.parent_id)
  ));
}

function sortCategories(a, b) {
  return (a.sort_order - b.sort_order) || a.name.localeCompare(b.name, 'ko-KR');
}

function stringValue(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function allowedValue(value, allowed) {
  const candidate = stringValue(value);
  return allowed.includes(candidate) ? candidate : '';
}

function createClientId() {
  return `idea_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function createCategoryId(level, name, parentId) {
  return stableId('cat', `${level}|${parentId}|${name}`);
}

function stableId(prefix, value) {
  let hash = 0;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return `${prefix}_${Math.abs(hash).toString(36)}`;
}

function sendJson(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(text)
  });
  res.end(text);
}

function sendText(res, status, text) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text)
  });
  res.end(text);
}

function contentType(filePath) {
  const ext = path.extname(filePath);
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml'
  }[ext] || 'application/octet-stream';
}

function loadDotEnv(envPath) {
  if (!fsSync.existsSync(envPath)) return;
  const text = fsSync.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}
