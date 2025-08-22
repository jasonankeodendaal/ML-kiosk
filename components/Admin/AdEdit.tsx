

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { ScreensaverAd, AdLink } from '../../types.ts';
import { ChevronLeftIcon, SaveIcon, UploadIcon, TrashIcon } from '../Icons.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import LocalMedia from '../LocalMedia.tsx';

const inputStyle = "mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 sm:text-sm";
const selectStyle = inputStyle;

const getInitialFormData = (): ScreensaverAd => ({
    id: `ad_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title: '',
    media: [],
    startDate: '',
    endDate: '',
});


const AdEdit: React.FC = () => {
    const { adId } = useParams<{ adId: string }>();
    const navigate = useNavigate();
    const { screensaverAds, addAd, updateAd, brands, products, catalogues, pamphlets, saveFileToStorage, loggedInUser } = useAppContext();
    const isEditing = Boolean(adId);

    const [formData, setFormData] = useState<ScreensaverAd>(getInitialFormData());
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [linkType, setLinkType] = useState('none');
    const [linkTarget, setLinkTarget] = useState('');

    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageScreensaver;

    useEffect(() => {
        if (!isEditing) {
            setFormData(getInitialFormData());
            setLinkType('none');
            setLinkTarget('');
        }
    }, [isEditing]);

    useEffect(() => {
        if (isEditing && adId) {
            const ad = screensaverAds.find(p => p.id === adId);
            if (ad) {
                setFormData(ad);

                if (ad.link) {
                    setLinkType(ad.link.type);
                    setLinkTarget('url' in ad.link ? ad.link.url : ad.link.id);
                } else {
                    setLinkType('none');
                    setLinkTarget('');
                }
            } else {
                navigate('/admin', { replace: true });
            }
        }
    }, [adId, isEditing, screensaverAds, navigate]);

    if (!canManage) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage the screensaver.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            for (const file of files) {
                const fileType = file.type.startsWith('image/') ? 'image' : 'video';
                try {
                    const fileName = await saveFileToStorage(file);
                    setFormData(prev => ({
                        ...prev,
                        media: [...prev.media, { url: fileName, type: fileType }]
                    }));
                } catch (error) {
                    alert(error instanceof Error ? error.message : "Failed to save media file.");
                }
            }
            e.target.value = ''; // Allow re-uploading the same file
        }
    };

    const handleMediaDelete = (indexToDelete: number) => {
        setFormData(prev => ({
            ...prev,
            media: prev.media.filter((_, index) => index !== indexToDelete)
        }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.media.length === 0) {
            alert("Please upload at least one media file for the ad.");
            return;
        }

        let linkObject: AdLink | undefined = undefined;
        if (linkType !== 'none' && linkTarget) {
             if (linkType === 'external') {
                linkObject = { type: 'external', url: linkTarget };
            } else {
                linkObject = { type: linkType as 'brand' | 'product' | 'catalogue' | 'pamphlet', id: linkTarget };
            }
        }

        const finalData = { ...formData, link: linkObject };
        setSaving(true);
        if (isEditing) {
            updateAd(finalData);
            setTimeout(() => {
                setSaving(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }, 300);
        } else {
            addAd(finalData);
            setTimeout(() => {
                setSaving(false);
                navigate(`/admin/ad/${finalData.id}`, { replace: true });
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
                             {isEditing ? 'Edit Screensaver Ad' : 'Create New Screensaver Ad'}
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
            <div className="grid grid-cols-3 gap-8 items-start">
                 <div className="col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Ad Details</h3>
                            <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-4">
                            <div className="col-span-2">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} className={inputStyle} required/>
                            </div>
                            
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleInputChange} className={inputStyle} required/>
                            </div>

                                <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleInputChange} className={inputStyle} required/>
                            </div>

                            <div className="col-span-1">
                                <label htmlFor="linkType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link Ad To (Optional)</label>
                                <select id="linkType" name="linkType" value={linkType} onChange={e => {setLinkType(e.target.value); setLinkTarget('')}} className={selectStyle}>
                                    <option value="none">None</option>
                                    <option value="brand">Brand</option>
                                    <option value="product">Product</option>
                                    <option value="catalogue">Catalogue</option>
                                    <option value="pamphlet">Pamphlet</option>
                                    <option value="external">External URL</option>
                                </select>
                            </div>
                            {linkType !== 'none' && (
                                <div className="col-span-1">
                                    <label htmlFor="linkTarget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link Destination</label>
                                    {linkType === 'external' ? (
                                        <input type="url" id="linkTarget" value={linkTarget} onChange={e => setLinkTarget(e.target.value)} placeholder="https://example.com" className={inputStyle} required />
                                    ) : (
                                        <select id="linkTarget" value={linkTarget} onChange={e => setLinkTarget(e.target.value)} className={selectStyle} required>
                                            <option value="">Select...</option>
                                            {linkType === 'brand' && brands.filter(b => !b.isDeleted).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            {linkType === 'product' && products.filter(p => !p.isDiscontinued && !p.isDeleted).map(p => <option key={p.id} value={p.id}>{brands.find(b=>b.id === p.brandId)?.name} - {p.name}</option>)}
                                            {linkType === 'catalogue' && catalogues.filter(c => !c.isDeleted).map(c => <option key={c.id} value={c.id}>{c.title} ({c.year})</option>)}
                                            {linkType === 'pamphlet' && pamphlets.filter(p => !p.isDeleted).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Ad Media</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Upload one or more images or videos.</p>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            {formData.media.map((item, index) => (
                                <div key={index} className="relative group aspect-video">
                                    <LocalMedia src={item.url} alt="Ad preview" type={item.type} className="rounded-xl object-cover w-full h-full" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center rounded-xl">
                                        <button type="button" onClick={() => handleMediaDelete(index)} className="p-2 bg-white/80 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete media">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <label htmlFor="media-upload" className="cursor-pointer aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                                <UploadIcon className="w-8 h-8"/>
                                <span className="mt-2 text-sm font-medium">{formData.media.length > 0 ? 'Add More Media' : 'Add Media'}</span>
                                <input id="media-upload" type="file" multiple onChange={handleMediaChange} className="sr-only" accept="image/*,video/mp4,video/webm" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default AdEdit;