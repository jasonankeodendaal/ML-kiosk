



import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Brand, Product } from '../types.ts';
import ProductCard from './ProductCard.tsx';
import { SearchIcon, ChevronLeftIcon } from './Icons.tsx';
import BrandCatalogueCarousel from './BrandCatalogueCarousel.tsx';
import { useAppContext } from './context/AppContext.tsx';
import LocalMedia from './LocalMedia.tsx';

const BrandView: React.FC = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const { brands, products, categories, trackBrandView } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (brandId) {
        trackBrandView(brandId);
    }
  }, [brandId, trackBrandView]);

  const brand = useMemo(() => brands.find(b => b.id === brandId && !b.isDeleted), [brandId, brands]);
  const brandProducts = useMemo(() => products.filter(p => p.brandId === brandId && !p.isDiscontinued && !p.isDeleted), [brandId, products]);
  
  const brandCategories = useMemo(() => {
    return categories.filter(c => c.brandId === brandId && !c.isDeleted).sort((a,b) => a.name.localeCompare(b.name));
  }, [categories, brandId]);

  const filteredAndGroupedProducts = useMemo(() => {
    const filtered = brandProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categorized: { [key: string]: Product[] } = {};
    const uncategorized: Product[] = [];

    for (const product of filtered) {
        if (product.categoryId && brandCategories.some(c => c.id === product.categoryId)) {
            if (!categorized[product.categoryId]) {
                categorized[product.categoryId] = [];
            }
            categorized[product.categoryId].push(product);
        } else {
            uncategorized.push(product);
        }
    }
    return { categorized, uncategorized };
  }, [brandProducts, searchTerm, brandCategories]);

  const hasProducts = brandProducts.length > 0;
  const hasSearchResults = filteredAndGroupedProducts.uncategorized.length > 0 || Object.keys(filteredAndGroupedProducts.categorized).length > 0;


  if (!brand) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold section-heading">Brand not found</h2>
        <Link to="/" className="text-indigo-400 hover:underline mt-4 inline-block">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 text-base">
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to Home
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
            <h1 className="text-4xl tracking-tight text-gray-900 dark:text-gray-100 section-heading">{brand.name}</h1>
        </div>
      </div>

      {/* Catalogue Carousel */}
      <BrandCatalogueCarousel brandId={brand.id} />

      {/* Products Section */}
      {hasProducts && (
        <div className="space-y-6">
            <div className="relative">
              <input
                  type="text"
                  placeholder="Search products in this brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800/50 text-indigo-600 dark:text-indigo-300 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition text-base shadow-sm"
              />
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            
            {hasSearchResults ? (
                <div className="space-y-10">
                    {brandCategories.map(category => {
                        const productsInCategory = filteredAndGroupedProducts.categorized[category.id];
                        if (!productsInCategory || productsInCategory.length === 0) return null;
                        return (
                            <div key={category.id}>
                                <h3 className="text-2xl tracking-tight text-gray-800 dark:text-gray-200 section-heading border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-6">{category.name}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
                                    {productsInCategory.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    {filteredAndGroupedProducts.uncategorized.length > 0 && (
                        <div>
                            <h3 className="text-2xl tracking-tight text-gray-800 dark:text-gray-200 section-heading border-b-2 border-gray-300 dark:border-gray-600 pb-2 mb-6">Other</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
                                {filteredAndGroupedProducts.uncategorized.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-100 dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 section-heading">No products found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search criteria.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default BrandView;