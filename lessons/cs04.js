/* 04차시 그리기와 텍스트 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 좌표 규칙과 도형 인수
  const FIG_COORD = `<svg viewBox="0 0 760 340" role="img" aria-label="그리기 함수의 좌표 규칙과 도형별 인수">
  ${ARROW('c04a1')}
  <text x="20" y="26" class="tx-b">① 좌표: 원점 (0, 0) = 왼쪽 위 · 모든 점은 (x, y) 순서</text>
  <rect x="16" y="38" width="404" height="288" rx="10" class="card-bg"/>
  <line x1="58" y1="64" x2="400" y2="64" class="ax" marker-end="url(#c04a1)"/><text x="360" y="56" class="tx-m">x 증가 →</text>
  <line x1="58" y1="64" x2="58" y2="308" class="ax" marker-end="url(#c04a1)"/><text x="22" y="190" class="tx-m">y ↓</text>
  <text x="64" y="82" class="tx-m">(0, 0)</text>
  <rect x="112" y="98" width="150" height="84" class="p1s"/>
  <circle cx="112" cy="98" r="5" class="p1"/><text x="120" y="94" class="tx-m">(x, y)</text>
  <text x="187" y="146" text-anchor="middle" class="tx-b">Rect(x, y, w, h)</text>
  <line x1="112" y1="194" x2="262" y2="194" class="s1" stroke-width="1.5" marker-end="url(#c04a1)"/>
  <text x="187" y="210" text-anchor="middle" class="tx-m">w (너비)</text>
  <line x1="276" y1="98" x2="276" y2="182" class="s1" stroke-width="1.5" marker-end="url(#c04a1)"/>
  <text x="286" y="126" class="tx-m">h</text>
  <text x="300" y="150" class="tx-m">Rectangle 은</text><text x="300" y="166" class="tx-m">두 점(왼위 · 오른아래)</text><text x="300" y="182" class="tx-m">으로도 그린다</text>
  <circle cx="140" cy="256" r="40" class="p3s"/><circle cx="140" cy="256" r="4" class="p3"/>
  <line x1="140" y1="256" x2="180" y2="256" class="s3" stroke-width="1.5" marker-end="url(#c04a1)"/><text x="150" y="249" class="tx-m">r</text>
  <text x="140" y="314" text-anchor="middle" class="tx">Circle(중심, r, …)</text>
  <line x1="236" y1="296" x2="382" y2="228" class="s2" stroke-width="2" marker-end="url(#c04a1)"/>
  <circle cx="236" cy="296" r="4" class="p2"/>
  <text x="318" y="314" text-anchor="middle" class="tx">Line(p1, p2, …)</text>
  <text x="446" y="26" class="tx-b">② 공통 인수: (Mat, 위치…, 색, 두께, 선 종류)</text>
  <rect x="434" y="38" width="306" height="288" rx="10" class="card-bg"/>
  <text x="448" y="62" class="tx">Cv2.Rectangle(img, rect, new Scalar(B,G,R), 2);</text>
  <rect x="452" y="78" width="72" height="48" class="s4" stroke-width="1"/>
  <text x="488" y="142" text-anchor="middle" class="tx-m">두께 1</text>
  <rect x="546" y="78" width="72" height="48" class="s4" stroke-width="6"/>
  <text x="582" y="142" text-anchor="middle" class="tx-m">두께 6</text>
  <rect x="640" y="78" width="72" height="48" class="p4"/>
  <text x="676" y="142" text-anchor="middle" class="tx-m">두께 −1 (채움)</text>
  <line x1="452" y1="240" x2="574" y2="182" class="s5" stroke-width="1"/>
  <text x="513" y="262" text-anchor="middle" class="tx-m">LineTypes.Link8 (기본)</text>
  <text x="513" y="278" text-anchor="middle" class="tx-m">계단(톱니)이 보인다</text>
  <line x1="600" y1="240" x2="722" y2="182" class="s5" stroke-width="1" opacity="0.55"/>
  <line x1="600" y1="240" x2="722" y2="182" class="s5" stroke-width="2.4" opacity="0.35"/>
  <text x="661" y="262" text-anchor="middle" class="tx-m">LineTypes.AntiAlias</text>
  <text x="661" y="278" text-anchor="middle" class="tx-m">경계 픽셀을 섞어 매끈</text>
  <text x="587" y="308" text-anchor="middle" class="tx-m">색은 항상 Scalar(B, G, R) — 빨강 = (0, 0, 255)</text>
</svg>`;

  // 그림 2: 도형별 인수 한눈에
  const FIG_SHAPES = `<svg viewBox="0 0 760 300" role="img" aria-label="Line Rectangle Circle Ellipse Polylines 의 인수 비교">
  <rect x="16" y="20" width="728" height="264" rx="12" class="card-bg"/>
  <line x1="60" y1="80" x2="170" y2="60" class="s1" stroke-width="3"/>
  <text x="115" y="112" text-anchor="middle" class="tx-b">Line</text>
  <text x="115" y="130" text-anchor="middle" class="tx-m">p1, p2</text>
  <rect x="210" y="46" width="110" height="52" class="s2" stroke-width="3"/>
  <text x="265" y="112" text-anchor="middle" class="tx-b">Rectangle</text>
  <text x="265" y="130" text-anchor="middle" class="tx-m">Rect 또는 두 점</text>
  <circle cx="410" cy="72" r="28" class="s3" stroke-width="3"/>
  <text x="410" y="112" text-anchor="middle" class="tx-b">Circle</text>
  <text x="410" y="130" text-anchor="middle" class="tx-m">중심, 반지름</text>
  <ellipse cx="540" cy="72" rx="42" ry="24" class="s4" stroke-width="3" transform="rotate(-20 540 72)"/>
  <text x="540" y="112" text-anchor="middle" class="tx-b">Ellipse</text>
  <text x="540" y="130" text-anchor="middle" class="tx-m">중심, Size(a, b), 각도</text>
  <polygon points="650,96 700,42 730,96" class="s5" stroke-width="3"/>
  <text x="690" y="112" text-anchor="middle" class="tx-b">Polylines</text>
  <text x="690" y="130" text-anchor="middle" class="tx-m">Point 배열</text>
  <polygon points="80,230 130,176 160,230" class="p5"/>
  <text x="120" y="252" text-anchor="middle" class="tx-b">FillPoly</text>
  <text x="120" y="268" text-anchor="middle" class="tx-m">안을 채운 다각형</text>
  <line x1="230" y1="228" x2="330" y2="182" class="ln" stroke-width="2.5"/>
  <polygon points="330,182 316,182 326,192" class="fill-arrow"/>
  <text x="280" y="252" text-anchor="middle" class="tx-b">ArrowedLine</text>
  <text x="280" y="268" text-anchor="middle" class="tx-m">화살촉 있는 선</text>
  <line x1="400" y1="204" x2="430" y2="204" class="s3" stroke-width="2"/><line x1="415" y1="189" x2="415" y2="219" class="s3" stroke-width="2"/>
  <line x1="470" y1="192" x2="492" y2="216" class="s3" stroke-width="2"/><line x1="492" y1="192" x2="470" y2="216" class="s3" stroke-width="2"/>
  <polygon points="540,188 552,204 540,220 528,204" class="s3" stroke-width="2"/>
  <rect x="586" y="192" width="24" height="24" class="s3" stroke-width="2"/>
  <text x="505" y="252" text-anchor="middle" class="tx-b">DrawMarker</text>
  <text x="505" y="268" text-anchor="middle" class="tx-m">Cross · TiltedCross · Diamond · Square</text>
  <text x="678" y="204" text-anchor="middle" class="tx-m">중심을 정확히</text>
  <text x="678" y="222" text-anchor="middle" class="tx-m">찍을 때 편하다</text>
</svg>`;

  // 그림 3: PutText 의 기준점과 GetTextSize
  const FIG_TEXT = `<svg viewBox="0 0 760 300" role="img" aria-label="PutText 의 기준점은 글자의 왼쪽 아래이고 GetTextSize 는 폭 높이 baseLine 을 돌려준다">
  ${ARROW('c04a2')}
  <rect x="16" y="24" width="728" height="256" rx="12" class="card-bg"/>
  <rect x="150" y="96" width="250" height="52" class="p2s"/>
  <line x1="120" y1="148" x2="600" y2="148" class="ln" stroke-dasharray="6 4"/>
  <text x="606" y="152" class="tx-m">기준선(baseline)</text>
  <text x="156" y="144" class="tx-b" style="font-size:42px">OK 12.34</text>
  <circle cx="150" cy="148" r="6" class="p4"/>
  <line x1="150" y1="148" x2="90" y2="196" class="ln" marker-end="url(#c04a2)"/>
  <text x="34" y="216" class="tx-b">org = new Point(x, y)</text>
  <text x="34" y="234" class="tx-m">글자의 <tspan class="tx-b">왼쪽 아래</tspan> (왼쪽 위가 아니다!)</text>
  <line x1="150" y1="84" x2="400" y2="84" class="s2" stroke-width="1.5" marker-end="url(#c04a2)"/>
  <text x="275" y="76" text-anchor="middle" class="tx-m">size.Width</text>
  <line x1="420" y1="96" x2="420" y2="148" class="s2" stroke-width="1.5" marker-end="url(#c04a2)"/>
  <text x="432" y="126" class="tx-m">size.Height</text>
  <rect x="150" y="148" width="250" height="16" class="p3s"/>
  <line x1="420" y1="148" x2="420" y2="164" class="s3" stroke-width="1.5" marker-end="url(#c04a2)"/>
  <text x="432" y="162" class="tx-m">baseLine (g, y, p 의 꼬리 공간)</text>
  <text x="34" y="262" class="tx">Size size = Cv2.GetTextSize(text, font, fontScale, thickness, out int baseLine);</text>
  <text x="440" y="212" class="tx-m">글자를 감싸는 상자 =</text>
  <text x="440" y="230" class="tx-m">Rect(x, y − Height, Width, Height + baseLine)</text>
</svg>`;

  // 그림 4: 라벨 상자 만드는 3단계
  const FIG_LABEL = `<svg viewBox="0 0 760 240" role="img" aria-label="GetTextSize 로 크기를 재고 배경 상자를 채운 뒤 글자를 얹는 3단계">
  ${ARROW('c04a3')}
  <rect x="16" y="40" width="216" height="150" rx="10" class="card-bg"/>
  <text x="124" y="32" text-anchor="middle" class="tx-b">① 글자 크기 재기</text>
  <rect x="56" y="82" width="136" height="44" class="s2" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="124" y="110" text-anchor="middle" class="tx">W × H</text>
  <text x="124" y="152" text-anchor="middle" class="tx-m">Cv2.GetTextSize(...)</text>
  <text x="124" y="172" text-anchor="middle" class="tx-m">아직 그리지 않는다</text>
  <line x1="238" y1="115" x2="266" y2="115" class="ln" stroke-width="2" marker-end="url(#c04a3)"/>
  <rect x="272" y="40" width="216" height="150" rx="10" class="card-bg"/>
  <text x="380" y="32" text-anchor="middle" class="tx-b">② 배경 상자 채우기</text>
  <rect x="304" y="78" width="152" height="52" class="p3"/>
  <text x="380" y="152" text-anchor="middle" class="tx-m">Rect(W + 2·pad, H + 2·pad)</text>
  <text x="380" y="172" text-anchor="middle" class="tx-m">두께 −1 로 채운다</text>
  <line x1="494" y1="115" x2="522" y2="115" class="ln" stroke-width="2" marker-end="url(#c04a3)"/>
  <rect x="528" y="40" width="216" height="150" rx="10" class="card-bg"/>
  <text x="636" y="32" text-anchor="middle" class="tx-b">③ 글자 얹기</text>
  <rect x="560" y="78" width="152" height="52" class="p3"/>
  <text x="636" y="114" text-anchor="middle" class="tx-w" style="font-size:22px">OK 12.34</text>
  <text x="636" y="152" text-anchor="middle" class="tx-m">org = 상자 왼쪽 아래 − pad</text>
  <text x="636" y="172" text-anchor="middle" class="tx-m">배경색과 대비되는 글자색</text>
  <text x="380" y="216" text-anchor="middle" class="tx-m">글자가 사진 위에서 묻히지 않게 하는 가장 쉬운 방법 — 검사 장비 화면의 기본 표현</text>
</svg>`;

  // ------------------------------------------------------------------ 1교시 예제
  const EX1_BASIC = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 어두운 캔버스 (480행 × 640열, 3채널 컬러)
        using var canvas = new Mat(480, 640, MatType.CV_8UC3, new Scalar(40, 40, 40));

        // 선: 시작점 → 끝점, 색은 (B, G, R)
        Cv2.Line(canvas, new Point(40, 40), new Point(600, 40), new Scalar(0, 255, 255), 2);

        // 사각형 ① Rect 로  ② 두 점(왼쪽 위 · 오른쪽 아래)으로 — 같은 크기가 된다
        Cv2.Rectangle(canvas, new Rect(40, 80, 200, 120), new Scalar(0, 200, 0), 2);
        Cv2.Rectangle(canvas, new Point(280, 80), new Point(479, 199), new Scalar(0, 200, 0), 2);

        // 원: 중심 · 반지름 · 두께 (−1 이면 안을 채운다)
        Cv2.Circle(canvas, new Point(120, 320), 60, new Scalar(0, 0, 255), 3);
        Cv2.Circle(canvas, new Point(300, 320), 60, new Scalar(255, 120, 0), -1);

        Console.WriteLine($"선 위 픽셀      At(40, 300) = {canvas.At<Vec3b>(40, 300)}");
        Console.WriteLine($"채운 원 중심    At(320, 300) = {canvas.At<Vec3b>(320, 300)}");
        Console.WriteLine($"빈 원 안쪽      At(320, 120) = {canvas.At<Vec3b>(320, 120)}");
        Console.WriteLine($"아무것도 없는 곳 At(460, 620) = {canvas.At<Vec3b>(460, 620)}");
        Cv2.ImShow("basic shapes", canvas);
        Cv2.WaitKey(0);
    }
}`;

  const EX1_STYLE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(300, 640, MatType.CV_8UC3, new Scalar(30, 30, 30));

        // 두께 비교: 1 · 2 · 4 · 8 · −1(채우기)
        int[] th = { 1, 2, 4, 8, -1 };
        for (int i = 0; i < th.Length; i++)
        {
            int x = 30 + i * 122;
            Cv2.Rectangle(canvas, new Rect(x, 40, 96, 64), new Scalar(0, 220, 220), th[i]);
            Cv2.PutText(canvas, "t=" + th[i], new Point(x, 126), HersheyFonts.HersheyPlain, 1.0, Scalar.White, 1);
        }

        // 같은 기울기의 대각선을 기본(Link8) 과 AntiAlias 로
        Cv2.Line(canvas, new Point(60, 180), new Point(300, 280), new Scalar(0, 0, 255), 1, LineTypes.Link8);
        Cv2.Line(canvas, new Point(340, 180), new Point(580, 280), new Scalar(0, 0, 255), 1, LineTypes.AntiAlias);

        // x 를 고정하고 y 를 훑어 선의 '단면' 을 봅니다 (R 채널 값)
        Console.Write("Link8     단면(y=227~233): ");
        for (int y = 227; y <= 233; y++) Console.Write(canvas.At<Vec3b>(y, 180).Item2 + " ");
        Console.WriteLine();
        Console.Write("AntiAlias 단면(y=227~233): ");
        for (int y = 227; y <= 233; y++) Console.Write(canvas.At<Vec3b>(y, 460).Item2 + " ");
        Console.WriteLine();
        Cv2.ImShow("thickness / lineType", canvas);
        Cv2.WaitKey(0);
    }
}`;

  const EX1_ELLIPSE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(400, 640, MatType.CV_8UC3, new Scalar(35, 35, 35));

        // Ellipse(img, 중심, Size(가로 반지름, 세로 반지름), 회전각, 시작각, 끝각, 색, 두께)
        Cv2.Ellipse(canvas, new Point(120, 120), new Size(90, 50), 0, 0, 360, new Scalar(0, 220, 255), 2);
        Cv2.Ellipse(canvas, new Point(320, 120), new Size(90, 50), 30, 0, 360, new Scalar(0, 220, 255), 2);

        // 호(arc): 시작각 0° ~ 끝각 120° — 각도는 x축에서 시계 방향(y 가 아래라서)
        Cv2.Ellipse(canvas, new Point(520, 120), new Size(80, 80), 0, 0, 120, new Scalar(80, 255, 80), 3);
        // 부채꼴 채우기
        Cv2.Ellipse(canvas, new Point(520, 120), new Size(40, 40), 0, 0, 120, new Scalar(200, 80, 255), -1);

        // RotatedRect 하나로: 중심 · 크기(지름!) · 각도 — 12차시 FitEllipse 결과를 그릴 때 이 형태
        var rr = new RotatedRect(new Point2f(320, 290), new Size2f(300, 120), -20);
        Cv2.Ellipse(canvas, rr, new Scalar(255, 160, 0), 2);
        Console.WriteLine($"rr = {rr}");
        Console.WriteLine($"중심 {rr.Center}, 크기(지름) {rr.Size}, 각도 {rr.Angle}");
        Console.WriteLine($"→ Size(가로 반지름, 세로 반지름) = ({rr.Size.Width / 2}, {rr.Size.Height / 2})");
        Cv2.ImShow("ellipse / arc / RotatedRect", canvas);
        Cv2.WaitKey(0);
    }
}`;

  const EX1_POLY = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(400, 640, MatType.CV_8UC3, new Scalar(35, 35, 35));

        // 꼭짓점을 Point 배열로 만든다 (모두 (x, y) 순서)
        Point[] tri = { new Point(60, 40), new Point(200, 40), new Point(130, 150) };
        Point[] home = { new Point(300, 40), new Point(420, 40), new Point(420, 100),
                         new Point(470, 100), new Point(360, 170), new Point(250, 100), new Point(300, 100) };
        Point[] hex = { new Point(520, 40), new Point(600, 70), new Point(600, 130),
                        new Point(520, 160), new Point(480, 100) };

        Cv2.Polylines(canvas, new Point[][] { tri }, true, new Scalar(0, 255, 255), 2, LineTypes.AntiAlias);
        Cv2.FillPoly(canvas, new Point[][] { home }, new Scalar(60, 180, 255), LineTypes.AntiAlias);
        Cv2.FillConvexPoly(canvas, hex, new Scalar(255, 120, 60), LineTypes.AntiAlias);   // 볼록 다각형 전용(더 빠름)

        Cv2.ArrowedLine(canvas, new Point(60, 340), new Point(250, 250), new Scalar(255, 255, 255), 2, LineTypes.AntiAlias, 0, 0.18);

        MarkerTypes[] marks = { MarkerTypes.Cross, MarkerTypes.TiltedCross, MarkerTypes.Star,
                                MarkerTypes.Diamond, MarkerTypes.Square, MarkerTypes.TriangleUp };
        for (int i = 0; i < marks.Length; i++)
            Cv2.DrawMarker(canvas, new Point(340 + i * 50, 300), new Scalar(0, 0, 255), marks[i], 26, 2, LineTypes.AntiAlias);

        Console.WriteLine($"꼭짓점 수: 삼각형 {tri.Length}, 집 모양 {home.Length}, 육각 {hex.Length}");
        Console.WriteLine($"채운 집 모양 안쪽 At(60, 360) = {canvas.At<Vec3b>(60, 360)}");
        Console.WriteLine($"빈 삼각형 안쪽   At(60, 130) = {canvas.At<Vec3b>(60, 130)}");
        Cv2.ImShow("polygons / arrow / markers", canvas);
        Cv2.WaitKey(0);
    }
}`;

  const EX1_GRID = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(480, 640, MatType.CV_8UC3, new Scalar(250, 250, 250));
        DrawGrid(canvas, 40);          // 40 픽셀 격자
        DrawRuler(canvas, 80);         // 80 픽셀마다 눈금 + 좌표 숫자
        Cv2.Circle(canvas, new Point(320, 240), 6, new Scalar(0, 0, 255), -1);
        Console.WriteLine($"세로선 {canvas.Width / 40 + 1}개, 가로선 {canvas.Height / 40 + 1}개");
        Console.WriteLine($"굵은 세로선 At(250, 200) = {canvas.At<Vec3b>(250, 200)}");
        Console.WriteLine($"얇은 세로선 At(250, 240) = {canvas.At<Vec3b>(250, 240)}");
        Console.WriteLine($"칸 안쪽     At(250, 210) = {canvas.At<Vec3b>(250, 210)}");
        Cv2.ImShow("grid", canvas);
        Cv2.WaitKey(0);
    }

    // 도형 그리기는 메서드로 떼어 두면 어느 이미지에나 다시 쓸 수 있다
    static void DrawGrid(Mat img, int step)
    {
        var thin = new Scalar(215, 215, 215);
        var bold = new Scalar(150, 150, 150);
        for (int x = 0; x <= img.Width; x += step)
            Cv2.Line(img, new Point(x, 0), new Point(x, img.Height), x % (step * 5) == 0 ? bold : thin, 1);
        for (int y = 0; y <= img.Height; y += step)
            Cv2.Line(img, new Point(0, y), new Point(img.Width, y), y % (step * 5) == 0 ? bold : thin, 1);
    }

    static void DrawRuler(Mat img, int step)
    {
        var ink = new Scalar(70, 70, 70);
        for (int x = 0; x <= img.Width; x += step)
        {
            Cv2.Line(img, new Point(x, 0), new Point(x, 12), ink, 2);
            Cv2.PutText(img, x.ToString(), new Point(x + 3, 28), HersheyFonts.HersheyPlain, 1.0, ink, 1);
        }
        for (int y = step; y <= img.Height; y += step)
        {
            Cv2.Line(img, new Point(0, y), new Point(12, y), ink, 2);
            Cv2.PutText(img, y.ToString(), new Point(16, y - 5), HersheyFonts.HersheyPlain, 1.0, ink, 1);
        }
    }
}`;

  // ------------------------------------------------------------------ 2교시 예제
  const EX2_FONTS = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(420, 640, MatType.CV_8UC3, new Scalar(250, 250, 250));

        HersheyFonts[] fonts = { HersheyFonts.HersheySimplex, HersheyFonts.HersheyPlain,
                                 HersheyFonts.HersheyDuplex, HersheyFonts.HersheyComplex,
                                 HersheyFonts.HersheyTriplex, HersheyFonts.HersheyComplexSmall,
                                 HersheyFonts.HersheyScriptSimplex, HersheyFonts.HersheyScriptComplex };
        string[] names = { "Simplex", "Plain", "Duplex", "Complex",
                           "Triplex", "ComplexSmall", "ScriptSimplex", "ScriptComplex" };

        for (int i = 0; i < fonts.Length; i++)
        {
            string text = "OK 12.34 mm";
            int y = 46 + i * 46;
            Cv2.PutText(canvas, text + "  " + names[i], new Point(20, y), fonts[i], 0.9,
                        new Scalar(40, 40, 40), 1, LineTypes.AntiAlias);
            Size s = Cv2.GetTextSize(text, fonts[i], 0.9, 1, out int baseLine);
            Console.WriteLine($"{names[i].PadRight(14)} 폭={s.Width} 높이={s.Height} baseLine={baseLine}");
        }
        Cv2.ImShow("Hershey fonts", canvas);
        Cv2.WaitKey(0);
    }
}`;

  const EX2_SCALE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(320, 640, MatType.CV_8UC3, new Scalar(250, 250, 250));
        string text = "OK 12.34";
        double[] scales = { 0.5, 0.8, 1.2, 1.8 };
        int y = 54;

        foreach (double sc in scales)
        {
            Size s = Cv2.GetTextSize(text, HersheyFonts.HersheySimplex, sc, 2, out int baseLine);

            // 글자를 감싸는 상자: 기준점 y 에서 Height 만큼 위 ~ baseLine 만큼 아래
            Cv2.Rectangle(canvas, new Rect(40, y - s.Height, s.Width, s.Height + baseLine),
                          new Scalar(190, 190, 190), 1);
            Cv2.Line(canvas, new Point(40, y), new Point(40 + s.Width, y), new Scalar(255, 160, 0), 1);
            Cv2.PutText(canvas, text, new Point(40, y), HersheyFonts.HersheySimplex, sc,
                        new Scalar(30, 30, 30), 2, LineTypes.AntiAlias);

            Console.WriteLine($"fontScale={sc:F1} → 폭 {s.Width}, 높이 {s.Height}, baseLine {baseLine}");
            y += s.Height + baseLine + 22;
        }
        Cv2.ImShow("fontScale", canvas);
        Cv2.WaitKey(0);
    }
}`;

  const EX2_LABEL = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var view = new Mat();
        Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR);   // 색으로 표시하려면 3채널로

        DrawLabel(view, new Point(86, 128), "L  D6.8", new Scalar(60, 180, 255));
        DrawLabel(view, new Point(387, 200), "M  D5.4", new Scalar(90, 220, 90));
        DrawLabel(view, new Point(313, 265), "S  D4.0", new Scalar(255, 150, 70));
        Cv2.ImShow("labels", view);
        Cv2.WaitKey(0);
    }

    // 글자 크기를 먼저 재서(GetTextSize) 배경 상자를 그린 뒤 글자를 얹는다
    static void DrawLabel(Mat img, Point anchor, string text, Scalar color)
    {
        HersheyFonts font = HersheyFonts.HersheySimplex;
        double scale = 0.5;
        int thick = 1, pad = 4;
        Size s = Cv2.GetTextSize(text, font, scale, thick, out int baseLine);
        var box = new Rect(anchor.X, anchor.Y - s.Height - 2 * pad, s.Width + 2 * pad, s.Height + 2 * pad);
        Cv2.Rectangle(img, box, color, -1);                      // 채운 배경
        Cv2.Rectangle(img, box, new Scalar(30, 30, 30), 1);      // 얇은 테두리
        Cv2.PutText(img, text, new Point(box.X + pad, box.Bottom - pad), font, scale,
                    new Scalar(20, 20, 20), thick, LineTypes.AntiAlias);
        Console.WriteLine($"'{text}' → 글자 {s.Width}x{s.Height}, baseLine {baseLine}, 상자 {box}");
    }
}`;

  const EX2_PANEL = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var view = new Mat();
        Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR);

        // 측정: 백라이트 영상을 이진화해 부품이 차지하는 면적 비율 (07차시 내용)
        using var bin = new Mat();
        double th = Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        double ratio = 100.0 * Cv2.CountNonZero(bin) / bin.Total();
        bool ok = ratio < 25.0;

        var panel = new Rect(12, 12, 250, 104);
        Dim(view, panel);                                   // 패널 자리를 어둡게 (반투명 효과)
        Cv2.Rectangle(view, panel, new Scalar(200, 200, 200), 1);
        Line(view, panel, 0, "WASHER TRAY / LOT A2309", Scalar.White);
        Line(view, panel, 1, $"OTSU TH : {th:F0}", Scalar.White);
        Line(view, panel, 2, $"AREA    : {ratio:F2} %", Scalar.White);
        Line(view, panel, 3, ok ? "JUDGE   : OK" : "JUDGE   : NG",
             ok ? new Scalar(80, 255, 80) : new Scalar(80, 80, 255));

        Console.WriteLine($"Otsu 임계값 {th:F0}, 면적 비율 {ratio:F2} %, 판정 {(ok ? "OK" : "NG")}");
        Cv2.ImShow("overlay panel", view);
        Cv2.WaitKey(0);
    }

    // ROI 를 어두운 Mat 과 섞어 반투명 배경을 만든다
    static void Dim(Mat img, Rect r)
    {
        using var roi = img[r];
        using var dark = new Mat(roi.Size(), MatType.CV_8UC3, new Scalar(15, 15, 15));
        Cv2.AddWeighted(roi, 0.30, dark, 0.70, 0, roi);
    }

    static void Line(Mat img, Rect p, int i, string text, Scalar color) =>
        Cv2.PutText(img, text, new Point(p.X + 10, p.Y + 26 + i * 22), HersheyFonts.HersheySimplex,
                    0.5, color, 1, LineTypes.AntiAlias);
}`;

  const EX2_MINI = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var view = new Mat();
        Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR);

        // assets/IMAGES.md 의 정답 좌표 · 반지름 (검출하는 방법은 12~13차시)
        Point[] c = { new Point(120, 165), new Point(279, 384), new Point(549, 346),
                      new Point(56, 277), new Point(588, 165), new Point(414, 230), new Point(311, 166),
                      new Point(333, 288), new Point(341, 68), new Point(210, 370),
                      new Point(194, 54), new Point(481, 96) };
        int[] r = { 34, 34, 34, 27, 27, 27, 27, 20, 20, 20, 20, 20 };
        double mmPerPx = 0.1;
        int nL = 0, nM = 0, nS = 0;

        for (int i = 0; i < c.Length; i++)
        {
            string cls = "S";
            Scalar col = new Scalar(255, 150, 70);
            if (r[i] >= 34) { cls = "L"; col = new Scalar(60, 180, 255); nL++; }
            else if (r[i] >= 27) { cls = "M"; col = new Scalar(90, 220, 90); nM++; }
            else nS++;

            Cv2.Circle(view, c[i], r[i], col, 2, LineTypes.AntiAlias);
            Cv2.DrawMarker(view, c[i], col, MarkerTypes.Cross, 12, 1, LineTypes.AntiAlias);
            string tag = (i + 1) + " " + cls + " " + (2 * r[i] * mmPerPx).ToString("F1");
            DrawLabel(view, new Point(c[i].X - r[i], c[i].Y - r[i] - 2), tag, col);
        }

        Console.WriteLine($"부품 {c.Length}개 — L {nL} · M {nM} · S {nS}");
        Console.WriteLine($"1번 라벨 색 At(120, 120) = {view.At<Vec3b>(120, 120)}");
        Cv2.ImWrite("coins_labeled.png", view);
        Console.WriteLine("저장: coins_labeled.png (📁 작업 폴더에서 내려받기)");
        Cv2.ImShow("coins labeled", view);
        Cv2.WaitKey(0);
    }

    static void DrawLabel(Mat img, Point anchor, string text, Scalar color)
    {
        int pad = 3;
        Size s = Cv2.GetTextSize(text, HersheyFonts.HersheySimplex, 0.45, 1, out int baseLine);
        var box = new Rect(anchor.X, anchor.Y - s.Height - 2 * pad, s.Width + 2 * pad, s.Height + 2 * pad);
        Cv2.Rectangle(img, box, color, -1);
        Cv2.PutText(img, text, new Point(box.X + pad, box.Bottom - pad), HersheyFonts.HersheySimplex,
                    0.45, new Scalar(20, 20, 20), 1, LineTypes.AntiAlias);
    }
}`;

  const EX2_WPF_XAML = `<Grid>
    <!-- 이미지 위에 겹치는 한글 라벨: OpenCV 로 그리지 않고 WPF 컨트롤을 얹는다 -->
    <Image x:Name="View" Stretch="Uniform"/>
    <Border Background="#99000000" CornerRadius="6" Padding="10,8"
            HorizontalAlignment="Left" VerticalAlignment="Top" Margin="12">
        <StackPanel>
            <TextBlock Text="와셔 트레이 검사" Foreground="White" FontWeight="Bold"/>
            <TextBlock x:Name="TxtArea" Text="면적 비율: -" Foreground="White"/>
            <TextBlock x:Name="TxtJudge" Text="판정: -" Foreground="#7CFC7C" FontWeight="Bold"/>
        </StackPanel>
    </Border>
</Grid>`;

  const EX2_WPF_CS = `// MainWindow.xaml.cs — 측정은 OpenCvSharp, 한글 표시는 WPF TextBlock
using System.Windows;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;

public partial class MainWindow : Window
{
    private void Inspect()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var view = new Mat();
        Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR);

        using var bin = new Mat();
        Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        double ratio = 100.0 * Cv2.CountNonZero(bin) / bin.Total();
        bool ok = ratio < 25.0;

        // 도형 · 숫자는 OpenCV 로 (영문 · 숫자만!)
        Cv2.PutText(view, "AREA " + ratio.ToString("F2") + " %", new Point(20, 40),
                    HersheyFonts.HersheySimplex, 0.7, Scalar.Yellow, 2, LineTypes.AntiAlias);

        // 한글은 XAML 의 TextBlock 으로
        TxtArea.Text = "면적 비율: " + ratio.ToString("F2") + " %";
        TxtJudge.Text = ok ? "판정: 양품" : "판정: 불량";
        View.Source = BitmapSourceConverter.ToBitmapSource(view);
    }
}`;

  // ------------------------------------------------------------------ 퀴즈
  const QUIZ1 = [
    { q: '<code>Cv2.Circle(img, new Point(100, 50), 30, Scalar.Red, -1)</code> 에서 <code>-1</code> 의 뜻은?', options: ['선을 지운다', '안을 채운다', '두께 1로 그린다', '오류'], answer: 1,
      explain: '두께에 <b>−1</b>(= <code>LineTypes.Filled</code>)을 주면 도형의 <b>안을 채웁니다</b>. Rectangle · Circle · Ellipse 모두 같습니다. Python 의 <code>cv2.circle(..., -1)</code> 과 같습니다.' },
    { q: '<code>new Scalar(0, 255, 0)</code> 은 어떤 색인가?', options: ['빨강', '초록', '파랑', '노랑'], answer: 1,
      explain: 'OpenCV 의 색은 <b>(B, G, R)</b> 순서이므로 G 만 255 → <b>초록</b>입니다. 빨강은 <code>(0, 0, 255)</code>, 노랑은 <code>(0, 255, 255)</code> 입니다.' },
    { q: '<code>Cv2.Rectangle</code> 에 <code>new Rect(40, 80, 200, 120)</code> 을 넘겼을 때 사각형의 오른쪽 아래 모서리는?', options: ['(200, 120)', '(240, 200)', '(40, 80)', '(160, 40)'], answer: 1,
      explain: 'Rect 는 <b>(x, y, 너비, 높이)</b> 이므로 오른쪽 아래는 (40+200, 80+120) = <b>(240, 200)</b> 입니다. 두 점으로 그릴 때는 <code>new Point(40, 80), new Point(239, 199)</code> 로 넘깁니다.' },
    { q: '기울어진 선이나 원의 경계를 매끈하게 그리려면?', options: ['두께를 0 으로', '<code>LineTypes.AntiAlias</code> 를 준다', '<code>LineTypes.Link4</code> 를 준다', '이미지를 2배로 키운다'], answer: 1,
      explain: '<b>LineTypes.AntiAlias</b>(=16)는 경계 픽셀의 값을 배경과 섞어(부분 덮힘 비율만큼) 계단을 없앱니다. 기본값 <code>Link8</code> 은 빠르지만 톱니가 보입니다. 다만 안티에일리어싱 결과는 <b>중간 값 픽셀</b>이 생기므로 마스크(0/255)를 그릴 때는 쓰지 마세요.' },
    { q: '<code>Cv2.Polylines(img, pts, true, color, 2)</code> 의 세 번째 인수 <code>true</code> 는?', options: ['채우기 여부', '마지막 점과 첫 점을 잇는다(닫힌 도형)', '안티에일리어싱', '좌표를 (y, x) 로 해석'], answer: 1,
      explain: '<code>isClosed</code> 입니다. true 면 마지막 꼭짓점과 첫 꼭짓점을 이어 닫힌 도형을 그립니다. 안을 채우려면 <code>FillPoly</code>(오목해도 됨) 또는 <code>FillConvexPoly</code>(볼록 전용, 더 빠름)를 씁니다.' }
  ];
  const QUIZ2 = [
    { q: '<code>Cv2.PutText(img, "OK", new Point(100, 200), …)</code> 에서 (100, 200) 은 글자의 어디인가?', options: ['왼쪽 위', '왼쪽 아래(기준선)', '가운데', '오른쪽 아래'], answer: 1,
      explain: 'PutText 의 <code>org</code> 는 글자의 <b>왼쪽 아래(기준선 baseline 위치)</b>입니다. 그래서 y 를 그대로 쓰면 글자가 그 위로 올라갑니다 — y 가 작으면 이미지 밖으로 잘려 보이지 않습니다.' },
    { q: '글자 뒤에 배경 상자를 그리려면 무엇을 먼저 해야 하나?', options: ['<code>Cv2.GetTextSize</code> 로 글자 크기를 잰다', '<code>Cv2.PutText</code> 로 먼저 글자를 그린다', '이미지를 그레이로 바꾼다', '<code>Cv2.Resize</code> 로 이미지를 키운다'], answer: 0,
      explain: '<code>Cv2.GetTextSize(text, font, scale, thickness, out int baseLine)</code> 이 글자의 <b>폭 · 높이 · baseLine</b> 을 돌려줍니다. 이 값으로 Rect 를 만들어 <b>먼저 채운 상자</b>를 그리고, 그다음 글자를 얹습니다 (순서를 바꾸면 글자가 상자에 덮힙니다).' },
    { q: 'OpenCV 의 <code>PutText</code> 로 "양품" 을 그리면?', options: ['정상적으로 한글이 나온다', '물음표(?)나 빈칸으로 나온다', '오류가 난다', '자동으로 영문으로 번역된다'], answer: 1,
      explain: 'OpenCV 는 <b>Hershey 벡터 폰트(영문 · 숫자 · 기호)</b>만 내장하고 있어 한글은 그릴 수 없습니다. WPF 앱에서는 이미지 위에 <b>TextBlock</b> 을 겹쳐 한글을 표시하거나, 이미지에 직접 새겨야 하면 <code>System.Drawing</code>/<code>DrawingVisual</code> 로 렌더링해 합성합니다.' },
    { q: '<code>GetTextSize</code> 가 돌려주는 <code>baseLine</code> 은?', options: ['글자의 전체 높이', '기준선 아래로 내려가는 부분(g, y, p 의 꼬리) 높이', '글자 개수', '기준선의 y 좌표'], answer: 1,
      explain: 'baseLine 은 <b>기준선 아래로 더 필요한 높이</b>입니다. 글자를 완전히 감싸는 상자의 높이는 <code>size.Height + baseLine</code> 입니다.' },
    { q: '사진 위의 흰 글자가 밝은 배경에서 잘 안 보일 때 가장 간단한 해결은?', options: ['fontScale 을 0.1 로 줄인다', '채운 상자(배경)를 먼저 그리거나, 굵은 검은 글자를 먼저 그린 뒤 흰 글자를 덧쓴다', 'ImWrite 로 저장한다', 'CV_32F 로 바꾼다'], answer: 1,
      explain: '① <b>배경 상자</b>(GetTextSize + Rectangle(−1))를 깔거나 ② 같은 글자를 <b>두꺼운 검정</b>으로 먼저 그리고 그 위에 <b>얇은 흰색</b>을 덧그려 외곽선 효과를 줍니다. 검사 장비 화면에서 아주 많이 쓰는 기법입니다.' }
  ];

  // ------------------------------------------------------------------ 차시
  CS_COURSE.addChapter({
    id: 'cs04', no: '04', title: '그리기와 텍스트', subtitle: '도형 · 선 · 다각형 · 마커와 PutText · 라벨 상자',
    summary: '검사 결과를 <b>사람이 볼 수 있게</b> 만드는 도구를 배웁니다. <code>Cv2.Line · Rectangle · Circle · Ellipse · Polylines · FillPoly · ArrowedLine · DrawMarker</code> 로 도형을 그리고, 두께 · <code>LineTypes.AntiAlias</code> · <code>-1</code> 채우기를 조절합니다. 2교시에는 <code>Cv2.PutText</code> 로 글자를 넣고 <b><code>Cv2.GetTextSize</code> 로 배경 상자를 만드는 라벨 함수</b>와 결과 오버레이 패널을 만들어, <code>images/coins_parts.png</code> 의 부품 12개에 번호 라벨을 붙입니다.',
    goals: ['Line · Rectangle · Circle · Ellipse · Polylines · FillPoly · ArrowedLine · DrawMarker 로 원하는 도형을 그릴 수 있다', '두께 · LineTypes · −1 채우기 · Scalar(B, G, R) 를 자유롭게 조절하고 반복문 · 메서드로 그리기를 정리할 수 있다', 'PutText 의 기준점(왼쪽 아래)을 이해하고 폰트 · fontScale · 두께를 고를 수 있다', 'GetTextSize 로 배경 상자가 있는 라벨과 결과 오버레이 패널을 만들 수 있고, 한글은 WPF 로 표시해야 함을 안다'],
    wpf: 'OpenCvWpfStarter',
    sections: [
      // ================================================================ 1교시
      {
        id: 'cs04-1', title: '도형 그리기: 선 · 사각형 · 원 · 다각형', minutes: 50,
        goals: ['Cv2 의 그리기 함수들의 공통 인수 규칙(Mat, 위치, 색, 두께, 선 종류)을 안다', '타원 · 호 · RotatedRect · 다각형 · 화살표 · 마커를 그릴 수 있다', '반복문과 메서드 분리로 격자 · 눈금 같은 반복 도형을 깔끔하게 그릴 수 있다'],
        flow: [['도입: 왜 그리나', 5], ['도형 함수와 인수 규칙', 15], ['타원 · 다각형 · 격자 실습', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: '왜 이미지에 그리나?' },
          { type: 'p', html: '검사 프로그램이 "부품 12개, 3번은 불량"이라고 계산해도, 사람은 <b>화면에서 어디가 불량인지</b> 보고 싶어 합니다. 그래서 머신비전 프로그램은 거의 항상 원본 이미지 위에 <b>검출 위치(원 · 사각형) · 측정선 · 번호 · 판정 결과</b>를 그려 보여 줍니다. 그리기는 또 가장 좋은 <b>디버깅 도구</b>입니다 — 윤곽선이 엉뚱하게 잡혔는지, ROI 가 제자리에 있는지는 그려 보면 1초에 압니다.' },
          { type: 'list', items: [
            '<b>결과 표시</b>: 검출한 물체에 원 · 사각형 · 번호 라벨, 합격/불량 색 구분',
            '<b>측정 표시</b>: 두 점 사이 거리, 캘리퍼 선, 기준 격자 · 눈금',
            '<b>디버깅</b>: 중간 결과(윤곽선 · 중심점 · ROI)를 눈으로 확인 — <code>Cv2.ImShow</code> + 그리기',
            '<b>보고서 · 기록</b>: <code>Cv2.ImWrite</code> 로 판정 결과가 그려진 이미지를 저장'
          ] },
          { type: 'callout', kind: 'warn', title: '원본에 그리면 원본이 망가진다', html: '그리기 함수는 <b>넘긴 Mat 을 직접 수정</b>합니다(제자리 연산). 원본을 계속 쓸 거라면 <code>using var view = img.Clone();</code> 로 복사본을 만들어 그 위에 그리세요 (3차시 Clone). 또 <b>그레이(1채널) 이미지에는 색이 나오지 않습니다</b> — <code>Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR)</code> 로 3채널로 바꾼 뒤 그립니다.' },
          { type: 'h', text: '공통 규칙: (Mat, 위치…, 색, 두께, 선 종류)' },
          { type: 'figure', html: FIG_COORD, caption: '그림 1. 왼쪽 — 점은 모두 (x, y), Rect 는 (x, y, w, h). 오른쪽 — 두께와 선 종류(Link8 / AntiAlias), 두께 −1 은 채우기' },
          { type: 'table', head: ['OpenCvSharp', 'Python cv2', '무엇을 그리나'], rows: [
            ['<code>Cv2.Line(img, p1, p2, color, thickness, lineType)</code>', '<code>cv2.line</code>', '두 점을 잇는 선'],
            ['<code>Cv2.Rectangle(img, rect, color, thickness)</code><br><code>Cv2.Rectangle(img, p1, p2, color, thickness)</code>', '<code>cv2.rectangle</code>', '사각형 — Rect 또는 두 점(왼위 · 오른아래)'],
            ['<code>Cv2.Circle(img, center, radius, color, thickness)</code>', '<code>cv2.circle</code>', '원'],
            ['<code>Cv2.Ellipse(img, center, new Size(a, b), angle, start, end, color, thickness)</code><br><code>Cv2.Ellipse(img, rotatedRect, color, thickness)</code>', '<code>cv2.ellipse</code>', '타원 · 호 · 부채꼴'],
            ['<code>Cv2.Polylines(img, pts, isClosed, color, thickness)</code>', '<code>cv2.polylines</code>', '꺾은선 · 다각형 테두리'],
            ['<code>Cv2.FillPoly(img, pts, color)</code> / <code>Cv2.FillConvexPoly(img, pt, color)</code>', '<code>cv2.fillPoly</code> / <code>fillConvexPoly</code>', '채운 다각형 (Convex 는 볼록 전용 · 더 빠름)'],
            ['<code>Cv2.ArrowedLine(img, p1, p2, color, thickness, lineType, shift, tipLength)</code>', '<code>cv2.arrowedLine</code>', '화살표 (방향 표시)'],
            ['<code>Cv2.DrawMarker(img, pt, color, markerType, size, thickness)</code>', '<code>cv2.drawMarker</code>', '십자 · 별 · 다이아몬드 마커 (중심 표시)'],
            ['<code>Cv2.PutText(img, text, org, font, scale, color, thickness)</code>', '<code>cv2.putText</code>', '글자 (2교시)']
          ], caption: '표 1. 그리기 함수 — 이름만 PascalCase 로 바뀐다. 두께 · lineType 은 생략 가능(기본 1, Link8)' },
          { type: 'figure', html: FIG_SHAPES, caption: '그림 2. 도형별로 다른 것은 "위치를 어떻게 적는가" 뿐이다 — 색 · 두께 · 선 종류는 모두 같은 자리' },
          { type: 'code', title: '예제 1: 선 · 사각형 · 원 (기본 3종)', code: EX1_BASIC,
            desc: '<code>new Rect(40, 80, 200, 120)</code> 과 <code>new Point(280, 80), new Point(479, 199)</code> 가 같은 크기(200×120)의 사각형을 만듭니다 — 두 점 방식은 <b>오른쪽 아래 점이 포함</b>되므로 너비가 <code>x2 − x1 + 1</code> 입니다. 마지막 원은 두께 <code>-1</code> 이라 안이 채워집니다. 출력의 픽셀 값으로 어디에 무엇이 그려졌는지 확인하세요 (<code>At</code> 는 <b>(행 y, 열 x)</b>!).',
            expect: '선 위 픽셀      At(40, 300) = Vec3b(0, 255, 255)\n채운 원 중심    At(320, 300) = Vec3b(255, 120, 0)\n빈 원 안쪽      At(320, 120) = Vec3b(40, 40, 40)\n아무것도 없는 곳 At(460, 620) = Vec3b(40, 40, 40)' },
          { type: 'code', title: '예제 2: 두께와 선 종류(AntiAlias) 비교', code: EX1_STYLE,
            desc: '두께를 1 → 8 로 키우고 마지막은 <code>-1</code>(채우기)입니다. 아래 두 대각선은 같은 기울기인데 <code>LineTypes.Link8</code>(기본)과 <code>LineTypes.AntiAlias</code> 로 그렸습니다. 출력된 <b>세로 단면</b>을 보면 Link8 은 배경(30)과 선(255)만 있는데 AntiAlias 는 그 <b>사이 값</b>이 생기는 것이 보입니다 — 이것이 톱니를 눈에 덜 띄게 만드는 원리입니다.',
            expect: 'Link8     단면(y=227~233): 30 30 30 255 30 30 30\nAntiAlias 단면(y=227~233): 30 30 86 242 79 30 30' },
          { type: 'callout', kind: 'tip', title: '마스크에는 AntiAlias 금지', html: '이진 마스크(0 또는 255)를 만들려고 <code>Cv2.Circle(mask, …, -1, LineTypes.AntiAlias)</code> 를 쓰면 <b>경계에 1~254 의 중간 값</b>이 생겨 <code>CountNonZero</code> · <code>CopyTo(dst, mask)</code> 결과가 미묘하게 달라집니다. <b>보여 주는 그림에는 AntiAlias, 계산에 쓰는 마스크에는 기본값(Link8)</b>이 원칙입니다.' },
          { type: 'h', text: '타원 · 호 · RotatedRect' },
          { type: 'code', title: '예제 3: Ellipse — 타원 · 호 · 부채꼴 · RotatedRect', code: EX1_ELLIPSE,
            desc: '<code>new Size(a, b)</code> 는 <b>반지름</b>(가로 반지름, 세로 반지름)이지만, <code>RotatedRect</code> 의 <code>Size</code> 는 <b>지름</b>(전체 너비, 높이)입니다 — 두 배 차이이니 주의하세요. 각도는 x축에서 <b>시계 방향</b>(y축이 아래를 향하므로)입니다. 12차시에서 <code>Cv2.FitEllipse</code> 가 돌려주는 RotatedRect 를 이 한 줄로 그립니다.',
            expect: 'rr = (center:(x:320 y:290) size:(width:300 height:120) angle:-20)\n중심 (x:320 y:290), 크기(지름) (width:300 height:120), 각도 -20\n→ Size(가로 반지름, 세로 반지름) = (150, 60)' },
          { type: 'h', text: '다각형 · 화살표 · 마커' },
          { type: 'code', title: '예제 4: Polylines · FillPoly · FillConvexPoly · ArrowedLine · DrawMarker', code: EX1_POLY,
            desc: '다각형은 <b>Point 배열</b>로 꼭짓점을 적습니다. <code>Polylines</code>/<code>FillPoly</code> 는 여러 다각형을 한 번에 그릴 수 있어 인수가 <b>배열의 배열</b>(<code>new Point[][] { pts }</code>)입니다 — 12차시의 <code>FindContours</code> 결과를 그대로 넘길 수 있는 형태입니다. <code>FillConvexPoly</code> 는 볼록 다각형 <b>하나</b>만 받고 더 빠릅니다. <code>DrawMarker</code> 는 중심을 정확히 찍을 때 십자·별 모양을 그려 줍니다.',
            expect: '꼭짓점 수: 삼각형 3, 집 모양 7, 육각 5\n채운 집 모양 안쪽 At(60, 360) = Vec3b(60, 180, 255)\n빈 삼각형 안쪽   At(60, 130) = Vec3b(35, 35, 35)' },
          { type: 'h', text: '반복문과 메서드로 정리하기' },
          { type: 'code', title: '예제 5: 격자 · 눈금 그리기 (메서드로 분리)', code: EX1_GRID,
            desc: '반복되는 그리기는 <b>메서드로 떼어 냅니다</b>: <code>static void DrawGrid(Mat img, int step)</code> 처럼 "그릴 Mat" 을 인수로 받으면 어떤 이미지에나 다시 쓸 수 있습니다 (Mat 은 class 이므로 메서드 안에서 그린 것이 <b>호출한 쪽 이미지에 그대로 반영</b>됩니다 — 3차시 참조 복사). 5칸마다 굵은 선을 넣어 좌표를 읽기 쉽게 했습니다. 이런 격자는 좌표 감각을 익히거나 캘리브레이션 결과를 확인할 때 씁니다. 출력에서 x=200 은 <code>step*5</code> 의 배수라 굵은 선(150)이고 x=240 은 얇은 선(215)입니다.',
            expect: '세로선 17개, 가로선 13개\n굵은 세로선 At(250, 200) = Vec3b(150, 150, 150)\n얇은 세로선 At(250, 240) = Vec3b(215, 215, 215)\n칸 안쪽     At(250, 210) = Vec3b(250, 250, 250)' },
          { type: 'callout', kind: 'tip', title: 'Scalar 색 상수와 BGR', html: '<code>Scalar.Red</code>(0,0,255) · <code>Scalar.Lime</code>(0,255,0) · <code>Scalar.Blue</code>(255,0,0) · <code>Scalar.Yellow</code>(0,255,255) · <code>Scalar.White</code> · <code>Scalar.Black</code> · <code>Scalar.Orange</code> 같은 상수가 있습니다(HTML 색 이름 기준, 값은 BGR 순서로 저장). <b>Scalar.Green 은 (0,128,0) 짙은 초록</b>이므로 밝은 초록을 원하면 <code>Scalar.Lime</code> 이나 <code>new Scalar(0, 255, 0)</code> 을 쓰세요. 팀 규칙으로 <b>OK = 초록, NG = 빨강, 정보 = 노랑</b>처럼 색을 미리 정해 두면 화면이 훨씬 읽기 쉬워집니다.' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: '그리기를 <b>OpenCV 로 할지 WPF 로 할지</b> 정해야 합니다. <ul><li><b>OpenCV 로 그리기</b>: 결과가 Mat 에 새겨지므로 <code>Cv2.ImWrite</code> 로 그대로 저장 · 보고서에 쓸 수 있습니다. 대신 지우려면 원본을 다시 Clone 해야 합니다.</li><li><b>WPF 로 그리기</b>: <code>Image</code> 컨트롤 위에 <code>Canvas</code> 를 겹쳐 <code>Ellipse</code> · <code>Rectangle</code> · <code>TextBlock</code> 을 올리면 <b>지우기 · 확대 · 마우스 클릭</b>이 쉽고 한글도 나옵니다. 대신 이미지 좌표 ↔ 화면 좌표 환산이 필요합니다(16차시).</li></ul>실무에서는 <b>검사 결과 저장용은 OpenCV, 화면 조작용 오버레이는 WPF</b> 로 나눠 씁니다.' }
        ],
        practice: [
          {
            title: '반복문으로 과녁(동심원) 그리기', level: 1,
            desc: '400×400 컬러 캔버스에 중심 (200, 200) 의 <b>과녁</b>을 그리세요. 반지름을 <b>180 → 20 까지 20 씩 줄이며</b> 원을 <code>-1</code>(채우기)로 그리고, 색은 빨강 <code>(0,0,255)</code> 과 흰색 <code>(255,255,255)</code> 을 번갈아 씁니다. 마지막으로 중심에 <code>DrawMarker</code> 로 십자(크기 40, 두께 2, 검정)를 찍고, 원 개수와 중심 픽셀 · 가장 바깥 원의 픽셀 값을 출력하세요.',
            hint: '<code>for (int r = 180; r >= 20; r -= 20)</code> 안에서 순번을 세어 짝/홀로 색을 고릅니다. 큰 원부터 그려야 작은 원이 위에 남습니다. 십자는 <code>MarkerTypes.Cross</code>.',
            expect: '원 개수: 9\n중심   At(200, 200) = Vec3b(0, 0, 0)\n바깥 원 At(200, 30) = Vec3b(0, 0, 255)',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(400, 400, MatType.CV_8UC3, new Scalar(240, 240, 240));
        int n = 0;
        for (int r = 180; r >= 20; r -= 20)
        {
            // TODO: n 이 짝수면 빨강, 홀수면 흰색으로 채운 원을 그리고 n 을 늘리세요
        }
        // TODO: 중심 (200, 200) 에 DrawMarker 로 검정 십자 (MarkerTypes.Cross, 40, 2)

        Console.WriteLine($"원 개수: {n}");
        Console.WriteLine($"중심   At(200, 200) = {canvas.At<Vec3b>(200, 200)}");
        Console.WriteLine($"바깥 원 At(200, 30) = {canvas.At<Vec3b>(200, 30)}");
        Cv2.ImShow("target", canvas);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(400, 400, MatType.CV_8UC3, new Scalar(240, 240, 240));
        int n = 0;
        for (int r = 180; r >= 20; r -= 20)
        {
            Scalar col = n % 2 == 0 ? new Scalar(0, 0, 255) : new Scalar(255, 255, 255);
            Cv2.Circle(canvas, new Point(200, 200), r, col, -1);
            n++;
        }
        Cv2.DrawMarker(canvas, new Point(200, 200), new Scalar(0, 0, 0), MarkerTypes.Cross, 40, 2);

        Console.WriteLine($"원 개수: {n}");
        Console.WriteLine($"중심   At(200, 200) = {canvas.At<Vec3b>(200, 200)}");
        Console.WriteLine($"바깥 원 At(200, 30) = {canvas.At<Vec3b>(200, 30)}");
        Cv2.ImShow("target", canvas);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '부품 위치 표시 메서드 만들기', level: 2,
            desc: '<code>static void MarkPart(Mat img, Point center, int half, Scalar color)</code> 메서드를 만들어 ① 중심에 <code>DrawMarker</code> 십자(크기 16, 두께 1) ② 한 변 <code>2*half</code> 인 사각형(두께 2)을 그리게 하세요. <code>images/washers.png</code> 를 읽어 <b>3채널로 변환</b>한 뒤 와셔 W1 (90, 90) · 너트 N2 (340, 240) · 볼트 B3 (400, 400) 세 곳을 각각 다른 색(노랑 · 초록 · 빨강)으로 표시하고, 사각형 왼쪽 위 모서리의 픽셀 값을 출력하세요.',
            hint: '사각형은 <code>new Rect(center.X - half, center.Y - half, 2 * half, 2 * half)</code>. 그레이를 3채널로: <code>Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR)</code>. 색은 BGR 이므로 노랑 = (0,255,255).',
            expect: 'W1 상자 모서리 At(40, 40) = Vec3b(0, 255, 255)\nN2 상자 모서리 At(190, 290) = Vec3b(0, 255, 0)\nB3 상자 모서리 At(350, 350) = Vec3b(0, 0, 255)',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var view = new Mat();
        Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR);

        MarkPart(view, new Point(90, 90), 50, new Scalar(0, 255, 255));
        // TODO: N2 (340, 240) 초록(0,255,0), B3 (400, 400) 빨강(0,0,255) 도 표시하세요

        Console.WriteLine($"W1 상자 모서리 At(40, 40) = {view.At<Vec3b>(40, 40)}");
        Console.WriteLine($"N2 상자 모서리 At(190, 290) = {view.At<Vec3b>(190, 290)}");
        Console.WriteLine($"B3 상자 모서리 At(350, 350) = {view.At<Vec3b>(350, 350)}");
        Cv2.ImShow("marked", view);
        Cv2.WaitKey(0);
    }

    static void MarkPart(Mat img, Point center, int half, Scalar color)
    {
        // TODO: DrawMarker 로 십자(크기 16, 두께 1) + Rectangle 로 사각형(두께 2)
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var view = new Mat();
        Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR);

        MarkPart(view, new Point(90, 90), 50, new Scalar(0, 255, 255));
        MarkPart(view, new Point(340, 240), 50, new Scalar(0, 255, 0));
        MarkPart(view, new Point(400, 400), 50, new Scalar(0, 0, 255));

        Console.WriteLine($"W1 상자 모서리 At(40, 40) = {view.At<Vec3b>(40, 40)}");
        Console.WriteLine($"N2 상자 모서리 At(190, 290) = {view.At<Vec3b>(190, 290)}");
        Console.WriteLine($"B3 상자 모서리 At(350, 350) = {view.At<Vec3b>(350, 350)}");
        Cv2.ImShow("marked", view);
        Cv2.WaitKey(0);
    }

    static void MarkPart(Mat img, Point center, int half, Scalar color)
    {
        Cv2.DrawMarker(img, center, color, MarkerTypes.Cross, 16, 1);
        Cv2.Rectangle(img, new Rect(center.X - half, center.Y - half, 2 * half, 2 * half), color, 2);
    }
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '그리기와 텍스트', subtitle: '1교시 — 도형 그리기: 선 · 사각형 · 원 · 다각형', notes: '<p>💬 "검사 프로그램이 불량을 찾았을 때, 화면에는 무엇이 보여야 할까요?" — 예상 답: 어디가 불량인지 표시, 개수, 판정. 오늘은 그 표시를 그리는 도구를 배운다고 안내합니다. 3차시에서 배운 Point · Rect · Scalar 를 그대로 쓴다고 연결합니다. (3분)</p>' },
          { layout: 'bullets', title: '왜 이미지에 그리나', lead: '계산 결과 → 사람이 보는 화면', bullets: [
            '<b>결과 표시</b>: 검출한 물체에 원 · 사각형 · 번호, 합격/불량 색 구분',
            '<b>측정 표시</b>: 거리 · 캘리퍼 선 · 기준 격자',
            '<b>디버깅</b>: 중간 결과를 그려 보면 1초에 확인된다 (가장 강력한 디버깅 도구)',
            '<b>기록</b>: <code>Cv2.ImWrite</code> 로 판정이 그려진 이미지를 저장',
            ['주의', ['그리기 함수는 <b>원본 Mat 을 직접 바꾼다</b> → <code>img.Clone()</code>', '그레이(1채널)에는 색이 안 나온다 → <code>GRAY2BGR</code>']]
          ], notes: '<p>실제 검사 장비 화면 사진을 떠올리게 합니다. 마지막 "주의" 두 가지는 오늘 실습에서 학생들이 반드시 만나는 함정이니 미리 강조합니다. 💬 "그레이 이미지에 빨간 원을 그리면?" — 회색으로 보인다(채널이 1개). (5분)</p>' },
          { layout: 'diagram', title: '좌표와 공통 인수 규칙', html: FIG_COORD, caption: '점은 모두 (x, y) · Rect 는 (x, y, w, h) · 색은 Scalar(B, G, R) · 두께 −1 은 채우기', notes: '<p>왼쪽: 3차시의 (행, 열) 과 달리 <b>그리기 함수는 전부 (x, y)</b> 임을 다시 확인합니다. 오른쪽: 두께 1/6/−1 과 Link8/AntiAlias 를 비교합니다. 💬 "두께에 0 을 주면?" — 아무것도 안 그려지거나 1로 취급. 마스크에는 AntiAlias 를 쓰지 않는다는 규칙을 예고합니다. (6분)</p>' },
          { layout: 'table', title: '그리기 함수 한눈에 (Python 대응)', head: ['OpenCvSharp', 'Python', '무엇'], rows: [
            ['<code>Cv2.Line(img, p1, p2, …)</code>', '<code>cv2.line</code>', '선'],
            ['<code>Cv2.Rectangle(img, rect 또는 p1, p2, …)</code>', '<code>cv2.rectangle</code>', '사각형'],
            ['<code>Cv2.Circle(img, center, r, …)</code>', '<code>cv2.circle</code>', '원'],
            ['<code>Cv2.Ellipse(img, center, Size(a,b), angle, s, e, …)</code>', '<code>cv2.ellipse</code>', '타원 · 호'],
            ['<code>Cv2.Polylines / FillPoly / FillConvexPoly</code>', '<code>cv2.polylines / fillPoly</code>', '다각형'],
            ['<code>Cv2.ArrowedLine / DrawMarker</code>', '<code>cv2.arrowedLine / drawMarker</code>', '화살표 · 마커'],
            ['<code>Cv2.PutText(img, text, org, font, scale, …)</code>', '<code>cv2.putText</code>', '글자 (2교시)']
          ], lead: '다른 것은 "위치를 어떻게 적는가" 뿐 — 색 · 두께 · lineType 은 항상 뒤쪽 같은 자리', notes: '<p>표를 훑으며 "이름만 PascalCase" 규칙을 재확인합니다. 학생들에게 Python 경험이 있으면 인수 순서가 똑같다는 점을 강조. 두께와 lineType 은 생략 가능(기본 1, Link8). (4분)</p>' },
          { layout: 'code', title: '예제 1: 선 · 사각형 · 원', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(480, 640, MatType.CV_8UC3, new Scalar(40, 40, 40));

        Cv2.Line(canvas, new Point(40, 40), new Point(600, 40), new Scalar(0, 255, 255), 2);

        // 두 방식이 같은 크기(200×120) 사각형
        Cv2.Rectangle(canvas, new Rect(40, 80, 200, 120), new Scalar(0, 200, 0), 2);
        Cv2.Rectangle(canvas, new Point(280, 80), new Point(479, 199), new Scalar(0, 200, 0), 2);

        Cv2.Circle(canvas, new Point(120, 320), 60, new Scalar(0, 0, 255), 3);
        Cv2.Circle(canvas, new Point(300, 320), 60, new Scalar(255, 120, 0), -1);   // 채우기

        Console.WriteLine($"채운 원 중심 At(320, 300) = {canvas.At<Vec3b>(320, 300)}");
        Cv2.ImShow("basic shapes", canvas);
    }
}`, points: ['<code>new Scalar(0, 0, 255)</code> = 빨강 (BGR!)', 'Rect(x, y, w, h) ↔ 두 점: 너비 = x2 − x1 + 1', '두께 <code>-1</code> = 채우기', '확인은 <code>At&lt;Vec3b&gt;(y, x)</code> — 그리기는 (x, y), 읽기는 (y, x)'], notes: '<p>실행한 뒤 결과 창에서 마우스로 픽셀 값을 확인하게 합니다. 학생 활동: 색을 바꿔 보기, 두께를 −1 로 바꿔 보기. 💬 "두 사각형의 크기가 정말 같을까?" — 두 점 방식은 끝점 포함이라 479−280+1 = 200. (7분)</p>' },
          { layout: 'diagram', title: '도형별 인수 비교', html: FIG_SHAPES, caption: 'Line(두 점) · Rectangle(Rect/두 점) · Circle(중심, r) · Ellipse(중심, Size, 각도) · Polylines(Point 배열)', notes: '<p>그림을 보며 각 도형이 "위치를 어떻게 적는지" 말하게 합니다. DrawMarker 의 네 가지 모양을 짚고, 중심을 정확히 표시할 때 편하다고 설명합니다. (4분)</p>' },
          { layout: 'code', title: '예제 3: 타원 · 호 · RotatedRect', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(400, 640, MatType.CV_8UC3, new Scalar(35, 35, 35));

        // Size(a, b) = (가로 반지름, 세로 반지름), 회전각, 시작각, 끝각
        Cv2.Ellipse(canvas, new Point(120, 120), new Size(90, 50), 0, 0, 360, Scalar.Yellow, 2);
        Cv2.Ellipse(canvas, new Point(320, 120), new Size(90, 50), 30, 0, 360, Scalar.Yellow, 2);

        // 호 · 부채꼴 (0° ~ 120°, 시계 방향)
        Cv2.Ellipse(canvas, new Point(520, 120), new Size(80, 80), 0, 0, 120, Scalar.Lime, 3);
        Cv2.Ellipse(canvas, new Point(520, 120), new Size(40, 40), 0, 0, 120, Scalar.Violet, -1);

        // RotatedRect 의 Size 는 '지름' 이다 (Size(a,b) 의 2배)
        var rr = new RotatedRect(new Point2f(320, 290), new Size2f(300, 120), -20);
        Cv2.Ellipse(canvas, rr, new Scalar(255, 160, 0), 2);
        Console.WriteLine($"rr = {rr}");
        Cv2.ImShow("ellipse", canvas);
    }
}`, points: ['<code>new Size(a, b)</code> = <b>반지름</b> 쌍', '<code>RotatedRect.Size</code> = <b>지름</b> (2배 주의!)', '시작각 · 끝각으로 호 · 부채꼴', '12차시 <code>FitEllipse</code> 결과를 그리는 형태'], notes: '<p>반지름 vs 지름 혼동이 이 함수의 최대 함정입니다. 화면에서 두 타원(rr 과 Size(150,60))이 같은 크기인지 확인시키면 좋습니다. 💬 "각도를 90 으로 바꾸면?" — 세로로 긴 타원. (6분)</p>' },
          { layout: 'code', title: '예제 4: 다각형 · 화살표 · 마커', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(400, 640, MatType.CV_8UC3, new Scalar(35, 35, 35));

        Point[] tri = { new Point(60, 40), new Point(200, 40), new Point(130, 150) };
        Point[] hex = { new Point(520, 40), new Point(600, 70), new Point(600, 130),
                        new Point(520, 160), new Point(480, 100) };

        // 여러 다각형을 받으므로 '배열의 배열'
        Cv2.Polylines(canvas, new Point[][] { tri }, true, Scalar.Yellow, 2, LineTypes.AntiAlias);
        Cv2.FillConvexPoly(canvas, hex, new Scalar(255, 120, 60), LineTypes.AntiAlias);

        Cv2.ArrowedLine(canvas, new Point(60, 340), new Point(250, 250), Scalar.White, 2,
                        LineTypes.AntiAlias, 0, 0.18);
        Cv2.DrawMarker(canvas, new Point(400, 300), Scalar.Red, MarkerTypes.Cross, 26, 2);
        Cv2.DrawMarker(canvas, new Point(460, 300), Scalar.Lime, MarkerTypes.Diamond, 26, 2);
        Cv2.ImShow("polygons", canvas);
    }
}`, points: ['꼭짓점 = <code>Point[]</code> (모두 (x, y))', '<code>Polylines</code> 의 <code>isClosed=true</code> → 닫힌 도형', '<code>FillPoly</code>(오목 OK) vs <code>FillConvexPoly</code>(볼록 전용 · 빠름)', '<code>ArrowedLine</code> 의 <code>tipLength</code> = 화살촉 비율'], notes: '<p>배열의 배열이 왜 필요한지 — 12차시 FindContours 가 윤곽선 여러 개를 돌려주기 때문이라고 미리 알려 줍니다. 학생 활동: 꼭짓점 좌표를 바꿔 자기 모양 만들기. (6분)</p>' },
          { layout: 'code', title: '예제 5: 격자 그리기 — 메서드로 분리', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(480, 640, MatType.CV_8UC3, new Scalar(250, 250, 250));
        DrawGrid(canvas, 40);
        Console.WriteLine($"세로선 {canvas.Width / 40 + 1}개");
        Cv2.ImShow("grid", canvas);
    }
    static void DrawGrid(Mat img, int step)
    {
        var thin = new Scalar(215, 215, 215);
        var bold = new Scalar(150, 150, 150);
        for (int x = 0; x <= img.Width; x += step)
            Cv2.Line(img, new Point(x, 0), new Point(x, img.Height), x % (step * 5) == 0 ? bold : thin, 1);
        for (int y = 0; y <= img.Height; y += step)
            Cv2.Line(img, new Point(0, y), new Point(img.Width, y), y % (step * 5) == 0 ? bold : thin, 1);
    }
}`, points: ['반복되는 그리기는 <b>메서드로</b> — 어느 이미지에나 재사용', 'Mat 은 class(참조) → <code>return</code> 없이도 반영된다', '<code>step * 5</code> 마다 굵은 선 → 좌표 읽기 쉽게', '<code>img.Width</code>·<code>img.Height</code> 를 쓰면 크기에 상관없이 동작'], notes: '<p>"그리기 코드를 Main 에 다 넣으면 금방 지저분해진다" 를 체감시키는 슬라이드입니다. 3차시의 참조 복사(<code>Mat b = a</code>)와 연결해 왜 return 이 필요 없는지 설명합니다. 💬 "step 을 20 으로 바꾸면 선이 몇 개?" (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>Cv2.Circle(img, new Point(100, 50), 30, Scalar.Red, -1)</code> 에서 <code>-1</code> 의 뜻은?', options: ['선을 지운다', '안을 채운다', '두께 1로 그린다', '오류'], answer: 1, explain: '두께 −1(= LineTypes.Filled) = <b>안을 채우기</b>. Rectangle · Ellipse 도 같습니다.', notes: '<p>정답 2번. 이어서 구두 퀴즈: "<code>new Scalar(255, 0, 0)</code> 은?" — 파랑(BGR). (2분)</p>' },
          { layout: 'practice', title: '실습: 과녁(동심원) 그리기', desc: '<p>400×400 캔버스에 중심 (200, 200) 의 과녁을 그리세요.</p><ul><li>반지름 180 → 20, 20 씩 줄이며 <b>채운 원</b>(−1)</li><li>색은 빨강 · 흰색 번갈아 (큰 원부터!)</li><li>중심에 <code>DrawMarker</code> 검정 십자 (크기 40, 두께 2)</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(400, 400, MatType.CV_8UC3, new Scalar(240, 240, 240));
        int n = 0;
        for (int r = 180; r >= 20; r -= 20)
        {
            // TODO: 짝/홀로 색을 바꿔 채운 원 그리기
        }
        // TODO: 중심에 검정 십자 마커
        Console.WriteLine($"원 개수: {n}");
        Cv2.ImShow("target", canvas);
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(400, 400, MatType.CV_8UC3, new Scalar(240, 240, 240));
        int n = 0;
        for (int r = 180; r >= 20; r -= 20)
        {
            Scalar col = n % 2 == 0 ? new Scalar(0, 0, 255) : new Scalar(255, 255, 255);
            Cv2.Circle(canvas, new Point(200, 200), r, col, -1);
            n++;
        }
        Cv2.DrawMarker(canvas, new Point(200, 200), new Scalar(0, 0, 0), MarkerTypes.Cross, 40, 2);
        Console.WriteLine($"원 개수: {n}");
        Cv2.ImShow("target", canvas);
    }
}`, notes: '<p>정답: 원 9개 (가장 바깥 · 가장 안쪽 모두 빨강, 중심 픽셀은 마지막에 그린 검정 십자 색). 흔한 실수: 작은 원부터 그려서 큰 원이 덮어 버리는 것 — "나중에 그린 것이 위" 규칙을 확인시킵니다. 빨리 끝난 학생은 실습 2(부품 위치 표시 메서드)로. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['그리기 함수의 위치 인수는 모두 <b>(x, y)</b> · 색은 <b>Scalar(B, G, R)</b> · 두께 <b>−1 = 채우기</b>', 'Line · Rectangle(Rect/두 점) · Circle · Ellipse(반지름 Size / RotatedRect 는 지름)', 'Polylines · FillPoly(배열의 배열) · FillConvexPoly(볼록 전용) · ArrowedLine · DrawMarker', '보여 줄 그림은 <code>LineTypes.AntiAlias</code>, 계산용 마스크는 기본값', '반복 도형은 <b>반복문 + 메서드</b>로 정리 (<code>static void DrawGrid(Mat img, int step)</code>)', '다음 교시: 글자 넣기 — PutText 와 GetTextSize 로 라벨 상자 만들기'], notes: '<p>세 규칙(좌표 (x,y) · BGR · −1 채우기)을 학생들이 소리 내어 말하게 합니다. 다음 교시 예고: "부품에 번호를 붙이려면 글자가 필요하다". (2분)</p>' }
        ]
      },

      // ================================================================ 2교시
      {
        id: 'cs04-2', title: '텍스트와 라벨: PutText · GetTextSize', minutes: 50,
        goals: ['PutText 의 기준점(글자 왼쪽 아래)과 HersheyFonts · fontScale · 두께를 이해한다', 'GetTextSize 로 글자 크기를 재어 배경 상자가 있는 라벨과 오버레이 패널을 만들 수 있다', '한글이 안 되는 이유와 WPF TextBlock 오버레이 방법을 안다', 'coins_parts.png 의 부품 12개에 번호 · 크기 라벨을 붙여 저장할 수 있다'],
        flow: [['도입: PutText 기준점', 8], ['폰트 · 크기 · GetTextSize', 14], ['라벨 상자 · 오버레이 패널', 18], ['미니 프로젝트 · 정리', 10]],
        content: [
          { type: 'h', text: 'PutText: 기준점은 글자의 왼쪽 아래' },
          { type: 'p', html: '<code>Cv2.PutText(img, text, org, font, fontScale, color, thickness, lineType)</code> — 여기서 <code>org</code>(origin)는 글자의 <b>왼쪽 아래</b>, 정확히는 <b>기준선(baseline)의 왼쪽 끝</b>입니다. 사각형처럼 왼쪽 <u>위</u>가 아니므로, <code>new Point(10, 10)</code> 에 글자를 쓰면 글자가 위쪽 밖으로 잘려 거의 보이지 않습니다. 이것이 PutText 의 첫 번째 함정입니다.' },
          { type: 'figure', html: FIG_TEXT, caption: '그림 3. org = 기준선의 왼쪽 끝. GetTextSize 는 폭 · 높이 · baseLine(기준선 아래 여유)을 돌려준다' },
          { type: 'table', head: ['HersheyFonts', '특징', '어울리는 곳'], rows: [
            ['<code>HersheySimplex</code>', '가장 기본 · 얇은 산세리프 (가장 많이 씀)', '라벨 · 측정값'],
            ['<code>HersheyPlain</code>', '아주 작고 단순 (같은 scale 에서 제일 작다)', '좁은 곳 · 눈금 숫자'],
            ['<code>HersheyDuplex</code>', 'Simplex 의 두 줄 버전 — 조금 굵어 보임', '제목'],
            ['<code>HersheyComplex</code>', '세리프(장식) 있는 글꼴', '보고서용 캡션'],
            ['<code>HersheyTriplex</code>', '가장 굵고 또렷 (폭이 넓다)', '큰 판정 표시 (OK / NG)'],
            ['<code>HersheyComplexSmall</code>', 'Complex 의 작은 버전', '좁은 곳'],
            ['<code>HersheyScriptSimplex</code> · <code>HersheyScriptComplex</code>', '필기체', '장식용 (검사 화면에는 비추천)'],
            ['<code>| HersheyFonts.Italic</code>', '어떤 글꼴에든 <code>|</code> 로 더하면 이탤릭', '강조']
          ], caption: '표 2. 내장 Hershey 벡터 폰트 8종 — Python 의 cv2.FONT_HERSHEY_* 와 같다' },
          { type: 'code', title: '예제 1: 폰트 8종 비교 (+ 크기 측정)', code: EX2_FONTS,
            desc: '같은 <code>fontScale=0.9</code>, 같은 글자인데도 폰트마다 <b>폭과 높이가 다릅니다</b>. <code>HersheyPlain</code> 이 가장 작고 <code>HersheyTriplex</code> 가 가장 큽니다 — 그래서 "몇 픽셀 자리를 차지할지"는 항상 <code>Cv2.GetTextSize</code> 로 물어봐야 합니다. 결과 창에서 필기체(Script)가 검사 화면에 왜 안 어울리는지도 눈으로 확인하세요.',
            expect: 'Simplex        폭=199 높이=19 baseLine=2\nPlain          폭=98 높이=9 baseLine=1\nDuplex         폭=202 높이=19 baseLine=2\nComplex        폭=207 높이=19 baseLine=2\nTriplex        폭=210 높이=19 baseLine=2\nComplexSmall   폭=148 높이=12 baseLine=2\nScriptSimplex  폭=195 높이=19 baseLine=2\nScriptComplex  폭=199 높이=19 baseLine=2' },
          { type: 'h', text: 'fontScale · 두께 · GetTextSize' },
          { type: 'code', title: '예제 2: fontScale 을 키우며 글자 상자 그리기', code: EX2_SCALE,
            desc: '<code>fontScale</code> 은 <b>배율</b>입니다(1.0 이 기본 크기, 0.5 는 절반). <code>thickness</code> 는 획의 굵기로, 크게 쓸 때는 2~3 이 읽기 좋습니다. 회색 사각형이 <code>GetTextSize</code> 로 계산한 <b>글자 상자</b>(높이 = <code>Height + baseLine</code>)이고 주황 선이 <b>기준선</b>입니다 — 글자가 상자 안에 정확히 들어가는지 확인하세요. 출력을 보면 scale 이 2배가 되면 폭 · 높이도 대략 2배가 됩니다.',
            expect: 'fontScale=0.5 → 폭 76, 높이 11, baseLine 4\nfontScale=0.8 → 폭 121, 높이 18, baseLine 4\nfontScale=1.2 → 폭 177, 높이 26, baseLine 4\nfontScale=1.8 → 폭 267, 높이 39, baseLine 4' },
          { type: 'callout', kind: 'warn', title: '한글은 그려지지 않는다', html: 'OpenCV 는 <b>Hershey 벡터 폰트</b>(영문 대소문자 · 숫자 · 기본 기호)만 내장합니다. <code>Cv2.PutText(img, "양품", …)</code> 을 하면 한글 자리에 <b>물음표나 이상한 기호</b>가 나옵니다(오류는 나지 않습니다). 그래서 이미지에 새기는 글자는 <b>영문 · 숫자로</b> 씁니다: <code>"OK"</code>, <code>"NG"</code>, <code>"AREA 12.34 mm2"</code>, <code>"LOT A2309-117"</code>. 한글이 꼭 필요하면 ① <b>WPF TextBlock 오버레이</b>(권장) ② <code>System.Drawing.Graphics.DrawString</code> 으로 그린 비트맵을 Mat 에 합성 ③ freetype 모듈(별도 빌드) 중에서 고릅니다.' },
          { type: 'h', text: '핵심 기법: GetTextSize 로 배경 상자 만들기' },
          { type: 'p', html: '사진 위에 그냥 글자를 쓰면 배경이 밝은 곳에서는 흰 글자가, 어두운 곳에서는 검은 글자가 사라집니다. 해결책은 <b>글자 크기를 미리 재서 채운 상자를 깔고 그 위에 글자를 얹기</b>입니다. 이것이 검사 장비 화면에서 가장 많이 쓰이는 표현이고, <code>Cv2.GetTextSize</code> 가 바로 그 목적의 함수입니다.' },
          { type: 'figure', html: FIG_LABEL, caption: '그림 4. ① GetTextSize 로 재고 ② 채운 상자를 그리고 ③ 글자를 얹는다 — 순서를 바꾸면 글자가 상자에 덮힌다' },
          { type: 'code', title: '예제 3: 라벨 상자 함수 DrawLabel', code: EX2_LABEL,
            desc: '<code>Cv2.GetTextSize(text, font, scale, thickness, out int baseLine)</code> 이 <code>Size</code>(폭 · 높이)를 돌려주고 <code>baseLine</code> 을 <code>out</code> 으로 알려 줍니다. 여기에 여백(<code>pad</code>)을 더해 <code>Rect</code> 를 만들고 <b>두께 −1 로 채운 뒤</b> 글자를 얹습니다. 글자의 기준점은 <b>상자의 왼쪽 아래에서 pad 만큼 위</b>(<code>box.Bottom - pad</code>)입니다. 이 메서드 하나를 만들어 두면 이후 모든 차시에서 재사용할 수 있습니다.',
            expect: '\'L  D6.8\' → 글자 59x10, baseLine 2, 상자 (x:86 y:110 width:67 height:18)\n\'M  D5.4\' → 글자 63x10, baseLine 2, 상자 (x:387 y:182 width:71 height:18)\n\'S  D4.0\' → 글자 60x10, baseLine 2, 상자 (x:313 y:247 width:68 height:18)' },
          { type: 'h', text: '결과 오버레이 패널' },
          { type: 'code', title: '예제 4: 측정값 오버레이 패널 (반투명 배경 + OK/NG)', code: EX2_PANEL,
            desc: '실제 검사 화면처럼 왼쪽 위에 <b>측정값 패널</b>을 올립니다. <code>Dim</code> 메서드는 패널 자리의 <b>ROI 를 잘라</b>(3차시) 어두운 Mat 과 <code>Cv2.AddWeighted(roi, 0.30, dark, 0.70, 0, roi)</code> 로 섞어 <b>반투명 효과</b>를 냅니다 — ROI 가 원본 메모리를 가리키므로 결과가 바로 이미지에 반영됩니다. 판정 줄만 색을 바꿔(OK = 초록, NG = 빨강) 한눈에 보이게 했습니다.',
            expect: 'Otsu 임계값 125, 면적 비율 15.13 %, 판정 OK' },
          { type: 'callout', kind: 'tip', title: '글자가 배경에 묻힐 때 쓰는 세 가지', html: '<ul><li><b>배경 상자</b>: GetTextSize + <code>Rectangle(..., -1)</code> (예제 3)</li><li><b>반투명 패널</b>: ROI + <code>Cv2.AddWeighted</code> (예제 4)</li><li><b>외곽선 글자</b>: 같은 글자를 <b>두꺼운 검정</b>(thickness 4)으로 먼저 쓰고, 그 위에 <b>얇은 흰색</b>(thickness 1~2)을 덧쓰면 어떤 배경에서도 읽힙니다.</li></ul>' },
          { type: 'h', text: '미니 프로젝트: 부품 12개에 번호 라벨 붙이기' },
          { type: 'image', src: 'images/coins_parts.png', caption: 'images/coins_parts.png — 어두운 배경 위 밝은 원형 부품 12개 (지름 3종: r=34 ×3, r=27 ×4, r=20 ×5)' },
          { type: 'code', title: '예제 5: coins_parts.png 에 번호 · 크기 라벨 붙여 저장', code: EX2_MINI,
            desc: '부품을 <b>찾는</b> 방법(HoughCircles · 윤곽선)은 12~13차시에서 배우므로, 지금은 <code>assets/IMAGES.md</code> 에 적힌 <b>정답 좌표 · 반지름을 배열에 직접 넣어</b> 그립니다. 반지름으로 L · M · S 를 나누고, 크기마다 다른 색으로 원 · 십자 · 라벨을 그린 뒤 <code>Cv2.ImWrite</code> 로 저장합니다 (📁 작업 폴더에서 내려받아 보세요). 배율 0.1 mm/px 를 곱해 지름을 mm 로 표시하는 것까지가 실제 검사 화면의 모습입니다.',
            expect: '부품 12개 — L 3 · M 4 · S 5\n1번 라벨 색 At(120, 120) = Vec3b(60, 180, 255)\n저장: coins_labeled.png (📁 작업 폴더에서 내려받기)' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는 — 한글 라벨은 TextBlock 으로', html: '아래 XAML 처럼 <code>Grid</code> 안에서 <code>Image</code> 위에 <code>Border</code> + <code>TextBlock</code> 을 겹치면 <b>한글 · 폰트 · 투명도</b>를 자유롭게 쓸 수 있고, 값만 바꿔도 화면이 갱신됩니다. 숫자 · 도형은 OpenCV 로 Mat 에 새겨 저장용으로 쓰고, 한글 안내는 WPF 로 표시하는 식으로 <b>역할을 나누는 것</b>이 실무의 정석입니다.' },
          { type: 'code', title: 'WPF: 이미지 위에 한글 라벨 겹치기 (XAML)', code: EX2_WPF_XAML, lang: 'xml', file: 'MainWindow.xaml', run: false, local: true,
            desc: '<code>Grid</code> 는 자식들을 <b>겹쳐</b> 배치합니다. <code>Background="#99000000"</code> 의 앞 두 자리가 알파(투명도)이므로 반투명 검정 패널이 됩니다 — 예제 4 의 <code>AddWeighted</code> 와 같은 효과를 XAML 한 줄로.' },
          { type: 'code', title: 'WPF: 측정은 OpenCV, 한글 표시는 TextBlock', code: EX2_WPF_CS, lang: 'cs', file: 'MainWindow.xaml.cs', run: false, local: true,
            desc: '같은 측정 코드(예제 4)를 쓰고, 이미지에 새길 영문 · 숫자는 <code>Cv2.PutText</code> 로, 한글 판정 문구는 <code>TxtJudge.Text</code> 로 넣습니다. 완성 프로젝트는 <code>wpf/Ch04_Drawing</code> 에 있습니다.' },
          { type: 'wpf', title: '시작 템플릿에 오버레이 기능 붙여 보기', project: 'OpenCvWpfStarter', html: '<code>OpenCvWpfStarter</code> 프로젝트에 <b>[라벨 그리기]</b> 버튼을 추가해 보세요. ① OpenCV 로 도형 · 영문 라벨을 새긴 결과를 <code>Image</code> 에 표시하고, ② 한글 설명은 위 예제처럼 WPF <code>TextBlock</code> 오버레이로 겹쳐 보여 줍니다. 판정 결과를 오버레이로 보여 주는 완성된 모습은 17차시의 <code>Ch17_Inspection</code> 에서 볼 수 있습니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도 · 평가', html: '<ul><li><b>PutText 기준점</b>: 수업 시작에 <code>new Point(10, 10)</code> 으로 글자를 써서 <b>잘려 보이지 않는 화면</b>을 먼저 보여 주고 "왜 안 보일까?" 를 묻습니다. 기억에 아주 잘 남습니다.</li><li><b>반지름 vs 지름</b>(1교시 Ellipse) 과 <b>Size(w, h) vs Rect(x, y, w, h)</b> 혼동이 가장 흔합니다.</li><li><b>한글</b>: 학생들이 반드시 "양품" 을 써 보려 합니다. 미리 한 번 시연해 물음표가 나오는 것을 보여 주고 WPF 대안을 안내하세요.</li><li><b>AntiAlias 와 마스크</b>: 시간이 되면 <code>Cv2.Circle(mask, …, -1, LineTypes.AntiAlias)</code> 후 <code>CountNonZero</code> 값이 달라지는 것을 보여 줍니다 (07차시 이진화와 연결).</li><li>평가 루브릭: ① 원하는 위치에 도형을 그린다 (3) ② GetTextSize 로 배경 상자 라벨을 만든다 (4) ③ 그리기 코드를 메서드로 분리했다 (2) ④ 색 · 두께로 OK/NG 를 구분했다 (1).</li><li>과제: 미니 프로젝트(예제 5)의 라벨에 <b>번호를 원 안쪽</b>에 넣도록 바꾸고, L/M/S 개수를 오버레이 패널로 함께 표시해 오기.</li></ul>' }
        ],
        practice: [
          {
            title: '라벨 상자로 부품 이름표 붙이기', level: 1,
            desc: '<code>images/washers.png</code> 를 3채널로 바꾼 뒤, <b>배경 상자가 있는 라벨</b>을 붙이는 <code>DrawLabel</code> 메서드를 완성해 세 부품에 이름표를 붙이세요: W1 (90, 90) 노랑 · N2 (340, 240) 초록 · B3 (400, 400) 빨강. 라벨의 기준 위치는 부품 중심에서 위로 50 픽셀(<code>new Point(center.X - 40, center.Y - 50)</code>)로 하고, 각 라벨의 글자 폭 · 높이를 출력하세요.',
            hint: '① <code>Size s = Cv2.GetTextSize(text, font, 0.5, 1, out int baseLine);</code> ② <code>var box = new Rect(p.X, p.Y - s.Height - 8, s.Width + 8, s.Height + 8);</code> ③ <code>Cv2.Rectangle(img, box, color, -1);</code> ④ <code>Cv2.PutText(img, text, new Point(box.X + 4, box.Bottom - 4), font, 0.5, new Scalar(20,20,20), 1);</code>',
            expect: '\'W1 washer\' 글자 85x10 baseLine 2\n\'N2 nut\' 글자 53x10 baseLine 2\n\'B3 bolt\' 글자 57x10 baseLine 2',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var view = new Mat();
        Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR);

        DrawLabel(view, new Point(50, 40), "W1 washer", new Scalar(0, 255, 255));
        // TODO: N2 (340, 240) 초록, B3 (400, 400) 빨강 라벨도 붙이세요

        Cv2.ImShow("named", view);
        Cv2.WaitKey(0);
    }

    static void DrawLabel(Mat img, Point p, string text, Scalar color)
    {
        HersheyFonts font = HersheyFonts.HersheySimplex;
        Size s = Cv2.GetTextSize(text, font, 0.5, 1, out int baseLine);
        Console.WriteLine($"'{text}' 글자 {s.Width}x{s.Height} baseLine {baseLine}");
        // TODO: 배경 상자(채우기)를 그린 뒤 글자를 얹으세요
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var view = new Mat();
        Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR);

        DrawLabel(view, new Point(50, 40), "W1 washer", new Scalar(0, 255, 255));
        DrawLabel(view, new Point(300, 190), "N2 nut", new Scalar(0, 255, 0));
        DrawLabel(view, new Point(360, 350), "B3 bolt", new Scalar(0, 0, 255));

        Cv2.ImShow("named", view);
        Cv2.WaitKey(0);
    }

    static void DrawLabel(Mat img, Point p, string text, Scalar color)
    {
        HersheyFonts font = HersheyFonts.HersheySimplex;
        Size s = Cv2.GetTextSize(text, font, 0.5, 1, out int baseLine);
        Console.WriteLine($"'{text}' 글자 {s.Width}x{s.Height} baseLine {baseLine}");
        var box = new Rect(p.X, p.Y - s.Height - 8, s.Width + 8, s.Height + 8);
        Cv2.Rectangle(img, box, color, -1);
        Cv2.Rectangle(img, box, new Scalar(30, 30, 30), 1);
        Cv2.PutText(img, text, new Point(box.X + 4, box.Bottom - 4), font, 0.5,
                    new Scalar(20, 20, 20), 1, LineTypes.AntiAlias);
    }
}`
          },
          {
            title: '오른쪽 아래에 정렬된 검사 결과 쓰기', level: 2,
            desc: '<code>images/coins_parts.png</code> 를 3채널로 바꾼 뒤 <b>오른쪽 아래 모서리에 오른쪽 정렬</b>로 두 줄을 쓰세요: <code>"PARTS 12"</code> 와 <code>"JUDGE OK"</code>. 오른쪽 정렬은 <code>Cv2.GetTextSize</code> 로 폭을 재서 <code>x = img.Width - s.Width - 12</code> 로 계산합니다. 두 번째 줄은 초록색, 폰트는 <code>HersheySimplex</code> · scale 0.8 · 두께 2 로 하고, 각 줄의 x 좌표와 폭을 출력하세요.',
            hint: '아래 줄부터 y 를 정하면 편합니다: 아래 줄 기준선 y = <code>img.Height - 16</code>, 위 줄은 그보다 <code>s.Height + 14</code> 만큼 위. 글자가 잘 보이도록 두꺼운 검정으로 먼저 쓰고 그 위에 색 글자를 덧써도 좋습니다.',
            expect: '\'JUDGE OK\' x=501, 폭=127, 높이=18\n\'PARTS 12\' x=507, 폭=121, 높이=18',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var view = new Mat();
        Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR);

        HersheyFonts font = HersheyFonts.HersheySimplex;
        string line1 = "PARTS 12", line2 = "JUDGE OK";

        // TODO: line2 의 크기를 재서 오른쪽 아래(여백 12)에 초록으로 쓰세요
        // TODO: line1 은 그 위쪽에 흰색으로 오른쪽 정렬해 쓰세요

        Cv2.ImShow("result", view);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var view = new Mat();
        Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR);

        HersheyFonts font = HersheyFonts.HersheySimplex;
        string line1 = "PARTS 12", line2 = "JUDGE OK";

        Size s2 = Cv2.GetTextSize(line2, font, 0.8, 2, out int bl2);
        int x2 = view.Width - s2.Width - 12, y2 = view.Height - 16;
        Cv2.PutText(view, line2, new Point(x2, y2), font, 0.8, new Scalar(0, 0, 0), 5, LineTypes.AntiAlias);
        Cv2.PutText(view, line2, new Point(x2, y2), font, 0.8, new Scalar(80, 255, 80), 2, LineTypes.AntiAlias);
        Console.WriteLine($"'{line2}' x={x2}, 폭={s2.Width}, 높이={s2.Height}");

        Size s1 = Cv2.GetTextSize(line1, font, 0.8, 2, out int bl1);
        int x1 = view.Width - s1.Width - 12, y1 = y2 - s2.Height - 14;
        Cv2.PutText(view, line1, new Point(x1, y1), font, 0.8, new Scalar(0, 0, 0), 5, LineTypes.AntiAlias);
        Cv2.PutText(view, line1, new Point(x1, y1), font, 0.8, new Scalar(255, 255, 255), 2, LineTypes.AntiAlias);
        Console.WriteLine($"'{line1}' x={x1}, 폭={s1.Width}, 높이={s1.Height}");

        Cv2.ImShow("result", view);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '그리기와 텍스트', subtitle: '2교시 — 텍스트와 라벨: PutText · GetTextSize', notes: '<p>시작하자마자 <code>Cv2.PutText(img, "HELLO", new Point(10, 10), …)</code> 를 실행해 <b>글자가 거의 보이지 않는 화면</b>을 보여 주고 💬 "글자가 어디로 갔을까요?" 를 묻습니다. 답: 기준점이 왼쪽 아래여서 위로 잘렸다. (4분)</p>' },
          { layout: 'diagram', title: 'PutText 의 기준점과 GetTextSize', html: FIG_TEXT, caption: 'org = 기준선(baseline)의 왼쪽 끝 · GetTextSize → 폭 · 높이 · baseLine', notes: '<p>그림에서 org 점의 위치를 손으로 짚습니다. 글자를 완전히 감싸는 상자의 높이가 <code>Height + baseLine</code> 인 이유(g, y, p 의 꼬리)를 설명합니다. 💬 "글자를 (10, 10) 에 쓰려면 y 를 얼마로 해야 할까?" — 최소 Height 만큼(약 20~30). (6분)</p>' },
          { layout: 'table', title: '내장 폰트 HersheyFonts', head: ['폰트', '특징', '쓰는 곳'], rows: [
            ['<code>HersheySimplex</code>', '기본 · 얇은 산세리프', '라벨 · 측정값 (거의 항상 이것)'],
            ['<code>HersheyPlain</code>', '가장 작고 단순', '눈금 숫자 · 좁은 곳'],
            ['<code>HersheyDuplex</code>', '조금 굵음', '제목'],
            ['<code>HersheyTriplex</code>', '가장 굵고 또렷', 'OK / NG 큰 표시'],
            ['<code>HersheyComplex(Small)</code>', '세리프', '캡션'],
            ['<code>HersheyScript…</code>', '필기체', '장식 (검사 화면 비추천)'],
            ['<code>… | HersheyFonts.Italic</code>', '이탤릭 추가', '강조']
          ], lead: 'Python 의 cv2.FONT_HERSHEY_* 와 같다 — 한글은 없다!', notes: '<p>예제 1 을 실행해 8종을 함께 봅니다. 같은 scale 인데 폭·높이가 다르다는 점 → "자리 계산은 GetTextSize 로" 로 이어집니다. 마지막 줄의 "한글은 없다" 를 강조하고 뒤에서 다룬다고 예고. (4분)</p>' },
          { layout: 'code', title: '예제 1: 폰트별 크기 재기', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(300, 640, MatType.CV_8UC3, new Scalar(250, 250, 250));
        HersheyFonts[] fonts = { HersheyFonts.HersheySimplex, HersheyFonts.HersheyPlain,
                                 HersheyFonts.HersheyTriplex, HersheyFonts.HersheyComplex };
        string[] names = { "Simplex", "Plain", "Triplex", "Complex" };

        for (int i = 0; i < fonts.Length; i++)
        {
            string t = "OK 12.34 mm";
            Cv2.PutText(canvas, t + "  " + names[i], new Point(20, 50 + i * 60), fonts[i],
                        0.9, new Scalar(40, 40, 40), 1, LineTypes.AntiAlias);
            Size s = Cv2.GetTextSize(t, fonts[i], 0.9, 1, out int baseLine);
            Console.WriteLine($"{names[i].PadRight(8)} 폭={s.Width} 높이={s.Height} baseLine={baseLine}");
        }
        Cv2.ImShow("fonts", canvas);
    }
}`, points: ['같은 scale 이라도 폰트마다 폭 · 높이가 다르다', '<code>out int baseLine</code> — 기준선 아래 여유 높이', '검사 화면은 <code>HersheySimplex</code> 가 기본', '<code>LineTypes.AntiAlias</code> 로 글자도 매끈하게'], notes: '<p>출력 표를 함께 읽으며 Plain 이 가장 작고 Triplex 가 가장 큰 것을 확인합니다. 💬 "글자를 화면 폭에 맞추려면?" — GetTextSize 로 재서 scale 을 조절하거나 줄을 나눈다. (5분)</p>' },
          { layout: 'code', title: '예제 2: fontScale 과 글자 상자', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(320, 640, MatType.CV_8UC3, new Scalar(250, 250, 250));
        string text = "OK 12.34";  int y = 54;
        double[] scales = { 0.5, 0.8, 1.2, 1.8 };  HersheyFonts f = HersheyFonts.HersheySimplex;
        foreach (double sc in scales)
        {
            Size s = Cv2.GetTextSize(text, f, sc, 2, out int bl);
            Cv2.Rectangle(canvas, new Rect(40, y - s.Height, s.Width, s.Height + bl), new Scalar(190, 190, 190), 1);
            Cv2.Line(canvas, new Point(40, y), new Point(40 + s.Width, y), new Scalar(255, 160, 0), 1);   // 기준선
            Cv2.PutText(canvas, text, new Point(40, y), f, sc, new Scalar(30, 30, 30), 2, LineTypes.AntiAlias);
            Console.WriteLine($"scale={sc:F1} 폭 {s.Width} 높이 {s.Height} baseLine {bl}");
            y += s.Height + bl + 22;
        }
        Cv2.ImShow("fontScale", canvas);
    }
}`, points: ['<code>fontScale</code> = 배율 (1.0 이 기본)', '상자 높이 = <code>Height + baseLine</code>', '크게 쓸 때는 <code>thickness</code> 2~3', 'scale 2배 → 폭 · 높이도 대략 2배'], notes: '<p>화면에서 글자가 회색 상자 안에 정확히 들어가는지 확인합니다. 주황 기준선이 org 의 y 라는 것을 짚습니다. 학생 활동: scale 3.0 을 넣어 보고 글자가 잘리는지 보기(캔버스 크기 문제). (5분)</p>' },
          { layout: 'diagram', title: '라벨 상자 만드는 3단계', html: FIG_LABEL, caption: '① GetTextSize 로 재기 → ② 채운 상자 그리기 → ③ 글자 얹기', notes: '<p>순서가 중요합니다 — 글자를 먼저 쓰면 상자가 글자를 덮습니다. 💬 "왜 배경 상자가 필요할까?" — 밝은 배경에서 흰 글자가, 어두운 배경에서 검은 글자가 사라진다. 실제 검사 장비 화면 사진을 떠올리게 합니다. (5분)</p>' },
          { layout: 'code', title: '예제 3: DrawLabel — 배경 상자가 있는 라벨', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var view = gray.CvtColor(ColorConversionCodes.GRAY2BGR);   // 확장 메서드 = 새 Mat
        DrawLabel(view, new Point(86, 128), "L  D6.8", new Scalar(60, 180, 255));
        DrawLabel(view, new Point(387, 200), "M  D5.4", new Scalar(90, 220, 90));
        Cv2.ImShow("labels", view);
    }
    static void DrawLabel(Mat img, Point anchor, string text, Scalar color)
    {
        HersheyFonts font = HersheyFonts.HersheySimplex;  int pad = 4;
        Size s = Cv2.GetTextSize(text, font, 0.5, 1, out int baseLine);
        var box = new Rect(anchor.X, anchor.Y - s.Height - 2 * pad, s.Width + 2 * pad, s.Height + 2 * pad);
        Cv2.Rectangle(img, box, color, -1);                                          // ① 채운 상자
        Cv2.PutText(img, text, new Point(box.X + pad, box.Bottom - pad), font, 0.5, new Scalar(20, 20, 20), 1);
    }
}`, points: ['크기 재기 → 상자(−1) → 글자 순서', 'org = <code>box.Bottom - pad</code> (상자 왼쪽 아래)', '배경색과 <b>대비되는</b> 글자색', '한 번 만들어 두면 모든 차시에서 재사용'], notes: '<p>이 차시의 핵심 코드입니다. 학생들이 그대로 따라 쓰고 pad · scale 을 바꿔 보게 합니다. 💬 "글자색을 흰색으로 바꾸면?" — 밝은 상자에서 안 보인다 → 상자색에 맞춰 글자색을 고르는 습관. (6분)</p>' },
          { layout: 'two', title: '한글은 어떻게?', left: { title: '❌ OpenCV PutText', bullets: ['Hershey <b>벡터 폰트</b>만 내장 (영문 · 숫자 · 기호)', '<code>PutText(img, "양품", …)</code> → 물음표 · 이상한 기호', '오류는 안 나므로 놓치기 쉽다', '이미지에 새길 글자는 <b>영문 · 숫자</b>로: <code>OK</code>, <code>NG</code>, <code>AREA 12.34</code>'] }, right: { title: '✅ WPF 오버레이 (권장)', bullets: ['<code>Grid</code> 안에서 <code>Image</code> 위에 <code>TextBlock</code> 을 겹친다', '한글 · 폰트 · 투명도 · 애니메이션 자유', '값만 바꾸면 화면이 갱신 (다시 그리기 불필요)', '대안: <code>System.Drawing</code> 으로 그린 비트맵 합성, freetype 모듈'] }, notes: '<p>실제로 "양품" 을 PutText 해 보여 주는 것이 가장 효과적입니다. 역할 분담을 정리: <b>저장할 이미지에 새기는 영문 · 숫자 = OpenCV, 화면용 한글 = WPF</b>. 16차시 스튜디오 앱에서 구현한다고 예고. (5분)</p>' },
          { layout: 'code', title: '예제 4: 결과 오버레이 패널', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var view = gray.CvtColor(ColorConversionCodes.GRAY2BGR);
        using var bin = new Mat();
        double th = Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        double ratio = 100.0 * Cv2.CountNonZero(bin) / bin.Total();
        var panel = new Rect(12, 12, 250, 82);
        using (var roi = view[panel])
        using (var dark = new Mat(roi.Size(), MatType.CV_8UC3, new Scalar(15, 15, 15)))
            Cv2.AddWeighted(roi, 0.30, dark, 0.70, 0, roi);       // 반투명 배경
        Cv2.Rectangle(view, panel, new Scalar(200, 200, 200), 1);
        Cv2.PutText(view, $"OTSU TH : {th:F0}", new Point(22, 40), HersheyFonts.HersheySimplex, 0.5, Scalar.White, 1);
        Cv2.PutText(view, $"AREA    : {ratio:F2} %", new Point(22, 62), HersheyFonts.HersheySimplex, 0.5, Scalar.White, 1);
        Cv2.PutText(view, "JUDGE   : OK", new Point(22, 84), HersheyFonts.HersheySimplex, 0.5, Scalar.Lime, 1);
        Cv2.ImShow("panel", view);
    }
}`, points: ['ROI + <code>Cv2.AddWeighted</code> = 반투명 패널', 'ROI 는 원본 메모리 → 결과가 바로 반영 (3차시)', '판정 줄만 색을 바꿔 한눈에 (OK 초록 / NG 빨강)', '측정값은 <code>{v:F2}</code> 로 자릿수 고정'], notes: '<p>3차시 ROI 지식이 여기서 쓰입니다 — "ROI 에 AddWeighted 를 하면 왜 원본이 바뀌는가?"를 복습 질문으로. 실무 팁: 패널 위치 · 색 · 줄 간격을 상수로 빼 두면 유지보수가 쉽다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>Cv2.PutText(img, "OK", new Point(100, 200), …)</code> 에서 (100, 200) 은 글자의 어디인가?', options: ['왼쪽 위', '왼쪽 아래(기준선)', '가운데', '오른쪽 아래'], answer: 1, explain: 'org 는 글자의 <b>왼쪽 아래</b>(기준선 위치). 그래서 y 가 작으면 글자가 위로 잘립니다.', notes: '<p>정답 2번. 수업 시작에 보여 준 "안 보이는 글자" 와 연결해 정리합니다. (2분)</p>' },
          { layout: 'practice', title: '미니 프로젝트: 부품 12개에 번호 라벨', desc: '<p><code>images/coins_parts.png</code> 에 <b>번호 · 크기 등급 · 지름(mm)</b> 라벨을 붙이세요. (검출은 12차시 — 좌표는 IMAGES.md 값을 배열로)</p><ul><li>반지름 34 = L, 27 = M, 20 = S → 등급마다 다른 색 원 + 십자 + 라벨</li><li>지름 mm = <code>2 * r * 0.1</code></li><li><code>Cv2.ImWrite</code> 로 저장해 📁 작업 폴더에서 확인</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var view = new Mat();
        Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR);

        Point[] c = { new Point(120, 165), new Point(279, 384), new Point(549, 346),
                      new Point(56, 277), new Point(588, 165), new Point(414, 230), new Point(311, 166),
                      new Point(333, 288), new Point(341, 68), new Point(210, 370),
                      new Point(194, 54), new Point(481, 96) };
        int[] r = { 34, 34, 34, 27, 27, 27, 27, 20, 20, 20, 20, 20 };

        for (int i = 0; i < c.Length; i++)
        {
            // TODO: 등급(L/M/S)과 색을 정하고 원 · 십자 · 라벨을 그리세요
        }
        Console.WriteLine($"부품 {c.Length}개");
        Cv2.ImShow("labeled", view);
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        using var view = new Mat();
        Cv2.CvtColor(gray, view, ColorConversionCodes.GRAY2BGR);

        Point[] c = { new Point(120, 165), new Point(279, 384), new Point(549, 346),
                      new Point(56, 277), new Point(588, 165), new Point(414, 230), new Point(311, 166),
                      new Point(333, 288), new Point(341, 68), new Point(210, 370),
                      new Point(194, 54), new Point(481, 96) };
        int[] r = { 34, 34, 34, 27, 27, 27, 27, 20, 20, 20, 20, 20 };

        for (int i = 0; i < c.Length; i++)
        {
            string cls = r[i] >= 34 ? "L" : (r[i] >= 27 ? "M" : "S");
            Scalar col = r[i] >= 34 ? new Scalar(60, 180, 255)
                       : (r[i] >= 27 ? new Scalar(90, 220, 90) : new Scalar(255, 150, 70));
            Cv2.Circle(view, c[i], r[i], col, 2, LineTypes.AntiAlias);
            Cv2.DrawMarker(view, c[i], col, MarkerTypes.Cross, 12, 1);
            string tag = (i + 1) + " " + cls + " " + (2 * r[i] * 0.1).ToString("F1");
            Size s = Cv2.GetTextSize(tag, HersheyFonts.HersheySimplex, 0.45, 1, out int bl);
            var box = new Rect(c[i].X - r[i], c[i].Y - r[i] - 8 - s.Height, s.Width + 6, s.Height + 6);
            Cv2.Rectangle(view, box, col, -1);
            Cv2.PutText(view, tag, new Point(box.X + 3, box.Bottom - 3), HersheyFonts.HersheySimplex,
                        0.45, new Scalar(20, 20, 20), 1, LineTypes.AntiAlias);
        }
        Console.WriteLine($"부품 {c.Length}개");
        Cv2.ImShow("labeled", view);
    }
}`, notes: '<p>학생들이 가장 재미있어 하는 과제입니다. 흔한 문제: 라벨이 이미지 위쪽 밖으로 나가 잘리는 것(OpenCV 가 알아서 잘라 줌) → y 를 조정하거나 원 아래에 붙이게 합니다. 완성한 이미지를 📁 작업 폴더에서 내려받아 서로 비교하면 좋습니다. (12분)</p>' },
          { layout: 'summary', title: '정리 — 04차시 전체', bullets: ['도형: <code>Line · Rectangle · Circle · Ellipse · Polylines · FillPoly · ArrowedLine · DrawMarker</code> — 위치는 (x, y), 색은 BGR, 두께 −1 = 채우기', '<code>PutText</code> 의 <code>org</code> 는 <b>글자의 왼쪽 아래</b> — 폰트는 <code>HersheySimplex</code> 기본', '<b><code>Cv2.GetTextSize</code> → 배경 상자 라벨</b>: 재기 → 채운 상자 → 글자 (재사용 메서드로)', '반투명 패널 = ROI + <code>Cv2.AddWeighted</code>, 판정은 색으로 (OK 초록 / NG 빨강)', '<b>한글은 PutText 로 안 된다</b> → WPF <code>TextBlock</code> 오버레이', '다음 차시: 색 공간 — BGR · Gray · HSV 로 색으로 물체를 찾는다'], notes: '<p>오늘 만든 <code>DrawLabel</code> 메서드를 각자 코드 창고에 저장해 두라고 안내합니다(이후 차시에서 계속 씁니다). 과제: 미니 프로젝트에 L/M/S 개수 오버레이 패널 추가. (3분)</p>' }
        ]
      }
    ]
  });
})();
