/* 02차시 WPF 기초와 이미지 표시 (Mat ↔ BitmapSource) */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: WPF 프로젝트의 파일 구성과 partial class
  const FIG_FILES = `<svg viewBox="0 0 760 320" role="img" aria-label="WPF 프로젝트 구성: App.xaml 이 MainWindow 를 띄우고, MainWindow.xaml 과 MainWindow.xaml.cs 가 하나의 partial 클래스로 합쳐진다">
  ${ARROW('c02a1')}
  <rect x="10" y="10" width="230" height="140" rx="12" class="card-bg"/>
  <text x="125" y="38" text-anchor="middle" class="tx-b">App.xaml (+ .cs)</text>
  <rect x="26" y="52" width="198" height="82" rx="8" class="p1s"/>
  <text x="125" y="76" text-anchor="middle" class="tx">StartupUri=</text>
  <text x="125" y="96" text-anchor="middle" class="tx">"MainWindow.xaml"</text>
  <text x="125" y="122" text-anchor="middle" class="tx-m">앱의 시작점 · 공용 리소스(Style)</text>
  <line x1="242" y1="92" x2="286" y2="92" class="ln" stroke-width="2" marker-end="url(#c02a1)"/>
  <text x="264" y="82" text-anchor="middle" class="tx-m">띄운다</text>
  <rect x="290" y="10" width="460" height="140" rx="12" class="card-bg"/>
  <text x="520" y="38" text-anchor="middle" class="tx-b">MainWindow — 한 클래스를 두 파일에 나눠 씀 (partial)</text>
  <rect x="306" y="52" width="205" height="82" rx="8" class="p2s"/>
  <text x="408" y="74" text-anchor="middle" class="tx">MainWindow.xaml</text>
  <text x="408" y="94" text-anchor="middle" class="tx-m">화면: Grid · Button · Image</text>
  <text x="408" y="114" text-anchor="middle" class="tx-m">x:Name · Click="..."</text>
  <rect x="529" y="52" width="205" height="82" rx="8" class="p3s"/>
  <text x="631" y="74" text-anchor="middle" class="tx">MainWindow.xaml.cs</text>
  <text x="631" y="94" text-anchor="middle" class="tx-m">코드 비하인드(code-behind)</text>
  <text x="631" y="114" text-anchor="middle" class="tx-m">이벤트 핸들러 + Mat 처리</text>
  <line x1="513" y1="93" x2="527" y2="93" class="ln" stroke-width="2"/>
  <rect x="10" y="166" width="740" height="144" rx="12" class="card-bg"/>
  <text x="380" y="192" text-anchor="middle" class="tx-b">빌드하면 XAML 이 C# 으로 번역되어 같은 클래스에 합쳐진다</text>
  <rect x="30" y="206" width="210" height="88" rx="8" class="p1s"/>
  <text x="135" y="230" text-anchor="middle" class="tx">MainWindow.g.i.cs (자동 생성)</text>
  <text x="135" y="252" text-anchor="middle" class="tx-m">InitializeComponent()</text>
  <text x="135" y="274" text-anchor="middle" class="tx-m">internal Image MainImage;</text>
  <line x1="242" y1="250" x2="286" y2="250" class="ln" stroke-width="2" marker-end="url(#c02a1)"/>
  <rect x="290" y="206" width="210" height="88" rx="8" class="p4s"/>
  <text x="395" y="230" text-anchor="middle" class="tx">생성자에서 호출</text>
  <text x="395" y="252" text-anchor="middle" class="tx-m">public MainWindow() {</text>
  <text x="395" y="274" text-anchor="middle" class="tx-m">  InitializeComponent(); }</text>
  <line x1="502" y1="250" x2="546" y2="250" class="ln" stroke-width="2" marker-end="url(#c02a1)"/>
  <rect x="550" y="206" width="184" height="88" rx="8" class="p5s"/>
  <text x="642" y="230" text-anchor="middle" class="tx">이제 코드에서</text>
  <text x="642" y="252" text-anchor="middle" class="tx-m">MainImage.Source = ...</text>
  <text x="642" y="274" text-anchor="middle" class="tx-m">InfoText.Text = "..."</text>
</svg>`;

  // 그림 2: MainWindow 의 Grid 3행 배치
  const FIG_LAYOUT = `<svg viewBox="0 0 760 340" role="img" aria-label="Grid 3행 배치: 위 툴바 Auto, 가운데 이미지 별표, 아래 상태 표시줄 Auto">
  ${ARROW('c02a2')}
  <rect x="10" y="10" width="440" height="320" rx="12" class="card-bg"/>
  <text x="230" y="36" text-anchor="middle" class="tx-b">MainWindow 화면 (Grid 3행)</text>
  <rect x="30" y="50" width="400" height="48" rx="6" class="p1s"/>
  <text x="230" y="72" text-anchor="middle" class="tx">[열기] [흑백] [Canny] [저장]</text>
  <text x="230" y="90" text-anchor="middle" class="tx-m">Row 0 · StackPanel / ToolBar</text>
  <rect x="30" y="106" width="400" height="160" rx="6" class="p2s"/>
  <text x="230" y="170" text-anchor="middle" class="tx">Image x:Name="MainImage"</text>
  <text x="230" y="194" text-anchor="middle" class="tx-m">Row 1 · 남은 공간 전부</text>
  <text x="230" y="216" text-anchor="middle" class="tx-m">Source = Mat 을 바꾼 BitmapSource</text>
  <rect x="30" y="274" width="400" height="42" rx="6" class="p3s"/>
  <text x="230" y="292" text-anchor="middle" class="tx">640 x 480 · 채널 3 · CV_8UC3</text>
  <text x="230" y="310" text-anchor="middle" class="tx-m">Row 2 · StatusBar (TextBlock)</text>
  <rect x="470" y="10" width="280" height="320" rx="12" class="card-bg"/>
  <text x="610" y="36" text-anchor="middle" class="tx-b">RowDefinitions 의 세 가지 높이</text>
  <rect x="486" y="52" width="248" height="76" rx="8" class="p1s"/>
  <text x="610" y="76" text-anchor="middle" class="tx">Height="Auto"</text>
  <text x="610" y="98" text-anchor="middle" class="tx-m">내용에 꼭 맞는 높이</text>
  <text x="610" y="118" text-anchor="middle" class="tx-m">버튼 줄 · 상태 표시줄</text>
  <rect x="486" y="140" width="248" height="76" rx="8" class="p2s"/>
  <text x="610" y="164" text-anchor="middle" class="tx">Height="*"</text>
  <text x="610" y="186" text-anchor="middle" class="tx-m">남은 공간을 비율로 나눠 갖기</text>
  <text x="610" y="206" text-anchor="middle" class="tx-m">2* : 3* = 40% : 60%</text>
  <rect x="486" y="228" width="248" height="76" rx="8" class="p4s"/>
  <text x="610" y="252" text-anchor="middle" class="tx">Height="120"</text>
  <text x="610" y="274" text-anchor="middle" class="tx-m">고정 크기 (장치 독립 단위)</text>
  <text x="610" y="294" text-anchor="middle" class="tx-m">창 크기가 바뀌어도 그대로</text>
</svg>`;

  // 그림 3: Mat → BitmapSource → Image.Source
  const FIG_CONVERT = `<svg viewBox="0 0 760 300" role="img" aria-label="Mat 의 픽셀 데이터가 BitmapSource 로 복사되어 Image 컨트롤에 표시되는 과정">
  ${ARROW('c02a3')}
  <rect x="10" y="10" width="740" height="150" rx="12" class="card-bg"/>
  <rect x="26" y="40" width="190" height="100" rx="8" class="p1s"/>
  <text x="121" y="64" text-anchor="middle" class="tx-b">Mat (네이티브 힙)</text>
  <text x="121" y="88" text-anchor="middle" class="tx-m">CV_8UC3 · BGR 순서</text>
  <text x="121" y="110" text-anchor="middle" class="tx-m">한 행 = Width × 3 바이트</text>
  <text x="121" y="130" text-anchor="middle" class="tx-m">C++ OpenCV 가 소유</text>
  <line x1="218" y1="90" x2="268" y2="90" class="ln" stroke-width="2" marker-end="url(#c02a3)"/>
  <text x="243" y="80" text-anchor="middle" class="tx-m">복사</text>
  <rect x="272" y="40" width="216" height="100" rx="8" class="p2s"/>
  <text x="380" y="64" text-anchor="middle" class="tx-b">BitmapSourceConverter</text>
  <text x="380" y="88" text-anchor="middle" class="tx-m">.ToBitmapSource(mat)</text>
  <text x="380" y="110" text-anchor="middle" class="tx-m">= 확장 메서드 mat.ToBitmapSource()</text>
  <text x="380" y="130" text-anchor="middle" class="tx-m">OpenCvSharp4.WpfExtensions</text>
  <line x1="490" y1="90" x2="540" y2="90" class="ln" stroke-width="2" marker-end="url(#c02a3)"/>
  <rect x="544" y="40" width="190" height="100" rx="8" class="p3s"/>
  <text x="639" y="64" text-anchor="middle" class="tx-b">BitmapSource (관리 힙)</text>
  <text x="639" y="88" text-anchor="middle" class="tx-m">PixelFormat · 96 DPI</text>
  <text x="639" y="110" text-anchor="middle" class="tx-m">Image.Source 에 대입</text>
  <text x="639" y="130" text-anchor="middle" class="tx-m">GC 가 관리 (Dispose 없음)</text>
  <rect x="10" y="176" width="740" height="114" rx="12" class="card-bg"/>
  <text x="380" y="202" text-anchor="middle" class="tx-b">Mat 의 형식이 PixelFormat 을 정한다</text>
  <rect x="30" y="216" width="170" height="60" rx="8" class="p1s"/>
  <text x="115" y="240" text-anchor="middle" class="tx">CV_8UC1 (흑백)</text>
  <text x="115" y="262" text-anchor="middle" class="tx-m">→ Gray8 · 1바이트</text>
  <rect x="212" y="216" width="170" height="60" rx="8" class="p2s"/>
  <text x="297" y="240" text-anchor="middle" class="tx">CV_8UC3 (BGR)</text>
  <text x="297" y="262" text-anchor="middle" class="tx-m">→ Bgr24 · 3바이트</text>
  <rect x="394" y="216" width="170" height="60" rx="8" class="p3s"/>
  <text x="479" y="240" text-anchor="middle" class="tx">CV_8UC4 (BGRA)</text>
  <text x="479" y="262" text-anchor="middle" class="tx-m">→ Bgra32 · 4바이트</text>
  <rect x="576" y="216" width="158" height="60" rx="8" class="p5s"/>
  <text x="655" y="240" text-anchor="middle" class="tx">CV_32FC3 (float)</text>
  <text x="655" y="262" text-anchor="middle" class="tx-m">→ ConvertTo 먼저!</text>
</svg>`;

  // 그림 4: 매번 새 BitmapSource vs WriteableBitmap 재사용
  const FIG_WB = `<svg viewBox="0 0 760 270" role="img" aria-label="프레임마다 새 BitmapSource 를 만드는 방식과 WriteableBitmap 하나를 재사용하는 방식의 비교">
  ${ARROW('c02a4')}
  <rect x="10" y="10" width="740" height="118" rx="12" class="card-bg"/>
  <text x="30" y="36" class="tx-b">방식 A · 프레임마다 ToBitmapSource() — 코드가 짧다 (버튼 한 번 누르는 처리에 알맞음)</text>
  <rect x="30" y="50" width="120" height="62" rx="8" class="p1s"/><text x="90" y="74" text-anchor="middle" class="tx">Mat 프레임</text><text x="90" y="96" text-anchor="middle" class="tx-m">640×480×3</text>
  <line x1="152" y1="80" x2="186" y2="80" class="ln" stroke-width="2" marker-end="url(#c02a4)"/>
  <rect x="190" y="50" width="200" height="62" rx="8" class="p2s"/><text x="290" y="74" text-anchor="middle" class="tx">새 BitmapSource 생성</text><text x="290" y="96" text-anchor="middle" class="tx-m">921,600 바이트 새로 할당</text>
  <line x1="392" y1="80" x2="426" y2="80" class="ln" stroke-width="2" marker-end="url(#c02a4)"/>
  <rect x="430" y="50" width="150" height="62" rx="8" class="p3s"/><text x="505" y="74" text-anchor="middle" class="tx">Image.Source 교체</text><text x="505" y="96" text-anchor="middle" class="tx-m">이전 것은 GC 대기</text>
  <rect x="596" y="50" width="138" height="62" rx="8" class="p5s"/><text x="665" y="74" text-anchor="middle" class="tx-m">30 fps × 0.9 MB</text><text x="665" y="96" text-anchor="middle" class="tx-m">= 초당 27 MB 쓰레기</text>
  <rect x="10" y="144" width="740" height="118" rx="12" class="card-bg"/>
  <text x="30" y="170" class="tx-b">방식 B · WriteableBitmap 하나를 만들어 픽셀만 덮어쓰기 — 카메라 · 동영상에 알맞음</text>
  <rect x="30" y="184" width="120" height="62" rx="8" class="p1s"/><text x="90" y="208" text-anchor="middle" class="tx">Mat 프레임</text><text x="90" y="230" text-anchor="middle" class="tx-m">크기·형식 고정</text>
  <line x1="152" y1="214" x2="186" y2="214" class="ln" stroke-width="2" marker-end="url(#c02a4)"/>
  <rect x="190" y="184" width="200" height="62" rx="8" class="p2s"/><text x="290" y="208" text-anchor="middle" class="tx">WritePixels(...)</text><text x="290" y="230" text-anchor="middle" class="tx-m">같은 버퍼에 덮어쓰기</text>
  <line x1="392" y1="214" x2="426" y2="214" class="ln" stroke-width="2" marker-end="url(#c02a4)"/>
  <rect x="430" y="184" width="150" height="62" rx="8" class="p3s"/><text x="505" y="208" text-anchor="middle" class="tx">Image.Source 그대로</text><text x="505" y="230" text-anchor="middle" class="tx-m">화면만 다시 그린다</text>
  <rect x="596" y="184" width="138" height="62" rx="8" class="p4s"/><text x="665" y="208" text-anchor="middle" class="tx-m">할당 0 · GC 부담 없음</text><text x="665" y="230" text-anchor="middle" class="tx-m">크기 바뀌면 새로 만들기</text>
</svg>`;

  // 그림 5: 이미지 뷰어 앱의 데이터 흐름
  const FIG_VIEWER = `<svg viewBox="0 0 760 330" role="img" aria-label="이미지 뷰어의 흐름: 파일 열기에서 원본 Mat 보관, 필터 버튼, 표시용 Mat, 화면 표시와 저장까지">
  ${ARROW('c02a5')}
  <rect x="10" y="10" width="740" height="130" rx="12" class="card-bg"/>
  <text x="380" y="36" text-anchor="middle" class="tx-b">① 열기 → ② 원본 보관 → ③ 필터 → ④ 표시 → ⑤ 저장</text>
  <rect x="26" y="52" width="130" height="72" rx="8" class="p1s"/><text x="91" y="76" text-anchor="middle" class="tx">① OpenFileDialog</text><text x="91" y="96" text-anchor="middle" class="tx-m">또는 드래그앤드롭</text><text x="91" y="116" text-anchor="middle" class="tx-m">ImageFile.Load</text>
  <line x1="158" y1="88" x2="180" y2="88" class="ln" stroke-width="2" marker-end="url(#c02a5)"/>
  <rect x="182" y="52" width="130" height="72" rx="8" class="p2s"/><text x="247" y="76" text-anchor="middle" class="tx">② _original</text><text x="247" y="96" text-anchor="middle" class="tx-m">BGR 3채널 필드</text><text x="247" y="116" text-anchor="middle" class="tx-m">새로 열면 이전 것 Dispose</text>
  <line x1="314" y1="88" x2="336" y2="88" class="ln" stroke-width="2" marker-end="url(#c02a5)"/>
  <rect x="338" y="52" width="130" height="72" rx="8" class="p3s"/><text x="403" y="76" text-anchor="middle" class="tx">③ 버튼 Click</text><text x="403" y="96" text-anchor="middle" class="tx-m">흑백 · Canny · 원본</text><text x="403" y="116" text-anchor="middle" class="tx-m">_original 은 건드리지 않음</text>
  <line x1="470" y1="88" x2="492" y2="88" class="ln" stroke-width="2" marker-end="url(#c02a5)"/>
  <rect x="494" y="52" width="130" height="72" rx="8" class="p4s"/><text x="559" y="76" text-anchor="middle" class="tx">④ _display</text><text x="559" y="96" text-anchor="middle" class="tx-m">SetDisplay(mat, 이름)</text><text x="559" y="116" text-anchor="middle" class="tx-m">ToBitmapSource → Image</text>
  <line x1="626" y1="88" x2="648" y2="88" class="ln" stroke-width="2" marker-end="url(#c02a5)"/>
  <rect x="650" y="52" width="84" height="72" rx="8" class="p5s"/><text x="692" y="80" text-anchor="middle" class="tx">⑤ 저장</text><text x="692" y="102" text-anchor="middle" class="tx-m">ImEncode</text>
  <rect x="10" y="156" width="360" height="164" rx="12" class="card-bg"/>
  <text x="190" y="182" text-anchor="middle" class="tx-b">Mat 두 개를 필드로 보관하는 이유</text>
  <rect x="26" y="196" width="328" height="52" rx="8" class="p2s"/><text x="190" y="218" text-anchor="middle" class="tx">_original — 파일 그대로. 절대 바꾸지 않는다</text><text x="190" y="238" text-anchor="middle" class="tx-m">[원본] 버튼 · 다른 필터를 다시 적용할 때 필요</text>
  <rect x="26" y="256" width="328" height="52" rx="8" class="p4s"/><text x="190" y="278" text-anchor="middle" class="tx">_display — 지금 화면에 보이는 것</text><text x="190" y="298" text-anchor="middle" class="tx-m">교체할 때마다 이전 것 Dispose · 저장 대상</text>
  <rect x="390" y="156" width="360" height="164" rx="12" class="card-bg"/>
  <text x="570" y="182" text-anchor="middle" class="tx-b">예외는 앱을 죽이지 않게</text>
  <rect x="406" y="196" width="328" height="34" rx="8" class="p1s"/><text x="570" y="218" text-anchor="middle" class="tx-m">읽기 실패 → 빈 Mat → 직접 예외를 던져 알림</text>
  <rect x="406" y="238" width="328" height="34" rx="8" class="p3s"/><text x="570" y="260" text-anchor="middle" class="tx-m">OpenCVException → MessageBox 로 원인 표시</text>
  <rect x="406" y="280" width="328" height="34" rx="8" class="p5s"/><text x="570" y="302" text-anchor="middle" class="tx-m">창을 닫을 때 OnClosed 에서 두 Mat 모두 Dispose</text>
</svg>`;

  // ---------------------------------------------------------------- 1교시 코드
  const SH_WPF_NEW = `# WPF 프로젝트 만들기 (.NET 8) + OpenCvSharp 패키지 3개
dotnet new wpf -n WpfFirst -f net8.0
cd WpfFirst

dotnet add package OpenCvSharp4
dotnet add package OpenCvSharp4.runtime.win
dotnet add package OpenCvSharp4.WpfExtensions   # WPF 전용: Mat <-> BitmapSource

dotnet run`;

  const XML_WPF_CSPROJ = `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>              <!-- 콘솔 창 없이 창만 띄운다 -->
    <TargetFramework>net8.0-windows</TargetFramework>
    <UseWPF>true</UseWPF>                        <!-- XAML 빌드를 켠다 -->
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="OpenCvSharp4" Version="4.10.0.20241108" />
    <PackageReference Include="OpenCvSharp4.runtime.win" Version="4.10.0.20241108" />
    <PackageReference Include="OpenCvSharp4.WpfExtensions" Version="4.10.0.20241108" />
  </ItemGroup>

  <ItemGroup>
    <!-- 예제 이미지를 실행 폴더의 images/ 로 복사 (01차시와 같은 설정) -->
    <Content Include="images/**" CopyToOutputDirectory="PreserveNewest" />
  </ItemGroup>

</Project>`;

  const XML_HELLO = `<Window x:Class="WpfFirst.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="첫 WPF 창" Height="480" Width="720">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" />   <!-- 0행: 버튼 줄 — 내용만큼 -->
            <RowDefinition Height="*" />      <!-- 1행: 이미지 — 남은 공간 전부 -->
            <RowDefinition Height="Auto" />   <!-- 2행: 상태 표시줄 -->
        </Grid.RowDefinitions>

        <!-- StackPanel: 자식을 한 방향으로 차례차례 쌓는다 -->
        <StackPanel Grid.Row="0" Orientation="Horizontal" Margin="6">
            <Button x:Name="OpenButton" Content="열기" Width="80" Margin="2"
                    Click="OpenButton_Click" />
            <Button x:Name="GrayButton" Content="흑백" Width="80" Margin="2"
                    Click="GrayButton_Click" />
        </StackPanel>

        <!-- x:Name 을 붙이면 코드 비하인드에서 같은 이름의 필드로 쓸 수 있다 -->
        <Image x:Name="MainImage" Grid.Row="1" Stretch="Uniform" Margin="6" />

        <TextBlock x:Name="InfoText" Grid.Row="2" Margin="8,4"
                   Text="[열기] 를 누르세요." />
    </Grid>
</Window>`;

  const XML_GRID = `<!-- 행 2개 x 열 2개, 열 너비는 2 : 3 비율 -->
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="60" />     <!-- 고정 60 -->
        <RowDefinition Height="*" />      <!-- 남은 전부 -->
    </Grid.RowDefinitions>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="2*" />   <!-- 40% -->
        <ColumnDefinition Width="3*" />   <!-- 60% -->
    </Grid.ColumnDefinitions>

    <TextBlock Grid.Row="0" Grid.Column="0" Text="0행 0열" />
    <TextBlock Grid.Row="0" Grid.Column="1" Text="0행 1열" />
    <Image     Grid.Row="1" Grid.Column="0" x:Name="LeftImage"  Stretch="Uniform" />
    <Image     Grid.Row="1" Grid.Column="1" x:Name="RightImage" Stretch="Uniform" />

    <!-- 두 칸을 합쳐 쓰려면 ColumnSpan -->
    <TextBlock Grid.Row="1" Grid.Column="0" Grid.ColumnSpan="2"
               Text="가운데 안내" HorizontalAlignment="Center" VerticalAlignment="Bottom" />
</Grid>`;

  const CS_CODEBEHIND = `using System.Windows;
using OpenCvSharp;

namespace WpfFirst;

// XAML 이 만드는 절반(InitializeComponent · x:Name 필드)과 합쳐지므로 partial 입니다
public partial class MainWindow : Window
{
    private Mat? _src;          // 원본 Mat 을 '필드' 로 보관 (지역 변수가 아니다!)

    public MainWindow()
    {
        InitializeComponent();  // XAML 을 읽어 컨트롤을 만들고 x:Name 필드를 채운다
        InfoText.Text = "[열기] 를 누르세요.";   // 이 줄보다 위에서 쓰면 null 오류!
    }

    // XAML 의 Click="OpenButton_Click" 과 이름이 같아야 한다
    private void OpenButton_Click(object sender, RoutedEventArgs e)
    {
        _src?.Dispose();        // 이전 원본을 먼저 해제
        _src = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        if (_src.Empty())
        {
            InfoText.Text = "이미지를 읽지 못했습니다.";
            return;
        }
        InfoText.Text = $"{_src.Width} x {_src.Height} · 채널 {_src.Channels()}";
        // 화면에 띄우는 코드는 2교시에서! (MainImage.Source = _src.ToBitmapSource();)
    }

    private void GrayButton_Click(object sender, RoutedEventArgs e)
    {
        if (_src == null) { InfoText.Text = "먼저 이미지를 열어 주세요."; return; }
        using var gray = new Mat();
        Cv2.CvtColor(_src, gray, ColorConversionCodes.BGR2GRAY);
        InfoText.Text = $"흑백으로 바꿨습니다 · 채널 {gray.Channels()} · {gray.Type()}";
    }

    protected override void OnClosed(EventArgs e)
    {
        _src?.Dispose();        // 창이 닫힐 때 네이티브 메모리 정리
        base.OnClosed(e);
    }
}`;

  const EX_EVENT = `using System;
using OpenCvSharp;

// WPF 의 Button.Click 과 같은 구조를 콘솔로 흉내 냅니다 (이벤트 + 핸들러 메서드)
delegate void ClickHandler(string name);

class FakeButton
{
    public string Content;
    public event ClickHandler Click;                 // XAML 의 Click="..." 자리
    public FakeButton(string content) { Content = content; }
    public void Press() { Click?.Invoke(Content); }   // 사용자가 누르면 핸들러가 불린다
}

class Program
{
    static Mat src;                                  // WPF 의 '필드' 처럼 보관

    static void OnGray(string who)
    {
        using var gray = src.CvtColor(ColorConversionCodes.BGR2GRAY);
        Console.WriteLine($"[{who}] 클릭 -> {gray.Channels()}채널 {gray.Type()} 평균={Cv2.Mean(gray).Val0:F1}");
    }

    static void OnCanny(string who)
    {
        using var gray = src.CvtColor(ColorConversionCodes.BGR2GRAY);
        using var edges = gray.Canny(80, 160);
        Console.WriteLine($"[{who}] 클릭 -> 에지 픽셀 {Cv2.CountNonZero(edges)}개");
    }

    static void Main()
    {
        src = Cv2.ImRead("images/sample_color.png");
        var grayBtn = new FakeButton("흑백");
        var cannyBtn = new FakeButton("Canny");
        grayBtn.Click += OnGray;                     // XAML 이 대신 해 주는 연결
        cannyBtn.Click += OnCanny;
        Console.WriteLine("버튼 2개 준비 완료");
        grayBtn.Press();
        cannyBtn.Press();
        src.Dispose();
    }
}`;

  const EX_GRID = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // XAML Grid 의 행 높이(Auto · * · Auto)와 열 너비(2* · 3*)를 직접 계산해 봅니다
        int W = 600, H = 300;
        int[] rowH = { 60, H - 60 - 40, 40 };     // Auto(60) · *(남은 것) · Auto(40)
        int[] colW = { W * 2 / 5, W * 3 / 5 };    // 2* : 3*
        using var canvas = new Mat(H, W, MatType.CV_8UC3, new Scalar(45, 45, 45));
        int y = 0;
        for (int r = 0; r < rowH.Length; r++)
        {
            int x = 0;
            for (int c = 0; c < colW.Length; c++)
            {
                var cell = new Rect(x, y, colW[c], rowH[r]);
                Cv2.Rectangle(canvas, cell, new Scalar(90, 190, 90), 2);
                Cv2.PutText(canvas, $"{r},{c}", new Point(x + 10, y + 26), HersheyFonts.HersheySimplex, 0.7, Scalar.White, 1);
                Console.WriteLine($"Grid.Row={r} Grid.Column={c} -> x={cell.X,3} y={cell.Y,3} w={cell.Width,3} h={cell.Height,3}");
                x += colW[c];
            }
            y += rowH[r];
        }
        Cv2.ImShow("grid", canvas);
        Cv2.WaitKey(0);
    }
}`;

  const EX_STACK = `using System;
using OpenCvSharp;

class Program
{
    // WPF StatusBar 의 TextBlock 에 넣을 문자열 (뷰어 앱과 같은 형식)
    static string InfoLine(string name, Mat m)
        => $"{name}  |  {m.Width} x {m.Height}  |  채널 {m.Channels()}  |  {m.Type()}";

    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_color.png");
        using var small = src.Resize(new Size(200, 150), 0, 0, InterpolationFlags.Area);
        using var gray = small.CvtColor(ColorConversionCodes.BGR2GRAY);
        using var gray3 = gray.CvtColor(ColorConversionCodes.GRAY2BGR);   // 3채널로 맞춰야 이어 붙는다

        // StackPanel Orientation="Horizontal" 처럼 가로로 이어 붙이기
        using var row = new Mat();
        Cv2.HConcat(new Mat[] { small, gray3 }, row);
        // Orientation="Vertical" 처럼 세로로
        using var panel = new Mat();
        Cv2.VConcat(new Mat[] { row, row }, panel);

        Console.WriteLine(InfoLine("원본", src));
        Console.WriteLine(InfoLine("가로 2칸 (HConcat)", row));
        Console.WriteLine(InfoLine("세로 2줄 (VConcat)", panel));
        Cv2.ImShow("StackPanel 흉내", panel);
        Cv2.WaitKey(0);
    }
}`;

  // ---------------------------------------------------------------- 2교시 코드
  const CS_TOBITMAP = `using System.Windows;
using System.Windows.Media.Imaging;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;      // ← 이 using 이 ToBitmapSource() 를 데려온다
using Window = System.Windows.Window; // OpenCvSharp.Window 와 이름이 겹치므로 별칭

namespace WpfFirst;

public partial class MainWindow : Window
{
    private Mat? _src;

    private void OpenButton_Click(object sender, RoutedEventArgs e)
    {
        _src?.Dispose();
        _src = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        if (_src.Empty()) { InfoText.Text = "읽기 실패"; return; }
        ShowMat(_src);
    }

    private void GrayButton_Click(object sender, RoutedEventArgs e)
    {
        if (_src == null) return;
        using var gray = new Mat();
        Cv2.CvtColor(_src, gray, ColorConversionCodes.BGR2GRAY);
        ShowMat(gray);                 // 표시가 끝나면 gray 는 해제해도 된다 (픽셀이 복사되었다)
    }

    // Mat 을 화면에 띄우는 단 한 줄이 핵심입니다
    private void ShowMat(Mat mat)
    {
        // 방법 1: 확장 메서드 (가장 많이 쓴다)
        MainImage.Source = mat.ToBitmapSource();

        // 방법 2: 변환기를 직접 호출 — 위와 완전히 같은 일
        BitmapSource bs = BitmapSourceConverter.ToBitmapSource(mat);
        MainImage.Source = bs;

        InfoText.Text = $"{mat.Width} x {mat.Height} · 채널 {mat.Channels()} · {mat.Type()}";
    }

    protected override void OnClosed(EventArgs e) { _src?.Dispose(); base.OnClosed(e); }
}`;

  const CS_WRITEABLE = `using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;
using Window = System.Windows.Window;

namespace WpfFirst;

public partial class MainWindow : Window
{
    private WriteableBitmap? _wb;   // 한 번 만들어 계속 재사용한다

    // 카메라 · 동영상처럼 같은 크기의 프레임을 연달아 보여 줄 때 (15차시)
    private void UpdateFrame(Mat frame)
    {
        if (_wb == null || _wb.PixelWidth != frame.Width || _wb.PixelHeight != frame.Height)
        {
            PixelFormat fmt = frame.Channels() switch
            {
                1 => PixelFormats.Gray8,
                3 => PixelFormats.Bgr24,
                4 => PixelFormats.Bgra32,
                _ => throw new NotSupportedException($"채널 {frame.Channels()} 는 표시할 수 없습니다")
            };
            _wb = new WriteableBitmap(frame.Width, frame.Height, 96, 96, fmt, null);
            MainImage.Source = _wb;      // Source 는 처음 한 번만 대입
        }

        // OpenCvSharp 이 제공하는 도우미 (안쪽에서 WritePixels 를 부른다)
        WriteableBitmapConverter.ToWriteableBitmap(frame, _wb);

        // 직접 쓰고 싶다면 (frame 은 연속 메모리여야 한다 → 필요하면 Clone())
        // _wb.WritePixels(new Int32Rect(0, 0, frame.Width, frame.Height),
        //                 frame.Data, (int)frame.Step() * frame.Height, (int)frame.Step());
    }
}`;

  const CS_TOMAT = `using System.Windows;
using System.Windows.Media.Imaging;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;
using Window = System.Windows.Window;

namespace WpfFirst;

public partial class MainWindow : Window
{
    // 화면(BitmapSource) → Mat : 클립보드 · 스크린샷 · 다른 WPF 컨트롤의 그림을 처리할 때
    private void PasteButton_Click(object sender, RoutedEventArgs e)
    {
        if (!Clipboard.ContainsImage()) { InfoText.Text = "클립보드에 이미지가 없습니다."; return; }
        BitmapSource bs = Clipboard.GetImage();

        using Mat pasted = BitmapSourceConverter.ToMat(bs);   // 보통 BGRA 4채널로 온다
        using Mat bgr = pasted.Channels() == 4
            ? pasted.CvtColor(ColorConversionCodes.BGRA2BGR)  // 알파를 버려 3채널로
            : pasted.Clone();

        InfoText.Text = $"붙여넣기: {bgr.Width} x {bgr.Height} · 채널 {bgr.Channels()}";
        MainImage.Source = bgr.ToBitmapSource();
    }
}`;

  const XML_IMAGE_OPT = `<!-- 큰 이미지를 칸에 맞춰 보여 주기 -->
<Image x:Name="MainImage" Stretch="Uniform" />         <!-- 비율 유지, 칸에 맞게 축소/확대 -->

<!-- 1 픽셀 = 1 화면 단위로 정확히 보고 싶을 때 (뷰어 앱에서 사용) -->
<ScrollViewer HorizontalScrollBarVisibility="Auto" VerticalScrollBarVisibility="Auto">
    <Image x:Name="MainImage" Stretch="None"
           RenderOptions.BitmapScalingMode="NearestNeighbor">  <!-- 확대하면 픽셀이 네모로 -->
        <Image.LayoutTransform>
            <ScaleTransform x:Name="ZoomTransform" ScaleX="1" ScaleY="1" />
        </Image.LayoutTransform>
    </Image>
</ScrollViewer>`;

  const EX_FORMAT = `using System;
using OpenCvSharp;

class Program
{
    // Mat 의 형식(MatType)이 WPF BitmapSource 의 PixelFormat 을 정합니다
    static string PixelFormatOf(Mat m)
    {
        if (m.Type() == MatType.CV_8UC1) return "PixelFormats.Gray8";
        if (m.Type() == MatType.CV_8UC3) return "PixelFormats.Bgr24";
        if (m.Type() == MatType.CV_8UC4) return "PixelFormats.Bgra32";
        return "변환 불가 -> ConvertTo 로 CV_8U 로 바꾸기";
    }

    static void Main()
    {
        using var bgr = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        using var gray = Cv2.ImRead("images/sample_color.png", ImreadModes.Grayscale);
        using var bgra = bgr.CvtColor(ColorConversionCodes.BGR2BGRA);
        using var f32 = new Mat();
        bgr.ConvertTo(f32, MatType.CV_32FC3, 1.0 / 255);    // 0~1 실수 (계산용 형식)

        Mat[] mats = { gray, bgr, bgra, f32 };
        string[] names = { "Gray", "BGR", "BGRA", "float" };
        for (int i = 0; i < mats.Length; i++)
            Console.WriteLine($"{names[i],-6} {mats[i].Type(),-9} 채널 {mats[i].Channels()}  픽셀당 {mats[i].ElemSize()}바이트  한 행 {mats[i].Width * mats[i].ElemSize()}바이트 -> {PixelFormatOf(mats[i])}");

        // WriteableBitmap.WritePixels 는 '연속된' 메모리와 stride(한 행 바이트 수)를 요구합니다
        Console.WriteLine($"BGR 전체 {bgr.Total() * bgr.ElemSize()}바이트, 연속(IsContinuous) = {bgr.IsContinuous()}");
        using var roi = new Mat(bgr, new Rect(100, 80, 200, 150));
        Console.WriteLine($"ROI 200x150 의 IsContinuous = {roi.IsContinuous()} -> 그대로 넘기면 안 됩니다. Clone() 하세요");
    }
}`;

  const EX_BGRORDER = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var bgr = Cv2.ImRead("images/sample_color.png");
        Vec3b a = bgr.At<Vec3b>(80, 120);      // 빨간 원 위의 한 픽셀 (행 80, 열 120)
        Console.WriteLine($"Mat 의 메모리 순서            : [0]={a.Item0} [1]={a.Item1} [2]={a.Item2}");
        Console.WriteLine("Bgr24 로 해석 -> B=" + a.Item0 + " G=" + a.Item1 + " R=" + a.Item2 + " (빨강, 맞음)");
        Console.WriteLine("Rgb24 로 해석 -> R=" + a.Item0 + " G=" + a.Item1 + " B=" + a.Item2 + " (빨강이 파랑으로!)");

        // 일부러 채널 순서를 바꿔 '잘못된 PixelFormat' 을 눈으로 확인합니다
        using var swapped = bgr.CvtColor(ColorConversionCodes.BGR2RGB);
        Vec3b b = swapped.At<Vec3b>(80, 120);
        Console.WriteLine($"BGR2RGB 로 바꾼 Mat 의 순서   : [0]={b.Item0} [1]={b.Item1} [2]={b.Item2}");
        Cv2.ImShow("정상 (BGR)", bgr);
        Cv2.ImShow("채널 뒤바뀜", swapped);
        Cv2.WaitKey(0);
    }
}`;

  const EX_FIT = `using System;
using OpenCvSharp;

class Program
{
    // Image 컨트롤이 차지하는 크기(maxW x maxH) 안에 들어가도록 축소한 새 Mat
    static Mat FitTo(Mat src, int maxW, int maxH)
    {
        double s = Math.Min((double)maxW / src.Width, (double)maxH / src.Height);
        if (s >= 1.0) return src.Clone();                 // 이미 작으면 그대로
        var size = new Size((int)Math.Round(src.Width * s), (int)Math.Round(src.Height * s));
        return src.Resize(size, 0, 0, InterpolationFlags.Area);   // 축소는 Area 가 가장 깔끔
    }

    static void Main()
    {
        using var big = Cv2.ImRead("images/plate_holes.png", ImreadModes.Grayscale);
        using var view = FitTo(big, 320, 240);
        double ratio = (double)view.Width / big.Width;
        Console.WriteLine($"원본 {big.Width}x{big.Height} -> 표시용 {view.Width}x{view.Height} (배율 {ratio:F3})");
        Console.WriteLine($"메모리 {big.Total() * big.ElemSize()}바이트 -> {view.Total() * view.ElemSize()}바이트");

        // 역변환 맛보기: WPF 의 Mat -> BitmapSource -> Mat 왕복 대신 PNG 바이트로 왕복
        Cv2.ImEncode(".png", view, out byte[] png);
        using var back = Cv2.ImDecode(png, ImreadModes.Grayscale);
        using var diff = new Mat();
        Cv2.Absdiff(view, back, diff);
        Console.WriteLine($"PNG 바이트 {png.Length}개로 왕복 -> 다른 픽셀 {Cv2.CountNonZero(diff)}개");

        Cv2.ImShow("view", view);
        Cv2.WaitKey(0);
    }
}`;

  const EX_PERF = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var src = Cv2.ImRead("images/sample_color.png");
        using var gray = new Mat();      // 출력 Mat 을 반복 밖에서 한 번만 만들어 재사용
        using var blur = new Mat();
        using var edges = new Mat();

        int frames = 20;
        double freq = Cv2.GetTickFrequency();
        long t0 = Cv2.GetTickCount();
        for (int i = 0; i < frames; i++)
        {
            Cv2.CvtColor(src, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.GaussianBlur(gray, blur, new Size(5, 5), 0);
            Cv2.Canny(blur, edges, 80, 160);
        }
        double ms = (Cv2.GetTickCount() - t0) / freq * 1000;

        Console.WriteLine($"{frames}프레임 처리: 전체 {ms:F0} ms, 한 프레임 {ms / frames:F1} ms");
        Console.WriteLine($"이 속도라면 초당 약 {1000.0 / (ms / frames):F0} 프레임을 갱신할 수 있습니다");
        Console.WriteLine($"마지막 프레임 에지 픽셀 {Cv2.CountNonZero(edges)}개");
        Cv2.ImShow("edges", edges);
        Cv2.WaitKey(0);
    }
}`;

  // ---------------------------------------------------------------- 3교시 코드 (wpf/Ch02_ImageViewer 실제 코드)
  const XML_VIEWER = `<Window x:Class="Ch02_ImageViewer.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="02차시 이미지 뷰어" Height="680" Width="1000"
        WindowStartupLocation="CenterScreen"
        AllowDrop="True" DragOver="Window_DragOver" Drop="Window_Drop">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" />
            <RowDefinition Height="*" />
            <RowDefinition Height="Auto" />
        </Grid.RowDefinitions>

        <!-- 상단 툴바 -->
        <ToolBar Grid.Row="0">
            <Button Content="열기" Click="OpenButton_Click" Style="{StaticResource ToolButton}" />
            <Separator />
            <Button Content="흑백" Click="GrayButton_Click" Style="{StaticResource ToolButton}" />
            <Button Content="Canny" Click="CannyButton_Click" Style="{StaticResource ToolButton}" />
            <Button Content="원본" Click="OriginalButton_Click" Style="{StaticResource ToolButton}" />
            <Separator />
            <Button Content="저장" Click="SaveButton_Click" Style="{StaticResource ToolButton}" />
            <Separator />
            <TextBlock Text="확대/축소" VerticalAlignment="Center" Margin="8,0,4,0" />
            <Slider x:Name="ZoomSlider" Width="180" Minimum="0.1" Maximum="8" Value="1"
                    VerticalAlignment="Center" ValueChanged="ZoomSlider_ValueChanged" />
            <TextBlock x:Name="ZoomText" Text="100%" VerticalAlignment="Center" MinWidth="48" Margin="6,0" />
            <Button Content="1:1" Click="ZoomResetButton_Click" Style="{StaticResource ToolButton}" MinWidth="40" />
            <Button Content="창에 맞춤" Click="ZoomFitButton_Click" Style="{StaticResource ToolButton}" />
        </ToolBar>

        <!-- 가운데: 스크롤 가능한 이미지. Stretch="None" 이므로 1 픽셀 = 1 화면 단위 -->
        <ScrollViewer x:Name="Scroller" Grid.Row="1" Background="#FF2D2D30" AllowDrop="True"
                      HorizontalScrollBarVisibility="Auto" VerticalScrollBarVisibility="Auto"
                      PreviewMouseWheel="Scroller_PreviewMouseWheel">
            <Image x:Name="MainImage" Stretch="None"
                   HorizontalAlignment="Center" VerticalAlignment="Center"
                   RenderOptions.BitmapScalingMode="NearestNeighbor"
                   MouseMove="MainImage_MouseMove" MouseLeave="MainImage_MouseLeave">
                <Image.LayoutTransform>
                    <ScaleTransform x:Name="ZoomTransform" ScaleX="1" ScaleY="1" />
                </Image.LayoutTransform>
            </Image>
        </ScrollViewer>

        <!-- 하단 상태 표시줄: 이미지 정보 · 마우스 위치의 픽셀 값 -->
        <StatusBar Grid.Row="2">
            <StatusBarItem>
                <TextBlock x:Name="InfoText" Text="이미지를 열거나 파일을 창 위에 끌어다 놓으세요." />
            </StatusBarItem>
            <Separator />
            <StatusBarItem>
                <TextBlock x:Name="PixelText" Text="(x, y) = -" FontFamily="Consolas" />
            </StatusBarItem>
        </StatusBar>
    </Grid>
</Window>`;

  const CS_IMAGEFILE = `using System.IO;   // WPF 프로젝트에서는 System.IO 가 암시적 using 에 없으므로 직접 적습니다
using OpenCvSharp;

namespace Ch02_ImageViewer;

/// <summary>
/// 이미지 파일 읽기 · 저장 도우미.
/// Cv2.ImRead / ImWrite 는 한글이 들어간 경로에서 실패할 수 있으므로
/// 바이트 배열로 읽고(ImDecode) 바이트 배열로 쓰는(ImEncode) 방법을 씁니다.
/// </summary>
public static class ImageFile
{
    public const string OpenFilter = "이미지 파일|*.png;*.jpg;*.jpeg;*.bmp;*.tif;*.tiff|모든 파일|*.*";
    public const string SaveFilter = "PNG 이미지|*.png|JPEG 이미지|*.jpg|BMP 이미지|*.bmp";

    /// <summary>빌드 시 복사된 예제 이미지 폴더 (실행 파일 옆의 images/)</summary>
    public static string ImagesDir => Path.Combine(AppContext.BaseDirectory, "images");

    public static Mat Load(string path, ImreadModes mode = ImreadModes.Color)
    {
        byte[] bytes = File.ReadAllBytes(path);
        Mat mat = Cv2.ImDecode(bytes, mode);
        if (mat.Empty())
        {
            mat.Dispose();
            throw new InvalidDataException($"이미지 파일을 해석할 수 없습니다: {path}");
        }
        return mat;
    }

    public static void Save(string path, Mat mat)
    {
        string ext = Path.GetExtension(path);
        if (string.IsNullOrEmpty(ext))
        {
            ext = ".png";
            path += ext;
        }
        if (!Cv2.ImEncode(ext, mat, out byte[] buffer))
            throw new IOException($"이미지를 인코딩할 수 없습니다: {ext}");
        File.WriteAllBytes(path, buffer);
    }
}`;

  const CS_OPEN = `using System.IO;
using System.Windows;
using Microsoft.Win32;                  // OpenFileDialog · SaveFileDialog 가 여기 있다
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;
using Window = System.Windows.Window;   // OpenCvSharp.Window 와 이름이 겹치므로 별칭

namespace Ch02_ImageViewer;

public partial class MainWindow : Window
{
    private Mat? _original;   // 파일에서 읽은 원본 (BGR 3채널)
    private Mat? _display;    // 화면에 보이는 Mat. 새 것이 오면 이전 것 Dispose
    private string _fileName = "";

    public MainWindow() { InitializeComponent(); }

    private void OpenButton_Click(object sender, RoutedEventArgs e)
    {
        var dlg = new OpenFileDialog { Title = "이미지 열기", Filter = ImageFile.OpenFilter };
        if (Directory.Exists(ImageFile.ImagesDir))
            dlg.InitialDirectory = ImageFile.ImagesDir;      // 예제 이미지 폴더부터 보여 준다
        if (dlg.ShowDialog(this) == true)                    // true = [열기] 를 눌렀을 때
            OpenFile(dlg.FileName);
    }

    // 파일을 창 위로 끌어올 때: 파일이면 '복사' 커서를 보여 준다
    private void Window_DragOver(object sender, DragEventArgs e)
    {
        e.Effects = e.Data.GetDataPresent(DataFormats.FileDrop) ? DragDropEffects.Copy : DragDropEffects.None;
        e.Handled = true;
    }

    // 파일을 놓았을 때: 첫 번째 파일을 연다
    private void Window_Drop(object sender, DragEventArgs e)
    {
        if (!e.Data.GetDataPresent(DataFormats.FileDrop))
            return;
        if (e.Data.GetData(DataFormats.FileDrop) is string[] files && files.Length > 0)
            OpenFile(files[0]);
    }

    private void OpenFile(string path)
    {
        try
        {
            Mat loaded = ImageFile.Load(path);   // 실패하면 예외를 던진다
            _original?.Dispose();                // 성공한 뒤에 이전 원본을 해제 (중요!)
            _original = loaded;
            _fileName = Path.GetFileName(path);
            Title = $"02차시 이미지 뷰어 - {_fileName}";
            SetDisplay(_original.Clone(), "원본");
            ZoomSlider.Value = 1;
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "열기 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }
}`;

  const CS_FILTERS = `using System.Windows;
using Microsoft.Win32;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;
using Window = System.Windows.Window;

namespace Ch02_ImageViewer;

public partial class MainWindow : Window
{
    private void GrayButton_Click(object sender, RoutedEventArgs e)
    {
        if (!CheckLoaded()) return;
        try
        {
            var gray = new Mat();                 // SetDisplay 가 보관하므로 using 을 쓰지 않는다
            Cv2.CvtColor(_original!, gray, ColorConversionCodes.BGR2GRAY);
            SetDisplay(gray, "흑백");
        }
        catch (OpenCVException ex) { ShowCvError(ex); }
    }

    private void CannyButton_Click(object sender, RoutedEventArgs e)
    {
        if (!CheckLoaded()) return;
        try
        {
            using var gray = new Mat();           // 중간 결과는 using
            Cv2.CvtColor(_original!, gray, ColorConversionCodes.BGR2GRAY);
            var edges = new Mat();
            Cv2.Canny(gray, edges, 80, 160);      // 낮은/높은 임계값 (10차시에서 자세히)
            SetDisplay(edges, "Canny 80/160");
        }
        catch (OpenCVException ex) { ShowCvError(ex); }
    }

    private void OriginalButton_Click(object sender, RoutedEventArgs e)
    {
        if (!CheckLoaded()) return;
        SetDisplay(_original!.Clone(), "원본");    // 원본은 그대로 두고 복사본을 보여 준다
    }

    private void SaveButton_Click(object sender, RoutedEventArgs e)
    {
        if (_display == null) { MessageBox.Show(this, "저장할 이미지가 없습니다.", "안내"); return; }

        var dlg = new SaveFileDialog { Title = "이미지 저장", Filter = ImageFile.SaveFilter, FileName = "result.png" };
        if (dlg.ShowDialog(this) != true) return;
        try
        {
            ImageFile.Save(dlg.FileName, _display);
            InfoText.Text = $"저장했습니다: {dlg.FileName}";
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "저장 실패", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    /// <summary>화면에 보일 Mat 을 교체합니다. 이전 표시용 Mat 은 Dispose.</summary>
    private void SetDisplay(Mat mat, string name)
    {
        _display?.Dispose();
        _display = mat;
        MainImage.Source = _display.ToBitmapSource();
        InfoText.Text = $"{_fileName}  |  {name}  |  {_display.Width} x {_display.Height}  |  채널 {_display.Channels()}  |  {_display.Type()}";
    }

    private bool CheckLoaded()
    {
        if (_original != null) return true;
        MessageBox.Show(this, "먼저 이미지를 열어 주세요.", "안내");
        return false;
    }

    private void ShowCvError(OpenCVException ex)
        => MessageBox.Show(this, ex.Message, "OpenCV 오류", MessageBoxButton.OK, MessageBoxImage.Error);

    protected override void OnClosed(EventArgs e)
    {
        _display?.Dispose();
        _original?.Dispose();
        base.OnClosed(e);
    }
}`;

  const CS_PIXEL = `using System.Windows;
using System.Windows.Input;
using OpenCvSharp;
using Window = System.Windows.Window;

namespace Ch02_ImageViewer;

public partial class MainWindow : Window
{
    private void MainImage_MouseMove(object sender, MouseEventArgs e)
    {
        if (_display == null) return;

        // Stretch="None" + LayoutTransform 이므로 GetPosition(MainImage) 이 곧 이미지 픽셀 좌표
        var pos = e.GetPosition(MainImage);
        int x = (int)pos.X;
        int y = (int)pos.Y;
        if (x < 0 || y < 0 || x >= _display.Width || y >= _display.Height)
        {
            PixelText.Text = "(x, y) = -";
            return;
        }

        // Mat.At<T>(행 y, 열 x) — (행, 열) 순서에 주의!
        if (_display.Channels() == 3)
        {
            Vec3b px = _display.At<Vec3b>(y, x);
            PixelText.Text = $"(x={x,4}, y={y,4})  B={px.Item0,3} G={px.Item1,3} R={px.Item2,3}";
        }
        else
        {
            byte v = _display.At<byte>(y, x);
            PixelText.Text = $"(x={x,4}, y={y,4})  밝기={v,3}";
        }
    }

    private void MainImage_MouseLeave(object sender, MouseEventArgs e) => PixelText.Text = "(x, y) = -";

    // 확대/축소: Slider · 마우스 휠 · [1:1] · [창에 맞춤]
    private void ZoomSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
    {
        if (ZoomTransform == null) return;        // XAML 초기화 도중 호출될 수 있음
        ZoomTransform.ScaleX = e.NewValue;
        ZoomTransform.ScaleY = e.NewValue;
        ZoomText.Text = $"{e.NewValue * 100:F0}%";
    }

    private void ZoomResetButton_Click(object sender, RoutedEventArgs e) => ZoomSlider.Value = 1;

    private void ZoomFitButton_Click(object sender, RoutedEventArgs e)
    {
        if (_display == null) return;
        double sx = (Scroller.ViewportWidth - 4) / _display.Width;
        double sy = (Scroller.ViewportHeight - 4) / _display.Height;
        ZoomSlider.Value = Math.Clamp(Math.Min(sx, sy), ZoomSlider.Minimum, ZoomSlider.Maximum);
    }

    private void Scroller_PreviewMouseWheel(object sender, MouseWheelEventArgs e)
    {
        double factor = e.Delta > 0 ? 1.1 : 1 / 1.1;
        ZoomSlider.Value = Math.Clamp(ZoomSlider.Value * factor, ZoomSlider.Minimum, ZoomSlider.Maximum);
        e.Handled = true;                         // ScrollViewer 의 기본 스크롤을 막는다
    }
}`;

  const EX_VIEWER = `using System;
using OpenCvSharp;

// WPF MainWindow 에서 '화면' 을 뺀 처리 부분만 그대로 떼어 낸 클래스
class Viewer
{
    Mat _original;          // 파일에서 읽은 원본 (필드로 보관)
    Mat _display;           // 지금 화면에 보이는 Mat
    string _name = "";

    public void Open(string path)
    {
        Mat loaded = Cv2.ImRead(path, ImreadModes.Color);
        if (loaded.Empty())
        {
            loaded.Dispose();
            throw new Exception($"이미지 파일을 해석할 수 없습니다: {path}");
        }
        _original?.Dispose();       // 성공한 뒤에 이전 원본을 해제
        _original = loaded;
        _name = path;
        SetDisplay(_original.Clone(), "원본");
    }

    public void Gray()
    {
        var gray = new Mat();
        Cv2.CvtColor(_original, gray, ColorConversionCodes.BGR2GRAY);
        SetDisplay(gray, "흑백");
    }

    public void Blur()
    {
        var blur = new Mat();
        Cv2.GaussianBlur(_original, blur, new Size(9, 9), 0);
        SetDisplay(blur, "Blur 9x9");
    }

    public void Canny()
    {
        using var gray = new Mat();
        Cv2.CvtColor(_original, gray, ColorConversionCodes.BGR2GRAY);
        var edges = new Mat();
        Cv2.Canny(gray, edges, 80, 160);
        SetDisplay(edges, "Canny 80/160");
    }

    // 뷰어의 SetDisplay 와 같다: 이전 표시용 Mat 을 Dispose 하고 상태 표시줄을 갱신
    void SetDisplay(Mat mat, string what)
    {
        _display?.Dispose();
        _display = mat;
        Console.WriteLine($"{_name}  |  {what}  |  {mat.Width} x {mat.Height}  |  채널 {mat.Channels()}  |  {mat.Type()}");
        Cv2.ImShow(what, mat);      // WPF 에서는 MainImage.Source = mat.ToBitmapSource();
    }

    public void CloseAll()          // WPF 의 OnClosed
    {
        _display?.Dispose();
        _original?.Dispose();
    }
}

class Program
{
    static void Main()
    {
        var viewer = new Viewer();
        viewer.Open("images/sample_color.png");   // [열기] 버튼
        viewer.Gray();                            // [흑백] 버튼
        viewer.Blur();                            // [Blur] 버튼
        viewer.Canny();                           // [Canny] 버튼
        viewer.CloseAll();                        // 창을 닫을 때
        Cv2.WaitKey(0);
    }
}`;

  const EX_SAVE = `using System;
using OpenCvSharp;

class Program
{
    // SaveFileDialog 가 돌려준 경로에 확장자가 없으면 .png 를 붙입니다 (ImageFile.Save 와 같은 처리)
    static string EnsureExt(string path)
    {
        int dot = path.LastIndexOf('.');
        int slash = path.LastIndexOf('/');
        return dot > slash ? path : path + ".png";
    }

    static void Main()
    {
        Console.WriteLine($"result      -> {EnsureExt("result")}");
        Console.WriteLine($"result.jpg  -> {EnsureExt("result.jpg")}");

        using var src = Cv2.ImRead("images/sample_color.png");
        using var gray = src.CvtColor(ColorConversionCodes.BGR2GRAY);

        // 방법 1: 경로에 바로 저장 (영문 경로에서 가장 간단)
        string name = EnsureExt("viewer_gray");
        bool ok = Cv2.ImWrite(name, gray);
        Console.WriteLine($"Cv2.ImWrite(\\"{name}\\") = {ok}  -> 📁 작업 폴더에서 내려받을 수 있습니다");

        // 방법 2: 바이트 배열로 인코딩 → File.WriteAllBytes (한글 경로에서도 안전)
        Cv2.ImEncode(".png", gray, out byte[] buffer);
        Console.WriteLine($"Cv2.ImEncode(\\".png\\", ...) -> {buffer.Length}바이트 (이 배열을 File.WriteAllBytes 로 저장)");

        using var back = Cv2.ImDecode(buffer, ImreadModes.Grayscale);
        using var diff = new Mat();
        Cv2.Absdiff(gray, back, diff);
        Console.WriteLine($"다시 읽어 비교 -> 다른 픽셀 {Cv2.CountNonZero(diff)}개 (무손실 PNG)");
    }
}`;

  const EX_PIXEL = `using System;
using OpenCvSharp;

class Program
{
    // 뷰어의 MainImage_MouseMove 와 똑같은 문자열을 만드는 함수
    static string PixelText(Mat m, int x, int y)
    {
        if (x < 0 || y < 0 || x >= m.Width || y >= m.Height) return "(x, y) = -";
        if (m.Channels() == 3)
        {
            Vec3b px = m.At<Vec3b>(y, x);      // (행 y, 열 x) 순서!
            return $"(x={x,4}, y={y,4})  B={px.Item0,3} G={px.Item1,3} R={px.Item2,3}";
        }
        byte v = m.At<byte>(y, x);
        return $"(x={x,4}, y={y,4})  밝기={v,3}";
    }

    // [창에 맞춤] 버튼: 이미지 전체가 보이는 배율
    static double FitScale(Mat m, double viewW, double viewH)
        => Math.Min(viewW / m.Width, viewH / m.Height);

    static void Main()
    {
        using var color = Cv2.ImRead("images/sample_color.png");
        using var gray = color.CvtColor(ColorConversionCodes.BGR2GRAY);

        // 마우스가 이 좌표들을 지나갔다고 생각해 보세요 (마지막은 이미지 밖)
        Point[] probes = { new Point(120, 80), new Point(280, 80), new Point(500, 100), new Point(700, 80) };
        foreach (Point p in probes)
            Console.WriteLine("컬러 " + PixelText(color, p.X, p.Y));
        Console.WriteLine("흑백 " + PixelText(gray, 120, 80));

        Console.WriteLine($"창 960x540 에 맞춤 배율 = {FitScale(color, 960, 540):F2}");
        Console.WriteLine($"창 320x240 에 맞춤 배율 = {FitScale(color, 320, 240):F2}");
        Cv2.ImShow("color", color);
        Cv2.WaitKey(0);
    }
}`;

  const EX_VIEWER_EXC = `using System;
using OpenCvSharp;

class Program
{
    // WPF 에서는 MessageBox.Show(...) 로 알려 주는 자리. 콘솔에서는 그냥 출력합니다.
    static void ShowMessage(string title, string message)
        => Console.WriteLine($"[{title}] {message}");

    static Mat Load(string path)
    {
        Mat m = Cv2.ImRead(path, ImreadModes.Color);
        if (m.Empty())
        {
            m.Dispose();
            throw new Exception($"이미지 파일을 해석할 수 없습니다: {path}");
        }
        return m;
    }

    static void Main()
    {
        // ① 없는 파일 → 우리가 던진 예외를 잡아 사용자에게 알린다
        try
        {
            using var bad = Load("images/not_here.png");
            ShowMessage("열기", "성공 (여기는 실행되지 않습니다)");
        }
        catch (Exception ex) { ShowMessage("열기 실패", ex.Message); }

        // ② OpenCV 조건 위반 → OpenCVException 만 따로 잡는다
        using var gray = Cv2.ImRead("images/sample_gray.png", ImreadModes.Grayscale);
        try
        {
            using var wrong = new Mat();
            Cv2.CvtColor(gray, wrong, ColorConversionCodes.BGR2GRAY);   // 이미 1채널!
        }
        catch (OpenCVException) { ShowMessage("OpenCV 오류", "채널 수가 맞지 않습니다 (이미 흑백입니다)"); }

        // ③ 예외를 잡았으므로 앱은 죽지 않고 계속 동작한다
        using var edges = gray.Canny(80, 160);
        ShowMessage("계속 동작", $"에지 픽셀 {Cv2.CountNonZero(edges)}개");
        Cv2.ImShow("edges", edges);
        Cv2.WaitKey(0);
    }
}`;

  CS_COURSE.addChapter({
    id: 'cs02', no: '02', title: 'WPF 기초와 이미지 표시 (Mat ↔ BitmapSource)', subtitle: 'XAML 로 화면 만들기 → Mat 을 화면에 띄우기 → 이미지 뷰어 앱 완성',
    summary: 'WPF 프로젝트를 만들어 <b>XAML</b> 로 화면(Grid · Button · Image · StatusBar)을 짜고, 코드 비하인드의 <b>이벤트 핸들러</b>에서 OpenCV 처리를 합니다. <b>OpenCvSharp4.WpfExtensions</b> 의 <code>ToBitmapSource()</code> 로 <b>Mat → BitmapSource</b> 변환을 익히고(채널별 PixelFormat · WriteableBitmap 재사용 · 큰 이미지 축소 · 역변환 <code>ToMat</code>), 파일 대화상자 · 드래그앤드롭 · 필터 버튼 · 저장 · 상태 표시줄 · 예외 처리를 갖춘 <b>이미지 뷰어 앱</b>(<code>wpf/Ch02_ImageViewer</code>)을 완성합니다.',
    goals: ['XAML 로 Grid · Button · Image · StackPanel · TextBlock 화면을 만들고 x:Name 과 Click 핸들러를 연결할 수 있다', 'MainWindow.xaml 과 MainWindow.xaml.cs 가 하나의 partial 클래스임을 알고 InitializeComponent 의 역할을 설명할 수 있다', 'Mat 을 BitmapSource 로 바꿔 Image 컨트롤에 표시하고 채널 수에 맞는 PixelFormat 을 고를 수 있다', 'OpenFileDialog · 드래그앤드롭 · 필터 버튼 · 저장 · 상태 표시줄 · 예외 처리를 갖춘 이미지 뷰어를 만들 수 있다'],
    wpf: 'Ch02_ImageViewer',
    sections: [
      // ============================================================ 1교시
      {
        id: 'cs02-1', title: 'WPF 프로젝트와 XAML 기초: 창 · 버튼 · 이미지', minutes: 50,
        goals: ['WPF 프로젝트를 만들고 App.xaml · MainWindow.xaml · MainWindow.xaml.cs 의 역할을 설명할 수 있다', 'Grid 의 행 · 열, StackPanel, Button, Image, TextBlock 을 XAML 로 배치할 수 있다', 'x:Name 과 Click 이벤트 핸들러로 화면과 코드를 연결할 수 있다'],
        flow: [['도입: 콘솔에서 창으로', 6], ['WPF 프로젝트 만들기', 8], ['XAML 기초: Grid · 컨트롤', 14], ['이벤트 핸들러 · 코드 비하인드', 14], ['정리 · 퀴즈', 8]],
        content: [
          { type: 'h', text: '콘솔 앱에서 WPF 앱으로' },
          { type: 'p', html: '01차시까지는 <code>Cv2.ImShow</code> 가 띄워 주는 창으로 결과를 봤습니다. 이 창은 디버깅용이라 버튼 · 메뉴 · 상태 표시줄을 붙일 수 없습니다. 실제 검사 장비 프로그램처럼 <b>내가 만든 화면</b>에 이미지를 띄우려면 <b>WPF</b>(Windows Presentation Foundation) 앱을 만들어야 합니다. WPF 에서는 화면을 <b>XAML</b>(XML 로 된 화면 설명서)로 짜고, 버튼을 눌렀을 때 실행할 코드는 <b>코드 비하인드</b>(<code>.xaml.cs</code>)에 씁니다.' },
          { type: 'table', head: ['', '콘솔 앱 (01차시)', 'WPF 앱 (02차시)'], rows: [
            ['프로젝트 종류', '콘솔 앱 · <code>net8.0</code>', 'WPF 애플리케이션 · <code>net8.0-windows</code>, <code>&lt;UseWPF&gt;true&lt;/UseWPF&gt;</code>'],
            ['시작점', '<code>static void Main()</code>', '<code>App.xaml</code> 의 <code>StartupUri</code> (Main 은 자동 생성)'],
            ['화면 만들기', '없음 (텍스트만)', '<b>XAML</b>: <code>Window</code> 안에 <code>Grid</code> · <code>Button</code> · <code>Image</code>'],
            ['실행 흐름', '위에서 아래로 한 번', '<b>이벤트 루프</b> — 사용자가 누를 때마다 핸들러가 불린다'],
            ['이미지 보기', '<code>Cv2.ImShow</code> + <code>WaitKey</code>', '<code>Image.Source = mat.ToBitmapSource()</code> (2교시)'],
            ['추가 패키지', '없음', '<code>OpenCvSharp4.WpfExtensions</code>']
          ], caption: '표 1. 같은 OpenCV 코드, 다른 껍데기 — Mat · Cv2 부분은 그대로다' },
          { type: 'callout', kind: 'vs', title: 'WPF 프로젝트 만들기 (Visual Studio)', html: '<ol><li><b>새 프로젝트 만들기</b> → 검색란에 <b>WPF</b> → <b>WPF 애플리케이션</b>(C#) 선택. “WPF 앱(.NET Framework)” 은 <u>고르지 마세요</u> — 옛 버전입니다.</li><li>이름 <code>WpfFirst</code>, 프레임워크 <b>.NET 8.0</b>.</li><li>NuGet 으로 <code>OpenCvSharp4</code>, <code>OpenCvSharp4.runtime.win</code>, 그리고 이번에 새로 <b><code>OpenCvSharp4.WpfExtensions</code></b> 를 설치합니다.</li><li>예제 이미지 <code>images/</code> 폴더를 프로젝트에 넣고 csproj 에 자동 복사 설정을 추가합니다(01차시와 같음).</li><li><b>F5</b> → 빈 창이 뜨면 준비 끝.</li></ol>' },
          { type: 'code', title: '명령줄로 같은 일 하기', lang: 'sh', code: SH_WPF_NEW, run: false,
            desc: '<code>dotnet new wpf</code> 로 만들면 <code>App.xaml</code>, <code>MainWindow.xaml</code>, 그리고 각각의 <code>.cs</code> 파일이 생깁니다. WPF 는 Windows 전용이므로 대상 프레임워크가 <code>net8.0-windows</code> 입니다.' },
          { type: 'code', title: 'WpfFirst.csproj — 콘솔 프로젝트와 다른 곳', lang: 'xml', file: 'WpfFirst.csproj', code: XML_WPF_CSPROJ, run: false,
            desc: '<code>OutputType</code> 이 <code>WinExe</code> 라서 콘솔 창이 뜨지 않고, <code>UseWPF</code> 가 XAML 컴파일을 켭니다. 대상 프레임워크에 <code>-windows</code> 가 붙는 것도 콘솔과 다릅니다.' },
          { type: 'h', text: '파일 3개의 역할 — 그리고 partial class' },
          { type: 'figure', html: FIG_FILES, caption: '그림 1. App.xaml 이 MainWindow 를 띄운다. MainWindow.xaml(화면)과 MainWindow.xaml.cs(코드)는 빌드할 때 <b>하나의 partial 클래스</b>로 합쳐진다' },
          { type: 'list', items: [
            '<b>App.xaml / App.xaml.cs</b> — 앱의 시작점. <code>StartupUri="MainWindow.xaml"</code> 이 첫 창을 정하고, <code>&lt;Application.Resources&gt;</code> 에 공용 스타일을 둡니다.',
            '<b>MainWindow.xaml</b> — 화면. <code>Window</code> 안에 배치 패널(<code>Grid</code> · <code>StackPanel</code>)과 컨트롤(<code>Button</code> · <code>Image</code> · <code>TextBlock</code>)을 씁니다.',
            '<b>MainWindow.xaml.cs</b> — 코드 비하인드. 같은 클래스의 나머지 절반이며 <b>이벤트 핸들러</b>와 OpenCV 처리 코드가 들어갑니다.',
            '<b>InitializeComponent()</b> — 빌드 때 XAML 로부터 자동 생성된 메서드. 컨트롤을 실제로 만들고 <code>x:Name</code> 을 필드에 채워 줍니다. <b>생성자에서 이 줄보다 먼저</b> 컨트롤을 쓰면 <code>NullReferenceException</code> 입니다.'
          ] },
          { type: 'callout', kind: 'warn', title: 'OpenCvSharp 의 Window 와 WPF 의 Window 는 다른 클래스', html: 'OpenCvSharp 에도 <code>Window</code> 클래스(<code>Cv2.ImShow</code> 용)가 있어서 <code>using OpenCvSharp;</code> 와 <code>using System.Windows;</code> 를 함께 쓰면 <b>“Window 가 모호합니다”</b>(CS0104) 오류가 납니다. 완성 프로젝트처럼 파일 맨 위에 별칭을 주면 해결됩니다: <code>using Window = System.Windows.Window;</code>. 같은 이유로 <code>Point</code> · <code>Size</code> · <code>Rect</code> 도 이름이 겹치니, WPF 쪽은 <code>System.Windows.Point</code> 처럼 전체 이름을 쓰세요.' },
          { type: 'h', text: 'XAML 기초 ① Grid 로 화면을 나누기' },
          { type: 'p', html: 'WPF 는 좌표를 직접 주는 대신 <b>배치 패널</b>이 자식의 크기 · 위치를 정합니다. 가장 많이 쓰는 <code>Grid</code> 는 표처럼 <b>행(Row)과 열(Column)</b>로 나눕니다. 높이 · 너비는 세 가지로 적습니다: <code>Auto</code>(내용만큼), <code>*</code>(남은 공간을 비율로), 숫자(고정).' },
          { type: 'figure', html: FIG_LAYOUT, caption: '그림 2. 이미지 프로그램의 기본 배치 — 위 툴바(Auto) · 가운데 이미지(*) · 아래 상태 표시줄(Auto)' },
          { type: 'code', title: 'MainWindow.xaml — 버튼 줄 · 이미지 · 상태 표시줄', lang: 'xml', file: 'MainWindow.xaml', code: XML_HELLO, run: false,
            desc: '<code>Grid.RowDefinitions</code> 로 3행을 만들고 각 자식에 <code>Grid.Row="0"</code> 처럼 어느 행인지 적습니다(적지 않으면 0행). <code>Stretch="Uniform"</code> 은 비율을 지키며 칸에 맞춰 이미지를 늘리거나 줄입니다. <b>x:Name</b> 을 붙인 컨트롤만 코드에서 이름으로 쓸 수 있습니다.' },
          { type: 'code', title: 'Grid 의 행 · 열과 ColumnSpan', lang: 'xml', code: XML_GRID, run: false,
            desc: '열 너비 <code>2*</code> 와 <code>3*</code> 는 남은 너비를 <b>2 : 3</b> 으로 나눕니다(40% : 60%). 한 칸에 두 컨트롤을 두면 나중에 쓴 것이 위에 겹쳐 그려지므로, 겹치게 쓸 때는 <code>HorizontalAlignment</code> · <code>VerticalAlignment</code> 로 위치를 정합니다.' },
          { type: 'p', html: 'Grid 의 비율 계산을 코드로 해 보면 개념이 확실해집니다. 아래 예제는 XAML 이 내부에서 하는 계산을 그대로 따라 하며 각 칸의 사각형을 이미지에 그립니다.' },
          { type: 'code', title: '예제 1: Grid 의 행 · 열 계산을 직접 해 보기', code: EX_GRID,
            desc: '결과 창의 그림에서 위 · 아래 띠(Auto)는 높이가 고정이고 가운데 칸만 커진 것을 확인하세요. 창 크기가 바뀔 때 WPF 가 하는 일이 바로 이 계산입니다. <code>new Rect(x, y, w, h)</code> 는 <b>(x, y)</b> 순서, <code>new Mat(H, W, ...)</code> 는 <b>(행, 열)</b> 순서라는 점도 다시 확인하세요.',
            expect: 'Grid.Row=0 Grid.Column=0 -> x=  0 y=  0 w=240 h= 60\nGrid.Row=0 Grid.Column=1 -> x=240 y=  0 w=360 h= 60\nGrid.Row=1 Grid.Column=0 -> x=  0 y= 60 w=240 h=200\nGrid.Row=1 Grid.Column=1 -> x=240 y= 60 w=360 h=200\nGrid.Row=2 Grid.Column=0 -> x=  0 y=260 w=240 h= 40\nGrid.Row=2 Grid.Column=1 -> x=240 y=260 w=360 h= 40' },
          { type: 'h', text: 'XAML 기초 ② 자주 쓰는 컨트롤' },
          { type: 'table', head: ['컨트롤', '역할', 'XAML 예'], rows: [
            ['<code>Grid</code>', '표처럼 행 · 열로 나누는 배치 패널', '<code>&lt;Grid&gt;&lt;Grid.RowDefinitions&gt;…</code>'],
            ['<code>StackPanel</code>', '자식을 한 방향으로 차례차례 쌓기', '<code>&lt;StackPanel Orientation="Horizontal"&gt;</code>'],
            ['<code>Button</code>', '누르는 버튼 — <code>Click</code> 에 핸들러 이름', '<code>&lt;Button Content="열기" Click="OpenButton_Click" /&gt;</code>'],
            ['<code>Image</code>', '그림 표시 — <code>Source</code> 에 <code>BitmapSource</code>', '<code>&lt;Image x:Name="MainImage" Stretch="Uniform" /&gt;</code>'],
            ['<code>TextBlock</code>', '글자 한 덩이 (읽기 전용)', '<code>&lt;TextBlock x:Name="InfoText" Text="준비" /&gt;</code>'],
            ['<code>Slider</code>', '값을 끌어 고르기 — <code>ValueChanged</code>', '<code>&lt;Slider Minimum="0" Maximum="255" Value="128" /&gt;</code>'],
            ['<code>ToolBar</code> · <code>StatusBar</code>', '위 도구 모음 · 아래 상태 표시줄', '<code>&lt;ToolBar&gt;&lt;Button …/&gt;&lt;/ToolBar&gt;</code>']
          ], caption: '표 2. 이미지 프로그램에 필요한 최소 컨트롤 — 07차시 이후 Slider 로 임계값을 조절한다' },
          { type: 'code', title: '예제 2: StackPanel 처럼 이미지를 쌓아 보기', code: EX_STACK,
            desc: '<code>Cv2.HConcat</code> · <code>Cv2.VConcat</code> 로 이미지를 가로 · 세로로 이어 붙이면 <code>StackPanel</code> 의 동작을 눈으로 볼 수 있습니다. 이어 붙일 이미지는 <b>채널 수와 자료형이 같아야</b> 하므로 흑백을 <code>GRAY2BGR</code> 로 3채널로 되돌렸습니다 — WPF 에서도 여러 결과를 한 화면에 나란히 보여 줄 때 쓰는 기법입니다. <code>InfoLine</code> 함수가 만드는 문자열이 곧 상태 표시줄에 들어갈 내용입니다.',
            expect: '원본  |  640 x 480  |  채널 3  |  CV_8UC3\n가로 2칸 (HConcat)  |  400 x 150  |  채널 3  |  CV_8UC3\n세로 2줄 (VConcat)  |  400 x 300  |  채널 3  |  CV_8UC3' },
          { type: 'h', text: '이벤트 핸들러: 버튼과 코드를 잇는 이름' },
          { type: 'p', html: 'XAML 에 <code>Click="OpenButton_Click"</code> 이라고 쓰면, 코드 비하인드의 <code>private void OpenButton_Click(object sender, RoutedEventArgs e)</code> 메서드가 <b>버튼을 누를 때마다</b> 불립니다. 이름이 한 글자라도 다르면 빌드 오류입니다. Visual Studio 에서는 XAML 의 <code>Click=</code> 뒤에 <b>&lt;새 이벤트 처리기&gt;</b> 를 고르면 메서드 뼈대를 자동으로 만들어 줍니다.' },
          { type: 'code', title: 'MainWindow.xaml.cs — 코드 비하인드', code: CS_CODEBEHIND, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '<b>세 가지가 콘솔과 다릅니다.</b> ① Mat 을 <code>_src</code> 처럼 <b>필드</b>로 보관합니다(버튼 사이에 값이 남아 있어야 하므로). ② 새 Mat 을 넣기 전에 <code>_src?.Dispose()</code> 로 이전 것을 해제합니다. ③ 결과를 <code>Console.WriteLine</code> 대신 <code>InfoText.Text</code> 에 넣습니다. <code>OnClosed</code> 에서 필드 Mat 을 정리하는 것도 잊지 마세요.' },
          { type: 'p', html: '이벤트 · 핸들러가 무엇인지 브라우저에서 확인해 봅시다. WPF 의 <code>Button</code> 이 하는 일은 “누르면 등록된 메서드를 부른다” 가 전부입니다. C# 의 <code>event</code> 로 같은 구조를 만들면 이렇게 됩니다.' },
          { type: 'code', title: '예제 3: 이벤트와 핸들러를 콘솔로 흉내 내기', code: EX_EVENT,
            desc: '<code>Click?.Invoke(...)</code> 는 “등록된 핸들러가 있으면 부른다” 는 뜻입니다(<code>?.</code> 가 없으면 아무도 등록하지 않았을 때 <code>NullReferenceException</code>). <code>grayBtn.Click += OnGray;</code> 가 XAML 의 <code>Click="OnGray"</code> 와 같은 연결입니다. 핸들러가 <code>static Mat src</code> 를 쓰는 것이 WPF 에서 <b>필드에 Mat 을 보관</b>하는 것과 같은 이유입니다 — 클릭할 때마다 파일을 다시 읽지 않기 위해서입니다.',
            expect: '버튼 2개 준비 완료\n[흑백] 클릭 -> 1채널 CV_8UC1 평균=119.2\n[Canny] 클릭 -> 에지 픽셀 4735개' },
          { type: 'callout', kind: 'warn', title: 'WPF 에서 절대 하면 안 되는 것', html: '<ul><li><code>Cv2.WaitKey(0)</code> · <code>Thread.Sleep</code> 처럼 <b>기다리는 코드</b>를 핸들러에 넣지 마세요. UI 스레드가 멈춰 창이 “응답 없음” 이 됩니다.</li><li>무거운 처리(수 초)도 마찬가지입니다 — 화면이 멈춘 것처럼 보입니다. 해결은 <code>await Task.Run(...)</code> 인데, 이는 16차시에서 다룹니다. 02차시 예제는 모두 0.1초 이내라 괜찮습니다.</li><li>디버깅 중에는 <code>Cv2.ImShow</code> 를 WPF 안에서 써도 되지만(별도 창), 완성 프로그램에서는 쓰지 않습니다.</li></ul>' },
          { type: 'callout', kind: 'tip', title: 'XAML 을 빨리 익히는 방법', html: 'Visual Studio 의 XAML 편집기는 <b>디자이너 미리 보기</b>를 같이 보여 줍니다. <code>Height="Auto"</code> 를 <code>"*"</code> 로 바꾸며 화면이 어떻게 변하는지 보는 것이 설명을 읽는 것보다 빠릅니다. 속성 이름이 기억나지 않으면 태그 안에서 <kbd>Ctrl</kbd>+<kbd>Space</kbd> 를 누르세요.' }
        ],
        practice: [
          {
            title: '[Blur] 버튼 핸들러 만들어 연결하기', level: 1,
            desc: '<code>OnBlur</code> 핸들러를 완성해 <code>GaussianBlur(9x9)</code> 결과의 <b>채널 수와 평균</b>을 <code>[Blur] -&gt; 3채널 평균=xxx.x</code> 형식으로 출력하고, <code>blurBtn.Click</code> 에 연결하세요. 두 버튼을 눌러 결과 창에서 흑백 · Blur 이미지를 비교해 보세요.',
            hint: '<code>using var blur = src.GaussianBlur(new Size(9, 9), 0);</code> 로 새 Mat 을 받고, 평균은 <code>Cv2.Mean(blur).Val0</code> 를 <code>:F1</code> 로 출력합니다. 연결은 <code>blurBtn.Click += OnBlur;</code>.',
            expect: '[흑백] -> 1채널 평균=119.2\n[Blur] -> 3채널 평균=115.5',
            starter: `using System;
using OpenCvSharp;

delegate void ClickHandler(string name);

class FakeButton
{
    public string Content;
    public event ClickHandler Click;
    public FakeButton(string content) { Content = content; }
    public void Press() { Click?.Invoke(Content); }
}

class Program
{
    static Mat src;

    static void OnGray(string who)
    {
        using var gray = src.CvtColor(ColorConversionCodes.BGR2GRAY);
        Console.WriteLine($"[{who}] -> {gray.Channels()}채널 평균={Cv2.Mean(gray).Val0:F1}");
        Cv2.ImShow(who, gray);
    }

    // TODO: GaussianBlur(9x9) 결과의 채널 수와 평균을 출력하세요
    static void OnBlur(string who)
    {
        Console.WriteLine($"[{who}] -> 아직 만들지 않았습니다");
    }

    static void Main()
    {
        src = Cv2.ImRead("images/sample_color.png");
        var grayBtn = new FakeButton("흑백");
        grayBtn.Click += OnGray;
        grayBtn.Press();

        var blurBtn = new FakeButton("Blur");
        blurBtn.Click += OnBlur;   // TODO: OnBlur 를 완성하면 아래 출력이 바뀝니다
        blurBtn.Press();

        src.Dispose();
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

delegate void ClickHandler(string name);

class FakeButton
{
    public string Content;
    public event ClickHandler Click;
    public FakeButton(string content) { Content = content; }
    public void Press() { Click?.Invoke(Content); }
}

class Program
{
    static Mat src;

    static void OnGray(string who)
    {
        using var gray = src.CvtColor(ColorConversionCodes.BGR2GRAY);
        Console.WriteLine($"[{who}] -> {gray.Channels()}채널 평균={Cv2.Mean(gray).Val0:F1}");
        Cv2.ImShow(who, gray);
    }

    static void OnBlur(string who)
    {
        using var blur = src.GaussianBlur(new Size(9, 9), 0);
        Console.WriteLine($"[{who}] -> {blur.Channels()}채널 평균={Cv2.Mean(blur).Val0:F1}");
        Cv2.ImShow(who, blur);
    }

    static void Main()
    {
        src = Cv2.ImRead("images/sample_color.png");
        var grayBtn = new FakeButton("흑백");
        grayBtn.Click += OnGray;
        grayBtn.Press();

        var blurBtn = new FakeButton("Blur");
        blurBtn.Click += OnBlur;
        blurBtn.Press();

        src.Dispose();
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '3행 2열 창 배치를 계산해 그리기', level: 2,
            desc: '창 <b>720 x 400</b> 을 Grid <b>3행</b>(위 툴바 48 고정 · 가운데 <code>*</code> · 아래 상태 표시줄 32 고정) <b>2열</b>(<code>1*</code> : <code>2*</code>)로 나누세요. 각 칸을 사각형으로 그리고 <code>"r,c"</code> 를 써 넣은 뒤, 칸마다 <code>Row=r Col=c x=.. y=.. w=.. h=..</code> 를 출력하세요.',
            hint: '<code>1*</code> : <code>2*</code> 는 전체 너비를 3으로 나눠 1칸 : 2칸입니다 → <code>int[] colW = { W / 3, W * 2 / 3 };</code>. 사각형은 <code>Cv2.Rectangle(canvas, new Rect(x, y, colW[c], rowH[r]), 색, 2)</code>.',
            expect: 'Row=0 Col=0 x=0 y=0 w=240 h=48\nRow=0 Col=1 x=240 y=0 w=480 h=48\nRow=1 Col=0 x=0 y=48 w=240 h=320\nRow=1 Col=1 x=240 y=48 w=480 h=320\nRow=2 Col=0 x=0 y=368 w=240 h=32\nRow=2 Col=1 x=240 y=368 w=480 h=32',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        int W = 720, H = 400;
        int[] rowH = { 48, H - 48 - 32, 32 };   // Auto(48) · *(남은 것) · Auto(32)
        // TODO: 열 너비를 1* : 2* 로 나눈 colW 배열을 만드세요 (지금은 한 열뿐입니다)
        int[] colW = { W };

        using var canvas = new Mat(H, W, MatType.CV_8UC3, new Scalar(40, 40, 40));
        int y = 0;
        for (int r = 0; r < rowH.Length; r++)
        {
            int x = 0;
            for (int c = 0; c < colW.Length; c++)
            {
                // TODO: 칸을 사각형으로 그리고 "r,c" 를 써 넣으세요
                Console.WriteLine($"Row={r} Col={c} x={x} y={y} w={colW[c]} h={rowH[r]}");
                x += colW[c];
            }
            y += rowH[r];
        }
        Cv2.ImShow("layout", canvas);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        int W = 720, H = 400;
        int[] rowH = { 48, H - 48 - 32, 32 };
        int[] colW = { W / 3, W * 2 / 3 };

        using var canvas = new Mat(H, W, MatType.CV_8UC3, new Scalar(40, 40, 40));
        int y = 0;
        for (int r = 0; r < rowH.Length; r++)
        {
            int x = 0;
            for (int c = 0; c < colW.Length; c++)
            {
                Cv2.Rectangle(canvas, new Rect(x, y, colW[c], rowH[r]), new Scalar(80, 200, 120), 2);
                Cv2.PutText(canvas, $"{r},{c}", new Point(x + 12, y + 28), HersheyFonts.HersheySimplex, 0.7, Scalar.White, 1);
                Console.WriteLine($"Row={r} Col={c} x={x} y={y} w={colW[c]} h={rowH[r]}");
                x += colW[c];
            }
            y += rowH[r];
        }
        Cv2.ImShow("layout", canvas);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: [
          { q: 'XAML 의 <code>&lt;Image x:Name="MainImage" /&gt;</code> 에서 <code>x:Name</code> 을 붙이는 이유는?', options: ['화면에 이름을 표시하려고', '코드 비하인드에서 <code>MainImage</code> 라는 필드로 이 컨트롤을 쓰려고', '이미지 파일 이름을 정하려고', '컨트롤의 순서를 정하려고'], answer: 1,
            explain: '<code>x:Name</code> 을 붙인 컨트롤만 <code>InitializeComponent()</code> 가 <b>같은 이름의 필드</b>에 넣어 줍니다. 이름이 없으면 코드에서 그 컨트롤을 가리킬 수 없습니다.' },
          { q: '<code>InitializeComponent()</code> 가 하는 일은?', options: ['NuGet 패키지를 불러온다', 'XAML 을 읽어 컨트롤을 만들고 <code>x:Name</code> 필드를 채운다', 'OpenCV 를 초기화한다', '창을 화면에 표시한다'], answer: 1,
            explain: '빌드할 때 XAML 로부터 자동 생성되는 메서드입니다. 그래서 <b>생성자에서 이 줄보다 먼저</b> <code>InfoText.Text = …</code> 를 쓰면 <code>NullReferenceException</code> 이 납니다.' },
          { q: 'Grid 의 <code>&lt;RowDefinition Height="*" /&gt;</code> 의 뜻은?', options: ['높이 1픽셀', '내용에 꼭 맞는 높이', '남은 공간을 비율로 나눠 갖는다', '숨겨진 행'], answer: 2,
            explain: '<code>*</code> 는 <b>남은 공간</b>을 비율로 나눕니다(<code>2*</code> 와 <code>3*</code> = 40% : 60%). 내용에 맞추는 것은 <code>Auto</code>, 고정은 숫자입니다.' },
          { q: 'XAML 에 <code>&lt;Button Content="열기" Click="OpenButton_Click" /&gt;</code> 라고 썼다면 코드 비하인드에 필요한 것은?', options: ['<code>void OpenButton_Click(object sender, RoutedEventArgs e)</code> 메서드', '<code>OpenButton_Click</code> 이라는 이름의 필드', '<code>Button OpenButton</code> 선언', '아무것도 필요 없다'], answer: 0,
            explain: '<code>Click</code> 에 적은 이름과 <b>똑같은 이름의 이벤트 핸들러 메서드</b>가 있어야 합니다. 서명은 <code>(object sender, RoutedEventArgs e)</code> 입니다. 이름이 다르면 빌드 오류입니다.' },
          { q: 'WPF 버튼 핸들러 안에서 하면 <u>안</u> 되는 것은?', options: ['<code>Cv2.CvtColor</code> 로 흑백 변환', '<code>InfoText.Text</code> 갱신', '<code>Cv2.WaitKey(0)</code> 으로 키를 기다리기', 'Mat 을 필드에 보관'], answer: 2,
            explain: '<code>WaitKey(0)</code> 은 UI 스레드를 붙잡아 창이 <b>응답 없음</b> 상태가 됩니다. WPF 에서는 기다리지 않고 바로 화면을 갱신하고 돌아와야 합니다.' }
        ],
        slides: [
          { layout: 'title', title: '02. WPF 기초와 이미지 표시', subtitle: '1교시 — WPF 프로젝트와 XAML 기초: 창 · 버튼 · 이미지', notes: '<p>01차시에서 만든 콘솔 프로젝트를 띄워 둔 채 시작합니다. 💬 “<code>Cv2.ImShow</code> 창에 [열기] 버튼을 달 수 있을까요?” — 못 한다. 그래서 내 화면을 만드는 WPF 가 필요하다는 흐름으로 들어갑니다. (3분)</p>' },
          { layout: 'table', title: '콘솔 앱 vs WPF 앱', lead: '처리 코드(Mat · Cv2)는 그대로, 껍데기만 바뀐다', head: ['', '콘솔', 'WPF'], rows: [
            ['프로젝트', '<code>net8.0</code>', '<code>net8.0-windows</code> + <code>UseWPF</code>'],
            ['시작점', '<code>Main()</code>', '<code>App.xaml</code> 의 <code>StartupUri</code>'],
            ['화면', '없음', '<b>XAML</b> (Grid · Button · Image)'],
            ['흐름', '위 → 아래 한 번', '<b>이벤트 루프</b> (핸들러 호출)'],
            ['이미지', '<code>Cv2.ImShow</code>', '<code>Image.Source</code> (2교시)'],
            ['패키지', '2개', '+ <code>OpenCvSharp4.WpfExtensions</code>']
          ], notes: '<p>표를 읽고 “바뀌는 것은 껍데기” 를 강조합니다. 💬 “<code>Cv2.CvtColor</code> 코드는 콘솔과 WPF 중 어디가 다를까?” — 똑같다. 학생 부담을 덜어 주는 메시지입니다. (4분)</p>' },
          { layout: 'diagram', title: '파일 3개와 partial class', html: FIG_FILES, caption: 'App.xaml → MainWindow.xaml(화면) + MainWindow.xaml.cs(코드) = 하나의 클래스', notes: '<p>핵심은 <b>한 클래스가 두 파일에 나뉘어 있다(partial)</b> 는 것. 빌드하면 XAML 이 C# 으로 번역되고(<code>MainWindow.g.i.cs</code>) 거기에 <code>InitializeComponent()</code> 와 <code>x:Name</code> 필드가 들어갑니다. 💬 “왜 <code>MainImage</code> 를 선언하지 않았는데 쓸 수 있나?” — 자동 생성 파일에 있기 때문. Visual Studio 에서 <code>InitializeComponent</code> 에 F12 를 눌러 실제 파일을 보여 주면 효과가 큽니다. (6분)</p>' },
          { layout: 'code', title: 'MainWindow.xaml — 3행 배치', lang: 'xml', file: 'MainWindow.xaml', run: false, code: XML_HELLO, points: ['<code>RowDefinitions</code>: Auto · * · Auto', '<code>StackPanel Orientation="Horizontal"</code> = 버튼 줄', '<code>x:Name</code> 을 붙인 것만 코드에서 쓸 수 있다', '<code>Click="OpenButton_Click"</code> = 핸들러 이름'], notes: '<p>디자이너 미리 보기를 함께 보여 주며 <code>Height="Auto"</code> → <code>"*"</code> 로 바꿔 화면이 바뀌는 것을 실시간으로 시연합니다. 학생들에게 버튼 하나를 더 추가해 보게 합니다(Content 만 바꿔도 됨). (6분)</p>' },
          { layout: 'diagram', title: 'Grid: Auto · * · 고정', html: FIG_LAYOUT, caption: '이미지 프로그램의 표준 배치 — 툴바(Auto) · 이미지(*) · 상태 표시줄(Auto)', notes: '<p>세 가지 높이 지정의 차이를 짚습니다. 💬 “창을 세로로 늘리면 어느 칸이 커질까?” — <code>*</code> 인 가운데 칸. 실제 앱을 늘려 보여 주면 바로 이해합니다. (4분)</p>' },
          { layout: 'table', title: '이미지 프로그램에 필요한 컨트롤', head: ['컨트롤', '역할'], rows: [
            ['<code>Grid</code> · <code>StackPanel</code>', '배치 (행 · 열 / 한 방향 쌓기)'],
            ['<code>Button</code>', '<code>Click</code> 핸들러 실행'],
            ['<code>Image</code>', '<code>Source</code> 에 <code>BitmapSource</code> 를 넣어 그림 표시'],
            ['<code>TextBlock</code>', '상태 · 안내 글자'],
            ['<code>Slider</code>', '임계값 · 배율 조절 (<code>ValueChanged</code>)'],
            ['<code>ToolBar</code> · <code>StatusBar</code>', '위 도구 모음 · 아래 상태 표시줄']
          ], notes: '<p>오늘은 앞 4개만 씁니다. Slider 는 3교시의 확대/축소와 07차시 이진화에서 쓴다고 예고. 완성 프로젝트 화면을 미리 한 번 띄워 보여 주면 동기 부여가 됩니다. (3분)</p>' },
          { layout: 'two', title: 'Click 은 두 파일을 잇는 이름', left: { title: 'MainWindow.xaml', lang: 'xml', code: `<Button Content="흑백"
        Click="GrayButton_Click" />` }, right: { title: 'MainWindow.xaml.cs', run: false, code: `private void GrayButton_Click(
    object sender, RoutedEventArgs e)
{
    using var gray = new Mat();
    Cv2.CvtColor(_src, gray,
        ColorConversionCodes.BGR2GRAY);
    InfoText.Text = "흑백 완료";
}` }, notes: '<p>이름이 한 글자라도 다르면 빌드 오류라는 점을 강조합니다. Visual Studio 에서 <code>Click="</code> 까지 치면 &lt;새 이벤트 처리기&gt; 가 나와 자동으로 메서드를 만들어 주는 것을 시연하세요. <code>sender</code> 는 누른 컨트롤, <code>e</code> 는 이벤트 정보입니다. (5분)</p>' },
          { layout: 'code', title: '코드 비하인드의 뼈대', run: false, local: true, file: 'MainWindow.xaml.cs', code: `using System.Windows;
using OpenCvSharp;

namespace WpfFirst;

public partial class MainWindow : Window
{
    private Mat? _src;                      // 원본은 '필드' 로 보관

    public MainWindow()
    {
        InitializeComponent();              // XAML → 컨트롤 + x:Name 필드
        InfoText.Text = "[열기] 를 누르세요.";
    }

    private void OpenButton_Click(object sender, RoutedEventArgs e)
    {
        _src?.Dispose();                    // 이전 원본 해제
        _src = Cv2.ImRead("images/sample_color.png");
        InfoText.Text = $"{_src.Width} x {_src.Height} · 채널 {_src.Channels()}";
    }
}`, points: ['<code>partial</code> — XAML 쪽 절반과 합쳐진다', 'Mat 은 <b>필드</b>(버튼 사이에 값이 남아야 한다)', '새 Mat 을 넣기 전에 <code>?.Dispose()</code>', '<code>Console.WriteLine</code> 자리에 <code>InfoText.Text</code>'], notes: '<p>세 가지 차이(필드 · Dispose · Text)를 짚습니다. 💬 “<code>_src</code> 를 지역 변수로 만들면 무엇이 문제일까?” — [흑백] 을 누를 때 원본이 없다. 화면 표시(<code>MainImage.Source</code>)는 2교시 예고. (5분)</p>' },
          { layout: 'code', title: '브라우저: 이벤트 = 등록된 메서드 호출', code: `using System;
using OpenCvSharp;

delegate void ClickHandler(string name);

class Program
{
    static ClickHandler Click;              // XAML 의 Click="..." 과 같은 자리

    static void OnGray(string who)
    {
        using var src = Cv2.ImRead("images/sample_color.png");
        using var gray = src.CvtColor(ColorConversionCodes.BGR2GRAY);
        Console.WriteLine($"[{who}] 클릭 -> 평균 {Cv2.Mean(gray).Val0:F1}");
    }

    static void Main()
    {
        Click += OnGray;                    // 핸들러 연결 (XAML 이 대신 해 준다)
        Click?.Invoke("흑백");               // 사용자가 버튼을 누른 순간
    }
}`, points: ['<code>+=</code> 로 핸들러 등록', '<code>?.Invoke</code> — 등록된 것이 있으면 호출', 'WPF 는 이 두 줄을 XAML 과 런타임이 대신 해 준다'], notes: '<p>▶ 실행. “버튼이 특별한 마법이 아니라 메서드 호출” 이라는 것을 확인합니다. 본문 예제 3(FakeButton 2개)도 함께 실행해 핸들러가 여러 개일 때를 보여 주세요. (4분)</p>' },
          { layout: 'table', title: 'Grid 계산 결과 (예제 1)', lead: '창 600 x 300, 행 Auto(60) · * · Auto(40), 열 2* : 3*', head: ['Row', 'Col', 'x', 'y', 'w', 'h'], rows: [
            ['0', '0', '0', '0', '240', '60'], ['0', '1', '240', '0', '360', '60'],
            ['1', '0', '0', '60', '240', '200'], ['1', '1', '240', '60', '360', '200'],
            ['2', '0', '0', '260', '240', '40'], ['2', '1', '240', '260', '360', '40']
          ], notes: '<p>예제 1 을 실행한 결과입니다. 가운데 행만 200 으로 커진 것, 열이 240 : 360 = 2 : 3 인 것을 확인시킵니다. 💬 “창 너비가 900 이면 열 너비는?” — 360 : 540. (3분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>InitializeComponent()</code> 가 하는 일은?', options: ['NuGet 패키지 불러오기', 'XAML 을 읽어 컨트롤을 만들고 <code>x:Name</code> 필드를 채우기', 'OpenCV 초기화', '창을 화면에 표시'], answer: 1, explain: '빌드 때 XAML 로부터 자동 생성됩니다. 그래서 생성자에서 이 줄보다 먼저 컨트롤을 쓰면 NullReferenceException 입니다.', notes: '<p>정답 2번. 틀린 학생에게 그림 1 의 아래쪽(자동 생성 파일)을 다시 보여 줍니다.</p>' },
          { layout: 'practice', title: '실습: [Blur] 버튼 핸들러 연결', desc: '<p><code>OnBlur</code> 를 완성해 <code>GaussianBlur(9x9)</code> 결과의 채널 수와 평균을 출력하고 <code>blurBtn.Click</code> 에 연결하세요.</p>', starter: `using System;
using OpenCvSharp;

delegate void ClickHandler(string name);

class FakeButton
{
    public event ClickHandler Click;
    public string Content;
    public FakeButton(string c) { Content = c; }
    public void Press() { Click?.Invoke(Content); }
}

class Program
{
    static Mat src;

    // TODO: GaussianBlur(9x9) 결과의 채널 수와 평균 출력
    static void OnBlur(string who) { Console.WriteLine($"[{who}] -> TODO"); }

    static void Main()
    {
        src = Cv2.ImRead("images/sample_color.png");
        var b = new FakeButton("Blur");
        b.Click += OnBlur;
        b.Press();
        src.Dispose();
    }
}`, solution: `using System;
using OpenCvSharp;

delegate void ClickHandler(string name);

class FakeButton
{
    public event ClickHandler Click;
    public string Content;
    public FakeButton(string c) { Content = c; }
    public void Press() { Click?.Invoke(Content); }
}

class Program
{
    static Mat src;

    static void OnBlur(string who)
    {
        using var blur = src.GaussianBlur(new Size(9, 9), 0);
        Console.WriteLine($"[{who}] -> {blur.Channels()}채널 평균={Cv2.Mean(blur).Val0:F1}");
    }

    static void Main()
    {
        src = Cv2.ImRead("images/sample_color.png");
        var b = new FakeButton("Blur");
        b.Click += OnBlur;
        b.Press();
        src.Dispose();
    }
}`, notes: '<p>정답 출력: <code>[Blur] -&gt; 3채널 평균=115.5</code>. 흑백은 1채널 119.2 와 비교시켜 “블러는 채널을 바꾸지 않는다” 를 확인합니다. 빨리 끝낸 학생은 커널을 25x25 로 바꿔 보게 하세요. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['WPF 프로젝트 = <code>net8.0-windows</code> + <code>UseWPF</code> + 패키지 <b>3개</b>(WpfExtensions 추가)', '<b>App.xaml</b>(시작) · <b>MainWindow.xaml</b>(화면) · <b>MainWindow.xaml.cs</b>(코드) — 뒤 둘은 하나의 <code>partial</code> 클래스', 'Grid 의 높이 · 너비: <b>Auto</b>(내용) · <b>*</b>(비율) · 숫자(고정), 자식에 <code>Grid.Row</code> / <code>Grid.Column</code>', '<code>x:Name</code> → 코드에서 쓸 이름, <code>Click="핸들러"</code> → 같은 이름의 메서드', '핸들러에서 <code>WaitKey</code> · 무거운 처리 금지 (UI 가 멈춘다)', '다음 교시: Mat 을 <code>BitmapSource</code> 로 바꿔 Image 에 띄우기'], notes: '<p>여섯 줄을 학생이 나눠 읽습니다. 다음 교시 예고: “지금은 InfoText 에 글자만 나왔는데, 이제 진짜 그림을 띄운다.” (2분)</p>' }
        ]
      },
      // ============================================================ 2교시
      {
        id: 'cs02-2', title: 'Mat ↔ BitmapSource: 화면에 이미지 띄우기', minutes: 50,
        goals: ['OpenCvSharp4.WpfExtensions 의 ToBitmapSource() 로 Mat 을 Image 컨트롤에 표시할 수 있다', '채널 수 · 자료형에 맞는 PixelFormat(Gray8 · Bgr24 · Bgra32)을 고르고 float Mat 은 ConvertTo 로 바꿀 수 있다', '반복 표시에는 WriteableBitmap 을 재사용하고, 큰 이미지는 축소해 표시할 수 있다', 'BitmapSourceConverter.ToMat 으로 화면 이미지를 Mat 으로 되돌릴 수 있다'],
        flow: [['도입: 왜 바로 못 띄우나', 6], ['ToBitmapSource 와 PixelFormat', 14], ['WriteableBitmap · 반복 갱신', 12], ['큰 이미지 축소 · 역변환', 12], ['정리 · 퀴즈', 6]],
        content: [
          { type: 'h', text: 'Mat 을 Image.Source 에 그냥 넣을 수 없는 이유' },
          { type: 'p', html: 'WPF 의 <code>Image</code> 컨트롤은 <code>Source</code> 에 <b><code>ImageSource</code></b>(보통 <code>BitmapSource</code>)만 받습니다. <code>Mat</code> 은 C++ OpenCV 가 <b>네이티브 메모리</b>에 잡은 픽셀 덩어리라서 WPF 는 그 형식을 모릅니다. 그래서 <b>픽셀을 WPF 가 아는 형태로 복사</b>해 주는 변환기가 필요합니다 — 그것이 <code>OpenCvSharp4.WpfExtensions</code> 패키지의 <b><code>BitmapSourceConverter</code></b> 입니다.' },
          { type: 'figure', html: FIG_CONVERT, caption: '그림 3. Mat(네이티브 · BGR) → BitmapSourceConverter → BitmapSource(PixelFormat) → Image.Source. Mat 의 형식이 PixelFormat 을 정한다' },
          { type: 'callout', kind: 'vs', title: '패키지 하나만 더 설치하면 됩니다', html: 'NuGet 에서 <b><code>OpenCvSharp4.WpfExtensions</code></b> 를 설치하고 코드 위에 <code>using OpenCvSharp.WpfExtensions;</code> 를 적으면 <code>mat.ToBitmapSource()</code> 확장 메서드를 쓸 수 있습니다. (WinForms 프로젝트라면 <code>OpenCvSharp4.Extensions</code> 의 <code>mat.ToBitmap()</code> 입니다.) 패키지 이름의 <b>버전은 OpenCvSharp4 와 같게</b> 맞추세요.' },
          { type: 'code', title: 'MainWindow.xaml.cs — Mat 을 화면에 띄우는 코드', code: CS_TOBITMAP, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '<code>mat.ToBitmapSource()</code> 와 <code>BitmapSourceConverter.ToBitmapSource(mat)</code> 는 <b>완전히 같은 일</b>을 합니다(앞의 것이 확장 메서드). 변환은 <b>픽셀을 복사</b>하므로 변환이 끝난 뒤 <code>gray</code> 를 Dispose 해도 화면은 그대로 남습니다 — 그래서 <code>GrayButton_Click</code> 에서 <code>using var</code> 를 쓸 수 있습니다. 반대로 <code>_src</code>(원본)는 다른 버튼에서 또 쓰므로 필드로 보관합니다.' },
          { type: 'h', text: '채널 수와 PixelFormat' },
          { type: 'table', head: ['Mat 형식', '채널', 'WPF PixelFormat', '한 픽셀'], rows: [
            ['<code>CV_8UC1</code> (흑백)', '1', '<code>PixelFormats.Gray8</code>', '1바이트'],
            ['<code>CV_8UC3</code> (컬러)', '3', '<code>PixelFormats.Bgr24</code>', '3바이트 (B G R)'],
            ['<code>CV_8UC4</code> (알파 포함)', '4', '<code>PixelFormats.Bgra32</code>', '4바이트 (B G R A)'],
            ['<code>CV_16UC1</code>', '1', '<code>PixelFormats.Gray16</code>', '2바이트 (산업용 카메라)'],
            ['<code>CV_32FC1</code> · <code>CV_32FC3</code>', '1 · 3', '<b>없음</b> → <code>ConvertTo</code> 로 <code>CV_8U</code> 로', '4 · 12바이트']
          ], caption: '표 3. OpenCV 의 BGR 순서가 WPF 의 Bgr24 · Bgra32 와 그대로 맞는다 — 채널을 뒤집을 필요가 없다' },
          { type: 'code', title: '예제 1: 채널 수 · 자료형에 따른 PixelFormat 과 메모리', code: EX_FORMAT,
            desc: '<code>ElemSize()</code> 는 픽셀 하나의 바이트 수, <code>Width × ElemSize()</code> 가 한 행의 바이트 수(<b>stride</b>)입니다. <code>CV_32FC3</code>(실수) 는 대응하는 PixelFormat 이 없으므로 <code>ConvertTo(dst, MatType.CV_8UC3, 255)</code> 처럼 8bit 로 바꿔야 화면에 띄울 수 있습니다. 마지막 두 줄이 중요합니다 — <b>ROI(부분 Mat)는 메모리가 연속이 아니므로</b> <code>WriteableBitmap.WritePixels</code> 에 그대로 넘기면 그림이 어긋납니다. <code>Clone()</code> 으로 연속 Mat 을 만들어 넘기세요(<code>ToBitmapSource()</code> 는 안에서 알아서 처리합니다).',
            expect: 'Gray   CV_8UC1   채널 1  픽셀당 1바이트  한 행 640바이트 -> PixelFormats.Gray8\nBGR    CV_8UC3   채널 3  픽셀당 3바이트  한 행 1920바이트 -> PixelFormats.Bgr24\nBGRA   CV_8UC4   채널 4  픽셀당 4바이트  한 행 2560바이트 -> PixelFormats.Bgra32\nfloat  CV_32FC3  채널 3  픽셀당 12바이트  한 행 7680바이트 -> 변환 불가 -> ConvertTo 로 CV_8U 로 바꾸기\nBGR 전체 921600바이트, 연속(IsContinuous) = True\nROI 200x150 의 IsContinuous = False -> 그대로 넘기면 안 됩니다. Clone() 하세요' },
          { type: 'callout', kind: 'warn', title: '이런 Mat 은 화면에 안 나옵니다', html: '<ul><li><b>실수형(CV_32F)</b>: 계산 중간 결과(Sobel · 거리 변환 · 정규화)는 실수입니다 → <code>Cv2.ConvertScaleAbs(src, dst)</code> 또는 <code>Cv2.Normalize(src, dst, 0, 255, NormTypes.MinMax, MatType.CV_8U)</code> 로 바꾸세요.</li><li><b>빈 Mat</b>: <code>Empty()</code> 가 true 인 Mat 을 변환하면 예외입니다 → 항상 먼저 검사.</li><li><b>2채널 · 6채널 등</b>: 표시용 형식이 없습니다 → <code>Cv2.Split</code> 으로 골라 보여 주세요.</li></ul>' },
          { type: 'code', title: '예제 2: BGR 순서와 잘못된 PixelFormat', code: EX_BGRORDER,
            desc: 'OpenCV 의 메모리 순서는 <b>B, G, R</b> 이고 WPF 의 <code>Bgr24</code> 도 <b>B, G, R</b> 이므로 그대로 맞습니다. 만약 <code>Rgb24</code> 로 만들면 같은 바이트를 R, G, B 로 읽어 <b>빨강과 파랑이 뒤바뀐</b> 그림이 됩니다. 결과 창의 두 이미지를 비교해 보세요 — 빨간 원이 파랗게, 파란 삼각형이 빨갛게 보입니다. 화면 색이 이상할 때 가장 먼저 의심할 곳입니다.',
            expect: 'Mat 의 메모리 순서            : [0]=40 [1]=39 [2]=207\nBgr24 로 해석 -> B=40 G=39 R=207 (빨강, 맞음)\nRgb24 로 해석 -> R=40 G=39 B=207 (빨강이 파랑으로!)\nBGR2RGB 로 바꾼 Mat 의 순서   : [0]=207 [1]=39 [2]=40' },
          { type: 'h', text: '반복해서 갱신할 때: WriteableBitmap 재사용' },
          { type: 'p', html: '버튼을 한 번 누르는 처리라면 <code>ToBitmapSource()</code> 로 충분합니다. 그러나 <b>카메라 영상처럼 초당 30장</b>을 갱신한다면 매번 새 <code>BitmapSource</code>(한 장 0.9 MB)를 만들어 버리는 셈이라 GC 부담이 커집니다. 이때는 <b><code>WriteableBitmap</code></b> 하나를 만들어 <code>Source</code> 에 한 번만 대입하고, 프레임마다 <b>픽셀만 덮어씁니다</b>.' },
          { type: 'figure', html: FIG_WB, caption: '그림 4. 방식 A 매 프레임 새 BitmapSource(버튼 처리에 적합) · 방식 B WriteableBitmap 재사용(카메라 · 동영상에 적합)' },
          { type: 'code', title: 'MainWindow.xaml.cs — WriteableBitmap 으로 프레임 갱신', code: CS_WRITEABLE, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '<code>WriteableBitmap</code> 은 크기 · PixelFormat 이 고정이므로 <b>프레임 크기가 바뀔 때만</b> 새로 만듭니다. 갱신은 <code>WriteableBitmapConverter.ToWriteableBitmap(frame, _wb)</code> 한 줄이면 됩니다(OpenCvSharp 이 제공). 직접 <code>WritePixels</code> 를 부를 때는 <b>stride = 한 행 바이트 수</b>를 정확히 넘겨야 하고 Mat 이 <b>연속 메모리</b>여야 합니다. 15차시 카메라 영상에서 이 구조를 다시 씁니다.' },
          { type: 'code', title: '예제 3: 처리 파이프라인의 한 프레임 시간 재기', code: EX_PERF, nondeterministic: true,
            desc: '실행할 때마다 값이 조금씩 달라집니다(브라우저 인터프리터는 .NET 보다 수십 배 느리므로 <b>로컬에서는 훨씬 빠릅니다</b>). 중요한 것은 <b>출력 Mat 을 반복 밖에서 만들어 재사용</b>하는 구조입니다 — WPF 에서 <code>WriteableBitmap</code> 을 재사용하는 것과 같은 생각입니다. 한 프레임 시간이 33 ms 보다 길면 초당 30장을 따라가지 못하므로, 그때는 이미지를 축소하거나 처리를 줄입니다.' },
          { type: 'h', text: '큰 이미지는 축소해서 표시' },
          { type: 'p', html: '4000×3000 산업용 카메라 이미지를 그대로 <code>BitmapSource</code> 로 만들면 36 MB 가 복사되고, 화면에는 어차피 축소되어 보입니다. <b>표시용으로만</b> 줄인 Mat 을 따로 만들고 <b>처리는 원본으로</b> 하는 것이 원칙입니다. WPF 쪽에서는 <code>Stretch="Uniform"</code> 이 자동으로 맞춰 주고, 픽셀을 정확히 보고 싶으면 <code>Stretch="None"</code> + <code>ScrollViewer</code> + 배율 변환을 씁니다.' },
          { type: 'code', title: 'Image 컨트롤의 두 가지 표시 방식', lang: 'xml', file: 'MainWindow.xaml', code: XML_IMAGE_OPT, run: false,
            desc: '<code>Stretch="Uniform"</code> 은 비율을 지키며 칸에 맞춥니다(전체 보기용). 뷰어 앱처럼 <b>1 픽셀을 정확히</b> 보려면 <code>Stretch="None"</code> 으로 두고 <code>LayoutTransform</code> 의 <code>ScaleTransform</code> 으로 배율을 줍니다. <code>BitmapScalingMode="NearestNeighbor"</code> 는 확대할 때 픽셀을 네모로 보여 주어 픽셀 값 확인에 좋습니다(기본값은 부드럽게 섞습니다).' },
          { type: 'code', title: '예제 4: 표시용으로 축소하고, 왕복 변환을 확인하기', code: EX_FIT,
            desc: '<code>InterpolationFlags.Area</code> 는 <b>축소</b>에 가장 알맞은 방법입니다(여러 픽셀의 평균 → 계단 · 잡음이 줄어듭니다). 배율이 1 이상이면 굳이 확대하지 않고 <code>Clone()</code> 을 돌려주는 것도 중요합니다. 뒷부분은 <b>역변환</b> 맛보기입니다 — WPF 에서는 <code>BitmapSourceConverter.ToMat(bitmapSource)</code> 로 화면 이미지를 Mat 으로 되돌립니다. 브라우저에는 WPF 가 없으므로 PNG 바이트로 왕복해 <b>무손실(다른 픽셀 0개)</b>임을 확인했습니다.',
            expect: '원본 800x600 -> 표시용 320x240 (배율 0.400)\n메모리 480000바이트 -> 76800바이트\nPNG 바이트 36587개로 왕복 -> 다른 픽셀 0개' },
          { type: 'h', text: '역변환: BitmapSource → Mat' },
          { type: 'code', title: 'MainWindow.xaml.cs — 클립보드 이미지를 Mat 으로', code: CS_TOMAT, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '<code>BitmapSourceConverter.ToMat(bs)</code> 는 보통 <b>BGRA 4채널</b> Mat 을 돌려줍니다(WPF 화면 이미지에 알파가 있기 때문). 대부분의 OpenCV 함수는 3채널을 기대하므로 <code>BGRA2BGR</code> 로 알파를 버리고 씁니다. 스크린샷 검사, 다른 프로그램에서 복사한 이미지 처리, 사용자가 화면에 그린 도형을 마스크로 쓰는 경우에 필요합니다.' },
          { type: 'callout', kind: 'tip', title: '변환은 복사다 — 그래서 편하다', html: '<code>ToBitmapSource()</code> 는 픽셀을 <b>복사</b>해 관리 힙의 새 객체를 만듭니다. 따라서 ① 변환 뒤에는 Mat 을 바로 Dispose 해도 화면이 멀쩡하고, ② 반대로 Mat 을 고쳐도 <b>화면은 저절로 바뀌지 않습니다</b>(다시 변환해 <code>Source</code> 에 넣어야 합니다). 복사 비용이 아까운 경우(대형 영상 · 고속 갱신)에만 <code>WriteableBitmap</code> 을 씁니다.' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: '<ul><li>표시 전용 코드는 <code>ShowMat(Mat)</code> 같은 <b>메서드 하나</b>로 모아 두면 버튼이 늘어도 관리가 쉽습니다.</li><li><code>Image.Source</code> 에 넣은 <code>BitmapSource</code> 는 <b>Dispose 가 없습니다</b>(GC 관리). Dispose 를 챙겨야 하는 것은 언제나 <code>Mat</code> 쪽입니다.</li><li>다른 스레드에서 만든 <code>BitmapSource</code> 를 UI 에 붙이려면 <code>Freeze()</code> 가 필요합니다 — 16차시 <code>Task.Run</code> 에서 다룹니다.</li></ul>' },
          { type: 'callout', kind: 'tip', teacher: true, title: '2교시 지도 팁 · 오개념', html: '<ul><li>오개념 1: “Mat 을 바꾸면 화면도 바뀐다” — 복사이므로 다시 변환해야 합니다. 일부러 Mat 만 고쳐 보고 화면이 그대로인 것을 보여 주면 확실히 남습니다.</li><li>오개념 2: “BGR 이니까 RGB 로 뒤집어야 한다” — <code>Bgr24</code> 를 쓰면 뒤집지 않습니다. 예제 2 를 꼭 실행해 확인시키세요.</li><li>실수 1위: <code>OpenCvSharp4.WpfExtensions</code> 미설치 → <code>ToBitmapSource</code> 를 찾을 수 없다는 컴파일 오류. 두 번째는 <code>using OpenCvSharp.WpfExtensions;</code> 누락(패키지 이름과 namespace 가 다름!).</li><li>시간이 남으면 예제 4 의 목표 크기를 640×480 으로 바꿔 배율이 1 을 넘을 때 어떻게 되는지 확인시키세요.</li></ul>' }
        ],
        practice: [
          {
            title: '채널 수로 PixelFormat 을 고르는 함수', level: 1,
            desc: '<code>PickFormat(Mat)</code> 를 완성하세요. <code>CV_8UC1</code> → <code>Gray8</code>, <code>CV_8UC3</code> → <code>Bgr24</code>, <code>CV_8UC4</code> → <code>Bgra32</code>, 그 밖에는 <code>지원하지 않음</code> 을 돌려줍니다. 네 가지 Mat(흑백 · 컬러 · BGRA · float)에 대해 <code>형식 채널 N -&gt; PixelFormat</code> 을 출력하세요.',
            hint: '<code>if (m.Type() == MatType.CV_8UC1) return "Gray8";</code> 처럼 <code>MatType</code> 은 <code>==</code> 로 비교할 수 있습니다. float Mat 은 <code>src.ConvertTo(dst, MatType.CV_32FC3, 1.0 / 255)</code> 로 만듭니다.',
            expect: 'CV_8UC1 채널 1 -> Gray8\nCV_8UC3 채널 3 -> Bgr24\nCV_8UC4 채널 4 -> Bgra32\nCV_32FC3 채널 3 -> 지원하지 않음',
            starter: `using System;
using OpenCvSharp;

class Program
{
    // TODO: CV_8UC3 -> "Bgr24", CV_8UC4 -> "Bgra32", 그 밖에는 "지원하지 않음" 을 돌려주세요
    static string PickFormat(Mat m)
    {
        if (m.Type() == MatType.CV_8UC1) return "Gray8";
        return "???";
    }

    static void Main()
    {
        using var bgr = Cv2.ImRead("images/sample_color.png");
        using var gray = bgr.CvtColor(ColorConversionCodes.BGR2GRAY);
        using var bgra = bgr.CvtColor(ColorConversionCodes.BGR2BGRA);
        using var f32 = new Mat();
        bgr.ConvertTo(f32, MatType.CV_32FC3, 1.0 / 255);

        foreach (Mat m in new Mat[] { gray, bgr, bgra, f32 })
            Console.WriteLine($"{m.Type()} 채널 {m.Channels()} -> {PickFormat(m)}");
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static string PickFormat(Mat m)
    {
        if (m.Type() == MatType.CV_8UC1) return "Gray8";
        if (m.Type() == MatType.CV_8UC3) return "Bgr24";
        if (m.Type() == MatType.CV_8UC4) return "Bgra32";
        return "지원하지 않음";
    }

    static void Main()
    {
        using var bgr = Cv2.ImRead("images/sample_color.png");
        using var gray = bgr.CvtColor(ColorConversionCodes.BGR2GRAY);
        using var bgra = bgr.CvtColor(ColorConversionCodes.BGR2BGRA);
        using var f32 = new Mat();
        bgr.ConvertTo(f32, MatType.CV_32FC3, 1.0 / 255);

        foreach (Mat m in new Mat[] { gray, bgr, bgra, f32 })
            Console.WriteLine($"{m.Type()} 채널 {m.Channels()} -> {PickFormat(m)}");
    }
}`
          },
          {
            title: '창 크기에 맞춰 축소해 표시하기', level: 2,
            desc: '<code>FitTo(src, maxW, maxH)</code> 를 완성하세요. 배율은 가로 · 세로 중 <b>작은 쪽</b>을 쓰고, 배율이 1 이상이면 확대하지 않고 <code>Clone()</code> 을 돌려줍니다. 축소는 <code>InterpolationFlags.Area</code>. <code>images/plate_holes.png</code>(800×600)를 <b>세 가지 창 크기</b>(640×480 · 320×240 · 1600×1200)에 맞춰 <code>maxW x maxH -&gt; 결과 크기 (배율 x.xxx)</code> 로 출력하세요.',
            hint: '<code>double s = Math.Min((double)maxW / src.Width, (double)maxH / src.Height);</code> — <code>(double)</code> 을 빼면 정수 나눗셈이 되어 0 이 됩니다! 크기는 <code>new Size((int)Math.Round(src.Width * s), (int)Math.Round(src.Height * s))</code>.',
            expect: '640 x 480 -> 640 x 480 (배율 0.800)\n320 x 240 -> 320 x 240 (배율 0.400)\n1600 x 1200 -> 800 x 600 (배율 1.000)',
            starter: `using System;
using OpenCvSharp;

class Program
{
    // TODO: 배율을 계산해 축소한 새 Mat 을 돌려주세요 (1 이상이면 Clone())
    static Mat FitTo(Mat src, int maxW, int maxH)
    {
        return src.Clone();
    }

    static void Main()
    {
        using var big = Cv2.ImRead("images/plate_holes.png", ImreadModes.Grayscale);
        int[,] windows = { { 640, 480 }, { 320, 240 }, { 1600, 1200 } };
        for (int i = 0; i < 3; i++)
        {
            int w = windows[i, 0], h = windows[i, 1];
            using var view = FitTo(big, w, h);
            double ratio = (double)view.Width / big.Width;
            Console.WriteLine($"{w} x {h} -> {view.Width} x {view.Height} (배율 {ratio:F3})");
        }
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static Mat FitTo(Mat src, int maxW, int maxH)
    {
        double s = Math.Min((double)maxW / src.Width, (double)maxH / src.Height);
        if (s >= 1.0) return src.Clone();
        var size = new Size((int)Math.Round(src.Width * s), (int)Math.Round(src.Height * s));
        return src.Resize(size, 0, 0, InterpolationFlags.Area);
    }

    static void Main()
    {
        using var big = Cv2.ImRead("images/plate_holes.png", ImreadModes.Grayscale);
        int[,] windows = { { 640, 480 }, { 320, 240 }, { 1600, 1200 } };
        for (int i = 0; i < 3; i++)
        {
            int w = windows[i, 0], h = windows[i, 1];
            using var view = FitTo(big, w, h);
            double ratio = (double)view.Width / big.Width;
            Console.WriteLine($"{w} x {h} -> {view.Width} x {view.Height} (배율 {ratio:F3})");
            Cv2.ImShow($"{w}x{h}", view);
        }
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: [
          { q: '<code>CV_8UC3</code> Mat 을 <code>BitmapSource</code> 로 바꿀 때 쓰이는 PixelFormat 은?', options: ['<code>Gray8</code>', '<code>Rgb24</code>', '<code>Bgr24</code>', '<code>Bgra32</code>'], answer: 2,
            explain: 'OpenCV 의 메모리 순서가 <b>B, G, R</b> 이므로 <code>Bgr24</code> 가 그대로 맞습니다. <code>Rgb24</code> 로 만들면 <b>빨강과 파랑이 뒤바뀐</b> 그림이 됩니다.' },
          { q: 'WPF 프로젝트에서 <code>mat.ToBitmapSource()</code> 를 쓰려면 필요한 것은?', options: ['<code>OpenCvSharp4.Extensions</code> 패키지', '<code>OpenCvSharp4.WpfExtensions</code> 패키지 + <code>using OpenCvSharp.WpfExtensions;</code>', '<code>System.Drawing.Common</code> 패키지', '아무것도 필요 없다 (OpenCvSharp4 에 포함)'], answer: 1,
            explain: 'WPF 용 변환기는 별도 패키지입니다. <code>OpenCvSharp4.Extensions</code> 는 <b>WinForms</b>(<code>Bitmap</code>)용입니다. 패키지 이름(<code>OpenCvSharp4.WpfExtensions</code>)과 namespace(<code>OpenCvSharp.WpfExtensions</code>)가 다른 점도 주의하세요.' },
          { q: '<code>Cv2.Sobel</code> 결과처럼 <code>CV_32F</code> Mat 을 그대로 화면에 띄우려 하면?', options: ['자동으로 8bit 로 바뀌어 잘 보인다', '대응하는 PixelFormat 이 없어 실패한다 → <code>ConvertScaleAbs</code> · <code>Normalize</code> 로 <code>CV_8U</code> 로 바꿔야 한다', '흑백으로 보인다', '알파 채널이 생긴다'], answer: 1,
            explain: '실수형에는 표시용 PixelFormat 이 없습니다. <code>Cv2.ConvertScaleAbs</code> 나 <code>Cv2.Normalize(..., 0, 255, NormTypes.MinMax, MatType.CV_8U)</code> 로 8bit 로 바꾼 뒤 표시합니다.' },
          { q: '카메라 영상을 초당 30장 갱신할 때 권장되는 방법은?', options: ['프레임마다 <code>ToBitmapSource()</code> 로 새 객체 만들기', '<code>WriteableBitmap</code> 하나를 만들어 픽셀만 덮어쓰기', '프레임마다 파일로 저장한 뒤 다시 읽기', '<code>Cv2.ImShow</code> 로 별도 창에 띄우기'], answer: 1,
            explain: '<code>WriteableBitmap</code> 을 <code>Source</code> 에 한 번만 대입하고 <code>WriteableBitmapConverter.ToWriteableBitmap(frame, wb)</code> 로 픽셀만 덮어씁니다. 새 객체 할당이 없으므로 GC 부담이 사라집니다.' },
          { q: '<code>ToBitmapSource()</code> 로 표시한 뒤 그 Mat 을 <code>Dispose</code> 하면?', options: ['화면이 검게 변한다', '예외가 발생한다', '화면은 그대로다 — 변환은 픽셀을 <b>복사</b>하기 때문', 'Mat 을 고치면 화면도 함께 바뀐다'], answer: 2,
            explain: '변환은 픽셀을 관리 힙으로 복사합니다. 그래서 Mat 을 해제해도 화면은 남고, 반대로 <b>Mat 을 고쳐도 화면은 저절로 바뀌지 않습니다</b> — 다시 변환해 <code>Source</code> 에 넣어야 합니다.' }
        ],
        slides: [
          { layout: 'title', title: '02. WPF 기초와 이미지 표시', subtitle: '2교시 — Mat ↔ BitmapSource: 화면에 이미지 띄우기', notes: '<p>1교시 앱에는 글자만 나왔습니다. 💬 “<code>MainImage.Source = _src;</code> 라고 쓰면 될까요?” — 안 된다(형식이 다르다). 오늘의 한 줄 <code>mat.ToBitmapSource()</code> 를 예고하며 시작합니다. (3분)</p>' },
          { layout: 'bullets', title: '왜 변환이 필요한가', lead: 'Image.Source 는 BitmapSource 만 받는다', bullets: [
            '<b>Mat</b> = C++ OpenCV 가 <b>네이티브 메모리</b>에 잡은 픽셀 (WPF 는 모르는 형식)',
            '<b>BitmapSource</b> = WPF 가 아는 이미지 (관리 힙 · PixelFormat · DPI)',
            ['그래서 <b>픽셀을 복사</b>해 주는 변환기가 필요', ['<code>OpenCvSharp4.WpfExtensions</code> 패키지', '<code>mat.ToBitmapSource()</code> / <code>BitmapSourceConverter.ToBitmapSource(mat)</code>']],
            '복사이므로 변환 후 Mat 은 Dispose 해도 되고, Mat 을 고쳐도 화면은 그대로'
          ], notes: '<p>“복사” 라는 말을 두 번 강조합니다 — 뒤의 오개념(Mat 고치면 화면도 바뀐다)을 미리 막습니다. 패키지 설치를 지금 함께 하게 하세요. (4분)</p>' },
          { layout: 'diagram', title: 'Mat → BitmapSource → Image', html: FIG_CONVERT, caption: 'Mat 의 형식(CV_8UC1/3/4)이 PixelFormat(Gray8/Bgr24/Bgra32)을 정한다', notes: '<p>위쪽 흐름을 손으로 따라가며 설명하고, 아래쪽 네 상자에서 <b>float 만 빨간 신호</b>라는 점을 짚습니다. 💬 “Sobel 결과를 바로 띄우면?” — 안 나온다, ConvertTo 필요. (4분)</p>' },
          { layout: 'code', title: 'Mat 을 화면에 띄우는 핵심 코드', run: false, local: true, file: 'MainWindow.xaml.cs', code: `using System.Windows;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;        // ToBitmapSource() 가 여기 있다
using Window = System.Windows.Window;   // OpenCvSharp.Window 와 이름 충돌 방지
namespace WpfFirst;
public partial class MainWindow : Window
{
    private Mat? _src;
    private void ShowMat(Mat mat)
    {
        MainImage.Source = mat.ToBitmapSource();          // ← 이 한 줄이 핵심
        InfoText.Text = $"{mat.Width} x {mat.Height} · 채널 {mat.Channels()}";
    }
    private void GrayButton_Click(object sender, RoutedEventArgs e)
    {
        if (_src == null) return;
        using var gray = new Mat();
        Cv2.CvtColor(_src, gray, ColorConversionCodes.BGR2GRAY);
        ShowMat(gray);                  // 표시 후 gray 해제 OK (픽셀이 복사됨)
    }
}`, points: ['<code>using OpenCvSharp.WpfExtensions;</code> 를 빼면 컴파일 오류', '<code>ShowMat</code> 하나로 모아 두면 버튼이 늘어도 편하다', '원본 <code>_src</code> 는 필드, 결과 <code>gray</code> 는 <code>using var</code>'], notes: '<p>첫 줄부터 차례로 읽고 <code>ShowMat</code> 의 두 줄만 외우게 합니다. 💬 “<code>using var gray</code> 로 해제해도 화면이 남는 이유는?” — 복사. 별칭 <code>using Window = ...</code> 를 빼면 CS0104 가 난다고 실제로 보여 주면 좋습니다. (6분)</p>' },
          { layout: 'table', title: '채널 ↔ PixelFormat', head: ['Mat', 'PixelFormat', '한 픽셀'], rows: [
            ['<code>CV_8UC1</code>', '<code>Gray8</code>', '1바이트'],
            ['<code>CV_8UC3</code>', '<code>Bgr24</code> (뒤집지 않는다!)', '3바이트'],
            ['<code>CV_8UC4</code>', '<code>Bgra32</code>', '4바이트'],
            ['<code>CV_16UC1</code>', '<code>Gray16</code>', '2바이트'],
            ['<code>CV_32FC1/3</code>', '<b>없음</b> → <code>ConvertTo</code>', '4 · 12바이트']
          ], notes: '<p>표에서 두 줄만 기억하면 됩니다: <b>흑백 Gray8, 컬러 Bgr24</b>. 16bit 는 산업용 카메라에서 만난다고 언급만 하세요. (3분)</p>' },
          { layout: 'code', title: '브라우저: 형식마다 PixelFormat 고르기', code: `using System;
using OpenCvSharp;

class Program
{
    static string FormatOf(Mat m)
    {
        if (m.Type() == MatType.CV_8UC1) return "Gray8";
        if (m.Type() == MatType.CV_8UC3) return "Bgr24";
        if (m.Type() == MatType.CV_8UC4) return "Bgra32";
        return "변환 불가 -> ConvertTo(CV_8U)";
    }
    static void Main()
    {
        using var bgr = Cv2.ImRead("images/sample_color.png");
        using var gray = bgr.CvtColor(ColorConversionCodes.BGR2GRAY);
        using var bgra = bgr.CvtColor(ColorConversionCodes.BGR2BGRA);
        foreach (Mat m in new Mat[] { gray, bgr, bgra })
            Console.WriteLine($"{m.Type()} 채널 {m.Channels()} 픽셀당 {m.ElemSize()}바이트 -> {FormatOf(m)}");
    }
}`, points: ['<code>MatType</code> 은 <code>==</code> 로 비교할 수 있다', '<code>ElemSize()</code> = 픽셀 하나의 바이트 수', '한 행 바이트 수(stride) = <code>Width × ElemSize()</code>'], notes: '<p>▶ 실행 후 본문 예제 1 도 실행해 float 와 ROI 줄까지 보여 줍니다. ROI 의 <code>IsContinuous = False</code> 는 <code>WritePixels</code> 를 직접 쓸 때 사고가 나는 지점이라고 예고. (5분)</p>' },
          { layout: 'code', title: 'BGR 순서: 뒤집으면 빨강이 파랑이 된다', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var bgr = Cv2.ImRead("images/sample_color.png");
        Vec3b a = bgr.At<Vec3b>(80, 120);        // 빨간 원 위의 픽셀 (행 80, 열 120)
        Console.WriteLine($"메모리 순서 [0]={a.Item0} [1]={a.Item1} [2]={a.Item2}");
        Console.WriteLine("Bgr24 로 해석 -> 빨강 (맞음)");
        Console.WriteLine("Rgb24 로 해석 -> 파랑 (틀림!)");

        using var swapped = bgr.CvtColor(ColorConversionCodes.BGR2RGB);
        Cv2.ImShow("정상 (BGR)", bgr);
        Cv2.ImShow("채널 뒤바뀜", swapped);
        Cv2.WaitKey(0);
    }
}`, points: ['OpenCV 메모리 = B, G, R → <code>Bgr24</code> 와 그대로 맞는다', '<code>Rgb24</code> 를 쓰면 R ↔ B 가 바뀐다', '화면 색이 이상하면 가장 먼저 의심할 곳'], notes: '<p>▶ 실행하고 두 이미지를 나란히 보여 줍니다. 빨간 원이 파랗게 보이는 순간 학생들이 기억합니다. 💬 “실제로 이런 화면을 본 적 있나요?” — 웹캠 예제에서 흔한 증상. (4분)</p>' },
          { layout: 'diagram', title: '반복 갱신: WriteableBitmap 재사용', html: FIG_WB, caption: '방식 A 버튼 처리에 적합 · 방식 B 카메라 · 동영상에 적합', notes: '<p>초당 30장 × 0.9 MB = 27 MB/초 라는 숫자를 칠판에 씁니다. 💬 “버튼 한 번 누르는 처리에도 WriteableBitmap 을 써야 할까?” — 아니다, 코드가 길어져 손해. 상황에 맞게 고르는 것이 핵심. (4분)</p>' },
          { layout: 'code', title: 'WriteableBitmap 으로 프레임 갱신', run: false, local: true, file: 'MainWindow.xaml.cs', code: `using System.Windows.Media;
using System.Windows.Media.Imaging;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;
public partial class MainWindow : Window
{
    private WriteableBitmap? _wb;        // 한 번 만들어 계속 재사용
    private void UpdateFrame(Mat frame)
    {
        if (_wb == null || _wb.PixelWidth != frame.Width || _wb.PixelHeight != frame.Height)
        {
            PixelFormat fmt = frame.Channels() == 1 ? PixelFormats.Gray8
                            : frame.Channels() == 3 ? PixelFormats.Bgr24 : PixelFormats.Bgra32;
            _wb = new WriteableBitmap(frame.Width, frame.Height, 96, 96, fmt, null);
            MainImage.Source = _wb;      // Source 는 처음 한 번만 대입
        }
        WriteableBitmapConverter.ToWriteableBitmap(frame, _wb);   // 픽셀만 덮어쓰기
    }
}`, points: ['크기 · 형식이 바뀔 때만 새로 만든다', '<code>Source</code> 대입은 한 번, 갱신은 픽셀만', '직접 <code>WritePixels</code> 하려면 stride 와 연속 메모리 주의'], notes: '<p>15차시 카메라에서 이 코드를 그대로 쓴다고 예고합니다. 지금은 “이런 방법이 있다” 정도로 충분하며, 외우지 말고 필요할 때 찾아 쓰라고 안내하세요. (4분)</p>' },
          { layout: 'code', title: '큰 이미지는 축소해서 표시', code: `using System;
using OpenCvSharp;

class Program
{
    static Mat FitTo(Mat src, int maxW, int maxH)
    {
        double s = Math.Min((double)maxW / src.Width, (double)maxH / src.Height);
        if (s >= 1.0) return src.Clone();
        var size = new Size((int)Math.Round(src.Width * s), (int)Math.Round(src.Height * s));
        return src.Resize(size, 0, 0, InterpolationFlags.Area);
    }
    static void Main()
    {
        using var big = Cv2.ImRead("images/plate_holes.png", ImreadModes.Grayscale);
        using var view = FitTo(big, 320, 240);
        Console.WriteLine($"{big.Width}x{big.Height} -> {view.Width}x{view.Height}");
        Cv2.ImShow("view", view);
        Cv2.WaitKey(0);
    }
}`, points: ['배율은 가로 · 세로 중 <b>작은 쪽</b>', '<code>(double)</code> 을 빼면 정수 나눗셈 → 0!', '축소는 <code>InterpolationFlags.Area</code>', '처리는 원본으로, 축소는 표시용으로만'], notes: '<p>정수 나눗셈 함정을 꼭 짚어 주세요 — 실습에서 가장 많이 나오는 오류입니다. “처리는 원본, 표시는 축소” 원칙을 반복합니다. XAML 의 <code>Stretch="Uniform"</code> 로도 되지만 메모리 복사는 여전히 원본 크기라는 점도 언급. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>ToBitmapSource()</code> 로 표시한 뒤 그 Mat 을 Dispose 하면?', options: ['화면이 검게 변한다', '예외가 난다', '화면은 그대로다 (픽셀이 복사되었다)', 'Mat 을 고치면 화면도 바뀐다'], answer: 2, explain: '변환은 픽셀을 관리 힙으로 복사합니다. 그래서 Mat 을 해제해도 화면은 남고, Mat 을 고쳐도 화면은 바뀌지 않습니다.', notes: '<p>정답 3번. 4번을 고른 학생이 많으면 실제로 Mat 만 고쳐 보고 화면이 그대로인 것을 시연하세요.</p>' },
          { layout: 'practice', title: '실습: 채널 수로 PixelFormat 고르기', desc: '<p><code>PickFormat(Mat)</code> 을 완성하세요. <code>CV_8UC1</code>→Gray8, <code>CV_8UC3</code>→Bgr24, <code>CV_8UC4</code>→Bgra32, 그 밖에는 “지원하지 않음”.</p>', starter: `using System;
using OpenCvSharp;

class Program
{
    // TODO: 3채널 · 4채널 · 그 밖의 경우를 채우세요
    static string PickFormat(Mat m)
    {
        if (m.Type() == MatType.CV_8UC1) return "Gray8";
        return "???";
    }

    static void Main()
    {
        using var bgr = Cv2.ImRead("images/sample_color.png");
        using var gray = bgr.CvtColor(ColorConversionCodes.BGR2GRAY);
        Console.WriteLine($"{gray.Type()} -> {PickFormat(gray)}");
        Console.WriteLine($"{bgr.Type()} -> {PickFormat(bgr)}");
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static string PickFormat(Mat m)
    {
        if (m.Type() == MatType.CV_8UC1) return "Gray8";
        if (m.Type() == MatType.CV_8UC3) return "Bgr24";
        if (m.Type() == MatType.CV_8UC4) return "Bgra32";
        return "지원하지 않음";
    }

    static void Main()
    {
        using var bgr = Cv2.ImRead("images/sample_color.png");
        using var gray = bgr.CvtColor(ColorConversionCodes.BGR2GRAY);
        Console.WriteLine($"{gray.Type()} -> {PickFormat(gray)}");
        Console.WriteLine($"{bgr.Type()} -> {PickFormat(bgr)}");
    }
}`, notes: '<p>본문 실습 1 의 축약판입니다. 다 한 학생은 float Mat(<code>ConvertTo(CV_32FC3)</code>)을 넣어 “지원하지 않음” 이 나오는지 확인하게 하세요. (6분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['<code>Image.Source</code> 는 <b>BitmapSource</b> 만 받는다 → <code>OpenCvSharp4.WpfExtensions</code> 의 <code>mat.ToBitmapSource()</code>', '형식 대응: <b>CV_8UC1→Gray8 · CV_8UC3→Bgr24 · CV_8UC4→Bgra32</b>, float 은 <code>ConvertTo</code> 먼저', 'OpenCV 의 BGR 순서는 <code>Bgr24</code> 와 그대로 맞는다 — <b>뒤집지 않는다</b>', '변환은 <b>복사</b> → Mat 은 Dispose 해도 되고, 고치면 <b>다시 변환</b>해야 한다', '반복 갱신은 <b>WriteableBitmap 재사용</b>, 큰 이미지는 <b>표시용으로만 축소</b>', '역변환은 <code>BitmapSourceConverter.ToMat</code> (보통 BGRA 4채널)'], notes: '<p>여섯 줄을 학생이 나눠 읽습니다. 다음 교시 예고: “이제 파일 대화상자 · 드래그앤드롭 · 저장을 붙여 진짜 뷰어 앱을 완성한다.” (2분)</p>' }
        ]
      },
      // ============================================================ 3교시
      {
        id: 'cs02-3', title: '이미지 뷰어 앱 완성: 열기 · 필터 · 저장 · 드래그앤드롭', minutes: 50,
        goals: ['OpenFileDialog · SaveFileDialog 로 파일을 열고 저장할 수 있다', '드래그앤드롭으로 이미지를 받고, 필터 버튼으로 결과를 바꿔 표시할 수 있다', '원본 Mat 과 표시용 Mat 을 나눠 보관하고 교체할 때 Dispose 할 수 있다', '상태 표시줄에 크기 · 채널 · 픽셀 값을 표시하고 예외를 잡아 앱이 죽지 않게 만들 수 있다'],
        flow: [['도입: 완성 앱 둘러보기', 6], ['열기 · 드래그앤드롭', 12], ['필터 · 표시 · 저장', 14], ['픽셀 값 · 확대 · 예외', 12], ['정리 · 퀴즈', 6]],
        content: [
          { type: 'h', text: '오늘 완성할 앱' },
          { type: 'p', html: '1교시의 XAML 화면과 2교시의 <code>ToBitmapSource()</code> 를 합쳐 <b>쓸 만한 이미지 뷰어</b>를 만듭니다. 기능은 ① 파일 대화상자 · 드래그앤드롭으로 <b>열기</b>, ② <b>흑백 · Canny · 원본</b> 전환, ③ <b>저장</b>, ④ 확대/축소(Slider · 마우스 휠 · 1:1 · 창에 맞춤), ⑤ 상태 표시줄에 <b>크기 · 채널 · MatType</b> 과 마우스 위치의 <b>픽셀 값</b>, ⑥ 어떤 오류에도 앱이 죽지 않는 <b>예외 처리</b> 입니다.' },
          { type: 'wpf', title: 'Ch02_ImageViewer — 완성 프로젝트', project: 'Ch02_ImageViewer', html: '<p>이 교시의 모든 코드는 저장소의 <code>wpf/Ch02_ImageViewer</code> 에 그대로 들어 있습니다. Visual Studio 2022 에서 <code>Ch02_ImageViewer.csproj</code> 를 열고 NuGet 복원이 끝나면 <b>F5</b> 로 실행하세요.</p><ul><li>파일 구성: <code>App.xaml</code>(버튼 Style) · <code>MainWindow.xaml</code>(화면) · <code>MainWindow.xaml.cs</code>(이벤트 · 처리) · <code>ImageFile.cs</code>(읽기 · 저장 도우미)</li><li>패키지: <code>OpenCvSharp4</code> · <code>OpenCvSharp4.runtime.win</code> · <code>OpenCvSharp4.WpfExtensions</code></li><li>csproj 가 <code>assets/images/*.png</code> 를 실행 폴더의 <code>images/</code> 로 복사하므로, [열기] 를 누르면 예제 이미지 폴더가 먼저 열립니다.</li></ul>' },
          { type: 'figure', html: FIG_VIEWER, caption: '그림 5. 뷰어의 흐름 — 원본(_original)은 그대로 두고 표시용(_display)만 갈아 끼운다' },
          { type: 'code', title: 'MainWindow.xaml — 완성 화면 (실제 프로젝트 파일)', lang: 'xml', file: 'MainWindow.xaml', code: XML_VIEWER, run: false,
            desc: '1교시의 3행 Grid 를 그대로 쓰되 0행은 <code>ToolBar</code>, 2행은 <code>StatusBar</code> 로 바꿨습니다. 새로 나온 것 세 가지: ① <code>Window</code> 에 <code>AllowDrop="True"</code> + <code>DragOver</code> · <code>Drop</code> → <b>드래그앤드롭</b>, ② <code>ScrollViewer</code> 안의 <code>Image</code> 에 <code>Stretch="None"</code> + <code>ScaleTransform</code> → <b>1픽셀 정확 표시와 확대</b>, ③ <code>MouseMove</code> · <code>MouseLeave</code> → <b>픽셀 값 표시</b>. <code>Style="{StaticResource ToolButton}"</code> 는 <code>App.xaml</code> 에 정의한 버튼 여백 스타일입니다.' },
          { type: 'h', text: '① 파일 열기: OpenFileDialog 와 드래그앤드롭' },
          { type: 'callout', kind: 'vs', title: '파일 대화상자는 Microsoft.Win32 에 있습니다', html: 'WPF 의 <code>OpenFileDialog</code> · <code>SaveFileDialog</code> 는 <b><code>Microsoft.Win32</code></b> namespace 입니다(WinForms 의 <code>System.Windows.Forms</code> 가 아닙니다). <code>Filter</code> 문자열은 <code>"표시 이름|*.확장자;*.확장자|..."</code> 형식이고, <code>ShowDialog()</code> 는 <code>bool?</code> 를 돌려주므로 <code>== true</code> 로 비교합니다(취소하면 <code>false</code>). 부모 창을 넘기면(<code>ShowDialog(this)</code>) 대화상자가 창 가운데에 뜹니다.' },
          { type: 'code', title: 'MainWindow.xaml.cs — 열기 · 드래그앤드롭', code: CS_OPEN, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '<b>순서가 중요합니다.</b> <code>ImageFile.Load(path)</code> 가 <b>성공한 뒤에</b> <code>_original?.Dispose()</code> 를 합니다 — 먼저 해제하면 읽기에 실패했을 때 이전 이미지까지 잃어버립니다. 드래그앤드롭은 두 이벤트가 짝입니다: <code>DragOver</code> 에서 <code>e.Effects</code> 로 <b>커서 모양</b>을 정하고(파일이 아니면 <code>None</code>), <code>Drop</code> 에서 <code>DataFormats.FileDrop</code> 으로 <b>경로 배열</b>을 꺼냅니다. 여러 파일을 놓아도 첫 번째만 엽니다.' },
          { type: 'code', title: 'ImageFile.cs — 한글 경로에서도 안전한 읽기 · 저장', code: CS_IMAGEFILE, run: false, local: true, file: 'ImageFile.cs',
            desc: '<code>Cv2.ImRead</code> · <code>Cv2.ImWrite</code> 는 경로를 C++ 로 넘기면서 <b>한글 · 특수문자 경로에서 실패</b>할 수 있습니다(빈 Mat / false). 그래서 <b>파일 읽기는 .NET 이</b>(<code>File.ReadAllBytes</code>) 하고 <b>디코딩만 OpenCV 가</b>(<code>Cv2.ImDecode</code>) 하도록 나눴습니다. 저장도 같은 방식(<code>Cv2.ImEncode</code> → <code>File.WriteAllBytes</code>)입니다. <code>AppContext.BaseDirectory</code> 는 실행 파일이 있는 폴더로, 예제 이미지 폴더를 대화상자의 시작 위치로 쓸 때 편합니다.' },
          { type: 'callout', kind: 'warn', title: '경로 · 대화상자에서 자주 나오는 문제', html: '<ul><li><b>한글 경로에서 빈 Mat</b> → 위처럼 <code>ImDecode</code> / <code>ImEncode</code> 방식으로 바꾸세요.</li><li><b>확장자 없이 저장</b> → <code>Cv2.ImEncode</code> 가 형식을 몰라 실패합니다. 위 코드처럼 없으면 <code>.png</code> 를 붙입니다.</li><li><b>JPG 로 저장하면 값이 변함</b> → JPEG 는 손실 압축입니다. 검사 결과 · 마스크는 반드시 <b>PNG</b>(무손실)로 저장하세요.</li><li><b>1채널 Mat 을 저장</b> → PNG 는 흑백 그대로 저장됩니다(문제 없음). 다만 다시 읽을 때 기본 <code>Color</code> 모드면 3채널로 바뀝니다.</li></ul>' },
          { type: 'code', title: '예제 1: 뷰어의 처리 부분만 떼어 콘솔에서 돌려 보기', code: EX_VIEWER,
            desc: 'WPF 코드에서 <b>화면 표시만 <code>Console.WriteLine</code> + <code>Cv2.ImShow</code> 로 바꾼 것</b>입니다 — 나머지는 완성 프로젝트와 똑같습니다. <code>SetDisplay</code> 안의 <code>_display?.Dispose()</code> 가 <b>매번 이전 표시용 Mat 을 해제</b>하므로 버튼을 100번 눌러도 메모리가 늘지 않습니다. 결과 창의 네 이미지가 실제 앱에서 버튼을 차례로 누른 화면입니다. 출력 문자열이 곧 상태 표시줄에 들어갈 내용입니다.',
            expect: 'images/sample_color.png  |  원본  |  640 x 480  |  채널 3  |  CV_8UC3\nimages/sample_color.png  |  흑백  |  640 x 480  |  채널 1  |  CV_8UC1\nimages/sample_color.png  |  Blur 9x9  |  640 x 480  |  채널 3  |  CV_8UC3\nimages/sample_color.png  |  Canny 80/160  |  640 x 480  |  채널 1  |  CV_8UC1' },
          { type: 'h', text: '② 필터 버튼과 표시 · ③ 저장' },
          { type: 'code', title: 'MainWindow.xaml.cs — 필터 버튼 · SetDisplay · 저장', code: CS_FILTERS, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '<b><code>using</code> 을 쓰는 곳과 쓰지 않는 곳을 구분하세요.</b> <code>SetDisplay</code> 에 넘길 Mat 은 <b>필드가 보관</b>하므로 <code>using</code> 을 쓰면 안 됩니다(쓰면 곧바로 해제되어 <code>ObjectDisposedException</code>). 반대로 <code>CannyButton_Click</code> 의 중간 결과 <code>gray</code> 는 <code>using var</code> 가 맞습니다. <code>OriginalButton_Click</code> 이 <code>_original.Clone()</code> 을 넘기는 이유도 같습니다 — 원본을 그대로 넘기면 다음 <code>SetDisplay</code> 에서 <b>원본이 해제</b>되어 버립니다. <code>CheckLoaded()</code> · <code>ShowCvError()</code> 처럼 반복되는 검사 · 알림은 작은 메서드로 빼 둡니다.' },
          { type: 'table', head: ['뷰어 기능', '화면(XAML)', '코드(.xaml.cs)'], rows: [
            ['열기 (대화상자)', '<code>&lt;Button Click="OpenButton_Click"&gt;</code>', '<code>OpenFileDialog</code> → <code>OpenFile(path)</code>'],
            ['열기 (드래그앤드롭)', '<code>AllowDrop="True" DragOver Drop</code>', '<code>DataFormats.FileDrop</code> → <code>OpenFile(files[0])</code>'],
            ['필터 (흑백 · Canny)', '<code>&lt;Button Click="GrayButton_Click"&gt;</code>', '<code>Cv2.CvtColor</code> · <code>Cv2.Canny</code> → <code>SetDisplay</code>'],
            ['화면 표시', '<code>&lt;Image x:Name="MainImage"&gt;</code>', '<code>MainImage.Source = _display.ToBitmapSource()</code>'],
            ['상태 표시줄', '<code>&lt;TextBlock x:Name="InfoText"&gt;</code>', '<code>InfoText.Text = $"… 채널 … MatType"</code>'],
            ['픽셀 값', '<code>MouseMove</code> · <code>MouseLeave</code>', '<code>_display.At&lt;Vec3b&gt;(y, x)</code> → <code>PixelText.Text</code>'],
            ['확대/축소', '<code>Slider</code> · <code>ScaleTransform</code>', '<code>ZoomTransform.ScaleX = e.NewValue</code>'],
            ['저장', '<code>&lt;Button Click="SaveButton_Click"&gt;</code>', '<code>SaveFileDialog</code> → <code>ImageFile.Save</code>']
          ], caption: '표 4. 기능마다 “화면 한 줄 + 코드 한 메서드” — 이 짝을 익히면 어떤 기능도 붙일 수 있다' },
          { type: 'code', title: '예제 2: 저장 — 확장자 처리와 무손실 확인', code: EX_SAVE,
            desc: '<code>Cv2.ImWrite</code> 는 성공하면 <code>true</code> 를 돌려줍니다. 브라우저에서는 <b>📁 작업 폴더</b>에 저장되어 내려받을 수 있습니다. <code>Cv2.ImEncode</code> 는 파일로 쓰지 않고 <b>바이트 배열</b>을 만들어 주므로, 한글 경로 대응 · 네트워크 전송 · 데이터베이스 저장에 씁니다. 마지막 줄에서 다시 읽어 <code>Absdiff</code> 로 비교해 PNG 가 <b>무손실</b>임을 확인했습니다 — 같은 실험을 <code>".jpg"</code> 로 해 보면 다른 픽셀이 수만 개 나옵니다.',
            expect: 'result      -> result.png\nresult.jpg  -> result.jpg\nCv2.ImWrite("viewer_gray.png") = True  -> 📁 작업 폴더에서 내려받을 수 있습니다\nCv2.ImEncode(".png", ...) -> 127825바이트 (이 배열을 File.WriteAllBytes 로 저장)\n다시 읽어 비교 -> 다른 픽셀 0개 (무손실 PNG)' },
          { type: 'h', text: '④ 상태 표시줄 · 픽셀 값 · 확대/축소' },
          { type: 'code', title: 'MainWindow.xaml.cs — 마우스 위치의 픽셀 값과 확대/축소', code: CS_PIXEL, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '<code>Stretch="None"</code> 이고 배율이 <code>LayoutTransform</code> 에 걸려 있으므로 <code>e.GetPosition(MainImage)</code> 가 <b>곧 이미지 픽셀 좌표</b>가 됩니다(배율로 나눌 필요가 없습니다). 범위를 벗어난 좌표를 그대로 <code>At&lt;T&gt;</code> 에 넣으면 예외이므로 <b>반드시 먼저 검사</b>하세요. 채널 수에 따라 <code>Vec3b</code>(컬러)와 <code>byte</code>(흑백)로 나눠 읽는 것도 중요합니다. <code>ZoomSlider_ValueChanged</code> 의 첫 줄 <code>if (ZoomTransform == null) return;</code> 은 XAML 초기화 중(아직 <code>ZoomTransform</code> 이 만들어지기 전) 이벤트가 오는 것을 막는 방어 코드입니다.' },
          { type: 'code', title: '예제 3: 픽셀 값 문자열과 [창에 맞춤] 배율', code: EX_PIXEL,
            desc: '마우스가 지나간 것처럼 네 좌표를 넣어 봤습니다. 세 번째까지는 값이 나오고 <code>x=700</code> 은 <b>이미지 밖</b>이라 <code>(x, y) = -</code> 가 됩니다. <code>{x,4}</code> 처럼 자리를 고정하면 마우스를 움직일 때 상태 표시줄의 글자가 <b>덜컥거리지 않습니다</b>. 빨간 원 위에서 <code>B=40 G=39 R=207</code> 처럼 <b>R 이 큰 값</b>인 것을 확인하세요 — BGR 순서를 몸으로 익히는 가장 좋은 방법입니다. 마지막 두 줄은 [창에 맞춤] 버튼이 하는 계산입니다.',
            expect: '컬러 (x= 120, y=  80)  B= 40 G= 39 R=207\n컬러 (x= 280, y=  80)  B= 76 G=169 R= 76\n컬러 (x= 500, y= 100)  B= 42 G=214 R=234\n컬러 (x, y) = -\n흑백 (x= 120, y=  80)  밝기= 89\n창 960x540 에 맞춤 배율 = 1.13\n창 320x240 에 맞춤 배율 = 0.50' },
          { type: 'image', src: 'images/sample_color.png', caption: '뷰어로 열어 볼 예제 이미지 — 빨간 원 · 초록 사각형 · 파란 삼각형 위에서 픽셀 값을 확인해 보세요 (누르면 확대 · 픽셀 값)' },
          { type: 'h', text: '⑤ 예외 처리: 앱이 죽지 않게' },
          { type: 'p', html: '콘솔 프로그램은 예외가 나면 종료되면 그만이지만, <b>WPF 앱은 사용자가 쓰고 있는 프로그램</b>입니다. 잘못된 파일 하나 때문에 창이 사라지면 안 됩니다. 원칙은 <b>“핸들러마다 try/catch, 사용자에게는 MessageBox”</b> 입니다. 잡을 예외는 보통 세 종류입니다 — 파일 · 경로 문제(<code>IOException</code> 계열), OpenCV 조건 위반(<code>OpenCVException</code>), 그 밖의 모든 것(<code>Exception</code>).' },
          { type: 'code', title: '예제 4: 세 가지 오류를 잡고도 계속 동작하기', code: EX_VIEWER_EXC,
            desc: 'ImRead 는 실패해도 예외가 없으므로(01차시) <b>우리가 직접 예외를 던져</b> 호출한 쪽이 알 수 있게 했습니다 — 완성 프로젝트의 <code>ImageFile.Load</code> 가 <code>InvalidDataException</code> 을 던지는 것과 같습니다. WPF 에서는 <code>ShowMessage</code> 자리에 <code>MessageBox.Show(this, ex.Message, "열기 실패", MessageBoxButton.OK, MessageBoxImage.Error)</code> 가 들어갑니다. 마지막 줄까지 실행되는 것이 핵심입니다 — <b>오류를 알리고도 앱은 살아 있습니다</b>.',
            expect: '[열기 실패] 이미지 파일을 해석할 수 없습니다: images/not_here.png\n[OpenCV 오류] 채널 수가 맞지 않습니다 (이미 흑백입니다)\n[계속 동작] 에지 픽셀 4727개' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: '<ul><li><b>MessageBox.Show(this, 메시지, 제목, 버튼, 아이콘)</b> — 첫 인수에 <code>this</code> 를 주면 창 가운데에 뜨고, 창을 옮겨도 따라갑니다.</li><li>잡히지 않은 예외를 마지막에 받아 두려면 <code>App.xaml.cs</code> 에서 <code>DispatcherUnhandledException</code> 을 처리합니다(로그 남기고 계속).</li><li>Mat 은 <b>창이 닫힐 때</b>(<code>OnClosed</code>) 반드시 정리합니다. 뷰어는 <code>_display</code> 와 <code>_original</code> 둘 다 Dispose 합니다.</li><li>처리 시간이 긴 기능(대형 이미지 · 반복 처리)은 16차시의 <code>await Task.Run(...)</code> 로 옮겨 UI 가 멈추지 않게 합니다.</li></ul>' },
          { type: 'callout', kind: 'tip', title: '이 뷰어를 계속 키워 갑니다', html: '앞으로 배우는 기능이 모두 이 구조에 버튼 하나로 붙습니다: <b>05차시</b> HSV 색 분리, <b>06차시</b> 히스토그램 · 대비, <b>07차시</b> Slider 로 임계값 조절, <b>09~11차시</b> 모폴로지 · 에지 · 회전, <b>12차시</b> 윤곽선 개수 세기. <b>16차시</b>에서는 같은 구조를 MVVM · 비동기 처리로 다듬어 “이미지 처리 스튜디오” 로 완성합니다. 지금 <code>SetDisplay</code> 한 메서드를 이해해 두면 나머지는 처리 코드만 갈아 끼우는 일입니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '3교시 지도 팁 · 평가 루브릭', html: '<ul><li>수업 준비: 교사 PC 에서 <code>wpf/Ch02_ImageViewer</code> 를 미리 빌드해 두세요(첫 NuGet 복원이 1~2분 걸립니다). 실행해 놓고 드래그앤드롭 · 마우스 휠 확대 · 픽셀 값을 먼저 시연하면 몰입도가 높습니다.</li><li>오개념: “<code>SetDisplay(gray)</code> 에 <code>using var gray</code> 를 쓰면 깔끔하지 않나?” — 일부러 써 보게 하면 <code>ObjectDisposedException</code> 이 나므로 규칙이 오래 남습니다.</li><li>오개념: “<code>_original</code> 을 그대로 <code>SetDisplay</code> 에 넘기면 되지” — 다음 버튼에서 원본이 해제됩니다. <code>Clone()</code> 이 필요한 이유를 그림 5 로 설명하세요.</li><li><b>루브릭</b>(각 2점, 총 10점): ① 파일을 열어 표시 ② 필터 버튼 동작 ③ 표시용 Mat 교체 시 Dispose ④ 상태 표시줄에 크기 · 채널 표시 ⑤ 없는 파일 · 잘못된 파일에서 앱이 죽지 않음.</li><li>과제: 뷰어에 [Blur] 버튼을 추가하고(실습 1), 저장 파일 이름에 필터 이름이 들어가게 바꿔 보기.</li></ul>' }
        ],
        practice: [
          {
            title: 'Viewer 에 [Blur] 버튼 추가하기', level: 1,
            desc: '<code>Viewer</code> 클래스에 <code>Blur()</code> 메서드를 만들어 <code>GaussianBlur(9x9)</code> 결과를 <code>SetDisplay(mat, "Blur 9x9")</code> 로 표시하세요. <code>Main</code> 에서 <code>[원본] → [흑백] → [Blur] → [Canny]</code> 순서로 눌러 네 줄이 출력되게 합니다. <b>주의</b>: <code>SetDisplay</code> 에 넘기는 Mat 에는 <code>using</code> 을 쓰지 마세요.',
            hint: '<code>var blur = new Mat(); Cv2.GaussianBlur(_original, blur, new Size(9, 9), 0); SetDisplay(blur, "Blur 9x9");</code> — <code>Gray()</code> 를 그대로 따라 쓰면 됩니다.',
            expect: 'images/sample_color.png  |  원본  |  640 x 480  |  채널 3  |  CV_8UC3\nimages/sample_color.png  |  흑백  |  640 x 480  |  채널 1  |  CV_8UC1\nimages/sample_color.png  |  Blur 9x9  |  640 x 480  |  채널 3  |  CV_8UC3\nimages/sample_color.png  |  Canny 80/160  |  640 x 480  |  채널 1  |  CV_8UC1',
            starter: `using System;
using OpenCvSharp;

class Viewer
{
    Mat _original;
    Mat _display;
    string _name = "";

    public void Open(string path)
    {
        Mat loaded = Cv2.ImRead(path, ImreadModes.Color);
        if (loaded.Empty()) { loaded.Dispose(); throw new Exception($"읽기 실패: {path}"); }
        _original?.Dispose();
        _original = loaded;
        _name = path;
        SetDisplay(_original.Clone(), "원본");
    }

    public void Gray()
    {
        var gray = new Mat();
        Cv2.CvtColor(_original, gray, ColorConversionCodes.BGR2GRAY);
        SetDisplay(gray, "흑백");
    }

    // TODO: GaussianBlur(9x9) 결과를 "Blur 9x9" 라는 이름으로 표시하는 Blur() 를 만드세요

    public void Canny()
    {
        using var gray = new Mat();
        Cv2.CvtColor(_original, gray, ColorConversionCodes.BGR2GRAY);
        var edges = new Mat();
        Cv2.Canny(gray, edges, 80, 160);
        SetDisplay(edges, "Canny 80/160");
    }

    void SetDisplay(Mat mat, string what)
    {
        _display?.Dispose();
        _display = mat;
        Console.WriteLine($"{_name}  |  {what}  |  {mat.Width} x {mat.Height}  |  채널 {mat.Channels()}  |  {mat.Type()}");
        Cv2.ImShow(what, mat);
    }

    public void CloseAll() { _display?.Dispose(); _original?.Dispose(); }
}

class Program
{
    static void Main()
    {
        var viewer = new Viewer();
        viewer.Open("images/sample_color.png");
        viewer.Gray();
        // TODO: viewer.Blur(); 를 여기에 넣으세요
        viewer.Canny();
        viewer.CloseAll();
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Viewer
{
    Mat _original;
    Mat _display;
    string _name = "";

    public void Open(string path)
    {
        Mat loaded = Cv2.ImRead(path, ImreadModes.Color);
        if (loaded.Empty()) { loaded.Dispose(); throw new Exception($"읽기 실패: {path}"); }
        _original?.Dispose();
        _original = loaded;
        _name = path;
        SetDisplay(_original.Clone(), "원본");
    }

    public void Gray()
    {
        var gray = new Mat();
        Cv2.CvtColor(_original, gray, ColorConversionCodes.BGR2GRAY);
        SetDisplay(gray, "흑백");
    }

    public void Blur()
    {
        var blur = new Mat();
        Cv2.GaussianBlur(_original, blur, new Size(9, 9), 0);
        SetDisplay(blur, "Blur 9x9");
    }

    public void Canny()
    {
        using var gray = new Mat();
        Cv2.CvtColor(_original, gray, ColorConversionCodes.BGR2GRAY);
        var edges = new Mat();
        Cv2.Canny(gray, edges, 80, 160);
        SetDisplay(edges, "Canny 80/160");
    }

    void SetDisplay(Mat mat, string what)
    {
        _display?.Dispose();
        _display = mat;
        Console.WriteLine($"{_name}  |  {what}  |  {mat.Width} x {mat.Height}  |  채널 {mat.Channels()}  |  {mat.Type()}");
        Cv2.ImShow(what, mat);
    }

    public void CloseAll() { _display?.Dispose(); _original?.Dispose(); }
}

class Program
{
    static void Main()
    {
        var viewer = new Viewer();
        viewer.Open("images/sample_color.png");
        viewer.Gray();
        viewer.Blur();
        viewer.Canny();
        viewer.CloseAll();
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '상태 표시줄의 픽셀 값 문자열 완성하기', level: 2,
            desc: '<code>PixelText(m, x, y)</code> 를 완성하세요. ① 좌표가 이미지 밖이면 <code>(x, y) = -</code>, ② 3채널이면 <code>(x= 120, y=  80)  B= 40 G= 39 R=207</code>, ③ 1채널이면 <code>(x= 120, y=  80)  밝기= 89</code>. 숫자는 <code>{x,4}</code> · <code>{px.Item0,3}</code> 처럼 <b>자리를 고정</b>하세요.',
            hint: '범위 검사를 <b>가장 먼저</b> 하세요(안 하면 예외!). 3채널은 <code>Vec3b px = m.At&lt;Vec3b&gt;(y, x);</code>, 1채널은 <code>byte v = m.At&lt;byte&gt;(y, x);</code> — 둘 다 <b>(행 y, 열 x)</b> 순서입니다.',
            expect: '컬러 (x= 120, y=  80)  B= 40 G= 39 R=207\n컬러 (x= 280, y=  80)  B= 76 G=169 R= 76\n컬러 (x, y) = -\n흑백 (x= 120, y=  80)  밝기= 89',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static string PixelText(Mat m, int x, int y)
    {
        // TODO 1: 좌표가 이미지 밖이면 "(x, y) = -" 를 돌려주세요
        // TODO 2: 3채널이면 B G R, 1채널이면 밝기를 자리 고정해 돌려주세요
        return $"(x={x,4}, y={y,4})  ???";
    }

    static void Main()
    {
        using var color = Cv2.ImRead("images/sample_color.png");
        using var gray = color.CvtColor(ColorConversionCodes.BGR2GRAY);
        Console.WriteLine("컬러 " + PixelText(color, 120, 80));
        Console.WriteLine("컬러 " + PixelText(color, 280, 80));
        Console.WriteLine("컬러 " + PixelText(color, 700, 80));
        Console.WriteLine("흑백 " + PixelText(gray, 120, 80));
        Cv2.ImShow("color", color);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static string PixelText(Mat m, int x, int y)
    {
        if (x < 0 || y < 0 || x >= m.Width || y >= m.Height) return "(x, y) = -";
        if (m.Channels() == 3)
        {
            Vec3b px = m.At<Vec3b>(y, x);
            return $"(x={x,4}, y={y,4})  B={px.Item0,3} G={px.Item1,3} R={px.Item2,3}";
        }
        byte v = m.At<byte>(y, x);
        return $"(x={x,4}, y={y,4})  밝기={v,3}";
    }

    static void Main()
    {
        using var color = Cv2.ImRead("images/sample_color.png");
        using var gray = color.CvtColor(ColorConversionCodes.BGR2GRAY);
        Console.WriteLine("컬러 " + PixelText(color, 120, 80));
        Console.WriteLine("컬러 " + PixelText(color, 280, 80));
        Console.WriteLine("컬러 " + PixelText(color, 700, 80));
        Console.WriteLine("흑백 " + PixelText(gray, 120, 80));
        Cv2.ImShow("color", color);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: [
          { q: 'WPF 에서 <code>OpenFileDialog</code> · <code>SaveFileDialog</code> 는 어느 namespace 에 있는가?', options: ['<code>System.Windows.Forms</code>', '<code>Microsoft.Win32</code>', '<code>System.IO</code>', '<code>OpenCvSharp</code>'], answer: 1,
            explain: 'WPF 의 파일 대화상자는 <b><code>Microsoft.Win32</code></b> 입니다(WinForms 의 것과 이름은 같지만 다른 클래스). <code>ShowDialog()</code> 가 <code>bool?</code> 를 돌려주므로 <code>== true</code> 로 비교합니다.' },
          { q: '드래그앤드롭으로 파일을 받으려면 필요한 세 가지는?', options: ['<code>AllowDrop="True"</code> + <code>Drop</code> 이벤트 + <code>DataFormats.FileDrop</code>', '<code>OpenFileDialog</code> + <code>Filter</code> + <code>InitialDirectory</code>', '<code>MouseMove</code> + <code>MouseLeave</code> + <code>GetPosition</code>', '<code>ScrollViewer</code> + <code>ScaleTransform</code> + <code>Slider</code>'], answer: 0,
            explain: '창에 <code>AllowDrop="True"</code> 를 켜고, <code>DragOver</code> 에서 커서 모양(<code>e.Effects</code>)을 정하고, <code>Drop</code> 에서 <code>e.Data.GetData(DataFormats.FileDrop)</code> 로 <b>경로 문자열 배열</b>을 꺼냅니다.' },
          { q: '<code>SetDisplay(Mat mat, string name)</code> 에 넘길 Mat 을 <code>using var</code> 로 만들면?', options: ['메모리가 깔끔하게 정리된다', '표시 직후 해제되어 다음 사용에서 <code>ObjectDisposedException</code> 이 난다', '아무 차이 없다', '화면이 두 번 그려진다'], answer: 1,
            explain: '<code>SetDisplay</code> 는 넘어온 Mat 을 <b>필드 <code>_display</code> 에 보관</b>합니다. 호출한 메서드가 끝날 때 <code>using</code> 이 해제해 버리면 그 뒤 픽셀 값 읽기 · 저장에서 예외가 납니다. <b>넘겨주는 Mat 에는 using 을 쓰지 않습니다.</b>' },
          { q: '[원본] 버튼에서 <code>SetDisplay(_original.Clone(), "원본")</code> 처럼 <code>Clone()</code> 을 하는 이유는?', options: ['원본을 흑백으로 바꾸기 위해', '복사가 더 빠르기 때문', '<code>_original</code> 을 그대로 넘기면 다음 <code>SetDisplay</code> 에서 <b>원본이 Dispose</b> 되기 때문', '화면 크기를 맞추기 위해'], answer: 2,
            explain: '<code>SetDisplay</code> 는 새 Mat 을 받을 때마다 <b>이전 <code>_display</code> 를 Dispose</b> 합니다. <code>_original</code> 을 그대로 넘겼다면 다음 버튼을 누르는 순간 원본이 해제되어 버립니다.' },
          { q: '한글이 들어간 경로에서 <code>Cv2.ImRead</code> 가 빈 Mat 을 돌려줄 때의 해결책은?', options: ['파일 이름을 영문으로 바꾸는 것만이 방법이다', '<code>File.ReadAllBytes</code> 로 읽어 <code>Cv2.ImDecode</code> 로 디코딩한다', '<code>ImreadModes.Unchanged</code> 를 쓴다', '<code>Cv2.ImRead</code> 를 두 번 부른다'], answer: 1,
            explain: '<b>파일 읽기는 .NET</b>(<code>File.ReadAllBytes</code>), <b>디코딩은 OpenCV</b>(<code>Cv2.ImDecode</code>)로 나누면 경로 문자 문제가 사라집니다. 저장도 <code>Cv2.ImEncode</code> → <code>File.WriteAllBytes</code> 로 같게 처리합니다.' }
        ],
        slides: [
          { layout: 'title', title: '02. WPF 기초와 이미지 표시', subtitle: '3교시 — 이미지 뷰어 앱 완성: 열기 · 필터 · 저장 · 드래그앤드롭', notes: '<p>완성 프로젝트(<code>wpf/Ch02_ImageViewer</code>)를 미리 실행해 두고 시작합니다. 드래그앤드롭으로 이미지를 던져 넣고, 마우스 휠로 확대해 픽셀 값을 보여 주면 “나도 만들고 싶다” 는 반응이 나옵니다. 오늘은 이 앱을 처음부터 훑습니다. (4분)</p>' },
          { layout: 'bullets', title: '오늘 완성할 기능 6가지', bullets: [
            '<b>열기</b> — <code>OpenFileDialog</code> · <b>드래그앤드롭</b>',
            '<b>필터</b> — 흑백 · Canny · 원본 되돌리기',
            '<b>저장</b> — <code>SaveFileDialog</code> + <code>Cv2.ImEncode</code>',
            '<b>확대/축소</b> — Slider · 마우스 휠 · 1:1 · 창에 맞춤',
            '<b>상태 표시줄</b> — 크기 · 채널 · MatType + 마우스 위치의 <b>픽셀 값</b>',
            '<b>예외 처리</b> — 어떤 오류에도 앱이 죽지 않는다'
          ], notes: '<p>여섯 가지를 칠판에 적어 두고 하나씩 지워 가며 진행하면 진도 감각이 생깁니다. 💬 “이 중에 OpenCV 지식이 필요한 것은?” — 필터와 픽셀 값뿐. 나머지는 WPF 문법이라 한 번 익히면 계속 쓴다고 안심시킵니다. (3분)</p>' },
          { layout: 'diagram', title: '뷰어의 데이터 흐름', html: FIG_VIEWER, caption: '_original(원본, 절대 안 바꿈) 과 _display(화면용, 매번 교체) 두 개를 필드로 보관', notes: '<p>오늘 가장 중요한 그림입니다. Mat 이 <b>왜 두 개</b>인지 반드시 이해시키세요: 원본이 없으면 [원본] 버튼도, 다른 필터를 다시 적용하는 것도 못 합니다. 아래 오른쪽(예외 처리) 상자는 마지막에 다시 봅니다. (5분)</p>' },
          { layout: 'code', title: 'MainWindow.xaml 의 새로운 세 가지', lang: 'xml', file: 'MainWindow.xaml', run: false, code: `<Window ... AllowDrop="True" DragOver="Window_DragOver" Drop="Window_Drop">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" /><RowDefinition Height="*" /><RowDefinition Height="Auto" />
        </Grid.RowDefinitions>

        <ToolBar Grid.Row="0">
            <Button Content="열기" Click="OpenButton_Click" />
            <Button Content="흑백" Click="GrayButton_Click" />
            <Slider x:Name="ZoomSlider" Minimum="0.1" Maximum="8" Value="1"
                    ValueChanged="ZoomSlider_ValueChanged" Width="180" />
        </ToolBar>

        <ScrollViewer x:Name="Scroller" Grid.Row="1" PreviewMouseWheel="Scroller_PreviewMouseWheel">
            <Image x:Name="MainImage" Stretch="None"
                   RenderOptions.BitmapScalingMode="NearestNeighbor"
                   MouseMove="MainImage_MouseMove" MouseLeave="MainImage_MouseLeave">
                <Image.LayoutTransform>
                    <ScaleTransform x:Name="ZoomTransform" ScaleX="1" ScaleY="1" />
                </Image.LayoutTransform>
            </Image>
        </ScrollViewer>

        <StatusBar Grid.Row="2">
            <StatusBarItem><TextBlock x:Name="InfoText" /></StatusBarItem>
            <StatusBarItem><TextBlock x:Name="PixelText" FontFamily="Consolas" /></StatusBarItem>
        </StatusBar>
    </Grid>
</Window>`, points: ['<code>AllowDrop</code> + <code>DragOver</code> + <code>Drop</code> → 드래그앤드롭', '<code>Stretch="None"</code> + <code>ScaleTransform</code> → 1픽셀 정확 표시 · 확대', '<code>MouseMove</code> → 픽셀 값, <code>StatusBar</code> → 정보 두 칸'], notes: '<p>1교시 3행 Grid 와 같은 구조임을 먼저 확인시키고, 새로 붙은 속성 세 묶음만 짚습니다. 실제 파일은 저장소에 있으니 지금 열어 함께 보면 좋습니다. <code>Consolas</code> 글꼴을 쓰는 이유(고정폭 → 숫자가 흔들리지 않음)도 한마디. (5분)</p>' },
          { layout: 'two', title: '열기: 대화상자와 드래그앤드롭', left: { title: '🗂 OpenFileDialog', run: false, code: `using Microsoft.Win32;   // 여기!

var dlg = new OpenFileDialog {
    Title = "이미지 열기",
    Filter = ImageFile.OpenFilter };
if (dlg.ShowDialog(this) == true)
    OpenFile(dlg.FileName);` }, right: { title: '🖱 드래그앤드롭', run: false, code: `// XAML: AllowDrop="True"
private void Window_Drop(
    object sender, DragEventArgs e)
{
    if (e.Data.GetData(DataFormats.FileDrop)
        is string[] files && files.Length > 0)
        OpenFile(files[0]);
}` }, notes: '<p>두 입구가 <b>같은 <code>OpenFile(path)</code></b> 로 모이는 설계가 핵심입니다 — 기능을 한 곳에만 쓰면 버그도 한 곳에서 잡힙니다. <code>Microsoft.Win32</code> 를 칠판에 적어 두세요(가장 많이 틀립니다). <code>ShowDialog</code> 가 <code>bool?</code> 라서 <code>== true</code> 로 비교하는 것도 짚습니다. (5분)</p>' },
          { layout: 'code', title: '열기의 순서가 중요하다', run: false, local: true, file: 'MainWindow.xaml.cs', code: `using System.Windows;
using Microsoft.Win32;                    // OpenFileDialog · SaveFileDialog
public partial class MainWindow : Window
{
    private Mat? _original;
    private void OpenButton_Click(object sender, RoutedEventArgs e)
    {
        var dlg = new OpenFileDialog { Filter = ImageFile.OpenFilter };
        if (dlg.ShowDialog(this) == true) OpenFile(dlg.FileName);
    }
    private void OpenFile(string path)
    {
        try
        {
            Mat loaded = ImageFile.Load(path);  // 실패하면 예외를 던진다
            _original?.Dispose();               // 성공한 뒤에 이전 것 해제!
            _original = loaded;
            SetDisplay(_original.Clone(), "원본");
        }
        catch (Exception ex) { MessageBox.Show(this, ex.Message, "열기 실패"); }
    }
}`, points: ['읽기 <b>성공 뒤에</b> 이전 원본 Dispose', '실패하면 이전 이미지가 그대로 남는다', '<code>_original.Clone()</code> 을 표시용으로 넘긴다'], notes: '💬 “<code>_original?.Dispose()</code> 를 <code>ImageFile.Load</code> 보다 먼저 쓰면 어떤 일이 생길까?” — 잘못된 파일을 열려다 실패하면 이전 이미지까지 사라진다. 실제 프로그램에서 사용자를 화나게 하는 버그라고 강조하세요. (5분)' },
          { layout: 'code', title: '브라우저: 뷰어의 처리 부분만', code: `using System;
using OpenCvSharp;

class Viewer
{
    Mat _original, _display;
    public void Open(string path)
    {
        _original?.Dispose();
        _original = Cv2.ImRead(path);
        SetDisplay(_original.Clone(), "원본");
    }
    public void Gray() => SetDisplay(_original.CvtColor(ColorConversionCodes.BGR2GRAY), "흑백");
    void SetDisplay(Mat m, string what)
    {
        _display?.Dispose();                  // 이전 표시용 Mat 해제
        _display = m;
        Console.WriteLine($"{what} | {m.Width}x{m.Height} | 채널 {m.Channels()}");
        Cv2.ImShow(what, m);                  // WPF: MainImage.Source = m.ToBitmapSource()
    }
}
class Program { static void Main() { var v = new Viewer(); v.Open("images/sample_color.png"); v.Gray(); } }`, points: ['완성 프로젝트와 <b>같은 구조</b> — 표시 줄만 다르다', '<code>SetDisplay</code> 가 교체 · 해제를 한곳에서 담당', '버튼을 100번 눌러도 메모리가 늘지 않는다'], notes: '<p>▶ 실행 후 본문 예제 1(원본 · 흑백 · Blur · Canny 네 단계)도 돌려 결과 창의 네 이미지를 보여 줍니다. 💬 “<code>_display?.Dispose()</code> 를 지우면?” — 누를수록 메모리가 쌓인다(01차시 복습). (5분)</p>' },
          { layout: 'code', title: '필터 버튼과 SetDisplay: using 을 쓰는 곳 · 안 쓰는 곳', run: false, local: true, file: 'MainWindow.xaml.cs', code: `using OpenCvSharp;
using OpenCvSharp.WpfExtensions;

public partial class MainWindow : Window
{
    private Mat? _original, _display;
    private void GrayButton_Click(object sender, RoutedEventArgs e)
    {
        if (_original == null) return;
        var gray = new Mat();                    // SetDisplay 가 보관 → using 금지!
        Cv2.CvtColor(_original, gray, ColorConversionCodes.BGR2GRAY);
        SetDisplay(gray, "흑백");
    }
    private void SetDisplay(Mat mat, string name)
    {
        _display?.Dispose();                     // 이전 표시용 Mat 해제
        _display = mat;
        MainImage.Source = _display.ToBitmapSource();
        InfoText.Text = $"{name} | {mat.Width} x {mat.Height} | 채널 {mat.Channels()}";
    }
}`, points: ['넘겨주는 Mat → <b>using 금지</b> (받는 쪽이 보관)', '중간 결과 Mat → <code>using var</code>', '[원본] 은 <code>_original.Clone()</code> 을 넘긴다', '표시 · 정보 갱신은 <code>SetDisplay</code> 한곳에서'], notes: '<p>오늘의 가장 흔한 실수입니다. 일부러 <code>using var gray</code> 로 바꿔 보게 하면 <code>ObjectDisposedException</code> 이 나므로 규칙이 오래 남습니다(01차시 “반환용 Mat” 규칙과 같은 이야기). (5분)</p>' },
          { layout: 'code', title: '픽셀 값: At&lt;T&gt;(행 y, 열 x) 와 범위 검사', code: `using System;
using OpenCvSharp;
class Program
{
    static string PixelText(Mat m, int x, int y)
    {
        if (x < 0 || y < 0 || x >= m.Width || y >= m.Height) return "(x, y) = -";
        if (m.Channels() == 3)
        {
            Vec3b px = m.At<Vec3b>(y, x);        // (행 y, 열 x) 순서!
            return $"(x={x,4}, y={y,4})  B={px.Item0,3} G={px.Item1,3} R={px.Item2,3}";
        }
        return $"(x={x,4}, y={y,4})  밝기={m.At<byte>(y, x),3}";
    }
    static void Main()
    {
        using var color = Cv2.ImRead("images/sample_color.png");
        Console.WriteLine(PixelText(color, 120, 80));    // 빨간 원 위
        Console.WriteLine(PixelText(color, 700, 80));    // 이미지 밖
        Cv2.ImShow("color", color);
    }
}`, points: ['범위 검사를 <b>가장 먼저</b> (안 하면 예외)', '3채널 <code>Vec3b</code> · 1채널 <code>byte</code>', '<code>{x,4}</code> 자리 고정 → 글자가 흔들리지 않는다'], notes: '<p>▶ 실행해 빨간 원 위에서 <code>R=207</code> 이 큰 것을 확인합니다. 실제 앱에서 마우스를 움직여 보여 주면 더 좋습니다. 💬 “<code>At&lt;Vec3b&gt;(120, 80)</code> 이라고 쓰면?” — 다른 픽셀(행 120, 열 80). (5분)</p>' },
          { layout: 'table', title: '기능 ↔ 화면 한 줄 + 코드 한 메서드', head: ['기능', 'XAML', '코드'], rows: [
            ['열기', '<code>Click="OpenButton_Click"</code>', '<code>OpenFileDialog</code> → <code>OpenFile</code>'],
            ['드래그앤드롭', '<code>AllowDrop</code> · <code>Drop</code>', '<code>DataFormats.FileDrop</code> → <code>OpenFile</code>'],
            ['필터', '<code>Click="GrayButton_Click"</code>', '<code>Cv2.CvtColor</code> → <code>SetDisplay</code>'],
            ['표시 · 정보', '<code>Image</code> · <code>InfoText</code>', '<code>ToBitmapSource()</code> · <code>InfoText.Text</code>'],
            ['픽셀 값', '<code>MouseMove</code>', '<code>At&lt;Vec3b&gt;(y, x)</code> → <code>PixelText.Text</code>'],
            ['확대', '<code>Slider</code> · <code>ScaleTransform</code>', '<code>ZoomTransform.ScaleX</code>'],
            ['저장', '<code>Click="SaveButton_Click"</code>', '<code>SaveFileDialog</code> → <code>ImageFile.Save</code>']
          ], notes: '<p>이 표가 오늘의 요약입니다. “기능 하나 = XAML 한 줄 + 메서드 하나” 라는 감각을 심어 주면 앞으로 어떤 기능도 스스로 붙일 수 있습니다. 앞으로 배우는 처리(HSV · 히스토그램 · 윤곽선)가 모두 이 자리에 들어간다고 예고하세요. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>SetDisplay(mat, name)</code> 에 넘길 Mat 을 <code>using var</code> 로 만들면?', options: ['메모리가 깔끔해진다', '표시 직후 해제되어 <code>ObjectDisposedException</code>', '차이 없다', '화면이 두 번 그려진다'], answer: 1, explain: '<code>SetDisplay</code> 가 필드 <code>_display</code> 에 보관하므로, 넘겨주는 Mat 에는 using 을 쓰지 않습니다. 중간 결과에만 씁니다.', notes: '<p>정답 2번. 01차시의 “반환용 Mat 은 받는 쪽이 Dispose” 규칙과 같은 이야기임을 연결해 주세요.</p>' },
          { layout: 'practice', title: '실습: Viewer 에 [Blur] 추가', desc: '<p><code>Blur()</code> 를 만들어 <code>GaussianBlur(9x9)</code> 결과를 <code>"Blur 9x9"</code> 이름으로 표시하고 <code>Main</code> 에서 호출하세요. <b>넘기는 Mat 에 using 금지!</b></p>', starter: `using System;
using OpenCvSharp;

class Viewer
{
    Mat _original, _display;
    public void Open(string p)
    {
        _original?.Dispose();
        _original = Cv2.ImRead(p);
        SetDisplay(_original.Clone(), "원본");
    }
    // TODO: GaussianBlur(9x9) 결과를 "Blur 9x9" 로 표시하는 Blur() 를 만드세요
    void SetDisplay(Mat m, string what)
    {
        _display?.Dispose();
        _display = m;
        Console.WriteLine($"{what} | {m.Width}x{m.Height} | 채널 {m.Channels()}");
    }
}
class Program { static void Main() { var v = new Viewer(); v.Open("images/sample_color.png"); } }`, solution: `using System;
using OpenCvSharp;

class Viewer
{
    Mat _original, _display;
    public void Open(string p)
    {
        _original?.Dispose();
        _original = Cv2.ImRead(p);
        SetDisplay(_original.Clone(), "원본");
    }
    public void Blur()
    {
        var blur = new Mat();
        Cv2.GaussianBlur(_original, blur, new Size(9, 9), 0);
        SetDisplay(blur, "Blur 9x9");
    }
    void SetDisplay(Mat m, string what)
    {
        _display?.Dispose();
        _display = m;
        Console.WriteLine($"{what} | {m.Width}x{m.Height} | 채널 {m.Channels()}");
    }
}
class Program { static void Main() { var v = new Viewer(); v.Open("images/sample_color.png"); v.Blur(); } }`, notes: '<p>본문 실습 1 의 축약판입니다. 정답 출력: <code>원본 | 640x480 | 채널 3</code> 과 <code>Blur 9x9 | 640x480 | 채널 3</code>. 다 한 학생은 실제 WPF 프로젝트에 [Blur] 버튼을 XAML 부터 추가해 보게 하세요(과제). (8분)</p>' },
          { layout: 'summary', title: '정리 — 02차시 전체', bullets: ['XAML 로 화면(Grid · Button · Image · StatusBar), 코드 비하인드에 <b>이벤트 핸들러</b> — 둘은 하나의 <code>partial</code> 클래스', 'Mat → 화면: <b><code>MainImage.Source = mat.ToBitmapSource()</code></b> (<code>OpenCvSharp4.WpfExtensions</code>)', 'Mat 두 개를 필드로: <b>_original</b>(그대로 보관) · <b>_display</b>(교체할 때 이전 것 Dispose)', '<b>넘겨주는 Mat 에는 using 금지</b>, 중간 결과에는 <code>using var</code>', '파일 대화상자 = <code>Microsoft.Win32</code>, 드래그앤드롭 = <code>AllowDrop</code> + <code>Drop</code> + <code>DataFormats.FileDrop</code>', '한글 경로는 <code>File.ReadAllBytes</code> + <code>Cv2.ImDecode</code> / <code>Cv2.ImEncode</code> + <code>File.WriteAllBytes</code>', '핸들러마다 <code>try/catch</code> → <code>MessageBox</code>, 창 닫을 때 <code>OnClosed</code> 에서 Mat 정리', '다음 차시: Mat 과 픽셀 — 이미지 자료 구조를 속부터 파헤칩니다'], notes: '<p>여덟 줄을 학생이 나눠 읽습니다. 과제: <code>wpf/Ch02_ImageViewer</code> 를 내려받아 [Blur] 버튼을 추가하고 저장까지 확인해 오기. 다음 차시(03) 부터는 다시 브라우저에서 OpenCV 자체를 깊게 다루며, 배운 것을 이 뷰어에 계속 붙인다고 안내합니다. (3분)</p>' }
        ]
      }
    ]
  });
})();
