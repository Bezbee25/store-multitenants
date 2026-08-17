import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Clock, ShieldCheck, User, CreditCard, Banknote, AlertCircle, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTenant } from '../../context/TenantContext';
import { SlotPicker } from '../../components/SlotPicker';

export const CartPage: React.FC = () => {
  const { items, totalCents, updateQuantity, removeItem, clearCart } = useCart();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_WOXXPAY' | 'ON_SITE'>('ONLINE_WOXXPAY');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!selectedSlot) {
      setError('Veuillez sélectionner un créneau de retrait.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/store/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          paymentMethod,
          pickupSlotStart: selectedSlot.start,
          pickupSlotEnd: selectedSlot.end,
          notes,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            selectedOptions: i.selectedOptions
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la validation.');

      if (paymentMethod === 'ONLINE_WOXXPAY' && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        clearCart();
        navigate(`/order/${data.order.orderNumber}`);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de créer la commande.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold font-heading text-stone-900 dark:text-stone-100">Votre panier est vide</h1>
        <p className="text-xs text-stone-500">Découvrez nos produits et ajoutez-les à votre commande.</p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition-colors"
        >
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading text-stone-900 dark:text-stone-100">
          Finaliser la commande
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          {items.length} article{items.length > 1 ? 's' : ''} · Retrait chez <strong className="text-stone-700 dark:text-stone-300">{tenant?.name}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Info */}
        <div className="lg:col-span-7 space-y-6">

          {/* Coordonnées */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4 shadow-sm">
            <h2 className="text-base font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" /> Vos Coordonnées
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Sophie Martin"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Téléphone mobile *</label>
                <input
                  type="tel"
                  required
                  placeholder="06 12 34 56 78"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Email de confirmation *</label>
                <input
                  type="email"
                  required
                  placeholder="sophie@exemple.fr"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Slot Picker */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4 shadow-sm">
            <h2 className="text-base font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" /> Créneau de Retrait
            </h2>
            <SlotPicker
              slotDurationMinutes={tenant?.slotDurationMinutes || 15}
              maxItemsPerSlot={tenant?.maxItemsPerSlot || 20}
              onSelectSlot={(start, end) => setSelectedSlot({ start, end })}
            />
          </div>

          {/* Paiement */}
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4 shadow-sm">
            <h2 className="text-base font-bold font-heading text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-500" /> Mode de Règlement
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE_WOXXPAY')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  paymentMethod === 'ONLINE_WOXXPAY'
                    ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-stone-900 dark:text-stone-100 font-semibold'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                <CreditCard className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-xs font-bold">Paiement CB Sécurisé</p>
                <p className="text-[11px] text-stone-500 mt-0.5">WoxxPay (Visa, Mastercard)</p>
              </button>

              {tenant?.acceptUnpaidOrders && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ON_SITE')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === 'ON_SITE'
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-stone-900 dark:text-stone-100 font-semibold'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-orange-500 mb-2" />
                  <p className="text-xs font-bold">Paiement sur Place</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Espèces ou CB au comptoir</p>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Notes / Instructions (optionnel)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Emballage cadeau, précision sur l'allergie..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-4 shadow-sm">
            <h2 className="text-base font-bold font-heading text-stone-900 dark:text-stone-100">
              Récapitulatif
            </h2>

            <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-80 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1">
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{item.product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="text-stone-700 dark:text-stone-300">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-stone-900 dark:text-stone-100 font-heading block">
                      {((item.unitPriceCents * item.quantity) / 100).toFixed(2)} €
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      className="text-[10px] text-red-500 hover:underline mt-0.5"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Sous-total</span>
                <span>{(totalCents / 100).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Frais de retrait Click & Collect</span>
                <span className="text-green-600 font-medium">Gratuit</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-800">
                <span>Total à payer</span>
                <span className="font-heading text-orange-600">{(totalCents / 100).toFixed(2)} €</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Validation...' : 'Confirmer la commande'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
