import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext.tsx';
import { ChevronLeftIcon } from './Icons.tsx';
import type { Catalogue } from '../types.ts';
import LocalMedia from './LocalMedia.tsx';

const CatalogueCard: React.FC<{ catalogue: Catalogue; onOpen: (catalogue: Catalogue) => void; }> = ({ catalogue, onOpen }) => {
    const { settings } = useAppContext();

    return (
        <button
            onClick={() => onOpen(catalogue)}
            className={`group block text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] ${settings.cardStyle?.cornerRadius ?? 'rounded-2xl'}`}
            aria-label={`View ${catalogue.title}`}
        >
            <div className={`relative bg-black overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 aspect-[3/4] ${settings.cardStyle?.cornerRadius ?? 'rounded-2xl'} ${settings.cardStyle?.shadow ?? 'shadow-xl'}`}>
                <LocalMedia
                    src={catalogue.thumbnailUrl}
                    alt={catalogue.title}
                    type="image"
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-black/0">
                    <h3 className="font-semibold text-white text-sm item-title drop-shadow-md">{catalogue.title}</h3>
                </div>
            </div>
        </button>
    );
};


const CatalogueLibrary: React.FC = () => {
    const { catalogues, openDocument } = useAppContext();

    const groupedCatalogues = useMemo(() => {
        const groups: { [year: number]: Catalogue[] } = {};
        
        catalogues.filter(c => !c.isDeleted).forEach(catalogue => {
            if (!groups[catalogue.year]) {
                groups[catalogue.year] = [];
            }
            groups[catalogue.year].push(catalogue);
        });

        // Sort each group by title
        for (const year in groups) {
            groups[year].sort((a, b) => a.title.localeCompare(b.title));
        }

        // Return sorted array of years
        return Object.entries(groups).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA));

    }, [catalogues]);

    const handleOpenCatalogue = (catalogue: Catalogue) => {
        openDocument(catalogue, catalogue.title);
    };

    return (
        <div className="space-y-10">
            <div>
                <Link to="/" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 text-base">
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Back to Home
                </Link>
                <h1 className="text-4xl tracking-tight text-gray-900 dark:text-gray-100 section-heading">Our Catalogues</h1>
                <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">Browse through our collection of catalogues, past and present.</p>
            </div>

            {groupedCatalogues.length > 0 ? (
                <div className="space-y-12">
                    {groupedCatalogues.map(([year, items]) => (
                        <section key={year}>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-200 section-heading border-b border-gray-300 dark:border-gray-700 pb-4 mb-6">{year} Collection</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
                                {items.map(catalogue => (
                                    <CatalogueCard key={catalogue.id} catalogue={catalogue} onOpen={handleOpenCatalogue} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-100 dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 section-heading">No Catalogues Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Check back later for new catalogues.</p>
                </div>
            )}
        </div>
    );
};

export default CatalogueLibrary;