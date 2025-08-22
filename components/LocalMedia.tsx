import React, { useState, useEffect, forwardRef, Ref } from 'react';
import { useAppContext } from './context/AppContext';
import { motion } from 'framer-motion';

// Discriminated union for props to avoid type conflicts between img and video attributes.
// By deriving from ComponentProps of motion components, we ensure all motion props are included.
type ImageProps = { type: 'image' } & Omit<React.ComponentProps<typeof motion.img>, 'src' | 'type'>;
type VideoProps = { type: 'video' } & Omit<React.ComponentProps<typeof motion.video>, 'src' | 'type'>;

type LocalMediaProps = {
  src: string;
} & (ImageProps | VideoProps);

const LocalMedia = forwardRef<HTMLImageElement | HTMLVideoElement, LocalMediaProps>((props, ref) => {
  const { getFileUrl, isStorageConnected } = useAppContext();
  const [displayUrl, setDisplayUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { src, type, className } = props;

  useEffect(() => {
    let isMounted = true;

    const fetchAndSetUrl = async () => {
        // Immediately use src if it's a full URL (http or data)
        if (src && (src.startsWith('http') || src.startsWith('data:'))) {
            if(isMounted) {
                setDisplayUrl(src);
                setIsLoading(false);
            }
            return;
        }

        if (!src || !isStorageConnected) {
            const placeholder = type === 'image' ? `https://placehold.co/400x400/E2E8F0/4A5568?text=No+Media` : '';
            if(isMounted) {
                setDisplayUrl(placeholder);
                setIsLoading(false);
            }
            return;
        }

        if (isMounted) setIsLoading(true);

        try {
            const url = await getFileUrl(src);
            if (isMounted) {
                if (url) {
                    setDisplayUrl(url);
                } else {
                    const placeholder = type === 'image' ? `https://placehold.co/400x400/F87171/FFFFFF?text=Not+Found` : '';
                    setDisplayUrl(placeholder);
                }
            }
        } catch (error) {
            console.error(`Error loading media for src: ${src}`, error);
            if(isMounted) {
                const placeholder = type === 'image' ? `https://placehold.co/400x400/F87171/FFFFFF?text=Error` : '';
                setDisplayUrl(placeholder);
            }
        } finally {
            if (isMounted) setIsLoading(false);
        }
    };
    
    fetchAndSetUrl();

    return () => {
      isMounted = false;
    };
  }, [src, getFileUrl, isStorageConnected, type]);

  if (isLoading) {
    return <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse`} />;
  }

  if (props.type === 'image') {
    const MotionImg = motion.img;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type: _type, src: _src, ...rest } = props;
    return <MotionImg 
        ref={ref as Ref<HTMLImageElement>} 
        src={displayUrl} 
        {...rest} 
        onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Prevent infinite loops if placeholder also fails
            if (!target.src.includes('placehold.co')) {
                target.src = 'https://placehold.co/400x400/F87171/FFFFFF?text=Error';
            }
            if(typeof props.onError === 'function') {
                props.onError(e);
            }
        }}
    />;
  }

  if (props.type === 'video') {
    const MotionVideo = motion.video;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type: _type, src: _src, ...rest } = props;
    return <MotionVideo ref={ref as Ref<HTMLVideoElement>} src={displayUrl} {...rest} />;
  }

  return null;
});

export default LocalMedia;