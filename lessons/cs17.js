/* 17차시 실전 검사 프로젝트: 개수 세기 · 색 분류 · 결함 검사 (3교시) — wpf/Ch17_Inspection */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 검사 파이프라인 (개수 세기)
  const FIG_COUNT = `<svg viewBox="0 0 760 330" role="img" aria-label="개수 세기 검사 파이프라인: 흑백 변환부터 판정과 오버레이까지">
  ${ARROW('c17a1')}
  <rect x="14" y="30" width="112" height="60" rx="10" class="p1s"/>
  <text x="70" y="54" text-anchor="middle" class="tx-b">입력 영상</text>
  <text x="70" y="74" text-anchor="middle" class="tx-m">Mat (BGR/Gray)</text>

  <rect x="146" y="30" width="112" height="60" rx="10" class="p2s"/>
  <text x="202" y="54" text-anchor="middle" class="tx-b">Gray + 블러</text>
  <text x="202" y="74" text-anchor="middle" class="tx-m">GaussianBlur 5×5</text>

  <rect x="278" y="30" width="146" height="60" rx="10" class="p2s"/>
  <text x="351" y="50" text-anchor="middle" class="tx-b">Otsu 이진화</text>
  <text x="351" y="68" text-anchor="middle" class="tx-m">배경 밝기 자동 판단</text>
  <text x="351" y="84" text-anchor="middle" class="tx-m">흰 비율 &gt; 50% → BitwiseNot</text>

  <rect x="444" y="30" width="146" height="60" rx="10" class="p3s"/>
  <text x="517" y="50" text-anchor="middle" class="tx-b">MorphologyEx Open</text>
  <text x="517" y="68" text-anchor="middle" class="tx-m">작은 잡점 제거</text>
  <text x="517" y="84" text-anchor="middle" class="tx-m">타원 커널 3×3</text>

  <rect x="610" y="30" width="136" height="60" rx="10" class="p3s"/>
  <text x="678" y="50" text-anchor="middle" class="tx-b">바깥 윤곽선</text>
  <text x="678" y="68" text-anchor="middle" class="tx-m">FindContours</text>
  <text x="678" y="84" text-anchor="middle" class="tx-m">External</text>

  <line x1="128" y1="60" x2="142" y2="60" class="ln" stroke-width="2" marker-end="url(#c17a1)"/>
  <line x1="260" y1="60" x2="274" y2="60" class="ln" stroke-width="2" marker-end="url(#c17a1)"/>
  <line x1="426" y1="60" x2="440" y2="60" class="ln" stroke-width="2" marker-end="url(#c17a1)"/>
  <line x1="592" y1="60" x2="606" y2="60" class="ln" stroke-width="2" marker-end="url(#c17a1)"/>

  <rect x="120" y="140" width="170" height="64" rx="10" class="p4s"/>
  <text x="205" y="162" text-anchor="middle" class="tx-b">면적 필터</text>
  <text x="205" y="180" text-anchor="middle" class="tx-m">MinArea (기본 300)</text>
  <text x="205" y="196" text-anchor="middle" class="tx-m">잡음 · 배경 조각 제거</text>

  <rect x="320" y="140" width="150" height="64" rx="10" class="p5s"/>
  <text x="395" y="162" text-anchor="middle" class="tx-b">개수 판정</text>
  <text x="395" y="180" text-anchor="middle" class="tx-m">개수 == ExpectedCount ?</text>
  <text x="395" y="196" text-anchor="middle" class="tx-m">OK / NG</text>

  <rect x="500" y="140" width="170" height="64" rx="10" class="p1s"/>
  <text x="585" y="162" text-anchor="middle" class="tx-b">오버레이</text>
  <text x="585" y="180" text-anchor="middle" class="tx-m">Rectangle · 번호</text>
  <text x="585" y="196" text-anchor="middle" class="tx-m">PutJudge (OK/NG 띠)</text>

  <line x1="678" y1="92" x2="678" y2="118" class="ln" stroke-width="2"/>
  <line x1="678" y1="118" x2="205" y2="118" class="ln" stroke-width="2"/>
  <line x1="205" y1="118" x2="205" y2="136" class="ln" stroke-width="2" marker-end="url(#c17a1)"/>
  <line x1="292" y1="172" x2="316" y2="172" class="ln" stroke-width="2" marker-end="url(#c17a1)"/>
  <line x1="472" y1="172" x2="496" y2="172" class="ln" stroke-width="2" marker-end="url(#c17a1)"/>

  <rect x="120" y="234" width="550" height="60" rx="10" class="card-bg"/>
  <text x="395" y="256" text-anchor="middle" class="tx-b">InspectionResult { IsOk · Summary · Overlay(Mat) · Items(표 한 줄씩) }</text>
  <text x="395" y="276" text-anchor="middle" class="tx-m">→ WPF: Image.Source = Overlay.ToBitmapSource(), DataGrid.ItemsSource = Items, CSV 저장</text>
  <line x1="585" y1="206" x2="585" y2="230" class="ln" stroke-width="2" marker-end="url(#c17a1)"/>
  <text x="395" y="316" text-anchor="middle" class="tx-m">닿아 있는 부품이 있으면 개수가 적게 나온다 → 거리 변환 + Watershed 로 분리 (washers: 11 → 13)</text>
</svg>`;

  // 그림 2: 기준 격자 대조 (핀 검사)
  const FIG_GRID = `<svg viewBox="0 0 740 260" role="img" aria-label="공칭 격자 좌표와 실제 검출 중심을 비교해 누락과 휨을 판정하는 방법">
  <text x="370" y="26" text-anchor="middle" class="tx-b">공칭 격자 x = 100 + 40·i (i = 0…11), y = 240</text>
  <line x1="40" y1="90" x2="700" y2="90" class="ax"/>
  <g class="tx-m" font-size="11">
    <text x="60" y="118" text-anchor="middle">i=0</text>
    <text x="113" y="118" text-anchor="middle">1</text>
    <text x="166" y="118" text-anchor="middle">2</text>
    <text x="219" y="118" text-anchor="middle">3</text>
    <text x="272" y="118" text-anchor="middle">4</text>
    <text x="325" y="118" text-anchor="middle">5</text>
    <text x="378" y="118" text-anchor="middle">6</text>
    <text x="431" y="118" text-anchor="middle">7</text>
    <text x="484" y="118" text-anchor="middle">8</text>
    <text x="537" y="118" text-anchor="middle">9</text>
    <text x="590" y="118" text-anchor="middle">10</text>
    <text x="643" y="118" text-anchor="middle">11</text>
  </g>
  <g>
    <rect x="50" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="103" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="156" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="209" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="266" y="84" width="20" height="20" rx="3" class="p4s"/>
    <rect x="315" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="368" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="421" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="474" y="76" width="20" height="20" rx="3" class="p5s" stroke-dasharray="3 3"/>
    <rect x="527" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="580" y="76" width="20" height="20" rx="3" class="p2s"/>
    <rect x="633" y="76" width="20" height="20" rx="3" class="p2s"/>
  </g>
  <text x="276" y="150" text-anchor="middle" class="tx">i=4 : 중심이 (+3.5, +9.0) 만큼 벗어남</text>
  <text x="276" y="168" text-anchor="middle" class="tx-m">거리 9.7 px &gt; 5 → <tspan class="tx-b">휨(NG)</tspan></text>
  <text x="520" y="150" text-anchor="middle" class="tx">i=8 : 가까운 블롭이 없음</text>
  <text x="520" y="168" text-anchor="middle" class="tx-m">최근접 거리 39.9 px &gt; 20 → <tspan class="tx-b">누락(NG)</tspan></text>

  <rect x="60" y="188" width="620" height="56" rx="10" class="card-bg"/>
  <text x="370" y="210" text-anchor="middle" class="tx">판정 규칙: 공칭 위치마다 <tspan class="tx-b">가장 가까운 블롭 중심까지의 거리</tspan>를 구한다</text>
  <text x="370" y="232" text-anchor="middle" class="tx-m">거리 ≤ 5 px → OK / 5 &lt; 거리 ≤ 20 px → 휨 / 거리 &gt; 20 px → 누락</text>
</svg>`;

  const EX_COUNT = `using System;
using System.Collections.Generic;
using OpenCvSharp;

// ───── wpf/Ch17_Inspection/Inspectors/InspectionResult.cs 와 같은 구조 ─────
class InspectionItem
{
    public string Item { get; private set; }
    public string Value { get; private set; }
    public string Judge { get; private set; }
    public InspectionItem(string item, string value, string judge = "-")
    {
        Item = item; Value = value; Judge = judge;
    }
}

class InspectionResult : IDisposable
{
    public bool IsOk { get; private set; }
    public string Summary { get; private set; }
    public Mat Overlay { get; private set; }
    public List<InspectionItem> Items { get; private set; }
    public InspectionResult(bool isOk, string summary, Mat overlay, List<InspectionItem> items)
    {
        IsOk = isOk; Summary = summary; Overlay = overlay; Items = items;
    }
    public void Dispose() { Overlay.Dispose(); }
}

interface IInspector
{
    string Name { get; }
    bool NeedsGolden { get; }
    InspectionResult Inspect(Mat image, Mat golden);
}

static class MatHelper
{
    public static Mat ToGray(Mat src)
    {
        if (src.Channels() == 1) return src.Clone();
        var gray = new Mat();
        Cv2.CvtColor(src, gray, ColorConversionCodes.BGR2GRAY);
        return gray;
    }

    public static Mat ToBgr(Mat src)
    {
        if (src.Channels() == 3) return src.Clone();
        var bgr = new Mat();
        Cv2.CvtColor(src, bgr, ColorConversionCodes.GRAY2BGR);
        return bgr;
    }

    // 검은 테두리 + 색 글자 → 배경이 밝아도 어두워도 보인다
    public static void PutLabel(Mat img, string text, Point org, Scalar color, double scale = 0.6)
    {
        Cv2.PutText(img, text, org, HersheyFonts.HersheySimplex, scale, Scalar.Black, 3, LineTypes.AntiAlias);
        Cv2.PutText(img, text, org, HersheyFonts.HersheySimplex, scale, color, 1, LineTypes.AntiAlias);
    }

    // 왼쪽 위 판정 띠 (OK 초록 · NG 빨강)
    public static void PutJudge(Mat img, bool isOk)
    {
        Scalar color = isOk ? new Scalar(0, 180, 0) : new Scalar(0, 0, 220);
        Cv2.Rectangle(img, new Rect(0, 0, img.Width, 44), color, -1);
        Cv2.PutText(img, isOk ? "OK" : "NG", new Point(12, 34), HersheyFonts.HersheyDuplex, 1.1, Scalar.White, 2, LineTypes.AntiAlias);
    }
}

// ───── wpf/Ch17_Inspection/Inspectors/CountInspector.cs 와 같은 처리 ─────
class CountInspector : IInspector
{
    public string Name { get { return "개수 세기 (Otsu + 윤곽선)"; } }
    public bool NeedsGolden { get { return false; } }
    public int MinArea { get; set; } = 300;
    public int ExpectedCount { get; set; }

    public InspectionResult Inspect(Mat image, Mat golden)
    {
        // 1) 흑백 + 블러
        using Mat gray = MatHelper.ToGray(image);
        using var blurred = new Mat();
        Cv2.GaussianBlur(gray, blurred, new Size(5, 5), 0);

        // 2) Otsu 이진화 + 밝기 방향 자동 판단 (흰 부분이 절반을 넘으면 그것은 배경 → 반전)
        using var bin = new Mat();
        Cv2.Threshold(blurred, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        double whiteRatio = Cv2.CountNonZero(bin) / (double)(bin.Rows * bin.Cols);
        if (whiteRatio > 0.5)
            Cv2.BitwiseNot(bin, bin);

        // 3) 모폴로지 열기로 작은 점 잡음 제거
        using Mat element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(3, 3));
        Cv2.MorphologyEx(bin, bin, MorphTypes.Open, element);

        // 4) 바깥 윤곽선만 찾아 면적으로 걸러 낸다 (구멍은 세지 않음)
        Cv2.FindContours(bin, out Point[][] contours, out HierarchyIndex[] hierarchy,
                         RetrievalModes.External, ContourApproximationModes.ApproxSimple);

        var rects = new List<Rect>();
        var areas = new List<double>();
        foreach (Point[] contour in contours)
        {
            double area = Cv2.ContourArea(contour);
            if (area < MinArea) continue;
            rects.Add(Cv2.BoundingRect(contour));
            areas.Add(area);
        }

        // 번호를 위 → 아래, 왼쪽 → 오른쪽 순서로 (같은 줄은 60 px 로 묶음)
        var order = new List<int>();
        for (int i = 0; i < rects.Count; i++) order.Add(i);
        order.Sort((p, q) =>
        {
            int cyA = rects[p].Y + rects[p].Height / 2, cyB = rects[q].Y + rects[q].Height / 2;
            int rowA = cyA / 60, rowB = cyB / 60;
            int cxA = rects[p].X + rects[p].Width / 2, cxB = rects[q].X + rects[q].Width / 2;
            return rowA != rowB ? rowA.CompareTo(rowB) : cxA.CompareTo(cxB);
        });

        // 5) 오버레이에 번호 · 사각형
        Mat overlay = MatHelper.ToBgr(image);
        var items = new List<InspectionItem>();
        for (int k = 0; k < order.Count; k++)
        {
            Rect rect = rects[order[k]];
            double area = areas[order[k]];
            Cv2.Rectangle(overlay, rect, Scalar.Lime, 2);
            MatHelper.PutLabel(overlay, $"{k + 1}", new Point(rect.X, rect.Y - 6), Scalar.Lime);
            double diameter = 2 * Math.Sqrt(area / Math.PI);          // 등가 원 지름
            items.Add(new InspectionItem($"#{k + 1}",
                $"중심 ({rect.X + rect.Width / 2}, {rect.Y + rect.Height / 2}) · 면적 {area:F0} px² · 등가지름 {diameter:F1} px"));
        }

        int found = order.Count;
        bool isOk = ExpectedCount <= 0 || found == ExpectedCount;
        string summary = ExpectedCount <= 0
            ? $"검출 {found} 개 (기대 개수 미설정)"
            : $"검출 {found} 개 / 기대 {ExpectedCount} 개";
        items.Insert(0, new InspectionItem("검출 개수", $"{found} 개", ExpectedCount <= 0 ? "-" : (isOk ? "OK" : "NG")));
        items.Insert(1, new InspectionItem("면적 하한", $"{MinArea} px²"));

        MatHelper.PutJudge(overlay, isOk);
        return new InspectionResult(isOk, summary, overlay, items);
    }
}

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        var inspector = new CountInspector();
        inspector.ExpectedCount = 13;          // 와셔 6 + 너트 4 + 볼트 3

        using InspectionResult r = inspector.Inspect(img, null);
        Console.WriteLine($"[{inspector.Name}] {r.Summary} -> {(r.IsOk ? "OK" : "NG")}");
        foreach (InspectionItem it in r.Items)
            Console.WriteLine($"  {it.Item} | {it.Value} | {it.Judge}");

        Cv2.ImShow("overlay", r.Overlay);
        Cv2.WaitKey(0);
    }
}`;

  const EX_WATERSHED = `using System;
using OpenCvSharp;

class Program
{
    // 이진 영상의 구멍을 메운다 (와셔 · 너트의 구멍 때문에 거리 변환 값이 작아지는 것을 막는다)
    static Mat FillHoles(Mat bin)
    {
        var filled = new Mat(bin.Size(), MatType.CV_8UC1, Scalar.All(0));
        Point[][] outer = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Cv2.DrawContours(filled, outer, -1, Scalar.All(255), -1);   // 두께 -1 = 채우기
        return filled;
    }

    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);

        // ① 이진화 (백라이트 → 부품이 어둡다)
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        using var labels0 = new Mat();
        int before = Cv2.ConnectedComponents(bin, labels0) - 1;
        Console.WriteLine($"그냥 세면: {before} 개 (닿아 있는 부품이 하나로 합쳐짐)");

        // ② 구멍 메우기 → 거리 변환
        using Mat solid = FillHoles(bin);
        using var dist = new Mat();
        Cv2.DistanceTransform(solid, dist, DistanceTypes.L2, DistanceTransformMasks.Mask5);
        Cv2.MinMaxLoc(dist, out double dmin, out double dmax);
        Console.WriteLine($"거리 변환 최대값: {dmax:F1} px (가장 굵은 부품의 반지름)");

        // ③ 거리 변환의 봉우리 = 부품마다 하나씩 (씨앗)
        using var peaks = new Mat();
        Cv2.Threshold(dist, peaks, 0.4 * dmax, 255, ThresholdTypes.Binary);
        using var seeds = new Mat();
        peaks.ConvertTo(seeds, MatType.CV_8UC1);
        using var labels = new Mat();
        int n = Cv2.ConnectedComponents(seeds, labels);
        Console.WriteLine($"씨앗(봉우리) 개수: {n - 1}");

        // ④ 마커 만들기: 배경 = 1, 씨앗 = 2.., 모르는 영역 = 0
        using var markers = new Mat();
        labels.ConvertTo(markers, MatType.CV_32SC1);
        Cv2.Add(markers, new Scalar(1), markers);        // 배경(0) -> 1, 씨앗 -> 2..
        using var unknown = new Mat();
        Cv2.Subtract(solid, seeds, unknown);             // 부품이지만 씨앗은 아닌 영역
        markers.SetTo(new Scalar(0), unknown);           // 여기를 물이 채운다

        // ⑤ Watershed
        using var color = new Mat();
        Cv2.CvtColor(gray, color, ColorConversionCodes.GRAY2BGR);
        Cv2.Watershed(color, markers);

        // ⑥ 라벨마다 면적 · 경계 상자
        using var overlay = new Mat();
        Cv2.CvtColor(gray, overlay, ColorConversionCodes.GRAY2BGR);
        using var mask = new Mat();
        int count = 0;
        for (int k = 2; k <= n; k++)
        {
            Cv2.Compare(markers, k, mask, CmpType.EQ);
            int area = Cv2.CountNonZero(mask);
            if (area < 300) continue;
            count++;
            Rect box = Cv2.BoundingRect(mask);
            Cv2.Rectangle(overlay, box, new Scalar(0, 200, 0), 2);
            Cv2.PutText(overlay, count.ToString(), new Point(box.X + 2, box.Y + 16),
                        HersheyFonts.HersheySimplex, 0.5, new Scalar(0, 255, 255), 1);
        }
        Console.WriteLine($"Watershed 로 분리한 개수: {count} 개 -> 기대 13개와 {(count == 13 ? "일치 OK" : "불일치 NG")}");

        Cv2.ImShow("separated", overlay);
        Cv2.WaitKey(0);
    }
}`;

  const EX_SIZE = `using System;
using System.Collections.Generic;
using OpenCvSharp;

class Program
{
    // 면적 -> 등가 반지름 (원이라고 가정): A = pi r^2  ->  r = sqrt(A / pi)
    static double EquivalentRadius(int area)
    {
        return Math.Sqrt(area / Math.PI);
    }

    static void Main()
    {
        using var gray = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        double t = Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
        Cv2.MorphologyEx(bin, bin, MorphTypes.Open, element);

        using var labels = new Mat();
        using var stats = new Mat();
        using var cents = new Mat();
        int n = Cv2.ConnectedComponentsWithStats(bin, labels, stats, cents);

        using var overlay = new Mat();
        Cv2.CvtColor(gray, overlay, ColorConversionCodes.GRAY2BGR);

        // 배율 0.1 mm/px (IMAGES.md) — L r=34px(6.8mm) M r=27px(5.4mm) S r=20px(4.0mm)
        double mmPerPx = 0.1;
        int s = 0, m = 0, l = 0;
        var sizes = new List<string>();
        for (int i = 1; i < n; i++)
        {
            int area = stats.At<int>(i, 4);
            if (area < 300) continue;
            double r = EquivalentRadius(area);
            string cls = r >= 30 ? "L" : (r >= 24 ? "M" : "S");
            if (cls == "L") l++; else if (cls == "M") m++; else s++;
            var box = new Rect(stats.At<int>(i, 0), stats.At<int>(i, 1), stats.At<int>(i, 2), stats.At<int>(i, 3));
            Scalar color = cls == "L" ? new Scalar(0, 200, 0) : (cls == "M" ? new Scalar(0, 200, 255) : new Scalar(255, 120, 0));
            Cv2.Rectangle(overlay, box, color, 2);
            Cv2.PutText(overlay, cls, new Point(box.X + 4, box.Y + 18), HersheyFonts.HersheySimplex, 0.6, color, 2);
            sizes.Add($"{cls} r={r:F1}px (지름 {2 * r * mmPerPx:F1}mm)");
        }

        Console.WriteLine($"Otsu 임계값 {t}, 부품 {s + m + l} 개");
        Console.WriteLine($"크기별: S {s} 개 · M {m} 개 · L {l} 개");
        sizes.Sort();
        foreach (string x in sizes) Console.WriteLine("  " + x);
        Console.WriteLine($"판정: {(s == 5 && m == 4 && l == 3 ? "OK (S5 M4 L3)" : "NG")}");

        Cv2.ImShow("size classes", overlay);
        Cv2.WaitKey(0);
    }
}`;

  const EX_PINS = `using System;
using System.Collections.Generic;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/connector_pins.png", ImreadModes.Grayscale);

        // 핀은 검은 하우징 안의 밝은 사각형 → Binary (배경이 밝아도 자동 판단에 맡기지 않는다!)
        using var bin = new Mat();
        double t = Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        using var element = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(3, 3));
        Cv2.MorphologyEx(bin, bin, MorphTypes.Open, element);

        using var labels = new Mat();
        using var stats = new Mat();
        using var cents = new Mat();
        int n = Cv2.ConnectedComponentsWithStats(bin, labels, stats, cents);

        // 핀 크기는 14 x 14 px ≈ 200 px² → 100~2000 만 남긴다 (큰 배경 덩어리를 버린다)
        var found = new List<Point2d>();
        for (int i = 1; i < n; i++)
        {
            int area = stats.At<int>(i, 4);
            if (area < 100 || area > 2000) continue;
            found.Add(new Point2d(cents.At<double>(i, 0), cents.At<double>(i, 1)));
        }
        Console.WriteLine($"Otsu 임계값 {t}, 핀 크기 블롭 {found.Count} 개 / 자리 12개");

        using var overlay = new Mat();
        Cv2.CvtColor(gray, overlay, ColorConversionCodes.GRAY2BGR);

        int ng = 0;
        for (int i = 0; i < 12; i++)
        {
            double nx = 100 + 40 * i, ny = 240;      // 공칭 격자 (IMAGES.md)
            double best = 1e9;
            int bi = -1;
            for (int k = 0; k < found.Count; k++)
            {
                double dx = found[k].X - nx, dy = found[k].Y - ny;
                double d = Math.Sqrt(dx * dx + dy * dy);
                if (d < best) { best = d; bi = k; }
            }

            string judge = best > 20 ? "누락" : (best > 5 ? "휨" : "OK");
            if (judge != "OK") ng++;
            Scalar color = judge == "OK" ? new Scalar(0, 200, 0) : new Scalar(0, 0, 255);
            Cv2.Rectangle(overlay, new Rect((int)nx - 12, (int)ny - 12, 24, 24), color, 1);
            if (judge == "OK")
                Console.WriteLine($"  핀 {i,2} 공칭 x={nx,3} : 편차 {best:F1} px -> OK");
            else
                Console.WriteLine($"  핀 {i,2} 공칭 x={nx,3} : 편차 {best:F1} px -> {judge} (NG)");
            if (judge == "휨")
                Cv2.Line(overlay, new Point((int)nx, (int)ny), new Point((int)found[bi].X, (int)found[bi].Y), new Scalar(0, 0, 255), 2);
        }
        Console.WriteLine($"불량 {ng} 개 -> 전체 판정 {(ng == 0 ? "OK" : "NG")}");

        Cv2.ImShow("pins", overlay);
        Cv2.WaitKey(0);
    }
}`;

  const EX_CSV = `using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        using var labels = new Mat();
        using var stats = new Mat();
        using var cents = new Mat();
        int n = Cv2.ConnectedComponentsWithStats(bin, labels, stats, cents);

        // CSV 는 "헤더 한 줄 + 데이터 줄" 문자열로 만든 뒤 한 번에 파일로 쓴다
        var csv = new StringBuilder();
        csv.Append("no,cx,cy,area,radius_px,dia_mm,class,judge\\n");

        int no = 0, ng = 0;
        for (int i = 1; i < n; i++)
        {
            int area = stats.At<int>(i, 4);
            if (area < 300) continue;
            no++;
            double r = Math.Sqrt(area / Math.PI);
            double dia = 2 * r * 0.1;                      // 0.1 mm/px
            string cls = r >= 30 ? "L" : (r >= 24 ? "M" : "S");
            string judge = dia >= 3.5 && dia <= 7.5 ? "OK" : "NG";
            if (judge == "NG") ng++;
            csv.Append($"{no},{cents.At<double>(i, 0):F1},{cents.At<double>(i, 1):F1},{area},{r:F1},{dia:F2},{cls},{judge}\\n");
        }
        csv.Append($"total,{no},,,,,,{(ng == 0 ? "OK" : "NG")}\\n");

        File.WriteAllText("out/report.csv", csv.ToString());
        Console.WriteLine($"검사 {no} 건, 불량 {ng} 건 -> out/report.csv 저장");

        // 저장한 파일을 다시 읽어 확인 (📁 작업 폴더에서 내려받을 수 있습니다)
        string[] lines = File.ReadAllLines("out/report.csv");
        Console.WriteLine($"CSV {lines.Length} 줄");
        for (int k = 0; k < 4; k++) Console.WriteLine("  " + lines[k]);
        Console.WriteLine("  ...");
        Console.WriteLine("  " + lines[lines.Length - 1]);
    }
}`;

  const CS_IINSPECTOR = `// Inspectors/InspectionResult.cs — wpf/Ch17_Inspection 의 실제 코드
using OpenCvSharp;

namespace Ch17_Inspection.Inspectors;

/// <summary>결과 표(DataGrid) 의 한 줄: 항목 · 값 · 판정(OK / NG / -)</summary>
public sealed class InspectionItem
{
    public string Item { get; init; } = "";
    public string Value { get; init; } = "";
    public string Judge { get; init; } = "-";

    public InspectionItem() { }

    public InspectionItem(string item, string value, string judge = "-")
    {
        Item = item;
        Value = value;
        Judge = judge;
    }
}

/// <summary>
/// 검사 한 번의 결과. Overlay(결과를 그린 이미지)는 네이티브 메모리이므로 다 쓰면 Dispose 합니다.
/// </summary>
public sealed class InspectionResult : IDisposable
{
    public bool IsOk { get; }
    public string Summary { get; }
    public Mat Overlay { get; }
    public IReadOnlyList<InspectionItem> Items { get; }

    public InspectionResult(bool isOk, string summary, Mat overlay, IReadOnlyList<InspectionItem> items)
    {
        IsOk = isOk;
        Summary = summary;
        Overlay = overlay;
        Items = items;
    }

    public void Dispose() => Overlay.Dispose();
}

/// <summary>모든 검사기의 공통 인터페이스. WPF 에 의존하지 않는 순수 OpenCvSharp 코드입니다.</summary>
public interface IInspector
{
    /// <summary>ComboBox 에 보일 이름</summary>
    string Name { get; }

    /// <summary>기준(골든) 이미지가 필요한 검사인지</summary>
    bool NeedsGolden { get; }

    /// <summary>
    /// 검사를 실행합니다. image 와 golden 은 바꾸지 않으며, 결과 Overlay 는 새 Mat 입니다.
    /// 입력이 잘못되면 InvalidOperationException, OpenCV 처리 실패는 OpenCVException 이 납니다.
    /// </summary>
    InspectionResult Inspect(Mat image, Mat? golden);
}

/// <summary>검사기들이 함께 쓰는 작은 도우미</summary>
internal static class MatHelper
{
    /// <summary>1채널 복사본 (이미 1채널이면 Clone)</summary>
    public static Mat ToGray(Mat src)
    {
        if (src.Channels() == 1) return src.Clone();
        var gray = new Mat();
        Cv2.CvtColor(src, gray, src.Channels() == 4 ? ColorConversionCodes.BGRA2GRAY : ColorConversionCodes.BGR2GRAY);
        return gray;
    }

    /// <summary>3채널 복사본 (오버레이를 색으로 그리기 위해)</summary>
    public static Mat ToBgr(Mat src)
    {
        if (src.Channels() == 3) return src.Clone();
        var bgr = new Mat();
        Cv2.CvtColor(src, bgr, src.Channels() == 4 ? ColorConversionCodes.BGRA2BGR : ColorConversionCodes.GRAY2BGR);
        return bgr;
    }

    /// <summary>번호 · 이름 같은 짧은 글자를 검은 테두리가 있는 글자로 그립니다 (배경이 밝아도 어두워도 보이게).</summary>
    public static void PutLabel(Mat img, string text, Point org, Scalar color, double scale = 0.6)
    {
        Cv2.PutText(img, text, org, HersheyFonts.HersheySimplex, scale, Scalar.Black, 3, LineTypes.AntiAlias);
        Cv2.PutText(img, text, org, HersheyFonts.HersheySimplex, scale, color, 1, LineTypes.AntiAlias);
    }

    /// <summary>
    /// 오버레이 왼쪽 위에 판정 띠(OK 는 초록 · NG 는 빨강)를 그립니다.
    /// Cv2.PutText 는 한글을 그리지 못하므로 띠에는 영문 "OK" / "NG" 만 쓰고,
    /// 자세한 요약은 WPF 화면(TextBlock · DataGrid)에서 한글로 보여 줍니다.
    /// </summary>
    public static void PutJudge(Mat img, bool isOk)
    {
        Scalar color = isOk ? new Scalar(0, 180, 0) : new Scalar(0, 0, 220);   // BGR 순서
        Cv2.Rectangle(img, new Rect(0, 0, img.Width, 44), color, -1);
        Cv2.PutText(img, isOk ? "OK" : "NG", new Point(12, 34),
                    HersheyFonts.HersheyDuplex, 1.1, Scalar.White, 2, LineTypes.AntiAlias);
    }
}`;

  const CS_COUNTINSPECTOR = `// Inspectors/CountInspector.cs — wpf/Ch17_Inspection 의 실제 코드
using OpenCvSharp;

namespace Ch17_Inspection.Inspectors;

/// <summary>
/// 개수 세기 검사기.
///
/// 흐름: 흑백 → 블러 → Otsu 이진화(밝기 방향 자동 판단) → 모폴로지 열기 → 윤곽선 → 면적 필터 → 번호 붙이기
/// 기대 개수(ExpectedCount)가 0 보다 크면 검출 개수와 비교해 OK / NG 를 판정합니다.
/// </summary>
public sealed class CountInspector : IInspector
{
    public string Name => "개수 세기 (Otsu + 윤곽선)";

    public bool NeedsGolden => false;

    /// <summary>이보다 작은 덩어리는 잡음으로 보고 버립니다 (픽셀 면적).</summary>
    public int MinArea { get; set; } = 300;

    /// <summary>기대 개수. 0 이면 개수 판정을 하지 않고 검출 결과만 보여 줍니다.</summary>
    public int ExpectedCount { get; set; }

    public InspectionResult Inspect(Mat image, Mat? golden)
    {
        // 1) 흑백 + 블러 — 잡음이 윤곽선 개수를 늘리는 것을 막습니다.
        using Mat gray = MatHelper.ToGray(image);
        using var blurred = new Mat();
        Cv2.GaussianBlur(gray, blurred, new Size(5, 5), 0);

        // 2) Otsu 이진화. 물체가 어두운 영상(백라이트 실루엣)도 있으므로 방향을 자동으로 맞춥니다.
        using var bin = new Mat();
        Cv2.Threshold(blurred, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        double whiteRatio = Cv2.CountNonZero(bin) / (double)(bin.Rows * bin.Cols);
        if (whiteRatio > 0.5)
            Cv2.BitwiseNot(bin, bin);   // 흰 부분이 절반을 넘으면 그것은 배경이다 → 반전

        // 3) 모폴로지 열기로 작은 점 잡음 제거
        using Mat element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(3, 3));
        Cv2.MorphologyEx(bin, bin, MorphTypes.Open, element);

        // 4) 바깥 윤곽선만 찾아 면적으로 걸러 냅니다 (구멍은 세지 않음).
        Cv2.FindContours(bin, out Point[][] contours, out _,
                         RetrievalModes.External, ContourApproximationModes.ApproxSimple);

        var found = new List<(Rect Rect, double Area, Point Center)>();
        foreach (Point[] contour in contours)
        {
            double area = Cv2.ContourArea(contour);
            if (area < MinArea)
                continue;
            Rect rect = Cv2.BoundingRect(contour);
            found.Add((rect, area, new Point(rect.X + rect.Width / 2, rect.Y + rect.Height / 2)));
        }

        // 번호를 위 → 아래, 왼쪽 → 오른쪽 순서로 붙이기 위해 정렬 (같은 줄은 60 px 로 묶음)
        found.Sort((a, b) =>
        {
            int rowA = a.Center.Y / 60, rowB = b.Center.Y / 60;
            return rowA != rowB ? rowA.CompareTo(rowB) : a.Center.X.CompareTo(b.Center.X);
        });

        // 5) 오버레이에 번호 · 사각형 그리기
        Mat overlay = MatHelper.ToBgr(image);
        var items = new List<InspectionItem>();
        for (int i = 0; i < found.Count; i++)
        {
            (Rect rect, double area, Point center) = found[i];
            Cv2.Rectangle(overlay, rect, Scalar.Lime, 2);
            MatHelper.PutLabel(overlay, $"{i + 1}", new Point(rect.X, rect.Y - 6), Scalar.Lime);

            double diameter = 2 * Math.Sqrt(area / Math.PI);   // 등가 원 지름
            items.Add(new InspectionItem(
                $"#{i + 1}",
                $"중심 ({center.X}, {center.Y}) · 면적 {area:F0} px² · 등가지름 {diameter:F1} px"));
        }

        bool isOk = ExpectedCount <= 0 || found.Count == ExpectedCount;
        string summary = ExpectedCount <= 0
            ? $"검출 {found.Count} 개 (기대 개수 미설정)"
            : $"검출 {found.Count} 개 / 기대 {ExpectedCount} 개";

        // 표 맨 위에 요약 두 줄
        items.Insert(0, new InspectionItem("검출 개수", $"{found.Count} 개",
                                           ExpectedCount <= 0 ? "-" : (isOk ? "OK" : "NG")));
        items.Insert(1, new InspectionItem("면적 하한", $"{MinArea} px²"));

        MatHelper.PutJudge(overlay, isOk);
        return new InspectionResult(isOk, summary, overlay, items);
    }
}`;

  const SEC1 = {
    id: 'cs17-1', title: '개수 세기 검사기: 이진화 → 윤곽선 · 연결 요소 → 판정 · 오버레이 · CSV', minutes: 50,
    goals: ['Otsu 이진화 + 배경 밝기 자동 판단으로 부품을 흰색으로 맞출 수 있다', '연결 요소 통계와 면적 필터로 개수를 세고 OK/NG 판정 · 오버레이를 만들 수 있다', '닿아 있는 부품을 거리 변환 + Watershed 로 분리하고, 기준 격자와 대조해 누락 · 휨을 찾을 수 있다'],
    flow: [['도입: 검사 프로그램의 구조', 7], ['개수 세기 파이프라인', 16], ['닿은 부품 · 크기 · 격자 대조', 17], ['CSV 리포트 · 정리', 10]],
    content: [
      { type: 'h', text: '검사 프로그램은 무엇을 하나' },
      { type: 'p', html: '16차시의 스튜디오는 “사람이 보기 좋게 이미지를 바꾸는” 앱이었습니다. 검사 프로그램은 목적이 다릅니다 — <b>판정(OK / NG)과 근거를 남기는 것</b>입니다. 그래서 출력이 이미지 하나가 아니라 <b>네 가지</b>입니다.' },
      { type: 'list', ordered: true, items: [
        '<b>판정</b> (<code>IsOk</code>): 이 제품을 통과시킬지 버릴지',
        '<b>요약</b> (<code>Summary</code>): “부품 13개 (기대 13)” 처럼 사람이 한눈에 읽는 한 줄',
        '<b>오버레이</b> (<code>Overlay</code>): 어디를 보고 그렇게 판정했는지 그린 이미지 (사각형 · 번호 · OK/NG)',
        '<b>항목 표</b> (<code>Items</code>): 항목 · 값 · 판정 — 화면의 <code>DataGrid</code> 와 <b>CSV 리포트</b>가 됩니다'
      ] },
      { type: 'p', html: '이 네 가지를 <code>InspectionResult</code> 클래스 하나에 담고, 모든 검사기가 <code>IInspector</code> 인터페이스(<code>Name</code> · <code>NeedsGolden</code> · <code>Inspect(image, golden)</code>)를 구현합니다. 그러면 화면 코드는 <b>어떤 검사기인지 몰라도</b> 똑같이 처리할 수 있습니다 — 16차시의 <code>FilterPipeline</code> 과 같은 분리 설계입니다.' },
      { type: 'code', title: 'Inspectors/InspectionResult.cs — 공통 결과 · 인터페이스 (Visual Studio 에서 실행)', code: CS_IINSPECTOR, run: false, local: true, file: 'InspectionResult.cs',
        desc: '<code>IInspector.Inspect(Mat image, Mat? golden)</code> 한 가지 모양으로 세 검사기(개수 · 색 · 결함)를 모두 표현합니다. 결함 검사만 기준 이미지가 필요하므로 <code>NeedsGolden</code> 으로 알려 주고, 화면은 그때만 <b>[골든 열기]</b> 버튼(<code>OpenGoldenButton</code>)을 활성화합니다. <code>MatHelper.PutLabel</code> 은 <b>검은 테두리 + 색 글자</b>를 두 번 그려 배경이 밝든 어둡든 글자가 보이게 하는 흔한 기법이고, <code>MatHelper.PutJudge</code> 는 오버레이 맨 위에 <b>OK(초록) / NG(빨강) 띠</b>를 그립니다. <code>Cv2.PutText</code> 는 한글을 그리지 못하므로 띠에는 영문 OK/NG 만 쓰고, 자세한 한글 요약은 WPF 화면(<code>TextBlock</code> · <code>DataGrid</code>)에 보여 줍니다.' },
      { type: 'h', text: '개수 세기 파이프라인' },
      { type: 'image', src: 'images/washers.png', caption: '검사할 영상 — 백라이트 실루엣: 와셔 6 · 육각너트 4 · 볼트 3 = 13개. 좌상단(W1–W2)과 아래쪽(B3–N4)이 서로 닿아 있다', width: 520 },
      { type: 'figure', html: FIG_COUNT, caption: '그림 1. 개수 세기 검사 파이프라인 — Gray → Otsu(배경 밝기 자동 판단) → Open → 바깥 윤곽선 → 면적 필터 → 판정 → 오버레이' },
      { type: 'p', html: '핵심은 <b>“부품이 흰색”이 되도록 맞추는 것</b>입니다. 07차시에서 배웠듯 <code>ThresholdTypes.Otsu</code> 는 임계값을 자동으로 찾아 주지만 <b>어느 쪽이 물체인지</b>는 알려 주지 않습니다. 백라이트 영상(<code>washers.png</code>)은 배경이 밝고 부품이 어둡고, 정면 조명 영상(<code>coins_parts.png</code>)은 그 반대입니다. 간단한 자동 판단 규칙: <b>Otsu Binary 결과에서 흰 픽셀이 절반을 넘으면 흰색이 배경</b>이므로 <code>BitwiseNot</code> 으로 반전합니다.' },
      { type: 'code', title: '예제 1: CountInspector — 판정 · 오버레이 · 항목 표', code: EX_COUNT,
        desc: '<code>wpf/Ch17_Inspection</code> 의 <code>InspectionResult</code> · <code>IInspector</code> · <code>MatHelper</code> · <code>CountInspector</code> 를 <b>같은 이름 · 같은 기본값(MinArea 300) · 같은 처리 순서</b>로 콘솔에 옮긴 것입니다(블러 5×5 → Otsu → 흰 비율 &gt; 50% 면 <code>BitwiseNot</code> → 열기 3×3 → 바깥 윤곽선 → 면적 필터 → 위→아래 · 왼→오 번호). <code>washers.png</code> 는 부품이 13개인데 결과는 <b>11개</b>로 NG 가 납니다 — 서로 <b>닿아 있는 2쌍</b>(B3–N4, W1–W2)이 한 덩어리로 세어졌기 때문입니다(예제 2에서 해결). 실제 앱의 README 도 이 이미지의 기대 개수를 <b>11</b> 로 두고 “붙은 물체는 watershed 로” 라고 안내합니다. 실제 코드는 번호 정렬에 튜플 목록을 쓰지만 여기서는 번호 목록(<code>order</code>)으로 같은 정렬을 했습니다.',
        expect: '[개수 세기 (Otsu + 윤곽선)] 검출 11 개 / 기대 13 개 -> NG\n  검출 개수 | 11 개 | NG\n  면적 하한 | 300 px² | -\n  #1 | 중심 (132, 92) · 면적 10903 px² · 등가지름 117.8 px | -\n  #2 | 중심 (300, 85) · 면적 3989 px² · 등가지름 71.3 px | -\n  #3 | 중심 (426, 95) · 면적 3676 px² · 등가지름 68.4 px | -\n  #4 | 중심 (560, 100) · 면적 5490 px² · 등가지름 83.6 px | -\n  #5 | 중심 (600, 195) · 면적 4024 px² · 등가지름 71.6 px | -\n  #6 | 중심 (160, 245) · 면적 3630 px² · 등가지름 68.0 px | -\n  #7 | 중심 (340, 240) · 면적 3623 px² · 등가지름 67.9 px | -\n  #8 | 중심 (501, 245) · 면적 3631 px² · 등가지름 68.0 px | -\n  #9 | 중심 (80, 400) · 면적 3956 px² · 등가지름 71.0 px | -\n  #10 | 중심 (215, 390) · 면적 3649 px² · 등가지름 68.2 px | -\n  #11 | 중심 (436, 400) · 면적 7341 px² · 등가지름 96.7 px | -' },
      { type: 'callout', kind: 'more', title: '연결 요소(ConnectedComponentsWithStats)로 세어도 같다', html: '실제 <code>CountInspector</code> 는 <code>FindContours(RetrievalModes.External)</code> 로 <b>바깥 윤곽선</b>을 셉니다 — 구멍(와셔 안쪽)을 세지 않고 <code>BoundingRect</code> 를 바로 얻을 수 있기 때문입니다. <code>Cv2.ConnectedComponentsWithStats</code> 로 세어도 결과는 11개로 같습니다(아래 예제 3 · 4 가 이 방식). 이때 <code>stats</code> 는 한 행이 하나의 성분이고 열은 <b>0=left, 1=top, 2=width, 3=height, 4=area</b>, <code>centroids</code> 는 <code>double</code> 2열(x, y)입니다. 윤곽선 방식은 <b>모양(둘레 · 원형도 · 외접원)</b>까지 이어서 쓰기 좋고, 연결 요소 방식은 <b>면적 · 중심</b>만 필요할 때 빠르고 간단합니다.' },
      { type: 'callout', kind: 'warn', title: '자동 판단이 틀리는 경우 — connector_pins.png', html: '<code>connector_pins.png</code> 는 <b>밝은 배경</b> 위에 <b>검은 하우징</b>이 있고 그 안에 <b>밝은 핀</b>이 있습니다. 흰 픽셀 비율이 78% 라서 자동 판단은 “배경이 밝다 → 반전” 을 고르지만, 그러면 <b>하우징 하나만</b> 검출됩니다. 우리 <code>CountInspector</code> 는 자동 판단만 있으므로 이 영상에는 맞지 않습니다(예제 4 는 그래서 <code>Binary</code> 를 고정해 따로 처리합니다). 현장 검사기는 보통 <b>수동 지정(밝은 물체 / 어두운 물체)</b> 옵션을 둡니다 — <code>CountInspector</code> 에 <code>bool? ObjectIsBright</code> 같은 속성을 추가해 보는 것이 좋은 확장 과제입니다. 자동은 편리한 기본값이지 정답이 아닙니다 — 현장에서는 <b>조명을 고정</b>하고 극성도 고정합니다.' },
      { type: 'h', text: '닿아 있는 부품 분리: 거리 변환 + Watershed' },
      { type: 'p', html: '두 부품이 한 픽셀이라도 붙으면 연결 요소는 하나로 봅니다. 해법은 12차시의 <b>거리 변환(Distance Transform)</b>: 각 흰 픽셀에서 <b>가장 가까운 검은 픽셀까지의 거리</b>를 구하면 부품의 <b>중심이 봉우리</b>가 됩니다. 봉우리만 남기면(예: 최대값의 40% 이상) 부품마다 씨앗 하나가 생기고, 이 씨앗으로 <b>Watershed</b>(물이 씨앗에서 번져 경계에서 만나는 알고리즘)를 돌리면 경계가 그려집니다.' },
      { type: 'callout', kind: 'tip', title: '와셔·너트는 구멍을 먼저 메워야 한다', html: '와셔는 <b>도넛 모양</b>이라 거리 변환의 최대값이 “링의 두께 ÷ 2”(약 12px)밖에 안 됩니다. 그러면 봉우리가 링을 따라 여러 개 생기거나 너무 작아 분리에 실패합니다. <code>FindContoursAsArray(..., RetrievalModes.External)</code> 로 <b>바깥 윤곽만</b> 찾아 <code>DrawContours(..., -1, 흰색, -1)</code> 로 <b>채우면</b> 구멍이 메워져 거리 변환 최대값이 41.7px(가장 큰 와셔의 반지름)가 되고 분리가 깔끔해집니다.' },
      { type: 'code', title: '예제 2: 닿은 부품 분리 (11개 → 13개)', code: EX_WATERSHED,
        desc: '마커 규칙이 중요합니다: <b>1 = 확실한 배경</b>, <b>2 이상 = 각 씨앗</b>, <b>0 = 모르는 영역</b>(물이 채울 곳). <code>Cv2.Add(markers, 1)</code> 한 번으로 “배경 0 → 1, 씨앗 1.. → 2..” 가 되고, <code>markers.SetTo(0, unknown)</code> 으로 부품이지만 씨앗이 아닌 영역을 0 으로 만듭니다. Watershed 뒤에는 <code>Cv2.Compare(markers, k, mask, CmpType.EQ)</code> 로 라벨별 마스크를 얻어 면적 · 경계 상자를 구합니다(픽셀 하나씩 도는 이중 반복보다 훨씬 빠릅니다).',
        expect: '그냥 세면: 11 개 (닿아 있는 부품이 하나로 합쳐짐)\n거리 변환 최대값: 41.7 px (가장 굵은 부품의 반지름)\n씨앗(봉우리) 개수: 13\nWatershed 로 분리한 개수: 13 개 -> 기대 13개와 일치 OK' },
      { type: 'code', title: '예제 3: 크기별 선별 (S · M · L)', code: EX_SIZE,
        desc: '면적에서 <b>등가 반지름</b> r = √(A/π) 을 구하면 크기 분류가 아주 간단해집니다. <code>coins_parts.png</code> 의 정답은 L(r=34px, Ø6.8mm) 3개 · M(r=27px, Ø5.4mm) 4개 · S(r=20px, Ø4.0mm) 5개이고, 경계값을 24 · 30 으로 두면 깔끔하게 나뉩니다. 배율 <b>0.1 mm/px</b> 를 곱해 <b>mm 단위</b>로 보고하는 것이 현장 방식입니다.',
        expect: 'Otsu 임계값 105, 부품 12 개\n크기별: S 5 개 · M 4 개 · L 3 개\n  L r=33.9px (지름 6.8mm)\n  L r=33.9px (지름 6.8mm)\n  L r=33.9px (지름 6.8mm)\n  M r=26.9px (지름 5.4mm)\n  M r=26.9px (지름 5.4mm)\n  M r=27.0px (지름 5.4mm)\n  M r=27.0px (지름 5.4mm)\n  S r=19.9px (지름 4.0mm)\n  S r=19.9px (지름 4.0mm)\n  S r=20.0px (지름 4.0mm)\n  S r=20.0px (지름 4.0mm)\n  S r=20.0px (지름 4.0mm)\n판정: OK (S5 M4 L3)' },
      { type: 'h', text: '기준 격자와 대조: 누락 · 휨 찾기' },
      { type: 'p', html: '커넥터 핀처럼 <b>위치가 정해져 있는</b> 부품은 “몇 개인가” 보다 “<b>어디가</b> 비었는가”가 중요합니다. 방법은 간단합니다: 공칭(설계) 위치마다 <b>가장 가까운 블롭 중심까지의 거리</b>를 구해 임계값으로 판정합니다.' },
      { type: 'figure', html: FIG_GRID, caption: '그림 2. 공칭 격자 x = 100 + 40·i 와 검출 중심 비교 — i=4 휨, i=8 누락' },
      { type: 'code', title: '예제 4: 커넥터 핀 12개 검사 (누락 1 · 휨 1)', code: EX_PINS,
        desc: '<code>connector_pins.png</code> 의 정답은 핀 피치 40px(2.54mm), <b>i=4 가 (+3.5, +9.0)px 휨</b>, <b>i=8 이 누락</b>입니다. 자동 극성 판단을 쓰지 않고 <code>ThresholdTypes.Binary</code> 를 고정한 점과, <b>면적 100~2000</b> 으로 큰 배경 덩어리를 버린 점이 요령입니다. 편차 9.7px × 0.0635mm/px ≈ <b>0.62mm</b> 로 보고하면 바로 공차 판정에 쓸 수 있습니다.',
        expect: 'Otsu 임계값 71, 핀 크기 블롭 11 개 / 자리 12개\n  핀  0 공칭 x=100 : 편차 0.1 px -> OK\n  핀  1 공칭 x=140 : 편차 0.1 px -> OK\n  핀  2 공칭 x=180 : 편차 0.0 px -> OK\n  핀  3 공칭 x=220 : 편차 0.0 px -> OK\n  핀  4 공칭 x=260 : 편차 9.7 px -> 휨 (NG)\n  핀  5 공칭 x=300 : 편차 0.0 px -> OK\n  핀  6 공칭 x=340 : 편차 0.0 px -> OK\n  핀  7 공칭 x=380 : 편차 0.0 px -> OK\n  핀  8 공칭 x=420 : 편차 39.9 px -> 누락 (NG)\n  핀  9 공칭 x=460 : 편차 0.1 px -> OK\n  핀 10 공칭 x=500 : 편차 0.1 px -> OK\n  핀 11 공칭 x=540 : 편차 0.1 px -> OK\n불량 2 개 -> 전체 판정 NG' },
      { type: 'h', text: '결과를 남기기: CSV 리포트' },
      { type: 'code', title: '예제 5: 검사 결과를 CSV 로 저장하기', code: EX_CSV,
        desc: '<code>StringBuilder</code> 로 문자열을 만들고 <code>File.WriteAllText("out/report.csv", …)</code> 로 한 번에 씁니다(한 줄씩 파일을 열고 닫으면 매우 느립니다). 저장한 파일은 왼쪽 <b>📁 작업 폴더</b>에서 내려받아 Excel 로 열 수 있습니다. 실무에서는 파일명에 <b>날짜 · 로트 번호</b>를 넣고(<code>report_20260926_A2309-117.csv</code>) 헤더를 고정합니다.',
        expect: '검사 12 건, 불량 0 건 -> out/report.csv 저장\nCSV 14 줄\n  no,cx,cy,area,radius_px,dia_mm,class,judge\n  1,194.0,53.6,1244,19.9,3.98,S,OK\n  2,340.7,67.7,1252,20.0,3.99,S,OK\n  3,480.7,95.8,1254,20.0,4.00,S,OK\n  ...\n  total,12,,,,,,OK' },
      { type: 'callout', kind: 'field', title: '현장에서는', html: '<ul><li><b>면적 필터의 하한</b>은 잡음 제거용, <b>상한</b>은 “두 개가 붙은 덩어리”를 골라내는 용도로도 씁니다 — 면적이 기대값의 1.8배 이상이면 “붙음 의심” 으로 따로 보고합니다.</li><li><b>판정 이력</b>은 반드시 남깁니다: 시간 · 로트 · 판정 · 측정값 · 이미지 파일명. CSV 또는 DB, 그리고 NG 이미지는 별도 폴더에 저장합니다.</li><li><b>조명이 먼저</b>입니다. 백라이트로 실루엣을 만들면(washers) 이진화가 거의 실패하지 않습니다. 알고리즘으로 조명 문제를 해결하려 하면 파라미터가 계속 늘어납니다.</li></ul>' },
      { type: 'code', title: 'Inspectors/CountInspector.cs — IInspector 구현 (Visual Studio 에서 실행)', code: CS_COUNTINSPECTOR, run: false, local: true, file: 'CountInspector.cs',
        desc: '브라우저 예제 1 의 원본입니다. 속성은 <code>MinArea</code>(기본 300) 와 <code>ExpectedCount</code>(0 이면 개수 판정 안 함) 두 개이고, 화면의 파라미터 슬라이더 · [기대 개수] 칸이 이 두 속성에 들어갑니다. C# 최신 문법이 보입니다: <code>out _</code>(버리는 out 변수), <code>List&lt;(Rect Rect, double Area, Point Center)&gt;</code>(이름 있는 튜플)와 형식을 적은 튜플 분해 <code>(Rect rect, double area, Point center) = found[i];</code> (<code>var (rect, area, center) = found[i];</code> 와 같은 뜻). 닿은 부품 분리(Watershed)는 이 검사기에 넣지 않았습니다 — 예제 2 의 코드를 <code>Inspect</code> 안에 옵션으로 추가해 보는 것이 좋은 확장 과제입니다.' },
      { type: 'wpf', title: 'Ch17_Inspection 프로젝트', project: 'Ch17_Inspection', html: '검사 앱은 16차시 스튜디오와 같은 구조입니다: <b>위</b> <code>ToolBar</code>(검사 선택 <code>InspectorCombo</code> · [이미지 열기] · [골든 열기] · <b>[검사 실행]</b> · 파라미터 <code>ParamSlider</code> · [기대 개수] <code>ExpectedCountBox</code> · [오버레이 저장] · [결과 CSV 저장]), <b>왼쪽</b> 검사 이미지(<code>SourceImage</code>), <b>가운데</b> 오버레이(<code>OverlayImage</code>), <b>오른쪽</b> 판정 상자(<code>JudgeBorder</code> · <code>JudgeText</code> · <code>SummaryText</code>) · 누적 통계(<code>StatsText</code>) · 결과 표(<code>ResultGrid</code> ← <code>InspectionResult.Items</code>), <b>아래</b> <code>StatusBar</code>. 처리 클래스는 <code>Inspectors/</code> 폴더의 <code>CountInspector</code> · <code>ColorSortInspector</code> · <code>DefectInspector</code> 입니다.<br>해 보기: 검사 “개수 세기” → [이미지 열기] <code>images/washers.png</code> → 기대 개수 <b>11</b> 이면 OK, <b>13</b> 이면 NG. <code>images/coins_parts.png</code> 는 기대 12 → OK.' }
    ],
    practice: [
      {
        title: '기대 개수를 바꿔 OK/NG 판정 확인하기', level: 1,
        desc: '<code>images/coins_parts.png</code> 에 개수 세기 검사를 하고 <b>기대 개수 12</b> 와 <b>기대 개수 10</b> 두 가지로 판정 결과를 출력하세요. 면적 필터 하한을 300 → 2000 으로 올리면 개수가 어떻게 바뀌는지도 확인하세요.',
        hint: '<code>Cv2.ConnectedComponentsWithStats</code> 후 <code>stats.At&lt;int&gt;(i, 4)</code> 가 면적입니다. 하한 2000 이면 작은 S 부품(면적 약 1250)이 빠집니다.',
        expect: '면적 300 이상: 12 개\n기대 12 -> OK\n기대 10 -> NG\n면적 2000 이상: 7 개 (작은 부품이 빠진다)',
        starter: `using System;
using OpenCvSharp;

class Program
{
    static int Count(Mat bin, int minArea)
    {
        using var labels = new Mat();
        using var stats = new Mat();
        using var cents = new Mat();
        int n = Cv2.ConnectedComponentsWithStats(bin, labels, stats, cents);
        int found = 0;
        // TODO: 면적이 minArea 이상인 성분만 세어 found 에 담으세요 (i = 1 부터, 0 은 배경)
        return found;
    }

    static void Main()
    {
        using var gray = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);

        int c1 = Count(bin, 300);
        Console.WriteLine($"면적 300 이상: {c1} 개");
        // TODO: 기대 12 와 기대 10 으로 각각 OK/NG 를 출력하세요

        int c2 = Count(bin, 2000);
        Console.WriteLine($"면적 2000 이상: {c2} 개 (작은 부품이 빠진다)");
        Cv2.ImShow("bin", bin);
        Cv2.WaitKey(0);
    }
}`,
        solution: `using System;
using OpenCvSharp;

class Program
{
    static int Count(Mat bin, int minArea)
    {
        using var labels = new Mat();
        using var stats = new Mat();
        using var cents = new Mat();
        int n = Cv2.ConnectedComponentsWithStats(bin, labels, stats, cents);
        int found = 0;
        for (int i = 1; i < n; i++)
            if (stats.At<int>(i, 4) >= minArea) found++;
        return found;
    }

    static void Main()
    {
        using var gray = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);

        int c1 = Count(bin, 300);
        Console.WriteLine($"면적 300 이상: {c1} 개");
        Console.WriteLine($"기대 12 -> {(c1 == 12 ? "OK" : "NG")}");
        Console.WriteLine($"기대 10 -> {(c1 == 10 ? "OK" : "NG")}");

        int c2 = Count(bin, 2000);
        Console.WriteLine($"면적 2000 이상: {c2} 개 (작은 부품이 빠진다)");
        Cv2.ImShow("bin", bin);
        Cv2.WaitKey(0);
    }
}`
      },
      {
        title: '구멍 개수로 부품 종류 나누기', level: 3,
        desc: '<code>images/washers.png</code> 에서 <b>구멍이 있는 부품(와셔 · 너트)</b>과 <b>구멍이 없는 부품(볼트)</b>을 나누세요. <code>Cv2.FindContours</code> 를 <code>RetrievalModes.CComp</code> 로 부르면 계층(<code>HierarchyIndex</code>)을 얻습니다. <b>부모가 없는 윤곽(외곽)</b>마다 <b>자식(구멍)</b>이 있는지 확인하면 됩니다.',
        hint: '<code>Cv2.FindContours(bin, out Point[][] contours, out HierarchyIndex[] hier, RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);</code> → <code>hier[i].Parent &lt; 0</code> 이면 외곽, <code>hier[i].Child &gt;= 0</code> 이면 구멍이 있습니다. 면적 500 미만은 무시하세요. 닿은 부품 때문에 외곽은 11개입니다.',
        expect: '윤곽선 21 개 (외곽 + 구멍)\n구멍 있는 부품 9 개, 구멍 없는 부품 2 개',
        starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);

        Cv2.FindContours(bin, out Point[][] contours, out HierarchyIndex[] hier,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"윤곽선 {contours.Length} 개 (외곽 + 구멍)");

        int withHole = 0, noHole = 0;
        // TODO: hier[i].Parent < 0 인 외곽만 보고, 면적 500 이상일 때
        //       hier[i].Child >= 0 이면 withHole, 아니면 noHole 을 세세요

        Console.WriteLine($"구멍 있는 부품 {withHole} 개, 구멍 없는 부품 {noHole} 개");
        Cv2.ImShow("bin", bin);
        Cv2.WaitKey(0);
    }
}`,
        solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);

        Cv2.FindContours(bin, out Point[][] contours, out HierarchyIndex[] hier,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"윤곽선 {contours.Length} 개 (외곽 + 구멍)");

        using var overlay = new Mat();
        Cv2.CvtColor(gray, overlay, ColorConversionCodes.GRAY2BGR);

        int withHole = 0, noHole = 0;
        for (int i = 0; i < contours.Length; i++)
        {
            if (hier[i].Parent >= 0) continue;                 // 구멍(자식)은 건너뛴다
            double area = Cv2.ContourArea(contours[i]);
            if (area < 500) continue;
            bool hasHole = hier[i].Child >= 0;
            if (hasHole) withHole++; else noHole++;
            Rect box = Cv2.BoundingRect(contours[i]);
            Cv2.Rectangle(overlay, box, hasHole ? new Scalar(0, 200, 0) : new Scalar(0, 0, 255), 2);
            Cv2.PutText(overlay, hasHole ? "H" : "B", new Point(box.X + 3, box.Y + 18),
                        HersheyFonts.HersheySimplex, 0.6, hasHole ? new Scalar(0, 200, 0) : new Scalar(0, 0, 255), 2);
        }

        Console.WriteLine($"구멍 있는 부품 {withHole} 개, 구멍 없는 부품 {noHole} 개");
        Cv2.ImShow("holes", overlay);
        Cv2.WaitKey(0);
    }
}`
      }
    ],
    quiz: [
      { q: 'Otsu 이진화만으로는 알 수 없는 것은?', options: ['임계값', '<b>어느 쪽이 물체인지</b>(밝은 쪽 / 어두운 쪽)', '영상의 크기', '히스토그램의 모양'], answer: 1,
        explain: 'Otsu 는 두 덩어리를 가장 잘 나누는 임계값만 찾습니다. 물체가 밝은지 어두운지는 <b>조명 방식</b>에 달려 있으므로 따로 정해야 합니다 — 흰 픽셀 비율로 자동 추정하거나, 현장처럼 <b>조명을 고정하고 수동 지정</b>합니다.' },
      { q: '<code>ConnectedComponentsWithStats</code> 의 <code>stats</code> 에서 <b>면적</b>이 들어 있는 열은?', options: ['0', '2', '4', '5'], answer: 2,
        explain: '열 순서는 <b>0=left, 1=top, 2=width, 3=height, 4=area</b> 입니다. 외우기 싫으면 OpenCvSharp 의 <code>Cv2.ConnectedComponentsEx(bin)</code> 를 써서 <code>Blob.Area</code> · <code>Blob.Rect</code> · <code>Blob.Centroid</code> 로 받으세요.' },
      { q: '<code>washers.png</code> 의 부품 13개가 연결 요소로는 11개로 세어지는 이유는?', options: ['이미지가 작아서', '두 쌍이 서로 <b>닿아 있어</b> 하나의 성분이 되기 때문', '구멍이 있어서', 'Otsu 임계값이 잘못되어서'], answer: 1,
        explain: 'B3–N4, W1–W2 두 쌍이 접촉해 있습니다. <b>거리 변환 + Watershed</b> 로 분리하면 13개가 됩니다. 접촉은 실제 라인에서 가장 흔한 문제이고, 근본 해법은 <b>부품을 떨어뜨려 공급하는 것</b>입니다.' },
      { q: '와셔(도넛 모양)를 거리 변환으로 분리할 때 먼저 해야 하는 일은?', options: ['가우시안 블러', '<b>구멍 메우기</b>(외곽 윤곽만 찾아 채우기)', '컬러로 변환', '히스토그램 평활화'], answer: 1,
        explain: '링 모양은 거리 변환 최대값이 “링 두께의 절반”밖에 안 되어 봉우리가 부품 중심에 생기지 않습니다. <code>RetrievalModes.External</code> 로 바깥 윤곽만 찾아 <code>DrawContours(..., -1)</code> 로 채우면 최대값이 41.7px 로 커져 분리가 잘 됩니다.' },
      { q: '커넥터 핀의 <b>누락</b> 과 <b>휨</b> 을 구분하는 기준은?', options: ['블롭의 면적', '공칭 위치에서 <b>가장 가까운 블롭까지의 거리</b>(작으면 휨, 아주 크면 누락)', '블롭의 밝기', '윤곽선의 개수'], answer: 1,
        explain: '거리 ≤ 5px 이면 OK, 5~20px 이면 자리에는 있으나 벗어남(휨), 20px 초과면 그 자리에 핀이 없음(누락)입니다. <code>connector_pins.png</code> 의 정답은 i=4 휨(9.7px), i=8 누락(39.9px)입니다.' }
    ],
    slides: [
      { layout: 'title', title: '실전 검사 프로젝트', subtitle: '1교시 — 개수 세기: 이진화 → 연결 요소 → 판정 · 오버레이 · CSV', notes: '<p>강좌의 마지막 차시입니다. 💬 “16차시 앱과 검사 앱의 가장 큰 차이는?” — 검사는 <b>판정과 근거</b>를 남긴다. 이번 차시는 지금까지 배운 것을 모두 쓰는 종합 실습이라고 알려 줍니다. (3분)</p>' },
      { layout: 'bullets', title: '검사 결과는 네 가지', lead: 'InspectionResult 하나에 담는다', bullets: [
        '<b>IsOk</b> — 통과 / 불량',
        '<b>Summary</b> — “부품 13개 (기대 13)” 한 줄 요약',
        '<b>Overlay</b> — 근거를 그린 이미지 (사각형 · 번호 · OK/NG)',
        '<b>Items</b> — 항목 · 값 · 판정 → DataGrid 와 CSV',
        ['공통 인터페이스 <code>IInspector</code>', ['<code>Name</code> · <code>NeedsGolden</code> · <code>Inspect(image, golden)</code>', '화면은 어떤 검사기인지 몰라도 된다']]
      ], notes: '<p>“근거 없는 판정은 쓸 수 없다” 를 강조하세요 — 현장에서 NG 가 나면 반드시 사람이 확인하므로 오버레이가 필수입니다. 16차시의 <code>FilterPipeline</code> 분리와 같은 발상임을 연결해 줍니다. (4분)</p>' },
      { layout: 'diagram', title: '개수 세기 파이프라인', html: FIG_COUNT, caption: 'Gray → Otsu(배경 밝기 판단) → Open → 바깥 윤곽선 → 면적 필터 → 판정 → 오버레이', notes: '<p>각 단계가 어느 차시에서 배운 것인지 짚어 주면 좋습니다: Gray(05) · Otsu(07) · Open(09) · 윤곽선(12). 💬 “Open 을 왜 넣나?” — 잡점 하나가 부품 하나로 세어지는 것을 막는다(면적 필터와 이중 방어). (4분)</p>' },
      { layout: 'code', title: '① 이진화 + 배경 밝기 자동 판단 (CountInspector)', file: 'CountInspector.cs', code: `// 1) 흑백 + 블러 — 잡음이 윤곽선 개수를 늘리는 것을 막는다
using Mat gray = MatHelper.ToGray(image);
using var blurred = new Mat();
Cv2.GaussianBlur(gray, blurred, new Size(5, 5), 0);

// 2) Otsu 이진화 + 밝기 방향 자동 판단
using var bin = new Mat();
Cv2.Threshold(blurred, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
double whiteRatio = Cv2.CountNonZero(bin) / (double)(bin.Rows * bin.Cols);
if (whiteRatio > 0.5)
    Cv2.BitwiseNot(bin, bin);   // 흰 부분이 절반을 넘으면 그것은 배경이다 → 반전

// 3) 모폴로지 열기로 작은 점 잡음 제거
using Mat element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(3, 3));
Cv2.MorphologyEx(bin, bin, MorphTypes.Open, element);`, run: false, points: ['Otsu 는 <b>임계값</b>만 알려 준다 — 극성은 따로', 'washers 0.849 → 반전 · coins_parts 0.085 → 그대로', '<code>Open</code> = 침식 후 팽창 (작은 흰 점 제거)'], notes: '<p>두 이미지의 흰 비율(0.849 / 0.085)을 칠판에 적어 규칙이 작동하는 것을 보여 주세요. 곧 이 규칙이 실패하는 예(connector_pins 0.780)를 보여 줄 것이라고 예고합니다. (5분)</p>' },
      { layout: 'code', title: '② 윤곽선 + 면적 필터 + 판정 (CountInspector)', file: 'CountInspector.cs', code: `// 4) 바깥 윤곽선만 찾아 면적으로 걸러 낸다 (구멍은 세지 않음)
Cv2.FindContours(bin, out Point[][] contours, out _,
                 RetrievalModes.External, ContourApproximationModes.ApproxSimple);

var found = new List<(Rect Rect, double Area, Point Center)>();
foreach (Point[] contour in contours)
{
    double area = Cv2.ContourArea(contour);
    if (area < MinArea)                       // 기본 300 px²
        continue;
    Rect rect = Cv2.BoundingRect(contour);
    found.Add((rect, area, new Point(rect.X + rect.Width / 2, rect.Y + rect.Height / 2)));
}

// 5) 오버레이: 사각형 · 번호, 맨 위에 OK/NG 띠
Mat overlay = MatHelper.ToBgr(image);
for (int i = 0; i < found.Count; i++)
{
    Cv2.Rectangle(overlay, found[i].Rect, Scalar.Lime, 2);
    MatHelper.PutLabel(overlay, $"{i + 1}", new Point(found[i].Rect.X, found[i].Rect.Y - 6), Scalar.Lime);
}
bool isOk = ExpectedCount <= 0 || found.Count == ExpectedCount;
MatHelper.PutJudge(overlay, isOk);`, run: false, points: ['<code>External</code> = 바깥 윤곽만 → 와셔 구멍을 세지 않는다', '<code>ExpectedCount</code> 0 이면 개수 판정 생략', '<code>PutJudge</code> = OK 초록 / NG 빨강 띠 (한글 불가 → 영문)'], notes: '<p>실제 <code>wpf/Ch17_Inspection/Inspectors/CountInspector.cs</code> 의 발췌입니다(번호 정렬 부분 생략). 학생들이 브라우저 예제 1 을 실행합니다. 결과가 <b>11 / 기대 13 → NG</b> 인 것을 확인하고 “왜?” 로 다음 주제(접촉 분리)로 넘어갑니다. <code>ConnectedComponentsWithStats</code> 로 세어도 11개로 같다는 것도 짚어 줍니다(stats 열 4 = 면적). (5분)</p>' },
      { layout: 'image', title: 'washers.png — 부품 13개, 그런데 11개', src: 'images/washers.png', caption: '백라이트 실루엣: 와셔 6 · 육각너트 4 · 볼트 3. 좌상단(W1–W2)과 하단(B3–N4)이 닿아 있다', notes: '<p>이미지를 크게 띄우고 학생들에게 닿은 쌍을 찾아보게 합니다(좌상단 와셔 2개, 아래쪽 볼트+너트). 💬 “현장이라면 이 문제를 어떻게 해결할까?” — 부품을 떨어뜨려 공급(근본책), 알고리즘으로 분리(차선책). (3분)</p>' },
      { layout: 'code', title: '③ 거리 변환으로 씨앗 만들기', code: `// 와셔·너트는 구멍이 있으므로 먼저 메운다 (외곽 윤곽만 찾아 채우기)
Point[][] outer = Cv2.FindContoursAsArray(bin, RetrievalModes.External,
                                          ContourApproximationModes.ApproxSimple);
var solid = new Mat(bin.Size(), MatType.CV_8UC1, Scalar.All(0));
Cv2.DrawContours(solid, outer, -1, Scalar.All(255), -1);   // 두께 -1 = 채우기

// 각 흰 픽셀에서 가장 가까운 검은 픽셀까지의 거리 → 부품 중심이 봉우리
using var dist = new Mat();
Cv2.DistanceTransform(solid, dist, DistanceTypes.L2, DistanceTransformMasks.Mask5);
Cv2.MinMaxLoc(dist, out double dmin, out double dmax);     // dmax = 41.7 px

// 봉우리만 남기면 부품마다 씨앗 하나
using var peaks = new Mat();
Cv2.Threshold(dist, peaks, 0.4 * dmax, 255, ThresholdTypes.Binary);
using var seeds = new Mat();
peaks.ConvertTo(seeds, MatType.CV_8UC1);
int n = Cv2.ConnectedComponents(seeds, labels);             // 13개`, run: false, points: ['구멍을 메우지 않으면 dmax 가 19px 로 작아 분리 실패', '계수 0.4 가 적당 (0.3~0.4 에서 13개)', '씨앗 개수 = 분리될 부품 개수'], notes: '<p>계수를 0.25 · 0.45 로 바꾸면 14개 · 10개가 나오는 것을 실제로 보여 주면 “파라미터 민감도” 를 체감합니다. 💬 “왜 구멍을 메워야 하나?” — 링은 두께의 절반이 최대값. (6분)</p>' },
      { layout: 'code', title: '④ 마커 → Watershed → 라벨별 측정', code: `using var markers = new Mat();
labels.ConvertTo(markers, MatType.CV_32SC1);
Cv2.Add(markers, new Scalar(1), markers);        // 배경 0 -> 1, 씨앗 1.. -> 2..
using var unknown = new Mat();
Cv2.Subtract(solid, seeds, unknown);             // 부품이지만 씨앗은 아닌 곳
markers.SetTo(new Scalar(0), unknown);           // 0 = 물이 채울 영역

using var color = new Mat();
Cv2.CvtColor(gray, color, ColorConversionCodes.GRAY2BGR);
Cv2.Watershed(color, markers);                   // 경계는 -1 로 표시된다

using var mask = new Mat();
for (int k = 2; k <= n; k++)
{
    Cv2.Compare(markers, k, mask, CmpType.EQ);   // 라벨 k 만 흰색
    int area = Cv2.CountNonZero(mask);
    Rect box = Cv2.BoundingRect(mask);
}`, run: false, points: ['마커 규칙: <b>1=배경, 2..=씨앗, 0=모름</b>', '<code>Compare(..., CmpType.EQ)</code> 로 라벨별 마스크 (빠름)', '결과: 11개 → <b>13개</b> OK'], notes: '<p>마커 규칙 세 가지를 반드시 칠판에 적으세요 — 여기서 틀리면 결과가 엉망이 됩니다. 픽셀 이중 반복 대신 <code>Compare</code> 를 쓰는 이유(속도)도 강조. (5분)</p>' },
      { layout: 'two', title: '크기 선별과 격자 대조', left: { title: '크기 선별 (coins_parts)', bullets: ['등가 반지름 r = √(A/π)', 'r ≥ 30 → L, ≥ 24 → M, 그 외 S', '정답: S 5 · M 4 · L 3 (합 12)', '× 0.1 mm/px → Ø4.0 / 5.4 / 6.8 mm'] }, right: { title: '격자 대조 (connector_pins)', bullets: ['공칭 x = 100 + 40·i, y = 240', '가장 가까운 블롭까지 거리로 판정', '≤5 OK / ≤20 휨 / >20 누락', '정답: i=4 휨(9.7px), i=8 누락(39.9px)'] }, notes: '<p>“개수만 세는 검사”와 “위치를 보는 검사”의 차이를 정리합니다. 후자는 <b>설계 도면의 좌표</b>가 있어야 하고, 그래서 현장에서는 카메라를 고정하고 정렬 마크(14차시)로 좌표를 맞춥니다. (4분)</p>' },
      { layout: 'code', title: 'CSV 리포트', code: `var csv = new StringBuilder();
csv.Append("no,cx,cy,area,radius_px,dia_mm,class,judge\\n");

int no = 0, ng = 0;
for (int i = 1; i < n; i++)
{
    int area = stats.At<int>(i, 4);
    if (area < 300) continue;
    no++;
    double r = Math.Sqrt(area / Math.PI);
    double dia = 2 * r * 0.1;                        // 0.1 mm/px
    string judge = dia >= 3.5 && dia <= 7.5 ? "OK" : "NG";
    if (judge == "NG") ng++;
    csv.Append($"{no},{area},{r:F1},{dia:F2},{judge}\\n");
}
File.WriteAllText("out/report.csv", csv.ToString());`, run: false, points: ['<code>StringBuilder</code> 로 모아서 <b>한 번에</b> 쓴다', '📁 작업 폴더에서 내려받아 Excel 로 열기', '실무: 파일명에 날짜 · 로트 번호'], notes: '<p>💬 “왜 한 줄씩 파일에 쓰지 않나?” — 파일 열기/닫기 비용이 커서 수천 건에서 느려진다. 실제 장비는 하루 수만 건을 기록합니다. (3분)</p>' },
      { layout: 'quiz', title: '확인 퀴즈', q: '<code>stats</code> 에서 면적이 들어 있는 열 번호는?', options: ['0', '2', '4', '5'], answer: 2, explain: '0=left, 1=top, 2=width, 3=height, <b>4=area</b>. 외우기 싫으면 <code>Cv2.ConnectedComponentsEx</code> 의 <code>Blob.Area</code>.', notes: '<p>정답 3번(값 4). 이어서 “중심 좌표는 어디에?” — <code>centroids</code> Mat 의 (i,0), (i,1), 자료형은 <code>double</code>. (2분)</p>' },
      { layout: 'practice', title: '실습: 구멍 개수로 부품 종류 나누기', desc: '<p><code>washers.png</code> 에서 <b>구멍 있는 부품</b>(와셔 · 너트)과 <b>없는 부품</b>(볼트)을 나누세요.</p><ul><li><code>RetrievalModes.CComp</code> 로 계층 얻기</li><li><code>hier[i].Parent &lt; 0</code> → 외곽, <code>hier[i].Child &gt;= 0</code> → 구멍 있음</li><li>면적 500 미만은 무시</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Cv2.FindContours(bin, out Point[][] contours, out HierarchyIndex[] hier,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        int withHole = 0, noHole = 0;
        for (int i = 0; i < contours.Length; i++)
        {
            if (hier[i].Parent >= 0) continue;
            // TODO: 면적 500 이상일 때 hier[i].Child >= 0 이면 withHole, 아니면 noHole
        }
        Console.WriteLine($"구멍 있음 {withHole} · 없음 {noHole}");
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Cv2.FindContours(bin, out Point[][] contours, out HierarchyIndex[] hier,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        int withHole = 0, noHole = 0;
        for (int i = 0; i < contours.Length; i++)
        {
            if (hier[i].Parent >= 0) continue;
            if (Cv2.ContourArea(contours[i]) < 500) continue;
            if (hier[i].Child >= 0) withHole++; else noHole++;
        }
        Console.WriteLine($"구멍 있음 {withHole} · 없음 {noHole}");
    }
}`, notes: '<p>정답: 구멍 있는 부품 9개 · 없는 부품 2개(외곽이 11개이므로 합이 11). 닿은 쌍 때문에 와셔+와셔가 하나가 되고, 볼트+너트 덩어리는 구멍이 있어 “구멍 있음” 으로 분류됩니다 — 이 점을 학생과 함께 해석하면 계층 구조 이해가 깊어집니다. (10분)</p>' },
      { layout: 'summary', title: '1교시 정리', bullets: [
        '검사 결과 = <b>판정 + 요약 + 오버레이 + 항목 표</b> (<code>InspectionResult</code>)',
        'Gray → Otsu(극성 판단) → Open → 바깥 윤곽선 → 면적 필터 → 판정',
        '닿은 부품: <b>구멍 메우기 → 거리 변환 → 봉우리 씨앗 → Watershed</b> (11 → 13)',
        '위치가 정해진 부품: <b>공칭 격자와 최근접 거리</b>로 누락 · 휨 판정',
        '결과는 <b>CSV</b> 로 남긴다 (<code>StringBuilder</code> → <code>File.WriteAllText</code>)',
        '다음 시간: 색으로 판정하기 (HSV · 포켓 격자 · 병 라인)'
      ], notes: '<p>파이프라인 6단계를 학생들이 순서대로 말하게 하고 마칩니다. 숙제: 면적 필터의 상한을 이용해 “두 개가 붙은 덩어리” 를 따로 보고하도록 예제 1 을 고쳐 보기. (2분)</p>' }
    ]
  };

  // ───────────────────────────── 2교시 ─────────────────────────────

  // 그림 3: HSV 색상(H) 범위 나누기
  const FIG_HSV = `<svg viewBox="0 0 740 300" role="img" aria-label="OpenCV HSV 의 색상 H 값 0부터 179 까지를 색별 구간으로 나눈 그림">
  <text x="370" y="24" text-anchor="middle" class="tx-b">OpenCV HSV: H 0~179 (일반 색상환 0~359 의 절반), S 0~255, V 0~255</text>
  <rect x="40" y="40" width="660" height="34" rx="4" class="p1s"/>
  <g class="ln" stroke-width="1">
    <line x1="77" y1="40" x2="77" y2="74"/>
    <line x1="114" y1="40" x2="114" y2="74"/>
    <line x1="169" y1="40" x2="169" y2="74"/>
    <line x1="187" y1="40" x2="187" y2="74"/>
    <line x1="352" y1="40" x2="352" y2="74"/>
    <line x1="389" y1="40" x2="389" y2="74"/>
    <line x1="517" y1="40" x2="517" y2="74"/>
    <line x1="664" y1="40" x2="664" y2="74"/>
  </g>
  <g class="tx-m" font-size="11">
    <text x="40" y="90">0</text>
    <text x="110" y="90">10</text>
    <text x="180" y="90">30</text>
    <text x="350" y="90">85</text>
    <text x="512" y="90">130</text>
    <text x="660" y="90">170</text>
    <text x="694" y="90">179</text>
  </g>
  <text x="58" y="62" text-anchor="middle" class="tx">빨강</text>
  <text x="141" y="62" text-anchor="middle" class="tx">주황</text>
  <text x="270" y="62" text-anchor="middle" class="tx">노랑 · 초록</text>
  <text x="453" y="62" text-anchor="middle" class="tx">파랑</text>
  <text x="590" y="62" text-anchor="middle" class="tx">보라 · 자홍</text>
  <text x="682" y="62" text-anchor="middle" class="tx">빨강</text>

  <rect x="40" y="112" width="320" height="94" rx="10" class="p2s"/>
  <text x="200" y="134" text-anchor="middle" class="tx-b">⚠ 빨강은 두 구간</text>
  <text x="200" y="154" text-anchor="middle" class="tx-m">H 0~10 <tspan class="tx-b">과</tspan> H 170~179</text>
  <text x="200" y="174" text-anchor="middle" class="tx-m">InRange 두 번 + BitwiseOr</text>
  <text x="200" y="194" text-anchor="middle" class="tx-m">(색상환이 0 에서 이어지므로)</text>

  <rect x="380" y="112" width="320" height="94" rx="10" class="p3s"/>
  <text x="540" y="134" text-anchor="middle" class="tx-b">⚠ 흰색 · 검정 · 회색은 H 가 무의미</text>
  <text x="540" y="154" text-anchor="middle" class="tx-m">흰색: S 낮고(≤55) V 높음(≥150)</text>
  <text x="540" y="174" text-anchor="middle" class="tx-m">검정: V 낮음 / 회색: S 낮고 V 중간</text>
  <text x="540" y="194" text-anchor="middle" class="tx-m">→ H 를 0~179 전체로 두고 S · V 로 판정</text>

  <rect x="40" y="224" width="660" height="60" rx="10" class="card-bg"/>
  <text x="370" y="246" text-anchor="middle" class="tx">색 판정 순서: BGR → <tspan class="tx-b">CvtColor(BGR2HSV)</tspan> → <tspan class="tx-b">InRange(lo, hi)</tspan> → MorphologyEx(Open) → 연결 요소 · 면적 필터</text>
  <text x="370" y="270" text-anchor="middle" class="tx-m">밝기(조명)가 바뀌어도 H 는 거의 그대로 → BGR 값으로 직접 비교하는 것보다 훨씬 튼튼하다</text>
</svg>`;

  // 그림 4: 블리스터 포켓 격자
  const FIG_POCKET = `<svg viewBox="0 0 740 300" role="img" aria-label="블리스터 포장의 2행 5열 포켓 격자와 불량 위치">
  <text x="370" y="24" text-anchor="middle" class="tx-b">포켓 중심 x = 120 + 100·c (c = 0…4), y = 170 + 140·r (r = 0, 1) · 포켓 반지름 38</text>
  <rect x="40" y="40" width="660" height="180" rx="10" class="p1s"/>
  <g>
    <circle cx="110" cy="90" r="34" class="p5s"/><text x="110" y="95" text-anchor="middle" class="tx">OK</text>
    <circle cx="240" cy="90" r="34" class="p5s"/><text x="240" y="95" text-anchor="middle" class="tx">OK</text>
    <circle cx="370" cy="90" r="34" class="p5s"/><text x="370" y="95" text-anchor="middle" class="tx">OK</text>
    <circle cx="500" cy="90" r="34" class="p4s" stroke-dasharray="4 3"/><text x="500" y="88" text-anchor="middle" class="tx-b">빈</text><text x="500" y="104" text-anchor="middle" class="tx-m">(0,3)</text>
    <circle cx="630" cy="90" r="34" class="p5s"/><text x="630" y="95" text-anchor="middle" class="tx">OK</text>

    <circle cx="110" cy="170" r="34" class="p5s"/><text x="110" y="175" text-anchor="middle" class="tx">OK</text>
    <circle cx="240" cy="170" r="34" class="p4s"/><text x="240" y="168" text-anchor="middle" class="tx-b">깨짐</text><text x="240" y="184" text-anchor="middle" class="tx-m">(1,1)</text>
    <circle cx="370" cy="170" r="34" class="p5s"/><text x="370" y="175" text-anchor="middle" class="tx">OK</text>
    <circle cx="500" cy="170" r="34" class="p5s"/><text x="500" y="175" text-anchor="middle" class="tx">OK</text>
    <circle cx="630" cy="170" r="34" class="p4s"/><text x="630" y="168" text-anchor="middle" class="tx-b">색 불량</text><text x="630" y="184" text-anchor="middle" class="tx-m">(1,4)</text>
  </g>
  <text x="370" y="248" text-anchor="middle" class="tx">각 포켓마다 <tspan class="tx-b">ROI</tspan> 를 잘라 흰 알약 픽셀 수와 주황 픽셀 수를 센다</text>
  <text x="370" y="272" text-anchor="middle" class="tx-m">둘 다 적으면 <tspan class="tx-b">빈 포켓</tspan> · 주황이 더 많으면 <tspan class="tx-b">색 불량</tspan> · 흰 픽셀이 정상(약 2400)의 80% 미만이면 <tspan class="tx-b">깨짐</tspan></text>
  <text x="370" y="294" text-anchor="middle" class="tx-m">정답: (0,3) 빈 포켓 · (1,1) 깨짐 · (1,4) 색 불량 → 전체 NG</text>
</svg>`;

  const EX_HSVPICK = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/color_caps.png", ImreadModes.Color);
        using var hsv = new Mat();
        Cv2.CvtColor(src, hsv, ColorConversionCodes.BGR2HSV);

        // 뚜껑을 밝기로 먼저 찾고(어두운 컨베이어 위의 밝은 뚜껑), 중심 픽셀의 HSV 를 읽는다
        using var gray = new Mat();
        Cv2.CvtColor(src, gray, ColorConversionCodes.BGR2GRAY);
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);

        using var labels = new Mat();
        using var stats = new Mat();
        using var cents = new Mat();
        int n = Cv2.ConnectedComponentsWithStats(bin, labels, stats, cents);

        Console.WriteLine("뚜껑 중심의 HSV 값 (색 범위를 정하는 근거)");
        int shown = 0;
        for (int i = 1; i < n && shown < 12; i++)
        {
            if (stats.At<int>(i, 4) < 600) continue;
            int cx = (int)cents.At<double>(i, 0), cy = (int)cents.At<double>(i, 1);
            Vec3b p = hsv.At<Vec3b>(cy, cx);        // (행 y, 열 x) 순서!
            Vec3b b = src.At<Vec3b>(cy, cx);
            string guess = Guess(p.Item0, p.Item1, p.Item2);
            Console.WriteLine($"  ({cx,3},{cy,3}) BGR({b.Item0,3},{b.Item1,3},{b.Item2,3}) -> H={p.Item0,3} S={p.Item1,3} V={p.Item2,3}  추정 {guess}");
            shown++;
        }
        Cv2.ImShow("caps", src);
        Cv2.WaitKey(0);
    }

    static string Guess(int h, int s, int v)
    {
        if (s <= 55 && v >= 150) return "white";
        if (h <= 10 || h >= 170) return "red";
        if (h >= 20 && h <= 35) return "yellow";
        if (h >= 40 && h <= 85) return "green";
        if (h >= 95 && h <= 130) return "blue";
        return "기타";
    }
}`;

  const EX_CAPS = `using System;
using System.Collections.Generic;
using OpenCvSharp;

class Program
{
    // HSV 범위 하나로 마스크를 만들고 부품 개수를 센다
    static int CountInRange(Mat hsv, Scalar lo, Scalar hi, int minArea, Mat overlay, Scalar drawColor)
    {
        using var mask = new Mat();
        Cv2.InRange(hsv, lo, hi, mask);
        return CountMask(mask, minArea, overlay, drawColor);
    }

    static int CountMask(Mat mask, int minArea, Mat overlay, Scalar drawColor)
    {
        using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(7, 7));
        Cv2.MorphologyEx(mask, mask, MorphTypes.Open, element);
        using var labels = new Mat();
        using var stats = new Mat();
        using var cents = new Mat();
        int n = Cv2.ConnectedComponentsWithStats(mask, labels, stats, cents);
        int count = 0;
        for (int i = 1; i < n; i++)
        {
            if (stats.At<int>(i, 4) < minArea) continue;
            count++;
            var box = new Rect(stats.At<int>(i, 0), stats.At<int>(i, 1), stats.At<int>(i, 2), stats.At<int>(i, 3));
            Cv2.Rectangle(overlay, box, drawColor, 2);
        }
        return count;
    }

    static void Main()
    {
        using var src = Cv2.ImRead("images/color_caps.png", ImreadModes.Color);
        using var hsv = new Mat();
        Cv2.CvtColor(src, hsv, ColorConversionCodes.BGR2HSV);
        using var overlay = src.Clone();

        // 빨강은 H 가 0 과 179 양쪽에 걸쳐 있으므로 두 번 InRange 후 합친다
        using var m1 = new Mat();
        using var m2 = new Mat();
        Cv2.InRange(hsv, new Scalar(0, 90, 60), new Scalar(10, 255, 255), m1);
        Cv2.InRange(hsv, new Scalar(170, 90, 60), new Scalar(179, 255, 255), m2);
        using var red = new Mat();
        Cv2.BitwiseOr(m1, m2, red);
        int nRed = CountMask(red, 600, overlay, new Scalar(0, 0, 255));

        int nYellow = CountInRange(hsv, new Scalar(20, 90, 60), new Scalar(35, 255, 255), 600, overlay, new Scalar(0, 255, 255));
        int nGreen = CountInRange(hsv, new Scalar(40, 90, 60), new Scalar(85, 255, 255), 600, overlay, new Scalar(0, 200, 0));
        int nBlue = CountInRange(hsv, new Scalar(95, 90, 60), new Scalar(130, 255, 255), 600, overlay, new Scalar(255, 120, 0));
        // 흰색은 H 가 무의미 → 채도(S) 낮고 명도(V) 높은 것으로 판정
        int nWhite = CountInRange(hsv, new Scalar(0, 0, 150), new Scalar(179, 55, 255), 600, overlay, new Scalar(200, 200, 200));

        int total = nRed + nGreen + nBlue + nYellow + nWhite;
        Console.WriteLine($"red {nRed} · green {nGreen} · blue {nBlue} · yellow {nYellow} · white {nWhite} = 합계 {total}");
        Console.WriteLine($"기대: red 5 · green 4 · blue 3 · yellow 6 · white 2 = 20");
        bool ok = nRed == 5 && nGreen == 4 && nBlue == 3 && nYellow == 6 && nWhite == 2;
        Console.WriteLine($"판정: {(ok ? "OK" : "NG")}");

        Cv2.ImShow("color count", overlay);
        Cv2.WaitKey(0);
    }
}`;

  const EX_BLISTER = `using System;
using System.Collections.Generic;
using OpenCvSharp;

class Program
{
    const int NormalPillArea = 2400;      // 정상 알약의 흰 픽셀 수 (기준 샘플에서 측정)

    static void Main()
    {
        using var src = Cv2.ImRead("images/blister_pack.png", ImreadModes.Color);
        using var hsv = new Mat();
        Cv2.CvtColor(src, hsv, ColorConversionCodes.BGR2HSV);
        using var overlay = src.Clone();

        int ng = 0;
        Console.WriteLine("행 열   흰픽셀  주황픽셀  판정");
        for (int r = 0; r < 2; r++)
            for (int c = 0; c < 5; c++)
            {
                int cx = 120 + 100 * c, cy = 170 + 140 * r;     // 포켓 격자 (IMAGES.md)
                var roi = new Rect(cx - 38, cy - 38, 76, 76);   // 포켓 반지름 38
                using var sub = new Mat(hsv, roi);              // ROI 는 복사가 아니라 "창"

                using var white = new Mat();
                Cv2.InRange(sub, new Scalar(0, 0, 150), new Scalar(179, 70, 255), white);
                using var orange = new Mat();
                Cv2.InRange(sub, new Scalar(5, 90, 90), new Scalar(25, 255, 255), orange);
                int wa = Cv2.CountNonZero(white), oa = Cv2.CountNonZero(orange);

                string judge;
                if (wa < 500 && oa < 500) judge = "NG 빈 포켓";
                else if (oa > wa) judge = "NG 색 불량";
                else if (wa < NormalPillArea * 0.8) judge = "NG 깨짐";
                else judge = "OK";
                if (judge != "OK") ng++;

                Cv2.Rectangle(overlay, roi, judge == "OK" ? new Scalar(0, 200, 0) : new Scalar(0, 0, 255), 2);
                Cv2.PutText(overlay, judge == "OK" ? "OK" : "NG", new Point(roi.X + 6, roi.Y + 20),
                            HersheyFonts.HersheySimplex, 0.5, judge == "OK" ? new Scalar(0, 200, 0) : new Scalar(0, 0, 255), 2);
                Console.WriteLine($" {r}   {c}   {wa,5}    {oa,5}   {judge}");
            }

        Console.WriteLine($"불량 {ng} 개 -> 전체 판정 {(ng == 0 ? "OK" : "NG")}");
        Cv2.ImShow("blister", overlay);
        Cv2.WaitKey(0);
    }
}`;

  const EX_BOTTLE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/bottle_line.png", ImreadModes.Color);
        using var hsv = new Mat();
        Cv2.CvtColor(src, hsv, ColorConversionCodes.BGR2HSV);
        using var gray = new Mat();
        Cv2.CvtColor(src, gray, ColorConversionCodes.BGR2GRAY);
        using var overlay = src.Clone();

        int[] centers = { 80, 200, 320, 440, 560 };   // 병 5개의 중심 x (IMAGES.md)
        int ngCount = 0;

        for (int i = 0; i < centers.Length; i++)
        {
            int x = centers[i];

            // ── ① 캡(빨강) 유무 · 기울기 ──
            var capRoi = new Rect(x - 35, 78, 70, 56);
            using var capSub = new Mat(hsv, capRoi);
            using var m1 = new Mat();
            using var m2 = new Mat();
            Cv2.InRange(capSub, new Scalar(0, 90, 60), new Scalar(10, 255, 255), m1);
            Cv2.InRange(capSub, new Scalar(170, 90, 60), new Scalar(179, 255, 255), m2);
            using var red = new Mat();
            Cv2.BitwiseOr(m1, m2, red);
            int capPx = Cv2.CountNonZero(red);

            string capJudge = "캡 정상";
            double tilt = 0;
            if (capPx < 300)
            {
                capJudge = "캡 없음";
            }
            else
            {
                Point[][] cs = Cv2.FindContoursAsArray(red, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
                Point[] big = cs[0];
                foreach (Point[] c in cs)
                    if (Cv2.ContourArea(c) > Cv2.ContourArea(big)) big = c;
                RotatedRect rr = Cv2.MinAreaRect(big);
                tilt = rr.Angle;
                while (tilt < -45) tilt += 90;          // 각도를 -45 ~ +45 로 정규화
                while (tilt > 45) tilt -= 90;
                if (Math.Abs(tilt) > 5) capJudge = "캡 기울어짐";
            }

            // ── ② 액면 높이: 중심 x 열을 위에서 아래로 훑어 처음 어두워지는 y ──
            int level = -1;
            for (int y = 130; y < 420; y++)
                if (gray.At<byte>(y, x) < 130) { level = y; break; }

            string lvJudge = level < 0 ? "액면 없음"
                           : level < 162 ? "과다 충전"
                           : level > 178 ? "과소 충전" : "액면 정상";

            bool ok = capJudge == "캡 정상" && lvJudge == "액면 정상";
            if (!ok) ngCount++;

            Scalar color = ok ? new Scalar(0, 200, 0) : new Scalar(0, 0, 255);
            Cv2.Rectangle(overlay, capRoi, color, 2);
            if (level > 0) Cv2.Line(overlay, new Point(x - 30, level), new Point(x + 30, level), color, 2);
            Cv2.PutText(overlay, ok ? "OK" : "NG", new Point(x - 14, 440), HersheyFonts.HersheySimplex, 0.6, color, 2);

            Console.WriteLine($"병 {i}: 캡 빨강 {capPx,4}px, 기울기 {tilt,5:F1}도 -> {capJudge} / 액면 y={level} -> {lvJudge} => {(ok ? "OK" : "NG")}");
        }

        Console.WriteLine($"불량 {ngCount} / 5 -> 라인 판정 {(ngCount == 0 ? "OK" : "NG")}");
        Cv2.ImShow("bottle line", overlay);
        Cv2.WaitKey(0);
    }
}`;

  const EX_PROFILE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/bottle_line.png", ImreadModes.Color);
        using var gray = new Mat();
        Cv2.CvtColor(src, gray, ColorConversionCodes.BGR2GRAY);

        // 병 0번(정상)과 1번(과소 충전)의 세로 프로파일을 비교
        int[] xs = { 80, 200 };
        foreach (int x in xs)
        {
            Console.WriteLine($"x = {x} 열의 밝기 (y = 140 ~ 230, 10 픽셀 간격)");
            string line = "  ";
            for (int y = 140; y <= 230; y += 10) line += $"{gray.At<byte>(y, x),4}";
            Console.WriteLine(line);

            // 액면 = 밝은 공기(약 210)에서 어두운 액체(약 105)로 떨어지는 지점
            int level = -1;
            for (int y = 130; y < 420; y++)
                if (gray.At<byte>(y, x) < 130) { level = y; break; }
            Console.WriteLine($"  액면 y = {level} (기준 170 ± 8)");
        }

        // 프로파일을 그래프로 그려 보기 (200 x 300 캔버스)
        using var chart = new Mat(300, 200, MatType.CV_8UC3, Scalar.All(30));
        for (int y = 130; y < 420; y++)
        {
            int v = gray.At<byte>(y, 200);
            int px = 10 + v * 180 / 255;
            int py = (y - 130) * 299 / 289;
            Cv2.Circle(chart, new Point(px, py), 1, new Scalar(0, 255, 255), -1);
        }
        Cv2.Line(chart, new Point(10 + 130 * 180 / 255, 0), new Point(10 + 130 * 180 / 255, 299), new Scalar(0, 0, 255), 1);
        Cv2.PutText(chart, "130", new Point(10 + 130 * 180 / 255 - 14, 292), HersheyFonts.HersheySimplex, 0.4, new Scalar(0, 0, 255), 1);
        Console.WriteLine("가로축 = 밝기, 세로축 = y (아래로 증가), 빨간 선 = 임계값 130");

        Cv2.ImShow("profile x=200", chart);
        Cv2.WaitKey(0);
    }
}`;

  const CS_COLORINSPECTOR = `// Inspectors/ColorSortInspector.cs — wpf/Ch17_Inspection 의 실제 코드
using OpenCvSharp;

namespace Ch17_Inspection.Inspectors;

/// <summary>
/// 색 분류 검사기 (병뚜껑 색별 개수 세기).
///
/// 흐름: BGR → HSV → 색마다 InRange 마스크 → 모폴로지 열기 → 윤곽선 → 면적 필터 → 색별 개수
/// HSV 는 H(색상) 0~179, S(채도) 0~255, V(명도) 0~255 입니다. 흰색은 채도가 낮아 H 로 구분할 수 없으므로
/// "채도가 낮고 밝다" 는 조건으로 따로 판정합니다.
/// </summary>
public sealed class ColorSortInspector : IInspector
{
    /// <summary>색 하나의 정의: 이름 · HSV 하한/상한(두 번째 범위는 빨강처럼 H 가 0 을 넘어갈 때만 사용) · 오버레이에 쓸 색</summary>
    private sealed record ColorSpec(string Name, Scalar Lower, Scalar Upper, Scalar? Lower2, Scalar? Upper2, Scalar Draw);

    // color_caps.png 의 5색 기준. H 는 0~179 (OpenCV 는 색상 각도를 절반으로 저장)
    private static readonly ColorSpec[] Colors =
    {
        new("빨강",   new Scalar(  0,  90,  60), new Scalar(  8, 255, 255),
                      new Scalar(170,  90,  60), new Scalar(179, 255, 255), Scalar.Red),
        new("노랑",   new Scalar( 18,  90,  60), new Scalar( 35, 255, 255), null, null, Scalar.Yellow),
        new("초록",   new Scalar( 40,  70,  50), new Scalar( 85, 255, 255), null, null, Scalar.Lime),
        new("파랑",   new Scalar( 95,  90,  50), new Scalar(130, 255, 255), null, null, Scalar.DodgerBlue),
        new("흰색",   new Scalar(  0,   0, 170), new Scalar(179,  60, 255), null, null, Scalar.White),
    };

    public string Name => "색 분류 (HSV InRange)";

    public bool NeedsGolden => false;

    /// <summary>이보다 작은 덩어리는 잡음으로 버립니다 (픽셀 면적).</summary>
    public int MinArea { get; set; } = 400;

    /// <summary>기대 총 개수. 0 이면 개수 판정을 하지 않습니다.</summary>
    public int ExpectedTotal { get; set; }

    public InspectionResult Inspect(Mat image, Mat? golden)
    {
        using Mat bgr = MatHelper.ToBgr(image);
        using var hsv = new Mat();
        Cv2.CvtColor(bgr, hsv, ColorConversionCodes.BGR2HSV);

        using Mat element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));

        Mat overlay = bgr.Clone();
        var items = new List<InspectionItem>();
        int total = 0;

        foreach (ColorSpec spec in Colors)
        {
            using var mask = new Mat();
            Cv2.InRange(hsv, spec.Lower, spec.Upper, mask);

            // 빨강처럼 H 가 0 을 넘어가는 색은 범위 두 개를 OR 로 합칩니다.
            if (spec.Lower2 != null && spec.Upper2 != null)
            {
                using var mask2 = new Mat();
                Cv2.InRange(hsv, spec.Lower2.Value, spec.Upper2.Value, mask2);
                Cv2.BitwiseOr(mask, mask2, mask);
            }

            // 톱니 무늬 · 하이라이트로 생긴 구멍과 점을 정리
            Cv2.MorphologyEx(mask, mask, MorphTypes.Open, element);
            Cv2.MorphologyEx(mask, mask, MorphTypes.Close, element);

            Cv2.FindContours(mask, out Point[][] contours, out _,
                             RetrievalModes.External, ContourApproximationModes.ApproxSimple);

            int count = 0;
            foreach (Point[] contour in contours)
            {
                if (Cv2.ContourArea(contour) < MinArea)
                    continue;
                count++;

                Cv2.MinEnclosingCircle(contour, out Point2f center, out float radius);
                var org = new Point((int)center.X, (int)center.Y);
                Cv2.Circle(overlay, org, (int)radius, spec.Draw, 2);
                MatHelper.PutLabel(overlay, spec.Name, new Point(org.X - 16, org.Y + 5), spec.Draw, 0.5);
            }

            total += count;
            items.Add(new InspectionItem(spec.Name, $"{count} 개"));
        }

        bool isOk = ExpectedTotal <= 0 || total == ExpectedTotal;
        string summary = ExpectedTotal <= 0
            ? $"총 {total} 개 (기대 개수 미설정)"
            : $"총 {total} 개 / 기대 {ExpectedTotal} 개";

        items.Insert(0, new InspectionItem("총 개수", $"{total} 개",
                                           ExpectedTotal <= 0 ? "-" : (isOk ? "OK" : "NG")));

        MatHelper.PutJudge(overlay, isOk);
        return new InspectionResult(isOk, summary, overlay, items);
    }
}`;

  const SEC2 = {
    id: 'cs17-2', title: '색 분류 검사: HSV InRange · 격자 ROI · 병 라인', minutes: 50,
    goals: ['HSV InRange 로 색별 개수를 세고 빨강 · 흰색의 특수 처리를 할 수 있다', '격자 좌표로 ROI 를 잘라 유무 · 색 불량 · 깨짐을 판정할 수 있다', '세로 프로파일로 액면 높이를 구하고 판정 규칙을 표로 정리할 수 있다'],
    flow: [['도입: 왜 HSV 인가', 6], ['색별 개수 세기', 14], ['격자 ROI 검사', 15], ['병 라인 · 규칙 정리', 15]],
    content: [
      { type: 'h', text: '색으로 판정하려면 HSV' },
      { type: 'p', html: '05차시에서 배웠듯 <b>BGR 값으로 색을 판정하면 조명이 조금만 바뀌어도 무너집니다</b>. 같은 빨간 뚜껑이 그늘에서는 (30, 30, 150), 밝은 곳에서는 (60, 60, 230) 이 되기 때문입니다. <b>HSV</b> 로 바꾸면 <b>H(색상)</b>은 거의 그대로이고 밝기 변화는 <b>V</b> 에만 나타납니다. 그래서 색 검사는 거의 항상 <code>Cv2.CvtColor(src, hsv, ColorConversionCodes.BGR2HSV)</code> → <code>Cv2.InRange(hsv, lo, hi, mask)</code> 로 시작합니다.' },
      { type: 'figure', html: FIG_HSV, caption: '그림 3. OpenCV HSV 의 H 는 0~179. 빨강은 두 구간, 흰색·검정은 S·V 로 판정한다' },
      { type: 'callout', kind: 'warn', title: '색 검사의 두 가지 함정', html: '<ul><li><b>빨강은 H 가 끊어져 있다</b>: 색상환이 원형이라 빨강이 <code>0~10</code> 과 <code>170~179</code> 로 나뉩니다 → <code>InRange</code> 를 두 번 하고 <code>Cv2.BitwiseOr</code> 로 합칩니다.</li><li><b>흰색 · 검정 · 회색은 H 가 의미 없다</b>: 무채색은 H 가 잡음에 따라 아무 값이나 나옵니다 → H 를 <code>0~179</code> 전체로 열어 두고 <b>S(채도)가 낮고 V(명도)가 높은 것 = 흰색</b>, <b>V 가 낮은 것 = 검정</b> 으로 판정합니다.</li></ul>' },
      { type: 'p', html: '범위를 정하는 가장 확실한 방법은 <b>실제 픽셀 값을 읽어 보는 것</b>입니다. 결과 창의 이미지 위에 마우스를 올리면 BGR 값이 보이고, 코드로는 <code>hsv.At&lt;Vec3b&gt;(y, x)</code> 로 읽습니다.' },
      { type: 'code', title: '예제 1: 색 범위를 정하는 근거 — 뚜껑 중심의 HSV 읽기', code: EX_HSVPICK,
        desc: '<code>color_caps.png</code> 의 기준 색은 BGR 로 red (40,40,200) · green (60,160,50) · blue (190,90,30) · yellow (40,200,230) · white (225,225,222) 입니다. HSV 로 읽으면 노랑은 H≈25, 초록은 H≈63, 흰색은 <b>S 가 2~4</b> 로 아주 낮습니다 — 이것이 흰색을 S 로 판정하는 이유입니다. 뚜껑 가장자리의 톱니 무늬와 하이라이트 때문에 <b>중심 한 점</b>보다 <b>영역 평균</b>이 더 안정적이지만, 범위를 정할 때는 중심 값이 편리합니다.',
        expect: '뚜껑 중심의 HSV 값 (색 범위를 정하는 근거)\n  (582, 70) BGR(214,213,212) -> H=105 S=  2 V=214  추정 white\n  (111,122) BGR( 70,187, 58) -> H= 63 S=176 V=187  추정 green\n  (521,167) BGR( 39,195,226) -> H= 25 S=211 V=226  추정 yellow\n  ( 69,195) BGR( 38,192,221) -> H= 25 S=211 V=221  추정 yellow\n  (584,195) BGR( 38,191,222) -> H= 25 S=211 V=222  추정 yellow\n  (424,226) BGR(227,226,223) -> H= 98 S=  4 V=227  추정 white\n  (197,247) BGR( 39,199,229) -> H= 25 S=212 V=229  추정 yellow\n  ( 88,362) BGR( 38,190,218) -> H= 25 S=211 V=218  추정 yellow\n  (258,376) BGR( 70,187, 58) -> H= 63 S=176 V=187  추정 green\n  (587,418) BGR( 37,189,216) -> H= 25 S=211 V=216  추정 yellow\n  (512,415) BGR( 71,188, 59) -> H= 63 S=175 V=188  추정 green\n  (182,425) BGR( 70,187, 59) -> H= 63 S=175 V=187  추정 green' },
      { type: 'code', title: '예제 2: 색별 개수 세기 (red 5 · green 4 · blue 3 · yellow 6 · white 2)', code: EX_CAPS,
        desc: '색마다 <code>InRange</code> → <code>Open</code> → 연결 요소 → 면적 필터를 반복합니다. <code>Open</code> 을 넣는 이유는 다른 색 뚜껑의 <b>하이라이트나 경계</b>가 몇 픽셀씩 범위에 걸리는 것을 지우기 위해서입니다. 면적 하한 600(뚜껑 면적은 약 2400)도 같은 역할을 합니다 — <b>모폴로지와 면적 필터로 이중 방어</b>하는 것이 실무 습관입니다.',
        expect: 'red 5 · green 4 · blue 3 · yellow 6 · white 2 = 합계 20\n기대: red 5 · green 4 · blue 3 · yellow 6 · white 2 = 20\n판정: OK' },
      { type: 'h', text: '격자 ROI 검사: 자리마다 따로 판정' },
      { type: 'p', html: '포장 · 트레이 · 커넥터처럼 <b>부품 자리가 격자로 정해져 있으면</b> 전체를 한 번에 처리하는 대신 <b>자리마다 ROI 를 잘라</b> 판정하는 것이 훨씬 쉽고 정확합니다. 장점: ① 어느 자리가 불량인지 바로 알 수 있다 ② 옆 자리의 영향을 받지 않는다 ③ 판정 규칙이 단순해진다(그 ROI 안의 픽셀 수만 보면 된다).' },
      { type: 'figure', html: FIG_POCKET, caption: '그림 4. 블리스터 2×5 포켓 격자와 정답 — (0,3) 빈 포켓 · (1,1) 깨짐 · (1,4) 색 불량' },
      { type: 'code', title: '예제 3: 블리스터 포장 검사 (빈 포켓 · 깨짐 · 색 불량)', code: EX_BLISTER,
        desc: '<code>new Mat(hsv, roi)</code> 는 <b>픽셀을 복사하지 않고</b> 원본의 일부를 가리키는 “창”(ROI)입니다 — 빠르고 메모리도 쓰지 않습니다(03차시). 판정 순서가 중요합니다: <b>① 빈 포켓 → ② 색 불량 → ③ 깨짐</b>. 순서를 바꿔 “흰 픽셀이 적으면 깨짐” 을 먼저 보면 <b>빈 포켓과 색 불량이 모두 “깨짐” 으로</b> 오판정됩니다. 정상 알약 면적 약 2400 의 80% 인 1920 이 깨짐 기준이고, (1,1)은 1389 로 걸립니다.',
        expect: '행 열   흰픽셀  주황픽셀  판정\n 0   0    2407        0   OK\n 0   1    2403        0   OK\n 0   2    2421        0   OK\n 0   3      51        0   NG 빈 포켓\n 0   4    2406        0   OK\n 1   0    2392        0   OK\n 1   1    1389        0   NG 깨짐\n 1   2    2401        0   OK\n 1   3    2401        0   OK\n 1   4      72     2301   NG 색 불량\n불량 3 개 -> 전체 판정 NG' },
      { type: 'callout', kind: 'tip', title: '판정 규칙을 만드는 순서', html: '<ol><li><b>정상 샘플로 기준값을 측정</b>한다 (정상 알약의 흰 픽셀 = 약 2400).</li><li><b>불량 종류를 나열</b>하고 각각이 어떤 값에서 달라지는지 본다 (빈 포켓 51 · 깨짐 1389 · 색 불량 흰 72 + 주황 2301).</li><li><b>가장 확실하게 구분되는 것부터</b> 판정한다 (빈 포켓 → 색 → 크기).</li><li>임계값은 정상값과 불량값의 <b>중간</b>에 두고, 여유(마진)를 기록한다 (1920 은 2400과 1389 사이).</li></ol>' },
      { type: 'h', text: '병 라인: 캡 유무 · 기울기 · 액면 높이' },
      { type: 'p', html: '한 제품에 <b>여러 검사 항목</b>이 있는 전형적인 예입니다. <code>bottle_line.png</code> 의 병 5개에 대해 ① 캡(빨강)이 있는가 ② 캡이 기울지 않았는가 ③ 액면 높이가 기준(y = 170 ± 8)인가를 봅니다. 액면은 <b>세로 프로파일</b>(한 열의 밝기를 위에서 아래로 훑기)로 찾습니다 — 공기(밝음 ≈210)에서 액체(어두움 ≈105)로 <b>처음 떨어지는 y</b> 가 액면입니다.' },
      { type: 'code', title: '예제 4: 세로 프로파일로 액면 찾기', code: EX_PROFILE,
        desc: '병 0(정상)은 y=170 에서, 병 1(과소 충전)은 y=215 에서 밝기가 떨어집니다. 임계값 130 은 공기 210 과 액체 105 사이에 두었습니다. 정밀도가 더 필요하면 <b>서브픽셀 보간</b>(두 픽셀 사이를 선형 보간해 밝기 50% 지점을 찾기)을 씁니다 — 그러면 0.1px 단위까지 측정할 수 있습니다.',
        expect: 'x = 80 열의 밝기 (y = 140 ~ 230, 10 픽셀 간격)\n   208 207 207 127 101 102 102 101 101 102\n  액면 y = 170 (기준 170 ± 8)\nx = 200 열의 밝기 (y = 140 ~ 230, 10 픽셀 간격)\n   214 216 214 215 215 215 215 215 104 105\n  액면 y = 215 (기준 170 ± 8)\n가로축 = 밝기, 세로축 = y (아래로 증가), 빨간 선 = 임계값 130' },
      { type: 'code', title: '예제 5: 병 5개 종합 판정 (캡 + 액면)', code: EX_BOTTLE,
        desc: '캡 기울기는 빨간 마스크의 <code>Cv2.MinAreaRect</code> 각도로 구합니다. <code>RotatedRect.Angle</code> 은 −90~0(또는 구현에 따라 0~90) 범위로 나오므로 <b>−45~+45 로 정규화</b>해야 “0도 = 똑바로” 가 됩니다. 결과는 IMAGES.md 의 정답과 정확히 일치합니다: 병 0 OK, 병 1 과소 충전, 병 2 캡 누락, 병 3 과다 충전, 병 4 캡 12도 기울어짐.',
        expect: '병 0: 캡 빨강 1617px, 기울기   0.0도 -> 캡 정상 / 액면 y=170 -> 액면 정상 => OK\n병 1: 캡 빨강 1616px, 기울기   0.0도 -> 캡 정상 / 액면 y=215 -> 과소 충전 => NG\n병 2: 캡 빨강    0px, 기울기   0.0도 -> 캡 없음 / 액면 y=172 -> 액면 정상 => NG\n병 3: 캡 빨강 1617px, 기울기   0.0도 -> 캡 정상 / 액면 y=151 -> 과다 충전 => NG\n병 4: 캡 빨강 1566px, 기울기 -12.1도 -> 캡 기울어짐 / 액면 y=169 -> 액면 정상 => NG\n불량 4 / 5 -> 라인 판정 NG' },
      { type: 'table', head: ['검사', '측정값', '판정 규칙', '정답'], rows: [
        ['색별 개수 (color_caps)', 'HSV InRange 마스크의 연결 요소 수 (면적 ≥ 600)', '색마다 기대 개수와 일치해야 OK', 'red 5 · green 4 · blue 3 · yellow 6 · white 2'],
        ['빈 포켓 (blister)', 'ROI 의 흰 픽셀 수 + 주황 픽셀 수', '둘 다 500 미만 → 빈 포켓', '(0, 3)'],
        ['색 불량 (blister)', '주황 픽셀 수 vs 흰 픽셀 수', '주황이 더 많으면 색 불량', '(1, 4)'],
        ['깨짐 (blister)', 'ROI 의 흰 픽셀 수', '정상(2400)의 80% 미만 → 깨짐', '(1, 1) — 1389'],
        ['캡 유무 (bottle)', '캡 ROI 의 빨강 픽셀 수', '300 미만 → 캡 없음', '병 2'],
        ['캡 기울기 (bottle)', 'MinAreaRect 각도 (−45~+45 정규화)', '|각도| > 5도 → 기울어짐', '병 4 (−12.1도)'],
        ['액면 높이 (bottle)', '중심 열에서 밝기 &lt; 130 이 되는 첫 y', '162 미만 과다 · 178 초과 과소', '병 3 과다(151) · 병 1 과소(215)']
      ], caption: '표 1. 이 차시 색 검사의 측정값 · 판정 규칙 · 정답 정리' },
      { type: 'code', title: 'Inspectors/ColorSortInspector.cs — IInspector 구현 (Visual Studio 에서 실행)', code: CS_COLORINSPECTOR, run: false, local: true, file: 'ColorSortInspector.cs',
        desc: '색 정의를 <code>private sealed record ColorSpec(Name, Lower, Upper, Lower2, Upper2, Draw)</code> <b>데이터</b>로 분리한 점이 핵심입니다 — 색을 추가하거나 범위를 조정할 때 <code>Inspect</code> 코드는 건드리지 않습니다(16차시의 <code>ParamInfo</code> 와 같은 발상). 빨강처럼 두 구간인 색은 <code>Lower2</code> · <code>Upper2</code> 를 <code>Scalar?</code>(널 허용)로 두고 <code>.Value</code> 로 꺼냅니다. 속성은 <code>MinArea</code>(기본 <b>400</b>)와 <code>ExpectedTotal</code>(기대 <b>총</b> 개수, 0 이면 판정 안 함)입니다. 위 브라우저 예제와 범위가 조금 다르고(빨강 H 0~8, 노랑 18~35, 흰색 S ≤ 60 · V ≥ 170) 마스크에 <b>열기 + 닫기</b>(5×5)를 모두 하지만, 결과는 똑같이 빨강 5 · 노랑 6 · 초록 4 · 파랑 3 · 흰색 2 = <b>20</b> 입니다(3교시 예제 4 에서 확인). 오버레이에는 <code>MinEnclosingCircle</code> 로 원을 그립니다. 실무에서는 이 색 목록을 <b>JSON 레시피 파일</b>로 저장해 제품마다 바꿔 씁니다.' },
      { type: 'callout', kind: 'field', title: '현장에서는', html: '<ul><li><b>색은 조명에 가장 민감한 검사</b>입니다. 백색 LED 도 시간이 지나면 색온도가 변하므로, 화면 안에 <b>기준 색 패치</b>를 함께 찍어 화이트밸런스를 보정하는 경우가 많습니다(<code>color_chart.png</code>).</li><li>HSV 대신 <b>Lab 색공간</b>과 ΔE(색 차이) 를 쓰면 “사람이 느끼는 색 차이” 에 더 가깝게 판정할 수 있습니다.</li><li>격자 좌표는 <b>하드코딩하지 말고</b> 정렬 마크(14차시 피듀셜)로 매번 찾아 보정합니다 — 제품이 조금 밀려 놓이면 ROI 가 전부 어긋납니다.</li></ul>' },
      { type: 'wpf', title: '검사 앱에서 색 검사 실행하기', project: 'Ch17_Inspection', html: '<ol><li>검사 <b>색 분류 (HSV InRange)</b> 선택 → [기대 개수] <b>20</b> → [이미지 열기] <code>images/color_caps.png</code> (열면 자동으로 한 번 검사합니다)</li><li>오른쪽 판정 상자에 <b>OK</b> 와 “총 20 개 / 기대 20 개”, <code>ResultGrid</code> 에 총 개수와 색별(빨강 · 노랑 · 초록 · 파랑 · 흰색) 개수가 한 줄씩 나옵니다. 가운데 오버레이에는 색마다 원이 그려집니다.</li><li>파라미터 슬라이더(면적 하한, 기본 400)를 3000 까지 올리고 [검사 실행] → 뚜껑이 걸러져 NG 가 되는 것을 확인하고, [결과 CSV 저장] 으로 리포트를 남겨 보세요.</li><li>블리스터 · 병 라인 검사(예제 3 · 5)는 앱에 없습니다 — <code>IInspector</code> 를 구현한 <code>BlisterInspector</code> 를 만들어 <code>_inspectors</code> 배열에 추가해 보세요.</li></ol>' }
    ],
    practice: [
      {
        title: '노란 뚜껑만 찾아 좌표 출력하기', level: 1,
        desc: '<code>images/color_caps.png</code> 에서 <b>노란 뚜껑(H 20~35)</b>만 찾아 개수와 각 중심 좌표를 출력하세요. 정답은 6개입니다. 그 다음 H 상한을 35 → 45 로 넓혀도 개수가 그대로인지 확인하고, 이 이미지에서 왜 안전한지(초록의 H 가 63 이므로 45 와 충분히 떨어져 있다) 생각해 보세요.',
        hint: '<code>Cv2.InRange(hsv, new Scalar(20, 90, 60), new Scalar(35, 255, 255), mask)</code> → <code>Open</code> → <code>ConnectedComponentsWithStats</code> → 면적 600 이상. 중심은 <code>cents.At&lt;double&gt;(i, 0)</code>, <code>(i, 1)</code>.',
        expect: '  #1 중심 (521, 168) 면적 2624\n  #2 중심 (70, 196) 면적 2630\n  #3 중심 (584, 196) 면적 2619\n  #4 중심 (198, 247) 면적 2622\n  #5 중심 (89, 363) 면적 2631\n  #6 중심 (588, 419) 면적 2617\nH 20~35: 노란 뚜껑 6 개 (기대 6)\nH 20~45: 6 개 — 이 이미지는 변화 없음 (초록 H=63 이 45 보다 충분히 멀다)',
        starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/color_caps.png", ImreadModes.Color);
        using var hsv = new Mat();
        Cv2.CvtColor(src, hsv, ColorConversionCodes.BGR2HSV);

        using var mask = new Mat();
        Cv2.InRange(hsv, new Scalar(20, 90, 60), new Scalar(35, 255, 255), mask);
        using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(7, 7));
        Cv2.MorphologyEx(mask, mask, MorphTypes.Open, element);

        using var labels = new Mat();
        using var stats = new Mat();
        using var cents = new Mat();
        int n = Cv2.ConnectedComponentsWithStats(mask, labels, stats, cents);
        int count = 0;
        // TODO: 면적 600 이상인 성분만 세고 중심 좌표를 출력하세요

        Console.WriteLine($"노란 뚜껑 {count} 개 (기대 6)");
        Cv2.ImShow("yellow mask", mask);
        Cv2.WaitKey(0);
    }
}`,
        solution: `using System;
using OpenCvSharp;

class Program
{
    static int CountYellow(Mat hsv, int hiH, bool print)
    {
        using var mask = new Mat();
        Cv2.InRange(hsv, new Scalar(20, 90, 60), new Scalar(hiH, 255, 255), mask);
        using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(7, 7));
        Cv2.MorphologyEx(mask, mask, MorphTypes.Open, element);

        using var labels = new Mat();
        using var stats = new Mat();
        using var cents = new Mat();
        int n = Cv2.ConnectedComponentsWithStats(mask, labels, stats, cents);
        int count = 0;
        for (int i = 1; i < n; i++)
        {
            if (stats.At<int>(i, 4) < 600) continue;
            count++;
            if (print)
                Console.WriteLine($"  #{count} 중심 ({cents.At<double>(i, 0):F0}, {cents.At<double>(i, 1):F0}) 면적 {stats.At<int>(i, 4)}");
        }
        return count;
    }

    static void Main()
    {
        using var src = Cv2.ImRead("images/color_caps.png", ImreadModes.Color);
        using var hsv = new Mat();
        Cv2.CvtColor(src, hsv, ColorConversionCodes.BGR2HSV);

        int c1 = CountYellow(hsv, 35, true);
        Console.WriteLine($"H 20~35: 노란 뚜껑 {c1} 개 (기대 6)");
        int c2 = CountYellow(hsv, 45, false);
        Console.WriteLine($"H 20~45: {c2} 개 — 이 이미지는 변화 없음 (초록 H=63 이 45 보다 충분히 멀다)");
        Cv2.ImShow("caps", src);
        Cv2.WaitKey(0);
    }
}`
      },
      {
        title: '깨짐 판정 임계값을 맞춰 보기', level: 2,
        desc: '블리스터 검사의 임계값 세 개(<code>EmptyLimit</code> · <code>BrokenRatio</code>)를 조정해 <b>정답 3개</b>((0,3) 빈 포켓 · (1,1) 깨짐 · (1,4) 색 불량)만 NG 가 되게 만드세요. starter 는 깨짐 기준이 너무 커서 <b>정상 포켓까지 깨짐으로</b> 판정합니다(NG 10개). 측정값을 보고 임계값을 정하세요.',
        hint: '정상 포켓의 흰 픽셀은 약 2390~2421, (1,1)은 1389, 빈 포켓은 51, 색 불량은 흰 72 · 주황 2301. <code>BrokenRatio</code> 를 0.8 로 두면 기준이 1920 이 되어 1389 만 걸립니다.',
        expect: '(0,0) 흰  2407 주황     0 -> OK\n(0,1) 흰  2403 주황     0 -> OK\n(0,2) 흰  2421 주황     0 -> OK\n(0,3) 흰    51 주황     0 -> NG 빈 포켓\n(0,4) 흰  2406 주황     0 -> OK\n(1,0) 흰  2392 주황     0 -> OK\n(1,1) 흰  1389 주황     0 -> NG 깨짐\n(1,2) 흰  2401 주황     0 -> OK\n(1,3) 흰  2401 주황     0 -> OK\n(1,4) 흰    72 주황  2301 -> NG 색 불량\nNG 3 개 (정답은 3개)',
        starter: `using System;
using OpenCvSharp;

class Program
{
    const int NormalPillArea = 2400;
    const int EmptyLimit = 1500;        // TODO: 너무 큽니다 — 빈 포켓만 걸리게 줄이세요
    const double BrokenRatio = 1.05;    // TODO: 너무 큽니다 — 정상까지 깨짐으로 보고 있습니다

    static void Main()
    {
        using var src = Cv2.ImRead("images/blister_pack.png", ImreadModes.Color);
        using var hsv = new Mat();
        Cv2.CvtColor(src, hsv, ColorConversionCodes.BGR2HSV);

        int ng = 0;
        for (int r = 0; r < 2; r++)
            for (int c = 0; c < 5; c++)
            {
                var roi = new Rect(120 + 100 * c - 38, 170 + 140 * r - 38, 76, 76);
                using var sub = new Mat(hsv, roi);
                using var white = new Mat();
                Cv2.InRange(sub, new Scalar(0, 0, 150), new Scalar(179, 70, 255), white);
                using var orange = new Mat();
                Cv2.InRange(sub, new Scalar(5, 90, 90), new Scalar(25, 255, 255), orange);
                int wa = Cv2.CountNonZero(white), oa = Cv2.CountNonZero(orange);

                string judge;
                if (wa < EmptyLimit && oa < EmptyLimit) judge = "NG 빈 포켓";
                else if (oa > wa) judge = "NG 색 불량";
                else if (wa < NormalPillArea * BrokenRatio) judge = "NG 깨짐";
                else judge = "OK";
                if (judge != "OK") ng++;
                Console.WriteLine($"({r},{c}) 흰 {wa,5} 주황 {oa,5} -> {judge}");
            }
        Console.WriteLine($"NG {ng} 개 (정답은 3개)");
    }
}`,
        solution: `using System;
using OpenCvSharp;

class Program
{
    const int NormalPillArea = 2400;
    const int EmptyLimit = 500;         // 빈 포켓(51) 과 깨짐(1389) 사이
    const double BrokenRatio = 0.8;     // 기준 1920: 정상(2390~) 은 통과, 깨짐(1389) 만 NG

    static void Main()
    {
        using var src = Cv2.ImRead("images/blister_pack.png", ImreadModes.Color);
        using var hsv = new Mat();
        Cv2.CvtColor(src, hsv, ColorConversionCodes.BGR2HSV);

        int ng = 0;
        for (int r = 0; r < 2; r++)
            for (int c = 0; c < 5; c++)
            {
                var roi = new Rect(120 + 100 * c - 38, 170 + 140 * r - 38, 76, 76);
                using var sub = new Mat(hsv, roi);
                using var white = new Mat();
                Cv2.InRange(sub, new Scalar(0, 0, 150), new Scalar(179, 70, 255), white);
                using var orange = new Mat();
                Cv2.InRange(sub, new Scalar(5, 90, 90), new Scalar(25, 255, 255), orange);
                int wa = Cv2.CountNonZero(white), oa = Cv2.CountNonZero(orange);

                string judge;
                if (wa < EmptyLimit && oa < EmptyLimit) judge = "NG 빈 포켓";
                else if (oa > wa) judge = "NG 색 불량";
                else if (wa < NormalPillArea * BrokenRatio) judge = "NG 깨짐";
                else judge = "OK";
                if (judge != "OK") ng++;
                Console.WriteLine($"({r},{c}) 흰 {wa,5} 주황 {oa,5} -> {judge}");
            }
        Console.WriteLine($"NG {ng} 개 (정답은 3개)");
    }
}`
      }
    ],
    quiz: [
      { q: '색 검사에서 BGR 대신 HSV 를 쓰는 주된 이유는?', options: ['HSV 가 계산이 빨라서', '밝기가 바뀌어도 <b>H(색상)</b>은 거의 그대로여서 조명 변화에 튼튼하기 때문', 'HSV 가 채널이 적어서', 'OpenCV 가 BGR 을 지원하지 않아서'], answer: 1,
        explain: '조명이 밝아지면 BGR 세 값이 모두 커지지만 HSV 에서는 주로 <b>V</b> 만 커집니다. 그래서 H 범위로 색을 고르면 그늘/하이라이트에서도 같은 색으로 잡힙니다.' },
      { q: '빨강을 <code>InRange</code> 로 잡을 때 두 번 호출해 합치는 이유는?', options: ['빨강이 두 가지 밝기를 갖기 때문', '색상환이 원형이라 빨강이 <b>H 0~10 과 170~179</b> 로 나뉘기 때문', '빨강이 채도가 높아서', '빨강만 3채널이기 때문'], answer: 1,
        explain: 'H 는 0~179 로 접혀 있어 빨강이 양 끝에 걸칩니다. <code>InRange</code> 두 번 + <code>Cv2.BitwiseOr</code> 로 합칩니다. (H 를 +90 만큼 회전시키는 기법도 있습니다.)' },
      { q: '<b>흰색</b> 뚜껑을 판정하는 올바른 방법은?', options: ['H 를 0~5 로 좁게 잡는다', 'H 는 0~179 전체로 두고 <b>S 를 낮게(≤55), V 를 높게(≥150)</b> 잡는다', 'V 를 0~50 으로 잡는다', 'BGR 에서 세 값이 같은 픽셀을 찾는다'], answer: 1,
        explain: '무채색은 H 가 잡음에 따라 아무 값이나 나옵니다. <code>color_caps.png</code> 의 흰 뚜껑은 S 가 2~4 로 아주 낮습니다. 검정은 V 가 낮은 것으로 판정합니다.' },
      { q: '블리스터 판정에서 <b>빈 포켓 → 색 불량 → 깨짐</b> 순서로 검사하는 이유는?', options: ['코드가 짧아져서', '순서를 바꾸면 빈 포켓과 색 불량이 “흰 픽셀이 적다” 는 이유로 <b>깨짐으로 오판정</b>되기 때문', '깨짐이 가장 드물어서', 'ROI 크기 때문에'], answer: 1,
        explain: '판정 규칙은 <b>가장 확실하게 구분되는 것부터</b> 적용합니다. 빈 포켓(흰 51)과 색 불량(흰 72)은 모두 흰 픽셀이 적으므로 깨짐 조건을 먼저 보면 셋 다 “깨짐” 이 됩니다.' },
      { q: '액면 높이를 <b>세로 프로파일</b>로 찾는 방법은?', options: ['한 행의 밝기를 좌우로 훑어 최대값을 찾는다', '중심 <b>열</b>의 밝기를 위에서 아래로 훑어 <b>처음 어두워지는 y</b> 를 찾는다', '전체 평균 밝기를 구한다', '윤곽선의 개수를 센다'], answer: 1,
        explain: '액체 위쪽은 밝은 공기(≈210), 아래는 어두운 액체(≈105)이므로 임계값 130 을 지나는 첫 y 가 액면입니다. 더 정밀하게는 두 픽셀 사이를 선형 보간해 <b>서브픽셀</b>로 구합니다.' }
    ],
    slides: [
      { layout: 'title', title: '색 분류 검사', subtitle: '2교시 — HSV InRange · 격자 ROI · 병 라인 종합 판정', notes: '<p>💬 “빨간 뚜껑을 찾으려면 BGR 에서 R 값이 크면 될까요?” 로 시작합니다 — 주황도, 분홍도, 밝은 회색도 R 이 큽니다. 색을 “값의 크기” 가 아니라 <b>색상(Hue)</b> 으로 봐야 한다는 점으로 이어집니다. (3분)</p>' },
      { layout: 'diagram', title: 'HSV: 색상 H 는 0~179', html: FIG_HSV, caption: '빨강은 두 구간(0~10, 170~179), 흰색·검정은 S·V 로 판정', notes: '<p>05차시 복습입니다. H 가 0~359 가 아니라 <b>0~179</b> 인 이유(8bit 에 담기 위해 절반으로)를 짚어 주세요. 빨강 두 구간과 무채색 문제는 실무에서 가장 많이 실수하는 부분입니다. (5분)</p>' },
      { layout: 'code', title: '색 범위는 픽셀 값을 읽어서 정한다', code: `using var hsv = new Mat();
Cv2.CvtColor(src, hsv, ColorConversionCodes.BGR2HSV);

// 뚜껑 중심의 HSV 를 읽어 본다 — At<Vec3b>(행 y, 열 x) 순서!
Vec3b p = hsv.At<Vec3b>(cy, cx);
Console.WriteLine($"H={p.Item0} S={p.Item1} V={p.Item2}");

// color_caps.png 실측값
//   노랑  H=25  S=211 V=226      초록  H=63  S=176 V=187
//   흰색  H=105 S=2   V=214   ← H 는 무의미, S 가 아주 낮다
static string Guess(int h, int s, int v)
{
    if (s <= 55 && v >= 150) return "white";      // 무채색 먼저!
    if (h <= 10 || h >= 170) return "red";
    if (h >= 20 && h <= 35) return "yellow";
    if (h >= 40 && h <= 85) return "green";
    if (h >= 95 && h <= 130) return "blue";
    return "기타";
}`, run: false, points: ['범위는 <b>짐작하지 말고 실측</b>한다', '무채색(흰·검·회)을 <b>먼저</b> 걸러낸다', '결과 창에서 마우스로 BGR 값도 볼 수 있다'], notes: '<p>학생들이 브라우저 예제 1 을 실행해 실제 값을 보게 합니다. 💬 “흰 뚜껑의 H 가 105 인데 파랑 범위(95~130)에 들어가네요. 어떻게 막았나요?” — S 조건을 먼저 검사. (5분)</p>' },
      { layout: 'code', title: '색별 개수 세기', code: `// 빨강은 두 구간을 합친다
Cv2.InRange(hsv, new Scalar(0, 90, 60), new Scalar(10, 255, 255), m1);
Cv2.InRange(hsv, new Scalar(170, 90, 60), new Scalar(179, 255, 255), m2);
Cv2.BitwiseOr(m1, m2, red);

// 마스크 → Open(잡점 제거) → 연결 요소 → 면적 필터
using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(7, 7));
Cv2.MorphologyEx(mask, mask, MorphTypes.Open, element);
int n = Cv2.ConnectedComponentsWithStats(mask, labels, stats, cents);
int count = 0;
for (int i = 1; i < n; i++)
    if (stats.At<int>(i, 4) >= 600) count++;

// 흰색은 H 전체 + S 낮음 + V 높음
Cv2.InRange(hsv, new Scalar(0, 0, 150), new Scalar(179, 55, 255), whiteMask);`, run: false, points: ['정답: red 5 · green 4 · blue 3 · yellow 6 · white 2', '<code>Open</code> + 면적 필터로 <b>이중 방어</b>', '색마다 같은 절차를 반복 → 데이터(ColorSpec)로 분리'], notes: '<p>결과가 IMAGES.md 정답과 정확히 맞는 것을 확인시킵니다. 💬 “면적 하한 600 은 어떻게 정했나?” — 뚜껑 면적이 약 2400 이므로 1/4. 너무 크게 잡으면 부분적으로 가려진 뚜껑을 놓칩니다. (5분)</p>' },
      { layout: 'image', title: 'color_caps.png — 5색 뚜껑 20개', src: 'images/color_caps.png', caption: '어두운 컨베이어 위 병뚜껑 20개. 가장자리 톱니 무늬와 하이라이트가 있어 평균색이 기준색과 조금 다르다', notes: '<p>실제 이미지를 보며 “왜 중심 한 점만 보면 위험한가” 를 이야기합니다 — 하이라이트에 찍히면 흰색으로 오판정. 그래서 <b>마스크 면적</b>으로 세는 것이 안전합니다. (3분)</p>' },
      { layout: 'diagram', title: '격자 ROI 검사', html: FIG_POCKET, caption: '자리마다 ROI 를 잘라 판정 → 어느 자리가 불량인지 바로 알 수 있다', notes: '<p>격자 검사의 세 가지 장점(위치 특정 · 간섭 없음 · 규칙 단순)을 강조합니다. 💬 “제품이 조금 밀려 놓이면?” — 정렬 마크로 격자를 보정해야 한다(14차시). 이것이 실무에서 가장 흔한 실패 원인입니다. (4분)</p>' },
      { layout: 'code', title: '포켓마다 ROI 를 잘라 판정', code: `for (int r = 0; r < 2; r++)
    for (int c = 0; c < 5; c++)
    {
        int cx = 120 + 100 * c, cy = 170 + 140 * r;
        var roi = new Rect(cx - 38, cy - 38, 76, 76);
        using var sub = new Mat(hsv, roi);        // 복사 아님 — 원본을 보는 "창"

        using var white = new Mat();
        Cv2.InRange(sub, new Scalar(0, 0, 150), new Scalar(179, 70, 255), white);
        using var orange = new Mat();
        Cv2.InRange(sub, new Scalar(5, 90, 90), new Scalar(25, 255, 255), orange);
        int wa = Cv2.CountNonZero(white), oa = Cv2.CountNonZero(orange);

        string judge;
        if (wa < 500 && oa < 500) judge = "NG 빈 포켓";     // ① 가장 확실한 것 먼저
        else if (oa > wa) judge = "NG 색 불량";              // ②
        else if (wa < 2400 * 0.8) judge = "NG 깨짐";        // ③
        else judge = "OK";
    }`, run: false, points: ['<code>new Mat(hsv, roi)</code> = ROI(창), 복사 없음 → 빠르다', '판정 순서: <b>빈 포켓 → 색 → 크기</b>', '실측: 정상 2400 · 깨짐 1389 · 빈 51 · 색불량 흰72/주황2301'], notes: '<p>판정 순서를 바꿔 실행해 보여 주면 효과가 큽니다 — 깨짐을 먼저 보면 NG 가 3개가 아니라 3개 모두 “깨짐” 으로 나옵니다. 실습 2 가 바로 이 임계값 맞추기입니다. (6분)</p>' },
      { layout: 'code', title: '세로 프로파일로 액면 찾기', code: `using var gray = new Mat();
Cv2.CvtColor(src, gray, ColorConversionCodes.BGR2GRAY);

// 중심 열을 위에서 아래로 훑어 처음 어두워지는 y = 액면
int level = -1;
for (int y = 130; y < 420; y++)
    if (gray.At<byte>(y, x) < 130) { level = y; break; }

// 공기 ≈ 210, 액체 ≈ 105 → 임계값 130 은 그 사이
string judge = level < 162 ? "과다 충전"
             : level > 178 ? "과소 충전" : "액면 정상";

// 정답: 병0 y=170 OK · 병1 y=215 과소 · 병3 y=151 과다`, run: false, points: ['1D 프로파일 = 가장 단순하고 빠른 측정 도구', '임계값은 두 밝기의 <b>중간</b>에', '정밀하게는 선형 보간으로 서브픽셀'], notes: '<p>“이미지 처리라고 항상 2D 로 생각하지 말 것 — 1D 프로파일이면 충분한 문제가 아주 많다” 는 실무 감각을 전합니다. 브라우저 예제 4 는 프로파일을 그래프로도 그려 줍니다. (5분)</p>' },
      { layout: 'table', title: '판정 규칙 정리', head: ['검사', '측정값', '규칙', '정답'], rows: [
        ['색별 개수', 'InRange 마스크의 성분 수', '기대 개수와 일치', 'r5 g4 b3 y6 w2'],
        ['빈 포켓', '흰 + 주황 픽셀 수', '둘 다 500 미만', '(0,3)'],
        ['색 불량', '주황 vs 흰', '주황이 더 많음', '(1,4)'],
        ['깨짐', '흰 픽셀 수', '정상의 80% 미만', '(1,1)'],
        ['캡 유무', '빨강 픽셀 수', '300 미만', '병 2'],
        ['캡 기울기', 'MinAreaRect 각도', '|각도| > 5도', '병 4 (−12도)'],
        ['액면', '밝기 &lt; 130 첫 y', '162 미만 / 178 초과', '병 3 / 병 1']
      ], notes: '<p>표를 보며 “측정값 → 규칙 → 임계값” 세 칸이 항상 필요하다는 것을 정리합니다. 임계값 옆에 <b>여유(마진)</b>를 적어 두는 습관도 알려 주세요 — 나중에 다른 로트에서 문제가 생겼을 때 판단 근거가 됩니다. (4분)</p>' },
      { layout: 'quiz', title: '확인 퀴즈', q: '흰색 뚜껑을 판정하는 올바른 HSV 조건은?', options: ['H 0~5', 'H 전체 + S 낮음(≤55) + V 높음(≥150)', 'V 0~50', 'H 95~130'], answer: 1, explain: '무채색은 H 가 잡음대로 나옵니다(흰 뚜껑 실측 H=105). <b>S 가 낮고 V 가 높은 것</b>이 흰색입니다.', notes: '<p>정답 2번. 흰 뚜껑의 H=105 가 파랑 범위에 들어간다는 실측값을 다시 보여 주면 확실히 이해합니다. (2분)</p>' },
      { layout: 'practice', title: '실습: 깨짐 임계값 맞추기', desc: '<p>블리스터 검사의 임계값을 조정해 <b>정답 3개</b>만 NG 가 되게 하세요.</p><ul><li>starter 는 <code>EmptyLimit = 1500</code>, <code>BrokenRatio = 1.05</code> 로 정상까지 NG (NG 10개)</li><li>실측: 정상 2390~2421 · 깨짐 1389 · 빈 51 · 색불량 흰 72</li><li>정답: (0,3) 빈 포켓 · (1,1) 깨짐 · (1,4) 색 불량</li></ul>', starter: `using System;

class Program
{
    const int NormalPillArea = 2400;
    const int EmptyLimit = 1500;        // TODO: 빈 포켓만 걸리게 줄이세요
    const double BrokenRatio = 1.05;    // TODO: 정상은 통과하게 줄이세요

    static string Judge(int wa, int oa)
    {
        if (wa < EmptyLimit && oa < EmptyLimit) return "NG 빈 포켓";
        if (oa > wa) return "NG 색 불량";
        if (wa < NormalPillArea * BrokenRatio) return "NG 깨짐";
        return "OK";
    }

    static void Main()
    {
        int[] white = { 2407, 2403, 2421, 51, 2406, 2392, 1389, 2401, 2401, 72 };
        int[] orange = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 2301 };
        int ng = 0;
        for (int k = 0; k < 10; k++)
        {
            string j = Judge(white[k], orange[k]);
            if (j != "OK") ng++;
            Console.WriteLine($"포켓 {k}: 흰 {white[k]} 주황 {orange[k]} -> {j}");
        }
        Console.WriteLine($"NG {ng} 개 (정답은 3개)");
    }
}`, solution: `using System;

class Program
{
    const int NormalPillArea = 2400;
    const int EmptyLimit = 500;         // 빈 포켓(51) 과 깨짐(1389) 사이
    const double BrokenRatio = 0.8;     // 기준 1920: 정상(2390~) 통과, 깨짐(1389) NG

    static string Judge(int wa, int oa)
    {
        if (wa < EmptyLimit && oa < EmptyLimit) return "NG 빈 포켓";
        if (oa > wa) return "NG 색 불량";
        if (wa < NormalPillArea * BrokenRatio) return "NG 깨짐";
        return "OK";
    }

    static void Main()
    {
        int[] white = { 2407, 2403, 2421, 51, 2406, 2392, 1389, 2401, 2401, 72 };
        int[] orange = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 2301 };
        int ng = 0;
        for (int k = 0; k < 10; k++)
        {
            string j = Judge(white[k], orange[k]);
            if (j != "OK") ng++;
            Console.WriteLine($"포켓 {k}: 흰 {white[k]} 주황 {orange[k]} -> {j}");
        }
        Console.WriteLine($"NG {ng} 개 (정답은 3개)");
    }
}`, notes: '<p>학생들은 브라우저 실습 2 의 전체 코드로 작업합니다. 임계값을 “실측값 사이의 중간” 으로 정하는 감각이 목표입니다. 다 맞춘 학생에게는 “정상 알약 면적 2400 을 코드에 박지 않고 정상 포켓들의 중앙값으로 자동 계산하기” 를 추가 과제로 주세요. (8분)</p>' },
      { layout: 'summary', title: '2교시 정리', bullets: [
        '색 검사는 <b>BGR → HSV → InRange</b> (조명 변화에 튼튼)',
        '빨강은 <b>두 구간 + BitwiseOr</b>, 무채색은 <b>S · V</b> 로 판정',
        '자리가 정해져 있으면 <b>격자 ROI</b> 로 잘라 자리마다 판정',
        '판정 규칙은 <b>가장 확실한 것부터</b>, 임계값은 실측값의 중간에',
        '여러 항목(캡 · 액면)은 각각 판정한 뒤 <b>AND</b> 로 최종 OK',
        '다음 시간: 기준(골든) 이미지와 비교해 <b>예상 못한 결함</b> 찾기'
      ], notes: '<p>지금까지는 “무엇을 찾을지 알고 있는” 검사였다는 점을 짚고, 다음 시간은 “무엇이 잘못됐는지 모를 때” 쓰는 골든 비교라고 예고합니다. (2분)</p>' }
    ]
  };
  // ───────────────────────────── 3교시 ─────────────────────────────

  // 그림 5: 골든 이미지 비교 파이프라인
  const FIG_GOLDEN = `<svg viewBox="0 0 760 330" role="img" aria-label="골든 이미지와 검사 이미지의 차영상으로 결함을 찾는 파이프라인">
  ${ARROW('c17a2')}
  <rect x="20" y="30" width="150" height="50" rx="10" class="p1s"/>
  <text x="95" y="52" text-anchor="middle" class="tx-b">골든(기준) 영상</text>
  <text x="95" y="70" text-anchor="middle" class="tx-m">metal_ok.png</text>
  <rect x="20" y="96" width="150" height="50" rx="10" class="p1s"/>
  <text x="95" y="118" text-anchor="middle" class="tx-b">검사 영상</text>
  <text x="95" y="136" text-anchor="middle" class="tx-m">metal_scratch.png</text>

  <rect x="212" y="58" width="130" height="60" rx="10" class="p2s"/>
  <text x="277" y="82" text-anchor="middle" class="tx-b">Cv2.Absdiff</text>
  <text x="277" y="102" text-anchor="middle" class="tx-m">|골든 − 검사|</text>

  <rect x="384" y="58" width="140" height="60" rx="10" class="p2s"/>
  <text x="454" y="78" text-anchor="middle" class="tx-b">GaussianBlur</text>
  <text x="454" y="96" text-anchor="middle" class="tx-m">잡음 평탄화</text>
  <text x="454" y="112" text-anchor="middle" class="tx-m">커널 5</text>

  <rect x="566" y="58" width="176" height="60" rx="10" class="p3s"/>
  <text x="654" y="78" text-anchor="middle" class="tx-b">Threshold</text>
  <text x="654" y="96" text-anchor="middle" class="tx-m">차이 &gt; 10 만 남긴다</text>
  <text x="654" y="112" text-anchor="middle" class="tx-m">(결함 대비가 약하다!)</text>

  <line x1="172" y1="60" x2="208" y2="78" class="ln" stroke-width="2" marker-end="url(#c17a2)"/>
  <line x1="172" y1="126" x2="208" y2="102" class="ln" stroke-width="2" marker-end="url(#c17a2)"/>
  <line x1="344" y1="88" x2="380" y2="88" class="ln" stroke-width="2" marker-end="url(#c17a2)"/>
  <line x1="526" y1="88" x2="562" y2="88" class="ln" stroke-width="2" marker-end="url(#c17a2)"/>

  <rect x="120" y="170" width="180" height="62" rx="10" class="p4s"/>
  <text x="210" y="192" text-anchor="middle" class="tx-b">MorphologyEx Close</text>
  <text x="210" y="210" text-anchor="middle" class="tx-m">끊긴 긁힘을 이어 붙인다</text>
  <text x="210" y="226" text-anchor="middle" class="tx-m">타원 커널 21×21</text>

  <rect x="336" y="170" width="170" height="62" rx="10" class="p5s"/>
  <text x="421" y="192" text-anchor="middle" class="tx-b">FindContours</text>
  <text x="421" y="210" text-anchor="middle" class="tx-m">면적 ≥ 80 만 결함</text>
  <text x="421" y="226" text-anchor="middle" class="tx-m">BoundingRect</text>

  <rect x="542" y="170" width="200" height="62" rx="10" class="p1s"/>
  <text x="642" y="192" text-anchor="middle" class="tx-b">결함 bbox 그리기</text>
  <text x="642" y="210" text-anchor="middle" class="tx-m">정답 4개: S1 · S2 · ST · D1</text>
  <text x="642" y="226" text-anchor="middle" class="tx-m">이미지 저장 · CSV</text>

  <line x1="654" y1="120" x2="654" y2="146" class="ln" stroke-width="2"/>
  <line x1="654" y1="146" x2="210" y2="146" class="ln" stroke-width="2"/>
  <line x1="210" y1="146" x2="210" y2="166" class="ln" stroke-width="2" marker-end="url(#c17a2)"/>
  <line x1="302" y1="200" x2="332" y2="200" class="ln" stroke-width="2" marker-end="url(#c17a2)"/>
  <line x1="508" y1="200" x2="538" y2="200" class="ln" stroke-width="2" marker-end="url(#c17a2)"/>

  <rect x="20" y="254" width="722" height="62" rx="10" class="card-bg"/>
  <text x="381" y="276" text-anchor="middle" class="tx"><tspan class="tx-b">전제 조건</tspan>: 두 영상이 <tspan class="tx-b">픽셀 단위로 정렬</tspan>되어 있어야 한다 (같은 카메라 · 같은 위치 · 같은 조명)</text>
  <text x="381" y="300" text-anchor="middle" class="tx-m">어긋나 있으면 부품 경계 전체가 “결함” 으로 나온다 → 14차시 템플릿 매칭 · 피듀셜로 먼저 정렬(warpAffine)</text>
</svg>`;

  const EX_METAL = `using System;
using System.Collections.Generic;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var golden = Cv2.ImRead("images/metal_ok.png", ImreadModes.Grayscale);
        using var test = Cv2.ImRead("images/metal_scratch.png", ImreadModes.Grayscale);
        Console.WriteLine($"골든 {golden.Width}x{golden.Height}, 검사 {test.Width}x{test.Height}");

        // ① 차영상: 같은 위치의 밝기 차이
        using var diff = new Mat();
        Cv2.Absdiff(golden, test, diff);
        Cv2.MinMaxLoc(diff, out double dmin, out double dmax);
        Console.WriteLine($"차이 최대 {dmax:F0} (헤어라인 표면의 결함은 대비가 아주 약하다)");

        // ② 잡음 평탄화 → ③ 이진화 (임계값을 낮게!)
        using var smooth = new Mat();
        Cv2.GaussianBlur(diff, smooth, new Size(5, 5), 0);
        using var bin = new Mat();
        Cv2.Threshold(smooth, bin, 10, 255, ThresholdTypes.Binary);
        Console.WriteLine($"임계 10 통과 픽셀 {Cv2.CountNonZero(bin)} 개");

        // ④ 닫기(Close): 끊어진 긁힘 조각을 하나로 이어 붙인다
        using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(21, 21));
        Cv2.MorphologyEx(bin, bin, MorphTypes.Close, element);

        // ⑤ 윤곽선 → 결함 bbox
        Point[][] contours = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        var defects = new List<Rect>();
        foreach (Point[] c in contours)
            if (Cv2.ContourArea(c) >= 80) defects.Add(Cv2.BoundingRect(c));
        defects.Sort((a, b) => a.X.CompareTo(b.X));

        using var overlay = new Mat();
        Cv2.CvtColor(test, overlay, ColorConversionCodes.GRAY2BGR);
        Console.WriteLine($"결함 {defects.Count} 개 (정답 4개: 긁힘 S1 · S2, 얼룩 ST, 찍힘 D1)");
        for (int i = 0; i < defects.Count; i++)
        {
            Rect r = defects[i];
            Cv2.Rectangle(overlay, r, new Scalar(0, 0, 255), 2);
            Cv2.PutText(overlay, "D" + (i + 1), new Point(r.X, r.Y - 6), HersheyFonts.HersheySimplex, 0.5, new Scalar(0, 255, 255), 1);
            Console.WriteLine($"  D{i + 1} bbox ({r.X},{r.Y})-({r.X + r.Width},{r.Y + r.Height}) 크기 {r.Width}x{r.Height}");
        }
        Console.WriteLine($"판정: {(defects.Count == 0 ? "OK" : "NG")}");

        Cv2.ImShow("diff", smooth);
        Cv2.ImShow("defects", overlay);
        Cv2.WaitKey(0);
    }
}`;

  const EX_PCB = `using System;
using System.Collections.Generic;
using OpenCvSharp;

class Program
{
    // 두 사각형이 겹치는가 (검출 결과가 정답 위치를 맞혔는지 확인)
    static bool Overlaps(Rect a, Rect b)
    {
        return a.X < b.X + b.Width && b.X < a.X + a.Width
            && a.Y < b.Y + b.Height && b.Y < a.Y + a.Height;
    }

    static void Main()
    {
        using var golden = Cv2.ImRead("images/pcb_golden.png", ImreadModes.Color);
        using var board = Cv2.ImRead("images/pcb_board.png", ImreadModes.Color);

        using var ga = new Mat();
        using var gb = new Mat();
        Cv2.CvtColor(golden, ga, ColorConversionCodes.BGR2GRAY);
        Cv2.CvtColor(board, gb, ColorConversionCodes.BGR2GRAY);

        using var diff = new Mat();
        Cv2.Absdiff(ga, gb, diff);
        using var smooth = new Mat();
        Cv2.GaussianBlur(diff, smooth, new Size(5, 5), 0);
        using var bin = new Mat();
        Cv2.Threshold(smooth, bin, 30, 255, ThresholdTypes.Binary);   // PCB 는 대비가 커서 30
        using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(21, 21));
        Cv2.MorphologyEx(bin, bin, MorphTypes.Close, element);

        Point[][] contours = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        var found = new List<Rect>();
        foreach (Point[] c in contours)
            if (Cv2.ContourArea(c) >= 50) found.Add(Cv2.BoundingRect(c));
        found.Sort((a, b) => a.X.CompareTo(b.X));

        // IMAGES.md 의 정답 (x0, y0, x1, y1)
        string[] names = { "D1 극성 반대", "U1 솔더 브리지", "R3 부품 누락", "C2 이동·회전" };
        var truth = new List<Rect>();
        truth.Add(new Rect(120, 502, 60, 36));
        truth.Add(new Rect(234, 252, 32, 16));
        truth.Add(new Rect(300, 380, 60, 40));
        truth.Add(new Rect(600, 375, 65, 45));

        using var overlay = board.Clone();
        Console.WriteLine($"검출 결함 {found.Count} 개 / 정답 {truth.Count} 개");
        for (int i = 0; i < found.Count; i++)
        {
            Rect r = found[i];
            string match = "오검출(정답에 없음)";
            for (int k = 0; k < truth.Count; k++)
                if (Overlaps(r, truth[k])) match = names[k];
            Cv2.Rectangle(overlay, r, new Scalar(0, 0, 255), 2);
            Cv2.PutText(overlay, (i + 1).ToString(), new Point(r.X, r.Y - 8), HersheyFonts.HersheySimplex, 0.6, new Scalar(0, 255, 255), 2);
            Console.WriteLine($"  #{i + 1} ({r.X},{r.Y})-({r.X + r.Width},{r.Y + r.Height}) -> {match}");
        }

        int hit = 0;
        for (int k = 0; k < truth.Count; k++)
        {
            bool detected = false;
            foreach (Rect r in found) if (Overlaps(r, truth[k])) detected = true;
            if (detected) hit++;
            Cv2.Rectangle(overlay, truth[k], new Scalar(0, 255, 0), 1);
        }
        Console.WriteLine($"검출률 {hit} / {truth.Count} · 오검출 {found.Count - hit} 개");
        Console.WriteLine($"판정: {(found.Count == 0 ? "OK" : "NG")}");

        Cv2.ImShow("pcb defects", overlay);
        Cv2.WaitKey(0);
    }
}`;

  const EX_SAVERESULT = `using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using OpenCvSharp;

class Program
{
    static List<Rect> FindDefects(Mat golden, Mat test, double thr, int minArea)
    {
        using var diff = new Mat();
        Cv2.Absdiff(golden, test, diff);
        using var smooth = new Mat();
        Cv2.GaussianBlur(diff, smooth, new Size(5, 5), 0);
        using var bin = new Mat();
        Cv2.Threshold(smooth, bin, thr, 255, ThresholdTypes.Binary);
        using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(21, 21));
        Cv2.MorphologyEx(bin, bin, MorphTypes.Close, element);

        Point[][] contours = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        var list = new List<Rect>();
        foreach (Point[] c in contours)
            if (Cv2.ContourArea(c) >= minArea) list.Add(Cv2.BoundingRect(c));
        list.Sort((a, b) => a.X.CompareTo(b.X));
        return list;
    }

    static void Main()
    {
        using var golden = Cv2.ImRead("images/metal_ok.png", ImreadModes.Grayscale);
        using var test = Cv2.ImRead("images/metal_scratch.png", ImreadModes.Grayscale);
        List<Rect> defects = FindDefects(golden, test, 10, 80);

        // ① 오버레이 이미지 만들기 (판정 문구 포함)
        using var overlay = new Mat();
        Cv2.CvtColor(test, overlay, ColorConversionCodes.GRAY2BGR);
        var csv = new StringBuilder();
        csv.Append("id,x,y,w,h,area_px\\n");
        for (int i = 0; i < defects.Count; i++)
        {
            Rect r = defects[i];
            Cv2.Rectangle(overlay, r, new Scalar(0, 0, 255), 2);
            Cv2.PutText(overlay, "D" + (i + 1), new Point(r.X, r.Y - 6), HersheyFonts.HersheySimplex, 0.5, new Scalar(0, 255, 255), 1);
            csv.Append($"D{i + 1},{r.X},{r.Y},{r.Width},{r.Height},{r.Width * r.Height}\\n");
        }
        bool ok = defects.Count == 0;
        string verdict = ok ? "OK" : $"NG (결함 {defects.Count})";
        Cv2.PutText(overlay, verdict, new Point(12, 34), HersheyFonts.HersheySimplex, 1.0, Scalar.Black, 4);
        Cv2.PutText(overlay, verdict, new Point(12, 34), HersheyFonts.HersheySimplex, 1.0,
                    ok ? new Scalar(0, 255, 0) : new Scalar(0, 0, 255), 2);

        // ② 결과 이미지 · 리포트 저장 (NG 는 반드시 남긴다)
        bool saved = Cv2.ImWrite("out/metal_result.png", overlay);
        File.WriteAllText("out/metal_report.csv", csv.ToString());
        Console.WriteLine($"판정 {verdict}");
        Console.WriteLine($"결과 이미지 저장 {saved} -> out/metal_result.png ({overlay.Width}x{overlay.Height}, 채널 {overlay.Channels()})");
        Console.WriteLine($"리포트 저장 -> out/metal_report.csv");
        foreach (string line in File.ReadAllLines("out/metal_report.csv")) Console.WriteLine("  " + line);

        Cv2.ImShow("result", overlay);
        Cv2.WaitKey(0);
    }
}`;

  const EX_ALL = `using System;
using System.Collections.Generic;
using OpenCvSharp;

// wpf/Ch17_Inspection 의 세 검사기를 콘솔용으로 줄인 것 — 클래스 · 속성 이름과 기본값, 처리 순서는 실제 코드와 같다
// (실제 IInspector 는 InspectionResult 를 돌려주지만, 여기서는 판정과 요약만 돌려주도록 줄였다)
interface IInspector
{
    string Name { get; }
    bool NeedsGolden { get; }
    bool Inspect(Mat image, Mat golden, out string summary);
}

static class MatHelper
{
    public static Mat ToGray(Mat src)
    {
        if (src.Channels() == 1) return src.Clone();
        var gray = new Mat();
        Cv2.CvtColor(src, gray, ColorConversionCodes.BGR2GRAY);
        return gray;
    }

    public static Mat ToBgr(Mat src)
    {
        if (src.Channels() == 3) return src.Clone();
        var bgr = new Mat();
        Cv2.CvtColor(src, bgr, ColorConversionCodes.GRAY2BGR);
        return bgr;
    }

    // 바깥 윤곽선 중 면적이 minArea 이상인 것의 개수
    public static int CountContours(Mat bin, double minArea)
    {
        Point[][] contours = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        int n = 0;
        foreach (Point[] c in contours) if (Cv2.ContourArea(c) >= minArea) n++;
        return n;
    }
}

class CountInspector : IInspector
{
    public string Name { get { return "개수 세기 (Otsu + 윤곽선)"; } }
    public bool NeedsGolden { get { return false; } }
    public int MinArea { get; set; } = 300;
    public int ExpectedCount { get; set; }

    public bool Inspect(Mat image, Mat golden, out string summary)
    {
        using Mat gray = MatHelper.ToGray(image);
        using var blurred = new Mat();
        Cv2.GaussianBlur(gray, blurred, new Size(5, 5), 0);
        using var bin = new Mat();
        Cv2.Threshold(blurred, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        if (Cv2.CountNonZero(bin) / (double)(bin.Rows * bin.Cols) > 0.5)
            Cv2.BitwiseNot(bin, bin);
        using Mat element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(3, 3));
        Cv2.MorphologyEx(bin, bin, MorphTypes.Open, element);

        int found = MatHelper.CountContours(bin, MinArea);
        summary = $"검출 {found} 개 / 기대 {ExpectedCount} 개";
        return ExpectedCount <= 0 || found == ExpectedCount;
    }
}

class ColorSortInspector : IInspector
{
    public string Name { get { return "색 분류 (HSV InRange)"; } }
    public bool NeedsGolden { get { return false; } }
    public int MinArea { get; set; } = 400;
    public int ExpectedTotal { get; set; }

    public bool Inspect(Mat image, Mat golden, out string summary)
    {
        using Mat bgr = MatHelper.ToBgr(image);
        using var hsv = new Mat();
        Cv2.CvtColor(bgr, hsv, ColorConversionCodes.BGR2HSV);
        using Mat element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));

        // 실제 ColorSortInspector 의 범위 (빨강은 두 구간)
        int red = CountRange(hsv, element, new Scalar(0, 90, 60), new Scalar(8, 255, 255), true);
        int yellow = CountRange(hsv, element, new Scalar(18, 90, 60), new Scalar(35, 255, 255), false);
        int green = CountRange(hsv, element, new Scalar(40, 70, 50), new Scalar(85, 255, 255), false);
        int blue = CountRange(hsv, element, new Scalar(95, 90, 50), new Scalar(130, 255, 255), false);
        int white = CountRange(hsv, element, new Scalar(0, 0, 170), new Scalar(179, 60, 255), false);
        int total = red + yellow + green + blue + white;

        summary = $"빨강 {red} · 노랑 {yellow} · 초록 {green} · 파랑 {blue} · 흰색 {white} = 총 {total} 개 / 기대 {ExpectedTotal} 개";
        return ExpectedTotal <= 0 || total == ExpectedTotal;
    }

    int CountRange(Mat hsv, Mat element, Scalar lower, Scalar upper, bool isRed)
    {
        using var mask = new Mat();
        Cv2.InRange(hsv, lower, upper, mask);
        if (isRed)
        {
            using var mask2 = new Mat();
            Cv2.InRange(hsv, new Scalar(170, 90, 60), new Scalar(179, 255, 255), mask2);
            Cv2.BitwiseOr(mask, mask2, mask);
        }
        Cv2.MorphologyEx(mask, mask, MorphTypes.Open, element);
        Cv2.MorphologyEx(mask, mask, MorphTypes.Close, element);
        return MatHelper.CountContours(mask, MinArea);
    }
}

class DefectInspector : IInspector
{
    public string Name { get { return "결함 검사 (골든 이미지 차영상)"; } }
    public bool NeedsGolden { get { return true; } }
    public int DiffThreshold { get; set; } = 10;
    public int MinDefectArea { get; set; } = 20;

    public bool Inspect(Mat image, Mat golden, out string summary)
    {
        if (golden == null)
            throw new InvalidOperationException("결함 검사에는 골든(기준) 이미지가 필요합니다.");
        if (golden.Width != image.Width || golden.Height != image.Height)
            throw new InvalidOperationException("골든 이미지 크기가 다릅니다.");

        using Mat grayImage = MatHelper.ToGray(image);
        using Mat grayGolden = MatHelper.ToGray(golden);
        using var a = new Mat();
        using var b = new Mat();
        Cv2.GaussianBlur(grayImage, a, new Size(3, 3), 0);
        Cv2.GaussianBlur(grayGolden, b, new Size(3, 3), 0);

        using var diff = new Mat();
        Cv2.Absdiff(a, b, diff);
        using var mask = new Mat();
        Cv2.Threshold(diff, mask, DiffThreshold, 255, ThresholdTypes.Binary);
        using Mat element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
        Cv2.MorphologyEx(mask, mask, MorphTypes.Close, element);

        int defects = MatHelper.CountContours(mask, MinDefectArea);
        summary = defects == 0 ? "결함 없음" : $"결함 {defects} 개 발견";
        return defects == 0;
    }
}

class Program
{
    static void Run(IInspector inspector, string imagePath, string goldenPath)
    {
        using Mat image = Cv2.ImRead(imagePath, ImreadModes.Color);
        Mat golden = goldenPath != null ? Cv2.ImRead(goldenPath, ImreadModes.Color) : null;
        try
        {
            string summary;
            bool ok = inspector.Inspect(image, golden, out summary);
            string g = goldenPath != null ? " vs " + goldenPath.Replace("images/", "") : "";
            Console.WriteLine($"{(ok ? "OK" : "NG")} | {inspector.Name} | {imagePath.Replace("images/", "")}{g} | {summary}");
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"-- | {inspector.Name} | 검사할 수 없습니다: {ex.Message}");
        }
        finally
        {
            if (golden != null) golden.Dispose();
        }
    }

    static void Main()
    {
        var count = new CountInspector();
        var colorSort = new ColorSortInspector();
        var defect = new DefectInspector();
        IInspector[] inspectors = { count, colorSort, defect };   // MainWindow 의 _inspectors 와 같은 배열
        Console.WriteLine($"검사기 {inspectors.Length} 개: {inspectors[0].Name} / {inspectors[1].Name} / {inspectors[2].Name}");

        count.ExpectedCount = 11;
        Run(count, "images/washers.png", null);              // 13개지만 닿은 2쌍 때문에 11개
        count.ExpectedCount = 12;
        Run(count, "images/coins_parts.png", null);

        colorSort.ExpectedTotal = 20;
        Run(colorSort, "images/color_caps.png", null);

        Run(defect, "images/metal_scratch.png", null);       // 골든이 없으면?
        Run(defect, "images/metal_scratch.png", "images/metal_ok.png");
        Run(defect, "images/metal_ok.png", "images/metal_ok.png");      // 양품 → 헛검출 없는지
        Run(defect, "images/pcb_board.png", "images/pcb_golden.png");

        // 임계값을 올리면? 얇은 긁힘 · 옅은 얼룩부터 놓친다 (미검출)
        defect.DiffThreshold = 30;
        Run(defect, "images/metal_scratch.png", "images/metal_ok.png");
        defect.DiffThreshold = 40;
        Run(defect, "images/metal_scratch.png", "images/metal_ok.png");   // 불량인데 OK = 가장 위험한 오판정
    }
}`;

  const CS_DEFECT = `// Inspectors/DefectInspector.cs — wpf/Ch17_Inspection 의 실제 코드
using OpenCvSharp;

namespace Ch17_Inspection.Inspectors;

/// <summary>
/// 결함 검사기 — 골든(기준) 이미지와의 차영상으로 결함을 찾습니다.
///
/// 흐름: 두 이미지를 흑백 · 블러 → Cv2.Absdiff → 임계값(DiffThreshold) → 모폴로지 닫기
///       → 윤곽선 → 면적(MinDefectArea) 으로 걸러 결함 목록 작성
/// 검사 이미지와 골든 이미지는 같은 위치에서 찍혀 크기가 같아야 합니다 (정렬 전제).
/// </summary>
public sealed class DefectInspector : IInspector
{
    public string Name => "결함 검사 (골든 이미지 차영상)";

    public bool NeedsGolden => true;

    /// <summary>
    /// 차영상에서 이 값보다 밝은(= 차이가 큰) 픽셀을 결함 후보로 봅니다 (0~255). 낮추면 민감해집니다.
    /// 강좌 예제(metal_scratch/metal_ok, pcb_board/pcb_golden)에서는 10 이 잘 맞습니다.
    /// </summary>
    public int DiffThreshold { get; set; } = 10;

    /// <summary>이보다 작은 결함 후보는 잡음으로 버립니다 (픽셀 면적).</summary>
    public int MinDefectArea { get; set; } = 20;

    public InspectionResult Inspect(Mat image, Mat? golden)
    {
        if (golden == null)
            throw new InvalidOperationException("결함 검사에는 골든(기준) 이미지가 필요합니다. [골든 열기] 로 기준 영상을 불러오세요.");
        if (golden.Width != image.Width || golden.Height != image.Height)
            throw new InvalidOperationException(
                $"골든 이미지 크기가 다릅니다. 검사 {image.Width}x{image.Height}, 골든 {golden.Width}x{golden.Height}");

        // 1) 두 이미지를 같은 조건(흑백 + 블러)으로 맞춥니다. 블러는 잡음 차이를 줄여 줍니다.
        using Mat grayImage = MatHelper.ToGray(image);
        using Mat grayGolden = MatHelper.ToGray(golden);
        using var a = new Mat();
        using var b = new Mat();
        Cv2.GaussianBlur(grayImage, a, new Size(3, 3), 0);
        Cv2.GaussianBlur(grayGolden, b, new Size(3, 3), 0);

        // 2) 차영상: 밝아진 곳(긁힘)과 어두워진 곳(얼룩) 모두 절댓값으로 잡습니다.
        using var diff = new Mat();
        Cv2.Absdiff(a, b, diff);

        // 3) 임계값 → 이진 마스크 → 닫기로 끊어진 결함을 이어 붙입니다.
        using var mask = new Mat();
        Cv2.Threshold(diff, mask, DiffThreshold, 255, ThresholdTypes.Binary);
        using Mat element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
        Cv2.MorphologyEx(mask, mask, MorphTypes.Close, element);

        // 4) 결함 영역 찾기
        Cv2.FindContours(mask, out Point[][] contours, out _,
                         RetrievalModes.External, ContourApproximationModes.ApproxSimple);

        var defects = new List<(Rect Rect, double Area)>();
        foreach (Point[] contour in contours)
        {
            double area = Cv2.ContourArea(contour);
            if (area < MinDefectArea)
                continue;
            defects.Add((Cv2.BoundingRect(contour), area));
        }

        // 큰 결함이 위에 오도록 정렬
        defects.Sort((x, y) => y.Area.CompareTo(x.Area));

        // 5) 오버레이: 결함마다 빨간 사각형 + 번호(D1, D2 …)
        Mat overlay = MatHelper.ToBgr(image);
        var items = new List<InspectionItem>();
        for (int i = 0; i < defects.Count; i++)
        {
            (Rect rect, double area) = defects[i];
            var draw = new Rect(rect.X - 6, rect.Y - 6, rect.Width + 12, rect.Height + 12);
            Cv2.Rectangle(overlay, draw, Scalar.Red, 2);
            MatHelper.PutLabel(overlay, $"D{i + 1}", new Point(draw.X, draw.Y - 6), Scalar.Red);

            items.Add(new InspectionItem(
                $"D{i + 1}",
                $"위치 ({rect.X}, {rect.Y}) · 크기 {rect.Width}x{rect.Height} · 면적 {area:F0} px²",
                "NG"));
        }

        bool isOk = defects.Count == 0;
        string summary = isOk ? "결함 없음" : $"결함 {defects.Count} 개 발견";

        items.Insert(0, new InspectionItem("결함 개수", $"{defects.Count} 개", isOk ? "OK" : "NG"));
        items.Insert(1, new InspectionItem("차영상 임계값", $"{DiffThreshold} (면적 하한 {MinDefectArea} px²)"));

        MatHelper.PutJudge(overlay, isOk);
        return new InspectionResult(isOk, summary, overlay, items);
    }
}`;

  const XAML_INSPECT = `<Window x:Class="Ch17_Inspection.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="17차시 실전 검사 프로젝트" Height="760" Width="1280"
        WindowStartupLocation="CenterScreen">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" />   <!-- 상단 툴바 -->
            <RowDefinition Height="*" />      <!-- 이미지 2개 + 결과 패널 -->
            <RowDefinition Height="Auto" />   <!-- 상태 표시줄 -->
        </Grid.RowDefinitions>

        <!-- ───── 상단 툴바: 검사 선택 · 파일 · 파라미터 ───── -->
        <ToolBar Grid.Row="0">
            <TextBlock Text="검사" VerticalAlignment="Center" Margin="4,0" />
            <ComboBox x:Name="InspectorCombo" Width="220" SelectionChanged="InspectorCombo_SelectionChanged" />
            <Separator />
            <Button Content="이미지 열기" Click="OpenImageButton_Click" Style="{StaticResource ToolButton}" />
            <Button x:Name="OpenGoldenButton" Content="골든 열기" Click="OpenGoldenButton_Click" Style="{StaticResource ToolButton}" />
            <Button x:Name="InspectButton" Content="검사 실행" Click="InspectButton_Click" Style="{StaticResource ToolButton}"
                    FontWeight="Bold" IsEnabled="False" />
            <Separator />
            <TextBlock x:Name="ParamLabel" Text="파라미터" VerticalAlignment="Center" Margin="4,0" MinWidth="110" />
            <Slider x:Name="ParamSlider" Width="150" Minimum="0" Maximum="100" Value="0"
                    VerticalAlignment="Center" IsSnapToTickEnabled="True" TickFrequency="1"
                    ValueChanged="ParamSlider_ValueChanged" />
            <TextBlock x:Name="ParamValue" Text="-" VerticalAlignment="Center" MinWidth="48" Margin="6,0" FontFamily="Consolas" />
            <Separator />
            <TextBlock Text="기대 개수" VerticalAlignment="Center" Margin="4,0" />
            <TextBox x:Name="ExpectedCountBox" Text="0" Width="46" VerticalAlignment="Center" TextAlignment="Center"
                     ToolTip="0 이면 개수 판정을 하지 않습니다" />
            <Separator />
            <Button Content="오버레이 저장" Click="SaveOverlayButton_Click" Style="{StaticResource ToolButton}" />
            <Button Content="결과 CSV 저장" Click="SaveCsvButton_Click" Style="{StaticResource ToolButton}" />
        </ToolBar>

        <!-- ───── 가운데: 원본 · 검사 결과 오버레이 · 오른쪽 결과 패널 ───── -->
        <Grid Grid.Row="1">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="*" />
                <ColumnDefinition Width="*" />
                <ColumnDefinition Width="320" />
            </Grid.ColumnDefinitions>

            <!-- 검사 이미지 -->
            <DockPanel Grid.Column="0" Background="#FF2D2D30">
                <TextBlock DockPanel.Dock="Top" x:Name="SourceCaption" Text="검사 이미지" Foreground="White" Margin="8,6" />
                <Image x:Name="SourceImage" Stretch="Uniform" Margin="8" />
            </DockPanel>

            <!-- 검사 결과 오버레이 -->
            <DockPanel Grid.Column="1" Background="#FF2D2D30">
                <TextBlock DockPanel.Dock="Top" Text="검사 결과 (오버레이)" Foreground="White" Margin="8,6" />
                <Image x:Name="OverlayImage" Stretch="Uniform" Margin="8" />
            </DockPanel>

            <!-- 판정 · 결과 표 -->
            <DockPanel Grid.Column="2" Background="#FFF3F3F3">
                <Border DockPanel.Dock="Top" x:Name="JudgeBorder" Background="#FFBDBDBD" Padding="10,8" Margin="8">
                    <StackPanel>
                        <TextBlock x:Name="JudgeText" Text="판정 대기" FontSize="30" FontWeight="Bold" Foreground="White" />
                        <TextBlock x:Name="SummaryText" Text="이미지를 열고 [검사 실행] 을 누르세요." Foreground="White" TextWrapping="Wrap" />
                    </StackPanel>
                </Border>

                <TextBlock DockPanel.Dock="Top" x:Name="StatsText" Text="검사 0 회 · OK 0 · NG 0" Margin="10,0,10,6" Foreground="#FF505050" />
                <TextBlock DockPanel.Dock="Top" x:Name="GoldenText" Text="골든 이미지: 없음" Margin="10,0,10,8" Foreground="#FF505050" TextWrapping="Wrap" />

                <DataGrid x:Name="ResultGrid" Margin="8,0,8,8" AutoGenerateColumns="False" IsReadOnly="True"
                          HeadersVisibility="Column" GridLinesVisibility="Horizontal" CanUserAddRows="False">
                    <DataGrid.Columns>
                        <DataGridTextColumn Header="항목" Binding="{Binding Item}" Width="70" />
                        <DataGridTextColumn Header="값" Binding="{Binding Value}" Width="*" />
                        <DataGridTextColumn Header="판정" Binding="{Binding Judge}" Width="46" />
                    </DataGrid.Columns>
                </DataGrid>
            </DockPanel>
        </Grid>

        <!-- ───── 상태 표시줄 ───── -->
        <StatusBar Grid.Row="2">
            <StatusBarItem>
                <TextBlock x:Name="StatusText" Text="[이미지 열기] → (결함 검사는 [골든 열기] 도) → [검사 실행]" />
            </StatusBarItem>
        </StatusBar>
    </Grid>
</Window>`;

  const CS_INSPECT_WINDOW = `// MainWindow.xaml.cs — wpf/Ch17_Inspection 의 실제 코드 (partial class MainWindow)
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using Ch17_Inspection.Inspectors;
using Microsoft.Win32;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;
using Window = System.Windows.Window;

namespace Ch17_Inspection;

/// <summary>
/// 17차시 실전 검사 프로젝트 — 개수 세기 · 색 분류 · 결함 검사를 한 앱에서 돌려 보고
/// 판정(OK / NG) · 결과 표 · 통계를 보여 줍니다.
///
/// Mat 소유 관계
///   _image  : 검사할 원본 (다른 이미지를 열 때까지 보관)
///   _golden : 결함 검사용 기준(골든) 이미지
///   _result : 검사 결과(오버레이 Mat 포함). 새 검사를 하면 이전 결과를 Dispose
///
/// 검사 로직은 모두 Inspectors/ 폴더의 IInspector 구현 클래스에 있고, 이 창은 화면 담당입니다.
/// </summary>
public partial class MainWindow : Window
{
    // 검사기 3개. 파라미터를 바꾸기 위해 구체 타입으로도 들고 있습니다.
    private readonly CountInspector _count = new();
    private readonly ColorSortInspector _colorSort = new();
    private readonly DefectInspector _defect = new();
    private readonly IInspector[] _inspectors;

    private Mat? _image;
    private Mat? _golden;
    private InspectionResult? _result;

    private string _fileName = "";
    private string _goldenName = "";
    private int _runCount, _okCount, _ngCount;
    private bool _updatingUi;   // 슬라이더 범위를 코드로 바꾸는 동안 ValueChanged 무시

    public MainWindow()
    {
        InitializeComponent();

        _inspectors = new IInspector[] { _count, _colorSort, _defect };
        InspectorCombo.DisplayMemberPath = nameof(IInspector.Name);   // ComboBox 에는 Name 을 보여 줌
        InspectorCombo.ItemsSource = _inspectors;
        InspectorCombo.SelectedIndex = 0;
    }

    /// <summary>지금 선택된 검사기</summary>
    private IInspector Current => (InspectorCombo.SelectedItem as IInspector) ?? _count;

    // ───────────── 파일 열기 ─────────────

    private void OpenImageButton_Click(object sender, RoutedEventArgs e)
    {
        string? path = AskOpenPath("검사 이미지 열기");
        if (path == null) return;

        try
        {
            Mat loaded = ImageFile.Load(path);
            _image?.Dispose();
            _image = loaded;
            _fileName = Path.GetFileName(path);
            SourceCaption.Text = $"검사 이미지 — {_fileName} ({_image.Width} x {_image.Height})";
            SourceImage.Source = _image.ToBitmapSource();
            Title = $"17차시 실전 검사 프로젝트 - {_fileName}";

            ClearResult();
            UpdateButtons();
            StatusText.Text = $"{_fileName} 를 열었습니다. [검사 실행] 을 누르세요.";
            if (InspectButton.IsEnabled)
                RunInspection();   // 준비가 끝났으면 바로 한 번 검사
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "열기 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void OpenGoldenButton_Click(object sender, RoutedEventArgs e)
    {
        string? path = AskOpenPath("골든(기준) 이미지 열기");
        if (path == null) return;

        try
        {
            Mat loaded = ImageFile.Load(path);
            _golden?.Dispose();
            _golden = loaded;
            _goldenName = Path.GetFileName(path);
            GoldenText.Text = $"골든 이미지: {_goldenName} ({_golden.Width} x {_golden.Height})";

            UpdateButtons();
            if (InspectButton.IsEnabled)
                RunInspection();
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "열기 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private string? AskOpenPath(string title)
    {
        var dlg = new OpenFileDialog { Title = title, Filter = ImageFile.OpenFilter };
        if (Directory.Exists(ImageFile.ImagesDir))
            dlg.InitialDirectory = ImageFile.ImagesDir;   // 예제 이미지 폴더부터 열기
        return dlg.ShowDialog(this) == true ? dlg.FileName : null;
    }

    // ───────────── 검사 실행 ─────────────

    private void InspectButton_Click(object sender, RoutedEventArgs e) => RunInspection();

    /// <summary>선택된 검사기로 한 번 검사하고 화면 · 표 · 통계를 갱신합니다.</summary>
    private void RunInspection()
    {
        if (_image == null)
        {
            MessageBox.Show(this, "먼저 [이미지 열기] 로 검사할 이미지를 불러오세요.", "안내");
            return;
        }

        Mat image = _image;   // 아래에서 계속 쓰므로 지역 변수로 받아 둡니다
        ApplyParamsToInspector();

        try
        {
            var sw = Stopwatch.StartNew();
            InspectionResult result = Current.Inspect(image, _golden);   // 결함 검사만 골든을 씁니다
            sw.Stop();

            _result?.Dispose();          // 이전 결과(오버레이 Mat) 해제
            _result = result;

            OverlayImage.Source = _result.Overlay.ToBitmapSource();
            ResultGrid.ItemsSource = _result.Items;
            ShowJudge(_result.IsOk, _result.Summary);

            _runCount++;
            if (_result.IsOk) _okCount++; else _ngCount++;
            StatsText.Text = $"검사 {_runCount} 회 · OK {_okCount} · NG {_ngCount}";
            StatusText.Text = $"{Current.Name}  |  {_fileName}  |  {sw.Elapsed.TotalMilliseconds:F1} ms";
        }
        catch (OpenCVException ex)
        {
            MessageBox.Show(this, ex.Message, "OpenCV 오류", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        catch (InvalidOperationException ex)
        {
            // 골든 이미지가 없거나 크기가 다른 경우 등 — 사용자가 고칠 수 있는 문제
            MessageBox.Show(this, ex.Message, "검사할 수 없습니다", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    /// <summary>툴바의 슬라이더 · 기대 개수 값을 선택된 검사기의 속성에 넣습니다.</summary>
    private void ApplyParamsToInspector()
    {
        int param = (int)Math.Round(ParamSlider.Value);
        int expected = int.TryParse(ExpectedCountBox.Text, out int n) && n >= 0 ? n : 0;

        switch (Current)
        {
            case CountInspector c:
                c.MinArea = param;
                c.ExpectedCount = expected;
                break;
            case ColorSortInspector s:
                s.MinArea = param;
                s.ExpectedTotal = expected;
                break;
            case DefectInspector d:
                d.DiffThreshold = param;
                break;
        }
    }

    // ───────────── 검사 선택 · 파라미터 UI ─────────────

    private void InspectorCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (ParamSlider == null) return;   // XAML 초기화 도중 호출될 수 있음

        switch (Current)
        {
            case CountInspector c:
                ConfigureParam("면적 하한(px²)", 0, 5000, c.MinArea, 10);
                break;
            case ColorSortInspector s:
                ConfigureParam("면적 하한(px²)", 0, 5000, s.MinArea, 10);
                break;
            case DefectInspector d:
                ConfigureParam("차영상 임계값", 5, 120, d.DiffThreshold, 1);
                break;
        }

        OpenGoldenButton.IsEnabled = Current.NeedsGolden;
        ExpectedCountBox.IsEnabled = Current is not DefectInspector;   // 결함 검사는 기대 개수를 쓰지 않음
        ClearResult();
        UpdateButtons();
    }

    private void ConfigureParam(string label, double min, double max, double value, double tick)
    {
        _updatingUi = true;
        try
        {
            ParamSlider.Minimum = min;
            ParamSlider.Maximum = max;
            ParamSlider.TickFrequency = tick;
            ParamSlider.Value = value;
            ParamLabel.Text = label;
            ParamValue.Text = $"{value:F0}";
        }
        finally
        {
            _updatingUi = false;
        }
    }

    private void ParamSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        if (_updatingUi || ParamValue == null) return;
        ParamValue.Text = $"{e.NewValue:F0}";
    }

    // ───────────── 저장 ─────────────

    private void SaveOverlayButton_Click(object sender, RoutedEventArgs e)
    {
        if (_result == null) { MessageBox.Show(this, "먼저 검사를 실행하세요.", "안내"); return; }

        var dlg = new SaveFileDialog { Title = "오버레이 저장", Filter = ImageFile.SaveFilter, FileName = "inspection.png" };
        if (dlg.ShowDialog(this) != true) return;

        try
        {
            ImageFile.Save(dlg.FileName, _result.Overlay);
            StatusText.Text = $"오버레이를 저장했습니다: {dlg.FileName}";
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "저장 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void SaveCsvButton_Click(object sender, RoutedEventArgs e)
    {
        if (_result == null) { MessageBox.Show(this, "먼저 검사를 실행하세요.", "안내"); return; }

        var dlg = new SaveFileDialog { Title = "결과 CSV 저장", Filter = "CSV 파일|*.csv", FileName = "inspection.csv" };
        if (dlg.ShowDialog(this) != true) return;

        try
        {
            var sb = new StringBuilder();
            sb.AppendLine("검사,이미지,골든,판정,요약");
            sb.AppendLine($"{Csv(Current.Name)},{Csv(_fileName)},{Csv(_goldenName)}," +
                          $"{(_result.IsOk ? "OK" : "NG")},{Csv(_result.Summary)}");
            sb.AppendLine();
            sb.AppendLine("항목,값,판정");
            foreach (InspectionItem item in _result.Items)
                sb.AppendLine($"{Csv(item.Item)},{Csv(item.Value)},{Csv(item.Judge)}");

            // Excel 이 한글을 바로 읽도록 BOM 이 있는 UTF-8 로 저장
            File.WriteAllText(dlg.FileName, sb.ToString(), new UTF8Encoding(true));
            StatusText.Text = $"결과를 저장했습니다: {dlg.FileName}";
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "저장 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    /// <summary>쉼표 · 따옴표가 있는 값을 CSV 규칙에 맞게 감쌉니다.</summary>
    private static string Csv(string value)
        => value.Contains(',') || value.Contains('"') ? $"\\"{value.Replace("\\"", "\\"\\"")}\\"" : value;

    // ───────────── 화면 갱신 ─────────────

    private void ShowJudge(bool isOk, string summary)
    {
        JudgeText.Text = isOk ? "OK" : "NG";
        SummaryText.Text = summary;
        JudgeBorder.Background = new SolidColorBrush(isOk
            ? Color.FromRgb(0x2E, 0x7D, 0x32)    // 초록
            : Color.FromRgb(0xC6, 0x28, 0x28));  // 빨강
    }

    private void ClearResult()
    {
        _result?.Dispose();
        _result = null;
        OverlayImage.Source = null;
        ResultGrid.ItemsSource = null;
        JudgeText.Text = "판정 대기";
        SummaryText.Text = Current.NeedsGolden
            ? "검사 이미지와 골든 이미지를 열고 [검사 실행] 을 누르세요."
            : "이미지를 열고 [검사 실행] 을 누르세요.";
        JudgeBorder.Background = new SolidColorBrush(Color.FromRgb(0xBD, 0xBD, 0xBD));
    }

    private void UpdateButtons()
    {
        // 결함 검사는 골든 이미지가 있어야 실행할 수 있습니다.
        InspectButton.IsEnabled = _image != null && (!Current.NeedsGolden || _golden != null);
    }

    // ───────────── 정리 ─────────────

    protected override void OnClosed(EventArgs e)
    {
        _result?.Dispose();
        _golden?.Dispose();
        _image?.Dispose();
        base.OnClosed(e);
    }
}`;

  const SEC3 = {
    id: 'cs17-3', title: '결함 검사(골든 비교) · 검사 앱 완성 · 강좌 정리', minutes: 50,
    goals: ['골든 이미지 차영상으로 예상 못한 결함의 위치를 찾을 수 있다', '검출 결과를 정답과 대조해 검출률 · 오검출을 평가할 수 있다', '세 검사기를 하나의 인터페이스로 묶은 검사 앱 구조를 설명하고 결과를 이미지 · CSV 로 남길 수 있다'],
    flow: [['골든 이미지 비교', 16], ['PCB 결함 · 평가', 12], ['검사 앱 완성', 12], ['강좌 정리 · 다음 학습', 10]],
    content: [
      { type: 'h', text: '예상 못한 결함은 어떻게 찾나' },
      { type: 'p', html: '1 · 2교시의 검사는 <b>무엇을 찾을지 알고 있었습니다</b> — 부품 개수, 색, 정해진 자리. 그런데 “긁힘 · 얼룩 · 찍힘” 처럼 <b>어디에 어떤 모양으로 생길지 모르는</b> 결함은 규칙을 미리 쓸 수 없습니다. 이럴 때 쓰는 가장 기본적이고 강력한 방법이 <b>골든 이미지 비교</b>입니다: <b>양품 기준 영상</b>과 검사 영상의 <b>차이</b>를 구해, 차이가 큰 영역을 결함으로 봅니다.' },
      { type: 'figure', html: FIG_GOLDEN, caption: '그림 5. 골든 비교 파이프라인 — Absdiff → GaussianBlur → Threshold → Close → FindContours → bbox' },
      { type: 'callout', kind: 'warn', title: '전제: 두 영상이 픽셀 단위로 정렬되어 있어야 한다', html: '카메라 · 위치 · 조명이 같아야 하고, 제품이 놓인 위치가 1~2픽셀만 어긋나도 <b>모든 경계선이 결함으로</b> 나옵니다. 그래서 실제 장비는 ① 제품을 지그로 고정하거나 ② 14차시의 <b>템플릿 매칭 · 피듀셜 마크</b>로 위치를 찾아 <code>Cv2.WarpAffine</code> 으로 정렬한 뒤 비교합니다. 이 차시의 <code>metal_ok</code> ↔ <code>metal_scratch</code>, <code>pcb_golden</code> ↔ <code>pcb_board</code> 는 <b>이미 정렬된</b> 쌍입니다.' },
      { type: 'code', title: '예제 1: 금속 표면 결함 4개 찾기 (metal_ok vs metal_scratch)', code: EX_METAL,
        desc: '헤어라인 금속 표면의 결함은 <b>차이 최대값이 58</b>(블러 뒤에는 38)밖에 되지 않고 대부분의 결함 픽셀은 차이가 10~20 입니다 — 그래서 임계값을 <b>10</b> 처럼 낮게 잡아야 합니다(PCB 는 30). 대신 낮은 임계값은 잡음도 통과시키므로 <code>GaussianBlur</code>(평탄화) → <code>Close</code>(조각 이어 붙이기) → <b>면적 필터</b> 세 단계로 걸러냅니다. <code>Close</code> 를 21×21 로 크게 잡은 이유는 긁힘 S1 이 <b>가늘고 길어</b> 여러 조각으로 끊기기 때문입니다. 결과는 IMAGES.md 의 정답 4개(S1 긁힘 · S2 긁힘 · ST 얼룩 · D1 찍힘)와 일치합니다.',
        expect: '골든 640x480, 검사 640x480\n차이 최대 58 (헤어라인 표면의 결함은 대비가 아주 약하다)\n임계 10 통과 픽셀 5812 개\n결함 4 개 (정답 4개: 긁힘 S1 · S2, 얼룩 ST, 찍힘 D1)\n  D1 bbox (109,94)-(432,177) 크기 323x83\n  D2 bbox (173,343)-(207,378) 크기 34x35\n  D3 bbox (427,304)-(518,372) 크기 91x68\n  D4 bbox (470,80)-(561,141) 크기 91x61\n판정: NG' },
      { type: 'table', head: ['이미지', '차이 최대', '임계값', 'Close 커널', '최소 면적', '결함'], rows: [
        ['<code>metal_scratch.png</code> (헤어라인 금속)', '58', '10', '21', '80', '4개 (S1 · S2 · ST · D1)'],
        ['<code>pcb_board.png</code> (초록 솔더마스크 PCB)', '120', '30', '21', '50', '4개 (R3 · C2 · D1 · U1)'],
        ['앱 기본값 <code>DefectInspector</code> (두 영상 모두)', '-', '10', '5', '20', 'metal 5개 · PCB 5개 (조각이 덜 이어짐)']
      ], caption: '표 2. 같은 파이프라인, 다른 파라미터 — 표면 대비에 따라 임계값이 3배 차이 나고, 닫기 커널이 작으면 한 결함이 두 조각으로 세어진다' },
      { type: 'code', title: '예제 2: PCB 결함 검사 + 정답 대조 (검출률 평가)', code: EX_PCB,
        desc: '<b>검출 결과를 정답과 대조하는 코드</b>를 함께 두는 것이 이 예제의 요점입니다. 검사 알고리즘을 만들 때는 반드시 <b>정답이 있는 샘플 세트</b>로 ① 검출률(정답 중 몇 개를 찾았나) ② 오검출(정답이 아닌 것을 몇 개 찾았나)을 재야 합니다. 결과는 4/4 검출 · 오검출 0 입니다. 초록 사각형이 정답, 빨간 사각형이 검출 결과입니다.',
        expect: '검출 결함 4 개 / 정답 4 개\n  #1 (137,509)-(164,532) -> D1 극성 반대\n  #2 (246,256)-(255,265) -> U1 솔더 브리지\n  #3 (313,389)-(353,415) -> R3 부품 누락\n  #4 (613,382)-(659,415) -> C2 이동·회전\n검출률 4 / 4 · 오검출 0 개\n판정: NG' },
      { type: 'callout', kind: 'tip', title: '검출률과 오검출(과검) 의 균형', html: '임계값을 낮추면 <b>검출률↑ 오검출↑</b>, 높이면 <b>검출률↓ 오검출↓</b> 입니다. 현장에서는 보통 “<b>불량을 놓치지 않는 것</b>”이 우선이므로 오검출을 어느 정도 감수하고 임계값을 낮춘 뒤, NG 로 나온 것만 사람이 재확인합니다(과검율 목표를 정해 둡니다). 반대로 과검이 너무 많으면 라인이 멈추므로 <b>정답 세트로 측정해 균형점을 찾는 것</b>이 개발의 핵심 작업입니다.' },
      { type: 'code', title: '예제 3: 검사 결과 이미지 · 리포트 저장', code: EX_SAVERESULT,
        desc: 'NG 는 <b>반드시 근거를 남깁니다</b>. 오버레이에 판정 문구를 그려 <code>Cv2.ImWrite</code> 로 저장하고, 결함 목록을 CSV 로 남깁니다. 판정 문구를 <b>검은 굵은 글자 위에 색 글자</b>를 겹쳐 그리는 것은 어떤 배경에서도 읽히게 하는 요령입니다. 저장한 파일은 왼쪽 <b>📁 작업 폴더</b>에서 확인하세요.',
        expect: '판정 NG (결함 4)\n결과 이미지 저장 True -> out/metal_result.png (640x480, 채널 3)\n리포트 저장 -> out/metal_report.csv\n  id,x,y,w,h,area_px\n  D1,109,94,323,83,26809\n  D2,173,343,34,35,1190\n  D3,427,304,91,68,6188\n  D4,470,80,91,61,5551' },
      { type: 'h', text: '세 검사기를 하나로 묶기' },
      { type: 'p', html: '이제 세 검사기가 모두 같은 모양(<code>Name</code> · <code>NeedsGolden</code> · <code>Inspect</code>)을 갖췄으므로 <b>인터페이스</b>로 묶을 수 있습니다. 그러면 화면 코드는 <code>ComboBox</code> 에서 고른 검사기를 <code>Inspect</code> 하고 결과를 보여 주기만 하면 되고, <b>검사기를 추가해도 화면 코드는 바뀌지 않습니다</b>.' },
      { type: 'code', title: '예제 4: IInspector 로 세 검사를 한 번에 돌리기', code: EX_ALL,
        desc: '<code>wpf/Ch17_Inspection</code> 의 <code>CountInspector</code> · <code>ColorSortInspector</code> · <code>DefectInspector</code> 를 <b>같은 이름 · 같은 속성 · 같은 기본값 · 같은 처리 순서</b>로 옮기고, 반환만 <code>bool</code> + 요약 문자열로 줄였습니다. <code>IInspector[] inspectors = { count, colorSort, defect };</code> 는 <code>MainWindow</code> 의 <code>_inspectors</code> 배열과 같은 모양입니다 — 같은 방식으로 호출하는 것이 <b>다형성(polymorphism)</b>입니다. 결과는 앱 README 의 표와 같습니다: washers 11개(기대 11) OK · coins_parts 12개 OK · 색 20개 OK · metal 결함 <b>5개</b> NG(찍힘 D1 의 밝은 쪽/어두운 쪽이 두 조각으로 잡혀 정답 4개보다 하나 많음) · 양품끼리 0개 OK · PCB 5개 NG. 골든 없이 결함 검사를 부르면 <code>InvalidOperationException</code> 으로 안내합니다. 마지막 두 줄은 <b>임계값을 올리면 불량을 놓치는</b> 모습입니다(아래 경고 상자).',
        expect: '검사기 3 개: 개수 세기 (Otsu + 윤곽선) / 색 분류 (HSV InRange) / 결함 검사 (골든 이미지 차영상)\nOK | 개수 세기 (Otsu + 윤곽선) | washers.png | 검출 11 개 / 기대 11 개\nOK | 개수 세기 (Otsu + 윤곽선) | coins_parts.png | 검출 12 개 / 기대 12 개\nOK | 색 분류 (HSV InRange) | color_caps.png | 빨강 5 · 노랑 6 · 초록 4 · 파랑 3 · 흰색 2 = 총 20 개 / 기대 20 개\n-- | 결함 검사 (골든 이미지 차영상) | 검사할 수 없습니다: 결함 검사에는 골든(기준) 이미지가 필요합니다.\nNG | 결함 검사 (골든 이미지 차영상) | metal_scratch.png vs metal_ok.png | 결함 5 개 발견\nOK | 결함 검사 (골든 이미지 차영상) | metal_ok.png vs metal_ok.png | 결함 없음\nNG | 결함 검사 (골든 이미지 차영상) | pcb_board.png vs pcb_golden.png | 결함 5 개 발견\nNG | 결함 검사 (골든 이미지 차영상) | metal_scratch.png vs metal_ok.png | 결함 1 개 발견\nOK | 결함 검사 (골든 이미지 차영상) | metal_scratch.png vs metal_ok.png | 결함 없음' },
      { type: 'callout', kind: 'warn', title: '임계값 하나로 “불량을 OK 로” 보내는 사고', html: '앱의 <code>DefectInspector.DiffThreshold</code> 기본값은 <b>10</b> 입니다. 슬라이더로 <b>30</b> 까지 올리면 폭 1.8px 의 얇은 긁힘과 밝기 차 22 의 옅은 얼룩부터 놓칩니다 — 위 실행에서는 결함이 <b>1개</b>(가장 뚜렷한 것)만 남고, <b>40</b> 에서는 <b>0개 → OK</b> 가 됩니다. 앱 README 에는 로컬 PC(네이티브 OpenCV)에서 <b>30 이면 이미 0개(OK 오판정)</b> 라고 적혀 있습니다 — 경계값 근처에서는 블러 · 반올림 구현 차이로 결과가 달라질 수 있다는 것도 좋은 교훈입니다. 불량을 양품으로 내보내는 <b>미검출</b>은 헛검출보다 훨씬 비싼 사고이므로, 임계값은 반드시 <b>정답 세트</b>로 검출률과 헛검출을 함께 재서 정합니다.' },
      { type: 'code', title: 'Inspectors/DefectInspector.cs — 골든 비교 검사기 (Visual Studio 에서 실행)', code: CS_DEFECT, run: false, local: true, file: 'DefectInspector.cs',
        desc: '<code>NeedsGolden = true</code> 이고 파라미터는 <code>DiffThreshold</code>(기본 10, 화면 슬라이더 5~120) · <code>MinDefectArea</code>(기본 20 px²) 두 개입니다. 예제 1 과의 차이: 차영상을 만들기 <b>전에</b> 두 영상을 각각 <code>GaussianBlur 3×3</code> 하고, 닫기 커널이 <b>5×5</b> 로 작고, 면적 하한도 20 으로 작습니다 — 그래서 결함 조각이 이어 붙지 않아 metal 은 <b>5개</b>(찍힘 D1 이 밝은 쪽/어두운 쪽 두 조각), 예제 1 처럼 21×21 로 닫으면 4개가 됩니다. 결함은 <b>면적이 큰 순서</b>로 D1, D2 … 번호를 붙이고, 사각형은 6px 여유를 두고 그립니다. <code>golden == null</code> 과 <b>크기 불일치</b>를 <code>InvalidOperationException</code> 으로 구분해 던지는 것에 주목하세요 — “사용 방법 오류”와 “처리 오류(<code>OpenCVException</code>)”를 나누면 화면에서 다른 메시지를 보여 줄 수 있습니다.' },
      { type: 'code', title: 'MainWindow.xaml — 검사 앱 화면 (Visual Studio 에서 실행)', code: XAML_INSPECT, lang: 'xml', file: 'MainWindow.xaml', run: false,
        desc: '<b>Grid 3행</b>(ToolBar · 내용 · StatusBar) 구성이고, 가운데 행은 다시 <b>3열</b>(검사 이미지 <code>SourceImage</code> · 오버레이 <code>OverlayImage</code> · 폭 320 결과 패널)입니다. 위 <code>ToolBar</code> 에 검사 선택 <code>InspectorCombo</code>, [이미지 열기] · [골든 열기](<code>OpenGoldenButton</code>) · <b>[검사 실행]</b>(<code>InspectButton</code>, 처음엔 비활성), 파라미터 <code>ParamLabel</code> · <code>ParamSlider</code> · <code>ParamValue</code>, [기대 개수] <code>ExpectedCountBox</code>, [오버레이 저장] · [결과 CSV 저장]이 있고, 오른쪽 패널은 판정 상자(<code>JudgeBorder</code> · <code>JudgeText</code> · <code>SummaryText</code>) · 누적 통계 <code>StatsText</code> · <code>GoldenText</code> · <code>ResultGrid</code> 입니다. <code>DataGrid</code> 의 <code>Binding="{Binding Item}"</code> 이 <code>InspectionItem</code> 의 속성 이름과 일치해야 합니다 — 그래서 결과 클래스의 속성 이름이 곧 화면의 열이 됩니다.' },
      { type: 'code', title: 'MainWindow.xaml.cs — 검사 실행 · 저장 (Visual Studio 에서 실행)', code: CS_INSPECT_WINDOW, run: false, local: true, file: 'MainWindow.xaml.cs',
        desc: '읽을 곳 네 군데: ① 생성자에서 <code>_inspectors = { _count, _colorSort, _defect }</code> 를 <code>InspectorCombo.ItemsSource</code> 로, <code>DisplayMemberPath = nameof(IInspector.Name)</code> 로 이름만 보이게 한다 ② <code>InspectorCombo_SelectionChanged</code> 가 검사기마다 슬라이더의 뜻 · 범위를 바꾸고(<code>ConfigureParam</code> — 16차시의 <code>_updatingUi</code> 패턴), <code>OpenGoldenButton.IsEnabled = Current.NeedsGolden</code> ③ <code>ApplyParamsToInspector</code> 가 <code>switch (Current) { case CountInspector c: … }</code> <b>형식 패턴</b>으로 화면 값을 검사기 속성(<code>MinArea</code> · <code>ExpectedCount</code> · <code>ExpectedTotal</code> · <code>DiffThreshold</code>)에 넣는다 ④ <code>RunInspection</code> 이 이전 결과를 <code>Dispose</code> 하고, 예외를 <code>OpenCVException</code> / <code>InvalidOperationException</code> <b>두 종류로 나눠</b> 다른 메시지를 보여 준다. <code>ResultGrid.ItemsSource = _result.Items;</code> 한 줄로 표가 채워지는 것이 WPF 데이터 바인딩의 힘이고, CSV 는 Excel 이 한글을 바로 읽도록 <b>BOM 있는 UTF-8</b>(<code>new UTF8Encoding(true)</code>)로 저장합니다.' },
      { type: 'h', text: '강좌 전체 정리' },
      { type: 'table', head: ['Part', '차시', '핵심', '이 차시에서 쓴 곳'], rows: [
        ['1. 준비', '00~02', 'OpenCvSharp 설치 · WPF 에 <code>Mat → BitmapSource</code> 표시', '오버레이를 <code>Image</code> 에 표시'],
        ['2. 기초', '03 Mat · 04 그리기', '픽셀 접근 · ROI · 도형 · 텍스트', '오버레이 사각형 · 번호 · 판정 문구'],
        ['2. 기초', '05 색 공간', 'BGR ↔ Gray ↔ HSV · <code>InRange</code>', '색 분류 검사 전체'],
        ['2. 기초', '06 히스토그램 · 07 이진화', 'Otsu · 적응형 이진화', '개수 세기 · 차영상 이진화'],
        ['2. 기초', '08 필터 · 09 모폴로지', '블러 · Open/Close', '잡점 제거 · 결함 조각 이어 붙이기'],
        ['2. 기초', '10 에지 · 11 기하 변환', 'Canny · Resize · WarpAffine', '축소 미리보기 · 골든 정렬'],
        ['3. 분석', '12 윤곽선', '<code>FindContours</code> · 계층 · 면적 · 거리 변환 · Watershed', '닿은 부품 분리 · 결함 bbox · 구멍 개수'],
        ['3. 분석', '13 허프 · 14 매칭', '원/직선 검출 · 템플릿 매칭 · 특징점', '격자 정렬(피듀셜) · 원형 부품 검출'],
        ['3. 분석', '15 카메라', '<code>VideoCapture</code> · 프레임 처리', '라인 연속 검사로 확장'],
        ['4. 응용', '16 스튜디오', '처리 클래스 분리 · 미리보기 · 기록 · 예외', '<code>IInspector</code> 분리 · 파라미터 전달'],
        ['4. 응용', '17 검사 (이 차시)', '판정 · 오버레이 · 리포트 · 검사 앱', '전부']
      ], caption: '표 3. 강좌 전체 지도 — 17차시는 앞의 모든 차시를 한 앱에서 쓴다' },
      { type: 'callout', kind: 'more', title: '다음 학습: 여기서 더 나아가려면', html: '<ul><li><b>딥러닝 검사</b>: 규칙으로 쓰기 어려운 결함(직물 · 용접 · 도장 얼룩)은 학습 기반이 유리합니다. ① <b>분류</b>(OK/NG) ② <b>이상 탐지</b>(정상만 학습 — PatchCore · 오토인코더) ③ <b>분할</b>(결함 영역). C# 에서는 ONNX 로 내보낸 모델을 <code>OpenCvSharp</code> 의 <code>dnn</code> 모듈이나 <code>Microsoft.ML.OnnxRuntime</code> 로 추론합니다. 이 저장소의 <code>data/washer_dataset.npz</code> · <code>washer_anomaly.npz</code> 가 연습용입니다(브라우저에서는 dnn 을 지원하지 않습니다).</li><li><b>산업 카메라 SDK</b>: USB 웹캠이 아니라 GigE Vision · USB3 Vision 산업 카메라를 씁니다. 표준 인터페이스는 <b>GenICam · GenTL</b> 이고, 제조사 SDK(Basler pylon · FLIR Spinnaker · Hikrobot MVS 등)가 .NET 래퍼를 제공합니다. 트리거(외부 신호로 촬영) · 노출 고정 · 하드웨어 스트로브가 검사 재현성의 핵심입니다.</li><li><b>정밀 측정</b>: 서브픽셀 에지(캘리퍼) · 원 피팅 · 카메라 캘리브레이션(<code>calibrateCamera</code>) · px→mm 변환. <code>plate_holes.png</code> · <code>gap_measure.png</code> · <code>calib_grid_top.png</code> 로 연습하세요.</li><li><b>시스템</b>: PLC 통신(이더넷/시리얼) · 레시피(제품별 파라미터) 관리 · 이력 DB · 다중 카메라 동시 처리(스레드) · 화면 없는 서비스 모드.</li></ul>' },
      { type: 'wpf', title: '완성 프로젝트로 전체 확인하기', project: 'Ch17_Inspection', html: '<ol><li><b>개수 세기</b>: [기대 개수] 11 → [이미지 열기] <code>images/washers.png</code> → <b>OK</b>(물체는 13개지만 닿은 2쌍 때문에 11개). 기대 개수를 13 으로 바꾸고 [검사 실행] → NG. <code>coins_parts.png</code> + 기대 12 → OK.</li><li><b>색 분류</b>: 기대 개수 20 → <code>images/color_caps.png</code> → 빨강 5 · 노랑 6 · 초록 4 · 파랑 3 · 흰색 2 = 총 20 → OK.</li><li><b>결함 검사</b>: 검사 선택을 바꾸면 [골든 열기] 가 켜지고 [기대 개수] 는 꺼집니다. [골든 열기] <code>metal_ok.png</code> → [이미지 열기] <code>metal_scratch.png</code> → <b>NG 5개</b>(찍힘이 두 조각). <code>metal_ok.png</code> 를 검사 이미지로도 넣으면 OK(헛검출 없음 확인). <code>pcb_board.png</code> vs <code>pcb_golden.png</code> → NG 5개.</li><li>결함 검사에서 슬라이더(차영상 임계값)를 <b>30</b> 으로 올리고 [검사 실행] → 결함을 놓쳐 <b>OK 오판정</b>이 되는 것을 직접 확인하세요.</li><li>[오버레이 저장] · [결과 CSV 저장] 으로 리포트를 남기고, 오른쪽 위 누적 통계(<code>StatsText</code>: 검사 횟수 · OK · NG)가 늘어나는 것을 보세요.</li></ol>' },
      { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도 · 평가', html: '<p><b>수업 준비</b></p><ul><li><code>wpf/Ch17_Inspection</code> 을 미리 빌드하고 세 검사를 한 번씩 실행해 두세요. 특히 결함 검사는 <b>[골든 열기] 로 기준 이미지를 열어야</b> [검사 실행] 버튼이 켜집니다 — 학생들이 가장 많이 막히는 지점입니다.</li><li>수업 소재: 결함 검사 슬라이더를 10 → 30 으로 올리면 얇은 긁힘 · 옅은 얼룩을 놓쳐 <b>OK 오판정</b>이 됩니다(앱 README 참고). “파라미터 하나가 불량을 출하시킨다” 를 교실에서 직접 보여 주세요.</li><li>“정답 세트로 평가” 를 체감하게 하려면 임계값을 5 · 10 · 20 · 40 으로 바꿔 결함 개수가 어떻게 변하는지 미리 표로 준비해 두면 좋습니다.</li><li>3교시 마지막 10분은 강좌 전체 정리이므로 표 3 을 인쇄해 나눠 주면 복습에 좋습니다.</li></ul><p><b>자주 나오는 오개념</b></p><ul><li>“골든 비교는 어디서나 된다” → <b>정렬이 전제</b>. 일부러 <code>Cv2.WarpAffine</code> 으로 3px 밀어 비교해 보여 주면(전체 경계가 결함으로 나옴) 확실히 이해합니다.</li><li>“임계값을 낮추면 좋다” → 과검이 폭발합니다. 검출률과 오검출을 <b>함께</b> 봐야 한다는 점을 강조.</li><li>“결함 개수가 정답과 같으면 성공” → <b>위치가 맞는지</b>도 봐야 합니다(예제 2 의 겹침 판정).</li><li>“OK 판정은 확인할 필요 없다” → 양품을 넣어 OK 가 나오는지(과검 없음) 반드시 시험합니다.</li></ul><p><b>평가 루브릭 (100점)</b></p><ul><li>개수 세기 검사 구현(이진화 극성 · 면적 필터 · 판정) 20점</li><li>닿은 부품 분리 또는 격자 대조 구현 20점</li><li>색 분류 검사(HSV 범위 근거 제시 포함) 20점</li><li>골든 비교 결함 검사 + 정답 대조 평가 20점</li><li>오버레이 · CSV 리포트 · 예외 처리 20점</li></ul><p>💬 발문 모음: “불량을 놓치는 것과 양품을 버리는 것 중 무엇이 더 큰 손실일까?”(제품마다 다름 — 의약품/자동차 부품은 전자) / “검사기를 하나 더 추가하려면 어느 파일을 고쳐야 하나?”(<code>Inspectors/</code> 에 클래스 하나 + 목록에 한 줄) / “이 프로그램을 24시간 돌리려면 무엇이 더 필요할까?”(카메라 트리거 · 이력 DB · 자동 복구 · 로그).</p>' }
    ],
    practice: [
      {
        title: '임계값을 바꿔 결함 검출 개수 표 만들기', level: 2,
        desc: '금속 표면 골든 비교에서 <b>임계값 5 · 10 · 20 · 40</b> 을 각각 적용해 검출된 결함 개수를 표로 출력하세요. 정답은 4개입니다. 임계값을 <b>높이면</b> 대비가 약한 결함을 놓쳐 개수가 줄어드는 것(20 → 3개, 40 → 0개)을 확인하고, 이 표면에 적절한 임계값을 결론으로 적어 보세요.',
        hint: '차영상 → <code>GaussianBlur(5)</code> → <code>Threshold(thr)</code> → <code>Close(21)</code> → <code>FindContoursAsArray</code> → 면적 80 이상. 임계값만 바꿔 같은 함수를 네 번 부르면 됩니다.',
        expect: '임계값 | 결함 수 (정답 4)\n     5 | 4\n    10 | 4\n    20 | 3\n    40 | 0\n임계값을 높이면 대비가 약한 결함을 놓친다 (20 -> 3개, 40 -> 0개).\n너무 낮추면 잡음까지 통과해 과검이 늘어난다. 이 표면은 10 이 적절.',
        starter: `using System;
using System.Collections.Generic;
using OpenCvSharp;

class Program
{
    static int CountDefects(Mat golden, Mat test, double thr, int minArea)
    {
        using var diff = new Mat();
        Cv2.Absdiff(golden, test, diff);
        using var smooth = new Mat();
        Cv2.GaussianBlur(diff, smooth, new Size(5, 5), 0);
        using var bin = new Mat();
        // TODO: Threshold(thr) -> MorphologyEx(Close, 21x21 타원) -> FindContoursAsArray
        //       면적이 minArea 이상인 윤곽 개수를 돌려주세요
        return 0;
    }

    static void Main()
    {
        using var golden = Cv2.ImRead("images/metal_ok.png", ImreadModes.Grayscale);
        using var test = Cv2.ImRead("images/metal_scratch.png", ImreadModes.Grayscale);
        double[] thrs = { 5, 10, 20, 40 };
        Console.WriteLine("임계값 | 결함 수 (정답 4)");
        foreach (double t in thrs)
            Console.WriteLine($"{t,6} | {CountDefects(golden, test, t, 80)}");
    }
}`,
        solution: `using System;
using System.Collections.Generic;
using OpenCvSharp;

class Program
{
    static int CountDefects(Mat golden, Mat test, double thr, int minArea)
    {
        using var diff = new Mat();
        Cv2.Absdiff(golden, test, diff);
        using var smooth = new Mat();
        Cv2.GaussianBlur(diff, smooth, new Size(5, 5), 0);
        using var bin = new Mat();
        Cv2.Threshold(smooth, bin, thr, 255, ThresholdTypes.Binary);
        using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(21, 21));
        Cv2.MorphologyEx(bin, bin, MorphTypes.Close, element);
        Point[][] contours = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        int count = 0;
        foreach (Point[] c in contours)
            if (Cv2.ContourArea(c) >= minArea) count++;
        return count;
    }

    static void Main()
    {
        using var golden = Cv2.ImRead("images/metal_ok.png", ImreadModes.Grayscale);
        using var test = Cv2.ImRead("images/metal_scratch.png", ImreadModes.Grayscale);
        double[] thrs = { 5, 10, 20, 40 };
        Console.WriteLine("임계값 | 결함 수 (정답 4)");
        foreach (double t in thrs)
            Console.WriteLine($"{t,6} | {CountDefects(golden, test, t, 80)}");
        Console.WriteLine("임계값을 높이면 대비가 약한 결함을 놓친다 (20 -> 3개, 40 -> 0개).");
        Console.WriteLine("너무 낮추면 잡음까지 통과해 과검이 늘어난다. 이 표면은 10 이 적절.");
    }
}`
      },
      {
        title: '양품을 넣어 과검(오검출)이 없는지 확인하기', level: 2,
        desc: '<b>같은 골든 이미지를 검사 이미지로도</b> 넣으면 결함이 0개여야 합니다(차이가 없으므로). 그런데 실제 라인에서는 같은 양품이라도 <b>잡음 때문에</b> 차이가 조금 생깁니다. <code>metal_ok.png</code> 에 가우시안 잡음 대신 <b>밝기 +3</b> 을 더한 영상을 만들어 임계값 5 와 10 에서 과검이 생기는지 확인하세요.',
        hint: '밝기 더하기는 <code>Cv2.Add(src, new Scalar(3), dst)</code> 또는 <code>src.ConvertTo(dst, MatType.CV_8U, 1, 3)</code>. 차이가 3 이면 임계값 5 · 10 모두 통과하지 못해야(= 결함 0개) 정상입니다. 만약 조명이 +8 만큼 바뀌었다면 임계 5 는 위험합니다.',
        expect: '자기 자신과 비교 (임계 10): 결함 0 개\n밝기 +3 양품 (임계 5) : 결함 0 개\n밝기 +3 양품 (임계 10): 결함 0 개\n차이 3 은 임계 5 보다 작아 둘 다 과검 없음 -> 임계값은 조명 변동보다 커야 한다\n불량 (임계 10): 결함 4 개 -> NG',
        starter: `using System;
using OpenCvSharp;

class Program
{
    static int CountDefects(Mat golden, Mat test, double thr, int minArea)
    {
        using var diff = new Mat();
        Cv2.Absdiff(golden, test, diff);
        using var smooth = new Mat();
        Cv2.GaussianBlur(diff, smooth, new Size(5, 5), 0);
        using var bin = new Mat();
        Cv2.Threshold(smooth, bin, thr, 255, ThresholdTypes.Binary);
        using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(21, 21));
        Cv2.MorphologyEx(bin, bin, MorphTypes.Close, element);
        Point[][] contours = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        int count = 0;
        foreach (Point[] c in contours)
            if (Cv2.ContourArea(c) >= minArea) count++;
        return count;
    }

    static void Main()
    {
        using var golden = Cv2.ImRead("images/metal_ok.png", ImreadModes.Grayscale);

        Console.WriteLine($"자기 자신과 비교 (임계 10): 결함 {CountDefects(golden, golden, 10, 80)} 개");

        using var brighter = new Mat();
        // TODO: golden 에 밝기 3 을 더한 brighter 를 만드세요 (Cv2.Add 또는 ConvertTo)

        // TODO: brighter 를 임계값 5 와 10 으로 검사해 결과를 출력하세요
    }
}`,
        solution: `using System;
using OpenCvSharp;

class Program
{
    static int CountDefects(Mat golden, Mat test, double thr, int minArea)
    {
        using var diff = new Mat();
        Cv2.Absdiff(golden, test, diff);
        using var smooth = new Mat();
        Cv2.GaussianBlur(diff, smooth, new Size(5, 5), 0);
        using var bin = new Mat();
        Cv2.Threshold(smooth, bin, thr, 255, ThresholdTypes.Binary);
        using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(21, 21));
        Cv2.MorphologyEx(bin, bin, MorphTypes.Close, element);
        Point[][] contours = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        int count = 0;
        foreach (Point[] c in contours)
            if (Cv2.ContourArea(c) >= minArea) count++;
        return count;
    }

    static void Main()
    {
        using var golden = Cv2.ImRead("images/metal_ok.png", ImreadModes.Grayscale);

        Console.WriteLine($"자기 자신과 비교 (임계 10): 결함 {CountDefects(golden, golden, 10, 80)} 개");

        using var brighter = new Mat();
        Cv2.Add(golden, new Scalar(3), brighter);        // 조명이 조금 밝아진 양품

        Console.WriteLine($"밝기 +3 양품 (임계 5) : 결함 {CountDefects(golden, brighter, 5, 80)} 개");
        Console.WriteLine($"밝기 +3 양품 (임계 10): 결함 {CountDefects(golden, brighter, 10, 80)} 개");
        Console.WriteLine("차이 3 은 임계 5 보다 작아 둘 다 과검 없음 -> 임계값은 조명 변동보다 커야 한다");

        using var scratch = Cv2.ImRead("images/metal_scratch.png", ImreadModes.Grayscale);
        Console.WriteLine($"불량 (임계 10): 결함 {CountDefects(golden, scratch, 10, 80)} 개 -> NG");
    }
}`
      }
    ],
    quiz: [
      { q: '골든 이미지 비교가 성립하기 위한 가장 중요한 전제는?', options: ['골든 이미지가 더 밝아야 한다', '두 영상이 <b>픽셀 단위로 정렬</b>되어 있어야 한다', '두 영상의 채널 수가 달라야 한다', '결함이 항상 어두워야 한다'], answer: 1,
        explain: '1~2픽셀만 어긋나도 모든 경계선이 차이로 나와 결함처럼 보입니다. 실제 장비는 지그로 고정하거나 피듀셜 마크로 위치를 찾아 <code>WarpAffine</code> 으로 정렬한 뒤 비교합니다.' },
      { q: '금속 표면(metal_scratch)의 임계값을 10 으로, PCB 는 30 으로 쓴 이유는?', options: ['이미지 크기가 달라서', '금속 표면 결함의 <b>차이 최대값이 38</b> 로 아주 약하고, PCB 는 120 으로 크기 때문', '금속이 컬러가 아니어서', 'PCB 가 더 크기 때문'], answer: 1,
        explain: '같은 파이프라인이어도 <b>표면 대비에 따라 파라미터가 달라집니다</b>. 그래서 제품마다 파라미터를 “레시피”로 저장해 두고 불러 씁니다.' },
      { q: '<code>MorphologyEx</code> 의 <b>Close</b> 를 21×21 로 크게 쓴 이유는?', options: ['속도를 높이려고', '가늘고 긴 긁힘이 여러 조각으로 끊기므로 <b>이어 붙이기</b> 위해', '잡음을 없애려고', '이미지를 축소하려고'], answer: 1,
        explain: 'Close(팽창 후 침식)는 <b>가까운 흰 영역을 이어 붙입니다</b>. 반대로 작은 흰 잡점을 없애는 것은 Open 입니다 — 두 연산의 역할을 구분하세요(09차시).' },
      { q: '검사 알고리즘을 평가할 때 반드시 <b>함께</b> 봐야 하는 두 가지는?', options: ['처리 시간과 메모리', '<b>검출률</b>(정답을 몇 개 찾았나)과 <b>오검출</b>(정답이 아닌 것을 몇 개 찾았나)', '이미지 크기와 채널 수', '임계값과 커널 크기'], answer: 1,
        explain: '임계값을 낮추면 검출률이 오르지만 오검출(과검)도 늡니다. 정답이 있는 샘플 세트로 둘을 함께 측정해 균형점을 찾는 것이 개발의 핵심입니다. <b>양품이 OK 로 나오는지</b>도 반드시 시험하세요.' },
      { q: '세 검사기를 <code>IInspector</code> 인터페이스로 묶어서 얻는 이점은?', options: ['처리가 빨라진다', '검사기를 추가해도 <b>화면 코드를 바꾸지 않아도</b> 된다', '메모리를 덜 쓴다', '예외가 사라진다'], answer: 1,
        explain: '화면은 <code>Name</code> · <code>NeedsGolden</code> · <code>Inspect</code> 만 알면 되므로, 새 검사기는 <code>Inspectors/</code> 에 클래스 하나를 추가하고 목록에 한 줄을 넣으면 끝입니다 — 16차시 <code>FilterPipeline</code> 과 같은 설계입니다.' }
    ],
    slides: [
      { layout: 'title', title: '결함 검사와 앱 완성', subtitle: '3교시 — 골든 이미지 비교 · 평가 · 검사 앱 · 강좌 정리', notes: '<p>강좌의 마지막 교시입니다. 💬 “긁힘이 어디에 어떤 모양으로 생길지 미리 알 수 있나요?” — 모른다. 그래서 규칙을 쓸 수 없고, <b>양품과 비교</b>하는 방법이 필요하다는 흐름으로 시작합니다. (3분)</p>' },
      { layout: 'bullets', title: '“무엇을 찾을지 모를 때”', lead: '1~2교시와 다른 문제', bullets: [
        '개수 · 색 · 정해진 자리 검사 = <b>찾을 것을 알고 있다</b>',
        '긁힘 · 얼룩 · 찍힘 = <b>어디에 어떤 모양일지 모른다</b>',
        '해법: <b>양품 기준(골든) 영상과의 차이</b>를 본다',
        ['전제', ['같은 카메라 · 같은 위치 · 같은 조명', '<b>픽셀 단위 정렬</b> (어긋나면 경계 전체가 결함)']]
      ], notes: '<p>정렬의 중요성을 반복합니다. 실제로 <code>WarpAffine</code> 으로 3px 밀어서 비교해 보여 주면 학생들이 “아, 이래서 지그가 필요하구나” 를 이해합니다. (4분)</p>' },
      { layout: 'diagram', title: '골든 비교 파이프라인', html: FIG_GOLDEN, caption: 'Absdiff → GaussianBlur → Threshold → Close → FindContours → bbox', notes: '<p>각 단계의 역할을 한 단어로 정리하게 합니다: 차이 → 평탄화 → 골라내기 → 이어 붙이기 → 묶기. 💬 “Close 와 Open 중 어느 것을 쓸까?” — 결함 조각을 <b>이어 붙여야</b> 하므로 Close. (4분)</p>' },
      { layout: 'image', title: 'metal_scratch.png — 결함 4개', src: 'images/metal_scratch.png', caption: '헤어라인 금속 표면: 긁힘 2(S1 밝은 곡선 · S2 어두운 직선) · 얼룩 ST · 찍힘 D1. 눈으로도 찾기 어렵다', notes: '<p>학생들에게 30초 동안 결함 4개를 찾아보게 합니다. 대부분 2~3개만 찾습니다 — “사람보다 정확하게” 가 검사 장비의 존재 이유라는 점을 자연스럽게 전할 수 있습니다. 골든과의 차이 최대값이 58 뿐(블러 뒤 38)이라는 것도 알려 주세요. (4분)</p>' },
      { layout: 'code', title: '차영상으로 결함 찾기', code: `using var diff = new Mat();
Cv2.Absdiff(golden, test, diff);                  // |골든 - 검사|
Cv2.MinMaxLoc(diff, out double dmin, out double dmax);   // dmax = 58 (아주 약하다!)

using var smooth = new Mat();
Cv2.GaussianBlur(diff, smooth, new Size(5, 5), 0);       // 잡음 평탄화

using var bin = new Mat();
Cv2.Threshold(smooth, bin, 10, 255, ThresholdTypes.Binary);   // 임계 10 (낮게!)

// 가늘고 긴 긁힘이 끊기므로 Close 로 이어 붙인다
using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(21, 21));
Cv2.MorphologyEx(bin, bin, MorphTypes.Close, element);

Point[][] contours = Cv2.FindContoursAsArray(bin, RetrievalModes.External,
                                             ContourApproximationModes.ApproxSimple);
foreach (Point[] c in contours)
    if (Cv2.ContourArea(c) >= 80) defects.Add(Cv2.BoundingRect(c));`, run: false, points: ['임계값은 <b>표면 대비</b>에 맞춘다 (금속 10 · PCB 30)', '<code>Close</code> 21×21 로 긁힘 조각 이어 붙이기', '면적 필터로 잡음 최종 제거 → 결함 4개'], notes: '<p>학생들이 브라우저 예제 1 을 실행합니다. 결과 bbox 를 IMAGES.md 정답과 비교하게 하세요: S1 (108,93)-(432,177) vs 검출 (109,94)-(432,177) — 거의 완벽합니다. (5분)</p>' },
      { layout: 'table', title: '같은 파이프라인, 다른 파라미터', head: ['이미지', '차이 최대', '임계값', 'Close', '최소 면적', '결함'], rows: [
        ['metal_scratch (금속)', '58', '10', '21', '80', '4개'],
        ['pcb_board (PCB)', '120', '30', '21', '50', '4개'],
        ['앱 기본값 DefectInspector', '-', '10', '5', '20', 'metal 5 · PCB 5'],
        ['앱에서 임계값만 30 으로', '-', '30', '5', '20', 'metal 결함 놓침 → OK 오판정']
      ], lead: '제품마다 파라미터를 "레시피" 로 저장해 둔다', notes: '<p>파라미터가 3배 차이 나는 이유(표면 대비)를 설명하고, 실무에서 제품 전환 때마다 레시피를 불러오는 구조가 필요하다고 알려 줍니다. JSON 파일 하나로 충분합니다. 앱(<code>DefectInspector</code>)은 닫기 커널이 5×5 로 작아 찍힘이 두 조각으로 세어져 5개가 나옵니다. 가능하면 앱에서 슬라이더를 10 → 30 으로 올려 <b>불량이 OK 로 판정되는 장면</b>을 직접 보여 주세요 — 가장 강렬한 수업 소재입니다(브라우저에서는 30 에서 1개, 40 에서 0개). (4분)</p>' },
      { layout: 'code', title: '검출 결과를 정답과 대조하기', code: `static bool Overlaps(Rect a, Rect b)
{
    return a.X < b.X + b.Width && b.X < a.X + a.Width
        && a.Y < b.Y + b.Height && b.Y < a.Y + a.Height;
}

// IMAGES.md 의 정답 4개
truth.Add(new Rect(120, 502, 60, 36));   // D1 극성 반대
truth.Add(new Rect(234, 252, 32, 16));   // U1 솔더 브리지
truth.Add(new Rect(300, 380, 60, 40));   // R3 부품 누락
truth.Add(new Rect(600, 375, 65, 45));   // C2 이동·회전

int hit = 0;
foreach (Rect t in truth)
{
    bool detected = false;
    foreach (Rect r in found) if (Overlaps(r, t)) detected = true;
    if (detected) hit++;
}
Console.WriteLine($"검출률 {hit}/{truth.Count} · 오검출 {found.Count - hit}");`, run: false, points: ['<b>개수</b>가 아니라 <b>위치</b>가 맞는지 본다', '임계값 ↓ → 검출률 ↑ · 오검출 ↑ / ↑ → 검출률 ↓ · 오검출 ↓', '<b>양품을 넣어 OK 가 나오는지</b>도 반드시 시험', '결과: 4/4 검출 · 오검출 0'], notes: '<p>“정답 세트 없이 개발하면 안 된다” 는 것이 이 슬라이드의 메시지입니다. 💬 “결함 개수가 4개면 성공일까?” — 위치가 틀렸다면 우연히 맞은 것. 이어서 검출률과 과검의 균형을 이야기합니다: 보통 <b>놓치지 않는 쪽</b>을 우선하고 NG 는 사람이 재확인합니다. 💬 “의약품과 장난감 중 어느 쪽이 놓침에 더 민감할까?” 실습 2 가 바로 “양품 확인” 입니다. (8분)</p>' },
      { layout: 'code', title: '세 검사기를 인터페이스로 묶기', file: 'MainWindow.xaml.cs', local: true, code: `// public partial class MainWindow : Window 안 (발췌)
private readonly CountInspector _count = new();
private readonly ColorSortInspector _colorSort = new();
private readonly DefectInspector _defect = new();
private readonly IInspector[] _inspectors;

// 생성자: ComboBox 에는 Name 만 보이게
_inspectors = new IInspector[] { _count, _colorSort, _defect };
InspectorCombo.DisplayMemberPath = nameof(IInspector.Name);
InspectorCombo.ItemsSource = _inspectors;

// 검사 선택이 바뀌면
OpenGoldenButton.IsEnabled = Current.NeedsGolden;
ExpectedCountBox.IsEnabled = Current is not DefectInspector;

// RunInspection(): 어떤 검사기든 같은 코드
InspectionResult result = Current.Inspect(image, _golden);
_result?.Dispose();
_result = result;
OverlayImage.Source = _result.Overlay.ToBitmapSource();
ResultGrid.ItemsSource = _result.Items;
ShowJudge(_result.IsOk, _result.Summary);    // JudgeText · SummaryText · JudgeBorder`, run: false, points: ['검사기를 추가해도 <b>화면 코드는 그대로</b> (배열에 한 줄)', '<code>NeedsGolden</code> 으로 [골든 열기] 활성화까지 자동', '파라미터는 <code>switch (Current) { case CountInspector c: … }</code> 로 전달', '16차시 <code>FilterPipeline</code> 분리와 같은 설계'], notes: '<p><code>wpf/Ch17_Inspection/MainWindow.xaml.cs</code> 의 발췌입니다. 다형성의 실질적 이득을 보여 주는 슬라이드입니다. 💬 “검사기를 추가하려면 몇 개 파일을 고치나?” — 클래스 1개 추가 + 목록 1줄. 브라우저 예제 4 를 실행해 세 검사가 한 루프로 돌아가는 것을 봅니다. (5분)</p>' },
      { layout: 'code', title: '결과를 남긴다 (이미지 + CSV)', code: `// 판정 문구는 검은 굵은 글자 위에 색 글자 → 어떤 배경에서도 읽힌다
string verdict = ok ? "OK" : $"NG (결함 {defects.Count})";
Cv2.PutText(overlay, verdict, new Point(12, 34), HersheyFonts.HersheySimplex, 1.0, Scalar.Black, 4);
Cv2.PutText(overlay, verdict, new Point(12, 34), HersheyFonts.HersheySimplex, 1.0,
            ok ? new Scalar(0, 255, 0) : new Scalar(0, 0, 255), 2);

Cv2.ImWrite("out/metal_result.png", overlay);

var csv = new StringBuilder();
csv.Append("id,x,y,w,h,area_px\\n");
foreach (Rect r in defects)
    csv.Append($"D{++id},{r.X},{r.Y},{r.Width},{r.Height},{r.Width * r.Height}\\n");
File.WriteAllText("out/metal_report.csv", csv.ToString());`, run: false, points: ['NG 는 <b>반드시</b> 이미지 + 데이터로 남긴다', '실무: 파일명에 날짜 · 로트 · 판정', '📁 작업 폴더에서 내려받아 확인'], notes: '<p>“근거를 남기지 않는 검사는 신뢰받지 못한다” 로 정리합니다. 실제 장비는 NG 이미지를 별도 폴더에 날짜별로 쌓고, 주기적으로 사람이 검토해 임계값을 조정합니다. (4분)</p>' },
      { layout: 'table', title: '강좌 전체 지도', head: ['차시', '핵심', '17차시에서 쓴 곳'], rows: [
        ['03 · 04 Mat · 그리기', '픽셀 · ROI · 사각형 · 텍스트', '오버레이 · ROI 격자 검사'],
        ['05 색 공간', 'HSV · InRange', '색 분류 검사'],
        ['07 이진화', 'Otsu · 극성', '개수 세기 · 차영상'],
        ['08 · 09 필터 · 모폴로지', 'Blur · Open/Close', '잡점 제거 · 결함 이어 붙이기'],
        ['12 윤곽선', 'FindContours · 계층 · 거리 변환 · Watershed', '닿은 부품 분리 · 결함 bbox'],
        ['13 · 14 허프 · 매칭', '원 검출 · 정렬', '격자 보정 · 원형 부품'],
        ['16 스튜디오', '처리 클래스 분리 · 예외 · 저장', 'IInspector · 리포트']
      ], notes: '<p>학생들과 함께 “이 차시에서 안 쓴 것이 있나?” 를 찾아보면 거의 없습니다 — 강좌 전체가 이 앱으로 수렴한다는 것을 보여 주며 성취감을 줍니다. 인쇄물로 나눠 주면 좋습니다. (4분)</p>' },
      { layout: 'bullets', title: '다음 학습', lead: '여기서 더 나아가려면', bullets: [
        '<b>딥러닝 검사</b>: 분류(OK/NG) · 이상 탐지(정상만 학습) · 분할. C# 에서는 ONNX 모델 + <code>OnnxRuntime</code> / <code>dnn</code> 모듈',
        '<b>산업 카메라</b>: GigE / USB3 Vision · GenICam · 외부 트리거 · 노출 고정 (제조사 .NET SDK)',
        '<b>정밀 측정</b>: 서브픽셀 에지 · 원 피팅 · 카메라 캘리브레이션 · px→mm',
        '<b>시스템</b>: PLC 통신 · 레시피 관리 · 이력 DB · 다중 카메라(스레드) · 무인 운전',
        ['연습 자료', ['<code>data/washer_dataset.npz</code> (OK/NG 600장)', '<code>data/washer_anomaly.npz</code> (이상 탐지)', '<code>data/parts_features.csv</code> (특징 표)']]
      ], notes: '<p>“OpenCV 로 되는 것을 먼저 해 보고, 안 되는 것만 딥러닝” 이 실무 순서라고 강조하세요 — 규칙 기반이 빠르고 설명 가능하며 데이터가 필요 없습니다. 마지막으로 학생들의 질문을 받습니다. (4분)</p>' },
      { layout: 'quiz', title: '확인 퀴즈', q: '골든 이미지 비교의 가장 중요한 전제는?', options: ['골든이 더 밝아야 한다', '두 영상이 픽셀 단위로 <b>정렬</b>되어 있어야 한다', '결함이 어두워야 한다', '컬러여야 한다'], answer: 1, explain: '1~2px 만 어긋나도 모든 경계가 결함으로 나옵니다. 지그 고정 또는 피듀셜 정렬(WarpAffine) 후 비교합니다.', notes: '<p>정답 2번. 마지막 퀴즈이므로 전체를 한 번 복습하는 질문을 몇 개 더 던져도 좋습니다: “Open 과 Close 의 차이?”, “Otsu 가 알려 주지 않는 것?” (2분)</p>' },
      { layout: 'practice', title: '실습: 양품으로 과검 확인하기', desc: '<p>같은 골든을 검사 이미지로 넣으면 결함 0개여야 합니다. 조명이 조금 밝아진 양품(밝기 +3)도 OK 가 나와야 합니다.</p><ul><li><code>Cv2.Add(golden, new Scalar(3), brighter)</code></li><li>임계값 5 와 10 에서 각각 결함 개수를 비교</li><li>결론: 임계값은 <b>잡음 · 조명 변동보다 커야</b> 한다</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var golden = Cv2.ImRead("images/metal_ok.png", ImreadModes.Grayscale);
        using var brighter = new Mat();
        // TODO: golden 에 밝기 3 을 더한 brighter 를 만들고 차이 최대값을 출력하세요
        Console.WriteLine("준비");
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var golden = Cv2.ImRead("images/metal_ok.png", ImreadModes.Grayscale);
        using var brighter = new Mat();
        Cv2.Add(golden, new Scalar(3), brighter);
        using var diff = new Mat();
        Cv2.Absdiff(golden, brighter, diff);
        Cv2.MinMaxLoc(diff, out double lo, out double hi);
        Console.WriteLine($"밝기 +3 양품의 차이 최대 {hi:F0} -> 임계값은 이보다 커야 한다");
    }
}`, notes: '<p>브라우저 실습 2 의 전체 코드로 작업합니다. 핵심 결론: 임계값 5 는 조명 변동 3 에 위험하고 10 은 안전합니다. 실무에서는 양품 여러 장의 차이 최대값 분포를 측정해 그보다 여유 있게 임계값을 정합니다. (8분)</p>' },
      { layout: 'summary', title: '17차시 · 강좌 정리', bullets: [
        '골든 비교: <b>Absdiff → Blur → Threshold → Close → Contours</b> (정렬이 전제)',
        '파라미터는 표면 대비에 맞춰 <b>레시피</b>로 관리 (금속 10 · PCB 30)',
        '평가는 <b>검출률 + 오검출</b>, 양품으로 과검 확인까지',
        '세 검사기를 <code>IInspector</code> 로 묶어 화면 코드를 고정',
        '판정 · 오버레이 · 표 · CSV · 결과 이미지 — <b>근거를 남기는 것</b>이 검사',
        '다음 학습: 딥러닝 검사 · 산업 카메라 SDK · 정밀 측정 · 시스템 통합'
      ], notes: '<p>강좌를 마무리합니다. 학생들에게 “가장 기억에 남는 함수 하나” 를 말해 보게 하면 좋은 마무리가 됩니다. 마지막 과제로 “자기 주변 물건을 찍어(또는 예제 이미지를 골라) 검사기 하나를 직접 만들어 보고 정답 세트로 평가하기” 를 제안하세요. (3분)</p>' }
    ]
  };

  CS_COURSE.addChapter({
    id: 'cs17', no: '17', title: '실전 검사 프로젝트: 개수 세기 · 색 분류 · 결함 검사', subtitle: '판정 · 오버레이 · 리포트를 갖춘 머신비전 검사 앱 만들기',
    summary: '지금까지 배운 OpenCV 기능을 모아 <b>실제 검사 프로그램</b>을 만듭니다. ① 개수 세기(이진화 · 연결 요소 · Watershed · 격자 대조) ② 색 분류(HSV InRange · ROI 격자 판정) ③ 결함 검사(골든 이미지 비교)를 <code>IInspector</code> 인터페이스로 묶고, 오버레이 · 판정 표 · CSV 리포트 · WPF 검사 앱으로 완성합니다.',
    goals: ['이진화 · 연결 요소 · 면적 필터로 개수를 세고 OK/NG 를 판정할 수 있다', 'HSV InRange 와 ROI 격자로 색 · 유무 · 불량을 판정할 수 있다', '골든 이미지 차영상으로 결함 위치를 찾아 표시할 수 있다', '판정 결과를 오버레이 · 표 · CSV · 이미지 파일로 남기는 검사 앱 구조를 설명할 수 있다'],
    wpf: 'Ch17_Inspection',
    sections: [SEC1, SEC2, SEC3]
  });
})();
