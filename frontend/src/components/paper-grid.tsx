import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GenericGrid } from './generic-grid';
import { PaperCard } from './paper-card';
import type { Paper } from '@/types';

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || "http://localhost:8000";

interface PaperGridProps {
  papers: Paper[];
  handleSavePaper: (paper: Paper) => Promise<Paper | undefined>;
  itemsPerPage?: number;
  showLoadMore?: boolean;
}

export function PaperGrid({ papers, handleSavePaper, itemsPerPage = 12, showLoadMore = true }: PaperGridProps) {
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

  const renderPaperCard = (paper: Paper) => (
    <PaperCard
      key={paper.paperId}
      paper={paper}
      handleSavePaper={handleSavePaper}
      onOpenModal={openModal}
    />
  );

  return (
    <div>
      <GenericGrid
        items={papers}
        renderItem={renderPaperCard}
        emptyMessage="No papers found."
        gridCols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
        itemsPerPage={itemsPerPage}
        showLoadMore={showLoadMore}
      />

      {showModal && selectedPaper?.openAccessPdf?.url && (
        <div className="fixed inset-0 backdrop-filter backdrop-brightness-75 backdrop-blur-md flex items-center justify-center z-50 p-4">
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
                  Annotate
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