/* 12차시 윤곽선과 도형 분석 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 윤곽선 = 이진 이미지에서 경계 픽셀을 따라 모은 점 목록
  const FIG_CONTOUR = `<svg viewBox="0 0 740 320" role="img" aria-label="이진 이미지의 흰 영역 경계를 따라가며 점 목록을 만드는 과정">
  ${ARROW('c12a1')}
  <text x="370" y="20" text-anchor="middle" class="tx-b">윤곽선(Contour) = 이진 이미지에서 흰 영역의 <tspan class="tx">경계 픽셀을 순서대로</tspan> 모은 점 목록</text>
  <text x="120" y="48" text-anchor="middle" class="tx-m">이진 이미지 (0 / 255)</text>
  <g>
    <rect x="40" y="58" width="180" height="180" class="card-bg"/>
    <rect x="70" y="88" width="120" height="120" class="p1s"/>
    <rect x="100" y="118" width="60" height="60" class="card-bg"/>
    <text x="130" y="152" text-anchor="middle" class="tx-m">구멍</text>
    <text x="130" y="82" text-anchor="middle" class="tx-m">물체(흰색)</text>
  </g>
  <line x1="228" y1="148" x2="266" y2="148" class="ln" stroke-width="2" marker-end="url(#c12a1)"/>
  <text x="247" y="140" text-anchor="middle" class="tx-m">추적</text>
  <text x="370" y="48" text-anchor="middle" class="tx-m">경계를 따라가며 점을 기록</text>
  <rect x="280" y="58" width="180" height="180" class="card-bg"/>
  <polyline points="310,88 430,88 430,208 310,208 310,88" class="s1" fill="none" stroke-width="2.5" marker-end="url(#c12a1)"/>
  <circle cx="310" cy="88" r="4" class="p1"/><circle cx="350" cy="88" r="4" class="p1"/><circle cx="390" cy="88" r="4" class="p1"/><circle cx="430" cy="88" r="4" class="p1"/>
  <circle cx="430" cy="128" r="4" class="p1"/><circle cx="430" cy="168" r="4" class="p1"/><circle cx="430" cy="208" r="4" class="p1"/>
  <circle cx="390" cy="208" r="4" class="p1"/><circle cx="350" cy="208" r="4" class="p1"/><circle cx="310" cy="208" r="4" class="p1"/>
  <circle cx="310" cy="168" r="4" class="p1"/><circle cx="310" cy="128" r="4" class="p1"/>
  <polyline points="340,118 400,118 400,178 340,178 340,118" class="s3" fill="none" stroke-width="2" stroke-dasharray="4 3"/>
  <text x="370" y="258" text-anchor="middle" class="tx-m">바깥 윤곽 1개 + 구멍(내부) 윤곽 1개</text>
  <rect x="490" y="58" width="230" height="180" rx="8" class="p2s"/>
  <text x="605" y="82" text-anchor="middle" class="tx-b">Point[][] contours</text>
  <text x="605" y="108" text-anchor="middle" class="tx-m">contours[0] = 바깥 윤곽</text>
  <text x="605" y="130" text-anchor="middle" class="tx-m">= { (30,30), (34,30), … }</text>
  <text x="605" y="156" text-anchor="middle" class="tx-m">contours[1] = 구멍 윤곽</text>
  <text x="605" y="182" text-anchor="middle" class="tx-m">→ 윤곽 하나 = <tspan class="tx">점 배열 하나</tspan></text>
  <text x="605" y="210" text-anchor="middle" class="tx-m">면적 · 둘레 · 중심 · 모양을 계산</text>
  <text x="370" y="288" text-anchor="middle" class="tx-m">ApproxSimple: 직선 구간은 <tspan class="tx">양 끝 점만</tspan> 남긴다 (960점 → 484점)</text>
  <text x="370" y="310" text-anchor="middle" class="tx-m">ApproxNone: 경계의 모든 픽셀을 그대로 저장</text>
</svg>`;

  // 그림 2: 윤곽 계층 구조
  const FIG_HIER = `<svg viewBox="0 0 740 300" role="img" aria-label="윤곽선 계층 구조: 바깥 윤곽과 구멍 윤곽이 부모 자식 관계로 이어진다">
  ${ARROW('c12a2')}
  <text x="370" y="20" text-anchor="middle" class="tx-b">계층(Hierarchy): 누가 누구 안에 있나 — HierarchyIndex { Next, Previous, Child, Parent }</text>
  <rect x="30" y="40" width="300" height="230" rx="8" class="card-bg"/>
  <text x="180" y="62" text-anchor="middle" class="tx-m">플랜지 (바깥 1 + 구멍 7)</text>
  <circle cx="180" cy="165" r="90" class="p1s"/>
  <circle cx="180" cy="165" r="26" class="card-bg"/>
  <circle cx="180" cy="95" r="12" class="card-bg"/><circle cx="240" cy="130" r="12" class="card-bg"/><circle cx="240" cy="200" r="12" class="card-bg"/>
  <circle cx="180" cy="235" r="12" class="card-bg"/><circle cx="120" cy="200" r="12" class="card-bg"/><circle cx="120" cy="130" r="12" class="card-bg"/>
  <text x="180" y="169" text-anchor="middle" class="tx-m">보어</text>
  <rect x="360" y="40" width="360" height="230" rx="8" class="p2s"/>
  <text x="540" y="62" text-anchor="middle" class="tx-b">RetrievalModes</text>
  <rect x="378" y="74" width="324" height="30" rx="6" class="card-bg"/><text x="390" y="94" class="tx-m"><tspan class="tx">External</tspan> — 가장 바깥 윤곽만 (구멍 무시) → 1개</text>
  <rect x="378" y="110" width="324" height="30" rx="6" class="card-bg"/><text x="390" y="130" class="tx-m"><tspan class="tx">List</tspan> — 전부, 계층 없음 (Parent = −1) → 8개</text>
  <rect x="378" y="146" width="324" height="30" rx="6" class="card-bg"/><text x="390" y="166" class="tx-m"><tspan class="tx">CComp</tspan> — 2단(바깥 / 구멍) → 구멍 = Parent ≥ 0</text>
  <rect x="378" y="182" width="324" height="30" rx="6" class="card-bg"/><text x="390" y="202" class="tx-m"><tspan class="tx">Tree</tspan> — 완전한 트리 (구멍 안의 물체까지)</text>
  <text x="540" y="236" text-anchor="middle" class="tx-m">구멍 개수 = hierarchy.Count(h =&gt; h.Parent &gt;= 0)</text>
  <text x="540" y="258" text-anchor="middle" class="tx-m">→ 플랜지 7개 · 와셔 영상 10개</text>
  <text x="370" y="292" text-anchor="middle" class="tx-m">Child = 첫 자식 윤곽 번호, Next/Previous = 같은 단계의 형제, Parent = 감싸는 윤곽 (없으면 −1)</text>
</svg>`;

  // ================================================================= 교시 1 예제
  const EX_FIND = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 윤곽선은 1채널 "이진" 이미지에서 흰 영역(255)의 경계를 찾는다
        using var img = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        double t = Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Console.WriteLine($"Otsu 임계값 {t}");

        Cv2.FindContours(bin, out Point[][] contours, out HierarchyIndex[] hierarchy,
                         RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"윤곽 {contours.Length}개");

        Point[] c = contours[0];
        Console.WriteLine($"점 {c.Length}개, 면적 {Cv2.ContourArea(c):F0}, 둘레 {Cv2.ArcLength(c, true):F1}");
        Rect box = Cv2.BoundingRect(c);
        Console.WriteLine($"BoundingRect {box}");

        // 결과를 컬러 화면에 그려 보기
        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        Cv2.DrawContours(view, contours, -1, Scalar.Lime, 2);      // -1 = 전부
        Cv2.Rectangle(view, box, Scalar.Red, 2);
        Cv2.ImShow("contour", view);
        Cv2.WaitKey(0);
    }
}`;

  const EX_MODES = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);

        // ① 어디까지 찾을까 — RetrievalModes
        foreach (var mode in new[] { RetrievalModes.External, RetrievalModes.List,
                                     RetrievalModes.CComp, RetrievalModes.Tree })
        {
            Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                             mode, ContourApproximationModes.ApproxSimple);
            Console.WriteLine($"{mode,-8}: 윤곽 {cs.Length}개");
        }

        // ② 점을 얼마나 남길까 — ContourApproximationModes
        Point[][] simple = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Point[][] none = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxNone);
        Console.WriteLine($"ApproxSimple 점 {simple[0].Length}개 / ApproxNone 점 {none[0].Length}개");
        Console.WriteLine($"면적은 그대로: {Cv2.ContourArea(simple[0]):F0} vs {Cv2.ContourArea(none[0]):F0}");
    }
}`;

  const EX_HIER = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);

        // CComp: 바깥 윤곽(Parent = -1) 과 구멍 윤곽(Parent >= 0) 2단으로 정리해 준다
        Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"전체 윤곽 {cs.Length}개, 구멍 {hi.Count(h => h.Parent >= 0)}개");
        for (int k = 0; k < cs.Length; k++)
            Console.WriteLine($"  [{k}] 점 {cs[k].Length,3}개 면적 {Cv2.ContourArea(cs[k]),6:F0} Parent {hi[k].Parent} Child {hi[k].Child}");

        // 바깥은 초록, 구멍은 빨강으로 그려 구분
        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        for (int k = 0; k < cs.Length; k++)
            Cv2.DrawContours(view, cs, k, hi[k].Parent < 0 ? Scalar.Lime : Scalar.Red, 2);
        Cv2.ImShow("hierarchy", view);
        Cv2.WaitKey(0);
    }
}`;

  const EX_SORT = `using System;
using System.Collections.Generic;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 백라이트 영상 — 부품이 어둡다 → BinaryInv
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"전체 윤곽 {cs.Length}개");
        Console.WriteLine($"바깥 {hi.Count(h => h.Parent < 0)}개, 구멍 {hi.Count(h => h.Parent >= 0)}개");

        // 바깥 윤곽만 모아 면적 큰 순서로 (LINQ)
        var outer = new List<(int k, double area, double peri)>();
        for (int k = 0; k < cs.Length; k++)
            if (hi[k].Parent < 0) outer.Add((k, Cv2.ContourArea(cs[k]), Cv2.ArcLength(cs[k], true)));

        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        foreach (var o in outer.OrderByDescending(x => x.area).Take(5))
        {
            Console.WriteLine($"  [{o.k}] 면적 {o.area,7:F0} 둘레 {o.peri,6:F1}");
            Cv2.Rectangle(view, Cv2.BoundingRect(cs[o.k]), Scalar.Lime, 2);
        }
        Cv2.ImShow("top5", view);
        Cv2.WaitKey(0);
    }
}`;

  const QUIZ1 = [
    { q: '<code>Cv2.FindContours</code> 에 넣어야 하는 이미지는?', options: ['컬러(3채널) 원본', '1채널 <b>이진</b> 이미지 (CV_8UC1)', '그레이스케일이면 아무거나', 'CV_32F 실수 이미지'], answer: 1,
      explain: '윤곽선은 <b>흰 영역(0 이 아닌 값)의 경계</b>를 찾습니다. 1채널 이진 이미지가 필요하므로 먼저 <code>CvtColor</code> → <code>Threshold</code>(또는 <code>Canny</code>)를 거칩니다. 컬러를 넣으면 예외가 납니다.' },
    { q: '구멍(내부 윤곽)의 개수를 세려면 어떤 <code>RetrievalModes</code> 와 조건이 알맞은가?', options: ['<code>External</code> + 전체 개수', '<code>List</code> + <code>Child >= 0</code>', '<code>CComp</code> + <code>Parent >= 0</code> 인 윤곽 수', '<code>Tree</code> + 첫 윤곽의 점 개수'], answer: 2,
      explain: '<code>CComp</code>(또는 <code>Tree</code>)는 계층을 채워 주므로 <b><code>Parent >= 0</code> = 무언가에 감싸인 윤곽 = 구멍</b>입니다. <code>External</code> 은 구멍을 아예 무시하고, <code>List</code> 는 계층을 채우지 않습니다(Parent 가 모두 −1).' },
    { q: '<code>ApproxSimple</code> 과 <code>ApproxNone</code> 의 차이는?', options: ['면적 계산 정확도가 달라진다', '직선 구간의 중간 점을 버리느냐 마느냐', '구멍을 찾느냐 마느냐', '정렬 순서가 달라진다'], answer: 1,
      explain: '<code>ApproxSimple</code> 은 직선 구간의 <b>양 끝 점만</b> 남겨 메모리를 크게 줄입니다(예제에서 960 → 484점). 면적 · 둘레 결과는 사실상 같으므로 <b>기본값으로 ApproxSimple</b> 을 쓰고, 경계 픽셀을 하나씩 분석할 때만 <code>ApproxNone</code> 을 씁니다.' },
    { q: '<code>Cv2.DrawContours(view, cs, -1, Scalar.Lime, 2)</code> 에서 <code>-1</code> 과 <code>2</code> 의 뜻은?', options: ['-1 = 첫 윤곽, 2 = 두 번째', '-1 = 모든 윤곽, 2 = 선 두께', '-1 = 채우기, 2 = 계층 깊이', '-1 = 마지막 윤곽, 2 = 선 종류'], answer: 1,
      explain: '세 번째 인수는 그릴 윤곽 번호이고 <b>−1 이면 전부</b>입니다. 다섯 번째는 선 두께인데 <b>−1(또는 <code>LineTypes.Filled</code>)을 주면 안을 채웁니다</b> — 구멍 메우기에 자주 씁니다.' },
    { q: '<code>Cv2.ContourArea</code> 가 돌려주는 값은?', options: ['윤곽 안쪽 흰 픽셀의 개수', '윤곽 점들이 만드는 다각형의 면적', '외접 사각형의 면적', '둘레의 제곱'], answer: 1,
      explain: '점들을 이은 <b>다각형의 면적</b>(그린 정리)입니다. 그래서 <code>ConnectedComponents</code> 의 픽셀 개수와 조금 다르고, <b>구멍은 빠지지 않습니다</b>. 실제 재료 면적이 필요하면 바깥 면적 − 구멍 면적을 직접 계산해야 합니다.' }
  ];
  // 그림 3: 같은 윤곽에 맞춘 네 가지 외접 도형
  const FIG_FIT = `<svg viewBox="0 0 720 300" role="img" aria-label="같은 윤곽선에 BoundingRect, MinAreaRect, MinEnclosingCircle, FitEllipse 를 맞춘 비교">
  <text x="360" y="20" text-anchor="middle" class="tx-b">같은 윤곽선 · 네 가지 "맞춤 도형" — 목적에 따라 고른다</text>
  <g>
    <rect x="30" y="40" width="200" height="200" rx="8" class="card-bg"/>
    <rect x="58" y="86" width="144" height="110" class="p1s" transform="rotate(-24 130 141)"/>
    <rect x="52" y="74" width="156" height="134" class="s2" fill="none" stroke-width="2" stroke-dasharray="5 4"/>
    <text x="130" y="60" text-anchor="middle" class="tx-b">BoundingRect</text>
    <text x="130" y="228" text-anchor="middle" class="tx-m">축에 평행 · 가장 빠름 · ROI</text>
  </g>
  <g>
    <rect x="250" y="40" width="200" height="200" rx="8" class="card-bg"/>
    <rect x="278" y="86" width="144" height="110" class="p1s" transform="rotate(-24 350 141)"/>
    <rect x="278" y="86" width="144" height="110" class="s3" fill="none" stroke-width="2.5" transform="rotate(-24 350 141)"/>
    <text x="350" y="60" text-anchor="middle" class="tx-b">MinAreaRect</text>
    <text x="350" y="228" text-anchor="middle" class="tx-m">Center · Size · <tspan class="tx">Angle</tspan> · Points()</text>
  </g>
  <g>
    <rect x="470" y="40" width="220" height="200" rx="8" class="card-bg"/>
    <rect x="508" y="86" width="144" height="110" class="p1s" transform="rotate(-24 580 141)"/>
    <circle cx="580" cy="141" r="90" class="s4" fill="none" stroke-width="2.5"/>
    <ellipse cx="580" cy="141" rx="82" ry="62" class="s5" fill="none" stroke-width="2" stroke-dasharray="5 4" transform="rotate(-24 580 141)"/>
    <text x="580" y="60" text-anchor="middle" class="tx-b">MinEnclosingCircle / FitEllipse</text>
    <text x="580" y="228" text-anchor="middle" class="tx-m">최대 외경 / 평균 윤곽 (점 5개 이상)</text>
  </g>
  <text x="360" y="266" text-anchor="middle" class="tx-m">모멘트 중심 = (M10/M00, M01/M00) — 무게 중심이므로 비대칭 부품에서는 외접 도형 중심과 다르다</text>
  <text x="360" y="288" text-anchor="middle" class="tx-m">기울어진 물체: BoundingRect 면적 33066 vs MinAreaRect 면적 18795 (예제 1)</text>
</svg>`;

  // 그림 4: ApproxPolyDP 와 원형도
  const FIG_CIRC = `<svg viewBox="0 0 740 300" role="img" aria-label="ApproxPolyDP 로 꼭짓점을 줄이는 원리와 도형별 원형도 값">
  ${ARROW('c12a3')}
  <text x="370" y="20" text-anchor="middle" class="tx-b">ApproxPolyDP: 허용 오차 ε 안에 들어오면 중간 점을 버린다</text>
  <rect x="20" y="36" width="330" height="150" rx="8" class="card-bg"/>
  <polyline points="50,150 80,138 110,128 140,122 170,120 200,124 230,132 260,144 290,158" class="s1" fill="none" stroke-width="2"/>
  <circle cx="50" cy="150" r="3.5" class="p1"/><circle cx="80" cy="138" r="3" class="p3"/><circle cx="110" cy="128" r="3" class="p3"/><circle cx="140" cy="122" r="3" class="p3"/>
  <circle cx="170" cy="120" r="3.5" class="p1"/><circle cx="200" cy="124" r="3" class="p3"/><circle cx="230" cy="132" r="3" class="p3"/><circle cx="260" cy="144" r="3" class="p3"/><circle cx="290" cy="158" r="3.5" class="p1"/>
  <polyline points="50,150 170,120 290,158" class="s3" fill="none" stroke-width="2.5" stroke-dasharray="6 4"/>
  <line x1="110" y1="128" x2="110" y2="140" class="ln" stroke-width="1.5"/><text x="116" y="140" class="tx-m">ε</text>
  <text x="185" y="62" text-anchor="middle" class="tx-m">● 남는 점 (꼭짓점) · ● 버리는 점</text>
  <text x="185" y="176" text-anchor="middle" class="tx-m">ε = 둘레 × 0.02~0.04 (크기에 비례!)</text>
  <rect x="370" y="36" width="350" height="150" rx="8" class="p2s"/>
  <text x="545" y="62" text-anchor="middle" class="tx-b">원형도(circularity) = 4π·면적 / 둘레²</text>
  <circle cx="416" cy="106" r="24" class="p1s"/><text x="416" y="150" text-anchor="middle" class="tx-m">원 1.00</text>
  <polygon points="490,82 510,94 510,118 490,130 470,118 470,94" class="p1s"/><text x="490" y="150" text-anchor="middle" class="tx-m">육각 0.91</text>
  <rect x="546" y="84" width="44" height="44" class="p1s"/><text x="568" y="150" text-anchor="middle" class="tx-m">사각 0.79</text>
  <polygon points="650,82 674,128 626,128" class="p1s"/><text x="650" y="150" text-anchor="middle" class="tx-m">삼각 0.61</text>
  <text x="545" y="176" text-anchor="middle" class="tx-m">길쭉한 볼트 ≈ 0.2 — 크기와 무관한 <tspan class="tx">모양 지표</tspan></text>
  <rect x="20" y="198" width="700" height="86" rx="8" class="card-bg"/>
  <text x="370" y="224" text-anchor="middle" class="tx-m">분류 규칙 예: 꼭짓점 3 → 삼각형 · 4 → 사각형 · 6 → 육각형(너트) · 7 이상 → 원(와셔)</text>
  <text x="370" y="250" text-anchor="middle" class="tx-m">원형도 ≥ 0.85 → 와셔 · 0.7~0.85 → 너트 · &lt; 0.45 → 볼트 · 그 사이 → <tspan class="tx">의심(붙어 있음?)</tspan></text>
  <text x="370" y="274" text-anchor="middle" class="tx-m">볼록성(solidity) = 윤곽 면적 / 볼록 껍질 면적 → 볼트 0.6~0.7, 와셔 · 너트 0.98 이상</text>
</svg>`;

  // ================================================================= 교시 2 예제
  const EX_SHAPE1 = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/chip_rotated.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Point[] body = cs.OrderByDescending(c => Cv2.ContourArea(c)).First();

        // ① 모멘트: 면적과 무게 중심
        Moments m = Cv2.Moments(body);
        Console.WriteLine($"M00 {m.M00:F0}");
        Console.WriteLine($"모멘트 중심 ({m.M10 / m.M00:F2}, {m.M01 / m.M00:F2})");

        // ② 축에 평행한 사각형 vs ③ 최소 면적 회전 사각형
        Rect br = Cv2.BoundingRect(body);
        Console.WriteLine($"BoundingRect {br} 면적 {br.Width * br.Height}");
        RotatedRect rr = Cv2.MinAreaRect(body);
        Console.WriteLine($"MinAreaRect 중심 ({rr.Center.X:F1},{rr.Center.Y:F1}) 크기 {rr.Size.Width:F1}x{rr.Size.Height:F1} 각도 {rr.Angle:F2} 면적 {rr.Size.Width * rr.Size.Height:F0}");

        Point2f[] pts = rr.Points();          // 회전 사각형의 네 꼭짓점
        for (int k = 0; k < 4; k++)
            Console.WriteLine($"  꼭짓점 {k}: ({pts[k].X:F1}, {pts[k].Y:F1})");

        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        Cv2.Rectangle(view, br, Scalar.Yellow, 2);
        for (int k = 0; k < 4; k++)
            Cv2.Line(view, new Point(pts[k].X, pts[k].Y), new Point(pts[(k + 1) % 4].X, pts[(k + 1) % 4].Y), Scalar.Lime, 2);
        Cv2.DrawMarker(view, new Point(m.M10 / m.M00, m.M01 / m.M00), Scalar.Red, MarkerTypes.Cross, 24, 2);
        Cv2.ImShow("shape", view);
        Cv2.WaitKey(0);
    }
}`;

  const EX_SHAPE2 = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washer_ring.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Point[] ring = cs.OrderByDescending(c => Cv2.ContourArea(c)).First();

        Moments m = Cv2.Moments(ring);
        Console.WriteLine($"면적 {m.M00:F0} 중심 ({m.M10 / m.M00:F2}, {m.M01 / m.M00:F2})");

        RotatedRect rr = Cv2.MinAreaRect(ring);
        Console.WriteLine($"MinAreaRect {rr.Size.Width:F1}x{rr.Size.Height:F1} 각도 {rr.Angle:F1}");

        Cv2.MinEnclosingCircle(ring, out Point2f center, out float radius);
        Console.WriteLine($"MinEnclosingCircle 중심 ({center.X:F2}, {center.Y:F2}) 반지름 {radius:F2}");

        RotatedRect el = Cv2.FitEllipse(ring);          // 점이 5개 이상이어야 한다
        Console.WriteLine($"FitEllipse 중심 ({el.Center.X:F2}, {el.Center.Y:F2}) 축 {el.Size.Width:F2}x{el.Size.Height:F2}");

        double req = Math.Sqrt(Cv2.ContourArea(ring) / Math.PI);
        Console.WriteLine($"등가 반지름 {req:F2} (정답 150.60)");

        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        Cv2.Circle(view, new Point(center.X, center.Y), (int)radius, Scalar.Lime, 2);
        Cv2.Ellipse(view, el, Scalar.Red, 2);
        Cv2.ImShow("fit", view);
        Cv2.WaitKey(0);
    }
}`;

  const EX_SHAPE3 = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 원 · 삼각형 · 사각형 · 육각형을 직접 그려서 분류해 본다
        using var canvas = new Mat(320, 640, MatType.CV_8UC1, Scalar.Black);
        Cv2.Circle(canvas, new Point(80, 160), 55, Scalar.White, -1);
        Point[] tri = { new Point(200, 105), new Point(270, 215), new Point(130, 215) };
        Cv2.FillPoly(canvas, new[] { tri }, Scalar.White);
        Cv2.Rectangle(canvas, new Rect(300, 105, 110, 110), Scalar.White, -1);
        Point[] hex = new Point[6];
        for (int i = 0; i < 6; i++)
            hex[i] = new Point(530 + (int)(55 * Math.Cos(i * Math.PI / 3)), 160 - (int)(55 * Math.Sin(i * Math.PI / 3)));
        Cv2.FillPoly(canvas, new[] { hex }, Scalar.White);

        Point[][] cs = Cv2.FindContoursAsArray(canvas, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"도형 {cs.Length}개");

        using var view = new Mat();
        Cv2.CvtColor(canvas, view, ColorConversionCodes.GRAY2BGR);
        foreach (var c in cs.OrderBy(c => Cv2.BoundingRect(c).X))
        {
            double p = Cv2.ArcLength(c, true), a = Cv2.ContourArea(c);
            Point[] ap = Cv2.ApproxPolyDP(c, 0.03 * p, true);       // ε = 둘레의 3%
            double circ = 4 * Math.PI * a / (p * p);
            string name = Name(ap.Length);
            Console.WriteLine($"  꼭짓점 {ap.Length}개 면적 {a,5:F0} 원형도 {circ:F3} → {name}");
            Cv2.Polylines(view, new[] { ap }, true, Scalar.Lime, 2);
            Cv2.PutText(view, name, new Point(Cv2.BoundingRect(c).X, 96), HersheyFonts.HersheySimplex, 0.6, Scalar.Yellow, 2);
        }
        Cv2.ImShow("shapes", view);
        Cv2.WaitKey(0);
    }

    static string Name(int v) => v == 3 ? "삼각형" : v == 4 ? "사각형" : v == 5 ? "오각형" : v == 6 ? "육각형" : "원";
}`;

  const EX_SHAPE4 = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);

        int washer = 0, nut = 0, bolt = 0, stuck = 0;
        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        for (int k = 0; k < cs.Length; k++)
        {
            if (hi[k].Parent >= 0) continue;                 // 구멍은 건너뛴다
            double a = Cv2.ContourArea(cs[k]);
            if (a < 500) continue;                            // 잡음 제거
            double p = Cv2.ArcLength(cs[k], true);
            double circ = 4 * Math.PI * a / (p * p);          // 원형도
            bool hole = hi[k].Child >= 0;                     // 구멍이 있나

            string kind;
            if (circ >= 0.85) { kind = "와셔"; washer++; }
            else if (circ >= 0.7) { kind = "너트"; nut++; }
            else if (circ < 0.45 && a < 9000) { kind = "볼트"; bolt++; }
            else { kind = "붙음?"; stuck++; }

            Console.WriteLine($"  면적 {a,6:F0} 원형도 {circ:F3} 구멍 {(hole ? "O" : "X")} → {kind}");
            Cv2.DrawContours(view, cs, k, kind == "와셔" ? Scalar.Lime : kind == "너트" ? Scalar.Yellow : kind == "볼트" ? Scalar.Cyan : Scalar.Red, 2);
        }
        Console.WriteLine($"와셔 {washer} 너트 {nut} 볼트 {bolt} 붙음 {stuck} (정답: 와셔 6 너트 4 볼트 3)");
        Cv2.ImShow("classify", view);
        Cv2.WaitKey(0);
    }
}`;

  const EX_SHAPE5 = `using System;
using System.Collections.Generic;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);

        var rows = new List<(double a, double ha, double sol, int n, int hn)>();
        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        foreach (var c in cs)
        {
            double a = Cv2.ContourArea(c);
            if (a < 500) continue;
            Point[] hull = Cv2.ConvexHull(c);                       // 고무줄로 감싼 모양
            double ha = Cv2.ContourArea(hull);
            double sol = a / ha;                                     // 볼록성(solidity)
            rows.Add((a, ha, sol, c.Length, hull.Length));
            Cv2.Polylines(view, new[] { hull }, true, Scalar.Red, 2);
        }

        // 볼록성이 낮은 것부터 4개 = 볼트 3개 + 붙어 있는 와셔 쌍
        foreach (var r in rows.OrderBy(r => r.sol).Take(4))
            Console.WriteLine($"  면적 {r.a,6:F0} 껍질 {r.ha,6:F0} 볼록성 {r.sol:F3} 점 {r.n,3}→{r.hn,3}");

        // 점이 영역 안에 있나 (true = 거리, false = +1 / 0 / -1)
        Point[] big = cs.OrderByDescending(c => Cv2.ContourArea(c)).First();
        double d = Cv2.PointPolygonTest(big, new Point2f(131, 91), true);
        double outside = Cv2.PointPolygonTest(big, new Point2f(0, 0), false);
        Console.WriteLine($"PointPolygonTest: (131,91) → {d:F1} / (0,0) → {outside:F0}");

        Cv2.ImShow("hull", view);
        Cv2.WaitKey(0);
    }
}`;

  const QUIZ2 = [
    { q: '윤곽선의 <b>무게 중심</b>을 구하는 식은?', options: ['<code>(M10, M01)</code>', '<code>(M10/M00, M01/M00)</code>', '<code>(M00/M10, M00/M01)</code>', '<code>BoundingRect.Center</code>'], answer: 1,
      explain: '<code>M00</code> 이 면적이고 <code>M10</code> · <code>M01</code> 은 x · y 의 합이므로, <b>중심 = (M10/M00, M01/M00)</b> 입니다. <code>BoundingRect</code> 의 중심은 외접 사각형의 중심이라 비대칭 물체에서는 무게 중심과 다릅니다.' },
    { q: '기울어진 직사각형 부품의 <b>실제 크기와 각도</b>를 얻는 함수는?', options: ['<code>Cv2.BoundingRect</code>', '<code>Cv2.MinAreaRect</code>', '<code>Cv2.MinEnclosingCircle</code>', '<code>Cv2.ApproxPolyDP</code>'], answer: 1,
      explain: '<code>MinAreaRect</code> 는 <code>RotatedRect</code>(Center · Size · <b>Angle</b>)를 돌려줍니다. 예제에서 칩은 170.3×110.4 px, −23.50° 로 나왔고 <code>BoundingRect</code>(198×167)보다 실제 크기에 가깝습니다.' },
    { q: '<code>Cv2.ApproxPolyDP</code> 의 <code>epsilon</code> 을 <b>둘레의 비율</b>로 주는 이유는?', options: ['실행 속도가 빨라진다', '물체 크기가 달라도 같은 정도로 단순화되기 때문', '반드시 정수여야 하기 때문', '닫힌 곡선만 처리되기 때문'], answer: 1,
      explain: 'epsilon 은 px 단위 허용 오차입니다. 고정값을 쓰면 큰 물체는 거의 단순화되지 않고 작은 물체는 뭉개집니다. <code>0.02~0.04 × ArcLength</code> 처럼 <b>크기에 비례</b>하게 주면 크기와 무관하게 꼭짓점 수가 안정적으로 나옵니다.' },
    { q: '원형도 <b>4πA/P²</b> 값이 가장 큰 도형은?', options: ['정삼각형 (≈0.61)', '정사각형 (≈0.79)', '정육각형 (≈0.91)', '원 (=1)'], answer: 3,
      explain: '같은 둘레로 가장 넓은 면적을 갖는 도형이 원이므로 원형도는 <b>1 이 최대</b>입니다. 각이 많아질수록 1 에 가까워집니다(삼각 0.61 → 사각 0.79 → 육각 0.91 → 원 1). 길쭉한 볼트는 0.2 근처로 작습니다.' },
    { q: '<b>볼록성(solidity)</b> = 윤곽 면적 / 볼록 껍질 면적 이 <b>0.6</b> 으로 낮게 나온 부품은?', options: ['원형 와셔', '육각 너트', '머리가 있는 볼트', '완전한 원'], answer: 2,
      explain: '볼트는 머리와 몸통 사이가 <b>오목</b>하므로 껍질 면적이 실제보다 훨씬 커져 볼록성이 0.6~0.7 로 떨어집니다. 와셔 · 너트는 0.98 이상입니다. 볼록성은 깨짐 · 버(burr) 같은 결함 검출에도 그대로 쓰입니다.' }
  ];
  // 그림 5: 연결 요소 라벨링
  const FIG_LABEL = `<svg viewBox="0 0 740 280" role="img" aria-label="연결 요소 라벨링은 붙어 있는 흰 픽셀에 같은 번호를 붙이고 4연결과 8연결이 결과를 바꾼다">
  ${ARROW('c12b1')}
  <text x="370" y="20" text-anchor="middle" class="tx-b">연결 요소 라벨링(Connected Components) = 붙어 있는 흰 픽셀에 <tspan class="tx">같은 번호</tspan> 붙이기</text>
  <rect x="20" y="36" width="210" height="170" rx="8" class="card-bg"/>
  <text x="125" y="58" text-anchor="middle" class="tx-m">이진 이미지</text>
  <rect x="50" y="72" width="70" height="50" class="p1s"/><rect x="146" y="72" width="54" height="50" class="p1s"/>
  <rect x="50" y="140" width="150" height="46" class="p1s"/>
  <text x="125" y="200" text-anchor="middle" class="tx-m">흰 덩어리 3개</text>
  <line x1="238" y1="120" x2="272" y2="120" class="ln" stroke-width="2" marker-end="url(#c12b1)"/>
  <rect x="284" y="36" width="210" height="170" rx="8" class="card-bg"/>
  <text x="389" y="58" text-anchor="middle" class="tx-m">라벨 Mat (CV_32S)</text>
  <rect x="314" y="72" width="70" height="50" class="p2s"/><text x="349" y="103" text-anchor="middle" class="tx-b">1</text>
  <rect x="410" y="72" width="54" height="50" class="p3s"/><text x="437" y="103" text-anchor="middle" class="tx-b">2</text>
  <rect x="314" y="140" width="150" height="46" class="p4s"/><text x="389" y="170" text-anchor="middle" class="tx-b">3</text>
  <text x="389" y="200" text-anchor="middle" class="tx-m">배경 = <tspan class="tx">0</tspan> → 물체 수 = 라벨 수 − 1</text>
  <rect x="510" y="36" width="210" height="170" rx="8" class="p2s"/>
  <text x="615" y="58" text-anchor="middle" class="tx-b">4연결 vs 8연결</text>
  <rect x="540" y="72" width="26" height="26" class="p1"/><rect x="566" y="98" width="26" height="26" class="p1"/>
  <text x="620" y="92" class="tx-m">대각선으로만</text><text x="620" y="112" class="tx-m">닿아 있으면?</text>
  <text x="615" y="146" text-anchor="middle" class="tx-m">4연결 → <tspan class="tx">2개</tspan> (상하좌우만)</text>
  <text x="615" y="170" text-anchor="middle" class="tx-m">8연결 → <tspan class="tx">1개</tspan> (기본값)</text>
  <text x="615" y="194" text-anchor="middle" class="tx-m">PixelConnectivity.Connectivity4/8</text>
  <text x="370" y="234" text-anchor="middle" class="tx-m">stats 한 행 = [Left, Top, Width, Height, <tspan class="tx">Area</tspan>] · centroids 한 행 = [x, y] (double)</text>
  <text x="370" y="258" text-anchor="middle" class="tx-m">ConnectedComponentsEx → cc.Blobs[k].Label · Area · Rect · Centroid 로 바로 꺼내 쓴다</text>
</svg>`;

  // 그림 6: 거리 변환 + Watershed 파이프라인
  const FIG_WS = `<svg viewBox="0 0 740 300" role="img" aria-label="거리 변환으로 씨앗을 만들고 watershed 로 붙어 있는 물체를 분리하는 5단계 파이프라인">
  ${ARROW('c12b2')}
  <text x="370" y="20" text-anchor="middle" class="tx-b">붙어 있는 두 물체를 분리하는 5단계</text>
  <g>
    <rect x="18" y="36" width="130" height="120" rx="8" class="card-bg"/>
    <text x="83" y="56" text-anchor="middle" class="tx-m">① 이진화</text>
    <circle cx="62" cy="106" r="30" class="p1s"/><circle cx="104" cy="106" r="30" class="p1s"/>
    <text x="83" y="148" text-anchor="middle" class="tx-m">덩어리 1개</text>
  </g>
  <line x1="152" y1="96" x2="176" y2="96" class="ln" stroke-width="2" marker-end="url(#c12b2)"/>
  <g>
    <rect x="180" y="36" width="130" height="120" rx="8" class="card-bg"/>
    <text x="245" y="56" text-anchor="middle" class="tx-m">② 거리 변환</text>
    <circle cx="224" cy="106" r="30" class="p1s"/><circle cx="266" cy="106" r="30" class="p1s"/>
    <circle cx="224" cy="106" r="20" class="p2s"/><circle cx="266" cy="106" r="20" class="p2s"/>
    <circle cx="224" cy="106" r="9" class="p3"/><circle cx="266" cy="106" r="9" class="p3"/>
    <text x="245" y="148" text-anchor="middle" class="tx-m">중심이 가장 밝다</text>
  </g>
  <line x1="314" y1="96" x2="338" y2="96" class="ln" stroke-width="2" marker-end="url(#c12b2)"/>
  <g>
    <rect x="342" y="36" width="130" height="120" rx="8" class="card-bg"/>
    <text x="407" y="56" text-anchor="middle" class="tx-m">③ 봉우리 잘라내기</text>
    <circle cx="386" cy="106" r="11" class="p3"/><circle cx="428" cy="106" r="11" class="p3"/>
    <text x="407" y="148" text-anchor="middle" class="tx-m">씨앗 2개 (라벨링)</text>
  </g>
  <line x1="476" y1="96" x2="500" y2="96" class="ln" stroke-width="2" marker-end="url(#c12b2)"/>
  <g>
    <rect x="504" y="36" width="216" height="120" rx="8" class="card-bg"/>
    <text x="612" y="56" text-anchor="middle" class="tx-m">④ 마커 Mat (CV_32SC1) → ⑤ Watershed</text>
    <circle cx="570" cy="106" r="30" class="p2s"/><circle cx="612" cy="106" r="30" class="p4s"/>
    <line x1="591" y1="78" x2="591" y2="134" class="s1" stroke-width="3"/>
    <text x="680" y="100" class="tx-m">경계</text><text x="680" y="118" class="tx-m">= −1</text>
    <text x="612" y="148" text-anchor="middle" class="tx-m">물체 2개로 분리</text>
  </g>
  <rect x="18" y="172" width="702" height="112" rx="8" class="p2s"/>
  <text x="370" y="196" text-anchor="middle" class="tx-m">씨앗 라벨 + 1 → 배경 후보 = 1, <tspan class="tx">미지 영역(확실한 배경도 전경도 아닌 곳) = 0</tspan></text>
  <text x="370" y="220" text-anchor="middle" class="tx-m">Watershed 는 0 인 곳만 채워 나가며 서로 다른 라벨이 만나는 선을 −1 로 표시한다</text>
  <text x="370" y="246" text-anchor="middle" class="tx-m">봉우리 임계값이 낮으면 한 물체가 <tspan class="tx">여러 개</tspan>로 쪼개지고, 높으면 작은 물체의 씨앗이 <tspan class="tx">사라진다</tspan></text>
  <text x="370" y="272" text-anchor="middle" class="tx-m">→ 반드시 임계값을 바꿔 보며 씨앗 개수를 확인할 것 (와셔 영상은 0.30~0.40 에서 13개)</text>
</svg>`;

  // ================================================================= 교시 3 예제
  const EX_CC1 = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);

        using var labels = new Mat();      // CV_32S — 픽셀마다 라벨 번호
        using var stats = new Mat();       // n x 5 : Left, Top, Width, Height, Area
        using var centroids = new Mat();   // n x 2 : 중심 x, y (double)
        int n = Cv2.ConnectedComponentsWithStats(bin, labels, stats, centroids);
        Console.WriteLine($"라벨 {n}개 (배경 포함) → 물체 {n - 1}개");
        Console.WriteLine($"stats {stats.Rows}x{stats.Cols} {stats.Type()} / centroids {centroids.Rows}x{centroids.Cols} {centroids.Type()}");

        for (int k = 0; k < 4; k++)
        {
            int left = stats.At<int>(k, (int)ConnectedComponentsTypes.Left);
            int top = stats.At<int>(k, (int)ConnectedComponentsTypes.Top);
            int w = stats.At<int>(k, (int)ConnectedComponentsTypes.Width);
            int h = stats.At<int>(k, (int)ConnectedComponentsTypes.Height);
            int area = stats.At<int>(k, (int)ConnectedComponentsTypes.Area);
            Console.WriteLine($"  [{k}] L{left} T{top} W{w} H{h} 면적 {area} 중심 ({centroids.At<double>(k, 0):F1},{centroids.At<double>(k, 1):F1})");
        }

        Cv2.ImShow("labels", labels);
        Cv2.WaitKey(0);
    }
}`;

  const EX_CC2 = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);

        // OpenCvSharp 전용: 결과를 객체로 정리해 준다
        ConnectedComponents cc = Cv2.ConnectedComponentsEx(bin);
        Console.WriteLine($"LabelCount {cc.LabelCount} → 물체 {cc.LabelCount - 1}개");

        Blob big = cc.GetLargestBlob();      // 배경(라벨 0)은 빼고 가장 큰 것
        Console.WriteLine($"가장 큰 블롭: 라벨 {big.Label} 면적 {big.Area} {big.Rect} 중심 ({big.Centroid.X:F1},{big.Centroid.Y:F1})");

        foreach (var b in cc.Blobs.Skip(1).OrderByDescending(b => b.Area).Take(3))
            Console.WriteLine($"  라벨 {b.Label}: 면적 {b.Area} 폭 {b.Width} 높이 {b.Height}");

        using var color = new Mat();
        cc.RenderBlobs(color);               // 라벨마다 다른 색으로 칠해 준다
        Console.WriteLine($"RenderBlobs {color.Width}x{color.Height} {color.Type()}");
        Cv2.ImShow("blobs", color);
        Cv2.WaitKey(0);
    }
}`;

  const EX_CC3 = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        var cc = Cv2.ConnectedComponentsEx(bin);

        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);

        int no = 0;
        // 면적 1000 이상만 남기고, 화면 위에서 아래 · 왼쪽에서 오른쪽 순서로 번호 붙이기
        foreach (var b in cc.Blobs.Skip(1).Where(b => b.Area >= 1000)
                            .OrderBy(b => b.Centroid.Y).ThenBy(b => b.Centroid.X))
        {
            no++;
            Cv2.Rectangle(view, b.Rect, Scalar.Lime, 2);
            Cv2.PutText(view, no.ToString(), new Point(b.Rect.X, b.Rect.Y - 6),
                        HersheyFonts.HersheySimplex, 0.6, Scalar.Red, 2);
        }
        Console.WriteLine($"번호를 붙인 물체 {no}개");
        Console.WriteLine($"면적 1000 미만으로 걸러낸 블롭 {cc.LabelCount - 1 - no}개");

        Size ts = Cv2.GetTextSize("12", HersheyFonts.HersheySimplex, 0.6, 2, out int baseLine);
        Console.WriteLine($"글자 '12' 크기 {ts.Width}x{ts.Height} (baseLine {baseLine}) → 글자가 겹치지 않게 위치를 잡는 데 쓴다");

        Cv2.ImShow("numbered", view);
        Cv2.WaitKey(0);
    }
}`;

  const EX_WS = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        using var l0 = new Mat();
        Console.WriteLine($"그냥 세면 {Cv2.ConnectedComponents(bin, l0) - 1}개 (실제 13개)");

        // ① 구멍을 메운다 — 링 모양이면 거리 변환의 봉우리가 고리처럼 생겨 쪼개진다
        Point[][] outer = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        using var solid = new Mat(bin.Size(), MatType.CV_8UC1, Scalar.Black);
        Cv2.DrawContours(solid, outer, -1, Scalar.White, -1);

        // ② 거리 변환: 각 흰 픽셀에서 가장 가까운 검은 픽셀까지의 거리
        using var dist = new Mat();
        Cv2.DistanceTransform(solid, dist, DistanceTypes.L2, DistanceTransformMasks.Mask5);
        Cv2.MinMaxLoc(dist, out double dmin, out double dmax);
        Console.WriteLine($"거리 최대 {dmax:F1} px");

        // ③ 0~1 로 정규화하고 봉우리만 남긴다 (임계값은 반드시 실험으로!)
        using var distN = new Mat();
        Cv2.Normalize(dist, distN, 0, 1, NormTypes.MinMax);
        foreach (double th in new[] { 0.20, 0.30, 0.40, 0.50 })
        {
            using var pk = new Mat();
            Cv2.Threshold(distN, pk, th, 1.0, ThresholdTypes.Binary);
            using var pk8 = new Mat();
            pk.ConvertTo(pk8, MatType.CV_8UC1, 255);
            using var tmp = new Mat();
            Console.WriteLine($"  임계값 {th:F2} → 씨앗 {Cv2.ConnectedComponents(pk8, tmp) - 1}개");
        }

        using var peak = new Mat();
        Cv2.Threshold(distN, peak, 0.35, 1.0, ThresholdTypes.Binary);
        using var fg = new Mat();
        peak.ConvertTo(fg, MatType.CV_8UC1, 255);
        using var seeds = new Mat();
        int n = Cv2.ConnectedComponents(fg, seeds);
        Console.WriteLine($"씨앗 {n - 1}개");

        // ④ 마커 만들기: 씨앗 라벨 + 1, 미지 영역은 0
        using var bg = new Mat();
        Cv2.Dilate(solid, bg, Cv2.GetStructuringElement(MorphShapes.Rect, new Size(5, 5)), null, 2);
        using var unknown = new Mat();
        Cv2.Subtract(bg, fg, unknown);
        using var markers = new Mat();
        seeds.ConvertTo(markers, MatType.CV_32SC1, 1, 1);
        markers.SetTo(Scalar.All(0), unknown);

        // ⑤ Watershed — 입력 이미지는 3채널이어야 한다
        using var bgr = new Mat();
        Cv2.CvtColor(img, bgr, ColorConversionCodes.GRAY2BGR);
        Cv2.Watershed(bgr, markers);
        Cv2.MinMaxLoc(markers, out double mn, out double mx);
        Console.WriteLine($"watershed 후 라벨 {mn} ~ {mx} → 물체 {(int)mx - 1}개");

        using var edge = new Mat();
        Cv2.Compare(markers, Scalar.All(-1), edge, CmpType.EQ);
        Console.WriteLine($"경계(-1) 픽셀 {Cv2.CountNonZero(edge)}개");
        bgr.SetTo(Scalar.Red, edge);
        Cv2.ImShow("watershed", bgr);
        Cv2.WaitKey(0);
    }
}`;

  const EX_PIPE = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        int a = CountParts("images/washers.png", true, 500);
        int b = CountParts("images/coins_parts.png", false, 500);
        int c = CountParts("images/flange.png", false, 500);
        Console.WriteLine($"washers.png     → {a}개 (실제 13 — 닿은 쌍 2개 때문에 부족)");
        Console.WriteLine($"coins_parts.png → {b}개 (실제 12)");
        Console.WriteLine($"flange.png      → {c}개 (실제 1)");
    }

    /// <summary>개수 세기 파이프라인: 읽기 → 이진화 → 라벨링 → 면적 필터</summary>
    static int CountParts(string path, bool darkObject, int minArea)
    {
        using var img = Cv2.ImRead(path, ImreadModes.Grayscale);
        if (img.Empty()) { Console.WriteLine($"[경고] {path} 를 읽을 수 없습니다"); return 0; }

        using var bin = new Mat();
        ThresholdTypes mode = darkObject ? ThresholdTypes.BinaryInv : ThresholdTypes.Binary;
        Cv2.Threshold(img, bin, 0, 255, mode | ThresholdTypes.Otsu);

        var cc = Cv2.ConnectedComponentsEx(bin);
        return cc.Blobs.Skip(1).Count(b => b.Area >= minArea);
    }
}`;

  const WPF_CODE = `// 🖥 WPF: 개수 세기 결과를 화면에 표시 (브라우저에서는 실행하지 않음)
using System.Linq;
using System.Windows;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;

public partial class MainWindow : Window
{
    private void CountButton_Click(object sender, RoutedEventArgs e)
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);

        var cc = Cv2.ConnectedComponentsEx(bin);
        var parts = cc.Blobs.Skip(1).Where(b => b.Area >= (int)MinAreaSlider.Value).ToList();

        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        int no = 0;
        foreach (var b in parts.OrderBy(b => b.Centroid.Y).ThenBy(b => b.Centroid.X))
        {
            no++;
            Cv2.Rectangle(view, b.Rect, Scalar.Lime, 2);
            Cv2.PutText(view, no.ToString(), new OpenCvSharp.Point(b.Rect.X, b.Rect.Y - 6),
                        HersheyFonts.HersheySimplex, 0.6, Scalar.Red, 2);
        }
        ResultImage.Source = view.ToBitmapSource();      // Mat → BitmapSource
        CountText.Text = no + " 개";
    }
}`;

  const QUIZ3 = [
    { q: '<code>Cv2.ConnectedComponents</code> 가 돌려주는 값이 <b>12</b> 일 때 물체 개수는?', options: ['12개', '11개', '13개', '알 수 없다'], answer: 1,
      explain: '<b>라벨 0 은 배경</b>이므로 물체는 <code>n - 1</code> = 11개입니다. <code>ConnectedComponentsEx</code> 의 <code>Blobs</code> 도 <code>Blobs[0]</code> 이 배경이라 <code>Skip(1)</code> 로 건너뜁니다.' },
    { q: '<code>stats</code> Mat 의 한 행에 들어 있는 값의 순서는?', options: ['Area, Left, Top, Width, Height', 'Left, Top, Width, Height, Area', 'x, y, w, h, 중심', 'Width, Height, Area, x, y'], answer: 1,
      explain: '<code>ConnectedComponentsTypes</code> 열거형 그대로 <b>Left(0) · Top(1) · Width(2) · Height(3) · Area(4)</b> 순서입니다(CV_32S). 중심 좌표는 별도의 <code>centroids</code> Mat(CV_64F, x · y)에 들어갑니다.' },
    { q: '대각선으로만 닿아 있는 두 픽셀을 <b>한 덩어리</b>로 보려면?', options: ['4연결 (Connectivity4)', '8연결 (Connectivity8)', '거리 변환을 먼저 한다', '모폴로지 열기를 한다'], answer: 1,
      explain: '<b>8연결</b>은 대각선 이웃까지 연결로 보므로 하나가 되고, 4연결은 상하좌우만 보므로 둘이 됩니다. OpenCV 의 기본값은 <b>8연결</b>입니다 — 얇은 대각선 결함을 셀 때 결과가 달라지니 주의하세요.' },
    { q: '닿아 있는 두 원을 분리하려고 <b>거리 변환</b>을 쓰는 이유는?', options: ['잡음을 없애 준다', '각 물체의 중심이 가장 큰 값이 되어 봉우리가 물체마다 하나씩 생긴다', '경계선이 진해진다', '면적을 정확히 계산해 준다'], answer: 1,
      explain: '거리 변환은 각 흰 픽셀에서 <b>가장 가까운 검은 픽셀까지의 거리</b>입니다. 물체 중심이 가장 멀리 있으므로 값이 최대가 되고, 두 물체가 닿은 <b>이음목은 값이 작습니다</b>. 그래서 봉우리만 남기면 물체마다 씨앗 하나를 얻습니다.' },
    { q: 'Watershed 의 <b>마커(markers) Mat</b> 에 대한 설명으로 옳은 것은?', options: ['CV_8UC1 이고 배경은 255', 'CV_32SC1 이고 미지 영역은 0, 결과에서 경계는 −1', 'CV_32FC1 이고 씨앗은 1.0', '입력 이미지와 같은 3채널'], answer: 1,
      explain: '마커는 <b>CV_32SC1</b>(int) 입니다. 확실한 배경 · 각 씨앗에 1 이상의 서로 다른 번호를 주고 <b>모르는 영역은 0</b> 으로 둡니다. Watershed 가 0 인 곳을 채우고 라벨이 만나는 선을 <b>−1</b> 로 표시합니다. 입력 이미지는 3채널이어야 합니다.' }
  ];

  CS_COURSE.addChapter({
    id: 'cs12', no: '12', title: '윤곽선과 도형 분석', subtitle: 'FindContours · 계층 · 모멘트 · ApproxPolyDP · 연결 요소 · Watershed',
    summary: '이진화한 영상에서 <b>물체의 경계(윤곽선)</b>를 찾아 개수를 세고, 면적 · 둘레 · 중심 · 꼭짓점 수 · 원형도 같은 <b>도형 특성</b>으로 부품을 분류합니다. 마지막으로 <b>연결 요소 라벨링</b>과 <b>거리 변환 + Watershed</b> 로 서로 닿아 있는 물체까지 분리해 정확한 개수를 세는 파이프라인을 완성합니다.',
    goals: ['FindContours 의 RetrievalModes · ContourApproximationModes 를 구분해 쓰고 계층으로 구멍 개수를 셀 수 있다',
      'ContourArea · ArcLength · BoundingRect · Moments · MinAreaRect · MinEnclosingCircle · FitEllipse 로 도형을 측정할 수 있다',
      'ApproxPolyDP 의 꼭짓점 수와 원형도 · 볼록성으로 부품(볼트 · 너트 · 와셔)을 분류할 수 있다',
      'ConnectedComponentsWithStats · ConnectedComponentsEx 로 라벨링하고, DistanceTransform + Watershed 로 닿아 있는 물체를 분리할 수 있다'],
    wpf: 'Ch17_Inspection',
    sections: [
      // ============================================================ 교시 1
      {
        id: 'cs12-1', title: '윤곽선 찾기와 계층 구조', minutes: 50,
        goals: ['윤곽선이 무엇이고 어떤 입력이 필요한지 안다', 'RetrievalModes 4가지와 ApproxSimple/None 의 차이를 설명할 수 있다', '계층 구조로 구멍 개수를 세고 면적 순으로 정렬할 수 있다'],
        flow: [['도입: 개수를 세려면', 5], ['FindContours 와 모드', 15], ['계층 · 측정 · 정렬', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '물체를 "세려면" 경계를 알아야 한다' },
          { type: 'p', html: '07차시에서 이진화를 배웠습니다. 흰색 덩어리가 물체라는 것은 알지만, <b>몇 개인지 · 각각 얼마나 큰지 · 어떤 모양인지</b> 는 아직 모릅니다. <b>윤곽선(Contour)</b> 은 흰 영역의 <b>경계 픽셀을 순서대로 모은 점 목록</b>입니다. 점 목록이 손에 들어오면 면적 · 둘레 · 중심 · 꼭짓점 수 같은 값을 모두 계산할 수 있습니다.' },
          { type: 'figure', html: FIG_CONTOUR, caption: '그림 1. 윤곽선 = 경계를 따라 모은 Point 배열. 윤곽 하나 = 점 배열 하나이므로 결과는 Point[][] 이다' },
          { type: 'code', title: '예제 1: FindContours 기본 — 찾고, 재고, 그리기', code: EX_FIND,
            desc: '<code>Cv2.FindContours(bin, out Point[][] contours, out HierarchyIndex[] hierarchy, mode, method)</code> 가 기본형입니다. 플랜지는 밝은 부품이므로 <code>Binary | Otsu</code> 로 이진화했고, <code>External</code> 이라 <b>바깥 윤곽 1개</b>만 나옵니다. 점 484개로 면적 90318 px², 둘레 1124.0 px 을 얻었습니다(반지름 170 px 원의 면적 π·170² ≈ 90792 와 거의 같습니다). <code>Cv2.DrawContours(view, contours, -1, ...)</code> 의 <code>-1</code> 은 "전부 그리기" 입니다.',
            expect: 'Otsu 임계값 104\n윤곽 1개\n점 484개, 면적 90318, 둘레 1124.0\nBoundingRect (x:152 y:68 width:340 height:340)' },
          { type: 'callout', kind: 'warn', title: '입력은 반드시 1채널 이진 이미지', html: '<code>FindContours</code> 는 <b>CV_8UC1</b> 이미지의 <b>0 이 아닌 픽셀</b>을 물체로 봅니다. 컬러를 그대로 넣으면 예외가 납니다. 또한 <b>물체가 흰색</b>이어야 하므로 백라이트 영상(부품이 어두움)은 <code>ThresholdTypes.BinaryInv</code> 로 반전해야 합니다 — 반대로 하면 배경 전체가 하나의 거대한 윤곽으로 잡힙니다.' },
          { type: 'h', text: '어디까지 찾을까 · 점을 얼마나 남길까' },
          { type: 'figure', html: FIG_HIER, caption: '그림 2. RetrievalModes 와 계층 구조 — CComp 에서 Parent ≥ 0 인 윤곽이 구멍이다' },
          { type: 'table', head: ['RetrievalModes', '찾는 범위', '계층', '쓰는 곳'], rows: [
            ['<code>External</code>', '가장 바깥 윤곽만', '없음', '물체 개수 세기 (구멍 무시)'],
            ['<code>List</code>', '전부', '채우지 않음 (Parent = −1)', '모든 경계가 필요하고 포함 관계는 무관할 때'],
            ['<code>CComp</code>', '전부', '2단 (바깥 / 구멍)', '<b>구멍 개수 검사</b> — 가장 실용적'],
            ['<code>Tree</code>', '전부', '완전한 트리', '구멍 안에 또 물체가 있는 복잡한 구조']
          ], caption: '표 1. 네 가지 검색 모드' },
          { type: 'code', title: '예제 2: 모드에 따라 결과가 달라진다', code: EX_MODES,
            desc: '플랜지는 바깥 1개 + 구멍 7개 = 윤곽 8개입니다. <code>External</code> 만 1개이고 나머지는 모두 8개입니다(차이는 계층 정보가 채워지는지). 뒤쪽은 점 개수 비교 — <code>ApproxSimple</code> 484점 vs <code>ApproxNone</code> 960점인데 <b>면적은 똑같습니다</b>. 즉 직선 구간의 중간 점은 버려도 손해가 없으므로 평소에는 <code>ApproxSimple</code> 을 씁니다.',
            expect: 'External: 윤곽 1개\nList    : 윤곽 8개\nCComp   : 윤곽 8개\nTree    : 윤곽 8개\nApproxSimple 점 484개 / ApproxNone 점 960개\n면적은 그대로: 90318 vs 90318' },
          { type: 'image', src: 'images/flange.png', caption: '플랜지 — 중앙 보어 1개 + 볼트 구멍 6개 = 구멍 7개 (정답)', width: 400 },
          { type: 'code', title: '예제 3: 계층으로 구멍 7개 세기', code: EX_HIER,
            desc: '<code>HierarchyIndex</code> 의 네 값 중 <b><code>Parent</code></b> 가 핵심입니다. −1 이면 가장 바깥, 0 이상이면 그 번호의 윤곽에 감싸인 <b>구멍</b>입니다. 결과를 보면 [0] 이 바깥(면적 90318, Child 1), [1]~[7] 이 구멍(Parent 0)입니다. 구멍 중 면적 7286 인 [5] 가 중앙 보어(r = 48 → π·48² ≈ 7238)이고 나머지 6개는 볼트 구멍(r = 15 → 707)입니다. 구멍이 6개나 8개로 나오면 불량 판정에 쓸 수 있습니다.',
            expect: '전체 윤곽 8개, 구멍 7개\n  [0] 점 484개 면적  90318 Parent -1 Child 1\n  [1] 점  44개 면적    759 Parent 0 Child -1\n  [2] 점  48개 면적    751 Parent 0 Child -1\n  [3] 점  40개 면적    757 Parent 0 Child -1\n  [4] 점  40개 면적    739 Parent 0 Child -1\n  [5] 점 136개 면적   7286 Parent 0 Child -1\n  [6] 점  48개 면적    750 Parent 0 Child -1\n  [7] 점  40개 면적    740 Parent 0 Child -1' },
          { type: 'code', title: '예제 4: 면적으로 정렬하기 (LINQ) — 와셔 영상', code: EX_SORT,
            desc: '<code>images/washers.png</code> 는 와셔 6 · 너트 4 · 볼트 3 = <b>13개</b> 부품인데, 바깥 윤곽은 <b>11개</b>만 나옵니다 — <b>서로 닿아 있는 2쌍</b>이 하나로 합쳐졌기 때문입니다(면적 10861 과 7203 이 그 둘). 구멍은 와셔 6 + 너트 4 = 10개로 정답과 맞습니다. 튜플 <code>(int k, double area, double peri)</code> 리스트를 만들고 <code>OrderByDescending</code> 으로 정렬하면 큰 것부터 다루기 쉽습니다. 닿아 있는 물체 분리는 3교시에서 해결합니다.',
            expect: '전체 윤곽 21개\n바깥 11개, 구멍 10개\n  [18] 면적   10861 둘레  516.0\n  [0] 면적    7203 둘레  650.5\n  [14] 면적    5462 둘레  277.4\n  [10] 면적    4004 둘레  238.8\n  [16] 면적    3965 둘레  238.2' },
          { type: 'callout', kind: 'tip', title: 'ContourArea 는 픽셀 개수가 아니다', html: '<code>ContourArea</code> 는 점들이 만드는 <b>다각형 면적</b>이므로 ① 내부 구멍이 빠지지 않고 ② 픽셀 개수(<code>ConnectedComponents</code> 의 Area)와 1~2% 다를 수 있습니다. 실제 재료 면적을 원하면 <b>바깥 면적 − 구멍 면적</b>을 직접 계산하세요(예제 4 의 와셔: 외곽 3950 − 구멍 ≈ 1010 = 링 면적).' },
          { type: 'callout', kind: 'field', title: '현장 이야기: 개수 세기의 3단 방어', html: '실제 검사기는 ① <b>면적 필터</b>로 잡음 · 먼지 제거 ② <b>구멍 개수 · 모양</b>으로 종류 확인 ③ <b>닿은 물체 분리</b>(watershed)의 3단으로 만듭니다. "윤곽 개수 = 부품 개수" 라고 믿고 만든 프로그램은 부품이 한 번 겹치는 날 오답을 냅니다 — 예제 4 의 11 vs 13 이 바로 그 상황입니다.' },
          { type: 'callout', kind: 'vs', title: 'out 매개변수와 배열', html: 'OpenCvSharp 의 <code>FindContours</code> 는 <code>out Point[][] contours</code> 처럼 <b>출력 매개변수</b>로 결과를 줍니다. Visual Studio 에서는 <code>Cv2.FindContours(</code> 까지 입력하면 매개변수 순서가 툴팁으로 보입니다. 계층이 필요 없으면 <code>Point[][] cs = Cv2.FindContoursAsArray(bin, mode, method);</code> 가 더 간결합니다.' }
        ],
        practice: [
          {
            title: '부품 12개의 윤곽선 찾기', level: 1,
            desc: '<code>images/coins_parts.png</code>(어두운 배경 위 밝은 원형 부품 12개)에서 윤곽선을 찾아 <b>개수 · 가장 큰 면적 · 가장 작은 면적</b>을 출력하고, 모든 윤곽을 초록으로 그려 보세요.',
            hint: '부품이 <b>밝으므로</b> <code>ThresholdTypes.Binary | Otsu</code> 입니다. 최대 · 최소는 LINQ 로: <code>cs.Max(c => Cv2.ContourArea(c))</code>, <code>cs.Min(...)</code>.',
            expect: '윤곽 12개\n가장 큰 면적 3524\n가장 작은 면적 1188',
            starter: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        // TODO: 부품이 밝은지 어두운지 보고 이진화하세요
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);

        // TODO: FindContoursAsArray 로 윤곽을 찾아 개수 · 최대 · 최소 면적을 출력하세요

        Cv2.ImShow("bin", bin);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);

        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"윤곽 {cs.Length}개");
        Console.WriteLine($"가장 큰 면적 {cs.Max(c => Cv2.ContourArea(c)):F0}");
        Console.WriteLine($"가장 작은 면적 {cs.Min(c => Cv2.ContourArea(c)):F0}");

        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        Cv2.DrawContours(view, cs, -1, Scalar.Lime, 2);
        Cv2.ImShow("contours", view);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '볼트 구멍 6개만 골라내기', level: 2,
            desc: '<code>images/flange.png</code> 에서 <b>볼트 구멍 6개</b>(면적 약 750)만 골라 중심 좌표를 출력하세요. 중앙 보어(면적 약 7286)와 바깥 윤곽은 제외합니다. 중심은 <code>Cv2.Moments</code> 의 <code>M10/M00</code>, <code>M01/M00</code> 으로 구하고, 결과를 <code>Cv2.Circle</code> 로 표시하세요.',
            hint: '<code>CComp</code> 로 찾은 뒤 조건 두 개를 겁니다: <code>hi[k].Parent >= 0</code>(구멍) 이고 <code>면적 &lt; 2000</code>(볼트 구멍). 출력 순서를 고정하려면 중심 각도나 y → x 순으로 정렬하세요.',
            expect: '볼트 구멍 6개\n  중심 (291.5, 124.0)\n  중심 (405.4, 154.6)\n  중심 (208.0, 207.5)\n  중심 (436.0, 268.5)\n  중심 (238.6, 321.4)\n  중심 (352.5, 351.9)',
            starter: `using System;
using System.Collections.Generic;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"전체 윤곽 {cs.Length}개");

        // TODO: Parent >= 0 이고 면적이 2000 보다 작은 윤곽만 골라 중심을 출력하세요

        Cv2.ImShow("bin", bin);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using System.Collections.Generic;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);

        var holes = new List<(double x, double y)>();
        for (int k = 0; k < cs.Length; k++)
        {
            if (hi[k].Parent < 0) continue;
            double a = Cv2.ContourArea(cs[k]);
            if (a >= 2000) continue;
            var m = Cv2.Moments(cs[k]);
            holes.Add((m.M10 / m.M00, m.M01 / m.M00));
        }
        Console.WriteLine($"볼트 구멍 {holes.Count}개");

        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        foreach (var h in holes.OrderBy(h => h.y).ThenBy(h => h.x))
        {
            Console.WriteLine($"  중심 ({h.x:F1}, {h.y:F1})");
            Cv2.Circle(view, new Point((int)h.x, (int)h.y), 20, Scalar.Red, 2);
        }
        Cv2.ImShow("holes", view);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '윤곽선과 도형 분석 ①', subtitle: '윤곽선 찾기와 계층 구조', notes: '<p>💬 “이진화한 영상에서 부품이 몇 개인지 어떻게 알까요?” — 흰 덩어리를 세면 된다. 그런데 “덩어리”를 프로그램이 알려면 경계를 따라가야 한다는 흐름으로 윤곽선을 도입합니다. (3분)</p>' },
          { layout: 'diagram', title: '윤곽선 = 경계 점 목록', html: FIG_CONTOUR, caption: '윤곽 하나 = Point 배열 하나 → 결과는 Point[][]', notes: '<p>격자 그림에서 경계를 손으로 따라가 보게 합니다. 💬 “윤곽선이 점 목록이라면 무엇을 계산할 수 있을까요?” — 면적 · 둘레 · 중심 · 꼭짓점 수. Point[][] 라는 2중 배열 형태를 강조합니다. (5분)</p>' },
          { layout: 'code', title: 'FindContours 기본형', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);

        Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                         RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"윤곽 {cs.Length}개, 점 {cs[0].Length}개");
        Console.WriteLine($"면적 {Cv2.ContourArea(cs[0]):F0} 둘레 {Cv2.ArcLength(cs[0], true):F1}");

        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        Cv2.DrawContours(view, cs, -1, Scalar.Lime, 2);
        Cv2.ImShow("contour", view);
        Cv2.WaitKey(0);
    }
}`, points: ['입력은 <b>1채널 이진</b> 이미지', '<code>out Point[][]</code> 윤곽 + <code>out HierarchyIndex[]</code> 계층', '<code>DrawContours(..., -1, ...)</code> = 전부 그리기', '<code>ArcLength(c, true)</code> 의 true = 닫힌 곡선'], notes: '<p>실행해 초록 윤곽을 확인합니다. 💬 “면적 90318 이 맞는 값일까?” — 반지름 170 원의 면적 π·170²≈90792 와 비교하게 하면 검산 습관이 생깁니다. (6분)</p>' },
          { layout: 'diagram', title: '계층: 누가 누구 안에 있나', html: FIG_HIER, caption: 'CComp 에서 Parent ≥ 0 인 윤곽이 구멍', notes: '<p>네 모드를 한 줄씩 읽고, 실무에서는 <b>External(개수)</b> 과 <b>CComp(구멍)</b> 두 개만 거의 쓴다고 정리합니다. 💬 “구멍이 7개가 아니라 6개면?” — 가공 누락 불량. (5분)</p>' },
          { layout: 'code', title: '구멍 개수 세기', code: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"전체 {cs.Length}개, 구멍 {hi.Count(h => h.Parent >= 0)}개");
        for (int k = 0; k < cs.Length; k++)
            Console.WriteLine($"[{k}] 면적 {Cv2.ContourArea(cs[k]),6:F0} Parent {hi[k].Parent}");
    }
}`, points: ['<code>Parent == -1</code> → 가장 바깥', '<code>Parent >= 0</code> → <b>구멍</b>', '구멍 7개 = 보어 1(7286) + 볼트 6(≈750)'], notes: '<p>출력의 Parent 열을 손으로 짚으며 읽습니다. 면적으로 보어와 볼트 구멍을 구분할 수 있다는 점(7286 vs 750)이 다음 실습의 힌트입니다. (6분)</p>' },
          { layout: 'image', title: '문제: 닿아 있는 부품', src: 'images/washers.png', caption: '와셔 6 + 너트 4 + 볼트 3 = 13개인데 윤곽은 11개만 나온다', notes: '<p>💬 “부품이 13개인데 프로그램은 11개라고 합니다. 왜?” — 두 쌍이 닿아 있어 하나로 이어짐(왼쪽 위 와셔 2개, 오른쪽 아래 볼트+너트). 3교시에서 해결한다고 예고합니다. (4분)</p>' },
          { layout: 'code', title: '면적으로 정렬 (LINQ)', code: `using System;
using System.Collections.Generic;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"바깥 {hi.Count(h => h.Parent < 0)}개, 구멍 {hi.Count(h => h.Parent >= 0)}개");

        var outer = new List<(int k, double area)>();
        for (int k = 0; k < cs.Length; k++)
            if (hi[k].Parent < 0) outer.Add((k, Cv2.ContourArea(cs[k])));
        foreach (var o in outer.OrderByDescending(x => x.area).Take(3))
            Console.WriteLine($"[{o.k}] 면적 {o.area:F0}");
    }
}`, points: ['백라이트 영상 → <b>BinaryInv</b>', '바깥 11개 · 구멍 10개(와셔 6 + 너트 4)', '튜플 리스트 + <code>OrderByDescending</code>'], notes: '<p>BinaryInv 를 Binary 로 바꿔 실행해 보게 합니다 — 배경이 하나의 거대한 윤곽으로 잡히는 실패를 직접 보면 잊지 않습니다. (7분)</p>' },
          { layout: 'two', title: '자주 하는 실수', left: { title: '입력', bullets: ['컬러를 그대로 넣음 → 예외', '물체가 검은데 <code>Binary</code> 사용 → 배경이 윤곽', '<code>Canny</code> 결과를 넣으면 경계가 <b>이중</b>으로 잡힘'] }, right: { title: '해석', bullets: ['<code>ContourArea</code> ≠ 픽셀 개수 (다각형 면적)', '구멍은 면적에서 <b>빠지지 않는다</b>', '<code>List</code> 모드는 계층이 비어 있다(Parent 전부 −1)'] }, notes: '<p>세 번째 항목(Canny 결과의 이중 윤곽)은 10차시와 연결됩니다. 윤곽선은 <b>이진 영역</b>에서, 에지는 <b>경계선 그림</b>이라는 차이를 정리합니다. (4분)</p>' },
          { layout: 'practice', title: '실습: 볼트 구멍 6개만', desc: '<p><code>images/flange.png</code> 에서 <b>볼트 구멍 6개</b>의 중심 좌표를 출력하세요.</p><ul><li><code>CComp</code> → <code>Parent >= 0</code> (구멍)</li><li>면적 &lt; 2000 (중앙 보어 7286 제외)</li><li>중심 = <code>M10/M00</code>, <code>M01/M00</code></li></ul>', starter: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        // TODO: 구멍이면서 면적 2000 미만인 윤곽의 중심을 출력
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        int n = 0;
        for (int k = 0; k < cs.Length; k++)
        {
            if (hi[k].Parent < 0 || Cv2.ContourArea(cs[k]) >= 2000) continue;
            var m = Cv2.Moments(cs[k]);
            n++;
            Console.WriteLine($"구멍 {n}: ({m.M10 / m.M00:F1}, {m.M01 / m.M00:F1})");
        }
        Cv2.WaitKey(0);
    }
}`, notes: '<p>정답은 구멍 6개, 피치원 반지름 118 px 위의 15°·75°·135°·195°·255°·315° 위치입니다. 면적 조건을 빼면 7개가 나오는 것을 먼저 보여 주세요. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['윤곽선 = 이진 이미지 흰 영역의 <b>경계 점 목록</b> (<code>Point[][]</code>)', '입력은 <b>1채널 이진</b>, 물체는 <b>흰색</b> (어두우면 <code>BinaryInv</code>)', '<code>External</code>(개수) · <code>CComp</code>(구멍, <code>Parent >= 0</code>) 두 모드를 주로 쓴다', '<code>ApproxSimple</code> 로 점을 줄여도 면적 · 둘레는 그대로', '<code>ContourArea</code> · <code>ArcLength</code> · <code>BoundingRect</code> + LINQ 정렬', '다음 교시: 중심 · 회전 사각형 · 꼭짓점 수 · 원형도로 <b>도형 분류</b>'], notes: '<p>핵심 한 줄: “이진화 → 윤곽선 → 숫자”. 다음 교시에는 그 숫자로 부품 종류를 구분한다고 예고합니다. (2분)</p>' }
        ]
      },
      // ============================================================ 교시 2
      {
        id: 'cs12-2', title: '도형 특성으로 부품 분류하기', minutes: 50,
        goals: ['Moments 로 면적과 중심을 구할 수 있다', 'BoundingRect · MinAreaRect · MinEnclosingCircle · FitEllipse 를 구분해 쓸 수 있다', 'ApproxPolyDP 꼭짓점 수 · 원형도 · 볼록성으로 부품을 분류할 수 있다'],
        flow: [['도입: 무엇으로 구분하나', 5], ['중심 · 외접 도형', 15], ['꼭짓점 · 원형도 · 분류', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '같은 개수, 다른 종류' },
          { type: 'p', html: '1교시에서 윤곽선을 찾고 면적 · 둘레를 얻었습니다. 그런데 현장에서 필요한 것은 보통 <b>"이게 볼트냐 너트냐 와셔냐"</b>, <b>"중심이 정확히 어디냐"</b>, <b>"몇 도 기울어졌냐"</b> 입니다. 윤곽선 하나에서 뽑을 수 있는 <b>도형 특성(shape feature)</b> 을 정리해 봅시다.' },
          { type: 'figure', html: FIG_FIT, caption: '그림 3. 같은 윤곽선에 네 가지 도형을 맞춘 모습 — 목적에 따라 골라 쓴다' },
          { type: 'table', head: ['함수', '돌려주는 것', '쓰는 곳'], rows: [
            ['<code>Cv2.Moments(c)</code>', '<code>Moments</code> (M00, M10, M01 …)', '면적(M00) · <b>중심</b>(M10/M00, M01/M00) · 방향'],
            ['<code>Cv2.BoundingRect(c)</code>', '<code>Rect</code> (축에 평행)', 'ROI 자르기 · 화면 표시 — 가장 빠름'],
            ['<code>Cv2.MinAreaRect(c)</code>', '<code>RotatedRect</code> (Center · Size · Angle)', '<b>기울어진 물체</b>의 크기 · 각도 (칩 · 판)'],
            ['<code>Cv2.MinEnclosingCircle(c, out c, out r)</code>', '중심 · 반지름', '<b>원형 부품</b>의 지름 측정 · 최대 외경'],
            ['<code>Cv2.FitEllipse(c)</code>', '<code>RotatedRect</code> (타원)', '타원 맞춤 — 점이 <b>5개 이상</b> 필요'],
            ['<code>Cv2.ApproxPolyDP(c, eps, true)</code>', '단순화된 <code>Point[]</code>', '<b>꼭짓점 수</b> → 도형 분류'],
            ['<code>Cv2.ConvexHull(c)</code>', '볼록 껍질 <code>Point[]</code>', '볼록성(solidity) · 오목한 결함 찾기'],
            ['<code>Cv2.PointPolygonTest(c, p, true)</code>', '거리(안 +, 밖 −)', '점이 영역 안에 있나 · 경계까지 거리']
          ], caption: '표 2. 윤곽선 하나에서 뽑는 도형 특성' },
          { type: 'code', title: '예제 1: 모멘트 중심과 네 가지 외접 도형 (기울어진 칩)', code: EX_SHAPE1,
            desc: '<code>M00</code> 이 면적, <code>M10/M00</code> · <code>M01/M00</code> 이 <b>무게 중심</b>입니다(정답 (330.4, 245.2) 와 0.2 px 이내). <code>BoundingRect</code> 는 축에 평행해서 면적이 33066 로 크게 잡히지만, <code>MinAreaRect</code> 는 18795 로 실제 몸체(170×110 = 18700)에 딱 맞고 <b>각도 −23.50°</b> 까지 알려 줍니다 — 11차시의 회전 보정에 바로 쓸 수 있는 값입니다. <code>Points()</code> 는 회전 사각형의 네 꼭짓점입니다.',
            expect: 'M00 18456\n모멘트 중심 (330.57, 245.25)\nBoundingRect (x:232 y:162 width:198 height:167) 면적 33066\nMinAreaRect 중심 (330.6,245.3) 크기 170.3x110.4 각도 -23.50 면적 18795\n  꼭짓점 0: (274.5, 329.9)\n  꼭짓점 1: (230.5, 228.7)\n  꼭짓점 2: (386.7, 160.8)\n  꼭짓점 3: (430.7, 262.0)' },
          { type: 'code', title: '예제 2: 원형 부품 정밀 측정 (와셔 1개)', code: EX_SHAPE2,
            desc: '<code>images/washer_ring.png</code> 의 정답은 중심 (321.37, 238.82), 외경 반지름 150.6 px 입니다. <code>MinEnclosingCircle</code> 은 150.67(오차 0.07 px), <code>FitEllipse</code> 의 두 축 300.34 · 300.36 → 반지름 150.2 로 둘 다 매우 정확합니다. <code>MinAreaRect</code> 는 300×300 이므로 반지름 150 이고, 등가 반지름 √(면적/π) = 150.2 도 비슷합니다. <b>가장 바깥 점 기준</b>이 필요하면 MinEnclosingCircle, <b>평균적인 윤곽</b>이 필요하면 FitEllipse 를 씁니다.',
            expect: '면적 70846 중심 (321.25, 238.74)\nMinAreaRect 300.0x300.0 각도 -90.0\nMinEnclosingCircle 중심 (321.28, 238.70) 반지름 150.67\nFitEllipse 중심 (321.28, 238.72) 축 300.34x300.36\n등가 반지름 150.17 (정답 150.60)' },
          { type: 'h', text: '꼭짓점 몇 개? — ApproxPolyDP' },
          { type: 'figure', html: FIG_CIRC, caption: '그림 4. ApproxPolyDP 의 epsilon 과 원형도(circularity) 4πA/P² — 원은 1, 각진 도형은 작아진다' },
          { type: 'p', html: '<code>Cv2.ApproxPolyDP(contour, epsilon, closed)</code> 는 윤곽선을 <b>꼭짓점이 적은 다각형</b>으로 단순화합니다. <code>epsilon</code> 은 "원래 곡선에서 이만큼 벗어나도 된다" 는 허용 오차(px)인데, 물체 크기에 따라 달라야 하므로 보통 <b>둘레의 2~4%</b> 로 잡습니다: <code>double eps = 0.03 * Cv2.ArcLength(c, true);</code>' },
          { type: 'code', title: '예제 3: 꼭짓점 수로 도형 분류하기', code: EX_SHAPE3,
            desc: '직접 그린 도형 4개(원 · 삼각형 · 사각형 · 육각형)에 <code>epsilon = 둘레 × 0.03</code> 을 적용하면 꼭짓점이 8 · 3 · 4 · 6 개로 나옵니다. <b>3 = 삼각형, 4 = 사각형, 5 = 오각형, 6 = 육각형, 7 이상 = 원</b> 이 기본 규칙입니다. 원형도 <b>4πA/P²</b> 도 함께 보면 확실합니다 — 원 0.891, 육각형 0.826, 사각형 0.785, 삼각형 0.554 (이상적인 값은 1 · 0.907 · 0.785 · 0.605).',
            expect: '도형 4개\n  꼭짓점 8개 면적  9322 원형도 0.891 → 원\n  꼭짓점 3개 면적  7700 원형도 0.554 → 삼각형\n  꼭짓점 4개 면적 11881 원형도 0.785 → 사각형\n  꼭짓점 6개 면적  7708 원형도 0.826 → 육각형' },
          { type: 'callout', kind: 'warn', title: 'epsilon 을 고정 숫자로 쓰지 말 것', html: '<code>ApproxPolyDP(c, 5, true)</code> 처럼 고정값을 쓰면 <b>큰 물체는 덜 단순화</b>되고(원이 20각형) <b>작은 물체는 뭉개집니다</b>(육각형이 삼각형). 반드시 <b>둘레 비율</b>로 주세요. 값이 너무 크면(>0.05) 사각형이 삼각형으로, 너무 작으면(&lt;0.01) 육각형이 12각형으로 나옵니다 — 예제에서 0.02 · 0.03 · 0.05 로 바꿔 확인해 보세요.' },
          { type: 'code', title: '예제 4: 볼트 · 너트 · 와셔 자동 분류', code: EX_SHAPE4,
            desc: '<code>images/washers.png</code> 의 11개 덩어리를 <b>원형도 하나로</b> 분류합니다. 와셔(원) 0.878~0.900, 육각 너트 0.820~0.832, 볼트(길쭉) 0.214~0.239 로 뚜렷하게 갈립니다. 결과는 와셔 4 · 너트 3 · 볼트 3 이고, 원형도 0.513 인 덩어리 하나는 <b>"붙음?"</b> 으로 걸러졌습니다 — 실제로 와셔 2개가 닿아 있는 것입니다. 이렇게 <b>애매한 값을 버리지 않고 표시</b>하는 것이 현장 코드의 기본입니다.',
            expect: '  면적   7203 원형도 0.214 구멍 O → 볼트\n  면적   3950 원형도 0.900 구멍 O → 와셔\n  면적   3646 원형도 0.825 구멍 O → 너트\n  면적   3542 원형도 0.234 구멍 X → 볼트\n  면적   3619 원형도 0.832 구멍 O → 너트\n  면적   3584 원형도 0.239 구멍 X → 볼트\n  면적   4004 원형도 0.882 구멍 O → 와셔\n  면적   3667 원형도 0.820 구멍 O → 너트\n  면적   5462 원형도 0.892 구멍 O → 와셔\n  면적   3965 원형도 0.878 구멍 O → 와셔\n  면적  10861 원형도 0.513 구멍 O → 붙음?\n와셔 4 너트 3 볼트 3 붙음 1 (정답: 와셔 6 너트 4 볼트 3)' },
          { type: 'code', title: '예제 5: 볼록성(solidity) 과 점 포함 검사', code: EX_SHAPE5,
            desc: '<b>볼록 껍질(ConvexHull)</b> 은 윤곽을 고무줄로 감싼 모양입니다. <b>볼록성 = 윤곽 면적 / 껍질 면적</b> 은 오목한 정도를 나타냅니다. 낮은 순서로 4개를 뽑아 보면 <b>볼트 3개(0.600 · 0.707 · 0.709)</b> 와 <b>붙어 있는 와셔 쌍(0.871)</b> 이 정확히 걸립니다 — 나머지 와셔 · 너트는 모두 0.98 이상입니다. 원형도와 볼록성은 서로 다른 정보이므로 <b>둘을 같이 쓰면 분류가 훨씬 안정적</b>입니다. 마지막의 <code>PointPolygonTest</code> 는 점이 영역 안이면 <b>+거리</b>, 밖이면 <b>−거리</b>를 돌려줍니다(세 번째 인수 false 면 +1/0/−1). (131,91) 은 붙어 있는 두 와셔의 이음목 안쪽이라 경계까지 9.1 px 밖에 안 됩니다.',
            expect: '  면적   7203 껍질  11998 볼록성 0.600 점 334→ 19\n  면적   3542 껍질   5009 볼록성 0.707 점 243→ 16\n  면적   3584 껍질   5055 볼록성 0.709 점 224→ 23\n  면적  10861 껍질  12468 볼록성 0.871 점 256→ 42\nPointPolygonTest: (131,91) → 9.1 / (0,0) → -1' },
          { type: 'callout', kind: 'tip', title: '특성 하나로 판단하지 말 것', html: '실무의 분류기는 <b>특성 2~3개를 조합</b>합니다. 예: ① 면적으로 크기 등급 → ② 원형도로 원/각 구분 → ③ 구멍 개수로 볼트 제외 → ④ 볼록성으로 결함(버 · 깨짐) 검출. 특성을 표로 뽑아 두면 그대로 <b>머신러닝 특징(feature)</b> 이 됩니다 — <code>data/parts_features.csv</code> 가 그 예입니다.' },
          { type: 'callout', kind: 'field', title: '현장 이야기: 중심을 무엇으로 정할까', html: '같은 부품이라도 ① <b>모멘트 중심</b>(무게 중심) ② <b>MinAreaRect 중심</b> ③ <b>MinEnclosingCircle 중심</b> 이 조금씩 다릅니다. 대칭 부품은 거의 같지만 <b>L 브래킷처럼 비대칭</b>이면 크게 차이 납니다. 로봇 픽킹에서는 "그리퍼가 잡을 점" 을 정의해야 하므로, 보통 <b>모멘트 중심</b>을 쓰고 방향(<code>MinAreaRect.Angle</code> 또는 모멘트 <code>Mu11</code>)으로 회전을 정합니다.' }
        ],
        practice: [
          {
            title: '원형 부품 크기별로 세기', level: 2,
            desc: '<code>images/coins_parts.png</code> 의 부품 12개를 <b>등가 반지름</b> √(면적/π) 으로 L(>30) · M(23~30) · S(≤23) 세 등급으로 나누어 개수를 출력하세요. 정답은 L 3개 · M 4개 · S 5개(지름 6.8 · 5.4 · 4.0 mm, 0.1 mm/px)입니다. 원형도도 함께 출력해 모두 원(0.88 이상)인지 확인하세요.',
            hint: '<code>double r = Math.Sqrt(a / Math.PI);</code> 로 등가 반지름을 구합니다. 원형도는 <code>4 * Math.PI * a / (p * p)</code>. 출력 순서를 고정하려면 <code>OrderByDescending(c => Cv2.ContourArea(c))</code>.',
            expect: '윤곽 12개\n  면적   3524 r 33.5 원형도 0.896 → L\n  면적   3520 r 33.5 원형도 0.890 → L\n  면적   3517 r 33.5 원형도 0.894 → L\n  면적   2213 r 26.5 원형도 0.901 → M\n  면적   2213 r 26.5 원형도 0.895 → M\n  면적   2197 r 26.4 원형도 0.895 → M\n  면적   2197 r 26.4 원형도 0.903 → M\n  면적   1201 r 19.5 원형도 0.898 → S\n  면적   1198 r 19.5 원형도 0.895 → S\n  면적   1196 r 19.5 원형도 0.894 → S\n  면적   1193 r 19.5 원형도 0.884 → S\n  면적   1188 r 19.4 원형도 0.908 → S\nL 3 M 4 S 5',
            starter: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"윤곽 {cs.Length}개");

        int L = 0, M = 0, S = 0;
        foreach (var c in cs.OrderByDescending(c => Cv2.ContourArea(c)))
        {
            double a = Cv2.ContourArea(c), p = Cv2.ArcLength(c, true);
            // TODO: 등가 반지름 r 과 원형도를 구해 L / M / S 로 분류하고 출력하세요
        }
        // TODO: 등급별 개수를 출력하세요

        Cv2.ImShow("bin", bin);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"윤곽 {cs.Length}개");

        int L = 0, M = 0, S = 0;
        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        foreach (var c in cs.OrderByDescending(c => Cv2.ContourArea(c)))
        {
            double a = Cv2.ContourArea(c), p = Cv2.ArcLength(c, true);
            double r = Math.Sqrt(a / Math.PI);
            double circ = 4 * Math.PI * a / (p * p);
            string kind = r > 30 ? "L" : r > 23 ? "M" : "S";
            if (kind == "L") L++; else if (kind == "M") M++; else S++;
            Console.WriteLine($"  면적 {a,6:F0} r {r:F1} 원형도 {circ:F3} → {kind}");
            Cv2.DrawContours(view, new[] { c }, 0, kind == "L" ? Scalar.Lime : kind == "M" ? Scalar.Yellow : Scalar.Red, 2);
        }
        Console.WriteLine($"L {L} M {M} S {S}");
        Cv2.ImShow("size", view);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '구멍 지름 측정과 공차 판정', level: 3,
            desc: '<code>images/plate_holes.png</code>(0.05 mm/px)의 구멍 <b>6개</b>의 지름을 <code>MinEnclosingCircle</code> 로 재고, H1~H4 는 <b>4.0 ± 0.1 mm</b>, H5 · H6 는 <b>6.0 ± 0.1 mm</b> 공차로 OK/NG 를 판정하세요. 정답: H4(오른쪽 아래)만 4.40 mm 로 <b>NG</b> 입니다.',
            hint: '판이 밝고 구멍이 어두우므로 <code>BinaryInv | Otsu</code> 입니다. 그러면 판 밖의 배경도 흰색이 되어 아주 큰 윤곽이 하나 생기므로 <b>반지름 100 px 이상은 버리세요</b>. 행 정렬은 <code>OrderBy(h => Math.Round(h.y / 140)).ThenBy(h => h.x)</code>. 공차는 지름이 5 mm 보다 작으면 4.0 기준, 크면 6.0 기준으로 나누면 됩니다.',
            expect: '구멍 6개\n  H1 중심 (160.3, 159.8) 지름 3.95 mm (기준 4.0) OK\n  H2 중심 (640.1, 160.4) 지름 3.95 mm (기준 4.0) OK\n  H3 중심 (320.2, 300.3) 지름 5.95 mm (기준 6.0) OK\n  H4 중심 (479.8, 299.9) 지름 5.95 mm (기준 6.0) OK\n  H5 중심 (159.7, 440.2) 지름 3.95 mm (기준 4.0) OK\n  H6 중심 (640.4, 439.6) 지름 4.35 mm (기준 4.0) NG',
            starter: `using System;
using System.Collections.Generic;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/plate_holes.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.List, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"윤곽 {cs.Length}개");

        var holes = new List<(double x, double y, double r)>();
        foreach (var c in cs)
        {
            if (c.Length < 5) continue;
            Cv2.MinEnclosingCircle(c, out Point2f cc, out float rad);
            // TODO: 반지름 20 ~ 100 px 인 것만 holes 에 넣으세요
        }
        // TODO: 행 순서로 정렬해 지름(mm)과 공차 판정을 출력하세요

        Cv2.ImShow("bin", bin);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using System.Collections.Generic;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/plate_holes.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.List, ContourApproximationModes.ApproxSimple);

        var holes = new List<(double x, double y, double r)>();
        foreach (var c in cs)
        {
            if (c.Length < 5) continue;
            Cv2.MinEnclosingCircle(c, out Point2f cc, out float rad);
            if (rad < 20 || rad > 100) continue;
            holes.Add((cc.X, cc.Y, rad));
        }
        Console.WriteLine($"구멍 {holes.Count}개");

        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        int no = 0;
        foreach (var h in holes.OrderBy(h => Math.Round(h.y / 140)).ThenBy(h => h.x))
        {
            no++;
            double d = 2 * h.r * 0.05;
            double nominal = d < 5 ? 4.0 : 6.0;
            bool ok = Math.Abs(d - nominal) <= 0.1;
            Console.WriteLine($"  H{no} 중심 ({h.x:F1}, {h.y:F1}) 지름 {d:F2} mm (기준 {nominal:F1}) {(ok ? "OK" : "NG")}");
            Cv2.Circle(view, new Point((int)h.x, (int)h.y), (int)h.r, ok ? Scalar.Lime : Scalar.Red, 2);
        }
        Cv2.ImShow("holes", view);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '윤곽선과 도형 분석 ②', subtitle: '도형 특성으로 부품 분류하기', notes: '<p>1교시 복습: 윤곽선 → 면적 · 둘레. 💬 “면적만으로 볼트와 와셔를 구분할 수 있을까요?” — 비슷한 면적이면 불가능. 그래서 모양을 나타내는 값이 필요하다는 흐름으로 시작합니다. (3분)</p>' },
          { layout: 'diagram', title: '같은 윤곽, 네 가지 외접 도형', html: FIG_FIT, caption: 'BoundingRect · MinAreaRect · MinEnclosingCircle · FitEllipse', notes: '<p>네 도형의 용도를 하나씩 짚습니다: ROI 자르기(BoundingRect), 기울어진 물체(MinAreaRect), 원 지름(MinEnclosingCircle), 평균 윤곽(FitEllipse). 💬 “기울어진 칩의 크기를 재려면?” — MinAreaRect. (5분)</p>' },
          { layout: 'code', title: '모멘트 중심과 MinAreaRect', code: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/chip_rotated.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Point[] body = cs.OrderByDescending(c => Cv2.ContourArea(c)).First();

        Moments m = Cv2.Moments(body);
        Console.WriteLine($"중심 ({m.M10 / m.M00:F2}, {m.M01 / m.M00:F2})");
        RotatedRect rr = Cv2.MinAreaRect(body);
        Console.WriteLine($"크기 {rr.Size.Width:F1}x{rr.Size.Height:F1} 각도 {rr.Angle:F2}");
        Console.WriteLine($"BoundingRect {Cv2.BoundingRect(body)}");
    }
}`, points: ['중심 = <code>M10/M00</code>, <code>M01/M00</code> (정답 330.4, 245.2)', '<code>MinAreaRect</code>: 170.3×110.4, <b>−23.50°</b>', 'BoundingRect 면적 33066 vs MinAreaRect 18795'], notes: '<p>두 사각형의 면적 차이(33066 vs 18795)를 강조합니다 — 기울어진 물체에 BoundingRect 를 쓰면 빈 공간까지 세는 셈입니다. 11차시 회전 보정의 각도를 여기서 얻는다는 연결도 짚어 줍니다. (6분)</p>' },
          { layout: 'two', title: '원형 부품 정밀 측정', left: { title: 'MinEnclosingCircle', bullets: ['가장 바깥 점을 모두 감싸는 최소 원', 'washer_ring: r = <b>150.67</b> (정답 150.6)', '최대 외경 · 버(burr) 검사에 적합', '튀어나온 점 1개에 민감'] }, right: { title: 'FitEllipse', bullets: ['모든 점에 최소제곱으로 타원 맞춤', '축 300.34 × 300.36 → r ≈ 150.2', '<b>점 5개 이상</b> 필요', '잡음에 강함 · 평균적인 크기'] }, notes: '<p>💬 “와셔에 버(돌기)가 하나 났다면 두 값 중 어느 것이 커질까?” — MinEnclosingCircle. 그래서 버 검사는 MinEnclosingCircle − FitEllipse 차이로 잡는다고 알려 줍니다. (5분)</p>' },
          { layout: 'diagram', title: 'ApproxPolyDP 와 원형도', html: FIG_CIRC, caption: 'epsilon = 둘레 × 0.02~0.04, 원형도 = 4πA/P²', notes: '<p>원형도 공식을 칠판에 씁니다. 완전한 원 = 1, 정육각형 0.907, 정사각형 0.785, 정삼각형 0.605. 💬 “길쭉한 볼트는?” — 0.2 근처. epsilon 을 둘레 비율로 주는 이유(크기 무관)를 강조합니다. (5분)</p>' },
          { layout: 'code', title: '꼭짓점 수로 도형 분류', code: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(320, 640, MatType.CV_8UC1, Scalar.Black);
        Cv2.Circle(canvas, new Point(80, 160), 55, Scalar.White, -1);
        Point[] tri = { new Point(200, 105), new Point(270, 215), new Point(130, 215) };
        Cv2.FillPoly(canvas, new[] { tri }, Scalar.White);
        Cv2.Rectangle(canvas, new Rect(300, 105, 110, 110), Scalar.White, -1);
        Point[][] cs = Cv2.FindContoursAsArray(canvas, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        foreach (var c in cs.OrderBy(c => Cv2.BoundingRect(c).X))
        {
            double p = Cv2.ArcLength(c, true), a = Cv2.ContourArea(c);
            Point[] ap = Cv2.ApproxPolyDP(c, 0.03 * p, true);
            Console.WriteLine($"꼭짓점 {ap.Length}개 원형도 {4 * Math.PI * a / (p * p):F3}");
        }
        Cv2.ImShow("shapes", canvas);
    }
}`, points: ['3 = 삼각형, 4 = 사각형, 6 = 육각형, 7+ = 원', 'epsilon 은 <b>둘레 비율</b>로', '원형도로 한 번 더 확인'], notes: '<p>실행 후 0.03 을 0.01 · 0.08 로 바꿔 꼭짓점 수가 어떻게 흔들리는지 보여 줍니다. 이 실험이 epsilon 감각을 만들어 줍니다. (6분)</p>' },
          { layout: 'code', title: '실전: 볼트 · 너트 · 와셔 분류', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi, RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        int w = 0, n = 0, b = 0;
        for (int k = 0; k < cs.Length; k++)
        {
            if (hi[k].Parent >= 0) continue;
            double a = Cv2.ContourArea(cs[k]);
            if (a < 500) continue;
            double circ = 4 * Math.PI * a / Math.Pow(Cv2.ArcLength(cs[k], true), 2);
            if (circ >= 0.85) w++; else if (circ >= 0.7) n++; else if (circ < 0.45) b++;
        }
        Console.WriteLine($"와셔 {w} 너트 {n} 볼트 {b}");
    }
}`, points: ['와셔 0.88~0.90 / 너트 0.82~0.83 / 볼트 0.21~0.24', '경계값 0.85 · 0.7 · 0.45', '원형도 0.513 = <b>붙어 있는 와셔 2개</b> → 다음 교시'], notes: '<p>출력은 와셔 4 · 너트 3 · 볼트 3 입니다(정답 6/4/3). 💬 “왜 부족할까?” — 닿아 있는 2쌍. 3교시에서 watershed 로 해결한다고 예고합니다. 애매한 값을 “붙음?”으로 표시하는 습관을 강조. (7분)</p>' },
          { layout: 'bullets', title: '볼록성(solidity) 이 한 번 더 걸러 준다', lead: '볼록 껍질 = 윤곽을 고무줄로 감싼 모양', bullets: [
            '볼록성 = 윤곽 면적 / 껍질 면적',
            '와셔 · 너트: <b>0.98 이상</b> (거의 볼록)',
            '볼트: <b>0.60 ~ 0.71</b> (머리와 몸통 사이가 오목)',
            '붙어 있는 와셔 2개: 0.871 (중간값 → 의심)',
            '깨짐 · 버 검사에도 같은 지표를 쓴다'
          ], notes: '<p>원형도와 볼록성은 서로 다른 정보이므로 함께 쓰면 오분류가 크게 줄어듭니다. <code>data/parts_features.csv</code> 의 solidity 열이 바로 이 값이라고 알려 주면 뒤의 ML 차시와 연결됩니다. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '기울어진 칩의 <b>크기와 각도</b>를 한 번에 얻는 함수는?', options: ['<code>Cv2.BoundingRect</code>', '<code>Cv2.MinAreaRect</code>', '<code>Cv2.MinEnclosingCircle</code>', '<code>Cv2.Moments</code>'], answer: 1, explain: '<code>MinAreaRect</code> 는 <code>RotatedRect</code>(Center · Size · Angle)를 돌려주므로 크기와 각도를 함께 얻습니다. <code>BoundingRect</code> 는 축에 평행해서 기울어지면 커집니다.', notes: '<p>정답 2번. 11차시 회전 보정과 연결해 한 번 더 확인합니다.</p>' },
          { layout: 'practice', title: '실습: 크기별로 세기', desc: '<p><code>images/coins_parts.png</code> 부품 12개를 등가 반지름으로 L · M · S 로 분류하세요.</p><ul><li>등가 반지름 = √(면적/π)</li><li>기준: L &gt; 30, M 23~30, S ≤ 23</li><li>정답 L 3 · M 4 · S 5</li></ul>', starter: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"윤곽 {cs.Length}개");
        // TODO: 등가 반지름으로 L / M / S 분류
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        int L = 0, M = 0, S = 0;
        foreach (var c in cs)
        {
            double r = Math.Sqrt(Cv2.ContourArea(c) / Math.PI);
            if (r > 30) L++; else if (r > 23) M++; else S++;
        }
        Console.WriteLine($"L {L} M {M} S {S}");
        Cv2.WaitKey(0);
    }
}`, notes: '<p>정답 L 3 · M 4 · S 5 (지름 6.8 · 5.4 · 4.0 mm). 경계를 25 로 바꾸면 어떻게 되는지 물어 크기 등급 경계 설정 감각을 길러 줍니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<code>Moments</code>: 면적 M00, 중심 <b>M10/M00 · M01/M00</b>', '외접 도형 4종 — ROI는 <code>BoundingRect</code>, 기울기는 <code>MinAreaRect</code>, 원은 <code>MinEnclosingCircle</code> · <code>FitEllipse</code>', '<code>ApproxPolyDP(c, 둘레×0.02~0.04, true)</code> → <b>꼭짓점 수</b>로 도형 분류', '원형도 <b>4πA/P²</b>: 원 1 · 육각형 0.91 · 사각형 0.79 · 삼각형 0.61', '볼록성 = 면적/껍질면적 — 볼트 0.6~0.7, 와셔 0.98', '특성은 <b>2~3개 조합</b>해서 판단, 애매하면 "의심"으로 표시', '다음 교시: 닿아 있는 물체를 분리해 13개를 정확히 세기'], notes: '<p>표 2 를 다시 보며 각 함수의 용도를 한 번 더 확인합니다. 다음 교시에 “11개 → 13개” 문제를 끝낸다고 예고하며 마칩니다. (2분)</p>' }
        ]
      },
      // ============================================================ 교시 3
      {
        id: 'cs12-3', title: '연결 요소 라벨링과 닿아 있는 물체 분리', minutes: 50,
        goals: ['ConnectedComponentsWithStats · ConnectedComponentsEx 로 라벨링하고 면적 필터를 걸 수 있다', '라벨마다 번호를 그려 결과를 확인할 수 있다', 'DistanceTransform + Watershed 로 닿아 있는 물체를 분리하고 개수 세기 파이프라인을 함수로 정리할 수 있다'],
        flow: [['도입: 라벨링이란', 5], ['ConnectedComponents 와 면적 필터', 15], ['거리 변환 + Watershed', 20], ['파이프라인 정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '윤곽선 대신 라벨: 픽셀마다 번호를 붙인다' },
          { type: 'p', html: '윤곽선은 <b>경계</b>를 주지만, "이 픽셀이 몇 번 물체에 속하는가" 는 알려 주지 않습니다. <b>연결 요소 라벨링(Connected Components Labeling)</b> 은 붙어 있는 흰 픽셀에 <b>같은 번호</b>를 붙여 라벨 Mat 을 만듭니다. 면적 · 외접 사각형 · 중심을 한 번에 받을 수 있고, 마스크를 만들어 물체별로 잘라내기도 쉽습니다.' },
          { type: 'figure', html: FIG_LABEL, caption: '그림 5. 라벨링 — 배경은 0, 물체는 1부터. stats 와 centroids 가 함께 나온다' },
          { type: 'table', head: ['', '윤곽선 (FindContours)', '라벨링 (ConnectedComponents)'], rows: [
            ['결과', '경계 점 배열 <code>Point[][]</code>', '픽셀마다 라벨 번호가 든 Mat'],
            ['면적', '다각형 면적 (구멍 포함)', '<b>실제 픽셀 개수</b> (구멍 제외)'],
            ['구멍', '계층(<code>Parent</code>)으로 알 수 있다', '구멍은 배경이라 그냥 빠진다'],
            ['모양 분석', '꼭짓점 · 둘레 · 원형도 등 <b>풍부</b>', '외접 사각형 · 면적 · 중심만'],
            ['물체별 마스크', '<code>DrawContours</code> 로 직접 만들어야', '<code>labels == k</code> 로 바로'],
            ['쓰는 곳', '모양 분류 · 치수 측정', '<b>개수 세기 · 면적 필터 · 잡음 제거</b>']
          ], caption: '표 3. 둘은 경쟁이 아니라 역할 분담 — 보통 라벨링으로 걸러 내고 윤곽선으로 분석한다' },
          { type: 'code', title: '예제 1: ConnectedComponentsWithStats — 면적 · 사각형 · 중심을 한 번에', code: EX_CC1,
            desc: '반환값 <b>12 는 배경을 포함</b>한 라벨 수이므로 물체는 11개입니다. <code>stats</code> 는 12행 5열 <b>CV_32SC1</b>, <code>centroids</code> 는 12행 2열 <b>CV_64FC1</b> 입니다. 열 번호를 숫자로 쓰지 말고 <code>ConnectedComponentsTypes.Area</code> 처럼 열거형을 쓰면 읽기 쉽습니다. 라벨 0(배경)의 면적이 260722 로 가장 큰 점, 라벨 1 이 폭 168 · 높이 88 로 <b>붙어 있는 와셔 2개</b>인 점을 확인하세요.',
            expect: '라벨 12개 (배경 포함) → 물체 11개\nstats 12x5 CV_32SC1 / centroids 12x2 CV_64FC1\n  [0] L0 T0 W640 H480 면적 260722 중심 (318.1,243.4)\n  [1] L48 T48 W168 H88 면적 9069 중심 (131.5,91.5)\n  [2] L264 T49 W73 H73 면적 3372 중심 (300.0,84.9)\n  [3] L518 T58 W85 H85 면적 4585 중심 (560.0,100.0)' },
          { type: 'callout', kind: 'tip', title: '면적이 윤곽선과 다른 이유', html: '라벨 2(와셔)의 면적은 <b>3372</b> 인데 1교시에서 같은 와셔의 윤곽 면적은 <b>3965</b> 였습니다. 라벨 면적은 <b>실제 흰 픽셀 수</b>라 가운데 구멍이 빠지고, <code>ContourArea</code> 는 <b>바깥 다각형 면적</b>이라 구멍이 포함되기 때문입니다. 링 면적을 원하면 라벨링 쪽이 편합니다.' },
          { type: 'code', title: '예제 2: ConnectedComponentsEx — Blob 객체로 편하게', code: EX_CC2,
            desc: 'OpenCvSharp 전용 편의 함수입니다. <code>cc.Blobs</code> 는 <code>List&lt;Blob&gt;</code> 이고 각 <code>Blob</code> 이 <code>Label · Area · Rect · Centroid · Width · Height</code> 를 들고 있어 <b>LINQ 로 바로 필터 · 정렬</b>할 수 있습니다. <code>GetLargestBlob()</code> 은 배경을 빼고 가장 큰 블롭을, <code>RenderBlobs(dst)</code> 는 라벨마다 다른 색으로 칠한 컬러 Mat 을 만들어 줍니다 — 결과 창에서 눈으로 확인하기에 아주 좋습니다.',
            expect: 'LabelCount 12 → 물체 11개\n가장 큰 블롭: 라벨 1 면적 9069 (x:48 y:48 width:168 height:88) 중심 (131.5,91.5)\n  라벨 1: 면적 9069 폭 168 높이 88\n  라벨 11: 면적 6602 폭 223 높이 66\n  라벨 3: 면적 4585 폭 85 높이 85\nRenderBlobs 640x480 CV_8UC3' },
          { type: 'code', title: '예제 3: 면적 필터 + 라벨마다 번호 그리기', code: EX_CC3,
            desc: '현장 코드의 기본형입니다. ① <b>면적 필터</b>로 먼지 · 잡음을 버리고 ② 화면 순서(위 → 아래, 왼쪽 → 오른쪽)로 <b>번호를 다시 붙여</b> 사람이 읽을 수 있게 만듭니다. 라벨 번호는 OpenCV 가 만든 내부 순서라 화면 배치와 무관하므로, 오퍼레이터에게 보여 줄 번호는 이렇게 다시 매겨야 합니다. <code>Cv2.GetTextSize</code> 로 글자 크기를 미리 알면 상자 안에 글자를 정확히 배치할 수 있습니다.',
            expect: '번호를 붙인 물체 11개\n면적 1000 미만으로 걸러낸 블롭 0개\n글자 \'12\' 크기 22x14 (baseLine 4) → 글자가 겹치지 않게 위치를 잡는 데 쓴다' },
          { type: 'h', text: '닿아 있는 물체를 떼어 내기: 거리 변환 + Watershed' },
          { type: 'p', html: '이제 이 차시의 마지막 문제입니다. <code>washers.png</code> 는 부품이 <b>13개</b> 인데 라벨링은 계속 <b>11개</b> 라고 합니다. 이진화만으로는 <b>닿아 있는 물체 사이에 경계선이 없기</b> 때문입니다. 답은 <b>거리 변환(Distance Transform)</b> 으로 물체마다 "씨앗" 을 만들고, <b>Watershed</b>(분수령) 알고리즘으로 씨앗을 키워 경계를 긋는 것입니다.' },
          { type: 'figure', html: FIG_WS, caption: '그림 6. 이진화 → 거리 변환 → 봉우리(씨앗) → 마커 → Watershed. 경계는 −1 로 표시된다' },
          { type: 'code', title: '예제 4: DistanceTransform + Watershed 로 13개 만들기', code: EX_WS,
            desc: '<b>순서가 중요합니다.</b> ① 와셔는 링 모양이라 그대로 거리 변환하면 봉우리가 고리처럼 생겨 하나가 여러 개로 쪼개집니다 → <code>External</code> 윤곽을 <b>채워서(두께 −1)</b> 구멍을 메웁니다. ② 거리 변환 최대값은 41.7 px(가장 큰 와셔 반지름 42)입니다. ③ 임계값을 0.20 · 0.30 · 0.40 · 0.50 으로 바꿔 보면 씨앗이 <b>15 · 13 · 13 · 10</b> 개로 달라집니다 — <b>실험 없이 숫자를 고르면 안 됩니다</b>. 0.35 로 씨앗 13개를 얻고 ④ 마커(CV_32SC1)를 만들어 ⑤ Watershed 를 돌리면 라벨이 14(= 배경 1 + 물체 13)까지 나옵니다. 결과 창의 빨간 선이 새로 생긴 경계입니다.',
            expect: '그냥 세면 11개 (실제 13개)\n거리 최대 41.7 px\n  임계값 0.20 → 씨앗 15개\n  임계값 0.30 → 씨앗 13개\n  임계값 0.40 → 씨앗 13개\n  임계값 0.50 → 씨앗 10개\n씨앗 13개\nwatershed 후 라벨 -1 ~ 14 → 물체 13개\n경계(-1) 픽셀 5471개' },
          { type: 'callout', kind: 'warn', title: '임계값에 따라 개수가 바뀐다 — 반드시 확인할 것', html: '예제 4 에서 보듯 봉우리 임계값이 <b>0.20 이면 15개(과분할)</b>, <b>0.50 이면 10개(씨앗 소실)</b> 입니다. 크기가 크게 다른 물체가 섞여 있으면 하나의 비율로는 해결되지 않으므로 ① 물체별로 <b>절대 거리</b>(예: 8 px)를 쓰거나 ② 크기 그룹을 나눠 두 번 돌리거나 ③ 봉우리 검출을 <code>Dilate</code> 기반 지역 최대값으로 바꿉니다. <b>어떤 경우든 --print 로 실제 개수를 확인하고 숫자를 정하세요.</b>' },
          { type: 'callout', kind: 'tip', title: 'Watershed 를 쓰기 전에 생각해 볼 것', html: 'Watershed 는 느리고 매개변수에 민감합니다. 실무에서는 먼저 ① <b>모폴로지 열기</b>(Erode → Dilate)로 얇은 이음목을 끊어 보고 ② 그래도 안 되면 <code>Cv2.Erode</code> 를 몇 번 반복해 씨앗을 만들고 ③ 정말 필요할 때만 거리 변환 + Watershed 를 씁니다. 가장 좋은 해결책은 <b>조명과 설비</b>입니다 — 부품이 겹치지 않게 진동 피더로 떼어 놓는 것이 소프트웨어보다 확실합니다.' },
          { type: 'h', text: '개수 세기 파이프라인을 함수로' },
          { type: 'code', title: '예제 5: 재사용 가능한 CountParts 함수', code: EX_PIPE,
            desc: '같은 흐름(읽기 → 이진화 → 라벨링 → 면적 필터)을 <b>static 메서드 하나</b>로 묶었습니다. <code>darkObject</code> 로 백라이트/정면 조명을 고르고, <code>minArea</code> 로 잡음 기준을 바꿉니다. 이렇게 함수로 만들어 두면 ① 다른 이미지에 바로 쓸 수 있고 ② 15차시의 <b>카메라 반복문</b> 안에 그대로 넣을 수 있고 ③ 16 · 17차시의 WPF 앱에서는 버튼 하나에 연결하면 끝입니다. 빈 Mat 검사(<code>img.Empty()</code>)처럼 <b>실패를 다루는 코드</b>를 함수 안에 넣는 습관도 중요합니다.',
            expect: 'washers.png     → 11개 (실제 13 — 닿은 쌍 2개 때문에 부족)\ncoins_parts.png → 12개 (실제 12)\nflange.png      → 1개 (실제 1)' },
          { type: 'wpf', title: '개수 세기 결과를 WPF 화면에', project: 'Ch17_Inspection', html: '<code>Slider</code> 로 최소 면적을 조절하고 버튼을 누르면 라벨링 → 면적 필터 → 번호 표시까지 한 그림으로 보여 줍니다. 계산 부분은 예제 3 · 5 와 완전히 같고, 달라지는 것은 <b>값을 어디서 받고(Slider) 결과를 어디에 그리는지(Image)</b> 뿐입니다. 17차시에서 이 화면을 완성합니다.' },
          { type: 'code', title: '추가: WPF — 개수 세기 버튼 (Visual Studio 에서 실행)', code: WPF_CODE, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '<code>view.ToBitmapSource()</code> 는 <code>OpenCvSharp4.WpfExtensions</code> 패키지의 확장 메서드입니다(02차시). WPF 프로젝트에서는 <code>System.Windows.Point</code> 와 이름이 겹치므로 <code>new OpenCvSharp.Point(...)</code> 처럼 <b>전체 이름</b>을 쓰는 것이 안전합니다.' },
          { type: 'callout', kind: 'field', title: '현장 이야기: 개수 세기 검사기 체크리스트', html: '<ul><li><b>조명 고정</b>: 백라이트가 가장 쉽다(실루엣 → Otsu 한 번으로 끝).</li><li><b>면적 하한 · 상한</b> 둘 다 둔다: 하한은 먼지, 상한은 "둘이 붙은 것" 을 잡아낸다.</li><li><b>경계에 걸친 물체</b>: 화면 밖으로 반쯤 나간 것은 세지 않도록 <code>Rect</code> 가 이미지 가장자리에 닿는지 확인한다.</li><li><b>결과를 항상 그림으로 남긴다</b>: 번호 · 사각형을 그려 저장하면 오작동 분석이 쉽다(<code>Cv2.ImWrite</code>).</li><li><b>기대 개수를 알면 검증</b>: "트레이 1판 = 24개" 처럼 정답을 알면 개수 불일치 자체가 불량 신호다.</li></ul>' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도 · 평가', html: '<ul><li><b>오개념 1</b>: “라벨 수 = 물체 수” → 배경(0)을 빼야 합니다. 실습에서 12 vs 11 로 반드시 한 번 틀립니다.</li><li><b>오개념 2</b>: “ContourArea = 픽셀 수” → 다각형 면적입니다(구멍 포함). 예제 1 의 3372 vs 3965 로 설명하세요.</li><li><b>오개념 3</b>: “Watershed 면 무조건 분리된다” → 씨앗 임계값이 전부입니다. 0.20 / 0.50 을 직접 넣어 15개 · 10개가 나오는 것을 보여 주세요.</li><li><b>준비물</b>: 3교시는 실행 시간이 조금 깁니다(거리 변환 · watershed). 미리 한 번 돌려 캐시를 채워 두세요.</li><li><b>평가 루브릭(10점)</b>: ① 라벨링으로 개수 세고 배경을 제외했다(2) ② 면적 필터를 근거와 함께 정했다(2) ③ 도형 특성 2개 이상으로 분류했다(3) ④ 닿은 물체를 분리해 13개를 얻었다(3).</li><li>💬 마무리 발문: “개수가 하루에 한 번 틀립니다. 어디를 먼저 볼까요?” — 조명 변화 → 임계값 → 면적 기준 → 물체 겹침.</li></ul>' }
        ],
        practice: [
          {
            title: '임계값을 바꿔 씨앗 개수 찾기', level: 2,
            desc: '구멍을 메운 와셔 영상에 거리 변환을 적용하고, 정규화한 값의 임계값을 <b>0.20부터 0.50까지 0.05 간격</b>으로 바꿔 가며 씨앗(연결 요소) 개수를 출력하세요. 13개가 나오는 구간을 찾아 보고, 왜 임계값이 너무 낮거나 높으면 안 되는지 결과로 설명하세요.',
            hint: '<code>for (double th = 0.20; th &lt;= 0.501; th += 0.05)</code> 로 돌립니다. 실수 반복이므로 <code>&lt;= 0.501</code> 처럼 여유를 주세요. 임계값 적용 후 <code>ConvertTo(pk8, MatType.CV_8UC1, 255)</code> 로 8비트로 바꿔야 <code>ConnectedComponents</code> 에 넣을 수 있습니다.',
            expect: '거리 최대 41.7\n  0.20 → 씨앗 15개\n  0.25 → 씨앗 14개\n  0.30 → 씨앗 13개\n  0.35 → 씨앗 13개\n  0.40 → 씨앗 13개\n  0.45 → 씨앗 10개\n  0.50 → 씨앗 10개',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);

        // 구멍 메우기
        Point[][] outer = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        using var solid = new Mat(bin.Size(), MatType.CV_8UC1, Scalar.Black);
        Cv2.DrawContours(solid, outer, -1, Scalar.White, -1);

        using var dist = new Mat();
        Cv2.DistanceTransform(solid, dist, DistanceTypes.L2, DistanceTransformMasks.Mask5);
        Cv2.MinMaxLoc(dist, out double dmin, out double dmax);
        Console.WriteLine($"거리 최대 {dmax:F1}");
        using var distN = new Mat();
        Cv2.Normalize(dist, distN, 0, 1, NormTypes.MinMax);

        // TODO: 0.20 ~ 0.50 을 0.05 간격으로 돌며 씨앗 개수를 출력하세요

        Cv2.ImShow("solid", solid);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);

        Point[][] outer = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        using var solid = new Mat(bin.Size(), MatType.CV_8UC1, Scalar.Black);
        Cv2.DrawContours(solid, outer, -1, Scalar.White, -1);

        using var dist = new Mat();
        Cv2.DistanceTransform(solid, dist, DistanceTypes.L2, DistanceTransformMasks.Mask5);
        Cv2.MinMaxLoc(dist, out double dmin, out double dmax);
        Console.WriteLine($"거리 최대 {dmax:F1}");
        using var distN = new Mat();
        Cv2.Normalize(dist, distN, 0, 1, NormTypes.MinMax);

        for (double th = 0.20; th <= 0.501; th += 0.05)
        {
            using var pk = new Mat();
            Cv2.Threshold(distN, pk, th, 1.0, ThresholdTypes.Binary);
            using var pk8 = new Mat();
            pk.ConvertTo(pk8, MatType.CV_8UC1, 255);
            using var lab = new Mat();
            Console.WriteLine($"  {th:F2} → 씨앗 {Cv2.ConnectedComponents(pk8, lab) - 1}개");
        }

        Cv2.ImShow("dist", distN);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '개수 세기 함수에 상한 면적 추가하기', level: 3,
            desc: '<code>CountParts</code> 함수에 <b>최대 면적</b> 인수를 추가해 "너무 큰 덩어리(= 둘이 붙은 것)" 를 <b>불량으로 따로 보고</b>하도록 고치세요. 반환값을 <code>(int ok, int tooBig)</code> 튜플로 바꾸고, 와셔 영상(면적 500~6000)과 동전 영상에 적용해 결과를 출력하세요.',
            hint: '튜플 반환은 <code>static (int ok, int big) CountParts(...)</code> 처럼 씁니다. 와셔 영상에서 면적 6000 을 넘는 블롭은 붙어 있는 와셔 쌍(9069)과 볼트+너트 쌍(6602)입니다. 호출 쪽에서는 <code>var r = CountParts(...); Console.WriteLine(r.ok);</code>.',
            expect: 'washers.png     → 정상 9개, 너무 큰 덩어리 2개 (총 11)\ncoins_parts.png → 정상 12개, 너무 큰 덩어리 0개 (총 12)',
            starter: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        var a = CountParts("images/washers.png", true, 500, 6000);
        Console.WriteLine($"washers.png     → 정상 {a.ok}개, 너무 큰 덩어리 {a.big}개 (총 {a.ok + a.big})");
        // TODO: coins_parts.png 도 같은 방식으로 출력하세요
    }

    static (int ok, int big) CountParts(string path, bool darkObject, int minArea, int maxArea)
    {
        using var img = Cv2.ImRead(path, ImreadModes.Grayscale);
        using var bin = new Mat();
        ThresholdTypes mode = darkObject ? ThresholdTypes.BinaryInv : ThresholdTypes.Binary;
        Cv2.Threshold(img, bin, 0, 255, mode | ThresholdTypes.Otsu);
        var cc = Cv2.ConnectedComponentsEx(bin);
        int ok = 0, big = 0;
        // TODO: 면적이 minArea 이상 maxArea 이하면 ok, maxArea 보다 크면 big 으로 세세요
        return (ok, big);
    }
}`,
            solution: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        var a = CountParts("images/washers.png", true, 500, 6000);
        Console.WriteLine($"washers.png     → 정상 {a.ok}개, 너무 큰 덩어리 {a.big}개 (총 {a.ok + a.big})");
        var b = CountParts("images/coins_parts.png", false, 500, 6000);
        Console.WriteLine($"coins_parts.png → 정상 {b.ok}개, 너무 큰 덩어리 {b.big}개 (총 {b.ok + b.big})");
    }

    static (int ok, int big) CountParts(string path, bool darkObject, int minArea, int maxArea)
    {
        using var img = Cv2.ImRead(path, ImreadModes.Grayscale);
        using var bin = new Mat();
        ThresholdTypes mode = darkObject ? ThresholdTypes.BinaryInv : ThresholdTypes.Binary;
        Cv2.Threshold(img, bin, 0, 255, mode | ThresholdTypes.Otsu);
        var cc = Cv2.ConnectedComponentsEx(bin);
        int ok = 0, big = 0;
        foreach (var blob in cc.Blobs.Skip(1))
        {
            if (blob.Area < minArea) continue;
            if (blob.Area > maxArea) big++; else ok++;
        }
        return (ok, big);
    }
}`
          }
        ],
        quiz: QUIZ3,
        slides: [
          { layout: 'title', title: '윤곽선과 도형 분석 ③', subtitle: '연결 요소 라벨링과 닿아 있는 물체 분리', notes: '<p>💬 “두 교시 동안 와셔 영상은 계속 11개라고 했습니다. 실제는 13개인데요.” 이 문제를 오늘 끝낸다고 선언하며 시작합니다. (3분)</p>' },
          { layout: 'diagram', title: '연결 요소 라벨링', html: FIG_LABEL, caption: '배경 0, 물체 1부터 — 물체 수 = 라벨 수 − 1', notes: '<p>라벨 Mat 이 “픽셀마다 번호가 적힌 표”라는 점을 강조합니다. 💬 “라벨이 12개 나왔습니다. 물체는 몇 개?” — 11개(배경 제외). 이 실수는 거의 모든 학생이 한 번 합니다. 4연결/8연결도 짚어 줍니다. (5분)</p>' },
          { layout: 'table', title: '윤곽선 vs 라벨링 — 역할 분담', head: ['', '윤곽선', '라벨링'], rows: [
            ['면적', '다각형 (구멍 포함)', '<b>픽셀 수</b> (구멍 제외)'],
            ['모양 분석', '꼭짓점 · 원형도 등 풍부', '사각형 · 면적 · 중심'],
            ['마스크', '직접 그려야', '<code>labels == k</code>'],
            ['주 용도', '분류 · 측정', '<b>개수 · 필터</b>']
          ], notes: '<p>둘 중 하나를 고르는 것이 아니라 <b>라벨링으로 걸러 내고 윤곽선으로 분석</b>하는 조합이 실무 표준이라고 정리합니다. 면적 3372 vs 3965 의 차이도 여기서 설명. (4분)</p>' },
          { layout: 'code', title: 'ConnectedComponentsWithStats', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);

        using var labels = new Mat();
        using var stats = new Mat();
        using var cent = new Mat();
        int n = Cv2.ConnectedComponentsWithStats(bin, labels, stats, cent);
        Console.WriteLine($"라벨 {n}개 → 물체 {n - 1}개");
        for (int k = 1; k < 4; k++)
            Console.WriteLine($"[{k}] 면적 {stats.At<int>(k, 4)} 중심 ({cent.At<double>(k, 0):F1},{cent.At<double>(k, 1):F1})");
    }
}`, points: ['<code>stats</code>: Left · Top · Width · Height · <b>Area</b> (CV_32S)', '<code>centroids</code>: x · y (CV_64F)', '라벨 0 = 배경 → <code>n - 1</code>'], notes: '<p>열 번호 4 대신 <code>(int)ConnectedComponentsTypes.Area</code> 로 쓰면 읽기 쉽다고 알려 줍니다. 라벨 1 의 폭 168 이 “두 개가 붙어 있다”는 신호임을 짚어 주세요. (6분)</p>' },
          { layout: 'code', title: 'ConnectedComponentsEx + Blob', code: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);

        var cc = Cv2.ConnectedComponentsEx(bin);
        var big = cc.GetLargestBlob();
        Console.WriteLine($"가장 큰 블롭 면적 {big.Area} {big.Rect}");
        Console.WriteLine($"면적 1000 이상 {cc.Blobs.Skip(1).Count(b => b.Area >= 1000)}개");

        using var color = new Mat();
        cc.RenderBlobs(color);
        Cv2.ImShow("blobs", color);
        Cv2.WaitKey(0);
    }
}`, points: ['<code>cc.Blobs</code> → LINQ 로 필터 · 정렬', '<code>Label · Area · Rect · Centroid</code>', '<code>RenderBlobs</code> 로 색칠해 눈으로 확인', '<code>Skip(1)</code> = 배경 제외'], notes: '<p>RenderBlobs 결과를 결과 창에서 크게 보여 줍니다. 색이 다른 덩어리를 세어 보게 하면 11개라는 사실이 눈으로 확인됩니다. (6분)</p>' },
          { layout: 'bullets', title: '면적 필터가 하는 일', lead: '현장 코드의 1번 방어선', bullets: [
            '<b>하한</b>: 먼지 · 잡음 · 반사점 제거 (예: 면적 &lt; 500)',
            '<b>상한</b>: “둘이 붙은 덩어리” 를 <b>불량 신호</b>로 잡아낸다',
            '화면 가장자리에 걸친 물체는 따로 제외',
            '번호는 <b>화면 순서로 다시</b> 매겨 사람이 읽게 한다',
            '기준값은 반드시 <b>실제 출력을 보고</b> 정한다'
          ], notes: '<p>💬 “면적 상한을 왜 두나요?” — 붙어 있는 물체를 놓치지 않기 위해. 개수만 세면 11개라 정상처럼 보이지만, 상한을 두면 “너무 큰 덩어리 2개”라는 경고가 나옵니다. (4분)</p>' },
          { layout: 'diagram', title: '거리 변환 + Watershed 5단계', html: FIG_WS, caption: '이진화 → 거리 변환 → 봉우리(씨앗) → 마커 → Watershed', notes: '<p>그림의 5칸을 순서대로 짚습니다. 핵심은 ②③: 물체 중심이 경계에서 가장 멀다 → 봉우리 = 물체 하나. 마커의 규칙(씨앗 +1, 미지 0, 결과 경계 −1)을 칠판에 씁니다. (6분)</p>' },
          { layout: 'code', title: 'Watershed 핵심 부분', code: `using System;
using OpenCvSharp;
class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] o = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        using var solid = new Mat(bin.Size(), MatType.CV_8UC1, Scalar.Black);
        Cv2.DrawContours(solid, o, -1, Scalar.White, -1);          // 구멍 메우기
        using var dist = new Mat();
        Cv2.DistanceTransform(solid, dist, DistanceTypes.L2, DistanceTransformMasks.Mask5);
        using var dn = new Mat();
        Cv2.Normalize(dist, dn, 0, 1, NormTypes.MinMax);
        using var peak = new Mat();
        Cv2.Threshold(dn, peak, 0.35, 1.0, ThresholdTypes.Binary);
        using var fg = new Mat();
        peak.ConvertTo(fg, MatType.CV_8UC1, 255);
        using var seeds = new Mat();
        Console.WriteLine($"씨앗 {Cv2.ConnectedComponents(fg, seeds) - 1}개");
    }
}`, points: ['① 구멍 메우기 (링이면 봉우리가 고리가 된다)', '② 거리 변환 → ③ 정규화 → 봉우리 임계값', '<b>임계값 0.35 → 씨앗 13개</b>', '다음 단계: 마커(CV_32SC1) → <code>Cv2.Watershed</code>'], notes: '<p>여기까지 실행해 씨앗 13개를 확인합니다. 0.35 를 0.2 · 0.5 로 바꿔 15개 · 10개가 나오는 것을 반드시 시연하세요 — 이 차시 최대의 교훈입니다. (7분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: 'Watershed 의 마커 Mat 형식과 미지 영역 값은?', options: ['CV_8UC1 / 255', 'CV_32SC1 / 0', 'CV_32FC1 / 1.0', 'CV_8UC3 / 0'], answer: 1, explain: '마커는 <b>CV_32SC1</b>(int)이고 <b>모르는 영역은 0</b> 입니다. 결과에서 물체 경계는 <b>−1</b> 로 표시되고, 입력 이미지는 3채널이어야 합니다.', notes: '<p>정답 2번. 형식을 CV_8UC1 로 잘못 만들면 예외가 나거나 결과가 엉뚱해진다는 점을 덧붙입니다.</p>' },
          { layout: 'code', title: '파이프라인을 함수로', code: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        int a = CountParts("images/washers.png", true, 500);
        int b = CountParts("images/coins_parts.png", false, 500);
        Console.WriteLine($"washers {a}개 / coins {b}개");
    }

    static int CountParts(string path, bool darkObject, int minArea)
    {
        using var img = Cv2.ImRead(path, ImreadModes.Grayscale);
        if (img.Empty()) return 0;
        using var bin = new Mat();
        ThresholdTypes m = darkObject ? ThresholdTypes.BinaryInv : ThresholdTypes.Binary;
        Cv2.Threshold(img, bin, 0, 255, m | ThresholdTypes.Otsu);
        var cc = Cv2.ConnectedComponentsEx(bin);
        return cc.Blobs.Skip(1).Count(b => b.Area >= minArea);
    }
}`, points: ['읽기 → 이진화 → 라벨링 → 면적 필터', '<code>darkObject</code> 로 조명 방식 선택', '<code>img.Empty()</code> 로 실패 처리', '15차시 카메라 반복 · 17차시 WPF 에 그대로 재사용'], notes: '<p>함수로 묶는 습관을 강조합니다. 이 함수가 15차시(카메라)와 17차시(검사 프로젝트)에서 다시 등장한다고 예고하면 학생들이 코드를 저장해 둡니다. (6분)</p>' },
          { layout: 'practice', title: '실습: 임계값 실험', desc: '<p>봉우리 임계값을 <b>0.20 ~ 0.50, 0.05 간격</b>으로 바꿔 가며 씨앗 개수를 출력하세요.</p><ul><li>13개가 나오는 구간을 찾기</li><li>너무 낮으면 왜 많아지고, 너무 높으면 왜 줄어드는지 설명</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] o = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        using var solid = new Mat(bin.Size(), MatType.CV_8UC1, Scalar.Black);
        Cv2.DrawContours(solid, o, -1, Scalar.White, -1);
        using var dist = new Mat();
        Cv2.DistanceTransform(solid, dist, DistanceTypes.L2, DistanceTransformMasks.Mask5);
        using var dn = new Mat();
        Cv2.Normalize(dist, dn, 0, 1, NormTypes.MinMax);
        // TODO: 0.20 ~ 0.50 반복
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] o = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        using var solid = new Mat(bin.Size(), MatType.CV_8UC1, Scalar.Black);
        Cv2.DrawContours(solid, o, -1, Scalar.White, -1);
        using var dist = new Mat();
        Cv2.DistanceTransform(solid, dist, DistanceTypes.L2, DistanceTransformMasks.Mask5);
        using var dn = new Mat();
        Cv2.Normalize(dist, dn, 0, 1, NormTypes.MinMax);
        for (double th = 0.20; th <= 0.501; th += 0.05)
        {
            using var pk = new Mat();
            Cv2.Threshold(dn, pk, th, 1.0, ThresholdTypes.Binary);
            using var pk8 = new Mat();
            pk.ConvertTo(pk8, MatType.CV_8UC1, 255);
            using var lab = new Mat();
            Console.WriteLine($"  {th:F2} → {Cv2.ConnectedComponents(pk8, lab) - 1}개");
        }
        Cv2.WaitKey(0);
    }
}`, notes: '<p>정답: 0.20 → 15, 0.25 → 14, 0.30~0.40 → 13, 0.45 이상 → 10. 낮으면 한 물체 안에 봉우리가 여러 개(과분할), 높으면 작은 물체(볼트 몸통)의 봉우리가 사라집니다. (10분)</p>' },
          { layout: 'summary', title: '정리 (12차시 전체)', bullets: ['<b>1교시</b>: 윤곽선 = 경계 점 목록, <code>External</code>/<code>CComp</code>, 계층으로 구멍 세기', '<b>2교시</b>: 모멘트 중심 · 외접 도형 4종 · 꼭짓점 수 · 원형도 · 볼록성으로 분류', '<b>3교시</b>: 라벨링(배경 0 주의) + 면적 필터 → 거리 변환 + Watershed 로 닿은 물체 분리', '와셔 영상: 이진화만 <b>11개</b> → Watershed 로 <b>13개</b> (정답)', '임계값 · 면적 기준은 <b>반드시 실제 출력을 보고</b> 정한다', '파이프라인을 <b>함수</b>로 묶어 두면 카메라(15) · WPF(16 · 17)에서 그대로 쓴다', '다음 차시: 허프 변환으로 직선과 원을 직접 검출'], notes: '<p>세 교시를 한 장으로 되짚습니다. 11 → 13 의 여정이 이 차시의 이야기였다고 정리하고, 다음 차시(허프 변환)에서는 “모양을 수식으로 찾는” 다른 접근을 배운다고 예고합니다. (3분)</p>' }
        ]
      }
    ]
  });
})();
