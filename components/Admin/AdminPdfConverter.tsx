import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { UploadIcon, ArrowDownTrayIcon } from '../Icons';

// Set up the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;

interface ConvertedPage {
    pageNumber: number;
    dataUrl: string;
}

const AdminPdfConverter: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState('');
    const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const uploadedFile = files[0];
            if (uploadedFile.type === 'application/pdf') {
                setFile(uploadedFile);
                setError(null);
                setConvertedPages([]);
                setProgress('');
            } else {
                setError('Please upload a valid .pdf file.');
            }
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, type: 'enter' | 'leave' | 'over') => {
        e.preventDefault();
        e.stopPropagation();
        if (type === 'enter' || type === 'over') setIsDragging(true);
        else if (type === 'leave') setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files);
        }
    };

    const processPdf = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        setConvertedPages([]);
        setProgress('Starting conversion...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const newPages: ConvertedPage[] = [];

            for (let i = 1; i <= numPages; i++) {
                setProgress(`Processing page ${i} of ${numPages}...`);
                // Yield to the main thread to allow React to update the progress message
                await new Promise(resolve => setTimeout(resolve, 0));
                
                const page = await pdf.getPage(i);
                // Use a higher scale for better quality and higher resolution.
                const viewport = page.getViewport({ scale: 4.0 });
                const canvas = document.createElement('canvas');
                // Use an opaque context for performance gains
                const context = canvas.getContext('2d', { alpha: false });
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                // Disable image smoothing for crisper text and vector graphics
                context.imageSmoothingEnabled = false;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                    // Let pdf.js handle the white background for better compatibility
                    background: 'rgba(255, 255, 255, 1)',
                } as any).promise;

                newPages.push({
                    pageNumber: i,
                    // Use lossless PNG for the best possible quality
                    dataUrl: canvas.toDataURL('image/png')
                });
                setConvertedPages([...newPages]); // Update state incrementally to show progress
            }
            setProgress(`Conversion complete! ${numPages} pages processed.`);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Could not process PDF.";
            setError(`Error: ${errorMessage}`);
            setProgress('');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadZip = async () => {
        if (convertedPages.length === 0) return;

        const zip = new JSZip();
        for (const page of convertedPages) {
            const base64Data = page.dataUrl.split(',')[1];
            // Save as .png to match the high-quality format.
            zip.file(`page_${String(page.pageNumber).padStart(3, '0')}.png`, base64Data, { base64: true });
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        const safeFileName = file?.name.replace(/\.pdf$/i, '').replace(/[^a-z0-9]/gi, '_') || 'converted_pages';
        link.download = `${safeFileName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-gray-100 dark:bg-gray-900/50 border-l-4 border-gray-500 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-4 rounded-r-lg">
                <p className="font-bold">PDF to Image Converter</p>
                <p className="text-sm mt-1">Upload a PDF to convert each page into a high-quality PNG image. You can then download all images as a zip file.</p>
            </div>
            
            <div 
                className={`p-6 border-2 border-dashed rounded-2xl text-center transition-colors ${isDragging ? 'border-gray-500 dark:border-gray-400 bg-gray-200 dark:bg-gray-700/50' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'}`}
                onDragEnter={(e) => handleDragEvents(e, 'enter')}
                onDragLeave={(e) => handleDragEvents(e, 'leave')}
                onDragOver={(e) => handleDragEvents(e, 'over')}
                onDrop={handleDrop}
            >
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                <label htmlFor="pdf-upload" className="mt-2 block text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white cursor-pointer">
                    {file ? 'Change PDF file' : 'Upload a PDF file'}
                    <input ref={fileInputRef} id="pdf-upload" name="pdf-upload" type="file" className="sr-only" accept="application/pdf" onChange={(e) => handleFileChange(e.target.files)} />
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{file ? file.name : 'or drag and drop'}</p>
            </div>

            <button
                onClick={processPdf}
                disabled={!file || isProcessing}
                className="btn btn-primary w-full"
            >
                {isProcessing ? 'Processing...' : 'Convert to Images'}
            </button>

             {progress && <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-300">{progress}</p>}
             {error && <p className="text-center text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

            {convertedPages.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Conversion Results</h3>
                        <button onClick={downloadZip} className="btn btn-primary bg-green-600 hover:bg-green-700">
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Download All as .zip
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 bg-gray-100 dark:bg-gray-900/30 rounded-lg max-h-[500px] overflow-y-auto">
                        {convertedPages.map(page => (
                            <div key={page.pageNumber} className="relative aspect-[8.5/11] bg-white dark:bg-gray-800 rounded-md shadow-md overflow-hidden">
                                <img src={page.dataUrl} alt={`Page ${page.pageNumber}`} className="w-full h-full object-contain" />
                                <div className="absolute bottom-0 right-0 bg-black/60 text-white text-xs font-mono px-1.5 py-0.5 rounded-tl-md">
                                    {page.pageNumber}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPdfConverter;