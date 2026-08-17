import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Clock, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useTenant } from '../context/TenantContext';

export const Footer: React.FC = () => {
  const { tenant } = useTenant();

  return (
    <footer className="bg-slate-950 border-t border-white/10 text-slate-400 text-sm mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Presentation */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              {tenant?.logoUrl ? (
                <img src={tenant.logoUrl} alt={tenant.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950">
                  <Store className="w-5 h-5" />
                </div>
              )}
              <span className="text-lg font-bold text-white font-heading">{tenant?.name || 'Notre Boutique'}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {tenant?.description || 'Commander vos produits préférés en ligne et récupérez-les rapidement en Click & Collect.'}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Paiement WoxxPay & Retrait Garanti
              </span>
            </div>
          </div>

          {/* Horaires d'ouverture */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold flex items-center gap-2 text-sm font-heading">
              <Clock className="w-4 h-4 text-amber-400" /> Horaires Click & Collect
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-300">
              <li className="flex justify-between py-0.5 border-b border-slate-900">
                <span className="text-slate-400">Lundi - Vendredi</span>
                <span className="font-medium">11:30 - 22:30</span>
              </li>
              <li className="flex justify-between py-0.5 border-b border-slate-900">
                <span className="text-slate-400">Samedi</span>
                <span className="font-medium">12:00 - 23:30</span>
              </li>
              <li className="flex justify-between py-0.5">
                <span className="text-slate-400">Dimanche</span>
                <span className="font-medium">12:00 - 22:00</span>
              </li>
            </ul>
          </div>

          {/* Coordonnées & Accès */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold flex items-center gap-2 text-sm font-heading">
              <MapPin className="w-4 h-4 text-amber-400" /> Coordonnées & Retrait
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {tenant?.address || '14 Rue des Gourmets, 75002 Paris'}
            </p>
            {tenant?.contactPhone && (
              <p className="text-xs flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-amber-400" /> {tenant.contactPhone}
              </p>
            )}
            {tenant?.contactEmail && (
              <p className="text-xs flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-amber-400" /> {tenant.contactEmail}
              </p>
            )}
          </div>

          {/* Liens Rapides & Espace Pro */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm font-heading">Navigation & Accès Pro</h4>
            <ul className="text-xs space-y-2">
              <li>
                <Link to="/catalog" className="text-slate-400 hover:text-white transition-colors">
                  Voir tout le magasin
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-slate-400 hover:text-white transition-colors">
                  Mon Panier & Retrait
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-900">
                <Link to="/manager/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1">
                  🔑 Connexion Gérant Boutique
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-purple-400 hover:text-purple-300 text-[11px] transition-colors">
                  🛡️ Administration Plateforme
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {tenant?.name || 'WoxxApp Store'}. Tous droits réservés.</p>
          <p className="flex items-center gap-2">
            Propulsé par <span className="font-semibold text-slate-300">WoxxApp Multitenant Engine</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
