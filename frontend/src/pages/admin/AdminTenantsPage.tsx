import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Plus, Power, ExternalLink, X, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { PRESET_OPTIONS } from '../../presets/presets';

export const AdminTenantsPage: React.FC = () => {
  const { token } = useAuth();
  const { switchSubdomain } = useTenant();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Tenant Form State
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [presetId, setPresetId] = useState('burger');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [managerName, setManagerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tenants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTenants(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [token]);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          subdomain: subdomain.toLowerCase().trim(),
          presetId,
          managerEmail,
          managerPassword,
          managerName
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du provisioning de la boutique.');
      }

      setIsModalOpen(false);
      setName('');
      setSubdomain('');
      setManagerEmail('');
      setManagerPassword('');
      fetchTenants();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTenant = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/tenants/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setTenants(prev => prev.map(t => t.id === id ? { ...t, isActive: !currentStatus } : t));
      }
    } catch {
      // Handled
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Multi-Tenancy Engine</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-1">
            Gestion & Provisioning des Boutiques
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Provisionner un Nouveau Sous-domaine</span>
        </button>
      </div>

      {/* Tenants Table */}
      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Boutique & Sous-Domaine</th>
                <th className="py-4 px-4">Thématique</th>
                <th className="py-4 px-4">Gérant / Contact</th>
                <th className="py-4 px-4">Commandes</th>
                <th className="py-4 px-4">Statut</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tenants.map((t) => {
                const manager = t.users && t.users[0];
                return (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <strong className="text-white text-sm block">{t.name}</strong>
                      <span className="text-[11px] text-amber-400 font-mono">
                        {t.subdomain}.woxxapp.de
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="capitalize px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px]">
                        {t.themePreset}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white block font-medium">{manager?.fullName || 'Non assigné'}</span>
                      <span className="text-slate-500 text-[11px]">{manager?.email}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      {t._count?.orders ?? 0}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {t.isActive ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => {
                          switchSubdomain(t.subdomain);
                          navigate('/manager/kanban');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all active:scale-95"
                        title="Prendre le contrôle de ce magasin en tant que SuperAdmin"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>Gérer ce magasin</span>
                      </button>
                      <a
                        href={`http://localhost:5173/?tenant=${t.subdomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 inline-block rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Ouvrir la vitrine"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleToggleTenant(t.id, t.isActive)}
                        className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
                          t.isActive ? 'bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400' : 'bg-emerald-950 text-emerald-400'
                        }`}
                        title={t.isActive ? 'Suspendre' : 'Réactiver'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white font-heading">
                Provisionner une Nouvelle Boutique
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom du commerce *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pâtisserie Céleste"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!subdomain) {
                      setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sous-domaine assigné *</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="patisserie-celeste"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 px-3.5 py-2.5 rounded-l-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-purple-500 focus:outline-none"
                  />
                  <span className="bg-slate-800 px-3 py-2.5 rounded-r-xl border border-l-0 border-slate-800 text-xs text-slate-400 font-mono">
                    .woxxapp.de
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preset Thématique de Départ</label>
                <select
                  value={presetId}
                  onChange={(e) => setPresetId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                >
                  {PRESET_OPTIONS.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email du Gérant *</label>
                  <input
                    type="email"
                    required
                    placeholder="gerant@boutique.fr"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de passe temporaire *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  {error}
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20"
                >
                  {submitting ? 'Création...' : 'Créer & Activer le Sous-Domaine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
