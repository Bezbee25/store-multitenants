import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '../types';
import { PRESET_OPTIONS } from '../presets/presets';

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  currentSubdomain: string;
  setTenant: (t: Tenant) => void;
  refetchTenant: () => Promise<void>;
  switchSubdomain: (subdomain: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract subdomain from hostname or fallback to localStorage / demo
  const getInitialSubdomain = () => {
    // 1. From host URL if not localhost/generic
    const host = window.location.hostname;
    const parts = host.split('.');
    if (parts.length >= 3 && parts[0] !== 'store' && parts[0] !== 'www') {
      return parts[0];
    }
    // 2. Query param ?tenant=xxx
    const urlParams = new URLSearchParams(window.location.search);
    const paramTenant = urlParams.get('tenant');
    if (paramTenant) return paramTenant;

    // 3. From localStorage
    const saved = localStorage.getItem('woxx_current_subdomain');
    if (saved) return saved;

    // Default demo tenant
    return 'smash-burger';
  };

  const [currentSubdomain, setCurrentSubdomain] = useState<string>(getInitialSubdomain());

  const applyThemeVariables = (t: Tenant) => {
    const config = t.themeConfig || PRESET_OPTIONS[0].themeConfig;
    const root = document.documentElement;

    root.style.setProperty('--color-primary', config.primaryColor || '#EA580C');
    root.style.setProperty('--color-secondary', config.secondaryColor || '#B45309');
    root.style.setProperty('--color-accent', config.accentColor || '#F59E0B');
    root.style.setProperty('--color-bg', config.backgroundColor || '#0F172A');
    root.style.setProperty('--color-text', config.textColor || '#F8FAFC');
    root.style.setProperty('--font-heading', config.fontHeading || 'Space Grotesk, sans-serif');
    root.style.setProperty('--font-body', config.fontBody || 'Inter, sans-serif');
    root.style.setProperty('--border-radius', config.borderRadius || '1rem');
  };

  const fetchTenant = async (subdomain: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/store/info', {
        headers: {
          'X-Tenant-Slug': subdomain
        }
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Boutique "${subdomain}" non trouvée.`);
        }
        throw new Error('Erreur de chargement de la boutique.');
      }

      const data = await res.json();
      setTenant(data);
      applyThemeVariables(data);
    } catch (err: any) {
      console.warn('[TenantContext] Fetch error, falling back to preset mockup:', err.message);
      setError(err.message);

      // Graceful fallback preset for local preview
      const preset = PRESET_OPTIONS.find(p => p.id === subdomain) || PRESET_OPTIONS[0];
      const mockTenant: Tenant = {
        id: 'mock-id',
        subdomain: subdomain || 'smash-burger',
        name: preset.name,
        tagline: preset.tagline,
        description: preset.description,
        themePreset: preset.id,
        themeConfig: preset.themeConfig,
        cmsConfig: preset.cmsConfig,
        heroImageUrl: preset.heroImageUrl,
        logoUrl: preset.logoUrl,
        contactPhone: '+33 1 42 68 00 00',
        contactEmail: 'contact@store.woxxapp.de',
        address: '14 Rue des Gourmets, 75002 Paris',
        acceptUnpaidOrders: true,
        slotDurationMinutes: 15,
        maxItemsPerSlot: 20,
        hasWoxxPayEnabled: true
      };
      setTenant(mockTenant);
      applyThemeVariables(mockTenant);
    } finally {
      setLoading(false);
    }
  };

  const switchSubdomain = (newSubdomain: string) => {
    setCurrentSubdomain(newSubdomain);
    localStorage.setItem('woxx_current_subdomain', newSubdomain);
    fetchTenant(newSubdomain);
  };

  useEffect(() => {
    fetchTenant(currentSubdomain);
  }, [currentSubdomain]);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        loading,
        error,
        currentSubdomain,
        setTenant: (t) => {
          setTenant(t);
          applyThemeVariables(t);
        },
        refetchTenant: () => fetchTenant(currentSubdomain),
        switchSubdomain
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
