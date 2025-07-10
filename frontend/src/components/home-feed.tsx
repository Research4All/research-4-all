import { useState, useEffect } from "react";
import { PaperGrid } from "./paper-grid";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function HomeFeed() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  interface Paper {
    paperId: string;
    title: string;
    abstract?: string;
    url?: string;
    openAccessPdf?: {
      url: string;
      license: string;
      status: string;
    };
    fieldsOfStudy?: string[];
    publicationDate: Date;
    publicationTypes?: string[];
    authors?: string[]; // Optional field for authors
    score?: number; // Optional field for score
  }

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BACKEND_URL}/api/papers/personalized`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setPapers(data.data);
        } else if (response.status === 401) {
          const fallbackResponse = await fetch(`${BACKEND_URL}/api/papers`, {
            method: "GET",
            credentials: "include",
          });
          const fallbackData = await fallbackResponse.json();
          setPapers(fallbackData.data);
        } else {
          throw new Error(`HTTP error, status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching papers:", error);
        setError("Failed to fetch papers. Please try again later.");

        try {
          const fallbackResponse = await fetch(`${BACKEND_URL}/api/papers`, {
            method: "GET",
            credentials: "include",
          });
          const fallbackData = await fallbackResponse.json();
          setPapers(fallbackData.data);
        } catch (fallbackError) {
          console.error("Error fetching fallback papers:", fallbackError);
          setError("Failed to fetch fallback papers. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const handleSavePaper = async (paper: Paper) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/papers/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paper),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save paper");
      }
    } catch (error) {
      console.error("Error saving paper:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading recommended papers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="font-bold m-4">Recommended Papers</div>
      {papers.length > 0 && (papers[0] as Paper).score !== undefined && (
        <div className="text-sm text-gray-500 m-4">
          Papers are sorted by relevance score based on your interests.
        </div>
      )}
      <PaperGrid papers={papers} handleSavePaper={handleSavePaper} />
    </>
  );
}
