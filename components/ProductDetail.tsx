

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeftIcon, ExternalLinkIcon, CheckIcon, ShieldCheckIcon, ChevronDownIcon, PhotoIcon } from './Icons.tsx';
import { useAppContext } from './context/AppContext.tsx';
import LocalMedia from './LocalMedia.tsx';
import ImageEnlargeModal from './ImageEnlargeModal.tsx';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { products, brands, localVolume, openDocument, trackProductView } = useAppContext();
  const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const product = useMemo(() => products.find(p => p.id === productId), [productId, products]);
  const brand = useMemo(() => brands.find(b => b.id === product?.brandId), [product, brands]);

  useEffect(() => {
    if (productId) {
        trackProductView(productId);
    }
  }, [productId, trackProductView]);

  useEffect(() => {
    if (videoRef.current) {
        const volume = typeof localVolume === 'number' && isFinite(localVolume) ? Math.max(0, Math.min(1, localVolume)) : 0.75;
        videoRef.current.volume = volume;
        videoRef.current.muted = volume === 0;
    }
  }, [localVolume]);


  if (!product || product.isDeleted || (brand && brand.isDeleted)) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 section-heading">Product not found</h2>
        <Link to="/" className="text-indigo-500 dark:text-indigo-400 hover:underline mt-4 inline-block">Go back home</Link>
      </div>
    );
  }

  return (
    <>
      {enlargedImageUrl && <ImageEnlargeModal imageUrl={enlargedImageUrl} onClose={() => setEnlargedImageUrl(null)} />}
      <div className="space-y-8">
        <Link to={brand ? `/brand/${brand.id}` : '/'} className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back to {brand ? brand.name : 'Products'}
        </Link>
        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
          {/* Left Column: Media */}
          <div className="space-y-6">
            <swiper-container
              navigation="true"
              pagination="true"
              loop={(product.images.length > 1).toString()}
              className="w-full rounded-2xl shadow-2xl overflow-hidden border border-black/5 dark:border-white/5 aspect-square bg-black/50"
            >
              {product.images.map((img, index) => (
                <swiper-slide key={img + index}>
                    <button onClick={() => setEnlargedImageUrl(img)} className="w-full h-full block cursor-zoom-in">
                        <LocalMedia
                            src={img}
                            alt={`${product.name} - view ${index + 1}`}
                            type="image"
                            className="w-full h-full object-contain"
                        />
                    </button>
                </swiper-slide>
              ))}
            </swiper-container>

            {product.video && (
                <div className="w-full rounded-2xl shadow-2xl overflow-hidden border border-black/5 dark:border-white/5 aspect-video bg-black">
                    <LocalMedia
                      ref={videoRef}
                      src={product.video}
                      title={`${product.name} video`}
                      type="video"
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                </div>
            )}

            {product.documents && product.documents.length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 section-heading mb-4">
                  Related Documents
                </h3>
                <div className="flex gap-4 pb-4 -mx-4 px-4 overflow-x-auto">
                  {product.documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => openDocument(doc, doc.title)}
                      className="flex-shrink-0 w-36 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] rounded-xl"
                      aria-label={`Open document: ${doc.title}`}
                    >
                      <div className="flex flex-col items-center justify-center p-4 h-36 bg-gray-100 dark:bg-gray-800/50 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700/80 transition-all border border-gray-200 dark:border-gray-700 group-hover:border-gray-300 dark:group-hover:border-gray-600 shadow-lg group-hover:shadow-xl group-hover:-translate-y-1">
                        <PhotoIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2 transition-colors group-hover:text-[var(--primary-color)]" />
                        <p className="text-sm font-semibold text-center text-gray-700 dark:text-gray-300 item-title leading-tight">
                          {doc.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="flex flex-col space-y-6">
            <div className="flex-grow">
                {brand && (
                    <Link to={`/brand/${brand.id}`} className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 uppercase tracking-wider">{brand.name}</Link>
                )}
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mt-1 section-heading">{product.name}</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">SKU: {product.sku}</p>
                
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mt-6 prose dark:prose-invert max-w-none">{product.description}</p>
            </div>
            
            {product.specifications && product.specifications.length > 0 && (
                 <div className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 section-heading">Specifications</h3>
                    <dl className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        {product.specifications.map(spec => (
                            <div key={spec.id} className="grid grid-cols-3 gap-2">
                                <dt className="font-semibold text-gray-800 dark:text-gray-100 col-span-1">{spec.key}:</dt>
                                <dd className="text-gray-600 dark:text-gray-400 col-span-2">{spec.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}

            {product.whatsInTheBox && product.whatsInTheBox.length > 0 && (
                <div className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 section-heading">What's in the box</h3>
                    <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                        {product.whatsInTheBox.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {product.termsAndConditions && (
                <details className="group bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 section-heading flex items-center gap-2">
                            <ShieldCheckIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            Terms & Conditions
                        </h3>
                        <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180" />
                    </summary>
                    <div className="px-5 pb-5 border-t border-gray-200 dark:border-gray-700">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 whitespace-pre-wrap pt-4">
                            {product.termsAndConditions}
                        </div>
                    </div>
                </details>
            )}
            
            {product.websiteUrl && (
              <div className="pt-2">
                <a
                  href={product.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full"
                  aria-label="View product on external website"
                >
                  <ExternalLinkIcon className="h-5 w-5" />
                  <span>View on Website</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;