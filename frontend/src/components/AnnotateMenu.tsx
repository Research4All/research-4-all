import { useEffect, useState } from "react";
import { Highlighter, MessageSquareText } from "lucide-react";

const AnnotateMenu = () => {
  const [selection, setSelection] = useState<string>();
  const [position, setPosition] = useState<Record<string, number>>();
  const [range, setRange] = useState<Range>();

  function onSelectStart() {
    setSelection(undefined);
    setRange(undefined);
  }

  function onSelectEnd() {
    const activeSelection = document.getSelection();
    const text = activeSelection?.toString();

    if (!activeSelection || !text) {
      setSelection(undefined);
      setRange(undefined);
      return;
    }

    setSelection(text);
    setRange(activeSelection.getRangeAt(0).cloneRange());

    const rect = activeSelection.getRangeAt(0).getBoundingClientRect();

    setPosition({
      x: rect.left + (rect.width / 2) - (80 / 2), 
      y: rect.top + window.scrollY - 30,
      width: rect.width,
      height: rect.height,
    });
  }

  useEffect(() => {
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("mouseup", onSelectEnd);
    return () => {
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("mouseup", onSelectEnd);
    };
  }, []);

  function onHighlight() {
    if (!range) return;

    document.getSelection()?.removeAllRanges();

    const markElement = document.createElement("mark");
    markElement.className = "highlighted-text";

    try {
      range.surroundContents(markElement);
    } catch (error) {
      const contents = range.extractContents();
      markElement.appendChild(contents);
      range.insertNode(markElement);
    }

    setSelection(undefined);
    setPosition(undefined);
    setRange(undefined);
  }

  return (
    <div role="dialog" aria-labelledby="share" aria-haspopup="dialog">
      {selection && position && (
        <div
          className="
            absolute -top-2 left-0 w-[80px] h-[30px] bg-black text-white rounded m-0 z-50
            flex
          "
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          }}
        >
          <button
            className="flex flex-1 h-full justify-center items-center px-1 hover:bg-gray-700 rounded-l"
            onClick={onHighlight}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <div className="w-px bg-gray-600"></div>
          <button className="flex flex-1 h-full justify-center items-center px-1 hover:bg-gray-700 rounded-r">
            <MessageSquareText className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export { AnnotateMenu };
