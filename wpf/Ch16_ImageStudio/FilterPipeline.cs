using OpenCvSharp;

namespace Ch16_ImageStudio;

/// <summary>스튜디오가 제공하는 필터 종류</summary>
public enum FilterKind
{
    None,
    Gray,
    GaussianBlur,
    MedianBlur,
    Canny,
    Threshold,
    AdaptiveThreshold,
    Sharpen,
    Sepia,
    Emboss,
    Erode,
    Dilate,
}

/// <summary>슬라이더 하나의 설명: 이름 · 범위 · 기본값 · 소수 자릿수(0 이면 정수)</summary>
public sealed record ParamInfo(string Label, double Min, double Max, double Default, int Decimals = 0, bool Enabled = true);

/// <summary>ListBox 에 보일 필터 항목: 종류 · 표시 이름 · 두 파라미터 설명</summary>
public sealed record FilterInfo(FilterKind Kind, string DisplayName, ParamInfo P1, ParamInfo P2)
{
    public override string ToString() => DisplayName;
}

/// <summary>
/// 순수 OpenCvSharp 처리 로직. WPF 에 의존하지 않으므로 콘솔 · 테스트에서도 그대로 쓸 수 있습니다.
/// 규칙: 입력 src 는 절대 바꾸지 않고, 결과는 항상 새 Mat 으로 돌려준다 (호출한 쪽이 Dispose).
/// </summary>
public static class FilterPipeline
{
    private static readonly ParamInfo Unused = new("(사용 안 함)", 0, 1, 0, 0, Enabled: false);

    /// <summary>필터 목록 (ListBox 의 ItemsSource)</summary>
    public static readonly IReadOnlyList<FilterInfo> Filters = new List<FilterInfo>
    {
        new(FilterKind.None,              "None (원본)",          Unused, Unused),
        new(FilterKind.Gray,              "Gray (흑백)",          Unused, Unused),
        new(FilterKind.GaussianBlur,      "GaussianBlur",         new("커널 크기(홀수)", 1, 51, 7),     new("시그마 (0=자동)", 0, 10, 0, 1)),
        new(FilterKind.MedianBlur,        "MedianBlur",           new("커널 크기(홀수)", 3, 31, 5),     Unused),
        new(FilterKind.Canny,             "Canny (에지)",         new("낮은 임계값", 0, 255, 80),       new("높은 임계값", 0, 255, 160)),
        new(FilterKind.Threshold,         "Threshold (이진화)",    new("임계값", 0, 255, 128),           new("반전 (0/1)", 0, 1, 0)),
        new(FilterKind.AdaptiveThreshold, "AdaptiveThreshold",    new("블록 크기(홀수)", 3, 99, 51),    new("C (빼는 값)", -30, 30, 15)),
        new(FilterKind.Sharpen,           "Sharpen (샤프닝)",      new("강도", 0, 5, 1.5, 1),            new("블러 크기(홀수)", 3, 15, 5)),
        new(FilterKind.Sepia,             "Sepia (세피아)",        new("강도 0~1", 0, 1, 1, 2),          Unused),
        new(FilterKind.Emboss,            "Emboss (엠보스)",       new("밝기 오프셋", 0, 255, 128),      Unused),
        new(FilterKind.Erode,             "Erode (침식)",          new("커널 크기(홀수)", 1, 31, 5),     new("반복 횟수", 1, 5, 1)),
        new(FilterKind.Dilate,            "Dilate (팽창)",         new("커널 크기(홀수)", 1, 31, 5),     new("반복 횟수", 1, 5, 1)),
    };

    public static FilterInfo GetInfo(FilterKind kind) => Filters.First(f => f.Kind == kind);

    /// <summary>
    /// src 에 kind 필터를 적용한 새 Mat 을 돌려줍니다. src 는 1채널(Gray) 또는 3채널(BGR) 8bit.
    /// </summary>
    public static Mat Apply(Mat src, FilterKind kind, double p1, double p2)
    {
        switch (kind)
        {
            case FilterKind.None:
                return src.Clone();

            case FilterKind.Gray:
                return ToGray(src);

            case FilterKind.GaussianBlur:
            {
                int k = Odd(p1, 1);
                var dst = new Mat();
                Cv2.GaussianBlur(src, dst, new Size(k, k), p2);   // sigma 0 → 커널 크기에서 자동 계산
                return dst;
            }

            case FilterKind.MedianBlur:
            {
                var dst = new Mat();
                Cv2.MedianBlur(src, dst, Odd(p1, 3));
                return dst;
            }

            case FilterKind.Canny:
            {
                using var gray = ToGray(src);                     // Canny 는 1채널 입력
                var dst = new Mat();
                Cv2.Canny(gray, dst, p1, p2);
                return dst;
            }

            case FilterKind.Threshold:
            {
                using var gray = ToGray(src);
                var dst = new Mat();
                var type = p2 >= 0.5 ? ThresholdTypes.BinaryInv : ThresholdTypes.Binary;
                Cv2.Threshold(gray, dst, p1, 255, type);
                return dst;
            }

            case FilterKind.AdaptiveThreshold:
            {
                using var gray = ToGray(src);
                var dst = new Mat();
                Cv2.AdaptiveThreshold(gray, dst, 255, AdaptiveThresholdTypes.GaussianC, ThresholdTypes.Binary, Odd(p1, 3), p2);
                return dst;
            }

            case FilterKind.Sharpen:
            {
                // 언샵 마스크: dst = src + 강도 × (src − blur) = (1+강도)·src − 강도·blur
                int k = Odd(p2, 3);
                using var blur = new Mat();
                Cv2.GaussianBlur(src, blur, new Size(k, k), 0);
                var dst = new Mat();
                Cv2.AddWeighted(src, 1 + p1, blur, -p1, 0, dst);
                return dst;
            }

            case FilterKind.Sepia:
            {
                using var bgr = ToBgr(src);
                // 3x3 색 변환 행렬 (입력 · 출력 모두 B, G, R 순서)
                using var kernel = KernelFromArray(new float[,]
                {
                    { 0.131f, 0.534f, 0.272f },   // B'
                    { 0.168f, 0.686f, 0.349f },   // G'
                    { 0.189f, 0.769f, 0.393f },   // R'
                });
                using var sepia = new Mat();
                Cv2.Transform(bgr, sepia, kernel);
                var dst = new Mat();
                Cv2.AddWeighted(bgr, 1 - p1, sepia, p1, 0, dst);   // 강도만큼 원본과 섞기
                return dst;
            }

            case FilterKind.Emboss:
            {
                using var gray = ToGray(src);
                using var kernel = KernelFromArray(new float[,]
                {
                    { -2, -1, 0 },
                    { -1,  1, 1 },
                    {  0,  1, 2 },
                });
                var dst = new Mat();
                Cv2.Filter2D(gray, dst, MatType.CV_8U, kernel, new Point(-1, -1), delta: p1);   // delta 로 중간 회색 오프셋
                return dst;
            }

            case FilterKind.Erode:
            case FilterKind.Dilate:
            {
                int k = Odd(p1, 1);
                int iterations = Math.Max(1, (int)Math.Round(p2));
                using var element = Cv2.GetStructuringElement(MorphShapes.Ellipse, new Size(k, k));
                var dst = new Mat();
                if (kind == FilterKind.Erode)
                    Cv2.Erode(src, dst, element, iterations: iterations);
                else
                    Cv2.Dilate(src, dst, element, iterations: iterations);
                return dst;
            }

            default:
                throw new ArgumentOutOfRangeException(nameof(kind), kind, "알 수 없는 필터");
        }
    }

    // ───────────── 도우미 ─────────────

    /// <summary>슬라이더 값을 min 이상의 홀수 정수로 만듭니다 (블러 · 모폴로지 커널 크기용).</summary>
    private static int Odd(double value, int min)
    {
        int k = (int)Math.Round(value);
        if (k < min) k = min;
        if (k % 2 == 0) k++;
        return k;
    }

    /// <summary>1채널 복사본. 이미 1채널이면 Clone.</summary>
    public static Mat ToGray(Mat src)
    {
        if (src.Channels() == 1) return src.Clone();
        var gray = new Mat();
        Cv2.CvtColor(src, gray, src.Channels() == 4 ? ColorConversionCodes.BGRA2GRAY : ColorConversionCodes.BGR2GRAY);
        return gray;
    }

    /// <summary>3채널 복사본. 이미 3채널이면 Clone.</summary>
    public static Mat ToBgr(Mat src)
    {
        if (src.Channels() == 3) return src.Clone();
        var bgr = new Mat();
        Cv2.CvtColor(src, bgr, src.Channels() == 4 ? ColorConversionCodes.BGRA2BGR : ColorConversionCodes.GRAY2BGR);
        return bgr;
    }

    /// <summary>2차원 float 배열 → CV_32FC1 커널 Mat</summary>
    private static Mat KernelFromArray(float[,] values)
    {
        int rows = values.GetLength(0), cols = values.GetLength(1);
        var kernel = new Mat(rows, cols, MatType.CV_32FC1);
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                kernel.Set(r, c, values[r, c]);
        return kernel;
    }
}
