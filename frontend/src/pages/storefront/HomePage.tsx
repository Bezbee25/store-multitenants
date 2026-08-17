import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Clock, Sparkles, MapPin, Phone, Star, ShieldCheck } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { ProductCard } from '../../components/ProductCard';
import { ProductModal } from '../../components/ProductModal';
import { Product } from '../../types';

export const HomePage: React.FC = () => {
  const { tenant } = useTenant();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('/api/store/catalog', {
          headers: { 'X-Tenant-Slug': tenant?.subdomain || 'smash-burger' }
        });
        if (res.ok) {
          const data = await res.json();
          const allProducts: Product[] = [];
          if (data.categories) {
            data.categories.forEach((cat: any) => {
              if (cat.products) allProducts.push(...cat.products);
            });
          }
          if (data.uncategorized) allProducts.push(...data.uncategorized);
          setFeaturedProducts(allProducts.slice(0, 4));
        }
      } catch {
        // Fallback for visual preview
      }
    };
    fetchCatalog();
  }, [tenant?.subdomain]);

  return (
    <div className="space-y-20">
      {/* Announcement Bar if set */}
      {tenant?.cmsConfig?.announcement && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-bold text-xs py-2 px-4 text-center tracking-wide shadow-md">
          {tenant.cmsConfig.announcement}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[520px] sm:min-h-[580px] flex items-center justify-center overflow-hidden rounded-3xl mx-4 sm:mx-8 border border-white/10 shadow-2xl">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
          style={{
            backgroundImage: `url('${tenant?.heroImageUrl || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=80"}')`
          }}
        />
        {/* Overlay with custom opacity */}
        <div
          className="absolute inset-0 bg-slate-950"
          style={{ opacity: tenant?.themeConfig?.heroOverlayOpacity ?? 0.65 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 py-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/15 text-xs font-semibold text-amber-400 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Click & Collect • Prêt en {tenant?.slotDurationMinutes || 15} minutes</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white font-heading tracking-tight leading-none">
            {tenant?.name || 'Notre Boutique Gourmande'}
          </h1>

          <p className="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed">
            {tenant?.tagline || 'Commandez en ligne et retirez vos articles en quelques minutes en boutique.'}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/catalog"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 group active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Commander en Click & Collect</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#about"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl glass hover:bg-white/10 text-white font-semibold text-sm transition-all flex items-center justify-center"
            >
              Découvrir la boutique
            </a>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white font-heading">Retrait Express</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Choisissez votre créneau et vos produits sont prêts et emballés à votre arrivée.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/10 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white font-heading">Paiement Flexible</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Réglez en ligne par carte via WoxxPay ou directement sur place au comptoir.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/10 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white font-heading">Qualité Artisanale</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Produits frais préparés à la commande selon nos recettes signatures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Sélection du moment</span>
              <h2 className="text-3xl font-extrabold text-white font-heading mt-1">Nos Meilleurs Produits</h2>
            </div>
            <Link
              to="/catalog"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelect={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Presentation / About Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-white/10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Notre Histoire & Savoir-Faire</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              {tenant?.cmsConfig?.aboutTitle || 'Bienvenue dans notre boutique'}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {tenant?.cmsConfig?.aboutText || tenant?.description || 'Nous mettons un point d’honneur à vous offrir des produits exceptionnels, préparés chaque jour avec amour et exigence.'}
            </p>
            <div className="pt-2 flex items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{tenant?.address || 'Paris 2e'}</span>
              </div>
              {tenant?.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>{tenant.contactPhone}</span>
                </div>
              )}
            </div>
          </div>
          <div className="relative aspect-video sm:aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-xl">
            <img
              src={tenant?.heroImageUrl || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"}
              alt="Boutique"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
