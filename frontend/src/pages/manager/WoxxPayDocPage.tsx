import React, { useState } from 'react';
import { CreditCard, ExternalLink, ShieldCheck, CheckCircle2, Copy, AlertCircle, Save } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';

export const WoxxPayDocPage: React.FC = () => {
  const { tenant, setTenant } = useTenant();
  const { token } = useAuth();
  const [stripeAccountId, setStripeAccountId] = useState(tenant?.stripeAccountId || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSaveStripeId = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/manager/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
        },
        body: JSON.stringify({
          stripeAccountId: stripeAccountId.trim() || null
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setTenant(updated);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      // Handled
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-2xl font-bold font-heading text-stone-900 dark:text-stone-100">
          Paiement CB en Ligne (WoxxPay)
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Connectez votre compte Stripe pour recevoir directement les paiements de vos clients.
        </p>
      </div>

      {/* Configuration Card */}
      <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-heading text-stone-900 dark:text-stone-100">
              Identifiant Stripe Connect
            </h2>
            <p className="text-xs text-stone-500">
              Saisissez votre Account ID Stripe (ex: <code>acct_1Nxxxxx</code>)
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveStripeId} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              ID Compte Stripe (acct_...)
            </label>
            <input
              type="text"
              placeholder="acct_1Nxxxxxxxxxxxxxx"
              value={stripeAccountId}
              onChange={(e) => setStripeAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Identifiant Stripe enregistré !
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer mon ID Stripe'}
          </button>
        </form>
      </div>

      {/* Explanation Steps */}
      <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
        <h2 className="text-base font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-500" />
          Comment ça marche ?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 font-bold flex items-center justify-center text-xs">1</span>
            <p className="font-semibold text-stone-900 dark:text-stone-100">Création Stripe</p>
            <p className="text-stone-500 leading-relaxed">Créez un compte gratuit sur Stripe.com si vous n'en avez pas encore.</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 font-bold flex items-center justify-center text-xs">2</span>
            <p className="font-semibold text-stone-900 dark:text-stone-100">Récupération ID</p>
            <p className="text-stone-500 leading-relaxed">Copiez votre identifiant de compte dans votre tableau de bord Stripe (paramètres du compte).</p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 font-bold flex items-center justify-center text-xs">3</span>
            <p className="font-semibold text-stone-900 dark:text-stone-100">Paiement Direct</p>
            <p className="text-stone-500 leading-relaxed">Les sous des commandes en ligne arrivent directement sur votre compte bancaire.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
