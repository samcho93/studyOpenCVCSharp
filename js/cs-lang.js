/* C# 부분집합 어휘 분석기 · 구문 분석기 (브라우저 · 워커 · Node 공용)
 *  - 지원: using, namespace(블록 · 파일 범위), class · struct · enum · interface(무시) · record(class 처럼),
 *          필드 · 속성(자동 · 본문 · 식 본문) · 메서드 · 생성자 · 연산자 오버로드 · 최상위 문(top-level statements)
 *  - 문: 지역 변수(var · 형식 · 배열), if · for · foreach · while · do · switch(상수 · 형식 · 관계 패턴) · break · continue
 *        return · throw · try/catch/finally · using · 지역 함수 · 식 문
 *  - 식: 우선순위 전체, 형변환, is/as, new(객체 · 배열 · 초기화자), 람다, 문자열 보간, ?. ?? ??=, 튜플, switch 식, nameof, typeof, default
 *  결과는 평가기(cs-runtime.js)가 해석하는 단순 AST 이다.
 */
(function (root) {
  'use strict';

  const KEYWORDS = new Set(('abstract as base bool break byte case catch char checked class const continue decimal default delegate do double else enum event explicit ' +
    'extern false finally fixed float for foreach goto if implicit in int interface internal is lock long namespace new null object operator out override params ' +
    'private protected public readonly ref return sbyte sealed short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked ' +
    'unsafe ushort using virtual void volatile while').split(' '));
  // 문맥 키워드: var, dynamic, record, get, set, value, when, where, yield, async, await, nameof, init, required, partial, global
  const PRIMITIVES = new Set('bool byte sbyte char short ushort int uint long ulong float double decimal string object void var dynamic'.split(' '));
  const OPS = ['??=', '<<=', '>>=', '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '::',
    '+', '-', '*', '/', '%', '=', '<', '>', '!', '~', '&', '|', '^', '?', ':', ';', ',', '.', '(', ')', '[', ']', '{', '}'];

  class CsSyntaxError extends Error {
    constructor(message, line, col) { super(message); this.name = 'CsSyntaxError'; this.line = line; this.col = col; }
  }

  // ================================================================== 어휘 분석
  function lex(src) {
    const toks = [];
    let i = 0, line = 1, col = 1;
    const n = src.length;
    const peek = (k = 0) => src[i + k] || '';
    const adv = (k = 1) => { for (let j = 0; j < k; j++) { if (src[i] === '\n') { line++; col = 1; } else col++; i++; } };
    const push = (type, value, extra) => { const t = Object.assign({ type, value, line: tl, col: tc, end: i }, extra || {}); toks.push(t); return t; };
    let tl = 1, tc = 1;
    const err = (m) => { throw new CsSyntaxError(m, line, col); };

    function readEscape() {
      // src[i] === '\\'
      adv();
      const c = peek();
      adv();
      switch (c) {
        case 'n': return '\n'; case 't': return '\t'; case 'r': return '\r'; case '0': return '\0'; case 'a': return '\x07'; case 'b': return '\b'; case 'f': return '\f'; case 'v': return '\v';
        case '\\': return '\\'; case '"': return '"'; case "'": return "'";
        case 'u': { const h = src.substr(i, 4); adv(4); return String.fromCharCode(parseInt(h, 16)); }
        case 'x': { let h = ''; while (/[0-9a-fA-F]/.test(peek()) && h.length < 4) { h += peek(); adv(); } return String.fromCharCode(parseInt(h, 16)); }
        case 'U': { const h = src.substr(i, 8); adv(8); return String.fromCodePoint(parseInt(h, 16)); }
        default: err(`알 수 없는 이스케이프 문자 '\\${c}'`);
      }
      return '';
    }

    /** 보간 문자열: 여는 따옴표 다음 위치에서 시작. 반환 parts: [{text}|{expr, align, format}] */
    function readInterpolated(verbatim) {
      const parts = [];
      let text = '';
      const flush = () => { if (text) { parts.push({ text }); text = ''; } };
      while (i < n) {
        const c = peek();
        if (c === '"') {
          if (verbatim && peek(1) === '"') { text += '"'; adv(2); continue; }
          adv();
          flush();
          return parts;
        }
        if (c === '{') {
          if (peek(1) === '{') { text += '{'; adv(2); continue; }
          adv();
          flush();
          // 식 읽기: 괄호 · 문자열을 고려해 최상위의 ',' ':' '}' 를 찾는다
          let depth = 0, expr = '', align = null, format = null, mode = 'expr';
          const startLine = line, startCol = col;
          while (i < n) {
            const ch = peek();
            if (mode === 'format') {
              if (ch === '}') { if (peek(1) === '}') { format += '}'; adv(2); continue; } adv(); break; }
              if (ch === '{' && peek(1) === '{') { format += '{'; adv(2); continue; }
              format += ch; adv(); continue;
            }
            if (ch === '"' || ch === "'") {          // 식 안의 문자열 · 문자 리터럴 통째로 복사
              const q = ch; expr += ch; adv();
              while (i < n && peek() !== q) { if (peek() === '\\') { expr += peek() + peek(1); adv(2); } else { expr += peek(); adv(); } }
              expr += q; adv(); continue;
            }
            if (ch === '(' || ch === '[' || ch === '{') depth++;
            if (ch === ')' || ch === ']') depth--;
            if (ch === '}') { if (depth === 0) { adv(); break; } depth--; }
            if (depth === 0 && ch === ',' && mode === 'expr') { mode = 'align'; align = ''; adv(); continue; }
            if (depth === 0 && ch === ':' && (mode === 'expr' || mode === 'align')) { mode = 'format'; format = ''; adv(); continue; }
            if (mode === 'align') { align += ch; adv(); continue; }
            expr += ch; adv();
          }
          if (!expr.trim()) throw new CsSyntaxError('보간 식 {} 안이 비어 있습니다', startLine, startCol);
          parts.push({ expr: expr.trim(), align: align != null ? parseInt(align.trim(), 10) : null, format: format != null ? format : null, line: startLine, col: startCol });
          continue;
        }
        if (c === '}' && peek(1) === '}') { text += '}'; adv(2); continue; }
        if (!verbatim && c === '\\') { text += readEscape(); continue; }
        if (c === '\n' && !verbatim) err('문자열이 닫히지 않았습니다');
        text += c; adv();
      }
      err('보간 문자열이 닫히지 않았습니다');
      return parts;
    }

    while (i < n) {
      const c = peek();
      tl = line; tc = col;
      if (c === ' ' || c === '\t' || c === '\r' || c === '\n' || c === '﻿') { adv(); continue; }
      if (c === '/' && peek(1) === '/') { while (i < n && peek() !== '\n') adv(); continue; }
      if (c === '/' && peek(1) === '*') { adv(2); while (i < n && !(peek() === '*' && peek(1) === '/')) adv(); adv(2); continue; }
      if (c === '#' && (col === 1 || /^\s*$/.test(src.slice(src.lastIndexOf('\n', i - 1) + 1, i)))) { while (i < n && peek() !== '\n') adv(); continue; } // 전처리기 지시문 무시
      // 식별자 · 키워드
      if (/[A-Za-z_@À-￿]/.test(c)) {
        let verbatimId = false;
        if (c === '@') {
          if (peek(1) === '"') { adv(); const s = readVerbatim(); push('str', s); continue; }
          if (peek(1) === '$' && peek(2) === '"') { adv(3); push('istr', null, { parts: readInterpolated(true) }); continue; }
          verbatimId = true; adv();
        }
        let s = '';
        while (i < n && /[A-Za-z0-9_À-￿]/.test(peek())) { s += peek(); adv(); }
        if (!verbatimId && KEYWORDS.has(s)) push('kw', s);
        else push('id', s);
        continue;
      }
      if (c === '$' && peek(1) === '"') { adv(2); push('istr', null, { parts: readInterpolated(false) }); continue; }
      if (c === '$' && peek(1) === '@' && peek(2) === '"') { adv(3); push('istr', null, { parts: readInterpolated(true) }); continue; }
      // 숫자
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(peek(1)))) {
        let s = '';
        let ntype = 'int';
        if (c === '0' && /[xX]/.test(peek(1))) {
          adv(2);
          while (/[0-9a-fA-F_]/.test(peek())) { if (peek() !== '_') s += peek(); adv(); }
          let v = parseInt(s, 16);
          const suf = readNumSuffix();
          if (suf === 'L' || suf === 'UL' || v > 0x7fffffff) ntype = 'long'; if (suf === 'U') ntype = 'uint';
          push('num', v, { ntype });
          continue;
        }
        if (c === '0' && /[bB]/.test(peek(1))) {
          adv(2);
          while (/[01_]/.test(peek())) { if (peek() !== '_') s += peek(); adv(); }
          push('num', parseInt(s, 2), { ntype: readNumSuffix() === 'L' ? 'long' : 'int' });
          continue;
        }
        let isReal = false;
        while (/[0-9_]/.test(peek())) { if (peek() !== '_') s += peek(); adv(); }
        if (peek() === '.' && /[0-9]/.test(peek(1))) { isReal = true; s += '.'; adv(); while (/[0-9_]/.test(peek())) { if (peek() !== '_') s += peek(); adv(); } }
        if (/[eE]/.test(peek()) && /[0-9+\-]/.test(peek(1))) { isReal = true; s += 'e'; adv(); if (/[+\-]/.test(peek())) { s += peek(); adv(); } while (/[0-9]/.test(peek())) { s += peek(); adv(); } }
        const suf = readNumSuffix();
        if (suf === 'F') ntype = 'float'; else if (suf === 'D') ntype = 'double'; else if (suf === 'M') ntype = 'decimal';
        else if (suf === 'L' || suf === 'UL' || suf === 'LU') ntype = 'long'; else if (suf === 'U') ntype = 'uint';
        else if (isReal) ntype = 'double';
        let v = isReal || ntype === 'float' || ntype === 'double' || ntype === 'decimal' ? parseFloat(s) : parseInt(s, 10);
        if (ntype === 'int' && v > 0x7fffffff) ntype = v > 0xffffffff ? 'long' : 'uint';
        if (ntype === 'float') v = Math.fround(v);
        push('num', v, { ntype });
        continue;
      }
      // 문자열 · 문자
      if (c === '"') {
        adv();
        let s = '';
        while (i < n && peek() !== '"') {
          if (peek() === '\\') s += readEscape();
          else if (peek() === '\n') err('문자열이 닫히지 않았습니다 (줄 끝)');
          else { s += peek(); adv(); }
        }
        if (i >= n) err('문자열이 닫히지 않았습니다');
        adv();
        push('str', s);
        continue;
      }
      if (c === "'") {
        adv();
        let s = '';
        if (peek() === '\\') s = readEscape(); else { s = peek(); adv(); if (s.charCodeAt(0) >= 0xd800 && s.charCodeAt(0) <= 0xdbff) { s += peek(); adv(); } }
        if (peek() !== "'") err("문자 리터럴은 한 글자여야 합니다 (예: 'a'). 문자열은 큰따옴표 \"...\" 를 쓰세요");
        adv();
        push('char', s);
        continue;
      }
      // 연산자
      let matched = null;
      for (const op of OPS) { if (src.startsWith(op, i)) { matched = op; break; } }
      if (!matched) err(`알 수 없는 문자 '${c}'`);
      adv(matched.length);
      push('op', matched);
    }
    tl = line; tc = col;
    push('eof', null);
    return toks;

    function readNumSuffix() {
      let s = '';
      while (/[fFdDmMlLuU]/.test(peek())) { s += peek().toUpperCase(); adv(); }
      return s;
    }
    function readVerbatim() {
      adv(); // "
      let s = '';
      while (i < n) {
        if (peek() === '"') { if (peek(1) === '"') { s += '"'; adv(2); continue; } adv(); return s; }
        s += peek(); adv();
      }
      err('@"..." 문자열이 닫히지 않았습니다');
      return s;
    }
  }

  // ================================================================== 구문 분석
  const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '??=']);
  const BIN_PREC = {
    '??': 1, '||': 2, '&&': 3, '|': 4, '^': 5, '&': 6, '==': 7, '!=': 7,
    '<': 8, '>': 8, '<=': 8, '>=': 8, 'is': 8, 'as': 8, '<<': 9, '>>': 9, '+': 10, '-': 10, '*': 11, '/': 11, '%': 11
  };

  class Parser {
    constructor(tokens, knownTypes) {
      this.toks = tokens;
      this.p = 0;
      this.known = new Set(knownTypes || []);
      this.userTypes = new Set();
      // 사용자 형식 이름 미리 수집 (형변환 · 선언 판별에 사용)
      for (let k = 0; k < tokens.length - 1; k++) {
        const t = tokens[k];
        if (t.type === 'kw' && (t.value === 'class' || t.value === 'struct' || t.value === 'enum' || t.value === 'interface') && tokens[k + 1].type === 'id') this.userTypes.add(tokens[k + 1].value);
        if (t.type === 'id' && t.value === 'record' && tokens[k + 1].type === 'id') this.userTypes.add(tokens[k + 1].value);
      }
    }

    // ---------------------------------------------------------------- 도우미
    get cur() { return this.toks[this.p]; }
    at(k = 0) { return this.toks[this.p + k] || this.toks[this.toks.length - 1]; }
    is(type, value) { const t = this.cur; return t.type === type && (value === undefined || t.value === value); }
    isOp(v) { return this.is('op', v); }
    isKw(v) { return this.is('kw', v); }
    isId(v) { return this.is('id', v); }
    next() { return this.toks[this.p++]; }
    error(msg, tok) { tok = tok || this.cur; throw new CsSyntaxError(msg, tok.line, tok.col); }
    expectOp(v) { if (!this.isOp(v)) this.error(`'${v}' 가 필요합니다${this.describe()}`); return this.next(); }
    expectKw(v) { if (!this.isKw(v)) this.error(`'${v}' 가 필요합니다${this.describe()}`); return this.next(); }
    expectId(what) { if (!this.is('id')) this.error(`${what || '이름'}이(가) 필요합니다${this.describe()}`); return this.next().value; }
    describe() { const t = this.cur; if (t.type === 'eof') return ' (코드가 끝났습니다)'; return ` — 여기에 '${t.type === 'str' ? '"…"' : t.type === 'istr' ? '$"…"' : t.value}' 가 있습니다`; }
    accept(type, value) { if (this.is(type, value)) { return this.next(); } return null; }
    acceptOp(v) { return this.accept('op', v); }
    acceptKw(v) { return this.accept('kw', v); }
    acceptId(v) { return this.accept('id', v); }
    mark() { return this.p; }
    reset(m) { this.p = m; }
    loc(node, tok) { node.line = tok.line; node.col = tok.col; return node; }

    // ---------------------------------------------------------------- 최상위
    parseProgram() {
      const prog = { usings: [], types: [], topLevel: [], globalStatic: [] };
      while (!this.is('eof')) {
        if (this.isKw('using') && !this.looksLikeUsingStatement()) { this.parseUsingDirective(prog); continue; }
        if (this.isKw('namespace')) {
          this.next();
          this.parseQualifiedName();
          if (this.acceptOp(';')) continue;          // 파일 범위 네임스페이스
          this.expectOp('{');
          while (!this.isOp('}') && !this.is('eof')) {
            if (this.isKw('using')) { this.parseUsingDirective(prog); continue; }
            prog.types.push(this.parseTypeDecl());
          }
          this.expectOp('}');
          continue;
        }
        if (this.isOp('[')) { this.skipAttributes(); continue; }
        if (this.startsTypeDecl()) { prog.types.push(this.parseTypeDecl()); continue; }
        prog.topLevel.push(this.parseStatement());
      }
      return prog;
    }

    looksLikeUsingStatement() {
      // using (…) / using var x = … / using Type x = …  → 문.  using System; / using static … / using X = … → 지시문
      const t1 = this.at(1);
      if (t1.type === 'op' && t1.value === '(') return true;
      if (t1.type === 'id' && t1.value === 'var') return true;
      if (t1.type === 'kw' && t1.value === 'static') return false;
      // Type ident = 형태인지 (지시문은 Name.Name;  또는 X = Name;)
      const m = this.mark();
      this.next();
      let ok = false;
      try { const ty = this.tryParseType(); ok = !!ty && this.is('id') && (this.at(1).type === 'op' && (this.at(1).value === '=' || this.at(1).value === ';')) && !(this.at(1).value === '=' && ty.args.length === 0 && ty.rank.length === 0 && ty.name.indexOf('.') < 0 && this.at(3) && this.at(3).type === 'op' && this.at(3).value === ';' && this.at(2).type === 'id'); } catch (e) { ok = false; }
      this.reset(m);
      return ok;
    }

    parseUsingDirective(prog) {
      this.expectKw('using');
      const isStatic = !!this.acceptKw('static');
      this.acceptId('global');
      let name = this.parseQualifiedName();
      let alias = null;
      if (this.acceptOp('=')) { alias = name; name = this.parseTypeRef().str; }
      this.expectOp(';');
      prog.usings.push({ name, alias, isStatic });
    }

    parseQualifiedName() {
      let s = this.expectId('네임스페이스 이름');
      while (this.isOp('.') && this.at(1).type === 'id') { this.next(); s += '.' + this.next().value; }
      // 제네릭 using static (예: using static System.Math;) 는 없음
      return s;
    }

    skipAttributes() {
      while (this.isOp('[')) {
        let depth = 0;
        do { if (this.isOp('[')) depth++; if (this.isOp(']')) depth--; this.next(); } while (depth > 0 && !this.is('eof'));
      }
    }

    startsTypeDecl() {
      let k = 0;
      while (true) {
        const t = this.at(k);
        if (t.type === 'kw' && /^(public|private|protected|internal|static|abstract|sealed|partial|readonly|unsafe)$/.test(t.value)) { k++; continue; }
        if (t.type === 'id' && (t.value === 'partial' || t.value === 'record')) { if (t.value === 'record') return true; k++; continue; }
        return t.type === 'kw' && /^(class|struct|enum|interface|delegate)$/.test(t.value);
      }
    }

    parseModifiers() {
      const mods = new Set();
      while (true) {
        const t = this.cur;
        if (t.type === 'kw' && /^(public|private|protected|internal|static|abstract|sealed|virtual|override|readonly|const|new|extern|volatile|unsafe|event)$/.test(t.value)) { mods.add(t.value); this.next(); continue; }
        if (t.type === 'id' && /^(partial|async|required|init)$/.test(t.value) && this.at(1).type !== 'op') { mods.add(t.value); this.next(); continue; }
        break;
      }
      return mods;
    }

    parseTypeDecl() {
      const start = this.cur;
      this.skipAttributes();
      const mods = this.parseModifiers();
      let kind;
      if (this.acceptId('record')) { kind = 'class'; this.acceptKw('class'); this.acceptKw('struct'); }
      else if (this.isKw('delegate')) { // delegate 선언: 무시 (형식 이름만 등록)
        this.next(); this.parseTypeRef(); const dn = this.expectId(); this.userTypes.add(dn); this.parseParamList(); this.expectOp(';');
        return this.loc({ kind: 'delegate', name: dn, members: [] }, start);
      } else { kind = this.next().value; }
      const name = this.expectId('형식 이름');
      const decl = this.loc({ kind, name, base: [], members: [], isStatic: mods.has('static'), typeParams: [] }, start);
      if (this.acceptOp('<')) { do { decl.typeParams.push(this.expectId()); } while (this.acceptOp(',')); this.expectOp('>'); }
      if (kind === 'class' && this.isOp('(')) {  // record 기본 생성자
        const params = this.parseParamList();
        decl.recordParams = params;
      }
      if (this.acceptOp(':')) {
        do { decl.base.push(this.parseTypeRef()); } while (this.acceptOp(','));
      }
      while (this.isId('where')) { while (!this.isOp('{') && !this.is('eof')) this.next(); }
      if (kind === 'enum') {
        this.expectOp('{');
        let v = 0;
        while (!this.isOp('}')) {
          this.skipAttributes();
          const mn = this.expectId('열거형 멤버 이름');
          let init = null;
          if (this.acceptOp('=')) init = this.parseExpression();
          decl.members.push({ kind: 'enumMember', name: mn, init, autoValue: v });
          v++;
          if (!this.acceptOp(',')) break;
        }
        this.expectOp('}');
        this.acceptOp(';');
        return decl;
      }
      if (this.acceptOp(';')) return decl;   // record X(…);
      this.expectOp('{');
      while (!this.isOp('}') && !this.is('eof')) {
        if (kind === 'interface') { this.skipMember(); continue; }
        const m = this.parseMember(decl);
        if (m) decl.members.push(m);
      }
      this.expectOp('}');
      this.acceptOp(';');
      return decl;
    }

    skipMember() {
      // 인터페이스 멤버: ; 또는 { … } 까지 건너뛴다
      let depth = 0;
      while (!this.is('eof')) {
        if (this.isOp('{')) depth++;
        if (this.isOp('}')) { depth--; if (depth === 0) { this.next(); return; } }
        if (this.isOp(';') && depth === 0) { this.next(); return; }
        this.next();
      }
    }

    parseMember(decl) {
      const start = this.cur;
      this.skipAttributes();
      const mods = this.parseModifiers();
      const isStatic = mods.has('static') || decl.isStatic;
      // 중첩 형식
      if (this.startsTypeDecl() || this.isKw('class') || this.isKw('struct') || this.isKw('enum') || this.isKw('interface')) {
        const nested = this.parseTypeDecl();
        return { kind: 'nested', decl: nested };
      }
      // 생성자: Name (
      if (this.is('id', decl.name) && this.at(1).type === 'op' && this.at(1).value === '(') {
        this.next();
        const params = this.parseParamList();
        let init = null;
        if (this.acceptOp(':')) {
          const k = this.next(); // base | this
          init = { kind: k.value, args: this.parseArgList() };
        }
        const mb = this.parseMethodBody();
        const body = mb.body || { kind: 'Block', body: mb.exprBody ? [{ kind: 'ExprStmt', expr: mb.exprBody }] : [] };
        return this.loc({ kind: 'ctor', params, init, body, isStatic }, start);
      }
      // 소멸자 ~Name() { }
      if (this.isOp('~')) { this.next(); this.expectId(); this.parseParamList(); this.parseBlock(); return null; }
      // 변환 연산자
      if ((this.isKw('implicit') || this.isKw('explicit')) && this.at(1).type === 'kw' && this.at(1).value === 'operator') {
        const kind = this.next().value; this.next();
        const type = this.parseTypeRef();
        const params = this.parseParamList();
        const body = this.parseMethodBody();
        return this.loc({ kind: 'conversion', conv: kind, retType: type, params, body: body.body, exprBody: body.exprBody }, start);
      }
      const type = this.parseTypeRef();
      // 연산자 오버로드
      if (this.isKw('operator')) {
        this.next();
        const opTok = this.next();
        let op = opTok.value;
        if (op === 'true' || op === 'false') op = String(op);
        const params = this.parseParamList();
        const body = this.parseMethodBody();
        return this.loc({ kind: 'operator', op, retType: type, params, body: body.body, exprBody: body.exprBody, isStatic: true }, start);
      }
      // 인덱서 this[…]
      if (this.isKw('this')) {
        this.next();
        this.expectOp('[');
        const params = [];
        while (!this.isOp(']')) { const pt = this.parseTypeRef(); const pn = this.expectId(); params.push({ name: pn, type: pt }); if (!this.acceptOp(',')) break; }
        this.expectOp(']');
        const acc = this.parseAccessors();
        return this.loc({ kind: 'indexer', type, params, get: acc.get, set: acc.set, exprBody: acc.exprBody }, start);
      }
      let name = this.expectId('멤버 이름');
      // 명시적 인터페이스 구현 IFoo.Bar → Bar
      while (this.isOp('.')) { this.next(); name = this.expectId(); }
      // 제네릭 메서드
      let typeParams = [];
      if (this.isOp('<')) { this.next(); do { typeParams.push(this.expectId()); } while (this.acceptOp(',')); this.expectOp('>'); }
      if (this.isOp('(')) {
        const params = this.parseParamList();
        while (this.isId('where')) { while (!this.isOp('{') && !this.isOp('=>') && !this.isOp(';') && !this.is('eof')) this.next(); }
        const body = this.parseMethodBody();
        return this.loc({ kind: 'method', name, retType: type, params, body: body.body, exprBody: body.exprBody, isStatic, typeParams, mods: [...mods] }, start);
      }
      if (this.isOp('{') || this.isOp('=>')) {
        const acc = this.parseAccessors();
        let init = null;
        if (this.acceptOp('=')) { init = this.parseExpression(); this.expectOp(';'); }
        return this.loc({ kind: 'property', name, type, get: acc.get, set: acc.set, exprBody: acc.exprBody, autoGet: acc.autoGet, autoSet: acc.autoSet, init, isStatic }, start);
      }
      // 필드 (여러 개 선언 가능)
      const decls = [];
      let fname = name;
      while (true) {
        let init = null;
        if (this.acceptOp('=')) init = this.parseVarInit(type);
        decls.push({ name: fname, init });
        if (!this.acceptOp(',')) break;
        fname = this.expectId('필드 이름');
      }
      this.expectOp(';');
      return this.loc({ kind: 'field', type, decls, isStatic: isStatic || mods.has('const'), isConst: mods.has('const'), isReadonly: mods.has('readonly') }, start);
    }

    parseAccessors() {
      const acc = { get: null, set: null, autoGet: false, autoSet: false, exprBody: null };
      if (this.isOp('=>')) { this.next(); acc.exprBody = this.parseExpression(); this.expectOp(';'); return acc; }
      this.expectOp('{');
      while (!this.isOp('}')) {
        this.skipAttributes();
        this.parseModifiers();
        const which = this.next();
        if (!(which.type === 'id' && (which.value === 'get' || which.value === 'set' || which.value === 'init'))) this.error('get 또는 set 이 필요합니다', which);
        const key = which.value === 'get' ? 'get' : 'set';
        if (this.acceptOp(';')) { acc[key === 'get' ? 'autoGet' : 'autoSet'] = true; continue; }
        if (this.acceptOp('=>')) { const e = this.parseExpression(); this.expectOp(';'); acc[key] = { kind: 'Block', body: [key === 'get' ? { kind: 'Return', expr: e } : { kind: 'ExprStmt', expr: e }] }; continue; }
        acc[key] = this.parseBlock();
      }
      this.expectOp('}');
      return acc;
    }

    parseMethodBody() {
      if (this.acceptOp(';')) return { body: null, exprBody: null };  // abstract/extern
      if (this.acceptOp('=>')) { const e = this.parseExpression(); this.expectOp(';'); return { body: null, exprBody: e }; }
      return { body: this.parseBlock(), exprBody: null };
    }

    parseParamList() {
      this.expectOp('(');
      const params = [];
      while (!this.isOp(')')) {
        this.skipAttributes();
        let mod = null;
        if (this.isKw('out') || this.isKw('ref') || this.isKw('params') || this.isKw('in')) mod = this.next().value;
        else if (this.isId('scoped')) this.next();
        if (this.isKw('this')) this.next();  // 확장 메서드 this 한정자
        const type = this.parseTypeRef();
        const name = this.expectId('매개 변수 이름');
        let def = null;
        if (this.acceptOp('=')) def = this.parseExpression();
        params.push({ name, type, mod, def });
        if (!this.acceptOp(',')) break;
      }
      this.expectOp(')');
      return params;
    }

    // ---------------------------------------------------------------- 형식
    /** 형식 참조: {name, args, rank:[dims…], nullable, str} */
    parseTypeRef() {
      const t = this.tryParseType();
      if (!t) this.error(`형식 이름이 필요합니다${this.describe()}`);
      return t;
    }

    /** 실패하면 null (위치 복원) */
    tryParseType() {
      const m = this.mark();
      const t0 = this.cur;
      let name;
      if (t0.type === 'kw' && PRIMITIVES.has(t0.value)) { name = t0.value; this.next(); }
      else if (t0.type === 'id') {
        name = t0.value; this.next();
        while (this.isOp('.') && this.at(1).type === 'id') { this.next(); name += '.' + this.next().value; }
        if (this.isOp('::')) { this.next(); name = this.expectId(); }
      } else if (this.isOp('(')) {
        // 튜플 형식 (int a, string b)
        this.next();
        const items = [], names = [];
        while (!this.isOp(')')) { const it = this.tryParseType(); if (!it) { this.reset(m); return null; } names.push(this.is('id') ? this.next().value : null); items.push(it); if (!this.acceptOp(',')) break; }
        if (!this.acceptOp(')') || items.length < 2) { this.reset(m); return null; }
        const tt = { name: 'Tuple', args: items, rank: [], nullable: false, tupleNames: names };
        this.finishType(tt);
        return tt;
      } else return null;
      const type = { name, args: [], rank: [], nullable: false };
      if (this.isOp('<')) {
        const m2 = this.mark();
        this.next();
        let ok = true;
        while (true) {
          if (this.isOp(',')) { type.args.push({ name: '?', args: [], rank: [], nullable: false, str: '?' }); this.next(); continue; } // List<> 형태
          if (this.isOp('>')) break;
          const a = this.tryParseType();
          if (!a) { ok = false; break; }
          type.args.push(a);
          if (this.acceptOp(',')) continue;
          break;
        }
        if (ok && this.isOp('>')) this.next();
        else if (ok && this.isOp('>>')) { // List<List<int>> 의 >> 처리: 토큰을 하나 소비하고 '>' 하나를 남긴다
          this.cur.value = '>'; this.cur.type = 'op'; // 두 번째 > 는 바깥 형식이 소비
          ok = true; type.__closedByShift = true;
        }
        else ok = false;
        if (!ok) { this.reset(m2); }
      }
      this.finishType(type);
      return type;
    }

    finishType(type) {
      if (this.isOp('?') && !(this.at(1).type === 'op' && (this.at(1).value === '.' || this.at(1).value === '['))) {
        // int? x  — 조건식 a ? b : c 와 구분: 뒤에 식별자 · ')' · ',' · '>' · '[' 가 오면 nullable
        const nx = this.at(1);
        if (nx.type === 'id' || (nx.type === 'op' && [')', ',', '>', '[', '('].includes(nx.value))) { this.next(); type.nullable = true; }
      }
      while (this.isOp('[')) {
        // 배열 차원: [] [,] [,,]  — 인덱스 식이면 중단
        const nx = this.at(1);
        if (nx.type === 'op' && (nx.value === ']' || nx.value === ',')) {
          this.next();
          let dims = 1;
          while (this.acceptOp(',')) dims++;
          this.expectOp(']');
          type.rank.push(dims);
        } else break;
      }
      type.str = typeToString(type);
    }

    // ---------------------------------------------------------------- 문
    parseBlock() {
      const start = this.expectOp('{');
      const body = [];
      while (!this.isOp('}')) {
        if (this.is('eof')) this.error("'}' 가 필요합니다 (블록이 닫히지 않았습니다)", start);
        body.push(this.parseStatement());
      }
      this.expectOp('}');
      return this.loc({ kind: 'Block', body }, start);
    }

    parseStatement() {
      const t = this.cur;
      if (this.isOp('{')) return this.parseBlock();
      if (this.isOp(';')) { this.next(); return this.loc({ kind: 'Empty' }, t); }
      if (t.type === 'kw') {
        switch (t.value) {
          case 'if': return this.parseIf();
          case 'for': return this.parseFor();
          case 'foreach': return this.parseForeach();
          case 'while': { this.next(); this.expectOp('('); const cond = this.parseExpression(); this.expectOp(')'); const body = this.parseStatement(); return this.loc({ kind: 'While', cond, body }, t); }
          case 'do': { this.next(); const body = this.parseStatement(); this.expectKw('while'); this.expectOp('('); const cond = this.parseExpression(); this.expectOp(')'); this.expectOp(';'); return this.loc({ kind: 'DoWhile', cond, body }, t); }
          case 'switch': return this.parseSwitch();
          case 'break': this.next(); this.expectOp(';'); return this.loc({ kind: 'Break' }, t);
          case 'continue': this.next(); this.expectOp(';'); return this.loc({ kind: 'Continue' }, t);
          case 'return': { this.next(); let expr = null; if (!this.isOp(';')) expr = this.parseExpression(); this.expectOp(';'); return this.loc({ kind: 'Return', expr }, t); }
          case 'throw': { this.next(); let expr = null; if (!this.isOp(';')) expr = this.parseExpression(); this.expectOp(';'); return this.loc({ kind: 'Throw', expr }, t); }
          case 'try': return this.parseTry();
          case 'using': return this.parseUsingStatement();
          case 'lock': { this.next(); this.expectOp('('); this.parseExpression(); this.expectOp(')'); return this.parseStatement(); }
          case 'checked': case 'unchecked': { this.next(); if (this.isOp('{')) return this.parseBlock(); break; }
          case 'const': { this.next(); const type = this.parseTypeRef(); const st = this.parseLocalDeclRest(type, t); st.isConst = true; return st; }
          case 'goto': this.error('goto 는 지원하지 않습니다');
          case 'unsafe': case 'fixed': this.error(`${t.value} 코드는 브라우저 실습 환경에서 지원하지 않습니다`);
          default: break;
        }
      }
      if (t.type === 'id' && t.value === 'yield') this.error('yield 는 지원하지 않습니다. List 에 담아 반환하세요');
      // 지역 함수 · 지역 변수 · 식 문
      if ((this.isKw('static') || this.isId('async')) && !(this.at(1).type === 'op' && this.at(1).value === ';')) this.next();
      const decl = this.tryParseLocalDecl();
      if (decl) return decl;
      const expr = this.parseExpression();
      if (this.isOp(':') && expr.kind === 'Name') this.error('레이블(goto)은 지원하지 않습니다');
      this.expectOp(';');
      return this.loc({ kind: 'ExprStmt', expr }, t);
    }

    /** 지역 변수 선언 또는 지역 함수. 아니면 null */
    tryParseLocalDecl() {
      const m = this.mark();
      const start = this.cur;
      if (this.isOp('(')) {
        // 튜플 형식 지역 변수: (int a, string b) t = …   /  분해 선언 (int a, int b) = … 는 var (a, b) 로 안내
        const type = this.tryParseType();
        if (type && type.name === 'Tuple' && this.is('id') && this.at(1).type === 'op' && (this.at(1).value === '=' || this.at(1).value === ';')) return this.parseLocalDeclRest(type, start);
        if (type && type.name === 'Tuple' && this.is('id') && this.at(1).type === 'op' && this.at(1).value === '(') {
          const name = this.next().value;
          const params = this.parseParamList();
          const body = this.parseMethodBody();
          return this.loc({ kind: 'LocalFunc', name, retType: type, params, body: body.body, exprBody: body.exprBody }, start);
        }
        if (type && type.name === 'Tuple' && this.isOp('=') && type.tupleNames.some((n) => n)) { this.error('튜플 분해 선언에서는 var (a, b) = … 형태를 쓰세요'); }
        this.reset(m);
        return null;
      }
      if (this.isId('var') && this.at(1).type === 'op' && this.at(1).value === '(') {
        this.next(); this.next();
        const names = [];
        while (!this.isOp(')')) { if (this.isId('var')) this.next(); names.push(this.expectId()); if (!this.acceptOp(',')) break; }
        this.expectOp(')');
        this.expectOp('=');
        const init = this.parseExpression();
        this.expectOp(';');
        return this.loc({ kind: 'Deconstruct', names, init }, start);
      }
      const type = this.tryParseType();
      if (!type || !this.is('id')) { this.reset(m); return null; }
      const nameTok = this.at(0);
      const after = this.at(1);
      // 지역 함수: Type Name(  또는 Type Name<T>(
      if (after.type === 'op' && (after.value === '(' || after.value === '<') && type.name !== 'var') {
        // 호출 식(예: Foo(x)) 과 구분: 형식 뒤에 식별자가 오면 선언이다. Type Name( → 지역 함수
        if (after.value === '(') {
          const name = this.next().value;
          const params = this.parseParamList();
          const body = this.parseMethodBody();
          return this.loc({ kind: 'LocalFunc', name, retType: type, params, body: body.body, exprBody: body.exprBody }, start);
        }
        this.reset(m); return null;
      }
      if (!(after.type === 'op' && (after.value === '=' || after.value === ';' || after.value === ','))) { this.reset(m); return null; }
      return this.parseLocalDeclRest(type, start);
    }

    parseLocalDeclRest(type, start) {
      const decls = [];
      while (true) {
        const name = this.expectId('변수 이름');
        let init = null;
        if (this.acceptOp('=')) init = this.parseVarInit(type);
        decls.push({ name, init });
        if (!this.acceptOp(',')) break;
      }
      this.expectOp(';');
      return this.loc({ kind: 'LocalDecl', type, decls }, start);
    }

    /** 초기화 식: 배열 초기화자 { 1, 2, 3 } 허용 */
    parseVarInit(type) {
      if (this.isOp('{')) {
        const start = this.cur;
        const init = this.parseArrayInitializer();
        return this.loc({ kind: 'NewArray', elemType: elemTypeOf(type), sizes: [], init, rank: type.rank.length ? type.rank[0] : 1 }, start);
      }
      return this.parseExpression();
    }

    parseArrayInitializer() {
      this.expectOp('{');
      const items = [];
      while (!this.isOp('}')) {
        if (this.isOp('{')) items.push({ kind: 'ArrayInit', items: this.parseArrayInitializer() });
        else items.push(this.parseExpression());
        if (!this.acceptOp(',')) break;
      }
      this.expectOp('}');
      return items;
    }

    parseIf() {
      const t = this.expectKw('if');
      this.expectOp('(');
      const cond = this.parseExpression();
      this.expectOp(')');
      const then = this.parseStatement();
      let els = null;
      if (this.acceptKw('else')) els = this.parseStatement();
      return this.loc({ kind: 'If', cond, then, else: els }, t);
    }

    parseFor() {
      const t = this.expectKw('for');
      this.expectOp('(');
      const init = [];
      if (!this.isOp(';')) {
        const d = this.tryParseLocalDeclNoSemi();
        if (d) init.push(d);
        else { do { init.push({ kind: 'ExprStmt', expr: this.parseExpression() }); } while (this.acceptOp(',')); }
      }
      this.expectOp(';');
      let cond = null;
      if (!this.isOp(';')) cond = this.parseExpression();
      this.expectOp(';');
      const update = [];
      if (!this.isOp(')')) { do { update.push(this.parseExpression()); } while (this.acceptOp(',')); }
      this.expectOp(')');
      const body = this.parseStatement();
      return this.loc({ kind: 'For', init, cond, update, body }, t);
    }

    tryParseLocalDeclNoSemi() {
      const m = this.mark();
      const start = this.cur;
      const type = this.tryParseType();
      if (!type || !this.is('id') || !(this.at(1).type === 'op' && (this.at(1).value === '=' || this.at(1).value === ',' || this.at(1).value === ';'))) { this.reset(m); return null; }
      const decls = [];
      while (true) {
        const name = this.expectId();
        let init = null;
        if (this.acceptOp('=')) init = this.parseVarInit(type);
        decls.push({ name, init });
        if (!this.acceptOp(',')) break;
      }
      return this.loc({ kind: 'LocalDecl', type, decls }, start);
    }

    parseForeach() {
      const t = this.expectKw('foreach');
      this.expectOp('(');
      let type = null, name = null, names = null;
      if (this.isId('var') && this.at(1).type === 'op' && this.at(1).value === '(') {
        this.next(); this.next(); names = [];
        while (!this.isOp(')')) { names.push(this.expectId()); if (!this.acceptOp(',')) break; }
        this.expectOp(')');
      } else if (this.isOp('(')) {
        this.next(); names = [];
        while (!this.isOp(')')) { this.parseTypeRef(); names.push(this.expectId()); if (!this.acceptOp(',')) break; }
        this.expectOp(')');
      } else {
        type = this.parseTypeRef();
        name = this.expectId('반복 변수 이름');
      }
      this.expectKw('in');
      const expr = this.parseExpression();
      this.expectOp(')');
      const body = this.parseStatement();
      return this.loc({ kind: 'Foreach', type, name, names, expr, body }, t);
    }

    parseSwitch() {
      const t = this.expectKw('switch');
      this.expectOp('(');
      const expr = this.parseExpression();
      this.expectOp(')');
      this.expectOp('{');
      const cases = [];
      while (!this.isOp('}')) {
        const labels = [];
        while (this.isKw('case') || this.isKw('default')) {
          if (this.acceptKw('default')) { labels.push({ kind: 'default' }); this.expectOp(':'); continue; }
          this.next();
          labels.push(this.parsePattern());
          if (this.acceptKw('when')) labels[labels.length - 1].when = this.parseExpression();
          else if (this.isId('when')) { this.next(); labels[labels.length - 1].when = this.parseExpression(); }
          this.expectOp(':');
        }
        if (!labels.length) this.error("'case' 또는 'default' 가 필요합니다");
        const body = [];
        while (!this.isKw('case') && !this.isKw('default') && !this.isOp('}')) body.push(this.parseStatement());
        cases.push({ labels, body });
      }
      this.expectOp('}');
      return this.loc({ kind: 'Switch', expr, cases }, t);
    }

    /** 패턴: 상수 · 형식 [이름] · 관계(< 5) · var 이름 · _ · not 상수 */
    parsePattern() {
      const t = this.cur;
      if (this.isId('_')) { this.next(); return this.loc({ kind: 'discard' }, t); }
      if (this.isId('var')) { this.next(); const name = this.expectId(); return this.loc({ kind: 'var', name }, t); }
      if (this.isId('not')) { this.next(); const p = this.parsePattern(); return this.loc({ kind: 'not', pattern: p }, t); }
      if (this.isOp('<') || this.isOp('>') || this.isOp('<=') || this.isOp('>=')) { const op = this.next().value; const expr = this.parseUnaryForPattern(); return this.combinePattern(this.loc({ kind: 'rel', op, expr }, t)); }
      // 형식 패턴: Type name  (형식 이름 뒤에 식별자)
      const m = this.mark();
      const type = this.tryParseType();
      if (type && this.is('id') && !this.isId('and') && !this.isId('or') && !this.isId('when')) { const name = this.next().value; return this.combinePattern(this.loc({ kind: 'type', type, name }, t)); }
      if (type && (this.isOp(':') || this.isId('when') || this.isId('and') || this.isId('or')) && type.args.length === 0 && type.rank.length === 0 && /^[A-Z]/.test(type.name) && !type.name.includes('.') && (this.userTypes.has(type.name) || this.known.has(type.name))) {
        return this.combinePattern(this.loc({ kind: 'type', type, name: null }, t));
      }
      this.reset(m);
      const expr = this.parseUnaryForPattern();
      return this.combinePattern(this.loc({ kind: 'const', expr }, t));
    }
    parseUnaryForPattern() {
      // 관계 · 상수 패턴의 피연산자: 단항식 수준 (and/or 결합은 combinePattern 이 처리)
      return this.parseBinary(9);
    }
    combinePattern(p) {
      while (this.isId('and') || this.isId('or')) {
        const op = this.next().value;
        const r = this.parsePattern();
        p = { kind: op, l: p, r, line: p.line, col: p.col };
      }
      return p;
    }

    parseTry() {
      const t = this.expectKw('try');
      const block = this.parseBlock();
      const catches = [];
      let fin = null;
      while (this.isKw('catch')) {
        const ct = this.next();
        let type = null, name = null, when = null;
        if (this.acceptOp('(')) { type = this.parseTypeRef(); if (this.is('id')) name = this.next().value; this.expectOp(')'); }
        if (this.isId('when')) { this.next(); this.expectOp('('); when = this.parseExpression(); this.expectOp(')'); }
        const body = this.parseBlock();
        catches.push(this.loc({ type, name, when, body }, ct));
      }
      if (this.acceptKw('finally')) fin = this.parseBlock();
      if (!catches.length && !fin) this.error("try 뒤에는 catch 또는 finally 가 필요합니다");
      return this.loc({ kind: 'Try', block, catches, finally: fin }, t);
    }

    parseUsingStatement() {
      const t = this.expectKw('using');
      if (this.acceptOp('(')) {
        let decl = null, expr = null;
        const d = this.tryParseLocalDeclNoSemi();
        if (d) decl = d; else expr = this.parseExpression();
        this.expectOp(')');
        const body = this.parseStatement();
        return this.loc({ kind: 'Using', decl, expr, body }, t);
      }
      // using 선언: using var x = …;  (현재 블록 끝까지)
      const type = this.parseTypeRef();
      const decl = this.parseLocalDeclRest(type, t);
      return this.loc({ kind: 'UsingDecl', decl }, t);
    }

    // ---------------------------------------------------------------- 식
    parseExpression() { return this.parseAssignment(); }

    parseAssignment() {
      const start = this.cur;
      // 람다: x => … / (a, b) => … / (int a) => … / () => …
      const lam = this.tryParseLambda();
      if (lam) return lam;
      const left = this.parseConditional();
      if (this.cur.type === 'op' && ASSIGN_OPS.has(this.cur.value)) {
        const op = this.next().value;
        const value = this.parseAssignment();
        if (!['Name', 'Member', 'Index', 'Tuple', 'Discard'].includes(left.kind)) this.error('대입의 왼쪽은 변수 · 필드 · 배열 요소여야 합니다', start);
        return this.loc({ kind: 'Assign', op, target: left, value }, start);
      }
      return left;
    }

    tryParseLambda() {
      const t = this.cur;
      const isAsync = this.isId('async') && (this.at(1).type === 'id' || (this.at(1).type === 'op' && this.at(1).value === '('));
      const k = isAsync ? 1 : 0;
      const t0 = this.at(k);
      if (t0.type === 'id' && this.at(k + 1).type === 'op' && this.at(k + 1).value === '=>') {
        if (isAsync) this.next();
        const name = this.next().value; this.next();
        return this.loc({ kind: 'Lambda', params: [{ name, type: null }], body: this.parseLambdaBody() }, t);
      }
      if (t0.type === 'op' && t0.value === '(') {
        // ( … ) => 인지 확인
        const m = this.mark();
        if (isAsync) this.next();
        this.next();
        const params = [];
        let ok = true;
        while (!this.isOp(')')) {
          let mod = null;
          if (this.isKw('out') || this.isKw('ref') || this.isKw('in')) mod = this.next().value;
          if (this.is('id') && (this.at(1).type === 'op' && (this.at(1).value === ',' || this.at(1).value === ')'))) { params.push({ name: this.next().value, type: null, mod }); }
          else {
            const type = this.tryParseType();
            if (!type || !this.is('id')) { ok = false; break; }
            params.push({ name: this.next().value, type, mod });
          }
          if (!this.acceptOp(',')) break;
        }
        if (ok && this.isOp(')') && this.at(1).type === 'op' && this.at(1).value === '=>') {
          this.next(); this.next();
          return this.loc({ kind: 'Lambda', params, body: this.parseLambdaBody() }, t);
        }
        this.reset(m);
      }
      return null;
    }

    parseLambdaBody() {
      if (this.isOp('{')) return this.parseBlock();
      return this.parseExpression();
    }

    parseConditional() {
      const start = this.cur;
      const cond = this.parseBinary(0);
      if (this.isOp('?')) {
        // null 조건 ?. ?[ 는 postfix 에서 처리됨. 여기서는 삼항.
        this.next();
        const a = this.parseAssignmentNoLambdaCheck();
        this.expectOp(':');
        const b = this.parseAssignmentNoLambdaCheck();
        return this.loc({ kind: 'Cond', cond, a, b }, start);
      }
      return cond;
    }
    parseAssignmentNoLambdaCheck() { return this.parseAssignment(); }

    parseBinary(minPrec) {
      let left = this.parseUnary();
      while (true) {
        const t = this.cur;
        let op = null;
        if (t.type === 'op' && BIN_PREC[t.value] !== undefined) op = t.value;
        else if (t.type === 'op' && t.value === '>' && this.at(1).type === 'op' && this.at(1).value === '>' && this.at(1).col === t.col + 1) op = '>>';
        else if (t.type === 'kw' && (t.value === 'is' || t.value === 'as')) op = t.value;
        else if (t.type === 'kw' && t.value === 'switch') {
          // switch 식
          const st = this.next();
          left = this.parseSwitchExpr(left, st);
          continue;
        }
        if (!op) break;
        const prec = BIN_PREC[op];
        if (prec < minPrec) break;
        if (op === '??' && prec <= minPrec && minPrec > 1) break;
        this.next();
        if (op === '>>') this.next();
        if (op === 'is') {
          const pat = this.parseIsPattern();
          left = this.loc({ kind: 'Is', expr: left, pattern: pat }, t);
          continue;
        }
        if (op === 'as') { const type = this.parseTypeRef(); left = this.loc({ kind: 'As', expr: left, type }, t); continue; }
        // ?? 는 우결합
        const right = op === '??' ? this.parseBinary(prec) : this.parseBinary(prec + 1);
        left = this.loc({ kind: 'Binary', op, l: left, r: right }, t);
      }
      return left;
    }

    parseIsPattern() {
      const t = this.cur;
      if (this.isKw('null')) { this.next(); return this.loc({ kind: 'const', expr: { kind: 'Literal', value: null, t: 'null' } }, t); }
      if (this.isId('not')) { this.next(); const p = this.parseIsPattern(); return this.loc({ kind: 'not', pattern: p }, t); }
      const m = this.mark();
      const type = this.tryParseType();
      if (type) {
        let name = null;
        if (this.is('id') && !this.isId('and') && !this.isId('or')) name = this.next().value;
        return this.loc({ kind: 'type', type, name }, t);
      }
      this.reset(m);
      return this.parsePattern();
    }

    parseSwitchExpr(subject, st) {
      this.expectOp('{');
      const arms = [];
      while (!this.isOp('}')) {
        const pattern = this.parsePattern();
        let when = null;
        if (this.isId('when')) { this.next(); when = this.parseExpression(); }
        this.expectOp('=>');
        const value = this.parseExpression();
        arms.push({ pattern, when, value });
        if (!this.acceptOp(',')) break;
      }
      this.expectOp('}');
      return this.loc({ kind: 'SwitchExpr', expr: subject, arms }, st);
    }

    parseUnary() {
      const t = this.cur;
      if (t.type === 'op') {
        if (t.value === '!' || t.value === '-' || t.value === '+' || t.value === '~') { this.next(); const e = this.parseUnary(); return this.loc({ kind: 'Unary', op: t.value, expr: e }, t); }
        if (t.value === '++' || t.value === '--') { this.next(); const e = this.parseUnary(); return this.loc({ kind: 'PreInc', op: t.value, expr: e }, t); }
        if (t.value === '&' || t.value === '*') this.error('포인터 연산은 지원하지 않습니다', t);
        if (t.value === '(') {
          // 형변환?
          const cast = this.tryParseCast();
          if (cast) return cast;
        }
      }
      if (t.type === 'kw') {
        if (t.value === 'out' || t.value === 'ref' || t.value === 'in') this.error(`'${t.value}' 는 인수 위치에서만 쓸 수 있습니다`, t);
        if (t.value === 'throw') { this.next(); const e = this.parseExpression(); return this.loc({ kind: 'ThrowExpr', expr: e }, t); }
        if (t.value === 'checked' || t.value === 'unchecked') { this.next(); this.expectOp('('); const e = this.parseExpression(); this.expectOp(')'); return e; }
      }
      if (t.type === 'id' && t.value === 'await') { this.next(); return this.parseUnary(); }
      return this.parsePostfix(this.parsePrimary());
    }

    tryParseCast() {
      const m = this.mark();
      const t = this.next(); // (
      const type = this.tryParseType();
      if (!type || !this.isOp(')')) { this.reset(m); return null; }
      this.next();
      // 형변환으로 볼 수 있는가: 다음 토큰이 식의 시작이고, 형식이 알려진 것이어야
      const nx = this.cur;
      const knownType = PRIMITIVES.has(type.name) || this.userTypes.has(type.name) || this.known.has(type.name) || type.rank.length > 0 || type.args.length > 0;
      const startsExpr = nx.type === 'id' || nx.type === 'num' || nx.type === 'str' || nx.type === 'istr' || nx.type === 'char' ||
        (nx.type === 'kw' && /^(new|this|base|true|false|null|typeof|default|sizeof|checked|unchecked)$/.test(nx.value)) ||
        (nx.type === 'op' && (nx.value === '(' || nx.value === '!' || nx.value === '~' || ((nx.value === '-' || nx.value === '+') && knownType && PRIMITIVES.has(type.name)) || nx.value === '++' || nx.value === '--'));
      if (!knownType || !startsExpr) { this.reset(m); return null; }
      // (x) - y 같은 경우: x 가 변수면 형변환 아님 → knownType 이 사용자 형식/기본형일 때만 여기 도달
      const expr = this.parseUnary();
      return this.loc({ kind: 'Cast', type, expr }, t);
    }

    parsePostfix(expr) {
      while (true) {
        const t = this.cur;
        if (t.type !== 'op') break;
        if (t.value === '.') {
          this.next();
          const name = this.expectId('멤버 이름');
          expr = this.loc({ kind: 'Member', obj: expr, name, nullSafe: false }, t);
          expr = this.maybeGenericCall(expr);
          continue;
        }
        if (t.value === '?.') {
          this.next();
          const name = this.expectId('멤버 이름');
          expr = this.loc({ kind: 'Member', obj: expr, name, nullSafe: true }, t);
          expr = this.maybeGenericCall(expr);
          continue;
        }
        if (t.value === '?' && this.at(1).type === 'op' && this.at(1).value === '[') {
          this.next(); this.next();
          const args = this.parseIndexArgs();
          expr = this.loc({ kind: 'Index', obj: expr, args, nullSafe: true }, t);
          continue;
        }
        if (t.value === '(') {
          const args = this.parseArgList();
          expr = this.loc({ kind: 'Call', callee: expr, args, typeArgs: expr.typeArgs || null }, t);
          continue;
        }
        if (t.value === '[') {
          this.next();
          const args = this.parseIndexArgs();
          expr = this.loc({ kind: 'Index', obj: expr, args, nullSafe: false }, t);
          continue;
        }
        if (t.value === '++' || t.value === '--') { this.next(); expr = this.loc({ kind: 'PostInc', op: t.value, expr }, t); continue; }
        if (t.value === '!' ) { // null 억제 연산자 x!
          const nx = this.at(1);
          if (nx.type === 'op' && (nx.value === '.' || nx.value === ')' || nx.value === ';' || nx.value === ',' || nx.value === '[' || nx.value === '?.')) { this.next(); continue; }
        }
        break;
      }
      return expr;
    }

    parseIndexArgs() {
      const args = [];
      while (!this.isOp(']')) {
        if (this.isOp('^')) { this.next(); const e = this.parseExpression(); args.push({ kind: 'FromEnd', expr: e }); }
        else {
          let e = null;
          if (!this.isOp('..')) e = this.parseExpression();
          args.push(e);
        }
        if (!this.acceptOp(',')) break;
      }
      this.expectOp(']');
      return args;
    }

    /** 이름 뒤의 <…>( 형태 제네릭 호출 */
    maybeGenericCall(expr) {
      if (!this.isOp('<')) return expr;
      const m = this.mark();
      this.next();
      const typeArgs = [];
      let ok = true;
      while (true) {
        const ty = this.tryParseType();
        if (!ty) { ok = false; break; }
        typeArgs.push(ty);
        if (this.acceptOp(',')) continue;
        break;
      }
      if (ok && this.isOp('>')) { this.next(); if (this.isOp('(')) { expr.typeArgs = typeArgs; return expr; } }
      this.reset(m);
      return expr;
    }

    parseArgList() {
      this.expectOp('(');
      const args = [];
      while (!this.isOp(')')) {
        let mod = null, name = null;
        if (this.is('id') && this.at(1).type === 'op' && this.at(1).value === ':' && !(this.at(2).type === 'op' && this.at(2).value === ':')) { name = this.next().value; this.next(); }
        if (this.isKw('out') || this.isKw('ref') || this.isKw('in')) {
          mod = this.next().value;
          if (mod === 'in') mod = null;
          if (mod === 'out') {
            // out var x / out int x / out _
            if (this.isId('var') && this.at(1).type === 'id') { this.next(); const vn = this.next().value; args.push({ mod, name, expr: { kind: 'OutDecl', type: null, name: vn } }); if (!this.acceptOp(',')) break; continue; }
            if (this.isId('_') && (this.at(1).type === 'op' && (this.at(1).value === ',' || this.at(1).value === ')'))) { this.next(); args.push({ mod, name, expr: { kind: 'Discard' } }); if (!this.acceptOp(',')) break; continue; }
            const m = this.mark();
            const ty = this.tryParseType();
            if (ty && this.is('id') && (this.at(1).type === 'op' && (this.at(1).value === ',' || this.at(1).value === ')'))) { const vn = this.next().value; args.push({ mod, name, expr: { kind: 'OutDecl', type: ty, name: vn } }); if (!this.acceptOp(',')) break; continue; }
            this.reset(m);
          }
        }
        const expr = this.parseExpression();
        args.push({ mod, name, expr });
        if (!this.acceptOp(',')) break;
      }
      this.expectOp(')');
      return args;
    }

    parsePrimary() {
      const t = this.cur;
      switch (t.type) {
        case 'num': this.next(); return this.loc({ kind: 'Literal', value: t.value, t: t.ntype }, t);
        case 'str': this.next(); return this.loc({ kind: 'Literal', value: t.value, t: 'string' }, t);
        case 'char': this.next(); return this.loc({ kind: 'Literal', value: t.value, t: 'char' }, t);
        case 'istr': {
          this.next();
          const parts = t.parts.map((p) => {
            if (p.text != null) return { text: p.text };
            const sub = new Parser(lex(p.expr), this.known);
            sub.userTypes = this.userTypes;
            const e = sub.parseExpression();
            if (!sub.is('eof')) sub.error('보간 식 뒤에 알 수 없는 내용이 있습니다');
            offsetLines(e, p.line - 1, p.col);
            return { expr: e, align: p.align, format: p.format };
          });
          return this.loc({ kind: 'Interp', parts }, t);
        }
        case 'id': {
          if (t.value === 'nameof' && this.at(1).type === 'op' && this.at(1).value === '(') {
            this.next(); this.next();
            const e = this.parseExpression();
            this.expectOp(')');
            const nm = e.kind === 'Member' ? e.name : e.kind === 'Name' ? e.name : '';
            return this.loc({ kind: 'Literal', value: nm, t: 'string' }, t);
          }
          if (t.value === '_' && this.at(1).type === 'op' && this.at(1).value === '=') { this.next(); return this.loc({ kind: 'Discard' }, t); }
          this.next();
          const nameNode = this.loc({ kind: 'Name', name: t.value }, t);
          return this.maybeGenericCall(nameNode);
        }
        case 'kw':
          switch (t.value) {
            case 'true': this.next(); return this.loc({ kind: 'Literal', value: true, t: 'bool' }, t);
            case 'false': this.next(); return this.loc({ kind: 'Literal', value: false, t: 'bool' }, t);
            case 'null': this.next(); return this.loc({ kind: 'Literal', value: null, t: 'null' }, t);
            case 'this': this.next(); return this.loc({ kind: 'This' }, t);
            case 'base': this.next(); return this.loc({ kind: 'Base' }, t);
            case 'new': return this.parseNew();
            case 'typeof': { this.next(); this.expectOp('('); const type = this.parseTypeRef(); this.expectOp(')'); return this.loc({ kind: 'TypeOf', type }, t); }
            case 'default': { this.next(); if (this.acceptOp('(')) { const type = this.parseTypeRef(); this.expectOp(')'); return this.loc({ kind: 'Default', type }, t); } return this.loc({ kind: 'Default', type: null }, t); }
            case 'sizeof': { this.next(); this.expectOp('('); const type = this.parseTypeRef(); this.expectOp(')'); return this.loc({ kind: 'SizeOf', type }, t); }
            default:
              if (PRIMITIVES.has(t.value)) {
                // int.Parse, string.Join, double.MaxValue …
                this.next();
                return this.loc({ kind: 'Name', name: t.value }, t);
              }
              this.error(`여기에 '${t.value}' 를 쓸 수 없습니다`, t);
          }
          break;
        case 'op':
          if (t.value === '(') {
            this.next();
            const first = this.parseExpression();
            if (this.isOp(',')) {
              // 튜플
              const items = [{ name: null, expr: first }];
              while (this.acceptOp(',')) {
                let name = null;
                if (this.is('id') && this.at(1).type === 'op' && this.at(1).value === ':') { name = this.next().value; this.next(); }
                items.push({ name, expr: this.parseExpression() });
              }
              this.expectOp(')');
              return this.loc({ kind: 'Tuple', items }, t);
            }
            this.expectOp(')');
            return this.loc({ kind: 'Paren', expr: first }, t);
          }
          if (t.value === '[') { // 컬렉션 식 [1, 2, 3]
            this.next();
            const items = [];
            while (!this.isOp(']')) { items.push(this.parseExpression()); if (!this.acceptOp(',')) break; }
            this.expectOp(']');
            return this.loc({ kind: 'NewArray', elemType: null, sizes: [], init: items, rank: 1 }, t);
          }
          break;
        case 'eof': this.error('식이 필요한데 코드가 끝났습니다', t);
        default: break;
      }
      this.error(`식이 필요합니다${this.describe()}`, t);
      return null;
    }

    parseNew() {
      const t = this.expectKw('new');
      // new[] { … }  /  new() (대상 형식 지정)
      if (this.isOp('[')) {
        this.next(); this.expectOp(']');
        const init = this.parseArrayInitializer();
        return this.loc({ kind: 'NewArray', elemType: null, sizes: [], init, rank: 1 }, t);
      }
      if (this.isOp('(')) { const args = this.parseArgList(); const init = this.isOp('{') ? this.parseObjectInitializer() : null; return this.loc({ kind: 'New', type: null, args, init }, t); }
      if (this.isOp('{')) { const init = this.parseObjectInitializer(); return this.loc({ kind: 'New', type: null, args: [], init, anonymous: true }, t); }
      // 형식 (배열 크기 [n] 포함)
      const m = this.mark();
      let name;
      const t0 = this.cur;
      if (t0.type === 'kw' && PRIMITIVES.has(t0.value)) { name = t0.value; this.next(); }
      else { name = this.expectId('형식 이름'); while (this.isOp('.') && this.at(1).type === 'id') { this.next(); name += '.' + this.next().value; } }
      const type = { name, args: [], rank: [], nullable: false };
      if (this.isOp('<')) {
        this.next();
        while (!this.isOp('>')) { type.args.push(this.parseTypeRef()); if (!this.acceptOp(',')) break; }
        if (this.isOp('>>')) { this.cur.value = '>'; } else this.expectOp('>');
      }
      // 배열 생성: new int[5], new int[3, 4], new int[5][], new int[] { … }
      if (this.isOp('[')) {
        this.next();
        const sizes = [];
        let rank = 1;
        if (!this.isOp(']')) {
          sizes.push(this.parseExpression());
          while (this.acceptOp(',')) { sizes.push(this.parseExpression()); rank++; }
        } else {
          while (this.acceptOp(',')) rank++;
        }
        this.expectOp(']');
        // 추가 차원 (재그 배열) new int[3][]
        const extra = [];
        while (this.isOp('[')) { this.next(); let d = 1; while (this.acceptOp(',')) d++; this.expectOp(']'); extra.push(d); }
        type.rank = extra;
        type.str = typeToString(type);
        let init = null;
        if (this.isOp('{')) init = this.parseArrayInitializer();
        if (!sizes.length && !init) this.error('배열 크기 또는 초기화자 { … } 가 필요합니다', t);
        return this.loc({ kind: 'NewArray', elemType: type, sizes, init, rank }, t);
      }
      type.str = typeToString(type);
      let args = [];
      if (this.isOp('(')) args = this.parseArgList();
      let init = null;
      if (this.isOp('{')) init = this.parseObjectInitializer();
      if (!args.length && !init && !this.isOp('(')) { /* new Foo; 는 불가 */ }
      return this.loc({ kind: 'New', type, args, init }, t);
    }

    /** 객체 초기화자 { X = 1, Y = 2 } 또는 컬렉션 초기화자 { 1, 2 } / { {k, v}, … } / { [k] = v } */
    parseObjectInitializer() {
      this.expectOp('{');
      const items = [];
      while (!this.isOp('}')) {
        if (this.is('id') && this.at(1).type === 'op' && this.at(1).value === '=') {
          const name = this.next().value; this.next();
          const value = this.isOp('{') ? { kind: 'InitBlock', init: this.parseObjectInitializer() } : this.parseExpression();
          items.push({ kind: 'member', name, value });
        } else if (this.isOp('[')) {
          this.next(); const key = this.parseExpression(); this.expectOp(']'); this.expectOp('=');
          items.push({ kind: 'index', key, value: this.parseExpression() });
        } else if (this.isOp('{')) {
          this.next();
          const vals = [];
          while (!this.isOp('}')) { vals.push(this.parseExpression()); if (!this.acceptOp(',')) break; }
          this.expectOp('}');
          items.push({ kind: 'pair', values: vals });
        } else {
          items.push({ kind: 'add', value: this.parseExpression() });
        }
        if (!this.acceptOp(',')) break;
      }
      this.expectOp('}');
      return items;
    }
  }

  function offsetLines(node, dl, dc) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach((n) => offsetLines(n, dl, dc)); return; }
    if (node.line != null) { if (node.line === 1) node.col += dc - 1; node.line += dl; }
    for (const k in node) { if (k !== 'line' && k !== 'col' && node[k] && typeof node[k] === 'object') offsetLines(node[k], dl, dc); }
  }

  function typeToString(t) {
    if (!t) return '?';
    if (t.str && !t.__dirty) { /* 재계산 */ }
    let s = t.name;
    if (t.name === 'Tuple') s = '(' + t.args.map(typeToString).join(', ') + ')';
    else if (t.args && t.args.length) s += '<' + t.args.map(typeToString).join(',') + '>';
    if (t.nullable) s += '?';
    for (const d of t.rank || []) s += '[' + ','.repeat(d - 1) + ']';
    return s;
  }

  /** 배열 형식의 요소 형식 */
  function elemTypeOf(t) {
    if (!t || !t.rank || !t.rank.length) return null;
    const e = { name: t.name, args: t.args, rank: t.rank.slice(1), nullable: t.nullable };
    e.str = typeToString(e);
    return e;
  }

  function parse(src, knownTypes) {
    const toks = lex(src);
    const p = new Parser(toks, knownTypes);
    const prog = p.parseProgram();
    prog.userTypes = p.userTypes;
    return prog;
  }

  const api = { lex, parse, Parser, CsSyntaxError, typeToString, elemTypeOf, PRIMITIVES, KEYWORDS };
  root.CsLang = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
