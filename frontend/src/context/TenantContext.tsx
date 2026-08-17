import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '../types';
import { PRESET_OPTIONS } from '../presets/presets';

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  currentSubdomain: string;
  colorMode: 'light' | 'dark';
  toggleColorMode: () => void;
  setTenant: (t: Tenant) => void;
  refetchTenant: () => Promise<void>;
  switchSubdomain: (subdomain: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default colorMode to 'light' (Priorité 1)
  const [colorMode, setColorMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('woxx_color_mode');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const toggleColorMode = () => {
    setColorMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('woxx_color_mode', next);
      return next;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    if (colorMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [colorMode]);

  // Extract subdomain from hostname or fallback to localStorage / demo
  const getInitialSubdomain = () => {
    const host = window.location.hostname;
    const parts = host.split('.');
    if (parts.length >= 3 && parts[0] !== 'store' && parts[0] !== 'www') {
      return parts[0];
    }
    const urlParams = new URLSearchParams(window.location.search);
    const paramTenant = urlParams.get('tenant');
    if (paramTenant) return paramTenant;

    const saved = localStorage.getItem('woxx_current_subdomain');
    if (saved) return saved;

    return 'cbd25';
  };

  const [currentSubdomain, setCurrentSubdomain] = useState<string>(getInitialSubdomain());

  const applyThemeVariables = (t: Tenant) => {
    const config = t.themeConfig || PRESET_OPTIONS[0].themeConfig;
    const root = document.documentElement;

    root.style.setProperty('--color-primary', config.primaryColor || '#059669');
    root.style.setProperty('--color-secondary', config.secondaryColor || '#047857');
    root.style.setProperty('--color-accent', config.accentColor || '#D97706');
    root.style.setProperty('--font-heading', config.fontHeading || 'Plus Jakarta Sans, sans-serif');
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
        throw new Error(`Boutique [${subdomain}] non trouvée.`);
      }

      const data = await res.json();
      setTenant(data);
      applyThemeVariables(data);
    } catch (err: any) {
      setError(err.message || 'Impossible de charger la boutique.');
      // Visual fallback
      const matchedPreset = PRESET_OPTIONS.find(p => p.id === subdomain) || PRESET_OPTIONS[0];
      const fallbackTenant: Tenant = {
        id: matchedPreset.id,
        subdomain: matchedPreset.id,
        name: matchedPreset.name,
        tagline: matchedPreset.tagline,
        description: matchedPreset.description,
        themePreset: matchedPreset.id,
        themeConfig: matchedPreset.themeConfig,
        cmsConfig: matchedPreset.cmsConfig,
        heroImageUrl: matchedPreset.heroImageUrl,
        logoUrl: matchedPreset.logoUrl,
        acceptUnpaidOrders: true,
        slotDurationMinutes: 15,
        maxItemsPerSlot: 20
      };
      setTenant(fallbackTenant);
      applyThemeVariables(fallbackTenant);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant(currentSubdomain);
  }, [currentSubdomain]);

  const switchSubdomain = (newSub: string) => {
    localStorage.setItem('woxx_current_subdomain', newSub);
    setCurrentSubdomain(newSub);
  };

  const refetchTenant = async () => {
    await fetchTenant(currentSubdomain);
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        loading,
        error,
        currentSubdomain,
        colorMode,
        toggleColorMode,
        setTenant,
        refetchTenant,
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
