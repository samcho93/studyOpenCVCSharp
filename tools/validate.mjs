// 차시 파일 검증: node tools/validate.mjs [cs07 ...] [--print] [--lang cs]
//  - lessons/*.js 를 로드해 스키마를 확인하고, 모든 C# 코드를 인터프리터 + OpenCV.js 로 실행해 expect 와 비교한다
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { runCs, ROOT } from './node-host.mjs';

const args = process.argv.slice(2);
const print = args.includes('--print');
const quiet = args.includes('--quiet');
const ids = args.filter((a) => !a.startsWith('--'));

// course.js + lessons 로드 (브라우저 전역 흉내)
const sandbox = { window: {}, console, CS_COURSE: null };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'course.js'), 'utf8'), sandbox, { filename: 'course.js' });
const C = sandbox.window.CS_COURSE;
const targets = ids.length ? ids : C.order.map((o) => o.id).filter((id) => fs.existsSync(path.join(ROOT, 'lessons', id + '.js')));

let errors = 0, warnings = 0, ran = 0;
const err = (m) => { errors++; console.log('  ✗ ' + m); };
const warn = (m) => { warnings++; if (!quiet) console.log('  ⚠ ' + m); };
const norm = (s) => String(s == null ? '' : s).replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/\s+$/, '');

const KNOWN_BLOCKS = new Set(['h', 'p', 'list', 'table', 'figure', 'image', 'code', 'callout', 'wpf', 'demo', 'html']);
const KNOWN_LAYOUTS = new Set(['title', 'goals', 'bullets', 'code', 'two', 'table', 'diagram', 'image', 'demo', 'quiz', 'practice', 'summary']);
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'manifest.json'), 'utf8'));

for (const id of targets) {
  const file = path.join(ROOT, 'lessons', id + '.js');
  console.log(`\n=== ${id} ===`);
  if (!fs.existsSync(file)) { err(`lessons/${id}.js 가 없습니다`); continue; }
  const before = Object.keys(C.chapters).length;
  try { vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: id + '.js' }); }
  catch (e) { err(`스크립트 오류: ${e.message}`); continue; }
  const ch = C.chapters[id];
  if (!ch) { err('CS_COURSE.addChapter 가 호출되지 않았습니다'); continue; }
  const order = C.order.find((o) => o.id === id);
  if (!order) err(`course.js 의 order 에 ${id} 가 없습니다`);
  else if (ch.sections.length !== order.hours) err(`교시 수 ${ch.sections.length} ≠ course.js hours ${order.hours}`);
  if (!ch.summary) warn('summary 없음');
  if (!ch.goals || !ch.goals.length) warn('goals 없음');

  const codes = [];   // {label, code, expect, stdin, run, local, lang, nondeterministic}
  ch.sections.forEach((sec, si) => {
    if (sec.id !== `${id}-${si + 1}`) err(`섹션 id '${sec.id}' 는 '${id}-${si + 1}' 이어야 합니다`);
    if (!sec.title) err(`섹션 ${si + 1} 제목 없음`);
    if (sec.flow) { const sum = sec.flow.reduce((a, f) => a + f[1], 0); if (sum !== (sec.minutes || 50)) warn(`${sec.id}: flow 합계 ${sum} ≠ minutes ${sec.minutes || 50}`); }
    if (!sec.slides || sec.slides.length < 6) warn(`${sec.id}: 슬라이드 ${(sec.slides || []).length}장 (8장 이상 권장)`);
    if (!sec.quiz || sec.quiz.length < 3) warn(`${sec.id}: 퀴즈 ${(sec.quiz || []).length}문항 (3개 이상 권장)`);
    if (!sec.practice || !sec.practice.length) warn(`${sec.id}: 실습 없음`);
    (sec.content || []).forEach((b, bi) => {
      if (!KNOWN_BLOCKS.has(b.type)) err(`${sec.id} content[${bi}]: 알 수 없는 type '${b.type}'`);
      if (b.type === 'image' && !manifest.includes(b.src)) err(`${sec.id} content[${bi}]: 이미지 '${b.src}' 가 assets 에 없습니다`);
      if (b.type === 'code') { const code = b.code != null ? b.code : b.cs; if (code == null) err(`${sec.id} content[${bi}]: code 없음`); else codes.push({ label: `${sec.id} 본문 "${b.title || bi}"`, code, expect: b.expect, stdin: b.stdin, run: b.run, local: b.local, lang: b.lang || 'cs', nondeterministic: b.nondeterministic }); }
    });
    (sec.practice || []).forEach((p, pi) => {
      if (!p.title) err(`${sec.id} practice[${pi}] 제목 없음`);
      if (p.starter == null) err(`${sec.id} practice[${pi}] starter 없음`); else codes.push({ label: `${sec.id} 실습 "${p.title}" starter`, code: typeof p.starter === 'string' ? p.starter : p.starter.cs, run: p.run, local: p.local, lang: 'cs', starter: true, stdin: p.stdin });
      if (p.solution == null) warn(`${sec.id} practice[${pi}] solution 없음`); else codes.push({ label: `${sec.id} 실습 "${p.title}" solution`, code: typeof p.solution === 'string' ? p.solution : p.solution.cs, expect: p.expect, stdin: p.stdin, run: p.run, local: p.local, lang: 'cs', nondeterministic: p.nondeterministic });
    });
    (sec.quiz || []).forEach((q, qi) => {
      if (!q.q || !Array.isArray(q.options) || q.options.length < 2) err(`${sec.id} quiz[${qi}] 형식 오류`);
      else if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) err(`${sec.id} quiz[${qi}] answer 범위 오류`);
      if (!q.explain) warn(`${sec.id} quiz[${qi}] explain 없음`);
    });
    (sec.slides || []).forEach((s, k) => {
      if (!KNOWN_LAYOUTS.has(s.layout)) err(`${sec.id} slide[${k}]: 알 수 없는 layout '${s.layout}'`);
      if (!s.notes) warn(`${sec.id} slide[${k}] (${s.layout}): notes 없음`);
      if (s.layout === 'image' && !manifest.includes(s.src)) err(`${sec.id} slide[${k}]: 이미지 '${s.src}' 가 assets 에 없습니다`);
      if (s.layout === 'code') { const code = s.code != null ? s.code : s.cs; if (code == null) err(`${sec.id} slide[${k}]: code 없음`); else { const lines = code.split('\n').length; if (lines > 24 && (s.lang || 'cs') === 'cs') warn(`${sec.id} slide[${k}] "${s.title}": 코드 ${lines}줄 (22줄 이내 권장)`); codes.push({ label: `${sec.id} 슬라이드 "${s.title}"`, code, run: s.run, local: s.local, lang: s.lang || 'cs', stdin: s.stdin, slide: true }); } }
      if (s.layout === 'practice') { if (s.starter == null) err(`${sec.id} slide[${k}] practice starter 없음`); else codes.push({ label: `${sec.id} 슬라이드 실습 "${s.title}" starter`, code: typeof s.starter === 'string' ? s.starter : s.starter.cs, lang: 'cs', starter: true }); if (s.solution != null) codes.push({ label: `${sec.id} 슬라이드 실습 "${s.title}" solution`, code: typeof s.solution === 'string' ? s.solution : s.solution.cs, lang: 'cs', slide: true }); }
      if (s.layout === 'two') for (const side of ['left', 'right']) { const c = s[side]; if (c && c.code && (c.lang || 'cs') === 'cs' && c.run !== false) codes.push({ label: `${sec.id} 슬라이드 "${s.title}" ${side}`, code: c.code, lang: 'cs' }); }
      if (s.layout === 'quiz' && (typeof s.answer !== 'number' || !Array.isArray(s.options))) err(`${sec.id} slide[${k}] quiz 형식 오류`);
    });
  });

  // 코드 실행
  for (const c of codes) {
    if (c.lang !== 'cs') continue;
    if (/\$\{/.test(c.code)) err(`${c.label}: 코드에 '\${' 가 있습니다 (JS 템플릿 문자열 오류 가능)`);
    if (c.local || c.run === false) {
      // 구문만 확인 (WPF 코드는 InitializeComponent 등이 있으므로 파싱만)
      try { globalThis.CsLang.parse(c.code, []); } catch (e) { if (!/InitializeComponent|partial/.test(c.code)) err(`${c.label}: 구문 오류 ${e.line}:${e.col} ${e.message}`); }
      continue;
    }
    ran++;
    const r = await runCs(c.code, { stdin: c.stdin || '', timeoutMs: 15000 });
    if (r.error) { err(`${c.label}: ${r.error.type}: ${r.error.message}${r.error.line ? ` (줄 ${r.error.line})` : ''}`); if (print) console.log(indent(r.out)); continue; }
    if (r.ms > 4000) warn(`${c.label}: 실행 ${(r.ms / 1000).toFixed(1)}초 (3초 이내 권장)`);
    if (r.notes.length) warn(`${c.label}: 실행 노트 — ${r.notes.join(' | ')}`);
    if (c.expect != null && !c.nondeterministic) {
      if (norm(r.out) !== norm(c.expect)) err(`${c.label}: 출력이 expect 와 다릅니다\n    기대: ${JSON.stringify(norm(c.expect))}\n    실제: ${JSON.stringify(norm(r.out))}`);
    } else if (!c.starter && !c.slide && r.out.trim() && !c.nondeterministic && c.expect == null) warn(`${c.label}: expect 없음 (출력 ${r.out.trim().split('\n').length}줄)`);
    if (print) console.log(`  --- ${c.label} (${r.ms}ms, 이미지 ${r.images.length}) ---\n${indent(r.out)}`);
  }
}
function indent(s) { return String(s).replace(/\s+$/, '').split('\n').map((l) => '      ' + l).join('\n'); }
console.log(`\n실행 ${ran}개 · 오류 ${errors} · 경고 ${warnings}`);
process.exit(errors ? 1 : 0);
