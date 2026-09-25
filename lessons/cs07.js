/* 07차시 이진화 (Threshold) */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 히스토그램의 두 봉우리와 임계선
  const FIG_THRESH = `<svg viewBox="0 0 740 300" role="img" aria-label="히스토그램에 봉우리가 두 개 있을 때 그 사이 골짜기에 임계값을 두면 물체와 배경이 갈린다">
  ${ARROW('c07a1')}
  <text x="20" y="26" class="tx-b">히스토그램: 물체(어두움)와 배경(밝음) 두 봉우리</text>
  <line x1="60" y1="230" x2="700" y2="230" class="ax"/>
  <line x1="60" y1="230" x2="60" y2="50" class="ax"/>
  <text x="58" y="250" text-anchor="middle" class="tx-m">0</text>
  <text x="370" y="250" text-anchor="middle" class="tx-m">125</text>
  <text x="694" y="250" text-anchor="middle" class="tx-m">255</text>
  <text x="50" y="46" text-anchor="end" class="tx-m">개수</text>
  <path d="M60,230 C120,230 140,90 190,90 C240,90 250,228 300,230 L300,230 Z" class="p1s"/>
  <path d="M460,230 C520,226 540,70 590,70 C640,70 660,228 700,230 L700,230 Z" class="p3s"/>
  <text x="180" y="82" text-anchor="middle" class="tx">물체 (어두운 픽셀)</text>
  <text x="585" y="62" text-anchor="middle" class="tx">배경 (밝은 픽셀)</text>
  <line x1="370" y1="40" x2="370" y2="240" class="s2" stroke-width="3" stroke-dasharray="7 5"/>
  <text x="370" y="34" text-anchor="middle" class="tx-b">임계값 t = 125</text>
  <text x="378" y="200" class="tx-m">골짜기 — 여기 선을 그으면</text>
  <text x="378" y="220" class="tx-m">두 무리가 깨끗이 갈린다</text>
  <rect x="60" y="266" width="310" height="26" rx="6" class="p1"/>
  <text x="215" y="284" text-anchor="middle" class="tx-w">v ≤ t → 0 (검정)</text>
  <rect x="370" y="266" width="330" height="26" rx="6" class="p3"/>
  <text x="535" y="284" text-anchor="middle" class="tx-w">v &gt; t → 255 (흰색) — Binary 기준</text>
  <text x="378" y="160" class="tx-m">Otsu 는 이 골짜기 위치를</text>
  <text x="378" y="180" class="tx-m">자동으로 찾아 준다</text>
</svg>`;

  // 그림 2: ThresholdTypes 5종의 입출력 그래프
  const FIG_TYPES = `<svg viewBox="0 0 740 260" role="img" aria-label="Binary, BinaryInv, Trunc, Tozero, TozeroInv 다섯 가지 이진화 방식의 입출력 그래프">
  <text x="20" y="22" class="tx-b">임계값 t = 127, maxval = 255 — 입력(가로) → 출력(세로)</text>
  <g>
    <line x1="30" y1="200" x2="150" y2="200" class="ax"/><line x1="30" y1="200" x2="30" y2="60" class="ax"/>
    <polyline points="30,200 90,200 90,70 150,70" class="s3" fill="none" stroke-width="3"/>
    <line x1="90" y1="200" x2="90" y2="210" class="ln"/><text x="90" y="226" text-anchor="middle" class="tx-m">t</text>
    <text x="90" y="248" text-anchor="middle" class="tx-b">Binary</text>
    <text x="24" y="66" text-anchor="end" class="tx-m">255</text>
  </g>
  <g>
    <line x1="180" y1="200" x2="300" y2="200" class="ax"/><line x1="180" y1="200" x2="180" y2="60" class="ax"/>
    <polyline points="180,70 240,70 240,200 300,200" class="s3" fill="none" stroke-width="3"/>
    <line x1="240" y1="200" x2="240" y2="210" class="ln"/><text x="240" y="226" text-anchor="middle" class="tx-m">t</text>
    <text x="240" y="248" text-anchor="middle" class="tx-b">BinaryInv</text>
  </g>
  <g>
    <line x1="330" y1="200" x2="450" y2="200" class="ax"/><line x1="330" y1="200" x2="330" y2="60" class="ax"/>
    <polyline points="330,200 390,130 450,130" class="s2" fill="none" stroke-width="3"/>
    <line x1="390" y1="200" x2="390" y2="210" class="ln"/><text x="390" y="226" text-anchor="middle" class="tx-m">t</text>
    <text x="390" y="248" text-anchor="middle" class="tx-b">Trunc</text>
  </g>
  <g>
    <line x1="480" y1="200" x2="600" y2="200" class="ax"/><line x1="480" y1="200" x2="480" y2="60" class="ax"/>
    <polyline points="480,200 540,200 540,130 600,60" class="s1" fill="none" stroke-width="3"/>
    <line x1="540" y1="200" x2="540" y2="210" class="ln"/><text x="540" y="226" text-anchor="middle" class="tx-m">t</text>
    <text x="540" y="248" text-anchor="middle" class="tx-b">Tozero</text>
  </g>
  <g>
    <line x1="620" y1="200" x2="720" y2="200" class="ax"/><line x1="620" y1="200" x2="620" y2="60" class="ax"/>
    <polyline points="620,200 670,130 670,200 720,200" class="s1" fill="none" stroke-width="3"/>
    <line x1="670" y1="200" x2="670" y2="210" class="ln"/><text x="670" y="226" text-anchor="middle" class="tx-m">t</text>
    <text x="670" y="248" text-anchor="middle" class="tx-b">TozeroInv</text>
  </g>
</svg>`;

  // 그림 3: 전역 vs 적응형
  const FIG_ADAPT = `<svg viewBox="0 0 740 320" role="img" aria-label="조명이 기울어진 영상에서는 하나의 전역 임계값이 한쪽에서 실패하고, 픽셀 주변 평균을 쓰는 적응형 이진화가 성공한다">
  ${ARROW('c07a3')}
  <text x="20" y="24" class="tx-b">한 줄(가로)의 밝기 프로파일 — 조명이 왼쪽은 밝고 오른쪽은 어둡다</text>
  <line x1="40" y1="200" x2="700" y2="200" class="ax"/>
  <line x1="40" y1="200" x2="40" y2="44" class="ax"/>
  <path d="M40,70 L180,86 L200,140 L220,86 L360,116 L380,168 L400,116 L540,150 L560,196 L580,150 L700,176" class="s1" fill="none" stroke-width="3"/>
  <text x="120" y="62" class="tx-m">밝은 배경</text>
  <text x="600" y="166" class="tx-m">어두운 배경</text>
  <text x="196" y="160" text-anchor="middle" class="tx-m">글자</text>
  <text x="556" y="216" text-anchor="middle" class="tx-m">글자</text>
  <line x1="40" y1="128" x2="700" y2="128" class="s2" stroke-width="3" stroke-dasharray="7 5"/>
  <text x="706" y="132" class="tx">전역 t</text>
  <text x="430" y="122" class="tx-m">오른쪽 배경 전체가 t 아래 → 통째로 검게 (실패)</text>
  <path d="M40,84 L180,100 L220,100 L360,130 L400,130 L540,164 L580,164 L700,190" class="s3" fill="none" stroke-width="3" stroke-dasharray="4 3"/>
  <text x="460" y="186" class="tx">적응형: 주변 평균 − C (배경을 따라 내려간다)</text>
  <rect x="40" y="246" width="660" height="60" rx="8" class="p4s"/>
  <text x="60" y="270" class="tx">Cv2.AdaptiveThreshold(src, dst, 255, AdaptiveThresholdTypes.MeanC, ThresholdTypes.BinaryInv, <tspan class="tx-b">51</tspan>, <tspan class="tx-b">15</tspan>)</text>
  <text x="60" y="294" class="tx-m">blockSize 51 = 주변 51×51 의 평균을 기준으로 · C 15 = 그 평균에서 15 를 뺀 값을 임계값으로 (blockSize 는 홀수!)</text>
</svg>`;

  // 그림 4: 이진화 파이프라인
  const FIG_PIPE = `<svg viewBox="0 0 740 200" role="img" aria-label="컬러 입력에서 흑백, 이진화, 마스크 활용, 개수 세기로 이어지는 처리 흐름">
  ${ARROW('c07a4')}
  <rect x="14" y="60" width="110" height="60" rx="8" class="p1s"/><text x="69" y="86" text-anchor="middle" class="tx-b">입력</text><text x="69" y="106" text-anchor="middle" class="tx-m">컬러 / 흑백</text>
  <line x1="126" y1="90" x2="158" y2="90" class="ln" stroke-width="2" marker-end="url(#c07a4)"/>
  <rect x="160" y="60" width="120" height="60" rx="8" class="p2s"/><text x="220" y="86" text-anchor="middle" class="tx-b">Gray 변환</text><text x="220" y="106" text-anchor="middle" class="tx-m">BGR2GRAY (1채널)</text>
  <line x1="282" y1="90" x2="314" y2="90" class="ln" stroke-width="2" marker-end="url(#c07a4)"/>
  <rect x="316" y="46" width="130" height="88" rx="8" class="p3s"/><text x="381" y="72" text-anchor="middle" class="tx-b">이진화</text><text x="381" y="94" text-anchor="middle" class="tx-m">Threshold + Otsu</text><text x="381" y="114" text-anchor="middle" class="tx-m">또는 AdaptiveThreshold</text>
  <line x1="448" y1="90" x2="480" y2="90" class="ln" stroke-width="2" marker-end="url(#c07a4)"/>
  <rect x="482" y="20" width="120" height="54" rx="8" class="p4s"/><text x="542" y="42" text-anchor="middle" class="tx-b">마스크 활용</text><text x="542" y="62" text-anchor="middle" class="tx-m">BitwiseAnd · Mean</text>
  <rect x="482" y="106" width="120" height="54" rx="8" class="p4s"/><text x="542" y="128" text-anchor="middle" class="tx-b">개수 · 측정</text><text x="542" y="148" text-anchor="middle" class="tx-m">ConnectedComponents</text>
  <line x1="604" y1="47" x2="636" y2="47" class="ln" stroke-width="2" marker-end="url(#c07a4)"/>
  <line x1="604" y1="133" x2="636" y2="133" class="ln" stroke-width="2" marker-end="url(#c07a4)"/>
  <rect x="638" y="60" width="90" height="60" rx="8" class="p5s"/><text x="683" y="86" text-anchor="middle" class="tx-b">판정</text><text x="683" y="106" text-anchor="middle" class="tx-m">OK / NG</text>
  <text x="14" y="180" class="tx-m">이진화는 “보기 좋게” 만드는 단계가 아니라 <tspan class="tx-b">물체와 배경을 가르는 결정</tspan> 단계다 — 뒤의 모든 측정이 이 결과 위에서 이루어진다.</text>
</svg>`;

  // ---------------------------------------------------------------- 1교시 예제
  const EX_BASIC = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        Cv2.MinMaxLoc(img, out double mn, out double mx);
        Console.WriteLine($"원본 최소/최대 {mn}/{mx} 평균 {Cv2.Mean(img).Val0:F1}");
        foreach (int t in new[] { 60, 100, 150, 200 })
        {
            using var bin = new Mat();
            double ret = Cv2.Threshold(img, bin, t, 255, ThresholdTypes.Binary);
            int white = Cv2.CountNonZero(bin);
            Console.WriteLine($"임계값 {t} (반환 {ret}): 흰 픽셀 {white} ({100.0 * white / (bin.Rows * bin.Cols):F1}%)");
        }

        using var bin2 = new Mat();
        double otsu = Cv2.Threshold(img, bin2, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Console.WriteLine($"Otsu 임계값 = {otsu}");
        using var labels = new Mat();
        Console.WriteLine($"물체 수 {Cv2.ConnectedComponents(bin2, labels) - 1}");
        Cv2.ImShow("bin", bin2);
        Cv2.WaitKey(0);
    }
}`;

  const EX_TYPES = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 값 6개만 담은 아주 작은 영상으로 5가지 방식을 한눈에 비교
        using var ramp = new Mat(1, 6, MatType.CV_8UC1);
        byte[] vals = { 0, 50, 100, 150, 200, 255 };
        for (int i = 0; i < 6; i++) ramp.Set<byte>(0, i, vals[i]);

        ThresholdTypes[] types = { ThresholdTypes.Binary, ThresholdTypes.BinaryInv, ThresholdTypes.Trunc, ThresholdTypes.Tozero, ThresholdTypes.TozeroInv };
        string[] names = { "Binary", "BinaryInv", "Trunc", "Tozero", "TozeroInv" };
        Console.WriteLine("입력        0   50  100  150  200  255   (임계값 127, maxval 255)");
        for (int k = 0; k < types.Length; k++)
        {
            using var dst = new Mat();
            Cv2.Threshold(ramp, dst, 127, 255, types[k]);
            string line = $"{names[k],-10}";
            for (int i = 0; i < 6; i++) line += $"{dst.At<byte>(0, i),4} ";
            Console.WriteLine(line);
        }
    }
}`;

  const EX_OTSU = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        Console.WriteLine($"백라이트 영상 평균 {Cv2.Mean(img).Val0:F1} (배경이 밝고 부품이 어둡다)");

        using var wrong = new Mat();
        double t1 = Cv2.Threshold(img, wrong, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        using var bin = new Mat();
        double t2 = Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Console.WriteLine($"Otsu 임계값 Binary {t1} / BinaryInv {t2} (같은 값)");
        Console.WriteLine($"Binary 흰 픽셀 {Cv2.CountNonZero(wrong)} = 배경 / BinaryInv 흰 픽셀 {Cv2.CountNonZero(bin)} = 부품");
        double ratio = 100.0 * Cv2.CountNonZero(bin) / (bin.Rows * bin.Cols);
        Console.WriteLine($"부품이 차지하는 면적 비율 {ratio:F1}%");

        using var labels = new Mat();
        Console.WriteLine($"BinaryInv 로 센 물체 수 {Cv2.ConnectedComponents(bin, labels) - 1} (실제 13개 — 닿은 2쌍)");
        using var labels2 = new Mat();
        Console.WriteLine($"Binary 로 세면 {Cv2.ConnectedComponents(wrong, labels2) - 1} (배경 1 + 부품 속 구멍 10)");
        Cv2.ImShow("binary", bin);
        Cv2.WaitKey(0);
    }
}`;

  const EX_AREA = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        double t = Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);

        int total = bin.Rows * bin.Cols;
        int white = Cv2.CountNonZero(bin);
        Console.WriteLine($"Otsu {t} -> 부품 픽셀 {white} / 전체 {total} = {100.0 * white / total:F2}%");

        // 부품 한 개의 평균 면적 -> 지름 환산 (배율 0.1 mm/px)
        var cc = Cv2.ConnectedComponentsEx(bin);
        int n = 0;
        double sum = 0;
        foreach (var b in cc.Blobs)
        {
            if (b.Label == 0 || b.Area < 300) continue;
            n++;
            sum += b.Area;
        }
        double avg = sum / n;
        double d = 2 * Math.Sqrt(avg / Math.PI) * 0.1;
        Console.WriteLine($"부품 {n}개, 평균 면적 {avg:F0} px -> 등가 지름 {d:F2} mm");
        Console.WriteLine($"흰 픽셀 비율로 본 물체 1개당 면적 {white / (double)n:F0} px");
        Cv2.ImShow("bin", bin);
        Cv2.WaitKey(0);
    }
}`;

  // ---------------------------------------------------------------- 2교시 예제
  const EX_FAIL = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);
        Console.WriteLine($"평균 {Cv2.Mean(img).Val0:F1}");
        Console.WriteLine($"왼쪽 위 (40,40) = {img.At<byte>(40, 40)} / 오른쪽 아래 (600,440) = {img.At<byte>(440, 600)}");
        Console.WriteLine("같은 흰 종이인데 배경 밝기가 246 과 93 — 하나의 임계값으로는 가를 수 없다");

        using var otsu = new Mat();
        double t = Cv2.Threshold(img, otsu, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Console.WriteLine($"전역 Otsu 임계값 {t} -> 검출된 픽셀 {Cv2.CountNonZero(otsu)} (전체의 {100.0 * Cv2.CountNonZero(otsu) / (img.Rows * img.Cols):F1}%)");
        Console.WriteLine($"점(면적 150~400, 정사각형) 개수 = {CountDots(otsu)} 개 — 정답은 32 개");
        Cv2.ImShow("global otsu", otsu);
        Cv2.WaitKey(0);
    }

    // 검은 점(반지름 8 -> 면적 200 안팎, 17x17)만 세는 도우미
    static int CountDots(Mat bin)
    {
        var cc = Cv2.ConnectedComponentsEx(bin);
        int n = 0;
        foreach (var b in cc.Blobs)
        {
            if (b.Label == 0) continue;
            if (b.Area >= 150 && b.Area <= 400 && b.Width >= 12 && b.Width <= 22 && b.Height >= 12 && b.Height <= 22) n++;
        }
        return n;
    }
}`;

  const EX_ADAPT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);
        using var ad = new Mat();
        Cv2.AdaptiveThreshold(img, ad, 255, AdaptiveThresholdTypes.MeanC, ThresholdTypes.BinaryInv, 51, 15);
        Console.WriteLine($"Adaptive MeanC (block 51, C 15): 흰 픽셀 {Cv2.CountNonZero(ad)}, 점 {CountDots(ad)} 개");

        using var ag = new Mat();
        Cv2.AdaptiveThreshold(img, ag, 255, AdaptiveThresholdTypes.GaussianC, ThresholdTypes.BinaryInv, 51, 15);
        Console.WriteLine($"Adaptive GaussianC (block 51, C 15): 흰 픽셀 {Cv2.CountNonZero(ag)}, 점 {CountDots(ag)} 개");

        Cv2.ImShow("adaptive mean", ad);
        Cv2.ImShow("adaptive gaussian", ag);
        Cv2.WaitKey(0);
    }

    static int CountDots(Mat bin)
    {
        var cc = Cv2.ConnectedComponentsEx(bin);
        int n = 0;
        foreach (var b in cc.Blobs)
        {
            if (b.Label == 0) continue;
            if (b.Area >= 150 && b.Area <= 400 && b.Width >= 12 && b.Width <= 22 && b.Height >= 12 && b.Height <= 22) n++;
        }
        return n;
    }
}`;

  const EX_PARAM = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);
        foreach (int bs in new[] { 21, 51, 101 })
        {
            using var ad = new Mat();
            Cv2.AdaptiveThreshold(img, ad, 255, AdaptiveThresholdTypes.MeanC, ThresholdTypes.BinaryInv, bs, 15);
            Console.WriteLine($"blockSize {bs,3} C 15 : 흰 픽셀 {Cv2.CountNonZero(ad),6}");
        }
        foreach (int c in new[] { 5, 15, 25 })
        {
            using var ad = new Mat();
            Cv2.AdaptiveThreshold(img, ad, 255, AdaptiveThresholdTypes.MeanC, ThresholdTypes.BinaryInv, 51, c);
            Console.WriteLine($"blockSize  51 C {c,2} : 흰 픽셀 {Cv2.CountNonZero(ad),6}");
        }
        try
        {
            using var bad = new Mat();
            Cv2.AdaptiveThreshold(img, bad, 255, AdaptiveThresholdTypes.MeanC, ThresholdTypes.BinaryInv, 50, 15);
        }
        catch (OpenCVException)
        {
            Console.WriteLine("blockSize 50 (짝수) -> 오류! blockSize 는 3 이상의 홀수여야 한다");
        }
    }
}`;

  const EX_MASK = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        double t = Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);

        using var objOnly = new Mat();
        Cv2.BitwiseAnd(img, img, objOnly, bin);          // 마스크가 흰 곳(부품)만 남기기
        Console.WriteLine($"임계값 {t}, 부품 픽셀 {Cv2.CountNonZero(bin)}");
        Console.WriteLine($"부품 영역 평균 밝기 {Cv2.Mean(img, bin).Val0:F1}");
        using var inv = new Mat();
        Cv2.BitwiseNot(bin, inv);                        // 마스크 반전 = 배경
        Console.WriteLine($"배경 영역 평균 밝기 {Cv2.Mean(img, inv).Val0:F1}");

        var cc = Cv2.ConnectedComponentsEx(bin);
        int big = 0;
        foreach (var b in cc.Blobs) if (b.Label != 0 && b.Area >= 500) big++;
        Console.WriteLine($"면적 500 이상 덩어리 {big} 개 / 전체 성분 {cc.LabelCount - 1} 개");
        Cv2.ImShow("objects", objOnly);
        Cv2.WaitKey(0);
    }
}`;

  const EX_PIPE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var color = Cv2.ImRead("images/nuts_bolts_color.png", ImreadModes.Color);
        Console.WriteLine($"입력 채널 {color.Channels()}");

        // 컬러를 그대로 Otsu 에 넣으면 오류! 먼저 1채널로 바꾼다
        try
        {
            using var bad = new Mat();
            Cv2.Threshold(color, bad, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        }
        catch (OpenCVException)
        {
            Console.WriteLine("오류: THRESH_OTSU 는 src_type == CV_8UC1 이어야 한다 (지금은 CV_8UC3)");
        }

        using var gray = new Mat();
        Cv2.CvtColor(color, gray, ColorConversionCodes.BGR2GRAY);
        using var bin = new Mat();
        double t = Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Console.WriteLine($"Gray 로 바꾼 뒤 Otsu = {t}, 흰 픽셀 {Cv2.CountNonZero(bin)}");
        Console.WriteLine($"마스크 안 평균색 BGR = {Cv2.Mean(color, bin).Val0:F0}, {Cv2.Mean(color, bin).Val1:F0}, {Cv2.Mean(color, bin).Val2:F0}");

        var cc = Cv2.ConnectedComponentsEx(bin);
        int n = 0;
        foreach (var b in cc.Blobs) if (b.Label != 0 && b.Area >= 500) n++;
        Console.WriteLine($"면적 500 이상 덩어리 {n} 개");
        Console.WriteLine($"저장: {Cv2.ImWrite("out/binary.png", bin)} (📁 작업 폴더에서 내려받기)");
        Cv2.ImShow("binary", bin);
        Cv2.WaitKey(0);
    }
}`;

  // ---------------------------------------------------------------- 슬라이드용 짧은 코드
  const S_BASIC = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var b100 = new Mat();
        using var otsu = new Mat();
        Cv2.Threshold(img, b100, 100, 255, ThresholdTypes.Binary);
        double t = Cv2.Threshold(img, otsu, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);

        Console.WriteLine($"t=100 흰 픽셀 {Cv2.CountNonZero(b100)}");
        Console.WriteLine($"Otsu 가 고른 t = {t}, 흰 픽셀 {Cv2.CountNonZero(otsu)}");
        using var labels = new Mat();
        Console.WriteLine($"물체 수 {Cv2.ConnectedComponents(otsu, labels) - 1}");
        Cv2.ImShow("otsu", otsu);
        Cv2.WaitKey(0);
    }
}`;

  const S_TYPES = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var ramp = new Mat(1, 6, MatType.CV_8UC1);
        byte[] vals = { 0, 50, 100, 150, 200, 255 };
        for (int i = 0; i < 6; i++) ramp.Set<byte>(0, i, vals[i]);

        using var bin = new Mat();
        using var tr = new Mat();
        Cv2.Threshold(ramp, bin, 127, 255, ThresholdTypes.Binary);
        Cv2.Threshold(ramp, tr, 127, 255, ThresholdTypes.Trunc);
        for (int i = 0; i < 6; i++)
            Console.WriteLine($"{vals[i],3} -> Binary {bin.At<byte>(0, i),3} / Trunc {tr.At<byte>(0, i),3}");
    }
}`;

  const S_OTSU = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        double t = Cv2.Threshold(img, bin, 0, 255,
                                 ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Console.WriteLine($"Otsu 가 고른 임계값 {t}");
        Console.WriteLine($"부품 픽셀 {Cv2.CountNonZero(bin)} = 전체의 {100.0 * Cv2.CountNonZero(bin) / (bin.Rows * bin.Cols):F1}%");

        using var labels = new Mat();
        Console.WriteLine($"물체 수 {Cv2.ConnectedComponents(bin, labels) - 1} (실제 13개)");
        Cv2.ImShow("binary", bin);
        Cv2.WaitKey(0);
    }
}`;

  const S_FAIL = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);
        Console.WriteLine($"(40,40)={img.At<byte>(40, 40)} / (600,440)={img.At<byte>(440, 600)}");

        using var g = new Mat();
        double t = Cv2.Threshold(img, g, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        using var a = new Mat();
        Cv2.AdaptiveThreshold(img, a, 255, AdaptiveThresholdTypes.MeanC,
                              ThresholdTypes.BinaryInv, 51, 15);
        Console.WriteLine($"전역 Otsu t={t} 흰 픽셀 {Cv2.CountNonZero(g)}");
        Console.WriteLine($"적응형 흰 픽셀 {Cv2.CountNonZero(a)}");
        Cv2.ImShow("global", g);
        Cv2.ImShow("adaptive", a);
        Cv2.WaitKey(0);
    }
}`;

  const S_MASK = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);

        using var objOnly = new Mat();
        Cv2.BitwiseAnd(img, img, objOnly, bin);      // 부품만 남기기
        using var inv = new Mat();
        Cv2.BitwiseNot(bin, inv);                    // 배경 마스크
        Console.WriteLine($"부품 평균 {Cv2.Mean(img, bin).Val0:F1}");
        Console.WriteLine($"배경 평균 {Cv2.Mean(img, inv).Val0:F1}");
        Cv2.ImShow("objects", objOnly);
        Cv2.WaitKey(0);
    }
}`;

  const S_PIPE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var color = Cv2.ImRead("images/nuts_bolts_color.png");
        using var gray = new Mat();
        Cv2.CvtColor(color, gray, ColorConversionCodes.BGR2GRAY);   // ① 1채널로
        using var bin = new Mat();
        double t = Cv2.Threshold(gray, bin, 0, 255,                 // ② 이진화
                                 ThresholdTypes.Binary | ThresholdTypes.Otsu);

        var cc = Cv2.ConnectedComponentsEx(bin);                    // ③ 개수 세기
        int n = 0;
        foreach (var b in cc.Blobs) if (b.Label != 0 && b.Area >= 500) n++;
        Console.WriteLine($"Otsu {t}, 덩어리 {n} 개");
        Cv2.ImWrite("out/binary.png", bin);                         // ④ 저장
        Cv2.ImShow("binary", bin);
        Cv2.WaitKey(0);
    }
}`;

  // ---------------------------------------------------------------- 퀴즈
  const QUIZ1 = [
    { q: '<code>double t = Cv2.Threshold(img, bin, 100, 255, ThresholdTypes.Binary);</code> 에서 반환값 <code>t</code> 는?',
      options: ['이진화된 픽셀 수', '넘겨 준 임계값 100 (Otsu 가 아니면 그대로)', '평균 밝기', '항상 255'], answer: 1,
      explain: '<code>Cv2.Threshold</code> 는 <b>사용된 임계값</b>을 돌려줍니다. 직접 값을 준 경우에는 그 값이 그대로 나오고, <b>Otsu · Triangle 플래그를 결합하면 자동으로 계산된 값</b>이 나옵니다 — 그래서 Otsu 를 쓸 때는 반환값을 꼭 출력해 보세요.' },
    { q: '배경이 밝고 물체가 어두운 <b>백라이트</b> 영상에서 물체를 흰색으로 만들려면?',
      options: ['<code>ThresholdTypes.Binary</code>', '<code>ThresholdTypes.BinaryInv</code>', '<code>ThresholdTypes.Trunc</code>', '<code>ThresholdTypes.Tozero</code>'], answer: 1,
      explain: '<code>Binary</code> 는 <b>임계값보다 밝은</b> 픽셀을 255 로 만듭니다. 물체가 어두우므로 반대인 <code>BinaryInv</code> 를 써야 물체가 흰색(255)이 됩니다. 뒤의 <code>ConnectedComponents</code> · <code>FindContours</code> 는 모두 <b>흰색을 물체</b>로 봅니다.' },
    { q: 'Otsu 이진화를 쓸 때 임계값 인수에는 보통 무엇을 넣는가?',
      options: ['영상의 평균', '<code>0</code> (어차피 무시되고 자동 계산된다)', '<code>127</code>', '<code>255</code>'], answer: 1,
      explain: '<code>ThresholdTypes.Otsu</code> 를 결합하면 임계값 인수는 <b>무시</b>되고 히스토그램에서 자동으로 계산됩니다. 관례적으로 <code>0</code> 을 넣습니다. 계산된 값은 <b>반환값</b>으로 받으세요.' },
    { q: '<code>ThresholdTypes.Trunc</code> 를 t=127 로 적용하면 200 인 픽셀은?',
      options: ['255', '127', '0', '200 그대로'], answer: 1,
      explain: 'Trunc(truncate)는 <b>임계값보다 큰 값을 임계값으로 깎고</b> 작은 값은 그대로 둡니다: 200 → 127, 100 → 100. 이진(0/255) 영상이 아니라 <b>밝기 상한을 씌운</b> 영상이 나옵니다 — 하이라이트를 눌러 줄 때 씁니다.' },
    { q: '이진화 결과에서 물체가 차지하는 면적 비율을 구하려면?',
      options: ['<code>Cv2.Mean(bin).Val0</code>', '<code>Cv2.CountNonZero(bin) / (double)(bin.Rows * bin.Cols)</code>', '<code>Cv2.MinMaxLoc</code>', '<code>bin.Total()</code>'], answer: 1,
      explain: '<code>CountNonZero</code> 는 0 이 아닌(= 흰색 255) 픽셀 수를 셉니다. 전체 픽셀 수로 나누면 면적 비율입니다. (<code>Cv2.Mean(bin).Val0 / 255</code> 도 같은 값이 나오지만 뜻이 덜 분명합니다.)' }
  ];

  const QUIZ2 = [
    { q: '전역(global) 이진화가 실패하는 대표적인 상황은?',
      options: ['물체가 배경보다 밝을 때', '조명이 한쪽으로 기울어 배경 밝기가 영상 안에서 크게 다를 때', '물체가 여러 개일 때', '영상이 클 때'], answer: 1,
      explain: '<code>uneven_light.png</code> 처럼 배경이 한쪽은 246, 다른 쪽은 93 이면 <b>어떤 값 하나로도</b> 양쪽을 동시에 가를 수 없습니다. 한쪽 배경이 통째로 검게 잡히거나, 다른 쪽 글자가 사라집니다.' },
    { q: '<code>Cv2.AdaptiveThreshold</code> 의 <code>blockSize</code> 는?',
      options: ['결과 영상의 크기', '임계값을 계산할 <b>주변 영역의 한 변</b> — 3 이상의 <b>홀수</b>', '반복 횟수', '임계값'], answer: 1,
      explain: '각 픽셀마다 <b>주변 blockSize × blockSize</b> 의 평균(MeanC) 또는 가우시안 가중 평균(GaussianC)을 구해 <code>− C</code> 한 값을 그 픽셀의 임계값으로 씁니다. 중심 픽셀이 있어야 하므로 <b>홀수</b>여야 하고, 짝수를 주면 오류가 납니다.' },
    { q: '적응형 이진화에서 <code>C</code> 를 키우면?',
      options: ['검출 영역이 넓어진다', '주변 평균보다 <b>더 많이 어두워야</b> 검출되므로 결과가 깔끔해지고 검출량이 줄어든다', '블록 크기가 커진다', '임계값이 없어진다'], answer: 1,
      explain: '임계값 = (주변 평균) − C 이므로 C 가 크면 기준이 낮아져 <b>확실히 어두운 픽셀만</b> 남습니다. C 를 너무 키우면 연한 글자가 사라지고, 너무 작게 하면 배경 잡음이 점점이 남습니다.' },
    { q: '컬러 영상을 바로 <code>ThresholdTypes.Otsu</code> 로 이진화하면?',
      options: ['채널별로 알아서 처리된다', '<code>src_type == CV_8UC1</code> 조건 위반으로 <b>오류</b>가 난다', '자동으로 Gray 로 바뀐다', '결과가 4채널이 된다'], answer: 1,
      explain: 'Otsu 는 <b>1채널 히스토그램</b>에서 임계값을 찾는 방법이라 <code>CV_8UC1</code>(또는 CV_16UC1)만 받습니다. 오류 메시지에 <code>THRESH_OTSU mode: src_type == CV_8UC1</code> 이 보이면 <code>Cv2.CvtColor(..., BGR2GRAY)</code> 를 빠뜨린 것입니다.' },
    { q: '이진 마스크로 원본에서 <b>물체만</b> 남기려면?',
      options: ['<code>Cv2.BitwiseAnd(img, img, dst, bin)</code>', '<code>Cv2.Add(img, bin, dst)</code>', '<code>Cv2.BitwiseNot(bin, dst)</code>', '<code>Cv2.AddWeighted(img, 0.5, bin, 0.5, 0, dst)</code>'], answer: 0,
      explain: '같은 영상을 두 번 넘기고 <code>mask</code> 로 이진 영상을 주면 <b>마스크가 흰 픽셀만 복사</b>되고 나머지는 0 이 됩니다. 반대(배경만)를 원하면 <code>Cv2.BitwiseNot</code> 으로 마스크를 반전해서 넘기세요.' }
  ];

  CS_COURSE.addChapter({
    id: 'cs07', no: '07', title: '이진화 (Threshold)', subtitle: '물체와 배경을 가르는 결정 — 전역 · Otsu · 적응형',
    summary: '임계값 하나로 영상을 흑과 백으로 나누는 <b>이진화</b>를 배웁니다. <code>Cv2.Threshold</code> 의 반환값과 5가지 <code>ThresholdTypes</code>, 배경/물체 밝기에 따른 <code>Inv</code> 선택, 히스토그램에서 임계값을 자동으로 찾는 <b>Otsu</b>, 그리고 조명이 기울어진 영상을 살리는 <b>적응형 이진화</b>(<code>AdaptiveThreshold</code>)까지 다룹니다. 마지막에는 이진 마스크로 물체만 남기고 개수를 세어 저장하는 검사 파이프라인을 완성합니다.',
    goals: ['Cv2.Threshold 의 반환값과 ThresholdTypes 5가지를 구분해 쓸 수 있다', '배경 · 물체의 밝기를 보고 Binary / BinaryInv 를 고를 수 있다', 'Otsu 로 임계값을 자동 계산하고 그 값을 확인할 수 있다', '전역 이진화가 실패하는 경우를 설명하고 AdaptiveThreshold 로 해결할 수 있다', '이진 마스크로 물체만 남기고 개수를 세어 결과를 저장할 수 있다'],
    sections: [
      {
        id: 'cs07-1', title: '전역 이진화와 Otsu', minutes: 50,
        goals: ['임계값 · 이진화의 뜻을 히스토그램으로 설명할 수 있다', 'ThresholdTypes 5가지의 차이를 값으로 확인할 수 있다', 'Otsu 로 임계값을 자동 계산하고 면적 비율을 구할 수 있다'],
        flow: [['도입: 임계값이란', 8], ['ThresholdTypes 비교', 16], ['Otsu 와 면적 측정', 18], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: '이진화 = 물체와 배경을 가르는 결정' },
          { type: 'p', html: '06차시에서 히스토그램에 <b>봉우리가 두 개</b> 있으면 물체와 배경이 잘 갈린다고 했습니다. <b>이진화(Thresholding)</b> 는 그 사이에 선(임계값 · threshold)을 긋고 <b>모든 픽셀을 0 또는 255 둘 중 하나로</b> 만드는 일입니다. 개수 세기 · 면적 측정 · 윤곽선 · 모폴로지 등 뒤에 나오는 거의 모든 분석이 <b>이진 영상 위에서</b> 이루어지므로, 이진화는 머신비전에서 가장 중요한 한 줄입니다.' },
          { type: 'figure', html: FIG_THRESH, caption: '그림 1. 두 봉우리 사이 골짜기에 임계값을 두면 물체와 배경이 갈린다 (Otsu 는 이 위치를 자동으로 찾는다)' },
          { type: 'image', src: 'images/coins_parts.png', caption: 'images/coins_parts.png — 어두운 배경 위 밝은 원형 부품 12개 (지름 3종). 물체가 밝으므로 Binary 를 쓴다' },
          { type: 'code', title: '예제 1: 임계값을 바꿔 보고 Otsu 와 비교', code: EX_BASIC,
            desc: '임계값을 60 → 150 까지 올려도 흰 픽셀 수가 9.0% → 7.9% 로 조금만 줄어듭니다. 두 봉우리가 멀리 떨어져 있어 <b>그 사이 어디를 골라도 결과가 비슷</b>하기 때문입니다 — 좋은 영상의 특징입니다. 반면 200 에서는 부품 안쪽까지 검게 되어 0.5% 로 무너집니다. <code>Cv2.Threshold</code> 의 <b>반환값</b>은 사용된 임계값이고, <code>Otsu</code> 를 결합하면 자동 계산된 값(105)이 돌아옵니다.',
            expect: '원본 최소/최대 20/209 평균 45.3\n임계값 60 (반환 60): 흰 픽셀 27646 (9.0%)\n임계값 100 (반환 100): 흰 픽셀 26377 (8.6%)\n임계값 150 (반환 150): 흰 픽셀 24338 (7.9%)\n임계값 200 (반환 200): 흰 픽셀 1453 (0.5%)\nOtsu 임계값 = 105\n물체 수 12' },
          { type: 'h', text: 'ThresholdTypes 5가지' },
          { type: 'figure', html: FIG_TYPES, caption: '그림 2. 다섯 가지 방식의 입출력 그래프 — Binary · BinaryInv 만 0/255 의 "이진" 영상을 만든다' },
          { type: 'code', title: '예제 2: 값 6개로 5가지 방식 비교하기', code: EX_TYPES,
            desc: '1행 6열의 작은 Mat 을 만들어 대표값 6개에 각 방식을 적용했습니다. 표를 세로로 읽어 보세요: 입력 150 은 Binary 에서 255, BinaryInv 에서 0, Trunc 에서 127, Tozero 에서 150, TozeroInv 에서 0 입니다. <b>이진 영상이 필요하면 Binary 또는 BinaryInv</b>, 밝기 상한을 씌우려면 Trunc, 어두운 부분만 지우려면 Tozero 를 씁니다.',
            expect: '입력        0   50  100  150  200  255   (임계값 127, maxval 255)\nBinary       0    0    0  255  255  255\nBinaryInv  255  255  255    0    0    0\nTrunc        0   50  100  127  127  127\nTozero       0    0    0  150  200  255\nTozeroInv    0   50  100    0    0    0' },
          { type: 'table', head: ['ThresholdTypes', 'v &gt; t 일 때', 'v ≤ t 일 때', '쓰는 곳'], rows: [
            ['<code>Binary</code>', 'maxval (255)', '0', '<b>밝은 물체</b> 검출 (기본)'],
            ['<code>BinaryInv</code>', '0', 'maxval (255)', '<b>어두운 물체</b> 검출 (백라이트 · 글자)'],
            ['<code>Trunc</code>', 't 로 깎음', '그대로', '하이라이트 억제 (이진 아님)'],
            ['<code>Tozero</code>', '그대로', '0', '어두운 부분만 지우기'],
            ['<code>TozeroInv</code>', '0', '그대로', '밝은 부분만 지우기'],
            ['<code>| Otsu</code>', '— (플래그 결합)', '—', '임계값 자동 계산'],
            ['<code>| Triangle</code>', '— (플래그 결합)', '—', '봉우리가 하나일 때 자동 계산']
          ], caption: '표 1. 다섯 가지 방식 + 자동 임계값 플래그. <code>Binary | Otsu</code> 처럼 <b>|</b> 로 결합한다' },
          { type: 'callout', kind: 'warn', title: 'Inv 를 고르는 기준: 물체가 흰색이 되게', html: '뒤에 오는 <code>ConnectedComponents</code> · <code>FindContours</code> · 모폴로지는 모두 <b>흰색(255)을 물체</b>로 봅니다. 그러므로 규칙은 하나입니다 — <b>결과에서 물체가 흰색이 되도록</b> 고르세요.<ul><li>어두운 배경 + <b>밝은</b> 물체 (coins_parts) → <code>Binary</code></li><li>밝은 배경 + <b>어두운</b> 물체 (washers 백라이트, 흰 종이 위 글자) → <code>BinaryInv</code></li></ul>반대로 고르면 배경이 하나의 거대한 물체로 잡혀 개수가 1~2 로 나옵니다.' },
          { type: 'h', text: 'Otsu: 임계값을 자동으로 찾기' },
          { type: 'p', html: '조명이 조금씩 바뀌는 현장에서 임계값을 코드에 고정하면 오래 못 버팁니다. <b>Otsu 방법</b>은 히스토그램을 두 무리로 나눌 때 <b>두 무리 안의 분산 합이 가장 작아지는</b>(= 무리 사이 분산이 가장 커지는) 값을 찾아 줍니다 — 그림 1 의 골짜기입니다. 쓰는 법은 간단합니다: 임계값 인수에 <code>0</code> 을 넣고 <code>ThresholdTypes.Otsu</code> 를 <b>|</b> 로 결합하면, <b>반환값</b>으로 계산된 임계값이 나옵니다.' },
          { type: 'image', src: 'images/washers.png', caption: 'images/washers.png — 백라이트 실루엣 (와셔 6 · 너트 4 · 볼트 3 = 13개, 그중 2쌍이 서로 닿아 있다)' },
          { type: 'code', title: '예제 3: Otsu + BinaryInv 로 백라이트 영상 이진화', code: EX_OTSU,
            desc: 'Otsu 가 고른 임계값은 <b>125</b> 입니다(Binary 든 BinaryInv 든 임계값 계산은 같습니다). 흰 픽셀 수를 보면 차이가 분명합니다: Binary 는 260722(배경), BinaryInv 는 46478(부품). 개수가 <b>11</b> 인 이유는 서로 닿은 2쌍이 한 덩어리로 세어졌기 때문입니다(12차시에서 거리 변환 + watershed 로 분리). 흥미롭게도 Binary 로 세도 11 이 나오는데, 이때는 <b>배경 1개 + 부품 속 구멍 10개</b> 라는 완전히 다른 의미입니다.',
            expect: '백라이트 영상 평균 191.8 (배경이 밝고 부품이 어둡다)\nOtsu 임계값 Binary 125 / BinaryInv 125 (같은 값)\nBinary 흰 픽셀 260722 = 배경 / BinaryInv 흰 픽셀 46478 = 부품\n부품이 차지하는 면적 비율 15.1%\nBinaryInv 로 센 물체 수 11 (실제 13개 — 닿은 2쌍)\nBinary 로 세면 11 (배경 1 + 부품 속 구멍 10)' },
          { type: 'callout', kind: 'tip', title: 'Otsu 가 잘 되는 조건 · 안 되는 조건', html: '<ul><li><b>잘 됨</b>: 봉우리가 두 개고 골짜기가 뚜렷할 때 (백라이트, 대비 좋은 조명)</li><li><b>안 됨</b>: ① 물체가 아주 작아 봉우리 하나가 거의 없을 때 → <code>Triangle</code> 플래그나 고정값 ② 조명이 기울어졌을 때 → <b>적응형 이진화</b>(2교시) ③ 잡음이 많을 때 → 먼저 <code>Cv2.GaussianBlur</code>(08차시) 후 Otsu</li></ul>실무에서는 Otsu 로 얻은 값을 <b>로그로 남겨</b> 두고, 값이 평소와 크게 달라지면 조명 이상으로 보고 경고를 띄웁니다.' },
          { type: 'code', title: '예제 4: CountNonZero 로 면적 비율 · 지름 환산', code: EX_AREA,
            desc: '<code>Cv2.CountNonZero</code> 는 흰 픽셀 수, 즉 <b>물체의 총 면적(px)</b> 입니다. 전체 픽셀 수로 나누면 면적 비율이 되고, 개수로 나누면 부품 하나의 평균 면적이 됩니다. 원이라고 가정하면 등가 지름 = 2√(면적/π) 이고, 이 영상의 배율 0.1 mm/px 를 곱하면 <b>실제 치수(mm)</b> 가 나옵니다 — 부품 3종(Ø6.8 · Ø5.4 · Ø4.0 mm)의 평균이므로 5.2 mm 정도가 나옵니다. 크기별로 분류하는 방법은 12차시에서 다룹니다.',
            expect: 'Otsu 105 -> 부품 픽셀 26230 / 전체 307200 = 8.54%\n부품 12개, 평균 면적 2186 px -> 등가 지름 5.28 mm\n흰 픽셀 비율로 본 물체 1개당 면적 2186 px' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서 임계값 슬라이더 만들기', html: '이진화는 <b>값을 눈으로 맞춰 보는</b> 작업이 많아 슬라이더가 특히 유용합니다. <code>&lt;Slider Minimum="0" Maximum="255" Value="127"/&gt;</code> 의 <code>ValueChanged</code> 에서 <code>Cv2.Threshold(gray, bin, slider.Value, 255, ThresholdTypes.Binary)</code> → <code>Image.Source</code> 갱신을 하면 됩니다. 여기에 <b>Otsu 버튼</b>을 두어 자동값을 슬라이더에 넣어 주면 현장에서 쓰기 좋은 도구가 됩니다 (16차시 · <code>Ch16_ImageStudio</code>).' }
        ],
        practice: [
          {
            title: 'Otsu 임계값과 면적 비율 구하기', level: 1,
            desc: '<code>images/flange.png</code>(어두운 배경 위 밝은 금속 플랜지)를 Otsu 로 이진화하고 ① 임계값 ② 흰 픽셀 수 ③ 면적 비율(%) ④ <code>ConnectedComponents</code> 로 센 덩어리 수를 출력하세요. 물체가 배경보다 <b>밝으므로</b> 어떤 <code>ThresholdTypes</code> 를 쓸지 먼저 판단하세요.',
            hint: '<code>double t = Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);</code> · 비율은 <code>100.0 * Cv2.CountNonZero(bin) / (bin.Rows * bin.Cols)</code> · 플랜지는 한 덩어리이므로 덩어리 수 1 이 나오면 성공입니다(구멍은 배경 쪽으로 세어집니다).',
            expect: 'Otsu 임계값 104\n흰 픽셀 79407 / 전체 307200 = 25.85%\n덩어리 수 1',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        // TODO: Otsu 이진화를 하고 임계값을 출력하세요 (물체가 밝다 -> Binary? BinaryInv?)

        // TODO: 흰 픽셀 수와 면적 비율(%)을 출력하세요

        // TODO: Cv2.ConnectedComponents 로 덩어리 수를 출력하세요
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
        using var img = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        double t = Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Console.WriteLine($"Otsu 임계값 {t}");

        int white = Cv2.CountNonZero(bin);
        Console.WriteLine($"흰 픽셀 {white} / 전체 {bin.Rows * bin.Cols} = {100.0 * white / (bin.Rows * bin.Cols):F2}%");

        using var labels = new Mat();
        Console.WriteLine($"덩어리 수 {Cv2.ConnectedComponents(bin, labels) - 1}");
        Cv2.ImShow("binary", bin);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: 'ThresholdTypes 를 바꿔 결과를 예측하기', level: 2,
            desc: '<code>images/washers.png</code> 에 <b>다섯 가지</b> <code>ThresholdTypes</code> 를 임계값 125 로 적용하고, 각각의 <b>흰 픽셀 수(CountNonZero)와 평균 밝기</b>를 출력하세요. 출력 전에 각 값을 <b>먼저 예측해 적어 보고</b> 맞춰 보세요. 왜 <code>Trunc</code> 와 <code>Tozero</code> 는 흰 픽셀 수가 거의 같은지 설명해 보세요.',
            hint: '<code>ThresholdTypes[] types = { ThresholdTypes.Binary, ThresholdTypes.BinaryInv, ThresholdTypes.Trunc, ThresholdTypes.Tozero, ThresholdTypes.TozeroInv };</code> 를 <code>foreach</code> 로 돌리세요. <code>CountNonZero</code> 는 “0 이 아닌 픽셀 수”이므로 이진 영상이 아니어도 값이 나옵니다.',
            expect: 'Binary    : 0 아닌 픽셀 260722, 평균 216.4\nBinaryInv : 0 아닌 픽셀  46478, 평균  38.6\nTrunc     : 0 아닌 픽셀 307200, 평균 110.6\nTozero    : 0 아닌 픽셀 260722, 평균 187.3\nTozeroInv : 0 아닌 픽셀  46478, 평균   4.5',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        ThresholdTypes[] types = { ThresholdTypes.Binary, ThresholdTypes.BinaryInv, ThresholdTypes.Trunc, ThresholdTypes.Tozero, ThresholdTypes.TozeroInv };
        string[] names = { "Binary", "BinaryInv", "Trunc", "Tozero", "TozeroInv" };

        for (int k = 0; k < types.Length; k++)
        {
            using var dst = new Mat();
            // TODO: 임계값 125, maxval 255 로 이진화하고 0 아닌 픽셀 수와 평균을 출력하세요
            Console.WriteLine($"{names[k],-10}");
        }
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
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        ThresholdTypes[] types = { ThresholdTypes.Binary, ThresholdTypes.BinaryInv, ThresholdTypes.Trunc, ThresholdTypes.Tozero, ThresholdTypes.TozeroInv };
        string[] names = { "Binary", "BinaryInv", "Trunc", "Tozero", "TozeroInv" };

        for (int k = 0; k < types.Length; k++)
        {
            using var dst = new Mat();
            Cv2.Threshold(img, dst, 125, 255, types[k]);
            Console.WriteLine($"{names[k],-10}: 0 아닌 픽셀 {Cv2.CountNonZero(dst),6}, 평균 {Cv2.Mean(dst).Val0,5:F1}");
        }
        Cv2.ImShow("input", img);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '이진화 (1) 전역 이진화와 Otsu', subtitle: '물체와 배경을 가르는 한 줄', notes: '<p>06차시의 히스토그램 두 봉우리 그림을 떠올리게 하며 시작합니다. 💬 “봉우리 두 개 사이에 선을 그으면 무엇이 되나요?” — 물체/배경 분리. 오늘은 그 선을 손으로, 그리고 자동으로 긋습니다. (2분)</p>' },
          { layout: 'diagram', title: '임계값과 이진화', html: FIG_THRESH, caption: '골짜기에 선을 긋는다 → v > t 는 255, v ≤ t 는 0', notes: '<p>이진화가 “정보를 버리는” 연산이라는 점을 강조합니다: 256단계 → 2단계. 그래서 <b>어디에 선을 긋느냐</b>가 모든 것을 결정합니다. 뒤의 개수 세기 · 측정이 모두 이 결과 위에 올라간다고 예고. (5분)</p>' },
          { layout: 'image', title: '밝은 물체: coins_parts.png', src: 'images/coins_parts.png', caption: '어두운 배경 위 밝은 원형 부품 12개 → Binary', notes: '<p>💬 “이 영상에서 물체를 흰색으로 만들려면 Binary 일까요 BinaryInv 일까요?” — 물체가 밝으니 Binary. 이 판단 습관을 오늘 반복해서 훈련시킵니다. (3분)</p>' },
          { layout: 'code', title: '예제: 임계값 바꿔 보기 + Otsu', code: S_BASIC, points: ['<code>Cv2.Threshold</code> 의 <b>반환값 = 사용된 임계값</b>', 'Otsu 를 결합하면 임계값 인수(0)는 무시된다', '이 영상은 60~150 어디를 골라도 결과가 비슷', 'Otsu 가 고른 값 105 → 물체 12개'], notes: '<p>실행 후 값을 확인합니다. 학생들에게 임계값을 200 으로 바꿔 실행해 무너지는 것을 보여 주게 합니다(0.5%). 💬 “왜 60 과 150 의 결과가 비슷할까?” — 봉우리가 멀다. (7분)</p>' },
          { layout: 'diagram', title: 'ThresholdTypes 5가지', html: FIG_TYPES, caption: 'Binary · BinaryInv 만 0/255 이진 영상을 만든다', notes: '<p>다섯 그래프를 하나씩 손으로 짚습니다. Trunc/Tozero 는 “이진이 아니다”가 핵심. 💬 “하늘이 하얗게 날아간 사진을 눌러 주려면?” — Trunc. (5분)</p>' },
          { layout: 'code', title: '예제: 값 6개로 5가지 비교', code: S_TYPES, points: ['1행 6열 작은 Mat 으로 실험하면 이해가 빠르다', 'Binary: 150 → 255 · Trunc: 150 → 127', '<code>ramp.Set&lt;byte&gt;(0, i, v)</code> 로 값 넣기', '표를 세로로 읽으며 방식 비교'], notes: '<p>실행 결과 표를 함께 읽습니다. 본문 예제 2 에는 5가지가 모두 있으니 학생들에게 나머지 세 가지를 추가해 보라고 하면 좋습니다. (6분)</p>' },
          { layout: 'image', title: '어두운 물체: washers.png (백라이트)', src: 'images/washers.png', caption: '배경이 밝고 부품이 어둡다 → BinaryInv. 부품 13개 중 2쌍이 닿아 있다', notes: '<p>백라이트 조명 방식을 설명합니다(뒤에서 빛을 쏘아 실루엣만 본다 — 치수 측정에 최적). 💬 “여기서 Binary 를 쓰면 무엇이 흰색이 될까?” — 배경. (3분)</p>' },
          { layout: 'code', title: '예제: Otsu + BinaryInv', code: S_OTSU, points: ['임계값 인수 <code>0</code> + <code>| ThresholdTypes.Otsu</code>', '반환값 <b>125</b> = 자동 계산된 임계값', '부품 면적 46478 px = 전체의 15.1%', '개수 11 — 닿은 2쌍이 합쳐졌다 (12차시에서 해결)'], notes: '<p>Otsu 값을 로그로 남겨 두면 조명 이상을 감지할 수 있다는 실무 팁을 곁들입니다. 개수 11 의 이유를 학생들이 결과 창 이미지에서 직접 찾게 합니다(왼쪽 위 두 와셔). (8분)</p>' },
          { layout: 'table', title: '어떤 Type 을 쓸까', head: ['상황', '고르기', '예'], rows: [
            ['어두운 배경 + 밝은 물체', '<code>Binary</code>', 'coins_parts · flange'],
            ['밝은 배경 + 어두운 물체', '<code>BinaryInv</code>', 'washers(백라이트) · 흰 종이 위 글자'],
            ['임계값을 모르겠다', '<code>| Otsu</code> 결합', '반환값을 출력해 확인'],
            ['밝은 쪽만 눌러 주기', '<code>Trunc</code>', '하이라이트 억제'],
            ['조명이 기울었다', '<code>AdaptiveThreshold</code>', '다음 교시']
          ], notes: '<p>규칙 한 줄로 정리: <b>“결과에서 물체가 흰색이 되게”</b>. 이것만 기억하면 Inv 선택을 틀리지 않습니다. (3분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: 'Otsu 를 쓸 때 임계값 인수에는 보통 무엇을 넣는가?', options: ['영상의 평균', '0 (무시되고 자동 계산)', '127', '255'], answer: 1, explain: 'Otsu 플래그를 결합하면 임계값 인수는 무시됩니다. 계산된 값은 <b>반환값</b>으로 받으세요.', notes: '<p>정답 2번. “그럼 계산된 값은 어디서 보나?” 로 이어 반환값의 중요성을 다시 강조합니다.</p>' },
          { layout: 'practice', title: '실습: flange.png 의 면적 비율', desc: '<p><code>images/flange.png</code> 를 Otsu 로 이진화하고 임계값 · 흰 픽셀 수 · 면적 비율 · 덩어리 수를 출력하세요.</p><ul><li>물체가 밝다 → 어떤 Type?</li><li>비율 = <code>CountNonZero / (Rows × Cols) × 100</code></li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        // TODO: Otsu 이진화 + 임계값 · 면적 비율 · 덩어리 수 출력
        Cv2.ImShow("input", img);
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        double t = Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        int white = Cv2.CountNonZero(bin);
        using var labels = new Mat();
        Console.WriteLine($"Otsu {t}, 비율 {100.0 * white / (bin.Rows * bin.Cols):F2}%, 덩어리 {Cv2.ConnectedComponents(bin, labels) - 1}");
        Cv2.ImShow("binary", bin);
        Cv2.WaitKey(0);
    }
}`, notes: '<p>정답: Otsu 104, 비율 25.85%, 덩어리 1. BinaryInv 를 쓴 학생은 비율이 약 74% 로 나오므로 바로 알 수 있습니다 — 좋은 자기 점검 지표입니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['이진화 = 임계값으로 <b>0 또는 255</b> 로 나누는 결정 (뒤의 모든 분석의 토대)', '<code>Cv2.Threshold</code> 의 <b>반환값 = 사용된 임계값</b>', '<b>물체가 흰색이 되도록</b> Binary / BinaryInv 를 고른다', '<code>Trunc · Tozero · TozeroInv</code> 는 이진 영상이 아니다', '<code>| ThresholdTypes.Otsu</code> = 히스토그램 골짜기 자동 탐색 (임계값 인수는 0)', '<code>Cv2.CountNonZero</code> = 물체 면적(px) → 비율 · 지름 환산', '다음 교시: 조명이 기울면 전역 이진화가 <b>실패</b>한다 → 적응형 이진화'], notes: '<p>여섯 줄을 읽고 다음 교시를 예고합니다: “한 장 안에서 배경 밝기가 246 과 93 이면 어떻게 할까?” 실제 영상을 잠깐 띄워 궁금증을 남깁니다. (2분)</p>' }
        ]
      },
      {
        id: 'cs07-2', title: '적응형 이진화와 마스크 활용', minutes: 50,
        goals: ['전역 이진화가 실패하는 상황을 설명하고 AdaptiveThreshold 로 해결할 수 있다', 'blockSize · C 의 효과를 예측할 수 있다', '이진 마스크로 물체만 남기고 개수를 세어 결과를 저장할 수 있다'],
        flow: [['도입: 전역 이진화의 실패', 8], ['적응형 이진화 · 매개변수', 17], ['마스크 활용 · 파이프라인', 17], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: '전역 임계값 하나로는 안 되는 영상' },
          { type: 'p', html: '지금까지는 영상 전체에 <b>하나의 임계값</b>을 썼습니다(전역 · global). 그런데 조명이 한쪽으로 기울면 <b>같은 흰 종이가 한쪽에서는 246, 다른 쪽에서는 93</b> 으로 찍힙니다. 이때 어떤 값 하나를 골라도 한쪽은 반드시 틀립니다 — 밝은 쪽 기준으로 잡으면 어두운 쪽 배경이 통째로 물체가 되고, 어두운 쪽 기준으로 잡으면 밝은 쪽 글자가 사라집니다.' },
          { type: 'image', src: 'images/uneven_light.png', caption: 'images/uneven_light.png — 왼쪽 위가 밝고 오른쪽 아래가 어두운 강한 조명 기울기. 글자 3줄 + 검은 점 32개 (4행 × 8열)' },
          { type: 'code', title: '예제 1: 전역 Otsu 의 실패를 숫자로 확인', code: EX_FAIL,
            desc: 'Otsu 가 고른 162 는 <b>밝은 쪽과 어두운 쪽 배경의 중간</b>입니다. 그 결과 오른쪽 아래 어두운 영역 전체가 "물체"로 잡혀 검출 픽셀이 <b>147364 개(48%)</b> 나 되고, 점 개수는 32 가 아니라 <b>12</b> 밖에 세어지지 않습니다(나머지는 거대한 덩어리에 흡수). 결과 창의 이진 영상을 보면 오른쪽 아래가 통째로 하얗게 된 것이 한눈에 보입니다.',
            expect: '평균 164.3\n왼쪽 위 (40,40) = 246 / 오른쪽 아래 (600,440) = 93\n같은 흰 종이인데 배경 밝기가 246 과 93 — 하나의 임계값으로는 가를 수 없다\n전역 Otsu 임계값 162 -> 검출된 픽셀 147364 (전체의 48.0%)\n점(면적 150~400, 정사각형) 개수 = 12 개 — 정답은 32 개' },
          { type: 'h', text: '적응형 이진화: 픽셀마다 다른 임계값' },
          { type: 'p', html: '해결책은 간단합니다 — <b>임계값을 픽셀마다 다르게</b> 두는 것입니다. 각 픽셀의 <b>주변 blockSize × blockSize</b> 영역의 평균(또는 가우시안 가중 평균)을 구하고, 거기서 <b>C</b> 를 뺀 값을 그 픽셀의 임계값으로 씁니다. 배경이 어두운 곳에서는 기준선도 함께 내려가므로 조명 기울기가 <b>저절로 상쇄</b>됩니다.' },
          { type: 'figure', html: FIG_ADAPT, caption: '그림 3. 전역 임계값은 어두운 쪽에서 실패하지만, 주변 평균 − C 를 쓰는 적응형은 배경을 따라 내려간다' },
          { type: 'code', title: '예제 2: AdaptiveThreshold 로 점 32개 모두 찾기', code: EX_ADAPT,
            desc: '<code>blockSize 51, C 15</code> 로 <b>점 32개(4행 × 8열)를 정확히</b> 찾았습니다 — 정답과 일치합니다. <code>MeanC</code> 는 주변의 <b>단순 평균</b>, <code>GaussianC</code> 는 중심에 가중치를 더 주는 <b>가우시안 가중 평균</b>을 씁니다. GaussianC 가 보통 조금 더 부드럽고 잡음에 강하지만, 이 영상처럼 잡음이 적으면 결과는 거의 같습니다. 결과 창에서 오른쪽 아래 글자까지 살아난 것을 확인하세요.',
            expect: 'Adaptive MeanC (block 51, C 15): 흰 픽셀 23135, 점 32 개\nAdaptive GaussianC (block 51, C 15): 흰 픽셀 20614, 점 32 개' },
          { type: 'code', title: '예제 3: blockSize 와 C 의 효과 (+ 짝수 blockSize 오류)', code: EX_PARAM,
            desc: '<b>blockSize</b> 는 "배경으로 볼 범위"입니다 — 너무 작으면(21) 글자 획 내부까지 배경으로 보아 획이 속이 비고, 너무 크면(101) 조명 변화를 못 따라갑니다. 대략 <b>찾으려는 물체(글자 · 점)보다 2~3배 큰 홀수</b>가 좋습니다. <b>C</b> 는 "주변 평균보다 얼마나 더 어두워야 물체로 볼지"입니다 — 키우면 깔끔해지지만 연한 글자가 사라지고, 줄이면 배경 잡음이 점점이 남습니다. 마지막의 <code>blockSize 50</code> 은 짝수라서 <b>오류</b>입니다.',
            expect: 'blockSize  21 C 15 : 흰 픽셀  20323\nblockSize  51 C 15 : 흰 픽셀  23135\nblockSize 101 C 15 : 흰 픽셀  24266\nblockSize  51 C  5 : 흰 픽셀  25349\nblockSize  51 C 15 : 흰 픽셀  23135\nblockSize  51 C 25 : 흰 픽셀  21489\nblockSize 50 (짝수) -> 오류! blockSize 는 3 이상의 홀수여야 한다' },
          { type: 'table', head: ['매개변수', '작게 하면', '크게 하면', '시작값'], rows: [
            ['<code>blockSize</code>', '글자 획 속이 빈다 (배경 범위가 좁음)', '조명 변화를 못 따라간다 (전역에 가까워짐)', '물체 크기의 2~3배 <b>홀수</b> (예: 51)'],
            ['<code>C</code>', '배경 잡음이 점점이 남는다', '연한 물체가 사라진다', '<b>5~20</b> (예: 15)'],
            ['<code>MeanC</code> / <code>GaussianC</code>', '—', '—', '잡음 있으면 <b>GaussianC</b>']
          ], caption: '표 2. 적응형 이진화 매개변수 조정 가이드 — 두 값을 번갈아 조금씩 바꾸며 눈으로 맞춘다' },
          { type: 'callout', kind: 'warn', title: '적응형 이진화의 주의점', html: '<ul><li><b>blockSize 는 3 이상의 홀수</b> (짝수면 오류). 중심 픽셀이 있어야 하기 때문입니다.</li><li><b>1채널만</b> 받습니다 — 컬러는 먼저 <code>BGR2GRAY</code>.</li><li><b>넓고 평평한 영역</b>(예: 큰 부품의 내부)은 주변 평균과 값이 비슷해 <b>속이 비어</b> 보입니다. 큰 물체의 실루엣을 얻는 데는 적응형이 오히려 불리합니다 — 그럴 때는 전역 Otsu 나 조명 보정(배경 나누기)을 쓰세요.</li><li>적응형은 <b>얇은 글자 · 작은 점 · 에지</b>를 뽑는 데 강합니다 (OCR · 바코드 전처리).</li></ul>' },
          { type: 'h', text: '이진 마스크 활용하기' },
          { type: 'code', title: '예제 4: BitwiseAnd 로 물체만 남기기 · 마스크 반전', code: EX_MASK,
            desc: '이진 영상은 그 자체로 <b>마스크</b>입니다. <code>Cv2.BitwiseAnd(img, img, dst, bin)</code> 으로 부품만 남기고, <code>Cv2.BitwiseNot</code> 으로 반전하면 배경만 남습니다. <code>Cv2.Mean(img, mask)</code> 로 <b>영역별 평균 밝기</b>를 재면 부품 29.8 / 배경 220.7 — 이진화가 제대로 되었는지 <b>숫자로 검증</b>하는 좋은 방법입니다. 두 값이 비슷하게 나오면 임계값이 잘못된 것입니다.',
            expect: '임계값 125, 부품 픽셀 46478\n부품 영역 평균 밝기 29.8\n배경 영역 평균 밝기 220.7\n면적 500 이상 덩어리 11 개 / 전체 성분 11 개' },
          { type: 'h', text: '이진화 → 개수 세기 → 저장: 전체 파이프라인' },
          { type: 'figure', html: FIG_PIPE, caption: '그림 4. 컬러 입력 → Gray → 이진화 → 마스크 활용 / 개수 세기 → 판정. 이 흐름이 검사 프로그램의 기본 골격' },
          { type: 'code', title: '예제 5: 컬러 입력부터 저장까지 (흔한 오류 포함)', code: EX_PIPE,
            desc: '컬러 Mat 을 그대로 Otsu 에 넣으면 <b>오류</b>가 납니다: <code>THRESH_OTSU mode: src_type == CV_8UC1</code>. 이 메시지를 만나면 <code>Cv2.CvtColor(..., BGR2GRAY)</code> 를 빠뜨린 것입니다. 정면 조명 컬러 영상은 그림자 때문에 백라이트보다 이진화가 어려워 Otsu 가 137 을 고르고 덩어리가 <b>9 개</b>로 나옵니다(실제 13개) — 05차시의 <b>HSV 색 분리</b>나 09차시의 <b>모폴로지</b>로 개선할 수 있습니다. 마지막 줄의 <code>Cv2.ImWrite("out/binary.png", bin)</code> 로 저장한 파일은 왼쪽 <b>📁 작업 폴더</b>에서 내려받을 수 있습니다.',
            expect: '입력 채널 3\n오류: THRESH_OTSU 는 src_type == CV_8UC1 이어야 한다 (지금은 CV_8UC3)\nGray 로 바꾼 뒤 Otsu = 137, 흰 픽셀 30052\n마스크 안 평균색 BGR = 154, 172, 180\n면적 500 이상 덩어리 9 개\n저장: True (📁 작업 폴더에서 내려받기)' },
          { type: 'callout', kind: 'tip', title: '이진화 결과를 의심하는 습관', html: '이진화는 뒤의 모든 단계를 좌우하므로 <b>항상 검증</b>하세요.<ul><li><code>Cv2.CountNonZero</code> 비율이 상식적인가? (부품이 화면의 5~30% 정도)</li><li><code>Cv2.Mean(img, mask)</code> 와 <code>Cv2.Mean(img, inv)</code> 의 차이가 충분히 큰가?</li><li>Otsu 반환값이 평소와 비슷한가? (조명 이상 감지)</li><li>덩어리 개수가 예상과 맞는가? 너무 많으면 잡음 → 블러(08차시) · 모폴로지(09차시)</li></ul>' },
          { type: 'callout', kind: 'wpf', title: '적응형 이진화 화면 만들기', html: 'WPF 에서는 <b>ComboBox</b>(전역 Otsu / MeanC / GaussianC) + <b>Slider 2개</b>(blockSize 는 <code>3 + 2×n</code> 으로 <b>홀수만</b> 나오게, C 는 0~40)를 두고 <code>Image</code> 두 개(원본 · 결과)를 나란히 배치하면 학생들이 값을 감으로 익히기 좋은 도구가 됩니다. blockSize 슬라이더 값을 홀수로 바꾸는 한 줄을 잊지 마세요: <code>int bs = ((int)slider.Value) | 1;</code> — 16차시(<code>Ch16_ImageStudio</code>)에서 만듭니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '오개념 지도 · 평가 루브릭', html: '<ul><li>수업 전 준비: 예제 1(전역 실패)과 예제 2(적응형 성공)의 <b>결과 이미지를 나란히</b> 띄워 두면 설명이 3분으로 줄어듭니다.</li><li>오개념 ①: <b>“적응형이 항상 낫다”</b> → 큰 부품의 실루엣은 속이 비어 실패한다는 것을 <code>washers.png</code> 에 적응형을 적용해 보여 주면 확실합니다.</li><li>오개념 ②: <b>blockSize 를 짝수로</b> → 오류 메시지를 미리 보여 줍니다(예제 3).</li><li>오개념 ③: <b>“이진화 결과는 눈으로만 확인”</b> → CountNonZero · Mean(mask) 로 숫자 검증하는 습관을 강조.</li><li>평가 루브릭(5점): ① 물체가 흰색이 되게 Type 선택(1) ② Otsu 반환값 출력(1) ③ 전역 실패를 설명(1) ④ 적응형으로 점 32개 검출(1) ⑤ 마스크 활용 · 저장(1).</li><li>💬 마무리 발문: “점 32개는 찾았지만 글자 획이 끊어져 보입니다. 어떻게 메울까요?” → 09차시 모폴로지(닫기)로 연결.</li></ul>' }
        ],
        practice: [
          {
            title: '적응형 이진화로 점 32개 찾기', level: 2,
            desc: '<code>images/uneven_light.png</code> 에서 <b>검은 점 32개</b>를 모두 찾아 개수를 출력하세요. <code>AdaptiveThreshold(MeanC, BinaryInv, blockSize 51, C 15)</code> 로 이진화한 뒤, <code>ConnectedComponentsEx</code> 의 덩어리 중 <b>면적 150~400 이고 폭 · 높이가 12~22</b> 인 것만 세면 글자를 걸러 낼 수 있습니다. 찾은 점의 중심을 원본에 표시해 보세요.',
            hint: '점은 반지름 8(면적 200 안팎, 17×17)이고 글자는 폭이나 높이가 24~32 라서 크기 조건으로 구분됩니다. 개수가 35~36 으로 나오면 조건이 느슨한 것이고, 13 으로 나오면 전역 이진화를 쓴 것입니다.',
            expect: '흰 픽셀 23135\n점 32 개 (첫 점 중심 (70, 250))',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        // TODO: AdaptiveThreshold (MeanC, BinaryInv, blockSize 51, C 15) 로 이진화하세요
        Cv2.AdaptiveThreshold(img, bin, 255, AdaptiveThresholdTypes.MeanC, ThresholdTypes.BinaryInv, 51, 15);
        Console.WriteLine($"흰 픽셀 {Cv2.CountNonZero(bin)}");

        var cc = Cv2.ConnectedComponentsEx(bin);
        int n = 0;
        // TODO: 면적 150~400, 폭 · 높이 12~22 인 덩어리만 세고 첫 점의 중심을 출력하세요

        Console.WriteLine($"점 {n} 개");
        Cv2.ImShow("adaptive", bin);
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
        using var bin = new Mat();
        Cv2.AdaptiveThreshold(img, bin, 255, AdaptiveThresholdTypes.MeanC, ThresholdTypes.BinaryInv, 51, 15);
        Console.WriteLine($"흰 픽셀 {Cv2.CountNonZero(bin)}");

        using var view = new Mat();
        Cv2.CvtColor(img, view, ColorConversionCodes.GRAY2BGR);
        var cc = Cv2.ConnectedComponentsEx(bin);
        int n = 0;
        int firstX = 0, firstY = 0;
        foreach (var b in cc.Blobs)
        {
            if (b.Label == 0) continue;
            if (b.Area < 150 || b.Area > 400) continue;
            if (b.Width < 12 || b.Width > 22 || b.Height < 12 || b.Height > 22) continue;
            n++;
            if (n == 1) { firstX = (int)b.Centroid.X; firstY = (int)b.Centroid.Y; }
            Cv2.Circle(view, new Point((int)b.Centroid.X, (int)b.Centroid.Y), 14, new Scalar(0, 0, 255), 2);
        }
        Console.WriteLine($"점 {n} 개 (첫 점 중심 ({firstX}, {firstY}))");
        Cv2.ImShow("result", view);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '이진화 파이프라인 완성하고 저장하기', level: 2,
            desc: '<code>images/nuts_bolts_color.png</code>(컬러)를 입력으로 ① Gray 변환 ② Otsu 이진화 ③ <code>BitwiseAnd</code> 로 부품만 남기기 ④ 면적 500 이상 덩어리 수 세기 ⑤ <code>Cv2.ImWrite("out/parts.png", ...)</code> 로 저장까지 하는 프로그램을 완성하세요. 저장한 파일은 왼쪽 <b>📁 작업 폴더</b>에서 확인할 수 있습니다.',
            hint: '컬러를 바로 Threshold(Otsu) 에 넣으면 <code>src_type == CV_8UC1</code> 오류가 납니다 — <code>Cv2.CvtColor(color, gray, ColorConversionCodes.BGR2GRAY)</code> 가 먼저입니다. 마스크로 남긴 컬러 영상을 저장하려면 <code>Cv2.BitwiseAnd(color, color, only, bin)</code> 의 결과를 쓰세요.',
            expect: 'Otsu 임계값 137\n부품 픽셀 30052 (9.78%)\n덩어리 9 개\n부품 평균색 BGR = 154, 172, 180\n저장 완료: True',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var color = Cv2.ImRead("images/nuts_bolts_color.png", ImreadModes.Color);
        using var gray = new Mat();
        // TODO: ① BGR2GRAY

        using var bin = new Mat();
        // TODO: ② Otsu 이진화 (물체가 배경보다 밝다) + 임계값 출력

        using var only = new Mat();
        // TODO: ③ BitwiseAnd 로 부품만 남기기

        // TODO: ④ ConnectedComponentsEx 로 면적 500 이상 덩어리 수 출력

        // TODO: ⑤ Cv2.ImWrite("out/parts.png", only) 로 저장
        Cv2.ImShow("input", color);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var color = Cv2.ImRead("images/nuts_bolts_color.png", ImreadModes.Color);
        using var gray = new Mat();
        Cv2.CvtColor(color, gray, ColorConversionCodes.BGR2GRAY);

        using var bin = new Mat();
        double t = Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Console.WriteLine($"Otsu 임계값 {t}");
        int white = Cv2.CountNonZero(bin);
        Console.WriteLine($"부품 픽셀 {white} ({100.0 * white / (bin.Rows * bin.Cols):F2}%)");

        using var only = new Mat();
        Cv2.BitwiseAnd(color, color, only, bin);

        var cc = Cv2.ConnectedComponentsEx(bin);
        int n = 0;
        foreach (var b in cc.Blobs) if (b.Label != 0 && b.Area >= 500) n++;
        Console.WriteLine($"덩어리 {n} 개");
        Console.WriteLine($"부품 평균색 BGR = {Cv2.Mean(color, bin).Val0:F0}, {Cv2.Mean(color, bin).Val1:F0}, {Cv2.Mean(color, bin).Val2:F0}");
        Console.WriteLine($"저장 완료: {Cv2.ImWrite("out/parts.png", only)}");
        Cv2.ImShow("parts", only);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '이진화 (2) 적응형 이진화와 마스크 활용', subtitle: '조명이 기울어도 되는 이진화', notes: '<p>1교시 마지막 질문을 다시 꺼냅니다: “한 장 안에서 배경이 246 과 93 이면?” 오늘의 답: 픽셀마다 다른 임계값. (2분)</p>' },
          { layout: 'image', title: '전역 이진화가 실패하는 영상', src: 'images/uneven_light.png', caption: '왼쪽 위 밝고 오른쪽 아래 어둡다 · 글자 3줄 + 검은 점 32개', notes: '<p>💬 “이 영상에서 임계값 하나를 고른다면 몇으로 하겠습니까?” 학생 답을 두세 개 받아 칠판에 적고, 어느 값을 골라도 한쪽이 망가진다는 것을 예제 1 로 확인합니다. (4분)</p>' },
          { layout: 'code', title: '예제: 전역 Otsu 의 실패 vs 적응형', code: S_FAIL, points: ['배경 밝기 246 vs 93 — 한 값으로 불가능', '전역 Otsu t=162 → 48% 가 “물체”로 잡힘', '적응형은 흰 픽셀 23135 (7.5%)', '두 결과 이미지를 꼭 비교해 보기'], notes: '<p>결과 창의 두 이미지가 이 교시의 핵심 체험입니다. 전역 결과의 오른쪽 아래가 통째로 하얗게 된 것을 손으로 가리켜 주세요. (7분)</p>' },
          { layout: 'diagram', title: '적응형 이진화의 원리', html: FIG_ADAPT, caption: '임계값 = (주변 blockSize×blockSize 평균) − C → 배경을 따라 내려간다', notes: '<p>프로파일 그림으로 “기준선이 배경을 따라간다”를 설명합니다. blockSize 와 C 의 역할을 그림 위에서 짚어 줍니다. 💬 “C 를 0 으로 하면 무슨 일이 생길까?” — 평균보다 조금만 어두워도 물체 → 잡음이 점점이. (6분)</p>' },
          { layout: 'code', title: '예제: AdaptiveThreshold 로 점 32개', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);
        using var ad = new Mat();
        Cv2.AdaptiveThreshold(img, ad, 255, AdaptiveThresholdTypes.MeanC,
                              ThresholdTypes.BinaryInv, 51, 15);

        var cc = Cv2.ConnectedComponentsEx(ad);
        int n = 0;
        foreach (var b in cc.Blobs)
        {
            if (b.Label == 0) continue;
            if (b.Area >= 150 && b.Area <= 400 && b.Width >= 12 && b.Width <= 22) n++;
        }
        Console.WriteLine($"흰 픽셀 {Cv2.CountNonZero(ad)}, 점 {n} 개");
        Cv2.ImShow("adaptive", ad);
        Cv2.WaitKey(0);
    }
}`, points: ['<code>MeanC</code> = 주변 단순 평균 · <code>GaussianC</code> = 가중 평균', 'blockSize <b>51 (홀수!)</b>, C 15', '크기 조건으로 글자를 걸러 점만 세기', '결과 <b>32 개</b> = 정답 (4행 × 8열)'], notes: '<p>정답과 일치하는 순간이 학생들에게 가장 큰 성취감을 줍니다. 크기 조건(면적 · 폭)이 왜 필요한지 글자 블롭의 크기와 비교해 설명합니다. (8분)</p>' },
          { layout: 'table', title: 'blockSize 와 C 조정 가이드', head: ['매개변수', '작게', '크게', '시작값'], rows: [
            ['<code>blockSize</code>', '글자 획 속이 빈다', '전역에 가까워진다', '물체의 2~3배 <b>홀수</b> (51)'],
            ['<code>C</code>', '배경 잡음이 남는다', '연한 물체가 사라진다', '5~20 (15)'],
            ['방식', '<code>MeanC</code> 단순', '<code>GaussianC</code> 부드럽다', '잡음 있으면 Gaussian']
          ], lead: '두 값을 번갈아 조금씩 바꾸며 눈으로 맞춘다', notes: '<p>예제 3 의 숫자(흰 픽셀 수)를 함께 보며 표를 확인합니다: C 5 → 30512, C 25 → 18410. 짝수 blockSize 오류도 언급. (5분)</p>' },
          { layout: 'bullets', title: '적응형이 오히려 불리한 경우', lead: '“적응형이 항상 낫다”는 오해', bullets: [
            '<b>넓고 평평한 영역</b>(큰 부품 내부)은 주변 평균과 비슷해 <b>속이 빈다</b>',
            '큰 물체의 <b>실루엣 · 면적 측정</b>에는 전역 Otsu 가 유리 (백라이트 영상)',
            '적응형이 강한 곳: <b>얇은 글자 · 작은 점 · 저대비 에지</b> (OCR · 바코드 전처리)',
            ['조명 불균일의 다른 해법', ['배경 추정 후 나누기(flat-field)', 'top-hat / black-hat 모폴로지 (09차시)']]
          ], notes: '<p>washers.png 에 적응형을 적용해 속이 빈 결과를 시연하면 오개념이 즉시 교정됩니다. 시간이 없으면 말로만 설명하고 숙제로 냅니다. (5분)</p>' },
          { layout: 'code', title: '예제: 마스크로 물체만 남기기', code: S_MASK, points: ['이진 영상 = 그대로 <b>마스크</b>', '<code>BitwiseAnd(img, img, dst, bin)</code> → 부품만', '<code>BitwiseNot(bin, inv)</code> → 배경 마스크', '<code>Mean(img, mask)</code> 로 <b>숫자 검증</b> (29.8 vs 220.7)'], notes: '<p>“이진화가 잘 됐는지 눈이 아니라 숫자로 확인한다”는 실무 습관을 심어 줍니다. 두 평균이 비슷하면 임계값이 잘못된 것. (6분)</p>' },
          { layout: 'diagram', title: '검사 파이프라인', html: FIG_PIPE, caption: '컬러 → Gray → 이진화 → 마스크 / 개수 → 판정', notes: '<p>지금까지 배운 것(05 색 변환, 06 히스토그램, 07 이진화)이 하나의 흐름으로 연결되는 장면입니다. 12차시 이후가 오른쪽 두 칸을 자세히 다룬다고 예고. (4분)</p>' },
          { layout: 'code', title: '예제: 컬러부터 저장까지', code: S_PIPE, points: ['컬러를 바로 Otsu → <b>오류</b> (CV_8UC1 필요)', '① Gray ② 이진화 ③ 개수 ④ <code>Cv2.ImWrite</code>', '저장 파일은 📁 작업 폴더에서 내려받기', '정면 조명 + 그림자 → 9개 (실제 13개)'], notes: '<p>오류 메시지를 일부러 한 번 보여 주는 것이 좋습니다(학생들이 나중에 반드시 만납니다). 왜 13 이 아니고 10 인지 물어 그림자 문제를 짚고 05차시 HSV · 09차시 모폴로지로 연결합니다. (7분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>Cv2.AdaptiveThreshold</code> 의 <code>blockSize</code> 는?', options: ['결과 영상 크기', '임계값을 계산할 주변 영역의 한 변 — 3 이상의 홀수', '반복 횟수', '임계값'], answer: 1, explain: '주변 blockSize × blockSize 의 평균 − C 가 그 픽셀의 임계값입니다. 중심 픽셀이 있어야 하므로 홀수만 됩니다.', notes: '<p>정답 2번. 짝수를 넣으면 나는 오류 메시지를 함께 떠올리게 합니다.</p>' },
          { layout: 'practice', title: '실습: 파이프라인 완성하기', desc: '<p><code>nuts_bolts_color.png</code> 로 ① Gray ② Otsu ③ BitwiseAnd ④ 개수 ⑤ 저장까지 완성하세요.</p><ul><li>컬러를 바로 Otsu 에 넣으면? → 오류 확인</li><li>저장: <code>Cv2.ImWrite("out/parts.png", only)</code></li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var color = Cv2.ImRead("images/nuts_bolts_color.png");
        using var gray = new Mat();
        // TODO: Gray -> Otsu -> BitwiseAnd -> 개수 -> ImWrite
        Cv2.ImShow("input", color);
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var color = Cv2.ImRead("images/nuts_bolts_color.png");
        using var gray = new Mat();
        Cv2.CvtColor(color, gray, ColorConversionCodes.BGR2GRAY);
        using var bin = new Mat();
        double t = Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        using var only = new Mat();
        Cv2.BitwiseAnd(color, color, only, bin);
        var cc = Cv2.ConnectedComponentsEx(bin);
        int n = 0;
        foreach (var b in cc.Blobs) if (b.Label != 0 && b.Area >= 500) n++;
        Console.WriteLine($"Otsu {t}, 덩어리 {n} 개, 저장 {Cv2.ImWrite("out/parts.png", only)}");
        Cv2.ImShow("parts", only);
        Cv2.WaitKey(0);
    }
}`, notes: '<p>정답: Otsu 137, 덩어리 9개. 📁 작업 폴더를 열어 저장된 PNG 를 함께 확인하면 “결과를 파일로 남긴다”는 실감이 생깁니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['조명이 기울면 <b>전역 임계값 하나로는 불가능</b> (Otsu 도 실패)', '<code>Cv2.AdaptiveThreshold(src, dst, 255, MeanC/GaussianC, BinaryInv, blockSize, C)</code>', '임계값 = <b>주변 평균 − C</b> · blockSize 는 <b>3 이상 홀수</b>', 'blockSize 는 물체의 2~3배, C 는 5~20 에서 시작', '넓고 평평한 영역은 속이 빈다 → 큰 실루엣은 전역 Otsu', '이진 영상 = 마스크: <code>BitwiseAnd</code> · <code>BitwiseNot</code> · <code>Mean(img, mask)</code> 로 검증', '컬러는 반드시 <b>Gray 먼저</b> · 결과는 <code>Cv2.ImWrite</code> 로 저장', '다음 차시: 잡음을 다루는 <b>필터링</b> (블러 · 샤프닝 · 미디언)'], notes: '<p>정리 후 남은 문제를 제시합니다: “점은 찾았지만 글자 획이 끊어지고 배경에 잡티가 남았다.” → 08차시 필터링, 09차시 모폴로지로 이어집니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
