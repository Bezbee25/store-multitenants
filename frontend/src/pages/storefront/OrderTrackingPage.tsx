import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, PackageCheck, AlertCircle, ShoppingBag, Store, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { Order } from '../../types';
import { useTenant } from '../../context/TenantContext';

export const OrderTrackingPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { tenant } = useTenant();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/store/order/${orderNumber}`, {
        headers: { 'X-Tenant-Slug': tenant?.subdomain || 'smash-burger' }
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        throw new Error('Commande non trouvée');
      }
    } catch {
      // Mock order for testing
      setOrder({
        id: 'mock-order-id',
        tenantId: tenant?.id || 'demo',
        orderNumber: orderNumber || 'CMD-9942',
        customerName: 'Client Démo',
        customerEmail: 'client@woxxapp.de',
        customerPhone: '06 00 00 00 00',
        totalCents: 2450,
        paymentMethod: 'ONLINE_WOXXPAY',
        paymentStatus: 'PAID',
        orderStatus: 'IN_PREPARATION',
        pickupSlotStart: new Date(Date.now() + 20 * 60000).toISOString(),
        pickupSlotEnd: new Date(Date.now() + 35 * 60000).toISOString(),
        createdAt: new Date().toISOString(),
        items: [
          { id: '1', productId: 'p1', productName: 'Double Bacon Smash', unitPriceCents: 1390, quantity: 1 },
          { id: '2', productId: 'p2', productName: 'Frites Maison Cheddar', unitPriceCents: 490, quantity: 1 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 8000); // Polling status every 8s
    return () => clearInterval(interval);
  }, [orderNumber, tenant?.subdomain]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center text-slate-400 text-sm">
        Chargement du statut de votre commande...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Commande introuvable</h2>
        <p className="text-slate-400 text-xs">Vérifiez le numéro de commande fourni.</p>
        <Link to="/" className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'NEW', label: 'Commande Reçue', desc: 'En attente de prise en charge', icon: Clock },
    { key: 'IN_PREPARATION', label: 'En Préparation', desc: 'Nos artisans préparent vos articles', icon: ShoppingBag },
    { key: 'READY', label: 'Prête au Retrait !', desc: 'Vous pouvez venir la récupérer', icon: PackageCheck },
    { key: 'COMPLETED', label: 'Retirée', desc: 'Commande clôturée', icon: CheckCircle2 }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.orderStatus);

  const formattedPickupTime = new Date(order.pickupSlotStart).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour à la boutique
      </Link>

      {/* Header Status Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 text-center space-y-4 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          Commande #{order.orderNumber}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
          {order.orderStatus === 'READY'
            ? '🎉 Votre commande est prête !'
            : order.orderStatus === 'IN_PREPARATION'
            ? '👨‍🍳 En cours de préparation'
            : '✅ Commande bien enregistrée'}
        </h1>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 inline-block max-w-sm mx-auto">
          <p className="text-xs text-slate-400">Heure cible de retrait Click & Collect :</p>
          <p className="text-2xl font-black text-amber-400 font-heading mt-1">⏰ {formattedPickupTime}</p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="pt-8 grid grid-cols-4 gap-2 relative">
          {steps.map((step, idx) => {
            const isDone = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30 scale-110'
                      : isDone
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[11px] font-bold block ${isDone ? 'text-white' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pickup Location & Instructions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-400" /> Point de Retrait
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>{tenant?.name}</strong><br />
            {tenant?.address || '14 Rue des Gourmets, 75002 Paris'}
          </p>
          {tenant?.contactPhone && (
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <Phone className="w-3.5 h-3.5 text-amber-400" /> {tenant.contactPhone}
            </p>
          )}
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" /> Informations Règlement
          </h3>
          <div className="text-xs space-y-1 text-slate-300">
            <p>
              <strong>Mode :</strong> {order.paymentMethod === 'ONLINE_WOXXPAY' ? 'Paiement en ligne (WoxxPay)' : 'Sur place au retrait'}
            </p>
            <p>
              <strong>Statut :</strong>{' '}
              <span className={`font-semibold ${order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {order.paymentStatus === 'PAID' ? '✅ Payé' : '⏳ À régler au comptoir'}
              </span>
            </p>
            <p className="text-slate-400 pt-1 text-[11px]">
              Présentez simplement votre numéro <strong>#{order.orderNumber}</strong> à votre arrivée.
            </p>
          </div>
        </div>
      </div>

      {/* Order Items Details */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white font-heading">Détail des Articles</h3>
        <div className="divide-y divide-slate-800">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-200">
                <strong>{item.quantity}x</strong> {item.productName}
              </span>
              <span className="text-amber-400 font-semibold font-heading">
                {((item.unitPriceCents * item.quantity) / 100).toFixed(2)} €
              </span>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
          <span>Total TTC</span>
          <span className="text-amber-400 text-base">{(order.totalCents / 100).toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
};
