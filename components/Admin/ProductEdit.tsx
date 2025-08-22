import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import type { Product, ProductDocument } from '../../types';
import { ChevronLeftIcon, TrashIcon, UploadIcon, SaveIcon, PlusIcon, DocumentArrowRightIcon, SparklesIcon } from '../Icons';
import { useAppContext } from '../context/AppContext';
import LocalMedia from '../LocalMedia';
import AiDescriptionModal from './AiDescriptionModal.tsx';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;

const inputStyle = "block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 sm:text-sm";

const getInitialFormData = (brandId: string): Product => ({
    id: `p_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name: '',
    sku: '',
    description: '',
    images: [],
    specifications: [{ id: `spec_${Date.now()}_${Math.random().toString(16).slice(2)}`, key: 'Dimensions', value: '' }],
    documents: [],
    whatsInTheBox: [],
    termsAndConditions: '',
    websiteUrl: '',
    brandId: brandId,
    isDiscontinued: false,
});

const ProductEdit: React.FC = () => {
    const { productId, brandId } = useParams<{ productId: string, brandId: string }>();
    const navigate = useNavigate();
    const { products, brands, categories, addProduct, updateProduct, saveFileToStorage, loggedInUser } = useAppContext();

    const isEditing = Boolean(productId);
    const [formData, setFormData] = useState<Product | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [conversionState, setConversionState] = useState<{ [docId: string]: { progress: string; isConverting: boolean } }>({});
    
    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageBrandsAndProducts;
    const brand = brands.find(b => b.id === formData?.brandId);

    const markDirty = () => !isDirty && setIsDirty(true);

    const brandCategories = useMemo(() => {
        if (!formData?.brandId) return [];
        return categories.filter(c => c.brandId === formData.brandId && !c.isDeleted);
    }, [categories, formData?.brandId]);

    useEffect(() => {
        if (!isEditing && brandId) {
            setFormData(getInitialFormData(brandId));
        }
    }, [isEditing, brandId]);

    useEffect(() => {
        if (isEditing && productId) {
            const product = products.find(p => p.id === productId);
            if (product) {
                setFormData(product);
            } else {
                navigate('/admin', { replace: true });
            }
        }
    }, [productId, isEditing, products, navigate]);
    
    if (!canManage) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage brands and products.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!formData) return;
        setFormData({ ...formData, [e.target.name]: e.target.value });
        markDirty();
    };

    const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
        if (!formData) return;
        const newSpecs = [...formData.specifications];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        setFormData({ ...formData, specifications: newSpecs });
        markDirty();
    };

    const addSpec = () => {
        if (!formData) return;
        const newSpec = { id: `spec_${Date.now()}_${Math.random().toString(16).slice(2)}`, key: '', value: '' };
        setFormData({ ...formData, specifications: [...formData.specifications, newSpec] });
        markDirty();
    };

    const removeSpec = (id: string) => {
        if (!formData) return;
        setFormData({ ...formData, specifications: formData.specifications.filter(spec => spec.id !== id) });
        markDirty();
    };
    
    const addBoxItem = () => {
        if (!formData) return;
        const newItems = [...(formData.whatsInTheBox || []), ''];
        setFormData({ ...formData, whatsInTheBox: newItems });
        markDirty();
    };
    
    const handleBoxItemChange = (index: number, value: string) => {
        if (!formData) return;
        const newItems = [...(formData.whatsInTheBox || [])];
        newItems[index] = value;
        setFormData({ ...formData, whatsInTheBox: newItems });
        markDirty();
    };
    
    const removeBoxItem = (index: number) => {
        if (!formData) return;
        const newItems = (formData.whatsInTheBox || []).filter((_, i) => i !== index);
        setFormData({ ...formData, whatsInTheBox: newItems });
        markDirty();
    };

    const handleImageDelete = (index: number) => {
        if (!formData) return;
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
        markDirty();
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            for (const file of files) {
                try {
                    const fileName = await saveFileToStorage(file);
                    setFormData(prev => prev ? ({ ...prev, images: [...prev.images, fileName] }) : null);
                    markDirty();
                } catch (error) {
                    alert(error instanceof Error ? error.message : "Failed to save file.");
                }
            }
        }
    };
    
    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const fileName = await saveFileToStorage(file);
                setFormData(prev => prev ? ({ ...prev, video: fileName }) : null);
                markDirty();
            } catch (error) {
                alert(error instanceof Error ? error.message : "Failed to save file.");
            }
        } else { // Handle removing the video
            setFormData(prev => prev ? ({ ...prev, video: undefined }) : null);
            markDirty();
        }
    };

    const addDocument = () => {
        if (!formData) return;
        const newDocument: ProductDocument = {
            id: `doc_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            title: '',
            type: 'image',
            imageUrls: [],
        };
        setFormData(prev => ({ ...prev!, documents: [...(prev!.documents || []), newDocument] }));
        markDirty();
    };

    const handleDocumentChange = (id: string, field: 'title', value: string) => {
        if (!formData) return;
        const newDocs = (formData.documents || []).map((doc): ProductDocument => {
            if (doc.id !== id) return doc;
            return { ...doc, title: value };
        });
        setFormData({ ...formData, documents: newDocs });
        markDirty();
    };

    const handleDocumentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            for (const file of files) {
                try {
                    const savedPath = await saveFileToStorage(file);
                    setFormData(prev => {
                        if (!prev) return null;
                        const newDocs = (prev.documents || []).map(doc => {
                            if (doc.id === docId && doc.type === 'image') {
                                return { ...doc, imageUrls: [...doc.imageUrls, savedPath] };
                            }
                            return doc;
                        });
                        return { ...prev, documents: newDocs };
                    });
                    markDirty();
                } catch (error) {
                    alert(error instanceof Error ? error.message : "Failed to save image.");
                }
            }
        }
    };

    const handleDocumentPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
        const file = e.target.files?.[0];
        if (!file || file.type !== 'application/pdf') return;

        setConversionState(prev => ({ ...prev, [docId]: { isConverting: true, progress: 'Starting...' } }));

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const newImageUrls: string[] = [];

            for (let i = 1; i <= numPages; i++) {
                setConversionState(prev => ({ ...prev, [docId]: { ...prev[docId], progress: `Page ${i}/${numPages}` } }));
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { alpha: false });
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({ canvasContext: context, viewport: viewport, background: 'rgba(255,255,255,1)' } as any).promise;
                const blob = await new Promise<Blob|null>(resolve => canvas.toBlob(resolve, 'image/png'));
                if(!blob) continue;

                const imageFile = new File([blob], `page_${i}.png`, { type: 'image/png' });
                const savedPath = await saveFileToStorage(imageFile);
                newImageUrls.push(savedPath);
            }

            setFormData(prev => {
                if (!prev) return null;
                const newDocs = (prev.documents || []).map(doc => {
                    if (doc.id === docId && doc.type === 'image') {
                        return { ...doc, imageUrls: [...doc.imageUrls, ...newImageUrls] };
                    }
                    return doc;
                });
                return { ...prev, documents: newDocs };
            });
            markDirty();

            setConversionState(prev => ({ ...prev, [docId]: { isConverting: false, progress: `Added ${numPages} pages.` } }));

        } catch (err) {
            const message = err instanceof Error ? err.message : 'PDF conversion failed.';
            setConversionState(prev => ({ ...prev, [docId]: { isConverting: false, progress: `Error: ${message}` } }));
        } finally {
            if (e.target) e.target.value = '';
            setTimeout(() => setConversionState(prev => ({ ...prev, [docId]: { isConverting: false, progress: '' } })), 5000);
        }
    };
    
    const removeDocumentImage = (docId: string, imageIndex: number) => {
         if (!formData) return;
         const newDocs = (formData.documents || []).map(doc => {
            if (doc.id === docId && doc.type === 'image') {
                const newImageUrls = doc.imageUrls.filter((_, i) => i !== imageIndex);
                return { ...doc, imageUrls: newImageUrls };
            }
            return doc;
        });
        setFormData({ ...formData, documents: newDocs });
        markDirty();
    };

    const removeDocument = (idToRemove: string) => {
        if (!formData) return;
        setFormData(prev => prev ? ({
            ...prev,
            documents: (prev.documents || []).filter(doc => doc.id !== idToRemove)
        }) : null);
        markDirty();
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        setSaving(true);
        
        const cleanedFormData = {
            ...formData,
            whatsInTheBox: (formData.whatsInTheBox || []).filter(item => item.trim() !== '')
        };

        if (isEditing) {
            updateProduct(cleanedFormData);
            setTimeout(() => {
                setSaving(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
                setIsDirty(false);
            }, 300);
        } else {
            addProduct(cleanedFormData);
            setTimeout(() => {
                setSaving(false);
                navigate(`/admin/product/${cleanedFormData.id}`, { replace: true });
            }, 300);
        }
    };

    if (!formData) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold">Loading...</h2>
            </div>
        );
    }
    
    return (
        <>
            <AiDescriptionModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                onApplyDescription={(newDescription) => {
                    setFormData(prev => prev ? ({ ...prev, description: newDescription }) : null);
                    markDirty();
                }}
                productName={formData.name}
                brandName={brand?.name || ''}
                specifications={formData.specifications}
            />
            <form onSubmit={handleSave} className="space-y-8">
                {/* Header */}
                <div>
                    <Link to={brand ? `/admin/brand/${brand.id}` : '/admin'} className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
                        <ChevronLeftIcon className="h-5 w-5 mr-1" />
                        Back to Brand Products
                    </Link>
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-3xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate">
                                {isEditing ? 'Edit Product' : 'Create New Product'}
                            </h2>
                            {isEditing && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Editing "{formData.name}"</p>}
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4">
                                <button
                                type="submit"
                                disabled={saving || saved || !isDirty}
                                className={`btn btn-primary ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}
                            >
                                <SaveIcon className="h-4 w-4" />
                                {saving ? 'Saving...' : (saved ? 'Saved!' : 'Save Changes')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="grid grid-cols-3 gap-8 items-start">
                    {/* Left Column - Main Details */}
                    <div className="col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Product Information</h3>
                                <div className="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                                <div className="col-span-3">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                                    <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className={inputStyle} required />
                                </div>
                                <div className="col-span-3">
                                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU</label>
                                    <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleInputChange} className={inputStyle} required />
                                </div>
                                <div className="col-span-3">
                                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                    <select
                                        id="categoryId"
                                        name="categoryId"
                                        value={formData.categoryId || ''}
                                        onChange={handleInputChange}
                                        className={inputStyle}
                                        disabled={brandCategories.length === 0}
                                        required={brandCategories.length > 0}
                                    >
                                        <option value="">{brandCategories.length > 0 ? 'Select a category' : 'No categories available'}</option>
                                        {brandCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {brandCategories.length === 0 && <p className="mt-1 text-xs text-gray-500">Create categories in the Brand's product list page.</p>}
                                </div>
                                <div className="col-span-3">
                                    <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website URL (Optional)</label>
                                    <input type="url" name="websiteUrl" id="websiteUrl" value={formData.websiteUrl || ''} onChange={handleInputChange} className={inputStyle} placeholder="https://example.com/product" />
                                </div>
                                <div className="col-span-6">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsAiModalOpen(true)}
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!formData.name || saving}
                                            title={!formData.name ? "Please enter a product name first" : "Generate description with AI"}
                                        >
                                            <SparklesIcon className="h-4 w-4" />
                                            <span>Generate with AI</span>
                                        </button>
                                    </div>
                                    <textarea id="description" name="description" rows={5} value={formData.description} onChange={handleInputChange} className={inputStyle + ' mt-1'}></textarea>
                                </div>
                            </div>
                        </div>

                            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Specifications</h3>
                                <button type="button" onClick={addSpec} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                    <PlusIcon className="h-4 w-4" />
                                    Add Row
                                </button>
                            </div>
                            <div className="mt-4 space-y-4">
                                {formData.specifications.map((spec, index) => (
                                    <div key={spec.id} className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <label className="sr-only">Key</label>
                                            <input type="text" placeholder="e.g., Material" value={spec.key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} className={inputStyle} />
                                        </div>
                                        <div className="flex-1">
                                            <label className="sr-only">Value</label>
                                            <input type="text" placeholder="e.g., Solid Oak" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} className={inputStyle} />
                                        </div>
                                        <button type="button" onClick={() => removeSpec(spec.id)} className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 transition-colors rounded-full">
                                            <TrashIcon className="w-4 h-4"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">What's in the Box</h3>
                                <button type="button" onClick={addBoxItem} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                    <PlusIcon className="h-4 w-4" />
                                    Add Item
                                </button>
                            </div>
                            <div className="mt-4 space-y-3">
                                {(formData.whatsInTheBox || []).map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input type="text" value={item} onChange={(e) => handleBoxItemChange(index, e.target.value)} className={inputStyle} placeholder="e.g., Main Unit" />
                                        <button type="button" onClick={() => removeBoxItem(index)} className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 transition-colors rounded-full">
                                            <TrashIcon className="w-4 h-4"/>
                                        </button>
                                    </div>
                                ))}
                                {(!formData.whatsInTheBox || formData.whatsInTheBox.length === 0) && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No items added yet.</p>
                                )}
                            </div>
                        </div>

                            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Terms & Conditions</h3>
                            <textarea id="termsAndConditions" name="termsAndConditions" rows={4} value={formData.termsAndConditions || ''} onChange={handleInputChange} className={inputStyle + ' mt-2'}></textarea>
                        </div>
                    </div>

                    {/* Right Column - Assets */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Product Media</h3>
                            <div className="mt-4 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Images</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="relative group aspect-square">
                                                <LocalMedia src={img} type="image" alt={`Product image ${index + 1}`} className="rounded-xl object-cover w-full h-full" />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center rounded-xl">
                                                    <button type="button" onClick={() => handleImageDelete(index)} className="p-2 bg-white/80 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete image">
                                                        <TrashIcon className="w-5 h-5"/>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                            <label htmlFor="image-upload" className="cursor-pointer aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                                            <UploadIcon className="w-8 h-8"/>
                                            <span className="mt-2 text-xs font-medium">{formData.images.length > 0 ? 'Add More' : 'Add Images'}</span>
                                            <input id="image-upload" type="file" multiple className="sr-only" onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Video (Optional)</label>
                                        <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700 rounded-xl border dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 overflow-hidden">
                                        {formData.video ? (
                                            <LocalMedia src={formData.video} type="video" className="w-full h-full object-cover" controls />
                                        ) : (
                                            <span>No video uploaded</span>
                                        )}
                                    </div>
                                    <label htmlFor="video-upload" className="mt-2 w-full cursor-pointer inline-flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <UploadIcon className="h-4 w-4"/>
                                        <span>{formData.video ? 'Change Video' : 'Upload Video'}</span>
                                    </label>
                                    <input id="video-upload" type="file" className="sr-only" onChange={handleVideoUpload} accept="video/mp4,video/webm" />
                                </div>
                            </div>
                        </div>

                            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                                    <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Documents</h3>
                                    <button type="button" onClick={addDocument} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                        <PlusIcon className="h-4 w-4" />
                                        Add Document
                                    </button>
                                </div>
                                <div className="mt-4 space-y-4">
                                    {(formData.documents || []).map(doc => (
                                        <div key={doc.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-600">
                                            <div className="flex justify-between items-center">
                                                <input type="text" placeholder="Document title" value={doc.title} onChange={(e) => handleDocumentChange(doc.id, 'title', e.target.value)} className={inputStyle} />
                                                <button type="button" onClick={() => removeDocument(doc.id)} className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 transition-colors rounded-full ml-2">
                                                    <TrashIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                            <div className="mt-3">
                                                <div className="space-y-2">
                                                    <label htmlFor={`doc-pdf-upload-${doc.id}`} className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 w-full justify-center !py-1.5 text-xs">
                                                        <DocumentArrowRightIcon className="h-4 w-4" />
                                                        <span>Upload PDF to Populate</span>
                                                    </label>
                                                    <input id={`doc-pdf-upload-${doc.id}`} type="file" className="sr-only" onChange={(e) => handleDocumentPdfUpload(e, doc.id)} accept="application/pdf" disabled={conversionState[doc.id]?.isConverting} />
                                                    {conversionState[doc.id]?.progress && <p className="text-xs text-center text-gray-500 dark:text-gray-400">{conversionState[doc.id].progress}</p>}
                                                </div>

                                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-3 block">Images</label>
                                                <div className="mt-1 grid grid-cols-4 gap-2">
                                                    {doc.type === 'image' && doc.imageUrls.map((img, index) => (
                                                        <div key={index} className="relative group aspect-square">
                                                            <LocalMedia src={img} type="image" alt={`Doc image ${index + 1}`} className="rounded-md object-cover w-full h-full" />
                                                                <button type="button" onClick={() => removeDocumentImage(doc.id, index)} className="absolute top-1 right-1 p-1 bg-white/80 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete image">
                                                                <TrashIcon className="w-3 h-3"/>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <label htmlFor={`doc-img-upload-${doc.id}`} className="cursor-pointer aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-gray-400 hover:border-gray-500">
                                                        <UploadIcon className="w-5 h-5"/>
                                                    </label>
                                                    <input id={`doc-img-upload-${doc.id}`} type="file" multiple onChange={(e) => handleDocumentImageUpload(e, doc.id)} className="sr-only" accept="image/*" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
            </form>
        </>
    );
};

export default ProductEdit;