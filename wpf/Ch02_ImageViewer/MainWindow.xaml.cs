using System.IO;
using System.Windows;
using System.Windows.Input;
using Microsoft.Win32;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;
using Window = System.Windows.Window;

namespace Ch02_ImageViewer;

/// <summary>
/// 02차시 이미지 뷰어: 열기(대화상자 · 드래그앤드롭) · 확대/축소 · 마우스 위치의 픽셀 값 · 흑백/Canny 미리보기 · 저장
/// </summary>
public partial class MainWindow : Window
{
    private Mat? _original;   // 파일에서 읽은 원본 (BGR 3채널)
    private Mat? _display;    // 화면에 보이는 Mat (원본 복사 · 흑백 · Canny 중 하나). 새 것이 오면 이전 것 Dispose
    private string _fileName = "";

    public MainWindow()
    {
        InitializeComponent();
    }

    // ───────────── 파일 열기 (대화상자 · 드래그앤드롭) ─────────────

    private void OpenButton_Click(object sender, RoutedEventArgs e)
    {
        var dlg = new OpenFileDialog { Title = "이미지 열기", Filter = ImageFile.OpenFilter };
        if (Directory.Exists(ImageFile.ImagesDir))
            dlg.InitialDirectory = ImageFile.ImagesDir;
        if (dlg.ShowDialog(this) == true)
            OpenFile(dlg.FileName);
    }

    // 파일을 창 위로 끌어올 때: 파일이면 '복사' 커서를 보여 준다
    private void Window_DragOver(object sender, DragEventArgs e)
    {
        e.Effects = e.Data.GetDataPresent(DataFormats.FileDrop) ? DragDropEffects.Copy : DragDropEffects.None;
        e.Handled = true;
    }

    // 파일을 놓았을 때: 첫 번째 파일을 연다
    private void Window_Drop(object sender, DragEventArgs e)
    {
        if (!e.Data.GetDataPresent(DataFormats.FileDrop))
            return;
        if (e.Data.GetData(DataFormats.FileDrop) is string[] files && files.Length > 0)
            OpenFile(files[0]);
    }

    private void OpenFile(string path)
    {
        try
        {
            Mat loaded = ImageFile.Load(path);
            _original?.Dispose();
            _original = loaded;
            _fileName = Path.GetFileName(path);
            Title = $"02차시 이미지 뷰어 - {_fileName}";
            SetDisplay(_original.Clone(), "원본");
            ZoomSlider.Value = 1;
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "열기 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    // ───────────── 미리보기 버튼 ─────────────

    private void GrayButton_Click(object sender, RoutedEventArgs e)
    {
        if (!CheckLoaded()) return;
        try
        {
            var gray = new Mat();
            Cv2.CvtColor(_original!, gray, ColorConversionCodes.BGR2GRAY);
            SetDisplay(gray, "흑백");
        }
        catch (OpenCVException ex) { ShowCvError(ex); }
    }

    private void CannyButton_Click(object sender, RoutedEventArgs e)
    {
        if (!CheckLoaded()) return;
        try
        {
            using var gray = new Mat();
            Cv2.CvtColor(_original!, gray, ColorConversionCodes.BGR2GRAY);
            var edges = new Mat();
            Cv2.Canny(gray, edges, 80, 160);      // 낮은/높은 임계값 (10차시에서 자세히)
            SetDisplay(edges, "Canny 80/160");
        }
        catch (OpenCVException ex) { ShowCvError(ex); }
    }

    private void OriginalButton_Click(object sender, RoutedEventArgs e)
    {
        if (!CheckLoaded()) return;
        SetDisplay(_original!.Clone(), "원본");
    }

    private void SaveButton_Click(object sender, RoutedEventArgs e)
    {
        if (_display == null) { MessageBox.Show(this, "저장할 이미지가 없습니다.", "안내"); return; }

        var dlg = new SaveFileDialog { Title = "이미지 저장", Filter = ImageFile.SaveFilter, FileName = "result.png" };
        if (dlg.ShowDialog(this) != true) return;
        try
        {
            ImageFile.Save(dlg.FileName, _display);
            InfoText.Text = $"저장했습니다: {dlg.FileName}";
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "저장 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    // ───────────── 확대 / 축소 ─────────────

    private void ZoomSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        if (ZoomTransform == null) return;   // XAML 초기화 도중 호출될 수 있음
        ZoomTransform.ScaleX = e.NewValue;
        ZoomTransform.ScaleY = e.NewValue;
        ZoomText.Text = $"{e.NewValue * 100:F0}%";
    }

    private void ZoomResetButton_Click(object sender, RoutedEventArgs e) => ZoomSlider.Value = 1;

    // 이미지 전체가 보이도록 배율 계산
    private void ZoomFitButton_Click(object sender, RoutedEventArgs e)
    {
        if (_display == null) return;
        double sx = (Scroller.ViewportWidth - 4) / _display.Width;
        double sy = (Scroller.ViewportHeight - 4) / _display.Height;
        ZoomSlider.Value = Math.Clamp(Math.Min(sx, sy), ZoomSlider.Minimum, ZoomSlider.Maximum);
    }

    // 마우스 휠 → 배율 10% 씩 (ScrollViewer 의 기본 스크롤은 막음)
    private void Scroller_PreviewMouseWheel(object sender, MouseWheelEventArgs e)
    {
        double factor = e.Delta > 0 ? 1.1 : 1 / 1.1;
        ZoomSlider.Value = Math.Clamp(ZoomSlider.Value * factor, ZoomSlider.Minimum, ZoomSlider.Maximum);
        e.Handled = true;
    }

    // ───────────── 마우스 위치의 픽셀 값 ─────────────

    private void MainImage_MouseMove(object sender, MouseEventArgs e)
    {
        if (_display == null) return;

        // Stretch="None" + LayoutTransform 이므로 GetPosition(MainImage) 이 곧 이미지 픽셀 좌표
        var pos = e.GetPosition(MainImage);
        int x = (int)pos.X;
        int y = (int)pos.Y;
        if (x < 0 || y < 0 || x >= _display.Width || y >= _display.Height)
        {
            PixelText.Text = "(x, y) = -";
            return;
        }

        // Mat.At<T>(행 y, 열 x) — (행, 열) 순서에 주의!
        if (_display.Channels() == 3)
        {
            Vec3b px = _display.At<Vec3b>(y, x);
            PixelText.Text = $"(x={x,4}, y={y,4})  B={px.Item0,3} G={px.Item1,3} R={px.Item2,3}";
        }
        else
        {
            byte v = _display.At<byte>(y, x);
            PixelText.Text = $"(x={x,4}, y={y,4})  밝기={v,3}";
        }
    }

    private void MainImage_MouseLeave(object sender, MouseEventArgs e) => PixelText.Text = "(x, y) = -";

    // ───────────── 공통 ─────────────

    /// <summary>화면에 보일 Mat 을 교체합니다. 이전 표시용 Mat 은 Dispose.</summary>
    private void SetDisplay(Mat mat, string name)
    {
        _display?.Dispose();
        _display = mat;
        MainImage.Source = _display.ToBitmapSource();
        InfoText.Text = $"{_fileName}  |  {name}  |  {_display.Width} x {_display.Height}  |  채널 {_display.Channels()}  |  {_display.Type()}";
    }

    private bool CheckLoaded()
    {
        if (_original != null) return true;
        MessageBox.Show(this, "먼저 이미지를 열어 주세요.", "안내");
        return false;
    }

    private void ShowCvError(OpenCVException ex)
        => MessageBox.Show(this, ex.Message, "OpenCV 오류", MessageBoxButton.OK, MessageBoxImage.Error);

    protected override void OnClosed(EventArgs e)
    {
        _display?.Dispose();
        _original?.Dispose();
        base.OnClosed(e);
    }
}
