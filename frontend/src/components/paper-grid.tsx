import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Paper } from "../types";

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || "http://localhost:8000";

interface PaperGridProps {
  papers: Paper[];
  handleSavePaper: (paper: Paper) => Promise<Paper | undefined>;
}

export function PaperGrid({ papers, handleSavePaper }: PaperGridProps) {
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const openModal = (paper: Paper) => {
    setSelectedPaper(paper);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPaper(null);
  };

  return (
    <div>
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
                <button
                  onClick={() => openModal(paper)}
                  className="text-blue-500 hover:underline cursor-pointer bg-none border-none p-0"
                >
                  View PDF
                </button>
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

      {showModal && selectedPaper?.openAccessPdf?.url && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold truncate pr-4">
                {selectedPaper.title}
              </h2>
              <div className="flex gap-2 items-center">
                <button
                  onClick={async () => {
                    try {
                      const savedPaper = await handleSavePaper(selectedPaper);
                      if (savedPaper && savedPaper._id) {
                        navigate(`/pdf-viewer/${savedPaper._id}`);
                      } else {
                        alert("Could not get paper ID after saving. Please try again.");
                      }
                    } catch (error) {
                      console.error("Error in handleSavePaper:", error);
                      alert("Error saving paper. Please try again.");
                    }
                  }}
                  className="cursor-pointer text-blue-500 hover:text-blue-700 text-base font-semibold border border-blue-500 rounded px-3 py-1 bg-white"
                >
                  Edit
                </button>
                <button
                  onClick={closeModal}
                  className="cursor-pointer text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={`${FASTAPI_URL}/proxy-pdf?url=${encodeURIComponent(selectedPaper.openAccessPdf.url)}`}
                className="w-full h-full border-0"
                title={`PDF: ${selectedPaper.title}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}