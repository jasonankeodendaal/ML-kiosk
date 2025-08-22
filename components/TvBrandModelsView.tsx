
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import { ChevronLeftIcon, TvIcon } from './Icons';
import LocalMedia from './LocalMedia';

const TvBrandModelsView: React.FC = () => {
    const { brandId } = useParams<{ brandId: string }>();
    const { brands, tvContent, playTvContent } = useAppContext();

    const brand = useMemo(() => brands.find(b => b.id === brandId), [brandId, brands]);

    const brandTvModels = useMemo(() => {
        return tvContent.filter(content => content.brandId === brandId && !content.isDeleted);
    }, [brandId, tvContent]);

    if (!brand) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Brand not found</h2>
                <Link to="/tvs" className="text-indigo-400 hover:underline mt-4 inline-block">Back to TV Brands</Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <Link to="/tvs" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 text-base">
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Back to TV Brands
                </Link>
                <div className="flex items-center gap-6">
                    <div className="h-28 w-28 flex items-center justify-center">
                        <LocalMedia 
                          src={brand.logoUrl} 
                          alt={`${brand.name} logo`} 
                          type="image"
                          className="max-h-full max-w-full object-contain" 
                        />
                    </div>
                    <h1 className="text-4xl tracking-tight text-gray-900 dark:text-gray-100 section-heading">{brand.name} TVs</h1>
                </div>
            </div>

            {brandTvModels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {brandTvModels.map((content) => (
                        <button
                            key={content.id}
                            onClick={() => playTvContent(content)}
                            className="group block text-left p-6 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700/50 transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-[var(--primary-color)] dark:hover:border-[var(--primary-color)]"
                            aria-label={`Play content for ${content.modelName}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                    <TvIcon className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 item-title">{content.modelName}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{content.media.length} media items</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-100 dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 section-heading">No TV Models Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Content for this brand's TV models has not been added yet.</p>
                </div>
            )}
        </div>
    );
};

export default TvBrandModelsView;
