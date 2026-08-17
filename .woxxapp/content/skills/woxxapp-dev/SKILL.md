---
name: woxxapp-dev
description: >
  Guide opérationnel complet pour développer une app WoxxApp, de la première ligne
  de code jusqu'à l'enregistrement dans le store. Couvre les règles d'environnement,
  le pattern repos, les ports, le multitenant, l'intégration woxx-pay, et la gate finale.
---

# woxxapp-dev — Guide de développement WoxxApp

## Quand utiliser ce skill

Quand `docs/plans/task.md` est prêt (généré par `woxxapp-plan`).
Ce skill guide le développeur **tâche par tâche** jusqu'à la livraison.

**Pré-requis** : `woxxapp-spec` ✅ + `woxxapp-plan` ✅ + les 2 repos Git initialisés.

---

## Section A — Règles d'environnement

### Dev = LOCAL, toujours

```
❌ Ne jamais coder sur le serveur de production
❌ Ne jamais faire de git push et tester directement sur le serveur
✅ Coder en local, tester en local, pusher les images sur ghcr.io, puis le serveur pull
```

### Workflow dev local → CI/CD → déploiement

```
DEV LOCAL                    GITHUB                        SERVEUR
─────────                    ──────                        ───────
npm run dev                  
   ↓ (tester)
make check                   
   ↓ (OK)
git push origin main   →→→   GitHub Actions déclenché
                              ↓ build image(s)
                              ↓ push ghcr.io/{org}/{app-name}-frontend:latest
                              ↓ push ghcr.io/{org}/{app-name}-backend:latest
                                                     ←←←  make update (docker pull + recreate)
```

**Le développeur ne build pas les images Docker manuellement.**
C'est GitHub Actions qui build et push sur `ghcr.io` à chaque `git push main`.
Le serveur fait ensuite `docker compose pull` + `docker compose up -d --force-recreate`.

```bash
# Cycle de développement complet

# 1. Dev local (Vite live reload)
cd {app-name}/frontend && npm run dev

# 2. Tester en local avec Docker avant de pousser
cd {app-name}
make check           # gate conformité proxy + sécurité
# Si make check passe → commit + push

# 3. Pousser → GitHub Actions prend le relais
git add -A && git commit -m "feat: ..."
git push origin main
# → GitHub Actions build les images et les push sur ghcr.io automatiquement

# 4. Déployer sur le serveur (depuis le repo -docker)
cd ../{app-name}-docker
make update          # docker compose pull + up -d --force-recreate
make logs            # vérifier que ça démarre bien
```

### Variables d'environnement

- **En dev local** : fichier `.env` à la racine du repo dev
- **En production** : fichier `.env` dans le repo `-docker` (jamais commité, `.gitignore`)
- **Jamais de secret en dur dans le code**
- **Vars front** : préfixe `VITE_` obligatoire (requis par Vite pour les exposer au navigateur)
- **Vars back** : sans préfixe, dans `process.env`

```bash
# .env local (dev)
SITE_NAME={app-name}
VITE_FORMSPREE_ID=test_id_local
VITE_PLAUSIBLE_DOMAIN=localhost

# [Si N3]
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/{app-name}_dev
JWT_SECRET=dev_secret_not_for_production
```

---

## Section B — Contraintes proxy WoxxApp (non négociables)

Ces règles sont vérifiées par `make check`. Une app qui ne les respecte pas ne charge pas en production.

### 1. `base: './'` dans vite.config.ts

```ts
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',          // ← OBLIGATOIRE — sans ça, les assets sont en 404 sous le proxy
  plugins: [react()],
})
```

**Pourquoi** : le proxy WoxxApp sert l'app à `https://store.woxxapp.de/{ctx}/{slug}/`.
Sans `base: './'`, Vite génère des chemins absolus `/assets/...` qui cassent sous le préfixe proxy.

### 2. `createHashRouter` (jamais `BrowserRouter`)

```ts
// frontend/src/main.tsx
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { routes } from './routes'

const router = createHashRouter(routes)

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
```

**Pourquoi** : le hash router lit `window.location.hash` (`#/produits`), indépendant du préfixe proxy.
Le browser router lirait `/my-context/my-app/produits` et ne saurait pas trouver la route.

### 3. Liens internes avec `<Link>` de React Router (jamais `href="/..."`)

```tsx
// ✅ Correct
import { Link } from 'react-router-dom'
<Link to="/produits">Voir les produits</Link>

// ❌ Interdit — sort du préfixe proxy
<a href="/produits">Voir les produits</a>

// ❌ Interdit — idem
<a href="/assets/logo.png">Logo</a>
```

### 4. Assets importés depuis le JS

```ts
// ✅ Correct — Vite génère le bon chemin relatif
import logo from './assets/logo.png'

// ❌ Interdit — chemin absolu cassé sous le proxy
<img src="/assets/logo.png" />
```

### 5. Pas de Service Worker applicatif

```ts
// ❌ Ne jamais faire ça dans l'app
navigator.serviceWorker.register('/sw.js')

// WoxxApp a son propre SW — les scopes se chevaucheraient
```

---

## Section C — Pattern Docker et ports

### Architecture des ports

```
Internet → woxxapp (proxy) → {PORT_FRONTEND} → container frontend
                                                      ↓ réseau Docker interne
                                               container backend (pas de port exposé)
                                                      ↓ réseau Docker interne
                                               container postgres (pas de port exposé)
```

**Règles** :
- **1 seul port** exposé sur l'hôte pour le frontend : woxxapp proxy ce port
- **Backend et DB** : aucun port exposé en production, accessible seulement sur le réseau Docker interne
- **En local dev uniquement** : on peut ajouter des ports temporaires pour déboguer

### docker-compose.yml du repo dev (pour tests locaux)

```yaml
# {app-name}/docker-compose.dev.yml — tests locaux uniquement
services:
  frontend:
    build: ./frontend
    container_name: {app-name}-frontend-dev
    ports:
      - "{PORT_FRONTEND}:80"   # ex: 3335:80
    environment:
      NODE_ENV: production

  # [Si N3]
  backend:
    build: ./backend
    container_name: {app-name}-backend-dev
    ports:
      - "{PORT_BACKEND}:3000"  # ex: 3336:3000 — pour tests locaux seulement
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/{app-name}_dev
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  # [Si N3]
  postgres:
    image: postgres:15-alpine
    container_name: {app-name}-postgres-dev
    ports:
      - "5432:5432"            # pour accès local (DBeaver, psql...) — pas en prod
    environment:
      POSTGRES_DB: {app-name}_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

volumes:
  postgres_dev_data:
```

### nginx.conf (frontend)

```nginx
# nginx/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/javascript image/svg+xml;

    # Cache long pour les assets hashés par Vite
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Pas de cache pour index.html
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Hash router : toute route inconnue → index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # [Si N3] Proxy vers le backend
    # location /api/ {
    #     proxy_pass http://{app-name}-api:3000/;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # }

    # Sécurité
    location ~ /\. { deny all; }
}
```

---

## Section D — App multitenant

### Qu'est-ce que le multitenant dans WoxxApp ?

Une app **multitenant** est une app du **catalogue WoxxApp** (sur étagère) :
- **1 seule instance Docker** tourne sur le serveur
- **N clients** différents l'utilisent, chacun avec ses propres données
- L'isolation se fait par `tenant_id` dans la base de données
- Le proxy woxxapp injecte automatiquement le header `X-Tenant-ID` sur chaque requête

### Pattern d'isolation — Base de données

```sql
-- Toutes les tables métier ont un tenant_id
CREATE TABLE produits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL,                    -- ← isolation obligatoire
  nom        TEXT NOT NULL,
  prix       DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index sur tenant_id pour les performances
CREATE INDEX idx_produits_tenant_id ON produits(tenant_id);
```

### Pattern middleware — Extraction du tenant

```ts
// backend/src/plugins/tenant.ts (Fastify)
import { FastifyPluginAsync } from 'fastify'

export const tenantPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', async (request, reply) => {
    // woxxapp injecte X-Tenant-ID sur chaque requête
    const tenantId = request.headers['x-tenant-id'] as string

    if (!tenantId) {
      reply.code(401).send({ error: 'X-Tenant-ID header manquant' })
      return
    }

    // Disponible dans tous les handlers via request.tenantId
    request.tenantId = tenantId
  })
}

// Déclaration TypeScript
declare module 'fastify' {
  interface FastifyRequest {
    tenantId: string
  }
}
```

### Pattern requête — Toujours filtrer par tenant_id

```ts
// backend/src/routes/produits.ts
fastify.get('/produits', async (request, reply) => {
  const produits = await prisma.produits.findMany({
    where: {
      tenant_id: request.tenantId,   // ← TOUJOURS filtrer par tenant
    },
  })
  return produits
})
```

### Enregistrement multitenant dans woxxapp-core

Pour une app multitenant, enregistrer dans `catalog_applications` (pas `context_applications`) :

```sql
-- La DB woxxapp-core
INSERT INTO catalog_applications (name, slug, description, internal_url, icon_url)
VALUES (
  '{Nom de l app}',
  '{app-slug}',
  '{Description pour le catalogue}',
  'http://{app-name}-site',        -- ← hostname Docker (container_name du frontend)
  'https://store.woxxapp.de/icons/{app-slug}.png'
);
```

Les clients activent ensuite l'app depuis leur interface WoxxApp — woxxapp crée automatiquement
l'entrée dans `context_applications` avec le `tenant_id` approprié.

---

## Section E — Intégration woxx-pay

### Principe de base

```
❌ Jamais de SDK Stripe dans l'app (stripe-node, @stripe/stripe-js...)
✅ Tout passe par woxx-pay — l'app appelle l'API interne woxx-pay
```

**woxx-pay** est un webservice interne qui abstrait Stripe : il gère les webhooks, la signature,
les remboursements, la facturation. L'app n'a besoin que de 3 opérations.

### Variables d'environnement requises

```bash
WOXX_PAY_API_URL=http://woxx-pay-api:8000     # URL interne (réseau Docker)
WOXX_PAY_M2M_CLIENT_ID=                        # ID client M2M (obtenu dans woxx-pay admin)
WOXX_PAY_M2M_CLIENT_SECRET=                    # Secret M2M
WOXX_PAY_PUBLIC_KEY=                           # Clé publique Ed25519 pour vérifier les callbacks
```

### Réseau Docker — accès à woxx-pay

woxx-pay est sur un réseau privé dédié. L'app backend doit y être connectée :

```yaml
# docker-compose.yml du repo -docker
services:
  backend:
    networks:
      - woxxapp-network
      - woxxpay_private_api        # ← réseau privé vers woxx-pay

networks:
  woxxapp-network:
    external: true
  woxxpay_private_api:
    external: true                 # créé par l'infra woxx-pay
```

### Opération 1 — Obtenir un token JWT M2M

```ts
// backend/src/lib/woxx-pay-client.ts
let cachedToken: { token: string; expiresAt: number } | null = null

async function getM2MToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.token
  }

  const response = await fetch(`${process.env.WOXX_PAY_API_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.WOXX_PAY_M2M_CLIENT_ID,
      client_secret: process.env.WOXX_PAY_M2M_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  })

  const { access_token, expires_in } = await response.json()
  cachedToken = { token: access_token, expiresAt: Date.now() + expires_in * 1000 }
  return access_token
}
```

### Opération 2 — Créer une session de checkout

```ts
// backend/src/routes/checkout.ts
fastify.post('/checkout', async (request, reply) => {
  const { line_items, success_url, cancel_url, customer } = request.body
  const token = await getM2MToken()

  const response = await fetch(`${process.env.WOXX_PAY_API_URL}/v1/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      line_items,           // [{ product_code: 'mon-produit', quantity: 1 }]
      success_url,          // URL de succès (retour sur l'app)
      cancel_url,           // URL d'annulation
      customer,             // { email, company_name, vat_number }
      external_customer_ref: request.tenantId, // [Si multitenant]
    }),
  })

  const { payment_id, checkout_url } = await response.json()

  // Stocker payment_id en DB pour le rapprocher avec le callback
  await prisma.paiements.create({
    data: { payment_id, tenant_id: request.tenantId, status: 'pending' }
  })

  // Retourner l'URL de redirection au frontend
  return { checkout_url }
})
```

**Frontend** — rediriger vers la page Stripe :

```tsx
const handleCheckout = async () => {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ line_items, success_url: '#/merci', cancel_url: '#/panier', customer }),
  })
  const { checkout_url } = await response.json()
  window.location.href = checkout_url   // redirection vers Stripe hébergé
}
```

### Opération 3 — Réceptionner le callback signé (webhook)

```ts
// backend/src/routes/webhooks.ts
import { createVerify } from 'crypto'

fastify.post('/webhooks/woxx-pay', {
  config: { rawBody: true },          // Fastify doit avoir le raw body pour la vérification
}, async (request, reply) => {
  const signature = request.headers['x-woxx-signature'] as string
  const eventTs   = request.headers['x-woxx-event-ts'] as string
  const eventId   = request.headers['x-woxx-event-id'] as string

  // 1. Vérifier que l'événement n'est pas trop ancien (protection replay)
  const eventAge = Date.now() - new Date(eventTs).getTime()
  if (eventAge > 5 * 60 * 1000) {
    return reply.code(400).send({ error: 'Événement expiré (> 5 min)' })
  }

  // 2. Vérifier la signature Ed25519
  const payload = `${request.rawBody}${eventTs}${eventId}`
  const verifier = createVerify('ed25519')
  verifier.update(payload)
  const isValid = verifier.verify(
    Buffer.from(process.env.WOXX_PAY_PUBLIC_KEY!, 'base64'),
    Buffer.from(signature, 'base64')
  )

  if (!isValid) {
    return reply.code(400).send({ error: 'Signature invalide' })
  }

  // 3. Traiter l'événement
  const event = request.body as WoxxPayEvent
  if (event.event_type === 'payment.captured') {
    await prisma.paiements.update({
      where: { payment_id: event.payload.payment_id },
      data: { status: 'paid', paid_at: new Date() },
    })
    // Activer les droits, envoyer email de confirmation...
  }

  return { received: true }
})
```

### Prompt prêt à l'emploi pour coder l'intégration woxx-pay

Colle ce prompt dans l'IA pour générer l'intégration complète :

```
Rôle : Développeur Backend Senior spécialisé paiements et sécurité.

Implémente l'intégration complète de woxx-pay dans l'app {app-name} (backend Fastify + TypeScript).

Contraintes absolues :
1. Aucun SDK Stripe — tout passe par l'API woxx-pay
2. JWT M2M pour s'authentifier auprès de woxx-pay (avec cache du token)
3. Endpoint POST /api/checkout : reçoit line_items + infos client, appelle POST /v1/checkouts sur woxx-pay,
   retourne le checkout_url au frontend
4. Endpoint POST /api/webhooks/woxx-pay : valide la signature Ed25519 (header x-woxx-signature),
   vérifie que l'événement date de moins de 5 minutes, traite payment.captured
5. Variables d'env : WOXX_PAY_API_URL, WOXX_PAY_M2M_CLIENT_ID, WOXX_PAY_M2M_CLIENT_SECRET, WOXX_PAY_PUBLIC_KEY
6. [Si multitenant] Utiliser request.tenantId (injecté par le middleware tenant) comme external_customer_ref

Fournis le code complet structuré en fichiers Fastify TypeScript avec gestion des erreurs.
```

---

## Section F — Enregistrement dans woxxapp-core

### App indépendante

```sql
-- Exécuter sur la DB de woxxapp-core

-- 1. Trouver l'UUID du créateur
SELECT id FROM users WHERE email = 'ton.email@example.com';

-- 2. Créer l'application
INSERT INTO applications (display_name, app_slug, internal_url, icon_url, created_by)
VALUES (
  '{Nom affiché dans le store}',
  '{app-slug}',
  'http://{app-name}-site',          -- ← nom exact du container Docker (container_name)
  'https://store.woxxapp.de/icons/{app-slug}.png',
  '{uuid-du-user}'
)
RETURNING id;  -- noter cet UUID pour l'étape suivante

-- 3. Trouver l'UUID du contexte cible
SELECT id FROM contexts WHERE slug = '{context-slug}';

-- 4. Associer l'app au contexte
INSERT INTO context_applications (context_id, application_id, is_active, is_public, added_by)
VALUES (
  '{uuid-du-contexte}',
  '{uuid-de-lapplication}',   -- retourné par le RETURNING ci-dessus
  true,
  false,                      -- true si accessible sans auth (landing page publique)
  '{uuid-du-user}'
);
```

### App multitenant (catalogue)

```sql
-- Exécuter sur la DB de woxxapp-core

INSERT INTO catalog_applications (name, slug, description, internal_url, icon_url)
VALUES (
  '{Nom de l app}',
  '{app-slug}',
  '{Description pour le catalogue}',
  'http://{app-name}-site',
  'https://store.woxxapp.de/icons/{app-slug}.png'
);
```

### Vérifier que le proxy route bien

```sql
-- Vérification après enregistrement
SELECT
  a.app_slug,
  a.internal_url,
  c.slug AS context_slug,
  ca.is_active,
  ca.is_public
FROM applications a
JOIN context_applications ca ON ca.application_id = a.id
JOIN contexts c ON c.id = ca.context_id
WHERE a.app_slug = '{app-slug}';
```

Checklist de vérification :
- `internal_url` = `http://{app-name}-site` exactement (pas de trailing slash, pas de port)
- `is_active` = true
- Le container est `Up` : `docker ps | grep {app-name}-site`
- Le container est sur `woxxapp-network` : `docker network inspect woxxapp-network | grep {app-name}`

---

## Section G — Gate finale avant livraison

### 1. Gate de conformité proxy

```bash
cd {app-name}
make check
# Doit afficher : ✅ Toutes les vérifications sont passées
```

Ce que vérifie `make check` :
- `base: './'` dans vite.config.ts
- `createHashRouter` utilisé (pas BrowserRouter)
- Pas de chemins absolus `/assets`, `/sw.js`, `/manifest.webmanifest`
- Pas de `navigator.serviceWorker.register`
- Pas de `dangerouslySetInnerHTML` sans DOMPurify
- Pas d'`eval()` / `new Function()`
- Pas de secret en dur (regex API keys)
- `nginx.conf` contient les headers de sécurité

### 2. Build et test Docker local

```bash
# Build l'image
make build

# Lancer le container
make start

# Vérifier les logs (doit être stable, pas de crash loop)
make logs

# Tester l'URL locale
curl -I http://localhost:{PORT_FRONTEND}
# → HTTP/1.1 200 OK

# Ouvrir dans le navigateur et vérifier :
# - La page charge
# - La navigation fonctionne (#/page2)
# - Les assets se chargent (pas de 404 dans la console)
# - Le formulaire de contact fonctionne
```

### 3. Checklist finale de livraison

```
[ ] make check passe sans erreur
[ ] npm run build produit un dist/ sans erreur
[ ] make build produit une image Docker < 100 Mo
[ ] make start démarre le container (Up dans docker ps)
[ ] URL locale http://localhost:{PORT_FRONTEND} répond 200
[ ] Navigation hash router fonctionnelle
[ ] Formulaire de contact envoi un email
[ ] [Si N3] Backend répond sur /api/health
[ ] [Si woxx-pay] Endpoint /api/checkout retourne un checkout_url
[ ] [Si woxx-pay] Endpoint /api/webhooks/woxx-pay valide la signature
[ ] App enregistrée dans woxxapp-core (SQL)
[ ] URL proxy https://store.woxxapp.de/{ctx}/{slug}/ charge l'app
[ ] Lighthouse performance > 85 (tester en incognito)
```

---

## Section H — CI/CD GitHub Actions → ghcr.io

### Principe : les images se buildent sur GitHub, pas en local

```
repo {app-name}/                     ghcr.io                    repo {app-name}-docker/
    .github/workflows/               ──────────────────────      docker-compose.yml
    docker-publish.yml               ghcr.io/{org}/{app}-frontend:latest  ←─ image:
         │                           ghcr.io/{org}/{app}-backend:latest   ←─ image:
         │ git push main
         ↓
    GitHub Actions
    → docker build + push
```

**Le repo `-docker` ne contient pas de code source.** Il référence uniquement les images
publiées sur `ghcr.io` via la directive `image:` dans le `docker-compose.yml`.

### Fichier workflow à créer dans le repo dev

Créer `.github/workflows/docker-publish.yml` :

```yaml
# {app-name}/.github/workflows/docker-publish.yml
name: Docker Build & Publish

on:
  push:
    branches: [ "main" ]

env:
  REGISTRY: ghcr.io

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write        # nécessaire pour pousser sur ghcr.io

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set lower case image names
        run: |
          echo "IMAGE_FRONTEND=ghcr.io/${GITHUB_REPOSITORY,,}-frontend" >> ${GITHUB_ENV}
          # [Si N3] décommenter la ligne suivante
          # echo "IMAGE_BACKEND=ghcr.io/${GITHUB_REPOSITORY,,}-backend" >> ${GITHUB_ENV}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to the Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}   # token automatique GitHub, aucun secret à configurer

      - name: Build and push Frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: |
            ${{ env.IMAGE_FRONTEND }}:latest
            ${{ env.IMAGE_FRONTEND }}:${{ github.sha }}   # tag immuable par commit
          cache-from: type=gha      # cache GitHub Actions pour accélérer les builds
          cache-to: type=gha,mode=max

      # [Si N3] décommenter pour le backend
      # - name: Build and push Backend image
      #   uses: docker/build-push-action@v5
      #   with:
      #     context: ./backend
      #     file: ./backend/Dockerfile
      #     push: true
      #     tags: |
      #       ${{ env.IMAGE_BACKEND }}:latest
      #       ${{ env.IMAGE_BACKEND }}:${{ github.sha }}
      #     cache-from: type=gha
      #     cache-to: type=gha,mode=max
```

> **Note** : `GITHUB_TOKEN` est fourni automatiquement par GitHub Actions — pas de secret à créer.
> Le repo GitHub doit être **public** ou avoir le **package registry activé** (Settings → Packages).

### docker-compose.yml du repo `-docker` — utilise `image:` pas `build:`

```yaml
# {app-name}-docker/docker-compose.yml
services:

  frontend:
    image: ghcr.io/{org}/{app-name}-frontend:latest   # ← pull depuis ghcr.io
    container_name: {app-name}-site
    restart: always
    ports:
      - "{PORT_FRONTEND}:80"
    environment:
      NODE_ENV: production
      VITE_FORMSPREE_ID: ${VITE_FORMSPREE_ID}
    networks:
      - woxxapp-network

  # [Si N3]
  # backend:
  #   image: ghcr.io/{org}/{app-name}-backend:latest  # ← pull depuis ghcr.io
  #   container_name: {app-name}-api
  #   restart: always
  #   environment:
  #     DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
  #     JWT_SECRET: ${JWT_SECRET}
  #   networks:
  #     - woxxapp-network
  #     - woxxpay_private_api

networks:
  woxxapp-network:
    external: true
```

### Rendre l'image ghcr.io publique (une seule fois)

Par défaut les packages ghcr.io sont privés. Le serveur doit pouvoir puller sans s'authentifier :

```
GitHub → Settings → Packages → {app-name}-frontend → Package settings
→ "Change package visibility" → Public
```

Ou pour que le serveur s'authentifie (packages privés) :

```bash
# Sur le serveur (une seule fois)
echo {GITHUB_TOKEN} | docker login ghcr.io -u {github-username} --password-stdin
```

### `scripts/update.sh` — script de mise a jour automatique

Ce script est appele par le cron toutes les 6 heures. Il pull les images et redémarre
**uniquement si une nouvelle image est disponible** — pas de redémarrage a vide.

```bash
#!/usr/bin/env bash
# {app-name}-docker/scripts/update.sh
# Pull les nouvelles images ghcr.io et redémarre les containers si nécessaire.
# Installer avec : make cron-install

set -euo pipefail

COMPOSE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$COMPOSE_DIR/logs/update.log"
mkdir -p "$COMPOSE_DIR/logs"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

log "=== Vérification des mises à jour ==="
cd "$COMPOSE_DIR"

# Pull les nouvelles images depuis ghcr.io
PULL_OUTPUT=$(docker compose pull 2>&1)
echo "$PULL_OUTPUT" >> "$LOG_FILE"

# Détecte si une image a été mise à jour
if echo "$PULL_OUTPUT" | grep -qE "Pull complete|Downloaded newer image"; then
  log "Nouvelle image détectée — redémarrage des containers..."
  docker compose up -d --force-recreate >> "$LOG_FILE" 2>&1
  log "Redémarrage terminé."
else
  log "Aucune nouvelle image. Rien à faire."
fi
```

```bash
# Rendre exécutable (une seule fois)
chmod +x scripts/update.sh
```

### Makefile du repo `-docker` (complet)

```makefile
# {app-name}-docker/Makefile
.PHONY: help setup login start stop restart logs status update down cron-install cron-remove

COMPOSE_DIR := $(shell pwd)
CRON_CMD    := $(COMPOSE_DIR)/scripts/update.sh
CRON_LOG    := $(COMPOSE_DIR)/logs/update.log

help:
	@echo ""
	@echo "  {app-name} -- Commandes de deploiement"
	@echo "  make setup          Initialise .env + dossier logs"
	@echo "  make login          Authentification ghcr.io (packages prives)"
	@echo "  make start          Lance les containers"
	@echo "  make stop           Arrete les containers"
	@echo "  make restart        Redémarre les containers"
	@echo "  make logs           Logs en temps reel"
	@echo "  make status         Etat des containers"
	@echo "  make update         Pull nouvelles images + relance"
	@echo "  make down           Arrete et supprime les containers"
	@echo "  make cron-install   Active la mise a jour automatique (toutes les 6h)"
	@echo "  make cron-remove    Desactive la mise a jour automatique"
	@echo ""

setup:
	cp -n .env.example .env || true
	mkdir -p logs

login:
	docker login ghcr.io -u {github-username}

start:
	docker compose up -d

stop:
	docker compose stop

restart:
	docker compose restart

logs:
	docker compose logs -f --tail=100

status:
	docker compose ps

update:
	docker compose pull
	docker compose up -d --force-recreate

down:
	docker compose down

cron-install:
	@chmod +x $(CRON_CMD)
	@mkdir -p $(COMPOSE_DIR)/logs
	@( crontab -l 2>/dev/null | grep -v "$(CRON_CMD)" ; \
	   echo "0 */6 * * * $(CRON_CMD) >> $(CRON_LOG) 2>&1" ) | crontab -
	@echo "Cron installe : verification toutes les 6 heures"
	@crontab -l | grep "$(CRON_CMD)"

cron-remove:
	@( crontab -l 2>/dev/null | grep -v "$(CRON_CMD)" ) | crontab - || true
	@echo "Cron supprime"
```

### Makefile du repo dev `{app-name}/`

Le repo de développement a son propre Makefile pour le build local et les checks :

```makefile
# {app-name}/Makefile
.PHONY: help dev build check start stop logs rebuild

COMPOSE := docker compose

help:
	@echo ""
	@echo "  {app-name} -- Commandes de développement"
	@echo "  make dev      Lance le serveur Vite en mode dev (hot reload)"
	@echo "  make check    Gate de conformite proxy + securite OWASP"
	@echo "  make build    Build les images Docker localement"
	@echo "  make start    Lance les containers en local"
	@echo "  make stop     Arrete les containers"
	@echo "  make logs     Logs des containers"
	@echo "  make rebuild  Rebuild sans cache (si Dockerfile / package.json change)"
	@echo ""

dev:
	cd frontend && npm run dev

check:
	bash scripts/check-conformite.sh

build:
	$(COMPOSE) -f docker-compose.dev.yml build

start:
	$(COMPOSE) -f docker-compose.dev.yml up -d

stop:
	$(COMPOSE) -f docker-compose.dev.yml stop

logs:
	$(COMPOSE) -f docker-compose.dev.yml logs -f --tail=100

rebuild:
	$(COMPOSE) -f docker-compose.dev.yml build --no-cache
	$(COMPOSE) -f docker-compose.dev.yml up -d --force-recreate
```

### Cycle de déploiement complet

```bash
# Le développeur (en local)
git add -A && git commit -m "feat: nouvelle fonctionnalité"
git push origin main
# → GitHub Actions se déclenche automatiquement (2-5 min)
# → Les images :latest sont mises à jour sur ghcr.io

# L'opérateur (sur le serveur, dans le repo -docker)
make update
# → docker compose pull  (récupère les nouvelles images)
# → docker compose up -d --force-recreate  (relance)
make logs
# → vérifier que le container est Up et stable
```

### Vérifier que le workflow a bien tourné

```
GitHub → {org}/{app-name} → Actions → Docker Build & Publish
→ Le dernier run doit être vert ✅
→ Cliquer sur "Build and push Frontend image" → vérifier le tag :latest poussé

GitHub → {org}/{app-name} → Packages
→ {app-name}-frontend doit apparaître avec la date du dernier push
```

---

## Références

- `content/restrictions-proxy.md` — contraintes techniques détaillées
- `content/niveaux.md` — règles N1/N2/N3
- `content/deploiement-docker.md` — Dockerfile, compose, nginx complets
- `content/securite-owasp.md` — règles de sécurité
- `content/integrations-externes.md` — catalogue des services tiers
- `content/checklist-livraison.md` — checklist complète de livraison
- **Skill précédent** : `woxxapp-plan`
