using OpenCvSharp;

namespace Ch16_ImageStudio;

/// <summary>
/// 되돌리기(Undo) · 다시 실행(Redo) 를 Stack&lt;Mat&gt; 두 개로 관리합니다.
///
///   Current  : 지금 작업 중인 이미지 (필터를 [적용] 하면 이것이 바뀜)
///   _undo    : 이전 상태들 (위가 가장 최근)
///   _redo    : Undo 로 되돌린 상태들
///
/// Mat 은 네이티브 메모리를 쓰므로 스택에서 빠지는 순간 Dispose 해야 합니다.
/// </summary>
public sealed class HistoryManager : IDisposable
{
    private readonly Stack<Mat> _undo = new();
    private readonly Stack<Mat> _redo = new();
    private Mat? _original;   // 처음 연 이미지 (초기화용)

    /// <summary>현재 이미지. 이미지를 열기 전에는 null.</summary>
    public Mat? Current { get; private set; }

    public bool CanUndo => _undo.Count > 0;
    public bool CanRedo => _redo.Count > 0;
    public int UndoCount => _undo.Count;
    public int RedoCount => _redo.Count;

    /// <summary>새 이미지를 열었을 때: 모든 기록을 지우고 first 를 현재 · 원본으로 삼습니다 (first 의 소유권을 넘겨받음).</summary>
    public void Reset(Mat first)
    {
        Clear();
        _original = first.Clone();
        Current = first;
    }

    /// <summary>필터 결과를 새 현재 이미지로 밀어 넣습니다 (next 의 소유권을 넘겨받음). Redo 기록은 사라집니다.</summary>
    public void Push(Mat next)
    {
        if (Current != null)
            _undo.Push(Current);
        Current = next;
        DisposeAll(_redo);
    }

    /// <summary>한 단계 되돌립니다. 되돌릴 것이 없으면 현재 그대로.</summary>
    public Mat? Undo()
    {
        if (!CanUndo || Current == null) return Current;
        _redo.Push(Current);
        Current = _undo.Pop();
        return Current;
    }

    /// <summary>되돌린 것을 다시 실행합니다.</summary>
    public Mat? Redo()
    {
        if (!CanRedo || Current == null) return Current;
        _undo.Push(Current);
        Current = _redo.Pop();
        return Current;
    }

    /// <summary>처음 연 이미지로 되돌립니다 (이 동작도 Undo 로 취소할 수 있게 Push 로 처리).</summary>
    public Mat? RestoreOriginal()
    {
        if (_original == null) return Current;
        Push(_original.Clone());
        return Current;
    }

    private void Clear()
    {
        DisposeAll(_undo);
        DisposeAll(_redo);
        Current?.Dispose();
        Current = null;
        _original?.Dispose();
        _original = null;
    }

    private static void DisposeAll(Stack<Mat> stack)
    {
        while (stack.Count > 0)
            stack.Pop().Dispose();
    }

    public void Dispose() => Clear();
}
