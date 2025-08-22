

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { ChevronLeftIcon } from './Icons';
import LocalMedia from './LocalMedia';

const TvBrandsView: React.FC = () => {
    const { brands } = useAppContext();

    const tvBrands = useMemo(() => {
        return brands.filter(brand => brand.isTvBrand && !brand.isDeleted);
    }, [brands]);

    return (
        <div className="space-y-8">
            <div>
                <Link to="/" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 text-base">
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Back to Home
                </Link>
                <h1 className="text-4xl tracking-tight text-gray-900 dark:text-gray-100 section-heading">Shop TVs by Brand</h1>
            </div>
            {tvBrands.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {tvBrands.map((brand) => (
                        <Link
                            key={brand.id}
                            to={`/tvs/${brand.id}`}
                            className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700/50 transition-all hover:shadow-2xl hover:-translate-y-2"
                            title={brand.name}
                        >
                            <div className="h-24 flex items-center justify-center">
                                <LocalMedia
                                    src={brand.logoUrl}
                                    alt={`${brand.name} Logo`}
                                    type="image"
                                    className="max-h-full max-w-full object-contain transition-transform group-hover:scale-110"
                                />
                            </div>
                            <span className="mt-4 font-semibold text-gray-800 dark:text-gray-100 item-title">{brand.name}</span>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-100 dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 section-heading">No TV Brands Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Content for TV brands has not been added yet.</p>
                </div>
            )}
        </div>
    );
};

export default TvBrandsView;