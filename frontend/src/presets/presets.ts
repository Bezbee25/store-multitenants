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

export const PRESET_OPTIONS: PresetMeta[] = [
  {
    id: 'burger',
    name: 'Smash Burger & Street Food',
    category: 'Restauration Rapide',
    tagline: 'Des smash burgers croustillants et fondants préparés à la minute.',
    description: 'Burgers gourmets, frites fraîches maison et sauces artisanales.',
    themeConfig: {
      primaryColor: '#EA580C',
      secondaryColor: '#B45309',
      accentColor: '#F59E0B',
      backgroundColor: '#0F172A',
      textColor: '#F8FAFC',
      fontHeading: 'Space Grotesk, sans-serif',
      fontBody: 'Inter, sans-serif',
      borderRadius: '1rem',
      heroOverlayOpacity: 0.65,
      badgeStyle: 'pill'
    },
    cmsConfig: {
      aboutTitle: 'Notre Passion du Vrai Smash Burger',
      aboutText: 'Viande locale maturée, buns briochés toastés au beurre fermier et sauces secrètes cuisinées chaque matin.',
      announcement: '🔥 -10% sur votre première commande en Click & Collect !'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'kebab',
    name: 'Gourmet Berliner Kebab',
    category: 'Restauration',
    tagline: 'L’authentique kebab berlinois haut de gamme façon chef.',
    description: 'Broche artisanale grillée, pain pita chaud au levain, légumes croquants et feta marinée.',
    themeConfig: {
      primaryColor: '#059669',
      secondaryColor: '#047857',
      accentColor: '#D97706',
      backgroundColor: '#18181B',
      textColor: '#FAFAFA',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      fontBody: 'Inter, sans-serif',
      borderRadius: '0.75rem',
      heroOverlayOpacity: 0.6,
      badgeStyle: 'pill'
    },
    cmsConfig: {
      aboutTitle: 'La Révolution du Kebab Artisanal',
      aboutText: 'Broche 100% veau et dinde marinée maison, légumes grillés au four, grenade fraîche et sauces signatures.',
      announcement: '🌯 Retrait express en Click & Collect sans faire la queue !'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'fleurs',
    name: 'Atelier Floral & Botanique',
    category: 'Fleuriste',
    tagline: 'La poésie florale au fil des saisons, composée avec passion.',
    description: 'Bouquets de fleurs fraîches de saison, compositions florales séchées et plantes rares.',
    themeConfig: {
      primaryColor: '#84CC16',
      secondaryColor: '#4D7C0F',
      accentColor: '#F472B6',
      backgroundColor: '#FAFAF9',
      textColor: '#1C1917',
      fontHeading: 'Playfair Display, serif',
      fontBody: 'Plus Jakarta Sans, sans-serif',
      borderRadius: '1.25rem',
      heroOverlayOpacity: 0.35,
      badgeStyle: 'soft'
    },
    cmsConfig: {
      aboutTitle: 'L’Artisanat Végétal Éco-responsable',
      aboutText: 'Fleurs locales cultivées en France, emballages biodégradables et créations sur-mesure pour tous les moments précieux.',
      announcement: '🌸 Réservez votre bouquet en Click & Collect pour un retrait en 30 min.'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'bijoux',
    name: 'Joaillerie & Bijoux Précieux',
    category: 'Bijouterie',
    tagline: 'Des créations intemporelles forgées avec finesse et délicatesse.',
    description: 'Bijoux haute fantaisie, or 18k, argent massif et pierres fines naturelles.',
    themeConfig: {
      primaryColor: '#D97706',
      secondaryColor: '#B45309',
      accentColor: '#E11D48',
      backgroundColor: '#090D16',
      textColor: '#F8FAFC',
      fontHeading: 'Cinzel, serif',
      fontBody: 'Inter, sans-serif',
      borderRadius: '0.5rem',
      heroOverlayOpacity: 0.55,
      badgeStyle: 'square'
    },
    cmsConfig: {
      aboutTitle: 'L’Excellence Joaillière',
      aboutText: 'Chaque bijou raconte une histoire. Pierres sourcées de manière éthique et métaux précieux certifiés.',
      announcement: '✨ Click & Collect discret en boutique avec présentation personnalisée.'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'boulangerie',
    name: 'Boulangerie & Pâtisserie',
    category: 'Boulangerie',
    tagline: 'Le bon goût du pain chaud croustillant et des douceurs faites maison.',
    description: 'Pains au levain naturel, viennoiseries pur beurre et pâtisseries fines.',
    themeConfig: {
      primaryColor: '#D97706',
      secondaryColor: '#92400E',
      accentColor: '#F59E0B',
      backgroundColor: '#1C1917',
      textColor: '#FAF7F2',
      fontHeading: 'Playfair Display, serif',
      fontBody: 'Plus Jakarta Sans, sans-serif',
      borderRadius: '0.875rem',
      heroOverlayOpacity: 0.6,
      badgeStyle: 'pill'
    },
    cmsConfig: {
      aboutTitle: 'La Tradition du Vrai Levain',
      aboutText: 'Farines bio locales, fermentation lente de 24h et cuisson sur sole de pierre.',
      announcement: '🥐 Réservez vos viennoiseries chaudes pour le matin !'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'epicerie',
    name: 'Épicerie Fine & Cave',
    category: 'Gastronomie & Vin',
    tagline: 'Une sélection minutieuse des meilleurs terroirs et producteurs.',
    description: 'Vins d’auteurs, huiles d’olive d’exception et terrines artisanales.',
    themeConfig: {
      primaryColor: '#991B1B',
      secondaryColor: '#7F1D1D',
      accentColor: '#D97706',
      backgroundColor: '#0C0A09',
      textColor: '#F5F5F4',
      fontHeading: 'Cinzel, serif',
      fontBody: 'Inter, sans-serif',
      borderRadius: '0.5rem',
      heroOverlayOpacity: 0.65,
      badgeStyle: 'square'
    },
    cmsConfig: {
      aboutTitle: 'Les Trésors du Terroir',
      aboutText: 'Sourcing direct chez les vignerons et artisans indépendants.',
      announcement: '🍷 Coffrets dégustation et paniers gourmands en Click & Collect.'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'autre',
    name: 'Autre / Sur-Mesure',
    category: 'Commerce Généraliste',
    tagline: 'Votre boutique personnalisée en ligne avec retrait rapide.',
    description: 'Modèle polyvalent et moderne conçu pour s’adapter à n’importe quelle boutique ou atelier.',
    themeConfig: {
      primaryColor: '#6366F1',
      secondaryColor: '#4F46E5',
      accentColor: '#EC4899',
      backgroundColor: '#0F172A',
      textColor: '#F8FAFC',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      fontBody: 'Inter, sans-serif',
      borderRadius: '1rem',
      heroOverlayOpacity: 0.6,
      badgeStyle: 'pill'
    },
    cmsConfig: {
      aboutTitle: 'Notre Savoir-Faire & Nos Produits',
      aboutText: 'Découvrez notre catalogue exclusif. Commandez en toute simplicité en ligne et venez récupérer vos articles.',
      announcement: '✨ Bienvenue sur notre boutique en ligne Click & Collect !'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=200&q=80'
  }
];
