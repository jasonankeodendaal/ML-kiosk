import React, { useMemo } from 'react';
import type { Catalogue } from '../types';
import { useAppContext } from './context/AppContext.tsx';
import LocalMedia from './LocalMedia';


const CatalogueCarousel: React.FC<{ title: string; items: Catalogue[]; onOpen: (catalogue: Catalogue) => void; isExpired?: boolean; }> = ({ title, items, onOpen, isExpired = false }) => {
    const { settings } = useAppContext();
    if (items.length === 0) {
        return null;
    }

    const slideWidth = isExpired ? '!w-[100px]' : '!w-[160px]';
    const cardClasses = isExpired ? 'filter grayscale group-hover:filter-none transition-all duration-300' : '';
    const showNavigation = items.length > (isExpired ? 5 : 3);

    return (
        <div className="mb-8">
            <h2 className="text-xl tracking-tight text-gray-100 mb-4 section-heading">{title}</h2>
            <swiper-container
                slides-per-view="auto"
                space-between="24"
                navigation={showNavigation.toString()}
                className="w-full h-auto"
            >
                {items.map((catalogue) => (
                    <swiper-slide key={catalogue.id} className={slideWidth}>
                        <button
                            onClick={() => onOpen(catalogue)}
                            className="group block text-left w-full"
                            aria-label={`View ${catalogue.title}`}
                        >
                            <div className={`relative bg-black overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 aspect-[3/4] ${cardClasses} ${settings.cardStyle?.cornerRadius ?? 'rounded-2xl'} ${settings.cardStyle?.shadow ?? 'shadow-xl'}`}>
                                <LocalMedia
                                    src={catalogue.thumbnailUrl}
                                    alt={catalogue.title}
                                    type="image"
                                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-black/0">
                                    <h3 className="font-semibold text-white text-sm item-title drop-shadow-md">{catalogue.title}</h3>
                                    <p className="text-xs text-gray-200 mt-1 drop-shadow-sm">{catalogue.year}</p>
                                </div>
                            </div>
                        </button>
                    </swiper-slide>
                ))}
            </swiper-container>
        </div>
    );
};


interface BrandCatalogueCarouselProps {
    brandId: string;
}

const BrandCatalogueCarousel: React.FC<BrandCatalogueCarouselProps> = ({ brandId }) => {
    const { catalogues, openDocument } = useAppContext();
    
    const { currentCatalogues, expiredCatalogues } = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const brandCatalogues = catalogues
            .filter(c => c.brandId === brandId && !c.isDeleted)
            .sort((a, b) => b.year - a.year);

        return {
            currentCatalogues: brandCatalogues.filter(c => c.year === currentYear),
            expiredCatalogues: brandCatalogues.filter(c => c.year < currentYear),
        };
    }, [brandId, catalogues]);

    const handleOpenCatalogue = (catalogue: Catalogue) => {
        openDocument(catalogue, catalogue.title);
    };

    if (currentCatalogues.length === 0 && expiredCatalogues.length === 0) {
        return null;
    }

    return (
        <>
            <CatalogueCarousel title="Current Catalogues" items={currentCatalogues} onOpen={handleOpenCatalogue} />
            <CatalogueCarousel title="Expired Catalogues" items={expiredCatalogues} onOpen={handleOpenCatalogue} isExpired={true} />
        </>
    );
};

export default BrandCatalogueCarousel;