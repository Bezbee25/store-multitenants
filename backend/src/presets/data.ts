export interface ThemePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  tagline: string;
  themeConfig: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontHeading: string;
    fontBody: string;
    borderRadius: string;
    heroOverlayOpacity: number;
    badgeStyle: 'pill' | 'square' | 'soft';
  };
  cmsConfig: {
    aboutTitle: string;
    aboutText: string;
    features: Array<{ icon: string; title: string; desc: string }>;
    announcement: string;
  };
  heroImageUrl: string;
  logoUrl: string;
  categories: Array<{
    name: string;
    slug: string;
    orderIndex: number;
    products: Array<{
      name: string;
      description: string;
      priceCents: number;
      imageUrl: string;
      stockQuantity: number;
      preparationTimeMinutes: number;
      options?: Array<{
        name: string;
        type: 'select' | 'checkbox';
        required: boolean;
        choices: Array<{ label: string; priceCents?: number }>;
      }>;
    }>;
  }>;
}

export const PRESETS: Record<string, ThemePreset> = {
  burger: {
    id: 'burger',
    name: 'Smash Burger & Street Food',
    category: 'Restauration Rapide',
    description: 'Burgers gourmets, frites maison croustillantes et sauces artisanales.',
    tagline: 'Des smash burgers croustillants et fondants préparés à la minute.',
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
      features: [
        { icon: 'Flame', title: '100% Frais', desc: 'Viande smashée sur plaque brûlante' },
        { icon: 'Clock', title: 'Click & Collect Express', desc: 'Prêt en 15 minutes chrono' },
        { icon: 'ShieldCheck', title: 'Produits Locaux', desc: 'Fromages AOP et buns d’artisan' }
      ],
      announcement: '🔥 -10% sur votre première commande en Click & Collect !'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80',
    categories: [
      {
        name: 'Smash Burgers',
        slug: 'burgers',
        orderIndex: 1,
        products: [
          {
            name: 'Double Bacon Cheese Smash',
            description: 'Deux steaks smashés croustillants, double cheddar affiné, bacon fumé croustillant, sauce secrète maison.',
            priceCents: 1390,
            imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
            stockQuantity: 50,
            preparationTimeMinutes: 12
          }
        ]
      }
    ]
  },

  kebab: {
    id: 'kebab',
    name: 'Gourmet Berliner Kebab',
    category: 'Restauration',
    description: 'Broche artisanale grillée, pain pita chaud au levain, légumes croquants et feta marinée.',
    tagline: 'L’authentique kebab berlinois haut de gamme façon chef.',
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
      features: [
        { icon: 'Sparkles', title: 'Pain Maison', desc: 'Pétrit et cuit sur place toute la journée' },
        { icon: 'Leaf', title: 'Légumes Bio', desc: 'Courgettes rôties, carottes et feta' }
      ],
      announcement: '🌯 Retrait express en Click & Collect sans faire la queue !'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=200&q=80',
    categories: [
      {
        name: 'Nos Sandwichs & Pitas',
        slug: 'pitas',
        orderIndex: 1,
        products: [
          {
            name: 'Berliner Gemüse Kebab Signature',
            description: 'Pain pita sésame croustillant, viande marinée grillée, légumes rôtis au thym, feta grecque AOP.',
            priceCents: 1050,
            imageUrl: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80',
            stockQuantity: 60,
            preparationTimeMinutes: 10
          }
        ]
      }
    ]
  },

  fleurs: {
    id: 'fleurs',
    name: 'Atelier Floral & Botanique',
    category: 'Fleuriste',
    description: 'Bouquets de fleurs fraîches de saison, compositions florales séchées et plantes rares.',
    tagline: 'La poésie florale au fil des saisons, composée avec passion.',
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
      aboutText: 'Fleurs locales cultivées en France, emballages biodégradables et créations sur-mesure.',
      features: [
        { icon: 'Flower', title: 'Fleurs Françaises', desc: 'Arrivage direct producteurs' },
        { icon: 'HeartHandshake', title: 'Créations Uniques', desc: 'Arrangé à la main' }
      ],
      announcement: '🌸 Réservez votre bouquet en Click & Collect pour un retrait en 30 min.'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=200&q=80',
    categories: [
      {
        name: 'Bouquets Frais',
        slug: 'bouquets-frais',
        orderIndex: 1,
        products: [
          {
            name: 'Bouquet Champêtre "Songe d\'Été"',
            description: 'Pivoines rose poudré, eucalyptus odorant, renoncules et fleurs de camomille délicates.',
            priceCents: 3900,
            imageUrl: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80',
            stockQuantity: 20,
            preparationTimeMinutes: 20
          }
        ]
      }
    ]
  },

  bijoux: {
    id: 'bijoux',
    name: 'Joaillerie & Bijoux Précieux',
    category: 'Bijouterie',
    description: 'Bijoux haute fantaisie, or 18k, argent massif et pierres fines naturelles.',
    tagline: 'Des créations intemporelles forgées avec finesse et délicatesse.',
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
      features: [
        { icon: 'Gem', title: 'Pierres Naturelles', desc: 'Saphirs, émeraudes et diamants certifiés' }
      ],
      announcement: '✨ Click & Collect discret en boutique avec présentation personnalisée.'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80',
    categories: [
      {
        name: 'Bagues & Solitaires',
        slug: 'bagues',
        orderIndex: 1,
        products: [
          {
            name: 'Bague Étoile du Nord Or 18k',
            description: 'Anneau en or jaune 18 carats serti d’un saphir bleu ciel taille brillant et pavage diamants.',
            priceCents: 49000,
            imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
            stockQuantity: 5,
            preparationTimeMinutes: 30
          }
        ]
      }
    ]
  },

  boulangerie: {
    id: 'boulangerie',
    name: 'Boulangerie & Pâtisserie Artisanale',
    category: 'Boulangerie',
    description: 'Pains au levain naturel, viennoiseries pur beurre et pâtisseries fines de saison.',
    tagline: 'Le bon goût du pain chaud croustillant et des douceurs faites maison.',
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
      aboutText: 'Farines bio locales, fermentation lente de 24 heures et cuisson sur sole de pierre chaque matin dès 5h.',
      features: [
        { icon: 'Wheat', title: 'Farines Bio', desc: 'Moulues sur pierre par nos meuniers partenaires' },
        { icon: 'Flame', title: 'Fournil Ouvert', desc: 'Cuissons régulières toute la journée' }
      ],
      announcement: '🥐 Réservez vos baguettes et viennoiseries chaudes pour le petit-déjeuner !'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=200&q=80',
    categories: [
      {
        name: 'Pains & Baguettes',
        slug: 'pains',
        orderIndex: 1,
        products: [
          {
            name: 'Baguette Traditionnelle au Levain',
            description: 'Croûte dorée très croustillante, mie alvéolée et douce acidité de notre levain chef.',
            priceCents: 140,
            imageUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
            stockQuantity: 120,
            preparationTimeMinutes: 5
          }
        ]
      }
    ]
  },

  epicerie: {
    id: 'epicerie',
    name: 'Épicerie Fine & Cave à Vin',
    category: 'Gastronomie',
    description: 'Vins d’auteurs, huiles d’olive d’exception, fromages affinés et terrines artisanales.',
    tagline: 'Une sélection minutieuse des meilleurs terroirs et producteurs indépendants.',
    themeConfig: {
      primaryColor: '#991B1B', // Rouge vin profond
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
      aboutText: 'Nous parcourons les vignobles et fermes artisanales pour vous rapporter des pépites gustatives authentiques.',
      features: [
        { icon: 'Wine', title: 'Vins Vivants', desc: 'Vins bio, biodynamiques et naturels' },
        { icon: 'Award', title: 'AOP & Terroirs', desc: 'Sourcing direct sans intermédiaire' }
      ],
      announcement: '🍷 Coffrets dégustation et paniers gourmands prêts au retrait Click & Collect.'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=200&q=80',
    categories: [
      {
        name: 'Sélection Cave & Terroir',
        slug: 'vins-terroir',
        orderIndex: 1,
        products: [
          {
            name: 'Coffret Découverte 3 Bouteilles Bio',
            description: 'Assortiment de nos trois coups de cœur du moment accompagnés de leurs fiches de dégustation.',
            priceCents: 4500,
            imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
            stockQuantity: 15,
            preparationTimeMinutes: 15
          }
        ]
      }
    ]
  },

  autre: {
    id: 'autre',
    name: 'Autre Commerce / Sur-Mesure',
    category: 'Généraliste & Artisanat',
    description: 'Modèle polyvalent et moderne conçu pour s’adapter à n’importe quelle boutique, service ou atelier.',
    tagline: 'Votre boutique personnalisée en ligne avec retrait rapide en Click & Collect.',
    themeConfig: {
      primaryColor: '#6366F1', // Indigo moderne et élégant
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
      aboutText: 'Découvrez notre catalogue exclusif. Commandez en toute simplicité en ligne et venez récupérer vos articles au magasin.',
      features: [
        { icon: 'Sparkles', title: 'Produits Sélectionnés', desc: 'Qualité supérieure et service personnalisé' },
        { icon: 'Clock', title: 'Click & Collect', desc: 'Retrait rapide à l’heure de votre choix' },
        { icon: 'ShieldCheck', title: 'Paiement Sécurisé', desc: 'Règlement en ligne ou sur place' }
      ],
      announcement: '✨ Bienvenue sur notre boutique en ligne Click & Collect !'
    },
    heroImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=200&q=80',
    categories: [
      {
        name: 'Nos Créations & Produits',
        slug: 'produits',
        orderIndex: 1,
        products: [
          {
            name: 'Article Signature Personnalisé',
            description: 'Produit phare de notre collection artisanale, fabriqué sur-mesure selon vos exigences.',
            priceCents: 2500,
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
            stockQuantity: 30,
            preparationTimeMinutes: 15
          }
        ]
      }
    ]
  }
};
