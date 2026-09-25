# C# WPF 로 배우는 OpenCV (OpenCvSharp4) — 웹 실습 강좌

🌐 **https://samcho93.github.io/studyOpenCVCSharp/** (학생용: `student.html`, 교사용: `teacher.html`)

Visual Studio 에서 **NuGet 으로 OpenCvSharp4 를 설치**하는 것부터 Mat · 색 공간 · 이진화 · 필터 · 모폴로지 · 에지 · 기하 변환 · 윤곽선 · 허프 변환 · 템플릿 매칭 · 카메라까지 익히고, 마지막에 **WPF 이미지 처리 앱**과 **검사 프로젝트**를 완성하는 18차시 강좌입니다.

## 특징
- **브라우저에서 C# OpenCvSharp 코드를 바로 실행**: 이 저장소에 들어 있는 C# 인터프리터(`js/cs-*.js`)가 OpenCvSharp4 와 같은 이름의 API(`Mat`, `Cv2.*`, `Scalar`, `Point` …)를 OpenCV.js 4.13(WebAssembly) 위에서 실행합니다. 설치 없이 예제를 수정 · 실행하고, `Cv2.ImShow` 결과를 이미지 창(좌표 · 픽셀 값 · 확대)으로 봅니다.
- **학생용 / 교사용** 두 화면: 학생용은 문서(개념 · 그림 · 예제 · 실습 · 퀴즈), 교사용은 16:9 PPT 슬라이드 + 교사 노트 + 판서(펜 · 형광펜 · 지우개 · 지시봉) + 수업 타이머 + 발표자 창(두 번째 모니터).
- **WPF 프로젝트**: 화면(XAML) 코드는 브라우저에서 실행하지 않고 `wpf/` 폴더의 Visual Studio 프로젝트로 제공합니다 (시작 템플릿 · 이미지 뷰어 · 카메라 · 이미지 처리 스튜디오 · 검사 앱).
- 예제 이미지 64장(합성 산업 이미지, `assets/images`, 정답은 `assets/IMAGES.md`).

## 로컬에서 열기
```bash
start.bat            # Windows: python 로컬 서버 → http://localhost:8080/student.html
python server/serve.py --lan   # 같은 네트워크의 학생 PC 가 교사 PC 로 접속
```
파일을 직접(`file://`) 열면 워커 · OpenCV 를 불러올 수 없습니다. GitHub Pages 주소로 열면 서버가 필요 없습니다.

## 폴더 구조
| 경로 | 내용 |
|---|---|
| `index.html` · `js/app.js` · `js/slides.js` · `js/annotate.js` | 화면 · 문서 · 슬라이드 · 판서 |
| `js/course.js` · `lessons/csNN.js` | 커리큘럼과 차시 내용 (`CS_COURSE.addChapter`) |
| `js/cs-lang.js` · `cs-runtime.js` · `cs-stdlib.js` | C# 파서 · 평가기 · System 라이브러리 |
| `js/cs-opencv.js` · `cs-opencv2.js` | OpenCvSharp API 바인딩 (Mat · Cv2 · 형식 · 열거형) |
| `js/cs-engine.js` · `cs-worker.js` · `cs-host.js` | 워커 실행 엔진 · PNG 코덱 · 가상 작업 폴더 · 카메라 시뮬레이션 |
| `runtime/opencv.js` | OpenCV.js 4.13 |
| `wpf/` | Visual Studio 2022 WPF 예제 프로젝트 (.NET 8) |
| `tools/` | 인터프리터 테스트(`cstest.mjs` · `cvtest.mjs`), 차시 검증(`validate.mjs`) |
| `docs/LESSON_GUIDE.md` | 차시 작성 가이드 |

## 차시 검증
```bash
node tools/validate.mjs           # 모든 차시: 스키마 + 모든 C# 예제 실행 + expect 비교
node tools/validate.mjs cs07 --print
```

## 교사용 화면
왼쪽 위 **🧑‍🏫 교사용** 버튼 → 비밀번호(`js/course.js` 의 `teacherPass`, 기본값 `cv2026`). 단축키: `F` 전체 화면, `←/→` 이동, `G` 목록, `N` 노트, `T` 타이머, `B` 검은 화면, `R` 결과 패널, `Ctrl+Z` 판서 되돌리기.

## 라이선스 · 출처
- OpenCV.js: Apache 2.0 (https://opencv.org). OpenCvSharp: Apache 2.0 (https://github.com/shimat/opencvsharp).
- 예제 이미지는 numpy + OpenCV 로 만든 합성 영상입니다.
