



import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ScreensaverAd, AdLink, Brand, Product, Catalogue, Pamphlet } from '../../types.ts';
import { TrashIcon, PencilIcon, PlusIcon } from '../Icons.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import LocalMedia from '../LocalMedia.tsx';

const getLinkText = (link: AdLink | undefined, allData: { brands: Brand[], products: Product[], catalogues: Catalogue[], pamphlets: Pamphlet[] }): string => {
    if (!link) return "None";
    switch (link.type) {
        case 'brand':
            return `Brand: ${allData.brands.find(b => b.id === link.id)?.name || 'N/A'}`;
        case 'product':
            return `Product: ${allData.products.find(p => p.id === link.id)?.name || 'N/A'}`;
        case 'catalogue':
            return `Catalogue: ${allData.catalogues.find(c => c.id === link.id)?.title || 'N/A'}`;
        case 'pamphlet':
            return `Pamphlet: ${allData.pamphlets.find(p => p.id === link.id)?.title || 'N/A'}`;
        case 'external':
            return `External: ${link.url}`;
        default:
            return "Unknown Link";
    }
};


const AdCard: React.FC<{
    item: ScreensaverAd;
    onDelete: (id: string, title: string) => void;
    allData: any;
    canEdit: boolean;
}> = ({ item, onDelete, allData, canEdit }) => {
    const navigate = useNavigate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(item.endDate);
    endDate.setHours(23, 59, 59, 999);
    const isExpired = endDate < today;
    const statusText = isExpired ? 'Expired' : 'Active';
    const statusColor = isExpired ? 'bg-gray-500' : 'bg-green-500';
    const firstMedia = item.media && item.media.length > 0 ? item.media[0] : null;

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border border-gray-200/80 dark:border-gray-700/50">
             <div className="relative cursor-pointer" onClick={() => canEdit && navigate(`/admin/ad/${item.id}`)}>
                <div className="aspect-video bg-gray-900">
                    {firstMedia ? (
                        <LocalMedia src={firstMedia.url} alt={item.title} type={firstMedia.type} className="w-full h-full object-cover" muted={firstMedia.type === 'video'} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">No media</div>
                    )}
                </div>
                <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full text-white ${statusColor} shadow-md`}>
                    {statusText}
                </span>
            </div>
            <div className="p-4 flex-grow">
                <h4 className="font-bold item-title truncate text-gray-800 dark:text-gray-100" title={item.title}>{item.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={getLinkText(item.link, allData)}>
                    Link: {getLinkText(item.link, allData)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.startDate} to {item.endDate}</p>
            </div>
            {canEdit && (
                 <div className="p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-1">
                    <button
                        onClick={() => navigate(`/admin/ad/${item.id}`)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={`Edit ${item.title}`}
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(item.id, item.title)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={`Delete ${item.title}`}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};


const AdminScreensaverAds: React.FC = () => {
    const { screensaverAds, deleteAd, brands, products, catalogues, pamphlets, showConfirmation, loggedInUser } = useAppContext();
    const navigate = useNavigate();
    
    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageScreensaver;

    const handleDeleteAd = (id: string, title: string) => {
        showConfirmation(
            `Are you sure you want to delete the ad "${title}"?`,
            () => deleteAd(id)
        );
    };

    const { activeAds, expiredAds } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const active: ScreensaverAd[] = [];
        const expired: ScreensaverAd[] = [];

        screensaverAds.forEach(ad => {
            const endDate = new Date(ad.endDate);
            endDate.setHours(23, 59, 59, 999);
            if (endDate < today) {
                expired.push(ad);
            } else {
                active.push(ad);
            }
        });
        
        active.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        expired.sort((a,b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

        return { activeAds: active, expiredAds: expired };

    }, [screensaverAds]);
    
    const allData = { brands, products, catalogues, pamphlets };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Manage Screensaver Ads</h3>
                {canManage && (
                    <button onClick={() => navigate('/admin/ad/new')} className="btn btn-primary">
                        <PlusIcon className="h-4 w-4" />
                        New Ad
                    </button>
                 )}
            </div>
            
            {activeAds.length > 0 && (
                 <div>
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 section-heading">Active & Upcoming Ads</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {activeAds.map(ad => <AdCard key={ad.id} item={ad} onDelete={handleDeleteAd} allData={allData} canEdit={!!canManage} />)}
                    </div>
                </div>
            )}

             {expiredAds.length > 0 && (
                 <div>
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 section-heading">Expired Ads</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {expiredAds.map(ad => <AdCard key={ad.id} item={ad} onDelete={handleDeleteAd} allData={allData} canEdit={!!canManage} />)}
                    </div>
                </div>
            )}

            {activeAds.length === 0 && expiredAds.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700/50">
                    <p className="text-gray-500 dark:text-gray-400">No screensaver ads have been created yet.</p>
                </div>
            )}
        </div>
    );
};

export default AdminScreensaverAds;