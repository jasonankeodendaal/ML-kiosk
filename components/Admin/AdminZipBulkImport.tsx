import React, { useState } from 'react';
import JSZip from 'jszip';
import { useAppContext } from '../context/AppContext';
import { UploadIcon, DocumentArrowDownIcon } from '../Icons';
import type { Product, Brand, ProductDocument } from '../../types';

// Helper function to convert a file from JSZip to a File object
const zipEntryToFile = async (zipEntry: JSZip.JSZipObject, fileName: string): Promise<File> => {
    const blob = await zipEntry.async('blob');
    return new File([blob], fileName, { type: blob.type });
};

const AdminZipBulkImport: React.FC = () => {
    const { brands, products, addBrand, addProduct, saveFileToStorage } = useAppContext();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState('');
    const [result, setResult] = useState<{ success: boolean; message: string; summary: string[] } | null>(null);

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const uploadedFile = files[0];
            if (uploadedFile.type === 'application/zip' || uploadedFile.type === 'application/x-zip-compressed' || uploadedFile.name.endsWith('.zip')) {
                setFile(uploadedFile);
                setResult(null);
                setProgress('');
            } else {
                alert('Please upload a valid .zip file.');
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

    const handleDownloadTemplate = async () => {
        const zip = new JSZip();
        const readmeContent = `
# Product Zip Upload Template Instructions

This template demonstrates the required folder structure for bulk uploading products.

## Structure:

- The root of the zip file should contain folders. Each folder name represents a **Brand Name**.
- Inside each brand folder, create sub-folders. Each sub-folder name represents a **Product Name**.
- Inside each product folder, you must have:
    1. A 'product.json' file with product details.
    2. An 'images' folder for product images.
    3. (Optional) A 'videos' folder for a product video (only the first one found will be used).
    4. (Optional) A 'documents' folder for PDF documents.

## 'product.json' File:

This file contains the core product data. Here's an example:

{
  "sku": "PROD-SKU-123",
  "description": "This is a detailed description of the product. It can include features and benefits.",
  "websiteUrl": "https://example.com/product-page",
  "whatsInTheBox": [
    "Main Product Unit",
    "Power Cable",
    "User Manual"
  ],
  "termsAndConditions": "2-year warranty on parts and labor. Misuse is not covered.",
  "specifications": [
    { "key": "Color", "value": "Midnight Black" },
    { "key": "Weight", "value": "1.2 kg" },
    { "key": "Material", "value": "Anodized Aluminum" }
  ]
}

- **sku**: (Required) The unique product identifier.
- All other fields are optional.

## Media Files:

- **images/**: Place all product images here (e.g., image1.jpg, front-view.png).
- **videos/**: Place ONE product video here if applicable (e.g., promo.mp4).
- **documents/**: Place product PDFs here (e.g., manual.pdf, spec-sheet.pdf). The filename (without .pdf) will be used as the document title.

---
Zip created by Modern Living Kiosk System.
`;
        zip.file("README.txt", readmeContent);

        // Add example structure
        const productFolder = zip.folder("Example Brand")?.folder("Example Product");
        const productJson = {
            sku: "EX-SKU-001",
            description: "An example product description.",
            websiteUrl: "https://example.com"
        };
        productFolder?.file("product.json", JSON.stringify(productJson, null, 2));
        productFolder?.folder("images");
        productFolder?.folder("videos");
        productFolder?.folder("documents");

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = url;
        link.download = "product_upload_template.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleProcessFile = async () => {
        if (!file) return;

        setIsProcessing(true);
        setResult(null);
        setProgress('Reading zip file...');
        const summary: string[] = [];

        try {
            const zip = await JSZip.loadAsync(file);
            let productsAddedCount = 0;
            let brandsAddedCount = 0;
            let productsSkippedCount = 0;

            const existingSkuMap = new Map(products.map(p => [p.sku.toLowerCase(), p]));
            const brandNameMap: Map<string, Brand> = new Map(brands.map(b => [b.name.toLowerCase(), b]));

            const productsInZip: { [productPath: string]: {
                brandName: string;
                productName: string;
                productJsonFile?: JSZip.JSZipObject;
                imageFiles: JSZip.JSZipObject[];
                videoFiles: JSZip.JSZipObject[];
                documentFiles: JSZip.JSZipObject[];
            }} = {};

            // 1. Group files by product path - This is fast and happens in memory.
            setProgress('Analyzing zip structure...');
            for (const relativePath in zip.files) {
                const zipObj = zip.files[relativePath];
                if (zipObj.dir) continue;

                const pathParts = relativePath.split('/');
                if (pathParts.length < 3) continue; // Must be at least Brand/Product/file.json

                const brandName = pathParts[0];
                const productName = pathParts[1];
                const productPath = `${brandName}/${productName}`;

                if (!productsInZip[productPath]) {
                    productsInZip[productPath] = {
                        brandName,
                        productName,
                        imageFiles: [],
                        videoFiles: [],
                        documentFiles: []
                    };
                }
                
                const fileName = pathParts[pathParts.length - 1].toLowerCase();
                const fileContainer = pathParts[pathParts.length - 2].toLowerCase();

                if (fileName === 'product.json') {
                    productsInZip[productPath].productJsonFile = zipObj;
                } else if (fileContainer === 'images') {
                    productsInZip[productPath].imageFiles.push(zipObj);
                } else if (fileContainer === 'videos') {
                    productsInZip[productPath].videoFiles.push(zipObj);
                } else if (fileContainer === 'documents') {
                    productsInZip[productPath].documentFiles.push(zipObj);
                }
            }
            
            // 2. Process each grouped product sequentially with yielding
            const productPaths = Object.keys(productsInZip);
            let processedCount = 0;

            for (const productPath of productPaths) {
                processedCount++;
                const { brandName, productName, productJsonFile, imageFiles, videoFiles, documentFiles } = productsInZip[productPath];

                setProgress(`Processing ${processedCount} / ${productPaths.length}: ${productName}`);
                await new Promise(resolve => setTimeout(resolve, 10)); // Yield to event loop to prevent browser from timing out permissions

                if (!productJsonFile) {
                    summary.push(`- Skipped "${productName}" - missing product.json.`);
                    productsSkippedCount++;
                    continue;
                }

                try {
                    const productData = JSON.parse(await productJsonFile.async("string"));
                    if (!productData.sku) {
                        summary.push(`- Skipped "${productName}" - product.json is missing an SKU.`);
                        productsSkippedCount++;
                        continue;
                    }
                    if (existingSkuMap.has(productData.sku.toLowerCase())) {
                        summary.push(`- Skipped "${productName}" (SKU: ${productData.sku}) - already exists.`);
                        productsSkippedCount++;
                        continue;
                    }

                    let brand = brandNameMap.get(brandName.toLowerCase());
                    if (!brand) {
                        const newBrand: Brand = {
                            id: `b_zip_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                            name: brandName,
                            logoUrl: `https://placehold.co/300x150/E2E8F0/4A5568?text=${encodeURIComponent(brandName)}`
                        };
                        addBrand(newBrand);
                        brandNameMap.set(newBrand.name.toLowerCase(), newBrand);
                        brand = newBrand;
                        brandsAddedCount++;
                        summary.push(`- Created new brand: "${brandName}".`);
                    }

                    const newProduct: Product = {
                        id: `p_zip_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                        name: productName,
                        sku: productData.sku,
                        brandId: brand.id,
                        description: productData.description || '',
                        images: [],
                        specifications: productData.specifications || [],
                        documents: [],
                        video: undefined,
                        websiteUrl: productData.websiteUrl,
                        whatsInTheBox: productData.whatsInTheBox,
                        termsAndConditions: productData.termsAndConditions,
                        isDiscontinued: false,
                    };

                    for (const imageFile of imageFiles) {
                        const fileObj = await zipEntryToFile(imageFile, imageFile.name.split('/').pop()!);
                        const savedPath = await saveFileToStorage(fileObj);
                        newProduct.images.push(savedPath);
                    }
                     if (newProduct.images.length === 0) {
                        newProduct.images.push(`https://placehold.co/800x600/E2E8F0/4A5568?text=${encodeURIComponent(productName)}`);
                    }

                    if (videoFiles.length > 0) {
                        const videoFile = videoFiles[0];
                        const fileObj = await zipEntryToFile(videoFile, videoFile.name.split('/').pop()!);
                        newProduct.video = await saveFileToStorage(fileObj);
                    }

                    for (const docFile of documentFiles) {
                        if (docFile.name.toLowerCase().endsWith('.pdf')) {
                            const fileObj = await zipEntryToFile(docFile, docFile.name.split('/').pop()!);
                            const savedPath = await saveFileToStorage(fileObj);
                            const docTitle = docFile.name.split('/').pop()!.replace(/\.pdf$/i, '');
                            const newDoc: ProductDocument = {
                                id: `doc_zip_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                                title: docTitle,
                                url: savedPath,
                                type: 'pdf',
                            };
                            newProduct.documents?.push(newDoc);
                        }
                    }
                    
                    addProduct(newProduct);
                    existingSkuMap.set(newProduct.sku.toLowerCase(), newProduct);
                    productsAddedCount++;
                    summary.push(`- Added product: "${productName}".`);

                } catch (e) {
                    summary.push(`- Error processing product "${productName}": ${e instanceof Error ? e.message : 'Invalid format'}`);
                    productsSkippedCount++;
                }
            }

             setResult({
                success: true,
                message: `Import complete! Added: ${productsAddedCount} products, ${brandsAddedCount} new brands. Skipped: ${productsSkippedCount}.`,
                summary,
            });

        } catch (error) {
            console.error("Error processing zip file:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setResult({ success: false, message: `Failed to process zip file. ${errorMessage}`, summary: [] });
        } finally {
            setIsProcessing(false);
            setProgress('');
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-gray-100 dark:bg-gray-900/50 border-l-4 border-gray-500 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-4 rounded-r-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold">Instructions for Zip Upload</p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                            <li>Create a folder for each <strong>Brand</strong>.</li>
                            <li>Inside each brand folder, create a folder for each <strong>Product</strong>.</li>
                            <li>Each product folder must contain a <strong>product.json</strong> file and an <strong>images</strong> folder.</li>
                            <li>Optionally, add <strong>videos</strong> and <strong>documents</strong> folders for media.</li>
                        </ul>
                    </div>
                     <button 
                        type="button" 
                        onClick={handleDownloadTemplate} 
                        className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 flex-shrink-0 ml-4 !py-1.5 !px-3"
                        title="Download Zip Template"
                    >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                        <span>Template</span>
                    </button>
                </div>
            </div>
            
             <div 
                className={`p-6 border-2 border-dashed rounded-2xl text-center transition-colors ${isDragging ? 'border-gray-500 dark:border-gray-400 bg-gray-200 dark:bg-gray-700/50' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'}`}
                onDragEnter={(e) => handleDragEvents(e, 'enter')}
                onDragLeave={(e) => handleDragEvents(e, 'leave')}
                onDragOver={(e) => handleDragEvents(e, 'over')}
                onDrop={handleDrop}
            >
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                <label htmlFor="zip-upload" className="mt-2 block text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white cursor-pointer">
                    {file ? 'Change file' : 'Upload a .zip file'}
                    <input id="zip-upload" name="zip-upload" type="file" className="sr-only" accept=".zip,application/zip,application/x-zip-compressed" onChange={(e) => handleFileChange(e.target.files)} />
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{file ? file.name : 'or drag and drop'}</p>
            </div>

            <button
                onClick={handleProcessFile}
                disabled={!file || isProcessing}
                className="btn btn-primary w-full"
            >
                {isProcessing ? 'Processing...' : 'Process Zip File'}
            </button>
            
            {isProcessing && (
                 <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                    {progress}
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

export default AdminZipBulkImport;
