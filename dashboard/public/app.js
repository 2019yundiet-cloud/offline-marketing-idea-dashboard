const form = document.querySelector('#ideaForm');
const newIdeaButton = document.querySelector('#newIdeaButton');
const saveStatus = document.querySelector('#saveStatus');
const storageMode = document.querySelector('#storageMode');
const ideasBody = document.querySelector('#ideasBody');
const recordCount = document.querySelector('#recordCount');
const stageTabs = document.querySelector('#stageTabs');
const photoInput = document.querySelector('#photoInput');
const photoPreview = document.querySelector('#photoPreview');
const mediaStatus = document.querySelector('#mediaStatus');
const snapshotId = document.querySelector('#snapshotId');
const snapshotUpdated = document.querySelector('#snapshotUpdated');
const snapshotStorage = document.querySelector('#snapshotStorage');

const metrics = {
  idea: document.querySelector('#metricIdea'),
  discussion: document.querySelector('#metricDiscussion'),
  planning: document.querySelector('#metricPlanning'),
  progress: document.querySelector('#metricProgress'),
  done: document.querySelector('#metricDone')
};

const labels = {
  status: {
    idea: '아이디어',
    discussion: '논의',
    planning: '상세기획',
    progress: '진행',
    done: '완료'
  },
  priority: {
    low: '낮음',
    medium: '보통',
    high: '높음',
    urgent: '긴급'
  }
};

const API_IDEAS_URL = 'api/ideas';
const LOCAL_STORAGE_KEY = 'offline-marketing-ideas:v1';
const MAX_PHOTOS = 4;
const MAX_ORIGINAL_PHOTO_BYTES = 8 * 1024 * 1024;
const PHOTO_TARGET_BYTES = 420 * 1024;

const state = {
  currentClientId: createClientId(),
  currentAttachments: [],
  ideas: [],
  selectedStage: 'all',
  saveTimer: null,
  pendingRequest: Promise.resolve(),
  lastSavedSignature: ''
};

initialize();

async function initialize() {
  bindAutosave();
  await loadIdeas();
  render();
  setSaveState('idle', '대기');
}

function bindAutosave() {
  form.addEventListener('input', (event) => {
    if (event.target === photoInput) return;
    scheduleSave();
  });
  form.addEventListener('change', (event) => {
    if (event.target === photoInput) return;
    scheduleSave();
  });
  photoInput.addEventListener('change', handlePhotoSelect);
  photoPreview.addEventListener('click', handlePhotoPreviewClick);
  newIdeaButton.addEventListener('click', resetForm);
  stageTabs.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-stage]');
    if (!button) return;
    state.selectedStage = button.dataset.stage;
    render();
    document.querySelector('#records').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  ideasBody.addEventListener('click', (event) => {
    if (event.target.closest('a, button, input, textarea, select')) return;
    const row = event.target.closest('tr[data-id]');
    if (!row) return;
    const idea = state.ideas.find((item) => item.client_id === row.dataset.id);
    if (idea) loadIdeaIntoForm(idea);
  });
  ideasBody.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) return;
    const row = event.target.closest('tr[data-id]');
    if (!row) return;
    event.preventDefault();
    const idea = state.ideas.find((item) => item.client_id === row.dataset.id);
    if (idea) loadIdeaIntoForm(idea);
  });
}

async function loadIdeas() {
  try {
    const response = await fetch(API_IDEAS_URL);
    if (!response.ok) throw new Error('api_unavailable');
    const payload = await response.json();
    state.ideas = payload.ideas || [];
    storageMode.textContent = payload.supabaseEnabled ? 'Supabase 연결' : '로컬 저장';
  } catch {
    state.ideas = readBrowserIdeas();
    storageMode.textContent = '브라우저 저장';
  }
}

function scheduleSave() {
  clearTimeout(state.saveTimer);
  const idea = collectIdea();
  if (!hasMeaningfulInput(idea)) {
    updateSnapshot(null);
    return;
  }
  setSaveState('saving', '저장 중');
  state.saveTimer = setTimeout(() => {
    state.pendingRequest = state.pendingRequest.then(saveCurrentIdea, saveCurrentIdea);
  }, 220);
}

async function saveCurrentIdea() {
  const idea = collectIdea();
  if (!hasMeaningfulInput(idea)) return;
  const signature = JSON.stringify(idea);
  if (signature === state.lastSavedSignature) {
    setSaveState('saved', '저장됨');
    return;
  }
  try {
    const response = await fetch(API_IDEAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: signature
    });
    if (!response.ok) throw new Error('save_failed');
    const payload = await response.json();
    const saved = payload.idea;
    state.lastSavedSignature = JSON.stringify(collectIdea());
    upsertIdea(saved);
    updateSnapshot(saved);
    storageMode.textContent = payload.supabaseEnabled ? 'Supabase 연결' : '로컬 저장';
    setSaveState('saved', '저장됨');
    render();
  } catch {
    const saved = saveBrowserIdea(idea);
    state.lastSavedSignature = JSON.stringify(collectIdea());
    upsertIdea(saved);
    updateSnapshot(saved);
    storageMode.textContent = '브라우저 저장';
    setSaveState('saved', '저장됨');
    render();
  }
}

function collectIdea() {
  const data = new FormData(form);
  const links = parseLinks(data.get('links') || '');
  const attachments = normalizeAttachments(state.currentAttachments);
  return {
    client_id: state.currentClientId,
    title: data.get('title') || '',
    store: data.get('store') || '',
    owner: data.get('owner') || '',
    status: data.get('status') || 'idea',
    priority: data.get('priority') || 'medium',
    idea_type: data.get('idea_type') || '',
    description: data.get('description') || '',
    expected_impact: data.get('expected_impact') || '',
    next_action: data.get('next_action') || '',
    tags: data.getAll('tags'),
    links,
    attachments,
    payload: {
      raw: rawFormData(data),
      links,
      attachments
    }
  };
}

function hasMeaningfulInput(idea) {
  return Boolean(
    idea.title ||
    idea.store ||
    idea.owner ||
    idea.idea_type ||
    idea.description ||
    idea.expected_impact ||
    idea.next_action ||
    selectedTags(idea).length ||
    selectedLinks(idea).length ||
    selectedAttachments(idea).length
  );
}

function resetForm() {
  state.currentClientId = createClientId();
  state.currentAttachments = [];
  state.lastSavedSignature = '';
  form.reset();
  form.querySelector('[name="status"]').value = 'idea';
  form.querySelector('[name="priority"]').value = 'medium';
  renderPhotoPreview();
  mediaStatus.textContent = '';
  updateSnapshot(null);
  setSaveState('idle', '대기');
  form.querySelector('[name="title"]').focus();
}

function loadIdeaIntoForm(idea) {
  state.currentClientId = idea.client_id;
  form.elements.title.value = idea.title || '';
  form.elements.store.value = idea.store || '';
  form.elements.owner.value = idea.owner || '';
  form.elements.status.value = normalizeStatus(idea.status);
  form.elements.priority.value = idea.priority || 'medium';
  form.elements.idea_type.value = idea.idea_type || '';
  form.elements.description.value = idea.description || '';
  form.elements.expected_impact.value = idea.expected_impact || '';
  form.elements.next_action.value = idea.next_action || '';
  form.elements.links.value = formatLinks(selectedLinks(idea));
  state.currentAttachments = selectedAttachments(idea);
  renderPhotoPreview();
  mediaStatus.textContent = '';
  setSelectedTags(selectedTags(idea));
  state.lastSavedSignature = JSON.stringify(collectIdea());
  updateSnapshot(idea);
  setSaveState('saved', '불러옴');
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function upsertIdea(idea) {
  const index = state.ideas.findIndex((item) => item.client_id === idea.client_id);
  if (index >= 0) state.ideas[index] = idea;
  else state.ideas.unshift(idea);
  state.ideas.sort((a, b) => `${b.updated_at || ''}${b.created_at || ''}`.localeCompare(`${a.updated_at || ''}${a.created_at || ''}`));
}

function render() {
  renderMetrics();
  renderStageTabs();
  renderTable();
}

function renderMetrics() {
  const totals = state.ideas.reduce((acc, idea) => {
    const status = normalizeStatus(idea.status);
    acc[status] += 1;
    return acc;
  }, { idea: 0, discussion: 0, planning: 0, progress: 0, done: 0 });
  metrics.idea.textContent = totals.idea.toLocaleString('ko-KR');
  metrics.discussion.textContent = totals.discussion.toLocaleString('ko-KR');
  metrics.planning.textContent = totals.planning.toLocaleString('ko-KR');
  metrics.progress.textContent = totals.progress.toLocaleString('ko-KR');
  metrics.done.textContent = totals.done.toLocaleString('ko-KR');
}

function renderStageTabs() {
  const counts = state.ideas.reduce((acc, idea) => {
    const status = normalizeStatus(idea.status);
    acc.all += 1;
    acc[status] += 1;
    return acc;
  }, { all: 0, idea: 0, discussion: 0, planning: 0, progress: 0, done: 0 });
  for (const button of stageTabs.querySelectorAll('button[data-stage]')) {
    const stage = button.dataset.stage;
    button.classList.toggle('active', stage === state.selectedStage);
    button.querySelector('strong').textContent = (counts[stage] || 0).toLocaleString('ko-KR');
  }
}

function renderTable() {
  const visibleIdeas = state.selectedStage === 'all'
    ? state.ideas
    : state.ideas.filter((idea) => normalizeStatus(idea.status) === state.selectedStage);
  recordCount.textContent = `${visibleIdeas.length}개`;
  if (!visibleIdeas.length) {
    ideasBody.innerHTML = '<tr class="empty-row"><td colspan="8">아이디어 없음</td></tr>';
    return;
  }
  ideasBody.innerHTML = visibleIdeas.slice(0, 120).map((idea) => `
    <tr data-id="${escapeHtml(idea.client_id)}" role="button" tabindex="0">
      <td data-label="제목">
        <strong>${escapeHtml(idea.title || '제목 없음')}</strong>
        <small>${escapeHtml(summaryText(idea.description))}</small>
        ${renderTags(idea.tags)}
        ${renderLinks(idea.links)}
      </td>
      <td data-label="매장">${escapeHtml(idea.store || '')}</td>
      <td data-label="담당자">${escapeHtml(idea.owner || '')}</td>
      <td data-label="상태"><span class="chip status-${escapeHtml(normalizeStatus(idea.status))}">${escapeHtml(statusName(idea.status))}</span></td>
      <td data-label="우선순위"><span class="chip priority-${escapeHtml(idea.priority || 'medium')}">${escapeHtml(priorityName(idea.priority))}</span></td>
      <td data-label="유형">${escapeHtml(idea.idea_type || '')}</td>
      <td data-label="첨부">${renderAttachmentSummary(idea)}</td>
      <td data-label="수정일">${escapeHtml(formatDateTime(idea.updated_at))}</td>
    </tr>
  `).join('');
}

function updateSnapshot(idea) {
  snapshotId.textContent = idea?.client_id || state.currentClientId || '-';
  snapshotUpdated.textContent = idea?.updated_at ? new Date(idea.updated_at).toLocaleString('ko-KR') : '-';
  snapshotStorage.textContent = idea?.remote_status === 'synced'
    ? 'Supabase + 로컬'
    : idea?.remote_status === 'browser_only'
      ? '브라우저'
      : idea
        ? '로컬'
        : '-';
}

function setSaveState(kind, label) {
  saveStatus.className = `status-pill ${kind}`;
  saveStatus.textContent = label;
}

function createClientId() {
  return `idea_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function statusName(value) {
  return labels.status[normalizeStatus(value)] || value || '';
}

function priorityName(value) {
  return labels.priority[value] || value || '';
}

function selectedTags(idea) {
  if (Array.isArray(idea.tags)) return idea.tags;
  return String(idea.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean);
}

function setSelectedTags(tags) {
  const selected = new Set(tags);
  for (const input of form.querySelectorAll('input[name="tags"]')) {
    input.checked = selected.has(input.value);
  }
}

function renderTags(tags) {
  const values = selectedTags({ tags });
  if (!values.length) return '';
  return `<span class="tag-line">${values.map((tag) => `<em>${escapeHtml(tag)}</em>`).join('')}</span>`;
}

async function handlePhotoSelect() {
  const files = Array.from(photoInput.files || []);
  if (!files.length) return;

  const remainingSlots = Math.max(0, MAX_PHOTOS - state.currentAttachments.length);
  const messages = [];
  const additions = [];

  if (remainingSlots === 0) {
    messages.push(`사진은 최대 ${MAX_PHOTOS}장까지 저장됩니다.`);
  }

  for (const file of files.slice(0, remainingSlots)) {
    try {
      additions.push(await fileToAttachment(file));
    } catch (error) {
      messages.push(`${file.name}: ${error.message}`);
    }
  }

  if (files.length > remainingSlots) {
    messages.push(`사진은 최대 ${MAX_PHOTOS}장까지 저장됩니다.`);
  }

  if (additions.length) {
    state.currentAttachments = normalizeAttachments([...state.currentAttachments, ...additions]);
    renderPhotoPreview();
    scheduleSave();
  }

  photoInput.value = '';
  mediaStatus.textContent = messages.join(' ');
}

function handlePhotoPreviewClick(event) {
  const button = event.target.closest('button[data-remove-photo]');
  if (!button) return;
  state.currentAttachments = state.currentAttachments.filter((item) => item.id !== button.dataset.removePhoto);
  renderPhotoPreview();
  scheduleSave();
}

function renderPhotoPreview() {
  const attachments = selectedAttachments({ attachments: state.currentAttachments });
  if (!attachments.length) {
    photoPreview.innerHTML = '';
    return;
  }

  photoPreview.innerHTML = attachments.map((attachment) => `
    <figure class="photo-card">
      <img src="${escapeHtml(attachment.data_url)}" alt="${escapeHtml(attachment.name)}">
      <figcaption>
        <span>${escapeHtml(attachment.name)}</span>
        <button type="button" data-remove-photo="${escapeHtml(attachment.id)}" aria-label="${escapeHtml(`${attachment.name} 삭제`)}">삭제</button>
      </figcaption>
    </figure>
  `).join('');
}

async function fileToAttachment(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 추가할 수 있습니다.');
  }
  if (file.size > MAX_ORIGINAL_PHOTO_BYTES) {
    throw new Error('8MB 이하 이미지만 추가할 수 있습니다.');
  }

  const dataUrl = await resizeImageFile(file);
  return {
    id: createAttachmentId(),
    kind: 'image',
    name: file.name || 'photo.jpg',
    type: 'image/jpeg',
    size: estimateDataUrlBytes(dataUrl),
    data_url: dataUrl,
    created_at: new Date().toISOString()
  };
}

async function resizeImageFile(file) {
  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const maxSides = [1400, 1100, 900, 700];
  const qualities = [0.82, 0.72, 0.62];
  let fallback = source;

  for (const maxSide of maxSides) {
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    for (const quality of qualities) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      fallback = dataUrl;
      if (estimateDataUrlBytes(dataUrl) <= PHOTO_TARGET_BYTES) return dataUrl;
    }
  }

  return fallback;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(new Error('사진을 읽지 못했습니다.')));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('사진을 처리하지 못했습니다.')));
    image.src = dataUrl;
  });
}

function estimateDataUrlBytes(dataUrl) {
  const base64 = String(dataUrl).split(',')[1] || '';
  return Math.round(base64.length * 0.75);
}

function selectedLinks(idea) {
  const source = idea.links || idea.payload?.links || [];
  return normalizeLinks(source);
}

function normalizeLinks(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeLink).filter(Boolean).slice(0, 12);
  }
  return parseLinks(value);
}

function parseLinks(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map(normalizeLink)
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeLink(value) {
  const source = value && typeof value === 'object' ? value : {};
  const line = typeof value === 'string' ? value.trim() : '';
  const parts = line ? line.split('|') : [];
  const labelText = source.label || (parts.length > 1 ? parts.shift().trim() : '');
  const urlText = source.url || (parts.length ? parts.join('|').trim() : line);
  const url = normalizeHttpUrl(urlText);
  if (!url) return null;
  const label = String(labelText || deriveLinkLabel(url)).trim();
  return {
    id: source.id || stableId('link', `${label}|${url}`),
    label,
    url
  };
}

function normalizeHttpUrl(value) {
  let candidate = String(value || '').trim();
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

function formatLinks(links) {
  return selectedLinks({ links })
    .map((link) => `${link.label} | ${link.url}`)
    .join('\n');
}

function renderLinks(links) {
  const values = selectedLinks({ links });
  if (!values.length) return '';
  return `<span class="link-line">${values.slice(0, 3).map((link) => (
    `<a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`
  )).join('')}</span>`;
}

function selectedAttachments(idea) {
  const source = idea.attachments || idea.payload?.attachments || [];
  return normalizeAttachments(source);
}

function normalizeAttachments(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_PHOTOS).map((item) => {
    const dataUrl = String(item?.data_url || '');
    if (!dataUrl.startsWith('data:image/')) return null;
    const name = String(item?.name || 'photo.jpg').trim() || 'photo.jpg';
    return {
      id: String(item?.id || stableId('photo', `${name}|${dataUrl.slice(0, 80)}`)),
      kind: 'image',
      name,
      type: String(item?.type || 'image/jpeg'),
      size: Number(item?.size || estimateDataUrlBytes(dataUrl)),
      data_url: dataUrl,
      created_at: String(item?.created_at || '')
    };
  }).filter(Boolean);
}

function renderAttachmentSummary(idea) {
  const photoCount = selectedAttachments(idea).length;
  const linkCount = selectedLinks(idea).length;
  if (!photoCount && !linkCount) return '';
  return [
    photoCount ? `<span class="attachment-count">사진 ${photoCount}</span>` : '',
    linkCount ? `<span class="attachment-count">링크 ${linkCount}</span>` : ''
  ].filter(Boolean).join('');
}

function rawFormData(data) {
  const raw = {};
  for (const [key, value] of data.entries()) {
    if (key === 'photos') continue;
    const normalized = value instanceof File ? value.name : value;
    if (raw[key] === undefined) raw[key] = normalized;
    else raw[key] = Array.isArray(raw[key]) ? [...raw[key], normalized] : [raw[key], normalized];
  }
  return raw;
}

function createAttachmentId() {
  return `photo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function stableId(prefix, value) {
  let hash = 0;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return `${prefix}_${Math.abs(hash).toString(36)}`;
}

function normalizeStatus(value) {
  const legacy = {
    new: 'idea',
    review: 'discussion',
    planned: 'planning',
    doing: 'progress',
    hold: 'discussion'
  };
  const status = legacy[value] || value || 'idea';
  return labels.status[status] ? status : 'idea';
}

function summaryText(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > 64 ? `${text.slice(0, 64)}...` : text;
}

function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function readBrowserIdeas() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).sort((a, b) => `${b.updated_at || ''}${b.created_at || ''}`.localeCompare(`${a.updated_at || ''}${a.created_at || ''}`));
  } catch {
    return [];
  }
}

function saveBrowserIdea(idea) {
  const now = new Date().toISOString();
  const saved = {
    ...idea,
    tags: Array.isArray(idea.tags)
      ? idea.tags
      : String(idea.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    links: selectedLinks(idea),
    attachments: selectedAttachments(idea),
    created_at: idea.created_at || now,
    updated_at: now,
    remote_status: 'browser_only'
  };
  const ideas = readBrowserIdeas();
  const index = ideas.findIndex((item) => item.client_id === saved.client_id);
  if (index >= 0) ideas[index] = { ...ideas[index], ...saved };
  else ideas.unshift(saved);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ideas));
  return saved;
}
