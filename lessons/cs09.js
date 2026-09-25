/* 09차시 모폴로지 연산 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 격자 만들기 도우미 (문자열 SVG)
  function grid(x0, y0, n, cell, cls, on) {
    let s = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const filled = on(r, c);
        s += `<rect x="${x0 + c * cell}" y="${y0 + r * cell}" width="${cell}" height="${cell}" class="${filled ? cls : 'card-bg'}"/>`;
        s += `<rect x="${x0 + c * cell}" y="${y0 + r * cell}" width="${cell}" height="${cell}" class="ln" fill="none"/>`;
      }
    }
    return s;
  }

  // 그림 1: 구조 요소(커널) 세 가지 모양
  const FIG_SE = `<svg viewBox="0 0 700 250" role="img" aria-label="Rect Cross Ellipse 세 가지 구조 요소의 5x5 모양">
  <text x="350" y="22" text-anchor="middle" class="tx-b">Cv2.GetStructuringElement(MorphShapes.____, new Size(5, 5))</text>
  <text x="115" y="56" text-anchor="middle" class="tx-b">MorphShapes.Rect</text>
  ${grid(75, 68, 5, 22, 'p1', () => true)}
  <text x="115" y="206" text-anchor="middle" class="tx-m">1 1 1 1 1 — 정사각형</text>
  <text x="115" y="228" text-anchor="middle" class="tx-m">가장 강하게 깎고 넓힌다</text>
  <text x="350" y="56" text-anchor="middle" class="tx-b">MorphShapes.Cross</text>
  ${grid(310, 68, 5, 22, 'p3', (r, c) => r === 2 || c === 2)}
  <text x="350" y="206" text-anchor="middle" class="tx-m">십자 — 가로 · 세로만</text>
  <text x="350" y="228" text-anchor="middle" class="tx-m">가는 선 · 대각 무늬를 살린다</text>
  <text x="585" y="56" text-anchor="middle" class="tx-b">MorphShapes.Ellipse</text>
  ${grid(545, 68, 5, 22, 'p4', (r, c) => (r === 0 || r === 4 ? c === 2 : true))}
  <text x="585" y="206" text-anchor="middle" class="tx-m">원(타원) — 모서리를 뺀다</text>
  <text x="585" y="228" text-anchor="middle" class="tx-m">둥근 부품에 가장 자연스럽다</text>
</svg>`;

  // 그림 2: 침식과 팽창의 원리
  const FIG_ED = `<svg viewBox="0 0 740 320" role="img" aria-label="구조 요소가 완전히 들어가는 위치만 남기는 침식과 하나라도 겹치면 칠하는 팽창">
  ${ARROW('c09a1')}
  <text x="120" y="24" text-anchor="middle" class="tx-b">원본 (흰색 = 물체)</text>
  ${grid(45, 36, 7, 22, 'p1', (r, c) => (r >= 2 && r <= 4 && c >= 1 && c <= 4) || (r === 0 && c === 6))}
  <text x="120" y="212" text-anchor="middle" class="tx-m">3×4 덩어리 + 외톨이 점 1개</text>
  <text x="120" y="234" text-anchor="middle" class="tx-m">흰 픽셀 = 13개</text>
  <text x="370" y="24" text-anchor="middle" class="tx-b">침식 Erode (3×3 Rect)</text>
  ${grid(295, 36, 7, 22, 'p5', (r, c) => r === 3 && c >= 2 && c <= 3)}
  <text x="370" y="212" text-anchor="middle" class="tx-m">3×3 이 <b>완전히 들어가는</b> 중심만 남김</text>
  <text x="370" y="234" text-anchor="middle" class="tx-m">= 흰 영역이 한 겹 깎인다 → 2개</text>
  <text x="370" y="256" text-anchor="middle" class="tx-b">외톨이 점은 사라진다 (잡음 제거)</text>
  <text x="620" y="24" text-anchor="middle" class="tx-b">팽창 Dilate (3×3 Rect)</text>
  ${grid(545, 36, 7, 22, 'p2', (r, c) => (r >= 1 && r <= 5 && c >= 0 && c <= 5) || (r <= 1 && c >= 5))}
  <text x="620" y="212" text-anchor="middle" class="tx-m">3×3 이 <b>하나라도 겹치면</b> 칠함</text>
  <text x="620" y="234" text-anchor="middle" class="tx-m">= 흰 영역이 한 겹 자란다</text>
  <text x="620" y="256" text-anchor="middle" class="tx-b">구멍 · 끊어진 틈이 메워진다</text>
  <line x1="240" y1="120" x2="288" y2="120" class="ln" stroke-width="2" marker-end="url(#c09a1)"/>
  <line x1="490" y1="120" x2="538" y2="120" class="ln" stroke-width="2" marker-end="url(#c09a1)"/>
  <text x="370" y="300" text-anchor="middle" class="tx-m">주의: OpenCV 의 모폴로지는 <tspan class="tx-b">밝은(흰) 값</tspan> 을 기준으로 동작한다 — 물체가 검으면 결과가 뒤바뀐다</text>
</svg>`;

  // 그림 3: 열기와 닫기
  const FIG_OPENCLOSE = `<svg viewBox="0 0 740 340" role="img" aria-label="열기는 침식 후 팽창으로 작은 점을 지우고 닫기는 팽창 후 침식으로 구멍을 메운다">
  ${ARROW('c09a2')}
  <text x="370" y="22" text-anchor="middle" class="tx-b">열기(Open) = 침식 → 팽창 : 작은 <tspan class="tx-b">흰 점</tspan> 을 지우고 크기는 되돌린다</text>
  ${grid(60, 34, 6, 18, 'p1', (r, c) => (r >= 1 && r <= 4 && c >= 1 && c <= 4) || (r === 0 && c === 0) || (r === 5 && c === 5))}
  <text x="114" y="164" text-anchor="middle" class="tx-m">원본 + 점 2개</text>
  ${grid(290, 34, 6, 18, 'p5', (r, c) => r >= 2 && r <= 3 && c >= 2 && c <= 3)}
  <text x="344" y="164" text-anchor="middle" class="tx-m">① 침식 (점 사라짐)</text>
  ${grid(520, 34, 6, 18, 'p2', (r, c) => r >= 1 && r <= 4 && c >= 1 && c <= 4)}
  <text x="574" y="164" text-anchor="middle" class="tx-b">② 팽창 → 원래 크기</text>
  <line x1="180" y1="88" x2="284" y2="88" class="ln" stroke-width="2" marker-end="url(#c09a2)"/>
  <line x1="410" y1="88" x2="514" y2="88" class="ln" stroke-width="2" marker-end="url(#c09a2)"/>
  <line x1="20" y1="186" x2="720" y2="186" class="ln" stroke-dasharray="5 4"/>
  <text x="370" y="212" text-anchor="middle" class="tx-b">닫기(Close) = 팽창 → 침식 : 작은 <tspan class="tx-b">검은 구멍</tspan> 을 메우고 크기는 되돌린다</text>
  ${grid(60, 224, 6, 18, 'p1', (r, c) => !((r === 2 && c === 2) || (r === 3 && c === 4)))}
  <text x="114" y="354" text-anchor="middle" class="tx-m">원본 + 구멍 2개</text>
  ${grid(290, 224, 6, 18, 'p2', () => true)}
  <text x="344" y="354" text-anchor="middle" class="tx-m">① 팽창 (구멍 메움)</text>
  ${grid(520, 224, 6, 18, 'p4', () => true)}
  <text x="574" y="354" text-anchor="middle" class="tx-b">② 침식 → 원래 크기</text>
  <line x1="180" y1="278" x2="284" y2="278" class="ln" stroke-width="2" marker-end="url(#c09a2)"/>
  <line x1="410" y1="278" x2="514" y2="278" class="ln" stroke-width="2" marker-end="url(#c09a2)"/>
</svg>`;

  // 그림 4: 그래디언트 · 톱햇 · 블랙햇 (1D 프로파일)
  const FIG_HAT = `<svg viewBox="0 0 740 330" role="img" aria-label="한 줄 밝기 프로파일로 본 모폴로지 그래디언트 톱햇 블랙햇">
  <text x="370" y="22" text-anchor="middle" class="tx-b">한 줄의 밝기 프로파일로 보면</text>
  <text x="50" y="52" class="tx">원본</text>
  <path d="M120,96 L200,96 L200,60 L240,60 L240,96 L300,96 L300,110 L330,110 L330,96 L420,96 C440,96 470,58 500,58 C530,58 560,96 580,96 L700,96" class="s1" fill="none" stroke-width="2"/>
  <line x1="120" y1="110" x2="700" y2="110" class="ax"/>
  <text x="220" y="48" text-anchor="middle" class="tx-m">밝은 작은 점</text>
  <text x="315" y="130" text-anchor="middle" class="tx-m">어두운 작은 점</text>
  <text x="500" y="48" text-anchor="middle" class="tx-m">넓은 밝은 덩어리</text>
  <text x="50" y="176" class="tx">열기 Open</text>
  <path d="M120,220 L420,220 C440,220 470,182 500,182 C530,182 560,220 580,220 L700,220" class="s2" fill="none" stroke-width="2"/>
  <line x1="120" y1="234" x2="700" y2="234" class="ax"/>
  <text x="270" y="204" text-anchor="middle" class="tx-m">작은 밝은 점 제거 · 어두운 점 유지</text>
  <text x="50" y="270" class="tx-b">톱햇 TopHat</text>
  <text x="50" y="290" class="tx-m">= 원본 − 열기</text>
  <path d="M120,316 L200,316 L200,280 L240,280 L240,316 L700,316" class="s3" fill="none" stroke-width="2"/>
  <line x1="120" y1="316" x2="700" y2="316" class="ax"/>
  <text x="330" y="306" text-anchor="middle" class="tx-b">밝은 작은 것만 남는다 (배경 · 조명 기울기 제거)</text>
  <text x="560" y="306" text-anchor="middle" class="tx-m">블랙햇 = 닫기 − 원본 → 어두운 작은 것만</text>
</svg>`;

  // 그림 5: 조명 기울기 제거 파이프라인
  const FIG_FLAT = `<svg viewBox="0 0 740 200" role="img" aria-label="큰 커널 닫기로 배경을 추정해 조명 기울기를 제거하는 순서">
  ${ARROW('c09a3')}
  <rect x="15" y="60" width="130" height="64" rx="8" class="p1s"/><text x="80" y="86" text-anchor="middle" class="tx-b">원본</text><text x="80" y="106" text-anchor="middle" class="tx-m">왼쪽 밝고 오른쪽 어둡다</text>
  <rect x="185" y="60" width="150" height="64" rx="8" class="p2s"/><text x="260" y="82" text-anchor="middle" class="tx">Close (큰 커널 51)</text><text x="260" y="102" text-anchor="middle" class="tx-m">글자 · 점이 지워진</text><text x="260" y="118" text-anchor="middle" class="tx-m">배경(조명)만 남는다</text>
  <rect x="375" y="60" width="150" height="64" rx="8" class="p3s"/><text x="450" y="82" text-anchor="middle" class="tx">배경 − 원본</text><text x="450" y="102" text-anchor="middle" class="tx-m">= BlackHat</text><text x="450" y="118" text-anchor="middle" class="tx-m">기울기가 사라진 평평한 영상</text>
  <rect x="565" y="60" width="160" height="64" rx="8" class="p4s"/><text x="645" y="82" text-anchor="middle" class="tx-b">고정 임계값 이진화</text><text x="645" y="102" text-anchor="middle" class="tx-m">전역 Otsu 로는 실패했던</text><text x="645" y="118" text-anchor="middle" class="tx-b">점 32개가 모두 나온다</text>
  <line x1="148" y1="92" x2="181" y2="92" class="ln" stroke-width="2" marker-end="url(#c09a3)"/>
  <line x1="338" y1="92" x2="371" y2="92" class="ln" stroke-width="2" marker-end="url(#c09a3)"/>
  <line x1="528" y1="92" x2="561" y2="92" class="ln" stroke-width="2" marker-end="url(#c09a3)"/>
  <text x="370" y="176" text-anchor="middle" class="tx-m">커널은 “지우고 싶은 것보다 크고, 배경 변화보다 작게” — 점 지름 16 px 이므로 51 이면 충분하다</text>
</svg>`;

  // ------------------------------------------------------------------ 1교시 예제
  const EX_SE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var rect3 = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(3, 3));
        Console.WriteLine("Rect 3x3:");
        Console.WriteLine(rect3.Dump());

        using var cross3 = Cv2.GetStructuringElement(MorphShapes.Cross, new Size(3, 3));
        Console.WriteLine("Cross 3x3:");
        Console.WriteLine(cross3.Dump());

        using var ellipse5 = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
        Console.WriteLine("Ellipse 5x5:");
        Console.WriteLine(ellipse5.Dump());

        using var rect5 = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(5, 5));
        using var cross5 = Cv2.GetStructuringElement(MorphShapes.Cross, new Size(5, 5));
        Console.WriteLine($"Rect 5x5 의 1 개수    = {Cv2.CountNonZero(rect5)} / 25");
        Console.WriteLine($"Cross 5x5 의 1 개수   = {Cv2.CountNonZero(cross5)} / 25");
        Console.WriteLine($"Ellipse 5x5 의 1 개수 = {Cv2.CountNonZero(ellipse5)} / 25");
    }
}`;

  const EX_ED = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 7x7 작은 이진 이미지: 3x4 덩어리 + 외톨이 점 1개 (보기 좋게 값은 1 로)
        using var m = new Mat(7, 7, MatType.CV_8UC1, new Scalar(0));
        Cv2.Rectangle(m, new Rect(1, 2, 4, 3), new Scalar(1), -1);
        m.Set<byte>(0, 6, 1);
        Console.WriteLine($"원본 (흰 픽셀 {Cv2.CountNonZero(m)}개):");
        Console.WriteLine(m.Dump());

        using var k = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(3, 3));

        using var er = new Mat();
        Cv2.Erode(m, er, k);
        Console.WriteLine($"침식 Erode (흰 픽셀 {Cv2.CountNonZero(er)}개):");
        Console.WriteLine(er.Dump());

        using var di = new Mat();
        Cv2.Dilate(m, di, k);
        Console.WriteLine($"팽창 Dilate (흰 픽셀 {Cv2.CountNonZero(di)}개):");
        Console.WriteLine(di.Dump());
    }
}`;

  const EX_AREA = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        // 백라이트 영상이라 부품이 어둡다 → BinaryInv 로 부품을 흰색으로
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        int a0 = Cv2.CountNonZero(bin);
        Console.WriteLine($"이진화 결과 면적 = {a0} px");

        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
        for (int it = 1; it <= 3; it++)
        {
            using var er = new Mat();
            using var di = new Mat();
            Cv2.Erode(bin, er, k, new Point(-1, -1), it);
            Cv2.Dilate(bin, di, k, new Point(-1, -1), it);
            int ae = Cv2.CountNonZero(er);
            int ad = Cv2.CountNonZero(di);
            Console.WriteLine($"iterations {it}: 침식 {ae} ({100.0 * ae / a0:F1}%), 팽창 {ad} ({100.0 * ad / a0:F1}%)");
        }

        using var er3 = new Mat();
        Cv2.Erode(bin, er3, k, new Point(-1, -1), 3);
        Cv2.ImShow("binary", bin);
        Cv2.ImShow("erode x3", er3);
        Cv2.WaitKey(0);
    }
}`;

  const EX_SPECK = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(sp, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        using var labels = new Mat();
        Console.WriteLine($"이진화 직후 덩어리 {Cv2.ConnectedComponents(bin, labels) - 1}개");

        using var k3 = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(3, 3));
        using var e1 = new Mat();
        Cv2.Erode(bin, e1, k3);
        Console.WriteLine($"3x3 침식 1번  덩어리 {Cv2.ConnectedComponents(e1, labels) - 1}개");

        using var e2 = new Mat();
        Cv2.Erode(bin, e2, k3, new Point(-1, -1), 2);
        Console.WriteLine($"3x3 침식 2번  덩어리 {Cv2.ConnectedComponents(e2, labels) - 1}개");
        Console.WriteLine($"플랜지 면적: 원본 {Cv2.CountNonZero(bin)} → 2번 침식 {Cv2.CountNonZero(e2)} px");

        Cv2.ImShow("binary", bin);
        Cv2.ImShow("erode x2", e2);
        Cv2.WaitKey(0);
    }
}`;

  const EX_BRIDGE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 점선처럼 끊어진 선 12조각을 그립니다 (길이 18, 간격 12)
        using var canvas = new Mat(120, 400, MatType.CV_8UC1, new Scalar(0));
        for (int x = 20; x < 380; x += 30)
            Cv2.Line(canvas, new Point(x, 60), new Point(x + 18, 60), new Scalar(255), 3);

        using var labels = new Mat();
        Console.WriteLine($"원본 조각 수 = {Cv2.ConnectedComponents(canvas, labels) - 1}");
        Console.WriteLine($"흰 픽셀 = {Cv2.CountNonZero(canvas)}");

        // 가로로 긴 커널(15x1) 로 팽창하면 좌우로 7 px 씩 자라 12 px 틈이 이어진다
        using var kx = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(15, 1));
        using var joined = new Mat();
        Cv2.Dilate(canvas, joined, kx);
        Console.WriteLine($"15x1 팽창 후 조각 수 = {Cv2.ConnectedComponents(joined, labels) - 1}");
        Console.WriteLine($"흰 픽셀 = {Cv2.CountNonZero(joined)} (굵어진 만큼 늘어난다)");

        // 정사각 커널이면 선이 두꺼워지기까지 한다
        using var k15 = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(15, 15));
        using var fat = new Mat();
        Cv2.Dilate(canvas, fat, k15);
        Console.WriteLine($"15x15 팽창 후 흰 픽셀 = {Cv2.CountNonZero(fat)}");

        Cv2.ImShow("dashed", canvas);
        Cv2.ImShow("dilate 15x1", joined);
        Cv2.ImShow("dilate 15x15", fat);
        Cv2.WaitKey(0);
    }
}`;

  // ------------------------------------------------------------------ 2교시 예제
  const EX_MORPHEX = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(7, 7));
        Console.WriteLine($"원본 이진 영상 면적 = {Cv2.CountNonZero(bin)} px");

        MorphTypes[] ops = new MorphTypes[] {
            MorphTypes.Open, MorphTypes.Close, MorphTypes.Gradient,
            MorphTypes.TopHat, MorphTypes.BlackHat };
        string[] names = new string[] { "Open    ", "Close   ", "Gradient", "TopHat  ", "BlackHat" };

        for (int i = 0; i < ops.Length; i++)
        {
            using var dst = new Mat();
            Cv2.MorphologyEx(bin, dst, ops[i], k);
            Console.WriteLine($"{names[i]} : 흰 픽셀 {Cv2.CountNonZero(dst),6} px");
            Cv2.ImShow(names[i].Trim(), dst);
        }
        Cv2.ImShow("binary", bin);
        Cv2.WaitKey(0);
    }
}`;

  const EX_OPENSP = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(sp, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));

        using var opened = new Mat();
        Cv2.MorphologyEx(bin, opened, MorphTypes.Open, k);      // 흰 점(소금) 제거
        using var clean = new Mat();
        Cv2.MorphologyEx(opened, clean, MorphTypes.Close, k);   // 검은 점(후추) 메우기

        Report("이진화만    ", bin);
        Report("+ Open      ", opened);
        Report("+ Open+Close", clean);

        Cv2.ImShow("binary", bin);
        Cv2.ImShow("open + close", clean);
        Cv2.WaitKey(0);
    }

    static void Report(string name, Mat bin)
    {
        Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        int holes = 0;
        for (int i = 0; i < cs.Length; i++)
            if (hi[i].Parent >= 0 && Cv2.ContourArea(cs[i]) > 50) holes++;
        Console.WriteLine($"{name} : 윤곽선 {cs.Length,5}개, 구멍 {holes}개");
    }
}`;

  const EX_FLAT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);

        // ① 전역 Otsu 로는 실패한다 (오른쪽 아래가 통째로 검게 잡힌다)
        using var otsu = new Mat();
        Cv2.Threshold(img, otsu, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Report("전역 Otsu", otsu);

        // ② 큰 커널 Close 로 배경(조명)만 남긴 뒤 빼면 = BlackHat
        using var kBig = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(51, 51));
        using var bg = new Mat();
        Cv2.MorphologyEx(img, bg, MorphTypes.Close, kBig);
        using var flat = new Mat();
        Cv2.Subtract(bg, img, flat);            // 배경 − 원본 = 어두운 것만 남는다
        Cv2.MinMaxLoc(flat, out double lo, out double hi);
        Console.WriteLine($"보정 영상 밝기 범위 = {lo} ~ {hi}");

        // ③ 평평해졌으니 고정 임계값으로 충분하다
        using var bin = new Mat();
        Cv2.Threshold(flat, bin, 40, 255, ThresholdTypes.Binary);
        Report("보정 후  ", bin);

        Cv2.ImShow("original", img);
        Cv2.ImShow("otsu (fail)", otsu);
        Cv2.ImShow("blackhat", flat);
        Cv2.ImShow("corrected binary", bin);
        Cv2.WaitKey(0);
    }

    // 덩어리 전체 수와, 그중 "점"(면적 150 이상 + 가로 세로 20 px 이하) 개수
    // 반지름 8 원 → bbox 17x17, 면적 약 210 / 글자는 세로가 25~32 px 이라 걸러진다
    static void Report(string name, Mat bin)
    {
        var cc = Cv2.ConnectedComponentsEx(bin);
        int dots = 0;
        foreach (var b in cc.Blobs)
            if (b.Label != 0 && b.Area >= 150 && b.Width <= 20 && b.Height <= 20) dots++;
        Console.WriteLine($"{name} : 흰 픽셀 {Cv2.CountNonZero(bin),6} px, 덩어리 {cc.LabelCount - 1,3}개, 점 {dots}개");
    }
}`;

  const EX_DOTS = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/dot_matrix_date.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        using var labels = new Mat();
        Console.WriteLine($"이진화 직후 덩어리 = {Cv2.ConnectedComponents(bin, labels) - 1}개 (도트 하나하나)");

        int[] sizes = new int[] { 3, 5, 9, 15 };
        foreach (int s in sizes)
        {
            using var k = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(s, s));
            using var closed = new Mat();
            Cv2.MorphologyEx(bin, closed, MorphTypes.Close, k);
            Console.WriteLine($"Close {s,2}x{s,-2} → 덩어리 {Cv2.ConnectedComponents(closed, labels) - 1}개");
        }

        // 글자 단위로 묶으려면 세로로 길고 가로로 짧은 커널이 좋다
        using var kv = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(5, 25));
        using var glyph = new Mat();
        Cv2.MorphologyEx(bin, glyph, MorphTypes.Close, kv);
        Console.WriteLine($"Close 5x25 (세로로 길게) → 덩어리 {Cv2.ConnectedComponents(glyph, labels) - 1}개");

        Cv2.ImShow("binary", bin);
        Cv2.ImShow("close 5x25", glyph);
        Cv2.WaitKey(0);
    }
}`;

  const EX_KSEL = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        using var labels = new Mat();
        Console.WriteLine($"원본 덩어리 {Cv2.ConnectedComponents(bin, labels) - 1}개 (닿은 부품 2쌍 때문에 13 이 아니다)");

        // 커널을 키우면 닿은 부품이 떨어지지만 형상도 망가진다
        int[] sizes = new int[] { 5, 11, 17, 23 };
        foreach (int s in sizes)
        {
            using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(s, s));
            using var er = new Mat();
            Cv2.Erode(bin, er, k);
            int n = Cv2.ConnectedComponents(er, labels) - 1;
            Console.WriteLine($"Ellipse {s,2} 침식 → 덩어리 {n,2}개, 남은 면적 {100.0 * Cv2.CountNonZero(er) / Cv2.CountNonZero(bin):F1}%");
        }
        Console.WriteLine("커널이 커지면 분리는 되지만 면적 · 모양을 잃는다 → 12차시 거리 변환 + watershed 가 정답");
    }
}`;

  const EX_WPF = `// 🪟 WPF: 콤보박스로 모폴로지 연산을, 슬라이더로 커널 크기를 고르는 화면
using System.Windows;
using System.Windows.Controls;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;

namespace MorphologyDemo
{
    public partial class MainWindow : Window
    {
        private Mat bin;   // 이진화해 둔 영상 (한 번만 계산)

        public MainWindow()
        {
            InitializeComponent();
            using var src = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
            bin = new Mat();
            Cv2.Threshold(src, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
            Apply();
        }

        private void Control_Changed(object sender, RoutedEventArgs e) => Apply();

        private void Apply()
        {
            if (bin == null) return;
            int k = (int)KsizeSlider.Value;
            if (k % 2 == 0) k++;                       // 커널은 홀수
            MorphTypes op = (MorphTypes)OpCombo.SelectedIndex;
            using var kernel = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(k, k));
            using var dst = new Mat();
            Cv2.MorphologyEx(bin, dst, op, kernel);
            ResultImage.Source = BitmapSourceConverter.ToBitmapSource(dst);
            StatusText.Text = $"{op} / Ellipse {k}x{k} / 면적 {Cv2.CountNonZero(dst)} px";
        }
    }
}`;

  // ------------------------------------------------------------------ 퀴즈
  const QUIZ1 = [
    { q: 'OpenCV 의 <code>Cv2.Erode</code> 는 무엇을 깎는가?', options: ['어두운(검은) 영역', '밝은(흰) 영역', '이미지 가장자리', '윤곽선만'], answer: 1,
      explain: '모폴로지는 <b>밝은 값</b>을 기준으로 동작합니다. <code>Erode</code> 는 흰 영역을 한 겹 깎고 <code>Dilate</code> 는 흰 영역을 한 겹 넓힙니다. 물체가 검게 나오는 영상이라면 <code>ThresholdTypes.BinaryInv</code> 로 <b>물체를 흰색으로 먼저 바꾸세요</b> — 안 그러면 결과가 반대가 됩니다.' },
    { q: '<code>Cv2.GetStructuringElement(MorphShapes.Cross, new Size(5, 5))</code> 의 1 의 개수는?', options: ['5개', '9개', '21개', '25개'], answer: 1,
      explain: '십자(Cross) 는 가운데 행 5개 + 가운데 열 5개 인데 교차점이 겹치므로 <b>5 + 5 − 1 = 9개</b> 입니다. Rect 5×5 는 25개, Ellipse 5×5 는 <b>17개</b>(가운데 3줄은 꽉 차고 위 · 아래 줄은 가운데 1개씩)입니다 — 예제 1 에서 직접 출력해 확인하세요.' },
    { q: '3×3 Rect 커널로 침식을 <code>iterations: 2</code> 로 하면?', options: ['효과가 없다', '한 번 한 것과 같다', '대략 5×5 커널로 한 번 한 것과 비슷하다', '커널이 자동으로 커진다'], answer: 2,
      explain: '침식을 2번 반복하면 흰 영역이 두 겹 깎여 <b>5×5 커널 한 번</b>과 비슷합니다(정확히 같지는 않습니다 — Rect 커널은 같고 Ellipse 는 모양이 달라집니다). 반복은 큰 커널보다 빠를 때가 있습니다.' },
    { q: '끊어진 인쇄 글자의 <b>가로 방향</b> 틈만 잇고 싶습니다. 알맞은 커널은?', options: ['<code>new Size(15, 15)</code> Rect', '<code>new Size(15, 1)</code> Rect', '<code>new Size(1, 15)</code> Rect', '<code>new Size(3, 3)</code> Ellipse'], answer: 1,
      explain: '커널의 <b>모양이 곧 연산의 방향</b>입니다. <code>new Size(15, 1)</code> 은 가로로만 긴 커널이므로 좌우로만 자라 <b>가로 틈만</b> 이어집니다. 정사각 커널은 글자가 위아래로도 두꺼워져 서로 붙어 버립니다.' },
    { q: '이진 영상에 침식을 하면 <code>Cv2.CountNonZero</code> 값은?', options: ['커진다', '작아진다', '변하지 않는다', '커널 모양에 따라 커지거나 작아진다'], answer: 1,
      explain: '침식은 흰 영역을 깎으므로 흰 픽셀 수(<code>CountNonZero</code>)가 <b>줄어듭니다</b>. 팽창은 늘어납니다. 면적 변화를 세어 보는 것이 모폴로지 결과를 확인하는 가장 쉬운 방법입니다.' }
  ];

  const QUIZ2 = [
    { q: '작은 <b>흰 점(잡음)</b>을 지우면서 물체의 크기는 유지하려면?', options: ['<code>MorphTypes.Open</code>', '<code>MorphTypes.Close</code>', '<code>MorphTypes.Gradient</code>', '<code>MorphTypes.TopHat</code>'], answer: 0,
      explain: '<b>열기(Open) = 침식 → 팽창</b>. 침식으로 작은 점을 없애고 팽창으로 남은 물체를 원래 크기로 되돌립니다. 반대로 <b>닫기(Close) = 팽창 → 침식</b> 은 작은 검은 구멍을 메웁니다.' },
    { q: '<code>MorphTypes.Gradient</code> 의 결과는 무엇인가?', options: ['팽창 − 침식 = 윤곽선(테두리)', '원본 − 열기', '닫기 − 원본', '침식 − 팽창'], answer: 0,
      explain: '모폴로지 그래디언트 = <b>팽창 − 침식</b> 이므로 물체의 경계만 굵은 선으로 남습니다. 커널이 3×3 이면 얇은 테두리, 크면 굵은 테두리가 됩니다. 에지 검출(10차시)의 아주 간단한 대안입니다.' },
    { q: '조명이 왼쪽 위만 밝은 영상에서 작은 검은 점을 찾으려 합니다. 가장 알맞은 것은?', options: ['전역 Otsu 이진화', '큰 커널 <code>BlackHat</code> 후 고정 임계값', '작은 커널 <code>TopHat</code>', '<code>Gradient</code> 후 Otsu'], answer: 1,
      explain: '<b>BlackHat = 닫기 − 원본</b> 은 “배경보다 어두운 작은 것”만 남기므로 넓게 퍼진 조명 기울기가 사라집니다. 커널은 찾으려는 점보다 크게(여기서는 51) 잡습니다. 밝은 작은 것을 찾을 때는 <code>TopHat</code> 입니다.' },
    { q: '도트 프린터로 찍힌 점들을 글자 덩어리로 묶는 데 알맞은 연산은?', options: ['<code>Erode</code>', '<code>Open</code>', '<code>Close</code> 또는 <code>Dilate</code>', '<code>TopHat</code>'], answer: 2,
      explain: '점 사이의 <b>틈을 메워 붙이는</b> 일이므로 <code>Dilate</code> 나 <code>Close</code> 입니다. <code>Close</code> 는 붙인 뒤 크기를 되돌려 주므로 글자가 덜 뚱뚱해집니다. 커널 모양(세로로 길게)으로 “어느 방향으로 붙일지”를 조절합니다.' },
    { q: '모폴로지 커널 크기를 정하는 기준으로 가장 적절한 것은?', options: ['항상 3×3 이 좋다', '이미지 크기의 1/10', '지우거나 이어야 할 <b>대상의 크기</b>를 기준으로', '클수록 좋다'], answer: 2,
      explain: '커널은 “<b>지우고 싶은 것보다 크고, 남기고 싶은 것보다 작게</b>” 정합니다. 지름 16 px 점을 지우려면 21 이상, 12 px 틈을 이으려면 13 이상이 필요합니다. 무턱대고 크게 하면 남겨야 할 형상까지 망가집니다.' }
  ];

  CS_COURSE.addChapter({
    id: 'cs09', no: '09', title: '모폴로지 연산', subtitle: '침식 · 팽창 · 열기 · 닫기 · 그래디언트 · 톱햇 / 블랙햇',
    summary: '모폴로지(Morphology)는 <b>모양(구조 요소)</b>을 이용해 영상을 깎고 넓히는 연산입니다. 이진화 결과에 남은 잡음 점을 지우고, 끊어진 선을 잇고, 구멍을 메우고, 조명 기울기까지 없애는 실전 도구를 <code>Cv2.Erode</code> · <code>Cv2.Dilate</code> · <code>Cv2.MorphologyEx</code> 로 익힙니다.',
    goals: [
      '구조 요소(GetStructuringElement)의 모양 · 크기가 침식 · 팽창 결과를 어떻게 바꾸는지 설명할 수 있다',
      '열기 · 닫기 · 그래디언트 · 톱햇 · 블랙햇의 정의와 쓰임을 구분해 쓸 수 있다',
      '실제 검사 영상에서 잡음 제거 · 도트 연결 · 조명 보정에 모폴로지를 적용해 개수를 정확히 셀 수 있다'
    ],
    wpf: 'Ch16_ImageStudio',
    sections: [
      {
        id: 'cs09-1', title: '침식과 팽창: 구조 요소로 깎고 넓히기', minutes: 50,
        goals: ['구조 요소(Rect · Cross · Ellipse)의 모양을 출력해 확인할 수 있다', '침식 · 팽창이 면적과 덩어리 개수를 어떻게 바꾸는지 숫자로 설명할 수 있다', '침식으로 작은 점을 지우고 팽창으로 끊어진 부분을 이을 수 있다'],
        flow: [['도입: 이진화 뒤에 남는 문제', 6], ['구조 요소와 원리', 14], ['면적 · iterations 실습', 15], ['점 제거 · 틈 잇기', 10], ['정리 · 퀴즈', 5]],
        content: [
          { type: 'h', text: '이진화만으로는 끝나지 않는다' },
          { type: 'p', html: '07차시에서 이진화를, 08차시에서 필터를 배웠습니다. 그래도 실제 검사 영상의 이진화 결과에는 늘 이런 문제가 남습니다.' },
          { type: 'list', items: [
            '배경에 <b>작은 흰 점</b>들이 남았다 (먼지 · 잡음) → 물체로 잘못 세어진다',
            '물체 안에 <b>작은 검은 구멍</b>이 생겼다 (반사 · 표면 무늬) → 면적이 틀린다',
            '인쇄된 글자 · 선이 <b>끊어져</b> 있다 → 하나로 인식되지 않는다',
            '서로 <b>닿아 있는 부품</b>이 하나로 붙어 있다 → 개수가 틀린다 (washers.png 는 13개인데 11개)'
          ] },
          { type: 'p', html: '이 문제들은 “얼마나 밝은가”가 아니라 “<b>얼마나 크고 어떤 모양인가</b>”의 문제입니다. 그래서 밝기가 아니라 <b>모양(구조 요소)</b>으로 처리하는 <b>모폴로지(Morphology, 형태학)</b> 연산이 필요합니다.' },
          { type: 'h', text: '구조 요소(Structuring Element) = 모폴로지의 커널' },
          { type: 'p', html: '모폴로지도 커널을 쓰지만 값이 <b>0 과 1</b> 뿐입니다. 이 커널을 <b>구조 요소</b>라고 부르고, <code>Cv2.GetStructuringElement(모양, 크기)</code> 로 만듭니다.' },
          { type: 'figure', html: FIG_SE, caption: '그림 1. 구조 요소 세 가지. 모양이 결과의 성격을 정한다' },
          { type: 'code', title: '예제 1: 구조 요소를 직접 출력해 보기', code: EX_SE,
            desc: '<code>Dump()</code> 로 0 · 1 배치를 눈으로 확인하세요. <code>Rect</code> 는 전부 1, <code>Cross</code> 는 가운데 행 · 열만 1(3×3 은 5개, 5×5 는 9개), <code>Ellipse</code> 는 모서리를 뺀 원 모양입니다. <b>Erode/Dilate 에 커널을 안 넘기면(<code>null</code>) 3×3 Rect</b> 가 쓰입니다. Ellipse 5×5 는 21개가 아니라 <b>17개</b>라는 점을 눈으로 확인하세요 — 구조 요소의 실제 모양은 반드시 출력해서 확인하는 습관을 들이세요.',
            expect: 'Rect 3x3:\n[1, 1, 1;\n 1, 1, 1;\n 1, 1, 1]\nCross 3x3:\n[0, 1, 0;\n 1, 1, 1;\n 0, 1, 0]\nEllipse 5x5:\n[0, 0, 1, 0, 0;\n 1, 1, 1, 1, 1;\n 1, 1, 1, 1, 1;\n 1, 1, 1, 1, 1;\n 0, 0, 1, 0, 0]\nRect 5x5 의 1 개수    = 25 / 25\nCross 5x5 의 1 개수   = 9 / 25\nEllipse 5x5 의 1 개수 = 17 / 25' },
          { type: 'h', text: '침식(Erode)과 팽창(Dilate)' },
          { type: 'table', head: ['연산', '규칙', '결과', 'Python'], rows: [
            ['<b>침식 Erode</b>', '구조 요소가 <b>완전히 들어가는</b> 중심만 1', '흰 영역이 한 겹 깎인다 · 작은 점 사라짐 · 붙은 것 떨어짐', '<code>cv2.erode</code>'],
            ['<b>팽창 Dilate</b>', '구조 요소가 <b>하나라도 겹치면</b> 1', '흰 영역이 한 겹 자란다 · 구멍 메워짐 · 끊긴 것 이어짐', '<code>cv2.dilate</code>']
          ], caption: '표 1. 침식과 팽창. 둘은 서로 반대(쌍대) 연산이다' },
          { type: 'figure', html: FIG_ED, caption: '그림 2. 7×7 이진 영상에 3×3 Rect 구조 요소를 적용한 결과' },
          { type: 'callout', kind: 'warn', title: '가장 흔한 실수: 밝기 기준', html: 'OpenCV 의 모폴로지는 항상 <b>밝은(흰) 값</b>을 기준으로 동작합니다. <code>washers.png</code> 처럼 백라이트 영상에서는 부품이 <b>어둡게</b> 나오므로, 그대로 <code>Erode</code> 하면 부품이 <b>커집니다</b>(배경이 깎이므로). 반드시 <code>ThresholdTypes.BinaryInv</code> 로 <b>물체를 흰색으로</b> 만든 다음 모폴로지를 적용하세요.' },
          { type: 'code', title: '예제 2: 7×7 이진 영상에서 눈으로 확인', code: EX_ED,
            desc: '값을 255 대신 <b>1</b> 로 칠해서 <code>Dump()</code> 결과를 읽기 쉽게 했습니다(모폴로지는 0 이 아니면 전경으로 봅니다). 침식하면 3×4 덩어리가 1×2 로 줄고 외톨이 점은 <b>완전히 사라집니다</b>. 팽창하면 덩어리가 사방으로 한 겹 자라고 외톨이 점도 3×3 으로 커집니다(13 → 33개). 그림 2 와 값을 하나씩 맞춰 보세요.',
            expect: '원본 (흰 픽셀 13개):\n[0, 0, 0, 0, 0, 0, 1;\n 0, 0, 0, 0, 0, 0, 0;\n 0, 1, 1, 1, 1, 0, 0;\n 0, 1, 1, 1, 1, 0, 0;\n 0, 1, 1, 1, 1, 0, 0;\n 0, 0, 0, 0, 0, 0, 0;\n 0, 0, 0, 0, 0, 0, 0]\n침식 Erode (흰 픽셀 2개):\n[0, 0, 0, 0, 0, 0, 0;\n 0, 0, 0, 0, 0, 0, 0;\n 0, 0, 0, 0, 0, 0, 0;\n 0, 0, 1, 1, 0, 0, 0;\n 0, 0, 0, 0, 0, 0, 0;\n 0, 0, 0, 0, 0, 0, 0;\n 0, 0, 0, 0, 0, 0, 0]\n팽창 Dilate (흰 픽셀 33개):\n[0, 0, 0, 0, 0, 1, 1;\n 1, 1, 1, 1, 1, 1, 1;\n 1, 1, 1, 1, 1, 1, 0;\n 1, 1, 1, 1, 1, 1, 0;\n 1, 1, 1, 1, 1, 1, 0;\n 1, 1, 1, 1, 1, 1, 0;\n 0, 0, 0, 0, 0, 0, 0]' },
          { type: 'h', text: '면적 변화와 iterations' },
          { type: 'p', html: '모폴로지가 잘 되었는지 확인하는 가장 쉬운 방법은 <b>흰 픽셀 수</b>(<code>Cv2.CountNonZero</code>)를 세는 것입니다. 침식은 줄고 팽창은 늘어납니다. 같은 연산을 여러 번 하려면 <code>iterations</code> 인수를 씁니다.' },
          { type: 'code', title: '예제 3: washers 이진 영상의 면적 변화', code: EX_AREA,
            desc: '<code>Cv2.Erode(bin, er, k, new Point(-1, -1), it)</code> — 네 번째 인수는 앵커(<code>(-1,-1)</code> = 가운데), 다섯 번째가 <code>iterations</code> 입니다. 5×5 Ellipse 로 한 번 침식하면 테두리가 약 2 px 깎여 면적이 꽤 줄어듭니다. 반복할수록 침식은 계속 줄고 팽창은 계속 늡니다. 얇은 부분(볼트 몸통 · 와셔 링)은 <b>먼저 끊어지고 사라집니다</b> — 결과 창의 <code>erode x3</code> 를 확인하세요.',
            expect: '이진화 결과 면적 = 46478 px\niterations 1: 침식 37129 (79.9%), 팽창 55827 (120.1%)\niterations 2: 침식 27937 (60.1%), 팽창 65008 (139.9%)\niterations 3: 침식 18853 (40.6%), 팽창 74097 (159.4%)' },
          { type: 'callout', kind: 'tip', title: 'iterations vs 큰 커널', html: '<code>Erode(3×3, iterations: 2)</code> ≈ <code>Erode(5×5, iterations: 1)</code> 입니다. Rect 커널이면 정확히 같고, Ellipse 는 모양이 조금 달라집니다(반복하면 마름모에 가까워짐). 아주 큰 커널(51×51 등)은 한 번에 쓰는 것이 빠르지만, 3×3 을 여러 번 반복하는 것이 더 빠른 경우도 있습니다. 결과가 중요하면 <b>둘 다 해 보고 비교</b>하세요.' },
          { type: 'h', text: '침식으로 점 지우기 · 팽창으로 틈 잇기' },
          { type: 'code', title: '예제 4: 침식으로 소금 잡음 덩어리 지우기', code: EX_SPECK,
            desc: '<code>salt_pepper.png</code> 를 이진화하면 배경에 흰 점(소금)이 남아 덩어리가 <b>7529개</b>나 됩니다. 3×3 침식 <b>한 번</b>으로 1픽셀 점이 모두 사라져 24개로 줄어듭니다. 그런데 <b>두 번 하면 다시 302개로 늘어납니다</b> — 플랜지 안의 검은 점(후추)이 커져서 플랜지가 조각조각 쪼개지기 때문입니다. 면적도 85044 → 26269 px 로 무너집니다. <b>침식만으로는 안 된다</b>는 것이 이 예제의 핵심이고, 해결책이 다음 교시의 <b>열기(Open)</b> 와 <b>닫기(Close)</b> 입니다.',
            expect: '이진화 직후 덩어리 7529개\n3x3 침식 1번  덩어리 24개\n3x3 침식 2번  덩어리 302개\n플랜지 면적: 원본 85044 → 2번 침식 26269 px' },
          { type: 'code', title: '예제 5: 팽창으로 끊어진 선 잇기 (커널 모양이 방향을 정한다)', code: EX_BRIDGE,
            desc: '길이 18, 간격 12 인 점선 12조각을 만들었습니다. <code>new Size(15, 1)</code> 커널은 <b>가로로만</b> 7 px 씩 자라므로 12 px 틈이 이어져 조각이 1개가 됩니다. 반면 <code>new Size(15, 15)</code> 는 위아래로도 자라 선이 아주 두꺼워집니다. <b>커널의 모양이 곧 연산의 방향</b>이라는 것이 모폴로지의 핵심 감각입니다. 흰 픽셀 수도 함께 보세요: 15×1 은 1236 → 1823 으로 조금 늘지만 15×15 는 6961 로 5배 이상 뚱뚱해집니다.',
            expect: '원본 조각 수 = 12\n흰 픽셀 = 1236\n15x1 팽창 후 조각 수 = 1\n흰 픽셀 = 1823 (굵어진 만큼 늘어난다)\n15x15 팽창 후 흰 픽셀 = 6961' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: '모폴로지는 인수(연산 · 모양 · 크기 · 반복)가 많아서 <b>화면에서 바꿔 보며 고르는 것</b>이 가장 빠릅니다. <code>ComboBox</code> 로 <code>MorphTypes</code> · <code>MorphShapes</code> 를, <code>Slider</code> 로 커널 크기를 두고 결과와 <code>CountNonZero</code> 를 상태바에 함께 보여 주면 훌륭한 실험 도구가 됩니다 (16차시 스튜디오에서 만듭니다).' },
          { type: 'code', title: '참고: 모폴로지 실험 화면 (WPF)', code: EX_WPF, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '이진화는 <b>한 번만</b> 해 두고(<code>bin</code> 필드) 모폴로지만 다시 계산하는 구조입니다. <code>(MorphTypes)OpCombo.SelectedIndex</code> 처럼 열거형으로 형 변환하면 콤보박스 순서와 연산이 그대로 대응합니다 (<code>Erode</code> 0, <code>Dilate</code> 1, <code>Open</code> 2, <code>Close</code> 3, <code>Gradient</code> 4, <code>TopHat</code> 5, <code>BlackHat</code> 6).' }
        ],
        practice: [
          {
            title: '구조 요소 모양에 따른 침식 결과 비교', level: 2,
            desc: '<code>images/washers.png</code> 를 이진화(<code>BinaryInv | Otsu</code>)한 뒤 <b>같은 크기(7×7)</b>의 <code>Rect</code> · <code>Cross</code> · <code>Ellipse</code> 구조 요소로 각각 침식하고, 남은 면적(<code>CountNonZero</code>)과 덩어리 개수를 출력하세요. 어느 모양이 가장 많이 깎는지 확인하고 이유를 설명하세요.',
            hint: '<code>MorphShapes[] shapes = new MorphShapes[] { MorphShapes.Rect, MorphShapes.Cross, MorphShapes.Ellipse };</code> 로 배열을 만들고 <code>for</code> 로 돌리세요. 덩어리 수는 <code>Cv2.ConnectedComponents(er, labels) - 1</code>. 구조 요소의 1 개수가 많을수록(Rect) 조건이 까다로워 더 많이 깎입니다.',
            expect: '원본 면적 46478 px\nRect    (1 이 49개): 면적  29503 px (63.5%), 덩어리 11개\nCross   (1 이 13개): 면적  34259 px (73.7%), 덩어리 11개\nEllipse (1 이 33개): 면적  33028 px (71.1%), 덩어리 11개',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        using var labels = new Mat();
        Console.WriteLine($"원본 면적 {Cv2.CountNonZero(bin)} px");

        MorphShapes[] shapes = new MorphShapes[] { MorphShapes.Rect };
        string[] names = new string[] { "Rect" };
        for (int i = 0; i < shapes.Length; i++)
        {
            using var k = Cv2.GetStructuringElement(shapes[i], new Size(7, 7));
            using var er = new Mat();
            Cv2.Erode(bin, er, k);
            // TODO: 구조 요소의 1 개수 · 남은 면적 · 덩어리 개수를 출력하세요
            Console.WriteLine(names[i]);
        }
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
        using var labels = new Mat();
        int a0 = Cv2.CountNonZero(bin);
        Console.WriteLine($"원본 면적 {a0} px");

        MorphShapes[] shapes = new MorphShapes[] {
            MorphShapes.Rect, MorphShapes.Cross, MorphShapes.Ellipse };
        string[] names = new string[] { "Rect   ", "Cross  ", "Ellipse" };
        for (int i = 0; i < shapes.Length; i++)
        {
            using var k = Cv2.GetStructuringElement(shapes[i], new Size(7, 7));
            using var er = new Mat();
            Cv2.Erode(bin, er, k);
            int a = Cv2.CountNonZero(er);
            int n = Cv2.ConnectedComponents(er, labels) - 1;
            Console.WriteLine($"{names[i]} (1 이 {Cv2.CountNonZero(k),2}개): 면적 {a,6} px ({100.0 * a / a0:F1}%), 덩어리 {n}개");
            Cv2.ImShow(names[i].Trim(), er);
        }
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '점선 간격을 바꿔 가며 필요한 커널 폭 찾기', level: 2,
            desc: '예제 5 처럼 점선을 그리되 <b>간격을 8 · 12 · 20 px</b> 로 바꾸고, 각 경우에 <code>new Size(w, 1)</code> 팽창으로 하나가 되는 <b>가장 작은 홀수 w</b> 를 찾아 출력하세요. 간격과 w 사이의 규칙을 마지막 줄에 쓰세요.',
            hint: '선 길이는 18 로 고정하고 <code>step = 18 + gap</code> 으로 그리세요. <code>for (int w = 3; w <= 31; w += 2)</code> 안에서 <code>Cv2.ConnectedComponents(...) - 1 == 1</code> 이 되는 순간 <code>break</code>. 팽창은 좌우로 (w−1)/2 씩 자라므로 대략 <b>w − 1 ≥ 실제 틈</b> 이면 이어집니다. 두께 3 으로 그린 선은 끝이 조금 넓어져 실제 틈이 설정값보다 작다는 점도 관찰해 보세요.',
            expect: '간격  8 px: 조각 14개 → 최소 커널 폭 5\n간격 12 px: 조각 12개 → 최소 커널 폭 9\n간격 20 px: 조각 9개 → 최소 커널 폭 17\n규칙: 팽창은 좌우로 (w-1)/2 씩 자란다 → w 는 대략 실제 틈보다 커야 한다\n(두께 3 으로 그린 선은 끝이 넓어져 실제 틈이 설정값보다 3~4 px 작다)',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        int[] gaps = new int[] { 8, 12, 20 };
        using var labels = new Mat();
        foreach (int gap in gaps)
        {
            using var canvas = new Mat(120, 400, MatType.CV_8UC1, new Scalar(0));
            for (int x = 20; x < 360; x += 18 + gap)
                Cv2.Line(canvas, new Point(x, 60), new Point(x + 18, 60), new Scalar(255), 3);
            int n0 = Cv2.ConnectedComponents(canvas, labels) - 1;
            // TODO: w 를 3 부터 홀수로 키우며 하나로 이어지는 최소 w 를 찾으세요
            Console.WriteLine($"간격 {gap}: 조각 {n0}개");
        }
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        int[] gaps = new int[] { 8, 12, 20 };
        using var labels = new Mat();
        foreach (int gap in gaps)
        {
            using var canvas = new Mat(120, 400, MatType.CV_8UC1, new Scalar(0));
            for (int x = 20; x < 360; x += 18 + gap)
                Cv2.Line(canvas, new Point(x, 60), new Point(x + 18, 60), new Scalar(255), 3);
            int n0 = Cv2.ConnectedComponents(canvas, labels) - 1;

            int found = -1;
            for (int w = 3; w <= 31; w += 2)
            {
                using var k = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(w, 1));
                using var d = new Mat();
                Cv2.Dilate(canvas, d, k);
                if (Cv2.ConnectedComponents(d, labels) - 1 == 1) { found = w; break; }
            }
            Console.WriteLine($"간격 {gap,2} px: 조각 {n0}개 → 최소 커널 폭 {found}");
        }
        Console.WriteLine("규칙: 팽창은 좌우로 (w-1)/2 씩 자란다 → w 는 대략 실제 틈보다 커야 한다");
        Console.WriteLine("(두께 3 으로 그린 선은 끝이 넓어져 실제 틈이 설정값보다 3~4 px 작다)");
    }
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '모폴로지 ① 침식과 팽창', subtitle: '모양(구조 요소)으로 깎고 넓히기', notes: '<p>07 · 08차시 복습으로 시작합니다. 💬 “이진화 결과에 점이 남으면 어떻게 지울까요?” — 블러(08차시)는 밝기를 섞을 뿐 이진 영상에는 잘 안 맞습니다. 오늘은 <b>모양</b>으로 지웁니다. (3분)</p>' },
          { layout: 'bullets', title: '이진화 뒤에 남는 네 가지 문제', lead: '밝기로는 풀 수 없다', bullets: [
            '배경에 <b>작은 흰 점</b> — 물체로 잘못 세어진다',
            '물체 안 <b>작은 검은 구멍</b> — 면적이 틀린다',
            '인쇄 글자 · 선이 <b>끊어짐</b> — 하나로 인식 안 됨',
            '<b>닿은 부품</b>이 하나로 붙음 — washers.png 13개 → 11개',
            '공통점: “얼마나 밝은가”가 아니라 “<b>얼마나 크고 어떤 모양인가</b>”'
          ], notes: '<p>네 문제를 하나씩 읽으며 학생들에게 이전 차시 결과(11개 문제)를 떠올리게 합니다. 오늘은 앞의 세 가지를 해결하고, 네 번째(닿은 부품)는 12차시 watershed 로 넘긴다고 미리 말해 둡니다. (4분)</p>' },
          { layout: 'diagram', title: '구조 요소 = 모폴로지의 커널', html: FIG_SE, caption: 'Rect(전부 1) · Cross(십자) · Ellipse(원) — 값은 0 과 1 뿐', notes: '<p>💬 “Cross 5×5 에서 1 은 몇 개일까요?” — 9개(5+5−1). 각 모양이 어울리는 대상(Rect = 네모난 부품 · 글자, Ellipse = 둥근 부품, Cross = 가는 선 보존)을 짚어 줍니다. (5분)</p>' },
          { layout: 'code', title: '구조 요소를 출력해 보기', code: `using var rect3 = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(3, 3));
Console.WriteLine("Rect 3x3:");
Console.WriteLine(rect3.Dump());

using var cross3 = Cv2.GetStructuringElement(MorphShapes.Cross, new Size(3, 3));
Console.WriteLine("Cross 3x3:");
Console.WriteLine(cross3.Dump());

using var ellipse5 = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
Console.WriteLine("Ellipse 5x5:");
Console.WriteLine(ellipse5.Dump());
Console.WriteLine($"Ellipse 5x5 의 1 = {Cv2.CountNonZero(ellipse5)} / 25");`, points: ['<code>Dump()</code> 로 0 · 1 배치 확인', '커널을 <code>null</code> 로 두면 기본값 = 3×3 Rect', 'Ellipse 5×5 는 21개, Cross 5×5 는 9개'], notes: '<p>학생에게 <code>new Size(7, 7)</code> 로 바꿔 Ellipse 모양을 보게 합니다. 크기가 커질수록 원에 가까워지는 것을 확인. (5분)</p>' },
          { layout: 'diagram', title: '침식과 팽창의 규칙', html: FIG_ED, caption: '침식 = 완전히 들어가는 곳만 / 팽창 = 하나라도 겹치면', notes: '<p>칠판에서 3×3 창을 손으로 옮기며 몇 칸이 남는지 세어 봅니다. 💬 “외톨이 점은 왜 사라질까요?” — 3×3 이 완전히 들어갈 수 없다. ⚠ <b>흰색 기준</b>이라는 점을 여기서 강하게 강조합니다(BinaryInv). (8분)</p>' },
          { layout: 'code', title: '7×7 로 눈으로 확인', code: `using var m = new Mat(7, 7, MatType.CV_8UC1, new Scalar(0));
Cv2.Rectangle(m, new Rect(1, 2, 4, 3), new Scalar(1), -1);
m.Set<byte>(0, 6, 1);                      // 외톨이 점
Console.WriteLine($"원본 흰 픽셀 {Cv2.CountNonZero(m)}개");
Console.WriteLine(m.Dump());

using var k = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(3, 3));
using var er = new Mat();
Cv2.Erode(m, er, k);
Console.WriteLine($"침식 후 {Cv2.CountNonZero(er)}개");
Console.WriteLine(er.Dump());

using var di = new Mat();
Cv2.Dilate(m, di, k);
Console.WriteLine($"팽창 후 {Cv2.CountNonZero(di)}개");
Console.WriteLine(di.Dump());`, points: ['값을 1 로 칠하면 <code>Dump()</code> 가 읽기 쉽다', '침식 13 → 2개 (외톨이 점 소멸)', '팽창 13 → 크게 늘어난다'], notes: '<p>출력된 0/1 격자를 그림 2 와 한 칸씩 맞춰 보게 합니다. 여기서 이해가 되면 나머지는 응용일 뿐입니다. 시간이 남으면 커널을 Cross 로 바꿔 결과가 달라지는 것을 보여 줍니다. (7분)</p>' },
          { layout: 'code', title: '면적 변화와 iterations', code: `using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
using var bin = new Mat();
Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
int a0 = Cv2.CountNonZero(bin);
Console.WriteLine($"이진화 면적 = {a0} px");

using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
for (int it = 1; it <= 3; it++)
{
    using var er = new Mat();
    using var di = new Mat();
    Cv2.Erode(bin, er, k, new Point(-1, -1), it);
    Cv2.Dilate(bin, di, k, new Point(-1, -1), it);
    Console.WriteLine($"it {it}: 침식 {Cv2.CountNonZero(er)}, 팽창 {Cv2.CountNonZero(di)}");
}
Cv2.ImShow("binary", bin);
Cv2.WaitKey(0);`, points: ['<code>BinaryInv</code> 로 부품을 <b>흰색</b>으로 먼저!', '4번째 인수 = 앵커 <code>(-1,-1)</code>, 5번째 = iterations', '침식 ↓ 팽창 ↑ — 면적으로 확인하는 습관'], notes: '<p>💬 “침식을 3번 하면 볼트의 얇은 몸통은 어떻게 될까요?” — 끊어지고 사라진다. 결과 창에서 직접 확인시킵니다. <code>iterations 2</code> ≈ 큰 커널 1번이라는 관계도 함께 짚습니다. (7분)</p>' },
          { layout: 'code', title: '침식으로 소금 잡음 지우기', code: `using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
using var bin = new Mat();
Cv2.Threshold(sp, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
using var labels = new Mat();
Console.WriteLine($"이진화 직후 덩어리 {Cv2.ConnectedComponents(bin, labels) - 1}개");

using var k3 = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(3, 3));
using var e1 = new Mat();
Cv2.Erode(bin, e1, k3);
Console.WriteLine($"침식 1번 덩어리 {Cv2.ConnectedComponents(e1, labels) - 1}개");

using var e2 = new Mat();
Cv2.Erode(bin, e2, k3, new Point(-1, -1), 2);
Console.WriteLine($"침식 2번 덩어리 {Cv2.ConnectedComponents(e2, labels) - 1}개");
Console.WriteLine($"면적 {Cv2.CountNonZero(bin)} → {Cv2.CountNonZero(e2)}");
Cv2.ImShow("erode x2", e2);
Cv2.WaitKey(0);`, points: ['7529개 → 침식 1번에 <b>24개</b>로 정리', '하지만 2번 하면 <b>302개로 되돌아간다</b> (플랜지가 쪼개짐)', '면적도 85044 → 26269 px — 침식만으로는 안 된다'], notes: '<p>“문제 제기 → 다음 교시 해결”의 고리를 만듭니다. 💬 “왜 두 번 하면 오히려 늘어날까요?” — 플랜지 안의 후추 구멍이 커져 플랜지가 조각난다. 💬 “면적을 재야 하는 검사라면 괜찮을까?” — 안 된다 → Open · Close 가 필요하다. (6분)</p>' },
          { layout: 'code', title: '팽창으로 끊어진 선 잇기', code: `using var canvas = new Mat(120, 400, MatType.CV_8UC1, new Scalar(0));
for (int x = 20; x < 380; x += 30)
    Cv2.Line(canvas, new Point(x, 60), new Point(x + 18, 60), new Scalar(255), 3);

using var labels = new Mat();
Console.WriteLine($"조각 {Cv2.ConnectedComponents(canvas, labels) - 1}개");

using var kx = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(15, 1));
using var joined = new Mat();
Cv2.Dilate(canvas, joined, kx);
Console.WriteLine($"15x1 팽창 후 {Cv2.ConnectedComponents(joined, labels) - 1}개");

using var k15 = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(15, 15));
using var fat = new Mat();
Cv2.Dilate(canvas, fat, k15);
Console.WriteLine($"15x15 팽창 후 흰 픽셀 {Cv2.CountNonZero(fat)}");
Cv2.ImShow("dilate 15x1", joined);
Cv2.WaitKey(0);`, points: ['<code>Size(15, 1)</code> = 가로로만 자란다 → 가로 틈만 잇는다', '간격 12 px → 커널 폭 13 이상 필요 ((w−1) ≥ 간격)', '<b>커널 모양이 곧 연산의 방향</b>'], notes: '<p>💬 “세로로 끊어진 것을 이으려면?” — <code>Size(1, 15)</code>. 실제 현장 예(레이저 마킹 문자 · 도트 인쇄)를 들어 줍니다. 다음 교시 dot_matrix_date 예고. (6분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '이진 영상에 <b>침식</b>을 하면 <code>Cv2.CountNonZero</code> 값은?', options: ['커진다', '작아진다', '변하지 않는다', '커널 모양에 따라 다르다'], answer: 1, explain: '침식은 흰 영역을 깎으므로 흰 픽셀 수가 줄어듭니다. 팽창은 늘어납니다.', notes: '<p>정답 2번. 이어서 💬 “물체가 검게 나오는 영상에 그대로 침식하면?” — 물체가 오히려 커진다(가장 흔한 실수). (3분)</p>' },
          { layout: 'practice', title: '실습: 구조 요소 모양 비교', desc: '<p>washers 이진 영상을 7×7 <code>Rect</code> · <code>Cross</code> · <code>Ellipse</code> 로 각각 침식하고 면적 · 덩어리 수를 출력하세요.</p><ul><li>구조 요소의 1 개수(<code>CountNonZero(k)</code>)도 함께 출력</li><li>어느 모양이 가장 많이 깎는지, 왜?</li></ul>', starter: `using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
using var bin = new Mat();
Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
using var labels = new Mat();
Console.WriteLine($"원본 면적 {Cv2.CountNonZero(bin)} px");

MorphShapes[] shapes = new MorphShapes[] { MorphShapes.Rect };
for (int i = 0; i < shapes.Length; i++)
{
    using var k = Cv2.GetStructuringElement(shapes[i], new Size(7, 7));
    using var er = new Mat();
    Cv2.Erode(bin, er, k);
    // TODO: 1 개수 · 면적 · 덩어리 수 출력
}`, solution: `using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
using var bin = new Mat();
Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
using var labels = new Mat();
int a0 = Cv2.CountNonZero(bin);

MorphShapes[] shapes = new MorphShapes[] {
    MorphShapes.Rect, MorphShapes.Cross, MorphShapes.Ellipse };
string[] names = new string[] { "Rect   ", "Cross  ", "Ellipse" };
for (int i = 0; i < shapes.Length; i++)
{
    using var k = Cv2.GetStructuringElement(shapes[i], new Size(7, 7));
    using var er = new Mat();
    Cv2.Erode(bin, er, k);
    int a = Cv2.CountNonZero(er);
    Console.WriteLine($"{names[i]} (1 {Cv2.CountNonZero(k),2}개): {a,6} px ({100.0 * a / a0:F1}%), 덩어리 {Cv2.ConnectedComponents(er, labels) - 1}개");
}`, notes: '<p>정답의 방향: Rect(49개) 가 가장 많이 깎고 Cross(13개) 가 가장 적게 깎습니다. “1 이 많을수록 조건이 까다로워 살아남기 어렵다”로 정리합니다. Cross 는 가는 선을 잘 보존해 인쇄 · 배선 검사에 씁니다. 세 경우 모두 덩어리는 11개로 같다는 점(= 침식으로 접촉이 떨어지지 않는다)도 함께 짚어 주세요. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['모폴로지 = <b>모양(구조 요소)</b> 으로 깎고 넓히는 연산. 항상 <b>흰색 기준</b>', '<code>Cv2.GetStructuringElement(Rect / Cross / Ellipse, new Size(w, h))</code>', '<b>침식</b> = 완전히 들어가는 곳만 → 작은 점 제거 · 면적 감소', '<b>팽창</b> = 하나라도 겹치면 → 구멍 · 틈 메움 · 면적 증가', '커널의 <b>모양이 방향</b>을 정한다 (<code>Size(15,1)</code> = 가로만)', '다음 교시: 침식+팽창을 짝지은 <b>열기 · 닫기</b> 와 톱햇 · 블랙햇으로 조명까지 보정'], notes: '<p>세 가지를 강조: 흰색 기준 · 면적 변화 · 커널 모양. 다음 교시 예고: “면적을 잃지 않고 점만 지우는 방법” 과 “조명 기울기를 모폴로지로 없애는 방법”. (2분)</p>' }
        ]
      },
      {
        id: 'cs09-2', title: 'MorphologyEx: 열기 · 닫기 · 그래디언트 · 톱햇 / 블랙햇', minutes: 50,
        goals: ['열기 · 닫기 · 그래디언트 · 톱햇 · 블랙햇의 정의와 결과를 구분할 수 있다', '큰 커널 모폴로지로 조명 기울기를 제거해 고정 임계값으로 이진화할 수 있다', '도트 인쇄를 Close 로 이어 글자 덩어리를 만들고 커널 크기를 근거 있게 고를 수 있다'],
        flow: [['도입: 5가지 연산', 8], ['열기 · 닫기 실습', 13], ['조명 보정(BlackHat)', 14], ['도트 연결 · 커널 선택', 10], ['정리 · 퀴즈', 5]],
        content: [
          { type: 'h', text: '침식과 팽창을 짝지으면' },
          { type: 'p', html: '1교시의 문제는 “점은 지워지는데 물체도 같이 작아진다”였습니다. 해결은 간단합니다 — <b>깎은 뒤 다시 넓히면</b> 됩니다. 순서를 바꾸면 반대 효과가 나옵니다. 이 조합들을 <code>Cv2.MorphologyEx(src, dst, MorphTypes.___, kernel)</code> 한 줄로 씁니다.' },
          { type: 'table', head: ['MorphTypes', '정의', '효과', '언제'], rows: [
            ['<b>Open</b> (열기)', '침식 → 팽창', '작은 <b>흰 점</b> 제거, 물체 크기 유지, 얇은 연결 끊기', '배경 잡음 제거, 붙은 물체 분리'],
            ['<b>Close</b> (닫기)', '팽창 → 침식', '작은 <b>검은 구멍</b> 메움, 끊긴 것 잇기, 크기 유지', '표면 반사 구멍, 도트 인쇄 연결'],
            ['<b>Gradient</b>', '팽창 − 침식', '물체의 <b>테두리</b>만 남는다', '간단한 윤곽 추출, 굵기 확인'],
            ['<b>TopHat</b> (톱햇)', '원본 − 열기', '배경보다 <b>밝은 작은 것</b>만 남는다', '어두운 배경의 흰 결함 · 글자'],
            ['<b>BlackHat</b> (블랙햇)', '닫기 − 원본', '배경보다 <b>어두운 작은 것</b>만 남는다', '밝은 배경의 검은 점 · 기공 · 문자']
          ], caption: '표 2. MorphologyEx 의 다섯 가지 연산. 모두 침식 · 팽창의 조합이다' },
          { type: 'figure', html: FIG_OPENCLOSE, caption: '그림 3. 열기는 흰 점을 지우고, 닫기는 검은 구멍을 메운다 — 둘 다 물체 크기는 그대로' },
          { type: 'code', title: '예제 1: 다섯 연산을 한 번에 비교', code: EX_MORPHEX,
            desc: '<code>washers.png</code> 이진 영상에 7×7 Ellipse 로 다섯 연산을 적용합니다. 흰 픽셀 수를 보면 성격이 보입니다: <b>Open</b> 은 원본보다 조금 줄고, <b>Close</b> 는 조금 늘고, <b>Gradient</b> 는 테두리만이라 훨씬 적고, <b>TopHat · BlackHat</b> 은 “원본에서 빠진 부분”이라 아주 작습니다. 결과 창의 <code>Gradient</code> 이미지가 윤곽선처럼 보이는 것을 꼭 확인하세요.',
            expect: '원본 이진 영상 면적 = 46478 px\nOpen     : 흰 픽셀  46301 px\nClose    : 흰 픽셀  46716 px\nGradient : 흰 픽셀  26902 px\nTopHat   : 흰 픽셀    177 px\nBlackHat : 흰 픽셀    238 px' },
          { type: 'code', title: '예제 2: 소금-후추 이진 영상을 Open + Close 로 정리', code: EX_OPENSP,
            desc: '08차시에서 <code>MedianBlur</code> 로 풀었던 문제를 <b>이진화 뒤 모폴로지로</b> 풀어 봅니다. <code>Open</code> 은 배경의 흰 점(소금)을, <code>Close</code> 는 플랜지 안의 검은 점(후추)을 없앱니다. 두 연산을 차례로 적용하면 윤곽선이 <b>10399개 → 11개</b>로 줄고 <b>큰 구멍은 정확히 7개</b>가 됩니다(<code>flange.png</code> 원본과 같은 값). Open 만 하면 구멍이 10개로 잘못 나오는 것도 확인하세요 — 후추 점이 아직 남아 큰 구멍처럼 보이기 때문입니다. <b>순서가 중요합니다</b>: Close 를 먼저 하면 배경의 흰 점들이 서로 붙어 지울 수 없는 덩어리가 됩니다 (실습 1).',
            expect: '이진화만     : 윤곽선 10399개, 구멍 7개\n+ Open       : 윤곽선  2114개, 구멍 10개\n+ Open+Close : 윤곽선    11개, 구멍 7개' },
          { type: 'callout', kind: 'tip', title: '순서를 정하는 요령', html: '<b>지우고 싶은 것이 흰 점이면 Open 부터, 검은 구멍이면 Close 부터</b> 입니다. 둘 다 있으면 보통 <b>Open → Close</b> 가 안전합니다(작은 흰 점을 먼저 없애야 Close 가 그것을 키우지 않습니다). 커널은 “잡음보다 크고 물체보다 작게”: 1~3 px 점에는 3×3 ~ 5×5 면 충분합니다.' },
          { type: 'h', text: '톱햇 · 블랙햇으로 조명 기울기 없애기' },
          { type: 'p', html: '큰 커널로 <code>Close</code> 를 하면 작은 글자 · 점은 모두 메워지고 <b>넓게 퍼진 배경(조명)만</b> 남습니다. 이 배경에서 원본을 빼면 조명 기울기가 사라진 평평한 영상이 됩니다 — 이것이 바로 <b>BlackHat</b> 입니다. 그러면 <b>고정 임계값 하나로</b> 전체를 이진화할 수 있습니다.' },
          { type: 'figure', html: FIG_HAT, caption: '그림 4. 한 줄 프로파일로 본 Open · TopHat. 톱햇은 밝은 작은 것만, 블랙햇은 어두운 작은 것만 남긴다' },
          { type: 'figure', html: FIG_FLAT, caption: '그림 5. 큰 커널 Close → 배경 − 원본(BlackHat) → 고정 임계값 = 조명 보정 파이프라인' },
          { type: 'image', src: 'images/uneven_light.png', caption: 'uneven_light.png — 왼쪽 위가 밝고 오른쪽 아래가 어둡다. 글자 3줄 + 검은 점 32개(4행×8열, 반지름 8)', width: 420 },
          { type: 'code', title: '예제 3: 조명 기울기 제거 후 점 32개 세기', code: EX_FLAT,
            desc: '<b>전역 Otsu</b> 는 오른쪽 아래 어두운 영역을 통째로 물체로 잡아 실패합니다. 반면 51×51 Ellipse 로 <code>Close</code> 해서 만든 배경에서 원본을 빼면(= BlackHat) 밝기 범위가 0 근처로 모여 <b>고정 임계값 40</b> 하나로 깔끔하게 이진화됩니다. 글자까지 함께 나오지만(덩어리 85개), 점은 <b>bbox 17×17 · 면적 약 210</b> 이고 글자는 세로가 25~32 px 이므로 “면적 150 이상 + 가로 세로 20 px 이하”로 걸러 <b>점 32개</b>가 정확히 나옵니다. 전역 Otsu 결과에서는 같은 기준으로 12개밖에 나오지 않습니다 — 어두운 쪽 점들이 배경에 묻혔기 때문입니다. <code>Cv2.ConnectedComponentsEx</code> 는 각 덩어리의 <code>Area</code> · <code>Width</code> · <code>Height</code> · <code>Rect</code> · <code>Centroid</code> 를 한 번에 돌려줍니다 (12차시에서 자세히).',
            expect: '전역 Otsu : 흰 픽셀 147364 px, 덩어리 156개, 점 12개\n보정 영상 밝기 범위 = 0 ~ 199\n보정 후   : 흰 픽셀  23444 px, 덩어리  85개, 점 32개' },
          { type: 'callout', kind: 'warn', title: 'Subtract 의 순서와 포화', html: '<code>Cv2.Subtract(bg, img, flat)</code> 는 <b>bg − img</b> 입니다. 8비트 영상의 뺄셈은 <b>0 에서 잘립니다</b>(포화) — 음수가 되지 않으므로 순서를 바꾸면 결과가 거의 0 이 됩니다. “어두운 것을 찾을 때는 밝은 배경에서 빼기”라고 기억하세요. 같은 계산을 <code>Cv2.MorphologyEx(img, dst, MorphTypes.BlackHat, kBig)</code> 한 줄로도 할 수 있습니다.' },
          { type: 'h', text: '도트 인쇄를 글자 덩어리로 묶기' },
          { type: 'code', title: '예제 4: dot_matrix_date 의 점을 Close 로 잇기', code: EX_DOTS,
            desc: '<code>dot_matrix_date.png</code> 는 잉크젯 도트(반지름 약 2.2 px, 피치 6 px)로 찍은 2줄 인쇄 “EXP 2027.09.30” · “LOT A2309-117” 입니다. 이진화 직후에는 덩어리가 <b>186개</b>(점들이 부분적으로만 붙어 있음)여서 글자를 읽을 수 없습니다. 커널을 키우며 <code>Close</code> 하면 92 → 88 → 45 → 12개로 줄어드는데, <b>15×15 에서는 12개</b> — 글자를 지나 단어 · 숫자 그룹까지 붙어 버렸습니다. 글자 피치가 36 px 이므로 정사각 커널을 너무 키우면 안 됩니다. <code>new Size(5, 25)</code> 처럼 <b>세로로 긴</b> 커널을 쓰면 세로로만 잘 붙어 <b>28개</b>, 즉 실제 글자 수 25개에 가까워집니다.',
            expect: '이진화 직후 덩어리 = 186개 (도트 하나하나)\nClose  3x3  → 덩어리 92개\nClose  5x5  → 덩어리 88개\nClose  9x9  → 덩어리 45개\nClose 15x15 → 덩어리 12개\nClose 5x25 (세로로 길게) → 덩어리 28개' },
          { type: 'code', title: '예제 5: 커널 크기를 키우면 무엇을 잃는가', code: EX_KSEL,
            desc: '<code>washers.png</code> 의 닿아 있는 부품 2쌍을 침식으로 떼어 낼 수 있을까요? 결과를 보면 <b>끝까지 13개가 되지 않습니다</b>: 11 → 12(k=11) → <b>55</b>(k=17, 얇은 부분이 쪼개져 조각이 폭발) → 6(k=23, 작은 부품이 아예 사라짐). 면적은 79.9% → 4.2% 로 무너집니다. 모폴로지로 접촉 분리를 억지로 하면 안 되고, <b>거리 변환 + watershed</b>(12차시)를 써야 하는 이유입니다. 커널 크기는 항상 “무엇을 잃는가”를 같이 봐야 합니다.',
            expect: '원본 덩어리 11개 (닿은 부품 2쌍 때문에 13 이 아니다)\nEllipse  5 침식 → 덩어리 11개, 남은 면적 79.9%\nEllipse 11 침식 → 덩어리 12개, 남은 면적 50.7%\nEllipse 17 침식 → 덩어리 55개, 남은 면적 23.0%\nEllipse 23 침식 → 덩어리  6개, 남은 면적 4.2%\n커널이 커지면 분리는 되지만 면적 · 모양을 잃는다 → 12차시 거리 변환 + watershed 가 정답' },
          { type: 'table', head: ['목적', '연산 · 커널', '크기 기준'], rows: [
            ['배경의 잡음 점 제거', '<code>Open</code>, Ellipse', '점 지름보다 크게 (1~3 px 점 → 3~5)'],
            ['물체 안 구멍 메우기', '<code>Close</code>, Ellipse', '구멍 지름보다 크게'],
            ['끊어진 선 · 도트 잇기', '<code>Close</code> / <code>Dilate</code>, 방향에 맞는 직사각', '틈보다 크게 (틈 + 1 이상)'],
            ['테두리만 보기', '<code>Gradient</code>, Rect 3×3', '작게 (굵기 = 커널 크기)'],
            ['밝은 작은 결함 찾기', '<code>TopHat</code>, Ellipse', '결함보다 크고 배경 변화보다 작게'],
            ['어두운 작은 결함 · 조명 보정', '<code>BlackHat</code>, Ellipse', '대상보다 훨씬 크게 (31 ~ 71)'],
            ['접촉 부품 분리', '<b>모폴로지로 하지 말 것</b>', '거리 변환 + watershed (12차시)']
          ], caption: '표 3. 목적별 연산과 커널 크기. 크기는 항상 “대상의 크기”에서 출발한다' },
          { type: 'callout', kind: 'info', title: '📘 회색 영상에도 쓸 수 있다', html: '모폴로지는 이진 영상 전용이 아닙니다. 회색 영상에서 <b>침식 = 이웃 중 최소값</b>, <b>팽창 = 이웃 중 최대값</b> 이 됩니다(min/max 필터). 그래서 <code>TopHat</code> · <code>BlackHat</code> 이 이진화 전의 <b>조명 보정</b>에 쓰일 수 있는 것입니다. 예제 3 은 이진화 전 회색 영상에 모폴로지를 적용한 예입니다.' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: '현장 검사 프로그램은 보통 <b>레시피(recipe)</b> 로 “연산 · 커널 모양 · 크기 · 반복”을 저장해 둡니다. <code>MorphTypes</code> · <code>MorphShapes</code> 는 열거형이라 <code>(int)</code> 로 바꿔 JSON 에 저장하고 다시 캐스팅하면 됩니다. 17차시 검사 프로젝트에서 이 구조를 만듭니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도 · 평가', html: '<ul><li><b>준비</b>: 예제 3 은 결과 창에 이미지가 4개 나옵니다 — <code>otsu (fail)</code> 와 <code>corrected binary</code> 를 나란히 비교하는 것이 이 교시의 하이라이트입니다. 미리 한 번 실행해 두세요.</li><li><b>오개념 1</b>: “Open 은 구멍을 메운다” → 반대입니다. <b>Open = 흰 점 제거</b>, <b>Close = 검은 구멍 메움</b>. 그림 3 으로 반복 확인.</li><li><b>오개념 2</b>: “커널이 크면 좋다” → 예제 5 로 “면적 · 형상을 잃는다”를 숫자로 보여 주세요.</li><li><b>오개념 3</b>: “모폴로지는 이진 영상만” → 회색 영상의 min/max 필터임을 예제 3 으로 설명.</li><li><b>오개념 4</b>: 물체가 검은 영상에 그대로 Open 을 적용 → 결과가 반대. 1교시의 <code>BinaryInv</code> 규칙을 다시 강조.</li><li><b>평가 루브릭</b>: ① 다섯 연산의 정의와 효과를 구분한다(30%) ② 목적에 맞는 연산 · 커널을 근거와 함께 고른다(40%) ③ 결과를 개수 · 면적으로 검증한다(30%).</li><li>💬 마무리 발문: “모폴로지로도 안 되는 것은?” — 서로 닿은 물체 분리, 물체와 같은 크기의 잡음. 12차시(윤곽선 · watershed)로 이어 줍니다.</li></ul>' }
        ],
        practice: [
          {
            title: 'Open 과 Close 의 순서를 바꿔 보기', level: 2,
            desc: '<code>images/salt_pepper.png</code> 를 이진화한 뒤 ① <code>Open</code> → <code>Close</code> ② <code>Close</code> → <code>Open</code> 두 순서로 5×5 Ellipse 모폴로지를 적용하고, 각각의 <b>윤곽선 개수</b>와 <b>흰 픽셀 수</b>를 출력해 비교하세요. 왜 순서가 중요한지 설명하세요.',
            hint: '<code>Cv2.MorphologyEx(bin, a, MorphTypes.Open, k)</code> → <code>Cv2.MorphologyEx(a, b, MorphTypes.Close, k)</code> 순으로 이어 붙입니다. 윤곽선 개수는 <code>Cv2.FindContoursAsArray(b, RetrievalModes.CComp, ContourApproximationModes.ApproxSimple).Length</code> 로 간단히 얻을 수 있습니다.',
            expect: 'Open -> Close : 윤곽선    11개, 흰 픽셀 78003 px\nClose -> Open : 윤곽선    32개, 흰 픽셀 80982 px',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(sp, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));

        // TODO: Open → Close 순서로 적용해 윤곽선 개수와 흰 픽셀 수를 출력하세요
        using var a1 = new Mat();

        // TODO: Close → Open 순서로도 해 보고 비교하세요
        using var b1 = new Mat();

        Cv2.ImShow("binary", bin);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(sp, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));

        using var a1 = new Mat();
        using var a2 = new Mat();
        Cv2.MorphologyEx(bin, a1, MorphTypes.Open, k);
        Cv2.MorphologyEx(a1, a2, MorphTypes.Close, k);
        Show("Open -> Close", a2);

        using var b1 = new Mat();
        using var b2 = new Mat();
        Cv2.MorphologyEx(bin, b1, MorphTypes.Close, k);
        Cv2.MorphologyEx(b1, b2, MorphTypes.Open, k);
        Show("Close -> Open", b2);

        // Close 를 먼저 하면 배경의 흰 점들이 서로 이어져 큰 덩어리가 되고,
        // 뒤따르는 Open 으로도 지워지지 않는다. 그래서 Open 을 먼저 한다.
        Cv2.ImShow("Open then Close", a2);
        Cv2.ImShow("Close then Open", b2);
        Cv2.WaitKey(0);
    }

    static void Show(string name, Mat bin)
    {
        var cs = Cv2.FindContoursAsArray(bin, RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        Console.WriteLine($"{name} : 윤곽선 {cs.Length,5}개, 흰 픽셀 {Cv2.CountNonZero(bin)} px");
    }
}`
          },
          {
            title: '조명 보정 커널 크기의 영향', level: 3,
            desc: '예제 3 의 파이프라인에서 <code>Close</code> 커널 크기를 <b>11 · 21 · 51 · 81</b> 로 바꿔 가며 보정 → 고정 임계값 40 이진화 → 면적 120~400 성분 개수를 출력하세요. 점 32개가 정확히 나오는 커널 범위를 찾고, 커널이 너무 작으면 왜 실패하는지 설명하세요.',
            hint: '점의 지름이 17 px 이므로 커널이 그보다 작으면 <code>Close</code> 가 점을 지우지 못해 배경에 점이 남고, 빼면 점이 사라집니다(커널 11 에서는 0개가 나옵니다). <code>Cv2.ConnectedComponentsEx(bin).Blobs</code> 를 돌면서 <code>b.Label != 0 &amp;&amp; b.Area >= 150 &amp;&amp; b.Width <= 20 &amp;&amp; b.Height <= 20</code> 을 세세요.',
            expect: '커널 11: 흰 픽셀  16256 px, 둥근 점 0개\n커널 21: 흰 픽셀  23297 px, 둥근 점 32개\n커널 51: 흰 픽셀  23444 px, 둥근 점 32개\n점 지름이 17 px 이므로 커널이 그보다 충분히 커야 Close 가 점을 지우고 배경만 남는다',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);
        int[] sizes = new int[] { 11, 21, 51 };
        foreach (int s in sizes)
        {
            using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(s, s));
            using var bg = new Mat();
            Cv2.MorphologyEx(img, bg, MorphTypes.Close, k);
            // TODO: bg - img 로 보정하고, 임계값 40 으로 이진화한 뒤
            //       면적 150 이상 · 가로 세로 20 px 이하인 성분 개수를 출력하세요
            Console.WriteLine($"커널 {s}");
        }
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);
        int[] sizes = new int[] { 11, 21, 51 };
        foreach (int s in sizes)
        {
            using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(s, s));
            using var bg = new Mat();
            Cv2.MorphologyEx(img, bg, MorphTypes.Close, k);
            using var flat = new Mat();
            Cv2.Subtract(bg, img, flat);
            using var bin = new Mat();
            Cv2.Threshold(flat, bin, 40, 255, ThresholdTypes.Binary);

            var cc = Cv2.ConnectedComponentsEx(bin);
            int dots = 0;
            foreach (var b in cc.Blobs)
                if (b.Label != 0 && b.Area >= 150 && b.Width <= 20 && b.Height <= 20) dots++;
            Console.WriteLine($"커널 {s,2}: 흰 픽셀 {Cv2.CountNonZero(bin),6} px, 둥근 점 {dots}개");
        }
        Console.WriteLine("점 지름이 17 px 이므로 커널이 그보다 충분히 커야 Close 가 점을 지우고 배경만 남는다");
    }
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '모폴로지 ② MorphologyEx', subtitle: '열기 · 닫기 · 그래디언트 · 톱햇 / 블랙햇', notes: '<p>1교시의 미해결 문제로 시작: “점은 지워지는데 물체도 작아진다.” 💬 “깎았으면 다시 넓히면 되지 않을까요?” — 그것이 열기(Open) 입니다. (3분)</p>' },
          { layout: 'table', title: '다섯 가지 연산', head: ['MorphTypes', '정의', '효과'], rows: [
            ['<b>Open</b>', '침식 → 팽창', '작은 <b>흰 점</b> 제거 (크기 유지)'],
            ['<b>Close</b>', '팽창 → 침식', '작은 <b>검은 구멍</b> 메움 (크기 유지)'],
            ['<b>Gradient</b>', '팽창 − 침식', '테두리만 남는다'],
            ['<b>TopHat</b>', '원본 − 열기', '밝은 작은 것만'],
            ['<b>BlackHat</b>', '닫기 − 원본', '어두운 작은 것만']
          ], lead: '모두 침식 · 팽창의 조합 — 외울 것은 두 개뿐', notes: '<p>표를 한 줄씩 읽고 정의를 소리 내어 따라하게 합니다. 💬 “Open 과 Close 를 헷갈리지 않으려면?” — <b>O</b>pen 은 열어서 점을 내보낸다 / <b>C</b>lose 는 닫아서 구멍을 막는다. (5분)</p>' },
          { layout: 'diagram', title: '열기와 닫기', html: FIG_OPENCLOSE, caption: 'Open = 점 제거 + 크기 복원 / Close = 구멍 메움 + 크기 복원', notes: '<p>격자를 따라가며 두 단계를 손으로 짚습니다. 핵심은 “두 번째 단계가 크기를 되돌린다”. 💬 “Open 으로 얇게 연결된 두 물체는 어떻게 될까요?” — 끊어진다(분리 효과). (5분)</p>' },
          { layout: 'code', title: '다섯 연산 한 번에 비교', code: `using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
using var bin = new Mat();
Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(7, 7));
Console.WriteLine($"원본 면적 = {Cv2.CountNonZero(bin)} px");

MorphTypes[] ops = new MorphTypes[] { MorphTypes.Open, MorphTypes.Close,
    MorphTypes.Gradient, MorphTypes.TopHat, MorphTypes.BlackHat };
string[] names = new string[] { "Open", "Close", "Gradient", "TopHat", "BlackHat" };
for (int i = 0; i < ops.Length; i++)
{
    using var dst = new Mat();
    Cv2.MorphologyEx(bin, dst, ops[i], k);
    Console.WriteLine($"{names[i]} : {Cv2.CountNonZero(dst)} px");
    Cv2.ImShow(names[i], dst);
}
Cv2.WaitKey(0);`, points: ['Open 조금 ↓ / Close 조금 ↑ / Gradient 는 테두리만', 'TopHat · BlackHat 은 “차이”라서 아주 작다', '결과 창에서 Gradient 가 윤곽선처럼 보인다'], notes: '<p>결과 창의 다섯 이미지를 한 장씩 클릭해 확대해 보여 줍니다. 💬 “Gradient 로 에지 검출을 대신할 수 있을까?” — 간단한 경우엔 가능. 10차시 Canny 와 비교 예고. (7분)</p>' },
          { layout: 'code', title: 'Open + Close 로 소금-후추 정리', code: `using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
using var bin = new Mat();
Cv2.Threshold(sp, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));

using var opened = new Mat();
Cv2.MorphologyEx(bin, opened, MorphTypes.Open, k);     // 흰 점 제거
using var clean = new Mat();
Cv2.MorphologyEx(opened, clean, MorphTypes.Close, k);  // 검은 점 메우기

var c0 = Cv2.FindContoursAsArray(bin, RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
var c1 = Cv2.FindContoursAsArray(clean, RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
Console.WriteLine($"이진화만    : 윤곽선 {c0.Length}개");
Console.WriteLine($"Open+Close  : 윤곽선 {c1.Length}개, 큰 구멍은 7개");
Cv2.ImShow("binary", bin);
Cv2.ImShow("open + close", clean);
Cv2.WaitKey(0);`, points: ['08차시 MedianBlur 와 같은 결과를 <b>이진 영상에서</b> 얻는다', '윤곽선 10399개 → <b>11개</b>, 큰 구멍 7개', '순서가 중요: Open 먼저 (Close 먼저면 흰 점이 붙는다)'], notes: '<p>실습 1 에서 순서를 바꿔 보게 할 것이라고 예고합니다. 💬 “필터(08차시)와 모폴로지, 어느 쪽이 좋을까?” — 이진화 전이면 Median, 이진화 후면 모폴로지. 둘을 같이 쓰는 경우도 많다. (7분)</p>' },
          { layout: 'diagram', title: '톱햇 · 블랙햇 = 배경 빼기', html: FIG_HAT, caption: '원본 − 열기 = 밝은 작은 것 / 닫기 − 원본 = 어두운 작은 것', notes: '<p>프로파일 그림으로 “큰 커널 Open/Close 는 배경을 남긴다”를 설명합니다. 💬 “조명이 기울어진 영상에서 이게 왜 유용할까요?” — 배경(기울기)을 추정해 빼면 평평해진다. (5분)</p>' },
          { layout: 'image', title: '문제: 전역 Otsu 가 실패하는 영상', src: 'images/uneven_light.png', caption: '왼쪽 위 밝고 오른쪽 아래 어둡다 — 글자 3줄 + 검은 점 32개', notes: '<p>💬 “이 영상을 하나의 임계값으로 이진화하면 어떻게 될까요?” — 오른쪽 아래가 통째로 검게 잡힌다. 07차시의 adaptiveThreshold 를 기억하는 학생이 있으면 “오늘은 모폴로지로 배경을 <b>추정해서</b> 푼다”고 구분해 줍니다. (4분)</p>' },
          { layout: 'diagram', title: '조명 보정 파이프라인', html: FIG_FLAT, caption: '큰 커널 Close → 배경 − 원본 → 고정 임계값', notes: '<p>네 단계를 순서대로 짚습니다. 커널 51 의 근거: 점 지름 16 px 보다 충분히 크고, 조명 변화 폭(수백 px)보다 작다. 이 “크기의 근거”가 오늘의 핵심 역량입니다. (4분)</p>' },
          { layout: 'code', title: '조명 보정 후 점 32개', code: `using var img = Cv2.ImRead("images/uneven_light.png", ImreadModes.Grayscale);
using var otsu = new Mat();
Cv2.Threshold(img, otsu, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
Console.WriteLine($"전역 Otsu 흰 픽셀 = {Cv2.CountNonZero(otsu)} px");

using var kBig = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(51, 51));
using var bg = new Mat();
Cv2.MorphologyEx(img, bg, MorphTypes.Close, kBig);   // 배경(조명)만 남는다
using var flat = new Mat();
Cv2.Subtract(bg, img, flat);                          // = BlackHat
using var bin = new Mat();
Cv2.Threshold(flat, bin, 40, 255, ThresholdTypes.Binary);

var cc = Cv2.ConnectedComponentsEx(bin);
int dots = 0;
foreach (var b in cc.Blobs)      // 점 = 17x17 크기, 면적 약 210
    if (b.Label != 0 && b.Area >= 150 && b.Width <= 20 && b.Height <= 20) dots++;
Console.WriteLine($"둥근 점 = {dots}개");
Cv2.ImShow("otsu (fail)", otsu);
Cv2.ImShow("corrected", bin);
Cv2.WaitKey(0);`, points: ['<code>Subtract(bg, img)</code> — 순서 주의 (8비트는 0 에서 잘린다)', '평평해지면 <b>고정 임계값 40</b> 하나로 충분', '점 반지름 8 → 17×17 · 면적 ≈ 210 → 크기로 걸러 <b>32개</b>'], notes: '<p>결과 창의 <code>otsu (fail)</code> 과 <code>corrected</code> 를 나란히 놓고 비교하는 것이 이 교시의 하이라이트입니다. 💬 “글자도 함께 나왔는데 어떻게 점만 골랐을까?” — 글자는 세로가 25~32 px 로 크다 → <b>bbox 크기</b>로 구분. 면적만으로는 안 된다는 점을 강조합니다. (8분)</p>' },
          { layout: 'code', title: '도트 인쇄를 글자로 묶기', code: `using var img = Cv2.ImRead("images/dot_matrix_date.png", ImreadModes.Grayscale);
using var bin = new Mat();
Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
using var labels = new Mat();
Console.WriteLine($"이진화 직후 {Cv2.ConnectedComponents(bin, labels) - 1}개 (도트 하나하나)");

int[] sizes = new int[] { 3, 5, 9, 15 };
foreach (int s in sizes)
{
    using var k = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(s, s));
    using var closed = new Mat();
    Cv2.MorphologyEx(bin, closed, MorphTypes.Close, k);
    Console.WriteLine($"Close {s}x{s} → {Cv2.ConnectedComponents(closed, labels) - 1}개");
}

using var kv = Cv2.GetStructuringElement(MorphShapes.Rect, new Size(5, 25));
using var glyph = new Mat();
Cv2.MorphologyEx(bin, glyph, MorphTypes.Close, kv);
Console.WriteLine($"Close 5x25 → {Cv2.ConnectedComponents(glyph, labels) - 1}개");
Cv2.ImShow("close 5x25", glyph);
Cv2.WaitKey(0);`, points: ['도트 피치 6 px, 글자 피치 36 px', '정사각 커널을 키우면 <b>글자끼리도</b> 붙는다', '세로로 긴 커널 → 세로만 붙어 글자 단위에 가까워진다'], notes: '<p>결과 창에서 커널별 이미지를 비교하게 합니다. 💬 “줄 단위로 묶으려면?” — 아주 가로로 긴 커널(<code>Size(41, 5)</code>). 실제 OCR 전처리 순서(줄 분리 → 글자 분리)를 설명합니다. (6분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '조명이 한쪽만 밝은 영상에서 작은 <b>검은 점</b>을 찾으려면?', options: ['전역 Otsu 이진화', '큰 커널 <code>BlackHat</code> 후 고정 임계값', '작은 커널 <code>TopHat</code>', '<code>Gradient</code> 후 Otsu'], answer: 1, explain: 'BlackHat = 닫기 − 원본 은 “배경보다 어두운 작은 것”만 남겨 조명 기울기를 없앱니다. 커널은 찾으려는 점보다 충분히 크게.', notes: '<p>정답 2번. 밝은 결함이면 TopHat 이라고 짝을 지어 정리합니다. (3분)</p>' },
          { layout: 'practice', title: '실습: Open · Close 순서 바꿔 보기', desc: '<p>salt_pepper 이진 영상에 ① Open→Close ② Close→Open 을 적용해 윤곽선 개수 · 흰 픽셀 수를 비교하세요.</p><ul><li>왜 순서가 중요한가?</li><li>커널은 5×5 Ellipse 로 고정</li></ul>', starter: `using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
using var bin = new Mat();
Cv2.Threshold(sp, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));

// TODO: Open -> Close 와 Close -> Open 을 각각 적용해 비교하세요
using var a1 = new Mat();`, solution: `using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
using var bin = new Mat();
Cv2.Threshold(sp, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));

using var a1 = new Mat();
using var a2 = new Mat();
Cv2.MorphologyEx(bin, a1, MorphTypes.Open, k);
Cv2.MorphologyEx(a1, a2, MorphTypes.Close, k);

using var b1 = new Mat();
using var b2 = new Mat();
Cv2.MorphologyEx(bin, b1, MorphTypes.Close, k);
Cv2.MorphologyEx(b1, b2, MorphTypes.Open, k);

var ca = Cv2.FindContoursAsArray(a2, RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
var cb = Cv2.FindContoursAsArray(b2, RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
Console.WriteLine($"Open->Close : 윤곽선 {ca.Length}개, 흰 픽셀 {Cv2.CountNonZero(a2)}");
Console.WriteLine($"Close->Open : 윤곽선 {cb.Length}개, 흰 픽셀 {Cv2.CountNonZero(b2)}");`, notes: '<p>Close 를 먼저 하면 배경의 흰 점들이 서로 이어져 큰 덩어리가 되고 뒤의 Open 으로도 지워지지 않습니다. “작은 것을 먼저 없앤다”가 원칙. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<code>Cv2.MorphologyEx</code> 한 줄로 다섯 연산 — 모두 침식 · 팽창의 조합', '<b>Open</b> 흰 점 제거 · <b>Close</b> 검은 구멍 메움 (둘 다 크기 유지)', '<b>Gradient</b> 테두리 · <b>TopHat</b> 밝은 작은 것 · <b>BlackHat</b> 어두운 작은 것', '큰 커널 Close + 빼기 → <b>조명 기울기 제거</b> → 고정 임계값으로 점 32개', '커널 크기는 <b>대상의 크기</b>에서 정한다 (지울 것보다 크고 남길 것보다 작게)', '다음 차시: 에지 검출 — 밝기가 변하는 곳을 미분으로 찾는다 (Sobel · Canny)'], notes: '<p>오늘의 한 줄: “모폴로지는 크기와 모양으로 고르는 필터.” 10차시 예고 — 모폴로지 Gradient 보다 훨씬 정밀한 에지 검출을 배운다고 연결합니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
