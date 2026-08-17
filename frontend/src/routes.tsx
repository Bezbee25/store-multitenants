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
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 dark:bg-stone-950">
      <Navbar />
      <main className="flex-grow pb-16 md:pb-0">
        <Outlet />
      </main>
      <FloatingCartBar />
      <Footer />
    </div>
  );
};

// Manager Sub-Layout
const ManagerLayout: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { tenant, currentSubdomain, switchSubdomain } = useTenant();
  const location = useLocation();

  const navItems = [
    { path: '/manager/kanban', label: 'Commandes', icon: LayoutDashboard },
    { path: '/manager/products', label: 'Produits', icon: Package },
    { path: '/manager/cms', label: 'Templates', icon: Palette },
    { path: '/manager/slots', label: 'Créneaux', icon: Clock },
    { path: '/manager/woxxpay', label: 'Paiements', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-grow space-y-4">

        {/* SuperAdmin Banner */}
        {isSuperAdmin && (
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-medium">
              <Shield className="w-4 h-4 text-orange-500" />
              <span>Super-Admin · <strong className="text-stone-900 dark:text-stone-100">{tenant?.name || currentSubdomain}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={currentSubdomain}
                onChange={(e) => switchSubdomain(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium focus:outline-none"
              >
                <option value="burger">Smash Burger</option>
                <option value="kebab">Berliner Kebab</option>
                <option value="fleurs">Atelier Floral</option>
                <option value="bijoux">Joaillerie</option>
                <option value="boulangerie">Boulangerie</option>
                <option value="epicerie">Épicerie Fine</option>
                <option value="autre">Sur-Mesure</option>
                <option value="cbd25">CBD 25</option>
              </select>
              <Link to="/admin" className="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium text-xs transition-colors hover:bg-stone-800">
                Hub Admin
              </Link>
            </div>
          </div>
        )}

        {/* Manager Nav */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 border-b border-stone-200 dark:border-stone-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
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
    { path: '/admin', label: 'Tableau de Bord', icon: Shield },
    { path: '/admin/tenants', label: 'Boutiques', icon: Store },
    { path: '/admin/smtp', label: 'SMTP', icon: Clock }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-grow">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 border-b border-stone-200 dark:border-stone-800">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
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
  // 404
  {
    path: '*',
    element: (
      <div className="min-h-screen flex flex-col justify-between bg-stone-50 dark:bg-stone-950">
        <Navbar />
        <NotFoundPage />
        <Footer />
      </div>
    )
  }
];
