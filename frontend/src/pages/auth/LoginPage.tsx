import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Store, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { GoogleAuthButton } from '../../components/GoogleAuthButton';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleMode, setRoleMode] = useState<'CUSTOMER' | 'MANAGER' | 'SUPERADMIN'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { tenant, switchSubdomain } = useTenant();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Slug': tenant?.subdomain || 'burger'
        },
        body: JSON.stringify({ email, password, role: roleMode })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Identifiants invalides.');
      }

      login(data.token, data.user);

      if (data.tenantSubdomain) {
        switchSubdomain(data.tenantSubdomain);
      }

      if (data.user.role === 'SUPERADMIN') {
        navigate('/admin');
      } else if (data.user.role === 'MANAGER') {
        navigate('/manager/kanban');
      } else {
        navigate('/catalog');
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de se connecter.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Slug': tenant?.subdomain || 'burger'
        },
        body: JSON.stringify({ credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur d\'authentification Google.');
      login(data.token, data.user);
      navigate('/catalog');
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            {roleMode === 'SUPERADMIN' ? <Shield className="w-6 h-6" /> : <Store className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            {roleMode === 'SUPERADMIN'
              ? 'Super-Admin WoxxApp'
              : roleMode === 'MANAGER'
              ? 'Espace Gérant de Boutique'
              : 'Connexion Client'}
          </h1>
          <p className="text-xs text-slate-400">
            {roleMode === 'SUPERADMIN'
              ? 'Supervision globale de tous les magasins de la plateforme'
              : roleMode === 'MANAGER'
              ? `Gestion du magasin : ${tenant?.name || 'Votre commerce'}`
              : `Boutique : ${tenant?.name || 'Click & Collect'}`}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setRoleMode('CUSTOMER')}
            className={`py-2 rounded-xl font-bold transition-all ${
              roleMode === 'CUSTOMER' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Client
          </button>
          <button
            type="button"
            onClick={() => setRoleMode('MANAGER')}
            className={`py-2 rounded-xl font-bold transition-all ${
              roleMode === 'MANAGER' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gérant
          </button>
          <button
            type="button"
            onClick={() => setRoleMode('SUPERADMIN')}
            className={`py-2 rounded-xl font-bold transition-all ${
              roleMode === 'SUPERADMIN' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            SuperAdmin
          </button>
        </div>

        {/* Google One-Click Login for Customers */}
        {roleMode === 'CUSTOMER' && (
          <div className="space-y-4">
            <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={(err) => setError(err.message)} text="signin_with" />
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-950 px-3 text-[11px] text-slate-500 uppercase tracking-wider relative">
                ou avec email
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="votre.email@domaine.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de passe *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
              roleMode === 'SUPERADMIN'
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer links */}
        {roleMode === 'CUSTOMER' && (
          <p className="text-center text-xs text-slate-400">
            Pas encore de compte ?{' '}
            <Link to="/auth/register" className="text-amber-400 hover:underline font-semibold">
              Créer un compte
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
