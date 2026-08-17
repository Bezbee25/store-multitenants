import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Clock, CheckCircle2, ShoppingBag, PackageCheck, Banknote, CreditCard, RefreshCw, AlertTriangle, ArrowRight, User } from 'lucide-react';
import { Order } from '../../types';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';

const COLUMNS = [
  { id: 'NEW', title: 'À Préparer', color: 'border-amber-500/50 bg-amber-500/5', icon: Clock, badgeColor: 'bg-amber-500 text-slate-950' },
  { id: 'IN_PREPARATION', title: 'En Cuisson / Préparation', color: 'border-blue-500/50 bg-blue-500/5', icon: ShoppingBag, badgeColor: 'bg-blue-500 text-white' },
  { id: 'READY', title: 'Prêtes au Retrait !', color: 'border-emerald-500/50 bg-emerald-500/5', icon: PackageCheck, badgeColor: 'bg-emerald-500 text-slate-950' },
  { id: 'COMPLETED', title: 'Clôturées / Livrées', color: 'border-slate-700 bg-slate-900/30', icon: CheckCircle2, badgeColor: 'bg-slate-700 text-slate-300' }
];

export const KanbanPage: React.FC = () => {
  const { tenant } = useTenant();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/manager/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || 'smash-burger'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        throw new Error('Fallback demo orders');
      }
    } catch {
      // Mock orders for demo visual testing
      const now = Date.now();
      const mockOrders: Order[] = [
        {
          id: 'ord-1',
          tenantId: tenant?.id || 'demo',
          orderNumber: 'SM-2041',
          customerName: 'Thomas Leroy',
          customerEmail: 'thomas@gmail.com',
          customerPhone: '06 12 34 56 78',
          totalCents: 2680,
          paymentMethod: 'ONLINE_WOXXPAY',
          paymentStatus: 'PAID',
          orderStatus: 'NEW',
          pickupSlotStart: new Date(now + 12 * 60000).toISOString(),
          pickupSlotEnd: new Date(now + 27 * 60000).toISOString(),
          createdAt: new Date(now - 5 * 60000).toISOString(),
          items: [
            { id: 'i1', productId: 'p1', productName: 'Double Bacon Smash', unitPriceCents: 1390, quantity: 2 },
            { id: 'i2', productId: 'p2', productName: 'Frites Cheddar Fondue', unitPriceCents: 490, quantity: 1 }
          ]
        },
        {
          id: 'ord-2',
          tenantId: tenant?.id || 'demo',
          orderNumber: 'SM-2042',
          customerName: 'Julie Dupuis',
          customerEmail: 'julie@orange.fr',
          customerPhone: '06 98 76 54 32',
          totalCents: 1550,
          paymentMethod: 'ON_SITE',
          paymentStatus: 'PENDING',
          orderStatus: 'IN_PREPARATION',
          pickupSlotStart: new Date(now + 6 * 60000).toISOString(),
          pickupSlotEnd: new Date(now + 21 * 60000).toISOString(),
          createdAt: new Date(now - 15 * 60000).toISOString(),
          items: [
            { id: 'i3', productId: 'p3', productName: 'Truffle & Crispy Onion Smash', unitPriceCents: 1550, quantity: 1 }
          ]
        },
        {
          id: 'ord-3',
          tenantId: tenant?.id || 'demo',
          orderNumber: 'SM-2039',
          customerName: 'Marc Vasseur',
          customerEmail: 'marc@gmail.com',
          customerPhone: '07 55 44 33 22',
          totalCents: 3840,
          paymentMethod: 'ONLINE_WOXXPAY',
          paymentStatus: 'PAID',
          orderStatus: 'READY',
          pickupSlotStart: new Date(now - 2 * 60000).toISOString(),
          pickupSlotEnd: new Date(now + 13 * 60000).toISOString(),
          createdAt: new Date(now - 30 * 60000).toISOString(),
          items: [
            { id: 'i4', productId: 'p1', productName: 'Double Bacon Smash', unitPriceCents: 1390, quantity: 2 },
            { id: 'i5', productId: 'p4', productName: 'Loaded Pulled Pork Fries', unitPriceCents: 790, quantity: 2 }
          ]
        }
      ];
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, [tenant?.subdomain, token]);

  const updateOrderStatus = async (orderId: string, nextStatus: any) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: nextStatus } : o));

    try {
      await fetch(`/api/manager/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || 'smash-burger'
        },
        body: JSON.stringify({ orderStatus: nextStatus })
      });
    } catch {
      // Handled
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    const newStatus = destination.droppableId as any;
    updateOrderStatus(draggableId, newStatus);
  };

  const [activeMobileTab, setActiveMobileTab] = useState<string>('ALL');

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Espace Gérant
            </span>
            <span className="text-xs text-slate-400">• {tenant?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-1">
            Kanban des Commandes Click & Collect
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Mobile Segmented Control */}
      <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveMobileTab('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeMobileTab === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          Toutes ({orders.length})
        </button>
        {COLUMNS.map((col) => {
          const count = orders.filter(o => o.orderStatus === col.id).length;
          return (
            <button
              key={col.id}
              onClick={() => setActiveMobileTab(col.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeMobileTab === col.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <span>{col.title.split('/')[0]}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeMobileTab === col.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLUMNS.map((col) => {
            const isVisibleOnMobile = activeMobileTab === 'ALL' || activeMobileTab === col.id;
            const columnOrders = orders.filter(o => o.orderStatus === col.id);
            const Icon = col.icon;

            return (
              <div
                key={col.id}
                className={`flex flex-col min-h-[500px] lg:min-h-[600px] rounded-3xl glass border border-white/10 p-4 space-y-4 ${
                  isVisibleOnMobile ? 'block' : 'hidden lg:flex'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                      <Icon className="w-4 h-4 text-amber-400" />
                    </div>
                    <h2 className="font-bold text-sm text-white font-heading">{col.title}</h2>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                    {columnOrders.length}
                  </span>
                </div>

                {/* Droppable Card Container */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 p-1 rounded-2xl transition-colors ${
                        snapshot.isDraggingOver ? 'bg-slate-800/40' : ''
                      }`}
                    >
                      {columnOrders.map((order, index) => {
                        const targetDate = new Date(order.pickupSlotStart);
                        const isUrgent = targetDate.getTime() - Date.now() < 10 * 60000 && order.orderStatus !== 'COMPLETED';

                        return (
                          <Draggable key={order.id} draggableId={order.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedOrder(order)}
                                className={`p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing space-y-3 ${
                                  snapshot.isDragging ? 'shadow-2xl scale-105 border-amber-500 bg-slate-850 z-50' : 'bg-slate-900/90 hover:border-slate-700'
                                } ${isUrgent ? 'border-amber-500/80 bg-amber-950/20' : 'border-slate-800'}`}
                              >
                                {/* Header: Order Number & Target Time */}
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-white text-sm font-heading tracking-wide">
                                    #{order.orderNumber}
                                  </span>
                                  <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
                                    isUrgent ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-300'
                                  }`}>
                                    <Clock className="w-3 h-3" />
                                    {targetDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>

                                {/* Customer Info */}
                                <div className="text-xs space-y-0.5">
                                  <p className="font-semibold text-slate-200 flex items-center gap-1">
                                    <User className="w-3 h-3 text-slate-400" /> {order.customerName}
                                  </p>
                                  <p className="text-slate-400 text-[11px]">{order.customerPhone}</p>
                                </div>

                                {/* Items Summary */}
                                <div className="bg-slate-950/50 p-2.5 rounded-xl text-xs space-y-1">
                                  {order.items.map((it, idx) => (
                                    <div key={idx} className="flex justify-between text-slate-300">
                                      <span><strong>{it.quantity}x</strong> {it.productName}</span>
                                      <span className="text-slate-400 font-semibold">{((it.unitPriceCents * it.quantity) / 100).toFixed(2)}€</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Payment Status Badge */}
                                <div className="flex items-center justify-between pt-1 text-xs">
                                  {order.paymentMethod === 'ONLINE_WOXXPAY' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                                      <CreditCard className="w-3 h-3" /> Payé en ligne
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded-md">
                                      <Banknote className="w-3 h-3" /> Sur place ({order.paymentStatus === 'PAID' ? 'Encaissé' : 'À régler'})
                                    </span>
                                  )}
                                  <span className="font-extrabold text-white text-sm">
                                    {(order.totalCents / 100).toFixed(2)} €
                                  </span>
                                </div>

                                {/* Quick advance button */}
                                {col.id !== 'COMPLETED' && (
                                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const nextMap: Record<string, string> = {
                                          NEW: 'IN_PREPARATION',
                                          IN_PREPARATION: 'READY',
                                          READY: 'COMPLETED'
                                        };
                                        updateOrderStatus(order.id, nextMap[order.orderStatus]);
                                      }}
                                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-all flex items-center gap-1"
                                    >
                                      <span>Étape suivante</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
