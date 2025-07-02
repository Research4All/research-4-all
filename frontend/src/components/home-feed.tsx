import { useState, useEffect } from "react";
import { PaperGrid } from "./paper-grid";

const BACKEND_URL = import.meta.env.BACKEND_URL || "http://localhost:3000";

export function HomeFeed() {
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
        const response = await fetch(`${BACKEND_URL}/api/papers/`);
        const data = await response.json();
        setPapers(data.data);
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
        body: JSON.stringify(
          paper,
        ),
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

const PaperGridProps = {
    papers: papers,
    handleSavePaper: handleSavePaper,
};
  return (
    <>
    <div className="font-bold m-4">Recommended Papers</div>
    <PaperGrid {...PaperGridProps}/>
    </>
  );
}
