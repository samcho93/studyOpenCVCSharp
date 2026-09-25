using OpenCvSharp;

namespace Ch17_Inspection.Inspectors;

/// <summary>
/// 색 분류 검사기 (병뚜껑 색별 개수 세기).
///
/// 흐름: BGR → HSV → 색마다 InRange 마스크 → 모폴로지 열기 → 윤곽선 → 면적 필터 → 색별 개수
/// HSV 는 H(색상) 0~179, S(채도) 0~255, V(명도) 0~255 입니다. 흰색은 채도가 낮아 H 로 구분할 수 없으므로
/// "채도가 낮고 밝다" 는 조건으로 따로 판정합니다.
/// </summary>
public sealed class ColorSortInspector : IInspector
{
    /// <summary>색 하나의 정의: 이름 · HSV 하한/상한(두 번째 범위는 빨강처럼 H 가 0 을 넘어갈 때만 사용) · 오버레이에 쓸 색</summary>
    private sealed record ColorSpec(string Name, Scalar Lower, Scalar Upper, Scalar? Lower2, Scalar? Upper2, Scalar Draw);

    // color_caps.png 의 5색 기준. H 는 0~179 (OpenCV 는 색상 각도를 절반으로 저장)
    private static readonly ColorSpec[] Colors =
    {
        new("빨강",   new Scalar(  0,  90,  60), new Scalar(  8, 255, 255),
                      new Scalar(170,  90,  60), new Scalar(179, 255, 255), Scalar.Red),
        new("노랑",   new Scalar( 18,  90,  60), new Scalar( 35, 255, 255), null, null, Scalar.Yellow),
        new("초록",   new Scalar( 40,  70,  50), new Scalar( 85, 255, 255), null, null, Scalar.Lime),
        new("파랑",   new Scalar( 95,  90,  50), new Scalar(130, 255, 255), null, null, Scalar.DodgerBlue),
        new("흰색",   new Scalar(  0,   0, 170), new Scalar(179,  60, 255), null, null, Scalar.White),
    };

    public string Name => "색 분류 (HSV InRange)";

    public bool NeedsGolden => false;

    /// <summary>이보다 작은 덩어리는 잡음으로 버립니다 (픽셀 면적).</summary>
    public int MinArea { get; set; } = 400;

    /// <summary>기대 총 개수. 0 이면 개수 판정을 하지 않습니다.</summary>
    public int ExpectedTotal { get; set; }

    public InspectionResult Inspect(Mat image, Mat? golden)
    {
        using Mat bgr = MatHelper.ToBgr(image);
        using var hsv = new Mat();
        Cv2.CvtColor(bgr, hsv, ColorConversionCodes.BGR2HSV);

        using Mat element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));

        Mat overlay = bgr.Clone();
        var items = new List<InspectionItem>();
        int total = 0;

        foreach (ColorSpec spec in Colors)
        {
            using var mask = new Mat();
            Cv2.InRange(hsv, spec.Lower, spec.Upper, mask);

            // 빨강처럼 H 가 0 을 넘어가는 색은 범위 두 개를 OR 로 합칩니다.
            if (spec.Lower2 != null && spec.Upper2 != null)
            {
                using var mask2 = new Mat();
                Cv2.InRange(hsv, spec.Lower2.Value, spec.Upper2.Value, mask2);
                Cv2.BitwiseOr(mask, mask2, mask);
            }

            // 톱니 무늬 · 하이라이트로 생긴 구멍과 점을 정리
            Cv2.MorphologyEx(mask, mask, MorphTypes.Open, element);
            Cv2.MorphologyEx(mask, mask, MorphTypes.Close, element);

            Cv2.FindContours(mask, out Point[][] contours, out _,
                             RetrievalModes.External, ContourApproximationModes.ApproxSimple);

            int count = 0;
            foreach (Point[] contour in contours)
            {
                if (Cv2.ContourArea(contour) < MinArea)
                    continue;
                count++;

                Cv2.MinEnclosingCircle(contour, out Point2f center, out float radius);
                var org = new Point((int)center.X, (int)center.Y);
                Cv2.Circle(overlay, org, (int)radius, spec.Draw, 2);
                MatHelper.PutLabel(overlay, spec.Name, new Point(org.X - 16, org.Y + 5), spec.Draw, 0.5);
            }

            total += count;
            items.Add(new InspectionItem(spec.Name, $"{count} 개"));
        }

        bool isOk = ExpectedTotal <= 0 || total == ExpectedTotal;
        string summary = ExpectedTotal <= 0
            ? $"총 {total} 개 (기대 개수 미설정)"
            : $"총 {total} 개 / 기대 {ExpectedTotal} 개";

        items.Insert(0, new InspectionItem("총 개수", $"{total} 개",
                                           ExpectedTotal <= 0 ? "-" : (isOk ? "OK" : "NG")));

        MatHelper.PutJudge(overlay, isOk);
        return new InspectionResult(isOk, summary, overlay, items);
    }
}
