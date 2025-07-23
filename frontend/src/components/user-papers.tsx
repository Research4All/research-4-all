import { useState, useEffect } from "react";
import { PaperGrid } from "./paper-grid";
import { PaperSearchSort } from "./paper-search-sort";
import { filterAndSortPapers } from "@/utils/paper-utils";
import type { Paper } from "@/types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function UserPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Newest");

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/papers/saved`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();
        setPapers(data.savedPapers || []);
      } catch (error) {
        console.error("Error fetching papers:", error);
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
    } catch {
      throw new Error("Error saving paper");
      return undefined;
    }
  };

  const filteredAndSortedPapers = filterAndSortPapers(papers, search, sortBy);

  if (filteredAndSortedPapers.length === 0) {
    return <div>No saved papers found.</div>;
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
