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
      className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300 group cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1"
    >
      <div>
        {/* Product Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              Pas d'image
            </div>
          )}
          {product.preparationTimeMinutes && (
            <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-md text-[11px] text-slate-200 flex items-center gap-1 font-medium border border-white/10">
              <Clock className="w-3 h-3 text-amber-400" /> {product.preparationTimeMinutes} min
            </div>
          )}
          {product.options && product.options.length > 0 && (
            <div className="absolute top-2 right-2 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              Personnalisable
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 sm:p-5">
          <h3 className="font-bold text-base sm:text-lg text-white font-heading group-hover:text-amber-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Délicieusement préparé par nos artisans avec des ingrédients soigneusement sélectionnés.'}
          </p>
        </div>
      </div>

      {/* Footer Price & Add Button */}
      <div className="p-4 sm:p-5 pt-0 flex items-center justify-between mt-2">
        <span className="text-base sm:text-xl font-extrabold text-white font-heading">
          {(product.priceCents / 100).toFixed(2)} €
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter</span>
        </button>
      </div>
    </div>
  );
};
