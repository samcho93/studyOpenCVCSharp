using OpenCvSharp;

namespace Ch17_Inspection.Inspectors;

/// <summary>
/// 개수 세기 검사기.
///
/// 흐름: 흑백 → 블러 → Otsu 이진화(밝기 방향 자동 판단) → 모폴로지 열기 → 윤곽선 → 면적 필터 → 번호 붙이기
/// 기대 개수(ExpectedCount)가 0 보다 크면 검출 개수와 비교해 OK / NG 를 판정합니다.
/// </summary>
public sealed class CountInspector : IInspector
{
    public string Name => "개수 세기 (Otsu + 윤곽선)";

    public bool NeedsGolden => false;

    /// <summary>이보다 작은 덩어리는 잡음으로 보고 버립니다 (픽셀 면적).</summary>
    public int MinArea { get; set; } = 300;

    /// <summary>기대 개수. 0 이면 개수 판정을 하지 않고 검출 결과만 보여 줍니다.</summary>
    public int ExpectedCount { get; set; }

    public InspectionResult Inspect(Mat image, Mat? golden)
    {
        // 1) 흑백 + 블러 — 잡음이 윤곽선 개수를 늘리는 것을 막습니다.
        using Mat gray = MatHelper.ToGray(image);
        using var blurred = new Mat();
        Cv2.GaussianBlur(gray, blurred, new Size(5, 5), 0);

        // 2) Otsu 이진화. 물체가 어두운 영상(백라이트 실루엣)도 있으므로 방향을 자동으로 맞춥니다.
        using var bin = new Mat();
        Cv2.Threshold(blurred, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        double whiteRatio = Cv2.CountNonZero(bin) / (double)(bin.Rows * bin.Cols);
        if (whiteRatio > 0.5)
            Cv2.BitwiseNot(bin, bin);   // 흰 부분이 절반을 넘으면 그것은 배경이다 → 반전

        // 3) 모폴로지 열기로 작은 점 잡음 제거
        using Mat element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(3, 3));
        Cv2.MorphologyEx(bin, bin, MorphTypes.Open, element);

        // 4) 바깥 윤곽선만 찾아 면적으로 걸러 냅니다 (구멍은 세지 않음).
        Cv2.FindContours(bin, out Point[][] contours, out _,
                         RetrievalModes.External, ContourApproximationModes.ApproxSimple);

        var found = new List<(Rect Rect, double Area, Point Center)>();
        foreach (Point[] contour in contours)
        {
            double area = Cv2.ContourArea(contour);
            if (area < MinArea)
                continue;
            Rect rect = Cv2.BoundingRect(contour);
            found.Add((rect, area, new Point(rect.X + rect.Width / 2, rect.Y + rect.Height / 2)));
        }

        // 번호를 위 → 아래, 왼쪽 → 오른쪽 순서로 붙이기 위해 정렬 (같은 줄은 60 px 로 묶음)
        found.Sort((a, b) =>
        {
            int rowA = a.Center.Y / 60, rowB = b.Center.Y / 60;
            return rowA != rowB ? rowA.CompareTo(rowB) : a.Center.X.CompareTo(b.Center.X);
        });

        // 5) 오버레이에 번호 · 사각형 그리기
        Mat overlay = MatHelper.ToBgr(image);
        var items = new List<InspectionItem>();
        for (int i = 0; i < found.Count; i++)
        {
            (Rect rect, double area, Point center) = found[i];
            Cv2.Rectangle(overlay, rect, Scalar.Lime, 2);
            MatHelper.PutLabel(overlay, $"{i + 1}", new Point(rect.X, rect.Y - 6), Scalar.Lime);

            double diameter = 2 * Math.Sqrt(area / Math.PI);   // 등가 원 지름
            items.Add(new InspectionItem(
                $"#{i + 1}",
                $"중심 ({center.X}, {center.Y}) · 면적 {area:F0} px² · 등가지름 {diameter:F1} px"));
        }

        bool isOk = ExpectedCount <= 0 || found.Count == ExpectedCount;
        string summary = ExpectedCount <= 0
            ? $"검출 {found.Count} 개 (기대 개수 미설정)"
            : $"검출 {found.Count} 개 / 기대 {ExpectedCount} 개";

        // 표 맨 위에 요약 두 줄
        items.Insert(0, new InspectionItem("검출 개수", $"{found.Count} 개",
                                           ExpectedCount <= 0 ? "-" : (isOk ? "OK" : "NG")));
        items.Insert(1, new InspectionItem("면적 하한", $"{MinArea} px²"));

        MatHelper.PutJudge(overlay, isOk);
        return new InspectionResult(isOk, summary, overlay, items);
    }
}
