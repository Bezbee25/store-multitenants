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
    category: 'Restauration',
    description: 'Burgers gourmets, frites maison croustillantes et sauces artisanales.',
    tagline: 'Des smash burgers croustillants et fondants préparés à la minute.',
    themeConfig: {
      primaryColor: '#EA580C', // Orange vif
      secondaryColor: '#B45309',
      accentColor: '#F59E0B',
      backgroundColor: '#0F172A', // Slate 900 sombre moderne
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
            preparationTimeMinutes: 12,
            options: [
              {
                name: 'Cuisson',
                type: 'select',
                required: true,
                choices: [{ label: 'Smashé bien croustillant (recommandé)' }, { label: 'À point' }]
              },
              {
                name: 'Suppléments',
                type: 'checkbox',
                required: false,
                choices: [{ label: 'Extra Cheddar', priceCents: 150 }, { label: 'Extra Bacon', priceCents: 200 }, { label: 'Jalapeños marinés', priceCents: 100 }]
              }
            ]
          },
          {
            name: 'Truffle & Crispy Onion Smash',
            description: 'Steak smashé Black Angus, crème de truffe noire d\'été, gouda vieux et oignons frits croustillants.',
            priceCents: 1550,
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
            stockQuantity: 40,
            preparationTimeMinutes: 15
          }
        ]
      },
      {
        name: 'Sides & Accompagnements',
        slug: 'sides',
        orderIndex: 2,
        products: [
          {
            name: 'Frites Maison & Sauce Cheddar Fondue',
            description: 'Pommes de terre fraîches coupées à la main, double friture à la belge.',
            priceCents: 490,
            imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
            stockQuantity: 100,
            preparationTimeMinutes: 8
          },
          {
            name: 'Loaded Pulled Pork Fries',
            description: 'Frites maison nappées d\'effiloché de porc confit 12h, sauce BBQ fumée et oignons cébette.',
            priceCents: 790,
            imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80',
            stockQuantity: 30,
            preparationTimeMinutes: 10
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
      primaryColor: '#059669', // Émeraude élégant
      secondaryColor: '#047857',
      accentColor: '#D97706',
      backgroundColor: '#18181B', // Zinc 900
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
        { icon: 'Leaf', title: 'Légumes Bio', desc: 'Courgettes rôties, carottes, chou rouge et grenade' },
        { icon: 'Flame', title: 'Broche Tradition', desc: 'Viande française sélectionnée, marinée 24h' }
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
            description: 'Pain pita sésame croustillant, viande marinée grillée, légumes rôtis au thym, feta grecque AOP, grenade et sauce ail/fines herbes.',
            priceCents: 1050,
            imageUrl: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80',
            stockQuantity: 60,
            preparationTimeMinutes: 10,
            options: [
              {
                name: 'Sauce principale',
                type: 'select',
                required: true,
                choices: [{ label: 'Blanche Fines Herbes' }, { label: 'Samouraï Maison Epicée' }, { label: 'Harissa Ail' }]
              },
              {
                name: 'Format',
                type: 'select',
                required: true,
                choices: [{ label: 'Pain Pita Artisanal' }, { label: 'Galette Dürüm Roulée' }, { label: 'Assiette Bowl Gourmande (+2.50€)', priceCents: 250 }]
              }
            ]
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
      primaryColor: '#84CC16', // Vert sauge naturel
      secondaryColor: '#4D7C0F',
      accentColor: '#F472B6',
      backgroundColor: '#FAFAF9', // Stone très clair, doux et lumineux
      textColor: '#1C1917',
      fontHeading: 'Playfair Display, serif',
      fontBody: 'Plus Jakarta Sans, sans-serif',
      borderRadius: '1.25rem',
      heroOverlayOpacity: 0.4,
      badgeStyle: 'soft'
    },
    cmsConfig: {
      aboutTitle: 'L’Artisanat Végétal Éco-responsable',
      aboutText: 'Fleurs locales cultivées en France, emballages biodégradables et créations sur-mesure pour tous les moments précieux de votre vie.',
      features: [
        { icon: 'Flower', title: 'Fleurs Françaises', desc: 'Arrivage direct producteurs du Var et de Bretagne' },
        { icon: 'HeartHandshake', title: 'Créations Uniques', desc: 'Chaque bouquet est arrangé à la main' },
        { icon: 'Gift', title: 'Cadeaux & Cartes', desc: 'Message calligraphié offert sur demande' }
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
            preparationTimeMinutes: 20,
            options: [
              {
                name: 'Taille du bouquet',
                type: 'select',
                required: true,
                choices: [{ label: 'Moyen (Standard)' }, { label: 'Généreux (+15€)', priceCents: 1500 }, { label: 'Grand Prestige (+30€)', priceCents: 3000 }]
              }
            ]
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
      primaryColor: '#D97706', // Or précieux
      secondaryColor: '#B45309',
      accentColor: '#E11D48',
      backgroundColor: '#090D16', // Nuit profonde luxe
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
        { icon: 'Gem', title: 'Pierres Naturelles', desc: 'Saphirs, émeraudes et diamants certifiés' },
        { icon: 'Award', title: 'Garantie 2 ans', desc: 'Certificat d’authenticité inclus' },
        { icon: 'PackageCheck', title: 'Écrin Luxueux', desc: 'Emballage cadeau prêt à offrir' }
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
  }
};
