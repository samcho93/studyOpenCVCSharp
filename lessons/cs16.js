/* 16차시 WPF 이미지 처리 스튜디오 만들기 (3교시) — wpf/Ch16_ImageStudio */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 앱 화면 배치도 (Grid 2열 + 상태 표시줄)
  const FIG_LAYOUT = `<svg viewBox="0 0 760 360" role="img" aria-label="이미지 처리 스튜디오 화면 배치: 왼쪽 도구 패널, 오른쪽 작업 이미지와 미리보기, 아래 상태 표시줄">
  <rect x="10" y="10" width="740" height="340" rx="12" class="card-bg"/>
  <text x="380" y="34" text-anchor="middle" class="tx-b">MainWindow (Grid: 2행 × 2열)</text>

  <rect x="24" y="46" width="200" height="262" rx="8" class="p1s"/>
  <text x="124" y="66" text-anchor="middle" class="tx-b">DockPanel (왼쪽 · 폭 270)</text>
  <rect x="34" y="76" width="180" height="46" rx="6" class="p2s"/>
  <text x="124" y="94" text-anchor="middle" class="tx">파일: 열기 · 저장</text>
  <text x="124" y="112" text-anchor="middle" class="tx-m">OpenButton_Click …</text>
  <rect x="34" y="128" width="180" height="56" rx="6" class="p2s"/>
  <text x="124" y="146" text-anchor="middle" class="tx">기록: 적용 · 되돌리기</text>
  <text x="124" y="163" text-anchor="middle" class="tx">다시 실행 · 초기화</text>
  <text x="124" y="179" text-anchor="middle" class="tx-m">HistoryText</text>
  <rect x="34" y="190" width="180" height="60" rx="6" class="p3s"/>
  <text x="124" y="210" text-anchor="middle" class="tx">ListBox FilterList</text>
  <text x="124" y="228" text-anchor="middle" class="tx-m">None · Gray · Blur …</text>
  <text x="124" y="244" text-anchor="middle" class="tx-m">SelectionChanged</text>
  <rect x="34" y="256" width="180" height="44" rx="6" class="p4s"/>
  <text x="124" y="273" text-anchor="middle" class="tx">Slider P1Slider · P2Slider</text>
  <text x="124" y="291" text-anchor="middle" class="tx-m">ValueChanged → 즉시 재처리</text>

  <rect x="236" y="46" width="248" height="262" rx="8" class="p1s"/>
  <text x="360" y="66" text-anchor="middle" class="tx-b">Image OriginalImage</text>
  <text x="360" y="84" text-anchor="middle" class="tx-m">작업 이미지 (적용된 상태)</text>
  <rect x="250" y="94" width="220" height="200" rx="6" class="p5s"/>
  <text x="360" y="200" text-anchor="middle" class="tx-m">Stretch="Uniform"</text>

  <rect x="496" y="46" width="240" height="262" rx="8" class="p1s"/>
  <text x="616" y="66" text-anchor="middle" class="tx-b">Image ResultImage</text>
  <text x="616" y="84" text-anchor="middle" class="tx-m">필터 미리보기</text>
  <rect x="510" y="94" width="212" height="200" rx="6" class="p5s"/>
  <text x="616" y="200" text-anchor="middle" class="tx-m">Mat → ToBitmapSource()</text>

  <rect x="24" y="314" width="712" height="26" rx="6" class="p2s"/>
  <text x="380" y="331" text-anchor="middle" class="tx-m">StatusBar · StatusText — 파일 · 크기 · 채널 · 필터 · 파라미터 · 처리 시간 · 미리보기 축소 비율</text>
</svg>`;

  // 그림 2: 처리 파이프라인 · Mat 소유 흐름
  const FIG_PIPE = `<svg viewBox="0 0 760 300" role="img" aria-label="작업 이미지에서 미리보기 축소를 거쳐 필터 결과를 화면에 표시하는 흐름">
  ${ARROW('c16a1')}
  <rect x="16" y="40" width="150" height="66" rx="10" class="p1s"/>
  <text x="91" y="64" text-anchor="middle" class="tx-b">_history.Current</text>
  <text x="91" y="82" text-anchor="middle" class="tx-m">작업 이미지</text>
  <text x="91" y="98" text-anchor="middle" class="tx-m">원본 해상도</text>

  <rect x="216" y="40" width="150" height="66" rx="10" class="p2s"/>
  <text x="291" y="64" text-anchor="middle" class="tx-b">_preview</text>
  <text x="291" y="82" text-anchor="middle" class="tx-m">1280px 이하 축소</text>
  <text x="291" y="98" text-anchor="middle" class="tx-m">Cv2.Resize(Area)</text>

  <rect x="416" y="40" width="160" height="66" rx="10" class="p3s"/>
  <text x="496" y="64" text-anchor="middle" class="tx-b">FilterPipeline.Apply</text>
  <text x="496" y="82" text-anchor="middle" class="tx-m">kind · p1 · p2</text>
  <text x="496" y="98" text-anchor="middle" class="tx-m">항상 새 Mat 반환</text>

  <rect x="620" y="40" width="124" height="66" rx="10" class="p4s"/>
  <text x="682" y="64" text-anchor="middle" class="tx-b">_result</text>
  <text x="682" y="82" text-anchor="middle" class="tx-m">ResultImage</text>
  <text x="682" y="98" text-anchor="middle" class="tx-m">.Source</text>

  <line x1="168" y1="73" x2="212" y2="73" class="ln" stroke-width="2" marker-end="url(#c16a1)"/>
  <line x1="368" y1="73" x2="412" y2="73" class="ln" stroke-width="2" marker-end="url(#c16a1)"/>
  <line x1="578" y1="73" x2="616" y2="73" class="ln" stroke-width="2" marker-end="url(#c16a1)"/>

  <text x="380" y="140" text-anchor="middle" class="tx-m">슬라이더를 움직일 때마다 위 경로만 다시 실행 → 축소본이라 빠르다</text>

  <rect x="16" y="166" width="150" height="58" rx="10" class="p1s"/>
  <text x="91" y="188" text-anchor="middle" class="tx">[적용] 버튼</text>
  <text x="91" y="206" text-anchor="middle" class="tx-m">ApplyButton_Click</text>
  <rect x="216" y="166" width="220" height="58" rx="10" class="p3s"/>
  <text x="326" y="188" text-anchor="middle" class="tx">FilterPipeline.Apply(Current, …)</text>
  <text x="326" y="206" text-anchor="middle" class="tx-m">원본 해상도로 다시 계산</text>
  <rect x="486" y="166" width="258" height="58" rx="10" class="p2s"/>
  <text x="615" y="188" text-anchor="middle" class="tx">_history.Push(결과)</text>
  <text x="615" y="206" text-anchor="middle" class="tx-m">이전 Current → Undo 스택으로</text>
  <line x1="168" y1="195" x2="212" y2="195" class="ln" stroke-width="2" marker-end="url(#c16a1)"/>
  <line x1="438" y1="195" x2="482" y2="195" class="ln" stroke-width="2" marker-end="url(#c16a1)"/>

  <text x="380" y="258" text-anchor="middle" class="tx-m">[저장] 도 같은 규칙: 화면은 축소본이지만 파일은 Current(원본 해상도)로 다시 계산해 저장</text>
  <text x="380" y="280" text-anchor="middle" class="tx-m">규칙 ① 입력 Mat 은 바꾸지 않는다 ② 결과는 새 Mat ③ 화면용 이전 결과는 Dispose</text>
</svg>`;

  // ───────────────────────────── 1교시 코드 ─────────────────────────────

  const XAML_MAIN = `<Window x:Class="Ch16_ImageStudio.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="16차시 이미지 처리 스튜디오" Height="720" Width="1200"
        WindowStartupLocation="CenterScreen">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="*" />
            <RowDefinition Height="Auto" />
        </Grid.RowDefinitions>
        <Grid.ColumnDefinitions>
            <ColumnDefinition Width="270" />   <!-- 왼쪽 도구 패널 -->
            <ColumnDefinition Width="*" />     <!-- 오른쪽 이미지 2개 -->
        </Grid.ColumnDefinitions>

        <!-- ───── 왼쪽 도구 패널 ───── -->
        <DockPanel Grid.Row="0" Grid.Column="0" Background="#FFF3F3F3" LastChildFill="True">
            <!-- 파일 · 기록 버튼 -->
            <StackPanel DockPanel.Dock="Top" Margin="8">
                <TextBlock Text="파일" FontWeight="Bold" Margin="0,0,0,4" />
                <WrapPanel>
                    <Button Content="열기" Click="OpenButton_Click" Style="{StaticResource ToolButton}" />
                    <Button Content="저장" Click="SaveButton_Click" Style="{StaticResource ToolButton}" />
                </WrapPanel>
                <TextBlock Text="기록" FontWeight="Bold" Margin="0,10,0,4" />
                <WrapPanel>
                    <Button x:Name="ApplyButton" Content="적용" Click="ApplyButton_Click" Style="{StaticResource ToolButton}"
                            ToolTip="현재 필터 결과를 작업 이미지로 확정합니다 (Undo 가능)" />
                    <Button x:Name="UndoButton" Content="되돌리기" Click="UndoButton_Click" Style="{StaticResource ToolButton}" />
                    <Button x:Name="RedoButton" Content="다시 실행" Click="RedoButton_Click" Style="{StaticResource ToolButton}" />
                    <Button x:Name="ResetButton" Content="초기화" Click="ResetButton_Click" Style="{StaticResource ToolButton}" />
                </WrapPanel>
                <TextBlock x:Name="HistoryText" Text="기록: -" Foreground="Gray" Margin="2,4,0,0" />
            </StackPanel>

            <!-- 파라미터 슬라이더 -->
            <StackPanel DockPanel.Dock="Bottom" Margin="8">
                <TextBlock Text="파라미터" FontWeight="Bold" Margin="0,0,0,4" />
                <DockPanel>
                    <TextBlock x:Name="P1Label" Text="p1" Width="130" VerticalAlignment="Center" />
                    <TextBlock x:Name="P1Value" Text="0" MinWidth="44" TextAlignment="Right" VerticalAlignment="Center" FontFamily="Consolas" />
                </DockPanel>
                <Slider x:Name="P1Slider" Minimum="0" Maximum="1" Value="0" ValueChanged="Param_ValueChanged" />
                <DockPanel Margin="0,8,0,0">
                    <TextBlock x:Name="P2Label" Text="p2" Width="130" VerticalAlignment="Center" />
                    <TextBlock x:Name="P2Value" Text="0" MinWidth="44" TextAlignment="Right" VerticalAlignment="Center" FontFamily="Consolas" />
                </DockPanel>
                <Slider x:Name="P2Slider" Minimum="0" Maximum="1" Value="0" ValueChanged="Param_ValueChanged" />
            </StackPanel>

            <!-- 필터 목록 (남는 공간 전부) -->
            <DockPanel Margin="8,0,8,8">
                <TextBlock DockPanel.Dock="Top" Text="필터" FontWeight="Bold" Margin="0,0,0,4" />
                <ListBox x:Name="FilterList" SelectionChanged="FilterList_SelectionChanged" />
            </DockPanel>
        </DockPanel>

        <!-- ───── 오른쪽: 작업 이미지 · 미리보기 결과 ───── -->
        <Grid Grid.Row="0" Grid.Column="1" Background="#FF2D2D30">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="*" />
                <ColumnDefinition Width="*" />
            </Grid.ColumnDefinitions>
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto" />
                <RowDefinition Height="*" />
            </Grid.RowDefinitions>
            <TextBlock Grid.Row="0" Grid.Column="0" Text="작업 이미지 (적용된 상태)" Foreground="White" Margin="8,6" />
            <TextBlock Grid.Row="0" Grid.Column="1" Text="필터 미리보기" Foreground="White" Margin="8,6" />
            <Image x:Name="OriginalImage" Grid.Row="1" Grid.Column="0" Stretch="Uniform" Margin="8" />
            <Image x:Name="ResultImage" Grid.Row="1" Grid.Column="1" Stretch="Uniform" Margin="8" />
        </Grid>

        <!-- ───── 상태 표시줄 ───── -->
        <StatusBar Grid.Row="1" Grid.ColumnSpan="2">
            <StatusBarItem>
                <TextBlock x:Name="StatusText" Text="[열기] 로 이미지를 불러오세요." />
            </StatusBarItem>
        </StatusBar>
    </Grid>
</Window>`;

  const EX_MINI = `using System;
using OpenCvSharp;

enum FilterKind { None, Gray, GaussianBlur, Canny, Threshold }

// WPF 에 의존하지 않는 순수 처리 로직 → 콘솔 · 테스트 · WPF 가 같은 클래스를 쓴다
static class FilterPipeline
{
    // 규칙: src 는 절대 바꾸지 않고, 결과는 항상 새 Mat 으로 돌려준다 (호출한 쪽이 Dispose)
    public static Mat Apply(Mat src, FilterKind kind, double p1, double p2)
    {
        switch (kind)
        {
            case FilterKind.None:
                return src.Clone();

            case FilterKind.Gray:
                return ToGray(src);

            case FilterKind.GaussianBlur:
            {
                int k = Odd(p1, 1);
                var dst = new Mat();
                Cv2.GaussianBlur(src, dst, new Size(k, k), p2);   // 시그마 0 = 커널 크기에서 자동
                return dst;
            }

            case FilterKind.Canny:
            {
                using var gray = ToGray(src);                     // Canny 는 1채널 입력
                var dst = new Mat();
                Cv2.Canny(gray, dst, p1, p2);
                return dst;
            }

            case FilterKind.Threshold:
            {
                using var gray = ToGray(src);
                var dst = new Mat();
                Cv2.Threshold(gray, dst, p1, 255, ThresholdTypes.Binary);
                return dst;
            }

            default:
                throw new ArgumentException("알 수 없는 필터: " + kind);
        }
    }

    // 슬라이더 값을 min 이상의 홀수로 보정 (블러 커널은 홀수여야 한다)
    static int Odd(double value, int min)
    {
        int k = (int)Math.Round(value);
        if (k < min) k = min;
        if (k % 2 == 0) k++;
        return k;
    }

    public static Mat ToGray(Mat src)
    {
        if (src.Channels() == 1) return src.Clone();
        var gray = new Mat();
        Cv2.CvtColor(src, gray, ColorConversionCodes.BGR2GRAY);
        return gray;
    }
}

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        Console.WriteLine($"원본: {src.Width} x {src.Height}, 채널 {src.Channels()}");

        using Mat gray = FilterPipeline.Apply(src, FilterKind.Gray, 0, 0);
        using Mat blur = FilterPipeline.Apply(src, FilterKind.GaussianBlur, 7, 0);
        using Mat edge = FilterPipeline.Apply(src, FilterKind.Canny, 80, 160);
        using Mat bin = FilterPipeline.Apply(src, FilterKind.Threshold, 128, 0);

        Console.WriteLine($"Gray         : 채널 {gray.Channels()}, 평균 {Cv2.Mean(gray).Val0:F1}");
        Console.WriteLine($"GaussianBlur : 채널 {blur.Channels()}, 평균 {Cv2.Mean(blur).Val0:F1}");
        Console.WriteLine($"Canny        : 채널 {edge.Channels()}, 흰 픽셀 {Cv2.CountNonZero(edge)}");
        Console.WriteLine($"Threshold    : 채널 {bin.Channels()}, 흰 픽셀 {Cv2.CountNonZero(bin)}");
        Console.WriteLine($"원본은 그대로: 평균 {Cv2.Mean(src).Val0:F1}");

        Cv2.ImShow("src", src);
        Cv2.ImShow("blur", blur);
        Cv2.ImShow("edge", edge);
        Cv2.WaitKey(0);
    }
}`;

  const EX_FULL = `using System;
using OpenCvSharp;

enum FilterKind { None, Gray, GaussianBlur, MedianBlur, Canny, Threshold, AdaptiveThreshold, Sharpen, Sepia, Emboss, Erode, Dilate }

static class FilterPipeline
{
    public static Mat Apply(Mat src, FilterKind kind, double p1, double p2)
    {
        switch (kind)
        {
            case FilterKind.None:
                return src.Clone();

            case FilterKind.Gray:
                return ToGray(src);

            case FilterKind.GaussianBlur:
            {
                int k = Odd(p1, 1);
                var dst = new Mat();
                Cv2.GaussianBlur(src, dst, new Size(k, k), p2);
                return dst;
            }

            case FilterKind.MedianBlur:
            {
                var dst = new Mat();
                Cv2.MedianBlur(src, dst, Odd(p1, 3));
                return dst;
            }

            case FilterKind.Canny:
            {
                using var gray = ToGray(src);
                var dst = new Mat();
                Cv2.Canny(gray, dst, p1, p2);
                return dst;
            }

            case FilterKind.Threshold:
            {
                using var gray = ToGray(src);
                var dst = new Mat();
                ThresholdTypes type = p2 >= 0.5 ? ThresholdTypes.BinaryInv : ThresholdTypes.Binary;
                Cv2.Threshold(gray, dst, p1, 255, type);
                return dst;
            }

            case FilterKind.AdaptiveThreshold:
            {
                using var gray = ToGray(src);
                var dst = new Mat();
                Cv2.AdaptiveThreshold(gray, dst, 255, AdaptiveThresholdTypes.GaussianC,
                                      ThresholdTypes.Binary, Odd(p1, 3), p2);
                return dst;
            }

            case FilterKind.Sharpen:
            {
                // 언샵 마스크: dst = (1+강도)·src − 강도·blur
                int k = Odd(p2, 3);
                using var blur = new Mat();
                Cv2.GaussianBlur(src, blur, new Size(k, k), 0);
                var dst = new Mat();
                Cv2.AddWeighted(src, 1 + p1, blur, -p1, 0, dst);
                return dst;
            }

            case FilterKind.Sepia:
            {
                using var bgr = ToBgr(src);
                using Mat kernel = Kernel3x3(new float[] { 0.131f, 0.534f, 0.272f,
                                                           0.168f, 0.686f, 0.349f,
                                                           0.189f, 0.769f, 0.393f });
                using var sepia = new Mat();
                Cv2.Transform(bgr, sepia, kernel);              // 3x3 색 변환 행렬 (B G R 순서)
                var dst = new Mat();
                Cv2.AddWeighted(bgr, 1 - p1, sepia, p1, 0, dst);
                return dst;
            }

            case FilterKind.Emboss:
            {
                using var gray = ToGray(src);
                using Mat kernel = Kernel3x3(new float[] { -2, -1, 0,
                                                           -1,  1, 1,
                                                            0,  1, 2 });
                var dst = new Mat();
                Cv2.Filter2D(gray, dst, MatType.CV_8U, kernel, new Point(-1, -1), p1);   // p1 = 밝기 오프셋
                return dst;
            }

            case FilterKind.Erode:
            case FilterKind.Dilate:
            {
                int k = Odd(p1, 1);
                int iterations = Math.Max(1, (int)Math.Round(p2));
                using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(k, k));
                var dst = new Mat();
                if (kind == FilterKind.Erode)
                    Cv2.Erode(src, dst, element, new Point(-1, -1), iterations);
                else
                    Cv2.Dilate(src, dst, element, new Point(-1, -1), iterations);
                return dst;
            }

            default:
                throw new ArgumentException("알 수 없는 필터: " + kind);
        }
    }

    static int Odd(double value, int min)
    {
        int k = (int)Math.Round(value);
        if (k < min) k = min;
        if (k % 2 == 0) k++;
        return k;
    }

    static Mat Kernel3x3(float[] v)
    {
        var kernel = new Mat(3, 3, MatType.CV_32FC1);
        for (int r = 0; r < 3; r++)
            for (int c = 0; c < 3; c++)
                kernel.Set<float>(r, c, v[r * 3 + c]);
        return kernel;
    }

    public static Mat ToGray(Mat src)
    {
        if (src.Channels() == 1) return src.Clone();
        var gray = new Mat();
        Cv2.CvtColor(src, gray, ColorConversionCodes.BGR2GRAY);
        return gray;
    }

    public static Mat ToBgr(Mat src)
    {
        if (src.Channels() == 3) return src.Clone();
        var bgr = new Mat();
        Cv2.CvtColor(src, bgr, ColorConversionCodes.GRAY2BGR);
        return bgr;
    }
}

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        FilterKind[] kinds = { FilterKind.None, FilterKind.Gray, FilterKind.GaussianBlur, FilterKind.MedianBlur,
                               FilterKind.Canny, FilterKind.Threshold, FilterKind.AdaptiveThreshold, FilterKind.Sharpen,
                               FilterKind.Sepia, FilterKind.Emboss, FilterKind.Erode, FilterKind.Dilate };
        double[] p1s = { 0, 0, 7, 5, 80, 128, 51, 1.5, 1, 128, 5, 5 };
        double[] p2s = { 0, 0, 0, 0, 160, 0, 15, 5, 0, 0, 1, 1 };

        for (int i = 0; i < kinds.Length; i++)
        {
            using Mat dst = FilterPipeline.Apply(src, kinds[i], p1s[i], p2s[i]);
            Console.WriteLine($"{kinds[i]} p1={p1s[i]} p2={p2s[i]} -> {dst.Width}x{dst.Height} 채널 {dst.Channels()} 평균 {Cv2.Mean(dst).Val0:F1}");
            if (kinds[i] == FilterKind.Sepia || kinds[i] == FilterKind.Emboss) Cv2.ImShow(kinds[i].ToString(), dst);
        }
        Cv2.WaitKey(0);
    }
}`;

  const EX_PARAMS = `using System;
using System.Collections.Generic;
using OpenCvSharp;

enum FilterKind { None, Gray, GaussianBlur, MedianBlur, Canny, Threshold }

// 슬라이더 하나의 설명: 이름 · 범위 · 기본값 · 소수 자릿수 · 사용 여부
class ParamInfo
{
    public string Label { get; private set; }
    public double Min { get; private set; }
    public double Max { get; private set; }
    public double Default { get; private set; }
    public int Decimals { get; private set; }
    public bool Enabled { get; private set; }

    public ParamInfo(string label, double min, double max, double def, int decimals, bool enabled)
    {
        Label = label; Min = min; Max = max; Default = def; Decimals = decimals; Enabled = enabled;
    }

    public static ParamInfo Unused()
    {
        return new ParamInfo("(사용 안 함)", 0, 1, 0, 0, false);
    }
}

// ListBox 한 줄에 해당: 종류 · 표시 이름 · 두 파라미터 설명
class FilterInfo
{
    public FilterKind Kind { get; private set; }
    public string DisplayName { get; private set; }
    public ParamInfo P1 { get; private set; }
    public ParamInfo P2 { get; private set; }

    public FilterInfo(FilterKind kind, string name, ParamInfo p1, ParamInfo p2)
    {
        Kind = kind; DisplayName = name; P1 = p1; P2 = p2;
    }

    public override string ToString() { return DisplayName; }
}

class Program
{
    static int Odd(double value, int min)
    {
        int k = (int)Math.Round(value);
        if (k < min) k = min;
        if (k % 2 == 0) k++;
        return k;
    }

    static void Main()
    {
        var filters = new List<FilterInfo>();
        filters.Add(new FilterInfo(FilterKind.None, "None (원본)", ParamInfo.Unused(), ParamInfo.Unused()));
        filters.Add(new FilterInfo(FilterKind.Gray, "Gray (흑백)", ParamInfo.Unused(), ParamInfo.Unused()));
        filters.Add(new FilterInfo(FilterKind.GaussianBlur, "GaussianBlur",
            new ParamInfo("커널 크기(홀수)", 1, 51, 7, 0, true), new ParamInfo("시그마 (0=자동)", 0, 10, 0, 1, true)));
        filters.Add(new FilterInfo(FilterKind.MedianBlur, "MedianBlur",
            new ParamInfo("커널 크기(홀수)", 3, 31, 5, 0, true), ParamInfo.Unused()));
        filters.Add(new FilterInfo(FilterKind.Canny, "Canny (에지)",
            new ParamInfo("낮은 임계값", 0, 255, 80, 0, true), new ParamInfo("높은 임계값", 0, 255, 160, 0, true)));
        filters.Add(new FilterInfo(FilterKind.Threshold, "Threshold (이진화)",
            new ParamInfo("임계값", 0, 255, 128, 0, true), new ParamInfo("반전 (0/1)", 0, 1, 0, 0, true)));

        Console.WriteLine("[ListBox 에 보일 목록: FilterInfo.ToString() 이 표시 이름]");
        foreach (FilterInfo f in filters)
            Console.WriteLine($"  {f.ToString()} / p1 {f.P1.Label} {f.P1.Min}~{f.P1.Max} 기본 {f.P1.Default} / p2 {f.P2.Label}");

        Console.WriteLine("[슬라이더를 움직였을 때 P1Slider 에 넣을 설정]");
        FilterInfo sel = filters[2];
        Console.WriteLine($"  선택: {sel.DisplayName}");
        Console.WriteLine($"  Minimum={sel.P1.Min} Maximum={sel.P1.Max} Value={sel.P1.Default} IsEnabled={sel.P1.Enabled}");
        Console.WriteLine($"  P2Slider IsEnabled={sel.P2.Enabled}, 표시 형식 F{sel.P2.Decimals}");

        Console.WriteLine("[커널 크기 홀수 보정]");
        double[] vals = { 0.4, 1.6, 4, 6.5, 8, 20 };
        foreach (double v in vals)
            Console.WriteLine($"  Odd({v}, 3) = {Odd(v, 3)}");
    }
}`;

  const EX_OWNER = `using System;
using OpenCvSharp;

class Program
{
    // 항상 새 Mat 을 돌려준다 (입력은 읽기만)
    static Mat MakeResult(Mat src, int k)
    {
        var dst = new Mat();
        Cv2.GaussianBlur(src, dst, new Size(k, k), 0);
        return dst;
    }

    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        Console.WriteLine($"원본 평균 {Cv2.Mean(src).Val0:F2}");

        // ① 흔한 실수: 결과를 입력에 덮어쓰면 원본이 사라져 되돌릴 수 없다
        using var copy = src.Clone();
        Cv2.GaussianBlur(copy, copy, new Size(21, 21), 0);
        Console.WriteLine($"덮어쓰기(위험): 평균 {Cv2.Mean(copy).Val0:F2}");

        // ② 올바른 방법: 새 Mat 으로 받는다 → 원본은 그대로
        Mat result = MakeResult(src, 21);
        Console.WriteLine($"새 Mat(올바름): 평균 {Cv2.Mean(result).Val0:F2}, 원본 평균 {Cv2.Mean(src).Val0:F2}");

        // ③ 화면용 결과를 갈아치울 때는 이전 것을 Dispose (네이티브 메모리!)
        Mat old = result;
        result = MakeResult(src, 5);
        old.Dispose();
        Console.WriteLine($"이전 결과 해제: IsDisposed={old.IsDisposed}, 새 결과 평균 {Cv2.Mean(result).Val0:F2}");

        result.Dispose();
        Console.WriteLine($"새 결과도 해제: IsDisposed={result.IsDisposed}");
    }
}`;

  const CS_PIPELINE = `using OpenCvSharp;

namespace Ch16_ImageStudio;

/// <summary>스튜디오가 제공하는 필터 종류</summary>
public enum FilterKind
{
    None, Gray, GaussianBlur, MedianBlur, Canny, Threshold,
    AdaptiveThreshold, Sharpen, Sepia, Emboss, Erode, Dilate,
}

/// <summary>슬라이더 하나의 설명: 이름 · 범위 · 기본값 · 소수 자릿수(0 이면 정수)</summary>
public sealed record ParamInfo(string Label, double Min, double Max, double Default, int Decimals = 0, bool Enabled = true);

/// <summary>ListBox 에 보일 필터 항목: 종류 · 표시 이름 · 두 파라미터 설명</summary>
public sealed record FilterInfo(FilterKind Kind, string DisplayName, ParamInfo P1, ParamInfo P2)
{
    public override string ToString() => DisplayName;
}

/// <summary>
/// 순수 OpenCvSharp 처리 로직. WPF 에 의존하지 않으므로 콘솔 · 테스트에서도 그대로 쓸 수 있습니다.
/// 규칙: 입력 src 는 절대 바꾸지 않고, 결과는 항상 새 Mat 으로 돌려준다 (호출한 쪽이 Dispose).
/// </summary>
public static class FilterPipeline
{
    private static readonly ParamInfo Unused = new("(사용 안 함)", 0, 1, 0, 0, Enabled: false);

    /// <summary>필터 목록 (ListBox 의 ItemsSource)</summary>
    public static readonly IReadOnlyList<FilterInfo> Filters = new List<FilterInfo>
    {
        new(FilterKind.None,              "None (원본)",       Unused, Unused),
        new(FilterKind.Gray,              "Gray (흑백)",       Unused, Unused),
        new(FilterKind.GaussianBlur,      "GaussianBlur",      new("커널 크기(홀수)", 1, 51, 7),  new("시그마 (0=자동)", 0, 10, 0, 1)),
        new(FilterKind.MedianBlur,        "MedianBlur",        new("커널 크기(홀수)", 3, 31, 5),  Unused),
        new(FilterKind.Canny,             "Canny (에지)",      new("낮은 임계값", 0, 255, 80),    new("높은 임계값", 0, 255, 160)),
        new(FilterKind.Threshold,         "Threshold (이진화)", new("임계값", 0, 255, 128),       new("반전 (0/1)", 0, 1, 0)),
        new(FilterKind.AdaptiveThreshold, "AdaptiveThreshold", new("블록 크기(홀수)", 3, 99, 51), new("C (빼는 값)", -30, 30, 15)),
        new(FilterKind.Sharpen,           "Sharpen (샤프닝)",  new("강도", 0, 5, 1.5, 1),         new("블러 크기(홀수)", 3, 15, 5)),
        new(FilterKind.Sepia,             "Sepia (세피아)",    new("강도 0~1", 0, 1, 1, 2),       Unused),
        new(FilterKind.Emboss,            "Emboss (엠보스)",   new("밝기 오프셋", 0, 255, 128),   Unused),
        new(FilterKind.Erode,             "Erode (침식)",      new("커널 크기(홀수)", 1, 31, 5),  new("반복 횟수", 1, 5, 1)),
        new(FilterKind.Dilate,            "Dilate (팽창)",     new("커널 크기(홀수)", 1, 31, 5),  new("반복 횟수", 1, 5, 1)),
    };

    public static FilterInfo GetInfo(FilterKind kind) => Filters.First(f => f.Kind == kind);

    public static Mat Apply(Mat src, FilterKind kind, double p1, double p2)
    {
        switch (kind)
        {
            case FilterKind.None: return src.Clone();
            case FilterKind.Gray: return ToGray(src);
            // … (GaussianBlur ~ Dilate 는 위 브라우저 예제와 같은 코드)
            default: throw new ArgumentOutOfRangeException(nameof(kind), kind, "알 수 없는 필터");
        }
    }

    /// <summary>슬라이더 값을 min 이상의 홀수 정수로 만듭니다 (블러 · 모폴로지 커널 크기용).</summary>
    private static int Odd(double value, int min)
    {
        int k = (int)Math.Round(value);
        if (k < min) k = min;
        if (k % 2 == 0) k++;
        return k;
    }

    /// <summary>1채널 복사본. 이미 1채널이면 Clone.</summary>
    public static Mat ToGray(Mat src)
    {
        if (src.Channels() == 1) return src.Clone();
        var gray = new Mat();
        Cv2.CvtColor(src, gray, src.Channels() == 4 ? ColorConversionCodes.BGRA2GRAY : ColorConversionCodes.BGR2GRAY);
        return gray;
    }
}`;

  const SEC1 = {
    id: 'cs16-1', title: '앱 설계: 요구 사항 · 화면 레이아웃 · 처리 클래스 분리', minutes: 50,
    goals: ['이미지 처리 앱의 요구 사항을 화면 요소(컨트롤)로 옮길 수 있다', 'Grid · DockPanel 로 도구 패널 + 이미지 2개 레이아웃을 만들 수 있다', '처리 로직을 WPF 와 분리한 FilterPipeline 클래스로 쓸 수 있다'],
    flow: [['도입: 무엇을 만드나', 7], ['화면 레이아웃 XAML', 13], ['FilterPipeline 설계 · 실행', 20], ['정리 · 퀴즈', 10]],
    content: [
      { type: 'h', text: '무엇을 만드나: 이미지 처리 스튜디오' },
      { type: 'p', html: '지금까지 배운 필터(05 색 공간 · 07 이진화 · 08 필터링 · 09 모폴로지 · 10 에지)를 <b>한 앱</b>에 모읍니다. 이미지를 열고, 왼쪽에서 필터를 고르고, 슬라이더로 파라미터를 바꾸면 <b>오른쪽 미리보기가 즉시</b> 바뀌고, [적용]으로 확정하고 [되돌리기]로 취소하고 파일로 저장하는 작은 편집기입니다. 완성 프로젝트는 <code>wpf/Ch16_ImageStudio</code> 입니다.' },
      { type: 'table', head: ['요구 사항', '화면 요소', '이 차시'], rows: [
        ['이미지를 열고 저장한다', '<code>Button</code> + <code>OpenFileDialog</code> / <code>SaveFileDialog</code>', '1 · 2교시'],
        ['필터를 고른다 (12가지)', '<code>ListBox FilterList</code> (ItemsSource = <code>FilterPipeline.Filters</code>)', '1교시'],
        ['파라미터를 조절한다 (2개)', '<code>Slider P1Slider · P2Slider</code> + 값 표시 <code>TextBlock</code>', '2교시'],
        ['원본과 결과를 나란히 본다', '<code>Image OriginalImage</code> · <code>Image ResultImage</code>', '1교시'],
        ['되돌리기 · 다시 실행', '<code>HistoryManager</code> (<code>Stack&lt;Mat&gt;</code> 2개)', '2교시'],
        ['크기 · 채널 · 처리 시간을 알려 준다', '<code>StatusBar</code> · <code>StatusText</code>', '2 · 3교시']
      ], caption: '표 1. 요구 사항 → 화면 요소 대응' },
      { type: 'figure', html: FIG_LAYOUT, caption: '그림 1. 화면 배치도 — Grid 2열(왼쪽 도구 패널 270px · 오른쪽 이미지 2개) + 아래 상태 표시줄' },
      { type: 'h', text: '화면 레이아웃 XAML' },
      { type: 'p', html: '레이아웃의 뼈대는 <b>Grid</b> 입니다. 행은 <code>*</code>(남는 공간)과 <code>Auto</code>(내용 높이 = 상태 표시줄), 열은 <code>270</code>(도구 패널)과 <code>*</code>(이미지). 왼쪽 패널 안쪽은 <b>DockPanel</b> 로 위(파일 · 기록) · 아래(파라미터) · 남는 공간(필터 목록)을 나눕니다. <code>LastChildFill="True"</code> 때문에 <b>마지막 자식</b>인 필터 목록이 남는 공간을 모두 차지합니다.' },
      { type: 'code', title: 'MainWindow.xaml — 화면 전체 (Visual Studio 에서 실행)', code: XAML_MAIN, lang: 'xml', file: 'MainWindow.xaml', run: false,
        desc: '<b>이름(<code>x:Name</code>)과 이벤트(<code>Click</code> · <code>ValueChanged</code> · <code>SelectionChanged</code>) 이름을 기억하세요</b> — 코드 비하인드에서 그대로 씁니다. <code>Style="{StaticResource ToolButton}"</code> 는 <code>App.xaml</code> 의 <code>Application.Resources</code> 에 정의된 버튼 여백 스타일입니다. <code>Image</code> 의 <code>Stretch="Uniform"</code> 은 비율을 지키며 창에 맞춰 줍니다 (02차시).' },
      { type: 'callout', kind: 'wpf', title: '왜 Grid 와 DockPanel 을 섞나?', html: '<ul><li><b>Grid</b>: 행 · 열로 화면을 나눌 때 (가장 많이 씀). <code>Width="*"</code> = 남는 공간 비례 배분, <code>Auto</code> = 내용 크기.</li><li><b>DockPanel</b>: “위에 붙이고 · 아래에 붙이고 · 나머지는 채움” 이 필요할 때. 도구 패널 내부에 딱 맞습니다.</li><li><b>StackPanel</b>: 위에서 아래로 차례대로 쌓을 때 (버튼 모음 · 슬라이더 모음).</li><li><b>WrapPanel</b>: 폭이 좁아지면 다음 줄로 넘기고 싶을 때 (버튼 4개).</li></ul>' },
      { type: 'h', text: '상태 관리 원칙: 누가 어떤 Mat 을 들고 있나' },
      { type: 'p', html: '이미지 처리 앱에서 가장 흔한 버그는 <b>Mat 을 잘못 공유하거나 해제하지 않는 것</b>입니다. <code>Mat</code> 은 .NET 힙이 아니라 <b>네이티브 메모리</b>를 쓰므로 GC 가 알아서 치워 주지 않습니다. 그래서 이 앱은 세 가지 규칙을 정합니다.' },
      { type: 'list', ordered: true, items: [
        '<b>입력은 읽기만</b> — <code>FilterPipeline.Apply(src, …)</code> 는 <code>src</code> 를 절대 바꾸지 않습니다.',
        '<b>결과는 항상 새 Mat</b> — 돌려받은 쪽이 <code>Dispose</code> 책임을 집니다. (필터가 없는 <code>None</code> 도 <code>src.Clone()</code> 을 돌려줍니다 — 그래야 규칙이 한 가지로 유지됩니다.)',
        '<b>갈아치울 때 이전 것을 해제</b> — 화면용 <code>_result</code> 는 새 결과가 나오면 바로 <code>_result?.Dispose()</code>. 작업 이미지는 <code>HistoryManager</code> 가 소유합니다.'
      ] },
      { type: 'figure', html: FIG_PIPE, caption: '그림 2. 처리 파이프라인 — 미리보기(축소본)는 슬라이더마다, [적용] · [저장]은 원본 해상도로' },
      { type: 'callout', kind: 'warn', title: 'Mat 을 안 해제하면?', html: '슬라이더를 1초만 흔들어도 <code>Apply</code> 가 수십 번 호출됩니다. 결과를 해제하지 않으면 1920×1080 컬러 한 장당 약 6MB 가 계속 쌓여 <b>몇 초 만에 수백 MB</b> 가 됩니다. 작업 관리자에서 메모리가 계단처럼 오르면 거의 항상 Mat 누수입니다. 반대로 <b>화면에 붙어 있는 Mat 을 너무 일찍 해제</b>하면 예외가 납니다 — 그래서 “새 결과를 만들고 → 화면에 붙이고 → 그 다음 이전 것을 해제” 순서를 지킵니다.' },
      { type: 'h', text: '처리 로직 분리: FilterPipeline' },
      { type: 'p', html: '핵심 설계는 <b>화면(WPF)과 처리(OpenCvSharp)를 분리</b>하는 것입니다. <code>FilterPipeline</code> 은 <code>using System.Windows;</code> 가 전혀 없는 <b>순수 클래스</b>이므로 ① WPF 앱 ② 콘솔 테스트 ③ 이 브라우저 실습 환경이 <b>같은 코드</b>를 씁니다. 아래 예제를 실행해 보고, 그대로 Visual Studio 의 <code>FilterPipeline.cs</code> 로 옮기면 됩니다.' },
      { type: 'code', title: '예제 1: FilterPipeline 의 뼈대 (필터 5개)', code: EX_MINI,
        desc: '<code>enum FilterKind</code> 로 필터를 고르고, <code>Apply(src, kind, p1, p2)</code> 하나가 모든 분기를 담당합니다. <b>파라미터 2개(p1, p2)로 통일</b>한 것이 요령입니다 — 그러면 화면에는 슬라이더 2개만 두면 되고, 필터가 늘어나도 화면 코드는 바뀌지 않습니다. 마지막 줄에서 <b>원본 평균이 변하지 않은 것</b>을 확인하세요.',
        expect: '원본: 640 x 480, 채널 3\nGray         : 채널 1, 평균 119.2\nGaussianBlur : 채널 3, 평균 115.5\nCanny        : 채널 1, 흰 픽셀 4735\nThreshold    : 채널 1, 흰 픽셀 189204\n원본은 그대로: 평균 115.5' },
      { type: 'code', title: '예제 2: 12가지 필터 전체 (wpf/Ch16_ImageStudio 와 같은 코드)', code: EX_FULL,
        desc: '완성 프로젝트의 <code>FilterPipeline.Apply</code> 와 같은 내용입니다. 새 기법 두 가지: <b>Sepia</b> 는 <code>Cv2.Transform</code> 에 3×3 색 변환 행렬을 주어 B·G·R 을 섞고, <b>Emboss</b> 는 <code>Cv2.Filter2D</code> 의 마지막 인수 <code>delta</code> 로 중간 회색(128)을 더해 음수 값을 보이게 만듭니다. <code>Sharpen</code> 은 <b>언샵 마스크</b>(원본에서 블러를 빼서 더하기)입니다.',
        expect: 'None p1=0 p2=0 -> 640x480 채널 3 평균 115.5\nGray p1=0 p2=0 -> 640x480 채널 1 평균 119.2\nGaussianBlur p1=7 p2=0 -> 640x480 채널 3 평균 115.5\nMedianBlur p1=5 p2=0 -> 640x480 채널 3 평균 115.5\nCanny p1=80 p2=160 -> 640x480 채널 1 평균 3.9\nThreshold p1=128 p2=0 -> 640x480 채널 1 평균 157.1\nAdaptiveThreshold p1=51 p2=15 -> 640x480 채널 1 평균 236.5\nSharpen p1=1.5 p2=5 -> 640x480 채널 3 평균 115.5\nSepia p1=1 p2=0 -> 640x480 채널 3 평균 111.6\nEmboss p1=128 p2=0 -> 640x480 채널 1 평균 233.8\nErode p1=5 p2=1 -> 640x480 채널 3 평균 111.2\nDilate p1=5 p2=1 -> 640x480 채널 3 평균 119.6' },
      { type: 'callout', kind: 'tip', title: '필터마다 슬라이더 이름 · 범위가 달라야 한다', html: 'GaussianBlur 의 p1 은 “커널 크기 1~51”, Canny 의 p1 은 “낮은 임계값 0~255” 입니다. 그래서 필터마다 <b>파라미터 설명</b>(<code>ParamInfo</code>: 이름 · 최소 · 최대 · 기본값 · 소수 자릿수 · 사용 여부)을 같이 들고 다니게 하고, 필터를 고르면 그 설명대로 슬라이더를 다시 설정합니다. 이렇게 <b>데이터로 UI 를 설정</b>하면 필터를 추가할 때 XAML 을 건드리지 않아도 됩니다.' },
      { type: 'code', title: '예제 3: 필터 목록과 파라미터 설명 (ListBox · Slider 설정값)', code: EX_PARAMS,
        desc: '<code>ParamInfo</code> · <code>FilterInfo</code> 는 완성 프로젝트에서 C# 9 의 <code>record</code> 로 되어 있습니다 (값 비교 · 짧은 문법). 여기서는 같은 내용을 일반 클래스로 썼습니다. <code>ToString()</code> 을 표시 이름으로 재정의하면 WPF <code>ListBox</code> 가 <b>그 문자열을 그대로 항목으로 보여 줍니다</b> — <code>DisplayMemberPath</code> 를 쓰지 않아도 됩니다.',
        expect: '[ListBox 에 보일 목록: FilterInfo.ToString() 이 표시 이름]\n  None (원본) / p1 (사용 안 함) 0~1 기본 0 / p2 (사용 안 함)\n  Gray (흑백) / p1 (사용 안 함) 0~1 기본 0 / p2 (사용 안 함)\n  GaussianBlur / p1 커널 크기(홀수) 1~51 기본 7 / p2 시그마 (0=자동)\n  MedianBlur / p1 커널 크기(홀수) 3~31 기본 5 / p2 (사용 안 함)\n  Canny (에지) / p1 낮은 임계값 0~255 기본 80 / p2 높은 임계값\n  Threshold (이진화) / p1 임계값 0~255 기본 128 / p2 반전 (0/1)\n[슬라이더를 움직였을 때 P1Slider 에 넣을 설정]\n  선택: GaussianBlur\n  Minimum=1 Maximum=51 Value=7 IsEnabled=True\n  P2Slider IsEnabled=True, 표시 형식 F1\n[커널 크기 홀수 보정]\n  Odd(0.4, 3) = 3\n  Odd(1.6, 3) = 3\n  Odd(4, 3) = 5\n  Odd(6.5, 3) = 7\n  Odd(8, 3) = 9\n  Odd(20, 3) = 21' },
      { type: 'code', title: '예제 4: Mat 소유 규칙 세 가지 확인', code: EX_OWNER,
        desc: '①처럼 입력에 결과를 덮어쓰면 원본을 잃어 <b>되돌리기가 불가능</b>해집니다. ②처럼 새 Mat 으로 받으면 원본이 남아 [되돌리기]와 [저장](원본 해상도 재계산)이 가능합니다. ③ <code>IsDisposed</code> 로 해제 여부를 확인할 수 있습니다 — 해제된 Mat 을 다시 쓰면 <code>ObjectDisposedException</code> 이 납니다.',
        expect: '원본 평균 115.48\n덮어쓰기(위험): 평균 115.48\n새 Mat(올바름): 평균 115.48, 원본 평균 115.48\n이전 결과 해제: IsDisposed=True, 새 결과 평균 115.48\n새 결과도 해제: IsDisposed=True' },
      { type: 'callout', kind: 'vs', title: '프로젝트 만들기', html: '<ol><li>Visual Studio → <b>새 프로젝트</b> → <b>WPF 애플리케이션</b>(.NET 8) → 이름 <code>Ch16_ImageStudio</code></li><li>NuGet: <code>OpenCvSharp4</code>, <code>OpenCvSharp4.runtime.win</code>, <code>OpenCvSharp4.WpfExtensions</code></li><li><b>클래스 추가</b>: <code>FilterPipeline.cs</code>, <code>HistoryManager.cs</code>, <code>ImageFile.cs</code> — 화면 코드와 섞지 않습니다</li><li>예제 이미지를 쓰려면 <code>.csproj</code> 에 <code>&lt;Content Include="..\\..\\assets\\images\\*.png" Link="images\\%(Filename)%(Extension)" CopyToOutputDirectory="PreserveNewest" /&gt;</code></li></ol>' },
      { type: 'code', title: 'FilterPipeline.cs — 완성 프로젝트의 실제 코드 (발췌)', code: CS_PIPELINE, run: false, local: true, file: 'FilterPipeline.cs',
        desc: 'C# 9 <code>record</code> 와 대상 타입 <code>new(...)</code> 문법으로 목록을 아주 짧게 썼습니다. <code>IReadOnlyList&lt;FilterInfo&gt; Filters</code> 를 <code>FilterList.ItemsSource</code> 에 그대로 넣으면 ListBox 가 채워집니다. <code>Apply</code> 의 나머지 분기는 위 예제 2 와 같습니다.' },
      { type: 'wpf', title: 'Ch16_ImageStudio 프로젝트 열어 보기', project: 'Ch16_ImageStudio', html: '<code>wpf/Ch16_ImageStudio/Ch16_ImageStudio.csproj</code> 를 Visual Studio 에서 열고 <b>F5</b> → [열기] → <code>images/sample_color.png</code>. 이 차시에서 볼 파일은 <code>MainWindow.xaml</code>(화면) · <code>FilterPipeline.cs</code>(처리) · <code>HistoryManager.cs</code>(기록) · <code>ImageFile.cs</code>(한글 경로 안전한 읽기/쓰기) 네 개입니다.' }
    ],
    practice: [
      {
        title: 'FilterPipeline 에 MedianBlur 추가하기', level: 1,
        desc: '예제 1 의 <code>FilterKind</code> 에 <code>MedianBlur</code> 를 추가하고 <code>Apply</code> 에서 처리하세요. 커널 크기는 <code>Odd(p1, 3)</code> 으로 보정합니다 (MedianBlur 는 3 이상 홀수만 받습니다). <code>images/salt_pepper.png</code> 에 적용해 평균과 흰 픽셀 수를 출력하세요.',
        hint: '<code>Cv2.MedianBlur(src, dst, Odd(p1, 3));</code> — 반환은 <code>dst</code>. <code>salt_pepper.png</code> 는 1채널이므로 <code>ToGray</code> 는 <code>Clone</code> 만 합니다.',
        expect: 'MedianBlur k=5 : 채널 1, 평균 71.8\nMedianBlur k=4 -> 홀수 5 로 보정됨: 평균 71.8',
        starter: `using System;
using OpenCvSharp;

enum FilterKind { None, Gray, GaussianBlur, MedianBlur }

static class FilterPipeline
{
    public static Mat Apply(Mat src, FilterKind kind, double p1, double p2)
    {
        switch (kind)
        {
            case FilterKind.None:
                return src.Clone();
            case FilterKind.Gray:
                return ToGray(src);
            case FilterKind.GaussianBlur:
            {
                var dst = new Mat();
                Cv2.GaussianBlur(src, dst, new Size(Odd(p1, 1), Odd(p1, 1)), p2);
                return dst;
            }
            // TODO: case FilterKind.MedianBlur 를 추가하세요 (Cv2.MedianBlur, 커널은 Odd(p1, 3))
            default:
                throw new ArgumentException("알 수 없는 필터: " + kind);
        }
    }

    public static int Odd(double value, int min)
    {
        int k = (int)Math.Round(value);
        if (k < min) k = min;
        if (k % 2 == 0) k++;
        return k;
    }

    public static Mat ToGray(Mat src)
    {
        if (src.Channels() == 1) return src.Clone();
        var dst = new Mat();
        Cv2.CvtColor(src, dst, ColorConversionCodes.BGR2GRAY);
        return dst;
    }
}

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
        using Mat blur = FilterPipeline.Apply(src, FilterKind.GaussianBlur, 5, 0);
        Console.WriteLine($"GaussianBlur k=5 : 채널 {blur.Channels()}, 평균 {Cv2.Mean(blur).Val0:F1}");
        // TODO: MedianBlur 를 적용해 결과를 출력하고, p1 = 4 를 주면 5 로 보정되는지 확인하세요
        Cv2.ImShow("blur", blur);
        Cv2.WaitKey(0);
    }
}`,
        solution: `using System;
using OpenCvSharp;

enum FilterKind { None, Gray, GaussianBlur, MedianBlur }

static class FilterPipeline
{
    public static Mat Apply(Mat src, FilterKind kind, double p1, double p2)
    {
        switch (kind)
        {
            case FilterKind.None:
                return src.Clone();
            case FilterKind.Gray:
                return ToGray(src);
            case FilterKind.GaussianBlur:
            {
                var dst = new Mat();
                Cv2.GaussianBlur(src, dst, new Size(Odd(p1, 1), Odd(p1, 1)), p2);
                return dst;
            }
            case FilterKind.MedianBlur:
            {
                var dst = new Mat();
                Cv2.MedianBlur(src, dst, Odd(p1, 3));
                return dst;
            }
            default:
                throw new ArgumentException("알 수 없는 필터: " + kind);
        }
    }

    public static int Odd(double value, int min)
    {
        int k = (int)Math.Round(value);
        if (k < min) k = min;
        if (k % 2 == 0) k++;
        return k;
    }

    public static Mat ToGray(Mat src)
    {
        if (src.Channels() == 1) return src.Clone();
        var dst = new Mat();
        Cv2.CvtColor(src, dst, ColorConversionCodes.BGR2GRAY);
        return dst;
    }
}

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
        using Mat med5 = FilterPipeline.Apply(src, FilterKind.MedianBlur, 5, 0);
        Console.WriteLine($"MedianBlur k=5 : 채널 {med5.Channels()}, 평균 {Cv2.Mean(med5).Val0:F1}");
        using Mat med4 = FilterPipeline.Apply(src, FilterKind.MedianBlur, 4, 0);
        Console.WriteLine($"MedianBlur k=4 -> 홀수 5 로 보정됨: 평균 {Cv2.Mean(med4).Val0:F1}");
        Cv2.ImShow("median", med5);
        Cv2.WaitKey(0);
    }
}`
      },
      {
        title: 'Sharpen(언샵 마스크) 필터 추가하기', level: 2,
        desc: '<code>Sharpen</code> 을 추가하세요. 공식은 <b>결과 = (1 + 강도)·원본 − 강도·블러</b> 이고 <code>Cv2.AddWeighted(src, 1 + p1, blur, -p1, 0, dst)</code> 한 줄로 됩니다. 블러 커널 크기는 p2(홀수 보정). 강도 p1 = 0 · 1 · 3 에서 <b>표준편차</b>(<code>Cv2.MeanStdDev</code>)가 어떻게 커지는지 출력하세요.',
        hint: '<code>Cv2.MeanStdDev(mat, out Scalar mean, out Scalar sd);</code> → <code>sd.Val0</code>. 강도가 커지면 대비(표준편차)가 커지고, 너무 크면 경계에 흰 테두리(halo)가 생깁니다.',
        expect: '강도 0.0 -> 표준편차 38.75\n강도 1.0 -> 표준편차 39.00\n강도 3.0 -> 표준편차 39.65',
        starter: `using System;
using OpenCvSharp;

class Program
{
    static int Odd(double v, int min)
    {
        int k = (int)Math.Round(v);
        if (k < min) k = min;
        if (k % 2 == 0) k++;
        return k;
    }

    static Mat Sharpen(Mat src, double strength, double kernel)
    {
        // TODO: GaussianBlur 로 blur 를 만들고 Cv2.AddWeighted 로 언샵 마스크를 계산해 새 Mat 을 돌려주세요
        return src.Clone();
    }

    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        double[] strengths = { 0, 1, 3 };
        foreach (double s in strengths)
        {
            using Mat dst = Sharpen(src, s, 5);
            Cv2.MeanStdDev(dst, out Scalar mean, out Scalar sd);
            Console.WriteLine($"강도 {s:F1} -> 표준편차 {sd.Val0:F2}");
        }
        Cv2.WaitKey(0);
    }
}`,
        solution: `using System;
using OpenCvSharp;

class Program
{
    static int Odd(double v, int min)
    {
        int k = (int)Math.Round(v);
        if (k < min) k = min;
        if (k % 2 == 0) k++;
        return k;
    }

    static Mat Sharpen(Mat src, double strength, double kernel)
    {
        int k = Odd(kernel, 3);
        using var blur = new Mat();
        Cv2.GaussianBlur(src, blur, new Size(k, k), 0);
        var dst = new Mat();
        Cv2.AddWeighted(src, 1 + strength, blur, -strength, 0, dst);
        return dst;
    }

    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        double[] strengths = { 0, 1, 3 };
        foreach (double s in strengths)
        {
            using Mat dst = Sharpen(src, s, 5);
            Cv2.MeanStdDev(dst, out Scalar mean, out Scalar sd);
            Console.WriteLine($"강도 {s:F1} -> 표준편차 {sd.Val0:F2}");
            Cv2.ImShow("sharpen " + s, dst);
        }
        Cv2.WaitKey(0);
    }
}`
      }
    ],
    quiz: [
      { q: '<code>FilterPipeline.Apply</code> 가 <code>FilterKind.None</code> 에서도 <code>src.Clone()</code> 을 돌려주는 이유는?', options: ['Clone 이 더 빠르기 때문', '호출한 쪽이 항상 “새 Mat 을 받아 Dispose” 라는 한 가지 규칙만 지키면 되도록', '원본을 흑백으로 바꾸기 위해', 'WPF 가 Clone 된 Mat 만 표시할 수 있기 때문'], answer: 1,
        explain: '반환 규칙을 하나로 통일하면 <code>if (kind == None)</code> 같은 예외 처리가 사라집니다. <code>src</code> 를 그대로 돌려주면 호출한 쪽이 그것을 Dispose 했을 때 <b>원본이 파괴</b>되므로 아주 위험합니다.' },
      { q: '왼쪽 도구 패널에서 <b>필터 ListBox</b> 가 남는 공간을 모두 차지하게 만든 것은?', options: ['<code>Grid.RowDefinitions</code> 의 <code>Auto</code>', '<code>DockPanel</code> 의 <code>LastChildFill="True"</code> + 마지막 자식', '<code>StackPanel</code> 의 <code>Orientation="Vertical"</code>', '<code>WrapPanel</code>'], answer: 1,
        explain: '<code>DockPanel</code> 은 <code>DockPanel.Dock="Top"/"Bottom"</code> 으로 붙인 자식을 먼저 배치하고, <code>LastChildFill="True"</code> 이면 <b>마지막 자식</b>이 남은 공간을 채웁니다. XAML 에서 필터 목록 DockPanel 을 맨 마지막에 둔 이유입니다.' },
      { q: '슬라이더 값 <code>6.5</code> 가 들어왔을 때 <code>Odd(6.5, 3)</code> 의 결과는?', options: ['5', '6', '7', '9'], answer: 2,
        explain: '<code>Math.Round(6.5)</code> = 6 (짝수 쪽으로 반올림, 은행가 반올림) → 짝수이므로 +1 → <b>7</b>. 블러 · 모폴로지 커널은 중심 픽셀이 있어야 하므로 홀수여야 합니다.' },
      { q: '처리 로직을 <code>FilterPipeline</code> 이라는 <u>별도 클래스</u>로 뺀 가장 큰 이유는?', options: ['XAML 파일이 짧아져서', 'WPF 없이도(콘솔 · 단위 테스트 · 이 브라우저 환경) 같은 코드를 실행 · 검증할 수 있어서', 'OpenCvSharp 이 static 클래스만 허용해서', '화면이 더 빨라져서'], answer: 1,
        explain: '화면 코드와 처리 코드가 섞이면 테스트도, 재사용도 어렵습니다. <code>FilterPipeline</code> 에는 <code>System.Windows</code> 참조가 <b>하나도 없어야</b> 합니다 — 그것이 분리가 잘 됐는지 확인하는 기준입니다.' },
      { q: '<code>Mat</code> 을 <code>Dispose</code> 해야 하는 이유로 옳은 것은?', options: ['C# 의 GC 가 Mat 을 수집하지 못하도록 막기 위해', 'Mat 이 네이티브(관리되지 않는) 메모리를 쓰므로 GC 가 즉시 회수해 주지 않기 때문', 'Mat 이 파일 핸들을 열어 두기 때문', 'Dispose 를 부르면 이미지가 화면에서 지워지기 때문'], answer: 1,
        explain: 'Mat 의 픽셀 버퍼는 C++ 쪽 메모리입니다. .NET 힙에는 작은 래퍼만 있어 GC 가 “메모리 압박”을 못 느끼고, 결국 네이티브 메모리만 쌓입니다. <code>using</code> · <code>using var</code> · 명시적 <code>Dispose</code> 로 꼭 해제하세요.' }
    ],
    slides: [
      { layout: 'title', title: 'WPF 이미지 처리 스튜디오 만들기', subtitle: '1교시 — 앱 설계: 요구 사항 · 레이아웃 · 처리 클래스 분리', notes: '<p>Part 4 의 시작입니다. 💬 “지금까지 배운 필터가 몇 개나 됐죠?” — 블러 · 샤프닝 · 이진화 · 모폴로지 · 에지. 이번 차시는 <b>새 알고리즘을 배우는 시간이 아니라</b>, 배운 것을 하나의 앱으로 조립하는 시간이라고 분명히 말해 줍니다. 완성 앱 화면(Ch16_ImageStudio 실행 화면)을 먼저 30초 보여 주면 동기가 확 올라갑니다. (3분)</p>' },
      { layout: 'table', title: '요구 사항 → 화면 요소', head: ['요구 사항', '화면 요소'], rows: [
        ['이미지 열기 · 저장', '<code>Button</code> + Open/SaveFileDialog'],
        ['필터 선택 (12가지)', '<code>ListBox FilterList</code>'],
        ['파라미터 조절 (2개)', '<code>Slider P1Slider · P2Slider</code>'],
        ['원본 · 결과 나란히', '<code>Image</code> 2개'],
        ['되돌리기 · 다시 실행', '<code>Stack&lt;Mat&gt;</code> 2개'],
        ['크기 · 시간 표시', '<code>StatusBar</code>']
      ], notes: '<p>요구 사항을 먼저 적고 → 각각을 어떤 컨트롤로 만들지 짝지어 보는 습관을 강조합니다. 💬 “파라미터가 필터마다 1개일 때도 2개일 때도 있는데, 슬라이더는 몇 개를 둘까요?” — 2개로 고정하고 안 쓰는 것은 <b>비활성화</b>. 실무에서도 “가장 많은 경우에 맞춘 고정 UI + 데이터로 설정” 이 흔한 해법입니다. (5분)</p>' },
      { layout: 'diagram', title: '화면 배치도', html: FIG_LAYOUT, caption: 'Grid 2열 — 왼쪽 도구 패널(270px) · 오른쪽 이미지 2개 · 아래 상태 표시줄', notes: '<p>그림에서 컨트롤 이름(<code>FilterList</code>, <code>P1Slider</code>, <code>OriginalImage</code>, <code>ResultImage</code>, <code>StatusText</code>)을 하나씩 손으로 짚어 줍니다. 이 이름들이 곧 코드 비하인드의 변수 이름이라는 것이 핵심. (4분)</p>' },
      { layout: 'code', title: 'XAML ① 전체 뼈대 (Grid)', lang: 'xml', file: 'MainWindow.xaml', run: false, code: `<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="*" />     <!-- 내용 -->
        <RowDefinition Height="Auto" />  <!-- 상태 표시줄 -->
    </Grid.RowDefinitions>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="270" /> <!-- 도구 패널 -->
        <ColumnDefinition Width="*" />   <!-- 이미지 2개 -->
    </Grid.ColumnDefinitions>

    <DockPanel Grid.Row="0" Grid.Column="0" LastChildFill="True">
        <!-- 위: 파일 · 기록 / 아래: 파라미터 / 나머지: 필터 목록 -->
    </DockPanel>

    <Grid Grid.Row="0" Grid.Column="1">
        <Image x:Name="OriginalImage" Grid.Column="0" Stretch="Uniform" />
        <Image x:Name="ResultImage"   Grid.Column="1" Stretch="Uniform" />
    </Grid>

    <StatusBar Grid.Row="1" Grid.ColumnSpan="2">
        <StatusBarItem><TextBlock x:Name="StatusText" /></StatusBarItem>
    </StatusBar>
</Grid>`, points: ['<code>*</code> = 남는 공간, <code>Auto</code> = 내용 크기, 숫자 = 고정 px', '<code>Grid.Row</code> · <code>Grid.Column</code> 으로 자식 위치 지정', '<code>Grid.ColumnSpan</code> 으로 두 열을 가로지르기'], notes: '<p>XAML 을 처음 보는 학생이 있으면 “HTML 의 표와 비슷하다”로 안심시킵니다. 실제 파일을 Visual Studio 에서 열어 <b>디자이너</b>에 바로 반영되는 것을 보여 주면 이해가 빠릅니다. 💬 “상태 표시줄 행을 <code>Auto</code> 대신 <code>*</code> 로 하면?” — 화면 절반을 차지한다. (5분)</p>' },
      { layout: 'code', title: 'XAML ② 도구 패널 (DockPanel)', lang: 'xml', file: 'MainWindow.xaml', run: false, code: `<DockPanel Grid.Row="0" Grid.Column="0" Background="#FFF3F3F3" LastChildFill="True">
    <StackPanel DockPanel.Dock="Top" Margin="8">
        <TextBlock Text="파일" FontWeight="Bold" />
        <WrapPanel>
            <Button Content="열기" Click="OpenButton_Click" />
            <Button Content="저장" Click="SaveButton_Click" />
        </WrapPanel>
        <TextBlock x:Name="HistoryText" Text="기록: -" Foreground="Gray" />
    </StackPanel>

    <StackPanel DockPanel.Dock="Bottom" Margin="8">
        <TextBlock x:Name="P1Label" Text="p1" />
        <Slider x:Name="P1Slider" ValueChanged="Param_ValueChanged" />
        <TextBlock x:Name="P2Label" Text="p2" />
        <Slider x:Name="P2Slider" ValueChanged="Param_ValueChanged" />
    </StackPanel>

    <DockPanel Margin="8,0,8,8">   <!-- 마지막 자식 = 남는 공간 전부 -->
        <TextBlock DockPanel.Dock="Top" Text="필터" FontWeight="Bold" />
        <ListBox x:Name="FilterList" SelectionChanged="FilterList_SelectionChanged" />
    </DockPanel>
</DockPanel>`, points: ['<code>Dock="Top"</code> · <code>"Bottom"</code> 먼저 배치', '<code>LastChildFill</code> → 마지막 자식이 남는 공간', '<code>Click</code> · <code>ValueChanged</code> · <code>SelectionChanged</code> = 코드 비하인드 메서드 이름'], notes: '<p>배치 순서가 결과를 바꾼다는 점이 포인트입니다: DockPanel 은 <b>XAML 에 쓴 순서대로</b> 공간을 떼어 갑니다. 💬 “필터 목록 DockPanel 을 맨 위로 옮기면?” — 목록이 위쪽 일부만 차지하고 슬라이더가 아래 남는 공간을 다 먹는다. (4분)</p>' },
      { layout: 'diagram', title: '처리 파이프라인과 Mat 소유', html: FIG_PIPE, caption: 'Current(원본 해상도) → _preview(축소) → Apply → _result(화면). [적용] · [저장]은 원본 해상도로', notes: '<p>이 그림이 16차시 전체의 지도입니다. 세 가지 규칙을 학생이 따라 읽게 하세요: ① 입력은 안 바꾼다 ② 결과는 새 Mat ③ 이전 결과는 Dispose. 💬 “미리보기를 축소본으로 만드는 이유?” — 슬라이더를 흔들 때 4000×3000 을 매번 처리하면 UI 가 멈춘다(2교시에서 시간 측정). (5분)</p>' },
      { layout: 'code', title: 'FilterPipeline: 분기 하나로 모든 필터', code: `enum FilterKind { None, Gray, GaussianBlur, Canny, Threshold }

static class FilterPipeline
{
    // src 는 바꾸지 않고, 결과는 항상 새 Mat
    public static Mat Apply(Mat src, FilterKind kind, double p1, double p2)
    {
        switch (kind)
        {
            case FilterKind.None: return src.Clone();
            case FilterKind.Gray: return ToGray(src);
            case FilterKind.GaussianBlur:
            {
                int k = Odd(p1, 1);                // 홀수 보정
                var dst = new Mat();
                Cv2.GaussianBlur(src, dst, new Size(k, k), p2);
                return dst;
            }
            // Canny · Threshold · … 도 같은 모양 (필요하면 using var gray = ToGray(src))
        }
        throw new ArgumentException("알 수 없는 필터");
    }
}`, run: false, points: ['파라미터를 <b>p1 · p2 두 개</b>로 통일 → 슬라이더도 2개로 고정', '<code>using var gray</code>: 중간 Mat 은 메서드 끝에서 자동 해제', '반환 Mat 의 Dispose 책임은 <b>호출한 쪽</b>'], notes: '<p>여기서 “왜 p1, p2 인가”를 다시 강조합니다. 이름이 의미를 잃는 대신(단점) 화면이 단순해지고(장점) 필터 추가가 쉬워집니다 — <code>ParamInfo</code> 로 이름을 따로 들고 다니면 단점도 해결됩니다. 학생들은 브라우저 예제 1 을 실행합니다. (6분)</p>' },
      { layout: 'code', title: '실행: 필터 4개 결과 비교', code: `using var src = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
Console.WriteLine($"원본: {src.Width} x {src.Height}, 채널 {src.Channels()}");

using Mat gray = FilterPipeline.Apply(src, FilterKind.Gray, 0, 0);
using Mat blur = FilterPipeline.Apply(src, FilterKind.GaussianBlur, 7, 0);
using Mat edge = FilterPipeline.Apply(src, FilterKind.Canny, 80, 160);
using Mat bin  = FilterPipeline.Apply(src, FilterKind.Threshold, 128, 0);

Console.WriteLine($"Gray  : 채널 {gray.Channels()}");
Console.WriteLine($"Canny : 흰 픽셀 {Cv2.CountNonZero(edge)}");
Console.WriteLine($"원본은 그대로: 평균 {Cv2.Mean(src).Val0:F1}");

Cv2.ImShow("blur", blur);
Cv2.ImShow("edge", edge);
Cv2.WaitKey(0);`, run: false, points: ['<code>Gray</code> · <code>Canny</code> · <code>Threshold</code> 는 1채널, 나머지는 원본 채널 유지', '마지막 줄: 원본 평균이 <b>변하지 않았다</b>', '화면에는 <code>ResultImage.Source = result.ToBitmapSource()</code>'], notes: '<p>결과 창의 두 이미지를 비교하게 합니다. 💬 “Canny 결과의 채널이 1인데, 왼쪽 원본은 3채널입니다. WPF <code>Image</code> 에 붙일 때 문제가 없을까요?” — <code>ToBitmapSource()</code> 가 채널 수에 맞는 픽셀 형식(Gray8 / Bgr24)을 골라 줍니다. (4분)</p>' },
      { layout: 'two', title: '필터마다 다른 슬라이더', left: { title: 'ParamInfo (데이터)', bullets: ['이름: “커널 크기(홀수)”', '범위: 1 ~ 51', '기본값: 7', '소수 자릿수: 0 (정수)', '사용 여부: true / false'] }, right: { title: '필터를 고르면', bullets: ['<code>P1Slider.Minimum = info.Min</code>', '<code>P1Slider.Maximum = info.Max</code>', '<code>P1Slider.Value = info.Default</code>', '<code>P1Slider.IsEnabled = info.Enabled</code>', '<code>P1Label.Text = info.Label</code>'] }, notes: '<p>“UI 를 코드로 바꾸지 말고 <b>데이터로 설정</b>하라” 는 원칙입니다. 필터를 하나 추가할 때 XAML 을 전혀 건드리지 않는다는 것을 강조하세요. 💬 “MedianBlur 는 p2 가 필요 없는데 어떻게 하죠?” — <code>Unused</code> ParamInfo 로 슬라이더를 비활성화. (4분)</p>' },
      { layout: 'bullets', title: 'Mat 소유 규칙 3가지', lead: '이미지 앱 버그의 90%는 여기서 나옵니다', bullets: [
        '<b>① 입력은 읽기만</b> — <code>Apply(src, …)</code> 는 src 를 바꾸지 않는다',
        '<b>② 결과는 항상 새 Mat</b> — 받은 쪽이 Dispose 책임',
        '<b>③ 갈아치울 때 이전 것을 Dispose</b> — <code>_result?.Dispose(); _result = 새결과;</code>',
        ['지키지 않으면', ['원본이 사라져 되돌리기 불가', '네이티브 메모리 누수 (수백 MB/초)', '해제된 Mat 사용 → <code>ObjectDisposedException</code>']]
      ], notes: '<p>실제 사고 사례처럼 이야기하면 잘 기억합니다: “슬라이더를 10초 흔들었더니 메모리가 2GB 가 됐다”. 순서도 강조: <b>새 결과를 화면에 붙인 다음</b> 이전 것을 해제(반대로 하면 화면이 깨질 수 있음). (4분)</p>' },
      { layout: 'quiz', title: '확인 퀴즈', q: '<code>Odd(6.5, 3)</code> 의 결과는?', options: ['5', '6', '7', '9'], answer: 2, explain: '<code>Math.Round(6.5)</code> = 6 (은행가 반올림) → 짝수 → +1 → <b>7</b>. 커널은 중심 픽셀이 있어야 하므로 홀수.', notes: '<p>은행가 반올림(banker’s rounding)은 C# 초보가 잘 모르는 함정입니다. <code>Math.Round(0.5)</code> = 0, <code>Math.Round(1.5)</code> = 2 를 직접 실행해 보여 주면 좋습니다. (2분)</p>' },
      { layout: 'practice', title: '실습: MedianBlur 추가', desc: '<p><code>FilterKind</code> 에 <code>MedianBlur</code> 를 추가하고 <code>Apply</code> 에서 처리하세요.</p><ul><li>커널은 <code>Odd(p1, 3)</code> (3 이상 홀수)</li><li><code>images/salt_pepper.png</code> 로 확인 — 소금·후추 잡음이 사라집니다</li><li>p1 = 4 를 주면 5 로 보정되는지 확인</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static int Odd(double v, int min)
    {
        int k = (int)Math.Round(v);
        if (k < min) k = min;
        if (k % 2 == 0) k++;
        return k;
    }

    static void Main()
    {
        using var src = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
        var dst = src.Clone();
        // TODO: Cv2.MedianBlur(src, dst, Odd(4, 3)); 로 잡음을 제거하세요
        Console.WriteLine($"평균 {Cv2.Mean(dst).Val0:F1}");
        dst.Dispose();
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static int Odd(double v, int min)
    {
        int k = (int)Math.Round(v);
        if (k < min) k = min;
        if (k % 2 == 0) k++;
        return k;
    }

    static void Main()
    {
        using var src = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
        var dst = new Mat();
        Cv2.MedianBlur(src, dst, Odd(4, 3));      // 4 -> 5 로 보정
        Console.WriteLine($"평균 {Cv2.Mean(dst).Val0:F1}");
        dst.Dispose();
    }
}`, notes: '<p>학생들은 브라우저 실습의 starter 로 작업합니다. 정답 평균은 60.6. 흔한 오류 두 가지: ① <code>Odd(p1, 1)</code> 로 두어 커널 1 이 되면 MedianBlur 가 오류(3 이상 필요) ② <code>dst</code> 를 만들지 않고 <code>src</code> 에 덮어쓰기. 빨리 끝낸 학생에게는 실습 2(Sharpen)를 시킵니다. (8분)</p>' },
      { layout: 'summary', title: '1교시 정리', bullets: [
        '요구 사항을 <b>컨트롤</b>로 옮긴다: ListBox(필터) · Slider 2개(파라미터) · Image 2개 · StatusBar',
        '레이아웃: <b>Grid</b>(행 · 열) 안에 <b>DockPanel</b>(위 · 아래 · 나머지)',
        '처리 로직은 <b>FilterPipeline</b> 으로 분리 — WPF 참조 0개, 콘솔에서도 실행',
        '<code>Apply(src, kind, p1, p2)</code>: 입력 불변 · 결과는 새 Mat · 커널은 홀수 보정',
        '다음 시간: 슬라이더를 움직이면 <b>즉시 미리보기</b>, 되돌리기 · 다시 실행 · 저장'
      ], notes: '<p>세 가지 Mat 규칙을 다시 한 번 구두로 확인합니다. 다음 시간 예고: “슬라이더를 흔들면 왜 앱이 멈추는지, 어떻게 막는지”. 숙제: 완성 프로젝트를 내려받아 F5 로 실행해 보기. (2분)</p>' }
    ]
  };

  // ───────────────────────────── 2교시 ─────────────────────────────

  // 그림 3: 슬라이더 이벤트 흐름
  const FIG_EVENT = `<svg viewBox="0 0 740 250" role="img" aria-label="슬라이더 ValueChanged 이벤트가 재처리와 화면 갱신으로 이어지는 흐름">
  ${ARROW('c16a2')}
  <rect x="16" y="34" width="150" height="54" rx="10" class="p1s"/>
  <text x="91" y="56" text-anchor="middle" class="tx">사용자가 Slider 를</text>
  <text x="91" y="74" text-anchor="middle" class="tx">끈다</text>
  <rect x="206" y="34" width="180" height="54" rx="10" class="p2s"/>
  <text x="296" y="56" text-anchor="middle" class="tx-b">Param_ValueChanged</text>
  <text x="296" y="74" text-anchor="middle" class="tx-m">값 표시 TextBlock 갱신</text>
  <rect x="426" y="34" width="150" height="54" rx="10" class="p3s"/>
  <text x="501" y="56" text-anchor="middle" class="tx-b">ApplyPreview()</text>
  <text x="501" y="74" text-anchor="middle" class="tx-m">_preview 에 적용</text>
  <rect x="612" y="34" width="112" height="54" rx="10" class="p4s"/>
  <text x="668" y="56" text-anchor="middle" class="tx">ResultImage</text>
  <text x="668" y="74" text-anchor="middle" class="tx-m">.Source 교체</text>
  <line x1="168" y1="61" x2="202" y2="61" class="ln" stroke-width="2" marker-end="url(#c16a2)"/>
  <line x1="388" y1="61" x2="422" y2="61" class="ln" stroke-width="2" marker-end="url(#c16a2)"/>
  <line x1="578" y1="61" x2="608" y2="61" class="ln" stroke-width="2" marker-end="url(#c16a2)"/>

  <rect x="16" y="120" width="360" height="54" rx="10" class="p1s"/>
  <text x="196" y="142" text-anchor="middle" class="tx">필터 선택 변경 (FilterList_SelectionChanged)</text>
  <text x="196" y="160" text-anchor="middle" class="tx-m">ConfigureSlider 로 범위 · 기본값 · 이름 재설정</text>
  <rect x="426" y="120" width="298" height="54" rx="10" class="p5s"/>
  <text x="575" y="142" text-anchor="middle" class="tx-b">_updatingUi = true</text>
  <text x="575" y="160" text-anchor="middle" class="tx-m">코드로 Value 를 바꾸는 동안 ValueChanged 무시</text>
  <line x1="378" y1="147" x2="422" y2="147" class="ln" stroke-width="2" marker-end="url(#c16a2)"/>

  <text x="370" y="204" text-anchor="middle" class="tx-m">슬라이더는 1초에 수십 번 이벤트를 낸다 → 미리보기는 축소본으로 (원본 963ms vs 축소 33ms)</text>
  <text x="370" y="228" text-anchor="middle" class="tx-m">[적용] 을 눌렀을 때만 원본 해상도로 처리하고 Undo 스택에 쌓는다</text>
</svg>`;

  // 그림 4: Undo / Redo 스택
  const FIG_STACK = `<svg viewBox="0 0 740 300" role="img" aria-label="되돌리기 스택과 다시 실행 스택, 현재 이미지의 관계">
  ${ARROW('c16a3')}
  <rect x="40" y="40" width="180" height="200" rx="10" class="card-bg"/>
  <text x="130" y="62" text-anchor="middle" class="tx-b">_undo (Stack)</text>
  <rect x="56" y="74" width="148" height="34" rx="6" class="p2s"/><text x="130" y="96" text-anchor="middle" class="tx">Gray 이전 상태</text>
  <rect x="56" y="114" width="148" height="34" rx="6" class="p2s"/><text x="130" y="136" text-anchor="middle" class="tx">원본 (열기 직후)</text>
  <text x="130" y="176" text-anchor="middle" class="tx-m">↑ 위가 가장 최근</text>
  <text x="130" y="200" text-anchor="middle" class="tx-m">Pop → Current 로</text>
  <text x="130" y="224" text-anchor="middle" class="tx-m">UndoCount = 2</text>

  <rect x="280" y="80" width="180" height="70" rx="10" class="p3s"/>
  <text x="370" y="106" text-anchor="middle" class="tx-b">Current</text>
  <text x="370" y="126" text-anchor="middle" class="tx-m">지금 작업 이미지</text>
  <text x="370" y="144" text-anchor="middle" class="tx-m">화면 왼쪽에 표시</text>

  <rect x="520" y="40" width="180" height="200" rx="10" class="card-bg"/>
  <text x="610" y="62" text-anchor="middle" class="tx-b">_redo (Stack)</text>
  <rect x="536" y="74" width="148" height="34" rx="6" class="p4s"/><text x="610" y="96" text-anchor="middle" class="tx">되돌린 Blur 결과</text>
  <text x="610" y="140" text-anchor="middle" class="tx-m">Push 하면(새 [적용])</text>
  <text x="610" y="164" text-anchor="middle" class="tx-m">전부 Dispose 후 비움</text>
  <text x="610" y="200" text-anchor="middle" class="tx-m">RedoCount = 1</text>

  <line x1="278" y1="100" x2="226" y2="100" class="ln" stroke-width="2" marker-end="url(#c16a3)"/>
  <text x="252" y="88" text-anchor="middle" class="tx-m">Push</text>
  <line x1="226" y1="128" x2="278" y2="128" class="ln" stroke-width="2" marker-end="url(#c16a3)"/>
  <text x="252" y="150" text-anchor="middle" class="tx-m">Pop</text>
  <line x1="462" y1="100" x2="516" y2="100" class="ln" stroke-width="2" marker-end="url(#c16a3)"/>
  <text x="489" y="88" text-anchor="middle" class="tx-m">Undo</text>
  <line x1="516" y1="128" x2="462" y2="128" class="ln" stroke-width="2" marker-end="url(#c16a3)"/>
  <text x="489" y="150" text-anchor="middle" class="tx-m">Redo</text>

  <text x="370" y="266" text-anchor="middle" class="tx-m">⚠ 스택에서 <tspan class="tx-b">빠지는</tspan> Mat 은 그 자리에서 Dispose — 안 그러면 되돌리기를 많이 쓸수록 메모리가 쌓인다</text>
  <text x="370" y="288" text-anchor="middle" class="tx-m">버튼 활성화: UndoButton.IsEnabled = CanUndo, RedoButton.IsEnabled = CanRedo</text>
</svg>`;

  const CS_PREVIEW = `// MainWindow.xaml.cs — 아래는 모두 "public partial class MainWindow : Window { … }" 안의 멤버입니다
private const int PreviewMaxSize = 1280;

private readonly HistoryManager _history = new();
private Mat? _preview;          // Current 를 1280px 이하로 축소한 미리보기 입력
private Mat? _result;           // _preview 에 필터를 적용한 결과 (화면 오른쪽)
private double _previewScale = 1.0;
private bool _updatingUi;       // 슬라이더 범위를 코드로 바꾸는 동안 ValueChanged 무시

private void Param_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
{
    if (_updatingUi || P1Value == null || P2Value == null) return;
    P1Value.Text = P1.ToString($"F{SelectedFilter.P1.Decimals}");
    P2Value.Text = P2.ToString($"F{SelectedFilter.P2.Decimals}");
    ApplyPreview();             // 슬라이더를 움직이면 즉시 재처리 (축소 미리보기라 빠름)
}

private void FilterList_SelectionChanged(object sender, SelectionChangedEventArgs e)
{
    if (P1Slider == null || P2Slider == null) return;     // XAML 초기화 중
    ConfigureSlider(P1Slider, P1Label, P1Value, SelectedFilter.P1);
    ConfigureSlider(P2Slider, P2Label, P2Value, SelectedFilter.P2);
    ApplyPreview();
}

/// <summary>필터의 ParamInfo 대로 슬라이더 범위 · 기본값 · 사용 여부를 맞춥니다.</summary>
private void ConfigureSlider(Slider slider, TextBlock label, TextBlock valueText, ParamInfo info)
{
    _updatingUi = true;
    try
    {
        slider.Minimum = info.Min;
        slider.Maximum = info.Max;
        slider.IsSnapToTickEnabled = info.Decimals == 0;   // 정수 파라미터는 1 단위로
        slider.TickFrequency = info.Decimals == 0 ? 1 : Math.Pow(10, -info.Decimals);
        slider.Value = info.Default;
        slider.IsEnabled = info.Enabled;
        label.Text = info.Label;
        valueText.Text = info.Enabled ? info.Default.ToString($"F{info.Decimals}") : "-";
    }
    finally
    {
        _updatingUi = false;
    }
}

/// <summary>Current 가 크면 1280px 이하로 축소한 복사본을 미리보기 입력으로 둡니다.</summary>
private void RebuildPreviewInput()
{
    _preview?.Dispose();
    _preview = null;
    _previewScale = 1.0;

    Mat? cur = _history.Current;
    if (cur == null) return;

    int longest = Math.Max(cur.Width, cur.Height);
    if (longest > PreviewMaxSize)
    {
        _previewScale = (double)PreviewMaxSize / longest;
        _preview = new Mat();
        Cv2.Resize(cur, _preview, new Size(), _previewScale, _previewScale, InterpolationFlags.Area);
    }
    else
    {
        _preview = cur.Clone();
    }
}

/// <summary>미리보기 입력에 현재 필터 · 파라미터를 적용해 오른쪽 화면에 보입니다.</summary>
private void ApplyPreview()
{
    if (_preview == null) return;

    try
    {
        var sw = Stopwatch.StartNew();
        Mat result = FilterPipeline.Apply(_preview, SelectedFilter.Kind, P1, P2);
        sw.Stop();

        _result?.Dispose();            // 이전 결과 해제 (새 것을 만든 뒤에!)
        _result = result;
        ResultImage.Source = _result.ToBitmapSource();

        string scaleNote = _previewScale < 1 ? $"  |  미리보기 {_previewScale * 100:F0}% 축소 ({_preview.Width} x {_preview.Height})" : "";
        StatusText.Text = $"{_fileName}  |  작업 이미지 {_history.Current!.Width} x {_history.Current.Height}, 채널 {_history.Current.Channels()}" +
                          $"  |  {SelectedFilter.DisplayName}  p1={P1.ToString($"F{SelectedFilter.P1.Decimals}")}  p2={P2.ToString($"F{SelectedFilter.P2.Decimals}")}" +
                          $"  |  {sw.Elapsed.TotalMilliseconds:F1} ms{scaleNote}";
    }
    catch (OpenCVException ex)
    {
        StatusText.Text = $"OpenCV 오류: {ex.Message}";   // 앱은 죽지 않는다
    }
}`;

  const CS_HISTORY = `// HistoryManager.cs — 되돌리기 · 다시 실행 (wpf/Ch16_ImageStudio 의 실제 코드)
using OpenCvSharp;

namespace Ch16_ImageStudio;

public sealed class HistoryManager : IDisposable
{
    private readonly Stack<Mat> _undo = new();
    private readonly Stack<Mat> _redo = new();
    private Mat? _original;   // 처음 연 이미지 (초기화용)

    /// <summary>현재 이미지. 이미지를 열기 전에는 null.</summary>
    public Mat? Current { get; private set; }

    public bool CanUndo => _undo.Count > 0;
    public bool CanRedo => _redo.Count > 0;
    public int UndoCount => _undo.Count;
    public int RedoCount => _redo.Count;

    /// <summary>새 이미지를 열었을 때 (first 의 소유권을 넘겨받음).</summary>
    public void Reset(Mat first)
    {
        Clear();
        _original = first.Clone();
        Current = first;
    }

    /// <summary>필터 결과를 새 현재 이미지로 밀어 넣습니다. Redo 기록은 사라집니다.</summary>
    public void Push(Mat next)
    {
        if (Current != null)
            _undo.Push(Current);
        Current = next;
        DisposeAll(_redo);
    }

    public Mat? Undo()
    {
        if (!CanUndo || Current == null) return Current;
        _redo.Push(Current);
        Current = _undo.Pop();
        return Current;
    }

    public Mat? Redo()
    {
        if (!CanRedo || Current == null) return Current;
        _undo.Push(Current);
        Current = _redo.Pop();
        return Current;
    }

    /// <summary>처음 연 이미지로 되돌립니다 (이 동작도 Undo 로 취소할 수 있게 Push 로 처리).</summary>
    public Mat? RestoreOriginal()
    {
        if (_original == null) return Current;
        Push(_original.Clone());
        return Current;
    }

    private void Clear()
    {
        DisposeAll(_undo);
        DisposeAll(_redo);
        Current?.Dispose();
        Current = null;
        _original?.Dispose();
        _original = null;
    }

    private static void DisposeAll(Stack<Mat> stack)
    {
        while (stack.Count > 0)
            stack.Pop().Dispose();       // 스택에서 빠지는 Mat 은 즉시 Dispose
    }

    public void Dispose() => Clear();
}`;

  const CS_SAVE = `// MainWindow.xaml.cs (public partial class MainWindow : Window 안) — 저장 · 적용 · 버튼 활성화
private void SaveButton_Click(object sender, RoutedEventArgs e)
{
    if (_history.Current == null) { MessageBox.Show(this, "먼저 이미지를 열어 주세요.", "안내"); return; }

    var dlg = new SaveFileDialog { Title = "결과 저장", Filter = ImageFile.SaveFilter, FileName = "studio_result.png" };
    if (dlg.ShowDialog(this) != true) return;

    try
    {
        // 화면의 미리보기는 축소본일 수 있으므로 원본 해상도에 다시 적용해 저장
        using Mat full = FilterPipeline.Apply(_history.Current, SelectedFilter.Kind, P1, P2);
        ImageFile.Save(dlg.FileName, full);
        StatusText.Text = $"저장했습니다: {dlg.FileName} ({full.Width} x {full.Height})";
    }
    catch (Exception ex)
    {
        MessageBox.Show(this, ex.Message, "저장 실패", MessageBoxButton.OK, MessageBoxImage.Error);
    }
}

private void ApplyButton_Click(object sender, RoutedEventArgs e)
{
    if (_history.Current == null) return;
    if (SelectedFilter.Kind == FilterKind.None) return;

    try
    {
        var sw = Stopwatch.StartNew();
        Mat full = FilterPipeline.Apply(_history.Current, SelectedFilter.Kind, P1, P2);   // 원본 해상도
        sw.Stop();
        _history.Push(full);             // 소유권을 HistoryManager 로
        SelectFilter(FilterKind.None);   // 적용 뒤에는 미리보기를 원본 상태로
        AfterCurrentChanged();
        StatusText.Text = $"적용: {SelectedFilterNameForStatus(full)}  |  {sw.Elapsed.TotalMilliseconds:F1} ms";
    }
    catch (OpenCVException ex)
    {
        MessageBox.Show(this, ex.Message, "OpenCV 오류", MessageBoxButton.OK, MessageBoxImage.Error);
    }
}

private void UndoButton_Click(object sender, RoutedEventArgs e) { _history.Undo(); AfterCurrentChanged(); }
private void RedoButton_Click(object sender, RoutedEventArgs e) { _history.Redo(); AfterCurrentChanged(); }
private void ResetButton_Click(object sender, RoutedEventArgs e) { _history.RestoreOriginal(); SelectFilter(FilterKind.None); AfterCurrentChanged(); }

private void UpdateButtons()
{
    bool loaded = _history.Current != null;
    ApplyButton.IsEnabled = loaded;
    UndoButton.IsEnabled = _history.CanUndo;      // 되돌릴 것이 없으면 회색
    RedoButton.IsEnabled = _history.CanRedo;
    ResetButton.IsEnabled = loaded;
    HistoryText.Text = loaded ? $"기록: 되돌리기 {_history.UndoCount} · 다시 실행 {_history.RedoCount}" : "기록: -";
}

private string SelectedFilterNameForStatus(Mat result)
    => $"{result.Width} x {result.Height}, 채널 {result.Channels()}";

protected override void OnClosed(EventArgs e)
{
    _result?.Dispose();
    _preview?.Dispose();
    _history.Dispose();     // 스택에 남은 Mat 까지 모두 해제
    base.OnClosed(e);
}`;

  const EX_HISTORY = `using System;
using System.Collections.Generic;
using OpenCvSharp;

// WPF 의 HistoryManager 와 같은 구조 (Stack<Mat> 두 개)
class HistoryManager : IDisposable
{
    readonly Stack<Mat> _undo = new Stack<Mat>();
    readonly Stack<Mat> _redo = new Stack<Mat>();
    Mat _original;

    public Mat Current { get; private set; }
    public bool CanUndo { get { return _undo.Count > 0; } }
    public bool CanRedo { get { return _redo.Count > 0; } }
    public int UndoCount { get { return _undo.Count; } }
    public int RedoCount { get { return _redo.Count; } }

    public void Reset(Mat first)
    {
        Clear();
        _original = first.Clone();
        Current = first;                 // 소유권을 넘겨받는다
    }

    public void Push(Mat next)
    {
        if (Current != null) _undo.Push(Current);
        Current = next;
        DisposeAll(_redo);               // 새로 적용하면 Redo 기록은 버린다
    }

    public void Undo()
    {
        if (!CanUndo) return;
        _redo.Push(Current);
        Current = _undo.Pop();
    }

    public void Redo()
    {
        if (!CanRedo) return;
        _undo.Push(Current);
        Current = _redo.Pop();
    }

    public void RestoreOriginal()
    {
        if (_original == null) return;
        Push(_original.Clone());         // 초기화도 Undo 로 취소할 수 있게
    }

    void Clear()
    {
        DisposeAll(_undo);
        DisposeAll(_redo);
        if (Current != null) Current.Dispose();
        Current = null;
        if (_original != null) _original.Dispose();
        _original = null;
    }

    static void DisposeAll(Stack<Mat> stack)
    {
        while (stack.Count > 0) stack.Pop().Dispose();   // 빠지는 Mat 은 즉시 해제
    }

    public void Dispose() { Clear(); }
}

class Program
{
    static void Show(string step, HistoryManager h)
    {
        Console.WriteLine($"{step} : 평균 {Cv2.Mean(h.Current).Val0:F1}, 채널 {h.Current.Channels()}, 되돌리기 {h.UndoCount} · 다시 실행 {h.RedoCount}");
    }

    static void Main()
    {
        using var history = new HistoryManager();
        history.Reset(Cv2.ImRead("images/sample_color.png", ImreadModes.Color));
        Show("열기      ", history);

        var gray = new Mat();
        Cv2.CvtColor(history.Current, gray, ColorConversionCodes.BGR2GRAY);
        history.Push(gray);
        Show("Gray 적용 ", history);

        var blur = new Mat();
        Cv2.GaussianBlur(history.Current, blur, new Size(9, 9), 0);
        history.Push(blur);
        Show("Blur 적용 ", history);

        history.Undo();
        Show("되돌리기  ", history);
        history.Undo();
        Show("되돌리기  ", history);
        history.Redo();
        Show("다시 실행 ", history);
        history.RestoreOriginal();
        Show("초기화    ", history);

        Cv2.ImShow("current", history.Current);
        Cv2.WaitKey(0);
    }
}`;

  const EX_HISTLIST = `using System;
using System.Collections.Generic;
using OpenCvSharp;

// 기록에 "이름" 을 함께 남겨 사용자에게 보여 주기 (WPF 에서는 ListBox 에 바인딩)
class Step
{
    public string Name { get; private set; }
    public Mat Image { get; private set; }
    public Step(string name, Mat image) { Name = name; Image = image; }
}

class Program
{
    static void PrintHistory(Stack<Step> undo, Step current, Stack<Step> redo)
    {
        var names = new List<string>();
        foreach (Step s in undo) names.Add(s.Name);
        names.Reverse();                       // 스택은 최근이 먼저 → 오래된 순으로 뒤집기
        Console.WriteLine("  기록: " + string.Join(" -> ", names) + " -> [" + current.Name + "]");
        var redoNames = new List<string>();
        foreach (Step s in redo) redoNames.Add(s.Name);
        Console.WriteLine($"  되돌리기 {undo.Count} · 다시 실행 {redo.Count} ({string.Join(", ", redoNames)})");
    }

    static void Main()
    {
        var undo = new Stack<Step>();
        var redo = new Stack<Step>();
        Step current = new Step("원본", Cv2.ImRead("images/sample_color.png", ImreadModes.Color));

        string[] names = { "Gray", "GaussianBlur 9", "Canny 80/160" };
        for (int i = 0; i < names.Length; i++)
        {
            var dst = new Mat();
            if (i == 0) Cv2.CvtColor(current.Image, dst, ColorConversionCodes.BGR2GRAY);
            else if (i == 1) Cv2.GaussianBlur(current.Image, dst, new Size(9, 9), 0);
            else Cv2.Canny(current.Image, dst, 80, 160);

            undo.Push(current);
            current = new Step(names[i], dst);
            while (redo.Count > 0) redo.Pop().Image.Dispose();
            Console.WriteLine($"[적용] {names[i]}");
            PrintHistory(undo, current, redo);
        }

        Console.WriteLine("[되돌리기] x 2");
        for (int k = 0; k < 2; k++)
        {
            redo.Push(current);
            current = undo.Pop();
        }
        PrintHistory(undo, current, redo);

        Console.WriteLine("[다시 실행] x 1");
        undo.Push(current);
        current = redo.Pop();
        PrintHistory(undo, current, redo);

        Console.WriteLine($"현재 이미지: {current.Name}, 채널 {current.Image.Channels()}, 평균 {Cv2.Mean(current.Image).Val0:F1}");
        Cv2.ImShow(current.Name, current.Image);
        Cv2.WaitKey(0);

        // 정리: 모든 Mat 해제
        current.Image.Dispose();
        while (undo.Count > 0) undo.Pop().Image.Dispose();
        while (redo.Count > 0) redo.Pop().Image.Dispose();
        Console.WriteLine("모든 Mat 해제 완료");
    }
}`;

  const EX_SWEEP = `using System;
using System.Collections.Generic;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);

        // 미리보기용 축소본 (슬라이더를 움직일 때 쓰는 그 _preview 와 같은 역할)
        using var preview = new Mat();
        Cv2.Resize(src, preview, new Size(160, 120), 0, 0, InterpolationFlags.Area);
        Console.WriteLine($"원본 {src.Width}x{src.Height} -> 미리보기 {preview.Width}x{preview.Height}");

        // 슬라이더를 50 -> 200 까지 끌었다고 가정하고 결과를 한 장에 이어 붙이기
        var strip = new List<Mat>();
        for (int t = 50; t <= 200; t += 50)
        {
            var bin = new Mat();
            Cv2.Threshold(preview, bin, t, 255, ThresholdTypes.Binary);
            int white = Cv2.CountNonZero(bin);
            Console.WriteLine($"임계값 {t} : 흰 픽셀 {white} ({100.0 * white / (bin.Width * bin.Height):F1}%)");
            strip.Add(bin);
        }

        using var compare = new Mat();
        Cv2.HConcat(strip.ToArray(), compare);      // 가로로 이어 붙이기
        Console.WriteLine($"비교 이미지: {compare.Width} x {compare.Height} (4장)");

        Cv2.ImShow("threshold 50 / 100 / 150 / 200", compare);
        Cv2.WaitKey(0);

        foreach (Mat m in strip) m.Dispose();
    }
}`;

  const EX_SAVE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);

        // 화면에 보이는 것은 축소본 (미리보기)
        using var preview = new Mat();
        Cv2.Resize(src, preview, new Size(), 0.25, 0.25, InterpolationFlags.Area);
        using var previewResult = new Mat();
        Cv2.GaussianBlur(preview, previewResult, new Size(15, 15), 0);
        Console.WriteLine($"미리보기 결과: {previewResult.Width} x {previewResult.Height}");

        // 저장은 원본 해상도로 다시 계산 (축소본을 저장하면 화질 손실!)
        using var fullResult = new Mat();
        Cv2.GaussianBlur(src, fullResult, new Size(15, 15), 0);
        bool ok = Cv2.ImWrite("out/studio_result.png", fullResult);
        Console.WriteLine($"저장 결과: {ok}, 크기 {fullResult.Width} x {fullResult.Height}");

        // 저장한 파일을 다시 읽어 확인 (📁 작업 폴더에서 내려받을 수 있습니다)
        using var check = Cv2.ImRead("out/studio_result.png", ImreadModes.Color);
        Console.WriteLine($"다시 읽기: {check.Width} x {check.Height}, 채널 {check.Channels()}");
        Console.WriteLine($"원본 해상도로 저장했으므로 크기가 같다: {check.Width == src.Width && check.Height == src.Height}");

        Cv2.ImShow("saved", check);
        Cv2.WaitKey(0);
    }
}`;

  const EX_EXC = `using System;
using OpenCvSharp;

class Program
{
    // 상태 표시줄에 한 줄로 보여 줄 문자열 (WPF 의 StatusText.Text 와 같은 내용)
    static string Status(string file, Mat cur, string filter, double p1, double p2, double scale)
    {
        string scaleNote = scale < 1 ? $"  |  미리보기 {scale * 100:F0}% 축소" : "";
        return $"{file}  |  작업 이미지 {cur.Width} x {cur.Height}, 채널 {cur.Channels()}  |  {filter}  p1={p1:F1}  p2={p2:F1}{scaleNote}";
    }

    static void Main()
    {
        using var color = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        Console.WriteLine(Status("sample_color.png", color, "GaussianBlur", 7, 0, 1.0));
        Console.WriteLine(Status("big.png", color, "Canny (에지)", 80, 160, 0.25));

        // ① 짝수 커널 → OpenCV 가 거부 (슬라이더 값을 홀수로 보정하지 않으면 이런 일이)
        try
        {
            using var dst = new Mat();
            Cv2.MedianBlur(color, dst, 4);
            Console.WriteLine("① 통과 (여기는 실행되지 않습니다)");
        }
        catch (OpenCVException)
        {
            Console.WriteLine("① OpenCVException 을 잡았습니다 → 상태 표시줄에 표시하고 앱은 계속 동작");
        }

        // ② Otsu 이진화는 1채널만 (3채널을 넣으면 오류)
        try
        {
            using var dst = new Mat();
            Cv2.Threshold(color, dst, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
            Console.WriteLine("② 통과 (여기는 실행되지 않습니다)");
        }
        catch (OpenCVException)
        {
            Console.WriteLine("② OpenCVException → ToGray 로 1채널로 바꾼 뒤 처리해야 합니다");
        }

        // ③ 이미지 밖 ROI
        try
        {
            using var roi = new Mat(color, new Rect(500, 400, 300, 300));
            Console.WriteLine("③ 통과 (여기는 실행되지 않습니다)");
        }
        catch (OpenCVException)
        {
            Console.WriteLine("③ OpenCVException → Rect 를 이미지 크기로 잘라(Clamp) 주세요");
        }

        Console.WriteLine("예외를 잡았으므로 프로그램이 계속 실행됩니다 — WPF 라면 앱이 죽지 않습니다");
    }
}`;

  const SEC2 = {
    id: 'cs16-2', title: '상호작용: 즉시 미리보기 · 되돌리기 · 저장 · 예외 처리', minutes: 50,
    goals: ['Slider ValueChanged 로 즉시 재처리하고 축소 미리보기로 반응 속도를 지킬 수 있다', 'Stack<Mat> 두 개로 되돌리기/다시 실행을 만들고 Mat 누수를 막을 수 있다', '저장 · 예외 처리 · 상태 표시줄로 실제로 쓸 수 있는 앱을 만들 수 있다'],
    flow: [['도입: 슬라이더가 멈추는 앱', 5], ['즉시 미리보기', 15], ['되돌리기 · 다시 실행', 15], ['저장 · 예외 · 정리', 15]],
    content: [
      { type: 'h', text: '슬라이더를 움직이면 바로 보이게' },
      { type: 'p', html: '슬라이더를 1초 끌면 <code>ValueChanged</code> 가 <b>수십 번</b> 발생합니다. 그때마다 4000×3000 원본을 처리하면 화면이 멈춘 것처럼 보입니다(WPF 는 UI 스레드에서 처리하므로 그 동안 아무 입력도 받지 못합니다). 해법은 간단합니다 — <b>미리보기는 축소본으로</b> 처리하고, <b>[적용] · [저장]만 원본 해상도로</b> 처리합니다.' },
      { type: 'figure', html: FIG_EVENT, caption: '그림 3. 슬라이더 · 필터 선택 이벤트 흐름과 _updatingUi 재진입 방지' },
      { type: 'code', title: 'MainWindow.xaml.cs — 이벤트 · 축소 미리보기 (Visual Studio 에서 실행)', code: CS_PREVIEW, run: false, local: true, file: 'MainWindow.xaml.cs',
        desc: '읽을 곳 네 군데: ① <code>Param_ValueChanged</code> 에서 값 표시를 갱신하고 바로 <code>ApplyPreview()</code> ② <code>ConfigureSlider</code> 가 <code>ParamInfo</code> 대로 슬라이더를 설정 ③ <code>RebuildPreviewInput</code> 이 1280px 이하로 축소 (<code>InterpolationFlags.Area</code> 가 축소에 가장 좋습니다 — 11차시) ④ <code>ApplyPreview</code> 가 <b>새 결과를 만들고 → 화면에 붙이고 → 이전 결과를 Dispose</b>.' },
      { type: 'callout', kind: 'warn', title: '_updatingUi — 이벤트 재진입(무한 루프) 막기', html: '<code>ConfigureSlider</code> 안에서 <code>slider.Value = info.Default;</code> 를 하면 <b>또 ValueChanged 가 발생</b>합니다. 그러면 아직 설정이 끝나지 않은 상태로 <code>ApplyPreview</code> 가 불려 엉뚱한 파라미터로 처리하거나, 심하면 이벤트가 꼬여 무한 루프가 됩니다. 그래서 <code>_updatingUi = true</code> 로 표시해 두고 <code>Param_ValueChanged</code> 첫 줄에서 <code>if (_updatingUi) return;</code> 로 무시합니다. <b>WinForms · WPF 이벤트 코드에서 아주 자주 쓰는 패턴</b>입니다. <code>try / finally</code> 로 감싸 예외가 나도 플래그가 반드시 풀리게 하세요.' },
      { type: 'code', title: '예제 1: 슬라이더를 끄는 것과 같은 파라미터 스윕 (HConcat 비교)', code: EX_SWEEP,
        desc: '슬라이더를 50 → 200 으로 끄는 동안 무슨 일이 일어나는지를 한 장에 모았습니다. <code>Cv2.HConcat</code> 은 같은 <b>높이 · 형식</b>의 Mat 들을 가로로 이어 붙입니다(세로는 <code>VConcat</code>). 결과 창에서 임계값이 커질수록 흰 영역이 줄어드는 것을 한눈에 볼 수 있습니다 — 실제 앱에서는 이것이 슬라이더를 끌 때의 애니메이션이 됩니다.',
        expect: '원본 640x480 -> 미리보기 160x120\n임계값 50 : 흰 픽셀 17692 (92.1%)\n임계값 100 : 흰 픽셀 13678 (71.2%)\n임계값 150 : 흰 픽셀 2211 (11.5%)\n임계값 200 : 흰 픽셀 17 (0.1%)\n비교 이미지: 640 x 120 (4장)' },
      { type: 'h', text: '되돌리기 · 다시 실행 (Undo / Redo)' },
      { type: 'p', html: '편집기의 기본 기능입니다. 자료 구조는 <b>스택 2개</b> 면 충분합니다. [적용]하면 지금 이미지를 <code>_undo</code> 에 밀어 넣고 새 결과를 현재로 삼습니다. [되돌리기]는 현재를 <code>_redo</code> 로 보내고 <code>_undo</code> 에서 하나 꺼냅니다. 새로 [적용]하면 <code>_redo</code> 는 <b>버립니다</b>(다른 갈래로 갔으므로) — 이때 남아 있던 Mat 을 반드시 <code>Dispose</code> 해야 합니다.' },
      { type: 'figure', html: FIG_STACK, caption: '그림 4. _undo · Current · _redo 의 관계. 스택에서 빠지는 Mat 은 즉시 Dispose' },
      { type: 'code', title: '예제 2: HistoryManager 시뮬레이션 (적용 → 되돌리기 → 다시 실행 → 초기화)', code: EX_HISTORY,
        desc: '완성 프로젝트의 <code>HistoryManager</code> 와 같은 동작입니다. 출력의 <b>채널 수</b>를 보세요 — Gray 를 적용하면 1채널, 두 번 되돌리면 다시 3채널(원본)이 됩니다. [초기화]는 <code>_original.Clone()</code> 을 <code>Push</code> 하므로 <b>초기화 자체도 되돌릴 수 있습니다</b>(되돌리기 2 → 3 으로 늘어난 것을 확인하세요).',
        expect: '열기       : 평균 115.5, 채널 3, 되돌리기 0 · 다시 실행 0\nGray 적용  : 평균 119.2, 채널 1, 되돌리기 1 · 다시 실행 0\nBlur 적용  : 평균 119.2, 채널 1, 되돌리기 2 · 다시 실행 0\n되돌리기   : 평균 119.2, 채널 1, 되돌리기 1 · 다시 실행 1\n되돌리기   : 평균 115.5, 채널 3, 되돌리기 0 · 다시 실행 2\n다시 실행  : 평균 119.2, 채널 1, 되돌리기 1 · 다시 실행 1\n초기화     : 평균 115.5, 채널 3, 되돌리기 2 · 다시 실행 0' },
      { type: 'code', title: 'HistoryManager.cs — 완성 프로젝트의 실제 코드', code: CS_HISTORY, run: false, local: true, file: 'HistoryManager.cs',
        desc: '<code>?.</code>(널 조건 연산자)와 <code>=&gt;</code>(식 본문 멤버)로 짧게 쓴 것 말고는 위 브라우저 예제와 같습니다. <b>소유권 규칙</b>이 주석으로 적혀 있는 것에 주목하세요: <code>Reset</code> · <code>Push</code> 에 넘긴 Mat 은 <b>HistoryManager 가 소유</b>하므로 호출한 쪽이 Dispose 하면 안 됩니다. <code>IDisposable</code> 을 구현해 창이 닫힐 때(<code>OnClosed</code>) 스택에 남은 Mat 까지 모두 해제합니다.' },
      { type: 'code', title: '예제 3: 기록 목록 보여 주기 (필터 이름 + 스택 상태)', code: EX_HISTLIST,
        desc: 'Mat 만 쌓으면 사용자는 “무엇을 되돌리는지” 알 수 없습니다. <code>Step</code> 클래스로 <b>이름 + 이미지</b>를 함께 쌓으면 화면에 “원본 → Gray → GaussianBlur 9 → [Canny 80/160]” 처럼 보여 줄 수 있습니다. <code>foreach</code> 로 <code>Stack&lt;T&gt;</code> 를 돌면 <b>최근 것이 먼저</b> 나오므로 <code>Reverse()</code> 로 뒤집었습니다.',
        expect: '[적용] Gray\n  기록: 원본 -> [Gray]\n  되돌리기 1 · 다시 실행 0 ()\n[적용] GaussianBlur 9\n  기록: 원본 -> Gray -> [GaussianBlur 9]\n  되돌리기 2 · 다시 실행 0 ()\n[적용] Canny 80/160\n  기록: 원본 -> Gray -> GaussianBlur 9 -> [Canny 80/160]\n  되돌리기 3 · 다시 실행 0 ()\n[되돌리기] x 2\n  기록: 원본 -> [Gray]\n  되돌리기 1 · 다시 실행 2 (GaussianBlur 9, Canny 80/160)\n[다시 실행] x 1\n  기록: 원본 -> Gray -> [GaussianBlur 9]\n  되돌리기 2 · 다시 실행 1 (Canny 80/160)\n현재 이미지: GaussianBlur 9, 채널 1, 평균 119.2\n모든 Mat 해제 완료' },
      { type: 'h', text: '저장 · 예외 처리 · 상태 표시줄' },
      { type: 'p', html: '저장에는 두 가지 함정이 있습니다. ① <b>화면에 보이는 축소본을 저장</b>하면 화질이 떨어집니다 → <code>Current</code>(원본 해상도)에 필터를 <b>다시 적용</b>해 저장합니다. ② <b>한글 경로</b>에서 <code>Cv2.ImWrite</code> 가 실패할 수 있습니다 → <code>Cv2.ImEncode</code> + <code>File.WriteAllBytes</code> 로 우회합니다(<code>ImageFile.Save</code>).' },
      { type: 'code', title: '예제 4: 미리보기 vs 저장 — 원본 해상도로 다시 계산', code: EX_SAVE,
        desc: '<code>Cv2.ImWrite("out/studio_result.png", …)</code> 로 저장한 파일은 왼쪽 <b>📁 작업 폴더</b>에서 확인 · 내려받을 수 있습니다. 실제 앱에서는 경로를 <code>SaveFileDialog</code> 로 받습니다(브라우저에서는 대화상자를 쓸 수 없습니다).',
        expect: '미리보기 결과: 160 x 120\n저장 결과: True, 크기 640 x 480\n다시 읽기: 640 x 480, 채널 3\n원본 해상도로 저장했으므로 크기가 같다: True' },
      { type: 'code', title: 'MainWindow.xaml.cs — 저장 · 적용 · 버튼 활성화 (Visual Studio 에서 실행)', code: CS_SAVE, run: false, local: true, file: 'MainWindow.xaml.cs',
        desc: '<code>SaveFileDialog</code> 는 <code>Microsoft.Win32</code> 네임스페이스입니다(<code>System.Windows.Forms</code> 가 아닙니다). <code>dlg.ShowDialog(this) != true</code> — 반환형이 <code>bool?</code> 이므로 <code>!= true</code> 로 비교합니다. <code>UpdateButtons</code> 처럼 <b>상태 → 버튼 활성화</b>를 한 곳에서 계산하면 “되돌릴 게 없는데 버튼이 눌리는” 버그가 사라집니다.' },
      { type: 'code', title: '예제 5: 예외 처리와 상태 표시줄 문자열', code: EX_EXC,
        desc: '이미지 처리 앱에서 예외는 <b>정상적인 일</b>입니다 — 사용자가 슬라이더를 어디로든 옮길 수 있으니까요. 세 가지 대표 오류(짝수 커널 · 채널 수 불일치 · ROI 범위 초과)를 <code>catch (OpenCVException)</code> 로 잡아 상태 표시줄에 표시하고 앱은 계속 동작하게 합니다. <b>미리보기에서는 MessageBox 를 띄우지 마세요</b> — 슬라이더를 끌 때마다 대화상자가 수십 개 뜹니다. 상태 표시줄에 조용히 쓰고, [적용] · [저장]처럼 사용자가 <b>명시적으로 누른 동작</b>에서만 MessageBox 를 씁니다.',
        expect: 'sample_color.png  |  작업 이미지 640 x 480, 채널 3  |  GaussianBlur  p1=7.0  p2=0.0\nbig.png  |  작업 이미지 640 x 480, 채널 3  |  Canny (에지)  p1=80.0  p2=160.0  |  미리보기 25% 축소\n① OpenCVException 을 잡았습니다 → 상태 표시줄에 표시하고 앱은 계속 동작\n② OpenCVException → ToGray 로 1채널로 바꾼 뒤 처리해야 합니다\n③ OpenCVException → Rect 를 이미지 크기로 잘라(Clamp) 주세요\n예외를 잡았으므로 프로그램이 계속 실행됩니다 — WPF 라면 앱이 죽지 않습니다' },
      { type: 'callout', kind: 'field', title: '현장에서는', html: '검사 장비 UI 에서도 같은 구조를 씁니다: <b>라이브 미리보기는 축소본 · 판정은 원본 해상도</b>. 그리고 “되돌리기”는 편집 앱뿐 아니라 <b>레시피(검사 조건) 편집</b>에도 필요합니다 — 파라미터를 잘못 바꿨을 때 되돌릴 수 없으면 라인이 멈춥니다. 조건 변경 이력(누가 · 언제 · 무엇을)을 파일로 남기는 것이 보통 요구 사항입니다.' },
      { type: 'wpf', title: '직접 만져 보기', project: 'Ch16_ImageStudio', html: '<ol><li>F5 → [열기] → <code>images/uneven_light.png</code> → 필터 <b>AdaptiveThreshold</b> 선택 → p1(블록 크기)을 11 · 51 · 91 로 끌어 보세요. 상태 표시줄의 <b>처리 시간(ms)</b>이 어떻게 바뀌나요?</li><li><b>Gray → GaussianBlur → Canny</b> 를 차례로 [적용]한 뒤 [되돌리기]를 3번 눌러 보세요. <code>HistoryText</code> 의 숫자를 확인하세요.</li><li>중간에서 [되돌리기] 2번 → 다른 필터를 [적용] → [다시 실행] 버튼이 <b>회색</b>이 되는 것을 확인하세요 (Redo 기록이 버려짐).</li></ol>' }
    ],
    practice: [
      {
        title: '미리보기 축소 배율 계산하기', level: 1,
        desc: '<code>RebuildPreviewInput</code> 과 같은 규칙으로 <b>가장 긴 변이 1280px 이하</b>가 되는 축소 배율을 구하는 함수를 만드세요. 이미 1280 이하면 배율 1.0(축소하지 않음). 여러 크기에 대해 배율과 결과 크기를 출력하세요.',
        hint: '<code>int longest = Math.Max(w, h); double scale = longest > 1280 ? 1280.0 / longest : 1.0;</code> 결과 크기는 <code>(int)Math.Round(w * scale)</code>.',
        expect: '640x480 -> 배율 1.000 -> 640x480\n1920x1080 -> 배율 0.667 -> 1280x720\n4000x3000 -> 배율 0.320 -> 1280x960\n1280x720 -> 배율 1.000 -> 1280x720\nplate_holes: 800x600 -> 800x600 (배율 1.000)',
        starter: `using System;
using OpenCvSharp;

class Program
{
    const int PreviewMaxSize = 1280;

    static double PreviewScale(int width, int height)
    {
        // TODO: 가장 긴 변이 PreviewMaxSize 이하가 되는 배율을 돌려주세요 (작으면 1.0)
        return 1.0;
    }

    static void Main()
    {
        int[,] sizes = { { 640, 480 }, { 1920, 1080 }, { 4000, 3000 }, { 1280, 720 } };
        for (int i = 0; i < 4; i++)
        {
            int w = sizes[i, 0], h = sizes[i, 1];
            double s = PreviewScale(w, h);
            Console.WriteLine($"{w}x{h} -> 배율 {s:F3} -> {(int)Math.Round(w * s)}x{(int)Math.Round(h * s)}");
        }

        // 실제로 축소해 보기
        using var src = Cv2.ImRead("images/plate_holes.png", ImreadModes.Grayscale);
        double scale = PreviewScale(src.Width, src.Height);
        using var preview = new Mat();
        Cv2.Resize(src, preview, new Size(), scale, scale, InterpolationFlags.Area);
        Console.WriteLine($"plate_holes: {src.Width}x{src.Height} -> {preview.Width}x{preview.Height} (배율 {scale:F3})");
        Cv2.ImShow("preview", preview);
        Cv2.WaitKey(0);
    }
}`,
        solution: `using System;
using OpenCvSharp;

class Program
{
    const int PreviewMaxSize = 1280;

    static double PreviewScale(int width, int height)
    {
        int longest = Math.Max(width, height);
        return longest > PreviewMaxSize ? (double)PreviewMaxSize / longest : 1.0;
    }

    static void Main()
    {
        int[,] sizes = { { 640, 480 }, { 1920, 1080 }, { 4000, 3000 }, { 1280, 720 } };
        for (int i = 0; i < 4; i++)
        {
            int w = sizes[i, 0], h = sizes[i, 1];
            double s = PreviewScale(w, h);
            Console.WriteLine($"{w}x{h} -> 배율 {s:F3} -> {(int)Math.Round(w * s)}x{(int)Math.Round(h * s)}");
        }

        using var src = Cv2.ImRead("images/plate_holes.png", ImreadModes.Grayscale);
        double scale = PreviewScale(src.Width, src.Height);
        using var preview = new Mat();
        Cv2.Resize(src, preview, new Size(), scale, scale, InterpolationFlags.Area);
        Console.WriteLine($"plate_holes: {src.Width}x{src.Height} -> {preview.Width}x{preview.Height} (배율 {scale:F3})");
        Cv2.ImShow("preview", preview);
        Cv2.WaitKey(0);
    }
}`
      },
      {
        title: '스택 2개로 Undo / Redo 직접 만들기', level: 2,
        desc: '<code>Stack&lt;int&gt;</code> 두 개로 <b>정수 기록</b>의 되돌리기/다시 실행을 만드세요(Mat 대신 숫자로 연습). ① <code>Apply(값)</code>: 현재를 undo 에 넣고 값을 현재로, redo 비우기 ② <code>Undo()</code> ③ <code>Redo()</code>. 각 단계마다 <code>기록: … -&gt; [현재] / redo: …</code> 를 출력하세요.',
        hint: '<code>Stack&lt;T&gt;</code> 의 <code>Push</code> · <code>Pop</code> · <code>Count</code>. redo 비우기는 <code>while (redo.Count &gt; 0) redo.Pop();</code>. 출력은 <code>string.Join(" -&gt; ", 리스트)</code>.',
        expect: '시작: 기록  -> [0] / redo 0개\n적용 10: 기록 0 -> [10] / redo 0개\n적용 20: 기록 0 -> 10 -> [20] / redo 0개\n적용 30: 기록 0 -> 10 -> 20 -> [30] / redo 0개\n되돌리기: 기록 0 -> 10 -> [20] / redo 1개\n되돌리기: 기록 0 -> [10] / redo 2개\n다시 실행: 기록 0 -> 10 -> [20] / redo 1개\n적용 99: 기록 0 -> 10 -> 20 -> [99] / redo 0개',
        starter: `using System;
using System.Collections.Generic;

class Program
{
    static Stack<int> undo = new Stack<int>();
    static Stack<int> redo = new Stack<int>();
    static int current = 0;

    static void Apply(int value)
    {
        // TODO: current 를 undo 에 넣고, value 를 current 로, redo 를 비우세요
    }

    static void Undo()
    {
        // TODO: undo 가 비어 있지 않으면 current 를 redo 에 넣고 undo 에서 꺼내 current 로
    }

    static void Redo()
    {
        // TODO: redo 가 비어 있지 않으면 current 를 undo 에 넣고 redo 에서 꺼내 current 로
    }

    static void Print(string step)
    {
        var list = new List<string>();
        foreach (int v in undo) list.Add(v.ToString());
        list.Reverse();
        Console.WriteLine($"{step}: 기록 {string.Join(" -> ", list)} -> [{current}] / redo {redo.Count}개");
    }

    static void Main()
    {
        Print("시작");
        Apply(10); Print("적용 10");
        Apply(20); Print("적용 20");
        Apply(30); Print("적용 30");
        Undo(); Print("되돌리기");
        Undo(); Print("되돌리기");
        Redo(); Print("다시 실행");
        Apply(99); Print("적용 99");
    }
}`,
        solution: `using System;
using System.Collections.Generic;

class Program
{
    static Stack<int> undo = new Stack<int>();
    static Stack<int> redo = new Stack<int>();
    static int current = 0;

    static void Apply(int value)
    {
        undo.Push(current);
        current = value;
        while (redo.Count > 0) redo.Pop();      // 새 갈래로 갔으므로 redo 는 버린다
    }

    static void Undo()
    {
        if (undo.Count == 0) return;
        redo.Push(current);
        current = undo.Pop();
    }

    static void Redo()
    {
        if (redo.Count == 0) return;
        undo.Push(current);
        current = redo.Pop();
    }

    static void Print(string step)
    {
        var list = new List<string>();
        foreach (int v in undo) list.Add(v.ToString());
        list.Reverse();
        Console.WriteLine($"{step}: 기록 {string.Join(" -> ", list)} -> [{current}] / redo {redo.Count}개");
    }

    static void Main()
    {
        Print("시작");
        Apply(10); Print("적용 10");
        Apply(20); Print("적용 20");
        Apply(30); Print("적용 30");
        Undo(); Print("되돌리기");
        Undo(); Print("되돌리기");
        Redo(); Print("다시 실행");
        Apply(99); Print("적용 99");
    }
}`
      }
    ],
    quiz: [
      { q: '슬라이더를 끌 때 앱이 멈추지 않게 하는 이 앱의 방법은?', options: ['처리를 다른 스레드에서 한다', '미리보기는 1280px 이하로 <b>축소한 복사본</b>에 적용하고, [적용] · [저장]만 원본 해상도로 처리한다', 'ValueChanged 이벤트를 무시한다', '이미지를 JPEG 로 압축한다'], answer: 1,
        explain: '가장 간단하고 효과가 큰 방법입니다. 1920×1440 GaussianBlur(21) 가 약 960ms 인데 1/4 로 줄이면 약 33ms — 30배 빨라집니다. (스레드로 옮기는 것은 더 복잡하고, UI 갱신 시 <code>Dispatcher</code> 가 필요합니다.)' },
      { q: '<code>ConfigureSlider</code> 에서 <code>_updatingUi</code> 플래그를 쓰는 이유는?', options: ['슬라이더를 두 개 쓰기 때문', '코드로 <code>slider.Value</code> 를 바꾸면 <code>ValueChanged</code> 가 다시 발생해 설정 중에 재처리가 일어나기 때문', '슬라이더 값이 소수이기 때문', 'ListBox 와 Slider 가 같은 이벤트를 쓰기 때문'], answer: 1,
        explain: '이벤트 재진입(re-entrancy) 문제입니다. <code>true</code> 로 막고 <code>finally</code> 에서 반드시 <code>false</code> 로 되돌립니다 — 예외가 나도 플래그가 남지 않게 하기 위해서입니다.' },
      { q: '새 필터를 [적용]했을 때 <code>_redo</code> 스택을 어떻게 해야 하나?', options: ['그대로 둔다', '남아 있던 Mat 을 모두 <b>Dispose 하고 비운다</b>', '_undo 스택으로 옮긴다', '파일로 저장한다'], answer: 1,
        explain: '다른 갈래로 편집을 이어 갔으므로 “다시 실행”할 미래가 사라집니다. 그냥 <code>Clear()</code> 만 하면 Mat 의 네이티브 메모리가 남으므로 <b>Pop 하면서 Dispose</b> 해야 합니다.' },
      { q: '저장할 때 화면의 미리보기 Mat 을 그대로 쓰면 안 되는 이유는?', options: ['미리보기는 채널 수가 달라서', '미리보기는 <b>축소본</b>이라 해상도가 낮아지기 때문 — Current 에 필터를 다시 적용해 저장한다', 'ImWrite 가 작은 이미지를 거부해서', 'BitmapSource 로 변환되어 있어서'], answer: 1,
        explain: '“보이는 것”과 “저장하는 것”을 분리하는 것이 핵심 설계입니다. <code>FilterPipeline.Apply(_history.Current, …)</code> 로 원본 해상도에 다시 계산합니다 — 필터가 순수 함수(같은 입력 → 같은 출력)이기 때문에 가능합니다.' },
      { q: '미리보기 처리 중 <code>OpenCVException</code> 이 났을 때 가장 적절한 처리는?', options: ['<code>MessageBox.Show</code> 로 알린다', '상태 표시줄(<code>StatusText</code>)에 메시지를 쓰고 앱은 계속 동작하게 한다', '앱을 종료한다', '예외를 잡지 않고 그대로 둔다'], answer: 1,
        explain: '슬라이더를 끄는 동안 예외가 수십 번 날 수 있으므로 대화상자를 띄우면 앱을 쓸 수 없게 됩니다. 사용자가 <b>명시적으로 누른</b> [적용] · [저장] 같은 동작에서만 <code>MessageBox</code> 를 쓰세요.' }
    ],
    slides: [
      { layout: 'title', title: '상호작용', subtitle: '2교시 — 즉시 미리보기 · 되돌리기/다시 실행 · 저장 · 예외 처리', notes: '<p>1교시에서 만든 <code>FilterPipeline</code> 을 화면에 연결하는 시간입니다. 💬 “포토샵에서 슬라이더를 끌면 결과가 바로 보이죠. 그런데 우리 앱에서 4000×3000 사진에 블러를 매번 걸면 어떻게 될까요?” — 멈춘다. 이 질문으로 시작합니다. (3분)</p>' },
      { layout: 'bullets', title: '문제: 슬라이더는 초당 수십 번 이벤트를 낸다', bullets: [
        'WPF 는 <b>UI 스레드</b>에서 이벤트를 처리한다 → 처리가 길면 화면이 얼어붙는다',
        '1920×1440 GaussianBlur(21) ≈ <b>960 ms</b> · 1/4 축소본 ≈ <b>33 ms</b> (약 30배)',
        '사람 눈에는 <b>50 ms 이하</b>면 “즉시” 로 느껴진다',
        ['그래서', ['<b>미리보기</b>: 1280px 이하 축소본에 적용 (<code>_preview</code>)', '<b>[적용] · [저장]</b>: 원본 해상도로 다시 계산']]
      ], notes: '<p>숫자를 칠판에 적어 주세요(960ms vs 33ms — 3교시에서 직접 측정합니다). “정확도가 중요한 판정은 원본으로, 눈으로 보는 것은 축소본으로” 라는 원칙은 검사 장비에서도 똑같이 쓰입니다. (4분)</p>' },
      { layout: 'diagram', title: '이벤트 흐름', html: FIG_EVENT, caption: 'ValueChanged → 값 표시 갱신 → ApplyPreview → ResultImage.Source 교체', notes: '<p>화살표를 따라가며 “사용자 동작 → 이벤트 → 처리 → 화면” 4단계를 짚습니다. 아래쪽 <code>_updatingUi</code> 상자는 다음 슬라이드에서 자세히. (4분)</p>' },
      { layout: 'code', title: '즉시 미리보기: 두 메서드', file: 'MainWindow.xaml.cs', run: false, local: true, code: `// public partial class MainWindow : Window 안
private void Param_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
{
    if (_updatingUi) return;              // 코드로 값을 바꾸는 중이면 무시
    P1Value.Text = P1.ToString("F0");
    ApplyPreview();                        // 즉시 재처리
}

private void ApplyPreview()
{
    if (_preview == null) return;
    try
    {
        Mat result = FilterPipeline.Apply(_preview, SelectedFilter.Kind, P1, P2);
        _result?.Dispose();                // ① 새 것을 만든 뒤 ② 화면에 붙이고
        _result = result;                  // ③ 이전 것을 해제
        ResultImage.Source = _result.ToBitmapSource();
    }
    catch (OpenCVException ex)
    {
        StatusText.Text = $"OpenCV 오류: {ex.Message}";   // 앱은 죽지 않는다
    }
}`, points: ['<code>_preview</code> = 축소된 입력', '<code>_result?.Dispose()</code> 로 이전 결과 해제', '미리보기에서는 <b>MessageBox 금지</b> → 상태 표시줄'], notes: '<p><code>Mat → BitmapSource</code> 변환은 02차시의 <code>ToBitmapSource()</code>(WpfExtensions)입니다. 💬 “<code>_result?.Dispose()</code> 를 지우면 어떻게 될까요?” — 메모리가 계속 쌓인다. 작업 관리자를 띄워 놓고 슬라이더를 흔들어 보여 주면 인상적입니다. (5분)</p>' },
      { layout: 'code', title: '축소 미리보기 만들기', file: 'MainWindow.xaml.cs', run: false, local: true, code: `// public partial class MainWindow : Window 안
private const int PreviewMaxSize = 1280;

private void RebuildPreviewInput()
{
    _preview?.Dispose();
    _preview = null;
    _previewScale = 1.0;
    Mat? cur = _history.Current;
    if (cur == null) return;
    int longest = Math.Max(cur.Width, cur.Height);
    if (longest > PreviewMaxSize)
    {
        _previewScale = (double)PreviewMaxSize / longest;
        _preview = new Mat();
        Cv2.Resize(cur, _preview, new Size(), _previewScale, _previewScale,
                   InterpolationFlags.Area);       // 축소에는 Area 가 가장 깨끗
    }
    else
    {
        _preview = cur.Clone();                    // 작으면 그대로 복사
    }
}`, points: ['가장 긴 변 기준으로 배율 계산 → 비율 유지', '<code>InterpolationFlags.Area</code>: 축소 전용 보간 (11차시)', '작은 이미지는 <code>Clone()</code> — 규칙을 하나로'], notes: '<p>“왜 Clone 인가?” — <code>_preview</code> 를 항상 “내가 소유한 Mat” 으로 만들면 Dispose 규칙이 단순해집니다. <code>Area</code> 보간은 축소할 때 모아레(계단 무늬)를 막아 줍니다. 실습 1 이 이 배율 계산입니다. (4분)</p>' },
      { layout: 'diagram', title: 'Undo / Redo = 스택 2개', html: FIG_STACK, caption: '[적용] Push · [되돌리기] Undo · [다시 실행] Redo · 새 적용 시 redo 는 Dispose 후 비움', notes: '<p>칠판에 스택 두 개를 그리고 학생들에게 동작을 시키면 좋습니다: “적용 A, 적용 B, 되돌리기, 적용 C 를 하면 두 스택에 무엇이 남나?” — undo: [원본, A], current: C, redo: 비었음(B 는 Dispose). (5분)</p>' },
      { layout: 'code', title: 'HistoryManager 핵심 3개', code: `class HistoryManager
{
    Stack<Mat> _undo = new Stack<Mat>();
    Stack<Mat> _redo = new Stack<Mat>();
    public Mat Current { get; private set; }
    public bool CanUndo { get { return _undo.Count > 0; } }
    public bool CanRedo { get { return _redo.Count > 0; } }

    public void Push(Mat next)          // [적용]
    {
        if (Current != null) _undo.Push(Current);
        Current = next;
        DisposeAll(_redo);              // 새 갈래 -> redo 는 버린다 (Dispose!)
    }

    public void Undo()                  // [되돌리기] — 옮기기만, Dispose 하지 않는다
    {
        if (!CanUndo) return;
        _redo.Push(Current);
        Current = _undo.Pop();
    }

    static void DisposeAll(Stack<Mat> s) { while (s.Count > 0) s.Pop().Dispose(); }
}`, run: false, points: ['<code>Push</code> 는 넘겨받은 Mat 의 <b>소유권</b>을 가져간다', '<code>Undo</code>/<code>Redo</code> 는 Mat 을 옮길 뿐 — 해제하지 않는다', '버릴 때만 <code>Dispose</code>'], notes: '<p>“옮기기”와 “버리기”를 구분하는 것이 핵심입니다. Undo 는 Mat 을 다른 스택으로 <b>옮기는</b> 것이므로 Dispose 하면 안 됩니다 — 여기서 실수하면 되돌리기 후 화면이 깨집니다. 학생들은 브라우저 예제 2 를 실행해 채널 수 변화를 확인합니다. (5분)</p>' },
      { layout: 'code', title: '실행: 적용 → 되돌리기 → 다시 실행', code: `using var history = new HistoryManager();
history.Reset(Cv2.ImRead("images/sample_color.png", ImreadModes.Color));

var gray = new Mat();
Cv2.CvtColor(history.Current, gray, ColorConversionCodes.BGR2GRAY);
history.Push(gray);                      // 채널 3 -> 1

var blur = new Mat();
Cv2.GaussianBlur(history.Current, blur, new Size(9, 9), 0);
history.Push(blur);

history.Undo();                          // Blur 취소
history.Undo();                          // Gray 취소 -> 다시 3채널
history.Redo();                          // Gray 다시 적용
history.RestoreOriginal();               // 초기화 (이것도 Undo 가능)

Console.WriteLine($"채널 {history.Current.Channels()}, 되돌리기 {history.UndoCount} · 다시 실행 {history.RedoCount}");`, run: false, points: ['출력 채널 수로 상태를 확인 (3 → 1 → 3)', '<code>RestoreOriginal</code> 도 <code>Push</code> → 되돌리기 가능', '<code>using var history</code> → 끝에 모든 Mat 해제'], notes: '<p>학생들이 직접 순서를 바꿔 보게 합니다. 💬 “되돌리기를 두 번 한 뒤 Blur 를 다시 적용하면 Redo 버튼은?” — 회색(기록이 버려짐). 실제 앱에서 확인시키면 좋습니다. (4분)</p>' },
      { layout: 'two', title: '저장: 보이는 것 ≠ 저장하는 것', left: { title: '화면 (미리보기)', bullets: ['<code>_preview</code> = 축소본', '<code>_result</code> = 축소본의 결과', '빠르게 보이는 것이 목적'] }, right: { title: '파일 (저장)', bullets: ['<code>_history.Current</code> = 원본 해상도', '<code>FilterPipeline.Apply(Current, …)</code> 로 <b>다시 계산</b>', '<code>ImageFile.Save</code> = ImEncode + WriteAllBytes (한글 경로 안전)'] }, notes: '<p>필터가 <b>순수 함수</b>이기 때문에 “다시 계산” 이 가능하다는 점을 강조하세요 — 설계가 좋으면 기능이 공짜로 따라옵니다. 한글 경로 문제는 OpenCvSharp 에서 아주 흔한 질문입니다(<code>ImWrite</code> 가 조용히 false 를 반환). (4분)</p>' },
      { layout: 'bullets', title: '예외 처리 원칙', lead: '이미지 앱에서 예외는 “정상적인 일”', bullets: [
        '짝수 커널 · 채널 수 불일치 · ROI 범위 초과 → <code>OpenCVException</code>',
        '<b>미리보기</b>: <code>catch (OpenCVException)</code> → 상태 표시줄에 표시, 계속 동작',
        '<b>[적용] · [저장]</b>: 사용자가 누른 동작이므로 <code>MessageBox</code> 로 알림',
        '<b>파일 읽기/쓰기</b>: <code>IOException</code> · <code>InvalidDataException</code> 도 함께 잡기',
        '창이 닫힐 때 <code>OnClosed</code> 에서 <code>_result</code> · <code>_preview</code> · <code>_history</code> 모두 Dispose'
      ], notes: '<p>“어디서 잡을 것인가” 가 설계 포인트입니다: 처리 클래스(<code>FilterPipeline</code>)는 예외를 그대로 던지고, <b>화면 코드가</b> 사용자에게 어떻게 알릴지 결정합니다. 💬 “미리보기에서 MessageBox 를 쓰면?” — 슬라이더 한 번에 대화상자 수십 개. (4분)</p>' },
      { layout: 'quiz', title: '확인 퀴즈', q: '새 필터를 [적용]했을 때 <code>_redo</code> 스택에 남아 있던 Mat 은?', options: ['그대로 둔다', 'Pop 하면서 모두 Dispose 하고 비운다', '_undo 로 옮긴다', '파일로 저장한다'], answer: 1, explain: '다시 실행할 “미래”가 사라졌습니다. <code>Clear()</code> 만 하면 네이티브 메모리가 남으므로 <b>Pop + Dispose</b>.', notes: '<p>정답 2번. 이어서 “Undo 할 때는 Dispose 하나요?” 를 물어 대비시킵니다 — 아니오, 옮기기만 합니다. (2분)</p>' },
      { layout: 'practice', title: '실습: Undo / Redo 직접 만들기', desc: '<p><code>Stack&lt;int&gt;</code> 두 개로 되돌리기/다시 실행을 만드세요 (Mat 대신 숫자로 연습).</p><ul><li><code>Apply(값)</code>: current → undo, 값 → current, redo 비우기</li><li><code>Undo()</code> · <code>Redo()</code></li><li>적용 10 · 20 · 30 → 되돌리기 2번 → 다시 실행 → 적용 99</li></ul>', starter: `using System;
using System.Collections.Generic;

class Program
{
    static Stack<int> undo = new Stack<int>();
    static Stack<int> redo = new Stack<int>();
    static int current = 0;

    static void Apply(int value)
    {
        // TODO: current 를 undo 에 넣고, value 를 current 로, redo 를 비우세요
    }

    static void Main()
    {
        Apply(10);
        Apply(20);
        Console.WriteLine($"current={current}, undo={undo.Count}, redo={redo.Count}");
    }
}`, solution: `using System;
using System.Collections.Generic;

class Program
{
    static Stack<int> undo = new Stack<int>();
    static Stack<int> redo = new Stack<int>();
    static int current = 0;

    static void Apply(int value)
    {
        undo.Push(current);
        current = value;
        while (redo.Count > 0) redo.Pop();
    }

    static void Main()
    {
        Apply(10);
        Apply(20);
        Console.WriteLine($"current={current}, undo={undo.Count}, redo={redo.Count}");
    }
}`, notes: '<p>브라우저 실습 2 의 전체 버전을 풀게 합니다. 자주 나오는 실수: ① redo 를 비우지 않아 이상한 “다시 실행”이 생김 ② <code>if (undo.Count == 0) return;</code> 을 빠뜨려 <code>InvalidOperationException</code>. 정답 마지막 줄은 기록 10 → 20, current=99. (8분)</p>' },
      { layout: 'summary', title: '2교시 정리', bullets: [
        '미리보기는 <b>축소본</b>(1280px, Area 보간) · [적용] · [저장]은 <b>원본 해상도</b>',
        '<code>ValueChanged</code> → 값 표시 갱신 → <code>ApplyPreview()</code>, 코드로 값 바꿀 때는 <code>_updatingUi</code>',
        '되돌리기/다시 실행 = <b>Stack&lt;Mat&gt; 2개</b>, 버릴 때만 Dispose',
        '예외는 미리보기에서는 <b>상태 표시줄</b>, 명시적 동작에서는 <b>MessageBox</b>',
        '다음 시간: MVVM 맛보기 · 처리 시간 측정 · 배포(dotnet publish)'
      ], notes: '<p>오늘 배운 패턴(축소 미리보기 · 스택 기록 · 이벤트 재진입 방지)은 이미지 앱이 아니어도 계속 쓰인다고 알려 주세요. 숙제: 완성 앱에서 필터 3개를 적용하고 되돌리기/다시 실행을 눌러 <code>HistoryText</code> 숫자를 관찰하기. (2분)</p>' }
    ]
  };
  // ───────────────────────────── 3교시 ─────────────────────────────

  // 그림 5: MVVM 구조
  const FIG_MVVM = `<svg viewBox="0 0 740 280" role="img" aria-label="View, ViewModel, Model 의 관계와 바인딩 방향">
  ${ARROW('c16a4')}
  <rect x="20" y="40" width="200" height="130" rx="12" class="p1s"/>
  <text x="120" y="66" text-anchor="middle" class="tx-b">View (XAML)</text>
  <text x="120" y="90" text-anchor="middle" class="tx-m">ListBox · Slider · Image</text>
  <text x="120" y="112" text-anchor="middle" class="tx-m">Binding · Command</text>
  <text x="120" y="134" text-anchor="middle" class="tx-m">코드 비하인드 거의 없음</text>
  <text x="120" y="156" text-anchor="middle" class="tx-m">DataContext = ViewModel</text>

  <rect x="270" y="40" width="200" height="130" rx="12" class="p3s"/>
  <text x="370" y="66" text-anchor="middle" class="tx-b">ViewModel</text>
  <text x="370" y="90" text-anchor="middle" class="tx-m">SelectedFilter · P1 · P2</text>
  <text x="370" y="112" text-anchor="middle" class="tx-m">ResultSource · Status</text>
  <text x="370" y="134" text-anchor="middle" class="tx-m">ApplyCommand · UndoCommand</text>
  <text x="370" y="156" text-anchor="middle" class="tx-m">INotifyPropertyChanged</text>

  <rect x="520" y="40" width="200" height="130" rx="12" class="p2s"/>
  <text x="620" y="66" text-anchor="middle" class="tx-b">Model (처리)</text>
  <text x="620" y="90" text-anchor="middle" class="tx-m">FilterPipeline</text>
  <text x="620" y="112" text-anchor="middle" class="tx-m">HistoryManager</text>
  <text x="620" y="134" text-anchor="middle" class="tx-m">ImageFile</text>
  <text x="620" y="156" text-anchor="middle" class="tx-m">WPF 참조 0개</text>

  <line x1="222" y1="88" x2="266" y2="88" class="ln" stroke-width="2" marker-end="url(#c16a4)"/>
  <text x="244" y="78" text-anchor="middle" class="tx-m">입력</text>
  <line x1="266" y1="126" x2="222" y2="126" class="ln" stroke-width="2" marker-end="url(#c16a4)"/>
  <text x="244" y="146" text-anchor="middle" class="tx-m">알림</text>
  <line x1="472" y1="105" x2="516" y2="105" class="ln" stroke-width="2" marker-end="url(#c16a4)"/>
  <text x="494" y="95" text-anchor="middle" class="tx-m">호출</text>

  <text x="370" y="204" text-anchor="middle" class="tx-m">ViewModel 이 <tspan class="tx-b">PropertyChanged</tspan> 를 발생시키면 Binding 이 화면을 스스로 갱신한다</text>
  <text x="370" y="228" text-anchor="middle" class="tx-m">이 차시의 앱은 <tspan class="tx-b">코드 비하인드 방식</tspan> — 작은 앱에는 충분하고, 커지면 MVVM 으로 옮긴다</text>
  <text x="370" y="254" text-anchor="middle" class="tx-m">이미 Model(FilterPipeline · HistoryManager)을 분리해 두었으므로 옮기기가 쉽다</text>
</svg>`;

  const CS_VM = `// ViewModel 예시 (MVVM 으로 옮길 때) — MainViewModel.cs
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using System.Windows.Media.Imaging;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;

namespace Ch16_ImageStudio;

/// <summary>모든 ViewModel 의 부모: 속성이 바뀌면 화면에 알린다</summary>
public abstract class ObservableObject : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    protected void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

    /// <summary>값이 실제로 바뀌었을 때만 알림 (무한 갱신 방지)</summary>
    protected bool Set<T>(ref T field, T value, [CallerMemberName] string? name = null)
    {
        if (Equals(field, value)) return false;
        field = value;
        OnPropertyChanged(name);
        return true;
    }
}

/// <summary>버튼이 쓰는 명령: 실행할 일 + 실행 가능 여부</summary>
public sealed class RelayCommand : ICommand
{
    private readonly Action _execute;
    private readonly Func<bool>? _canExecute;

    public RelayCommand(Action execute, Func<bool>? canExecute = null)
    {
        _execute = execute;
        _canExecute = canExecute;
    }

    public event EventHandler? CanExecuteChanged;
    public bool CanExecute(object? parameter) => _canExecute?.Invoke() ?? true;
    public void Execute(object? parameter) => _execute();

    /// <summary>버튼 활성화를 다시 계산하게 한다</summary>
    public void RaiseCanExecuteChanged() => CanExecuteChanged?.Invoke(this, EventArgs.Empty);
}

public sealed class MainViewModel : ObservableObject
{
    private readonly HistoryManager _history = new();
    private FilterInfo _selectedFilter = FilterPipeline.Filters[0];
    private double _p1, _p2;
    private BitmapSource? _resultSource;
    private string _status = "[열기] 로 이미지를 불러오세요.";

    public IReadOnlyList<FilterInfo> Filters => FilterPipeline.Filters;   // ListBox ItemsSource

    public FilterInfo SelectedFilter
    {
        get => _selectedFilter;
        set { if (Set(ref _selectedFilter, value)) { P1 = value.P1.Default; P2 = value.P2.Default; UpdatePreview(); } }
    }

    public double P1
    {
        get => _p1;
        set { if (Set(ref _p1, value)) UpdatePreview(); }
    }

    public BitmapSource? ResultSource { get => _resultSource; private set => Set(ref _resultSource, value); }
    public string Status { get => _status; private set => Set(ref _status, value); }

    public ICommand ApplyCommand { get; }
    public ICommand UndoCommand { get; }

    public MainViewModel()
    {
        ApplyCommand = new RelayCommand(Apply, () => _history.Current != null);
        UndoCommand = new RelayCommand(() => { _history.Undo(); UpdatePreview(); }, () => _history.CanUndo);
    }

    private void UpdatePreview()
    {
        if (_history.Current == null) return;
        using Mat result = FilterPipeline.Apply(_history.Current, SelectedFilter.Kind, P1, P2);
        ResultSource = result.ToBitmapSource();      // BitmapSource 는 픽셀을 복사해 가진다
        Status = $"{SelectedFilter.DisplayName} p1={P1:F1} p2={P2:F1}";
    }

    private void Apply()
    {
        _history.Push(FilterPipeline.Apply(_history.Current!, SelectedFilter.Kind, P1, P2));
        UpdatePreview();
    }
}`;

  const XAML_BIND = `<!-- MVVM 방식이라면 XAML 이 이렇게 바뀝니다 (Click 대신 Command, x:Name 대신 Binding) -->
<Window x:Class="Ch16_ImageStudio.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:local="clr-namespace:Ch16_ImageStudio"
        Title="이미지 처리 스튜디오 (MVVM)" Height="720" Width="1200">
    <Window.DataContext>
        <local:MainViewModel />
    </Window.DataContext>

    <DockPanel>
        <StackPanel DockPanel.Dock="Left" Width="270" Margin="8">
            <!-- 목록: ItemsSource 와 SelectedItem 을 ViewModel 에 연결 -->
            <ListBox ItemsSource="{Binding Filters}"
                     SelectedItem="{Binding SelectedFilter, Mode=TwoWay}" Height="240" />

            <!-- 슬라이더: 이름 · 범위 · 값 모두 Binding -->
            <TextBlock Text="{Binding SelectedFilter.P1.Label}" Margin="0,8,0,0" />
            <Slider Minimum="{Binding SelectedFilter.P1.Min}"
                    Maximum="{Binding SelectedFilter.P1.Max}"
                    Value="{Binding P1, Mode=TwoWay}"
                    IsEnabled="{Binding SelectedFilter.P1.Enabled}" />

            <!-- 버튼: Click 대신 Command — CanExecute 가 false 면 자동으로 회색 -->
            <Button Content="적용" Command="{Binding ApplyCommand}" Margin="0,8,0,0" />
            <Button Content="되돌리기" Command="{Binding UndoCommand}" />
        </StackPanel>

        <Image Source="{Binding ResultSource}" Stretch="Uniform" Margin="8" />
    </DockPanel>
</Window>`;

  const EX_VM = `using System;
using System.Collections.Generic;
using OpenCvSharp;

enum FilterKind { None, Gray, GaussianBlur }

// WPF 의 INotifyPropertyChanged 를 최소한으로 흉내 낸 것 (실제로는 PropertyChangedEventHandler)
class ObservableObject
{
    public event Action<string> PropertyChanged;

    protected void OnChanged(string name)
    {
        PropertyChanged?.Invoke(name);      // 구독자가 없으면 아무 일도 안 한다
    }
}

// ICommand 를 최소한으로 흉내 낸 것 (버튼이 쓰는 명령)
class RelayCommand
{
    readonly Action _execute;
    readonly Func<bool> _canExecute;

    public RelayCommand(Action execute, Func<bool> canExecute)
    {
        _execute = execute;
        _canExecute = canExecute;
    }

    public bool CanExecute()
    {
        return _canExecute == null || _canExecute();      // 버튼 활성화 여부
    }

    public void Execute()
    {
        if (CanExecute()) _execute();
    }
}

class StudioViewModel : ObservableObject
{
    readonly Stack<Mat> _undo = new Stack<Mat>();
    FilterKind _kind = FilterKind.None;
    double _p1 = 7;

    public Mat Current { get; private set; }
    public string Status { get; private set; }
    public RelayCommand ApplyCommand { get; private set; }
    public RelayCommand UndoCommand { get; private set; }

    public StudioViewModel(Mat first)
    {
        Current = first;
        Status = "";
        ApplyCommand = new RelayCommand(Apply, null);
        UndoCommand = new RelayCommand(Undo, CanUndo);
    }

    public FilterKind Kind
    {
        get { return _kind; }
        set
        {
            if (_kind == value) return;      // 같은 값이면 알리지 않는다 (무한 갱신 방지)
            _kind = value;
            OnChanged("Kind");
            Refresh();
        }
    }

    public double P1
    {
        get { return _p1; }
        set
        {
            if (_p1 == value) return;
            _p1 = value;
            OnChanged("P1");
            Refresh();
        }
    }

    bool CanUndo() { return _undo.Count > 0; }

    void Refresh()
    {
        Status = $"{_kind} p1={_p1:F0} -> 평균 {Cv2.Mean(Current).Val0:F1}";
        OnChanged("Status");
    }

    void Apply()
    {
        Mat dst;
        if (_kind == FilterKind.Gray)
        {
            dst = new Mat();
            Cv2.CvtColor(Current, dst, ColorConversionCodes.BGR2GRAY);
        }
        else if (_kind == FilterKind.GaussianBlur)
        {
            dst = new Mat();
            int k = (int)_p1 % 2 == 0 ? (int)_p1 + 1 : (int)_p1;
            Cv2.GaussianBlur(Current, dst, new Size(k, k), 0);
        }
        else
        {
            dst = Current.Clone();
        }
        _undo.Push(Current);
        Current = dst;
        OnChanged("Current");
        Refresh();
    }

    void Undo()
    {
        if (_undo.Count == 0) return;
        Current.Dispose();
        Current = _undo.Pop();
        OnChanged("Current");
        Refresh();
    }
}

class Program
{
    static void Main()
    {
        var vm = new StudioViewModel(Cv2.ImRead("images/sample_color.png", ImreadModes.Color));
        vm.PropertyChanged += name => Console.WriteLine($"  [알림] {name} 바뀜 -> Binding 이 화면 갱신");

        Console.WriteLine("① ListBox 에서 Gray 선택 (SelectedFilter 바인딩)");
        vm.Kind = FilterKind.Gray;
        Console.WriteLine("  상태: " + vm.Status);
        Console.WriteLine($"  UndoCommand.CanExecute = {vm.UndoCommand.CanExecute()} (버튼 회색)");

        Console.WriteLine("② [적용] 버튼 클릭 (ApplyCommand)");
        vm.ApplyCommand.Execute();
        Console.WriteLine($"  상태: {vm.Status}, 채널 {vm.Current.Channels()}");
        Console.WriteLine($"  UndoCommand.CanExecute = {vm.UndoCommand.CanExecute()} (버튼 활성)");

        Console.WriteLine("③ 슬라이더 21, 필터 GaussianBlur, 적용");
        vm.P1 = 21;
        vm.Kind = FilterKind.GaussianBlur;
        vm.ApplyCommand.Execute();
        Console.WriteLine("  상태: " + vm.Status);

        Console.WriteLine("④ [되돌리기] 버튼 클릭 (UndoCommand)");
        vm.UndoCommand.Execute();
        Console.WriteLine($"  상태: {vm.Status}, 채널 {vm.Current.Channels()}");

        Cv2.ImShow("current", vm.Current);
        Cv2.WaitKey(0);
    }
}`;

  const EX_PERF = `using System;
using System.Diagnostics;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);

        // 큰 이미지를 흉내 내기 위해 1920 x 1440 으로 확대
        using var big = new Mat();
        Cv2.Resize(src, big, new Size(1920, 1440), 0, 0, InterpolationFlags.Cubic);

        var sw = Stopwatch.StartNew();
        using var full = new Mat();
        Cv2.GaussianBlur(big, full, new Size(21, 21), 0);
        double tFull = sw.Elapsed.TotalMilliseconds;

        // 미리보기: 1/4 로 축소한 뒤 처리
        using var preview = new Mat();
        Cv2.Resize(big, preview, new Size(), 0.25, 0.25, InterpolationFlags.Area);
        sw.Restart();
        using var fast = new Mat();
        Cv2.GaussianBlur(preview, fast, new Size(21, 21), 0);
        double tPreview = sw.Elapsed.TotalMilliseconds;

        Console.WriteLine($"원본   {big.Width} x {big.Height} : {tFull:F1} ms");
        Console.WriteLine($"미리보기 {preview.Width} x {preview.Height} : {tPreview:F1} ms");
        Console.WriteLine($"약 {tFull / Math.Max(tPreview, 0.01):F0} 배 빠름 (픽셀 수가 16분의 1)");
        Console.WriteLine("사람은 50 ms 이하를 '즉시' 로 느낍니다 — 미리보기는 반드시 축소본으로");

        Cv2.ImShow("preview result", fast);
        Cv2.WaitKey(0);
    }
}`;

  const EX_CHAIN = `using System;
using System.Collections.Generic;
using System.Diagnostics;
using OpenCvSharp;

class Program
{
    static Mat Apply(Mat src, string kind, double p1, double p2)
    {
        var dst = new Mat();
        if (kind == "Gray") Cv2.CvtColor(src, dst, ColorConversionCodes.BGR2GRAY);
        else if (kind == "GaussianBlur") Cv2.GaussianBlur(src, dst, new Size((int)p1, (int)p1), 0);
        else if (kind == "Canny") Cv2.Canny(src, dst, p1, p2);
        else if (kind == "Dilate")
        {
            using var el = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size((int)p1, (int)p1));
            Cv2.Dilate(src, dst, el, new Point(-1, -1), (int)p2);
        }
        else src.CopyTo(dst);
        return dst;
    }

    static void Main()
    {
        // [적용] 을 네 번 누른 것과 같다: 각 단계가 다음 단계의 입력이 된다
        string[] steps = { "Gray", "GaussianBlur", "Canny", "Dilate" };
        double[] p1s = { 0, 5, 60, 3 };
        double[] p2s = { 0, 0, 150, 1 };

        Mat current = Cv2.ImRead("images/bracket_edges.png", ImreadModes.Color);
        Console.WriteLine($"원본: {current.Width}x{current.Height}, 채널 {current.Channels()}");

        var history = new List<string>();
        for (int i = 0; i < steps.Length; i++)
        {
            Mat next = Apply(current, steps[i], p1s[i], p2s[i]);
            current.Dispose();                      // 이전 단계는 더 필요 없다
            current = next;
            history.Add(steps[i]);
            Console.WriteLine($"{i + 1}. {steps[i],-13} -> 채널 {current.Channels()}, 흰 픽셀 {Cv2.CountNonZero(current)}");
        }
        Console.WriteLine("기록: " + string.Join(" -> ", history));

        Cv2.ImShow("chain result", current);
        Cv2.WaitKey(0);
        current.Dispose();
        Console.WriteLine($"마지막 Mat 해제: {current.IsDisposed}");
    }
}`;

  const EX_STABLE = `using System;
using OpenCvSharp;

class Program
{
    // 사용자가 슬라이더를 어디로 옮겨도 죽지 않는 안전한 래퍼
    static Mat SafeApply(Mat src, string kind, double p1, out string message)
    {
        try
        {
            var dst = new Mat();
            if (kind == "MedianBlur") Cv2.MedianBlur(src, dst, (int)p1);
            else if (kind == "Otsu") Cv2.Threshold(src, dst, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
            else src.CopyTo(dst);
            message = "성공";
            return dst;
        }
        catch (OpenCVException)
        {
            message = "OpenCV 오류 → 원본을 그대로 보여 줍니다";
            return src.Clone();                 // 실패해도 화면에 보일 Mat 은 돌려준다
        }
    }

    static void Main()
    {
        using var color = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);

        // ① 짝수 커널 (슬라이더가 4 를 가리켰다)
        using (Mat r1 = SafeApply(color, "MedianBlur", 4, out string m1))
            Console.WriteLine($"MedianBlur 4 : {m1}, 결과 {r1.Width}x{r1.Height} 채널 {r1.Channels()}");

        // ② 홀수 커널 (정상)
        using (Mat r2 = SafeApply(color, "MedianBlur", 5, out string m2))
            Console.WriteLine($"MedianBlur 5 : {m2}, 평균 {Cv2.Mean(r2).Val0:F1}");

        // ③ 3채널에 Otsu (채널 수 규칙 위반)
        using (Mat r3 = SafeApply(color, "Otsu", 0, out string m3))
            Console.WriteLine($"Otsu(3채널)  : {m3}, 채널 {r3.Channels()}");

        // ④ 1채널에 Otsu (정상)
        using var gray = new Mat();
        Cv2.CvtColor(color, gray, ColorConversionCodes.BGR2GRAY);
        using (Mat r4 = SafeApply(gray, "Otsu", 0, out string m4))
            Console.WriteLine($"Otsu(1채널)  : {m4}, 흰 픽셀 {Cv2.CountNonZero(r4)}");

        Console.WriteLine("네 번 모두 예외로 죽지 않았습니다 — WPF 라면 앱이 계속 동작합니다");
    }
}`;

  const SH_PUBLISH = `# ① Release 빌드 (Visual Studio: 상단 구성 콤보를 Debug -> Release)
dotnet build Ch16_ImageStudio.csproj -c Release

# ② 배포용 폴더 만들기 (실행 파일 + 필요한 DLL 을 한 폴더에)
dotnet publish Ch16_ImageStudio.csproj -c Release -r win-x64 --self-contained false -o publish

# ③ .NET 런타임이 없는 PC 에도 그대로 복사해 쓰려면 (용량 커짐: 약 150MB)
dotnet publish Ch16_ImageStudio.csproj -c Release -r win-x64 --self-contained true -o publish-standalone

# ④ 결과 확인: publish 폴더에 아래 파일들이 있어야 합니다
#    Ch16_ImageStudio.exe
#    OpenCvSharp.dll               (C# 래퍼)
#    OpenCvSharpExtern.dll         (네이티브 OpenCV — 이 파일이 없으면 실행 즉시 DllNotFoundException)
#    runtimes/win-x64/native/...   (runtime.win 패키지가 넣어 줍니다)
#    images/                       (csproj 의 Content 로 복사한 예제 이미지)`;

  const SEC3 = {
    id: 'cs16-3', title: '마무리: MVVM 맛보기 · 성능 · 안정성 · 배포', minutes: 50,
    goals: ['INotifyPropertyChanged · Binding · ICommand 로 화면과 로직을 분리하는 방식을 이해한다', 'Stopwatch 로 처리 시간을 재고 축소 미리보기의 효과를 설명할 수 있다', 'using · try/catch 로 안정성을 확보하고 dotnet publish 로 배포할 수 있다'],
    flow: [['MVVM 맛보기', 16], ['성능 측정', 12], ['안정성', 10], ['배포 · 전체 정리', 12]],
    content: [
      { type: 'h', text: 'MVVM 맛보기: 코드 비하인드에서 한 걸음 더' },
      { type: 'p', html: '지금까지 만든 앱은 <b>코드 비하인드</b> 방식입니다 — <code>MainWindow.xaml.cs</code> 가 컨트롤 이름(<code>P1Slider</code>, <code>ResultImage</code>)을 직접 만집니다. 작은 앱에는 이 방식이 가장 빠르고 읽기 쉽습니다. 하지만 화면이 커지면 ① 화면 없이 로직을 테스트할 수 없고 ② 같은 로직을 다른 화면에서 재사용하기 어렵고 ③ 디자이너와 개발자가 같은 파일을 고치게 됩니다. 그래서 규모가 커지면 <b>MVVM</b>(Model – View – ViewModel)으로 옮깁니다.' },
      { type: 'figure', html: FIG_MVVM, caption: '그림 5. MVVM — View 는 Binding 으로 ViewModel 을 보고, ViewModel 은 Model(FilterPipeline)을 호출한다' },
      { type: 'table', head: ['', '코드 비하인드 (이 앱)', 'MVVM'], rows: [
        ['화면 값 읽기', '<code>P1Slider.Value</code>', '<code>Binding</code> 으로 ViewModel 속성 <code>P1</code>'],
        ['화면 갱신', '<code>ResultImage.Source = …</code>', '<code>ResultSource</code> 속성 + <code>PropertyChanged</code> 알림'],
        ['버튼', '<code>Click="ApplyButton_Click"</code>', '<code>Command="{Binding ApplyCommand}"</code>'],
        ['버튼 활성화', '<code>UndoButton.IsEnabled = …</code> 직접 대입', '<code>ICommand.CanExecute</code> 가 자동 반영'],
        ['테스트', '창을 띄워야 함', 'ViewModel 만 new 해서 단위 테스트'],
        ['적합한 규모', '화면 1~2개, 컨트롤 수십 개', '화면 여러 개, 팀 작업, 테스트 필수']
      ], caption: '표 2. 두 방식 비교 — 어느 쪽도 틀리지 않다. 규모에 맞게 고른다' },
      { type: 'p', html: 'MVVM 의 핵심 부품은 딱 세 가지입니다. ① <b><code>INotifyPropertyChanged</code></b>: 속성이 바뀌었다고 알리는 이벤트 ② <b><code>Binding</code></b>: XAML 이 그 알림을 듣고 화면을 갱신 ③ <b><code>ICommand</code></b>: 버튼이 호출할 “명령”(실행할 일 + 실행 가능 여부). 아래 예제는 이 세 가지를 <b>브라우저에서 돌아가는 콘솔 코드</b>로 흉내 낸 것입니다 — <code>event</code> 와 <code>?.Invoke</code>, 대리자(<code>Action</code> · <code>Func&lt;bool&gt;</code>)만 있으면 원리를 그대로 볼 수 있습니다.' },
      { type: 'code', title: '예제 1: ViewModel · RelayCommand 원리 (콘솔 버전)', code: EX_VM,
        desc: '<code>vm.Kind = FilterKind.Gray;</code> 한 줄이 <b>“[알림] Kind 바뀜”</b> 과 <b>“[알림] Status 바뀜”</b> 을 일으키는 것을 보세요 — WPF 에서는 이 알림이 <code>Binding</code> 을 통해 <b>화면 갱신</b>이 됩니다. <code>UndoCommand.CanExecute()</code> 가 <code>false</code> → <code>true</code> 로 바뀌는 것이 곧 <b>버튼이 회색에서 활성으로</b> 바뀌는 것입니다. <code>if (_kind == value) return;</code> 으로 같은 값일 때 알리지 않는 것도 중요합니다 (2교시의 <code>_updatingUi</code> 와 같은 이유).',
        expect: '① ListBox 에서 Gray 선택 (SelectedFilter 바인딩)\n  [알림] Kind 바뀜 -> Binding 이 화면 갱신\n  [알림] Status 바뀜 -> Binding 이 화면 갱신\n  상태: Gray p1=7 -> 평균 115.5\n  UndoCommand.CanExecute = False (버튼 회색)\n② [적용] 버튼 클릭 (ApplyCommand)\n  [알림] Current 바뀜 -> Binding 이 화면 갱신\n  [알림] Status 바뀜 -> Binding 이 화면 갱신\n  상태: Gray p1=7 -> 평균 119.2, 채널 1\n  UndoCommand.CanExecute = True (버튼 활성)\n③ 슬라이더 21, 필터 GaussianBlur, 적용\n  [알림] P1 바뀜 -> Binding 이 화면 갱신\n  [알림] Status 바뀜 -> Binding 이 화면 갱신\n  [알림] Kind 바뀜 -> Binding 이 화면 갱신\n  [알림] Status 바뀜 -> Binding 이 화면 갱신\n  [알림] Current 바뀜 -> Binding 이 화면 갱신\n  [알림] Status 바뀜 -> Binding 이 화면 갱신\n  상태: GaussianBlur p1=21 -> 평균 119.2\n④ [되돌리기] 버튼 클릭 (UndoCommand)\n  [알림] Current 바뀜 -> Binding 이 화면 갱신\n  [알림] Status 바뀜 -> Binding 이 화면 갱신\n  상태: GaussianBlur p1=21 -> 평균 119.2, 채널 1' },
      { type: 'code', title: 'MainViewModel.cs — 실제 WPF 라면 (Visual Studio 에서 실행)', code: CS_VM, run: false, local: true, file: 'MainViewModel.cs',
        desc: '<code>[CallerMemberName]</code> 덕분에 <code>OnPropertyChanged()</code> 를 인수 없이 불러도 속성 이름이 자동으로 들어갑니다. <code>Set(ref field, value)</code> 헬퍼는 “같으면 아무 일도 안 하고 false, 바뀌면 알리고 true” 라는 아주 흔한 패턴입니다. 주의: <code>ResultSource</code> 는 <code>BitmapSource</code> 이고 <b>픽셀을 복사해 가지므로</b> 원본 <code>Mat</code> 은 <code>using</code> 으로 바로 해제해도 됩니다.' },
      { type: 'code', title: 'MainWindow.xaml — MVVM 방식 Binding (Visual Studio 에서 실행)', code: XAML_BIND, lang: 'xml', file: 'MainWindow.xaml', run: false,
        desc: '<code>x:Name</code> 과 <code>Click</code> 이 거의 사라진 것에 주목하세요. <code>{Binding SelectedFilter.P1.Label}</code> 처럼 <b>점으로 파고들 수 있고</b>, <code>Mode=TwoWay</code> 는 “화면 → ViewModel” 방향도 열어 줍니다(Slider · TextBox · SelectedItem 에 필요). 버튼은 <code>Command</code> 하나로 실행과 활성화가 모두 처리됩니다.' },
      { type: 'callout', kind: 'more', title: 'MVVM 을 지금 당장 써야 할까?', html: '아닙니다. <b>이 차시의 앱 규모에서는 코드 비하인드가 더 읽기 쉽습니다.</b> 중요한 것은 이미 <b>Model 을 분리</b>해 두었다는 점입니다 — <code>FilterPipeline</code> · <code>HistoryManager</code> 는 MVVM 으로 옮길 때 <b>한 줄도 바뀌지 않습니다</b>. 실무에서 MVVM 을 도입할 때는 <code>CommunityToolkit.Mvvm</code>(<code>[ObservableProperty]</code> · <code>[RelayCommand]</code> 특성) 을 쓰면 위의 상용구가 대부분 사라집니다.' },
      { type: 'h', text: '성능: 어디가 느린지 재고 나서 고친다' },
      { type: 'p', html: '“느린 것 같다” 로 고치지 말고 <b><code>Stopwatch</code> 로 재고</b> 고칩니다. <code>Stopwatch.StartNew()</code> → 작업 → <code>sw.Elapsed.TotalMilliseconds</code>. 이 앱은 상태 표시줄에 항상 처리 시간을 표시하므로 어떤 필터가 무거운지 사용자도 바로 압니다.' },
      { type: 'code', title: '예제 2: 원본 vs 축소 미리보기 처리 시간 (실행할 때마다 값이 다릅니다)', code: EX_PERF, nondeterministic: true,
        desc: '픽셀 수가 1/16 이 되면 처리 시간도 대략 1/16 이 됩니다. 브라우저 인터프리터는 .NET 보다 훨씬 느리므로 절대 시간은 크게 나오지만 <b>비율</b>은 로컬 PC 와 비슷합니다. 로컬에서도 1920×1440 GaussianBlur(21) 은 수십 ms, 4000×3000 은 수백 ms 가 걸립니다 — 슬라이더를 끄는 동안 그것을 매번 하면 앱이 멈춥니다.' },
      { type: 'list', items: [
        '<b>축소 미리보기</b> (가장 효과가 큼): 1280px 이하로 줄여 처리 → 10~30배',
        '<b>불필요한 변환 줄이기</b>: 같은 <code>ToGray</code> 를 여러 번 하지 말고 한 번 만들어 재사용',
        '<b>큰 커널 대신 작은 커널 반복</b>: GaussianBlur(51) 보다 GaussianBlur(9) ×2 가 비슷한 결과에 더 빠를 수 있음',
        '<b>ROI 로 필요한 영역만</b>: 화면에 보이는 부분만 처리 (확대 보기 기능이 있을 때)',
        '<b>Release 빌드로 측정</b>: Debug 빌드는 최적화가 꺼져 있어 시간이 다르게 나옴',
        '<b>스레드로 옮기는 것은 마지막 수단</b>: <code>Task.Run</code> + <code>Dispatcher</code> 가 필요하고 취소 · 순서 문제가 생김'
      ] },
      { type: 'code', title: '예제 3: [적용]을 네 번 누른 것 = 필터 연쇄', code: EX_CHAIN,
        desc: '각 단계의 결과가 다음 단계의 입력이 됩니다. <b>이전 단계를 즉시 <code>Dispose</code></b> 하는 것에 주목하세요 — 실제 앱에서는 <code>HistoryManager</code> 가 “되돌리기”를 위해 보관하지만, 보관하지 않는 중간 결과는 바로 해제해야 합니다. 마지막 <code>IsDisposed</code> 로 정리를 확인합니다.',
        expect: '원본: 640x480, 채널 3\n1. Gray          -> 채널 1, 흰 픽셀 307200\n2. GaussianBlur  -> 채널 1, 흰 픽셀 307200\n3. Canny         -> 채널 1, 흰 픽셀 1318\n4. Dilate        -> 채널 1, 흰 픽셀 3840\n기록: Gray -> GaussianBlur -> Canny -> Dilate\n마지막 Mat 해제: True' },
      { type: 'h', text: '안정성: 죽지 않는 앱' },
      { type: 'code', title: '예제 4: 어떤 파라미터가 와도 죽지 않는 래퍼', code: EX_STABLE,
        desc: '<code>SafeApply</code> 는 실패해도 <b>화면에 보일 Mat 을 반드시 돌려줍니다</b>(원본 복사본). 이렇게 하면 화면 코드에 <code>null</code> 검사가 퍼지지 않습니다. 실무에서는 여기에 로그(어떤 파라미터에서 실패했는지)를 남깁니다.',
        expect: 'MedianBlur 4 : OpenCV 오류 → 원본을 그대로 보여 줍니다, 결과 640x480 채널 3\nMedianBlur 5 : 성공, 평균 115.5\nOtsu(3채널)  : OpenCV 오류 → 원본을 그대로 보여 줍니다, 채널 3\nOtsu(1채널)  : 성공, 흰 픽셀 219939\n네 번 모두 예외로 죽지 않았습니다 — WPF 라면 앱이 계속 동작합니다' },
      { type: 'callout', kind: 'tip', title: '안정성 체크리스트', html: '<ul><li><b>모든 Mat 에 소유자가 있는가?</b> — <code>using</code> · <code>using var</code> · 필드 + <code>OnClosed</code> 에서 Dispose</li><li><b>catch 를 너무 넓게 잡지 않았나?</b> — <code>catch (Exception)</code> 로 전부 삼키면 버그가 숨는다. <code>OpenCVException</code> · <code>IOException</code> 처럼 구체적으로</li><li><b>예외 메시지를 사용자에게 그대로 보여 주나?</b> — 미리보기는 상태 표시줄, 명시적 동작은 MessageBox</li><li><b>이미지를 못 읽었을 때</b> — <code>mat.Empty()</code> 검사 (경로 오류 · 지원하지 않는 형식)</li><li><b>창을 닫을 때</b> — <code>OnClosed</code> 에서 <code>_result</code>, <code>_preview</code>, <code>_history</code> 모두 해제</li></ul>' },
      { type: 'h', text: '배포: 다른 PC 에서 실행되게' },
      { type: 'code', title: 'Release 빌드와 dotnet publish', code: SH_PUBLISH, lang: 'sh', run: false,
        desc: 'OpenCvSharp 배포에서 가장 흔한 사고는 <b><code>OpenCvSharpExtern.dll</code> 이 빠지는 것</b>입니다(<code>DllNotFoundException</code>). <code>OpenCvSharp4.runtime.win</code> 패키지를 참조했는지, <code>publish</code> 폴더에 <code>runtimes/win-x64/native</code> 가 있는지 확인하세요. 또 <b>x64 로 빌드</b>해야 합니다(AnyCPU + 32비트 선호 설정이면 실패).' },
      { type: 'table', head: ['파일', '역할', '이 차시'], rows: [
        ['<code>MainWindow.xaml</code>', '화면 레이아웃 (Grid · DockPanel · ListBox · Slider · Image · StatusBar)', '1교시'],
        ['<code>MainWindow.xaml.cs</code>', '이벤트 처리, 미리보기 축소, 표시 · 저장, 예외 처리', '2교시'],
        ['<code>FilterPipeline.cs</code>', '<code>enum FilterKind</code> · <code>record ParamInfo/FilterInfo</code> · <code>Mat Apply(...)</code> — 순수 처리 로직', '1교시'],
        ['<code>HistoryManager.cs</code>', '<code>Stack&lt;Mat&gt;</code> 2개로 되돌리기/다시 실행, <code>IDisposable</code>', '2교시'],
        ['<code>ImageFile.cs</code>', '한글 경로 안전한 읽기/쓰기 (<code>ImDecode</code> · <code>ImEncode</code> + 바이트 배열)', '2교시'],
        ['<code>App.xaml</code>', '<code>StartupUri</code>, 버튼 공통 스타일(<code>ToolButton</code>)', '1교시'],
        ['<code>Ch16_ImageStudio.csproj</code>', 'NuGet 3개, <code>UseWPF</code>, 예제 이미지 복사 규칙', '1 · 3교시']
      ], caption: '표 3. 완성 프로젝트 파일 구성 — 화면 2개 파일, 로직 3개 파일' },
      { type: 'wpf', title: '스스로 확장해 보기', project: 'Ch16_ImageStudio', html: '<ol><li><b>필터 추가</b>: <code>FilterKind</code> · <code>Filters</code> 목록 · <code>Apply</code> 세 곳만 고치면 됩니다 (화면은 그대로!). 예: <code>Rotate</code>(각도 슬라이더), <code>Brightness</code>(<code>ConvertTo</code> 의 alpha · beta)</li><li><b>기록 목록 UI</b>: <code>ListBox</code> 에 적용한 필터 이름을 쌓아 보여 주기 (2교시 예제 3)</li><li><b>확대/축소 · 픽셀 값 표시</b>: <code>Image</code> 의 <code>MouseMove</code> 에서 좌표 → Mat 좌표로 환산해 상태 표시줄에 <code>B G R</code> 표시 (02차시)</li><li><b>드래그 앤 드롭</b>: <code>Window</code> 의 <code>AllowDrop="True"</code> + <code>Drop</code> 이벤트로 이미지 파일 받기</li></ol>' },
      { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도 · 평가', html: '<p><b>수업 준비</b></p><ul><li>교사 PC 에 <code>wpf/Ch16_ImageStudio</code> 를 미리 빌드해 두세요(첫 NuGet 복원이 1~2분). 실행 화면을 띄운 상태로 1교시를 시작하면 효과가 큽니다.</li><li>작업 관리자(메모리 열)를 함께 띄워 두면 Mat 누수 시연이 강렬합니다: <code>_result?.Dispose()</code> 를 주석 처리한 버전을 따로 준비해 슬라이더를 흔들어 보여 주세요.</li><li>학생 PC 에 Visual Studio 가 없으면 3교시 배포 부분은 시연만 하고, 브라우저 예제로 로직에 집중합니다.</li></ul><p><b>자주 나오는 오개념</b></p><ul><li>“<code>Apply</code> 가 원본을 바꾼다고 생각” → 예제 4(1교시)의 마지막 줄로 확인시키기.</li><li>“Undo 할 때 Mat 을 Dispose 해야 한다고 생각” → 옮기기 vs 버리기 구분. 되돌리기 후 화면이 깨지는 버그를 직접 만들어 보여 주면 확실히 이해합니다.</li><li>“미리보기 축소본을 저장해도 된다고 생각” → 저장 후 파일 크기 · 해상도를 확인시키기.</li><li>“MVVM 이 항상 더 좋다” → 규모 이야기로 정리. 지금 앱에서 MVVM 을 강요하지 마세요.</li></ul><p><b>평가 루브릭 (100점)</b></p><ul><li>레이아웃 구현 (Grid · DockPanel · 컨트롤 배치) 20점</li><li><code>FilterPipeline</code> 분리와 필터 3개 이상 정상 동작 25점</li><li>슬라이더 즉시 미리보기 + 축소 처리 20점</li><li>되돌리기/다시 실행 정상 동작 + Mat 해제 20점</li><li>저장 · 예외 처리 · 상태 표시줄 15점</li></ul><p>💬 발문 모음: “필터를 하나 더 넣으려면 몇 개 파일을 고쳐야 할까?”(3곳, 화면은 0곳) / “되돌리기를 100번 할 수 있게 하려면 무엇이 문제가 될까?”(메모리 — 개수 제한 또는 압축 저장) / “이 앱을 검사 장비에 쓰려면 무엇이 더 필요할까?”(카메라 입력 · 판정 · 로그 — 17차시)</p>' }
    ],
    practice: [
      {
        title: '속성 알림(PropertyChanged) 붙여 보기', level: 2,
        desc: '<code>ObservableObject</code> 를 상속한 <code>SettingsViewModel</code> 을 만들고 <code>Threshold</code>(int) · <code>Invert</code>(bool) 속성을 <b>바뀔 때만</b> 알리도록 구현하세요. 같은 값을 다시 넣으면 알림이 발생하지 않아야 합니다. 마지막에 두 속성으로 <code>images/sample_gray.png</code> 를 이진화해 흰 픽셀 수를 출력하세요.',
        hint: 'setter 에서 <code>if (_threshold == value) return;</code> → 대입 → <code>OnChanged("Threshold")</code>. 반전은 <code>ThresholdTypes.BinaryInv</code>.',
        expect: 'Threshold = 100\n  [알림] Threshold\nThreshold = 100 (같은 값 -> 알림 없어야 함)\nInvert = true\n  [알림] Invert\n임계 100, 반전 True -> 흰 픽셀 86752',
        starter: `using System;
using OpenCvSharp;

class ObservableObject
{
    public event Action<string> PropertyChanged;
    protected void OnChanged(string name) { PropertyChanged?.Invoke(name); }
}

class SettingsViewModel : ObservableObject
{
    int _threshold = 128;
    bool _invert = false;

    public int Threshold
    {
        get { return _threshold; }
        set
        {
            // TODO: 값이 다를 때만 대입하고 OnChanged("Threshold") 를 호출하세요
            _threshold = value;
        }
    }

    public bool Invert
    {
        get { return _invert; }
        set
        {
            // TODO: 값이 다를 때만 대입하고 OnChanged("Invert") 를 호출하세요
            _invert = value;
        }
    }
}

class Program
{
    static void Main()
    {
        var vm = new SettingsViewModel();
        vm.PropertyChanged += n => Console.WriteLine("  [알림] " + n);

        Console.WriteLine("Threshold = 100");
        vm.Threshold = 100;
        Console.WriteLine("Threshold = 100 (같은 값 -> 알림 없어야 함)");
        vm.Threshold = 100;
        Console.WriteLine("Invert = true");
        vm.Invert = true;

        using var gray = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, vm.Threshold, 255, vm.Invert ? ThresholdTypes.BinaryInv : ThresholdTypes.Binary);
        Console.WriteLine($"임계 {vm.Threshold}, 반전 {vm.Invert} -> 흰 픽셀 {Cv2.CountNonZero(bin)}");
        Cv2.ImShow("bin", bin);
        Cv2.WaitKey(0);
    }
}`,
        solution: `using System;
using OpenCvSharp;

class ObservableObject
{
    public event Action<string> PropertyChanged;
    protected void OnChanged(string name) { PropertyChanged?.Invoke(name); }
}

class SettingsViewModel : ObservableObject
{
    int _threshold = 128;
    bool _invert = false;

    public int Threshold
    {
        get { return _threshold; }
        set
        {
            if (_threshold == value) return;
            _threshold = value;
            OnChanged("Threshold");
        }
    }

    public bool Invert
    {
        get { return _invert; }
        set
        {
            if (_invert == value) return;
            _invert = value;
            OnChanged("Invert");
        }
    }
}

class Program
{
    static void Main()
    {
        var vm = new SettingsViewModel();
        vm.PropertyChanged += n => Console.WriteLine("  [알림] " + n);

        Console.WriteLine("Threshold = 100");
        vm.Threshold = 100;
        Console.WriteLine("Threshold = 100 (같은 값 -> 알림 없어야 함)");
        vm.Threshold = 100;
        Console.WriteLine("Invert = true");
        vm.Invert = true;

        using var gray = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, vm.Threshold, 255, vm.Invert ? ThresholdTypes.BinaryInv : ThresholdTypes.Binary);
        Console.WriteLine($"임계 {vm.Threshold}, 반전 {vm.Invert} -> 흰 픽셀 {Cv2.CountNonZero(bin)}");
        Cv2.ImShow("bin", bin);
        Cv2.WaitKey(0);
    }
}`
      },
      {
        title: '처리 시간 표를 만들어 무거운 필터 찾기', level: 2,
        desc: '<code>Stopwatch</code> 로 <b>필터 4개</b>(GaussianBlur 9 / GaussianBlur 31 / MedianBlur 9 / Canny 80-160)의 처리 시간을 재어 표로 출력하세요. 같은 이미지에 대해 <b>원본과 1/2 축소본</b> 두 가지로 재고, 어느 필터가 커널 크기에 가장 민감한지 결론을 적으세요.',
        hint: '<code>var sw = Stopwatch.StartNew(); … sw.Elapsed.TotalMilliseconds</code>. 시간 값은 실행마다 달라지므로 <b>비율</b>을 보세요. 반복 측정이 필요하면 같은 처리를 3번 하고 평균을 내세요.',
        starter: `using System;
using System.Diagnostics;
using OpenCvSharp;

class Program
{
    static double Measure(Mat src, string kind)
    {
        var sw = Stopwatch.StartNew();
        using var dst = new Mat();
        if (kind == "GaussianBlur 9") Cv2.GaussianBlur(src, dst, new Size(9, 9), 0);
        // TODO: "GaussianBlur 31", "MedianBlur 9", "Canny 80-160" 을 추가하세요
        return sw.Elapsed.TotalMilliseconds;
    }

    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        using var half = new Mat();
        Cv2.Resize(src, half, new Size(), 0.5, 0.5, InterpolationFlags.Area);

        string[] kinds = { "GaussianBlur 9", "GaussianBlur 31", "MedianBlur 9", "Canny 80-160" };
        Console.WriteLine("필터 | 원본(ms) | 1/2 축소(ms)");
        foreach (string k in kinds)
            Console.WriteLine($"{k} | {Measure(src, k):F1} | {Measure(half, k):F1}");
    }
}`,
        solution: `using System;
using System.Diagnostics;
using OpenCvSharp;

class Program
{
    static double Measure(Mat src, string kind)
    {
        var sw = Stopwatch.StartNew();
        using var dst = new Mat();
        if (kind == "GaussianBlur 9") Cv2.GaussianBlur(src, dst, new Size(9, 9), 0);
        else if (kind == "GaussianBlur 31") Cv2.GaussianBlur(src, dst, new Size(31, 31), 0);
        else if (kind == "MedianBlur 9") Cv2.MedianBlur(src, dst, 9);
        else if (kind == "Canny 80-160") Cv2.Canny(src, dst, 80, 160);
        return sw.Elapsed.TotalMilliseconds;
    }

    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        using var half = new Mat();
        Cv2.Resize(src, half, new Size(), 0.5, 0.5, InterpolationFlags.Area);

        string[] kinds = { "GaussianBlur 9", "GaussianBlur 31", "MedianBlur 9", "Canny 80-160" };
        Console.WriteLine("필터 | 원본(ms) | 1/2 축소(ms)");
        foreach (string k in kinds)
            Console.WriteLine($"{k} | {Measure(src, k):F1} | {Measure(half, k):F1}");
        Console.WriteLine("결론: 커널이 커지는 GaussianBlur 31 과 MedianBlur 가 가장 무겁고,");
        Console.WriteLine("      축소하면 픽셀 수에 비례해 시간이 줄어든다 -> 미리보기는 축소본으로");
    }
}`,
        nondeterministic: true
      }
    ],
    quiz: [
      { q: 'MVVM 에서 <code>INotifyPropertyChanged</code> 의 역할은?', options: ['컨트롤을 만든다', '속성이 바뀌었음을 알려 <code>Binding</code> 이 화면을 갱신하게 한다', '예외를 잡는다', 'Mat 을 BitmapSource 로 바꾼다'], answer: 1,
        explain: 'ViewModel 이 <code>PropertyChanged("Status")</code> 를 발생시키면, <code>{Binding Status}</code> 로 묶인 컨트롤이 스스로 다시 읽어 갑니다. 화면 코드가 <code>StatusText.Text = …</code> 를 직접 쓰지 않아도 됩니다.' },
      { q: '<code>ICommand</code> 를 쓰면 <code>Click</code> 이벤트보다 좋은 점은?', options: ['더 빠르다', '<code>CanExecute</code> 로 <b>버튼 활성화까지 자동</b>으로 처리된다', 'XAML 이 짧아지는 것 말고는 없다', 'Mat 을 자동으로 해제한다'], answer: 1,
        explain: '<code>Command="{Binding UndoCommand}"</code> 로 묶으면 <code>CanExecute</code> 가 <code>false</code> 인 동안 버튼이 저절로 회색이 됩니다. 코드 비하인드에서는 <code>UndoButton.IsEnabled = …</code> 를 <b>상태가 바뀌는 모든 곳에서</b> 챙겨야 합니다.' },
      { q: '1920×1440 이미지의 GaussianBlur 가 960ms 라면, 1/4 로 축소한 480×360 은 대략?', options: ['약 480ms', '약 240ms', '약 60ms', '약 960ms (크기와 무관)'], answer: 2,
        explain: '픽셀 수가 1/16 이므로 시간도 대략 1/16 → 60ms 정도입니다. 이것이 축소 미리보기가 “즉시”로 느껴지는 이유입니다 (사람은 50ms 이하를 즉시로 느낍니다).' },
      { q: '배포한 PC 에서 <code>DllNotFoundException</code> 이 났다. 가장 먼저 확인할 것은?', options: ['.NET SDK 설치', '<code>OpenCvSharpExtern.dll</code>(runtime.win 패키지) 가 출력 폴더에 있는지 · x64 빌드인지', '이미지 파일 경로', '관리자 권한'], answer: 1,
        explain: 'OpenCvSharp 은 C# 래퍼(<code>OpenCvSharp.dll</code>)와 네이티브(<code>OpenCvSharpExtern.dll</code>) 두 개가 모두 필요합니다. <code>OpenCvSharp4.runtime.win</code> 패키지를 참조하고 <b>x64</b> 로 빌드하세요.' },
      { q: '<code>catch (Exception)</code> 로 모든 예외를 잡는 것이 위험한 이유는?', options: ['성능이 떨어져서', '진짜 버그(<code>NullReferenceException</code> 등)까지 숨겨 원인을 찾을 수 없게 되어서', 'Mat 이 해제되지 않아서', 'WPF 가 허용하지 않아서'], answer: 1,
        explain: '예상한 예외만 구체적으로 잡으세요(<code>OpenCVException</code> · <code>IOException</code> · <code>InvalidDataException</code>). 나머지는 그대로 터지게 두고 로그에 스택 추적을 남겨야 고칠 수 있습니다.' }
    ],
    slides: [
      { layout: 'title', title: '마무리', subtitle: '3교시 — MVVM 맛보기 · 성능 · 안정성 · 배포', notes: '<p>앱이 “동작하는 것”과 “쓸 수 있는 것” 사이의 차이를 다루는 시간입니다. 💬 “우리 앱을 친구 PC 에 복사해서 실행하면 될까요?” 로 시작하면 배포 이야기까지 자연스럽게 이어집니다. (2분)</p>' },
      { layout: 'two', title: '코드 비하인드 vs MVVM', left: { title: '코드 비하인드 (이 앱)', bullets: ['<code>P1Slider.Value</code> 직접 읽기', '<code>ResultImage.Source = …</code> 직접 대입', '<code>Click="ApplyButton_Click"</code>', '작고 빠르다 · 읽기 쉽다', '창 없이는 테스트 불가'] }, right: { title: 'MVVM', bullets: ['<code>{Binding P1}</code>', '<code>PropertyChanged</code> 알림', '<code>Command="{Binding ApplyCommand}"</code>', '버튼 활성화 자동', 'ViewModel 단위 테스트 가능'] }, notes: '<p>“어느 쪽이 옳은가” 가 아니라 “규모에 맞게” 라는 태도를 강조합니다. 화면 1~2개면 코드 비하인드가 충분합니다. 다만 <b>Model 분리</b>는 규모와 무관하게 항상 하라고 말해 주세요. (4분)</p>' },
      { layout: 'diagram', title: 'MVVM 세 부품', html: FIG_MVVM, caption: 'View ↔ (Binding · Command) ↔ ViewModel ↔ Model(FilterPipeline · HistoryManager)', notes: '<p>오른쪽 Model 상자가 <b>우리가 이미 만든 것</b>이라는 점을 강조합니다 — MVVM 으로 옮겨도 <code>FilterPipeline</code> 은 한 줄도 바뀌지 않습니다. 좋은 설계의 보상. (4분)</p>' },
      { layout: 'code', title: 'ViewModel 원리: 알림 + 명령', code: `class ObservableObject
{
    public event Action<string> PropertyChanged;
    protected void OnChanged(string name) { PropertyChanged?.Invoke(name); }
}

class RelayCommand
{
    readonly Action _execute;
    readonly Func<bool> _canExecute;
    public RelayCommand(Action execute, Func<bool> canExecute)
    {
        _execute = execute; _canExecute = canExecute;
    }
    public bool CanExecute() { return _canExecute == null || _canExecute(); }
    public void Execute() { if (CanExecute()) _execute(); }
}`, run: false, points: ['<code>event</code> + <code>?.Invoke</code>: 구독자가 없으면 아무 일도 안 함', '<code>Action</code> = 실행할 일, <code>Func&lt;bool&gt;</code> = 실행 가능 여부', '실제 WPF 는 <code>INotifyPropertyChanged</code> · <code>ICommand</code> 인터페이스'], notes: '<p>대리자(delegate)를 “나중에 부를 함수를 변수에 담아 둔 것” 으로 설명합니다. 💬 “<code>?.Invoke</code> 의 <code>?</code> 가 없으면?” — 구독자가 없을 때 <code>NullReferenceException</code>. 학생들은 브라우저 예제 1 을 실행해 알림 순서를 봅니다. (6분)</p>' },
      { layout: 'code', title: '실행: 알림이 곧 화면 갱신', code: `var vm = new StudioViewModel(Cv2.ImRead("images/sample_color.png", ImreadModes.Color));
vm.PropertyChanged += name => Console.WriteLine($"  [알림] {name} 바뀜");

vm.Kind = FilterKind.Gray;                 // -> [알림] Kind, [알림] Status
Console.WriteLine(vm.UndoCommand.CanExecute());   // False -> 버튼 회색

vm.ApplyCommand.Execute();                 // [적용] 버튼 클릭과 같다
Console.WriteLine(vm.UndoCommand.CanExecute());   // True  -> 버튼 활성

vm.P1 = 21;
vm.Kind = FilterKind.GaussianBlur;
vm.ApplyCommand.Execute();
vm.UndoCommand.Execute();                  // [되돌리기]
Console.WriteLine($"채널 {vm.Current.Channels()}");`, run: false, points: ['속성 대입 → 알림 → (WPF 라면) 화면 갱신', '<code>CanExecute</code> False/True → 버튼 회색/활성', '<b>창 없이</b> UI 로직을 테스트할 수 있다'], notes: '<p>“창 없이 테스트” 가 MVVM 의 가장 큰 실무 이점입니다. 이 콘솔 예제 자체가 ViewModel 단위 테스트라고 말해 주면 감이 옵니다. (4분)</p>' },
      { layout: 'code', title: 'MVVM 방식 XAML (Binding · Command)', lang: 'xml', file: 'MainWindow.xaml', run: false, code: `<Window.DataContext>
    <local:MainViewModel />
</Window.DataContext>

<ListBox ItemsSource="{Binding Filters}"
         SelectedItem="{Binding SelectedFilter, Mode=TwoWay}" />

<TextBlock Text="{Binding SelectedFilter.P1.Label}" />
<Slider Minimum="{Binding SelectedFilter.P1.Min}"
        Maximum="{Binding SelectedFilter.P1.Max}"
        Value="{Binding P1, Mode=TwoWay}"
        IsEnabled="{Binding SelectedFilter.P1.Enabled}" />

<Button Content="적용"     Command="{Binding ApplyCommand}" />
<Button Content="되돌리기" Command="{Binding UndoCommand}" />

<Image Source="{Binding ResultSource}" Stretch="Uniform" />`, points: ['<code>x:Name</code> · <code>Click</code> 이 거의 사라진다', '<code>Mode=TwoWay</code>: 화면 → ViewModel 방향도 허용', '<code>{Binding A.B.C}</code> 로 점을 따라 파고들 수 있다'], notes: '<p>실제로 Visual Studio 에서 Binding 오류는 <b>출력 창</b>에 조용히 찍힙니다(앱은 죽지 않음) — 디버깅 팁으로 알려 주세요. <code>PresentationTraceSources.TraceLevel=High</code>. (4분)</p>' },
      { layout: 'code', title: '성능: 재고 나서 고친다', code: `using var big = new Mat();
Cv2.Resize(src, big, new Size(1920, 1440), 0, 0, InterpolationFlags.Cubic);

var sw = Stopwatch.StartNew();
using var full = new Mat();
Cv2.GaussianBlur(big, full, new Size(21, 21), 0);
double tFull = sw.Elapsed.TotalMilliseconds;

using var preview = new Mat();
Cv2.Resize(big, preview, new Size(), 0.25, 0.25, InterpolationFlags.Area);
sw.Restart();
using var fast = new Mat();
Cv2.GaussianBlur(preview, fast, new Size(21, 21), 0);
double tPreview = sw.Elapsed.TotalMilliseconds;

Console.WriteLine($"원본 {tFull:F1} ms / 미리보기 {tPreview:F1} ms");
Console.WriteLine($"약 {tFull / tPreview:F0} 배 빠름 (픽셀 수 1/16)");`, run: false, points: ['<code>Stopwatch.StartNew()</code> · <code>Restart()</code>', '시간은 실행마다 다르다 → <b>비율</b>을 본다', 'Release 빌드에서 측정할 것'], notes: '<p>학생마다 다른 숫자가 나오는 것이 정상입니다. 💬 “왜 1/4 축소인데 시간이 1/16 이 될까?” — 넓이(픽셀 수)는 배율의 제곱. (4분)</p>' },
      { layout: 'bullets', title: '성능을 올리는 순서', lead: '위에서부터 시도 — 아래로 갈수록 복잡해진다', bullets: [
        '<b>① 축소 미리보기</b> (10~30배, 가장 쉽다)',
        '<b>② 중복 변환 제거</b> — ToGray 한 번만 만들어 재사용',
        '<b>③ ROI</b> — 화면에 보이는 영역만 처리',
        '<b>④ 커널 전략</b> — 큰 커널 1번 대신 작은 커널 2번',
        '<b>⑤ Release 빌드 · 최신 OpenCV</b>',
        '<b>⑥ 스레드(Task.Run + Dispatcher)</b> — 마지막 수단, 취소 · 순서 문제 발생'
      ], notes: '<p>“측정 없이 최적화하지 말 것” 을 반복합니다. ⑥번을 먼저 하려는 학생이 꼭 있는데, 스레드는 버그를 만들기 쉽고 이 앱에서는 ①만으로 충분하다고 말해 주세요. (3분)</p>' },
      { layout: 'code', title: '안정성: 죽지 않는 래퍼', code: `static Mat SafeApply(Mat src, string kind, double p1, out string message)
{
    try
    {
        var dst = new Mat();
        if (kind == "MedianBlur") Cv2.MedianBlur(src, dst, (int)p1);
        else if (kind == "Otsu")
            Cv2.Threshold(src, dst, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        else src.CopyTo(dst);
        message = "성공";
        return dst;
    }
    catch (OpenCVException)
    {
        message = "OpenCV 오류 -> 원본을 그대로 보여 줍니다";
        return src.Clone();      // 실패해도 화면에 보일 Mat 은 돌려준다
    }
}`, run: false, points: ['실패해도 <b>null 이 아닌</b> Mat 을 돌려준다 → 화면 코드가 단순', '구체적인 예외만 잡는다 (<code>catch (Exception)</code> 금지)', '실무에서는 여기에 로그를 남긴다'], notes: '<p>“화면 코드에 null 검사가 퍼지는 것” 이 왜 나쁜지 이야기합니다. 💬 “<code>catch (Exception)</code> 로 다 잡으면 편한데 왜 안 되나?” — <code>NullReferenceException</code> 같은 진짜 버그가 숨는다. (4분)</p>' },
      { layout: 'code', title: '배포: dotnet publish', lang: 'sh', run: false, code: `# Release 빌드
dotnet build Ch16_ImageStudio.csproj -c Release

# 배포 폴더 만들기 (.NET 런타임은 대상 PC 에 설치되어 있어야 함)
dotnet publish Ch16_ImageStudio.csproj -c Release -r win-x64 --self-contained false -o publish

# 런타임까지 포함 (약 150MB, 설치 없이 실행)
dotnet publish Ch16_ImageStudio.csproj -c Release -r win-x64 --self-contained true -o publish-standalone

# publish 폴더에 반드시 있어야 하는 것
#   Ch16_ImageStudio.exe
#   OpenCvSharp.dll  +  OpenCvSharpExtern.dll  (네이티브!)
#   runtimes/win-x64/native/...
#   images/`, points: ['<code>OpenCvSharpExtern.dll</code> 없으면 <code>DllNotFoundException</code>', '<b>x64</b> 로 빌드 (AnyCPU + 32비트 선호 금지)', '<code>--self-contained true</code> 면 런타임 설치 불필요'], notes: '<p>가능하면 실제로 publish 를 돌려 폴더를 열어 보여 주세요. 학생 USB 에 복사해 다른 PC 에서 실행해 보는 것이 가장 기억에 남습니다. 회사 PC 에서 백신이 exe 를 막는 경우도 언급. (4분)</p>' },
      { layout: 'table', title: '완성 프로젝트 파일 구성', head: ['파일', '역할'], rows: [
        ['<code>MainWindow.xaml</code>', '화면 (Grid · DockPanel · ListBox · Slider · Image · StatusBar)'],
        ['<code>MainWindow.xaml.cs</code>', '이벤트 · 축소 미리보기 · 표시 · 저장 · 예외'],
        ['<code>FilterPipeline.cs</code>', 'FilterKind · ParamInfo/FilterInfo · <code>Mat Apply(...)</code>'],
        ['<code>HistoryManager.cs</code>', '<code>Stack&lt;Mat&gt;</code> 2개 · IDisposable'],
        ['<code>ImageFile.cs</code>', '한글 경로 안전 읽기/쓰기'],
        ['<code>App.xaml</code> · <code>.csproj</code>', '스타일 · NuGet 3개 · 이미지 복사']
      ], notes: '<p>파일 5개로 앱 하나가 된다는 것을 보여 주며 “역할이 하나씩” 이라는 점을 강조합니다. 💬 “필터를 추가하려면 어느 파일을 고치나?” — FilterPipeline.cs 만. (3분)</p>' },
      { layout: 'quiz', title: '확인 퀴즈', q: '1920×1440 GaussianBlur 가 960ms 라면 480×360 은 대략?', options: ['약 480ms', '약 240ms', '약 60ms', '크기와 무관'], answer: 2, explain: '픽셀 수가 1/16 → 시간도 대략 1/16 → 60ms. 사람은 50ms 이하를 “즉시” 로 느낍니다.', notes: '<p>정답 3번. 넓이가 배율의 제곱으로 줄어든다는 것을 한 번 더 확인시킵니다. (2분)</p>' },
      { layout: 'summary', title: '16차시 정리', bullets: [
        '요구 사항 → 컨트롤 → 레이아웃(Grid · DockPanel) → <b>처리 클래스 분리</b>',
        '<code>FilterPipeline.Apply</code>: 입력 불변 · 결과는 새 Mat · 커널 홀수 보정',
        '축소 미리보기로 <b>즉시 반응</b>, [적용] · [저장]은 원본 해상도',
        '<code>Stack&lt;Mat&gt;</code> 2개로 되돌리기/다시 실행 — 버릴 때만 Dispose',
        'MVVM 은 규모에 따라 · 성능은 재고 고치기 · 예외는 구체적으로 · 배포는 네이티브 DLL 확인',
        '다음 차시: 같은 구조로 <b>실전 검사 앱</b> (개수 세기 · 색 분류 · 결함 검사)'
      ], notes: '<p>“이 앱의 구조가 17차시 검사 앱과 똑같다” 는 예고로 마무리합니다: 처리 클래스(<code>IInspector</code>) 분리 · 결과 오버레이 · 판정 표 · 저장. 숙제: 필터 1개를 스스로 추가해 보기(Rotate 또는 Brightness). (3분)</p>' }
    ]
  };

  CS_COURSE.addChapter({
    id: 'cs16', no: '16', title: 'WPF 이미지 처리 스튜디오 만들기', subtitle: '필터 · 슬라이더 · 미리보기 · 되돌리기 · 저장이 되는 작은 이미지 편집 앱',
    summary: '지금까지 배운 필터를 모아 <b>WPF 이미지 처리 스튜디오</b>를 만듭니다. 처리 로직을 <code>FilterPipeline</code> · <code>HistoryManager</code> 로 분리해 WPF 와 콘솔이 같은 코드를 쓰게 하고, 슬라이더 즉시 미리보기 · 되돌리기/다시 실행 · 저장 · 예외 처리 · MVVM 맛보기 · 배포까지 다룹니다.',
    goals: ['요구 사항을 WPF 컨트롤과 레이아웃(Grid · DockPanel)으로 설계할 수 있다', '처리 로직을 WPF 와 분리한 클래스로 만들고 콘솔 · WPF 양쪽에서 쓸 수 있다', 'Stack&lt;Mat&gt; 으로 되돌리기/다시 실행을 구현하고 Mat 을 안전하게 해제할 수 있다', '축소 미리보기 · 예외 처리 · 상태 표시줄로 반응 빠르고 안정된 앱을 만들 수 있다'],
    wpf: 'Ch16_ImageStudio',
    sections: [SEC1, SEC2, SEC3]
  });
})();
