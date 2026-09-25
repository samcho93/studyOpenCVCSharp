// 차시 작성 중 발견된 인터프리터 제한 회귀 테스트 (OpenCV 없이 동작하는 것 위주): node tools/cstest3.mjs
import { runCs } from './node-host.mjs';
const tests = [];
const t = (name, code, expect) => tests.push({ name, code, expect });
const U = 'using System;\nusing System.Linq;\nusing System.Collections.Generic;\nusing OpenCvSharp;\n';

t('anon-select', U + `var xs = new[] { 3.0, 4.0 }; var r = xs.Select(v => new { V = v, Sq = v * v }).ToList(); foreach (var a in r) Console.WriteLine($"{a.V} {a.Sq}"); Console.WriteLine(r[0]); var best = r.OrderByDescending(a => a.Sq).First(); Console.WriteLine(best.V);`, '3 9\n4 16\n{ V = 3, Sq = 9 }\n4\n');
t('anon-projection', U + `var p = new Point(3, 4); var a = new { p.X, p.Y, Name = "pt" }; Console.WriteLine(a.X + a.Y + " " + a.Name);`, '7 pt\n');
t('anon-double-div', U + `var items = new[] { new { A = 3.0, B = 2.0 } }; foreach (var it in items) Console.WriteLine(it.A / it.B); var one = new { Area = 10.0, Perim = 4.0 }; Console.WriteLine(one.Area / one.Perim);`, '1.5\n2.5\n');
t('tuple-double-div', U + `var list = new List<(int k, double a, double ha)> { (1, 3.0, 2.0), (2, 9, 4) }; foreach (var r in list) Console.WriteLine($"{r.k}: {r.a / r.ha:F3}"); (int n, double s) t = (3, 6); Console.WriteLine(t.s / 4); Console.WriteLine(list[1].a / list[1].ha);`, '1: 1.500\n2: 2.250\n1.5\n2.25\n');
t('tuple-item-n', U + `(double, double) p = (3, 2); Console.WriteLine(p.Item1 / p.Item2);`, '1.5\n');
t('lambda-tuple-div', U + `var list = new List<(string name, double area, double perim)> { ("a", 314.0, 62.8) }; var circ = list.Select(r => 4 * Math.PI * r.area / (r.perim * r.perim)).First(); Console.WriteLine($"{circ:F2}");`, '1.00\n');

// ROI(비연속 Mat) 픽셀 접근: step 을 반영해야 한다
t('roi-at-get-set', U + `using var img = new Mat(10, 10, MatType.CV_8UC1, Scalar.Black); for (int y = 0; y < 10; y++) for (int x = 0; x < 10; x++) img.Set<byte>(y, x, (byte)(y * 10 + x)); using var roi = new Mat(img, new Rect(2, 3, 4, 5)); Console.WriteLine(roi.IsContinuous()); Console.WriteLine(roi.At<byte>(0, 0) + " " + roi.At<byte>(1, 2) + " " + roi.Get<byte>(4, 3)); roi.Set<byte>(1, 1, 255); Console.WriteLine(img.At<byte>(4, 3)); Console.WriteLine(roi.Step() + " " + img.Step()); Console.WriteLine(Cv2.Sum(roi).Val0); Console.WriteLine(string.Join(",", roi.GetArray<byte>().Take(5))); using var r2 = img[new Rect(0, 0, 2, 2)]; Console.WriteLine(r2.Dump());`, 'False\n32 44 75\n255\n10 10\n1282\n32,33,34,35,42\n[0, 1;\n 10, 11]\n');
t('roi-color-vec3b', U + `using var img = new Mat(4, 6, MatType.CV_8UC3, new Scalar(1, 2, 3)); img.Set(2, 4, new Vec3b(10, 20, 30)); using var roi = new Mat(img, new Rect(3, 1, 3, 3)); Vec3b v = roi.At<Vec3b>(1, 1); Console.WriteLine($"{v.Item0} {v.Item1} {v.Item2}"); var idx = roi.GetGenericIndexer<Vec3b>(); idx[0, 0] = new Vec3b(7, 8, 9); Console.WriteLine(img.At<Vec3b>(1, 3));`, '10 20 30\nVec3b(7, 8, 9)\n');

// 픽셀 캐시가 출력 Mat 재할당 뒤에도 새 데이터를 읽는지 (크기가 바뀌는 CopyTo · Create · Resize)
t('pix-cache-invalidate', U + `var m = new Mat(2, 2, MatType.CV_8UC1, new Scalar(5)); Console.WriteLine(m.At<byte>(1, 1)); var big = new Mat(4, 4, MatType.CV_8UC1, new Scalar(9)); big.CopyTo(m); Console.WriteLine(m.At<byte>(3, 3) + " " + m.Rows); m.Create(3, 3, MatType.CV_8UC1); m.SetTo(new Scalar(7)); Console.WriteLine(m.At<byte>(2, 2)); var r = new Mat(); Cv2.Resize(big, r, new Size(8, 8)); Console.WriteLine(r.At<byte>(7, 7)); Cv2.Resize(big, r, new Size(2, 2)); Console.WriteLine(r.At<byte>(1, 1) + " " + r.Cols); try { r.At<byte>(3, 3); } catch (IndexOutOfRangeException) { Console.WriteLine("범위 검사 OK"); }`, '5\n9 4\n7\n9\n9 2\n범위 검사 OK\n');

// 형식을 명시한 튜플 분해 선언 (실제 WPF 프로젝트 코드에 있는 문법)
t('typed-deconstruct', U + `var found = new List<(Rect Rect, double Area, Point Center)> { (new Rect(1, 2, 3, 4), 12.5, new Point(2, 4)) }; for (int i = 0; i < found.Count; i++) { (Rect rect, double area, Point center) = found[i]; Console.WriteLine($"{rect.Width} {area / 2} {center.X}"); } (int a, double b) = (7, 3); Console.WriteLine(a / 2 + " " + b / 2);`, '3 6.25 2\n3 1.5\n');

let pass = 0, fail = 0;
for (const tc of tests) {
  const r = await runCs(tc.code);
  const ok = r.out === tc.expect && !r.error;
  if (ok) pass++; else { fail++; console.log(`✗ ${tc.name}\n  기대: ${JSON.stringify(tc.expect)}\n  실제: ${JSON.stringify(r.out)}${r.error ? `\n  오류: ${r.error.type}: ${r.error.message} (줄 ${r.error.line || '?'})` : ''}`); }
}
console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
