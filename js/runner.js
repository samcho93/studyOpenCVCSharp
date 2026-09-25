/* 결과 창(콘솔) + 코드 실행 — C# (브라우저 안의 C# 인터프리터 + OpenCV.js 4.13)
 *  - 표준 출력 · 오류, 실행 중 입력(Console.ReadLine), Cv2.ImShow 이미지 창(라이브), Cv2.WaitKey 키 입력
 *  - 오류 위치 → 편집기 줄 이동, 한국어 도움말
 */
(function () {
  const { esc } = window.JU;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 저장 불가 환경 */ } }
  };
  const E = window.CsEngine;

  // ------------------------------------------------------------------ 오류 도움말
  const HINTS = [
    [/';' 가 필요합니다/, '문장 끝에 <b>세미콜론(;)</b>이 빠졌습니다. 표시된 줄이나 바로 윗줄 끝을 확인하세요.'],
    [/'\)' 가 필요합니다|'\(' 가 필요합니다|'\}' 가 필요합니다|블록이 닫히지 않았습니다/, '<b>괄호 짝</b>이 맞지 않습니다. 여는 괄호와 닫는 괄호의 개수를 세어 보세요.'],
    [/문자열이 닫히지 않았습니다/, '문자열의 <b>큰따옴표(")</b>가 닫히지 않았습니다. 문자는 작은따옴표(\'a\'), 문자열은 큰따옴표("abc") 입니다.'],
    [/이름을 찾을 수 없습니다/, '선언하지 않은 <b>이름</b>입니다. 철자 · 대소문자(C# 은 구분합니다), 변수를 선언한 위치(블록 범위), <code>using</code> 문을 확인하세요.'],
    [/형식을 찾을 수 없습니다/, '<b>형식(클래스) 이름</b>을 찾을 수 없습니다. <code>using OpenCvSharp;</code> 가 있는지, 철자가 맞는지 확인하세요.'],
    [/멤버가 없습니다|메서드가 없습니다|정적 멤버 .* 없습니다|정적 메서드 .* 없습니다/, '그 형식에는 그런 <b>속성 · 메서드가 없습니다</b>. OpenCvSharp 은 <b>PascalCase</b>(예: <code>Cv2.CvtColor</code>, <code>img.Rows</code>, <code>Cv2.ImShow</code>)를 씁니다. 메서드는 괄호(), 속성은 괄호 없이 씁니다.'],
    [/열거형 .* 멤버가 없습니다/, '열거형 값 이름을 확인하세요. 예: <code>ColorConversionCodes.BGR2GRAY</code>, <code>ThresholdTypes.Binary</code>, <code>ImreadModes.Grayscale</code>.'],
    [/문자열을 int 로|InvalidCastException/, '<b>형식이 맞지 않습니다.</b> 문자열 → 숫자는 <code>int.Parse()</code>/<code>double.Parse()</code>, 숫자 → 문자열은 <code>.ToString()</code>, 실수 → 정수는 <code>(int)</code> 형변환을 쓰세요.'],
    [/NullReferenceException|null 입니다/, '<b>null 을 사용했습니다.</b> <code>new Mat()</code> 으로 만들지 않은 변수, <code>ImRead</code> 실패(빈 Mat), 초기화하지 않은 배열 요소를 확인하세요.'],
    [/IndexOutOfRangeException|범위를 벗어난/, '<b>인덱스 범위</b>를 벗어났습니다. 배열은 0 ~ Length-1, Mat 은 <code>At&lt;T&gt;(y, x)</code> 로 <b>(행 y, 열 x)</b> 순서입니다.'],
    [/DivideByZeroException/, '<b>정수를 0 으로 나누었습니다.</b> 면적이 0 인 윤곽, 개수가 0 인 평균 계산을 확인하세요.'],
    [/FormatException/, '문자열 → 숫자 변환에 실패했습니다. 입력 값에 숫자만 있는지 확인하고, <code>int.TryParse</code> 로 안전하게 처리하세요.'],
    [/scn == 3 \|\| scn == 4|Invalid number of channels|VScn::contains/, '<b>채널 수</b>가 맞지 않습니다. 이미 흑백(1채널)인 이미지에 <code>BGR2GRAY</code> 를 쓰지 않았는지 확인하세요 (<code>img.Channels()</code> 로 확인).'],
    [/depth == CV_8U|CV_8UC1|src\.type\(\) == CV_8UC1|_src\.type\(\)/, '이 함수는 <b>8비트 1채널(CV_8UC1)</b> 이미지가 필요합니다. <code>Cv2.CvtColor(img, gray, ColorConversionCodes.BGR2GRAY)</code> 로 바꾸세요.'],
    [/\.empty\(\)|빈 이미지|빈 Mat/, '<b>이미지가 비어 있습니다.</b> <code>Cv2.ImRead</code> 의 파일 이름을 확인하세요. 예제 이미지는 <code>images/…png</code> 이며 📁 작업 폴더에서 목록을 볼 수 있습니다.'],
    [/ksize|kernel size|must be odd|Assertion failed.*ksize/, '커널 크기(<b>ksize</b>)는 <b>홀수</b>(3, 5, 7 …)여야 합니다.'],
    [/OpenCVException/, 'OpenCV 함수 호출 오류입니다. 메시지의 함수 이름과 조건식을 보면 원인을 알 수 있습니다. 입력 이미지의 <b>크기 · 채널 · 자료형</b>을 <code>Console.WriteLine(img.Type())</code> 로 확인해 보세요.'],
    [/WPF|Visual Studio 에서 실행/, '이 코드는 <b>WPF 창(데스크톱)</b>이 필요합니다. 브라우저에서는 <code>Cv2.ImShow</code> 로 결과를 보고, 전체 앱은 Visual Studio 에서 실행하세요.'],
    [/StackOverflow|재귀 호출/, '재귀가 끝나지 않았습니다. 종료 조건을 확인하세요.'],
    [/시간 초과|Timeout/, '실행이 너무 오래 걸립니다. 무한 반복(<code>while (true)</code>)에 종료 조건이 있는지, 카메라 반복이 <code>Cv2.WaitKey</code> 의 키(ESC)로 끝나는지 확인하세요.'],
    [/out\/ref 를 붙여야|out 변수여야/, '메서드의 <code>out</code> 매개 변수에는 <code>out var 이름</code> 또는 <code>out 변수</code> 를 넘겨야 합니다. 예: <code>Cv2.FindContours(bin, out var contours, out var hier, …)</code>.'],
    [/진입점이 없습니다/, '<code>static void Main()</code> 이 있는 클래스가 필요합니다. 또는 클래스 없이 문장을 바로 쓸 수도 있습니다(최상위 문).']
  ];
  const hintFor = (text) => { for (const [re, h] of HINTS) if (re.test(text)) return h; return null; };
  const usesInput = (code) => /Console\.Read(Line|Key)?\s*\(/.test(code);

  // ------------------------------------------------------------------ 콘솔
  class Console {
    constructor(el) {
      this.el = el;
      this.out = el.querySelector('#jcConsole');
      this.form = el.querySelector('#stdinForm');
      this.input = el.querySelector('#stdinInput');
      this.eofBtn = el.querySelector('#eofBtn');
      this.stopBtn = el.querySelector('#stopBtn');
      this.state = el.querySelector('#runState');
      this.left = el.querySelector('#statusLeft');
      this.right = el.querySelector('#statusRight');
      this.main = el.querySelector('#consoleMain');
      this.run = null;
      this.onJump = null;
      this.history = [];
      this.hIndex = 0;
      this.fontSize = +store.get('jc.consoleFont', 14);
      this.applyFont();

      this.form.addEventListener('submit', (e) => { e.preventDefault(); this.sendLine(); });
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'd' && e.ctrlKey) { e.preventDefault(); this.sendEof(); }
        if (e.key === 'c' && e.ctrlKey && !this.input.selectionEnd) { e.preventDefault(); this.stop(); }
        if (e.key === 'ArrowUp' && this.history.length) { e.preventDefault(); this.hIndex = Math.max(0, this.hIndex - 1); this.input.value = this.history[this.hIndex] || ''; }
        if (e.key === 'ArrowDown' && this.history.length) { e.preventDefault(); this.hIndex = Math.min(this.history.length, this.hIndex + 1); this.input.value = this.history[this.hIndex] || ''; }
        e.stopPropagation();
      });
      this.eofBtn.addEventListener('click', () => this.sendEof());
      this.stopBtn.addEventListener('click', () => this.stop());
      el.querySelector('#clearBtn').addEventListener('click', () => this.clear());
      el.querySelector('#cFontUp').addEventListener('click', () => { this.fontSize = Math.min(28, this.fontSize + 1); this.applyFont(); });
      el.querySelector('#cFontDown').addEventListener('click', () => { this.fontSize = Math.max(10, this.fontSize - 1); this.applyFont(); });
      this.out.addEventListener('click', (e) => {
        const loc = e.target.closest('[data-jump]');
        if (loc && this.onJump) this.onJump(+loc.dataset.jump);
      });
      // Cv2.WaitKey: 실행 중 결과 창(또는 페이지)에서 누른 키를 프로그램으로 보낸다
      document.addEventListener('keydown', (e) => {
        const r = this.run;
        if (!r || r.done) return;
        const t = e.target;
        if (t && t.closest && (t.closest('.CodeMirror') || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        let code = -1;
        if (e.key.length === 1) code = e.key.charCodeAt(0);
        else code = { Escape: 27, Enter: 13, ' ': 32, Backspace: 8, Tab: 9, ArrowLeft: 81, ArrowRight: 83, ArrowUp: 82, ArrowDown: 84 }[e.key] || -1;
        if (code < 0) return;
        E.key(code);
        if (code === 27 || e.key.length === 1) e.preventDefault();
      });
    }

    applyFont() { this.el.style.setProperty('--c-font', this.fontSize + 'px'); store.set('jc.consoleFont', this.fontSize); }
    clear() { this.out.innerHTML = ''; this.last = null; }
    atBottom() { return this.out.scrollHeight - this.out.scrollTop - this.out.clientHeight < 40; }

    write(cls, text) {
      if (!text) return;
      const stick = this.atBottom();
      const welcome = this.out.querySelector('.console-welcome');
      if (welcome) welcome.remove();
      if (this.last && this.last.className === cls && this.last.parentNode === this.out && this.last.textContent.length < 20000) this.last.textContent += text;
      else { const span = document.createElement('span'); span.className = cls; span.textContent = text; this.out.appendChild(span); this.last = span; }
      if (this.out.textContent.length > 300000) { while (this.out.firstChild && this.out.textContent.length > 200000) this.out.firstChild.remove(); }
      if (stick) this.out.scrollTop = this.out.scrollHeight;
    }
    html(html) {
      const stick = this.atBottom();
      const welcome = this.out.querySelector('.console-welcome');
      if (welcome) welcome.remove();
      const div = document.createElement('span');
      div.innerHTML = html;
      while (div.firstChild) this.out.appendChild(div.firstChild);
      this.last = null;
      if (stick) this.out.scrollTop = this.out.scrollHeight;
    }
    /** Cv2.ImShow: 같은 실행에서 같은 이름이면 같은 창을 새로 그린다 */
    showImage(run, name, w, h, ch, bytes) {
      if (!run.images) run.images = new Map();
      let win = run.images.get(name);
      if (!win) {
        const stick = this.atBottom();
        const welcome = this.out.querySelector('.console-welcome');
        if (welcome) welcome.remove();
        win = new window.MVImage.Window(name);
        run.images.set(name, win);
        this.out.appendChild(win.el);
        this.last = null;
        win.update(w, h, ch, bytes);
        if (stick) requestAnimationFrame(() => { this.out.scrollTop = this.out.scrollHeight; });
      } else win.update(w, h, ch, bytes);
    }
    closeWindow(run, name) {
      if (!run.images) return;
      if (name == null) { run.images.forEach((w) => w.el.remove()); run.images.clear(); return; }
      const w = run.images.get(name);
      if (w) { w.el.remove(); run.images.delete(name); }
    }
    setState(kind, text) { this.state.className = 'run-state ' + kind; this.state.textContent = text; }
    setRunning(on) { this.input.disabled = !on; this.eofBtn.disabled = !on; this.stopBtn.disabled = !on; if (!on) this.form.classList.remove('waiting'); }

    sendLine() {
      if (!this.run || this.run.done) return;
      const text = this.input.value;
      this.input.value = '';
      if (text) { this.history.push(text); this.hIndex = this.history.length; }
      this.write('i', text + '\n');
      this.form.classList.remove('waiting');
      E.input(text);
    }
    sendEof() { if (!this.run || this.run.done) return; this.write('m', '^D\n'); E.eof(); }
    stop() { const r = this.run; if (!r || r.done) return; r.stopped = true; E.stop(); }

    /**
     * 코드 실행
     * @param {string} code
     * @param {{label?:string, stdin?:string, onDiagnostics?:Function, clear?:boolean, focusInput?:boolean}} opts
     */
    async execute(code, opts = {}) {
      if (this.run && !this.run.done) { this.run.superseded = true; E.stop(); await new Promise((r) => setTimeout(r, 450)); }
      const run = { code, done: false, label: opts.label || '', images: new Map() };
      this.run = run;
      if (opts.clear !== false && store.get('jc.keepConsole', '0') !== '1') this.clear();
      else if (this.out.textContent.trim()) this.html('<span class="run-sep"></span>');
      this.main.textContent = '💠 C#' + (opts.label ? ' · ' + opts.label : '');
      if (opts.onDiagnostics) opts.onDiagnostics([]);

      if (!E.supported()) {
        this.setState('error', '실행 불가');
        this.html('<span class="hint"><b>⚠ 이 브라우저에서는 C# 을 실행할 수 없습니다.</b><br>최신 Chrome · Edge · Firefox · Safari 를 사용하세요.</span>');
        run.done = true;
        return { ok: false };
      }
      if (E.state !== 'ready') {
        this.setState('compiling', '준비 중…');
        this.html(`<span class="hint"><b>💠 브라우저에서 C# 실행 환경(C# 인터프리터 + OpenCV.js 4.13)을 준비하고 있습니다…</b><br>
          처음 한 번은 OpenCV(약 11MB)를 내려받느라 <b>5 ~ 30초</b> 걸리고, 이후에는 바로 실행됩니다.</span>`);
        E.onChange((b) => { if (!run.done && b.state === 'loading') this.left.textContent = b.message || '준비 중…'; });
      }
      try { await E.load(); }
      catch (e) {
        this.setState('error', '준비 실패');
        this.write('e', 'C# 실행 환경을 준비하지 못했습니다: ' + (e && e.message || e) + '\n');
        this.html('<span class="hint">인터넷 연결을 확인하고 페이지를 새로고침하세요. 파일을 직접 연 경우(<code>file://</code>)에는 동작하지 않습니다 — <code>start.bat</code> 으로 로컬 서버를 켜거나 GitHub Pages 주소로 접속하세요.</span>');
        run.done = true;
        return { ok: false };
      }
      if (run.superseded) return { ok: false };
      if (this.out.querySelector('.hint') && !this.out.textContent.includes('▶')) this.clear();

      let stdin = opts.stdin || '';
      if (E.mode === 'none' && usesInput(code) && !stdin) {
        const v = window.prompt('이 브라우저 환경에서는 실행 중에 입력을 받을 수 없습니다.\n프로그램에 넣을 입력값을 미리 적어 주세요. (여러 줄은 | 로 구분)', '');
        if (v == null) { run.done = true; this.setState('idle', '대기'); return { ok: false }; }
        stdin = v.split('|').join('\n') + '\n';
      }
      if (stdin) this.write('m', `[예시 입력을 자동으로 보냈습니다: ${stdin.replace(/\n$/, '').replace(/\n/g, ' ⏎ ')}]\n`);

      this.setRunning(true);
      this.setState('running', '실행 중');
      this.left.textContent = '▶ 실행 중 (C#)';
      this.right.textContent = '';
      if (usesInput(code) && !stdin && opts.focusInput !== false) setTimeout(() => { if (!run.done) this.input.focus({ preventScroll: true }); }, 50);
      const started = performance.now();
      const tick = setInterval(() => { this.right.textContent = ((performance.now() - started) / 1000).toFixed(1) + '초'; }, 100);
      let stderr = '', endsWithNewline = true;
      let r;
      try {
        r = await E.run({
          code, stdin,
          onOutput: (s, text) => {
            if (run.superseded) return;
            if (s === 'e') stderr += text;
            this.write(s === 'e' ? 'e' : s === 'm' ? 'm' : 'o', text);
            endsWithNewline = /\n$/.test(text);
          },
          onImage: (name, w, h, ch, bytes) => { if (!run.superseded) { this.showImage(run, name, w, h, ch, bytes); endsWithNewline = true; } },
          onCloseWindow: (name) => this.closeWindow(run, name),
          onWaitInput: (on) => { if (run.superseded) return; this.form.classList.toggle('waiting', on); if (on && opts.focusInput !== false) this.input.focus({ preventScroll: true }); },
          onFile: (path, bytes, raw) => { if (!run.superseded) this.html(`<span class="m">💾 파일 저장: <b>${esc(path)}</b> (${(bytes.length / 1024).toFixed(1)} KB${raw ? `, ${raw.w}×${raw.h}` : ''}) — 📁 작업 폴더에서 확인</span>\n`); }
        });
      } catch (e) {
        r = { ok: false, exit: 1, error: { type: 'InternalError', message: String(e && e.message || e) } };
      } finally {
        clearInterval(tick);
        run.done = true;
        if (this.run === run) this.setRunning(false);
      }
      if (run.superseded) return { ok: false };
      if (!endsWithNewline) this.write('o', '\n');
      const sec = ((r.ms || (performance.now() - started)) / 1000).toFixed(2);
      let diags = [];
      if (r.ok) {
        this.write('m', `\n── 프로그램 종료 (종료 코드 ${r.exit}, ${sec}초) ──\n`);
        this.setState(r.exit === 0 ? 'done' : 'error', r.exit === 0 ? '완료' : `종료 코드 ${r.exit}`);
        this.left.textContent = r.exit === 0 ? '✓ 실행 완료' : '✗ 종료 코드 ' + r.exit;
      } else {
        const err = r.error || {};
        if (err.kind === 'stopped' || err.type === 'Stopped') {
          this.write('e', '\n■ 실행을 중지했습니다.\n');
          this.setState('error', '중지됨'); this.left.textContent = '■ 실행을 중지했습니다';
        } else if (err.kind === 'syntax') {
          this.html(`<span class="diag"><span class="e">✗ 구문 오류</span> <span class="loc" data-jump="${err.line || 1}" title="편집기에서 이 줄로 이동">${err.line || '?'}행${err.col ? ' ' + err.col + '열' : ''}</span>: <span class="e">${esc(err.message)}</span>\n</span>`);
          diags = [{ kind: 'error', line: err.line || 1, editorLine: err.line || 1, message: err.message }];
          const h = hintFor(err.message);
          if (h) this.html(`<span class="hint"><b>💡 도움말</b> ${h}</span>`);
          this.setState('error', '구문 오류'); this.left.textContent = '✗ 구문 오류 (컴파일 실패)';
        } else {
          const typeName = err.type === 'CompileError' ? '컴파일 오류' : `처리되지 않은 예외: System.${err.type}`;
          this.html(`<span class="diag"><span class="e">✗ ${esc(typeName)}</span>${err.line ? ` <span class="loc" data-jump="${err.line}" title="편집기에서 이 줄로 이동">${err.line}행</span>` : ''}: <span class="e">${esc(err.message || '')}</span>${err.inner ? `\n<span class="m">   내부 예외: ${esc(err.inner)}</span>` : ''}\n</span>`);
          if (err.line) diags = [{ kind: 'error', line: err.line, editorLine: err.line, message: `${err.type}: ${err.message}` }];
          const h = hintFor((err.type || '') + ' ' + (err.message || ''));
          if (h) this.html(`<span class="hint"><b>💡 도움말</b> ${h}</span>`);
          if (err.kind === 'internal') this.html('<span class="hint">이 오류는 브라우저 실습 환경(C# 인터프리터)의 한계일 수 있습니다. 코드를 조금 바꿔 보거나, Visual Studio 에서 실행해 보세요.</span>');
          this.write('m', `\n── 프로그램 종료 (종료 코드 ${r.exit == null ? 1 : r.exit}, ${sec}초) ──\n`);
          this.setState('error', err.type === 'CompileError' ? '컴파일 오류' : '예외 발생');
          this.left.textContent = err.type === 'CompileError' ? '✗ 컴파일 오류' : '✗ 예외로 종료';
        }
      }
      if (opts.onDiagnostics && diags.length) opts.onDiagnostics(diags);
      this.right.textContent = sec + '초';
      return { ok: r.ok, exit: r.exit };
    }
  }

  window.Runner = { Console, store, engine: E, hintFor };
})();
