import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types.ts';
import { useAppContext } from './context/AppContext.tsx';
import LocalMedia from './LocalMedia.tsx';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { settings } = useAppContext();

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className={`relative bg-black overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 aspect-square ${settings.cardStyle?.cornerRadius ?? 'rounded-2xl'} ${settings.cardStyle?.shadow ?? 'shadow-xl'}`}>
        <LocalMedia
          src={product.images[0]}
          alt={product.name}
          type="image"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-black/0">
           <h3 className="text-base font-semibold text-white item-title drop-shadow-md">{product.name}</h3>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;