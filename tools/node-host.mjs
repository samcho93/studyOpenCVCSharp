// Node 에서 C# 인터프리터 + OpenCV.js 를 실행하는 호스트 (검증 도구 · 테스트 공용)
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(here, '..');

// zlib 은 Node 의 것을 쓴다 (빠름)
globalThis.CsHostZlib = { deflate: (d) => new Uint8Array(zlib.deflateSync(d)), inflate: (d) => new Uint8Array(zlib.inflateSync(d)) };
for (const f of ['cs-lang', 'cs-runtime', 'cs-stdlib', 'cs-host', 'cs-opencv', 'cs-opencv2']) require(path.join(ROOT, 'js', f + '.js'));
const { Interpreter, CsException, StopSignal } = globalThis.CsRuntime;
const { VirtualFs, makeVideoHost, encodePng, decodePng } = globalThis.CsHost;

let cvPromise = null;
export function loadCv() {
  if (cvPromise) return cvPromise;
  cvPromise = (async () => {
    const dbg = process.env.CS_DEBUG ? (s) => fs.appendFileSync(process.env.CS_DEBUG, new Date().toISOString() + ' ' + s + '\n') : () => {};
    dbg('loadCv: require ' + path.join(ROOT, 'runtime', 'opencv.js'));
    const cv = require(path.join(ROOT, 'runtime', 'opencv.js'));
    dbg('loadCv: required; then=' + typeof cv.then + ' Mat=' + typeof cv.Mat);
    const t0 = Date.now();
    while (!cv.Mat && Date.now() - t0 < 60000) await new Promise((r) => setTimeout(r, 20));
    dbg('loadCv: waited ' + (Date.now() - t0) + 'ms Mat=' + typeof cv.Mat);
    if (!cv.Mat) throw new Error('OpenCV.js 초기화 실패');
    // Emscripten 의 Module.then 은 자기 자신을 넘겨 주므로 Promise 로 감싸면 무한 재귀가 된다 → 제거
    try { delete cv.then; } catch (e) { cv.then = undefined; }
    return cv;
  })();
  return cvPromise;
}

let assetFs = null;
export function loadAssets() {
  if (assetFs) return assetFs;
  assetFs = new VirtualFs();
  const dir = path.join(ROOT, 'assets', 'images');
  for (const f of fs.readdirSync(dir)) if (/\.png$/i.test(f)) assetFs.add('images/' + f, { png: new Uint8Array(fs.readFileSync(path.join(dir, f))) });
  const dataDir = path.join(ROOT, 'assets', 'data');
  if (fs.existsSync(dataDir)) for (const f of fs.readdirSync(dataDir)) assetFs.add('data/' + f, { bytes: new Uint8Array(fs.readFileSync(path.join(dataDir, f))) });
  return assetFs;
}

/**
 * C# 코드 실행
 * @returns {{out, err, images:[{name,w,h,ch,frames}], files:[], exit, error, ms}}
 */
export async function runCs(code, opts = {}) {
  const cv = await loadCv();
  const base = loadAssets();
  const vfs = new VirtualFs();
  for (const [k, v] of base.files) vfs.files.set(k, v);
  const stdinLines = (opts.stdin || '').split('\n');
  let out = '', err = '';
  const images = new Map(), files = [], notes = [];
  const deadline = Date.now() + (opts.timeoutMs || 20000);
  vfs.onWrite = (p, bytes) => files.push({ name: p, size: bytes.length });
  const video = makeVideoHost(vfs);
  const host = {
    cv,
    write: (s, t) => { if (s === 'e') err += t; else out += t; },
    readLine: () => (stdinLines.length ? stdinLines.shift() : null),
    checkStop: () => { if (Date.now() > deadline) throw new StopSignal('시간 초과'); },
    sleep: () => {},
    imshow: (name, w, h, ch, bytes) => { const e = images.get(name) || { name, frames: 0 }; Object.assign(e, { w, h, ch, bytes: opts.keepImages ? bytes : null }); e.frames++; images.set(name, e); },
    waitKey: () => -1,
    note: (t) => notes.push(t),
    fs: vfs, encodePng, decodePng,
    videoOpen: video.videoOpen, videoRead: video.videoRead, videoClose: video.videoClose
  };
  const interp = new Interpreter(host);
  globalThis.CsOpenCv.install(interp, host);
  const t0 = Date.now();
  let exit = 0, error = null;
  try { exit = interp.run(code).exit; }
  catch (e) {
    if (e instanceof CsException) error = { type: e.csType, message: e.csMessage, line: e.csLine || interp.curLine };
    else if (e && e.name === 'CsSyntaxError') error = { type: 'SyntaxError', message: e.message, line: e.line, col: e.col };
    else if (e instanceof StopSignal) error = { type: 'Timeout', message: e.message };
    else error = { type: 'InternalError', message: String(e && e.stack || e), line: interp.curLine };
  }
  return { out, err, images: [...images.values()], files, notes, exit, error, ms: Date.now() - t0 };
}
