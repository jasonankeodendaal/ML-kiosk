
import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import type { BackupData } from '../../types.ts';
import { Link } from 'react-router-dom';

const CloudSync: React.FC = () => {
    const { pushToCloud, pullFromCloud } = useAppContext();
    const [isPushing, setIsPushing] = useState(false);
    const [isPulling, setIsPulling] = useState(false);

    const handlePush = async () => {
        setIsPushing(true);
        await pushToCloud();
        setIsPushing(false);
    };

    const handlePull = async () => {
        setIsPulling(true);
        await pullFromCloud();
        setIsPulling(false);
    };
    
    const providerName = 'Custom API';

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Push to Cloud</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Send your current local data to the <span className="font-semibold">{providerName}</span> server. This will <strong className="font-semibold text-yellow-600 dark:text-yellow-400">overwrite</strong> the data currently on the server.
                </p>
                <div className="mt-6">
                    <button type="button" onClick={handlePush} disabled={isPushing || isPulling} className="btn btn-primary">{isPushing ? 'Pushing...' : 'Push to Cloud'}</button>
                </div>
            </div>
             <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Pull from Cloud</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Retrieve the latest data from the <span className="font-semibold">{providerName}</span> server. This will <strong className="font-semibold text-yellow-600 dark:text-yellow-400">overwrite</strong> your current local data.
                </p>
                <div className="mt-6">
                    <button type="button" onClick={handlePull} disabled={isPushing || isPulling} className="btn btn-primary">{isPulling ? 'Pulling...' : 'Pull from Cloud'}</button>
                </div>
            </div>
        </div>
    )
}

const LocalFileBackup: React.FC = () => {
    const { brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, restoreBackup, showConfirmation } = useAppContext();
    const [fileName, setFileName] = useState<string>('');
    const [isRestoring, setIsRestoring] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCreateBackup = () => {
        const backupData: BackupData = { brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        const date = new Date().toISOString().split('T')[0];
        link.download = `kiosk-backup-${date}.json`;
        link.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        } else {
            setFileName('');
        }
    };
    
    const handleRestore = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fileInput = fileInputRef.current;
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            alert('Please select a backup file to restore.');
            return;
        }
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result;
                if (typeof result !== 'string') throw new Error("Failed to read file.");
                const data = JSON.parse(result);
                if (!data.brands || !data.products || !data.settings) throw new Error("Invalid backup file format.");
                
                showConfirmation("Are you sure you want to restore? This will overwrite all current data.", () => {
                    setIsRestoring(true);
                    restoreBackup(data);
                    setTimeout(() => {
                        alert("Restore successful!");
                        setFileName('');
                        if (fileInputRef.current) fileInputRef.current.value = "";
                        setIsRestoring(false);
                    }, 100);
                });

            } catch (error) {
                alert(`Error restoring backup: ${error instanceof Error ? error.message : "Unknown error"}`);
                setIsRestoring(false);
            }
        };
        reader.readAsText(file);
    };

    return (
         <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Create Local Backup</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Download a complete backup file of all application data to your computer. Store this file in a safe place.
                </p>
                <div className="mt-6">
                    <button type="button" onClick={handleCreateBackup} className="btn btn-primary">Download Backup File</button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Restore from Local Backup</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Restore the application state from a backup file. <strong className="font-semibold text-yellow-600 dark:text-yellow-400">Warning:</strong> This will overwrite all current data.
                </p>
                <form onSubmit={handleRestore} className="mt-4 space-y-4">
                    <div className="mt-1">
                         <label htmlFor="restore-file-upload" className="w-full cursor-pointer flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                <span className="relative rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"><span>Upload a file</span></span>
                                <input ref={fileInputRef} id="restore-file-upload" type="file" className="sr-only" accept=".json" onChange={handleFileChange} />
                            </div>
                        </label>
                        {fileName && <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Selected: <span className="font-semibold">{fileName}</span></p>}
                    </div>
                    <div className="mt-4">
                        <button type="submit" className="btn btn-destructive w-full" disabled={isRestoring || !fileName}>{isRestoring ? 'Restoring...' : 'Restore from Backup'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const LocalNetworkSync: React.FC = () => {
    const { saveDatabaseToLocal, loadDatabaseFromLocal, showConfirmation } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await saveDatabaseToLocal();
        setIsSaving(false);
    };

    const handleLoad = async () => {
        showConfirmation(
            "Are you sure you want to load data from the drive? This will overwrite all current local data.",
            async () => {
                setIsLoading(true);
                await loadDatabaseFromLocal(false, true); // Force non-silent, confirmed load
                setIsLoading(false);
            }
        );
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Save to Drive</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Save the current local data to the `database.json` file in your connected folder. This will overwrite the existing file on the drive.
                </p>
                <div className="mt-6">
                    <button type="button" onClick={handleSave} disabled={isSaving || isLoading} className="btn btn-primary">{isSaving ? 'Saving...' : 'Save to Drive'}</button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Load from Drive</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Load data from the `database.json` file in your connected folder. This will <strong className="font-semibold text-yellow-600 dark:text-yellow-400">overwrite</strong> your current local data.
                </p>
                <div className="mt-6">
                     <button type="button" onClick={handleLoad} disabled={isSaving || isLoading} className="btn btn-primary">{isLoading ? 'Loading...' : 'Load from Drive'}</button>
                </div>
            </div>
        </div>
    )
}

export const AdminBackupRestore: React.FC = () => {
    const { storageProvider, loggedInUser } = useAppContext();

    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageSystem;
    
    if (!canManage) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage system settings.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }

    switch (storageProvider) {
        case 'customApi':
            return <CloudSync />;
        case 'local':
            return <LocalNetworkSync />;
        case 'none':
        default:
            return <LocalFileBackup />;
    }
};