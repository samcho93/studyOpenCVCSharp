/* OpenCvSharp API 바인딩 ① — 기본 형식(Mat · MatType · Scalar · Point · Size · Rect · Vec · Moments …) 과 열거형
 *  OpenCV.js(전역 cv) 위에 OpenCvSharp4 와 같은 이름 · 시그니처를 제공한다. Cv2 정적 함수는 cs-opencv2.js.
 *  host: { cv, imshow(name,w,h,ch,bytes), fs: {readImage(path)→{w,h,ch,bytes}|null, exists, read, write}, waitKey(ms)→int, note(text), videoOpen(src), videoRead(h), encodePng(raw)→Uint8Array }
 */
(function (root) {
  'use strict';
  const R = root.CsRuntime || (typeof require === 'function' ? require('./cs-runtime.js') : null);
  const SL = root.CsStdlib || (typeof require === 'function' ? require('./cs-stdlib.js') : null);
  const { CsChar, CsEnumVal, CsTuple, CsFunc, CsException, Ref, coerce, fmt, csEquals, keyOf, runtimeType, describeVal, isIntegral, toNum } = R;
  const { CsList, arr, num, str } = SL;

  // ================================================================== 값 형식 (JS 클래스)
  const f2 = (v) => Math.fround(v);
  class Point { constructor(x = 0, y = 0) { this.X = x | 0; this.Y = y | 0; } csToString() { return `(x:${this.X} y:${this.Y})`; } csKey() { return this.X + ',' + this.Y; } csEquals(o) { return o instanceof Point && o.X === this.X && o.Y === this.Y; } csDeconstruct() { return [this.X, this.Y]; } }
  class Point2f { constructor(x = 0, y = 0) { this.X = f2(x); this.Y = f2(y); } csToString() { return `(x:${R.numToString(this.X, 'float')} y:${R.numToString(this.Y, 'float')})`; } csKey() { return this.X + ',' + this.Y; } csEquals(o) { return o instanceof Point2f && o.X === this.X && o.Y === this.Y; } csDeconstruct() { return [this.X, this.Y]; } }
  class Point2d { constructor(x = 0, y = 0) { this.X = +x; this.Y = +y; } csToString() { return `(x:${R.numToString(this.X)} y:${R.numToString(this.Y)})`; } csKey() { return this.X + ',' + this.Y; } csEquals(o) { return o instanceof Point2d && o.X === this.X && o.Y === this.Y; } csDeconstruct() { return [this.X, this.Y]; } }
  class Size { constructor(w = 0, h = 0) { this.Width = w | 0; this.Height = h | 0; } csToString() { return `(width:${this.Width} height:${this.Height})`; } csKey() { return this.Width + 'x' + this.Height; } csEquals(o) { return o instanceof Size && o.Width === this.Width && o.Height === this.Height; } csDeconstruct() { return [this.Width, this.Height]; } }
  class Size2f { constructor(w = 0, h = 0) { this.Width = f2(w); this.Height = f2(h); } csToString() { return `(width:${R.numToString(this.Width, 'float')} height:${R.numToString(this.Height, 'float')})`; } csKey() { return this.Width + 'x' + this.Height; } csEquals(o) { return o instanceof Size2f && o.Width === this.Width && o.Height === this.Height; } }
  class Rect { constructor(x = 0, y = 0, w = 0, h = 0) { this.X = x | 0; this.Y = y | 0; this.Width = w | 0; this.Height = h | 0; } csToString() { return `(x:${this.X} y:${this.Y} width:${this.Width} height:${this.Height})`; } csKey() { return [this.X, this.Y, this.Width, this.Height].join(','); } csEquals(o) { return o instanceof Rect && this.csKey() === o.csKey(); } csDeconstruct() { return [this.X, this.Y, this.Width, this.Height]; } }
  class Rect2d { constructor(x = 0, y = 0, w = 0, h = 0) { this.X = +x; this.Y = +y; this.Width = +w; this.Height = +h; } csToString() { return `(x:${this.X} y:${this.Y} width:${this.Width} height:${this.Height})`; } csKey() { return [this.X, this.Y, this.Width, this.Height].join(','); } }
  class RotatedRect { constructor(center, size, angle) { this.Center = center || new Point2f(); this.Size = size || new Size2f(); this.Angle = f2(angle || 0); } csToString() { return `(center:${this.Center.csToString()} size:${this.Size.csToString()} angle:${R.numToString(this.Angle, 'float')})`; } }
  class Scalar {
    constructor(v0 = 0, v1 = 0, v2 = 0, v3 = 0) { this.Val0 = +v0; this.Val1 = +v1; this.Val2 = +v2; this.Val3 = +v3; }
    csToString() { return `[${[this.Val0, this.Val1, this.Val2, this.Val3].map((v) => R.numToString(v)).join(', ')}]`; }
    csKey() { return [this.Val0, this.Val1, this.Val2, this.Val3].join(','); } csEquals(o) { return o instanceof Scalar && this.csKey() === o.csKey(); }
    toCv(cv) { return new cv.Scalar(this.Val0, this.Val1, this.Val2, this.Val3); }
    at(i) { return [this.Val0, this.Val1, this.Val2, this.Val3][i]; }
  }
  class Vec {
    constructor(name, n, type, items) { this.__name = name; this.__csTypeName = name; this.n = n; this.type = type; this.items = items || new Array(n).fill(0); }
    csToString() { return `${this.__name}(${this.items.map((v) => R.numToString(v)).join(', ')})`; }
    csKey() { return this.items.join(','); } csEquals(o) { return o instanceof Vec && o.csKey() === this.csKey(); }
  }
  class MatType {
    constructor(v) { this.Value = v | 0; }
    get Depth() { return this.Value & 7; } get Channels() { return (this.Value >> 3) + 1; }
    valueOf() { return this.Value; }
    csToString() { const d = ['CV_8U', 'CV_8S', 'CV_16U', 'CV_16S', 'CV_32S', 'CV_32F', 'CV_64F', 'CV_16F'][this.Depth]; return `${d}C${this.Channels}`; }
    csKey() { return this.Value; } csEquals(o) { return (o instanceof MatType && o.Value === this.Value) || (typeof o === 'number' && o === this.Value); }
    static make(depth, ch) { return new MatType((depth & 7) + ((ch - 1) << 3)); }
  }
  class Moments {
    constructor(m) { Object.assign(this, { M00: m.m00, M10: m.m10, M01: m.m01, M20: m.m20, M11: m.m11, M02: m.m02, M30: m.m30, M21: m.m21, M12: m.m12, M03: m.m03, Mu20: m.mu20, Mu11: m.mu11, Mu02: m.mu02, Mu30: m.mu30, Mu21: m.mu21, Mu12: m.mu12, Mu03: m.mu03, Nu20: m.nu20, Nu11: m.nu11, Nu02: m.nu02, Nu30: m.nu30, Nu21: m.nu21, Nu12: m.nu12, Nu03: m.nu03 }); }
    csToString() { return `Moments(m00=${R.numToString(this.M00)})`; }
  }
  class HierarchyIndex { constructor(v) { this.Next = v[0]; this.Previous = v[1]; this.Child = v[2]; this.Parent = v[3]; } csToString() { return `HierarchyIndex(next:${this.Next} prev:${this.Previous} child:${this.Child} parent:${this.Parent})`; } }
  class KeyPoint { constructor(pt, size, angle = -1, response = 0, octave = 0, classId = -1) { this.Pt = pt; this.Size = f2(size); this.Angle = f2(angle); this.Response = f2(response); this.Octave = octave; this.ClassId = classId; } csToString() { return `KeyPoint(${this.Pt.csToString()} size:${R.numToString(this.Size, 'float')})`; } }
  class DMatch { constructor(q, t, i, d) { this.QueryIdx = q; this.TrainIdx = t; this.ImgIdx = i; this.Distance = f2(d); } csToString() { return `DMatch(query:${this.QueryIdx} train:${this.TrainIdx} dist:${R.numToString(this.Distance, 'float')})`; } }
  class LineSegmentPoint { constructor(p1, p2) { this.P1 = p1; this.P2 = p2; } csToString() { return `LineSegmentPoint(${this.P1.csToString()} - ${this.P2.csToString()})`; } get Length() { return Math.hypot(this.P2.X - this.P1.X, this.P2.Y - this.P1.Y); } }
  class LineSegmentPolar { constructor(rho, theta) { this.Rho = f2(rho); this.Theta = f2(theta); } csToString() { return `LineSegmentPolar(rho:${R.numToString(this.Rho, 'float')} theta:${R.numToString(this.Theta, 'float')})`; } }
  class CircleSegment { constructor(c, r) { this.Center = c; this.Radius = f2(r); } csToString() { return `CircleSegment(${this.Center.csToString()} r:${R.numToString(this.Radius, 'float')})`; } }
  class Line2D { constructor(vx, vy, x1, y1) { this.Vx = vx; this.Vy = vy; this.X1 = x1; this.Y1 = y1; } csToString() { return `Line2D(v:(${R.numToString(this.Vx)}, ${R.numToString(this.Vy)}) p:(${R.numToString(this.X1)}, ${R.numToString(this.Y1)}))`; } }
  class Rangef { constructor(s, e) { this.Start = f2(s); this.End = f2(e); } csToString() { return `[${this.Start}, ${this.End})`; } }
  class Range { constructor(s, e) { this.Start = s | 0; this.End = e | 0; } csToString() { return `[${this.Start}, ${this.End})`; } }
  class TermCriteria { constructor(type, maxCount, eps) { this.Type = type; this.MaxCount = maxCount; this.Epsilon = eps; } }
  class Blob { constructor(o) { Object.assign(this, o); } csToString() { return `Blob(label:${this.Label} area:${this.Area} rect:${this.Rect.csToString()})`; } }
  class ConnectedComponents { constructor(labels, blobs, labelCount) { this.Labels = labels; this.Blobs = blobs; this.LabelCount = labelCount; } csToString() { return `ConnectedComponents(${this.LabelCount})`; } }

  /** OpenCvSharp Mat — OpenCV.js cv.Mat 을 감싼다 */
  class Mat {
    constructor(m, ctx) { this.m = m; this.ctx = ctx; this.disposed = false; ctx.track(this); }
    get cv() { if (this.disposed) throw new CsException('ObjectDisposedException', '이미 Dispose 된 Mat 입니다. using 블록 밖에서 쓰지 않았는지 확인하세요.'); return this.m; }
    csToString() { const m = this.cv; return `Mat [ ${m.rows}*${m.cols}*${new MatType(m.type()).csToString()}, IsContinuous=${m.isContinuous() ? 'True' : 'False'}, IsSubmatrix=${this.isSub ? 'True' : 'False'} ]`; }
    csDispose() { this.dispose(); }
    dispose() { if (!this.disposed) { this.disposed = true; try { this.m.delete(); } catch (e) { /* 무시 */ } } }
  }

  // ================================================================== 열거형 정의 (OpenCvSharp 이름 → OpenCV 값)
  const ENUMS = {
    ImreadModes: { Unchanged: -1, Grayscale: 0, Color: 1, AnyDepth: 2, AnyColor: 4, LoadGdal: 8, ReducedGrayscale2: 16, ReducedColor2: 17, ReducedGrayscale4: 32, ReducedColor4: 33, ReducedGrayscale8: 64, ReducedColor8: 65, IgnoreOrientation: 128 },
    ImwriteFlags: { JpegQuality: 1, JpegProgressive: 2, JpegOptimize: 3, PngCompression: 16, WebPQuality: 64 },
    ColorConversionCodes: { BGR2BGRA: 0, RGB2RGBA: 0, BGRA2BGR: 1, RGBA2RGB: 1, BGR2RGBA: 2, RGB2BGRA: 2, RGBA2BGR: 3, BGRA2RGB: 3, BGR2RGB: 4, RGB2BGR: 4, BGRA2RGBA: 5, RGBA2BGRA: 5, BGR2GRAY: 6, RGB2GRAY: 7, GRAY2BGR: 8, GRAY2RGB: 8, GRAY2BGRA: 9, GRAY2RGBA: 9, BGRA2GRAY: 10, RGBA2GRAY: 11, BGR2XYZ: 32, RGB2XYZ: 33, XYZ2BGR: 34, XYZ2RGB: 35, BGR2YCrCb: 36, RGB2YCrCb: 37, YCrCb2BGR: 38, YCrCb2RGB: 39, BGR2HSV: 40, RGB2HSV: 41, BGR2Lab: 44, RGB2Lab: 45, BGR2Luv: 50, RGB2Luv: 51, BGR2HLS: 52, RGB2HLS: 53, HSV2BGR: 54, HSV2RGB: 55, Lab2BGR: 56, Lab2RGB: 57, Luv2BGR: 58, Luv2RGB: 59, HLS2BGR: 60, HLS2RGB: 61, BGR2HSV_FULL: 66, RGB2HSV_FULL: 67, BGR2HLS_FULL: 68, RGB2HLS_FULL: 69, HSV2BGR_FULL: 70, HSV2RGB_FULL: 71, HLS2BGR_FULL: 72, HLS2RGB_FULL: 73, BGR2YUV: 82, RGB2YUV: 83, YUV2BGR: 84, YUV2RGB: 85, BayerBG2BGR: 46, BayerGB2BGR: 47, BayerRG2BGR: 48, BayerGR2BGR: 49 },
    ThresholdTypes: { Binary: 0, BinaryInv: 1, Trunc: 2, Tozero: 3, TozeroInv: 4, Mask: 7, Otsu: 8, Triangle: 16 },
    AdaptiveThresholdTypes: { MeanC: 0, GaussianC: 1 },
    MorphTypes: { Erode: 0, Dilate: 1, Open: 2, Close: 3, Gradient: 4, TopHat: 5, BlackHat: 6, HitMiss: 7 },
    MorphShapes: { Rect: 0, Cross: 1, Ellipse: 2 },
    BorderTypes: { Constant: 0, Replicate: 1, Reflect: 2, Wrap: 3, Reflect101: 4, Transparent: 5, Default: 4, Isolated: 16 },
    InterpolationFlags: { Nearest: 0, Linear: 1, Cubic: 2, Area: 3, Lanczos4: 4, LinearExact: 5, Max: 7, WarpFillOutliers: 8, WarpInverseMap: 16 },
    RetrievalModes: { External: 0, List: 1, CComp: 2, Tree: 3, FloodFill: 4 },
    ContourApproximationModes: { ApproxNone: 1, ApproxSimple: 2, ApproxTC89L1: 3, ApproxTC89KCOS: 4 },
    HersheyFonts: { HersheySimplex: 0, HersheyPlain: 1, HersheyDuplex: 2, HersheyComplex: 3, HersheyTriplex: 4, HersheyComplexSmall: 5, HersheyScriptSimplex: 6, HersheyScriptComplex: 7, Italic: 16 },
    LineTypes: { Filled: -1, Link4: 4, Link8: 8, AntiAlias: 16 },
    MarkerTypes: { Cross: 0, TiltedCross: 1, Star: 2, Diamond: 3, Square: 4, TriangleUp: 5, TriangleDown: 6 },
    TemplateMatchModes: { SqDiff: 0, SqDiffNormed: 1, CCorr: 2, CCorrNormed: 3, CCoeff: 4, CCoeffNormed: 5 },
    HoughModes: { Standard: 0, Probabilistic: 1, MultiScale: 2, Gradient: 3, GradientAlt: 4 },
    DistanceTypes: { User: -1, L1: 1, L2: 2, C: 3, L12: 4, Fair: 5, Welsch: 6, Huber: 7 },
    DistanceTransformMasks: { Mask3: 3, Mask5: 5, Precise: 0 },
    ColormapTypes: { Autumn: 0, Bone: 1, Jet: 2, Winter: 3, Rainbow: 4, Ocean: 5, Summer: 6, Spring: 7, Cool: 8, Hsv: 9, Pink: 10, Hot: 11, Parula: 12, Magma: 13, Inferno: 14, Plasma: 15, Viridis: 16, Cividis: 17, Twilight: 18, TwilightShifted: 19, Turbo: 20, DeepGreen: 21 },
    RotateFlags: { Rotate90Clockwise: 0, Rotate180: 1, Rotate90Counterclockwise: 2 },
    FlipMode: { X: 0, Y: 1, XY: -1 },
    NormTypes: { INF: 1, L1: 2, L2: 4, L2SQR: 5, Hamming: 6, Hamming2: 7, Relative: 8, MinMax: 32 },
    CmpType: { EQ: 0, GT: 1, GE: 2, LT: 3, LE: 4, NE: 5 },
    DftFlags: { None: 0, Inverse: 1, Scale: 2, Rows: 4, ComplexOutput: 16, RealOutput: 32, ComplexInput: 64 },
    ShapeMatchModes: { I1: 1, I2: 2, I3: 3 },
    PixelConnectivity: { Connectivity4: 4, Connectivity8: 8 },
    ConnectedComponentsTypes: { Left: 0, Top: 1, Width: 2, Height: 3, Area: 4 },
    GrabCutModes: { InitWithRect: 0, InitWithMask: 1, Eval: 2 },
    FloodFillFlags: { Link4: 4, Link8: 8, FixedRange: 65536, MaskOnly: 131072 },
    ReduceTypes: { Sum: 0, Avg: 1, Max: 2, Min: 3 },
    ReduceDimension: { Row: 0, Column: 1, Auto: -1 },
    KMeansFlags: { RandomCenters: 0, PpCenters: 2, UseInitialLabels: 1 },
    CriteriaTypes: { Count: 1, MaxIter: 1, Eps: 2 },
    HomographyMethods: { None: 0, LMedS: 4, Ransac: 8, Rho: 16 },
    DrawMatchesFlags: { Default: 0, DrawOverOutImg: 1, NotDrawSinglePoints: 2, DrawRichKeypoints: 4 },
    VideoCaptureProperties: { PosMsec: 0, PosFrames: 1, PosAviRatio: 2, FrameWidth: 3, FrameHeight: 4, Fps: 5, FourCC: 6, FrameCount: 7, Format: 8, Mode: 9, Brightness: 10, Contrast: 11, Saturation: 12, Hue: 13, Gain: 14, Exposure: 15, ConvertRgb: 16, AutoFocus: 39, BufferSize: 38 },
    VideoCaptureAPIs: { ANY: 0, DSHOW: 700, MSMF: 1400, V4L2: 200, FFMPEG: 1900 },
    SortFlags: { EveryRow: 0, EveryColumn: 1, Ascending: 0, Descending: 16 },
    CovarFlags: { Scrambled: 0, Normal: 1, UseAvg: 2, Scale: 4, Rows: 8, Cols: 16 },
    ORBScoreType: { Harris: 0, Fast: 1 },
    WindowFlags: { Normal: 0, AutoSize: 1, OpenGL: 4096, FullScreen: 1, FreeRatio: 256, KeepRatio: 0, GuiExpanded: 0, GuiNormal: 16 },
    MouseEventTypes: { MouseMove: 0, LButtonDown: 1, RButtonDown: 2, MButtonDown: 3, LButtonUp: 4, RButtonUp: 5, MButtonUp: 6 },
    MouseEventFlags: { LButton: 1, RButton: 2, MButton: 4, CtrlKey: 8, ShiftKey: 16, AltKey: 32 }
  };
  const FLAG_ENUMS = new Set(['ThresholdTypes', 'ImreadModes', 'BorderTypes', 'InterpolationFlags', 'DftFlags', 'FloodFillFlags', 'HersheyFonts', 'DrawMatchesFlags', 'KMeansFlags', 'CriteriaTypes', 'SortFlags', 'CovarFlags', 'LineTypes', 'WindowFlags', 'MouseEventFlags']);

  // ================================================================== 설치
  function install(interp, host) {
    const cv = host.cv;
    const T = (d) => interp.defType(d);
    const method = (f, ret) => ({ fn: f, ret: ret || null });
    const prop = (t, get, set) => ({ t, get, set });
    const sfn = (f, ret) => ({ fn: (i, args, typeArgs, node, rawArgs) => f(i, args, typeArgs, node, rawArgs), ret: ret || null });
    const sval = (t, get) => ({ t, get });

    // ---------------------------------------------------------------- 문맥: Mat 추적 · 예외 변환
    const ctx = {
      cv, host, mats: new Set(),
      track(m) { this.mats.add(m); },
      wrap(cvMat, extra) { const m = new Mat(cvMat, this); if (extra) Object.assign(m, extra); return m; },
      afterRun() { for (const m of this.mats) m.dispose(); this.mats.clear(); },
      cvErr(e) {
        if (typeof e === 'number') { let msg = ''; try { msg = cv.exceptionFromPtr(e).msg; } catch (x) { msg = 'OpenCV 오류 #' + e; } return new CsException('OpenCVException', cleanCvMsg(msg)); }
        if (e && typeof e === 'object' && e.msg) return new CsException('OpenCVException', cleanCvMsg(e.msg));
        return e;
      }
    };
    interp.plugins.push(ctx);
    interp.host.cvException = (e) => ctx.cvErr(e);
    function cleanCvMsg(msg) { return String(msg).replace(/^OpenCV\([\d.]+\)\s*/, '').replace(/\/home\/ci\/opencv\/modules\/\w+\/src\//g, '').replace(/\n+/g, ' ').trim(); }
    /** OpenCV.js 호출 감싸기: 숫자 예외 → OpenCVException */
    const guard = (f) => { try { return f(); } catch (e) { throw ctx.cvErr(e); } };
    ctx.guard = guard;

    // ---------------------------------------------------------------- 변환 도우미
    const isMat = (v) => v instanceof Mat;
    const asMat = (v, what) => { if (v instanceof Mat) return v.cv; if (v == null) throw new CsException('ArgumentNullException', `${what || 'Mat'} 이(가) null 입니다`); throw new CsException('ArgumentException', `${what || '인수'}에는 Mat 이 필요합니다 (${describeVal(v)})`); };
    const toScalar = (v) => { if (v instanceof Scalar) return v; if (typeof v === 'number') return new Scalar(v, 0, 0, 0); if (v instanceof Vec) return new Scalar(...v.items); if (v == null) return new Scalar(); throw new CsException('ArgumentException', `Scalar 가 필요합니다 (${describeVal(v)})`); };
    const toCvScalar = (v) => toScalar(v).toCv(cv);
    const toPoint = (v) => { if (v instanceof Point || v instanceof Point2f || v instanceof Point2d) return new cv.Point(Math.round(v.X), Math.round(v.Y)); if (v instanceof CsTuple) return new cv.Point(v.items[0], v.items[1]); throw new CsException('ArgumentException', `Point 가 필요합니다 (${describeVal(v)})`); };
    const toSize = (v) => { if (v instanceof Size || v instanceof Size2f) return new cv.Size(Math.round(v.Width), Math.round(v.Height)); if (v == null) return new cv.Size(0, 0); throw new CsException('ArgumentException', `Size 가 필요합니다 (${describeVal(v)})`); };
    const toRect = (v) => { if (v instanceof Rect) return new cv.Rect(v.X, v.Y, v.Width, v.Height); throw new CsException('ArgumentException', `Rect 가 필요합니다 (${describeVal(v)})`); };
    const fromRect = (r) => new Rect(r.x, r.y, r.width, r.height);
    const isEnum = (v, name) => v instanceof CsEnumVal && (!name || v.def.name === name);
    const enumVal = (v, def) => (v instanceof CsEnumVal ? v.value : typeof v === 'number' ? v : def);
    const seqOf = (v) => (Array.isArray(v) ? v : v instanceof CsList ? v.items : v && typeof v.csIter === 'function' ? v.csIter() : null);
    const isPointSeq = (v) => { const s = seqOf(v); return s && (!s.length || s[0] instanceof Point || s[0] instanceof Point2f || s[0] instanceof Point2d || s[0] instanceof CsTuple); };
    /** Point[] → cv.Mat (Nx1 CV_32SC2 또는 CV_32FC2) */
    const pointsToMat = (pts, float) => {
      const s = seqOf(pts) || [];
      const isF = float != null ? float : !(s.length && s[0] instanceof Point);
      const data = [];
      for (const p of s) { if (p instanceof CsTuple) { data.push(p.items[0], p.items[1]); } else data.push(p.X, p.Y); }
      return isF ? cv.matFromArray(s.length, 1, cv.CV_32FC2, data) : cv.matFromArray(s.length, 1, cv.CV_32SC2, data);
    };
    const matToPoints = (m, kind) => {
      const out = [];
      const n = m.rows * m.cols;
      if (m.type() === cv.CV_32SC2) { const d = m.data32S; for (let k = 0; k < n; k++) out.push(new Point(d[2 * k], d[2 * k + 1])); out.__elem = 'Point'; }
      else if (m.type() === cv.CV_32FC2) { const d = m.data32F; for (let k = 0; k < n; k++) out.push(kind === 'Point' ? new Point(Math.round(d[2 * k]), Math.round(d[2 * k + 1])) : new Point2f(d[2 * k], d[2 * k + 1])); out.__elem = kind === 'Point' ? 'Point' : 'Point2f'; }
      else if (m.type() === cv.CV_64FC2) { const d = m.data64F; for (let k = 0; k < n; k++) out.push(new Point2d(d[2 * k], d[2 * k + 1])); out.__elem = 'Point2d'; }
      else throw new CsException('ArgumentException', 'Mat 을 점 배열로 바꿀 수 없습니다 (2채널 Mat 이어야 합니다)');
      return out;
    };
    /** 윤곽(점 배열 또는 Mat) → cv.Mat (임시) */
    const contourMat = (c) => { if (c instanceof Mat) return { m: c.cv, tmp: false }; const s = seqOf(c); if (!s) throw new CsException('ArgumentException', `점 배열(Point[]) 또는 Mat 이 필요합니다 (${describeVal(c)})`); return { m: pointsToMat(s), tmp: true }; };
    const withContour = (c, f) => { const { m, tmp } = contourMat(c); try { return f(m); } finally { if (tmp) m.delete(); } };
    const contoursToVector = (list) => { const vec = new cv.MatVector(); const tmps = []; for (const c of seqOf(list) || []) { const { m, tmp } = contourMat(c); vec.push_back(m); if (tmp) tmps.push(m); } return { vec, free() { vec.delete(); tmps.forEach((t) => t.delete()); } }; };
    const matTypeOf = (v) => (v instanceof MatType ? v.Value : v instanceof CsEnumVal ? v.value : typeof v === 'number' ? v : -1);
    const newMat = () => ctx.wrap(new cv.Mat());
    const outMat = (v, what) => { if (v instanceof Mat) return v.cv; if (v == null) throw new CsException('ArgumentNullException', `${what || '출력 Mat'} 이(가) null 입니다. new Mat() 으로 만들어 넘기세요`); throw new CsException('ArgumentException', `${what || '출력'}에는 Mat 이 필요합니다`); };
    Object.assign(ctx, { isMat, asMat, toScalar, toCvScalar, toPoint, toSize, toRect, fromRect, isEnum, enumVal, seqOf, isPointSeq, pointsToMat, matToPoints, contourMat, withContour, contoursToVector, matTypeOf, newMat, outMat });

    // ---------------------------------------------------------------- 열거형
    for (const [name, values] of Object.entries(ENUMS)) interp.defEnum(name, values, FLAG_ENUMS.has(name));
    // ImreadModes 등 별칭
    const CC = interp.types.get('ColorConversionCodes');
    interp.types.set('ColorConversion', CC);
    interp.types.set('ImreadMode', interp.types.get('ImreadModes'));
    interp.types.set('ThresholdType', interp.types.get('ThresholdTypes'));

    // ---------------------------------------------------------------- MatType
    const MT = T({
      name: 'MatType', kind: 'struct', jsClass: MatType, isInstance: (v) => v instanceof MatType,
      ctor: (i, a) => new MatType(a.length ? num(a[0]) : 0),
      statics: {
        MakeType: sfn((i, a) => MatType.make(num(a[0]), num(a[1])), 'MatType'),
        CV_8U: sval('int', () => 0), CV_8S: sval('int', () => 1), CV_16U: sval('int', () => 2), CV_16S: sval('int', () => 3), CV_32S: sval('int', () => 4), CV_32F: sval('int', () => 5), CV_64F: sval('int', () => 6), CV_16F: sval('int', () => 7)
      },
      props: { Value: prop('int', (t) => t.Value), Depth: prop('int', (t) => t.Depth), Channels: prop('int', (t) => t.Channels), IsInteger: prop('bool', (t) => t.Depth <= 4) },
      methods: { ToString: method((i, t) => t.csToString(), 'string'), Equals: method((i, t, a) => t.csEquals(a[0]), 'bool'), GetHashCode: method((i, t) => t.Value, 'int') },
      operators: { '==': (i, v) => csEquals(v[0], v[1]), '!=': (i, v) => !csEquals(v[0], v[1]) },
      convertFrom: (v) => (typeof v === 'number' ? new MatType(v) : undefined), convertTo: (v, t) => (isIntegral(t) || t === 'double' ? v.Value : undefined)
    });
    for (const [d, dv] of [['8U', 0], ['8S', 1], ['16U', 2], ['16S', 3], ['32S', 4], ['32F', 5], ['64F', 6], ['16F', 7]]) for (let ch = 1; ch <= 4; ch++) MT.statics[`CV_${d}C${ch}`] = sval('MatType', () => MatType.make(dv, ch));
    for (const [d, dv] of [['8U', 0], ['8S', 1], ['16U', 2], ['16S', 3], ['32S', 4], ['32F', 5], ['64F', 6]]) MT.statics[`CV_${d}C`] = sfn((i, a) => MatType.make(dv, num(a[0])), 'MatType');

    // ---------------------------------------------------------------- Point · Size · Rect · Scalar
    const numArgs = (a) => a.map((x) => (x instanceof CsChar ? x.code : toNum(x, 'double', interp)));
    const pointOps = (Cls, intT) => ({
      '+': (i, v) => (v[1] instanceof Cls || v[1] instanceof Point || v[1] instanceof Point2f || v[1] instanceof Point2d ? new Cls(v[0].X + v[1].X, v[0].Y + v[1].Y) : v[1] instanceof Size ? new Cls(v[0].X + v[1].Width, v[0].Y + v[1].Height) : undefined),
      '-': (i, v) => (v.length === 1 ? new Cls(-v[0].X, -v[0].Y) : (v[1] instanceof Point || v[1] instanceof Point2f || v[1] instanceof Point2d) ? new Cls(v[0].X - v[1].X, v[0].Y - v[1].Y) : undefined),
      '*': (i, v) => (typeof v[1] === 'number' ? new Cls(v[0].X * v[1], v[0].Y * v[1]) : typeof v[0] === 'number' ? new Cls(v[1].X * v[0], v[1].Y * v[0]) : undefined),
      '/': (i, v) => (typeof v[1] === 'number' ? new Cls(v[0].X / v[1], v[0].Y / v[1]) : undefined),
      '==': (i, v) => csEquals(v[0], v[1]), '!=': (i, v) => !csEquals(v[0], v[1])
    });
    const defPoint = (name, Cls, t) => T({
      name, kind: 'struct', jsClass: Cls, isInstance: (v) => v instanceof Cls,
      ctor: (i, a) => (a.length >= 2 ? new Cls(...numArgs(a)) : a.length === 1 && (a[0] instanceof Point || a[0] instanceof Point2f || a[0] instanceof Point2d) ? new Cls(a[0].X, a[0].Y) : new Cls()),
      copyStruct: (v) => new Cls(v.X, v.Y),
      props: { X: prop(t, (p) => p.X, (p, v) => { p.X = coerce(v, t, interp); }), Y: prop(t, (p) => p.Y, (p, v) => { p.Y = coerce(v, t, interp); }) },
      methods: {
        DistanceTo: method((i, p, a) => Math.hypot(p.X - a[0].X, p.Y - a[0].Y), 'double'),
        DotProduct: method((i, p, a) => p.X * a[0].X + p.Y * a[0].Y, 'double'), CrossProduct: method((i, p, a) => p.X * a[0].Y - p.Y * a[0].X, 'double'),
        ToString: method((i, p) => p.csToString(), 'string'), Equals: method((i, p, a) => csEquals(p, a[0]), 'bool'), GetHashCode: method((i, p) => (p.X * 31 + p.Y) | 0, 'int'),
        Deconstruct: method((i, p, a) => { a[0].set(p.X); a[1].set(p.Y); })
      },
      statics: { Distance: sfn((i, a) => Math.hypot(a[0].X - a[1].X, a[0].Y - a[1].Y), 'double'), Add: sfn((i, a) => new Cls(a[0].X + a[1].X, a[0].Y + a[1].Y), name), Subtract: sfn((i, a) => new Cls(a[0].X - a[1].X, a[0].Y - a[1].Y), name), Multiply: sfn((i, a) => new Cls(a[0].X * num(a[1]), a[0].Y * num(a[1])), name) },
      operators: pointOps(Cls, t === 'int'),
      convertFrom: (v) => (v instanceof Point || v instanceof Point2f || v instanceof Point2d ? new Cls(v.X, v.Y) : v instanceof CsTuple && v.items.length === 2 ? new Cls(v.items[0], v.items[1]) : undefined)
    });
    defPoint('Point', Point, 'int'); defPoint('Point2f', Point2f, 'float'); defPoint('Point2d', Point2d, 'double');
    const defSize = (name, Cls, t) => T({
      name, kind: 'struct', jsClass: Cls, isInstance: (v) => v instanceof Cls,
      ctor: (i, a) => (a.length >= 2 ? new Cls(...numArgs(a)) : a.length === 1 && a[0] instanceof Size ? new Cls(a[0].Width, a[0].Height) : new Cls()),
      copyStruct: (v) => new Cls(v.Width, v.Height),
      props: { Width: prop(t, (s) => s.Width, (s, v) => { s.Width = coerce(v, t, interp); }), Height: prop(t, (s) => s.Height, (s, v) => { s.Height = coerce(v, t, interp); }), Area: prop(t === 'int' ? 'int' : 'float', (s) => s.Width * s.Height), IsEmpty: prop('bool', (s) => s.Width <= 0 || s.Height <= 0) },
      methods: { ToString: method((i, s) => s.csToString(), 'string'), Equals: method((i, s, a) => csEquals(s, a[0]), 'bool'), Deconstruct: method((i, s, a) => { a[0].set(s.Width); a[1].set(s.Height); }) },
      operators: { '==': (i, v) => csEquals(v[0], v[1]), '!=': (i, v) => !csEquals(v[0], v[1]), '*': (i, v) => (typeof v[1] === 'number' ? new Cls(v[0].Width * v[1], v[0].Height * v[1]) : undefined), '/': (i, v) => (typeof v[1] === 'number' ? new Cls(v[0].Width / v[1], v[0].Height / v[1]) : undefined), '+': (i, v) => new Cls(v[0].Width + v[1].Width, v[0].Height + v[1].Height), '-': (i, v) => new Cls(v[0].Width - v[1].Width, v[0].Height - v[1].Height) },
      convertFrom: (v) => (v instanceof Size || v instanceof Size2f ? new Cls(v.Width, v.Height) : undefined)
    });
    defSize('Size', Size, 'int'); defSize('Size2f', Size2f, 'float');
    T({
      name: 'Rect', kind: 'struct', jsClass: Rect, isInstance: (v) => v instanceof Rect,
      ctor: (i, a) => (a.length >= 4 ? new Rect(...numArgs(a)) : a.length === 2 && (a[0] instanceof Point) && (a[1] instanceof Size) ? new Rect(a[0].X, a[0].Y, a[1].Width, a[1].Height) : a.length === 2 && a[0] instanceof Point && a[1] instanceof Point ? new Rect(Math.min(a[0].X, a[1].X), Math.min(a[0].Y, a[1].Y), Math.abs(a[1].X - a[0].X), Math.abs(a[1].Y - a[0].Y)) : new Rect()),
      copyStruct: (v) => new Rect(v.X, v.Y, v.Width, v.Height),
      statics: { FromLTRB: sfn((i, a) => new Rect(num(a[0]), num(a[1]), num(a[2]) - num(a[0]), num(a[3]) - num(a[1])), 'Rect'), Empty: sval('Rect', () => new Rect()), Intersect: sfn((i, a) => rectIntersect(a[0], a[1]), 'Rect'), Union: sfn((i, a) => rectUnion(a[0], a[1]), 'Rect'), Inflate: sfn((i, a) => new Rect(a[0].X - num(a[1]), a[0].Y - num(a[2]), a[0].Width + 2 * num(a[1]), a[0].Height + 2 * num(a[2])), 'Rect') },
      props: {
        X: prop('int', (r) => r.X, (r, v) => { r.X = v | 0; }), Y: prop('int', (r) => r.Y, (r, v) => { r.Y = v | 0; }), Width: prop('int', (r) => r.Width, (r, v) => { r.Width = v | 0; }), Height: prop('int', (r) => r.Height, (r, v) => { r.Height = v | 0; }),
        Left: prop('int', (r) => r.X, (r, v) => { r.X = v | 0; }), Top: prop('int', (r) => r.Y, (r, v) => { r.Y = v | 0; }), Right: prop('int', (r) => r.X + r.Width), Bottom: prop('int', (r) => r.Y + r.Height),
        Location: prop('Point', (r) => new Point(r.X, r.Y), (r, v) => { r.X = v.X; r.Y = v.Y; }), Size: prop('Size', (r) => new Size(r.Width, r.Height), (r, v) => { r.Width = v.Width; r.Height = v.Height; }),
        TopLeft: prop('Point', (r) => new Point(r.X, r.Y)), BottomRight: prop('Point', (r) => new Point(r.X + r.Width, r.Y + r.Height)), Center: prop('Point', (r) => new Point(r.X + (r.Width >> 1), r.Y + (r.Height >> 1))), Area: prop('int', (r) => r.Width * r.Height), IsEmpty: prop('bool', (r) => r.Width <= 0 || r.Height <= 0)
      },
      methods: {
        Contains: method((i, r, a) => { if (a.length === 2) return num(a[0]) >= r.X && num(a[0]) < r.X + r.Width && num(a[1]) >= r.Y && num(a[1]) < r.Y + r.Height; const p = a[0]; if (p instanceof Rect) return p.X >= r.X && p.Y >= r.Y && p.X + p.Width <= r.X + r.Width && p.Y + p.Height <= r.Y + r.Height; return p.X >= r.X && p.X < r.X + r.Width && p.Y >= r.Y && p.Y < r.Y + r.Height; }, 'bool'),
        Intersect: method((i, r, a) => rectIntersect(r, a[0]), 'Rect'), Union: method((i, r, a) => rectUnion(r, a[0]), 'Rect'), IntersectsWith: method((i, r, a) => { const x = rectIntersect(r, a[0]); return x.Width > 0 && x.Height > 0; }, 'bool'),
        Inflate: method((i, r, a) => { const dx = a[0] instanceof Size ? a[0].Width : num(a[0]), dy = a[0] instanceof Size ? a[0].Height : num(a[1]); r.X -= dx; r.Y -= dy; r.Width += 2 * dx; r.Height += 2 * dy; }),
        ToString: method((i, r) => r.csToString(), 'string'), Equals: method((i, r, a) => csEquals(r, a[0]), 'bool'), Deconstruct: method((i, r, a) => { a[0].set(r.X); a[1].set(r.Y); a[2].set(r.Width); a[3].set(r.Height); })
      },
      operators: { '==': (i, v) => csEquals(v[0], v[1]), '!=': (i, v) => !csEquals(v[0], v[1]), '&': (i, v) => rectIntersect(v[0], v[1]), '|': (i, v) => rectUnion(v[0], v[1]), '+': (i, v) => (v[1] instanceof Point ? new Rect(v[0].X + v[1].X, v[0].Y + v[1].Y, v[0].Width, v[0].Height) : v[1] instanceof Size ? new Rect(v[0].X, v[0].Y, v[0].Width + v[1].Width, v[0].Height + v[1].Height) : undefined), '-': (i, v) => (v[1] instanceof Point ? new Rect(v[0].X - v[1].X, v[0].Y - v[1].Y, v[0].Width, v[0].Height) : undefined) }
    });
    function rectIntersect(a, b) { const x1 = Math.max(a.X, b.X), y1 = Math.max(a.Y, b.Y), x2 = Math.min(a.X + a.Width, b.X + b.Width), y2 = Math.min(a.Y + a.Height, b.Y + b.Height); return x2 > x1 && y2 > y1 ? new Rect(x1, y1, x2 - x1, y2 - y1) : new Rect(); }
    function rectUnion(a, b) { const x1 = Math.min(a.X, b.X), y1 = Math.min(a.Y, b.Y), x2 = Math.max(a.X + a.Width, b.X + b.Width), y2 = Math.max(a.Y + a.Height, b.Y + b.Height); return new Rect(x1, y1, x2 - x1, y2 - y1); }
    T({ name: 'Rect2d', kind: 'struct', jsClass: Rect2d, isInstance: (v) => v instanceof Rect2d, ctor: (i, a) => new Rect2d(...numArgs(a)), props: { X: prop('double', (r) => r.X), Y: prop('double', (r) => r.Y), Width: prop('double', (r) => r.Width), Height: prop('double', (r) => r.Height) }, methods: { ToString: method((i, r) => r.csToString(), 'string') } });
    T({
      name: 'RotatedRect', kind: 'struct', jsClass: RotatedRect, isInstance: (v) => v instanceof RotatedRect,
      ctor: (i, a) => new RotatedRect(a[0], a[1], a.length > 2 ? num(a[2]) : 0),
      props: { Center: prop('Point2f', (r) => r.Center, (r, v) => { r.Center = v; }), Size: prop('Size2f', (r) => r.Size, (r, v) => { r.Size = v; }), Angle: prop('float', (r) => r.Angle, (r, v) => { r.Angle = f2(v); }) },
      methods: {
        Points: method((i, r) => { const pts = rotatedPoints(r); return arr(pts, 'Point2f'); }, 'Point2f[]'),
        BoundingRect: method((i, r) => { const pts = rotatedPoints(r); const xs = pts.map((p) => p.X), ys = pts.map((p) => p.Y); const x1 = Math.floor(Math.min(...xs)), y1 = Math.floor(Math.min(...ys)); return new Rect(x1, y1, Math.ceil(Math.max(...xs)) - x1 + 1, Math.ceil(Math.max(...ys)) - y1 + 1); }, 'Rect'),
        ToString: method((i, r) => r.csToString(), 'string')
      }
    });
    function rotatedPoints(r) { const a = r.Angle * Math.PI / 180, b = Math.cos(a) * 0.5, s = Math.sin(a) * 0.5; const c = r.Center, w = r.Size.Width, h = r.Size.Height; const p0 = new Point2f(c.X - s * h - b * w, c.Y + b * h - s * w), p1 = new Point2f(c.X + s * h - b * w, c.Y - b * h - s * w); return [p0, p1, new Point2f(2 * c.X - p0.X, 2 * c.Y - p0.Y), new Point2f(2 * c.X - p1.X, 2 * c.Y - p1.Y)]; }
    T({
      name: 'Scalar', kind: 'struct', jsClass: Scalar, isInstance: (v) => v instanceof Scalar,
      ctor: (i, a) => new Scalar(...numArgs(a)), copyStruct: (v) => new Scalar(v.Val0, v.Val1, v.Val2, v.Val3),
      indexer: { t: 'double', get: (s, idx) => s.at(num(idx[0])), set: (s, idx, v) => { s['Val' + num(idx[0])] = num(v); } },
      statics: Object.assign({
        All: sfn((i, a) => new Scalar(num(a[0]), num(a[0]), num(a[0]), num(a[0])), 'Scalar'),
        FromRgb: sfn((i, a) => new Scalar(num(a[2]), num(a[1]), num(a[0])), 'Scalar'),
        RandomColor: sfn(() => new Scalar(Math.random() * 256 | 0, Math.random() * 256 | 0, Math.random() * 256 | 0), 'Scalar')
      }, Object.fromEntries(Object.entries({ Black: [0, 0, 0], White: [255, 255, 255], Red: [0, 0, 255], Green: [0, 128, 0], Lime: [0, 255, 0], Blue: [255, 0, 0], Yellow: [0, 255, 255], Cyan: [255, 255, 0], Magenta: [255, 0, 255], Gray: [128, 128, 128], Silver: [192, 192, 192], Orange: [0, 165, 255], Purple: [128, 0, 128], Pink: [203, 192, 255], Brown: [42, 42, 165], Navy: [128, 0, 0], Maroon: [0, 0, 128], Olive: [0, 128, 128], Teal: [128, 128, 0], Violet: [238, 130, 238], Gold: [0, 215, 255], DarkGray: [169, 169, 169], LightGray: [211, 211, 211], DarkGreen: [0, 100, 0], SkyBlue: [235, 206, 135], Crimson: [60, 20, 220], Indigo: [130, 0, 75], Aqua: [255, 255, 0], Chocolate: [30, 105, 210], Coral: [80, 127, 255], DeepPink: [147, 20, 255], DodgerBlue: [255, 144, 30], ForestGreen: [34, 139, 34], Khaki: [140, 230, 240], Lavender: [250, 230, 230], LightBlue: [230, 216, 173], LightGreen: [144, 238, 144], LimeGreen: [50, 205, 50], OrangeRed: [0, 69, 255], Salmon: [114, 128, 250], SeaGreen: [87, 139, 46], Tomato: [71, 99, 255], Turquoise: [208, 224, 64], Wheat: [179, 222, 245], YellowGreen: [50, 205, 154], Beige: [220, 245, 245], Ivory: [240, 255, 255], Snow: [250, 250, 255], MidnightBlue: [112, 25, 25], RoyalBlue: [225, 105, 65], SteelBlue: [180, 130, 70], SlateGray: [144, 128, 112], Firebrick: [34, 34, 178], HotPink: [180, 105, 255], Plum: [221, 160, 221], Orchid: [214, 112, 218], Tan: [140, 180, 210], Peru: [63, 133, 205], Sienna: [45, 82, 160], DarkOrange: [0, 140, 255], DarkRed: [0, 0, 139], DarkBlue: [139, 0, 0], DarkCyan: [139, 139, 0], DarkMagenta: [139, 0, 139], DarkViolet: [211, 0, 148], DarkKhaki: [107, 183, 189], DarkOliveGreen: [47, 107, 85], MediumPurple: [219, 112, 147], MediumSeaGreen: [113, 179, 60], MediumBlue: [205, 0, 0], GreenYellow: [47, 255, 173], SpringGreen: [127, 255, 0], PaleGreen: [152, 251, 152], LightYellow: [224, 255, 255], LightPink: [193, 182, 255], LightCyan: [255, 255, 224], LightSkyBlue: [250, 206, 135], PowderBlue: [230, 224, 176], CadetBlue: [160, 158, 95], Cornsilk: [220, 248, 255], Bisque: [196, 228, 255], Moccasin: [181, 228, 255], NavajoWhite: [173, 222, 255], PeachPuff: [185, 218, 255], MistyRose: [225, 228, 255], AliceBlue: [255, 248, 240], Azure: [255, 255, 240], Honeydew: [240, 255, 240], MintCream: [250, 255, 245], WhiteSmoke: [245, 245, 245], Gainsboro: [220, 220, 220], DimGray: [105, 105, 105], DarkSlateGray: [79, 79, 47], Transparent: [0, 0, 0, 0] }).map(([k, v]) => [k, sval('Scalar', () => new Scalar(...v))]))),
      props: { Val0: prop('double', (s) => s.Val0, (s, v) => { s.Val0 = num(v); }), Val1: prop('double', (s) => s.Val1, (s, v) => { s.Val1 = num(v); }), Val2: prop('double', (s) => s.Val2, (s, v) => { s.Val2 = num(v); }), Val3: prop('double', (s) => s.Val3, (s, v) => { s.Val3 = num(v); }), Item0: prop('double', (s) => s.Val0), Item1: prop('double', (s) => s.Val1), Item2: prop('double', (s) => s.Val2), Item3: prop('double', (s) => s.Val3) },
      methods: { ToString: method((i, s) => s.csToString(), 'string'), Equals: method((i, s, a) => csEquals(s, a[0]), 'bool'), ToVec3b: method((i, s) => new Vec('Vec3b', 3, 'byte', [s.Val0 & 255, s.Val1 & 255, s.Val2 & 255]), 'Vec3b'), Mul: method((i, s, a) => new Scalar(s.Val0 * a[0].Val0, s.Val1 * a[0].Val1, s.Val2 * a[0].Val2, s.Val3 * a[0].Val3), 'Scalar') },
      operators: { '+': (i, v) => new Scalar(...[0, 1, 2, 3].map((k) => toScalar(v[0]).at(k) + toScalar(v[1]).at(k))), '-': (i, v) => (v.length === 1 ? new Scalar(-v[0].Val0, -v[0].Val1, -v[0].Val2, -v[0].Val3) : new Scalar(...[0, 1, 2, 3].map((k) => toScalar(v[0]).at(k) - toScalar(v[1]).at(k)))), '*': (i, v) => (typeof v[1] === 'number' ? new Scalar(v[0].Val0 * v[1], v[0].Val1 * v[1], v[0].Val2 * v[1], v[0].Val3 * v[1]) : typeof v[0] === 'number' ? new Scalar(v[1].Val0 * v[0], v[1].Val1 * v[0], v[1].Val2 * v[0], v[1].Val3 * v[0]) : undefined), '/': (i, v) => (typeof v[1] === 'number' ? new Scalar(v[0].Val0 / v[1], v[0].Val1 / v[1], v[0].Val2 / v[1], v[0].Val3 / v[1]) : undefined), '==': (i, v) => csEquals(v[0], v[1]), '!=': (i, v) => !csEquals(v[0], v[1]) },
      convertFrom: (v) => (typeof v === 'number' ? new Scalar(v) : v instanceof Vec ? new Scalar(...v.items) : undefined)
    });

    // ---------------------------------------------------------------- Vec 형식들
    const VEC_TYPES = { Vec2b: [2, 'byte'], Vec3b: [3, 'byte'], Vec4b: [4, 'byte'], Vec6b: [6, 'byte'], Vec2s: [2, 'short'], Vec3s: [3, 'short'], Vec4s: [4, 'short'], Vec2w: [2, 'ushort'], Vec3w: [3, 'ushort'], Vec4w: [4, 'ushort'], Vec2i: [2, 'int'], Vec3i: [3, 'int'], Vec4i: [4, 'int'], Vec6i: [6, 'int'], Vec2f: [2, 'float'], Vec3f: [3, 'float'], Vec4f: [4, 'float'], Vec6f: [6, 'float'], Vec2d: [2, 'double'], Vec3d: [3, 'double'], Vec4d: [4, 'double'], Vec6d: [6, 'double'] };
    const makeVec = (name, items) => { const [n, t] = VEC_TYPES[name]; const v = new Vec(name, n, t, (items || new Array(n).fill(0)).map((x) => coerce(x, t, interp))); return v; };
    ctx.makeVec = makeVec;
    for (const [name, [n, t]] of Object.entries(VEC_TYPES)) {
      const props = {};
      for (let k = 0; k < n; k++) props['Item' + k] = prop(t, (v) => v.items[k], (v, x) => { v.items[k] = coerce(x, t, interp); });
      T({
        name, kind: 'struct', isInstance: (v) => v instanceof Vec && v.__name === name, ctor: (i, a) => makeVec(name, a.length ? numArgs(a) : null), copyStruct: (v) => makeVec(name, v.items),
        indexer: { t, get: (v, idx) => { const k = num(idx[0]); if (k < 0 || k >= v.n) throw new CsException('IndexOutOfRangeException', null); return v.items[k]; }, set: (v, idx, x) => { v.items[num(idx[0])] = coerce(x, t, interp); } },
        props, methods: { ToString: method((i, v) => v.csToString(), 'string'), Equals: method((i, v, a) => csEquals(v, a[0]), 'bool'), Deconstruct: method((i, v, a) => a.forEach((r, k) => r.set(v.items[k]))) },
        statics: { All: sfn((i, a) => makeVec(name, new Array(n).fill(num(a[0]))), name) },
        operators: { '+': (i, v) => makeVec(name, v[0].items.map((x, k) => x + v[1].items[k])), '-': (i, v) => makeVec(name, v[0].items.map((x, k) => x - v[1].items[k])), '*': (i, v) => (typeof v[1] === 'number' ? makeVec(name, v[0].items.map((x) => x * v[1])) : undefined), '==': (i, v) => csEquals(v[0], v[1]), '!=': (i, v) => !csEquals(v[0], v[1]) }
      });
    }
    T({ name: 'Moments', kind: 'class', jsClass: Moments, isInstance: (v) => v instanceof Moments, props: Object.fromEntries(['M00', 'M10', 'M01', 'M20', 'M11', 'M02', 'M30', 'M21', 'M12', 'M03', 'Mu20', 'Mu11', 'Mu02', 'Mu30', 'Mu21', 'Mu12', 'Mu03', 'Nu20', 'Nu11', 'Nu02', 'Nu30', 'Nu21', 'Nu12', 'Nu03'].map((k) => [k, prop('double', (m) => m[k])])), methods: { ToString: method((i, m) => m.csToString(), 'string'), HuMoments: method((i, m) => { const mm = new cv.Mat(); const mo = { m00: m.M00, m10: m.M10, m01: m.M01, m20: m.M20, m11: m.M11, m02: m.M02, m30: m.M30, m21: m.M21, m12: m.M12, m03: m.M03, mu20: m.Mu20, mu11: m.Mu11, mu02: m.Mu02, mu30: m.Mu30, mu21: m.Mu21, mu12: m.Mu12, mu03: m.Mu03, nu20: m.Nu20, nu11: m.Nu11, nu02: m.Nu02, nu30: m.Nu30, nu21: m.Nu21, nu12: m.Nu12, nu03: m.Nu03 }; guard(() => cv.HuMoments(mo, mm)); const out = arr(Array.from(mm.data64F), 'double'); mm.delete(); return out; }, 'double[]') } });
    T({ name: 'HierarchyIndex', kind: 'struct', jsClass: HierarchyIndex, isInstance: (v) => v instanceof HierarchyIndex, props: { Next: prop('int', (h) => h.Next), Previous: prop('int', (h) => h.Previous), Child: prop('int', (h) => h.Child), Parent: prop('int', (h) => h.Parent) }, methods: { ToString: method((i, h) => h.csToString(), 'string') } });
    T({ name: 'KeyPoint', kind: 'struct', jsClass: KeyPoint, isInstance: (v) => v instanceof KeyPoint, ctor: (i, a) => new KeyPoint(a[0] instanceof Point2f ? a[0] : new Point2f(num(a[0]), num(a[1])), a[0] instanceof Point2f ? num(a[1]) : num(a[2])), props: { Pt: prop('Point2f', (k) => k.Pt, (k, v) => { k.Pt = v; }), Size: prop('float', (k) => k.Size), Angle: prop('float', (k) => k.Angle), Response: prop('float', (k) => k.Response), Octave: prop('int', (k) => k.Octave), ClassId: prop('int', (k) => k.ClassId) }, methods: { ToString: method((i, k) => k.csToString(), 'string') } });
    T({ name: 'DMatch', kind: 'struct', jsClass: DMatch, isInstance: (v) => v instanceof DMatch, ctor: (i, a) => new DMatch(num(a[0]), num(a[1]), a.length > 3 ? num(a[2]) : -1, num(a[a.length - 1])), props: { QueryIdx: prop('int', (d) => d.QueryIdx), TrainIdx: prop('int', (d) => d.TrainIdx), ImgIdx: prop('int', (d) => d.ImgIdx), Distance: prop('float', (d) => d.Distance) }, methods: { ToString: method((i, d) => d.csToString(), 'string'), CompareTo: method((i, d, a) => d.Distance - a[0].Distance, 'int') } });
    T({ name: 'LineSegmentPoint', kind: 'struct', jsClass: LineSegmentPoint, isInstance: (v) => v instanceof LineSegmentPoint, ctor: (i, a) => new LineSegmentPoint(a[0], a[1]), props: { P1: prop('Point', (l) => l.P1), P2: prop('Point', (l) => l.P2), Length: prop('double', (l) => l.Length) }, methods: { ToString: method((i, l) => l.csToString(), 'string'), Length: method((i, l) => l.Length, 'double') } });
    T({ name: 'LineSegmentPolar', kind: 'struct', jsClass: LineSegmentPolar, isInstance: (v) => v instanceof LineSegmentPolar, ctor: (i, a) => new LineSegmentPolar(num(a[0]), num(a[1])), props: { Rho: prop('float', (l) => l.Rho), Theta: prop('float', (l) => l.Theta) }, methods: { ToString: method((i, l) => l.csToString(), 'string'), ToSegmentPoint: method((i, l, a) => { const d = a.length ? num(a[0]) : 1000; const c = Math.cos(l.Theta), s = Math.sin(l.Theta), x0 = c * l.Rho, y0 = s * l.Rho; return new LineSegmentPoint(new Point(Math.round(x0 + d * -s), Math.round(y0 + d * c)), new Point(Math.round(x0 - d * -s), Math.round(y0 - d * c))); }, 'LineSegmentPoint') } });
    T({ name: 'CircleSegment', kind: 'struct', jsClass: CircleSegment, isInstance: (v) => v instanceof CircleSegment, ctor: (i, a) => new CircleSegment(a[0], num(a[1])), props: { Center: prop('Point2f', (c) => c.Center), Radius: prop('float', (c) => c.Radius) }, methods: { ToString: method((i, c) => c.csToString(), 'string') } });
    T({ name: 'Line2D', kind: 'class', jsClass: Line2D, isInstance: (v) => v instanceof Line2D, ctor: (i, a) => new Line2D(...numArgs(a)), props: { Vx: prop('double', (l) => l.Vx), Vy: prop('double', (l) => l.Vy), X1: prop('double', (l) => l.X1), Y1: prop('double', (l) => l.Y1) }, methods: { ToString: method((i, l) => l.csToString(), 'string'), Distance: method((i, l, a) => Math.abs(l.Vy * (a[0].X - l.X1) - l.Vx * (a[0].Y - l.Y1)) / Math.hypot(l.Vx, l.Vy), 'double'), GetPointAtY: method((i, l, a) => new Point2d(l.X1 + (num(a[0]) - l.Y1) * l.Vx / l.Vy, num(a[0])), 'Point2d'), GetPointAtX: method((i, l, a) => new Point2d(num(a[0]), l.Y1 + (num(a[0]) - l.X1) * l.Vy / l.Vx), 'Point2d') } });
    T({ name: 'Rangef', kind: 'struct', jsClass: Rangef, isInstance: (v) => v instanceof Rangef, ctor: (i, a) => new Rangef(num(a[0]), num(a[1])), props: { Start: prop('float', (r) => r.Start), End: prop('float', (r) => r.End) }, methods: { ToString: method((i, r) => r.csToString(), 'string') } });
    T({ name: 'Range', kind: 'struct', jsClass: Range, isInstance: (v) => v instanceof Range, ctor: (i, a) => new Range(num(a[0]), num(a[1])), statics: { All: sval('Range', () => new Range(-2147483648, 2147483647)) }, props: { Start: prop('int', (r) => r.Start), End: prop('int', (r) => r.End) }, methods: { ToString: method((i, r) => r.csToString(), 'string') } });
    T({ name: 'TermCriteria', kind: 'struct', jsClass: TermCriteria, isInstance: (v) => v instanceof TermCriteria, ctor: (i, a) => new TermCriteria(enumVal(a[0], 3), num(a[1]), num(a[2])), props: { Type: prop('int', (t) => t.Type), MaxCount: prop('int', (t) => t.MaxCount), Epsilon: prop('double', (t) => t.Epsilon) } });
    T({ name: 'Blob', kind: 'class', jsClass: Blob, isInstance: (v) => v instanceof Blob, props: { Label: prop('int', (b) => b.Label), Area: prop('int', (b) => b.Area), Left: prop('int', (b) => b.Left), Top: prop('int', (b) => b.Top), Width: prop('int', (b) => b.Width), Height: prop('int', (b) => b.Height), Rect: prop('Rect', (b) => b.Rect), Centroid: prop('Point2d', (b) => b.Centroid) }, methods: { ToString: method((i, b) => b.csToString(), 'string') } });
    T({
      name: 'ConnectedComponents', kind: 'class', jsClass: ConnectedComponents, isInstance: (v) => v instanceof ConnectedComponents,
      props: { LabelCount: prop('int', (c) => c.LabelCount), Labels: prop('int[,]', (c) => c.Labels), Blobs: prop('List<Blob>', (c) => c.Blobs) },
      methods: {
        GetLargestBlob: method((i, c) => c.Blobs.items.slice(1).reduce((b, x) => (!b || x.Area > b.Area ? x : b), null), 'Blob'),
        FilterByBlob: method((i, c, a) => { const src = asMat(a[0]), dst = outMat(a[1]); const b = a[2]; const mask = new cv.Mat(src.rows, src.cols, cv.CV_8UC1, new cv.Scalar(0)); const d = mask.data; const L = c.Labels; for (let k = 0; k < d.length; k++) if (L[k] === b.Label) d[k] = 255; dst.create(src.rows, src.cols, src.type()); dst.setTo(new cv.Scalar(0, 0, 0, 0)); src.copyTo(dst, mask); mask.delete(); }),
        FilterByLabel: method((i, c, a) => { const src = asMat(a[0]), dst = outMat(a[1]); const lab = num(a[2]); const mask = new cv.Mat(src.rows, src.cols, cv.CV_8UC1, new cv.Scalar(0)); const d = mask.data; const L = c.Labels; for (let k = 0; k < d.length; k++) if (L[k] === lab) d[k] = 255; dst.create(src.rows, src.cols, src.type()); dst.setTo(new cv.Scalar(0, 0, 0, 0)); src.copyTo(dst, mask); mask.delete(); }),
        RenderBlobs: method((i, c, a) => { const dst = outMat(a[0]); const [h, w] = c.Labels.__dims; dst.create(h, w, cv.CV_8UC3); const d = dst.data; const L = c.Labels; const colors = [[0, 0, 0]]; for (let k = 1; k < c.LabelCount; k++) { const hh = (k * 137.508) % 360; const [r, g, b] = hsl(hh, 0.7, 0.55); colors.push([b, g, r]); } for (let k = 0; k < L.length; k++) { const col = colors[L[k]] || [255, 255, 255]; d[3 * k] = col[0]; d[3 * k + 1] = col[1]; d[3 * k + 2] = col[2]; } })
      }
    });
    function hsl(h, s, l) { const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2; let r, g, b; if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x]; return [(r + m) * 255 | 0, (g + m) * 255 | 0, (b + m) * 255 | 0]; }

    // ---------------------------------------------------------------- Mat
    const DEPTH_ARR = (m) => { switch (m.depth()) { case 0: return m.data; case 1: return m.data8S; case 2: return m.data16U; case 3: return m.data16S; case 4: return m.data32S; case 5: return m.data32F; case 6: return m.data64F; default: return m.data; } };
    const DEPTH_T = ['byte', 'sbyte', 'ushort', 'short', 'int', 'float', 'double', 'float'];
    const depthOfT = (t) => ({ byte: 0, sbyte: 1, ushort: 2, short: 3, int: 4, float: 5, double: 6 }[t]);
    ctx.DEPTH_ARR = DEPTH_ARR;
    const checkYX = (m, y, x) => { if (!Number.isInteger(y) || !Number.isInteger(x) || y < 0 || y >= m.rows || x < 0 || x >= m.cols) throw new CsException('IndexOutOfRangeException', `Mat 범위를 벗어난 좌표입니다: (행 y=${y}, 열 x=${x}) / 크기 ${m.rows}×${m.cols}. At<T>(y, x) 는 (행, 열) 순서입니다.`); };
    /** Get<T>(y, x): T 에 따라 값 · Vec 반환 */
    function matGet(mat, t, y, x) {
      const m = mat.cv; checkYX(m, y, x);
      const ch = m.channels(), a = DEPTH_ARR(m), base = (y * m.cols + x) * ch;
      if (t in VEC_TYPES) { const n = VEC_TYPES[t][0]; if (n !== ch) throw new CsException('ArgumentException', `${t} 는 ${n}채널용인데 이 Mat 은 ${ch}채널(${new MatType(m.type()).csToString()})입니다`); return makeVec(t, Array.from({ length: n }, (_, k) => a[base + k])); }
      if (t === 'Point' || t === 'Point2f' || t === 'Point2d') { if (ch !== 2) throw new CsException('ArgumentException', `${t} 는 2채널 Mat 에서만 읽을 수 있습니다`); return t === 'Point' ? new Point(a[base], a[base + 1]) : t === 'Point2f' ? new Point2f(a[base], a[base + 1]) : new Point2d(a[base], a[base + 1]); }
      if (ch !== 1 && t !== 'Scalar') throw new CsException('ArgumentException', `이 Mat 은 ${ch}채널입니다. Get<Vec${ch}b>(y, x) 처럼 채널 수에 맞는 Vec 형식을 쓰세요`);
      if (t === 'Scalar') return new Scalar(...Array.from({ length: 4 }, (_, k) => (k < ch ? a[base + k] : 0)));
      const v = a[base];
      const dt = DEPTH_T[m.depth()];
      if (t && t !== dt && isIntegral(t) !== isIntegral(dt)) interp.host.note && interp.host.note(`Get<${t}> 를 ${new MatType(m.type()).csToString()} Mat 에 썼습니다. 자료형이 다르면 값이 이상하게 나옵니다 (Mat 의 실제 형식: ${dt})`);
      return coerce(v, t || dt, interp);
    }
    function matSet(mat, t, y, x, v) {
      const m = mat.cv; checkYX(m, y, x);
      const ch = m.channels(), a = DEPTH_ARR(m), base = (y * m.cols + x) * ch;
      if (v instanceof Vec) { for (let k = 0; k < Math.min(ch, v.n); k++) a[base + k] = v.items[k]; return; }
      if (v instanceof Scalar) { for (let k = 0; k < ch; k++) a[base + k] = v.at(k); return; }
      if (v instanceof Point || v instanceof Point2f || v instanceof Point2d) { a[base] = v.X; a[base + 1] = v.Y; return; }
      if (ch !== 1) throw new CsException('ArgumentException', `${ch}채널 Mat 에는 Vec${ch}b 등 벡터 값을 넣어야 합니다`);
      a[base] = toNum(v, 'double', interp);
    }
    ctx.matGet = matGet; ctx.matSet = matSet;
    const elemTOfMat = (m) => { const ch = m.channels(), d = m.depth(); if (ch === 1) return DEPTH_T[d]; const suf = ['b', 's', 'w', 's', 'i', 'f', 'd', 'f'][d]; return `Vec${ch}${suf}`; };
    /** 표시 가능한 8비트 raw 로 (imshow 규칙) */
    function matToRaw(m) {
      const ch = m.channels(); if (ch === 2) throw new CsException('OpenCVException', '2채널 Mat 은 imshow 로 표시할 수 없습니다');
      let src = m, tmp = null;
      if (m.depth() !== cv.CV_8U) {
        tmp = new cv.Mat();
        if (m.depth() === cv.CV_32F || m.depth() === cv.CV_64F) m.convertTo(tmp, cv.CV_8U, 255, 0);
        else if (m.depth() === cv.CV_16U) m.convertTo(tmp, cv.CV_8U, 1 / 256, 0);
        else cv.convertScaleAbs(m, tmp);
        src = tmp;
      }
      let bytes;
      if (src.isContinuous()) bytes = new Uint8Array(src.data);   // 복사
      else { const c = src.clone(); bytes = new Uint8Array(c.data); c.delete(); }
      if (tmp) tmp.delete();
      return { w: m.cols, h: m.rows, ch, bytes };
    }
    ctx.matToRaw = matToRaw;
    /** raw {w,h,ch,bytes} → cv.Mat (BGR 순서 유지) */
    function rawToMat(raw, mode) {
      const type = raw.ch === 1 ? cv.CV_8UC1 : raw.ch === 3 ? cv.CV_8UC3 : cv.CV_8UC4;
      let m = cv.matFromArray(raw.h, raw.w, type, raw.bytes);
      if (mode === 0 && raw.ch !== 1) { const g = new cv.Mat(); cv.cvtColor(m, g, raw.ch === 3 ? cv.COLOR_BGR2GRAY : cv.COLOR_BGRA2GRAY); m.delete(); m = g; }
      else if (mode === 1 && raw.ch !== 3) { const c = new cv.Mat(); cv.cvtColor(m, c, raw.ch === 1 ? cv.COLOR_GRAY2BGR : cv.COLOR_BGRA2BGR); m.delete(); m = c; }
      return m;
    }
    ctx.rawToMat = rawToMat;
    function imread(path, modeV) {
      const mode = modeV == null ? 1 : enumVal(modeV, 1);
      const p = str(path);
      const raw = host.fs && host.fs.readImage ? host.fs.readImage(p) : null;
      if (!raw) {
        if (host.note) host.note(`imread: '${p}' 파일을 찾을 수 없어 빈 Mat 을 돌려줍니다. 📁 작업 폴더에서 파일 이름을 확인하세요 (예: images/sample_color.png).`);
        return ctx.wrap(new cv.Mat());
      }
      return ctx.wrap(rawToMat(raw, mode === -1 ? -1 : (mode & 1) === 0 && mode !== -1 && (mode === 0 || mode === 2) ? 0 : 1));
    }
    ctx.imread = imread;

    const createMat = (i, a) => {
      if (!a.length) return newMat();
      if (typeof a[0] === 'string') return imread(a[0], a[1]);
      if (a[0] instanceof Mat) {
        if (a[1] instanceof Rect) { const r = a[1]; const src = a[0].cv; if (r.X < 0 || r.Y < 0 || r.X + r.Width > src.cols || r.Y + r.Height > src.rows) throw new CsException('OpenCVException', `ROI 가 이미지 범위를 벗어났습니다: ${r.csToString()} / 이미지 ${src.cols}×${src.rows}`); return ctx.wrap(guard(() => src.roi(toRect(r))), { isSub: true }); }
        if (a[1] instanceof Range) { const src = a[0].cv; const rr = a[1], cr = a[2] || new Range(0, src.cols); return ctx.wrap(guard(() => src.roi(new cv.Rect(cr.Start, rr.Start, (cr.End === 2147483647 ? src.cols : cr.End) - cr.Start, (rr.End === 2147483647 ? src.rows : rr.End) - rr.Start))), { isSub: true }); }
        return ctx.wrap(a[0].cv.clone());
      }
      let rows, cols, rest;
      if (a[0] instanceof Size) { rows = a[0].Height; cols = a[0].Width; rest = a.slice(1); }
      else { rows = num(a[0]); cols = num(a[1]); rest = a.slice(2); }
      const type = rest.length ? matTypeOf(rest[0]) : cv.CV_8UC1;
      if (type < 0) throw new CsException('ArgumentException', 'Mat 형식에는 MatType.CV_8UC3 처럼 MatType 을 넘기세요');
      if (rest.length > 1 && rest[1] != null) {
        if (Array.isArray(rest[1]) || rest[1] instanceof CsList) { const data = seqOf(rest[1]).map((v) => toNum(v, 'double', interp)); const need = rows * cols * ((type >> 3) + 1); if (data.length !== need) throw new CsException('ArgumentException', `데이터 길이가 맞지 않습니다: ${data.length}개 (필요: ${rows}×${cols}×${(type >> 3) + 1} = ${need}개)`); return ctx.wrap(guard(() => cv.matFromArray(rows, cols, type, data))); }
        return ctx.wrap(guard(() => new cv.Mat(rows, cols, type, toCvScalar(rest[1]))));
      }
      return ctx.wrap(guard(() => new cv.Mat(rows, cols, type)));
    };
    ctx.createMat = createMat;

    const matDesc = T({
      name: 'Mat', kind: 'class', jsClass: Mat, isInstance: (v) => v instanceof Mat, aliases: ['InputArray', 'OutputArray', 'InputOutputArray', 'UMat', 'MatExpr'],
      ctor: createMat,
      statics: {
        Zeros: sfn((i, a) => (a[0] instanceof Size ? ctx.wrap(cv.Mat.zeros(a[0].Height, a[0].Width, matTypeOf(a[1]))) : ctx.wrap(cv.Mat.zeros(num(a[0]), num(a[1]), matTypeOf(a[2])))), 'Mat'),
        Ones: sfn((i, a) => (a[0] instanceof Size ? ctx.wrap(cv.Mat.ones(a[0].Height, a[0].Width, matTypeOf(a[1]))) : ctx.wrap(cv.Mat.ones(num(a[0]), num(a[1]), matTypeOf(a[2])))), 'Mat'),
        Eye: sfn((i, a) => (a[0] instanceof Size ? ctx.wrap(cv.Mat.eye(a[0].Height, a[0].Width, matTypeOf(a[1]))) : ctx.wrap(cv.Mat.eye(num(a[0]), num(a[1]), matTypeOf(a[2])))), 'Mat'),
        FromPixelData: sfn((i, a) => createMat(i, [a[0], a[1], a[2], a[3]]), 'Mat'),
        FromArray: sfn((i, a, ta) => { const data = a[0]; if (data.__dims) { const [r, c] = data.__dims; return ctx.wrap(cv.matFromArray(r, c, cvTypeForElem(data.__elem, 1), Array.from(data, (v) => toNum(v, 'double', interp)))); } if (Array.isArray(data[0])) { const r = data.length, c = data[0].length; return ctx.wrap(cv.matFromArray(r, c, cvTypeForElem(data.__elem && data.__elem.replace(/\[\]$/, ''), 1), data.flat().map((v) => toNum(v, 'double', interp)))); } if (isPointSeq(data)) return ctx.wrap(pointsToMat(data)); return ctx.wrap(cv.matFromArray(data.length, 1, cvTypeForElem(data.__elem, 1), Array.from(data, (v) => toNum(v, 'double', interp)))); }, 'Mat'),
        ImRead: sfn((i, a) => imread(a[0], a[1]), 'Mat')
      },
      indexer: {
        t: 'Mat',
        get: (mat, idx) => { const m = mat.cv; if (idx.length === 1 && idx[0] instanceof Rect) { const r = idx[0]; return ctx.wrap(guard(() => m.roi(toRect(r))), { isSub: true }); } if (idx.length === 4) { const [r0, r1, c0, c1] = idx.map(num); return ctx.wrap(guard(() => m.roi(new cv.Rect(c0, r0, c1 - c0, r1 - r0))), { isSub: true }); } if (idx.length === 2 && idx[0] instanceof Range) { return ctx.wrap(guard(() => m.roi(new cv.Rect(idx[1].Start, idx[0].Start, (idx[1].End === 2147483647 ? m.cols : idx[1].End) - idx[1].Start, (idx[0].End === 2147483647 ? m.rows : idx[0].End) - idx[0].Start))), { isSub: true }); } if (idx.length === 2) return matGet(mat, null, num(idx[0]), num(idx[1])); throw new CsException('ArgumentException', 'Mat 인덱서는 mat[rect], mat[rowStart, rowEnd, colStart, colEnd] 형태로 씁니다'); },
        set: (mat, idx, v) => { const m = mat.cv; if (idx.length === 1 && idx[0] instanceof Rect) { const roi = m.roi(toRect(idx[0])); try { if (v instanceof Mat) { guard(() => v.cv.copyTo(roi)); } else roi.setTo(toCvScalar(v)); } finally { roi.delete(); } return; } if (idx.length === 2 && typeof idx[0] === 'number') { matSet(mat, null, num(idx[0]), num(idx[1]), v); return; } throw new CsException('ArgumentException', 'Mat 인덱서 대입은 mat[rect] = 다른Mat 형태로 씁니다'); }
      },
      props: {
        Rows: prop('int', (m) => m.cv.rows), Cols: prop('int', (m) => m.cv.cols), Width: prop('int', (m) => m.cv.cols), Height: prop('int', (m) => m.cv.rows),
        Dims: prop('int', () => 2), IsDisposed: prop('bool', (m) => m.disposed), IsSubmatrix: prop('bool', (m) => !!m.isSub),
        Data: prop('IntPtr', (m) => { throw new CsException('NotSupportedException', 'Mat.Data(포인터)는 브라우저 실습 환경에서 쓸 수 없습니다. GetArray/At<T>/Get<T> 를 쓰세요'); })
      },
      methods: {
        Size: method((i, m, a) => (a.length ? (num(a[0]) === 0 ? m.cv.rows : m.cv.cols) : new Size(m.cv.cols, m.cv.rows)), (ta, at) => (at && at.length ? 'int' : 'Size')),
        Channels: method((i, m) => m.cv.channels(), 'int'), Type: method((i, m) => new MatType(m.cv.type()), 'MatType'), Depth: method((i, m) => m.cv.depth(), 'int'),
        Empty: method((i, m) => m.cv.empty(), 'bool'), Total: method((i, m) => m.cv.rows * m.cv.cols, 'long'), ElemSize: method((i, m) => m.cv.elemSize(), 'long'), ElemSize1: method((i, m) => m.cv.elemSize1(), 'long'), Step: method((i, m) => m.cv.step, 'long'), Step1: method((i, m) => m.cv.step / m.cv.elemSize1(), 'long'),
        IsContinuous: method((i, m) => m.cv.isContinuous(), 'bool'), IsSubmatrix: method((i, m) => !!m.isSub, 'bool'),
        Clone: method((i, m, a) => (a.length && a[0] instanceof Rect ? ctx.wrap(guard(() => { const r = m.cv.roi(toRect(a[0])); const c = r.clone(); r.delete(); return c; })) : ctx.wrap(m.cv.clone())), 'Mat'),
        CopyTo: method((i, m, a) => { const dst = outMat(a[0]); guard(() => (a.length > 1 && a[1] ? m.cv.copyTo(dst, asMat(a[1], 'mask')) : m.cv.copyTo(dst))); }),
        ConvertTo: method((i, m, a) => { const dst = outMat(a[0]); const rtype = a.length > 1 ? matTypeOf(a[1]) : -1; guard(() => m.cv.convertTo(dst, rtype, a.length > 2 ? num(a[2]) : 1, a.length > 3 ? num(a[3]) : 0)); }),
        SetTo: method((i, m, a) => { guard(() => (a.length > 1 && a[1] ? m.cv.setTo(toCvScalar(a[0]), asMat(a[1], 'mask')) : m.cv.setTo(toCvScalar(a[0])))); return m; }, 'Mat'),
        Get: method((i, m, a, ta) => matGet(m, ta && ta[0], num(a[0]), num(a[1])), (ta) => ta && ta[0]),
        At: method((i, m, a, ta) => matGet(m, ta && ta[0], num(a[0]), num(a[1])), (ta) => ta && ta[0]),
        Set: method((i, m, a, ta) => matSet(m, ta && ta[0], num(a[0]), num(a[1]), a[2])),
        GetGenericIndexer: method((i, m, a, ta) => makeIndexer(m, ta && ta[0]), 'MatIndexer'), GetIndexer: method((i, m, a, ta) => makeIndexer(m, ta && ta[0]), 'MatIndexer'), GetUnsafeGenericIndexer: method((i, m, a, ta) => makeIndexer(m, ta && ta[0]), 'MatIndexer'),
        SubMat: method((i, m, a) => { if (a[0] instanceof Rect) return ctx.wrap(guard(() => m.cv.roi(toRect(a[0]))), { isSub: true }); if (a[0] instanceof Range) return ctx.wrap(guard(() => m.cv.roi(new cv.Rect(a[1].Start, a[0].Start, (a[1].End === 2147483647 ? m.cv.cols : a[1].End) - a[1].Start, (a[0].End === 2147483647 ? m.cv.rows : a[0].End) - a[0].Start))), { isSub: true }); const [r0, r1, c0, c1] = a.map(num); return ctx.wrap(guard(() => m.cv.roi(new cv.Rect(c0, r0, c1 - c0, r1 - r0))), { isSub: true }); }, 'Mat'),
        Row: method((i, m, a) => ctx.wrap(guard(() => m.cv.row(num(a[0]))), { isSub: true }), 'Mat'), Col: method((i, m, a) => ctx.wrap(guard(() => m.cv.col(num(a[0]))), { isSub: true }), 'Mat'),
        RowRange: method((i, m, a) => ctx.wrap(guard(() => (a[0] instanceof Range ? m.cv.rowRange(a[0].Start, a[0].End) : m.cv.rowRange(num(a[0]), num(a[1])))), { isSub: true }), 'Mat'), ColRange: method((i, m, a) => ctx.wrap(guard(() => (a[0] instanceof Range ? m.cv.colRange(a[0].Start, a[0].End) : m.cv.colRange(num(a[0]), num(a[1])))), { isSub: true }), 'Mat'),
        Reshape: method((i, m, a) => ctx.wrap(guard(() => { const r = m.cv.reshape(num(a[0]), a.length > 1 ? num(a[1]) : 0); return r; })), 'Mat'),
        T: method((i, m) => { const d = newMat(); guard(() => cv.transpose(m.cv, d.cv)); return d; }, 'Mat'),
        Inv: method((i, m) => { const d = newMat(); guard(() => cv.invert(m.cv, d.cv)); return d; }, 'Mat'),
        Dot: method((i, m, a) => guard(() => m.cv.dot(asMat(a[0]))), 'double'),
        Sum: method((i, m) => sumScalar(m.cv), 'Scalar'), Mean: method((i, m, a) => { const s = guard(() => (a.length ? cv.mean(m.cv, asMat(a[0])) : cv.mean(m.cv))); return new Scalar(s[0], s[1], s[2], s[3]); }, 'Scalar'),
        CountNonZero: method((i, m) => guard(() => cv.countNonZero(m.cv)), 'int'),
        Split: method((i, m) => splitMat(m.cv), 'Mat[]'),
        GetArray: method((i, m, a, ta) => { const out = matToArray(m.cv, ta && ta[0]); if (a.length && a[0] instanceof Ref) { a[0].set(out); return true; } return out; }, (ta) => (ta && ta[0] ? ta[0] + '[]' : null)),
        GetRectangularArray: method((i, m, a, ta) => { const out = matToArray(m.cv, ta && ta[0], true); if (a.length && a[0] instanceof Ref) { a[0].set(out); return true; } return out; }, (ta) => (ta && ta[0] ? ta[0] + '[,]' : null)),
        SetArray: method((i, m, a) => { const data = a[0]; const arrv = DEPTH_ARR(m.cv); const flat = Array.isArray(data) ? data : seqOf(data); for (let k = 0; k < Math.min(flat.length, arrv.length); k++) arrv[k] = flat[k] instanceof Vec ? flat[k].items[0] : toNum(flat[k], 'double', interp); }),
        ToBytes: method((i, m, a) => { const png = host.encodePng ? host.encodePng(matToRaw(m.cv)) : null; if (!png) throw new CsException('NotSupportedException', 'PNG 인코딩을 지원하지 않는 환경입니다'); return arr(Array.from(png), 'byte'); }, 'byte[]'),
        ImWrite: method((i, m, a) => imwrite(a[0], m), 'bool'), SaveImage: method((i, m, a) => imwrite(a[0], m), 'bool'),
        Dump: method((i, m) => dumpMat(m.cv), 'string'), ToString: method((i, m) => m.csToString(), 'string'),
        Dispose: method((i, m) => m.dispose()), Release: method((i, m) => { guard(() => m.cv.release && m.cv.release()); }),
        Create: method((i, m, a) => { if (a[0] instanceof Size) guard(() => m.cv.create(a[0].Height, a[0].Width, matTypeOf(a[1]))); else guard(() => m.cv.create(num(a[0]), num(a[1]), matTypeOf(a[2]))); }),
        SetIdentity: method((i, m, a) => { m.cv.setTo(new cv.Scalar(0)); const n = Math.min(m.cv.rows, m.cv.cols), d = DEPTH_ARR(m.cv), ch = m.cv.channels(); for (let k = 0; k < n; k++) d[(k * m.cv.cols + k) * ch] = a.length ? toScalar(a[0]).Val0 : 1; }),
        PushBack: method((i, m, a) => { const src = asMat(a[0]); if (m.cv.empty()) { src.copyTo(m.cv); return; } const d = new cv.Mat(); const v = new cv.MatVector(); v.push_back(m.cv); v.push_back(src); guard(() => cv.vconcat(v, d)); v.delete(); d.copyTo(m.cv); d.delete(); }),
        ToBitmapSource: method(() => wpfStub('BitmapSource'), 'BitmapSource'), ToWriteableBitmap: method(() => wpfStub('WriteableBitmap'), 'WriteableBitmap'), ToBitmap: method(() => wpfStub('Bitmap'), 'Bitmap'),
        ToImage: method(() => wpfStub('Image'), 'Image'), ToMemoryStream: method((i, m) => { const png = host.encodePng ? host.encodePng(matToRaw(m.cv)) : new Uint8Array(0); return { __stream: png, __csTypeName: 'MemoryStream', csToString: () => 'MemoryStream', Position: 0 }; }, 'MemoryStream')
      },
      operators: {
        '+': (i, v) => matArith('add', v), '-': (i, v) => (v.length === 1 ? matScale(v[0], -1) : matArith('subtract', v)), '*': (i, v) => matMul(v), '/': (i, v) => matArith('divide', v),
        '&': (i, v) => matArith('bitwise_and', v), '|': (i, v) => matArith('bitwise_or', v), '^': (i, v) => matArith('bitwise_xor', v), '~': (i, v) => { const d = newMat(); guard(() => cv.bitwise_not(v[0].cv, d.cv)); return d; },
        '==': (i, v) => (v[0] instanceof Mat && v[1] instanceof Mat ? v[0] === v[1] : v[0] == null || v[1] == null ? v[0] === v[1] : matCompare(v, cv.CMP_EQ)), '!=': (i, v) => (v[0] instanceof Mat && v[1] instanceof Mat ? v[0] !== v[1] : v[0] == null || v[1] == null ? v[0] !== v[1] : matCompare(v, cv.CMP_NE)),
        '>': (i, v) => matCompare(v, cv.CMP_GT), '<': (i, v) => matCompare(v, cv.CMP_LT), '>=': (i, v) => matCompare(v, cv.CMP_GE), '<=': (i, v) => matCompare(v, cv.CMP_LE)
      }
    });
    ctx.matDesc = matDesc;
    function wpfStub(name) { if (host.note) host.note(`${name} 변환은 WPF 화면용입니다. 브라우저에서는 Cv2.ImShow 로 결과를 확인하세요.`); return { __wpf: name, __csTypeName: name === 'WriteableBitmap' ? 'WriteableBitmap' : 'BitmapSource', csToString: () => `System.Windows.Media.Imaging.${name}`, PixelWidth: 0, PixelHeight: 0, Width: 0, Height: 0 }; }
    function cvTypeForElem(t, ch) { const d = depthOfT(t == null ? 'double' : t); return (d == null ? 6 : d) + ((ch - 1) << 3); }
    function scalarLike(v, like) { const s = toCvScalar(v); return new cv.Mat(like.rows, like.cols, like.type(), s); }
    function matArith(op, v) {
      const a = v[0], b = v[1];
      const d = newMat();
      if (a instanceof Mat && b instanceof Mat) guard(() => cv[op](a.cv, b.cv, d.cv));
      else if (a instanceof Mat) { const t = scalarLike(b, a.cv); try { guard(() => cv[op](a.cv, t, d.cv)); } finally { t.delete(); } }
      else { const t = scalarLike(a, b.cv); try { guard(() => cv[op](t, b.cv, d.cv)); } finally { t.delete(); } }
      return d;
    }
    function matScale(m, k) { const d = newMat(); guard(() => m.cv.convertTo(d.cv, -1, k, 0)); return d; }
    function matMul(v) {
      const a = v[0], b = v[1];
      if (a instanceof Mat && b instanceof Mat) { const d = newMat(); guard(() => cv.gemm(a.cv, b.cv, 1, new cv.Mat(), 0, d.cv)); return d; }
      if (a instanceof Mat) return matScale(a, toNum(b, 'double', interp));
      return matScale(b, toNum(a, 'double', interp));
    }
    function matCompare(v, op) { const a = v[0], b = v[1]; const d = newMat(); if (a instanceof Mat && b instanceof Mat) guard(() => cv.compare(a.cv, b.cv, d.cv, op)); else if (a instanceof Mat) { const t = scalarLike(b, a.cv); try { guard(() => cv.compare(a.cv, t, d.cv, op)); } finally { t.delete(); } } else { const t = scalarLike(a, b.cv); try { guard(() => cv.compare(t, b.cv, d.cv, op)); } finally { t.delete(); } } return d; }
    function sumScalar(m) { const ch = m.channels(), a = DEPTH_ARR(m), s = [0, 0, 0, 0]; for (let k = 0; k < a.length; k++) s[k % ch] += a[k]; return new Scalar(s[0], s[1], s[2], s[3]); }
    ctx.sumScalar = sumScalar;
    function splitMat(m) { const vec = new cv.MatVector(); guard(() => cv.split(m, vec)); const out = []; for (let k = 0; k < vec.size(); k++) out.push(ctx.wrap(vec.get(k))); vec.delete(); out.__elem = 'Mat'; return out; }
    ctx.splitMat = splitMat;
    function matToArray(m, t, rect) {
      const a = DEPTH_ARR(m), ch = m.channels(), n = m.rows * m.cols;
      const et = t || elemTOfMat(m);
      let out;
      if (et in VEC_TYPES) { out = []; for (let k = 0; k < n; k++) out.push(makeVec(et, Array.from({ length: ch }, (_, c) => a[k * ch + c]))); }
      else { out = Array.from(a, (v) => coerce(v, et, interp)); }
      out.__elem = et;
      if (rect) { out.__dims = [m.rows, m.cols * (et in VEC_TYPES ? 1 : ch)]; }
      return out;
    }
    ctx.matToArray = matToArray;
    function dumpMat(m) { const a = DEPTH_ARR(m), ch = m.channels(); const rows = []; const f = m.depth() >= 5; for (let y = 0; y < m.rows; y++) { const row = []; for (let x = 0; x < m.cols; x++) { const cell = []; for (let c = 0; c < ch; c++) { const v = a[(y * m.cols + x) * ch + c]; cell.push(f ? R.numToString(v) : String(v)); } row.push(cell.join(', ')); } rows.push(row.join(', ')); } return '[' + rows.join(';\n ') + ']'; }
    function imwrite(path, mat) { const p = str(path); if (!host.fs || !host.fs.write) throw new CsException('IOException', '이 환경에서는 파일을 저장할 수 없습니다'); const raw = matToRaw(mat.cv); const png = host.encodePng ? host.encodePng(raw) : null; if (!png) throw new CsException('NotSupportedException', 'PNG 인코딩을 지원하지 않는 환경입니다'); host.fs.write(p, png, raw); if (!/\.png$/i.test(p) && host.note) host.note(`imwrite: 브라우저 실습 환경은 항상 PNG 형식으로 저장합니다 (${p}).`); return true; }
    ctx.imwrite = imwrite;
    function makeIndexer(m, t) { return { __indexer: true, __csTypeName: 'MatIndexer', mat: m, t, csToString: () => `MatIndexer<${t || '?'}>` }; }
    T({ name: 'MatIndexer', kind: 'class', isInstance: (v) => v && v.__indexer, indexer: { t: null, get: (ix, idx) => matGet(ix.mat, ix.t, num(idx[0]), num(idx[1])), set: (ix, idx, v) => matSet(ix.mat, ix.t, num(idx[0]), num(idx[1]), v) } });

    // WPF 변환 정적 클래스 (안내용 스텁)
    T({ name: 'BitmapSourceConverter', kind: 'static', statics: { ToBitmapSource: sfn(() => wpfStub('BitmapSource'), 'BitmapSource'), ToMat: sfn((i, a) => { throw new CsException('NotSupportedException', 'BitmapSource → Mat 변환은 WPF 전용입니다'); }, 'Mat') } });
    T({ name: 'WriteableBitmapConverter', kind: 'static', statics: { ToWriteableBitmap: sfn(() => wpfStub('WriteableBitmap'), 'WriteableBitmap'), ToMat: sfn(() => { throw new CsException('NotSupportedException', 'WriteableBitmap → Mat 변환은 WPF 전용입니다'); }, 'Mat') } });
    T({ name: 'BitmapConverter', kind: 'static', statics: { ToBitmap: sfn(() => wpfStub('Bitmap'), 'Bitmap'), ToMat: sfn(() => { throw new CsException('NotSupportedException', 'Bitmap → Mat 변환은 데스크톱 전용입니다'); }, 'Mat') } });
    T({ name: 'BitmapSource', kind: 'class', isInstance: (v) => v && v.__wpf, props: { PixelWidth: prop('int', () => 0), PixelHeight: prop('int', () => 0), Width: prop('double', () => 0), Height: prop('double', () => 0) } });
    T({ name: 'WriteableBitmap', kind: 'class', isInstance: (v) => v && v.__wpf === 'WriteableBitmap', props: { PixelWidth: prop('int', () => 0), PixelHeight: prop('int', () => 0) }, methods: { Lock: method(() => {}), Unlock: method(() => {}), AddDirtyRect: method(() => {}) } });
    T({ name: 'MemoryStream', kind: 'class', isInstance: (v) => v && v.__stream, ctor: (i, a) => ({ __stream: a.length && Array.isArray(a[0]) ? new Uint8Array(a[0].map(num)) : new Uint8Array(0), __csTypeName: 'MemoryStream', csToString: () => 'MemoryStream', Position: 0 }), props: { Length: prop('long', (s) => s.__stream.length), Position: prop('long', (s) => s.Position, (s, v) => { s.Position = v; }) }, methods: { ToArray: method((i, s) => arr(Array.from(s.__stream), 'byte'), 'byte[]'), Dispose: method(() => {}), Seek: method(() => 0, 'long'), Close: method(() => {}) } });

    const exportsObj = { ctx, Mat, MatType, Scalar, Point, Point2f, Point2d, Size, Size2f, Rect, Rect2d, RotatedRect, Vec, Moments, HierarchyIndex, KeyPoint, DMatch, LineSegmentPoint, LineSegmentPolar, CircleSegment, Line2D, Rangef, Range, TermCriteria, Blob, ConnectedComponents, VEC_TYPES, makeVec, rotatedPoints, elemTOfMat, DEPTH_T };
    interp.__cvctx = exportsObj;
    if (root.CsOpenCv2 && root.CsOpenCv2.install) root.CsOpenCv2.install(interp, host, exportsObj);
    return exportsObj;
  }

  const api = { install, ENUMS, Mat, MatType, Scalar, Point, Point2f, Point2d, Size, Size2f, Rect, RotatedRect, Vec };
  root.CsOpenCv = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
