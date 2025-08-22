
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Brand } from '../../types';
import { ChevronLeftIcon, SaveIcon, UploadIcon } from '../Icons';
import { useAppContext } from '../context/AppContext';
import LocalMedia from '../LocalMedia';

const inputStyle = "mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 sm:text-sm";

const getInitialFormData = (): Brand => ({
    id: `b_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name: '',
    logoUrl: '',
});

const BrandEdit: React.FC = () => {
    const { brandId } = useParams<{ brandId: string }>();
    const navigate = useNavigate();
    const { brands, addBrand, updateBrand, saveFileToStorage, loggedInUser } = useAppContext();

    const isEditing = Boolean(brandId);
    const [formData, setFormData] = useState<Brand>(getInitialFormData());
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageBrandsAndProducts;

    useEffect(() => {
        if (isEditing) {
            const brand = brands.find(b => b.id === brandId);
            if (brand) {
                setFormData(brand);
            }
        } else {
            setFormData(getInitialFormData());
        }
    }, [brandId, brands, isEditing]);

    if (!canManage) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage brands and products.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const fileName = await saveFileToStorage(e.target.files[0]);
                setFormData(prev => ({ ...prev, logoUrl: fileName }));
            } catch (error) {
                alert(error instanceof Error ? error.message : "Failed to save file.");
            }
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.logoUrl) {
            alert('Please provide a brand name and logo.');
            return;
        }
        setSaving(true);
        if (isEditing) {
            updateBrand(formData);
            setTimeout(() => {
                setSaving(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }, 300);
        } else {
            addBrand(formData);
            setTimeout(() => {
                setSaving(false);
                navigate(`/admin/brand/edit/${formData.id}`, { replace: true });
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
                            {isEditing ? 'Edit Brand' : 'Create New Brand'}
                        </h2>
                        {isEditing && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Editing "{formData.name}"</p>}
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                         <button
                            type="submit"
                            disabled={saving || saved}
                            className={`btn btn-primary ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}
                        >
                            <SaveIcon className="h-4 w-4" />
                            {saving ? 'Saving...' : (saved ? 'Saved!' : 'Save Brand')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Brand Details</h3>
                <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className={inputStyle} required />
                    </div>
                    
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="h-16 w-16 flex items-center justify-center">
                                <LocalMedia src={formData.logoUrl} alt="Logo Preview" type="image" className="max-h-full max-w-full object-contain" />
                            </div>
                            <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <UploadIcon className="h-4 w-4" />
                                <span>{formData.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                            </label>
                            <input id="logo-upload" name="logoUrl" type="file" className="sr-only" onChange={handleLogoChange} accept="image/png, image/jpeg, image/svg+xml" />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default BrandEdit;
