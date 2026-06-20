const form = document.querySelector('#ideaForm');
const inputModal = document.querySelector('#input');
const editorTitle = document.querySelector('#editorTitle');
const editorCloseButton = document.querySelector('#editorCloseButton');
const editorSaveButton = document.querySelector('#editorSaveButton');
const saveStatus = document.querySelector('#saveStatus');
const storageMode = document.querySelector('#storageMode');
const ideasBody = document.querySelector('#ideasBody');
const ideasBoard = document.querySelector('#ideasBoard');
const ideasTableWrap = document.querySelector('#ideasTableWrap');
const recordCount = document.querySelector('#recordCount');
const stageTabs = document.querySelector('#stageTabs');
const appTabButtons = document.querySelectorAll('[data-app-tab]');
const tabPanels = document.querySelectorAll('[data-tab-panel]');
const viewModeButtons = document.querySelectorAll('[data-view-mode]');
const quickFilters = document.querySelector('#quickFilters');
const projectSearch = document.querySelector('#projectSearch');
const clearFiltersButton = document.querySelector('#clearFiltersButton');
const taskStatusFilter = document.querySelector('#taskStatusFilter');
const taskOwnerFilter = document.querySelector('#taskOwnerFilter');
const taskStoreFilter = document.querySelector('#taskStoreFilter');
const taskWorkTypeFilter = document.querySelector('#taskWorkTypeFilter');
const taskDueFilter = document.querySelector('#taskDueFilter');
const storeWarRoom = document.querySelector('#storeWarRoom');
const storeCards = document.querySelector('#storeCards');
const projectGroups = document.querySelector('#projectGroups');
const projectBoardSummary = document.querySelector('#projectBoardSummary');
const memberTaskGroups = document.querySelector('#memberTaskGroups');
const timelineGroups = document.querySelector('#timelineGroups');
const progressSummary = document.querySelector('#progressSummary');
const progressStatusGrid = document.querySelector('#progressStatusGrid');
const storeProgress = document.querySelector('#storeProgress');
const ownerProgress = document.querySelector('#ownerProgress');
const taskDetailModal = document.querySelector('#taskDetailModal');
const taskModalTitle = document.querySelector('#taskModalTitle');
const taskModalKicker = document.querySelector('#taskModalKicker');
const taskModalBody = document.querySelector('#taskModalBody');
const taskModalEditButton = document.querySelector('#taskModalEditButton');
const taskModalDeleteButton = document.querySelector('#taskModalDeleteButton');
const categoryTree = document.querySelector('#categoryTree');
const allScopeButton = document.querySelector('#allScopeButton');
const allScopeCount = document.querySelector('#allScopeCount');
const boardTitle = document.querySelector('#boardTitle');
const activeScopePath = document.querySelector('#activeScopePath');
const formScopeNote = document.querySelector('#formScopeNote');
const categoryMajorSelect = document.querySelector('#categoryMajorSelect');
const categorySubSelect = document.querySelector('#categorySubSelect');
const workTypeChoices = document.querySelector('#workTypeChoices');
const categoryMajorChoices = document.querySelector('#categoryMajorChoices');
const categorySubChoices = document.querySelector('#categorySubChoices');
const storeChoices = document.querySelector('#storeChoices');
const statusChoices = document.querySelector('#statusChoices');
const scopeFieldMajor = document.querySelector('[data-scope-field="category_major"]');
const scopeFieldSubcategory = document.querySelector('[data-scope-field="category_sub"]');
const scopeFieldStore = document.querySelector('[data-scope-field="store"]');
const photoInput = document.querySelector('#photoInput');
const photoPreview = document.querySelector('#photoPreview');
const mediaStatus = document.querySelector('#mediaStatus');
const snapshotId = document.querySelector('#snapshotId');
const snapshotUpdated = document.querySelector('#snapshotUpdated');
const snapshotStorage = document.querySelector('#snapshotStorage');
const snapshotScope = document.querySelector('#snapshotScope');
const snapshotProject = document.querySelector('#snapshotProject');

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
const API_CATEGORIES_URL = 'api/categories';
const LOCAL_STORAGE_KEY = 'offline-marketing-ideas:v1';
const CATEGORY_STORAGE_KEY = 'offline-marketing-categories:v1';
const CATEGORY_COLLAPSE_STORAGE_KEY = 'offline-marketing-category-collapse:v1';
const VIEW_MODE_STORAGE_KEY = 'offline-marketing-view-mode:v1';
const ACTOR_STORAGE_KEY = 'fly-space-current-actor:v1';
const ACTIVITY_STORAGE_KEY = 'fly-space-activity-log:v1';
const MAX_PHOTOS = 4;
const MAX_ORIGINAL_PHOTO_BYTES = 8 * 1024 * 1024;
const PHOTO_TARGET_BYTES = 420 * 1024;
const VALID_TABS = ['home', 'tasks', 'timeline', 'progress'];
const USERS = ['준호', '동원', '보미', '상준', '유민'];
const TEAMS = [
  { name: '기획/실행팀', members: ['동원', '상준', '유민'] },
  { name: '마케팅팀', members: ['보미', '준호'] }
];
const STORES = ['머문래', '갤러리문래'];
const WORK_TYPES = ['아이디어', '기획안', '프로젝트', '업무'];
const DUE_FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'overdue', label: '지연' },
  { value: 'today', label: '오늘' },
  { value: 'week', label: '이번 주' },
  { value: 'none', label: '기한 없음' }
];
const DEFAULT_CATEGORIES = [
  { id: 'cat_interior', level: 'major', parent_id: '', name: '인테리어', sort_order: 10 },
  { id: 'cat_interior_store', level: 'sub', parent_id: 'cat_interior', name: '매장 환경', sort_order: 11 },
  { id: 'cat_marketing', level: 'major', parent_id: '', name: '마케팅', sort_order: 20 },
  { id: 'cat_marketing_online', level: 'sub', parent_id: 'cat_marketing', name: '온라인마케팅', sort_order: 21 },
  { id: 'cat_marketing_offline', level: 'sub', parent_id: 'cat_marketing', name: '오프라인 마케팅', sort_order: 22 },
  { id: 'cat_project', level: 'major', parent_id: '', name: '프로젝트', sort_order: 30 },
  { id: 'cat_project_plan', level: 'sub', parent_id: 'cat_project', name: '프로젝트 관리', sort_order: 31 }
];
const REMOVED_DEFAULT_CATEGORY_IDS = new Set(['cat_menu', 'cat_menu_new']);

const state = {
  currentClientId: createClientId(),
  currentAttachments: [],
  categories: [],
  ideas: [],
  selectedScope: { kind: 'all', major: '', subcategory: '', store: '' },
  collapsedMajors: readCollapsedMajors(),
  activeTab: readActiveTab(),
  selectedStage: 'all',
  filters: { owner: 'all', store: 'all', workType: 'all', due: 'all', query: '' },
  viewMode: readViewMode(),
  saveTimer: null,
  pendingRequest: Promise.resolve(),
  lastSavedSignature: '',
  modalIdeaId: '',
  editorMode: 'create',
  currentHistory: []
};

initialize();

function readActiveTab() {
  const tab = String(window.location.hash || '').replace('#', '');
  return VALID_TABS.includes(tab) ? tab : 'home';
}

function ensureHashTab() {
  if (window.location.hash && VALID_TABS.includes(window.location.hash.slice(1))) return;
  window.history.replaceState(null, '', '#home');
  state.activeTab = 'home';
}

function setActiveTab(tab) {
  const nextTab = VALID_TABS.includes(tab) ? tab : 'home';
  state.activeTab = nextTab;
  if (window.location.hash !== `#${nextTab}`) {
    window.location.hash = nextTab;
  }
  renderAppTabs();
  if (nextTab === 'timeline') queueTimelineLanding();
}

function renderAppTabs() {
  for (const button of appTabButtons) {
    button.classList.toggle('active', button.dataset.appTab === state.activeTab);
    button.setAttribute('aria-current', button.dataset.appTab === state.activeTab ? 'page' : 'false');
  }
  for (const panel of tabPanels) {
    const active = panel.dataset.tabPanel === state.activeTab;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  }
}

async function initialize() {
  bindAutosave();
  await Promise.all([loadIdeas(), loadCategories()]);
  state.categories = mergeCategories(state.categories);
  ensureHashTab();
  populateTaskFilters();
  renderCategorySelects();
  render();
  if (state.activeTab === 'timeline') queueTimelineLanding();
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
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveEditorNow();
  });
  photoInput.addEventListener('change', handlePhotoSelect);
  photoPreview.addEventListener('click', handlePhotoPreviewClick);
  if (quickFilters) {
    quickFilters.addEventListener('click', handleQuickFilterClick);
  }
  if (projectSearch) {
    projectSearch.addEventListener('input', () => {
      state.filters.query = projectSearch.value.trim();
      render();
    });
  }
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener('click', clearQuickFilters);
  }
  for (const button of appTabButtons) {
    button.addEventListener('click', () => setActiveTab(button.dataset.appTab));
  }
  window.addEventListener('hashchange', () => {
    state.activeTab = readActiveTab();
    renderAppTabs();
    if (state.activeTab === 'timeline') queueTimelineLanding();
  });
  bindTaskFilterControls();
  storeWarRoom.addEventListener('click', handleStoreWarRoomClick);
  projectGroups.addEventListener('click', handleProjectBoardClick);
  projectGroups.addEventListener('keydown', handleProjectBoardKeydown);
  categoryTree.addEventListener('click', handleScopeClick);
  if (allScopeButton) {
    allScopeButton.addEventListener('click', () => setSelectedScope({ kind: 'all', major: '', subcategory: '', store: '' }));
  }
  categoryMajorSelect.addEventListener('change', () => {
    renderSubcategoryOptions(categoryMajorSelect.value, '');
    scheduleSave();
  });
  bindChoiceControls();
  if (editorSaveButton) {
    editorSaveButton.addEventListener('click', saveEditorNow);
  }
  if (editorCloseButton) {
    editorCloseButton.addEventListener('click', closeEditorModal);
  }
  if (inputModal) {
    inputModal.addEventListener('click', (event) => {
      if (event.target.closest('[data-editor-close]')) closeEditorModal();
    });
  }
  for (const button of viewModeButtons) {
    button.addEventListener('click', () => setViewMode(button.dataset.viewMode));
  }
  if (stageTabs) {
    stageTabs.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-stage]');
      if (!button) return;
      state.selectedStage = button.dataset.stage;
      syncTaskFilterControls();
      render();
      setActiveTab('tasks');
      scrollTaskWorkspace();
    });
  }
  if (timelineGroups) {
    timelineGroups.addEventListener('click', handleTimelineClick);
    timelineGroups.addEventListener('keydown', handleTimelineKeydown);
  }
  if (progressStatusGrid) {
    progressStatusGrid.addEventListener('click', handleProgressClick);
  }
  if (memberTaskGroups) {
    memberTaskGroups.addEventListener('click', handleMemberTaskClick);
    memberTaskGroups.addEventListener('keydown', handleMemberTaskKeydown);
  }
  if (taskDetailModal) {
    taskDetailModal.addEventListener('click', handleTaskModalClick);
    document.addEventListener('keydown', handleTaskModalKeydown);
  }
  if (ideasBody) {
    ideasBody.addEventListener('click', (event) => {
      if (event.target.closest('a, button, input, textarea, select')) return;
      const row = event.target.closest('tr[data-id]');
      if (!row) return;
      const idea = state.ideas.find((item) => item.client_id === row.dataset.id);
      if (idea) openTaskModal(idea);
    });
    ideasBody.addEventListener('keydown', (event) => {
      if (!['Enter', ' '].includes(event.key)) return;
      const row = event.target.closest('tr[data-id]');
      if (!row) return;
      event.preventDefault();
      const idea = state.ideas.find((item) => item.client_id === row.dataset.id);
      if (idea) openTaskModal(idea);
    });
  }
  if (ideasBoard) {
    ideasBoard.addEventListener('click', (event) => {
      const card = event.target.closest('[data-id]');
      if (!card) return;
      const idea = state.ideas.find((item) => item.client_id === card.dataset.id);
      if (idea) openTaskModal(idea);
    });
    ideasBoard.addEventListener('keydown', (event) => {
      if (!['Enter', ' '].includes(event.key)) return;
      const card = event.target.closest('[data-id]');
      if (!card) return;
      event.preventDefault();
      const idea = state.ideas.find((item) => item.client_id === card.dataset.id);
      if (idea) openTaskModal(idea);
    });
  }
}

function bindChoiceControls() {
  bindChoiceGroup(workTypeChoices, (value) => {
    form.elements.work_type.value = normalizeWorkType(value);
    renderChoiceControls();
    scheduleSave();
  });
  bindChoiceGroup(categoryMajorChoices, (value) => {
    form.elements.category_major.value = value;
    renderSubcategoryOptions(value, '');
    scheduleSave();
  });
  bindChoiceGroup(categorySubChoices, (value) => {
    form.elements.category_sub.value = value;
    renderChoiceControls();
    scheduleSave();
  });
  bindChoiceGroup(storeChoices, (value) => {
    form.elements.store.value = value;
    renderChoiceControls();
    scheduleSave();
  });
  bindChoiceGroup(statusChoices, (value) => {
    form.elements.status.value = normalizeStatus(value);
    renderChoiceControls();
    scheduleSave();
  });
}

function bindChoiceGroup(container, onChange) {
  if (!container) return;
  container.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-choice-value]');
    if (!button) return;
    onChange(button.dataset.choiceValue || '');
  });
}

function populateTaskFilters() {
  fillSelect(taskOwnerFilter, USERS);
  fillSelect(taskStoreFilter, STORES);
  fillSelect(taskWorkTypeFilter, WORK_TYPES);
  fillSelect(taskDueFilter, DUE_FILTERS.filter((filter) => filter.value !== 'all'), true);
  syncTaskFilterControls();
}

function fillSelect(select, values, valuesAreOptions = false) {
  if (!select) return;
  const current = select.value || 'all';
  const options = valuesAreOptions
    ? values.map((option) => ({ value: option.value, label: option.label }))
    : values.map((value) => ({ value, label: value }));
  select.innerHTML = [
    '<option value="all">전체</option>',
    ...options.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
  ].join('');
  select.value = [...options.map((option) => option.value), 'all'].includes(current) ? current : 'all';
}

function bindTaskFilterControls() {
  if (taskStatusFilter) {
    taskStatusFilter.addEventListener('change', () => {
      state.selectedStage = taskStatusFilter.value || 'all';
      render();
    });
  }
  bindFilterSelect(taskOwnerFilter, 'owner');
  bindFilterSelect(taskStoreFilter, 'store');
  bindFilterSelect(taskWorkTypeFilter, 'workType');
  bindFilterSelect(taskDueFilter, 'due');
}

function bindFilterSelect(select, key) {
  if (!select) return;
  select.addEventListener('change', () => {
    state.filters[key] = select.value || 'all';
    render();
  });
}

function syncTaskFilterControls() {
  if (projectSearch && projectSearch.value !== state.filters.query) {
    projectSearch.value = state.filters.query;
  }
  if (taskStatusFilter) taskStatusFilter.value = state.selectedStage;
  if (taskOwnerFilter) taskOwnerFilter.value = state.filters.owner;
  if (taskStoreFilter) taskStoreFilter.value = state.filters.store;
  if (taskWorkTypeFilter) taskWorkTypeFilter.value = state.filters.workType;
  if (taskDueFilter) taskDueFilter.value = state.filters.due;
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

async function loadCategories() {
  try {
    const response = await fetch(API_CATEGORIES_URL);
    if (!response.ok) throw new Error('categories_unavailable');
    const payload = await response.json();
    state.categories = mergeCategories(payload.categories || []);
  } catch {
    state.categories = mergeCategories(readBrowserCategories());
  }
  saveBrowserCategories(state.categories);
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
  const draft = collectIdea();
  if (!hasMeaningfulInput(draft)) return;
  const signature = JSON.stringify(draft);
  if (signature === state.lastSavedSignature) {
    setSaveState('saved', '저장됨');
    return;
  }
  const action = state.ideas.some((item) => item.client_id === draft.client_id) ? '수정' : '생성';
  const idea = withActionMetadata(draft, action);
  const body = JSON.stringify(idea);
  try {
    const response = await fetch(API_IDEAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    if (!response.ok) throw new Error('save_failed');
    const payload = await response.json();
    const saved = payload.idea;
    state.currentHistory = normalizeHistory(saved);
    state.lastSavedSignature = JSON.stringify(collectIdea());
    upsertIdea(saved);
    updateSnapshot(saved);
    storageMode.textContent = payload.supabaseEnabled ? 'Supabase 연결' : '로컬 저장';
    setSaveState('saved', '저장됨');
    render();
  } catch {
    const saved = saveBrowserIdea(idea);
    state.currentHistory = normalizeHistory(saved);
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
  const raw = rawFormData(data);
  const values = form.elements;
  const owner = values.owner?.value || '';
  const status = normalizeStatus(values.status?.value || data.get('status') || 'idea');
  const priority = values.priority?.value || data.get('priority') || 'medium';
  const ideaType = values.idea_type?.value || data.get('idea_type') || '';
  const budget = normalizeBudget(data.get('budget') || '');
  raw.owner = owner;
  raw.status = status;
  raw.priority = priority;
  raw.idea_type = ideaType;
  raw.budget = budget;
  return {
    client_id: state.currentClientId,
    title: data.get('title') || '',
    work_type: data.get('work_type') || '아이디어',
    project_name: data.get('project_name') || '',
    category_major: data.get('category_major') || '',
    category_sub: data.get('category_sub') || '',
    store: data.get('store') || '',
    owner,
    status,
    priority,
    due_date: normalizeDateInput(data.get('due_date') || ''),
    budget,
    idea_type: ideaType,
    description: data.get('description') || '',
    expected_impact: data.get('expected_impact') || '',
    next_action: data.get('next_action') || '',
    tags: data.getAll('tags'),
    links,
    attachments,
    payload: {
      raw,
      links,
      attachments,
      budget,
      updated_by: latestHistoryActor(state.currentHistory),
      history: normalizeHistory(state.currentHistory)
    }
  };
}

function hasMeaningfulInput(idea) {
  return Boolean(
    idea.title ||
    idea.project_name ||
    idea.store ||
    idea.owner ||
    idea.due_date ||
    idea.budget ||
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
  state.currentHistory = [];
  state.lastSavedSignature = '';
  form.reset();
  applyScopeDefaultsToForm();
  form.querySelector('[name="status"]').value = 'idea';
  form.querySelector('[name="priority"]').value = 'medium';
  renderChoiceControls();
  renderPhotoPreview();
  mediaStatus.textContent = '';
  updateSnapshot(null);
  setSaveState('idle', '대기');
}

function loadIdeaIntoForm(idea) {
  setActiveTab('tasks');
  state.editorMode = 'edit';
  state.currentClientId = idea.client_id;
  form.elements.title.value = idea.title || '';
  form.elements.work_type.value = normalizeWorkType(idea.work_type);
  form.elements.project_name.value = idea.project_name || '';
  form.elements.category_major.value = idea.category_major || '';
  renderSubcategoryOptions(idea.category_major || '', idea.category_sub || '');
  form.elements.store.value = idea.store || '';
  form.elements.owner.value = idea.owner || '';
  form.elements.status.value = normalizeStatus(idea.status);
  form.elements.priority.value = idea.priority || 'medium';
  form.elements.due_date.value = normalizeDateInput(idea.due_date || '');
  form.elements.budget.value = idea.budget || idea.payload?.budget || idea.payload?.raw?.budget || '';
  form.elements.idea_type.value = idea.idea_type || '';
  form.elements.description.value = idea.description || '';
  form.elements.expected_impact.value = idea.expected_impact || '';
  form.elements.next_action.value = idea.next_action || '';
  form.elements.links.value = formatLinks(selectedLinks(idea));
  state.currentAttachments = selectedAttachments(idea);
  state.currentHistory = normalizeHistory(idea);
  renderChoiceControls();
  renderPhotoPreview();
  mediaStatus.textContent = '';
  setSelectedTags(selectedTags(idea));
  state.lastSavedSignature = JSON.stringify(collectIdea());
  updateSnapshot(idea);
  setSaveState('saved', '불러옴');
  openEditorModal('edit');
}

function openEditorModal(mode = 'create') {
  if (!inputModal) return;
  state.editorMode = mode === 'edit' ? 'edit' : 'create';
  if (editorTitle) editorTitle.textContent = state.editorMode === 'edit' ? '업무 수정' : '업무 추가';
  if (form.elements.owner) {
    form.elements.owner.disabled = true;
    form.elements.owner.setAttribute('aria-disabled', 'true');
  }
  renderChoiceControls();
  inputModal.hidden = false;
  inputModal.classList.add('open');
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => form.querySelector('[name="title"]')?.focus());
}

function closeEditorModal() {
  if (!inputModal) return;
  inputModal.classList.remove('open');
  inputModal.hidden = true;
  document.body.classList.remove('modal-open');
}

async function saveEditorNow() {
  clearTimeout(state.saveTimer);
  const idea = collectIdea();
  if (!hasMeaningfulInput(idea)) {
    setSaveState('idle', '입력 필요');
    return;
  }
  setSaveState('saving', '저장 중');
  state.pendingRequest = state.pendingRequest.then(saveCurrentIdea, saveCurrentIdea);
  await state.pendingRequest;
  closeEditorModal();
}

function upsertIdea(idea) {
  const index = state.ideas.findIndex((item) => item.client_id === idea.client_id);
  if (index >= 0) state.ideas[index] = idea;
  else state.ideas.unshift(idea);
  state.ideas.sort((a, b) => `${b.updated_at || ''}${b.created_at || ''}`.localeCompare(`${a.updated_at || ''}${a.created_at || ''}`));
}

function render() {
  renderAppTabs();
  renderScopeHeader();
  updateScopeControlledFields();
  syncTaskFilterControls();
  renderStoreWarRoom();
  if (quickFilters) renderQuickFilters();
  renderCategoryTree();
  renderMetrics();
  renderStageTabs();
  renderProjectGroups();
  renderMemberTasks();
  renderRecords();
  renderTimeline();
  renderProgress();
}

function renderMetrics() {
  if (!Object.values(metrics).every(Boolean)) return;
  const totals = scopedIdeas().reduce((acc, idea) => {
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
  if (!stageTabs) return;
  const counts = scopedIdeas().reduce((acc, idea) => {
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

function renderStoreWarRoom() {
  storeCards.innerHTML = STORES.map((store) => {
    const summary = storeSummary(store);
    const scope = { kind: 'store', major: '', subcategory: '', store };
    const active = scopeActive(scope);
    return `
      <button type="button" class="store-room-card ${active ? 'active' : ''}" data-store-room="${escapeHtml(store)}">
        <span class="store-room-name">${escapeHtml(store)}</span>
        <strong>${summary.total.toLocaleString('ko-KR')}</strong>
        <span class="store-room-meta">
          <b><small>프로젝트</small>${summary.projects.toLocaleString('ko-KR')}</b>
          <b><small>지연</small>${summary.overdue.toLocaleString('ko-KR')}</b>
        </span>
        <span class="store-room-stages">
          ${Object.entries(labels.status).map(([status, label]) => `<em><small>${escapeHtml(label)}</small>${summary.statuses[status] || 0}</em>`).join('')}
        </span>
      </button>
    `;
  }).join('');
}

function storeSummary(store) {
  const scope = normalizeScope(state.selectedScope);
  const ideas = state.ideas.filter((idea) => {
    if (idea.store !== store) return false;
    if (scope.major && idea.category_major !== scope.major) return false;
    if (scope.subcategory && idea.category_sub !== scope.subcategory) return false;
    return true;
  });
  const projects = new Set(ideas.map(projectLabel)).size;
  const statuses = ideas.reduce((acc, idea) => {
    const status = normalizeStatus(idea.status);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const overdue = ideas.filter((idea) => matchesDueFilter(idea, 'overdue')).length;
  return { total: ideas.length, projects, overdue, statuses };
}

function renderProjectGroups() {
  if (!projectGroups || !projectBoardSummary) return;
  const ideas = projectSummaryIdeas();
  const groups = groupByProject(ideas);
  const selectedStore = normalizeScope(state.selectedScope).store;
  projectBoardSummary.textContent = selectedStore
    ? `${selectedStore} 매장의 프로젝트 ${groups.length.toLocaleString('ko-KR')}개`
    : `전체 매장의 프로젝트 ${groups.length.toLocaleString('ko-KR')}개`;

  if (!groups.length) {
    projectGroups.innerHTML = `
      <div class="project-empty">
        <strong>아직 프로젝트 업무가 없습니다.</strong>
        <span>매장을 선택하고 아래 작성 영역에서 프로젝트명과 업무를 입력하면 이곳에 자동으로 묶입니다.</span>
      </div>
    `;
    return;
  }

  projectGroups.innerHTML = groups.map((group) => `
    <article class="project-group-card">
      <header>
        <div>
          <span>${escapeHtml(group.storeLabel)}</span>
          <h4>${escapeHtml(group.project)}</h4>
        </div>
        <button type="button" data-project-name="${escapeHtml(group.project)}">보기</button>
      </header>
      <div class="project-status-row">
        ${Object.entries(labels.status).map(([status, label]) => `<span>${escapeHtml(label)} <b>${group.statuses[status] || 0}</b></span>`).join('')}
      </div>
      <div class="project-task-list">
        ${group.ideas.slice(0, 4).map(renderProjectTask).join('')}
      </div>
    </article>
  `).join('');
}

function projectSummaryIdeas() {
  return state.ideas.filter((idea) => matchesScope(idea, state.selectedScope));
}

function renderMemberTasks() {
  if (!memberTaskGroups) return;
  const ideas = visibleIdeas();
  const assignedOwners = new Set(TEAMS.flatMap((team) => team.members));
  const unassignedItems = ideas.filter((idea) => !assignedOwners.has(idea.owner));
  const teamSections = TEAMS.map((team) => {
    const total = team.members.reduce((sum, member) => sum + ideas.filter((idea) => idea.owner === member).length, 0);
    return `
      <section class="member-team-group">
        <header>
          <div>
            <h4>${escapeHtml(team.name)}</h4>
            <span>${total.toLocaleString('ko-KR')}개 업무</span>
          </div>
        </header>
        <div class="member-task-grid">
          ${team.members.map((member) => renderMemberColumn(member, ideas.filter((idea) => idea.owner === member))).join('')}
        </div>
      </section>
    `;
  });

  const extraSection = unassignedItems.length ? `
    <section class="member-team-group">
      <header>
        <div>
          <h4>미지정</h4>
          <span>${unassignedItems.length.toLocaleString('ko-KR')}개 업무</span>
        </div>
      </header>
      <div class="member-task-grid">
        ${renderMemberColumn('미지정', unassignedItems)}
      </div>
    </section>
  ` : '';

  memberTaskGroups.innerHTML = [...teamSections, extraSection].join('');
}

function renderMemberColumn(owner, items) {
  return `
    <section class="member-task-group">
      <header>
        <div>
          <h5>${escapeHtml(owner)}</h5>
          <span>${items.length.toLocaleString('ko-KR')}개</span>
        </div>
        <button type="button" data-owner-new="${escapeHtml(owner)}">추가</button>
      </header>
      <div class="member-task-list">
        ${items.length ? items.map(renderMemberTaskCard).join('') : '<p>업무 없음</p>'}
      </div>
    </section>
  `;
}

function renderMemberTaskCard(idea) {
  return `
    <article class="member-task-card" data-member-task="${escapeHtml(idea.client_id)}" role="button" tabindex="0">
      <div>
        <strong>${escapeHtml(idea.title || '제목 없음')}</strong>
        <span>${escapeHtml(taskMeta([idea.project_name, idea.store || '매장 전체']))}</span>
      </div>
      <footer>
        <span>${escapeHtml(statusName(idea.status))}</span>
        ${renderDueBadge(idea)}
      </footer>
    </article>
  `;
}

function renderProjectTask(idea) {
  return `
    <article class="project-task" data-project-task="${escapeHtml(idea.client_id)}" role="button" tabindex="0">
      <div>
        <strong>${escapeHtml(idea.title || '제목 없음')}</strong>
        <span>${escapeHtml([idea.owner || '담당자 미정', idea.store || '매장 전체', statusName(idea.status)].join(' · '))}</span>
      </div>
      ${renderDueBadge(idea)}
    </article>
  `;
}

function groupByProject(ideas) {
  const groups = new Map();
  for (const idea of ideas) {
    const project = projectLabel(idea);
    const key = `${project}|${idea.store || '전체'}`;
    if (!groups.has(key)) {
      groups.set(key, {
        project,
        storeLabel: idea.store || '전체 매장',
        ideas: [],
        statuses: {}
      });
    }
    const group = groups.get(key);
    group.ideas.push(idea);
    const status = normalizeStatus(idea.status);
    group.statuses[status] = (group.statuses[status] || 0) + 1;
  }
  return [...groups.values()].sort((a, b) => {
    const newestA = a.ideas[0]?.updated_at || a.ideas[0]?.created_at || '';
    const newestB = b.ideas[0]?.updated_at || b.ideas[0]?.created_at || '';
    return newestB.localeCompare(newestA) || a.project.localeCompare(b.project, 'ko-KR');
  });
}

function projectLabel(idea) {
  return String(idea.project_name || '').trim() || '일반 업무';
}

function taskMeta(values) {
  return values.map((value) => String(value || '').trim()).filter(Boolean).join(' · ');
}

function visibleIdeas() {
  const scoped = scopedIdeas();
  return state.selectedStage === 'all'
    ? scoped
    : scoped.filter((idea) => normalizeStatus(idea.status) === state.selectedStage);
}

function renderRecords() {
  if (!recordCount || !ideasTableWrap || !ideasBoard || !ideasBody) return;
  const ideas = visibleIdeas();
  recordCount.textContent = `${ideas.length}개 · ${viewLabel()}`;
  renderViewMode();
  renderTable(ideas);
  renderBoard(ideas);
}

function renderViewMode() {
  if (!ideasTableWrap || !ideasBoard) return;
  const isBoard = state.viewMode === 'board';
  ideasTableWrap.hidden = isBoard;
  ideasBoard.hidden = !isBoard;
  for (const button of viewModeButtons) {
    button.classList.toggle('active', button.dataset.viewMode === state.viewMode);
  }
}

function renderTable(ideas) {
  if (!ideasBody) return;
  if (!ideas.length) {
    ideasBody.innerHTML = '<tr class="empty-row"><td colspan="10">업무 없음</td></tr>';
    return;
  }
  ideasBody.innerHTML = ideas.slice(0, 120).map((idea) => `
    <tr data-id="${escapeHtml(idea.client_id)}" role="button" tabindex="0">
      <td data-label="제목">
        <strong>${escapeHtml(idea.title || '제목 없음')}</strong>
        ${renderWorkMeta(idea)}
        <small>${escapeHtml(summaryText(idea.description))}</small>
        ${renderLinks(idea.links)}
      </td>
      <td data-label="카테고리">${renderCategoryCell(idea)}</td>
      <td data-label="매장">${escapeHtml(idea.store || '')}</td>
      <td data-label="담당자">${escapeHtml(idea.owner || '')}</td>
      <td data-label="상태"><span class="chip status-${escapeHtml(normalizeStatus(idea.status))}">${escapeHtml(statusName(idea.status))}</span></td>
      <td data-label="우선순위"><span class="chip priority-${escapeHtml(idea.priority || 'medium')}">${escapeHtml(priorityName(idea.priority))}</span></td>
      <td data-label="기한">${renderDueBadge(idea)}</td>
      <td data-label="유형">${escapeHtml(idea.idea_type || '')}</td>
      <td data-label="첨부">${renderAttachmentSummary(idea)}</td>
      <td data-label="수정일">${escapeHtml(formatDateTime(idea.updated_at))}</td>
    </tr>
  `).join('');
}

function renderBoard(ideas) {
  if (!ideasBoard) return;
  const columns = Object.entries(labels.status);
  ideasBoard.innerHTML = columns.map(([status, label]) => {
    const items = ideas.filter((idea) => normalizeStatus(idea.status) === status);
    return `
      <section class="board-column">
        <header>
          <span>${escapeHtml(label)}</span>
          <strong>${items.length.toLocaleString('ko-KR')}</strong>
        </header>
        <div class="board-card-list">
          ${items.length ? items.map(renderBoardCard).join('') : '<p class="board-column-empty">비어 있음</p>'}
        </div>
      </section>
    `;
  }).join('');
}

function renderBoardCard(idea) {
  return `
    <article class="board-card" data-id="${escapeHtml(idea.client_id)}" role="button" tabindex="0">
      <div class="board-card-topline">
        <span>${escapeHtml(normalizeWorkType(idea.work_type))}</span>
        ${renderDueBadge(idea)}
      </div>
      <h4>${escapeHtml(idea.title || '제목 없음')}</h4>
      ${idea.project_name ? `<p class="board-project">${escapeHtml(idea.project_name)}</p>` : ''}
      <p>${escapeHtml(summaryText(idea.description || idea.next_action || '내용 없음'))}</p>
      <footer>
        <span>${escapeHtml(idea.owner || '담당자 미정')}</span>
        <span>${escapeHtml(idea.store || '매장 전체')}</span>
      </footer>
    </article>
  `;
}

function renderTimeline() {
  if (!timelineGroups) return;
  const groups = buildTimelineGroups(scopedIdeas());
  if (!groups.some((group) => group.items.length)) {
    timelineGroups.innerHTML = `
      <div class="timeline-empty">
        <strong>표시할 일정이 없습니다.</strong>
        <span>개별업무에서 기한을 입력하면 이곳에 자동으로 정리됩니다.</span>
      </div>
    `;
    return;
  }

  timelineGroups.innerHTML = groups.map((group) => {
    const timelineState = timelineGroupState(group.key);
    return `
    <section class="timeline-group timeline-${escapeHtml(timelineState)}" data-timeline-state="${escapeHtml(timelineState)}">
      <header>
        <div>
          <h4>${escapeHtml(group.label)}</h4>
          <span>${escapeHtml(group.caption)}</span>
        </div>
        <strong>${group.items.length.toLocaleString('ko-KR')}</strong>
      </header>
      <div class="timeline-item-list">
        ${group.items.length ? group.items.map(renderTimelineItem).join('') : '<p>비어 있음</p>'}
      </div>
    </section>
  `;
  }).join('');
}

function buildTimelineGroups(ideas) {
  const groupByKey = new Map();
  for (const idea of ideas) {
    const dueDate = normalizeDateInput(idea.due_date || idea.payload?.due_date || '');
    const key = dueDate || 'none';
    if (!groupByKey.has(key)) {
      groupByKey.set(key, {
        key,
        label: dueDate ? formatTimelineDate(dueDate) : '기한 없음',
        caption: dueDate ? timelineDateCaption(dueDate) : '날짜를 정하지 않은 업무',
        items: []
      });
    }
    groupByKey.get(key).items.push(idea);
  }
  const groups = [...groupByKey.values()].sort(compareTimelineGroups);
  for (const group of groups) {
    group.items.sort(compareTimelineItems);
  }
  return groups;
}

function compareTimelineGroups(a, b) {
  if (a.key === 'none') return 1;
  if (b.key === 'none') return -1;
  return a.key.localeCompare(b.key);
}

function compareTimelineItems(a, b) {
  const aDate = normalizeDateInput(a.due_date || '');
  const bDate = normalizeDateInput(b.due_date || '');
  if (aDate && bDate && aDate !== bDate) return aDate.localeCompare(bDate);
  if (aDate && !bDate) return -1;
  if (!aDate && bDate) return 1;
  return `${b.updated_at || ''}${b.created_at || ''}`.localeCompare(`${a.updated_at || ''}${a.created_at || ''}`);
}

function renderTimelineItem(idea) {
  const timelineState = timelineGroupState(normalizeDateInput(idea.due_date || idea.payload?.due_date || '') || 'none');
  const team = teamNameForOwner(idea.owner);
  const part = timelinePartLabel(idea);
  return `
    <article class="timeline-item timeline-${escapeHtml(timelineState)}" data-timeline-task="${escapeHtml(idea.client_id)}" role="button" tabindex="0">
      <div>
        <strong>${escapeHtml(idea.title || '제목 없음')}</strong>
        <span>${escapeHtml(taskMeta([idea.owner || '담당자 미정', team, part, idea.store || '매장 전체', idea.project_name]))}</span>
      </div>
      <div class="timeline-item-meta">
        <span>${escapeHtml(statusName(idea.status))}</span>
        ${renderDueBadge(idea)}
      </div>
    </article>
  `;
}

function timelineGroupState(key) {
  if (!key || key === 'none') return 'none';
  const target = dateOnlyTime(key);
  const today = todayTime();
  if (target < today) return 'past';
  if (target === today) return 'today';
  return 'future';
}

function queueTimelineLanding() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(scrollTimelineToToday);
  });
}

function scrollTimelineToToday() {
  if (state.activeTab !== 'timeline' || !timelineGroups) return;
  const target = timelineGroups.querySelector('[data-timeline-state="today"]') ||
    timelineGroups.querySelector('[data-timeline-state="future"]') ||
    timelineGroups.querySelector('[data-timeline-state="none"]') ||
    timelineGroups.querySelector('.timeline-group');
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatTimelineDate(value) {
  const [year, month, day] = normalizeDateInput(value).split('-').map(Number);
  if (!year || !month || !day) return '기한 없음';
  return new Date(year, month - 1, day).toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  });
}

function timelineDateCaption(value) {
  const time = dateOnlyTime(value);
  const today = todayTime();
  if (time === today) return '오늘';
  if (time < today) return '지난 일정';
  const diffDays = Math.round((time - today) / (24 * 60 * 60 * 1000));
  return `${diffDays.toLocaleString('ko-KR')}일 후`;
}

function renderProgress() {
  if (!progressStatusGrid) return;
  const ideas = scopedIdeas();
  const total = ideas.length;
  const done = ideas.filter((idea) => normalizeStatus(idea.status) === 'done').length;
  const doneRate = total ? Math.round((done / total) * 100) : 0;
  if (progressSummary) {
    progressSummary.textContent = `전체 완료율 ${doneRate}% · 완료 ${done.toLocaleString('ko-KR')} / 전체 ${total.toLocaleString('ko-KR')}`;
  }

  const statusCounts = ideas.reduce((acc, idea) => {
    const status = normalizeStatus(idea.status);
    acc[status] += 1;
    return acc;
  }, { idea: 0, discussion: 0, planning: 0, progress: 0, done: 0 });

  progressStatusGrid.innerHTML = Object.entries(labels.status).map(([status, label]) => {
    const count = statusCounts[status] || 0;
    const rate = total ? Math.round((count / total) * 100) : 0;
    return `
      <button type="button" class="progress-status-card" data-progress-stage="${escapeHtml(status)}">
        <span>${escapeHtml(label)}</span>
        <strong>${count.toLocaleString('ko-KR')}</strong>
        <em>${rate}%</em>
      </button>
    `;
  }).join('');

  renderProgressList(storeProgress, STORES.map((store) => progressRow(store, ideas.filter((idea) => idea.store === store))));
  renderProgressList(ownerProgress, USERS.map((owner) => progressRow(owner, ideas.filter((idea) => idea.owner === owner))));
}

function progressRow(label, ideas) {
  const total = ideas.length;
  const done = ideas.filter((idea) => normalizeStatus(idea.status) === 'done').length;
  const doing = ideas.filter((idea) => normalizeStatus(idea.status) === 'progress').length;
  const overdue = ideas.filter((idea) => matchesDueFilter(idea, 'overdue')).length;
  return {
    label,
    total,
    done,
    doing,
    overdue,
    rate: total ? Math.round((done / total) * 100) : 0
  };
}

function renderProgressList(container, rows) {
  if (!container) return;
  container.innerHTML = rows.map((row) => `
    <article class="progress-row">
      <div>
        <strong>${escapeHtml(row.label)}</strong>
        <span>완료 ${row.done.toLocaleString('ko-KR')} · 진행 ${row.doing.toLocaleString('ko-KR')} · 지연 ${row.overdue.toLocaleString('ko-KR')}</span>
      </div>
      <div class="progress-row-meter" aria-label="${escapeHtml(`${row.label} 완료율 ${row.rate}%`)}">
        <span style="width: ${row.rate}%"></span>
      </div>
      <b>${row.rate}%</b>
    </article>
  `).join('');
}

function updateSnapshot(idea) {
  if (!snapshotId) return;
  snapshotId.textContent = idea?.client_id || state.currentClientId || '-';
  snapshotUpdated.textContent = idea?.updated_at ? new Date(idea.updated_at).toLocaleString('ko-KR') : '-';
  snapshotStorage.textContent = idea?.remote_status === 'synced'
    ? 'Supabase + 로컬'
    : idea?.remote_status === 'browser_only'
      ? '브라우저'
      : idea
        ? '로컬'
        : '-';
  snapshotScope.textContent = idea ? ideaScopeLabel(idea) : scopeLabel(state.selectedScope);
  snapshotProject.textContent = idea?.project_name || '-';
}

function setSaveState(kind, label) {
  if (!saveStatus) return;
  const shouldHide = kind === 'idle' && label === '대기';
  saveStatus.hidden = shouldHide;
  if (shouldHide) return;
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

function dueFilterName(value) {
  return DUE_FILTERS.find((filter) => filter.value === value)?.label || '';
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

function handleStoreWarRoomClick(event) {
  const button = event.target.closest('[data-store-room]');
  if (!button) return;
  state.filters.store = 'all';
  setSelectedScope({ kind: 'store', major: '', subcategory: '', store: button.dataset.storeRoom || '' });
}

function handleProjectBoardClick(event) {
  const projectButton = event.target.closest('[data-project-name]');
  if (projectButton) {
    state.filters.query = projectButton.dataset.projectName || '';
    if (projectSearch) projectSearch.value = state.filters.query;
    state.selectedStage = 'all';
    syncTaskFilterControls();
    setActiveTab('tasks');
    render();
    scrollTaskWorkspace();
    return;
  }

  const task = event.target.closest('[data-project-task]');
  if (!task) return;
  const idea = state.ideas.find((item) => item.client_id === task.dataset.projectTask);
  if (idea) openTaskModal(idea);
}

function handleProjectBoardKeydown(event) {
  if (!['Enter', ' '].includes(event.key)) return;
  const task = event.target.closest('[data-project-task]');
  if (!task) return;
  event.preventDefault();
  const idea = state.ideas.find((item) => item.client_id === task.dataset.projectTask);
  if (idea) openTaskModal(idea);
}

function handleMemberTaskClick(event) {
  const newButton = event.target.closest('[data-owner-new]');
  if (newButton) {
    startNewTaskForOwner(newButton.dataset.ownerNew || '');
    return;
  }

  const card = event.target.closest('[data-member-task]');
  if (!card) return;
  const idea = state.ideas.find((item) => item.client_id === card.dataset.memberTask);
  if (idea) openTaskModal(idea);
}

function handleMemberTaskKeydown(event) {
  if (!['Enter', ' '].includes(event.key)) return;
  const card = event.target.closest('[data-member-task]');
  if (!card) return;
  event.preventDefault();
  const idea = state.ideas.find((item) => item.client_id === card.dataset.memberTask);
  if (idea) openTaskModal(idea);
}

function startNewTaskForOwner(owner) {
  resetForm();
  if (owner && owner !== '미지정') {
    form.elements.owner.value = owner;
  }
  setActiveTab('tasks');
  openEditorModal('create');
}

function handleTimelineClick(event) {
  const item = event.target.closest('[data-timeline-task]');
  if (!item) return;
  const idea = state.ideas.find((candidate) => candidate.client_id === item.dataset.timelineTask);
  if (idea) openTaskModal(idea);
}

function handleTimelineKeydown(event) {
  if (!['Enter', ' '].includes(event.key)) return;
  const item = event.target.closest('[data-timeline-task]');
  if (!item) return;
  event.preventDefault();
  const idea = state.ideas.find((candidate) => candidate.client_id === item.dataset.timelineTask);
  if (idea) openTaskModal(idea);
}

function openTaskModal(idea) {
  if (!taskDetailModal || !taskModalTitle || !taskModalBody) return;
  state.modalIdeaId = idea.client_id;
  taskModalTitle.textContent = idea.title || '제목 없음';
  if (taskModalKicker) {
    taskModalKicker.textContent = taskMeta([idea.store || '매장 전체', idea.project_name]);
  }
  taskModalBody.innerHTML = renderTaskModalBody(idea);
  taskDetailModal.hidden = false;
  taskDetailModal.classList.add('open');
  document.body.classList.add('modal-open');
  taskDetailModal.querySelector('[data-modal-close]')?.focus();
}

function closeTaskModal() {
  if (!taskDetailModal) return;
  taskDetailModal.classList.remove('open');
  taskDetailModal.hidden = true;
  document.body.classList.remove('modal-open');
  state.modalIdeaId = '';
}

function handleTaskModalClick(event) {
  if (event.target.closest('[data-modal-close]')) {
    closeTaskModal();
    return;
  }
  if (event.target === taskModalEditButton || event.target.closest('#taskModalEditButton')) {
    const idea = state.ideas.find((item) => item.client_id === state.modalIdeaId);
    closeTaskModal();
    if (idea) loadIdeaIntoForm(idea);
    return;
  }
  if (event.target === taskModalDeleteButton || event.target.closest('#taskModalDeleteButton')) {
    deleteCurrentModalIdea();
  }
}

async function deleteCurrentModalIdea() {
  const idea = state.ideas.find((item) => item.client_id === state.modalIdeaId);
  if (!idea) return;
  const ok = window.confirm(`"${idea.title || '제목 없음'}" 업무를 삭제할까요?`);
  if (!ok) return;
  const actor = currentActor();
  recordBrowserActivity('삭제', idea, actor);
  setSaveState('saving', '삭제 중');
  try {
    const response = await fetch(`${API_IDEAS_URL}/${encodeURIComponent(idea.client_id)}?actor=${encodeURIComponent(actor)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('delete_failed');
    const payload = await response.json();
    storageMode.textContent = payload.supabaseEnabled ? 'Supabase 연결' : '로컬 저장';
  } catch {
    deleteBrowserIdea(idea.client_id);
    storageMode.textContent = '브라우저 저장';
  }
  state.ideas = state.ideas.filter((item) => item.client_id !== idea.client_id);
  if (state.currentClientId === idea.client_id) {
    resetForm();
  }
  closeTaskModal();
  updateSnapshot(null);
  setSaveState('saved', '삭제됨');
  render();
}

function handleTaskModalKeydown(event) {
  if (event.key === 'Escape' && taskDetailModal && !taskDetailModal.hidden) {
    closeTaskModal();
    return;
  }
  if (event.key === 'Escape' && inputModal && !inputModal.hidden) {
    closeEditorModal();
  }
}

function renderTaskModalBody(idea) {
  const links = renderLinks(idea.links);
  const attachments = selectedAttachments(idea);
  const rows = [
    ['담당자', idea.owner || '담당자 미정'],
    ['상태', statusName(idea.status)],
    ['기한', formatDate(normalizeDateInput(idea.due_date || '')) || '기한 없음'],
    ['예산', formatBudget(idea.budget || idea.payload?.budget || idea.payload?.raw?.budget)],
    ['작업자', latestActorLabel(idea)],
    ['우선순위', priorityName(idea.priority)],
    ['구분', normalizeWorkType(idea.work_type)],
    ['카테고리', ideaScopeLabel(idea)]
  ];
  return `
    <dl class="task-modal-meta">
      ${rows.map(([label, value]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>
      `).join('')}
    </dl>
    ${renderModalTextSection('내용', idea.description)}
    ${renderModalTextSection('기대 효과', idea.expected_impact)}
    ${renderModalTextSection('다음 액션', idea.next_action)}
    ${links ? `<section class="task-modal-section"><h4>링크</h4>${links}</section>` : ''}
    ${attachments.length ? `
      <section class="task-modal-section">
        <h4>사진</h4>
        <div class="task-modal-photos">
          ${attachments.map((attachment) => `<img src="${escapeHtml(attachment.data_url)}" alt="${escapeHtml(attachment.name)}">`).join('')}
        </div>
      </section>
    ` : ''}
  `;
}

function renderModalTextSection(label, value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return `
    <section class="task-modal-section">
      <h4>${escapeHtml(label)}</h4>
      <p>${escapeHtml(text)}</p>
    </section>
  `;
}

function handleProgressClick(event) {
  const button = event.target.closest('[data-progress-stage]');
  if (!button) return;
  state.selectedStage = button.dataset.progressStage || 'all';
  syncTaskFilterControls();
  setActiveTab('tasks');
  render();
  scrollTaskWorkspace();
}

function scrollTaskWorkspace() {
  document.querySelector('#memberTasks')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleQuickFilterClick(event) {
  const scopeButton = event.target.closest('button[data-scope-kind]');
  if (scopeButton) {
    setSelectedScope({
      kind: scopeButton.dataset.scopeKind,
      major: scopeButton.dataset.major || '',
      subcategory: scopeButton.dataset.subcategory || '',
      store: scopeButton.dataset.store || ''
    });
    return;
  }

  const button = event.target.closest('button[data-filter-key]');
  if (!button) return;
  state.filters[button.dataset.filterKey] = button.dataset.filterValue;
  render();
}

function clearQuickFilters() {
  state.filters = { owner: 'all', store: 'all', workType: 'all', due: 'all', query: '' };
  state.selectedStage = 'all';
  if (projectSearch) projectSearch.value = '';
  syncTaskFilterControls();
  setSelectedScope({ kind: 'all', major: '', subcategory: '', store: '' });
}

function renderQuickFilters() {
  if (!quickFilters) return;
  renderScopeFilterLane('major');
  renderScopeFilterLane('subcategory');
  renderFilterLane('owner', USERS);
  renderDueFilterLane();
  renderFilterLane('store', STORES);
  renderFilterLane('workType', WORK_TYPES);
  if (clearFiltersButton) {
    clearFiltersButton.disabled = !hasActiveQuickFilters();
  }
}

function renderScopeFilterLane(kind) {
  const container = quickFilters.querySelector(`[data-scope-options="${kind}"]`);
  if (!container) return;

  const current = normalizeScope(state.selectedScope);
  const options = kind === 'major'
    ? [
      { label: '전체', scope: { kind: 'all', major: '', subcategory: '', store: '' } },
      ...majorCategories().map((major) => ({
        label: major.name,
        scope: { kind: 'major', major: major.name, subcategory: '', store: '' }
      }))
    ]
    : subcategoryScopeOptions(current);

  container.innerHTML = options.map((option) => {
    const scope = normalizeScope(option.scope);
    const active = scopeActive(scope);
    return `
      <button type="button" class="${active ? 'active' : ''}"
        data-scope-kind="${escapeHtml(scope.kind)}"
        data-major="${escapeHtml(scope.major)}"
        data-subcategory="${escapeHtml(scope.subcategory)}"
        data-store="${escapeHtml(scope.store)}">
        <span>${escapeHtml(option.label)}</span>
        <strong>${countIdeas(scope).toLocaleString('ko-KR')}</strong>
      </button>
    `;
  }).join('');
}

function subcategoryScopeOptions(current) {
  const selectedMajor = current.major
    ? majorCategories().find((major) => major.name === current.major)
    : null;
  const baseScope = selectedMajor
    ? { kind: 'major', major: selectedMajor.name, subcategory: '', store: '' }
    : { kind: 'all', major: '', subcategory: '', store: '' };
  const majors = selectedMajor ? [selectedMajor] : majorCategories();
  const options = [{ label: '전체', scope: baseScope }];

  for (const major of majors) {
    for (const subcategory of subCategories(major.id)) {
      options.push({
        label: selectedMajor ? subcategory.name : `${major.name} / ${subcategory.name}`,
        scope: { kind: 'subcategory', major: major.name, subcategory: subcategory.name, store: '' }
      });
    }
  }

  return options;
}

function renderFilterLane(key, values) {
  const container = quickFilters.querySelector(`[data-filter-options="${key}"]`);
  const options = ['all', ...values];
  container.innerHTML = options.map((value) => {
    const label = value === 'all' ? '전체' : value;
    const active = state.filters[key] === value;
    return `
      <button type="button" class="${active ? 'active' : ''}"
        data-filter-key="${escapeHtml(key)}"
        data-filter-value="${escapeHtml(value)}">
        <span>${escapeHtml(label)}</span>
        <strong>${countForFilter(key, value).toLocaleString('ko-KR')}</strong>
      </button>
    `;
  }).join('');
}

function renderDueFilterLane() {
  const container = quickFilters.querySelector('[data-filter-options="due"]');
  if (!container) return;
  container.innerHTML = DUE_FILTERS.map((option) => {
    const active = state.filters.due === option.value;
    return `
      <button type="button" class="${active ? 'active' : ''}"
        data-filter-key="due"
        data-filter-value="${escapeHtml(option.value)}">
        <span>${escapeHtml(option.label)}</span>
        <strong>${countForFilter('due', option.value).toLocaleString('ko-KR')}</strong>
      </button>
    `;
  }).join('');
}

function countForFilter(key, value) {
  const filters = { ...state.filters, [key]: value };
  return state.ideas.filter((idea) => matchesScope(idea, state.selectedScope) && matchesQuickFilters(idea, filters)).length;
}

function hasActiveQuickFilters() {
  return state.selectedScope.kind !== 'all' ||
    state.filters.owner !== 'all' ||
    state.filters.store !== 'all' ||
    state.filters.workType !== 'all' ||
    state.filters.due !== 'all' ||
    Boolean(state.filters.query);
}

function viewLabel() {
  const filters = [
    state.filters.owner !== 'all' ? state.filters.owner : '',
    state.filters.store !== 'all' ? state.filters.store : '',
    state.filters.workType !== 'all' ? state.filters.workType : '',
    state.filters.due !== 'all' ? dueFilterName(state.filters.due) : '',
    state.filters.query ? `"${state.filters.query}"` : ''
  ].filter(Boolean);
  return [scopeLabel(state.selectedScope), ...filters].join(' · ');
}

function setViewMode(mode) {
  state.viewMode = mode === 'board' ? 'board' : 'list';
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, state.viewMode);
  } catch {
    // View mode can fall back to list without affecting stored ideas.
  }
  renderRecords();
}

function handleScopeClick(event) {
  const button = event.target.closest('button[data-scope-kind]');
  if (!button) return;
  const scope = {
    kind: button.dataset.scopeKind,
    major: button.dataset.major || '',
    subcategory: button.dataset.subcategory || '',
    store: button.dataset.store || ''
  };

  if (scope.kind === 'major') {
    setSelectedMajorScope(scope, button.dataset.categoryId || '');
    return;
  }

  setSelectedScope(scope);
}

function setSelectedScope(scope) {
  state.selectedScope = normalizeScope(scope);
  expandSelectedMajor();
  if (!state.lastSavedSignature) applyScopeDefaultsToForm();
  render();
}

function setSelectedMajorScope(scope, categoryId) {
  state.selectedScope = normalizeScope(scope);
  toggleMajorCategory(categoryId);
  if (!state.lastSavedSignature) applyScopeDefaultsToForm();
  render();
}

function toggleMajorCategory(categoryId) {
  if (!categoryId) return;
  if (state.collapsedMajors.has(categoryId)) {
    state.collapsedMajors.delete(categoryId);
  } else {
    state.collapsedMajors.add(categoryId);
  }
  saveCollapsedMajors(state.collapsedMajors);
}

function expandSelectedMajor() {
  const selectedMajor = majorCategories().find((category) => category.name === state.selectedScope.major);
  if (!selectedMajor || !state.collapsedMajors.has(selectedMajor.id)) return;
  state.collapsedMajors.delete(selectedMajor.id);
  saveCollapsedMajors(state.collapsedMajors);
}

function applyScopeDefaultsToForm() {
  form.elements.category_major.value = state.selectedScope.major || '';
  renderSubcategoryOptions(state.selectedScope.major || '', state.selectedScope.subcategory || '');
  form.elements.store.value = state.selectedScope.store || '';
}

function renderScopeHeader() {
  const label = scopeLabel(state.selectedScope);
  const heading = scopeHeading(state.selectedScope);
  if (boardTitle) boardTitle.textContent = heading.title;
  activeScopePath.textContent = heading.context;
  formScopeNote.textContent = label;
  if (allScopeButton) {
    allScopeButton.classList.toggle('active', state.selectedScope.kind === 'all');
  }
  if (allScopeCount) {
    allScopeCount.textContent = state.ideas.filter((idea) => matchesQuickFilters(idea, state.filters)).length.toLocaleString('ko-KR');
  }
}

function updateScopeControlledFields() {
  const scope = normalizeScope(state.selectedScope);
  scopeFieldMajor.hidden = scope.kind !== 'all';
  scopeFieldSubcategory.hidden = ['subcategory', 'store'].includes(scope.kind);
  scopeFieldStore.hidden = scope.kind === 'store';
}

function renderCategoryTree() {
  const majors = majorCategories();
  categoryTree.innerHTML = majors.map((major) => {
    const majorScope = { kind: 'major', major: major.name, subcategory: '', store: '' };
    const subs = subCategories(major.id);
    const hasChildren = subs.length > 0;
    const collapsed = hasChildren && state.collapsedMajors.has(major.id);
    const panelId = `category-panel-${major.id}`;
    const children = subs.map((subcategory) => {
      const subScope = { kind: 'subcategory', major: major.name, subcategory: subcategory.name, store: '' };
      const stores = STORES.map((store) => {
        const storeScope = { kind: 'store', major: major.name, subcategory: subcategory.name, store };
        return `
          <button type="button" class="store-node ${scopeActive(storeScope) ? 'active' : ''}"
            data-scope-kind="store"
            data-major="${escapeHtml(major.name)}"
            data-subcategory="${escapeHtml(subcategory.name)}"
            data-store="${escapeHtml(store)}">
            <span>${escapeHtml(store)}</span>
            <strong>${countIdeas(storeScope).toLocaleString('ko-KR')}</strong>
          </button>
        `;
      }).join('');

      return `
        <div class="subcategory-node">
          <button type="button" class="subcategory-button ${scopeActive(subScope) ? 'active' : ''}"
            data-scope-kind="subcategory"
            data-major="${escapeHtml(major.name)}"
            data-subcategory="${escapeHtml(subcategory.name)}">
            <span>${escapeHtml(subcategory.name)}</span>
            <strong>${countIdeas(subScope).toLocaleString('ko-KR')}</strong>
          </button>
          <div class="store-list">${stores}</div>
        </div>
      `;
    }).join('');

    return `
      <section class="category-group">
        <button type="button" class="category-major ${scopeActive(majorScope) ? 'active' : ''}"
          data-scope-kind="major"
          data-category-id="${escapeHtml(major.id)}"
          data-major="${escapeHtml(major.name)}"
          ${hasChildren ? `aria-expanded="${String(!collapsed)}" aria-controls="${escapeHtml(panelId)}"` : ''}>
          <span>${escapeHtml(major.name)}</span>
          <span class="category-major-meta">
            <strong>${countIdeas(majorScope).toLocaleString('ko-KR')}</strong>
            ${hasChildren ? `<span class="category-chevron" aria-hidden="true">${collapsed ? '›' : '⌄'}</span>` : ''}
          </span>
        </button>
        ${hasChildren ? `<div id="${escapeHtml(panelId)}" class="subcategory-list" ${collapsed ? 'hidden' : ''}>${children}</div>` : ''}
      </section>
    `;
  }).join('');
}

function renderCategorySelects() {
  const selectedMajor = form.elements.category_major?.value || '';
  const selectedSubcategory = form.elements.category_sub?.value || '';
  const majors = majorCategories();
  categoryMajorSelect.innerHTML = [
    '<option value="">선택</option>',
    ...majors.map((category) => `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`)
  ].join('');
  categoryMajorSelect.value = majors.some((category) => category.name === selectedMajor) ? selectedMajor : '';
  renderSubcategoryOptions(categoryMajorSelect.value, selectedSubcategory);
}

function renderSubcategoryOptions(majorName, selectedSubcategory = form.elements.category_sub?.value || '') {
  const major = majorCategories().find((category) => category.name === majorName);
  const subs = major ? subCategories(major.id) : [];
  categorySubSelect.innerHTML = [
    '<option value="">선택</option>',
    ...subs.map((category) => `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`)
  ].join('');
  categorySubSelect.value = subs.some((category) => category.name === selectedSubcategory) ? selectedSubcategory : '';
  renderChoiceControls();
}

function renderChoiceControls() {
  renderChoiceButtonGroup(workTypeChoices, WORK_TYPES, normalizeWorkType(form.elements.work_type?.value || '아이디어'));
  renderChoiceButtonGroup(categoryMajorChoices, majorCategories().map((category) => category.name), form.elements.category_major?.value || '');

  const selectedMajor = form.elements.category_major?.value || '';
  const selectedCategory = majorCategories().find((category) => category.name === selectedMajor);
  const subcategoryOptions = selectedCategory ? subCategories(selectedCategory.id).map((category) => category.name) : [];
  renderChoiceButtonGroup(
    categorySubChoices,
    subcategoryOptions,
    form.elements.category_sub?.value || '',
    selectedMajor ? '소카테고리 없음' : '대카테고리를 먼저 선택'
  );

  renderChoiceButtonGroup(storeChoices, STORES, form.elements.store?.value || '');
  renderChoiceButtonGroup(statusChoices, Object.keys(labels.status), normalizeStatus(form.elements.status?.value || 'idea'), labels.status);
}

function renderChoiceButtonGroup(container, options, selectedValue, labelMapOrEmptyText = null) {
  if (!container) return;
  if (!options.length) {
    container.innerHTML = `<span class="choice-empty">${escapeHtml(typeof labelMapOrEmptyText === 'string' ? labelMapOrEmptyText : '선택 항목 없음')}</span>`;
    return;
  }

  const labelMap = labelMapOrEmptyText && typeof labelMapOrEmptyText === 'object' ? labelMapOrEmptyText : null;
  container.innerHTML = options.map((value) => {
    const active = value === selectedValue;
    const label = labelMap ? labelMap[value] : value;
    return `
      <button type="button" class="${active ? 'active' : ''}" data-choice-value="${escapeHtml(value)}" aria-pressed="${String(active)}">
        ${escapeHtml(label)}
      </button>
    `;
  }).join('');
}

function scopedIdeas() {
  return state.ideas.filter((idea) => matchesScope(idea, state.selectedScope) && matchesQuickFilters(idea, state.filters));
}

function countIdeas(scope) {
  return state.ideas.filter((idea) => matchesScope(idea, scope) && matchesQuickFilters(idea, state.filters)).length;
}

function matchesScope(idea, scope) {
  const normalized = normalizeScope(scope);
  if (normalized.kind === 'all') return true;
  if (normalized.major && idea.category_major !== normalized.major) return false;
  if (normalized.subcategory && idea.category_sub !== normalized.subcategory) return false;
  if (normalized.store && idea.store !== normalized.store) return false;
  return true;
}

function matchesQuickFilters(idea, filters) {
  if (filters.owner !== 'all' && idea.owner !== filters.owner) return false;
  if (filters.store !== 'all' && idea.store !== filters.store) return false;
  if (filters.workType !== 'all' && normalizeWorkType(idea.work_type) !== filters.workType) return false;
  if (filters.due !== 'all' && !matchesDueFilter(idea, filters.due)) return false;
  if (filters.query && !matchesQuery(idea, filters.query)) return false;
  return true;
}

function matchesDueFilter(idea, filter) {
  const dueDate = normalizeDateInput(idea.due_date || idea.payload?.due_date || '');
  const status = normalizeStatus(idea.status);
  if (filter === 'none') return !dueDate;
  if (!dueDate) return false;
  const dueTime = dateOnlyTime(dueDate);
  const today = todayTime();
  if (filter === 'overdue') return status !== 'done' && dueTime < today;
  if (filter === 'today') return dueTime === today;
  if (filter === 'week') {
    const weekEnd = today + (6 * 24 * 60 * 60 * 1000);
    return dueTime >= today && dueTime <= weekEnd;
  }
  return true;
}

function matchesQuery(idea, query) {
  const needle = query.toLowerCase();
  return [
    idea.project_name,
    idea.title,
    idea.description,
    idea.expected_impact,
    idea.next_action
  ].some((value) => String(value || '').toLowerCase().includes(needle));
}

function normalizeScope(scope) {
  const kind = ['all', 'major', 'subcategory', 'store'].includes(scope?.kind) ? scope.kind : 'all';
  return {
    kind,
    major: kind === 'all' ? '' : String(scope?.major || ''),
    subcategory: ['subcategory', 'store'].includes(kind) ? String(scope?.subcategory || '') : '',
    store: kind === 'store' ? String(scope?.store || '') : ''
  };
}

function scopeActive(scope) {
  const current = normalizeScope(state.selectedScope);
  const target = normalizeScope(scope);
  return current.kind === target.kind &&
    current.major === target.major &&
    current.subcategory === target.subcategory &&
    current.store === target.store;
}

function scopeHeading(scope) {
  const normalized = normalizeScope(scope);
  if (normalized.kind === 'store') {
    return {
      title: normalized.store,
      context: [normalized.major, normalized.subcategory].filter(Boolean).join(' / ') || '매장별 프로젝트 관리'
    };
  }
  if (normalized.kind === 'subcategory') {
    return {
      title: `${normalized.subcategory} 보드`,
      context: normalized.major
    };
  }
  if (normalized.kind === 'major') {
    return {
      title: `${normalized.major} 보드`,
      context: '대카테고리'
    };
  }
  return {
    title: '업무 보드',
    context: '전체 업무'
  };
}

function scopeLabel(scope) {
  const normalized = normalizeScope(scope);
  return [normalized.major, normalized.subcategory, normalized.store].filter(Boolean).join(' / ') || '전체 업무';
}

function ideaScopeLabel(idea) {
  return [idea.category_major, idea.category_sub, idea.store].filter(Boolean).join(' / ') || '-';
}

function renderWorkMeta(idea) {
  const workType = normalizeWorkType(idea.work_type);
  const project = String(idea.project_name || '').trim();
  return `<span class="work-meta"><em>${escapeHtml(workType)}</em>${project ? `<b>${escapeHtml(project)}</b>` : ''}</span>`;
}

function renderCategoryCell(idea) {
  const major = String(idea.category_major || '').trim();
  const subcategory = String(idea.category_sub || '').trim();
  if (!major && !subcategory) return '';
  return `<span class="category-path">${[major, subcategory].filter(Boolean).map(escapeHtml).join(' / ')}</span>`;
}

function normalizeWorkType(value) {
  const candidate = String(value || '').trim();
  return WORK_TYPES.includes(candidate) ? candidate : '아이디어';
}

function teamNameForOwner(owner) {
  const team = TEAMS.find((item) => item.members.includes(owner));
  return team?.name || '';
}

function timelinePartLabel(idea) {
  return taskMeta([idea.category_major, idea.category_sub]) || normalizeWorkType(idea.work_type);
}

function currentActor() {
  const globalUser = window.FLY_SPACE_USER;
  const globalActor = typeof globalUser === 'string'
    ? globalUser
    : globalUser?.id || globalUser?.name || globalUser?.email || '';
  try {
    return String(globalActor || localStorage.getItem(ACTOR_STORAGE_KEY) || '로그인 대기').trim() || '로그인 대기';
  } catch {
    return String(globalActor || '로그인 대기').trim() || '로그인 대기';
  }
}

function withActionMetadata(idea, action) {
  const actor = currentActor();
  const at = new Date().toISOString();
  const history = normalizeHistory(idea);
  const latest = history.at(-1);
  const entry = { action, actor, at };
  const nextHistory = latest && latest.action === action && latest.actor === actor && withinRecentMinute(latest.at, at)
    ? [...history.slice(0, -1), entry]
    : [...history, entry].slice(-50);

  return {
    ...idea,
    updated_by: actor,
    payload: {
      ...(idea.payload || {}),
      updated_by: actor,
      history: nextHistory
    }
  };
}

function normalizeHistory(source) {
  const values = Array.isArray(source)
    ? source
    : Array.isArray(source?.payload?.history)
      ? source.payload.history
      : [];
  return values.map((item) => ({
    action: String(item?.action || '').trim(),
    actor: String(item?.actor || '').trim() || '로그인 대기',
    at: String(item?.at || '').trim()
  })).filter((item) => item.action && item.at);
}

function withinRecentMinute(previous, next) {
  const prevTime = new Date(previous).getTime();
  const nextTime = new Date(next).getTime();
  if (Number.isNaN(prevTime) || Number.isNaN(nextTime)) return false;
  return Math.abs(nextTime - prevTime) <= 60 * 1000;
}

function latestHistoryActor(history) {
  return normalizeHistory(history).at(-1)?.actor || currentActor();
}

function latestActorLabel(idea) {
  const latest = normalizeHistory(idea).at(-1);
  if (!latest) return currentActor();
  return `${latest.actor} · ${latest.action}`;
}

function recordBrowserActivity(action, idea, actor = currentActor()) {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    const values = raw ? JSON.parse(raw) : [];
    const nextValues = [
      ...(Array.isArray(values) ? values : []),
      {
        action,
        actor,
        at: new Date().toISOString(),
        client_id: idea.client_id || '',
        title: idea.title || ''
      }
    ].slice(-200);
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(nextValues));
  } catch {
    // Activity logs are best-effort until login-backed history is wired in.
  }
}

function majorCategories() {
  return state.categories
    .filter((category) => category.level === 'major')
    .sort(sortCategories);
}

function subCategories(parentId) {
  return state.categories
    .filter((category) => category.level === 'sub' && category.parent_id === parentId)
    .sort(sortCategories);
}

function upsertCategory(category) {
  const normalized = normalizeCategory(category);
  if (!normalized) return;
  const index = state.categories.findIndex((item) => item.id === normalized.id);
  if (index >= 0) state.categories[index] = { ...state.categories[index], ...normalized };
  else state.categories.push(normalized);
  state.categories = mergeCategories(state.categories);
  saveBrowserCategories(state.categories);
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
  for (const idea of state.ideas) {
    const majorName = String(idea.category_major || '').trim();
    const subcategoryName = String(idea.category_sub || '').trim();
    if (!majorName) continue;
    const majorId = createCategoryId('major', majorName, '');
    if (!merged.has(majorId)) {
      merged.set(majorId, normalizeCategory({ id: majorId, level: 'major', parent_id: '', name: majorName, sort_order: 500 }));
    }
    if (subcategoryName) {
      const subId = createCategoryId('sub', subcategoryName, majorId);
      if (!merged.has(subId)) {
        merged.set(subId, normalizeCategory({ id: subId, level: 'sub', parent_id: majorId, name: subcategoryName, sort_order: 501 }));
      }
    }
  }
  return [...merged.values()].sort(sortCategories);
}

function normalizeCategory(category) {
  const id = String(category?.id || '').trim();
  const rawName = String(category?.name || '').trim();
  const name = id === 'cat_project_plan' ? '프로젝트 관리' : rawName;
  const level = category?.level === 'sub' ? 'sub' : 'major';
  const parentId = level === 'sub' ? String(category?.parent_id || '').trim() : '';
  if (!id || !name) return null;
  return {
    id,
    level,
    parent_id: parentId,
    name,
    sort_order: Number(category?.sort_order || 999),
    created_at: category?.created_at || '',
    updated_at: category?.updated_at || ''
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

function createCategoryId(level, name, parentId) {
  return stableId('cat', `${level}|${parentId}|${name}`);
}

function readBrowserCategories() {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function saveBrowserCategories(categories) {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(mergeCategories(categories)));
}

function readCollapsedMajors() {
  try {
    const raw = localStorage.getItem(CATEGORY_COLLAPSE_STORAGE_KEY);
    const values = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(values) ? values.map(String) : []);
  } catch {
    return new Set();
  }
}

function saveCollapsedMajors(collapsedMajors) {
  try {
    localStorage.setItem(CATEGORY_COLLAPSE_STORAGE_KEY, JSON.stringify([...collapsedMajors]));
  } catch {
    // The dashboard still works if browser storage is unavailable.
  }
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

function renderDueBadge(idea) {
  const dueDate = normalizeDateInput(idea.due_date || idea.payload?.due_date || '');
  if (!dueDate) return '<span class="due-badge muted">-</span>';
  const tone = dueTone(idea, dueDate);
  return `<span class="due-badge ${escapeHtml(tone)}">${escapeHtml(formatDate(dueDate))}</span>`;
}

function dueTone(idea, dueDate) {
  if (normalizeStatus(idea.status) === 'done') return 'done';
  const diff = dateOnlyTime(dueDate) - todayTime();
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 6 * 24 * 60 * 60 * 1000) return 'soon';
  return 'muted';
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

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return '';
  return `${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`;
}

function normalizeBudget(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function formatBudget(value) {
  const text = normalizeBudget(value);
  if (!text) return '-';
  const digits = text.replace(/[^\d]/g, '');
  if (digits && digits === text.replace(/[, ]/g, '')) {
    return `${Number(digits).toLocaleString('ko-KR')}원`;
  }
  return text;
}

function normalizeDateInput(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return '';
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return '';
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function dateOnlyTime(value) {
  const [year, month, day] = normalizeDateInput(value).split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}

function todayTime() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
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

function deleteBrowserIdea(clientId) {
  try {
    const ideas = readBrowserIdeas().filter((idea) => idea.client_id !== clientId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ideas));
  } catch {
    // Deleting from browser storage is best-effort when the API is unavailable.
  }
}

function readViewMode() {
  try {
    return localStorage.getItem(VIEW_MODE_STORAGE_KEY) === 'board' ? 'board' : 'list';
  } catch {
    return 'list';
  }
}
