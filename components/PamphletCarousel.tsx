import React, { useMemo } from 'react';
import { useAppContext } from './context/AppContext.tsx';
import LocalMedia from './LocalMedia.tsx';

const PamphletDisplay: React.FC = () => {
    const { pamphlets, settings, openDocument } = useAppContext();

    const activePamphlets = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return pamphlets.filter(pamphlet => {
            if (pamphlet.isDeleted) return false;
            const startDate = new Date(pamphlet.startDate);
            const endDate = new Date(pamphlet.endDate);
            // Add timezone offset to avoid off-by-one day errors with YYYY-MM-DD strings
            startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
            endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
            
            endDate.setHours(23, 59, 59, 999); // Make end date inclusive of the entire day
            return startDate <= today && endDate >= today;
        }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [pamphlets]);
    
    if (activePamphlets.length === 0) {
        const { text = "No Active Promotions", font, color1 = "#a78bfa", color2 = "#f472b6" } = settings.pamphletPlaceholder || {};
        
        const placeholderStyle: React.CSSProperties = {
            fontFamily: font?.fontFamily || 'Playfair Display',
            fontWeight: font?.fontWeight || '900',
            fontStyle: font?.fontStyle || 'italic',
            backgroundImage: `linear-gradient(to right, ${color1}, ${color2})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textDecoration: font?.textDecoration || 'none',
        };

        return (
            <div className="mb-10 text-center">
                <h2 className="text-2xl tracking-tight text-gray-900 dark:text-gray-100 mb-6 section-heading">Latest Offers & Pamphlets</h2>
                <div className="py-12 bg-gray-100 dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-white/5">
                    <span className="text-5xl md:text-6xl tracking-tight" style={placeholderStyle}>
                        {text}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-10 text-center">
            <h2 className="text-2xl tracking-tight text-gray-900 dark:text-gray-100 mb-6 section-heading">Latest Offers & Pamphlets</h2>
            <div className="flex justify-center items-start flex-wrap gap-x-6 gap-y-8">
                {activePamphlets.map((pamphlet) => (
                    <button
                        key={pamphlet.id}
                        onClick={() => openDocument(pamphlet, pamphlet.title)}
                        className={`group block text-left w-[180px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] ${settings.cardStyle?.cornerRadius ?? 'rounded-2xl'}`}
                        aria-label={`View ${pamphlet.title}`}
                    >
                        <div className={`relative bg-black overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 aspect-[3/4] ${settings.cardStyle?.cornerRadius ?? 'rounded-2xl'} ${settings.cardStyle?.shadow ?? 'shadow-xl'}`}>
                            <LocalMedia
                                src={pamphlet.imageUrl}
                                alt={pamphlet.title}
                                type="image"
                                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-black/0">
                                <h3 className="font-semibold text-white text-sm item-title drop-shadow-md">{pamphlet.title}</h3>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PamphletDisplay;