import React from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Clock, Phone, Mail } from 'lucide-react';
import { useTenant } from '../context/TenantContext';

export const Footer: React.FC = () => {
  const { tenant } = useTenant();

  const dayLabels: Record<string, string> = {
    lun: 'Lundi',
    mar: 'Mardi',
    mer: 'Mercredi',
    jeu: 'Jeudi',
    ven: 'Vendredi',
    sam: 'Samedi',
    dim: 'Dimanche'
  };

  const renderHours = () => {
    // 1. Custom text from CMS
    if (tenant?.cmsConfig?.footerHoursCustomText) {
      return (
        <div className="text-xs text-stone-600 dark:text-stone-400 space-y-1 whitespace-pre-line">
          {tenant.cmsConfig.footerHoursCustomText}
        </div>
      );
    }

    // 2. Structured openingHours from settings
    if (tenant?.openingHours && Array.isArray(tenant.openingHours) && tenant.openingHours.length > 0) {
      return (
        <div className="text-xs text-stone-600 dark:text-stone-400 space-y-1">
          {tenant.openingHours.map((h) => (
            <p key={h.day} className="flex justify-between gap-2">
              <span className="text-stone-500">{dayLabels[h.day] || h.day}</span>
              <span className="font-medium text-stone-800 dark:text-stone-200">
                {h.closed ? 'Fermé' : `${h.open} – ${h.close}`}
              </span>
            </p>
          ))}
        </div>
      );
    }

    // 3. Fallback default
    return (
      <div className="text-xs text-stone-600 dark:text-stone-400 space-y-1">
        <p className="flex justify-between"><span>Lun – Ven</span><span className="font-medium text-stone-800 dark:text-stone-200">11h30 – 22h30</span></p>
        <p className="flex justify-between"><span>Samedi</span><span className="font-medium text-stone-800 dark:text-stone-200">12h00 – 23h30</span></p>
        <p className="flex justify-between"><span>Dimanche</span><span className="font-medium text-stone-800 dark:text-stone-200">12h00 – 22h00</span></p>
      </div>
    );
  };

  return (
    <footer className="mt-24 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* 1. Identité de la boutique */}
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
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs whitespace-pre-line">
              {tenant?.cmsConfig?.footerDescription || tenant?.description || 'Commandez en ligne et récupérez vos articles en magasin. Simple, rapide et sécurisé.'}
            </p>
          </div>

          {/* 2. Horaires */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              {tenant?.cmsConfig?.footerHoursTitle || 'Horaires'}
            </h4>
            {renderHours()}
          </div>

          {/* 3. Contact & Coordonnées */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500" /> Contact
            </h4>
            <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {tenant?.address && (
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span>{tenant.address}</span>
                </p>
              )}
              {tenant?.contactPhone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <a href={`tel:${tenant.contactPhone}`} className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors">
                    {tenant.contactPhone}
                  </a>
                </p>
              )}
              {tenant?.contactEmail && (
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <a href={`mailto:${tenant.contactEmail}`} className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors">
                    {tenant.contactEmail}
                  </a>
                </p>
              )}
              {!tenant?.address && !tenant?.contactPhone && !tenant?.contactEmail && (
                <p className="text-stone-400 italic">Coordonnées disponibles au comptoir</p>
              )}
            </div>
          </div>

          {/* 4. Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Navigation
            </h4>
            <div className="space-y-1.5 text-xs">
              <Link to="/" className="block text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors">
                Accueil
              </Link>
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

        {/* Bas de page */}
        <div className="border-t border-stone-200 dark:border-stone-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
          <p>
            {tenant?.cmsConfig?.footerCopyright || `© ${new Date().getFullYear()} ${tenant?.name || 'Boutique'}. Tous droits réservés.`}
          </p>
          <p>
            {tenant?.cmsConfig?.footerBottomText || 'Propulsé par WoxxApp'}
          </p>
        </div>
      </div>
    </footer>
  );
};
