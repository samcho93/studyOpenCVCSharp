/* 이미지 창 · 확대 보기 (머신비전용)
 *  - MVImage.Window: 결과 창에 붙는 이미지 창 (cv2.imshow / cv::imshow). 같은 이름이면 같은 창을 새로 그림(라이브 영상)
 *    마우스를 올리면 좌표 (x, y) 와 픽셀 값(Gray 또는 B,G,R)을 표시, 누르면 확대 보기
 *  - MVImage.Viewer: 확대 보기 (휠 확대 · 끌어서 이동 · 1:1 · 맞춤 · 픽셀 격자와 값 표시 · PNG 저장)
 *  - raw 픽셀 형식: 8비트, ch = 1(gray) / 3(BGR) / 4(BGRA)
 */
(function () {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** raw → ImageData (RGBA) */
  function toImageData(w, h, ch, bytes, reuse) {
    const id = reuse && reuse.width === w && reuse.height === h ? reuse : new ImageData(w, h);
    const d = id.data;
    const n = w * h;
    if (ch === 1) {
      for (let i = 0, j = 0; i < n; i++, j += 4) { const v = bytes[i]; d[j] = v; d[j + 1] = v; d[j + 2] = v; d[j + 3] = 255; }
    } else if (ch === 3) {
      for (let i = 0, j = 0, k = 0; i < n; i++, j += 4, k += 3) { d[j] = bytes[k + 2]; d[j + 1] = bytes[k + 1]; d[j + 2] = bytes[k]; d[j + 3] = 255; }
    } else {
      for (let i = 0, j = 0; i < n; i++, j += 4) { d[j] = bytes[j + 2]; d[j + 1] = bytes[j + 1]; d[j + 2] = bytes[j]; d[j + 3] = bytes[j + 3]; }
    }
    return id;
  }

  /** 픽셀 값 문자열 */
  function pixelText(img, x, y) {
    if (!img || x < 0 || y < 0 || x >= img.w || y >= img.h) return '';
    const i = (y * img.w + x) * img.ch;
    const b = img.bytes;
    if (img.ch === 1) return `(${x}, ${y})  I=${b[i]}`;
    if (img.ch === 3) return `(${x}, ${y})  B=${b[i]} G=${b[i + 1]} R=${b[i + 2]}`;
    return `(${x}, ${y})  B=${b[i]} G=${b[i + 1]} R=${b[i + 2]} A=${b[i + 3]}`;
  }

  /** ImageData / 캔버스 → raw 형식 (URL 이미지를 확대 보기에서 쓰기 위해) */
  function rawFromCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const n = canvas.width * canvas.height;
    const bytes = new Uint8Array(n * 3);
    let gray = true;
    for (let i = 0, j = 0; i < n; i++, j += 4) {
      bytes[i * 3] = d[j + 2]; bytes[i * 3 + 1] = d[j + 1]; bytes[i * 3 + 2] = d[j];
      if (gray && (d[j] !== d[j + 1] || d[j] !== d[j + 2])) gray = false;
    }
    if (gray) { const g = new Uint8Array(n); for (let i = 0; i < n; i++) g[i] = bytes[i * 3]; return { w: canvas.width, h: canvas.height, ch: 1, bytes: g }; }
    return { w: canvas.width, h: canvas.height, ch: 3, bytes };
  }

  // ------------------------------------------------------------------ 이미지 창 (결과 창)
  class Window {
    constructor(name, opts = {}) {
      this.name = name;
      this.frames = 0;
      this.t0 = performance.now();
      this.el = document.createElement('div');
      this.el.className = 'imwin';
      this.el.innerHTML = `<div class="imwin-bar"><span class="imwin-name">🖼 ${esc(name)}</span><span class="imwin-dim"></span>
        <span class="spacer"></span><span class="imwin-px"></span>
        <button class="imwin-btn" data-a="zoom" title="확대 보기 (좌표 · 픽셀 값)">⤢</button>
        <button class="imwin-btn" data-a="save" title="PNG 로 저장">⬇</button></div>
        <div class="imwin-body"><canvas></canvas></div>`;
      this.canvas = this.el.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.dimEl = this.el.querySelector('.imwin-dim');
      this.pxEl = this.el.querySelector('.imwin-px');
      this.img = null;
      this.imageData = null;
      this.canvas.addEventListener('mousemove', (e) => {
        if (!this.img) return;
        const r = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - r.left) * this.img.w / r.width);
        const y = Math.floor((e.clientY - r.top) * this.img.h / r.height);
        this.pxEl.textContent = pixelText(this.img, x, y);
      });
      this.canvas.addEventListener('mouseleave', () => { this.pxEl.textContent = ''; });
      this.canvas.addEventListener('click', () => this.zoom());
      this.el.querySelector('[data-a="zoom"]').onclick = () => this.zoom();
      this.el.querySelector('[data-a="save"]').onclick = () => this.save();
      if (opts.maxHeight) this.el.style.setProperty('--imwin-max-h', opts.maxHeight);
    }

    update(w, h, ch, bytes) {
      this.img = { w, h, ch, bytes };
      if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; this.imageData = null; }
      this.imageData = toImageData(w, h, ch, bytes, this.imageData);
      this.ctx.putImageData(this.imageData, 0, 0);
      this.frames++;
      const fps = this.frames > 2 ? ` · ${(this.frames / ((performance.now() - this.t0) / 1000)).toFixed(1)} fps` : '';
      this.dimEl.textContent = `${w}×${h} ${ch === 1 ? 'Gray' : ch === 3 ? 'BGR' : 'BGRA'}${this.frames > 1 ? ` · #${this.frames}${fps}` : ''}`;
      if (this.viewer && this.viewer.isOpen()) this.viewer.setImage(this.img, this.name);
    }

    zoom() {
      if (!this.img) return;
      this.viewer = Viewer.open(this.img, this.name);
    }

    save() {
      const a = document.createElement('a');
      a.download = (this.name || 'image').replace(/[^\w가-힣.-]+/g, '_') + '.png';
      a.href = this.canvas.toDataURL('image/png');
      a.click();
    }
  }

  // ------------------------------------------------------------------ 확대 보기
  class Viewer {
    static open(img, title, opts = {}) {
      if (Viewer.current) Viewer.current.close();
      const v = new Viewer(opts);
      v.setImage(img, title);
      v.fit();
      Viewer.current = v;
      return v;
    }

    /** 이미지 URL(그래프 · 파일)로 열기 */
    static openUrl(src, title) {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement('canvas');
        c.width = im.naturalWidth; c.height = im.naturalHeight;
        c.getContext('2d').drawImage(im, 0, 0);
        Viewer.open(rawFromCanvas(c), title);
      };
      im.src = src;
    }

    constructor() {
      const host = document.fullscreenElement || document.querySelector('.deck-wrap.pfull') || document.body;
      this.el = document.createElement('div');
      this.el.className = 'iv-back';
      this.el.innerHTML = `<div class="iv-card">
        <div class="iv-head"><b class="iv-title"></b><span class="iv-dim muted"></span><span class="spacer"></span>
          <span class="iv-px"></span>
          <button class="btn small ghost" data-a="fit" title="창에 맞춤 (0)">맞춤</button>
          <button class="btn small ghost" data-a="one" title="실제 크기 1:1 (1)">1:1</button>
          <button class="btn small ghost" data-a="in" title="확대 (+)">＋</button>
          <button class="btn small ghost" data-a="out" title="축소 (−)">－</button>
          <button class="btn small ghost" data-a="save" title="PNG 저장">⬇</button>
          <button class="btn small ghost" data-a="close" title="닫기 (Esc)">✕</button></div>
        <div class="iv-stage"><canvas></canvas></div>
        <div class="iv-foot muted">휠: 확대/축소 · 끌기: 이동 · 16배 이상 확대하면 픽셀 값이 보입니다</div></div>`;
      host.appendChild(this.el);
      this.stage = this.el.querySelector('.iv-stage');
      this.canvas = this.el.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.src = document.createElement('canvas');
      this.scale = 1; this.ox = 0; this.oy = 0;
      this.el.addEventListener('click', (e) => {
        if (e.target === this.el) return this.close();
        const a = e.target.closest('[data-a]');
        if (!a) return;
        const k = a.dataset.a;
        if (k === 'close') this.close();
        else if (k === 'fit') this.fit();
        else if (k === 'one') this.zoomAt(1 / this.scale);
        else if (k === 'in') this.zoomAt(1.5);
        else if (k === 'out') this.zoomAt(1 / 1.5);
        else if (k === 'save') { const l = document.createElement('a'); l.download = 'image.png'; l.href = this.src.toDataURL('image/png'); l.click(); }
      });
      this.onKey = (e) => {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.close(); }
        else if (e.key === '+' || e.key === '=') this.zoomAt(1.5);
        else if (e.key === '-') this.zoomAt(1 / 1.5);
        else if (e.key === '0') this.fit();
        else if (e.key === '1') this.zoomAt(1 / this.scale);
      };
      document.addEventListener('keydown', this.onKey, true);
      this.stage.addEventListener('wheel', (e) => {
        e.preventDefault();
        const r = this.stage.getBoundingClientRect();
        this.zoomAt(e.deltaY < 0 ? 1.25 : 0.8, e.clientX - r.left, e.clientY - r.top);
      }, { passive: false });
      let drag = null;
      this.stage.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, ox: this.ox, oy: this.oy }; this.stage.setPointerCapture(e.pointerId); });
      this.stage.addEventListener('pointermove', (e) => {
        if (drag) { this.ox = drag.ox + (e.clientX - drag.x); this.oy = drag.oy + (e.clientY - drag.y); this.draw(); }
        const r = this.stage.getBoundingClientRect();
        const x = Math.floor((e.clientX - r.left - this.ox) / this.scale);
        const y = Math.floor((e.clientY - r.top - this.oy) / this.scale);
        this.el.querySelector('.iv-px').textContent = pixelText(this.img, x, y);
      });
      this.stage.addEventListener('pointerup', () => { drag = null; });
      this.ro = new ResizeObserver(() => this.draw());
      this.ro.observe(this.stage);
    }

    isOpen() { return !!this.el.isConnected; }

    setImage(img, title) {
      this.img = img;
      this.src.width = img.w; this.src.height = img.h;
      this.src.getContext('2d').putImageData(toImageData(img.w, img.h, img.ch, img.bytes), 0, 0);
      this.el.querySelector('.iv-title').textContent = title || '';
      this.el.querySelector('.iv-dim').textContent = ` ${img.w}×${img.h} ${img.ch === 1 ? 'Gray' : img.ch === 3 ? 'BGR' : 'BGRA'}`;
      this.draw();
    }

    fit() {
      const r = this.stage.getBoundingClientRect();
      if (!this.img || !r.width) return;
      this.scale = Math.min(r.width / this.img.w, r.height / this.img.h);
      this.ox = (r.width - this.img.w * this.scale) / 2;
      this.oy = (r.height - this.img.h * this.scale) / 2;
      this.draw();
    }

    zoomAt(f, cx, cy) {
      const r = this.stage.getBoundingClientRect();
      if (cx == null) { cx = r.width / 2; cy = r.height / 2; }
      const ns = Math.max(0.05, Math.min(64, this.scale * f));
      f = ns / this.scale;
      this.ox = cx - (cx - this.ox) * f;
      this.oy = cy - (cy - this.oy) * f;
      this.scale = ns;
      this.draw();
    }

    draw() {
      const r = this.stage.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (!r.width) return;
      this.canvas.width = Math.round(r.width * dpr); this.canvas.height = Math.round(r.height * dpr);
      this.canvas.style.width = r.width + 'px'; this.canvas.style.height = r.height + 'px';
      const ctx = this.ctx;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#202225';
      ctx.fillRect(0, 0, r.width, r.height);
      if (!this.img) return;
      ctx.imageSmoothingEnabled = this.scale < 1;
      ctx.drawImage(this.src, this.ox, this.oy, this.img.w * this.scale, this.img.h * this.scale);
      const s = this.scale;
      if (s >= 8) {
        // 픽셀 격자 (+ 16배 이상이면 값)
        const x0 = Math.max(0, Math.floor(-this.ox / s)), y0 = Math.max(0, Math.floor(-this.oy / s));
        const x1 = Math.min(this.img.w, Math.ceil((r.width - this.ox) / s)), y1 = Math.min(this.img.h, Math.ceil((r.height - this.oy) / s));
        ctx.strokeStyle = 'rgba(128,128,128,.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = x0; x <= x1; x++) { const px = Math.round(this.ox + x * s) + 0.5; ctx.moveTo(px, this.oy + y0 * s); ctx.lineTo(px, this.oy + y1 * s); }
        for (let y = y0; y <= y1; y++) { const py = Math.round(this.oy + y * s) + 0.5; ctx.moveTo(this.ox + x0 * s, py); ctx.lineTo(this.ox + x1 * s, py); }
        ctx.stroke();
        if (s >= 16 && (x1 - x0) * (y1 - y0) < 6000) {
          const b = this.img.bytes, ch = this.img.ch, w = this.img.w;
          ctx.font = `${Math.min(13, s / (ch === 1 ? 2.6 : 3.4))}px JetBrains Mono, monospace`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
            const i = (y * w + x) * ch;
            const lum = ch === 1 ? b[i] : 0.114 * b[i] + 0.587 * b[i + 1] + 0.299 * b[i + 2];
            ctx.fillStyle = lum > 128 ? '#000' : '#fff';
            const cx = this.ox + (x + 0.5) * s, cy = this.oy + (y + 0.5) * s;
            if (ch === 1) ctx.fillText(String(b[i]), cx, cy);
            else { const lh = s / 4; ctx.fillText(String(b[i + 2]), cx, cy - lh); ctx.fillText(String(b[i + 1]), cx, cy); ctx.fillText(String(b[i]), cx, cy + lh); }
          }
        }
      }
    }

    close() {
      document.removeEventListener('keydown', this.onKey, true);
      if (this.ro) this.ro.disconnect();
      this.el.remove();
      if (Viewer.current === this) Viewer.current = null;
    }
  }

  window.MVImage = { Window, Viewer, toImageData, pixelText, rawFromCanvas };
})();
