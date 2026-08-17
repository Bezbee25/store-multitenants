import React, { useState } from 'react';
import { CreditCard, ExternalLink, ShieldCheck, CheckCircle2, Copy, AlertCircle, HelpCircle, Save } from 'lucide-react';
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
          'X-Tenant-Slug': tenant?.subdomain || 'smash-burger'
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
            Guide Intégration
          </span>
          <span className="text-xs text-slate-400">• WoxxPay & Stripe Connect</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-heading">
          Paiement CB en Ligne pour votre Boutique
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          WoxxApp intègre nativement la passerelle <strong>WoxxPay</strong>. Vous encaissez directement l'argent de vos ventes sur votre propre compte bancaire Stripe, sans aucun intermédiaire financier.
        </p>
      </div>

      {/* Stripe Account Configuration Card */}
      <form onSubmit={handleSaveStripeId} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-400" /> Votre Identifiant Stripe Connect
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Stripe Account ID (ex: <code>acct_1Nxxxxxxxxxxxxxx</code>)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="acct_..."
              value={stripeAccountId}
              onChange={(e) => setStripeAccountId(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Enregistrement...' : 'Lier mon compte'}</span>
            </button>
          </div>
          {savedSuccess && (
            <p className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Compte Stripe enregistré avec succès ! Le paiement en ligne est actif.
            </p>
          )}
        </div>
      </form>

      {/* 3-Step Setup Walkthrough */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white font-heading">
          Comment configurer vos paiements en 3 étapes simples
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg font-heading">
              1
            </div>
            <h3 className="font-bold text-white text-base">Créez votre compte Stripe</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Si vous n'avez pas encore de compte Stripe, rendez-vous sur le site officiel de Stripe et complétez la vérification de votre entreprise / SIRET.
            </p>
            <a
              href="https://dashboard.stripe.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              <span>Créer un compte Stripe</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg font-heading">
              2
            </div>
            <h3 className="font-bold text-white text-base">Récupérez votre Account ID</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dans votre tableau de bord Stripe, cliquez sur le nom de votre compte en haut à gauche pour copier votre identifiant unique <code>acct_...</code>.
            </p>
            <div className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-slate-300 flex items-center justify-between">
              <span>acct_1N9AbCdEfGhIjK</span>
              <button
                type="button"
                onClick={() => copyToClipboard('acct_1N9AbCdEfGhIjK')}
                className="text-amber-400 hover:text-amber-300"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg font-heading">
              3
            </div>
            <h3 className="font-bold text-white text-base">Collez et Encaissez</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Collez votre identifiant dans le champ ci-dessus. Vos clients pourront immédiatement payer par carte bancaire lors de leurs commandes Click & Collect !
            </p>
            <div className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> Sécurisé par WoxxPay
            </div>
          </div>
        </div>
      </div>

      {/* Security & FAQ Section */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" /> Foire aux Questions (FAQ)
        </h3>

        <div className="space-y-3 text-xs text-slate-300 divide-y divide-slate-800">
          <div className="pt-3 first:pt-0">
            <h4 className="font-bold text-white mb-1">Comment suis-je payé ?</h4>
            <p className="text-slate-400 leading-relaxed">
              Les fonds sont versés automatiquement sur votre compte bancaire selon la fréquence configurée dans votre espace Stripe (virement quotidien ou hebdomadaire).
            </p>
          </div>

          <div className="pt-3">
            <h4 className="font-bold text-white mb-1">Puis-je accepter les paiements sur place sans compte Stripe ?</h4>
            <p className="text-slate-400 leading-relaxed">
              Oui ! Vous pouvez utiliser l'option « Paiement sur place au retrait » sans avoir besoin de configurer Stripe.
            </p>
          </div>

          <div className="pt-3">
            <h4 className="font-bold text-white mb-1">Mes clients reçoivent-ils un reçu ?</h4>
            <p className="text-slate-400 leading-relaxed">
              Oui, un email de confirmation détaillé de leur commande et un reçu de paiement leur sont envoyés instantanément.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
