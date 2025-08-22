

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext.tsx';
import type { AdLink } from '../types.ts';
import LocalMedia from './LocalMedia.tsx';

type PlaylistItem = {
    type: 'image' | 'video' | 'touch-prompt';
    title: string;
    url: string;
    link?: AdLink;
    brandLogoUrl?: string;
    brandName?: string;
};

const MotionDiv = motion.div as any;
const MotionH2 = motion.h2 as any;
const MotionSpan = motion.span as any;
const MotionP = motion.p as any;

const transitionVariants: Record<string, any> = {
    'fade': {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 1.5, ease: 'easeInOut' } },
        exit: { opacity: 0, transition: { duration: 1.5, ease: 'easeInOut' } },
    },
    'slide': {
        initial: { x: '100%', opacity: 1 },
        animate: { x: 0, transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } },
        exit: { x: '-100%', transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } },
    },
    'scale': {
        initial: { scale: 1.15, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: { duration: 1.3, ease: 'easeOut' } },
        exit: { scale: 1.15, opacity: 0, transition: { duration: 1, ease: 'easeIn' } },
    },
    'slide-fade': {
        initial: { x: 80, opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { duration: 1.3, ease: [0.33, 1, 0.68, 1] } },
        exit: { x: -80, opacity: 0, transition: { duration: 1, ease: [0.33, 1, 0.68, 1] } },
    },
    'gentle-drift': {
        initial: { opacity: 0, scale: 1.1, x: '-2%', y: '2%' },
        animate: { opacity: 1, scale: 1, x: '0%', y: '0%', transition: { duration: 2.5, ease: [0.43, 0.13, 0.23, 0.96] } },
        exit: { opacity: 0, scale: 0.9, x: '2%', y: '-2%', transition: { duration: 2, ease: [0.43, 0.13, 0.23, 0.96] } }
    },
    'reveal-blur': {
        initial: { opacity: 0, filter: 'blur(20px)', scale: 1.2 },
        animate: { opacity: 1, filter: 'blur(0px)', scale: 1, transition: { duration: 1.8, ease: 'easeOut' } },
        exit: { opacity: 0, filter: 'blur(20px)', scale: 1.2, transition: { duration: 1.5, ease: 'easeIn' } }
    }
};

const kenBurnsVariants = [
  { scale: [1, 1.1], x: ['0%', '-3%'], y: ['0%', '3%'] },
  { scale: [1, 1.1], x: ['0%', '3%'], y: ['0%', '-3%'] },
  { scale: [1, 1.08], x: ['0%', '0%'], y: ['0%', '4%'] },
  { scale: [1, 1.08], x: ['0%', '4%'], y: ['0%', '0%'] },
];

const Preloader: React.FC<{ item: PlaylistItem | undefined }> = ({ item }) => {
    if (!item) return null;
    return (
        <div style={{ display: 'none' }} aria-hidden="true">
            <LocalMedia src={item.url} type={item.type as 'image' | 'video'} preload="auto" />
        </div>
    );
};

const TouchPromptSlide: React.FC<{ text: string }> = ({ text }) => (
    <div className="w-full h-full flex items-center justify-center">
        <MotionH2
            className="text-7xl md:text-8xl text-white font-serif tracking-wide"
            style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 4px 20px rgba(255, 255, 255, 0.1)' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
                opacity: [0, 1, 0.9, 1], 
                scale: [0.9, 1, 1],
                transition: { duration: 1.5, ease: 'easeOut', delay: 0.5 }
            }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 1, ease: 'easeIn' } }}
        >
            <MotionSpan
                animate={{
                    opacity: [0.8, 1, 0.8],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                }}
            >
                {text}
            </MotionSpan>
        </MotionH2>
    </div>
);


const Screensaver: React.FC = () => {
    const { settings, products, screensaverAds, exitScreensaver, openDocument, catalogues, pamphlets, brands, localVolume } = useAppContext();
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [kbVariant, setKbVariant] = useState(kenBurnsVariants[0]);
    const navigate = useNavigate();
    const videoNodeRef = useRef<HTMLVideoElement | null>(null);

    const playlist: PlaylistItem[] = useMemo(() => {
        type MediaSource = Omit<PlaylistItem, 'type' | 'url'> & {
            mediaType: 'image' | 'video';
            mediaUrl: string;
        };

        const productItems: MediaSource[] = [];
        products
            .filter(p => !p.isDiscontinued && !p.isDeleted)
            .forEach(product => {
                const brand = brands.find(b => b.id === product.brandId);
                const itemBase = {
                    title: product.name,
                    brandName: brand?.name,
                    link: { type: 'product' as const, id: product.id }
                };
                product.images.forEach(imageUrl => {
                    productItems.push({ ...itemBase, mediaType: 'image', mediaUrl: imageUrl });
                });
                if (product.video) {
                    productItems.push({ ...itemBase, mediaType: 'video', mediaUrl: product.video });
                }
            });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeAdItems: MediaSource[] = screensaverAds
            .filter(ad => {
                const startDate = new Date(ad.startDate);
                const endDate = new Date(ad.endDate);
                endDate.setHours(23, 59, 59, 999);
                return startDate <= today && endDate >= today;
            })
            .flatMap(ad => 
                ad.media.map((mediaItem): MediaSource => ({
                    mediaType: mediaItem.type,
                    mediaUrl: mediaItem.url,
                    title: ad.title,
                    link: ad.link,
                }))
            );
        
        const mediaItems: PlaylistItem[] = [...productItems, ...activeAdItems].map(item => {
            const { mediaType, mediaUrl, ...rest } = item;
            return {
                ...rest,
                type: mediaType,
                url: mediaUrl,
            };
        });

        // Shuffle media items
        for (let i = mediaItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mediaItems[i], mediaItems[j]] = [mediaItems[j], mediaItems[i]];
        }
        
        const promptSlide: PlaylistItem = { type: 'touch-prompt', url: 'prompt', title: settings.screensaverTouchPromptText };
        if (mediaItems.length === 0) {
            return [promptSlide];
        }

        const finalPlaylist: PlaylistItem[] = [];
        const itemsPerPrompt = 3;

        mediaItems.forEach((item, index) => {
            finalPlaylist.push(item);
            if ((index + 1) % itemsPerPrompt === 0) {
                finalPlaylist.push({ ...promptSlide, url: `prompt-${index}` });
            }
        });

        // If no prompt was added because there are too few items, add one anyway.
        if (mediaItems.length > 0 && mediaItems.length < itemsPerPrompt) {
            finalPlaylist.push(promptSlide);
        }

        return finalPlaylist;

    }, [products, screensaverAds, brands, settings.screensaverTouchPromptText]);

    const goToNextItem = useCallback(() => {
        if (playlist.length > 0) {
            setCurrentItemIndex(prevIndex => (prevIndex + 1) % playlist.length);
            setKbVariant(kenBurnsVariants[Math.floor(Math.random() * kenBurnsVariants.length)]);
        }
    }, [playlist.length]);

    const currentItem = useMemo(() => playlist[currentItemIndex], [playlist, currentItemIndex]);
    const nextItem = useMemo(() => playlist.length > 1 ? playlist[(currentItemIndex + 1) % playlist.length] : undefined, [playlist, currentItemIndex]);

    useEffect(() => {
        if (currentItem?.type === 'image' || currentItem?.type === 'touch-prompt') {
            const duration = currentItem.type === 'touch-prompt'
                ? 6000 // 6 seconds for prompt
                : settings.screensaverImageDuration * 1000;
            const timer = window.setTimeout(goToNextItem, duration);
            return () => clearTimeout(timer);
        }
    }, [currentItem, goToNextItem, settings.screensaverImageDuration]);

    const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
        if (videoNodeRef.current) {
            videoNodeRef.current.removeEventListener('ended', goToNextItem);
            videoNodeRef.current.removeEventListener('error', goToNextItem);
            if (!videoNodeRef.current.paused) {
                videoNodeRef.current.pause();
            }
        }
        
        videoNodeRef.current = node;

        if (videoNodeRef.current) {
            const videoElement = videoNodeRef.current;
            videoElement.addEventListener('ended', goToNextItem);
            videoElement.addEventListener('error', goToNextItem);

            const tryPlay = async () => {
                if (!videoElement.isConnected) return;
                try {
                    const volume = typeof localVolume === 'number' && isFinite(localVolume) ? Math.max(0, Math.min(1, localVolume)) : 0.75;
                    videoElement.volume = volume;
                    videoElement.muted = volume === 0;
                    await videoElement.play();
                } catch (error: any) {
                    if (error.name === 'AbortError') return;
                    console.warn("Could not play video with sound, retrying muted.", error);
                    if (!videoElement.isConnected) return;
                    videoElement.muted = true;
                    try {
                        await videoElement.play();
                    } catch (finalError: any) {
                        if (finalError.name === 'AbortError') return;
                        console.error("Fatal: Video could not be played even when muted. Skipping to next item.", finalError);
                        goToNextItem();
                    }
                }
            };
            tryPlay();
        }
    }, [goToNextItem, localVolume]);

    const handleClick = () => {
        if (!currentItem) {
            exitScreensaver();
            return;
        }
        const { link } = currentItem;
        exitScreensaver();

        if (!link) return;
        
        setTimeout(() => {
            switch (link.type) {
                case 'brand': navigate(`/brand/${link.id}`); break;
                case 'product': navigate(`/product/${link.id}`); break;
                case 'catalogue': {
                    const catalogue = catalogues.find(c => c.id === link.id);
                    if (catalogue) openDocument(catalogue, catalogue.title);
                    break;
                }
                case 'pamphlet': {
                    const pamphlet = pamphlets.find(p => p.id === link.id);
                    if (pamphlet) openDocument(pamphlet, pamphlet.title);
                    break;
                }
                case 'external': window.open(link.url, '_blank', 'noopener,noreferrer'); break;
            }
        }, 50);
    };

    if (!currentItem) return null;
    
    const selectedTransition = transitionVariants[settings.screensaverTransitionEffect] || transitionVariants['gentle-drift'];
    
    const textContainerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
        exit: {}
    };

    const textLineVariants = {
        hidden: { opacity: 0, y: '100%' },
        visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const, delay: 0.5 } }
    };

    return (
        <div 
            className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={handleClick}
            role="button"
            aria-label="Exit screensaver"
        >
            <Preloader item={nextItem} />
             {/* Blurred Background Layer */}
            <AnimatePresence>
                <MotionDiv
                    key={`bg-${currentItem.url}`}
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 2, ease: 'easeOut' } }}
                    exit={{ opacity: 0, transition: { duration: 2, ease: 'easeIn' } }}
                >
                    {currentItem.type === 'image' ? (
                        <LocalMedia
                            src={currentItem.url}
                            alt=""
                            type="image"
                            className="w-full h-full object-cover transform scale-110 filter blur-2xl brightness-50"
                            aria-hidden="true"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800" aria-hidden="true" />
                    )}
                </MotionDiv>
            </AnimatePresence>
            
            <AnimatePresence initial={false} mode="wait">
                <MotionDiv
                    key={currentItem.url + currentItemIndex}
                    variants={selectedTransition}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute inset-0 w-full h-full bg-black/30 flex items-center justify-center"
                >
                     {currentItem.type === 'image' ? (
                        <MotionDiv
                            className="w-full h-full overflow-hidden"
                            key={`kb-${currentItem.url}`} // a different key to make it re-render
                            animate={kbVariant}
                            transition={{ duration: settings.screensaverImageDuration + 2, ease: 'linear' }}
                        >
                            <LocalMedia
                                src={currentItem.url}
                                alt={currentItem.title}
                                type="image"
                                className="w-full h-full object-cover"
                                onError={goToNextItem}
                            />
                        </MotionDiv>
                    ) : currentItem.type === 'video' ? (
                        <LocalMedia
                            ref={videoRefCallback}
                            src={currentItem.url}
                            type="video"
                            className="w-full h-full object-contain"
                            playsInline
                            preload="auto"
                        />
                    ) : (
                        <TouchPromptSlide text={settings.screensaverTouchPromptText} />
                    )}
                </MotionDiv>
            </AnimatePresence>
            
            {/* Overlay with text and branding */}
            <div className="absolute inset-0 flex flex-col justify-end p-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none">
                {currentItem.type !== 'touch-prompt' && (
                    <>
                        <MotionDiv variants={textContainerVariants} initial="hidden" animate="visible" exit="hidden" className="overflow-hidden">
                            <MotionH2 variants={textLineVariants} className="section-heading text-4xl md:text-5xl font-bold text-white" style={{ textShadow: '0 3px 8px rgba(0,0,0,0.7)' }}>
                                {currentItem.title}
                            </MotionH2>
                        </MotionDiv>
                        {currentItem.brandName && (
                            <MotionDiv variants={textContainerVariants} initial="hidden" animate="visible" exit="hidden" className="overflow-hidden">
                                <MotionP variants={textLineVariants} className="item-title text-xl text-white/80" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.7)' }}>
                                    {currentItem.brandName}
                                </MotionP>
                            </MotionDiv>
                        )}
                    </>
                )}
            </div>
            
            {/* Watermarks */}
            <div className="absolute bottom-10 right-10 pointer-events-none">
                 <LocalMedia src={settings.logoUrl} alt="Company Logo" type="image" className="h-10 opacity-50" />
            </div>
        </div>
    );
};

export default Screensaver;