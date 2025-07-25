import { useState, useEffect } from "react";
import { PaperGrid } from "./paper-grid";
import { PaperSearchSort } from "./paper-search-sort";
import { filterAndSortPapers } from "@/utils/paper-utils";
import { Spinner } from "@/components/ui/spinner";
import type { Paper } from "@/types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function HomeFeed() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Relevance");

  const checkSavedPapers = async (papersToCheck: Paper[]): Promise<Paper[]> => {
    try {
      const savedResponse = await fetch(`${BACKEND_URL}/api/papers/saved`, {
        method: "GET",
        credentials: "include",
      });
      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        const savedPaperIds = (savedData.savedPapers || []).map((p: Paper) => p.paperId);
        return papersToCheck.map((paper: Paper) => ({
          ...paper,
          saved: savedPaperIds.includes(paper.paperId)
        }));
      }
    } catch {
      throw new Error("Error checking saved papers");
    }
    return papersToCheck.map((paper: Paper) => ({
      ...paper,
      saved: false
    }));
  };

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BACKEND_URL}/api/papers/hybrid`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const papersWithSavedStatus = await checkSavedPapers(data.data);
          setPapers(papersWithSavedStatus);
        } else if (response.status === 401) {
          const fallbackResponse = await fetch(`${BACKEND_URL}/api/papers`, {
            method: "GET",
            credentials: "include",
          });
          const fallbackData = await fallbackResponse.json();
          const papersWithSavedStatus = await checkSavedPapers(fallbackData.data);
          setPapers(papersWithSavedStatus);
        } else {
          throw new Error(`HTTP error, status: ${response.status}`);
        }
      } catch {
        setError("Failed to fetch papers. Please try again later.");

        try {
          const fallbackResponse = await fetch(`${BACKEND_URL}/api/papers`, {
            method: "GET",
            credentials: "include",
          });
          const fallbackData = await fallbackResponse.json();
          const papersWithSavedStatus = await checkSavedPapers(fallbackData.data);
          setPapers(papersWithSavedStatus);
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

    const isCurrentlySaved = paper.saved;
    
    try {
      if (isCurrentlySaved) {
        const response = await fetch(`${BACKEND_URL}/api/papers/delete/${paper.paperId}`, {
          method: "POST",
          credentials: "include",
        });
        if (response.ok) {
          const updatedPaper = { ...paper, saved: false };
          setPapers(papers.map(p => p.paperId === paper.paperId ? updatedPaper : p));
          return updatedPaper;
        } else {
          throw new Error("Failed to unsave paper");
        }
      } else {
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
          const updatedPaper = { ...paper, ...data.paper, saved: true };
          setPapers(papers.map(p => p.paperId === paper.paperId ? updatedPaper : p));
          return updatedPaper;
        } else {
          console.error('Failed to save paper:', response.status, response.statusText, data.error);
          throw new Error(data.error || "Failed to save paper");
        }
      }
    } catch {
      return undefined;
    }
  };

  const filteredAndSortedPapers = filterAndSortPapers(papers, search, sortBy);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" text="Loading recommendations..." showText />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-red-500 text-center">{error}</div>
        {papers.length > 0 && (
          <>
            <PaperSearchSort
              search={search}
              setSearch={setSearch}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            <PaperGrid papers={filteredAndSortedPapers} handleSavePaper={handleSavePaper} itemsPerPage={12} showLoadMore={true} />
          </>
        )}
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
      />

      <PaperGrid papers={filteredAndSortedPapers} handleSavePaper={handleSavePaper} itemsPerPage={12} showLoadMore={true} />
    </>
  );
}
