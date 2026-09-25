# Ch17_Inspection — 17차시 실전 검사 프로젝트

머신 비전 검사기의 기본 골격입니다. **개수 세기 · 색 분류 · 결함 검사** 세 가지 검사를
같은 화면에서 돌려 보고 **OK / NG 판정**, 결과 표, 누적 통계, 오버레이·CSV 저장까지 해 봅니다.

검사 로직은 `Inspectors/` 폴더에 **WPF 를 모르는 순수 OpenCvSharp 클래스**로 분리해 두었고
(`IInspector` 인터페이스), `MainWindow` 는 화면만 담당합니다.

## 실행 방법

1. Visual Studio 2022 에서 `Ch17_Inspection.csproj` 를 엽니다 (파일 → 열기 → 프로젝트/솔루션).
2. NuGet 복원이 끝나면 **F5**.
3. 검사별로 이렇게 해 보세요 (모두 출력 폴더의 `images/` 에 복사되어 있습니다).

| 검사 | 이미지 열기 | 골든 열기 | 파라미터(기본값) | 기대 개수 | 실제 결과 (확인됨) |
|---|---|---|---|---|---|
| 개수 세기 | `washers.png` | (필요 없음) | 면적 하한 300 | 11 | **11개 → OK**. 물체는 13개지만 W1·W2 와 B3·N4 가 서로 닿아 한 덩어리로 세어집니다 (붙은 물체를 떼는 방법은 12차시 watershed) |
| 개수 세기 | `coins_parts.png` | (필요 없음) | 면적 하한 300 | 12 | **12개 → OK**. 등가지름이 39 / 53 / 67 px 세 종류로 나뉘어 크기 선별도 보입니다 |
| 색 분류 | `color_caps.png` | (필요 없음) | 면적 하한 400 | 20 | 빨강 5 · 노랑 6 · 초록 4 · 파랑 3 · 흰색 2 = **총 20개 → OK** (정답과 일치) |
| 결함 검사 | `metal_scratch.png` | `metal_ok.png` | 차영상 임계값 10 | (사용 안 함) | **결함 5개 → NG**. 실제 결함은 4개(긁힘 2 · 얼룩 1 · 찍힘 1)이고, 찍힘은 밝은 쪽/어두운 쪽이 떨어져 D3·D4 두 조각으로 잡힙니다 |
| 결함 검사 | `metal_ok.png` | `metal_ok.png` | 차영상 임계값 10 | (사용 안 함) | 같은 이미지끼리 비교 → **결함 0개 → OK** (헛검출 없음) |
| 결함 검사 | `pcb_board.png` | `pcb_golden.png` | 차영상 임계값 10 | (사용 안 함) | **결함 5개 → NG**. C2 틀어짐 · R3 누락 · D1 극성 반대(띠가 두 조각) · U1 솔더 브리지 |

> 이미지를 열면 자동으로 한 번 검사합니다. 파라미터를 바꾼 뒤에는 [검사 실행] 을 다시 누르세요.
> 차영상 임계값을 30 으로 올리면 얇은 긁힘(폭 1.8 px)과 옅은 얼룩(밝기 차 22)을 놓쳐 **결함 0개(OK 오판정)** 가 됩니다.
> "놓침(미검출)" 과 "헛검출" 이 파라미터 하나로 어떻게 바뀌는지 직접 보여 주기 좋은 예입니다.

## NuGet 패키지

`OpenCvSharp4`, `OpenCvSharp4.runtime.win`, `OpenCvSharp4.WpfExtensions` (모두 4.10.0)

## 화면 설명

| 영역 | 내용 |
|---|---|
| 상단 ToolBar | 검사 선택 ComboBox · 이미지 열기 · 골든 열기(결함 검사에서만 활성) · **검사 실행** · 파라미터 Slider(검사마다 뜻이 바뀜) · 기대 개수 · 오버레이 저장 · 결과 CSV 저장 |
| 왼쪽 Image | 검사 이미지 원본 (`SourceImage`) |
| 가운데 Image | 검사 결과 오버레이 (`OverlayImage`) — 위쪽 띠에 OK/NG, 개수 세기는 초록 사각형+번호, 색 분류는 색마다 원+색 이름, 결함 검사는 빨간 사각형 D1·D2 |
| 오른쪽 패널 | 판정 상자(초록 OK / 빨강 NG + 요약) · 누적 통계(검사 횟수 · OK · NG) · 골든 이미지 이름 · 결과 DataGrid(항목 · 값 · 판정) |
| 하단 StatusBar | 검사 이름 · 파일 이름 · 처리 시간(ms) |

## 파일 구성

| 파일 | 역할 |
|---|---|
| `Inspectors/InspectionResult.cs` | `InspectionItem`(표 한 줄), `InspectionResult`(판정 · 요약 · 오버레이 Mat · 항목 목록, `IDisposable`), `IInspector` 인터페이스, `MatHelper`(ToGray · ToBgr · PutLabel · PutJudge) |
| `Inspectors/CountInspector.cs` | 개수 세기 — 블러 → **Otsu 이진화(밝기 방향 자동 판단)** → 모폴로지 열기 → `FindContours` → 면적 필터 → 번호 붙이기. `MinArea`, `ExpectedCount` |
| `Inspectors/ColorSortInspector.cs` | 색 분류 — `CvtColor BGR2HSV` → 색마다 `Cv2.InRange` (빨강은 H 가 0 을 넘으므로 범위 2개를 `BitwiseOr`) → 열기/닫기 → `FindContours` → 색별 개수. `MinArea`, `ExpectedTotal` |
| `Inspectors/DefectInspector.cs` | 결함 검사 — 골든과 **`Cv2.Absdiff`** → 임계값 → 닫기 → `FindContours` → 면적 필터 → 결함 bbox. `NeedsGolden = true`, `DiffThreshold`, `MinDefectArea` |
| `MainWindow.xaml(.cs)` | 화면 · 이벤트 · 판정 표시 · 통계 · 저장 |
| `ImageFile.cs` | 한글 경로에서도 안전한 읽기/쓰기 (`ImDecode` / `ImEncode` + 바이트 배열) |

## 코드에서 볼 것

- **인터페이스로 검사 추가하기**: `IInspector`(`Name` · `NeedsGolden` · `Inspect(Mat image, Mat? golden)`) 만 구현하면
  `MainWindow` 의 `_inspectors` 배열에 한 줄 넣어 ComboBox 에 바로 나옵니다.
- **Mat 소유 규칙**: `Inspect` 는 입력(`image`, `golden`)을 **바꾸지 않고** 오버레이를 **새 Mat** 으로 만들어 돌려줍니다.
  창은 새 결과를 받을 때 이전 `InspectionResult` 를 `Dispose`(= 오버레이 Mat 해제)하고, 닫힐 때 `_image` · `_golden` 도 해제합니다.
- **예외 처리**: OpenCV 처리 실패는 `OpenCVException`, "골든이 없다 · 크기가 다르다" 처럼 사용자가 고칠 수 있는 문제는
  `InvalidOperationException` 으로 구분해 MessageBox 문구를 다르게 보여 줍니다.
- **판정(OK/NG) 만들기**: 검출 개수를 기대 개수와 비교(개수 세기 · 색 분류), 결함이 하나라도 있으면 NG(결함 검사).
- **한글 텍스트 주의**: `Cv2.PutText` 는 한글을 그리지 못합니다 → 오버레이에는 `OK/NG`, `D1`, 색 이름 같은 짧은 글자만 그리고
  자세한 내용은 WPF `TextBlock` · `DataGrid` 에서 한글로 보여 줍니다.
- **결과 기록**: `DataGrid` 는 `InspectionResult.Items` 를 그대로 `ItemsSource` 로 받고, CSV 는 Excel 이 한글을 바로 읽도록
  BOM 있는 UTF-8(`new UTF8Encoding(true)`)로 저장합니다.

## 관련 차시

- 17차시 실전 검사 프로젝트: 개수 세기 · 색 분류 · 결함 검사
- 07차시(이진화 · Otsu) · 09차시(모폴로지) · 11차시(윤곽선 · 면적) · 05차시(HSV 색 분리) · 12~13차시(측정 · 검사) 의 종합
