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

const USERS = ['준호', '동원', '보미', '상준'];
const STORES = ['머문래', '갤러리문래'];
const STATUSES = ['idea', 'discussion', 'planning', 'progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

loadDotEnv(path.join(repoRoot, '.env'));

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseSchema = process.env.SUPABASE_SCHEMA || 'public';
const preferredPort = Number(process.env.DASHBOARD_PORT || 4321);
const supabaseEnabled = Boolean(supabaseUrl && serviceRoleKey);

await fs.mkdir(dataDir, { recursive: true });
await ensureJsonFile(ideasFile, []);

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

    if (url.pathname === '/api/ideas' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const saved = await saveIdea(body);
      return sendJson(res, 200, { idea: saved, supabaseEnabled });
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

function normalizeIdea(input, now) {
  const safeInput = input && typeof input === 'object' ? input : {};
  const clientId = stringValue(safeInput.client_id) || createClientId();
  const createdAt = stringValue(safeInput.created_at) || now;
  const tags = normalizeTags(safeInput.tags);
  return {
    client_id: clientId,
    title: stringValue(safeInput.title),
    store: allowedValue(safeInput.store, STORES),
    owner: allowedValue(safeInput.owner, USERS),
    status: allowedValue(safeInput.status, STATUSES) || 'idea',
    priority: allowedValue(safeInput.priority, PRIORITIES) || 'medium',
    idea_type: stringValue(safeInput.idea_type),
    description: stringValue(safeInput.description),
    expected_impact: stringValue(safeInput.expected_impact),
    next_action: stringValue(safeInput.next_action),
    tags,
    payload: {
      source: 'idea-dashboard',
      raw: safeInput.payload?.raw || {}
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

async function saveLocalIdea(idea) {
  const ideas = await readLocalIdeas();
  const index = ideas.findIndex((item) => item.client_id === idea.client_id);
  if (index >= 0) ideas[index] = { ...ideas[index], ...idea };
  else ideas.push(idea);
  await fs.writeFile(ideasFile, `${JSON.stringify(ideas.sort(sortIdeas), null, 2)}\n`, 'utf8');
}

async function readSupabaseIdeas() {
  const endpoint = `${supabaseUrl}/rest/v1/offline_marketing_ideas?select=*&order=updated_at.desc&limit=500`;
  const response = await supabaseFetch(endpoint, { method: 'GET' });
  return response.map(fromSupabaseRow);
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
    store: idea.store,
    owner: idea.owner,
    status: idea.status,
    priority: idea.priority,
    idea_type: idea.idea_type,
    description: idea.description,
    expected_impact: idea.expected_impact,
    next_action: idea.next_action,
    tags: idea.tags,
    payload: idea.payload,
    saved_from: idea.saved_from
  };
}

function fromSupabaseRow(row) {
  return {
    client_id: row.client_id,
    title: row.title || '',
    store: row.store || '',
    owner: row.owner || '',
    status: row.status || 'idea',
    priority: row.priority || 'medium',
    idea_type: row.idea_type || '',
    description: row.description || '',
    expected_impact: row.expected_impact || '',
    next_action: row.next_action || '',
    tags: row.tags || [],
    payload: row.payload || {},
    saved_from: row.saved_from || 'idea-dashboard',
    created_at: row.created_at,
    updated_at: row.updated_at,
    remote_status: 'synced'
  };
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
