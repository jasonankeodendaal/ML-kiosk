
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import type { Catalogue } from '../../types';
import { ChevronLeftIcon, SaveIcon, UploadIcon, TrashIcon, DocumentArrowRightIcon } from '../Icons';
import { useAppContext } from '../context/AppContext';
import LocalMedia from '../LocalMedia';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;

const inputStyle = "mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 sm:text-sm";
const selectStyle = inputStyle;

const getInitialFormData = (): Catalogue => ({
    id: `c_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title: '',
    year: new Date().getFullYear(),
    brandId: '',
    thumbnailUrl: '',
    type: 'image',
    imageUrls: [],
});


const CatalogueEdit: React.FC = () => {
    const { catalogueId } = useParams<{ catalogueId: string }>();
    const navigate = useNavigate();
    const { catalogues, brands, addCatalogue, updateCatalogue, saveFileToStorage, loggedInUser } = useAppContext();

    const isEditing = Boolean(catalogueId);
    const [formData, setFormData] = useState<Catalogue>(getInitialFormData());
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [conversionProgress, setConversionProgress] = useState('');

    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageCatalogues;

    useEffect(() => {
        if (isEditing && catalogueId) {
            const catalogue = catalogues.find(c => c.id === catalogueId);
            if (catalogue) {
                setFormData(catalogue);
            }
        } else {
            setFormData(getInitialFormData());
        }
    }, [catalogueId, catalogues, isEditing]);

    if (!canManage) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage catalogues.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'year' ? parseInt(value) : value }));
    };

     const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const fileName = await saveFileToStorage(e.target.files[0]);
                setFormData(prev => ({ ...prev, thumbnailUrl: fileName }));
            } catch (error) {
                alert(error instanceof Error ? error.message : "Failed to save thumbnail.");
            }
        }
    };

    const handleDocumentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && formData.type === 'image') {
             for (const file of Array.from(e.target.files)) {
                try {
                    const savedPath = await saveFileToStorage(file);
                    setFormData(prev => {
                        if (prev.type !== 'image') return prev;
                        return { ...prev, imageUrls: [...prev.imageUrls, savedPath] };
                    });
                } catch (error) { alert(error instanceof Error ? error.message : "Failed to save image."); }
            }
        }
    };
    
    const handlePdfUploadAndConvert = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || file.type !== 'application/pdf') return;

        setIsConverting(true);
        setConversionProgress('Starting conversion...');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const newImageUrls: string[] = [];

            for (let i = 1; i <= numPages; i++) {
                setConversionProgress(`Processing page ${i} of ${numPages}...`);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // High-quality render
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { alpha: false });
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({ canvasContext: context, viewport: viewport, background: 'rgba(255,255,255,1)' } as any).promise;
                
                const dataUrl = canvas.toDataURL('image/png');
                const blob = await (await fetch(dataUrl)).blob();
                const imageFile = new File([blob], `page_${i}.png`, { type: 'image/png' });

                const savedPath = await saveFileToStorage(imageFile);
                newImageUrls.push(savedPath);
            }

            setFormData(prev => {
                const newForm = { ...prev };
                if (newForm.type === 'image') {
                    newForm.imageUrls = [...newForm.imageUrls, ...newImageUrls];
                    if (!newForm.thumbnailUrl && newImageUrls.length > 0) {
                        newForm.thumbnailUrl = newImageUrls[0];
                    }
                }
                return newForm;
            });

            setConversionProgress(`Successfully converted and added ${numPages} pages.`);
        } catch (err) {
            console.error(err);
            setConversionProgress(`Error: ${err instanceof Error ? err.message : 'Failed to convert PDF'}`);
        } finally {
            setIsConverting(false);
            if (e.target) e.target.value = ''; // Reset file input
            setTimeout(() => setConversionProgress(''), 5000);
        }
    };


    const removeDocumentImage = (index: number) => {
        if (formData.type === 'image') {
            const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, type: 'image', imageUrls: newImageUrls }));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const imagesAreSet = formData.type === 'image' && formData.imageUrls.length > 0;
        if (!formData.title || !formData.thumbnailUrl || !imagesAreSet) {
            alert('Please fill out Title, upload a thumbnail, and provide at least one page image.');
            return;
        }
        setSaving(true);
        if (isEditing) {
            updateCatalogue(formData);
            setTimeout(() => {
                setSaving(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }, 300);
        } else {
            addCatalogue(formData);
            setTimeout(() => {
                setSaving(false);
                navigate(`/admin/catalogue/edit/${formData.id}`, { replace: true });
            }, 300);
        }
    };
    
    return (
        <form onSubmit={handleSave} className="space-y-8">
            {/* Header */}
            <div>
                <Link to="/admin" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Back to Dashboard
                </Link>
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-3xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate">
                            {isEditing ? 'Edit Catalogue' : 'Create New Catalogue'}
                        </h2>
                        {isEditing && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Editing "{formData.title}"</p>}
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                         <button
                            type="submit"
                            disabled={saving || saved}
                            className={`btn btn-primary ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}
                        >
                            <SaveIcon className="h-4 w-4" />
                            {saving ? 'Saving...' : (saved ? 'Saved!' : 'Save Changes')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="grid grid-cols-3 gap-8">
                {/* Left Column - Main Details */}
                <div className="col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Catalogue Information</h3>
                         <div className="mt-6 grid grid-cols-6 gap-y-6 gap-x-4">
                            <div className="col-span-4">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} className={inputStyle} required />
                            </div>
                            <div className="col-span-2">
                                <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                                <input type="number" name="year" id="year" value={formData.year} onChange={handleInputChange} className={inputStyle} required />
                            </div>
                             <div className="col-span-6">
                                <label htmlFor="brandId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand (Optional)</label>
                                <select id="brandId" name="brandId" value={formData.brandId || ''} onChange={handleInputChange} className={selectStyle}>
                                    <option value="">Select a brand</option>
                                    {brands.filter(b => !b.isDeleted).map(brand => (
                                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Assets */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Catalogue Assets</h3>
                        <div className="mt-4 space-y-6">
                             <div>
                                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail</span>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="h-24 w-[72px] bg-gray-100 dark:bg-gray-700 rounded-xl border dark:border-gray-600 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                                        <LocalMedia src={formData.thumbnailUrl} alt="Thumbnail preview" type="image" className="h-full w-full object-cover rounded-xl"/>
                                    </div>
                                    <label htmlFor="thumbnail-upload" className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <UploadIcon className="h-4 w-4" />
                                        <span>{formData.thumbnailUrl ? 'Change' : 'Upload'}</span>
                                    </label>
                                    <input id="thumbnail-upload" type="file" className="sr-only" onChange={handleThumbnailChange} accept="image/*" />
                                </div>
                             </div>
                             <div>
                                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catalogue Pages</span>
                                <div className="mt-2 space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        {formData.type === 'image' && formData.imageUrls.map((img, index) => (
                                            <div key={index} className="relative group aspect-square">
                                                <LocalMedia src={img} type="image" alt={`Page ${index+1}`} className="rounded-md object-cover w-full h-full" />
                                                <button type="button" onClick={() => removeDocumentImage(index)} className="absolute top-1 right-1 p-1 bg-white/80 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete image">
                                                    <TrashIcon className="w-3 h-3"/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                     <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border dark:border-gray-600 space-y-2">
                                         <label htmlFor="pdf-upload-convert" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 w-full justify-center">
                                            <DocumentArrowRightIcon className="h-4 w-4" />
                                            <span>Upload PDF & Convert</span>
                                        </label>
                                        <input id="pdf-upload-convert" type="file" className="sr-only" onChange={handlePdfUploadAndConvert} accept="application/pdf" disabled={isConverting} />
                                        
                                        <label htmlFor="doc-image-upload" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 w-full justify-center">
                                            <UploadIcon className="h-4 w-4"/>
                                            <span>Add Image(s) Manually</span>
                                        </label>
                                        <input id="doc-image-upload" type="file" multiple onChange={handleDocumentImageUpload} className="sr-only" accept="image/*" />

                                        {conversionProgress && <p className="text-xs text-center pt-1 text-gray-500 dark:text-gray-400">{conversionProgress}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CatalogueEdit;
