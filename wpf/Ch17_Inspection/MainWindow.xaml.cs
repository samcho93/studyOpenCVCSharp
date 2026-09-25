using System.Diagnostics;
using System.IO;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using Ch17_Inspection.Inspectors;
using Microsoft.Win32;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;
using Window = System.Windows.Window;

namespace Ch17_Inspection;

/// <summary>
/// 17차시 실전 검사 프로젝트 — 개수 세기 · 색 분류 · 결함 검사를 한 앱에서 돌려 보고
/// 판정(OK / NG) · 결과 표 · 통계를 보여 줍니다.
///
/// Mat 소유 관계
///   _image  : 검사할 원본 (다른 이미지를 열 때까지 보관)
///   _golden : 결함 검사용 기준(골든) 이미지
///   _result : 검사 결과(오버레이 Mat 포함). 새 검사를 하면 이전 결과를 Dispose
///
/// 검사 로직은 모두 Inspectors/ 폴더의 IInspector 구현 클래스에 있고, 이 창은 화면 담당입니다.
/// </summary>
public partial class MainWindow : Window
{
    // 검사기 3개. 파라미터를 바꾸기 위해 구체 타입으로도 들고 있습니다.
    private readonly CountInspector _count = new();
    private readonly ColorSortInspector _colorSort = new();
    private readonly DefectInspector _defect = new();
    private readonly IInspector[] _inspectors;

    private Mat? _image;
    private Mat? _golden;
    private InspectionResult? _result;

    private string _fileName = "";
    private string _goldenName = "";
    private int _runCount, _okCount, _ngCount;
    private bool _updatingUi;   // 슬라이더 범위를 코드로 바꾸는 동안 ValueChanged 무시

    public MainWindow()
    {
        InitializeComponent();

        _inspectors = new IInspector[] { _count, _colorSort, _defect };
        InspectorCombo.DisplayMemberPath = nameof(IInspector.Name);   // ComboBox 에는 Name 을 보여 줌
        InspectorCombo.ItemsSource = _inspectors;
        InspectorCombo.SelectedIndex = 0;
    }

    /// <summary>지금 선택된 검사기</summary>
    private IInspector Current => (InspectorCombo.SelectedItem as IInspector) ?? _count;

    // ───────────── 파일 열기 ─────────────

    private void OpenImageButton_Click(object sender, RoutedEventArgs e)
    {
        string? path = AskOpenPath("검사 이미지 열기");
        if (path == null) return;

        try
        {
            Mat loaded = ImageFile.Load(path);
            _image?.Dispose();
            _image = loaded;
            _fileName = Path.GetFileName(path);
            SourceCaption.Text = $"검사 이미지 — {_fileName} ({_image.Width} x {_image.Height})";
            SourceImage.Source = _image.ToBitmapSource();
            Title = $"17차시 실전 검사 프로젝트 - {_fileName}";

            ClearResult();
            UpdateButtons();
            StatusText.Text = $"{_fileName} 를 열었습니다. [검사 실행] 을 누르세요.";
            if (InspectButton.IsEnabled)
                RunInspection();   // 준비가 끝났으면 바로 한 번 검사
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "열기 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void OpenGoldenButton_Click(object sender, RoutedEventArgs e)
    {
        string? path = AskOpenPath("골든(기준) 이미지 열기");
        if (path == null) return;

        try
        {
            Mat loaded = ImageFile.Load(path);
            _golden?.Dispose();
            _golden = loaded;
            _goldenName = Path.GetFileName(path);
            GoldenText.Text = $"골든 이미지: {_goldenName} ({_golden.Width} x {_golden.Height})";

            UpdateButtons();
            if (InspectButton.IsEnabled)
                RunInspection();
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "열기 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private string? AskOpenPath(string title)
    {
        var dlg = new OpenFileDialog { Title = title, Filter = ImageFile.OpenFilter };
        if (Directory.Exists(ImageFile.ImagesDir))
            dlg.InitialDirectory = ImageFile.ImagesDir;   // 예제 이미지 폴더부터 열기
        return dlg.ShowDialog(this) == true ? dlg.FileName : null;
    }

    // ───────────── 검사 실행 ─────────────

    private void InspectButton_Click(object sender, RoutedEventArgs e) => RunInspection();

    /// <summary>선택된 검사기로 한 번 검사하고 화면 · 표 · 통계를 갱신합니다.</summary>
    private void RunInspection()
    {
        if (_image == null)
        {
            MessageBox.Show(this, "먼저 [이미지 열기] 로 검사할 이미지를 불러오세요.", "안내");
            return;
        }

        Mat image = _image;   // 아래에서 계속 쓰므로 지역 변수로 받아 둡니다
        ApplyParamsToInspector();

        try
        {
            var sw = Stopwatch.StartNew();
            InspectionResult result = Current.Inspect(image, _golden);   // 결함 검사만 골든을 씁니다
            sw.Stop();

            _result?.Dispose();          // 이전 결과(오버레이 Mat) 해제
            _result = result;

            OverlayImage.Source = _result.Overlay.ToBitmapSource();
            ResultGrid.ItemsSource = _result.Items;
            ShowJudge(_result.IsOk, _result.Summary);

            _runCount++;
            if (_result.IsOk) _okCount++; else _ngCount++;
            StatsText.Text = $"검사 {_runCount} 회 · OK {_okCount} · NG {_ngCount}";
            StatusText.Text = $"{Current.Name}  |  {_fileName}  |  {sw.Elapsed.TotalMilliseconds:F1} ms";
        }
        catch (OpenCVException ex)
        {
            MessageBox.Show(this, ex.Message, "OpenCV 오류", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        catch (InvalidOperationException ex)
        {
            // 골든 이미지가 없거나 크기가 다른 경우 등 — 사용자가 고칠 수 있는 문제
            MessageBox.Show(this, ex.Message, "검사할 수 없습니다", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    /// <summary>툴바의 슬라이더 · 기대 개수 값을 선택된 검사기의 속성에 넣습니다.</summary>
    private void ApplyParamsToInspector()
    {
        int param = (int)Math.Round(ParamSlider.Value);
        int expected = int.TryParse(ExpectedCountBox.Text, out int n) && n >= 0 ? n : 0;

        switch (Current)
        {
            case CountInspector c:
                c.MinArea = param;
                c.ExpectedCount = expected;
                break;
            case ColorSortInspector s:
                s.MinArea = param;
                s.ExpectedTotal = expected;
                break;
            case DefectInspector d:
                d.DiffThreshold = param;
                break;
        }
    }

    // ───────────── 검사 선택 · 파라미터 UI ─────────────

    private void InspectorCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (ParamSlider == null) return;   // XAML 초기화 도중 호출될 수 있음

        switch (Current)
        {
            case CountInspector c:
                ConfigureParam("면적 하한(px²)", 0, 5000, c.MinArea, 10);
                break;
            case ColorSortInspector s:
                ConfigureParam("면적 하한(px²)", 0, 5000, s.MinArea, 10);
                break;
            case DefectInspector d:
                ConfigureParam("차영상 임계값", 5, 120, d.DiffThreshold, 1);
                break;
        }

        OpenGoldenButton.IsEnabled = Current.NeedsGolden;
        ExpectedCountBox.IsEnabled = Current is not DefectInspector;   // 결함 검사는 기대 개수를 쓰지 않음
        ClearResult();
        UpdateButtons();
    }

    private void ConfigureParam(string label, double min, double max, double value, double tick)
    {
        _updatingUi = true;
        try
        {
            ParamSlider.Minimum = min;
            ParamSlider.Maximum = max;
            ParamSlider.TickFrequency = tick;
            ParamSlider.Value = value;
            ParamLabel.Text = label;
            ParamValue.Text = $"{value:F0}";
        }
        finally
        {
            _updatingUi = false;
        }
    }

    private void ParamSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        if (_updatingUi || ParamValue == null) return;
        ParamValue.Text = $"{e.NewValue:F0}";
    }

    // ───────────── 저장 ─────────────

    private void SaveOverlayButton_Click(object sender, RoutedEventArgs e)
    {
        if (_result == null) { MessageBox.Show(this, "먼저 검사를 실행하세요.", "안내"); return; }

        var dlg = new SaveFileDialog { Title = "오버레이 저장", Filter = ImageFile.SaveFilter, FileName = "inspection.png" };
        if (dlg.ShowDialog(this) != true) return;

        try
        {
            ImageFile.Save(dlg.FileName, _result.Overlay);
            StatusText.Text = $"오버레이를 저장했습니다: {dlg.FileName}";
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "저장 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void SaveCsvButton_Click(object sender, RoutedEventArgs e)
    {
        if (_result == null) { MessageBox.Show(this, "먼저 검사를 실행하세요.", "안내"); return; }

        var dlg = new SaveFileDialog { Title = "결과 CSV 저장", Filter = "CSV 파일|*.csv", FileName = "inspection.csv" };
        if (dlg.ShowDialog(this) != true) return;

        try
        {
            var sb = new StringBuilder();
            sb.AppendLine("검사,이미지,골든,판정,요약");
            sb.AppendLine($"{Csv(Current.Name)},{Csv(_fileName)},{Csv(_goldenName)}," +
                          $"{(_result.IsOk ? "OK" : "NG")},{Csv(_result.Summary)}");
            sb.AppendLine();
            sb.AppendLine("항목,값,판정");
            foreach (InspectionItem item in _result.Items)
                sb.AppendLine($"{Csv(item.Item)},{Csv(item.Value)},{Csv(item.Judge)}");

            // Excel 이 한글을 바로 읽도록 BOM 이 있는 UTF-8 로 저장
            File.WriteAllText(dlg.FileName, sb.ToString(), new UTF8Encoding(true));
            StatusText.Text = $"결과를 저장했습니다: {dlg.FileName}";
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "저장 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    /// <summary>쉼표 · 따옴표가 있는 값을 CSV 규칙에 맞게 감쌉니다.</summary>
    private static string Csv(string value)
        => value.Contains(',') || value.Contains('"') ? $"\"{value.Replace("\"", "\"\"")}\"" : value;

    // ───────────── 화면 갱신 ─────────────

    private void ShowJudge(bool isOk, string summary)
    {
        JudgeText.Text = isOk ? "OK" : "NG";
        SummaryText.Text = summary;
        JudgeBorder.Background = new SolidColorBrush(isOk
            ? Color.FromRgb(0x2E, 0x7D, 0x32)    // 초록
            : Color.FromRgb(0xC6, 0x28, 0x28));  // 빨강
    }

    private void ClearResult()
    {
        _result?.Dispose();
        _result = null;
        OverlayImage.Source = null;
        ResultGrid.ItemsSource = null;
        JudgeText.Text = "판정 대기";
        SummaryText.Text = Current.NeedsGolden
            ? "검사 이미지와 골든 이미지를 열고 [검사 실행] 을 누르세요."
            : "이미지를 열고 [검사 실행] 을 누르세요.";
        JudgeBorder.Background = new SolidColorBrush(Color.FromRgb(0xBD, 0xBD, 0xBD));
    }

    private void UpdateButtons()
    {
        // 결함 검사는 골든 이미지가 있어야 실행할 수 있습니다.
        InspectButton.IsEnabled = _image != null && (!Current.NeedsGolden || _golden != null);
    }

    // ───────────── 정리 ─────────────

    protected override void OnClosed(EventArgs e)
    {
        _result?.Dispose();
        _golden?.Dispose();
        _image?.Dispose();
        base.OnClosed(e);
    }
}
