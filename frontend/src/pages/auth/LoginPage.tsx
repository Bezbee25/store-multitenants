import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Store, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';

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
          'X-Tenant-Slug': tenant?.subdomain || 'smash-burger'
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

  const handleGoogleDemoLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Slug': tenant?.subdomain || 'smash-burger'
        },
        body: JSON.stringify({
          email: 'demo.google@gmail.com',
          fullName: 'Utilisateur Google',
          googleId: 'google-oauth-demo-12345',
          phone: '06 12 34 56 78'
        })
      });
      const data = await res.json();
      login(data.token, data.user);
      navigate('/catalog');
    } catch (err: any) {
      setError(err.message);
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
              ? `Espace Gérant • ${tenant?.name || 'Boutique'}`
              : `Connexion • ${tenant?.name || 'Boutique'}`}
          </h1>
          <p className="text-xs text-slate-400">
            Accédez à vos commandes et paramètres
          </p>
        </div>

        {/* Role Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setRoleMode('CUSTOMER')}
            className={`py-2 rounded-lg transition-all ${roleMode === 'CUSTOMER' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Client
          </button>
          <button
            type="button"
            onClick={() => setRoleMode('MANAGER')}
            className={`py-2 rounded-lg transition-all ${roleMode === 'MANAGER' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Gérant
          </button>
          <button
            type="button"
            onClick={() => setRoleMode('SUPERADMIN')}
            className={`py-2 rounded-lg transition-all ${roleMode === 'SUPERADMIN' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Admin Global
          </button>
        </div>

        {/* Google OAuth Button for Clients */}
        {roleMode === 'CUSTOMER' && (
          <button
            type="button"
            onClick={handleGoogleDemoLogin}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-3 shadow-md active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continuer avec Google</span>
          </button>
        )}

        {roleMode === 'CUSTOMER' && (
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest">ou par email</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder={
                  roleMode === 'SUPERADMIN'
                    ? 'admin@woxxapp.de'
                    : roleMode === 'MANAGER'
                    ? 'gerant@smashburger.com'
                    : 'mon.email@exemple.com'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de passe</label>
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
