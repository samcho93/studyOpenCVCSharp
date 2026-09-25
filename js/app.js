/* OpenCV · C# WPF 웹 실습 강좌 — 메인 앱 (네비게이션 · 강좌 문서 · C# 에디터 · 진도 · 역할/보기 전환 · 작업 폴더) */
(function () {
  const { esc, highlightLines, makeEditor, blockCodes, codesOf, expectOf, LANG_NAME } = window.JU;
  const { store } = window.Runner;
  const C = window.CS_COURSE;
  const E = window.CsEngine;
  const $ = (id) => document.getElementById(id);
  const stripTags = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

  const app = { role: 'student', view: 'doc', route: { type: 'home' }, done: new Set(), blockCodes: {}, activeEditor: null, lang: 'cs' };
  window.CsApp = app;

  // ================================================================== 초기화
  async function init() {
    applyTheme(store.get('jc.theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    document.body.classList.add('lang-cs');
    try { JSON.parse(store.get('jc.done', '[]')).forEach((id) => app.done.add(id)); } catch (e) { /* 무시 */ }

    const q = new URLSearchParams(location.search);
    app.role = q.get('role') === 'teacher' ? 'teacher' : q.get('role') === 'student' ? 'student' : store.get('jc.role', 'student');
    app.viewPref = q.get('view');
    setRole(app.role, true);

    app.console = new Runner.Console($('consolePanel'));
    app.console.onJump = (line) => { if (app.activeEditor) app.activeEditor.jump(line); };
    setupEditor();
    app.deck = new Deck(app);
    setupLayout();
    setupServerBadge();
    bindUi();

    await loadLessons();
    buildNav();
    updateProgress();
    window.addEventListener('hashchange', () => routeFromHash());
    routeFromHash();
  }

  function loadLessons() {
    return Promise.all(C.order.map((o) => new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = `lessons/${o.id}.js`;
      s.async = false;
      s.onload = resolve;
      s.onerror = resolve;
      document.body.appendChild(s);
    })));
  }

  const partOf = (ch) => { const o = C.order.find((x) => x.id === ch.id); const p = o && (C.parts || []).find((x) => x.id === o.part); return p ? p.title : ''; };
  const chapters = () => C.order.map((o) => C.chapters[o.id] ? Object.assign({ icon: o.icon }, C.chapters[o.id]) : null).filter(Boolean);
  const allSections = () => chapters().flatMap((ch) => ch.sections.map((s) => ({ ch, sec: s })));
  function findSection(id) {
    for (const ch of chapters()) { const sec = ch.sections.find((s) => s.id === id); if (sec) return { ch, sec }; }
    return null;
  }
  const ghUrl = (path) => `https://github.com/${C.github.user}/${C.github.repo}/tree/${C.github.branch}/${path}`;
  app.ghUrl = ghUrl;

  // ================================================================== 테마 · 역할 · 보기
  function applyTheme(t) { document.documentElement.dataset.theme = t; store.set('jc.theme', t); document.dispatchEvent(new CustomEvent('themechange')); }

  /** 교사용 화면은 비밀번호를 한 번 확인한다 */
  function teacherAllowed() {
    const pass = String(C.teacherPass || 'cv2026');
    if (store.get('jc.teacherOk', '') === pass) return true;
    const v = window.prompt('교사용 화면 비밀번호를 입력하세요.', '');
    if (v == null) return false;
    if (v.trim() !== pass) { app.toast('비밀번호가 맞지 않습니다'); return false; }
    store.set('jc.teacherOk', pass);
    return true;
  }

  function setRole(role, silent) {
    if (role === 'teacher' && !teacherAllowed()) { document.querySelectorAll('.role-switch button').forEach((b) => b.classList.toggle('active', b.dataset.role === app.role)); return; }
    app.role = role;
    store.set('jc.role', role);
    document.body.classList.toggle('role-teacher', role === 'teacher');
    if (window.Ink) Ink.enabled = role === 'teacher';
    document.querySelectorAll('.role-switch button').forEach((b) => b.classList.toggle('active', b.dataset.role === role));
    $('brandSub').textContent = role === 'teacher' ? '🧑‍🏫 교사용 · PPT 수업 모드' : '🎓 학생용 · 문서 + 실습';
    const q = new URLSearchParams(location.search);
    q.set('role', role); q.delete('view');
    history.replaceState(null, '', `${location.pathname}?${q}${location.hash}`);
    if (!silent) { app.view = role === 'teacher' ? 'slides' : 'doc'; render(); }
  }
  function setView(view) { app.view = view; render(); }
  app.setView = setView;

  // ================================================================== 에디터 (C#)
  const CS_TEMPLATE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 예제 이미지를 흑백으로 읽어 정보를 출력하고 창에 표시합니다
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        Console.WriteLine($"크기: {img.Width} x {img.Height}, 채널: {img.Channels()}, 형식: {img.Type()}");
        Cv2.ImShow("image", img);
        Cv2.WaitKey(0);
    }
}
`;
  function setupEditor() {
    app.editor = makeEditor($('editorHost'), '', { onRun: runEditor, lang: 'cs' });
    app.editorState = { key: null, label: '', code: '' };
    app.editor.on('change', () => { const st = app.editorState; if (st.key) store.set(`jc.ed.${st.key}`, JSON.stringify({ code: app.editor.getValue(), label: st.label, orig: st.code })); });
    setEditorFont(+store.get('jc.edFont', 14.5));
  }
  function setEditorFont(px) { app.edFont = Math.max(10, Math.min(28, px)); document.documentElement.style.setProperty('--ed-font', app.edFont + 'px'); store.set('jc.edFont', app.edFont); app.editor.refresh(); }

  /** 코드를 편집기로 불러오기 */
  function loadEditor(code, label, key) {
    app.editorState = { key: key || app.editorState.key, label: label || '', code: code || '' };
    app.editor.setValue(code || '');
    $('editorLabel').textContent = label ? '· ' + label : '';
    if (app.editorState.key) store.set(`jc.ed.${app.editorState.key}`, JSON.stringify({ code, label, orig: code }));
    $('editorPane').classList.remove('folded');
    $('foldBtn').textContent = '▾ 접기';
    setTimeout(() => app.editor.refresh(), 0);
  }
  app.loadCode = (code, label) => { loadEditor(code, label, app.route.sec ? app.route.sec.id : 'home'); app.toast('편집기로 불러왔습니다'); };

  function restoreEditor(sectionId, fallbackCode, fallbackLabel) {
    let saved = null;
    try { saved = JSON.parse(store.get(`jc.ed.${sectionId}`, 'null')); } catch (e) { saved = null; }
    if (saved && saved.code != null) {
      app.editorState = { key: sectionId, label: saved.label || '', code: saved.orig || fallbackCode || '' };
      app.editor.setValue(saved.code);
      $('editorLabel').textContent = saved.label ? '· ' + saved.label : '';
    } else {
      app.editorState = { key: sectionId, label: fallbackLabel || '', code: fallbackCode || '' };
      app.editor.setValue(fallbackCode || '');
      $('editorLabel').textContent = fallbackLabel ? '· ' + fallbackLabel : '';
    }
    setTimeout(() => app.editor.refresh(), 0);
  }

  function runEditor(stdin) { app.runCode(app.editor.getValue(), { label: app.editorState.label || '실습 코드', stdin, editor: app.editor }); }

  app.runCode = function (code, opts = {}) {
    app.activeEditor = opts.editor || null;
    if (app.deck && app.deck.isFull()) app.deck.showConsole(true);
    if (opts.lang && opts.lang !== 'cs') { app.toast('이 코드 조각은 실행할 수 없습니다 (' + (LANG_NAME[opts.lang] || opts.lang) + ')'); return Promise.resolve({ ok: false }); }
    return app.console.execute(code, { label: opts.label, stdin: opts.stdin, onDiagnostics: (d) => { if (opts.editor) opts.editor.markErrors(d); } });
  };

  app.lightbox = function (src, caption) { window.MVImage.Viewer.openUrl(src, caption); };
  app.closeLightbox = function () { const v = window.MVImage.Viewer.current; if (!v) return false; v.close(); return true; };
  app.toast = function (msg) { const t = $('toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(app._toast); app._toast = setTimeout(() => t.classList.add('hidden'), 1800); };
  async function copyText(text) { try { await navigator.clipboard.writeText(text); app.toast('복사했습니다'); } catch (e) { app.toast('복사하지 못했습니다'); } }
  function download(text, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }

  // ================================================================== 네비게이션
  function buildNav() {
    const q = $('navSearch').value.trim().toLowerCase();
    const tree = $('navTree');
    const cur = app.route;
    let html = `<a class="nav-home${cur.type === 'home' ? ' active' : ''}" href="#home">🏠 강좌 소개</a>`;
    let lastPart = null;
    C.order.forEach((o) => {
      const ch = C.chapters[o.id];
      if (!q && o.part && o.part !== lastPart) { lastPart = o.part; const p = (C.parts || []).find((x) => x.id === o.part); if (p) html += `<div class="nav-part">${esc(p.title)}</div>`; }
      if (!ch) { if (!q) html += `<div class="nav-ch"><div class="nav-ch-head" style="cursor:default;opacity:.6"><span class="no">${esc(o.no)}</span><span class="t">${esc(o.title)}</span><span class="pending">준비 중</span></div></div>`; return; }
      let secs = ch.sections;
      const hits = {};
      if (q) {
        const chHit = (ch.title + ' ' + (ch.subtitle || '')).toLowerCase().includes(q);
        secs = secs.filter((s) => { if (chHit || s.title.toLowerCase().includes(q)) return true; const text = sectionText(s).toLowerCase(); const i = text.indexOf(q); if (i >= 0) { hits[s.id] = text.slice(Math.max(0, i - 18), i + q.length + 26); return true; } return false; });
        if (!secs.length) return;
      }
      const active = (cur.ch && cur.ch.id === ch.id);
      const open = q || active || (store.get('jc.open.' + ch.id, '0') === '1');
      const doneN = ch.sections.filter((s) => app.done.has(s.id)).length;
      html += `<div class="nav-ch${open ? ' open' : ''}${active ? ' active' : ''}" data-ch="${ch.id}">
        <div class="nav-ch-head"><span class="no">${esc(ch.no)}</span><span class="t" title="${esc(ch.title)}">${esc(o.icon || '')} ${esc(ch.title)}</span>
          <span class="pending">${doneN}/${ch.sections.length}</span><span class="caret">▶</span></div>
        <div class="nav-secs"><a class="nav-sec nav-overview${cur.type === 'chapter' && active ? ' active' : ''}" href="#${ch.id}"><span class="chk">ⓘ</span><span>차시 개요</span></a>
        ${secs.map((s) => `<a class="nav-sec${cur.sec && cur.sec.id === s.id ? ' active' : ''}${app.done.has(s.id) ? ' done' : ''}" href="#${s.id}">
          <span class="chk">${app.done.has(s.id) ? '✔' : ch.sections.indexOf(s) + 1}</span><span>${esc(s.title)}${hits[s.id] ? `<span class="hit">…${esc(hits[s.id])}…</span>` : ''}</span></a>`).join('')}
        </div></div>`;
    });
    tree.innerHTML = html;
    const act = tree.querySelector('.nav-sec.active');
    if (act && !q) act.scrollIntoView({ block: 'nearest' });
  }

  const textCache = new Map();
  function sectionText(s) {
    if (textCache.has(s.id)) return textCache.get(s.id);
    const parts = [s.title, ...(s.goals || [])];
    (s.content || []).forEach((b) => parts.push(b.text || '', stripTags(b.html), b.title || '', (b.items || []).map(stripTags).join(' '), b.code || '', b.cs || '', (b.rows || []).flat().map(stripTags).join(' ')));
    (s.practice || []).forEach((p) => parts.push(p.title, stripTags(p.desc)));
    const t = parts.join(' ');
    textCache.set(s.id, t);
    return t;
  }

  function updateProgress() {
    const all = allSections();
    const n = all.filter((x) => app.done.has(x.sec.id)).length;
    $('progressText').textContent = `${n} / ${all.length}`;
    $('progressBar').style.width = all.length ? (n / all.length * 100) + '%' : '0';
  }
  function toggleDone(id) { if (app.done.has(id)) app.done.delete(id); else app.done.add(id); store.set('jc.done', JSON.stringify([...app.done])); updateProgress(); buildNav(); }

  // ================================================================== 라우팅
  function routeFromHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    const [id, slide] = h.split('@');
    if (!id || id === 'home') app.route = { type: 'home' };
    else if (C.chapters[id]) app.route = { type: 'chapter', ch: chapters().find((c) => c.id === id) };
    else {
      const f = findSection(id);
      if (f) { app.route = { type: 'section', ch: f.ch, sec: f.sec, slide: slide ? Math.max(0, (+slide || 1) - 1) : (slide === '' ? 0 : null) }; store.set('jc.last', id); }
      else app.route = { type: 'home' };
    }
    if (app.viewPref) { app.view = app.viewPref === 'slides' ? 'slides' : 'doc'; app.viewPref = null; }
    else if (!app.viewInit) app.view = app.role === 'teacher' ? 'slides' : 'doc';
    app.viewInit = true;
    render();
  }
  function go(hash) { if (location.hash === '#' + hash) routeFromHash(); else location.hash = hash; }

  app.stepSection = function (dir, slide) {
    const all = allSections();
    const r = app.route;
    if (r.type !== 'section') return;
    const i = all.findIndex((x) => x.sec.id === r.sec.id);
    const n = all[i + dir];
    if (!n) { app.toast(dir > 0 ? '마지막 교시입니다' : '첫 교시입니다'); return; }
    app.pendingSlide = slide;
    go(n.sec.id);
  };
  app.onSlideChange = function (sec, index) {
    store.set('jc.slidePos', JSON.stringify({ id: sec.id, i: index }));
    const h = `#${sec.id}@${index + 1}`;
    if (location.hash !== h) history.replaceState(null, '', location.pathname + location.search + h);
  };

  // ================================================================== 렌더링
  function render() {
    const r = app.route;
    buildNav();
    document.querySelectorAll('.view-switch button').forEach((b) => b.classList.toggle('active', b.dataset.view === app.view));
    const isSection = r.type === 'section';
    const slides = isSection && app.view === 'slides';
    $('docView').classList.toggle('hidden', slides);
    $('slideView').classList.toggle('hidden', !slides);
    document.querySelector('.view-switch').style.visibility = isSection ? 'visible' : 'hidden';
    $('prevBtn').style.visibility = isSection ? 'visible' : 'hidden';
    $('nextBtn').style.visibility = isSection ? 'visible' : 'hidden';

    if (r.type === 'home') { $('crumb').innerHTML = '<b>강좌 소개</b>'; renderHome(); }
    else if (r.type === 'chapter') { $('crumb').innerHTML = `${esc(r.ch.no)}차시 · <b>${esc(r.ch.title)}</b>`; renderChapter(r.ch); }
    else {
      $('crumb').innerHTML = `${esc(r.ch.no)}차시 ${esc(r.ch.title)} › <b>${esc(r.sec.title)}</b>`;
      if (slides) {
        let idx = app.pendingSlide != null ? app.pendingSlide : (r.slide != null ? r.slide : null);
        if (idx == null) { let pos = null; try { pos = JSON.parse(store.get('jc.slidePos', 'null')); } catch (e) { pos = null; } idx = pos && pos.id === r.sec.id ? pos.i : 0; }
        app.pendingSlide = null;
        app.deck.open(r.ch, r.sec, idx);
      } else renderSection(r.ch, r.sec);
    }
    if (!slides) setTimeout(() => app.editor.refresh(), 0);
  }

  // ------------------------------------------------------------------ 홈
  function renderHome() {
    const chs = chapters();
    const all = allSections();
    let nCode = 0, nSlides = 0, nPractice = 0, nQuiz = 0, nWpf = 0;
    all.forEach(({ sec }) => {
      (sec.content || []).filter((b) => b.type === 'code').forEach((b) => { nCode++; if (b.local || (b.lang && b.lang !== 'cs')) nWpf++; });
      nSlides += (sec.slides || []).length; nPractice += (sec.practice || []).length; nQuiz += (sec.quiz || []).length;
    });
    const last = store.get('jc.last', '');
    const lastF = last && findSection(last);
    const first = all[0];
    const teacher = app.role === 'teacher';
    $('content').innerHTML = `<div class="doc">
      <div class="hero">
        <h1>💠 ${esc(C.title)}</h1>
        <p><b>C#</b> 과 <b>WPF</b> 로 OpenCV 를 배우는 실습 강좌입니다. Visual Studio 에서 <b>NuGet 으로 OpenCvSharp4 를 설치</b>하는 것부터 시작해
          Mat · 색 공간 · 이진화 · 필터 · 모폴로지 · 에지 · 기하 변환 · 윤곽선 · 허프 변환 · 템플릿 매칭 · 카메라까지 익히고,
          마지막에는 <b>WPF 이미지 처리 앱</b>과 <b>검사 프로젝트</b>를 완성합니다.</p>
        <p>모든 OpenCvSharp 예제는 <b>이 페이지 안에서 바로 실행 · 수정</b>할 수 있습니다 (브라우저 안의 C# 인터프리터 + OpenCV 4.13). WPF 화면 코드는 Visual Studio 용 프로젝트로 제공합니다.</p>
        <p>차시 ${chs.length}개 · 교시 ${all.length}개 · 예제 ${nCode}개(WPF ${nWpf}) · 실습 ${nPractice}개 · 퀴즈 ${nQuiz}문항 · 슬라이드 ${nSlides}장</p>
        <div class="hero-actions">
          ${lastF ? `<a class="btn" href="#${lastF.sec.id}">⏯ 이어서 학습: ${esc(lastF.sec.title)}</a>` : ''}
          ${first ? `<a class="btn${lastF ? ' outline' : ''}" href="#${first.sec.id}">▶ 처음부터 시작</a>` : ''}
          <a class="btn outline" href="${ghUrl('wpf')}" target="_blank" rel="noopener">🪟 WPF 예제 프로젝트</a>
          <button class="btn outline" data-open-files>📁 작업 폴더 · 예제 이미지</button>
          <button class="btn outline" data-role-go="${teacher ? 'student' : 'teacher'}">${teacher ? '🎓 학생용 화면으로' : '🧑‍🏫 교사용(PPT) 화면으로'}</button>
        </div>
        <div class="cup">💠</div>
      </div>

      ${(C.parts || []).map((p) => {
        const list = C.order.filter((o) => o.part === p.id);
        return `<h2>${esc(p.title)} <span class="muted" style="font-size:.62em;font-weight:600">${esc(p.desc || '')}</span></h2>
        <div class="cards">${list.map((o) => {
          const ch = C.chapters[o.id];
          if (!ch) return `<div class="card disabled"><span class="ci">${o.icon}</span><span class="cn">${esc(o.no)}차시</span><span class="ct">${esc(o.title)}</span><span class="cs">준비 중</span></div>`;
          const d = ch.sections.filter((s) => app.done.has(s.id)).length;
          return `<a class="card" href="#${ch.id}"><span class="ci">${o.icon}</span><span class="cn">${esc(ch.no)}차시</span><span class="ct">${esc(ch.title)}</span>
            <span class="cs">${ch.sections.length}교시 · ${esc(stripTags(ch.summary).slice(0, 60))}${stripTags(ch.summary).length > 60 ? '…' : ''}</span>
            <span class="cp"><i style="width:${ch.sections.length ? d / ch.sections.length * 100 : 0}%"></i></span></a>`;
        }).join('')}</div>`;
      }).join('')}

      <h2>🧭 화면 구성과 사용 방법</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>구분</th><th>🎓 학생용</th><th>🧑‍🏫 교사용</th></tr></thead>
        <tbody>
          <tr><td>기본 화면</td><td>문서형 강좌 (개념 · 그림 → 예제 → 실습 → 퀴즈)</td><td>PPT 형태 슬라이드 (16:9) + 교사 노트</td></tr>
          <tr><td>코드 실행</td><td>예제의 <b>▶ 실행</b>, 아래 편집기에서 <kbd>Ctrl</kbd>+<kbd>Enter</kbd></td><td>코드 슬라이드에서 직접 수정하고 <b>▶ 실행</b></td></tr>
          <tr><td>실행 결과</td><td colspan="2">오른쪽 <b>결과 창</b>에 <code>Console.WriteLine</code> 출력 · 오류 · <b>이미지 창(<code>Cv2.ImShow</code>)</b>. 이미지에 마우스를 올리면 <b>좌표와 픽셀 값(B, G, R)</b>, 누르면 확대 보기.</td></tr>
          <tr><td>예제 이미지</td><td colspan="2">합성 예제 이미지(부품 트레이 · 와셔 · 동전 · PCB · 병 · 색 뚜껑 …)가 <code>images/</code> 폴더에 있습니다. <b>📁 작업 폴더</b>에서 보고, 내 이미지도 올릴 수 있습니다.</td></tr>
          <tr><td>카메라</td><td colspan="2"><code>new VideoCapture(0)</code> 은 브라우저에서 <b>컨베이어 시뮬레이션 영상</b>으로 동작합니다. 실제 웹캠은 WPF 프로젝트에서 같은 코드로 씁니다.</td></tr>
          <tr><td>WPF</td><td colspan="2">XAML · WPF 화면 코드는 브라우저에서 실행하지 않습니다(<span class="chip local-chip" style="font-size:11px">🖥 Visual Studio 에서 실행</span> 표시). <a href="${ghUrl('wpf')}" target="_blank" rel="noopener">wpf/</a> 폴더의 프로젝트를 열어 실행하세요.</td></tr>
          <tr><td>추가 기능</td><td>진도 저장, 검색, 슬라이드 보기, .cs 내려받기</td><td>수업 흐름 · 퀴즈 정답 · 실습 정답 실행 · 판서 · 타이머 · 발표자 창 · 전체 화면</td></tr>
        </tbody></table></div>
      <ul class="steps">
        <li><b>교시 선택</b> — 왼쪽 목차에서 차시와 교시를 고릅니다. 상단의 📄 문서 / 🖼️ 슬라이드 버튼으로 보기를 바꿉니다.</li>
        <li><b>코드 실행</b> — 예제의 <b>▶ 실행</b>을 누르면 아래 편집기로 코드가 들어가고 오른쪽 결과 창에 출력과 이미지가 나옵니다. 값을 바꿔 다시 실행해 보세요.</li>
        <li><b>Visual Studio 로 옮기기</b> — 편집기의 <b>⬇ .cs</b> 로 코드를 내려받아 콘솔 프로젝트의 Program.cs 에 붙이면 로컬 PC 의 OpenCvSharp 에서 그대로 동작합니다 (01차시 참고).</li>
        <li><b>교사용 수업</b> — 🧑‍🏫 교사용으로 바꾸면 슬라이드가 열립니다. <kbd>F</kbd> 전체 화면, <kbd>←</kbd> <kbd>→</kbd> 이동, <kbd>R</kbd> 결과 패널, <kbd>G</kbd> 목록, <kbd>N</kbd> 노트, <kbd>B</kbd> 검은 화면.</li>
      </ul>
      <div class="callout info"><div class="ct">ℹ️ 실행 환경 <span id="homeEnv" class="muted" style="font-weight:600">준비 전</span></div><div>
        <p>💠 <b>C#</b>: 브라우저 안의 <b>C# 인터프리터</b>가 OpenCvSharp4 와 같은 이름의 API(<code>Cv2.*</code>, <code>Mat</code>, <code>Scalar</code>, <code>Point</code> …)를 <a href="https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html" target="_blank" rel="noopener">OpenCV.js 4.13</a> 위에서 실행합니다. 처음 실행할 때 OpenCV(약 11MB)를 한 번 내려받습니다.</p>
        <p>지원 범위: C# 문법의 대부분(클래스 · 제네릭 컬렉션 · LINQ · 람다 · 예외 · 튜플 · 패턴 매칭)과 OpenCvSharp 의 핵심 API(core · imgproc · features2d · video · QR). 지원하지 않는 것: WPF/WinForms 화면, 스레드, 파일 대화상자, 일부 모듈(dnn · ml · calib3d).</p>
        <p>🖥 <b>로컬 PC</b>: Visual Studio 2022 + .NET 8 + NuGet <code>OpenCvSharp4</code> · <code>OpenCvSharp4.runtime.win</code> · <code>OpenCvSharp4.WpfExtensions</code> — 01차시에서 설치합니다. 강좌 코드는 그대로 동작합니다.</p>
      </div></div>
    </div>`;
    updateEnvText();
    $('content').scrollTop = 0;
    restoreEditor('home', CS_TEMPLATE, '첫 실행: 이미지 불러와 보기');
  }

  // ------------------------------------------------------------------ 챕터 개요
  function renderChapter(ch) {
    const secMeta = (s) => { const nc = (s.content || []).filter((b) => b.type === 'code').length; return `${s.minutes || 50}분 · 예제 ${nc} · 실습 ${(s.practice || []).length} · 슬라이드 ${(s.slides || []).length}`; };
    $('content').innerHTML = `<div class="doc">
      <span class="chapter-badge">${esc(ch.icon || '')} ${esc(ch.no)}차시 · ${esc(partOf(ch))}</span>
      <h1>${esc(ch.title)} ${ch.subtitle ? `<span class="muted" style="font-size:.6em;font-weight:600">${esc(ch.subtitle)}</span>` : ''}</h1>
      <p class="lead">${ch.summary || ''}</p>
      ${(ch.goals || []).length ? `<div class="goals"><b>🎯 차시 학습 목표</b><ul>${ch.goals.map((g) => `<li>${g}</li>`).join('')}</ul></div>` : ''}
      <div class="meta-row">
        <a class="btn primary" href="#${ch.sections[0].id}">▶ 첫 교시 시작</a>
        <button class="btn" data-slides="${ch.sections[0].id}">🖼️ 슬라이드로 수업</button>
        ${ch.wpf ? `<a class="btn" href="${ghUrl('wpf/' + ch.wpf)}" target="_blank" rel="noopener">🪟 WPF 프로젝트: ${esc(ch.wpf)}</a>` : ''}
      </div>
      <h2>교시 구성</h2>
      <div class="sec-list">${ch.sections.map((s, i) => `<a class="sec-item" href="#${s.id}"><span class="sn">${i + 1}</span>
        <span class="st">${esc(s.title)}<div class="sm">${secMeta(s)}</div></span><span>${app.done.has(s.id) ? '✅' : ''}</span></a>`).join('')}</div>
    </div>`;
    $('content').scrollTop = 0;
    restoreEditor(ch.id, '', '');
  }

  // ------------------------------------------------------------------ 코드 블록
  const canRun = (b, codes) => codes.cs != null && b.run !== false && !b.local;
  /**
   * @param b  {code|cs, lang, title, desc, expect, stdin, run, local, file}
   */
  function codeBlockHtml(b, id, opts = {}) {
    const codes = blockCodes(b);
    const lang = codes.cs != null ? 'cs' : codes.other ? codes.other.lang : 'cs';
    const code = codes.cs != null ? codes.cs : codes.other ? codes.other.code : '';
    const tag = opts.tag ? `<span class="tag">${esc(opts.tag)}</span>` : '';
    const fname = b.title ? esc(b.title) : esc(b.file || window.JU.fileName(code, lang));
    const runnable = canRun(b, codes);
    const chip = `<span class="chip lang-chip">${esc(LANG_NAME[lang] || lang)}${b.file ? ' · ' + esc(b.file) : ''}</span>`;
    const localChip = b.local || (lang !== 'cs' && lang !== 'sh' && lang !== 'json' && lang !== 'txt') ? '<span class="chip local-chip" title="WPF · 데스크톱 전용 코드: Visual Studio 에서 실행">🖥 Visual Studio 에서 실행</span>' : '';
    const stdin = b.stdin ? `<div class="stdin-hint">⌨ 입력이 필요한 예제입니다. 예: <code>${esc(b.stdin.replace(/\n$/, '').replace(/\n/g, ' ⏎ '))}</code>
      ${runnable ? `<button class="btn small ghost" data-code-act="run-stdin" data-code="${id}">예시 입력으로 실행</button>` : ''}</div>` : '';
    const ex = expectOf(b, 'cs');
    const expect = ex != null && !b.nondeterministic && !opts.noExpect ? `<details class="expect"><summary>실행 결과 예시</summary><pre class="term">${esc(String(ex).replace(/\s+$/, ''))}</pre></details>` : '';
    const nr = !runnable && lang === 'cs' ? `<div class="norun-note">${b.local ? '🖥 이 코드는 WPF 창 · 파일 대화상자 · 실제 카메라 등이 필요해 <b>Visual Studio</b> 에서 실행합니다.' : '이 코드는 브라우저에서 실행하지 않는 코드 조각입니다.'}</div>` : (lang === 'xml' || lang === 'xaml') ? '<div class="norun-note">🪟 XAML 은 WPF 프로젝트의 화면 정의 파일입니다 — Visual Studio 디자이너에서 확인하세요.</div>' : '';
    return `<div class="code-block single lang-${esc(lang)}" id="cb-${id}">
      <div class="code-head"><span class="t">${tag}${fname}</span>${chip}${localChip}
        ${runnable ? `<button class="btn small primary" data-code-act="run" data-code="${id}" title="편집기로 불러와 실행">▶ 실행</button>` : ''}
        ${lang === 'cs' ? `<button class="btn small ghost" data-code-act="edit" data-code="${id}" title="아래 편집기로 불러오기">✎ 편집기로</button>` : ''}
        <button class="btn small ghost" data-code-act="copy" data-code="${id}" title="코드 복사">⧉</button></div>
      <div class="code-pane" data-lang="${esc(lang)}"><pre>${highlightLines(code, lang)}</pre>${nr}${expect}</div>${stdin}
      ${b.desc ? `<div class="code-desc">${b.desc}</div>` : ''}</div>`;
  }

  function renderSection(ch, sec) {
    const teacher = app.role === 'teacher';
    app.blockCodes = {};
    let n = 0;
    const reg = (code, title, stdin, extra) => { const id = 'c' + (n++); app.blockCodes[id] = Object.assign({ code, title, stdin }, extra || {}); return id; };
    const idx = ch.sections.indexOf(sec);
    const all = allSections();
    const gi = all.findIndex((x) => x.sec.id === sec.id);
    const prev = all[gi - 1], next = all[gi + 1];
    let firstCode = null;
    const demos = [];
    const blockHtml = (b) => {
      switch (b.type) {
        case 'h': return `<h3>${esc(b.text)}</h3>`;
        case 'p': return `<p>${window.JU.scoped(b.html)}</p>`;
        case 'list': { const tagName = b.ordered ? 'ol' : 'ul'; return `<${tagName}>${(b.items || []).map((i) => `<li>${i}</li>`).join('')}</${tagName}>`; }
        case 'table': return `<div class="table-wrap"><table><thead><tr>${(b.head || []).map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${(b.rows || []).map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${b.caption ? `<p class="caption">${b.caption}</p>` : ''}`;
        case 'code': {
          const codes = blockCodes(b);
          const code = codes.cs != null ? codes.cs : codes.other ? codes.other.code : '';
          const lang = codes.cs != null ? 'cs' : codes.other ? codes.other.lang : 'cs';
          const id = reg(code, b.title, b.stdin, { lang, block: b });
          if (!firstCode && canRun(b, codes)) firstCode = { code, title: b.title };
          // 제목이 이미 "예제 …" / "추가: …" 로 시작하면 같은 말을 칩으로 또 붙이지 않는다
          return codeBlockHtml(b, id, { tag: b.title && !/^(예제|추가)/.test(b.title) && /더 알아보기/.test(b.title) ? '추가' : '' });
        }
        case 'callout': {
          const icon = { tip: '💡', warn: '⚠️', info: 'ℹ️', more: '📘', field: '🏭', wpf: '🪟', vs: '🧰' }[b.kind] || 'ℹ️';
          const title = b.title || { tip: '팁', warn: '주의', info: '참고', more: '더 알아보기', field: '현장 노트', wpf: 'WPF 에서는', vs: 'Visual Studio' }[b.kind];
          return `<div class="callout ${esc(b.kind)}"><div class="ct">${icon} ${b.kind === 'more' && b.title ? '더 알아보기 · ' + b.title : title}</div><div>${window.JU.scoped(b.html)}</div></div>`;
        }
        case 'figure': return `<div class="figure">${window.JU.scoped(b.html)}${b.caption ? `<p class="caption">${b.caption}</p>` : ''}</div>`;
        case 'image': return `<div class="figure"><img class="asset-img" src="assets/${esc(b.src)}" alt="${esc(b.caption || b.src)}" data-zoom-src="assets/${esc(b.src)}" style="${b.width ? `max-width:${b.width}px` : ''}">${b.caption ? `<p class="caption">${b.caption}</p>` : ''}</div>`;
        case 'demo': { const di = demos.push(b) - 1; return `<div class="demo" data-demo="${di}"><div class="demo-title">${esc(b.title || '체험')}</div>${b.desc ? `<p class="demo-desc">${b.desc}</p>` : ''}<div class="demo-host">${b.html || ''}</div></div>`; }
        case 'wpf': return `<div class="callout wpf"><div class="ct">🪟 ${esc(b.title || 'WPF 프로젝트에서 해 보기')}</div><div>${window.JU.scoped(b.html || '')}
            ${b.project ? `<div class="meta-row"><a class="btn small primary" href="${ghUrl('wpf/' + b.project)}" target="_blank" rel="noopener">🪟 GitHub 에서 프로젝트 보기 · ${esc(b.project)}</a></div>` : ''}</div></div>`;
        default: return b.html ? `<div>${b.html}</div>` : '';
      }
    };
    const blocks = (sec.content || []).filter((b) => teacher || !b.teacher).map((b) => { const inner = blockHtml(b); return b.teacher ? `<div class="teacher-block"><div class="tb-label">🧑‍🏫 교사용</div>${inner}</div>` : inner; }).join('\n');

    const practice = (sec.practice || []).map((p, i) => {
      const st = codesOf(p, 'starter'), so = codesOf(p, 'solution');
      const stCode = st.cs != null ? st.cs : '', soCode = so.cs != null ? so.cs : null;
      const sid = reg(stCode, p.title + ' (시작 코드)', p.stdin);
      const solId = soCode != null ? reg(soCode, p.title + ' (정답)', p.stdin) : null;
      const lv = '★'.repeat(p.level || 1) + '☆'.repeat(3 - (p.level || 1));
      const ex = expectOf(p, 'cs');
      return `<div class="practice single"><div class="practice-head"><b>🛠️ ${esc(p.title)}</b><span class="muted" style="font-size:12.5px">💠 C#</span><span class="level" title="난이도">${lv}</span></div>
        <div class="practice-body">${p.desc || ''}
          ${p.stdin ? `<p class="muted" style="font-size:13px">⌨ 입력 예: <code>${esc(p.stdin.replace(/\n$/, '').replace(/\n/g, ' ⏎ '))}</code></p>` : ''}
          ${ex != null && !p.nondeterministic ? `<details><summary>기대 출력 보기</summary><pre class="term" style="background:var(--term-bg);color:var(--term-fg);padding:10px 14px;border-radius:8px;white-space:pre-wrap">${esc(String(ex).replace(/\s+$/, ''))}</pre></details>` : ''}
          ${p.hint ? `<details><summary>💡 힌트</summary><div>${p.hint}</div></details>` : ''}
          <div class="actions"><button class="btn small primary" data-code-act="edit" data-code="${sid}">✎ 시작 코드를 편집기로</button>
            ${teacher && solId ? `<button class="btn small blue" data-code-act="run" data-code="${solId}">▶ 정답 실행</button><button class="btn small ghost" data-toggle-sol="${i}">🔑 정답 코드 보기</button>` : ''}</div>
          ${teacher && solId ? `<div class="solution hidden" data-sol="${i}">${codeBlockHtml({ title: '정답 코드', code: soCode, stdin: p.stdin, expect: p.expect, nondeterministic: p.nondeterministic }, solId, { tag: '교사용' })}</div>` : ''}
        </div></div>`;
    }).join('');

    const quiz = (sec.quiz || []).map((q, i) => `<div class="quiz" data-quiz="${i}"><div class="q"><span class="qn">Q${i + 1}.</span>${q.q}</div>
      <div class="opts">${(q.options || []).map((o, j) => `<button class="opt" data-q="${i}" data-o="${j}"><span class="n">${j + 1}</span><span>${o}</span></button>`).join('')}</div>
      <div class="explain hidden">${teacher ? `<b>정답 ${q.answer + 1}번.</b> ` : ''}${q.explain || ''}</div></div>`).join('');

    const flow = (sec.flow || []).length ? `<div class="flow teacher-only">${sec.flow.map((f) => `<div style="flex:${f[1]}"><b>${esc(f[0])}</b> ${f[1]}분</div>`).join('')}</div>` : '';
    const done = app.done.has(sec.id);
    const nCode = (sec.content || []).filter((b) => b.type === 'code').length;

    $('content').innerHTML = `<div class="doc">
      <span class="chapter-badge">${esc(ch.icon || '')} ${esc(ch.no)}차시 · ${esc(ch.title)} · ${idx + 1}/${ch.sections.length}교시</span>
      <h1>${esc(sec.title)}</h1>
      <div class="meta-row"><span class="chip">⏱ ${sec.minutes || 50}분</span><span class="chip">💻 예제 ${nCode}</span>
        <span class="chip">🛠️ 실습 ${(sec.practice || []).length}</span><span class="chip">❓ 퀴즈 ${(sec.quiz || []).length}</span>
        <button class="btn small ghost" data-slides="${sec.id}">🖼️ 슬라이드로 보기</button>
        ${ch.wpf ? `<a class="btn small ghost" href="${ghUrl('wpf/' + ch.wpf)}" target="_blank" rel="noopener">🪟 WPF 프로젝트</a>` : ''}
        ${teacher ? '<button class="btn small ghost" id="showAllAnswers">🔑 퀴즈 정답 모두 보기</button>' : ''}</div>
      ${(sec.goals || []).length ? `<div class="goals"><b>🎯 학습 목표</b><ul>${sec.goals.map((g) => `<li>${g}</li>`).join('')}</ul></div>` : ''}
      ${flow}
      ${blocks}
      ${practice ? `<h2>🛠️ 실습 과제</h2>${practice}` : ''}
      ${quiz ? `<h2>❓ 확인 퀴즈</h2>${quiz}` : ''}
      <div class="section-end">
        <button class="btn done-btn${done ? ' done' : ''}" id="doneBtn">${done ? '✔ 학습 완료' : '☐ 학습 완료로 표시'}</button>
        <span class="spacer"></span>
        ${prev ? `<a class="btn ghost" href="#${prev.sec.id}">◀ ${esc(prev.sec.title)}</a>` : ''}
        ${next ? `<a class="btn primary" href="#${next.sec.id}">${esc(next.sec.title)} ▶</a>` : ''}
      </div>
    </div>`;
    $('content').scrollTop = 0;
    demos.forEach((d, i) => { const host = $('content').querySelector(`[data-demo="${i}"] .demo-host`); if (host && typeof d.init === 'function') { try { d.init(host, window.MLB); } catch (err) { console.error('demo init', err); } } });
    restoreEditor(sec.id, firstCode ? firstCode.code : '', firstCode ? firstCode.title : '');
  }

  // ================================================================== 레이아웃 (크기 조절)
  function setupLayout() {
    const root = document.documentElement;
    const nav = store.get('jc.navW', ''), out = store.get('jc.outW', ''), ed = store.get('jc.edH', '');
    if (nav) root.style.setProperty('--nav-w', nav);
    if (out) root.style.setProperty('--out-w', out);
    if (ed) root.style.setProperty('--editor-h', ed);
    if (store.get('jc.navCollapsed', '0') === '1') $('app').classList.add('nav-collapsed');
    document.querySelectorAll('[data-resize]').forEach((g) => {
      g.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        g.setPointerCapture(e.pointerId);
        g.classList.add('drag');
        const kind = g.dataset.resize;
        const move = (ev) => {
          if (kind === 'nav') { const w = Math.max(200, Math.min(480, ev.clientX)) + 'px'; root.style.setProperty('--nav-w', w); store.set('jc.navW', w); }
          else if (kind === 'out') { const w = Math.max(260, Math.min(window.innerWidth * 0.6, window.innerWidth - ev.clientX)) + 'px'; root.style.setProperty('--out-w', w); store.set('jc.outW', w); }
          else if (kind === 'editor') { const rect = $('docView').getBoundingClientRect(); const h = Math.max(60, Math.min(rect.height - 80, rect.bottom - ev.clientY)); const v = (h / rect.height * 100).toFixed(1) + '%'; root.style.setProperty('--editor-h', v); store.set('jc.edH', v); app.editor.refresh(); }
          app.deck && app.deck.fit();
        };
        const up = () => { g.classList.remove('drag'); g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); app.editor.refresh(); };
        g.addEventListener('pointermove', move);
        g.addEventListener('pointerup', up);
      });
    });
  }

  // ================================================================== 실행 환경 상태 · 모달
  function updateEnvText() {
    const el = $('homeEnv');
    if (!el) return;
    el.textContent = E.state === 'ready' ? `C# + OpenCV ${E.opencv} 준비 완료 (${(E.loadMs / 1000).toFixed(1)}초)` : E.state === 'loading' ? (E.message || '준비 중…') : E.state === 'error' ? '준비 실패 — ' + E.message : '처음 실행할 때 준비합니다';
  }
  function setupServerBadge() {
    const upd = () => {
      const b = $('serverBtn');
      b.classList.toggle('ok', E.state === 'ready');
      b.classList.toggle('bad', E.state === 'error');
      $('serverText').textContent = E.state === 'ready' ? `💠 C# · OpenCV ${E.opencv} 준비 완료` : E.state === 'loading' ? `💠 ${E.message || '준비 중…'}` : E.state === 'error' ? '💠 실행 환경 오류 (눌러서 확인)' : '💠 C# (실행하면 준비)';
      updateEnvText();
    };
    E.onChange(upd);
    setTimeout(() => { if (E.supported() && E.state === 'idle' && store.get('jc.preload', '1') === '1') E.load().catch(() => {}); }, 1500);
  }
  function openModal(title, html) { $('modalTitle').textContent = title; $('modalBody').innerHTML = html; $('modal').classList.remove('hidden'); }
  function closeModal() { $('modal').classList.add('hidden'); }
  app.openModal = openModal; app.closeModal = closeModal;

  function serverModal() {
    const st = { idle: '아직 준비 안 함', loading: E.message || '준비 중…', ready: `준비 완료${E.loadMs ? ` (${(E.loadMs / 1000).toFixed(1)}초)` : ''}`, error: '오류: ' + E.message }[E.state];
    const preload = store.get('jc.preload', '1') === '1';
    openModal('실행 환경', `
      <div class="table-wrap"><table><tbody>
        <tr><th>💠 C#</th><td>브라우저 안의 <b>C# 인터프리터</b>(이 강좌용으로 만든 C# 부분집합 실행기) + <b>OpenCV.js 4.13</b>(WebAssembly). OpenCvSharp4 와 같은 API 이름을 씁니다.<br>
          상태: <b style="color:${E.state === 'ready' ? 'var(--ok)' : E.state === 'error' ? 'var(--danger)' : 'inherit'}">${esc(st)}</b></td></tr>
        <tr><th>지원</th><td>클래스 · 구조체 · 열거형 · 제네릭 컬렉션(List · Dictionary · HashSet …) · LINQ · 람다 · 예외 · 튜플 · 패턴 매칭 · 문자열 보간 · out/ref · 확장 메서드<br>
          OpenCvSharp: Mat · Cv2(core · imgproc · 그리기 · 윤곽선 · 허프 · 템플릿 매칭 · 특징점 ORB/BFMatcher · 배경 제거 · 광류 · QR) · VideoCapture(시뮬레이션)</td></tr>
        <tr><th>미지원</th><td>WPF/WinForms 화면(Window · Image 컨트롤 · 대화상자), 스레드 · Task 병렬, 실제 카메라 · 동영상 파일, dnn · ml · calib3d 모듈, CascadeClassifier — 이런 코드는 <b>🖥 Visual Studio 에서 실행</b> 표시가 있고 로컬 PC 에서 실행합니다.</td></tr>
        <tr><th>입력 · 키</th><td>${E.mode === 'sab' ? '실행 중 Console.ReadLine 입력 · Cv2.WaitKey 키 입력 사용 가능' : '이 환경에서는 실행 중 입력을 받을 수 없어 미리 입력받습니다 (HTTPS 또는 localhost 로 열면 실행 중 입력이 됩니다)'}</td></tr>
        <tr><th>작업 폴더</th><td>프로그램의 현재 폴더. 예제 이미지는 <code>images/</code>, <code>Cv2.ImWrite</code> 로 저장한 파일은 📁 작업 폴더에서 내려받을 수 있습니다.</td></tr>
      </tbody></table></div>
      <div class="meta-row">
        <button class="btn primary" id="envLoad" ${E.state === 'ready' || E.state === 'loading' ? 'disabled' : ''}>💠 지금 준비</button>
        <label class="chip" style="cursor:pointer"><input type="checkbox" id="envPreload" ${preload ? 'checked' : ''} style="margin-right:6px">페이지를 열 때 미리 준비</label>
      </div>`);
    $('envLoad').onclick = () => { E.load().then(serverModal, serverModal); $('envLoad').disabled = true; $('envLoad').textContent = '준비 중…'; };
    $('envPreload').onchange = (e) => store.set('jc.preload', e.target.checked ? '1' : '0');
  }

  // ------------------------------------------------------------------ 작업 폴더
  let filesTab = 'assets';
  async function filesModal() {
    openModal('📁 작업 폴더', '<p class="muted">불러오는 중…</p>');
    const tabs = `<div class="lang-tabs files-tabs">${[['assets', '🖼 예제 이미지'], ['work', '💾 내 파일 · 저장한 파일']].map(([k, v]) => `<button class="lt${filesTab === k ? ' active' : ''}" data-ftab="${k}">${v}</button>`).join('')}</div>`;
    const size = (n) => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(2) + ' MB';
    const icon = (n) => /\.(gif|png|jpe?g|bmp|webp)$/i.test(n) ? '🖼️' : /\.(txt|csv|cs|json|dat|md|html?|xaml)$/i.test(n) ? '📄' : '📦';
    let files = [];
    if (filesTab === 'assets') files = (await E.loadManifest()).filter((n) => n.startsWith('images/')).map((n) => ({ name: n, asset: true }));
    else files = E.files.userEntries().map(([p, f]) => ({ name: p, size: f.bytes.length, raw: f.raw }));
    const thumbs = filesTab === 'assets';
    $('modalBody').innerHTML = `${tabs}
      <p class="muted">${thumbs ? '코드에서 <code>Cv2.ImRead("images/이름.png")</code> 로 쓰는 예제 이미지입니다 (합성 이미지). 눌러서 확대 · 픽셀 값을 확인하세요.' : '내 PC 에서 올린 파일과 프로그램이 <code>Cv2.ImWrite</code> · <code>File.WriteAllText</code> 로 저장한 파일입니다. <code>Cv2.ImRead("파일이름")</code> 으로 다시 읽을 수 있습니다.'}</p>
      <div class="${thumbs ? 'asset-grid' : 'file-list'}">${files.length ? files.map((f) => thumbs
        ? `<div class="asset-tile" data-file="${esc(f.name)}" title="${esc(f.name)}"><img loading="lazy" src="assets/${esc(f.name)}"><span>${esc(f.name.replace(/^images\//, ''))}</span></div>`
        : `<div class="file-row" data-file="${esc(f.name)}"><span class="fn">${icon(f.name)} ${esc(f.name)}</span><span class="fs">${f.size != null ? size(f.size) : ''}${f.raw ? ` · ${f.raw.w}×${f.raw.h}` : ''}</span></div>`).join('') : '<p class="muted">파일이 없습니다. 예제를 실행해 <code>Cv2.ImWrite("out/result.png", img)</code> 로 저장하거나 아래에서 올려 보세요.</p>'}</div>
      <div id="fileView"></div>
      <div class="meta-row"><button class="btn ghost" id="filesRefresh">↻ 새로고침</button>
        <label class="btn ghost" style="cursor:pointer" title="이미지 · 텍스트 파일을 작업 폴더에 올립니다">📤 내 PC 파일 올리기<input type="file" id="filesUpload" multiple hidden></label>
        ${filesTab !== 'assets' ? '<button class="btn danger" id="filesClear">🗑 모두 지우기</button>' : ''}</div>`;
    $('modalBody').querySelectorAll('[data-ftab]').forEach((b) => b.onclick = () => { filesTab = b.dataset.ftab; filesModal(); });
    $('modalBody').querySelectorAll('[data-file]').forEach((row) => row.onclick = async () => {
      const name = row.dataset.file;
      const bytes = await E.files.read(name);
      if (!bytes) { $('fileView').innerHTML = '<p>읽을 수 없습니다.</p>'; return; }
      const url = URL.createObjectURL(new Blob([bytes]));
      const dl = `<a class="btn small ghost" href="${url}" download="${esc(name.split('/').pop())}">⬇ 내려받기</a>`;
      let body;
      if (/\.(gif|png|jpe?g|bmp|webp)$/i.test(name)) {
        const isrc = URL.createObjectURL(new Blob([bytes], { type: 'image/' + name.split('.').pop().toLowerCase().replace('jpg', 'jpeg') }));
        window.MVImage.Viewer.openUrl(isrc, name);
        body = `<img src="${isrc}" style="max-width:100%;max-height:300px;background:#eee;cursor:zoom-in" data-zoom="${esc(isrc)}">`;
      } else {
        const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, 200000));
        const binary = /[\u0000-\u0008\u000e-\u001f]/.test(text.slice(0, 2000));
        body = binary ? `<p class="muted">이진(binary) 파일입니다 — ${size(bytes.length)}</p>` : `<pre>${esc(text)}</pre>`;
      }
      $('fileView').innerHTML = `<h4 style="margin:10px 0 4px">${esc(name)} ${dl} <button class="btn small ghost" data-use="${esc(name)}" title="편집기 코드에 ImRead 줄 넣기">⟨/⟩ ImRead</button>${filesTab !== 'assets' ? ` <button class="btn small danger" data-del="${esc(name)}">🗑</button>` : ''}</h4>${body}`;
      $('fileView').querizedAll = null;
      $('fileView').querySelectorAll('[data-zoom]').forEach((el) => { el.onclick = () => window.MVImage.Viewer.openUrl(el.dataset.zoom, name); });
      const use = $('fileView').querySelector('[data-use]');
      if (use) use.onclick = () => { const line = `var img = Cv2.ImRead("${name}");\n`; if (app.editor.cm) app.editor.cm.replaceSelection(line); else app.editor.setValue(app.editor.getValue() + '\n' + line); closeModal(); app.toast('편집기 커서 위치에 넣었습니다'); };
      const del = $('fileView').querySelector('[data-del]');
      if (del) del.onclick = () => { E.files.remove(name); filesModal(); };
    });
    $('filesRefresh').onclick = filesModal;
    $('filesUpload').onchange = async (e) => { for (const file of e.target.files) await E.files.upload(file); app.toast('작업 폴더에 올렸습니다 — Cv2.ImRead("파일이름") 으로 사용'); filesTab = 'work'; filesModal(); };
    const clr = $('filesClear');
    if (clr) clr.onclick = () => { if (!confirm('작업 폴더의 내 파일을 모두 지울까요?')) return; E.files.clear(); filesModal(); };
  }
  document.addEventListener('csfiles', () => { if (!$('modal').classList.contains('hidden') && $('modalTitle').textContent.includes('작업 폴더') && filesTab === 'work') filesModal(); });

  // ================================================================== 이벤트
  function bindUi() {
    $('themeBtn').onclick = () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    document.querySelectorAll('.role-switch button').forEach((b) => b.onclick = () => setRole(b.dataset.role));
    document.querySelectorAll('.view-switch button').forEach((b) => b.onclick = () => setView(b.dataset.view));
    $('navSearch').addEventListener('input', () => buildNav());
    $('navTree').addEventListener('click', (e) => {
      const head = e.target.closest('.nav-ch-head');
      if (!head) return;
      const box = head.parentElement;
      if (!box.dataset.ch) return;
      box.classList.toggle('open');
      store.set('jc.open.' + box.dataset.ch, box.classList.contains('open') ? '1' : '0');
    });
    $('navCloseBtn').onclick = () => { $('app').classList.add('nav-collapsed'); store.set('jc.navCollapsed', '1'); setTimeout(() => { app.editor.refresh(); app.deck.fit(); }, 50); };
    $('navOpenBtn').onclick = () => { $('app').classList.remove('nav-collapsed'); store.set('jc.navCollapsed', '0'); setTimeout(() => { app.editor.refresh(); app.deck.fit(); }, 50); };
    $('prevBtn').onclick = () => app.stepSection(-1, 0);
    $('nextBtn').onclick = () => app.stepSection(1, 0);

    $('runBtn').onclick = () => runEditor();
    $('resetBtn').onclick = () => { app.editor.setValue(app.editorState.code || CS_TEMPLATE); app.toast('불러온 원래 코드로 되돌렸습니다'); };
    $('copyBtn').onclick = () => copyText(app.editor.getValue());
    $('dlBtn').onclick = () => download(app.editor.getValue(), /class\s+MainWindow/.test(app.editor.getValue()) ? 'MainWindow.xaml.cs' : 'Program.cs');
    $('fontUpBtn').onclick = () => setEditorFont(app.edFont + 1);
    $('fontDownBtn').onclick = () => setEditorFont(app.edFont - 1);
    $('foldBtn').onclick = () => { const f = $('editorPane').classList.toggle('folded'); $('foldBtn').textContent = f ? '▴ 펼치기' : '▾ 접기'; if (!f) app.editor.refresh(); };
    $('serverBtn').onclick = serverModal;
    $('filesBtn').onclick = filesModal;
    $('navFilesBtn').onclick = filesModal;
    $('modalClose').onclick = closeModal;
    $('modal').addEventListener('click', (e) => { if (e.target === $('modal')) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (app.closeLightbox()) { e.preventDefault(); return; } if (!$('modal').classList.contains('hidden')) closeModal(); });

    $('content').addEventListener('click', (e) => {
      const zi = e.target.closest('[data-zoom-src]');
      if (zi) { window.MVImage.Viewer.openUrl(zi.dataset.zoomSrc, zi.alt || ''); return; }
      if (e.target.closest('[data-open-files]')) { filesModal(); return; }
      const act = e.target.closest('[data-code-act]');
      if (act) {
        const b = app.blockCodes[act.dataset.code];
        if (!b) return;
        const a = act.dataset.codeAct;
        if (a === 'copy') return copyText(b.code);
        if (a === 'edit' || a === 'run' || a === 'run-stdin') {
          loadEditor(b.code, b.title, app.route.sec ? app.route.sec.id : null);
          if (a === 'run') runEditor();
          if (a === 'run-stdin') runEditor(b.stdin);
          if (a === 'edit') app.toast('편집기로 불러왔습니다');
        }
        return;
      }
      const opt = e.target.closest('.quiz .opt');
      if (opt) { const q = app.route.sec.quiz[+opt.dataset.q]; const box = opt.closest('.quiz'); const j = +opt.dataset.o; opt.classList.add(j === q.answer ? 'right' : 'wrong'); if (j === q.answer) box.querySelector('.explain').classList.remove('hidden'); return; }
      const sol = e.target.closest('[data-toggle-sol]');
      if (sol) { const el = $('content').querySelector(`[data-sol="${sol.dataset.toggleSol}"]`); const hidden = el.classList.toggle('hidden'); sol.textContent = hidden ? '🔑 정답 코드 보기' : '🔑 정답 코드 숨기기'; return; }
      const sl = e.target.closest('[data-slides]');
      if (sl) { app.view = 'slides'; go(sl.dataset.slides); if (location.hash === '#' + sl.dataset.slides) render(); return; }
      const rg = e.target.closest('[data-role-go]');
      if (rg) { setRole(rg.dataset.roleGo); return; }
      if (e.target.id === 'doneBtn') { toggleDone(app.route.sec.id); render(); }
      if (e.target.id === 'showAllAnswers') { app.route.sec.quiz.forEach((q, i) => { const box = $('content').querySelector(`[data-quiz="${i}"]`); box.querySelector(`[data-o="${q.answer}"]`).classList.add('right'); box.querySelector('.explain').classList.remove('hidden'); }); }
    });

    document.addEventListener('keydown', (e) => {
      if (app.view === 'slides' && app.route.type === 'section') return;
      const t = e.target;
      if (t.closest && (t.closest('.CodeMirror') || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); app.stepSection(1, 0); }
      if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); app.stepSection(-1, 0); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
