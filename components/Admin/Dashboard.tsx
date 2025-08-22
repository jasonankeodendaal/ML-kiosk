
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Brand, Catalogue, Pamphlet, TvContent } from '../../types';
import AdminSettings from './AdminSettings';
import AdminScreensaverAds from './AdminScreensaverAds';
import { useAppContext } from '../context/AppContext';
import { AdminBackupRestore } from './AdminBackupRestore';
import { PlusIcon, PencilIcon, TrashIcon, CircleStackIcon, ChevronDownIcon, BookOpenIcon, EyeIcon, ServerStackIcon, RestoreIcon, UsersIcon, DocumentTextIcon, DocumentArrowRightIcon, TvIcon, ChartPieIcon } from '../Icons';
import AdminUserManagement from './AdminUserManagement';
import AdminBulkImport from './AdminBulkImport';
import AdminZipBulkImport from './AdminZipBulkImport';
import AdminStorage from './AdminStorage';
import LocalMedia from '../LocalMedia';
import AdminTrash from './AdminTrash';
import AdminPdfConverter from './AdminPdfConverter';
import AdminAnalytics from './AdminAnalytics';

type Tab = 'brands' | 'catalogues' | 'pamphlets' | 'screensaverAds' | 'tv-content' | 'settings' | 'storage' | 'backup' | 'users' | 'trash' | 'pdfConverter' | 'analytics';

const getStatus = (item: Catalogue | Pamphlet) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if ('startDate' in item) { // It's a Pamphlet
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
        endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
        endDate.setHours(23, 59, 59, 999);

        if (endDate < today) return { text: 'Expired', color: 'bg-gray-500' };
        if (startDate > today) return { text: 'Upcoming', color: 'bg-blue-500' };
        return { text: 'Active', color: 'bg-green-500' };
    } else { // It's a Catalogue
        const currentYear = today.getFullYear();
        if (item.year < currentYear) return { text: 'Archived', color: 'bg-gray-500' };
        return { text: 'Current', color: 'bg-green-500' };
    }
};

const AdminContentCard: React.FC<{
    item: Catalogue | Pamphlet;
    type: 'catalogue' | 'pamphlet';
    onDelete: (id: string, title: string) => void;
    allBrands?: Brand[];
    canEdit: boolean;
}> = ({ item, type, onDelete, allBrands, canEdit }) => {
    const navigate = useNavigate();
    const { text: statusText, color: statusColor } = getStatus(item);
    const imageUrl = 'thumbnailUrl' in item ? item.thumbnailUrl : item.imageUrl;
    const brandName = allBrands && 'brandId' in item && item.brandId ? allBrands.find(b => b.id === item.brandId)?.name : null;
    const itemTitle = item.title;

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border border-gray-200/80 dark:border-gray-700/50">
            <div className="relative cursor-pointer" onClick={() => canEdit && navigate(`/admin/${type}/edit/${item.id}`)}>
                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700">
                    <LocalMedia src={imageUrl} alt={itemTitle} type="image" className="w-full h-full object-cover" />
                </div>
                <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full text-white ${statusColor} shadow-md`}>
                    {statusText}
                </span>
            </div>
            <div className="p-4 flex-grow">
                <h4 className="font-bold item-title truncate text-gray-800 dark:text-gray-100" title={itemTitle}>{itemTitle}</h4>
                {'year' in item ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{brandName ? `${brandName} - ${item.year}` : item.year}</p>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.startDate} to {item.endDate}</p>
                )}
            </div>
             {canEdit && (
                <div className="p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-1">
                    <button
                        onClick={() => navigate(`/admin/${type}/edit/${item.id}`)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={`Edit ${itemTitle}`}
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(item.id, itemTitle)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={`Delete ${itemTitle}`}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('brands');
    const [activeBulkImportTab, setActiveBulkImportTab] = useState<'csv' | 'zip'>('csv');
    const { brands, products, catalogues, pamphlets, deleteBrand, deleteCatalogue, deletePamphlet, loggedInUser, logout, storageProvider, showConfirmation, tvContent, deleteTvContent } = useAppContext();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    const handleDeleteBrand = (brandId: string, brandName: string) => {
        showConfirmation(
            `Are you sure you want to move the brand "${brandName}" to the trash? Associated products will be hidden but not deleted.`,
            () => deleteBrand(brandId)
        );
    };
    
    const handleDeleteCatalogue = (id: string, title: string) => {
        showConfirmation(
            `Are you sure you want to move the catalogue "${title}" to the trash?`,
            () => deleteCatalogue(id)
        );
    };

    const handleDeletePamphlet = (id: string, title: string) => {
        showConfirmation(
            `Are you sure you want to move the pamphlet "${title}" to the trash?`,
            () => deletePamphlet(id)
        );
    };

    const handleDeleteTvContent = (id: string, modelName: string) => {
        showConfirmation(
            `Are you sure you want to move the TV content for "${modelName}" to the trash?`,
            () => deleteTvContent(id)
        );
    };
    
    const backupTabLabel = storageProvider === 'customApi' ? 'Cloud Sync' : 'Backup & Restore';

    const TabButton: React.FC<{ tabName: Tab; label: string, icon: React.ReactNode }> = ({ tabName, label, icon }) => (
        <button
            type="button"
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center gap-2 px-3 py-3 font-semibold text-sm rounded-t-lg transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tabName
                    ? 'text-gray-800 dark:text-gray-100 border-gray-800 dark:border-gray-100'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
        >
            {icon} {label}
        </button>
    );
    
    const ContentGrid: React.FC<{ title: string; items: (Catalogue[] | Pamphlet[]); type: 'catalogue' | 'pamphlet'; onDelete: (id: string, title: string) => void; allBrands?: Brand[], canEdit: boolean }> = ({ title, items, type, onDelete, allBrands, canEdit }) => {
        if (items.length === 0) return null;
        return (
            <div>
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 section-heading">{title}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {items.map(item => (
                        <AdminContentCard key={item.id} item={item} type={type} onDelete={onDelete} allBrands={allBrands} canEdit={canEdit} />
                    ))}
                </div>
            </div>
        )
    }

    const EmptyState: React.FC<{ icon: React.ReactNode; title: string; message: string; ctaText: string; ctaLink: string; canAdd: boolean; }> = ({ icon, title, message, ctaText, ctaLink, canAdd }) => (
        <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700/50">
             <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>
             <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
            {canAdd && (
                <div className="mt-6">
                    <Link to={ctaLink} className="btn btn-primary">
                        <PlusIcon className="h-4 w-4" />
                        <span>{ctaText}</span>
                    </Link>
                </div>
            )}
        </div>
    );

    const perms = loggedInUser?.permissions;
    const canManageBrands = loggedInUser?.isMainAdmin || perms?.canManageBrandsAndProducts;
    const canManageCatalogues = loggedInUser?.isMainAdmin || perms?.canManageCatalogues;
    const canManagePamphlets = loggedInUser?.isMainAdmin || perms?.canManagePamphlets;
    const canManageScreensaver = loggedInUser?.isMainAdmin || perms?.canManageScreensaver;
    const canManageSettings = loggedInUser?.isMainAdmin || perms?.canManageSettings;
    const canManageSystem = loggedInUser?.isMainAdmin || perms?.canManageSystem;
    const canManageTvContent = loggedInUser?.isMainAdmin || perms?.canManageTvContent;
    const canViewAnalytics = loggedInUser?.isMainAdmin || perms?.canViewAnalytics;


    const renderContent = () => {
        const titleAndButton = (title: string, addUrl: string, canAdd: boolean) => (
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">{title}</h3>
                {canAdd && (
                    <Link to={addUrl} className="btn btn-primary">
                        <PlusIcon className="h-4 w-4" />
                        <span>Add New</span>
                    </Link>
                )}
            </div>
        );

        switch (activeTab) {
            case 'brands':
                const visibleBrands = brands.filter(b => !b.isDeleted);
                 return (
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Manage Brands</h3>
                                {canManageBrands && (
                                     <Link to="/admin/brand/new" className="btn btn-primary">
                                        <PlusIcon className="h-4 w-4" />
                                        <span>Add New Brand</span>
                                    </Link>
                                )}
                            </div>
                            {visibleBrands.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {visibleBrands.map(brand => (
                                        <div key={brand.id} className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700/50 p-4 flex items-center justify-between gap-4 transition-all hover:shadow-xl hover:-translate-y-1">
                                            <div className="flex items-center gap-4 cursor-pointer flex-1 min-w-0" onClick={() => navigate(`/admin/brand/${brand.id}`)}>
                                                <div className="h-16 w-16 flex items-center justify-center">
                                                    <LocalMedia
                                                      src={brand.logoUrl}
                                                      alt={brand.name}
                                                      type="image"
                                                      className="max-h-full max-w-full object-contain"
                                                      onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src=`https://placehold.co/100x100/E2E8F0/4A5568?text=${brand.name.charAt(0)}`; }}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate item-title">{brand.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{products.filter(p => p.brandId === brand.id && !p.isDiscontinued && !p.isDeleted).length} products</p>
                                                </div>
                                            </div>
                                            {canManageBrands && (
                                                <div className="flex items-center shrink-0">
                                                     <button type="button" onClick={() => navigate(`/admin/brand/edit/${brand.id}`)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Edit Brand">
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={() => handleDeleteBrand(brand.id, brand.name)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Delete Brand">
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<CircleStackIcon className="w-full h-full" />} title="No Brands Found" message="Get started by adding your first brand." ctaText="Add New Brand" ctaLink="/admin/brand/new" canAdd={!!canManageBrands}/>
                            )}
                        </div>
                        {canManageBrands && (
                             <details className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border border-gray-200/80 dark:border-gray-700/50">
                                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <CircleStackIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Bulk Import Products</h3>
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                                        <ChevronDownIcon className="w-5 h-5"/>
                                    </div>
                                </summary>
                                <div className="px-4 sm:px-5 py-6 border-t border-gray-200/80 dark:border-gray-700">
                                    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                            <button
                                                type="button"
                                                onClick={() => setActiveBulkImportTab('csv')}
                                                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${activeBulkImportTab === 'csv' ? 'border-gray-800 dark:border-gray-100 text-gray-800 dark:text-gray-100' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'}`}
                                            >
                                                CSV Upload
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveBulkImportTab('zip')}
                                                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${activeBulkImportTab === 'zip' ? 'border-gray-800 dark:border-gray-100 text-gray-800 dark:text-gray-100' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'}`}
                                            >
                                                Zip Upload
                                            </button>
                                        </nav>
                                    </div>
                                    {activeBulkImportTab === 'csv' && <AdminBulkImport />}
                                    {activeBulkImportTab === 'zip' && <AdminZipBulkImport />}
                                </div>
                            </details>
                        )}
                       
                    </div>
                );
            case 'catalogues':
                const visibleCatalogues = catalogues.filter(c => !c.isDeleted);
                if (visibleCatalogues.length === 0) {
                     return <EmptyState icon={<BookOpenIcon className="w-full h-full" />} title="No Catalogues Found" message="Upload your first digital catalogue." ctaText="Add New Catalogue" ctaLink="/admin/catalogue/new" canAdd={!!canManageCatalogues} />;
                }
                const currentYear = new Date().getFullYear();
                const currentCatalogues = visibleCatalogues.filter(c => c.year === currentYear).sort((a,b) => a.title.localeCompare(b.title));
                const expiredCatalogues = visibleCatalogues.filter(c => c.year < currentYear).sort((a,b) => b.year - a.year || a.title.localeCompare(b.title));
                
                return (
                    <div className="space-y-8">
                        {titleAndButton("Manage Catalogues", "/admin/catalogue/new", !!canManageCatalogues)}
                        <ContentGrid title={`Current Catalogues (${currentYear})`} items={currentCatalogues} type="catalogue" onDelete={handleDeleteCatalogue} allBrands={brands} canEdit={!!canManageCatalogues} />
                        <ContentGrid title="Archived Catalogues" items={expiredCatalogues} type="catalogue" onDelete={handleDeleteCatalogue} allBrands={brands} canEdit={!!canManageCatalogues} />
                    </div>
                );
            case 'pamphlets':
                 const visiblePamphlets = pamphlets.filter(p => !p.isDeleted);
                 if (visiblePamphlets.length === 0) {
                     return <EmptyState icon={<DocumentTextIcon className="w-full h-full" />} title="No Pamphlets Found" message="Create your first promotional pamphlet." ctaText="Add New Pamphlet" ctaLink="/admin/pamphlet/new" canAdd={!!canManagePamphlets} />;
                 }
                 const todayPamphlet = new Date();
                 todayPamphlet.setHours(0, 0, 0, 0);

                 const activePamphlets = visiblePamphlets.filter(p => new Date(p.endDate) >= todayPamphlet && new Date(p.startDate) <= todayPamphlet).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                 const upcomingPamphlets = visiblePamphlets.filter(p => new Date(p.startDate) > todayPamphlet).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                 const expiredPamphlets = visiblePamphlets.filter(p => new Date(p.endDate) < todayPamphlet).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

                 return (
                    <div className="space-y-8">
                        {titleAndButton("Manage Pamphlets", "/admin/pamphlet/new", !!canManagePamphlets)}
                        <ContentGrid title="Active Pamphlets" items={activePamphlets} type="pamphlet" onDelete={handleDeletePamphlet} canEdit={!!canManagePamphlets} />
                        <ContentGrid title="Upcoming Pamphlets" items={upcomingPamphlets} type="pamphlet" onDelete={handleDeletePamphlet} canEdit={!!canManagePamphlets} />
                        <ContentGrid title="Expired Pamphlets" items={expiredPamphlets} type="pamphlet" onDelete={handleDeletePamphlet} canEdit={!!canManagePamphlets} />
                    </div>
                 );
            case 'screensaverAds':
                return <AdminScreensaverAds />;
            case 'tv-content':
                const visibleTvContent = tvContent.filter(tc => !tc.isDeleted);
                const groupedByBrand = visibleTvContent.reduce((acc, content) => {
                    const brandName = brands.find(b => b.id === content.brandId)?.name || 'Unknown Brand';
                    if (!acc[brandName]) acc[brandName] = [];
                    acc[brandName].push(content);
                    return acc;
                }, {} as Record<string, TvContent[]>);

                return (
                    <div className="space-y-8">
                        {titleAndButton("Manage TV Content", "/admin/tv-content/new", !!canManageTvContent)}
                         {Object.keys(groupedByBrand).length > 0 ? Object.entries(groupedByBrand).map(([brandName, contents]) => (
                             <div key={brandName}>
                                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 section-heading">{brandName}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {contents.map(content => (
                                        <div key={content.id} className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700/50 p-4 flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate item-title">{content.modelName}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{content.media.length} media items</p>
                                            </div>
                                            {canManageTvContent && (
                                                <div className="flex items-center shrink-0">
                                                     <button type="button" onClick={() => navigate(`/admin/tv-content/edit/${content.id}`)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Edit TV Content">
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={() => handleDeleteTvContent(content.id, content.modelName)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Delete TV Content">
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                             </div>
                         )) : (
                            <EmptyState icon={<TvIcon className="w-full h-full" />} title="No TV Content Found" message="Get started by adding your first TV model content." ctaText="Add TV Content" ctaLink="/admin/tv-content/new" canAdd={!!canManageTvContent}/>
                         )}
                    </div>
                )
            case 'settings':
                return <AdminSettings />;
            case 'storage':
                return <AdminStorage />;
            case 'backup':
                return <AdminBackupRestore />;
            case 'users':
                return <AdminUserManagement />;
            case 'trash':
                return <AdminTrash />;
            case 'pdfConverter':
                return <AdminPdfConverter />;
            case 'analytics':
                return <AdminAnalytics />;
            default: return null;
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl tracking-tight text-gray-900 dark:text-gray-100 section-heading">Admin Dashboard</h1>
                  {loggedInUser && <p className="text-gray-600 dark:text-gray-400 mt-1">Signed in as {loggedInUser.firstName} {loggedInUser.lastName}</p>}
                </div>
                <button type="button" onClick={handleLogout} className="btn btn-destructive">
                    Logout
                </button>
            </div>
             <p className="text-gray-600 dark:text-gray-400">
                Welcome to the admin panel. All changes made here are live for the current session.
                <br />
                <strong className="font-semibold">Note:</strong> To persist changes across devices or sessions, connect a storage provider and sync your data.
            </p>

            <div>
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex items-center flex-wrap gap-x-8 gap-y-1" aria-label="Tabs">
                        {canManageBrands && <TabButton tabName="brands" label="Brands" icon={<CircleStackIcon className="h-4 w-4"/>} />}
                        {canViewAnalytics && <TabButton tabName="analytics" label="Analytics" icon={<ChartPieIcon className="h-4 w-4"/>} />}
                        {canManageCatalogues && <TabButton tabName="catalogues" label="Catalogues" icon={<BookOpenIcon className="h-4 w-4"/>} />}
                        {canManagePamphlets && <TabButton tabName="pamphlets" label="Pamphlets" icon={<DocumentTextIcon className="h-4 w-4"/>} />}
                        {canManageScreensaver && <TabButton tabName="screensaverAds" label="Screensaver" icon={<EyeIcon className="h-4 w-4"/>} />}
                        {canManageTvContent && <TabButton tabName="tv-content" label="TV Content" icon={<TvIcon className="h-4 w-4"/>} />}
                        {canManageSystem && <TabButton tabName="pdfConverter" label="PDF Converter" icon={<DocumentArrowRightIcon className="h-4 w-4"/>} />}
                        {canManageSettings && <TabButton tabName="settings" label="Settings" icon={<PencilIcon className="h-4 w-4"/>} />}
                        {canManageSystem && <TabButton tabName="storage" label="Storage" icon={<ServerStackIcon className="h-4 w-4"/>} />}
                        {canManageSystem && <TabButton tabName="backup" label={backupTabLabel} icon={<RestoreIcon className="h-4 w-4"/>} />}
                        {loggedInUser?.isMainAdmin && <TabButton tabName="users" label="Users" icon={<UsersIcon className="h-4 w-4"/>}/>}
                        {canManageSystem && <TabButton tabName="trash" label="Trash" icon={<TrashIcon className="h-4 w-4"/>} />}
                    </nav>
                </div>
                
                <div className="bg-gray-100/50 dark:bg-gray-800/20 p-6 rounded-b-2xl rounded-tr-2xl shadow-xl mt-0">
                     {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
