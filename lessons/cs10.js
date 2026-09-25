/* 10차시 에지 검출: Sobel · Laplacian · Canny */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 에지 = 밝기 변화 (1차 미분 프로파일)
  const FIG_PROFILE = `<svg viewBox="0 0 740 380" role="img" aria-label="밝은 배경에서 어두운 물체로 넘어가는 밝기 프로파일과 그 1차 미분 2차 미분">
  ${ARROW('c10a1')}
  <text x="60" y="30" class="tx-b">밝기 f(x)</text>
  <line x1="120" y1="40" x2="120" y2="120" class="ax"/>
  <line x1="120" y1="120" x2="700" y2="120" class="ax"/>
  <path d="M120,50 L280,50 C300,50 320,112 350,112 L700,112" class="s1" fill="none" stroke-width="3"/>
  <text x="200" y="42" text-anchor="middle" class="tx-m">밝은 배경 (약 230)</text>
  <text x="520" y="106" text-anchor="middle" class="tx-m">어두운 물체 (약 30)</text>
  <text x="316" y="140" text-anchor="middle" class="tx-b">에지</text>
  <line x1="315" y1="40" x2="315" y2="360" class="ln" stroke-dasharray="4 4"/>
  <text x="60" y="190" class="tx-b">1차 미분</text>
  <text x="60" y="208" class="tx-m">f'(x) ≈ f(x+1) − f(x−1)</text>
  <line x1="120" y1="230" x2="700" y2="230" class="ax"/>
  <path d="M120,230 L285,230 C300,230 305,290 315,290 C325,290 330,230 348,230 L700,230" class="s3" fill="none" stroke-width="3"/>
  <text x="400" y="288" class="tx-b">기울기가 가장 큰 곳 = 에지 위치</text>
  <text x="400" y="308" class="tx-m">Sobel · Scharr 가 찾는 값 (부호가 있다 → CV_16S)</text>
  <text x="60" y="345" class="tx-b">2차 미분</text>
  <text x="60" y="363" class="tx-m">f''(x)</text>
  <line x1="120" y1="350" x2="700" y2="350" class="ax"/>
  <path d="M120,350 L288,350 L292,326 L308,326 L312,374 L330,374 L334,350 L700,350" class="s5" fill="none" stroke-width="2"/>
  <text x="430" y="345" class="tx-m">에지에서 <tspan class="tx-b">부호가 바뀐다(영교차)</tspan> — Laplacian</text>
  <text x="430" y="365" class="tx-m">잡음에 아주 민감하다 → 먼저 블러</text>
</svg>`;

  // 그림 2: Sobel 커널
  const FIG_SOBELK = `<svg viewBox="0 0 720 260" role="img" aria-label="Sobel x 방향 y 방향 커널과 Scharr 커널">
  <text x="130" y="26" text-anchor="middle" class="tx-b">Sobel dx=1 (세로 에지)</text>
  <rect x="60" y="40" width="140" height="105" rx="4" class="p1s"/>
  <line x1="60" y1="75" x2="200" y2="75" class="ln"/><line x1="60" y1="110" x2="200" y2="110" class="ln"/>
  <line x1="107" y1="40" x2="107" y2="145" class="ln"/><line x1="153" y1="40" x2="153" y2="145" class="ln"/>
  <text x="83" y="66" text-anchor="middle" class="tx">−1</text><text x="130" y="66" text-anchor="middle" class="tx">0</text><text x="176" y="66" text-anchor="middle" class="tx">1</text>
  <text x="83" y="101" text-anchor="middle" class="tx-b">−2</text><text x="130" y="101" text-anchor="middle" class="tx">0</text><text x="176" y="101" text-anchor="middle" class="tx-b">2</text>
  <text x="83" y="136" text-anchor="middle" class="tx">−1</text><text x="130" y="136" text-anchor="middle" class="tx">0</text><text x="176" y="136" text-anchor="middle" class="tx">1</text>
  <text x="130" y="170" text-anchor="middle" class="tx-m">좌우 차이 → <tspan class="tx-b">세로</tspan> 에지가 밝게</text>
  <text x="130" y="192" text-anchor="middle" class="tx-m">가운데 줄에 2배 가중 = 블러 + 미분</text>
  <text x="360" y="26" text-anchor="middle" class="tx-b">Sobel dy=1 (가로 에지)</text>
  <rect x="290" y="40" width="140" height="105" rx="4" class="p2s"/>
  <line x1="290" y1="75" x2="430" y2="75" class="ln"/><line x1="290" y1="110" x2="430" y2="110" class="ln"/>
  <line x1="337" y1="40" x2="337" y2="145" class="ln"/><line x1="383" y1="40" x2="383" y2="145" class="ln"/>
  <text x="313" y="66" text-anchor="middle" class="tx">−1</text><text x="360" y="66" text-anchor="middle" class="tx-b">−2</text><text x="406" y="66" text-anchor="middle" class="tx">−1</text>
  <text x="313" y="101" text-anchor="middle" class="tx">0</text><text x="360" y="101" text-anchor="middle" class="tx">0</text><text x="406" y="101" text-anchor="middle" class="tx">0</text>
  <text x="313" y="136" text-anchor="middle" class="tx">1</text><text x="360" y="136" text-anchor="middle" class="tx-b">2</text><text x="406" y="136" text-anchor="middle" class="tx">1</text>
  <text x="360" y="170" text-anchor="middle" class="tx-m">위아래 차이 → <tspan class="tx-b">가로</tspan> 에지가 밝게</text>
  <text x="360" y="192" text-anchor="middle" class="tx-m">dx=1 커널을 90° 돌린 것</text>
  <text x="590" y="26" text-anchor="middle" class="tx-b">Scharr dx=1</text>
  <rect x="520" y="40" width="140" height="105" rx="4" class="p4s"/>
  <line x1="520" y1="75" x2="660" y2="75" class="ln"/><line x1="520" y1="110" x2="660" y2="110" class="ln"/>
  <line x1="567" y1="40" x2="567" y2="145" class="ln"/><line x1="613" y1="40" x2="613" y2="145" class="ln"/>
  <text x="543" y="66" text-anchor="middle" class="tx">−3</text><text x="590" y="66" text-anchor="middle" class="tx">0</text><text x="636" y="66" text-anchor="middle" class="tx">3</text>
  <text x="543" y="101" text-anchor="middle" class="tx-b">−10</text><text x="590" y="101" text-anchor="middle" class="tx">0</text><text x="636" y="101" text-anchor="middle" class="tx-b">10</text>
  <text x="543" y="136" text-anchor="middle" class="tx">−3</text><text x="590" y="136" text-anchor="middle" class="tx">0</text><text x="636" y="136" text-anchor="middle" class="tx">3</text>
  <text x="590" y="170" text-anchor="middle" class="tx-m">3×3 에서 가장 정확한 미분</text>
  <text x="590" y="192" text-anchor="middle" class="tx-m">= <tspan class="tx-b">Sobel(ksize: -1)</tspan></text>
  <text x="360" y="232" text-anchor="middle" class="tx-m">결과에는 <tspan class="tx-b">음수</tspan> 가 있다 → <tspan class="tx-b">MatType.CV_16S</tspan> 나 CV_32F 로 받고 ConvertScaleAbs 로 절대값</text>
  <text x="360" y="252" text-anchor="middle" class="tx-m">CV_8U 로 받으면 음수가 0 으로 잘려 한쪽 에지가 사라진다 (가장 흔한 실수)</text>
</svg>`;

  // 그림 3: 그래디언트 크기와 방향
  const FIG_GRAD = `<svg viewBox="0 0 700 260" role="img" aria-label="gx gy 벡터의 크기와 방향">
  ${ARROW('c10a2')}
  <rect x="40" y="40" width="200" height="170" rx="6" class="p1s"/>
  <path d="M40,190 L240,80" class="s5" fill="none" stroke-width="4"/>
  <text x="140" y="228" text-anchor="middle" class="tx-m">어두운 물체와 밝은 배경의 경계</text>
  <line x1="150" y1="130" x2="210" y2="130" class="s3" stroke-width="3" marker-end="url(#c10a2)"/>
  <text x="222" y="134" class="tx">gx</text>
  <line x1="150" y1="130" x2="150" y2="186" class="s2" stroke-width="3" marker-end="url(#c10a2)"/>
  <text x="130" y="200" class="tx">gy</text>
  <line x1="150" y1="130" x2="208" y2="184" class="s1" stroke-width="4" marker-end="url(#c10a2)"/>
  <text x="196" y="156" class="tx-b">g</text>
  <text x="430" y="66" class="tx-b">크기 (magnitude)</text>
  <text x="430" y="92" class="tx">|g| = √(gx² + gy²)</text>
  <text x="430" y="114" class="tx-m">= <tspan class="tx-b">Cv2.Magnitude(gx, gy, mag)</tspan></text>
  <text x="430" y="136" class="tx-m">에지가 얼마나 뚜렷한가</text>
  <text x="430" y="176" class="tx-b">방향 (direction)</text>
  <text x="430" y="202" class="tx">θ = atan2(gy, gx)</text>
  <text x="430" y="224" class="tx-m">= <tspan class="tx-b">Cv2.CartToPolar(gx, gy, mag, ang, true)</tspan></text>
  <text x="430" y="246" class="tx-m">에지에 <tspan class="tx-b">수직</tspan> 인 방향 (0° = 오른쪽, 90° = 아래)</text>
  <text x="140" y="30" text-anchor="middle" class="tx-m">그래디언트는 에지에 수직이다</text>
</svg>`;

  // 그림 4: Canny 4단계
  const FIG_CANNY = `<svg viewBox="0 0 740 250" role="img" aria-label="Canny 에지 검출의 네 단계">
  ${ARROW('c10a3')}
  <rect x="10" y="60" width="150" height="80" rx="8" class="p1s"/>
  <text x="85" y="86" text-anchor="middle" class="tx-b">① 가우시안 블러</text>
  <text x="85" y="108" text-anchor="middle" class="tx-m">잡음 제거 (5×5)</text>
  <text x="85" y="128" text-anchor="middle" class="tx-m">Canny 가 내부에서 한다</text>
  <rect x="180" y="60" width="150" height="80" rx="8" class="p2s"/>
  <text x="255" y="86" text-anchor="middle" class="tx-b">② 그래디언트</text>
  <text x="255" y="108" text-anchor="middle" class="tx-m">Sobel 로 gx, gy</text>
  <text x="255" y="128" text-anchor="middle" class="tx-m">크기 |g| 와 방향 θ</text>
  <rect x="350" y="60" width="170" height="80" rx="8" class="p3s"/>
  <text x="435" y="86" text-anchor="middle" class="tx-b">③ 비최대 억제</text>
  <text x="435" y="106" text-anchor="middle" class="tx-m">에지 방향으로 이웃과 비교</text>
  <text x="435" y="126" text-anchor="middle" class="tx-m">가장 센 픽셀만 남겨 <tspan class="tx-b">1 px 선</tspan></text>
  <rect x="540" y="60" width="190" height="80" rx="8" class="p4s"/>
  <text x="635" y="86" text-anchor="middle" class="tx-b">④ 이력 임계값</text>
  <text x="635" y="106" text-anchor="middle" class="tx-m">threshold1 · threshold2</text>
  <text x="635" y="126" text-anchor="middle" class="tx-m">강한 에지에 이어진 약한 에지도 살림</text>
  <line x1="163" y1="100" x2="176" y2="100" class="ln" stroke-width="2" marker-end="url(#c10a3)"/>
  <line x1="333" y1="100" x2="346" y2="100" class="ln" stroke-width="2" marker-end="url(#c10a3)"/>
  <line x1="523" y1="100" x2="536" y2="100" class="ln" stroke-width="2" marker-end="url(#c10a3)"/>
  <text x="370" y="30" text-anchor="middle" class="tx-b">Cv2.Canny(src, dst, threshold1, threshold2, apertureSize, L2gradient)</text>
  <text x="370" y="180" text-anchor="middle" class="tx-m">결과는 항상 <tspan class="tx-b">0 또는 255 의 이진 영상</tspan> · 선 두께 1 px — 그래서 윤곽선 · 허프 변환의 입력으로 쓴다</text>
  <text x="370" y="210" text-anchor="middle" class="tx-m">Sobel 은 “얼마나 센 에지인가”(회색), Canny 는 “에지인가 아닌가”(이진)를 답한다</text>
  <text x="370" y="238" text-anchor="middle" class="tx-m">apertureSize 는 내부 Sobel 커널(3 · 5 · 7), L2gradient=true 면 √(gx²+gy²) 로 더 정확하게</text>
</svg>`;

  // 그림 5: 이력 임계값 (hysteresis)
  const FIG_HYST = `<svg viewBox="0 0 700 280" role="img" aria-label="두 임계값으로 강한 에지와 약한 에지를 구분하는 이력 임계값">
  <line x1="90" y1="40" x2="90" y2="210" class="ax"/>
  <line x1="90" y1="210" x2="660" y2="210" class="ax"/>
  <text x="50" y="46" class="tx-m">|g|</text>
  <line x1="90" y1="80" x2="660" y2="80" class="s5" stroke-dasharray="6 4" stroke-width="2"/>
  <text x="668" y="84" class="tx-b" text-anchor="end">threshold2 (높음)</text>
  <line x1="90" y1="150" x2="660" y2="150" class="s3" stroke-dasharray="6 4" stroke-width="2"/>
  <text x="668" y="168" class="tx-b" text-anchor="end">threshold1 (낮음)</text>
  <path d="M100,205 L150,205 L165,60 L180,205 L250,205 L265,120 L280,205 L340,205 L352,58 L365,205 L430,205 L442,130 L455,205 L520,205 L532,175 L545,205 L640,205" class="s1" fill="none" stroke-width="2"/>
  <circle cx="165" cy="60" r="6" class="p2"/><text x="165" y="238" text-anchor="middle" class="tx-b">강한 에지</text><text x="165" y="256" text-anchor="middle" class="tx-m">무조건 살림</text>
  <circle cx="265" cy="120" r="6" class="p3"/><text x="265" y="238" text-anchor="middle" class="tx-b">약한 에지</text><text x="265" y="256" text-anchor="middle" class="tx-m">강한 에지에 이어져 있음 → 살림</text>
  <circle cx="352" cy="58" r="6" class="p2"/>
  <circle cx="442" cy="130" r="6" class="p3"/>
  <circle cx="532" cy="175" r="6" class="p5"/><text x="545" y="238" text-anchor="middle" class="tx-b">잡음</text><text x="560" y="256" text-anchor="middle" class="tx-m">threshold1 미만 → 버림</text>
  <text x="370" y="24" text-anchor="middle" class="tx-b">이력(hysteresis) 임계값: 두 개를 쓰는 이유</text>
  <text x="370" y="276" text-anchor="middle" class="tx-m">하나만 쓰면 에지가 중간중간 끊긴다 — 보통 threshold2 : threshold1 = 2:1 ~ 3:1</text>
</svg>`;

  // ------------------------------------------------------------------ 1교시 예제
  const EX_PROFILE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
        // 백라이트 실루엣: 배경이 밝고 판이 어둡다. y=241 행의 왼쪽 에지(x 약 128)를 지나간다
        Console.WriteLine("x    f(x)  f(x+1)-f(x-1)");
        int bestX = 0, bestD = 0;
        for (int x = 122; x <= 136; x++)
        {
            int v = img.At<byte>(241, x);
            int d = img.At<byte>(241, x + 1) - img.At<byte>(241, x - 1);
            Console.WriteLine($"{x,-4} {v,4}  {d,6}");
            if (Math.Abs(d) > Math.Abs(bestD)) { bestD = d; bestX = x; }
        }
        Console.WriteLine($"변화가 가장 큰 위치 x = {bestX} (차분 {bestD})");
        Console.WriteLine("정답(서브픽셀) 왼쪽 에지 = x 128.227 → 정수 차분으로도 1 px 안에 들어온다");
    }
}`;

  const EX_SOBEL = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);

        // ① 부호가 있는 결과를 담을 수 있게 CV_16S 로 받는다
        using var gx16 = new Mat();
        using var gy16 = new Mat();
        Cv2.Sobel(img, gx16, MatType.CV_16S, 1, 0, 3);   // dx=1, dy=0 → 세로 에지
        Cv2.Sobel(img, gy16, MatType.CV_16S, 0, 1, 3);   // dx=0, dy=1 → 가로 에지
        Cv2.MinMaxLoc(gx16, out double gxLo, out double gxHi);
        Console.WriteLine($"gx 값 범위 = {gxLo} ~ {gxHi}  (음수가 있다!)");

        // ② 절대값을 8비트로 (ConvertScaleAbs = |v| 를 0~255 로 자름)
        using var ax = new Mat();
        using var ay = new Mat();
        Cv2.ConvertScaleAbs(gx16, ax);
        Cv2.ConvertScaleAbs(gy16, ay);
        Console.WriteLine($"|gx| 평균 {Cv2.Mean(ax).Val0:F2}, |gy| 평균 {Cv2.Mean(ay).Val0:F2}");

        // ③ 두 방향을 합친다
        using var sum = new Mat();
        Cv2.AddWeighted(ax, 0.5, ay, 0.5, 0, sum);
        Console.WriteLine($"합친 결과 평균 {Cv2.Mean(sum).Val0:F2}");

        // ④ CV_8U 로 바로 받으면? → 음수가 0 으로 잘린다
        using var bad = new Mat();
        Cv2.Sobel(img, bad, MatType.CV_8UC1, 1, 0, 3);
        Console.WriteLine($"0 이 아닌 픽셀: CV_16S+Abs {Cv2.CountNonZero(ax)} vs CV_8U {Cv2.CountNonZero(bad)}");

        Cv2.ImShow("|gx| (vertical edges)", ax);
        Cv2.ImShow("|gy| (horizontal edges)", ay);
        Cv2.ImShow("sobel x+y", sum);
        Cv2.WaitKey(0);
    }
}`;

  const EX_SCHARR = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);

        using var s3 = new Mat();
        using var s5 = new Mat();
        using var sc = new Mat();
        Cv2.Sobel(img, s3, MatType.CV_16S, 1, 0, 3);
        Cv2.Sobel(img, s5, MatType.CV_16S, 1, 0, 5);
        Cv2.Scharr(img, sc, MatType.CV_16S, 1, 0);      // = Sobel(ksize: -1)

        string[] names = new string[] { "Sobel 3x3", "Sobel 5x5", "Scharr   " };
        Mat[] mats = new Mat[] { s3, s5, sc };
        for (int i = 0; i < 3; i++)
        {
            Cv2.MinMaxLoc(mats[i], out double lo, out double hi);
            using var abs8 = new Mat();
            Cv2.ConvertScaleAbs(mats[i], abs8);
            Console.WriteLine($"{names[i]} : 범위 {lo,7} ~ {hi,-7} 평균|g| {Cv2.Mean(abs8).Val0:F2}");
            Cv2.ImShow(names[i].Trim(), abs8);
        }
        Console.WriteLine("커널이 크면 값이 커지고 두꺼워진다 / Scharr 는 3x3 에서 가장 정확하다");
        Cv2.WaitKey(0);
    }
}`;

  const EX_MAG = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);

        // 크기 · 방향을 계산하려면 실수형(CV_32F)으로 받는다
        using var gx = new Mat();
        using var gy = new Mat();
        Cv2.Sobel(img, gx, MatType.CV_32FC1, 1, 0, 3);
        Cv2.Sobel(img, gy, MatType.CV_32FC1, 0, 1, 3);

        using var mag = new Mat();
        Cv2.Magnitude(gx, gy, mag);                 // √(gx² + gy²)
        using var mag2 = new Mat();
        using var ang = new Mat();
        Cv2.CartToPolar(gx, gy, mag2, ang, true);   // true = 도(degree) 단위

        Cv2.MinMaxLoc(mag, out double lo, out double hi);
        Console.WriteLine($"그래디언트 크기 범위 = {lo:F1} ~ {hi:F1}");
        Console.WriteLine($"왼쪽 에지 (128, 241) : 크기 {mag.At<float>(241, 128):F1}, 방향 {ang.At<float>(241, 128):F1}도");
        Console.WriteLine($"위쪽 에지 (320, 156) : 크기 {mag.At<float>(156, 320):F1}, 방향 {ang.At<float>(156, 320):F1}도");
        Console.WriteLine("판이 반시계로 3.5도 기울어져 있으므로 에지 법선도 그만큼 돌아간다");

        // 화면에 보이려면 0~255 로 정규화한 뒤 8비트로
        using var norm = new Mat();
        using var disp = new Mat();
        Cv2.Normalize(mag, norm, 0, 255, NormTypes.MinMax);
        norm.ConvertTo(disp, MatType.CV_8UC1);
        Cv2.ImShow("gradient magnitude", disp);
        Cv2.WaitKey(0);
    }
}`;

  const EX_LAPLACIAN = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
        using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);

        Console.WriteLine($"깨끗한 영상        : 평균|L| {LapMean(clean):F2}");
        Console.WriteLine($"잡음 영상 (블러 X) : 평균|L| {LapMean(noisy):F2}");

        using var blurred = new Mat();
        Cv2.GaussianBlur(noisy, blurred, new Size(5, 5), 0);
        Console.WriteLine($"잡음 영상 (블러 O) : 평균|L| {LapMean(blurred):F2}");

        using var l16 = new Mat();
        using var abs8 = new Mat();
        Cv2.Laplacian(blurred, l16, MatType.CV_16S, 3);
        Cv2.ConvertScaleAbs(l16, abs8);
        Cv2.ImShow("laplacian (blur + noisy)", abs8);

        using var lbad = new Mat();
        using var absbad = new Mat();
        Cv2.Laplacian(noisy, lbad, MatType.CV_16S, 3);
        Cv2.ConvertScaleAbs(lbad, absbad);
        Cv2.ImShow("laplacian (no blur)", absbad);
        Cv2.WaitKey(0);
    }

    static double LapMean(Mat src)
    {
        using var l16 = new Mat();
        using var abs8 = new Mat();
        Cv2.Laplacian(src, l16, MatType.CV_16S, 3);
        Cv2.ConvertScaleAbs(l16, abs8);
        return Cv2.Mean(abs8).Val0;
    }
}`;

  // ------------------------------------------------------------------ 2교시 예제
  const EX_CANNY = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
        using var edges = new Mat();
        Cv2.Canny(img, edges, 50, 150);        // threshold1, threshold2

        int total = img.Rows * img.Cols;
        int n = Cv2.CountNonZero(edges);
        Console.WriteLine($"에지 픽셀 {n}개 / 전체 {total} = {100.0 * n / total:F2} %");
        Cv2.MinMaxLoc(edges, out double lo, out double hi);
        Console.WriteLine($"결과 값의 범위 = {lo} ~ {hi} (0 또는 255 뿐인 이진 영상)");
        Console.WriteLine($"형식 = {edges.Type()}, 채널 = {edges.Channels()}");

        // 둘레 길이로 검산: 판은 380 x 170 → 둘레 1100, 구멍 r=30 → 약 188
        Console.WriteLine("정답: 판 둘레 약 1100 px + 구멍 둘레 약 188 px → 1 px 두께 에지와 비슷한 규모");

        Cv2.ImShow("input", img);
        Cv2.ImShow("canny 50/150", edges);
        Cv2.WaitKey(0);
    }
}`;

  const EX_THRESH = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png", ImreadModes.Grayscale);
        int total = img.Rows * img.Cols;

        int[] t1 = new int[] { 10, 30, 50, 100, 150 };
        int[] t2 = new int[] { 30, 90, 150, 200, 300 };
        for (int i = 0; i < t1.Length; i++)
        {
            using var e = new Mat();
            Cv2.Canny(img, e, t1[i], t2[i]);
            int n = Cv2.CountNonZero(e);
            Console.WriteLine($"Canny({t1[i],3}, {t2[i],3}) 비율 1:{(double)t2[i] / t1[i]:F1} → 에지 {n,6}개 ({100.0 * n / total:F2} %)");
            Cv2.ImShow($"canny {t1[i]}-{t2[i]}", e);
        }
        Console.WriteLine("임계값이 낮으면 잡음 · 무늬까지, 높으면 약한 에지가 끊긴다");
        Cv2.WaitKey(0);
    }
}`;

  const EX_PRE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
        using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
        int total = noisy.Rows * noisy.Cols;

        using var e0 = new Mat();
        Cv2.Canny(clean, e0, 50, 150);
        Console.WriteLine($"깨끗한 원본        : 에지 {Cv2.CountNonZero(e0),6}개 ({100.0 * Cv2.CountNonZero(e0) / total:F2} %)");

        using var e1 = new Mat();
        Cv2.Canny(noisy, e1, 50, 150);
        Console.WriteLine($"잡음 영상 (블러 X) : 에지 {Cv2.CountNonZero(e1),6}개 ({100.0 * Cv2.CountNonZero(e1) / total:F2} %)");

        int[] ks = new int[] { 3, 5, 7 };
        foreach (int k in ks)
        {
            using var b = new Mat();
            using var e = new Mat();
            Cv2.GaussianBlur(noisy, b, new Size(k, k), 0);
            Cv2.Canny(b, e, 50, 150);
            Console.WriteLine($"블러 {k}x{k} 후       : 에지 {Cv2.CountNonZero(e),6}개 ({100.0 * Cv2.CountNonZero(e) / total:F2} %)");
            Cv2.ImShow($"blur {k} + canny", e);
        }
        Cv2.ImShow("no blur + canny", e1);
        Cv2.WaitKey(0);
    }
}`;

  const EX_OVERLAY = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/chip_rotated.png", ImreadModes.Grayscale);
        using var blur = new Mat();
        Cv2.GaussianBlur(gray, blur, new Size(5, 5), 0);
        using var edges = new Mat();
        Cv2.Canny(blur, edges, 60, 180);
        Console.WriteLine($"에지 픽셀 {Cv2.CountNonZero(edges)}개");

        // 회색 원본을 3채널로 바꾸고, 에지 자리만 빨강으로 칠한다
        using var overlay = new Mat();
        Cv2.CvtColor(gray, overlay, ColorConversionCodes.GRAY2BGR);
        overlay.SetTo(new Scalar(0, 0, 255), edges);       // 마스크 = 에지
        Console.WriteLine($"오버레이 형식 {overlay.Type()}, 채널 {overlay.Channels()}");

        // 컬러 영상도 같은 방법: 회색으로 바꿔 Canny → 원본 위에 겹치기
        using var color = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        using var cgray = new Mat();
        Cv2.CvtColor(color, cgray, ColorConversionCodes.BGR2GRAY);
        using var cedge = new Mat();
        Cv2.Canny(cgray, cedge, 50, 150);
        color.SetTo(new Scalar(0, 255, 255), cedge);       // 노랑
        Console.WriteLine($"sample_color 에지 픽셀 {Cv2.CountNonZero(cedge)}개");

        Cv2.ImShow("chip + red edges", overlay);
        Cv2.ImShow("sample_color + yellow edges", color);
        Cv2.WaitKey(0);
    }
}`;

  const EX_NEXT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/chip_rotated.png", ImreadModes.Grayscale);
        using var blur = new Mat();
        Cv2.GaussianBlur(img, blur, new Size(5, 5), 0);
        using var edges = new Mat();
        Cv2.Canny(blur, edges, 60, 180);

        // 에지 영상은 그대로 윤곽선(12차시) · 허프 변환(13차시)의 입력이 된다
        var contours = Cv2.FindContoursAsArray(edges, RetrievalModes.List, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"에지에서 찾은 윤곽선 {contours.Length}개");

        int big = 0;
        double longest = 0;
        foreach (var c in contours)
        {
            double len = Cv2.ArcLength(c, false);
            if (len > 100) big++;
            if (len > longest) longest = len;
        }
        Console.WriteLine($"길이 100 px 이상인 윤곽선 {big}개, 가장 긴 것 {longest:F0} px");

        var lines = Cv2.HoughLinesP(edges, 1, Math.PI / 180, 60, 40, 8);
        Console.WriteLine($"HoughLinesP 로 찾은 직선 {lines.Length}개 (다음 차시 예고)");
        if (lines.Length > 0)
        {
            var l = lines[0];
            double deg = Math.Atan2(l.P2.Y - l.P1.Y, l.P2.X - l.P1.X) * 180 / Math.PI;
            Console.WriteLine($"가장 먼저 찾은 직선의 기울기 = {deg:F1}도 (칩은 23.5도 회전)");
        }
        Cv2.ImShow("canny", edges);
        Cv2.WaitKey(0);
    }
}`;

  const EX_WPF = `// 🪟 WPF: 두 슬라이더로 Canny 임계값을 조절하는 에지 검사 화면
using System.Windows;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;

namespace EdgeDemo
{
    public partial class MainWindow : Window
    {
        private Mat src;

        public MainWindow()
        {
            InitializeComponent();
            src = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
            Apply();
        }

        private void Threshold_Changed(object sender,
            RoutedPropertyChangedEventArgs<double> e) => Apply();

        private void Apply()
        {
            if (src == null || src.Empty()) return;
            double t1 = LowSlider.Value, t2 = HighSlider.Value;
            if (t2 < t1) t2 = t1 * 2;                    // 항상 t2 > t1
            using var blur = new Mat();
            Cv2.GaussianBlur(src, blur, new Size(5, 5), 0);
            using var edges = new Mat();
            Cv2.Canny(blur, edges, t1, t2);
            using var overlay = new Mat();
            Cv2.CvtColor(src, overlay, ColorConversionCodes.GRAY2BGR);
            overlay.SetTo(new Scalar(0, 0, 255), edges);
            ResultImage.Source = BitmapSourceConverter.ToBitmapSource(overlay);
            StatusText.Text = $"Canny({t1:F0}, {t2:F0}) 에지 {Cv2.CountNonZero(edges)} px";
        }
    }
}`;

  // ------------------------------------------------------------------ 퀴즈
  const QUIZ1 = [
    { q: '<code>Cv2.Sobel</code> 의 결과를 <code>MatType.CV_8UC1</code> 로 받으면 무엇이 문제인가?', options: ['속도가 느려진다', '<b>음수 그래디언트가 0 으로 잘린다</b>', '커널이 커진다', '채널 수가 바뀐다'], answer: 1,
      explain: '밝기가 줄어드는 방향의 에지는 그래디언트가 <b>음수</b>입니다. 8비트 부호 없는 형식에 담으면 음수가 모두 0 이 되어 <b>한쪽 에지만 보입니다</b>. <code>MatType.CV_16S</code>(또는 <code>CV_32F</code>)로 받고 <code>Cv2.ConvertScaleAbs</code> 로 절대값을 8비트로 바꾸는 것이 표준입니다.' },
    { q: '<code>Cv2.Sobel(img, dst, MatType.CV_16S, 1, 0, 3)</code> 은 어떤 에지를 강조하는가?', options: ['가로 에지', '세로 에지', '대각선 에지만', '모든 에지를 똑같이'], answer: 1,
      explain: '<code>dx=1, dy=0</code> 은 <b>x 방향(좌우) 밝기 변화</b>를 봅니다. 좌우로 밝기가 바뀌는 곳은 <b>세로 방향으로 뻗은 에지</b>이므로 세로 에지가 밝게 나옵니다. <code>dx=0, dy=1</code> 은 가로 에지입니다.' },
    { q: '<code>Cv2.Scharr(img, dst, MatType.CV_16S, 1, 0)</code> 과 같은 것은?', options: ['<code>Cv2.Sobel(..., 1, 0, 3)</code>', '<code>Cv2.Sobel(..., 1, 0, -1)</code>', '<code>Cv2.Laplacian(..., 3)</code>', '<code>Cv2.Canny(..., 1, 0)</code>'], answer: 1,
      explain: 'Scharr 는 3×3 에서 회전 대칭성이 가장 좋은 미분 커널로, <code>Cv2.Sobel</code> 의 <code>ksize</code> 에 <b>−1</b> 을 주면 같은 커널이 쓰입니다. 계수가 (3, 10, 3) 이라 Sobel(1, 2, 1) 보다 값이 큽니다.' },
    { q: '<code>Cv2.Laplacian</code> 앞에 <code>Cv2.GaussianBlur</code> 를 넣는 이유는?', options: ['속도를 올리려고', '2차 미분이 잡음에 매우 민감하기 때문', '채널 수를 맞추려고', '음수를 없애려고'], answer: 1,
      explain: '미분은 잡음을 증폭시키고 <b>2차 미분은 두 번 증폭</b>합니다. 그래서 라플라시안은 반드시 블러를 먼저 하며, 이 조합을 <b>LoG(Laplacian of Gaussian)</b> 라고 부릅니다. Canny 는 이 블러를 함수 안에서 자동으로 해 줍니다.' },
    { q: '그래디언트의 <b>방향</b> θ = atan2(gy, gx) 는 무엇을 가리키는가?', options: ['에지와 평행한 방향', '에지에 <b>수직</b>인 방향', '항상 0° 또는 90°', '이미지의 기울기'], answer: 1,
      explain: '그래디언트는 “밝기가 가장 빨리 변하는 방향”이므로 <b>에지를 가로지르는(수직인) 방향</b>입니다. 에지 자체의 방향은 θ + 90° 입니다. Canny 의 비최대 억제가 이 방향을 따라 이웃과 비교합니다.' }
  ];

  const QUIZ2 = [
    { q: 'Canny 의 네 단계 순서로 맞는 것은?', options: ['그래디언트 → 블러 → 이력 임계값 → 비최대 억제', '블러 → 그래디언트 → 비최대 억제 → 이력 임계값', '이력 임계값 → 블러 → 그래디언트 → 비최대 억제', '비최대 억제 → 블러 → 그래디언트 → 이력 임계값'], answer: 1,
      explain: '① 가우시안 블러(잡음 제거) → ② Sobel 그래디언트(크기 · 방향) → ③ 비최대 억제(1 px 두께로 얇게) → ④ 이력 임계값(두 임계값으로 연결된 에지 살리기). 이 중 ①은 함수 내부에서 <b>고정 크기</b>로 하므로 잡음이 심하면 밖에서 한 번 더 블러합니다.' },
    { q: 'Canny 의 두 임계값 비율로 일반적으로 권장되는 것은?', options: ['1:1', '1:2 ~ 1:3', '1:10 이상', '비율은 상관없다'], answer: 1,
      explain: '<code>threshold2 : threshold1 = 2:1 ~ 3:1</code> 이 관례입니다(예: 50/150). 비율이 너무 크면 약한 에지가 거의 살아나지 못해 끊기고, 1:1 이면 이력(hysteresis)의 장점이 사라져 단일 임계값과 같아집니다.' },
    { q: '<code>Cv2.Canny</code> 의 출력 Mat 의 형식과 값은?', options: ['CV_16S, 음수 포함', 'CV_32F, 0~1', '<b>CV_8UC1, 0 또는 255</b>', '입력과 같은 형식'], answer: 2,
      explain: 'Canny 의 결과는 항상 <b>1채널 8비트 이진 영상</b>(0 또는 255)이고 선 두께가 1 px 입니다. 그래서 <code>Cv2.FindContours</code> · <code>Cv2.HoughLinesP</code> 의 입력으로 바로 쓸 수 있습니다.' },
    { q: '잡음이 많은 영상에 Canny 를 쓸 때 가장 먼저 할 일은?', options: ['threshold1 을 0 으로 낮추기', '<code>GaussianBlur</code> 로 전처리하기', 'apertureSize 를 1 로 줄이기', '컬러로 읽기'], answer: 1,
      explain: 'Canny 내부 블러는 고정이라 σ=15 수준의 잡음에는 부족합니다. <code>GaussianBlur(3~7)</code> 로 전처리하면 가짜 에지가 크게 줄어듭니다(이 차시 예제에서 4% → 1% 수준). 임계값을 함께 올리는 것도 방법입니다.' },
    { q: '회색 영상 위에 에지를 <b>빨간색</b>으로 겹쳐 보려면?', options: ['<code>Cv2.AddWeighted(gray, 1, edges, 1, 0, dst)</code>', 'GRAY2BGR 로 3채널로 바꾼 뒤 <code>dst.SetTo(new Scalar(0,0,255), edges)</code>', '<code>Cv2.Merge</code> 로 에지를 R 채널에 넣기', '<code>Cv2.ApplyColorMap(edges, dst, ColormapTypes.Hot)</code>'], answer: 1,
      explain: '회색 영상은 1채널이라 색을 칠할 수 없으므로 먼저 <code>ColorConversionCodes.GRAY2BGR</code> 로 3채널로 바꿉니다. 그다음 <code>SetTo(색, 마스크)</code> 에 에지 영상을 <b>마스크</b>로 주면 에지 자리만 그 색이 됩니다. BGR 이므로 빨강은 <code>(0, 0, 255)</code> 입니다.' }
  ];

  CS_COURSE.addChapter({
    id: 'cs10', no: '10', title: '에지 검출: Sobel · Laplacian · Canny', subtitle: '밝기 변화를 미분으로 찾기 · 그래디언트 크기와 방향 · 이력 임계값',
    summary: '에지(Edge)는 <b>밝기가 급하게 변하는 곳</b>입니다. 1차 미분(<code>Cv2.Sobel</code> · <code>Cv2.Scharr</code>)으로 변화량을, 2차 미분(<code>Cv2.Laplacian</code>)으로 영교차를 찾고, 네 단계로 이루어진 <code>Cv2.Canny</code> 로 두께 1 px 의 깔끔한 이진 에지 영상을 얻습니다. 이 결과가 다음 차시의 윤곽선 · 허프 변환의 입력이 됩니다.',
    goals: [
      '에지가 1차 미분의 극값이라는 것을 프로파일 숫자로 설명할 수 있다',
      'Cv2.Sobel 을 CV_16S 로 받고 ConvertScaleAbs · AddWeighted 로 합칠 수 있다',
      '그래디언트 크기 · 방향(Magnitude · CartToPolar)을 계산하고 Laplacian 의 잡음 민감성을 안다',
      'Canny 의 네 단계와 두 임계값의 역할을 설명하고 전처리 블러의 효과를 수치로 비교할 수 있다'
    ],
    wpf: 'Ch17_Inspection',
    sections: [
      {
        id: 'cs10-1', title: '미분으로 에지 찾기: Sobel · Scharr · Laplacian', minutes: 50,
        goals: ['밝기 프로파일의 차분에서 에지 위치를 찾을 수 있다', 'Sobel 을 CV_16S → ConvertScaleAbs → AddWeighted 순서로 올바르게 쓸 수 있다', '그래디언트 크기 · 방향을 구하고 Laplacian 앞에 블러가 필요한 이유를 설명할 수 있다'],
        flow: [['도입: 에지란 무엇인가', 6], ['프로파일과 차분', 12], ['Sobel · Scharr', 16], ['크기 · 방향 · Laplacian', 11], ['정리 · 퀴즈', 5]],
        content: [
          { type: 'h', text: '에지 = 밝기가 급하게 변하는 곳' },
          { type: 'p', html: '사람이 물체의 “윤곽”을 보는 것은 결국 <b>밝기가 갑자기 바뀌는 자리</b>를 보는 것입니다. 이진화(07차시)는 “밝기가 어느 값보다 큰가”를 물었지만, 에지 검출은 “<b>밝기가 얼마나 빨리 바뀌는가</b>”를 묻습니다. 그래서 조명이 전체적으로 밝아지거나 어두워져도 에지 위치는 거의 변하지 않습니다 — 치수 측정 · 위치 정렬에 에지를 쓰는 이유입니다.' },
          { type: 'figure', html: FIG_PROFILE, caption: '그림 1. 밝기 f(x) 가 계단처럼 바뀌는 곳에서 1차 미분은 극값, 2차 미분은 부호가 바뀐다(영교차)' },
          { type: 'p', html: '디지털 영상에서 미분은 <b>차분(difference)</b>으로 계산합니다. 가장 간단한 중앙 차분은 f′(x) ≈ f(x+1) − f(x−1) 입니다. 이 값의 절대값이 가장 큰 자리가 에지입니다.' },
          { type: 'code', title: '예제 1: 한 줄의 밝기와 차분으로 에지 위치 찾기', code: EX_PROFILE,
            desc: '<code>bracket_edges.png</code> 는 백라이트로 찍은 3.5° 기울어진 판입니다(배경 밝음 · 판 어두움). y = 241 행의 왼쪽 에지 정답은 서브픽셀로 <b>x = 128.227</b> 입니다. 정수 차분만으로도 1 px 안에서 찾아집니다. 이렇게 한 줄(1D 프로파일)을 따라 에지를 찾는 방법을 산업 비전에서 <b>캘리퍼(caliper)</b> 라고 부르며, 15차시 · 17차시에서 다시 씁니다. 차분이 <b>음수</b>인 것도 눈여겨보세요 — 밝음 → 어두움이라는 <b>극성(polarity)</b> 정보입니다.',
            expect: 'x    f(x)  f(x+1)-f(x-1)\n122   216      -2\n123   214      -4\n124   212      -5\n125   209      -4\n126   208     -13\n127   196     -67\n128   141    -135\n129    61    -110\n130    31     -34\n131    27      -3\n132    28       1\n133    28       0\n134    28      -1\n135    27      -1\n136    27       0\n변화가 가장 큰 위치 x = 128 (차분 -135)\n정답(서브픽셀) 왼쪽 에지 = x 128.227 → 정수 차분으로도 1 px 안에 들어온다' },
          { type: 'callout', kind: 'tip', title: '왜 미분이 “필터”인가', html: 'f(x+1) − f(x−1) 은 커널 <code>[-1, 0, 1]</code> 로 컨볼루션한 것과 같습니다 — 08차시에서 배운 <code>Cv2.Filter2D</code> 그대로입니다. 실습에서 만들었던 <code>[-1 0 1; -2 0 2; -1 0 1]</code> 커널이 바로 <b>Sobel</b> 입니다. 에지 검출은 새로운 것이 아니라 <b>특별한 커널</b>일 뿐입니다.' },
          { type: 'h', text: 'Cv2.Sobel: 방향별 1차 미분' },
          { type: 'figure', html: FIG_SOBELK, caption: '그림 2. Sobel 커널은 [-1 0 1] 미분과 [1 2 1] 블러를 합친 것. Scharr 는 3×3 에서 가장 정확하다' },
          { type: 'table', head: ['인수', '뜻', '주의'], rows: [
            ['<code>ddepth</code>', '결과 형식', '<b><code>MatType.CV_16S</code></b> 또는 <code>CV_32FC1</code> — 음수를 담아야 한다'],
            ['<code>dx</code>, <code>dy</code>', '미분 차수', '<code>(1, 0)</code> = 세로 에지, <code>(0, 1)</code> = 가로 에지. 둘 다 1 은 잘 안 쓴다'],
            ['<code>ksize</code>', '커널 크기', '1 · 3 · 5 · 7 (홀수). <b>−1 이면 Scharr</b>'],
            ['<code>scale</code>, <code>delta</code>', '배율 · 더할 값', '보기 좋게 만들 때 (예: delta 128)'],
            ['<code>borderType</code>', '경계 처리', '기본 <code>Reflect101</code> (08차시)']
          ], caption: '표 1. Cv2.Sobel(src, dst, ddepth, dx, dy, ksize, scale, delta, borderType)' },
          { type: 'code', title: '예제 2: Sobel 의 정석 — CV_16S → ConvertScaleAbs → AddWeighted', code: EX_SOBEL,
            desc: '네 단계를 그대로 외우세요. ① <code>MatType.CV_16S</code> 로 받아 <b>음수를 보존</b> ② <code>Cv2.ConvertScaleAbs</code> 로 절대값을 8비트로 ③ <code>Cv2.AddWeighted(ax, 0.5, ay, 0.5, 0, sum)</code> 으로 두 방향 합치기 ④ 확인. 마지막 줄이 중요합니다 — <code>MatType.CV_8UC1</code> 로 바로 받으면 0 이 아닌 픽셀이 <b>282489 → 143700</b> 으로 거의 절반이 됩니다. 밝기가 줄어드는 쪽 에지가 통째로 사라진 것입니다.',
            expect: 'gx 값 범위 = -568 ~ 590  (음수가 있다!)\n|gx| 평균 6.20, |gy| 평균 7.39\n합친 결과 평균 6.79\n0 이 아닌 픽셀: CV_16S+Abs 282489 vs CV_8U 143700' },
          { type: 'callout', kind: 'warn', title: '흔한 실수 세 가지', html: '<ul><li><b><code>ddepth</code> 에 CV_8U</b> → 음수 에지 소실. 반드시 <code>CV_16S</code> / <code>CV_32FC1</code>.</li><li><b><code>dx</code>, <code>dy</code> 순서</b> — <code>Cv2.Sobel(src, dst, ddepth, <u>dx</u>, <u>dy</u>, ksize)</code> 입니다. <code>(0, 1)</code> 을 <code>(1, 0)</code> 으로 잘못 쓰면 엉뚱한 방향이 나옵니다.</li><li><b>|gx| + |gy| 를 그냥 더하기</b> — 8비트에서 포화(255)되므로 <code>AddWeighted(ax, 0.5, ay, 0.5, 0, dst)</code> 처럼 절반씩 섞거나, 정확히 하려면 <code>CV_32F</code> + <code>Cv2.Magnitude</code> 를 쓰세요.</li></ul>' },
          { type: 'code', title: '예제 3: Sobel 커널 크기와 Scharr 비교', code: EX_SCHARR,
            desc: '커널이 커지면 값의 범위가 커지고 에지가 두꺼워집니다(잡음에는 강해집니다). <code>Cv2.Scharr</code> 는 <code>Cv2.Sobel(..., ksize: -1)</code> 과 같고, 계수가 (3, 10, 3) 이라 3×3 에서 <b>회전 대칭성이 가장 좋습니다</b> — 방향을 정확히 재야 할 때(각도 측정 · 그래디언트 방향) 유리합니다. 값의 절대 크기는 커널마다 다르므로(평균 |g| 가 8.94 → 44.39 → 16.22) <b>임계값을 커널과 함께 바꿔야</b> 한다는 점도 기억하세요.',
            expect: 'Sobel 3x3 : 범위    -772 ~ 894     평균|g| 8.94\nSobel 5x5 : 범위   -8832 ~ 10760   평균|g| 44.39\nScharr    : 범위   -3088 ~ 3574    평균|g| 16.22\n커널이 크면 값이 커지고 두꺼워진다 / Scharr 는 3x3 에서 가장 정확하다' },
          { type: 'h', text: '그래디언트의 크기와 방향' },
          { type: 'p', html: 'gx 와 gy 를 한 쌍의 벡터로 보면 <b>크기</b> |g| = √(gx² + gy²) 는 “에지가 얼마나 뚜렷한가”, <b>방향</b> θ = atan2(gy, gx) 는 “에지를 가로지르는 방향”을 알려 줍니다. 이 두 값이 Canny 와 허프 변환의 재료입니다.' },
          { type: 'figure', html: FIG_GRAD, caption: '그림 3. 그래디언트 벡터는 에지에 수직이다. 크기는 Magnitude, 방향은 CartToPolar 로 얻는다' },
          { type: 'code', title: '예제 4: Magnitude · CartToPolar 로 크기와 방향', code: EX_MAG,
            desc: '크기 · 방향 계산은 실수 연산이므로 <code>MatType.CV_32FC1</code> 로 받습니다. <code>Cv2.CartToPolar(gx, gy, mag, ang, true)</code> 의 마지막 인수가 <code>true</code> 면 방향이 <b>도(degree)</b> 단위(0~360)로 나옵니다. 값을 읽어 보세요: 왼쪽 에지는 <b>176.5°</b>(= 180° − 3.5°), 위쪽 에지는 <b>267.1°</b>(≈ 270° − 3°) — 판이 반시계로 3.5° 기울어진 만큼 에지 법선도 정확히 돌아가 있습니다. 그래디언트는 <b>어두운 쪽 → 밝은 쪽</b>을 가리키므로 왼쪽 에지에서는 왼쪽(180°)을 향합니다. 실수형 Mat 은 <code>Cv2.ImShow</code> 로 바로 보기 어려우니 <code>Cv2.Normalize(..., 0, 255, NormTypes.MinMax)</code> → <code>ConvertTo(dst, MatType.CV_8UC1)</code> 로 바꿔서 봅니다.',
            expect: '그래디언트 크기 범위 = 0.0 ~ 590.8\n왼쪽 에지 (128, 241) : 크기 542.0, 방향 176.5도\n위쪽 에지 (320, 156) : 크기 573.7, 방향 267.1도\n판이 반시계로 3.5도 기울어져 있으므로 에지 법선도 그만큼 돌아간다' },
          { type: 'h', text: 'Cv2.Laplacian: 2차 미분' },
          { type: 'p', html: '라플라시안은 x · y 두 방향의 2차 미분을 더한 값(∂²f/∂x² + ∂²f/∂y²)입니다. 방향에 무관한 <b>하나의 값</b>이 나오고, 에지에서 <b>부호가 바뀌는 자리(영교차, zero-crossing)</b> 가 에지 위치입니다. 3×3 커널은 <code>[0 1 0; 1 −4 1; 0 1 0]</code> 입니다.' },
          { type: 'code', title: '예제 5: Laplacian 과 잡음 — 블러가 필수다', code: EX_LAPLACIAN,
            desc: '평균 |L| 값을 보세요. 깨끗한 영상은 <b>9.06</b> 인데 잡음 영상은 블러 없이 라플라시안을 걸면 <b>107.05</b> — 거의 12배로 튑니다. 에지가 아니라 잡음을 본 것입니다. <code>GaussianBlur(5×5)</code> 를 먼저 하면 <b>16.41</b> 로 내려와 깨끗한 영상에 가까워집니다. 이 “블러 + 라플라시안” 조합을 <b>LoG(Laplacian of Gaussian)</b> 라고 부릅니다. 결과 창의 두 이미지를 비교하면 차이가 확연합니다.',
            expect: '깨끗한 영상        : 평균|L| 9.06\n잡음 영상 (블러 X) : 평균|L| 107.05\n잡음 영상 (블러 O) : 평균|L| 16.41' },
          { type: 'table', head: ['방법', '차수', '특징', '언제 쓰나'], rows: [
            ['<code>Cv2.Sobel</code>', '1차', '방향별, 잡음에 비교적 강함', '그래디언트 크기 · 방향, Canny 의 재료'],
            ['<code>Cv2.Scharr</code>', '1차', '3×3 에서 가장 정확', '각도 · 방향을 정밀하게 재야 할 때'],
            ['<code>Cv2.Laplacian</code>', '2차', '방향 무관, 잡음에 매우 민감', '초점(focus) 측정, 영교차 에지, 블러 검사'],
            ['<code>MorphTypes.Gradient</code>', '-', '팽창 − 침식 (09차시)', '이진 영상의 테두리만 빠르게'],
            ['<code>Cv2.Canny</code>', '1차 + 후처리', '1 px 이진 에지 (2교시)', '윤곽선 · 허프 변환의 입력']
          ], caption: '표 2. 에지 검출 방법 비교' },
          { type: 'callout', kind: 'more', title: '📘 라플라시안으로 초점 맞추기', html: '카메라 초점이 잘 맞은 영상은 에지가 뚜렷해 라플라시안의 <b>분산(variance)</b> 이 큽니다. 그래서 <code>Cv2.Laplacian</code> 결과의 분산을 자동 초점 · 흐림 검사 지표로 많이 씁니다. <code>Cv2.MeanStdDev(lap, out _, out Scalar sd)</code> 의 <code>sd.Val0 * sd.Val0</code> 이 그 값입니다. 값이 작으면 “초점 불량” 으로 판정합니다.' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: '에지 영상은 <b>회색 1채널</b>이므로 <code>BitmapSourceConverter.ToBitmapSource</code> 로 바로 표시할 수 있습니다. 다만 사용자는 “원본 어디에 에지가 있는지”를 보고 싶어 하므로, 2교시에서 배울 <b>GRAY2BGR + SetTo(빨강, 마스크)</b> 오버레이로 보여 주는 것이 훨씬 친절합니다.' }
        ],
        practice: [
          {
            title: '프로파일 차분으로 판의 폭 재기', level: 2,
            desc: '<code>images/bracket_edges.png</code> 의 <b>열 x = 320</b>(세로 한 줄)을 따라가며 <code>f(y+1) − f(y−1)</code> 차분을 계산하고, 차분이 가장 큰 곳(위 에지)과 가장 작은 곳(아래 에지)의 y 를 찾아 <b>두 에지 사이 거리</b>를 출력하세요. 정답은 위 에지 y = 156.056, 아래 에지 y = 326.373, 거리 170.318 px 입니다.',
            hint: 'y 를 10 부터 469 까지 돌면서 <code>int d = img.At&lt;byte&gt;(y + 1, 320) - img.At&lt;byte&gt;(y - 1, 320);</code> 를 계산합니다. 배경이 밝고 판이 어두우므로 위 에지에서는 d 가 <b>음수로 가장 크고</b>(밝음 → 어두움), 아래 에지에서는 <b>양수로 가장 큽니다</b>. <code>Math.Abs</code> 를 쓰지 말고 최대 · 최소를 따로 찾으세요.',
            expect: '위 에지 y = 156 (차분 -144), 아래 에지 y = 326 (차분 141)\n세로 거리 = 170 px\n정답 170.318 px 과의 차이 = 0.318 px\n정수 픽셀만으로는 1 px 이내, 서브픽셀 보간을 쓰면 0.1 px 이내까지 간다',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
        int x = 320;
        int minD = 0, maxD = 0, minY = 0, maxY = 0;

        for (int y = 10; y < img.Rows - 10; y++)
        {
            int d = img.At<byte>(y + 1, x) - img.At<byte>(y - 1, x);
            // TODO: d 가 가장 작을 때(위 에지)와 가장 클 때(아래 에지)의 y 를 기억하세요
        }

        Console.WriteLine($"위 에지 y = {minY}, 아래 에지 y = {maxY}");
        // TODO: 두 에지 사이 거리를 출력하고 정답 170.318 과 비교하세요
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
        int x = 320;
        int minD = 0, maxD = 0, minY = 0, maxY = 0;

        for (int y = 10; y < img.Rows - 10; y++)
        {
            int d = img.At<byte>(y + 1, x) - img.At<byte>(y - 1, x);
            if (d < minD) { minD = d; minY = y; }     // 밝음 → 어두움 = 위 에지
            if (d > maxD) { maxD = d; maxY = y; }     // 어두움 → 밝음 = 아래 에지
        }

        Console.WriteLine($"위 에지 y = {minY} (차분 {minD}), 아래 에지 y = {maxY} (차분 {maxD})");
        Console.WriteLine($"세로 거리 = {maxY - minY} px");
        Console.WriteLine($"정답 170.318 px 과의 차이 = {Math.Abs((maxY - minY) - 170.318):F3} px");
        Console.WriteLine("정수 픽셀만으로는 1 px 이내, 서브픽셀 보간을 쓰면 0.1 px 이내까지 간다");
    }
}`
          },
          {
            title: 'Sobel 로 만든 에지 영상을 이진화해 보기', level: 2,
            desc: '<code>images/bracket_edges.png</code> 에 Sobel x · y 를 적용해 <code>Cv2.Magnitude</code> 로 크기를 구하고, 0~255 로 정규화한 뒤 임계값 <b>60 · 120 · 180</b> 으로 이진화해 각각의 에지 픽셀 수를 출력하세요. 2교시의 Canny 결과(1316개)와 비교해 <b>Sobel + 임계값의 한계</b>(선이 두껍고, 임계값을 올리면 끊긴다)를 확인하세요.',
            hint: '<code>Cv2.Sobel(img, gx, MatType.CV_32FC1, 1, 0, 3)</code> · <code>Cv2.Magnitude(gx, gy, mag)</code> → <code>Cv2.Normalize(mag, norm, 0, 255, NormTypes.MinMax)</code> → <code>norm.ConvertTo(disp, MatType.CV_8UC1)</code> → <code>Cv2.Threshold(disp, bin, t, 255, ThresholdTypes.Binary)</code>. 같은 판의 에지인데 픽셀 수가 Canny 의 2~3배라면 그만큼 선이 두껍다는 뜻입니다.',
            expect: '임계값  60 : 에지 픽셀   4612개\n임계값 120 : 에지 픽셀   3257개\n임계값 180 : 에지 픽셀   2251개\n참고: Canny(50,150) 에지 픽셀 1316개 (두께 1 px)',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
        using var gx = new Mat();
        using var gy = new Mat();
        Cv2.Sobel(img, gx, MatType.CV_32FC1, 1, 0, 3);
        Cv2.Sobel(img, gy, MatType.CV_32FC1, 0, 1, 3);

        using var mag = new Mat();
        Cv2.Magnitude(gx, gy, mag);
        // TODO: 0~255 로 정규화하고 8비트로 바꾸세요
        using var disp = new Mat();

        // TODO: 임계값 60 · 120 · 180 으로 이진화해 에지 픽셀 수를 출력하세요
        Cv2.ImShow("magnitude", mag);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
        using var gx = new Mat();
        using var gy = new Mat();
        Cv2.Sobel(img, gx, MatType.CV_32FC1, 1, 0, 3);
        Cv2.Sobel(img, gy, MatType.CV_32FC1, 0, 1, 3);

        using var mag = new Mat();
        Cv2.Magnitude(gx, gy, mag);
        using var norm = new Mat();
        using var disp = new Mat();
        Cv2.Normalize(mag, norm, 0, 255, NormTypes.MinMax);
        norm.ConvertTo(disp, MatType.CV_8UC1);

        int[] ts = new int[] { 60, 120, 180 };
        foreach (int t in ts)
        {
            using var bin = new Mat();
            Cv2.Threshold(disp, bin, t, 255, ThresholdTypes.Binary);
            Console.WriteLine($"임계값 {t,3} : 에지 픽셀 {Cv2.CountNonZero(bin),6}개");
            Cv2.ImShow("sobel > " + t, bin);
        }
        using var canny = new Mat();
        Cv2.Canny(img, canny, 50, 150);
        Console.WriteLine($"참고: Canny(50,150) 에지 픽셀 {Cv2.CountNonZero(canny)}개 (두께 1 px)");
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '에지 검출 ① 미분으로 찾기', subtitle: 'Sobel · Scharr · Laplacian · 그래디언트 크기와 방향', notes: '<p>💬 “물체의 윤곽을 본다는 것은 무엇을 보는 것일까요?” — 밝기가 갑자기 바뀌는 자리. 09차시의 MorphTypes.Gradient 로 테두리를 얻었던 것을 떠올리게 하고, 오늘은 훨씬 정밀한 방법을 배운다고 예고합니다. (3분)</p>' },
          { layout: 'bullets', title: '왜 에지인가', lead: '이진화와 무엇이 다른가', bullets: [
            '이진화: “밝기가 임계값보다 큰가” → <b>조명이 바뀌면 결과가 바뀐다</b>',
            '에지: “밝기가 얼마나 빨리 바뀌는가” → <b>조명 변화에 둔감</b>',
            '치수 측정 · 위치 정렬 · 각도 측정의 기본 도구',
            ['에지 결과로 무엇을 하나', ['윤곽선 찾기 (12차시)', '직선 · 원 검출 (13차시)', '캘리퍼 측정 (17차시)']]
          ], notes: '<p>현장 예: 백라이트 조명이 노후로 어두워져도 에지 위치는 거의 안 변한다 → 측정 안정성. 이 차시가 Part 3 전체의 입구라는 점을 강조합니다. (4분)</p>' },
          { layout: 'diagram', title: '에지 = 1차 미분의 극값', html: FIG_PROFILE, caption: '계단 프로파일 → 1차 미분 극값 · 2차 미분 영교차', notes: '<p>그래프 세 개를 위에서 아래로 짚습니다. 💬 “1차 미분이 가장 큰 곳과 2차 미분이 0 이 되는 곳은 어디인가요?” — 같은 자리. 2차 미분 쪽은 잡음에 민감하다는 복선을 깔아 둡니다. (6분)</p>' },
          { layout: 'code', title: '한 줄의 차분으로 에지 찾기', code: `using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
Console.WriteLine("x    f(x)  f(x+1)-f(x-1)");
int bestX = 0, bestD = 0;
for (int x = 122; x <= 136; x++)
{
    int v = img.At<byte>(241, x);
    int d = img.At<byte>(241, x + 1) - img.At<byte>(241, x - 1);
    Console.WriteLine($"{x,-4} {v,4}  {d,6}");
    if (Math.Abs(d) > Math.Abs(bestD)) { bestD = d; bestX = x; }
}
Console.WriteLine($"변화가 가장 큰 x = {bestX} (차분 {bestD})");
Console.WriteLine("정답(서브픽셀) = 128.227");`, points: ['차분 = 커널 <code>[-1, 0, 1]</code> 컨볼루션', '밝음 → 어두움이므로 차분이 <b>음수</b>', '정수 픽셀만으로도 1 px 이내'], notes: '<p>출력 표를 함께 읽으며 어느 줄에서 값이 급히 떨어지는지 손으로 짚습니다. 이 1D 프로파일 방식이 산업 비전의 <b>캘리퍼</b> 라고 이름을 알려 줍니다. (7분)</p>' },
          { layout: 'diagram', title: 'Sobel 커널', html: FIG_SOBELK, caption: '[-1 0 1] 미분 × [1 2 1] 블러 — Scharr 는 (3, 10, 3)', notes: '<p>08차시 실습에서 직접 만든 커널이 바로 이것이라고 연결합니다. 💬 “가운데 줄에 2 를 주는 이유는?” — 가까운 줄을 더 믿는다 = 블러 효과. ⚠ 결과에 음수가 있다는 점을 여기서 예고합니다. (5분)</p>' },
          { layout: 'code', title: 'Sobel 의 정석 4단계', code: `using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
using var gx16 = new Mat();
using var gy16 = new Mat();
Cv2.Sobel(img, gx16, MatType.CV_16S, 1, 0, 3);   // 세로 에지
Cv2.Sobel(img, gy16, MatType.CV_16S, 0, 1, 3);   // 가로 에지
Cv2.MinMaxLoc(gx16, out double lo, out double hi);
Console.WriteLine($"gx 범위 {lo} ~ {hi} (음수!)");

using var ax = new Mat();
using var ay = new Mat();
Cv2.ConvertScaleAbs(gx16, ax);
Cv2.ConvertScaleAbs(gy16, ay);
using var sum = new Mat();
Cv2.AddWeighted(ax, 0.5, ay, 0.5, 0, sum);

using var bad = new Mat();
Cv2.Sobel(img, bad, MatType.CV_8UC1, 1, 0, 3);   // 나쁜 예
Console.WriteLine($"0 아닌 픽셀: {Cv2.CountNonZero(ax)} vs CV_8U {Cv2.CountNonZero(bad)}");
Cv2.ImShow("sobel x+y", sum);
Cv2.WaitKey(0);`, points: ['① <code>CV_16S</code> ② <code>ConvertScaleAbs</code> ③ <code>AddWeighted(0.5, 0.5)</code>', 'CV_8U 로 받으면 한쪽 에지가 사라진다', '<code>dx, dy</code> 순서 주의'], notes: '<p>마지막 두 숫자의 차이가 이 슬라이드의 핵심입니다. 💬 “왜 CV_8U 쪽이 적게 나올까요?” — 음수가 0 으로 잘렸다. 학생들에게 <code>ImShow</code> 로 <code>bad</code> 도 띄워 한쪽만 보이는 것을 확인시킵니다. (8분)</p>' },
          { layout: 'code', title: 'Sobel 크기 · Scharr 비교', code: `using var img = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
using var s3 = new Mat();
using var s5 = new Mat();
using var sc = new Mat();
Cv2.Sobel(img, s3, MatType.CV_16S, 1, 0, 3);
Cv2.Sobel(img, s5, MatType.CV_16S, 1, 0, 5);
Cv2.Scharr(img, sc, MatType.CV_16S, 1, 0);       // = Sobel(ksize: -1)

string[] names = new string[] { "Sobel 3", "Sobel 5", "Scharr " };
Mat[] mats = new Mat[] { s3, s5, sc };
for (int i = 0; i < 3; i++)
{
    using var abs8 = new Mat();
    Cv2.ConvertScaleAbs(mats[i], abs8);
    Console.WriteLine($"{names[i]} 평균|g| {Cv2.Mean(abs8).Val0:F2}");
    Cv2.ImShow(names[i].Trim(), abs8);
}
Cv2.WaitKey(0);`, points: ['커널이 크면 값 ↑ · 에지 두꺼워짐 · 잡음에 강함', 'Scharr = 3×3 에서 가장 정확 (회전 대칭)', '방향 · 각도를 재려면 Scharr'], notes: '<p>결과 창에서 가는 세로선 6개가 커널 크기에 따라 어떻게 번지는지 보여 줍니다. 💬 “각도를 0.1° 단위로 재야 한다면?” — Scharr. (5분)</p>' },
          { layout: 'diagram', title: '크기와 방향', html: FIG_GRAD, caption: '|g| = √(gx²+gy²), θ = atan2(gy, gx) — 에지에 수직', notes: '<p>벡터 그림으로 “그래디언트는 에지에 수직”을 각인시킵니다. 💬 “에지 자체의 방향은?” — θ + 90°. Canny 의 비최대 억제가 이 방향을 쓴다고 예고합니다. (4분)</p>' },
          { layout: 'code', title: 'Magnitude · CartToPolar', code: `using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
using var gx = new Mat();
using var gy = new Mat();
Cv2.Sobel(img, gx, MatType.CV_32FC1, 1, 0, 3);
Cv2.Sobel(img, gy, MatType.CV_32FC1, 0, 1, 3);

using var mag = new Mat();
Cv2.Magnitude(gx, gy, mag);
using var mag2 = new Mat();
using var ang = new Mat();
Cv2.CartToPolar(gx, gy, mag2, ang, true);        // true = 도 단위

Console.WriteLine($"왼쪽 에지 (128,241) 크기 {mag.At<float>(241, 128):F1}, 방향 {ang.At<float>(241, 128):F1}도");
Console.WriteLine($"위쪽 에지 (320,156) 크기 {mag.At<float>(156, 320):F1}, 방향 {ang.At<float>(156, 320):F1}도");

using var norm = new Mat();
using var disp = new Mat();
Cv2.Normalize(mag, norm, 0, 255, NormTypes.MinMax);
norm.ConvertTo(disp, MatType.CV_8UC1);
Cv2.ImShow("magnitude", disp);
Cv2.WaitKey(0);`, points: ['크기 · 방향은 <code>CV_32FC1</code> 로', '<code>CartToPolar(..., true)</code> → 0~360도', '실수 Mat 은 Normalize + ConvertTo 해서 본다'], notes: '<p>판이 3.5° 기울어져 있으니 방향도 그만큼 돌아간다는 점을 계산으로 확인합니다. 💬 “왼쪽 에지와 위쪽 에지의 방향 차이는 몇 도일까?” — 약 90°. (6분)</p>' },
          { layout: 'code', title: 'Laplacian 과 잡음', code: `using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);

using var l1 = new Mat();
using var a1 = new Mat();
Cv2.Laplacian(noisy, l1, MatType.CV_16S, 3);
Cv2.ConvertScaleAbs(l1, a1);
Console.WriteLine($"잡음 + 블러 X : 평균|L| {Cv2.Mean(a1).Val0:F2}");

using var blurred = new Mat();
Cv2.GaussianBlur(noisy, blurred, new Size(5, 5), 0);
using var l2 = new Mat();
using var a2 = new Mat();
Cv2.Laplacian(blurred, l2, MatType.CV_16S, 3);
Cv2.ConvertScaleAbs(l2, a2);
Console.WriteLine($"잡음 + 블러 O : 평균|L| {Cv2.Mean(a2).Val0:F2}");
Cv2.ImShow("no blur", a1);
Cv2.ImShow("blur + laplacian", a2);
Cv2.WaitKey(0);`, points: ['2차 미분 = 잡음을 두 번 증폭', '블러 → 라플라시안 = <b>LoG</b>', '분산은 초점(흐림) 검사 지표로도 쓴다'], notes: '<p>두 결과 이미지를 나란히 보여 주면 충격적으로 다릅니다. 💬 “Canny 는 왜 블러가 첫 단계일까요?” — 같은 이유. 2교시로 자연스럽게 넘어갑니다. (6분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>Cv2.Sobel</code> 결과를 <code>MatType.CV_8UC1</code> 로 받으면?', options: ['속도가 느려진다', '음수 그래디언트가 0 으로 잘린다', '커널이 커진다', '채널 수가 바뀐다'], answer: 1, explain: '밝기가 줄어드는 에지는 음수입니다. CV_16S 로 받고 ConvertScaleAbs 로 절대값을 8비트로 바꾸세요.', notes: '<p>정답 2번. 예제 2 의 마지막 숫자 비교를 다시 보여 줍니다. (2분)</p>' },
          { layout: 'practice', title: '실습: 프로파일로 판의 폭 재기', desc: '<p>열 x = 320 을 따라 차분을 계산해 위 · 아래 에지를 찾고 거리를 출력하세요.</p><ul><li>위 에지: 차분이 <b>가장 작은</b>(음수) 곳</li><li>아래 에지: 차분이 <b>가장 큰</b> 곳</li><li>정답 170.318 px</li></ul>', starter: `using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
int x = 320;
int minD = 0, maxD = 0, minY = 0, maxY = 0;
for (int y = 10; y < img.Rows - 10; y++)
{
    int d = img.At<byte>(y + 1, x) - img.At<byte>(y - 1, x);
    // TODO: 최소 · 최대 위치를 기억하세요
}
Console.WriteLine($"위 {minY}, 아래 {maxY}");`, solution: `using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
int x = 320;
int minD = 0, maxD = 0, minY = 0, maxY = 0;
for (int y = 10; y < img.Rows - 10; y++)
{
    int d = img.At<byte>(y + 1, x) - img.At<byte>(y - 1, x);
    if (d < minD) { minD = d; minY = y; }
    if (d > maxD) { maxD = d; maxY = y; }
}
Console.WriteLine($"위 에지 y = {minY} (차분 {minD}), 아래 에지 y = {maxY} (차분 {maxD})");
Console.WriteLine($"세로 거리 = {maxY - minY} px (정답 170.318)");`, notes: '<p>부호로 에지의 <b>극성</b>(밝음→어두움 / 어두움→밝음)을 구분하는 것이 요령입니다. <code>Math.Abs</code> 를 쓰면 두 에지를 구분할 수 없다는 점을 짚어 주세요. 서브픽셀 보간은 17차시에서 다룹니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['에지 = 밝기의 <b>1차 미분이 극값</b>인 곳 (2차 미분은 영교차)', '<code>Cv2.Sobel</code>: <b>CV_16S</b> → <code>ConvertScaleAbs</code> → <code>AddWeighted(0.5, 0.5)</code>', '<code>dx=1</code> 세로 에지 / <code>dy=1</code> 가로 에지, <code>ksize: -1</code> = Scharr', '크기 <code>Cv2.Magnitude</code> · 방향 <code>Cv2.CartToPolar(..., true)</code> — CV_32F 로', '<code>Cv2.Laplacian</code> 은 잡음에 민감 → 반드시 <b>GaussianBlur 먼저</b>', '다음 교시: 이 재료들을 조합한 <b>Cv2.Canny</b> — 두께 1 px 의 이진 에지'], notes: '<p>네 단계 순서(CV_16S → Abs → AddWeighted)를 소리 내어 따라하게 합니다. 다음 교시 예고: “Sobel 결과를 임계값으로 자르면 선이 두껍고 끊긴다. Canny 는 그 문제를 어떻게 풀까?” (2분)</p>' }
        ]
      },
      {
        id: 'cs10-2', title: 'Canny 에지 검출: 4단계와 두 임계값', minutes: 50,
        goals: ['Canny 의 네 단계와 두 임계값의 역할을 설명할 수 있다', '임계값 비율 · 전처리 블러의 효과를 에지 픽셀 수로 비교할 수 있다', '에지를 원본 위에 색으로 겹쳐 보여 주고 다음 차시(윤곽선 · 허프)로 연결할 수 있다'],
        flow: [['도입: Sobel 의 한계', 6], ['Canny 4단계', 13], ['두 임계값 · 전처리', 15], ['오버레이 · 다음 차시 연결', 11], ['정리 · 퀴즈', 5]],
        content: [
          { type: 'h', text: 'Sobel 결과를 임계값으로 자르면 안 되나?' },
          { type: 'p', html: '1교시 실습에서 확인했듯이, 그래디언트 크기를 임계값으로 자르면 문제가 있습니다.' },
          { type: 'list', ordered: true, items: [
            '에지가 <b>두껍다</b> (3~5 px) — 정확한 위치를 알 수 없다',
            '임계값을 낮추면 <b>잡음 · 무늬</b>까지 에지가 된다',
            '임계값을 높이면 약한 에지가 <b>중간중간 끊긴다</b>',
            '결과가 회색이라 윤곽선 · 허프 변환에 바로 쓸 수 없다'
          ] },
          { type: 'p', html: '1986년 John Canny 는 이 문제들을 네 단계로 해결했습니다. 그래서 <code>Cv2.Canny</code> 는 지금도 <b>가장 널리 쓰이는 에지 검출기</b>입니다.' },
          { type: 'figure', html: FIG_CANNY, caption: '그림 4. Canny 의 네 단계. 결과는 항상 0/255 이진 영상이고 선 두께는 1 px' },
          { type: 'table', head: ['단계', '하는 일', '해결하는 문제'], rows: [
            ['① 가우시안 블러', '5×5 가우시안(내부 고정)', '잡음으로 생기는 가짜 에지'],
            ['② 그래디언트', 'Sobel 로 gx · gy → 크기 |g| 와 방향 θ', '에지의 세기와 방향을 안다'],
            ['③ 비최대 억제', '에지 방향(θ)으로 앞뒤 이웃과 비교해 가장 센 것만 남김', '<b>두꺼운 에지 → 1 px</b>'],
            ['④ 이력 임계값', 'threshold2 이상 = 확정, threshold1~threshold2 는 확정 에지와 이어졌을 때만 살림', '<b>끊김과 잡음을 동시에</b>']
          ], caption: '표 3. Canny 네 단계' },
          { type: 'code', title: '예제 1: Canny 기본 사용과 결과 확인', code: EX_CANNY,
            desc: '<code>Cv2.Canny(src, dst, threshold1, threshold2)</code> 한 줄입니다. 결과의 값 범위가 <b>0 ~ 255</b>, 형식이 <b>CV_8UC1</b> 인 것을 확인하세요 — 즉 이진 영상입니다. 판 둘레(380×170 → 약 1100 px)와 구멍 둘레(약 188 px)를 더하면 약 1290 px 인데, 실제 에지 픽셀은 <b>1316개</b> — 두께가 정확히 1 px 이라는 증거입니다. 이렇게 <b>기대값으로 검산</b>하는 습관이 현장에서 버그를 가장 빨리 잡아 줍니다.',
            expect: '에지 픽셀 1316개 / 전체 307200 = 0.43 %\n결과 값의 범위 = 0 ~ 255 (0 또는 255 뿐인 이진 영상)\n형식 = CV_8UC1, 채널 = 1\n정답: 판 둘레 약 1100 px + 구멍 둘레 약 188 px → 1 px 두께 에지와 비슷한 규모' },
          { type: 'h', text: '두 임계값: 이력(hysteresis)' },
          { type: 'figure', html: FIG_HYST, caption: '그림 5. threshold2 이상은 무조건, 그 아래 threshold1 이상은 강한 에지에 이어져 있을 때만 살린다' },
          { type: 'p', html: '이것이 Canny 의 가장 영리한 부분입니다. 임계값 하나만 쓰면 “살리면 잡음도 들어오고, 버리면 에지가 끊기는” 딜레마에 빠집니다. 두 개를 쓰면 <b>확실한 에지에서 출발해 약한 에지를 따라가며 이어 붙일</b> 수 있습니다. 관례는 <b>threshold2 : threshold1 = 2:1 ~ 3:1</b> 입니다.' },
          { type: 'code', title: '예제 2: 임계값에 따른 변화', code: EX_THRESH,
            desc: '<code>sample_color.png</code>(도형 10개가 놓인 트레이)를 회색으로 읽어 다섯 쌍의 임계값을 비교합니다. <b>(10, 30)</b> 은 트레이의 질감 · 그림자까지 에지로 잡아 <b>10942개</b>로 지저분하고, <b>(150, 300)</b> 은 <b>154개</b>만 남아 대비가 약한 도형의 에지가 거의 사라집니다. 중간 구간(30~100)에서는 개수가 완만하게 줄어드는데, 이 <b>완만한 구간</b>이 안정적으로 쓸 수 있는 범위입니다. 실무에서는 <b>(50, 150)</b> 부근에서 시작해 결과 창을 보며 조정합니다.',
            expect: 'Canny( 10,  30) 비율 1:3.0 → 에지  10942개 (3.56 %)\nCanny( 30,  90) 비율 1:3.0 → 에지   5594개 (1.82 %)\nCanny( 50, 150) 비율 1:3.0 → 에지   4889개 (1.59 %)\nCanny(100, 200) 비율 1:2.0 → 에지   4109개 (1.34 %)\nCanny(150, 300) 비율 1:2.0 → 에지    154개 (0.05 %)\n임계값이 낮으면 잡음 · 무늬까지, 높으면 약한 에지가 끊긴다' },
          { type: 'callout', kind: 'tip', title: '임계값을 자동으로 정하는 요령', html:'현장에서 자주 쓰는 방법 두 가지: ① <b>중간값 기준</b> — 영상 밝기 중간값 m 에 대해 <code>t1 = 0.66·m</code>, <code>t2 = 1.33·m</code> ② <b>Otsu 활용</b> — <code>Cv2.Threshold(..., Otsu)</code> 로 얻은 값 T 에 대해 <code>t1 = 0.5·T</code>, <code>t2 = T</code>. 어느 쪽이든 <b>조명이 바뀌면 다시 계산</b>해야 하므로, 고정 조명을 쓰는 검사 장비에서는 값을 <b>레시피에 고정</b>해 두는 편이 안정적입니다.' },
          { type: 'code', title: '예제 3: 전처리 블러가 있고 없고', code: EX_PRE,
            desc: 'Canny 내부 블러는 5×5 고정이라 σ=15 수준의 잡음에는 부족합니다. 블러 없이 <code>gradient_noise.png</code> 에 Canny 를 걸면 에지 픽셀이 <b>95910개(전체의 31%!)</b> — 깨끗한 원본(4725개)의 <b>20배</b>이고 대부분 잡음입니다. <code>GaussianBlur</code> 를 3 → 5 → 7 로 키우면 5115 → 4738 → 4715 개로 <b>깨끗한 원본 수준</b>까지 내려옵니다. 다만 너무 키우면 <b>가는 세로선 6개</b>의 에지도 사라지므로, 결과 창에서 “무엇이 남았는가”를 꼭 눈으로 확인하세요.',
            expect: '깨끗한 원본        : 에지   4725개 (1.54 %)\n잡음 영상 (블러 X) : 에지  95910개 (31.22 %)\n블러 3x3 후       : 에지   5115개 (1.67 %)\n블러 5x5 후       : 에지   4738개 (1.54 %)\n블러 7x7 후       : 에지   4715개 (1.53 %)' },
          { type: 'callout', kind: 'warn', title: 'Canny 사용 시 주의', html: '<ul><li><b>1채널 입력</b>이 기본입니다. 컬러는 <code>Cv2.CvtColor(..., BGR2GRAY)</code> 로 먼저 바꾸세요 (색으로만 구분되는 경계는 회색에서 사라질 수 있습니다 — 그때는 채널별 Canny 나 HSV 를 쓰세요).</li><li><b>threshold1 &lt; threshold2</b> 로 주세요. 뒤집어 주면 OpenCV 가 알아서 바꾸긴 하지만 의도가 흐려집니다.</li><li><b><code>apertureSize</code></b> 는 내부 Sobel 커널(3 · 5 · 7)입니다. 키우면 에지가 더 뭉툭해지고 잡음에 강해집니다.</li><li><b><code>L2gradient: true</code></b> 면 크기를 √(gx²+gy²) 로 정확히 계산합니다(기본은 |gx|+|gy|). 각도 · 정밀도가 중요하면 켜세요.</li></ul>' },
          { type: 'h', text: '에지를 원본 위에 겹쳐 보기' },
          { type: 'p', html: '에지 영상만 보면 “원본의 어디인지”를 알기 어렵습니다. 회색 원본을 3채널로 바꾸고 에지를 <b>마스크</b>로 써서 색을 칠하면 한눈에 보입니다. 검사 결과 화면의 기본 기법입니다.' },
          { type: 'code', title: '예제 4: GRAY2BGR + SetTo(색, 마스크) 오버레이', code: EX_OVERLAY,
            desc: '<code>Cv2.CvtColor(gray, overlay, ColorConversionCodes.GRAY2BGR)</code> 로 회색을 3채널로 복제하고, <code>overlay.SetTo(new Scalar(0, 0, 255), edges)</code> 로 <b>에지가 255 인 자리만</b> 빨강으로 칠합니다(BGR 이므로 빨강은 마지막 값). 컬러 영상도 같은 방법으로 자기 위에 에지를 겹칠 수 있습니다. 결과 창에서 칩 몸체 · 리드 16개 · 1번 핀 점의 윤곽이 빨갛게 드러나는지 확인하세요. 오버레이가 <b>CV_8UC3</b> 3채널이 된 것도 출력으로 확인합니다.',
            expect: '에지 픽셀 1013개\n오버레이 형식 CV_8UC3, 채널 3\nsample_color 에지 픽셀 4889개' },
          { type: 'code', title: '예제 5: 에지 영상은 다음 차시의 입력이다', code: EX_NEXT,
            desc: 'Canny 결과를 <code>Cv2.FindContoursAsArray</code>(12차시)와 <code>Cv2.HoughLinesP</code>(13차시)에 그대로 넣어 봅니다. 윤곽선 6개 중 길이 100 px 이상인 2개가 칩 몸체의 테두리이고, 가장 긴 것이 942 px 입니다(몸체 170×110 의 둘레 560 을 안쪽 · 바깥쪽으로 훑은 길이). 허프 변환으로 찾은 직선의 기울기는 <b>−23.0°</b> 로 나옵니다 — 정답 <b>+23.5°</b> 와 부호가 반대인 이유는 <b>영상의 y 축이 아래로 향하기 때문</b>입니다(화면 기준 반시계 = <code>atan2</code> 에서 음수). 오늘 만든 에지 영상 하나로 <b>개수 · 모양 · 각도</b>를 모두 얻을 수 있다는 것이 Part 3 의 예고편입니다.',
            expect: '에지에서 찾은 윤곽선 6개\n길이 100 px 이상인 윤곽선 2개, 가장 긴 것 942 px\nHoughLinesP 로 찾은 직선 5개 (다음 차시 예고)\n가장 먼저 찾은 직선의 기울기 = -23.0도 (칩은 23.5도 회전)' },
          { type: 'table', head: ['상황', '권장 설정'], rows: [
            ['깨끗한 백라이트 실루엣', '<code>Canny(50, 150)</code>, 블러 불필요'],
            ['잡음이 있는 정면 조명', '<code>GaussianBlur(5)</code> → <code>Canny(50, 150)</code>'],
            ['대비가 약한 결함 · 얼룩', '<code>Canny(20, 60)</code> + 면적 · 길이로 걸러내기'],
            ['각도 · 치수를 정밀하게', '<code>L2gradient: true</code>, 필요하면 Scharr 기반 그래디언트 직접 계산'],
            ['텍스처가 많은 배경', '임계값을 올리거나, 09차시 모폴로지로 배경 무늬를 먼저 지우기'],
            ['색으로만 구분되는 경계', 'HSV 채널 · <code>Cv2.InRange</code> 후 Canny (05차시)']
          ], caption: '표 4. 상황별 Canny 설정 출발점' },
          { type: 'code', title: '참고: 슬라이더로 Canny 임계값 조절 (WPF)', code: EX_WPF, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '두 슬라이더 값으로 <code>Cv2.Canny</code> 를 다시 호출하고, 오버레이까지 만들어 보여 줍니다. <code>if (t2 &lt; t1) t2 = t1 * 2;</code> 처럼 <b>대소 관계를 코드에서 보장</b>하는 것이 실무 습관입니다. 17차시 검사 프로젝트에서 이 화면을 완성합니다.' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: '임계값 두 개를 사용자가 만지게 하면 반드시 <b>threshold1 &lt; threshold2</b> 를 강제하세요(슬라이더 <code>Minimum</code>/<code>Maximum</code> 연동 또는 코드에서 보정). 그리고 실제 장비에서는 조정이 끝난 값을 <b>레시피 파일(JSON)</b> 에 저장해 다음 실행에서 그대로 쓰게 만듭니다 — 매번 다시 맞추는 장비는 현장에서 신뢰를 잃습니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도 · 평가', html: '<ul><li><b>준비</b>: 예제 2 는 이미지 창이 5개 열립니다. 미리 실행해 두고 (10,30) 과 (150,300) 두 장만 확대해 비교하는 것이 효율적입니다.</li><li><b>오개념 1</b>: “Canny 가 Sobel 보다 좋은 알고리즘” → Canny는 <b>Sobel 을 내부에서 쓰는</b> 파이프라인입니다. 목적이 다릅니다(회색 세기 vs 이진 에지).</li><li><b>오개념 2</b>: “임계값을 낮추면 에지를 더 잘 찾는다” → 잡음도 함께 늘어납니다. 예제 2 의 픽셀 수로 반박하세요.</li><li><b>오개념 3</b>: “Canny 앞에 블러는 필요 없다(내부에서 한다)” → 내부 블러는 고정 5×5 입니다. 예제 3 의 숫자로 반박.</li><li><b>오개념 4</b>: 에지 영상에 <code>SetTo</code> 로 색을 칠하려다 실패 → 1채널이라 안 됩니다. <b>GRAY2BGR 먼저</b>.</li><li><b>평가 루브릭</b>: ① Canny 네 단계를 순서대로 설명한다(25%) ② 두 임계값의 역할과 비율을 설명한다(25%) ③ 전처리 블러 효과를 수치로 비교한다(25%) ④ 오버레이로 결과를 보기 좋게 제시한다(25%).</li><li>💬 마무리 발문: “에지를 찾았는데, 이제 이 점들을 어떻게 ‘물체’로 묶을까?” — 윤곽선(12차시) · 허프 변환(13차시). 예제 5 를 실행해 예고편을 보여 주고 마칩니다.</li></ul>' }
        ],
        practice: [
          {
            title: 'Canny 임계값을 자동으로 정해 보기', level: 2,
            desc: '<code>images/chip_rotated.png</code> 에서 ① Otsu 임계값 T 를 구하고 <code>Canny(0.5·T, T)</code> ② 밝기 중간값 대신 평균 m 으로 <code>Canny(0.66·m, 1.33·m)</code> ③ 고정 <code>Canny(60, 180)</code> 세 가지를 비교해 에지 픽셀 수를 출력하세요. 어느 쪽이 칩 윤곽을 가장 깔끔하게 잡는지 결과 창에서 판단하세요.',
            hint: 'Otsu 값은 <code>double t = Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);</code> 의 <b>반환값</b>입니다. 평균은 <code>Cv2.Mean(gray).Val0</code>. 세 경우 모두 <code>GaussianBlur(5)</code> 로 전처리한 같은 영상을 쓰세요.',
            expect: 'Otsu 임계값 111, 평균 밝기 167.0\n① Otsu 기반 (56, 111) : 에지 2068개\n② 평균 기반 (110, 222) : 에지 802개\n③ 고정 (60, 180) : 에지 1013개',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/chip_rotated.png", ImreadModes.Grayscale);
        using var blur = new Mat();
        Cv2.GaussianBlur(gray, blur, new Size(5, 5), 0);

        using var bin = new Mat();
        double t = Cv2.Threshold(blur, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        double m = Cv2.Mean(blur).Val0;
        Console.WriteLine($"Otsu 임계값 {t:F0}, 평균 밝기 {m:F1}");

        // TODO: ① Otsu 기반 ② 평균 기반 ③ 고정(60,180) 으로 Canny 를 걸고
        //       각각의 에지 픽셀 수를 출력하세요
        using var e1 = new Mat();

        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/chip_rotated.png", ImreadModes.Grayscale);
        using var blur = new Mat();
        Cv2.GaussianBlur(gray, blur, new Size(5, 5), 0);

        using var bin = new Mat();
        double t = Cv2.Threshold(blur, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        double m = Cv2.Mean(blur).Val0;
        Console.WriteLine($"Otsu 임계값 {t:F0}, 평균 밝기 {m:F1}");

        using var e1 = new Mat();
        Cv2.Canny(blur, e1, 0.5 * t, t);
        Console.WriteLine($"① Otsu 기반 ({0.5 * t:F0}, {t:F0}) : 에지 {Cv2.CountNonZero(e1)}개");

        using var e2 = new Mat();
        Cv2.Canny(blur, e2, 0.66 * m, 1.33 * m);
        Console.WriteLine($"② 평균 기반 ({0.66 * m:F0}, {1.33 * m:F0}) : 에지 {Cv2.CountNonZero(e2)}개");

        using var e3 = new Mat();
        Cv2.Canny(blur, e3, 60, 180);
        Console.WriteLine($"③ 고정 (60, 180) : 에지 {Cv2.CountNonZero(e3)}개");

        Cv2.ImShow("otsu based", e1);
        Cv2.ImShow("mean based", e2);
        Cv2.ImShow("fixed 60/180", e3);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '에지 오버레이로 검사 화면 만들기', level: 3,
            desc: '<code>images/bracket_edges.png</code> 에 Canny 를 걸고, ① 원본을 3채널로 바꿔 에지를 <b>빨강</b>으로 겹치고 ② <code>Cv2.PutText</code> 로 왼쪽 위에 “Canny(50,150) edges=N” 을 흰색으로 쓰고 ③ 결과를 <code>Cv2.ImWrite("edge_result.png", ...)</code> 로 저장하세요. 📁 작업 폴더에서 저장된 파일을 확인하세요.',
            hint: '<code>Cv2.PutText(overlay, text, new Point(10, 30), HersheyFonts.HersheySimplex, 0.7, Scalar.White, 2)</code>. 문자열은 <code>$"Canny(50,150) edges={n}"</code> 처럼 만들고, 한글은 Hershey 폰트에서 깨지므로 <b>영문 · 숫자</b>로 쓰세요.',
            expect: '에지 픽셀 1316개\n저장 성공: edge_result.png (작업 폴더에서 확인)',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
        using var edges = new Mat();
        Cv2.Canny(gray, edges, 50, 150);
        int n = Cv2.CountNonZero(edges);
        Console.WriteLine($"에지 픽셀 {n}개");

        using var overlay = new Mat();
        // TODO: GRAY2BGR 로 3채널로 바꾸고 에지를 빨강으로 칠하세요

        // TODO: PutText 로 정보를 쓰고 ImWrite 로 저장하세요

        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
        using var edges = new Mat();
        Cv2.Canny(gray, edges, 50, 150);
        int n = Cv2.CountNonZero(edges);
        Console.WriteLine($"에지 픽셀 {n}개");

        using var overlay = new Mat();
        Cv2.CvtColor(gray, overlay, ColorConversionCodes.GRAY2BGR);
        overlay.SetTo(new Scalar(0, 0, 255), edges);          // BGR 빨강

        string text = $"Canny(50,150) edges={n}";
        Cv2.PutText(overlay, text, new Point(10, 30),
                    HersheyFonts.HersheySimplex, 0.7, Scalar.White, 2);
        bool ok = Cv2.ImWrite("edge_result.png", overlay);
        Console.WriteLine($"저장 {(ok ? "성공" : "실패")}: edge_result.png (작업 폴더에서 확인)");

        Cv2.ImShow("edge overlay", overlay);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '에지 검출 ② Canny', subtitle: '네 단계와 두 임계값 — 두께 1 px 의 이진 에지', notes: '<p>1교시 실습 결과(Sobel + 임계값)의 문제부터 짚습니다: 두껍고, 끊기고, 잡음이 섞인다. 💬 “이 세 가지를 동시에 해결할 수 있을까요?” — 1986년 Canny 의 답. (3분)</p>' },
          { layout: 'bullets', title: 'Sobel + 임계값의 네 가지 한계', lead: '왜 Canny 가 필요한가', bullets: [
            '에지가 <b>3~5 px 두껍다</b> → 정확한 위치를 모른다',
            '임계값을 낮추면 <b>잡음 · 무늬</b>까지 에지',
            '임계값을 높이면 약한 에지가 <b>끊긴다</b>',
            '결과가 회색이라 윤곽선 · 허프 변환에 바로 못 쓴다',
            '→ Canny 는 이 네 가지를 네 단계로 해결한다'
          ], notes: '<p>1교시 실습 2 의 출력(임계값 60/120/180 픽셀 수)을 다시 보여 주면 설득력이 큽니다. 학생들이 직접 본 문제라서 동기가 생깁니다. (4분)</p>' },
          { layout: 'diagram', title: 'Canny 네 단계', html: FIG_CANNY, caption: '블러 → 그래디언트 → 비최대 억제 → 이력 임계값', notes: '<p>네 상자를 순서대로 짚고, 각 단계가 앞 슬라이드의 어느 문제를 푸는지 연결합니다(③ = 두께, ④ = 끊김 + 잡음). 💬 “①은 왜 필요할까요?” — 1교시 Laplacian 경험. (6분)</p>' },
          { layout: 'code', title: 'Canny 기본 사용', code: `using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
using var edges = new Mat();
Cv2.Canny(img, edges, 50, 150);        // threshold1, threshold2

int total = img.Rows * img.Cols;
int n = Cv2.CountNonZero(edges);
Console.WriteLine($"에지 픽셀 {n}개 / {total} = {100.0 * n / total:F2} %");
Cv2.MinMaxLoc(edges, out double lo, out double hi);
Console.WriteLine($"값 범위 {lo} ~ {hi} (0 또는 255)");
Console.WriteLine($"형식 {edges.Type()}, 채널 {edges.Channels()}");

Cv2.ImShow("input", img);
Cv2.ImShow("canny 50/150", edges);
Cv2.WaitKey(0);`, points: ['결과는 <b>CV_8UC1 · 0 또는 255</b> 이진 영상', '선 두께 1 px → 윤곽선 · 허프의 입력', '판 둘레 약 1100 px + 구멍 188 px 로 검산'], notes: '<p>값 범위와 형식 출력이 중요합니다 — “Canny 는 이진 영상을 준다”를 각인시킵니다. 결과 창에서 선을 확대해 1 px 인 것을 보여 주세요. (6분)</p>' },
          { layout: 'diagram', title: '두 임계값 = 이력(hysteresis)', html: FIG_HYST, caption: 'threshold2 이상은 확정 · 그 아래는 이어져 있을 때만', notes: '<p>💬 “임계값을 하나만 쓰면 어떤 일이 생길까요?” — 살리면 잡음, 버리면 끊김. “확실한 곳에서 출발해 따라간다”는 발상이 핵심입니다. 비율 2:1~3:1 관례도 함께. (5분)</p>' },
          { layout: 'code', title: '임계값에 따른 변화', code: `using var img = Cv2.ImRead("images/sample_color.png", ImreadModes.Grayscale);
int total = img.Rows * img.Cols;

int[] t1 = new int[] { 10, 30, 50, 100, 150 };
int[] t2 = new int[] { 30, 90, 150, 200, 300 };
for (int i = 0; i < t1.Length; i++)
{
    using var e = new Mat();
    Cv2.Canny(img, e, t1[i], t2[i]);
    int n = Cv2.CountNonZero(e);
    Console.WriteLine($"Canny({t1[i]},{t2[i]}) 에지 {n}개 ({100.0 * n / total:F2} %)");
    Cv2.ImShow($"canny {t1[i]}-{t2[i]}", e);
}
Cv2.WaitKey(0);`, points: ['(10, 30): 트레이 질감 · 그림자까지 에지', '(150, 300): 대비 약한 도형의 에지가 끊긴다', '실무 출발점은 <b>(50, 150)</b>'], notes: '<p>(10,30) 과 (150,300) 두 이미지만 확대해 비교하면 충분합니다. 💬 “우리 검사에서는 그림자를 에지로 봐야 할까?” — 목적이 기준이라는 점을 강조. (7분)</p>' },
          { layout: 'code', title: '전처리 블러의 효과', code: `using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
int total = noisy.Rows * noisy.Cols;

using var e0 = new Mat();
Cv2.Canny(clean, e0, 50, 150);
Console.WriteLine($"깨끗한 원본   : {Cv2.CountNonZero(e0)}개");

using var e1 = new Mat();
Cv2.Canny(noisy, e1, 50, 150);
Console.WriteLine($"잡음 · 블러 X : {Cv2.CountNonZero(e1)}개");

int[] ks = new int[] { 3, 5, 7 };
foreach (int k in ks)
{
    using var b = new Mat();
    using var e = new Mat();
    Cv2.GaussianBlur(noisy, b, new Size(k, k), 0);
    Cv2.Canny(b, e, 50, 150);
    Console.WriteLine($"블러 {k}x{k}     : {Cv2.CountNonZero(e)}개");
}
Cv2.ImShow("no blur", e1);
Cv2.WaitKey(0);`, points: ['Canny 내부 블러는 <b>5×5 고정</b> — 센 잡음에는 부족', '블러를 키우면 에지 수가 급감 (대부분 잡음이었다)', '너무 키우면 가는 선의 에지도 사라진다'], notes: '<p>숫자가 매우 극적입니다. 💬 “잡음 영상의 에지가 깨끗한 원본보다 많은데, 이 에지들은 무엇일까?” — 잡음. 블러 7 결과 창에서 가는 세로선이 살아 있는지 함께 확인합니다. (7분)</p>' },
          { layout: 'code', title: '에지를 원본 위에 겹치기', code: `using var gray = Cv2.ImRead("images/chip_rotated.png", ImreadModes.Grayscale);
using var blur = new Mat();
Cv2.GaussianBlur(gray, blur, new Size(5, 5), 0);
using var edges = new Mat();
Cv2.Canny(blur, edges, 60, 180);
Console.WriteLine($"에지 픽셀 {Cv2.CountNonZero(edges)}개");

using var overlay = new Mat();
Cv2.CvtColor(gray, overlay, ColorConversionCodes.GRAY2BGR);
overlay.SetTo(new Scalar(0, 0, 255), edges);      // 마스크 = 에지, BGR 빨강
Console.WriteLine($"형식 {overlay.Type()}, 채널 {overlay.Channels()}");

Cv2.ImShow("canny", edges);
Cv2.ImShow("chip + red edges", overlay);
Cv2.WaitKey(0);`, points: ['회색은 1채널 → 색을 칠할 수 없다 → <b>GRAY2BGR 먼저</b>', '<code>SetTo(색, 마스크)</code> 로 에지 자리만 칠하기', 'BGR 이므로 빨강은 <code>(0, 0, 255)</code>'], notes: '<p>검사 결과 화면의 기본 기법입니다. 💬 “왜 에지 영상만 보여 주면 안 될까?” — 작업자는 어느 부품의 어디인지 알아야 한다. 실습 2 로 이어집니다. (6분)</p>' },
          { layout: 'code', title: '다음 차시 예고: 에지 → 윤곽선 · 직선', code: `using var img = Cv2.ImRead("images/chip_rotated.png", ImreadModes.Grayscale);
using var blur = new Mat();
Cv2.GaussianBlur(img, blur, new Size(5, 5), 0);
using var edges = new Mat();
Cv2.Canny(blur, edges, 60, 180);

var contours = Cv2.FindContoursAsArray(edges, RetrievalModes.List,
                                       ContourApproximationModes.ApproxSimple);
Console.WriteLine($"윤곽선 {contours.Length}개 (12차시)");

var lines = Cv2.HoughLinesP(edges, 1, Math.PI / 180, 60, 40, 8);
Console.WriteLine($"직선 {lines.Length}개 (13차시)");
if (lines.Length > 0)
{
    var l = lines[0];
    double deg = Math.Atan2(l.P2.Y - l.P1.Y, l.P2.X - l.P1.X) * 180 / Math.PI;
    Console.WriteLine($"첫 직선 기울기 {deg:F1}도 (칩은 23.5도 회전)");
}
Cv2.ImShow("canny", edges);
Cv2.WaitKey(0);`, points: ['에지 영상 하나로 <b>개수 · 모양 · 각도</b>를 얻는다', '윤곽선 = 12차시, 허프 변환 = 13차시', 'Part 2(기초)에서 Part 3(분석)으로 넘어가는 다리'], notes: '<p>여기서 학생들이 “드디어 쓸모 있는 걸 만든다”는 기대를 갖게 됩니다. 각도가 23.5° 근처로 나오는 것을 확인시키고, 오차의 원인(에지 조각 · 임계값)은 13차시에서 다룬다고 예고합니다. (6분)</p>' },
          { layout: 'table', title: '상황별 Canny 출발점', head: ['상황', '권장 설정'], rows: [
            ['깨끗한 백라이트 실루엣', '<code>Canny(50, 150)</code>, 블러 불필요'],
            ['잡음 있는 정면 조명', '<code>GaussianBlur(5)</code> → <code>Canny(50, 150)</code>'],
            ['대비 약한 결함 · 얼룩', '<code>Canny(20, 60)</code> + 길이 · 면적 필터'],
            ['각도 · 치수 정밀 측정', '<code>L2gradient: true</code>'],
            ['텍스처 많은 배경', '임계값 ↑ 또는 모폴로지로 무늬 제거 (09차시)']
          ], notes: '<p>표를 노트에 적게 합니다. “정답은 없고 출발점만 있다 — 반드시 결과를 눈으로 확인한다”가 오늘의 태도. (3분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: 'Canny 의 네 단계 순서로 맞는 것은?', options: ['그래디언트 → 블러 → 이력 임계값 → 비최대 억제', '블러 → 그래디언트 → 비최대 억제 → 이력 임계값', '이력 임계값 → 블러 → 그래디언트 → 비최대 억제', '비최대 억제 → 블러 → 그래디언트 → 이력 임계값'], answer: 1, explain: '① 가우시안 블러 ② Sobel 그래디언트 ③ 비최대 억제(1 px) ④ 이력 임계값(두 임계값).', notes: '<p>정답 2번. 손가락으로 네 단계를 세며 함께 외웁니다. (2분)</p>' },
          { layout: 'practice', title: '실습: 에지 오버레이 검사 화면', desc: '<p><code>bracket_edges.png</code> 에 Canny → 빨강 오버레이 → 정보 텍스트 → 파일 저장까지 만드세요.</p><ul><li><code>GRAY2BGR</code> 후 <code>SetTo(빨강, edges)</code></li><li><code>PutText</code> 는 영문 · 숫자로</li><li><code>Cv2.ImWrite("edge_result.png", ...)</code> → 📁 작업 폴더</li></ul>', starter: `using var gray = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
using var edges = new Mat();
Cv2.Canny(gray, edges, 50, 150);
int n = Cv2.CountNonZero(edges);
Console.WriteLine($"에지 픽셀 {n}개");

using var overlay = new Mat();
// TODO: GRAY2BGR + SetTo(빨강, edges) + PutText + ImWrite
Cv2.WaitKey(0);`, solution: `using var gray = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
using var edges = new Mat();
Cv2.Canny(gray, edges, 50, 150);
int n = Cv2.CountNonZero(edges);

using var overlay = new Mat();
Cv2.CvtColor(gray, overlay, ColorConversionCodes.GRAY2BGR);
overlay.SetTo(new Scalar(0, 0, 255), edges);

Cv2.PutText(overlay, $"Canny(50,150) edges={n}", new Point(10, 30),
            HersheyFonts.HersheySimplex, 0.7, Scalar.White, 2);
bool ok = Cv2.ImWrite("edge_result.png", overlay);
Console.WriteLine($"에지 {n}개, 저장 {(ok ? "성공" : "실패")}: edge_result.png");
Cv2.ImShow("edge overlay", overlay);
Cv2.WaitKey(0);`, notes: '<p>저장된 파일을 📁 작업 폴더에서 열어 보게 합니다. 한글을 PutText 에 넣으면 물음표로 깨지는 것도 한 번 보여 주면 기억에 남습니다(한글이 필요하면 WPF 의 TextBlock 으로 표시). (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<b>Canny 4단계</b>: 블러 → 그래디언트 → 비최대 억제 → 이력 임계값', '결과는 <b>CV_8UC1 · 0/255 · 두께 1 px</b> 이진 에지 영상', '두 임계값 비율 <b>2:1 ~ 3:1</b> (출발점 50 / 150)', '내부 블러는 5×5 고정 → 잡음이 심하면 <b>GaussianBlur 를 한 번 더</b>', '오버레이: <code>GRAY2BGR</code> → <code>SetTo(색, edges)</code>', '다음 차시: 이 에지 · 이진 영상을 <b>윤곽선</b>으로 묶어 개수 · 면적 · 모양을 잰다 (12차시), 직선 · 원은 허프 변환 (13차시)'], notes: '<p>Part 2(기초)가 끝나고 Part 3(분석과 검출)로 들어간다는 지도를 다시 보여 줍니다. 11차시(기하 변환)를 지나면 12차시에서 드디어 “물체를 세고 재는” 일을 한다고 예고하며 마칩니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
