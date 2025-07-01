import { useState, useEffect } from "react";

export function PaperGrid() {
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
        const response = await fetch("http://localhost:3000/api/papers/");
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
      console.log("Saving paper:");
      console.log(paper);
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

  return (
    <div>
      <h2>Recommended Papers</h2>
      {papers.length > 0 ? (
        <div className="grid grid-cols-4 gap-4 m-4">
          {papers.map((paper: Paper) => (
            <div key={paper.paperId} className="bg-white rounded shadow p-4">
              <h3 className="font-semibold text-lg mb-2">{paper.title}</h3>
              <p className="text-sm text-gray-600 mb-1">
                Publication Date:{" "}
                {paper.publicationDate ? (
                  <span>
                    {paper.publicationDate instanceof Date
                      ? paper.publicationDate.toLocaleDateString()
                      : paper.publicationDate}
                  </span>
                ) : (
                  <span className="text-gray-400">Unknown</span>
                )}
              </p>
              {paper.openAccessPdf?.url && (
                <a
                  href={paper.openAccessPdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Open Access PDF
                </a>
              )}
                <div className="mt-2">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer w-full"
                  onClick={() => {
                  handleSavePaper(paper);
                  }}
                >
                  Save paper
                </button>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No papers found.</p>
      )}
    </div>
  );
}
