import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package, Check, X } from 'lucide-react';
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
          'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
      const catRes = await fetch('/api/manager/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
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
          'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
        },
        body: JSON.stringify(editingProduct)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchCatalog();
      }
    } catch {
      // Revert/Error
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Supprimer définitivement ce produit ?')) return;
    try {
      const res = await fetch(`/api/manager/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Slug': tenant?.subdomain || 'cbd25'
        }
      });
      if (res.ok) fetchCatalog();
    } catch {
      // Error
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold font-heading text-stone-900 dark:text-stone-100">
            Gestion du Catalogue
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Ajoutez, modifiez ou masquez vos produits du catalogue Click & Collect.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct({ isAvailable: true, priceCents: 0 });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouveau produit
        </button>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="py-20 text-center text-sm text-stone-500">Chargement des produits...</div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900 p-8 space-y-3">
          <Package className="w-10 h-10 text-stone-400 mx-auto" />
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">Votre catalogue est vide</p>
          <p className="text-xs text-stone-500">Cliquez sur "Nouveau produit" pour ajouter votre premier article.</p>
          <button
            onClick={() => {
              setEditingProduct({ isAvailable: true, priceCents: 0 });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-medium"
          >
            <Plus className="w-4 h-4" /> Ajouter un produit
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
            <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800 text-[10px]">
              <tr>
                <th className="py-3 px-4">Produit</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Prix</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0">
                        {prod.imageUrl ? (
                          <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px]">N/A</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-stone-100">{prod.name}</p>
                        {prod.description && <p className="text-[11px] text-stone-500 line-clamp-1">{prod.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                    {categories.find((c) => c.id === prod.categoryId)?.name || 'Général'}
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100 font-heading">
                    {(prod.priceCents / 100).toFixed(2)} €
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                      prod.isAvailable
                        ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                        : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                    }`}>
                      {prod.isAvailable ? 'Disponible' : 'Masqué'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingProduct(prod);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h2 className="text-lg font-bold font-heading text-stone-900 dark:text-stone-100">
                {editingProduct.id ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Nom du produit *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Ex: Tarte aux Pommes Artisanale"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Description (optionnel)</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Ingrédients, allergènes..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Prix (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={((editingProduct.priceCents || 0) / 100).toString()}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        priceCents: Math.round(parseFloat(e.target.value || '0') * 100)
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Temps de prép. (min)</label>
                  <input
                    type="number"
                    value={editingProduct.preparationTimeMinutes || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        preparationTimeMinutes: parseInt(e.target.value || '0', 10) || undefined
                      })
                    }
                    placeholder="Ex: 10"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <ImageDropzone
                label="Photo du produit"
                value={editingProduct.imageUrl}
                onChange={(img) => setEditingProduct({ ...editingProduct, imageUrl: img })}
                onRemove={() => setEditingProduct({ ...editingProduct, imageUrl: undefined })}
                aspectRatio="square"
              />

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={editingProduct.isAvailable ?? true}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                  className="rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="isAvailable" className="text-xs text-stone-700 dark:text-stone-300">
                  Produit disponible à la vente
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium shadow-sm"
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
