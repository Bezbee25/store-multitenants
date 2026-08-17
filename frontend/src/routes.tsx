import React from 'react';
import { RouteObject, Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/storefront/HomePage';
import { CatalogPage } from './pages/storefront/CatalogPage';
import { CartPage } from './pages/storefront/CartPage';
import { OrderTrackingPage } from './pages/storefront/OrderTrackingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { KanbanPage } from './pages/manager/KanbanPage';
import { ProductsPage } from './pages/manager/ProductsPage';
import { CmsThemePage } from './pages/manager/CmsThemePage';
import { SlotsSettingsPage } from './pages/manager/SlotsSettingsPage';
import { WoxxPayDocPage } from './pages/manager/WoxxPayDocPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminTenantsPage } from './pages/admin/AdminTenantsPage';
import { AdminSmtpPage } from './pages/admin/AdminSmtpPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuth } from './context/AuthContext';
import { useTenant } from './context/TenantContext';
import { LayoutDashboard, Package, Palette, Clock, CreditCard, Shield, Store } from 'lucide-react';

import { FloatingCartBar } from './components/FloatingCartBar';

// Storefront Root Layout
const StorefrontLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow pb-16 md:pb-0">
        <Outlet />
      </main>
      <FloatingCartBar />
      <Footer />
    </div>
  );
};

// Manager Sub-Layout with Side Navigation & SuperAdmin Master Switcher
const ManagerLayout: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { tenant, currentSubdomain, switchSubdomain } = useTenant();
  const location = useLocation();

  const navItems = [
    { path: '/manager/kanban', label: 'Kanban Commandes', icon: LayoutDashboard },
    { path: '/manager/products', label: 'Produits & Stocks', icon: Package },
    { path: '/manager/cms', label: 'Thème & CMS', icon: Palette },
    { path: '/manager/slots', label: 'Créneaux & Horaires', icon: Clock },
    { path: '/manager/woxxpay', label: 'Guide WoxxPay / Stripe', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-grow space-y-4">
        {/* Super-Admin Master Control Banner */}
        {isSuperAdmin && (
          <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-purple-300 font-semibold">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>
                Mode Super-Admin Global : Vous pilotez la boutique <strong>{tenant?.name || currentSubdomain}</strong> (<code>{currentSubdomain}</code>)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={currentSubdomain}
                onChange={(e) => switchSubdomain(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-700/60 text-white text-xs font-bold focus:outline-none"
              >
                <option value="burger">🍔 Smash Burger</option>
                <option value="kebab">🌯 Berliner Kebab</option>
                <option value="fleurs">🌸 Atelier Floral</option>
                <option value="bijoux">💎 Joaillerie</option>
                <option value="boulangerie">🥐 Boulangerie</option>
                <option value="epicerie">🍷 Épicerie Fine</option>
                <option value="autre">✨ Sur-Mesure</option>
                <option value="cbd25">🌿 CBD 25</option>
              </select>

              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors whitespace-nowrap"
              >
                Hub Super-Admin
              </Link>
            </div>
          </div>
        )}

        {/* Manager Secondary Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 border-b border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

// Admin Sub-Layout
const AdminLayout: React.FC = () => {
  const location = useLocation();

  const adminNavItems = [
    { path: '/admin', label: 'Tableau de Bord Global', icon: Shield },
    { path: '/admin/tenants', label: 'Boutiques & Sous-domaines', icon: Store },
    { path: '/admin/smtp', label: 'Serveur SMTP Global', icon: Clock }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-grow">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export const routes: RouteObject[] = [
  // Public Storefront Routes
  {
    path: '/',
    element: <StorefrontLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'order/:orderNumber', element: <OrderTrackingPage /> },
      { path: 'auth/login', element: <LoginPage /> },
      { path: 'auth/register', element: <RegisterPage /> },
      { path: 'manager/login', element: <LoginPage /> },
      { path: 'admin/login', element: <LoginPage /> }
    ]
  },
  // Manager Routes
  {
    path: '/manager',
    element: <ManagerLayout />,
    children: [
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'cms', element: <CmsThemePage /> },
      { path: 'slots', element: <SlotsSettingsPage /> },
      { path: 'woxxpay', element: <WoxxPayDocPage /> }
    ]
  },
  // Super-Admin Routes
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'tenants', element: <AdminTenantsPage /> },
      { path: 'smtp', element: <AdminSmtpPage /> }
    ]
  },
  // 404 Fallback Route
  {
    path: '*',
    element: (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <NotFoundPage />
        <Footer />
      </div>
    )
  }
];
