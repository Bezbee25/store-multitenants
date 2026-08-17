import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Store, User, LayoutDashboard, Shield, Menu, X, Sparkles, Sun, Moon } from 'lucide-react';
import { useTenant } from '../context/TenantContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PRESET_OPTIONS } from '../presets/presets';

export const Navbar: React.FC = () => {
  const { tenant, currentSubdomain, switchSubdomain, colorMode, toggleColorMode } = useTenant();
  const { totalItems } = useCart();
  const { user, logout, isManager, isSuperAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Demo Bar for quick preset switching */}
      <div className="bg-slate-900/90 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800 flex items-center justify-between z-50 relative">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="flex items-center gap-1 font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            Boutique Active : <strong className="text-white">[{currentSubdomain}]</strong>
          </span>
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <span className="text-slate-400">🎨 Modèles & Templates :</span>
            {PRESET_OPTIONS.map((p) => (
              <button
                key={p.id}
                onClick={() => switchSubdomain(p.id)}
                className={`px-2 py-0.5 rounded transition-all ${
                  currentSubdomain === p.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {p.name.split('&')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Link to="/admin" className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Super-Admin
            </Link>
          )}
          {isManager && (
            <Link to="/manager/kanban" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              <LayoutDashboard className="w-3.5 h-3.5" /> Espace Gérant
            </Link>
          )}
        </div>
      </div>

      {/* Main Storefront Navigation Header */}
      <header className="sticky top-0 z-40 glass border-b border-slate-200/80 dark:border-white/10 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Store Brand / Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              {tenant?.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 dark:border-white/20 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Store className="w-6 h-6 text-slate-950" />
                </div>
              )}
              <div>
                <span className="text-xl font-bold font-heading tracking-tight block text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  {tenant?.name || 'Boutique Multitenant'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block -mt-0.5 line-clamp-1">
                  {tenant?.tagline || 'Click & Collect express'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/' ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                Accueil & Vitrine
              </Link>
              <Link
                to="/catalog"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/catalog' ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                Magasin & Produits
              </Link>
            </nav>

            {/* Right Action Icons (Theme toggle, Cart, User) */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button (Light/Dark) */}
              <button
                type="button"
                onClick={toggleColorMode}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition-all active:scale-95"
                title={colorMode === 'light' ? 'Passer en thème sombre' : 'Passer en thème clair'}
              >
                {colorMode === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative flex items-center gap-2 p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 transition-all group"
                title="Panier Click & Collect"
              >
                <ShoppingBag className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
                <span className="hidden sm:inline text-xs font-semibold">Panier</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User Account / Manager Login */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-medium block text-slate-800 dark:text-slate-200">{user.fullName}</span>
                    <span className="text-[10px] text-amber-500 font-semibold uppercase">{user.role}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs text-slate-500 hover:text-red-500 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Connexion</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3 shadow-xl">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-800 dark:text-slate-200 hover:text-amber-500 font-medium py-1"
            >
              Accueil & Vitrine
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-800 dark:text-slate-200 hover:text-amber-500 font-medium py-1"
            >
              Magasin & Produits
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-800 dark:text-slate-200 hover:text-amber-500 font-medium py-1"
            >
              Mon Panier ({totalItems})
            </Link>
          </div>
        )}
      </header>
    </>
  );
};
