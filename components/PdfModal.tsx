

import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import HTMLFlipBook from 'react-pageflip';
import JSZip from 'jszip';
import { XIcon, DocumentArrowDownIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;

interface PdfModalProps {
    title: string;
    url: string;
    onClose: () => void;
}

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode; number: number }>(({ children, number }, ref) => (
    <div className="flex items-center justify-center bg-white" ref={ref} data-density="hard">
        <div className="w-full h-full flex items-center justify-center relative">
            {children}
            <div className="absolute bottom-2 text-center text-xs text-gray-400">{number}</div>
        </div>
    </div>
));

const FlipBook = HTMLFlipBook as any;

const PdfModal: React.FC<PdfModalProps> = ({ title, url, onClose }) => {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState('');
    const flipBook = useRef<any>(null);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const renderPdfToImages = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;
                const numPages = pdf.numPages;
                const urls: string[] = [];

                for (let i = 1; i <= numPages; i++) {
                    setProgress(`Rendering page ${i} of ${numPages}...`);
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d', { alpha: false });
                    if (!context) continue;

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: context, viewport, background: 'rgba(255,255,255,1)' } as any).promise;
                    urls.push(canvas.toDataURL('image/png'));
                }
                setImageUrls(urls);
            } catch (error) {
                console.error("Failed to render PDF:", error);
                setProgress('Error: Could not load document.');
            } finally {
                setIsLoading(false);
            }
        };
        renderPdfToImages();
    }, [url]);

    const handleFlip = useCallback((e: any) => setCurrentPage(e.data), []);
    const prevPage = () => flipBook.current?.pageFlip()?.flipPrev();
    const nextPage = () => flipBook.current?.pageFlip()?.flipNext();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowLeft') prevPage();
            if (event.key === 'ArrowRight') nextPage();
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleDownloadPdf = () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        a.click();
    };

    return (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={onClose}
          aria-modal="true" role="dialog"
        >
          <style>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
          <div className="w-full h-full flex flex-col items-center justify-center gap-4" onClick={e => e.stopPropagation()}>
            <header className="w-full max-w-6xl flex justify-between items-center text-white px-2">
                <h3 className="text-lg font-semibold truncate" title={title}>{title}</h3>
                <button onClick={onClose} aria-label="Close viewer" className="p-2 rounded-full hover:bg-white/20 transition-colors"><XIcon className="w-6 h-6" /></button>
            </header>
            
            <div className="w-full max-w-6xl aspect-[2/1.414] relative bg-gray-800 rounded-lg shadow-2xl flex items-center justify-center">
                {isLoading && (
                    <div className="text-center text-white">
                        <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4">{progress || 'Loading PDF...'}</p>
                    </div>
                )}
                {!isLoading && imageUrls.length > 0 && (
                    <>
                        <FlipBook
                            width={500} height={707} size="stretch"
                            minWidth={315} maxWidth={1000} minHeight={420} maxHeight={1414}
                            maxShadowOpacity={0.5} showCover={true} mobileScrollSupport={true}
                            onFlip={handleFlip} className="shadow-2xl" ref={flipBook}
                        >
                            {imageUrls.map((url, index) => (
                                <Page number={index + 1} key={index}>
                                    <img src={url} alt={`Page ${index + 1}`} className="w-full h-full object-contain" />
                                </Page>
                            ))}
                        </FlipBook>
                        <button onClick={prevPage} className="absolute top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white backdrop-blur-sm rounded-full w-11 h-11 flex items-center justify-center hover:bg-black/60 transition-colors left-4" aria-label="Previous Page"><ChevronLeftIcon className="w-6 h-6" /></button>
                        <button onClick={nextPage} className="absolute top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white backdrop-blur-sm rounded-full w-11 h-11 flex items-center justify-center hover:bg-black/60 transition-colors right-4" aria-label="Next Page"><ChevronRightIcon className="w-6 h-6" /></button>
                    </>
                )}
            </div>

            <footer className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-lg p-2 flex items-center justify-center gap-2 border border-white/20">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 px-4 w-32 text-center">
                    {!isLoading && imageUrls.length > 0 ? `Page ${currentPage + 1} of ${imageUrls.length}`: '...'}
                </span>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                <button onClick={handleDownloadPdf} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700" title="Download Original PDF"><DocumentArrowDownIcon className="w-5 h-5"/></button>
            </footer>
          </div>
        </div>
    );
};

export default PdfModal;