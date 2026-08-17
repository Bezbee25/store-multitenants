import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, User as UserIcon } from 'lucide-react';
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
          'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
        },
        body: JSON.stringify({ email, password, role: roleMode })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Identifiants invalides.');

      login(data.token, data.user);
      if (data.tenantSubdomain) switchSubdomain(data.tenantSubdomain);

      if (data.user.role === 'SUPERADMIN') navigate('/admin');
      else if (data.user.role === 'MANAGER') navigate('/manager/kanban');
      else navigate('/catalog');
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
          'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
        },
        body: JSON.stringify({ credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur d\'authentification Google.');
      login(data.token, data.user);
      navigate('/catalog');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    CUSTOMER: { title: 'Connexion', subtitle: 'Accédez à vos commandes Click & Collect' },
    MANAGER: { title: 'Espace Gérant', subtitle: 'Gérez votre boutique et vos commandes' },
    SUPERADMIN: { title: 'Administration', subtitle: 'Supervision de la plateforme complète' },
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold font-heading text-stone-900 dark:text-stone-100">
            {roleLabels[roleMode].title}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {roleLabels[roleMode].subtitle}
          </p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs">
          {(['CUSTOMER', 'MANAGER', 'SUPERADMIN'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleMode(role)}
              className={`py-2 rounded-lg font-medium transition-colors ${
                roleMode === role
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700'
              }`}
            >
              {role === 'CUSTOMER' ? 'Client' : role === 'MANAGER' ? 'Gérant' : 'Admin'}
            </button>
          ))}
        </div>

        {/* Google Login for Customers */}
        {roleMode === 'CUSTOMER' && (
          <div className="space-y-4">
            <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={(err) => setError(err.message)} text="signin_with" />
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-stone-200 dark:border-stone-700" />
              <span className="px-3 text-[11px] text-stone-400 uppercase tracking-wider">ou</span>
              <div className="flex-grow border-t border-stone-200 dark:border-stone-700" />
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="votre@email.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium text-sm hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {roleMode === 'CUSTOMER' && (
          <p className="text-center text-xs text-stone-500">
            Pas encore de compte ?{' '}
            <Link to="/auth/register" className="text-orange-600 hover:text-orange-500 font-medium">
              Créer un compte
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
