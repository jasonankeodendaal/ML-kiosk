

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { AdminUser, AdminUserPermissions } from '../../types.ts';
import { ChevronLeftIcon, SaveIcon } from '../Icons.tsx';
import { useAppContext } from '../context/AppContext.tsx';

const inputStyle = "mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 sm:text-sm";
const checkboxStyle = "h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 disabled:opacity-50";

const getInitialFormData = (): AdminUser => ({
    id: `au_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    firstName: '',
    lastName: '',
    tel: '',
    pin: '',
    isMainAdmin: false,
    permissions: {
        canManageBrandsAndProducts: false,
        canManageCatalogues: false,
        canManagePamphlets: false,
        canManageScreensaver: false,
        canManageSettings: false,
        canManageSystem: false,
        canManageTvContent: false,
        canViewAnalytics: false,
    },
});

const PermissionCheckbox: React.FC<{
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
}> = ({ id, label, description, checked, onChange, disabled }) => (
    <div className="relative flex items-start">
        <div className="flex h-5 items-center">
            <input
                id={id}
                type="checkbox"
                className={checkboxStyle}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor={id} className={`font-medium text-gray-700 dark:text-gray-300 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                {label}
            </label>
            <p className={`text-gray-500 dark:text-gray-400 ${disabled ? 'opacity-50' : ''}`}>
                {description}
            </p>
        </div>
    </div>
);

const AdminUserEdit: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { adminUsers, addAdminUser, updateAdminUser, loggedInUser } = useAppContext();

    const isEditing = Boolean(userId);
    const [editableUser, setEditableUser] = useState<AdminUser>(getInitialFormData());
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isEditing && userId) {
            const user = adminUsers.find(u => u.id === userId);
            if (user) {
                setEditableUser(user);
            }
        } else {
            setEditableUser(getInitialFormData());
        }
    }, [userId, adminUsers, isEditing]);

    if (!loggedInUser?.isMainAdmin) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage users.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditableUser({ ...editableUser, [e.target.name]: e.target.value });
    };
    
    const handlePermissionChange = (permission: keyof AdminUserPermissions, value: boolean) => {
        setEditableUser(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permission]: value,
            },
        }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if(!editableUser.firstName || !editableUser.lastName || !editableUser.pin) {
            alert('Please fill out First Name, Surname, and PIN.');
            return;
        }
        if (!/^\d{4}$/.test(editableUser.pin)) {
            alert('PIN must be exactly 4 digits.');
            return;
        }

        const pinExists = adminUsers.some(u => u.pin === editableUser.pin && u.id !== editableUser.id);
        if (pinExists) {
            alert('This PIN is already in use. Please choose another.');
            return;
        }

        setSaving(true);
        if (isEditing) {
            updateAdminUser(editableUser);
            setTimeout(() => {
                setSaving(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }, 300);
        } else {
            addAdminUser(editableUser);
            setTimeout(() => {
                setSaving(false);
                navigate(`/admin/user/edit/${editableUser.id}`, { replace: true });
            }, 300);
        }
    };
    
    const canEditPermissions = loggedInUser.isMainAdmin && !editableUser.isMainAdmin;

    return (
        <form onSubmit={handleSave} className="space-y-8">
            <div>
                <Link to="/admin" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Back to Dashboard
                </Link>
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-3xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate section-heading">
                            {isEditing ? 'Edit Admin User' : 'Create New Admin User'}
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                         <button
                            type="submit"
                            disabled={saving || saved}
                            className={`btn btn-primary ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}
                        >
                            <SaveIcon className="h-4 w-4" />
                            {saving ? 'Saving...' : (saved ? 'Saved!' : 'Save User')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8 items-start">
                <div className="col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 section-heading">User Details</h3>
                        <div className="mt-6 grid grid-cols-2 gap-6">
                            <div className="col-span-1">
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                                <input type="text" name="firstName" id="firstName" value={editableUser.firstName} onChange={handleInputChange} className={inputStyle} required />
                            </div>
                            <div className="col-span-1">
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Surname</label>
                                <input type="text" name="lastName" id="lastName" value={editableUser.lastName} onChange={handleInputChange} className={inputStyle} required />
                            </div>
                            <div className="col-span-1">
                                <label htmlFor="tel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Tel</label>
                                <input type="tel" name="tel" id="tel" value={editableUser.tel} onChange={handleInputChange} className={inputStyle} />
                            </div>
                            <div className="col-span-1">
                                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">4-Digit PIN</label>
                                <input type="password" name="pin" id="pin" value={editableUser.pin} onChange={handleInputChange} className={inputStyle} required maxLength={4} pattern="[0-9]{4}" title="PIN must be 4 digits" />
                            </div>
                        </div>
                    </div>
                </div>
                
                 <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 section-heading">User Permissions</h3>
                     <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {canEditPermissions ? 'Select the sections this user can access.' : 'Permissions can only be changed by the Main Admin.'}
                    </p>
                    <div className="mt-6 space-y-5">
                        <PermissionCheckbox
                            id="perm-brands"
                            label="Manage Brands & Products"
                            description="Can add, edit, and delete brands and products."
                            checked={editableUser.permissions.canManageBrandsAndProducts}
                            onChange={e => handlePermissionChange('canManageBrandsAndProducts', e.target.checked)}
                            disabled={!canEditPermissions}
                        />
                         <PermissionCheckbox
                            id="perm-catalogues"
                            label="Manage Catalogues"
                            description="Can add, edit, and delete catalogues."
                            checked={editableUser.permissions.canManageCatalogues}
                            onChange={e => handlePermissionChange('canManageCatalogues', e.target.checked)}
                            disabled={!canEditPermissions}
                        />
                         <PermissionCheckbox
                            id="perm-pamphlets"
                            label="Manage Pamphlets"
                            description="Can add, edit, and delete pamphlets."
                            checked={editableUser.permissions.canManagePamphlets}
                            onChange={e => handlePermissionChange('canManagePamphlets', e.target.checked)}
                            disabled={!canEditPermissions}
                        />
                         <PermissionCheckbox
                            id="perm-screensaver"
                            label="Manage Screensaver"
                            description="Can add, edit, and delete screensaver ads."
                            checked={editableUser.permissions.canManageScreensaver}
                            onChange={e => handlePermissionChange('canManageScreensaver', e.target.checked)}
                            disabled={!canEditPermissions}
                        />
                         <PermissionCheckbox
                            id="perm-tv"
                            label="Manage TV Content"
                            description="Can add, edit, and delete TV display content."
                            checked={editableUser.permissions.canManageTvContent}
                            onChange={e => handlePermissionChange('canManageTvContent', e.target.checked)}
                            disabled={!canEditPermissions}
                        />
                        <PermissionCheckbox
                            id="perm-settings"
                            label="Manage Settings"
                            description="Can change kiosk settings like themes and layout."
                            checked={editableUser.permissions.canManageSettings}
                            onChange={e => handlePermissionChange('canManageSettings', e.target.checked)}
                            disabled={!canEditPermissions}
                        />
                         <PermissionCheckbox
                            id="perm-system"
                            label="Manage System"
                            description="Can access Storage, Backup/Restore, and Trash."
                            checked={editableUser.permissions.canManageSystem}
                            onChange={e => handlePermissionChange('canManageSystem', e.target.checked)}
                            disabled={!canEditPermissions}
                        />
                        <PermissionCheckbox
                            id="perm-analytics"
                            label="View Analytics"
                            description="Can view kiosk analytics and usage data."
                            checked={editableUser.permissions.canViewAnalytics}
                            onChange={e => handlePermissionChange('canViewAnalytics', e.target.checked)}
                            disabled={!canEditPermissions}
                        />
                    </div>
                </div>
            </div>
        </form>
    );
};

export default AdminUserEdit;