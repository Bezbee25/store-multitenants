import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const FloatingCartBar: React.FC = () => {
  const { totalItems, totalCents } = useCart();
  const location = useLocation();

  if (totalItems === 0 || location.pathname === '/cart' || location.pathname.startsWith('/order/')) {
    return null;
  }

  return (
    <aside aria-label="Panier en cours" className="fixed bottom-4 inset-x-4 z-40 md:hidden">
      <Link
        to="/cart"
        className="w-full py-3 px-4 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium text-sm shadow-xl flex items-center justify-between transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center text-[11px] font-bold">
            {totalItems}
          </span>
          <span>Voir mon panier</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold">{(totalCents / 100).toFixed(2)} €</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </Link>
    </aside>
  );
};
