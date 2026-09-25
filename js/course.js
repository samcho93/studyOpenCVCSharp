/* C# · WPF 로 배우는 OpenCV 강좌 커리큘럼
 * 각 차시의 상세 내용은 lessons/<id>.js 에서 CS_COURSE.addChapter({...}) 로 등록한다.
 * hours: 교시 수 (1교시 = 50분)
 */
window.CS_COURSE = {
  title: 'C# WPF 로 배우는 OpenCV (OpenCvSharp)',
  short: 'OpenCV · C#',
  teacherPass: 'cv2026',   // 교사용 화면 비밀번호 (바꿔서 쓰세요)
  subtitle: 'Visual Studio · .NET 8 · WPF · OpenCvSharp4',
  github: { user: 'samcho93', repo: 'studyOpenCVCSharp', branch: 'main' },
  parts: [
    { id: 1, title: 'Part 1. 준비: 개발 환경과 WPF', desc: 'Visual Studio · NuGet 패키지 · WPF 화면에 이미지 띄우기' },
    { id: 2, title: 'Part 2. OpenCV 기초', desc: 'Mat · 픽셀 · 색 공간 · 밝기와 히스토그램 · 이진화 · 필터 · 모폴로지 · 에지 · 기하 변환' },
    { id: 3, title: 'Part 3. 분석과 검출', desc: '윤곽선 · 도형 분석 · 허프 변환 · 템플릿 매칭 · 특징점 · 동영상과 카메라' },
    { id: 4, title: 'Part 4. WPF 응용 프로젝트', desc: '이미지 처리 스튜디오 · 실전 검사 프로젝트' }
  ],
  order: [
    { id: 'cs00', no: '00', part: 1, hours: 1, title: '시작하기: 강좌 안내와 실습 환경', icon: '🧭' },
    { id: 'cs01', no: '01', part: 1, hours: 2, title: 'Visual Studio · NuGet 으로 OpenCvSharp 설치하기', icon: '📦' },
    { id: 'cs02', no: '02', part: 1, hours: 3, title: 'WPF 기초와 이미지 표시 (Mat ↔ BitmapSource)', icon: '🪟' },
    { id: 'cs03', no: '03', part: 2, hours: 3, title: 'Mat 과 픽셀: 이미지 자료 구조', icon: '🧱' },
    { id: 'cs04', no: '04', part: 2, hours: 2, title: '그리기와 텍스트', icon: '✏️' },
    { id: 'cs05', no: '05', part: 2, hours: 2, title: '색 공간: BGR · Gray · HSV · 채널', icon: '🎨' },
    { id: 'cs06', no: '06', part: 2, hours: 2, title: '밝기 · 대비 · 히스토그램', icon: '📊' },
    { id: 'cs07', no: '07', part: 2, hours: 2, title: '이진화 (Threshold)', icon: '⚫' },
    { id: 'cs08', no: '08', part: 2, hours: 2, title: '필터링: 블러 · 샤프닝 · 잡음 제거', icon: '🧽' },
    { id: 'cs09', no: '09', part: 2, hours: 2, title: '모폴로지 연산', icon: '🔲' },
    { id: 'cs10', no: '10', part: 2, hours: 2, title: '에지 검출: Sobel · Laplacian · Canny', icon: '📐' },
    { id: 'cs11', no: '11', part: 2, hours: 2, title: '기하 변환: 크기 · 회전 · 어파인 · 원근', icon: '🔄' },
    { id: 'cs12', no: '12', part: 3, hours: 3, title: '윤곽선과 도형 분석', icon: '🔷' },
    { id: 'cs13', no: '13', part: 3, hours: 2, title: '허프 변환: 직선과 원 검출', icon: '⭕' },
    { id: 'cs14', no: '14', part: 3, hours: 2, title: '템플릿 매칭과 특징점 (ORB)', icon: '🎯' },
    { id: 'cs15', no: '15', part: 3, hours: 2, title: '동영상과 카메라: VideoCapture', icon: '🎥' },
    { id: 'cs16', no: '16', part: 4, hours: 3, title: 'WPF 이미지 처리 스튜디오 만들기', icon: '🛠️' },
    { id: 'cs17', no: '17', part: 4, hours: 3, title: '실전 검사 프로젝트: 개수 세기 · 색 분류 · 결함 검사', icon: '🚀' }
  ],
  chapters: {},
  addChapter: function (ch) { this.chapters[ch.id] = ch; }
};
