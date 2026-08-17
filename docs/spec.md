# Spec — Woxx Store Multitenants

## Métadonnées

- **Slug** : `woxx-store-multitenant`
- **Type** : multitenant
- **Niveau** : N3
- **Justification niveau** : « kanban de gestion des commandes avec les status ce qui est payé, ce qui sera payé sur place, l'heure à laquelle il faudra que le produit soit prêt, définir le nombre de produit possible maxi par creneau, les horaire d'ouvertures, s'il faut accepter ou non les reservation sans paiement... gestion des produits, stock, description photo... admin global dashboard... routage sous-domaine »
- **woxx-pay** : oui
- **Date spec** : 2026-08-17

---

## 1. Objectif du projet

Fournir une plateforme e-commerce multi-tenant moderne, élégante et prête à l'emploi permettant à des commerçants de divers secteurs (restauration rapide : burger/kebab, fleuristes, bijouteries, boutiques artisanales, etc.) de disposer immédiatement :
1. D'un **site vitrine moderne et personnalisable** avec pré-configurations thématiques (presets selon l'activité).
2. D'un **module Click & Collect** complet avec gestion des créneaux horaires, quotas de commandes/produits par tranche, paiement en ligne sécurisé (via WoxxPay / Stripe) ou paiement sur place.
3. D'un **espace Gérant / Merchant** (CMS, personnalisation visuelle du thème, gestion des stocks, fiches produits avec photos, kanban interactif de suivi des commandes en temps réel).
4. D'un **espace Client** avec authentification simple (Google OAuth, Email/Mot de passe, téléphone de contact).
5. D'un **espace Super-Admin Global** (vision consolidée de tous les tenants, monitoring des configurations, gestion du serveur SMTP global partagé).

---

## 2. Stack technique

### Frontend
- **Framework** : React 18 + TypeScript + Vite (`base: './'`)
- **Routage** : React Router v7 (`createHashRouter` obligatoire)
- **Styling & UI** : Tailwind CSS + Framer Motion + Lucide React
- **Gestion d'état & Fetching** : TanStack Query (React Query) + Zustand
- **Drag & Drop** : `@dnd-kit/core` / `@hello-pangea/dnd` pour le Kanban des commandes

### Backend (N3)
- **Runtime & API** : Fastify (Node.js 22 LTS) + TypeScript
- **ORM & Base de données** : Prisma ORM + PostgreSQL (isolation stricte par `tenant_id`)
- **Sécurité & Auth** : `@fastify/jwt`, `@fastify/helmet`, `@fastify/cors`, argon2 / bcrypt, Zod pour la validation stricte des entrées/sorties
- **Mailing** : Nodemailer avec pool SMTP global géré par l'admin
- **Paiements** : Client API WoxxPay (JWT M2M, vérification des signatures webhooks Ed25519)

### Reverse Proxy & Routage
- **Nginx** : Routage multitenant par sous-domaine / host (`*.woxxapp.de` ou domaines personnalisés). Détection du tenant et injection des headers `X-Tenant-Slug` / `X-Tenant-ID`. Erreur 404 propre si le sous-domaine n'est pas reconnu.

---

## 3. Structure des pages / vues

### Espace Public / Vitrine & Magasin
- `#/` — **Accueil Vitrine** : Présentation du commerce, Hero immersif, histoire, horaires d'ouverture, coordonnées et accès, mise en avant des produits phares selon le preset thématique choisi.
- `#/catalog` — **Catalogue & Magasin** : Navigation par catégories, recherche textuelle, filtres, fiches produits détaillées (photos, options, ingrédients/matériaux, stock disponible).
- `#/cart` — **Panier & Click & Collect** : Récapitulatif, sélection du créneau de retrait (avec vérification en temps réel de la jauge/quota maxi par créneau), choix du mode de règlement (en ligne via WoxxPay ou sur place si autorisé par le gérant).
- `#/order/:orderNumber` — **Suivi de Commande** : Suivi en direct du statut (Validée, En préparation, Prête, Retirée, Annulée) et QR Code / code de retrait.

### Espace Client
- `#/auth/login` — **Connexion Client** : Connexion par Google OAuth ou Email/Mot de passe.
- `#/auth/register` — **Inscription Client** : Création de compte (Nom, Email, Téléphone pour notifications SMS/Email de commande).
- `#/account` — **Mon Compte** : Historique des commandes, coordonnées enregistrées, commandes en cours.

### Espace Gérant (Back-Office Commerçant)
- `#/manager/login` — **Connexion Gérant**
- `#/manager/kanban` — **Kanban des Commandes** : Vue colonnes temps réel (Nouvelles, En préparation, Prêtes, Clôturées/Livrées), alertes d'heure cible de retrait, distinction visuelle "Payé en ligne" vs "À payer sur place", action en 1 clic pour changer le statut ou notifier le client.
- `#/manager/products` — **Gestion du Catalogue & Stocks** : CRUD produits, photos, variantes/options, activation/désactivation, seuils d'alerte de stock.
- `#/manager/slots` — **Horaires & Créneaux Click & Collect** : Définition des plages d'ouverture, durée des créneaux (ex: 15 min), quota max d'articles/commandes par créneau, option « Accepter les réservations sans paiement en ligne » (On/Off).
- `#/manager/cms` — **Personnalisation & Thème (CMS)** : Choix du preset d'activité (Burger/Street Food, Kebab, Fleuriste, Bijouterie, Mode, Épicerie fine, etc.), personnalisation des couleurs, typographies, images de fond, textes de présentation, coordonnées.
- `#/manager/payment-doc` — **Guide & Intégration WoxxPay / Stripe** : Page d'aide pas-à-pas expliquant comment créer son compte Stripe, obtenir ses identifiants et configurer WoxxPay pour activer les paiements par carte bancaire.

### Espace Super-Admin Global (Plateforme)
- `#/admin/login` — **Connexion Super-Admin**
- `#/admin/dashboard` — **Tableau de Bord Global** : Vue d'ensemble de tous les tenants créés, statistiques globales (nombre de commandes, volume d'affaires, statut actif/inactif).
- `#/admin/tenants` — **Gestion des Tenants** : Création simplifiée de nouveaux tenants (provisioning du sous-domaine sans config lourde au départ), modification des quotas, suspension/activation, accès direct à la configuration de chaque tenant.
- `#/admin/smtp` — **Configuration SMTP Globale** : Paramétrage du serveur SMTP unique (Host, Port, User, Password, From Email) utilisé par défaut pour l'ensemble des notifications transactionnelles de tous les tenants.

---

## 4. Modèle de Données & Architecture Multitenant (N3)

### Isolation des données
Toutes les entités propres aux boutiques possèdent une contrainte stricte `tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE`.

### Schéma Prisma / PostgreSQL prévisionnel :
1. **Tenant** : `id`, `slug` (sous-domaine), `name`, `theme_preset` (kebab, burger, fleurs, bijoux...), `theme_config` (jsonb), `cms_content` (jsonb), `is_active`, `accept_unpaid_orders` (boolean), `slot_duration_minutes`, `max_items_per_slot`, `opening_hours` (jsonb), `woxxpay_account_id`, `created_at`
2. **User** : `id`, `tenant_id` (nullable pour super-admin), `email`, `password_hash`, `google_id`, `full_name`, `phone`, `role` (CUSTOMER, MANAGER, SUPERADMIN)
3. **Category** : `id`, `tenant_id`, `name`, `slug`, `order_index`
4. **Product** : `id`, `tenant_id`, `category_id`, `name`, `description`, `price_cents`, `image_url`, `stock_quantity`, `is_available`, `options` (jsonb)
5. **Order** : `id`, `tenant_id`, `user_id` (optional/guest), `order_number`, `customer_name`, `customer_email`, `customer_phone`, `total_cents`, `payment_method` (ONLINE_WOXXPAY, ON_SITE), `payment_status` (PENDING, PAID, FAILED, REFUNDED), `order_status` (PENDING, IN_PREPARATION, READY, COMPLETED, CANCELLED), `pickup_slot_start`, `pickup_slot_end`, `woxxpay_payment_id`, `notes`, `created_at`
6. **OrderItem** : `id`, `tenant_id`, `order_id`, `product_id`, `product_name`, `unit_price_cents`, `quantity`, `selected_options` (jsonb)
7. **GlobalConfig** : `id`, `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `smtp_from_name`, `smtp_from_email`, `smtp_secure`

---

## 5. Composants Clés à Créer

- `<TenantLayout />` : Injecte le thème actif (CSS variables / classes dynamiques) selon le preset du tenant.
- `<PresetSelector />` : Galerie de thèmes prédéfinis pour pré-remplir instantanément le style et des exemples de produits.
- `<ClickAndCollectPicker />` : Sélecteur visuel de date et créneau de retrait avec jauge de disponibilité temps réel.
- `<OrderKanbanBoard />` : Tableau Kanban drag-and-drop pour le gérant avec minuteur de préparation et filtres de paiement.
- `<ProductCard />` & `<ProductModal />` : Affichage moderne avec options et gestion du panier.
- `<ManagerThemeEditor />` : Interface intuitive de personnalisation visuelle (images, logos, couleurs).
- `<WoxxPaySetupGuide />` : Documentation interactive claire avec checklist d'activation Stripe / WoxxPay.
- `<GlobalAdminDashboard />` : Table de bord d'administration plateforme avec métriques et gestion SMTP.

---

## 6. Intégrations Externes

| Besoin | Service | Env var / Config |
|---|---|---|
| Paiement sécurisé CB | **WoxxPay** (Stripe Connect) | `WOXX_PAY_API_URL`, `WOXX_PAY_M2M_CLIENT_ID`, `WOXX_PAY_M2M_CLIENT_SECRET`, `WOXX_PAY_PUBLIC_KEY` |
| Notifications Email | **SMTP Global** (Nodemailer) | Configuré dynamiquement via l'admin global en DB |
| Authentification Sociale | **Google OAuth2** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Stockage Images | Stockage local volumé Docker ou S3/Cloudinary | `UPLOAD_DIR` / `MEDIA_STORAGE_DRIVER` |

---

## 7. Variables d'Environnement

```env
# Nom de l'application WoxxApp
SITE_NAME=woxx-store-multitenant

# Environnement
NODE_ENV=production
PORT=3000

# Base de données PostgreSQL
DATABASE_URL=postgresql://woxxapp:password@woxxapp-db:5432/woxx_store_multitenant?schema=public

# Sécurité & JWT
JWT_SECRET=super-secret-jwt-key-change-me

# Google OAuth (optionnel / activable par tenant ou global)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Woxx-Pay (Paiement)
WOXX_PAY_API_URL=http://woxx-pay-api:8000
WOXX_PAY_M2M_CLIENT_ID=
WOXX_PAY_M2M_CLIENT_SECRET=
WOXX_PAY_PUBLIC_KEY=

# Domaine racine pour résolution sous-domaine
BASE_DOMAIN=woxxapp.de
```

---

## 8. Structure de Fichiers Cible

```
woxx-store-multitenant/
├── frontend/
│   ├── public/
│   │   └── presets/           # Assets / images par défaut des différents métiers
│   ├── src/
│   │   ├── main.tsx
│   │   ├── routes.tsx         # createHashRouter
│   │   ├── pages/
│   │   │   ├── storefront/    # Accueil vitrine, catalogue, panier, checkout
│   │   │   ├── auth/          # Login, Register, Google Callback
│   │   │   ├── manager/       # Kanban, CMS, Produits, Créneaux, Doc WoxxPay
│   │   │   └── admin/         # Super-Admin (tenants, SMTP, monitoring)
│   │   ├── components/
│   │   ├── presets/           # Configurations prêtes à l'emploi (burger, fleuriste, bijou...)
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── vite.config.ts         # base: './'
│   └── Dockerfile
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/            # auth, public, manager, admin, webhooks
│   │   ├── services/          # woxxpay, mailer, slots, order-engine
│   │   ├── middlewares/       # tenant-resolver, auth-guard
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts            # Seed avec super-admin + presets de démonstration
│   ├── Dockerfile
│   └── tsconfig.json
├── nginx/
│   └── nginx.conf             # Routage sous-domaine + proxy vers frontend & Fastify /api
├── docs/
│   └── spec.md
├── Makefile                   # make check, make build, make test
└── docker-compose.yml
```

---

## 9. Flux de Paiement Woxx-Pay

1. Lors du checkout Click & Collect, si le paiement en ligne est sélectionné :
2. Le frontend appelle le backend `POST /api/orders/checkout`.
3. Le backend crée la commande en statut `PENDING` et appelle `POST /v1/checkouts` sur **woxx-pay** avec le token JWT M2M et le `account_id` Stripe du tenant.
4. Woxx-pay renvoie `checkout_url` ; le frontend y redirige le client.
5. Après validation du paiement, Woxx-pay envoie un webhook signé Ed25519 sur `POST /api/webhooks/woxx-pay`.
6. Le backend vérifie la signature, passe la commande en `PAID` / `IN_PREPARATION`, incrémente la jauge du créneau et déclenche un email de confirmation via le SMTP global.

---

## 10. Critères d'Acceptation

- [ ] `make check` passe sans erreur (lint, types TS, build).
- [ ] Résolution propre du tenant par sous-domaine avec page 404 élégante si inconnu.
- [ ] Présélections thématiques activables en 1 clic (kebab, burger, fleurs, bijoux...).
- [ ] Module Click & Collect fluide avec calcul strict des quotas par créneau horaire.
- [ ] Possibilité de choisir paiement en ligne (WoxxPay) ou paiement sur place (si activé par le gérant).
- [ ] Kanban gérant interactif en temps réel avec minuterie et codes couleur de statut.
- [ ] Espace Super-Admin opérationnel avec configuration du serveur SMTP global et vue sur tous les tenants.
- [ ] Documentation claire et didactique intégrée dans l'espace gérant pour la configuration WoxxPay / Stripe.
- [ ] Respect strict des règles de sécurité OWASP (zéro secret en dur, requêtes Prisma paramétrées, validation Zod, CSP Nginx, hash de mot de passe argon2/bcrypt).

---

## 11. Éléments Hors Périmètre

- Intégration directe du SDK Stripe dans le frontend (interdit par WoxxApp : tout passe exclusivement par WoxxPay).
- Application mobile native (l'application web est 100% PWA-ready et responsive mobile-first).
- Passerelles de livraison tierces (Deliveroo, UberEats) dans la v1.
