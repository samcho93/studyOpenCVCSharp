# wpf — 강좌 완성 예제 (Visual Studio WPF 프로젝트)

"C# WPF 로 배우는 OpenCV" 강좌에서 만드는 WPF 앱의 **완성본**입니다.
브라우저 강좌 화면에서는 콘솔 코드(C# 인터프리터)로 OpenCV 를 배우고, WPF 코드는 여기 프로젝트를
Visual Studio 에서 열어 직접 실행합니다.

## 프로젝트 목록

| 폴더 | 앱 | 내용 | 관련 차시 |
|---|---|---|---|
| [`OpenCvWpfStarter`](OpenCvWpfStarter/) | OpenCV + WPF 시작 템플릿 | 열기 · 흑백 · 블러 · 원본 · 저장, 상태 표시줄. 새 프로젝트를 시작할 때 복사해 쓰는 최소 골격 | 01 · 02 |
| [`Ch02_ImageViewer`](Ch02_ImageViewer/) | 이미지 뷰어 | 파일 대화상자 · 드래그앤드롭 열기, 확대/축소(Slider · 휠 · 1:1 · 창에 맞춤), 마우스 위치의 픽셀 값, 흑백/Canny 미리보기, 저장 | 02 · 03 |
| [`Ch15_Camera`](Ch15_Camera/) | 카메라 (VideoCapture) | 웹캠 실시간 표시, 백그라운드 캡처 루프 + `Dispatcher.Invoke`, 처리 옵션(흑백 · Canny · 배경 차분 MOG2), FPS, 안전한 정지/종료 | 15 |
| [`Ch16_ImageStudio`](Ch16_ImageStudio/) | 이미지 처리 스튜디오 | 필터 12종 + 파라미터 슬라이더 즉시 미리보기, 적용 · 되돌리기 · 다시 실행 · 초기화, 원본 해상도로 저장 | 16 |
| [`Ch17_Inspection`](Ch17_Inspection/) | 실전 검사 프로젝트 | 개수 세기 · 색 분류 · 결함 검사(골든 이미지 차영상), OK/NG 판정 · 결과 표 · 통계 · 오버레이/CSV 저장 | 17 |

각 폴더의 `README.md` 에 화면 설명 · 실행 순서 · 코드에서 볼 점이 정리되어 있습니다.

## 공통 준비 사항

- **Visual Studio 2022** (워크로드: ".NET 데스크톱 개발")
- **.NET 8 SDK** — 모든 프로젝트가 `net8.0-windows` 를 대상으로 합니다.
  (SDK 9 만 설치된 PC 에서도 `dotnet build` 는 .NET 8 참조 팩을 NuGet 에서 자동으로 받아 빌드됩니다.
  다만 **실행**에는 .NET 8 데스크톱 런타임이 필요합니다.)
- 인터넷 연결 — 처음 열 때 NuGet 패키지를 복원합니다 (1~2분).
- Windows 10/11. `Ch15_Camera` 는 웹캠과, Windows 설정 → 개인 정보 및 보안 → 카메라 → "데스크톱 앱이 카메라에
  액세스하도록 허용" 이 필요합니다.

### NuGet 패키지 (5개 프로젝트 공통)

| 패키지 | 버전 | 역할 |
|---|---|---|
| `OpenCvSharp4` | 4.10.0 | C# 에서 쓰는 OpenCV API (`Mat`, `Cv2.*`) |
| `OpenCvSharp4.runtime.win` | 4.10.0 | Windows 용 OpenCV 네이티브 DLL |
| `OpenCvSharp4.WpfExtensions` | 4.10.0 | `mat.ToBitmapSource()` — Mat 을 WPF `Image` 에 표시 |

### 예제 이미지 폴더

모든 `.csproj` 에 다음 항목이 있어, 강좌 예제 이미지가 빌드할 때 **출력 폴더의 `images/`** 로 복사됩니다.
앱의 [열기] 대화상자는 이 폴더부터 보여 줍니다.

```xml
<Content Include="..\..\assets\images\*.png" Link="images\%(Filename)%(Extension)"
         CopyToOutputDirectory="PreserveNewest" />
```

따라서 프로젝트 폴더는 **저장소 안(`wpf/<프로젝트>`)에 그대로 두어야** `..\..\assets\images` 를 찾을 수 있습니다.
다른 곳으로 복사해 쓸 때는 이 줄을 지우거나 경로를 고치세요.

## 실행 방법

1. Visual Studio 2022 에서 원하는 폴더의 `.csproj` 를 엽니다 (파일 → 열기 → 프로젝트/솔루션).
2. NuGet 복원이 끝나면 **F5** (디버그 실행).
3. 명령줄에서는 `dotnet build -c Release` / `dotnet run` 도 됩니다.

```bash
cd wpf/Ch16_ImageStudio
dotnet build -c Release
```

## 공통 코드 규칙 (강좌에서 계속 강조하는 것)

- **Mat 관리**: 원본 Mat 은 그대로 보관하고, 처리 결과는 **항상 새 Mat**. 새 결과가 생기면 **이전 결과를 Dispose**.
  창이 닫힐 때(`OnClosed`) 남은 Mat 을 모두 Dispose 합니다.
- **표시**: `OpenCvSharp.WpfExtensions` 의 `mat.ToBitmapSource()`
  (= `BitmapSourceConverter.ToBitmapSource(mat)`) 로 `Image.Source` 에 넣습니다.
- **예외 처리**: OpenCV 호출은 `try / catch (OpenCVException)` 로 감싸 MessageBox 또는 상태 표시줄에 알립니다.
- **한글 경로**: `Cv2.ImRead` / `ImWrite` 대신 `File.ReadAllBytes` + `Cv2.ImDecode`,
  `Cv2.ImEncode` + `File.WriteAllBytes` (각 프로젝트의 `ImageFile.cs`).
- **이름 충돌**: `using Window = System.Windows.Window;`, `using Size = OpenCvSharp.Size;` 처럼 별칭을 정해 둡니다
  (WPF 와 OpenCvSharp 에 같은 이름의 타입이 있습니다).
- **스레드**: 카메라 · 오래 걸리는 처리는 백그라운드(`Task.Run`), UI 갱신은 `Dispatcher.Invoke`.
- 주석은 한국어, `<TargetFramework>net8.0-windows</TargetFramework> <UseWPF>true</UseWPF> <Nullable>enable</Nullable>
  <ImplicitUsings>enable</ImplicitUsings>` 를 공통으로 씁니다.

`bin/` `obj/` 는 저장소에 넣지 않습니다 (`.gitignore`).
