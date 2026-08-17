import React, { useState } from 'react';
import { Clock, Shield, Check, Calendar, Users, AlertCircle } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { OpeningHour } from '../../types';

export const SlotsSettingsPage: React.FC = () => {
  const { tenant, setTenant } = useTenant();
  const { token } = useAuth();

  const [slotDurationMinutes, setSlotDurationMinutes] = useState(tenant?.slotDurationMinutes || 15);
  const [maxItemsPerSlot, setMaxItemsPerSlot] = useState(tenant?.maxItemsPerSlot || 20);
  const [acceptUnpaidOrders, setAcceptUnpaidOrders] = useState(tenant?.acceptUnpaidOrders ?? true);

  const defaultHours: OpeningHour[] = [
    { day: 'lun', open: '11:30', close: '22:30', closed: false },
    { day: 'mar', open: '11:30', close: '22:30', closed: false },
    { day: 'mer', open: '11:30', close: '22:30', closed: false },
    { day: 'jeu', open: '11:30', close: '23:00', closed: false },
    { day: 'ven', open: '11:30', close: '23:30', closed: false },
    { day: 'sam', open: '12:00', close: '23:30', closed: false },
    { day: 'dim', open: '12:00', close: '22:00', closed: false }
  ];

  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(tenant?.openingHours || defaultHours);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleHourChange = (index: number, field: keyof OpeningHour, value: any) => {
    const next = [...openingHours];
    next[index] = { ...next[index], [field]: value };
    setOpeningHours(next);
  };

  const handleSave = async (e: React.FormEvent) => {
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
          slotDurationMinutes: parseInt(String(slotDurationMinutes)),
          maxItemsPerSlot: parseInt(String(maxItemsPerSlot)),
          acceptUnpaidOrders,
          openingHours
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="glass-card p-6 rounded-3xl border border-white/10">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Click & Collect Engine</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-1">
          Créneaux de Retrait & Horaires d'Ouverture
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Slot Capacity & Duration Settings */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> Capacité & Durée des Créneaux
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Durée d'un créneau Click & Collect
              </label>
              <select
                value={slotDurationMinutes}
                onChange={(e) => setSlotDurationMinutes(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes (Recommandé pour restauration)</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes (Recommandé pour fleuriste / joaillerie)</option>
                <option value={60}>1 heure</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Définit l'intervalle entre chaque plage de retrait proposée aux clients.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Jauge / Quota maximum d'articles par créneau
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={maxItemsPerSlot}
                onChange={(e) => setMaxItemsPerSlot(parseInt(e.target.value) || 20)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Bloque automatiquement la réservation dès que le volume d'articles réservés atteint ce seuil.
              </span>
            </div>
          </div>

          {/* Payment Rule Toggle */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="acceptUnpaid"
              checked={acceptUnpaidOrders}
              onChange={(e) => setAcceptUnpaidOrders(e.target.checked)}
              className="mt-0.5 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
            />
            <div>
              <label htmlFor="acceptUnpaid" className="text-xs font-bold text-white cursor-pointer block">
                Autoriser les réservations sans paiement en ligne préalable (Paiement sur place)
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Si désactivé, le client devra obligatoirement régler par carte bancaire (via WoxxPay) pour que sa commande soit validée dans le Kanban.
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Schedules */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" /> Horaires Hebdomadaires
          </h2>

          <div className="divide-y divide-slate-800">
            {openingHours.map((sched, idx) => {
              const dayLabels: Record<string, string> = {
                lun: 'Lundi', mar: 'Mardi', mer: 'Mercredi', jeu: 'Jeudi',
                ven: 'Vendredi', sam: 'Samedi', dim: 'Dimanche'
              };

              return (
                <div key={sched.day} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="w-24 font-bold text-white">{dayLabels[sched.day] || sched.day}</span>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={!sched.closed}
                        onChange={(e) => handleHourChange(idx, 'closed', !e.target.checked)}
                        className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span>Ouvert</span>
                    </label>

                    {!sched.closed && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={sched.open}
                          onChange={(e) => handleHourChange(idx, 'open', e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                        />
                        <span className="text-slate-500">à</span>
                        <input
                          type="time"
                          value={sched.close}
                          onChange={(e) => handleHourChange(idx, 'close', e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Paramètres enregistrés !
            </span>
          ) : <span />}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer la Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
