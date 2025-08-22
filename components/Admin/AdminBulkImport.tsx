
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UploadIcon, DocumentArrowDownIcon } from '../Icons';
import type { Product, Brand } from '../../types';

interface CsvRow {
    name: string;
    sku: string;
    description: string;
    brandName: string;
    images?: string; // Comma-separated
    websiteUrl?: string;
    [key: string]: string | undefined;
}

// A simple CSV parser that handles quoted fields.
function parseCsv(csvText: string): { header: string[], rows: CsvRow[] } {
    const lines = csvText.trim().replace(/\r\n/g, '\n').split('\n');
    if (lines.length < 2) return { header: [], rows: [] };

    const header = lines[0].split(',').map(h => h.trim());
    
    const rows = lines.slice(1).map(line => {
        const values: string[] = [];
        let currentField = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        values.push(currentField);

        const rowObject: Partial<CsvRow> = {};
        header.forEach((key, index) => {
            let value = (values[index] || '').trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            }
            rowObject[key as keyof CsvRow] = value;
        });
        return rowObject as CsvRow;
    });

    return { header, rows };
}


const AdminBulkImport: React.FC = () => {
    const { brands, products, addBrand, addProduct } = useAppContext();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string, summary: string[] } | null>(null);
    
    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            if (files[0].type === 'text/csv' || files[0].name.endsWith('.csv')) {
                setFile(files[0]);
                setResult(null);
            } else {
                alert('Please upload a valid .csv file.');
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

    const handleDownloadTemplate = () => {
        const header = "name,sku,brandName,description,images,websiteUrl";
        const exampleRow1 = `"Serie 6 Freestanding Fridge","KGN39VL31G","Bosch","The NoFrost bottom freezer with VitaFresh plus Box.","https://images.unsplash.com/photo-1.jpg,https://images.unsplash.com/photo-2.jpg","https://www.bosch-home.com/product"`;
        const exampleRow2 = `"13kg Top Loader Washer","DTL154","Defy","Aquawave Drum Technology for a gentle yet effective wash.","https://images.unsplash.com/photo-3.jpg",""`;

        const csvContent = [header, exampleRow1, exampleRow2].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'product_upload_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleProcessFile = async () => {
        if (!file) return;

        setIsProcessing(true);
        setResult(null);

        try {
            const csvData = await file.text();
            const { header, rows } = parseCsv(csvData);

            if (!['name', 'sku', 'brandName', 'description'].every(h => header.includes(h))) {
                throw new Error("Invalid CSV format. Header must include 'name', 'sku', 'brandName', and 'description'.");
            }
            
            let productsAddedCount = 0;
            let productsSkippedCount = 0;
            let brandsAddedCount = 0;
            const summary: string[] = [];

            const newProducts: Product[] = [];
            const newBrands: Brand[] = [];

            // Use Maps for efficient lookups
            const existingSkuMap = new Map(products.map(p => [p.sku.toLowerCase(), p]));
            const brandNameMap: Map<string, Brand> = new Map(
                brands.map(b => [b.name.toLowerCase(), b])
            );

            for (const row of rows) {
                if (!row.sku || !row.name || !row.brandName) {
                    productsSkippedCount++;
                    summary.push(`- Skipped a row due to missing name, SKU, or brand name.`);
                    continue;
                }

                if (existingSkuMap.has(row.sku.toLowerCase()) || newProducts.some(p => p.sku.toLowerCase() === row.sku.toLowerCase())) {
                    productsSkippedCount++;
                    summary.push(`- Skipped product "${row.name}" (SKU: ${row.sku}) - already exists.`);
                    continue;
                }
                
                let brand = brandNameMap.get(row.brandName.toLowerCase());
                if (!brand) {
                    const newBrand: Brand = {
                        id: `b_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                        name: row.brandName,
                        logoUrl: `https://placehold.co/300x150/E2E8F0/4A5568?text=${encodeURIComponent(row.brandName)}`
                    };
                    newBrands.push(newBrand);
                    brandNameMap.set(newBrand.name.toLowerCase(), newBrand); // Add to map for subsequent rows
                    brand = newBrand;
                    brandsAddedCount++;
                    summary.push(`- Queued new brand for creation: "${row.brandName}".`);
                }
                
                const newProduct: Product = {
                    id: `p_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                    name: row.name,
                    sku: row.sku,
                    brandId: brand.id,
                    description: row.description,
                    images: row.images ? row.images.split(',').map(img => img.trim()) : [`https://placehold.co/800x600/E2E8F0/4A5568?text=${encodeURIComponent(row.name)}`],
                    specifications: [],
                    websiteUrl: row.websiteUrl,
                    isDiscontinued: false,
                };
                newProducts.push(newProduct);
                productsAddedCount++;
                summary.push(`- Queued product for creation: "${row.name}".`);
            }

            // Batch update the context state after the loop
            newBrands.forEach(b => addBrand(b));
            newProducts.forEach(p => addProduct(p));
            
            setResult({
                success: true,
                message: `Import complete! Added: ${productsAddedCount} products, ${brandsAddedCount} new brands. Skipped: ${productsSkippedCount}.`,
                summary,
            });

        } catch (error) {
            console.error("Error processing file:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setResult({ success: false, message: `Failed to process file. ${errorMessage}`, summary: [] });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-100 dark:bg-gray-900/50 border-l-4 border-gray-500 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-4 rounded-r-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold">Instructions</p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            <li>Upload a <strong>.csv</strong> file. The first row must be a header.</li>
                            <li>Required columns: <strong>name, sku, brandName, description</strong>.</li>
                            <li>Optional columns: <strong>images</strong> (comma-separated URLs), <strong>websiteUrl</strong>.</li>
                            <li>If a brand doesn't exist, it will be created automatically.</li>
                            <li>Products with duplicate SKUs will be skipped.</li>
                        </ul>
                    </div>
                     <button 
                        type="button" 
                        onClick={handleDownloadTemplate} 
                        className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 flex-shrink-0 ml-4 !py-1.5 !px-3"
                        title="Download CSV Template"
                    >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                        <span>Template</span>
                    </button>
                </div>
                <p className="text-xs mt-3 font-semibold">Example Header:</p>
                <code className="text-xs p-2 bg-gray-200 dark:bg-gray-800 rounded-md block mt-1 font-mono">
                    name,sku,brandName,description,images,websiteUrl
                </code>
            </div>
            
             <div 
                className={`p-6 border-2 border-dashed rounded-2xl text-center transition-colors ${isDragging ? 'border-gray-500 dark:border-gray-400 bg-gray-200 dark:bg-gray-700/50' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'}`}
                onDragEnter={(e) => handleDragEvents(e, 'enter')}
                onDragLeave={(e) => handleDragEvents(e, 'leave')}
                onDragOver={(e) => handleDragEvents(e, 'over')}
                onDrop={handleDrop}
            >
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                <label htmlFor="file-upload" className="mt-2 block text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white cursor-pointer">
                    {file ? 'Change file' : 'Upload a file'}
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={(e) => handleFileChange(e.target.files)} />
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{file ? file.name : 'or drag and drop'}</p>
            </div>

            <button
                onClick={handleProcessFile}
                disabled={!file || isProcessing}
                className="btn btn-primary w-full"
            >
                {isProcessing ? 'Processing...' : 'Process CSV File'}
            </button>
            
            {isProcessing && (
                 <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                    Processing your file. This may take a moment...
                 </div>
            )}

            {result && (
                <div className={`p-4 rounded-lg ${result.success ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200'}`}>
                    <p className="font-semibold">{result.message}</p>
                    {result.summary.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-sm space-y-1 max-h-60 overflow-y-auto">
                            {result.summary.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    )}
                </div>
            )}

        </div>
    );
};

export default AdminBulkImport;
