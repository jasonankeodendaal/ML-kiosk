import React from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { RestoreIcon, TrashIcon, TvIcon } from '../Icons.tsx';
import type { Brand, Product, Catalogue, Pamphlet, TvContent } from '../../types.ts';
import { Link } from 'react-router-dom';
import LocalMedia from '../LocalMedia.tsx';

// Reusable component for a trash item row
const TrashItemRow: React.FC<{
    item: { id: string, name: string, logoUrl?: string, type: string, subtext?: string };
    onRestore: () => void;
    onDelete: () => void;
}> = ({ item, onRestore, onDelete }) => (
    <div className="bg-white dark:bg-gray-800/50 p-3 rounded-xl shadow-md border dark:border-gray-700/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
            {item.logoUrl && (
                <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center">
                    <LocalMedia src={item.logoUrl} alt={item.name} type="image" className="max-h-full max-w-full object-contain" />
                </div>
            )}
             {item.type === 'TvContent' && (
                <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <TvIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
            )}
            <div className="min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate item-title">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.subtext}</p>
            </div>
        </div>
        <div className="flex items-center shrink-0">
            <button onClick={onRestore} className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Restore">
                <RestoreIcon className="h-5 w-5" />
            </button>
            <button onClick={onDelete} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Delete Permanently">
                <TrashIcon className="h-5 w-5" />
            </button>
        </div>
    </div>
);


const AdminTrash: React.FC = () => {
    const {
        brands, 
        products,
        catalogues,
        pamphlets,
        tvContent,
        restoreBrand,
        permanentlyDeleteBrand,
        restoreProduct,
        permanentlyDeleteProduct,
        restoreCatalogue,
        permanentlyDeleteCatalogue,
        restorePamphlet,
        permanentlyDeletePamphlet,
        restoreTvContent,
        permanentlyDeleteTvContent,
        showConfirmation,
        loggedInUser
    } = useAppContext();

    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageSystem;

    const deletedBrands = brands.filter(b => b.isDeleted);
    const individuallyDeletedProducts = products.filter(p => p.isDeleted && !brands.find(b => b.id === p.brandId)?.isDeleted);
    const deletedCatalogues = catalogues.filter(c => c.isDeleted);
    const deletedPamphlets = pamphlets.filter(p => p.isDeleted);
    const deletedTvContent = tvContent.filter(tc => tc.isDeleted);

    if (!canManage) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage system settings.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }

    // Handlers for confirmation modals
    const handleRestoreBrand = (brand: Brand) => {
        showConfirmation(
            `Are you sure you want to restore the brand "${brand.name}"? All associated products will also be restored.`,
            () => restoreBrand(brand.id)
        );
    };

    const handleDeleteBrand = (brand: Brand) => {
        showConfirmation(
            `Are you sure you want to PERMANENTLY DELETE the brand "${brand.name}"? This action cannot be undone and will also delete all associated products.`,
            () => permanentlyDeleteBrand(brand.id)
        );
    };
    
    const handleRestoreProduct = (product: Product) => {
        showConfirmation(`Are you sure you want to restore the product "${product.name}"?`, () => restoreProduct(product.id));
    };

    const handleDeleteProduct = (product: Product) => {
        showConfirmation(`Are you sure you want to PERMANENTLY DELETE the product "${product.name}"? This cannot be undone.`, () => permanentlyDeleteProduct(product.id));
    };

    const handleRestoreCatalogue = (catalogue: Catalogue) => {
        showConfirmation(`Are you sure you want to restore the catalogue "${catalogue.title}"?`, () => restoreCatalogue(catalogue.id));
    };

    const handleDeleteCatalogue = (catalogue: Catalogue) => {
        showConfirmation(`Are you sure you want to PERMANENTLY DELETE the catalogue "${catalogue.title}"? This cannot be undone.`, () => permanentlyDeleteCatalogue(catalogue.id));
    };
    
    const handleRestorePamphlet = (pamphlet: Pamphlet) => {
        showConfirmation(`Are you sure you want to restore the pamphlet "${pamphlet.title}"?`, () => restorePamphlet(pamphlet.id));
    };

    const handleDeletePamphlet = (pamphlet: Pamphlet) => {
        showConfirmation(`Are you sure you want to PERMANENTLY DELETE the pamphlet "${pamphlet.title}"? This cannot be undone.`, () => permanentlyDeletePamphlet(pamphlet.id));
    };

    const handleRestoreTvContent = (content: TvContent) => {
        showConfirmation(`Are you sure you want to restore the TV content for "${content.modelName}"?`, () => restoreTvContent(content.id));
    };

    const handleDeleteTvContent = (content: TvContent) => {
        showConfirmation(`Are you sure you want to PERMANENTLY DELETE the TV content for "${content.modelName}"? This cannot be undone.`, () => permanentlyDeleteTvContent(content.id));
    };
    
    const allDeletedItems = [
        ...deletedBrands,
        ...individuallyDeletedProducts,
        ...deletedCatalogues,
        ...deletedPamphlets,
        ...deletedTvContent
    ];

    const TrashSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
        <div>
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 section-heading">{title}</h4>
            <div className="space-y-3">{children}</div>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Trash Bin</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 -mt-6">
                Items moved to trash will be stored here. You can restore them or delete them permanently.
            </p>

            {allDeletedItems.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700/50">
                    <TrashIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">The trash is empty</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Deleted items will appear here.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {deletedBrands.length > 0 && (
                        <TrashSection title="Brands">
                            {deletedBrands.map(brand => (
                                <TrashItemRow 
                                    key={brand.id}
                                    item={{ id: brand.id, name: brand.name, logoUrl: brand.logoUrl, type: 'Brand', subtext: `${products.filter(p => p.brandId === brand.id).length} associated products` }}
                                    onRestore={() => handleRestoreBrand(brand)}
                                    onDelete={() => handleDeleteBrand(brand)}
                                />
                            ))}
                        </TrashSection>
                    )}
                    {individuallyDeletedProducts.length > 0 && (
                         <TrashSection title="Products">
                            {individuallyDeletedProducts.map(product => (
                                <TrashItemRow 
                                    key={product.id}
                                    item={{ id: product.id, name: product.name, logoUrl: product.images[0], type: 'Product', subtext: `Brand: ${brands.find(b => b.id === product.brandId)?.name || 'N/A'}` }}
                                    onRestore={() => handleRestoreProduct(product)}
                                    onDelete={() => handleDeleteProduct(product)}
                                />
                            ))}
                        </TrashSection>
                    )}
                     {deletedCatalogues.length > 0 && (
                        <TrashSection title="Catalogues">
                            {deletedCatalogues.map(catalogue => (
                                <TrashItemRow 
                                    key={catalogue.id}
                                    item={{ id: catalogue.id, name: catalogue.title, logoUrl: catalogue.thumbnailUrl, type: 'Catalogue', subtext: `Year: ${catalogue.year}` }}
                                    onRestore={() => handleRestoreCatalogue(catalogue)}
                                    onDelete={() => handleDeleteCatalogue(catalogue)}
                                />
                            ))}
                        </TrashSection>
                    )}
                     {deletedPamphlets.length > 0 && (
                        <TrashSection title="Pamphlets">
                            {deletedPamphlets.map(pamphlet => (
                                <TrashItemRow 
                                    key={pamphlet.id}
                                    item={{ id: pamphlet.id, name: pamphlet.title, logoUrl: pamphlet.imageUrl, type: 'Pamphlet', subtext: `Dates: ${pamphlet.startDate} to ${pamphlet.endDate}` }}
                                    onRestore={() => handleRestorePamphlet(pamphlet)}
                                    onDelete={() => handleDeletePamphlet(pamphlet)}
                                />
                            ))}
                        </TrashSection>
                    )}
                    {deletedTvContent.length > 0 && (
                        <TrashSection title="TV Content">
                            {deletedTvContent.map(content => (
                                <TrashItemRow
                                    key={content.id}
                                    item={{ id: content.id, name: content.modelName, type: 'TvContent', subtext: `Brand: ${brands.find(b => b.id === content.brandId)?.name || 'N/A'}` }}
                                    onRestore={() => handleRestoreTvContent(content)}
                                    onDelete={() => handleDeleteTvContent(content)}
                                />
                            ))}
                        </TrashSection>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminTrash;