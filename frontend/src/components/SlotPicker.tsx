import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTenant } from '../context/TenantContext';

export interface PickupSlot {
  start: string;
  end: string;
  displayTime: string;
  available: boolean;
  remainingCapacity: number;
}

interface SlotPickerProps {
  selectedSlot: PickupSlot | null;
  onSelectSlot: (slot: PickupSlot) => void;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({ selectedSlot, onSelectSlot }) => {
  const { tenant } = useTenant();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate the next 5 days for quick selection
  const days = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const label = i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    return { iso, label };
  });

  const fetchSlots = async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/store/slots?date=${dateStr}`, {
        headers: {
          'X-Tenant-Slug': tenant?.subdomain || 'smash-burger'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      } else {
        throw new Error('Fallback mock');
      }
    } catch {
      // Fallback slots for local preview
      const mockSlots: PickupSlot[] = [
        { start: `${dateStr}T12:00:00.000Z`, end: `${dateStr}T12:15:00.000Z`, displayTime: '12:00 - 12:15', available: true, remainingCapacity: 14 },
        { start: `${dateStr}T12:15:00.000Z`, end: `${dateStr}T12:30:00.000Z`, displayTime: '12:15 - 12:30', available: true, remainingCapacity: 8 },
        { start: `${dateStr}T12:30:00.000Z`, end: `${dateStr}T12:45:00.000Z`, displayTime: '12:30 - 12:45', available: true, remainingCapacity: 3 },
        { start: `${dateStr}T12:45:00.000Z`, end: `${dateStr}T13:00:00.000Z`, displayTime: '12:45 - 13:00', available: false, remainingCapacity: 0 },
        { start: `${dateStr}T18:30:00.000Z`, end: `${dateStr}T18:45:00.000Z`, displayTime: '18:30 - 18:45', available: true, remainingCapacity: 20 },
        { start: `${dateStr}T18:45:00.000Z`, end: `${dateStr}T19:00:00.000Z`, displayTime: '18:45 - 19:00', available: true, remainingCapacity: 15 },
        { start: `${dateStr}T19:00:00.000Z`, end: `${dateStr}T19:15:00.000Z`, displayTime: '19:00 - 19:15', available: true, remainingCapacity: 10 },
        { start: `${dateStr}T19:15:00.000Z`, end: `${dateStr}T19:30:00.000Z`, displayTime: '19:15 - 19:30', available: true, remainingCapacity: 6 }
      ];
      setSlots(mockSlots);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate, tenant?.subdomain]);

  return (
    <div className="space-y-4">
      {/* Date selector tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {days.map((day) => (
          <button
            key={day.iso}
            type="button"
            onClick={() => {
              setSelectedDate(day.iso);
            }}
            className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
              selectedDate === day.iso
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
            {day.label}
          </button>
        ))}
      </div>

      {/* Slots Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Calcul des créneaux disponibles...</div>
      ) : slots.length === 0 ? (
        <div className="p-6 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Aucun créneau disponible pour cette date (commerce fermé ou créneaux passés).
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1">
          {slots.map((slot, index) => {
            const isSelected = selectedSlot?.start === slot.start;
            return (
              <button
                key={index}
                type="button"
                disabled={!slot.available}
                onClick={() => onSelectSlot(slot)}
                className={`p-3 rounded-xl border text-xs font-medium transition-all flex flex-col items-center justify-center relative text-center ${
                  !slot.available
                    ? 'opacity-40 bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed'
                    : isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{slot.displayTime}</span>
                </div>
                {slot.available && (
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-900 font-semibold' : 'text-emerald-400'}`}>
                    {slot.remainingCapacity} dispo
                  </span>
                )}
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 absolute top-1.5 right-1.5 text-slate-950" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
