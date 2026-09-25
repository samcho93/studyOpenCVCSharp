# Ch16_ImageStudio — 16차시 WPF 이미지 처리 스튜디오

12가지 필터를 슬라이더로 조절하며 미리보고, [적용] 으로 확정하고, 되돌리기/다시 실행이 되는 작은 이미지 편집 앱입니다.
처리 로직(`FilterPipeline`)과 기록 관리(`HistoryManager`)는 WPF 에 의존하지 않는 별도 클래스로 분리했습니다.

## 실행 방법

1. Visual Studio 2022 에서 `Ch16_ImageStudio.csproj` 를 열고 **F5**.
2. [열기] → `images/sample_color.png` 등을 선택합니다.
3. 왼쪽 필터 목록에서 필터를 고르고 슬라이더를 움직이면 오른쪽 "필터 미리보기" 가 즉시 바뀝니다.
4. [적용] 을 누르면 결과가 "작업 이미지" 가 되고, 다른 필터를 이어서 적용할 수 있습니다. [되돌리기] / [다시 실행] / [초기화].
5. [저장] 은 현재 미리보기 상태를 **원본 해상도**로 다시 계산해 저장합니다.

## NuGet 패키지

`OpenCvSharp4`, `OpenCvSharp4.runtime.win`, `OpenCvSharp4.WpfExtensions` (모두 4.10.0)

## 화면 설명

| 영역 | 내용 |
|---|---|
| 왼쪽 위 | 파일: 열기 · 저장 / 기록: 적용 · 되돌리기 · 다시 실행 · 초기화, 기록 개수 |
| 왼쪽 가운데 | 필터 ListBox: None · Gray · GaussianBlur · MedianBlur · Canny · Threshold · AdaptiveThreshold · Sharpen · Sepia · Emboss · Erode · Dilate |
| 왼쪽 아래 | 파라미터 슬라이더 p1 · p2 (필터마다 이름 · 범위 · 기본값이 바뀜) |
| 오른쪽 | 작업 이미지(적용된 상태) · 필터 미리보기 |
| 하단 | 파일 · 크기 · 채널 · 필터 · 파라미터 · 처리 시간 · 미리보기 축소 비율 |

## 파일 구성

| 파일 | 역할 |
|---|---|
| `FilterPipeline.cs` | `enum FilterKind`, `record ParamInfo/FilterInfo`(슬라이더 설명), `Mat Apply(Mat src, FilterKind kind, double p1, double p2)` — 입력은 건드리지 않고 항상 **새 Mat** 반환 |
| `HistoryManager.cs` | `Stack<Mat>` 두 개(Undo/Redo)로 기록 관리. 스택에서 빠지는 Mat 은 즉시 Dispose, `IDisposable` |
| `MainWindow.xaml(.cs)` | 화면 · 이벤트. Current(원본 해상도) → `_preview`(1280px 이하 축소) → `_result`(미리보기 결과) |
| `ImageFile.cs` | 한글 경로 안전한 읽기/쓰기 |

## 코드에서 볼 것

- **즉시 미리보기**: 슬라이더 `ValueChanged` → `ApplyPreview()`. 큰 이미지는 `Cv2.Resize(..., InterpolationFlags.Area)` 로 1280px 이하로 줄인 `_preview` 에 적용해 빠르게 반응
- **적용 · 저장은 원본 해상도**: `FilterPipeline.Apply(_history.Current, ...)`
- **파라미터 규약**: 커널 크기는 `Odd()` 로 홀수 보정, Threshold 의 p2 는 0/1 로 반전 여부, Sharpen 은 `AddWeighted` 언샵 마스크, Sepia 는 `Cv2.Transform` 3×3 색 행렬, Emboss 는 `Filter2D` + `delta`
- **Mat 소유 규칙**: `HistoryManager.Reset/Push` 는 넘겨받은 Mat 의 소유권을 가져감(호출자는 Dispose 하지 않음), 화면용 `_result` 는 바뀔 때마다 이전 것을 Dispose
- 슬라이더 범위를 코드로 바꾸는 동안 `_updatingUi` 플래그로 `ValueChanged` 재진입을 막음

## 관련 차시

- 16차시 WPF 이미지 처리 스튜디오 만들기
- 05(색 공간) · 07(이진화) · 08(필터링) · 09(모폴로지) · 10(에지) 차시의 함수들을 한 앱에 모음
