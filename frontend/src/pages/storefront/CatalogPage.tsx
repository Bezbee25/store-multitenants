import React, { useEffect, useState } from 'react';
import { Search, ShoppingBag, Filter } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { ProductCard } from '../../components/ProductCard';
import { ProductModal } from '../../components/ProductModal';
import { Product, Category } from '../../types';

export const CatalogPage: React.FC = () => {
  const { tenant } = useTenant();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/store/catalog', {
          headers: { 'X-Tenant-Slug': tenant?.subdomain || 'smash-burger' }
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch {
        // Fallback demo handled
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [tenant?.subdomain]);

  // Aggregate all products
  const allProducts: Product[] = [];
  categories.forEach((cat) => {
    if (cat.products) {
      allProducts.push(...cat.products);
    }
  });

  // Filter products by category and search term
  const filteredProducts = allProducts.filter((prod) => {
    const matchesCategory = activeCategory === 'all' || prod.categoryId === activeCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-heading">
          Notre Carte & Produits
        </h1>
        <p className="text-sm text-slate-300">
          Sélectionnez vos articles pour un retrait rapide en Click & Collect.
        </p>
      </div>

      {/* Search & Filter Bar (Sticky) */}
      <div className="sticky top-20 z-30 flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-3 sm:p-4 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl bg-slate-950/85">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            Tous les articles ({allProducts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {cat.name} ({cat.products?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Chargement de la carte...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-base text-slate-300 font-semibold">Aucun article trouvé</p>
          <p className="text-xs text-slate-500">Essayez de modifier votre recherche ou filtre de catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Product Customization & Add Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
