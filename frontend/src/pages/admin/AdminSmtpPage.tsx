import React, { useEffect, useState } from 'react';
import { Mail, Check, AlertCircle, Send, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSmtpPage: React.FC = () => {
  const { token } = useAuth();

  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('WoxxApp Stores');
  const [smtpFromEmail, setSmtpFromEmail] = useState('no-reply@woxxapp.de');
  const [smtpSecure, setSmtpSecure] = useState(false);

  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSmtp = async () => {
      try {
        const res = await fetch('/api/admin/smtp', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.smtpHost) setSmtpHost(data.smtpHost);
          if (data.smtpPort) setSmtpPort(data.smtpPort);
          if (data.smtpUser) setSmtpUser(data.smtpUser);
          if (data.smtpFromName) setSmtpFromName(data.smtpFromName);
          if (data.smtpFromEmail) setSmtpFromEmail(data.smtpFromEmail);
          setSmtpSecure(!!data.smtpSecure);
        }
      } catch {
        // Fallback
      }
    };
    fetchSmtp();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/smtp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          smtpHost,
          smtpPort: parseInt(String(smtpPort)),
          smtpUser,
          smtpPass: smtpPass || undefined,
          smtpFromName,
          smtpFromEmail,
          smtpSecure
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      // Handled
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!testEmail) return;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/smtp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          host: smtpHost,
          port: parseInt(String(smtpPort)),
          user: smtpUser,
          pass: smtpPass,
          secure: smtpSecure,
          testEmail
        })
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult({ success: true, message: data.message || 'Email de test envoyé avec succès !' });
      } else {
        setTestResult({ success: false, message: data.details || data.error || 'Échec de connexion SMTP.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Erreur réseau.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Configuration Globale</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
          Serveur SMTP Central (Mailing Transactionnel)
        </h1>
        <p className="text-xs text-slate-400">
          Ce serveur SMTP unique est partagé par tous les tenants de la plateforme pour envoyer les emails de confirmation de commande, de notification de retrait prêt et de réinitialisation de mot de passe.
        </p>
      </div>

      {/* Main SMTP Config Form */}
      <form onSubmit={handleSave} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
          <Mail className="w-5 h-5 text-amber-400" /> Identifiants du Relais SMTP
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Hôte SMTP *</label>
            <input
              type="text"
              required
              placeholder="smtp.sendgrid.net ou mail.mondomaine.fr"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Port *</label>
            <input
              type="number"
              required
              placeholder="587"
              value={smtpPort}
              onChange={(e) => setSmtpPort(parseInt(e.target.value) || 587)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Utilisateur SMTP / API Key</label>
            <input
              type="text"
              placeholder="apikey ou contact@domaine.fr"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de passe SMTP</label>
            <input
              type="password"
              placeholder="••••••••••••••••"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nom d'expéditeur par défaut</label>
            <input
              type="text"
              placeholder="WoxxApp Stores"
              value={smtpFromName}
              onChange={(e) => setSmtpFromName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email d'expéditeur (From)</label>
            <input
              type="email"
              placeholder="no-reply@woxxapp.de"
              value={smtpFromEmail}
              onChange={(e) => setSmtpFromEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="smtpSecure"
            checked={smtpSecure}
            onChange={(e) => setSmtpSecure(e.target.checked)}
            className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0 w-4 h-4"
          />
          <label htmlFor="smtpSecure" className="text-xs text-slate-300 font-semibold cursor-pointer">
            Connexion SSL/TLS directe (Port 465)
          </label>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Configuration SMTP sauvegardée !
            </span>
          ) : <span />}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder la Configuration'}
          </button>
        </div>
      </form>

      {/* Test Email Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
          <Send className="w-4 h-4 text-purple-400" /> Tester l'Envoi d'un Email
        </h3>
        <p className="text-xs text-slate-400">
          Envoyez un message de test pour vérifier que les paramètres du relais SMTP fonctionnent immédiatement.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="mon.email.test@gmail.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
          />
          <button
            type="button"
            disabled={testing || !testEmail}
            onClick={handleTestSmtp}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testing ? 'Test en cours...' : 'Envoyer un Email Test'}</span>
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-xl text-xs flex items-start gap-2 border ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {testResult.success ? <Check className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
            <div>
              <p className="font-bold">{testResult.success ? 'Succès' : 'Erreur'}</p>
              <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
