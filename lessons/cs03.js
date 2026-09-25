/* 03차시 Mat 과 픽셀: 이미지 자료 구조 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: Mat 의 메모리 배치 — 행 우선 · 채널 인터리브
  const FIG_MAT = `<svg viewBox="0 0 760 330" role="img" aria-label="Mat 의 행 우선 메모리 배치와 BGR 채널 인터리브">
  ${ARROW('c03a1')}
  <text x="20" y="26" class="tx-b">① 2차원으로 보면: Rows=4, Cols=5 (Height=4, Width=5)</text>
  <line x1="40" y1="46" x2="250" y2="46" class="ax" marker-end="url(#c03a1)"/><text x="255" y="50" class="tx-m">x (열, Cols)</text>
  <line x1="40" y1="46" x2="40" y2="220" class="ax" marker-end="url(#c03a1)"/><text x="18" y="235" class="tx-m">y (행)</text>
  ${[0, 1, 2, 3].map((y) => [0, 1, 2, 3, 4].map((x) => `<rect x="${50 + x * 40}" y="${56 + y * 40}" width="38" height="38" class="${y === 1 && x === 3 ? 'p2' : 'p1s'}"/><text x="${69 + x * 40}" y="${80 + y * 40}" text-anchor="middle" class="${y === 1 && x === 3 ? 'tx-w' : 'tx-m'}">${y * 5 + x}</text>`).join('')).join('')}
  <text x="150" y="245" text-anchor="middle" class="tx">칸의 숫자 = 메모리 순서. 색칠한 픽셀 = (행 y=1, 열 x=3)</text>
  <text x="150" y="266" text-anchor="middle" class="tx-b">img.At&lt;byte&gt;(1, 3)  ·  new Point(3, 1)</text>
  <text x="400" y="26" class="tx-b">② 메모리(1차원)로 보면: 행을 차례로 이어 붙인다 (행 우선)</text>
  ${[0, 1, 2, 3].map((y) => [0, 1, 2, 3, 4].map((x) => `<rect x="${400 + (y * 5 + x) * 17}" y="52" width="16" height="26" class="${y * 5 + x === 8 ? 'p2' : ['p1s', 'p3s', 'p4s', 'p5s'][y]}"/>`).join('')).join('')}
  <text x="442" y="96" text-anchor="middle" class="tx-m">행 0</text><text x="527" y="96" text-anchor="middle" class="tx-m">행 1</text><text x="612" y="96" text-anchor="middle" class="tx-m">행 2</text><text x="697" y="96" text-anchor="middle" class="tx-m">행 3</text>
  <text x="570" y="120" text-anchor="middle" class="tx">위치 = y × Cols + x = 1 × 5 + 3 = <tspan class="tx-b">8</tspan></text>
  <text x="400" y="160" class="tx-b">③ 3채널(CV_8UC3)이면 픽셀 하나가 B, G, R 3바이트</text>
  ${[0, 1, 2].map((p) => ['B', 'G', 'R'].map((c, k) => `<rect x="${400 + (p * 3 + k) * 34}" y="172" width="33" height="30" class="${['p1s', 'p3s', 'p2s'][k]}"/><text x="${416 + (p * 3 + k) * 34}" y="192" text-anchor="middle" class="tx">${c}</text>`).join('')).join('')}
  <text x="450" y="222" text-anchor="middle" class="tx-m">픽셀 (y, 0)</text><text x="552" y="222" text-anchor="middle" class="tx-m">픽셀 (y, 1)</text><text x="654" y="222" text-anchor="middle" class="tx-m">픽셀 (y, 2)</text>
  <text x="400" y="252" class="tx">ElemSize() = 3 바이트 · 한 행 = Cols × 3 바이트 (Step)</text>
  <text x="400" y="274" class="tx">전체 = Rows × Cols × ElemSize = Total() × ElemSize() 바이트</text>
  <text x="400" y="306" class="tx-m">Vec3b px = img.At&lt;Vec3b&gt;(y, x);  px.Item0 = B, px.Item1 = G, px.Item2 = R</text>
</svg>`;

  // 그림 2: MatType 이름 해부
  const FIG_TYPE = `<svg viewBox="0 0 760 250" role="img" aria-label="MatType 이름 CV_8UC3 의 뜻">
  <rect x="20" y="20" width="720" height="210" rx="14" class="card-bg"/>
  <text x="150" y="80" text-anchor="middle" class="tx-b" style="font-size:34px">CV_</text>
  <rect x="200" y="46" width="110" height="50" rx="8" class="p1s"/><text x="255" y="80" text-anchor="middle" class="tx-b" style="font-size:34px">8U</text>
  <rect x="320" y="46" width="90" height="50" rx="8" class="p2s"/><text x="365" y="80" text-anchor="middle" class="tx-b" style="font-size:34px">C3</text>
  <text x="255" y="122" text-anchor="middle" class="tx-b">깊이(Depth) = 픽셀 값 1개의 자료형</text>
  <text x="255" y="142" text-anchor="middle" class="tx-m">8U: 0~255 byte · 8S: sbyte · 16U: ushort · 16S: short</text>
  <text x="255" y="160" text-anchor="middle" class="tx-m">32S: int · 32F: float · 64F: double</text>
  <text x="255" y="182" text-anchor="middle" class="tx-m">U = 부호 없음(Unsigned), S = 부호 있음, F = 실수(Float)</text>
  <text x="560" y="122" text-anchor="middle" class="tx-b">채널 수(Channels) = 픽셀 하나의 값 개수</text>
  <text x="560" y="142" text-anchor="middle" class="tx-m">C1: 그레이 · 마스크 · 실수 계산 결과</text>
  <text x="560" y="160" text-anchor="middle" class="tx-m">C3: 컬러(B, G, R) · C4: 컬러 + 알파</text>
  <text x="560" y="182" text-anchor="middle" class="tx-m">C2: (x, y) 좌표 쌍 · 복소수(DFT)</text>
  <text x="380" y="215" text-anchor="middle" class="tx">Python cv2: uint8 배열 shape (h, w, 3) ⟷ C#: Mat CV_8UC3 (Rows=h, Cols=w)</text>
</svg>`;

  // 그림 3: (행, 열) 과 (x, y) — 픽셀 접근 순서
  const FIG_YX = `<svg viewBox="0 0 760 300" role="img" aria-label="At(y, x) 는 행 열 순서, Point(x, y) 는 x y 순서">
  ${ARROW('c03a2')}
  <text x="20" y="26" class="tx-b">같은 픽셀, 두 가지 표기</text>
  <line x1="60" y1="50" x2="330" y2="50" class="ax" marker-end="url(#c03a2)"/><text x="336" y="54" class="tx-m">x = 0 … Cols−1</text>
  <line x1="60" y1="50" x2="60" y2="250" class="ax" marker-end="url(#c03a2)"/><text x="28" y="264" class="tx-m">y = 0 … Rows−1</text>
  ${[0, 1, 2, 3, 4].map((y) => [0, 1, 2, 3, 4, 5].map((x) => `<rect x="${70 + x * 40}" y="${60 + y * 36}" width="38" height="34" class="${y === 2 && x === 4 ? 'p2' : 'p1s'}"/>`).join('')).join('')}
  <text x="89" y="83" text-anchor="middle" class="tx-m">(0,0)</text>
  <text x="249" y="155" text-anchor="middle" class="tx-w">●</text>
  <rect x="380" y="70" width="360" height="80" rx="10" class="p2s"/>
  <text x="560" y="98" text-anchor="middle" class="tx-b">Mat 픽셀 접근 = (행 y, 열 x)</text>
  <text x="560" y="122" text-anchor="middle" class="tx">img.At&lt;byte&gt;(2, 4) · img.Get&lt;Vec3b&gt;(2, 4) · indexer[2, 4]</text>
  <text x="560" y="140" text-anchor="middle" class="tx-m">Python 의 img[y, x] 와 같은 순서</text>
  <rect x="380" y="170" width="360" height="80" rx="10" class="p3s"/>
  <text x="560" y="198" text-anchor="middle" class="tx-b">OpenCV 함수의 점 · 사각형 = (x, y)</text>
  <text x="560" y="222" text-anchor="middle" class="tx">new Point(4, 2) · new Rect(4, 2, w, h) · new Size(w, h)</text>
  <text x="560" y="240" text-anchor="middle" class="tx-m">Cv2.Circle(img, new Point(x, y), …)</text>
  <text x="380" y="285" text-anchor="middle" class="tx-m">순서를 바꿔 쓰면 다른 픽셀을 읽거나 IndexOutOfRangeException 이 납니다 (640×480 에서 At(600, 100) 은 범위 밖!)</text>
</svg>`;

  // 그림 4: ROI 는 같은 메모리, Clone 은 새 메모리
  const FIG_ROI = `<svg viewBox="0 0 760 300" role="img" aria-label="ROI 는 원본 메모리를 참조하고 Clone 은 새 메모리를 만든다">
  ${ARROW('c03a3')}
  <rect x="20" y="40" width="300" height="220" rx="10" class="p1s"/>
  <text x="170" y="30" text-anchor="middle" class="tx-b">원본 img (메모리 1개, 640×480)</text>
  <rect x="90" y="90" width="150" height="100" rx="4" class="p2s" stroke-dasharray="6 4"/>
  <text x="165" y="135" text-anchor="middle" class="tx-b">roi</text>
  <text x="165" y="155" text-anchor="middle" class="tx-m">new Mat(img, rect)</text>
  <text x="165" y="172" text-anchor="middle" class="tx-m">img[rect] · img.SubMat(rect)</text>
  <text x="170" y="285" text-anchor="middle" class="tx-m">roi 는 창(view)일 뿐 — roi.SetTo(0) 하면 img 의 그 부분도 0 이 된다</text>
  <line x1="245" y1="140" x2="420" y2="140" class="ln" stroke-width="2" marker-end="url(#c03a3)"/>
  <text x="332" y="130" text-anchor="middle" class="tx-m">roi.Clone()</text>
  <text x="332" y="160" text-anchor="middle" class="tx-m">roi.CopyTo(dst)</text>
  <rect x="430" y="90" width="150" height="100" rx="4" class="p3s"/>
  <text x="505" y="135" text-anchor="middle" class="tx-b">clone</text>
  <text x="505" y="155" text-anchor="middle" class="tx-m">새 메모리 (독립)</text>
  <text x="505" y="172" text-anchor="middle" class="tx-m">바꿔도 img 는 그대로</text>
  <rect x="600" y="40" width="140" height="220" rx="10" class="card-bg"/>
  <text x="670" y="66" text-anchor="middle" class="tx-b">언제 무엇을?</text>
  <text x="670" y="96" text-anchor="middle" class="tx-m">일부만 처리 · 그리기</text><text x="670" y="112" text-anchor="middle" class="tx-b">→ ROI</text>
  <text x="670" y="146" text-anchor="middle" class="tx-m">원본 보존 · 비교</text><text x="670" y="162" text-anchor="middle" class="tx-b">→ Clone</text>
  <text x="670" y="196" text-anchor="middle" class="tx-m">다른 이미지에 붙이기</text><text x="670" y="212" text-anchor="middle" class="tx-b">→ CopyTo(roi)</text>
  <text x="670" y="246" text-anchor="middle" class="tx-m">IsSubmatrix 로 확인</text>
</svg>`;

  // ------------------------------------------------------------------ 1교시 예제
  const EX1_INFO = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var color = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);

        Console.WriteLine("--- 그레이 ---");
        Console.WriteLine($"Rows(행)={gray.Rows}, Cols(열)={gray.Cols}");
        Console.WriteLine($"Width={gray.Width}, Height={gray.Height}, Size={gray.Size()}");
        Console.WriteLine($"Channels={gray.Channels()}, Depth={gray.Depth()} (CV_8U={MatType.CV_8U})");
        Console.WriteLine($"Type={gray.Type()}, ElemSize={gray.ElemSize()} 바이트");
        Console.WriteLine($"Total={gray.Total()} 픽셀, 메모리={gray.Total() * gray.ElemSize()} 바이트");
        Console.WriteLine($"Empty={gray.Empty()}");

        Console.WriteLine("--- 컬러 ---");
        Console.WriteLine($"Channels={color.Channels()}, Type={color.Type()}, ElemSize={color.ElemSize()}");
        Console.WriteLine($"메모리={color.Total() * color.ElemSize()} 바이트");
        Console.WriteLine(color);   // ToString: 크기 · 형식 · 연속 여부
    }
}`;

  const EX1_TYPE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // MatType 은 깊이(Depth) + 채널 수(Channels) 를 합친 값입니다
        MatType[] types = { MatType.CV_8UC1, MatType.CV_8UC3, MatType.CV_16UC1,
                            MatType.CV_32SC1, MatType.CV_32FC1, MatType.CV_64FC3 };
        Console.WriteLine("형식       Depth Channels ElemSize");
        foreach (var t in types)
        {
            using var m = new Mat(2, 2, t);
            Console.WriteLine($"{t.ToString().PadRight(10)} {t.Depth,5} {t.Channels,8} {m.ElemSize(),8}");
        }

        using var img = Cv2.ImRead("images/sample_color.png");
        MatType type = img.Type();
        Console.WriteLine($"img.Type() == CV_8UC3 ? {type == MatType.CV_8UC3}");
        Console.WriteLine($"깊이가 8비트인가? {img.Depth() == MatType.CV_8U}");
        Console.WriteLine($"MakeType(CV_32F, 2) = {MatType.MakeType(MatType.CV_32F, 2)}");
    }
}`;

  const EX1_CREATE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 1) 크기 · 형식 · 초기값으로 만들기 (행 수, 열 수 순서!)
        using var a = new Mat(3, 4, MatType.CV_8UC1, new Scalar(7));
        Console.WriteLine("a = " + a);
        Console.WriteLine(a.Dump());

        // 2) 0 · 1 · 단위 행렬
        using var z = Mat.Zeros(2, 3, MatType.CV_8UC1);
        using var o = Mat.Ones(2, 3, MatType.CV_8UC1);
        using var e = Mat.Eye(3, 3, MatType.CV_32FC1);
        Console.WriteLine("Zeros:\\n" + z.Dump());
        Console.WriteLine("Ones:\\n" + o.Dump());
        Console.WriteLine("Eye (float):\\n" + e.Dump());

        // 3) Size 로 만들기 — Size 는 (너비, 높이) 순서!
        using var c = new Mat(new Size(4, 2), MatType.CV_8UC3, new Scalar(1, 2, 3));
        Console.WriteLine($"c: Rows={c.Rows}, Cols={c.Cols}, Type={c.Type()}");
        Console.WriteLine(c.Dump());   // 픽셀마다 B, G, R = 1, 2, 3
    }
}`;

  const EX1_STRUCTS = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        var size = new Size(640, 480);          // (너비, 높이)
        var pt = new Point(100, 50);            // (x, y)
        var rect = new Rect(100, 50, 200, 120); // (x, y, 너비, 높이)
        var color = new Scalar(0, 0, 255);      // (B, G, R[, A])

        Console.WriteLine($"Size: {size}, 넓이={size.Area}");
        Console.WriteLine($"Point: {pt}, X={pt.X}, Y={pt.Y}");
        Console.WriteLine($"Rect: {rect}");
        Console.WriteLine($"  Right={rect.Right}, Bottom={rect.Bottom}, Center={rect.Center}");
        Console.WriteLine($"  (150, 100) 포함? {rect.Contains(new Point(150, 100))}");
        Console.WriteLine($"  (400, 100) 포함? {rect.Contains(new Point(400, 100))}");
        var other = new Rect(200, 100, 200, 200);
        Console.WriteLine($"  교집합: {rect.Intersect(other)}");
        Console.WriteLine($"Scalar: {color}, Val2(R)={color.Val2}");
        Console.WriteLine($"Scalar.Red={Scalar.Red}, Scalar.Blue={Scalar.Blue}");
        Console.WriteLine($"Scalar.Yellow={Scalar.Yellow} (B=0, G=255, R=255)");
    }
}`;

  const EX1_CANVAS = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 480행 × 640열 컬러 캔버스 — 초기값은 BGR 순서
        using var canvas = new Mat(480, 640, MatType.CV_8UC3, new Scalar(200, 150, 80));
        using var black = Mat.Zeros(240, 320, MatType.CV_8UC3);
        using var white = new Mat(new Size(320, 240), MatType.CV_8UC1, new Scalar(255));

        Console.WriteLine($"canvas: {canvas.Size()} {canvas.Type()}");
        Console.WriteLine($"black : {black.Size()} {black.Type()}");
        Console.WriteLine($"white : {white.Size()} {white.Type()}");
        Cv2.ImShow("canvas (200,150,80)", canvas);   // 마우스를 올려 B G R 값을 확인해 보세요
        Cv2.ImShow("black", black);
        Cv2.ImShow("white", white);
        Cv2.WaitKey(0);
    }
}`;

  // ------------------------------------------------------------------ 2교시 예제
  const EX2_GETSET = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var m = new Mat(3, 5, MatType.CV_8UC1, new Scalar(10));
        Console.WriteLine("처음:\\n" + m.Dump());

        m.Set<byte>(1, 3, 200);          // (행 1, 열 3) 에 200 쓰기
        byte v1 = m.At<byte>(1, 3);      // 읽기 — At 과 Get 은 같은 기능
        byte v2 = m.Get<byte>(2, 0);
        Console.WriteLine($"At(1,3)={v1}, Get(2,0)={v2}");

        var idx = m.GetGenericIndexer<byte>();   // 인덱서: 반복문에서 더 빠르고 짧다
        idx[0, 0] = 1;
        idx[2, 4] = idx[1, 3];           // (2,4) ← (1,3) 값 복사
        Console.WriteLine("바꾼 뒤:\\n" + m.Dump());

        int sum = 0;
        for (int y = 0; y < m.Rows; y++)
            for (int x = 0; x < m.Cols; x++)
                sum += idx[y, x];
        Console.WriteLine($"합계={sum}, 평균={Cv2.Mean(m).Val0:F1}");
    }
}`;

  const EX2_COLOR = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");   // CV_8UC3

        // 컬러 픽셀은 Vec3b (byte 3개) 로 읽습니다 — (행 y, 열 x) 순서!
        Vec3b red = img.At<Vec3b>(110, 120);      // 빨간 원의 중심 (x=120, y=110)
        Vec3b green = img.At<Vec3b>(370, 520);    // 초록 사각형 (x=520, y=370)
        Vec3b blue = img.At<Vec3b>(290, 130);     // 파란 삼각형 (x=130, y=290)
        Console.WriteLine($"빨간 원  : B={red.Item0} G={red.Item1} R={red.Item2}");
        Console.WriteLine($"초록 사각: B={green.Item0} G={green.Item1} R={green.Item2}");
        Console.WriteLine($"파란 삼각: B={blue.Item0} G={blue.Item1} R={blue.Item2}");
        Console.WriteLine($"ToString: {red}");

        // 픽셀 쓰기: 원 중심에 10×10 노란 점 찍기
        var idx = img.GetGenericIndexer<Vec3b>();
        for (int y = 105; y < 115; y++)
            for (int x = 115; x < 125; x++)
                idx[y, x] = new Vec3b(0, 255, 255);   // (B, G, R)
        Console.WriteLine($"바꾼 뒤 (110,120): {img.At<Vec3b>(110, 120)}");

        Cv2.ImShow("sample_color", img);
        Cv2.WaitKey(0);
    }
}`;

  const EX2_GRADIENT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 1) 가로 그라데이션: 밝기 = x (0~255)
        using var g = new Mat(256, 256, MatType.CV_8UC1);
        var gi = g.GetGenericIndexer<byte>();
        for (int y = 0; y < g.Rows; y++)
            for (int x = 0; x < g.Cols; x++)
                gi[y, x] = (byte)x;

        // 2) 컬러 그라데이션: B = x, G = y, R = 128
        using var c = new Mat(256, 256, MatType.CV_8UC3);
        var ci = c.GetGenericIndexer<Vec3b>();
        for (int y = 0; y < c.Rows; y++)
            for (int x = 0; x < c.Cols; x++)
                ci[y, x] = new Vec3b((byte)x, (byte)y, 128);

        Console.WriteLine($"g(0,0)={g.At<byte>(0, 0)}, g(0,255)={g.At<byte>(0, 255)}, g(100,60)={g.At<byte>(100, 60)}");
        Console.WriteLine($"c(0,0)={c.At<Vec3b>(0, 0)}");
        Console.WriteLine($"c(255,255)={c.At<Vec3b>(255, 255)}");
        Console.WriteLine($"c(200,50)={c.At<Vec3b>(200, 50)}   // B=x=50, G=y=200");
        Cv2.ImShow("gray gradient", g);
        Cv2.ImShow("color gradient", c);
        Cv2.WaitKey(0);
    }
}`;

  const EX2_INVERT = `using System;
using System.Diagnostics;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);   // 640×480

        // 방법 1: 픽셀 반복 (307,200 번) — 인터프리터에서는 느립니다
        var sw = Stopwatch.StartNew();
        using var inv1 = new Mat(img.Size(), MatType.CV_8UC1);
        var src = img.GetGenericIndexer<byte>();
        var dst = inv1.GetGenericIndexer<byte>();
        for (int y = 0; y < img.Rows; y++)
            for (int x = 0; x < img.Cols; x++)
                dst[y, x] = (byte)(255 - src[y, x]);
        long loopMs = sw.ElapsedMilliseconds;

        // 방법 2: Cv2 함수 한 줄 (네이티브 코드로 실행)
        sw.Restart();
        using var inv2 = new Mat();
        Cv2.BitwiseNot(img, inv2);       // Mat inv3 = ~img; 도 같은 뜻
        long cvMs = sw.ElapsedMilliseconds;

        using var diff = new Mat();
        Cv2.Absdiff(inv1, inv2, diff);
        Console.WriteLine($"두 결과가 다른 픽셀 수: {Cv2.CountNonZero(diff)}");
        Console.WriteLine($"반복문: {loopMs} ms, Cv2.BitwiseNot: {cvMs} ms");
        Cv2.ImShow("original", img);
        Cv2.ImShow("inverted", inv2);
        Cv2.WaitKey(0);
    }
}`;

  const EX2_COUNT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        // 빨간 원(중심 x=120, y=110, r=34) 주변 100×100 영역만 반복
        var roi = new Rect(70, 60, 100, 100);
        var idx = img.GetGenericIndexer<Vec3b>();
        int redCount = 0;
        for (int y = roi.Top; y < roi.Bottom; y++)
            for (int x = roi.Left; x < roi.Right; x++)
            {
                Vec3b p = idx[y, x];
                if (p.Item2 > 150 && p.Item1 < 100 && p.Item0 < 100)   // R 크고 G, B 작으면 빨강
                    redCount++;
            }
        Console.WriteLine($"반복문으로 센 빨간 픽셀 (ROI 안): {redCount}");
        Console.WriteLine($"원 넓이 π×34² ≈ {Math.PI * 34 * 34:F0}");

        // 같은 조건을 Cv2.InRange 로 (전체 이미지, 한 줄) — 빨간 원 2개
        using var mask = new Mat();
        Cv2.InRange(img, new Scalar(0, 0, 151), new Scalar(99, 99, 255), mask);
        Console.WriteLine($"InRange 로 센 빨간 픽셀 (전체): {Cv2.CountNonZero(mask)}");
        Cv2.ImShow("red mask", mask);
        Cv2.WaitKey(0);
    }
}`;

  const EX2_MISTAKES = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);   // 640×480, 1채널
        Console.WriteLine($"크기: Rows={gray.Rows}, Cols={gray.Cols}");

        // 실수 1: (x, y) 순서로 넘기기 — x=600 은 열로는 OK 지만 행으로는 범위 밖
        try
        {
            byte v = gray.At<byte>(600, 100);   // 행 600 은 없다! (행은 0~479)
            Console.WriteLine(v);
        }
        catch (IndexOutOfRangeException)
        {
            Console.WriteLine("실수 1 → IndexOutOfRangeException: At(600, 100) 은 (행, 열)! At(100, 600) 이 맞다");
        }
        Console.WriteLine($"At(100, 600) = {gray.At<byte>(100, 600)}");

        // 실수 2: 1채널 Mat 을 Vec3b 로 읽기
        try
        {
            Vec3b p = gray.At<Vec3b>(10, 10);
            Console.WriteLine(p);
        }
        catch (ArgumentException)
        {
            Console.WriteLine("실수 2 → ArgumentException: CV_8UC1 은 byte 로, CV_8UC3 은 Vec3b 로 읽어야 한다");
        }
    }
}`;

  // ------------------------------------------------------------------ 3교시 예제
  const EX3_ROI = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        var rect = new Rect(50, 50, 200, 150);      // (x, y, 너비, 높이)

        // 세 가지 표기 — 모두 원본 메모리를 가리키는 '창(view)' 입니다
        using var roi1 = new Mat(img, rect);
        using var roi2 = img[rect];
        using var roi3 = img.SubMat(rect);
        Console.WriteLine($"roi1: {roi1.Size()}, IsSubmatrix={roi1.IsSubmatrix}");
        Console.WriteLine($"img : {img.Size()}, IsSubmatrix={img.IsSubmatrix}");

        Console.WriteLine($"수정 전 img(100,100) = {img.At<byte>(100, 100)}");
        roi1.SetTo(new Scalar(0));                  // ROI 를 검게 → 원본도 바뀐다!
        Console.WriteLine($"roi1.SetTo(0) 후 img(100,100) = {img.At<byte>(100, 100)}");
        Console.WriteLine($"roi2(50,50) = {roi2.At<byte>(50, 50)}  (roi2 도 같은 메모리)");

        // ROI 좌표는 ROI 기준 (0,0) 부터 — img 의 (50,50) 이 roi 의 (0,0)
        roi2.SetTo(new Scalar(255));
        Console.WriteLine($"roi2.SetTo(255) 후 img(60,60) = {img.At<byte>(60, 60)}");
        Cv2.ImShow("img (ROI 가 하얗게 바뀜)", img);
        Cv2.WaitKey(0);
    }
}`;

  const EX3_CLONE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        var rect = new Rect(50, 50, 200, 150);

        // Clone(): 새 메모리에 복사 → 독립
        using var copy = img.Clone();
        using var part = img[rect].Clone();        // ROI 만 복사해 잘라내기
        copy.SetTo(new Scalar(0));
        Console.WriteLine($"copy.SetTo(0) 후 img(100,100) = {img.At<byte>(100, 100)} (원본 그대로)");
        Console.WriteLine($"part: {part.Size()}, IsSubmatrix={part.IsSubmatrix}");

        // CopyTo(dst): dst 를 새로 만들어 복사
        using var dst = new Mat();
        img.CopyTo(dst);
        Console.WriteLine($"dst: {dst.Size()} {dst.Type()}");

        // Mat b = a; 는 복사가 아니라 같은 Mat 을 가리키는 두 이름!
        Mat alias = img;
        alias.SetTo(new Scalar(128));
        Console.WriteLine($"alias.SetTo(128) 후 img(100,100) = {img.At<byte>(100, 100)} (같은 객체)");
        Cv2.ImShow("part (잘라낸 조각)", part);
        Cv2.WaitKey(0);
    }
}`;

  const EX3_LOGO = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");

        // 80×80 로고 만들기: 노란 배경 + 파란 원
        using var logo = new Mat(80, 80, MatType.CV_8UC3, new Scalar(0, 220, 255));
        Cv2.Circle(logo, new Point(40, 40), 30, new Scalar(255, 80, 0), -1);

        // 1) 사각형 그대로 붙이기: 로고를 오른쪽 위 ROI 에 CopyTo
        var pos1 = new Rect(img.Width - 90, 10, 80, 80);
        logo.CopyTo(img[pos1]);

        // 2) 마스크로 원 부분만 붙이기 (마스크가 255 인 픽셀만 복사)
        using var mask = new Mat(80, 80, MatType.CV_8UC1, new Scalar(0));
        Cv2.Circle(mask, new Point(40, 40), 30, new Scalar(255), -1);
        var pos2 = new Rect(10, img.Height - 90, 80, 80);
        logo.CopyTo(img[pos2], mask);

        // 3) 인덱서 대입도 같은 뜻: img[rect] = logo;
        img[new Rect(10, 10, 80, 80)] = logo;

        Console.WriteLine($"로고 중심 픽셀 (원): {img.At<Vec3b>(pos1.Y + 40, pos1.X + 40)}");
        Console.WriteLine($"로고 모서리 픽셀 (배경): {img.At<Vec3b>(pos1.Y + 2, pos1.X + 2)}");
        Console.WriteLine($"마스크 붙임 모서리 (원본 유지): {img.At<Vec3b>(pos2.Y + 2, pos2.X + 2)}");
        Cv2.ImShow("logo inserted", img);
        Cv2.WaitKey(0);
    }
}`;

  const EX3_ARITH = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        int y = 240, x = 320;
        Console.WriteLine($"원본 (240,320) = {img.At<byte>(y, x)}");

        using Mat brighter = img + 50;        // 모든 픽셀 +50 (255 에서 포화)
        using Mat darker = img - 50;          // 0 에서 포화 (음수 없음)
        using Mat contrast = img * 1.5;       // 곱하기 → 대비 증가
        using Mat inverted = ~img;            // 255 - v
        Console.WriteLine($"img + 50   = {brighter.At<byte>(y, x)}");
        Console.WriteLine($"img - 50   = {darker.At<byte>(y, x)}");
        Console.WriteLine($"img * 1.5  = {contrast.At<byte>(y, x)} (255 를 넘으면 255)");
        Console.WriteLine($"~img       = {inverted.At<byte>(y, x)}");

        // 두 이미지 사이 연산: 크기 · 형식이 같아야 한다
        using var other = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using Mat sub = img - other;          // 픽셀별 뺄셈 (음수 → 0)
        using var absdiff = new Mat();
        Cv2.Absdiff(img, other, absdiff);     // |a - b| — 차이 검출에 자주 쓴다
        Console.WriteLine($"img - other = {sub.At<byte>(y, x)}, absdiff = {absdiff.At<byte>(y, x)}");

        // 비트 연산은 마스크(0/255) 에 씁니다
        using var mask = new Mat(img.Size(), MatType.CV_8UC1, new Scalar(0));
        Cv2.Rectangle(mask, new Rect(160, 120, 320, 240), new Scalar(255), -1);
        using Mat masked = img & mask;        // 마스크 밖은 0
        using Mat lit = img | ~mask;          // 마스크 밖은 255
        Console.WriteLine($"img & mask: 안={masked.At<byte>(240, 320)}, 밖={masked.At<byte>(10, 10)}");
        Cv2.ImShow("img + 50", brighter);
        Cv2.ImShow("img * 1.5", contrast);
        Cv2.ImShow("img & mask", masked);
        Cv2.ImShow("img | ~mask", lit);
        Cv2.WaitKey(0);
    }
}`;

  const EX3_CONVERT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);

        // 1) 8비트 → 32비트 실수, 0~1 범위로 스케일: dst = src * alpha + beta
        using var f = new Mat();
        img.ConvertTo(f, MatType.CV_32FC1, 1.0 / 255.0);
        Console.WriteLine($"f: {f.Type()}, (240,320) = {f.At<float>(240, 320):F3}");

        // 실수 Mat 에서는 오버플로 없이 계산할 수 있습니다
        using Mat f2 = f * 2.0;
        Console.WriteLine($"f * 2 = {f2.At<float>(240, 320):F3} (byte 였다면 255 에서 잘림)");

        // 2) 다시 8비트로: 0~1 → 0~255. 표시(ImShow) 하려면 8비트가 안전
        using var back = new Mat();
        f.ConvertTo(back, MatType.CV_8UC1, 255.0);
        Console.WriteLine($"back: {back.Type()}, (240,320) = {back.At<byte>(240, 320)}");

        // 3) SetTo(값, 마스크): 마스크가 255 인 픽셀만 값으로 채우기
        using var color = Cv2.ImRead("images/nuts_bolts_color.png");
        using var mask = new Mat();
        Cv2.Threshold(img, mask, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);  // 어두운 부품 = 255
        color.SetTo(Scalar.Red, mask);        // 부품 자리를 빨갛게
        Console.WriteLine($"마스크 픽셀 수: {Cv2.CountNonZero(mask)}");
        Console.WriteLine($"와셔 몸통 (y=60, x=90) = {color.At<Vec3b>(60, 90)}");   // 빨갛게 칠해짐
        Console.WriteLine($"배경 (y=10, x=10)      = {color.At<Vec3b>(10, 10)}");   // 그대로
        Cv2.ImShow("float 0~1", f);
        Cv2.ImShow("SetTo(Red, mask)", color);
        Cv2.WaitKey(0);
    }
}`;

  const EX3_ERRORS = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);   // CV_8UC1
        using var color = Cv2.ImRead("images/sample_color.png");                     // CV_8UC3
        using var small = new Mat(100, 100, MatType.CV_8UC1, new Scalar(0));

        // 오류 1: 1채널 이미지에 BGR2GRAY (3채널 필요)
        try { using var g = new Mat(); Cv2.CvtColor(gray, g, ColorConversionCodes.BGR2GRAY); }
        catch (OpenCVException e) { Console.WriteLine("오류 1 OpenCVException: " + Short(e.Message)); }

        // 오류 2: 크기가 다른 두 Mat 의 연산
        try { using Mat sum = gray + small; }
        catch (OpenCVException e) { Console.WriteLine("오류 2 OpenCVException: " + Short(e.Message)); }

        // 오류 3: 채널 수가 다른 두 Mat 의 연산
        try { using Mat sum = gray + color; }
        catch (OpenCVException e) { Console.WriteLine("오류 3 OpenCVException: " + Short(e.Message)); }

        // 오류 4: ROI 가 이미지 밖으로 나감
        try { using var r = new Mat(gray, new Rect(600, 400, 100, 100)); }
        catch (OpenCVException e) { Console.WriteLine("오류 4 OpenCVException: " + Short(e.Message)); }

        // 오류 5: 형식에 맞지 않는 픽셀 읽기
        try { Vec3b p = gray.At<Vec3b>(0, 0); }
        catch (ArgumentException e) { Console.WriteLine("오류 5 ArgumentException: " + Short(e.Message)); }
    }

    // 메시지가 길면 앞부분만
    static string Short(string s) => s.Length > 70 ? s.Substring(0, 70) + "…" : s;
}`;

  // ------------------------------------------------------------------ 퀴즈
  const QUIZ1 = [
    { q: '<code>new Mat(480, 640, MatType.CV_8UC3)</code> 로 만든 Mat 의 <code>Width</code> 는?', options: ['480', '640', '3', '921600'], answer: 1,
      explain: '생성자는 <b>(행 수, 열 수)</b> 순서입니다. 행 480 = Height, 열 640 = Width. 반대로 <code>new Size(640, 480)</code> 은 (너비, 높이) 순서입니다.' },
    { q: '<code>MatType.CV_16UC1</code> 의 뜻은?', options: ['16비트 부호 없는 정수, 1채널', '16비트 실수, 1채널', '8비트 정수, 16채널', '16비트 부호 있는 정수, 1채널'], answer: 0,
      explain: '<b>16U</b> = 16비트 Unsigned(부호 없음, 0~65535), <b>C1</b> = 1채널. 부호 있는 것은 16S, 실수는 32F/64F 입니다.' },
    { q: '640×480 컬러 이미지(CV_8UC3)가 차지하는 메모리는?', options: ['307,200 바이트', '921,600 바이트', '1,228,800 바이트', '640 바이트'], answer: 1,
      explain: 'Total() = 640 × 480 = 307,200 픽셀, ElemSize() = 3 바이트 → <b>921,600 바이트</b>(약 900 KB). 그레이라면 307,200 바이트입니다.' },
    { q: '3채널 컬러 Mat 에서 <code>ElemSize()</code> 와 <code>Channels()</code> 값은?', options: ['1, 1', '3, 1', '3, 3', '1, 3'], answer: 2,
      explain: 'CV_8UC3 은 픽셀당 byte 3개 → ElemSize() = 3 바이트, Channels() = 3. CV_32FC1 이라면 ElemSize() = 4, Channels() = 1 입니다.' },
    { q: '<code>Mat.Eye(3, 3, MatType.CV_32FC1).Dump()</code> 에서 (1, 1) 위치의 값은?', options: ['0', '1', '255', '3'], answer: 1,
      explain: '<b>Eye</b> 는 단위 행렬 — 대각선 (0,0), (1,1), (2,2) 가 1, 나머지는 0 입니다. Zeros 는 전부 0, Ones 는 전부 1 입니다.' }
  ];
  const QUIZ2 = [
    { q: '컬러 이미지(CV_8UC3)에서 <code>x=200, y=50</code> 픽셀을 읽는 올바른 코드는?', options: ['<code>img.At&lt;byte&gt;(200, 50)</code>', '<code>img.At&lt;Vec3b&gt;(50, 200)</code>', '<code>img.At&lt;Vec3b&gt;(200, 50)</code>', '<code>img.At&lt;int&gt;(50, 200)</code>'], answer: 1,
      explain: 'At 은 <b>(행 y, 열 x)</b> 순서이고, 3채널이므로 <b>Vec3b</b> 로 읽습니다. byte 로 읽으면 채널 수가 맞지 않아 오류가 납니다.' },
    { q: '<code>Vec3b p = img.At&lt;Vec3b&gt;(y, x);</code> 에서 빨강(R) 값은?', options: ['<code>p.Item0</code>', '<code>p.Item1</code>', '<code>p.Item2</code>', '<code>p.R</code>'], answer: 2,
      explain: 'OpenCV 는 <b>BGR</b> 순서이므로 Item0 = B, Item1 = G, <b>Item2 = R</b> 입니다. Vec3b 에는 R/G/B 라는 이름의 속성이 없습니다.' },
    { q: '640×480 이미지에서 <code>img.At&lt;byte&gt;(600, 100)</code> 을 실행하면?', options: ['x=600, y=100 픽셀 값', 'IndexOutOfRangeException', '0 이 반환된다', '가장 가까운 픽셀 값'], answer: 1,
      explain: '첫 인수는 <b>행(y)</b> 인데 행은 0~479 까지만 있습니다 → 범위 초과 예외. (x=600, y=100) 을 읽으려면 <code>At(100, 600)</code> 입니다.' },
    { q: '모든 픽셀을 반전(255 − v)하는 가장 좋은 방법은?', options: ['이중 for 문 + At/Set', '<code>Cv2.BitwiseNot(img, dst)</code> 또는 <code>~img</code>', 'foreach 로 Vec3b 순회', 'Console 로 값을 출력 후 계산'], answer: 1,
      explain: 'Cv2 함수는 <b>네이티브 C++ 코드</b>로 전체 픽셀을 한 번에 처리해 반복문보다 훨씬 빠릅니다. 반복문은 원리를 이해하거나 Cv2 에 없는 특수한 규칙일 때만 씁니다.' },
    { q: '<code>var idx = img.GetGenericIndexer&lt;byte&gt;(); idx[y, x] = 200;</code> 의 뜻은?', options: ['img 복사본의 픽셀만 바뀐다', 'img 의 (행 y, 열 x) 픽셀이 200 이 된다', '오류 — 인덱서는 읽기 전용', 'x 행 y 열이 바뀐다'], answer: 1,
      explain: '인덱서는 <b>img 의 메모리에 직접</b> 읽고 씁니다. Set&lt;byte&gt;(y, x, 200) 과 같은 결과이며 반복문에서 더 빠르고 짧게 쓸 수 있습니다.' }
  ];
  const QUIZ3 = [
    { q: '<code>var roi = new Mat(img, rect); roi.SetTo(0);</code> 를 실행하면?', options: ['roi 만 검게 되고 img 는 그대로', 'img 의 rect 영역도 검게 된다', '오류가 난다', 'img 전체가 검게 된다'], answer: 1,
      explain: 'ROI 는 <b>같은 메모리를 가리키는 창</b>입니다. ROI 를 수정하면 원본의 그 영역이 함께 바뀝니다. 독립 복사가 필요하면 <code>Clone()</code>.' },
    { q: '원본을 보존한 채 일부를 잘라내 따로 처리하려면?', options: ['<code>img[rect]</code>', '<code>img.SubMat(rect)</code>', '<code>img[rect].Clone()</code>', '<code>Mat b = img;</code>'], answer: 2,
      explain: '<code>img[rect]</code>, <code>SubMat</code> 은 모두 참조(view)이고, <code>Mat b = img</code> 는 같은 객체의 다른 이름입니다. <b>Clone()</b> 만 새 메모리에 복사합니다.' },
    { q: '8비트 이미지에서 <code>img + 100</code> 의 결과, 원래 값이 200 이던 픽셀은?', options: ['300', '44 (오버플로)', '255 (포화)', '오류'], answer: 2,
      explain: 'OpenCV 의 Mat 산술은 <b>포화(saturate)</b> 연산입니다 — 255 를 넘으면 255, 0 아래는 0. C# 의 byte 덧셈처럼 오버플로로 돌아가지 않습니다.' },
    { q: '<code>img.ConvertTo(f, MatType.CV_32FC1, 1.0 / 255.0)</code> 의 결과는?', options: ['0~255 정수 그대로', '0.0~1.0 실수', '−1~1 실수', '0~65535 정수'], answer: 1,
      explain: 'ConvertTo 는 <b>dst = src × alpha + beta</b> 를 계산하며 형식을 바꿉니다. alpha = 1/255 이므로 0~255 → 0.0~1.0 실수가 됩니다. 8비트로 되돌릴 때는 alpha = 255.' },
    { q: '그레이(CV_8UC1) 이미지에 <code>Cv2.CvtColor(gray, dst, ColorConversionCodes.BGR2GRAY)</code> 를 하면?', options: ['정상 동작', 'OpenCVException (3채널 입력 필요)', 'IndexOutOfRangeException', '결과가 컬러가 된다'], answer: 1,
      explain: 'BGR2GRAY 는 <b>3채널 입력</b>을 기대합니다. 오류 메시지의 <code>scn == 3</code>(source channel number) 는 "입력 채널이 3이어야 한다"는 뜻입니다. 먼저 <code>Channels()</code> 를 확인하세요.' }
  ];

  // ------------------------------------------------------------------ 차시
  CS_COURSE.addChapter({
    id: 'cs03', no: '03', title: 'Mat 과 픽셀: 이미지 자료 구조', subtitle: 'Mat 의 구조 · 픽셀 접근 · ROI 와 복사 · 산술 연산',
    summary: 'OpenCV 의 모든 이미지는 <b>Mat</b> 입니다. 행 · 열 · 채널 · 깊이로 이루어진 Mat 의 구조와 메모리 배치를 이해하고, <b>픽셀을 직접 읽고 쓰는 방법</b>((행 y, 열 x) 순서 · Vec3b), <b>ROI</b> 가 원본 메모리를 공유한다는 사실, <b>Clone/CopyTo</b> 로 복사하는 법, Mat 산술 연산자와 <b>ConvertTo/SetTo</b> 를 익힙니다. 이후 모든 차시의 기초가 되는 내용입니다.',
    goals: ['Mat 의 Rows/Cols/Channels/Depth/Type 을 읽고 MatType 이름(CV_8UC3 등)의 뜻을 설명할 수 있다', 'At&lt;T&gt;/Get/Set/GetGenericIndexer 로 픽셀을 (행, 열) 순서로 읽고 쓸 수 있다', 'ROI(참조)와 Clone/CopyTo(복사)의 차이를 설명하고 로고 삽입 · 마스크 복사를 할 수 있다', 'Mat 산술 · 비트 연산자와 ConvertTo/SetTo 를 쓰고, 채널/깊이 오류 메시지를 읽을 수 있다'],
    wpf: 'OpenCvWpfStarter',
    sections: [
      // ================================================================ 1교시
      {
        id: 'cs03-1', title: 'Mat 의 구조: 행 · 열 · 채널 · 깊이', minutes: 50,
        goals: ['Rows/Cols/Width/Height · Channels() · Depth() · Type() 의 뜻을 안다', 'CV_8UC1 · CV_8UC3 · CV_32FC1 같은 MatType 이름을 해석할 수 있다', 'new Mat / Zeros / Ones / Eye 로 Mat 을 만들고 Size · Point · Rect · Scalar 를 쓸 수 있다'],
        flow: [['도입: 이미지는 숫자 표', 5], ['Mat 구조 · MatType', 15], ['생성 · 구조체 실습', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '이미지는 숫자로 채워진 표(행렬)다' },
          { type: 'p', html: '카메라가 찍은 사진은 컴퓨터 안에서 <b>숫자로 채워진 2차원 표</b>입니다. 그레이(흑백) 이미지라면 칸마다 밝기 하나(0=검정 ~ 255=흰색), 컬러 이미지라면 칸마다 <b>B, G, R</b> 세 값이 들어 있습니다. OpenCV 는 이 표를 <b>Mat</b>(Matrix, 행렬) 클래스로 다룹니다 — Python 의 numpy 배열에 해당합니다. <code>Cv2.ImRead</code> 가 돌려주는 것도, 모든 함수가 받고 돌려주는 것도 Mat 입니다.' },
          { type: 'figure', html: FIG_MAT, caption: '그림 1. Mat 의 메모리 배치 — 행을 차례로 이어 붙인 1차원 메모리(행 우선). 3채널이면 픽셀마다 B, G, R 이 번갈아(인터리브) 놓인다' },
          { type: 'table', head: ['속성 / 메서드', '뜻', '예 (640×480 컬러)'], rows: [
            ['<code>Rows</code> = <code>Height</code>', '행 수 = 세로 픽셀 수', '480'],
            ['<code>Cols</code> = <code>Width</code>', '열 수 = 가로 픽셀 수', '640'],
            ['<code>Size()</code>', 'Size(너비, 높이) 구조체', '(width:640 height:480)'],
            ['<code>Channels()</code>', '픽셀 하나의 값 개수', '3 (B, G, R)'],
            ['<code>Depth()</code>', '값 하나의 자료형 번호 (CV_8U=0, CV_32F=5 …)', '0'],
            ['<code>Type()</code>', '깊이 + 채널 = MatType', 'CV_8UC3'],
            ['<code>ElemSize()</code>', '픽셀 하나의 바이트 수', '3'],
            ['<code>Total()</code>', '픽셀 수 = Rows × Cols', '307200'],
            ['<code>Empty()</code>', '비어 있는가 (읽기 실패 확인!)', 'False']
          ], caption: '표 1. Mat 의 기본 정보 — 속성(Rows)은 괄호 없이, 메서드(Channels())는 괄호와 함께' },
          { type: 'code', title: '예제 1: 이미지를 읽고 Mat 정보 출력', code: EX1_INFO,
            desc: '그레이와 컬러로 읽은 두 이미지의 정보를 비교합니다. <code>Width × Height</code> 는 같지만 <b>채널 수와 ElemSize</b> 가 달라 메모리가 3배 차이납니다. <code>Console.WriteLine(mat)</code> 은 크기 · 형식을 한 줄로 보여 줍니다.',
            expect: '--- 그레이 ---\nRows(행)=480, Cols(열)=640\nWidth=640, Height=480, Size=(width:640 height:480)\nChannels=1, Depth=0 (CV_8U=0)\nType=CV_8UC1, ElemSize=1 바이트\nTotal=307200 픽셀, 메모리=307200 바이트\nEmpty=False\n--- 컬러 ---\nChannels=3, Type=CV_8UC3, ElemSize=3\n메모리=921600 바이트\nMat [ 480*640*CV_8UC3, IsContinuous=True, IsSubmatrix=False ]' },
          { type: 'callout', kind: 'warn', title: '가장 흔한 실수: (행, 열) 과 (너비, 높이)', html: '<code>new Mat(480, 640, …)</code> 는 <b>(행 수, 열 수)</b> = (높이, 너비) 순서이고, <code>new Size(640, 480)</code> 은 <b>(너비, 높이)</b> 순서입니다. Python 의 <code>img.shape</code> 가 (h, w, ch) 인 것과 같은 이유입니다 — 행렬은 "행 × 열"로 말하고, 화면 크기는 "가로 × 세로"로 말하기 때문입니다.' },
          { type: 'h', text: 'MatType: CV_8UC3 을 읽는 법' },
          { type: 'figure', html: FIG_TYPE, caption: '그림 2. MatType 이름 = CV_ + 깊이(비트 수 + U/S/F) + C채널 수' },
          { type: 'table', head: ['깊이', 'C# 자료형', '범위', '주로 쓰는 곳'], rows: [
            ['<code>CV_8U</code>', '<code>byte</code>', '0 ~ 255', '보통의 이미지 · 마스크 (가장 많이 씀)'],
            ['<code>CV_8S</code>', '<code>sbyte</code>', '−128 ~ 127', '드묾'],
            ['<code>CV_16U</code>', '<code>ushort</code>', '0 ~ 65535', '고감도 카메라 · 깊이(depth) 카메라'],
            ['<code>CV_16S</code>', '<code>short</code>', '−32768 ~ 32767', 'Sobel 미분 결과 (음수 있음)'],
            ['<code>CV_32S</code>', '<code>int</code>', '정수', 'ConnectedComponents 의 라벨'],
            ['<code>CV_32F</code>', '<code>float</code>', '실수', '히스토그램 · 필터 계산 · DFT · 정규화(0~1)'],
            ['<code>CV_64F</code>', '<code>double</code>', '배정밀도 실수', '변환 행렬(GetRotationMatrix2D) · 카메라 행렬']
          ], caption: '표 2. 깊이(Depth)별 자료형 — At<T> 의 T 는 이 표의 C# 자료형과 맞아야 한다' },
          { type: 'code', title: '예제 2: MatType 해부 — Depth · Channels · ElemSize', code: EX1_TYPE,
            desc: '<code>MatType</code> 구조체의 <code>Depth</code>, <code>Channels</code> 속성으로 이름을 분해할 수 있습니다. <code>ElemSize</code> 는 (바이트 수) × (채널 수) 입니다: CV_64FC3 = 8 × 3 = 24 바이트. <code>img.Type() == MatType.CV_8UC3</code> 처럼 비교해 함수를 호출하기 전에 형식을 확인하는 습관을 들이세요.',
            expect: '형식       Depth Channels ElemSize\nCV_8UC1        0        1        1\nCV_8UC3        0        3        3\nCV_16UC1       2        1        2\nCV_32SC1       4        1        4\nCV_32FC1       5        1        4\nCV_64FC3       6        3       24\nimg.Type() == CV_8UC3 ? True\n깊이가 8비트인가? True\nMakeType(CV_32F, 2) = CV_32FC2' },
          { type: 'h', text: 'Mat 만들기: new Mat · Zeros · Ones · Eye' },
          { type: 'code', title: '예제 3: 작은 Mat 을 만들어 Dump 로 들여다보기', code: EX1_CREATE,
            desc: '<code>Dump()</code> 는 작은 Mat 의 모든 값을 문자열로 보여 줍니다 (큰 이미지에는 쓰지 마세요!). <code>new Mat(행, 열, 형식, 초깃값)</code> 의 초깃값은 <b>Scalar</b> — 3채널이면 <code>new Scalar(B, G, R)</code>. 3채널 Dump 에서 한 픽셀이 값 3개로 나오는 것(<code>1, 2, 3, 1, 2, 3, …</code>)이 그림 1 의 인터리브 배치입니다.',
            expect: 'a = Mat [ 3*4*CV_8UC1, IsContinuous=True, IsSubmatrix=False ]\n[7, 7, 7, 7;\n 7, 7, 7, 7;\n 7, 7, 7, 7]\nZeros:\n[0, 0, 0;\n 0, 0, 0]\nOnes:\n[1, 1, 1;\n 1, 1, 1]\nEye (float):\n[1, 0, 0;\n 0, 1, 0;\n 0, 0, 1]\nc: Rows=2, Cols=4, Type=CV_8UC3\n[1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3;\n 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]' },
          { type: 'callout', kind: 'warn', title: '초깃값 없이 만든 Mat 은 쓰레기값', html: '<code>new Mat(480, 640, MatType.CV_8UC1)</code> 처럼 초깃값을 생략하면 메모리만 잡고 <b>내용은 정해지지 않습니다</b>(이전에 쓰던 값이 남아 있을 수 있음). 반복문으로 모든 픽셀을 채울 것이 아니라면 <code>Mat.Zeros</code> 나 <code>new Scalar(0)</code> 초깃값을 쓰세요. 또 <code>Cv2.*</code> 함수의 출력용 Mat 은 <code>new Mat()</code>(빈 Mat)으로 만들면 함수가 알맞은 크기로 채워 줍니다.' },
          { type: 'h', text: '자주 쓰는 구조체: Size · Point · Rect · Scalar' },
          { type: 'code', title: '예제 4: Size · Point · Rect · Scalar 다루기', code: EX1_STRUCTS,
            desc: '네 구조체는 앞으로 모든 OpenCV 함수의 인수로 쓰입니다. <code>Rect</code> 는 <code>Right/Bottom/Center/Contains/Intersect</code> 같은 편리한 멤버가 있습니다. <code>Scalar</code> 는 값 4개(<code>Val0~Val3</code>)를 담는 그릇으로, 색(B, G, R)이나 <code>Cv2.Mean</code> 의 채널별 결과를 나타냅니다. <code>Scalar.Red</code> 같은 상수도 BGR 순서로 정의되어 있습니다.',
            expect: 'Size: (width:640 height:480), 넓이=307200\nPoint: (x:100 y:50), X=100, Y=50\nRect: (x:100 y:50 width:200 height:120)\n  Right=300, Bottom=170, Center=(x:200 y:110)\n  (150, 100) 포함? True\n  (400, 100) 포함? False\n  교집합: (x:200 y:100 width:100 height:70)\nScalar: [0, 0, 255, 0], Val2(R)=255\nScalar.Red=[0, 0, 255, 0], Scalar.Blue=[255, 0, 0, 0]\nScalar.Yellow=[0, 255, 255, 0] (B=0, G=255, R=255)' },
          { type: 'code', title: '예제 5: 캔버스 만들어 표시하기', code: EX1_CANVAS,
            desc: '결과 창의 캔버스 위에 마우스를 올려 픽셀 값이 <b>(200, 150, 80)</b> 으로 나오는지 확인하세요. 값을 <code>new Scalar(0, 0, 255)</code> 로 바꾸면 무슨 색이 될까요? (BGR 이므로 빨강)',
            expect: 'canvas: (width:640 height:480) CV_8UC3\nblack : (width:320 height:240) CV_8UC3\nwhite : (width:320 height:240) CV_8UC1' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: 'WPF 의 <code>BitmapSource</code> 도 같은 정보를 <code>PixelWidth</code> · <code>PixelHeight</code> · <code>Format</code>(Bgr24 = CV_8UC3, Gray8 = CV_8UC1) 으로 가지고 있습니다. <code>BitmapSourceConverter.ToBitmapSource(mat)</code> 은 Mat 의 <b>채널 수를 보고</b> 알맞은 PixelFormat 을 고르므로 CV_8UC1 · CV_8UC3 · CV_8UC4 를 그대로 넘기면 됩니다. 단 <b>CV_32F 같은 실수 Mat 은 먼저 <code>ConvertTo(CV_8U)</code></b>로 바꿔야 화면에 제대로 나옵니다 (3교시).' },
          { type: 'callout', kind: 'tip', title: 'Python 과 비교', html: '<code>img.shape</code> → <code>(img.Rows, img.Cols, img.Channels())</code>, <code>img.dtype == np.uint8</code> → <code>img.Depth() == MatType.CV_8U</code>, <code>np.zeros((h, w), np.uint8)</code> → <code>Mat.Zeros(h, w, MatType.CV_8UC1)</code>, <code>img.size</code>(원소 수) → <code>img.Total() * img.Channels()</code>.' }
        ],
        practice: [
          {
            title: '여러 형식의 Mat 정보 표 만들기', level: 1,
            desc: '아래 표의 Mat 4개를 만들어 <b>이름 · Rows · Cols · Channels · ElemSize · 전체 바이트</b>를 한 줄씩 출력하세요. 전체 바이트 = <code>Total() * ElemSize()</code>.<br>① 그레이 320×240 (CV_8UC1) ② 컬러 320×240 (CV_8UC3) ③ 실수 100×100 (CV_32FC1) ④ 16비트 2채널 64×64 (CV_16UC2)',
            hint: '<code>new Mat(행, 열, 형식)</code> 의 행 = 세로(240), 열 = 가로(320) 입니다. ElemSize 는 (바이트 수 × 채널 수): CV_16UC2 = 2 × 2 = 4.',
            expect: 'gray   Rows=240 Cols=320 Ch=1 ElemSize=1 Bytes=76800\ncolor  Rows=240 Cols=320 Ch=3 ElemSize=3 Bytes=230400\nfloat  Rows=100 Cols=100 Ch=1 ElemSize=4 Bytes=40000\nu16c2  Rows=64 Cols=64 Ch=2 ElemSize=4 Bytes=16384',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = new Mat(240, 320, MatType.CV_8UC1, new Scalar(0));
        Print("gray", gray);
        // TODO: color (320×240, CV_8UC3), floatMat (100×100, CV_32FC1), u16c2 (64×64, CV_16UC2) 를 만들어 Print 하세요
    }

    static void Print(string name, Mat m)
    {
        // TODO: Rows · Cols · Channels() · ElemSize() · Total()*ElemSize() 를 출력하세요
        Console.WriteLine($"{name.PadRight(6)} Rows={m.Rows}");
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = new Mat(240, 320, MatType.CV_8UC1, new Scalar(0));
        using var color = new Mat(240, 320, MatType.CV_8UC3, new Scalar(0));
        using var floatMat = new Mat(100, 100, MatType.CV_32FC1, new Scalar(0));
        using var u16c2 = new Mat(64, 64, MatType.CV_16UC2, new Scalar(0));
        Print("gray", gray);
        Print("color", color);
        Print("float", floatMat);
        Print("u16c2", u16c2);
    }

    static void Print(string name, Mat m)
    {
        Console.WriteLine($"{name.PadRight(6)} Rows={m.Rows} Cols={m.Cols} Ch={m.Channels()} ElemSize={m.ElemSize()} Bytes={m.Total() * m.ElemSize()}");
    }
}`
          },
          {
            title: '이미지 파일의 메모리 크기 계산기', level: 2,
            desc: '<code>images/sample_color.png</code> 를 <b>컬러</b>와 <b>그레이</b>로 각각 읽어, 메모리 크기를 바이트와 KB(소수 첫째 자리, 1 KB = 1024 바이트)로 출력하고 두 배율(컬러 ÷ 그레이)을 출력하세요. 또 <code>images/plate_holes.png</code>(800×600) 를 읽어 그레이 크기를 출력하세요.',
            hint: '<code>long bytes = m.Total() * m.ElemSize();</code> → <code>bytes / 1024.0</code> 을 <code>{v:F1}</code> 로. 배율은 <code>(double)colorBytes / grayBytes</code>.',
            expect: 'sample_color 컬러: 921600 바이트 = 900.0 KB\nsample_color 그레이: 307200 바이트 = 300.0 KB\n배율: 3.0\nplate_holes 그레이: 800x600 = 480000 바이트 = 468.8 KB',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var color = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        using var gray = Cv2.ImRead("images/sample_color.png", ImreadModes.Grayscale);
        long colorBytes = color.Total() * color.ElemSize();
        Console.WriteLine($"sample_color 컬러: {colorBytes} 바이트 = {colorBytes / 1024.0:F1} KB");
        // TODO: 그레이 크기, 배율(컬러 ÷ 그레이) 출력

        // TODO: images/plate_holes.png 를 그레이로 읽어 "WxH = N 바이트 = K KB" 출력
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var color = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        using var gray = Cv2.ImRead("images/sample_color.png", ImreadModes.Grayscale);
        long colorBytes = color.Total() * color.ElemSize();
        long grayBytes = gray.Total() * gray.ElemSize();
        Console.WriteLine($"sample_color 컬러: {colorBytes} 바이트 = {colorBytes / 1024.0:F1} KB");
        Console.WriteLine($"sample_color 그레이: {grayBytes} 바이트 = {grayBytes / 1024.0:F1} KB");
        Console.WriteLine($"배율: {(double)colorBytes / grayBytes:F1}");

        using var plate = Cv2.ImRead("images/plate_holes.png", ImreadModes.Grayscale);
        long plateBytes = plate.Total() * plate.ElemSize();
        Console.WriteLine($"plate_holes 그레이: {plate.Width}x{plate.Height} = {plateBytes} 바이트 = {plateBytes / 1024.0:F1} KB");
    }
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: 'Mat 과 픽셀: 이미지 자료 구조', subtitle: '1교시 — Mat 의 구조: 행 · 열 · 채널 · 깊이', notes: '<p>💬 "사진은 컴퓨터 안에 어떤 모양으로 들어 있을까?" — 예상 답: 점들의 모임, 숫자. 오늘은 그 숫자 표(Mat)를 해부합니다. 이 차시는 이후 모든 차시의 기초이므로 천천히, 실행해 보며 진행합니다. (3분)</p>' },
          { layout: 'bullets', title: '이미지 = 숫자로 채워진 표', lead: 'Mat (Matrix, 행렬)', bullets: [
            '그레이 이미지: 칸마다 밝기 1개 (0 검정 ~ 255 흰색)',
            '컬러 이미지: 칸마다 <b>B, G, R</b> 3개 (OpenCV 는 BGR 순서!)',
            'OpenCV 는 이 표를 <b>Mat</b> 클래스로 다룬다 — Python 의 numpy 배열',
            '<code>Cv2.ImRead</code> 가 돌려주는 것도, 모든 함수가 주고받는 것도 Mat',
            ['Mat 의 4가지 핵심 정보', ['행 수 Rows(높이) · 열 수 Cols(너비)', '채널 수 Channels() · 깊이 Depth() → 합쳐서 Type()']]
          ], notes: '<p>결과 창에서 이미지 위에 마우스를 올려 픽셀 값을 보여 주며 "칸마다 숫자"를 확인시킵니다. 💬 "컬러 픽셀 하나에는 숫자가 몇 개?" — 3개(B, G, R). (5분)</p>' },
          { layout: 'diagram', title: 'Mat 의 메모리 배치', html: FIG_MAT, caption: '행 우선(row-major): 행 0, 행 1, … 을 이어 붙인 1차원 메모리. 3채널은 B G R 이 픽셀마다 번갈아(인터리브) 놓인다', notes: '<p>색칠한 픽셀 (행 1, 열 3) 의 메모리 위치 = 1 × 5 + 3 = 8 을 함께 계산합니다. 이 배치를 알면 <code>At(y, x)</code> 가 왜 (행, 열) 순서인지, ElemSize/Step 이 무엇인지 이해됩니다. 3채널의 B G R 인터리브는 5차시(채널 분리)에서 다시 나옵니다. (5분)</p>' },
          { layout: 'code', title: '예제 1: Mat 정보 읽기', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var color = Cv2.ImRead("images/sample_color.png");

        Console.WriteLine($"Rows={gray.Rows}, Cols={gray.Cols}, Size={gray.Size()}");
        Console.WriteLine($"Channels={gray.Channels()}, Type={gray.Type()}");
        Console.WriteLine($"ElemSize={gray.ElemSize()}, Total={gray.Total()}");
        Console.WriteLine($"메모리={gray.Total() * gray.ElemSize()} 바이트");

        Console.WriteLine($"컬러: Channels={color.Channels()}, Type={color.Type()}");
        Console.WriteLine($"컬러 메모리={color.Total() * color.ElemSize()} 바이트");
        Console.WriteLine(color);
    }
}`, points: ['속성은 괄호 없이(<code>Rows</code>), 메서드는 괄호(<code>Channels()</code>)', '컬러는 ElemSize 3 → 메모리 3배 (921,600 바이트)', '<code>Console.WriteLine(mat)</code> 으로 한 줄 요약', '<code>Empty()</code> 로 읽기 실패 확인'], notes: '<p>실행 후 두 이미지의 차이(채널 수 · ElemSize · 메모리)를 짚습니다. 💬 "그레이 이미지는 왜 메모리가 1/3 일까?" 학생들에게 <code>ImreadModes.Grayscale</code> 을 지우고 다시 실행해 값이 바뀌는 것을 보게 합니다. (7분)</p>' },
          { layout: 'diagram', title: 'MatType 이름 읽기: CV_8UC3', html: FIG_TYPE, caption: 'CV_ + 비트 수 + U(부호 없음)/S(부호)/F(실수) + C채널 수', notes: '<p>이름을 소리 내어 읽게 합니다: "씨브이 8 유 씨 3 = 8비트 부호 없는 정수, 3채널". 💬 "CV_32FC1 은?" — 32비트 실수 1채널. 💬 "히스토그램 결과처럼 소수점이 필요하면?" — 32F. 표 2(깊이별 자료형)로 넘어가 At&lt;T&gt; 의 T 와 연결합니다. (5분)</p>' },
          { layout: 'table', title: '깊이(Depth)와 C# 자료형', head: ['깊이', 'C# 형', '범위', '쓰는 곳'], rows: [
            ['CV_8U', 'byte', '0~255', '보통 이미지 · 마스크'],
            ['CV_16U', 'ushort', '0~65535', '고감도 · 깊이 카메라'],
            ['CV_16S', 'short', '±32767', 'Sobel 미분 (음수)'],
            ['CV_32S', 'int', '정수', '연결 요소 라벨'],
            ['CV_32F', 'float', '실수', '히스토그램 · 0~1 정규화'],
            ['CV_64F', 'double', '실수', '변환 행렬']
          ], lead: 'At<T> 의 T 는 이 표의 C# 형과 맞아야 한다', notes: '<p>지금은 CV_8U 만 확실히 알면 됩니다. 나머지는 해당 차시(에지 검출 · 히스토그램 · 기하 변환)에서 다시 만납니다. "형이 안 맞으면 값이 엉뚱하게 나오거나 오류" 를 예고합니다. (3분)</p>' },
          { layout: 'code', title: '예제 3: Mat 만들기 · Dump', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var a = new Mat(3, 4, MatType.CV_8UC1, new Scalar(7));   // (행, 열)
        Console.WriteLine(a.Dump());

        using var z = Mat.Zeros(2, 3, MatType.CV_8UC1);
        using var e = Mat.Eye(3, 3, MatType.CV_32FC1);
        Console.WriteLine(z.Dump());
        Console.WriteLine(e.Dump());

        // Size 는 (너비, 높이) 순서! 3채널 초깃값은 (B, G, R)
        using var c = new Mat(new Size(4, 2), MatType.CV_8UC3, new Scalar(1, 2, 3));
        Console.WriteLine($"Rows={c.Rows}, Cols={c.Cols}");
        Console.WriteLine(c.Dump());
    }
}`, points: ['<code>new Mat(행, 열, 형식, 초깃값)</code> vs <code>new Size(너비, 높이)</code>', '<code>Dump()</code> 는 작은 Mat 확인용 (큰 이미지 금지)', '3채널 Dump: 픽셀마다 1, 2, 3 이 반복 = 인터리브', '초깃값 생략 = 쓰레기값 → Zeros 나 Scalar 를 주자'], notes: '<p>Dump 출력의 행 개수 · 열 개수를 세어 보게 합니다. c 의 Dump 에서 한 행에 값이 12개(4픽셀 × 3채널)인 이유를 그림 1 과 연결합니다. 💬 "<code>new Mat(4, 2, …)</code> 로 바꾸면 Rows 는?" — 4. (7분)</p>' },
          { layout: 'two', title: 'Size · Point · Rect · Scalar', left: { title: '구조체', bullets: ['<code>new Size(너비, 높이)</code>', '<code>new Point(x, y)</code>', '<code>new Rect(x, y, 너비, 높이)</code> — Right · Bottom · Center · Contains · Intersect', '<code>new Scalar(B, G, R)</code> — Val0~Val3', '<code>Scalar.Red</code> = [0, 0, 255, 0]'] }, right: { title: '어디에 쓰나', bullets: ['<code>Cv2.Resize(src, dst, new Size(320, 240))</code>', '<code>Cv2.Circle(img, new Point(x, y), r, color)</code>', '<code>new Mat(img, new Rect(...))</code> — ROI (3교시)', '<code>Cv2.Mean(img)</code> → Scalar (채널별 평균)', 'Python 의 튜플 (w, h), (x, y) 에 해당'] }, notes: '<p>네 구조체는 앞으로 매 시간 나옵니다. 특히 Scalar 는 "색"이면서 "채널별 값 4개의 그릇"이라는 점을 강조 — <code>Cv2.Mean(color).Val2</code> 는 R 채널 평균. 예제 4 를 실행해 Rect 의 Contains/Intersect 를 확인합니다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>new Mat(480, 640, MatType.CV_8UC3)</code> 로 만든 Mat 의 <code>Width</code> 는?', options: ['480', '640', '3', '921600'], answer: 1, explain: '생성자는 (행 수, 열 수) = (높이, 너비). 행 480 = Height, 열 640 = Width.', notes: '<p>정답 2번(640). 많이 틀리는 문제이니 손을 들어 답하게 하고, 틀린 학생에게는 "행렬은 행×열, 화면은 가로×세로" 로 정리해 줍니다. (3분)</p>' },
          { layout: 'practice', title: '실습: 여러 형식의 Mat 정보 표', desc: '<p>4개의 Mat 을 만들어 Rows · Cols · Channels · ElemSize · 전체 바이트를 출력하세요.</p><ul><li>그레이 320×240 CV_8UC1 · 컬러 320×240 CV_8UC3</li><li>실수 100×100 CV_32FC1 · 16비트 2채널 64×64 CV_16UC2</li><li>전체 바이트 = <code>Total() * ElemSize()</code></li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = new Mat(240, 320, MatType.CV_8UC1, new Scalar(0));
        Print("gray", gray);
        // TODO: color, floatMat, u16c2 를 만들어 Print
    }

    static void Print(string name, Mat m)
    {
        // TODO: Rows · Cols · Channels() · ElemSize() · 전체 바이트
        Console.WriteLine($"{name.PadRight(6)} Rows={m.Rows}");
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = new Mat(240, 320, MatType.CV_8UC1, new Scalar(0));
        using var color = new Mat(240, 320, MatType.CV_8UC3, new Scalar(0));
        using var floatMat = new Mat(100, 100, MatType.CV_32FC1, new Scalar(0));
        using var u16c2 = new Mat(64, 64, MatType.CV_16UC2, new Scalar(0));
        Print("gray", gray); Print("color", color); Print("float", floatMat); Print("u16c2", u16c2);
    }

    static void Print(string name, Mat m)
    {
        Console.WriteLine($"{name.PadRight(6)} Rows={m.Rows} Cols={m.Cols} Ch={m.Channels()} ElemSize={m.ElemSize()} Bytes={m.Total() * m.ElemSize()}");
    }
}`, notes: '<p>정답: 76800 / 230400 / 40000 / 16384 바이트. CV_16UC2 의 ElemSize 가 4(2바이트 × 2채널)인 이유를 확인합니다. 빨리 끝난 학생은 실습 2(파일 메모리 계산기)로. (7분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['이미지 = 숫자 표 = <b>Mat</b>. 행 우선 메모리, 3채널은 B G R 인터리브', '<b>Rows/Cols</b>(=Height/Width) · <b>Channels()</b> · <b>Depth()</b> · <b>Type()</b> · ElemSize() · Total()', 'MatType 이름: CV_ + 비트 수 + U/S/F + C채널 수 → <b>CV_8UC3</b> = byte 3채널', '<code>new Mat(행, 열, 형식, Scalar)</code> · Zeros/Ones/Eye · <code>new Size(너비, 높이)</code>', '다음 교시: 픽셀을 직접 읽고 쓰기 — At&lt;T&gt;(y, x) 와 Vec3b'], notes: '<p>세 가지를 다시 말하게 합니다: ① (행, 열) vs (너비, 높이) ② CV_8UC3 의 뜻 ③ ElemSize × Total = 메모리. 다음 교시에서 At&lt;byte&gt; 와 At&lt;Vec3b&gt; 로 픽셀을 읽는다고 예고. (2분)</p>' }
        ]
      },

      // ================================================================ 2교시
      {
        id: 'cs03-2', title: '픽셀 접근: At · Get · Set · 인덱서', minutes: 50,
        goals: ['At<byte>/Get<byte>/Set<byte> 와 GetGenericIndexer 로 픽셀을 (행 y, 열 x) 순서로 읽고 쓸 수 있다', '컬러 픽셀을 Vec3b 로 읽어 Item0/1/2 = B/G/R 로 해석할 수 있다', '반복문으로 그라데이션 · 반전 · 픽셀 세기를 구현하고, Cv2 함수가 왜 빠른지 설명할 수 있다'],
        flow: [['도입: 픽셀 하나 읽기', 5], ['At · Vec3b · 인덱서', 15], ['반복문 실습', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '픽셀 하나 읽고 쓰기: At<T>(y, x)' },
          { type: 'p', html: 'Mat 의 픽셀은 <code>img.At&lt;T&gt;(행, 열)</code> 로 읽습니다. <b>T 는 픽셀의 자료형</b> — CV_8UC1 이면 <code>byte</code>, CV_8UC3 이면 <code>Vec3b</code>(byte 3개), CV_32FC1 이면 <code>float</code> 입니다. <code>Get&lt;T&gt;</code> 는 At 과 같고, <code>Set&lt;T&gt;(y, x, 값)</code> 으로 씁니다. 순서는 <b>(행 y, 열 x)</b> — Python 의 <code>img[y, x]</code> 와 같습니다.' },
          { type: 'figure', html: FIG_YX, caption: '그림 3. 같은 픽셀도 Mat 접근은 (행 y, 열 x), 함수의 점 · 사각형은 (x, y) — 이 두 규칙을 섞으면 안 된다' },
          { type: 'code', title: '예제 1: 작은 Mat 에서 Get · Set · At · 인덱서', code: EX2_GETSET,
            desc: '<code>GetGenericIndexer&lt;T&gt;()</code> 는 <code>idx[y, x]</code> 처럼 배열같이 쓰는 인덱서를 돌려줍니다. 원본 Mat 의 메모리에 직접 읽고 쓰므로 <code>Set</code> 과 결과가 같고, 반복문에서는 더 빠르고 코드가 짧습니다. Dump 로 어느 칸이 바뀌었는지 확인하세요.',
            expect: '처음:\n[10, 10, 10, 10, 10;\n 10, 10, 10, 10, 10;\n 10, 10, 10, 10, 10]\nAt(1,3)=200, Get(2,0)=10\n바꾼 뒤:\n[1, 10, 10, 10, 10;\n 10, 10, 10, 200, 10;\n 10, 10, 10, 10, 200]\n합계=521, 평균=34.7' },
          { type: 'h', text: '컬러 픽셀: Vec3b 와 Item0 · Item1 · Item2' },
          { type: 'p', html: '3채널 Mat 의 픽셀은 <b>Vec3b</b>(Vector of 3 bytes) 입니다. <code>Item0 = B</code>, <code>Item1 = G</code>, <code>Item2 = R</code> — OpenCV 의 BGR 순서 그대로입니다. <code>new Vec3b(b, g, r)</code> 로 만들어 <code>Set</code> 이나 인덱서로 쓸 수 있습니다.' },
          { type: 'code', title: '예제 2: 컬러 이미지 픽셀 읽기 · 쓰기', code: EX2_COLOR,
            desc: '<code>images/sample_color.png</code> 의 빨간 원 중심은 (x=120, y=110) 이므로 <code>At&lt;Vec3b&gt;(110, 120)</code> 으로 읽습니다. 합성 이미지에 센서 잡음이 들어 있어 값이 기준색 (40, 40, 210) 근처에서 조금 다릅니다. 결과 창에서 노란 점(BGR 0, 255, 255)이 원 중심에 찍힌 것을 확대해 보세요.',
            expect: '빨간 원  : B=37 G=37 R=196\n초록 사각: B=56 G=159 R=56\n파란 삼각: B=189 G=85 R=29\nToString: Vec3b(37, 37, 196)\n바꾼 뒤 (110,120): Vec3b(0, 255, 255)' },
          { type: 'callout', kind: 'warn', title: '자료형이 맞지 않으면', html: '<code>CV_8UC1</code>(byte) Mat 을 <code>At&lt;int&gt;</code> 로 읽으면 진짜 OpenCvSharp 에서는 <b>byte 4개를 int 하나로 해석</b>해 엉뚱한 값이 나오고, 이미지 끝에서는 메모리 오류가 날 수 있습니다 (이 실습 환경은 경고를 띄워 줍니다). 3채널을 <code>At&lt;byte&gt;</code> 로 읽으면 B 값만 읽히거나 오류가 납니다. <b>Type() 을 확인하고 표 2 의 자료형을 쓰세요</b>: CV_8UC1 → byte, CV_8UC3 → Vec3b, CV_32FC1 → float, CV_16SC1 → short, CV_32SC1 → int.' },
          { type: 'h', text: '반복문으로 이미지 만들기' },
          { type: 'code', title: '예제 3: 그라데이션 만들기 (그레이 · 컬러)', code: EX2_GRADIENT,
            desc: '바깥 반복이 <b>행(y)</b>, 안쪽 반복이 <b>열(x)</b> 인 이중 for 문이 픽셀 처리의 기본 틀입니다 (메모리 순서와 같아 빠릅니다). <code>(byte)x</code> 처럼 명시적으로 형 변환해야 합니다. 컬러 그라데이션에서 B 는 가로, G 는 세로로 커지는 것을 결과 창에서 확인하세요.',
            expect: 'g(0,0)=0, g(0,255)=255, g(100,60)=60\nc(0,0)=Vec3b(0, 0, 128)\nc(255,255)=Vec3b(255, 255, 128)\nc(200,50)=Vec3b(50, 200, 128)   // B=x=50, G=y=200' },
          { type: 'code', title: '예제 4: 밝기 반전 — 반복문 vs Cv2.BitwiseNot (속도 비교)', code: EX2_INVERT, nondeterministic: true,
            desc: '640×480 = 307,200 픽셀을 반복문으로 처리하면 이 브라우저 인터프리터에서 수 초, 진짜 .NET 에서도 수 ms 가 걸리지만 <code>Cv2.BitwiseNot</code> 은 네이티브 C++ 코드(SIMD 최적화)로 훨씬 빠릅니다. 두 결과가 완전히 같은지 <code>Absdiff</code> + <code>CountNonZero</code> 로 확인합니다 (0 = 같음). 시간은 PC 마다 다릅니다.' },
          { type: 'callout', kind: 'tip', title: '픽셀 반복 대신 Cv2 함수를 쓰는 이유', html: '<ul><li><b>속도</b>: Cv2 함수는 C++ 로 컴파일된 코드가 메모리를 한 번에 훑습니다. C# 반복문의 <code>At&lt;T&gt;</code> 는 호출마다 범위 검사가 들어가 수십 배 느립니다 (인터프리터는 수백 배).</li><li><b>정확성</b>: 포화 연산 · 경계 처리 · 반올림을 OpenCV 가 알아서 합니다.</li><li><b>가독성</b>: <code>Cv2.BitwiseNot(img, dst)</code> 한 줄이 이중 반복 7줄보다 읽기 쉽습니다.</li></ul>반복문은 <b>원리를 익힐 때</b>와 <b>Cv2 에 없는 특수 규칙</b>(예: 픽셀별 조건이 복잡한 분류)에만 쓰고, 그때도 <code>GetGenericIndexer</code> 를 쓰세요. 진짜 .NET 에서 극한 속도가 필요하면 <code>unsafe</code> 포인터(<code>img.DataPointer</code>)나 <code>Span&lt;byte&gt;</code> 를 씁니다 — 이 강좌 범위 밖입니다.' },
          { type: 'code', title: '예제 5: 특정 색 픽셀 세기 — 반복문과 InRange 비교', code: EX2_COUNT,
            desc: '빨간 원 주변의 100×100 영역(10,000 픽셀)만 반복해 "R 이 크고 G, B 가 작은" 픽셀을 셉니다 — 원 넓이 π·34² ≈ 3632 와 비슷하게 나옵니다. 같은 조건을 전체 이미지에 <code>Cv2.InRange</code>(하한 ≤ 값 ≤ 상한인 픽셀을 255 로) 한 줄로 적용하면 빨간 원 <b>2개</b>가 세어집니다. 색으로 물체를 찾는 본격적인 방법(HSV)은 5차시에서 배웁니다.',
            expect: '반복문으로 센 빨간 픽셀 (ROI 안): 3634\n원 넓이 π×34² ≈ 3632\nInRange 로 센 빨간 픽셀 (전체): 7260' },
          { type: 'h', text: '흔한 실수 두 가지' },
          { type: 'code', title: '예제 6: (x, y) 순서 실수와 자료형 실수 잡아 보기', code: EX2_MISTAKES,
            desc: '640×480 이미지에서 <code>At(600, 100)</code> 은 "600행" 을 요구하므로 범위 초과입니다. x=600 이 열로는 유효하기 때문에 이런 실수는 <b>가로가 긴 이미지의 오른쪽 픽셀</b>을 읽을 때 갑자기 터집니다. 두 번째는 1채널 Mat 을 Vec3b 로 읽는 경우 — 이 실습 환경은 친절한 메시지의 ArgumentException 을 던집니다.',
            expect: '크기: Rows=480, Cols=640\n실수 1 → IndexOutOfRangeException: At(600, 100) 은 (행, 열)! At(100, 600) 이 맞다\nAt(100, 600) = 25\n실수 2 → ArgumentException: CV_8UC1 은 byte 로, CV_8UC3 은 Vec3b 로 읽어야 한다' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: 'WPF 앱에서 <code>Image</code> 컨트롤 위의 마우스 좌표를 얻으면 <code>e.GetPosition(imageControl)</code> 은 <b>컨트롤 좌표</b>(x, y, double)입니다. 이미지가 컨트롤 크기에 맞춰 늘어나 있으면 <code>x * mat.Width / imageControl.ActualWidth</code> 처럼 <b>비율로 환산</b>한 뒤 <code>(int)</code> 로 잘라 <code>mat.At&lt;Vec3b&gt;((int)py, (int)px)</code> 로 읽습니다 — 여기서도 (y, x) 순서! 결과 창의 좌표 · 픽셀 값 표시가 바로 이 기능입니다 (16차시 스튜디오 앱에서 구현).' }
        ],
        practice: [
          {
            title: '체커보드 만들기', level: 1,
            desc: '256×256 그레이 Mat 에 <b>8×8 칸 체커보드</b>(한 칸 32 픽셀)를 반복문으로 그리세요. (행 번호 ÷ 32 + 열 번호 ÷ 32) 가 짝수면 255(흰색), 홀수면 0(검정). 흰 픽셀 수를 <code>Cv2.CountNonZero</code> 로 출력하고 이미지를 표시하세요.',
            hint: '<code>int cy = y / 32, cx = x / 32;</code> → <code>(cy + cx) % 2 == 0</code> 이면 흰색. 인덱서 <code>idx[y, x] = 255;</code> 로 쓰기.',
            expect: '흰 픽셀 수: 32768 (전체의 50.0%)\n(0,0)=255, (0,32)=0, (32,32)=255',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var board = new Mat(256, 256, MatType.CV_8UC1, new Scalar(0));
        var idx = board.GetGenericIndexer<byte>();
        for (int y = 0; y < board.Rows; y++)
            for (int x = 0; x < board.Cols; x++)
            {
                // TODO: 칸 번호 (y / 32, x / 32) 의 합이 짝수면 255
            }
        int white = Cv2.CountNonZero(board);
        Console.WriteLine($"흰 픽셀 수: {white} (전체의 {100.0 * white / board.Total():F1}%)");
        Console.WriteLine($"(0,0)={board.At<byte>(0, 0)}, (0,32)={board.At<byte>(0, 32)}, (32,32)={board.At<byte>(32, 32)}");
        Cv2.ImShow("checkerboard", board);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var board = new Mat(256, 256, MatType.CV_8UC1, new Scalar(0));
        var idx = board.GetGenericIndexer<byte>();
        for (int y = 0; y < board.Rows; y++)
            for (int x = 0; x < board.Cols; x++)
            {
                int cy = y / 32, cx = x / 32;
                if ((cy + cx) % 2 == 0) idx[y, x] = 255;
            }
        int white = Cv2.CountNonZero(board);
        Console.WriteLine($"흰 픽셀 수: {white} (전체의 {100.0 * white / board.Total():F1}%)");
        Console.WriteLine($"(0,0)={board.At<byte>(0, 0)}, (0,32)={board.At<byte>(0, 32)}, (32,32)={board.At<byte>(32, 32)}");
        Cv2.ImShow("checkerboard", board);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '밝은 픽셀 세기: 반복문과 Threshold 비교', level: 2,
            desc: '<code>images/washers.png</code>(백라이트 — 배경이 밝고 부품이 어둡다) 의 왼쪽 위 200×200 영역(<code>Rect(0, 0, 200, 200)</code>)에서 밝기가 <b>200 이상</b>인 픽셀(= 배경) 수를 반복문으로 세세요. 그다음 같은 영역을 ROI 로 잘라 <code>Cv2.Threshold(roi, bin, 199, 255, ThresholdTypes.Binary)</code> + <code>Cv2.CountNonZero</code> 로 센 값과 같은지 출력하세요. 전체 40,000 픽셀에서 배경을 뺀 나머지가 와셔 2개(W1 · W2)의 면적입니다.',
            hint: '<code>using var roi = img[new Rect(0, 0, 200, 200)];</code> 는 3교시 내용이지만 미리 써 봅니다. Threshold 는 "199 보다 크면 255" 이므로 200 이상과 같습니다.',
            expect: '반복문: 30922\nThreshold: 30922, 같은가? True',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        var idx = img.GetGenericIndexer<byte>();
        int count = 0;
        // TODO: y 0~199, x 0~199 반복하며 idx[y, x] >= 200 이면 count++

        Console.WriteLine($"반복문: {count}");

        using var roi = img[new Rect(0, 0, 200, 200)];
        using var bin = new Mat();
        // TODO: Cv2.Threshold(roi, bin, 199, 255, ThresholdTypes.Binary) 후 CountNonZero
        int count2 = 0;
        Console.WriteLine($"Threshold: {count2}, 같은가? {count == count2}");
        Cv2.ImShow("roi", roi);
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
        var idx = img.GetGenericIndexer<byte>();
        int count = 0;
        for (int y = 0; y < 200; y++)
            for (int x = 0; x < 200; x++)
                if (idx[y, x] >= 200) count++;
        Console.WriteLine($"반복문: {count}");

        using var roi = img[new Rect(0, 0, 200, 200)];
        using var bin = new Mat();
        Cv2.Threshold(roi, bin, 199, 255, ThresholdTypes.Binary);
        int count2 = Cv2.CountNonZero(bin);
        Console.WriteLine($"Threshold: {count2}, 같은가? {count == count2}");
        Cv2.ImShow("roi", roi);
        Cv2.ImShow("bin", bin);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: 'Mat 과 픽셀: 이미지 자료 구조', subtitle: '2교시 — 픽셀 접근: At · Get · Set · 인덱서', notes: '<p>💬 "이미지 한가운데 픽셀이 얼마나 밝은지 코드로 어떻게 알까?" 지난 시간 Mat 구조를 떠올리게 하고, 오늘은 칸 하나하나를 직접 읽고 쓴다고 안내합니다. (2분)</p>' },
          { layout: 'diagram', title: '(행 y, 열 x) vs (x, y)', html: FIG_YX, caption: 'Mat 접근 At/Get/Set/인덱서 = (행, 열) · OpenCV 함수의 Point/Rect/Size = (x, y)', notes: '<p>이 차시에서 가장 중요한 슬라이드입니다. 같은 픽셀을 두 방식으로 적어 보게 합니다: 점 (x=4, y=2) → <code>At(2, 4)</code>, <code>new Point(4, 2)</code>. 💬 "왜 다를까?" — Mat 은 행렬(수학: 행 먼저), 점은 좌표(기하: x 먼저). Python 도 <code>img[y, x]</code> 와 <code>(x, y)</code> 로 똑같이 다르다고 알려 줍니다. (5분)</p>' },
          { layout: 'code', title: '예제 1: Get · Set · At · 인덱서', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var m = new Mat(3, 5, MatType.CV_8UC1, new Scalar(10));
        m.Set<byte>(1, 3, 200);                  // (행 1, 열 3) ← 200
        byte v = m.At<byte>(1, 3);               // 읽기 (Get 과 같음)
        Console.WriteLine($"At(1,3)={v}");

        var idx = m.GetGenericIndexer<byte>();   // 배열처럼 idx[y, x]
        idx[0, 0] = 1;
        idx[2, 4] = idx[1, 3];
        Console.WriteLine(m.Dump());

        int sum = 0;
        for (int y = 0; y < m.Rows; y++)
            for (int x = 0; x < m.Cols; x++)
                sum += idx[y, x];
        Console.WriteLine($"합계={sum}");
    }
}`, points: ['<code>At&lt;T&gt;</code> = <code>Get&lt;T&gt;</code>: 읽기, <code>Set&lt;T&gt;(y, x, 값)</code>: 쓰기', 'T 는 픽셀 자료형: CV_8UC1 → <code>byte</code>', '<code>GetGenericIndexer&lt;T&gt;()</code>: 반복문용 — 빠르고 짧다', '바깥 for = 행(y), 안쪽 for = 열(x)'], notes: '<p>Dump 로 바뀐 칸을 확인하게 합니다. "인덱서도 원본 메모리에 직접 쓴다" 를 강조 — 복사본이 아닙니다. 💬 "<code>idx[3, 0]</code> 을 읽으면?" — 행이 0~2 이므로 IndexOutOfRangeException. (6분)</p>' },
          { layout: 'code', title: '예제 2: 컬러 픽셀 = Vec3b', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");   // CV_8UC3

        Vec3b red = img.At<Vec3b>(110, 120);   // 빨간 원 중심 (x=120, y=110)
        Console.WriteLine($"B={red.Item0} G={red.Item1} R={red.Item2}");
        Console.WriteLine(red);                // Vec3b(b, g, r)

        // 원 중심에 10×10 노란 점 (B, G, R) = (0, 255, 255)
        var idx = img.GetGenericIndexer<Vec3b>();
        for (int y = 105; y < 115; y++)
            for (int x = 115; x < 125; x++)
                idx[y, x] = new Vec3b(0, 255, 255);

        Cv2.ImShow("sample_color", img);
        Cv2.WaitKey(0);
    }
}`, points: ['3채널 → <code>Vec3b</code> (byte 3개)', '<code>Item0 = B</code>, <code>Item1 = G</code>, <code>Item2 = R</code>', '<code>new Vec3b(b, g, r)</code> 로 쓰기', '중심 (x=120, y=110) → <code>At(110, 120)</code>'], notes: '<p>결과 창에서 원 중심을 확대해 노란 점을 보여 주고, 마우스로 픽셀 값을 읽어 콘솔 출력과 비교합니다. 💬 "R 값이 210 근처인데 왜 정확히 210 이 아닐까?" — 카메라 잡음을 흉내 낸 합성 이미지. (5분)</p>' },
          { layout: 'code', title: '예제 3: 반복문으로 그라데이션', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var g = new Mat(256, 256, MatType.CV_8UC1);
        var gi = g.GetGenericIndexer<byte>();
        for (int y = 0; y < g.Rows; y++)
            for (int x = 0; x < g.Cols; x++)
                gi[y, x] = (byte)x;                 // 밝기 = x
        using var c = new Mat(256, 256, MatType.CV_8UC3);
        var ci = c.GetGenericIndexer<Vec3b>();
        for (int y = 0; y < c.Rows; y++)
            for (int x = 0; x < c.Cols; x++)
                ci[y, x] = new Vec3b((byte)x, (byte)y, 128);   // B=x, G=y

        Console.WriteLine($"c(200,50)={c.At<Vec3b>(200, 50)}");
        Cv2.ImShow("gray", g);  Cv2.ImShow("color", c);
    }
}`, points: ['이중 for: 바깥 y(행) · 안쪽 x(열) = 메모리 순서', '<code>(byte)x</code> 형 변환 필수 (int → byte)', '65,536 픽셀 × 2 — 이 정도는 반복문도 OK', '초깃값 없이 만들었지만 모든 픽셀을 채우므로 OK'], notes: '<p>결과의 색 방향을 읽게 합니다: 오른쪽으로 갈수록 B 증가(파랗게), 아래로 갈수록 G 증가. 💬 "R = x 로 바꾸면?" 학생들이 직접 바꿔 실행. 세로 그라데이션(gi[y, x] = (byte)y) 도 시도. (7분)</p>' },
          { layout: 'two', title: '왜 반복문 대신 Cv2 함수를 쓰나', left: { title: '픽셀 반복문 (At / 인덱서)', bullets: ['307,200 픽셀 × 호출마다 범위 검사', '.NET 에서 수 ms ~ 수십 ms, 인터프리터는 수 초', '포화 · 경계 · 반올림을 직접 처리해야 함', '용도: <b>원리 학습</b>, Cv2 에 없는 특수 규칙'] }, right: { title: 'Cv2 함수 (BitwiseNot · Add · InRange …)', bullets: ['네이티브 C++ · SIMD 로 한 번에 훑음', '수십~수백 배 빠름', '포화 연산 등을 알아서 처리', '한 줄 — 읽기 쉽다', '용도: <b>실제 처리는 항상 이쪽</b>'] }, notes: '<p>예제 4 를 실행해 시간을 보여 줍니다 (브라우저: 반복문 수 초 vs Cv2 수 ms). "두 결과가 다른 픽셀 수: 0" 으로 결과가 같음을 확인. 진짜 .NET 은 반복문도 훨씬 빠르지만 비율은 비슷하다고 설명. (6분)</p>' },
          { layout: 'code', title: '예제 5: 조건에 맞는 픽셀 세기', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        var roi = new Rect(70, 60, 100, 100);         // 빨간 원 주변
        var idx = img.GetGenericIndexer<Vec3b>();  int red = 0;
        for (int y = roi.Top; y < roi.Bottom; y++)
            for (int x = roi.Left; x < roi.Right; x++)
            {
                Vec3b p = idx[y, x];
                if (p.Item2 > 150 && p.Item1 < 100 && p.Item0 < 100) red++;
            }
        Console.WriteLine($"반복문 (ROI): {red}, 원 넓이 ≈ {Math.PI * 34 * 34:F0}");
        using var mask = new Mat();     // 같은 조건을 전체 이미지에 한 줄로
        Cv2.InRange(img, new Scalar(0, 0, 151), new Scalar(99, 99, 255), mask);
        Console.WriteLine($"InRange (전체): {Cv2.CountNonZero(mask)}");
    }
}`, points: ['조건 판정은 Item2(R) · Item1(G) · Item0(B) 로', 'ROI 범위만 반복 → 10,000 번', '<code>Cv2.InRange(src, 하한, 상한, mask)</code>: 범위 안 = 255', '전체에서는 빨간 원 2개 → 약 2배'], notes: '<p>반복문 결과가 π·34² ≈ 3632 근처인지 확인합니다 (가장자리 블러 때문에 약간 다름). InRange 결과가 대략 2배인 이유 — 빨간 원이 2개. 색 기반 검출은 5차시(HSV)에서 제대로 배운다고 예고. (5분)</p>' },
          { layout: 'bullets', title: '흔한 실수 2가지', bullets: [
            '<b>(x, y) 순서 실수</b>: 640×480 에서 <code>At(600, 100)</code> → 행 600 은 없다 → IndexOutOfRangeException',
            '가로가 긴 이미지의 오른쪽 픽셀에서만 터지므로 "가끔 나는 버그"가 된다 — 처음부터 (y, x) 습관',
            '<b>자료형 실수</b>: CV_8UC3 를 <code>At&lt;byte&gt;</code>, CV_8UC1 을 <code>At&lt;Vec3b&gt;</code> 또는 <code>At&lt;int&gt;</code>',
            '진짜 .NET 에서는 엉뚱한 값 · 메모리 오류, 이 실습 환경에서는 예외/경고',
            '해결: <code>img.Type()</code> 을 출력해 확인 → 표 2 의 자료형을 쓴다'
          ], notes: '<p>예제 6 을 실행해 두 예외 메시지를 읽습니다. "예외 메시지를 읽는 습관"을 강조 — 메시지에 (행, 열) 힌트가 있습니다. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '컬러 이미지(CV_8UC3)에서 <code>x=200, y=50</code> 픽셀을 읽는 올바른 코드는?', options: ['<code>img.At&lt;byte&gt;(200, 50)</code>', '<code>img.At&lt;Vec3b&gt;(50, 200)</code>', '<code>img.At&lt;Vec3b&gt;(200, 50)</code>', '<code>img.At&lt;int&gt;(50, 200)</code>'], answer: 1, explain: '(행 y=50, 열 x=200) 순서 + 3채널은 Vec3b.', notes: '<p>정답 2번. 1번(byte)과 3번(순서)이 왜 틀렸는지 각각 말하게 합니다. (3분)</p>' },
          { layout: 'practice', title: '실습: 체커보드 만들기', desc: '<p>256×256 그레이 Mat 에 8×8 칸(한 칸 32px) 체커보드를 반복문으로 그리세요.</p><ul><li><code>(y / 32 + x / 32)</code> 가 짝수면 255</li><li><code>Cv2.CountNonZero</code> 로 흰 픽셀 수 출력 (정답 32768)</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var board = new Mat(256, 256, MatType.CV_8UC1, new Scalar(0));
        var idx = board.GetGenericIndexer<byte>();
        for (int y = 0; y < board.Rows; y++)
            for (int x = 0; x < board.Cols; x++)
            {
                // TODO: (y / 32 + x / 32) % 2 == 0 이면 idx[y, x] = 255
            }
        Console.WriteLine($"흰 픽셀 수: {Cv2.CountNonZero(board)}");
        Cv2.ImShow("checkerboard", board);
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var board = new Mat(256, 256, MatType.CV_8UC1, new Scalar(0));
        var idx = board.GetGenericIndexer<byte>();
        for (int y = 0; y < board.Rows; y++)
            for (int x = 0; x < board.Cols; x++)
                if ((y / 32 + x / 32) % 2 == 0) idx[y, x] = 255;
        Console.WriteLine($"흰 픽셀 수: {Cv2.CountNonZero(board)}");
        Cv2.ImShow("checkerboard", board);
        Cv2.WaitKey(0);
    }
}`, notes: '<p>정답 32768 (절반). 칸 크기를 16 으로 바꾸거나 컬러(Vec3b)로 두 색 체커보드를 만들어 보게 합니다. 빨리 끝난 학생은 실습 2(밝은 픽셀 세기 vs Threshold). (7분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<code>At&lt;T&gt;(y, x)</code> = <code>Get</code>, <code>Set&lt;T&gt;(y, x, v)</code>, 반복문은 <code>GetGenericIndexer&lt;T&gt;()</code>', 'T 는 Type() 에 맞게: CV_8UC1 → byte, <b>CV_8UC3 → Vec3b</b> (Item0=B, Item1=G, Item2=R), CV_32FC1 → float', '순서는 <b>(행 y, 열 x)</b> — 함수의 Point/Rect 는 (x, y)', '반복문은 원리 학습용, 실제 처리는 <b>Cv2 함수</b> (수십~수백 배 빠름)', '다음 교시: ROI 는 원본을 공유한다 — Clone · CopyTo · 산술 연산자'], notes: '<p>(y, x) 와 Vec3b 를 다시 확인하고 마칩니다. 다음 교시 예고: "이미지 일부만 잘라 처리하면 원본은 어떻게 될까?" (2분)</p>' }
        ]
      },

      // ================================================================ 3교시
      {
        id: 'cs03-3', title: 'ROI 와 복사, Mat 연산', minutes: 50,
        goals: ['ROI(new Mat(img, rect) / img[rect] / SubMat) 가 원본 메모리를 참조함을 실험으로 확인할 수 있다', 'Clone/CopyTo 로 독립 복사하고, CopyTo(roi, mask) 로 다른 이미지에 붙일 수 있다', 'Mat 산술 · 비트 연산자, ConvertTo, SetTo(mask) 를 쓰고 채널/깊이 오류 메시지를 읽을 수 있다'],
        flow: [['도입: 일부만 처리하려면', 5], ['ROI · Clone · CopyTo', 15], ['연산자 · ConvertTo · 오류 읽기', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: 'ROI: 이미지의 일부를 가리키는 창' },
          { type: 'p', html: '검사 장비는 보통 화면 전체가 아니라 <b>관심 영역(ROI, Region Of Interest)</b>만 처리합니다. OpenCV 에서 ROI 는 <code>new Mat(img, rect)</code>, <code>img[rect]</code>, <code>img.SubMat(rect)</code> 로 만드는데, 셋 다 <b>새 이미지를 복사하는 것이 아니라 원본 메모리의 일부를 가리키는 창(view)</b>입니다. 그래서 만드는 데 시간이 거의 들지 않고, <b>ROI 를 수정하면 원본도 바뀝니다</b>.' },
          { type: 'figure', html: FIG_ROI, caption: '그림 4. ROI 는 원본 메모리를 가리키는 창 — 수정하면 원본도 바뀐다. Clone()/CopyTo() 만 새 메모리를 만든다' },
          { type: 'code', title: '예제 1: ROI 를 수정하면 원본이 바뀐다', code: EX3_ROI,
            desc: '<code>roi1.SetTo(0)</code> 을 했는데 <code>img</code> 의 픽셀이 0 이 됩니다 — 같은 메모리이기 때문입니다. <code>IsSubmatrix</code> 가 True 면 ROI 입니다. ROI 안의 좌표는 <b>ROI 기준 (0, 0)</b> 부터 시작한다는 점도 기억하세요: img 의 (50, 50) 이 roi 의 (0, 0) 입니다.',
            expect: 'roi1: (width:200 height:150), IsSubmatrix=True\nimg : (width:640 height:480), IsSubmatrix=False\n수정 전 img(100,100) = 224\nroi1.SetTo(0) 후 img(100,100) = 0\nroi2(50,50) = 0  (roi2 도 같은 메모리)\nroi2.SetTo(255) 후 img(60,60) = 255' },
          { type: 'callout', kind: 'tip', title: 'ROI 는 버그가 아니라 기능', html: '"일부만 처리하고 그 결과가 원본에 바로 반영되기"를 원할 때 ROI 는 가장 빠르고 간단한 방법입니다: <code>Cv2.GaussianBlur(img[rect], img[rect], …)</code> 처럼 ROI 에 바로 결과를 쓰거나, <code>Cv2.Rectangle(img[rect], …)</code> 로 ROI 좌표계에서 그릴 수 있습니다. 반대로 원본을 <b>보존</b>해야 하면 반드시 <code>Clone()</code> 하세요.' },
          { type: 'h', text: 'Clone · CopyTo: 진짜 복사' },
          { type: 'code', title: '예제 2: Clone() 과 CopyTo() — 독립된 복사본', code: EX3_CLONE,
            desc: '<code>Clone()</code> 은 새 메모리에 복사해 돌려주고, <code>CopyTo(dst)</code> 는 기존 Mat(dst) 에 복사합니다. <code>img[rect].Clone()</code> 은 "잘라내기"의 정석입니다. 반면 <code>Mat alias = img;</code> 는 <b>참조 복사</b> — C# 의 클래스 변수는 객체를 가리키는 이름이므로 alias 를 바꾸면 img 도 바뀝니다 (Mat 은 class 입니다).',
            expect: 'copy.SetTo(0) 후 img(100,100) = 224 (원본 그대로)\npart: (width:200 height:150), IsSubmatrix=False\ndst: (width:640 height:480) CV_8UC1\nalias.SetTo(128) 후 img(100,100) = 128 (같은 객체)' },
          { type: 'code', title: '예제 3: 로고 삽입 — CopyTo(roi) 와 마스크', code: EX3_LOGO,
            desc: '<b>다른 이미지에 붙이기</b> = "붙일 자리의 ROI 에 CopyTo". 크기와 형식이 같아야 합니다. 두 번째 인수로 <b>마스크</b>(CV_8UC1, 255 인 곳만 복사)를 주면 원 모양처럼 일부만 붙일 수 있어 로고 · 아이콘 오버레이에 쓰입니다. <code>img[rect] = logo;</code> 인덱서 대입도 같은 뜻입니다.',
            expect: '로고 중심 픽셀 (원): Vec3b(255, 80, 0)\n로고 모서리 픽셀 (배경): Vec3b(0, 220, 255)\n마스크 붙임 모서리 (원본 유지): Vec3b(53, 49, 48)' },
          { type: 'h', text: 'Mat 산술 · 비트 연산자' },
          { type: 'table', head: ['연산', '뜻', '같은 Cv2 함수', '주의'], rows: [
            ['<code>img + 50</code> / <code>img - 50</code>', '모든 픽셀에 더하기/빼기', '<code>Cv2.Add(img, new Scalar(50), dst)</code>', '<b>포화</b>: 0~255 를 벗어나면 잘림 (밝기 조절, 6차시)'],
            ['<code>img * 1.5</code> / <code>img / 2</code>', '모든 픽셀에 곱하기/나누기', '<code>Cv2.Multiply</code> · <code>ConvertTo(dst, -1, 1.5)</code>', '대비 조절. 결과는 반올림 후 포화'],
            ['<code>a + b</code> / <code>a - b</code>', '픽셀별 덧셈/뺄셈', '<code>Cv2.Add</code> / <code>Cv2.Subtract</code>', '크기 · 형식이 같아야. 음수는 0 → 차이는 <code>Cv2.Absdiff</code>'],
            ['<code>a & b</code> / <code>a | b</code> / <code>a ^ b</code> / <code>~a</code>', '비트 AND/OR/XOR/NOT', '<code>Cv2.BitwiseAnd/Or/Xor/Not</code>', '마스크(0/255) 결합 · 반전에 사용'],
            ['<code>a > 100</code> 등', '비교 → 0/255 마스크', '<code>Cv2.Compare</code>', '이진화의 간단한 형태 (7차시)']
          ], caption: '표 3. Mat 연산자 — 결과는 항상 새 Mat. Python numpy 의 배열 연산과 비슷하지만 오버플로 대신 포화' },
          { type: 'code', title: '예제 4: 산술 · 비트 연산자 써 보기', code: EX3_ARITH,
            desc: '<code>img + 50</code> 은 모든 픽셀을 밝게, <code>img * 1.5</code> 는 대비를 키우고, <code>~img</code> 는 반전입니다. 8비트에서 결과는 <b>0~255 로 포화</b>됩니다 — 밝은 배경(약 190~240)에 50 을 더하면 많은 픽셀이 255 로 잘립니다. 두 이미지 뺄셈은 음수가 0 이 되므로 "차이"가 필요하면 <code>Cv2.Absdiff</code>. <code>&amp;</code> 와 <code>|</code> 는 마스크로 영역을 남기거나 지울 때 씁니다.',
            expect: '원본 (240,320) = 22\nimg + 50   = 72\nimg - 50   = 0\nimg * 1.5  = 33 (255 를 넘으면 255)\n~img       = 233\nimg - other = 0, absdiff = 11\nimg & mask: 안=22, 밖=0' },
          { type: 'h', text: 'ConvertTo: 깊이(자료형) 바꾸기 · SetTo: 마스크로 채우기' },
          { type: 'code', title: '예제 5: ConvertTo(CV_32F · 스케일) 와 SetTo(값, 마스크)', code: EX3_CONVERT,
            desc: '<code>src.ConvertTo(dst, 형식, alpha, beta)</code> 는 <b>dst = src × alpha + beta</b> 를 계산하며 형식을 바꿉니다. 8비트 → 32F 로 바꿔 0~1 범위로 만들면 오버플로 걱정 없이 계산할 수 있고, 표시할 때는 다시 8비트로 돌립니다 (ImShow 는 32F 를 0~1 로 가정해 보여 줍니다). <code>SetTo(값, 마스크)</code> 는 마스크가 255 인 픽셀만 값으로 채웁니다 — 검출 결과를 색으로 칠할 때 자주 씁니다.',
            expect: 'f: CV_32FC1, (240,320) = 0.086\nf * 2 = 0.173 (byte 였다면 255 에서 잘림)\nback: CV_8UC1, (240,320) = 22\n마스크 픽셀 수: 46478\n와셔 몸통 (y=60, x=90) = Vec3b(0, 0, 255)\n배경 (y=10, x=10)      = Vec3b(111, 96, 82)' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: '<code>BitmapSourceConverter.ToBitmapSource</code> 에 <b>CV_32F Mat 을 그대로 넘기면</b> 화면이 검거나 이상하게 나옵니다. 실수 계산 결과는 <code>ConvertTo(dst, MatType.CV_8UC1, 255)</code> 또는 <code>Cv2.Normalize(src, dst, 0, 255, NormTypes.MinMax, MatType.CV_8UC1)</code> 으로 8비트로 바꾼 뒤 표시하세요. 또 ROI Mat(IsSubmatrix=True)은 메모리가 연속이 아니라(IsContinuous=False) 변환기가 거부하는 경우가 있으니 <code>roi.Clone()</code> 을 넘기는 것이 안전합니다.' },
          { type: 'h', text: '오류 메시지 읽는 법' },
          { type: 'code', title: '예제 6: 채널 · 크기 · 형식 오류 메시지 모아 보기', code: EX3_ERRORS,
            desc: 'OpenCV 오류는 <code>OpenCVException</code> 으로, 이 실습 환경의 자료형 오류는 <code>ArgumentException</code> 으로 잡힙니다. 메시지의 <code>scn == 3</code> 은 "source channel number 가 3 이어야" (입력이 3채널이어야), <code>size</code>/<code>type</code> 이 들어 있으면 두 Mat 의 크기 · 형식 불일치입니다. 오류가 나면 <b>관련 Mat 들의 <code>Size()</code> 와 <code>Type()</code> 을 출력</b>해 보는 것이 가장 빠른 디버깅입니다.',
            expect: '오류 1 OpenCVException: color.simd_helpers.hpp:92: error: (-15:Bad number of channels) in func…\n오류 2 OpenCVException: arithm.cpp:665: error: (-209:Sizes of input arguments do not match) Th…\n오류 3 OpenCVException: arithm.cpp:665: error: (-209:Sizes of input arguments do not match) Th…\n오류 4 OpenCVException: ROI 가 이미지 범위를 벗어났습니다: (x:600 y:400 width:100 height:100) / 이미지 640×480\n오류 5 ArgumentException: Vec3b 는 3채널용인데 이 Mat 은 1채널(CV_8UC1)입니다' },
          { type: 'table', head: ['메시지 조각', '뜻', '해결'], rows: [
            ['<code>scn == 3 || scn == 4</code>', '입력 채널이 3(4)이어야 함 — 그레이를 넘겼다', '<code>Channels()</code> 확인, 컬러로 읽거나 GRAY2BGR'],
            ['<code>depth == CV_8U</code> · <code>CV_8UC1</code>', '8비트 1채널이 필요 (Threshold · FindContours 등)', 'CvtColor(BGR2GRAY) · ConvertTo(CV_8U)'],
            ['<code>size == … &amp;&amp; type == …</code> · <code>sizes of input arguments do not match</code>', '두 Mat 의 크기 또는 형식이 다름', '<code>Size()</code>·<code>Type()</code> 출력 → Resize / ConvertTo / CvtColor 로 맞추기'],
            ['<code>ROI 가 이미지 범위를 벗어났습니다</code> · <code>roi</code>', 'Rect 가 이미지 밖으로 나감', '<code>rect &amp; new Rect(0, 0, img.Width, img.Height)</code> 로 잘라내기'],
            ['<code>empty</code> · <code>!_src.empty()</code>', '빈 Mat — 대부분 ImRead 경로 오류', '<code>img.Empty()</code> 확인, 경로 · 작업 폴더 확인']
          ], caption: '표 4. 자주 보는 오류 메시지와 해결법 — 결과 창도 이 메시지들에 도움말을 붙여 준다' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<ul><li><b>ROI 공유</b>는 학생들이 가장 놀라는 부분입니다. 예제 1 을 실행 전에 "roi1.SetTo(0) 하면 img 는 바뀔까?" 를 투표시키고 실행하면 기억에 남습니다.</li><li><b><code>Mat b = a;</code> 가 복사가 아님</b> — C# 클래스 참조 복사와 연결해 설명 (struct 인 Point/Rect 는 값 복사, class 인 Mat 은 참조).</li><li><b>포화 연산</b>: C# byte 덧셈 <code>(byte)(200 + 100) = 44</code> 와 Mat 의 <code>img + 100 → 255</code> 를 비교하면 차이가 분명해집니다.</li><li>평가 루브릭: ① ROI 수정 → 원본 변화 설명 (3) ② Clone/CopyTo 구분 (3) ③ 오류 메시지에서 원인(채널/크기) 찾기 (4).</li><li>시간이 남으면 <code>Cv2.AddWeighted</code>(가중 합)로 두 이미지 블렌딩을 시연 — 4차시 오버레이 패널에서 다시 씁니다.</li></ul>' }
        ],
        practice: [
          {
            title: '4분할 영역별 평균 밝기', level: 1,
            desc: '<code>images/washers.png</code>(그레이) 를 <b>4분할</b>(왼쪽 위 · 오른쪽 위 · 왼쪽 아래 · 오른쪽 아래, 각 320×240) ROI 로 나누고, 각 영역의 <b>평균 밝기</b>(<code>Cv2.Mean(roi).Val0</code>, 소수 첫째 자리)를 출력하세요. 가장 어두운 영역(부품이 많은 곳)의 ROI 를 <code>SetTo(0)</code> 으로 검게 만들어 원본 이미지를 표시하세요.',
            hint: 'Rect 4개를 배열에 넣고 foreach. 가장 어두운 것은 최소 평균을 기억하는 변수로. <code>img[rect].SetTo(new Scalar(0))</code> 이 원본을 바꿉니다.',
            expect: '왼쪽 위: 평균 밝기 189.9\n오른쪽 위: 평균 밝기 177.9\n왼쪽 아래: 평균 밝기 204.7\n오른쪽 아래: 평균 밝기 194.8\n가장 어두운 영역: 오른쪽 위',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        int w = img.Width / 2, h = img.Height / 2;
        Rect[] quads = { new Rect(0, 0, w, h), new Rect(w, 0, w, h), new Rect(0, h, w, h), new Rect(w, h, w, h) };
        string[] names = { "왼쪽 위", "오른쪽 위", "왼쪽 아래", "오른쪽 아래" };

        // TODO: 각 ROI 의 평균 밝기를 출력하고 가장 어두운 영역을 찾으세요
        for (int i = 0; i < quads.Length; i++)
        {
            using var roi = img[quads[i]];
            Console.WriteLine($"{names[i]}: {quads[i]}");
        }

        // TODO: 가장 어두운 영역의 ROI 를 SetTo(0) 으로 검게
        Cv2.ImShow("washers", img);
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
        int w = img.Width / 2, h = img.Height / 2;
        Rect[] quads = { new Rect(0, 0, w, h), new Rect(w, 0, w, h), new Rect(0, h, w, h), new Rect(w, h, w, h) };
        string[] names = { "왼쪽 위", "오른쪽 위", "왼쪽 아래", "오른쪽 아래" };

        int darkest = 0;
        double minMean = 255;
        for (int i = 0; i < quads.Length; i++)
        {
            using var roi = img[quads[i]];
            double mean = Cv2.Mean(roi).Val0;
            Console.WriteLine($"{names[i]}: 평균 밝기 {mean:F1}");
            if (mean < minMean) { minMean = mean; darkest = i; }
        }
        Console.WriteLine($"가장 어두운 영역: {names[darkest]}");
        img[quads[darkest]].SetTo(new Scalar(0));
        Cv2.ImShow("washers", img);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '두 이미지 합성: 반반 붙이기 + 마스크로 겹치기', level: 2,
            desc: '<code>images/washers.png</code> 와 <code>images/coins_parts.png</code>(둘 다 640×480 그레이)로 ① 왼쪽 절반은 washers, 오른쪽 절반은 coins 인 이미지를 <b>CopyTo(ROI)</b> 로 만들고, ② coins 의 밝은 부품(<code>Cv2.Threshold(coins, mask, 105, 255, ThresholdTypes.Binary)</code>)만 washers 위에 <b>CopyTo(dst, mask)</b> 로 겹친 이미지를 만드세요. 마스크의 흰 픽셀 수와 합성 결과의 (240, 320) 픽셀 값을 출력하세요.',
            hint: '① <code>coins[right].CopyTo(half[right]);</code> — ROI → ROI 복사. ② <code>using var over = washers.Clone(); coins.CopyTo(over, mask);</code>',
            expect: '마스크 흰 픽셀: 26230\nover(240,320) = 22',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var washers = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var coins = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        var right = new Rect(320, 0, 320, 480);

        // ① 반반 붙이기: half = washers 복사본, 오른쪽 절반에 coins 의 오른쪽 절반을 CopyTo
        using var half = washers.Clone();
        // TODO

        // ② 마스크로 겹치기: coins 의 밝은 부품(>105)만 washers 위에
        using var mask = new Mat();
        // TODO: Cv2.Threshold(coins, mask, 105, 255, ThresholdTypes.Binary);
        using var over = washers.Clone();
        // TODO: coins.CopyTo(over, mask);

        Console.WriteLine($"마스크 흰 픽셀: {Cv2.CountNonZero(mask)}");
        Console.WriteLine($"over(240,320) = {over.At<byte>(240, 320)}");
        Cv2.ImShow("half", half);
        Cv2.ImShow("over", over);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var washers = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var coins = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        var right = new Rect(320, 0, 320, 480);

        using var half = washers.Clone();
        coins[right].CopyTo(half[right]);

        using var mask = new Mat();
        Cv2.Threshold(coins, mask, 105, 255, ThresholdTypes.Binary);
        using var over = washers.Clone();
        coins.CopyTo(over, mask);

        Console.WriteLine($"마스크 흰 픽셀: {Cv2.CountNonZero(mask)}");
        Console.WriteLine($"over(240,320) = {over.At<byte>(240, 320)}");
        Cv2.ImShow("half", half);
        Cv2.ImShow("over", over);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ3,
        slides: [
          { layout: 'title', title: 'Mat 과 픽셀: 이미지 자료 구조', subtitle: '3교시 — ROI 와 복사, Mat 연산', notes: '<p>💬 "검사 카메라 화면에서 부품이 있는 부분만 처리하고 싶다면?" — 관심 영역(ROI). 오늘의 핵심 질문: "ROI 를 고치면 원본은?" 을 던지고 시작합니다. (2분)</p>' },
          { layout: 'diagram', title: 'ROI 는 창, Clone 은 복사', html: FIG_ROI, caption: 'new Mat(img, rect) · img[rect] · SubMat 은 원본 메모리를 가리키는 창(view). Clone()/CopyTo() 만 새 메모리', notes: '<p>실행 전 투표: "roi.SetTo(0) 하면 img 도 검게 될까?" 손 들게 한 뒤 예제 1 을 실행합니다. 그림의 오른쪽 "언제 무엇을?" 표를 함께 읽습니다. (5분)</p>' },
          { layout: 'code', title: '예제 1: ROI 수정 → 원본이 바뀐다', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        var rect = new Rect(50, 50, 200, 150);

        using var roi1 = new Mat(img, rect);     // 세 표기 모두 같은 뜻
        using var roi2 = img[rect];
        using var roi3 = img.SubMat(rect);
        Console.WriteLine($"IsSubmatrix: {roi1.IsSubmatrix}");

        Console.WriteLine($"전 img(100,100) = {img.At<byte>(100, 100)}");
        roi1.SetTo(new Scalar(0));               // ROI 를 검게
        Console.WriteLine($"후 img(100,100) = {img.At<byte>(100, 100)}");   // 0!

        roi2.SetTo(new Scalar(255));             // roi2 도 같은 메모리
        Console.WriteLine($"img(60,60) = {img.At<byte>(60, 60)}");
        Cv2.ImShow("img", img);
    }
}`, points: ['ROI = 원본 메모리의 창 → 수정하면 원본도 바뀜', '<code>IsSubmatrix</code> 로 ROI 인지 확인', 'ROI 안 좌표는 ROI 의 (0, 0) 부터', '복사가 없어 매우 빠르다 — 검사 장비의 기본 기법'], notes: '<p>실행 결과 img(100,100) 이 0 이 되는 것을 확인하고 투표 결과와 비교합니다. "이건 버그가 아니라 기능" — 일부만 처리해 원본에 바로 반영할 때 씀. 원본을 지키려면 다음 슬라이드. (6분)</p>' },
          { layout: 'code', title: '예제 2·3: Clone · CopyTo · 로고 붙이기', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        using var part = img[new Rect(80, 70, 80, 80)].Clone();   // 잘라내기 (독립)
        part.SetTo(new Scalar(0, 0, 0));
        Console.WriteLine($"img(110,120) = {img.At<Vec3b>(110, 120)}  (원본 유지)");

        // 로고: 노란 배경 + 파란 원, 마스크는 원 부분만 255
        using var logo = new Mat(80, 80, MatType.CV_8UC3, new Scalar(0, 220, 255));
        Cv2.Circle(logo, new Point(40, 40), 30, new Scalar(255, 80, 0), -1);
        using var mask = new Mat(80, 80, MatType.CV_8UC1, new Scalar(0));
        Cv2.Circle(mask, new Point(40, 40), 30, new Scalar(255), -1);

        logo.CopyTo(img[new Rect(550, 10, 80, 80)]);          // 사각형 그대로
        logo.CopyTo(img[new Rect(10, 390, 80, 80)], mask);    // 원 부분만
        img[new Rect(10, 10, 80, 80)] = logo;                 // 인덱서 대입도 같은 뜻
        Cv2.ImShow("logo", img);
    }
}`, points: ['<code>img[rect].Clone()</code> = 잘라내기의 정석', '붙이기 = 붙일 자리 ROI 에 <code>CopyTo</code> (크기 · 형식 같아야)', '<code>CopyTo(roi, mask)</code>: 마스크 255 인 곳만', '<code>Mat b = a;</code> 는 복사가 아니라 같은 객체'], notes: '<p>세 로고의 차이(사각형/원/사각형)를 결과 창에서 보여 줍니다. 💬 "로고가 90×90 이면?" — 크기 불일치 오류 → Resize 필요. <code>Mat b = a;</code> 참조 복사는 C# 클래스 규칙과 같다고 연결. (6분)</p>' },
          { layout: 'table', title: 'Mat 연산자', head: ['연산', '뜻', 'Cv2 함수', '주의'], rows: [
            ['<code>img + 50</code>, <code>img - 50</code>', '밝기 이동', 'Add / Subtract', '0~255 <b>포화</b>'],
            ['<code>img * 1.5</code>', '대비', 'Multiply / ConvertTo', '반올림 후 포화'],
            ['<code>a - b</code>', '픽셀별 뺄셈', 'Subtract', '음수 → 0. 차이는 <b>Absdiff</b>'],
            ['<code>a & m</code>, <code>a | m</code>, <code>~a</code>', '비트 연산', 'BitwiseAnd/Or/Not', '마스크(0/255) 용'],
            ['<code>a > 100</code>', '비교 → 마스크', 'Compare', '간단한 이진화']
          ], lead: '결과는 항상 새 Mat. numpy 배열 연산과 비슷하지만 오버플로 대신 포화', notes: '<p>예제 4 를 실행해 (240,320) 값이 각 연산으로 어떻게 바뀌는지 봅니다. C# <code>(byte)(200 + 100)</code> = 44 와 Mat 의 포화(255)를 대비시킵니다. (5분)</p>' },
          { layout: 'code', title: '예제 5: ConvertTo 와 SetTo(mask)', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var f = new Mat();                       // 8U → 32F, 0~1 로 스케일
        img.ConvertTo(f, MatType.CV_32FC1, 1.0 / 255.0);
        Console.WriteLine($"{f.Type()} (240,320)={f.At<float>(240, 320):F3}");
        using var back = new Mat();                    // 32F → 8U 로 되돌리기 (표시용)
        f.ConvertTo(back, MatType.CV_8UC1, 255.0);
        Console.WriteLine($"{back.Type()} (240,320)={back.At<byte>(240, 320)}");

        using var color = Cv2.ImRead("images/nuts_bolts_color.png");
        using var mask = new Mat();
        Cv2.Threshold(img, mask, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        color.SetTo(Scalar.Red, mask);                 // 부품 자리만 빨갛게
        Console.WriteLine($"마스크 픽셀 수: {Cv2.CountNonZero(mask)}");
        Cv2.ImShow("SetTo(Red, mask)", color);
    }
}`, points: ['<code>ConvertTo(dst, 형식, alpha, beta)</code>: dst = src×alpha + beta', '실수(32F)로 계산 → 8비트로 되돌려 표시', 'WPF 표시 전에는 꼭 8비트로!', '<code>SetTo(값, 마스크)</code>: 검출 결과 색칠'], notes: '<p>ImShow 가 32F 를 0~1 로 가정해 보여 준다는 점, WPF 변환기는 그렇지 않다는 점을 알려 줍니다. SetTo(Red, mask) 결과에서 백라이트 마스크가 컬러 사진의 부품 자리와 맞는 이유 — 같은 배치의 합성 이미지. (5분)</p>' },
          { layout: 'bullets', title: '오류 메시지 읽는 법', bullets: [
            '<code>scn == 3</code> → 입력이 <b>3채널</b>이어야 한다 (그레이를 CvtColor BGR2GRAY 에 넘김)',
            '<code>depth == CV_8U</code> · <code>CV_8UC1</code> → <b>8비트 1채널</b> 필요 (Threshold · FindContours)',
            '<code>size</code> · <code>type</code> · <code>do not match</code> → 두 Mat 의 <b>크기/형식 불일치</b>',
            '<code>ROI 가 이미지 범위를 벗어났습니다</code> → Rect 가 이미지 밖',
            '<code>empty</code> → ImRead 경로 오류. <code>Empty()</code> 로 먼저 확인',
            '디버깅 1순위: 관련 Mat 의 <code>Size()</code> 와 <code>Type()</code> 을 출력한다'
          ], notes: '<p>예제 6 을 실행해 다섯 메시지를 함께 읽습니다. 결과 창이 메시지 아래에 도움말을 붙여 준다는 점도 알려 줍니다. "오류 메시지는 힌트" 라는 태도를 심어 주는 것이 목표. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>var roi = new Mat(img, rect); roi.SetTo(0);</code> 를 실행하면?', options: ['roi 만 검게 되고 img 는 그대로', 'img 의 rect 영역도 검게 된다', '오류가 난다', 'img 전체가 검게 된다'], answer: 1, explain: 'ROI 는 같은 메모리를 가리키는 창. 독립 복사는 Clone().', notes: '<p>정답 2번. 수업 시작 때의 투표 결과와 비교하며 정리합니다. (2분)</p>' },
          { layout: 'practice', title: '실습: 4분할 영역별 평균 밝기', desc: '<p><code>washers.png</code> 를 320×240 ROI 4개로 나누어 각 평균 밝기를 출력하고, 가장 어두운 영역을 <code>SetTo(0)</code> 으로 검게 만드세요.</p><ul><li><code>Cv2.Mean(roi).Val0</code></li><li><code>img[rect].SetTo(new Scalar(0))</code> 이 원본을 바꾼다</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        int w = img.Width / 2, h = img.Height / 2;
        Rect[] quads = { new Rect(0, 0, w, h), new Rect(w, 0, w, h), new Rect(0, h, w, h), new Rect(w, h, w, h) };
        // TODO: 각 ROI 평균 밝기 출력, 가장 어두운 영역 SetTo(0)
        Cv2.ImShow("washers", img);
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        int w = img.Width / 2, h = img.Height / 2;
        Rect[] quads = { new Rect(0, 0, w, h), new Rect(w, 0, w, h), new Rect(0, h, w, h), new Rect(w, h, w, h) };
        int darkest = 0; double minMean = 255;
        for (int i = 0; i < quads.Length; i++)
        {
            double mean = Cv2.Mean(img[quads[i]]).Val0;
            Console.WriteLine($"{quads[i]}: {mean:F1}");
            if (mean < minMean) { minMean = mean; darkest = i; }
        }
        img[quads[darkest]].SetTo(new Scalar(0));
        Cv2.ImShow("washers", img);
        Cv2.WaitKey(0);
    }
}`, notes: '<p>부품이 많은 영역이 가장 어둡게 나옵니다(백라이트). ROI 에 SetTo 한 것이 원본 img 에 반영되어 표시되는 것을 확인. 빨리 끝난 학생은 실습 2(두 이미지 합성). (7분)</p>' },
          { layout: 'summary', title: '정리 — 03차시 전체', bullets: ['Mat = 행 × 열 × 채널, <b>CV_8UC3</b> = byte 3채널, (행, 열) vs (너비, 높이)', '픽셀: <code>At&lt;T&gt;(y, x)</code> · <code>Vec3b</code>(B, G, R) · 반복문은 인덱서, 실제 처리는 Cv2 함수', '<b>ROI 는 원본 공유</b>(new Mat(img, rect) / img[rect]) · 독립 복사는 <b>Clone/CopyTo</b> · 붙이기는 CopyTo(roi[, mask])', '연산자 <code>+ - * ~ &amp; |</code> 는 포화 · <code>ConvertTo</code> 로 깊이 변환 · <code>SetTo(값, mask)</code>', '오류 메시지: scn == 3 → 채널, size/type → 불일치 → <b>Size() · Type() 출력</b>', '다음 차시: 그리기와 텍스트 — Line · Rectangle · Circle · PutText'], notes: '<p>차시 전체를 되짚습니다. 다음 차시(그리기)는 오늘 배운 Point/Rect/Scalar 를 그대로 씁니다. 과제: 실습 2(두 이미지 합성)를 완성해 오기. (3분)</p>' }
        ]
      }
    ]
  });
})();
