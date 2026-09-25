# studyOpenCVCSharp — C# WPF 로 배우는 OpenCV 웹 강좌

GitHub Pages 정적 사이트 (`index.html` 하나 + `lessons/*.js`). 서버 없이 동작하며, C# 코드는 브라우저 안의 **C# 인터프리터**(`js/cs-*.js`)가 OpenCV.js 위에서 실행한다.

## 구조
- `js/course.js` 커리큘럼(차시 목록 · 교시 수) → `lessons/csNN.js` 가 `CS_COURSE.addChapter()` 로 내용 등록
- `js/app.js` 학생용 문서 UI · `js/slides.js` 교사용 슬라이드 · `js/annotate.js` 판서 · `js/runner.js` 결과 창 · `js/cs-engine.js` + `js/cs-worker.js` 실행 엔진
- `js/cs-lang.js`(파서) · `cs-runtime.js`(평가기) · `cs-stdlib.js`(System) · `cs-opencv.js` + `cs-opencv2.js`(OpenCvSharp API) · `cs-host.js`(PNG · 가상 폴더 · 카메라 시뮬레이션)
- `assets/images` 예제 이미지(정답은 `assets/IMAGES.md`), `wpf/` Visual Studio 프로젝트, `tools/` 테스트 · 검증 도구

## 차시 작성 · 검증
- 반드시 `docs/LESSON_GUIDE.md` 와 `lessons/cs00.js` 를 먼저 읽는다.
- `node tools/validate.mjs cs07` (오류 0 이 되어야 함), `--print` 로 실제 출력 확인 후 `expect` 작성.
- 인터프리터 · 바인딩 회귀 테스트: `node tools/cstest.mjs`, `node tools/cvtest.mjs`.
- 로컬 확인: `python server/serve.py --port 8086` → http://localhost:8086 (또는 `start.bat`).

## 규칙
- 커밋 메시지 · UI 문구는 한국어. 커밋은 작업 단위마다 자주, `main` 에 바로 푸시 (GitHub Pages: samcho93.github.io/studyOpenCVCSharp).
- 코드 문자열 안에 `${` · 백틱 금지 (JS 템플릿 문자열). WPF 코드는 `run: false, local: true`.
