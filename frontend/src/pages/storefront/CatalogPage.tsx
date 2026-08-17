import React, { useEffect, useState } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
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
          headers: { 'X-Tenant-Slug': tenant?.subdomain || 'cbd25' }
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [tenant?.subdomain]);

  const allProducts: Product[] = [];
  categories.forEach((cat) => {
    if (cat.products) allProducts.push(...cat.products);
  });

  const filteredProducts = allProducts.filter((prod) => {
    const matchesCategory = activeCategory === 'all' || prod.categoryId === activeCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-stone-900 dark:text-stone-100">
          Nos produits
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          {allProducts.length} article{allProducts.length > 1 ? 's' : ''} disponible{allProducts.length > 1 ? 's' : ''} en Click & Collect.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-16 z-30 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-lg -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 mb-6 border-b border-stone-200 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-0.5">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
              }`}
            >
              Tout ({allProducts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                    : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
              >
                {cat.name} ({cat.products?.length || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-6 h-6 border-2 border-stone-300 dark:border-stone-600 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-stone-500 mt-3">Chargement...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingBag className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Aucun article trouvé</p>
          <p className="text-xs text-stone-500 mt-1">Modifiez votre recherche ou changez de catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      )}

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};
