const options = [
  {
    id: 1,
    slug: 'option-01.html',
    name: '집중 인박스',
    subtitle: '처음 들어왔을 때 오늘 볼 업무만 먼저 정리',
    bestFor: '모바일에서 빠르게 확인하고 바로 작성하는 흐름',
    layout: 'inbox'
  },
  {
    id: 2,
    slug: 'option-02.html',
    name: '보드 우선',
    subtitle: '아이디어부터 완료까지 단계를 가장 먼저 보여주는 칸반형',
    bestFor: '진행 상태를 한눈에 보고 싶은 팀 회의',
    layout: 'kanban'
  },
  {
    id: 3,
    slug: 'option-03.html',
    name: '커맨드 센터',
    subtitle: 'KPI, 지연, 담당자, 매장을 한 화면에서 통제',
    bestFor: '관리자가 전체 운영 상황을 보는 데스크톱 화면',
    layout: 'command'
  },
  {
    id: 4,
    slug: 'option-04.html',
    name: '모바일 큐',
    subtitle: '손에 들고 쓰는 카드 중심의 좁은 화면 최적화',
    bestFor: '매장에서 사진과 링크를 바로 추가하는 상황',
    layout: 'mobile'
  },
  {
    id: 5,
    slug: 'option-05.html',
    name: '에디토리얼 리스트',
    subtitle: '정보를 얇고 조용하게 쌓아 읽는 문서형 목록',
    bestFor: '내용을 많이 읽고 비교해야 하는 기획 검토',
    layout: 'editorial'
  },
  {
    id: 6,
    slug: 'option-06.html',
    name: '매장 워룸',
    subtitle: '머문래와 갤러리문래를 나란히 두고 비교',
    bestFor: '매장별 실행 계획과 성과를 따로 관리',
    layout: 'store'
  },
  {
    id: 7,
    slug: 'option-07.html',
    name: '팀 플래너',
    subtitle: '준호, 동원, 보미, 상준, 유민 담당 업무를 사람 기준으로 정렬',
    bestFor: '누가 무엇을 맡았는지 바로 보고 싶은 경우',
    layout: 'team'
  },
  {
    id: 8,
    slug: 'option-08.html',
    name: '캘린더 리듬',
    subtitle: '이번 주 기한과 실행 리듬을 먼저 보여주는 방식',
    bestFor: '이벤트, 캠페인, 촬영 일정 관리',
    layout: 'calendar'
  },
  {
    id: 9,
    slug: 'option-09.html',
    name: '브리프 캔버스',
    subtitle: '목록에서 하나를 고르면 기획안 상세가 크게 펼쳐지는 구조',
    bestFor: '아이디어를 실제 기획서로 다듬는 작업',
    layout: 'brief'
  },
  {
    id: 10,
    slug: 'option-10.html',
    name: '운영 콕핏',
    subtitle: '필터, 보드, 세부 정보를 3열로 압축한 고밀도 운영형',
    bestFor: '데스크톱에서 반복적으로 관리하는 실무자',
    layout: 'cockpit'
  }
];

const sampleTasks = [
  {
    title: '갤러리문래 입구 사인 정리',
    status: '아이디어',
    owner: '보미',
    store: '갤러리문래',
    due: '오늘',
    category: '인테리어',
    summary: '입구에서 브랜드 인지가 바로 잡히도록 시야 동선을 정리한다.'
  },
  {
    title: '머문래 점심 샘플링 이벤트',
    status: '논의',
    owner: '준호',
    store: '머문래',
    due: '06.22',
    category: '오프라인 마케팅',
    summary: '점심시간 유입 고객에게 소량 샘플과 QR 혜택을 연결한다.'
  },
  {
    title: '7월 매장 유입 캠페인',
    status: '상세기획',
    owner: '동원',
    store: '전체',
    due: '이번 주',
    category: '프로젝트',
    summary: '매장별 쿠폰, 사진, 후기를 하나의 실행표로 묶는다.'
  },
  {
    title: '리뷰 개선 안내 POP',
    status: '진행',
    owner: '상준',
    store: '머문래',
    due: '지연',
    category: '마케팅',
    summary: '오프라인 리뷰 요청 문구와 계산대 위치를 다시 테스트한다.'
  },
  {
    title: '브랜드제안서 링크 정리',
    status: '완료',
    owner: '유민',
    store: '전체',
    due: '완료',
    category: '프로젝트',
    summary: '파트너 제안서와 참고 이미지를 한곳에서 열람할 수 있게 정리한다.'
  }
];

const statuses = ['아이디어', '논의', '상세기획', '진행', '완료'];
const owners = ['준호', '동원', '보미', '상준', '유민'];
const stores = ['머문래', '갤러리문래'];

const root = document.querySelector('#optionRoot');
const optionId = Number(document.body.dataset.option || 0);

if (document.body.dataset.page === 'index') {
  renderIndex();
} else if (root) {
  renderOption(options.find((option) => option.id === optionId) || options[0]);
}

function renderIndex() {
  const grid = document.querySelector('#optionGrid');
  grid.innerHTML = options.map((option) => `
    <a class="option-card" href="${option.slug}">
      <header>
        <div>
          <small>OPTION ${String(option.id).padStart(2, '0')}</small>
          <h2>${option.name}</h2>
        </div>
        <b>${String(option.id).padStart(2, '0')}</b>
      </header>
      <p>${option.subtitle}</p>
      <div class="mini-preview" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <p><strong>추천:</strong> ${option.bestFor}</p>
    </a>
  `).join('');
}

function renderOption(option) {
  root.innerHTML = `
    <main class="option-shell">
      <div class="option-topline">
        <a href="index.html" class="back-link">시안 목록</a>
        <nav class="option-nav" aria-label="시안 이동">
          ${options.map((item) => `<a class="${item.id === option.id ? 'active' : ''}" href="${item.slug}">${String(item.id).padStart(2, '0')}</a>`).join('')}
        </nav>
      </div>
      <header class="option-hero">
        <p>OPTION ${String(option.id).padStart(2, '0')}</p>
        <h1>${option.name}</h1>
        <span>${option.subtitle}. ${option.bestFor}에 맞춘 화면입니다.</span>
      </header>
      <section class="prototype">
        <div class="prototype-header">
          <div>
            <p class="section-kicker">LIVE MOCK</p>
            <h2>${option.name} 화면</h2>
          </div>
          <p>목록, 필터, 보드, 기한, 담당자 구조를 시안별로 다르게 배치했습니다.</p>
        </div>
        ${renderLayout(option.layout)}
      </section>
    </main>
  `;
}

function renderLayout(layout) {
  const renderers = {
    inbox: renderInbox,
    kanban: renderKanban,
    command: renderCommand,
    mobile: renderMobile,
    editorial: renderEditorial,
    store: renderStore,
    team: renderTeam,
    calendar: renderCalendar,
    brief: renderBrief,
    cockpit: renderCockpit
  };
  return renderers[layout]();
}

function toolbar(title = '기획안 관리') {
  return `
    <div class="toolbar">
      <span class="brand-mini"><img src="../financier.svg" alt="">${title}</span>
      <span class="ghost-button active">새 기획안</span>
    </div>
  `;
}

function metricRow() {
  return `
    <div class="metric-row">
      ${statuses.map((status, index) => `<div><span>${status}</span><strong>${index + 1}</strong></div>`).join('')}
    </div>
  `;
}

function filterRow() {
  return `
    <div class="filter-row">
      <span class="pill active">전체</span>
      <span class="pill">지연</span>
      <span class="pill">오늘</span>
      <span class="pill">이번 주</span>
      <span class="pill">머문래</span>
      <span class="pill">갤러리문래</span>
    </div>
  `;
}

function taskCard(task, featured = false) {
  return `
    <article class="task ${featured ? 'featured' : ''}">
      <small>${task.category} · ${task.store} · ${task.due}</small>
      <strong>${task.title}</strong>
      <p>${task.summary}</p>
    </article>
  `;
}

function renderInbox() {
  return `
    <div class="frame">
      ${toolbar('집중 인박스')}
      ${filterRow()}
      <div class="content-grid">
        <aside class="side-rail">
          <h3>빠른 보기</h3>
          <div class="rail-list">
            <button class="active">오늘 볼 일 <small>2</small></button>
            <button>지연된 일 <small>1</small></button>
            <button>내 담당 <small>4</small></button>
            <button>매장별 보기 <small>2</small></button>
          </div>
        </aside>
        <section class="main-panel">
          <div class="panel-grid">
            <div class="panel large"><h3>오늘 우선순위</h3><div class="task-list">${sampleTasks.slice(0, 3).map((task, index) => taskCard(task, index === 0)).join('')}</div></div>
            <div class="panel"><h3>바로 작성</h3><p>제목, 담당자, 기한만 먼저 저장하고 상세는 나중에 보강합니다.</p></div>
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderKanban() {
  return `
    <div class="frame">
      ${toolbar('보드 우선')}
      ${metricRow()}
      <div class="kanban">
        ${statuses.map((status) => `
          <section class="column">
            <header><span>${status}</span><strong>${sampleTasks.filter((task) => task.status === status).length}</strong></header>
            <div class="task-list">
              ${sampleTasks.filter((task) => task.status === status).map((task) => taskCard(task)).join('') || '<p class="section-kicker">비어 있음</p>'}
            </div>
          </section>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCommand() {
  return `
    <div class="frame">
      ${toolbar('커맨드 센터')}
      ${metricRow()}
      <div class="content-grid">
        <aside class="side-rail">
          <h3>저장된 관점</h3>
          <div class="rail-list">
            <button class="active">전체 운영 <small>5</small></button>
            <button>상준 진행 <small>1</small></button>
            <button>이번 주 캠페인 <small>2</small></button>
            <button>매장 환경 <small>1</small></button>
          </div>
        </aside>
        <section class="main-panel">
          <div class="panel-grid">
            <div class="panel"><h3>지연</h3><p>1건 · 리뷰 POP 문안 확정 필요</p></div>
            <div class="panel"><h3>오늘</h3><p>2건 · 매장 확인 후 사진 첨부</p></div>
            <div class="panel"><h3>미배정</h3><p>0건 · 모든 업무 담당자 있음</p></div>
            <div class="panel large"><h3>주요 업무</h3><div class="task-list">${sampleTasks.map((task) => taskCard(task)).join('')}</div></div>
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderMobile() {
  return `
    <div class="mobile-mock">
      <div class="mobile-screen">
        <span class="brand-mini"><img src="../financier.svg" alt="">모바일 큐</span>
        <h2>오늘 볼 일</h2>
        <input class="search-input" value="프로젝트, 제목, 내용">
        ${sampleTasks.slice(0, 4).map((task, index) => `
          <article class="mobile-card">
            <small>${task.owner} · ${task.store} · ${task.due}</small>
            <h3>${task.title}</h3>
            <p>${task.summary}</p>
            <span class="pill ${index === 0 ? 'active' : ''}">${task.status}</span>
          </article>
        `).join('')}
      </div>
      <nav class="bottom-bar">
        <span class="tab active">읽기</span>
        <span class="tab">쓰기</span>
        <span class="tab">필터</span>
      </nav>
    </div>
  `;
}

function renderEditorial() {
  return `
    <div class="frame">
      ${toolbar('에디토리얼 리스트')}
      <div class="split-hero">
        <section class="project-table">
          ${sampleTasks.map((task, index) => `
            <article class="list-row ${index === 1 ? 'featured' : ''}">
              <small>${task.category} / ${task.store} / ${task.owner} / ${task.due}</small>
              <strong>${task.title}</strong>
              <p>${task.summary}</p>
            </article>
          `).join('')}
        </section>
        <aside class="reading-panel">
          <p class="section-kicker">WRITE</p>
          <h3>빠른 메모</h3>
          <textarea>점심 샘플링 이벤트는 고객 반응 가설과 QR 혜택 연결을 먼저 확정한다.</textarea>
        </aside>
      </div>
    </div>
  `;
}

function renderStore() {
  return `
    <div class="frame">
      ${toolbar('매장 워룸')}
      ${filterRow()}
      <div class="store-grid">
        ${stores.map((store) => `
          <section class="store-card">
            <h3>${store}</h3>
            <div class="task-list">
              ${sampleTasks.filter((task) => task.store === store || task.store === '전체').slice(0, 3).map((task) => taskCard(task)).join('')}
            </div>
          </section>
        `).join('')}
      </div>
    </div>
  `;
}

function renderTeam() {
  return `
    <div class="frame">
      ${toolbar('팀 플래너')}
      <div class="team-grid">
        ${owners.map((owner) => `
          <section class="team-card">
            <h3>${owner}</h3>
            <div class="task-list">
              ${sampleTasks.filter((task) => task.owner === owner).map((task) => taskCard(task)).join('') || '<p class="section-kicker">대기 업무 없음</p>'}
            </div>
          </section>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCalendar() {
  return `
    <div class="frame">
      ${toolbar('캘린더 리듬')}
      <div class="calendar-grid">
        <section>
          <div class="calendar-strip">
            ${['월', '화', '수', '목', '금', '토', '일'].map((day, index) => `
              <div class="calendar-cell">
                <strong>${day}</strong>
                <small>${index === 1 ? '샘플링' : index === 3 ? 'POP 확인' : index === 4 ? '리뷰 점검' : '대기'}</small>
              </div>
            `).join('')}
          </div>
        </section>
        <aside class="timeline-day">
          <h3>이번 주 실행</h3>
          ${sampleTasks.slice(1, 4).map((task) => taskCard(task)).join('')}
        </aside>
      </div>
    </div>
  `;
}

function renderBrief() {
  return `
    <div class="frame">
      ${toolbar('브리프 캔버스')}
      <div class="brief-layout">
        <aside class="side-rail">
          <h3>기획안</h3>
          <div class="brief-list">
            ${sampleTasks.map((task, index) => `
              <article class="brief-item ${index === 2 ? 'active' : ''}">
                <small>${task.status} · ${task.owner}</small>
                <strong>${task.title}</strong>
                <p>${task.store}</p>
              </article>
            `).join('')}
          </div>
        </aside>
        <section class="brief-detail">
          <p class="section-kicker">SELECTED BRIEF</p>
          <h2>7월 매장 유입 캠페인</h2>
          <div class="brief-meta">
            <div><small>담당</small><strong>동원</strong></div>
            <div><small>매장</small><strong>전체</strong></div>
            <div><small>기한</small><strong>이번 주</strong></div>
            <div><small>상태</small><strong>상세기획</strong></div>
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderCockpit() {
  return `
    <div class="frame">
      ${toolbar('운영 콕핏')}
      <div class="cockpit">
        <aside>
          <h3>필터</h3>
          <div class="rail-list">
            <button class="active">전체</button>
            <button>오늘</button>
            <button>지연</button>
            <button>미배정</button>
          </div>
        </aside>
        <section>
          <h3>업무 보드</h3>
          <div class="task-list">${sampleTasks.map((task, index) => taskCard(task, index === 3)).join('')}</div>
        </section>
        <section>
          <h3>상세</h3>
          <div class="task-list">
            <article class="task featured">
              <small>진행 · 상준 · 지연</small>
              <strong>리뷰 개선 안내 POP</strong>
              <p>문안, 위치, 사진 첨부를 오늘 안에 확정해야 합니다.</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  `;
}
