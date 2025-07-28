import { useState, useEffect } from "react";
import { PaperGrid } from "./paper-grid";
import { PaperSearchSort } from "./paper-search-sort";
import { filterAndSortPapers } from "@/utils/paper-utils";
import { Spinner } from "@/components/ui/spinner";
import type { Paper } from "@/types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function UserPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Newest");

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BACKEND_URL}/api/papers/saved`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          const papersWithSavedStatus = (data.savedPapers || []).map((paper: Paper) => ({
            ...paper,
            saved: true
          }));
          setPapers(papersWithSavedStatus);
        } else {
          setError("Failed to fetch saved papers");
        }
      } catch (error) {
        console.error("Error fetching papers:", error);
        setError("Failed to fetch saved papers. Please try again later.");
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
          setPapers(papers.filter(p => p.paperId !== paper.paperId));
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
      <div className="flex flex-col gap-4">
        <div className="font-bold ml-4">My Papers</div>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" text="Loading your saved papers..." showText />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="font-bold ml-4">My Papers</div>
        <div className="text-red-500 text-center p-4">{error}</div>
        {papers.length > 0 && (
          <>
            <PaperSearchSort
              search={search}
              setSearch={setSearch}
              sortBy={sortBy}
              setSortBy={setSortBy}
              showScoreSort={false}
            />
            <PaperGrid papers={filteredAndSortedPapers} handleSavePaper={handleSavePaper} itemsPerPage={12} showLoadMore={true} />
          </>
        )}
      </div>
    );
  }

  if (filteredAndSortedPapers.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="font-bold ml-4">My Papers</div>
        <div className="text-center text-gray-500 p-8">No saved papers found.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="font-bold ml-4">My Papers</div>
      
      <PaperSearchSort
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showScoreSort={false}
      />

      <PaperGrid papers={filteredAndSortedPapers} handleSavePaper={handleSavePaper} itemsPerPage={12} showLoadMore={true} />
    </div>
  );
}
