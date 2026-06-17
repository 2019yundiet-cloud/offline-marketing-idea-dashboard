const form = document.querySelector('#ideaForm');
const newIdeaButton = document.querySelector('#newIdeaButton');
const saveStatus = document.querySelector('#saveStatus');
const storageMode = document.querySelector('#storageMode');
const ideasBody = document.querySelector('#ideasBody');
const recordCount = document.querySelector('#recordCount');
const stageTabs = document.querySelector('#stageTabs');
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

const state = {
  currentClientId: createClientId(),
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
  form.addEventListener('input', scheduleSave);
  form.addEventListener('change', scheduleSave);
  newIdeaButton.addEventListener('click', resetForm);
  stageTabs.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-stage]');
    if (!button) return;
    state.selectedStage = button.dataset.stage;
    render();
    document.querySelector('#records').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  ideasBody.addEventListener('click', (event) => {
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
    tags: data.get('tags') || '',
    payload: {
      raw: Object.fromEntries(data.entries())
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
    idea.tags
  );
}

function resetForm() {
  state.currentClientId = createClientId();
  state.lastSavedSignature = '';
  form.reset();
  form.querySelector('[name="status"]').value = 'idea';
  form.querySelector('[name="priority"]').value = 'medium';
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
  form.elements.tags.value = Array.isArray(idea.tags) ? idea.tags.join(', ') : idea.tags || '';
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
    ideasBody.innerHTML = '<tr class="empty-row"><td colspan="7">아이디어 없음</td></tr>';
    return;
  }
  ideasBody.innerHTML = visibleIdeas.slice(0, 120).map((idea) => `
    <tr data-id="${escapeHtml(idea.client_id)}" role="button" tabindex="0">
      <td data-label="제목">
        <strong>${escapeHtml(idea.title || '제목 없음')}</strong>
        <small>${escapeHtml(summaryText(idea.description))}</small>
      </td>
      <td data-label="매장">${escapeHtml(idea.store || '')}</td>
      <td data-label="담당자">${escapeHtml(idea.owner || '')}</td>
      <td data-label="상태"><span class="chip status-${escapeHtml(normalizeStatus(idea.status))}">${escapeHtml(statusName(idea.status))}</span></td>
      <td data-label="우선순위"><span class="chip priority-${escapeHtml(idea.priority || 'medium')}">${escapeHtml(priorityName(idea.priority))}</span></td>
      <td data-label="유형">${escapeHtml(idea.idea_type || '')}</td>
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
