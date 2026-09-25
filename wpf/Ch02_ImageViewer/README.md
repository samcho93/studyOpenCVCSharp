# Ch02_ImageViewer — 02차시 이미지 뷰어

WPF 화면에 OpenCV `Mat` 을 표시하고 다루는 기본기를 모은 뷰어입니다.

- 열기: 파일 대화상자 **또는** 파일을 창 위에 끌어다 놓기(드래그앤드롭)
- 확대/축소: Slider · 마우스 휠 · [1:1] · [창에 맞춤] (`Image.LayoutTransform` 의 `ScaleTransform`)
- 마우스가 가리키는 픽셀의 **(x, y) 와 B G R 값** (흑백이면 밝기) 표시
- 흑백 / Canny 미리보기, 원본으로 되돌리기, 저장

## 실행 방법

1. Visual Studio 2022 에서 `Ch02_ImageViewer.csproj` 를 엽니다.
2. NuGet 복원이 끝나면 **F5**.
3. [열기] 를 누르면 `images/` 폴더(예제 이미지)가 먼저 나옵니다. `sample_color.png` 를 열어 보세요.

## NuGet 패키지

`OpenCvSharp4`, `OpenCvSharp4.runtime.win`, `OpenCvSharp4.WpfExtensions` (모두 4.10.0)

## 화면 설명

| 영역 | 내용 |
|---|---|
| 상단 ToolBar | 열기 · 흑백 · Canny · 원본 · 저장 · 확대/축소 Slider(10%~800%) · 1:1 · 창에 맞춤 |
| 가운데 ScrollViewer + Image | `Stretch="None"` 으로 1 픽셀 = 1 화면 단위, 배율은 `ScaleTransform` 으로. `BitmapScalingMode="NearestNeighbor"` 라서 확대하면 픽셀이 네모로 보입니다 |
| 하단 StatusBar | 파일 이름 · 처리 이름 · 크기 · 채널 · MatType, 그리고 마우스 위치 픽셀 값 |

## 코드에서 볼 것

- **드래그앤드롭**: `Window` 의 `AllowDrop="True"`, `DragOver` 에서 `DragDropEffects.Copy`, `Drop` 에서 `DataFormats.FileDrop` 으로 파일 경로 배열을 꺼냄
- **픽셀 값 읽기**: `e.GetPosition(MainImage)` → `(int)pos.X, (int)pos.Y` → `mat.At<Vec3b>(y, x)` — **(행 y, 열 x) 순서**
- **Mat 관리**: `_original`(원본) 은 보관, 화면용 `_display` 는 바뀔 때마다 이전 것을 Dispose (`SetDisplay`)
- **Mat → 화면**: `mat.ToBitmapSource()` (OpenCvSharp.WpfExtensions)

## 관련 차시

- 02차시 WPF 기초와 이미지 표시 (Mat ↔ BitmapSource)
- 03차시 Mat 과 픽셀 (픽셀 값 읽기), 10차시 에지 검출 (Canny)
