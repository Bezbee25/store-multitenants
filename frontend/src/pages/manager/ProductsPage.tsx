import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Image, Package, Check, X, ArrowLeft } from 'lucide-react';
import { Product, Category } from '../../types';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { ImageDropzone } from '../../components/ImageDropzone';

export const ProductsPage: React.FC = () => {
  const { tenant } = useTenant();
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/manager/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || 'smash-burger'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
      const catRes = await fetch('/api/manager/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || 'smash-burger'
        }
      });
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [tenant?.subdomain, token]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || editingProduct.priceCents === undefined) return;

    try {
      const isNew = !editingProduct.id;
      const url = isNew ? '/api/manager/products' : `/api/manager/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || 'smash-burger'
        },
        body: JSON.stringify(editingProduct)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchCatalog();
      }
    } catch {
      // Handled
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Supprimer définitivement ce produit ?')) return;

    try {
      const res = await fetch(`/api/manager/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || 'smash-burger'
        }
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
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
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Catalogue & Inventaire</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-1">
            Gestion des Produits & Stocks
          </h1>
        </div>

        <button
          onClick={() => {
            setEditingProduct({
              name: '',
              description: '',
              priceCents: 1000,
              stockQuantity: 50,
              isAvailable: true,
              preparationTimeMinutes: 15,
              imageUrl: ''
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Produit</span>
        </button>
      </div>

      {/* Products Table / Cards */}
      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Produit</th>
                <th className="py-4 px-4">Catégorie</th>
                <th className="py-4 px-4">Prix TTC</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Préparation</th>
                <th className="py-4 px-4">Disponibilité</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <img
                      src={prod.imageUrl || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=100&q=80"}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-900"
                    />
                    <div>
                      <span className="font-bold text-white text-sm block">{prod.name}</span>
                      <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{prod.description}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-300">
                      {categories.find(c => c.id === prod.categoryId)?.name || 'Général'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-amber-400 text-sm">
                    {(prod.priceCents / 100).toFixed(2)} €
                  </td>
                  <td className="py-4 px-4 font-semibold text-white">
                    {prod.stockQuantity} unités
                  </td>
                  <td className="py-4 px-4 text-slate-300">
                    ⏱️ {prod.preparationTimeMinutes} min
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      prod.isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {prod.isAvailable ? 'En Vente' : 'Masqué'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingProduct(prod);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-400 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white font-heading">
                {editingProduct.id ? 'Modifier le Produit' : 'Ajouter un Produit'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom de l'article *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Ingrédients</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prix TTC (en centimes) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.priceCents || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceCents: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-amber-400 mt-1 block">
                    = {((editingProduct.priceCents || 0) / 100).toFixed(2)} €
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock disponible</label>
                  <input
                    type="number"
                    value={editingProduct.stockQuantity || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Temps prépa (min)</label>
                  <input
                    type="number"
                    value={editingProduct.preparationTimeMinutes || 15}
                    onChange={(e) => setEditingProduct({ ...editingProduct, preparationTimeMinutes: parseInt(e.target.value) || 15 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <ImageDropzone
                  label="Photo principale du produit"
                  value={editingProduct.imageUrl}
                  onChange={(img) => setEditingProduct({ ...editingProduct, imageUrl: img })}
                  onRemove={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                  aspectRatio="video"
                  helperText="Glissez votre photo ou cliquez pour la sélectionner (PNG, JPG, WebP)"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={editingProduct.isAvailable ?? true}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0 w-4 h-4"
                />
                <label htmlFor="isAvailable" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Produit actif et visible sur la boutique
                </label>
              </div>

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
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
