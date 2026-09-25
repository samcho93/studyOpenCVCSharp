/* 01차시 Visual Studio · NuGet 으로 OpenCvSharp 설치하기 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 설치 흐름 5단계
  const FIG_INSTALL = `<svg viewBox="0 0 760 250" role="img" aria-label="설치 흐름: Visual Studio 설치, 콘솔 프로젝트, NuGet 패키지, Program.cs, images 폴더 복사 후 실행">
  ${ARROW('c01a1')}
  <rect x="10" y="10" width="740" height="230" rx="12" class="card-bg"/>
  <rect x="24" y="40" width="130" height="90" rx="10" class="p1s"/><text x="89" y="66" text-anchor="middle" class="tx-b">① Visual Studio</text><text x="89" y="88" text-anchor="middle" class="tx-m">2022 Community</text><text x="89" y="108" text-anchor="middle" class="tx-m">.NET 데스크톱 개발</text>
  <line x1="156" y1="85" x2="170" y2="85" class="ln" stroke-width="2" marker-end="url(#c01a1)"/>
  <rect x="172" y="40" width="130" height="90" rx="10" class="p2s"/><text x="237" y="66" text-anchor="middle" class="tx-b">② 프로젝트</text><text x="237" y="88" text-anchor="middle" class="tx-m">콘솔 앱 (.NET 8)</text><text x="237" y="108" text-anchor="middle" class="tx-m">이름: OpenCvFirst</text>
  <line x1="304" y1="85" x2="318" y2="85" class="ln" stroke-width="2" marker-end="url(#c01a1)"/>
  <rect x="320" y="40" width="130" height="90" rx="10" class="p3s"/><text x="385" y="66" text-anchor="middle" class="tx-b">③ NuGet</text><text x="385" y="88" text-anchor="middle" class="tx-m">OpenCvSharp4</text><text x="385" y="108" text-anchor="middle" class="tx-m">OpenCvSharp4.runtime.win</text>
  <line x1="452" y1="85" x2="466" y2="85" class="ln" stroke-width="2" marker-end="url(#c01a1)"/>
  <rect x="468" y="40" width="130" height="90" rx="10" class="p4s"/><text x="533" y="66" text-anchor="middle" class="tx-b">④ Program.cs</text><text x="533" y="88" text-anchor="middle" class="tx-m">ImRead → ImShow</text><text x="533" y="108" text-anchor="middle" class="tx-m">→ WaitKey</text>
  <line x1="600" y1="85" x2="614" y2="85" class="ln" stroke-width="2" marker-end="url(#c01a1)"/>
  <rect x="616" y="40" width="120" height="90" rx="10" class="p5s"/><text x="676" y="66" text-anchor="middle" class="tx-b">⑤ 실행 (F5)</text><text x="676" y="88" text-anchor="middle" class="tx-m">bin/Debug/net8.0/</text><text x="676" y="108" text-anchor="middle" class="tx-m">images/ 복사</text>
  <rect x="24" y="150" width="712" height="70" rx="10" class="p1s"/>
  <text x="380" y="176" text-anchor="middle" class="tx-b">한 번만 하면 되는 일: ①  ·  프로젝트마다 하는 일: ② ③ ⑤  ·  매번 바뀌는 것: ④</text>
  <text x="380" y="202" text-anchor="middle" class="tx-m">이 사이트에서 익힌 C# 코드는 ④ 에 그대로 붙여 넣으면 됩니다 (⬇ .cs 내려받기)</text>
</svg>`;

  // 그림 2: 패키지 3층 구조 — 내 코드 → OpenCvSharp4(관리) → runtime.win(네이티브) → OpenCV C++
  const FIG_PACKAGES = `<svg viewBox="0 0 760 300" role="img" aria-label="OpenCvSharp4 패키지 구조: 내 코드, OpenCvSharp4 관리 코드, runtime.win 네이티브 DLL, OpenCV C++">
  ${ARROW('c01a2')}
  <rect x="10" y="10" width="480" height="280" rx="12" class="card-bg"/>
  <rect x="30" y="30" width="440" height="50" rx="10" class="p1s"/><text x="250" y="52" text-anchor="middle" class="tx-b">내 코드 Program.cs</text><text x="250" y="70" text-anchor="middle" class="tx-m">Cv2.ImRead(...) · new Mat() · img.CvtColor(...)</text>
  <line x1="250" y1="82" x2="250" y2="96" class="ln" stroke-width="2" marker-end="url(#c01a2)"/>
  <rect x="30" y="98" width="440" height="50" rx="10" class="p2s"/><text x="250" y="120" text-anchor="middle" class="tx-b">OpenCvSharp4 (NuGet) — OpenCvSharp.dll</text><text x="250" y="138" text-anchor="middle" class="tx-m">C# 관리 코드: Mat · Cv2 · 열거형 (Any CPU)</text>
  <line x1="250" y1="150" x2="250" y2="164" class="ln" stroke-width="2" marker-end="url(#c01a2)"/>
  <text x="330" y="162" class="tx-m">P/Invoke (DllImport)</text>
  <rect x="30" y="166" width="440" height="50" rx="10" class="p3s"/><text x="250" y="188" text-anchor="middle" class="tx-b">OpenCvSharp4.runtime.win — OpenCvSharpExtern.dll</text><text x="250" y="206" text-anchor="middle" class="tx-m">네이티브 DLL: runtimes/win-x64/native/ · win-x86/native/</text>
  <line x1="250" y1="218" x2="250" y2="232" class="ln" stroke-width="2" marker-end="url(#c01a2)"/>
  <rect x="30" y="234" width="440" height="44" rx="10" class="p4s"/><text x="250" y="262" text-anchor="middle" class="tx">OpenCV 4.x C++ (core · imgproc · imgcodecs · highgui …)</text>
  <rect x="510" y="10" width="240" height="280" rx="12" class="card-bg"/>
  <text x="630" y="40" text-anchor="middle" class="tx-b">빠지면 생기는 오류</text>
  <rect x="524" y="60" width="212" height="64" rx="8" class="p3s"/><text x="630" y="82" text-anchor="middle" class="tx">runtime.win 없음</text><text x="630" y="102" text-anchor="middle" class="tx-m">→ DllNotFoundException</text>
  <rect x="524" y="136" width="212" height="64" rx="8" class="p5s"/><text x="630" y="158" text-anchor="middle" class="tx">x86 앱 + x64 DLL</text><text x="630" y="178" text-anchor="middle" class="tx-m">→ BadImageFormatException</text>
  <rect x="524" y="212" width="212" height="64" rx="8" class="p2s"/><text x="630" y="234" text-anchor="middle" class="tx">images/ 폴더 없음</text><text x="630" y="254" text-anchor="middle" class="tx-m">→ 빈 Mat (Empty() = true)</text>
</svg>`;

  // 그림 3: 프로젝트 폴더와 실행 폴더
  const FIG_FOLDER = `<svg viewBox="0 0 760 290" role="img" aria-label="프로젝트 폴더와 실행 폴더 bin/Debug/net8.0 의 구조">
  ${ARROW('c01a3')}
  <rect x="10" y="10" width="350" height="270" rx="12" class="card-bg"/>
  <text x="185" y="38" text-anchor="middle" class="tx-b">📁 프로젝트 폴더 OpenCvFirst/</text>
  <text x="34" y="70" class="tx">├ OpenCvFirst.csproj</text>
  <text x="34" y="96" class="tx">├ Program.cs</text>
  <text x="34" y="122" class="tx">├ images/</text><text x="120" y="122" class="tx-m">← 원본 (sample_color.png …)</text>
  <text x="34" y="148" class="tx">└ bin/Debug/net8.0/</text><text x="200" y="148" class="tx-m">← 실행 폴더</text>
  <rect x="34" y="160" width="300" height="108" rx="8" class="p2s"/>
  <text x="50" y="184" class="tx">  ├ OpenCvFirst.exe · .dll</text>
  <text x="50" y="208" class="tx">  ├ OpenCvSharp.dll</text>
  <text x="50" y="232" class="tx">  ├ runtimes/win-x64/native/OpenCvSharpExtern.dll</text>
  <text x="50" y="256" class="tx-b">  └ images/  ← 여기에 있어야 함!</text>
  <rect x="390" y="10" width="360" height="270" rx="12" class="card-bg"/>
  <text x="570" y="38" text-anchor="middle" class="tx-b">상대 경로는 실행 폴더 기준</text>
  <rect x="404" y="54" width="332" height="56" rx="8" class="p1s"/><text x="570" y="78" text-anchor="middle" class="tx">Cv2.ImRead("images/sample_color.png")</text><text x="570" y="98" text-anchor="middle" class="tx-m">= 실행 폴더 + images/sample_color.png</text>
  <line x1="570" y1="112" x2="570" y2="128" class="ln" stroke-width="2" marker-end="url(#c01a3)"/>
  <rect x="404" y="130" width="332" height="60" rx="8" class="p4s"/><text x="570" y="154" text-anchor="middle" class="tx-b">해결 3가지</text><text x="570" y="176" text-anchor="middle" class="tx-m">① images/ 를 bin 폴더에 복사  ② csproj 로 자동 복사</text>
  <text x="570" y="212" text-anchor="middle" class="tx-m">③ 절대 경로 사용  예) @"C:\\data\\images\\a.png"</text>
  <rect x="404" y="226" width="332" height="44" rx="8" class="p3s"/><text x="570" y="254" text-anchor="middle" class="tx-m">읽기 실패는 예외가 아니라 빈 Mat → Empty() 로 검사!</text>
</svg>`;

  // 그림 4: Mat 은 네이티브 메모리를 쥔 핸들
  const FIG_MAT_MEM = `<svg viewBox="0 0 760 290" role="img" aria-label="Mat 객체는 .NET 관리 힙에 있고, 픽셀 데이터는 네이티브 힙에 있어 Dispose 로 해제해야 함">
  ${ARROW('c01a4')}
  <rect x="10" y="10" width="330" height="270" rx="12" class="card-bg"/>
  <text x="175" y="38" text-anchor="middle" class="tx-b">.NET 관리 힙 (GC 가 관리)</text>
  <rect x="40" y="56" width="270" height="130" rx="10" class="p1s"/>
  <text x="175" y="82" text-anchor="middle" class="tx-b">Mat 객체 (작다, 수십 바이트)</text>
  <text x="60" y="108" class="tx">Rows = 480, Cols = 640</text>
  <text x="60" y="132" class="tx">Type = CV_8UC3</text>
  <text x="60" y="156" class="tx">ptr → 네이티브 cv::Mat</text>
  <text x="175" y="216" text-anchor="middle" class="tx-m">GC 는 이 작은 객체만 봅니다.</text>
  <text x="175" y="238" text-anchor="middle" class="tx-m">오른쪽 큰 메모리는 GC 의 관심 밖!</text>
  <line x1="312" y1="150" x2="408" y2="150" class="ln" stroke-width="2.5" marker-end="url(#c01a4)"/>
  <text x="360" y="140" text-anchor="middle" class="tx-m">포인터</text>
  <rect x="410" y="10" width="340" height="270" rx="12" class="card-bg"/>
  <text x="580" y="38" text-anchor="middle" class="tx-b">네이티브 힙 (C++ OpenCV)</text>
  <rect x="430" y="56" width="300" height="130" rx="10" class="p3s"/>
  <text x="580" y="82" text-anchor="middle" class="tx-b">픽셀 데이터 (크다!)</text>
  <text x="580" y="110" text-anchor="middle" class="tx">480 × 640 × 3 = 921,600 바이트</text>
  <text x="580" y="134" text-anchor="middle" class="tx-m">B G R B G R B G R … 행 순서로 연속</text>
  <text x="580" y="160" text-anchor="middle" class="tx-m">4K 컬러 한 장 ≈ 25 MB</text>
  <rect x="430" y="200" width="300" height="60" rx="10" class="p4s"/>
  <text x="580" y="224" text-anchor="middle" class="tx-b">using / Dispose() → 즉시 해제</text>
  <text x="580" y="246" text-anchor="middle" class="tx-m">안 하면 카메라 반복 중 메모리가 계속 늘어난다</text>
</svg>`;

  // 그림 5: 호출 규약 — 출력 Mat 을 인수로 vs 확장 메서드 반환
  const FIG_CALL = `<svg viewBox="0 0 760 260" role="img" aria-label="OpenCvSharp 호출 규약 두 가지: Cv2 정적 함수에 출력 Mat 을 인수로 넘기기, 확장 메서드가 새 Mat 을 반환하기">
  ${ARROW('c01a5')}
  <rect x="10" y="10" width="740" height="115" rx="12" class="card-bg"/>
  <text x="30" y="36" class="tx-b">스타일 A · Cv2 정적 함수 (C++ OpenCV 와 같은 모양)</text>
  <rect x="30" y="52" width="120" height="50" rx="8" class="p1s"/><text x="90" y="74" text-anchor="middle" class="tx">src (Mat)</text><text x="90" y="92" text-anchor="middle" class="tx-m">입력</text>
  <line x1="152" y1="77" x2="188" y2="77" class="ln" stroke-width="2" marker-end="url(#c01a5)"/>
  <rect x="190" y="52" width="330" height="50" rx="8" class="p2s"/><text x="355" y="74" text-anchor="middle" class="tx">Cv2.CvtColor(src, dst, ColorConversionCodes.BGR2GRAY)</text><text x="355" y="92" text-anchor="middle" class="tx-m">반환값 void — 결과는 dst 에 채워진다</text>
  <line x1="522" y1="77" x2="558" y2="77" class="ln" stroke-width="2" marker-end="url(#c01a5)"/>
  <rect x="560" y="52" width="170" height="50" rx="8" class="p3s"/><text x="645" y="74" text-anchor="middle" class="tx">dst = new Mat()</text><text x="645" y="92" text-anchor="middle" class="tx-m">미리 만든 빈 출력 Mat</text>
  <rect x="10" y="135" width="740" height="115" rx="12" class="card-bg"/>
  <text x="30" y="161" class="tx-b">스타일 B · 확장 메서드 (OpenCvSharp 전용 — 짧고 연결(chain) 가능)</text>
  <rect x="30" y="177" width="120" height="50" rx="8" class="p1s"/><text x="90" y="199" text-anchor="middle" class="tx">src (Mat)</text><text x="90" y="217" text-anchor="middle" class="tx-m">입력</text>
  <line x1="152" y1="202" x2="188" y2="202" class="ln" stroke-width="2" marker-end="url(#c01a5)"/>
  <rect x="190" y="177" width="330" height="50" rx="8" class="p2s"/><text x="355" y="199" text-anchor="middle" class="tx">using var gray = src.CvtColor(ColorConversionCodes.BGR2GRAY);</text><text x="355" y="217" text-anchor="middle" class="tx-m">새 Mat 을 돌려준다 → 받은 쪽이 Dispose 책임</text>
  <line x1="522" y1="202" x2="558" y2="202" class="ln" stroke-width="2" marker-end="url(#c01a5)"/>
  <rect x="560" y="177" width="170" height="50" rx="8" class="p3s"/><text x="645" y="199" text-anchor="middle" class="tx">gray (새 Mat)</text><text x="645" y="217" text-anchor="middle" class="tx-m">src.Blur(...).Canny(...) 연결</text>
</svg>`;

  // ---------------------------------------------------------------- 1교시 코드
  const SH_DOTNET = `# 새 콘솔 프로젝트 만들기 (.NET 8, 최상위 문 대신 Main 메서드 사용)
dotnet new console -n OpenCvFirst -f net8.0 --use-program-main
cd OpenCvFirst

# OpenCvSharp 패키지 2개 설치 (C# API + Windows 네이티브 DLL)
dotnet add package OpenCvSharp4
dotnet add package OpenCvSharp4.runtime.win

# 빌드 · 실행
dotnet run`;

  const XML_CSPROJ = `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <!-- NuGet 이 추가한 패키지 참조 (버전은 설치 시점의 최신) -->
    <PackageReference Include="OpenCvSharp4" Version="4.10.0.20241108" />
    <PackageReference Include="OpenCvSharp4.runtime.win" Version="4.10.0.20241108" />
  </ItemGroup>

  <ItemGroup>
    <!-- images 폴더의 모든 파일을 빌드할 때 실행 폴더로 복사 -->
    <Content Include="images/**">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </Content>
  </ItemGroup>

</Project>`;

  const EX_PROGRAM_CS = `// Program.cs — Visual Studio 콘솔 프로젝트에서 실행하는 첫 OpenCvSharp 프로그램
using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 상대 경로는 실행 폴더(bin/Debug/net8.0) 기준입니다
        using var img = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        if (img.Empty())
        {
            Console.WriteLine("이미지를 읽지 못했습니다. bin/Debug/net8.0/images 폴더를 확인하세요.");
            return;
        }
        Console.WriteLine($"읽기 성공: {img.Width} x {img.Height}, {img.Channels()}채널");

        Cv2.ImShow("first", img);     // 로컬 PC: 새 창이 열립니다
        Cv2.WaitKey(0);               // 키를 누를 때까지 대기 (0 = 무한)
        Cv2.DestroyAllWindows();      // 창 닫기
    }
}`;

  const EX_INFO = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 1) 읽기: 모드를 생략하면 ImreadModes.Color → 3채널 BGR
        using var img = Cv2.ImRead("images/sample_color.png");

        // 2) 정보 출력 — Visual Studio 에서는 조사식(Watch)에서도 같은 값을 볼 수 있습니다
        Console.WriteLine($"Width x Height : {img.Width} x {img.Height}");
        Console.WriteLine($"Rows, Cols     : {img.Rows}, {img.Cols}");
        Console.WriteLine($"Channels       : {img.Channels()}");
        Console.WriteLine($"Type           : {img.Type()}");
        Console.WriteLine($"Empty          : {img.Empty()}");
        Console.WriteLine(img);   // Mat.ToString() = 크기 · 형식 요약

        // 3) 보기
        Cv2.ImShow("sample_color", img);
        Cv2.WaitKey(0);
        Cv2.DestroyAllWindows();
    }
}`;

  const EX_EMPTY = `using System;
using System.IO;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 두 번째 경로는 폴더 이름 오타(image), 세 번째는 파일 이름 오타(colour)
        string[] paths = { "images/sample_color.png", "image/sample_color.png", "images/sample_colour.png" };

        foreach (string path in paths)
        {
            Console.WriteLine($"[{path}]  File.Exists = {File.Exists(path)}");
            using var img = Cv2.ImRead(path);
            if (img.Empty())
            {
                // ImRead 는 실패해도 예외를 던지지 않고 '빈 Mat' 을 돌려줍니다
                Console.WriteLine("   -> 빈 Mat! 경로 · 파일 이름 · 실행 폴더를 확인하세요.");
                continue;
            }
            Console.WriteLine($"   -> OK  {img.Width} x {img.Height}, {img.Channels()}채널");
        }
    }
}`;

  const EX_TRYCATCH = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/no_such_file.png");
        Console.WriteLine($"Empty = {img.Empty()}");
        try
        {
            // 빈 Mat 을 창에 표시하려 하면 OpenCV 가 예외(OpenCVException)를 던집니다
            Cv2.ImShow("window", img);
            Cv2.WaitKey(0);
            Console.WriteLine("이 줄은 실행되지 않습니다");
        }
        catch (OpenCVException e)
        {
            Console.WriteLine("OpenCVException 발생!");
            Console.WriteLine("메시지: " + e.Message);
        }
        finally
        {
            Console.WriteLine("finally: 창 정리");
            Cv2.DestroyAllWindows();
        }
        Console.WriteLine("프로그램은 정상 종료");
    }
}`;

  const EX_MANY = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 강좌 예제 이미지 몇 개의 정보를 표로 출력 (Unchanged = 파일 그대로의 채널 수)
        string[] files = { "images/sample_color.png", "images/sample_gray.png",
                           "images/washers.png", "images/plate_holes.png" };
        Console.WriteLine($"{"파일",-26} {"너비",5} {"높이",5}  채널  형식");
        foreach (string f in files)
        {
            using var m = Cv2.ImRead(f, ImreadModes.Unchanged);
            Console.WriteLine($"{f,-26} {m.Width,5} {m.Height,5}  {m.Channels(),3}   {m.Type()}");
        }
    }
}`;

  // ---------------------------------------------------------------- 2교시 코드
  const EX_DISPOSE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 방법 1: using 선언 — 이 블록(Main)이 끝날 때 자동으로 Dispose
        using var a = new Mat(480, 640, MatType.CV_8UC3, new Scalar(0, 0, 0));
        Console.WriteLine($"a: {a.Rows}x{a.Cols} {a.Type()}, IsDisposed={a.IsDisposed}");

        // 방법 2: using 블록 — 중괄호를 벗어나는 순간 Dispose
        Mat keep;
        using (var b = new Mat(100, 100, MatType.CV_8UC1))
        {
            keep = b;      // 참조만 복사 — 같은 네이티브 메모리를 가리킨다
            Console.WriteLine($"b 블록 안: IsDisposed={b.IsDisposed}");
        }
        Console.WriteLine($"b 블록 밖: IsDisposed={keep.IsDisposed}");

        // 방법 3: 직접 Dispose — 그 뒤에는 쓸 수 없다
        var c = new Mat(10, 10, MatType.CV_8UC1);
        c.Dispose();
        try
        {
            Console.WriteLine(c.Rows);
        }
        catch (ObjectDisposedException)
        {
            Console.WriteLine("c: Dispose 된 Mat 을 쓰면 ObjectDisposedException!");
        }
    }
}`;

  const EX_ENUM = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 열거형(enum) 은 '이름 붙은 정수 상수' — Python 의 cv2.IMREAD_GRAYSCALE(0) 과 같은 값
        Console.WriteLine($"ImreadModes.Grayscale = {(int)ImreadModes.Grayscale}, Color = {(int)ImreadModes.Color}");
        Console.WriteLine($"ColorConversionCodes.BGR2GRAY = {(int)ColorConversionCodes.BGR2GRAY}");
        var flags = ThresholdTypes.Binary | ThresholdTypes.Otsu;   // 플래그 조합 = 비트 OR
        Console.WriteLine($"Binary | Otsu = {(int)flags}  (0 + 8)");

        // 같은 파일을 두 모드로 읽으면 채널 수가 달라진다
        using var color = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        using var gray = Cv2.ImRead("images/sample_color.png", ImreadModes.Grayscale);
        Console.WriteLine($"Color     : {color.Channels()}채널 {color.Type()}");
        Console.WriteLine($"Grayscale : {gray.Channels()}채널 {gray.Type()}");

        // MatType 도 상수 모음: CV_8UC3 = 8bit Unsigned, Channels 3
        MatType t = color.Type();
        Console.WriteLine($"Depth={t.Depth} (CV_8U=0), Channels={t.Channels}");
        Console.WriteLine($"MatType.CV_8UC1 == gray.Type() ? {MatType.CV_8UC1 == gray.Type()}");
    }
}`;

  const EX_CALL = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");

        // 스타일 A: 출력 Mat 을 미리 만들어 인수로 넘긴다 (C++ OpenCV 와 같은 모양)
        using var grayA = new Mat();
        Cv2.CvtColor(img, grayA, ColorConversionCodes.BGR2GRAY);

        // 스타일 B: 확장 메서드 — 새 Mat 을 돌려준다 (OpenCvSharp 전용, 짧다)
        using var grayB = img.CvtColor(ColorConversionCodes.BGR2GRAY);

        Console.WriteLine($"A: {grayA.Size()} {grayA.Type()}");
        Console.WriteLine($"B: {grayB.Size()} {grayB.Type()}");

        // 두 결과가 완전히 같은가? 차이 영상에서 0 이 아닌 픽셀 수를 센다
        using var diff = new Mat();
        Cv2.Absdiff(grayA, grayB, diff);
        Console.WriteLine($"다른 픽셀 수: {Cv2.CountNonZero(diff)}");

        // 반환값이 있는 함수도 있다: Threshold 는 실제로 쓴 임계값(double) 을 돌려준다
        using var bin = new Mat();
        double t = Cv2.Threshold(grayA, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Console.WriteLine($"Otsu 임계값: {t}");

        Cv2.ImShow("gray", grayA);
        Cv2.ImShow("binary", bin);
        Cv2.WaitKey(0);
    }
}`;

  const EX_EXC = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        Console.WriteLine($"입력: {gray.Channels()}채널 {gray.Type()}");
        using var dst = new Mat();
        try
        {
            // 1채널 이미지에 BGR2GRAY 를 적용하면? 입력은 3(4)채널이어야 한다는 조건(assertion) 위반
            Cv2.CvtColor(gray, dst, ColorConversionCodes.BGR2GRAY);
            Console.WriteLine("변환 성공 (이 줄은 실행되지 않습니다)");
        }
        catch (OpenCVException e)
        {
            // e.Message 전체에는 C++ 함수 이름과 깨진 조건식이 길게 들어 있습니다.
            // 여기서는 핵심 부분만 골라 찍습니다 (버전에 따라 문구가 조금씩 다름).
            bool badChannels = e.Message.Contains("Bad number of channels");
            Console.WriteLine($"OpenCVException 발생! 채널 수 조건 위반? {badChannels}");
            Console.WriteLine($"메시지 길이: {e.Message.Length > 100} (100자 넘는 C++ 메시지)");
            Console.WriteLine("-> 채널 수를 확인하세요. 이미 1채널이면 CvtColor 가 필요 없습니다.");
        }

        // 올바른 처리: 채널 수를 검사해 분기
        using var g2 = gray.Channels() == 3 ? gray.CvtColor(ColorConversionCodes.BGR2GRAY) : gray.Clone();
        Console.WriteLine($"결과: {g2.Channels()}채널 {g2.Type()}");
    }
}`;

  const EX_DEBUG = `using System;
using OpenCvSharp;

class Program
{
    // 디버그 도우미: 단계 이름 · 크기 · 형식 · 평균을 찍고 창으로도 보여 준다
    static void Show(string name, Mat m)
    {
        Console.WriteLine($"[{name}] {m.Cols}x{m.Rows} {m.Type()} 평균={Cv2.Mean(m).Val0:F1}");
        Cv2.ImShow(name, m);
    }

    static void Main()
    {
        using var img = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        Show("1-input", img);
        using var blur = img.GaussianBlur(new Size(5, 5), 0);
        Show("2-blur", blur);
        using var bin = blur.Threshold(0, 255, ThresholdTypes.BinaryInv | ThresholdTypes.Otsu);
        Show("3-binary", bin);
        using var edges = bin.Canny(50, 150);
        Show("4-edges", edges);
        Cv2.WaitKey(0);
    }
}`;

  const XML_WPF_APP = `<!-- WPF 프로젝트의 진입점: Main 메서드 대신 App.xaml 이 시작 창(StartupUri)을 지정합니다 -->
<Application x:Class="OpenCvWpfStarter.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             StartupUri="MainWindow.xaml">
    <Application.Resources>
    </Application.Resources>
</Application>`;

  // ---------------------------------------------------------------- 퀴즈
  const QUIZ1 = [
    { q: '프로그램을 실행하자마자 <code>DllNotFoundException: OpenCvSharpExtern</code> 오류가 납니다. 가장 가능성이 높은 원인은?', options: ['<code>using OpenCvSharp;</code> 를 빠뜨렸다', '<code>OpenCvSharp4.runtime.win</code> 패키지를 설치하지 않았다', 'images 폴더가 없다', '.NET 8 이 아니라 .NET 6 을 썼다'], answer: 1,
      explain: '<code>OpenCvSharp4</code> 는 C# 쪽(관리 코드)만 들어 있고, 실제 OpenCV 는 <b>runtime.win</b> 패키지의 네이티브 DLL(<code>OpenCvSharpExtern.dll</code>)에 있습니다. 이 DLL 을 못 찾으면 DllNotFoundException 입니다.' },
    { q: '<code>Cv2.ImRead("images/abc.png")</code> 에서 파일이 없으면 어떻게 되는가?', options: ['FileNotFoundException 이 발생한다', 'null 을 돌려준다', '빈 Mat 을 돌려준다 — <code>Empty()</code> 가 true', '프로그램이 강제 종료된다'], answer: 2,
      explain: 'OpenCV 의 imread 는 실패해도 <b>예외를 던지지 않고 빈 Mat</b> 을 돌려줍니다. 그래서 읽은 뒤 반드시 <code>if (img.Empty())</code> 로 검사해야 합니다. 빈 Mat 을 ImShow 하면 그때 OpenCVException 이 납니다.' },
    { q: 'Visual Studio 에서 F5 로 실행할 때 <code>Cv2.ImRead("images/a.png")</code> 의 상대 경로는 어느 폴더 기준인가?', options: ['Program.cs 가 있는 프로젝트 폴더', '실행 파일이 있는 <code>bin\\Debug\\net8.0</code> 폴더', '내 문서 폴더', 'Visual Studio 설치 폴더'], answer: 1,
      explain: '상대 경로는 <b>현재 작업 폴더</b> 기준이고, Visual Studio 는 기본적으로 실행 파일 폴더(<code>bin\\Debug\\net8.0</code>)를 작업 폴더로 씁니다. images 폴더를 그곳에 복사하거나 csproj 의 <code>&lt;Content Include="images/**"&gt;</code> 로 자동 복사하세요.' },
    { q: 'csproj 에 다음을 넣는 이유는? <code>&lt;Content Include="images/**"&gt;&lt;CopyToOutputDirectory&gt;PreserveNewest&lt;/CopyToOutputDirectory&gt;&lt;/Content&gt;</code>', options: ['images 폴더를 소스 코드로 컴파일한다', '빌드할 때 images 폴더를 실행 폴더로 자동 복사한다', 'NuGet 패키지를 자동 설치한다', '이미지를 exe 안에 포함한다'], answer: 1,
      explain: '<b>Content + CopyToOutputDirectory</b> 는 빌드 때 파일을 출력 폴더로 복사하라는 뜻입니다. <code>PreserveNewest</code> 는 바뀐 파일만 복사합니다. 손으로 복사하는 것보다 안전합니다.' }
  ];

  const QUIZ2 = [
    { q: 'Mat 이 <code>IDisposable</code> 을 구현하는(그래서 <code>using</code> 을 쓰는) 이유는?', options: ['Mat 이 파일을 열어 두기 때문', '픽셀 데이터가 .NET GC 가 관리하지 않는 <b>네이티브 메모리</b>에 있기 때문', 'Mat 이 스레드를 만들기 때문', 'C# 문법상 모든 클래스가 IDisposable 이어야 하기 때문'], answer: 1,
      explain: 'Mat 객체 자체는 작지만, 픽셀 데이터는 C++ OpenCV 가 잡은 <b>네이티브 힙</b>에 있습니다. GC 는 그 크기를 모르므로 제때 해제하지 않습니다. <code>using</code> / <code>Dispose()</code> 로 즉시 해제해야 합니다.' },
    { q: '다음 코드의 결과는? <code>Mat m; using (var a = new Mat(10, 10, MatType.CV_8UC1)) { m = a; } Console.WriteLine(m.Rows);</code>', options: ['10 이 출력된다', '0 이 출력된다', '<code>ObjectDisposedException</code> 이 발생한다', '컴파일 오류'], answer: 2,
      explain: '<code>m = a</code> 는 참조 복사이므로 using 블록이 끝나면 <code>m</code> 도 이미 Dispose 된 Mat 을 가리킵니다. Dispose 된 Mat 을 쓰면 <b>ObjectDisposedException</b>. Mat 을 밖으로 넘기려면 <code>Clone()</code> 하거나 using 을 쓰지 말고 받는 쪽이 Dispose 하세요.' },
    { q: '<code>Cv2.CvtColor(img, gray, ColorConversionCodes.BGR2GRAY);</code> 에서 <code>gray</code> 는 무엇인가?', options: ['변환 결과를 담을 <b>미리 만든 출력 Mat</b> (<code>new Mat()</code>)', '변환 전의 원본 이미지', '변환 코드를 담은 열거형', '변환 결과가 반환값으로 들어가는 변수'], answer: 0,
      explain: 'OpenCvSharp 의 Cv2 함수는 C++ 처럼 <b>출력 Mat 을 인수로</b> 받아 채웁니다. 반환값이 있는 함수(<code>Threshold</code> → 임계값)도 있지만 결과 이미지는 인수로 나옵니다. 확장 메서드 <code>img.CvtColor(code)</code> 는 새 Mat 을 반환합니다.' },
    { q: '다음 중 <code>OpenCVException</code> 이 발생하는 경우는?', options: ['<code>Cv2.ImRead</code> 에 없는 파일 경로를 넘길 때', '1채널(그레이) Mat 에 <code>ColorConversionCodes.BGR2GRAY</code> 를 적용할 때', '<code>Cv2.WaitKey(0)</code> 을 호출할 때', 'using 없이 Mat 을 만들 때'], answer: 1,
      explain: 'BGR2GRAY 는 입력이 3(4)채널이어야 한다는 조건(assertion)이 있어 1채널을 넣으면 OpenCVException 입니다. ImRead 실패는 예외 없이 빈 Mat, WaitKey 는 정상 호출, using 누락은 메모리 누수일 뿐 예외는 아닙니다.' },
    { q: '콘솔 프로젝트에서는 <code>Cv2.ImShow</code> 로 결과를 보았습니다. WPF 프로젝트에서 결과를 화면에 보이는 기본 방법은?', options: ['WPF 에서도 <code>Cv2.ImShow</code> 만 쓴다', 'Mat 을 <code>BitmapSource</code> 로 변환해 <code>Image</code> 컨트롤의 Source 에 넣는다', 'Console.WriteLine 으로 픽셀 값을 출력한다', 'Mat 을 파일로 저장한 뒤 그림판으로 연다'], answer: 1,
      explain: 'WPF 화면의 <code>Image</code> 컨트롤은 <b>BitmapSource</b> 를 표시합니다. <code>OpenCvSharp4.WpfExtensions</code> 의 <code>ToBitmapSource()</code> 로 변환합니다(02차시). ImShow 도 동작하지만 별도 창이 뜨므로 디버깅용으로만 씁니다.' }
  ];

  CS_COURSE.addChapter({
    id: 'cs01', no: '01', title: 'Visual Studio · NuGet 으로 OpenCvSharp 설치하기', subtitle: '개발 환경 준비 → 첫 프로그램 → OpenCvSharp 프로젝트의 기본 구조',
    summary: 'Visual Studio 2022 와 .NET 8 콘솔 프로젝트에 <b>NuGet</b> 으로 <b>OpenCvSharp4 + runtime.win</b> 을 설치하고 첫 OpenCV 프로그램(ImRead → ImShow → WaitKey)을 실행합니다. 실행 폴더와 이미지 경로, 흔한 오류(DllNotFoundException · 빈 Mat)를 해결하고, <b>Mat 은 네이티브 메모리를 쥔 IDisposable</b> 이라는 점, <b>Cv2 정적 클래스 · 열거형 · 출력 Mat 을 인수로 넘기는 호출 규약</b>, 예외 처리와 디버깅 방법을 익힙니다.',
    goals: ['Visual Studio 콘솔 프로젝트에 NuGet 으로 OpenCvSharp4 를 설치하고 첫 프로그램을 실행할 수 있다', '실행 폴더와 상대 경로의 관계를 알고 빈 Mat · DllNotFoundException 오류를 해결할 수 있다', 'Mat 의 using/Dispose 규칙과 Cv2 함수의 호출 규약(출력 Mat 인수 · 확장 메서드)을 설명하고 쓸 수 있다', 'OpenCVException 을 처리하고 ImShow · 조사식으로 중간 결과를 확인하며 디버깅할 수 있다'],
    sections: [
      // ============================================================ 1교시
      {
        id: 'cs01-1', title: 'Visual Studio 설치부터 첫 프로그램 실행까지', minutes: 50,
        goals: ['Visual Studio 2022 의 .NET 데스크톱 개발 워크로드와 .NET 8 콘솔 프로젝트를 만들 수 있다', 'NuGet 으로 OpenCvSharp4 · OpenCvSharp4.runtime.win 을 설치하고 첫 프로그램을 실행할 수 있다', '실행 폴더(bin/Debug/net8.0)와 images 폴더의 관계를 알고 빈 Mat 을 Empty() 로 검사할 수 있다'],
        flow: [['도입: 왜 설치가 필요한가', 5], ['Visual Studio · 프로젝트 만들기', 10], ['NuGet 설치 · 첫 실행', 15], ['images 폴더 · 오류 해결', 12], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: '브라우저에서 로컬 PC 로: 무엇을 설치해야 하나?' },
          { type: 'p', html: '00차시에서는 브라우저 안에서 C# OpenCV 코드를 실행했습니다. 실제 검사 장비 프로그램은 <b>Windows PC 에서 .NET 앱</b>으로 돌아가므로, 이제 내 PC 에 개발 환경을 만듭니다. 필요한 것은 세 가지입니다: <b>Visual Studio 2022</b>(편집기 + 컴파일러 + 디버거), <b>.NET 8</b> 콘솔 프로젝트, 그리고 NuGet 패키지 <b>OpenCvSharp4</b> 와 <b>OpenCvSharp4.runtime.win</b> 입니다.' },
          { type: 'figure', html: FIG_INSTALL, caption: '그림 1. 설치 흐름 5단계 — ① 은 한 번만, ② ③ ⑤ 는 프로젝트마다, ④ 는 이 사이트에서 익힌 코드를 붙여 넣는 자리' },
          { type: 'h', text: '① Visual Studio 2022 Community 설치' },
          { type: 'callout', kind: 'vs', title: '설치 순서', html: '<ol><li><a href="https://visualstudio.microsoft.com/ko/vs/community/" target="_blank" rel="noopener">visualstudio.microsoft.com</a> 에서 <b>Visual Studio 2022 Community</b>(무료) 설치 프로그램을 내려받아 실행합니다.</li><li>워크로드(Workloads) 화면에서 <b>.NET 데스크톱 개발</b>(.NET desktop development)에 체크합니다 — 콘솔 · WPF · .NET 8 SDK 가 함께 설치됩니다.</li><li>설치 후 처음 실행하면 Microsoft 계정 로그인을 권하지만 <b>나중에</b>를 눌러도 됩니다(30일 뒤 무료 등록 필요).</li><li>확인: <b>도구 → 명령줄 → 개발자 명령 프롬프트</b>에서 <code>dotnet --version</code> 이 <code>8.x</code> 로 나오면 준비 끝.</li></ol>' },
          { type: 'h', text: '② 콘솔 프로젝트 만들기' },
          { type: 'list', ordered: true, items: [
            'Visual Studio 시작 → <b>새 프로젝트 만들기</b> → 검색란에 <b>콘솔</b> → <b>콘솔 앱</b> (C#, Windows·Linux·macOS 에서 실행할 수 있는 명령줄 앱) 선택.',
            '프로젝트 이름 <code>OpenCvFirst</code>, 위치는 한글·공백 없는 경로(예: <code>C:\\dev</code>)를 권장합니다.',
            '프레임워크 <b>.NET 8.0 (장기 지원)</b> 선택. <b>“최상위 문을 사용하지 않음”</b>에 체크하면 이 강좌처럼 <code>class Program { static void Main() }</code> 틀이 생깁니다 (체크하지 않아도 동작은 같습니다).'
          ] },
          { type: 'code', title: '명령줄(터미널)로 같은 일 하기', lang: 'sh', code: SH_DOTNET, run: false,
            desc: 'Visual Studio 없이 <b>VS Code + .NET SDK</b> 만 있어도 이 명령으로 프로젝트를 만들고 패키지를 설치할 수 있습니다. <code>--use-program-main</code> 은 “최상위 문 사용 안 함”과 같습니다.' },
          { type: 'h', text: '③ NuGet 으로 OpenCvSharp4 설치' },
          { type: 'p', html: '<b>NuGet</b> 은 .NET 의 패키지 저장소입니다(Python 의 pip 와 같은 역할). OpenCvSharp 은 <b>두 개의 패키지</b>로 나뉘어 있습니다 — 하나는 C# 쪽 API, 하나는 실제 OpenCV 가 들어 있는 네이티브 DLL 입니다. <b>둘 다</b> 설치해야 합니다.' },
          { type: 'figure', html: FIG_PACKAGES, caption: '그림 2. 내 코드 → OpenCvSharp4(C# 관리 코드) → P/Invoke → runtime.win(네이티브 DLL) → OpenCV C++. 오른쪽: 층이 하나 빠졌을 때의 오류' },
          { type: 'table', head: ['패키지', '들어 있는 것', '언제 필요?'], rows: [
            ['<code>OpenCvSharp4</code>', 'C# API: <code>Mat</code>, <code>Cv2</code>, 열거형 (OpenCvSharp.dll)', '항상'],
            ['<code>OpenCvSharp4.runtime.win</code>', 'Windows 용 네이티브 DLL (<code>OpenCvSharpExtern.dll</code>, x64 · x86)', '항상 (Windows). 리눅스는 <code>runtime.ubuntu.*</code>'],
            ['<code>OpenCvSharp4.WpfExtensions</code>', 'Mat ↔ <code>BitmapSource</code> 변환기 (<code>ToBitmapSource()</code>)', 'WPF 프로젝트 (02차시)'],
            ['<code>OpenCvSharp4.Extensions</code>', 'Mat ↔ <code>System.Drawing.Bitmap</code> 변환기', 'WinForms 프로젝트 (이 강좌에서는 안 씀)']
          ], caption: '표 1. OpenCvSharp4 패키지 가족 — 콘솔은 위의 두 개, WPF 는 세 번째까지' },
          { type: 'callout', kind: 'vs', title: 'NuGet 패키지 관리자로 설치하기', html: '<ol><li>솔루션 탐색기에서 프로젝트 이름(OpenCvFirst)을 <b>오른쪽 클릭 → NuGet 패키지 관리</b>.</li><li><b>찾아보기</b> 탭에서 <code>OpenCvSharp4</code> 검색 → 만든 사람이 <b>shimat</b> 인 <code>OpenCvSharp4</code> 선택 → <b>설치</b>.</li><li>같은 방법으로 <code>OpenCvSharp4.runtime.win</code> 설치.</li><li><b>설치됨</b> 탭에 두 패키지가 보이고, 솔루션 탐색기의 <b>종속성 → 패키지</b> 아래에 나타나면 성공. 같은 화면 아래의 <b>패키지 관리자 콘솔</b>에서는 <code>Install-Package OpenCvSharp4</code> 로도 설치할 수 있습니다.</li></ol>' },
          { type: 'code', title: '설치 후 OpenCvFirst.csproj 의 모습', lang: 'xml', file: 'OpenCvFirst.csproj', code: XML_CSPROJ, run: false,
            desc: '프로젝트 파일(csproj)은 XML 입니다. <code>&lt;PackageReference&gt;</code> 두 줄이 NuGet 이 추가한 참조입니다(버전 번호는 설치 시점에 따라 다릅니다). 마지막 <code>&lt;Content Include="images/**"&gt;</code> 는 ⑤ 단계에서 설명하는 <b>이미지 자동 복사</b> 설정입니다 — 손으로 넣어도 됩니다.' },
          { type: 'h', text: '④ Program.cs — 첫 프로그램' },
          { type: 'code', title: 'Program.cs: 이미지 읽고 → 창에 보이고 → 키 대기', code: EX_PROGRAM_CS, run: false, local: true, file: 'Program.cs',
            desc: 'Program.cs 의 내용을 모두 지우고 이 코드를 붙여 넣은 뒤 <b>F5</b>(디버그 시작) 또는 <b>Ctrl+F5</b>(디버그 없이 시작). 콘솔 창에 “읽기 성공 …” 이 나오고 <b>first</b> 라는 이미지 창이 열리면 성공입니다. 이미지 창을 누른 뒤 아무 키를 누르면 종료됩니다. 처음에는 “이미지를 읽지 못했습니다” 가 나올 가능성이 큽니다 — ⑤ 를 보세요.' },
          { type: 'p', html: '같은 코드를 <b>브라우저에서</b> 실행해 보면서 각 줄이 무엇을 출력하는지 확인합니다. 로컬 PC 에서 <code>Cv2.ImShow</code> 는 실제 창을 열고 <code>WaitKey(0)</code> 이 키를 기다리지만, 브라우저에서는 결과 창에 이미지가 나오고 WaitKey 는 바로 돌아옵니다 — 코드는 같습니다.' },
          { type: 'code', title: '예제 1: 읽은 이미지의 정보 출력', code: EX_INFO,
            desc: '<code>Width/Height</code> 와 <code>Cols/Rows</code> 는 같은 값의 두 이름입니다(열 = 너비, 행 = 높이). <code>Type()</code> 의 <code>CV_8UC3</code> 은 <b>8bit Unsigned, Channels 3</b> — 픽셀 하나가 B·G·R 각 1바이트라는 뜻입니다. <code>Console.WriteLine(img)</code> 는 Mat 의 <code>ToString()</code> 요약을 찍습니다 — Visual Studio 조사식(Watch)에 <code>img</code> 를 넣으면 같은 정보가 보입니다.',
            expect: 'Width x Height : 640 x 480\nRows, Cols     : 480, 640\nChannels       : 3\nType           : CV_8UC3\nEmpty          : False\nMat [ 480*640*CV_8UC3, IsContinuous=True, IsSubmatrix=False ]' },
          { type: 'h', text: '⑤ 실행 폴더에 images 폴더 복사하기' },
          { type: 'p', html: '<code>Cv2.ImRead("images/sample_color.png")</code> 의 상대 경로는 <b>현재 작업 폴더</b> 기준이고, Visual Studio 는 실행 파일이 있는 <b>bin\\Debug\\net8.0</b> 을 작업 폴더로 씁니다. 그런데 이미지는 보통 프로젝트 폴더에 두므로 실행 폴더에는 없습니다 → 빈 Mat. 이 강좌 저장소의 <code>assets/images</code> 폴더를 통째로 복사해 쓰세요.' },
          { type: 'figure', html: FIG_FOLDER, caption: '그림 3. 프로젝트 폴더와 실행 폴더 — 상대 경로는 실행 폴더 기준. 해결: 직접 복사 · csproj 자동 복사 · 절대 경로' },
          { type: 'list', items: [
            '<b>방법 1 — 직접 복사</b>: 탐색기에서 <code>images</code> 폴더를 <code>OpenCvFirst\\bin\\Debug\\net8.0\\</code> 안에 복사합니다. 가장 빠르지만 <b>Release</b> 빌드나 다른 PC 에서는 다시 복사해야 합니다.',
            '<b>방법 2 — csproj 자동 복사(권장)</b>: 프로젝트 폴더에 <code>images</code> 를 두고 csproj 에 <code>&lt;Content Include="images/**"&gt;&lt;CopyToOutputDirectory&gt;PreserveNewest&lt;/CopyToOutputDirectory&gt;&lt;/Content&gt;</code> 를 추가합니다(위 csproj 예). 빌드마다 바뀐 파일만 복사됩니다. Visual Studio 에서는 파일 속성 창의 <b>출력 디렉터리로 복사 → 변경된 내용만 복사</b> 와 같습니다.',
            '<b>방법 3 — 절대 경로</b>: <code>Cv2.ImRead(@"C:\\dev\\images\\sample_color.png")</code>. <code>@</code> 를 붙인 <b>축자 문자열</b>은 역슬래시를 그대로 씁니다. 테스트에는 편하지만 다른 PC 에서 깨지므로 완성 프로그램에서는 피합니다.'
          ] },
          { type: 'callout', kind: 'warn', title: 'ImRead 는 실패해도 예외를 던지지 않는다', html: '파일이 없거나 경로가 틀려도 <code>Cv2.ImRead</code> 는 조용히 <b>빈 Mat</b> 을 돌려줍니다. 그 빈 Mat 을 <code>ImShow</code> 나 <code>CvtColor</code> 에 넘기는 순간 <b>OpenCVException</b> 이 나므로 원인을 찾기 어렵습니다. 읽은 직후 <b>반드시</b> <code>if (img.Empty())</code> 로 검사하는 습관을 들이세요.' },
          { type: 'code', title: '예제 2: 잘못된 경로와 Empty() 검사', code: EX_EMPTY,
            desc: '두 번째(폴더 이름 오타)와 세 번째(파일 이름 오타) 경로는 실패합니다. <code>System.IO.File.Exists</code> 로 먼저 파일이 있는지 확인하면 “경로 문제” 와 “파일 형식 문제” 를 구분할 수 있습니다. 결과 창 위쪽의 실행 노트에도 “파일을 찾을 수 없어 빈 Mat” 안내가 나옵니다.',
            expect: '[images/sample_color.png]  File.Exists = True\n   -> OK  640 x 480, 3채널\n[image/sample_color.png]  File.Exists = False\n   -> 빈 Mat! 경로 · 파일 이름 · 실행 폴더를 확인하세요.\n[images/sample_colour.png]  File.Exists = False\n   -> 빈 Mat! 경로 · 파일 이름 · 실행 폴더를 확인하세요.' },
          { type: 'code', title: '예제 3: 빈 Mat 을 ImShow 하면? — try/catch OpenCVException', code: EX_TRYCATCH,
            desc: 'OpenCV 함수가 조건을 어기면 <b>OpenCVException</b> 을 던집니다. <code>catch (OpenCVException e)</code> 로 잡아 <code>e.Message</code> 를 보면 어떤 조건이 깨졌는지 알 수 있습니다. 로컬 .NET 에서는 메시지가 <code>size.width&gt;0 &amp;&amp; size.height&gt;0</code> 처럼 C++ 조건식으로 나옵니다(브라우저는 한국어 안내). <code>finally</code> 는 예외가 나도 실행되므로 창 정리 같은 마무리를 둡니다.',
            expect: 'Empty = True\nOpenCVException 발생!\n메시지: imshow(\'window\'): 빈 이미지입니다. imread 경로 또는 이전 처리 결과를 확인하세요.\nfinally: 창 정리\n프로그램은 정상 종료' },
          { type: 'code', title: '예제 4: 여러 이미지의 크기 · 채널 표', code: EX_MANY,
            desc: '<code>ImreadModes.Unchanged</code> 는 파일에 저장된 채널 수 그대로 읽습니다(그레이 PNG 는 1채널, 컬러는 3채널). 기본값 <code>Color</code> 로 읽으면 그레이 파일도 3채널로 바뀌고, <code>Grayscale</code> 은 컬러도 1채널로 바꿉니다. 형식 지정 <code>{f,-26}</code> 은 26칸 왼쪽 맞춤입니다.',
            expect: '파일                            너비    높이  채널  형식\nimages/sample_color.png      640   480    3   CV_8UC3\nimages/sample_gray.png       640   480    1   CV_8UC1\nimages/washers.png           640   480    1   CV_8UC1\nimages/plate_holes.png       800   600    1   CV_8UC1' },
          { type: 'h', text: '흔한 오류와 해결' },
          { type: 'table', head: ['증상', '원인', '해결'], rows: [
            ['<code>DllNotFoundException: OpenCvSharpExtern</code>', '<code>OpenCvSharp4.runtime.win</code> 미설치, 또는 네이티브 DLL 이 출력 폴더에 복사되지 않음', 'runtime.win 설치 → 다시 빌드. <code>bin\\Debug\\net8.0\\runtimes\\win-x64\\native\\</code> 에 DLL 이 있는지 확인'],
            ['<code>BadImageFormatException</code>', '앱은 x86 인데 DLL 은 x64 (또는 반대)', '프로젝트 속성 → 빌드 → 플랫폼 대상을 <b>Any CPU</b> 또는 <b>x64</b> 로. “32비트 기본 설정” 체크 해제'],
            ['<code>Empty() == true</code>, 화면에 아무것도 안 나옴', '경로 오타 · images 폴더가 실행 폴더에 없음', '그림 3 의 세 가지 방법. <code>File.Exists(path)</code> 로 확인'],
            ['<code>OpenCVException: size.width&gt;0 &amp;&amp; size.height&gt;0</code>', '빈 Mat 을 ImShow / 처리 함수에 넘김', '읽은 직후 <code>Empty()</code> 검사 (예제 2 · 3)'],
            ['<code>Cv2.ImShow</code> 창이 바로 닫힘', '<code>WaitKey</code> 없이 프로그램이 끝남', '<code>Cv2.WaitKey(0)</code> 추가'],
            ['NuGet 검색 결과가 비어 있음', '회사 · 학교 방화벽이 nuget.org 차단', '도구 → 옵션 → NuGet 패키지 관리자 → 패키지 소스에 <code>https://api.nuget.org/v3/index.json</code> 확인, 프록시 설정']
          ], caption: '표 2. 첫 실행에서 자주 만나는 오류' },
          { type: 'callout', kind: 'tip', title: '이 사이트의 코드를 Visual Studio 로 옮기는 법', html: '편집기의 <b>⬇ .cs</b> 로 코드를 내려받거나 복사해 <code>Program.cs</code> 에 붙여 넣으면 됩니다. 브라우저 코드는 정식 OpenCvSharp 과 같은 API 를 쓰므로 수정 없이 동작합니다. 단, <code>Cv2.WaitKey(0)</code> 이 로컬에서는 진짜로 키를 기다리고, 예제 이미지는 <code>images/</code> 폴더에 있어야 합니다.' }
        ],
        practice: [
          {
            title: '안전하게 읽는 함수 TryLoad 만들기', level: 1,
            desc: '<code>TryLoad(path, mode, out Mat img)</code> 함수를 완성하세요. 읽기에 실패하면(빈 Mat) <b>“읽기 실패: 경로”</b> 를 출력하고 <code>false</code>, 성공하면 <code>true</code> 를 돌려줍니다. Main 에서는 성공한 파일만 <b>“OK 경로 너비x높이 N채널”</b> 로 출력하세요.',
            hint: '<code>img = Cv2.ImRead(path, mode); if (img.Empty()) { img.Dispose(); …return false; }</code>. Main 에서 Mat 을 다 쓰면 <code>img.Dispose()</code> 를 잊지 마세요.',
            expect: 'OK images/sample_color.png 640x480 3채널\n읽기 실패: images/sample_colour.png\nOK images/washers.png 640x480 1채널',
            starter: `using System;
using OpenCvSharp;

class Program
{
    // TODO: 읽기에 실패하면 "읽기 실패: 경로" 를 출력하고 false 를 돌려주세요
    static bool TryLoad(string path, ImreadModes mode, out Mat img)
    {
        img = Cv2.ImRead(path, mode);
        return true;
    }

    static void Main()
    {
        string[] paths = { "images/sample_color.png", "images/sample_colour.png", "images/washers.png" };
        foreach (string p in paths)
        {
            if (TryLoad(p, ImreadModes.Unchanged, out Mat img))
            {
                // TODO: "OK 경로 너비x높이 N채널" 출력 후 Dispose
                Console.WriteLine($"OK {p}");
                img.Dispose();
            }
        }
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static bool TryLoad(string path, ImreadModes mode, out Mat img)
    {
        img = Cv2.ImRead(path, mode);
        if (img.Empty())
        {
            img.Dispose();
            Console.WriteLine($"읽기 실패: {path}");
            return false;
        }
        return true;
    }

    static void Main()
    {
        string[] paths = { "images/sample_color.png", "images/sample_colour.png", "images/washers.png" };
        foreach (string p in paths)
        {
            if (TryLoad(p, ImreadModes.Unchanged, out Mat img))
            {
                Console.WriteLine($"OK {p} {img.Width}x{img.Height} {img.Channels()}채널");
                img.Dispose();
            }
        }
    }
}`
          },
          {
            title: '읽기 모드 비교: Color · Grayscale · Unchanged', level: 2,
            desc: '<code>images/sample_gray.png</code>(그레이 파일)와 <code>images/sample_color.png</code>(컬러 파일)를 각각 <code>Color</code> · <code>Grayscale</code> · <code>Unchanged</code> 세 모드로 읽어 <b>“파일 모드 → N채널 형식”</b> 을 출력하세요. 그레이 파일을 Color 로 읽으면 몇 채널이 될까요?',
            hint: '<code>ImreadModes[] modes = { ImreadModes.Color, ImreadModes.Grayscale, ImreadModes.Unchanged };</code> 로 배열을 만들고 이중 foreach. 열거형 값을 문자열 보간에 넣으면 이름(<code>Color</code>)이 출력됩니다.',
            expect: 'images/sample_gray.png Color -> 3채널 CV_8UC3\nimages/sample_gray.png Grayscale -> 1채널 CV_8UC1\nimages/sample_gray.png Unchanged -> 1채널 CV_8UC1\nimages/sample_color.png Color -> 3채널 CV_8UC3\nimages/sample_color.png Grayscale -> 1채널 CV_8UC1\nimages/sample_color.png Unchanged -> 3채널 CV_8UC3',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        string[] files = { "images/sample_gray.png", "images/sample_color.png" };
        ImreadModes[] modes = { ImreadModes.Color, ImreadModes.Grayscale, ImreadModes.Unchanged };
        foreach (string f in files)
        {
            // TODO: 세 모드로 각각 읽어 "파일 모드 -> N채널 형식" 출력 (using var 사용)
            using var img = Cv2.ImRead(f, modes[0]);
            Console.WriteLine($"{f} {modes[0]} -> {img.Channels()}채널 {img.Type()}");
        }
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        string[] files = { "images/sample_gray.png", "images/sample_color.png" };
        ImreadModes[] modes = { ImreadModes.Color, ImreadModes.Grayscale, ImreadModes.Unchanged };
        foreach (string f in files)
        {
            foreach (ImreadModes mode in modes)
            {
                using var img = Cv2.ImRead(f, mode);
                Console.WriteLine($"{f} {mode} -> {img.Channels()}채널 {img.Type()}");
            }
        }
    }
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '01. Visual Studio · NuGet 으로 OpenCvSharp 설치하기', subtitle: '1교시 — 설치부터 첫 프로그램 실행까지', notes: '<p>지난 시간에는 브라우저에서 실행했지만 실제 장비 프로그램은 Windows PC 의 .NET 앱이라는 점에서 시작합니다. 💬 “파이썬으로 OpenCV 를 쓸 때는 무엇을 설치했나요?” — pip install opencv-python. 오늘은 그 C# 판(NuGet)을 합니다. 학생 PC 에 Visual Studio 가 이미 설치되어 있는지 손들어 확인. (3분)</p>' },
          { layout: 'bullets', title: '오늘 설치할 것 세 가지', lead: '편집기 · 프로젝트 · 패키지', bullets: [
            '<b>Visual Studio 2022 Community</b> (무료) + <b>.NET 데스크톱 개발</b> 워크로드 → .NET 8 SDK · 콘솔 · WPF',
            '<b>콘솔 앱 프로젝트</b> (.NET 8) — 이름 <code>OpenCvFirst</code>',
            ['<b>NuGet 패키지 2개</b>', ['<code>OpenCvSharp4</code> — C# API (Mat · Cv2)', '<code>OpenCvSharp4.runtime.win</code> — 실제 OpenCV 네이티브 DLL']],
            '예제 이미지 <code>images/</code> 폴더를 <b>실행 폴더</b>에 복사'
          ], notes: '<p>NuGet = .NET 의 pip. OpenCvSharp 이 두 패키지로 나뉜 이유(관리 코드 / 네이티브 DLL)를 다음 그림에서 설명한다고 예고. (3분)</p>' },
          { layout: 'diagram', title: '설치 흐름 5단계', html: FIG_INSTALL, caption: '① 한 번만 · ② ③ ⑤ 프로젝트마다 · ④ 는 이 사이트의 코드를 붙여 넣는 자리', notes: '<p>순서를 짚으며 “어느 단계가 한 번만 필요한가?” 를 묻습니다. ④ 는 이 사이트에서 ⬇ .cs 로 내려받은 코드를 붙여 넣는 자리라고 강조 — 브라우저에서 익힌 것이 그대로 쓰인다는 동기 부여. (3분)</p>' },
          { layout: 'bullets', title: '① Visual Studio 설치 · ② 프로젝트 만들기', bullets: [
            '설치 프로그램 → 워크로드 <b>.NET 데스크톱 개발</b> 체크 (약 5~8 GB)',
            '확인: 개발자 명령 프롬프트에서 <code>dotnet --version</code> → 8.x',
            '새 프로젝트 → <b>콘솔 앱</b> (C#) → 이름 <code>OpenCvFirst</code> → 경로는 한글 · 공백 없이',
            '프레임워크 <b>.NET 8.0</b>, <b>“최상위 문을 사용하지 않음”</b> 체크 → <code>class Program / Main</code> 틀',
            '명령줄: <code>dotnet new console -n OpenCvFirst -f net8.0 --use-program-main</code>'
          ], notes: '<p>교사 PC 화면을 공유해 새 프로젝트 대화상자를 실제로 보여 줍니다. 최상위 문 체크박스 위치를 짚어 주고, 체크하지 않아도 동작은 같다고 안내. 설치가 안 된 학생은 옆 학생과 짝을 지어 진행. (5분)</p>' },
          { layout: 'diagram', title: '③ OpenCvSharp4 는 왜 패키지가 두 개인가', html: FIG_PACKAGES, caption: '관리 코드(C#) 층과 네이티브 DLL 층 — 한 층이 빠지면 오른쪽 오류', notes: '<p>핵심: <code>OpenCvSharp4</code> 만 설치하면 컴파일은 되지만 실행 때 <b>DllNotFoundException</b>. 💬 “컴파일은 되는데 실행이 안 되는 이유는?” — 네이티브 DLL 은 실행 때 찾기 때문. x86/x64 불일치 → BadImageFormatException 도 여기서 한 번 언급. (4분)</p>' },
          { layout: 'two', title: '③ NuGet 설치: GUI 와 명령줄', left: { title: '🧰 NuGet 패키지 관리자', bullets: ['프로젝트 오른쪽 클릭 → <b>NuGet 패키지 관리</b>', '<b>찾아보기</b> → <code>OpenCvSharp4</code> (작성자 shimat) → 설치', '<code>OpenCvSharp4.runtime.win</code> 도 설치', '<b>설치됨</b> 탭 · 종속성 → 패키지에서 확인'] }, right: { title: '⌨ 명령줄', code: `dotnet add package OpenCvSharp4
dotnet add package OpenCvSharp4.runtime.win
dotnet run`, lang: 'sh' }, notes: '<p>교사 PC 에서 실제로 설치를 시연합니다(네트워크가 느리면 미리 설치해 두고 설치됨 탭만 보여 줌). 패키지 이름이 비슷한 것들(OpenCvSharp3, OpenCvSharp4.runtime.ubuntu)과 헷갈리지 않게 강조. (5분)</p>' },
          { layout: 'code', title: '④ Program.cs — 첫 프로그램', code: EX_PROGRAM_CS, run: false, local: true, file: 'Program.cs', points: ['<code>ImRead</code> → <code>Empty()</code> 검사 → <code>ImShow</code> → <code>WaitKey(0)</code>', '상대 경로는 <b>실행 폴더</b> 기준', '로컬에서는 ImShow 가 실제 창, WaitKey 가 키 대기'], notes: '<p>Program.cs 내용을 지우고 붙여 넣기 → F5. 처음에는 대부분 “이미지를 읽지 못했습니다” 가 나옵니다 — 의도된 실패! 💬 “왜 못 읽었을까?” 로 다음 슬라이드(실행 폴더)로 넘어갑니다. (5분)</p>' },
          { layout: 'code', title: '브라우저에서 같은 코드 실행: 이미지 정보', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        Console.WriteLine($"Width x Height : {img.Width} x {img.Height}");
        Console.WriteLine($"Rows, Cols     : {img.Rows}, {img.Cols}");
        Console.WriteLine($"Channels       : {img.Channels()}");
        Console.WriteLine($"Type           : {img.Type()}");
        Console.WriteLine($"Empty          : {img.Empty()}");
        Console.WriteLine(img);   // Mat.ToString()

        Cv2.ImShow("sample_color", img);
        Cv2.WaitKey(0);
    }
}`, points: ['<code>Width = Cols</code>, <code>Height = Rows</code>', '<code>CV_8UC3</code> = 8bit Unsigned × 3채널(BGR)', '<code>Console.WriteLine(img)</code> = 조사식에서 보는 요약'], notes: '<p>▶ 실행. 출력의 각 줄을 코드와 맞춰 읽습니다. <code>ImreadModes.Grayscale</code> 을 넣어 다시 실행 → Channels 1, CV_8UC1 로 바뀌는 것을 확인. (4분)</p>' },
          { layout: 'diagram', title: '⑤ 실행 폴더와 images 폴더', html: FIG_FOLDER, caption: '상대 경로는 bin/Debug/net8.0 기준 — 직접 복사 · csproj 자동 복사 · 절대 경로', notes: '<p>탐색기로 bin\\Debug\\net8.0 폴더를 열어 exe · OpenCvSharp.dll · runtimes 폴더를 보여 주고, images 폴더를 여기로 복사한 뒤 다시 F5 → 이번엔 창이 뜹니다. csproj 의 Content 설정은 “빌드마다 자동 복사” 라고 설명. (5분)</p>' },
          { layout: 'code', title: 'ImRead 는 실패해도 예외가 없다 → Empty() 검사', code: `using System;
using System.IO;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        string[] paths = { "images/sample_color.png", "image/sample_color.png" };
        foreach (string path in paths)
        {
            Console.WriteLine($"[{path}] File.Exists = {File.Exists(path)}");
            using var img = Cv2.ImRead(path);
            if (img.Empty())
            {
                Console.WriteLine("  -> 빈 Mat! 경로를 확인하세요.");
                continue;
            }
            Console.WriteLine($"  -> OK {img.Width} x {img.Height}");
        }
    }
}`, points: ['실패 = <b>빈 Mat</b> (예외 아님)', '<code>File.Exists</code> 로 경로 문제인지 먼저 확인', '빈 Mat 을 ImShow 하면 그때 <b>OpenCVException</b>'], notes: '<p>두 번째 경로의 오타(image)를 찾게 합니다. “예외가 안 나서 더 위험하다” 는 점을 강조하고, 다음 예제(try/catch)로 연결. (4분)</p>' },
          { layout: 'table', title: '흔한 오류와 해결', head: ['증상', '원인', '해결'], rows: [
            ['<code>DllNotFoundException</code>', 'runtime.win 미설치', 'runtime.win 설치 후 다시 빌드'],
            ['<code>BadImageFormatException</code>', 'x86 ↔ x64 불일치', '플랫폼 대상 Any CPU / x64'],
            ['<code>Empty() == true</code>', '경로 오타 · images 없음', 'bin 폴더에 복사 · csproj Content'],
            ['<code>OpenCVException size.width&gt;0</code>', '빈 Mat 을 처리 함수에 넘김', '읽은 직후 Empty() 검사'],
            ['창이 바로 닫힘', 'WaitKey 없음', '<code>Cv2.WaitKey(0)</code>']
          ], notes: '<p>학생들이 실제로 만난 오류를 손들게 해서 표에서 찾아 봅니다. 표를 사진으로 찍어 두라고 권합니다 — 다음 차시 WPF 프로젝트에서도 같은 오류가 납니다. (3분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '실행하자마자 <code>DllNotFoundException: OpenCvSharpExtern</code> 이 났다. 원인은?', options: ['using 문 누락', '<code>OpenCvSharp4.runtime.win</code> 미설치', 'images 폴더 없음', '.NET 버전'], answer: 1, explain: 'C# API 패키지만 있고 네이티브 DLL(runtime.win)이 없을 때 나는 오류입니다.', notes: '<p>정답 2번. 틀린 학생에게 그림 2 의 층 구조를 다시 보여 줍니다.</p>' },
          { layout: 'practice', title: '실습: 안전하게 읽는 TryLoad 함수', desc: '<p>읽기에 실패하면 “읽기 실패: 경로” 를 출력하고 false, 성공하면 true 를 돌려주는 <code>TryLoad</code> 를 완성하고, Main 에서 성공한 파일의 크기 · 채널을 출력하세요.</p>', starter: `using System;
using OpenCvSharp;

class Program
{
    static bool TryLoad(string path, ImreadModes mode, out Mat img)
    {
        img = Cv2.ImRead(path, mode);
        // TODO: 빈 Mat 이면 Dispose + 메시지 + false
        return true;
    }

    static void Main()
    {
        string[] paths = { "images/sample_color.png", "images/sample_colour.png", "images/washers.png" };
        foreach (string p in paths)
            if (TryLoad(p, ImreadModes.Unchanged, out Mat img)) { Console.WriteLine($"OK {p}"); img.Dispose(); }
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static bool TryLoad(string path, ImreadModes mode, out Mat img)
    {
        img = Cv2.ImRead(path, mode);
        if (img.Empty()) { img.Dispose(); Console.WriteLine($"읽기 실패: {path}"); return false; }
        return true;
    }

    static void Main()
    {
        string[] paths = { "images/sample_color.png", "images/sample_colour.png", "images/washers.png" };
        foreach (string p in paths)
            if (TryLoad(p, ImreadModes.Unchanged, out Mat img))
            { Console.WriteLine($"OK {p} {img.Width}x{img.Height} {img.Channels()}채널"); img.Dispose(); }
    }
}`, notes: '<p>정답 출력: OK sample_color 640x480 3채널 / 읽기 실패: sample_colour / OK washers 640x480 1채널. 빈 Mat 도 Dispose 해 주는 이유(작은 객체라도 네이티브 핸들)를 짚고, 다음 교시 주제(Dispose)로 연결. (6분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['Visual Studio 2022 + <b>.NET 데스크톱 개발</b> → .NET 8 콘솔 프로젝트', 'NuGet 패키지 <b>2개</b>: <code>OpenCvSharp4</code>(C# API) + <code>OpenCvSharp4.runtime.win</code>(네이티브 DLL)', '상대 경로는 <b>실행 폴더</b>(bin\\Debug\\net8.0) 기준 → images 복사 · csproj Content', 'ImRead 실패 = <b>빈 Mat</b> → 반드시 <code>Empty()</code> 검사, OpenCV 오류는 <code>OpenCVException</code>', '다음 교시: Mat 의 메모리와 Dispose, Cv2 함수의 호출 규약'], notes: '<p>네 가지를 학생이 한 문장씩 말하게 합니다. 과제: 집 PC 에도 설치해 오기. (2분)</p>' }
        ]
      },
      // ============================================================ 2교시
      {
        id: 'cs01-2', title: 'OpenCvSharp 프로젝트의 기본 구조: Mat · Cv2 · 호출 규약 · 디버깅', minutes: 50,
        goals: ['Mat 이 네이티브 메모리를 쥔 IDisposable 임을 알고 using / Dispose 규칙을 지킬 수 있다', 'Cv2 정적 클래스와 열거형, 출력 Mat 을 인수로 넘기는 호출 규약과 확장 메서드 스타일을 구분해 쓸 수 있다', 'OpenCVException 을 처리하고 중단점 · 조사식 · ImShow 로 중간 결과를 확인할 수 있다', '콘솔 프로젝트와 WPF 프로젝트의 차이를 설명할 수 있다'],
        flow: [['도입: Mat 은 무엇을 쥐고 있나', 5], ['Mat 과 Dispose 규칙', 12], ['Cv2 · 열거형 · 호출 규약', 13], ['예외 · 디버깅 · 콘솔 vs WPF', 12], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: 'Mat 은 네이티브 메모리를 쥔 핸들이다' },
          { type: 'p', html: 'C# 에서 <code>new Mat(480, 640, MatType.CV_8UC3)</code> 을 만들면 실제 픽셀 데이터(921,600 바이트)는 <b>C++ OpenCV 가 잡은 네이티브 메모리</b>에 놓이고, C# 의 <code>Mat</code> 객체는 그곳을 가리키는 <b>작은 핸들</b>일 뿐입니다. .NET 의 가비지 컬렉터(GC)는 작은 핸들만 보기 때문에 큰 네이티브 메모리를 제때 해제하지 못합니다. 그래서 Mat 은 <b>IDisposable</b> 이고, 다 쓰면 <b>Dispose()</b> 로 직접 해제해야 합니다.' },
          { type: 'figure', html: FIG_MAT_MEM, caption: '그림 4. Mat 객체(관리 힙, 작다) → 픽셀 데이터(네이티브 힙, 크다). GC 는 오른쪽을 모른다 → using / Dispose 로 즉시 해제' },
          { type: 'table', head: ['쓰는 법', '코드', '언제'], rows: [
            ['<b>using 선언</b> (C# 8+)', '<code>using var img = Cv2.ImRead(...);</code>', '가장 흔함 — 지금 있는 블록(메서드 · for 몸체)이 끝날 때 자동 Dispose'],
            ['<b>using 블록</b>', '<code>using (var tmp = new Mat()) { … }</code>', '중간 결과를 좁은 범위에서만 쓰고 바로 버릴 때'],
            ['<b>직접 Dispose</b>', '<code>mat.Dispose();</code>', '필드(멤버 변수)로 보관한 Mat 을 교체 · 창 닫을 때 (WPF 에서 자주)'],
            ['<b>반환용 Mat</b>', '<code>static Mat ToGray(Mat src) { return src.CvtColor(...); }</code>', '함수가 새 Mat 을 돌려줄 때는 using 을 쓰지 않는다 — <b>받는 쪽</b>이 Dispose']
          ], caption: '표 3. Mat 해제 규칙 네 가지' },
          { type: 'code', title: '예제 1: using 선언 · using 블록 · 직접 Dispose', code: EX_DISPOSE,
            desc: '<code>IsDisposed</code> 로 해제 여부를 볼 수 있습니다. <code>keep = b</code> 는 <b>참조 복사</b>이므로 using 블록이 끝나면 <code>keep</code> 도 죽은 Mat 을 가리킵니다 — 밖으로 넘기려면 <code>b.Clone()</code> 을 대입해야 합니다. Dispose 된 Mat 을 쓰면 <b>ObjectDisposedException</b> 입니다.',
            expect: 'a: 480x640 CV_8UC3, IsDisposed=False\nb 블록 안: IsDisposed=False\nb 블록 밖: IsDisposed=True\nc: Dispose 된 Mat 을 쓰면 ObjectDisposedException!' },
          { type: 'callout', kind: 'warn', title: '카메라 반복문에서 using 을 빠뜨리면', html: '<code>while (true) { var frame = new Mat(); cap.Read(frame); … }</code> 처럼 반복마다 Mat 을 만들고 해제하지 않으면 초당 30장 × 수 MB 씩 네이티브 메모리가 늘어나 몇 분 뒤 프로그램이 죽습니다. GC 가 언젠가 정리해 주지만 <b>너무 늦습니다</b>. 반복 몸체 안에 <code>using var frame = new Mat();</code> 을 쓰거나, 반복 밖에서 하나 만들어 재사용하세요(15차시).' },
          { type: 'callout', kind: 'tip', title: 'Visual Studio 가 대신 알려 준다', html: 'IDisposable 객체를 using 없이 만들면 편집기에 <b>CA2000</b> 경고(“범위를 벗어나기 전에 개체를 삭제하세요”)가 표시될 수 있습니다. 경고 목록(오류 목록 창)을 가끔 확인하세요. 또 <code>Mat</code> 위에 커서를 두고 <b>F12</b> 를 누르면 OpenCvSharp 의 정의로 이동해 어떤 메서드가 있는지 볼 수 있습니다.' },

          { type: 'h', text: 'Cv2 정적 클래스와 열거형' },
          { type: 'p', html: 'OpenCV 의 함수는 모두 <b><code>Cv2</code> 정적 클래스의 정적 메서드</b>입니다 (<code>Cv2.ImRead</code>, <code>Cv2.CvtColor</code>, <code>Cv2.Threshold</code> …). Python 의 <code>cv2.</code> 와 같은 자리입니다. C++/Python 에서 정수 상수였던 옵션(<code>cv2.IMREAD_GRAYSCALE</code>, <code>cv2.COLOR_BGR2GRAY</code>)은 C# 에서 <b>열거형(enum)</b>이 되어 잘못된 값을 넣으면 컴파일 때 잡힙니다.' },
          { type: 'table', head: ['열거형', '주요 값', '쓰는 곳'], rows: [
            ['<code>ImreadModes</code>', '<code>Color</code>(3채널) · <code>Grayscale</code>(1채널) · <code>Unchanged</code>(파일 그대로)', '<code>Cv2.ImRead(path, mode)</code>'],
            ['<code>ColorConversionCodes</code>', '<code>BGR2GRAY</code> · <code>BGR2HSV</code> · <code>GRAY2BGR</code> · <code>BGR2RGB</code>', '<code>Cv2.CvtColor</code> (05차시)'],
            ['<code>ThresholdTypes</code>', '<code>Binary</code> · <code>BinaryInv</code> · <code>Otsu</code>(플래그, <code>|</code> 로 조합)', '<code>Cv2.Threshold</code> (07차시)'],
            ['<code>MatType</code>', '<code>CV_8UC1</code> · <code>CV_8UC3</code> · <code>CV_32FC1</code> — 깊이(U8 · F32) + 채널 수', '<code>new Mat(rows, cols, type)</code> (03차시)'],
            ['<code>InterpolationFlags</code>', '<code>Nearest</code> · <code>Linear</code> · <code>Area</code> · <code>Cubic</code>', '<code>Cv2.Resize</code> (11차시)'],
            ['<code>MorphTypes</code> · <code>MorphShapes</code>', '<code>Open</code> · <code>Close</code> / <code>Rect</code> · <code>Ellipse</code>', '<code>Cv2.MorphologyEx</code> (09차시)']
          ], caption: '표 4. 자주 쓰는 열거형 — 이름은 C++ 상수에서 접두어를 뗀 PascalCase' },
          { type: 'code', title: '예제 2: 열거형의 값과 읽기 모드에 따른 채널 수', code: EX_ENUM,
            desc: '열거형은 <code>(int)</code> 로 바꾸면 C++/Python 상수와 같은 정수가 나옵니다. <code>ThresholdTypes</code> 처럼 <b>[Flags]</b> 열거형은 <code>|</code> 로 조합합니다(Otsu = 8). <code>MatType</code> 은 깊이(<code>Depth</code>)와 채널 수(<code>Channels</code>)를 따로 꺼낼 수 있고 <code>==</code> 로 비교할 수 있습니다.',
            expect: 'ImreadModes.Grayscale = 0, Color = 1\nColorConversionCodes.BGR2GRAY = 6\nBinary | Otsu = 8  (0 + 8)\nColor     : 3채널 CV_8UC3\nGrayscale : 1채널 CV_8UC1\nDepth=0 (CV_8U=0), Channels=3\nMatType.CV_8UC1 == gray.Type() ? True' },

          { type: 'h', text: '호출 규약: 출력 Mat 을 인수로 넘긴다' },
          { type: 'p', html: 'C++ OpenCV 함수는 결과를 <b>돌려주지 않고 출력 인수에 채웁니다</b>: <code>cv::cvtColor(src, dst, code)</code>. OpenCvSharp 의 <code>Cv2.*</code> 도 같습니다 — 먼저 <code>var dst = new Mat();</code> 으로 빈 Mat 을 만들고 인수로 넘기면 함수가 크기 · 형식을 맞춰 채워 줍니다. 반환값은 대개 <code>void</code> 이고, <code>Threshold</code>(사용한 임계값) · <code>ConnectedComponents</code>(라벨 수) 처럼 <b>부수 정보</b>만 반환하는 경우가 있습니다. OpenCvSharp 은 여기에 <b>확장 메서드</b> 스타일(<code>src.CvtColor(code)</code> → 새 Mat 반환)을 더 제공합니다.' },
          { type: 'figure', html: FIG_CALL, caption: '그림 5. 스타일 A: Cv2 정적 함수 + 출력 Mat 인수 (C++ 와 같은 모양) · 스타일 B: 확장 메서드가 새 Mat 을 반환 (짧고 연결 가능)' },
          { type: 'code', title: '예제 3: 두 스타일로 같은 결과 만들기 · 반환값이 있는 함수', code: EX_CALL,
            desc: '두 결과의 차이(<code>Absdiff</code>)에서 0 이 아닌 픽셀이 0개 → 완전히 같습니다. 스타일 A 는 <b>출력 Mat 을 재사용</b>할 수 있어 카메라 반복에서 유리하고, 스타일 B 는 짧고 <code>src.GaussianBlur(...).Canny(...)</code> 처럼 <b>연결</b>할 수 있습니다. 단, 연결 중간에 생기는 Mat 은 해제되지 않으니 긴 파이프라인은 단계마다 <code>using var</code> 로 받으세요.',
            expect: 'A: (width:640 height:480) CV_8UC1\nB: (width:640 height:480) CV_8UC1\n다른 픽셀 수: 0\nOtsu 임계값: 101' },
          { type: 'callout', kind: 'tip', title: '어느 스타일을 쓸까?', html: '이 강좌는 개념을 배울 때는 <b>스타일 A</b>(C++ · Python 문서와 1:1 대응)를 주로 쓰고, 짧게 쓸 때 <b>스타일 B</b>를 섞습니다. 팀 코드에서는 하나로 통일하는 것이 좋습니다. Python 경험자는 “<code>gray = cv2.cvtColor(img, code)</code> 가 스타일 B, C++ 가 스타일 A” 로 기억하세요.' },

          { type: 'h', text: 'OpenCVException 처리' },
          { type: 'p', html: 'OpenCV 는 함수의 입력 조건(assertion)이 깨지면 C++ 예외를 던지고, OpenCvSharp 은 이를 <b><code>OpenCVException</code></b> 으로 바꿔 줍니다. 메시지에는 깨진 조건식(<code>scn == 3 || scn == 4</code> 처럼)과 함수 이름이 들어 있어 원인을 짚기 좋습니다. <b>채널 수 · 자료형 · 크기</b> 가 원인인 경우가 대부분입니다.' },
          { type: 'code', title: '예제 4: 1채널 이미지에 BGR2GRAY → OpenCVException', code: EX_EXC,
            desc: '<code>scn</code> 은 source channel number. 메시지 전체에는 “<code>Invalid number of channels in input image … \'scn\' is 1</code>” 처럼 C++ 함수 이름과 깨진 조건식이 길게 들어 있어, 여기서는 <code>Contains</code> 로 핵심만 확인했습니다 (실제 프로젝트에서는 <code>e.Message</code> 를 그대로 로그에 남기세요). 해결은 예외를 잡는 것이 아니라 <b>채널 수를 검사해 분기</b>하는 것입니다 — 마지막 두 줄처럼.',
            expect: '입력: 1채널 CV_8UC1\nOpenCVException 발생! 채널 수 조건 위반? True\n메시지 길이: True (100자 넘는 C++ 메시지)\n-> 채널 수를 확인하세요. 이미 1채널이면 CvtColor 가 필요 없습니다.\n결과: 1채널 CV_8UC1' },
          { type: 'callout', kind: 'info', title: '예외를 어디서 잡을까', html: '콘솔 프로그램에서는 <code>Main</code> 전체를 <code>try/catch</code> 로 감싸 <code>OpenCVException</code> 과 일반 <code>Exception</code> 을 순서대로 잡고 메시지를 출력하면 됩니다. WPF 에서는 버튼 클릭 핸들러마다 잡아 <code>MessageBox.Show(e.Message)</code> 로 알려 주고, 앱이 죽지 않게 합니다(02차시).' },

          { type: 'h', text: '디버깅: 중단점 · 조사식 · ImShow' },
          { type: 'callout', kind: 'vs', title: 'Visual Studio 디버거로 Mat 들여다보기', html: '<ul><li><b>중단점</b>: 줄 번호 왼쪽 여백을 클릭(또는 F9) → F5 로 실행하면 그 줄에서 멈춥니다. <b>F10</b>(프로시저 단위) · <b>F11</b>(한 단계씩) 으로 진행.</li><li><b>조사식(Watch)</b>: 멈춘 상태에서 <code>img.Rows</code>, <code>img.Cols</code>, <code>img.Channels()</code>, <code>img.Type()</code>, <code>img.Empty()</code> 를 조사식 창에 넣으면 값이 보입니다. 변수 위에 마우스를 올리면 <b>데이터 팁</b>도 뜹니다.</li><li><b>Image Watch</b> 확장(확장 → 확장 관리 → “Image Watch”): 디버깅 중 Mat 을 이미지로 미리 보여 줍니다 (C++ 용으로 만들어져 OpenCvSharp 에서는 <code>Mat.CvPtr</code> 로 일부만 동작).</li><li>가장 확실한 방법은 코드 안에서 <b><code>Cv2.ImShow("단계이름", mat)</code></b> 로 중간 결과를 창에 띄우는 것 — 아래 예제.</li></ul>' },
          { type: 'code', title: '예제 5: 단계마다 정보 출력 + ImShow 로 중간 결과 확인', code: EX_DEBUG,
            desc: '<code>Show</code> 도우미 하나로 각 단계의 크기 · 형식 · 평균 밝기와 이미지를 동시에 확인합니다. 결과 창에서 네 이미지를 비교해 보세요 — 어느 단계에서 원하는 결과가 어긋났는지 바로 보입니다. 이런 도우미를 프로젝트에 하나 두면 디버깅 시간이 크게 줍니다. 확장 메서드(스타일 B)를 연결해 쓴 예이기도 합니다.',
            expect: '[1-input] 640x480 CV_8UC1 평균=191.8\n[2-blur] 640x480 CV_8UC1 평균=191.8\n[3-binary] 640x480 CV_8UC1 평균=38.9\n[4-edges] 640x480 CV_8UC1 평균=3.9' },
          { type: 'callout', kind: 'tip', title: '브라우저 결과 창도 디버거다', html: '이 사이트의 이미지 창 위에 마우스를 올리면 <b>(x, y) 와 픽셀 값</b>이, 누르면 <b>확대 보기</b>가 열립니다. 이진화 결과가 왜 이상한지, 경계가 어디서 끊기는지 픽셀 단위로 확인하세요. Visual Studio 에는 없는 기능입니다.' },

          { type: 'h', text: '콘솔 프로젝트 vs WPF 프로젝트' },
          { type: 'table', head: ['', '콘솔 앱', 'WPF 앱'], rows: [
            ['진입점', '<code>static void Main()</code>', '<code>App.xaml</code> 의 <code>StartupUri="MainWindow.xaml"</code> (Main 은 자동 생성)'],
            ['화면', '텍스트 콘솔 + <code>Cv2.ImShow</code> 별도 창', 'XAML 로 그린 창 — <code>Image</code> 컨트롤에 <code>BitmapSource</code> 표시'],
            ['흐름', '위에서 아래로 한 번 실행, <code>WaitKey</code> 로 대기', '<b>이벤트 루프</b> — 버튼 <code>Click</code> 등 핸들러가 호출됨, 블로킹 대기 금지'],
            ['Mat 보관', '지역 변수 + using', '<b>필드</b>(<code>private Mat _src;</code>)로 보관, 교체할 때 이전 것 Dispose'],
            ['결과 보기', '<code>Cv2.ImShow</code>', '<code>_img.Source = mat.ToBitmapSource();</code> (OpenCvSharp4.WpfExtensions)'],
            ['추가 패키지', '없음', '<code>OpenCvSharp4.WpfExtensions</code>']
          ], caption: '표 5. 같은 OpenCV 코드, 다른 껍데기 — 처리 코드(Mat · Cv2)는 두 곳에서 똑같다' },
          { type: 'code', title: 'WPF 프로젝트의 진입점 App.xaml', lang: 'xml', file: 'App.xaml', code: XML_WPF_APP, run: false,
            desc: 'WPF 프로젝트에는 <code>Main</code> 이 보이지 않습니다 — 빌드할 때 <code>App.xaml</code> 로부터 자동 생성되며 <code>StartupUri</code> 의 창을 띄우고 <b>이벤트 루프</b>를 돕니다. 02차시에서 이 구조 위에 이미지 뷰어를 만듭니다.' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: 'OpenCV 처리 코드(<code>Mat</code> · <code>Cv2</code>)는 콘솔과 <b>완전히 같습니다</b>. 달라지는 것은 ① 이미지를 <code>ImShow</code> 대신 <code>Image</code> 컨트롤에 넣는 변환(<code>ToBitmapSource</code>), ② Mat 을 필드로 보관하고 교체할 때 Dispose 하는 것, ③ 처리 시간이 길면 UI 가 멈추므로 나중에 <code>Task.Run</code> 으로 옮기는 것(16차시)입니다. 그래서 이 강좌는 <b>콘솔(브라우저)에서 처리 코드를 먼저 익히고</b> WPF 에 붙입니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '2교시 지도 팁 · 오개념', html: '<ul><li>오개념 1: “C# 은 GC 가 있으니 Dispose 가 필요 없다” — 그림 4 로 네이티브 메모리를 강조하고, 카메라 반복에서 메모리가 늘어나는 상황을 말로 그려 줍니다.</li><li>오개념 2: “<code>Cv2.CvtColor(img, gray, …)</code> 의 gray 가 입력” — 인수 순서는 <b>입력 → 출력 → 옵션</b>. 예제 3 에서 <code>new Mat()</code> 을 먼저 만드는 줄을 짚어 줍니다.</li><li>평가: 실습 1(반환용 Mat 함수)에서 함수 안에 <code>using</code> 을 쓰면 반환 뒤 ObjectDisposedException 이 납니다 — 일부러 넣어 보게 하면 규칙이 오래 남습니다.</li><li>시간이 남으면 예제 5 의 Canny 임계값(50, 150)을 바꿔 보게 합니다.</li></ul>' }
        ],
        practice: [
          {
            title: '새 Mat 을 돌려주는 함수 ToGray 만들기', level: 1,
            desc: '<code>static Mat ToGray(Mat src)</code> 를 완성하세요. 입력이 <b>3채널이면 BGR2GRAY 로 변환한 새 Mat</b>, 이미 <b>1채널이면 Clone()</b> 을 돌려줍니다. 함수 안에서는 <code>using</code> 을 쓰지 말고(반환할 Mat 이므로), 호출한 Main 에서 <code>using var</code> 로 받으세요. 두 파일에 대해 <b>“파일: N채널 → 1채널 형식, 평균=xx.x”</b> 를 출력합니다.',
            hint: '<code>if (src.Channels() == 3) return src.CvtColor(ColorConversionCodes.BGR2GRAY); return src.Clone();</code>. 평균은 <code>Cv2.Mean(gray).Val0</code> 를 <code>:F1</code> 로.',
            expect: 'images/sample_color.png: 3채널 -> 1채널 CV_8UC1, 평균=119.2\nimages/washers.png: 1채널 -> 1채널 CV_8UC1, 평균=191.8',
            starter: `using System;
using OpenCvSharp;

class Program
{
    // TODO: 3채널이면 BGR2GRAY 변환 결과를, 1채널이면 Clone() 을 돌려주세요 (using 금지!)
    static Mat ToGray(Mat src)
    {
        return src.Clone();
    }

    static void Main()
    {
        string[] files = { "images/sample_color.png", "images/washers.png" };
        foreach (string f in files)
        {
            using var src = Cv2.ImRead(f, ImreadModes.Unchanged);
            using var gray = ToGray(src);
            // TODO: "파일: N채널 -> M채널 형식, 평균=xx.x" 출력
            Console.WriteLine($"{f}: {src.Channels()}채널 -> {gray.Channels()}채널");
            Cv2.ImShow(f, gray);
        }
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static Mat ToGray(Mat src)
    {
        if (src.Channels() == 3) return src.CvtColor(ColorConversionCodes.BGR2GRAY);
        return src.Clone();
    }

    static void Main()
    {
        string[] files = { "images/sample_color.png", "images/washers.png" };
        foreach (string f in files)
        {
            using var src = Cv2.ImRead(f, ImreadModes.Unchanged);
            using var gray = ToGray(src);
            Console.WriteLine($"{f}: {src.Channels()}채널 -> {gray.Channels()}채널 {gray.Type()}, 평균={Cv2.Mean(gray).Val0:F1}");
            Cv2.ImShow(f, gray);
        }
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '두 스타일로 GaussianBlur — 결과가 같은지 확인', level: 2,
            desc: '<code>images/sample_gray.png</code> 를 그레이로 읽고, <b>스타일 A</b>(<code>Cv2.GaussianBlur(src, dstA, new Size(7, 7), 0)</code>)와 <b>스타일 B</b>(<code>src.GaussianBlur(new Size(7, 7), 0)</code>)로 흐리게 만든 뒤, <code>Cv2.Absdiff</code> + <code>Cv2.CountNonZero</code> 로 <b>다른 픽셀 수</b>를 출력하고 두 결과를 ImShow 하세요. 그 다음 스타일 B 의 커널을 <code>new Size(15, 15)</code> 로 바꾸면 다른 픽셀 수가 어떻게 되는지도 출력하세요.',
            hint: '스타일 A 는 <code>using var dstA = new Mat();</code> 을 먼저 만들어야 합니다. 커널 크기는 <b>홀수</b>여야 합니다(짝수면 OpenCVException).',
            expect: '다른 픽셀 수: 0\n다른 픽셀 수(7 vs 15): 149895',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);

        // 스타일 A: 출력 Mat 을 인수로
        using var dstA = new Mat();
        Cv2.GaussianBlur(src, dstA, new Size(7, 7), 0);

        // TODO: 스타일 B (확장 메서드) 로 같은 블러를 만들어 dstB 에 받으세요
        using var dstB = src.Clone();

        // TODO: Absdiff + CountNonZero 로 "다른 픽셀 수: N" 출력
        using var diff = new Mat();

        // TODO: 커널 15x15 인 dstC 를 만들어 dstA 와 비교한 "다른 픽셀 수(7 vs 15): N" 출력

        Cv2.ImShow("A", dstA);
        Cv2.ImShow("B", dstB);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);

        using var dstA = new Mat();
        Cv2.GaussianBlur(src, dstA, new Size(7, 7), 0);

        using var dstB = src.GaussianBlur(new Size(7, 7), 0);

        using var diff = new Mat();
        Cv2.Absdiff(dstA, dstB, diff);
        Console.WriteLine($"다른 픽셀 수: {Cv2.CountNonZero(diff)}");

        using var dstC = src.GaussianBlur(new Size(15, 15), 0);
        using var diff2 = new Mat();
        Cv2.Absdiff(dstA, dstC, diff2);
        Console.WriteLine($"다른 픽셀 수(7 vs 15): {Cv2.CountNonZero(diff2)}");

        Cv2.ImShow("A", dstA);
        Cv2.ImShow("B", dstB);
        Cv2.ImShow("C (15x15)", dstC);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '01. Visual Studio · NuGet 으로 OpenCvSharp 설치하기', subtitle: '2교시 — OpenCvSharp 프로젝트의 기본 구조: Mat · Cv2 · 호출 규약 · 디버깅', notes: '<p>1교시에 만든 프로젝트를 열어 둔 상태로 시작합니다. 💬 “<code>new Mat(480, 640, CV_8UC3)</code> 은 메모리를 얼마나 쓸까?” — 480×640×3 ≈ 921 KB. 이 큰 메모리가 어디에 있는지가 오늘의 첫 주제. (3분)</p>' },
          { layout: 'diagram', title: 'Mat 은 네이티브 메모리를 쥔 핸들', html: FIG_MAT_MEM, caption: 'Mat 객체(작다, 관리 힙) → 픽셀 데이터(크다, 네이티브 힙). GC 는 오른쪽을 모른다', notes: '<p>왼쪽 작은 상자와 오른쪽 큰 상자의 크기 차이를 강조합니다. GC 는 왼쪽만 세므로 “메모리가 충분하다” 고 착각 → 네이티브 메모리는 쌓임. 그래서 IDisposable + using. 💬 “파이썬에서는 왜 신경 안 썼나?” — numpy 배열은 파이썬이 직접 관리. (5분)</p>' },
          { layout: 'code', title: 'using 선언 · using 블록 · 직접 Dispose', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var a = new Mat(480, 640, MatType.CV_8UC3, new Scalar(0, 0, 0));
        Console.WriteLine($"a: IsDisposed={a.IsDisposed}");

        Mat keep;
        using (var b = new Mat(100, 100, MatType.CV_8UC1))
        {
            keep = b;                 // 참조 복사
        }
        Console.WriteLine($"b 블록 밖: IsDisposed={keep.IsDisposed}");

        var c = new Mat(10, 10, MatType.CV_8UC1);
        c.Dispose();
        try { Console.WriteLine(c.Rows); }
        catch (ObjectDisposedException) { Console.WriteLine("ObjectDisposedException!"); }
    }
}`, points: ['<code>using var</code>: 블록이 끝나면 자동 Dispose (가장 흔함)', '<code>using (…) { }</code>: 중괄호 범위에서만', '참조 복사 <code>keep = b</code> 는 같은 메모리 → 밖에서 쓰면 예외', '함수가 <b>반환</b>하는 Mat 은 using 금지 — 받는 쪽이 Dispose'], notes: '<p>▶ 실행 후 IsDisposed 값의 변화를 읽습니다. <code>keep = b</code> 를 <code>keep = b.Clone()</code> 으로 바꿔 다시 실행 → False 로 바뀜을 확인. 반환용 Mat 규칙은 실습 1 에서 다룹니다. (6분)</p>' },
          { layout: 'bullets', title: 'Dispose 규칙 요약', bullets: [
            '지역 변수 Mat → <b><code>using var</code></b> 가 기본',
            '반복문 안에서 만드는 Mat → 몸체 안 <code>using var</code> 또는 밖에서 하나 만들어 재사용',
            '필드로 보관하는 Mat(WPF) → 교체할 때 <code>_src?.Dispose(); _src = 새것;</code>',
            '함수가 돌려주는 Mat → 함수 안에서는 using 금지, <b>호출한 쪽</b>이 using',
            'Visual Studio 경고 <b>CA2000</b> 이 보이면 using 누락 의심'
          ], notes: '<p>네 규칙을 읽고, 카메라 반복에서 using 을 빠뜨렸을 때 초당 30장 × 1 MB 가 쌓이는 상황을 말로 그려 줍니다. (3분)</p>' },
          { layout: 'table', title: 'Cv2 정적 클래스와 열거형', lead: '함수는 모두 <code>Cv2.*</code>, 옵션은 열거형(enum) — 잘못된 값은 컴파일 때 잡힌다', head: ['열거형', '값 예', '쓰는 곳'], rows: [
            ['<code>ImreadModes</code>', '<code>Color</code> · <code>Grayscale</code> · <code>Unchanged</code>', '<code>Cv2.ImRead</code>'],
            ['<code>ColorConversionCodes</code>', '<code>BGR2GRAY</code> · <code>BGR2HSV</code>', '<code>Cv2.CvtColor</code>'],
            ['<code>ThresholdTypes</code>', '<code>Binary</code> · <code>Otsu</code> (<code>|</code> 조합)', '<code>Cv2.Threshold</code>'],
            ['<code>MatType</code>', '<code>CV_8UC1</code> · <code>CV_8UC3</code> · <code>CV_32FC1</code>', '<code>new Mat(...)</code>']
          ], notes: '<p>Python 의 <code>cv2.IMREAD_GRAYSCALE</code>(정수 0) 과 대응. <code>(int)ImreadModes.Grayscale</code> 이 0 임을 예제 2 로 확인하게 합니다. [Flags] 열거형의 <code>|</code> 조합은 07차시에서 다시. (4분)</p>' },
          { layout: 'diagram', title: '호출 규약: 출력 Mat 을 인수로 vs 확장 메서드', html: FIG_CALL, caption: '스타일 A (C++ 와 같은 모양) · 스타일 B (OpenCvSharp 전용, 새 Mat 반환)', notes: '<p>인수 순서 “입력 → 출력 → 옵션” 을 강조합니다. 💬 “dst 를 new Mat() 으로 만들 때 크기를 안 정해도 되는 이유?” — 함수가 알아서 맞춘다. 스타일 B 는 받는 쪽이 Dispose 책임. (4분)</p>' },
          { layout: 'code', title: '두 스타일로 같은 결과 · 반환값이 있는 함수', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png");
        using var grayA = new Mat();                                   // 스타일 A
        Cv2.CvtColor(img, grayA, ColorConversionCodes.BGR2GRAY);
        using var grayB = img.CvtColor(ColorConversionCodes.BGR2GRAY); // 스타일 B

        using var diff = new Mat();
        Cv2.Absdiff(grayA, grayB, diff);
        Console.WriteLine($"다른 픽셀 수: {Cv2.CountNonZero(diff)}");
        using var bin = new Mat();
        double t = Cv2.Threshold(grayA, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Console.WriteLine($"Otsu 임계값: {t}");   // 반환값 = 부수 정보
        Cv2.ImShow("binary", bin);
        Cv2.WaitKey(0);
    }
}`, points: ['A: <code>new Mat()</code> 을 먼저 만들어 넘긴다', 'B: 새 Mat 반환 → <code>using var</code> 로 받기', '차이 픽셀 0개 = 완전히 같은 결과', '반환값이 있어도 결과 이미지는 인수(<code>bin</code>)에'], notes: '<p>▶ 실행. 다른 픽셀 수 0 을 확인. Threshold 의 반환값(임계값)과 출력 Mat(bin)을 구분하게 합니다. (4분)</p>' },
          { layout: 'code', title: 'OpenCVException: 조건이 깨졌을 때', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var gray = Cv2.ImRead("images/washers.png", ImreadModes.Grayscale);
        using var dst = new Mat();
        try
        {
            // 1채널에 BGR2GRAY → 입력은 3채널이어야 한다는 조건 위반
            Cv2.CvtColor(gray, dst, ColorConversionCodes.BGR2GRAY);
        }
        catch (OpenCVException e)
        {
            Console.WriteLine("OpenCVException: " + e.Message);
        }
        // 올바른 처리: 채널 수를 검사해 분기
        using var g2 = gray.Channels() == 3 ? gray.CvtColor(ColorConversionCodes.BGR2GRAY) : gray.Clone();
        Console.WriteLine($"결과: {g2.Channels()}채널 {g2.Type()}");
    }
}`, points: ['메시지에 <b>깨진 조건식 + 함수 이름</b>', '원인 대부분: <b>채널 수 · 자료형 · 크기</b>', '해결은 catch 가 아니라 <b>입력 검사 · 분기</b>', 'WPF 에서는 핸들러마다 catch → MessageBox'], notes: '<p>▶ 실행해 메시지를 읽고 “scn == 3 || scn == 4” 의 뜻(source channel number)을 풉니다. 빈 Mat 을 넘겼을 때(1교시 예제 3)와 함께 “OpenCVException 두 가지 흔한 원인” 으로 정리. (4분)</p>' },
          { layout: 'bullets', title: '디버깅: 중단점 · 조사식 · ImShow', lead: 'Visual Studio 디버거 + OpenCV 창', bullets: [
            '<b>중단점</b> F9 → F5 실행 → 그 줄에서 멈춤 · <b>F10</b> 다음 줄 · <b>F11</b> 함수 안으로',
            '<b>조사식(Watch)</b>: <code>img.Rows</code> <code>img.Cols</code> <code>img.Channels()</code> <code>img.Type()</code> <code>img.Empty()</code>',
            '변수 위에 마우스 → <b>데이터 팁</b>, <code>Console.WriteLine(img)</code> 로 요약 출력',
            '가장 확실한 방법: 단계마다 <b><code>Cv2.ImShow("단계", mat)</code></b> 로 중간 결과 눈으로 확인',
            '브라우저 결과 창: 마우스로 <b>(x, y) · 픽셀 값</b>, 클릭으로 확대 보기'
          ], notes: '<p>교사 PC 에서 1교시 Program.cs 에 중단점을 걸고 F5 → 조사식에 img.Rows 를 넣는 것을 시연합니다. 이어서 예제 5(Show 도우미)를 브라우저에서 실행해 4단계 창을 비교. (5분)</p>' },
          { layout: 'two', title: '콘솔 프로젝트 vs WPF 프로젝트', left: { title: '⌨ 콘솔 앱', bullets: ['진입점 <code>static void Main()</code>', '위에서 아래로 한 번 실행', '<code>Cv2.ImShow</code> + <code>WaitKey</code> 로 확인', 'Mat 은 지역 변수 + <code>using var</code>', '패키지: OpenCvSharp4 + runtime.win'] }, right: { title: '🪟 WPF 앱', bullets: ['진입점 <code>App.xaml</code> (StartupUri) — Main 자동 생성', '<b>이벤트 루프</b>: 버튼 Click 핸들러가 호출됨', '<code>Image.Source = mat.ToBitmapSource()</code>', 'Mat 은 <b>필드</b>로 보관, 교체 시 Dispose', '패키지 추가: <b>OpenCvSharp4.WpfExtensions</b>'] }, notes: '<p>“처리 코드(Mat · Cv2)는 완전히 같고 껍데기만 다르다” 가 핵심 메시지. 다음 차시에 WPF 프로젝트를 만들어 이 표의 오른쪽을 실제로 채운다고 예고. (3분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>Mat m; using (var a = new Mat(10, 10, MatType.CV_8UC1)) { m = a; } Console.WriteLine(m.Rows);</code> 의 결과는?', options: ['10', '0', 'ObjectDisposedException', '컴파일 오류'], answer: 2, explain: '<code>m = a</code> 는 참조 복사. using 블록이 끝나면 m 도 Dispose 된 Mat 을 가리킵니다.', notes: '<p>정답 3번. 예제 1 의 keep 변수와 같은 상황임을 상기시킵니다. Clone() 이 해결책.</p>' },
          { layout: 'practice', title: '실습: 새 Mat 을 돌려주는 ToGray 함수', desc: '<p><code>static Mat ToGray(Mat src)</code>: 3채널이면 BGR2GRAY 변환 결과, 1채널이면 <code>Clone()</code> 을 돌려주세요. 함수 안에서는 using 금지, Main 에서 <code>using var</code> 로 받습니다.</p>', starter: `using System;
using OpenCvSharp;

class Program
{
    static Mat ToGray(Mat src)
    {
        // TODO: 3채널 → CvtColor(BGR2GRAY), 1채널 → Clone()
        return src.Clone();
    }

    static void Main()
    {
        string[] files = { "images/sample_color.png", "images/washers.png" };
        foreach (string f in files)
        {
            using var src = Cv2.ImRead(f, ImreadModes.Unchanged);
            using var gray = ToGray(src);
            Console.WriteLine($"{f}: {src.Channels()}채널 -> {gray.Channels()}채널 {gray.Type()}");
        }
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static Mat ToGray(Mat src)
    {
        if (src.Channels() == 3) return src.CvtColor(ColorConversionCodes.BGR2GRAY);
        return src.Clone();
    }

    static void Main()
    {
        string[] files = { "images/sample_color.png", "images/washers.png" };
        foreach (string f in files)
        {
            using var src = Cv2.ImRead(f, ImreadModes.Unchanged);
            using var gray = ToGray(src);
            Console.WriteLine($"{f}: {src.Channels()}채널 -> {gray.Channels()}채널 {gray.Type()}");
        }
    }
}`, notes: '<p>다 한 학생에게 함수 안의 결과를 <code>using var g = …; return g;</code> 로 바꿔 보게 합니다 → Main 에서 ObjectDisposedException. “반환하는 Mat 은 using 금지” 가 몸에 남습니다. (6분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['Mat = <b>네이티브 메모리를 쥔 핸들</b> → <code>using var</code> / Dispose, 반환용 Mat 은 받는 쪽이 해제', '함수는 <code>Cv2.*</code> 정적 메서드, 옵션은 <b>열거형</b>(ImreadModes · ColorConversionCodes · ThresholdTypes · MatType)', '호출 규약: <b>입력 → 출력 Mat(new Mat()) → 옵션</b>, 확장 메서드는 새 Mat 반환', '<code>OpenCVException</code> 의 원인은 채널 수 · 자료형 · 크기 · 빈 Mat → 입력 검사로 예방', '디버깅: 중단점 · 조사식(Rows/Cols/Type) · 단계별 <code>ImShow</code>', '다음 차시: WPF 프로젝트 만들기와 Mat ↔ BitmapSource'], notes: '<p>다섯 줄을 학생이 돌아가며 읽습니다. 다음 차시 준비: 1교시 프로젝트에 <code>OpenCvSharp4.WpfExtensions</code> 패키지도 설치해 보기(선택). (2분)</p>' }
        ]
      }
    ]
  });
})();
