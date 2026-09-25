/* 14차시 템플릿 매칭과 특징점 (ORB) */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 템플릿 슬라이딩 + 유사도 맵
  const FIG_SLIDE = `<svg viewBox="0 0 740 330" role="img" aria-label="템플릿을 영상 위에서 한 칸씩 옮기며 유사도를 계산해 유사도 맵을 만드는 그림">
  ${ARROW('c14a1')}
  <text x="150" y="24" text-anchor="middle" class="tx-b">① 원본 영상 W × H</text>
  <rect x="30" y="34" width="240" height="180" rx="6" class="card-bg"/>
  <rect x="62" y="58" width="60" height="60" rx="4" class="p1s"/>
  <rect x="62" y="58" width="60" height="60" rx="4" class="s1" stroke-width="2.5"/>
  <text x="92" y="94" text-anchor="middle" class="tx-b">w × h</text>
  <line x1="122" y1="70" x2="182" y2="70" class="ln" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#c14a1)"/>
  <rect x="182" y="58" width="60" height="60" rx="4" class="s1" stroke-width="1.5" stroke-dasharray="4 3"/>
  <line x1="92" y1="118" x2="92" y2="178" class="ln" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#c14a1)"/>
  <rect x="62" y="148" width="60" height="60" rx="4" class="s1" stroke-width="1.5" stroke-dasharray="4 3"/>
  <circle cx="212" cy="180" r="16" class="p3"/>
  <circle cx="98" cy="90" r="12" class="p2"/>
  <text x="150" y="232" text-anchor="middle" class="tx-m">템플릿을 <tspan class="tx-b">1픽셀씩</tspan> 옮기며 겹친 부분을 비교</text>
  <text x="150" y="252" text-anchor="middle" class="tx-m">옮길 수 있는 위치 = (W−w+1) × (H−h+1)</text>
  <text x="470" y="24" text-anchor="middle" class="tx-b">② 유사도 맵 (결과 Mat, CV_32FC1)</text>
  <rect x="350" y="34" width="240" height="180" rx="6" class="card-bg"/>
  <rect x="350" y="34" width="240" height="180" rx="6" class="p4s"/>
  <circle cx="392" cy="70" r="22" class="p5"/>
  <circle cx="392" cy="70" r="9" class="p1"/>
  <text x="418" y="64" class="tx-b">최대 = 찾은 위치</text>
  <text x="418" y="82" class="tx-m">MinMaxLoc → maxLoc</text>
  <circle cx="500" cy="160" r="12" class="p5"/>
  <text x="520" y="164" class="tx-m">약한 봉우리 (닮은 곳)</text>
  <text x="470" y="232" text-anchor="middle" class="tx-m">한 칸의 값 = 그 위치에서의 <tspan class="tx-b">유사도 점수</tspan></text>
  <text x="470" y="252" text-anchor="middle" class="tx-m">크기가 원본보다 w−1, h−1 만큼 작다</text>
  <rect x="620" y="34" width="100" height="180" rx="6" class="p2s"/>
  <text x="670" y="60" text-anchor="middle" class="tx-b">③ 결과</text>
  <text x="670" y="86" text-anchor="middle" class="tx-m">maxLoc =</text>
  <text x="670" y="104" text-anchor="middle" class="tx-m">사각형의</text>
  <text x="670" y="122" text-anchor="middle" class="tx-m">왼쪽 위</text>
  <text x="670" y="150" text-anchor="middle" class="tx-m">중심 =</text>
  <text x="670" y="168" text-anchor="middle" class="tx-m">maxLoc +</text>
  <text x="670" y="186" text-anchor="middle" class="tx-m">(w/2, h/2)</text>
  <text x="30" y="290" class="tx-m">⚠️ maxLoc 은 <tspan class="tx-b">템플릿의 왼쪽 위 모서리</tspan> 위치입니다. 부품 중심을 원하면 템플릿 안에서의 기준점 좌표를 더해 주세요.</text>
  <text x="30" y="314" class="tx-m">⚠️ SqDiff 계열은 <tspan class="tx-b">작을수록</tspan> 비슷하므로 maxLoc 이 아니라 <tspan class="tx-b">minLoc</tspan> 을 씁니다.</text>
</svg>`;

  // 그림 2: 특징점과 기술자
  const FIG_KP = `<svg viewBox="0 0 740 340" role="img" aria-label="특징점 검출과 이진 기술자 생성, 해밍 거리로 매칭하는 과정">
  ${ARROW('c14b1')}
  <text x="120" y="24" text-anchor="middle" class="tx-b">① 특징점(keypoint) 찾기</text>
  <rect x="20" y="34" width="200" height="160" rx="6" class="card-bg"/>
  <path d="M 60 60 L 160 60 L 160 100 L 110 100 L 110 170 L 60 170 Z" class="p1s"/>
  <path d="M 60 60 L 160 60 L 160 100 L 110 100 L 110 170 L 60 170 Z" class="s1" stroke-width="2"/>
  <circle cx="60" cy="60" r="7" class="s2" stroke-width="2.5"/>
  <circle cx="160" cy="60" r="7" class="s2" stroke-width="2.5"/>
  <circle cx="160" cy="100" r="7" class="s2" stroke-width="2.5"/>
  <circle cx="110" cy="100" r="7" class="s2" stroke-width="2.5"/>
  <circle cx="110" cy="170" r="7" class="s2" stroke-width="2.5"/>
  <circle cx="60" cy="170" r="7" class="s2" stroke-width="2.5"/>
  <text x="120" y="212" text-anchor="middle" class="tx-m">밝기가 확 꺾이는 곳 = <tspan class="tx-b">코너</tspan></text>
  <text x="120" y="230" text-anchor="middle" class="tx-m">(FAST) — 평평한 면·직선 중간은 안 잡힌다</text>
  <line x1="228" y1="114" x2="268" y2="114" class="ln" stroke-width="2" marker-end="url(#c14b1)"/>
  <text x="380" y="24" text-anchor="middle" class="tx-b">② 기술자(descriptor) 만들기</text>
  <rect x="280" y="34" width="200" height="160" rx="6" class="card-bg"/>
  <circle cx="380" cy="112" r="56" class="s2" stroke-width="2"/>
  <circle cx="380" cy="112" r="5" class="p2"/>
  <line x1="380" y1="112" x2="424" y2="78" class="s3" stroke-width="2.5" marker-end="url(#c14b1)"/>
  <text x="428" y="74" class="tx-m">방향</text>
  <line x1="352" y1="90" x2="404" y2="104" class="ln" stroke-width="1.2"/>
  <line x1="360" y1="134" x2="402" y2="122" class="ln" stroke-width="1.2"/>
  <line x1="344" y1="118" x2="390" y2="146" class="ln" stroke-width="1.2"/>
  <text x="380" y="212" text-anchor="middle" class="tx-m">주위 픽셀 쌍을 256번 비교 (밝다/어둡다)</text>
  <text x="380" y="230" text-anchor="middle" class="tx-m">→ <tspan class="tx-b">256비트 = 32바이트</tspan> (BRIEF)</text>
  <line x1="488" y1="114" x2="528" y2="114" class="ln" stroke-width="2" marker-end="url(#c14b1)"/>
  <text x="630" y="24" text-anchor="middle" class="tx-b">③ 해밍 거리로 매칭</text>
  <rect x="540" y="34" width="180" height="160" rx="6" class="card-bg"/>
  <text x="630" y="64" text-anchor="middle" class="tx">A: 1011<tspan class="tx-b">0</tspan>110 …</text>
  <text x="630" y="88" text-anchor="middle" class="tx">B: 1011<tspan class="tx-b">1</tspan>110 …</text>
  <line x1="560" y1="100" x2="700" y2="100" class="ln"/>
  <text x="630" y="124" text-anchor="middle" class="tx-b">다른 비트 수 = 거리</text>
  <text x="630" y="148" text-anchor="middle" class="tx-m">0 = 완전히 같음</text>
  <text x="630" y="168" text-anchor="middle" class="tx-m">작을수록 좋은 매칭</text>
  <text x="630" y="212" text-anchor="middle" class="tx-m"><tspan class="tx-b">NormTypes.Hamming</tspan></text>
  <text x="20" y="272" class="tx-m">특징점은 <tspan class="tx-b">회전 · 크기 · 밝기</tspan>가 바뀌어도 같은 기술자가 나오도록 설계되어 있습니다 —</text>
  <text x="20" y="292" class="tx-m">ORB 는 ① FAST 코너 + ② 방향 계산 + ③ 회전 보정한 BRIEF 기술자 (Oriented FAST and Rotated BRIEF).</text>
  <text x="20" y="318" class="tx-m">그래서 템플릿 매칭이 못 하는 <tspan class="tx-b">회전 · 크기 변화 · 부분 가림</tspan>을 견딜 수 있습니다.</text>
</svg>`;

  const EX_TM = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var board = Cv2.ImRead("images/fiducial_board.png", ImreadModes.Grayscale);
        using var tmpl = Cv2.ImRead("images/fiducial_template.png", ImreadModes.Grayscale);
        Console.WriteLine($"기판 {board.Width}x{board.Height}, 템플릿 {tmpl.Width}x{tmpl.Height}");

        using var res = new Mat();
        Cv2.MatchTemplate(board, tmpl, res, TemplateMatchModes.CCoeffNormed);
        Console.WriteLine($"유사도 맵: {res.Width} x {res.Height} ({res.Type()})");
        Console.WriteLine($"= (640-64+1) x (480-64+1) = {board.Width - tmpl.Width + 1} x {board.Height - tmpl.Height + 1}");

        Cv2.MinMaxLoc(res, out double minVal, out double maxVal, out Point minLoc, out Point maxLoc);
        Console.WriteLine($"최대 점수 {maxVal:F3} @ 좌상단 ({maxLoc.X},{maxLoc.Y})");
        Console.WriteLine($"최소 점수 {minVal:F3} @ ({minLoc.X},{minLoc.Y})");
        Console.WriteLine($"피듀셜 중심 = 좌상단 + 템플릿 중심 = ({maxLoc.X + 32},{maxLoc.Y + 32})  (정답 64,56)");

        using var canvas = new Mat();
        Cv2.CvtColor(board, canvas, ColorConversionCodes.GRAY2BGR);
        Cv2.Rectangle(canvas, new Rect(maxLoc.X, maxLoc.Y, tmpl.Width, tmpl.Height), new Scalar(0, 0, 255), 2);
        Cv2.DrawMarker(canvas, new Point(maxLoc.X + 32, maxLoc.Y + 32), new Scalar(0, 255, 0), MarkerTypes.Cross, 20, 2);

        // 유사도 맵을 눈으로 보려면 0~255 로 정규화해 8비트로 바꿔 준다
        using var vis = new Mat();
        Cv2.Normalize(res, vis, 0, 255, NormTypes.MinMax);
        using var vis8 = new Mat();
        vis.ConvertTo(vis8, MatType.CV_8UC1);
        Cv2.ImShow("similarity map", vis8);
        Cv2.ImShow("found", canvas);
        Cv2.WaitKey(0);
    }
}`;

  const EX_MODES = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var board = Cv2.ImRead("images/fiducial_board.png", ImreadModes.Grayscale);
        using var tmpl = Cv2.ImRead("images/fiducial_template.png", ImreadModes.Grayscale);

        TemplateMatchModes[] modes = {
            TemplateMatchModes.SqDiff, TemplateMatchModes.SqDiffNormed,
            TemplateMatchModes.CCorr, TemplateMatchModes.CCorrNormed,
            TemplateMatchModes.CCoeff, TemplateMatchModes.CCoeffNormed
        };
        Console.WriteLine("모드              최소값 위치      최대값 위치     찾는 쪽");
        foreach (var m in modes)
        {
            using var r = new Mat();
            Cv2.MatchTemplate(board, tmpl, r, m);
            Cv2.MinMaxLoc(r, out double mn, out double mx, out Point pn, out Point px);
            bool useMin = m == TemplateMatchModes.SqDiff || m == TemplateMatchModes.SqDiffNormed;
            Console.WriteLine($"{m,-14} ({pn.X,3},{pn.Y,3})       ({px.X,3},{px.Y,3})      {(useMin ? "최소(MinLoc)" : "최대(MaxLoc)")}");
        }
        Console.WriteLine("정답 피듀셜 F1 좌상단 = (32,24)");
    }
}`;

  const EX_MULTI = `using System;
using System.Collections.Generic;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var board = Cv2.ImRead("images/fiducial_board.png", ImreadModes.Grayscale);
        using var tmpl = Cv2.ImRead("images/fiducial_template.png", ImreadModes.Grayscale);
        using var res = new Mat();
        Cv2.MatchTemplate(board, tmpl, res, TemplateMatchModes.CCoeffNormed);

        var found = FindPeaks(res, 0.95, 32);
        Console.WriteLine($"임계값 0.95 → 피듀셜 {found.Count}개");
        foreach (var p in found.OrderBy(p => p.Y))
            Console.WriteLine($"  좌상단 ({p.X},{p.Y}) 점수 {res.At<float>(p.Y, p.X):F3} → 중심 ({p.X + 32},{p.Y + 32})");

        var loose = FindPeaks(res, 0.85, 32);
        Console.WriteLine($"임계값 0.85 → {loose.Count}개 (방해 패드까지 섞인다)");
        foreach (var p in loose.OrderByDescending(p => res.At<float>(p.Y, p.X)))
            Console.WriteLine($"  ({p.X + 32},{p.Y + 32}) 점수 {res.At<float>(p.Y, p.X):F3}");

        using var canvas = new Mat();
        Cv2.CvtColor(board, canvas, ColorConversionCodes.GRAY2BGR);
        foreach (var p in found)
            Cv2.Rectangle(canvas, new Rect(p.X, p.Y, 64, 64), new Scalar(0, 0, 255), 2);
        Cv2.ImShow("fiducials", canvas);
        Cv2.WaitKey(0);
    }

    // 임계값 이상 픽셀을 점수 순으로 보며, 이미 뽑은 것과 minGap 안쪽이면 버린다 (간단 NMS)
    static List<Point> FindPeaks(Mat score, double thresh, int minGap)
    {
        using var mask = new Mat();
        Cv2.Threshold(score, mask, thresh, 255, ThresholdTypes.Binary);
        using var mask8 = new Mat();
        mask.ConvertTo(mask8, MatType.CV_8UC1);
        var cand = Cv2.FindNonZero(mask8).OrderByDescending(p => score.At<float>(p.Y, p.X)).ToList();
        var keep = new List<Point>();
        foreach (var p in cand)
            if (!keep.Any(k => Math.Abs(k.X - p.X) < minGap && Math.Abs(k.Y - p.Y) < minGap))
                keep.Add(p);
        return keep;
    }
}`;

  const EX_OCR = `using System;
using System.Text;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var disp = Cv2.ImRead("images/seven_segment.png", ImreadModes.Grayscale);
        using var tpl = Cv2.ImRead("images/digits_templates.png", ImreadModes.Grayscale);
        Console.WriteLine($"표시기 {disp.Width}x{disp.Height}, 숫자 템플릿 띠 {tpl.Width}x{tpl.Height}");

        var sb = new StringBuilder();
        for (int i = 0; i < 8; i++)
        {
            // 자리 i 의 셀 = (64 + 64*i, 60, 64, 120)
            using var cell = new Mat(disp, new Rect(64 + 64 * i, 60, 64, 120));
            int best = -1;
            double bestScore = -2;
            for (int d = 0; d <= 9; d++)
            {
                using var t = new Mat(tpl, new Rect(64 * d, 0, 64, 120));   // 숫자 d 의 셀
                using var r = new Mat();
                Cv2.MatchTemplate(cell, t, r, TemplateMatchModes.CCoeffNormed);
                Cv2.MinMaxLoc(r, out double mn, out double mx);
                if (mx > bestScore) { bestScore = mx; best = d; }
            }
            sb.Append(best);
            Console.WriteLine($"  {i}번째 자리 = {best} (점수 {bestScore:F3})");
        }
        Console.WriteLine($"판독 결과: {sb}  (정답 20480735)");
    }
}`;

  const EX_LIMIT = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var tmpl = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        using var res = new Mat();
        Cv2.MatchTemplate(scene, tmpl, res, TemplateMatchModes.CCoeffNormed);
        Cv2.MinMaxLoc(res, out double mn, out double mx, out Point pn, out Point px);
        Console.WriteLine($"최고 점수 {mx:F3} @ ({px.X},{px.Y}) → 기준점 ({px.X + 60},{px.Y + 50})");

        // 부품 6개의 기준점 위치(정답)와 회전각 — 그 자리의 점수를 들여다본다
        int[] bx = { 120, 330, 520, 150, 360, 540 };
        int[] by = { 110, 100, 120, 340, 330, 360 };
        int[] deg = { 0, 30, -45, 90, 160, -120 };
        Console.WriteLine("부품   회전각   그 자리의 최고 점수");
        for (int i = 0; i < 6; i++)
        {
            float best = -2;
            for (int dy = -6; dy <= 6; dy++)
                for (int dx = -6; dx <= 6; dx++)
                {
                    int x = bx[i] - 60 + dx, y = by[i] - 50 + dy;
                    if (x < 0 || y < 0 || x >= res.Width || y >= res.Height) continue;
                    if (res.At<float>(y, x) > best) best = res.At<float>(y, x);
                }
            Console.WriteLine($"  #{i + 1}   {deg[i],4}도      {best:F3}");
        }
        Console.WriteLine("→ 0도 부품만 찾고, 30도만 돌아가도 0.53 으로 떨어진다");
    }
}`;

  const EX_ORB = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var orb = ORB.Create(500);          // 최대 특징점 개수
        using var desc = new Mat();
        orb.DetectAndCompute(scene, null, out KeyPoint[] kps, desc);

        Console.WriteLine($"특징점 {kps.Length}개");
        Console.WriteLine($"기술자(descriptor) Mat: {desc.Rows} x {desc.Cols} ({desc.Type()})");
        Console.WriteLine("→ 특징점 1개 = 32바이트 = 256비트 이진 기술자");

        Console.WriteLine("response(코너 강도) 상위 5개:");
        foreach (var k in kps.OrderByDescending(k => k.Response).Take(5))
            Console.WriteLine($"  ({k.Pt.X,5:F0},{k.Pt.Y,5:F0}) size {k.Size,4:F0} angle {k.Angle,6:F1} octave {k.Octave}");

        using var vis = new Mat();
        Cv2.DrawKeypoints(scene, kps, vis, null, DrawMatchesFlags.DrawRichKeypoints);
        Cv2.ImShow("keypoints", vis);
        Cv2.WaitKey(0);
    }
}`;

  const EX_MATCH = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        // 템플릿이 작으면 ORB 가 테두리 근처 특징점을 버린다 → 여백을 32px 붙인다
        using var tmpl = new Mat();
        Cv2.CopyMakeBorder(t0, tmpl, 32, 32, 32, 32, BorderTypes.Replicate);

        using var orb = ORB.Create(1000);
        using var dT = new Mat();
        using var dS = new Mat();
        orb.DetectAndCompute(tmpl, null, out KeyPoint[] kT, dT);
        orb.DetectAndCompute(scene, null, out KeyPoint[] kS, dS);
        Console.WriteLine($"템플릿 특징점 {kT.Length}개 / 장면 특징점 {kS.Length}개");

        // 이진 기술자 → 해밍 거리. crossCheck: 서로가 서로의 1등일 때만 매칭으로 인정
        using var bf = new BFMatcher(NormTypes.Hamming, crossCheck: true);
        DMatch[] matches = bf.Match(dT, dS);
        Console.WriteLine($"crossCheck 매칭 {matches.Length}개");

        var good = matches.OrderBy(m => m.Distance).Take(20).ToArray();
        Console.WriteLine($"거리 정렬 상위 20개: {good[0].Distance:F0} ~ {good[19].Distance:F0} (해밍 거리 = 다른 비트 수)");
        foreach (var m in good.Take(5))
            Console.WriteLine($"  템플릿 kp{m.QueryIdx,3} → 장면 kp{m.TrainIdx,3}  거리 {m.Distance,3:F0}  장면 위치 ({kS[m.TrainIdx].Pt.X:F0},{kS[m.TrainIdx].Pt.Y:F0})");

        using var drawn = new Mat();
        Cv2.DrawMatches(tmpl, kT, scene, kS, good, drawn);
        Cv2.ImShow("matches", drawn);
        Cv2.WaitKey(0);
    }
}`;

  const EX_HOMO = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        using var tmpl = new Mat();
        Cv2.CopyMakeBorder(t0, tmpl, 32, 32, 32, 32, BorderTypes.Replicate);

        using var orb = ORB.Create(1000);
        using var dT = new Mat();
        using var dS = new Mat();
        orb.DetectAndCompute(tmpl, null, out KeyPoint[] kT, dT);
        orb.DetectAndCompute(scene, null, out KeyPoint[] kS, dS);
        using var bf = new BFMatcher(NormTypes.Hamming, crossCheck: true);
        var good = bf.Match(dT, dS).OrderBy(m => m.Distance).Take(20).ToArray();

        // 매칭된 점 쌍 → 3x3 호모그래피. RANSAC 이 엉뚱한 쌍(이상치)을 걸러 준다
        Point2f[] src = good.Select(m => kT[m.QueryIdx].Pt).ToArray();
        Point2f[] dst = good.Select(m => kS[m.TrainIdx].Pt).ToArray();
        using var mask = new Mat();
        using var H = Cv2.FindHomography(src, dst, HomographyMethods.Ransac, 3, mask);
        Console.WriteLine($"호모그래피 H: {H.Rows}x{H.Cols}, RANSAC 인라이어 {Cv2.CountNonZero(mask)} / {good.Length}");

        // 여백을 뺀 원본 템플릿의 네 모서리 (32,32)-(152,132) 를 장면으로 투영
        Point2f[] corners = { new Point2f(32, 32), new Point2f(152, 32), new Point2f(152, 132), new Point2f(32, 132) };
        Point2f[] proj = Cv2.PerspectiveTransform(corners, H);
        Console.WriteLine("투영된 네 모서리:");
        foreach (var p in proj) Console.WriteLine($"  ({p.X,6:F1},{p.Y,6:F1})");

        Point2f refPt = Cv2.PerspectiveTransform(new Point2f[] { new Point2f(92, 82) }, H)[0];
        Console.WriteLine($"기준점(템플릿 60,50) 투영 = ({refPt.X:F1},{refPt.Y:F1})  (정답 120,110)");

        using var canvas = new Mat();
        Cv2.CvtColor(scene, canvas, ColorConversionCodes.GRAY2BGR);
        var poly = proj.Select(p => new Point((int)p.X, (int)p.Y)).ToArray();
        Cv2.Polylines(canvas, new Point[][] { poly }, true, new Scalar(0, 0, 255), 2);
        Cv2.DrawMarker(canvas, new Point((int)refPt.X, (int)refPt.Y), new Scalar(0, 255, 0), MarkerTypes.Cross, 24, 2);
        Cv2.ImShow("located", canvas);
        Cv2.WaitKey(0);
    }
}`;

  const EX_KNN = `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        using var tmpl = new Mat();
        Cv2.CopyMakeBorder(t0, tmpl, 32, 32, 32, 32, BorderTypes.Replicate);
        using var orb = ORB.Create(1000);
        using var dT = new Mat();
        using var dS = new Mat();
        orb.DetectAndCompute(tmpl, null, out KeyPoint[] kT, dT);
        orb.DetectAndCompute(scene, null, out KeyPoint[] kS, dS);

        // crossCheck 를 끄고 후보 2개를 받아 1등 / 2등 거리를 비교한다 (Lowe 비율 검사)
        using var bf = new BFMatcher(NormTypes.Hamming, crossCheck: false);
        DMatch[][] knn = bf.KnnMatch(dT, dS, 2);
        Console.WriteLine($"KnnMatch(k=2): 템플릿 특징점 {knn.Length}개마다 후보 2개");

        foreach (double ratio in new double[] { 0.6, 0.7, 0.75, 0.8, 0.9 })
        {
            int pass = knn.Count(p => p.Length == 2 && p[0].Distance < ratio * p[1].Distance);
            Console.WriteLine($"  비율 {ratio:F2} 통과 {pass,3}개");
        }

        var good = knn.Where(p => p.Length == 2 && p[0].Distance < 0.75 * p[1].Distance).Select(p => p[0]).ToArray();
        Console.WriteLine($"Lowe 0.75 로 고른 매칭 {good.Length}개");
        foreach (var m in good.OrderBy(m => m.Distance).Take(3))
            Console.WriteLine($"  거리 {m.Distance:F0} → 장면 ({kS[m.TrainIdx].Pt.X:F0},{kS[m.TrainIdx].Pt.Y:F0})");
    }
}`;

  const EX_QR = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/label_lot.png", ImreadModes.Grayscale);
        using var qr = new QRCodeDetector();
        string text = qr.DetectAndDecode(img, out Point2f[] pts);

        if (string.IsNullOrEmpty(text))
        {
            Console.WriteLine("QR 코드를 찾지 못했습니다.");
            return;
        }
        Console.WriteLine($"QR 내용: {text}");
        Console.WriteLine($"꼭짓점 {pts.Length}개:");
        foreach (var p in pts) Console.WriteLine($"  ({p.X:F0},{p.Y:F0})");

        foreach (var part in text.Split(';'))
        {
            var kv = part.Split('=');
            if (kv.Length == 2) Console.WriteLine($"  {kv[0],-4} = {kv[1]}");
        }

        using var canvas = new Mat();
        Cv2.CvtColor(img, canvas, ColorConversionCodes.GRAY2BGR);
        for (int i = 0; i < pts.Length; i++)
        {
            var a = new Point((int)pts[i].X, (int)pts[i].Y);
            var b = new Point((int)pts[(i + 1) % pts.Length].X, (int)pts[(i + 1) % pts.Length].Y);
            Cv2.Line(canvas, a, b, new Scalar(0, 0, 255), 2);
        }
        Cv2.ImShow("qr", canvas);
        Cv2.WaitKey(0);
    }
}`;

  const QUIZ1 = [
    { q: '640×480 영상에서 64×64 템플릿으로 <code>Cv2.MatchTemplate</code> 을 돌리면 결과 Mat 의 크기는?', options: ['640 × 480', '576 × 416', '577 × 417', '64 × 64'], answer: 2,
      explain: '결과 크기 = <b>(W − w + 1) × (H − h + 1)</b> = (640−64+1) × (480−64+1) = <b>577 × 417</b>. 템플릿을 놓을 수 있는 위치의 개수입니다. 형식은 <code>CV_32FC1</code>(실수 1채널) 입니다.' },
    { q: '<code>Cv2.MinMaxLoc</code> 이 돌려준 <code>maxLoc</code> 은 무엇의 좌표인가?', options: ['찾은 물체의 중심', '템플릿의 <b>왼쪽 위 모서리</b>가 놓인 위치', '템플릿의 오른쪽 아래 모서리', '가장 밝은 픽셀'], answer: 1,
      explain: '<code>maxLoc</code> 은 템플릿의 <b>왼쪽 위</b>가 놓인 위치입니다. 물체 중심이 필요하면 템플릿 안의 기준점 좌표를 더합니다 — 피듀셜 템플릿은 중심이 (32, 32) 이므로 <code>maxLoc + (32, 32)</code>.' },
    { q: '<code>TemplateMatchModes.SqDiffNormed</code> 를 쓸 때 찾아야 하는 것은?', options: ['maxVal / maxLoc', 'minVal / minLoc', '평균값', '표준편차'], answer: 1,
      explain: 'SqDiff 계열은 <b>차이의 제곱합</b>이므로 <b>작을수록 비슷</b>합니다 → <code>minLoc</code>. CCorr · CCoeff 계열은 클수록 비슷해서 <code>maxLoc</code> 입니다. 모드를 바꿨는데 min/max 를 안 바꿔서 엉뚱한 곳을 찾는 실수가 흔합니다.' },
    { q: '임계값 0.95 로 여러 곳을 찾을 때 <b>NMS(비최대 억제)</b> 가 필요한 이유는?', options: ['속도를 높이기 위해', '하나의 피듀셜 주변에서 여러 픽셀이 0.95 를 넘어 <b>같은 것이 여러 번</b> 검출되기 때문', '점수를 정규화하기 위해', '회전을 보정하기 위해'], answer: 1,
      explain: '봉우리 주변은 점수가 완만하게 높아서 한 물체에서 수십 개 후보가 나옵니다(예제에서는 15픽셀). <b>점수 높은 순으로 보면서 이미 뽑은 것과 가까우면 버리는</b> 간단한 NMS 로 3개만 남깁니다.' },
    { q: '템플릿 매칭의 가장 큰 약점은?', options: ['컬러 영상을 못 쓴다', '물체가 <b>회전하거나 크기가 바뀌면</b> 점수가 급격히 떨어진다', '결과가 정수 좌표뿐이다', '템플릿이 크면 못 쓴다'], answer: 1,
      explain: '예제에서 같은 부품이 30° 돌아간 것만으로 0.998 → <b>0.534</b> 로 떨어졌습니다. 해결책은 ① 템플릿을 여러 각도로 돌려 여러 번 매칭 ② <b>특징점(ORB)</b> 사용 — 2교시 주제입니다.' }
  ];

  const QUIZ2 = [
    { q: 'ORB 의 기술자(descriptor) 한 개의 크기는?', options: ['8바이트', '32바이트(256비트)', '128바이트(float 32개)', '이미지 크기에 따라 다르다'], answer: 1,
      explain: 'ORB 는 <b>이진 기술자</b>라서 특징점 하나가 256비트 = <b>32바이트</b>입니다. 그래서 <code>desc</code> Mat 은 <code>특징점 개수 × 32</code> 의 <code>CV_8UC1</code> 입니다. SIFT(float 128개 = 512바이트)보다 훨씬 작고 빠릅니다.' },
    { q: 'ORB 기술자를 매칭할 때 <code>BFMatcher</code> 에 넣어야 하는 거리는?', options: ['<code>NormTypes.L2</code>', '<code>NormTypes.Hamming</code>', '<code>NormTypes.L1</code>', '<code>NormTypes.Inf</code>'], answer: 1,
      explain: '이진 기술자는 <b>다른 비트의 개수</b>(해밍 거리)로 비교합니다 → <code>NormTypes.Hamming</code>. SIFT/SURF 같은 실수 기술자는 <code>L2</code> 입니다. 잘못 고르면 매칭 품질이 크게 떨어집니다.' },
    { q: '<code>crossCheck: true</code> 의 뜻은?', options: ['거리가 임계값보다 작은 것만 남긴다', 'A→B 의 1등이 B→A 의 1등일 때만 매칭으로 인정한다', '매칭을 두 번 계산해 평균한다', '이상치를 RANSAC 으로 제거한다'], answer: 1,
      explain: '양쪽에서 서로를 <b>1등으로 지목할 때만</b> 남기므로 애매한 매칭이 줄어듭니다. 대신 <code>KnnMatch</code>(k=2)+Lowe 비율 검사는 쓸 수 없습니다 — 둘 중 하나를 고릅니다.' },
    { q: 'Lowe 의 비율 검사 <code>d1 &lt; 0.75 × d2</code> 가 걸러 내는 것은?', options: ['거리가 먼 매칭', '1등과 2등이 <b>비슷하게 닮은</b> 애매한 매칭', '회전된 특징점', '크기가 다른 특징점'], answer: 1,
      explain: '반복 무늬(격자·나사산)에서는 1등과 2등 거리가 거의 같아 <b>어느 쪽인지 알 수 없습니다</b>. 1등이 2등보다 충분히(0.75배 이하) 가까울 때만 믿습니다. 예제에서 62개 후보 중 23개가 통과했습니다.' },
    { q: '<code>Cv2.FindHomography(src, dst, HomographyMethods.Ransac, 3)</code> 로 얻은 <code>H</code> 로 템플릿 모서리를 장면 좌표로 옮기는 함수는?', options: ['<code>Cv2.WarpPerspective</code>', '<code>Cv2.PerspectiveTransform</code>', '<code>Cv2.Transform</code>', '<code>Cv2.Remap</code>'], answer: 1,
      explain: '<code>WarpPerspective</code> 는 <b>영상 전체</b>를 변형하고, <code>PerspectiveTransform</code> 은 <b>점 목록</b>을 변환합니다. 네 모서리만 옮겨 다각형을 그릴 때는 후자입니다. RANSAC 의 3 은 인라이어 판정 허용 오차(px) 입니다.' }
  ];

  CS_COURSE.addChapter({
    id: 'cs14', no: '14', title: '템플릿 매칭과 특징점 (ORB)', subtitle: '모양 그대로 찾기 → 회전 · 크기가 바뀌어도 찾기',
    summary: '직선 · 원이 아닌 <b>임의의 모양</b>을 찾는 두 가지 방법을 배웁니다. <code>Cv2.MatchTemplate</code> 은 작은 그림(템플릿)을 영상 위에서 슬라이딩하며 유사도 맵을 만들고 <code>Cv2.MinMaxLoc</code> 으로 최고점을 찾습니다 — 피듀셜 마크 정렬과 7-세그먼트 숫자 판독에 바로 씁니다. 회전 · 크기 변화에 약한 한계를 <b>특징점(ORB) + BFMatcher + 호모그래피</b> 로 넘어서고, 보너스로 QR 코드까지 읽습니다.',
    goals: ['템플릿 매칭의 원리와 결과 Mat(유사도 맵)의 의미를 설명할 수 있다', 'MatchTemplate 모드별 min/max 사용법을 구분하고 다중 검출(임계값 + NMS)을 구현할 수 있다', '템플릿 매칭으로 셀 단위 숫자 판독(OCR)을 만들 수 있다', 'ORB 특징점 · 기술자 · 해밍 거리 매칭 · 호모그래피로 회전된 부품의 위치를 찾을 수 있다'],
    sections: [
      {
        id: 'cs14-1', title: '템플릿 매칭: 모양 그대로 찾기', minutes: 50,
        goals: ['MatchTemplate 의 슬라이딩 원리와 결과 크기 (W−w+1)를 설명할 수 있다', '6가지 모드의 차이와 min/max 선택을 안다', '임계값 + NMS 로 같은 모양 여러 개를 찾을 수 있다', '셀 단위 템플릿 매칭으로 7-세그먼트 숫자를 판독할 수 있다'],
        flow: [['도입: 임의의 모양 찾기', 5], ['원리 · 모드 · MinMaxLoc', 15], ['다중 검출 · 숫자 판독', 20], ['한계와 정리', 10]],
        content: [
          { type: 'h', text: '문제: 직선도 원도 아닌 "이 모양" 을 찾고 싶다' },
          { type: 'p', html: '13차시의 허프 변환은 <b>직선과 원</b>만 찾습니다. 그런데 현장에서 찾아야 하는 것은 십자 마크, 피듀셜, 로고, 숫자, 특정 부품처럼 <b>임의의 모양</b>입니다. 가장 단순하고 확실한 방법은 "찾고 싶은 모양의 작은 사진(<b>템플릿</b>)을 만들어 두고, 영상 위를 훑으며 가장 닮은 곳을 찾는" 것입니다.' },
          { type: 'figure', html: FIG_SLIDE, caption: '그림 1. 템플릿을 1픽셀씩 옮기며 유사도를 계산 → 유사도 맵. 맵의 최고점이 찾은 위치 (템플릿의 왼쪽 위 기준)' },
          { type: 'table', head: ['모드 (<code>TemplateMatchModes</code>)', '수식 감각', '찾을 값', '특징'], rows: [
            ['<code>SqDiff</code>', 'Σ(T − I)²  차이의 제곱합', '<b>최소</b>', '값이 크고 밝기에 민감'],
            ['<code>SqDiffNormed</code>', '위를 0~1 로 정규화', '<b>최소</b>', '0 = 완전 일치'],
            ['<code>CCorr</code>', 'Σ(T × I)  곱의 합', '최대', '밝은 영역에서 무조건 커짐 → 위험'],
            ['<code>CCorrNormed</code>', '위를 0~1 로 정규화', '최대', '밝기 <b>배율</b> 변화에 강함'],
            ['<code>CCoeff</code>', '평균을 뺀 뒤 곱의 합', '최대', '밝기 <b>오프셋</b>에 강함'],
            ['<code>CCoeffNormed</code>', '위를 −1~1 로 정규화', '최대', '<b>가장 무난 — 기본으로 이것</b>']
          ], caption: '표 1. 6가지 모드 — SqDiff 계열만 "작을수록 비슷" 이라는 것이 핵심' },
          { type: 'h', text: '기본: 피듀셜 마크 한 개 찾기' },
          { type: 'image', src: 'images/fiducial_board.png', caption: '예제 이미지: PCB 위 원형 피듀셜 3개 (중심 64,56 / 576,60 / 70,420) + 방해 패드 2개', width: 460 },
          { type: 'code', title: '예제 1: MatchTemplate + MinMaxLoc', code: EX_TM,
            desc: '결과 Mat 은 <b>577 × 417 = (640−64+1) × (480−64+1)</b> 의 <code>CV_32FC1</code> 입니다. 최고 점수 0.993 이 (32, 24) 에서 나왔고, 템플릿 안 피듀셜 중심이 (32, 32) 이므로 실제 중심은 <b>(64, 56)</b> — IMAGES.md 정답과 일치합니다. 유사도 맵은 실수 Mat 이라 그냥 <code>ImShow</code> 하면 잘 안 보이므로 <code>Cv2.Normalize</code> 로 0~255 로 펴서 8비트로 바꿔 봅니다. 맵에서 밝은 점 3개가 보이죠?',
            expect: '기판 640x480, 템플릿 64x64\n유사도 맵: 577 x 417 (CV_32FC1)\n= (640-64+1) x (480-64+1) = 577 x 417\n최대 점수 0.993 @ 좌상단 (32,24)\n최소 점수 -0.329 @ (132,334)\n피듀셜 중심 = 좌상단 + 템플릿 중심 = (64,56)  (정답 64,56)' },
          { type: 'callout', kind: 'warn', title: '⚠️ maxLoc 은 중심이 아니다', html: '<code>MinMaxLoc</code> 이 주는 위치는 <b>템플릿의 왼쪽 위 모서리</b>가 놓인 자리입니다. 물체 중심을 원하면 <b>템플릿 안에서의 기준점 좌표</b>를 더해 주세요. 사각형을 그릴 때는 <code>new Rect(maxLoc.X, maxLoc.Y, tmpl.Width, tmpl.Height)</code> 가 그대로 맞습니다.<br>또 하나: <code>out</code> 인수를 4개 다 쓰지 않아도 됩니다. <code>Cv2.MinMaxLoc(res, out _, out double maxVal, out _, out Point maxLoc);</code> 처럼 <b>버림 변수 <code>_</code></b> 를 쓰면 깔끔합니다.' },
          { type: 'code', title: '예제 2: 6가지 모드 비교 — min 인가 max 인가', code: EX_MODES,
            desc: '정답 위치는 (32, 24) 입니다. <code>SqDiff</code> · <code>SqDiffNormed</code> 는 <b>최소값 위치</b>가 정답이고, <code>CCoeffNormed</code> · <code>CCorrNormed</code> 는 <b>최대값 위치</b>가 정답입니다. 눈여겨볼 것은 <code>CCorr</code>(정규화 없음)와 <code>CCoeff</code>(정규화 없음)가 <b>엉뚱한 곳</b>을 최대로 꼽는다는 점 — 정규화하지 않은 모드는 밝은 영역에서 값이 그냥 커지기 때문입니다. 그래서 실무 기본은 <b>CCoeffNormed</b> 입니다.',
            expect: '모드              최소값 위치      최대값 위치     찾는 쪽\nSqDiff         ( 32, 24)       (282,139)      최소(MinLoc)\nSqDiffNormed   ( 32, 24)       (354,139)      최소(MinLoc)\nCCorr          ( 41,  9)       (300,133)      최대(MaxLoc)\nCCorrNormed    ( 45, 12)       ( 32, 24)      최대(MaxLoc)\nCCoeff         (354,139)       (544, 28)      최대(MaxLoc)\nCCoeffNormed   (132,334)       ( 32, 24)      최대(MaxLoc)\n정답 피듀셜 F1 좌상단 = (32,24)' },
          { type: 'h', text: '다중 검출: 같은 모양 여러 개 찾기' },
          { type: 'p', html: '<code>MinMaxLoc</code> 은 최고점 <b>하나</b>만 줍니다. 여러 개를 찾으려면 ① 유사도 맵을 <b>임계값</b>으로 걸러 후보를 모으고 ② 한 물체에서 여러 후보가 나오므로 <b>NMS(Non-Maximum Suppression, 비최대 억제)</b> 로 정리합니다. 가장 간단한 NMS 는 "점수 높은 순으로 보면서 이미 뽑은 것과 가까우면 버리기" 입니다.' },
          { type: 'code', title: '예제 3: 임계값 0.95 + 간단 NMS → 피듀셜 3개', code: EX_MULTI,
            desc: '0.95 이상 픽셀이 15개 나오지만 NMS 로 <b>3개</b>만 남습니다 — 세 피듀셜 중심 (64,56) · (576,60) · (70,420) 모두 정답입니다. 임계값을 0.85 로 낮추면 <b>방해 패드 2개</b>(점수 0.898 · 0.884)까지 섞입니다. 이렇게 <b>진짜와 가짜의 점수 사이</b>(0.98 vs 0.90)에 임계값을 두는 것이 실무의 요령입니다. <code>Cv2.FindNonZero</code> 로 0 이 아닌 픽셀 좌표를 한 번에 얻고, <code>res.At&lt;float&gt;(y, x)</code> 로 점수를 읽습니다 — 유사도 맵은 <b>float</b> Mat 임을 잊지 마세요.',
            expect: '임계값 0.95 → 피듀셜 3개\n  좌상단 (32,24) 점수 0.993 → 중심 (64,56)\n  좌상단 (544,28) 점수 0.988 → 중심 (576,60)\n  좌상단 (38,388) 점수 0.980 → 중심 (70,420)\n임계값 0.85 → 5개 (방해 패드까지 섞인다)\n  (64,56) 점수 0.993\n  (576,60) 점수 0.988\n  (70,420) 점수 0.980\n  (250,110) 점수 0.898\n  (380,420) 점수 0.884' },
          { type: 'h', text: '응용: 7-세그먼트 숫자 판독 (템플릿 OCR)' },
          { type: 'image', src: 'images/seven_segment.png', caption: '예제 이미지: 계측기 표시기 8자리 "20480735" (6° 기울임, 꺼진 세그먼트도 희미하게 보인다). 자리 i 의 셀 = (64 + 64·i, 60, 64, 120)', width: 560 },
          { type: 'p', html: '글자 위치가 <b>고정된 격자</b>라면 굳이 영상 전체를 훑을 필요가 없습니다. 자리마다 셀을 <b>ROI 로 잘라내고</b> 숫자 0~9 템플릿과 <b>같은 크기로</b> 비교하면 됩니다. 크기가 같으면 결과 Mat 이 1×1 이 되어 점수 하나만 나옵니다 — 가장 점수가 높은 숫자가 답입니다.' },
          { type: 'code', title: '예제 4: 셀 × 숫자 템플릿 10개 → "20480735" 판독', code: EX_OCR,
            desc: '8자리 × 10개 = 80번 매칭하지만 셀이 64×120 으로 작아 순식간에 끝납니다. 모든 자리의 점수가 <b>0.998 이상</b>으로 아주 확실합니다 — 표시기의 기하와 템플릿 띠의 기하가 같기 때문입니다. 실제 장비에서는 표시기 위치를 먼저 찾고(피듀셜 · 윤곽선), 기울기를 보정한 뒤(11차시) 이 방법을 쓰면 튼튼한 계측값 자동 수집기가 됩니다.',
            expect: '표시기 640x240, 숫자 템플릿 띠 640x120\n  0번째 자리 = 2 (점수 0.998)\n  1번째 자리 = 0 (점수 0.999)\n  2번째 자리 = 4 (점수 0.998)\n  3번째 자리 = 8 (점수 0.999)\n  4번째 자리 = 0 (점수 0.999)\n  5번째 자리 = 7 (점수 0.998)\n  6번째 자리 = 3 (점수 0.998)\n  7번째 자리 = 5 (점수 0.998)\n판독 결과: 20480735  (정답 20480735)' },
          { type: 'callout', kind: 'tip', title: '점수에 "확신도" 문턱을 두자', html: '최고 점수만 보고 답을 내면 <b>10개 중 아무거나</b> 고르게 됩니다. 실무에서는 ① 최고 점수가 0.9 미만이면 "판독 실패", ② 1등과 2등 점수 차이가 0.05 미만이면 "애매함" 으로 처리해 <b>사람에게 넘깁니다</b>. 틀린 값을 자신 있게 보고하는 것보다 "모르겠다" 가 훨씬 안전합니다.' },
          { type: 'h', text: '한계: 회전과 크기 변화' },
          { type: 'code', title: '예제 5: 같은 부품인데 30° 돌면 점수가 반토막', code: EX_LIMIT,
            desc: '<code>parts_scene.png</code> 에는 <b>같은 L 브래킷 6개</b>가 서로 다른 각도로 놓여 있습니다. 0° 부품 #1 은 0.998 로 완벽하게 찾지만, <b>30° 만 돌아간 #2 는 0.534</b>, 90° 인 #4 는 0.259 까지 떨어집니다. 템플릿 매칭은 <b>픽셀을 그대로 겹쳐 비교</b>하기 때문입니다. 해결책은 두 가지: ① 템플릿을 여러 각도로 돌려 여러 번 매칭(실습 2) ② <b>특징점 매칭</b>(2교시).',
            expect: '최고 점수 0.998 @ (60,60) → 기준점 (120,110)\n부품   회전각   그 자리의 최고 점수\n  #1      0도      0.998\n  #2     30도      0.534\n  #3    -45도      0.430\n  #4     90도      0.259\n  #5    160도      0.180\n  #6   -120도      0.152\n→ 0도 부품만 찾고, 30도만 돌아가도 0.53 으로 떨어진다' },
          { type: 'callout', kind: 'field', title: '현장 노트 — 템플릿 매칭을 쓸 때 / 안 쓸 때', html: '<ul><li><b>잘 맞는 상황</b>: 조명이 일정하고, 물체 자세가 거의 고정이며(±2° 이내), 배율도 고정. 대표 예가 <b>피듀셜 정렬</b>과 <b>고정 격자 OCR</b> 입니다. 단순하고 빠르고 디버깅이 쉬워 지금도 가장 많이 쓰입니다.</li><li><b>안 맞는 상황</b>: 물체가 자유롭게 회전 · 거리 변화 · 일부 가림. 이때는 특징점(ORB)이나 학습 기반 방법을 씁니다.</li><li><b>템플릿 만들기</b>: 실제 장비에서 찍은 <b>양품</b> 영상에서 오려 냅니다. 템플릿에 배경이 많이 들어가면 배경이 바뀔 때 점수가 떨어지므로 <b>물체에 꼭 맞게</b> 자르세요.</li><li><b>속도</b>: 전체 영상을 훑지 말고 <b>ROI</b> 로 좁히세요. 피듀셜은 대략 위치를 아니까 ±30 px 창만 보면 됩니다 — 수십 배 빨라집니다.</li><li><b>서브픽셀</b>: 최고점 좌우 3점으로 포물선을 맞추면 0.1 px 수준까지 위치를 세밀하게 낼 수 있습니다.</li></ul>' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: '템플릿을 <b>사용자가 드래그로 지정</b>하게 만들면 훌륭한 도구가 됩니다: <code>Image</code> 위에서 <code>MouseDown</code> → <code>MouseMove</code> → <code>MouseUp</code> 으로 사각형을 받고, 그 <code>Rect</code> 로 <code>new Mat(src, rect)</code> 를 만들어 템플릿으로 씁니다. 화면 좌표를 영상 좌표로 바꿀 때 <code>Image</code> 의 <code>Stretch="Uniform"</code> 배율을 나눠 주는 것을 잊지 마세요(2차시 · 16차시). 찾은 결과는 원본 위에 <code>Canvas</code> 의 <code>Rectangle</code> 로 겹쳐 그리면 원본 픽셀을 훼손하지 않습니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<ul><li><b>오개념 1</b>: "결과 Mat 이 원본과 같은 크기" → (W−w+1) × (H−h+1). 칠판에 작은 격자(6×5 영상, 3×3 템플릿)를 그려 4×3 이 나오는 것을 손으로 세어 보게 하면 확실히 이해합니다.</li><li><b>오개념 2</b>: "점수가 높으면 무조건 그 물체" → 방해 패드가 0.90 을 받는 것을 보여 주세요. <b>임계값은 진짜와 가짜 사이</b>에 둡니다.</li><li><b>오개념 3</b>: SqDiff 인데 maxLoc 을 쓰는 실수. 예제 2 의 표를 그대로 보여 주고 "모드를 바꾸면 min/max 도 바꾼다" 를 반복합니다.</li><li>💬 발문: “피듀셜 3개를 찾으면 무엇을 계산할 수 있을까?” — 기판의 이동량 · 회전량 (실습 1 로 연결). “세 점이면 배율까지” 도 유도해 보세요.</li><li>시간 관리: 예제 1~3 을 꼭 하고, 예제 4(OCR)는 시연 후 코드를 읽히는 정도로도 충분합니다. 예제 5 는 2교시 동기부여이므로 반드시 실행해서 점수 표를 보여 주세요.</li></ul>' }
        ],
        practice: [
          {
            title: 'SqDiffNormed 로 찾아보기 — min/max 바꿔 쓰기', level: 1,
            desc: '예제 1 과 같은 피듀셜을 <code>TemplateMatchModes.SqDiffNormed</code> 로 찾으세요. 이 모드는 <b>작을수록 비슷</b>하므로 <code>maxLoc</code> 이 아니라 <b><code>minLoc</code></b> 을 써야 합니다. 최소 점수 · 그 위치 · 피듀셜 중심을 출력하고, <b>최대 점수 위치</b>(가장 안 닮은 곳)도 함께 출력해 비교해 보세요.',
            hint: '<code>Cv2.MinMaxLoc(res, out double minVal, out double maxVal, out Point minLoc, out Point maxLoc);</code> 네 개를 모두 받아 출력하면 차이가 한눈에 보입니다. 점수는 0 에 가까울수록 완전 일치이므로 <code>:F4</code> 로 자릿수를 늘려 찍으세요.',
            expect: 'SqDiffNormed 는 작을수록 비슷 → MinLoc 를 쓴다\n최소 점수 0.0029 @ (32,24) → 중심 (64,56)\n최대 점수 0.5100 @ (354,139) = 가장 안 닮은 곳',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var board = Cv2.ImRead("images/fiducial_board.png", ImreadModes.Grayscale);
        using var tmpl = Cv2.ImRead("images/fiducial_template.png", ImreadModes.Grayscale);
        using var res = new Mat();
        // TODO: TemplateMatchModes.SqDiffNormed 로 MatchTemplate 하세요

        // TODO: MinMaxLoc 으로 네 값을 받아 최소 점수 · 위치 · 중심을 출력하세요
        //       (중심 = 위치 + (32, 32))

        Cv2.ImShow("board", board);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var board = Cv2.ImRead("images/fiducial_board.png", ImreadModes.Grayscale);
        using var tmpl = Cv2.ImRead("images/fiducial_template.png", ImreadModes.Grayscale);
        using var res = new Mat();
        Cv2.MatchTemplate(board, tmpl, res, TemplateMatchModes.SqDiffNormed);
        Cv2.MinMaxLoc(res, out double minVal, out double maxVal, out Point minLoc, out Point maxLoc);

        Console.WriteLine("SqDiffNormed 는 작을수록 비슷 → MinLoc 를 쓴다");
        Console.WriteLine($"최소 점수 {minVal:F4} @ ({minLoc.X},{minLoc.Y}) → 중심 ({minLoc.X + 32},{minLoc.Y + 32})");
        Console.WriteLine($"최대 점수 {maxVal:F4} @ ({maxLoc.X},{maxLoc.Y}) = 가장 안 닮은 곳");

        using var canvas = new Mat();
        Cv2.CvtColor(board, canvas, ColorConversionCodes.GRAY2BGR);
        Cv2.Rectangle(canvas, new Rect(minLoc.X, minLoc.Y, tmpl.Width, tmpl.Height), new Scalar(0, 255, 0), 2);
        Cv2.ImShow("found", canvas);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '회전 템플릿 매칭 — 여러 자세의 부품 찾기', level: 2,
            desc: '템플릿 매칭이 회전에 약하다면, <b>템플릿을 돌려서 여러 번</b> 매칭하면 됩니다. <code>part_template.png</code> 에 여백 30 px 을 붙이고(180 × 160, 기준점 (90, 80)) <code>Cv2.GetRotationMatrix2D</code> + <code>Cv2.WarpAffine</code> 으로 −60° ~ 180° 를 30° 간격으로 돌려 가며 <code>parts_scene.png</code> 에 매칭하고, 각 각도의 최고 점수와 기준점 위치를 출력하세요.',
            hint: '회전 행렬은 <code>Cv2.GetRotationMatrix2D(new Point2f(pad.Width / 2f, pad.Height / 2f), ang, 1)</code>, 회전은 <code>Cv2.WarpAffine(pad, rot, M, new Size(pad.Width, pad.Height), InterpolationFlags.Linear, BorderTypes.Replicate)</code>. 기준점은 <code>(maxLoc.X + 90, maxLoc.Y + 80)</code> 입니다. 정답 자세는 0° → (120,110), 30° → (330,100), 90° → (150,340) 입니다 — 30° 간격이므로 −45° · 160° · −120° 부품은 못 찾습니다.',
            expect: '여백 붙인 템플릿 180 x 160, 기준점 (90,80)\n  회전  -60도: 최고 점수 0.750 @ 기준점 (521,119)\n  회전  -30도: 최고 점수 0.756 @ 기준점 (518,122)\n  회전    0도: 최고 점수 0.994 @ 기준점 (120,110)\n  회전   30도: 최고 점수 0.989 @ 기준점 (330,100)\n  회전   60도: 최고 점수 0.616 @ 기준점 (146,335)\n  회전   90도: 최고 점수 0.993 @ 기준점 (150,340)\n  회전  120도: 최고 점수 0.619 @ 기준점 (156,340)\n  회전  150도: 최고 점수 0.837 @ 기준점 (360,330)\n  회전  180도: 최고 점수 0.710 @ 기준점 (361,325)',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        using var pad = new Mat();
        Cv2.CopyMakeBorder(t0, pad, 30, 30, 30, 30, BorderTypes.Replicate);   // 180 x 160
        Console.WriteLine($"여백 붙인 템플릿 {pad.Width} x {pad.Height}, 기준점 (90,80)");

        for (int ang = -60; ang <= 180; ang += 30)
        {
            // TODO: pad 를 ang 도 회전시킨 rot 을 만드세요 (GetRotationMatrix2D + WarpAffine)
            // TODO: scene 에 rot 을 MatchTemplate(CCoeffNormed) 하고 MinMaxLoc 으로 최고 점수와 위치를 구하세요
            // TODO: 각도 · 점수 · 기준점(위치 + (90,80)) 을 출력하세요
        }
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        using var pad = new Mat();
        Cv2.CopyMakeBorder(t0, pad, 30, 30, 30, 30, BorderTypes.Replicate);
        Console.WriteLine($"여백 붙인 템플릿 {pad.Width} x {pad.Height}, 기준점 (90,80)");

        for (int ang = -60; ang <= 180; ang += 30)
        {
            using var M = Cv2.GetRotationMatrix2D(new Point2f(pad.Width / 2f, pad.Height / 2f), ang, 1);
            using var rot = new Mat();
            Cv2.WarpAffine(pad, rot, M, new Size(pad.Width, pad.Height), InterpolationFlags.Linear, BorderTypes.Replicate);
            using var res = new Mat();
            Cv2.MatchTemplate(scene, rot, res, TemplateMatchModes.CCoeffNormed);
            Cv2.MinMaxLoc(res, out double mn, out double mx, out Point pn, out Point px);
            Console.WriteLine($"  회전 {ang,4}도: 최고 점수 {mx:F3} @ 기준점 ({px.X + 90},{px.Y + 80})");
        }
    }
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '템플릿 매칭: 모양 그대로 찾기', subtitle: 'MatchTemplate · MinMaxLoc · 다중 검출 · 숫자 판독', notes: '<p>13차시 복습: 허프는 <b>직선과 원</b>만 찾는다. 💬 “십자 마크나 로고를 찾으려면?” — 학생들에게 방법을 상상해 보게 하면 대개 “비교해 본다” 가 나옵니다. 그것이 바로 템플릿 매칭이라고 이어 갑니다. (3분)</p>' },
          { layout: 'image', title: '오늘의 재료 ①: 피듀셜 마크', src: 'images/fiducial_board.png', caption: '피듀셜 3개 (64,56) (576,60) (70,420) + 비슷하게 생긴 방해 패드 2개', notes: '<p>피듀셜(기준 마크)이 무엇인지 설명합니다: PCB · 디스플레이 공정에서 <b>기판의 위치와 회전을 알아내는 기준점</b>. 실제로 SMT 장비가 부품을 놓기 전에 가장 먼저 하는 일입니다. 💬 “방해 패드와 어떻게 구별할까?” — 점수 차이. (3분)</p>' },
          { layout: 'diagram', title: '슬라이딩 + 유사도 맵', html: FIG_SLIDE, caption: '템플릿을 1픽셀씩 옮기며 점수 계산 → (W−w+1) × (H−h+1) 크기의 유사도 맵', notes: '<p>칠판에 6×5 영상, 3×3 템플릿을 그려 놓을 수 있는 위치가 4×3 = 12 개인 것을 손으로 세어 보게 합니다. 결과 Mat 이 원본보다 작다는 것이 첫 번째 놀람 포인트. 두 번째는 <b>maxLoc 이 중심이 아니라 왼쪽 위</b>. (8분)</p>' },
          { layout: 'code', title: 'MatchTemplate + MinMaxLoc', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var board = Cv2.ImRead("images/fiducial_board.png", ImreadModes.Grayscale);
        using var tmpl = Cv2.ImRead("images/fiducial_template.png", ImreadModes.Grayscale);
        using var res = new Mat();
        Cv2.MatchTemplate(board, tmpl, res, TemplateMatchModes.CCoeffNormed);
        Console.WriteLine($"유사도 맵 {res.Width} x {res.Height} ({res.Type()})");

        Cv2.MinMaxLoc(res, out _, out double maxVal, out _, out Point maxLoc);
        Console.WriteLine($"점수 {maxVal:F3} @ ({maxLoc.X},{maxLoc.Y})");
        Console.WriteLine($"중심 ({maxLoc.X + 32},{maxLoc.Y + 32})");

        using var canvas = new Mat();
        Cv2.CvtColor(board, canvas, ColorConversionCodes.GRAY2BGR);
        Cv2.Rectangle(canvas, new Rect(maxLoc.X, maxLoc.Y, 64, 64), Scalar.Red, 2);
        Cv2.ImShow("found", canvas);
    }
}`, points: ['결과 577 × 417 = (640−64+1) × (480−64+1), <code>CV_32FC1</code>', '<code>out _</code> 로 필요 없는 값은 버린다', '점수 0.993 @ (32,24) → 중심 <b>(64,56)</b>'], notes: '<p><code>out _</code> 문법을 짚어 줍니다(C# 7 버림 변수). 실행 후 사각형이 정확히 피듀셜을 감싸는지 확인시키고, <code>+32</code> 를 빼면 사각형이 어긋나는 것도 보여 주세요. (8분)</p>' },
          { layout: 'table', title: '6가지 모드 — min 이냐 max 냐', head: ['모드', '찾을 값', '특징'], rows: [
            ['<code>SqDiff</code> / <code>SqDiffNormed</code>', '<b>최소</b>', '차이의 제곱합 — 0 = 완전 일치'],
            ['<code>CCorr</code>', '최대', '정규화 없음 → 밝은 곳이 무조건 큼 (위험)'],
            ['<code>CCorrNormed</code>', '최대', '밝기 배율 변화에 강함'],
            ['<code>CCoeff</code>', '최대', '정규화 없음 → 엉뚱한 곳을 꼽기도'],
            ['<code>CCoeffNormed</code>', '최대', '<b>기본으로 쓰는 모드</b>']
          ], lead: '실제 실행 결과: 정답 (32,24) 를 맞히는 모드는 SqDiff · SqDiffNormed(최소) 와 CCorrNormed · CCoeffNormed(최대)', notes: '<p>정규화 없는 <code>CCorr</code> · <code>CCoeff</code> 가 <b>틀린 답</b>을 준 실제 출력을 보여 주는 것이 핵심입니다. 💬 “왜 밝은 곳에서 CCorr 가 커질까?” — 곱의 합이니 밝으면 무조건 커진다. 결론: <b>Normed 붙은 것을 쓰자</b>. (5분)</p>' },
          { layout: 'code', title: '다중 검출: 임계값 + 간단 NMS', code: `using System;
using System.Collections.Generic;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var board = Cv2.ImRead("images/fiducial_board.png", ImreadModes.Grayscale);
        using var tmpl = Cv2.ImRead("images/fiducial_template.png", ImreadModes.Grayscale);
        using var res = new Mat();
        Cv2.MatchTemplate(board, tmpl, res, TemplateMatchModes.CCoeffNormed);
        using var m = new Mat();
        Cv2.Threshold(res, m, 0.95, 255, ThresholdTypes.Binary);
        using var m8 = new Mat(); m.ConvertTo(m8, MatType.CV_8UC1);
        var cand = Cv2.FindNonZero(m8).OrderByDescending(p => res.At<float>(p.Y, p.X));
        var keep = new List<Point>();
        foreach (var p in cand)
            if (!keep.Any(k => Math.Abs(k.X - p.X) < 32 && Math.Abs(k.Y - p.Y) < 32))
                keep.Add(p);
        Console.WriteLine($"후보 {Cv2.CountNonZero(m8)}개 → NMS 후 {keep.Count}개");
    }
}`, points: ['<code>Cv2.FindNonZero</code> → 0 이 아닌 픽셀 좌표 배열', '점수 <b>높은 순</b>으로 보며 가까운 것은 버림 = NMS', '후보 15개 → <b>3개</b> (0.993 · 0.988 · 0.980)'], notes: '<p>NMS 없이 그냥 찍으면 15개가 나오는 것을 먼저 보여 주고 필요성을 느끼게 합니다. 임계값 0.85 로 내리면 방해 패드(0.898 · 0.884)가 섞이는 것도 실행해 보여 주세요. 💬 “임계값을 얼마로 둘까?” — 진짜(0.98)와 가짜(0.90) <b>사이</b>. (8분)</p>' },
          { layout: 'image', title: '오늘의 재료 ②: 7-세그먼트 표시기', src: 'images/seven_segment.png', caption: '"20480735" — 자리 i 의 셀 = (64 + 64·i, 60, 64, 120), 숫자 템플릿은 digits_templates.png', notes: '<p>계측기 값을 사람이 손으로 적는 현장이 아직 많다는 이야기로 동기를 만듭니다. 💬 “글자 위치가 고정이면 영상 전체를 훑을 필요가 있을까?” — 없다. 셀만 잘라 비교. 꺼진 세그먼트도 희미하게 보이는 점(≈52)이 왜 어려움인지도 짚어 줍니다. (3분)</p>' },
          { layout: 'code', title: '셀 단위 템플릿 OCR', code: `using System;
using OpenCvSharp;
class Program
{
    static void Main()
    {
        using var disp = Cv2.ImRead("images/seven_segment.png", ImreadModes.Grayscale);
        using var tpl = Cv2.ImRead("images/digits_templates.png", ImreadModes.Grayscale);
        using var r = new Mat(); string result = "";
        for (int i = 0; i < 8; i++)                      // 8자리
        {
            using var cell = new Mat(disp, new Rect(64 + 64 * i, 60, 64, 120));
            int best = -1; double top = -2;              // 가장 점수 높은 숫자를 고른다
            for (int d = 0; d <= 9; d++)
            {
                using var t = new Mat(tpl, new Rect(64 * d, 0, 64, 120));
                Cv2.MatchTemplate(cell, t, r, TemplateMatchModes.CCoeffNormed);
                Cv2.MinMaxLoc(r, out _, out double mx); if (mx > top) { top = mx; best = d; }
            }
            result += best;
        }
        Console.WriteLine($"판독: {result}");
    }
}`, points: ['셀과 템플릿 크기가 같으면 결과 Mat 은 <b>1×1</b>', '8자리 × 숫자 10개 = 80번 매칭 (셀이 작아 빠름)', '모든 자리 점수 0.998 이상 → <b>20480735</b>'], notes: '<p>이중 루프 구조를 먼저 말로 정리합니다: “자리마다, 숫자 10개와 비교해 최고점을 고른다.” 실행 후 <b>확신도 문턱</b> 이야기를 꼭 얹습니다: 점수가 0.9 미만이면 실패 처리, 1·2등 차이가 작으면 애매함 처리. 💬 “표시기가 기울거나 흔들리면?” — 먼저 정렬 보정(11차시). (8분)</p>' },
          { layout: 'code', title: '한계: 30° 돌면 0.53', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var tmpl = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        using var res = new Mat();
        Cv2.MatchTemplate(scene, tmpl, res, TemplateMatchModes.CCoeffNormed);
        Cv2.MinMaxLoc(res, out _, out double mx, out _, out Point px);
        Console.WriteLine($"최고 {mx:F3} @ 기준점 ({px.X + 60},{px.Y + 50})");

        // 부품 #2 (30도) 자리의 점수
        Console.WriteLine($"#2(30도) 자리 점수 {res.At<float>(50, 270):F3}");
        Console.WriteLine($"#4(90도) 자리 점수 {res.At<float>(290, 90):F3}");
        Cv2.ImShow("scene", scene);
    }
}`, points: ['같은 L 브래킷 6개가 다른 각도로 놓여 있다', '0° → 0.998 / 30° → 0.53 / 90° → 0.26', '픽셀을 그대로 겹쳐 비교하므로 회전에 무력'], notes: '<p>여기가 2교시로 넘어가는 다리입니다. 점수 표를 보여 주고 💬 “어떻게 해결할까?” — ① 템플릿을 여러 각도로 돌린다(실습 2, 각도 수만큼 느려짐) ② 회전해도 변하지 않는 <b>특징</b>을 쓴다 → ORB. 후자가 2교시. (6분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '640×480 영상에서 64×64 템플릿으로 MatchTemplate 하면 결과 Mat 크기는?', options: ['640 × 480', '576 × 416', '577 × 417', '64 × 64'], answer: 2, explain: '(W − w + 1) × (H − h + 1) = <b>577 × 417</b>. 템플릿을 놓을 수 있는 위치의 개수입니다.', notes: '<p>정답 3번. 576 × 416 을 고른 학생이 많으면 “양 끝 위치도 센다” 는 +1 의 의미를 1차원(길이 6 에 길이 3 → 4곳)으로 다시 설명합니다.</p>' },
          { layout: 'practice', title: '실습: 회전 템플릿 매칭', desc: '<p>템플릿을 −60° ~ 180° 까지 30° 간격으로 돌려 가며 <code>parts_scene.png</code> 에 매칭하고 각 각도의 최고 점수와 기준점을 출력하세요.</p><ul><li>여백 30 px → 180 × 160, 기준점 (90, 80)</li><li><code>GetRotationMatrix2D</code> + <code>WarpAffine</code></li><li>정답: 0° → (120,110) · 30° → (330,100) · 90° → (150,340)</li></ul>', starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        using var pad = new Mat();
        Cv2.CopyMakeBorder(t0, pad, 30, 30, 30, 30, BorderTypes.Replicate);
        for (int ang = -60; ang <= 180; ang += 30)
        {
            // TODO: pad 를 ang 도 회전 → scene 에 매칭 → 점수와 기준점 출력
        }
    }
}`, solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        using var pad = new Mat();
        Cv2.CopyMakeBorder(t0, pad, 30, 30, 30, 30, BorderTypes.Replicate);
        for (int ang = -60; ang <= 180; ang += 30)
        {
            using var M = Cv2.GetRotationMatrix2D(new Point2f(pad.Width / 2f, pad.Height / 2f), ang, 1);
            using var rot = new Mat();
            Cv2.WarpAffine(pad, rot, M, new Size(pad.Width, pad.Height), InterpolationFlags.Linear, BorderTypes.Replicate);
            using var res = new Mat();
            Cv2.MatchTemplate(scene, rot, res, TemplateMatchModes.CCoeffNormed);
            Cv2.MinMaxLoc(res, out _, out double mx, out _, out Point px);
            Console.WriteLine($"  {ang,4}도: {mx:F3} @ ({px.X + 90},{px.Y + 80})");
        }
    }
}`, notes: '<p>정답: 0°(0.994), 30°(0.989), 90°(0.993) 세 자세만 0.95 를 넘습니다. 💬 “−45° 부품은 왜 못 찾았을까?” — 30° 간격이라 −45° 가 없다. 💬 “5° 간격으로 하면?” — 정확해지지만 <b>매칭 횟수가 6배</b>. 이 트레이드오프가 2교시 ORB 의 동기입니다. (10분)</p>' },
          { layout: 'summary', title: '1교시 정리', bullets: ['<code>Cv2.MatchTemplate</code> → 유사도 맵 <b>(W−w+1) × (H−h+1)</b>, <code>CV_32FC1</code>', '<code>Cv2.MinMaxLoc</code> 의 위치는 <b>템플릿 왼쪽 위</b> — 중심은 기준점을 더한다', 'SqDiff 계열은 <b>최소</b>, CCorr · CCoeff 계열은 <b>최대</b>. 기본은 <code>CCoeffNormed</code>', '여러 개 찾기 = <b>임계값 + NMS</b> (진짜와 가짜 점수 사이에 문턱을 둔다)', '고정 격자라면 셀 ROI × 템플릿으로 <b>숫자 판독</b>까지 가능', '약점은 <b>회전 · 크기 변화</b> → 다음: 특징점 ORB'], notes: '<p>여섯 줄을 정리하고, 특히 “왼쪽 위” 와 “SqDiff 는 최소” 를 다시 확인합니다. 다음 시간 예고: “회전해도 변하지 않는 특징을 뽑아서 비교한다 — 그리고 호모그래피로 부품 윤곽까지 그린다.” (3분)</p>' }
        ]
      },
      {
        id: 'cs14-2', title: '특징점과 기술자: ORB 매칭', minutes: 50,
        goals: ['특징점 · 기술자 · 해밍 거리의 개념을 설명할 수 있다', 'ORB.Create → DetectAndCompute → DrawKeypoints 를 쓸 수 있다', 'BFMatcher(Hamming, crossCheck) 와 KnnMatch + Lowe 비율 검사를 구분해 쓸 수 있다', 'FindHomography + PerspectiveTransform 으로 부품 위치를 다각형으로 표시할 수 있다'],
        flow: [['도입: 회전을 견디는 방법', 5], ['특징점 · 기술자 개념', 12], ['ORB 검출 · 매칭 · 호모그래피', 23], ['비율 검사 · QR · 정리', 10]],
        content: [
          { type: 'h', text: '아이디어: 영상 전체가 아니라 "특징적인 점"만 비교한다' },
          { type: 'p', html: '템플릿 매칭은 <b>모든 픽셀을 그대로</b> 겹쳐 비교했습니다. 그래서 30° 만 돌아도 무너졌습니다. 다른 접근은 이렇습니다: 영상에서 <b>눈에 띄는 점(코너)</b> 수백 개를 찾고, 각 점 주변 모습을 <b>회전에 상관없는 숫자 묶음(기술자)</b>으로 요약합니다. 두 영상에서 기술자가 비슷한 점끼리 짝지으면, 물체가 돌아가 있어도 <b>같은 점끼리 이어집니다</b>.' },
          { type: 'figure', html: FIG_KP, caption: '그림 2. ① FAST 로 코너 찾기 → ② 방향을 재고 회전 보정한 256비트 BRIEF 기술자 → ③ 해밍 거리로 짝짓기' },
          { type: 'table', head: ['용어', '뜻', 'OpenCvSharp 형'], rows: [
            ['특징점 (keypoint)', '위치 · 크기 · 방향을 가진 "눈에 띄는 점"', '<code>KeyPoint</code> — <code>Pt</code>, <code>Size</code>, <code>Angle</code>, <code>Response</code>, <code>Octave</code>'],
            ['기술자 (descriptor)', '그 점 주변 모습을 요약한 숫자 묶음', '<code>Mat</code> — 행 = 특징점, 열 = 32 (ORB, <code>CV_8UC1</code>)'],
            ['검출기 (detector)', '특징점을 찾는 알고리즘', '<code>ORB.Create(500)</code>, <code>AKAZE.Create()</code>, …'],
            ['매칭 (match)', '두 기술자 집합에서 닮은 쌍 찾기', '<code>BFMatcher</code> → <code>DMatch[]</code>'],
            ['<code>DMatch</code>', '한 쌍의 정보', '<code>QueryIdx</code>(첫 영상), <code>TrainIdx</code>(둘째 영상), <code>Distance</code>'],
            ['해밍 거리 (Hamming)', '이진 기술자에서 <b>다른 비트의 개수</b>', '<code>NormTypes.Hamming</code> (0 ~ 256)']
          ], caption: '표 2. 특징점 매칭의 등장인물 — ORB = Oriented FAST + Rotated BRIEF' },
          { type: 'h', text: 'ORB 로 특징점 찾기' },
          { type: 'code', title: '예제 1: ORB.Create → DetectAndCompute → DrawKeypoints', code: EX_ORB,
            desc: '<code>ORB.Create(500)</code> 의 500 은 <b>최대</b> 특징점 개수입니다(실제로는 473개). <code>DetectAndCompute</code> 는 특징점 배열과 기술자 Mat 을 한 번에 줍니다 — 두 번째 인수 <code>null</code> 은 "마스크 없음(영상 전체)" 입니다. 기술자는 <b>473 × 32</b> 의 <code>CV_8UC1</code>: 한 점이 32바이트 = 256비트입니다. <code>DrawMatchesFlags.DrawRichKeypoints</code> 를 주면 크기(원)와 방향(선)까지 그려 줍니다 — 결과 창에서 원의 크기가 제각각인 것을 확인하세요(피라미드 <code>Octave</code> 가 다릅니다).',
            expect: '특징점 473개\n기술자(descriptor) Mat: 473 x 32 (CV_8UC1)\n→ 특징점 1개 = 32바이트 = 256비트 이진 기술자\nresponse(코너 강도) 상위 5개:\n  (   90,   85) size   77 angle   51.5 octave 5\n  (  125,  367) size   93 angle  319.5 octave 6\n  (  290,   96) size   93 angle   14.1 octave 6\n  (  291,   92) size   77 angle   22.5 octave 5\n  (  127,  366) size   77 angle  322.6 octave 5' },
          { type: 'callout', kind: 'warn', title: '⚠️ 템플릿이 작으면 특징점이 안 나온다', html: 'ORB 는 기술자를 만들려고 특징점 주변 <b>31 × 31 픽셀</b>을 봅니다. 그래서 영상 <b>테두리에서 약 16 px 안쪽</b>의 점은 모두 버립니다. <code>part_template.png</code>(120 × 100)는 부품이 화면을 거의 채우고 있어 특징점이 <b>4개</b>밖에 안 나옵니다!<br>해결책은 <code>Cv2.CopyMakeBorder(t0, tmpl, 32, 32, 32, 32, BorderTypes.Replicate)</code> 로 <b>여백을 붙이는</b> 것입니다 — 이렇게 하면 62개가 나옵니다. 대신 좌표가 32 px 씩 밀리므로 나중에 계산할 때 그만큼 감안해야 합니다.' },
          { type: 'h', text: '매칭: 해밍 거리와 crossCheck' },
          { type: 'code', title: '예제 2: BFMatcher(Hamming, crossCheck) + DrawMatches', code: EX_MATCH,
            desc: '<code>BFMatcher</code>(Brute-Force)는 모든 쌍을 다 비교합니다 — 특징점이 수백 개면 충분히 빠릅니다. 이진 기술자이므로 <b><code>NormTypes.Hamming</code></b> 을 써야 합니다. <code>crossCheck: true</code> 는 "A→B 의 1등이 B→A 의 1등일 때만" 인정해 애매한 매칭을 줄입니다 (62개 중 55개). 거리로 정렬한 상위 20개의 해밍 거리가 <b>3 ~ 11</b> 로 매우 작습니다(256비트 중 3~11비트만 다름) — 같은 부품이니 당연합니다. 매칭된 장면 좌표가 (92,82), (96,86) … 부품 #1 근처에 모여 있는 것도 확인하세요.',
            expect: '템플릿 특징점 62개 / 장면 특징점 549개\ncrossCheck 매칭 55개\n거리 정렬 상위 20개: 3 ~ 11 (해밍 거리 = 다른 비트 수)\n  템플릿 kp  4 → 장면 kp 13  거리   3  장면 위치 (92,82)\n  템플릿 kp  8 → 장면 kp 21  거리   4  장면 위치 (96,86)\n  템플릿 kp 16 → 장면 kp 39  거리   4  장면 위치 (92,94)\n  템플릿 kp 11 → 장면 kp 28  거리   5  장면 위치 (84,90)\n  템플릿 kp 14 → 장면 kp107  거리   5  장면 위치 (133,365)' },
          { type: 'h', text: '호모그래피: 부품 윤곽을 장면에 그리기' },
          { type: 'p', html: '매칭 쌍이 모였다면 "템플릿 좌표 → 장면 좌표" 변환을 계산할 수 있습니다. 평면 물체라면 <b>3 × 3 호모그래피 H</b> 하나로 표현됩니다(11차시). 매칭에는 반드시 <b>틀린 쌍(이상치, outlier)</b> 이 섞이므로 <code>HomographyMethods.Ransac</code> 을 씁니다 — 무작위로 4쌍을 골라 H 를 만들고 가장 많은 쌍이 동의하는 H 를 채택하는 방식입니다.' },
          { type: 'code', title: '예제 3: FindHomography(Ransac) + PerspectiveTransform', code: EX_HOMO,
            desc: 'RANSAC 이 20쌍 중 <b>16쌍</b>을 인라이어로 인정했습니다 — <code>mask</code> 에 0/1 로 들어오므로 <code>Cv2.CountNonZero</code> 로 셉니다. 네 모서리를 투영하면 (57.5,57.7) ~ (60.7,158.5) 로 <b>부품 #1 을 감싸는 사각형</b>이 나옵니다(정답은 (60,60)-(180,160) 이므로 몇 px 오차). 더 중요한 것은 <b>기준점</b>: 템플릿의 (60,50) → 여백 포함 (92,82) 를 투영하니 <b>(118.2, 108.5)</b> — 정답 (120, 110) 과 2 px 이내입니다. 실무에서 로봇에 넘기는 값이 바로 이 기준점입니다.',
            expect: '호모그래피 H: 3x3, RANSAC 인라이어 16 / 20\n투영된 네 모서리:\n  (  57.5,  57.7)\n  ( 172.2,  61.6)\n  ( 164.6, 147.4)\n  (  60.7, 158.5)\n기준점(템플릿 60,50) 투영 = (118.2,108.5)  (정답 120,110)' },
          { type: 'callout', kind: 'tip', title: 'WarpPerspective 와 PerspectiveTransform 은 다르다', html: '<ul><li><code>Cv2.WarpPerspective(src, dst, H, size)</code> — <b>영상 전체</b>를 변형해 새 영상을 만듭니다 (정면화 · 보정).</li><li><code>Cv2.PerspectiveTransform(points, H)</code> — <b>점 목록</b>만 변환합니다 (모서리 투영 · 좌표 변환). 반환형이 입력과 같은 <code>Point2f[]</code> 입니다.</li></ul>모서리 네 개만 옮겨 다각형을 그릴 때 영상 전체를 변형하면 아주 느리고 낭비입니다. 점만 옮기세요.' },
          { type: 'h', text: 'KnnMatch + Lowe 비율 검사' },
          { type: 'code', title: '예제 4: 1등과 2등을 비교해 애매한 매칭 걸러내기', code: EX_KNN,
            desc: '<code>KnnMatch(dT, dS, 2)</code> 는 각 템플릿 특징점마다 <b>가장 가까운 2개</b>를 줍니다(<code>DMatch[][]</code>). 1등 거리가 2등의 0.75배보다 작으면 "확실히 1등" 으로 봅니다 — David Lowe 가 SIFT 논문에서 제안한 <b>비율 검사(ratio test)</b>입니다. 비율을 0.6 → 0.9 로 올리면 통과 개수가 8 → 42 개로 늘어납니다. 반복 무늬(격자 · 나사산 · 같은 부품 여러 개)가 있는 영상에서는 이 검사가 <b>crossCheck 보다 효과적</b>입니다. 단 <code>crossCheck: true</code> 와는 함께 쓸 수 없습니다 — 둘 중 하나를 고르세요.',
            expect: 'KnnMatch(k=2): 템플릿 특징점 62개마다 후보 2개\n  비율 0.60 통과   8개\n  비율 0.70 통과  18개\n  비율 0.75 통과  23개\n  비율 0.80 통과  26개\n  비율 0.90 통과  42개\nLowe 0.75 로 고른 매칭 23개\n  거리 3 → 장면 (92,82)\n  거리 4 → 장면 (96,86)\n  거리 4 → 장면 (92,94)' },
          { type: 'table', head: ['', '템플릿 매칭', 'ORB 특징점 매칭'], rows: [
            ['회전', '❌ 30° 에서 0.53 으로 붕괴', '✅ 견딘다 (방향 보정)'],
            ['크기 변화', '❌ 배율마다 다시 매칭', '✅ 어느 정도 견딘다 (피라미드)'],
            ['부분 가림', '❌ 점수 급락', '✅ 보이는 특징점만으로 가능'],
            ['무늬 없는 물체', '✅ 형상만으로 찾음', '❌ 특징점이 안 잡힌다'],
            ['작은 템플릿', '✅ 문제없음', '❌ 테두리 여백이 필요'],
            ['결과', '위치(사각형) + 점수', '점 대응 → <b>H</b> → 위치 · <b>회전 · 배율</b>'],
            ['속도', '영상 · 템플릿 크기에 비례', '특징점 개수에 비례 (보통 빠름)'],
            ['튜닝', '모드 · 임계값', 'nFeatures · 거리 임계 · 비율 · RANSAC 오차']
          ], caption: '표 3. 두 방법은 경쟁 관계가 아니라 상보 관계 — 자세가 고정이면 템플릿, 자유롭게 놓이면 특징점' },
          { type: 'h', text: '보너스: QR 코드 읽기' },
          { type: 'code', title: '예제 5: QRCodeDetector 로 라벨 읽기', code: EX_QR,
            desc: 'OpenCV 에는 QR 코드 전용 검출·해독기가 들어 있습니다. <code>DetectAndDecode</code> 는 내용을 문자열로 돌려주고 네 꼭짓점을 <code>out Point2f[]</code> 로 줍니다. 찾지 못하면 <b>빈 문자열</b>을 주므로 반드시 확인하세요. 읽은 문자열을 <code>Split(\';\')</code> · <code>Split(\'=\')</code> 로 쪼개면 바로 생산 이력(SN · LOT · EXP)으로 쓸 수 있습니다. 바코드(EAN-13)는 <code>BarcodeDetector</code> 가 필요하며 별도 contrib 모듈입니다.',
            expect: 'QR 내용: SN=MV-000123;LOT=A2309-117;EXP=2027-09-30\n꼭짓점 4개:\n  (428,258)\n  (543,258)\n  (543,374)\n  (428,374)\n  SN   = MV-000123\n  LOT  = A2309-117\n  EXP  = 2027-09-30' },
          { type: 'callout', kind: 'field', title: '현장 노트 — 특징점 매칭을 실제로 쓸 때', html: '<ul><li><b>ORB vs AKAZE vs SIFT</b>: ORB 는 빠르고 특허가 없어 산업용으로 널리 쓰입니다. 정밀도가 더 필요하면 AKAZE, 최고 품질은 SIFT(OpenCV 4.4+ 부터 자유롭게 사용 가능)입니다. OpenCvSharp 에서는 <code>AKAZE.Create()</code> 로 이름만 바꿔 실험할 수 있습니다.</li><li><b>인라이어 개수가 품질 지표</b>: 인라이어가 10개 미만이면 "못 찾았다" 로 처리하세요. 매칭이 몇 개 나왔는지가 아니라 <b>RANSAC 을 통과한 개수</b>가 신뢰도입니다.</li><li><b>H 에서 회전 · 배율 뽑기</b>: <code>H</code> 의 왼쪽 위 2×2 로부터 회전각 ≈ <code>Math.Atan2(H[1,0], H[0,0])</code>, 배율 ≈ <code>Math.Sqrt(H[0,0]² + H[1,0]²)</code> 를 얻을 수 있습니다. 평면 부품 픽킹에 그대로 씁니다.</li><li><b>무늬 없는 금속 부품</b>에는 특징점이 거의 안 잡힙니다. 그때는 윤곽선 기반(12차시 <code>MatchShapes</code> · <code>MinAreaRect</code>)이 더 낫습니다. "특징점이 만능" 이 아닙니다.</li><li><b>조명</b>: 특징점은 밝기 <b>패턴</b>에 의존합니다. 조명이 바뀌어 반사 하이라이트가 움직이면 특징점도 움직입니다. 확산 조명(diffuse)으로 하이라이트를 없애는 것이 알고리즘 튜닝보다 효과적일 때가 많습니다.</li></ul>' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: '<code>Cv2.DrawMatches</code> 가 만든 Mat(두 영상을 나란히 붙이고 선을 그린 것)을 그대로 <code>Image.Source</code> 에 넣으면 훌륭한 디버깅 화면이 됩니다. 실무 화면은 보통 이렇게 구성합니다: 위쪽에 <b>매칭 시각화</b>, 아래쪽 <code>StatusBar</code> 에 <b>특징점 수 / 매칭 수 / 인라이어 수 / 추정 회전각</b>. <code>Slider</code> 로 <code>nFeatures</code> 와 Lowe 비율을 조절하게 하면 학생이 파라미터의 의미를 눈으로 익힙니다. 무거운 계산은 <code>Task.Run</code> 으로 돌리고 결과만 <code>Dispatcher.Invoke</code> 로 화면에 올리세요 — 15차시에서 이 패턴을 자세히 다룹니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '평가 루브릭 · 마무리', html: '<ul><li><b>상</b>: 템플릿 매칭과 특징점 매칭을 상황에 맞게 고르고 근거를 설명한다. 인라이어 개수를 신뢰도로 쓰고, 기준점 투영까지 코드로 완성한다.</li><li><b>중</b>: 예제를 수정해 다른 영상에서 매칭을 돌린다. Hamming / crossCheck / Lowe 비율의 뜻을 안다.</li><li><b>하</b>: <code>NormTypes.L2</code> 를 쓰거나 작은 템플릿에서 특징점이 안 나와 막힌다 → 표 2 와 ⚠️ 콜아웃을 다시 보게 합니다.</li><li>💬 마무리 발문: “매끈한 금속 부품처럼 무늬가 전혀 없으면?” — 특징점이 안 잡힌다 → 윤곽선 기반(12차시)이나 형상 매칭을 쓴다. “특징점이 만능이 아니다” 로 마무리하세요.</li><li>다음 차시 예고: 지금까지는 <b>사진 한 장</b>이었습니다. 15차시부터는 <b>움직이는 영상</b>(VideoCapture) 을 다룹니다 — 컨베이어 위를 지나가는 부품을 한 번만 세는 문제.</li></ul>' }
        ],
        practice: [
          {
            title: 'nFeatures 를 바꿔 보기 — 특징점은 몇 개가 적당한가', level: 1,
            desc: '<code>ORB.Create(n)</code> 의 <code>n</code> 을 100 · 300 · 500 · 1000 · 2000 으로 바꿔 가며 <code>parts_scene.png</code> 의 특징점 개수와 기술자 Mat 크기를 출력하세요. 어느 지점부터 더 늘지 않는지 확인하고, 그 이유를 생각해 보세요.',
            hint: '<code>foreach (int n in new int[] { 100, 300, 500, 1000, 2000 })</code> 안에서 <code>using var orb = ORB.Create(n);</code> 을 만들고 <code>DetectAndCompute</code> 를 부르면 됩니다. <code>n</code> 은 <b>상한</b>이므로 영상에 코너가 그만큼 없으면 더 나오지 않습니다.',
            expect: '  ORB.Create( 100) → 특징점  100개, 기술자 100x32\n  ORB.Create( 300) → 특징점  298개, 기술자 298x32\n  ORB.Create( 500) → 특징점  473개, 기술자 473x32\n  ORB.Create(1000) → 특징점  549개, 기술자 549x32\n  ORB.Create(2000) → 특징점  549개, 기술자 549x32',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        foreach (int n in new int[] { 100, 300, 500, 1000, 2000 })
        {
            // TODO: ORB.Create(n) 으로 검출기를 만들고 DetectAndCompute 를 부르세요
            // TODO: 특징점 개수와 기술자 Mat 크기를 출력하세요
        }
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        foreach (int n in new int[] { 100, 300, 500, 1000, 2000 })
        {
            using var orb = ORB.Create(n);
            using var d = new Mat();
            orb.DetectAndCompute(scene, null, out KeyPoint[] k, d);
            Console.WriteLine($"  ORB.Create({n,4}) → 특징점 {k.Length,4}개, 기술자 {d.Rows}x{d.Cols}");
        }
    }
}`
          },
          {
            title: '장면을 90° 돌려도 ORB 는 같은 부품을 찾는다', level: 2,
            desc: '<code>Cv2.Rotate(scene0, scene, RotateFlags.Rotate90Clockwise)</code> 로 장면을 90° 시계 회전시킨 뒤 ① 템플릿 매칭과 ② ORB + 호모그래피를 둘 다 돌려 결과를 비교하세요. 템플릿 매칭은 <b>다른 부품</b>(원래 90° 였다가 0° 가 된 #4)을 찾고, ORB 는 <b>같은 #1 부품</b>을 계속 따라갑니다. 원본 (120, 110) 을 90° 시계 회전하면 (479−110, 120) = <b>(369, 120)</b> 입니다.',
            hint: 'ORB 쪽은 예제 3 의 코드를 그대로 쓰면 됩니다 (여백 32 px → 기준점은 (92, 82)). 90° 시계 회전의 좌표 변환은 <code>x\' = H − 1 − y</code>, <code>y\' = x</code> (H = 원본 높이 480) 입니다.',
            expect: '[템플릿 매칭] 최고 점수 0.996 @ 기준점 (139,150)\n  → #1 이 아니라, 회전 덕분에 0도가 된 다른 부품(#4)을 찾았다\n[ORB] 인라이어 16 / 20\n[ORB] 기준점 투영 = (370.7,117.9)  (정답 369,120)\n  → ORB 는 회전해도 같은 #1 부품을 따라간다',
            starter: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene0 = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var scene = new Mat();
        Cv2.Rotate(scene0, scene, RotateFlags.Rotate90Clockwise);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);

        // TODO ①: 템플릿 매칭(CCoeffNormed) 최고 점수와 기준점(위치 + (60,50)) 을 출력하세요

        // TODO ②: t0 에 여백 32px 을 붙이고 ORB(1000) + BFMatcher(Hamming, crossCheck) 로
        //          상위 20개 매칭 → FindHomography(Ransac, 3) → (92,82) 를 투영해 출력하세요

        Cv2.ImShow("rotated scene", scene);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene0 = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var scene = new Mat();
        Cv2.Rotate(scene0, scene, RotateFlags.Rotate90Clockwise);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);

        using var res = new Mat();
        Cv2.MatchTemplate(scene, t0, res, TemplateMatchModes.CCoeffNormed);
        Cv2.MinMaxLoc(res, out double mn, out double mx, out Point pn, out Point px);
        Console.WriteLine($"[템플릿 매칭] 최고 점수 {mx:F3} @ 기준점 ({px.X + 60},{px.Y + 50})");
        Console.WriteLine("  → #1 이 아니라, 회전 덕분에 0도가 된 다른 부품(#4)을 찾았다");

        using var tmpl = new Mat();
        Cv2.CopyMakeBorder(t0, tmpl, 32, 32, 32, 32, BorderTypes.Replicate);
        using var orb = ORB.Create(1000);
        using var dT = new Mat();
        using var dS = new Mat();
        orb.DetectAndCompute(tmpl, null, out KeyPoint[] kT, dT);
        orb.DetectAndCompute(scene, null, out KeyPoint[] kS, dS);
        using var bf = new BFMatcher(NormTypes.Hamming, crossCheck: true);
        var good = bf.Match(dT, dS).OrderBy(m => m.Distance).Take(20).ToArray();

        var src = good.Select(m => kT[m.QueryIdx].Pt).ToArray();
        var dst = good.Select(m => kS[m.TrainIdx].Pt).ToArray();
        using var mask = new Mat();
        using var H = Cv2.FindHomography(src, dst, HomographyMethods.Ransac, 3, mask);
        Console.WriteLine($"[ORB] 인라이어 {Cv2.CountNonZero(mask)} / {good.Length}");
        var rp = Cv2.PerspectiveTransform(new Point2f[] { new Point2f(92, 82) }, H)[0];
        Console.WriteLine($"[ORB] 기준점 투영 = ({rp.X:F1},{rp.Y:F1})  (정답 369,120)");
        Console.WriteLine("  → ORB 는 회전해도 같은 #1 부품을 따라간다");
    }
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '특징점과 기술자: ORB 매칭', subtitle: '회전 · 크기가 바뀌어도 같은 물체를 찾는다', notes: '<p>1교시 마지막 결과(30° → 0.53)를 다시 띄우고 시작합니다. 💬 “사람은 부품이 돌아가 있어도 같은 부품인 줄 아는데, 무엇을 보고 알까요?” — 모서리 · 구멍 같은 <b>특징</b>. 그것을 코드로 옮기는 것이 오늘 주제입니다. (3분)</p>' },
          { layout: 'diagram', title: '특징점 → 기술자 → 해밍 거리', html: FIG_KP, caption: 'ORB = Oriented FAST(코너) + Rotated BRIEF(256비트 이진 기술자)', notes: '<p>세 단계를 천천히 짚습니다. ① 코너: 평평한 면이나 직선의 중간은 "어디인지 알 수 없어서" 특징점이 안 됩니다 — 창문을 손으로 가리는 비유가 잘 통합니다. ② 방향을 먼저 재고 그 방향으로 비교 패턴을 <b>돌려서</b> 기술자를 만들기 때문에 회전에 강합니다. ③ 이진이므로 XOR 후 1의 개수 = 해밍 거리, 아주 빠릅니다. (10분)</p>' },
          { layout: 'table', title: '등장인물 정리', head: ['용어', '뜻', 'OpenCvSharp'], rows: [
            ['특징점', '위치 · 크기 · 방향이 있는 점', '<code>KeyPoint</code> (Pt, Size, Angle, Response)'],
            ['기술자', '주변 모습 요약', '<code>Mat</code> N × 32 <code>CV_8UC1</code>'],
            ['검출기', '찾는 알고리즘', '<code>ORB.Create(500)</code>'],
            ['매칭', '닮은 쌍', '<code>BFMatcher</code> → <code>DMatch[]</code>'],
            ['<code>DMatch</code>', '쌍 정보', 'QueryIdx · TrainIdx · Distance'],
            ['해밍 거리', '다른 비트 수', '<code>NormTypes.Hamming</code>']
          ], notes: '<p><code>QueryIdx</code>(첫 번째 영상)와 <code>TrainIdx</code>(두 번째 영상)를 혼동하는 실수가 많습니다. “Query = 찾는 쪽(템플릿), Train = 찾아지는 쪽(장면)” 으로 외우게 하세요. <code>NormTypes.L2</code> 를 쓰면 안 되는 이유(이진 기술자)도 강조. (4분)</p>' },
          { layout: 'code', title: 'ORB 로 특징점 찾기', code: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var orb = ORB.Create(500);
        using var desc = new Mat();
        orb.DetectAndCompute(scene, null, out KeyPoint[] kps, desc);

        Console.WriteLine($"특징점 {kps.Length}개");
        Console.WriteLine($"기술자 {desc.Rows} x {desc.Cols} ({desc.Type()})");
        foreach (var k in kps.OrderByDescending(k => k.Response).Take(3))
            Console.WriteLine($"  ({k.Pt.X:F0},{k.Pt.Y:F0}) angle {k.Angle:F1}");

        using var vis = new Mat();
        Cv2.DrawKeypoints(scene, kps, vis, null, DrawMatchesFlags.DrawRichKeypoints);
        Cv2.ImShow("keypoints", vis);
    }
}`, points: ['<code>ORB.Create(500)</code> 의 500 은 <b>상한</b> (실제 473개)', '두 번째 인수 <code>null</code> = 마스크 없음(영상 전체)', '기술자 473 × 32 = 점마다 <b>32바이트(256비트)</b>', '<code>DrawRichKeypoints</code> → 크기(원) · 방향(선)까지'], notes: '<p>실행해서 특징점이 <b>모서리와 구멍</b>에 몰려 있는 것을 확인시킵니다. 💬 “배경(평평한 면)에는 왜 없을까?” 원의 크기가 다른 이유(<code>Octave</code> = 피라미드 층)도 설명. <code>metal_scratch.png</code> 로 바꿔 실행하면 10개밖에 안 나오는 것도 보여 주면 좋습니다 — 무늬 없는 표면의 한계. (8분)</p>' },
          { layout: 'code', title: '매칭: Hamming + crossCheck', code: `using System;
using System.Linq;
using OpenCvSharp;
class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        using var tmpl = new Mat();
        Cv2.CopyMakeBorder(t0, tmpl, 32, 32, 32, 32, BorderTypes.Replicate);
        using var orb = ORB.Create(1000);
        using var dT = new Mat(); using var dS = new Mat();
        orb.DetectAndCompute(tmpl, null, out KeyPoint[] kT, dT);
        orb.DetectAndCompute(scene, null, out KeyPoint[] kS, dS);
        Console.WriteLine($"템플릿 {kT.Length} / 장면 {kS.Length}");
        using var bf = new BFMatcher(NormTypes.Hamming, crossCheck: true);
        var good = bf.Match(dT, dS).OrderBy(m => m.Distance).Take(20).ToArray();
        Console.WriteLine($"거리 {good[0].Distance:F0} ~ {good[19].Distance:F0}");
        using var drawn = new Mat();
        Cv2.DrawMatches(tmpl, kT, scene, kS, good, drawn);
        Cv2.ImShow("matches", drawn);
    }
}`, points: ['<code>CopyMakeBorder</code> 없이는 템플릿 특징점이 <b>4개</b>뿐!', '<code>NormTypes.Hamming</code> — 이진 기술자이므로 필수', '<code>crossCheck</code>: 서로가 서로의 1등일 때만 (62 → 55개)', '상위 20개 거리 3~11 — 256비트 중 몇 비트만 다르다'], notes: '<p><code>CopyMakeBorder</code> 를 지우고 실행해 특징점이 4개로 떨어지는 것을 <b>반드시</b> 보여 주세요. 이유: ORB 는 31×31 패치가 필요해 테두리 근처를 버린다. <code>DrawMatches</code> 결과 그림에서 선들이 부품 #1 한 곳으로 모이는 것을 확인시킵니다. (10분)</p>' },
          { layout: 'code', title: '호모그래피로 부품 윤곽 그리기', code: `using System;
using System.Linq;
using OpenCvSharp;
class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        using var tmpl = new Mat(); Cv2.CopyMakeBorder(t0, tmpl, 32, 32, 32, 32, BorderTypes.Replicate);
        using var orb = ORB.Create(1000);
        using var dT = new Mat(); using var dS = new Mat();
        orb.DetectAndCompute(tmpl, null, out KeyPoint[] kT, dT);
        orb.DetectAndCompute(scene, null, out KeyPoint[] kS, dS);
        using var bf = new BFMatcher(NormTypes.Hamming, crossCheck: true);
        var g = bf.Match(dT, dS).OrderBy(m => m.Distance).Take(20).ToArray();   // 좋은 쌍 20개
        var src = g.Select(m => kT[m.QueryIdx].Pt).ToArray();   // 템플릿 좌표
        var dst = g.Select(m => kS[m.TrainIdx].Pt).ToArray();   // 장면 좌표 (같은 순서)
        using var mask = new Mat();   // RANSAC 인라이어 표시
        using var H = Cv2.FindHomography(src, dst, HomographyMethods.Ransac, 3, mask);
        var p = Cv2.PerspectiveTransform(new Point2f[] { new Point2f(92, 82) }, H)[0];
        Console.WriteLine($"인라이어 {Cv2.CountNonZero(mask)}/{g.Length}, 기준점 ({p.X:F1},{p.Y:F1})");
    }
}`, points: ['<code>HomographyMethods.Ransac</code> — 틀린 쌍(이상치)을 걸러 준다', '<code>mask</code> 의 1 개수 = 인라이어 (16 / 20) = <b>신뢰도</b>', '<code>PerspectiveTransform</code> 은 <b>점</b>만 변환 (영상은 WarpPerspective)', '기준점 (118.2, 108.5) — 정답과 2 px 이내'], notes: '<p>RANSAC 을 “투표로 다수 의견을 고른다” 로 설명합니다(허프의 투표와 같은 정신!). 인라이어 개수를 <b>신뢰도</b>로 쓰라는 실무 규칙을 강조: 10개 미만이면 “못 찾았다”. <code>Take(20)</code> 을 <code>Take(55)</code> 로 바꾸면 사각형이 찌그러지는 것도 보여 주면 좋습니다 — 나쁜 쌍이 늘면 H 가 흔들립니다. (12분)</p>' },
          { layout: 'code', title: 'KnnMatch + Lowe 비율 검사', code: `using System;
using System.Linq;
using OpenCvSharp;
class Program
{
    static void Main()
    {
        using var scene = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        using var tmpl = new Mat();
        Cv2.CopyMakeBorder(t0, tmpl, 32, 32, 32, 32, BorderTypes.Replicate);
        using var orb = ORB.Create(1000);
        using var dT = new Mat(); using var dS = new Mat();
        orb.DetectAndCompute(tmpl, null, out KeyPoint[] kT, dT);
        orb.DetectAndCompute(scene, null, out KeyPoint[] kS, dS);

        using var bf = new BFMatcher(NormTypes.Hamming, crossCheck: false);
        DMatch[][] knn = bf.KnnMatch(dT, dS, 2);
        foreach (double r in new double[] { 0.6, 0.75, 0.9 })
            Console.WriteLine($"비율 {r:F2} 통과 " +
                knn.Count(p => p.Length == 2 && p[0].Distance < r * p[1].Distance));
    }
}`, points: ['<code>KnnMatch(…, 2)</code> → 점마다 후보 2개 (<code>DMatch[][]</code>)', '1등이 2등보다 <b>충분히</b> 가까울 때만 믿는다', '0.6 → 8개 / 0.75 → 23개 / 0.9 → 42개', '<code>crossCheck: true</code> 와는 <b>함께 못 쓴다</b>'], notes: '<p>반복 무늬(격자·나사산)에서 1등과 2등이 구별되지 않는 상황을 그림으로 설명합니다. Lowe 의 0.7~0.8 이 경험적 표준값. 💬 “비율을 1.0 으로 하면?” — 전부 통과 = 검사 안 함. crossCheck 와 택일이라는 점을 꼭 짚으세요. (7분)</p>' },
          { layout: 'table', title: '템플릿 매칭 vs ORB — 언제 무엇을', head: ['상황', '템플릿 매칭', 'ORB'], rows: [
            ['회전 · 크기 변화', '❌', '✅'],
            ['부분 가림', '❌', '✅'],
            ['무늬 없는 물체', '✅', '❌'],
            ['작은 템플릿', '✅', '❌ (여백 필요)'],
            ['얻는 정보', '위치 + 점수', '위치 + <b>회전 · 배율</b> (H)'],
            ['추천', '피듀셜 · 고정 격자 OCR', '자유 자세 부품 · 정렬']
          ], notes: '<p>“둘 중 무엇이 더 좋은가” 가 아니라 “언제 무엇을” 이라는 결론을 분명히 합니다. 현장에서 템플릿 매칭이 여전히 1위인 이유: 단순 · 빠름 · 디버깅 쉬움. 💬 “피듀셜에 ORB 를 쓰면?” — 마크가 작고 무늬가 없어 특징점이 안 나온다. (4분)</p>' },
          { layout: 'code', title: '보너스: QR 코드 읽기', code: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/label_lot.png", ImreadModes.Grayscale);
        using var qr = new QRCodeDetector();
        string text = qr.DetectAndDecode(img, out Point2f[] pts);
        if (string.IsNullOrEmpty(text))
        {
            Console.WriteLine("QR 을 찾지 못했습니다.");
            return;
        }
        Console.WriteLine($"QR: {text}");
        foreach (var part in text.Split(';'))
        {
            var kv = part.Split('=');
            if (kv.Length == 2) Console.WriteLine($"  {kv[0]} = {kv[1]}");
        }
    }
}`, points: ['<code>DetectAndDecode</code> → 내용 문자열 + 네 꼭짓점', '못 찾으면 <b>빈 문자열</b> → 반드시 확인', 'SN · LOT · EXP 로 쪼개면 바로 생산 이력'], notes: '<p>QR 은 알고리즘이 표준화되어 있어 한 줄로 끝난다는 것이 요점입니다. 바코드(EAN-13)는 contrib 모듈의 <code>BarcodeDetector</code> 가 필요하다고 덧붙입니다. 💬 “QR 이 기울어져 있거나 일부가 가려지면?” — 오류 정정 코드가 들어 있어 30%까지 복구 가능. (5분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: 'ORB 기술자를 <code>BFMatcher</code> 로 매칭할 때 써야 하는 거리는?', options: ['<code>NormTypes.L2</code>', '<code>NormTypes.Hamming</code>', '<code>NormTypes.L1</code>', '<code>NormTypes.Inf</code>'], answer: 1, explain: 'ORB 는 <b>이진</b> 기술자이므로 다른 비트 수를 세는 <b>해밍 거리</b>입니다. SIFT/SURF 같은 실수 기술자는 <code>L2</code>.', notes: '<p>정답 2번. 잘못 고르면 “동작은 하지만 결과가 나쁘다” 는 조용한 버그라서 특히 위험하다고 알려 줍니다.</p>' },
          { layout: 'practice', title: '실습: 90° 돌려도 같은 부품을 따라가는가', desc: '<p>장면을 <code>Cv2.Rotate(…, RotateFlags.Rotate90Clockwise)</code> 로 돌린 뒤 템플릿 매칭과 ORB 를 비교하세요.</p><ul><li>템플릿 매칭 → 회전 덕분에 0° 가 된 <b>다른</b> 부품(#4)을 찾는다</li><li>ORB + H → 같은 #1 부품, 기준점 정답 <b>(369, 120)</b></li></ul>', starter: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene0 = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var scene = new Mat();
        Cv2.Rotate(scene0, scene, RotateFlags.Rotate90Clockwise);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        // TODO ①: 템플릿 매칭 결과 출력
        // TODO ②: ORB + FindHomography 로 (92,82) 투영 출력
    }
}`, solution: `using System;
using System.Linq;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var scene0 = Cv2.ImRead("images/parts_scene.png", ImreadModes.Grayscale);
        using var scene = new Mat();
        Cv2.Rotate(scene0, scene, RotateFlags.Rotate90Clockwise);
        using var t0 = Cv2.ImRead("images/part_template.png", ImreadModes.Grayscale);
        using var res = new Mat();
        Cv2.MatchTemplate(scene, t0, res, TemplateMatchModes.CCoeffNormed);
        Cv2.MinMaxLoc(res, out _, out double mx, out _, out Point px);
        Console.WriteLine($"[템플릿] {mx:F3} @ ({px.X + 60},{px.Y + 50})");

        using var tmpl = new Mat();
        Cv2.CopyMakeBorder(t0, tmpl, 32, 32, 32, 32, BorderTypes.Replicate);
        using var orb = ORB.Create(1000);
        using var dT = new Mat();
        using var dS = new Mat();
        orb.DetectAndCompute(tmpl, null, out KeyPoint[] kT, dT);
        orb.DetectAndCompute(scene, null, out KeyPoint[] kS, dS);
        using var bf = new BFMatcher(NormTypes.Hamming, crossCheck: true);
        var g = bf.Match(dT, dS).OrderBy(m => m.Distance).Take(20).ToArray();
        using var H = Cv2.FindHomography(g.Select(m => kT[m.QueryIdx].Pt).ToArray(),
                                         g.Select(m => kS[m.TrainIdx].Pt).ToArray(),
                                         HomographyMethods.Ransac, 3);
        var p = Cv2.PerspectiveTransform(new Point2f[] { new Point2f(92, 82) }, H)[0];
        Console.WriteLine($"[ORB] ({p.X:F1},{p.Y:F1})  (정답 369,120)");
    }
}`, notes: '<p>템플릿 매칭이 <b>0.996 이라는 높은 점수</b>를 내는 것이 함정입니다 — 점수가 높아도 <b>원하는 물체가 아닐 수</b> 있습니다. 위치를 확인해야 하는 이유. ORB 는 (370.7, 117.9) 로 정답 (369, 120) 에 근접. 💬 “점수만 믿으면 안 되는 이유는?” 로 마무리하세요. (12분)</p>' },
          { layout: 'summary', title: '14차시 정리', bullets: ['특징점(코너) + 기술자(주변 모습 요약) → 회전 · 크기가 바뀌어도 짝지을 수 있다', 'ORB = FAST 코너 + 방향 + 회전 보정 BRIEF, 기술자는 <b>32바이트(256비트)</b>', '<code>BFMatcher(NormTypes.Hamming, crossCheck: true)</code> → <code>DMatch[]</code> (Distance 로 정렬)', '작은 템플릿에는 <code>CopyMakeBorder</code> 로 <b>여백</b>을 붙인다', '<code>FindHomography(…Ransac)</code> + <code>PerspectiveTransform</code> → 위치 · 회전 · 배율', '<b>인라이어 개수</b>가 신뢰도 — 10개 미만이면 “못 찾았다”', 'QR 은 <code>QRCodeDetector().DetectAndDecode</code> 한 줄', '다음: 사진 한 장이 아니라 <b>움직이는 영상</b> — VideoCapture (15차시)'], notes: '<p>여덟 줄을 정리합니다. 과제: 실습 1(nFeatures)과 <code>chip_rotated.png</code> 에 ORB 를 적용해 특징점을 관찰. 다음 차시 예고: “컨베이어 위를 지나가는 부품을 <b>한 번만</b> 세려면?” 을 질문으로 남기세요. (3분)</p>' }
        ]
      }
    ]
  });
})();
