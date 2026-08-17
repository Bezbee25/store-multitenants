import React, { useEffect, useState } from 'react';
import { Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTenant } from '../context/TenantContext';

interface Slot {
  start: string;
  end: string;
  displayTime: string;
  available: boolean;
  remainingCapacity: number;
}

interface SlotPickerProps {
  slotDurationMinutes: number;
  maxItemsPerSlot: number;
  onSelectSlot: (start: string, end: string) => void;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({ onSelectSlot }) => {
  const { tenant } = useTenant();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const label = i === 0 ? 'Aujourd\'hui' : i === 1 ? 'Demain' : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    return { iso, label };
  });

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/store/slots?date=${selectedDate}`, {
          headers: {
            'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSlots(data.slots || []);
        }
      } catch {
        // Fallback demo slots
        const now = new Date();
        const demoSlots: Slot[] = [
          { start: new Date(now.getTime() + 15 * 60000).toISOString(), end: new Date(now.getTime() + 30 * 60000).toISOString(), displayTime: '12:00 - 12:15', available: true, remainingCapacity: 15 },
          { start: new Date(now.getTime() + 30 * 60000).toISOString(), end: new Date(now.getTime() + 45 * 60000).toISOString(), displayTime: '12:15 - 12:30', available: true, remainingCapacity: 12 },
          { start: new Date(now.getTime() + 45 * 60000).toISOString(), end: new Date(now.getTime() + 60 * 60000).toISOString(), displayTime: '12:30 - 12:45', available: true, remainingCapacity: 8 },
          { start: new Date(now.getTime() + 60 * 60000).toISOString(), end: new Date(now.getTime() + 75 * 60000).toISOString(), displayTime: '12:45 - 13:00', available: false, remainingCapacity: 0 }
        ];
        setSlots(demoSlots);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, tenant?.subdomain]);

  const handleSelectSlot = (slot: Slot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    onSelectSlot(slot.start, slot.end);
  };

  return (
    <div className="space-y-4">
      {/* Date selector tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {days.map((day) => (
          <button
            key={day.iso}
            type="button"
            onClick={() => setSelectedDate(day.iso)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              selectedDate === day.iso
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 font-semibold'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            {day.label}
          </button>
        ))}
      </div>

      {/* Slots Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-stone-500">Calcul des créneaux disponibles...</div>
      ) : slots.length === 0 ? (
        <div className="p-4 text-center bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 text-xs flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500" />
          Aucun créneau disponible pour cette date.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-0.5">
          {slots.map((slot, index) => {
            const isSelected = selectedSlot?.start === slot.start;
            return (
              <button
                key={index}
                type="button"
                disabled={!slot.available}
                onClick={() => handleSelectSlot(slot)}
                className={`p-2.5 rounded-xl border text-xs transition-colors flex flex-col items-center justify-center relative text-center ${
                  !slot.available
                    ? 'opacity-40 bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-400 cursor-not-allowed'
                    : isSelected
                    ? 'bg-orange-600 text-white border-orange-600 font-semibold shadow-sm'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-orange-500'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{slot.displayTime}</span>
                </div>
                {slot.available && (
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-stone-500'}`}>
                    {slot.remainingCapacity} dispo
                  </span>
                )}
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 absolute top-1.5 right-1.5 text-white" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
