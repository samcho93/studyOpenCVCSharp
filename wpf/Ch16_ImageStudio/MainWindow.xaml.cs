using System.Diagnostics;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Win32;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;
using Window = System.Windows.Window;
using Size = OpenCvSharp.Size;

namespace Ch16_ImageStudio;

/// <summary>
/// 16차시 이미지 처리 스튜디오.
///
/// Mat 소유 관계
///   _history.Current : 작업 이미지(원본 해상도). [적용] 을 누를 때만 바뀐다 → HistoryManager 가 관리
///   _preview         : Current 를 1280px 이하로 축소한 미리보기 입력 (슬라이더를 움직일 때 빠르게 재처리)
///   _result          : _preview 에 필터를 적용한 결과 (화면 오른쪽). 새 결과가 나오면 이전 것 Dispose
/// </summary>
public partial class MainWindow : Window
{
    private const int PreviewMaxSize = 1280;

    private readonly HistoryManager _history = new();
    private Mat? _preview;
    private Mat? _result;
    private double _previewScale = 1.0;
    private bool _updatingUi;        // 슬라이더 범위를 코드로 바꾸는 동안 ValueChanged 무시
    private string _fileName = "";

    public MainWindow()
    {
        InitializeComponent();
        FilterList.ItemsSource = FilterPipeline.Filters;   // FilterInfo.ToString() 이 표시 이름
        FilterList.SelectedIndex = 0;
        UpdateButtons();
    }

    // 현재 선택된 필터와 파라미터
    private FilterInfo SelectedFilter => (FilterList.SelectedItem as FilterInfo) ?? FilterPipeline.Filters[0];
    private double P1 => P1Slider.Value;
    private double P2 => P2Slider.Value;

    // ───────────── 파일 ─────────────

    private void OpenButton_Click(object sender, RoutedEventArgs e)
    {
        var dlg = new OpenFileDialog { Title = "이미지 열기", Filter = ImageFile.OpenFilter };
        if (Directory.Exists(ImageFile.ImagesDir))
            dlg.InitialDirectory = ImageFile.ImagesDir;
        if (dlg.ShowDialog(this) != true) return;

        try
        {
            Mat loaded = ImageFile.Load(dlg.FileName);
            _history.Reset(loaded);            // 소유권은 HistoryManager 로
            _fileName = Path.GetFileName(dlg.FileName);
            Title = $"16차시 이미지 처리 스튜디오 - {_fileName}";
            SelectFilter(FilterKind.None);
            AfterCurrentChanged();
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "열기 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

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

    // ───────────── 기록 (적용 · Undo · Redo · 초기화) ─────────────

    private void ApplyButton_Click(object sender, RoutedEventArgs e)
    {
        if (_history.Current == null) return;
        if (SelectedFilter.Kind == FilterKind.None) return;

        try
        {
            var sw = Stopwatch.StartNew();
            Mat full = FilterPipeline.Apply(_history.Current, SelectedFilter.Kind, P1, P2);   // 원본 해상도로 처리
            sw.Stop();
            _history.Push(full);
            SelectFilter(FilterKind.None);   // 적용 뒤에는 미리보기를 원본 상태로
            AfterCurrentChanged();
            StatusText.Text = $"적용: {SelectedFilterNameForStatus(full)}  |  {sw.Elapsed.TotalMilliseconds:F1} ms";
        }
        catch (OpenCVException ex)
        {
            MessageBox.Show(this, ex.Message, "OpenCV 오류", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void UndoButton_Click(object sender, RoutedEventArgs e)
    {
        _history.Undo();
        AfterCurrentChanged();
    }

    private void RedoButton_Click(object sender, RoutedEventArgs e)
    {
        _history.Redo();
        AfterCurrentChanged();
    }

    private void ResetButton_Click(object sender, RoutedEventArgs e)
    {
        _history.RestoreOriginal();
        SelectFilter(FilterKind.None);
        AfterCurrentChanged();
    }

    // ───────────── 필터 선택 · 슬라이더 ─────────────

    private void FilterList_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (P1Slider == null || P2Slider == null) return;   // XAML 초기화 중
        ConfigureSlider(P1Slider, P1Label, P1Value, SelectedFilter.P1);
        ConfigureSlider(P2Slider, P2Label, P2Value, SelectedFilter.P2);
        ApplyPreview();
    }

    private void Param_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        if (_updatingUi || P1Value == null || P2Value == null) return;
        P1Value.Text = P1.ToString($"F{SelectedFilter.P1.Decimals}");
        P2Value.Text = P2.ToString($"F{SelectedFilter.P2.Decimals}");
        ApplyPreview();   // 슬라이더를 움직이면 즉시 재처리 (축소 미리보기라 빠름)
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

    private void SelectFilter(FilterKind kind)
    {
        FilterList.SelectedItem = FilterPipeline.GetInfo(kind);
    }

    // ───────────── 처리 · 표시 ─────────────

    /// <summary>Current 가 바뀐 뒤(열기 · 적용 · Undo · Redo · 초기화): 미리보기 입력을 다시 만들고 양쪽 화면 갱신.</summary>
    private void AfterCurrentChanged()
    {
        RebuildPreviewInput();
        OriginalImage.Source = _history.Current?.ToBitmapSource();
        ApplyPreview();
        UpdateButtons();
    }

    /// <summary>Current 가 크면 1280px 이하로 축소한 복사본을, 작으면 그대로 복사해 미리보기 입력으로 둡니다.</summary>
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

            _result?.Dispose();
            _result = result;
            ResultImage.Source = _result.ToBitmapSource();

            string scaleNote = _previewScale < 1 ? $"  |  미리보기 {_previewScale * 100:F0}% 축소 ({_preview.Width} x {_preview.Height})" : "";
            StatusText.Text = $"{_fileName}  |  작업 이미지 {_history.Current!.Width} x {_history.Current.Height}, 채널 {_history.Current.Channels()}" +
                              $"  |  {SelectedFilter.DisplayName}  p1={P1.ToString($"F{SelectedFilter.P1.Decimals}")}  p2={P2.ToString($"F{SelectedFilter.P2.Decimals}")}" +
                              $"  |  {sw.Elapsed.TotalMilliseconds:F1} ms{scaleNote}";
        }
        catch (OpenCVException ex)
        {
            StatusText.Text = $"OpenCV 오류: {ex.Message}";
        }
    }

    private void UpdateButtons()
    {
        bool loaded = _history.Current != null;
        ApplyButton.IsEnabled = loaded;
        UndoButton.IsEnabled = _history.CanUndo;
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
        _history.Dispose();
        base.OnClosed(e);
    }
}
