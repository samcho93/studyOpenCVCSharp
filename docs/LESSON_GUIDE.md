# 차시 콘텐츠 작성 가이드 (C# WPF 로 배우는 OpenCV 강좌)

사이트는 **3단 화면** 하나(`index.html`)로 동작합니다.
- 왼쪽: 목차(Part → 차시 → 교시), 학생용/교사용 전환, 🪟 WPF 프로젝트 · 📁 작업 폴더
- 가운데: 🎓 학생용 = 문서(개념 · 그림 · 예제 · 실습 · 퀴즈) + 아래 **C# 코드 편집기** / 🧑‍🏫 교사용 = **PPT 슬라이드** + 교사 노트 + 판서
- 오른쪽: **결과 창** — `Console.WriteLine` 출력 · 오류 · `Cv2.ImShow` 이미지 창(좌표 · 픽셀 값 · 확대)

각 차시는 `lessons/csNN.js` 파일 하나이며 `CS_COURSE.addChapter({...})` 를 한 번 호출합니다.
평범한 브라우저 스크립트입니다 (import/export 금지, 전역 변수 금지 → `(function(){ ... })();` 안에서 상수 정의).
**완성 예시: `lessons/cs00.js` 를 반드시 먼저 읽고 같은 스타일로 작성하세요.**
`js/course.js` 의 `order` 에 차시 id(`cs00`~`cs17`), 제목, **교시 수(hours)** 가 있습니다. 교시 수를 지키세요.

## 0. 이 강좌의 방향 (가장 중요)

- 대상: C# 을 조금 아는(변수 · 반복 · 클래스) 학생. **OpenCvSharp4** 로 OpenCV 를 배우고 **WPF** 앱에 붙이는 것이 목표.
- **모든 OpenCV 예제는 브라우저에서 바로 실행되는 C# 콘솔 코드**로 씁니다 (`using OpenCvSharp;` + `Cv2.*`, `Mat`). 개념은 짧고 정확하게 → 곧바로 실행해 보는 예제 → 값을 바꿔 보는 실습.
- **WPF 코드**(XAML · `MainWindow.xaml.cs` · `BitmapSourceConverter`)는 브라우저에서 실행하지 않으므로 `run: false, local: true` 로 표시하고, 같은 처리를 하는 **콘솔 버전 예제를 반드시 함께** 둡니다. 완성 프로젝트는 `wpf/` 폴더(GitHub)에 있습니다.
- 예제 이미지는 `assets/images/*.png` (합성 이미지). **`assets/IMAGES.md` 에 이미지별 내용과 정답(개수 · 좌표 · 색)** 이 있습니다. 반드시 읽고 정답과 맞는 결과가 나오는 예제를 쓰세요.
- 용어는 한국어 + 영어 병기(예: 이진화(Thresholding), 윤곽선(Contour)). OpenCvSharp 메서드 이름은 **PascalCase** 이고 Python/C++ 이름과 대응을 한 번씩 알려 주면 좋습니다 (예: `Cv2.CvtColor` = `cv2.cvtColor`).
- 💡 팁 · ⚠️ 주의(흔한 실수: BGR 순서, (y, x) 순서, 채널 수, 홀수 커널, Dispose) · 🪟 WPF 에서는 · 🧰 Visual Studio 콜아웃을 자주 넣습니다.

## 1. 구조

```js
(function () {
  const FIG_X = `<svg ...>...</svg>`;        // 그림은 상수로 만들어 content 와 slides 에서 함께 사용
  const EX1 = `using System; ...`;            // 예제 코드도 상수로 → 본문 · 슬라이드에서 재사용
  const QUIZ = [ {q, options, answer, explain}, ... ];

  CS_COURSE.addChapter({
    id: 'cs07', no: '07', title: '...', subtitle: '...',
    summary: '차시 요약 (html)',
    goals: ['차시 학습 목표', ...],
    wpf: 'Ch07_Threshold',                    // (선택) wpf/ 폴더의 관련 프로젝트 이름
    sections: [ /* 교시 = 50분 1개. course.js 의 hours 개수만큼 */ ]
  });
})();
```

섹션(교시):
```js
{ id: 'cs07-1', title: '교시 제목', minutes: 50,
  goals: ['...'], flow: [['도입', 5], ['개념', 15], ['실습', 20], ['정리', 10]],   // 합계 = minutes
  content: [ /* 본문 블록 */ ], practice: [ /* 실습 1~3 */ ], quiz: [ /* 퀴즈 3~5 */ ], slides: [ /* 슬라이드 8~14장 */ ] }
```
섹션 id 는 반드시 `'차시id-번호'` (예: `cs07-2`).

## 2. 본문 블록 (`content`)

| type | 필드 | 설명 |
|---|---|---|
| `h` | `text` | 소제목 |
| `p` | `html` | 문단 |
| `list` | `items`, `ordered?` | 목록 |
| `table` | `head`, `rows`, `caption?` | 표 |
| `figure` | `html`(인라인 SVG), `caption` | 그림 |
| `image` | `src`(예: `'images/sample_color.png'`), `caption`, `width?` | 예제 이미지 보여 주기 (누르면 확대 · 픽셀 값) |
| `code` | `title`, `code`, `lang?`, `file?`, `desc?`, `expect?`, `stdin?`, `run?`, `local?`, `nondeterministic?` | **코드 (C# 은 브라우저에서 실행)** — 3절 |
| `callout` | `kind: tip/warn/info/more/wpf/vs/field`, `title?`, `html` | 강조 상자 (`wpf` = 🪟 WPF 에서는, `vs` = 🧰 Visual Studio, `more` = 📘 더 알아보기) |
| `wpf` | `title`, `html`, `project?` | 🪟 WPF 프로젝트 안내 (project = `wpf/` 폴더 이름 → GitHub 링크) |
| `demo` | `title`, `desc?`, `html`, `init(root, MLB)` | 인터랙티브 캔버스 체험 (선택) |

어떤 블록이든 `teacher: true` 를 붙이면 **교사용 화면에만** 보입니다 (수업 준비 체크리스트, 오개념 지도 팁, 평가 루브릭 — 보통 마지막 교시 끝에).

**원칙: 문제 → 원리(그림) → 코드 → 결과 해석 → 흔한 실수/팁.** KaTeX 는 없습니다. 수식은 HTML(`<sub>`, `<sup>`, `Σ`, `√`, `θ`, `×`)로 씁니다.

## 3. 코드 (가장 중요)

### 3.1 형식
```js
{ type: 'code', title: '예제 2: Otsu 이진화', desc: '해석 (html)',
  code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var bin = new Mat();
        double t = Cv2.Threshold(img, bin, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Console.WriteLine($"Otsu 임계값: {t}");
        Cv2.ImShow("binary", bin);
        Cv2.WaitKey(0);
    }
}`,
  expect: 'Otsu 임계값: 125' }
```
- `class Program { static void Main() { … } }` 형태를 기본으로 씁니다 (Visual Studio 콘솔 프로젝트에 그대로 붙일 수 있게). 짧은 조각은 최상위 문(클래스 없이)도 됩니다.
- **실행하지 않는 코드**: `run: false`. **WPF · 파일 대화상자 · 실제 카메라 코드**: `run: false, local: true` → “🖥 Visual Studio 에서 실행” 표시. `file: 'MainWindow.xaml.cs'` 로 파일 이름을 적어 주세요.
- **XAML**: `{ type:'code', lang:'xml', file:'MainWindow.xaml', code:'<Window …>' , run:false }`. 터미널 명령: `lang:'sh'`. NuGet 패키지 참조 · csproj: `lang:'xml'`. `lang` 은 `cs`(기본) · `xml` · `sh` · `json` · `txt`.
- `expect` 는 실제 실행 출력(검증 도구 `--print` 로 얻음). 이미지 창만 있는 예제는 `expect` 생략 가능.

### 3.2 브라우저 C# 실행 환경에서 되는 것
- C#: 클래스 · 구조체 · 열거형 · 상속 · 인터페이스 · 제네릭 컬렉션(`List<T>` `Dictionary<K,V>` `HashSet<T>` `Queue` `Stack`) · LINQ · 람다 · 예외(try/catch/finally) · 튜플 · `out`/`ref` · 패턴 매칭 · `switch` 식 · 문자열 보간(`$"{x:F2}"`) · `using var` · 지역 함수 · 확장 메서드 호출.
- OpenCvSharp: `Mat`(생성 · `At<T>`/`Get<T>`/`Set<T>` · `GetGenericIndexer<T>` · ROI `new Mat(img, rect)` / `img[rect]` · `Clone` · `ConvertTo` · `SetTo` · 연산자 `+ - * / & | ~`) · `MatType` · `Scalar` · `Point`/`Point2f`/`Point2d` · `Size` · `Rect` · `RotatedRect` · `Vec3b` 등 · `Cv2` 의 core/imgproc 함수 대부분(색 변환 · 산술 · 통계 · 히스토그램/CLAHE · 이진화 · 필터 · 모폴로지 · 에지 · 기하 변환 · 윤곽선/도형 분석 · 허프 · 템플릿 매칭 · 그리기/텍스트 · 연결 요소 `ConnectedComponentsEx` · 거리 변환 · watershed · grabCut · floodFill · DFT · kmeans) · 특징점 `ORB.Create` · `BFMatcher` · `Cv2.DrawMatches` · `FindHomography` · `BackgroundSubtractorMOG2.Create` · `CalcOpticalFlowPyrLK` · `QRCodeDetector` · `VideoCapture(0)`(컨베이어 시뮬레이션 60프레임) · `Cv2.ImWrite`(PNG, 📁 작업 폴더에 저장) · `Window` 클래스.
- **Mat 확장 메서드**(OpenCvSharp 스타일)도 됩니다: `img.CvtColor(...)`, `img.Threshold(...)`, `img.GaussianBlur(...)`, `img.Canny(...)`, `img.Resize(...)`, `img.FindContoursAsArray(...)`, `contour.ContourArea()` 등 — 새 Mat 을 돌려줍니다.
- `Cv2.WaitKey(0)` 은 브라우저에서 기다리지 않고 바로 돌아옵니다(키가 있으면 그 키). 카메라 반복에서는 `Cv2.WaitKey(30)` 이 30ms 쉬면서 화면을 갱신합니다. **반복은 반드시 끝나게** 쓰세요 (`while (cap.Read(frame))` 은 60프레임 뒤 false).
- **안 되는 것**: WPF/WinForms(`Window` 상속 · `Image` 컨트롤 · `BitmapSource` 표시 · `OpenFileDialog`), 스레드/Task 병렬(`Task.Run` 은 즉시 실행), 실제 웹캠 · 동영상 파일, `dnn` · `ml` · `calib3d`(체스보드 · 캘리브레이션) · `CascadeClassifier` · `FastNlMeansDenoising` · `Inpaint`. 이런 코드는 `run: false, local: true`.
- 흔한 주의: 코드 문자열은 JS 템플릿 문자열 안에 있으므로 **`${` 금지, 백틱 금지**, 역슬래시는 두 번(`\\n`). C# 보간 문자열 `$"{x}"` 는 `${` 가 아니므로 괜찜지만 `$"{{"` 처럼 중괄호 리터럴을 쓸 때 주의. 정규식 `\d` 는 `\\d`.
- 출력은 결정적으로: 난수는 `new Random(42)` (브라우저와 .NET 의 난수 열이 다르므로 난수 값 자체를 `expect` 에 넣지 말 것). 실수는 `{v:F2}` 처럼 자릿수 고정. 시간 측정값도 `expect` 에 넣지 말 것(`nondeterministic: true`).
- 한 예제 **실행 시간 3초 이내**(인터프리터는 .NET 보다 수십 배 느림 — 픽셀 이중 반복은 640×480 한 번 정도까지만, 큰 반복은 `Cv2.*` 함수로).

### 3.3 실습(practice)
```js
{ title, level: 1~3, desc: 'html', hint?: 'html',
  starter: `...`,     // 문법 오류 없이 실행되는 뼈대 (// TODO)
  solution: `...`,    // 완전한 정답 (교사용에서만 보임)
  expect?: '...' }
```
섹션마다 1~3개.

## 4. 그림 (SVG)

- 인라인 SVG, CSS 클래스만 사용: `.p1~.p5`(채움) `.p1s~.p5s`(연한 채움) `.s1~.s5`(선) `.ln` `.ax` `.tx` `.tx-m` `.tx-b` `.tx-w` `.card-bg` `.fill-arrow`. **하드코딩 색 금지** (테마 전환).
- `<marker id>` 등 SVG 안의 id 는 **차시 접두어로 고유하게** (예: `c07a1`).
- Mat 메모리 배치(행 · 열 · 채널), BGR 순서, (x, y) vs (행, 열), 커널 슬라이딩, 이진화 곡선, HSV 원기둥, 어파인 변환, 윤곽 계층 같은 그림을 적극적으로 그립니다. viewBox 폭 640~760.

## 5. 퀴즈

`{ q: 'html', options: ['..','..','..','..'], answer: 0부터, explain: 'html' }` — 섹션마다 3~5문항. q 안 코드는 `<code>`, `<` → `&lt;`.

## 6. 교사용 슬라이드 (`slides`)

한 장 = 객체 하나, **모든 슬라이드에 `notes`**(교사 노트: 말할 내용, 💬 발문과 예상 답, 주의점, 시간). 섹션당 8~14장.
첫 장 뒤에 “학습 목표 + 수업 흐름” 슬라이드가 자동으로 들어갑니다.

| layout | 필드 |
|---|---|
| `title` | `title`, `subtitle?` — 섹션 첫 장 |
| `bullets` | `title`, `bullets: [html \| [html, [하위…]]]`, `lead?` — 불릿 3~6개 |
| `code` | `title`, `code`, `lang?`, `file?`, `run?`, `local?`, `points?: [html 2~4개]` — **22줄** 이내(클래스 틀 포함), 실행 가능 |
| `two` | `title`, `left: {title, bullets?/html?/code?, lang?}`, `right: {...}` |
| `table` | `title`, `head`, `rows`, `lead?` |
| `diagram` | `title`, `html`(SVG), `caption?` |
| `image` | `title`, `src`(`images/…png`), `caption?` |
| `demo` | `title`, `html`, `init`, `caption?` |
| `quiz` | `title`, `q`, `options`, `answer`, `explain` |
| `practice` | `title`, `desc`, `starter`, `solution` |
| `summary` | `title`, `bullets` — 섹션 마지막 장 |

권장 흐름: `title` → 문제 제기(image/bullets) → 원리(diagram) → 예제(code) → … → quiz → practice → summary.

## 7. 검증 (필수)

```bash
node tools/validate.mjs cs07              # 스키마 + 모든 C# 코드를 브라우저와 같은 인터프리터 + OpenCV.js 로 실행, expect 비교
node tools/validate.mjs cs07 --print      # 실제 출력 보기 (expect 작성용)
node tools/validate.mjs                   # 전체
```
오류 0 이 될 때까지 고치세요 (경고 “expect 없음”은 괜찮지만, 결정적 출력이면 expect 를 넣으세요).
`run:false` 코드는 구문만 검사하고(WPF 코드는 검사 생략), `local:true` 는 실행하지 않습니다.
