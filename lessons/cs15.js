/* 15차시 동영상과 카메라: VideoCapture */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 캡처 루프
  const FIG_LOOP = `<svg viewBox="0 0 740 340" role="img" aria-label="VideoCapture 열기부터 Read 반복 처리 표시 WaitKey 종료 Release 까지의 흐름도">
  ${ARROW('c15a1')}
  <rect x="270" y="14" width="200" height="44" rx="10" class="p1s"/>
  <text x="370" y="34" text-anchor="middle" class="tx-b">new VideoCapture(0)</text>
  <text x="370" y="51" text-anchor="middle" class="tx-m">카메라 번호 또는 파일 경로</text>
  <line x1="370" y1="58" x2="370" y2="78" class="ln" stroke-width="2" marker-end="url(#c15a1)"/>
  <rect x="290" y="80" width="160" height="38" rx="10" class="p2s"/>
  <text x="370" y="104" text-anchor="middle" class="tx">IsOpened() ?</text>
  <line x1="450" y1="99" x2="560" y2="99" class="ln" stroke-width="2" marker-end="url(#c15a1)"/>
  <text x="505" y="92" text-anchor="middle" class="tx-m">아니오</text>
  <rect x="562" y="80" width="160" height="38" rx="10" class="p5s"/>
  <text x="642" y="104" text-anchor="middle" class="tx">오류 안내 후 종료</text>
  <line x1="370" y1="118" x2="370" y2="140" class="ln" stroke-width="2" marker-end="url(#c15a1)"/>
  <text x="392" y="134" class="tx-m">예</text>
  <rect x="120" y="142" width="500" height="150" rx="12" class="card-bg"/>
  <text x="150" y="164" class="tx-b">반복 (프레임 루프)</text>
  <rect x="146" y="176" width="140" height="42" rx="8" class="p1s"/>
  <text x="216" y="194" text-anchor="middle" class="tx">cap.Read(frame)</text>
  <text x="216" y="211" text-anchor="middle" class="tx-m">성공하면 true</text>
  <line x1="286" y1="197" x2="326" y2="197" class="ln" stroke-width="2" marker-end="url(#c15a1)"/>
  <rect x="328" y="176" width="130" height="42" rx="8" class="p2s"/>
  <text x="393" y="194" text-anchor="middle" class="tx">프레임 처리</text>
  <text x="393" y="211" text-anchor="middle" class="tx-m">Gray · Canny · 검출</text>
  <line x1="458" y1="197" x2="498" y2="197" class="ln" stroke-width="2" marker-end="url(#c15a1)"/>
  <rect x="500" y="176" width="104" height="42" rx="8" class="p3s"/>
  <text x="552" y="194" text-anchor="middle" class="tx">Cv2.ImShow</text>
  <text x="552" y="211" text-anchor="middle" class="tx-m">화면에 표시</text>
  <rect x="300" y="236" width="220" height="42" rx="8" class="p4s"/>
  <text x="410" y="254" text-anchor="middle" class="tx">Cv2.WaitKey(30) == 27 ?</text>
  <text x="410" y="271" text-anchor="middle" class="tx-m">27 = ESC → break</text>
  <path d="M 552 218 L 552 257 L 524 257" class="ln" stroke-width="2" fill="none" marker-end="url(#c15a1)"/>
  <path d="M 300 257 L 216 257 L 216 222" class="ln" stroke-width="2" fill="none" marker-end="url(#c15a1)"/>
  <line x1="370" y1="292" x2="370" y2="308" class="ln" stroke-width="2" marker-end="url(#c15a1)"/>
  <rect x="250" y="310" width="240" height="30" rx="8" class="p5s"/>
  <text x="370" y="330" text-anchor="middle" class="tx">cap.Release() · Dispose()</text>
  <text x="20" y="180" class="tx-m">Read 가 false 를</text>
  <text x="20" y="198" class="tx-m">돌려주면 루프 종료</text>
  <text x="20" y="216" class="tx-m">(파일 끝 · 카메라 끊김)</text>
  <text x="640" y="180" class="tx-m">WaitKey 는 반드시</text>
  <text x="640" y="198" class="tx-m">넣는다 — 창을</text>
  <text x="640" y="216" class="tx-m">그릴 시간을 준다</text>
</svg>`;

  // 그림 2: 움직임 검출 파이프라인
  const FIG_MOTION = `<svg viewBox="0 0 760 320" role="img" aria-label="프레임 차이 또는 배경 차분으로 전경 마스크를 만들고 모폴로지와 윤곽선으로 물체를 찾는 흐름">
  ${ARROW('c15b1')}
  <text x="120" y="24" text-anchor="middle" class="tx-b">① 두 프레임 비교</text>
  <rect x="20" y="34" width="200" height="110" rx="8" class="card-bg"/>
  <rect x="38" y="50" width="78" height="52" rx="4" class="p1s"/><text x="77" y="80" text-anchor="middle" class="tx-m">이전 프레임</text>
  <rect x="124" y="50" width="78" height="52" rx="4" class="p2s"/><text x="163" y="80" text-anchor="middle" class="tx-m">현재 프레임</text>
  <text x="120" y="126" text-anchor="middle" class="tx">Cv2.Absdiff(gray, prev, diff)</text>
  <text x="120" y="162" text-anchor="middle" class="tx-m">또는 <tspan class="tx-b">BackgroundSubtractorMOG2</tspan></text>
  <text x="120" y="180" text-anchor="middle" class="tx-m">mog2.Apply(frame, fgMask)</text>
  <line x1="228" y1="90" x2="264" y2="90" class="ln" stroke-width="2" marker-end="url(#c15b1)"/>
  <text x="330" y="24" text-anchor="middle" class="tx-b">② 이진화 · 모폴로지</text>
  <rect x="266" y="34" width="130" height="110" rx="8" class="card-bg"/>
  <circle cx="300" cy="66" r="4" class="p5"/><circle cx="340" cy="58" r="3" class="p5"/><circle cx="370" cy="84" r="3" class="p5"/>
  <rect x="304" y="92" width="34" height="34" rx="6" class="p1"/>
  <rect x="348" y="96" width="30" height="30" rx="6" class="p1"/>
  <text x="330" y="162" text-anchor="middle" class="tx">Threshold</text>
  <text x="330" y="180" text-anchor="middle" class="tx">MorphologyEx(Open)</text>
  <text x="330" y="200" text-anchor="middle" class="tx-m">작은 점 잡음 제거</text>
  <line x1="404" y1="90" x2="440" y2="90" class="ln" stroke-width="2" marker-end="url(#c15b1)"/>
  <text x="510" y="24" text-anchor="middle" class="tx-b">③ 윤곽선 → 물체</text>
  <rect x="442" y="34" width="130" height="110" rx="8" class="card-bg"/>
  <rect x="462" y="60" width="44" height="44" rx="4" class="s1" stroke-width="2.5"/>
  <rect x="516" y="66" width="38" height="38" rx="4" class="s1" stroke-width="2.5"/>
  <text x="510" y="162" text-anchor="middle" class="tx">FindContours</text>
  <text x="510" y="180" text-anchor="middle" class="tx">면적 필터 → BoundingRect</text>
  <text x="510" y="200" text-anchor="middle" class="tx-m">중심 = 사각형의 가운데</text>
  <line x1="580" y1="90" x2="616" y2="90" class="ln" stroke-width="2" marker-end="url(#c15b1)"/>
  <text x="680" y="24" text-anchor="middle" class="tx-b">④ 라인 통과 카운트</text>
  <rect x="618" y="34" width="130" height="110" rx="8" class="card-bg"/>
  <line x1="683" y1="40" x2="683" y2="138" class="s4" stroke-width="3"/>
  <circle cx="650" cy="70" r="9" class="p2"/>
  <circle cx="706" cy="70" r="9" class="p1"/>
  <line x1="662" y1="70" x2="694" y2="70" class="ln" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#c15b1)"/>
  <text x="683" y="118" text-anchor="middle" class="tx-m">이전 &lt; 320 ≤ 현재</text>
  <text x="683" y="162" text-anchor="middle" class="tx">→ count++</text>
  <text x="683" y="182" text-anchor="middle" class="tx-m">한 번만 세는 비결</text>
  <text x="20" y="244" class="tx-m">⚠️ 프레임 차이(Absdiff)는 <tspan class="tx-b">카메라가 고정</tspan>되어 있을 때만 "움직인 물체"를 뜻합니다.</text>
  <text x="20" y="266" class="tx-m">컨베이어처럼 <tspan class="tx-b">배경(벨트) 자체가 움직이면</tspan> 벨트 무늬도 전부 변화로 잡힙니다 → 밝기 · 색 같은 다른 단서를 함께 씁니다.</text>
  <text x="20" y="294" class="tx-m">⚠️ 프레임마다 물체를 "검출"만 하면 같은 부품을 <tspan class="tx-b">여러 번</tspan> 셉니다. 기준선을 <tspan class="tx-b">넘는 순간</tspan>에만 세야 정확합니다.</text>
</svg>`;

  const EX_OPEN = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture(0);          // 0 = 기본 카메라
        if (!cap.IsOpened())
        {
            Console.WriteLine("카메라를 열 수 없습니다.");
            return;
        }
        Console.WriteLine($"해상도: {cap.FrameWidth} x {cap.FrameHeight}");
        Console.WriteLine($"FPS: {cap.Fps}");
        Console.WriteLine($"FrameCount: {cap.FrameCount}");

        using var frame = new Mat();
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            if (n == 1)
            {
                Console.WriteLine($"프레임 1: {frame.Width}x{frame.Height}, {frame.Channels()}채널, {frame.Type()}");
                Cv2.ImShow("first frame", frame);
            }
            if (n % 20 == 0) Console.WriteLine($"  프레임 {n} 평균 밝기 {Cv2.Mean(frame).Val0:F1}");
            if (Cv2.WaitKey(1) == 27) break;          // ESC 누르면 종료
        }
        Console.WriteLine($"총 {n}프레임 읽고 끝 (Read 가 false 를 돌려줌)");
        cap.Release();
    }
}`;

  const EX_PROC = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture(0);
        using var frame = new Mat();
        using var gray = new Mat();
        using var edges = new Mat();      // 버퍼는 루프 밖에서 한 번만 만든다
        int n = 0, saved = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.Canny(gray, edges, 60, 150);
            Cv2.PutText(edges, $"frame {n}", new Point(12, 34), HersheyFonts.HersheySimplex, 0.9, Scalar.White, 2);
            Cv2.ImShow("camera", frame);
            Cv2.ImShow("edges", edges);

            if (n == 30)
            {
                Cv2.ImWrite("snap30.png", edges);     // 📁 작업 폴더에 저장
                saved = Cv2.CountNonZero(edges);
            }
            if (Cv2.WaitKey(1) == 27) break;
        }
        Console.WriteLine($"{n}프레임 처리");
        Console.WriteLine($"30번 프레임 에지 픽셀 {saved}개 → snap30.png 저장");
    }
}`;

  const EX_FPS = `using System;
using System.Diagnostics;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture(0);
        using var frame = new Mat();
        using var gray = new Mat();
        var sw = Stopwatch.StartNew();
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.ImShow("camera", gray);
            if (Cv2.WaitKey(1) == 27) break;
        }
        sw.Stop();
        double sec = sw.ElapsedMilliseconds / 1000.0;
        Console.WriteLine($"{n}프레임 / {sec:F2}초");
        Console.WriteLine($"평균 처리 FPS = {n / Math.Max(0.001, sec):F1}");
        cap.Release();
    }
}`;

  const EX_FILE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 카메라 번호 대신 파일 경로를 넣으면 동영상이 열린다
        using var cap = new VideoCapture("videos/conveyor.mp4");
        if (!cap.IsOpened())
        {
            Console.WriteLine("동영상을 열 수 없습니다.");
            return;
        }
        Console.WriteLine($"{cap.FrameWidth} x {cap.FrameHeight}, {cap.Fps} fps, 전체 {cap.FrameCount}프레임");
        Console.WriteLine($"재생 시간 = {cap.FrameCount / cap.Fps:F2}초");

        using var frame = new Mat();
        int n = 0;
        while (cap.Read(frame)) n++;
        Console.WriteLine($"읽은 프레임 {n}개, 현재 위치 PosFrames = {cap.PosFrames}");

        cap.PosFrames = 0;                       // 처음으로 되감기 (파일에서만 의미 있다)
        cap.Read(frame);
        Console.WriteLine($"되감은 뒤 첫 프레임 평균 밝기 {Cv2.Mean(frame).Val0:F2}");
        Cv2.ImShow("frame 0", frame);
        Cv2.WaitKey(0);
    }
}`;

  const EX_WRITER = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture(0);
        if (!cap.IsOpened()) return;

        var size = new Size(cap.FrameWidth, cap.FrameHeight);
        double fps = cap.Fps > 0 ? cap.Fps : 30;
        int fourcc = VideoWriter.FourCC('M', 'J', 'P', 'G');   // 코덱 4글자 코드
        using var writer = new VideoWriter("record.avi", fourcc, fps, size);
        if (!writer.IsOpened())
        {
            Console.WriteLine("녹화 파일을 만들 수 없습니다 (코덱 확인).");
            return;
        }

        using var frame = new Mat();
        int n = 0;
        while (cap.Read(frame) && n < 300)     // 10초쯤 녹화
        {
            writer.Write(frame);               // 프레임을 파일에 기록
            Cv2.ImShow("recording", frame);
            n++;
            if (Cv2.WaitKey(30) == 27) break;
        }
        writer.Release();
        cap.Release();
        Console.WriteLine($"{n}프레임을 record.avi 로 저장했습니다.");
    }
}`;

  const EX_DIFF = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat();
        using var gray = new Mat();
        using var prev = new Mat();
        using var diff = new Mat();
        using var moved = new Mat();
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            if (!prev.Empty())
            {
                Cv2.Absdiff(gray, prev, diff);                     // 두 프레임의 차이
                Cv2.Threshold(diff, moved, 30, 255, ThresholdTypes.Binary);
                if (n <= 4 || n == 20)
                    Console.WriteLine($"  프레임 {n,2}: 변화 픽셀 {Cv2.CountNonZero(moved),6}개 ({100.0 * Cv2.CountNonZero(moved) / (640 * 480):F1}%)");
                if (n == 10) { Cv2.ImShow("diff", diff); Cv2.ImShow("moved", moved); }
            }
            gray.CopyTo(prev);                                     // 다음 비교를 위해 저장
        }
        Console.WriteLine($"총 {n}프레임 (벨트가 프레임당 36px 이동하므로 벨트 무늬도 변화로 잡힌다)");
        Cv2.WaitKey(0);
    }
}`;

  const EX_MOG2 = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var mog2 = BackgroundSubtractorMOG2.Create();
        using var frame = new Mat();
        using var fg = new Mat();
        using var open = new Mat();
        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            mog2.Apply(frame, fg);                                  // 전경 마스크 (0/127/255)
            Cv2.MorphologyEx(fg, open, MorphTypes.Open, k);         // 점 잡음 제거
            if (n >= 17)
            {
                var cs = Cv2.FindContoursAsArray(open, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
                int big = cs.Count(c => Cv2.ContourArea(c) > 200);
                Console.WriteLine($"  프레임 {n}: 흰 픽셀 {Cv2.CountNonZero(open),5}, 윤곽 {cs.Length,2}개, 면적>200 인 것 {big}개");
                if (n == 20) { Cv2.ImShow("fgmask", fg); Cv2.ImShow("open", open); }
            }
        }
        Console.WriteLine($"총 {n}프레임");
        Cv2.WaitKey(0);
    }
}`;

  const EX_PARTS = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat();
        using var gray = new Mat();
        using var bin = new Mat();
        using var open = new Mat();
        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.Threshold(gray, bin, 150, 255, ThresholdTypes.Binary);   // 부품은 밝다
            Cv2.MorphologyEx(bin, open, MorphTypes.Open, k);
            var parts = Cv2.FindContoursAsArray(open, RetrievalModes.External, ContourApproximationModes.ApproxSimple)
                           .Where(c => Cv2.ContourArea(c) > 1200)
                           .OrderBy(c => Cv2.BoundingRect(c).X).ToArray();
            if (n <= 3 || n == 20)
            {
                Console.WriteLine($"  프레임 {n,2}: 부품 {parts.Length}개  " +
                    string.Join(" ", parts.Select(c => { var r = Cv2.BoundingRect(c); return $"({r.X + r.Width / 2},{r.Y + r.Height / 2})"; })));
            }
            if (n == 20)
            {
                foreach (var c in parts)
                    Cv2.Rectangle(frame, Cv2.BoundingRect(c), new Scalar(0, 0, 255), 2);
                Cv2.ImShow("parts", frame);
            }
        }
        Cv2.WaitKey(0);
    }
}`;

  const EX_COUNT = `using System;
using System.Collections.Generic;
using System.Linq;
using OpenCvSharp;

class Program
{
    const int LINE_X = 320;          // 세로 기준선

    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat();
        using var gray = new Mat();
        using var bin = new Mat();
        using var open = new Mat();
        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));

        var prevCenters = new List<Point2f>();
        int crossed = 0, n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.Threshold(gray, bin, 150, 255, ThresholdTypes.Binary);
            Cv2.MorphologyEx(bin, open, MorphTypes.Open, k);

            var centers = new List<Point2f>();
            foreach (var c in Cv2.FindContoursAsArray(open, RetrievalModes.External, ContourApproximationModes.ApproxSimple))
            {
                if (Cv2.ContourArea(c) < 1200) continue;
                var r = Cv2.BoundingRect(c);
                centers.Add(new Point2f(r.X + r.Width / 2f, r.Y + r.Height / 2f));
            }
            centers = centers.OrderBy(p => p.X).ToList();

            // 이전 프레임의 중심 중 같은 부품(비슷한 높이 · 오른쪽으로 10~60px 이동)을 찾아 선을 넘었는지 본다
            foreach (var c in centers)
            {
                if (c.X < LINE_X) continue;
                var prevSame = prevCenters.Where(p => Math.Abs(p.Y - c.Y) < 30 && c.X - p.X > 10 && c.X - p.X < 60).ToList();
                if (prevSame.Count > 0 && prevSame.Min(p => p.X) < LINE_X) crossed++;
            }
            Console.WriteLine($"프레임 {n,2}: 부품 {centers.Count}개  x = " + string.Join(" ", centers.Select(p => $"{p.X:F0}")) + $"   누적 {crossed}");
            prevCenters = centers;

            if (n == 20)
            {
                Cv2.Line(frame, new Point(LINE_X, 0), new Point(LINE_X, frame.Height), new Scalar(0, 255, 255), 2);
                foreach (var p in centers) Cv2.Circle(frame, new Point((int)p.X, (int)p.Y), 6, new Scalar(0, 0, 255), -1);
                Cv2.PutText(frame, $"count {crossed}", new Point(12, 34), HersheyFonts.HersheySimplex, 1.0, new Scalar(0, 255, 0), 2);
                Cv2.ImShow("counting", frame);
            }
        }
        Console.WriteLine($"기준선 x={LINE_X} 를 통과한 부품 = {crossed}개");
        Cv2.WaitKey(0);
    }
}`;

  const WPF_XAML = `<Window x:Class="Ch15_Camera.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="15차시 카메라 (VideoCapture)" Height="620" Width="900"
        WindowStartupLocation="CenterScreen" Closing="Window_Closing">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" />
            <RowDefinition Height="*" />
            <RowDefinition Height="Auto" />
        </Grid.RowDefinitions>

        <ToolBar Grid.Row="0">
            <TextBlock Text="카메라 번호" VerticalAlignment="Center" Margin="4,0" />
            <TextBox x:Name="CameraIndexBox" Text="0" Width="36" VerticalAlignment="Center" TextAlignment="Center" />
            <Separator />
            <Button x:Name="StartButton" Content="시작" Click="StartButton_Click" Style="{StaticResource ToolButton}" />
            <Button x:Name="StopButton" Content="정지" Click="StopButton_Click" Style="{StaticResource ToolButton}" IsEnabled="False" />
            <Separator />
            <TextBlock Text="처리" VerticalAlignment="Center" Margin="4,0" />
            <ComboBox x:Name="ModeCombo" Width="150" SelectedIndex="0" SelectionChanged="ModeCombo_SelectionChanged">
                <ComboBoxItem Content="원본" />
                <ComboBoxItem Content="흑백" />
                <ComboBoxItem Content="Canny 에지" />
                <ComboBoxItem Content="배경 차분 (MOG2)" />
            </ComboBox>
            <Separator />
            <TextBlock x:Name="FpsText" Text="FPS: -" VerticalAlignment="Center" Margin="8,0" FontFamily="Consolas" FontWeight="Bold" />
        </ToolBar>

        <Border Grid.Row="1" Background="#FF2D2D30">
            <Image x:Name="CameraImage" Stretch="Uniform" Margin="8" />
        </Border>

        <StatusBar Grid.Row="2">
            <StatusBarItem>
                <TextBlock x:Name="StatusText" Text="[시작] 을 누르면 웹캠 영상이 나옵니다." />
            </StatusBarItem>
        </StatusBar>
    </Grid>
</Window>`;

  const WPF_START = `using System.Windows;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;

namespace Ch15_Camera;

public partial class MainWindow : Window
{
    private VideoCapture? _capture;
    private CancellationTokenSource? _cts;
    private Task? _loopTask;
    private int _mode;              // 0 원본 · 1 흑백 · 2 Canny · 3 MOG2

    private bool IsRunning => _loopTask != null && !_loopTask.IsCompleted;

    private void StartButton_Click(object sender, RoutedEventArgs e)
    {
        if (IsRunning) return;

        if (!int.TryParse(CameraIndexBox.Text, out int index) || index < 0)
        {
            MessageBox.Show(this, "카메라 번호는 0 이상의 정수입니다.", "안내");
            return;
        }

        // Windows 에서는 DSHOW 백엔드가 빠르게 열립니다. 실패하면 기본(ANY) 으로 한 번 더 시도.
        var cap = new VideoCapture(index, VideoCaptureAPIs.DSHOW);
        if (!cap.IsOpened())
        {
            cap.Dispose();
            cap = new VideoCapture(index);
        }
        if (!cap.IsOpened())
        {
            cap.Dispose();
            MessageBox.Show(this, "웹캠을 열 수 없습니다. 연결 상태와 카메라 권한을 확인하세요.",
                            "카메라 없음", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        _capture = cap;
        _cts = new CancellationTokenSource();
        CancellationToken token = _cts.Token;
        _loopTask = Task.Run(() => CaptureLoop(cap, token));   // 백그라운드 루프 시작

        StartButton.IsEnabled = false;
        StopButton.IsEnabled = true;
        CameraIndexBox.IsEnabled = false;
        StatusText.Text = $"카메라 {index} 열림: {cap.FrameWidth} x {cap.FrameHeight}, 카메라 FPS {cap.Fps:F0}";
    }
}`;

  const WPF_LOOP = `// Ch15_Camera / MainWindow.xaml.cs — 백그라운드 캡처 루프 (UI 스레드가 아님!)
public partial class MainWindow
{
  private void CaptureLoop(VideoCapture cap, CancellationToken token)
{
    // 루프 안에서 재사용하는 버퍼들 (매 프레임 new 하지 않음)
    using var frame = new Mat();
    using var gray = new Mat();
    using var output = new Mat();
    using var mog2 = BackgroundSubtractorMOG2.Create(history: 300, varThreshold: 25, detectShadows: false);

    var fpsWatch = Stopwatch.StartNew();
    int frameCount = 0;
    double fps = 0;

    try
    {
        while (!token.IsCancellationRequested)
        {
            if (!cap.Read(frame) || frame.Empty())
            {
                Thread.Sleep(5);   // 프레임이 아직 없으면 잠깐 기다림
                continue;
            }

            Mat display = frame;
            switch (Volatile.Read(ref _mode))
            {
                case 1:   // 흑백
                    Cv2.CvtColor(frame, output, ColorConversionCodes.BGR2GRAY);
                    display = output;
                    break;
                case 2:   // Canny 에지
                    Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
                    Cv2.GaussianBlur(gray, gray, new OpenCvSharp.Size(5, 5), 0);
                    Cv2.Canny(gray, output, 60, 150);
                    display = output;
                    break;
                case 3:   // 배경 차분: 움직이는 부분만 흰색
                    mog2.Apply(frame, output);
                    display = output;
                    break;
            }

            // FPS: 1초마다 갱신
            frameCount++;
            if (fpsWatch.ElapsedMilliseconds >= 1000)
            {
                fps = frameCount * 1000.0 / fpsWatch.ElapsedMilliseconds;
                frameCount = 0;
                fpsWatch.Restart();
            }

            // 화면 갱신은 UI 스레드에서. Invoke 는 갱신이 끝날 때까지 기다리므로
            // display(Mat) 를 다음 루프에서 덮어써도 안전합니다.
            double fpsNow = fps;
            Dispatcher.Invoke(() =>
            {
                CameraImage.Source = display.ToBitmapSource();
                FpsText.Text = $"FPS: {fpsNow:F1}";
            }, System.Windows.Threading.DispatcherPriority.Render, token);
        }
    }
    catch (OperationCanceledException)
    {
        // 정지 요청 — 정상 종료
    }
  }
}`;

  const WPF_STOP = `// Ch15_Camera / MainWindow.xaml.cs — 정지 · 창 닫기: 루프가 끝난 뒤에 Release
public partial class MainWindow
{
/// <summary>취소 신호 → 루프가 끝날 때까지 기다림 → 카메라 Release.</summary>
private async Task StopCameraAsync()
{
    if (_cts == null) return;

    _cts.Cancel();
    if (_loopTask != null)
    {
        try { await _loopTask; }
        catch (Exception) { /* 루프 안에서 이미 보고했으므로 무시 */ }
    }

    _capture?.Release();
    _capture?.Dispose();
    _capture = null;
    _cts.Dispose();
    _cts = null;
    _loopTask = null;

    StartButton.IsEnabled = true;
    StopButton.IsEnabled = false;
    CameraIndexBox.IsEnabled = true;
    FpsText.Text = "FPS: -";
}

private bool _closingConfirmed;

private async void Window_Closing(object sender, CancelEventArgs e)
{
    if (_closingConfirmed || !IsRunning)
        return;                    // 이미 정리됨 → 그대로 닫힘

    e.Cancel = true;               // 일단 닫기를 미루고
    await StopCameraAsync();       // 루프 종료 · Release 를 기다린 뒤
    _closingConfirmed = true;
    Close();                       // 다시 닫기
}
}`;

  const QUIZ1 = [
    { q: '<code>while (cap.Read(frame))</code> 반복이 끝나는 때는?', options: ['ESC 키를 눌렀을 때', '프레임을 더 읽지 못했을 때(파일 끝 · 카메라 끊김) <code>Read</code> 가 false 를 돌려줄 때', '1초가 지났을 때', 'Mat 이 가득 찼을 때'], answer: 1,
      explain: '<code>Read</code> 는 성공하면 true, 실패하면 false 를 돌려줍니다. <b>실제 웹캠은 끝나지 않으므로</b> 이 조건만으로는 영원히 돌아갑니다 — 반드시 <code>if (Cv2.WaitKey(30) == 27) break;</code> 같은 <b>종료 장치</b>를 넣으세요.' },
    { q: '<code>Cv2.WaitKey(30)</code> 이 카메라 루프에서 하는 일 두 가지는?', options: ['영상을 저장하고 화면을 지운다', '창을 실제로 그리고(이벤트 처리) 키 입력을 받는다', '프레임을 버퍼에 채운다', 'FPS 를 계산한다'], answer: 1,
      explain: '<code>ImShow</code> 는 그릴 내용을 등록만 하고, <b>실제 그리기는 <code>WaitKey</code> 안</b>에서 일어납니다. 그래서 <code>WaitKey</code> 를 빼면 창이 안 뜨거나 멈춘 것처럼 보입니다. 동시에 눌린 키의 코드를 돌려줍니다(ESC = <b>27</b>).' },
    { q: '카메라 루프에서 <code>Mat</code> 버퍼를 다루는 올바른 방법은?', options: ['프레임마다 <code>new Mat()</code> 을 만든다', '루프 <b>밖에서 한 번</b> 만들어 재사용한다', '매번 Clone 한다', 'Mat 대신 배열을 쓴다'], answer: 1,
      explain: '초당 30번 <code>new Mat()</code> 을 만들면 메모리 할당과 GC 부담이 커집니다. <code>frame</code>, <code>gray</code>, <code>edges</code> 를 <b>루프 밖에서 한 번</b> 만들어 출력 인수로 재사용하세요 — WPF 프로젝트 <code>Ch15_Camera</code> 도 같은 방식입니다.' },
    { q: '이 브라우저 실습 환경에서 <code>new VideoCapture(0)</code> 은 무엇인가?', options: ['실제 웹캠', '컨베이어 영상 20프레임을 3번 반복하는 <b>시뮬레이션</b> (총 60프레임)', '검은 화면', '오류'], answer: 1,
      explain: '브라우저는 실제 웹캠을 쓸 수 없으므로 <b>컨베이어 영상(conveyor_00~19)</b> 을 3회 반복해 60프레임을 준 뒤 <code>Read</code> 가 false 를 돌려줍니다. <b>코드는 실제 웹캠과 완전히 같습니다</b> — Visual Studio 에서 그대로 돌리면 진짜 카메라가 열립니다.' },
    { q: '카메라를 다 쓴 뒤 꼭 해야 하는 것은?', options: ['<code>Cv2.DestroyAllWindows()</code> 만 부른다', '<code>cap.Release()</code> (또는 <code>Dispose</code>) 로 장치를 놓아 준다', '프로그램을 강제 종료한다', '아무것도 안 해도 된다'], answer: 1,
      explain: '카메라는 <b>한 번에 한 프로그램만</b> 쓸 수 있는 경우가 많습니다. <code>Release</code> 하지 않으면 다음 실행에서 "카메라를 열 수 없습니다" 가 납니다. <code>using var cap = new VideoCapture(0);</code> 로 선언하면 블록을 벗어날 때 자동으로 정리됩니다.' }
  ];

  const QUIZ2 = [
    { q: '고정 카메라에서 "움직인 곳" 을 찾는 가장 단순한 방법은?', options: ['<code>Cv2.Absdiff(현재, 이전)</code> 후 <code>Threshold</code>', '<code>Cv2.Canny</code>', '<code>Cv2.HoughCircles</code>', '<code>Cv2.Resize</code>'], answer: 0,
      explain: '두 프레임의 <b>절대 차이</b>가 큰 곳이 움직인 곳입니다. 단 <b>카메라가 고정</b>되어 있어야 의미가 있고, 물체가 멈추면 차이가 0 이 되어 사라진다는 한계가 있습니다.' },
    { q: '<code>BackgroundSubtractorMOG2</code> 의 <code>Apply(frame, fgMask)</code> 가 돌려주는 마스크의 값은?', options: ['0 과 1', '0(배경) · 127(그림자) · 255(전경)', '−1 ~ 1 실수', 'BGR 컬러'], answer: 1,
      explain: '기본 설정(<code>detectShadows: true</code>)에서는 <b>그림자를 127</b> 로 표시합니다. 그림자를 빼려면 <code>Create(500, 16, false)</code> 로 끄거나 <code>Threshold(fg, fg, 200, 255, Binary)</code> 로 255 만 남깁니다.' },
    { q: '전경 마스크의 점 잡음을 지우는 데 가장 알맞은 모폴로지 연산은?', options: ['<code>MorphTypes.Dilate</code>', '<code>MorphTypes.Open</code> (침식 → 팽창)', '<code>MorphTypes.Gradient</code>', '<code>MorphTypes.TopHat</code>'], answer: 1,
      explain: '<b>열기(Open)</b> 는 작은 흰 점을 지우면서 큰 덩어리의 크기는 거의 유지합니다(9차시). 반대로 물체 안의 구멍을 메우려면 <b>닫기(Close)</b> 입니다.' },
    { q: '컨베이어 영상에서 <code>Absdiff</code> 와 MOG2 가 잘 안 되는 이유는?', options: ['영상이 흑백이라서', '<b>배경(벨트)이 프레임마다 36 px 움직여</b> 벨트 무늬까지 전경으로 잡히기 때문', '해상도가 낮아서', '프레임이 20장뿐이라서'], answer: 1,
      explain: '두 방법 모두 <b>배경이 정지해 있다</b>고 가정합니다. 벨트가 움직이면 가정이 깨집니다. 이 영상에서는 부품이 <b>밝다</b>는 다른 단서(<code>Threshold</code> 150)를 쓰는 편이 훨씬 안정적입니다 — 알고리즘보다 <b>영상의 성질</b>을 먼저 보세요.' },
    { q: '컨베이어 위 부품을 <b>한 번만</b> 세려면?', options: ['프레임마다 검출된 개수를 모두 더한다', '가장 많이 검출된 프레임의 개수를 쓴다', '<b>기준선(x=320)을 넘는 순간</b>에만 센다 (이전 프레임 중심과 비교)', '마지막 프레임의 개수를 쓴다'], answer: 2,
      explain: '프레임마다 4~5개가 보이므로 그냥 더하면 90개가 됩니다. 이전 프레임의 중심 목록과 비교해 <b>이전에는 선 왼쪽 · 지금은 선 오른쪽</b>인 경우에만 세면 정확히 <b>5개</b>가 나옵니다 (부품 #2 ~ #6).' }
  ];

  CS_COURSE.addChapter({
    id: 'cs15', no: '15', title: '동영상과 카메라: VideoCapture', subtitle: '프레임 루프 · 실시간 처리 · 움직임 검출 · 라인 통과 카운트',
    summary: '지금까지는 <b>사진 한 장</b>을 다뤘습니다. 이제 <code>VideoCapture</code> 로 웹캠과 동영상 파일을 열어 <b>프레임 루프</b>를 돌립니다. <code>while (cap.Read(frame))</code> + <code>Cv2.ImShow</code> + <code>Cv2.WaitKey</code> 의 기본 패턴, 프레임마다 처리(Gray · Canny · 오버레이), FPS 측정과 <code>Release</code> 를 익히고, 2교시에는 <b>움직임 검출</b>(Absdiff · MOG2)과 <b>기준선 통과 카운트</b>로 컨베이어 부품을 한 번만 세어 봅니다. 마지막으로 WPF 에서 카메라를 백그라운드 스레드로 돌리는 완성 프로젝트 <code>Ch15_Camera</code> 를 읽습니다.',
    goals: ['VideoCapture 로 카메라 · 동영상을 열고 속성을 읽을 수 있다', 'Read → 처리 → ImShow → WaitKey 프레임 루프를 쓰고 안전하게 종료할 수 있다', 'Absdiff · MOG2 로 움직임을 검출하고 모폴로지 · 윤곽선으로 물체를 찾을 수 있다', '기준선 통과 방식으로 지나가는 부품을 한 번만 셀 수 있다', 'WPF 에서 카메라 루프를 백그라운드 스레드로 돌리고 Dispatcher 로 화면을 갱신하는 구조를 설명할 수 있다'],
    wpf: 'Ch15_Camera',
    sections: [
      {
        id: 'cs15-1', title: 'VideoCapture 와 프레임 루프', minutes: 50,
        goals: ['VideoCapture 를 열고 IsOpened · FrameWidth · Fps 를 확인할 수 있다', 'Read/ImShow/WaitKey 루프와 ESC 종료 패턴을 쓸 수 있다', '프레임마다 처리하고 한 장을 ImWrite 로 저장할 수 있다', 'Stopwatch 로 처리 FPS 를 재고 Release 의 필요성을 안다'],
        flow: [['도입: 사진에서 영상으로', 5], ['열기 · 속성 · 프레임 루프', 15], ['프레임 처리 · FPS · 저장', 20], ['파일 · VideoWriter · 정리', 10]],
        content: [
          { type: 'h', text: '사진 한 장에서 초당 30장으로' },
          { type: 'p', html: '14차시까지는 <code>Cv2.ImRead</code> 로 읽은 <b>사진 한 장</b>을 다뤘습니다. 실제 검사 장비는 컨베이어가 돌아가는 동안 <b>초당 30~120장</b>을 받아 그때그때 판정합니다. OpenCV 에서 이 입구가 <b><code>VideoCapture</code></b> 입니다 — 웹캠도, 동영상 파일도, 산업용 카메라도 같은 클래스로 엽니다.' },
          { type: 'figure', html: FIG_LOOP, caption: '그림 1. 카메라 프로그램의 기본 골격 — 열기 → (읽기 → 처리 → 표시 → 키 확인) 반복 → 놓아 주기' },
          { type: 'callout', kind: 'warn', title: '📷 브라우저에서는 카메라 0 이 "컨베이어 시뮬레이션" 입니다', html: '이 사이트는 브라우저 안에서 돌아가므로 <b>실제 웹캠을 열 수 없습니다</b>. 대신 <code>new VideoCapture(0)</code> 이 <b>컨베이어 영상 20프레임을 3회 반복(총 60프레임)</b> 하는 가짜 카메라로 동작하고, 그 뒤 <code>Read</code> 가 <code>false</code> 를 돌려줍니다.<br><b>코드는 실제 웹캠과 한 글자도 다르지 않습니다</b> — 아래 예제를 그대로 Visual Studio 콘솔 프로젝트에 붙이면 진짜 카메라 영상이 나옵니다. 다만 실제 카메라는 <b>끝나지 않으므로</b> ESC 종료 코드를 반드시 넣어야 합니다.' },
          { type: 'code', title: '예제 1: 카메라 열기 · 속성 읽기 · 프레임 세기', code: EX_OPEN,
            desc: '<code>IsOpened()</code> 확인은 <b>습관</b>으로 만드세요 — 카메라가 없거나 다른 프로그램이 쓰고 있으면 여기서 걸러야 합니다. <code>FrameWidth</code> · <code>FrameHeight</code> · <code>Fps</code> 는 <code>cap.Get(VideoCaptureProperties.FrameWidth)</code> 의 짧은 표기입니다. 프레임은 <b>3채널 BGR</b> 로 들어옵니다(흑백 카메라여도 보통 3채널로 변환되어 옵니다). 60프레임 뒤 <code>Read</code> 가 false 가 되어 루프가 끝납니다.',
            expect: '해상도: 640 x 480\nFPS: 30\nFrameCount: 60\n프레임 1: 640x480, 3채널, CV_8UC3\n  프레임 20 평균 밝기 102.7\n  프레임 40 평균 밝기 102.7\n  프레임 60 평균 밝기 102.7\n총 60프레임 읽고 끝 (Read 가 false 를 돌려줌)' },
          { type: 'table', head: ['속성 / 메서드', '뜻', '비고'], rows: [
            ['<code>new VideoCapture(0)</code>', '카메라 0번 열기', '노트북 내장 카메라가 보통 0'],
            ['<code>new VideoCapture("a.mp4")</code>', '동영상 파일 열기', '상대 경로는 실행 폴더 기준'],
            ['<code>IsOpened()</code>', '열렸는지', '<b>반드시 확인</b>'],
            ['<code>FrameWidth</code> / <code>FrameHeight</code>', '해상도', '설정도 가능(카메라가 지원해야 함)'],
            ['<code>Fps</code>', '카메라 · 파일이 <b>보고한</b> FPS', '실제 처리 속도와 다르다'],
            ['<code>FrameCount</code>', '전체 프레임 수', '파일에서만 의미 있다'],
            ['<code>PosFrames</code>', '현재 위치(프레임 번호)', '대입하면 <b>되감기</b> (파일만)'],
            ['<code>Read(frame)</code>', '한 장 읽기', '성공 true / 실패 false'],
            ['<code>Release()</code> · <code>Dispose()</code>', '장치 놓아 주기', '<code>using var</code> 면 자동']
          ], caption: '표 1. VideoCapture 의 주요 속성 — Python 의 cap.get(cv2.CAP_PROP_FPS) 가 C# 에서는 cap.Fps' },
          { type: 'h', text: '프레임마다 처리하기' },
          { type: 'code', title: '예제 2: Gray → Canny → 프레임 번호 오버레이 → 한 장 저장', code: EX_PROC,
            desc: '<b>버퍼(Mat)를 루프 밖에서 한 번만 만드는 것</b>이 핵심입니다 — 초당 30번 <code>new Mat()</code> 을 하면 할당과 GC 로 느려집니다. <code>Cv2.PutText</code> 로 프레임 번호를 얹으면 어떤 프레임을 보고 있는지 확인하기 좋습니다. <code>Cv2.ImWrite("snap30.png", edges)</code> 로 저장한 파일은 왼쪽 <b>📁 작업 폴더</b>에서 내려받을 수 있습니다. 현장에서는 이렇게 <b>NG 프레임만 저장</b>해 두고 나중에 분석합니다.',
            expect: '60프레임 처리\n30번 프레임 에지 픽셀 3646개 → snap30.png 저장' },
          { type: 'callout', kind: 'tip', title: 'WaitKey 의 숫자는 무슨 뜻인가', html: '<ul><li><code>Cv2.WaitKey(0)</code> — 키를 누를 때까지 <b>무한 대기</b>. 사진 한 장 보여 줄 때.</li><li><code>Cv2.WaitKey(30)</code> — <b>30 ms 기다리면서</b> 창을 그리고 키를 확인. 초당 약 33프레임 재생 속도. 동영상 <b>재생</b>에 적당합니다.</li><li><code>Cv2.WaitKey(1)</code> — 1 ms 만 쉼. <b>가능한 한 빠르게</b> 돌릴 때(실시간 검사). 이 사이트의 예제는 3초 제한이 있으므로 <code>WaitKey(1)</code> 을 씁니다.</li><li>반환값은 눌린 키의 코드입니다: <b>ESC = 27</b>, <code>&#39;q&#39;</code> = 113, 아무 키도 안 눌리면 −1.</li><li>키가 여러 바이트로 올 수 있으므로 실무에서는 <code>(Cv2.WaitKey(30) &amp; 0xFF) == 27</code> 처럼 쓰기도 합니다.</li></ul>' },
          { type: 'code', title: '예제 3: Stopwatch 로 실제 처리 FPS 재기', code: EX_FPS, nondeterministic: true,
            desc: '<code>cap.Fps</code> 는 카메라가 <b>스스로 보고한</b> 값이고, 실제로 내 프로그램이 처리한 속도는 다릅니다. <code>Stopwatch</code> 로 전체 시간을 재서 <code>프레임 수 / 초</code> 를 계산하세요. 검사 장비에서는 <b>라인 속도 × 필요한 검사 간격</b>보다 처리 FPS 가 높아야 합니다. 처리가 느리면 ① 처리 해상도를 줄이고(<code>Cv2.Resize</code>) ② ROI 만 보고 ③ 무거운 연산을 몇 프레임에 한 번만 합니다.<br><span class="chip">실행할 때마다 시간이 달라지므로 출력값은 고정되지 않습니다.</span>' },
          { type: 'h', text: '동영상 파일 열기' },
          { type: 'code', title: '예제 4: 파일 경로로 열고 되감기', code: EX_FILE,
            desc: '카메라 번호 대신 <b>경로 문자열</b>을 넣으면 동영상 파일이 열립니다 (이 실습 환경에서는 컨베이어 영상 20프레임이 열립니다). 파일에서는 <code>FrameCount</code> 와 <code>PosFrames</code> 가 의미 있어서 <b>되감기 · 특정 프레임으로 점프</b>가 가능합니다. 실제 웹캠에서는 되감기가 불가능하다는 점을 기억하세요. <b>알고리즘 개발은 녹화된 파일로</b> 하고(재현 가능!), 완성한 뒤 카메라로 바꾸는 것이 실무의 정석입니다.',
            expect: '640 x 480, 30 fps, 전체 20프레임\n재생 시간 = 0.67초\n읽은 프레임 20개, 현재 위치 PosFrames = 20\n되감은 뒤 첫 프레임 평균 밝기 103.14' },
          { type: 'h', text: '녹화: VideoWriter' },
          { type: 'code', title: '추가: VideoWriter 로 영상 저장하기', code: EX_WRITER, run: false, local: true, file: 'Program.cs',
            desc: '<code>VideoWriter</code> 는 <b>파일 이름 · 코덱(FourCC) · FPS · 프레임 크기</b> 네 가지로 만듭니다. 크기가 <b>실제 프레임과 다르면 파일이 비어</b> 버리니 <code>cap.FrameWidth/Height</code> 를 그대로 쓰세요. 코덱은 Windows 에서 <code>MJPG</code>(.avi)가 가장 무난하고, <code>mp4v</code>(.mp4)도 많이 씁니다. 브라우저 실습 환경에서는 실제 파일로 저장되지 않으므로 <b>🖥 Visual Studio 에서 실행</b>하세요.' },
          { type: 'callout', kind: 'field', title: '현장 노트 — 카메라를 다룰 때 실제로 겪는 것들', html: '<ul><li><b>"카메라를 열 수 없습니다"</b>: ① 다른 프로그램(줌 · 팀즈)이 쓰고 있다 ② 이전 실행이 <code>Release</code> 없이 죽었다 ③ Windows 개인 정보 설정에서 카메라 접근이 꺼져 있다 — 이 순서로 확인합니다.</li><li><b>백엔드</b>: Windows 에서는 <code>new VideoCapture(0, VideoCaptureAPIs.DSHOW)</code> 가 기본(ANY)보다 훨씬 빨리 열립니다. 완성 프로젝트 <code>Ch15_Camera</code> 도 DSHOW 를 먼저 시도하고 실패하면 기본으로 재시도합니다.</li><li><b>버퍼 지연</b>: 카메라가 프레임을 버퍼에 쌓아 두면 화면이 <b>몇 프레임 늦게</b> 보입니다. <code>cap.Set(VideoCaptureProperties.BufferSize, 1)</code> 로 줄이거나, 처리를 빠르게 해 버퍼가 쌓이지 않게 합니다.</li><li><b>산업용 카메라</b>(GigE · USB3 Vision)는 보통 제조사 SDK 로 프레임을 받아 <code>Mat</code> 으로 감싸서 씁니다. <code>VideoCapture</code> 이후의 코드는 완전히 같습니다.</li><li><b>개발은 파일로</b>: 현장에서 문제 장면을 녹화해 두면 사무실에서 몇 번이고 같은 조건으로 디버깅할 수 있습니다. 이것이 <code>VideoWriter</code> 의 진짜 쓸모입니다.</li></ul>' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: 'WPF 에서는 <code>Cv2.ImShow</code> 를 쓰지 않고 <code>Image.Source</code> 에 <code>BitmapSource</code> 를 넣습니다(2차시). 그런데 카메라 루프를 UI 스레드에서 돌리면 <b>창이 얼어붙습니다</b>. 그래서 <code>Task.Run</code> 으로 백그라운드에서 읽고 <code>Dispatcher.Invoke</code> 로 화면만 갱신합니다 — 2교시에서 완성 프로젝트 <code>Ch15_Camera</code> 의 코드를 읽으며 자세히 다룹니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<ul><li>수업 전 교사 PC 에 웹캠을 연결해 <code>Ch15_Camera</code> 를 한 번 띄워 보세요. 브라우저는 시뮬레이션이므로 <b>실물 시연</b>이 학생의 이해를 크게 높입니다.</li><li><b>오개념 1</b>: "<code>ImShow</code> 가 그린다" → 실제 그리기는 <code>WaitKey</code> 안에서 일어납니다. <code>WaitKey</code> 를 지우고 실행해 보여 주세요.</li><li><b>오개념 2</b>: "<code>cap.Fps</code> 가 내 프로그램 속도" → 카메라가 보고한 값일 뿐. <code>Stopwatch</code> 로 잰 값과 비교시킵니다.</li><li><b>오개념 3</b>: 프레임마다 <code>new Mat()</code>. 메모리 그래프를 언급하며 버퍼 재사용을 강조하세요.</li><li>💬 발문: “실제 웹캠이라면 이 <code>while</code> 은 언제 끝날까?” — 끝나지 않는다 → 종료 장치의 필요성. “ESC 말고 어떤 종료 조건이 있을까?” — 버튼 · 시간 · 검사 완료 신호.</li><li>시간 관리: 예제 1~2 를 충분히, 예제 3(FPS)은 시연, 예제 4(파일)는 빠르게. VideoWriter 는 읽기만 해도 됩니다.</li></ul>' }
        ],
        practice: [
          {
            title: '프레임 5장마다 밝기 기록하기', level: 1,
            desc: '카메라 0을 열고 <b>5프레임마다</b> 프레임 번호 · 평균 밝기(소수 둘째 자리) · 에지 픽셀 수를 출력하세요. 에지는 <code>Cv2.Canny(gray, edges, 60, 150)</code> 로 구합니다. 마지막에 총 프레임 수를 출력하고 <code>Release</code> 하세요.',
            hint: '<code>if (n % 5 == 0)</code> 로 5프레임마다 출력합니다. 평균 밝기는 <code>Cv2.Mean(gray).Val0</code>, 에지 픽셀 수는 <code>Cv2.CountNonZero(edges)</code>. 버퍼 <code>gray</code> · <code>edges</code> 는 루프 밖에서 한 번만 만드세요. 20프레임 주기로 같은 값이 반복되는 이유도 생각해 보세요(시뮬레이션 카메라가 20프레임짜리 영상을 3번 돌립니다).',
            expect: '  f 5: 평균 103.06, 에지 2730\n  f10: 평균 103.41, 에지 2763\n  f15: 평균 103.31, 에지 2905\n  f20: 평균 102.74, 에지 2716\n  f25: 평균 103.06, 에지 2730\n  f30: 평균 103.41, 에지 2763\n  f35: 평균 103.31, 에지 2905\n  f40: 평균 102.74, 에지 2716\n  f45: 평균 103.06, 에지 2730\n  f50: 평균 103.41, 에지 2763\n  f55: 평균 103.31, 에지 2905\n  f60: 평균 102.74, 에지 2716\n총 60프레임',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture(0);
        if (!cap.IsOpened()) { Console.WriteLine("카메라를 열 수 없습니다."); return; }

        using var frame = new Mat();
        using var gray = new Mat();
        using var edges = new Mat();
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            // TODO: Canny 로 에지를 구하세요 (60, 150)

            // TODO: 5프레임마다 "  f 5: 평균 102.68, 에지 3628" 형식으로 출력하세요
            //       (프레임 번호는 {n,2}, 평균은 F2)

            Cv2.ImShow("camera", frame);
            if (Cv2.WaitKey(1) == 27) break;
        }
        // TODO: 총 프레임 수를 출력하고 Release 하세요
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture(0);
        if (!cap.IsOpened()) { Console.WriteLine("카메라를 열 수 없습니다."); return; }

        using var frame = new Mat();
        using var gray = new Mat();
        using var edges = new Mat();
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.Canny(gray, edges, 60, 150);
            if (n % 5 == 0)
                Console.WriteLine($"  f{n,2}: 평균 {Cv2.Mean(gray).Val0:F2}, 에지 {Cv2.CountNonZero(edges)}");
            Cv2.ImShow("camera", frame);
            Cv2.ImShow("edges", edges);
            if (Cv2.WaitKey(1) == 27) break;
        }
        Console.WriteLine($"총 {n}프레임");
        cap.Release();
    }
}`
          },
          {
            title: '가장 밝은 프레임 찾아 저장하기', level: 2,
            desc: '동영상 <code>videos/conveyor.mp4</code> 를 읽으며 <b>평균 밝기가 가장 큰 프레임</b>과 <b>가장 작은 프레임</b>의 번호 · 밝기를 찾아 출력하세요. 그리고 가장 밝은 프레임을 <code>Cv2.ImWrite("brightest.png", …)</code> 로 저장하세요. 프레임을 보관하려면 <b><code>Clone()</code></b> 이 필요합니다 — <code>Read</code> 는 같은 Mat 을 덮어쓰기 때문입니다.',
            hint: '<code>Mat best = null;</code> 을 두고 최대값을 갱신할 때 <code>best?.Dispose(); best = frame.Clone();</code> 로 복사해 둡니다. <code>frame</code> 을 그대로 대입하면 <b>마지막 프레임</b>이 저장됩니다 — 이것이 영상 처리의 대표적인 함정입니다.',
            expect: '가장 밝은 프레임: 2번 (103.63)\n가장 어두운 프레임: 13번 (102.66)\nbrightest.png 저장 완료 (640x480)',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat();
        using var gray = new Mat();
        Mat best = null;
        double maxMean = -1, minMean = 999;
        int maxAt = 0, minAt = 0, n = 0;

        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            double mean = Cv2.Mean(gray).Val0;
            // TODO: 최대 · 최소 평균 밝기와 그 프레임 번호를 갱신하세요
            // TODO: 최대일 때는 best 에 frame.Clone() 을 보관하세요 (이전 것은 Dispose)
        }

        // TODO: 결과를 출력하고 best 를 brightest.png 로 저장하세요
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat();
        using var gray = new Mat();
        Mat best = null;
        double maxMean = -1, minMean = 999;
        int maxAt = 0, minAt = 0, n = 0;

        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            double mean = Cv2.Mean(gray).Val0;
            if (mean > maxMean)
            {
                maxMean = mean; maxAt = n;
                best?.Dispose();
                best = frame.Clone();      // Read 가 frame 을 덮어쓰므로 복사!
            }
            if (mean < minMean) { minMean = mean; minAt = n; }
        }

        Console.WriteLine($"가장 밝은 프레임: {maxAt}번 ({maxMean:F2})");
        Console.WriteLine($"가장 어두운 프레임: {minAt}번 ({minMean:F2})");
        Cv2.ImWrite("brightest.png", best);
        Console.WriteLine($"brightest.png 저장 완료 ({best.Width}x{best.Height})");
        Cv2.ImShow("brightest", best);
        best.Dispose();
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '동영상과 카메라: VideoCapture', subtitle: '프레임 루프 · 실시간 처리 · FPS · 안전한 종료', notes: '<p>💬 “지금까지 다룬 것은 사진 한 장이었습니다. 컨베이어가 돌아가는 공장에서는 무엇이 달라질까요?” — 시간 제한, 같은 물체를 여러 번 본다, 한 번만 세야 한다. 오늘부터 <b>시간</b>이 들어온다고 선언하며 시작합니다. (3분)</p>' },
          { layout: 'diagram', title: '카메라 프로그램의 골격', html: FIG_LOOP, caption: '열기 → IsOpened 확인 → (Read → 처리 → ImShow → WaitKey) 반복 → Release', notes: '<p>이 그림 하나가 15차시의 전부라고 말해 줍니다. 네 군데를 짚습니다: ① <code>IsOpened</code> 확인은 습관 ② <code>Read</code> 가 false 면 끝 ③ <code>WaitKey</code> 가 <b>그리기 + 키 확인</b> 두 일을 한다 ④ <code>Release</code> 로 장치를 놓아 준다. (7분)</p>' },
          { layout: 'code', title: '카메라 열고 속성 읽기', code: `using System;
using OpenCvSharp;
class Program
{
    static void Main()
    {
        using var cap = new VideoCapture(0);
        if (!cap.IsOpened()) { Console.WriteLine("카메라를 열 수 없습니다."); return; }
        Console.WriteLine($"{cap.FrameWidth} x {cap.FrameHeight}, {cap.Fps} fps");

        using var frame = new Mat();
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.ImShow("camera", frame);
            if (Cv2.WaitKey(1) == 27) break;   // ESC = 27
        }
        Console.WriteLine($"총 {n}프레임");
        cap.Release();
    }
}`, points: ['<code>IsOpened()</code> 확인은 <b>습관</b>으로', '프레임은 <b>3채널 BGR</b> (CV_8UC3)', '브라우저에서는 60프레임 뒤 <code>Read</code> 가 false', '실제 웹캠은 안 끝난다 → <b>ESC 종료 필수</b>'], notes: '<p>실행해서 이미지 창이 움직이는 것을 보여 줍니다. 💬 “실제 웹캠이면 이 while 은 언제 끝날까요?” — 끝나지 않는다. 이 지점에서 브라우저 시뮬레이션 안내(60프레임)를 다시 설명하고, <b>같은 코드가 Visual Studio 에서는 진짜 카메라</b>라는 점을 강조합니다. (8분)</p>' },
          { layout: 'table', title: 'VideoCapture 주요 속성', head: ['이름', '뜻', '비고'], rows: [
            ['<code>VideoCapture(0)</code>', '카메라 0번', '노트북 내장이 보통 0'],
            ['<code>VideoCapture("a.mp4")</code>', '동영상 파일', '실행 폴더 기준 경로'],
            ['<code>IsOpened()</code>', '열렸는지', '반드시 확인'],
            ['<code>FrameWidth/Height</code>', '해상도', '설정도 가능'],
            ['<code>Fps</code>', '장치가 <b>보고한</b> FPS', '실제 처리 속도 아님'],
            ['<code>FrameCount</code> · <code>PosFrames</code>', '전체 · 현재 위치', '<b>파일에서만</b> 의미'],
            ['<code>Release()</code>', '장치 놓아 주기', '<code>using var</code> 면 자동']
          ], notes: '<p>Python 의 <code>cap.get(cv2.CAP_PROP_FPS)</code> 가 C# 에서는 <code>cap.Fps</code> 로 <b>속성</b>이 되었다는 점을 알려 줍니다(OpenCvSharp 의 편의 기능). <code>PosFrames</code> 에 값을 넣으면 되감기가 된다는 것은 “파일만” 이라는 단서와 함께. (4분)</p>' },
          { layout: 'code', title: '프레임마다 처리하기', code: `using System;
using OpenCvSharp;
class Program
{
    static void Main()
    {
        using var cap = new VideoCapture(0);
        using var frame = new Mat();
        using var gray = new Mat();
        using var edges = new Mat();    // 버퍼는 루프 밖에서!
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.Canny(gray, edges, 60, 150);
            Cv2.PutText(edges, $"frame {n}", new Point(12, 34), HersheyFonts.HersheySimplex, 0.9, Scalar.White, 2);
            Cv2.ImShow("edges", edges);
            if (n == 30) Cv2.ImWrite("snap30.png", edges);
            if (Cv2.WaitKey(1) == 27) break;
        }
        Console.WriteLine($"{n}프레임 처리");
    }
}`, points: ['버퍼 <code>Mat</code> 은 <b>루프 밖에서 한 번만</b> (GC 부담 ↓)', '<code>PutText</code> 로 프레임 번호를 얹으면 디버깅이 쉽다', '<code>ImWrite</code> → 📁 작업 폴더에 저장 (NG 프레임 보관)'], notes: '<p>프레임 번호가 화면에서 올라가는 것을 보여 줍니다. 💬 “왜 Mat 을 루프 밖에서 만들까?” — 초당 30번 new. 실무에서는 <b>NG 판정 프레임만</b> 저장해 두는 패턴이 흔하다고 알려 주세요. 저장된 파일을 📁 작업 폴더에서 열어 보게 합니다. (8분)</p>' },
          { layout: 'bullets', title: 'WaitKey 의 숫자', lead: '카메라 루프에서 가장 많이 틀리는 곳', bullets: [
            '<code>WaitKey(0)</code> — 키를 누를 때까지 <b>무한 대기</b> (사진 한 장)',
            '<code>WaitKey(30)</code> — 30 ms 쉬며 그리기 + 키 확인 → 약 33 fps <b>재생</b>',
            '<code>WaitKey(1)</code> — 1 ms 만 쉼 → <b>최대한 빠르게</b> (실시간 검사)',
            '반환값 = 눌린 키 코드. <b>ESC = 27</b>, 아무 키도 없으면 −1',
            ['<b>WaitKey 를 빼면?</b>', ['창이 안 뜨거나 멈춘 것처럼 보인다 — <code>ImShow</code> 는 등록만 하고 실제 그리기는 <code>WaitKey</code> 안에서 일어나기 때문']]
          ], notes: '<p>실제로 <code>WaitKey</code> 를 주석 처리하고 실행해 보여 주는 것이 가장 강력합니다. 💬 “<code>WaitKey(1000)</code> 으로 하면?” — 초당 1프레임, 아주 느린 재생. 이 사이트는 3초 제한이 있으니 예제는 <code>WaitKey(1)</code> 을 쓴다고 안내합니다. (5분)</p>' },
          { layout: 'code', title: '실제 처리 FPS 재기 (Stopwatch)', code: `using System;
using System.Diagnostics;
using OpenCvSharp;
class Program
{
    static void Main()
    {
        using var cap = new VideoCapture(0);
        using var frame = new Mat();
        using var gray = new Mat();
        var sw = Stopwatch.StartNew();
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.ImShow("camera", gray);
            if (Cv2.WaitKey(1) == 27) break;
        }
        sw.Stop();
        double sec = sw.ElapsedMilliseconds / 1000.0;
        Console.WriteLine($"{n}프레임 / {sec:F2}초 = {n / Math.Max(0.001, sec):F1} FPS");
    }
}`, run: true, points: ['<code>cap.Fps</code> = 장치가 보고한 값 ≠ 내 프로그램 속도', '처리가 느리면: 해상도 ↓ · ROI · 몇 프레임에 한 번', '실행할 때마다 값이 달라진다 (시간 측정)'], notes: '<p>두 번 실행해 값이 달라지는 것을 보여 주고, “시간 값은 <code>expect</code> 에 넣지 않는다” 는 원칙을 알려 줍니다. 💬 “라인 속도가 1초에 부품 10개라면 몇 FPS 가 필요할까?” — 부품당 최소 2~3프레임은 봐야 하므로 30 FPS 이상. (6분)</p>' },
          { layout: 'code', title: '동영상 파일 열고 되감기', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        if (!cap.IsOpened()) { Console.WriteLine("열 수 없습니다."); return; }
        Console.WriteLine($"{cap.FrameCount}프레임, {cap.Fps} fps, " +
                          $"{cap.FrameCount / cap.Fps:F2}초");

        using var frame = new Mat();
        int n = 0;
        while (cap.Read(frame)) n++;
        Console.WriteLine($"읽은 프레임 {n}, PosFrames = {cap.PosFrames}");

        cap.PosFrames = 0;                  // 되감기 (파일에서만!)
        cap.Read(frame);
        Console.WriteLine($"첫 프레임 평균 {Cv2.Mean(frame).Val0:F2}");
        Cv2.ImShow("frame 0", frame);
    }
}`, points: ['카메라 번호 대신 <b>경로 문자열</b>', '파일은 <code>FrameCount</code> · <code>PosFrames</code> 가 의미 있다', '<b>알고리즘 개발은 녹화 파일로</b> — 재현 가능!'], notes: '<p>실무 조언을 강조합니다: 현장에서 문제 장면을 녹화해 두고 사무실에서 같은 조건으로 몇 번이고 디버깅한다. 💬 “웹캠도 되감을 수 있을까?” — 불가능. 그래서 <code>VideoWriter</code> 로 녹화해 둔다. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>Cv2.WaitKey(30)</code> 이 카메라 루프에서 하는 일 두 가지는?', options: ['영상 저장과 화면 지우기', '창을 실제로 그리고(이벤트 처리) 키 입력을 받는다', '프레임을 버퍼에 채운다', 'FPS 를 계산한다'], answer: 1, explain: '<code>ImShow</code> 는 등록만 하고 <b>실제 그리기는 <code>WaitKey</code> 안</b>에서 일어납니다. 동시에 눌린 키 코드를 돌려줍니다 (ESC = 27).', notes: '<p>정답 2번. 틀린 학생에게는 <code>WaitKey</code> 를 지운 코드를 실행시켜 직접 확인하게 하세요.</p>' },
          { layout: 'practice', title: '실습: 가장 밝은 프레임 저장하기', desc: '<p><code>videos/conveyor.mp4</code> 를 읽으며 평균 밝기가 가장 큰/작은 프레임 번호를 찾고, 가장 밝은 프레임을 <code>brightest.png</code> 로 저장하세요.</p><ul><li>⚠️ <code>Read</code> 는 같은 Mat 을 <b>덮어씁니다</b> → 보관하려면 <code>frame.Clone()</code></li><li>정답: 최대 2번(103.63) · 최소 13번(102.66)</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat();
        using var gray = new Mat();
        Mat best = null;
        double maxMean = -1;
        int maxAt = 0, n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            // TODO: 최대 평균 밝기를 갱신하고 best = frame.Clone() 으로 보관
        }
        // TODO: 결과 출력 + ImWrite
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat();
        using var gray = new Mat();
        Mat best = null;
        double maxMean = -1;
        int maxAt = 0, n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            double mean = Cv2.Mean(gray).Val0;
            if (mean > maxMean) { maxMean = mean; maxAt = n; best?.Dispose(); best = frame.Clone(); }
        }
        Console.WriteLine($"가장 밝은 프레임 {maxAt}번 ({maxMean:F2})");
        Cv2.ImWrite("brightest.png", best);
        best.Dispose();
    }
}`, notes: '<p>핵심 함정은 <code>best = frame;</code> 입니다 — 참조만 복사되어 <b>마지막 프레임</b>이 저장됩니다. 일부러 그렇게 짜서 실행해 보여 준 뒤 <code>Clone()</code> 으로 고치면 오래 기억에 남습니다. 💬 “왜 마지막 프레임이 나왔을까?” (10분)</p>' },
          { layout: 'summary', title: '1교시 정리', bullets: ['<code>VideoCapture(0)</code> = 카메라 · <code>VideoCapture("a.mp4")</code> = 파일, 그 뒤 코드는 같다', '<code>IsOpened()</code> 확인 → <code>while (cap.Read(frame))</code> → 처리 → <code>ImShow</code> → <code>WaitKey</code>', '<code>WaitKey</code> 가 <b>그리기 + 키 확인</b>. ESC = <b>27</b>, 실제 카메라는 종료 장치가 필수', '버퍼 <code>Mat</code> 은 루프 <b>밖에서</b> 한 번만 만들어 재사용', '프레임을 보관하려면 <code>Clone()</code> — <code>Read</code> 는 덮어쓴다', '끝나면 <code>Release()</code> (<code>using var</code> 면 자동)', '다음: 프레임 사이의 <b>변화</b>로 움직이는 물체를 찾고, 한 번만 센다'], notes: '<p>일곱 줄을 정리합니다. 2교시 예고 질문: “컨베이어 위 부품이 매 프레임 4~5개씩 보이는데, 전체로는 몇 개가 지나간 걸까?” — 한 번만 세는 문제를 숙제처럼 던져 두세요. (3분)</p>' }
        ]
      },
      {
        id: 'cs15-2', title: '움직임 검출과 라인 통과 카운트', minutes: 50,
        goals: ['Absdiff · MOG2 로 전경(움직이는 부분)을 얻을 수 있다', '모폴로지 + 윤곽선으로 움직이는 물체의 개수와 사각형을 구할 수 있다', '배경이 움직이는 영상에서 두 방법의 한계를 설명하고 대안을 고를 수 있다', '기준선 통과 방식으로 지나가는 부품을 한 번만 셀 수 있다', 'WPF 에서 카메라를 Task.Run + Dispatcher.Invoke 로 다루는 구조를 설명할 수 있다'],
        flow: [['도입: 무엇이 움직였나', 5], ['Absdiff · MOG2 · 모폴로지', 15], ['부품 검출 · 라인 통과 카운트', 20], ['WPF 구조 · 정리', 10]],
        content: [
          { type: 'h', text: '움직인 곳 = 프레임 사이에 달라진 곳' },
          { type: 'p', html: '카메라가 고정되어 있다면 <b>배경은 그대로</b>이고 움직인 물체가 있는 곳만 픽셀 값이 바뀝니다. 가장 단순한 방법은 <b>이전 프레임과의 절대 차이</b>(<code>Cv2.Absdiff</code>)를 구해 임계값을 넘는 곳을 찾는 것입니다. 더 똑똑한 방법은 <b>배경 모델</b>을 학습해 두고 거기서 벗어난 픽셀을 전경으로 보는 <code>BackgroundSubtractorMOG2</code> 입니다.' },
          { type: 'figure', html: FIG_MOTION, caption: '그림 2. 움직임 검출 파이프라인 — 차이/배경 차분 → 이진화 · 모폴로지 → 윤곽선 → 라인 통과 카운트' },
          { type: 'h', text: '오늘의 영상: 컨베이어' },
          { type: 'image', src: 'images/conveyor_00.png', caption: '컨베이어 프레임 0 — 벨트가 프레임당 +36 px 이동, 부품(와셔) 12개가 왼쪽에서 오른쪽으로 흐른다. NG 부품: #2 구멍 없음 · #5 균열 · #8 깨짐', width: 460 },
          { type: 'code', title: '예제 1: 두 프레임의 차이 (Absdiff)', code: EX_DIFF,
            desc: '<code>prev</code> 에 직전 프레임을 보관해 두고 <code>Cv2.Absdiff</code> 로 차이를 구합니다. <code>gray.CopyTo(prev)</code> 로 <b>복사</b>하는 것이 중요합니다 — <code>prev = gray;</code> 라고 쓰면 같은 Mat 을 가리켜 차이가 항상 0 이 됩니다. 결과를 보면 변화 픽셀이 <b>전체의 6~7%</b> 나 됩니다. 부품만 움직인 게 아니라 <b>벨트 무늬 전체</b>가 36 px 씩 흘렀기 때문입니다.',
            expect: '  프레임  2: 변화 픽셀  21053개 (6.9%)\n  프레임  3: 변화 픽셀  21157개 (6.9%)\n  프레임  4: 변화 픽셀  19651개 (6.4%)\n  프레임 20: 변화 픽셀  20099개 (6.5%)\n총 20프레임 (벨트가 프레임당 36px 이동하므로 벨트 무늬도 변화로 잡힌다)' },
          { type: 'code', title: '예제 2: BackgroundSubtractorMOG2 + 모폴로지 열기 + 윤곽선', code: EX_MOG2,
            desc: 'MOG2 는 픽셀마다 밝기 분포를 <b>가우시안 혼합 모델</b>로 학습해 배경을 기억합니다. <code>Apply(frame, fg)</code> 는 전경 마스크를 만들면서 동시에 배경 모델을 갱신합니다 (0 = 배경, 127 = 그림자, 255 = 전경). <code>MorphologyEx(Open)</code> 으로 점 잡음을 지웁니다. 그런데 결과를 보면 프레임당 큰 덩어리가 <b>1~5개로 들쭉날쭉</b>합니다 — 부품 12개가 흐르는데도 말이죠. 왜 그럴까요?',
            expect: '  프레임 17: 흰 픽셀  3778, 윤곽 24개, 면적>200 인 것 5개\n  프레임 18: 흰 픽셀  2439, 윤곽 29개, 면적>200 인 것 2개\n  프레임 19: 흰 픽셀  2729, 윤곽 19개, 면적>200 인 것 1개\n  프레임 20: 흰 픽셀  2806, 윤곽 28개, 면적>200 인 것 1개\n총 20프레임\n' },
          { type: 'callout', kind: 'warn', title: '⚠️ Absdiff 도 MOG2 도 "배경은 정지" 를 가정한다', html: '두 방법 모두 <b>카메라와 배경이 고정</b>되어 있다는 전제 위에 있습니다. 컨베이어 영상에서는 <b>벨트 자체가 프레임당 36 px 움직이므로</b> 그 가정이 깨집니다. 그래서 ① 벨트 무늬가 전경으로 잡히고 ② 부품은 앞뒤 테두리만 남거나 배경으로 학습되어 사라집니다.<br>이럴 때 알고리즘 파라미터를 붙들고 씨름하기보다 <b>영상의 다른 성질</b>을 보는 것이 빠릅니다 — 이 영상에서 부품은 <b>벨트보다 확실히 밝습니다</b>. 밝기 임계값 하나로 훨씬 안정적인 결과가 나옵니다(예제 3). <b>"알고리즘보다 영상을 먼저 보라"</b> 가 현장의 첫 번째 규칙입니다.' },
          { type: 'code', title: '예제 3: 밝기 임계값으로 부품 검출 (이 영상에 맞는 방법)', code: EX_PARTS,
            desc: '<code>Threshold(gray, bin, 150, 255, Binary)</code> 한 줄로 밝은 부품만 남기고, <code>Open</code> 으로 잡음을 지운 뒤 <code>FindContours</code> + 면적 필터(1200 이상)로 부품을 찾습니다. 프레임마다 <b>4~5개</b>가 안정적으로 잡히고, 중심 좌표도 IMAGES.md 의 정답과 거의 일치합니다(프레임 1: 132 · 289 · 440 · 584 ↔ 정답 132 · 290 · 440 · 585). 와셔 면적은 π(34² − 14²) ≈ 3016 px² 이므로 1200 은 <b>반쯤 잘린 부품까지</b> 잡는 넉넉한 값입니다.',
            expect: '  프레임  1: 부품 4개  (132,217) (289,240) (440,257) (584,224)\n  프레임  2: 부품 5개  (32,218) (168,217) (325,240) (476,257) (613,224)\n  프레임  3: 부품 4개  (66,218) (204,217) (361,240) (512,257)\n  프레임 20: 부품 4개  (79,257) (219,220) (367,236) (527,238)' },
          { type: 'h', text: '한 번만 세기: 기준선 통과 카운트' },
          { type: 'p', html: '프레임마다 4~5개가 보이므로 <b>그냥 더하면 90개</b>가 됩니다. 실제로 지나간 부품 수를 알려면 <b>같은 부품을 여러 번 세지 않는</b> 장치가 필요합니다. 가장 널리 쓰이는 방법이 <b>가상의 기준선(counting line)</b> 입니다: 화면 가운데 세로선을 하나 긋고, 어떤 부품의 중심이 <b>이전 프레임에는 선 왼쪽, 이번 프레임에는 선 오른쪽</b>일 때만 1 을 더합니다.' },
          { type: 'p', html: '이를 위해 <b>아주 간단한 추적</b>이 필요합니다: 이번 프레임의 중심마다, 이전 프레임의 중심 중 <b>높이(y)가 비슷하고 x 가 10~60 px 왼쪽</b>인 것을 같은 부품으로 봅니다. 벨트가 프레임당 36 px 움직이므로 이 범위면 충분합니다.' },
          { type: 'code', title: '예제 4: 기준선 x=320 통과 카운트 → 정답 5개', code: EX_COUNT,
            desc: '누적 카운트가 프레임 2 · 7 · 11 · 15 · 19 에서 하나씩 올라 <b>최종 5개</b>가 됩니다. IMAGES.md 의 부품 위치로 검산해 보면 20프레임 동안 x=320 을 넘는 부품은 <b>#2 · #3 · #4 · #5 · #6</b> 정확히 5개입니다 (#0 · #1 은 이미 지나갔고, #7 · #8 은 아직 도착 전). 매칭 조건(<code>Math.Abs(p.Y - c.Y) &lt; 30</code>, <code>10 &lt; c.X - p.X &lt; 60</code>)은 <b>벨트 속도를 알고 있기에</b> 쓸 수 있는 단순한 추적입니다 — 실무에서는 이렇게 <b>공정 지식을 코드에 넣는 것</b>이 복잡한 추적 알고리즘보다 훨씬 튼튼합니다.',
            expect: '프레임  1: 부품 4개  x = 133 290 441 585   누적 0\n프레임  2: 부품 5개  x = 32 169 326 477 614   누적 1\n프레임  3: 부품 4개  x = 67 205 362 513   누적 1\n프레임  4: 부품 4개  x = 103 241 398 548   누적 1\n프레임  5: 부품 4개  x = 139 277 434 584   누적 1\n프레임  6: 부품 5개  x = 28 175 313 470 614   누적 1\n프레임  7: 부품 4개  x = 59 211 349 506   누적 2\n프레임  8: 부품 4개  x = 95 247 385 542   누적 2\n프레임  9: 부품 4개  x = 131 283 421 578   누적 2\n프레임 10: 부품 5개  x = 21 167 319 457 610   누적 2\n프레임 11: 부품 4개  x = 44 204 355 493   누적 3\n프레임 12: 부품 4개  x = 80 240 391 529   누적 3\n프레임 13: 부품 4개  x = 116 276 427 564   누적 3\n프레임 14: 부품 5개  x = 19 152 312 463 600   누적 3\n프레임 15: 부품 5개  x = 40 188 348 499 622   누적 4\n프레임 16: 부품 4개  x = 76 224 384 535   누적 4\n프레임 17: 부품 4개  x = 112 260 419 571   누적 4\n프레임 18: 부품 5개  x = 20 148 296 455 607   누적 4\n프레임 19: 부품 5개  x = 43 184 332 491 625   누적 5\n프레임 20: 부품 4개  x = 79 220 368 527   누적 5\n기준선 x=320 를 통과한 부품 = 5개' },
          { type: 'callout', kind: 'field', title: '현장 노트 — 지나가는 물체를 세는 실전 요령', html: '<ul><li><b>기준선은 화면 가운데</b>에 둡니다. 가장자리에 두면 부품이 잘린 상태로 검출되어 중심이 튑니다.</li><li><b>양방향 카운트</b>가 필요하면 방향도 함께 기록합니다(들어온 것 · 나간 것). 사람 수 세기(입장/퇴장)가 대표적입니다.</li><li><b>검사는 기준선에서</b>: 부품 중심이 기준선에 가장 가까운 프레임이 가장 선명하고 잘리지 않은 프레임입니다. 그 프레임에서 OK/NG 판정을 하고 결과를 기록하세요.</li><li><b>트리거 신호</b>: 실제 장비는 포토센서나 엔코더가 "부품이 왔다" 는 신호를 주고, 그 순간에만 촬영·판정합니다. 영상만으로 세는 것은 신호가 없을 때의 대안입니다.</li><li><b>중복/누락 점검</b>: 카운트 결과를 실제 개수와 비교해 검증하세요. 벨트 속도가 빨라 부품이 프레임당 100 px 이상 움직이면 매칭 범위를 늘려야 합니다 (<b>노출 시간 · 프레임률</b>과 함께 설계).</li><li>더 정교한 추적이 필요하면 <code>Cv2.CalcOpticalFlowPyrLK</code>(광류)나 칼만 필터를 씁니다. 하지만 <b>공정 지식으로 풀 수 있으면 그게 최선</b>입니다.</li></ul>' },
          { type: 'h', text: 'WPF 에서 카메라 화면 만들기' },
          { type: 'p', html: '콘솔에서는 <code>Cv2.ImShow</code> 로 충분했지만, WPF 앱에서는 <code>Image.Source</code> 에 <code>BitmapSource</code> 를 넣어야 합니다. 문제는 <b>카메라 읽기가 시간이 걸린다</b>는 점입니다. UI 스레드에서 <code>cap.Read</code> 를 부르면 그동안 창이 얼어붙어 버튼도 안 눌립니다. 그래서 다음 두 규칙을 지킵니다.' },
          { type: 'list', ordered: true, items: [
            '<b>카메라 읽기와 영상 처리는 백그라운드 스레드에서</b> — <code>Task.Run(() =&gt; CaptureLoop(cap, token))</code>',
            '<b>화면 갱신(Image.Source · TextBlock.Text)은 UI 스레드에서</b> — <code>Dispatcher.Invoke(() =&gt; { … })</code>',
            '<b>멈출 때는 신호를 보내고 루프가 끝난 뒤에 Release</b> — <code>CancellationTokenSource.Cancel()</code> → <code>await _loopTask</code> → <code>Release()</code>'
          ] },
          { type: 'wpf', title: '완성 프로젝트: Ch15_Camera', project: 'Ch15_Camera',
            html: '웹캠 영상을 WPF <code>Image</code> 에 실시간으로 표시하는 완성 프로젝트입니다.<ul><li><b>화면</b>: 상단 <code>ToolBar</code>(카메라 번호 · 시작 · 정지 · 처리 옵션 · FPS), 가운데 <code>Image</code>, 하단 <code>StatusBar</code>(해상도 · 카메라 FPS)</li><li><b>처리 옵션</b> <code>ComboBox</code>: 원본 · 흑백 · Canny 에지 · 배경 차분(MOG2)</li><li><b>카메라 열기</b>: <code>new VideoCapture(index, VideoCaptureAPIs.DSHOW)</code> → 실패하면 기본 백엔드로 재시도 → 그래도 실패하면 <code>MessageBox</code> 안내</li><li><b>스레드</b>: <code>Task.Run</code> 으로 캡처 루프, <code>Dispatcher.Invoke</code> 로 화면 갱신, <code>Volatile.Read/Write</code> 로 모드 값 공유</li><li><b>종료</b>: <code>CancellationTokenSource</code> 로 루프를 멈추고 <code>await</code> 한 뒤 <code>Release()</code>. 창을 닫을 때도 정리가 끝날 때까지 <code>e.Cancel = true</code> 로 기다립니다.</li><li>NuGet: <code>OpenCvSharp4</code> · <code>OpenCvSharp4.runtime.win</code> · <code>OpenCvSharp4.WpfExtensions</code> (4.10.0)</li></ul>' },
          { type: 'code', title: 'MainWindow.xaml — 화면 구성', code: WPF_XAML, lang: 'xml', file: 'MainWindow.xaml', run: false,
            desc: '3행 <code>Grid</code>: <code>ToolBar</code>(Auto) · <code>Image</code>(*) · <code>StatusBar</code>(Auto). <code>Image</code> 의 <code>Stretch="Uniform"</code> 은 비율을 지키며 맞춰 줍니다. <code>Closing="Window_Closing"</code> 으로 창을 닫을 때 카메라를 정리할 기회를 얻습니다.' },
          { type: 'code', title: 'MainWindow.xaml.cs ① — 시작 버튼: 카메라 열고 루프 띄우기', code: WPF_START, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: 'Windows 에서는 <code>VideoCaptureAPIs.DSHOW</code> 백엔드가 기본(ANY)보다 빨리 열립니다. 실패하면 기본으로 한 번 더 시도하고, 그래도 안 되면 <code>MessageBox</code> 로 안내합니다. <code>CancellationTokenSource</code> 를 만들어 토큰을 루프에 넘기고, <code>Task.Run</code> 으로 <b>백그라운드</b> 캡처 루프를 시작합니다. 시작 직후 버튼 상태를 바꿔 <b>중복 시작</b>을 막는 것도 중요합니다.' },
          { type: 'code', title: 'MainWindow.xaml.cs ② — 백그라운드 캡처 루프', code: WPF_LOOP, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '루프의 구조는 1교시의 콘솔 코드와 <b>똑같습니다</b>: 버퍼를 밖에서 만들고, <code>cap.Read(frame)</code>, 모드에 따라 처리, 화면 갱신. 달라진 것은 세 가지뿐입니다. ① 종료 조건이 <code>WaitKey</code> 대신 <code>token.IsCancellationRequested</code> ② 화면 갱신이 <code>ImShow</code> 대신 <code>Dispatcher.Invoke</code> + <code>display.ToBitmapSource()</code> ③ 다른 스레드가 바꾸는 <code>_mode</code> 를 <code>Volatile.Read</code> 로 읽습니다.<br><code>Dispatcher.Invoke</code> 는 갱신이 <b>끝날 때까지 기다리므로</b> 다음 루프에서 <code>display</code> 를 덮어써도 안전합니다 (<code>BeginInvoke</code> 였다면 복사가 필요합니다).' },
          { type: 'code', title: 'MainWindow.xaml.cs ③ — 정지와 창 닫기: 순서가 중요하다', code: WPF_STOP, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '카메라 정리는 <b>순서</b>가 전부입니다: <code>Cancel()</code> 로 신호 → <code>await _loopTask</code> 로 루프가 실제로 끝나기를 기다림 → 그제야 <code>Release()</code>. 순서를 바꿔 루프가 도는 중에 <code>Release</code> 하면 <b>이미 해제된 카메라를 읽어</b> 예외가 납니다. 창을 닫을 때도 <code>e.Cancel = true</code> 로 닫기를 미루고, 정리가 끝난 뒤 <code>Close()</code> 를 다시 불러 안전하게 종료합니다.' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 에서 실행하기', html: '<ol><li>저장소의 <code>wpf/Ch15_Camera/Ch15_Camera.csproj</code> 를 Visual Studio 2022 로 열고 <b>F5</b>.</li><li>[시작] 을 누릅니다. 노트북 내장 카메라는 보통 <b>0</b> 번, USB 웹캠을 추가로 꽂았다면 1 번일 수 있습니다.</li><li>안 열리면: Windows 설정 → 개인 정보 및 보안 → 카메라 → <b>"데스크톱 앱이 카메라에 액세스하도록 허용"</b> 을 켜고, 줌 · 팀즈 등 카메라를 쓰는 프로그램을 종료합니다.</li><li>처리 옵션을 바꿔 가며 FPS 가 어떻게 변하는지 보세요 — Canny 가 가장 무겁습니다.</li></ol>' },
          { type: 'callout', kind: 'tip', teacher: true, title: '평가 루브릭 · 마무리', html: '<ul><li><b>상</b>: 영상의 성질(부품이 밝다)을 보고 알고리즘을 고르며, 기준선 통과 카운트를 직접 구현하고 왜 정답이 5개인지 부품 좌표로 검산한다. WPF 스레드 규칙을 설명할 수 있다.</li><li><b>중</b>: 예제를 수정해 임계값 · 면적 필터를 조정하고 프레임별 검출 결과를 해석한다.</li><li><b>하</b>: 프레임마다 개수를 더해 90개를 답한다 → 예제 4 의 누적 출력을 함께 읽으며 "같은 부품" 개념을 짚어 줍니다.</li><li>💬 마무리 발문: “벨트가 두 배 빨라져 프레임당 72 px 씩 움직이면 어디를 고쳐야 할까?” — 매칭 범위 <code>10~60</code> 을 넓힌다. “부품이 두 줄로 흐르면?” — y 로도 구분(이미 <code>Math.Abs(p.Y - c.Y) &lt; 30</code> 이 그 역할).</li><li>다음 차시 예고: Part 4 로 넘어가 <b>WPF 이미지 처리 스튜디오</b>(16차시)와 <b>실전 검사 프로젝트</b>(17차시)를 만듭니다. 오늘 읽은 <code>Ch15_Camera</code> 의 스레드 구조가 그대로 쓰입니다.</li></ul>' }
        ],
        practice: [
          {
            title: '임계값과 면적 필터 바꿔 보기', level: 1,
            desc: '<code>videos/conveyor.mp4</code> 의 <b>10번 프레임</b>에서 밝기 임계값을 100 · 150 · 200 으로, 면적 필터를 500 · 1200 · 3000 으로 바꿔 가며 검출되는 부품 수가 어떻게 달라지는지 출력하세요. (힌트: 프레임을 먼저 <code>Clone()</code> 으로 하나 확보한 뒤 조합을 돌리면 영상을 여러 번 읽지 않아도 됩니다.)',
            hint: '10번 프레임까지 <code>Read</code> 한 뒤 <code>var shot = frame.Clone();</code> 로 보관하고, 이중 <code>foreach</code> 로 임계값 × 면적 조합 9가지를 돌립니다. 임계값 100 은 레일 등 밝은 배경까지 흰색이 되어 <b>7개</b>로 늘고, 200 은 부품 가장자리가 깎여 면적 필터에 걸려 <b>0개</b>가 됩니다 — 150 부근이 정답(5개)을 안정적으로 줍니다.',
            expect: '10번 프레임으로 조합 시험 (정답: 부품 5개)\n  임계값 100, 면적>  500 → 7개\n  임계값 100, 면적> 1200 → 7개\n  임계값 100, 면적> 3000 → 5개\n  임계값 150, 면적>  500 → 5개\n  임계값 150, 면적> 1200 → 5개\n  임계값 150, 면적> 3000 → 3개\n  임계값 200, 면적>  500 → 4개\n  임계값 200, 면적> 1200 → 0개\n  임계값 200, 면적> 3000 → 0개',
            starter: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat();
        Mat shot = null;
        int n = 0;
        while (cap.Read(frame)) { n++; if (n == 10) { shot = frame.Clone(); break; } }
        Console.WriteLine("10번 프레임으로 조합 시험 (정답: 부품 5개)");

        using var gray = new Mat();
        Cv2.CvtColor(shot, gray, ColorConversionCodes.BGR2GRAY);
        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));

        foreach (int th in new int[] { 100, 150, 200 })
        {
            // TODO: gray 를 th 로 이진화하고 Open 한 뒤
            // TODO: 면적 500 · 1200 · 3000 초과 윤곽선 개수를 각각 출력하세요
        }
        shot.Dispose();
    }
}`,
            solution: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat();
        Mat shot = null;
        int n = 0;
        while (cap.Read(frame)) { n++; if (n == 10) { shot = frame.Clone(); break; } }
        Console.WriteLine("10번 프레임으로 조합 시험 (정답: 부품 5개)");

        using var gray = new Mat();
        Cv2.CvtColor(shot, gray, ColorConversionCodes.BGR2GRAY);
        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
        using var bin = new Mat();
        using var open = new Mat();

        foreach (int th in new int[] { 100, 150, 200 })
        {
            Cv2.Threshold(gray, bin, th, 255, ThresholdTypes.Binary);
            Cv2.MorphologyEx(bin, open, MorphTypes.Open, k);
            var cs = Cv2.FindContoursAsArray(open, RetrievalModes.External, ContourApproximationModes.ApproxSimple);
            foreach (int minArea in new int[] { 500, 1200, 3000 })
                Console.WriteLine($"  임계값 {th}, 면적>{minArea,5} → {cs.Count(c => Cv2.ContourArea(c) > minArea)}개");
        }
        Cv2.ImShow("shot", shot);
        shot.Dispose();
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '구멍 없는 불량 부품(NG) 찾아내기', level: 2,
            desc: '컨베이어의 부품 <b>#2 는 구멍이 없는 불량</b>입니다(IMAGES.md). 정상 와셔는 가운데가 <b>어둡고</b>(구멍), NG 부품은 가운데까지 <b>밝습니다</b>. 각 프레임에서 검출한 부품마다 <b>바운딩 박스 중심의 그레이 값</b>을 보고 150 보다 크면 "NG 구멍없음" 으로 판정하세요. 화면에 잘린 부품(중심 x &lt; 40 또는 &gt; 600)은 건너뜁니다. 프레임 2 와 5 의 판정 결과를 출력하고, NG 가 보인 횟수를 세세요.',
            hint: '중심 픽셀 값은 <code>gray.At&lt;byte&gt;(cy, cx)</code> 입니다 — <b>(행 y, 열 x)</b> 순서에 주의하세요. 프레임 2 에서는 x=325 인 부품이, 프레임 5 에서는 x=433 인 부품이 NG 입니다 (같은 #2 부품이 흘러가는 중).',
            expect: '  f 2 x=168 면적   3445 중심 밝기  70 → OK\n  f 2 x=325 면적   3458 중심 밝기 201 → NG 구멍없음\n  f 2 x=476 면적   3456 중심 밝기  68 → OK\n  f 5 x=138 면적   3454 중심 밝기  71 → OK\n  f 5 x=276 면적   3453 중심 밝기  70 → OK\n  f 5 x=433 면적   3456 중심 밝기 198 → NG 구멍없음\n  f 5 x=584 면적   3437 중심 밝기  66 → OK\n구멍 없는 부품이 보인 프레임 수(연): 9',
            starter: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat();
        using var gray = new Mat();
        using var bin = new Mat();
        using var open = new Mat();
        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
        int n = 0, ngSeen = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.Threshold(gray, bin, 150, 255, ThresholdTypes.Binary);
            Cv2.MorphologyEx(bin, open, MorphTypes.Open, k);
            var parts = Cv2.FindContoursAsArray(open, RetrievalModes.External, ContourApproximationModes.ApproxSimple)
                           .Where(c => Cv2.ContourArea(c) > 1200).OrderBy(c => Cv2.BoundingRect(c).X).ToArray();
            foreach (var c in parts)
            {
                var r = Cv2.BoundingRect(c);
                int cx = r.X + r.Width / 2, cy = r.Y + r.Height / 2;
                if (cx < 40 || cx > 600) continue;             // 화면에 잘린 부품 제외
                // TODO: gray.At<byte>(cy, cx) 로 중심 밝기를 읽고 150 초과면 NG 로 판정하세요
                // TODO: NG 면 ngSeen++ 하고, n 이 2 또는 5 일 때 아래 형식으로 출력하세요
                //   "  f 2 x=325 면적   3458 중심 밝기 201 → NG 구멍없음"
            }
        }
        Console.WriteLine($"구멍 없는 부품이 보인 프레임 수(연): {ngSeen}");
    }
}`,
            solution: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat();
        using var gray = new Mat();
        using var bin = new Mat();
        using var open = new Mat();
        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
        int n = 0, ngSeen = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.Threshold(gray, bin, 150, 255, ThresholdTypes.Binary);
            Cv2.MorphologyEx(bin, open, MorphTypes.Open, k);
            var parts = Cv2.FindContoursAsArray(open, RetrievalModes.External, ContourApproximationModes.ApproxSimple)
                           .Where(c => Cv2.ContourArea(c) > 1200).OrderBy(c => Cv2.BoundingRect(c).X).ToArray();
            foreach (var c in parts)
            {
                var r = Cv2.BoundingRect(c);
                int cx = r.X + r.Width / 2, cy = r.Y + r.Height / 2;
                if (cx < 40 || cx > 600) continue;
                byte center = gray.At<byte>(cy, cx);           // (행 y, 열 x)!
                double area = Cv2.ContourArea(c);
                bool noHole = center > 150;
                if (noHole) ngSeen++;
                if (n == 2 || n == 5)
                    Console.WriteLine($"  f{n,2} x={cx,3} 면적 {area,6:F0} 중심 밝기 {center,3} → {(noHole ? "NG 구멍없음" : "OK")}");
            }
        }
        Console.WriteLine($"구멍 없는 부품이 보인 프레임 수(연): {ngSeen}");
    }
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '움직임 검출과 라인 통과 카운트', subtitle: 'Absdiff · MOG2 · 모폴로지 · 한 번만 세기 · WPF 카메라', notes: '<p>1교시 숙제 질문으로 시작: “매 프레임 4~5개가 보이는데 전체로 몇 개가 지나갔을까?” 💬 학생들의 답을 몇 개 받아 둡니다(더한다 / 최대값 / 모르겠다). 오늘 끝에 정답 5개를 코드로 확인한다고 예고합니다. (3분)</p>' },
          { layout: 'diagram', title: '움직임 검출 파이프라인', html: FIG_MOTION, caption: '프레임 차이 / 배경 차분 → 이진화 · 모폴로지 → 윤곽선 → 기준선 통과 카운트', notes: '<p>네 단계를 짚고, 특히 아래 두 줄의 ⚠️ 를 강조합니다: ① 배경이 움직이면 전제가 깨진다 ② 검출만으로는 같은 부품을 여러 번 센다. 이 두 가지가 오늘의 핵심 난관입니다. (6분)</p>' },
          { layout: 'image', title: '오늘의 영상: 컨베이어', src: 'images/conveyor_00.png', caption: '벨트가 프레임당 +36 px · 부품(와셔)이 왼→오로 흐른다 · NG: #2 구멍없음 · #5 균열 · #8 깨짐', notes: '<p>20장의 프레임이 <code>conveyor_00~19.png</code> 로 들어 있고, <code>VideoCapture("videos/conveyor.mp4")</code> 로 열린다고 설명합니다. 💬 “부품과 벨트를 구별할 수 있는 단서는?” — 밝기! 이 답을 미리 받아 두면 예제 3 이 자연스러워집니다. (3분)</p>' },
          { layout: 'code', title: '두 프레임의 차이 (Absdiff)', code: `using System;
using OpenCvSharp;
class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat(); using var gray = new Mat();
        using var prev = new Mat(); using var diff = new Mat(); using var moved = new Mat();
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            if (!prev.Empty())
            {
                Cv2.Absdiff(gray, prev, diff);
                Cv2.Threshold(diff, moved, 30, 255, ThresholdTypes.Binary);
                if (n <= 3) Console.WriteLine($"f{n}: 변화 {Cv2.CountNonZero(moved)}");
            }
            gray.CopyTo(prev);       // 참조 대입(prev = gray) 금지!
        }
    }
}`, points: ['<code>gray.CopyTo(prev)</code> — <code>prev = gray;</code> 로 쓰면 차이가 항상 0', '변화 픽셀이 전체의 <b>6~7%</b>', '부품만이 아니라 <b>벨트 무늬 전체</b>가 움직였다'], notes: '<p><code>prev = gray;</code> 함정을 일부러 보여 주세요 — 같은 Mat 을 가리켜 차이가 0 이 됩니다. 결과 이미지(diff)를 띄워 벨트 이음매가 줄무늬로 보이는 것을 확인시킵니다. 💬 “우리가 찾고 싶은 건 부품인데 벨트가 잡혔다. 왜?” (8분)</p>' },
          { layout: 'code', title: '배경 차분 MOG2 + 열기 + 윤곽선', code: `using System;
using System.Linq;
using OpenCvSharp;
class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var mog2 = BackgroundSubtractorMOG2.Create();
        using var frame = new Mat(); using var fg = new Mat(); using var open = new Mat();
        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            mog2.Apply(frame, fg);                    // 0 배경 · 127 그림자 · 255 전경
            Cv2.MorphologyEx(fg, open, MorphTypes.Open, k);
            if (n < 18) continue;
            var cs = Cv2.FindContoursAsArray(open, RetrievalModes.External,
                                             ContourApproximationModes.ApproxSimple);
            Console.WriteLine($"f{n}: 큰 덩어리 {cs.Count(c => Cv2.ContourArea(c) > 200)}개");
        }
    }
}`, points: ['MOG2 = 픽셀마다 배경 밝기 분포를 <b>학습</b>', '마스크 값: 0 배경 · <b>127 그림자</b> · 255 전경', '<code>Open</code> = 침식→팽창 : 작은 흰 점 제거 (9차시)', '결과는 1~5개로 <b>들쭉날쭉</b> — 왜?'], notes: '<p>결과가 기대와 다르다는 점을 학생이 먼저 느끼게 합니다. 💬 “부품은 12개인데 왜 1~5개일까요?” — 벨트가 움직여 배경 모델이 계속 무너지고, 부품은 앞뒤 테두리만 남는다. 여기서 ⚠️ 콜아웃(“배경은 정지” 가정)을 읽고 다음 슬라이드로. (8분)</p>' },
          { layout: 'bullets', title: '⚠️ 알고리즘보다 영상을 먼저 보라', lead: 'Absdiff · MOG2 가 이 영상에서 잘 안 되는 이유', bullets: [
            '두 방법 모두 <b>"배경은 정지해 있다"</b> 를 가정한다',
            '컨베이어는 <b>벨트 자체가 프레임당 36 px</b> 움직인다 → 가정이 깨진다',
            '벨트 무늬가 전경으로 잡히고, 부품은 테두리만 남거나 배경으로 학습된다',
            '<b>이 영상의 진짜 단서: 부품이 벨트보다 확실히 밝다</b>',
            ['해결', ['<code>Cv2.Threshold(gray, bin, 150, 255, Binary)</code> 한 줄', '→ 프레임마다 4~5개가 안정적으로 잡힌다']]
          ], notes: '<p>이 슬라이드가 15차시에서 가장 중요한 교훈입니다. 파라미터 튜닝에 시간을 쏟기 전에 <b>영상을 픽셀 값으로 들여다보라</b>. 결과 창에서 벨트(≈60)와 부품(≈200)의 밝기를 마우스로 확인시키면 완벽합니다. 💬 “고정 카메라 + 정지 배경이면 MOG2 가 최고의 선택” 이라는 균형도 함께. (5분)</p>' },
          { layout: 'code', title: '밝기 임계값으로 부품 찾기', code: `using System;
using System.Linq;
using OpenCvSharp;
class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat(); using var gray = new Mat();
        using var bin = new Mat(); using var open = new Mat();
        using var k = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
        for (int n = 1; cap.Read(frame); n++)
        {
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.Threshold(gray, bin, 150, 255, ThresholdTypes.Binary);   // 부품은 밝다
            Cv2.MorphologyEx(bin, open, MorphTypes.Open, k);
            var parts = Cv2.FindContoursAsArray(open, RetrievalModes.External,
                            ContourApproximationModes.ApproxSimple)
                            .Where(c => Cv2.ContourArea(c) > 1200).ToArray();
            if (n <= 3) Console.WriteLine($"f{n}: 부품 {parts.Length}개");
        }
    }
}`, points: ['부품은 밝다 → <code>Threshold(150)</code> 한 줄', '와셔 면적 ≈ π(34²−14²) ≈ 3016 → 필터 1200 은 넉넉', '프레임마다 <b>4~5개</b> 안정 · 중심 좌표도 정답과 일치'], notes: '<p>검출 사각형을 그린 화면을 함께 띄웁니다. 중심 좌표(132 · 289 · 440 · 584)를 IMAGES.md 정답(132 · 290 · 440 · 585)과 비교시키면 신뢰가 생깁니다. 💬 “면적 필터를 3000 으로 올리면?” — 잘린 부품이 빠진다(실습 1). (7분)</p>' },
          { layout: 'code', title: '한 번만 세기: 기준선 통과', code: `using System;
using System.Collections.Generic;
using System.Linq;
using OpenCvSharp;
class Program
{
    static void Main()
    {
        // … 부품 중심 목록 centers 를 구했다고 하자 (앞 슬라이드)
        var prevCenters = new List<Point2f>();
        var centers = new List<Point2f>();
        int crossed = 0;
        const int LINE_X = 320;
        foreach (var c in centers)
        {
            if (c.X < LINE_X) continue;                    // 아직 선 왼쪽
            var same = prevCenters.Where(p => Math.Abs(p.Y - c.Y) < 30
                                           && c.X - p.X > 10 && c.X - p.X < 60);
            if (same.Any() && same.Min(p => p.X) < LINE_X) crossed++;
        }
        prevCenters = centers;
        Console.WriteLine($"통과 {crossed}개");
    }
}`, run: false, points: ['같은 부품 찾기: <b>y 가 비슷 + x 가 10~60 px 왼쪽</b> (벨트 36 px/프레임)', '조건: <b>이전엔 선 왼쪽, 지금은 선 오른쪽</b> → count++', '전체 실행 결과 = <b>5개</b> (부품 #2 ~ #6)', '공정 지식(벨트 속도)을 코드에 넣은 <b>가장 단순한 추적</b>'], notes: '<p>칠판에 기준선과 두 프레임의 중심을 그려 “넘는 순간” 을 시각화합니다. 본문 예제 4 를 실행해 누적 카운트가 f2 · f7 · f11 · f15 · f19 에서 오르는 것을 확인시키고, IMAGES.md 의 좌표로 검산합니다(#2~#6). 💬 “벨트가 2배 빨라지면?” — 10~60 을 넓힌다. (10분)</p>' },
          { layout: 'two', title: 'WPF 에서 카메라: 스레드 두 개', left: { title: '🧵 백그라운드 (Task.Run)', bullets: ['<code>cap.Read(frame)</code> — 시간이 걸린다', '영상 처리 (Gray · Canny · MOG2)', '종료 조건: <code>token.IsCancellationRequested</code>', '버퍼 Mat 재사용', '❌ UI 컨트롤을 <b>직접 만지면 예외</b>'] }, right: { title: '🖼 UI 스레드 (Dispatcher.Invoke)', bullets: ['<code>CameraImage.Source = display.ToBitmapSource()</code>', '<code>FpsText.Text = …</code>', '버튼 상태 변경', '<code>Invoke</code> 는 끝날 때까지 기다린다 → 버퍼 덮어써도 안전', '무거운 계산은 <b>절대 금지</b>'] }, notes: '<p>“WPF 컨트롤은 만든 스레드에서만 만질 수 있다” 는 규칙을 먼저 못박습니다. <code>Invoke</code>(기다림)와 <code>BeginInvoke</code>(안 기다림)의 차이도 짚어 주세요 — <code>BeginInvoke</code> 를 쓰면 <code>display</code> 를 복사해야 합니다. 브라우저에서는 스레드를 실행할 수 없어 코드를 <b>읽기만</b> 한다고 안내합니다. (6분)</p>' },
          { layout: 'code', title: 'Ch15_Camera: 캡처 루프의 핵심', code: `public partial class MainWindow    // 백그라운드 스레드 (Task.Run 으로 실행)
{
  private void CaptureLoop(VideoCapture cap, CancellationToken token)
  {
    using var frame = new Mat();
    using var output = new Mat();
    using var mog2 = BackgroundSubtractorMOG2.Create(
        history: 300, varThreshold: 25, detectShadows: false);
    while (!token.IsCancellationRequested)
    {
        if (!cap.Read(frame) || frame.Empty()) { Thread.Sleep(5); continue; }

        Mat display = frame;
        if (Volatile.Read(ref _mode) == 3)      // 배경 차분 모드
        {
            mog2.Apply(frame, output);
            display = output;
        }
        Dispatcher.Invoke(() =>                 // 화면 갱신은 UI 스레드에서
            CameraImage.Source = display.ToBitmapSource(),
            DispatcherPriority.Render, token);
    }
  }
}`, run: false, local: true, file: 'MainWindow.xaml.cs', points: ['루프 구조는 <b>콘솔 코드와 똑같다</b>', '<code>WaitKey</code> 대신 <code>token.IsCancellationRequested</code>', '<code>ImShow</code> 대신 <code>Dispatcher.Invoke</code> + <code>ToBitmapSource()</code>', '다른 스레드가 쓰는 <code>_mode</code> 는 <code>Volatile.Read</code>'], notes: '<p>1교시 콘솔 코드와 나란히 놓고 “달라진 건 세 줄뿐” 을 보여 주는 것이 이 슬라이드의 목적입니다. 학생들이 “WPF 는 어렵다” 는 편견을 버리게 하세요. 정지 순서(<code>Cancel</code> → <code>await</code> → <code>Release</code>)도 꼭 언급합니다 — 순서를 바꾸면 예외. (8분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '컨베이어 위 부품을 <b>한 번만</b> 세려면?', options: ['프레임마다 검출된 개수를 모두 더한다', '가장 많이 검출된 프레임의 개수를 쓴다', '기준선을 넘는 순간에만 센다 (이전 프레임 중심과 비교)', '마지막 프레임의 개수를 쓴다'], answer: 2, explain: '프레임마다 4~5개가 보이므로 그냥 더하면 90개가 됩니다. <b>이전엔 선 왼쪽 · 지금은 선 오른쪽</b>일 때만 세면 정확히 5개입니다.', notes: '<p>정답 3번. 1번을 고른 학생이 있으면 실제로 더해 보게 해 90 이 나오는 것을 확인시킵니다 — 틀린 답을 직접 만들어 보는 것이 가장 잘 남습니다.</p>' },
          { layout: 'practice', title: '실습: 구멍 없는 NG 부품 찾기', desc: '<p>부품 <b>#2 는 구멍이 없는 불량</b>입니다. 정상은 가운데가 어둡고(구멍), NG 는 가운데까지 밝습니다.</p><ul><li>부품마다 <code>gray.At&lt;byte&gt;(cy, cx)</code> 로 중심 밝기 확인 → 150 초과면 NG</li><li>잘린 부품(중심 x &lt; 40 또는 &gt; 600)은 제외</li><li>정답: 프레임 2 의 x=325, 프레임 5 의 x=433 이 NG</li></ul>', starter: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat();
        using var gray = new Mat();
        using var bin = new Mat();
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.Threshold(gray, bin, 150, 255, ThresholdTypes.Binary);
            // TODO: 윤곽선 → 면적 1200 초과 → 중심 밝기로 OK / NG 판정
        }
    }
}`, solution: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var cap = new VideoCapture("videos/conveyor.mp4");
        using var frame = new Mat();
        using var gray = new Mat();
        using var bin = new Mat();
        int n = 0;
        while (cap.Read(frame))
        {
            n++;
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.Threshold(gray, bin, 150, 255, ThresholdTypes.Binary);
            if (n != 2) continue;
            foreach (var c in Cv2.FindContoursAsArray(bin, RetrievalModes.External,
                                  ContourApproximationModes.ApproxSimple)
                                  .Where(c => Cv2.ContourArea(c) > 1200))
            {
                var r = Cv2.BoundingRect(c);
                int cx = r.X + r.Width / 2, cy = r.Y + r.Height / 2;
                if (cx < 40 || cx > 600) continue;
                byte v = gray.At<byte>(cy, cx);
                Console.WriteLine($"x={cx} 중심 {v} → {(v > 150 ? "NG" : "OK")}");
            }
        }
    }
}`, notes: '<p>핵심은 <code>At&lt;byte&gt;(cy, cx)</code> 의 <b>(행, 열)</b> 순서입니다 — 3차시 이후 계속 강조해 온 규칙이 여기서 또 나옵니다. 💬 “#5 균열과 #8 깨짐은 이 방법으로 찾을 수 있을까?” — 못 찾는다. 균열은 가는 선이라 면적/원형도, 깨짐은 면적 감소로 봐야 한다 → 17차시 예고. (12분)</p>' },
          { layout: 'summary', title: '15차시 정리', bullets: ['<code>Absdiff</code> · <code>MOG2</code> = 배경이 <b>정지</b>해 있을 때의 움직임 검출', '전경 마스크 → <code>MorphologyEx(Open)</code> → <code>FindContours</code> + 면적 필터 → 물체', '<b>알고리즘보다 영상을 먼저</b>: 컨베이어는 밝기 임계값 한 줄이 더 튼튼했다', '지나가는 물체는 <b>기준선을 넘는 순간</b>에만 센다 → 컨베이어 5개', '공정 지식(벨트 36 px/프레임)을 코드에 넣으면 추적이 단순해진다', 'WPF: <code>Task.Run</code> 으로 읽고 <code>Dispatcher.Invoke</code> 로 그린다. 정지는 <b>Cancel → await → Release</b> 순서', '완성 프로젝트 <code>wpf/Ch15_Camera</code> 를 Visual Studio 에서 실행해 보기', '다음: Part 4 — WPF 이미지 처리 스튜디오(16차시) · 실전 검사 프로젝트(17차시)'], notes: '<p>여덟 줄을 정리합니다. 과제: ① <code>Ch15_Camera</code> 를 내려받아 실행해 보고 처리 옵션별 FPS 기록 ② 실습 2 를 확장해 #5 균열도 찾아 보기(어려움 — 17차시 예고). Part 3 이 끝났음을 알리고, 지금까지 배운 것들이 Part 4 에서 하나의 앱으로 합쳐진다고 마무리합니다. (3분)</p>' }
        ]
      }
    ]
  });
})();
