import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Highlighter, MessageSquareText, X, RotateCcw } from "lucide-react";
import { io, Socket } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface Annotation {
  id?: string;
  text: string;
  comment: string;
  position: { x: number; y: number };
  timestamp: Date;
  range?: {
    startOffset: number;
    endOffset: number;
    nodeData: string;
    nodeHTML: string;
    nodeTagName: string;
  };
  _id?: string;
  userId?: {
    _id: string;
    username: string;
    email: string;
  };
}

interface Highlight {
  id?: string;
  text: string;
  position: { x: number; y: number };
  timestamp: Date;
  range?: {
    startOffset: number;
    endOffset: number;
    nodeData: string;
    nodeHTML: string;
    nodeTagName: string;
  };
  color?: string; // Optional color for different highlight types
  _id?: string;
}

function serializeRange(range: Range) {
  const saveNode = range.startContainer;
  const startOffset = range.startOffset;
  const endOffset = range.endOffset;
  const nodeData =
    saveNode.nodeType === Node.TEXT_NODE ? (saveNode as Text).data : "";
  const parentElement = saveNode.parentElement;
  const nodeHTML = parentElement ? parentElement.innerHTML : "";
  const nodeTagName = parentElement ? parentElement.tagName : "";
  return {
    startOffset,
    endOffset,
    nodeData,
    nodeHTML,
    nodeTagName,
  };
}

function deserializeRange(rangeData: {
  startOffset: number;
  endOffset: number;
  nodeData: string;
  nodeHTML: string;
  nodeTagName: string;
}): Range | null {
  const tagList = Array.from(
    document.getElementsByTagName(rangeData.nodeTagName)
  );

  let foundElement: Element | null = null;
  for (const element of tagList) {
    if (element.innerHTML === rangeData.nodeHTML) {
      foundElement = element;
      break;
    }
  }
  if (!foundElement) {
    // throw new Error("Element not found for deserialization");
    return null;
  }

  let foundNode: ChildNode | null = null;
  for (const node of foundElement.childNodes) {
    if (
      node.nodeType === Node.TEXT_NODE &&
      (node as Text).data === rangeData.nodeData
    ) {
      foundNode = node;
      break;
    }
  }
  if (!foundNode) {
    // throw new Error("Text node not found for deserialization");
    return null;
  }

  const range = document.createRange();
  range.setStart(foundNode, rangeData.startOffset);
  range.setEnd(foundNode, rangeData.endOffset);
  return range;
}

const PAPER_MONGO_ID = "68793152df3083c95ebf1a46"; // placeholder ID for testing

export interface AnnotateMenuRef {
  handleTextLayerReady: () => void;
}

const AnnotateMenu = forwardRef<AnnotateMenuRef, object>((props, ref) => {
  const [selection, setSelection] = useState<string>();
  const [position, setPosition] = useState<Record<string, number>>();
  const [range, setRange] = useState<Range>();
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(
    null
  );
  const [loadedAnnotations, setLoadedAnnotations] = useState<Annotation[]>([]);
  const [loadedHighlights, setLoadedHighlights] = useState<Highlight[]>([]);
  const [textLayerReady, setTextLayerReady] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    async function fetchAnnotations() {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/annotations/paper/${PAPER_MONGO_ID}`,
          { credentials: "include" }
        );
        const data = await response.json();
        const annotations: Annotation[] = (data.annotations || []).map(
          (a: Annotation) => ({
            ...a,
            timestamp: new Date(a.timestamp),
          })
        );
        setLoadedAnnotations(annotations);
      } catch {
        console.error("Failed to fetch annotations");
      }
    }
    async function fetchHighlights() {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/highlights/paper/${PAPER_MONGO_ID}`,
          { credentials: "include" }
        );
        const data = await response.json();
        const highlights: Highlight[] = (data.highlights || []).map(
          (h: Highlight) => ({
            ...h,
            timestamp: new Date(h.timestamp),
          })
        );
        setLoadedHighlights(highlights);
      } catch {
        console.error("Failed to fetch highlights");
      }
    }
    async function fetchCurrentUser() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/status`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.authenticated && data.user) {
          setCurrentUser({
            username: data.user.username,
            email: data.user.email,
          });
        }
      } catch {
        console.error("Failed to fetch current user");
      }
    }
    fetchAnnotations();
    fetchHighlights();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (textLayerReady && loadedAnnotations.length > 0) {
      renderAnnotations(loadedAnnotations);
    }
    if (textLayerReady && loadedHighlights.length > 0) {
      renderHighlights(loadedHighlights);
    }
  }, [textLayerReady, loadedAnnotations, loadedHighlights]);

  useEffect(() => {
    const s = io(BACKEND_URL, { withCredentials: true });
    setSocket(s);
    s.emit("join-document", PAPER_MONGO_ID);

    s.on("annotation-update", ({ annotation }) => {
      setLoadedAnnotations((prev) => [
        ...prev,
        { ...annotation, timestamp: new Date(annotation.timestamp) },
      ]);
    });

    s.on("highlight-update", ({ highlight }) => {
      setLoadedHighlights((prev) => [
        ...prev,
        { ...highlight, timestamp: new Date(highlight.timestamp) },
      ]);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const renderAnnotations = (annotations: Annotation[]) => {
    annotations.forEach((annotation: Annotation) => {
      if (!annotation.range) return;
      const range = deserializeRange(annotation.range);
      if (range) {
        const spanElement = document.createElement("span");
        spanElement.className =
          "annotated-text relative bg-amber-100 border-b-2 border-amber-500 cursor-pointer z-50";
        spanElement.setAttribute(
          "data-annotation-id",
          annotation._id || annotation.id || "temp-id"
        );

        spanElement.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const rect = spanElement.getBoundingClientRect();
          const pdfContainer = document.querySelector(".bg-white.shadow-lg");
          const pdfContainerRect = pdfContainer?.getBoundingClientRect();
          const updatedAnnotation = {
            ...annotation,
            position: {
              x: pdfContainerRect
                ? pdfContainerRect.right + 20
                : rect.right + 20,
              y: rect.top + window.scrollY - 30,
            },
          };
          setActiveAnnotation(updatedAnnotation);
        });

        try {
          range.surroundContents(spanElement);
        } catch {
          const contents = range.extractContents();
          spanElement.appendChild(contents);
          range.insertNode(spanElement);
        }
      }
    });
  };

  const renderHighlights = (highlights: Highlight[]) => {
    highlights.forEach((highlight: Highlight) => {
      if (!highlight.range) return;
      const range = deserializeRange(highlight.range);
      if (range) {
        const markElement = document.createElement("mark");
        markElement.className = "highlighted-text";
        markElement.setAttribute(
          "data-highlight-id",
          highlight._id || highlight.id || "temp-id"
        );
        try {
          range.surroundContents(markElement);
        } catch {
          const contents = range.extractContents();
          markElement.appendChild(contents);
          range.insertNode(markElement);
        }
      }
    });
  };

  const handleTextLayerReady = () => {
    setTextLayerReady(true);
  };

  useImperativeHandle(ref, () => ({
    handleTextLayerReady,
  }));

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
      x: rect.left + rect.width / 2 - 80 / 2,
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

      if (
        target.closest(".annotated-text") ||
        target.closest(".annotation-tooltip")
      ) {
        return;
      }

      setActiveAnnotation(null);
    }

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  function onHighlight() {
    if (!range || !selection || !position) return;

    const serializedRange = serializeRange(range);

    const highlight = {
      text: selection,
      range: serializedRange,
      color: "yellow",
      paperMongoId: PAPER_MONGO_ID,
    };

    fetch(`${BACKEND_URL}/api/highlights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(highlight),
    });

    if (socket) {
      console.log("Emitting highlight update to socket");
      socket.emit("highlight-update", { paperId: PAPER_MONGO_ID, highlight });
    }

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
    const serializedRange = serializeRange(range);

    const annotation: Annotation = {
      text: selection,
      comment: commentText,
      range: serializedRange,
      position: { x: position.x, y: position.y },
      timestamp: new Date(),
      userId: currentUser
        ? {
            _id: "",
            username: currentUser.username,
            email: currentUser.email,
          }
        : undefined,
    };

    fetch(`${BACKEND_URL}/api/annotations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(annotation),
    });

    if (socket) {
      socket.emit("annotation-update", {
        paperId: PAPER_MONGO_ID,
        annotation,
      });
    }

    document.getSelection()?.removeAllRanges();

    const spanElement = document.createElement("span");
    spanElement.className =
      "annotated-text relative bg-amber-100 border-b-2 border-amber-500 cursor-pointer";
    spanElement.setAttribute("data-annotation-id", annotation.id || "temp-id");

    spanElement.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = spanElement.getBoundingClientRect();
      const pdfContainer = document.querySelector(".bg-white.shadow-lg");
      const pdfContainerRect = pdfContainer?.getBoundingClientRect();
      const updatedAnnotation = {
        ...annotation,
        position: {
          x: pdfContainerRect ? pdfContainerRect.right + 20 : rect.right + 20,
          y: rect.top + window.scrollY - 30,
        },
      };

      setActiveAnnotation(updatedAnnotation);
    });

    try {
      range.surroundContents(spanElement);
    } catch {
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

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all annotations and highlights? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const annotationsResponse = await fetch(
        `${BACKEND_URL}/api/annotations/paper/${PAPER_MONGO_ID}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const annotationsData = await annotationsResponse.json();
      const annotations = annotationsData.annotations || [];

      for (const annotation of annotations) {
        await fetch(`${BACKEND_URL}/api/annotations/${annotation._id}`, {
          method: "DELETE",
          credentials: "include",
        });
      }

      const highlightsResponse = await fetch(
        `${BACKEND_URL}/api/highlights/paper/${PAPER_MONGO_ID}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const highlightsData = await highlightsResponse.json();
      const highlights = highlightsData.highlights || [];

      for (const highlight of highlights) {
        await fetch(`${BACKEND_URL}/api/highlights/${highlight._id}`, {
          method: "DELETE",
          credentials: "include",
        });
      }

      setLoadedAnnotations([]);
      setLoadedHighlights([]);
      setActiveAnnotation(null);

      document.querySelectorAll(".highlighted-text").forEach((element) => {
        const parent = element.parentNode;
        if (parent) {
          parent.replaceChild(
            document.createTextNode(element.textContent || ""),
            element
          );
          parent.normalize();
        }
      });

      document.querySelectorAll(".annotated-text").forEach((element) => {
        const parent = element.parentNode;
        if (parent) {
          parent.replaceChild(
            document.createTextNode(element.textContent || ""),
            element
          );
          parent.normalize();
        }
      });

      alert("All highlights and annotations have been reset.");
    } catch (error) {
      console.error("Error resetting annotations and highlights:", error);
      alert(
        "Failed to reset annotations and highlights. Please try again later."
      );
    }
  };

  return (
    <div role="dialog" aria-labelledby="share" aria-haspopup="dialog">
      <div className="fixed top-4 right-0 p-4 z-50">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-lg"
          title="Delete all highlights and annotations"
        >
          Reset
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
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
            className="flex flex-1 h-full justify-center items-center px-1 hover:bg-gray-700 rounded-r z-5000"
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
            <p className="text-sm bg-gray-100 p-2 rounded italic">
              "{selection}"
            </p>
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
            <div>
              <p className="text-xs text-gray-600">
                {activeAnnotation.timestamp.toLocaleString()}
              </p>
              {activeAnnotation.userId && (
                <p className="text-xs text-blue-600 font-medium">
                  by {activeAnnotation.userId.username}{" "}
                </p>
              )}
            </div>
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
});

export { AnnotateMenu };
