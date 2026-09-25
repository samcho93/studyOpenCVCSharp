using OpenCvSharp;

namespace Ch17_Inspection.Inspectors;

/// <summary>
/// 결함 검사기 — 골든(기준) 이미지와의 차영상으로 결함을 찾습니다.
///
/// 흐름: 두 이미지를 흑백 · 블러 → Cv2.Absdiff → 임계값(DiffThreshold) → 모폴로지 닫기
///       → 윤곽선 → 면적(MinDefectArea) 으로 걸러 결함 목록 작성
/// 검사 이미지와 골든 이미지는 같은 위치에서 찍혀 크기가 같아야 합니다 (정렬 전제).
/// </summary>
public sealed class DefectInspector : IInspector
{
    public string Name => "결함 검사 (골든 이미지 차영상)";

    public bool NeedsGolden => true;

    /// <summary>
    /// 차영상에서 이 값보다 밝은(= 차이가 큰) 픽셀을 결함 후보로 봅니다 (0~255). 낮추면 민감해집니다.
    /// 강좌 예제(metal_scratch/metal_ok, pcb_board/pcb_golden)에서는 10 이 잘 맞습니다.
    /// </summary>
    public int DiffThreshold { get; set; } = 10;

    /// <summary>이보다 작은 결함 후보는 잡음으로 버립니다 (픽셀 면적).</summary>
    public int MinDefectArea { get; set; } = 20;

    public InspectionResult Inspect(Mat image, Mat? golden)
    {
        if (golden == null)
            throw new InvalidOperationException("결함 검사에는 골든(기준) 이미지가 필요합니다. [골든 열기] 로 기준 영상을 불러오세요.");
        if (golden.Width != image.Width || golden.Height != image.Height)
            throw new InvalidOperationException(
                $"골든 이미지 크기가 다릅니다. 검사 {image.Width}x{image.Height}, 골든 {golden.Width}x{golden.Height}");

        // 1) 두 이미지를 같은 조건(흑백 + 블러)으로 맞춥니다. 블러는 잡음 차이를 줄여 줍니다.
        using Mat grayImage = MatHelper.ToGray(image);
        using Mat grayGolden = MatHelper.ToGray(golden);
        using var a = new Mat();
        using var b = new Mat();
        Cv2.GaussianBlur(grayImage, a, new Size(3, 3), 0);
        Cv2.GaussianBlur(grayGolden, b, new Size(3, 3), 0);

        // 2) 차영상: 밝아진 곳(긁힘)과 어두워진 곳(얼룩) 모두 절댓값으로 잡습니다.
        using var diff = new Mat();
        Cv2.Absdiff(a, b, diff);

        // 3) 임계값 → 이진 마스크 → 닫기로 끊어진 결함을 이어 붙입니다.
        using var mask = new Mat();
        Cv2.Threshold(diff, mask, DiffThreshold, 255, ThresholdTypes.Binary);
        using Mat element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(5, 5));
        Cv2.MorphologyEx(mask, mask, MorphTypes.Close, element);

        // 4) 결함 영역 찾기
        Cv2.FindContours(mask, out Point[][] contours, out _,
                         RetrievalModes.External, ContourApproximationModes.ApproxSimple);

        var defects = new List<(Rect Rect, double Area)>();
        foreach (Point[] contour in contours)
        {
            double area = Cv2.ContourArea(contour);
            if (area < MinDefectArea)
                continue;
            defects.Add((Cv2.BoundingRect(contour), area));
        }

        // 큰 결함이 위에 오도록 정렬
        defects.Sort((x, y) => y.Area.CompareTo(x.Area));

        // 5) 오버레이: 결함마다 빨간 사각형 + 번호(D1, D2 …)
        Mat overlay = MatHelper.ToBgr(image);
        var items = new List<InspectionItem>();
        for (int i = 0; i < defects.Count; i++)
        {
            (Rect rect, double area) = defects[i];
            var draw = new Rect(rect.X - 6, rect.Y - 6, rect.Width + 12, rect.Height + 12);
            Cv2.Rectangle(overlay, draw, Scalar.Red, 2);
            MatHelper.PutLabel(overlay, $"D{i + 1}", new Point(draw.X, draw.Y - 6), Scalar.Red);

            items.Add(new InspectionItem(
                $"D{i + 1}",
                $"위치 ({rect.X}, {rect.Y}) · 크기 {rect.Width}x{rect.Height} · 면적 {area:F0} px²",
                "NG"));
        }

        bool isOk = defects.Count == 0;
        string summary = isOk ? "결함 없음" : $"결함 {defects.Count} 개 발견";

        items.Insert(0, new InspectionItem("결함 개수", $"{defects.Count} 개", isOk ? "OK" : "NG"));
        items.Insert(1, new InspectionItem("차영상 임계값", $"{DiffThreshold} (면적 하한 {MinDefectArea} px²)"));

        MatHelper.PutJudge(overlay, isOk);
        return new InspectionResult(isOk, summary, overlay, items);
    }
}
