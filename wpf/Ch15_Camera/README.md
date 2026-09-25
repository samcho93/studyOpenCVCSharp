# Ch15_Camera — 15차시 카메라 (VideoCapture)

웹캠 영상을 `VideoCapture` 로 읽어 WPF `Image` 에 실시간 표시합니다.
카메라 읽기는 **백그라운드 스레드**(`Task.Run` 루프)에서, 화면 갱신은 **`Dispatcher.Invoke`** 로 UI 스레드에서 합니다.

- [시작] / [정지] 버튼, 카메라 번호 입력(0, 1, 2 …)
- 처리 옵션 ComboBox: 원본 · 흑백 · Canny 에지 · 배경 차분(MOG2)
- FPS 표시(1초마다 갱신), 정지 · 창 닫기 시 `Release()`
- 웹캠이 없으면 안내 MessageBox

## 실행 방법

1. Visual Studio 2022 에서 `Ch15_Camera.csproj` 를 열고 **F5**.
2. [시작] 을 누릅니다. 노트북 내장 카메라는 보통 0 번입니다.
3. Windows 설정 → 개인 정보 및 보안 → 카메라 → "데스크톱 앱이 카메라에 액세스하도록 허용" 이 켜져 있어야 합니다.

## NuGet 패키지

`OpenCvSharp4`, `OpenCvSharp4.runtime.win`, `OpenCvSharp4.WpfExtensions` (모두 4.10.0)

## 화면 설명

| 영역 | 내용 |
|---|---|
| 상단 ToolBar | 카메라 번호 · 시작 · 정지 · 처리 옵션 · FPS |
| 가운데 Image | 카메라 프레임 (또는 처리 결과) |
| 하단 StatusBar | 카메라 해상도 · 카메라가 보고한 FPS |

## 코드에서 볼 것 (`MainWindow.xaml.cs`)

- `new VideoCapture(index, VideoCaptureAPIs.DSHOW)` → `IsOpened()` 확인 → 실패 시 기본 백엔드로 재시도 → 그래도 실패면 MessageBox
- `CaptureLoop`: `while (!token.IsCancellationRequested) { cap.Read(frame); … Dispatcher.Invoke(...) }`
  - 프레임 버퍼(`frame`, `gray`, `output`)를 루프 밖에서 한 번만 만들어 재사용
  - `Dispatcher.Invoke` 는 UI 갱신이 끝날 때까지 기다리므로 다음 프레임이 버퍼를 덮어써도 안전
  - `BackgroundSubtractorMOG2.Create()` → `mog2.Apply(frame, mask)`
- `StopCameraAsync`: `_cts.Cancel()` → `await _loopTask` → `Release()` / `Dispose()`
- `Window_Closing`: 카메라가 돌고 있으면 `e.Cancel = true` 로 닫기를 미루고, 정리가 끝난 뒤 다시 `Close()`
- ComboBox 값은 백그라운드 스레드에서 읽으므로 `Volatile.Write/Read`

## 관련 차시

- 15차시 동영상과 카메라: VideoCapture
- 10차시 에지 검출 (Canny), 09차시 모폴로지(배경 차분 마스크 정리에 응용)
