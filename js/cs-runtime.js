/* C# 부분집합 평가기(인터프리터) — 값 표현 · 형식 · 실행 (브라우저 · 워커 · Node 공용)
 *  값 표현: 정수 · 실수 = JS number, bool, string, char = CsChar, null, 열거형 = CsEnumVal,
 *          배열 = JS Array(+__elem, __dims), List/Dictionary 등 = 표준 라이브러리 클래스(cs-stdlib.js),
 *          사용자 객체 = { __cls, 필드… }, 람다 = CsFunc, out/ref = Ref
 *  정적 형식은 나눗셈(정수/실수) · 문자 출력 · float 표시에만 쓰이며 typeOf() 가 추론한다.
 */
(function (root) {
  'use strict';
  const L = root.CsLang || (typeof require === 'function' ? require('./cs-lang.js') : null);

  // ================================================================== 값 형식
  class CsChar { constructor(code) { this.code = code; } valueOf() { return this.code; } toString() { return String.fromCharCode(this.code); } }
  class CsEnumVal {
    constructor(def, value) { this.def = def; this.value = value; }
    valueOf() { return this.value; }
    toString() {
      const d = this.def;
      const hit = d.names.find((n) => d.values[n] === this.value);
      if (hit) return hit;
      if (d.flags) {
        const parts = d.names.filter((n) => d.values[n] && (this.value & d.values[n]) === d.values[n]);
        if (parts.length) return parts.join(', ');
      }
      return String(this.value);
    }
  }
  class Ref { constructor(get, set) { this.get = get; this.set = set; } }
  class CsFunc { constructor(params, body, env, thisObj, interp, name) { this.params = params; this.body = body; this.env = env; this.thisObj = thisObj; this.interp = interp; this.name = name || 'lambda'; } }
  class CsTuple {
    constructor(items, names) { this.items = items; this.names = names || items.map(() => null); }
    toString() { return '(' + this.items.map((v) => fmt(v)).join(', ') + ')'; }
    csKey() { return this.items.map((v) => keyOf(v)).join('\u0001'); }
  }
  class CsException extends Error {
    constructor(type, message, inner) { super(message); this.csType = type; this.csMessage = message == null ? defaultMessage(type) : message; this.inner = inner || null; this.csLine = null; }
    get name() { return this.csType; }
  }
  const defaultMessage = (t) => ({
    Exception: 'Exception of type \'System.Exception\' was thrown.', IndexOutOfRangeException: 'Index was outside the bounds of the array.',
    NullReferenceException: 'Object reference not set to an instance of an object.', DivideByZeroException: 'Attempted to divide by zero.',
    InvalidOperationException: 'Operation is not valid due to the current state of the object.', ArgumentException: 'Value does not fall within the expected range.',
    FormatException: 'Input string was not in a correct format.', KeyNotFoundException: 'The given key was not present in the dictionary.',
    NotImplementedException: 'The method or operation is not implemented.', InvalidCastException: 'Specified cast is not valid.', OverflowException: 'Arithmetic operation resulted in an overflow.'
  }[t] || `Exception of type '${t}' was thrown.`);
  const EXC_BASES = {
    ArgumentNullException: 'ArgumentException', ArgumentOutOfRangeException: 'ArgumentException', ArgumentException: 'SystemException', IndexOutOfRangeException: 'SystemException',
    NullReferenceException: 'SystemException', DivideByZeroException: 'ArithmeticException', OverflowException: 'ArithmeticException', ArithmeticException: 'SystemException',
    InvalidOperationException: 'SystemException', FormatException: 'SystemException', KeyNotFoundException: 'SystemException', NotImplementedException: 'SystemException',
    NotSupportedException: 'SystemException', InvalidCastException: 'SystemException', FileNotFoundException: 'IOException', IOException: 'SystemException',
    OpenCVException: 'Exception', ObjectDisposedException: 'InvalidOperationException', SystemException: 'Exception', StackOverflowException: 'SystemException', ApplicationException: 'Exception'
  };
  const excIsA = (t, base) => { if (base === 'Exception' || base === 'object') return true; while (t) { if (t === base) return true; t = EXC_BASES[t] || (t === 'Exception' ? null : 'Exception'); if (t === 'Exception' && base !== 'Exception') return base === 'Exception'; } return false; };
  class Signal { constructor(kind, value) { this.kind = kind; this.value = value; } }
  const BREAK = new Signal('break'), CONTINUE = new Signal('continue');
  class StopSignal extends Error { constructor(m) { super(m || 'stopped'); this.name = 'StopSignal'; } }
  class ExitSignal extends Error { constructor(code) { super('exit'); this.code = code; this.name = 'ExitSignal'; } }

  // ================================================================== 형식 도우미
  const INTEGRAL = new Set(['byte', 'sbyte', 'short', 'ushort', 'int', 'uint', 'long', 'ulong', 'char']);
  const FLOATING = new Set(['float', 'double', 'decimal']);
  const NUMERIC = new Set([...INTEGRAL, ...FLOATING]);
  const RANK = { byte: 1, sbyte: 1, short: 1, ushort: 1, char: 1, int: 2, uint: 3, long: 4, ulong: 5, float: 6, double: 7, decimal: 7 };
  const isIntegral = (t) => INTEGRAL.has(t);
  const isNumericT = (t) => NUMERIC.has(t);
  function promote(a, b) {
    if (!a || !b) return null;
    if (!isNumericT(a) || !isNumericT(b)) return null;
    const ra = RANK[a], rb = RANK[b];
    if (ra <= 1 && rb <= 1) return 'int';
    const t = ra >= rb ? a : b;
    return RANK[t] <= 1 ? 'int' : t;
  }
  const baseName = (str) => { if (!str) return ''; const i = str.indexOf('<'); const j = str.indexOf('['); let e = str.length; if (i >= 0) e = Math.min(e, i); if (j >= 0) e = Math.min(e, j); return str.slice(0, e).replace(/\?$/, ''); };
  const isArrayT = (str) => !!str && /\]$/.test(str);
  const elemT = (str) => { if (!str) return null; const m = /^(.*)\[[,]*\]$/.exec(str); return m ? m[1] : null; };
  const genericArgs = (str) => { if (!str) return []; const i = str.indexOf('<'); if (i < 0) return []; let depth = 0, cur = '', out = []; for (let k = i + 1; k < str.length; k++) { const c = str[k]; if (c === '<' || c === '(') depth++; if (c === ')') depth--; if (c === '>') { if (depth === 0) break; depth--; } if (c === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; } cur += c; } if (cur.trim()) out.push(cur.trim()); return out; };
  /** "(string name, int n)" → [{type:'string', name:'name'}, {type:'int', name:'n'}] */
  const tupleParts = (t) => {
    if (!t || t[0] !== '(') return [];
    const end = t.lastIndexOf(')');
    let depth = 0, cur = '', parts = [];
    for (let k = 1; k < end; k++) { const c = t[k]; if (c === '<' || c === '(') depth++; if (c === '>' || c === ')') depth--; if (c === ',' && depth === 0) { parts.push(cur); cur = ''; continue; } cur += c; }
    parts.push(cur);
    return parts.map((p) => { const s = p.trim(); const i = s.lastIndexOf(' '); if (i > 0 && /^[A-Za-z_]\w*$/.test(s.slice(i + 1)) && !/[<,(]$/.test(s.slice(0, i))) return { type: normType(s.slice(0, i).trim()), name: s.slice(i + 1) }; return { type: normType(s), name: null }; });
  };
  /** "(string name, int n)" → ['name', 'n'] (이름 없으면 null) */
  const tupleNamesOf = (t) => { if (!t || t[0] !== '(') return null; return tupleParts(t).map((p) => p.name); };

  const TYPE_ALIAS = { Int32: 'int', Int64: 'long', Int16: 'short', UInt32: 'uint', UInt64: 'ulong', UInt16: 'ushort', Byte: 'byte', SByte: 'sbyte', Double: 'double', Single: 'float', Boolean: 'bool', String: 'string', Char: 'char', Object: 'object', Decimal: 'decimal', Void: 'void' };
  const normType = (s) => { if (!s) return s; return s.replace(/\b(?:System|OpenCvSharp|Microsoft)(?:\.[A-Za-z_]\w*)*\.(?=[A-Z])/g, '').replace(/\b(Int32|Int64|Int16|UInt32|UInt64|UInt16|Byte|SByte|Double|Single|Boolean|String|Char|Object|Decimal|Void)\b/g, (m, n) => TYPE_ALIAS[n]); };

  /** 값을 형식에 맞게 변환 (저장 · 매개 변수 · 형변환) */
  function coerce(v, t, interp, explicit) {
    if (!t || t === 'var' || t === 'object' || t === 'dynamic' || t === '?') return v;
    t = normType(t);
    if (v == null) return v;
    if (t[0] === '(' && v instanceof CsTuple) { const names = tupleNamesOf(t); if (names && names.some(Boolean)) return new CsTuple(v.items.slice(), names.map((n, k) => n || v.names[k])); return v; }
    if (t.endsWith('?')) t = t.slice(0, -1);
    switch (t) {
      case 'int': { const n = toNum(v, t, interp); return wrapInt(n); }
      case 'uint': { const n = toNum(v, t, interp); return Math.trunc(n) >>> 0; }
      case 'long': case 'ulong': return Math.trunc(toNum(v, t, interp));
      case 'byte': { const n = Math.trunc(toNum(v, t, interp)); return n & 0xff; }
      case 'sbyte': { const n = Math.trunc(toNum(v, t, interp)); return ((n & 0xff) << 24) >> 24; }
      case 'short': { const n = Math.trunc(toNum(v, t, interp)); return ((n & 0xffff) << 16) >> 16; }
      case 'ushort': { const n = Math.trunc(toNum(v, t, interp)); return n & 0xffff; }
      case 'float': return Math.fround(toNum(v, t, interp));
      case 'double': case 'decimal': return toNum(v, t, interp);
      case 'char': if (v instanceof CsChar) return v; if (typeof v === 'number') return new CsChar(Math.trunc(v) & 0xffff); if (typeof v === 'string' && v.length === 1) return new CsChar(v.charCodeAt(0)); break;
      case 'bool': if (typeof v === 'boolean') return v; break;
      case 'string': if (typeof v === 'string') return v; if (explicit) break; return v;
      default: break;
    }
    if (interp) {
      const desc = interp.types.get(baseName(t));
      if (desc && desc.kind === 'enum' && typeof v === 'number') return new CsEnumVal(desc, v);
      if (desc && desc.isStruct && v && typeof v === 'object' && v.__cls === desc && !explicit) return interp.cloneStruct(v);
      if (desc && desc.copyStruct && v && v.constructor && v.constructor.__csType === desc && !explicit) return desc.copyStruct(v);
      if (explicit && desc && desc.convertFrom) { const r = desc.convertFrom(v, interp); if (r !== undefined) return r; }
    }
    return v;
  }
  function wrapInt(n) { if (n > 2147483647 || n < -2147483648) return n | 0; return Math.trunc(n); }
  function toNum(v, t, interp) {
    if (typeof v === 'number') return v;
    if (v instanceof CsChar) return v.code;
    if (v instanceof CsEnumVal) return v.value;
    if (typeof v === 'boolean') throw new CsException('InvalidCastException', `bool 값을 ${t} 로 바꿀 수 없습니다`);
    if (typeof v === 'string') throw new CsException('InvalidCastException', `문자열을 ${t} 로 바로 바꿀 수 없습니다. int.Parse() / double.Parse() 를 쓰세요`);
    if (v && typeof v.valueOf === 'function' && typeof v.valueOf() === 'number') return v.valueOf();
    throw new CsException('InvalidCastException', `${describeVal(v)} 을(를) ${t} 로 바꿀 수 없습니다`);
  }
  function describeVal(v) {
    if (v == null) return 'null';
    if (v && v.__cls) return v.__cls.name;
    if (v && v.constructor && v.constructor.__csType) return v.constructor.__csType.name;
    if (Array.isArray(v)) return '배열';
    return typeof v;
  }
  /** 값의 실행 시간 형식 이름 */
  function runtimeType(v) {
    if (v == null) return 'null';
    if (typeof v === 'number') return Number.isInteger(v) ? 'int' : 'double';
    if (typeof v === 'string') return 'string';
    if (typeof v === 'boolean') return 'bool';
    if (v instanceof CsChar) return 'char';
    if (v instanceof CsEnumVal) return v.def.name;
    if (v instanceof CsTuple) return 'Tuple';
    if (v instanceof CsFunc || typeof v === 'function') return 'delegate';
    if (Array.isArray(v)) return (v.__elem || 'object') + (v.__dims ? '[' + ','.repeat(v.__dims.length - 1) + ']' : '[]');
    if (v.__cls) return v.__cls.name;
    if (v.constructor && v.constructor.__csType) return v.constructor.__csType.name + (v.__targs ? '<' + v.__targs.join(',') + '>' : '');
    return 'object';
  }

  // ================================================================== 문자열 변환 · 서식
  function fmt(v, t) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'boolean') return v ? 'True' : 'False';
    if (typeof v === 'number') return numToString(v, t);
    if (v instanceof CsChar) return v.toString();
    if (v instanceof CsEnumVal) return v.toString();
    if (typeof v === 'function' || v instanceof CsFunc) return 'System.Delegate';
    if (Array.isArray(v)) return 'System.' + ((v.__elem && cap(v.__elem)) || 'Object') + '[' + (v.__dims ? ','.repeat(v.__dims.length - 1) : '') + ']';
    if (v.__cls) { return v.__cls.interp.userToString(v); }
    if (typeof v.csToString === 'function') return v.csToString();
    if (v.constructor && v.constructor.__csType) return v.constructor.__csType.fullName || v.constructor.__csType.name;
    return String(v);
  }
  const cap = (s) => ({ int: 'Int32', double: 'Double', string: 'String', bool: 'Boolean', byte: 'Byte', float: 'Single', long: 'Int64', char: 'Char', short: 'Int16', uint: 'UInt32', object: 'Object' }[s] || s);

  function numToString(v, t) {
    if (Number.isNaN(v)) return 'NaN';
    if (v === Infinity) return '∞'; if (v === -Infinity) return '-∞';
    if (t === 'float') return floatToString(v);
    if (Number.isInteger(v) && Math.abs(v) < 1e15) return String(v);
    const a = Math.abs(v);
    if (a !== 0 && (a >= 1e15 || a < 1e-5)) return csExp(v);
    return String(v);
  }
  function floatToString(v) {
    if (Number.isInteger(v) && Math.abs(v) < 1e7) return String(v);
    for (let p = 1; p <= 9; p++) { const s = v.toPrecision(p); if (Math.fround(parseFloat(s)) === v) { const n = parseFloat(s); return Math.abs(n) >= 1e7 || (Math.abs(n) < 1e-5 && n !== 0) ? csExp(n) : String(n); } }
    return String(v);
  }
  function csExp(v) {
    let s = v.toExponential(); // 1.5e+20
    const m = /^(-?[\d.]+)e([+-])(\d+)$/.exec(s);
    if (!m) return s;
    return `${m[1]}E${m[2]}${m[3].padStart(2, '0')}`;
  }
  function groupInt(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function fixed(v, d) {
    // 은행가 반올림이 아닌 .NET 의 반올림(사사오입, 소수 표현 오차 보정)
    const f = Math.pow(10, d);
    const r = Math.round(Math.abs(v) * f + 1e-9) / f;
    let s = r.toFixed(d);
    if (v < 0 && Number(s) !== 0) s = '-' + s;
    return s;
  }
  /** 숫자 서식: F2 · N0 · D3 · X2 · P1 · E2 · 0.00 · #,##0.## · 0.0% */
  function formatNumber(v, f, t) {
    if (!f) return numToString(v, t);
    const m = /^([a-zA-Z])(\d*)$/.exec(f);
    if (m) {
      const k = m[1].toUpperCase();
      const d = m[2] === '' ? null : parseInt(m[2], 10);
      switch (k) {
        case 'F': return fixed(v, d == null ? 2 : d);
        case 'N': { const s = fixed(v, d == null ? 2 : d); const [i, fr] = s.split('.'); return groupInt(i) + (fr ? '.' + fr : ''); }
        case 'D': { const s = String(Math.trunc(Math.abs(v))); return (v < 0 ? '-' : '') + s.padStart(d || 0, '0'); }
        case 'X': { let s = (Math.trunc(v) >>> 0).toString(16); if (v < 0 && v >= -2147483648) s = (v >>> 0).toString(16); s = m[1] === 'x' ? s.toLowerCase() : s.toUpperCase(); return s.padStart(d || 0, '0'); }
        case 'P': return fixed(v * 100, d == null ? 2 : d) + '%';
        case 'E': { const s = v.toExponential(d == null ? 6 : d); const mm = /^(-?[\d.]+)e([+-])(\d+)$/.exec(s); return mm ? `${mm[1]}${m[1]}${mm[2]}${mm[3].padStart(3, '0')}` : s; }
        case 'G': return d == null ? numToString(v, t) : String(parseFloat(v.toPrecision(d)));
        case 'C': return '₩' + groupInt(fixed(v, d == null ? 0 : d));
        case 'R': return numToString(v, t);
        default: break;
      }
    }
    // 사용자 지정 서식: 0.00 / #,##0.## / 0.0% / 000
    let s = f;
    let percent = false;
    if (s.includes('%')) { percent = true; v *= 100; }
    const core = s.replace(/[%]/g, '');
    const [ip, fp = ''] = core.split('.');
    const grouping = ip.includes(',');
    const minInt = (ip.match(/0/g) || []).length;
    const maxFrac = fp.length, minFrac = (fp.match(/0/g) || []).length;
    let num = fixed(v, maxFrac);
    let [i, fr = ''] = num.replace('-', '').split('.');
    while (fr.length > minFrac && fr.endsWith('0')) fr = fr.slice(0, -1);
    if (i.length < minInt) i = i.padStart(minInt, '0');
    if (minInt === 0 && i === '0' && fr) i = '';
    if (grouping) i = groupInt(i);
    let out = (v < 0 && Number(num) !== 0 ? '-' : '') + i + (fr ? '.' + fr : '');
    if (percent) out += '%';
    return out;
  }
  /** {0,10:F2} 형 서식 */
  function formatValue(v, format, align, t, interp) {
    let s;
    if (format && typeof v === 'number') s = formatNumber(v, format, t);
    else if (format && v instanceof CsChar) s = v.toString();
    else if (format && v && typeof v.csFormat === 'function') s = v.csFormat(format);
    else if (format && v && v.__cls && interp) s = interp.userToString(v, format);
    else s = fmt(v, t);
    if (align != null && !Number.isNaN(align)) { const w = Math.abs(align); s = align > 0 ? s.padStart(w) : s.padEnd(w); }
    return s;
  }
  /** 복합 서식 문자열 "{0} {1:F2}" */
  function compositeFormat(f, args, interp, types) {
    let out = '';
    for (let i = 0; i < f.length; i++) {
      const c = f[i];
      if (c === '{') {
        if (f[i + 1] === '{') { out += '{'; i++; continue; }
        const j = f.indexOf('}', i);
        if (j < 0) throw new CsException('FormatException', 'Input string was not in a correct format.');
        const spec = f.slice(i + 1, j);
        const m = /^(\d+)(?:,\s*(-?\d+))?(?::(.*))?$/s.exec(spec);
        if (!m) throw new CsException('FormatException', 'Input string was not in a correct format.');
        const idx = +m[1];
        if (idx >= args.length) throw new CsException('FormatException', `Index (zero based) must be greater than or equal to zero and less than the size of the argument list.`);
        out += formatValue(args[idx], m[3] || null, m[2] != null ? +m[2] : null, types && types[idx], interp);
        i = j;
        continue;
      }
      if (c === '}') { if (f[i + 1] === '}') i++; out += '}'; continue; }
      out += c;
    }
    return out;
  }

  // ================================================================== 동등 · 키
  function keyOf(v) {
    if (v == null) return null;
    if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') return typeof v === 'string' ? 's\u0000' + v : v;
    if (v instanceof CsChar) return 'c\u0000' + v.code;
    if (v instanceof CsEnumVal) return 'e\u0000' + v.def.name + '\u0000' + v.value;
    if (typeof v.csKey === 'function') return 'k\u0000' + runtimeType(v) + '\u0000' + v.csKey();
    if (v.__cls && v.__cls.isStruct) return 'k\u0000' + v.__cls.name + '\u0000' + v.__cls.interp.structKey(v);
    return v;
  }
  function csEquals(a, b, interp) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a === 'number' && (b instanceof CsChar || b instanceof CsEnumVal)) return a === b.valueOf();
    if (typeof b === 'number' && (a instanceof CsChar || a instanceof CsEnumVal)) return b === a.valueOf();
    if (a instanceof CsChar && b instanceof CsChar) return a.code === b.code;
    if (a instanceof CsEnumVal && b instanceof CsEnumVal) return a.value === b.value;
    if (typeof a === 'string' && b instanceof CsChar) return a === b.toString();
    if (a instanceof CsChar && typeof b === 'string') return b === a.toString();
    if (a && typeof a.csEquals === 'function') return a.csEquals(b);
    if (b && typeof b.csEquals === 'function') return b.csEquals(a);
    const ka = keyOf(a), kb = keyOf(b);
    if (typeof ka !== 'object' || typeof kb !== 'object') return ka === kb;
    if (interp && a.__cls && typeof a.__cls.findMethod === 'function') {
      const eq = interp.findUserMethod(a.__cls, 'Equals');
      if (eq) return !!interp.callUser(eq, a, [b]);
    }
    if (typeof a.csEquals === 'function') return a.csEquals(b);
    return false;
  }
  /** 위임(delegate) 결합 대상인가: 한쪽이 함수이고 다른 쪽은 함수이거나 null */
  const isFuncVal = (v) => typeof v === 'function' || v instanceof CsFunc;
  function isDelegateLike(cur, rhs) {
    if (isFuncVal(rhs)) return cur == null || isFuncVal(cur);
    if (isFuncVal(cur)) return rhs == null;
    return false;
  }
  function truthy(v) { if (typeof v === 'boolean') return v; if (v == null) throw new CsException('NullReferenceException', 'bool 값이 필요한 곳에 null 이 왔습니다'); if (typeof v === 'number') throw new CsException('InvalidCastException', 'C# 에서 숫자는 조건식으로 쓸 수 없습니다. 비교 연산(!= 0 등)을 쓰세요'); return !!v; }

  // ================================================================== 범위(스코프)
  class Scope {
    constructor(parent, frame) { this.vars = new Map(); this.parent = parent; this.frame = frame || (parent ? parent.frame : null); }
    lookup(name) { let s = this; while (s) { const v = s.vars.get(name); if (v) return v; s = s.parent; } return null; }
    declare(name, value, type, node) {
      if (this.vars.has(name)) throw new CsException('CompileError', `'${name}' 변수가 이 범위에 이미 선언되어 있습니다`);
      const slot = { v: value, t: type || null };
      this.vars.set(name, slot);
      return slot;
    }
  }

  // ================================================================== 인터프리터
  class Interpreter {
    /** host: { write(stream, text), readLine(), checkStop(), sleep(ms), fs? } */
    constructor(host) {
      this.host = host;
      this.types = new Map();          // 이름 → 형식 설명자 (표준 · OpenCV · 사용자)
      this.namespaces = new Set(['System', 'System.Collections.Generic', 'System.Linq', 'System.Text', 'System.IO', 'System.Diagnostics', 'System.Threading', 'System.Threading.Tasks', 'System.Globalization', 'OpenCvSharp', 'OpenCvSharp.Extensions', 'System.Collections']);
      this.globals = new Scope(null, { cls: null, thisObj: null });
      this.usingStatic = [];
      this.steps = 0;
      this.extensions = new Map();     // 확장 메서드 이름 → [{fn, appliesTo}]
      this.disposables = [];
      this.plugins = [];
      this.maxDepth = 800; this.depth = 0;
      if (root.CsStdlib) root.CsStdlib.install(this);
    }

    // ---------------------------------------------------------------- 형식 등록 (라이브러리용)
    /**
     * defType(desc): { name, kind:'class'|'struct'|'static'|'enum', ctor(interp,args,typeArgs,node), statics:{X:{t,get,set}|{fn,ret}}, props:{X:{t,get,set}},
     *   methods:{X:{fn(interp,obj,args,typeArgs,node), ret}}, isInstance(v), indexer:{get,set,t}, jsClass }
     */
    defType(desc) {
      desc.statics = desc.statics || {}; desc.props = desc.props || {}; desc.methods = desc.methods || {};
      this.types.set(desc.name, desc);
      if (desc.jsClass) desc.jsClass.__csType = desc;
      if (desc.aliases) desc.aliases.forEach((a) => this.types.set(a, desc));
      return desc;
    }
    defEnum(name, values, flags) {
      const names = Object.keys(values);
      const def = { name, kind: 'enum', names, values, flags: !!flags, statics: {}, props: {}, methods: {} };
      names.forEach((n) => { def.statics[n] = { t: name, get: () => new CsEnumVal(def, values[n]) }; });
      this.types.set(name, def);
      return def;
    }
    defExtension(name, fn, ret, appliesTo) { if (!this.extensions.has(name)) this.extensions.set(name, []); this.extensions.get(name).push({ fn, ret, appliesTo }); }

    // ---------------------------------------------------------------- 실행 진입
    run(source) {
      const known = [...this.types.keys()];
      const prog = L.parse(source, known);
      this.prog = prog;
      this.checkUsings(prog);
      // 사용자 형식 등록
      for (const td of prog.types) this.declareUserType(td, null);
      for (const td of prog.types) this.finishUserType(td);
      for (const td of prog.types) this.initStatics(td);
      // 진입점
      let main = null, mainCls = null;
      for (const [, desc] of this.types) {
        if (desc.user && desc.methodsByName && desc.methodsByName.has('Main')) { const cands = desc.methodsByName.get('Main').filter((m) => m.isStatic); if (cands.length) { main = cands[0]; mainCls = desc; break; } }
      }
      try {
        if (prog.topLevel.length) {
          const scope = new Scope(this.globals, { cls: null, thisObj: null, fn: 'Main' });
          this.hoistLocalFunctions(prog.topLevel, scope);
          const r = this.execBlockStmts(prog.topLevel, scope);
          if (r instanceof Signal && r.kind === 'return' && typeof r.value === 'number') return { exit: r.value };
        } else if (main) {
          const args = []; args.__elem = 'string';
          const r = this.callUser(main, null, main.params.length ? [args] : []);
          if (typeof r === 'number') return { exit: r };
        } else {
          throw new CsException('CompileError', "프로그램 진입점이 없습니다. 'static void Main()' 메서드를 만들거나, 클래스 없이 바로 문장을 쓰세요(최상위 문).");
        }
        return { exit: 0 };
      } catch (e) {
        if (e instanceof ExitSignal) return { exit: e.code };
        throw e;
      } finally {
        this.disposeAll();
      }
    }
    disposeAll() { for (const p of this.plugins) { try { p.afterRun && p.afterRun(); } catch (e) { /* 무시 */ } } }

    checkUsings(prog) {
      for (const u of prog.usings) {
        if (u.isStatic) { const d = this.types.get(u.name.split('.').pop()); if (d) this.usingStatic.push(d); continue; }
        if (/^System\.Windows|^Microsoft\.Win32|^System\.Drawing|^System\.Windows\.Forms/.test(u.name)) this.wpfUsed = u.name;
        if (u.alias) this.aliases = Object.assign(this.aliases || {}, { [u.alias]: u.name });
      }
    }

    // ---------------------------------------------------------------- 사용자 형식
    declareUserType(td, outer) {
      if (td.kind === 'interface' || td.kind === 'delegate') { this.types.set(td.name, { name: td.name, kind: 'interface', statics: {}, props: {}, methods: {}, user: true }); return; }
      if (td.kind === 'enum') {
        const values = {};
        let v = 0;
        for (const m of td.members) { if (m.init) v = this.evalExpr(m.init, this.globals); values[m.name] = v; v++; }
        const def = this.defEnum(td.name, values, false);
        def.user = true;
        return;
      }
      const desc = {
        name: td.name, kind: td.kind === 'struct' ? 'struct' : 'class', isStruct: td.kind === 'struct', user: true, decl: td, interp: this,
        statics: {}, props: {}, methods: {}, methodsByName: new Map(), ctors: [], fields: [], staticFields: new Map(), propDecls: new Map(), operators: new Map(), baseDesc: null, staticScope: null, indexer: null
      };
      desc.staticScope = new Scope(this.globals, { cls: desc, thisObj: null });
      this.types.set(td.name, desc);
      for (const m of td.members) if (m.kind === 'nested') this.declareUserType(m.decl, desc);
    }

    finishUserType(td) {
      if (td.kind !== 'class' && td.kind !== 'struct') return;
      const desc = this.types.get(td.name);
      for (const b of td.base) {
        const bd = this.types.get(b.name);
        if (bd && bd.user && bd.kind !== 'interface') desc.baseDesc = bd;
        else if (bd && !bd.user && bd.kind !== 'interface' && bd.name !== 'Exception' && !EXC_BASES[bd.name]) desc.baseBuiltin = bd;
        else if (b.name === 'Exception' || EXC_BASES[b.name]) desc.exceptionBase = b.name;
        else if (/^(Window|UserControl|Application|Page|INotifyPropertyChanged|ViewModelBase|ObservableObject)$/.test(b.name)) desc.wpfBase = b.name;
      }
      if (td.recordParams) {
        for (const p of td.recordParams) desc.propDecls.set(p.name, { kind: 'property', name: p.name, type: p.type, autoGet: true, autoSet: true, isStatic: false, record: true });
        desc.ctors.push({ kind: 'ctor', params: td.recordParams, body: { kind: 'Block', body: td.recordParams.map((p) => ({ kind: 'ExprStmt', expr: { kind: 'Assign', op: '=', target: { kind: 'Member', obj: { kind: 'This' }, name: p.name }, value: { kind: 'Name', name: p.name } } })) }, init: null, isStatic: false, cls: desc });
      }
      for (const m of td.members) {
        switch (m.kind) {
          case 'field': for (const d of m.decls) { const f = { name: d.name, type: m.type, init: d.init, isStatic: m.isStatic, isConst: m.isConst }; if (m.isStatic) desc.staticFields.set(d.name, f); else desc.fields.push(f); } break;
          case 'property': if (m.isStatic) desc.staticFields.set(m.name, { name: m.name, type: m.type, init: m.init, isStatic: true, prop: m }); else desc.propDecls.set(m.name, m); break;
          case 'method': { m.cls = desc; if (!desc.methodsByName.has(m.name)) desc.methodsByName.set(m.name, []); desc.methodsByName.get(m.name).push(m); break; }
          case 'ctor': m.cls = desc; if (m.isStatic) desc.staticCtor = m; else desc.ctors.push(m); break;
          case 'operator': m.cls = desc; if (!desc.operators.has(m.op)) desc.operators.set(m.op, []); desc.operators.get(m.op).push(m); break;
          case 'conversion': m.cls = desc; desc.conversions = desc.conversions || []; desc.conversions.push(m); break;
          case 'indexer': m.cls = desc; desc.indexer = m; break;
          case 'nested': this.finishUserType(m.decl); break;
          default: break;
        }
      }
    }

    initStatics(td) {
      if (td.kind !== 'class' && td.kind !== 'struct') return;
      const desc = this.types.get(td.name);
      for (const [name, f] of desc.staticFields) {
        let v = f.init ? this.evalExpr(f.init, desc.staticScope) : this.defaultValue(f.type ? f.type.str : null);
        v = coerce(v, f.type && f.type.str, this);
        if (f.prop && !f.prop.autoGet && !f.prop.autoSet && (f.prop.get || f.prop.exprBody)) {
          // 정적 속성(계산)
          desc.statics[name] = { t: f.type && f.type.str, get: () => this.evalPropGet(f.prop, null, desc), set: f.prop.set ? (val) => this.evalPropSet(f.prop, null, desc, val) : null };
        } else {
          const slot = { v, t: f.type && f.type.str };
          desc.staticScope.vars.set(name, slot);
          desc.statics[name] = { t: slot.t, get: () => slot.v, set: f.isConst ? null : (val) => { slot.v = coerce(val, slot.t, this); } };
        }
      }
      for (const [name, list] of desc.methodsByName) {
        if (list.some((m) => m.isStatic)) desc.statics[name] = { method: list.filter((m) => m.isStatic), t: null };
      }
      if (desc.staticCtor) this.callUser(desc.staticCtor, null, []);
      for (const m of td.members) if (m.kind === 'nested') this.initStatics(m.decl);
    }

    defaultValue(t) {
      if (!t) return null;
      t = normType(t);
      if (t.endsWith('?')) return null;
      if (isNumericT(t)) return t === 'char' ? new CsChar(0) : 0;
      if (t === 'bool') return false;
      const d = this.types.get(baseName(t));
      if (d && d.kind === 'enum') return new CsEnumVal(d, 0);
      if (d && d.isStruct) return this.instantiate(d, [], null, true);
      if (d && d.defaultValue) return d.defaultValue();
      return null;
    }

    // ---------------------------------------------------------------- 객체 생성
    instantiate(desc, args, node, noCtor) {
      const obj = { __cls: desc };
      const chain = [];
      for (let d = desc; d; d = d.baseDesc) chain.unshift(d);
      for (const d of chain) {
        for (const f of d.fields) obj[f.name] = f.init ? coerce(this.evalExpr(f.init, new Scope(d.staticScope, { cls: d, thisObj: obj })), f.type && f.type.str, this) : this.defaultValue(f.type && f.type.str);
        for (const [pn, p] of d.propDecls) if (p.autoGet || p.autoSet || p.record) obj['__p_' + pn] = p.init ? coerce(this.evalExpr(p.init, new Scope(d.staticScope, { cls: d, thisObj: obj })), p.type && p.type.str, this) : this.defaultValue(p.type && p.type.str);
      }
      if (desc.exceptionBase) { obj.__exc = true; obj.__p_Message = args.length && typeof args[0] === 'string' ? args[0] : defaultMessage(desc.name); obj.__p_InnerException = args.length > 1 ? args[1] : null; }
      if (noCtor) return obj;
      this.runCtor(desc, obj, args, node);
      return obj;
    }
    runCtor(desc, obj, args, node) {
      const ctor = this.pickOverload(desc.ctors, args, node, '생성자');
      if (!ctor) {
        if (args.length && !desc.exceptionBase) throw new CsException('CompileError', `${desc.name} 에 인수 ${args.length}개를 받는 생성자가 없습니다`);
        if (desc.baseDesc) this.runCtor(desc.baseDesc, obj, desc.exceptionBase ? args : [], node);
        return;
      }
      const scope = new Scope(desc.staticScope, { cls: desc, thisObj: obj, fn: desc.name });
      this.bindParams(ctor.params, args, scope, node);
      if (ctor.init && ctor.init.kind === 'this') {
        const a2 = ctor.init.args.map((a) => this.evalArg(a, scope));
        this.runCtor(desc, obj, a2.map((x) => x.v), node);
      } else if (desc.baseDesc) {
        const a2 = ctor.init ? ctor.init.args.map((a) => this.evalArg(a, scope).v) : [];
        this.runCtor(desc.baseDesc, obj, a2, node);
      } else if (desc.exceptionBase && ctor.init) {
        const a2 = ctor.init.args.map((a) => this.evalArg(a, scope).v);
        if (a2.length) obj.__p_Message = a2[0];
      }
      if (ctor.body) this.execBlock(ctor.body, scope);
    }
    cloneStruct(v) { const o = Object.assign({}, v); return o; }
    structKey(v) { return Object.keys(v).filter((k) => k !== '__cls').map((k) => keyOf(v[k])).join('\u0001'); }
    userToString(obj, format) {
      const m = this.findUserMethod(obj.__cls, 'ToString');
      if (m) return fmt(this.callUser(m, obj, format ? [format] : []));
      if (obj.__exc) return `${obj.__cls.name}: ${obj.__p_Message}`;
      if (obj.__cls.decl && obj.__cls.decl.recordParams) return `${obj.__cls.name} { ${obj.__cls.decl.recordParams.map((p) => `${p.name} = ${fmt(obj['__p_' + p.name])}`).join(', ')} }`;
      return obj.__cls.name;
    }
    findUserMethod(desc, name) { for (let d = desc; d; d = d.baseDesc) { const l = d.methodsByName.get(name); if (l && l.length) return l[0]; } return null; }

    // ---------------------------------------------------------------- 호출
    pickOverload(list, args, node, what) {
      if (!list || !list.length) return null;
      if (list.length === 1) { const m = list[0]; return this.arityOk(m.params, args.length) ? m : null; }
      const cands = list.filter((m) => this.arityOk(m.params, args.length));
      if (!cands.length) return null;
      if (cands.length === 1) return cands[0];
      // 형식 점수
      let best = null, bestScore = -1;
      for (const m of cands) {
        let score = 0;
        for (let i = 0; i < args.length && i < m.params.length; i++) {
          const pt = m.params[i].type ? m.params[i].type.str : null;
          const s = this.matchScore(args[i], pt, m.params[i].mod);
          if (s < 0) { score = -1; break; }
          score += s;
        }
        if (score > bestScore) { bestScore = score; best = m; }
      }
      return best || cands[0];
    }
    arityOk(params, n) {
      const hasParams = params.length && params[params.length - 1].mod === 'params';
      const required = params.filter((p) => !p.def && p.mod !== 'params').length;
      return n >= required && (hasParams || n <= params.length);
    }
    matchScore(v, t, mod) {
      if (!t || t === 'object' || mod === 'params') return 1;
      t = normType(t);
      const rt = runtimeType(v);
      if (v instanceof Ref) return 1;
      if (t === rt) return 3;
      if (t.endsWith('?') && (v == null || t.slice(0, -1) === rt)) return 3;
      if (isNumericT(t) && typeof v === 'number') return isIntegral(t) && !Number.isInteger(v) ? -1 : 2;
      if (isNumericT(t) && (v instanceof CsChar)) return 1;
      if (t === 'string' && typeof v === 'string') return 3;
      if (t === 'bool' && typeof v === 'boolean') return 3;
      if (v == null) return isNumericT(t) || t === 'bool' ? -1 : 1;
      if (isArrayT(t) && Array.isArray(v)) return 2;
      if (v && v.__cls) { for (let d = v.__cls; d; d = d.baseDesc) if (d.name === baseName(t)) return 3; return isNumericT(t) || t === 'string' ? -1 : 0; }
      const desc = this.types.get(baseName(t));
      if (desc && desc.isInstance && desc.isInstance(v)) return 3;
      if (desc && desc.kind === 'enum' && v instanceof CsEnumVal) return v.def === desc ? 3 : -1;
      if ((typeof v === 'function' || v instanceof CsFunc) && /^(Func|Action|Predicate|Comparison|Converter|Delegate)/.test(baseName(t))) return 2;
      if (isNumericT(t) || t === 'string' || t === 'bool') return -1;
      return 0;
    }
    bindParams(params, args, scope, node) {
      for (let i = 0; i < params.length; i++) {
        const p = params[i];
        const pt = p.type ? p.type.str : null;
        if (p.mod === 'params') {
          let rest;
          if (args.length === params.length && Array.isArray(args[i]) && !(args[i] instanceof Ref)) rest = args[i];
          else { rest = args.slice(i).map((a) => coerce(a, elemT(pt), this)); rest.__elem = elemT(pt); }
          scope.declare(p.name, rest, pt);
          break;
        }
        if (i >= args.length) { scope.declare(p.name, p.def ? coerce(this.evalExpr(p.def, scope), pt, this) : this.defaultValue(pt), pt); continue; }
        const a = args[i];
        if (p.mod === 'out' || p.mod === 'ref') {
          if (!(a instanceof Ref)) throw new CsException('CompileError', `'${p.name}' 인수 앞에 ${p.mod} 를 붙여야 합니다`);
          const slot = { t: pt, ref: a }; scope.vars.set(p.name, slot);
          if (p.mod === 'out') a.set(this.defaultValue(pt));
          continue;
        }
        if (a instanceof Ref) throw new CsException('CompileError', `'${p.name}' 매개 변수는 out/ref 가 아닙니다`);
        scope.declare(p.name, coerce(a, pt, this), pt);
      }
    }
    callUser(m, thisObj, args, node) {
      if (++this.depth > this.maxDepth) { this.depth = 0; throw new CsException('StackOverflowException', '재귀 호출이 너무 깊습니다 (스택 오버플로)'); }
      try {
        const cls = m.cls;
        const scope = new Scope(cls ? cls.staticScope : this.globals, { cls, thisObj, fn: m.name || 'ctor', retType: m.retType ? m.retType.str : null });
        this.bindParams(m.params, args, scope, node);
        if (m.exprBody) { const v = this.evalExpr(m.exprBody, scope); return m.retType && m.retType.str === 'void' ? undefined : coerce(v, scope.frame.retType, this); }
        if (!m.body) throw new CsException('CompileError', `'${m.name}' 메서드에 본문이 없습니다`);
        this.hoistLocalFunctions(m.body.body, scope);
        const r = this.execBlockStmts(m.body.body, scope);
        if (r instanceof Signal && r.kind === 'return') return coerce(r.value, scope.frame.retType, this);
        return undefined;
      } finally { this.depth--; }
    }
    callFunc(f, args, node) {
      if (typeof f === 'function') return f.apply(null, args);
      if (f instanceof CsFunc) {
        if (f.method) return this.callUser(f.method, f.thisObj, args, node);
        const scope = new Scope(f.env, Object.assign({}, f.env.frame, { retType: f.retType || null }));
        if (f.localFunc) this.bindParams(f.params, args, scope, node);
        else for (let i = 0; i < f.params.length; i++) { const p = f.params[i]; const pt = p.type ? normType(p.type.str) : null; scope.declare(p.name, i < args.length ? coerce(args[i] instanceof Ref ? args[i].get() : args[i], pt, this) : null, pt); }
        if (f.body.kind === 'Block') {
          this.hoistLocalFunctions(f.body.body, scope);
          const r = this.execBlockStmts(f.body.body, scope);
          const v = r instanceof Signal && r.kind === 'return' ? r.value : undefined;
          return f.retType && f.retType !== 'void' ? coerce(v, f.retType, this) : v;
        }
        const v = this.evalExpr(f.body, scope);
        return f.retType && f.retType !== 'void' ? coerce(v, f.retType, this) : v;
      }
      if (f && f.__cls) { const inv = this.findUserMethod(f.__cls, 'Invoke'); if (inv) return this.callUser(inv, f, args, node); }
      throw new CsException('InvalidOperationException', `호출할 수 없는 값입니다 (${describeVal(f)})`);
    }
    /** 위임(delegate) 값을 JS 함수로 */
    toJsFunc(f) { if (typeof f === 'function') return f; if (f == null) return null; return (...a) => this.callFunc(f, a); }

    hoistLocalFunctions(stmts, scope) {
      for (const s of stmts) if (s.kind === 'LocalFunc') {
        const fn = new CsFunc(s.params, s.body || { kind: 'Block', body: [{ kind: 'Return', expr: s.exprBody }] }, scope, scope.frame.thisObj, this, s.name);
        fn.retType = s.retType ? normType(s.retType.str) : null;
        fn.localFunc = s;
        scope.vars.set(s.name, { v: fn, t: 'delegate' });
      }
    }

    // ---------------------------------------------------------------- 문 실행
    execBlock(block, parent) {
      const scope = new Scope(parent);
      this.hoistLocalFunctions(block.body, scope);
      return this.execBlockStmts(block.body, scope);
    }
    execBlockStmts(stmts, scope) {
      const disposables = [];
      try {
        for (const s of stmts) {
          const r = this.exec(s, scope, disposables);
          if (r instanceof Signal) return r;
        }
      } finally {
        for (let i = disposables.length - 1; i >= 0; i--) this.dispose(disposables[i]);
      }
      return undefined;
    }
    dispose(v) { if (v == null) return; if (v.__cls) { const m = this.findUserMethod(v.__cls, 'Dispose'); if (m) this.callUser(m, v, []); return; } if (typeof v.csDispose === 'function') v.csDispose(); }

    tick(node) {
      if ((++this.steps & 1023) === 0 && this.host.checkStop) this.host.checkStop();
    }

    exec(s, scope, disposables) {
      this.curLine = s.line || this.curLine;
      switch (s.kind) {
        case 'ExprStmt': this.evalExpr(s.expr, scope, true); return;
        case 'LocalDecl': {
          const t = s.type.str === 'var' ? null : normType(s.type.str);
          for (const d of s.decls) {
            let v = null, vt = t;
            if (d.init) {
              if (d.init.kind === 'NewArray' && !d.init.elemType && t) d.init.elemType = { str: elemT(t) || t };
              if (d.init.kind === 'New' && !d.init.type && t) d.init.type = { str: t, name: baseName(t) };
              if (d.init.kind === 'Lambda') d.init.__targetType = t;
              v = this.evalExpr(d.init, scope);
              if (!vt) vt = this.typeOf(d.init, scope) || runtimeType(v);
              v = coerce(v, t, this);
              if (s.type.tupleNames && v instanceof CsTuple) v = new CsTuple(v.items.slice(), s.type.tupleNames.map((n, k) => n || v.names[k]));
            } else if (t) v = this.defaultValue(t);
            else throw new CsException('CompileError', `'var ${d.name}' 은 초기값이 필요합니다`);
            scope.declare(d.name, v, vt, s);
          }
          return;
        }
        case 'Deconstruct': {
          const v = this.evalExpr(s.init, scope);
          const items = this.deconstruct(v, s.names.length, s);
          // 형식을 명시한 분해 선언 (Rect rect, double area) = … 은 그 형식으로, var (a, b) = … 는 값의 형식으로
          s.names.forEach((n, i) => { if (n === '_') return; const t = s.types && s.types[i] ? normType(s.types[i]) : null; scope.declare(n, coerce(items[i], t, this), t || runtimeType(items[i])); });
          return;
        }
        case 'LocalFunc': return;
        case 'Block': return this.execBlock(s, scope);
        case 'Empty': return;
        case 'If': return truthy(this.evalExpr(s.cond, scope)) ? this.exec(s.then, new Scope(scope)) : (s.else ? this.exec(s.else, new Scope(scope)) : undefined);
        case 'While': {
          while (truthy(this.evalExpr(s.cond, scope))) {
            this.tick(s);
            const r = this.exec(s.body, new Scope(scope));
            if (r === BREAK) break;
            if (r instanceof Signal && r.kind === 'return') return r;
          }
          return;
        }
        case 'DoWhile': {
          do {
            this.tick(s);
            const r = this.exec(s.body, new Scope(scope));
            if (r === BREAK) break;
            if (r instanceof Signal && r.kind === 'return') return r;
          } while (truthy(this.evalExpr(s.cond, scope)));
          return;
        }
        case 'For': {
          const fs = new Scope(scope);
          for (const i of s.init) this.exec(i, fs);
          while (!s.cond || truthy(this.evalExpr(s.cond, fs))) {
            this.tick(s);
            const r = this.exec(s.body, new Scope(fs));
            if (r === BREAK) break;
            if (r instanceof Signal && r.kind === 'return') return r;
            for (const u of s.update) this.evalExpr(u, fs, true);
          }
          return;
        }
        case 'Foreach': {
          const coll = this.evalExpr(s.expr, scope);
          const items = this.iterate(coll, s);
          const et = s.type && s.type.str !== 'var' ? normType(s.type.str) : (this.elemTypeOfValue(coll) || null);
          for (const it of items) {
            this.tick(s);
            const bs = new Scope(scope);
            if (s.names) { const parts = this.deconstruct(it, s.names.length, s); s.names.forEach((n, i) => { if (n !== '_') bs.declare(n, parts[i], runtimeType(parts[i])); }); }
            else bs.declare(s.name, coerce(it, et, this), et || runtimeType(it));
            const r = this.exec(s.body, bs);
            if (r === BREAK) break;
            if (r instanceof Signal && r.kind === 'return') return r;
          }
          return;
        }
        case 'Switch': return this.execSwitch(s, scope);
        case 'Break': return BREAK;
        case 'Continue': return CONTINUE;
        case 'Return': return new Signal('return', s.expr ? this.evalExpr(s.expr, scope) : undefined);
        case 'Throw': {
          if (!s.expr) { if (scope.frame && scope.frame.curExc) throw scope.frame.curExc; throw new CsException('InvalidOperationException', 'catch 블록 밖에서 throw; 를 쓸 수 없습니다'); }
          const v = this.evalExpr(s.expr, scope);
          throw this.toThrowable(v, s);
        }
        case 'Try': return this.execTry(s, scope);
        case 'Using': {
          const us = new Scope(scope);
          let v;
          if (s.decl) { this.exec(s.decl, us); v = s.decl.decls.map((d) => us.vars.get(d.name).v); } else v = [this.evalExpr(s.expr, us)];
          try { return this.exec(s.body, us); } finally { for (const x of v) this.dispose(x); }
        }
        case 'UsingDecl': { this.exec(s.decl, scope); for (const d of s.decl.decls) disposables.push(scope.vars.get(d.name).v); return; }
        default: throw new CsException('CompileError', `지원하지 않는 문입니다: ${s.kind}`);
      }
    }

    toThrowable(v, node) {
      if (v instanceof CsException) return v;
      if (v && v.__cls && v.__exc) { const e = new CsException(v.__cls.name, v.__p_Message); e.userObj = v; e.csLine = node && node.line; return e; }
      if (v && v.__csExc) { v.__csExc.csLine = node && node.line; return v.__csExc; }
      throw new CsException('CompileError', 'throw 에는 Exception 개체가 필요합니다');
    }
    /** 예외 개체 (catch 변수용) */
    excObject(e) {
      if (e.userObj) return e.userObj;
      if (e.__obj) return e.__obj;
      const o = { __csExc: e, __excType: e.csType };
      e.__obj = o;
      return o;
    }
    excMatches(e, typeName) {
      if (!typeName || typeName === 'Exception' || typeName === 'object') return true;
      if (e.userObj) { for (let d = e.userObj.__cls; d; d = d.baseDesc) if (d.name === typeName) return true; return excIsA(e.userObj.__cls.exceptionBase || 'Exception', typeName); }
      return excIsA(e.csType, typeName);
    }
    execTry(s, scope) {
      try {
        const r = this.execBlock(s.block, scope);
        return r;
      } catch (e0) {
        let e = e0;
        if (e instanceof StopSignal || e instanceof ExitSignal) throw e;
        if (!(e instanceof CsException)) e = this.wrapJsError(e0);
        for (const c of s.catches) {
          if (c.type && !this.excMatches(e, normType(c.type.str))) continue;
          const cs = new Scope(scope, Object.assign({}, scope.frame, { curExc: e }));
          if (c.name) cs.declare(c.name, this.excObject(e), c.type ? c.type.str : 'Exception');
          if (c.when && !truthy(this.evalExpr(c.when, cs))) continue;
          return this.execBlockStmts(c.body.body, cs);
        }
        throw e;
      } finally {
        if (s.finally) { const r = this.execBlock(s.finally, scope); if (r instanceof Signal) return r; }
      }
    }
    wrapJsError(e) {
      if (e instanceof RangeError && /call stack/i.test(e.message)) return new CsException('StackOverflowException', '재귀 호출이 너무 깊습니다 (스택 오버플로)');
      if (e instanceof TypeError && /null|undefined/.test(e.message)) return new CsException('NullReferenceException', null);
      if (typeof e === 'number' && this.host.cvException) return this.host.cvException(e);
      const ce = new CsException('Exception', e && e.message ? e.message : String(e));
      ce.jsError = e;
      return ce;
    }

    execSwitch(s, scope) {
      const v = this.evalExpr(s.expr, scope);
      const vt = this.typeOf(s.expr, scope);
      const ss = new Scope(scope);
      let matched = -1;
      for (let i = 0; i < s.cases.length && matched < 0; i++) {
        for (const lab of s.cases[i].labels) {
          if (lab.kind === 'default') continue;
          if (this.matchPattern(lab, v, vt, ss) && (!lab.when || truthy(this.evalExpr(lab.when, ss)))) { matched = i; break; }
        }
      }
      if (matched < 0) matched = s.cases.findIndex((c) => c.labels.some((l) => l.kind === 'default'));
      if (matched < 0) return;
      this.hoistLocalFunctions(s.cases.flatMap((c) => c.body), ss);
      for (let i = matched; i < s.cases.length; i++) {
        const r = this.execBlockStmts(s.cases[i].body, ss);
        if (r === BREAK) return;
        if (r instanceof Signal) return r;
        // C# 은 fall-through 금지지만 본문이 비어 있으면(레이블 겹침) 다음으로 진행
        if (s.cases[i].body.length) return;
      }
    }
    matchPattern(p, v, vt, scope) {
      switch (p.kind) {
        case 'discard': return true;
        case 'default': return true;
        case 'var': scope.vars.set(p.name, { v, t: vt || runtimeType(v) }); return true;
        case 'const': { const c = this.evalExpr(p.expr, scope); return csEquals(v, c, this); }
        case 'rel': { const c = this.evalExpr(p.expr, scope); if (typeof v !== 'number' && !(v instanceof CsChar)) return false; const a = +v, b = +c; return p.op === '<' ? a < b : p.op === '>' ? a > b : p.op === '<=' ? a <= b : a >= b; }
        case 'type': { const ok = this.isType(v, normType(p.type.str)); if (ok && p.name) scope.vars.set(p.name, { v: coerce(v, normType(p.type.str), this), t: normType(p.type.str) }); return ok; }
        case 'not': return !this.matchPattern(p.pattern, v, vt, scope);
        case 'and': return this.matchPattern(p.l, v, vt, scope) && this.matchPattern(p.r, v, vt, scope);
        case 'or': return this.matchPattern(p.l, v, vt, scope) || this.matchPattern(p.r, v, vt, scope);
        default: return false;
      }
    }
    isType(v, t) {
      if (v == null) return t === 'null';
      if (t === 'object') return true;
      if (t === 'null') return false;
      const rt = runtimeType(v);
      if (t === rt) return true;
      if (isNumericT(t) && typeof v === 'number') return isIntegral(t) ? Number.isInteger(v) : true;
      if (t === 'string') return typeof v === 'string';
      if (isArrayT(t)) return Array.isArray(v);
      if (v.__cls) { for (let d = v.__cls; d; d = d.baseDesc) if (d.name === baseName(t)) return true; if (v.__exc) return excIsA(v.__cls.exceptionBase || 'Exception', t); return false; }
      if (v.__csExc) return excIsA(v.__excType, t);
      const desc = this.types.get(baseName(t));
      if (desc && desc.isInstance) return desc.isInstance(v);
      if (desc && desc.kind === 'enum') return v instanceof CsEnumVal && v.def === desc;
      if (desc && desc.kind === 'interface' && v && typeof v === 'object') return true;
      if (/^(IEnumerable|ICollection|IList|IReadOnlyList)/.test(t) && (Array.isArray(v) || (v && typeof v.csIter === 'function'))) return true;
      return false;
    }

    // ---------------------------------------------------------------- 반복 · 분해
    iterate(coll, node) {
      if (coll == null) throw new CsException('NullReferenceException', 'foreach 의 컬렉션이 null 입니다');
      if (Array.isArray(coll)) return coll;
      if (typeof coll === 'string') return Array.from(coll, (c) => new CsChar(c.charCodeAt(0)));
      if (typeof coll.csIter === 'function') return coll.csIter();
      if (coll.__cls) { const m = this.findUserMethod(coll.__cls, 'GetEnumerator'); if (m) { const en = this.callUser(m, coll, []); return this.iterate(en, node); } }
      throw new CsException('InvalidOperationException', `${describeVal(coll)} 은(는) foreach 로 반복할 수 없습니다`);
    }
    elemTypeOfValue(coll) {
      if (Array.isArray(coll)) return coll.__elem || null;
      if (typeof coll === 'string') return 'char';
      if (coll && coll.__elem) return coll.__elem;
      return null;
    }
    deconstruct(v, n, node) {
      if (v instanceof CsTuple) return v.items;
      if (v && typeof v.csDeconstruct === 'function') return v.csDeconstruct();
      if (v && v.__cls) { const m = this.findUserMethod(v.__cls, 'Deconstruct'); if (m) { const out = []; const refs = m.params.map((p, i) => new Ref(() => out[i], (x) => { out[i] = x; })); this.callUser(m, v, refs); return out; } }
      if (Array.isArray(v) && v.length === n) return v;
      throw new CsException('InvalidOperationException', `${describeVal(v)} 은(는) ${n}개로 분해할 수 없습니다`);
    }

    // ---------------------------------------------------------------- 식 평가
    evalArg(a, scope) {
      if (a.mod === 'out' || a.mod === 'ref') {
        if (a.expr.kind === 'OutDecl') {
          const t = a.expr.type ? normType(a.expr.type.str) : null;
          const slot = scope.declare(a.expr.name, this.defaultValue(t), t);
          const ref = new Ref(() => slot.v, (x) => { slot.v = coerce(x, slot.t, this); if (!slot.t) slot.t = runtimeType(x); });
          ref.t = t;
          return { v: ref, mod: a.mod, name: a.name };
        }
        if (a.expr.kind === 'Discard') return { v: new Ref(() => null, () => {}), mod: a.mod, name: a.name };
        return { v: this.lvalue(a.expr, scope), mod: a.mod, name: a.name };
      }
      return { v: this.evalExpr(a.expr, scope), mod: null, name: a.name, node: a.expr };
    }
    evalArgs(args, scope) { return args.map((a) => this.evalArg(a, scope)); }

    /** 대입 가능 위치 → Ref */
    lvalue(e, scope) {
      switch (e.kind) {
        case 'Name': {
          const slot = scope.lookup(e.name);
          if (slot) { if (slot.ref) return slot.ref; const r = new Ref(() => slot.v, (v) => { slot.v = coerce(v, slot.t, this); }); r.t = slot.t; return r; }
          const m = this.resolveMemberOnThis(e.name, scope);
          if (m) return m;
          throw new CsException('CompileError', `'${e.name}' 이름을 찾을 수 없습니다`);
        }
        case 'Member': {
          const obj = this.evalExpr(e.obj, scope);
          return this.memberRef(obj, e.name, e, scope);
        }
        case 'Index': {
          const obj = this.evalExpr(e.obj, scope);
          const idx = e.args.map((a) => this.evalExpr(a, scope));
          return new Ref(() => this.indexGet(obj, idx, e), (v) => this.indexSet(obj, idx, v, e));
        }
        case 'Paren': return this.lvalue(e.expr, scope);
        case 'This': return new Ref(() => scope.frame.thisObj, () => { throw new CsException('CompileError', 'this 에 대입할 수 없습니다'); });
        default: throw new CsException('CompileError', '대입할 수 없는 식입니다');
      }
    }

    evalExpr(e, scope, asStatement) {
      this.curLine = e.line || this.curLine;
      switch (e.kind) {
        case 'Literal': return e.t === 'char' ? new CsChar(e.value.charCodeAt(0)) : e.value;
        case 'Paren': return this.evalExpr(e.expr, scope);
        case 'Name': return this.evalName(e, scope);
        case 'This': if (!scope.frame.thisObj) throw new CsException('CompileError', "정적 컨텍스트에서는 'this' 를 쓸 수 없습니다"); return scope.frame.thisObj;
        case 'Base': return scope.frame.thisObj;
        case 'Member': return this.evalMember(e, scope);
        case 'Index': {
          const obj = this.evalExpr(e.obj, scope);
          if (obj == null) { if (e.nullSafe) return null; throw new CsException('NullReferenceException', '인덱스를 쓴 대상이 null 입니다'); }
          const idx = e.args.map((a) => a && a.kind === 'FromEnd' ? this.lengthOf(obj) - this.evalExpr(a.expr, scope) : this.evalExpr(a, scope));
          return this.indexGet(obj, idx, e);
        }
        case 'Call': return this.evalCall(e, scope);
        case 'New': return this.evalNew(e, scope);
        case 'NewArray': return this.evalNewArray(e, scope);
        case 'Unary': return this.evalUnary(e, scope);
        case 'PreInc': case 'PostInc': {
          const ref = this.lvalue(e.expr, scope);
          const old = ref.get();
          if (old == null) throw new CsException('NullReferenceException', null);
          const nv = (old instanceof CsChar) ? new CsChar(old.code + (e.op === '++' ? 1 : -1)) : (+old) + (e.op === '++' ? 1 : -1);
          ref.set(nv);
          return e.kind === 'PreInc' ? ref.get() : old;
        }
        case 'Binary': return this.evalBinary(e, scope);
        case 'Assign': return this.evalAssign(e, scope);
        case 'Cond': return truthy(this.evalExpr(e.cond, scope)) ? this.evalExpr(e.a, scope) : this.evalExpr(e.b, scope);
        case 'Lambda': { const f = new CsFunc(e.params, e.body, scope, scope.frame.thisObj, this); f.targetType = e.__targetType; return f; }
        case 'Cast': return this.evalCast(e, scope);
        case 'Is': {
          const v = this.evalExpr(e.expr, scope);
          return this.matchPattern(e.pattern, v, this.typeOf(e.expr, scope), scope);
        }
        case 'As': { const v = this.evalExpr(e.expr, scope); return this.isType(v, normType(e.type.str)) ? v : null; }
        case 'Interp': {
          let s = '';
          for (const p of e.parts) {
            if (p.text != null) { s += p.text; continue; }
            const v = this.evalExpr(p.expr, scope);
            s += formatValue(v, p.format, p.align, this.typeOf(p.expr, scope), this);
          }
          return s;
        }
        case 'TypeOf': return this.typeObject(normType(e.type.str));
        case 'Default': return e.type ? this.defaultValue(normType(e.type.str)) : null;
        case 'SizeOf': return { int: 4, uint: 4, long: 8, ulong: 8, short: 2, ushort: 2, byte: 1, sbyte: 1, char: 2, float: 4, double: 8, bool: 1, decimal: 16 }[e.type.str] || 0;
        case 'Tuple': return new CsTuple(e.items.map((it) => this.evalExpr(it.expr, scope)), e.items.map((it) => it.name || (it.expr.kind === 'Name' ? it.expr.name : it.expr.kind === 'Member' ? it.expr.name : null)));
        case 'SwitchExpr': {
          const v = this.evalExpr(e.expr, scope);
          const vt = this.typeOf(e.expr, scope);
          for (const arm of e.arms) {
            const as = new Scope(scope);
            if (this.matchPattern(arm.pattern, v, vt, as) && (!arm.when || truthy(this.evalExpr(arm.when, as)))) return this.evalExpr(arm.value, as);
          }
          throw new CsException('InvalidOperationException', `switch 식에서 ${fmt(v)} 에 맞는 갈래가 없습니다 (_ 갈래를 추가하세요)`);
        }
        case 'ThrowExpr': throw this.toThrowable(this.evalExpr(e.expr, scope), e);
        case 'Discard': return null;
        case 'ArrayInit': return this.buildArray(e.items, null, scope);
        default: throw new CsException('CompileError', `지원하지 않는 식입니다: ${e.kind}`);
      }
    }

    lengthOf(obj) { if (Array.isArray(obj)) return obj.length; if (typeof obj === 'string') return obj.length; if (obj && typeof obj.csCount === 'function') return obj.csCount(); throw new CsException('InvalidOperationException', '길이를 알 수 없는 대상입니다'); }

    typeObject(t) { const desc = this.types.get(baseName(t)); return { __csType: t, csToString() { return t; }, Name: (desc && desc.name) || t, csKey() { return t; } }; }

    // ---------------------------------------------------------------- 이름 · 멤버
    evalName(e, scope) {
      const slot = scope.lookup(e.name);
      if (slot) return slot.ref ? slot.ref.get() : slot.v;
      const m = this.resolveMemberOnThis(e.name, scope);
      if (m) return m.get();
      // 형식 이름 (정적 참조) — 별칭
      const tn = this.aliases && this.aliases[e.name] ? this.aliases[e.name].split('.').pop() : e.name;
      const desc = this.types.get(tn);
      if (desc) return { __typeRef: desc };
      for (const d of this.usingStatic) { const st = d.statics[e.name]; if (st) return st.get ? st.get() : st.fn ? this.wrapStatic(d, e.name, st) : null; }
      if (this.namespaces.has(e.name) || /^(System|OpenCvSharp|Microsoft)$/.test(e.name)) return { __ns: e.name };
      if (this.wpfUsed && /^(MessageBox|Application|Dispatcher|Clipboard|Window)$/.test(e.name)) throw new CsException('NotSupportedException', `${e.name} 은(는) WPF(데스크톱) 전용입니다. 이 코드는 Visual Studio 에서 실행하세요.`);
      throw new CsException('CompileError', `'${e.name}' 이름을 찾을 수 없습니다. 철자 · 대소문자, 선언 위치(범위), using 문을 확인하세요.`);
    }
    wrapStatic(desc, name, st) { return (...a) => st.fn(this, a, null, null); }

    /** this 의 필드 · 속성 · 정적 멤버 (메서드 본문 안 이름 해석) → Ref | null */
    resolveMemberOnThis(name, scope) {
      const fr = scope.frame;
      if (!fr) return null;
      const obj = fr.thisObj;
      if (obj && obj.__cls) {
        for (let d = obj.__cls; d; d = d.baseDesc) {
          if (d.fields.some((f) => f.name === name)) return new Ref(() => obj[name], (v) => { obj[name] = coerce(v, this.fieldType(d, name), this); });
          if (d.propDecls.has(name)) { const p = d.propDecls.get(name); return new Ref(() => this.evalPropGet(p, obj, d), (v) => this.evalPropSet(p, obj, d, v)); }
          if (d.methodsByName.has(name)) { const f = new CsFunc([], null, scope, obj, this, name); f.method = d.methodsByName.get(name)[0]; f.overloads = d.methodsByName.get(name); return new Ref(() => f, () => {}); }
        }
      }
      for (let d = fr.cls; d; d = d.baseDesc) {
        const st = d.statics[name];
        if (st) return new Ref(() => (st.method ? this.staticMethodValue(d, name, st) : st.get()), (v) => { if (!st.set) throw new CsException('CompileError', `'${name}' 에 대입할 수 없습니다`); st.set(v); });
      }
      return null;
    }
    fieldType(d, name) { const f = d.fields.find((x) => x.name === name); return f && f.type ? f.type.str : null; }
    staticMethodValue(d, name, st) { const f = new CsFunc([], null, this.globals, null, this, name); f.method = st.method[0]; f.overloads = st.method; return f; }

    evalPropGet(p, obj, d) {
      if (p.exprBody) return this.evalExpr(p.exprBody, new Scope(d.staticScope, { cls: d, thisObj: obj }));
      if (p.get) { const sc = new Scope(d.staticScope, { cls: d, thisObj: obj, retType: p.type && p.type.str }); const r = this.execBlock(p.get, sc); return r instanceof Signal ? r.value : undefined; }
      if (obj) return obj['__p_' + p.name];
      return d.staticScope.vars.get(p.name) ? d.staticScope.vars.get(p.name).v : undefined;
    }
    evalPropSet(p, obj, d, v) {
      v = coerce(v, p.type && p.type.str, this);
      if (p.set) { const sc = new Scope(d.staticScope, { cls: d, thisObj: obj }); sc.declare('value', v, p.type && p.type.str); this.execBlock(p.set, sc); return; }
      if (p.autoSet || p.autoGet || p.record) { if (obj) obj['__p_' + p.name] = v; return; }
      throw new CsException('CompileError', `속성 '${p.name}' 은 읽기 전용입니다`);
    }

    evalMember(e, scope) {
      // 네임스페이스 경로 System.Math.PI
      const obj = this.evalExpr(e.obj, scope);
      if (obj == null) {
        if (e.nullSafe) return null;
        if (e.name === 'HasValue') return false;
        if (e.name === 'Value') throw new CsException('InvalidOperationException', 'Nullable object must have a value.');
        if (e.name === 'GetValueOrDefault') return (d) => (d === undefined ? this.defaultValue(this.typeOf(e.obj, scope)) : d);
        throw new CsException('NullReferenceException', `'${e.name}' 에 접근한 대상이 null 입니다`);
      }
      return this.memberRef(obj, e.name, e, scope).get();
    }

    /** 멤버 참조 (읽기/쓰기) */
    memberRef(obj, name, node, scope) {
      if (obj && obj.__ns) {
        const full = obj.__ns + '.' + name;
        const desc = this.types.get(name);
        if (desc && (this.namespaces.has(obj.__ns) || true)) return new Ref(() => ({ __typeRef: desc }), () => {});
        return new Ref(() => ({ __ns: full }), () => {});
      }
      if (obj && obj.__typeRef) return this.staticMemberRef(obj.__typeRef, name, node);
      // 익명 형식 new { Name = …, Area = … } 의 멤버 (읽기 전용)
      if (obj && obj.__anon) {
        if (Object.prototype.hasOwnProperty.call(obj, name) && name !== '__anon' && name !== 'csToString') return new Ref(() => obj[name], () => { throw new CsException('CompileError', `익명 형식의 속성 '${name}' 은 읽기 전용입니다`); });
        if (name === 'ToString') return new Ref(() => () => obj.csToString(), () => {});
        throw new CsException('CompileError', `익명 형식에 '${name}' 멤버가 없습니다 (있는 것: ${Object.keys(obj).filter((k) => k !== '__anon' && k !== 'csToString').join(', ')})`);
      }
      if (obj && obj.__cls) {
        for (let d = obj.__cls; d; d = d.baseDesc) {
          if (d.fields.some((f) => f.name === name)) return new Ref(() => obj[name], (v) => { obj[name] = coerce(v, this.fieldType(d, name), this); });
          if (d.propDecls.has(name)) { const p = d.propDecls.get(name); return new Ref(() => this.evalPropGet(p, obj, d), (v) => this.evalPropSet(p, obj, d, v)); }
          if (d.methodsByName.has(name)) { const f = new CsFunc([], null, this.globals, obj, this, name); f.method = d.methodsByName.get(name)[0]; f.overloads = d.methodsByName.get(name); return new Ref(() => f, () => {}); }
          const st = d.statics[name];
          if (st) return new Ref(() => (st.method ? this.staticMethodValue(d, name, st) : st.get()), (v) => st.set && st.set(v));
        }
        if (obj.__exc) {
          if (name === 'Message') return new Ref(() => obj.__p_Message, (v) => { obj.__p_Message = v; });
          if (name === 'InnerException') return new Ref(() => obj.__p_InnerException, () => {});
          if (name === 'StackTrace') return new Ref(() => '', () => {});
        }
        return this.builtinMemberRef(obj, name, node, scope);
      }
      return this.builtinMemberRef(obj, name, node, scope);
    }
    staticMemberRef(desc, name, node) {
      const st = desc.statics[name];
      if (st) {
        if (st.method) return new Ref(() => this.staticMethodValue(desc, name, st), () => {});
        if (st.fn) return new Ref(() => { const f = (...a) => st.fn(this, a, null, node); f.__builtin = st; f.__desc = desc; f.__name = name; return f; }, () => {});
        return new Ref(() => st.get(), (v) => { if (!st.set) throw new CsException('CompileError', `${desc.name}.${name} 에 대입할 수 없습니다`); st.set(v); });
      }
      if (desc.kind === 'enum') throw new CsException('CompileError', `열거형 ${desc.name} 에 '${name}' 멤버가 없습니다. 사용 가능: ${desc.names.slice(0, 12).join(', ')}${desc.names.length > 12 ? ' …' : ''}`);
      // 중첩 형식
      const nested = this.types.get(name);
      if (nested && desc.user) return new Ref(() => ({ __typeRef: nested }), () => {});
      throw new CsException('CompileError', `${desc.name} 에 정적 멤버 '${name}' 이(가) 없습니다${this.suggest(name, Object.keys(desc.statics))}`);
    }
    suggest(name, names) {
      const lower = name.toLowerCase();
      const hit = names.filter((n) => n.toLowerCase() === lower || n.toLowerCase().startsWith(lower.slice(0, 4)));
      return hit.length ? ` — 혹시 '${hit.slice(0, 3).join("' / '")}'?` : '';
    }

    /** 표준 · OpenCV 개체의 멤버 */
    builtinMemberRef(obj, name, node, scope) {
      const desc = this.descOf(obj);
      if (desc) {
        const p = desc.props[name];
        if (p) { const r = new Ref(() => p.get(obj, this), (v) => { if (!p.set) throw new CsException('CompileError', `'${name}' 은 읽기 전용 속성입니다`); p.set(obj, coerce(v, typeof p.t === 'function' ? null : p.t, this), this); }); r.t = typeof p.t === 'string' ? p.t : null; return r; }
        const m = desc.methods[name];
        if (m) return new Ref(() => { const f = (...a) => m.fn(this, obj, a, null, node); f.__builtin = m; f.__self = obj; f.__name = name; return f; }, () => {});
        if (desc.dynProp) { const r = desc.dynProp(obj, name, this); if (r) return r; }
      }
      // Nullable<T> 멤버 (값이 있는 경우)
      if (name === 'HasValue' && (typeof obj !== 'object' || obj instanceof CsChar || obj instanceof CsEnumVal || (desc && desc.isStruct))) return new Ref(() => true, () => {});
      if (name === 'Value' && (typeof obj !== 'object' || obj instanceof CsChar || obj instanceof CsEnumVal)) return new Ref(() => obj, () => {});
      if (name === 'GetValueOrDefault' && (typeof obj !== 'object' || obj instanceof CsChar || obj instanceof CsEnumVal)) return new Ref(() => () => obj, () => {});
      const ext = this.extensions.get(name);
      if (ext) { const hit = ext.find((x) => !x.appliesTo || x.appliesTo(obj, this)); if (hit) return new Ref(() => { const f = (...a) => hit.fn(this, obj, a, null, node); f.__builtin = hit; f.__self = obj; f.__name = name; return f; }, () => {}); }
      // 공용 object 멤버
      if (name === 'ToString') return new Ref(() => (fm) => fm != null ? formatValue(obj, fmt(fm), null, null, this) : fmt(obj), () => {});
      if (name === 'Equals') return new Ref(() => (o) => csEquals(obj, o, this), () => {});
      if (name === 'GetHashCode') return new Ref(() => () => { const k = keyOf(obj); let h = 0; const s = typeof k === 'object' ? String(this.objId(obj)) : String(k); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }, () => {});
      if (name === 'GetType') return new Ref(() => () => this.typeObject(runtimeType(obj)), () => {});
      if (obj && obj.__csExc) {
        const e = obj.__csExc;
        if (name === 'Message') return new Ref(() => e.csMessage, () => {});
        if (name === 'InnerException') return new Ref(() => e.inner ? this.excObject(e.inner) : null, () => {});
        if (name === 'StackTrace') return new Ref(() => `   at Program.Main() line ${e.csLine || '?'}`, () => {});
        if (name === 'Source' || name === 'HelpLink') return new Ref(() => null, () => {});
        if (name === 'Data') return new Ref(() => null, () => {});
      }
      const tn = describeVal(obj);
      const avail = desc ? [...Object.keys(desc.props), ...Object.keys(desc.methods)] : [];
      throw new CsException('CompileError', `${tn} 형식에 '${name}' 멤버가 없습니다${this.suggest(name, avail)}`);
    }
    objId(o) { if (!this._ids) { this._ids = new WeakMap(); this._nextId = 1; } if (!this._ids.has(o)) this._ids.set(o, this._nextId++); return this._ids.get(o); }

    /** 값의 표준/라이브러리 형식 설명자 */
    descOf(v) {
      if (v == null) return null;
      const t = typeof v;
      if (t === 'string') return this.types.get('string');
      if (t === 'number') return this.types.get('double');
      if (t === 'boolean') return this.types.get('bool');
      if (v instanceof CsChar) return this.types.get('char');
      if (v instanceof CsEnumVal) return this.types.get('Enum');
      if (v instanceof CsTuple) return this.types.get('Tuple');
      if (Array.isArray(v)) return this.types.get('Array');
      if (v instanceof CsFunc || t === 'function') return this.types.get('Delegate');
      if (v.__csTypeName) return this.types.get(v.__csTypeName) || null;
      if (v.__csType) return this.types.get('Type');
      if (v.__csExc) return this.types.get('Exception');
      if (v.constructor && v.constructor.__csType) return v.constructor.__csType;
      return null;
    }

    // ---------------------------------------------------------------- 호출
    evalCall(e, scope) {
      const c = e.callee;
      const typeArgs = (e.typeArgs || c.typeArgs || []).map((t) => normType(t.str));
      // 사용자 메서드 · 정적 메서드 · 내장 메서드
      if (c.kind === 'Name') {
        const slot = scope.lookup(c.name);
        if (slot) { const f = slot.ref ? slot.ref.get() : slot.v; return this.invokeValue(f, this.evalArgs(e.args, scope), e, typeArgs); }
        const fr = scope.frame;
        // this 의 메서드 (인스턴스 · 정적, 기반 클래스 포함)
        const thisObj = fr.thisObj;
        for (let d = (thisObj && thisObj.__cls) || fr.cls; d; d = d.baseDesc) {
          const list = d.methodsByName && d.methodsByName.get(c.name);
          if (list) { const args = this.evalArgs(e.args, scope); return this.invokeUserMethods(list, thisObj, args, e); }
          if (d.propDecls && d.propDecls.has(c.name)) { const f = this.evalPropGet(d.propDecls.get(c.name), thisObj, d); return this.invokeValue(f, this.evalArgs(e.args, scope), e, typeArgs); }
        }
        // 위임(delegate)을 담은 필드 · 속성을 이름으로 호출: handler("값")
        const memberRef = this.resolveMemberOnThis(c.name, scope);
        if (memberRef) return this.invokeValue(memberRef.get(), this.evalArgs(e.args, scope), e, typeArgs);
        for (const d of this.usingStatic) { const st = d.statics[c.name]; if (st && st.fn) { const args = this.evalArgs(e.args, scope); return st.fn(this, args.map((a) => a.v), typeArgs, e, args); } if (st && st.method) return this.invokeUserMethods(st.method, null, this.evalArgs(e.args, scope), e); }
        if (thisObj && /^(GetType|ToString|GetHashCode|Equals|MemberwiseClone)$/.test(c.name)) {
          const vals = this.evalArgs(e.args, scope).map((a) => a.v);
          if (c.name === 'GetType') return this.typeObject(runtimeType(thisObj));
          if (c.name === 'ToString') return thisObj.__cls ? this.userToString(thisObj) : fmt(thisObj);
          if (c.name === 'GetHashCode') return this.objId(thisObj);
          if (c.name === 'Equals') return csEquals(thisObj, vals[0], this);
          return Object.assign({}, thisObj);
        }
        if (this.wpfUsed && /^(MessageBox|InitializeComponent)$/.test(c.name)) throw new CsException('NotSupportedException', `${c.name} 은(는) WPF 전용입니다. 이 코드는 Visual Studio 에서 실행하세요.`);
        throw new CsException('CompileError', `'${c.name}' 메서드를 찾을 수 없습니다`);
      }
      if (c.kind === 'Member') {
        const obj = c.obj.kind === 'Base' ? scope.frame.thisObj : this.evalExpr(c.obj, scope);
        if (obj == null) { if (c.nullSafe) return null; throw new CsException('NullReferenceException', `'${c.name}' 을(를) 호출한 대상이 null 입니다`); }
        if (c.obj.kind === 'Base') {
          const base = scope.frame.cls && scope.frame.cls.baseDesc;
          if (base) { const list = []; for (let d = base; d; d = d.baseDesc) { const l = d.methodsByName.get(c.name); if (l) { list.push(...l); break; } } if (list.length) return this.invokeUserMethods(list, obj, this.evalArgs(e.args, scope), e); }
          if (c.name === 'ToString') return obj.__cls ? obj.__cls.name : fmt(obj);
          return this.callBuiltinMember(obj, c.name, this.evalArgs(e.args, scope), typeArgs, e, scope);
        }
        if (obj.__ns) { throw new CsException('CompileError', `'${obj.__ns}.${c.name}' 형식 또는 메서드를 찾을 수 없습니다`); }
        if (obj.__typeRef) {
          const d = obj.__typeRef;
          const st = d.statics[c.name];
          const args = this.evalArgs(e.args, scope);
          if (st && st.method) return this.invokeUserMethods(st.method, null, args, e);
          if (st && st.fn) return st.fn(this, args.map((a) => a.v), typeArgs, e, args);
          if (st && st.get) return this.invokeValue(st.get(), args, e, typeArgs);
          if (d.kind === 'enum' && (c.name === 'GetValues' || c.name === 'GetNames')) { const arr = c.name === 'GetNames' ? d.names.slice() : d.names.map((n) => new CsEnumVal(d, d.values[n])); arr.__elem = c.name === 'GetNames' ? 'string' : d.name; return arr; }
          throw new CsException('CompileError', `${d.name} 에 정적 메서드 '${c.name}' 이(가) 없습니다${this.suggest(c.name, Object.keys(d.statics))}`);
        }
        if (obj.__cls) {
          for (let d = obj.__cls; d; d = d.baseDesc) {
            const list = d.methodsByName.get(c.name);
            if (list) return this.invokeUserMethods(list, obj, this.evalArgs(e.args, scope), e);
            if (d.fields.some((f) => f.name === c.name) || d.propDecls.has(c.name)) return this.invokeValue(this.memberRef(obj, c.name, e, scope).get(), this.evalArgs(e.args, scope), e, typeArgs);
          }
          if (c.name === 'ToString') return this.userToString(obj);
          if (c.name === 'Equals') return csEquals(obj, this.evalExpr(e.args[0].expr, scope), this);
          if (c.name === 'GetType') return this.typeObject(obj.__cls.name);
          if (c.name === 'GetHashCode') return this.objId(obj);
          if (c.name === 'Dispose') return undefined;
          if (obj.__exc && c.name === 'ToString') return this.userToString(obj);
          throw new CsException('CompileError', `${obj.__cls.name} 에 '${c.name}' 메서드가 없습니다`);
        }
        return this.callBuiltinMember(obj, c.name, this.evalArgs(e.args, scope), typeArgs, e, scope);
      }
      // 식의 결과를 호출 (람다 · 위임)
      const f = this.evalExpr(c, scope);
      return this.invokeValue(f, this.evalArgs(e.args, scope), e, typeArgs);
    }

    invokeUserMethods(list, thisObj, args, node) {
      const vals = args.map((a) => a.v);
      let m = this.pickOverload(list, vals, node, '메서드');
      if (!m) {
        const nm = list[0].name;
        throw new CsException('CompileError', `'${nm}' 메서드는 인수 ${list.map((x) => x.params.length).join(' 또는 ')}개가 필요한데 ${vals.length}개를 넘겼습니다`);
      }
      if (!m.isStatic && !thisObj) throw new CsException('CompileError', `인스턴스 메서드 '${m.name}' 은(는) 개체를 만들어(new) 호출하거나 static 으로 선언해야 합니다`);
      // 가상 메서드: 실제 개체의 형식에서 다시 찾기 (override)
      if (thisObj && thisObj.__cls && m.cls !== thisObj.__cls) {
        for (let d = thisObj.__cls; d && d !== m.cls; d = d.baseDesc) {
          const l = d.methodsByName.get(m.name);
          if (l) { const mm = this.pickOverload(l, vals, node); if (mm) { m = mm; break; } }
        }
      }
      return this.callUser(m, thisObj, vals, node);
    }
    invokeValue(f, args, node, typeArgs) {
      const vals = args.map((a) => a.v);
      if (f instanceof CsFunc && f.overloads) return this.invokeUserMethods(f.overloads, f.thisObj, args, node);
      if (typeof f === 'function' && f.__builtin) return f.__builtin.fn(this, f.__self !== undefined ? f.__self : vals, f.__self !== undefined ? vals : typeArgs, f.__self !== undefined ? typeArgs : node, node, args);
      if (typeof f === 'function' || f instanceof CsFunc) return this.callFunc(f, vals, node);
      if (f == null) throw new CsException('NullReferenceException', '호출한 위임(delegate)이 null 입니다');
      throw new CsException('CompileError', `${describeVal(f)} 은(는) 호출할 수 없습니다`);
    }
    callBuiltinMember(obj, name, args, typeArgs, node, scope) {
      const desc = this.descOf(obj);
      const vals = args.map((a) => a.v);
      if (desc) {
        const m = desc.methods[name];
        if (m) return m.fn(this, obj, vals, typeArgs, node, args);
      }
      const ext = this.extensions.get(name);
      if (ext) { const hit = ext.find((x) => !x.appliesTo || x.appliesTo(obj, this)); if (hit) return hit.fn(this, obj, vals, typeArgs, node, args); }
      if (desc) {
        const p = desc.props[name];
        if (p) return this.invokeValue(p.get(obj, this), args, node, typeArgs);
      }
      if (name === 'ToString') return vals.length ? formatValue(obj, fmt(vals[0]), null, null, this) : fmt(obj, this.typeOf(node.callee.obj, scope));
      if (name === 'Equals') return csEquals(obj, vals[0], this);
      if (name === 'GetType') return this.typeObject(runtimeType(obj));
      if (name === 'GetHashCode') { const k = keyOf(obj); const s = typeof k === 'object' ? String(this.objId(obj)) : String(k); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
      if (name === 'CompareTo' && (typeof obj === 'number' || typeof obj === 'string' || obj instanceof CsChar)) { const a = obj instanceof CsChar ? obj.code : obj, b = vals[0] instanceof CsChar ? vals[0].code : vals[0]; return a < b ? -1 : a > b ? 1 : 0; }
      if (name === 'Dispose' && obj && typeof obj.csDispose === 'function') return obj.csDispose();
      if (obj && obj.__csExc && name === 'ToString') return `${obj.__excType}: ${obj.__csExc.csMessage}`;
      const avail = desc ? [...Object.keys(desc.methods), ...Object.keys(desc.props)] : [];
      throw new CsException('CompileError', `${describeVal(obj)} 형식에 '${name}' 메서드가 없습니다${this.suggest(name, avail)}`);
    }

    // ---------------------------------------------------------------- new
    evalNew(e, scope) {
      if (!e.type) {
        if (e.anonymous) {
          // 익명 형식: new { Name = x, Area = a } 또는 투영 new { c.Area, name } (멤버 이름을 그대로 씀)
          const o = { __anon: true };
          const types = {};
          for (const it of e.init) {
            let key = null, expr = null;
            if (it.kind === 'member') { key = it.name; expr = it.value; }
            else if (it.kind === 'add' && (it.value.kind === 'Name' || it.value.kind === 'Member')) { key = it.value.name; expr = it.value; }
            else throw new CsException('CompileError', '익명 형식에는 이름 = 값 형태로 속성을 쓰세요 (예: new { Area = a })');
            o[key] = this.evalExpr(expr, scope);
            types[key] = this.typeOf(expr, scope) || runtimeType(o[key]);
          }
          Object.defineProperty(o, '__types', { value: types, enumerable: false });
          const keys = Object.keys(o).filter((k) => k !== '__anon');
          o.csToString = () => '{ ' + keys.map((k) => `${k} = ${fmt(o[k], types[k])}`).join(', ') + ' }';
          return o;
        }
        throw new CsException('CompileError', "new() 는 변수의 형식을 알 수 있을 때만 쓸 수 있습니다 (예: List<int> a = new();)");
      }
      const tstr = normType(e.type.str);
      const name = baseName(tstr);
      const typeArgs = genericArgs(tstr);
      const args = this.evalArgs(e.args, scope);
      const vals = args.map((a) => a.v);
      const desc = this.types.get(name);
      let obj;
      if (!desc) {
        if (this.wpfUsed || /^(Window|Button|TextBlock|Image|BitmapImage|WriteableBitmap|OpenFileDialog|SaveFileDialog|Bitmap|Thread|Timer|DispatcherTimer)$/.test(name)) throw new CsException('NotSupportedException', `${name} 은(는) 브라우저 실습 환경에서 만들 수 없는 형식입니다 (WPF · 데스크톱 전용). Visual Studio 에서 실행하세요.`);
        throw new CsException('CompileError', `'${name}' 형식을 찾을 수 없습니다. using 문과 철자를 확인하세요.`);
      }
      if (desc.user) {
        if (desc.kind === 'interface') throw new CsException('CompileError', `인터페이스 ${name} 은(는) new 로 만들 수 없습니다`);
        if (desc.wpfBase) throw new CsException('NotSupportedException', `${name} 은(는) WPF 창(Window) 입니다. 브라우저에서는 실행할 수 없으니 Visual Studio 에서 실행하세요.`);
        obj = this.instantiate(desc, vals, e);
      } else if (desc.kind === 'enum') { obj = new CsEnumVal(desc, 0); }
      else {
        if (!desc.ctor) throw new CsException('CompileError', `${name} 은(는) new 로 만들 수 없습니다`);
        obj = desc.ctor(this, vals, typeArgs, e, args);
      }
      if (e.init) this.applyInitializer(obj, e.init, scope, e);
      return obj;
    }
    applyInitializer(obj, init, scope, node) {
      for (const it of init) {
        if (it.kind === 'member') {
          const ref = this.memberRef(obj, it.name, node, scope);
          if (it.value.kind === 'InitBlock') this.applyInitializer(ref.get(), it.value.init, scope, node);
          else ref.set(this.evalExpr(it.value, scope));
        } else if (it.kind === 'add') {
          const v = this.evalExpr(it.value, scope);
          this.callBuiltinMemberOrUser(obj, 'Add', [v], node, scope);
        } else if (it.kind === 'pair') {
          const vs = it.values.map((x) => this.evalExpr(x, scope));
          this.callBuiltinMemberOrUser(obj, 'Add', vs, node, scope);
        } else if (it.kind === 'index') {
          this.indexSet(obj, [this.evalExpr(it.key, scope)], this.evalExpr(it.value, scope), node);
        }
      }
    }
    callBuiltinMemberOrUser(obj, name, vals, node, scope) {
      if (obj && obj.__cls) { const m = this.findUserMethod(obj.__cls, name); if (m) return this.callUser(m, obj, vals, node); }
      return this.callBuiltinMember(obj, name, vals.map((v) => ({ v })), [], node, scope);
    }

    evalNewArray(e, scope) {
      const et = e.elemType ? normType(e.elemType.str) : null;
      if (e.init) {
        if (e.rank > 1) {
          // 2차원 초기화자 { {1,2},{3,4} }
          const rows = e.init.map((r) => (r.kind === 'ArrayInit' ? r.items : [r]).map((x) => this.evalExpr(x, scope)));
          const dims = [rows.length, rows.length ? rows[0].length : 0];
          const flat = []; rows.forEach((r) => { if (r.length !== dims[1]) throw new CsException('CompileError', '2차원 배열 초기화자의 행 길이가 다릅니다'); r.forEach((v) => flat.push(v)); });
          return this.makeMd(flat, dims, et || this.inferElem(flat));
        }
        return this.buildArray(e.init, et, scope, e.elemType && e.elemType.rank && e.elemType.rank.length ? e.elemType : null);
      }
      const sizes = e.sizes.map((s) => { const n = this.evalExpr(s, scope); if (typeof n !== 'number' || n < 0 || !Number.isInteger(n)) throw new CsException('OverflowException', '배열 크기는 0 이상의 정수여야 합니다'); return n; });
      if (e.rank > 1) {
        const total = sizes.reduce((a, b) => a * b, 1);
        const flat = new Array(total);
        const dv = this.defaultValue(et);
        for (let i = 0; i < total; i++) flat[i] = dv;
        return this.makeMd(flat, sizes, et);
      }
      const arr = new Array(sizes[0]);
      const innerT = e.elemType && e.elemType.rank && e.elemType.rank.length ? normType(e.elemType.str) : et;
      const dv = e.elemType && e.elemType.rank && e.elemType.rank.length ? null : this.defaultValue(et);
      for (let i = 0; i < arr.length; i++) arr[i] = dv;
      arr.__elem = innerT || et;
      return arr;
    }
    makeMd(flat, dims, et) { flat.__dims = dims; flat.__elem = et; return flat; }
    inferElem(vals) { const v = vals.find((x) => x != null); return v == null ? 'object' : runtimeType(v); }
    buildArray(items, et, scope, jaggedType) {
      const arr = items.map((x) => x.kind === 'ArrayInit' ? this.buildArray(x.items, jaggedType && jaggedType.rank.length > 1 ? null : et, scope) : coerce(this.evalExpr(x, scope), et, this));
      arr.__elem = jaggedType ? normType(jaggedType.str) : (et || this.inferElem(arr));
      return arr;
    }

    // ---------------------------------------------------------------- 인덱스
    indexGet(obj, idx, node) {
      if (Array.isArray(obj)) {
        if (obj.__dims) { const i = this.mdIndex(obj, idx); return obj[i]; }
        const i = this.checkIndex(obj, idx[0]);
        return obj[i];
      }
      if (typeof obj === 'string') { const i = idx[0]; if (i < 0 || i >= obj.length) throw new CsException('IndexOutOfRangeException', 'Index was outside the bounds of the array.'); return new CsChar(obj.charCodeAt(i)); }
      if (obj.__cls) { if (obj.__cls.indexer) { const ix = obj.__cls.indexer; const sc = new Scope(obj.__cls.staticScope, { cls: obj.__cls, thisObj: obj, retType: ix.type.str }); ix.params.forEach((p, k) => sc.declare(p.name, coerce(idx[k], p.type.str, this), p.type.str)); if (ix.exprBody) return this.evalExpr(ix.exprBody, sc); const r = this.execBlock(ix.get, sc); return r instanceof Signal ? r.value : undefined; } throw new CsException('CompileError', `${obj.__cls.name} 에는 인덱서 [ ] 가 없습니다`); }
      const desc = this.descOf(obj);
      if (desc && desc.indexer) return desc.indexer.get(obj, idx, this, node);
      throw new CsException('CompileError', `${describeVal(obj)} 에는 인덱스 [ ] 를 쓸 수 없습니다`);
    }
    indexSet(obj, idx, v, node) {
      if (Array.isArray(obj)) {
        if (obj.__dims) { const i = this.mdIndex(obj, idx); obj[i] = coerce(v, obj.__elem, this); return; }
        const i = this.checkIndex(obj, idx[0]);
        obj[i] = coerce(v, obj.__elem, this);
        return;
      }
      if (typeof obj === 'string') throw new CsException('CompileError', '문자열은 읽기 전용입니다. ToCharArray() 로 바꿔 수정하세요');
      if (obj.__cls) { if (obj.__cls.indexer && obj.__cls.indexer.set) { const ix = obj.__cls.indexer; const sc = new Scope(obj.__cls.staticScope, { cls: obj.__cls, thisObj: obj }); ix.params.forEach((p, k) => sc.declare(p.name, coerce(idx[k], p.type.str, this), p.type.str)); sc.declare('value', coerce(v, ix.type.str, this), ix.type.str); this.execBlock(ix.set, sc); return; } throw new CsException('CompileError', `${obj.__cls.name} 에는 대입 가능한 인덱서가 없습니다`); }
      const desc = this.descOf(obj);
      if (desc && desc.indexer && desc.indexer.set) return desc.indexer.set(obj, idx, v, this, node);
      throw new CsException('CompileError', `${describeVal(obj)} 에는 인덱스로 대입할 수 없습니다`);
    }
    checkIndex(arr, i) {
      if (i instanceof CsChar || i instanceof CsEnumVal) i = i.valueOf();
      if (typeof i !== 'number' || !Number.isInteger(i)) throw new CsException('CompileError', `배열 인덱스는 정수여야 합니다 (${fmt(i)})`);
      if (i < 0 || i >= arr.length) throw new CsException('IndexOutOfRangeException', `Index was outside the bounds of the array. (인덱스 ${i}, 길이 ${arr.length})`);
      return i;
    }
    mdIndex(arr, idx) {
      const d = arr.__dims;
      if (idx.length !== d.length) throw new CsException('CompileError', `${d.length}차원 배열에는 인덱스 ${d.length}개가 필요합니다`);
      let flat = 0;
      for (let k = 0; k < d.length; k++) { const i = +idx[k]; if (!Number.isInteger(i) || i < 0 || i >= d[k]) throw new CsException('IndexOutOfRangeException', `Index was outside the bounds of the array. (차원 ${k}: 인덱스 ${i}, 길이 ${d[k]})`); flat = flat * d[k] + i; }
      return flat;
    }

    // ---------------------------------------------------------------- 연산
    evalUnary(e, scope) {
      const v = this.evalExpr(e.expr, scope);
      switch (e.op) {
        case '!': return !truthy(v);
        case '-': { if (v && typeof v === 'object' && !(v instanceof CsChar) && !(v instanceof CsEnumVal)) return this.operatorOverload('-', [v], e, true); return -toNum(v, 'number', this); }
        case '+': return toNum(v, 'number', this);
        case '~': { if (v instanceof CsEnumVal) return new CsEnumVal(v.def, ~v.value); if (v && typeof v === 'object' && !(v instanceof CsChar)) return this.operatorOverload('~', [v], e, true); return ~toNum(v, 'int', this); }
        default: throw new CsException('CompileError', `알 수 없는 단항 연산자 ${e.op}`);
      }
    }
    operatorOverload(op, vals, node, unary) {
      for (const v of vals) {
        if (v && v.__cls) { for (let d = v.__cls; d; d = d.baseDesc) { const list = d.operators.get(op); if (list) { const m = this.pickOverload(list, vals, node); if (m) return this.callUser(m, null, vals, node); } } }
        const desc = this.descOf(v);
        if (desc && desc.operators && desc.operators[op]) { const r = desc.operators[op](this, vals, node); if (r !== undefined) return r; }
      }
      throw new CsException('CompileError', `'${op}' 연산자를 ${vals.map(describeVal).join(' 과 ')} 에 쓸 수 없습니다`);
    }
    evalBinary(e, scope) {
      const op = e.op;
      if (op === '&&') { const a = this.evalExpr(e.l, scope); return truthy(a) ? truthy(this.evalExpr(e.r, scope)) : false; }
      if (op === '||') { const a = this.evalExpr(e.l, scope); return truthy(a) ? true : truthy(this.evalExpr(e.r, scope)); }
      if (op === '??') { const a = this.evalExpr(e.l, scope); return a != null ? a : this.evalExpr(e.r, scope); }
      const a = this.evalExpr(e.l, scope), b = this.evalExpr(e.r, scope);
      return this.binaryOp(op, a, b, e, scope);
    }
    binaryOp(op, a, b, e, scope) {
      if (op === '==') return csEquals(a, b, this);
      if (op === '!=') return !csEquals(a, b, this);
      // 문자열 결합
      if (op === '+' && (typeof a === 'string' || typeof b === 'string')) {
        const ta = typeof a === 'string' ? null : this.typeOf(e.l, scope), tb = typeof b === 'string' ? null : this.typeOf(e.r, scope);
        return fmt(a, ta) + fmt(b, tb);
      }
      const aObj = a && typeof a === 'object' && !(a instanceof CsChar) && !(a instanceof CsEnumVal);
      const bObj = b && typeof b === 'object' && !(b instanceof CsChar) && !(b instanceof CsEnumVal);
      if (aObj || bObj) {
        if (a == null || b == null) { if (op === '<' || op === '>' || op === '<=' || op === '>=') return false; throw new CsException('NullReferenceException', null); }
        return this.operatorOverload(op, [a, b], e);
      }
      if (a == null || b == null) { if ((op === '+' || op === '-' || op === '*' || op === '/') ) return null; throw new CsException('NullReferenceException', null); }
      // 열거형 비트 연산
      if (a instanceof CsEnumVal || b instanceof CsEnumVal) {
        const def = a instanceof CsEnumVal ? a.def : b.def;
        const x = +a, y = +b;
        switch (op) {
          case '|': return new CsEnumVal(def, x | y);
          case '&': return new CsEnumVal(def, x & y);
          case '^': return new CsEnumVal(def, x ^ y);
          case '<': return x < y; case '>': return x > y; case '<=': return x <= y; case '>=': return x >= y;
          case '+': return new CsEnumVal(def, x + y); case '-': return new CsEnumVal(def, x - y);
          default: break;
        }
      }
      if (typeof a === 'boolean' || typeof b === 'boolean') {
        if (typeof a !== 'boolean' || typeof b !== 'boolean') throw new CsException('CompileError', `'${op}' 연산자를 bool 과 다른 형식에 쓸 수 없습니다`);
        switch (op) { case '&': return a && b; case '|': return a || b; case '^': return a !== b; default: throw new CsException('CompileError', `bool 에 '${op}' 연산자를 쓸 수 없습니다`); }
      }
      const ta = this.typeOf(e.l, scope) || (a instanceof CsChar ? 'char' : Number.isInteger(a) ? 'int' : 'double');
      const tb = this.typeOf(e.r, scope) || (b instanceof CsChar ? 'char' : Number.isInteger(b) ? 'int' : 'double');
      const x = a instanceof CsChar ? a.code : a, y = b instanceof CsChar ? b.code : b;
      if (typeof x !== 'number' || typeof y !== 'number') throw new CsException('CompileError', `'${op}' 연산자를 ${describeVal(a)} 과 ${describeVal(b)} 에 쓸 수 없습니다`);
      const rt = promote(isNumericT(ta) ? ta : 'double', isNumericT(tb) ? tb : 'double') || 'double';
      const integral = isIntegral(rt);
      let r;
      switch (op) {
        case '+': r = x + y; break;
        case '-': r = x - y; break;
        case '*': r = x * y; break;
        case '/': if (integral) { if (y === 0) throw new CsException('DivideByZeroException', null); r = Math.trunc(x / y); } else r = x / y; break;
        case '%': if (integral) { if (y === 0) throw new CsException('DivideByZeroException', null); r = x % y; } else r = x % y; break;
        case '<': return x < y; case '>': return x > y; case '<=': return x <= y; case '>=': return x >= y;
        case '&': return integral ? (rt === 'long' || rt === 'ulong' ? Number(BigInt.asIntN(64, BigInt(x) & BigInt(y))) : (x & y)) : (x & y);
        case '|': return rt === 'long' || rt === 'ulong' ? Number(BigInt.asIntN(64, BigInt(x) | BigInt(y))) : (x | y);
        case '^': return x ^ y;
        case '<<': return rt === 'long' || rt === 'ulong' ? Number(BigInt.asIntN(64, BigInt(x) << BigInt(y & 63))) : (x << (y & 31));
        case '>>': return rt === 'long' || rt === 'ulong' ? Number(BigInt(x) >> BigInt(y & 63)) : (rt === 'uint' ? x >>> (y & 31) : x >> (y & 31));
        default: throw new CsException('CompileError', `알 수 없는 연산자 ${op}`);
      }
      if (rt === 'int') return wrapInt(r);
      if (rt === 'uint') return r >>> 0;
      if (rt === 'float') return Math.fround(r);
      return r;
    }
    evalAssign(e, scope) {
      if (e.target.kind === 'Tuple') {
        const v = this.evalExpr(e.value, scope);
        const parts = this.deconstruct(v, e.target.items.length, e);
        // 먼저 모두 평가 후 대입 (swap 지원)
        const refs = e.target.items.map((it) => (it.expr.kind === 'Discard' || (it.expr.kind === 'Name' && it.expr.name === '_' && !scope.lookup('_')) ? null : this.lvalue(it.expr, scope)));
        refs.forEach((r, i) => { if (r) r.set(parts[i]); });
        return v;
      }
      if (e.target.kind === 'Discard') return this.evalExpr(e.value, scope);
      const ref = this.lvalue(e.target, scope);
      if (e.op === '=') {
        if (e.value.kind === 'Lambda') e.value.__targetType = this.typeOf(e.target, scope);
        if (e.value.kind === 'NewArray' && !e.value.elemType) { const tt = this.typeOf(e.target, scope); if (tt && elemT(tt)) e.value.elemType = { str: elemT(tt) }; }
        if (e.value.kind === 'New' && !e.value.type) { const tt = this.typeOf(e.target, scope); if (tt) e.value.type = { str: tt, name: baseName(tt) }; }
        const v = this.evalExpr(e.value, scope);
        ref.set(v);
        return ref.get();
      }
      if (e.op === '??=') { const cur = ref.get(); if (cur != null) return cur; const v = this.evalExpr(e.value, scope); ref.set(v); return ref.get(); }
      const cur = ref.get();
      const rhs = this.evalExpr(e.value, scope);
      const op = e.op.slice(0, -1);
      let nv;
      if (op === '+' && (typeof cur === 'string' || typeof rhs === 'string')) nv = fmt(cur, this.typeOf(e.target, scope)) + fmt(rhs, this.typeOf(e.value, scope));
      else if (cur instanceof CsChar && typeof rhs === 'number') nv = new CsChar(this.binaryOp(op, cur.code, rhs, e, scope));
      else if ((op === '+' || op === '-') && isDelegateLike(cur, rhs)) {
        // 이벤트 · 위임(delegate) 결합: handler += 람다 / -= 람다 (cur 가 null 이어도 등록된다)
        nv = this.combineDelegates(cur, rhs, op);
      } else nv = this.binaryOp(op, cur, rhs, e, scope);
      // 정적 형식에 맞게 (byte b; b += 1 → byte)
      const tt = this.typeOf(e.target, scope);
      if (tt && isNumericT(tt) && typeof nv === 'number') nv = coerce(nv, tt, this);
      ref.set(nv);
      return ref.get();
    }
    combineDelegates(a, b, op) {
      const la = a && a.__multi ? a.__multi : (a == null ? [] : [a]);
      const lb = b && b.__multi ? b.__multi : (b == null ? [] : [b]);
      let list;
      if (op === '+') list = la.concat(lb);
      else { list = la.slice(); for (const x of lb) { const i = list.lastIndexOf(x); if (i >= 0) list.splice(i, 1); } }
      if (!list.length) return null;
      if (list.length === 1) return list[0];
      const f = (...args) => { let r; for (const x of list) r = this.callFunc(x, args); return r; };
      f.__multi = list;
      return f;
    }
    evalCast(e, scope) {
      const t = normType(e.type.str);
      const v = this.evalExpr(e.expr, scope);
      if (v == null) { if (isNumericT(t) || t === 'bool') throw new CsException('NullReferenceException', `null 을 ${t} 로 바꿀 수 없습니다`); return null; }
      if (isNumericT(t)) {
        if (typeof v === 'boolean' || typeof v === 'string') throw new CsException('InvalidCastException', `${describeVal(v)} 을(를) ${t} 로 형변환할 수 없습니다${typeof v === 'string' ? ' — int.Parse() 또는 double.Parse() 를 쓰세요' : ''}`);
        if (v && typeof v === 'object' && !(v instanceof CsChar) && !(v instanceof CsEnumVal)) {
          if (v.__cls && v.__cls.conversions) { const c = v.__cls.conversions.find((x) => normType(x.retType.str) === t); if (c) return this.callUser(c, null, [v], e); }
          const desc = this.descOf(v);
          if (desc && desc.convertTo) { const r = desc.convertTo(v, t, this); if (r !== undefined) return r; }
          throw new CsException('InvalidCastException', `${describeVal(v)} 을(를) ${t} 로 형변환할 수 없습니다`);
        }
        const n = toNum(v, t, this);
        if (t === 'char') return new CsChar(Math.trunc(n) & 0xffff);
        if (isIntegral(t) && !Number.isFinite(n)) return 0;
        return coerce(Number.isFinite(n) && isIntegral(t) ? Math.trunc(n) : n, t, this, true);
      }
      if (t === 'string') { if (typeof v === 'string') return v; throw new CsException('InvalidCastException', `${describeVal(v)} 을(를) string 으로 형변환할 수 없습니다 — .ToString() 을 쓰세요`); }
      if (t === 'bool') { if (typeof v === 'boolean') return v; throw new CsException('InvalidCastException', `${describeVal(v)} 을(를) bool 로 형변환할 수 없습니다`); }
      if (t === 'object') return v;
      const desc = this.types.get(baseName(t));
      if (desc && desc.kind === 'enum') { if (v instanceof CsEnumVal) return new CsEnumVal(desc, v.value); if (typeof v === 'number') return new CsEnumVal(desc, v); }
      if (desc && desc.user && v && v.__cls) { for (let d = v.__cls; d; d = d.baseDesc) if (d === desc) return v; if (desc.conversions) { const c = desc.conversions.find((x) => normType(x.retType.str) === t); if (c) return this.callUser(c, null, [v], e); } throw new CsException('InvalidCastException', `${v.__cls.name} 을(를) ${t} 로 형변환할 수 없습니다`); }
      if (v && v.__cls && v.__cls.conversions) { const c = v.__cls.conversions.find((x) => normType(x.retType.str) === t); if (c) return this.callUser(c, null, [v], e); }
      if (desc && desc.convertFrom) { const r = desc.convertFrom(v, this, true); if (r !== undefined) return r; }
      if (this.isType(v, t) || isArrayT(t) || /^(I[A-Z]|Func|Action|List|Dictionary)/.test(baseName(t))) return v;
      if (desc && desc.isInstance && !desc.isInstance(v)) throw new CsException('InvalidCastException', `${describeVal(v)} 을(를) ${t} 로 형변환할 수 없습니다`);
      return v;
    }

    // ---------------------------------------------------------------- 정적 형식 추론 (나눗셈 · 서식용)
    typeOf(e, scope) {
      if (!e) return null;
      if (e.__t !== undefined && e.__tStable) return e.__t;
      let t = null;
      try { t = this.inferType(e, scope); } catch (err) { t = null; }
      if (t) t = normType(t);
      e.__t = t;
      // 변수 형식은 선언 위치가 고정이므로 캐시 가능. 이름이 아닌 리터럴 · 형변환 등도 안정적.
      e.__tStable = e.kind === 'Literal' || e.kind === 'Cast' || e.kind === 'Interp' || e.kind === 'New' || e.kind === 'NewArray' || (t != null && e.kind !== 'Call' && e.kind !== 'Member' && e.kind !== 'Index');
      return t;
    }
    inferType(e, scope) {
      switch (e.kind) {
        case 'Literal': return e.t === 'null' ? null : e.t;
        case 'Paren': return this.typeOf(e.expr, scope);
        case 'Name': {
          const slot = scope.lookup(e.name);
          if (slot) return slot.t;
          const fr = scope.frame;
          const obj = fr && fr.thisObj;
          for (let d = (obj && obj.__cls) || (fr && fr.cls); d; d = d.baseDesc) {
            const f = d.fields.find((x) => x.name === e.name); if (f) return f.type && f.type.str;
            const p = d.propDecls.get(e.name); if (p) return p.type && p.type.str;
            const st = d.statics[e.name]; if (st && st.t) return st.t;
          }
          return null;
        }
        case 'Cast': return e.type.str;
        case 'Interp': return 'string';
        case 'New': return e.type ? e.type.str : null;
        case 'NewArray': return e.elemType ? e.elemType.str + '[' + ','.repeat(Math.max(0, (e.rank || 1) - 1)) + ']' : null;
        case 'Cond': return this.typeOf(e.a, scope) || this.typeOf(e.b, scope);
        case 'Unary': { const t = this.typeOf(e.expr, scope); if (e.op === '!') return 'bool'; if (t && RANK[t] === 1) return 'int'; return t; }
        case 'PreInc': case 'PostInc': return this.typeOf(e.expr, scope);
        case 'Assign': return this.typeOf(e.target, scope);
        case 'Is': return 'bool';
        case 'As': return e.type.str;
        case 'Default': return e.type ? e.type.str : null;
        case 'Binary': {
          const op = e.op;
          if (['==', '!=', '<', '>', '<=', '>=', '&&', '||'].includes(op)) return 'bool';
          const a = this.typeOf(e.l, scope), b = this.typeOf(e.r, scope);
          if (op === '+' && (a === 'string' || b === 'string')) return 'string';
          if (op === '??') return a || b;
          if (op === '<<' || op === '>>') return a && RANK[a] <= 1 ? 'int' : a;
          if (a === 'bool' && b === 'bool') return 'bool';
          if (a && b && (!isNumericT(a) || !isNumericT(b))) { const da = this.types.get(baseName(a)); if (da && da.kind === 'enum') return a; const db = this.types.get(baseName(b)); if (db && db.kind === 'enum') return b; return a; }
          return promote(a, b);
        }
        case 'Index': {
          const t = this.typeOf(e.obj, scope);
          if (!t) return null;
          if (t === 'string') return 'char';
          if (isArrayT(t)) return elemT(t);
          const desc = this.types.get(baseName(t));
          if (desc && desc.indexer && desc.indexer.t) return typeof desc.indexer.t === 'function' ? desc.indexer.t(genericArgs(t)) : desc.indexer.t;
          if (/^List</.test(t) || /^IList</.test(t)) return genericArgs(t)[0];
          if (/^Dictionary</.test(t)) return genericArgs(t)[1];
          return null;
        }
        case 'Member': {
          if (e.name === 'Length' || e.name === 'Count') return 'int';
          if (e.obj.kind === 'Name' && !scope.lookup(e.obj.name)) {
            const desc = this.types.get(e.obj.name);
            if (desc) { const st = desc.statics[e.name]; if (st) return st.t || (st.ret && typeof st.ret === 'string' ? st.ret : null) || null; if (desc.kind === 'enum') return desc.name; }
          }
          const ot = this.typeOf(e.obj, scope);
          if ((!ot || ot === 'object') && e.obj.kind === 'Name') {
            // 익명 형식 변수(var x = new { … }, 람다 매개 변수 c => c.Area): 생성할 때 기록한 필드 형식
            const slot = scope.lookup(e.obj.name);
            const v = slot && (slot.ref ? slot.ref.get() : slot.v);
            if (v && v.__anon && v.__types) return v.__types[e.name] || null;
          }
          if (ot && ot[0] === '(') {
            // 이름 있는 튜플 형식 "(int k, double a)" → 필드 형식 (ItemN 도)
            const parts = tupleParts(ot);
            const m = /^Item(\d+)$/.exec(e.name);
            const hit = m ? parts[+m[1] - 1] : parts.find((p) => p.name === e.name);
            return hit ? hit.type : null;
          }
          if (ot) {
            const desc = this.types.get(baseName(ot));
            if (desc) {
              if (desc.user) { for (let d = desc; d; d = d.baseDesc) { const f = d.fields.find((x) => x.name === e.name); if (f) return f.type && f.type.str; const p = d.propDecls.get(e.name); if (p) return p.type && p.type.str; } }
              const p = desc.props[e.name]; if (p && p.t) return typeof p.t === 'function' ? p.t(genericArgs(ot)) : p.t;
            }
            if (ot === 'Tuple' || /^\(/.test(ot)) return null;
          }
          return null;
        }
        case 'Call': {
          const c = e.callee;
          const typeArgs = (e.typeArgs || c.typeArgs || []).map((t) => normType(t.str));
          if (c.kind === 'Name') {
            const fr = scope.frame;
            for (let d = (fr && fr.thisObj && fr.thisObj.__cls) || (fr && fr.cls); d; d = d.baseDesc) { const l = d.methodsByName.get(c.name); if (l) return l[0].retType ? l[0].retType.str : null; }
            const slot = scope.lookup(c.name); if (slot && slot.v instanceof CsFunc && slot.v.retType) return slot.v.retType;
            for (const d of this.usingStatic) { const st = d.statics[c.name]; if (st && st.ret) return this.retType(st.ret, typeArgs, e, scope); }
            return null;
          }
          if (c.kind === 'Member') {
            const argTypes = () => e.args.map((a) => this.typeOf(a.expr, scope));
            if (c.obj.kind === 'Name' && !scope.lookup(c.obj.name)) {
              const desc = this.types.get(c.obj.name);
              if (desc) { const st = desc.statics[c.name]; if (st && st.method) return st.method[0].retType ? st.method[0].retType.str : null; if (st && st.ret) return this.retType(st.ret, typeArgs, e, scope, argTypes); }
              if (desc && desc.kind === 'enum') return null;
            }
            const ot = this.typeOf(c.obj, scope);
            const desc = ot ? this.types.get(baseName(ot)) : null;
            if (desc && desc.user) { for (let d = desc; d; d = d.baseDesc) { const l = d.methodsByName.get(c.name); if (l) return l[0].retType ? l[0].retType.str : null; } }
            if (desc && desc.methods[c.name]) return this.retType(desc.methods[c.name].ret, typeArgs, e, scope, argTypes, ot);
            if (ot === 'string' || isArrayT(ot) || /^(List|IEnumerable|HashSet|Queue|Stack|Dictionary)</.test(ot || '')) {
              const ext = this.extensions.get(c.name);
              if (ext && ext[0].ret) return this.retType(ext[0].ret, typeArgs, e, scope, argTypes, ot);
            }
            if (c.name === 'ToString') return 'string';
            if (c.name === 'Count' || c.name === 'IndexOf' || c.name === 'CompareTo') return 'int';
            const ext = this.extensions.get(c.name);
            if (ext && ext[0].ret && typeof ext[0].ret === 'string') return ext[0].ret;
            return null;
          }
          return null;
        }
        case 'Lambda': return 'delegate';
        case 'SwitchExpr': return e.arms.length ? this.typeOf(e.arms[0].value, scope) : null;
        case 'Tuple': return 'Tuple';
        default: return null;
      }
    }
    retType(ret, typeArgs, e, scope, argTypes, ownerType) {
      if (!ret) return null;
      if (typeof ret === 'string') return ret;
      if (typeof ret === 'function') return ret(typeArgs, argTypes ? argTypes() : [], ownerType ? genericArgs(ownerType) : [], ownerType);
      return null;
    }
  }

  const api = { Interpreter, CsChar, CsEnumVal, CsTuple, CsFunc, CsException, Ref, Scope, Signal, StopSignal, ExitSignal, coerce, fmt, formatNumber, formatValue, compositeFormat, csEquals, keyOf, runtimeType, describeVal, isNumericT, isIntegral, promote, baseName, elemT, genericArgs, normType, truthy, toNum, numToString, defaultMessage, excIsA, EXC_BASES };
  root.CsRuntime = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
