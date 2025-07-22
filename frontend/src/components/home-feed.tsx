import { useState, useEffect } from "react";
import { PaperGrid } from "./paper-grid";
import { PaperSearchSort } from "./paper-search-sort";
import { filterAndSortPapers } from "@/utils/paper-utils";
import type { Paper } from "@/types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function HomeFeed() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Relevance");

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
    const paperToSave = {
      ...paper,
      authors: paper.authors
        ? Array.isArray(paper.authors)
          ? paper.authors.map(a => typeof a === "string" ? a : (a as { name: string }).name)
          : []
        : []
    };
    try {
      const response = await fetch(`${BACKEND_URL}/api/papers/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paperToSave),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        if (data.paper) {
          return data.paper;
        }
        const savedResponse = await fetch(`${BACKEND_URL}/api/papers/saved`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const savedData = await savedResponse.json();
        if (savedResponse.ok) {
          const foundPaper = (savedData.savedPapers || []).find((p: Paper) => p.paperId === paper.paperId);
          if (foundPaper) {
            return foundPaper;
          }
        }
      } else {
        throw new Error(data.error || "Failed to save paper");
      }
      return undefined;
    } catch (error) {
      console.error("Error saving paper:", error);
      return undefined;
    }
  };

  const filteredAndSortedPapers = filterAndSortPapers(papers, search, sortBy);

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
      {papers.length > 0 && papers[0].score !== undefined && (
        <div className="text-sm text-gray-500 m-4">
          Papers are sorted by relevance score based on your interests.
        </div>
      )}
      
      <PaperSearchSort
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showScoreSort={true}
      />
      
      <PaperGrid papers={filteredAndSortedPapers} handleSavePaper={handleSavePaper} itemsPerPage={12} showLoadMore={true} />
    </>
  );
}
