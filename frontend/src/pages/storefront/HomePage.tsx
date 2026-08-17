import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Clock, ShieldCheck, Sparkles, MapPin, Phone } from 'lucide-react';
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
          headers: { 'X-Tenant-Slug': tenant?.subdomain || 'cbd25' }
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
        // Fallback
      }
    };
    fetchCatalog();
  }, [tenant?.subdomain]);

  const features = tenant?.cmsConfig?.features || [
    { icon: 'Clock', title: 'Retrait Express', desc: 'Votre commande prête au créneau choisi.' },
    { icon: 'ShieldCheck', title: 'Paiement Sécurisé', desc: 'En ligne ou sur place, à vous de choisir.' },
    { icon: 'Sparkles', title: 'Qualité Artisanale', desc: 'Des produits sélectionnés avec exigence.' },
  ];

  const featureIcons: Record<string, React.ReactNode> = {
    Clock: <Clock className="w-5 h-5" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5" />,
    Sparkles: <Sparkles className="w-5 h-5" />,
  };

  return (
    <div>
      {/* Announcement Bar */}
      {tenant?.cmsConfig?.announcement && (
        <div className="bg-stone-900 dark:bg-stone-800 text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
          {tenant.cmsConfig.announcement}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Text Content */}
            <div className="space-y-6 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                Click & Collect · Prêt en {tenant?.slotDurationMinutes || 15} min
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-stone-900 dark:text-stone-100 leading-tight tracking-tight">
                {tenant?.name || 'Votre Boutique en Ligne'}
              </h1>

              <p className="text-base text-stone-600 dark:text-stone-400 leading-relaxed">
                {tenant?.tagline || 'Commandez en ligne et récupérez vos articles en quelques minutes en boutique.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/catalog"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm transition-colors shadow-sm group"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Commander maintenant
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium text-sm transition-colors"
                >
                  En savoir plus
                </a>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-stone-300/30 dark:shadow-stone-900/50">
                <img
                  src={tenant?.heroImageUrl || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80'}
                  alt={tenant?.name || 'Boutique'}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-stone-900 rounded-xl p-3 shadow-lg border border-stone-200 dark:border-stone-800 hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">Paiement sécurisé</p>
                    <p className="text-[10px] text-stone-500">WoxxPay & CB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-stone-900/50 border-y border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  {featureIcons[feat.icon] || <Sparkles className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 font-heading">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1">
                Sélection
              </p>
              <h2 className="text-2xl font-bold font-heading text-stone-900 dark:text-stone-100">
                Nos meilleurs produits
              </h2>
            </div>
            <Link
              to="/catalog"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-500 group"
            >
              Tout voir
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelect={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>

          <div className="sm:hidden mt-6 text-center">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-1 text-sm font-medium text-orange-600"
            >
              Voir tout le catalogue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* About Section */}
      <section id="about" className="bg-stone-50 dark:bg-stone-900/30 border-y border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Notre histoire
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-stone-900 dark:text-stone-100">
                {tenant?.cmsConfig?.aboutTitle || 'Bienvenue dans notre boutique'}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {tenant?.cmsConfig?.aboutText || tenant?.description || 'Nous mettons un point d\'honneur à vous offrir des produits exceptionnels, préparés avec soin et exigence.'}
              </p>
              <div className="flex items-center gap-4 pt-2 text-xs text-stone-500">
                {tenant?.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" /> {tenant.address}
                  </span>
                )}
                {tenant?.contactPhone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-orange-500" /> {tenant.contactPhone}
                  </span>
                )}
              </div>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
              <img
                src={tenant?.heroImageUrl || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'}
                alt="À propos"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-stone-900 dark:bg-stone-800 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white mb-3">
            Prêt à commander ?
          </h2>
          <p className="text-sm text-stone-400 mb-6 max-w-md mx-auto">
            Choisissez vos articles, sélectionnez votre créneau et récupérez votre commande en boutique.
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Découvrir nos produits
          </Link>
        </div>
      </section>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};
