/* C# 표준 라이브러리(System · System.Collections.Generic · System.Linq · System.Text · System.IO 일부) — 인터프리터용 구현 */
(function (root) {
  'use strict';
  const R = root.CsRuntime || (typeof require === 'function' ? require('./cs-runtime.js') : null);
  const { CsChar, CsEnumVal, CsTuple, CsFunc, CsException, Ref, coerce, fmt, formatNumber, formatValue, compositeFormat, csEquals, keyOf, runtimeType, describeVal, isNumericT, isIntegral, promote, baseName, elemT, genericArgs, normType, truthy, toNum } = R;

  const arr = (items, elem) => { const a = Array.isArray(items) ? items : Array.from(items); a.__elem = elem || 'object'; return a; };
  const num = (v, what) => { if (typeof v === 'number') return v; if (v instanceof CsChar || v instanceof CsEnumVal) return v.valueOf(); throw new CsException('ArgumentException', `${what || '인수'}는 숫자여야 합니다 (${describeVal(v)})`); };
  const str = (v) => (typeof v === 'string' ? v : fmt(v));
  const chr = (v) => (v instanceof CsChar ? v : typeof v === 'string' && v.length === 1 ? new CsChar(v.charCodeAt(0)) : typeof v === 'number' ? new CsChar(v) : (() => { throw new CsException('ArgumentException', '문자(char)가 필요합니다'); })());
  const fn = (interp, f) => interp.toJsFunc(f);
  const argErr = (m) => { throw new CsException('ArgumentException', m); };
  const seq = (interp, v, what) => { if (v == null) throw new CsException('ArgumentNullException', `${what || 'source'} 가 null 입니다`); if (Array.isArray(v)) return v; if (typeof v === 'string') return Array.from(v, (c) => new CsChar(c.charCodeAt(0))); if (v && typeof v.csIter === 'function') return v.csIter(); return interp.iterate(v); };
  const elemOf = (v) => (Array.isArray(v) ? v.__elem : typeof v === 'string' ? 'char' : v && v.__elem) || null;
  const cmp = (a, b) => { if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : a > b ? 1 : 0; const x = a instanceof CsChar || a instanceof CsEnumVal ? a.valueOf() : a, y = b instanceof CsChar || b instanceof CsEnumVal ? b.valueOf() : b; if (typeof x === 'number' && typeof y === 'number') return x - y; if (a instanceof CsTuple && b instanceof CsTuple) { for (let i = 0; i < a.items.length; i++) { const c = cmp(a.items[i], b.items[i]); if (c) return c; } return 0; } if (x == null) return y == null ? 0 : -1; if (y == null) return 1; return String(x) < String(y) ? -1 : String(x) > String(y) ? 1 : 0; };
  const userCmp = (interp, a, b) => { if (a && a.__cls) { const m = interp.findUserMethod(a.__cls, 'CompareTo'); if (m) return interp.callUser(m, a, [b]); } return cmp(a, b); };
  const stableSort = (items, c) => items.map((v, i) => [v, i]).sort((x, y) => c(x[0], y[0]) || x[1] - y[1]).map((x) => x[0]);

  // ================================================================== 컬렉션 클래스
  class CsList {
    constructor(elem, items) { this.items = items || []; this.__elem = elem || 'object'; }
    csIter() { return this.items; }
    csCount() { return this.items.length; }
    csToString() { return `System.Collections.Generic.List\`1[${this.__elem}]`; }
    check(i) { if (!Number.isInteger(i) || i < 0 || i >= this.items.length) throw new CsException('ArgumentOutOfRangeException', `Index was out of range. Must be non-negative and less than the size of the collection. (인덱스 ${i}, Count ${this.items.length})`); }
  }
  class CsDict {
    constructor(kt, vt) { this.map = new Map(); this.__kt = kt || 'object'; this.__vt = vt || 'object'; this.__elem = `KeyValuePair<${this.__kt},${this.__vt}>`; }
    csIter() { return [...this.map.values()].map((e) => new CsKvp(e.k, e.v)); }
    csCount() { return this.map.size; }
    get(k) { const e = this.map.get(keyOf(k)); if (!e) throw new CsException('KeyNotFoundException', `The given key '${fmt(k)}' was not present in the dictionary.`); return e.v; }
    set(k, v, interp) { if (k == null) throw new CsException('ArgumentNullException', '키가 null 입니다'); this.map.set(keyOf(k), { k: coerce(k, this.__kt, interp), v: coerce(v, this.__vt, interp) }); }
    has(k) { return this.map.has(keyOf(k)); }
    csToString() { return `System.Collections.Generic.Dictionary\`2[${this.__kt},${this.__vt}]`; }
  }
  class CsKvp { constructor(k, v) { this.Key = k; this.Value = v; } csToString() { return `[${fmt(this.Key)}, ${fmt(this.Value)}]`; } csDeconstruct() { return [this.Key, this.Value]; } csKey() { return keyOf(this.Key) + '|' + keyOf(this.Value); } }
  class CsSet { constructor(elem) { this.map = new Map(); this.__elem = elem || 'object'; } csIter() { return [...this.map.values()]; } csCount() { return this.map.size; } csToString() { return `System.Collections.Generic.HashSet\`1[${this.__elem}]`; } }
  class CsQueue { constructor(elem) { this.items = []; this.__elem = elem || 'object'; } csIter() { return this.items; } csCount() { return this.items.length; } }
  class CsStack { constructor(elem) { this.items = []; this.__elem = elem || 'object'; } csIter() { return this.items.slice().reverse(); } csCount() { return this.items.length; } }
  class CsGrouping { constructor(key, items) { this.Key = key; this.items = items; } csIter() { return this.items; } csCount() { return this.items.length; } }
  class CsStringBuilder { constructor(s) { this.s = s || ''; } csToString() { return this.s; } }
  class CsRandom {
    constructor(seed) { this.seed = seed == null ? (Date.now() & 0x7fffffff) : seed; let s = (this.seed >>> 0) || 1; this.next32 = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s; }; for (let i = 0; i < 4; i++) this.next32(); }
    nextDouble() { return this.next32() / 4294967296; }
    csToString() { return 'System.Random'; }
  }
  class CsStopwatch { constructor() { this.acc = 0; this.start = 0; this.running = false; } elapsed() { return this.acc + (this.running ? now() - this.start : 0); } csToString() { return 'System.Diagnostics.Stopwatch'; } }
  class CsTimeSpan { constructor(ms) { this.ms = ms; } csToString() { const ms = Math.abs(this.ms); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60, f = Math.round((ms % 1000) * 10000); return `${this.ms < 0 ? '-' : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${f ? '.' + String(f).padStart(7, '0') : ''}`; } csKey() { return this.ms; } csEquals(o) { return o instanceof CsTimeSpan && o.ms === this.ms; } }
  class CsDateTime {
    constructor(d) { this.d = d; }
    csToString() { return this.csFormat('yyyy-MM-dd HH:mm:ss'); }
    csFormat(f) {
      const d = this.d, p = (n, w = 2) => String(n).padStart(w, '0');
      return f.replace(/yyyy|MM|dd|HH|hh|mm|ss|fff|tt|yy|M|d|H|h|m|s/g, (m) => ({ yyyy: d.getFullYear(), yy: p(d.getFullYear() % 100), MM: p(d.getMonth() + 1), M: d.getMonth() + 1, dd: p(d.getDate()), d: d.getDate(), HH: p(d.getHours()), H: d.getHours(), hh: p(d.getHours() % 12 || 12), h: d.getHours() % 12 || 12, mm: p(d.getMinutes()), m: d.getMinutes(), ss: p(d.getSeconds()), s: d.getSeconds(), fff: p(d.getMilliseconds(), 3), tt: d.getHours() < 12 ? 'AM' : 'PM' }[m]));
    }
  }
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  // ================================================================== 설치
  function install(interp) {
    const T = (d) => interp.defType(d);
    const method = (f, ret) => ({ fn: f, ret: ret || null });
    const prop = (t, get, set) => ({ t, get, set });
    const sfn = (f, ret) => ({ fn: (i, args, typeArgs, node, rawArgs) => f(i, args, typeArgs, node, rawArgs), ret: ret || null });
    const sval = (t, get, set) => ({ t, get, set });

    // ---------------------------------------------------------------- 문자열
    const S = T({
      name: 'string', kind: 'class', aliases: ['String'],
      isInstance: (v) => typeof v === 'string',
      indexer: { t: 'char', get: (s, idx) => { const i = num(idx[0]); if (i < 0 || i >= s.length) throw new CsException('IndexOutOfRangeException', null); return new CsChar(s.charCodeAt(i)); } },
      props: { Length: prop('int', (s) => s.length) },
      statics: {
        Empty: sval('string', () => ''),
        Format: sfn((i, a) => compositeFormat(str(a[0]), a.length === 2 && Array.isArray(a[1]) && a[1].__elem === 'object' ? a[1] : a.slice(1), i), 'string'),
        Join: sfn((i, a) => { const sep = str(a[0]); const items = a.length === 2 && (Array.isArray(a[1]) || (a[1] && a[1].csIter)) ? seq(i, a[1]) : a.slice(1); return items.map((x) => fmt(x)).join(sep); }, 'string'),
        Concat: sfn((i, a) => (a.length === 1 && (Array.isArray(a[0]) || (a[0] && a[0].csIter)) ? seq(i, a[0]) : a).map((x) => fmt(x)).join(''), 'string'),
        IsNullOrEmpty: sfn((i, a) => a[0] == null || a[0] === '', 'bool'),
        IsNullOrWhiteSpace: sfn((i, a) => a[0] == null || /^\s*$/.test(a[0]), 'bool'),
        Compare: sfn((i, a) => { let x = str(a[0]), y = str(a[1]); if (a[2] === true) { x = x.toLowerCase(); y = y.toLowerCase(); } return cmp(x, y) < 0 ? -1 : cmp(x, y) > 0 ? 1 : 0; }, 'int'),
        Equals: sfn((i, a) => a[0] === a[1], 'bool'),
        Copy: sfn((i, a) => str(a[0]), 'string')
      },
      methods: {
        Substring: method((i, s, a) => { const st = num(a[0]); if (st < 0 || st > s.length) throw new CsException('ArgumentOutOfRangeException', 'startIndex cannot be larger than length of string.'); if (a.length > 1) { const len = num(a[1]); if (len < 0 || st + len > s.length) throw new CsException('ArgumentOutOfRangeException', 'Index and length must refer to a location within the string.'); return s.substr(st, len); } return s.slice(st); }, 'string'),
        IndexOf: method((i, s, a) => s.indexOf(str(a[0]), a.length > 1 && typeof a[1] === 'number' ? a[1] : 0), 'int'),
        LastIndexOf: method((i, s, a) => s.lastIndexOf(str(a[0])), 'int'),
        IndexOfAny: method((i, s, a) => { const cs = a[0].map(str); for (let k = 0; k < s.length; k++) if (cs.includes(s[k])) return k; return -1; }, 'int'),
        Contains: method((i, s, a) => s.includes(str(a[0])), 'bool'),
        StartsWith: method((i, s, a) => s.startsWith(str(a[0])), 'bool'),
        EndsWith: method((i, s, a) => s.endsWith(str(a[0])), 'bool'),
        Replace: method((i, s, a) => s.split(str(a[0])).join(str(a[1])), 'string'),
        Split: method((i, s, a) => {
          let seps = [], opts = 0, count = null;
          for (const x of a) { if (typeof x === 'string') seps.push(x); else if (x instanceof CsChar) seps.push(x.toString()); else if (Array.isArray(x)) seps.push(...x.map((c) => str(c))); else if (x instanceof CsEnumVal) opts = x.value; else if (typeof x === 'number') count = x; }
          let parts;
          if (!seps.length || (seps.length === 1 && seps[0] === '')) parts = s.split(/\s+/);
          else { const re = new RegExp(seps.map((q) => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')); parts = s.split(re); }
          if (opts & 1) parts = parts.filter((p) => p !== '');
          if (opts & 2) parts = parts.map((p) => p.trim()).filter((p) => !(opts & 1) || p !== '');
          if (count != null && parts.length > count) parts = parts.slice(0, count - 1).concat([parts.slice(count - 1).join(seps[0] || ' ')]);
          return arr(parts, 'string');
        }, 'string[]'),
        Trim: method((i, s, a) => (a.length ? trimChars(s, a, 3) : s.trim()), 'string'),
        TrimStart: method((i, s, a) => (a.length ? trimChars(s, a, 1) : s.replace(/^\s+/, '')), 'string'),
        TrimEnd: method((i, s, a) => (a.length ? trimChars(s, a, 2) : s.replace(/\s+$/, '')), 'string'),
        ToUpper: method((i, s) => s.toUpperCase(), 'string'), ToLower: method((i, s) => s.toLowerCase(), 'string'),
        ToUpperInvariant: method((i, s) => s.toUpperCase(), 'string'), ToLowerInvariant: method((i, s) => s.toLowerCase(), 'string'),
        PadLeft: method((i, s, a) => s.padStart(num(a[0]), a.length > 1 ? str(a[1]) : ' '), 'string'),
        PadRight: method((i, s, a) => s.padEnd(num(a[0]), a.length > 1 ? str(a[1]) : ' '), 'string'),
        ToCharArray: method((i, s) => arr(Array.from(s, (c) => new CsChar(c.charCodeAt(0))), 'char'), 'char[]'),
        Insert: method((i, s, a) => s.slice(0, num(a[0])) + str(a[1]) + s.slice(num(a[0])), 'string'),
        Remove: method((i, s, a) => (a.length > 1 ? s.slice(0, num(a[0])) + s.slice(num(a[0]) + num(a[1])) : s.slice(0, num(a[0]))), 'string'),
        Equals: method((i, s, a) => (a.length > 1 && a[1] instanceof CsEnumVal && a[1].value >= 3 ? s.toLowerCase() === str(a[0]).toLowerCase() : s === a[0]), 'bool'),
        CompareTo: method((i, s, a) => cmp(s, str(a[0])), 'int'),
        ToString: method((i, s) => s, 'string'),
        GetHashCode: method((i, s) => { let h = 0; for (let k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) | 0; return h; }, 'int'),
        Clone: method((i, s) => s, 'string')
      }
    });
    function trimChars(s, a, mode) { const cs = a.flatMap((x) => (Array.isArray(x) ? x : [x])).map(str); let st = 0, en = s.length; if (mode & 1) while (st < en && cs.includes(s[st])) st++; if (mode & 2) while (en > st && cs.includes(s[en - 1])) en--; return s.slice(st, en); }

    // ---------------------------------------------------------------- 숫자 형식들
    const parseNum = (s, t, node) => {
      if (s == null) throw new CsException('ArgumentNullException', 'Value cannot be null.');
      const txt = str(s).trim().replace(/,/g, '');
      const isInt = isIntegral(t);
      const re = isInt ? /^[+-]?\d+$/ : /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
      if (!re.test(txt)) { if (!isInt && /^(NaN|[+-]?Infinity|∞)$/.test(txt)) return txt === 'NaN' ? NaN : txt.startsWith('-') ? -Infinity : Infinity; throw new CsException('FormatException', `The input string '${str(s)}' was not in a correct format.`); }
      const v = isInt ? parseInt(txt, 10) : parseFloat(txt);
      if (isInt) { const lim = { int: [-2147483648, 2147483647], byte: [0, 255], sbyte: [-128, 127], short: [-32768, 32767], ushort: [0, 65535], uint: [0, 4294967295], long: [-9223372036854775808, 9223372036854775807], ulong: [0, 18446744073709551615] }[t]; if (lim && (v < lim[0] || v > lim[1])) throw new CsException('OverflowException', `Value was either too large or too small for ${t}.`); }
      return coerce(v, t, interp);
    };
    const numType = (name, alias, min, max, extra) => T(Object.assign({
      name, kind: 'struct', aliases: alias ? [alias] : [], isInstance: (v) => typeof v === 'number',
      statics: Object.assign({
        MaxValue: sval(name, () => max), MinValue: sval(name, () => min),
        Parse: sfn((i, a) => parseNum(a[0], name), name),
        TryParse: sfn((i, a) => { const ref = a[a.length - 1]; if (!(ref instanceof Ref)) argErr('TryParse 의 두 번째 인수는 out 변수여야 합니다'); try { ref.set(parseNum(a[0], name)); return true; } catch (e) { ref.set(0); return false; } }, 'bool')
      }, extra && extra.statics || {}),
      methods: Object.assign({
        ToString: method((i, v, a, ta, node) => (a.length && a[0] != null ? formatNumber(v, str(a[0]), name) : R.numToString(v, name)), 'string'),
        CompareTo: method((i, v, a) => (v < num(a[0]) ? -1 : v > num(a[0]) ? 1 : 0), 'int'),
        Equals: method((i, v, a) => v === a[0], 'bool'),
        GetHashCode: method((i, v) => (Number.isInteger(v) ? v | 0 : Math.floor(v * 1000003) | 0), 'int')
      }, extra && extra.methods || {})
    }));
    numType('int', 'Int32', -2147483648, 2147483647);
    numType('long', 'Int64', -9223372036854775808, 9223372036854775807);
    numType('short', 'Int16', -32768, 32767); numType('ushort', 'UInt16', 0, 65535);
    numType('byte', 'Byte', 0, 255); numType('sbyte', 'SByte', -128, 127);
    numType('uint', 'UInt32', 0, 4294967295); numType('ulong', 'UInt64', 0, 18446744073709551615);
    const realStatics = (nm) => ({ statics: { NaN: sval(nm, () => NaN), PositiveInfinity: sval(nm, () => Infinity), NegativeInfinity: sval(nm, () => -Infinity), Epsilon: sval(nm, () => nm === 'float' ? 1.401298E-45 : 4.94065645841247E-324), IsNaN: sfn((i, a) => Number.isNaN(a[0]), 'bool'), IsInfinity: sfn((i, a) => !Number.isFinite(a[0]) && !Number.isNaN(a[0]), 'bool'), IsFinite: sfn((i, a) => Number.isFinite(a[0]), 'bool'), Round: sfn((i, a) => mathRound(a), nm), Abs: sfn((i, a) => Math.abs(a[0]), nm), Sqrt: sfn((i, a) => Math.sqrt(a[0]), nm), Pow: sfn((i, a) => Math.pow(a[0], a[1]), nm), Max: sfn((i, a) => Math.max(a[0], a[1]), nm), Min: sfn((i, a) => Math.min(a[0], a[1]), nm), Floor: sfn((i, a) => Math.floor(a[0]), nm), Ceiling: sfn((i, a) => Math.ceil(a[0]), nm) } });
    numType('double', 'Double', -1.7976931348623157E+308, 1.7976931348623157E+308, realStatics('double'));
    numType('float', 'Single', -3.4028235E+38, 3.4028235E+38, realStatics('float'));
    numType('decimal', 'Decimal', -7.9e28, 7.9e28);

    T({
      name: 'bool', kind: 'struct', aliases: ['Boolean'], isInstance: (v) => typeof v === 'boolean',
      statics: { TrueString: sval('string', () => 'True'), FalseString: sval('string', () => 'False'), Parse: sfn((i, a) => { const s = str(a[0]).trim().toLowerCase(); if (s === 'true') return true; if (s === 'false') return false; throw new CsException('FormatException', `String '${str(a[0])}' was not recognized as a valid Boolean.`); }, 'bool'), TryParse: sfn((i, a) => { const s = str(a[0]).trim().toLowerCase(); const ok = s === 'true' || s === 'false'; a[1].set(s === 'true'); return ok; }, 'bool') },
      methods: { ToString: method((i, v) => (v ? 'True' : 'False'), 'string'), CompareTo: method((i, v, a) => (v === a[0] ? 0 : v ? 1 : -1), 'int'), Equals: method((i, v, a) => v === a[0], 'bool') }
    });
    const isLetter = (c) => /\p{L}/u.test(c);
    T({
      name: 'char', kind: 'struct', aliases: ['Char'], isInstance: (v) => v instanceof CsChar,
      statics: {
        MaxValue: sval('char', () => new CsChar(0xffff)), MinValue: sval('char', () => new CsChar(0)),
        IsDigit: sfn((i, a) => /\d/.test(charAt(a)), 'bool'), IsLetter: sfn((i, a) => isLetter(charAt(a)), 'bool'), IsLetterOrDigit: sfn((i, a) => /[\p{L}\d]/u.test(charAt(a)), 'bool'),
        IsWhiteSpace: sfn((i, a) => /\s/.test(charAt(a)), 'bool'), IsUpper: sfn((i, a) => { const c = charAt(a); return c !== c.toLowerCase() && c === c.toUpperCase(); }, 'bool'), IsLower: sfn((i, a) => { const c = charAt(a); return c !== c.toUpperCase() && c === c.toLowerCase(); }, 'bool'),
        IsPunctuation: sfn((i, a) => /[\p{P}]/u.test(charAt(a)), 'bool'), IsSymbol: sfn((i, a) => /[\p{S}]/u.test(charAt(a)), 'bool'), IsNumber: sfn((i, a) => /\p{N}/u.test(charAt(a)), 'bool'), IsControl: sfn((i, a) => /[\x00-\x1f\x7f]/.test(charAt(a)), 'bool'),
        ToUpper: sfn((i, a) => new CsChar(charAt(a).toUpperCase().charCodeAt(0)), 'char'), ToLower: sfn((i, a) => new CsChar(charAt(a).toLowerCase().charCodeAt(0)), 'char'),
        GetNumericValue: sfn((i, a) => { const c = charAt(a); return /\d/.test(c) ? +c : -1; }, 'double'),
        Parse: sfn((i, a) => { const s = str(a[0]); if (s.length !== 1) throw new CsException('FormatException', 'String must be exactly one character long.'); return new CsChar(s.charCodeAt(0)); }, 'char'),
        ToString: sfn((i, a) => charAt(a), 'string'), ConvertFromUtf32: sfn((i, a) => String.fromCodePoint(a[0]), 'string')
      },
      methods: { ToString: method((i, c) => c.toString(), 'string'), CompareTo: method((i, c, a) => c.code - chr(a[0]).code, 'int'), Equals: method((i, c, a) => csEquals(c, a[0]), 'bool') }
    });
    function charAt(a) { const v = a[0]; if (v instanceof CsChar) return v.toString(); if (typeof v === 'string') return a.length > 1 ? v[num(a[1])] : v; throw new CsException('ArgumentException', '문자(char)가 필요합니다'); }

    // ---------------------------------------------------------------- Math
    function mathRound(a) {
      const v = num(a[0]);
      let digits = 0, mode = 0; // 0 = ToEven(기본), 1 = AwayFromZero
      for (let k = 1; k < a.length; k++) { if (typeof a[k] === 'number') digits = a[k]; else if (a[k] instanceof CsEnumVal) mode = a[k].value; }
      const f = Math.pow(10, digits);
      const x = v * f;
      const fl = Math.floor(x), diff = x - fl;
      let r;
      if (Math.abs(diff - 0.5) < 1e-9) r = mode === 1 ? (x > 0 ? fl + 1 : (fl + 1 - 1 === fl && Number.isInteger(fl) ? (fl % 2 === 0 ? fl : fl + 1) : fl)) : (fl % 2 === 0 ? fl : fl + 1);
      else r = Math.round(x);
      if (mode === 1 && Math.abs(diff - 0.5) < 1e-9) r = x >= 0 ? fl + 1 : fl;
      return r / f;
    }
    const intOrDouble = (ta, at) => (at && at.length && at.every((t) => isIntegral(t)) ? promote(at[0], at[at.length - 1] || at[0]) || 'int' : 'double');
    T({
      name: 'Math', kind: 'static',
      statics: {
        PI: sval('double', () => Math.PI), E: sval('double', () => Math.E), Tau: sval('double', () => 2 * Math.PI),
        Abs: sfn((i, a) => Math.abs(num(a[0])), (ta, at) => at[0] || 'double'), Sign: sfn((i, a) => Math.sign(num(a[0])), 'int'),
        Sqrt: sfn((i, a) => Math.sqrt(num(a[0])), 'double'), Cbrt: sfn((i, a) => Math.cbrt(num(a[0])), 'double'), Pow: sfn((i, a) => Math.pow(num(a[0]), num(a[1])), 'double'), Exp: sfn((i, a) => Math.exp(num(a[0])), 'double'),
        Log: sfn((i, a) => (a.length > 1 ? Math.log(num(a[0])) / Math.log(num(a[1])) : Math.log(num(a[0]))), 'double'), Log10: sfn((i, a) => Math.log10(num(a[0])), 'double'), Log2: sfn((i, a) => Math.log2(num(a[0])), 'double'),
        Sin: sfn((i, a) => Math.sin(num(a[0])), 'double'), Cos: sfn((i, a) => Math.cos(num(a[0])), 'double'), Tan: sfn((i, a) => Math.tan(num(a[0])), 'double'),
        Asin: sfn((i, a) => Math.asin(num(a[0])), 'double'), Acos: sfn((i, a) => Math.acos(num(a[0])), 'double'), Atan: sfn((i, a) => Math.atan(num(a[0])), 'double'), Atan2: sfn((i, a) => Math.atan2(num(a[0]), num(a[1])), 'double'),
        Sinh: sfn((i, a) => Math.sinh(num(a[0])), 'double'), Cosh: sfn((i, a) => Math.cosh(num(a[0])), 'double'), Tanh: sfn((i, a) => Math.tanh(num(a[0])), 'double'),
        Floor: sfn((i, a) => Math.floor(num(a[0])), 'double'), Ceiling: sfn((i, a) => Math.ceil(num(a[0])), 'double'), Truncate: sfn((i, a) => Math.trunc(num(a[0])), 'double'),
        Round: sfn((i, a) => mathRound(a), 'double'),
        Min: sfn((i, a) => Math.min(num(a[0]), num(a[1])), intOrDouble), Max: sfn((i, a) => Math.max(num(a[0]), num(a[1])), intOrDouble),
        Clamp: sfn((i, a) => { const v = num(a[0]), lo = num(a[1]), hi = num(a[2]); if (lo > hi) throw new CsException('ArgumentException', `'${lo}' cannot be greater than ${hi}.`); return Math.min(hi, Math.max(lo, v)); }, intOrDouble),
        DivRem: sfn((i, a) => { const q = Math.trunc(num(a[0]) / num(a[1])); if (a[2] instanceof Ref) { a[2].set(num(a[0]) - q * num(a[1])); return q; } return new CsTuple([q, num(a[0]) - q * num(a[1])], ['Quotient', 'Remainder']); }, 'int'),
        BigMul: sfn((i, a) => num(a[0]) * num(a[1]), 'long'), IEEERemainder: sfn((i, a) => num(a[0]) - num(a[1]) * Math.round(num(a[0]) / num(a[1])), 'double')
      }
    });
    T({ name: 'MathF', kind: 'static', statics: Object.assign({}, interp.types.get('Math').statics, { PI: sval('float', () => Math.fround(Math.PI)), E: sval('float', () => Math.fround(Math.E)) }) });
    interp.defEnum('MidpointRounding', { ToEven: 0, AwayFromZero: 1, ToZero: 2, ToNegativeInfinity: 3, ToPositiveInfinity: 4 });
    interp.defEnum('StringSplitOptions', { None: 0, RemoveEmptyEntries: 1, TrimEntries: 2 }, true);
    interp.defEnum('StringComparison', { CurrentCulture: 0, CurrentCultureIgnoreCase: 1, InvariantCulture: 2, InvariantCultureIgnoreCase: 3, Ordinal: 4, OrdinalIgnoreCase: 5 });

    // ---------------------------------------------------------------- Convert
    T({
      name: 'Convert', kind: 'static',
      statics: {
        ToInt32: sfn((i, a) => convertTo(a, 'int'), 'int'), ToInt64: sfn((i, a) => convertTo(a, 'long'), 'long'), ToInt16: sfn((i, a) => convertTo(a, 'short'), 'short'),
        ToByte: sfn((i, a) => convertTo(a, 'byte'), 'byte'), ToDouble: sfn((i, a) => convertTo(a, 'double'), 'double'), ToSingle: sfn((i, a) => convertTo(a, 'float'), 'float'), ToDecimal: sfn((i, a) => convertTo(a, 'decimal'), 'decimal'),
        ToBoolean: sfn((i, a) => (typeof a[0] === 'boolean' ? a[0] : typeof a[0] === 'number' ? a[0] !== 0 : /^true$/i.test(str(a[0]).trim())), 'bool'),
        ToChar: sfn((i, a) => chr(typeof a[0] === 'string' ? a[0] : num(a[0])), 'char'),
        ToString: sfn((i, a) => (a.length > 1 && typeof a[1] === 'number' && typeof a[0] === 'number' ? Math.trunc(a[0]).toString(a[1]) : fmt(a[0])), 'string'),
        ToHexString: sfn((i, a) => a[0].map((b) => num(b).toString(16).padStart(2, '0').toUpperCase()).join(''), 'string')
      }
    });
    function convertTo(a, t) {
      const v = a[0];
      if (v == null) return 0;
      if (typeof v === 'string') { if (a.length > 1 && typeof a[1] === 'number') return coerce(parseInt(v, a[1]), t, interp); return parseNum(v, t); }
      if (typeof v === 'boolean') return v ? 1 : 0;
      if (typeof v === 'number') { if (isIntegral(t)) { const r = mathRound([v]); const lim = { int: 2147483647, byte: 255, short: 32767 }[t]; if (lim && Math.abs(r) > lim && !(t === 'byte' && r >= 0 && r <= 255)) throw new CsException('OverflowException', `Value was either too large or too small for ${t}.`); return coerce(r, t, interp); } return coerce(v, t, interp); }
      return coerce(toNum(v, t, interp), t, interp);
    }

    // ---------------------------------------------------------------- Console
    let stdoutType = null;
    const write = (i, text) => i.host.write('o', text);
    T({
      name: 'Console', kind: 'static',
      statics: {
        WriteLine: sfn((i, a, ta, node, raw) => { write(i, consoleText(i, a, raw) + '\n'); }, 'void'),
        Write: sfn((i, a, ta, node, raw) => { write(i, consoleText(i, a, raw)); }, 'void'),
        ReadLine: sfn((i) => { const s = i.host.readLine ? i.host.readLine() : null; return s == null ? null : s.replace(/\r?\n$/, ''); }, 'string'),
        Read: sfn((i) => { const s = i.host.readLine ? i.host.readLine() : null; return s == null || !s.length ? -1 : s.charCodeAt(0); }, 'int'),
        ReadKey: sfn((i) => { const s = i.host.readLine ? i.host.readLine() : ''; const ch = s && s.length ? s[0] : '\n'; return { __csTypeName: 'ConsoleKeyInfo', KeyChar: new CsChar(ch.charCodeAt(0)), Key: ch, csToString: () => 'ConsoleKeyInfo' }; }, 'ConsoleKeyInfo'),
        Clear: sfn((i) => { if (i.host.clear) i.host.clear(); }, 'void'), Beep: sfn(() => {}, 'void'), ResetColor: sfn(() => {}, 'void'),
        ForegroundColor: sval('ConsoleColor', () => new CsEnumVal(interp.types.get('ConsoleColor'), 7), () => {}), BackgroundColor: sval('ConsoleColor', () => new CsEnumVal(interp.types.get('ConsoleColor'), 0), () => {}),
        Title: sval('string', () => '', () => {}), OutputEncoding: sval('object', () => null, () => {}), InputEncoding: sval('object', () => null, () => {}), CursorVisible: sval('bool', () => true, () => {}),
        SetCursorPosition: sfn(() => {}, 'void'),
        Out: sval('TextWriter', () => ({ Flush: () => {}, csToString: () => 'TextWriter' })),
        Error: sval('TextWriter', () => ({ __err: true, csToString: () => 'TextWriter' })),
        In: sval('TextReader', () => ({ __in: true, csToString: () => 'TextReader' }))
      }
    });
    T({ name: 'ConsoleKeyInfo', kind: 'struct', isInstance: (v) => v && v.__csTypeName === 'ConsoleKeyInfo', props: { KeyChar: prop('char', (k) => k.KeyChar), Key: prop('string', (k) => k.Key) } });
    T({ name: 'TextWriter', kind: 'class', isInstance: (v) => v && (v.__err || v.Flush), methods: { WriteLine: method((i, o, a, ta, node, raw) => i.host.write(o.__err ? 'e' : 'o', consoleText(i, a, raw) + '\n')), Write: method((i, o, a, ta, node, raw) => i.host.write(o.__err ? 'e' : 'o', consoleText(i, a, raw))), Flush: method(() => {}) } });
    T({ name: 'TextReader', kind: 'class', isInstance: (v) => v && v.__in, methods: { ReadLine: method((i) => { const s = i.host.readLine ? i.host.readLine() : null; return s == null ? null : s.replace(/\r?\n$/, ''); }, 'string'), ReadToEnd: method((i) => { let out = '', s; while ((s = i.host.readLine && i.host.readLine()) != null) out += s; return out; }, 'string') } });
    interp.defEnum('ConsoleColor', { Black: 0, DarkBlue: 1, DarkGreen: 2, DarkCyan: 3, DarkRed: 4, DarkMagenta: 5, DarkYellow: 6, Gray: 7, DarkGray: 8, Blue: 9, Green: 10, Cyan: 11, Red: 12, Magenta: 13, Yellow: 14, White: 15 });
    function consoleText(i, a, raw) {
      if (!a.length) return '';
      if (typeof a[0] === 'string' && a.length > 1 && /\{\d/.test(a[0])) { const rest = a.length === 2 && Array.isArray(a[1]) && a[1].__elem === 'object' ? a[1] : a.slice(1); return compositeFormat(a[0], rest, i, raw ? raw.slice(1).map((x) => x.node && i.typeOf(x.node, i.__lastScope)) : null); }
      const t = raw && raw[0] && raw[0].node ? i.typeOf(raw[0].node, i.__lastScope) : null;
      if (a.length === 1) return fmt(a[0], t);
      return a.map((x) => fmt(x)).join('');
    }
    // typeOf 에 범위가 필요하므로 평가기에서 마지막 범위를 기록해 둔다 (Console 출력의 float/char 표시용)
    const origEvalCall = interp.evalCall.bind(interp);
    interp.evalCall = function (e, scope) { this.__lastScope = scope; return origEvalCall(e, scope); };

    // ---------------------------------------------------------------- 배열
    const arrayDesc = T({
      name: 'Array', kind: 'class', isInstance: (v) => Array.isArray(v),
      props: { Length: prop('int', (a) => a.length), Rank: prop('int', (a) => (a.__dims ? a.__dims.length : 1)), LongLength: prop('long', (a) => a.length), IsReadOnly: prop('bool', () => false), Count: prop('int', (a) => a.length) },
      methods: {
        GetLength: method((i, a, x) => (a.__dims ? a.__dims[num(x[0])] : (num(x[0]) === 0 ? a.length : argErr('차원 번호가 범위를 벗어났습니다'))), 'int'),
        GetUpperBound: method((i, a, x) => (a.__dims ? a.__dims[num(x[0])] - 1 : a.length - 1), 'int'), GetLowerBound: method(() => 0, 'int'),
        Clone: method((i, a) => { const c = a.slice(); c.__elem = a.__elem; if (a.__dims) c.__dims = a.__dims.slice(); return c; }, (ta, at, ga, ot) => ot || 'object[]'),
        CopyTo: method((i, a, x) => { const dst = x[0], off = x.length > 1 ? num(x[1]) : 0; if (off + a.length > dst.length) throw new CsException('ArgumentException', 'Destination array was not long enough.'); a.forEach((v, k) => { dst[off + k] = v; }); }),
        GetValue: method((i, a, x) => (a.__dims ? a[i.mdIndex(a, x)] : a[i.checkIndex(a, x[0])])), SetValue: method((i, a, x) => { if (a.__dims) a[i.mdIndex(a, x.slice(1))] = x[0]; else a[i.checkIndex(a, x[1])] = x[0]; }),
        GetEnumerator: method((i, a) => a), Initialize: method(() => {}),
        ToString: method((i, a) => fmt(a), 'string')
      },
      statics: {
        Sort: sfn((i, a) => { const list = a[0]; if (!Array.isArray(list)) argErr('Array.Sort 의 첫 인수는 배열이어야 합니다'); const c = a[1] && (typeof a[1] === 'function' || a[1] instanceof CsFunc) ? fn(i, a[1]) : null; const keysArr = a[1] && Array.isArray(a[1]) ? a[1] : null; if (keysArr) { const idx = list.map((_, k) => k); idx.sort((x, y) => userCmp(i, list[x], list[y]) || x - y); const l2 = idx.map((k) => list[k]), k2 = idx.map((k) => keysArr[k]); l2.forEach((v, k) => { list[k] = v; keysArr[k] = k2[k]; }); return; } const s = stableSort(list.slice(), c ? (x, y) => num(c(x, y)) : (x, y) => userCmp(i, x, y)); s.forEach((v, k) => { list[k] = v; }); }),
        Reverse: sfn((i, a) => { const list = a[0]; const st = a.length > 1 ? num(a[1]) : 0, len = a.length > 2 ? num(a[2]) : list.length - st; const part = list.slice(st, st + len).reverse(); part.forEach((v, k) => { list[st + k] = v; }); }),
        IndexOf: sfn((i, a) => a[0].findIndex((v) => csEquals(v, a[1], i)), 'int'), LastIndexOf: sfn((i, a) => { for (let k = a[0].length - 1; k >= 0; k--) if (csEquals(a[0][k], a[1], i)) return k; return -1; }, 'int'),
        Fill: sfn((i, a) => { const list = a[0]; const st = a.length > 2 ? num(a[2]) : 0, len = a.length > 3 ? num(a[3]) : list.length - st; for (let k = st; k < st + len; k++) list[k] = coerce(a[1], list.__elem, i); }),
        Copy: sfn((i, a) => { if (a.length === 3) { const [s, d, n] = a; for (let k = 0; k < num(n); k++) d[k] = s[k]; } else { const [s, si, d, di, n] = a; const tmp = s.slice(num(si), num(si) + num(n)); tmp.forEach((v, k) => { d[num(di) + k] = v; }); } }),
        Resize: sfn((i, a) => { const ref = a[0]; if (!(ref instanceof Ref)) argErr('Array.Resize 의 첫 인수는 ref 배열이어야 합니다'); const old = ref.get() || []; const n = num(a[1]); const na = new Array(n); const dv = i.defaultValue(old.__elem); for (let k = 0; k < n; k++) na[k] = k < old.length ? old[k] : dv; na.__elem = old.__elem; ref.set(na); }),
        Empty: sfn((i, a, ta) => arr([], ta && ta[0]), (ta) => (ta && ta[0] ? ta[0] + '[]' : 'object[]')),
        Exists: sfn((i, a) => a[0].some((v) => truthy(fn(i, a[1])(v))), 'bool'), TrueForAll: sfn((i, a) => a[0].every((v) => truthy(fn(i, a[1])(v))), 'bool'),
        Find: sfn((i, a) => { const f = fn(i, a[1]); const r = a[0].find((v) => truthy(f(v))); return r === undefined ? i.defaultValue(a[0].__elem) : r; }), FindIndex: sfn((i, a) => a[0].findIndex((v) => truthy(fn(i, a[1])(v))), 'int'),
        FindAll: sfn((i, a) => arr(a[0].filter((v) => truthy(fn(i, a[1])(v))), a[0].__elem)), FindLast: sfn((i, a) => { const f = fn(i, a[1]); for (let k = a[0].length - 1; k >= 0; k--) if (truthy(f(a[0][k]))) return a[0][k]; return null; }),
        ForEach: sfn((i, a) => { const f = fn(i, a[1]); a[0].forEach((v) => f(v)); }),
        ConvertAll: sfn((i, a, ta) => { const f = fn(i, a[1]); return arr(a[0].map((v) => f(v)), ta && ta[1]); }),
        BinarySearch: sfn((i, a) => { const list = a[0]; let lo = 0, hi = list.length - 1; while (lo <= hi) { const mid = (lo + hi) >> 1; const c = userCmp(i, list[mid], a[1]); if (c === 0) return mid; if (c < 0) lo = mid + 1; else hi = mid - 1; } return ~lo; }, 'int'),
        Clear: sfn((i, a) => { const list = a[0]; const st = a.length > 1 ? num(a[1]) : 0, len = a.length > 2 ? num(a[2]) : list.length; const dv = i.defaultValue(list.__elem); for (let k = st; k < st + len; k++) list[k] = dv; }),
        CreateInstance: sfn((i, a) => { const n = num(a[1]); const l = new Array(n).fill(null); l.__elem = 'object'; return l; })
      }
    });

    // ---------------------------------------------------------------- List<T>
    const listDesc = T({
      name: 'List', kind: 'class', jsClass: CsList, aliases: ['IList', 'IReadOnlyList', 'ICollection', 'IEnumerable', 'IReadOnlyCollection', 'Collection', 'ObservableCollection'],
      isInstance: (v) => v instanceof CsList,
      ctor: (i, a, ta) => { const l = new CsList(ta && ta[0]); if (a.length && a[0] != null && typeof a[0] !== 'number') { l.items = seq(i, a[0]).slice().map((v) => coerce(v, l.__elem, i)); if (!ta || !ta[0]) l.__elem = elemOf(a[0]) || 'object'; } return l; },
      indexer: { t: (ga) => ga[0], get: (l, idx) => { const k = num(idx[0]); l.check(k); return l.items[k]; }, set: (l, idx, v, i) => { const k = num(idx[0]); l.check(k); l.items[k] = coerce(v, l.__elem, i); } },
      props: { Count: prop('int', (l) => l.items.length), Capacity: prop('int', (l) => Math.max(4, l.items.length), () => {}) },
      methods: {
        Add: method((i, l, a) => { l.items.push(coerce(a[0], l.__elem, i)); }),
        AddRange: method((i, l, a) => { seq(i, a[0]).slice().forEach((v) => l.items.push(coerce(v, l.__elem, i))); }),
        Insert: method((i, l, a) => { const k = num(a[0]); if (k < 0 || k > l.items.length) throw new CsException('ArgumentOutOfRangeException', 'Index must be within the bounds of the List.'); l.items.splice(k, 0, coerce(a[1], l.__elem, i)); }),
        InsertRange: method((i, l, a) => { l.items.splice(num(a[0]), 0, ...seq(i, a[1])); }),
        Remove: method((i, l, a) => { const k = l.items.findIndex((v) => csEquals(v, a[0], i)); if (k < 0) return false; l.items.splice(k, 1); return true; }, 'bool'),
        RemoveAt: method((i, l, a) => { const k = num(a[0]); l.check(k); l.items.splice(k, 1); }),
        RemoveRange: method((i, l, a) => { l.items.splice(num(a[0]), num(a[1])); }),
        RemoveAll: method((i, l, a) => { const f = fn(i, a[0]); const n = l.items.length; l.items = l.items.filter((v) => !truthy(f(v))); return n - l.items.length; }, 'int'),
        Clear: method((i, l) => { l.items.length = 0; }),
        Contains: method((i, l, a) => l.items.some((v) => csEquals(v, a[0], i)), 'bool'),
        IndexOf: method((i, l, a) => l.items.findIndex((v) => csEquals(v, a[0], i)), 'int'),
        LastIndexOf: method((i, l, a) => { for (let k = l.items.length - 1; k >= 0; k--) if (csEquals(l.items[k], a[0], i)) return k; return -1; }, 'int'),
        Sort: method((i, l, a) => { const c = a[0] ? fn(i, a[0]) : null; if (c && (a[0] instanceof CsFunc ? a[0].params.length === 1 : false)) { throw new CsException('ArgumentException', 'Sort 에는 (a, b) => 비교 결과 형태의 람다가 필요합니다. 키 기준 정렬은 OrderBy 를 쓰세요'); } l.items = stableSort(l.items, c ? (x, y) => num(c(x, y)) : (x, y) => userCmp(i, x, y)); }),
        Reverse: method((i, l) => { l.items.reverse(); }),
        ToArray: method((i, l) => arr(l.items.slice(), l.__elem), (ta, at, ga) => (ga[0] || 'object') + '[]'),
        ForEach: method((i, l, a) => { const f = fn(i, a[0]); l.items.slice().forEach((v) => f(v)); }),
        Find: method((i, l, a) => { const f = fn(i, a[0]); const r = l.items.find((v) => truthy(f(v))); return r === undefined ? i.defaultValue(l.__elem) : r; }, (ta, at, ga) => ga[0]),
        FindLast: method((i, l, a) => { const f = fn(i, a[0]); for (let k = l.items.length - 1; k >= 0; k--) if (truthy(f(l.items[k]))) return l.items[k]; return i.defaultValue(l.__elem); }, (ta, at, ga) => ga[0]),
        FindAll: method((i, l, a) => { const f = fn(i, a[0]); const r = new CsList(l.__elem); r.items = l.items.filter((v) => truthy(f(v))); return r; }, (ta, at, ga, ot) => ot),
        FindIndex: method((i, l, a) => { const f = fn(i, a[a.length - 1]); const st = a.length > 1 ? num(a[0]) : 0; for (let k = st; k < l.items.length; k++) if (truthy(f(l.items[k]))) return k; return -1; }, 'int'),
        FindLastIndex: method((i, l, a) => { const f = fn(i, a[0]); for (let k = l.items.length - 1; k >= 0; k--) if (truthy(f(l.items[k]))) return k; return -1; }, 'int'),
        Exists: method((i, l, a) => l.items.some((v) => truthy(fn(i, a[0])(v))), 'bool'), TrueForAll: method((i, l, a) => l.items.every((v) => truthy(fn(i, a[0])(v))), 'bool'),
        GetRange: method((i, l, a) => { const r = new CsList(l.__elem); r.items = l.items.slice(num(a[0]), num(a[0]) + num(a[1])); return r; }, (ta, at, ga, ot) => ot),
        CopyTo: method((i, l, a) => { const dst = a[0]; l.items.forEach((v, k) => { dst[k] = v; }); }),
        BinarySearch: method((i, l, a) => arrayDesc.statics.BinarySearch.fn(i, [l.items, a[0]]), 'int'),
        ConvertAll: method((i, l, a, ta) => { const f = fn(i, a[0]); const r = new CsList(ta && ta[0]); r.items = l.items.map((v) => f(v)); return r; }),
        TrimExcess: method(() => {}), GetEnumerator: method((i, l) => l.items), AsReadOnly: method((i, l) => l),
        ToString: method((i, l) => l.csToString(), 'string')
      }
    });

    // ---------------------------------------------------------------- Dictionary<K,V>
    T({
      name: 'Dictionary', kind: 'class', jsClass: CsDict, aliases: ['IDictionary', 'IReadOnlyDictionary', 'SortedDictionary'],
      isInstance: (v) => v instanceof CsDict,
      ctor: (i, a, ta) => { const d = new CsDict(ta && ta[0], ta && ta[1]); if (a.length && a[0] instanceof CsDict) for (const e of a[0].map.values()) d.set(e.k, e.v, i); return d; },
      indexer: { t: (ga) => ga[1], get: (d, idx) => d.get(idx[0]), set: (d, idx, v, i) => d.set(idx[0], v, i) },
      props: {
        Count: prop('int', (d) => d.map.size),
        Keys: prop((ga) => `List<${ga[0]}>`, (d) => { const l = new CsList(d.__kt); l.items = [...d.map.values()].map((e) => e.k); return l; }),
        Values: prop((ga) => `List<${ga[1]}>`, (d) => { const l = new CsList(d.__vt); l.items = [...d.map.values()].map((e) => e.v); return l; })
      },
      methods: {
        Add: method((i, d, a) => { if (d.has(a[0])) throw new CsException('ArgumentException', `An item with the same key has already been added. Key: ${fmt(a[0])}`); d.set(a[0], a[1], i); }),
        TryAdd: method((i, d, a) => { if (d.has(a[0])) return false; d.set(a[0], a[1], i); return true; }, 'bool'),
        ContainsKey: method((i, d, a) => d.has(a[0]), 'bool'),
        ContainsValue: method((i, d, a) => [...d.map.values()].some((e) => csEquals(e.v, a[0], i)), 'bool'),
        TryGetValue: method((i, d, a) => { const ref = a[1]; if (!(ref instanceof Ref)) argErr('TryGetValue 의 두 번째 인수는 out 변수여야 합니다'); if (d.has(a[0])) { ref.set(d.get(a[0])); return true; } ref.set(i.defaultValue(d.__vt)); return false; }, 'bool'),
        GetValueOrDefault: method((i, d, a) => (d.has(a[0]) ? d.get(a[0]) : a.length > 1 ? a[1] : i.defaultValue(d.__vt)), (ta, at, ga) => ga[1]),
        Remove: method((i, d, a) => { const k = keyOf(a[0]); if (a[1] instanceof Ref) a[1].set(d.map.has(k) ? d.map.get(k).v : i.defaultValue(d.__vt)); return d.map.delete(k); }, 'bool'),
        Clear: method((i, d) => d.map.clear()),
        GetEnumerator: method((i, d) => d.csIter()),
        ToString: method((i, d) => d.csToString(), 'string')
      }
    });
    T({ name: 'KeyValuePair', kind: 'struct', jsClass: CsKvp, isInstance: (v) => v instanceof CsKvp, ctor: (i, a) => new CsKvp(a[0], a[1]), props: { Key: prop((ga) => ga[0], (k) => k.Key), Value: prop((ga) => ga[1], (k) => k.Value) }, methods: { Deconstruct: method((i, k, a) => { a[0].set(k.Key); a[1].set(k.Value); }), ToString: method((i, k) => k.csToString(), 'string') } });

    // ---------------------------------------------------------------- HashSet · Queue · Stack
    T({
      name: 'HashSet', kind: 'class', jsClass: CsSet, aliases: ['ISet', 'SortedSet'], isInstance: (v) => v instanceof CsSet,
      ctor: (i, a, ta) => { const s = new CsSet(ta && ta[0]); if (a.length && a[0] != null && typeof a[0] !== 'number') for (const v of seq(i, a[0])) s.map.set(keyOf(v), v); return s; },
      props: { Count: prop('int', (s) => s.map.size) },
      methods: {
        Add: method((i, s, a) => { const k = keyOf(a[0]); if (s.map.has(k)) return false; s.map.set(k, coerce(a[0], s.__elem, i)); return true; }, 'bool'),
        Contains: method((i, s, a) => s.map.has(keyOf(a[0])), 'bool'), Remove: method((i, s, a) => s.map.delete(keyOf(a[0])), 'bool'), Clear: method((i, s) => s.map.clear()),
        UnionWith: method((i, s, a) => { for (const v of seq(i, a[0])) s.map.set(keyOf(v), v); }), IntersectWith: method((i, s, a) => { const ks = new Set(seq(i, a[0]).map(keyOf)); for (const k of [...s.map.keys()]) if (!ks.has(k)) s.map.delete(k); }),
        ExceptWith: method((i, s, a) => { for (const v of seq(i, a[0])) s.map.delete(keyOf(v)); }), IsSubsetOf: method((i, s, a) => { const ks = new Set(seq(i, a[0]).map(keyOf)); return [...s.map.keys()].every((k) => ks.has(k)); }, 'bool'),
        Overlaps: method((i, s, a) => seq(i, a[0]).some((v) => s.map.has(keyOf(v))), 'bool'), SetEquals: method((i, s, a) => { const o = seq(i, a[0]); return o.length === s.map.size && o.every((v) => s.map.has(keyOf(v))); }, 'bool'),
        CopyTo: method((i, s, a) => { [...s.map.values()].forEach((v, k) => { a[0][k] = v; }); }), GetEnumerator: method((i, s) => s.csIter()), TryGetValue: method((i, s, a) => { const k = keyOf(a[0]); if (s.map.has(k)) { a[1].set(s.map.get(k)); return true; } a[1].set(null); return false; }, 'bool')
      }
    });
    T({
      name: 'Queue', kind: 'class', jsClass: CsQueue, isInstance: (v) => v instanceof CsQueue, ctor: (i, a, ta) => { const q = new CsQueue(ta && ta[0]); if (a.length && typeof a[0] !== 'number' && a[0] != null) q.items = seq(i, a[0]).slice(); return q; },
      props: { Count: prop('int', (q) => q.items.length) },
      methods: {
        Enqueue: method((i, q, a) => { q.items.push(coerce(a[0], q.__elem, i)); }), Dequeue: method((i, q) => { if (!q.items.length) throw new CsException('InvalidOperationException', 'Queue empty.'); return q.items.shift(); }, (ta, at, ga) => ga[0]),
        Peek: method((i, q) => { if (!q.items.length) throw new CsException('InvalidOperationException', 'Queue empty.'); return q.items[0]; }, (ta, at, ga) => ga[0]), Clear: method((i, q) => { q.items.length = 0; }), Contains: method((i, q, a) => q.items.some((v) => csEquals(v, a[0], i)), 'bool'),
        ToArray: method((i, q) => arr(q.items.slice(), q.__elem)), TryDequeue: method((i, q, a) => { if (!q.items.length) { a[0].set(null); return false; } a[0].set(q.items.shift()); return true; }, 'bool'), TryPeek: method((i, q, a) => { if (!q.items.length) { a[0].set(null); return false; } a[0].set(q.items[0]); return true; }, 'bool')
      }
    });
    T({
      name: 'Stack', kind: 'class', jsClass: CsStack, isInstance: (v) => v instanceof CsStack, ctor: (i, a, ta) => { const s = new CsStack(ta && ta[0]); if (a.length && typeof a[0] !== 'number' && a[0] != null) s.items = seq(i, a[0]).slice(); return s; },
      props: { Count: prop('int', (s) => s.items.length) },
      methods: {
        Push: method((i, s, a) => { s.items.push(coerce(a[0], s.__elem, i)); }), Pop: method((i, s) => { if (!s.items.length) throw new CsException('InvalidOperationException', 'Stack empty.'); return s.items.pop(); }, (ta, at, ga) => ga[0]),
        Peek: method((i, s) => { if (!s.items.length) throw new CsException('InvalidOperationException', 'Stack empty.'); return s.items[s.items.length - 1]; }, (ta, at, ga) => ga[0]), Clear: method((i, s) => { s.items.length = 0; }), Contains: method((i, s, a) => s.items.some((v) => csEquals(v, a[0], i)), 'bool'),
        ToArray: method((i, s) => arr(s.items.slice().reverse(), s.__elem)), TryPop: method((i, s, a) => { if (!s.items.length) { a[0].set(null); return false; } a[0].set(s.items.pop()); return true; }, 'bool'), TryPeek: method((i, s, a) => { if (!s.items.length) { a[0].set(null); return false; } a[0].set(s.items[s.items.length - 1]); return true; }, 'bool')
      }
    });
    T({ name: 'IGrouping', kind: 'class', jsClass: CsGrouping, isInstance: (v) => v instanceof CsGrouping, props: { Key: prop((ga) => ga[0], (g) => g.Key), Count: prop('int', (g) => g.items.length) } });

    // ---------------------------------------------------------------- Tuple
    T({
      name: 'Tuple', kind: 'struct', jsClass: CsTuple, aliases: ['ValueTuple'], isInstance: (v) => v instanceof CsTuple,
      statics: { Create: sfn((i, a) => new CsTuple(a.slice()), 'Tuple') },
      dynProp: (t, name) => {
        const m = /^Item(\d+)$/.exec(name);
        if (m) { const k = +m[1] - 1; if (k < t.items.length) return new Ref(() => t.items[k], (v) => { t.items[k] = v; }); }
        const k = t.names.indexOf(name);
        if (k >= 0) return new Ref(() => t.items[k], (v) => { t.items[k] = v; });
        return null;
      },
      methods: { ToString: method((i, t) => t.toString(), 'string'), Equals: method((i, t, a) => a[0] instanceof CsTuple && t.items.length === a[0].items.length && t.items.every((v, k) => csEquals(v, a[0].items[k], i)), 'bool') }
    });
    T({ name: 'Enum', kind: 'class', isInstance: (v) => v instanceof CsEnumVal, methods: { ToString: method((i, e, a) => (a.length && /^[dD]$/.test(str(a[0])) ? String(e.value) : e.toString()), 'string'), HasFlag: method((i, e, a) => (e.value & num(a[0])) === num(a[0]), 'bool'), CompareTo: method((i, e, a) => e.value - num(a[0]), 'int'), GetHashCode: method((i, e) => e.value, 'int') },
      statics: { Parse: sfn((i, a, ta) => { const def = a[0] && a[0].__csType ? i.types.get(a[0].__csType) : i.types.get(ta && ta[0]); const s = str(a[a.length - 1] === true || a[a.length - 1] === false ? a[a.length - 2] : a[a.length - 1]); const n = def.names.find((x) => x === s || x.toLowerCase() === s.toLowerCase()); if (!n) throw new CsException('ArgumentException', `Requested value '${s}' was not found.`); return new CsEnumVal(def, def.values[n]); }), GetNames: sfn((i, a) => { const def = i.types.get(a[0].__csType); return arr(def.names.slice(), 'string'); }, 'string[]'), GetValues: sfn((i, a) => { const def = i.types.get(a[0].__csType); return arr(def.names.map((n) => new CsEnumVal(def, def.values[n])), def.name); }), IsDefined: sfn((i, a) => { const def = i.types.get(a[0].__csType); return def.names.some((n) => def.values[n] === num(a[1])); }, 'bool'), TryParse: sfn((i, a, ta) => { const def = i.types.get(ta && ta[0]); const s = str(a[0]); const n = def && def.names.find((x) => x === s || x.toLowerCase() === s.toLowerCase()); const ref = a[a.length - 1]; if (n) { ref.set(new CsEnumVal(def, def.values[n])); return true; } ref.set(def ? new CsEnumVal(def, 0) : null); return false; }, 'bool') } });
    T({ name: 'Type', kind: 'class', isInstance: (v) => v && v.__csType, props: { Name: prop('string', (t) => t.Name), FullName: prop('string', (t) => t.__csType), IsValueType: prop('bool', (t) => isNumericT(t.__csType) || t.__csType === 'bool'), IsClass: prop('bool', (t) => !isNumericT(t.__csType) && t.__csType !== 'bool') }, methods: { ToString: method((i, t) => t.__csType, 'string') } });
    T({ name: 'Delegate', kind: 'class', aliases: ['Func', 'Action', 'Predicate', 'Comparison', 'Converter', 'EventHandler', 'MulticastDelegate'], isInstance: (v) => typeof v === 'function' || v instanceof CsFunc, methods: { Invoke: method((i, f, a) => i.callFunc(f, a)), DynamicInvoke: method((i, f, a) => i.callFunc(f, a)) } });
    T({ name: 'object', kind: 'class', aliases: ['Object'], isInstance: () => true, statics: { ReferenceEquals: sfn((i, a) => a[0] === a[1], 'bool'), Equals: sfn((i, a) => csEquals(a[0], a[1], i), 'bool') } });
    T({ name: 'void', kind: 'struct', isInstance: () => false });
    T({ name: 'Nullable', kind: 'struct', isInstance: () => false, statics: {} });
    interp.defType({ name: 'dynamic', kind: 'class', isInstance: () => true });
    interp.defType({ name: 'IComparable', kind: 'interface' }); interp.defType({ name: 'IEquatable', kind: 'interface' }); interp.defType({ name: 'IDisposable', kind: 'interface' }); interp.defType({ name: 'IComparer', kind: 'interface' }); interp.defType({ name: 'IEnumerator', kind: 'interface' }); interp.defType({ name: 'ICloneable', kind: 'interface' }); interp.defType({ name: 'IFormattable', kind: 'interface' });

    // ---------------------------------------------------------------- 예외
    const exc = (name) => T({ name, kind: 'class', isInstance: (v) => v && v.__csExc && R.excIsA(v.__excType, name), ctor: (i, a) => { const e = new CsException(name, a.length ? (typeof a[0] === 'string' ? a[0] : name === 'ArgumentNullException' || name === 'ArgumentOutOfRangeException' ? `Value cannot be null. (Parameter '${fmt(a[0])}')` : fmt(a[0])) : null, a.length > 1 && a[1] && a[1].__csExc ? a[1].__csExc : null); if (name === 'ArgumentException' && a.length > 1 && typeof a[1] === 'string') e.csMessage += ` (Parameter '${a[1]}')`; return i.excObject(e); },
      props: { Message: prop('string', (o) => o.__csExc.csMessage), InnerException: prop('Exception', (o, i) => (o.__csExc.inner ? i.excObject(o.__csExc.inner) : null)), StackTrace: prop('string', (o) => `   at Program.Main() line ${o.__csExc.csLine || '?'}`), Source: prop('string', () => 'Program'), HResult: prop('int', () => -2146233088), Data: prop('object', () => null), ParamName: prop('string', () => null) },
      methods: { ToString: method((i, o) => `System.${o.__excType}: ${o.__csExc.csMessage}`, 'string'), GetType: method((i, o) => i.typeObject(o.__excType)) } });
    ['Exception', 'SystemException', 'ApplicationException', 'ArgumentException', 'ArgumentNullException', 'ArgumentOutOfRangeException', 'InvalidOperationException', 'IndexOutOfRangeException', 'NullReferenceException', 'DivideByZeroException', 'ArithmeticException', 'OverflowException', 'FormatException', 'KeyNotFoundException', 'NotImplementedException', 'NotSupportedException', 'InvalidCastException', 'FileNotFoundException', 'IOException', 'ObjectDisposedException', 'TimeoutException', 'OpenCVException', 'StackOverflowException', 'OutOfMemoryException'].forEach(exc);

    // ---------------------------------------------------------------- Random · Stopwatch · DateTime · Environment · Thread
    T({
      name: 'Random', kind: 'class', jsClass: CsRandom, isInstance: (v) => v instanceof CsRandom, ctor: (i, a) => new CsRandom(a.length ? num(a[0]) : null),
      statics: { Shared: sval('Random', () => (interp.__sharedRandom = interp.__sharedRandom || new CsRandom(12345))) },
      methods: {
        Next: method((i, r, a) => { if (!a.length) return Math.floor(r.nextDouble() * 2147483647); const lo = a.length > 1 ? num(a[0]) : 0, hi = num(a[a.length - 1]); if (hi < lo) throw new CsException('ArgumentOutOfRangeException', "'minValue' cannot be greater than maxValue."); return lo + Math.floor(r.nextDouble() * (hi - lo)); }, 'int'),
        NextDouble: method((i, r) => r.nextDouble(), 'double'), NextSingle: method((i, r) => Math.fround(r.nextDouble()), 'float'), NextInt64: method((i, r, a) => Math.floor(r.nextDouble() * (a.length ? num(a[a.length - 1]) : 9007199254740991)), 'long'),
        NextBytes: method((i, r, a) => { for (let k = 0; k < a[0].length; k++) a[0][k] = Math.floor(r.nextDouble() * 256); }),
        Shuffle: method((i, r, a) => { const l = a[0]; for (let k = l.length - 1; k > 0; k--) { const j = Math.floor(r.nextDouble() * (k + 1)); [l[k], l[j]] = [l[j], l[k]]; } }),
        GetItems: method((i, r, a) => { const src = seq(i, a[0]); return arr(Array.from({ length: num(a[1]) }, () => src[Math.floor(r.nextDouble() * src.length)]), elemOf(a[0])); })
      }
    });
    T({
      name: 'Stopwatch', kind: 'class', jsClass: CsStopwatch, isInstance: (v) => v instanceof CsStopwatch, ctor: () => new CsStopwatch(),
      statics: { StartNew: sfn(() => { const s = new CsStopwatch(); s.start = now(); s.running = true; return s; }, 'Stopwatch'), GetTimestamp: sfn(() => Math.round(now() * 10000), 'long'), Frequency: sval('long', () => 10000000) },
      props: { ElapsedMilliseconds: prop('long', (s) => Math.floor(s.elapsed())), ElapsedTicks: prop('long', (s) => Math.floor(s.elapsed() * 10000)), Elapsed: prop('TimeSpan', (s) => new CsTimeSpan(s.elapsed())), IsRunning: prop('bool', (s) => s.running) },
      methods: { Start: method((i, s) => { if (!s.running) { s.start = now(); s.running = true; } }), Stop: method((i, s) => { if (s.running) { s.acc += now() - s.start; s.running = false; } }), Reset: method((i, s) => { s.acc = 0; s.running = false; }), Restart: method((i, s) => { s.acc = 0; s.start = now(); s.running = true; }) }
    });
    T({
      name: 'TimeSpan', kind: 'struct', jsClass: CsTimeSpan, isInstance: (v) => v instanceof CsTimeSpan, ctor: (i, a) => new CsTimeSpan(a.length === 1 ? num(a[0]) / 10000 : a.length === 3 ? (num(a[0]) * 3600 + num(a[1]) * 60 + num(a[2])) * 1000 : a.length >= 4 ? ((num(a[0]) * 24 + num(a[1])) * 3600 + num(a[2]) * 60 + num(a[3])) * 1000 + (a[4] ? num(a[4]) : 0) : 0),
      statics: { FromMilliseconds: sfn((i, a) => new CsTimeSpan(num(a[0])), 'TimeSpan'), FromSeconds: sfn((i, a) => new CsTimeSpan(num(a[0]) * 1000), 'TimeSpan'), FromMinutes: sfn((i, a) => new CsTimeSpan(num(a[0]) * 60000), 'TimeSpan'), FromHours: sfn((i, a) => new CsTimeSpan(num(a[0]) * 3600000), 'TimeSpan'), Zero: sval('TimeSpan', () => new CsTimeSpan(0)) },
      props: { TotalMilliseconds: prop('double', (t) => t.ms), TotalSeconds: prop('double', (t) => t.ms / 1000), TotalMinutes: prop('double', (t) => t.ms / 60000), TotalHours: prop('double', (t) => t.ms / 3600000), Milliseconds: prop('int', (t) => Math.floor(t.ms % 1000)), Seconds: prop('int', (t) => Math.floor(t.ms / 1000) % 60), Minutes: prop('int', (t) => Math.floor(t.ms / 60000) % 60), Hours: prop('int', (t) => Math.floor(t.ms / 3600000) % 24), Days: prop('int', (t) => Math.floor(t.ms / 86400000)), Ticks: prop('long', (t) => Math.round(t.ms * 10000)) },
      methods: { ToString: method((i, t, a) => (a.length ? t.csFormat ? t.csFormat(a[0]) : t.csToString() : t.csToString()), 'string'), Add: method((i, t, a) => new CsTimeSpan(t.ms + a[0].ms), 'TimeSpan'), Subtract: method((i, t, a) => new CsTimeSpan(t.ms - a[0].ms), 'TimeSpan') },
      operators: { '+': (i, v) => new CsTimeSpan(v[0].ms + v[1].ms), '-': (i, v) => new CsTimeSpan(v[0].ms - v[1].ms), '<': (i, v) => v[0].ms < v[1].ms, '>': (i, v) => v[0].ms > v[1].ms, '<=': (i, v) => v[0].ms <= v[1].ms, '>=': (i, v) => v[0].ms >= v[1].ms }
    });
    T({
      name: 'DateTime', kind: 'struct', jsClass: CsDateTime, isInstance: (v) => v instanceof CsDateTime, ctor: (i, a) => new CsDateTime(a.length >= 3 ? new Date(num(a[0]), num(a[1]) - 1, num(a[2]), a[3] ? num(a[3]) : 0, a[4] ? num(a[4]) : 0, a[5] ? num(a[5]) : 0) : new Date(0)),
      statics: { Now: sval('DateTime', () => new CsDateTime(new Date())), UtcNow: sval('DateTime', () => new CsDateTime(new Date())), Today: sval('DateTime', () => { const d = new Date(); d.setHours(0, 0, 0, 0); return new CsDateTime(d); }), MinValue: sval('DateTime', () => new CsDateTime(new Date(1, 0, 1))), Parse: sfn((i, a) => new CsDateTime(new Date(str(a[0]))), 'DateTime'), DaysInMonth: sfn((i, a) => new Date(num(a[0]), num(a[1]), 0).getDate(), 'int'), IsLeapYear: sfn((i, a) => { const y = num(a[0]); return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }, 'bool') },
      props: { Year: prop('int', (d) => d.d.getFullYear()), Month: prop('int', (d) => d.d.getMonth() + 1), Day: prop('int', (d) => d.d.getDate()), Hour: prop('int', (d) => d.d.getHours()), Minute: prop('int', (d) => d.d.getMinutes()), Second: prop('int', (d) => d.d.getSeconds()), Millisecond: prop('int', (d) => d.d.getMilliseconds()), DayOfWeek: prop('int', (d) => d.d.getDay()), DayOfYear: prop('int', (d) => Math.floor((d.d - new Date(d.d.getFullYear(), 0, 0)) / 86400000)), Ticks: prop('long', (d) => (d.d.getTime() + 62135596800000) * 10000), Date: prop('DateTime', (d) => { const x = new Date(d.d); x.setHours(0, 0, 0, 0); return new CsDateTime(x); }), TimeOfDay: prop('TimeSpan', (d) => new CsTimeSpan(d.d.getTime() - new Date(d.d).setHours(0, 0, 0, 0))) },
      methods: { ToString: method((i, d, a) => (a.length && typeof a[0] === 'string' ? d.csFormat(a[0]) : d.csToString()), 'string'), AddDays: method((i, d, a) => new CsDateTime(new Date(d.d.getTime() + num(a[0]) * 86400000)), 'DateTime'), AddHours: method((i, d, a) => new CsDateTime(new Date(d.d.getTime() + num(a[0]) * 3600000)), 'DateTime'), AddMinutes: method((i, d, a) => new CsDateTime(new Date(d.d.getTime() + num(a[0]) * 60000)), 'DateTime'), AddSeconds: method((i, d, a) => new CsDateTime(new Date(d.d.getTime() + num(a[0]) * 1000)), 'DateTime'), AddMilliseconds: method((i, d, a) => new CsDateTime(new Date(d.d.getTime() + num(a[0]))), 'DateTime'), AddMonths: method((i, d, a) => { const x = new Date(d.d); x.setMonth(x.getMonth() + num(a[0])); return new CsDateTime(x); }, 'DateTime'), AddYears: method((i, d, a) => { const x = new Date(d.d); x.setFullYear(x.getFullYear() + num(a[0])); return new CsDateTime(x); }, 'DateTime'), Subtract: method((i, d, a) => (a[0] instanceof CsDateTime ? new CsTimeSpan(d.d - a[0].d) : new CsDateTime(new Date(d.d.getTime() - a[0].ms))), (ta, at) => (at[0] === 'DateTime' ? 'TimeSpan' : 'DateTime')), ToShortDateString: method((i, d) => d.csFormat('yyyy-MM-dd'), 'string'), ToLongTimeString: method((i, d) => d.csFormat('HH:mm:ss'), 'string'), ToShortTimeString: method((i, d) => d.csFormat('HH:mm'), 'string'), CompareTo: method((i, d, a) => d.d - a[0].d, 'int') },
      operators: { '-': (i, v) => (v[1] instanceof CsDateTime ? new CsTimeSpan(v[0].d - v[1].d) : new CsDateTime(new Date(v[0].d.getTime() - v[1].ms))), '+': (i, v) => new CsDateTime(new Date(v[0].d.getTime() + v[1].ms)), '<': (i, v) => v[0].d < v[1].d, '>': (i, v) => v[0].d > v[1].d, '<=': (i, v) => v[0].d <= v[1].d, '>=': (i, v) => v[0].d >= v[1].d }
    });
    T({ name: 'Environment', kind: 'static', statics: { NewLine: sval('string', () => '\n'), TickCount: sval('int', () => Math.floor(now()) | 0), TickCount64: sval('long', () => Math.floor(now())), ProcessorCount: sval('int', () => 4), MachineName: sval('string', () => 'BROWSER'), UserName: sval('string', () => 'student'), CurrentDirectory: sval('string', () => '/work', () => {}), OSVersion: sval('object', () => ({ csToString: () => 'Web (WebAssembly)', Platform: 'Web' })), Version: sval('object', () => ({ csToString: () => '8.0.0', Major: 8, Minor: 0 })), Is64BitProcess: sval('bool', () => false), Exit: sfn((i, a) => { throw new R.ExitSignal(a.length ? num(a[0]) : 0); }), GetCommandLineArgs: sfn(() => arr(['Program'], 'string'), 'string[]'), GetEnvironmentVariable: sfn(() => null, 'string'), StackTrace: sval('string', () => '') } });
    T({ name: 'Thread', kind: 'class', statics: { Sleep: sfn((i, a) => { const ms = a[0] instanceof CsTimeSpan ? a[0].ms : num(a[0]); if (i.host.sleep) i.host.sleep(ms); }, 'void'), CurrentThread: sval('object', () => ({ ManagedThreadId: 1, Name: 'Main', IsAlive: true, csToString: () => 'Thread' })) }, ctor: () => { throw new CsException('NotSupportedException', '브라우저 실습 환경에서는 스레드(Thread)를 만들 수 없습니다. 순서대로 실행되는 코드로 작성하세요.'); } });
    T({ name: 'Task', kind: 'class', statics: { Delay: sfn((i, a) => { if (i.host.sleep) i.host.sleep(a[0] instanceof CsTimeSpan ? a[0].ms : num(a[0])); return { csToString: () => 'Task', Wait: () => {}, Result: null, IsCompleted: true }; }), Run: sfn((i, a) => { const r = i.callFunc(a[0], []); return { csToString: () => 'Task', Wait: () => {}, Result: r, IsCompleted: true }; }), CompletedTask: sval('Task', () => ({ csToString: () => 'Task', Wait: () => {}, IsCompleted: true })), WhenAll: sfn(() => ({ csToString: () => 'Task', Wait: () => {}, IsCompleted: true })), FromResult: sfn((i, a) => ({ csToString: () => 'Task', Wait: () => {}, Result: a[0], IsCompleted: true })) } });
    T({ name: 'GC', kind: 'static', statics: { Collect: sfn(() => {}, 'void'), GetTotalMemory: sfn(() => 0, 'long'), WaitForPendingFinalizers: sfn(() => {}, 'void'), SuppressFinalize: sfn(() => {}, 'void') } });
    T({ name: 'Debug', kind: 'static', statics: { WriteLine: sfn((i, a) => i.host.write('m', consoleText(i, a) + '\n'), 'void'), Assert: sfn((i, a) => { if (!truthy(a[0])) throw new CsException('Exception', 'Debug.Assert 실패' + (a[1] ? ': ' + str(a[1]) : '')); }, 'void'), Write: sfn((i, a) => i.host.write('m', consoleText(i, a)), 'void') } });
    T({ name: 'Trace', kind: 'static', statics: interp.types.get('Debug').statics });
    T({ name: 'CultureInfo', kind: 'class', statics: { InvariantCulture: sval('object', () => ({ csToString: () => 'Invariant' })), CurrentCulture: sval('object', () => ({ csToString: () => 'ko-KR' }), () => {}) } });
    T({ name: 'Encoding', kind: 'class', statics: { UTF8: sval('object', () => ({ __enc: 'utf8', GetBytes: (s) => arr(Array.from(new TextEncoder().encode(str(s))), 'byte'), GetString: (b) => new TextDecoder().decode(new Uint8Array(b)), csToString: () => 'UTF8' })), ASCII: sval('object', () => ({ GetBytes: (s) => arr(Array.from(str(s), (c) => c.charCodeAt(0) & 0x7f), 'byte'), GetString: (b) => String.fromCharCode(...b), csToString: () => 'ASCII' })), Default: sval('object', () => ({ GetBytes: (s) => arr(Array.from(new TextEncoder().encode(str(s))), 'byte'), GetString: (b) => new TextDecoder().decode(new Uint8Array(b)), csToString: () => 'UTF8' })) } });

    // ---------------------------------------------------------------- StringBuilder
    T({
      name: 'StringBuilder', kind: 'class', jsClass: CsStringBuilder, isInstance: (v) => v instanceof CsStringBuilder, ctor: (i, a) => new CsStringBuilder(a.length && typeof a[0] === 'string' ? a[0] : ''),
      props: { Length: prop('int', (b) => b.s.length, (b, v) => { b.s = b.s.slice(0, v).padEnd(v, '\0'); }), Capacity: prop('int', (b) => Math.max(16, b.s.length), () => {}) },
      indexer: { t: 'char', get: (b, idx) => new CsChar(b.s.charCodeAt(num(idx[0]))), set: (b, idx, v) => { const k = num(idx[0]); b.s = b.s.slice(0, k) + chr(v).toString() + b.s.slice(k + 1); } },
      methods: {
        Append: method((i, b, a, ta, node, raw) => { b.s += a.length > 1 && typeof a[0] === 'string' && Array.isArray(a[1]) ? compositeFormat(a[0], a[1], i) : a.length === 2 && a[0] instanceof CsChar ? a[0].toString().repeat(num(a[1])) : fmt(a[0], raw && raw[0] && raw[0].node ? i.typeOf(raw[0].node, i.__lastScope) : null); return b; }, 'StringBuilder'),
        AppendLine: method((i, b, a) => { b.s += (a.length ? fmt(a[0]) : '') + '\n'; return b; }, 'StringBuilder'),
        AppendFormat: method((i, b, a) => { b.s += compositeFormat(str(a[0]), a.slice(1), i); return b; }, 'StringBuilder'),
        AppendJoin: method((i, b, a) => { b.s += (a.length === 2 && (Array.isArray(a[1]) || a[1].csIter) ? seq(i, a[1]) : a.slice(1)).map(fmt).join(str(a[0])); return b; }, 'StringBuilder'),
        Insert: method((i, b, a) => { const k = num(a[0]); b.s = b.s.slice(0, k) + fmt(a[1]) + b.s.slice(k); return b; }, 'StringBuilder'),
        Remove: method((i, b, a) => { b.s = b.s.slice(0, num(a[0])) + b.s.slice(num(a[0]) + num(a[1])); return b; }, 'StringBuilder'),
        Replace: method((i, b, a) => { b.s = b.s.split(str(a[0])).join(str(a[1])); return b; }, 'StringBuilder'),
        Clear: method((i, b) => { b.s = ''; return b; }, 'StringBuilder'), ToString: method((i, b, a) => (a.length === 2 ? b.s.substr(num(a[0]), num(a[1])) : b.s), 'string'), Equals: method((i, b, a) => a[0] instanceof CsStringBuilder && a[0].s === b.s, 'bool')
      }
    });

    // ---------------------------------------------------------------- 파일 (가상 작업 폴더: host.fs)
    const fs = () => interp.host.fs || null;
    const noFs = () => { throw new CsException('IOException', '이 실행 환경에는 파일 시스템이 없습니다'); };
    const readBytes = (p) => { const f = fs(); if (!f) noFs(); const b = f.read(str(p)); if (!b) throw new CsException('FileNotFoundException', `Could not find file '${str(p)}'.`); return b; };
    T({
      name: 'File', kind: 'static',
      statics: {
        Exists: sfn((i, a) => { const f = fs(); return !!(f && f.exists(str(a[0]))); }, 'bool'),
        ReadAllText: sfn((i, a) => new TextDecoder().decode(readBytes(a[0])), 'string'),
        ReadAllLines: sfn((i, a) => arr(new TextDecoder().decode(readBytes(a[0])).replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n'), 'string'), 'string[]'),
        ReadLines: sfn((i, a) => arr(new TextDecoder().decode(readBytes(a[0])).replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n'), 'string'), 'string[]'),
        ReadAllBytes: sfn((i, a) => arr(Array.from(readBytes(a[0])), 'byte'), 'byte[]'),
        WriteAllText: sfn((i, a) => { const f = fs(); if (!f) noFs(); f.write(str(a[0]), new TextEncoder().encode(str(a[1]))); }),
        WriteAllLines: sfn((i, a) => { const f = fs(); if (!f) noFs(); f.write(str(a[0]), new TextEncoder().encode(seq(i, a[1]).map(fmt).join('\n') + '\n')); }),
        WriteAllBytes: sfn((i, a) => { const f = fs(); if (!f) noFs(); f.write(str(a[0]), new Uint8Array(a[1].map(num))); }),
        AppendAllText: sfn((i, a) => { const f = fs(); if (!f) noFs(); const old = f.exists(str(a[0])) ? new TextDecoder().decode(f.read(str(a[0]))) : ''; f.write(str(a[0]), new TextEncoder().encode(old + str(a[1]))); }),
        Delete: sfn((i, a) => { const f = fs(); if (f && f.delete) f.delete(str(a[0])); }), Copy: sfn((i, a) => { const f = fs(); if (!f) noFs(); f.write(str(a[1]), readBytes(a[0]).slice()); }),
        GetLastWriteTime: sfn(() => new CsDateTime(new Date()), 'DateTime')
      }
    });
    T({ name: 'Directory', kind: 'static', statics: { Exists: sfn((i, a) => { const f = fs(); return !!(f && f.list && f.list(str(a[0])).length); }, 'bool'), GetFiles: sfn((i, a) => { const f = fs(); if (!f || !f.list) return arr([], 'string'); let files = f.list(str(a[0])); if (a.length > 1) { const re = new RegExp('^' + str(a[1]).replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i'); files = files.filter((n) => re.test(n.split('/').pop())); } return arr(files, 'string'); }, 'string[]'), CreateDirectory: sfn(() => ({ csToString: () => 'DirectoryInfo' })), GetCurrentDirectory: sfn(() => '/work', 'string'), GetDirectories: sfn(() => arr([], 'string'), 'string[]') } });
    T({ name: 'Path', kind: 'static', statics: { Combine: sfn((i, a) => a.map(str).filter(Boolean).join('/').replace(/\/+/g, '/'), 'string'), GetFileName: sfn((i, a) => str(a[0]).split(/[\\/]/).pop(), 'string'), GetExtension: sfn((i, a) => { const n = str(a[0]).split(/[\\/]/).pop(); const k = n.lastIndexOf('.'); return k > 0 ? n.slice(k) : ''; }, 'string'), GetFileNameWithoutExtension: sfn((i, a) => { const n = str(a[0]).split(/[\\/]/).pop(); const k = n.lastIndexOf('.'); return k > 0 ? n.slice(0, k) : n; }, 'string'), GetDirectoryName: sfn((i, a) => { const p = str(a[0]).replace(/\\/g, '/'); const k = p.lastIndexOf('/'); return k >= 0 ? p.slice(0, k) : ''; }, 'string'), ChangeExtension: sfn((i, a) => { const p = str(a[0]); const k = p.lastIndexOf('.'); const ext = str(a[1]); return (k > 0 ? p.slice(0, k) : p) + (ext.startsWith('.') ? ext : '.' + ext); }, 'string'), DirectorySeparatorChar: sval('char', () => new CsChar(47)), GetTempPath: sfn(() => '/tmp/', 'string'), GetFullPath: sfn((i, a) => '/work/' + str(a[0]).replace(/^\.?\//, ''), 'string'), GetRandomFileName: sfn(() => Math.random().toString(36).slice(2, 10) + '.tmp', 'string') } });

    // ---------------------------------------------------------------- LINQ (확장 메서드)
    const isSeq = (v) => Array.isArray(v) || typeof v === 'string' || (v && typeof v.csIter === 'function');
    const E = (name, f, ret) => interp.defExtension(name, (i, self, a, ta, node) => f(i, seq(i, self), a, ta, self), ret, isSeq);
    const outList = (i, items, elem) => arr(items, elem);
    const numOf = (v, what) => { if (v == null) return null; return num(v, what); };
    const sel = (i, a, k) => (a.length > k && a[k] != null ? fn(i, a[k]) : null);
    const resultElem = (ta, at, ga, ot) => (ot ? elemOf({ __elem: isArrayT(ot) ? elemT(ot) : genericArgs(ot)[0] }) : null);
    const isArrayT = (t) => !!t && /\]$/.test(t);
    const seqT = (elemFn) => (ta, at, ga, ot) => { const e = elemFn ? elemFn(ta, at, ga, ot) : (ot ? (isArrayT(ot) ? elemT(ot) : ot === 'string' ? 'char' : genericArgs(ot)[0]) : null); return e ? `IEnumerable<${e}>` : 'IEnumerable<object>'; };
    const elemTOf = (ta, at, ga, ot) => (ot ? (isArrayT(ot) ? elemT(ot) : ot === 'string' ? 'char' : genericArgs(ot)[0]) : null);
    E('Select', (i, s, a) => { const f = fn(i, a[0]); const lam = a[0]; const two = lam instanceof CsFunc ? lam.params.length === 2 : f.length === 2; return outList(i, s.map((v, k) => (two ? f(v, k) : f(v))), null); }, seqT(() => null));
    E('Where', (i, s, a, ta, self) => { const f = fn(i, a[0]); const two = a[0] instanceof CsFunc && a[0].params.length === 2; return outList(i, s.filter((v, k) => truthy(two ? f(v, k) : f(v))), elemOf(self)); }, seqT());
    E('SelectMany', (i, s, a) => { const f = fn(i, a[0]); const out = []; s.forEach((v, k) => { for (const x of seq(i, f(v, k))) out.push(x); }); return outList(i, out, null); }, seqT(() => null));
    E('OrderBy', (i, s, a) => { const f = fn(i, a[0]); const r = stableSort(s, (x, y) => userCmp(i, f(x), f(y))); r.__keys = [a[0]]; return outList(i, r, elemOf(s)); }, seqT());
    E('OrderByDescending', (i, s, a) => { const f = fn(i, a[0]); const r = stableSort(s, (x, y) => userCmp(i, f(y), f(x))); r.__keys = [a[0]]; r.__desc = [true]; return outList(i, r, elemOf(s)); }, seqT());
    E('ThenBy', (i, s, a, ta, self) => thenBy(i, self, s, a[0], false), seqT()); E('ThenByDescending', (i, s, a, ta, self) => thenBy(i, self, s, a[0], true), seqT());
    function thenBy(i, self, s, keyFn, desc) { const keys = (self.__keys || []).concat([keyFn]); const descs = (self.__desc || (self.__keys || []).map(() => false)).concat([desc]); const fs2 = keys.map((k) => fn(i, k)); const r = stableSort(s, (x, y) => { for (let k = 0; k < fs2.length; k++) { const c = userCmp(i, fs2[k](x), fs2[k](y)); if (c) return descs[k] ? -c : c; } return 0; }); r.__keys = keys; r.__desc = descs; return outList(i, r, elemOf(s)); }
    E('Order', (i, s) => outList(i, stableSort(s, (x, y) => userCmp(i, x, y)), elemOf(s)), seqT()); E('OrderDescending', (i, s) => outList(i, stableSort(s, (x, y) => userCmp(i, y, x)), elemOf(s)), seqT());
    E('ToList', (i, s, a, ta, self) => new CsList(elemOf(self) || i.inferElem(s), s.slice()), (ta, at, ga, ot) => `List<${elemTOf(ta, at, ga, ot) || 'object'}>`);
    E('ToArray', (i, s, a, ta, self) => arr(s.slice(), elemOf(self) || i.inferElem(s)), (ta, at, ga, ot) => (elemTOf(ta, at, ga, ot) || 'object') + '[]');
    E('ToHashSet', (i, s) => { const h = new CsSet(elemOf(s)); for (const v of s) h.map.set(keyOf(v), v); return h; });
    E('ToDictionary', (i, s, a) => { const kf = fn(i, a[0]), vf = sel(i, a, 1); const d = new CsDict(); for (const v of s) { const k = kf(v); if (d.has(k)) throw new CsException('ArgumentException', `An item with the same key has already been added. Key: ${fmt(k)}`); d.set(k, vf ? vf(v) : v, i); } return d; });
    E('Sum', (i, s, a) => { const f = sel(i, a, 0); let t = 0; for (const v of s) { const x = f ? f(v) : v; if (x != null) t += num(x); } return t; }, (ta, at, ga, ot) => (at && at[0] ? 'double' : isIntegral(elemTOf(ta, at, ga, ot)) ? 'int' : 'double'));
    E('Average', (i, s, a) => { const f = sel(i, a, 0); if (!s.length) throw new CsException('InvalidOperationException', 'Sequence contains no elements'); let t = 0; for (const v of s) t += num(f ? f(v) : v); return t / s.length; }, 'double');
    E('Min', (i, s, a) => { const f = sel(i, a, 0); if (!s.length) throw new CsException('InvalidOperationException', 'Sequence contains no elements'); let best = null; for (const v of s) { const x = f ? f(v) : v; if (x == null) continue; if (best == null || userCmp(i, x, best) < 0) best = x; } return best; }, (ta, at, ga, ot) => (at && at[0] ? null : elemTOf(ta, at, ga, ot)));
    E('Max', (i, s, a) => { const f = sel(i, a, 0); if (!s.length) throw new CsException('InvalidOperationException', 'Sequence contains no elements'); let best = null; for (const v of s) { const x = f ? f(v) : v; if (x == null) continue; if (best == null || userCmp(i, x, best) > 0) best = x; } return best; }, (ta, at, ga, ot) => (at && at[0] ? null : elemTOf(ta, at, ga, ot)));
    E('MinBy', (i, s, a) => { const f = fn(i, a[0]); if (!s.length) throw new CsException('InvalidOperationException', 'Sequence contains no elements'); let best = s[0], bk = f(s[0]); for (const v of s) { const k = f(v); if (userCmp(i, k, bk) < 0) { best = v; bk = k; } } return best; }, elemTOf);
    E('MaxBy', (i, s, a) => { const f = fn(i, a[0]); if (!s.length) throw new CsException('InvalidOperationException', 'Sequence contains no elements'); let best = s[0], bk = f(s[0]); for (const v of s) { const k = f(v); if (userCmp(i, k, bk) > 0) { best = v; bk = k; } } return best; }, elemTOf);
    E('Count', (i, s, a) => (a.length ? s.filter((v) => truthy(fn(i, a[0])(v))).length : s.length), 'int'); E('LongCount', (i, s, a) => (a.length ? s.filter((v) => truthy(fn(i, a[0])(v))).length : s.length), 'long');
    E('Any', (i, s, a) => (a.length ? s.some((v) => truthy(fn(i, a[0])(v))) : s.length > 0), 'bool'); E('All', (i, s, a) => s.every((v) => truthy(fn(i, a[0])(v))), 'bool');
    E('First', (i, s, a) => { const r = a.length ? s.find((v) => truthy(fn(i, a[0])(v))) : s[0]; if (r === undefined) throw new CsException('InvalidOperationException', a.length ? 'Sequence contains no matching element' : 'Sequence contains no elements'); return r; }, elemTOf);
    E('FirstOrDefault', (i, s, a, ta, self) => { const f = a.length && (a[0] instanceof CsFunc || typeof a[0] === 'function') ? fn(i, a[0]) : null; const r = f ? s.find((v) => truthy(f(v))) : s[0]; if (r === undefined) return a.length && !f ? a[0] : a.length > 1 ? a[1] : i.defaultValue(elemOf(self)); return r; }, elemTOf);
    E('Last', (i, s, a) => { const f = a.length ? fn(i, a[0]) : null; for (let k = s.length - 1; k >= 0; k--) if (!f || truthy(f(s[k]))) return s[k]; throw new CsException('InvalidOperationException', 'Sequence contains no elements'); }, elemTOf);
    E('LastOrDefault', (i, s, a, ta, self) => { const f = a.length && (a[0] instanceof CsFunc || typeof a[0] === 'function') ? fn(i, a[0]) : null; for (let k = s.length - 1; k >= 0; k--) if (!f || truthy(f(s[k]))) return s[k]; return a.length && !f ? a[0] : i.defaultValue(elemOf(self)); }, elemTOf);
    E('Single', (i, s, a) => { const r = a.length ? s.filter((v) => truthy(fn(i, a[0])(v))) : s; if (r.length !== 1) throw new CsException('InvalidOperationException', r.length ? 'Sequence contains more than one element' : 'Sequence contains no elements'); return r[0]; }, elemTOf);
    E('SingleOrDefault', (i, s, a, ta, self) => { const r = a.length ? s.filter((v) => truthy(fn(i, a[0])(v))) : s; if (r.length > 1) throw new CsException('InvalidOperationException', 'Sequence contains more than one element'); return r.length ? r[0] : i.defaultValue(elemOf(self)); }, elemTOf);
    E('ElementAt', (i, s, a) => { const k = num(a[0]); if (k < 0 || k >= s.length) throw new CsException('ArgumentOutOfRangeException', 'Index was out of range.'); return s[k]; }, elemTOf); E('ElementAtOrDefault', (i, s, a, ta, self) => (s[num(a[0])] === undefined ? i.defaultValue(elemOf(self)) : s[num(a[0])]), elemTOf);
    E('Take', (i, s, a, ta, self) => outList(i, s.slice(0, Math.max(0, num(a[0]))), elemOf(self)), seqT()); E('Skip', (i, s, a, ta, self) => outList(i, s.slice(Math.max(0, num(a[0]))), elemOf(self)), seqT());
    E('TakeLast', (i, s, a, ta, self) => outList(i, num(a[0]) > 0 ? s.slice(-num(a[0])) : [], elemOf(self)), seqT()); E('SkipLast', (i, s, a, ta, self) => outList(i, s.slice(0, s.length - num(a[0])), elemOf(self)), seqT());
    E('TakeWhile', (i, s, a, ta, self) => { const f = fn(i, a[0]); const out = []; for (const v of s) { if (!truthy(f(v))) break; out.push(v); } return outList(i, out, elemOf(self)); }, seqT()); E('SkipWhile', (i, s, a, ta, self) => { const f = fn(i, a[0]); let k = 0; while (k < s.length && truthy(f(s[k]))) k++; return outList(i, s.slice(k), elemOf(self)); }, seqT());
    E('Reverse', (i, s, a, ta, self) => outList(i, s.slice().reverse(), elemOf(self)), seqT());
    E('Distinct', (i, s, a, ta, self) => { const seen = new Set(); return outList(i, s.filter((v) => { const k = keyOf(v); if (seen.has(k)) return false; seen.add(k); return true; }), elemOf(self)); }, seqT());
    E('DistinctBy', (i, s, a, ta, self) => { const f = fn(i, a[0]); const seen = new Set(); return outList(i, s.filter((v) => { const k = keyOf(f(v)); if (seen.has(k)) return false; seen.add(k); return true; }), elemOf(self)); }, seqT());
    E('Contains', (i, s, a) => s.some((v) => csEquals(v, a[0], i)), 'bool');
    E('Concat', (i, s, a, ta, self) => outList(i, s.concat(seq(i, a[0])), elemOf(self)), seqT()); E('Append', (i, s, a, ta, self) => outList(i, s.concat([a[0]]), elemOf(self)), seqT()); E('Prepend', (i, s, a, ta, self) => outList(i, [a[0]].concat(s), elemOf(self)), seqT());
    E('Union', (i, s, a, ta, self) => { const seen = new Set(); return outList(i, s.concat(seq(i, a[0])).filter((v) => { const k = keyOf(v); if (seen.has(k)) return false; seen.add(k); return true; }), elemOf(self)); }, seqT());
    E('Intersect', (i, s, a, ta, self) => { const ks = new Set(seq(i, a[0]).map(keyOf)); const seen = new Set(); return outList(i, s.filter((v) => { const k = keyOf(v); if (!ks.has(k) || seen.has(k)) return false; seen.add(k); return true; }), elemOf(self)); }, seqT());
    E('Except', (i, s, a, ta, self) => { const ks = new Set(seq(i, a[0]).map(keyOf)); const seen = new Set(); return outList(i, s.filter((v) => { const k = keyOf(v); if (ks.has(k) || seen.has(k)) return false; seen.add(k); return true; }), elemOf(self)); }, seqT());
    E('Zip', (i, s, a) => { const o = seq(i, a[0]); const n = Math.min(s.length, o.length); const f = a.length > 1 ? fn(i, a[1]) : null; return outList(i, Array.from({ length: n }, (_, k) => (f ? f(s[k], o[k]) : new CsTuple([s[k], o[k]], ['First', 'Second']))), null); }, seqT(() => null));
    E('Aggregate', (i, s, a) => { if (a.length === 1) { const f = fn(i, a[0]); if (!s.length) throw new CsException('InvalidOperationException', 'Sequence contains no elements'); return s.slice(1).reduce((acc, v) => f(acc, v), s[0]); } const f = fn(i, a[1]); const r = s.reduce((acc, v) => f(acc, v), a[0]); return a.length > 2 ? fn(i, a[2])(r) : r; });
    E('GroupBy', (i, s, a) => { const kf = fn(i, a[0]); const vf = a.length > 1 && (a[1] instanceof CsFunc || typeof a[1] === 'function') ? fn(i, a[1]) : null; const m = new Map(); for (const v of s) { const k = kf(v); const kk = keyOf(k); if (!m.has(kk)) m.set(kk, new CsGrouping(k, [])); m.get(kk).items.push(vf ? vf(v) : v); } return outList(i, [...m.values()], 'IGrouping'); }, 'IEnumerable<IGrouping>');
    E('ToLookup', (i, s, a) => { const kf = fn(i, a[0]); const m = new Map(); for (const v of s) { const k = kf(v); const kk = keyOf(k); if (!m.has(kk)) m.set(kk, new CsGrouping(k, [])); m.get(kk).items.push(v); } return outList(i, [...m.values()], 'IGrouping'); });
    E('SequenceEqual', (i, s, a) => { const o = seq(i, a[0]); return s.length === o.length && s.every((v, k) => csEquals(v, o[k], i)); }, 'bool');
    E('Chunk', (i, s, a, ta, self) => { const n = num(a[0]); const out = []; for (let k = 0; k < s.length; k += n) out.push(arr(s.slice(k, k + n), elemOf(self))); return outList(i, out, (elemOf(self) || 'object') + '[]'); });
    E('Cast', (i, s, a, ta, self) => outList(i, s.slice(), ta && ta[0]), (ta) => `IEnumerable<${ta && ta[0] || 'object'}>`); E('OfType', (i, s, a, ta) => outList(i, s.filter((v) => i.isType(v, ta[0])), ta && ta[0]), (ta) => `IEnumerable<${ta && ta[0] || 'object'}>`);
    E('AsEnumerable', (i, s, a, ta, self) => self, seqT()); E('AsReadOnly', (i, s, a, ta, self) => self, seqT()); E('AsQueryable', (i, s, a, ta, self) => self, seqT());
    E('DefaultIfEmpty', (i, s, a, ta, self) => (s.length ? self : outList(i, [a.length ? a[0] : i.defaultValue(elemOf(self))], elemOf(self))), seqT());
    E('Index', (i, s) => outList(i, s.map((v, k) => new CsTuple([k, v], ['Index', 'Item'])), 'Tuple'));
    E('ForEach', (i, s, a) => { const f = fn(i, a[0]); s.forEach((v) => f(v)); }, 'void');
    E('Join', (i, s, a) => { const o = seq(i, a[0]); const ok = fn(i, a[1]), ik = fn(i, a[2]), rs = fn(i, a[3]); const out = []; for (const x of s) for (const y of o) if (csEquals(ok(x), ik(y), i)) out.push(rs(x, y)); return outList(i, out, null); });
    T({ name: 'Enumerable', kind: 'static', statics: {
      Range: sfn((i, a) => { const st = num(a[0]), n = num(a[1]); if (n < 0) throw new CsException('ArgumentOutOfRangeException', 'count'); return arr(Array.from({ length: n }, (_, k) => st + k), 'int'); }, 'IEnumerable<int>'),
      Repeat: sfn((i, a) => arr(Array.from({ length: num(a[1]) }, () => a[0]), runtimeType(a[0])), (ta) => `IEnumerable<${ta && ta[0] || 'object'}>`),
      Empty: sfn((i, a, ta) => arr([], ta && ta[0]), (ta) => `IEnumerable<${ta && ta[0] || 'object'}>`)
    } });
    T({ name: 'IEnumerable', kind: 'interface', isInstance: isSeq });
    ['ICollection', 'IList', 'IReadOnlyList', 'IReadOnlyCollection'].forEach((n) => { if (!interp.types.has(n)) T({ name: n, kind: 'interface', isInstance: isSeq }); });

    // 배열 · 문자열에도 컬렉션 인터페이스 멤버 (Length 는 배열 설명자에 있음)
    interp.defExtension('Length', () => { throw new CsException('CompileError', 'Length 는 속성입니다: 괄호 없이 .Length 로 쓰세요'); }, 'int', () => false);
  }

  const api = { install, CsList, CsDict, CsKvp, CsSet, CsQueue, CsStack, CsGrouping, CsStringBuilder, CsRandom, CsStopwatch, CsTimeSpan, CsDateTime, arr, seq, num, str, chr };
  root.CsStdlib = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
