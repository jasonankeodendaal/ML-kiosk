import React, { useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Brand, Product } from '../../types';
import { ChevronLeftIcon, PlusIcon, TrashIcon, PencilIcon, CubeIcon, EyeIcon, EyeOffIcon, ChevronDownIcon } from '../Icons';
import { useAppContext } from '../context/AppContext';
import LocalMedia from '../LocalMedia';

const CategoryManager: React.FC<{ brandId: string; }> = ({ brandId }) => {
    const { categories, addCategory, updateCategory, deleteCategory, showConfirmation } = useAppContext();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null);

    const brandCategories = useMemo(() => {
        return categories.filter(c => c.brandId === brandId && !c.isDeleted).sort((a,b) => a.name.localeCompare(b.name));
    }, [categories, brandId]);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            addCategory({
                id: `cat_${Date.now()}`,
                name: newCategoryName.trim(),
                brandId,
            });
            setNewCategoryName('');
        }
    };

    const handleUpdateCategory = () => {
        if (editingCategory && editingCategory.name.trim()) {
            updateCategory({ id: editingCategory.id, name: editingCategory.name.trim(), brandId });
            setEditingCategory(null);
        }
    };

    const handleDeleteCategory = (id: string, name: string) => {
        showConfirmation(
            `Are you sure you want to move the category "${name}" to the trash? Products in this category will become uncategorized.`,
            () => deleteCategory(id)
        );
    };

    return (
        <details className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border border-gray-200/80 dark:border-gray-700/50">
            <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Manage Categories</h3>
                 <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                    <ChevronDownIcon className="w-5 h-5"/>
                </div>
            </summary>
            <div className="p-4 sm:p-5 border-t border-gray-200/80 dark:border-gray-700 space-y-4">
                <form onSubmit={handleAddCategory} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category name..."
                        className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 px-3 text-sm"
                    />
                    <button type="submit" className="btn btn-primary"><PlusIcon className="h-4 w-4" /> Add</button>
                </form>
                <div className="space-y-2">
                    {brandCategories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                            {editingCategory?.id === cat.id ? (
                                <input
                                    type="text"
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-sm"
                                    onBlur={handleUpdateCategory}
                                    onKeyDown={e => e.key === 'Enter' && handleUpdateCategory()}
                                    autoFocus
                                />
                            ) : (
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{cat.name}</p>
                            )}
                            <div className="flex items-center gap-1">
                                <button onClick={() => setEditingCategory({ id: cat.id, name: cat.name })} className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"><PencilIcon className="h-4 w-4" /></button>
                                <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                        </div>
                    ))}
                    {brandCategories.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No categories created yet.</p>}
                </div>
            </div>
        </details>
    );
};

// Reusable card for a product in the admin panel
const AdminProductCard: React.FC<{
    product: Product;
    onEdit: (id: string) => void;
    onToggleStatus: (id: string, name: string) => void;
    onDelete: (id: string, name: string) => void;
}> = ({ product, onEdit, onToggleStatus, onDelete }) => {
    const isDiscontinued = product.isDiscontinued;

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border border-gray-200/80 dark:border-gray-700/50">
            <div className="relative cursor-pointer" onClick={() => onEdit(product.id)}>
                <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                    <LocalMedia src={product.images[0]} alt={product.name} type="image" className="w-full h-full object-cover" />
                </div>
                <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full text-white ${isDiscontinued ? 'bg-gray-500' : 'bg-green-500'} shadow-md`}>
                    {isDiscontinued ? 'Discontinued' : 'Active'}
                </span>
            </div>
            <div className="p-4 flex-grow">
                <h4 className="font-bold item-title truncate text-gray-800 dark:text-gray-100" title={product.name}>{product.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-1">
                <button onClick={() => onEdit(product.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Edit">
                    <PencilIcon className="h-4 w-4" />
                </button>
                <button onClick={() => onToggleStatus(product.id, product.name)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title={isDiscontinued ? 'Activate Product' : 'Discontinue Product'}>
                     {isDiscontinued ? <EyeIcon className="h-4 w-4 text-green-500" /> : <EyeOffIcon className="h-4 w-4 text-orange-500" />}
                </button>
                <button onClick={() => onDelete(product.id, product.name)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Delete">
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};


const AdminBrandProducts: React.FC = () => {
    const { brandId } = useParams<{ brandId: string }>();
    const navigate = useNavigate();
    const { brands, products, deleteProduct, updateProduct, showConfirmation, loggedInUser } = useAppContext();
    
    const brand = useMemo(() => brands.find((b: Brand) => b.id === brandId), [brandId, brands]);
    
    const { activeProducts, discontinuedProducts } = useMemo(() => {
        const allBrandProducts = products.filter((p: Product) => p.brandId === brandId && !p.isDeleted);
        return {
            activeProducts: allBrandProducts.filter(p => !p.isDiscontinued),
            discontinuedProducts: allBrandProducts.filter(p => p.isDiscontinued),
        };
    }, [brandId, products]);

    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageBrandsAndProducts;
    
    if (!canManage) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage brands and products.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }

    const handleToggleStatus = useCallback((productId: string, productName: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const isCurrentlyDiscontinued = product.isDiscontinued;
            const confirmationMessage = isCurrentlyDiscontinued
                ? `Are you sure you want to restore the product "${productName}"? It will become publicly visible again.`
                : `Are you sure you want to discontinue the product "${productName}"? It will be hidden from the public.`;

            showConfirmation(confirmationMessage, () => {
                updateProduct({ ...product, isDiscontinued: !isCurrentlyDiscontinued });
            });
        }
    }, [products, showConfirmation, updateProduct]);

    const handleDelete = useCallback((productId: string, productName: string) => {
        showConfirmation(
            `Are you sure you want to move the product "${productName}" to the trash?`,
            () => deleteProduct(productId)
        );
    }, [deleteProduct, showConfirmation]);

    const handleEdit = useCallback((productId: string) => {
        navigate(`/admin/product/${productId}`);
    }, [navigate]);

    if (!brand) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold">Brand not found</h2>
                <button onClick={() => navigate('/admin')} className="text-blue-600 hover:underline mt-4 inline-block">Go back to dashboard</button>
            </div>
        );
    }

    const ProductGrid: React.FC<{prods: Product[]}> = ({ prods }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {prods.map(product => (
                <AdminProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Link to="/admin" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Back to Dashboard
                </Link>
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 flex items-center justify-center">
                           <LocalMedia src={brand.logoUrl} alt={brand.name} type="image" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate section-heading">
                                {brand.name}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{activeProducts.length} Active, {discontinuedProducts.length} Discontinued</p>
                        </div>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                         <Link
                            to={`/admin/product/new/${brandId}`}
                            className="btn btn-primary"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add New Product
                        </Link>
                    </div>
                </div>
            </div>

            {canManage && <CategoryManager brandId={brand.id} />}

            {/* Product Grids */}
            <div className="space-y-12">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 section-heading">Active Products</h3>
                     {activeProducts.length > 0 ? (
                        <ProductGrid prods={activeProducts} />
                    ) : (
                         <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700">
                            <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Active Products</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding the first product to this brand.</p>
                            <div className="mt-6">
                                <Link to={`/admin/product/new/${brandId}`} className="btn btn-primary">
                                    <PlusIcon className="h-4 w-4" />
                                    <span>Add Product</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
                 {discontinuedProducts.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 section-heading">Discontinued Products</h3>
                        <ProductGrid prods={discontinuedProducts} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBrandProducts;