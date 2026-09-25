/* 브라우저 안의 C# 실행 엔진 (메인 스레드 쪽): 워커 관리 · 이미지 미리 불러오기 · 실행 중 입력/키 · 작업 폴더
 *  window.CsEngine = { state, message, onChange, load(), run({code, stdin, onOutput, onImage, onWaitInput, onFile}), input(text), eof(), key(code), stop(), files }
 */
(function () {
  const base = location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
  const E = {
    state: 'idle', message: '', listeners: [], loadMs: 0, opencv: '4.13', ready: false,
    onChange(fn) { this.listeners.push(fn); fn(this); },
    emit(state, message) { this.state = state; this.message = message || ''; this.listeners.forEach((f) => { try { f(this); } catch (e) { /* 무시 */ } }); },
    supported() { return typeof Worker === 'function' && typeof WebAssembly === 'object'; },
    interactive() { return typeof SharedArrayBuffer === 'function' && !!window.crossOriginIsolated; },
    mode: (typeof SharedArrayBuffer === 'function' && window.crossOriginIsolated) ? 'sab' : 'none'
  };
  let worker = null, readyPromise = null, current = null, sab = null, ctrl = null, data = null, keyBuf = null;
  const userFiles = new Map();     // 사용자가 올린 · 프로그램이 만든 파일 (path → {bytes, raw})
  let manifest = null;
  const rawCache = new Map();      // 예제 이미지 path → {w,h,ch,bytes}

  function makeWorker() {
    worker = new Worker(base + 'js/cs-worker.js');
    worker.onmessage = (ev) => handle(ev.data);
    worker.onerror = (e) => { E.emit('error', '워커 오류: ' + (e.message || e)); if (current) { current.done({ ok: false, exit: 1, error: { type: 'InternalError', message: e.message } }); current = null; } };
    if (E.mode === 'sab') {
      sab = new SharedArrayBuffer(16 + 65536 + 256);
      ctrl = new Int32Array(sab, 0, 4); data = new Uint8Array(sab, 16, 65536); keyBuf = new Int32Array(sab, 16 + 65536, 64);
    }
    worker.postMessage({ type: 'init' });
  }

  E.load = function () {
    if (readyPromise) return readyPromise;
    readyPromise = new Promise((resolve, reject) => {
      E.emit('loading', 'C# 실행 환경 준비 중…');
      E._resolve = resolve; E._reject = reject;
      const t0 = performance.now();
      E._t0 = t0;
      try { makeWorker(); } catch (e) { readyPromise = null; E.emit('error', String(e.message || e)); reject(e); }
    });
    return readyPromise;
  };

  function handle(m) {
    switch (m.type) {
      case 'status': E.emit('loading', m.text); break;
      case 'ready': E.loadMs = Math.round(performance.now() - E._t0); E.ready = true; E.emit('ready', `준비 완료 (${(E.loadMs / 1000).toFixed(1)}초)`); if (E._resolve) E._resolve(); break;
      case 'initError': readyPromise = null; E.emit('error', m.message); if (E._reject) E._reject(new Error(m.message)); break;
      case 'out': if (current) current.onOutput(m.stream, m.text); break;
      case 'image': if (current) current.onImage(m.name, m.w, m.h, m.ch, new Uint8Array(m.bytes)); break;
      case 'closeWindow': if (current && current.onCloseWindow) current.onCloseWindow(m.name); break;
      case 'waitInput': if (current) current.onWaitInput(m.on); break;
      case 'file': { const bytes = new Uint8Array(m.bytes); userFiles.set(m.path, { bytes, raw: m.raw }); if (current && current.onFile) current.onFile(m.path, bytes, m.raw); document.dispatchEvent(new CustomEvent('csfiles')); break; }
      case 'done': if (current) { current.done({ ok: true, exit: m.exit, ms: m.ms }); current = null; } break;
      case 'error': if (current) { current.done({ ok: false, exit: 1, error: m.error, ms: m.ms }); current = null; } break;
      case 'fileList': if (E._fileListWaiters[m.id]) { E._fileListWaiters[m.id](m.files); delete E._fileListWaiters[m.id]; } break;
      case 'fileData': if (E._fileWaiters[m.id]) { E._fileWaiters[m.id](m.bytes ? new Uint8Array(m.bytes) : null); delete E._fileWaiters[m.id]; } break;
      default: break;
    }
  }
  E._fileListWaiters = {}; E._fileWaiters = {}; let seq = 0;

  // ---------------------------------------------------------------- 예제 이미지 미리 불러오기 (PNG → 픽셀)
  async function loadManifest() {
    if (manifest) return manifest;
    try { const r = await fetch(base + 'assets/manifest.json', { cache: 'no-cache' }); manifest = r.ok ? await r.json() : []; } catch (e) { manifest = []; }
    return manifest;
  }
  E.loadManifest = loadManifest;
  async function decodeAsset(path) {
    if (rawCache.has(path)) return rawCache.get(path);
    const r = await fetch(base + 'assets/' + path);
    if (!r.ok) return null;
    const blob = await r.blob();
    let raw;
    if (/\.png$/i.test(path) || /\.(jpe?g|bmp|gif|webp)$/i.test(path)) {
      const bmp = await createImageBitmap(blob);
      const canvas = document.createElement('canvas'); canvas.width = bmp.width; canvas.height = bmp.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(bmp, 0, 0);
      const id = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
      raw = rgbaToRaw(bmp.width, bmp.height, id);
    } else raw = null;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const entry = raw ? { raw, png: bytes } : { bytes };
    rawCache.set(path, entry);
    return entry;
  }
  /** RGBA → 회색이면 1채널, 아니면 BGR 3채널 (알파가 있으면 BGRA) */
  function rgbaToRaw(w, h, d) {
    const n = w * h;
    let gray = true, alpha = false;
    for (let i = 0, j = 0; i < n; i++, j += 4) { if (d[j] !== d[j + 1] || d[j] !== d[j + 2]) gray = false; if (d[j + 3] !== 255) alpha = true; if (!gray && alpha) break; }
    if (alpha) { const b = new Uint8Array(n * 4); for (let i = 0, j = 0; i < n; i++, j += 4) { b[j] = d[j + 2]; b[j + 1] = d[j + 1]; b[j + 2] = d[j]; b[j + 3] = d[j + 3]; } return { w, h, ch: 4, bytes: b }; }
    if (gray) { const b = new Uint8Array(n); for (let i = 0, j = 0; i < n; i++, j += 4) b[i] = d[j]; return { w, h, ch: 1, bytes: b }; }
    const b = new Uint8Array(n * 3); for (let i = 0, j = 0, k = 0; i < n; i++, j += 4, k += 3) { b[k] = d[j + 2]; b[k + 1] = d[j + 1]; b[k + 2] = d[j]; } return { w, h, ch: 3, bytes: b };
  }
  E.rgbaToRaw = rgbaToRaw;
  /** 코드에 나오는 images/…, data/… 파일 (형식 문자열 · 반복 시퀀스 포함) */
  async function assetsFor(code) {
    const list = await loadManifest();
    const want = new Set();
    const re = /["']((?:images|data)\/[^"'\n{]+)["']/g;
    let m;
    while ((m = re.exec(code))) { const p = m[1]; if (list.includes(p)) want.add(p); else if (p.endsWith('/')) list.filter((f) => f.startsWith(p)).forEach((f) => want.add(f)); }
    if (/conveyor|VideoCapture|camera/i.test(code)) list.filter((f) => /conveyor_/.test(f)).forEach((f) => want.add(f));
    if (/\$"images\/|images\/"\s*\+|Path\.Combine|Directory\.GetFiles|string\.Format\("images/i.test(code)) list.filter((f) => f.startsWith('images/')).forEach((f) => want.add(f));
    const files = [];
    await Promise.all([...want].map(async (p) => { const e = await decodeAsset(p); if (e) files.push(Object.assign({ path: p }, e)); }));
    return files;
  }
  E.assetsFor = assetsFor;

  // ---------------------------------------------------------------- 실행
  /**
   * @param {{code, stdin?, onOutput(stream,text), onImage(name,w,h,ch,bytes), onWaitInput(on), onFile?(path,bytes,raw), onCloseWindow?(name)}} h
   * @returns {Promise<{ok, exit, error?, ms}>}
   */
  E.run = async function (h) {
    await E.load();
    if (current) { E.stop(); await new Promise((r) => setTimeout(r, 50)); }
    const files = await assetsFor(h.code);
    for (const [p, f] of userFiles) files.push(Object.assign({ path: p }, f));
    if (ctrl) { Atomics.store(ctrl, 0, 0); Atomics.store(ctrl, 1, 0); Atomics.store(ctrl, 2, 0); Atomics.store(ctrl, 3, 0); }
    return new Promise((resolve) => {
      current = Object.assign({ done: resolve, onWaitInput: () => {}, onImage: () => {}, onOutput: () => {} }, h);
      worker.postMessage({ type: 'run', id: ++seq, code: h.code, stdin: h.stdin || '', files: files.map((f) => ({ path: f.path, raw: f.raw, png: f.png, bytes: f.bytes })), sab });
    });
  };
  E.input = function (text) {
    if (!ctrl || !current) return;
    const enc = new TextEncoder().encode(String(text).replace(/\n$/, ''));
    data.set(enc.subarray(0, 65536), 0);
    Atomics.store(ctrl, 1, Math.min(enc.length, 65536));
    Atomics.store(ctrl, 0, 1); Atomics.notify(ctrl, 0);
  };
  E.eof = function () { if (!ctrl) return; Atomics.store(ctrl, 1, -1); Atomics.store(ctrl, 0, 1); Atomics.notify(ctrl, 0); };
  E.key = function (code) { if (!ctrl) return; const n = Atomics.load(ctrl, 2); if (n >= 64) return; Atomics.store(keyBuf, n, code); Atomics.store(ctrl, 2, n + 1); };
  /** 중지: 협조적 중지 플래그 → 잠시 뒤에도 안 멈추면 워커 종료 후 재시작 */
  E.stop = function () {
    if (!current) return;
    const cur = current;
    if (ctrl) { Atomics.store(ctrl, 3, 1); Atomics.notify(ctrl, 0); }
    setTimeout(() => {
      if (current !== cur) return;
      try { worker.terminate(); } catch (e) { /* 무시 */ }
      current = null;
      cur.done({ ok: false, exit: 130, error: { kind: 'stopped', type: 'Stopped', message: '실행을 강제로 중지했습니다 (실행 환경을 다시 준비합니다)' } });
      readyPromise = null; E.ready = false;
      E.load().catch(() => {});
    }, ctrl ? 400 : 0);
  };

  // ---------------------------------------------------------------- 작업 폴더
  E.files = {
    async list() { const assets = await loadManifest(); const out = assets.map((n) => ({ name: n, asset: true })); for (const [p, f] of userFiles) out.push({ name: p, size: f.bytes.length, raw: f.raw }); return out; },
    async read(name) { if (userFiles.has(name)) return userFiles.get(name).bytes; const r = await fetch(base + 'assets/' + name); return r.ok ? new Uint8Array(await r.arrayBuffer()) : null; },
    async upload(file) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let raw = null;
      if (/\.(png|jpe?g|bmp|gif|webp)$/i.test(file.name)) { try { const bmp = await createImageBitmap(new Blob([bytes])); const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height; const cx = c.getContext('2d'); cx.drawImage(bmp, 0, 0); raw = rgbaToRaw(bmp.width, bmp.height, cx.getImageData(0, 0, bmp.width, bmp.height).data); } catch (e) { raw = null; } }
      userFiles.set(file.name, raw ? { bytes, raw } : { bytes });
      document.dispatchEvent(new CustomEvent('csfiles'));
      return file.name;
    },
    remove(name) { userFiles.delete(name); document.dispatchEvent(new CustomEvent('csfiles')); },
    clear() { userFiles.clear(); document.dispatchEvent(new CustomEvent('csfiles')); },
    has(name) { return userFiles.has(name); },
    userEntries() { return [...userFiles.entries()]; }
  };

  window.CsEngine = E;
})();
