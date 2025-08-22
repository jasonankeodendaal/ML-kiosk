
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { TvContent } from '../../types';
import { ChevronLeftIcon, SaveIcon, UploadIcon, TrashIcon } from '../Icons';
import { useAppContext } from '../context/AppContext';
import LocalMedia from '../LocalMedia';

const inputStyle = "mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 sm:text-sm";
const selectStyle = inputStyle;

const getInitialFormData = (): TvContent => ({
    id: `tv_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    brandId: '',
    modelName: '',
    media: [],
});

const TvContentEdit: React.FC = () => {
    const { contentId } = useParams<{ contentId: string }>();
    const navigate = useNavigate();
    const { tvContent, addTvContent, updateTvContent, brands, saveFileToStorage, loggedInUser } = useAppContext();
    const isEditing = Boolean(contentId);

    const [formData, setFormData] = useState<TvContent>(getInitialFormData());
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageTvContent;
    const availableBrands = brands.filter(b => !b.isDeleted);

    useEffect(() => {
        if (isEditing && contentId) {
            const content = tvContent.find(c => c.id === contentId);
            if (content) setFormData(content);
        } else {
            setFormData(getInitialFormData());
        }
    }, [contentId, tvContent, isEditing]);

    if (!canManage) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage TV content.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            for (const file of Array.from(e.target.files)) {
                const fileType = file.type.startsWith('image/') ? 'image' : 'video';
                try {
                    const fileName = await saveFileToStorage(file);
                    setFormData(prev => ({ ...prev, media: [...prev.media, { url: fileName, type: fileType }] }));
                } catch (error) {
                    alert(error instanceof Error ? error.message : "Failed to save media file.");
                }
            }
            e.target.value = '';
        }
    };

    const handleMediaDelete = (indexToDelete: number) => {
        setFormData(prev => ({ ...prev, media: prev.media.filter((_, index) => index !== indexToDelete) }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.brandId || !formData.modelName || formData.media.length === 0) {
            alert("Please select a brand, provide a model name, and upload at least one media file.");
            return;
        }

        setSaving(true);
        if (isEditing) {
            updateTvContent(formData);
        } else {
            addTvContent(formData);
        }

        setTimeout(() => {
            setSaving(false);
            if(isEditing){
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } else {
                navigate(`/admin/tv-content/edit/${formData.id}`, { replace: true });
            }
        }, 300);
    };

    return (
        <form onSubmit={handleSave} className="space-y-8">
            <div>
                <Link to="/admin" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Back to Dashboard
                </Link>
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-3xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate">
                             {isEditing ? 'Edit TV Content' : 'Add New TV Content'}
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                         <button type="submit" disabled={saving || saved} className={`btn btn-primary ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}>
                            <SaveIcon className="h-4 w-4" />
                            {saving ? 'Saving...' : (saved ? 'Saved!' : 'Save Content')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                 <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 section-heading">Content Details</h3>
                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                                <label htmlFor="brandId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand</label>
                                <select id="brandId" name="brandId" value={formData.brandId} onChange={handleInputChange} className={selectStyle} required>
                                    <option value="">Select a brand...</option>
                                    {availableBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="sm:col-span-1">
                                <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model Name</label>
                                <input type="text" name="modelName" id="modelName" value={formData.modelName} onChange={handleInputChange} className={inputStyle} required/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 section-heading">Media Files</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Upload images or videos for the playback loop.</p>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            {formData.media.map((item, index) => (
                                <div key={index} className="relative group aspect-video">
                                    <LocalMedia src={item.url} alt="Media preview" type={item.type} className="rounded-xl object-cover w-full h-full" />
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

export default TvContentEdit;
