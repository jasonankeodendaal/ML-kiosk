import React from 'react';
import { useAppContext } from './context/AppContext';
import { ArrowDownTrayIcon } from './Icons';

const InstallPrompt: React.FC = () => {
  const { deferredPrompt, triggerInstallPrompt } = useAppContext();

  if (!deferredPrompt) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
      <div className="flex items-center gap-4">
         <div className="hidden sm:block flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-[var(--primary-color)] text-white shadow-lg">
            <ArrowDownTrayIcon className="h-8 w-8" />
         </div>
         <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 section-heading">Install the App</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Get a faster, integrated experience by installing the app on your device.
            </p>
         </div>
      </div>
      <button onClick={triggerInstallPrompt} className="btn btn-primary mt-4 sm:mt-0 flex-shrink-0">
        <ArrowDownTrayIcon className="h-5 w-5" />
        <span>Install App</span>
      </button>
    </div>
  );
};

export default InstallPrompt;
