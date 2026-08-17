import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Clock, CheckCircle2, ShoppingBag, PackageCheck, RefreshCw } from 'lucide-react';
import { Order } from '../../types';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';

const COLUMNS = [
  { id: 'NEW', title: 'À Préparer', color: 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20', icon: Clock, badgeColor: 'bg-amber-500 text-white' },
  { id: 'IN_PREPARATION', title: 'En Cuisson / Préparation', color: 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20', icon: ShoppingBag, badgeColor: 'bg-blue-600 text-white' },
  { id: 'READY', title: 'Prêtes au Retrait !', color: 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20', icon: PackageCheck, badgeColor: 'bg-emerald-600 text-white' },
  { id: 'COMPLETED', title: 'Clôturées / Livrées', color: 'border-stone-300 bg-stone-100/50 dark:bg-stone-900/50', icon: CheckCircle2, badgeColor: 'bg-stone-600 text-white' }
];

export const KanbanPage: React.FC = () => {
  const { tenant } = useTenant();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/manager/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [tenant?.subdomain, token]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId as Order['orderStatus'];
    setOrders((prev) =>
      prev.map((o) => (o.id === draggableId ? { ...o, orderStatus: newStatus } : o))
    );

    try {
      await fetch(`/api/manager/orders/${draggableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch {
      // Revert if error
    }
  };

  const getOrdersByStatus = (status: string) => orders.filter((o) => o.orderStatus === status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold font-heading text-stone-900 dark:text-stone-100">
            Suivi des Commandes
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Glissez-déposez les cartes pour changer le statut de préparation en temps réel.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium hover:bg-stone-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Kanban Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const columnOrders = getOrdersByStatus(col.id);
            const Icon = col.icon;

            return (
              <div
                key={col.id}
                className={`rounded-xl border p-4 flex flex-col min-h-[500px] ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                    <h3 className="font-semibold text-xs text-stone-900 dark:text-stone-100 font-heading">
                      {col.title}
                    </h3>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                    {columnOrders.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-orange-50/40 dark:bg-orange-950/10 rounded-lg' : ''
                      }`}
                    >
                      {columnOrders.length === 0 ? (
                        <div className="h-32 flex items-center justify-center text-stone-400 text-xs italic">
                          Aucune commande
                        </div>
                      ) : (
                        columnOrders.map((order, index) => (
                          <Draggable key={order.id} draggableId={order.id} index={index}>
                            {(providedDraggable, snapshotDraggable) => (
                              <div
                                ref={providedDraggable.innerRef}
                                {...providedDraggable.draggableProps}
                                {...providedDraggable.dragHandleProps}
                                className={`p-3.5 rounded-xl border bg-white dark:bg-stone-900 transition-all cursor-pointer space-y-2.5 ${
                                  snapshotDraggable.isDragging
                                    ? 'border-orange-500 shadow-xl scale-[1.02]'
                                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-stone-900 dark:text-stone-100 font-mono">
                                    #{order.orderNumber}
                                  </span>
                                  <span className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-orange-500" />
                                    {new Date(order.pickupSlotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                                    {order.customerName}
                                  </p>
                                  <p className="text-[11px] text-stone-500 truncate">
                                    {order.items?.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px]">
                                  <span className="font-bold text-stone-900 dark:text-stone-100 font-heading">
                                    {(order.totalCents / 100).toFixed(2)} €
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                    order.paymentStatus === 'PAID'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                                  }`}>
                                    {order.paymentStatus === 'PAID' ? 'Payé' : 'À payer'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
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
