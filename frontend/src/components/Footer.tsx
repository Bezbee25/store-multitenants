import React from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Clock } from 'lucide-react';
import { useTenant } from '../context/TenantContext';

export const Footer: React.FC = () => {
  const { tenant } = useTenant();

  return (
    <footer className="mt-24 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              {tenant?.logoUrl ? (
                <img src={tenant.logoUrl} alt={tenant.name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="font-bold font-heading text-stone-900 dark:text-stone-100">
                {tenant?.name || 'Boutique'}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs">
              {tenant?.description || 'Commandez en ligne, récupérez en boutique. Simple et rapide.'}
            </p>
          </div>

          {/* Horaires */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Horaires
            </h4>
            <div className="text-xs text-stone-600 dark:text-stone-400 space-y-1">
              <p className="flex justify-between"><span>Lun – Ven</span><span className="font-medium text-stone-800 dark:text-stone-200">11h30 – 22h30</span></p>
              <p className="flex justify-between"><span>Samedi</span><span className="font-medium text-stone-800 dark:text-stone-200">12h – 23h30</span></p>
              <p className="flex justify-between"><span>Dimanche</span><span className="font-medium text-stone-800 dark:text-stone-200">12h – 22h</span></p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Contact
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {tenant?.address || '14 Rue des Gourmets, 75002 Paris'}
            </p>
            {tenant?.contactPhone && (
              <p className="text-xs text-stone-600 dark:text-stone-400">{tenant.contactPhone}</p>
            )}
          </div>

          {/* Liens */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Navigation
            </h4>
            <div className="space-y-1.5 text-xs">
              <Link to="/catalog" className="block text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">
                Nos produits
              </Link>
              <Link to="/cart" className="block text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">
                Panier & Retrait
              </Link>
              <Link to="/auth/login" className="block text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">
                Mon compte
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 dark:border-stone-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
          <p>© {new Date().getFullYear()} {tenant?.name || 'WoxxApp'}. Tous droits réservés.</p>
          <p>Propulsé par <span className="font-medium text-stone-600 dark:text-stone-300">WoxxApp</span></p>
        </div>
      </div>
    </footer>
  );
};
