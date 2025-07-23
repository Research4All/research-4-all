import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { PDFRenderer } from "./PDFRenderer";
import type { Paper } from "../types";

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || "http://localhost:8000";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function PDFViewerPage() {
  const { paperId } = useParams();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaper = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/api/papers/saved`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch papers");
        const found = (data.savedPapers || []).find((p: Paper) => p._id === paperId);
        if (!found) throw new Error("Paper not found in your saved papers.");
        setPaper(found);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Unknown error");
        } else {
          setError("Unknown error");
        }
      } finally {
        setLoading(false);
      }
    };
    if (paperId) fetchPaper();
  }, [paperId]);

  if (loading) return <div className="p-8 text-center">Loading paper...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!paper || !paper.openAccessPdf?.url) return <div className="p-8 text-center">PDF not available for this paper.</div>;

  return (
    <div className="h-screen">
      <div className="p-4 text-xl font-bold text-center">{paper.title}</div>
      <PDFRenderer pdfUrl={`${FASTAPI_URL}/proxy-pdf?url=${encodeURIComponent(paper.openAccessPdf.url)}`} />
    </div>
  );
} 