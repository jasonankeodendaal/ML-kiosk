
import React, { useEffect, useRef, useState, useCallback } from 'react';
import JSZip from 'jszip';
import HTMLFlipBook from 'react-pageflip';
import { XIcon, ArrowDownTrayIcon, DocumentArrowDownIcon, ArchiveBoxArrowDownIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';
import LocalMedia from './LocalMedia';

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode; number: number }>(({ children, number }, ref) => {
    return (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800" ref={ref} data-density="hard">
            <div className="w-full h-full flex items-center justify-center relative">
                {children}
                <div className="absolute bottom-2 text-center text-xs text-gray-400 dark:text-gray-500">{number}</div>
            </div>
        </div>
    );
});

const FlipBook = HTMLFlipBook as any;

export const ImageBookletModal: React.FC<{
    title: string;
    imageUrls: string[];
    onClose: () => void;
}> = ({ title, imageUrls, onClose }) => {
    const flipBook = useRef<any>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isGeneratingZip, setIsGeneratingZip] = useState(false);

    const handleFlip = useCallback((e: any) => {
        setCurrentPage(e.data);
    }, []);
    
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

    const handleDownloadSingleImage = async () => {
        const currentUrl = imageUrls[currentPage];
        try {
            const response = await fetch(currentUrl);
            const blob = await response.blob();
            let ext = 'jpg';
            if(blob.type.includes('png')) ext = 'png';

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^a-z0-9]/gi, '_')}-page-${currentPage + 1}.${ext}`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Could not download the image.');
        }
    };
    
    const handleDownloadPdf = async () => {
        if (isGeneratingPdf || isGeneratingZip) return;
        setIsGeneratingPdf(true);
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();

            for (let i = 0; i < imageUrls.length; i++) {
                const url = imageUrls[i];
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.src = url;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                
                const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
                const w = img.width * ratio;
                const h = img.height * ratio;
                const x = (pdfWidth - w) / 2;
                const y = (pdfHeight - h) / 2;
                if (i > 0) doc.addPage();
                doc.addImage(img, 'PNG', x, y, w, h);
            }
            doc.save(`${title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
        } catch (error) {
            alert('Could not generate PDF.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleDownloadZip = async () => {
        if (isGeneratingPdf || isGeneratingZip) return;
        setIsGeneratingZip(true);
        try {
            const zip = new JSZip();
            await Promise.all(imageUrls.map(async (url, i) => {
                const response = await fetch(url);
                const blob = await response.blob();
                let ext = 'jpg';
                if(blob.type.includes('png')) ext = 'png';
                zip.file(`page_${String(i + 1).padStart(3, '0')}.${ext}`, blob);
            }));
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.zip`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Could not generate zip file.');
        } finally {
            setIsGeneratingZip(false);
        }
    };

    const isWorking = isGeneratingPdf || isGeneratingZip;
    const btnClass = (disabled = false) => `p-2 rounded-full transition-colors ${disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`;
    const navBtnClass = "absolute top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white backdrop-blur-sm rounded-full w-11 h-11 flex items-center justify-center hover:bg-black/60 transition-colors";

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
             <style>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
            <div className="w-full h-full flex flex-col items-center justify-center gap-4" onClick={e => e.stopPropagation()}>
                <header className="w-full max-w-6xl flex justify-between items-center text-white px-2">
                    <h3 className="text-lg font-semibold truncate" title={title}>{title}</h3>
                    <button onClick={onClose} aria-label="Close viewer" className="p-2 rounded-full hover:bg-white/20 transition-colors"><XIcon className="w-6 h-6" /></button>
                </header>
                
                <div className="w-full max-w-6xl aspect-[2/1.414] relative">
                     <FlipBook
                        width={500}
                        height={707}
                        size="stretch"
                        minWidth={315}
                        maxWidth={1000}
                        minHeight={420}
                        maxHeight={1414}
                        maxShadowOpacity={0.5}
                        showCover={true}
                        mobileScrollSupport={true}
                        onFlip={handleFlip}
                        className="shadow-2xl"
                        ref={flipBook}
                    >
                        {imageUrls.map((url, index) => (
                             <Page number={index + 1} key={index}>
                                <LocalMedia src={url} alt={`Page ${index + 1}`} type="image" className="w-full h-full object-contain" />
                            </Page>
                        ))}
                    </FlipBook>
                     <button onClick={prevPage} className={`${navBtnClass} left-4`} aria-label="Previous Page"><ChevronLeftIcon className="w-6 h-6" /></button>
                     <button onClick={nextPage} className={`${navBtnClass} right-4`} aria-label="Next Page"><ChevronRightIcon className="w-6 h-6" /></button>
                </div>

                <footer className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-lg p-2 flex items-center justify-center gap-2 border border-white/20">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 px-4 w-32 text-center">Page {currentPage + 1} of {imageUrls.length}</span>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                    <button onClick={handleDownloadSingleImage} className={btnClass(isWorking)} disabled={isWorking} title="Download Current Page"><ArrowDownTrayIcon className="w-5 h-5"/></button>
                    <button onClick={handleDownloadPdf} className={btnClass(isWorking)} disabled={isWorking} title={isGeneratingPdf ? "Generating..." : "Download as PDF"}>{isGeneratingPdf ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : <DocumentArrowDownIcon className="w-5 h-5"/>}</button>
                    <button onClick={handleDownloadZip} className={btnClass(isWorking)} disabled={isWorking} title={isGeneratingZip ? "Generating..." : "Download as ZIP"}>{isGeneratingZip ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : <ArchiveBoxArrowDownIcon className="w-5 h-5"/>}</button>
                </footer>
            </div>
        </div>
    );
};

export default ImageBookletModal;
