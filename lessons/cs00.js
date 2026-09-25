/* 00차시 시작하기: 강좌 안내와 실습 환경 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 강좌 구성 — C# / WPF / OpenCvSharp / OpenCV 의 관계
  const FIG_STACK = `<svg viewBox="0 0 760 300" role="img" aria-label="WPF 앱이 OpenCvSharp 을 통해 네이티브 OpenCV 를 호출하는 구조">
  ${ARROW('c00a1')}
  <rect x="20" y="30" width="330" height="240" rx="14" class="card-bg"/>
  <text x="185" y="58" text-anchor="middle" class="tx-b">🪟 내 WPF 앱 (C# · .NET 8)</text>
  <rect x="40" y="76" width="140" height="56" rx="10" class="p1s"/><text x="110" y="100" text-anchor="middle" class="tx">MainWindow.xaml</text><text x="110" y="120" text-anchor="middle" class="tx-m">화면(버튼 · Image)</text>
  <rect x="200" y="76" width="130" height="56" rx="10" class="p1s"/><text x="265" y="100" text-anchor="middle" class="tx">MainWindow.xaml.cs</text><text x="265" y="120" text-anchor="middle" class="tx-m">이벤트 · 처리 코드</text>
  <rect x="40" y="150" width="290" height="50" rx="10" class="p2s"/><text x="185" y="172" text-anchor="middle" class="tx-b">OpenCvSharp4 (NuGet)</text><text x="185" y="190" text-anchor="middle" class="tx-m">Mat · Cv2.CvtColor · Cv2.Threshold … (C# API)</text>
  <rect x="40" y="212" width="290" height="44" rx="10" class="p3s"/><text x="185" y="240" text-anchor="middle" class="tx">OpenCvSharp4.runtime.win → OpenCV 4.x (C++ DLL)</text>
  <rect x="410" y="30" width="330" height="240" rx="14" class="card-bg"/>
  <text x="575" y="58" text-anchor="middle" class="tx-b">🌐 이 강좌 사이트 (브라우저)</text>
  <rect x="430" y="76" width="290" height="56" rx="10" class="p1s"/><text x="575" y="100" text-anchor="middle" class="tx">코드 편집기 + 결과 창</text><text x="575" y="120" text-anchor="middle" class="tx-m">Console.WriteLine · Cv2.ImShow 이미지 창</text>
  <rect x="430" y="150" width="290" height="50" rx="10" class="p2s"/><text x="575" y="172" text-anchor="middle" class="tx-b">C# 인터프리터 (같은 OpenCvSharp API 이름)</text><text x="575" y="190" text-anchor="middle" class="tx-m">Mat · Cv2.CvtColor · Cv2.Threshold …</text>
  <rect x="430" y="212" width="290" height="44" rx="10" class="p3s"/><text x="575" y="240" text-anchor="middle" class="tx">OpenCV.js 4.13 (WebAssembly)</text>
  <line x1="352" y1="175" x2="406" y2="175" class="ln" stroke-width="2" marker-end="url(#c00a1)"/>
  <line x1="406" y1="185" x2="352" y2="185" class="ln" stroke-width="2" marker-end="url(#c00a1)"/>
  <text x="380" y="165" text-anchor="middle" class="tx-m">같은 코드</text>
  <text x="380" y="290" text-anchor="middle" class="tx-m">브라우저에서 익힌 OpenCvSharp 코드를 그대로 Visual Studio 의 WPF 프로젝트에 붙여 넣습니다</text>
</svg>`;

  // 그림 2: 화면 구성
  const FIG_UI = `<svg viewBox="0 0 760 260" role="img" aria-label="강좌 화면 구성: 왼쪽 목차, 가운데 문서와 편집기, 오른쪽 결과 창">
  <rect x="10" y="10" width="740" height="240" rx="12" class="card-bg"/>
  <rect x="20" y="20" width="150" height="220" rx="8" class="p1s"/><text x="95" y="48" text-anchor="middle" class="tx-b">목차</text>
  <text x="95" y="76" text-anchor="middle" class="tx-m">Part → 차시 → 교시</text><text x="95" y="100" text-anchor="middle" class="tx-m">🎓 학생용 / 🧑‍🏫 교사용</text><text x="95" y="124" text-anchor="middle" class="tx-m">진도 · 검색</text><text x="95" y="148" text-anchor="middle" class="tx-m">📁 작업 폴더</text>
  <rect x="180" y="20" width="330" height="130" rx="8" class="p2s"/><text x="345" y="48" text-anchor="middle" class="tx-b">강좌 내용 (문서 / 슬라이드)</text>
  <text x="345" y="76" text-anchor="middle" class="tx-m">개념 · 그림 → 예제 ▶ 실행 → 실습 → 퀴즈</text><text x="345" y="100" text-anchor="middle" class="tx-m">교사용: 16:9 슬라이드 + 노트 + 판서</text>
  <rect x="180" y="160" width="330" height="80" rx="8" class="p3s"/><text x="345" y="188" text-anchor="middle" class="tx-b">💠 C# 코드 편집기</text><text x="345" y="212" text-anchor="middle" class="tx-m">▶ 실행 (Ctrl+Enter) · ↺ 초기화 · ⬇ .cs 내려받기</text>
  <rect x="520" y="20" width="220" height="220" rx="8" class="p4s"/><text x="630" y="48" text-anchor="middle" class="tx-b">결과 창</text>
  <text x="630" y="76" text-anchor="middle" class="tx-m">Console 출력 · 오류 + 도움말</text><text x="630" y="100" text-anchor="middle" class="tx-m">Cv2.ImShow 이미지 창</text><text x="630" y="124" text-anchor="middle" class="tx-m">마우스 → (x, y) · B G R 값</text><text x="630" y="148" text-anchor="middle" class="tx-m">클릭 → 확대 보기</text><text x="630" y="172" text-anchor="middle" class="tx-m">⌨ Console.ReadLine 입력</text>
</svg>`;

  const EX_FIRST = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 예제 이미지를 흑백(1채널)으로 읽습니다
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        Console.WriteLine($"크기: {img.Width} x {img.Height}");     // 너비 x 높이
        Console.WriteLine($"채널: {img.Channels()}, 형식: {img.Type()}");
        Cv2.MinMaxLoc(img, out double minVal, out double maxVal);
        Console.WriteLine($"밝기 최소/최대: {minVal} / {maxVal}");
        Console.WriteLine($"평균 밝기: {Cv2.Mean(img).Val0:F1}");

        // 이진화 → 물체 개수 세기 (자세한 내용은 07 · 12차시)
        using var binary = new Mat();
        Cv2.Threshold(img, binary, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        using var labels = new Mat();
        int n = Cv2.ConnectedComponents(binary, labels);
        Console.WriteLine($"찾은 물체 수: {n - 1}");

        Cv2.ImShow("input", img);
        Cv2.ImShow("binary", binary);
        Cv2.WaitKey(0);
    }
}`;

  const EX_DRAW = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 검은 캔버스(480 x 640, 3채널 컬러)를 만들고 도형 · 글자를 그립니다
        using var canvas = new Mat(480, 640, MatType.CV_8UC3, Scalar.Black);
        Cv2.Rectangle(canvas, new Rect(60, 60, 240, 160), new Scalar(0, 255, 0), 3);   // BGR 순서: 초록
        Cv2.Circle(canvas, new Point(450, 150), 80, new Scalar(0, 0, 255), -1);          // -1 = 채우기, 빨강
        Cv2.Line(canvas, new Point(60, 300), new Point(580, 420), new Scalar(255, 200, 0), 2);
        Cv2.PutText(canvas, "OpenCV + C#", new Point(60, 280), HersheyFonts.HersheySimplex, 1.2, Scalar.White, 2);

        Vec3b px = canvas.At<Vec3b>(150, 450);        // (행 y, 열 x) 순서!
        Console.WriteLine($"픽셀 (y=150, x=450) = B:{px.Item0} G:{px.Item1} R:{px.Item2}");
        Cv2.ImShow("canvas", canvas);
        Cv2.WaitKey(0);
    }
}`;

  const EX_VS = `// Visual Studio 콘솔 프로젝트(.NET 8)에 OpenCvSharp4 를 설치한 뒤 Program.cs 에 붙여 넣으세요.
// 실행 폴더에 images/washers.png 가 있어야 합니다 (강좌 저장소의 assets/images 를 복사).
using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        if (img.Empty())
        {
            Console.WriteLine("이미지를 찾을 수 없습니다. 실행 폴더에 images/ 를 복사했는지 확인하세요.");
            return;
        }
        Cv2.ImShow("input", img);   // 로컬 PC 에서는 별도의 창이 열립니다
        Cv2.WaitKey(0);             // 아무 키를 누를 때까지 기다립니다
        Cv2.DestroyAllWindows();
    }
}`;

  const QUIZ = [
    { q: '이 강좌에서 OpenCV 를 호출할 때 쓰는 C# 라이브러리(NuGet 패키지)는?', options: ['Emgu.CV', 'OpenCvSharp4', 'System.Drawing', 'AForge.NET'], answer: 1,
      explain: '<b>OpenCvSharp4</b> 는 OpenCV 의 C# 래퍼입니다. Python 의 <code>cv2.cvtColor</code> 가 C# 에서는 <code>Cv2.CvtColor</code> 처럼 <b>PascalCase</b> 이름으로 대응됩니다.' },
    { q: 'OpenCV 에서 컬러 이미지를 읽었을 때 채널 순서는?', options: ['RGB', 'BGR', 'HSV', 'RGBA'], answer: 1,
      explain: 'OpenCV 는 역사적인 이유로 <b>BGR</b> 순서를 씁니다. <code>new Scalar(0, 0, 255)</code> 는 빨강입니다. WPF 의 <code>BitmapSource</code> 로 바꿀 때는 변환기가 순서를 처리합니다.' },
    { q: '<code>img.At&lt;byte&gt;(150, 450)</code> 은 어느 픽셀의 값인가?', options: ['x=150, y=450', 'y=150(행), x=450(열)', '150번째 채널', '450행 150열'], answer: 1,
      explain: 'Mat 의 <code>At&lt;T&gt;(row, col)</code> 은 <b>(행 y, 열 x)</b> 순서입니다. 반면 <code>new Point(x, y)</code> 처럼 OpenCV 함수의 점은 <b>(x, y)</b> 순서입니다 — 가장 흔한 실수입니다!' },
    { q: '브라우저 실습 환경에서 실행할 수 <u>없는</u> 코드는?', options: ['<code>Cv2.GaussianBlur</code> 로 흐리게 만들기', '<code>Cv2.FindContours</code> 로 윤곽선 찾기', 'WPF <code>Image</code> 컨트롤에 결과 표시하기', '<code>Console.ReadLine</code> 으로 값 입력받기'], answer: 2,
      explain: 'WPF 화면(Window · Image 컨트롤 · 대화상자)은 데스크톱 전용이므로 브라우저에서는 실행하지 않습니다. 그런 코드는 <b>🖥 Visual Studio 에서 실행</b> 표시가 있고, <code>wpf/</code> 폴더의 프로젝트로 제공됩니다.' }
  ];

  CS_COURSE.addChapter({
    id: 'cs00', no: '00', title: '시작하기: 강좌 안내와 실습 환경', subtitle: 'OpenCV · C# · WPF 의 관계와 이 사이트 사용법',
    summary: 'OpenCV 를 <b>C#(OpenCvSharp4)</b> 으로 다루고 <b>WPF</b> 앱에 붙이는 이 강좌의 전체 지도를 살펴보고, 브라우저 안에서 C# OpenCV 코드를 실행 · 수정하는 방법과 결과 창 · 작업 폴더 사용법을 익힙니다.',
    goals: ['OpenCV · OpenCvSharp · WPF 의 관계를 설명할 수 있다', '브라우저에서 C# OpenCvSharp 예제를 실행하고 수정할 수 있다', '이미지 창에서 좌표 · 픽셀 값을 확인하고, 코드를 Visual Studio 로 옮기는 방법을 안다'],
    sections: [
      {
        id: 'cs00-1', title: '강좌 안내와 실습 환경 둘러보기', minutes: 50,
        goals: ['이 강좌의 4개 Part 와 학습 순서를 말할 수 있다', 'C# 으로 첫 OpenCV 예제를 실행하고 결과 창을 읽을 수 있다', 'BGR 순서와 (행, 열) 좌표 규칙을 안다'],
        flow: [['도입: OpenCV 와 C#', 10], ['강좌 · 환경 안내', 10], ['첫 실행 · 그리기', 20], ['정리 · 퀴즈', 10]],
        content: [
          { type: 'h', text: 'OpenCV 를 C# 으로 배우면 무엇을 만들 수 있나?' },
          { type: 'p', html: '<b>OpenCV</b> 는 이미지와 영상을 처리하는 가장 널리 쓰이는 오픈소스 라이브러리입니다. 원래 C++ 로 만들어졌고 Python 으로 많이 배우지만, 산업 현장의 <b>검사 장비 · 계측 소프트웨어 · 장비 UI</b> 는 <b>C# · WPF</b> 로 만든 것이 아주 많습니다. C# 에서는 <b>OpenCvSharp4</b> 패키지로 OpenCV 의 거의 모든 기능을 같은 이름으로 쓸 수 있습니다.' },
          { type: 'figure', html: FIG_STACK, caption: '그림 1. WPF 앱 → OpenCvSharp(C# API) → OpenCV(C++). 이 사이트는 같은 API 이름을 브라우저에서 실행해 준다' },
          { type: 'table', head: ['Python (cv2)', 'C# (OpenCvSharp4)', '뜻'], rows: [
            ['<code>img = cv2.imread("a.png")</code>', '<code>var img = Cv2.ImRead("a.png");</code>', '이미지 읽기 (Mat)'],
            ['<code>cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)</code>', '<code>Cv2.CvtColor(img, gray, ColorConversionCodes.BGR2GRAY);</code>', '색 변환 — 출력 Mat 을 인수로 넘김'],
            ['<code>img.shape</code> → (h, w, ch)', '<code>img.Rows, img.Cols, img.Channels()</code>', '크기 · 채널'],
            ['<code>img[y, x]</code>', '<code>img.At&lt;Vec3b&gt;(y, x)</code> / <code>img.Get&lt;byte&gt;(y, x)</code>', '픽셀 접근 (행, 열)'],
            ['<code>cv2.imshow("w", img)</code>', '<code>Cv2.ImShow("w", img);</code>', '창에 표시'],
            ['<code>np.zeros((480,640,3), np.uint8)</code>', '<code>new Mat(480, 640, MatType.CV_8UC3, Scalar.Black)</code>', '빈 이미지 만들기']
          ], caption: '표 1. Python 과 C# 의 OpenCV 이름 대응 — 함수 이름은 PascalCase, 상수는 열거형(enum)으로 바뀐다' },
          { type: 'callout', kind: 'info', title: '강좌 구성 (18차시 · 4 Part)', html: '<ul><li><b>Part 1 준비</b> (00~02): Visual Studio · NuGet 설치 · 첫 프로그램 · WPF 화면에 이미지 띄우기</li><li><b>Part 2 OpenCV 기초</b> (03~11): Mat 과 픽셀 · 그리기 · 색 공간 · 밝기와 히스토그램 · 이진화 · 필터 · 모폴로지 · 에지 · 기하 변환</li><li><b>Part 3 분석과 검출</b> (12~15): 윤곽선과 도형 · 허프 변환 · 템플릿 매칭과 특징점 · 동영상과 카메라</li><li><b>Part 4 WPF 응용</b> (16~17): 이미지 처리 스튜디오 앱 · 실전 검사 프로젝트</li></ul>' },
          { type: 'h', text: '실습 환경: 설치 없이 브라우저에서' },
          { type: 'figure', html: FIG_UI, caption: '그림 2. 화면 구성 — 왼쪽 목차 · 가운데 강좌 내용과 C# 편집기 · 오른쪽 결과 창' },
          { type: 'list', items: [
            '<b>💠 C# 코드</b>: 예제의 <b>▶ 실행</b>을 누르면 아래 편집기로 코드가 들어가고 바로 실행됩니다. 편집기에서 값을 바꾸고 <kbd>Ctrl</kbd>+<kbd>Enter</kbd> 로 다시 실행하세요.',
            '<b>결과 창</b>: <code>Console.WriteLine</code> 출력과 <code>Cv2.ImShow</code> 이미지 창이 오른쪽에 나타납니다. 이미지 위에 마우스를 올리면 <b>(x, y) 좌표와 픽셀 값(B, G, R)</b>이, 누르면 <b>확대 보기</b>(픽셀 격자 · 값)가 열립니다.',
            '<b>📁 작업 폴더</b>: <code>images/</code> 폴더의 예제 이미지 목록을 보고, 내 PC 의 이미지를 올려 <code>Cv2.ImRead("내파일.png")</code> 로 쓸 수 있습니다. <code>Cv2.ImWrite</code> 로 저장한 파일도 여기서 내려받습니다.',
            '<b>Visual Studio 로 옮기기</b>: 편집기의 <b>⬇ .cs</b> 로 코드를 내려받아 콘솔 프로젝트의 <code>Program.cs</code> 에 붙이면 로컬 PC 의 정식 OpenCvSharp 에서 그대로 동작합니다 (01차시).'
          ] },
          { type: 'callout', kind: 'warn', title: '브라우저 실습 환경의 한계', html: '이 사이트는 <b>C# 인터프리터</b>가 OpenCvSharp 과 같은 API 를 OpenCV.js 위에서 실행합니다. 대부분의 C# 문법과 OpenCV 함수가 동작하지만 <b>WPF 화면 · 파일 대화상자 · 스레드 · 실제 웹캠 · dnn/ml 모듈</b>은 지원하지 않습니다. 그런 코드는 <span class="chip local-chip" style="font-size:11px">🖥 Visual Studio 에서 실행</span> 표시가 있고 <code>wpf/</code> 폴더의 프로젝트로 제공합니다. 실행 속도도 .NET 보다 느리므로 픽셀 하나씩 도는 반복은 작은 이미지에서만 해 보세요.' },
          { type: 'h', text: '첫 실행: 이미지 불러오고 물체 개수 세기' },
          { type: 'p', html: '아래 예제의 <b>▶ 실행</b>을 누르세요. 처음 한 번은 OpenCV(약 11MB)를 내려받느라 5~30초 걸립니다. 결과 창의 이미지 위에 마우스를 올려 배경(밝음)과 부품(어두움)의 픽셀 값을 비교해 보세요.' },
          { type: 'code', title: '예제 1: 이미지 정보 · 물체 개수', code: EX_FIRST,
            desc: '<code>images/washers.png</code> 는 백라이트로 찍은 와셔 · 너트 · 볼트 실루엣 합성 이미지입니다. <code>using var</code> 로 선언한 Mat 은 메서드가 끝날 때 자동으로 해제(Dispose)됩니다. <b>부품은 13개인데 결과는 11개</b>로 나옵니다 — 서로 <b>닿아 있는 부품 2쌍</b>이 하나의 덩어리로 세어졌기 때문입니다. 이런 문제를 푸는 방법은 12차시(윤곽선 · 거리 변환)에서 다룹니다.',
            expect: '크기: 640 x 480\n채널: 1, 형식: CV_8UC1\n밝기 최소/최대: 18 / 241\n평균 밝기: 191.8\n찾은 물체 수: 11' },
          { type: 'callout', kind: 'tip', title: '좌표 규칙 두 가지', html: '이미지의 원점 (0, 0) 은 <b>왼쪽 위</b>, x 는 오른쪽, y 는 아래쪽으로 커집니다. Mat 의 픽셀 접근 <code>img.At&lt;byte&gt;(y, x)</code> 는 <b>(행, 열)</b> 순서이지만, OpenCV 함수의 점 <code>new Point(x, y)</code> 와 <code>new Rect(x, y, w, h)</code> 는 <b>(x, y)</b> 순서입니다 — 가장 흔한 실수이니 꼭 기억하세요!' },
          { type: 'code', title: '예제 2: 캔버스에 그리기 (BGR 색 순서)', code: EX_DRAW, desc: 'OpenCV 의 색은 <b>(B, G, R)</b> 순서입니다. <code>new Scalar(0, 0, 255)</code> 가 빨강, <code>Scalar.Red</code> 도 같은 값입니다. 두께에 <code>-1</code> 을 주면 안을 채웁니다.',
            expect: '픽셀 (y=150, x=450) = B:0 G:0 R:255' },
          { type: 'h', text: '로컬 PC 에서 실행하려면' },
          { type: 'code', title: '추가: Visual Studio 콘솔 프로젝트에서 같은 코드 실행하기', code: EX_VS, run: false, local: true, file: 'Program.cs',
            desc: '로컬 PC 에서는 <code>Cv2.ImShow</code> 가 <b>실제 창</b>을 열고 <code>Cv2.WaitKey(0)</code> 이 키를 누를 때까지 기다립니다. 브라우저에서는 결과 창에 이미지가 나오고 <code>WaitKey</code> 는 바로 돌아옵니다 — 코드는 같습니다. 패키지 설치는 01차시에서 단계별로 합니다.' },
          { type: 'callout', kind: 'vs', title: '준비물', html: '<ul><li><b>Visual Studio 2022</b> Community (무료) + <b>.NET 데스크톱 개발</b> 워크로드 (.NET 8)</li><li>NuGet 패키지: <code>OpenCvSharp4</code>, <code>OpenCvSharp4.runtime.win</code>, WPF 용 <code>OpenCvSharp4.WpfExtensions</code></li><li>이 저장소의 <code>assets/images</code> 폴더 (예제 이미지) 와 <code>wpf/</code> 폴더 (완성 프로젝트)</li></ul>' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 체크리스트', html: '<ul><li>수업 전 교사 PC 에서 예제를 한 번 실행해 OpenCV(11MB) 를 캐시에 채워 둡니다.</li><li>교실 네트워크가 느리면 <code>start-lan.bat</code> 으로 교사 PC 를 서버로 쓰세요 (학생은 교사 PC 주소로 접속).</li><li>학생 PC 에 Visual Studio 가 설치되어 있는지, NuGet 이 회사 방화벽에 막히지 않는지 미리 확인합니다 (01차시).</li><li>💬 발문: “공장에서 카메라로 하는 일에는 무엇이 있을까?” — 불량 검사, 바코드 읽기, 로봇 위치 맞추기, 치수 측정.</li></ul>' }
        ],
        practice: [
          {
            title: '다른 이미지로 평균 밝기와 물체 개수 구하기', level: 1,
            desc: '<code>images/washers.png</code> 대신 <code>images/coins_parts.png</code> 를 불러와 크기 · 평균 밝기 · 물체 개수를 출력하세요. 부품이 배경보다 밝은지 어두운지 결과 창에서 확인하고, 필요하면 <code>ThresholdTypes.BinaryInv</code> 를 <code>ThresholdTypes.Binary</code> 로 바꾸세요.',
            hint: '결과 창에서 이미지 위에 마우스를 올리면 픽셀 값이 보입니다. 물체가 배경보다 <b>밝으면</b> Binary, <b>어두우면</b> BinaryInv 입니다. coins_parts 는 어두운 배경 위의 밝은 부품 12개입니다.',
            expect: '크기: 640 x 480, 평균 밝기: 45.3\nOtsu 임계값: 105, 물체 수: 12',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        // TODO: 크기와 평균 밝기를 출력하세요 (평균은 소수 첫째 자리까지)

        // TODO: Otsu 이진화 후 ConnectedComponents 로 물체 개수를 출력하세요
        using var binary = new Mat();

        Cv2.ImShow("input", img);   // 이진화 결과를 만들었으면 binary 로 바꿔 보세요
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        Console.WriteLine($"크기: {img.Width} x {img.Height}, 평균 밝기: {Cv2.Mean(img).Val0:F1}");

        using var binary = new Mat();
        double t = Cv2.Threshold(img, binary, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        using var labels = new Mat();
        int n = Cv2.ConnectedComponents(binary, labels);
        Console.WriteLine($"Otsu 임계값: {t}, 물체 수: {n - 1}");

        Cv2.ImShow("binary", binary);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ,
        slides: [
          { layout: 'title', title: 'C# WPF 로 배우는 OpenCV', subtitle: '시작하기: 강좌 안내와 실습 환경', notes: '<p>강좌를 소개합니다. 💬 “공장이나 병원에서 카메라로 자동으로 하는 일에는 무엇이 있을까요?” — 예상 답: 불량 검사, 바코드 · QR 읽기, 얼굴 인식, 로봇 위치 맞추기. 이런 프로그램의 화면(UI)은 C# WPF 로 만드는 경우가 많다는 점을 강조합니다.</p>' },
          { layout: 'bullets', title: 'OpenCV 를 C# 으로?', lead: '산업 현장 소프트웨어의 언어', bullets: [
            '<b>OpenCV</b>: 이미지 · 영상 처리 라이브러리 (C++ · 무료 · 사실상 표준)',
            '<b>OpenCvSharp4</b>: OpenCV 를 C# 에서 쓰게 해 주는 래퍼 — 함수 이름이 <code>Cv2.CvtColor</code> 처럼 PascalCase',
            '<b>WPF</b>: Windows 데스크톱 화면(UI) 기술 — 검사 장비 · 계측 소프트웨어의 화면',
            ['이 강좌의 목표', ['OpenCV 핵심 기능을 C# 으로 익힌다', 'WPF 앱에 붙여 이미지 처리 프로그램을 완성한다']]
          ], notes: '<p>Python 으로 OpenCV 를 배운 학생이 있으면 “이름만 PascalCase 로 바뀐다”고 안심시킵니다. 💬 “왜 현장 프로그램은 C# 이 많을까?” — Windows 장비 PC · 기존 시스템 · 강력한 UI 도구(WPF). (5분)</p>' },
          { layout: 'diagram', title: 'WPF 앱 → OpenCvSharp → OpenCV', html: FIG_STACK, caption: '왼쪽: 로컬 PC 의 WPF 앱 구조 · 오른쪽: 이 사이트의 브라우저 실행 환경 — 같은 코드가 양쪽에서 동작', notes: '<p>세 층을 짚어 줍니다: 화면(XAML) → C# 코드 → OpenCvSharp → 네이티브 OpenCV DLL. 브라우저 환경은 OpenCvSharp 과 같은 이름의 API 를 OpenCV.js 위에서 실행하므로 <b>코드가 같다</b>는 점이 핵심입니다. WPF 화면 부분만 브라우저에서 못 돌립니다.</p>' },
          { layout: 'table', title: 'Python cv2 ↔ C# OpenCvSharp', head: ['Python', 'C#', '뜻'], rows: [
            ['<code>cv2.imread(p)</code>', '<code>Cv2.ImRead(p)</code>', '읽기'],
            ['<code>cv2.cvtColor(a, code)</code>', '<code>Cv2.CvtColor(a, dst, code)</code>', '색 변환 (출력 Mat 을 넘김)'],
            ['<code>img.shape</code>', '<code>img.Rows / Cols / Channels()</code>', '크기'],
            ['<code>img[y, x]</code>', '<code>img.At&lt;Vec3b&gt;(y, x)</code>', '픽셀 (행, 열)'],
            ['<code>cv2.imshow</code>', '<code>Cv2.ImShow</code>', '표시']
          ], notes: '<p>규칙 3개: ① 함수는 PascalCase ② 상수는 열거형(<code>ColorConversionCodes.BGR2GRAY</code>) ③ 결과를 돌려주는 대신 <b>출력 Mat 을 인수로</b> 넘기는 함수가 많다(<code>new Mat()</code> 을 먼저 만든다). (5분)</p>' },
          { layout: 'diagram', title: '이 사이트의 화면 구성', html: FIG_UI, caption: '왼쪽 목차 · 가운데 문서와 C# 편집기 · 오른쪽 결과 창', notes: '<p>실제 화면을 함께 보며 위치를 짚어 줍니다. 결과 창의 이미지 위에서 마우스를 움직여 좌표 · 픽셀 값이 바뀌는 것을 보여 주고, 클릭해서 확대 보기를 시연합니다. (5분)</p>' },
          { layout: 'code', title: '첫 실행: 이미지 읽고 정보 출력', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        Console.WriteLine($"크기: {img.Width} x {img.Height}");
        Console.WriteLine($"채널: {img.Channels()}, 형식: {img.Type()}");
        Console.WriteLine($"평균 밝기: {Cv2.Mean(img).Val0:F1}");

        using var binary = new Mat();
        Cv2.Threshold(img, binary, 0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        using var labels = new Mat();
        int n = Cv2.ConnectedComponents(binary, labels);
        Console.WriteLine($"찾은 물체 수: {n - 1}");

        Cv2.ImShow("input", img);
        Cv2.ImShow("binary", binary);
        Cv2.WaitKey(0);
    }
}`, points: ['<code>using var</code>: 메서드가 끝나면 Mat 자동 해제', '<code>ImreadModes.Grayscale</code> → 1채널 <code>CV_8UC1</code>', '이진화 → 연결 요소 = 물체 개수 (13개 중 <b>11개</b>: 닿은 부품이 합쳐짐)'], notes: '<p>▶ 실행을 누르고 처음 로딩(OpenCV 내려받기)을 기다리는 동안 코드를 한 줄씩 읽습니다. 결과가 나오면 “왜 13개가 아니고 11개일까?” 💬 — 서로 닿은 부품 2쌍. 이 문제는 12차시에서 해결한다고 예고. 학생들에게 <code>Grayscale</code> 을 <code>Color</code> 로 바꿔 실행해 보게 합니다(채널 3 · CV_8UC3, 이진화는 오류 → 채널 수 규칙 예고). (10분)</p>' },
          { layout: 'code', title: '캔버스에 그리기: BGR 순서', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var canvas = new Mat(480, 640, MatType.CV_8UC3, Scalar.Black);
        Cv2.Rectangle(canvas, new Rect(60, 60, 240, 160), new Scalar(0, 255, 0), 3);
        Cv2.Circle(canvas, new Point(450, 150), 80, new Scalar(0, 0, 255), -1);
        Cv2.Line(canvas, new Point(60, 300), new Point(580, 420), new Scalar(255, 200, 0), 2);
        Cv2.PutText(canvas, "OpenCV + C#", new Point(60, 280),
                    HersheyFonts.HersheySimplex, 1.2, Scalar.White, 2);

        Vec3b px = canvas.At<Vec3b>(150, 450);   // (행 y, 열 x)
        Console.WriteLine($"B:{px.Item0} G:{px.Item1} R:{px.Item2}");
        Cv2.ImShow("canvas", canvas);
        Cv2.WaitKey(0);
    }
}`, points: ['<code>new Scalar(B, G, R)</code> — 파랑 · 초록 · 빨강 순서', '<code>new Mat(행 수, 열 수, 형식, 초기값)</code>', '두께 <code>-1</code> = 채우기', '<code>At&lt;Vec3b&gt;(y, x)</code> 는 (행, 열)!'], notes: '<p>색 값을 바꿔 보게 합니다: <code>new Scalar(255, 0, 0)</code> 은 무엇일까? 💬 — 파랑(BGR). 원의 중심 (450, 150) 과 <code>At(150, 450)</code> 의 순서가 다른 점을 강조합니다. (10분)</p>' },
          { layout: 'two', title: '브라우저 vs Visual Studio', left: { title: '🌐 브라우저 (이 사이트)', bullets: ['설치 없이 바로 실행', '<code>Cv2.ImShow</code> → 결과 창의 이미지 창', '<code>Cv2.WaitKey(0)</code> 은 바로 돌아옴', '픽셀 값 · 확대 보기로 결과 분석', '❌ WPF 화면 · 파일 대화상자 · 웹캠'] }, right: { title: '🖥 Visual Studio (로컬 PC)', bullets: ['NuGet: OpenCvSharp4 + runtime.win', '<code>Cv2.ImShow</code> → 실제 창, <code>WaitKey</code> 는 키 대기', '⬇ .cs 로 내려받아 Program.cs 에 붙이기', 'WPF 프로젝트(<code>wpf/</code> 폴더)로 화면 완성', '실제 속도 (수십 배 빠름)'] }, notes: '<p>두 환경의 역할을 나눕니다: 브라우저에서 알고리즘을 익히고 → Visual Studio 에서 앱을 완성. 01차시에서 설치 · 첫 프로젝트를 만들 것이라고 예고합니다.</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>img.At&lt;byte&gt;(150, 450)</code> 은 어느 픽셀의 값인가?', options: ['x=150, y=450', 'y=150(행), x=450(열)', '150번째 채널', '450행 150열'], answer: 1, explain: '<code>At&lt;T&gt;(row, col)</code> 은 (행 y, 열 x). 함수의 점 <code>new Point(x, y)</code> 는 (x, y) 순서!', notes: '<p>정답 2번. 손을 들어 답하게 하고, 틀린 학생에게 예제 2 의 원 중심 좌표와 비교해 설명합니다.</p>' },
          { layout: 'practice', title: '실습: coins_parts.png 로 바꿔 보기', desc: '<p><code>images/coins_parts.png</code> 를 불러와 크기 · 평균 밝기 · 물체 개수를 출력하세요.</p><ul><li>부품이 배경보다 <b>밝으면</b> <code>ThresholdTypes.Binary</code></li><li>결과 창에서 픽셀 값을 확인해 판단</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        // TODO: 크기 · 평균 밝기 출력

        // TODO: Otsu 이진화 → ConnectedComponents 로 개수 출력
        using var binary = new Mat();

        Cv2.ImShow("input", img);
        Cv2.WaitKey(0);
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/coins_parts.png", ImreadModes.Grayscale);
        Console.WriteLine($"크기: {img.Width} x {img.Height}, 평균 밝기: {Cv2.Mean(img).Val0:F1}");
        using var binary = new Mat();
        double t = Cv2.Threshold(img, binary, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        using var labels = new Mat();
        int n = Cv2.ConnectedComponents(binary, labels);
        Console.WriteLine($"Otsu 임계값: {t}, 물체 수: {n - 1}");
        Cv2.ImShow("binary", binary);
        Cv2.WaitKey(0);
    }
}`, notes: '<p>정답: 물체 12개, Otsu 임계값 105. BinaryInv 를 그대로 두면 배경이 하나의 큰 물체로 잡혀 개수가 1~2 로 나옵니다 — 그 결과를 보여 주며 “배경/물체 밝기에 따라 반전 여부를 정한다”를 정리합니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['OpenCV(C++) 를 C# 에서 쓰는 라이브러리 = <b>OpenCvSharp4</b>, 화면은 <b>WPF</b>', '함수는 PascalCase · 상수는 열거형 · 출력 Mat 을 인수로 넘긴다', '색은 <b>BGR</b>, 픽셀 접근은 <b>(행 y, 열 x)</b>, 함수의 점은 <b>(x, y)</b>', '브라우저에서 익히고 → Visual Studio 에서 완성 (⬇ .cs)', '다음 시간: Visual Studio · NuGet 으로 OpenCvSharp 설치하기'], notes: '<p>세 가지 규칙(PascalCase · BGR · 좌표 순서)을 다시 읽게 합니다. 다음 차시 준비물: Visual Studio 2022 설치 여부 확인. (2분)</p>' }
        ]
      }
    ]
  });
})();
