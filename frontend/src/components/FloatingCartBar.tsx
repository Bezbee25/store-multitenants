import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const FloatingCartBar: React.FC = () => {
  const { totalItems, totalCents } = useCart();
  const location = useLocation();

  // Do not show on cart or tracking page
  if (totalItems === 0 || location.pathname === '/cart' || location.pathname.startsWith('/order/')) {
    return null;
  }

  return (
    <aside
      aria-label="Panier en cours"
      className="fixed bottom-4 inset-x-4 z-40 md:hidden animate-slideUp"
    >
      <Link
        to="/cart"
        className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-2xl shadow-amber-500/40 flex items-center justify-between transition-all active:scale-[0.98] border border-amber-400/50"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center text-xs font-black">
            {totalItems}
          </span>
          <span className="tracking-tight">Voir mon panier Click & Collect</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-black text-base font-heading">
            {(totalCents / 100).toFixed(2)} €
          </span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    </aside>
  );
};
