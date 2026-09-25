using System.Diagnostics;
using System.IO;
using System.Windows;
using Microsoft.Win32;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;
// OpenCvSharp 에도 Window · Size 가 있어 이름이 겹치므로 어느 쪽을 쓸지 정해 둡니다.
using Window = System.Windows.Window;
using Size = OpenCvSharp.Size;

namespace OpenCvWpfStarter;

/// <summary>
/// 가장 단순한 OpenCV + WPF 창.
/// 규칙: 원본(_original)은 그대로 보관하고, 처리 결과는 항상 새 Mat(_result)에 만들며
///       새 결과가 생기면 이전 결과를 Dispose 합니다.
/// </summary>
public partial class MainWindow : Window
{
    private Mat? _original;   // 파일에서 읽은 원본 이미지 (다른 이미지를 열 때까지 보관)
    private Mat? _result;     // 화면에 보이는 현재 결과 (새 결과가 나오면 이전 것은 Dispose)

    public MainWindow()
    {
        InitializeComponent();
    }

    // ───────────── 열기 / 저장 ─────────────

    private void OpenButton_Click(object sender, RoutedEventArgs e)
    {
        var dlg = new OpenFileDialog { Title = "이미지 열기", Filter = ImageFile.OpenFilter };
        if (Directory.Exists(ImageFile.ImagesDir))
            dlg.InitialDirectory = ImageFile.ImagesDir;   // 예제 이미지 폴더부터 열기
        if (dlg.ShowDialog(this) != true)
            return;

        try
        {
            Mat loaded = ImageFile.Load(dlg.FileName);   // 항상 3채널(BGR) 로 읽음
            _original?.Dispose();                        // 이전 원본 해제
            _original = loaded;
            ShowResult(_original.Clone(), "원본", 0);
            Title = $"OpenCV WPF 시작 템플릿 - {Path.GetFileName(dlg.FileName)}";
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "열기 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void SaveButton_Click(object sender, RoutedEventArgs e)
    {
        if (_result == null)
        {
            MessageBox.Show(this, "저장할 이미지가 없습니다. 먼저 이미지를 열어 주세요.", "안내");
            return;
        }

        var dlg = new SaveFileDialog { Title = "이미지 저장", Filter = ImageFile.SaveFilter, FileName = "result.png" };
        if (dlg.ShowDialog(this) != true)
            return;

        try
        {
            ImageFile.Save(dlg.FileName, _result);
            StatusText.Text = $"저장했습니다: {dlg.FileName}";
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "저장 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    // ───────────── 처리 버튼 ─────────────

    private void GrayButton_Click(object sender, RoutedEventArgs e)
    {
        RunFilter("흑백", src =>
        {
            var dst = new Mat();
            Cv2.CvtColor(src, dst, ColorConversionCodes.BGR2GRAY);   // 3채널 → 1채널
            return dst;
        });
    }

    private void BlurButton_Click(object sender, RoutedEventArgs e)
    {
        RunFilter("가우시안 블러 15x15", src =>
        {
            var dst = new Mat();
            Cv2.GaussianBlur(src, dst, new Size(15, 15), 0);   // 커널은 홀수 크기
            return dst;
        });
    }

    private void OriginalButton_Click(object sender, RoutedEventArgs e)
    {
        RunFilter("원본", src => src.Clone());
    }

    /// <summary>
    /// 원본에 filter 를 적용해 새 결과를 만들고 화면에 보입니다.
    /// OpenCV 가 던지는 OpenCVException(채널 수 · 크기 불일치 등)을 잡아 메시지로 보여 줍니다.
    /// </summary>
    private void RunFilter(string name, Func<Mat, Mat> filter)
    {
        if (_original == null)
        {
            MessageBox.Show(this, "먼저 [열기] 로 이미지를 불러오세요.", "안내");
            return;
        }

        var sw = Stopwatch.StartNew();
        try
        {
            Mat dst = filter(_original);
            sw.Stop();
            ShowResult(dst, name, sw.Elapsed.TotalMilliseconds);
        }
        catch (OpenCVException ex)
        {
            MessageBox.Show(this, ex.Message, "OpenCV 오류", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    /// <summary>결과 Mat 을 넘겨받아 보관하고(이전 결과 Dispose) Image 컨트롤과 상태 표시줄을 갱신합니다.</summary>
    private void ShowResult(Mat result, string name, double elapsedMs)
    {
        _result?.Dispose();
        _result = result;

        MainImage.Source = _result.ToBitmapSource();   // Mat → WPF BitmapSource
        StatusText.Text = $"{name}  |  {_result.Width} x {_result.Height}  |  채널 {_result.Channels()}  |  {elapsedMs:F1} ms";
    }

    // ───────────── 정리 ─────────────

    protected override void OnClosed(EventArgs e)
    {
        _result?.Dispose();
        _original?.Dispose();
        base.OnClosed(e);
    }
}
