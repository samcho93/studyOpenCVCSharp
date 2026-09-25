/* 06차시 밝기 · 대비 · 히스토그램 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 밝기(더하기) · 대비(곱하기) 의 입출력 그래프와 포화
  const FIG_BRIGHT = `<svg viewBox="0 0 720 330" role="img" aria-label="입력 밝기를 가로축, 출력 밝기를 세로축으로 둔 그래프. 더하기는 선을 위로 밀고 곱하기는 기울기를 키우며, 255 를 넘으면 평평해진다">
  ${ARROW('c06a1')}
  <line x1="80" y1="290" x2="355" y2="290" class="ax" marker-end="url(#c06a1)"/>
  <line x1="80" y1="290" x2="80" y2="25" class="ax" marker-end="url(#c06a1)"/>
  <text x="360" y="295" class="tx-m">입력</text>
  <text x="60" y="22" text-anchor="end" class="tx-m">출력</text>
  <text x="76" y="308" text-anchor="middle" class="tx-m">0</text>
  <text x="208" y="308" text-anchor="middle" class="tx-m">128</text>
  <text x="335" y="308" text-anchor="middle" class="tx-m">255</text>
  <text x="70" y="40" text-anchor="end" class="tx-m">255</text>
  <line x1="80" y1="35" x2="335" y2="35" class="ln" stroke-dasharray="4 4"/>
  <polyline points="80,290 335,35" class="s1" fill="none"/>
  <text x="300" y="80" class="tx">y = x (원본)</text>
  <polyline points="80,240 285,35 335,35" class="s3" fill="none" stroke-width="3"/>
  <text x="92" y="228" class="tx">y = x + 50 (밝기)</text>
  <polyline points="80,290 250,35 335,35" class="s2" fill="none" stroke-width="3"/>
  <text x="150" y="120" class="tx">y = 1.5x (대비)</text>
  <text x="262" y="26" class="tx-m">← 255 에서 잘림 (포화)</text>
  <rect x="400" y="40" width="300" height="70" rx="8" class="p3s"/>
  <text x="416" y="66" class="tx-b">밝기 = 더하기 (beta)</text>
  <text x="416" y="90" class="tx-m">선이 위아래로 평행 이동 — 전체가 밝아진다</text>
  <rect x="400" y="124" width="300" height="70" rx="8" class="p2s"/>
  <text x="416" y="150" class="tx-b">대비 = 곱하기 (alpha)</text>
  <text x="416" y="174" class="tx-m">기울기가 커진다 — 밝은 곳은 더 밝게,</text>
  <text x="416" y="190" class="tx-m">어두운 곳은 그대로 → 차이가 벌어진다</text>
  <rect x="400" y="208" width="300" height="88" rx="8" class="p1s"/>
  <text x="416" y="234" class="tx-b">포화 (saturate)</text>
  <text x="416" y="258" class="tx-m">8비트는 0~255 뿐 → 255 를 넘는 값은 255,</text>
  <text x="416" y="274" class="tx-m">0 보다 작은 값은 0 으로 <b>잘린다</b>.</text>
  <text x="416" y="290" class="tx-m">한 번 잘린 밝기는 되돌릴 수 없다!</text>
</svg>`;

  // 그림 2: 감마 곡선
  const FIG_GAMMA = `<svg viewBox="0 0 720 330" role="img" aria-label="감마 곡선. 감마가 1보다 작으면 어두운 부분이 크게 밝아지고, 1보다 크면 전체가 어두워진다">
  ${ARROW('c06a2')}
  <line x1="80" y1="290" x2="355" y2="290" class="ax" marker-end="url(#c06a2)"/>
  <line x1="80" y1="290" x2="80" y2="25" class="ax" marker-end="url(#c06a2)"/>
  <text x="360" y="295" class="tx-m">입력</text>
  <text x="60" y="22" text-anchor="end" class="tx-m">출력</text>
  <text x="76" y="308" text-anchor="middle" class="tx-m">0</text>
  <text x="208" y="308" text-anchor="middle" class="tx-m">128</text>
  <text x="335" y="308" text-anchor="middle" class="tx-m">255</text>
  <polyline points="80,290 144,162 208,109 272,69 335,35" class="s3" fill="none" stroke-width="3"/>
  <polyline points="80,290 335,35" class="s1" fill="none" stroke-dasharray="5 4"/>
  <polyline points="80,290 144,274 208,226 272,145 335,35" class="s2" fill="none" stroke-width="3"/>
  <text x="150" y="150" class="tx">gamma 0.5</text>
  <text x="250" y="120" class="tx-m">gamma 1.0 (그대로)</text>
  <text x="212" y="255" class="tx">gamma 2.0</text>
  <text x="400" y="60" class="tx-b">out = 255 × (in / 255)<tspan dy="-6" font-size="11">gamma</tspan></text>
  <rect x="400" y="80" width="300" height="88" rx="8" class="p3s"/>
  <text x="416" y="106" class="tx-b">gamma &lt; 1 (예: 0.5)</text>
  <text x="416" y="130" class="tx-m">어두운 쪽이 크게 밝아진다 → 그림자 속</text>
  <text x="416" y="146" class="tx-m">글자를 살릴 때. 128 → 181</text>
  <text x="416" y="162" class="tx-m">밝은 쪽은 255 를 넘지 않는다 (포화 없음)</text>
  <rect x="400" y="182" width="300" height="72" rx="8" class="p2s"/>
  <text x="416" y="208" class="tx-b">gamma &gt; 1 (예: 2.0)</text>
  <text x="416" y="232" class="tx-m">전체가 어두워진다 → 하얗게 날아간</text>
  <text x="416" y="248" class="tx-m">영상을 눌러 줄 때. 128 → 64</text>
  <text x="400" y="282" class="tx-m">곱하기 · 더하기와 달리 <b>곡선</b>이라</text>
  <text x="400" y="300" class="tx-m">밝은 쪽을 잘라먹지 않는다 → byte[256] LUT 로 계산</text>
</svg>`;

  // 그림 3: 히스토그램이란
  const FIG_HIST = `<svg viewBox="0 0 720 300" role="img" aria-label="픽셀 값을 밝기별로 세어 막대로 그린 것이 히스토그램이다">
  ${ARROW('c06a3')}
  <text x="20" y="26" class="tx-b">픽셀 값 (4 × 4 조각)</text>
  <rect x="20" y="40" width="160" height="160" rx="6" class="card-bg"/>
  <text x="40" y="66" class="tx-m">10</text><text x="80" y="66" class="tx-m">12</text><text x="120" y="66" class="tx">200</text><text x="160" y="66" class="tx">205</text>
  <text x="40" y="100" class="tx-m">11</text><text x="80" y="100" class="tx-m">13</text><text x="120" y="100" class="tx">202</text><text x="160" y="100" class="tx">210</text>
  <text x="40" y="134" class="tx-m">9</text><text x="80" y="134" class="tx-m">12</text><text x="120" y="134" class="tx">198</text><text x="160" y="134" class="tx">203</text>
  <text x="40" y="168" class="tx-m">10</text><text x="80" y="168" class="tx-m">11</text><text x="120" y="168" class="tx">201</text><text x="160" y="168" class="tx">199</text>
  <text x="100" y="224" text-anchor="middle" class="tx-m">어두운 픽셀 8개</text>
  <text x="100" y="244" text-anchor="middle" class="tx-m">밝은 픽셀 8개</text>
  <line x1="196" y1="120" x2="246" y2="120" class="ln" stroke-width="2" marker-end="url(#c06a3)"/>
  <text x="221" y="108" text-anchor="middle" class="tx-m">세기</text>
  <line x1="280" y1="230" x2="700" y2="230" class="ax"/>
  <line x1="280" y1="230" x2="280" y2="40" class="ax"/>
  <text x="278" y="250" text-anchor="middle" class="tx-m">0</text>
  <text x="490" y="250" text-anchor="middle" class="tx-m">128</text>
  <text x="690" y="250" text-anchor="middle" class="tx-m">255</text>
  <text x="270" y="36" text-anchor="end" class="tx-m">개수</text>
  <rect x="292" y="70" width="14" height="160" class="p1"/>
  <rect x="640" y="70" width="14" height="160" class="p3"/>
  <text x="299" y="62" text-anchor="middle" class="tx-m">8</text>
  <text x="647" y="62" text-anchor="middle" class="tx-m">8</text>
  <text x="490" y="120" text-anchor="middle" class="tx-b">가로축 = 밝기 0~255 (256칸 = bin)</text>
  <text x="490" y="146" text-anchor="middle" class="tx-m">세로축 = 그 밝기를 가진 픽셀 수</text>
  <text x="490" y="176" text-anchor="middle" class="tx-m">가운데가 비어 있다 = 중간 밝기가 없다</text>
  <text x="490" y="196" text-anchor="middle" class="tx-m">→ 이진화에 아주 좋은 영상 (07차시)</text>
  <text x="490" y="280" text-anchor="middle" class="tx-m">막대 높이의 합 = 전체 픽셀 수. 히스토그램은 <b>위치 정보를 버리고 개수만</b> 남긴다</text>
</svg>`;

  // 그림 4: 평탄화 · CLAHE 개념
  const FIG_EQ = `<svg viewBox="0 0 720 300" role="img" aria-label="저대비 영상의 좁은 히스토그램을 넓게 펴는 것이 평탄화이고, 타일마다 제한을 두고 펴는 것이 CLAHE 이다">
  ${ARROW('c06a4')}
  <text x="20" y="26" class="tx-b">원본 (저대비): 102 ~ 134 에만 몰려 있다</text>
  <line x1="30" y1="150" x2="320" y2="150" class="ax"/>
  <text x="28" y="170" text-anchor="middle" class="tx-m">0</text>
  <text x="318" y="170" text-anchor="middle" class="tx-m">255</text>
  <rect x="146" y="60" width="8" height="90" class="p1"/>
  <rect x="154" y="44" width="8" height="106" class="p1"/>
  <rect x="162" y="52" width="8" height="98" class="p1"/>
  <rect x="170" y="72" width="8" height="78" class="p1"/>
  <rect x="178" y="96" width="8" height="54" class="p1"/>
  <text x="166" y="36" text-anchor="middle" class="tx-m">좁은 봉우리</text>
  <path d="M40,220 C120,220 200,120 310,96" class="s3" fill="none"/>
  <text x="60" y="244" class="tx-m">누적 히스토그램(CDF) — 이 곡선을 변환표로 쓴다</text>
  <line x1="336" y1="140" x2="386" y2="140" class="ln" stroke-width="2" marker-end="url(#c06a4)"/>
  <text x="361" y="128" text-anchor="middle" class="tx-m">평탄화</text>
  <text x="404" y="26" class="tx-b">EqualizeHist: 0 ~ 255 전체로 펴진다</text>
  <line x1="410" y1="150" x2="700" y2="150" class="ax"/>
  <text x="408" y="170" text-anchor="middle" class="tx-m">0</text>
  <text x="698" y="170" text-anchor="middle" class="tx-m">255</text>
  <rect x="420" y="96" width="24" height="54" class="p2"/>
  <rect x="452" y="70" width="24" height="80" class="p2"/>
  <rect x="484" y="52" width="24" height="98" class="p2"/>
  <rect x="516" y="60" width="24" height="90" class="p2"/>
  <rect x="548" y="80" width="24" height="70" class="p2"/>
  <rect x="580" y="64" width="24" height="86" class="p2"/>
  <rect x="612" y="88" width="24" height="62" class="p2"/>
  <rect x="644" y="104" width="24" height="46" class="p2"/>
  <text x="556" y="196" text-anchor="middle" class="tx-m">간격이 벌어져 대비가 커진다 (잡음도 함께 커짐)</text>
  <rect x="30" y="256" width="660" height="34" rx="8" class="p4s"/>
  <text x="360" y="278" text-anchor="middle" class="tx">CLAHE = 영상을 <tspan class="tx-b">타일(8×8)</tspan> 로 나눠 각각 평탄화 + <tspan class="tx-b">clipLimit</tspan> 로 과도한 증폭을 잘라 냄</text>
</svg>`;

  // ---------------------------------------------------------------- 1교시 예제
  const EX_BRIGHT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        Console.WriteLine($"원본 평균 {Cv2.Mean(img).Val0:F1}");
        using var bright = img + 50;                       // 모든 픽셀에 +50 (연산자)
        using var bright2 = new Mat();
        Cv2.Add(img, new Scalar(50), bright2);             // 같은 뜻
        using var dark = new Mat();
        Cv2.Subtract(img, new Scalar(50), dark);
        Console.WriteLine($"+50 평균 {Cv2.Mean(bright).Val0:F1}, Cv2.Add 평균 {Cv2.Mean(bright2).Val0:F1}, -50 평균 {Cv2.Mean(dark).Val0:F1}");

        int[][] pts = { new[] { 350, 60 }, new[] { 120, 110 }, new[] { 20, 20 } };
        foreach (var p in pts)
        {
            byte o = img.At<byte>(p[1], p[0]);
            Console.WriteLine($"({p[0]},{p[1]}): {o} -> +50 {bright.At<byte>(p[1], p[0])} / -50 {dark.At<byte>(p[1], p[0])}");
        }
        Cv2.MinMaxLoc(img, out double mn, out double mx);
        Cv2.MinMaxLoc(bright, out double mn2, out double mx2);
        Console.WriteLine($"최소/최대: 원본 {mn}/{mx} -> +50 {mn2}/{mx2}  (255 에서 막힘 = 포화)");
        Cv2.ImShow("bright", bright);
        Cv2.WaitKey(0);
    }
}`;

  const EX_CONTRAST = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/low_contrast.png", ImreadModes.Grayscale);
        Cv2.MeanStdDev(img, out Scalar m0, out Scalar s0);
        Console.WriteLine($"원본 평균 {m0.Val0:F1}, 표준편차 {s0.Val0:F1}");

        double[] alphas = { 1.0, 2.0, 3.0 };
        foreach (double a in alphas)
        {
            using var dst = new Mat();
            Cv2.ConvertScaleAbs(img, dst, a, 0);           // 출력 = |입력 x a + 0|
            Cv2.MeanStdDev(dst, out Scalar m, out Scalar s);
            Cv2.MinMaxLoc(dst, out double mn, out double mx);
            Console.WriteLine($"alpha={a:F1}: 평균 {m.Val0:F1} 표준편차 {s.Val0:F1} 최소/최대 {mn}/{mx}");
        }
        using var fixed1 = new Mat();
        Cv2.ConvertScaleAbs(img, fixed1, 3.0, -250);       // 대비 3배 + 밝기 -250
        Cv2.MeanStdDev(fixed1, out Scalar m2, out Scalar s2);
        Cv2.MinMaxLoc(fixed1, out double mn3, out double mx3);
        Console.WriteLine($"alpha=3.0, beta=-250: 평균 {m2.Val0:F1} 표준편차 {s2.Val0:F1} 최소/최대 {mn3}/{mx3}");
        Cv2.ImShow("contrast", fixed1);
        Cv2.WaitKey(0);
    }
}`;

  const EX_BLEND = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var a = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        using var b = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
        Console.WriteLine($"a {a.Width}x{a.Height} 평균 {Cv2.Mean(a).Val0:F1} / b {b.Width}x{b.Height} 평균 {Cv2.Mean(b).Val0:F1}");
        double[] ws = { 0.0, 0.3, 0.5, 0.7, 1.0 };
        foreach (double w in ws)
        {
            using var dst = new Mat();
            Cv2.AddWeighted(a, w, b, 1.0 - w, 0, dst);     // dst = a x w + b x (1-w) + 0
            Console.WriteLine($"a x {w:F1} + b x {1 - w:F1} -> 평균 {Cv2.Mean(dst).Val0:F1}");
        }
        using var blend = new Mat();
        Cv2.AddWeighted(a, 0.5, b, 0.5, 0, blend);
        Cv2.ImShow("blend", blend);
        Cv2.WaitKey(0);
    }
}`;

  const EX_GAMMA = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        byte[] lut = MakeGamma(0.5);
        Console.WriteLine($"gamma 0.5 표: 0->{lut[0]} 64->{lut[64]} 128->{lut[128]} 192->{lut[192]} 255->{lut[255]}");
        byte[] lut2 = MakeGamma(2.0);
        Console.WriteLine($"gamma 2.0 표: 0->{lut2[0]} 64->{lut2[64]} 128->{lut2[128]} 192->{lut2[192]} 255->{lut2[255]}");

        using var bright = new Mat();
        using var dark = new Mat();
        Cv2.LUT(img, lut, bright);        // 256칸 변환표를 한 번에 적용 (아주 빠름)
        Cv2.LUT(img, lut2, dark);
        Console.WriteLine($"원본 평균 {Cv2.Mean(img).Val0:F1} / gamma 0.5 {Cv2.Mean(bright).Val0:F1} / gamma 2.0 {Cv2.Mean(dark).Val0:F1}");
        Cv2.MinMaxLoc(bright, out double mn, out double mx);
        Console.WriteLine($"gamma 0.5 최소/최대 {mn}/{mx} (포화 없음)");
        Cv2.ImShow("gamma 0.5", bright);
        Cv2.WaitKey(0);
    }

    static byte[] MakeGamma(double gamma)
    {
        byte[] table = new byte[256];
        for (int i = 0; i < 256; i++)
            table[i] = (byte)Math.Round(Math.Pow(i / 255.0, gamma) * 255.0);
        return table;
    }
}`;

  const EX_NORM = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/low_contrast.png", ImreadModes.Grayscale);
        Cv2.MinMaxLoc(img, out double mn, out double mx);
        Cv2.MeanStdDev(img, out Scalar m0, out Scalar s0);
        Console.WriteLine($"원본: 최소 {mn} 최대 {mx} 평균 {m0.Val0:F1} 표준편차 {s0.Val0:F1}");

        using var stretched = new Mat();
        Cv2.Normalize(img, stretched, 0, 255, NormTypes.MinMax);   // 최소 -> 0, 최대 -> 255
        Cv2.MinMaxLoc(stretched, out double mn2, out double mx2);
        Cv2.MeanStdDev(stretched, out Scalar m1, out Scalar s1);
        Console.WriteLine($"스트레칭: 최소 {mn2} 최대 {mx2} 평균 {m1.Val0:F1} 표준편차 {s1.Val0:F1}");

        int x = 350, y = 60;
        Console.WriteLine($"({x},{y}) {img.At<byte>(y, x)} -> {stretched.At<byte>(y, x)}");
        Console.WriteLine($"직접 계산: (v - {mn}) x 255 / ({mx} - {mn}) = {(img.At<byte>(y, x) - mn) * 255 / (mx - mn):F1}");
        Cv2.ImShow("stretched", stretched);
        Cv2.WaitKey(0);
    }
}`;

  // ---------------------------------------------------------------- 2교시 예제
  const EX_HIST = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        using var hist = new Mat();
        Cv2.CalcHist(new[] { img }, new[] { 0 }, null, hist, 1, new[] { 256 }, new[] { new Rangef(0, 256) });
        Console.WriteLine($"히스토그램 크기 {hist.Rows}x{hist.Cols}, 형식 {hist.Type()}");
        Console.WriteLine($"밝기 0 픽셀 {hist.At<float>(0, 0)}개, 128 픽셀 {hist.At<float>(128, 0)}개, 255 픽셀 {hist.At<float>(255, 0)}개");
        Cv2.MinMaxLoc(hist, out double mn, out double mx, out Point minLoc, out Point maxLoc);
        Console.WriteLine($"가장 많은 밝기 = {maxLoc.Y} ({mx}개)");
        double sum = 0;
        for (int i = 0; i < 256; i++) sum += hist.At<float>(i, 0);
        Console.WriteLine($"합계 {sum} = 전체 픽셀 {img.Rows * img.Cols}");

        using var canvas = DrawHist(hist);
        Cv2.ImShow("histogram", canvas);
        Cv2.WaitKey(0);
    }

    // 히스토그램을 막대 그래프 이미지로 직접 그린다
    static Mat DrawHist(Mat hist)
    {
        int w = 512, h = 300;
        var canvas = new Mat(h, w, MatType.CV_8UC3, Scalar.All(30));
        Cv2.MinMaxLoc(hist, out double mn, out double mx);
        for (int i = 0; i < 256; i++)
        {
            int barH = (int)(hist.At<float>(i, 0) / mx * (h - 20));   // 가장 큰 막대가 280 px
            Cv2.Line(canvas, new Point(i * 2, h - 1), new Point(i * 2, h - 1 - barH), new Scalar(200, 200, 200), 2);
        }
        Cv2.Line(canvas, new Point(0, h - 1), new Point(w - 1, h - 1), new Scalar(0, 180, 255), 1);
        return canvas;
    }
}`;

  const EX_READ = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        string[] files = { "images/sample_gray.png", "images/low_contrast.png", "images/uneven_light.png" };
        foreach (string f in files)
        {
            using var img = Cv2.ImRead(f, ImreadModes.Grayscale);
            using var hist = new Mat();
            Cv2.CalcHist(new[] { img }, new[] { 0 }, null, hist, 1, new[] { 256 }, new[] { new Rangef(0, 256) });
            Cv2.MinMaxLoc(img, out double mn, out double mx);
            Cv2.MeanStdDev(img, out Scalar m, out Scalar sd);
            Console.WriteLine($"{f}");
            Console.WriteLine($"   최소 {mn} 최대 {mx} 평균 {m.Val0:F1} 표준편차 {sd.Val0:F1}");
            double total = img.Rows * img.Cols;
            for (int b = 0; b < 4; b++)
            {
                double s = 0;
                for (int i = b * 64; i < b * 64 + 64; i++) s += hist.At<float>(i, 0);
                Console.WriteLine($"   {b * 64,3} ~ {b * 64 + 63,3} : {100 * s / total,5:F1}%");
            }
        }
    }
}`;

  const EX_EQ = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/low_contrast.png", ImreadModes.Grayscale);
        using var norm = new Mat();
        Cv2.Normalize(img, norm, 0, 255, NormTypes.MinMax);
        using var eq = new Mat();
        Cv2.EqualizeHist(img, eq);                                  // 전역 평탄화
        using var clahe = Cv2.CreateCLAHE(2.0, new Size(8, 8));     // clipLimit 2.0, 타일 8x8
        using var cl = new Mat();
        clahe.Apply(img, cl);

        Report("원본", img);
        Report("Normalize", norm);
        Report("EqualizeHist", eq);
        Report("CLAHE(2.0)", cl);
        foreach (double clip in new[] { 4.0, 8.0 })
        {
            using var c2 = Cv2.CreateCLAHE(clip, new Size(8, 8));
            using var d = new Mat();
            c2.Apply(img, d);
            Report($"CLAHE({clip:F1})", d);
        }
        Cv2.ImShow("equalize", eq);
        Cv2.ImShow("clahe", cl);
        Cv2.WaitKey(0);
    }

    static void Report(string tag, Mat m)
    {
        Cv2.MinMaxLoc(m, out double mn, out double mx);
        Cv2.MeanStdDev(m, out Scalar mean, out Scalar sd);
        Console.WriteLine($"{tag,-14} 최소/최대 {mn}/{mx} 평균 {mean.Val0:F1} 표준편차 {sd.Val0:F1}");
    }
}`;

  const EX_COLOR = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        using var dark = new Mat();
        Cv2.ConvertScaleAbs(img, dark, 0.5, 0);      // 어둡게 찍힌 컬러 사진

        // (1) 잘못된 방법: B G R 채널을 따로 균일화 -> 색이 틀어진다
        Mat[] ch = Cv2.Split(dark);
        for (int i = 0; i < 3; i++) Cv2.EqualizeHist(ch[i], ch[i]);
        using var wrong = new Mat();
        Cv2.Merge(ch, wrong);
        foreach (var m in ch) m.Dispose();

        // (2) 올바른 방법: HSV 로 바꿔 V(명도) 채널만 균일화
        using var hsv = new Mat();
        Cv2.CvtColor(dark, hsv, ColorConversionCodes.BGR2HSV);
        Mat[] hc = Cv2.Split(hsv);
        Cv2.EqualizeHist(hc[2], hc[2]);
        using var merged = new Mat();
        Cv2.Merge(hc, merged);
        using var right = new Mat();
        Cv2.CvtColor(merged, right, ColorConversionCodes.HSV2BGR);
        foreach (var m in hc) m.Dispose();

        Show("어두운 원본", dark);
        Show("BGR 각각", wrong);
        Show("V 채널만", right);
        Cv2.ImShow("V only", right);
        Cv2.WaitKey(0);
    }

    static void Show(string tag, Mat bgr)
    {
        Scalar m = Cv2.Mean(bgr);
        Vec3b p = bgr.At<Vec3b>(110, 120);        // 빨간 원
        using var hsv = new Mat();
        Cv2.CvtColor(bgr, hsv, ColorConversionCodes.BGR2HSV);
        Vec3b h = hsv.At<Vec3b>(110, 120);
        Console.WriteLine($"{tag,-12} 평균 BGR ({m.Val0:F0},{m.Val1:F0},{m.Val2:F0})  빨간 원 BGR ({p.Item0},{p.Item1},{p.Item2}) H={h.Item0}");
    }
}`;

  const EX_STATS = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/low_contrast.png", ImreadModes.Grayscale);

        // 1) 최소 · 최대와 그 위치
        Cv2.MinMaxLoc(img, out double mn, out double mx, out Point mnLoc, out Point mxLoc);
        Console.WriteLine($"최소 {mn} @ ({mnLoc.X},{mnLoc.Y}) / 최대 {mx} @ ({mxLoc.X},{mxLoc.Y})");

        // 2) 평균과 표준편차 (표준편차 = 대비의 척도)
        Cv2.MeanStdDev(img, out Scalar mean, out Scalar sd);
        Console.WriteLine($"평균 {mean.Val0:F2} 표준편차 {sd.Val0:F2}");
        Console.WriteLine($"Cv2.Mean 만 쓰면 {Cv2.Mean(img).Val0:F2}");

        // 3) 마스크를 주면 그 영역만 통계 (ROI 검사의 기본)
        using var roiMask = new Mat(img.Size(), MatType.CV_8UC1, Scalar.All(0));
        Cv2.Rectangle(roiMask, new Rect(200, 100, 240, 200), Scalar.All(255), -1);
        Cv2.MeanStdDev(img, out Scalar m2, out Scalar s2, roiMask);
        Console.WriteLine($"가운데 사각형 영역: 평균 {m2.Val0:F2} 표준편차 {s2.Val0:F2}");
        Console.WriteLine($"판정: 표준편차 {sd.Val0:F2} < 15 이므로 '저대비 — 조명 · 노출 점검 필요'");
    }
}`;

  // ---------------------------------------------------------------- 슬라이드용 짧은 코드
  const S_BRIGHT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        using var bright = img + 50;            // = Cv2.Add(img, new Scalar(50), dst)
        using var dark = new Mat();
        Cv2.Subtract(img, new Scalar(50), dark);

        Console.WriteLine($"원본 평균 {Cv2.Mean(img).Val0:F1}");
        Console.WriteLine($"+50 평균 {Cv2.Mean(bright).Val0:F1} / -50 평균 {Cv2.Mean(dark).Val0:F1}");
        Cv2.MinMaxLoc(bright, out double mn, out double mx);
        Console.WriteLine($"+50 최소/최대 {mn}/{mx}  (255 에서 포화)");
        Cv2.ImShow("bright", bright);
        Cv2.WaitKey(0);
    }
}`;

  const S_CONTRAST = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/low_contrast.png", ImreadModes.Grayscale);
        using var a2 = new Mat();
        using var ok = new Mat();
        Cv2.ConvertScaleAbs(img, a2, 2.0, 0);          // 대비 2배만
        Cv2.ConvertScaleAbs(img, ok, 3.0, -250);       // 대비 3배 + 밝기 -250

        Cv2.MeanStdDev(a2, out Scalar m1, out Scalar s1);
        Cv2.MeanStdDev(ok, out Scalar m2, out Scalar s2);
        Console.WriteLine($"alpha 2.0       평균 {m1.Val0:F1} 표준편차 {s1.Val0:F1}");
        Console.WriteLine($"alpha 3 beta -250 평균 {m2.Val0:F1} 표준편차 {s2.Val0:F1}");
        Cv2.ImShow("contrast", ok);
        Cv2.WaitKey(0);
    }
}`;

  const S_GAMMA = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        byte[] table = new byte[256];
        double gamma = 0.5;
        for (int i = 0; i < 256; i++)
            table[i] = (byte)Math.Round(Math.Pow(i / 255.0, gamma) * 255.0);

        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        using var dst = new Mat();
        Cv2.LUT(img, table, dst);
        Console.WriteLine($"128 -> {table[128]}, 평균 {Cv2.Mean(img).Val0:F1} -> {Cv2.Mean(dst).Val0:F1}");
        Cv2.ImShow("gamma", dst);
        Cv2.WaitKey(0);
    }
}`;

  const S_NORM = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/low_contrast.png", ImreadModes.Grayscale);
        using var dst = new Mat();
        Cv2.Normalize(img, dst, 0, 255, NormTypes.MinMax);

        Cv2.MinMaxLoc(img, out double mn, out double mx);
        Cv2.MinMaxLoc(dst, out double mn2, out double mx2);
        Cv2.MeanStdDev(img, out Scalar m0, out Scalar s0);
        Cv2.MeanStdDev(dst, out Scalar m1, out Scalar s1);
        Console.WriteLine($"{mn}~{mx} -> {mn2}~{mx2}");
        Console.WriteLine($"표준편차 {s0.Val0:F1} -> {s1.Val0:F1}");
        Cv2.ImShow("stretched", dst);
        Cv2.WaitKey(0);
    }
}`;

  const S_HIST = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        using var hist = new Mat();
        Cv2.CalcHist(new[] { img }, new[] { 0 }, null, hist,
                     1, new[] { 256 }, new[] { new Rangef(0, 256) });

        using var canvas = new Mat(300, 512, MatType.CV_8UC3, Scalar.All(30));
        Cv2.MinMaxLoc(hist, out double mn, out double mx);
        for (int i = 0; i < 256; i++)
        {
            int barH = (int)(hist.At<float>(i, 0) / mx * 280);
            Cv2.Line(canvas, new Point(i * 2, 299), new Point(i * 2, 299 - barH), Scalar.All(200), 2);
        }
        Console.WriteLine($"형식 {hist.Type()}, 가장 많은 밝기 개수 {mx}");
        Cv2.ImShow("histogram", canvas);
        Cv2.WaitKey(0);
    }
}`;

  const S_EQ = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/low_contrast.png", ImreadModes.Grayscale);
        using var eq = new Mat();
        Cv2.EqualizeHist(img, eq);
        using var clahe = Cv2.CreateCLAHE(2.0, new Size(8, 8));
        using var cl = new Mat();
        clahe.Apply(img, cl);

        Cv2.MeanStdDev(img, out Scalar m0, out Scalar s0);
        Cv2.MeanStdDev(eq, out Scalar m1, out Scalar s1);
        Cv2.MeanStdDev(cl, out Scalar m2, out Scalar s2);
        Console.WriteLine($"표준편차 원본 {s0.Val0:F1} / 평탄화 {s1.Val0:F1} / CLAHE {s2.Val0:F1}");
        Cv2.ImShow("equalize", eq);
        Cv2.ImShow("clahe", cl);
        Cv2.WaitKey(0);
    }
}`;

  const S_COLOR = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        using var dark = new Mat();
        Cv2.ConvertScaleAbs(img, dark, 0.5, 0);      // 어둡게 찍힌 사진
        using var hsv = dark.CvtColor(ColorConversionCodes.BGR2HSV);
        Mat[] hc = Cv2.Split(hsv);
        Cv2.EqualizeHist(hc[2], hc[2]);              // V 채널만!
        using var merged = new Mat();
        Cv2.Merge(hc, merged);
        using var result = merged.CvtColor(ColorConversionCodes.HSV2BGR);
        Console.WriteLine($"평균 {Cv2.Mean(dark).Val0:F0} -> {Cv2.Mean(result).Val0:F0}");
        foreach (var m in hc) m.Dispose();
        Cv2.ImShow("fixed", result);
        Cv2.WaitKey(0);
    }
}`;

  // ---------------------------------------------------------------- 퀴즈
  const QUIZ1 = [
    { q: '8비트 영상에서 밝기 230 인 픽셀에 <code>Cv2.Add</code> 로 50 을 더하면?',
      options: ['280', '255', '24 (넘친 값이 돌아온다)', '오류가 난다'], answer: 1,
      explain: 'OpenCV 의 산술은 <b>포화 연산(saturating)</b>입니다. 255 를 넘으면 255, 0 보다 작으면 0 으로 <b>잘립니다</b>. C# 의 <code>byte</code> 산술처럼 280 → 24 로 돌아오지 않습니다. 대신 한 번 잘린 값은 되돌릴 수 없습니다.' },
    { q: '<code>Cv2.ConvertScaleAbs(img, dst, 2.0, -100)</code> 은 무슨 뜻인가?',
      options: ['밝기 2배 후 대비 −100', '각 픽셀에 <code>|v × 2.0 − 100|</code> 을 적용', '2행 −100열로 이동', '2.0 보다 큰 값만 남김'], answer: 1,
      explain: '<b>alpha = 대비(곱), beta = 밝기(더하기)</b> 입니다. 대비를 키우면 값이 커지므로 beta 로 내려 주는 조합을 자주 씁니다. 결과는 절댓값을 취한 뒤 8비트로 포화됩니다.' },
    { q: '두 영상을 반반 섞으려면?',
      options: ['<code>Cv2.Add(a, b, dst)</code>', '<code>Cv2.AddWeighted(a, 0.5, b, 0.5, 0, dst)</code>', '<code>Cv2.Multiply(a, b, dst)</code>', '<code>a + b</code>'], answer: 1,
      explain: '<code>Cv2.Add</code> 는 그냥 더해서 대부분 255 로 포화됩니다. <code>AddWeighted(a, α, b, β, γ, dst)</code> = <code>a×α + b×β + γ</code> 이므로 α + β = 1 로 두면 평균이 유지됩니다.' },
    { q: '감마 보정(<code>Cv2.LUT</code>)이 단순 곱하기보다 좋은 점은?',
      options: ['계산이 더 정확하다', '밝은 쪽을 포화시키지 않으면서 어두운 쪽을 살릴 수 있다', '색이 변하지 않는다', '잡음이 사라진다'], answer: 1,
      explain: '곱하기는 직선이라 밝은 쪽이 먼저 255 로 잘립니다. 감마는 <b>곡선</b>이라 255 를 넘지 않으면서 어두운 구간만 크게 끌어올립니다 (gamma 0.5 에서 128 → 181, 255 → 255).' },
    { q: '<code>Cv2.Normalize(img, dst, 0, 255, NormTypes.MinMax)</code> 의 결과는?',
      options: ['평균이 128 이 된다', '최소값이 0, 최대값이 255 가 된다', '히스토그램이 평평해진다', '값이 0~1 로 바뀐다'], answer: 1,
      explain: '<b>선형 스트레칭</b>입니다. 가장 어두운 픽셀을 0, 가장 밝은 픽셀을 255 로 두고 사이를 비례로 늘립니다 — 모양(히스토그램의 형태)은 유지되고 폭만 넓어집니다. 형태까지 평평하게 만드는 것은 <code>EqualizeHist</code> 입니다.' }
  ];

  const QUIZ2 = [
    { q: '히스토그램의 가로축과 세로축은?',
      options: ['가로 = 픽셀 위치, 세로 = 밝기', '가로 = 밝기(0~255), 세로 = 그 밝기의 픽셀 수', '가로 = 밝기, 세로 = 평균', '가로 = 시간, 세로 = 밝기'], answer: 1,
      explain: '히스토그램은 <b>위치 정보를 버리고 개수만</b> 남긴 표입니다. 그래서 서로 다른 두 영상이 같은 히스토그램을 가질 수도 있습니다. 막대 높이의 합 = 전체 픽셀 수.' },
    { q: '<code>Cv2.CalcHist</code> 의 결과 Mat 의 형식과 크기는?',
      options: ['CV_8UC1, 256×1', 'CV_32FC1, 256×1', 'CV_32SC1, 1×256', 'CV_8UC3, 256×256'], answer: 1,
      explain: '<b>CV_32FC1 (float) 256행 1열</b>입니다. 따라서 값은 <code>hist.At&lt;float&gt;(i, 0)</code> 으로 읽습니다. <code>At&lt;byte&gt;</code> 로 읽으면 엉뚱한 값이 나옵니다.' },
    { q: '저대비 영상의 히스토그램 모양은?',
      options: ['0 과 255 양쪽 끝에 몰려 있다', '가운데 좁은 구간에 몰려 있다', '전체에 평평하게 퍼져 있다', '봉우리가 셋 이상'], answer: 1,
      explain: '<code>low_contrast.png</code> 는 102~134 의 <b>좁은 구간(전체의 98.8%)</b> 에만 픽셀이 있습니다. 이런 영상은 <code>Normalize(MinMax)</code> 로 폭을 늘리거나 <code>EqualizeHist</code> · CLAHE 로 대비를 키웁니다.' },
    { q: 'EqualizeHist 대신 CLAHE 를 쓰는 이유는?',
      options: ['더 빠르기 때문', '지역(타일)별로 적용하고 clipLimit 로 과도한 증폭 · 잡음을 억제하기 때문', '컬러 영상에 바로 쓸 수 있기 때문', '히스토그램을 그려 주기 때문'], answer: 1,
      explain: '전역 평탄화는 영상 전체에 하나의 변환표를 써서 조명이 기울어진 영상에서는 한쪽이 뭉개지고, 잡음도 크게 증폭됩니다. CLAHE 는 <b>타일(8×8)마다</b> 평탄화하면서 <code>clipLimit</code> 로 기울기를 제한합니다.' },
    { q: '컬러 영상의 밝기를 균일화할 때 올바른 방법은?',
      options: ['B · G · R 채널을 각각 EqualizeHist', 'HSV 로 바꿔 <b>V 채널만</b> EqualizeHist 후 다시 BGR', 'Gray 로 바꿔 EqualizeHist', 'ConvertScaleAbs 로 3배'], answer: 1,
      explain: '채널을 따로 평탄화하면 세 채널의 분포가 억지로 같아져 <b>색이 바래거나 틀어집니다</b>(예제 4 에서 평균 BGR 이 (134,134,134) 로 회색에 몰림). 밝기만 손대려면 HSV 의 <b>V</b>(또는 Lab 의 L) 채널만 처리하세요.' }
  ];

  CS_COURSE.addChapter({
    id: 'cs06', no: '06', title: '밝기 · 대비 · 히스토그램', subtitle: '영상의 성적표를 읽고 고치기',
    summary: '밝기는 <b>더하기</b>, 대비는 <b>곱하기</b>라는 기본을 익히고 포화(saturate) · <code>ConvertScaleAbs</code> · <code>AddWeighted</code> · 감마 보정(LUT) · 선형 스트레칭을 다룹니다. 이어서 영상의 성적표인 <b>히스토그램</b>을 <code>Cv2.CalcHist</code> 로 구해 직접 막대 그래프로 그리고, <code>EqualizeHist</code> 와 <b>CLAHE</b> 로 대비를 살리는 방법과 컬러 영상에서의 올바른 처리를 배웁니다.',
    goals: ['밝기(더하기) · 대비(곱하기)의 차이와 포화 현상을 설명할 수 있다', 'ConvertScaleAbs · AddWeighted · LUT(감마) · Normalize 를 목적에 맞게 쓸 수 있다', 'Cv2.CalcHist 결과를 읽고 막대 그래프로 그릴 수 있다', 'EqualizeHist 와 CLAHE 의 차이를 알고 컬러 영상에 올바르게 적용할 수 있다'],
    sections: [
      {
        id: 'cs06-1', title: '밝기 · 대비 · 감마 보정', minutes: 50,
        goals: ['밝기와 대비를 더하기 · 곱하기로 조절하고 포화를 설명할 수 있다', 'AddWeighted 로 두 영상을 섞을 수 있다', 'byte[256] LUT 로 감마 보정을 구현할 수 있다'],
        flow: [['도입: 어두운 사진 살리기', 7], ['밝기 · 대비 · 포화', 16], ['블렌딩 · 감마 · 스트레칭', 19], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: '밝기는 더하기, 대비는 곱하기' },
          { type: 'p', html: '사진이 어두우면 <b>모든 픽셀에 같은 값을 더하면</b> 밝아집니다(밝기 · brightness). 흐릿해서 구분이 잘 안 되면 <b>값의 차이를 벌려야</b> 합니다 — 픽셀 값에 1 보다 큰 수를 곱하는 것입니다(대비 · contrast). 한 식으로 쓰면 <b>출력 = alpha × 입력 + beta</b> 이고, OpenCV 에서는 <code>Cv2.ConvertScaleAbs(src, dst, alpha, beta)</code> 한 줄로 처리합니다.' },
          { type: 'figure', html: FIG_BRIGHT, caption: '그림 1. 입력 → 출력 그래프로 본 밝기(평행 이동) · 대비(기울기) · 포화(255 에서 잘림)' },
          { type: 'code', title: '예제 1: 밝기 더하기 · 빼기와 포화 확인', code: EX_BRIGHT,
            desc: '<code>img + 50</code> 처럼 <b>연산자</b>를 써도 되고 <code>Cv2.Add(img, new Scalar(50), dst)</code> 를 써도 같습니다. 주목할 점은 두 가지입니다. ① 원본 최대 208 이 +50 후 <b>255 가 아니라 255</b> 로 막혔습니다(208+50 = 258 → 255). ② (20,20) 의 47 은 −50 에서 <b>0 으로 잘렸습니다</b>. 이렇게 잘린 값은 되돌릴 수 없습니다.',
            expect: '원본 평균 119.2\n+50 평균 169.2, Cv2.Add 평균 169.2, -50 평균 69.4\n(350,60): 145 -> +50 195 / -50 95\n(120,110): 85 -> +50 135 / -50 35\n(20,20): 47 -> +50 97 / -50 0\n최소/최대: 원본 38/208 -> +50 88/255  (255 에서 막힘 = 포화)' },
          { type: 'callout', kind: 'warn', title: '포화(saturate) — C# 의 byte 산술과 다르다', html: 'C# 에서 <code>byte b = 230; b += 50;</code> 를 하면 <b>24</b> 가 됩니다(넘친 값이 돌아옴). 하지만 OpenCV 의 <code>Cv2.Add</code> · <code>Mat + Scalar</code> 는 <b>255 로 잘립니다</b>. 반대로 <code>Cv2.Subtract</code> 는 0 아래로 내려가지 않습니다. 직접 픽셀 루프를 돌 때는 <code>if (v &gt; 255) v = 255;</code> 를 <b>직접</b> 써 주어야 OpenCV 와 같은 결과가 나옵니다.' },
          { type: 'image', src: 'images/low_contrast.png', caption: 'images/low_contrast.png — 노출 부족으로 밝기가 102~134 에만 몰린 저대비 영상. 이 교시의 환자' },
          { type: 'code', title: '예제 2: 대비 키우기 (alpha) 와 밝기 보정 (beta)', code: EX_CONTRAST,
            desc: '표준편차(대비의 척도)가 6.7 → 13.3 → 그리고 alpha 3.0 에서는 <b>0.0</b> 이 되었습니다. 왜일까요? 값이 모두 255 를 넘어 <b>전부 흰색으로 포화</b>됐기 때문입니다. 그래서 대비를 키울 때는 <code>beta</code> 로 다시 내려 주어야 합니다: <code>alpha 3.0, beta -250</code> → 표준편차 20.1 로 <b>3배 선명</b>해지고 값도 56~152 범위에 잘 들어옵니다.',
            expect: '원본 평균 118.2, 표준편차 6.7\nalpha=1.0: 평균 118.2 표준편차 6.7 최소/최대 102/134\nalpha=2.0: 평균 236.3 표준편차 13.3 최소/최대 204/255\nalpha=3.0: 평균 255.0 표준편차 0.0 최소/최대 255/255\nalpha=3.0, beta=-250: 평균 104.5 표준편차 20.1 최소/최대 56/152' },
          { type: 'table', head: ['목적', '코드', '메모'], rows: [
            ['밝게', '<code>Cv2.ConvertScaleAbs(src, dst, 1.0, 40)</code>', 'beta 만 사용 = <code>src + 40</code>'],
            ['어둡게', '<code>Cv2.ConvertScaleAbs(src, dst, 1.0, -40)</code>', '0 아래는 잘림'],
            ['대비 ↑', '<code>Cv2.ConvertScaleAbs(src, dst, 1.5, -60)</code>', 'alpha 로 벌리고 beta 로 중심 맞추기'],
            ['대비 ↓', '<code>Cv2.ConvertScaleAbs(src, dst, 0.6, 50)</code>', '값을 좁히고 위로 올림'],
            ['자동', '<code>Cv2.Normalize(src, dst, 0, 255, NormTypes.MinMax)</code>', '최소 · 최대를 보고 알아서 늘림']
          ], caption: '표 1. alpha(대비) 와 beta(밝기) 의 조합 — beta 의 부호를 alpha 와 반대로 두는 것이 요령' },
          { type: 'h', text: '두 영상 섞기: AddWeighted' },
          { type: 'code', title: '예제 3: AddWeighted 로 블렌딩', code: EX_BLEND,
            desc: '<code>AddWeighted(a, α, b, β, γ, dst)</code> = <b>a×α + b×β + γ</b> 입니다. α + β = 1 로 두면 밝기가 유지되면서 두 영상이 섞입니다(결과 평균이 두 평균 사이에서 이동하는 것을 확인하세요). 검사 화면에서 <b>원본 위에 마스크를 반투명으로 겹칠 때</b> 가장 많이 쓰는 함수입니다. 두 영상의 <b>크기와 형식이 같아야</b> 합니다.',
            expect: 'a 640x480 평균 119.2 / b 640x480 평균 127.7\na x 0.0 + b x 1.0 -> 평균 127.7\na x 0.3 + b x 0.7 -> 평균 125.2\na x 0.5 + b x 0.5 -> 평균 123.4\na x 0.7 + b x 0.3 -> 평균 121.7\na x 1.0 + b x 0.0 -> 평균 119.2' },
          { type: 'h', text: '감마 보정: 곡선으로 바꾸기 (LUT)' },
          { type: 'p', html: '곱하기는 <b>직선</b>이라 밝은 쪽이 먼저 포화됩니다. 어두운 부분만 살리고 밝은 부분은 그대로 두려면 <b>곡선</b>이 필요합니다 — 이것이 감마 보정입니다. <br><b>출력 = 255 × (입력 / 255)<sup>gamma</sup></b> &nbsp;· gamma &lt; 1 이면 밝아지고, gamma &gt; 1 이면 어두워집니다.' },
          { type: 'figure', html: FIG_GAMMA, caption: '그림 2. 감마 곡선 — gamma 0.5 는 어두운 쪽을 크게 끌어올리고 255 는 넘지 않는다' },
          { type: 'p', html: '픽셀마다 <code>Math.Pow</code> 를 계산하면 너무 느립니다. 값이 0~255 뿐이므로 <b>256칸 변환표(LUT · Look-Up Table)</b>를 미리 만들고 <code>Cv2.LUT</code> 로 한 번에 적용하는 것이 정석입니다.' },
          { type: 'code', title: '예제 4: byte[256] 변환표 + Cv2.LUT 로 감마 보정', code: EX_GAMMA,
            desc: '표를 보면 gamma 0.5 에서 <b>128 → 181</b>(크게 밝아짐), <b>255 → 255</b>(포화 없음) 입니다. 반대로 gamma 2.0 은 128 → 64 로 눌러 줍니다. 이 LUT 기법은 감마뿐 아니라 <b>어떤 1:1 밝기 변환</b>(반전 <code>255-v</code>, 계단식 색 줄이기, 색 보정)에도 그대로 쓸 수 있고, 계산은 표 조회 한 번이라 아주 빠릅니다.',
            expect: 'gamma 0.5 표: 0->0 64->128 128->181 192->221 255->255\ngamma 2.0 표: 0->0 64->16 128->64 192->145 255->255\n원본 평균 119.2 / gamma 0.5 171.5 / gamma 2.0 61.6\ngamma 0.5 최소/최대 98/230 (포화 없음)' },
          { type: 'h', text: '저대비 영상 살리기: 선형 스트레칭' },
          { type: 'code', title: '예제 5: Normalize(MinMax) 로 자동 스트레칭', code: EX_NORM,
            desc: '<code>NormTypes.MinMax</code> 는 <b>현재 최소값을 0, 최대값을 255</b> 로 두고 사이를 비례로 늘립니다 — alpha · beta 를 직접 고르지 않아도 됩니다. 표준편차가 6.7 → 53.1 로 <b>8배</b> 커졌습니다. 마지막 두 줄은 같은 계산을 손으로 한 것입니다: (120 − 102) × 255 ÷ (134 − 102) = 143.4 ≈ 143. 단점은 <b>잡음 한 점</b>이 최소/최대가 되면 효과가 줄어드는 것 — 그래서 실무에서는 상·하위 1% 를 잘라 내고 늘리거나 CLAHE(2교시)를 씁니다.',
            expect: '원본: 최소 102 최대 134 평균 118.2 표준편차 6.7\n스트레칭: 최소 0 최대 255 평균 128.8 표준편차 53.1\n(350,60) 120 -> 143\n직접 계산: (v - 102) x 255 / (134 - 102) = 143.4' },
          { type: 'callout', kind: 'tip', title: '어떤 것을 쓸까', html: '<ul><li><b>노출이 살짝 어긋남</b> → <code>ConvertScaleAbs(alpha, beta)</code> 로 간단히</li><li><b>어두운 부분만 살리고 싶다</b> → <b>감마 0.4~0.7</b> (LUT)</li><li><b>전체가 좁은 범위에 몰렸다</b> → <code>Normalize(MinMax)</code></li><li><b>조명이 기울었거나 지역 대비가 필요</b> → <b>CLAHE</b> (2교시)</li></ul>' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서 Slider 로 밝기 · 대비 조절', html: 'XAML 에 <code>&lt;Slider x:Name="alphaSlider" Minimum="0.2" Maximum="3" Value="1"/&gt;</code> 두 개를 두고 <code>ValueChanged</code> 에서 <code>Cv2.ConvertScaleAbs(src, dst, alphaSlider.Value, betaSlider.Value)</code> → <code>imageBox.Source = BitmapSourceConverter.ToBitmapSource(dst)</code> 를 호출하면 실시간 조절 화면이 됩니다. 이때 <b>원본 Mat 은 절대 덮어쓰지 말고</b> 항상 원본에서 다시 계산하세요 — 안 그러면 조절할 때마다 값이 누적돼 되돌릴 수 없습니다. 16차시에서 이 화면을 만듭니다.' }
        ],
        practice: [
          {
            title: '감마 값을 바꿔 저대비 영상 살리기', level: 1,
            desc: '<code>images/low_contrast.png</code> 에 <b>감마 보정</b>을 적용해 보세요. <code>MakeGamma(gamma)</code> 함수를 완성하고 gamma 를 <b>0.4 · 0.7 · 1.5</b> 로 바꿔 평균과 표준편차를 출력하세요. 감마만으로는 <b>표준편차가 별로 커지지 않는다</b>는 것을 확인하고, 왜 이 영상에는 <code>Normalize</code> 가 더 나은지 생각해 보세요.',
            hint: '<code>table[i] = (byte)Math.Round(Math.Pow(i / 255.0, gamma) * 255.0);</code> · 적용은 <code>Cv2.LUT(img, table, dst);</code> · 통계는 <code>Cv2.MeanStdDev(dst, out Scalar m, out Scalar sd);</code>',
            expect: '원본 평균 118.2 표준편차 6.7\ngamma 0.4: 표 128 -> 194, 평균 187.3 표준편차 4.3\ngamma 0.7: 표 128 -> 157, 평균 148.8 표준편차 5.9\ngamma 1.5: 표 128 -> 91, 평균 80.2 표준편차 6.7\nNormalize: 평균 128.8 표준편차 53.1 <- 이 영상에는 이것이 답',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/low_contrast.png", ImreadModes.Grayscale);
        Cv2.MeanStdDev(img, out Scalar m0, out Scalar s0);
        Console.WriteLine($"원본 평균 {m0.Val0:F1} 표준편차 {s0.Val0:F1}");

        foreach (double g in new[] { 0.4, 0.7, 1.5 })
        {
            byte[] table = MakeGamma(g);
            using var dst = new Mat();
            // TODO: Cv2.LUT 로 table 을 적용하고 평균 · 표준편차를 출력하세요
            Console.WriteLine($"gamma {g:F1}: 표 128 -> {table[128]}");
        }
        Cv2.ImShow("input", img);
        Cv2.WaitKey(0);
    }

    static byte[] MakeGamma(double gamma)
    {
        byte[] table = new byte[256];
        // TODO: 감마 공식으로 256칸을 채우세요 (지금은 그대로 복사)
        for (int i = 0; i < 256; i++) table[i] = (byte)i;
        return table;
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/low_contrast.png", ImreadModes.Grayscale);
        Cv2.MeanStdDev(img, out Scalar m0, out Scalar s0);
        Console.WriteLine($"원본 평균 {m0.Val0:F1} 표준편차 {s0.Val0:F1}");

        foreach (double g in new[] { 0.4, 0.7, 1.5 })
        {
            byte[] table = MakeGamma(g);
            using var dst = new Mat();
            Cv2.LUT(img, table, dst);
            Cv2.MeanStdDev(dst, out Scalar m, out Scalar sd);
            Console.WriteLine($"gamma {g:F1}: 표 128 -> {table[128]}, 평균 {m.Val0:F1} 표준편차 {sd.Val0:F1}");
        }
        using var norm = new Mat();
        Cv2.Normalize(img, norm, 0, 255, NormTypes.MinMax);
        Cv2.MeanStdDev(norm, out Scalar mn, out Scalar sn);
        Console.WriteLine($"Normalize: 평균 {mn.Val0:F1} 표준편차 {sn.Val0:F1} <- 이 영상에는 이것이 답");
        Cv2.ImShow("norm", norm);
        Cv2.WaitKey(0);
    }

    static byte[] MakeGamma(double gamma)
    {
        byte[] table = new byte[256];
        for (int i = 0; i < 256; i++)
            table[i] = (byte)Math.Round(Math.Pow(i / 255.0, gamma) * 255.0);
        return table;
    }
}`
          },
          {
            title: '포화를 직접 구현해 Cv2.Add 와 비교하기', level: 2,
            desc: '밝은 영역 <b>(300, 40) 에서 200×150</b> 을 잘라(<code>Clone</code>) 픽셀을 직접 돌며 <b>+60</b> 을 하고 255 를 넘으면 255 로 잘라 보세요. 그 결과가 <code>Cv2.Add(src, new Scalar(60), dst)</code> 와 <b>완전히 같은지</b> <code>Cv2.Absdiff</code> + <code>Cv2.CountNonZero</code> 로 확인하고, 잘린 픽셀이 몇 개인지도 세어 보세요.',
            hint: '<code>int v = src.At&lt;byte&gt;(y, x) + 60; if (v &gt; 255) v = 255; mine.Set&lt;byte&gt;(y, x, (byte)v);</code> — <code>At&lt;byte&gt;</code> 의 결과를 <code>int</code> 에 담아야 255 를 넘는 계산을 할 수 있습니다. 잘라낸 영역은 <b><code>Clone()</code> 으로 복사</b>해서 쓰세요 — ROI 는 원본의 창(같은 메모리)이라 ROI 를 바꾸면 원본도 함께 바뀝니다. 원본을 비교용으로 남겨 두려면 복사본에서 작업합니다.',
            expect: 'Cv2.Add 결과와 다른 픽셀 0개 (0 이면 같음)\n잘린 픽셀 509개 / 전체 30000개',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        using var src = new Mat(img, new Rect(300, 40, 200, 150)).Clone();
        using var mine = src.Clone();
        int clipped = 0;

        for (int y = 0; y < src.Rows; y++)
            for (int x = 0; x < src.Cols; x++)
            {
                // TODO: 값에 60 을 더하고 255 를 넘으면 255 로 잘라 mine 에 쓰세요 (잘린 개수도 세기)
            }

        using var cvAdd = new Mat();
        Cv2.Add(src, new Scalar(60), cvAdd);
        // TODO: Cv2.Absdiff 와 Cv2.CountNonZero 로 두 결과가 같은지 확인하세요
        Console.WriteLine($"잘린 픽셀 {clipped}개");
        Cv2.ImShow("mine", mine);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        using var src = new Mat(img, new Rect(300, 40, 200, 150)).Clone();
        using var mine = src.Clone();
        int clipped = 0;

        for (int y = 0; y < src.Rows; y++)
            for (int x = 0; x < src.Cols; x++)
            {
                int v = src.At<byte>(y, x) + 60;
                if (v > 255) { v = 255; clipped++; }
                mine.Set<byte>(y, x, (byte)v);
            }

        using var cvAdd = new Mat();
        Cv2.Add(src, new Scalar(60), cvAdd);
        using var diff = new Mat();
        Cv2.Absdiff(mine, cvAdd, diff);
        Console.WriteLine($"Cv2.Add 결과와 다른 픽셀 {Cv2.CountNonZero(diff)}개 (0 이면 같음)");
        Console.WriteLine($"잘린 픽셀 {clipped}개 / 전체 {src.Rows * src.Cols}개");
        Cv2.ImShow("mine", mine);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '밝기 · 대비 · 히스토그램 (1)', subtitle: '밝기는 더하기, 대비는 곱하기', notes: '<p>💬 “스마트폰 사진 앱의 ‘밝기’ 와 ‘대비’ 슬라이더는 안에서 무슨 계산을 할까요?” — 오늘 그 두 줄을 직접 씁니다. 목표: 출력 = alpha × 입력 + beta 를 몸에 익히기. (2분)</p>' },
          { layout: 'image', title: '환자: low_contrast.png', src: 'images/low_contrast.png', caption: '노출 부족 · 저대비 — 실제 최소 102, 최대 134 (전체 폭의 12% 만 사용)', notes: '<p>실제 현장에서 흔한 상황입니다(조명 부족, 노출 설정 실수, 렌즈 오염). 💬 “이 사진을 밝게만 하면 잘 보일까요?” — 아니다, 차이(대비)를 벌려야 한다. 이 감각이 이 교시의 핵심입니다. (4분)</p>' },
          { layout: 'diagram', title: '입출력 그래프로 보기', html: FIG_BRIGHT, caption: '더하기 = 평행 이동 · 곱하기 = 기울기 · 255 를 넘으면 잘림(포화)', notes: '<p>그래프를 손으로 따라가며 설명합니다. 특히 포화: 오른쪽 위가 평평해지는 구간 = 정보가 사라진 구간. 💬 “하얗게 날아간 사진을 어둡게 하면 되살아날까?” — 안 된다. (6분)</p>' },
          { layout: 'code', title: '예제: 밝기 ±50 과 포화', code: S_BRIGHT, points: ['<code>img + 50</code> = <code>Cv2.Add(img, new Scalar(50), dst)</code>', '<code>Cv2.Subtract</code> 는 0 아래로 안 내려감', 'OpenCV 는 <b>포화 연산</b> — C# byte 의 순환과 다르다', '원본 최대 208 → 255 로 막힘'], notes: '<p>실행 후 최소/최대 값을 함께 읽습니다. C# 의 <code>byte b=230; b+=50;</code> → 24 를 칠판에 적어 대조하면 기억에 남습니다. (6분)</p>' },
          { layout: 'code', title: '예제: 대비(alpha) 와 밝기(beta)', code: S_CONTRAST, points: ['<code>ConvertScaleAbs(src, dst, alpha, beta)</code>', 'alpha 2.0 만 → 평균 236, 대부분 포화', 'alpha 3.0 + beta −250 → 표준편차 20.1', '<b>표준편차 = 대비의 척도</b>'], notes: '<p>alpha 만 키우면 왜 실패하는지(전부 흰색) 반드시 보여 줍니다. beta 의 부호가 alpha 와 반대라는 요령을 강조. 💬 “alpha 3 이면 beta 는 대략 얼마?” — −(평균×(alpha−1)) ≈ −236. (7분)</p>' },
          { layout: 'diagram', title: '감마 보정: 직선이 아니라 곡선', html: FIG_GAMMA, caption: 'gamma < 1 은 어두운 쪽을 크게 올리고 255 는 넘지 않는다', notes: '<p>곱하기(직선)와 감마(곡선)의 차이를 그래프로 비교합니다. 핵심: <b>밝은 쪽을 잘라먹지 않는다</b>. 감마는 모니터 · 카메라의 기본 특성이기도 하다는 배경도 한 줄 언급. (5분)</p>' },
          { layout: 'code', title: '예제: byte[256] LUT 로 감마 보정', code: S_GAMMA, points: ['값은 0~255 뿐 → <b>256칸 표</b>를 미리 계산', '<code>Cv2.LUT(img, table, dst)</code> 한 번에 적용 (아주 빠름)', 'gamma 0.5 에서 128 → 181, 255 → 255', '반전 · 색 줄이기 등 <b>모든 1:1 변환</b>에 같은 기법'], notes: '<p>“픽셀마다 Math.Pow 를 부르면 30만 번” 과 “표 한 번 만들면 256번” 을 비교합니다. 학생들에게 gamma 값을 1.5, 0.3 으로 바꿔 실행하게 합니다. (7분)</p>' },
          { layout: 'code', title: '예제: Normalize 로 자동 스트레칭', code: S_NORM, points: ['<code>NormTypes.MinMax</code> — 최소 → 0, 최대 → 255', '표준편차 6.7 → 53.1 (8배)', 'alpha · beta 를 고르지 않아도 된다', '약점: 잡음 한 점이 최대값이면 효과 반감'], notes: '<p>저대비 영상의 정답이 이것이라는 점을 확인합니다. 💬 “잡음 픽셀 하나가 255 라면?” — 늘릴 폭이 없다 → 상·하위 1% 절단 또는 CLAHE(2교시) 예고. (6분)</p>' },
          { layout: 'table', title: '상황별 처방', head: ['증상', '처방'], rows: [
            ['전체가 조금 어둡다', '<code>ConvertScaleAbs(1.0, +40)</code>'],
            ['흐릿하다 (차이가 작다)', '<code>ConvertScaleAbs(1.5, −60)</code>'],
            ['그림자 속이 안 보인다', '감마 0.4~0.7 (LUT)'],
            ['좁은 범위에 몰렸다', '<code>Normalize(MinMax)</code>'],
            ['조명이 한쪽으로 기울었다', 'CLAHE (2교시)']
          ], notes: '<p>학생 노트에 적게 할 표입니다. 실습 시간에 이 표를 보고 스스로 고르게 하면 좋습니다. (3분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '8비트 영상에서 230 인 픽셀에 <code>Cv2.Add</code> 로 50 을 더하면?', options: ['280', '255', '24', '오류'], answer: 1, explain: 'OpenCV 는 포화 연산 — 255 로 잘립니다. C# byte 산술(24)과 다릅니다.', notes: '<p>정답 2번. 3번을 고른 학생이 많으면 C# 과 OpenCV 의 차이를 다시 강조합니다.</p>' },
          { layout: 'practice', title: '실습: 감마 값 바꿔 보기', desc: '<p><code>MakeGamma(gamma)</code> 를 완성하고 <b>0.4 · 0.7 · 1.5</b> 로 실행해 평균 · 표준편차를 비교하세요.</p><ul><li>감마만으로는 표준편차가 크게 늘지 않는다는 것을 확인</li><li>같은 영상에 <code>Normalize</code> 도 적용해 비교</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/low_contrast.png", ImreadModes.Grayscale);
        byte[] table = new byte[256];
        // TODO: gamma 0.5 표 채우기 -> Cv2.LUT 적용 -> 평균 출력
        for (int i = 0; i < 256; i++) table[i] = (byte)i;
        using var dst = new Mat();
        Cv2.LUT(img, table, dst);
        Console.WriteLine($"평균 {Cv2.Mean(dst).Val0:F1}");
        Cv2.ImShow("dst", dst);
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/low_contrast.png", ImreadModes.Grayscale);
        byte[] table = new byte[256];
        for (int i = 0; i < 256; i++)
            table[i] = (byte)Math.Round(Math.Pow(i / 255.0, 0.5) * 255.0);
        using var dst = new Mat();
        Cv2.LUT(img, table, dst);
        Cv2.MeanStdDev(dst, out Scalar m, out Scalar sd);
        Console.WriteLine($"평균 {m.Val0:F1} 표준편차 {sd.Val0:F1}");
        Cv2.ImShow("dst", dst);
        Cv2.WaitKey(0);
    }
}`, notes: '<p>감마는 “어두운 쪽을 살리는” 도구이지 “대비를 만드는” 도구가 아니라는 결론을 학생 입으로 말하게 합니다. 저대비에는 Normalize/CLAHE. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['출력 = <b>alpha × 입력 + beta</b> → <code>Cv2.ConvertScaleAbs</code>', 'OpenCV 산술은 <b>포화</b> (255 · 0 에서 잘림, 되돌릴 수 없음)', '<code>AddWeighted(a, α, b, β, γ)</code> = 두 영상 섞기 (α+β=1)', '감마 = 곡선 변환 → <b>byte[256] LUT</b> + <code>Cv2.LUT</code>', '<code>Normalize(MinMax)</code> = 최소/최대를 0/255 로 늘리는 선형 스트레칭', '다음 교시: 영상의 성적표 <b>히스토그램</b> 과 EqualizeHist · CLAHE'], notes: '<p>다섯 줄을 읽고 다음 교시를 예고합니다: “이 영상이 밝은지 어두운지, 대비가 좋은지 한눈에 보는 그래프를 직접 그린다.” (2분)</p>' }
        ]
      },
      {
        id: 'cs06-2', title: '히스토그램 · 평탄화 · CLAHE', minutes: 50,
        goals: ['Cv2.CalcHist 로 히스토그램을 구해 막대 그래프로 그릴 수 있다', '히스토그램 모양으로 어두운 사진 · 저대비 · 포화를 판단할 수 있다', 'EqualizeHist 와 CLAHE 를 비교하고 컬러 영상에 올바르게 적용할 수 있다'],
        flow: [['도입: 히스토그램이란', 8], ['CalcHist 와 그리기', 17], ['평탄화 · CLAHE · 컬러', 17], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: '히스토그램 = 밝기별 픽셀 수' },
          { type: 'p', html: '히스토그램은 <b>어떤 밝기의 픽셀이 몇 개인가</b>를 세어 그린 막대 그래프입니다. 위치 정보는 버리고 개수만 남기므로, 영상이 <b>어두운지 · 밝은지 · 대비가 좋은지 · 날아갔는지</b>를 한눈에 알려 주는 <b>성적표</b> 역할을 합니다. 카메라의 노출을 맞출 때, 조명을 점검할 때 가장 먼저 보는 그래프입니다.' },
          { type: 'figure', html: FIG_HIST, caption: '그림 3. 4×4 조각의 픽셀 값을 세면 두 개의 봉우리가 생긴다 — 이런 영상은 이진화하기 쉽다' },
          { type: 'code', title: '예제 1: CalcHist 로 구해서 직접 그리기', code: EX_HIST,
            desc: '<code>Cv2.CalcHist</code> 는 인수가 많지만 형태는 늘 같습니다: <b>영상 배열 · 채널 배열 · 마스크 · 출력 · 차원 수 · bin 수 · 범위</b>. 결과는 <b>CV_32FC1 의 256행 1열</b> 이므로 <code>hist.At&lt;float&gt;(i, 0)</code> 으로 읽습니다. <code>DrawHist</code> 는 가장 큰 막대를 280 px 로 맞춰(정규화) <code>Cv2.Line</code> 을 256번 그립니다 — 결과 창의 그래프에서 <b>149 부근의 큰 봉우리(트레이 배경)</b> 와 어두운 쪽의 작은 봉우리(부품)를 확인하세요.',
            expect: '히스토그램 크기 256x1, 형식 CV_32FC1\n밝기 0 픽셀 0개, 128 픽셀 1974개, 255 픽셀 0개\n가장 많은 밝기 = 149 (13845개)\n합계 307200 = 전체 픽셀 307200' },
          { type: 'callout', kind: 'warn', title: 'CalcHist 의 흔한 실수 3가지', html: '<ul><li><b>배열로 감싸기</b>: 영상 하나여도 <code>new[] { img }</code>, 채널 하나여도 <code>new[] { 0 }</code> 입니다.</li><li><b>float 로 읽기</b>: <code>hist.At&lt;byte&gt;(i, 0)</code> 은 엉뚱한 값을 줍니다 — 반드시 <code>At&lt;float&gt;</code>.</li><li><b>범위는 상한 제외</b>: <code>new Rangef(0, 256)</code> 이라고 써야 255 까지 포함됩니다(<code>(0, 255)</code> 로 쓰면 마지막 칸이 빠집니다).</li></ul>마스크를 주면 <b>그 영역만</b>의 히스토그램이 나옵니다 (<code>null</code> 대신 마스크 Mat) — ROI 검사에 유용합니다.' },
          { type: 'h', text: '히스토그램 읽는 법' },
          { type: 'code', title: '예제 2: 세 영상의 히스토그램 비교 (구간별 비율)', code: EX_READ,
            desc: '숫자로 보면 진단이 분명해집니다. <b>sample_gray</b> 는 128~191 에 61.8% 가 있고 폭(38~208)이 넓습니다 — 정상. <b>low_contrast</b> 는 64~127 구간에 <b>98.8%</b> 가 몰려 폭이 32 뿐 — 저대비. <b>uneven_light</b> 는 폭은 235 로 넓고 밝은 쪽(192~255)에 34.2% 가 있는데 최대값이 <b>255 로 포화(핫스폿)</b> 되어 있고 어두운 쪽은 20 까지 내려갑니다 — 한 장 안에서 밝기가 크게 다른 <b>조명 불균일</b>입니다. 처방이 각각 다릅니다.',
            expect: 'images/sample_gray.png\n   최소 38 최대 208 평균 119.2 표준편차 38.8\n     0 ~  63 :  20.1%\n    64 ~ 127 :  17.7%\n   128 ~ 191 :  61.8%\n   192 ~ 255 :   0.5%\nimages/low_contrast.png\n   최소 102 최대 134 평균 118.2 표준편차 6.7\n     0 ~  63 :   0.0%\n    64 ~ 127 :  98.8%\n   128 ~ 191 :   1.2%\n   192 ~ 255 :   0.0%\nimages/uneven_light.png\n   최소 20 최대 255 평균 164.3 표준편차 50.5\n     0 ~  63 :   3.9%\n    64 ~ 127 :  21.3%\n   128 ~ 191 :  40.6%\n   192 ~ 255 :  34.2%' },
          { type: 'table', head: ['히스토그램 모양', '진단', '처방'], rows: [
            ['왼쪽(0 쪽)에 몰림', '노출 부족 — 어두운 사진', 'beta 더하기 · 감마 0.5 · 조명 강화'],
            ['오른쪽(255)에 붙어 봉우리', '포화 — 하얗게 날아감', '노출 · 조명 줄이기 (소프트웨어로 복구 불가)'],
            ['가운데 좁은 봉우리 하나', '저대비', '<code>Normalize(MinMax)</code> · CLAHE'],
            ['봉우리 두 개 + 사이가 빈다', '물체/배경이 잘 갈린다', '<b>이진화에 최적</b> (07차시 Otsu)'],
            ['전체에 고르게 퍼짐', '대비 좋음 (또는 평탄화 결과)', '그대로 사용']
          ], caption: '표 2. 히스토그램 모양 → 진단 → 처방. 검사 장비를 세팅할 때 가장 먼저 하는 점검' },
          { type: 'h', text: '평탄화(EqualizeHist) 와 CLAHE' },
          { type: 'p', html: '<b>히스토그램 평탄화</b>는 누적 히스토그램(CDF)을 변환표로 써서 픽셀 값을 <b>0~255 전체에 고르게 퍼지도록</b> 재배치합니다. 강력하지만 영상 전체에 하나의 표를 쓰기 때문에 ① 조명이 기울어진 영상에서는 한쪽이 뭉개지고 ② <b>잡음도 함께 증폭</b>됩니다. <b>CLAHE</b>(Contrast Limited Adaptive Histogram Equalization)는 영상을 <b>타일(보통 8×8)</b> 로 나눠 각각 평탄화하고, <code>clipLimit</code> 로 <b>증폭 한도</b>를 두어 이 문제를 줄입니다.' },
          { type: 'figure', html: FIG_EQ, caption: '그림 4. 좁은 봉우리를 CDF 로 펴는 평탄화 · 타일마다 제한을 두고 펴는 CLAHE' },
          { type: 'code', title: '예제 3: Normalize · EqualizeHist · CLAHE 비교', code: EX_EQ,
            desc: '표준편차로 강도를 비교해 보세요: 원본 6.7 → Normalize 53.1 → <b>EqualizeHist 78.5</b>(가장 셈, 잡음도 증폭) → CLAHE 는 <code>clipLimit</code> 에 따라 13.1 → 17.5 → 25.0 으로 <b>조절 가능</b>합니다. 결과 창의 두 영상을 비교하면 EqualizeHist 는 얼룩덜룩하고, CLAHE 는 부드럽게 살아납니다. 실무에서는 <b>clipLimit 2~4, 타일 8×8</b> 에서 시작해 눈으로 맞춥니다.',
            expect: '원본             최소/최대 102/134 평균 118.2 표준편차 6.7\nNormalize      최소/최대 0/255 평균 128.8 표준편차 53.1\nEqualizeHist   최소/최대 0/255 평균 139.4 표준편차 78.5\nCLAHE(2.0)     최소/최대 90/151 평균 122.8 표준편차 13.1\nCLAHE(4.0)     최소/최대 79/163 평균 125.0 표준편차 17.5\nCLAHE(8.0)     최소/최대 59/180 평균 128.1 표준편차 25.0' },
          { type: 'h', text: '컬러 영상의 밝기 균일화' },
          { type: 'code', title: '예제 4: HSV 의 V 채널만 평탄화하기', code: EX_COLOR,
            desc: 'B · G · R 을 각각 평탄화하면 세 채널의 분포가 억지로 같아져 <b>평균이 (134,134,134) 로 회색에 몰리고</b> 색이 바랩니다(빨간 원이 B=5 G=2 R=245 로 과장). HSV 의 <b>V 채널만</b> 평탄화하면 H(색상)와 S(채도)는 건드리지 않으므로 <b>색은 그대로 두고 밝기만</b> 살아납니다. Lab 의 L 채널을 쓰는 방법도 같은 원리입니다.',
            expect: '어두운 원본       평균 BGR (58,60,60)  빨간 원 BGR (18,18,98) H=0\nBGR 각각       평균 BGR (134,134,134)  빨간 원 BGR (5,2,245) H=0\nV 채널만        평균 BGR (116,120,122)  빨간 원 BGR (45,45,243) H=0' },
          { type: 'callout', kind: 'tip', title: '검사에서는 “보기 좋게” 가 목적이 아니다', html: '평탄화 · CLAHE 는 <b>사람이 보기 좋게</b> 만드는 데는 훌륭하지만, <b>측정</b>에는 조심해야 합니다. 픽셀 값이 비선형으로 바뀌므로 "밝기 200 이상이면 불량" 같은 <b>절대 기준이 깨집니다</b>. 그래서 실무에서는 ① 화면 표시용으로만 쓰거나 ② 조명 불균일 보정(배경 나누기 · 07차시의 적응형 이진화)처럼 <b>목적이 분명한</b> 방법을 씁니다.' },
          { type: 'code', title: '예제 5: MinMaxLoc · Mean · MeanStdDev 통계와 판정', code: EX_STATS,
            desc: '<code>MinMaxLoc</code> 은 값뿐 아니라 <b>위치</b>도 줍니다(가장 밝은 점이 어디인지 = 핫스폿 찾기). <code>MeanStdDev</code> 는 평균과 표준편차를 한 번에 주고, <b>마스크를 넘기면 그 영역만</b> 계산합니다 — ROI 검사에서 "이 창 안의 평균 밝기가 규격 안인가"를 판정하는 기본형입니다. 마지막 줄처럼 <b>표준편차로 저대비를 자동 판정</b>하면 조명 이상을 스스로 알려 주는 프로그램이 됩니다.',
            expect: "최소 102 @ (36,4) / 최대 134 @ (498,91)\n평균 118.18 표준편차 6.69\nCv2.Mean 만 쓰면 118.18\n가운데 사각형 영역: 평균 121.41 표준편차 3.79\n판정: 표준편차 6.69 < 15 이므로 '저대비 — 조명 · 노출 점검 필요'" },
          { type: 'callout', kind: 'wpf', title: 'WPF 에 히스토그램 띄우기', html: '히스토그램을 <b>Mat 에 그려서</b>(예제 1 의 <code>DrawHist</code>) <code>Image</code> 컨트롤에 넣는 것이 가장 간단합니다 — WPF 차트 라이브러리가 필요 없습니다. 마우스로 ROI 를 드래그하면 그 영역 마스크로 <code>CalcHist</code> 를 다시 호출해 갱신하는 식으로 만들면 실전 도구가 됩니다(16차시).' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<ul><li>미리 실행해 둘 것: 예제 1 의 히스토그램 그림과 예제 3 의 EqualizeHist / CLAHE 영상 — <b>화면 비교</b>가 이 교시의 핵심 체험입니다.</li><li>오개념 ①: <b>“평탄화하면 항상 좋아진다”</b> → 잡음 증폭 · 절대 기준 붕괴를 예제 3 의 표준편차 78.5 로 설명.</li><li>오개념 ②: <b>“히스토그램이 같으면 같은 영상”</b> → 위치 정보가 없다는 점을 그림 3 으로.</li><li>오개념 ③: <code>At&lt;byte&gt;</code> 로 히스토그램 읽기 → 형식이 <code>CV_32FC1</code>.</li><li>평가 루브릭(4점): ① CalcHist 인수를 바르게 씀(1) ② 막대 그래프를 그림(1) ③ 히스토그램으로 진단을 말함(1) ④ 컬러는 V 채널만 처리(1).</li><li>💬 마무리 발문: “봉우리가 두 개인 히스토그램에서 임계값을 어디에 둘까?” → 07차시 Otsu 로 자연스럽게 연결.</li></ul>' }
        ],
        practice: [
          {
            title: '히스토그램 그리기 함수 완성하기', level: 2,
            desc: '<code>DrawHist(Mat gray)</code> 함수를 완성해 <b>512×300 컬러 캔버스</b>에 히스토그램 막대를 그리세요. 가장 큰 막대가 캔버스 높이의 약 90% 가 되도록 정규화하고, <code>images/low_contrast.png</code> 의 히스토그램이 <b>가운데 좁은 봉우리</b>로 보이는지 확인하세요.',
            hint: '① <code>Cv2.CalcHist</code> → ② <code>Cv2.MinMaxLoc(hist, out double mn, out double mx)</code> 로 최대 개수 → ③ <code>int barH = (int)(hist.At&lt;float&gt;(i,0) / mx * 270);</code> → ④ <code>Cv2.Line(canvas, new Point(i*2, 299), new Point(i*2, 299-barH), Scalar.All(200), 2);</code>',
            expect: '가장 많은 밝기 123, 개수 58493\n픽셀이 존재하는 구간 102 ~ 134 (폭 32)',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/low_contrast.png", ImreadModes.Grayscale);
        using var hist = new Mat();
        Cv2.CalcHist(new[] { img }, new[] { 0 }, null, hist, 1, new[] { 256 }, new[] { new Rangef(0, 256) });

        using var canvas = new Mat(300, 512, MatType.CV_8UC3, Scalar.All(30));
        // TODO: 가장 큰 막대를 찾아(MinMaxLoc) 비율로 막대 높이를 정하고 Cv2.Line 으로 256개를 그리세요

        Cv2.MinMaxLoc(hist, out double mn, out double mx, out Point mnLoc, out Point mxLoc);
        Console.WriteLine($"가장 많은 밝기 {mxLoc.Y}, 개수 {mx}");
        Cv2.ImShow("histogram", canvas);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/low_contrast.png", ImreadModes.Grayscale);
        using var canvas = DrawHist(img);
        Cv2.ImShow("histogram", canvas);
        Cv2.WaitKey(0);
    }

    static Mat DrawHist(Mat gray)
    {
        using var hist = new Mat();
        Cv2.CalcHist(new[] { gray }, new[] { 0 }, null, hist, 1, new[] { 256 }, new[] { new Rangef(0, 256) });
        Cv2.MinMaxLoc(hist, out double mn, out double mx, out Point mnLoc, out Point mxLoc);
        Console.WriteLine($"가장 많은 밝기 {mxLoc.Y}, 개수 {mx}");

        var canvas = new Mat(300, 512, MatType.CV_8UC3, Scalar.All(30));
        for (int i = 0; i < 256; i++)
        {
            int barH = (int)(hist.At<float>(i, 0) / mx * 270);
            Cv2.Line(canvas, new Point(i * 2, 299), new Point(i * 2, 299 - barH), Scalar.All(200), 2);
        }
        int lo = 0, hi = 255;
        while (hist.At<float>(lo, 0) == 0) lo++;
        while (hist.At<float>(hi, 0) == 0) hi--;
        Console.WriteLine($"픽셀이 존재하는 구간 {lo} ~ {hi} (폭 {hi - lo})");
        return canvas;
    }
}`
          },
          {
            title: 'CLAHE 의 clipLimit · 타일 크기 바꿔 보기', level: 1,
            desc: '<code>images/uneven_light.png</code>(조명이 기울어진 영상)에 <b>EqualizeHist</b> 와 <b>CLAHE</b> 를 적용해 표준편차를 비교하고, <code>clipLimit</code> 를 1 · 2 · 4 로, 타일을 <code>4×4</code> 와 <code>16×16</code> 으로 바꿔 결과를 관찰하세요. 어느 설정이 글자를 가장 잘 읽게 만드나요?',
            hint: '<code>using var clahe = Cv2.CreateCLAHE(clip, new Size(tile, tile)); clahe.Apply(img, dst);</code> · 통계는 <code>Cv2.MeanStdDev</code>. 결과 창에 여러 장을 <code>Cv2.ImShow</code> 로 함께 띄우면 비교가 쉽습니다.',
            expect: '원본 표준편차 50.5\nEqualizeHist 표준편차 73.7\nCLAHE clip 1.0 (8x8) 표준편차 49.5\nCLAHE clip 2.0 (8x8) 표준편차 48.2\nCLAHE clip 4.0 (8x8) 표준편차 47.1\nCLAHE clip 2.0 (4x4) 표준편차 51.9\nCLAHE clip 2.0 (16x16) 표준편차 48.5',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);
        Cv2.MeanStdDev(img, out Scalar m0, out Scalar s0);
        Console.WriteLine($"원본 표준편차 {s0.Val0:F1}");

        using var eq = new Mat();
        Cv2.EqualizeHist(img, eq);
        // TODO: EqualizeHist 의 표준편차를 출력하세요

        foreach (double clip in new[] { 1.0, 2.0, 4.0 })
        {
            // TODO: CLAHE(clip, 8x8) 를 적용해 표준편차를 출력하세요
        }
        Cv2.ImShow("equalize", eq);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);
        Cv2.MeanStdDev(img, out Scalar m0, out Scalar s0);
        Console.WriteLine($"원본 표준편차 {s0.Val0:F1}");

        using var eq = new Mat();
        Cv2.EqualizeHist(img, eq);
        Cv2.MeanStdDev(eq, out Scalar me, out Scalar se);
        Console.WriteLine($"EqualizeHist 표준편차 {se.Val0:F1}");

        foreach (double clip in new[] { 1.0, 2.0, 4.0 })
        {
            using var clahe = Cv2.CreateCLAHE(clip, new Size(8, 8));
            using var dst = new Mat();
            clahe.Apply(img, dst);
            Cv2.MeanStdDev(dst, out Scalar m, out Scalar sd);
            Console.WriteLine($"CLAHE clip {clip:F1} (8x8) 표준편차 {sd.Val0:F1}");
        }
        foreach (int tile in new[] { 4, 16 })
        {
            using var clahe = Cv2.CreateCLAHE(2.0, new Size(tile, tile));
            using var dst = new Mat();
            clahe.Apply(img, dst);
            Cv2.MeanStdDev(dst, out Scalar m, out Scalar sd);
            Console.WriteLine($"CLAHE clip 2.0 ({tile}x{tile}) 표준편차 {sd.Val0:F1}");
            Cv2.ImShow($"clahe {tile}", dst);
        }
        Cv2.ImShow("equalize", eq);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '밝기 · 대비 · 히스토그램 (2)', subtitle: '영상의 성적표를 읽고 고치기', notes: '<p>💬 “사진 앱의 히스토그램 그래프를 본 적 있나요? 그 그래프로 무엇을 알 수 있을까요?” — 노출 · 대비 진단. 오늘은 그 그래프를 직접 그리고 읽습니다. (2분)</p>' },
          { layout: 'diagram', title: '히스토그램 = 밝기별 픽셀 수', html: FIG_HIST, caption: '가로축 밝기 0~255 · 세로축 개수. 위치 정보는 버린다', notes: '<p>4×4 조각을 함께 세어 봅니다(어두운 8개, 밝은 8개). 핵심 두 가지: ① 막대 합 = 전체 픽셀 수 ② 위치 정보가 없다. 💬 “같은 히스토그램을 가진 다른 영상이 있을 수 있을까?” — 있다(픽셀을 섞어도 같다). (5분)</p>' },
          { layout: 'code', title: '예제: CalcHist → 막대 그래프로 그리기', code: S_HIST, points: ['인수: 영상[] · 채널[] · 마스크 · 출력 · 차원 · bin[] · 범위[]', '결과는 <b>CV_32FC1 256×1</b> → <code>At&lt;float&gt;(i, 0)</code>', '최대값으로 정규화해 <code>Cv2.Line</code> 256번', '<code>new Rangef(0, 256)</code> — 상한은 제외'], notes: '<p>인수가 많아 겁먹지 않게 “늘 같은 모양”이라고 안심시킵니다. 결과 창의 그래프에서 149 봉우리(트레이)를 함께 찾습니다. (8분)</p>' },
          { layout: 'table', title: '히스토그램 읽는 법', head: ['모양', '진단', '처방'], rows: [
            ['왼쪽에 몰림', '어두운 사진', '+beta · 감마 0.5'],
            ['오른쪽 끝에 붙음', '포화 (날아감)', '노출 · 조명 줄이기 — 복구 불가'],
            ['가운데 좁은 봉우리', '저대비', '<code>Normalize</code> · CLAHE'],
            ['봉우리 2개', '물체/배경 분리 쉬움', '이진화 (07차시)'],
            ['고르게 퍼짐', '대비 양호', '그대로']
          ], notes: '<p>표를 보며 실제 세 영상(sample_gray · low_contrast · uneven_light)의 숫자를 대응시킵니다: 98.8% 가 한 구간 = 저대비, 33.7% 가 192 이상 + 최대 255 = 포화. (5분)</p>' },
          { layout: 'diagram', title: '평탄화와 CLAHE', html: FIG_EQ, caption: 'CDF 를 변환표로 써서 펴기 → 타일별 + clipLimit 로 제한한 것이 CLAHE', notes: '<p>CDF 곡선이 “변환표”라는 점만 직관적으로 설명하고 수식은 생략합니다. CLAHE 의 두 손잡이(clipLimit · 타일 크기)를 강조. (5분)</p>' },
          { layout: 'code', title: '예제: EqualizeHist vs CLAHE', code: S_EQ, points: ['표준편차 6.7 → 평탄화 78.5 → CLAHE 13.1', '평탄화는 <b>가장 세지만</b> 잡음도 증폭', 'CLAHE 는 <code>clipLimit</code> 로 강도 조절', '실무 시작값: clipLimit 2~4, 타일 8×8'], notes: '<p>두 결과 영상을 나란히 보여 주는 것이 핵심입니다. 얼룩덜룩함(평탄화) vs 자연스러움(CLAHE). 💬 “왜 숫자가 큰 쪽이 더 좋은 게 아닐까?” — 잡음까지 키운다. (7분)</p>' },
          { layout: 'code', title: '예제: 컬러는 V 채널만', code: S_COLOR, points: ['B · G · R 각각 평탄화 → <b>색이 바랜다</b>', 'HSV 로 바꿔 <code>hc[2]</code>(V) 만 평탄화', '다시 <code>Merge</code> → <code>HSV2BGR</code>', 'Lab 의 L 채널도 같은 원리'], notes: '<p>05차시의 Split/Merge 가 여기서 쓰인다는 점을 짚어 줍니다. 잘못된 방법의 결과(평균 BGR 이 회색으로 몰림)를 먼저 보여 주면 효과가 큽니다. (6분)</p>' },
          { layout: 'bullets', title: '통계 3종 세트', lead: '히스토그램을 다 그리지 않아도 알 수 있는 것들', bullets: [
            '<code>Cv2.MinMaxLoc(img, out mn, out mx, out mnLoc, out mxLoc)</code> — 값 + <b>위치</b> (핫스폿 찾기)',
            '<code>Cv2.Mean(img)</code> — 평균 (Scalar 의 Val0~Val2 = 채널별)',
            '<code>Cv2.MeanStdDev(img, out mean, out sd)</code> — <b>표준편차 = 대비의 척도</b>',
            '<b>마스크</b>를 넘기면 그 영역만 계산 → ROI 검사의 기본형',
            ['자동 판정 예', ['<code>sd &lt; 15</code> → 저대비 경고', '<code>mx == 255</code> → 포화 경고']]
          ], notes: '<p>실전에서 가장 많이 쓰는 4줄입니다. 학생들에게 “조명이 이상하면 자동으로 알려 주는 코드”를 써 보라고 하면 좋은 과제가 됩니다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>Cv2.CalcHist</code> 결과 Mat 의 형식과 크기는?', options: ['CV_8UC1, 256×1', 'CV_32FC1, 256×1', 'CV_32SC1, 1×256', 'CV_8UC3, 256×256'], answer: 1, explain: 'float 256행 1열 — 값은 <code>hist.At&lt;float&gt;(i, 0)</code> 으로 읽습니다.', notes: '<p>정답 2번. 실습에서 값이 이상하게 나오면 여기를 먼저 확인하라고 알려 줍니다.</p>' },
          { layout: 'practice', title: '실습: CLAHE 손잡이 돌려 보기', desc: '<p><code>uneven_light.png</code> 에 EqualizeHist 와 CLAHE 를 적용해 표준편차를 비교하세요.</p><ul><li><code>clipLimit</code> 1 · 2 · 4</li><li>타일 4×4 와 16×16</li><li>어느 설정이 <b>글자를 가장 잘 읽게</b> 하나?</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);
        using var eq = new Mat();
        Cv2.EqualizeHist(img, eq);
        // TODO: CLAHE 를 clipLimit 2.0, 8x8 로 적용해 비교하세요
        Cv2.ImShow("equalize", eq);
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);
        using var eq = new Mat();
        Cv2.EqualizeHist(img, eq);
        using var clahe = Cv2.CreateCLAHE(2.0, new Size(8, 8));
        using var cl = new Mat();
        clahe.Apply(img, cl);
        Cv2.MeanStdDev(eq, out Scalar me, out Scalar se);
        Cv2.MeanStdDev(cl, out Scalar mc, out Scalar sc);
        Console.WriteLine($"평탄화 {se.Val0:F1} / CLAHE {sc.Val0:F1}");
        Cv2.ImShow("equalize", eq);
        Cv2.ImShow("clahe", cl);
        Cv2.WaitKey(0);
    }
}`, notes: '<p>정답 경향: 평탄화 73.7 / CLAHE(2.0) 48.2. 글자는 CLAHE 가 훨씬 잘 보입니다. 하지만 오른쪽 아래 어두운 영역은 여전히 완전하지 않다 → 07차시의 <b>적응형 이진화</b>가 필요하다고 연결합니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['히스토그램 = 밝기별 픽셀 수 (위치 정보는 없음)', '<code>Cv2.CalcHist(new[]{img}, new[]{0}, null, hist, 1, new[]{256}, new[]{new Rangef(0,256)})</code> → <b>CV_32FC1 256×1</b>', '모양으로 진단: 어두움 · 포화 · 저대비 · 봉우리 두 개', '<code>EqualizeHist</code> = 전역(강함, 잡음 증폭) · <b>CLAHE</b> = 타일별 + clipLimit', '컬러는 <b>HSV 의 V 채널만</b> (또는 Lab 의 L)', '통계: <code>MinMaxLoc</code> · <code>Mean</code> · <code>MeanStdDev</code> (+ 마스크)', '다음 차시: 봉우리 사이에 선을 긋는 <b>이진화(Threshold)</b>'], notes: '<p>정리 후 다음 차시를 예고합니다: “봉우리 두 개 사이의 골짜기를 자동으로 찾아 주는 Otsu.” 히스토그램을 이해했으니 이진화는 자연스럽게 이어집니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
