import { useEffect, useState } from "react";
import { Highlighter, MessageSquareText, X } from "lucide-react";

interface Annotation {
  id: string;
  text: string;
  comment: string;
  position: { x: number; y: number };
  timestamp: Date;
}

const AnnotateMenu = () => {
  const [selection, setSelection] = useState<string>();
  const [position, setPosition] = useState<Record<string, number>>();
  const [range, setRange] = useState<Range>();
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);

  function onSelectStart() {
    if (!showCommentBox) {
      setSelection(undefined);
      setRange(undefined);
    }
  }

  function onSelectEnd() {
    if (showCommentBox) return;

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
  }, [showCommentBox]);

  // Close the annotation menu when clicking outside of it
  useEffect(() => {
    function handleDocumentClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      
      if (target.closest('.annotated-text') || target.closest('.annotation-tooltip')) {
        return;
      }
      
      setActiveAnnotation(null);
    }

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
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

  function onComment() {
    if (!selection || !position || !range) return;
    setShowCommentBox(true);
  }

  function onSaveComment() {
    if (!selection || !position || !commentText.trim() || !range) return;

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      text: selection,
      comment: commentText,
      position: { x: position.x, y: position.y },
      timestamp: new Date(),
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    
    document.getSelection()?.removeAllRanges();
    
    const spanElement = document.createElement("span");
    spanElement.className = "annotated-text relative";
    spanElement.setAttribute("data-annotation-id", newAnnotation.id);
    spanElement.style.backgroundColor = "#fef3c7";
    spanElement.style.borderBottom = "2px solid #f59e0b";
    spanElement.style.cursor = "pointer";

    spanElement.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = spanElement.getBoundingClientRect();
      const pdfContainer = document.querySelector('.bg-white.shadow-lg');
      const pdfContainerRect = pdfContainer?.getBoundingClientRect();
      const updatedAnnotation = {
        ...newAnnotation,
        position: {
          x: pdfContainerRect ? pdfContainerRect.right + 20 : rect.right + 20,
          y: rect.top + window.scrollY - 30
        }
      };
      
      setActiveAnnotation(updatedAnnotation);
    });

    try {
      range.surroundContents(spanElement);
    } catch (error) {
      const contents = range.extractContents();
      spanElement.appendChild(contents);
      range.insertNode(spanElement);
    }

    setSelection(undefined);
    setPosition(undefined);
    setRange(undefined);
    setShowCommentBox(false);
    setCommentText("");
  }

  function onCancelComment() {
    setShowCommentBox(false);
    setCommentText("");
  }

  

  return (
    <div role="dialog" aria-labelledby="share" aria-haspopup="dialog">
      {selection && position && !showCommentBox && (
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
          <button 
            className="flex flex-1 h-full justify-center items-center px-1 hover:bg-gray-700 rounded-r"
            onClick={onComment}
            title="Add Comment"
          >
            <MessageSquareText className="w-4 h-4" />
          </button>
        </div>
      )}

      {showCommentBox && position && (
        <div
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 z-[60]"
          style={{
            transform: `translate3d(${position.x}px, ${position.y + 40}px, 0)`,
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Add Comment</h3>
            <button
              onClick={onCancelComment}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-2">Selected text:</p>
            <p className="text-sm bg-gray-100 p-2 rounded italic">"{selection}"</p>
          </div>

          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add your comment..."
            className="w-full h-20 p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={onCancelComment}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onSaveComment}
              disabled={!commentText.trim()}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {activeAnnotation && (
        <div
          className="annotation-tooltip absolute bg-yellow-100 border border-yellow-300 rounded-lg shadow-lg p-3 w-64 z-[70] pointer-events-auto"
          style={{
            transform: `translate3d(${activeAnnotation.position.x}px, ${activeAnnotation.position.y}px, 0)`,
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-600">
              {activeAnnotation.timestamp.toLocaleString()}
            </p>
            <button
              onClick={() => setActiveAnnotation(null)}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-sm font-medium mb-2">"{activeAnnotation.text}"</p>
          <p className="text-sm text-gray-800">{activeAnnotation.comment}</p>
        </div>
      )}
    </div>
  );
};

export { AnnotateMenu };