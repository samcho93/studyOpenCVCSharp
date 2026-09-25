/* C# 실행 워커: OpenCV.js + C# 인터프리터를 워커 스레드에서 돌린다.
 *  메인 → 워커: {type:'init', base}, {type:'run', id, code, stdin, files, sab?}, {type:'files', files}
 *  워커 → 메인: ready, out/err/note, image, file, waitInput, done, error
 */
'use strict';
let cv = null, ready = false;
const base = self.location.href.replace(/\/js\/[^/]*$/, '/');
const files = new (function () { this.map = new Map(); })();
let vfs = null;

function loadScripts() {
  importScripts(base + 'js/cs-lang.js', base + 'js/cs-runtime.js', base + 'js/cs-stdlib.js', base + 'js/cs-host.js', base + 'js/cs-opencv.js', base + 'js/cs-opencv2.js');
}

async function init() {
  loadScripts();
  vfs = new self.CsHost.VirtualFs();
  postMessage({ type: 'status', text: 'OpenCV.js 내려받는 중… (약 11MB, 처음 한 번)' });
  const t0 = performance.now();
  self.Module = { onRuntimeInitialized() {} };
  importScripts(base + 'runtime/opencv.js');
  // opencv.js 는 전역 cv 를 thenable 로 둔다
  const mod = self.cv;
  await new Promise((resolve) => {
    if (mod && typeof mod.then === 'function') mod.then(() => resolve());
    const poll = () => { if (self.cv && self.cv.Mat) resolve(); else setTimeout(poll, 30); };
    poll();
  });
  cv = self.cv;
  try { delete cv.then; } catch (e) { /* 무시 */ }
  ready = true;
  postMessage({ type: 'ready', ms: Math.round(performance.now() - t0) });
}

// ---------------------------------------------------------------- 입력 · 대기 (SharedArrayBuffer)
let sab = null, ctrl = null, data = null, keyBuf = null;
function setupSab(buf) {
  if (!buf) { sab = null; return; }
  sab = buf;
  ctrl = new Int32Array(sab, 0, 4);        // [0]=입력 상태(0 대기,1 준비), [1]=길이(-1=EOF), [2]=키 수, [3]=중지 플래그
  data = new Uint8Array(sab, 16, 65536);
  keyBuf = new Int32Array(sab, 16 + 65536, 64);
}
function readLineBlocking() {
  if (!sab) return null;
  postMessage({ type: 'waitInput', on: true });
  Atomics.store(ctrl, 0, 0);
  while (Atomics.load(ctrl, 0) === 0) { Atomics.wait(ctrl, 0, 0, 200); if (Atomics.load(ctrl, 3)) throw new self.CsRuntime.StopSignal('중지'); }
  const len = Atomics.load(ctrl, 1);
  postMessage({ type: 'waitInput', on: false });
  if (len < 0) return null;
  const text = new TextDecoder().decode(data.slice(0, len));
  Atomics.store(ctrl, 0, 0);
  return text;
}
function sleepMs(ms) {
  if (ms <= 0) return;
  if (sab) { const end = performance.now() + ms; while (performance.now() < end) { Atomics.wait(ctrl, 0, Atomics.load(ctrl, 0), Math.max(1, Math.min(50, end - performance.now()))); if (Atomics.load(ctrl, 3)) throw new self.CsRuntime.StopSignal('중지'); } }
  else { const end = performance.now() + Math.min(ms, 2000); while (performance.now() < end) { /* 바쁜 대기 */ } }
}
function popKey() {
  if (!sab) return -1;
  const n = Atomics.load(ctrl, 2);
  if (n <= 0) return -1;
  const k = Atomics.load(keyBuf, 0);
  for (let i = 1; i < n; i++) Atomics.store(keyBuf, i - 1, Atomics.load(keyBuf, i));
  Atomics.store(ctrl, 2, n - 1);
  return k;
}

// ---------------------------------------------------------------- 실행
function run(msg) {
  const { id, code, stdin } = msg;
  const R = self.CsRuntime;
  const stdinLines = stdin ? String(stdin).replace(/\r\n/g, '\n').split('\n') : [];
  if (stdinLines.length && stdinLines[stdinLines.length - 1] === '') stdinLines.pop();
  // 파일: 이번 실행에 필요한 이미지(원시 픽셀) 반영
  for (const f of msg.files || []) vfs.add(f.path, f.raw ? { raw: f.raw, png: f.png || null } : { bytes: f.bytes });
  setupSab(msg.sab || null);
  let lastFlush = performance.now();
  const flushCheck = () => { if (ctrl && Atomics.load(ctrl, 3)) throw new R.StopSignal('중지'); };
  const video = self.CsHost.makeVideoHost(vfs);
  const host = {
    cv,
    write: (s, t) => postMessage({ type: 'out', stream: s, text: t }),
    readLine: () => { if (stdinLines.length) return stdinLines.shift(); return readLineBlocking(); },
    checkStop: flushCheck,
    sleep: sleepMs,
    imshow: (name, w, h, ch, bytes) => { const copy = new Uint8Array(bytes); postMessage({ type: 'image', name, w, h, ch, bytes: copy.buffer }, [copy.buffer]); },
    waitKey: (ms) => { flushCheck(); if (ms > 0) sleepMs(ms); else sleepMs(1); return popKey(); },
    destroyWindow: (name) => postMessage({ type: 'closeWindow', name }),
    note: (t) => postMessage({ type: 'out', stream: 'm', text: '💬 ' + t + '\n' }),
    fs: vfs, encodePng: self.CsHost.encodePng, decodePng: self.CsHost.decodePng,
    videoOpen: video.videoOpen, videoRead: video.videoRead, videoClose: video.videoClose
  };
  vfs.onWrite = (p, bytes, raw) => { const copy = new Uint8Array(bytes); postMessage({ type: 'file', path: p, bytes: copy.buffer, raw: raw ? { w: raw.w, h: raw.h, ch: raw.ch } : null }, [copy.buffer]); };
  const interp = new R.Interpreter(host);
  self.CsOpenCv.install(interp, host);
  const t0 = performance.now();
  try {
    const r = interp.run(code);
    postMessage({ type: 'done', id, exit: r.exit, ms: performance.now() - t0 });
  } catch (e) {
    let err;
    if (e instanceof R.CsException) err = { kind: 'runtime', type: e.csType, message: e.csMessage, line: e.csLine || interp.curLine || null, inner: e.inner ? e.inner.csMessage : null };
    else if (e && e.name === 'CsSyntaxError') err = { kind: 'syntax', type: 'SyntaxError', message: e.message, line: e.line, col: e.col };
    else if (e instanceof R.StopSignal) err = { kind: 'stopped', type: 'Stopped', message: '실행을 중지했습니다', line: interp.curLine };
    else if (e instanceof RangeError) err = { kind: 'runtime', type: 'StackOverflowException', message: '재귀 호출이 너무 깊습니다 (스택 오버플로)', line: interp.curLine };
    else err = { kind: 'internal', type: 'InternalError', message: String(e && (e.stack || e.message) || e), line: interp.curLine || null };
    postMessage({ type: 'error', id, error: err, ms: performance.now() - t0 });
  }
}

self.onmessage = (ev) => {
  const m = ev.data;
  if (m.type === 'init') { init().catch((e) => postMessage({ type: 'initError', message: String(e && e.message || e) })); return; }
  if (m.type === 'files') { for (const f of m.files || []) vfs.add(f.path, f.raw ? { raw: f.raw, png: f.png || null } : { bytes: f.bytes }); return; }
  if (m.type === 'clearFiles') { vfs.files.clear(); return; }
  if (m.type === 'listFiles') { postMessage({ type: 'fileList', id: m.id, files: [...vfs.files.entries()].map(([k, v]) => ({ name: k, size: (v.bytes || v.png || {}).length || (v.raw ? v.raw.bytes.length : 0), isImage: !!(v.raw || v.png) })) }); return; }
  if (m.type === 'readFile') { const e = vfs.files.get(vfs.norm(m.path)); let bytes = null; if (e) bytes = e.bytes || e.png || (e.raw ? self.CsHost.encodePng(e.raw) : null); postMessage({ type: 'fileData', id: m.id, path: m.path, bytes: bytes ? bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) : null }); return; }
  if (m.type === 'run') { if (!ready) { postMessage({ type: 'error', id: m.id, error: { kind: 'internal', type: 'NotReady', message: '실행 환경이 아직 준비되지 않았습니다' } }); return; } run(m); }
};
