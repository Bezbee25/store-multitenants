import React, { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!product) return null;

  const handleOptionToggle = (optionName: string, value: string, isMulti: boolean) => {
    setSelectedOptions((prev) => {
      const current = prev[optionName] || [];
      if (isMulti) {
        return {
          ...prev,
          [optionName]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
        };
      } else {
        return {
          ...prev,
          [optionName]: [value]
        };
      }
    });
  };

  const calculateTotalPrice = () => {
    let price = product.priceCents;
    if (product.options) {
      product.options.forEach((opt) => {
        const selectedValues = selectedOptions[opt.name] || [];
        opt.choices.forEach((choice) => {
          if (selectedValues.includes(choice.label) && choice.priceCents) {
            price += choice.priceCents;
          }
        });
      });
    }
    return price * quantity;
  };

  const handleAddToCart = () => {
    const formattedOptions: Record<string, string | string[]> = {};
    Object.entries(selectedOptions).forEach(([k, v]) => {
      formattedOptions[k] = v.length === 1 ? v[0] : v;
    });

    addItem(product, quantity, formattedOptions);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 shadow-sm transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Image */}
        {product.imageUrl && (
          <div className="relative h-48 sm:h-56 bg-stone-100 dark:bg-stone-800 shrink-0">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-heading">{product.name}</h2>
            {product.description && (
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">{product.description}</p>
            )}
          </div>

          {/* Options */}
          {product.options && product.options.map((opt, idx) => (
            <div key={idx} className="space-y-2 pt-3 border-t border-stone-200 dark:border-stone-800">
              <label className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
                {opt.name} {opt.required && <span className="text-red-500">*</span>}
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {opt.choices.map((choice, cIdx) => {
                  const isSelected = (selectedOptions[opt.name] || []).includes(choice.label);
                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleOptionToggle(opt.name, choice.label, opt.type === 'checkbox')}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-900 dark:text-orange-300 font-medium'
                          : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      <span>{choice.label}</span>
                      {choice.priceCents ? (
                        <span className="text-stone-500 font-mono">+{(choice.priceCents / 100).toFixed(2)} €</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-between gap-4">
          <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 font-semibold text-xs text-stone-900 dark:text-stone-100">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-1 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition-colors flex items-center justify-between shadow-sm"
          >
            <span>{addedSuccess ? '✓ Ajouté !' : 'Ajouter au panier'}</span>
            <span className="font-bold font-heading">{(calculateTotalPrice() / 100).toFixed(2)} €</span>
          </button>
        </div>
      </div>
    </div>
  );
};
