/* 11차시 기하 변환: 크기 · 회전 · 어파인 · 원근 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 보간(interpolation) 세 가지가 픽셀 사이를 채우는 방법
  const FIG_INTERP = `<svg viewBox="0 0 720 300" role="img" aria-label="확대할 때 원본 픽셀 사이를 Nearest, Linear, Cubic 이 채우는 방법 비교">
  ${ARROW('c11a1')}
  <text x="360" y="22" text-anchor="middle" class="tx-b">확대 = 원본 픽셀 사이의 빈 자리를 "추측"해서 채우는 일 (보간)</text>
  <line x1="60" y1="250" x2="660" y2="250" class="ax"/><line x1="60" y1="60" x2="60" y2="250" class="ax"/>
  <text x="40" y="66" class="tx-m">밝기</text><text x="650" y="272" class="tx-m">x</text>
  <circle cx="120" cy="220" r="5" class="p1"/><circle cx="300" cy="90" r="5" class="p1"/><circle cx="480" cy="190" r="5" class="p1"/><circle cx="600" cy="80" r="5" class="p1"/>
  <text x="120" y="272" text-anchor="middle" class="tx-m">40</text><text x="300" y="272" text-anchor="middle" class="tx-m">200</text><text x="480" y="272" text-anchor="middle" class="tx-m">90</text><text x="600" y="272" text-anchor="middle" class="tx-m">220</text>
  <text x="360" y="292" text-anchor="middle" class="tx-m">● 원본 픽셀 값 (샘플)</text>
  <polyline points="60,220 210,220 210,90 390,90 390,190 540,190 540,80 660,80" class="s1" fill="none" stroke-width="2.5" stroke-dasharray="1 0"/>
  <polyline points="120,220 300,90 480,190 600,80" class="s2" fill="none" stroke-width="2.5"/>
  <path d="M120,220 C180,235 240,80 300,90 C360,100 420,205 480,190 C525,179 555,80 600,80" class="s3" fill="none" stroke-width="2.5"/>
  <rect x="440" y="44" width="220" height="16" rx="4" class="card-bg"/>
  <line x1="450" y1="52" x2="480" y2="52" class="s1" stroke-width="2.5"/><text x="486" y="56" class="tx-m">Nearest</text>
  <line x1="540" y1="52" x2="565" y2="52" class="s2" stroke-width="2.5"/><text x="570" y="56" class="tx-m">Linear</text>
  <line x1="612" y1="52" x2="632" y2="52" class="s3" stroke-width="2.5"/><text x="637" y="56" class="tx-m">Cubic</text>
  <text x="180" y="120" class="tx-m">계단(블록)</text><text x="330" y="150" class="tx-m">직선</text><text x="500" y="130" class="tx-m">곡선(부드러움)</text>
</svg>`;

  // 그림 2: 어파인 변환 행렬 2×3 의 의미
  const FIG_AFFINE = `<svg viewBox="0 0 720 320" role="img" aria-label="어파인 변환 2x3 행렬과 이동, 회전, 크기 변환 행렬의 모습">
  <text x="360" y="22" text-anchor="middle" class="tx-b">어파인 변환(Affine) = 2×3 행렬 하나로 이동 · 회전 · 크기 · 기울이기를 한 번에</text>
  <rect x="30" y="40" width="290" height="110" rx="10" class="p1s"/>
  <text x="60" y="76" class="tx">[ a  b  t<tspan dy="4" font-size="10">x</tspan> ]</text>
  <text x="60" y="112" class="tx">[ c  d  t<tspan dy="4" font-size="10">y</tspan> ]</text>
  <text x="175" y="76" class="tx-m">x' = a·x + b·y + t<tspan dy="3" font-size="9">x</tspan></text>
  <text x="175" y="112" class="tx-m">y' = c·x + d·y + t<tspan dy="3" font-size="9">y</tspan></text>
  <text x="175" y="140" text-anchor="middle" class="tx-m">MatType.CV_64FC1 (double) 2행 3열</text>
  <rect x="340" y="40" width="350" height="110" rx="10" class="card-bg"/>
  <text x="515" y="66" text-anchor="middle" class="tx-b">직선은 직선으로, 평행선은 평행선으로</text>
  <text x="515" y="92" text-anchor="middle" class="tx-m">→ 원근(깊이)은 표현하지 못한다</text>
  <text x="515" y="118" text-anchor="middle" class="tx-m">필요한 대응점: <tspan class="tx">3쌍</tspan> (미지수 6개)</text>
  <text x="515" y="140" text-anchor="middle" class="tx-m">Cv2.GetAffineTransform(src3, dst3)</text>
  <rect x="30" y="170" width="205" height="130" rx="10" class="p2s"/>
  <text x="132" y="196" text-anchor="middle" class="tx-b">이동 (translate)</text>
  <text x="132" y="228" text-anchor="middle" class="tx">[ 1  0  t<tspan dy="3" font-size="9">x</tspan> ]</text>
  <text x="132" y="252" text-anchor="middle" class="tx">[ 0  1  t<tspan dy="3" font-size="9">y</tspan> ]</text>
  <rect x="60" y="264" width="30" height="22" rx="3" class="p1s"/><rect x="90" y="272" width="30" height="22" rx="3" class="p1"/>
  <text x="180" y="284" class="tx-m">→ 오른쪽 아래로</text>
  <rect x="255" y="170" width="205" height="130" rx="10" class="p3s"/>
  <text x="357" y="196" text-anchor="middle" class="tx-b">회전 (rotate θ)</text>
  <text x="357" y="228" text-anchor="middle" class="tx">[ cosθ  −sinθ  0 ]</text>
  <text x="357" y="252" text-anchor="middle" class="tx">[ sinθ   cosθ  0 ]</text>
  <rect x="300" y="266" width="26" height="20" rx="3" class="p1s"/><rect x="340" y="266" width="26" height="20" rx="3" class="p1" transform="rotate(-20 353 276)"/>
  <text x="378" y="282" class="tx-m">원점 기준</text>
  <rect x="480" y="170" width="210" height="130" rx="10" class="p4s"/>
  <text x="585" y="196" text-anchor="middle" class="tx-b">크기 (scale)</text>
  <text x="585" y="228" text-anchor="middle" class="tx">[ s<tspan dy="3" font-size="9">x</tspan>  0   0 ]</text>
  <text x="585" y="252" text-anchor="middle" class="tx">[ 0   s<tspan dy="3" font-size="9">y</tspan>  0 ]</text>
  <rect x="520" y="268" width="20" height="16" rx="2" class="p1s"/><rect x="552" y="262" width="34" height="26" rx="3" class="p1"/>
  <text x="600" y="282" class="tx-m">배율</text>
</svg>`;

  // 그림 3: 회전 후 잘림 방지 — 출력 크기 계산
  const FIG_CROP = `<svg viewBox="0 0 700 260" role="img" aria-label="회전 후 원본 크기로 출력하면 모서리가 잘리고, 새 크기를 계산하면 전체가 담긴다">
  <text x="350" y="20" text-anchor="middle" class="tx-b">회전하면 모서리가 원래 화면 밖으로 나간다</text>
  <rect x="40" y="46" width="250" height="185" rx="6" class="card-bg"/>
  <text x="165" y="70" text-anchor="middle" class="tx-m">출력 크기 = 원본 (640×480)</text>
  <rect x="70" y="86" width="190" height="130" class="s2" fill="none" stroke-width="2" stroke-dasharray="5 4"/>
  <rect x="70" y="86" width="190" height="130" class="p1s" transform="rotate(30 165 151)"/>
  <text x="165" y="240" text-anchor="middle" class="tx-m">→ 네 모서리가 <tspan class="tx">잘림</tspan></text>
  <rect x="380" y="46" width="290" height="185" rx="6" class="card-bg"/>
  <text x="525" y="70" text-anchor="middle" class="tx-m">출력 크기 = 새로 계산 (791×791)</text>
  <rect x="430" y="82" width="190" height="130" class="p1s" transform="rotate(30 525 147)"/>
  <rect x="404" y="80" width="242" height="136" class="s3" fill="none" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="525" y="240" text-anchor="middle" class="tx-m">nw = h·|sinθ| + w·|cosθ|,  nh = h·|cosθ| + w·|sinθ|</text>
</svg>`;

  // 그림 4: 어파인 3점 vs 원근 4점
  const FIG_PERSP = `<svg viewBox="0 0 740 330" role="img" aria-label="어파인 변환은 3점, 원근 변환은 4점 대응이 필요하며 원근은 3x3 행렬을 쓴다">
  ${ARROW('c11b1')}
  <rect x="20" y="34" width="330" height="200" rx="10" class="p2s"/>
  <text x="185" y="58" text-anchor="middle" class="tx-b">어파인 (2×3) — 대응점 3쌍</text>
  <polygon points="60,180 170,180 60,90" class="p1s"/><circle cx="60" cy="180" r="5" class="p1"/><circle cx="170" cy="180" r="5" class="p1"/><circle cx="60" cy="90" r="5" class="p1"/>
  <polygon points="215,190 320,172 230,100" class="p3s"/><circle cx="215" cy="190" r="5" class="p3"/><circle cx="320" cy="172" r="5" class="p3"/><circle cx="230" cy="100" r="5" class="p3"/>
  <line x1="180" y1="150" x2="208" y2="150" class="ln" stroke-width="2" marker-end="url(#c11b1)"/>
  <text x="185" y="215" text-anchor="middle" class="tx-m">평행선은 계속 평행 (원근 없음)</text>
  <rect x="370" y="34" width="350" height="200" rx="10" class="p4s"/>
  <text x="545" y="58" text-anchor="middle" class="tx-b">원근 (3×3, 호모그래피) — 대응점 4쌍</text>
  <polygon points="410,180 520,180 520,90 410,90" class="p1s"/>
  <circle cx="410" cy="180" r="5" class="p1"/><circle cx="520" cy="180" r="5" class="p1"/><circle cx="520" cy="90" r="5" class="p1"/><circle cx="410" cy="90" r="5" class="p1"/>
  <polygon points="590,196 700,178 678,104 606,96" class="p5s"/>
  <circle cx="590" cy="196" r="5" class="p5"/><circle cx="700" cy="178" r="5" class="p5"/><circle cx="678" cy="104" r="5" class="p5"/><circle cx="606" cy="96" r="5" class="p5"/>
  <line x1="534" y1="140" x2="576" y2="140" class="ln" stroke-width="2" marker-end="url(#c11b1)"/>
  <text x="545" y="215" text-anchor="middle" class="tx-m">사각형 → 임의의 사각형 (기울어진 평면)</text>
  <rect x="20" y="248" width="700" height="72" rx="10" class="card-bg"/>
  <text x="120" y="278" text-anchor="middle" class="tx">[ h<tspan dy="3" font-size="9">00</tspan> h<tspan dy="0" font-size="9">01</tspan> h<tspan font-size="9">02</tspan> ]</text>
  <text x="120" y="302" text-anchor="middle" class="tx">[ h<tspan dy="3" font-size="9">10</tspan> h<tspan font-size="9">11</tspan> h<tspan font-size="9">12</tspan> ] [ h<tspan font-size="9">20</tspan> h<tspan font-size="9">21</tspan> 1 ]</text>
  <text x="430" y="276" text-anchor="middle" class="tx-m">u = h<tspan dy="3" font-size="9">00</tspan>x + h<tspan font-size="9">01</tspan>y + h<tspan font-size="9">02</tspan>,  v = h<tspan font-size="9">10</tspan>x + h<tspan font-size="9">11</tspan>y + h<tspan font-size="9">12</tspan>,  w = h<tspan font-size="9">20</tspan>x + h<tspan font-size="9">21</tspan>y + 1</text>
  <text x="430" y="306" text-anchor="middle" class="tx">최종 좌표 x' = u / w,  y' = v / w   ← 마지막 <tspan class="tx-b">나눗셈</tspan>이 원근을 만든다</text>
</svg>`;

  // 그림 5: 영상 px → 로봇 mm 좌표 변환
  const FIG_PXMM = `<svg viewBox="0 0 720 300" role="img" aria-label="영상의 기준 마크 4개와 로봇 좌표 4개를 짝지어 px에서 mm로 가는 변환 행렬을 만든다">
  ${ARROW('c11b2')}
  <rect x="20" y="40" width="300" height="230" rx="10" class="card-bg"/>
  <text x="170" y="64" text-anchor="middle" class="tx-b">카메라 영상 (px)</text>
  <polygon points="52,92 288,98 282,242 56,238" class="p1s"/>
  <circle cx="52" cy="92" r="6" class="p1"/><text x="44" y="86" class="tx-m">M1</text>
  <circle cx="288" cy="98" r="6" class="p1"/><text x="282" y="90" class="tx-m">M2</text>
  <circle cx="282" cy="242" r="6" class="p1"/><text x="276" y="262" class="tx-m">M3</text>
  <circle cx="56" cy="238" r="6" class="p1"/><text x="48" y="258" class="tx-m">M4</text>
  <circle cx="150" cy="160" r="12" class="p3"/><text x="168" y="164" class="tx-m">부품 (x, y) px</text>
  <rect x="400" y="40" width="300" height="230" rx="10" class="card-bg"/>
  <text x="550" y="64" text-anchor="middle" class="tx-b">로봇 좌표 (mm)</text>
  <rect x="440" y="96" width="220" height="145" class="p2s"/>
  <circle cx="440" cy="96" r="6" class="p2"/><text x="416" y="90" class="tx-m">270, 90</text>
  <circle cx="660" cy="96" r="6" class="p2"/><text x="636" y="90" class="tx-m">530, 90</text>
  <circle cx="660" cy="241" r="6" class="p2"/><text x="630" y="260" class="tx-m">530, −90</text>
  <circle cx="440" cy="241" r="6" class="p2"/><text x="412" y="260" class="tx-m">270, −90</text>
  <circle cx="530" cy="168" r="12" class="p3"/><text x="548" y="172" class="tx-m">집을 위치 (X, Y) mm</text>
  <line x1="326" y1="155" x2="394" y2="155" class="ln" stroke-width="2.5" marker-end="url(#c11b2)"/>
  <text x="360" y="146" text-anchor="middle" class="tx-m">H</text>
  <text x="360" y="290" text-anchor="middle" class="tx-m">H = Cv2.GetPerspectiveTransform(px4, mm4) → Cv2.PerspectiveTransform 으로 점 좌표 변환</text>
</svg>`;

  // ================================================================= 교시 1 예제
  const EX_RESIZE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        Console.WriteLine($"원본: {img.Width} x {img.Height}");

        using var half = new Mat();
        Cv2.Resize(img, half, new Size(320, 240));          // ① 크기를 직접 지정
        Console.WriteLine($"Size 지정: {half.Width} x {half.Height}");

        using var big = new Mat();
        Cv2.Resize(img, big, new Size(0, 0), 1.5, 1.5);      // ② 배율 지정 (fx, fy)
        Console.WriteLine($"배율 1.5배: {big.Width} x {big.Height}");

        // 2x2 (0, 100 / 200, 255) 를 8x8 로 4배 확대 → 첫 줄 값 비교
        using var tiny = new Mat(2, 2, MatType.CV_8UC1, new byte[] { 0, 100, 200, 255 });
        foreach (var f in new[] { InterpolationFlags.Nearest, InterpolationFlags.Linear, InterpolationFlags.Cubic })
        {
            using var up = new Mat();
            Cv2.Resize(tiny, up, new Size(8, 8), 0, 0, f);
            string s = "";
            for (int x = 0; x < 8; x++) s += up.At<byte>(0, x) + " ";
            Console.WriteLine($"{f,-8}: {s}");
        }

        Cv2.ImShow("half", half);
        Cv2.WaitKey(0);
    }
}`;

  const EX_QUALITY = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // (1) 확대: 작은 ROI 30x30 을 8배(240x240) 로
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        using var roi = new Mat(img, new Rect(96, 136, 30, 30));   // 빨간 원의 왼쪽 에지 부분
        foreach (var f in new[] { InterpolationFlags.Nearest, InterpolationFlags.Linear, InterpolationFlags.Cubic })
        {
            using var up = new Mat();
            Cv2.Resize(roi, up, new Size(0, 0), 8, 8, f);
            using var lap = new Mat();
            Cv2.Laplacian(up, lap, MatType.CV_32F);                 // 계단이 많으면 값이 커진다
            Cv2.MeanStdDev(lap, out Scalar m, out Scalar sd);
            Cv2.MinMaxLoc(up, out double lo, out double hi);
            Console.WriteLine($"{f,-8} {up.Width}x{up.Height} 계단 정도 {sd.Val0:F2} 밝기 {lo}~{hi}");
            Cv2.ImShow(f.ToString(), up);
        }
        Cv2.MinMaxLoc(roi, out double rlo, out double rhi);
        Console.WriteLine($"원본 ROI 밝기 {rlo}~{rhi}");

        // (2) 축소: 1/4 로 줄일 때 평균 밝기가 얼마나 보존되는가
        using var src = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
        Console.WriteLine($"원본 평균 {Cv2.Mean(src).Val0:F2}");
        foreach (var f in new[] { InterpolationFlags.Nearest, InterpolationFlags.Linear, InterpolationFlags.Area })
        {
            using var small = new Mat();
            Cv2.Resize(src, small, new Size(0, 0), 0.25, 0.25, f);
            Cv2.MeanStdDev(small, out Scalar m, out Scalar sd);
            Console.WriteLine($"{f,-8} 1/4 축소: 평균 {m.Val0:F2} 표준편차 {sd.Val0:F2}");
        }
        Cv2.WaitKey(0);
    }
}`;

  const EX_FLIP = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);

        using var fx = new Mat(); Cv2.Flip(img, fx, FlipMode.X);    // 위아래 (x축 기준)
        using var fy = new Mat(); Cv2.Flip(img, fy, FlipMode.Y);    // 좌우  (y축 기준)
        using var fxy = new Mat(); Cv2.Flip(img, fxy, FlipMode.XY); // 180도 회전과 같음
        using var r90 = new Mat(); Cv2.Rotate(img, r90, RotateFlags.Rotate90Clockwise);

        Console.WriteLine($"원본 {img.Width}x{img.Height} / 90도 회전 {r90.Width}x{r90.Height}");
        Console.WriteLine($"(0,0)={img.At<byte>(0, 0)} / X뒤집기 (479,0)={fx.At<byte>(479, 0)} / Y뒤집기 (0,639)={fy.At<byte>(0, 639)}");

        // 평행 이동 행렬을 직접 만들어 WarpAffine 에 넘기기
        double tx = 80, ty = -40;
        using var M = new Mat(2, 3, MatType.CV_64FC1, new double[] { 1, 0, tx, 0, 1, ty });
        using var moved = new Mat();
        Cv2.WarpAffine(img, moved, M, new Size(img.Width, img.Height),
                       InterpolationFlags.Linear, BorderTypes.Constant, Scalar.All(0));
        Console.WriteLine($"이동 결과 {moved.Width}x{moved.Height}, 빈 자리 값 {moved.At<byte>(10, 10)}");

        Cv2.ImShow("flipY", fy);
        Cv2.ImShow("rotate90", r90);
        Cv2.ImShow("moved", moved);
        Cv2.WaitKey(0);
    }
}`;

  const EX_ROTFIX = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/chip_rotated.png", ImreadModes.Grayscale);

        // ① 지금 몇 도 기울어져 있나? (어두운 몸체 이진화 → 최소 외접 회전 사각형)
        Console.WriteLine($"원본 기울기 {Angle(img):F2} 도");

        // ② 반대 방향으로 돌리는 어파인 행렬 (중심 · 각도 · 배율)
        var center = new Point2f(330.4f, 245.2f);
        using var M = Cv2.GetRotationMatrix2D(center, -23.5, 1.0);
        Console.WriteLine($"M = {M.Rows}x{M.Cols} {M.Type()}");
        Console.WriteLine($"  [{M.At<double>(0, 0):F4} {M.At<double>(0, 1):F4} {M.At<double>(0, 2):F2}]");
        Console.WriteLine($"  [{M.At<double>(1, 0):F4} {M.At<double>(1, 1):F4} {M.At<double>(1, 2):F2}]");

        // ③ 적용 — 빈 자리는 트레이와 비슷한 밝은 값으로 채운다
        using var dst = new Mat();
        Cv2.WarpAffine(img, dst, M, new Size(img.Width, img.Height),
                       InterpolationFlags.Linear, BorderTypes.Constant, Scalar.All(200));
        Console.WriteLine($"보정 후 기울기 {Angle(dst):F2} 도");

        Cv2.ImShow("input", img);
        Cv2.ImShow("rotated back", dst);
        Cv2.WaitKey(0);
    }

    // 가장 큰 어두운 덩어리의 기울기(도). -45 미만이면 +90 해서 0도 근처로 맞춘다
    static double Angle(Mat gray)
    {
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Point[] big = cs[0];
        foreach (var c in cs) if (Cv2.ContourArea(c) > Cv2.ContourArea(big)) big = c;
        double a = Cv2.MinAreaRect(big).Angle;
        return a < -45 ? a + 90 : a;
    }
}`;

  const EX_CROP = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        double angle = 45;
        var center = new Point2f(img.Width / 2f, img.Height / 2f);
        using var M = Cv2.GetRotationMatrix2D(center, angle, 1.0);

        // 회전 행렬의 cos · sin 으로 필요한 출력 크기를 계산
        double cos = Math.Abs(M.At<double>(0, 0)), sin = Math.Abs(M.At<double>(0, 1));
        int nw = (int)(img.Height * sin + img.Width * cos);
        int nh = (int)(img.Height * cos + img.Width * sin);
        Console.WriteLine($"원본 {img.Width}x{img.Height} → 새 크기 {nw}x{nh}");

        // 새 화면의 중앙으로 오도록 이동량(3열)을 더해 준다
        M.Set<double>(0, 2, M.At<double>(0, 2) + nw / 2.0 - center.X);
        M.Set<double>(1, 2, M.At<double>(1, 2) + nh / 2.0 - center.Y);

        using var cut = new Mat();
        Cv2.WarpAffine(img, cut, Cv2.GetRotationMatrix2D(center, angle, 1.0), new Size(img.Width, img.Height));
        using var full = new Mat();
        Cv2.WarpAffine(img, full, M, new Size(nw, nh), InterpolationFlags.Linear, BorderTypes.Constant, Scalar.All(255));
        Console.WriteLine($"잘린 결과 {cut.Width}x{cut.Height} / 전체 담은 결과 {full.Width}x{full.Height}");
        Console.WriteLine($"full 의 왼쪽 위 모서리 값 {full.At<byte>(2, 2)} (borderValue 255)");

        Cv2.ImShow("cut", cut);
        Cv2.ImShow("full", full);
        Cv2.WaitKey(0);
    }
}`;

  // ================================================================= 교시 2 예제
  const EX_AFFINE3 = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);

        // 원본의 세 점이 결과에서 어디로 가야 하는지 짝지어 준다 (3쌍)
        Point2f[] src = { new Point2f(0, 0), new Point2f(639, 0), new Point2f(0, 479) };
        Point2f[] dst = { new Point2f(60, 40), new Point2f(600, 90), new Point2f(10, 450) };

        using var A = Cv2.GetAffineTransform(src, dst);
        Console.WriteLine($"A = {A.Rows}x{A.Cols} {A.Type()}");
        Console.WriteLine($"  [{A.At<double>(0, 0):F4} {A.At<double>(0, 1):F4} {A.At<double>(0, 2):F2}]");
        Console.WriteLine($"  [{A.At<double>(1, 0):F4} {A.At<double>(1, 1):F4} {A.At<double>(1, 2):F2}]");

        using var warped = new Mat();
        Cv2.WarpAffine(img, warped, A, new Size(640, 480), InterpolationFlags.Linear, BorderTypes.Constant, Scalar.All(0));

        // 확인: 원본 (639, 0) 은 정말 (600, 90) 으로 갔나?
        double x2 = A.At<double>(0, 0) * 639 + A.At<double>(0, 1) * 0 + A.At<double>(0, 2);
        double y2 = A.At<double>(1, 0) * 639 + A.At<double>(1, 1) * 0 + A.At<double>(1, 2);
        Console.WriteLine($"(639, 0) → ({x2:F1}, {y2:F1})");

        Cv2.ImShow("input", img);
        Cv2.ImShow("affine", warped);
        Cv2.WaitKey(0);
    }
}`;

  const EX_FRONT = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 살짝 기울어 찍힌 점 격자 교정판을 정면 모습으로 펴기
        using var img = Cv2.ImRead("images/calib_grid_top.png", ImreadModes.Grayscale);

        // 네 꼭지 점 (0,0) (10,0) (10,7) (0,7) 의 영상 좌표 (px)
        Point2f[] src = { new Point2f(95.30f, 72.80f), new Point2f(560.21f, 80.10f),
                          new Point2f(552.60f, 410.40f), new Point2f(88.70f, 398.89f) };
        // 펴진 뒤에 놓일 자리 — 1 mm = 10 px, 여백 50 px (점 간격 5 mm = 50 px)
        Point2f[] dst = { new Point2f(50, 50), new Point2f(550, 50),
                          new Point2f(550, 400), new Point2f(50, 400) };

        using var H = Cv2.GetPerspectiveTransform(src, dst);
        using var top = new Mat();
        Cv2.WarpPerspective(img, top, H, new Size(600, 450));
        Console.WriteLine($"정면화 결과 {top.Width}x{top.Height}");

        // 검증: 점 88개가 50 px 격자 위에 놓였는지
        using var bin = new Mat();
        Cv2.Threshold(top, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        var dots = cs.Where(c => Cv2.ContourArea(c) > 50 && Cv2.ContourArea(c) < 1000)
                     .Select(c => Cv2.Moments(c))
                     .Select(m => new Point2f((float)(m.M10 / m.M00), (float)(m.M01 / m.M00)))
                     .ToList();
        Console.WriteLine($"점 {dots.Count}개");
        Console.WriteLine($"x 범위 {dots.Min(p => p.X):F1} ~ {dots.Max(p => p.X):F1}");
        Console.WriteLine($"y 범위 {dots.Min(p => p.Y):F1} ~ {dots.Max(p => p.Y):F1}");

        Cv2.ImShow("input", img);
        Cv2.ImShow("front", top);
        Cv2.WaitKey(0);
    }
}`;

  const EX_PXMM = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // robot_pick.png 의 기준 마크 4개: 영상 좌표(px) 와 로봇 좌표(mm) 를 모두 안다
        Point2f[] px = { new Point2f(61.56f, 57.38f), new Point2f(583.83f, 65.15f),
                         new Point2f(574.58f, 426.42f), new Point2f(67.27f, 419.64f) };
        Point2f[] mm = { new Point2f(270, 90), new Point2f(530, 90),
                         new Point2f(530, -90), new Point2f(270, -90) };

        using var H = Cv2.GetPerspectiveTransform(px, mm);     // px → mm
        Console.WriteLine($"H = {H.Rows}x{H.Cols} {H.Type()}");
        for (int r = 0; r < 3; r++)
            Console.WriteLine($"  [{H.At<double>(r, 0),10:F6} {H.At<double>(r, 1),10:F6} {H.At<double>(r, 2),10:F4}]");

        // 점 좌표 변환은 WarpPerspective 가 아니라 PerspectiveTransform!
        Point2f[] test = { new Point2f(61.56f, 57.38f), new Point2f(583.83f, 65.15f), new Point2f(320, 240) };
        Point2f[] robot = Cv2.PerspectiveTransform(test, H);
        for (int k = 0; k < test.Length; k++)
            Console.WriteLine($"  px ({test[k].X:F1}, {test[k].Y:F1}) → mm ({robot[k].X:F2}, {robot[k].Y:F2})");

        Cv2.ImShow("robot_pick", Cv2.ImRead("images/robot_pick.png", ImreadModes.Grayscale));
        Cv2.WaitKey(0);
    }
}`;

  const EX_INVERT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        Point2f[] px = { new Point2f(61.56f, 57.38f), new Point2f(583.83f, 65.15f),
                         new Point2f(574.58f, 426.42f), new Point2f(67.27f, 419.64f) };
        Point2f[] mm = { new Point2f(270, 90), new Point2f(530, 90),
                         new Point2f(530, -90), new Point2f(270, -90) };

        using var H = Cv2.GetPerspectiveTransform(px, mm);    // px → mm
        using var Hinv = new Mat();
        Cv2.Invert(H, Hinv);                                   // mm → px (역행렬)

        // 로봇 좌표를 영상 어디에 표시할지 = 역변환
        Point2f[] want = { new Point2f(400, 0), new Point2f(320, 30), new Point2f(470, 40) };
        Point2f[] shown = Cv2.PerspectiveTransform(want, Hinv);
        using var img = Cv2.ImRead("images/robot_pick.png", ImreadModes.Color);
        for (int k = 0; k < want.Length; k++)
        {
            Console.WriteLine($"  mm ({want[k].X:F0}, {want[k].Y:F0}) → px ({shown[k].X:F2}, {shown[k].Y:F2})");
            Cv2.DrawMarker(img, new Point((int)shown[k].X, (int)shown[k].Y), Scalar.Red, MarkerTypes.Cross, 24, 2);
        }

        // 왕복 확인: px → mm → px 하면 제자리로 돌아온다
        Point2f[] back = Cv2.PerspectiveTransform(Cv2.PerspectiveTransform(new[] { new Point2f(320, 240) }, H), Hinv);
        Console.WriteLine($"왕복 확인: (320, 240) → ({back[0].X:F2}, {back[0].Y:F2})");

        Cv2.ImShow("robot marks", img);
        Cv2.WaitKey(0);
    }
}`;

  const EX_SCANNER = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 문서/카드 스캐너: 기울어진 네 꼭짓점 → 반듯한 직사각형
        using var img = Cv2.ImRead("images/calib_grid_top.png", ImreadModes.Grayscale);
        Point2f[] corners = { new Point2f(95.30f, 72.80f), new Point2f(560.21f, 80.10f),
                              new Point2f(552.60f, 410.40f), new Point2f(88.70f, 398.89f) };
        using var flat = Scan(img, corners, 500, 350);
        Console.WriteLine($"스캔 결과 {flat.Width}x{flat.Height}");
        Cv2.ImShow("scan", flat);
        Cv2.WaitKey(0);
    }

    // 네 점(좌상 → 우상 → 우하 → 좌하) 을 w x h 직사각형으로 펴 준다
    static Mat Scan(Mat src, Point2f[] quad, int w, int h)
    {
        Point2f[] dst = { new Point2f(0, 0), new Point2f(w - 1, 0), new Point2f(w - 1, h - 1), new Point2f(0, h - 1) };
        using var H = Cv2.GetPerspectiveTransform(quad, dst);
        var outMat = new Mat();
        Cv2.WarpPerspective(src, outMat, H, new Size(w, h));
        return outMat;
    }
}`;

  const WPF_CODE = `// 🖥 WPF: 마우스로 찍은 네 점을 펴서 Image 컨트롤에 표시 (브라우저에서는 실행하지 않음)
using System.Collections.Generic;
using System.Windows;
using System.Windows.Input;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;

public partial class MainWindow : Window
{
    private Mat src = Cv2.ImRead("images/calib_grid_top.png", ImreadModes.Color);
    private readonly List<Point2f> picked = new List<Point2f>();

    private void PreviewImage_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        var p = e.GetPosition(PreviewImage);                  // Image 컨트롤 안의 좌표
        double sx = src.Width / PreviewImage.ActualWidth;      // 표시 배율 보정
        double sy = src.Height / PreviewImage.ActualHeight;
        picked.Add(new Point2f((float)(p.X * sx), (float)(p.Y * sy)));
        StatusText.Text = picked.Count + " / 4 점";
        if (picked.Count < 4) return;

        Point2f[] dst = { new Point2f(0, 0), new Point2f(499, 0), new Point2f(499, 349), new Point2f(0, 349) };
        using var H = Cv2.GetPerspectiveTransform(picked.ToArray(), dst);
        using var flat = new Mat();
        Cv2.WarpPerspective(src, flat, H, new Size(500, 350));
        ResultImage.Source = flat.ToBitmapSource();            // Mat → BitmapSource
        picked.Clear();
    }
}`;

  const QUIZ1 = [
    { q: '이미지를 <b>절반 크기로 줄일 때</b> 가장 알맞은 보간 방식은?', options: ['<code>InterpolationFlags.Nearest</code>', '<code>InterpolationFlags.Cubic</code>', '<code>InterpolationFlags.Area</code>', '<code>InterpolationFlags.Lanczos4</code>'], answer: 2,
      explain: '<b>축소는 Area</b>(영역 평균)가 기본입니다. 여러 픽셀을 평균 내므로 평균 밝기가 잘 보존되고 계단 무늬(에일리어싱)가 줄어듭니다. <b>확대는 Cubic</b>(또는 Linear)이 부드럽고, <code>Nearest</code> 는 픽셀 값을 그대로 복사하므로 계단이 보입니다.' },
    { q: '<code>Cv2.Resize(img, dst, new Size(0, 0), 2, 2)</code> 의 결과 크기는? (원본 640×480)', options: ['640×480', '1280×960', '320×240', '오류 — Size 를 지정해야 한다'], answer: 1,
      explain: '<code>Size(0, 0)</code> 을 주고 <code>fx</code>, <code>fy</code> 배율을 넘기면 <b>원본 × 배율</b> 크기가 됩니다. 반대로 Size 를 지정하면 배율은 무시됩니다. 둘 다 0 이면 예외가 납니다.' },
    { q: '<code>Cv2.GetRotationMatrix2D(center, 30, 1.0)</code> 이 돌려주는 것은?', options: ['회전된 이미지(Mat)', '3×3 원근 행렬', '2×3 어파인 행렬 (CV_64FC1)', '회전 각도(double)'], answer: 2,
      explain: '회전 <b>행렬만</b> 돌려줍니다(2행 3열, double). 실제로 이미지를 돌리려면 <code>Cv2.WarpAffine(src, dst, M, size)</code> 를 호출해야 합니다. 각도는 <b>반시계(CCW)가 +</b> 입니다.' },
    { q: '이미지를 오른쪽으로 50, 아래로 20 px 옮기는 어파인 행렬은?', options: ['<code>{1,0,50, 0,1,20}</code>', '<code>{1,0,20, 0,1,50}</code>', '<code>{0,1,50, 1,0,20}</code>', '<code>{50,0,1, 0,20,1}</code>'], answer: 0,
      explain: 'x\' = 1·x + 0·y + t<sub>x</sub>, y\' = 0·x + 1·y + t<sub>y</sub> 이므로 <code>new Mat(2, 3, MatType.CV_64FC1, new double[]{1,0,50, 0,1,20})</code> 입니다. 3열이 이동량입니다.' },
    { q: '45° 회전 후 모서리가 잘리지 않게 하려면?', options: ['<code>BorderTypes.Reflect</code> 를 쓴다', '출력 <code>Size</code> 를 계산해 키우고 이동량(3열)을 더한다', '<code>InterpolationFlags.Cubic</code> 을 쓴다', '<code>Cv2.Rotate</code> 를 쓴다'], answer: 1,
      explain: '<code>WarpAffine</code> 은 지정한 출력 크기 밖은 버립니다. <b>nw = h·|sinθ| + w·|cosθ|</b>, <b>nh = h·|cosθ| + w·|sinθ|</b> 로 새 크기를 구하고, 회전 행렬의 3열에 <code>nw/2 − cx</code>, <code>nh/2 − cy</code> 를 더해 중앙으로 옮깁니다.' }
  ];

  const QUIZ2 = [
    { q: '원근 변환(호모그래피) 행렬을 만들려면 대응점이 몇 쌍 필요한가?', options: ['2쌍', '3쌍', '4쌍', '6쌍'], answer: 2,
      explain: '원근 변환은 3×3 행렬이고 마지막 성분을 1로 고정하므로 미지수가 8개 → <b>4쌍</b>이 필요합니다(<code>Cv2.GetPerspectiveTransform</code>). 어파인은 2×3, 미지수 6개 → <b>3쌍</b>(<code>Cv2.GetAffineTransform</code>) 입니다.' },
    { q: '이미지 전체를 펴는 함수와 <b>점 좌표만</b> 변환하는 함수를 옳게 짝지은 것은?', options: ['<code>WarpPerspective</code> / <code>PerspectiveTransform</code>', '<code>PerspectiveTransform</code> / <code>WarpPerspective</code>', '<code>WarpAffine</code> / <code>Invert</code>', '<code>Remap</code> / <code>Transform</code>'], answer: 0,
      explain: '이미지는 <code>Cv2.WarpPerspective(src, dst, H, size)</code>, 점 배열은 <code>Cv2.PerspectiveTransform(points, H)</code> 입니다. 부품 중심 좌표 몇 개만 로봇 좌표로 바꿀 때 이미지 전체를 펼 필요가 없습니다.' },
    { q: '원근 변환에서 마지막 <b>나눗셈</b>(x\' = u/w) 이 하는 일은?', options: ['색을 보정한다', '멀리 있는 것이 작게 보이는 원근 효과를 만든다', '행렬을 정규화한다', '보간 오차를 줄인다'], answer: 1,
      explain: 'w = h<sub>20</sub>x + h<sub>21</sub>y + 1 로 나누기 때문에 위치에 따라 배율이 달라집니다. 어파인은 이 나눗셈이 없으므로(w = 1) 평행선이 항상 평행하게 유지됩니다.' },
    { q: 'px → mm 변환 행렬 <code>H</code> 로 로봇 좌표를 영상 좌표로 되돌리려면?', options: ['<code>H.T()</code>', '<code>Cv2.Invert(H, Hinv)</code> 후 <code>Hinv</code> 사용', '<code>H</code> 에 −1 을 곱한다', '<code>Cv2.InvertAffineTransform</code>'], answer: 1,
      explain: '<b>역행렬</b>을 구합니다: <code>Cv2.Invert(H, Hinv)</code>. (<code>Cv2.InvertAffineTransform</code> 은 2×3 어파인 전용입니다.) 또는 처음부터 mm→px 로 <code>GetPerspectiveTransform(mm4, px4)</code> 를 만들어도 됩니다.' },
    { q: '기준 마크 4개를 쓸 때 <b>가장 좋은 배치</b>는?', options: ['한 줄로 나란히', '작업 영역 네 귀퉁이에 넓게', '화면 가운데 모아서', '세 개는 모으고 하나만 멀리'], answer: 1,
      explain: '대응점이 <b>넓게 퍼져 있을수록</b> 행렬이 안정적입니다. 세 점이 한 직선 위에 있거나 좁은 영역에 모이면 행렬이 불안정해져(작은 검출 오차가 크게 증폭) 변환 결과가 크게 틀립니다.' }
  ];

  CS_COURSE.addChapter({
    id: 'cs11', no: '11', title: '기하 변환: 크기 · 회전 · 어파인 · 원근', subtitle: 'Resize · Flip · Rotate · WarpAffine · WarpPerspective 로 픽셀 위치를 옮기기',
    summary: '지금까지는 픽셀의 <b>값</b>을 바꿨습니다. 이번에는 픽셀의 <b>위치</b>를 바꿉니다. 크기 변경(<code>Resize</code>)과 보간 방식 선택, 뒤집기 · 90° 회전, 2×3 <b>어파인 변환</b>으로 기울어진 부품을 바로 세우고, 3×3 <b>원근 변환</b>으로 기울어 찍힌 평면을 정면화하며, 영상 좌표(px)를 로봇 좌표(mm)로 바꾸는 변환 행렬까지 만들어 봅니다.',
    goals: ['Resize 의 크기 · 배율 지정과 보간 방식(Nearest/Linear/Cubic/Area)을 상황에 맞게 고를 수 있다',
      '어파인 변환 2×3 행렬의 의미를 설명하고 GetRotationMatrix2D · WarpAffine 으로 기울기를 보정할 수 있다',
      '회전 후 잘리지 않게 출력 크기를 계산할 수 있다',
      'GetPerspectiveTransform · WarpPerspective 로 평면을 정면화하고, PerspectiveTransform 으로 px → mm 좌표 변환을 할 수 있다'],
    wpf: 'OpenCvWpfStarter',
    sections: [
      // ============================================================ 교시 1
      {
        id: 'cs11-1', title: '크기 · 뒤집기 · 회전과 어파인 변환', minutes: 50,
        goals: ['Resize 의 두 가지 사용법과 보간 방식의 차이를 안다', 'Flip · Rotate 로 빠르게 방향을 바꿀 수 있다', '어파인 2×3 행렬을 직접 만들고 WarpAffine 으로 기울기를 보정할 수 있다'],
        flow: [['도입: 왜 위치를 바꾸나', 5], ['Resize 와 보간', 15], ['Flip · Rotate · 어파인', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '픽셀의 값이 아니라 위치를 바꾼다' },
          { type: 'p', html: '07~10차시에서 배운 이진화 · 필터 · 에지는 모두 픽셀의 <b>값</b>을 바꾸는 일이었습니다. <b>기하 변환(Geometric transform)</b>은 픽셀의 <b>위치</b>를 옮깁니다. 현장에서 쓰는 곳은 분명합니다.' },
          { type: 'list', items: [
            '<b>속도</b>: 640×480 을 320×240 으로 줄이면 픽셀이 1/4 → 검사 속도가 몇 배 빨라집니다 (<code>Resize</code>).',
            '<b>정렬</b>: 트레이에 비뚤게 놓인 IC 칩을 바로 세워야 글자(OCR)를 읽을 수 있습니다 (<code>WarpAffine</code>).',
            '<b>정면화</b>: 카메라가 비스듬히 본 라벨 · 문서 · 교정판을 정면 모습으로 펴야 치수를 잴 수 있습니다 (<code>WarpPerspective</code>, 2교시).',
            '<b>좌표 변환</b>: 영상에서 찾은 부품 위치(px)를 로봇이 쓰는 실제 좌표(mm)로 바꿉니다 (2교시).'
          ] },
          { type: 'callout', kind: 'warn', title: '기하 변환의 공통 문제 두 가지', html: '① 옮긴 자리의 <b>값을 어디서 가져올지</b> — 원본에 없는 소수 좌표의 값을 추측해야 합니다(<b>보간, interpolation</b>). ② 원본에 없던 <b>빈 자리를 무엇으로 채울지</b> — <code>BorderTypes</code> 와 <code>borderValue</code> 로 정합니다.' },
          { type: 'h', text: 'Resize: 크기 지정 또는 배율 지정' },
          { type: 'figure', html: FIG_INTERP, caption: '그림 1. 원본 픽셀(●) 사이를 채우는 세 가지 방법 — Nearest 는 계단, Linear 는 직선, Cubic 은 곡선' },
          { type: 'table', head: ['InterpolationFlags', '뜻', '속도', '쓰는 곳'], rows: [
            ['<code>Nearest</code>', '가장 가까운 픽셀 값을 그대로 복사', '가장 빠름', '<b>라벨/마스크</b> 이미지(값이 섞이면 안 되는 것), 픽셀 값 확대 관찰'],
            ['<code>Linear</code>', '이웃 2×2 픽셀의 가중 평균', '빠름', '<b>기본값</b> — 대부분의 확대 · WarpAffine'],
            ['<code>Cubic</code>', '이웃 4×4 로 3차 곡선 맞춤', '느림(약 4배)', '<b>확대</b> 품질이 중요할 때 (에지가 더 살아남)'],
            ['<code>Area</code>', '줄어드는 영역의 픽셀 평균', '보통', '<b>축소</b> — 평균 밝기 보존, 계단 무늬(에일리어싱) 억제'],
            ['<code>Lanczos4</code>', '8×8 창의 Lanczos 보간', '가장 느림', '인쇄용 고품질 확대']
          ], caption: '표 1. 보간 방식 — 외우기: 축소는 Area, 확대는 Cubic, 라벨은 Nearest' },
          { type: 'code', title: '예제 1: Resize — 크기 지정 · 배율 지정과 보간 값 비교', code: EX_RESIZE,
            desc: '<code>Cv2.Resize(src, dst, new Size(w, h))</code> 는 크기를 직접, <code>new Size(0, 0)</code> + <code>fx, fy</code> 는 배율로 지정합니다. 뒤쪽은 2×2 (0, 100 / 200, 255) 를 4배 확대한 <b>첫 줄</b>입니다. Nearest 는 <code>0 0 0 0 100 100 100 100</code> 처럼 값이 계단으로 복사되고, Linear 는 0 → 100 사이를 직선으로, Cubic 은 곡선으로 채웁니다(양 끝에서 살짝 눌림).',
            expect: '원본: 640 x 480\nSize 지정: 320 x 240\n배율 1.5배: 960 x 720\nNearest : 0 0 0 0 100 100 100 100\nLinear  : 0 0 12 37 62 87 100 100\nCubic   : 0 0 0 16 45 72 91 95' },
          { type: 'code', title: '예제 2: 확대는 Cubic, 축소는 Area — 숫자로 확인', code: EX_QUALITY,
            desc: '앞부분은 30×30 ROI 를 8배(240×240) 확대한 결과입니다. <b>라플라시안 표준편차</b>는 값이 갑자기 꺾이는 정도 — Nearest 는 2.74 로 크고(계단), Linear · Cubic 은 1.04 로 매끄럽습니다. Cubic 은 에지에서 살짝 <b>넘어짐(overshoot)</b> 이 생겨 최소 밝기가 원본(76)보다 낮은 75 가 됩니다 — 그 대신 에지가 더 또렷합니다. 뒷부분은 1/4 축소인데, <b>Area</b> 의 평균(127.72)이 원본 평균(127.71)에 가장 가깝고 표준편차가 가장 작습니다(가는 선이 잘 섞여 들어감). 결과 창에서 세 확대 이미지를 눌러 픽셀 격자를 비교해 보세요.',
            expect: 'Nearest  240x240 계단 정도 2.74 밝기 76~149\nLinear   240x240 계단 정도 1.04 밝기 76~149\nCubic    240x240 계단 정도 1.04 밝기 75~149\n원본 ROI 밝기 76~149\n원본 평균 127.71\nNearest  1/4 축소: 평균 127.26 표준편차 63.24\nLinear   1/4 축소: 평균 127.83 표준편차 62.66\nArea     1/4 축소: 평균 127.72 표준편차 61.90' },
          { type: 'callout', kind: 'tip', title: '축소는 한 번에, 확대는 조금씩', html: '10배 축소를 <code>Nearest</code> 로 하면 10픽셀 중 1개만 남아 <b>가는 결함이 사라집니다</b>. 검사 전 축소는 반드시 <code>Area</code>(또는 <code>GaussianBlur</code> 후 Nearest)로 하세요. 반대로 <b>라벨 이미지</b>(연결 요소 번호가 들어 있는 Mat)는 평균을 내면 없는 번호가 생기므로 꼭 <code>Nearest</code> 를 씁니다.' },
          { type: 'h', text: 'Flip · Rotate: 90° 단위는 계산 없이' },
          { type: 'p', html: '좌우/위아래 뒤집기와 90° 단위 회전은 픽셀을 <b>그대로 옮기기만</b> 하므로 보간이 필요 없고 매우 빠릅니다. 90°·270° 회전은 <b>너비와 높이가 바뀝니다</b>(640×480 → 480×640).' },
          { type: 'table', head: ['코드', '뜻'], rows: [
            ['<code>Cv2.Flip(src, dst, FlipMode.X)</code>', '위아래 뒤집기 (x축 기준, 행 순서 역순)'],
            ['<code>Cv2.Flip(src, dst, FlipMode.Y)</code>', '좌우 뒤집기 (y축 기준, 거울 영상)'],
            ['<code>Cv2.Flip(src, dst, FlipMode.XY)</code>', '양쪽 모두 = 180° 회전'],
            ['<code>Cv2.Rotate(src, dst, RotateFlags.Rotate90Clockwise)</code>', '시계 방향 90° (크기 바뀜)'],
            ['<code>RotateFlags.Rotate180</code> / <code>Rotate90Counterclockwise</code>', '180° / 반시계 90°']
          ] },
          { type: 'code', title: '예제 3: Flip · Rotate · 평행 이동 행렬 직접 만들기', code: EX_FLIP,
            desc: '앞부분은 뒤집기 · 회전입니다. (0,0) 의 값이 X 뒤집기에서는 (479, 0) 에, Y 뒤집기에서는 (0, 639) 에 그대로 옮겨진 것을 확인하세요. 뒷부분은 <b>평행 이동 어파인 행렬</b>을 직접 만들어 넘긴 것입니다 — <code>{1, 0, tx, 0, 1, ty}</code>. 화면 밖에서 들어온 자리는 <code>BorderTypes.Constant</code> + <code>Scalar.All(0)</code> 이라 검게(0) 남습니다.',
            expect: '원본 640x480 / 90도 회전 480x640\n(0,0)=46 / X뒤집기 (479,0)=46 / Y뒤집기 (0,639)=46\n이동 결과 640x480, 빈 자리 값 0' },
          { type: 'h', text: '어파인 변환: 2×3 행렬 하나로' },
          { type: 'figure', html: FIG_AFFINE, caption: '그림 2. 어파인 변환 2×3 행렬 — 왼쪽 2×2 가 회전 · 크기 · 기울이기, 오른쪽 1열이 이동량' },
          { type: 'p', html: '이동 · 회전 · 크기 · 기울이기를 섞은 변환은 모두 <b>2×3 행렬 하나</b>로 표현됩니다. 직접 만들 수도 있고, 자주 쓰는 "중심 기준 회전 + 배율" 은 <code>Cv2.GetRotationMatrix2D(center, angle, scale)</code> 이 만들어 줍니다. 만든 행렬은 <code>Cv2.WarpAffine(src, dst, M, size, flags, borderMode, borderValue)</code> 로 적용합니다.' },
          { type: 'image', src: 'images/chip_rotated.png', caption: '트레이 위에 23.5° 기울어져 놓인 SOIC-16 칩 — 글자를 읽으려면 먼저 바로 세워야 한다', width: 420 },
          { type: 'code', title: '예제 4: 기울어진 칩 바로 세우기 (GetRotationMatrix2D + WarpAffine)', code: EX_ROTFIX,
            desc: '<code>images/chip_rotated.png</code> 의 칩은 <b>+23.5°</b> 기울어져 있습니다(<code>MinAreaRect</code> 로 측정하면 −23.50°). 같은 중심에서 <b>−23.5°</b> 로 도는 행렬을 만들어 적용하면 기울기가 0.00° 가 됩니다. 행렬의 왼쪽 2×2 는 cos · sin(−23.5°) = 0.9171, 0.3987 이고 3열은 "중심을 제자리에 두기 위한" 이동량입니다. <code>MinAreaRect</code> 의 각도는 −90°~0° 범위로 나오므로 −45° 미만이면 +90° 해서 0° 근처로 맞추는 관습을 <code>Angle</code> 메서드에 넣었습니다.',
            expect: '원본 기울기 -23.50 도\nM = 2x3 CV_64FC1\n  [0.9171 -0.3987 125.18]\n  [0.3987 0.9171 -111.41]\n보정 후 기울기 0.00 도' },
          { type: 'callout', kind: 'warn', title: '자주 틀리는 세 가지', html: '<ul><li><b>각도 부호</b>: <code>GetRotationMatrix2D</code> 의 각도는 <b>반시계(CCW) 가 +</b> 입니다. +23.5° 기울어진 것을 바로 세우려면 <b>−23.5°</b> 를 넣습니다.</li><li><b>중심</b>: 회전 중심을 (0, 0) 으로 두면 이미지가 화면 밖으로 날아갑니다. 보통 물체의 중심이나 이미지 중심을 씁니다.</li><li><b>행렬 형식</b>: 직접 만들 때 <code>MatType.CV_64FC1</code>(double) 이어야 합니다. <code>CV_8UC1</code> 로 만들면 값이 잘려 엉뚱한 결과가 나옵니다.</li></ul>' },
          { type: 'h', text: '회전하면 모서리가 잘린다' },
          { type: 'figure', html: FIG_CROP, caption: '그림 3. 출력 크기를 원본으로 두면 모서리가 잘린다 — 새 크기를 계산하고 이동량을 더해야 전체가 담긴다' },
          { type: 'code', title: '예제 5: 잘림 없이 회전하기 (출력 크기 계산 + borderValue)', code: EX_CROP,
            desc: '<code>WarpAffine</code> 은 <b>지정한 출력 크기 밖은 그냥 버립니다</b>. 회전 행렬의 (0,0) = cosθ, (0,1) = −sinθ 를 이용해 <b>nw = h·|sin| + w·|cos|</b>, <b>nh = h·|cos| + w·|sin|</b> 로 새 크기를 구하고, 3열(이동량)에 <code>nw/2 − cx</code> · <code>nh/2 − cy</code> 를 더해 새 화면의 중앙으로 옮깁니다. 빈 자리는 <code>borderValue</code> 로 흰색(255)이 됩니다. 결과 창에서 "cut" 과 "full" 을 비교해 보세요.',
            expect: '원본 640x480 → 새 크기 791x791\n잘린 결과 640x480 / 전체 담은 결과 791x791\nfull 의 왼쪽 위 모서리 값 255 (borderValue 255)' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: 'WPF <code>Image</code> 컨트롤에 큰 이미지를 그대로 넘기면 느려집니다. <b>표시용은 축소(<code>Area</code>) 한 사본</b>을 쓰고, 검사 · 측정은 원본 Mat 으로 하세요. <code>Image</code> 의 <code>RenderTransform</code>(<code>RotateTransform</code>, <code>ScaleTransform</code>) 은 <b>화면만</b> 돌리므로 픽셀 데이터는 그대로입니다 — OCR · 측정처럼 데이터를 써야 한다면 <code>Cv2.WarpAffine</code> 으로 실제 Mat 을 돌려야 합니다.' },
          { type: 'callout', kind: 'field', title: '현장 이야기: 왜 굳이 이미지를 돌리나', html: '회전한 물체를 읽는 방법은 두 가지입니다. ① <b>이미지를 돌린다</b>(<code>WarpAffine</code>) — 이후 처리(OCR · 템플릿 매칭 · ROI 검사)가 모두 간단해지지만 보간 때문에 픽셀 값이 살짝 변합니다. ② <b>좌표만 돌린다</b> — 원본 픽셀을 그대로 쓰므로 치수 측정에 유리합니다. <b>측정은 ②, 판독은 ①</b> 이 실무의 기본 선택입니다.' }
        ],
        practice: [
          {
            title: '썸네일 만들기 — 보간 방식 바꿔 보기', level: 1,
            desc: '<code>images/plate_holes.png</code>(800×600) 를 <b>가로 200 px</b> 짜리 썸네일로 줄이세요. 비율(3:4)을 유지하도록 높이를 계산하고, <code>Area</code> 와 <code>Nearest</code> 두 가지로 줄여 <b>평균 밝기</b>를 비교해 출력하세요.',
            hint: '높이 = 원본높이 × 200 / 원본너비. 배율로 하려면 <code>double s = 200.0 / img.Width;</code> 를 구해 <code>Cv2.Resize(img, dst, new Size(0, 0), s, s, f)</code> 로 넘깁니다. 평균은 <code>Cv2.Mean(dst).Val0</code>.',
            expect: '원본 800x600 평균 102.56\nArea     200x150 평균 102.57\nNearest  200x150 평균 102.59',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/plate_holes.png", ImreadModes.Grayscale);
        Console.WriteLine($"원본 {img.Width}x{img.Height} 평균 {Cv2.Mean(img).Val0:F2}");

        double s = 200.0 / img.Width;
        // TODO: Area 와 Nearest 로 각각 줄이고 크기 · 평균 밝기를 출력하세요

        Cv2.ImShow("input", img);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/plate_holes.png", ImreadModes.Grayscale);
        Console.WriteLine($"원본 {img.Width}x{img.Height} 평균 {Cv2.Mean(img).Val0:F2}");

        double s = 200.0 / img.Width;
        foreach (var f in new[] { InterpolationFlags.Area, InterpolationFlags.Nearest })
        {
            using var thumb = new Mat();
            Cv2.Resize(img, thumb, new Size(0, 0), s, s, f);
            Console.WriteLine($"{f,-8} {thumb.Width}x{thumb.Height} 평균 {Cv2.Mean(thumb).Val0:F2}");
            Cv2.ImShow(f.ToString(), thumb);
        }
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '기울어진 판을 스스로 바로 세우기', level: 2,
            desc: '<code>images/bracket_edges.png</code> 는 <b>3.5°</b> 기울어진 판(백라이트 실루엣 → 판이 <b>어둡다</b>)입니다. 각도를 <b>코드로 측정</b>해서(<code>MinAreaRect</code>) 그만큼 되돌리는 행렬을 만들고, 보정 후 각도가 0 에 가까워지는지 확인하세요. 회전 중심은 <code>MinAreaRect</code> 의 <code>Center</code> 를 쓰세요.',
            hint: '① 이진화(판이 어두우므로 <code>ThresholdTypes.BinaryInv | Otsu</code>) ② 가장 큰 외곽 윤곽선 ③ <code>RotatedRect rr = Cv2.MinAreaRect(big)</code> ④ 각도 정규화: <code>double a = rr.Angle; if (a &lt; -45) a += 90;</code> ⑤ <code>Cv2.GetRotationMatrix2D(rr.Center, a, 1.0)</code> — 측정 각도를 그대로 넣으면 되돌려집니다.',
            expect: '측정 각도 -3.50 중심 (318.6, 241.3)\n보정 후 각도 0.00 크기 169.0x379.0',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Point[] big = cs[0];
        foreach (var c in cs) if (Cv2.ContourArea(c) > Cv2.ContourArea(big)) big = c;
        RotatedRect rr = Cv2.MinAreaRect(big);
        Console.WriteLine($"측정 각도 {rr.Angle:F2} 중심 ({rr.Center.X:F1}, {rr.Center.Y:F1})");

        // TODO: 각도를 정규화하고 GetRotationMatrix2D + WarpAffine 으로 보정하세요
        // TODO: 보정 후 MinAreaRect 각도를 다시 재어 출력하세요

        Cv2.ImShow("input", img);
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
        RotatedRect rr = Measure(img);
        double a = rr.Angle; if (a < -45) a += 90;
        Console.WriteLine($"측정 각도 {a:F2} 중심 ({rr.Center.X:F1}, {rr.Center.Y:F1})");

        using var M = Cv2.GetRotationMatrix2D(rr.Center, a, 1.0);
        using var dst = new Mat();
        Cv2.WarpAffine(img, dst, M, new Size(img.Width, img.Height),
                       InterpolationFlags.Linear, BorderTypes.Constant, Scalar.All(0));
        RotatedRect r2 = Measure(dst);
        double a2 = r2.Angle; if (a2 < -45) a2 += 90;
        Console.WriteLine($"보정 후 각도 {a2:F2} 크기 {r2.Size.Width:F1}x{r2.Size.Height:F1}");

        Cv2.ImShow("input", img);
        Cv2.ImShow("fixed", dst);
        Cv2.WaitKey(0);
    }

    static RotatedRect Measure(Mat gray)
    {
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Point[] big = cs[0];
        foreach (var c in cs) if (Cv2.ContourArea(c) > Cv2.ContourArea(big)) big = c;
        return Cv2.MinAreaRect(big);
    }
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '기하 변환 ①', subtitle: '크기 · 뒤집기 · 회전과 어파인 변환', notes: '<p>💬 “트레이에 부품이 비뚤게 놓여 있으면 어떻게 읽을까요?” — 예상 답: 돌려서 읽는다. 이번 시간에는 픽셀의 <b>값</b>이 아니라 <b>위치</b>를 바꾸는 방법을 배운다고 안내합니다. (2분)</p>' },
          { layout: 'bullets', title: '왜 위치를 바꾸나', lead: '기하 변환이 필요한 네 장면', bullets: [
            '<b>속도</b>: 640×480 → 320×240 이면 픽셀 1/4 (Resize)',
            '<b>정렬</b>: 비뚤어진 칩을 바로 세워 글자 읽기 (WarpAffine)',
            '<b>정면화</b>: 비스듬히 본 라벨/문서 펴기 (WarpPerspective, 2교시)',
            '<b>좌표 변환</b>: 영상 px → 로봇 mm (2교시)',
            ['공통 문제 2개', ['소수 좌표의 값을 어떻게 추측? → <b>보간</b>', '빈 자리는 무엇으로? → <b>BorderTypes</b>']]
          ], notes: '<p>실무에서 가장 흔한 것은 ①속도용 축소와 ④좌표 변환입니다. 오늘은 ①②③을, 좌표 변환은 2교시에 다룬다고 예고합니다. (4분)</p>' },
          { layout: 'diagram', title: '보간: 픽셀 사이를 채우는 방법', html: FIG_INTERP, caption: 'Nearest 는 계단, Linear 는 직선, Cubic 은 곡선', notes: '<p>그래프의 ●이 원본 픽셀임을 강조합니다. 💬 “확대하면 픽셀이 늘어나는데, 없는 값은 어디서 오나요?” — 이웃에서 추측(보간). Nearest 는 “그대로 복사”라서 계단이 보인다는 점을 손으로 짚어 줍니다. (5분)</p>' },
          { layout: 'table', title: '보간 방식 고르기', head: ['방식', '뜻', '쓰는 곳'], rows: [
            ['<code>Nearest</code>', '가장 가까운 값 복사', '라벨/마스크, 픽셀 관찰'],
            ['<code>Linear</code>', '2×2 가중 평균', '<b>기본값</b>'],
            ['<code>Cubic</code>', '4×4 곡선 맞춤', '<b>확대</b> 품질'],
            ['<code>Area</code>', '영역 평균', '<b>축소</b>'],
            ['<code>Lanczos4</code>', '8×8 Lanczos', '고품질 확대']
          ], lead: '외우기: 축소는 Area, 확대는 Cubic, 라벨은 Nearest', notes: '<p>한 줄로 외우게 합니다: <b>축소 Area · 확대 Cubic · 라벨 Nearest</b>. 💬 “라벨 이미지를 Linear 로 줄이면?” — 1번과 3번 사이에 없는 2번 라벨이 생긴다. (3분)</p>' },
          { layout: 'code', title: 'Resize 두 가지 사용법', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        using var a = new Mat();
        Cv2.Resize(img, a, new Size(320, 240));           // 크기 지정
        using var b = new Mat();
        Cv2.Resize(img, b, new Size(0, 0), 1.5, 1.5);      // 배율 지정
        Console.WriteLine($"{img.Width}x{img.Height} → {a.Width}x{a.Height} / {b.Width}x{b.Height}");
        Cv2.ImShow("half", a);
        Cv2.WaitKey(0);
    }
}`, points: ['<code>new Size(w, h)</code> = 크기 직접 지정', '<code>new Size(0, 0)</code> + <code>fx, fy</code> = 배율', '둘 다 0 이면 예외', '여섯 번째 인수가 <code>InterpolationFlags</code>'], notes: '<p>실행해 보고 배율을 0.5 · 3 으로 바꿔 보게 합니다. Size(0,0) 을 빼면 어떤 오류가 나는지도 한 번 보여 주면 좋습니다. (5분)</p>' },
          { layout: 'code', title: '보간이 만드는 값 — 2×2 를 4배로', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var tiny = new Mat(2, 2, MatType.CV_8UC1, new byte[] { 0, 100, 200, 255 });
        foreach (var f in new[] { InterpolationFlags.Nearest,
                                  InterpolationFlags.Linear, InterpolationFlags.Cubic })
        {
            using var up = new Mat();
            Cv2.Resize(tiny, up, new Size(8, 8), 0, 0, f);
            string s = "";
            for (int x = 0; x < 8; x++) s += up.At<byte>(0, x) + " ";
            Console.WriteLine($"{f,-8}: {s}");
        }
    }
}`, points: ['Nearest: <code>0 0 0 0 100 100 100 100</code> (계단)', 'Linear: <code>0 0 12 37 62 87 100 100</code> (직선)', 'Cubic: <code>0 0 0 16 45 72 91 95</code> (곡선, 끝이 눌림)'], notes: '<p>세 줄의 숫자를 같이 읽습니다. Linear 의 12 · 37 · 62 · 87 이 25 씩 커지는 직선이라는 것을 짚어 주면 “선형”이라는 이름이 이해됩니다. (5분)</p>' },
          { layout: 'two', title: '축소와 확대는 다른 문제', left: { title: '축소 (여러 픽셀 → 1개)', bullets: ['Nearest: 1개만 남기고 <b>버림</b> → 가는 결함 소실', 'Area: 평균 → 밝기 보존, 에일리어싱 억제', '측정 전 축소는 <b>Area</b>', '예제 결과: 평균 127.26(N) vs <b>127.72(A)</b> / 원본 127.71'] }, right: { title: '확대 (1픽셀 → 여러 개)', bullets: ['Nearest: 블록(계단) — 라플라시안 2.74', 'Linear/Cubic: 매끄러움 — 1.04', 'Cubic 은 에지에서 살짝 넘어짐(75 &lt; 76)', '확대는 <b>Cubic</b>, 급하면 Linear'] }, notes: '<p>축소/확대는 반대 문제라는 점을 강조합니다. 💬 “10배 축소를 Nearest 로 하면 폭 1 px 긁힘은?” — 90% 확률로 사라진다. 이것이 현장에서 검사 실패의 흔한 원인입니다. (5분)</p>' },
          { layout: 'diagram', title: '어파인 변환 = 2×3 행렬', html: FIG_AFFINE, caption: '왼쪽 2×2 가 회전 · 크기 · 기울이기, 3열이 이동량', notes: '<p>x\' = a·x + b·y + t<sub>x</sub> 를 칠판에 한 번 써 봅니다. 이동/회전/크기 행렬 세 개를 보여 주고, 💬 “회전 행렬에서 θ = 0 이면?” — 단위행렬(변화 없음). 대응점 3쌍이면 6개 미지수를 풀 수 있다는 점도 언급. (5분)</p>' },
          { layout: 'image', title: '문제: 23.5° 기울어진 칩', src: 'images/chip_rotated.png', caption: '글자(MV2026)를 읽으려면 먼저 바로 세워야 한다', notes: '<p>이미지를 크게 띄웁니다. 💬 “이 칩의 글자를 OCR 로 읽으려면 무엇이 먼저 필요할까요?” — 회전 보정. 각도는 어떻게 알까요? — 12차시에서 배울 MinAreaRect(미리보기). (3분)</p>' },
          { layout: 'code', title: '회전 보정: GetRotationMatrix2D + WarpAffine', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/chip_rotated.png", ImreadModes.Grayscale);
        var center = new Point2f(330.4f, 245.2f);
        using var M = Cv2.GetRotationMatrix2D(center, -23.5, 1.0);   // 반시계 +
        Console.WriteLine($"M = {M.Rows}x{M.Cols} {M.Type()}");
        Console.WriteLine($"[{M.At<double>(0, 0):F4} {M.At<double>(0, 1):F4} {M.At<double>(0, 2):F2}]");

        using var dst = new Mat();
        Cv2.WarpAffine(img, dst, M, new Size(img.Width, img.Height),
                       InterpolationFlags.Linear, BorderTypes.Constant, Scalar.All(200));
        Cv2.ImShow("input", img);
        Cv2.ImShow("fixed", dst);
        Cv2.WaitKey(0);
    }
}`, points: ['각도는 <b>반시계(+)</b> → +23.5° 기울기는 <b>−23.5°</b> 로 보정', '행렬만 만들고 <code>WarpAffine</code> 으로 적용', 'borderValue 200 = 트레이와 비슷한 밝은 값'], notes: '<p>실행해 두 창을 비교합니다. 각도를 +23.5 로 바꿔 더 기울어지는 것을 보여 주면 부호가 확실히 기억됩니다. borderValue 를 0 으로 바꿔 보게도 합니다. (7분)</p>' },
          { layout: 'diagram', title: '회전하면 모서리가 잘린다', html: FIG_CROP, caption: 'nw = h·|sinθ| + w·|cosθ|, nh = h·|cosθ| + w·|sinθ|', notes: '<p>💬 “45° 돌렸는데 모서리가 사라졌습니다. 왜?” — 출력 크기가 원본과 같아서 밖으로 나간 부분이 버려짐. 새 크기 공식을 칠판에 쓰고, 행렬 3열에 중앙 이동을 더한다는 점을 강조합니다. 640×480 → 791×791. (5분)</p>' },
          { layout: 'practice', title: '실습: 스스로 각도를 재서 보정', desc: '<p><code>images/bracket_edges.png</code>(+3.5° 기울어진 판)의 각도를 <b>코드로 측정</b>해 보정하세요.</p><ul><li><code>MinAreaRect</code> 로 각도 · 중심 얻기</li><li>각도 정규화: <code>if (a &lt; -45) a += 90;</code></li><li>보정 후 각도를 다시 재어 0 에 가까운지 확인</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Point[] big = cs[0];
        foreach (var c in cs) if (Cv2.ContourArea(c) > Cv2.ContourArea(big)) big = c;
        RotatedRect rr = Cv2.MinAreaRect(big);
        Console.WriteLine($"측정 각도 {rr.Angle:F2}");
        // TODO: 보정하고 다시 각도를 재세요
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        Point[] big = cs[0];
        foreach (var c in cs) if (Cv2.ContourArea(c) > Cv2.ContourArea(big)) big = c;
        RotatedRect rr = Cv2.MinAreaRect(big);
        double a = rr.Angle; if (a < -45) a += 90;
        Console.WriteLine($"측정 각도 {a:F2}");
        using var M = Cv2.GetRotationMatrix2D(rr.Center, a, 1.0);
        using var dst = new Mat();
        Cv2.WarpAffine(img, dst, M, new Size(img.Width, img.Height));
        Cv2.ImShow("fixed", dst);
        Cv2.WaitKey(0);
    }
}`, notes: '<p><code>MinAreaRect</code> 가 보고하는 각도는 <b>−3.50°</b> 이고, 그 값을 그대로 <code>GetRotationMatrix2D</code> 에 넣으면 보정 후 0.00° 가 됩니다. 학생들이 부호를 반대로 넣어 7° 기울어지는 실수를 자주 합니다 — 그 결과를 보여 주며 “측정 각도를 그대로 넣으면 되돌려진다”를 정리합니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<code>Cv2.Resize</code>: <code>Size</code> 지정 또는 <code>fx, fy</code> 배율 — <b>축소 Area · 확대 Cubic · 라벨 Nearest</b>', '<code>Flip</code>(X/Y/XY) · <code>Rotate</code>(90° 단위)는 보간 없이 빠르다 (90°는 W↔H 바뀜)', '어파인 = <b>2×3 CV_64FC1</b> 행렬, 3열이 이동량 — <code>WarpAffine</code> 으로 적용', '<code>GetRotationMatrix2D(center, angle, scale)</code>: 각도는 <b>반시계 +</b>', '잘림 방지: 새 크기 계산 + 3열에 중앙 이동 더하기, 빈 자리는 <code>borderValue</code>', '다음: 대응점으로 변환 행렬 만들기 — 어파인 3점, 원근 4점'], notes: '<p>세 가지를 반복해 읽힙니다: 보간 선택 규칙, 각도 부호, 출력 크기. 2교시에는 “행렬을 계산하지 않고 <b>점을 짝지어</b> 만드는” 방법을 배운다고 예고합니다. (2분)</p>' }
        ]
      },
      // ============================================================ 교시 2
      {
        id: 'cs11-2', title: '대응점으로 만드는 변환: 어파인 3점 · 원근 4점', minutes: 50,
        goals: ['GetAffineTransform(3점) 과 GetPerspectiveTransform(4점) 의 차이를 안다', 'WarpPerspective 로 기울어 찍힌 평면을 정면화할 수 있다', 'PerspectiveTransform 과 Invert 로 px ↔ mm 좌표 변환을 할 수 있다'],
        flow: [['도입: 비스듬히 찍힌 평면', 5], ['어파인 3점 · 원근 4점', 15], ['정면화 · px→mm 변환', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '행렬을 계산하지 말고, 점을 짝지어라' },
          { type: 'p', html: '1교시에서는 행렬을 직접 만들거나 <code>GetRotationMatrix2D</code> 로 얻었습니다. 그런데 현장에서는 보통 <b>"이 점이 저기로 가야 한다"</b> 는 정보밖에 없습니다. 기판의 피듀셜 마크 위치, 교정판 네 귀퉁이, 컨베이어의 기준 마크 4개처럼요. OpenCV 는 이런 <b>대응점(corresponding points)</b> 만 주면 변환 행렬을 풀어 줍니다.' },
          { type: 'figure', html: FIG_PERSP, caption: '그림 4. 어파인은 3쌍(2×3), 원근은 4쌍(3×3) — 원근은 마지막에 w 로 나누기 때문에 원근감이 생긴다' },
          { type: 'table', head: ['', '어파인 (Affine)', '원근 (Perspective · Homography)'], rows: [
            ['행렬 크기', '2×3', '3×3 (마지막 성분 = 1)'],
            ['미지수', '6개', '8개'],
            ['필요한 대응점', '<b>3쌍</b>', '<b>4쌍</b>'],
            ['만들기', '<code>Cv2.GetAffineTransform(src3, dst3)</code>', '<code>Cv2.GetPerspectiveTransform(src4, dst4)</code>'],
            ['이미지 적용', '<code>Cv2.WarpAffine</code>', '<code>Cv2.WarpPerspective</code>'],
            ['점만 변환', '<code>Cv2.Transform</code>', '<code>Cv2.PerspectiveTransform</code>'],
            ['성질', '평행선 유지, 원근 없음', '사각형 → 임의의 사각형 (기울어진 평면)'],
            ['점이 많을 때', '<code>Cv2.EstimateAffine2D</code>', '<code>Cv2.FindHomography</code> (RANSAC)']
          ], caption: '표 2. 어파인 vs 원근 — 대응점 개수와 함수 이름이 다르다' },
          { type: 'code', title: '예제 1: GetAffineTransform — 세 점을 짝지어 행렬 만들기', code: EX_AFFINE3,
            desc: '원본의 세 점 (0,0) · (639,0) · (0,479) 가 각각 (60,40) · (600,90) · (10,450) 으로 가도록 하는 2×3 행렬을 구합니다. 마지막 줄의 검산처럼 행렬에 직접 좌표를 대입하면 정확히 짝지은 점이 나옵니다. 세 점만 정하면 <b>나머지 모든 픽셀의 위치가 자동으로 정해진다</b>는 점이 핵심입니다.',
            expect: 'A = 2x3 CV_64FC1\n  [0.8451 -0.1044 60.00]\n  [0.0782 0.8559 40.00]\n(639, 0) → (600.0, 90.0)' },
          { type: 'callout', kind: 'warn', title: '세 점이 한 직선 위에 있으면 안 된다', html: '어파인 3점이 <b>일직선</b>이거나 거의 겹치면 행렬을 풀 수 없습니다(또는 엉뚱한 값). 원근 4점도 <b>세 점이 일직선</b>이면 안 됩니다. 실무에서는 작업 영역의 <b>네 귀퉁이처럼 넓게 퍼진 점</b>을 씁니다 — 검출 오차가 1 px 있어도 결과가 크게 흔들리지 않습니다.' },
          { type: 'h', text: '원근 변환: 비스듬히 본 평면을 정면으로' },
          { type: 'p', html: '카메라가 평면을 정면에서 보지 않으면 직사각형이 <b>사다리꼴</b>로 찍힙니다. 이때 "원래 직사각형의 네 꼭짓점이 영상에서 어디에 찍혔는지" 를 알면, 네 점을 반듯한 직사각형으로 보내는 3×3 행렬(<b>호모그래피</b>)로 평면 전체를 정면화할 수 있습니다. 스마트폰의 문서 스캐너가 바로 이 원리입니다.' },
          { type: 'image', src: 'images/calib_grid_top.png', caption: '점 격자 교정판 — 카메라가 살짝 기울어 약한 원근이 있다 (11×8 = 88개 점, 간격 5 mm)', width: 420 },
          { type: 'code', title: '예제 2: 교정판 정면화 (GetPerspectiveTransform + WarpPerspective)', code: EX_FRONT,
            desc: '격자 네 귀퉁이 점의 영상 좌표를 <b>1 mm = 10 px</b> 인 정면 좌표로 보냅니다. 점 간격 5 mm 는 정확히 50 px 이 되어야 합니다. 변환 뒤 점 88개를 검출해 보니 x 가 50 ~ 550, y 가 50 ~ 400 범위에 놓입니다 — 10칸 × 50 px = 500, 7칸 × 50 px = 350 과 정확히 맞습니다. 즉 이 이미지에서는 <b>모든 거리를 0.1 mm/px 로 바로 읽을 수 있게</b> 바뀐 것입니다.',
            expect: '정면화 결과 600x450\n점 88개\nx 범위 49.0 ~ 550.0\ny 범위 49.9 ~ 400.2' },
          { type: 'callout', kind: 'tip', title: 'Warp vs Transform — 헷갈리면 안 되는 짝', html: '<b>이미지 전체</b>를 펴는 것은 <code>Cv2.WarpPerspective(src, dst, H, size)</code>, <b>점 좌표 몇 개</b>만 바꾸는 것은 <code>Cv2.PerspectiveTransform(points, H)</code> 입니다. 부품 중심 5개를 로봇 좌표로 바꾸는 데 이미지 전체를 펴는 것은 수천 배 낭비입니다 — <b>점만 변환</b>하세요.' },
          { type: 'h', text: '영상 좌표(px) → 로봇 좌표(mm)' },
          { type: 'figure', html: FIG_PXMM, caption: '그림 5. 로봇 좌표를 아는 기준 마크 4개로 px → mm 변환 행렬을 만든다 (2D 핸드-아이 교정)' },
          { type: 'p', html: '로봇이 부품을 집으려면 <b>영상에서 찾은 위치(px)를 로봇이 쓰는 좌표(mm)</b> 로 바꿔 줘야 합니다. 부품이 모두 같은 평면(컨베이어) 위에 있다면 3×3 호모그래피 하나로 충분합니다. <code>images/robot_pick.png</code> 에는 <b>로봇 좌표를 아는 기준 마크 4개</b>가 있습니다.' },
          { type: 'table', head: ['마크', '영상 좌표 (px)', '로봇 좌표 (mm)'], rows: [
            ['M1', '(61.56, 57.38)', '(270, 90)'],
            ['M2', '(583.83, 65.15)', '(530, 90)'],
            ['M3', '(574.58, 426.42)', '(530, −90)'],
            ['M4', '(67.27, 419.64)', '(270, −90)']
          ], caption: '표 3. robot_pick.png 의 기준 마크 — 마크를 미리 로봇으로 찍어(티칭) 좌표를 기록해 둔다' },
          { type: 'code', title: '예제 3: px → mm 변환 행렬 만들고 점 좌표 바꾸기', code: EX_PXMM,
            desc: '기준 마크 4쌍으로 <code>H</code> 를 만들면, 마크 자신은 당연히 정확히 (270, 90) · (530, 90) 으로 돌아옵니다(검산). 영상 중앙 (320, 240) 은 로봇 좌표 (398.94, 2.36) mm 입니다. H 의 (2,0) · (2,1) 성분이 −0.000003 · −0.000079 처럼 <b>아주 작지만 0 이 아닌</b> 값인 것이 원근이 조금 들어 있다는 뜻입니다. y 대각 성분이 음수(−0.487560)인 것은 <b>영상의 y 는 아래로, 로봇의 Y 는 위로</b> 커지기 때문입니다.',
            expect: 'H = 3x3 CV_64FC1\n  [  0.493715  -0.029059   240.0046]\n  [  0.006879  -0.487560   117.1295]\n  [ -0.000003  -0.000079     1.0000]\n  px (61.6, 57.4) → mm (270.00, 90.00)\n  px (583.8, 65.2) → mm (530.00, 90.00)\n  px (320.0, 240.0) → mm (398.94, 2.36)' },
          { type: 'code', title: '예제 4: 역변환 — 로봇 좌표를 영상에 표시하기', code: EX_INVERT,
            desc: '<code>Cv2.Invert(H, Hinv)</code> 로 역행렬을 구하면 <b>mm → px</b> 변환이 됩니다. 로봇의 목표 위치를 영상에 십자로 표시해 오퍼레이터에게 보여 주거나, 검사 ROI 를 mm 단위로 정의할 때 씁니다. 마지막 줄은 px → mm → px 왕복이 제자리로 돌아오는지 확인한 것입니다(수치 오차가 거의 없음).',
            expect: '  mm (400, 0) → px (322.07, 244.78)\n  mm (320, 30) → px (163.13, 181.92)\n  mm (470, 40) → px (461.86, 165.90)\n왕복 확인: (320, 240) → (320.00, 240.00)' },
          { type: 'code', title: '예제 5: 카드 · 문서 스캐너를 함수로 정리', code: EX_SCANNER,
            desc: '네 꼭짓점을 <b>좌상 → 우상 → 우하 → 좌하</b> 순서로 넘기면 원하는 크기의 직사각형으로 펴 주는 함수입니다. 실제 앱에서는 ① Canny + <code>FindContours</code> 로 종이의 사각형 윤곽을 찾고 ② <code>ApproxPolyDP</code> 로 꼭짓점 4개를 얻어(12차시) ③ 이 함수에 넘깁니다. 출력 크기를 원본 종이의 가로:세로 비율(예: A4 = 210:297)로 주면 비율까지 바로잡힙니다.',
            expect: '스캔 결과 500x350' },
          { type: 'callout', kind: 'warn', title: '점 순서가 어긋나면 결과가 뒤집힌다', html: 'src 와 dst 의 점은 <b>같은 순서</b>로 짝지어야 합니다. 좌상 → 우상 → 우하 → 좌하 를 섞으면 결과가 좌우 반전되거나 X 자로 접힌 그림이 나옵니다. 검출된 꼭짓점 4개는 보통 <b>중심을 기준으로 각도 정렬</b>하거나 "x+y 가 최소 = 좌상, 최대 = 우하" 규칙으로 정렬합니다.' },
          { type: 'callout', kind: 'field', title: '현장 이야기: 2D 핸드-아이 교정', html: '평면 위 픽킹은 이 4점 호모그래피로 충분합니다(오차 < 0.5 mm). 다만 ① <b>부품 높이가 다르면</b> 시차(parallax) 때문에 틀립니다 — 높이별로 H 를 따로 만들거나 텔레센트릭 렌즈를 씁니다. ② 렌즈 왜곡이 크면 먼저 <code>Cv2.Undistort</code> 로 펴고 H 를 만듭니다(체스보드 캘리브레이션). ③ 마크는 <b>넓게, 4개 이상</b>을 쓰고 점이 많을 때는 <code>Cv2.FindHomography(..., HomographyMethods.Ransac)</code> 로 이상점을 걸러냅니다.' },
          { type: 'wpf', title: '마우스로 네 점을 찍어 펴는 WPF 화면', project: 'OpenCvWpfStarter', html: '<code>Image</code> 컨트롤의 <code>MouseLeftButtonDown</code> 에서 클릭 좌표를 모아 4개가 되면 <code>WarpPerspective</code> 로 펴서 결과 <code>Image</code> 에 표시합니다. 주의: 컨트롤 좌표는 <b>표시 크기</b> 기준이므로 <code>src.Width / PreviewImage.ActualWidth</code> 배율로 <b>원본 픽셀 좌표로 환산</b>해야 합니다.' },
          { type: 'code', title: '추가: WPF — 네 점 찍어 정면화 (Visual Studio 에서 실행)', code: WPF_CODE, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '브라우저에서는 마우스 이벤트 · <code>BitmapSource</code> 를 지원하지 않으므로 실행하지 않습니다. 콘솔 버전(예제 5)과 계산 부분은 완전히 같습니다 — 달라지는 것은 <b>네 점을 어디서 얻는지</b>와 <b>결과를 어떻게 보여 주는지</b>뿐입니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<ul><li><b>오개념 1</b>: “<code>WarpPerspective</code> 로 점도 바꿀 수 있다” → 이미지 전용입니다. 점은 <code>PerspectiveTransform</code>. 실습에서 가장 많이 나오는 오류입니다.</li><li><b>오개념 2</b>: “대응점을 많이 주면 <code>GetPerspectiveTransform</code> 이 더 정확해진다” → 정확히 4쌍만 받습니다. 많으면 <code>FindHomography</code>.</li><li><b>오개념 3</b>: “회전 각도는 시계 방향이 +” → OpenCV 의 <code>GetRotationMatrix2D</code> 는 반시계가 +.</li><li>평가 루브릭: ① Resize 보간 선택 근거 설명(3점) ② 어파인/원근의 대응점 개수와 함수 짝 맞추기(3점) ③ px→mm 변환 코드 완성 및 검산(4점).</li><li>💬 마무리 발문: “카메라를 옮겨 다시 설치하면 무엇을 다시 해야 할까?” — 기준 마크 4점을 다시 찍어 H 를 다시 만든다(재교정).</li></ul>' }
        ],
        practice: [
          {
            title: '부품 중심을 로봇 좌표로 바꾸기', level: 2,
            desc: '<code>images/robot_pick.png</code> 에서 부품 5개의 중심을 찾아 <b>로봇 좌표(mm)</b> 로 출력하세요. Otsu 이진화 후 <code>ConnectedComponentsEx</code> 로 블롭을 얻고, <b>면적 1500 ~ 5000</b> 인 것만 부품으로 봅니다(컨베이어 양쪽의 큰 띠는 면적이 3만 이상). 정답은 IMAGES.md 의 P1~P5: (320, 30) (400, −35) (470, 40) (300, −40) (400, 45) mm 입니다.',
            hint: '기준 마크 4쌍으로 <code>H</code> 를 만든 뒤, 블롭 중심 <code>b.Centroid</code>(Point2d)를 <code>new Point2f((float)b.Centroid.X, (float)b.Centroid.Y)</code> 로 바꿔 배열에 모으고 <code>Cv2.PerspectiveTransform(arr, H)</code> 를 한 번만 호출하세요. 출력 순서를 고정하려면 <code>OrderBy(b => b.Centroid.X)</code> 로 정렬합니다.',
            expect: '부품 5개\n  px (124.8, 321.7) → 로봇 (300.0, -39.9) mm\n  px (163.1, 181.9) → 로봇 (320.0, 30.0) mm\n  px (321.8, 314.6) → 로봇 (400.0, -34.9) mm\n  px (322.5, 153.6) → 로봇 (400.0, 45.0) mm\n  px (461.8, 165.8) → 로봇 (470.0, 40.0) mm',
            starter: `using System;
using System.Collections.Generic;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/robot_pick.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        var cc = Cv2.ConnectedComponentsEx(bin);
        var parts = cc.Blobs.Skip(1).Where(b => b.Area >= 1500 && b.Area <= 5000)
                      .OrderBy(b => b.Centroid.X).ToList();
        Console.WriteLine($"부품 {parts.Count}개");
        foreach (var b in parts)
            Console.WriteLine($"  px ({b.Centroid.X:F1}, {b.Centroid.Y:F1}) 면적 {b.Area}");

        // TODO: 기준 마크 4쌍으로 H(px→mm) 를 만드세요
        // TODO: 부품 중심을 Point2f[] 로 모아 Cv2.PerspectiveTransform 으로 mm 로 바꿔 출력하세요

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
        using var img = Cv2.ImRead("images/robot_pick.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        var cc = Cv2.ConnectedComponentsEx(bin);
        var parts = cc.Blobs.Skip(1).Where(b => b.Area >= 1500 && b.Area <= 5000)
                      .OrderBy(b => b.Centroid.X).ToList();
        Console.WriteLine($"부품 {parts.Count}개");

        Point2f[] mk = { new Point2f(61.56f, 57.38f), new Point2f(583.83f, 65.15f),
                         new Point2f(574.58f, 426.42f), new Point2f(67.27f, 419.64f) };
        Point2f[] mm = { new Point2f(270, 90), new Point2f(530, 90),
                         new Point2f(530, -90), new Point2f(270, -90) };
        using var H = Cv2.GetPerspectiveTransform(mk, mm);

        Point2f[] src = parts.Select(b => new Point2f((float)b.Centroid.X, (float)b.Centroid.Y)).ToArray();
        Point2f[] dst = Cv2.PerspectiveTransform(src, H);
        for (int k = 0; k < src.Length; k++)
            Console.WriteLine($"  px ({src[k].X:F1}, {src[k].Y:F1}) → 로봇 ({dst[k].X:F1}, {dst[k].Y:F1}) mm");

        Cv2.ImShow("bin", bin);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '기울어진 격자를 원하는 배율로 펴기', level: 3,
            desc: '<code>images/calib_grid_top.png</code> 를 <b>1 mm = 20 px</b>(0.05 mm/px) 로 정면화하세요. 점 간격 5 mm 는 100 px 이 되어야 합니다. 여백을 30 px 두고 출력 크기를 직접 계산해, 변환 후 점 88개의 x · y 범위가 예상과 맞는지 확인하세요.',
            hint: '격자는 가로 10칸(50 mm) × 세로 7칸(35 mm). 1 mm = 20 px 이면 격자가 1000 × 700 px, 여백 30 을 양쪽에 두면 출력 크기는 1060 × 760 입니다. dst 네 점은 (30,30) (1030,30) (1030,730) (30,730). 점 면적 기준도 배율이 커진 만큼 키워야 합니다(약 4배).',
            expect: '결과 1060x760 (점 간격 100 px 예상)\n점 88개\nx 29.0 ~ 1030.1 / y 29.0 ~ 730.1',
            starter: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/calib_grid_top.png", ImreadModes.Grayscale);
        Point2f[] src = { new Point2f(95.30f, 72.80f), new Point2f(560.21f, 80.10f),
                          new Point2f(552.60f, 410.40f), new Point2f(88.70f, 398.89f) };
        int pxPerMm = 20, margin = 30;
        // TODO: dst 네 점과 출력 크기를 계산해 WarpPerspective 하세요
        // TODO: 변환 결과에서 점을 검출해 개수와 x · y 범위를 출력하세요

        Cv2.ImShow("input", img);
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
        using var img = Cv2.ImRead("images/calib_grid_top.png", ImreadModes.Grayscale);
        Point2f[] src = { new Point2f(95.30f, 72.80f), new Point2f(560.21f, 80.10f),
                          new Point2f(552.60f, 410.40f), new Point2f(88.70f, 398.89f) };
        int pxPerMm = 20, margin = 30;
        int w = 50 * pxPerMm, h = 35 * pxPerMm;          // 격자 크기 (mm → px)
        Point2f[] dst = { new Point2f(margin, margin), new Point2f(margin + w, margin),
                          new Point2f(margin + w, margin + h), new Point2f(margin, margin + h) };
        using var H = Cv2.GetPerspectiveTransform(src, dst);
        using var top = new Mat();
        Cv2.WarpPerspective(img, top, H, new Size(w + 2 * margin, h + 2 * margin));
        Console.WriteLine($"결과 {top.Width}x{top.Height} (점 간격 {5 * pxPerMm} px 예상)");

        using var bin = new Mat();
        Cv2.Threshold(top, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Point[][] cs = Cv2.FindContoursAsArray(bin, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
        var dots = cs.Where(c => Cv2.ContourArea(c) > 200 && Cv2.ContourArea(c) < 4000)
                     .Select(c => Cv2.Moments(c))
                     .Select(m => new Point2f((float)(m.M10 / m.M00), (float)(m.M01 / m.M00)))
                     .ToList();
        Console.WriteLine($"점 {dots.Count}개");
        Console.WriteLine($"x {dots.Min(p => p.X):F1} ~ {dots.Max(p => p.X):F1} / y {dots.Min(p => p.Y):F1} ~ {dots.Max(p => p.Y):F1}");

        Cv2.ImShow("front", top);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '기하 변환 ②', subtitle: '대응점으로 만드는 변환 — 어파인 3점 · 원근 4점', notes: '<p>1교시 복습 한 줄: 행렬을 직접 만들거나 GetRotationMatrix2D 로 얻었다. 💬 “그런데 현장에서 각도를 모르고 <b>점 위치만</b> 안다면?” 이 질문으로 시작합니다. (2분)</p>' },
          { layout: 'diagram', title: '어파인 3점 vs 원근 4점', html: FIG_PERSP, caption: '원근은 마지막에 w 로 나누기 때문에 원근감이 생긴다', notes: '<p>미지수 개수로 설명합니다: 어파인 6개 → 점 3쌍(한 쌍이 식 2개), 원근 8개 → 4쌍. 아래쪽 3×3 행렬과 x\'=u/w 를 짚어 주고, 💬 “어파인은 왜 원근을 못 만드나?” — 나눗셈(w)이 없어서. (6분)</p>' },
          { layout: 'table', title: '함수 이름 짝 맞추기', head: ['', '어파인', '원근'], rows: [
            ['행렬', '2×3', '3×3'],
            ['대응점', '<b>3쌍</b>', '<b>4쌍</b>'],
            ['만들기', '<code>GetAffineTransform</code>', '<code>GetPerspectiveTransform</code>'],
            ['이미지', '<code>WarpAffine</code>', '<code>WarpPerspective</code>'],
            ['점만', '<code>Transform</code>', '<code>PerspectiveTransform</code>'],
            ['점 많을 때', '<code>EstimateAffine2D</code>', '<code>FindHomography</code>']
          ], notes: '<p>이 표를 노트에 그대로 적게 합니다. 특히 <b>Warp(이미지) / Transform(점)</b> 구분이 시험과 실습에서 가장 많이 틀리는 부분입니다. (4분)</p>' },
          { layout: 'code', title: 'GetAffineTransform: 세 점만 정하면 끝', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        Point2f[] src = { new Point2f(0, 0), new Point2f(639, 0), new Point2f(0, 479) };
        Point2f[] dst = { new Point2f(60, 40), new Point2f(600, 90), new Point2f(10, 450) };
        using var A = Cv2.GetAffineTransform(src, dst);
        Console.WriteLine($"[{A.At<double>(0, 0):F4} {A.At<double>(0, 1):F4} {A.At<double>(0, 2):F2}]");
        Console.WriteLine($"[{A.At<double>(1, 0):F4} {A.At<double>(1, 1):F4} {A.At<double>(1, 2):F2}]");

        using var warped = new Mat();
        Cv2.WarpAffine(img, warped, A, new Size(640, 480));
        Cv2.ImShow("affine", warped);
        Cv2.WaitKey(0);
    }
}`, points: ['점 3쌍 → 2×3 행렬 자동 계산', '세 점이 <b>일직선이면 안 됨</b>', '나머지 픽셀 위치는 자동으로 정해진다'], notes: '<p>dst 의 값을 바꿔 보게 합니다. 세 점을 모두 한 직선(y=0) 위에 두면 결과가 어떻게 되는지 시연하면 “일직선 금지”가 확실히 남습니다. (5분)</p>' },
          { layout: 'image', title: '문제: 비스듬히 찍힌 교정판', src: 'images/calib_grid_top.png', caption: '11×8 점 격자 (간격 5 mm) — 약한 원근 때문에 위아래 간격이 다르다', notes: '<p>💬 “이 영상에서 점 사이 거리를 재면 위쪽과 아래쪽이 다릅니다. 왜?” — 카메라가 기울어 원근이 생김. 그래서 정면화(rectification)가 먼저라는 흐름을 만듭니다. (3분)</p>' },
          { layout: 'code', title: '정면화: 네 귀퉁이를 직사각형으로', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/calib_grid_top.png", ImreadModes.Grayscale);
        Point2f[] src = { new Point2f(95.30f, 72.80f), new Point2f(560.21f, 80.10f),
                          new Point2f(552.60f, 410.40f), new Point2f(88.70f, 398.89f) };
        Point2f[] dst = { new Point2f(50, 50), new Point2f(550, 50),
                          new Point2f(550, 400), new Point2f(50, 400) };   // 1 mm = 10 px
        using var H = Cv2.GetPerspectiveTransform(src, dst);
        using var top = new Mat();
        Cv2.WarpPerspective(img, top, H, new Size(600, 450));
        Console.WriteLine($"정면화 {top.Width}x{top.Height}");
        Cv2.ImShow("input", img);
        Cv2.ImShow("front", top);
        Cv2.WaitKey(0);
    }
}`, points: ['dst 를 <b>1 mm = 10 px</b> 로 정하면 결과가 곧 실측 좌표', '점 간격 5 mm → 정확히 50 px', '<b>점 순서</b>(좌상→우상→우하→좌하)를 맞춰야 한다'], notes: '<p>실행해 두 창을 비교하고, 결과에서 점 간격을 마우스로 재 보게 합니다(결과 창의 좌표 표시). dst 의 두 점 순서를 바꿔 X 자로 접히는 모습을 보여 주면 “순서 맞추기”가 기억에 남습니다. (7분)</p>' },
          { layout: 'diagram', title: 'px → mm: 로봇에게 위치 알려 주기', html: FIG_PXMM, caption: '로봇 좌표를 아는 기준 마크 4개 → H → 부품 좌표 변환', notes: '<p>산업 현장에서 가장 많이 쓰는 응용입니다. 마크의 로봇 좌표는 로봇을 직접 그 점에 옮겨 기록(티칭)합니다. 💬 “카메라를 건드리면?” — 다시 교정. (4분)</p>' },
          { layout: 'code', title: 'px → mm 변환과 검산', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        Point2f[] px = { new Point2f(61.56f, 57.38f), new Point2f(583.83f, 65.15f),
                         new Point2f(574.58f, 426.42f), new Point2f(67.27f, 419.64f) };
        Point2f[] mm = { new Point2f(270, 90), new Point2f(530, 90),
                         new Point2f(530, -90), new Point2f(270, -90) };
        using var H = Cv2.GetPerspectiveTransform(px, mm);

        Point2f[] test = { new Point2f(61.56f, 57.38f), new Point2f(320, 240) };
        Point2f[] robot = Cv2.PerspectiveTransform(test, H);   // 점만 변환!
        foreach (var p in robot) Console.WriteLine($"mm ({p.X:F2}, {p.Y:F2})");
    }
}`, points: ['마크 자신은 정확히 (270, 90) 으로 돌아온다 = <b>검산</b>', '영상 중앙 (320,240) → (398.94, 2.36) mm', 'y 대각 성분이 <b>음수</b>: 영상 y 는 아래로, 로봇 Y 는 위로'], notes: '<p>검산 습관을 강조합니다: 변환을 만들면 <b>반드시 입력 점을 다시 넣어</b> 원하는 값이 나오는지 확인. 여기서 오차가 크면 마크 좌표를 잘못 짝지은 것입니다. (6분)</p>' },
          { layout: 'two', title: '역변환과 응용', left: { title: '역변환 <code>Cv2.Invert(H, Hinv)</code>', bullets: ['mm → px: 로봇 목표를 영상에 표시', '검사 ROI 를 mm 로 정의', 'px→mm→px 왕복은 제자리', '어파인 전용: <code>InvertAffineTransform</code>'] }, right: { title: '문서 · 카드 스캐너', bullets: ['① Canny + FindContours 로 사각형 찾기', '② ApproxPolyDP 로 꼭짓점 4개 (12차시)', '③ GetPerspectiveTransform → WarpPerspective', '출력 비율을 A4(210:297)로 주면 비율까지 교정'] }, notes: '<p>오늘 배운 것이 스마트폰 스캐너 앱과 같은 원리임을 알려 줍니다. 12차시에서 꼭짓점 4개를 자동으로 찾는 방법(ApproxPolyDP)을 배운다고 예고합니다. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '부품 중심 5개를 로봇 좌표로 바꿀 때 쓰는 함수는?', options: ['<code>Cv2.WarpPerspective</code>', '<code>Cv2.PerspectiveTransform</code>', '<code>Cv2.WarpAffine</code>', '<code>Cv2.Remap</code>'], answer: 1, explain: '이미지 전체를 펴는 것은 <code>WarpPerspective</code>, <b>점 좌표만</b> 바꾸는 것은 <code>PerspectiveTransform</code> 입니다. 점 5개 때문에 30만 픽셀을 다시 만들 필요가 없습니다.', notes: '<p>정답 2번. 실습에서 가장 많이 틀리는 부분이므로 여기서 한 번 더 확인합니다.</p>' },
          { layout: 'practice', title: '실습: 부품 → 로봇 좌표', desc: '<p><code>images/robot_pick.png</code> 의 부품 5개 중심을 찾아 로봇 좌표(mm)로 출력하세요.</p><ul><li>Otsu → <code>ConnectedComponentsEx</code>, 면적 1500~5000 만 부품</li><li>기준 마크 4쌍으로 H 만들기</li><li><code>Cv2.PerspectiveTransform</code> 한 번으로 5개 변환</li><li>정답: (320,30) (400,−35) (470,40) (300,−40) (400,45) mm</li></ul>', starter: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/robot_pick.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        var cc = Cv2.ConnectedComponentsEx(bin);
        var parts = cc.Blobs.Skip(1).Where(b => b.Area >= 1500 && b.Area <= 5000)
                      .OrderBy(b => b.Centroid.X).ToList();
        Console.WriteLine($"부품 {parts.Count}개");
        // TODO: H 를 만들고 중심을 mm 로 변환
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/robot_pick.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        var cc = Cv2.ConnectedComponentsEx(bin);
        var parts = cc.Blobs.Skip(1).Where(b => b.Area >= 1500 && b.Area <= 5000)
                      .OrderBy(b => b.Centroid.X).ToList();
        Point2f[] mk = { new Point2f(61.56f, 57.38f), new Point2f(583.83f, 65.15f),
                         new Point2f(574.58f, 426.42f), new Point2f(67.27f, 419.64f) };
        Point2f[] mm = { new Point2f(270, 90), new Point2f(530, 90),
                         new Point2f(530, -90), new Point2f(270, -90) };
        using var H = Cv2.GetPerspectiveTransform(mk, mm);
        Point2f[] src = parts.Select(b => new Point2f((float)b.Centroid.X, (float)b.Centroid.Y)).ToArray();
        Point2f[] dst = Cv2.PerspectiveTransform(src, H);
        for (int k = 0; k < src.Length; k++)
            Console.WriteLine($"로봇 ({dst[k].X:F1}, {dst[k].Y:F1}) mm");
        Cv2.WaitKey(0);
    }
}`, notes: '<p>면적 필터를 빼면 컨베이어 양쪽 띠(면적 3만 이상)가 섞여 7개가 나옵니다 — 그 결과를 먼저 보여 주고 필터를 넣게 하면 “면적 필터”의 필요성이 체감됩니다. 결과가 정답과 0.5 mm 이내로 맞는지 확인하게 하세요. (10분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['대응점만 있으면 행렬을 풀 수 있다 — 어파인 <b>3쌍</b>, 원근 <b>4쌍</b>', '이미지는 <code>Warp*</code>, 점은 <code>*Transform</code> — 절대 헷갈리지 말 것', 'dst 를 <b>실측 단위(1 mm = N px)</b> 로 정하면 결과가 곧 측정 좌표', '<code>Cv2.Invert</code> 로 역변환(mm → px), 점이 많으면 <code>FindHomography</code> + RANSAC', '변환을 만들면 <b>입력 점으로 검산</b>하는 습관', '다음 차시: 윤곽선과 도형 분석 — 꼭짓점 4개를 자동으로 찾아 스캐너 완성'], notes: '<p>오늘의 핵심 한 줄: “<b>점을 짝지으면 변환이 생긴다.</b>” 다음 차시(12)에서 윤곽선 · ApproxPolyDP 로 네 점을 자동 검출해 오늘의 스캐너를 완성한다고 예고합니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
