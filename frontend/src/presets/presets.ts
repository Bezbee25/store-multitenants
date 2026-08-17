import { TenantThemeConfig, TenantCmsConfig } from '../types';

export interface PresetMeta {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  themeConfig: TenantThemeConfig;
  cmsConfig: TenantCmsConfig;
  heroImageUrl: string;
  logoUrl: string;
}

// Les presets sont des TEMPLATES visuels de départ — aucun produit inclus.
// Le gérant démarre avec une boutique vide et personnalise tout lui-même.
export const PRESET_OPTIONS: PresetMeta[] = [
  {
    id: 'burger',
    name: 'Restaurant & Fast-food',
    category: 'Restauration Rapide',
    tagline: '',
    description: '',
    themeConfig: {
      primaryColor: '#EA580C',
      secondaryColor: '#B45309',
      accentColor: '#F59E0B',
      backgroundColor: '#FAFAF9',
      textColor: '#1C1917',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      fontBody: 'Inter, sans-serif',
      borderRadius: '0.75rem',
      heroOverlayOpacity: 0.5,
      badgeStyle: 'pill'
    },
    cmsConfig: {
      aboutTitle: '',
      aboutText: '',
      announcement: ''
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=80',
    logoUrl: ''
  },
  {
    id: 'kebab',
    name: 'Kebab & Snack',
    category: 'Restauration',
    tagline: '',
    description: '',
    themeConfig: {
      primaryColor: '#059669',
      secondaryColor: '#047857',
      accentColor: '#D97706',
      backgroundColor: '#FAFAF9',
      textColor: '#1C1917',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      fontBody: 'Inter, sans-serif',
      borderRadius: '0.75rem',
      heroOverlayOpacity: 0.5,
      badgeStyle: 'pill'
    },
    cmsConfig: {
      aboutTitle: '',
      aboutText: '',
      announcement: ''
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=1600&q=80',
    logoUrl: ''
  },
  {
    id: 'fleurs',
    name: 'Fleuriste & Botanique',
    category: 'Fleuriste',
    tagline: '',
    description: '',
    themeConfig: {
      primaryColor: '#65A30D',
      secondaryColor: '#4D7C0F',
      accentColor: '#EC4899',
      backgroundColor: '#FAFAF9',
      textColor: '#1C1917',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      fontBody: 'Inter, sans-serif',
      borderRadius: '1rem',
      heroOverlayOpacity: 0.35,
      badgeStyle: 'soft'
    },
    cmsConfig: {
      aboutTitle: '',
      aboutText: '',
      announcement: ''
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1600&q=80',
    logoUrl: ''
  },
  {
    id: 'bijoux',
    name: 'Bijouterie & Accessoires',
    category: 'Bijouterie',
    tagline: '',
    description: '',
    themeConfig: {
      primaryColor: '#B45309',
      secondaryColor: '#92400E',
      accentColor: '#D97706',
      backgroundColor: '#FAFAF9',
      textColor: '#1C1917',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      fontBody: 'Inter, sans-serif',
      borderRadius: '0.5rem',
      heroOverlayOpacity: 0.5,
      badgeStyle: 'square'
    },
    cmsConfig: {
      aboutTitle: '',
      aboutText: '',
      announcement: ''
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80',
    logoUrl: ''
  },
  {
    id: 'boulangerie',
    name: 'Boulangerie & Pâtisserie',
    category: 'Boulangerie',
    tagline: '',
    description: '',
    themeConfig: {
      primaryColor: '#D97706',
      secondaryColor: '#92400E',
      accentColor: '#F59E0B',
      backgroundColor: '#FAFAF9',
      textColor: '#1C1917',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      fontBody: 'Inter, sans-serif',
      borderRadius: '0.75rem',
      heroOverlayOpacity: 0.5,
      badgeStyle: 'pill'
    },
    cmsConfig: {
      aboutTitle: '',
      aboutText: '',
      announcement: ''
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80',
    logoUrl: ''
  },
  {
    id: 'epicerie',
    name: 'Épicerie & Cave à Vin',
    category: 'Gastronomie',
    tagline: '',
    description: '',
    themeConfig: {
      primaryColor: '#991B1B',
      secondaryColor: '#7F1D1D',
      accentColor: '#D97706',
      backgroundColor: '#FAFAF9',
      textColor: '#1C1917',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      fontBody: 'Inter, sans-serif',
      borderRadius: '0.5rem',
      heroOverlayOpacity: 0.5,
      badgeStyle: 'square'
    },
    cmsConfig: {
      aboutTitle: '',
      aboutText: '',
      announcement: ''
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1600&q=80',
    logoUrl: ''
  },
  {
    id: 'autre',
    name: 'Boutique Sur-Mesure',
    category: 'Commerce Généraliste',
    tagline: '',
    description: '',
    themeConfig: {
      primaryColor: '#EA580C',
      secondaryColor: '#C2410C',
      accentColor: '#F59E0B',
      backgroundColor: '#FAFAF9',
      textColor: '#1C1917',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      fontBody: 'Inter, sans-serif',
      borderRadius: '0.75rem',
      heroOverlayOpacity: 0.5,
      badgeStyle: 'pill'
    },
    cmsConfig: {
      aboutTitle: '',
      aboutText: '',
      announcement: ''
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    logoUrl: ''
  }
];
