import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { TenantProvider } from './context/TenantContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './index.css';

// createHashRouter est OBLIGATOIRE sous le proxy WoxxApp
const router = createHashRouter(routes);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <TenantProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </TenantProvider>
    </AuthProvider>
  </React.StrictMode>
);
