import { useState, useRef } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import { AnnotateMenu } from "./AnnotateMenu";
import type { AnnotateMenuRef } from "./AnnotateMenu";


import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFRendererProps {
  pdfUrl: string;
  paperId?: string;
}

const PDFRenderer = ({ pdfUrl, paperId }: PDFRendererProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const annotateMenuRef = useRef<AnnotateMenuRef>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setTimeout(() => {
      annotateMenuRef.current?.handleTextLayerReady();
    }, 1000);
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
    <div className="flex flex-col h-screen bg-gray-100">
      <AnnotateMenu ref={annotateMenuRef} paperId={paperId} />
      <div className="flex-1 flex justify-center overflow-auto py-8">
        <div className="bg-white shadow-lg overflow-auto">
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
              scale={1.2}
              className="shadow-md"
            />
          </Document>
        </div>
      </div>

      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4 bg-white border-t shadow-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="cursor-pointer px-6 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= numPages}
            className="cursor-pointer px-6 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export { PDFRenderer };
