using OpenCvSharp;

namespace Ch17_Inspection.Inspectors;

/// <summary>결과 표(DataGrid) 의 한 줄: 항목 · 값 · 판정(OK / NG / -)</summary>
public sealed class InspectionItem
{
    public string Item { get; init; } = "";
    public string Value { get; init; } = "";
    public string Judge { get; init; } = "-";

    public InspectionItem() { }

    public InspectionItem(string item, string value, string judge = "-")
    {
        Item = item;
        Value = value;
        Judge = judge;
    }
}

/// <summary>
/// 검사 한 번의 결과. Overlay(결과를 그린 이미지)는 네이티브 메모리이므로 다 쓰면 Dispose 합니다.
/// </summary>
public sealed class InspectionResult : IDisposable
{
    public bool IsOk { get; }
    public string Summary { get; }
    public Mat Overlay { get; }
    public IReadOnlyList<InspectionItem> Items { get; }

    public InspectionResult(bool isOk, string summary, Mat overlay, IReadOnlyList<InspectionItem> items)
    {
        IsOk = isOk;
        Summary = summary;
        Overlay = overlay;
        Items = items;
    }

    public void Dispose() => Overlay.Dispose();
}

/// <summary>모든 검사기의 공통 인터페이스. WPF 에 의존하지 않는 순수 OpenCvSharp 코드입니다.</summary>
public interface IInspector
{
    /// <summary>ComboBox 에 보일 이름</summary>
    string Name { get; }

    /// <summary>기준(골든) 이미지가 필요한 검사인지</summary>
    bool NeedsGolden { get; }

    /// <summary>
    /// 검사를 실행합니다. image 와 golden 은 바꾸지 않으며, 결과 Overlay 는 새 Mat 입니다.
    /// 입력이 잘못되면 InvalidOperationException, OpenCV 처리 실패는 OpenCVException 이 납니다.
    /// </summary>
    InspectionResult Inspect(Mat image, Mat? golden);
}

/// <summary>검사기들이 함께 쓰는 작은 도우미</summary>
internal static class MatHelper
{
    /// <summary>1채널 복사본 (이미 1채널이면 Clone)</summary>
    public static Mat ToGray(Mat src)
    {
        if (src.Channels() == 1) return src.Clone();
        var gray = new Mat();
        Cv2.CvtColor(src, gray, src.Channels() == 4 ? ColorConversionCodes.BGRA2GRAY : ColorConversionCodes.BGR2GRAY);
        return gray;
    }

    /// <summary>3채널 복사본 (오버레이를 색으로 그리기 위해)</summary>
    public static Mat ToBgr(Mat src)
    {
        if (src.Channels() == 3) return src.Clone();
        var bgr = new Mat();
        Cv2.CvtColor(src, bgr, src.Channels() == 4 ? ColorConversionCodes.BGRA2BGR : ColorConversionCodes.GRAY2BGR);
        return bgr;
    }

    /// <summary>번호 · 이름 같은 짧은 글자를 검은 테두리가 있는 글자로 그립니다 (배경이 밝아도 어두워도 보이게).</summary>
    public static void PutLabel(Mat img, string text, Point org, Scalar color, double scale = 0.6)
    {
        Cv2.PutText(img, text, org, HersheyFonts.HersheySimplex, scale, Scalar.Black, 3, LineTypes.AntiAlias);
        Cv2.PutText(img, text, org, HersheyFonts.HersheySimplex, scale, color, 1, LineTypes.AntiAlias);
    }

    /// <summary>
    /// 오버레이 왼쪽 위에 판정 띠(OK 는 초록 · NG 는 빨강)를 그립니다.
    /// Cv2.PutText 는 한글을 그리지 못하므로 띠에는 영문 "OK" / "NG" 만 쓰고,
    /// 자세한 요약은 WPF 화면(TextBlock · DataGrid)에서 한글로 보여 줍니다.
    /// </summary>
    public static void PutJudge(Mat img, bool isOk)
    {
        Scalar color = isOk ? new Scalar(0, 180, 0) : new Scalar(0, 0, 220);   // BGR 순서
        Cv2.Rectangle(img, new Rect(0, 0, img.Width, 44), color, -1);
        Cv2.PutText(img, isOk ? "OK" : "NG", new Point(12, 34),
                    HersheyFonts.HersheyDuplex, 1.1, Scalar.White, 2, LineTypes.AntiAlias);
    }
}
