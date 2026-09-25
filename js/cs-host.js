/* 실행 호스트 공용 도구 — PNG 인코더/디코더(순수 JS), 가상 작업 폴더, 카메라 시뮬레이션 (워커 · Node 공용) */
(function (root) {
  'use strict';

  // ================================================================== CRC32 · Adler32
  const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(buf, start = 0, end = buf.length) { let c = 0xffffffff; for (let i = start; i < end; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function adler32(buf) { let a = 1, b = 0; for (let i = 0; i < buf.length; i++) { a = (a + buf[i]) % 65521; b = (b + a) % 65521; } return ((b << 16) | a) >>> 0; }

  // ================================================================== zlib 저장(stored) 압축 — 빠르고 단순
  function zlibStore(data) {
    const blocks = Math.ceil(data.length / 65535) || 1;
    const out = new Uint8Array(2 + data.length + blocks * 5 + 4);
    let p = 0;
    out[p++] = 0x78; out[p++] = 0x01;
    for (let i = 0; i < blocks; i++) {
      const start = i * 65535, len = Math.min(65535, data.length - start);
      out[p++] = i === blocks - 1 ? 1 : 0;
      out[p++] = len & 255; out[p++] = len >> 8; out[p++] = (~len) & 255; out[p++] = ((~len) >> 8) & 255;
      out.set(data.subarray(start, start + len), p); p += len;
    }
    const ad = adler32(data);
    out[p++] = ad >>> 24; out[p++] = (ad >>> 16) & 255; out[p++] = (ad >>> 8) & 255; out[p++] = ad & 255;
    return out.subarray(0, p);
  }

  // ================================================================== inflate (RFC1951) — 작은 구현
  function inflate(src) {
    let pos = 0, bit = 0;
    const out = []; // 바이트 배열 (Array 는 느리므로 Uint8Array 확장)
    let buf = new Uint8Array(Math.max(1024, src.length * 4)), len = 0;
    const push = (b) => { if (len >= buf.length) { const nb = new Uint8Array(buf.length * 2); nb.set(buf); buf = nb; } buf[len++] = b; };
    const bits = (n) => { let v = 0; for (let i = 0; i < n; i++) { if (pos >= src.length) throw new Error('inflate: 데이터 끝'); v |= ((src[pos] >> bit) & 1) << i; bit++; if (bit === 8) { bit = 0; pos++; } } return v; };
    const build = (lengths) => { const maxLen = Math.max(...lengths); const count = new Array(maxLen + 1).fill(0); lengths.forEach((l) => { if (l) count[l]++; }); const next = new Array(maxLen + 2).fill(0); for (let l = 1; l <= maxLen; l++) next[l + 1] = (next[l] + count[l]) << 1; const codes = {}; const nextCode = next.slice(); for (let s = 0; s < lengths.length; s++) { const l = lengths[s]; if (!l) continue; codes[l + ':' + (nextCode[l]++)] = s; } return { codes, maxLen }; };
    const decode = (h) => { let code = 0; for (let l = 1; l <= h.maxLen; l++) { code = (code << 1) | bits(1); const s = h.codes[l + ':' + code]; if (s !== undefined) return s; } throw new Error('inflate: 잘못된 허프만 코드'); };
    const LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258], LEXT = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
    const DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577], DEXT = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
    let fixedL = null, fixedD = null;
    while (true) {
      const final = bits(1), type = bits(2);
      if (type === 0) {
        if (bit) { bit = 0; pos++; }
        const n = src[pos] | (src[pos + 1] << 8); pos += 4;
        for (let i = 0; i < n; i++) push(src[pos++]);
      } else {
        let hl, hd;
        if (type === 1) {
          if (!fixedL) { const l = new Array(288).fill(8); for (let i = 144; i < 256; i++) l[i] = 9; for (let i = 256; i < 280; i++) l[i] = 7; fixedL = build(l); fixedD = build(new Array(30).fill(5)); }
          hl = fixedL; hd = fixedD;
        } else if (type === 2) {
          const hlit = bits(5) + 257, hdist = bits(5) + 1, hclen = bits(4) + 4;
          const order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
          const cl = new Array(19).fill(0); for (let i = 0; i < hclen; i++) cl[order[i]] = bits(3);
          const hc = build(cl);
          const lengths = [];
          while (lengths.length < hlit + hdist) { const s = decode(hc); if (s < 16) lengths.push(s); else if (s === 16) { const prev = lengths[lengths.length - 1]; const r = bits(2) + 3; for (let i = 0; i < r; i++) lengths.push(prev); } else if (s === 17) { const r = bits(3) + 3; for (let i = 0; i < r; i++) lengths.push(0); } else { const r = bits(7) + 11; for (let i = 0; i < r; i++) lengths.push(0); } }
          hl = build(lengths.slice(0, hlit)); hd = build(lengths.slice(hlit));
        } else throw new Error('inflate: 잘못된 블록 형식');
        while (true) {
          const s = decode(hl);
          if (s < 256) push(s);
          else if (s === 256) break;
          else { const li = s - 257; const l = LBASE[li] + bits(LEXT[li]); const di = decode(hd); const d = DBASE[di] + bits(DEXT[di]); for (let i = 0; i < l; i++) push(buf[len - d]); }
        }
      }
      if (final) break;
    }
    return buf.subarray(0, len);
  }

  // ================================================================== PNG
  const SIG = [137, 80, 78, 71, 13, 10, 26, 10];
  function be32(v) { return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255]; }
  function chunk(type, data) { const t = [...type].map((c) => c.charCodeAt(0)); const body = new Uint8Array(4 + data.length); body.set(t, 0); body.set(data, 4); const crc = crc32(body); return [...be32(data.length), ...body, ...be32(crc)]; }
  /** raw {w,h,ch(1|3|4), bytes(BGR 순서)} → PNG 바이트 */
  function encodePng(raw) {
    const { w, h, ch, bytes } = raw;
    const colorType = ch === 1 ? 0 : ch === 3 ? 2 : 6;
    const stride = w * ch;
    const filtered = new Uint8Array((stride + 1) * h);
    for (let y = 0; y < h; y++) {
      filtered[y * (stride + 1)] = 0;
      const rowIn = y * stride, rowOut = y * (stride + 1) + 1;
      if (ch === 1) filtered.set(bytes.subarray(rowIn, rowIn + stride), rowOut);
      else if (ch === 3) for (let x = 0; x < w; x++) { const i = rowIn + x * 3, o = rowOut + x * 3; filtered[o] = bytes[i + 2]; filtered[o + 1] = bytes[i + 1]; filtered[o + 2] = bytes[i]; }
      else for (let x = 0; x < w; x++) { const i = rowIn + x * 4, o = rowOut + x * 4; filtered[o] = bytes[i + 2]; filtered[o + 1] = bytes[i + 1]; filtered[o + 2] = bytes[i]; filtered[o + 3] = bytes[i + 3]; }
    }
    const ihdr = new Uint8Array([...be32(w), ...be32(h), 8, colorType, 0, 0, 0]);
    const idat = (root.CsHostZlib && root.CsHostZlib.deflate) ? root.CsHostZlib.deflate(filtered) : zlibStore(filtered);
    return new Uint8Array([...SIG, ...chunk('IHDR', ihdr), ...chunk('IDAT', idat), ...chunk('IEND', new Uint8Array(0))]);
  }
  /** PNG 바이트 → raw {w,h,ch,bytes(BGR)} (8비트 · 비인터레이스만) */
  function decodePng(png) {
    for (let i = 0; i < 8; i++) if (png[i] !== SIG[i]) throw new Error('PNG 형식이 아닙니다');
    let p = 8, w = 0, h = 0, depth = 8, colorType = 0, interlace = 0;
    const idats = []; let palette = null, trns = null;
    while (p < png.length) {
      const len = (png[p] << 24 | png[p + 1] << 16 | png[p + 2] << 8 | png[p + 3]) >>> 0;
      const type = String.fromCharCode(png[p + 4], png[p + 5], png[p + 6], png[p + 7]);
      const data = png.subarray(p + 8, p + 8 + len);
      if (type === 'IHDR') { w = (data[0] << 24 | data[1] << 16 | data[2] << 8 | data[3]) >>> 0; h = (data[4] << 24 | data[5] << 16 | data[6] << 8 | data[7]) >>> 0; depth = data[8]; colorType = data[9]; interlace = data[12]; }
      else if (type === 'IDAT') idats.push(data);
      else if (type === 'PLTE') palette = data;
      else if (type === 'tRNS') trns = data;
      else if (type === 'IEND') break;
      p += 12 + len;
    }
    if (depth !== 8) throw new Error(`PNG 비트 깊이 ${depth} 는 지원하지 않습니다 (8비트만)`);
    if (interlace) throw new Error('인터레이스 PNG 는 지원하지 않습니다');
    const total = idats.reduce((s, d) => s + d.length, 0);
    const z = new Uint8Array(total); let o = 0; for (const d of idats) { z.set(d, o); o += d.length; }
    const raw = (root.CsHostZlib && root.CsHostZlib.inflate) ? root.CsHostZlib.inflate(z) : inflate(z.subarray(2));
    const chIn = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
    const stride = w * chIn;
    const px = new Uint8Array(stride * h);
    let prev = new Uint8Array(stride);
    for (let y = 0; y < h; y++) {
      const f = raw[y * (stride + 1)];
      const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
      const cur = px.subarray(y * stride, (y + 1) * stride);
      for (let i = 0; i < stride; i++) {
        const a = i >= chIn ? cur[i - chIn] : 0, b = prev[i], c = i >= chIn ? prev[i - chIn] : 0;
        let v = line[i];
        switch (f) { case 1: v += a; break; case 2: v += b; break; case 3: v += (a + b) >> 1; break; case 4: { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; break; } default: break; }
        cur[i] = v & 255;
      }
      prev = cur;
    }
    // BGR 로 변환
    let ch, bytes;
    if (colorType === 0) { ch = 1; bytes = px; }
    else if (colorType === 2) { ch = 3; bytes = new Uint8Array(w * h * 3); for (let i = 0; i < w * h; i++) { bytes[3 * i] = px[3 * i + 2]; bytes[3 * i + 1] = px[3 * i + 1]; bytes[3 * i + 2] = px[3 * i]; } }
    else if (colorType === 6) { ch = 4; bytes = new Uint8Array(w * h * 4); for (let i = 0; i < w * h; i++) { bytes[4 * i] = px[4 * i + 2]; bytes[4 * i + 1] = px[4 * i + 1]; bytes[4 * i + 2] = px[4 * i]; bytes[4 * i + 3] = px[4 * i + 3]; } }
    else if (colorType === 4) { ch = 1; bytes = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) bytes[i] = px[2 * i]; }
    else { ch = trns ? 4 : 3; bytes = new Uint8Array(w * h * ch); for (let i = 0; i < w * h; i++) { const k = px[i]; bytes[ch * i] = palette[3 * k + 2]; bytes[ch * i + 1] = palette[3 * k + 1]; bytes[ch * i + 2] = palette[3 * k]; if (ch === 4) bytes[4 * i + 3] = trns && k < trns.length ? trns[k] : 255; } }
    return { w, h, ch, bytes };
  }

  // ================================================================== 가상 작업 폴더
  /** files: Map path → { png?: Uint8Array, raw?: {w,h,ch,bytes}, bytes?: Uint8Array } */
  class VirtualFs {
    constructor() { this.files = new Map(); this.onWrite = null; }
    norm(p) { return String(p).replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/work\//, '').replace(/^\//, ''); }
    add(path, entry) { this.files.set(this.norm(path), entry); }
    exists(p) { return this.files.has(this.norm(p)); }
    read(p) { const e = this.files.get(this.norm(p)); if (!e) return null; if (e.bytes) return e.bytes; if (e.png) return e.png; if (e.raw) return encodePng(e.raw); return null; }
    readImage(p) {
      const e = this.files.get(this.norm(p));
      if (!e) return null;
      if (e.raw) return e.raw;
      const bytes = e.png || e.bytes;
      if (bytes && bytes.length > 8 && bytes[0] === 137 && bytes[1] === 80) { try { e.raw = decodePng(bytes); return e.raw; } catch (err) { return null; } }
      return null;
    }
    write(p, bytes, raw) { const n = this.norm(p); const e = { bytes }; if (raw) e.raw = raw; this.files.set(n, e); if (this.onWrite) this.onWrite(n, bytes, raw); }
    delete(p) { this.files.delete(this.norm(p)); }
    list(dir) { const d = dir ? this.norm(dir).replace(/\/$/, '') + '/' : ''; return [...this.files.keys()].filter((k) => (d === '/' || d === '' ? true : k.startsWith(d))); }
  }

  // ================================================================== 카메라 · 동영상 시뮬레이션
  /** fs 안의 images/conveyor_NN.png 프레임을 영상처럼 */
  function makeVideoHost(fs, note) {
    const frames = () => { const list = fs.list('images').filter((k) => /conveyor_\d+\.png$/.test(k)).sort(); return list.map((k) => fs.readImage(k)).filter(Boolean); };
    return {
      videoOpen(src) {
        const fr = frames();
        if (!fr.length) return null;
        const isCam = typeof src === 'number';
        if (!isCam && !/conveyor|camera|\.(mp4|avi|mov|mkv)$/i.test(src)) return null;
        const loops = isCam ? 3 : 1;
        return { frames: fr, pos: 0, count: fr.length * loops, w: fr[0].w, h: fr[0].h, fps: 30, ended: false, isCam, endNote: isCam ? `📷 시뮬레이션 카메라: ${fr.length * loops}프레임(컨베이어 영상 ${loops}회 반복) 뒤에 Read() 가 false 를 돌려줍니다. 실제 카메라는 끝나지 않으니 ESC 키 등으로 반복을 끝내는 코드를 넣으세요.` : `🎞 영상(${fr.length}프레임)이 끝났습니다.` };
      },
      videoRead(h) { if (h.pos >= h.count) { h.ended = true; return null; } const f = h.frames[h.pos % h.frames.length]; h.pos++; return f; },
      videoClose() {}
    };
  }

  const api = { crc32, adler32, zlibStore, inflate, encodePng, decodePng, VirtualFs, makeVideoHost };
  root.CsHost = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
