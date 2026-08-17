import React from 'react';
import { Plus, Clock } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(product)}
      className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 hover:shadow-lg hover:shadow-stone-200/50 dark:hover:shadow-stone-900/50 transition-all duration-300 cursor-pointer group flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm">
            Pas d'image
          </div>
        )}
        {product.preparationTimeMinutes && (
          <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm px-2 py-1 rounded-md text-[11px] text-stone-700 dark:text-stone-300 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-orange-500" /> {product.preparationTimeMinutes} min
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 font-heading line-clamp-1 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Préparé avec soin par nos artisans.'}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <span className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading">
            {(product.priceCents / 100).toFixed(2)} €
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};
