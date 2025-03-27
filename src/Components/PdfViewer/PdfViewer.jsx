import React, { useEffect, useState } from "react";
import {
  Worker,
  Viewer,
  ScrollMode,
  SpecialZoomLevel,
} from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";

import right from "../../Assets/svg/right.svg";
import left from "../../Assets/svg/left.svg";
import Loader from "../../Components/Loader/Loader";

import "./PdfViewer.css";

const WORKER_URL = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
const PDF_URL =
  "https://s3.regru.cloud/cybapp-s3/guides//nutrition/belki.pdf-b2ccdfc5ae599ebe60da0135f2a6b1a27ed59766f27556f458b52a069d7f3a97.pdf";

export default function PdfViewer() {
  const [pdfUrl, setPdfUrl] = useState(null);

  const pageNavigationPluginInstance = pageNavigationPlugin();

  const { jumpToNextPage, jumpToPreviousPage, CurrentPageLabel } =
    pageNavigationPluginInstance;

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch(PDF_URL);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error("Error fetching PDF:", err);
      }
    };

    fetchPdf();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, []);

  return (
    <div className="pdfViewerContainer">
      {!pdfUrl && <Loader />}

      {pdfUrl && (
        <>
          <Worker workerUrl={WORKER_URL}>
            <Viewer
              defaultScale={SpecialZoomLevel.PageFit}
              scrollMode={ScrollMode.Page}
              fileUrl={pdfUrl}
              enableSmoothScroll={false}
              plugins={[pageNavigationPluginInstance]}
            />
          </Worker>

          <div className="pdfViewerFooter">
            <div className="pdfViewerFooterInner">
              <CurrentPageLabel>
                {({ currentPage, numberOfPages }) => (
                  <div className="pdfViewerPages">
                    {currentPage + 1} / {numberOfPages}
                  </div>
                )}
              </CurrentPageLabel>

              <div className="pdfViewerButtonsWrapper">
                <button
                  className="pdfViewerButton"
                  onClick={jumpToPreviousPage}
                >
                  <img src={left} />
                </button>

                <button className="pdfViewerButton" onClick={jumpToNextPage}>
                  <img src={right} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
