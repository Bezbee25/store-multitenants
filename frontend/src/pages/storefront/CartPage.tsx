import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, CreditCard, Banknote, ShoppingBag, ArrowRight, ShieldCheck, Clock, User, Phone, Mail } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { SlotPicker, PickupSlot } from '../../components/SlotPicker';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, totalCents, totalItems } = useCart();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<PickupSlot | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_WOXXPAY' | 'ON_SITE'>('ONLINE_WOXXPAY');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage('Votre panier est vide.');
      return;
    }

    if (!selectedSlot) {
      setErrorMessage('Veuillez choisir un créneau horaire de retrait Click & Collect.');
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      setErrorMessage('Veuillez remplir vos coordonnées (Nom, Email, Téléphone pour le suivi).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        pickupSlotStart: selectedSlot.start,
        paymentMethod,
        notes: notes || undefined,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions
        }))
      };

      const res = await fetch('/api/store/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Slug': tenant?.subdomain || 'smash-burger'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la validation de la commande.');
      }

      // If online payment redirect required
      if (data.requiresRedirect && data.checkoutUrl) {
        clearCart();
        window.location.href = data.checkoutUrl;
        return;
      }

      // On-site payment: navigate directly to order tracking
      clearCart();
      navigate(`/order/${data.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-white font-heading">Votre panier est vide</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Découvrez notre catalogue et ajoutez vos produits préférés pour réserver votre créneau Click & Collect.
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
        >
          <span>Parcourir le catalogue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading mb-8">
        Finaliser ma commande Click & Collect
      </h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Coordinates & Slot Picker & Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Customer Info */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" /> Vos Coordonnées
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nom complet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sophie Martin"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Téléphone mobile (SMS prêt) *</label>
                <input
                  type="tel"
                  required
                  placeholder="06 12 34 56 78"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email de confirmation *</label>
                <input
                  type="email"
                  required
                  placeholder="sophie@exemple.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Slot Selection */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" /> Créneau de Retrait
              </h2>
              {selectedSlot && (
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  ⏰ {selectedSlot.displayTime}
                </span>
              )}
            </div>
            <SlotPicker
              selectedSlot={selectedSlot}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
            />
          </div>

          {/* Step 3: Payment Method */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" /> Mode de Règlement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE_WOXXPAY')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  paymentMethod === 'ONLINE_WOXXPAY'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl ${paymentMethod === 'ONLINE_WOXXPAY' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold block text-white">Paiement CB en ligne</span>
                  <span className="text-xs text-slate-400 mt-0.5 block">Sécurisé par WoxxPay / Stripe</span>
                </div>
              </button>

              {tenant?.acceptUnpaidOrders && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ON_SITE')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    paymentMethod === 'ON_SITE'
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${paymentMethod === 'ON_SITE' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block text-white">Paiement sur place</span>
                    <span className="text-xs text-slate-400 mt-0.5 block">Au comptoir lors du retrait</span>
                  </div>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Instructions ou remarques spéciales</label>
              <textarea
                rows={2}
                placeholder="Ex: Sans oignon, allergie particulière, emballage cadeau..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 rounded-3xl border border-white/10 sticky top-28 space-y-6">
            <h2 className="text-xl font-bold text-white font-heading">Récapitulatif de Commande</h2>

            {/* Item list */}
            <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{item.product.name}</h4>
                    {item.selectedOptions && (
                      <div className="text-[11px] text-slate-400">
                        {Object.entries(item.selectedOptions).map(([k, v]: any) => (
                          <span key={k} className="mr-2">
                            {k}: <strong>{v?.label}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-amber-400 font-semibold">
                      {(item.unitPriceCents / 100).toFixed(2)} €
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total calculation */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Sous-total ({totalItems} articles)</span>
                <span>{(totalCents / 100).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Frais de service Click & Collect</span>
                <span className="text-emerald-400 font-semibold">Offert</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                <span>Total à régler</span>
                <span className="text-2xl text-amber-400">{(totalCents / 100).toFixed(2)} €</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <span>Validation en cours...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Confirmer la réservation Click & Collect</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
