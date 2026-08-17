import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleOptionChange = (optionName: string, choice: any) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: choice
    }));
  };

  // Calculate dynamic unit price with options
  let calculatedUnitPrice = product.priceCents;
  for (const choice of Object.values(selectedOptions)) {
    if (choice && choice.priceCents) {
      calculatedUnitPrice += choice.priceCents;
    }
  }

  const handleAddToCart = () => {
    addItem(product, quantity, selectedOptions);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scaleUp max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Header */}
        <div className="relative h-64 bg-slate-950 flex-shrink-0">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">Pas d'image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">{product.name}</h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{product.description}</p>
          </div>

          {/* Customizable Options if any */}
          {product.options && product.options.map((opt, idx) => (
            <div key={idx} className="space-y-3 pt-4 border-t border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                {opt.name} {opt.required && <span className="text-red-400">*</span>}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {opt.choices.map((choice, cIdx) => {
                  const isSelected = selectedOptions[opt.name]?.label === choice.label;
                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleOptionChange(opt.name, choice)}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all text-left border ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-600'}`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                        {choice.label}
                      </span>
                      {choice.priceCents && choice.priceCents > 0 ? (
                        <span className="text-amber-400 font-bold">+{(choice.priceCents / 100).toFixed(2)} €</span>
                      ) : (
                        <span className="text-slate-500">Inclus</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          {/* Quantity selector */}
          <div className="flex items-center gap-3 bg-slate-900 px-3 py-2 rounded-2xl border border-slate-800">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-bold text-white text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Submit */}
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              addedAnimation
                ? 'bg-emerald-500 text-slate-950 scale-95'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-5 h-5" /> Ajouté !
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Ajouter • {((calculatedUnitPrice * quantity) / 100).toFixed(2)} €</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
