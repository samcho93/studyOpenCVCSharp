/* OpenCvSharp API 바인딩 ② — Cv2 정적 함수 · Mat 확장 메서드 · VideoCapture · Window · 특징점 · 배경 제거 · QR */
(function (root) {
  'use strict';
  const R = root.CsRuntime || (typeof require === 'function' ? require('./cs-runtime.js') : null);
  const SL = root.CsStdlib || (typeof require === 'function' ? require('./cs-stdlib.js') : null);
  const { CsChar, CsEnumVal, CsTuple, CsFunc, CsException, Ref, coerce, fmt, csEquals, describeVal, toNum } = R;
  const { CsList, arr, num, str } = SL;

  function install(interp, host, X) {
    const cv = host.cv;
    const { ctx, Mat, MatType, Scalar, Point, Point2f, Point2d, Size, Size2f, Rect, RotatedRect, Vec, Moments, HierarchyIndex, KeyPoint, DMatch, LineSegmentPoint, LineSegmentPolar, CircleSegment, Line2D, Rangef, Blob, ConnectedComponents, VEC_TYPES, makeVec, rotatedPoints } = X;
    const { guard, isMat, asMat, toScalar, toCvScalar, toPoint, toSize, toRect, fromRect, isEnum, enumVal, seqOf, isPointSeq, pointsToMat, matToPoints, withContour, contoursToVector, matTypeOf, newMat, outMat, matToRaw, imread, imwrite, matGet, DEPTH_ARR, splitMat, sumScalar } = ctx;
    const T = (d) => interp.defType(d);
    const method = (f, ret) => ({ fn: f, ret: ret || null });
    const prop = (t, get, set) => ({ t, get, set });
    const sfn = (f, ret) => ({ fn: (i, args, typeArgs, node, rawArgs) => f(i, args, typeArgs, node, rawArgs), ret: ret || null });
    const sval = (t, get) => ({ t, get });
    const opt = (a, k, d) => (a.length > k && a[k] != null ? a[k] : d);
    const optNum = (a, k, d) => (a.length > k && a[k] != null ? toNum(a[k], 'double', interp) : d);
    const optEnum = (a, k, d) => (a.length > k && a[k] != null ? enumVal(a[k], d) : d);
    const optPoint = (a, k) => (a.length > k && a[k] != null ? toPoint(a[k]) : new cv.Point(-1, -1));
    const optMat = (a, k) => (a.length > k && a[k] != null ? asMat(a[k]) : new cv.Mat());
    const optScalar = (a, k, d) => (a.length > k && a[k] != null ? toCvScalar(a[k]) : new cv.Scalar(...(d || [0, 0, 0, 0])));
    const tmpFree = (...ms) => ms.forEach((m) => { try { if (m && typeof m.delete === 'function' && !(m instanceof Mat)) m.delete(); } catch (e) { /* 무시 */ } });
    const ptsArr = (list, elem) => arr(list, elem);
    const pointFrom = (p, T2) => (T2 === 'Point2f' ? new Point2f(p.x, p.y) : T2 === 'Point2d' ? new Point2d(p.x, p.y) : new Point(p.x, p.y));

    // ================================================================== Cv2 함수 표
    const F = {};
    const def = (name, fn, ret) => { F[name] = sfn((i, a, ta, node, raw) => fn(a, ta, node, raw, i), ret); };
    const srcDst = (name, ret, body) => def(name, (a, ta, node) => { const src = asMat(a[0], 'src'); const dst = outMat(a[1], 'dst'); return guard(() => body(src, dst, a, ta, node)); }, ret);

    // ---------------------------------------------------------------- 입출력 · 창
    def('ImRead', (a) => imread(a[0], a[1]), 'Mat');
    def('ImWrite', (a) => imwrite(a[0], a[1] instanceof Mat ? a[1] : asMat(a[1]) && a[1]), 'bool');
    def('ImShow', (a) => { const name = str(a[0]); const m = a[1]; if (!(m instanceof Mat)) throw new CsException('ArgumentException', 'ImShow 의 두 번째 인수는 Mat 이어야 합니다'); if (m.cv.empty()) throw new CsException('OpenCVException', `imshow('${name}'): 빈 이미지입니다. imread 경로 또는 이전 처리 결과를 확인하세요.`); const raw = matToRaw(m.cv); host.imshow(name, raw.w, raw.h, raw.ch, raw.bytes); }, 'void');
    def('WaitKey', (a) => (host.waitKey ? host.waitKey(optNum(a, 0, 0)) : -1), 'int');
    def('WaitKeyEx', (a) => (host.waitKey ? host.waitKey(optNum(a, 0, 0)) : -1), 'int');
    def('PollKey', () => (host.waitKey ? host.waitKey(1) : -1), 'int');
    def('NamedWindow', () => {}, 'void'); def('DestroyWindow', (a) => { if (host.destroyWindow) host.destroyWindow(str(a[0])); }, 'void'); def('DestroyAllWindows', () => { if (host.destroyWindow) host.destroyWindow(null); }, 'void');
    def('MoveWindow', () => {}, 'void'); def('ResizeWindow', () => {}, 'void'); def('SetWindowTitle', () => {}, 'void'); def('StartWindowThread', () => 0, 'int');
    def('CreateTrackbar', () => { throw new CsException('NotSupportedException', '트랙바(CreateTrackbar)는 브라우저 실습 환경에서 지원하지 않습니다. 값을 변수로 두고 바꿔 실행해 보세요 — WPF 앱에서는 Slider 컨트롤을 쓰면 됩니다.'); }, 'int');
    def('SetMouseCallback', () => { throw new CsException('NotSupportedException', '마우스 콜백은 브라우저 실습 환경에서 지원하지 않습니다. WPF 앱에서는 Image 컨트롤의 MouseDown 이벤트를 쓰세요.'); }, 'void');
    def('ImEncode', (a) => { const raw = matToRaw(asMat(a[1])); const png = host.encodePng ? host.encodePng(raw) : null; if (!png) throw new CsException('NotSupportedException', 'PNG 인코딩 불가'); const bytes = arr(Array.from(png), 'byte'); if (a[2] instanceof Ref) { a[2].set(bytes); return true; } return bytes; }, 'bool');
    def('ImDecode', (a) => { const bytes = a[0]; const raw = host.decodePng ? host.decodePng(new Uint8Array(seqOf(bytes).map(num))) : null; if (!raw) throw new CsException('NotSupportedException', '이 환경에서는 ImDecode(PNG 만) 를 지원하지 않거나 형식이 맞지 않습니다'); return ctx.wrap(ctx.rawToMat(raw, enumVal(a[1], 1) === 0 ? 0 : 1)); }, 'Mat');
    def('GetTickCount', () => Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) * 1e6), 'long');
    def('GetTickFrequency', () => 1e9, 'double');
    def('GetVersionString', () => '4.13.0 (OpenCV.js)', 'string'); def('GetBuildInformation', () => 'OpenCV.js WebAssembly build', 'string');
    def('SetNumThreads', () => {}, 'void'); def('GetNumThreads', () => 1, 'int'); def('UseOptimized', () => true, 'bool'); def('SetUseOptimized', () => {}, 'void');

    // ---------------------------------------------------------------- 색 · 채널
    srcDst('CvtColor', 'void', (s, d, a) => cv.cvtColor(s, d, optEnum(a, 2, 6), optNum(a, 3, 0)));
    def('Split', (a) => { const parts = splitMat(asMat(a[0])); if (a[1] instanceof Ref) { a[1].set(parts); return; } return parts; }, 'Mat[]');
    def('Merge', (a) => { const list = seqOf(a[0]); const dst = outMat(a[1]); const v = new cv.MatVector(); for (const m of list) v.push_back(asMat(m)); try { guard(() => cv.merge(v, dst)); } finally { v.delete(); } }, 'void');
    def('MixChannels', () => { throw new CsException('NotSupportedException', 'MixChannels 는 지원하지 않습니다. Split/Merge 를 쓰세요'); });
    def('ExtractChannel', (a) => { const s = asMat(a[0]), d = outMat(a[1]); const parts = splitMat(s); parts[num(a[2])].cv.copyTo(d); parts.forEach((p) => p.dispose()); }, 'void');
    def('InsertChannel', (a) => { const s = asMat(a[0]), d = outMat(a[1]); const parts = splitMat(d); s.copyTo(parts[num(a[2])].cv); const v = new cv.MatVector(); parts.forEach((p) => v.push_back(p.cv)); cv.merge(v, d); v.delete(); parts.forEach((p) => p.dispose()); }, 'void');
    def('InRange', (a) => { const s = asMat(a[0]), d = outMat(a[3]); const lo = a[1] instanceof Mat ? a[1].cv : new cv.Mat(s.rows, s.cols, s.type(), toCvScalar(a[1])); const hi = a[2] instanceof Mat ? a[2].cv : new cv.Mat(s.rows, s.cols, s.type(), toCvScalar(a[2])); try { guard(() => cv.inRange(s, lo, hi, d)); } finally { if (!(a[1] instanceof Mat)) lo.delete(); if (!(a[2] instanceof Mat)) hi.delete(); } }, 'void');
    def('ApplyColorMap', (a) => { const s = asMat(a[0]), d = outMat(a[1]); guard(() => cv.applyColorMap(s, d, optEnum(a, 2, 2))); }, 'void');
    def('LUT', (a) => { const s = asMat(a[0]); const lut = a[1] instanceof Mat ? a[1].cv : cv.matFromArray(1, 256, cv.CV_8UC1, seqOf(a[1]).map(num)); const d = outMat(a[2]); try { guard(() => cv.LUT(s, lut, d)); } finally { if (!(a[1] instanceof Mat)) lut.delete(); } }, 'void');

    // ---------------------------------------------------------------- 산술
    const arith = (name, fn) => def(name, (a) => { const d = outMat(a[2], 'dst'); const s1 = a[0] instanceof Mat ? a[0].cv : null, s2 = a[1] instanceof Mat ? a[1].cv : null; const like = s1 || s2; const m1 = s1 || new cv.Mat(like.rows, like.cols, like.type(), toCvScalar(a[0])); const m2 = s2 || new cv.Mat(like.rows, like.cols, like.type(), toCvScalar(a[1])); try { guard(() => fn(m1, m2, d, a)); } finally { if (!s1) m1.delete(); if (!s2) m2.delete(); } }, 'void');
    arith('Add', (x, y, d, a) => cv.add(x, y, d, optMat(a, 3), optNum(a, 4, -1)));
    arith('Subtract', (x, y, d, a) => cv.subtract(x, y, d, optMat(a, 3), optNum(a, 4, -1)));
    arith('Multiply', (x, y, d, a) => cv.multiply(x, y, d, optNum(a, 3, 1), optNum(a, 4, -1)));
    arith('Divide', (x, y, d, a) => cv.divide(x, y, d, optNum(a, 3, 1), optNum(a, 4, -1)));
    arith('Absdiff', (x, y, d) => cv.absdiff(x, y, d));
    arith('BitwiseAnd', (x, y, d, a) => cv.bitwise_and(x, y, d, optMat(a, 3)));
    arith('BitwiseOr', (x, y, d, a) => cv.bitwise_or(x, y, d, optMat(a, 3)));
    arith('BitwiseXor', (x, y, d, a) => cv.bitwise_xor(x, y, d, optMat(a, 3)));
    arith('Max', (x, y, d) => cv.max(x, y, d)); arith('Min', (x, y, d) => cv.min(x, y, d));
    def('Compare', (a) => { const d = outMat(a[2]); const s1 = asMat(a[0]); const s2 = a[1] instanceof Mat ? a[1].cv : new cv.Mat(s1.rows, s1.cols, s1.type(), toCvScalar(a[1])); try { guard(() => cv.compare(s1, s2, d, optEnum(a, 3, 0))); } finally { if (!(a[1] instanceof Mat)) s2.delete(); } }, 'void');
    srcDst('BitwiseNot', 'void', (s, d, a) => cv.bitwise_not(s, d, optMat(a, 2)));
    def('AddWeighted', (a) => { guard(() => cv.addWeighted(asMat(a[0]), optNum(a, 1, 1), asMat(a[2]), optNum(a, 3, 1), optNum(a, 4, 0), outMat(a[5]), optNum(a, 6, -1))); }, 'void');
    srcDst('ConvertScaleAbs', 'void', (s, d, a) => cv.convertScaleAbs(s, d, optNum(a, 2, 1), optNum(a, 3, 0)));
    srcDst('Normalize', 'void', (s, d, a) => cv.normalize(s, d, optNum(a, 2, 1), optNum(a, 3, 0), optEnum(a, 4, 4), optNum(a, 5, -1), optMat(a, 6)));
    srcDst('Exp', 'void', (s, d) => cv.exp(s, d)); srcDst('Log', 'void', (s, d) => cv.log(s, d)); srcDst('Sqrt', 'void', (s, d) => cv.sqrt(s, d));
    def('Pow', (a) => guard(() => cv.pow(asMat(a[0]), optNum(a, 1, 2), outMat(a[2]))), 'void');
    def('Magnitude', (a) => guard(() => cv.magnitude(asMat(a[0]), asMat(a[1]), outMat(a[2]))), 'void');
    def('CartToPolar', (a) => guard(() => cv.cartToPolar(asMat(a[0]), asMat(a[1]), outMat(a[2]), outMat(a[3]), a.length > 4 ? !!a[4] : false)), 'void');
    def('PolarToCart', (a) => guard(() => cv.polarToCart(asMat(a[0]), asMat(a[1]), outMat(a[2]), outMat(a[3]), a.length > 4 ? !!a[4] : false)), 'void');
    def('Phase', (a) => { const x = asMat(a[0]), y = asMat(a[1]), d = outMat(a[2]); const mag = new cv.Mat(); try { guard(() => cv.cartToPolar(x, y, mag, d, a.length > 3 ? !!a[3] : false)); } finally { mag.delete(); } }, 'void');
    srcDst('Transpose', 'void', (s, d) => cv.transpose(s, d));
    def('Invert', (a) => guard(() => cv.invert(asMat(a[0]), outMat(a[1]), optEnum(a, 2, 0))), 'double');
    def('Gemm', (a) => guard(() => cv.gemm(asMat(a[0]), asMat(a[1]), optNum(a, 2, 1), optMat(a, 3), optNum(a, 4, 0), outMat(a[5]), optNum(a, 6, 0))), 'void');
    def('Reduce', (a) => guard(() => cv.reduce(asMat(a[0]), outMat(a[1]), optEnum(a, 2, 0), optEnum(a, 3, 0), optNum(a, 4, -1))), 'void');
    def('Transform', (a) => guard(() => cv.transform(asMat(a[0]), outMat(a[1]), asMat(a[2]))), 'void');
    def('Dft', (a) => guard(() => cv.dft(asMat(a[0]), outMat(a[1]), optEnum(a, 2, 0), optNum(a, 3, 0))), 'void');
    def('Idft', (a) => guard(() => cv.dft(asMat(a[0]), outMat(a[1]), (optEnum(a, 2, 0) | cv.DFT_INVERSE), optNum(a, 3, 0))), 'void');
    def('GetOptimalDFTSize', (a) => guard(() => cv.getOptimalDFTSize(num(a[0]))), 'int');
    def('Flip', (a) => guard(() => cv.flip(asMat(a[0]), outMat(a[1]), enumVal(a[2], 0))), 'void');
    def('Rotate', (a) => guard(() => cv.rotate(asMat(a[0]), outMat(a[1]), enumVal(a[2], 0))), 'void');
    def('Repeat', (a) => guard(() => cv.repeat(asMat(a[0]), num(a[1]), num(a[2]), outMat(a[3]))), 'void');
    def('HConcat', (a) => { const d = outMat(a[a.length - 1]); const v = new cv.MatVector(); (a.length === 2 ? seqOf(a[0]) : a.slice(0, -1)).forEach((m) => v.push_back(asMat(m))); try { guard(() => cv.hconcat(v, d)); } finally { v.delete(); } }, 'void');
    def('VConcat', (a) => { const d = outMat(a[a.length - 1]); const v = new cv.MatVector(); (a.length === 2 ? seqOf(a[0]) : a.slice(0, -1)).forEach((m) => v.push_back(asMat(m))); try { guard(() => cv.vconcat(v, d)); } finally { v.delete(); } }, 'void');
    def('SetIdentity', (a) => { const m = asMat(a[0]); m.setTo(new cv.Scalar(0)); const n = Math.min(m.rows, m.cols), d = DEPTH_ARR(m), ch = m.channels(); for (let k = 0; k < n; k++) d[(k * m.cols + k) * ch] = a.length > 1 ? toScalar(a[1]).Val0 : 1; }, 'void');
    def('Randu', (a) => guard(() => cv.randu(asMat(a[0]), toCvScalar(a[1]), toCvScalar(a[2]))), 'void');
    def('Randn', (a) => guard(() => cv.randn(asMat(a[0]), toCvScalar(a[1]), toCvScalar(a[2]))), 'void');
    def('RandShuffle', (a) => { const m = asMat(a[0]); const d = DEPTH_ARR(m), ch = m.channels(), n = m.rows * m.cols; for (let k = n - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); for (let c = 0; c < ch; c++) { const t = d[k * ch + c]; d[k * ch + c] = d[j * ch + c]; d[j * ch + c] = t; } } }, 'void');
    def('SetRNGSeed', (a) => guard(() => cv.setRNGSeed(num(a[0]))), 'void');
    def('Sort', (a) => guard(() => cv.sort(asMat(a[0]), outMat(a[1]), enumVal(a[2], 0))), 'void'); def('SortIdx', (a) => guard(() => cv.sortIdx(asMat(a[0]), outMat(a[1]), enumVal(a[2], 0))), 'void');
    def('PerspectiveTransform', (a) => { if (a[0] instanceof Mat) return guard(() => cv.perspectiveTransform(a[0].cv, outMat(a[1]), asMat(a[2]))); const src = pointsToMat(a[0], true); const d = new cv.Mat(); try { guard(() => cv.perspectiveTransform(src, d, asMat(a[1]))); return ptsArr(matToPoints(d, seqOf(a[0])[0] instanceof Point2d ? 'Point2d' : 'Point2f'), seqOf(a[0])[0] instanceof Point2d ? 'Point2d' : 'Point2f'); } finally { src.delete(); d.delete(); } }, (ta, at) => (at[0] === 'Mat' ? 'void' : at[0]));

    // ---------------------------------------------------------------- 통계
    def('Mean', (a) => { const s = guard(() => (a.length > 1 && a[1] ? cv.mean(asMat(a[0]), asMat(a[1])) : cv.mean(asMat(a[0])))); return new Scalar(s[0], s[1], s[2], s[3]); }, 'Scalar');
    def('Sum', (a) => sumScalar(asMat(a[0])), 'Scalar');
    def('CountNonZero', (a) => guard(() => cv.countNonZero(asMat(a[0]))), 'int');
    def('FindNonZero', (a) => { const s = asMat(a[0]); if (a[1] instanceof Mat) return guard(() => cv.findNonZero(s, a[1].cv)); const d = new cv.Mat(); try { guard(() => cv.findNonZero(s, d)); return ptsArr(matToPoints(d, 'Point'), 'Point'); } finally { d.delete(); } }, 'Point[]');
    def('MeanStdDev', (a) => { const m = new cv.Mat(), sd = new cv.Mat(); try { guard(() => (a.length > 3 && a[3] ? cv.meanStdDev(asMat(a[0]), m, sd, asMat(a[3])) : cv.meanStdDev(asMat(a[0]), m, sd))); const ms = new Scalar(...Array.from({ length: 4 }, (_, k) => (k < m.rows ? m.data64F[k] : 0))); const ss = new Scalar(...Array.from({ length: 4 }, (_, k) => (k < sd.rows ? sd.data64F[k] : 0))); if (a[1] instanceof Ref) { a[1].set(ms); a[2].set(ss); } else { m.copyTo(outMat(a[1])); sd.copyTo(outMat(a[2])); } } finally { m.delete(); sd.delete(); } }, 'void');
    def('MinMaxLoc', (a) => {
      const s = asMat(a[0]);
      const r = guard(() => (a.length > 5 && a[5] instanceof Mat ? cv.minMaxLoc(s, a[5].cv) : cv.minMaxLoc(s)));
      const refs = a.filter((x) => x instanceof Ref);
      const isPointRef = (ref) => ref.t && /^Point/.test(ref.t);
      if (refs.length === 2) { if (isPointRef(refs[0]) || isPointRef(refs[1])) { refs[0].set(new Point(r.minLoc.x, r.minLoc.y)); refs[1].set(new Point(r.maxLoc.x, r.maxLoc.y)); } else { refs[0].set(r.minVal); refs[1].set(r.maxVal); } }
      else if (refs.length >= 4) { refs[0].set(r.minVal); refs[1].set(r.maxVal); refs[2].set(new Point(r.minLoc.x, r.minLoc.y)); refs[3].set(new Point(r.maxLoc.x, r.maxLoc.y)); }
      else if (refs.length === 1) refs[0].set(r.maxVal);
    }, 'void');
    def('MinMaxIdx', (a) => { const r = guard(() => cv.minMaxLoc(asMat(a[0]))); const refs = a.filter((x) => x instanceof Ref); if (refs[0]) refs[0].set(r.minVal); if (refs[1]) refs[1].set(r.maxVal); if (refs[2]) refs[2].set(arr([r.minLoc.y, r.minLoc.x], 'int')); if (refs[3]) refs[3].set(arr([r.maxLoc.y, r.maxLoc.x], 'int')); }, 'void');
    def('Norm', (a) => guard(() => (a.length > 1 && a[1] instanceof Mat ? cv.norm(asMat(a[0]), a[1].cv, optEnum(a, 2, 4)) : cv.norm(asMat(a[0]), optEnum(a, 1, 4)))), 'double');
    def('PSNR', (a) => { const s1 = asMat(a[0]), s2 = asMat(a[1]); const d = new cv.Mat(); try { cv.absdiff(s1, s2, d); d.convertTo(d, cv.CV_32F); cv.multiply(d, d, d); const mse = cv.mean(d)[0]; return mse < 1e-10 ? Infinity : 10 * Math.log10(255 * 255 / mse); } finally { d.delete(); } }, 'double');
    def('CalcHist', (a) => {
      const imgs = seqOf(a[0]) || [a[0]]; const v = new cv.MatVector(); imgs.forEach((m) => v.push_back(asMat(m)));
      const channels = seqOf(a[1]) ? seqOf(a[1]).map(num) : [num(a[1])];
      const mask = a[2] instanceof Mat ? a[2].cv : new cv.Mat();
      const hist = outMat(a[3]);
      const histSize = seqOf(a[5]) ? seqOf(a[5]).map(num) : [num(a[5])];
      let ranges = a[6];
      let rangeArr = [];
      if (Array.isArray(ranges) && ranges.length && ranges[0] instanceof Rangef) ranges.forEach((r) => rangeArr.push(r.Start, r.End));
      else if (Array.isArray(ranges) && Array.isArray(ranges[0])) ranges.forEach((r) => rangeArr.push(num(r[0]), num(r[1])));
      else if (Array.isArray(ranges)) rangeArr = ranges.map(num);
      else rangeArr = [0, 256];
      try { guard(() => cv.calcHist(v, channels, mask, hist, histSize, rangeArr, a.length > 8 ? !!a[8] : false)); } finally { v.delete(); if (!(a[2] instanceof Mat)) mask.delete(); }
    }, 'void');
    def('CalcBackProject', (a) => { const imgs = seqOf(a[0]) || [a[0]]; const v = new cv.MatVector(); imgs.forEach((m) => v.push_back(asMat(m))); const channels = seqOf(a[1]).map(num); const ranges = seqOf(a[4]); const rangeArr = []; ranges.forEach((r) => (r instanceof Rangef ? rangeArr.push(r.Start, r.End) : rangeArr.push(...seqOf(r).map(num)))); try { guard(() => cv.calcBackProject(v, channels, asMat(a[2]), outMat(a[3]), rangeArr, optNum(a, 5, 1))); } finally { v.delete(); } }, 'void');
    def('CompareHist', (a) => guard(() => cv.compareHist(asMat(a[0]), asMat(a[1]), enumVal(a[2], 0))), 'double');
    srcDst('EqualizeHist', 'void', (s, d) => cv.equalizeHist(s, d));
    def('CreateCLAHE', (a) => makeClahe(optNum(a, 0, 40), a.length > 1 ? toSize(a[1]) : new cv.Size(8, 8)), 'CLAHE');
    def('Integral', (a) => guard(() => cv.integral(asMat(a[0]), outMat(a[1]), optNum(a, 2, -1))), 'void');
    def('Kmeans', (a) => { const centers = a.length > 6 && a[6] instanceof Mat ? a[6].cv : new cv.Mat(); const tc = a[3]; const crit = new cv.TermCriteria(tc ? tc.Type : 3, tc ? tc.MaxCount : 10, tc ? tc.Epsilon : 1.0); try { return guard(() => cv.kmeans(asMat(a[0]), num(a[1]), outMat(a[2]), crit, optNum(a, 4, 3), optEnum(a, 5, 2), centers)); } finally { if (!(a[6] instanceof Mat)) centers.delete(); } }, 'double');
    def('PCACompute', (a) => guard(() => cv.PCACompute(asMat(a[0]), outMat(a[1]), outMat(a[2]), optNum(a, 3, 0))), 'void');

    // ---------------------------------------------------------------- 이진화 · 필터 · 모폴로지
    srcDst('Threshold', 'double', (s, d, a) => cv.threshold(s, d, num(a[2]), num(a[3]), enumVal(a[4], 0)));
    srcDst('AdaptiveThreshold', 'void', (s, d, a) => cv.adaptiveThreshold(s, d, num(a[2]), enumVal(a[3], 0), enumVal(a[4], 0), num(a[5]), num(a[6])));
    srcDst('Blur', 'void', (s, d, a) => cv.blur(s, d, toSize(a[2]), optPoint(a, 3), optEnum(a, 4, 4)));
    srcDst('BoxFilter', 'void', (s, d, a) => cv.boxFilter(s, d, matTypeOf(a[2]), toSize(a[3]), optPoint(a, 4), a.length > 5 ? !!a[5] : true, optEnum(a, 6, 4)));
    srcDst('GaussianBlur', 'void', (s, d, a) => cv.GaussianBlur(s, d, toSize(a[2]), optNum(a, 3, 0), optNum(a, 4, 0), optEnum(a, 5, 4)));
    srcDst('MedianBlur', 'void', (s, d, a) => cv.medianBlur(s, d, num(a[2])));
    srcDst('BilateralFilter', 'void', (s, d, a) => cv.bilateralFilter(s, d, num(a[2]), num(a[3]), num(a[4]), optEnum(a, 5, 4)));
    srcDst('Filter2D', 'void', (s, d, a) => cv.filter2D(s, d, matTypeOf(a[2]), asMat(a[3], 'kernel'), optPoint(a, 4), optNum(a, 5, 0), optEnum(a, 6, 4)));
    srcDst('SepFilter2D', 'void', (s, d, a) => cv.sepFilter2D(s, d, matTypeOf(a[2]), asMat(a[3]), asMat(a[4]), optPoint(a, 5), optNum(a, 6, 0), optEnum(a, 7, 4)));
    srcDst('Sobel', 'void', (s, d, a) => cv.Sobel(s, d, matTypeOf(a[2]), num(a[3]), num(a[4]), optNum(a, 5, 3), optNum(a, 6, 1), optNum(a, 7, 0), optEnum(a, 8, 4)));
    srcDst('Scharr', 'void', (s, d, a) => cv.Scharr(s, d, matTypeOf(a[2]), num(a[3]), num(a[4]), optNum(a, 5, 1), optNum(a, 6, 0), optEnum(a, 7, 4)));
    srcDst('Laplacian', 'void', (s, d, a) => cv.Laplacian(s, d, matTypeOf(a[2]), optNum(a, 3, 1), optNum(a, 4, 1), optNum(a, 5, 0), optEnum(a, 6, 4)));
    def('Canny', (a) => { if (a.length > 2 && a[1] instanceof Mat && a[2] instanceof Mat) return guard(() => cv.Canny(asMat(a[0]), asMat(a[1]), outMat(a[2]), num(a[3]), num(a[4]), a.length > 5 ? !!a[5] : false)); guard(() => cv.Canny(asMat(a[0]), outMat(a[1]), num(a[2]), num(a[3]), optNum(a, 4, 3), a.length > 5 ? !!a[5] : false)); }, 'void');
    srcDst('Erode', 'void', (s, d, a) => cv.erode(s, d, optMat(a, 2), optPoint(a, 3), optNum(a, 4, 1), optEnum(a, 5, 0), optScalar(a, 6, [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE])));
    srcDst('Dilate', 'void', (s, d, a) => cv.dilate(s, d, optMat(a, 2), optPoint(a, 3), optNum(a, 4, 1), optEnum(a, 5, 0), optScalar(a, 6, [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE])));
    srcDst('MorphologyEx', 'void', (s, d, a) => cv.morphologyEx(s, d, enumVal(a[2], 2), optMat(a, 3), optPoint(a, 4), optNum(a, 5, 1), optEnum(a, 6, 0), optScalar(a, 7, [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE])));
    def('GetStructuringElement', (a) => ctx.wrap(guard(() => cv.getStructuringElement(enumVal(a[0], 0), toSize(a[1]), optPoint(a, 2)))), 'Mat');
    def('GetGaussianKernel', (a) => ctx.wrap(guard(() => cv.getGaussianKernel(num(a[0]), num(a[1]), optNum(a, 2, 6)))), 'Mat');
    srcDst('PyrDown', 'void', (s, d, a) => cv.pyrDown(s, d, a.length > 2 && a[2] ? toSize(a[2]) : new cv.Size(0, 0), optEnum(a, 3, 4)));
    srcDst('PyrUp', 'void', (s, d, a) => cv.pyrUp(s, d, a.length > 2 && a[2] ? toSize(a[2]) : new cv.Size(0, 0), optEnum(a, 3, 4)));
    srcDst('CopyMakeBorder', 'void', (s, d, a) => cv.copyMakeBorder(s, d, num(a[2]), num(a[3]), num(a[4]), num(a[5]), enumVal(a[6], 0), optScalar(a, 7)));
    srcDst('DistanceTransform', 'void', (s, d, a) => cv.distanceTransform(s, d, enumVal(a[2], 2), enumVal(a[3], 3), optNum(a, 4, 5)));
    def('Watershed', (a) => guard(() => cv.watershed(asMat(a[0]), asMat(a[1]))), 'void');
    def('GrabCut', (a) => guard(() => cv.grabCut(asMat(a[0]), asMat(a[1]), toRect(a[2]), asMat(a[3]), asMat(a[4]), num(a[5]), enumVal(a[6], 0))), 'void');
    def('FloodFill', (a) => { const img = asMat(a[0]); let k = 1; let mask = null; if (a[1] instanceof Mat && a[2] instanceof Point) { mask = a[1].cv; k = 2; } const seed = toPoint(a[k]); const color = toCvScalar(a[k + 1]); const rectRef = a[k + 2] instanceof Ref ? a[k + 2] : null; const lo = a.length > k + 3 && a[k + 3] != null ? toCvScalar(a[k + 3]) : new cv.Scalar(0, 0, 0, 0); const hi = a.length > k + 4 && a[k + 4] != null ? toCvScalar(a[k + 4]) : new cv.Scalar(0, 0, 0, 0); const flags = optEnum(a, k + 5, 4); const m = mask || new cv.Mat(); const rect = new cv.Rect(); try { const n = guard(() => cv.floodFill(img, m, seed, color, rect, lo, hi, flags)); if (rectRef) rectRef.set(fromRect(rect)); return n; } finally { if (!mask) m.delete(); } }, 'int');
    srcDst('Inpaint', 'void', (s, d, a) => { throw new CsException('NotSupportedException', 'Inpaint 는 OpenCV.js 에 포함되어 있지 않습니다 (로컬 PC 에서 실행)'); });
    def('FastNlMeansDenoising', () => { throw new CsException('NotSupportedException', 'FastNlMeansDenoising 은 OpenCV.js 에 포함되어 있지 않습니다. GaussianBlur/MedianBlur/BilateralFilter 를 쓰세요 (로컬 PC 에서는 동작).'); });
    def('FastNlMeansDenoisingColored', () => { throw new CsException('NotSupportedException', 'FastNlMeansDenoisingColored 은 OpenCV.js 에 포함되어 있지 않습니다 (로컬 PC 에서 실행).'); });
    def('MatchTemplate', (a) => guard(() => cv.matchTemplate(asMat(a[0]), asMat(a[1]), outMat(a[2]), enumVal(a[3], 5), optMat(a, 4))), 'void');
    def('CornerHarris', (a) => guard(() => cv.cornerHarris(asMat(a[0]), outMat(a[1]), num(a[2]), num(a[3]), num(a[4]), optEnum(a, 5, 4))), 'void');
    def('CornerSubPix', (a) => { const pts = pointsToMat(a[1], true); const tc = a[4]; try { guard(() => cv.cornerSubPix(asMat(a[0]), pts, toSize(a[2]), toSize(a[3]), new cv.TermCriteria(tc ? tc.Type : 3, tc ? tc.MaxCount : 30, tc ? tc.Epsilon : 0.01))); return ptsArr(matToPoints(pts), 'Point2f'); } finally { pts.delete(); } }, 'Point2f[]');
    def('GoodFeaturesToTrack', (a) => { const d = new cv.Mat(); try { guard(() => cv.goodFeaturesToTrack(asMat(a[0]), d, num(a[1]), num(a[2]), num(a[3]), optMat(a, 4), optNum(a, 5, 3), a.length > 6 ? !!a[6] : false, optNum(a, 7, 0.04))); return ptsArr(matToPoints(d), 'Point2f'); } finally { d.delete(); } }, 'Point2f[]');
    def('WarpPolar', (a) => guard(() => cv.warpPolar(asMat(a[0]), outMat(a[1]), toSize(a[2]), toPoint2f(a[3]), num(a[4]), enumVal(a[5], 1))), 'void');
    def('LinearPolar', (a) => guard(() => cv.warpPolar(asMat(a[0]), outMat(a[1]), new cv.Size(0, 0), toPoint2f(a[2]), num(a[3]), enumVal(a[4], 1))), 'void');
    const toPoint2f = (v) => new cv.Point(v.X, v.Y);

    // ---------------------------------------------------------------- 기하 변환
    srcDst('Resize', 'void', (s, d, a) => { const sz = a.length > 2 && a[2] ? toSize(a[2]) : new cv.Size(0, 0); const fx = optNum(a, 3, 0), fy = optNum(a, 4, 0); if (sz.width === 0 && sz.height === 0 && !fx && !fy) throw new CsException('OpenCVException', 'Resize: 크기(dsize) 또는 배율(fx, fy) 중 하나는 지정해야 합니다'); cv.resize(s, d, sz, fx, fy, optEnum(a, 5, 1)); });
    srcDst('WarpAffine', 'void', (s, d, a) => cv.warpAffine(s, d, asMat(a[2], 'M'), a.length > 3 && a[3] ? toSize(a[3]) : new cv.Size(s.cols, s.rows), optEnum(a, 4, 1), optEnum(a, 5, 0), optScalar(a, 6)));
    srcDst('WarpPerspective', 'void', (s, d, a) => cv.warpPerspective(s, d, asMat(a[2], 'M'), a.length > 3 && a[3] ? toSize(a[3]) : new cv.Size(s.cols, s.rows), optEnum(a, 4, 1), optEnum(a, 5, 0), optScalar(a, 6)));
    srcDst('Remap', 'void', (s, d, a) => cv.remap(s, d, asMat(a[2]), asMat(a[3]), optEnum(a, 4, 1), optEnum(a, 5, 0), optScalar(a, 6)));
    def('GetRotationMatrix2D', (a) => ctx.wrap(guard(() => cv.getRotationMatrix2D(toPoint2f(a[0]), num(a[1]), num(a[2])))), 'Mat');
    def('GetAffineTransform', (a) => { const s = a[0] instanceof Mat ? a[0].cv : pointsToMat(a[0], true), d = a[1] instanceof Mat ? a[1].cv : pointsToMat(a[1], true); try { return ctx.wrap(guard(() => cv.getAffineTransform(s, d))); } finally { if (!(a[0] instanceof Mat)) s.delete(); if (!(a[1] instanceof Mat)) d.delete(); } }, 'Mat');
    def('GetPerspectiveTransform', (a) => { const s = a[0] instanceof Mat ? a[0].cv : pointsToMat(a[0], true), d = a[1] instanceof Mat ? a[1].cv : pointsToMat(a[1], true); try { return ctx.wrap(guard(() => cv.getPerspectiveTransform(s, d))); } finally { if (!(a[0] instanceof Mat)) s.delete(); if (!(a[1] instanceof Mat)) d.delete(); } }, 'Mat');
    def('InvertAffineTransform', (a) => guard(() => cv.invertAffineTransform(asMat(a[0]), outMat(a[1]))), 'void');
    def('FindHomography', (a) => { const s = a[0] instanceof Mat ? a[0].cv : pointsToMat(a[0], true), d = a[1] instanceof Mat ? a[1].cv : pointsToMat(a[1], true); const mask = a.length > 4 && a[4] instanceof Mat ? a[4].cv : new cv.Mat(); try { return ctx.wrap(guard(() => cv.findHomography(s, d, optEnum(a, 2, 0), optNum(a, 3, 3), mask))); } finally { if (!(a[0] instanceof Mat)) s.delete(); if (!(a[1] instanceof Mat)) d.delete(); if (!(a[4] instanceof Mat)) mask.delete(); } }, 'Mat');
    def('EstimateAffine2D', (a) => { const s = a[0] instanceof Mat ? a[0].cv : pointsToMat(a[0], true), d = a[1] instanceof Mat ? a[1].cv : pointsToMat(a[1], true); try { return ctx.wrap(guard(() => cv.estimateAffine2D(s, d))); } finally { if (!(a[0] instanceof Mat)) s.delete(); if (!(a[1] instanceof Mat)) d.delete(); } }, 'Mat');
    def('EstimateAffinePartial2D', (a) => { const s = a[0] instanceof Mat ? a[0].cv : pointsToMat(a[0], true), d = a[1] instanceof Mat ? a[1].cv : pointsToMat(a[1], true); try { return ctx.wrap(guard(() => cv.estimateAffinePartial2D(s, d))); } finally { if (!(a[0] instanceof Mat)) s.delete(); if (!(a[1] instanceof Mat)) d.delete(); } }, 'Mat');
    def('Undistort', (a) => guard(() => cv.undistort(asMat(a[0]), outMat(a[1]), asMat(a[2]), asMat(a[3]))), 'void');

    // ---------------------------------------------------------------- 윤곽선 · 도형 분석
    function findContours(img, mode, methodV, offset) {
      const contours = new cv.MatVector(), hier = new cv.Mat();
      try {
        guard(() => cv.findContours(img, contours, hier, mode, methodV, offset || new cv.Point(0, 0)));
        const list = [];
        for (let k = 0; k < contours.size(); k++) { const c = contours.get(k); list.push(matToPoints(c, 'Point')); c.delete(); }
        list.__elem = 'Point[]';
        const h = []; const hd = hier.data32S; for (let k = 0; k < hier.cols; k++) h.push(new HierarchyIndex([hd[4 * k], hd[4 * k + 1], hd[4 * k + 2], hd[4 * k + 3]])); h.__elem = 'HierarchyIndex';
        return { list, h };
      } finally { contours.delete(); hier.delete(); }
    }
    ctx.findContours = findContours;
    def('FindContours', (a) => {
      const img = asMat(a[0]);
      if (img.channels() !== 1) throw new CsException('OpenCVException', 'FindContours 에는 1채널 이진 이미지(CV_8UC1)가 필요합니다. 먼저 CvtColor + Threshold 로 이진화하세요.');
      const refs = a.filter((x) => x instanceof Ref);
      const rest = a.filter((x) => !(x instanceof Ref) && x !== a[0]);
      const mode = enumVal(rest[0], 0), methodV = enumVal(rest[1], 2), offset = rest[2] ? toPoint(rest[2]) : null;
      const { list, h } = findContours(img, mode, methodV, offset);
      if (refs.length >= 1) { const t0 = refs[0].t || ''; refs[0].set(/Mat/.test(t0) ? arr(list.map((c) => ctx.wrap(pointsToMat(c, false))), 'Mat') : list); }
      if (refs.length >= 2) refs[1].set(h);
      if (a[2] instanceof Mat && !(a[2] instanceof Ref)) { const hd = a[2].cv; hd.create(1, h.length, cv.CV_32SC4); h.forEach((x, k) => { hd.data32S[4 * k] = x.Next; hd.data32S[4 * k + 1] = x.Previous; hd.data32S[4 * k + 2] = x.Child; hd.data32S[4 * k + 3] = x.Parent; }); }
      if (!refs.length) return list;
    }, 'void');
    def('FindContoursAsArray', (a) => findContours(asMat(a[0]), enumVal(a[1], 0), enumVal(a[2], 2), a[3] ? toPoint(a[3]) : null).list, 'Point[][]');
    def('FindContoursAsMat', (a) => arr(findContours(asMat(a[0]), enumVal(a[1], 0), enumVal(a[2], 2), a[3] ? toPoint(a[3]) : null).list.map((c) => ctx.wrap(pointsToMat(c, false))), 'Mat'), 'Mat[]');
    def('DrawContours', (a) => {
      const img = asMat(a[0]);
      const { vec, free } = contoursToVector(a[1]);
      const hierArg = a.length > 6 && a[6] != null ? a[6] : null;
      let hier = new cv.Mat();
      if (hierArg instanceof Mat) hier = hierArg.cv; else if (Array.isArray(hierArg) && hierArg.length) { hier = new cv.Mat(1, hierArg.length, cv.CV_32SC4); hierArg.forEach((x, k) => { hier.data32S[4 * k] = x.Next; hier.data32S[4 * k + 1] = x.Previous; hier.data32S[4 * k + 2] = x.Child; hier.data32S[4 * k + 3] = x.Parent; }); }
      try { guard(() => cv.drawContours(img, vec, num(a[2]), toCvScalar(a[3]), optNum(a, 4, 1), optEnum(a, 5, 8), hier, optNum(a, 7, 2147483647), optPoint(a, 8).x === -1 ? new cv.Point(0, 0) : optPoint(a, 8))); }
      finally { free(); if (!(hierArg instanceof Mat)) hier.delete(); }
    }, 'void');
    def('ContourArea', (a) => withContour(a[0], (m) => guard(() => cv.contourArea(m, a.length > 1 ? !!a[1] : false))), 'double');
    def('ArcLength', (a) => withContour(a[0], (m) => guard(() => cv.arcLength(m, !!a[1]))), 'double');
    def('BoundingRect', (a) => withContour(a[0], (m) => fromRect(guard(() => cv.boundingRect(m)))), 'Rect');
    def('MinAreaRect', (a) => withContour(a[0], (m) => { const r = guard(() => cv.minAreaRect(m)); return new RotatedRect(new Point2f(r.center.x, r.center.y), new Size2f(r.size.width, r.size.height), r.angle); }), 'RotatedRect');
    def('MinEnclosingCircle', (a) => withContour(a[0], (m) => { const r = guard(() => cv.minEnclosingCircle(m)); if (a[1] instanceof Ref) { a[1].set(new Point2f(r.center.x, r.center.y)); a[2].set(Math.fround(r.radius)); } return new CircleSegment(new Point2f(r.center.x, r.center.y), r.radius); }), 'void');
    def('ApproxPolyDP', (a) => withContour(a[0], (m) => { const d = new cv.Mat(); try { guard(() => cv.approxPolyDP(m, d, num(a[1]), !!a[2])); return ptsArr(matToPoints(d, m.type() === cv.CV_32SC2 ? 'Point' : 'Point2f'), m.type() === cv.CV_32SC2 ? 'Point' : 'Point2f'); } finally { d.delete(); } }), (ta, at) => at[0] || 'Point[]');
    def('ConvexHull', (a) => withContour(a[0], (m) => { const d = new cv.Mat(); try { guard(() => cv.convexHull(m, d, a.length > 1 ? !!a[1] : false, true)); return ptsArr(matToPoints(d, m.type() === cv.CV_32SC2 ? 'Point' : 'Point2f'), m.type() === cv.CV_32SC2 ? 'Point' : 'Point2f'); } finally { d.delete(); } }), (ta, at) => at[0] || 'Point[]');
    def('ConvexHullIndices', (a) => withContour(a[0], (m) => { const d = new cv.Mat(); try { guard(() => cv.convexHull(m, d, a.length > 1 ? !!a[1] : false, false)); return arr(Array.from(d.data32S), 'int'); } finally { d.delete(); } }), 'int[]');
    def('ConvexityDefects', (a) => withContour(a[0], (m) => { const idx = cv.matFromArray(seqOf(a[1]).length, 1, cv.CV_32SC1, seqOf(a[1]).map(num)); const d = new cv.Mat(); try { guard(() => cv.convexityDefects(m, idx, d)); const out = []; const dd = d.data32S; for (let k = 0; k < d.rows; k++) out.push(makeVec('Vec4i', [dd[4 * k], dd[4 * k + 1], dd[4 * k + 2], dd[4 * k + 3]])); out.__elem = 'Vec4i'; return out; } finally { idx.delete(); d.delete(); } }), 'Vec4i[]');
    def('IsContourConvex', (a) => withContour(a[0], (m) => guard(() => cv.isContourConvex(m))), 'bool');
    def('Moments', (a) => { if (a[0] instanceof Mat && a[0].cv.channels() === 1 && a[0].cv.type() !== cv.CV_32SC2 && a[0].cv.type() !== cv.CV_32FC2) return new Moments(guard(() => cv.moments(a[0].cv, a.length > 1 ? !!a[1] : false))); return withContour(a[0], (m) => new Moments(guard(() => cv.moments(m, false)))); }, 'Moments');
    def('HuMoments', (a) => { const m = a[0]; const src = { m00: m.M00, m10: m.M10, m01: m.M01, m20: m.M20, m11: m.M11, m02: m.M02, m30: m.M30, m21: m.M21, m12: m.M12, m03: m.M03, mu20: m.Mu20, mu11: m.Mu11, mu02: m.Mu02, mu30: m.Mu30, mu21: m.Mu21, mu12: m.Mu12, mu03: m.Mu03, nu20: m.Nu20, nu11: m.Nu11, nu02: m.Nu02, nu30: m.Nu30, nu21: m.Nu21, nu12: m.Nu12, nu03: m.Nu03 }; const d = new cv.Mat(); try { guard(() => cv.HuMoments(src, d)); const out = arr(Array.from(d.data64F), 'double'); if (a[1] instanceof Ref) { a[1].set(out); return; } return out; } finally { d.delete(); } }, 'double[]');
    def('MatchShapes', (a) => { const { m: m1, tmp: t1 } = ctx.contourMat(a[0]); const { m: m2, tmp: t2 } = ctx.contourMat(a[1]); try { return guard(() => cv.matchShapes(m1, m2, enumVal(a[2], 1), optNum(a, 3, 0))); } finally { if (t1) m1.delete(); if (t2) m2.delete(); } }, 'double');
    def('PointPolygonTest', (a) => withContour(a[0], (m) => guard(() => cv.pointPolygonTest(m, toPoint2f(a[1]), !!a[2]))), 'double');
    def('FitEllipse', (a) => withContour(a[0], (m) => { if (m.rows < 5) throw new CsException('OpenCVException', 'FitEllipse 에는 점이 5개 이상 필요합니다'); const r = guard(() => cv.fitEllipse(m)); return new RotatedRect(new Point2f(r.center.x, r.center.y), new Size2f(r.size.width, r.size.height), r.angle); }), 'RotatedRect');
    def('FitLine', (a) => withContour(a[0], (m) => { const d = new cv.Mat(); try { guard(() => cv.fitLine(m, d, enumVal(a[1], 2), optNum(a, 2, 0), optNum(a, 3, 0.01), optNum(a, 4, 0.01))); const f = d.data32F; return new Line2D(f[0], f[1], f[2], f[3]); } finally { d.delete(); } }), 'Line2D');
    def('BoxPoints', (a) => ptsArr(rotatedPoints(a[0]), 'Point2f'), 'Point2f[]');
    def('ConnectedComponents', (a) => {
      const img = asMat(a[0]); const labels = outMat(a[1]);
      return guard(() => cv.connectedComponents(img, labels, optEnum(a, 2, 8), optEnum(a, 3, 4)));
    }, 'int');
    def('ConnectedComponentsWithStats', (a) => guard(() => cv.connectedComponentsWithStats(asMat(a[0]), outMat(a[1]), outMat(a[2]), outMat(a[3]), optEnum(a, 4, 8), optEnum(a, 5, 4))), 'int');
    def('ConnectedComponentsEx', (a) => {
      const img = asMat(a[0]); const labels = new cv.Mat(), stats = new cv.Mat(), cents = new cv.Mat();
      try {
        const n = guard(() => cv.connectedComponentsWithStats(img, labels, stats, cents, optEnum(a, 1, 8), cv.CV_32S));
        const L = Array.from(labels.data32S); L.__dims = [labels.rows, labels.cols]; L.__elem = 'int';
        const blobs = new CsList('Blob');
        for (let k = 0; k < n; k++) { const s = stats.data32S, c = cents.data64F; const left = s[5 * k], top = s[5 * k + 1], w = s[5 * k + 2], h = s[5 * k + 3]; blobs.items.push(new Blob({ Label: k, Left: left, Top: top, Width: w, Height: h, Area: s[5 * k + 4], Rect: new Rect(left, top, w, h), Centroid: new Point2d(c[2 * k], c[2 * k + 1]) })); }
        return new ConnectedComponents(L, blobs, n);
      } finally { labels.delete(); stats.delete(); cents.delete(); }
    }, 'ConnectedComponents');

    // ---------------------------------------------------------------- 허프 변환
    def('HoughLines', (a) => { const d = new cv.Mat(); try { guard(() => cv.HoughLines(asMat(a[0]), d, num(a[1]), num(a[2]), num(a[3]), optNum(a, 4, 0), optNum(a, 5, 0), optNum(a, 6, 0), optNum(a, 7, Math.PI))); const out = []; const f = d.data32F; for (let k = 0; k < d.rows; k++) out.push(new LineSegmentPolar(f[2 * k], f[2 * k + 1])); out.__elem = 'LineSegmentPolar'; return out; } finally { d.delete(); } }, 'LineSegmentPolar[]');
    def('HoughLinesP', (a) => { const d = new cv.Mat(); try { guard(() => cv.HoughLinesP(asMat(a[0]), d, num(a[1]), num(a[2]), num(a[3]), optNum(a, 4, 0), optNum(a, 5, 0))); const out = []; const f = d.data32S; for (let k = 0; k < d.rows; k++) out.push(new LineSegmentPoint(new Point(f[4 * k], f[4 * k + 1]), new Point(f[4 * k + 2], f[4 * k + 3]))); out.__elem = 'LineSegmentPoint'; return out; } finally { d.delete(); } }, 'LineSegmentPoint[]');
    def('HoughCircles', (a) => { const d = new cv.Mat(); try { guard(() => cv.HoughCircles(asMat(a[0]), d, enumVal(a[1], 3), num(a[2]), num(a[3]), optNum(a, 4, 100), optNum(a, 5, 100), optNum(a, 6, 0), optNum(a, 7, 0))); const out = []; const f = d.data32F; for (let k = 0; k < d.cols * d.rows; k++) out.push(new CircleSegment(new Point2f(f[3 * k], f[3 * k + 1]), f[3 * k + 2])); out.__elem = 'CircleSegment'; return out; } finally { d.delete(); } }, 'CircleSegment[]');

    // ---------------------------------------------------------------- 그리기
    const lineType = (a, k) => optEnum(a, k, 8);
    def('Line', (a) => { const img = asMat(a[0]); if (typeof a[1] === 'number' || a[1] instanceof CsChar) guard(() => cv.line(img, new cv.Point(num(a[1]), num(a[2])), new cv.Point(num(a[3]), num(a[4])), toCvScalar(a[5]), optNum(a, 6, 1), lineType(a, 7), optNum(a, 8, 0))); else guard(() => cv.line(img, toPoint(a[1]), toPoint(a[2]), toCvScalar(a[3]), optNum(a, 4, 1), lineType(a, 5), optNum(a, 6, 0))); }, 'void');
    def('ArrowedLine', (a) => guard(() => cv.arrowedLine(asMat(a[0]), toPoint(a[1]), toPoint(a[2]), toCvScalar(a[3]), optNum(a, 4, 1), lineType(a, 5), optNum(a, 6, 0), optNum(a, 7, 0.1))), 'void');
    def('Rectangle', (a) => { const img = asMat(a[0]); if (a[1] instanceof Rect) { const r = a[1]; guard(() => cv.rectangle(img, new cv.Point(r.X, r.Y), new cv.Point(r.X + r.Width - 1, r.Y + r.Height - 1), toCvScalar(a[2]), optNum(a, 3, 1), lineType(a, 4), optNum(a, 5, 0))); } else guard(() => cv.rectangle(img, toPoint(a[1]), toPoint(a[2]), toCvScalar(a[3]), optNum(a, 4, 1), lineType(a, 5), optNum(a, 6, 0))); }, 'void');
    def('Circle', (a) => { const img = asMat(a[0]); if (typeof a[1] === 'number') guard(() => cv.circle(img, new cv.Point(num(a[1]), num(a[2])), num(a[3]), toCvScalar(a[4]), optNum(a, 5, 1), lineType(a, 6), optNum(a, 7, 0))); else guard(() => cv.circle(img, toPoint(a[1]), num(a[2]), toCvScalar(a[3]), optNum(a, 4, 1), lineType(a, 5), optNum(a, 6, 0))); }, 'void');
    def('Ellipse', (a) => { const img = asMat(a[0]); if (a[1] instanceof RotatedRect) { const r = a[1]; guard(() => cv.ellipse(img, new cv.Point(Math.round(r.Center.X), Math.round(r.Center.Y)), new cv.Size(Math.round(r.Size.Width / 2), Math.round(r.Size.Height / 2)), r.Angle, 0, 360, toCvScalar(a[2]), optNum(a, 3, 1), lineType(a, 4), 0)); } else guard(() => cv.ellipse(img, toPoint(a[1]), toSize(a[2]), num(a[3]), num(a[4]), num(a[5]), toCvScalar(a[6]), optNum(a, 7, 1), lineType(a, 8), optNum(a, 9, 0))); }, 'void');
    def('PutText', (a) => guard(() => cv.putText(asMat(a[0]), str(a[1]), toPoint(a[2]), enumVal(a[3], 0), num(a[4]), toCvScalar(a[5]), optNum(a, 6, 1), lineType(a, 7), a.length > 8 ? !!a[8] : false)), 'void');
    def('GetTextSize', (a) => { const text = str(a[0]), font = enumVal(a[1], 0), scale = num(a[2]), thick = optNum(a, 3, 1); const size = measureText(text, font, scale, thick); if (a[4] instanceof Ref) a[4].set(size.baseLine); return new Size(size.w, size.h); }, 'Size');
    def('GetFontScaleFromHeight', (a) => { const h = measureText('Hg', enumVal(a[0], 0), 1, optNum(a, 2, 1)).h; return num(a[1]) / h; }, 'double');
    def('Polylines', (a) => { const img = asMat(a[0]); const list = a[1]; const many = isPointSeq(list) ? [list] : seqOf(list); const { vec, free } = contoursToVector(many); try { guard(() => cv.polylines(img, vec, !!a[2], toCvScalar(a[3]), optNum(a, 4, 1), lineType(a, 5), optNum(a, 6, 0))); } finally { free(); } }, 'void');
    def('FillPoly', (a) => { const img = asMat(a[0]); const list = a[1]; const many = isPointSeq(list) ? [list] : seqOf(list); const { vec, free } = contoursToVector(many); try { guard(() => cv.fillPoly(img, vec, toCvScalar(a[2]), lineType(a, 3), optNum(a, 4, 0), optPoint(a, 5).x === -1 ? new cv.Point(0, 0) : optPoint(a, 5))); } finally { free(); } }, 'void');
    def('FillConvexPoly', (a) => { const img = asMat(a[0]); withContour(a[1], (m) => guard(() => cv.fillConvexPoly(img, m, toCvScalar(a[2]), lineType(a, 3), optNum(a, 4, 0)))); }, 'void');
    def('DrawMarker', (a) => guard(() => cv.drawMarker(asMat(a[0]), toPoint(a[1]), toCvScalar(a[2]), optEnum(a, 3, 0), optNum(a, 4, 20), optNum(a, 5, 1), lineType(a, 6))), 'void');
    def('ClipLine', (a) => { const sz = a[0] instanceof Size ? a[0] : new Size(a[0].Width, a[0].Height); const p1 = a[1].get(), p2 = a[2].get(); const r = a[0] instanceof Rect ? a[0] : new Rect(0, 0, sz.Width, sz.Height); const inside = (p) => p.X >= r.X && p.X < r.X + r.Width && p.Y >= r.Y && p.Y < r.Y + r.Height; return inside(p1) || inside(p2); }, 'bool');
    function measureText(text, font, scale, thick) {
      const w0 = Math.max(4, Math.ceil(text.length * 40 * scale + 40)), h0 = Math.ceil(80 * scale + 40);
      const m = new cv.Mat(h0, w0, cv.CV_8UC1, new cv.Scalar(0));
      try {
        cv.putText(m, text, new cv.Point(10, Math.round(h0 * 0.6)), font, scale, new cv.Scalar(255), Math.max(1, thick), 8, false);
        const nz = new cv.Mat(); cv.findNonZero(m, nz);
        if (!nz.rows) { nz.delete(); return { w: 0, h: 0, baseLine: 0 }; }
        const r = cv.boundingRect(nz); nz.delete();
        const baseY = Math.round(h0 * 0.6);
        return { w: r.width + Math.round(2 * scale), h: Math.max(0, baseY - r.y), baseLine: Math.max(0, r.y + r.height - baseY) + Math.max(1, thick) };
      } finally { m.delete(); }
    }

    // ---------------------------------------------------------------- 특징점 · 매칭 · 객체
    const kpFromVec = (v) => { const out = []; for (let k = 0; k < v.size(); k++) { const p = v.get(k); out.push(new KeyPoint(new Point2f(p.pt.x, p.pt.y), p.size, p.angle, p.response, p.octave, p.class_id)); } out.__elem = 'KeyPoint'; return out; };
    const kpToVec = (list) => { const v = new cv.KeyPointVector(); for (const k of seqOf(list) || []) v.push_back({ pt: { x: k.Pt.X, y: k.Pt.Y }, size: k.Size, angle: k.Angle, response: k.Response, octave: k.Octave, class_id: k.ClassId }); return v; };
    const dmFromVec = (v) => { const out = []; for (let k = 0; k < v.size(); k++) { const d = v.get(k); out.push(new DMatch(d.queryIdx, d.trainIdx, d.imgIdx, d.distance)); } out.__elem = 'DMatch'; return out; };
    const dmToVec = (list) => { const v = new cv.DMatchVector(); for (const d of seqOf(list) || []) v.push_back({ queryIdx: d.QueryIdx, trainIdx: d.TrainIdx, imgIdx: d.ImgIdx, distance: d.Distance }); return v; };
    function featureType(name, create, extraStatics) {
      T({
        name, kind: 'class', isInstance: (v) => v && v.__feat === name,
        statics: Object.assign({ Create: sfn((i, a) => ({ __feat: name, __csTypeName: name, det: guard(() => create(a)), csToString: () => name, csDispose() { try { this.det.delete(); } catch (e) { /* 무시 */ } } }), name) }, extraStatics || {}),
        methods: {
          Detect: method((i, o, a) => { const v = new cv.KeyPointVector(); try { guard(() => o.det.detect(asMat(a[0]), v, optMat(a, 1))); return kpFromVec(v); } finally { v.delete(); } }, 'KeyPoint[]'),
          Compute: method((i, o, a) => { const v = kpToVec(a[1] instanceof Ref ? a[1].get() : a[1]); try { guard(() => o.det.compute(asMat(a[0]), v, outMat(a[2]))); const kps = kpFromVec(v); if (a[1] instanceof Ref) a[1].set(kps); } finally { v.delete(); } }, 'void'),
          DetectAndCompute: method((i, o, a) => { const v = new cv.KeyPointVector(); try { guard(() => o.det.detectAndCompute(asMat(a[0]), optMat(a, 1), v, outMat(a[3]), a.length > 4 ? !!a[4] : false)); const kps = kpFromVec(v); if (a[2] instanceof Ref) a[2].set(kps); return kps; } finally { v.delete(); } }, 'void'),
          Dispose: method((i, o) => o.csDispose()), ToString: method((i, o) => name, 'string')
        }
      });
    }
    featureType('ORB', (a) => new cv.ORB(optNum(a, 0, 500), optNum(a, 1, 1.2), optNum(a, 2, 8), optNum(a, 3, 31), optNum(a, 4, 0), optNum(a, 5, 2), optEnum(a, 6, 0), optNum(a, 7, 31), optNum(a, 8, 20)));
    featureType('AKAZE', (a) => new cv.AKAZE());
    featureType('BRISK', (a) => new cv.BRISK());
    featureType('KAZE', (a) => new cv.KAZE());
    featureType('FastFeatureDetector', (a) => new cv.FastFeatureDetector(optNum(a, 0, 10), a.length > 1 ? !!a[1] : true));
    featureType('AgastFeatureDetector', (a) => new cv.AgastFeatureDetector());
    featureType('GFTTDetector', (a) => new cv.GFTTDetector(optNum(a, 0, 1000), optNum(a, 1, 0.01), optNum(a, 2, 1), optNum(a, 3, 3), a.length > 4 ? !!a[4] : false, optNum(a, 5, 0.04)));
    featureType('SimpleBlobDetector', (a) => new cv.SimpleBlobDetector());
    T({ name: 'MSER', kind: 'class', statics: { Create: sfn(() => { throw new CsException('NotSupportedException', 'MSER 은 OpenCV.js 에 없습니다'); }) } });
    T({
      name: 'BFMatcher', kind: 'class', isInstance: (v) => v && v.__bf, aliases: ['DescriptorMatcher'],
      ctor: (i, a) => ({ __bf: true, __csTypeName: 'BFMatcher', m: guard(() => new cv.BFMatcher(optEnum(a, 0, 4), a.length > 1 ? !!a[1] : false)), csToString: () => 'BFMatcher', csDispose() { try { this.m.delete(); } catch (e) { /* 무시 */ } } }),
      statics: { Create: sfn((i, a) => ({ __bf: true, __csTypeName: 'BFMatcher', m: guard(() => new cv.BFMatcher(/Hamming/i.test(str(a[0] || '')) ? 6 : 4, false)), csToString: () => 'BFMatcher', csDispose() { this.m.delete(); } }), 'BFMatcher') },
      methods: {
        Match: method((i, o, a) => { const v = new cv.DMatchVector(); try { guard(() => o.m.match(asMat(a[0]), asMat(a[1]), v, optMat(a, 2))); return dmFromVec(v); } finally { v.delete(); } }, 'DMatch[]'),
        KnnMatch: method((i, o, a) => { const vv = new cv.DMatchVectorVector(); try { guard(() => o.m.knnMatch(asMat(a[0]), asMat(a[1]), vv, num(a[2]), optMat(a, 3), a.length > 4 ? !!a[4] : false)); const out = []; for (let k = 0; k < vv.size(); k++) { const v = vv.get(k); out.push(dmFromVec(v)); v.delete(); } out.__elem = 'DMatch[]'; return out; } finally { vv.delete(); } }, 'DMatch[][]'),
        RadiusMatch: method((i, o, a) => { const vv = new cv.DMatchVectorVector(); try { guard(() => o.m.radiusMatch(asMat(a[0]), asMat(a[1]), vv, num(a[2]), optMat(a, 3), a.length > 4 ? !!a[4] : false)); const out = []; for (let k = 0; k < vv.size(); k++) { const v = vv.get(k); out.push(dmFromVec(v)); v.delete(); } out.__elem = 'DMatch[]'; return out; } finally { vv.delete(); } }, 'DMatch[][]'),
        Dispose: method((i, o) => o.csDispose())
      }
    });
    T({ name: 'FlannBasedMatcher', kind: 'class', ctor: () => { throw new CsException('NotSupportedException', 'FlannBasedMatcher 는 OpenCV.js 에 없습니다. BFMatcher 를 쓰세요.'); } });
    def('DrawKeypoints', (a) => { const v = kpToVec(a[1]); try { guard(() => cv.drawKeypoints(asMat(a[0]), v, outMat(a[2]), a.length > 3 && a[3] ? toCvScalar(a[3]) : new cv.Scalar(-1, -1, -1, -1), optEnum(a, 4, 0))); } finally { v.delete(); } }, 'void');
    def('DrawMatches', (a) => {
      const k1 = kpToVec(a[1]), k2 = kpToVec(a[3]); const mv = dmToVec(a[4]);
      const VecT = cv.CharVector || cv.IntVector;
      const maskVec = new VecT();
      const mask = a.length > 8 && a[8] ? seqOf(a[8]) : null;
      if (mask) mask.forEach((x) => maskVec.push_back(num(x)));
      try {
        if (a.length <= 6) guard(() => cv.drawMatches(asMat(a[0]), k1, asMat(a[2]), k2, mv, outMat(a[5])));
        else guard(() => cv.drawMatches(asMat(a[0]), k1, asMat(a[2]), k2, mv, outMat(a[5]), a.length > 6 && a[6] ? toCvScalar(a[6]) : new cv.Scalar(-1, -1, -1, -1), a.length > 7 && a[7] ? toCvScalar(a[7]) : new cv.Scalar(-1, -1, -1, -1), maskVec, optEnum(a, 9, 0)));
      } finally { k1.delete(); k2.delete(); mv.delete(); maskVec.delete(); }
    }, 'void');
    T({ name: 'KeyPointsFilter', kind: 'static', statics: { RetainBest: sfn((i, a) => { const list = seqOf(a[0]).slice().sort((x, y) => y.Response - x.Response).slice(0, num(a[1])); return arr(list, 'KeyPoint'); }, 'KeyPoint[]') } });
    T({
      name: 'QRCodeDetector', kind: 'class', isInstance: (v) => v && v.__qr, ctor: () => ({ __qr: true, __csTypeName: 'QRCodeDetector', d: guard(() => new cv.QRCodeDetector()), csToString: () => 'QRCodeDetector', csDispose() { try { this.d.delete(); } catch (e) { /* 무시 */ } } }),
      methods: {
        DetectAndDecode: method((i, o, a) => { const pts = new cv.Mat(), straight = a.length > 2 && a[2] instanceof Mat ? a[2].cv : new cv.Mat(); try { const s = guard(() => o.d.detectAndDecode(asMat(a[0]), pts, straight)); if (a[1] instanceof Ref) a[1].set(pts.rows || pts.cols ? ptsArr(matToPoints(pts), 'Point2f') : arr([], 'Point2f')); return s; } finally { pts.delete(); if (!(a[2] instanceof Mat)) straight.delete(); } }, 'string'),
        Detect: method((i, o, a) => { const pts = new cv.Mat(); try { const ok = guard(() => o.d.detect(asMat(a[0]), pts)); if (a[1] instanceof Ref) a[1].set(ok ? ptsArr(matToPoints(pts), 'Point2f') : arr([], 'Point2f')); return ok; } finally { pts.delete(); } }, 'bool'),
        Decode: method((i, o, a) => { const pts = pointsToMat(a[1], true), straight = new cv.Mat(); try { return guard(() => o.d.decode(asMat(a[0]), pts, straight)); } finally { pts.delete(); straight.delete(); } }, 'string'),
        Dispose: method((i, o) => o.csDispose())
      }
    });
    T({ name: 'CascadeClassifier', kind: 'class', ctor: () => { throw new CsException('NotSupportedException', 'CascadeClassifier(haarcascade XML) 는 브라우저 실습 환경에 모델 파일이 없어 지원하지 않습니다. 로컬 PC 에서 실행하세요.'); } });
    T({ name: 'HOGDescriptor', kind: 'class', ctor: () => { throw new CsException('NotSupportedException', 'HOGDescriptor 는 브라우저 실습 환경에서 지원하지 않습니다 (로컬 PC 에서 실행).'); } });
    T({
      name: 'BackgroundSubtractorMOG2', kind: 'class', isInstance: (v) => v && v.__bs, aliases: ['BackgroundSubtractor', 'BackgroundSubtractorKNN'],
      statics: { Create: sfn((i, a) => ({ __bs: true, __csTypeName: 'BackgroundSubtractorMOG2', s: guard(() => new cv.BackgroundSubtractorMOG2(optNum(a, 0, 500), optNum(a, 1, 16), a.length > 2 ? !!a[2] : true)), csToString: () => 'BackgroundSubtractorMOG2', csDispose() { try { this.s.delete(); } catch (e) { /* 무시 */ } } }), 'BackgroundSubtractorMOG2') },
      methods: { Apply: method((i, o, a) => guard(() => o.s.apply(asMat(a[0]), outMat(a[1]), optNum(a, 2, -1))), 'void'), GetBackgroundImage: method((i, o, a) => guard(() => o.s.getBackgroundImage(outMat(a[0]))), 'void'), Dispose: method((i, o) => o.csDispose()) }
    });
    def('CalcOpticalFlowPyrLK', (a) => {
      const prev = asMat(a[0]), next = asMat(a[1]);
      const p0 = pointsToMat(a[2], true), p1 = new cv.Mat(), st = new cv.Mat(), err = new cv.Mat();
      try {
        guard(() => cv.calcOpticalFlowPyrLK(prev, next, p0, p1, st, err, a.length > 6 && a[6] ? toSize(a[6]) : new cv.Size(21, 21), optNum(a, 7, 3)));
        const refs = a.filter((x) => x instanceof Ref);
        const pts = ptsArr(matToPoints(p1), 'Point2f');
        if (refs[0]) refs[0].set(pts); if (refs[1]) refs[1].set(arr(Array.from(st.data), 'byte')); if (refs[2]) refs[2].set(arr(Array.from(err.data32F), 'float'));
      } finally { p0.delete(); p1.delete(); st.delete(); err.delete(); }
    }, 'void');
    def('CalcOpticalFlowFarneback', (a) => guard(() => cv.calcOpticalFlowFarneback(asMat(a[0]), asMat(a[1]), outMat(a[2]), num(a[3]), num(a[4]), num(a[5]), num(a[6]), num(a[7]), num(a[8]), enumVal(a[9], 0))), 'void');
    def('FindChessboardCorners', () => { throw new CsException('NotSupportedException', 'FindChessboardCorners/CalibrateCamera 는 OpenCV.js 에 포함되어 있지 않습니다 (로컬 PC 에서 실행).'); });
    def('CalibrateCamera', () => { throw new CsException('NotSupportedException', 'CalibrateCamera 는 OpenCV.js 에 포함되어 있지 않습니다 (로컬 PC 에서 실행).'); });
    def('SolvePnP', (a) => { throw new CsException('NotSupportedException', 'SolvePnP 는 브라우저 실습 환경에서 지원하지 않습니다 (로컬 PC 에서 실행).'); });

    // CLAHE
    function makeClahe(clip, size) { return { __clahe: true, __csTypeName: 'CLAHE', c: guard(() => new cv.CLAHE(clip, size)), csToString: () => 'CLAHE', csDispose() { try { this.c.delete(); } catch (e) { /* 무시 */ } } }; }
    T({ name: 'CLAHE', kind: 'class', isInstance: (v) => v && v.__clahe, statics: { Create: sfn((i, a) => makeClahe(optNum(a, 0, 40), a.length > 1 ? toSize(a[1]) : new cv.Size(8, 8)), 'CLAHE') }, methods: { Apply: method((i, o, a) => guard(() => o.c.apply(asMat(a[0]), outMat(a[1]))), 'void'), SetClipLimit: method((i, o, a) => o.c.setClipLimit(num(a[0]))), SetTilesGridSize: method((i, o, a) => o.c.setTilesGridSize(toSize(a[0]))), Dispose: method((i, o) => o.csDispose()) }, props: { ClipLimit: prop('double', (o) => o.c.getClipLimit(), (o, v) => o.c.setClipLimit(v)) } });

    // ---------------------------------------------------------------- Cv2 정적 클래스 등록
    const CV2 = T({ name: 'Cv2', kind: 'static', statics: Object.assign({
      PI: sval('double', () => Math.PI), LOG2: sval('double', () => Math.LN2), FILLED: sval('int', () => -1), LINE_8: sval('int', () => 8), LINE_AA: sval('int', () => 16), FONT_HERSHEY_SIMPLEX: sval('int', () => 0)
    }, F) });
    ctx.CV2 = CV2;

    // ---------------------------------------------------------------- Mat 확장 메서드 (OpenCvSharp 의 인스턴스 버전)
    // 이름 → [dst 인덱스(있으면 새 Mat 을 넣어 반환), 반환 형식]
    const MAT_EXT = {
      CvtColor: 1, Threshold: 1, AdaptiveThreshold: 1, Blur: 1, GaussianBlur: 1, MedianBlur: 1, BilateralFilter: 1, BoxFilter: 1, Filter2D: 1, Sobel: 1, Scharr: 1, Laplacian: 1, Canny: 1, Erode: 1, Dilate: 1, MorphologyEx: 1, Resize: 1, Flip: 1, WarpAffine: 1, WarpPerspective: 1, EqualizeHist: 1, Normalize: 1, ConvertScaleAbs: 1, BitwiseNot: 1, PyrDown: 1, PyrUp: 1, Transpose: 1, MatchTemplate: 2, DistanceTransform: 1, ApplyColorMap: 1, CopyMakeBorder: 1, Rotate: 1, Remap: 1, Exp: 1, Log: 1, Sqrt: 1, Pow: 2, LUT: 2, InRange: 3, Absdiff: 2, Add: 2, Subtract: 2, Multiply: 2, Divide: 2, BitwiseAnd: 2, BitwiseOr: 2, BitwiseXor: 2, Compare: 2, Max: 2, Min: 2, Idft: 1, Dft: 1, Repeat: 3
    };
    for (const [name, dstIdx] of Object.entries(MAT_EXT)) {
      const st = F[name]; if (!st) continue;
      const ret = name === 'Threshold' ? 'Mat' : 'Mat';
      interp.defExtension(name, (i, self, a, ta, node) => { const args = a.slice(); const d = newMat(); args.splice(dstIdx - 1, 0, d); args.unshift(self); st.fn(i, args, ta, node); return d; }, ret, (v) => v instanceof Mat);
    }
    const MAT_EXT_SAME = ['Line', 'Rectangle', 'Circle', 'Ellipse', 'PutText', 'Polylines', 'FillPoly', 'FillConvexPoly', 'ArrowedLine', 'DrawMarker', 'DrawContours', 'FloodFill', 'Randu', 'Randn', 'ImShow'];
    for (const name of MAT_EXT_SAME) { const st = F[name]; if (!st) continue; interp.defExtension(name, (i, self, a, ta, node) => st.fn(i, name === 'ImShow' ? [a[0], self] : [self, ...a], ta, node), 'void', (v) => v instanceof Mat); }
    const MAT_EXT_RET = { CountNonZero: 'int', Mean: 'Scalar', Sum: 'Scalar', Moments: 'Moments', FindContoursAsArray: 'Point[][]', FindContoursAsMat: 'Mat[]', ConnectedComponentsEx: 'ConnectedComponents', HoughLines: 'LineSegmentPolar[]', HoughLinesP: 'LineSegmentPoint[]', HoughCircles: 'CircleSegment[]', GoodFeaturesToTrack: 'Point2f[]', FindNonZero: 'Point[]', Norm: 'double', BoundingRect: 'Rect', MinAreaRect: 'RotatedRect', ContourArea: 'double', ArcLength: 'double', ApproxPolyDP: 'Point[]', ConvexHull: 'Point[]', FitEllipse: 'RotatedRect', FitLine: 'Line2D', ConnectedComponents: 'int', ConnectedComponentsWithStats: 'int', PSNR: 'double', MinMaxLoc: 'void', MeanStdDev: 'void', Split: 'Mat[]', Watershed: 'void', GrabCut: 'void', Kmeans: 'double' };
    for (const [name, ret] of Object.entries(MAT_EXT_RET)) { const st = F[name]; if (!st) continue; interp.defExtension(name, (i, self, a, ta, node) => st.fn(i, [self, ...a], ta, node), ret, (v) => v instanceof Mat); }
    interp.defExtension('FindContours', (i, self, a, ta, node) => F.FindContours.fn(i, [self, ...a], ta, node), 'void', (v) => v instanceof Mat);
    interp.defExtension('SaveImage', (i, self, a) => imwrite(a[0], self), 'bool', (v) => v instanceof Mat);
    interp.defExtension('ToBytes', (i, self) => { const png = host.encodePng(matToRaw(self.cv)); return arr(Array.from(png), 'byte'); }, 'byte[]', (v) => v instanceof Mat);
    interp.defExtension('Alignment', (i, self) => self, 'Mat', (v) => v instanceof Mat);
    // 점 배열 확장: contour.ContourArea() 등
    for (const name of ['ContourArea', 'ArcLength', 'BoundingRect', 'MinAreaRect', 'MinEnclosingCircle', 'ApproxPolyDP', 'ConvexHull', 'IsContourConvex', 'Moments', 'FitEllipse', 'FitLine', 'PointPolygonTest']) { const st = F[name]; if (!st) continue; interp.defExtension(name, (i, self, a, ta, node) => st.fn(i, [self, ...a], ta, node), MAT_EXT_RET[name] || null, (v) => isPointSeq(v)); }

    // ---------------------------------------------------------------- Window 클래스
    const windowNames = new Set();
    T({
      name: 'Window', kind: 'class', isInstance: (v) => v && v.__win,
      ctor: (i, a) => { const name = a.length && typeof a[0] === 'string' ? a[0] : `Window${windowNames.size + 1}`; const w = { __win: true, __csTypeName: 'Window', name, csToString: () => `Window(${name})`, csDispose: () => {} }; windowNames.add(name); const img = a.find((x) => x instanceof Mat); if (img) F.ImShow.fn(i, [name, img]); return w; },
      statics: {
        ShowImages: sfn((i, a) => { const mats = a.length === 1 && Array.isArray(a[0]) ? a[0] : a.filter((x) => x instanceof Mat); const names = a.length === 2 && Array.isArray(a[1]) && typeof a[1][0] === 'string' ? a[1] : null; mats.forEach((m, k) => F.ImShow.fn(i, [names ? names[k] : `image ${k + 1}`, m])); if (host.waitKey) host.waitKey(0); }, 'void'),
        WaitKey: sfn((i, a) => (host.waitKey ? host.waitKey(optNum(a, 0, 0)) : -1), 'int'), DestroyAllWindows: sfn(() => { if (host.destroyWindow) host.destroyWindow(null); }, 'void')
      },
      props: { Name: prop('string', (w) => w.name), Image: prop('Mat', (w) => w.image || null, (w, v) => { w.image = v; F.ImShow.fn(interp, [w.name, v]); }) },
      methods: { ShowImage: method((i, w, a) => { w.image = a[0]; F.ImShow.fn(i, [w.name, a[0]]); }), Resize: method(() => {}), Move: method(() => {}), Close: method((i, w) => { if (host.destroyWindow) host.destroyWindow(w.name); }), Dispose: method((i, w) => {}), SetMouseCallback: method(() => { throw new CsException('NotSupportedException', '마우스 콜백은 브라우저 실습 환경에서 지원하지 않습니다'); }), CreateTrackbar: method(() => { throw new CsException('NotSupportedException', '트랙바는 브라우저 실습 환경에서 지원하지 않습니다'); }) }
    });

    // ---------------------------------------------------------------- VideoCapture · VideoWriter
    T({
      name: 'VideoCapture', kind: 'class', isInstance: (v) => v && v.__cap,
      ctor: (i, a) => { const cap = { __cap: true, __csTypeName: 'VideoCapture', h: null, csToString: () => 'VideoCapture', csDispose() { if (this.h && host.videoClose) host.videoClose(this.h); this.h = null; } }; if (a.length && a[0] != null) openCap(cap, a[0]); return cap; },
      statics: { FromCamera: sfn((i, a) => { const cap = { __cap: true, __csTypeName: 'VideoCapture', h: null, csToString: () => 'VideoCapture', csDispose() { this.h = null; } }; openCap(cap, optNum(a, 0, 0)); return cap; }, 'VideoCapture'), FromFile: sfn((i, a) => { const cap = { __cap: true, __csTypeName: 'VideoCapture', h: null, csToString: () => 'VideoCapture', csDispose() { this.h = null; } }; openCap(cap, str(a[0])); return cap; }, 'VideoCapture') },
      props: {
        FrameWidth: prop('int', (c) => (c.h ? c.h.w : 0)), FrameHeight: prop('int', (c) => (c.h ? c.h.h : 0)), Fps: prop('double', (c) => (c.h ? c.h.fps : 0)), FrameCount: prop('int', (c) => (c.h ? c.h.count : 0)),
        PosFrames: prop('int', (c) => (c.h ? c.h.pos : 0), (c, v) => { if (c.h) c.h.pos = num(v); }), PosMsec: prop('double', (c) => (c.h ? c.h.pos * 1000 / c.h.fps : 0)), IsOpened: prop('bool', (c) => !!c.h), FourCC: prop('string', () => 'MJPG'),
        Brightness: prop('double', () => 0, () => {}), Contrast: prop('double', () => 0, () => {}), Exposure: prop('double', () => 0, () => {}), AutoFocus: prop('double', () => 0, () => {}), ConvertRgb: prop('bool', () => true, () => {})
      },
      methods: {
        IsOpened: method((i, c) => !!c.h, 'bool'),
        Open: method((i, c, a) => { openCap(c, a[0]); return !!c.h; }, 'bool'),
        Read: method((i, c, a) => { const frame = a[0]; if (!(frame instanceof Mat)) throw new CsException('ArgumentException', 'Read 에는 프레임을 받을 Mat 이 필요합니다: var frame = new Mat(); cap.Read(frame);'); if (!c.h) return false; const raw = host.videoRead ? host.videoRead(c.h) : null; if (!raw) { if (c.h.ended && host.note && !c.h.noted) { c.h.noted = true; host.note(c.h.endNote || '영상이 끝났습니다 (Read 가 false 를 돌려줍니다).'); } return false; } const m = ctx.rawToMat(raw, 1); m.copyTo(frame.cv); m.delete(); return true; }, 'bool'),
        Grab: method((i, c) => { if (!c.h) return false; const raw = host.videoRead ? host.videoRead(c.h) : null; if (!raw) return false; c.h.grabbed = raw; return true; }, 'bool'),
        Retrieve: method((i, c, a) => { if (!c.h || !c.h.grabbed) return false; const m = ctx.rawToMat(c.h.grabbed, 1); m.copyTo(asMat(a[0])); m.delete(); return true; }, 'bool'),
        RetrieveMat: method((i, c) => { if (!c.h || !c.h.grabbed) return newMat(); return ctx.wrap(ctx.rawToMat(c.h.grabbed, 1)); }, 'Mat'),
        Get: method((i, c, a) => { const p = enumVal(a[0], -1); if (!c.h) return 0; switch (p) { case 3: return c.h.w; case 4: return c.h.h; case 5: return c.h.fps; case 7: return c.h.count; case 1: return c.h.pos; case 0: return c.h.pos * 1000 / c.h.fps; default: return 0; } }, 'double'),
        Set: method((i, c, a) => { const p = enumVal(a[0], -1); if (c.h && p === 1) c.h.pos = num(a[1]); return true; }, 'bool'),
        Release: method((i, c) => c.csDispose()), Dispose: method((i, c) => c.csDispose()), ToString: method(() => 'VideoCapture', 'string')
      }
    });
    function openCap(cap, src) {
      if (!host.videoOpen) throw new CsException('NotSupportedException', '이 환경에서는 카메라 · 동영상을 열 수 없습니다');
      cap.h = host.videoOpen(typeof src === 'number' ? src : str(src));
      if (!cap.h && host.note) host.note(`VideoCapture: '${fmt(src)}' 을(를) 열 수 없습니다. 브라우저 실습 환경에서는 카메라 0(시뮬레이션) 과 'videos/conveyor' 만 지원합니다.`);
    }
    T({
      name: 'VideoWriter', kind: 'class', isInstance: (v) => v && v.__vw,
      ctor: (i, a) => ({ __vw: true, __csTypeName: 'VideoWriter', name: str(a[0]), fps: optNum(a, 2, 30), frames: 0, csToString: () => 'VideoWriter', csDispose() { if (this.frames && host.note) host.note(`VideoWriter('${this.name}'): 프레임 ${this.frames}장을 기록했습니다 (브라우저 실습 환경에서는 파일로 저장되지 않습니다).`); } }),
      statics: { FourCC: sfn((i, a) => { const s = a.length === 1 ? str(a[0]) : a.map((c) => fmt(c)).join(''); let v = 0; for (let k = 0; k < 4; k++) v |= (s.charCodeAt(k) & 255) << (8 * k); return v; }, 'int') },
      props: { IsOpened: prop('bool', () => true) },
      methods: { Write: method((i, w, a) => { asMat(a[0]); w.frames++; if (w.frames <= 3 || w.frames % 10 === 0) F.ImShow.fn(i, [`VideoWriter: ${w.name}`, a[0]]); }), IsOpened: method(() => true, 'bool'), Release: method((i, w) => w.csDispose()), Dispose: method((i, w) => w.csDispose()) }
    });
    T({ name: 'FourCC', kind: 'static', statics: { MJPG: sval('int', () => 0x47504a4d), XVID: sval('int', () => 0x44495658), MP4V: sval('int', () => 0x5634504d), H264: sval('int', () => 0x34363248), Default: sval('int', () => -1), Prompt: sval('int', () => -1) } });
    T({ name: 'FourCCValues', kind: 'static', statics: interp.types.get('FourCC').statics });
    T({ name: 'MatOfByte', kind: 'class', ctor: (i, a) => ctx.createMat(i, a) });
    T({ name: 'Cv2Extensions', kind: 'static', statics: {} });
  }

  const api = { install };
  root.CsOpenCv2 = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
