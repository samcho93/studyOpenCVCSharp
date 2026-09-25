/* 05차시 색 공간: BGR · Gray · HSV · 채널 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 컬러 Mat 의 메모리 배치(B G R 인터리브)와 Split / Merge
  const FIG_CHANNELS = `<svg viewBox="0 0 740 320" role="img" aria-label="컬러 Mat 은 한 픽셀마다 B G R 세 바이트가 이어져 있고, Split 으로 세 장의 1채널 영상으로 나눌 수 있다">
  ${ARROW('c05a1')}
  <text x="20" y="26" class="tx-b">컬러 Mat — CV_8UC3 (한 픽셀 = 3바이트, 순서는 B → G → R)</text>
  <rect x="20" y="40" width="42" height="40" rx="5" class="p1s"/><text x="41" y="65" text-anchor="middle" class="tx">B</text>
  <rect x="64" y="40" width="42" height="40" rx="5" class="p2s"/><text x="85" y="65" text-anchor="middle" class="tx">G</text>
  <rect x="108" y="40" width="42" height="40" rx="5" class="p3s"/><text x="129" y="65" text-anchor="middle" class="tx">R</text>
  <rect x="160" y="40" width="42" height="40" rx="5" class="p1s"/><text x="181" y="65" text-anchor="middle" class="tx">B</text>
  <rect x="204" y="40" width="42" height="40" rx="5" class="p2s"/><text x="225" y="65" text-anchor="middle" class="tx">G</text>
  <rect x="248" y="40" width="42" height="40" rx="5" class="p3s"/><text x="269" y="65" text-anchor="middle" class="tx">R</text>
  <rect x="300" y="40" width="42" height="40" rx="5" class="p1s"/><text x="321" y="65" text-anchor="middle" class="tx">B</text>
  <rect x="344" y="40" width="42" height="40" rx="5" class="p2s"/><text x="365" y="65" text-anchor="middle" class="tx">G</text>
  <rect x="388" y="40" width="42" height="40" rx="5" class="p3s"/><text x="409" y="65" text-anchor="middle" class="tx">R</text>
  <text x="440" y="65" class="tx-m">…</text>
  <text x="85" y="100" text-anchor="middle" class="tx-m">픽셀 (y=0, x=0)</text>
  <text x="225" y="100" text-anchor="middle" class="tx-m">픽셀 (y=0, x=1)</text>
  <text x="365" y="100" text-anchor="middle" class="tx-m">픽셀 (y=0, x=2)</text>
  <text x="20" y="130" class="tx">img.At&lt;Vec3b&gt;(0, 1) → Item0 = B, Item1 = G, Item2 = R</text>
  <line x1="240" y1="146" x2="240" y2="186" class="ln" stroke-width="2" marker-end="url(#c05a1)"/>
  <text x="252" y="172" class="tx">Cv2.Split(img)</text>
  <line x1="520" y1="186" x2="520" y2="146" class="ln" stroke-width="2" marker-end="url(#c05a1)"/>
  <text x="532" y="172" class="tx">Cv2.Merge(ch, dst)</text>
  <rect x="40" y="196" width="180" height="100" rx="8" class="p1s"/><text x="130" y="232" text-anchor="middle" class="tx-b">ch[0] = B 채널</text><text x="130" y="256" text-anchor="middle" class="tx-m">1채널 CV_8UC1</text><text x="130" y="278" text-anchor="middle" class="tx-m">크기는 원본과 같다</text>
  <rect x="240" y="196" width="180" height="100" rx="8" class="p2s"/><text x="330" y="232" text-anchor="middle" class="tx-b">ch[1] = G 채널</text><text x="330" y="256" text-anchor="middle" class="tx-m">1채널 CV_8UC1</text>
  <rect x="440" y="196" width="180" height="100" rx="8" class="p3s"/><text x="530" y="232" text-anchor="middle" class="tx-b">ch[2] = R 채널</text><text x="530" y="256" text-anchor="middle" class="tx-m">1채널 CV_8UC1</text>
  <text x="640" y="250" class="tx-m">흑백 영상</text><text x="640" y="272" class="tx-m">3장으로 보인다</text>
</svg>`;

  // 그림 2: Gray 변환 = 가중 평균
  const FIG_GRAY = `<svg viewBox="0 0 700 260" role="img" aria-label="회색 변환은 R G B 에 각각 0.299, 0.587, 0.114 를 곱해 더하는 가중 평균이다">
  ${ARROW('c05a2')}
  <text x="20" y="26" class="tx-b">Gray = 0.299·R + 0.587·G + 0.114·B  (빨간 원 픽셀 B=37 G=37 R=196)</text>
  <rect x="30" y="48" width="200" height="40" rx="6" class="p3s"/><text x="130" y="74" text-anchor="middle" class="tx">R = 196</text>
  <text x="248" y="74" class="tx">× 0.299 =</text>
  <rect x="340" y="48" width="120" height="40" rx="6" class="p3"/><text x="400" y="74" text-anchor="middle" class="tx-w">58.6</text>
  <rect x="30" y="100" width="200" height="40" rx="6" class="p2s"/><text x="130" y="126" text-anchor="middle" class="tx">G = 37</text>
  <text x="248" y="126" class="tx">× 0.587 =</text>
  <rect x="340" y="100" width="120" height="40" rx="6" class="p2"/><text x="400" y="126" text-anchor="middle" class="tx-w">21.7</text>
  <rect x="30" y="152" width="200" height="40" rx="6" class="p1s"/><text x="130" y="178" text-anchor="middle" class="tx">B = 37</text>
  <text x="248" y="178" class="tx">× 0.114 =</text>
  <rect x="340" y="152" width="120" height="40" rx="6" class="p1"/><text x="400" y="178" text-anchor="middle" class="tx-w">4.2</text>
  <line x1="340" y1="204" x2="460" y2="204" class="ax"/>
  <text x="400" y="230" text-anchor="middle" class="tx-b">합 = 84.5 → 85</text>
  <line x1="470" y1="204" x2="540" y2="204" class="ln" stroke-width="2" marker-end="url(#c05a2)"/>
  <rect x="548" y="180" width="120" height="48" rx="8" class="p4s"/><text x="608" y="210" text-anchor="middle" class="tx-b">Gray = 85</text>
  <text x="500" y="70" class="tx-m">사람 눈은 초록에 가장 민감해서</text>
  <text x="500" y="92" class="tx-m">G 의 계수(0.587)가 가장 크다.</text>
  <text x="500" y="122" class="tx-m">그래서 밝은 빨강과 짙은 파랑이</text>
  <text x="500" y="144" class="tx-m">흑백에서는 비슷한 값이 된다.</text>
</svg>`;

  // 그림 3: HSV 원기둥
  const FIG_HSV = `<svg viewBox="0 0 700 340" role="img" aria-label="HSV 원기둥: 둘레 각도가 색상 H, 중심에서의 거리가 채도 S, 높이가 명도 V">
  ${ARROW('c05a3')}
  <ellipse cx="220" cy="80" rx="150" ry="52" class="p1s"/>
  <path d="M70,80 L70,250 A150,52 0 0 0 370,250 L370,80" class="p2s"/>
  <ellipse cx="220" cy="250" rx="150" ry="52" class="p3s"/>
  <ellipse cx="220" cy="80" rx="150" ry="52" class="s1" fill="none"/>
  <line x1="220" y1="80" x2="360" y2="100" class="ln" stroke-width="2" marker-end="url(#c05a3)"/>
  <text x="300" y="70" class="tx">S (채도) 0 → 255</text>
  <path d="M100,62 A150,52 0 0 1 330,55" class="s2" fill="none" marker-end="url(#c05a3)"/>
  <text x="215" y="40" text-anchor="middle" class="tx">H (색상) 0 → 179 — 둘레를 한 바퀴</text>
  <line x1="420" y1="250" x2="420" y2="80" class="ln" stroke-width="2" marker-end="url(#c05a3)"/>
  <text x="432" y="170" class="tx">V (명도)</text>
  <text x="432" y="192" class="tx-m">0 = 검정 → 255 = 밝음</text>
  <text x="220" y="86" text-anchor="middle" class="tx-m">중심 = 무채색 (S≈0)</text>
  <text x="220" y="308" text-anchor="middle" class="tx-m">아래로 갈수록 어둡다 (V 작아짐)</text>
  <text x="432" y="230" class="tx-m">조명이 약해지면</text>
  <text x="432" y="252" class="tx-m">V 만 작아지고</text>
  <text x="432" y="274" class="tx-m">H 는 거의 그대로!</text>
</svg>`;

  // 그림 4: H 축과 빨강의 두 구간
  const FIG_HUE = `<svg viewBox="0 0 740 250" role="img" aria-label="H 축은 0 에서 179 까지이며 빨강은 0 근처와 179 근처 두 구간에 걸쳐 있다">
  ${ARROW('c05a4')}
  <text x="20" y="26" class="tx-b">OpenCV 의 H 축 (8비트: 0 ~ 179 = 색상환 360° ÷ 2)</text>
  <line x1="40" y1="120" x2="700" y2="120" class="ax"/>
  <rect x="40" y="76" width="38" height="44" class="p3s"/><text x="59" y="140" text-anchor="middle" class="tx-m">0~10</text><text x="59" y="68" text-anchor="middle" class="tx">빨강</text>
  <rect x="78" y="76" width="36" height="44" class="p5s"/><text x="96" y="140" text-anchor="middle" class="tx-m">10~20</text><text x="96" y="68" text-anchor="middle" class="tx-m">주황</text>
  <rect x="114" y="76" width="56" height="44" class="p4s"/><text x="142" y="140" text-anchor="middle" class="tx-m">20~35</text><text x="142" y="68" text-anchor="middle" class="tx">노랑</text>
  <rect x="170" y="76" width="160" height="44" class="p2s"/><text x="250" y="140" text-anchor="middle" class="tx-m">40~80</text><text x="250" y="68" text-anchor="middle" class="tx">초록</text>
  <rect x="330" y="76" width="74" height="44" class="p2"/><text x="367" y="140" text-anchor="middle" class="tx-m">80~100</text><text x="367" y="68" text-anchor="middle" class="tx-w">청록</text>
  <rect x="404" y="76" width="112" height="44" class="p1s"/><text x="460" y="140" text-anchor="middle" class="tx-m">100~130</text><text x="460" y="68" text-anchor="middle" class="tx">파랑</text>
  <rect x="516" y="76" width="112" height="44" class="p5s"/><text x="572" y="140" text-anchor="middle" class="tx-m">130~170</text><text x="572" y="68" text-anchor="middle" class="tx-m">자주</text>
  <rect x="628" y="76" width="62" height="44" class="p3s"/><text x="659" y="140" text-anchor="middle" class="tx-m">170~179</text><text x="659" y="68" text-anchor="middle" class="tx">빨강</text>
  <path d="M59,166 C59,216 659,216 659,166" class="s3" fill="none" marker-end="url(#c05a4)"/>
  <text x="360" y="212" text-anchor="middle" class="tx-b">색상환은 둥글다 → 빨강은 양쪽 끝에 걸친다</text>
  <text x="360" y="238" text-anchor="middle" class="tx-m">그래서 빨강 마스크는 0~10 과 170~179 를 각각 만들어 Cv2.BitwiseOr 로 합친다</text>
</svg>`;

  // ---------------------------------------------------------------- 1교시 예제
  const EX_PIXEL = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        Console.WriteLine($"크기 {img.Width}x{img.Height}, 채널 {img.Channels()}, 형식 {img.Type()}");

        int[][] pts = { new[] { 120, 110 }, new[] { 270, 120 }, new[] { 130, 300 }, new[] { 520, 120 }, new[] { 350, 60 } };
        string[] names = { "빨간 원", "초록 사각형", "파란 삼각형", "노란 육각형", "트레이 배경" };
        for (int i = 0; i < pts.Length; i++)
        {
            Vec3b p = img.At<Vec3b>(pts[i][1], pts[i][0]);     // (행 y, 열 x) 순서!
            Console.WriteLine($"{names[i]} ({pts[i][0]},{pts[i][1]}): B={p.Item0} G={p.Item1} R={p.Item2}");
        }
    }
}`;

  const EX_GRAY = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        using var gray = new Mat();
        Cv2.CvtColor(img, gray, ColorConversionCodes.BGR2GRAY);
        Console.WriteLine($"원본 채널 {img.Channels()} -> 회색 채널 {gray.Channels()}, 형식 {gray.Type()}");

        int[][] pts = { new[] { 120, 110 }, new[] { 270, 120 }, new[] { 130, 300 } };
        string[] names = { "빨강", "초록", "파랑" };
        for (int i = 0; i < pts.Length; i++)
        {
            int x = pts[i][0], y = pts[i][1];
            Vec3b p = img.At<Vec3b>(y, x);
            double calc = 0.299 * p.Item2 + 0.587 * p.Item1 + 0.114 * p.Item0;   // 공식을 직접 계산
            Console.WriteLine($"{names[i]} B={p.Item0} G={p.Item1} R={p.Item2} -> 공식 {calc:F1}, CvtColor {gray.At<byte>(y, x)}");
        }
        Cv2.ImShow("gray", gray);
        Cv2.WaitKey(0);
    }
}`;

  const EX_SPLIT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        Mat[] ch = Cv2.Split(img);          // ch[0]=B, ch[1]=G, ch[2]=R
        string[] names = { "B(파랑)", "G(초록)", "R(빨강)" };
        for (int i = 0; i < 3; i++)
            Console.WriteLine($"{names[i]} 채널: 크기 {ch[i].Width}x{ch[i].Height}, 채널 수 {ch[i].Channels()}, 평균 {Cv2.Mean(ch[i]).Val0:F1}");

        Vec3b p = img.At<Vec3b>(110, 120);
        Console.WriteLine($"빨간 원 (120,110): Vec3b=({p.Item0},{p.Item1},{p.Item2}) / 채널별=({ch[0].At<byte>(110, 120)},{ch[1].At<byte>(110, 120)},{ch[2].At<byte>(110, 120)})");

        for (int i = 0; i < 3; i++) Cv2.ImShow(names[i], ch[i]);
        foreach (var m in ch) m.Dispose();   // Split 이 만든 Mat 도 직접 해제!
        Cv2.WaitKey(0);
    }
}`;

  const EX_MERGE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        Mat[] ch = Cv2.Split(img);
        ch[2].SetTo(0);                      // R 채널을 전부 0 으로
        using var noRed = new Mat();
        Cv2.Merge(ch, noRed);                // 다시 3채널로 합치기
        Console.WriteLine($"R 제거 후 (120,110) = {noRed.At<Vec3b>(110, 120).Item0},{noRed.At<Vec3b>(110, 120).Item1},{noRed.At<Vec3b>(110, 120).Item2}");
        Console.WriteLine($"원본 평균 BGR = {Cv2.Mean(img).Val0:F1}, {Cv2.Mean(img).Val1:F1}, {Cv2.Mean(img).Val2:F1}");
        Console.WriteLine($"결과 평균 BGR = {Cv2.Mean(noRed).Val0:F1}, {Cv2.Mean(noRed).Val1:F1}, {Cv2.Mean(noRed).Val2:F1}");

        // 순서를 바꿔 Merge 하면 BGR <-> RGB 가 뒤집힌다
        using var swapped = new Mat();
        Cv2.Merge(new Mat[] { ch[2], ch[1], ch[0] }, swapped);
        Cv2.ImShow("noRed", noRed);
        foreach (var m in ch) m.Dispose();
        Cv2.WaitKey(0);
    }
}`;

  const EX_OVERLAY = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        using var gray = new Mat();
        Cv2.CvtColor(img, gray, ColorConversionCodes.BGR2GRAY);
        using var canvas = new Mat();
        Cv2.CvtColor(gray, canvas, ColorConversionCodes.GRAY2BGR);   // 1채널 -> 3채널 (색은 여전히 회색)
        Console.WriteLine($"gray 채널 {gray.Channels()} -> canvas 채널 {canvas.Channels()}");
        Console.WriteLine($"(120,110) canvas = {canvas.At<Vec3b>(110, 120).Item0},{canvas.At<Vec3b>(110, 120).Item1},{canvas.At<Vec3b>(110, 120).Item2} (B=G=R)");

        Rect roi = new Rect(86, 76, 68, 68);          // 빨간 원 주변만
        using (var src = new Mat(img, roi))
        using (var dst = new Mat(canvas, roi))
            src.CopyTo(dst);                          // 그 부분만 원본 컬러로 되살리기
        Cv2.Rectangle(canvas, roi, new Scalar(0, 255, 255), 2);
        Cv2.PutText(canvas, "RED", new Point(80, 70), HersheyFonts.HersheySimplex, 0.7, new Scalar(0, 255, 255), 2);
        Console.WriteLine($"강조 후 (120,110) = {canvas.At<Vec3b>(110, 120).Item0},{canvas.At<Vec3b>(110, 120).Item1},{canvas.At<Vec3b>(110, 120).Item2}");
        Cv2.ImShow("overlay", canvas);
        Cv2.WaitKey(0);
    }
}`;

  // ---------------------------------------------------------------- 2교시 예제
  const EX_HSV = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);

        int[][] pts = { new[] { 412, 96 }, new[] { 265, 382 }, new[] { 310, 229 }, new[] { 521, 167 }, new[] { 424, 227 }, new[] { 10, 10 } };
        string[] names = { "빨강 뚜껑", "초록 뚜껑", "파랑 뚜껑", "노랑 뚜껑", "흰 뚜껑", "컨베이어 배경" };
        Console.WriteLine("색      BGR              H    S    V");
        for (int i = 0; i < pts.Length; i++)
        {
            int x = pts[i][0], y = pts[i][1];
            Vec3b b = img.At<Vec3b>(y, x);
            Vec3b h = hsv.At<Vec3b>(y, x);
            Console.WriteLine($"{names[i],-7} ({b.Item0,3},{b.Item1,3},{b.Item2,3})   {h.Item0,3}  {h.Item1,3}  {h.Item2,3}");
        }
        Cv2.ImShow("hsv", hsv);
        Cv2.WaitKey(0);
    }
}`;

  const EX_INRANGE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);

        using var mask = new Mat();
        Cv2.InRange(hsv, new Scalar(40, 100, 70), new Scalar(80, 255, 255), mask);   // 초록: H 40~80
        Console.WriteLine($"마스크 형식 {mask.Type()}, 흰 픽셀 {Cv2.CountNonZero(mask)} / 전체 {mask.Rows * mask.Cols}");

        var cc = Cv2.ConnectedComponentsEx(mask);        // 흰 덩어리 찾기
        int n = 0;
        foreach (var b in cc.Blobs)
        {
            if (b.Label == 0 || b.Area < 300) continue;   // 0번은 배경, 작은 잡티는 무시
            n++;
            Console.WriteLine($"  #{n} 면적 {b.Area} 중심 ({b.Centroid.X:F0}, {b.Centroid.Y:F0})");
        }
        Console.WriteLine($"초록 뚜껑 {n} 개");
        Cv2.ImShow("green mask", mask);
        Cv2.WaitKey(0);
    }
}`;

  const EX_RED = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);

        using var low = new Mat();
        using var high = new Mat();
        using var red = new Mat();
        Cv2.InRange(hsv, new Scalar(0, 100, 70), new Scalar(10, 255, 255), low);      // H 0~10
        Cv2.InRange(hsv, new Scalar(170, 100, 70), new Scalar(179, 255, 255), high);  // H 170~179
        Cv2.BitwiseOr(low, high, red);                                               // 둘을 합친다
        Console.WriteLine($"아래 구간 {Cv2.CountNonZero(low)} px + 위 구간 {Cv2.CountNonZero(high)} px = OR {Cv2.CountNonZero(red)} px");
        Console.WriteLine($"아래 구간만 쓰면 {Count(low)} 개, 두 구간 OR 이면 {Count(red)} 개");
        Cv2.ImShow("red mask", red);
        Cv2.WaitKey(0);
    }

    static int Count(Mat mask)
    {
        var cc = Cv2.ConnectedComponentsEx(mask);
        int n = 0;
        foreach (var b in cc.Blobs) if (b.Label != 0 && b.Area >= 300) n++;
        return n;
    }
}`;

  const EX_COUNT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);

        string[] names = { "red", "yellow", "green", "blue", "white" };
        Scalar[] lo = { new Scalar(0, 100, 70), new Scalar(20, 100, 70), new Scalar(40, 100, 70), new Scalar(100, 100, 70), new Scalar(0, 0, 180) };
        Scalar[] hi = { new Scalar(10, 255, 255), new Scalar(35, 255, 255), new Scalar(80, 255, 255), new Scalar(130, 255, 255), new Scalar(179, 40, 255) };
        int total = 0;
        for (int i = 0; i < names.Length; i++)
        {
            using var mask = new Mat();
            Cv2.InRange(hsv, lo[i], hi[i], mask);
            if (names[i] == "red")                     // 빨강만 두 구간을 합친다
            {
                using var wrap = new Mat();
                Cv2.InRange(hsv, new Scalar(170, 100, 70), new Scalar(179, 255, 255), wrap);
                Cv2.BitwiseOr(mask, wrap, mask);
            }
            var cc = Cv2.ConnectedComponentsEx(mask);
            int n = 0;
            foreach (var b in cc.Blobs) if (b.Label != 0 && b.Area >= 300) n++;
            total += n;
            Console.WriteLine($"{names[i],-7} {n} 개");
        }
        Console.WriteLine($"합계 {total} 개");
    }
}`;

  const EX_BITAND = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);
        using var mask = new Mat();
        Cv2.InRange(hsv, new Scalar(20, 100, 70), new Scalar(35, 255, 255), mask);    // 노랑

        using var only = new Mat();
        Cv2.BitwiseAnd(img, img, only, mask);          // 마스크가 흰 곳만 남기고 나머지는 0
        Console.WriteLine($"노랑 픽셀 {Cv2.CountNonZero(mask)} px");
        Console.WriteLine($"원본 평균 밝기 {Cv2.Mean(img).Val0:F1}, 노랑만 남긴 영상 평균 {Cv2.Mean(only).Val0:F1}");
        Console.WriteLine($"마스크 안 평균색 BGR = {Cv2.Mean(img, mask).Val0:F0}, {Cv2.Mean(img, mask).Val1:F0}, {Cv2.Mean(img, mask).Val2:F0}");

        using var inv = new Mat();
        Cv2.BitwiseNot(mask, inv);                     // 마스크 반전 = 노랑이 아닌 곳
        Console.WriteLine($"반전 마스크 흰 픽셀 {Cv2.CountNonZero(inv)} px");
        Cv2.ImShow("yellow only", only);
        Cv2.WaitKey(0);
    }
}`;

  const EX_LIGHT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var dark = new Mat();
        Cv2.ConvertScaleAbs(img, dark, 0.55, 0);        // 조명이 약해진 상황 (밝기 55%)
        Console.WriteLine($"원본 평균 밝기 {Cv2.Mean(img).Val0:F1} -> 어두운 영상 {Cv2.Mean(dark).Val0:F1}");
        Report("원본", img);
        Report("55% 조명", dark);

        using var lab = new Mat();
        Cv2.CvtColor(img, lab, ColorConversionCodes.BGR2Lab);
        Vec3b p = lab.At<Vec3b>(96, 412);
        Console.WriteLine($"Lab 빨강 뚜껑: L={p.Item0} a={p.Item1} b={p.Item2}");
        Cv2.ImShow("dark", dark);
        Cv2.WaitKey(0);
    }

    static void Report(string tag, Mat bgr)
    {
        using var hsv = new Mat();
        Cv2.CvtColor(bgr, hsv, ColorConversionCodes.BGR2HSV);
        Vec3b h = hsv.At<Vec3b>(96, 412);
        using var mask = new Mat();
        using var wrap = new Mat();
        Cv2.InRange(hsv, new Scalar(0, 100, 50), new Scalar(10, 255, 255), mask);
        Cv2.InRange(hsv, new Scalar(170, 100, 50), new Scalar(179, 255, 255), wrap);
        Cv2.BitwiseOr(mask, wrap, mask);
        var cc = Cv2.ConnectedComponentsEx(mask);
        int n = 0;
        foreach (var b in cc.Blobs) if (b.Label != 0 && b.Area >= 300) n++;
        Console.WriteLine($"{tag}: 빨강 뚜껑 HSV=({h.Item0},{h.Item1},{h.Item2}) -> 같은 H 범위로 {n} 개");
    }
}`;

  // ---------------------------------------------------------------- 슬라이드용 짧은 코드
  const S_PIXEL = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        Vec3b red = img.At<Vec3b>(110, 120);     // 빨간 원 (x=120, y=110)
        Vec3b tray = img.At<Vec3b>(60, 350);     // 트레이 배경
        Console.WriteLine($"빨간 원 B={red.Item0} G={red.Item1} R={red.Item2}");
        Console.WriteLine($"트레이  B={tray.Item0} G={tray.Item1} R={tray.Item2}");
        Cv2.ImShow("color", img);
        Cv2.WaitKey(0);
    }
}`;

  const S_GRAY = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        using var gray = new Mat();
        Cv2.CvtColor(img, gray, ColorConversionCodes.BGR2GRAY);

        Vec3b p = img.At<Vec3b>(110, 120);
        double calc = 0.299 * p.Item2 + 0.587 * p.Item1 + 0.114 * p.Item0;
        Console.WriteLine($"공식 {calc:F1} vs CvtColor {gray.At<byte>(110, 120)}");
        Cv2.ImShow("gray", gray);
        Cv2.WaitKey(0);
    }
}`;

  const S_SPLIT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        Mat[] ch = Cv2.Split(img);               // ch[0]=B ch[1]=G ch[2]=R
        for (int i = 0; i < 3; i++)
            Console.WriteLine($"ch[{i}] 평균 {Cv2.Mean(ch[i]).Val0:F1}, 채널 수 {ch[i].Channels()}");

        ch[0].SetTo(0);                          // B 를 0 으로
        using var noBlue = new Mat();
        Cv2.Merge(ch, noBlue);
        Cv2.ImShow("noBlue", noBlue);
        foreach (var m in ch) m.Dispose();
        Cv2.WaitKey(0);
    }
}`;

  const S_OVERLAY = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        using var gray = new Mat();
        Cv2.CvtColor(img, gray, ColorConversionCodes.BGR2GRAY);
        using var canvas = new Mat();
        Cv2.CvtColor(gray, canvas, ColorConversionCodes.GRAY2BGR);

        Rect roi = new Rect(86, 76, 68, 68);
        using (var s = new Mat(img, roi))
        using (var d = new Mat(canvas, roi)) s.CopyTo(d);
        Cv2.Rectangle(canvas, roi, new Scalar(0, 255, 255), 2);
        Console.WriteLine($"canvas 채널 {canvas.Channels()}");
        Cv2.ImShow("overlay", canvas);
        Cv2.WaitKey(0);
    }
}`;

  const S_HSV = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);

        Vec3b r = hsv.At<Vec3b>(96, 412);     // 빨강 뚜껑
        Vec3b w = hsv.At<Vec3b>(227, 424);    // 흰 뚜껑
        Console.WriteLine($"빨강 H={r.Item0} S={r.Item1} V={r.Item2}");
        Console.WriteLine($"흰색 H={w.Item0} S={w.Item1} V={w.Item2}");
        Cv2.ImShow("hsv", hsv);
        Cv2.WaitKey(0);
    }
}`;

  const S_MASK = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);
        using var mask = new Mat();
        Cv2.InRange(hsv, new Scalar(100, 100, 70), new Scalar(130, 255, 255), mask);

        var cc = Cv2.ConnectedComponentsEx(mask);
        int n = 0;
        foreach (var b in cc.Blobs) if (b.Label != 0 && b.Area >= 300) n++;
        Console.WriteLine($"파랑 뚜껑 {n} 개 (흰 픽셀 {Cv2.CountNonZero(mask)})");
        Cv2.ImShow("blue mask", mask);
        Cv2.WaitKey(0);
    }
}`;

  const S_RED = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);
        using var m1 = new Mat();
        using var m2 = new Mat();
        using var red = new Mat();
        Cv2.InRange(hsv, new Scalar(0, 100, 70), new Scalar(10, 255, 255), m1);
        Cv2.InRange(hsv, new Scalar(170, 100, 70), new Scalar(179, 255, 255), m2);
        Cv2.BitwiseOr(m1, m2, red);
        Console.WriteLine($"{Cv2.CountNonZero(m1)} + {Cv2.CountNonZero(m2)} = {Cv2.CountNonZero(red)} px");
        Cv2.ImShow("red", red);
        Cv2.WaitKey(0);
    }
}`;

  // ---------------------------------------------------------------- 퀴즈
  const QUIZ1 = [
    { q: '<code>Cv2.ImRead</code> 로 읽은 컬러 이미지에서 <code>img.At&lt;Vec3b&gt;(y, x).Item0</code> 은 어떤 값인가?',
      options: ['빨강(R)', '초록(G)', '파랑(B)', '밝기(Gray)'], answer: 2,
      explain: 'OpenCV 의 채널 순서는 <b>B → G → R</b> 이므로 <code>Item0</code> = B, <code>Item1</code> = G, <code>Item2</code> = R 입니다. <code>new Scalar(0, 0, 255)</code> 가 빨강인 것과 같은 규칙입니다.' },
    { q: 'BGR = (37, 37, 196) 인 빨간 픽셀을 <code>BGR2GRAY</code> 로 바꾸면 약 얼마인가?',
      options: ['약 37', '약 85', '약 196', '약 255'], answer: 1,
      explain: '0.299×196 + 0.587×37 + 0.114×37 = 58.6 + 21.7 + 4.2 = <b>84.5 → 85</b>. 빨강은 R 값이 커도 계수가 0.299 뿐이어서 흑백에서는 꽤 어둡게 나옵니다.' },
    { q: '<code>Cv2.Split</code> 이 돌려주는 <code>Mat[]</code> 의 각 원소는?',
      options: ['원본과 같은 3채널 컬러 Mat 3개', '크기가 1/3 로 줄어든 Mat 3개', '원본과 같은 크기의 <b>1채널</b> Mat 3개', 'B, G, R 값을 담은 Scalar 3개'], answer: 2,
      explain: '채널 분리는 크기(행·열)는 그대로 두고 채널만 떼어 냅니다. 그래서 <code>CV_8UC1</code> 영상 3장이 되고, 화면에 띄우면 <b>흑백 영상</b>으로 보입니다.' },
    { q: '흑백 영상 위에 <b>빨간 선</b>을 그리려면 먼저 무엇을 해야 하나?',
      options: ['<code>Cv2.CvtColor(gray, dst, ColorConversionCodes.GRAY2BGR)</code> 로 3채널로 바꾼다', '<code>gray.SetTo(Scalar.Red)</code> 로 색을 넣는다', '<code>Cv2.Merge</code> 로 gray 한 장만 합친다', '아무것도 필요 없다 — 1채널에도 색이 그려진다'], answer: 0,
      explain: '1채널 영상에는 색을 그릴 수 없습니다(값 하나뿐). <code>GRAY2BGR</code> 로 3채널로 만들면 화면은 여전히 회색이지만 <b>그 위에 컬러로 그릴 수</b> 있습니다. 색 정보가 되살아나는 것은 아닙니다.' },
    { q: '<code>Cv2.Split</code> 로 얻은 배열을 다 쓴 다음 해야 할 일은?',
      options: ['아무것도 안 해도 된다', '각 Mat 을 <code>Dispose()</code> 한다', '<code>Cv2.Merge</code> 로 반드시 되돌린다', '<code>null</code> 을 대입한다'], answer: 1,
      explain: 'Split 은 <b>새 Mat 3개</b>를 만듭니다. <code>using var</code> 로 선언한 변수가 아니므로 <code>foreach (var m in ch) m.Dispose();</code> 처럼 직접 해제하는 습관을 들이세요 (메모리 누수 방지).' }
  ];

  const QUIZ2 = [
    { q: 'OpenCV 의 8비트 HSV 에서 H(색상)의 범위는?',
      options: ['0 ~ 255', '0 ~ 360', '0 ~ 179', '−180 ~ 180'], answer: 2,
      explain: '색상환은 360° 이지만 8비트(0~255)에 담으려고 <b>2로 나눠 0~179</b> 를 씁니다. S 와 V 는 0~255 입니다. 다른 프로그램에서 본 H 값(0~360)을 그대로 쓰면 범위를 벗어납니다.' },
    { q: '빨강을 <code>InRange</code> 로 검출할 때 구간을 두 번 만들어 합치는 이유는?',
      options: ['빨강은 S 가 낮아서', '빨강의 H 가 0 근처와 179 근처 양쪽에 걸쳐 있어서', 'InRange 는 한 번에 한 채널만 되어서', '빨강은 V 가 커서'], answer: 1,
      explain: '색상환이 둥글기 때문에 빨강은 <b>H ≈ 0 과 H ≈ 179 양쪽</b>에 나타납니다. <code>0~10</code> 과 <code>170~179</code> 마스크를 각각 만들어 <code>Cv2.BitwiseOr</code> 로 합칩니다.' },
    { q: '흰색 물체를 HSV 로 고를 때 가장 알맞은 조건은?',
      options: ['H 가 0 근처', 'S 가 크고 V 가 작다', '<b>S 가 작고 V 가 크다</b>', 'H 가 90 근처'], answer: 2,
      explain: '흰색 · 회색 · 검정은 <b>무채색</b>이라 H 값에 의미가 없습니다. 흰색은 채도 S 가 거의 0, 명도 V 가 큽니다 — <code>InRange(hsv, new Scalar(0,0,180), new Scalar(179,40,255), mask)</code>.' },
    { q: '조명이 어두워져도 HSV 기반 색 검출이 잘 버티는 이유는?',
      options: ['H 와 S 는 그대로이고 주로 V 만 작아지기 때문', 'HSV 는 잡음이 없기 때문', 'InRange 가 자동으로 밝기를 보정하기 때문', 'H 가 밝기에 비례해 커지기 때문'], answer: 0,
      explain: '밝기 변화는 대부분 <b>V(명도)</b> 에 몰립니다. BGR 세 값은 모두 함께 변하지만 H(색상)는 거의 그대로여서, V 의 아래 한계만 넉넉히 잡으면 같은 범위로 검출됩니다.' },
    { q: '<code>Cv2.BitwiseAnd(img, img, dst, mask)</code> 의 결과는?',
      options: ['마스크가 흰 곳만 원본 색이 남고 나머지는 0(검정)', '마스크가 검은 곳만 원본이 남는다', '마스크와 원본을 반반 섞는다', '마스크를 컬러로 바꾼다'], answer: 0,
      explain: '같은 영상을 두 번 넘기고 <code>mask</code> 를 주면 <b>마스크가 0 이 아닌 픽셀만 복사</b>됩니다. 반대로 남기고 싶으면 <code>Cv2.BitwiseNot</code> 으로 마스크를 반전하세요.' }
  ];

  CS_COURSE.addChapter({
    id: 'cs05', no: '05', title: '색 공간: BGR · Gray · HSV · 채널', subtitle: '색을 숫자로 다루기 — 채널 분리부터 색 검출까지',
    summary: '컬러 영상이 <b>B · G · R 세 장의 숫자판</b>으로 되어 있다는 것을 확인하고, 흑백 변환 공식을 직접 계산해 <code>Cv2.CvtColor</code> 결과와 비교합니다. 이어서 색을 다루기 쉬운 <b>HSV</b> 좌표계를 배워 <code>Cv2.InRange</code> 로 색 마스크를 만들고, 병뚜껑을 색별로 세는 실전 파이프라인까지 완성합니다.',
    goals: ['컬러 Mat 의 BGR 채널 구조를 설명하고 Split · Merge 로 채널을 다룰 수 있다', 'Gray 변환 공식(0.299R+0.587G+0.114B)을 직접 계산해 CvtColor 결과와 비교할 수 있다', 'HSV 의 H · S · V 뜻과 OpenCV 의 범위(0~179 · 0~255)를 안다', 'Cv2.InRange 로 색 마스크를 만들고 색별 개수를 세는 프로그램을 쓸 수 있다'],
    sections: [
      {
        id: 'cs05-1', title: 'BGR 채널과 흑백 변환', minutes: 50,
        goals: ['컬러 Mat 의 메모리 배치(B G R 인터리브)를 설명할 수 있다', 'Gray 변환 공식을 픽셀 하나로 직접 계산해 확인할 수 있다', 'Cv2.Split · Cv2.Merge 로 채널을 나누고 합칠 수 있다'],
        flow: [['도입: 색은 숫자 세 개', 8], ['BGR 과 Gray 변환', 17], ['채널 분리 · 합치기 실습', 17], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: '컬러 영상 = 숫자판 세 장' },
          { type: 'p', html: '03차시에서 흑백 영상이 <b>숫자로 채워진 표</b>라는 것을 배웠습니다. 컬러 영상은 그 표가 <b>세 장</b> 겹쳐 있는 것입니다. OpenCV 는 이 세 장을 <b>B(파랑) · G(초록) · R(빨강)</b> 순서로 쌓고, 메모리에는 픽셀마다 <code>B G R B G R …</code> 처럼 <b>번갈아(interleaved)</b> 저장합니다. 그래서 <code>CV_8UC3</code> 영상의 한 픽셀은 3바이트입니다.' },
          { type: 'image', src: 'images/sample_color.png', caption: '이 차시에서 쓰는 images/sample_color.png — 회색 트레이 위에 7가지 색 부품 10개 (누르면 확대 · 픽셀 값 확인)' },
          { type: 'figure', html: FIG_CHANNELS, caption: '그림 1. 컬러 Mat 의 메모리 배치와 Cv2.Split / Cv2.Merge' },
          { type: 'code', title: '예제 1: 픽셀의 B · G · R 값 읽기', code: EX_PIXEL,
            desc: '결과 창의 이미지 위에 마우스를 올려 같은 좌표의 값과 비교해 보세요. 빨간 원은 <b>R 만 크고 B · G 는 작습니다</b>. 트레이 배경은 세 값이 거의 같아 <b>회색</b>입니다 — 세 값이 비슷하면 무채색이라는 뜻입니다.',
            expect: '크기 640x480, 채널 3, 형식 CV_8UC3\n빨간 원 (120,110): B=37 G=37 R=196\n초록 사각형 (270,120): B=58 G=169 R=58\n파란 삼각형 (130,300): B=187 G=84 R=28\n노란 육각형 (520,120): B=38 G=198 R=220\n트레이 배경 (350,60): B=143 G=145 R=148' },
          { type: 'callout', kind: 'warn', title: 'BGR 인가 RGB 인가', html: 'OpenCV(그리고 OpenCvSharp)는 <b>BGR</b> 순서입니다. 반면 WPF · 웹 · 대부분의 그림판 프로그램은 <b>RGB</b> 로 말합니다. 값 자체는 같고 <b>순서만</b> 다릅니다. 순서를 바꿀 때는 <code>Cv2.CvtColor(img, dst, ColorConversionCodes.BGR2RGB)</code> 를 쓰세요. 노랑이 <code>(0, 255, 255)</code>, 청록이 <code>(255, 255, 0)</code> 이 되는 것을 기억하면 헷갈리지 않습니다.' },
          { type: 'callout', kind: 'wpf', title: 'WPF 는 RGB 계열인데 왜 그냥 보이나?', html: 'WPF 의 <code>BitmapSource</code> 는 <code>PixelFormats.Bgr24</code> 라는 포맷을 그대로 지원합니다. 그래서 <code>BitmapSourceConverter.ToBitmapSource(mat)</code> (또는 02차시에서 만든 변환기)가 <b>BGR 바이트를 그대로 넘기고</b> 화면에는 정상적인 색으로 나옵니다 — 우리가 채널 순서를 바꿔 줄 필요가 없습니다. 반대로 <code>System.Drawing</code> 이나 웹 API 로 데이터를 직접 넘길 때는 순서를 확인해야 합니다.' },
          { type: 'h', text: '흑백(Gray) 변환은 단순 평균이 아니다' },
          { type: 'p', html: '색을 하나의 밝기 값으로 줄일 때 <b>(R+G+B)/3</b> 을 쓰면 사람이 느끼는 밝기와 어긋납니다. 사람 눈은 초록에 가장 민감하고 파랑에 가장 둔감하기 때문입니다. 그래서 OpenCV 는 다음 <b>가중 평균</b>을 씁니다.' },
          { type: 'p', html: '<b>Gray = 0.299 × R + 0.587 × G + 0.114 × B</b> &nbsp;&nbsp;(계수의 합 = 1.000)' },
          { type: 'figure', html: FIG_GRAY, caption: '그림 2. 빨간 원 픽셀(B=37 G=37 R=196)의 Gray 값 계산 — 공식 84.5, CvtColor 85 (반올림 차이)' },
          { type: 'code', title: '예제 2: 공식을 직접 계산해 CvtColor 와 비교', code: EX_GRAY,
            desc: '공식 계산값과 <code>CvtColor</code> 결과가 <b>±1 안에서 일치</b>합니다. 차이는 OpenCV 가 속도를 위해 정수 연산(고정소수점)으로 계산하고 반올림하기 때문입니다. 중요한 관찰: <b>빨강 85 와 파랑 79 는 거의 같습니다</b> — 눈으로는 완전히 다른 색인데 흑백으로 바꾸면 구별이 안 됩니다. 이것이 다음 교시에서 HSV 를 배우는 이유입니다.',
            expect: '원본 채널 3 -> 회색 채널 1, 형식 CV_8UC1\n빨강 B=37 G=37 R=196 -> 공식 84.5, CvtColor 85\n초록 B=58 G=169 R=58 -> 공식 123.2, CvtColor 123\n파랑 B=187 G=84 R=28 -> 공식 79.0, CvtColor 79' },
          { type: 'table', head: ['부품', 'B', 'G', 'R', 'Gray', '메모'], rows: [
            ['빨간 원', '37', '37', '196', '<b>85</b>', 'R 이 커도 계수 0.299'],
            ['파란 삼각형', '187', '84', '28', '<b>79</b>', '빨강과 거의 같은 밝기!'],
            ['초록 사각형', '58', '169', '58', '123', 'G 계수 0.587 → 밝게'],
            ['노란 육각형', '38', '198', '220', '188', 'R + G 가 모두 큼 → 가장 밝다'],
            ['트레이 배경', '143', '145', '148', '145', '세 값이 비슷 = 무채색']
          ], caption: '표 1. 색이 다르면 Gray 값도 다를 것 같지만, 빨강과 파랑처럼 <b>밝기가 겹치는 색</b>이 흔하다' },
          { type: 'h', text: '채널 나누기: Cv2.Split · 합치기: Cv2.Merge' },
          { type: 'p', html: '<code>Cv2.Split</code> 은 3채널 Mat 을 <b>1채널 Mat 3장</b>으로 나눕니다(<code>Mat[]</code>). 각 장은 크기가 원본과 같고 화면에 띄우면 흑백으로 보입니다. 거꾸로 <code>Cv2.Merge</code> 는 1채널 여러 장을 한 장의 다채널 Mat 으로 합칩니다. Python 의 <code>cv2.split</code> / <code>cv2.merge</code> 와 같습니다.' },
          { type: 'code', title: '예제 3: 채널 분리 · 채널별 이미지 보기', code: EX_SPLIT,
            desc: '결과 창에 흑백 영상 3장이 나옵니다. <b>B 채널에서는 파란 삼각형이 밝게</b>, <b>R 채널에서는 빨간 원과 노란 육각형이 밝게</b> 보입니다. 즉 "어떤 채널에서 밝은가"만 봐도 대략적인 색 판단이 됩니다. 채널별 평균이 서로 비슷한 이유는 화면 대부분이 회색 트레이라서입니다.',
            expect: 'B(파랑) 채널: 크기 640x480, 채널 수 1, 평균 115.5\nG(초록) 채널: 크기 640x480, 채널 수 1, 평균 119.0\nR(빨강) 채널: 크기 640x480, 채널 수 1, 평균 120.9\n빨간 원 (120,110): Vec3b=(37,37,196) / 채널별=(37,37,196)' },
          { type: 'code', title: '예제 4: 한 채널을 0 으로 만든 뒤 다시 Merge', code: EX_MERGE,
            desc: 'R 채널을 <code>SetTo(0)</code> 으로 지운 뒤 합치면 빨간 원이 <b>검게</b> 변하고 결과 영상의 R 평균이 0 이 됩니다. 마지막의 <code>Cv2.Merge(new Mat[] { ch[2], ch[1], ch[0] }, swapped)</code> 는 순서를 뒤집어 <b>BGR → RGB</b> 를 만든 것과 같습니다 — 결과 창에서 보면 빨강과 파랑이 서로 바뀐 것처럼 보입니다.',
            expect: 'R 제거 후 (120,110) = 37,37,0\n원본 평균 BGR = 115.5, 119.0, 120.9\n결과 평균 BGR = 115.5, 119.0, 0.0' },
          { type: 'callout', kind: 'warn', title: 'Split 이 만든 Mat 은 직접 해제', html: '<code>Mat[] ch = Cv2.Split(img);</code> 는 <b>새 Mat 3개</b>를 만듭니다. <code>using var</code> 가 붙지 않으므로 다 쓴 뒤 <code>foreach (var m in ch) m.Dispose();</code> 로 해제하세요. 카메라 영상처럼 반복 안에서 Split 을 하면, 해제를 빼먹었을 때 메모리가 순식간에 불어납니다.' },
          { type: 'h', text: 'Gray → BGR: 색은 돌아오지 않지만 색을 그릴 수 있다' },
          { type: 'p', html: '흑백 영상(1채널)에는 <b>색을 그릴 수 없습니다</b> — 값이 하나뿐이니까요. <code>GRAY2BGR</code> 로 3채널로 바꾸면 B = G = R 인 회색 영상이 되고, 그 위에 빨간 사각형 · 노란 글자를 그릴 수 있습니다. 검사 결과를 표시하는 화면에서 아주 자주 쓰는 방법입니다.' },
          { type: 'code', title: '예제 5: 흑백 배경 + 컬러 오버레이', code: EX_OVERLAY,
            desc: 'ROI 로 일부만 원본 컬러를 덮어써서 "관심 영역만 컬러" 효과를 냈습니다. <code>new Mat(canvas, roi)</code> 는 <b>복사가 아니라 창</b>(03차시)이므로 여기에 <code>CopyTo</code> 하면 <code>canvas</code> 가 바뀝니다. 12차시에서는 이 방식으로 불량 부품만 빨간 테두리로 표시합니다.',
            expect: 'gray 채널 1 -> canvas 채널 3\n(120,110) canvas = 85,85,85 (B=G=R)\n강조 후 (120,110) = 37,37,196' },
          { type: 'table', head: ['ColorConversionCodes', '뜻', '입력 → 출력 채널'], rows: [
            ['<code>BGR2GRAY</code>', '컬러 → 흑백 (가중 평균)', '3 → 1'],
            ['<code>GRAY2BGR</code>', '흑백 → 3채널 (B=G=R)', '1 → 3'],
            ['<code>BGR2RGB</code>', '채널 순서 뒤집기', '3 → 3'],
            ['<code>BGR2HSV</code>', '색상 · 채도 · 명도 (2교시)', '3 → 3'],
            ['<code>BGR2Lab</code>', '밝기 L 과 색 a · b 분리', '3 → 3'],
            ['<code>BGR2BGRA</code>', '투명도(알파) 채널 추가', '3 → 4']
          ], caption: '표 2. 자주 쓰는 색 변환 코드 — Python 의 <code>cv2.COLOR_BGR2GRAY</code> 가 C# 에서는 <code>ColorConversionCodes.BGR2GRAY</code>' },
          { type: 'callout', kind: 'tip', title: 'ImRead 로 바로 흑백 읽기', html: '처음부터 흑백만 필요하면 <code>Cv2.ImRead("a.png", ImreadModes.Grayscale)</code> 로 읽는 것이 빠르고 메모리도 1/3 입니다. 반대로 <code>ImreadModes.Color</code> 는 흑백 PNG 도 <b>3채널로</b> 읽어 옵니다(B=G=R). 예제에서 채널 수가 예상과 다르면 ImRead 의 두 번째 인수를 먼저 확인하세요.' }
        ],
        practice: [
          {
            title: 'BGR → RGB 로 뒤집어 확인하기', level: 1,
            desc: '<code>Cv2.Split</code> 로 채널을 나눈 뒤 <b>순서를 뒤집어</b> <code>Cv2.Merge</code> 하세요. 같은 픽셀 (120, 110) 의 값이 <code>B=196 G=37 R=37</code> 처럼 뒤집혀야 합니다. 마지막으로 <code>Cv2.CvtColor(..., BGR2RGB)</code> 결과와 같은지 확인하세요.',
            hint: '<code>Cv2.Merge(new Mat[] { ch[2], ch[1], ch[0] }, rgb);</code> — 배열 순서만 바꾸면 됩니다. 확인은 <code>rgb.At&lt;Vec3b&gt;(110, 120)</code>.',
            expect: '원본 (120,110) B=37 G=37 R=196\n뒤집기 (120,110) 0번=196 1번=37 2번=37\nCvtColor(BGR2RGB) 결과와 다른 픽셀 수 = 0',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        Vec3b p = img.At<Vec3b>(110, 120);
        Console.WriteLine($"원본 (120,110) B={p.Item0} G={p.Item1} R={p.Item2}");

        Mat[] ch = Cv2.Split(img);
        using var rgb = new Mat();
        // TODO: ch 의 순서를 뒤집어 Cv2.Merge 로 rgb 를 만드세요

        // TODO: rgb 의 같은 픽셀 값을 출력해 뒤집혔는지 확인하세요

        foreach (var m in ch) m.Dispose();
        Cv2.ImShow("img", img);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        Vec3b p = img.At<Vec3b>(110, 120);
        Console.WriteLine($"원본 (120,110) B={p.Item0} G={p.Item1} R={p.Item2}");

        Mat[] ch = Cv2.Split(img);
        using var rgb = new Mat();
        Cv2.Merge(new Mat[] { ch[2], ch[1], ch[0] }, rgb);
        Vec3b q = rgb.At<Vec3b>(110, 120);
        Console.WriteLine($"뒤집기 (120,110) 0번={q.Item0} 1번={q.Item1} 2번={q.Item2}");

        using var rgb2 = new Mat();
        Cv2.CvtColor(img, rgb2, ColorConversionCodes.BGR2RGB);
        using var diff = new Mat();
        Cv2.Absdiff(rgb, rgb2, diff);
        Console.WriteLine($"CvtColor(BGR2RGB) 결과와 다른 픽셀 수 = {Cv2.CountNonZero(diff.CvtColor(ColorConversionCodes.BGR2GRAY))}");

        foreach (var m in ch) m.Dispose();
        Cv2.ImShow("rgb", rgb);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '어느 채널이 파란 삼각형을 가장 잘 드러내나', level: 2,
            desc: '세 채널의 <b>평균 · 표준편차</b>를 구하고, 파란 삼각형 픽셀 (130, 300) 과 트레이 배경 (350, 60) 의 <b>차이(물체 − 배경)</b>를 채널별로 출력하세요. 차이의 <b>절댓값이 가장 큰 채널</b>이 파란 물체를 골라내기에 가장 좋은 채널입니다. 부호도 함께 보세요 — 부호가 − 이면 그 채널에서 물체가 배경보다 <b>어둡다</b>(이진화할 때 <code>BinaryInv</code>)는 뜻입니다.',
            hint: '<code>Cv2.MeanStdDev(ch[i], out Scalar m, out Scalar sd);</code> 로 평균과 표준편차를 한 번에 얻습니다. 차이는 <code>ch[i].At&lt;byte&gt;(300, 130) - ch[i].At&lt;byte&gt;(60, 350)</code> — <code>Math.Abs</code> 로 크기를 비교하세요.',
            expect: 'B 채널: 평균 115.5 표준편차 42.7 | 삼각형 187 - 배경 143 = 44\nG 채널: 평균 119.0 표준편차 41.7 | 삼각형 84 - 배경 145 = -61\nR 채널: 평균 120.9 표준편차 48.3 | 삼각형 28 - 배경 148 = -120\n절댓값이 가장 큰 채널 = R (-120): 파란 물체는 R 채널에서 가장 어둡다\nB 채널에서는 +44 로 배경보다 밝다 -> 어느 쪽이든 차이가 크면 골라낼 수 있다',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        Mat[] ch = Cv2.Split(img);
        string[] names = { "B", "G", "R" };
        for (int i = 0; i < 3; i++)
        {
            // TODO: Cv2.MeanStdDev 로 평균 · 표준편차를 구해 출력하세요

            // TODO: 파란 삼각형 (130,300) 과 배경 (350,60) 의 값 차이를 출력하세요
            Console.WriteLine($"{names[i]} 채널");
        }
        foreach (var m in ch) m.Dispose();
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        Mat[] ch = Cv2.Split(img);
        string[] names = { "B", "G", "R" };
        for (int i = 0; i < 3; i++)
        {
            Cv2.MeanStdDev(ch[i], out Scalar m, out Scalar sd);
            int tri = ch[i].At<byte>(300, 130);
            int bg = ch[i].At<byte>(60, 350);
            Console.WriteLine($"{names[i]} 채널: 평균 {m.Val0:F1} 표준편차 {sd.Val0:F1} | 삼각형 {tri} - 배경 {bg} = {tri - bg}");
        }
        Console.WriteLine("절댓값이 가장 큰 채널 = R (-120): 파란 물체는 R 채널에서 가장 어둡다");
        Console.WriteLine("B 채널에서는 +44 로 배경보다 밝다 -> 어느 쪽이든 차이가 크면 골라낼 수 있다");
        foreach (var m in ch) m.Dispose();
    }
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '색 공간 (1) BGR 채널과 흑백 변환', subtitle: '컬러 영상은 숫자판 세 장', notes: '<p>💬 “빨간 사과와 파란 컵을 흑백 사진으로 찍으면 구별할 수 있을까요?” — 오늘 첫 예제에서 빨강 85, 파랑 79 라는 결과로 직접 확인합니다. 이 차시의 목표: 색을 숫자로 다루기. (2분)</p>' },
          { layout: 'image', title: '오늘의 재료: sample_color.png', src: 'images/sample_color.png', caption: '회색 트레이 위 7색 부품 10개 — 빨강 2 · 초록 2 · 파랑 2 · 노랑 · 보라 · 청록 · 주황', notes: '<p>결과 창에서 마우스를 올려 픽셀 값을 보여 줍니다. 💬 “빨간 원 위의 값이 (37, 37, 196) 인데 어느 것이 빨강일까요?” — 세 번째. BGR 순서를 여기서 각인시킵니다. (3분)</p>' },
          { layout: 'diagram', title: '컬러 Mat 의 메모리 배치', html: FIG_CHANNELS, caption: '픽셀마다 B G R 3바이트가 이어진다 → Split 으로 1채널 3장, Merge 로 되돌리기', notes: '<p>03차시의 “행 × 열 표” 그림과 이어서 설명합니다. 핵심: ① 픽셀 하나 = 3바이트 ② Split 결과는 <b>크기가 같은</b> 1채널 3장 ③ Merge 는 순서대로 넣는다. 💬 “Split 결과를 화면에 띄우면 무슨 색으로 보일까?” — 흑백. (5분)</p>' },
          { layout: 'code', title: '예제: 픽셀의 B · G · R 읽기', code: S_PIXEL, points: ['<code>At&lt;Vec3b&gt;(y, x)</code> — (행, 열) 순서', '<code>Item0</code>=B, <code>Item1</code>=G, <code>Item2</code>=R', '세 값이 비슷하면 무채색(회색)'], notes: '<p>실행하고 값을 읽어 줍니다. 빨간 원 (37, 37, 196) / 트레이 (143, 145, 148). 💬 “트레이는 왜 세 값이 거의 같을까?” — 회색이니까. 학생들에게 좌표를 바꿔 다른 부품 값을 찍어 보게 합니다(초록 사각형 270,120). (7분)</p>' },
          { layout: 'diagram', title: 'Gray = 0.299R + 0.587G + 0.114B', html: FIG_GRAY, caption: '사람 눈의 민감도를 반영한 가중 평균 — 계수의 합은 1', notes: '<p>왜 단순 평균이 아닌지 설명합니다: 눈은 초록에 민감, 파랑에 둔감. 계수 3개를 외우게 하지는 말고 “G 가 가장 크다”만 기억시킵니다. 💬 “(R+G+B)/3 로 하면 무엇이 이상해질까?” — 파란 하늘이 너무 밝아진다. (5분)</p>' },
          { layout: 'code', title: '예제: 공식 vs CvtColor', code: S_GRAY, points: ['<code>ColorConversionCodes.BGR2GRAY</code> → 1채널', '공식 84.5 · CvtColor 85 (반올림 차이)', '빨강 85 와 파랑 79 — 흑백에서는 거의 같다!'], notes: '<p>여기가 이 교시의 핵심 장면입니다. 두 색의 Gray 값이 겹친다는 사실에서 “그러면 색으로 구분해야 한다” → 2교시 HSV 예고. 💬 “흑백 카메라로 빨강/파랑 부품을 분류할 수 있을까?” — 어렵다. (7분)</p>' },
          { layout: 'table', title: '색별 BGR 과 Gray', head: ['부품', 'B', 'G', 'R', 'Gray'], rows: [
            ['빨간 원', '37', '37', '196', '<b>85</b>'],
            ['파란 삼각형', '187', '84', '28', '<b>79</b>'],
            ['초록 사각형', '58', '169', '58', '123'],
            ['노란 육각형', '38', '198', '220', '188'],
            ['트레이', '143', '145', '148', '145']
          ], lead: '표의 빨강 · 파랑 줄을 비교해 보세요', notes: '<p>표를 보며 계산을 한 번 더 확인합니다. 노란 육각형이 가장 밝은 이유(R + G 둘 다 큼)를 물어봅니다. 💬 “가장 어두운 색은?” — 파랑. (3분)</p>' },
          { layout: 'code', title: '예제: Split → 채널 보기 → Merge', code: S_SPLIT, points: ['<code>Cv2.Split</code> → <code>Mat[]</code> 3장 (1채널)', '<code>SetTo(0)</code> 으로 채널 하나 지우기', '<code>Cv2.Merge(ch, dst)</code> 로 되돌리기', '다 쓰면 <code>Dispose()</code> 잊지 말기'], notes: '<p>B 채널을 지우면 파란 삼각형이 검게, 노란 육각형은 거의 그대로(B 가 작으니까) 남습니다. 💬 “R 을 지우면 어떤 부품이 사라질까?” — 빨간 원 · 주황 막대. 학생들이 직접 채널 번호를 바꿔 실행하게 합니다. (8분)</p>' },
          { layout: 'code', title: '예제: 흑백 위에 컬러 오버레이', code: S_OVERLAY, points: ['1채널에는 색을 그릴 수 없다', '<code>GRAY2BGR</code> → B=G=R 3채널', 'ROI 에 CopyTo 하면 그 부분만 컬러', '검사 결과 표시의 기본 기법'], notes: '<p>“색 정보가 되살아나는 것은 아니다”를 분명히 합니다(정보는 이미 버려졌다). 결과 창에서 노란 테두리가 그려지는 것을 보여 주고, 12차시의 불량 표시 화면을 예고합니다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: 'BGR = (37, 37, 196) 인 빨간 픽셀의 Gray 값은 약 얼마?', options: ['약 37', '약 85', '약 196', '약 255'], answer: 1, explain: '0.299×196 + 0.587×37 + 0.114×37 = 84.5 → 85. R 이 커도 계수가 0.299 뿐입니다.', notes: '<p>정답 2번. 계산을 칠판에 한 줄로 적어 보여 줍니다. 196 × 0.3 ≈ 59 라는 어림 계산만으로도 답이 나온다는 것을 알려 줍니다.</p>' },
          { layout: 'practice', title: '실습: BGR → RGB 뒤집기', desc: '<p><code>Cv2.Split</code> 로 나눈 배열의 <b>순서를 바꿔</b> <code>Cv2.Merge</code> 하세요.</p><ul><li>(120, 110) 값이 <code>196, 37, 37</code> 로 뒤집혀야 한다</li><li><code>CvtColor(BGR2RGB)</code> 결과와 같은지 비교</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        Mat[] ch = Cv2.Split(img);
        using var rgb = new Mat();
        // TODO: 순서를 뒤집어 Merge

        foreach (var m in ch) m.Dispose();
        Cv2.ImShow("img", img);
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        Mat[] ch = Cv2.Split(img);
        using var rgb = new Mat();
        Cv2.Merge(new Mat[] { ch[2], ch[1], ch[0] }, rgb);
        Vec3b q = rgb.At<Vec3b>(110, 120);
        Console.WriteLine($"{q.Item0} {q.Item1} {q.Item2}");
        foreach (var m in ch) m.Dispose();
        Cv2.ImShow("rgb", rgb);
        Cv2.WaitKey(0);
    }
}`, notes: '<p>결과 창에서 빨간 원이 파랗게, 파란 삼각형이 빨갛게 보이는 것을 함께 확인합니다. 이것이 “인터넷에서 받은 코드에서 색이 뒤집혀 보이는” 흔한 버그의 정체라고 알려 줍니다. (7분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['컬러 Mat = <code>CV_8UC3</code>, 픽셀마다 <b>B G R</b> 3바이트', '<code>At&lt;Vec3b&gt;</code> 의 <code>Item0/1/2</code> = B/G/R', 'Gray = <b>0.299R + 0.587G + 0.114B</b> — 빨강과 파랑의 밝기가 겹칠 수 있다', '<code>Cv2.Split</code> → 1채널 3장 (다 쓰면 Dispose) · <code>Cv2.Merge</code> → 합치기', '<code>GRAY2BGR</code> 로 3채널을 만들면 흑백 위에 컬러로 그릴 수 있다', '다음 교시: 색을 다루기 쉬운 <b>HSV</b> 와 <code>Cv2.InRange</code> 색 검출'], notes: '<p>다섯 줄을 학생들이 읽게 합니다. 다음 시간 예고: “빨강만 골라내는 프로그램을 3줄로 만든다.” (2분)</p>' }
        ]
      },
      {
        id: 'cs05-2', title: 'HSV 와 색 검출 (InRange)', minutes: 50,
        goals: ['HSV 의 H · S · V 뜻과 OpenCV 의 값 범위를 설명할 수 있다', 'Cv2.InRange 로 색 마스크를 만들고 빨강의 두 구간을 합칠 수 있다', '색 마스크로 개수를 세고 해당 색만 남기는 프로그램을 쓸 수 있다'],
        flow: [['도입: BGR 로 색 고르기의 어려움', 7], ['HSV 와 InRange', 16], ['색별 개수 세기 실습', 19], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: 'BGR 로 "빨강"을 고르기 어려운 이유' },
          { type: 'p', html: '"빨간 부품만 찾아라"를 BGR 로 쓰면 <code>R &gt; 150 &amp;&amp; G &lt; 80 &amp;&amp; B &lt; 80</code> 같은 조건이 됩니다. 그런데 조명이 조금 어두워지면 R 이 120 으로 떨어져 검출이 실패하고, 반대로 밝으면 흰색까지 빨강으로 잡힙니다. <b>색(빨강이라는 성질)과 밝기가 세 값에 뒤섞여 있기 때문</b>입니다. 그래서 <b>색 · 진하기 · 밝기를 따로 떼어 놓은</b> 좌표계가 필요합니다 — 그것이 HSV 입니다.' },
          { type: 'image', src: 'images/color_caps.png', caption: 'images/color_caps.png — 어두운 컨베이어 위 병뚜껑 20개 (빨강 5 · 초록 4 · 파랑 3 · 노랑 6 · 흰색 2). 이 차시의 목표는 이 개수를 자동으로 세는 것' },
          { type: 'figure', html: FIG_HSV, caption: '그림 3. HSV 원기둥 — 둘레 각도 H(색상), 중심에서의 거리 S(채도), 높이 V(명도)' },
          { type: 'table', head: ['성분', '뜻', 'OpenCV 8비트 범위', '메모'], rows: [
            ['<b>H</b> (Hue)', '색상 — 빨강 · 노랑 · 초록 … 색상환의 각도', '<b>0 ~ 179</b>', '360° ÷ 2 (8비트에 담기 위해)'],
            ['<b>S</b> (Saturation)', '채도 — 색이 진한 정도', '0 ~ 255', '0 = 무채색(회색), 255 = 순색'],
            ['<b>V</b> (Value)', '명도 — 밝은 정도', '0 ~ 255', '0 = 검정. 조명 변화는 주로 여기에']
          ], caption: '표 3. <code>Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV)</code> 의 결과 값 범위' },
          { type: 'code', title: '예제 1: 뚜껑 색의 HSV 값 보기', code: EX_HSV,
            desc: '빨강 H=0, 노랑 H=25, 초록 H=62, 파랑 H=108 — <b>색마다 H 값이 확실히 다릅니다</b>. 반면 흰 뚜껑은 S=5 로 채도가 거의 없어 H(=90)에는 의미가 없습니다. 어두운 배경은 V=34 로 아주 작습니다. 이 네 줄의 숫자가 다음 예제의 InRange 범위를 정하는 근거입니다.',
            expect: '색      BGR              H    S    V\n빨강 뚜껑   ( 41, 40,198)     0  203  198\n초록 뚜껑   ( 59,159, 51)    62  173  159\n파랑 뚜껑   (191, 92, 30)   108  215  191\n노랑 뚜껑   ( 39,195,226)    25  211  226\n흰 뚜껑    (225,225,221)    90    5  225\n컨베이어 배경 ( 30, 30, 34)     0   30   34' },
          { type: 'callout', kind: 'warn', title: 'H 는 0~179 입니다', html: '그림판 · 포토샵 · 웹 CSS 는 H 를 <b>0~360</b> 으로 씁니다. OpenCV 는 8비트에 담으려고 <b>절반(0~179)</b> 으로 씁니다. 인터넷에서 찾은 "초록은 H 120" 같은 값을 그대로 쓰면 범위를 벗어나므로 <b>÷2</b> 를 해서 60 으로 바꿔야 합니다. (<code>CV_32F</code> 로 변환하면 0~360 을 쓸 수 있지만 수업에서는 8비트를 씁니다.)' },
          { type: 'h', text: 'Cv2.InRange: 범위 안이면 255, 밖이면 0' },
          { type: 'p', html: '<code>Cv2.InRange(src, lower, upper, mask)</code> 는 <b>세 채널 모두</b> 범위 안에 들어오는 픽셀만 255(흰색), 나머지는 0(검정)으로 만든 <b>1채널 마스크</b>(<code>CV_8UC1</code>)를 돌려줍니다. HSV 로 바꾼 뒤 <code>new Scalar(H최소, S최소, V최소)</code> ~ <code>new Scalar(H최대, S최대, V최대)</code> 를 주면 그것이 곧 "이 색 찾기"입니다.' },
          { type: 'code', title: '예제 2: 초록 마스크 만들고 개수 세기', code: EX_INRANGE,
            desc: '초록 뚜껑 4개의 중심 좌표까지 정확히 나옵니다(정답: 초록 4개). <code>Cv2.ConnectedComponentsEx</code> 는 흰 덩어리마다 면적 · 외곽 사각형 · 중심을 한 번에 돌려줍니다(12차시에서 자세히). <b>0번 라벨은 배경</b>이므로 건너뛰고, 잡티를 걸러 내려고 <code>면적 300 이상</code> 조건을 넣었습니다 — 뚜껑 하나의 면적은 약 2500 px 입니다.',
            expect: '마스크 형식 CV_8UC1, 흰 픽셀 10063 / 전체 307200\n  #1 면적 2520 중심 (119, 130)\n  #2 면적 2516 중심 (265, 383)\n  #3 면적 2511 중심 (522, 424)\n  #4 면적 2516 중심 (190, 434)\n초록 뚜껑 4 개' },
          { type: 'callout', kind: 'tip', title: 'S · V 의 아래 한계가 중요하다', html: '<code>new Scalar(40, 100, 70)</code> 의 <b>100</b> 과 <b>70</b> 이 핵심입니다. S 의 아래 한계(100)는 <b>회색 배경</b>을 걸러 주고, V 의 아래 한계(70)는 <b>어두운 그림자</b>를 걸러 줍니다. 두 값을 0 으로 바꿔 실행해 보면 마스크가 온통 흰색으로 번지는 것을 볼 수 있습니다 — 색 검출이 실패하면 거의 항상 S · V 의 아래 한계를 조절해서 해결합니다.' },
          { type: 'h', text: '빨강은 구간이 둘이다' },
          { type: 'figure', html: FIG_HUE, caption: '그림 4. H 축과 색 구간 — 색상환이 둥글어서 빨강만 양쪽 끝(0~10, 170~179)에 걸린다' },
          { type: 'code', title: '예제 3: 두 구간 마스크를 BitwiseOr 로 합치기', code: EX_RED,
            desc: '이 영상에서는 빨강의 대부분이 H ≈ 0 쪽에 있고 위 구간에는 106 px 만 걸쳐 있어 개수 결과는 같습니다. 하지만 <b>조명 색온도가 조금 바뀌거나 자홍빛 조명을 쓰면</b> 빨강의 H 가 175 쪽으로 밀려 아래 구간만으로는 하나도 못 찾을 수 있습니다. 그래서 빨강은 <b>습관적으로 두 구간을 OR</b> 하는 것이 안전합니다. <code>Cv2.BitwiseOr</code> 는 두 마스크 중 하나라도 흰 곳을 흰색으로 만듭니다.',
            expect: '아래 구간 12821 px + 위 구간 106 px = OR 12927 px\n아래 구간만 쓰면 5 개, 두 구간 OR 이면 5 개' },
          { type: 'h', text: '색별로 개수 세기 (검사 프로그램의 기본형)' },
          { type: 'code', title: '예제 4: 5색 병뚜껑 개수 세기', code: EX_COUNT,
            desc: '정답(빨강 5 · 초록 4 · 파랑 3 · 노랑 6 · 흰색 2 = 20개)과 정확히 일치합니다. 색마다 <b>범위 표(lo · hi 배열)</b>를 두고 같은 처리를 반복하는 구조에 주목하세요 — 실제 검사 장비 프로그램도 이렇게 색 규격을 표로 관리합니다. 흰색은 H 를 전부 열어 두고(<code>0~179</code>) <b>S ≤ 40, V ≥ 180</b> 으로 잡았습니다.',
            expect: 'red     5 개\nyellow  6 개\ngreen   4 개\nblue    3 개\nwhite   2 개\n합계 20 개' },
          { type: 'callout', kind: 'warn', title: '흰색 · 검정 · 회색은 H 로 찾을 수 없다', html: '무채색은 채도 S 가 거의 0 이라 H 값이 <b>잡음처럼 아무 값</b>이나 나옵니다(예제 1 의 흰 뚜껑 H=90 은 우연입니다). 따라서 흰색은 <code>S 작고 V 큼</code>, 검정은 <code>V 작음</code>, 회색은 <code>S 작고 V 중간</code> 으로 판정하세요. 색 검사에서 "흰색만 자꾸 엉뚱하게 잡힌다"는 문제는 대부분 이것 때문입니다.' },
          { type: 'h', text: '마스크로 그 색만 남기기' },
          { type: 'code', title: '예제 5: BitwiseAnd 로 노란 뚜껑만 남기기', code: EX_BITAND,
            desc: '<code>Cv2.BitwiseAnd(img, img, only, mask)</code> 는 <b>마스크가 흰 픽셀만 원본에서 복사</b>하고 나머지는 0 으로 둡니다(같은 영상을 두 번 넘기는 관용적 표현입니다). <code>Cv2.Mean(img, mask)</code> 처럼 <b>마스크를 준 평균</b>은 그 색 영역의 평균색을 알려 주므로, 색 규격을 정할 때 아주 유용합니다. <code>Cv2.BitwiseNot</code> 으로 반전하면 "그 색을 뺀 나머지"가 됩니다.',
            expect: '노랑 픽셀 15579 px\n원본 평균 밝기 49.2, 노랑만 남긴 영상 평균 1.9\n마스크 안 평균색 BGR = 38, 179, 205\n반전 마스크 흰 픽셀 291621 px' },
          { type: 'h', text: '조명이 바뀌어도 되는 이유 · Lab 색 공간' },
          { type: 'code', title: '예제 6: 조명을 55% 로 줄여도 같은 범위로 검출', code: EX_LIGHT,
            desc: '밝기를 55% 로 줄였는데도 빨강 뚜껑의 <b>H 는 0 그대로, S 는 203 → 204</b> 이고 V 만 198 → 109 로 떨어집니다. 그래서 <b>같은 H · S 범위</b>로 5개가 그대로 검출됩니다(V 의 아래 한계만 50 으로 조금 낮췄습니다). 만약 BGR 조건(<code>R &gt; 150</code>)을 썼다면 R 이 109 로 떨어져 전부 놓쳤을 것입니다.',
            expect: '원본 평균 밝기 49.2 -> 어두운 영상 27.1\n원본: 빨강 뚜껑 HSV=(0,203,198) -> 같은 H 범위로 5 개\n55% 조명: 빨강 뚜껑 HSV=(0,204,109) -> 같은 H 범위로 5 개\nLab 빨강 뚜껑: L=112 a=188 b=168' },
          { type: 'callout', kind: 'more', title: 'Lab 색 공간 — 색 차이를 재고 싶을 때', html: '<code>BGR2Lab</code> 은 <b>L</b>(밝기 0~255) 과 <b>a</b>(초록↔빨강), <b>b</b>(파랑↔노랑) 로 나눕니다. HSV 처럼 밝기를 분리하면서, 두 색 사이 거리 √((ΔL)² + (Δa)² + (Δb)²) 가 <b>사람이 느끼는 색 차이에 비례</b>한다는 장점이 있습니다. 그래서 색 규격 관리 · 화이트밸런스 · ΔE 색차 계산에는 Lab 을, 단순한 색 검출에는 HSV 를 씁니다. (8비트 Lab 은 a · b 에 128 이 더해져 저장되므로 128 이 중립입니다.)' },
          { type: 'callout', kind: 'wpf', title: 'WPF 앱에서 색 범위를 조절하게 만들기', html: '색 범위는 현장 조명에 따라 조금씩 바꿔야 합니다. WPF 에서는 H · S · V 최소/최대를 <b><code>Slider</code> 6개</b>로 만들고 <code>ValueChanged</code> 에서 InRange → 마스크 <code>Image</code> 갱신을 하면 학생들이 브라우저에서 값을 바꿔 실행하는 것과 같은 도구가 됩니다. 16차시의 이미지 처리 스튜디오에서 이 화면을 직접 만듭니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '오개념 지도 · 평가 포인트', html: '<ul><li>가장 흔한 오개념: <b>“H 는 0~360”</b> → 인터넷 값을 ÷2. 실습 중 마스크가 비면 먼저 이것을 확인시킵니다.</li><li>두 번째: <b>“InRange 는 색만 본다”</b> → S · V 의 아래 한계가 배경/그림자를 거른다는 것을 강조.</li><li>세 번째: <b>“흰색도 H 로 찾는다”</b> → 무채색은 S 로 판정.</li><li>평가 루브릭(3점): ① 색별 개수가 정답과 일치(1) ② 빨강을 두 구간으로 처리(1) ③ 면적 조건으로 잡티를 걸러 냄(1).</li><li>💬 마무리 발문: “조명이 노랗게 변하는 공장에서 흰 뚜껑과 노란 뚜껑을 어떻게 구분할까?” — S 값 비교 · 화이트밸런스 보정(Lab) 이야기로 연결.</li></ul>' }
        ],
        practice: [
          {
            title: '노란 뚜껑만 세기', level: 1,
            desc: 'HSV 로 바꾼 뒤 <b>노랑(H 20~35)</b> 마스크를 만들고, 면적 300 이상인 덩어리 개수를 출력하세요. 정답은 <b>6개</b>입니다. 개수가 맞으면 H 범위를 <code>15~40</code> 으로 넓혀 보고 주황빛 잡티가 섞이는지 확인해 보세요.',
            hint: '<code>Cv2.InRange(hsv, new Scalar(20, 100, 70), new Scalar(35, 255, 255), mask);</code> 다음에 <code>Cv2.ConnectedComponentsEx(mask)</code> 의 <code>Blobs</code> 를 돌면서 <code>b.Label != 0 &amp;&amp; b.Area &gt;= 300</code> 인 것을 셉니다.',
            expect: '마스크 흰 픽셀 15579\n노란 뚜껑 6 개',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);
        using var mask = new Mat();
        // TODO: 노랑(H 20~35) 마스크를 만드세요

        // TODO: ConnectedComponentsEx 로 면적 300 이상 덩어리 수를 세어 출력하세요
        Console.WriteLine($"마스크 흰 픽셀 {Cv2.CountNonZero(mask)}");   // 아직 0 입니다
        Cv2.ImShow("input", img);            // 마스크를 만들었으면 mask 로 바꿔 보세요
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);
        using var mask = new Mat();
        Cv2.InRange(hsv, new Scalar(20, 100, 70), new Scalar(35, 255, 255), mask);

        var cc = Cv2.ConnectedComponentsEx(mask);
        int n = 0;
        foreach (var b in cc.Blobs)
            if (b.Label != 0 && b.Area >= 300) n++;
        Console.WriteLine($"마스크 흰 픽셀 {Cv2.CountNonZero(mask)}");
        Console.WriteLine($"노란 뚜껑 {n} 개");
        Cv2.ImShow("mask", mask);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '흰 뚜껑 찾아 표시하기', level: 2,
            desc: '흰 뚜껑 <b>2개</b>를 찾아 중심 좌표를 출력하고, 원본 영상에 <code>Cv2.Circle</code> 로 표시해 보여 주세요. 흰색은 <b>채도 S 가 작고 명도 V 가 큰</b> 픽셀입니다 — H 는 전부(0~179) 열어 둡니다.',
            hint: '<code>Cv2.InRange(hsv, new Scalar(0, 0, 180), new Scalar(179, 40, 255), mask);</code> 로 시작해 보세요. S 상한(40)을 80 으로 올리면 무엇이 섞이는지도 확인해 보세요. 표시는 <code>Cv2.Circle(img, new Point((int)b.Centroid.X, (int)b.Centroid.Y), 34, new Scalar(0, 0, 255), 2);</code>.',
            expect: '흰 뚜껑 #1 중심 (581, 69) 면적 2112\n흰 뚜껑 #2 중심 (423, 226) 면적 2230\n흰 뚜껑 2 개',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);
        using var mask = new Mat();
        // TODO: 흰색 조건(S 작고 V 큼)으로 마스크를 만드세요

        // TODO: 덩어리를 돌면서 중심 좌표를 출력하고 img 에 원을 그리세요
        Cv2.ImShow("result", img);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);
        using var mask = new Mat();
        Cv2.InRange(hsv, new Scalar(0, 0, 180), new Scalar(179, 40, 255), mask);

        var cc = Cv2.ConnectedComponentsEx(mask);
        int n = 0;
        foreach (var b in cc.Blobs)
        {
            if (b.Label == 0 || b.Area < 300) continue;
            n++;
            int cx = (int)b.Centroid.X, cy = (int)b.Centroid.Y;
            Console.WriteLine($"흰 뚜껑 #{n} 중심 ({cx}, {cy}) 면적 {b.Area}");
            Cv2.Circle(img, new Point(cx, cy), 34, new Scalar(0, 0, 255), 2);
        }
        Console.WriteLine($"흰 뚜껑 {n} 개");
        Cv2.ImShow("result", img);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '색 공간 (2) HSV 와 색 검출', subtitle: 'Cv2.InRange 로 “빨강만 찾기”', notes: '<p>1교시 결론(빨강 85, 파랑 79 — 흑백으로는 구분 불가)을 상기시키며 시작합니다. 💬 “컨베이어 위 병뚜껑을 색별로 세는 프로그램, 몇 줄이면 될까요?” — 오늘 20줄로 만듭니다. (2분)</p>' },
          { layout: 'image', title: '오늘의 과제: 색별 개수 세기', src: 'images/color_caps.png', caption: '병뚜껑 20개 — 정답: 빨강 5 · 초록 4 · 파랑 3 · 노랑 6 · 흰색 2', notes: '<p>학생들에게 눈으로 세어 보게 합니다(30초). 답을 칠판에 적어 두고 프로그램 결과와 비교할 것이라고 예고합니다. 흰 뚜껑 2개가 어디 있는지도 찾아보게 합니다. (4분)</p>' },
          { layout: 'bullets', title: 'BGR 로 색을 고르면 왜 힘든가', lead: '<code>R &gt; 150 &amp;&amp; G &lt; 80 &amp;&amp; B &lt; 80</code> 의 문제', bullets: [
            '조명이 어두워지면 R 이 120 으로 떨어져 <b>놓친다</b>',
            '조명이 밝으면 흰색까지 <b>빨강으로 잡는다</b>',
            '근본 원인: <b>색 + 밝기가 세 값에 뒤섞여</b> 있다',
            ['해결: 색 · 진하기 · 밝기를 <b>분리한 좌표계</b>', ['HSV — 색 검출용', 'Lab — 색 차이 계산용']]
          ], notes: '<p>실제 현장 이야기를 곁들입니다: 낮/밤, 형광등 교체, 먼지로 인한 조도 저하. 💬 “조명이 절반으로 어두워지면 BGR 세 값은 어떻게 될까?” — 모두 절반. 그래서 비율(색)은 남는다 → HSV 로 연결. (5분)</p>' },
          { layout: 'diagram', title: 'HSV 원기둥', html: FIG_HSV, caption: 'H = 둘레 각도(색상) · S = 중심에서의 거리(채도) · V = 높이(명도)', notes: '<p>원기둥을 손으로 가리키며 설명합니다: 위에서 보면 색상환, 중심은 회색, 위로 갈수록 밝다. 핵심 한 줄: <b>“조명이 바뀌면 V 만 움직인다.”</b> 💬 “분홍색은 빨강과 H 가 같을까?” — 거의 같고 S 가 낮다. (5분)</p>' },
          { layout: 'table', title: 'OpenCV 의 HSV 범위', head: ['성분', '뜻', '범위'], rows: [
            ['H', '색상 (색상환 각도)', '<b>0 ~ 179</b> (360° ÷ 2)'],
            ['S', '채도 (진한 정도)', '0 ~ 255 (0 = 회색)'],
            ['V', '명도 (밝기)', '0 ~ 255 (0 = 검정)']
          ], lead: '가장 자주 하는 실수: H 를 0~360 으로 쓰기', notes: '<p>여기서 반드시 강조: 웹/포토샵의 H 값을 ÷2. “초록 120° → OpenCV 60”. 학생들이 나중에 스스로 디버깅할 수 있는 지식입니다. (3분)</p>' },
          { layout: 'code', title: '예제: 뚜껑 색의 HSV 값', code: S_HSV, points: ['빨강 H=0 · 노랑 25 · 초록 62 · 파랑 108', '흰 뚜껑은 <b>S=5</b> → H 는 의미 없음', '이 숫자가 InRange 범위의 근거'], notes: '<p>실행 후 값을 읽어 줍니다. 💬 “흰 뚜껑의 H 가 90 인데 이걸 청록이라고 해도 될까?” — 아니다, S 가 5 라 색이 없다. 무채색 판정 규칙을 여기서 심어 둡니다. (6분)</p>' },
          { layout: 'code', title: '예제: InRange 로 색 마스크 + 개수', code: S_MASK, points: ['<code>InRange</code> → 1채널 마스크(255/0)', 'S · V 의 <b>아래 한계</b>가 배경 · 그림자를 거른다', '<code>ConnectedComponentsEx</code> → 덩어리마다 면적 · 중심', '0번 라벨은 배경, 면적 조건으로 잡티 제거'], notes: '<p>파랑 3개가 나오는 것을 정답과 맞춰 봅니다. S 하한을 0 으로 바꿔 실행해 마스크가 번지는 것을 시연하면 효과가 큽니다. 💬 “면적 300 조건을 없애면?” — 잡티가 세어진다. (7분)</p>' },
          { layout: 'diagram', title: '빨강은 구간이 둘', html: FIG_HUE, caption: '색상환이 둥글어서 빨강만 0~10 과 170~179 양쪽에 걸린다', notes: '<p>원형 축을 한 번 더 강조합니다. 💬 “왜 초록은 구간이 하나일까?” — 축 가운데에 있으니까. 실무 팁: 빨강은 습관적으로 두 구간 OR. (4분)</p>' },
          { layout: 'code', title: '예제: 두 구간을 BitwiseOr', code: S_RED, points: ['마스크 2장을 각각 만든 뒤 합친다', '<code>Cv2.BitwiseOr</code> — 하나라도 흰 곳은 흰색', '이 영상은 위 구간이 106 px 뿐이지만…', '조명 색이 바뀌면 위 구간이 주력이 된다'], notes: '<p>정직하게 설명합니다: 이 영상에서는 개수가 같다. 하지만 색온도가 바뀐 영상에서는 아래 구간만으로 0개가 될 수 있다 → 안전한 습관. (5분)</p>' },
          { layout: 'code', title: '예제: 5색 개수 세기 (검사 프로그램의 기본형)', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);
        string[] names = { "yellow", "green", "blue" };
        Scalar[] lo = { new Scalar(20, 100, 70), new Scalar(40, 100, 70), new Scalar(100, 100, 70) };
        Scalar[] hi = { new Scalar(35, 255, 255), new Scalar(80, 255, 255), new Scalar(130, 255, 255) };
        for (int i = 0; i < names.Length; i++)
        {
            using var mask = new Mat();
            Cv2.InRange(hsv, lo[i], hi[i], mask);
            var cc = Cv2.ConnectedComponentsEx(mask);
            int n = 0;
            foreach (var b in cc.Blobs) if (b.Label != 0 && b.Area >= 300) n++;
            Console.WriteLine($"{names[i],-7} {n} 개");
        }
    }
}`, points: ['색 규격을 <b>배열(표)</b> 로 관리 → 같은 코드 반복', '빨강만 두 구간 OR 을 추가', '흰색은 <code>S ≤ 40, V ≥ 180</code>', '결과가 정답(6 · 4 · 3)과 일치'], notes: '<p>본문 예제 4 의 축약판입니다. 실제 장비 프로그램도 색 규격을 표(또는 설정 파일)로 관리한다는 점을 강조합니다. 학생들에게 빨강 · 흰색 줄을 직접 추가하게 하면 그대로 실습이 됩니다. (7분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '흰색 물체를 HSV 로 고르는 알맞은 조건은?', options: ['H 가 0 근처', 'S 가 크고 V 가 작다', 'S 가 작고 V 가 크다', 'H 가 90 근처'], answer: 2, explain: '무채색은 H 에 의미가 없습니다. 흰색 = 채도 S 거의 0 + 명도 V 큼 → <code>Scalar(0,0,180) ~ Scalar(179,40,255)</code>.', notes: '<p>정답 3번. 4번을 고른 학생이 있으면 예제 1 의 흰 뚜껑 H=90 이 “우연”이라는 점을 다시 설명합니다.</p>' },
          { layout: 'practice', title: '실습: 흰 뚜껑 찾아 표시하기', desc: '<p>흰 뚜껑 <b>2개</b>의 중심 좌표를 출력하고 원본에 원을 그려 표시하세요.</p><ul><li>H 는 전부 열고 <code>S ≤ 40</code>, <code>V ≥ 180</code></li><li>면적 300 이상만 세기</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);
        using var mask = new Mat();
        // TODO: 흰색 마스크 → 덩어리 중심 출력 → Cv2.Circle 로 표시
        Cv2.ImShow("result", img);
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/color_caps.png");
        using var hsv = new Mat();
        Cv2.CvtColor(img, hsv, ColorConversionCodes.BGR2HSV);
        using var mask = new Mat();
        Cv2.InRange(hsv, new Scalar(0, 0, 180), new Scalar(179, 40, 255), mask);
        var cc = Cv2.ConnectedComponentsEx(mask);
        int n = 0;
        foreach (var b in cc.Blobs)
        {
            if (b.Label == 0 || b.Area < 300) continue;
            n++;
            Cv2.Circle(img, new Point((int)b.Centroid.X, (int)b.Centroid.Y), 34, new Scalar(0, 0, 255), 2);
        }
        Console.WriteLine($"흰 뚜껑 {n} 개");
        Cv2.ImShow("result", img);
        Cv2.WaitKey(0);
    }
}`, notes: '<p>정답 2개. S 상한을 80 으로 올려 보게 하면 노란 뚜껑의 하이라이트가 섞이는 것을 볼 수 있습니다 — 임계값 조절 감각을 기르는 좋은 관찰입니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<code>BGR2HSV</code> → H(0~179) · S(0~255) · V(0~255)', '<code>Cv2.InRange(hsv, lo, hi, mask)</code> = 색 찾기 → 1채널 마스크', 'S · V 의 <b>아래 한계</b>로 배경 · 그림자를 거른다', '빨강은 <b>0~10 과 170~179</b> 두 구간 → <code>BitwiseOr</code>', '무채색(흰 · 검 · 회색)은 <b>S · V</b> 로 판정', '마스크 → <code>ConnectedComponentsEx</code> 로 개수 · 중심, <code>BitwiseAnd</code> 로 그 색만 남기기', '다음 차시: 밝기 · 대비 · 히스토그램'], notes: '<p>여섯 줄을 학생들이 번갈아 읽습니다. 다음 차시 예고: “어두운 사진을 밝게 만드는 정석과, 영상의 성적표인 히스토그램.” 숙제로 wire_harness.png 의 전선 색 순서를 눈으로 확인해 오게 하면 좋습니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
