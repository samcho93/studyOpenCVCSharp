using System.ComponentModel;
using System.Diagnostics;
using System.Windows;
using System.Windows.Controls;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;
using Window = System.Windows.Window;

namespace Ch15_Camera;

/// <summary>
/// 15차시 카메라: VideoCapture 를 백그라운드 스레드에서 읽고, 화면 갱신만 UI 스레드(Dispatcher)로 넘깁니다.
///
/// 스레드 규칙
///  - WPF 컨트롤(Image.Source · TextBlock.Text)은 UI 스레드에서만 건드린다 → Dispatcher.Invoke
///  - 카메라 읽기(cap.Read) 는 시간이 걸리므로 UI 스레드에서 돌리면 창이 멈춘다 → Task.Run
///  - 멈출 때는 CancellationToken 으로 신호를 보내고 루프가 끝난 뒤 Release 한다
/// </summary>
public partial class MainWindow : Window
{
    private VideoCapture? _capture;
    private CancellationTokenSource? _cts;
    private Task? _loopTask;
    private int _mode;              // 0 원본 · 1 흑백 · 2 Canny · 3 MOG2 (백그라운드 스레드에서 읽음)
    private bool _closingConfirmed; // 카메라 정리가 끝나 실제로 닫아도 되는지

    public MainWindow()
    {
        InitializeComponent();
    }

    private bool IsRunning => _loopTask != null && !_loopTask.IsCompleted;

    // ───────────── 시작 / 정지 ─────────────

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
            MessageBox.Show(this,
                $"웹캠 {index} 번을 열 수 없습니다.\n\n" +
                "· 카메라가 연결되어 있는지, 다른 프로그램이 쓰고 있지 않은지 확인하세요.\n" +
                "· Windows 설정 → 개인 정보 → 카메라 에서 데스크톱 앱 접근이 허용되어 있어야 합니다.\n" +
                "· 카메라가 여러 개면 번호를 1, 2 로 바꿔 보세요.",
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

    private async void StopButton_Click(object sender, RoutedEventArgs e)
    {
        await StopCameraAsync();
        StatusText.Text = "정지했습니다.";
    }

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

    private void ModeCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        // 백그라운드 스레드가 읽는 값이므로 Volatile 로 써 준다 (int 쓰기는 원자적)
        Volatile.Write(ref _mode, ModeCombo.SelectedIndex);
    }

    // ───────────── 백그라운드 캡처 루프 ─────────────

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

                // 처리 옵션에 따라 화면에 보일 Mat 선택
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
        catch (OpenCVException ex)
        {
            Dispatcher.BeginInvoke(() =>
                MessageBox.Show(this, ex.Message, "OpenCV 오류", MessageBoxButton.OK, MessageBoxImage.Error));
        }
    }

    // ───────────── 창 닫기: 카메라를 먼저 정리 ─────────────

    private async void Window_Closing(object sender, CancelEventArgs e)
    {
        if (_closingConfirmed || !IsRunning)
            return;                    // 이미 정리됨 → 그대로 닫힘

        e.Cancel = true;               // 일단 닫기를 미루고
        await StopCameraAsync();       // 루프 종료 · Release 를 기다린 뒤
        _closingConfirmed = true;
        Close();                       // 다시 닫기
    }
}
