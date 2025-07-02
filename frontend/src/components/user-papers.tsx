import { useState, useEffect } from "react";
import { PaperGrid } from "./paper-grid";

export function UserPapers() {
  const [papers, setPapers] = useState([]);

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

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/papers/saved", {
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
      const response = await fetch("http://localhost:3000/api/papers/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          paper,
        ),
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

const PaperGridProps = {
    papers: papers,
    handleSavePaper: handleSavePaper,
};
    if (papers.length === 0) {
        return <div>No saved papers found.</div>;
    }
  return (
    <PaperGrid {...PaperGridProps}/>
  );
}
