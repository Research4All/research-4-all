import { useState, useEffect } from "react";
import { PaperGrid } from "./paper-grid";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function UserPapers() {
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
  }

  const [papers, setPapers] = useState([]);
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
      if (response.ok) {
        console.log("Paper saved successfully:", data);
      }
    } catch (error) {
      console.error("Error saving paper:", error);
    }
  };

  const filteredPapers: Paper[] = papers
    .filter((paper: Paper) =>
      paper.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: Paper, b: Paper) => {
      if (sortBy === "Newest") {
        return (
          new Date(b.publicationDate).getTime() -
          new Date(a.publicationDate).getTime()
        );
      } else if (sortBy === "Oldest") {
        return (
          new Date(a.publicationDate).getTime() -
          new Date(b.publicationDate).getTime()
        );
      } else if (sortBy === "Title A-Z") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "Title Z-A") {
        return b.title.localeCompare(a.title);
      }      
      return 0;   
    });

  const PaperGridProps = {
    papers: filteredPapers,
    handleSavePaper: handleSavePaper,
  };

  if (filteredPapers.length === 0) {
    return <div>No saved papers found.</div>;
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between m-4">
        <Input
          placeholder="Search papers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline"> Sort by: {sortBy} </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
              <DropdownMenuRadioItem value="Newest">
                Newest
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Oldest">
                Oldest
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Title A-Z">Title A-Z</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Title Z-A">Title Z-A</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="font-bold ml-4">My Papers</div>

      <PaperGrid {...PaperGridProps} />
    </div>
  );
}
