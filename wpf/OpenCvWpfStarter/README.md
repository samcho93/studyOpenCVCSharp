# OpenCvWpfStarter — OpenCV + WPF 시작 템플릿

새 WPF 프로젝트에 OpenCvSharp 을 붙일 때 그대로 복사해 쓰는 **최소 템플릿**입니다.
창 하나에 [열기] [흑백] [블러] [원본] [저장] 버튼, 가운데 `Image`, 아래 상태 표시줄이 있습니다.

## 실행 방법

1. Visual Studio 2022 에서 `OpenCvWpfStarter.csproj` 를 엽니다 (파일 → 열기 → 프로젝트/솔루션).
2. 처음 열면 NuGet 패키지가 자동으로 복원됩니다 (인터넷 필요, 1~2분).
3. **F5** 로 실행 → [열기] 를 누르면 `images/` 폴더(예제 이미지)가 먼저 나옵니다.

명령줄: `dotnet build` 또는 `dotnet run`

## NuGet 패키지

| 패키지 | 역할 |
|---|---|
| `OpenCvSharp4` | C# 에서 쓰는 OpenCV API (`Mat`, `Cv2.*`) |
| `OpenCvSharp4.runtime.win` | Windows 용 OpenCV 네이티브 DLL |
| `OpenCvSharp4.WpfExtensions` | `mat.ToBitmapSource()` — Mat 을 WPF `Image` 에 표시 |

## 화면 설명

- **상단 ToolBar**: 열기(OpenFileDialog) · 흑백(`CvtColor BGR2GRAY`) · 블러(`GaussianBlur 15x15`) · 원본 · 저장(SaveFileDialog)
- **가운데 Image**: `Stretch="Uniform"` 으로 창 크기에 맞춰 표시
- **하단 StatusBar**: 처리 이름 · 크기 · 채널 수 · 처리 시간(ms)

## 코드에서 볼 것

- `ImageFile.cs`: 한글 경로에서도 안전한 읽기/쓰기 (`File.ReadAllBytes` + `Cv2.ImDecode`, `Cv2.ImEncode` + `File.WriteAllBytes`)
- `MainWindow.xaml.cs` 의 **Mat 관리 규칙**
  - 원본 `_original` 은 그대로 두고, 처리 결과는 항상 **새 Mat** 으로 만든다
  - 새 결과가 생기면 **이전 결과를 Dispose** 한다 (`ShowResult`)
  - 창이 닫힐 때 모두 Dispose (`OnClosed`)
- `RunFilter` 에서 `OpenCVException` 을 잡아 메시지 상자로 보여 준다
- `.csproj` 의 `<Content Include="..\..\assets\images\*.png" ...>` 가 예제 이미지를 출력 폴더 `images/` 로 복사한다

## 관련 차시

- 01차시 Visual Studio · NuGet 으로 OpenCvSharp 설치하기
- 02차시 WPF 기초와 이미지 표시 (Mat ↔ BitmapSource)
