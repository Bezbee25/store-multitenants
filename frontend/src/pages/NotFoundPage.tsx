import React from 'react';
import { Link } from 'react-router-dom';
import { Store, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useTenant } from '../context/TenantContext';

export const NotFoundPage: React.FC = () => {
  const { currentSubdomain } = useTenant();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md glass-card p-8 sm:p-10 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-white font-heading">404</span>
          <h1 className="text-xl font-bold text-slate-100">Boutique ou Page Introuvable</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Le sous-domaine <strong>[{currentSubdomain}]</strong> n'existe pas ou la page demandée a été déplacée.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
