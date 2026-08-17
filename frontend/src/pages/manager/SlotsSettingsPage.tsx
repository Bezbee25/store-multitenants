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
          'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
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

  const dayLabels: Record<string, string> = {
    lun: 'Lundi',
    mar: 'Mardi',
    mer: 'Mercredi',
    jeu: 'Jeudi',
    ven: 'Vendredi',
    sam: 'Samedi',
    dim: 'Dimanche'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-2xl font-bold font-heading text-stone-900 dark:text-stone-100">
          Créneaux & Horaires de Retrait
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Configurez vos heures d'ouverture et la capacité de retrait pour le Click & Collect.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Section Créneaux */}
        <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
          <h2 className="text-base font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            Capacité & Créneaux de retrait
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Durée d'un créneau (minutes)
              </label>
              <select
                value={slotDurationMinutes}
                onChange={(e) => setSlotDurationMinutes(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 heure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Commandes max par créneau
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={maxItemsPerSlot}
                onChange={(e) => setMaxItemsPerSlot(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="acceptUnpaid"
              checked={acceptUnpaidOrders}
              onChange={(e) => setAcceptUnpaidOrders(e.target.checked)}
              className="rounded border-stone-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="acceptUnpaid" className="text-xs text-stone-700 dark:text-stone-300">
              Accepter les commandes payées sur place au comptoir
            </label>
          </div>
        </div>

        {/* Section Horaires */}
        <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4">
          <h2 className="text-base font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            Horaires d'ouverture
          </h2>

          <div className="space-y-3">
            {openingHours.map((item, idx) => (
              <div
                key={item.day}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 text-xs"
              >
                <div className="w-24 font-semibold text-stone-900 dark:text-stone-100">
                  {dayLabels[item.day] || item.day}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!item.closed}
                    onChange={(e) => handleHourChange(idx, 'closed', !e.target.checked)}
                    className="rounded border-stone-300 text-orange-600"
                  />
                  <span className="text-stone-600 dark:text-stone-400 w-16">
                    {item.closed ? 'Fermé' : 'Ouvert'}
                  </span>
                </div>

                {!item.closed && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={item.open}
                      onChange={(e) => handleHourChange(idx, 'open', e.target.value)}
                      className="px-2 py-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    />
                    <span className="text-stone-400">à</span>
                    <input
                      type="time"
                      value={item.close}
                      onChange={(e) => handleHourChange(idx, 'close', e.target.value)}
                      className="px-2 py-1 rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" /> Paramètres enregistrés avec succès !
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </form>
    </div>
  );
};
