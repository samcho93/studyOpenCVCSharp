using System.IO;   // WPF 프로젝트에서는 System.IO 가 암시적 using 에 들어가지 않으므로 직접 적습니다
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
}
