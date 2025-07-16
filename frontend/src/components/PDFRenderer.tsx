import { useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import { AnnotateMenu } from "./AnnotateMenu";


import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFRendererProps {
  pdfUrl: string;
}

const PDFRenderer = ({ pdfUrl }: PDFRendererProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // TODO: Use a logger for better error handling
  const handleDocumentLoadError = (error: Error) => {
    console.error("PDF Load Error:", error);
    setError(`Failed to load PDF: ${error.message}`);

    // Debug: Check what the proxy is actually returning
    fetch(pdfUrl)
      .then((response) => {
        console.log("Proxy response status:", response.status);
        console.log("Proxy response headers:", response.headers);
        console.log("Content-Type:", response.headers.get("content-type"));
        return response.text();
      })
      .then((text) => {
        console.log(
          "Proxy response (first 500 chars):",
          text.substring(0, 500)
        );
      })
      .catch((err) => console.error("Failed to fetch proxy response:", err));
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex flex-col items-center">
      <AnnotateMenu />
      <div className="w-full max-w-6xl h-5/6 overflow-auto">
        <Document
          file={pdfUrl}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={handleDocumentLoadError}
          loading={<div>Loading PDF...</div>}
          error={<div>Error loading PDF.</div>}
        >
          <Page
            pageNumber={currentPage}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            width={window.innerWidth * 0.8}
          />
        </Document>
      </div>

      {numPages && numPages > 1 && (
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export { PDFRenderer };
