

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './context/AppContext';
import type { TvContent } from '../types';
import LocalMedia from './LocalMedia';
import { XIcon } from './Icons';

type PlaylistItem = {
    type: 'image' | 'video';
    url: string;
};

const MotionDiv = motion.div as any;

const transitionVariants = {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: 'easeInOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 1.5, ease: 'easeInOut' } }
};

const TvContentPlayer: React.FC<{ content: TvContent; onClose: () => void; }> = ({ content, onClose }) => {
    const { settings, localVolume, brands } = useAppContext();
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const videoNodeRef = useRef<HTMLVideoElement | null>(null);

    const playlist: PlaylistItem[] = content.media;
    const brand = brands.find(b => b.id === content.brandId);

    const goToNextItem = useCallback(() => {
        if (playlist.length > 0) {
            setCurrentItemIndex(prevIndex => (prevIndex + 1) % playlist.length);
        }
    }, [playlist.length]);

    const currentItem = playlist[currentItemIndex];

    useEffect(() => {
        if (currentItem?.type === 'image') {
            const timer = window.setTimeout(goToNextItem, settings.screensaverImageDuration * 1000);
            return () => clearTimeout(timer);
        }
    }, [currentItem, goToNextItem, settings.screensaverImageDuration]);

     const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
        if (videoNodeRef.current) {
            videoNodeRef.current.removeEventListener('ended', goToNextItem);
            videoNodeRef.current.removeEventListener('error', goToNextItem);
            if (!videoNodeRef.current.paused) videoNodeRef.current.pause();
        }
        
        videoNodeRef.current = node;

        if (videoNodeRef.current) {
            const volume = typeof localVolume === 'number' && isFinite(localVolume) ? Math.max(0, Math.min(1, localVolume)) : 0.75;
            videoNodeRef.current.volume = volume;
            videoNodeRef.current.muted = volume === 0;
            videoNodeRef.current.addEventListener('ended', goToNextItem);
            videoNodeRef.current.addEventListener('error', goToNextItem);
            videoNodeRef.current.play().catch(error => {
                console.warn("Video autoplay failed, possibly due to browser policy:", error);
                // Attempt to play muted if unmuted fails
                if (videoNodeRef.current) {
                    videoNodeRef.current.muted = true;
                    videoNodeRef.current.play().catch(finalError => {
                        console.error("Video could not be played even when muted. Skipping.", finalError);
                        goToNextItem();
                    });
                }
            });
        }
    }, [goToNextItem, localVolume]);

    if (!currentItem) return null;

    return (
        <div 
            className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tv-player-title"
        >
            <AnimatePresence initial={false}>
                <MotionDiv
                    key={currentItem.url + currentItemIndex}
                    variants={transitionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute inset-0 w-full h-full"
                >
                    {currentItem.type === 'image' ? (
                        <LocalMedia
                            src={currentItem.url}
                            alt={content.modelName}
                            type="image"
                            className="w-full h-full object-contain"
                            onError={goToNextItem}
                        />
                    ) : (
                        <LocalMedia
                            ref={videoRefCallback}
                            src={currentItem.url}
                            type="video"
                            className="w-full h-full object-contain"
                            playsInline
                            preload="auto"
                        />
                    )}
                </MotionDiv>
            </AnimatePresence>
            
            <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        {brand && <LocalMedia src={brand.logoUrl} alt={brand.name} type="image" className="h-10 object-contain" />}
                        <h2 id="tv-player-title" className="section-heading text-3xl font-bold text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}>
                            {content.modelName}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="btn bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 pointer-events-auto"
                        aria-label="Stop TV Content Player"
                    >
                        <XIcon className="h-5 w-5 mr-2" />
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TvContentPlayer;