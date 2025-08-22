
import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ChartBarIcon, CubeIcon } from '../Icons';

const AdminAnalytics: React.FC = () => {
    const { brands, products, viewCounts } = useAppContext();

    const brandData = useMemo(() => {
        if (!viewCounts?.brands) return [];
        return Object.entries(viewCounts.brands)
            .map(([brandId, count]) => {
                const brand = brands.find(b => b.id === brandId);
                return {
                    id: brandId,
                    name: brand?.name || `Deleted Brand (${brandId})`,
                    count: count,
                };
            })
            .filter(b => b.count > 0)
            .sort((a, b) => b.count - a.count);
    }, [viewCounts.brands, brands]);

    const productData = useMemo(() => {
        if (!viewCounts?.products) return [];
        return Object.entries(viewCounts.products)
            .map(([productId, count]) => {
                const product = products.find(p => p.id === productId);
                const brand = brands.find(b => b.id === product?.brandId);
                return {
                    id: productId,
                    name: product?.name || `Deleted Product (${productId})`,
                    brandName: brand?.name || 'N/A',
                    count: count,
                };
            })
            .filter(p => p.count > 0)
            .sort((a, b) => b.count - a.count);
    }, [viewCounts.products, products, brands]);
    
    const maxBrandViews = brandData.length > 0 ? Math.max(...brandData.map(b => b.count)) : 0;
    const maxProductViews = productData.length > 0 ? Math.max(...productData.map(p => p.count)) : 0;
    
    const EmptyState: React.FC<{ title: string, message: string, icon: React.ReactNode }> = ({ title, message, icon }) => (
        <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700/50">
             <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>
             <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Kiosk Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 -mt-6">
                View simple analytics based on customer interactions. Counts are incremented each time a brand or product page is viewed.
            </p>

            <div className="grid grid-cols-2 gap-8">
                {/* Most Viewed Brands */}
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading mb-4">Most Viewed Brands</h4>
                    {brandData.length > 0 ? (
                        <ul className="space-y-4">
                            {brandData.slice(0, 10).map((brand, index) => (
                                <li key={brand.id}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{index + 1}. {brand.name}</span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{brand.count} views</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${maxBrandViews > 0 ? (brand.count / maxBrandViews) * 100 : 0}%` }}></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                       <EmptyState title="No Brand Data" message="No brands have been viewed yet." icon={<ChartBarIcon className="w-full h-full" />} />
                    )}
                </div>

                {/* Most Viewed Products */}
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading mb-4">Most Viewed Products</h4>
                    {productData.length > 0 ? (
                        <ul className="space-y-4">
                            {productData.slice(0, 10).map((product, index) => (
                                <li key={product.id}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{index + 1}. {product.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.brandName}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex-shrink-0 ml-2">{product.count} views</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${maxProductViews > 0 ? (product.count / maxProductViews) * 100 : 0}%` }}></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                       <EmptyState title="No Product Data" message="No products have been viewed yet." icon={<CubeIcon className="w-full h-full" />} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
