import React, { useEffect } from 'react';
import { XIcon } from './Icons';
import LocalMedia from './LocalMedia';

const ImageEnlargeModal: React.FC<{ imageUrl: string; onClose: () => void; }> = ({ imageUrl, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);
    
    return (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .swiper-zoom-container > img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
          `}</style>
         
          <div
            className="relative w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <swiper-container
                className="w-full h-full"
                zoom="true"
                navigation="false"
                pagination="false"
            >
                <swiper-slide>
                    <div className="swiper-zoom-container flex items-center justify-center h-full">
                        <LocalMedia
                            src={imageUrl}
                            alt="Enlarged product view"
                            type="image"
                        />
                    </div>
                </swiper-slide>
            </swiper-container>
          </div>

          <button onClick={onClose} aria-label="Close image viewer" className="absolute top-6 right-6 text-white bg-black/50 hover:bg-black/80 w-10 h-10 flex items-center justify-center rounded-full transition-colors z-10">
              <XIcon className="w-6 h-6" />
          </button>
        </div>
    );
};

export default ImageEnlargeModal;