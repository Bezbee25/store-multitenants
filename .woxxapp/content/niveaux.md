# Niveaux de complexité WoxxApp

Trois niveaux. N1 par défaut. Montée en gamme justifiée uniquement par une citation explicite du questionnaire client.

| Niveau | Définition | Activation |
|---|---|---|
| **N1 — Statique pur** | Build Vite, contenu dans TS/Markdown, formulaires et newsletter via services tiers | Défaut, aucune justification |
| **N2 — CMS headless** | N1 + back-office léger pour édition de contenu par le client | Si le questionnaire mentionne explicitement l'édition de contenu |
| **N3 — Back-end dédié** | N1 ou N2 + service Fastify/Node séparé avec DB | Interdit par défaut. Justification obligatoire + validation humaine |

## Règles de gate

1. **Démarre toujours à N1**. C'est le défaut.
2. **Monte à N2 si et seulement si** le questionnaire contient une mention explicite du type :
   - « le client doit pouvoir modifier ses textes lui-même »
   - « back-office pour éditer le blog »
   - « ajout d'articles régulier sans repasser par le dev »
3. **Monte à N3 si et seulement si** :
   - Le questionnaire justifie un besoin back-end **non couvrable** par une intégration externe (ex : logique métier custom, calcul en temps réel, sync multi-source).
   - La justification est **citée textuellement** dans le prompt d'analyse.
   - L'IA **demande explicitement** une validation humaine avant de monter en gamme.

En cas de doute : reste à N1. Une intégration externe couvre 95% des besoins back-end apparents (cf. `integrations-externes.md`).

---

## N1 — Statique pur

### Patterns autorisés

- React 18 + TypeScript + Vite
- React Router v7 en `createHashRouter`
- Tailwind CSS + Framer Motion
- Contenu dans `src/content/*.ts` ou `src/content/*.md` (parsé avec `gray-matter` ou `remark`)
- Builds à la date de déploiement uniquement (pas de runtime backend)
- Formulaires via Formspree / Tally / Planeup (HTML form `action="..."`)
- Newsletter via Mailchimp / Brevo / ConvertKit (HTML embed)
- Analytics privacy-first via Plausible / Fathom
- Maps via MapLibre / OpenStreetMap embed

### Patterns interdits

- `express`, `fastify`, `koa`, tout serveur HTTP applicatif
- Prisma / Drizzle / Knex / TypeORM, tout ORM
- PostgreSQL / MySQL / MongoDB / Redis, toute DB
- Auth applicative (cookie de session, JWT maison)
- Paiement intégré (Stripe Checkout inline, Shopify Storefront API)
- WebSocket applicatif

### Bibliothèques recommandées

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^7.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.450.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### docker-compose.yml (N1)

```yaml
services:
  app:
    build: .
    container_name: ${SITE_NAME}-site
    restart: always
    expose:
      - "80"
    environment:
      - NODE_ENV=production
    networks:
      - woxxapp-network

networks:
  woxxapp-network:
    external: true
```

Un seul service. nginx sert le `dist/`.

---

## N2 — CMS headless

N1 + un CMS headless pour l'édition de contenu par le client. L'app reste statique buildée ; le contenu est fetché au runtime ou au build depuis l'API CMS.

### Choix du CMS

| CMS | Quand | Coût | Modèle |
|---|---|---|---|
| **Decap CMS** (ex-Netlify CMS) | Le client édite occasionnellement du Markdown, le contenu vit dans le repo Git | Gratuit | Git-based, UI web |
| **TinaCMS** | Le client veut un wysiwyg visuel, le contenu reste dans Git | Free tier, puis payant | Git-based + visual editing |
| **Sanity** | Beaucoup de contenu, plusieurs types, prévisualisation, multi-langue | Free tier généreux, puis payant | API hosted, studio custom |

Par défaut : **Decap CMS** (zéro coût, zéro lock-in, contenu dans le repo).

### Patterns autorisés (en plus de N1)

- `@sanity/client` pour fetch du contenu Sanity au build (`staticParams`) ou au runtime
- Decap CMS servi depuis `/admin/` (admin statique HTML + `config.yml`)
- TinaCMS en mode local editing (build-time ou runtime fetch)
- Webhooks CMS → rebuild Docker image

### Patterns interdits (toujours)

- DB applicative directe (le CMS gère sa propre DB, l'app n'y touche pas)
- Auth maison (le CMS a son propre système)
- Logique métier custom côté serveur (sinon → N3)

### Bibliothèques recommandées (en plus)

```json
{
  "dependencies": {
    "@sanity/client": "^9.0.0",
    "groq": "^0.2.0"
  }
}
```

Ou pour Decap : juste `public/admin/index.html` + `public/admin/config.yml`, aucune dépendance npm.

### docker-compose.yml (N2)

Identique à N1. Le CMS Sanity est hosted, pas dans le compose. Pour Decap/TinaCMS, le contenu est dans Git, pas de service supplémentaire non plus.

```yaml
# Identique à N1
services:
  app:
    build: .
    container_name: ${SITE_NAME}-site
    restart: always
    expose:
      - "80"
    environment:
      - NODE_ENV=production
      - SANITY_PROJECT_ID=${SANITY_PROJECT_ID}
      - SANITY_DATASET=${SANITY_DATASET}
      - SANITY_API_TOKEN=${SANITY_API_TOKEN}
    networks:
      - woxxapp-network

networks:
  woxxapp-network:
    external: true
```

---

## N3 — Back-end dédié

N1 ou N2 + un service Fastify/Node séparé, avec DB si le besoin est prouvé. **Exception**, pas la norme.

### Critères de validation (tous obligatoires)

1. **Citation du questionnaire** : le prompt d'analyse doit contenir une citation textuelle justifiant le back-end. Exemple acceptable : « calcul de devis temps réel à partir d'une grille tarifaire complexe qui change hebdomadaire ».
2. **Aucune alternative externe** : l'IA doit avoir épuisé les alternatives (Formspree, Calendly, Stripe Payment Link, webhook Zapier) et justifier pourquoi elles ne suffisent pas.
3. **Validation humaine explicite** : l'IA pose la question au dev/opérateur avant d'implémenter. Exemple :

   > ⚠️ Passage N3 proposé. Justification : « [citation du questionnaire] ».
   > Alternatives externes écartées : [liste].
   > Valider le passage en N3 ? (oui/non)

4. **DB justifiée séparément** : si une DB est ajoutée, justifier pourquoi un fichier JSON dans le repo, un CMS, ou SQLite en read-only ne suffit pas.

### Patterns autorisés

- Fastify (recommandé) ou Hono sur Node 22
- Prisma (PostgreSQL uniquement)
- Auth via JWT signé HS256, secret en env var
- Validation `schema.body` / `schema.params` Fastify
- Connexion à la DB via `DATABASE_URL` (pool PgBouncer côté woxxapp-core)
- Endpoints REST documentés OpenAPI

### Patterns interdits

- Express (préférer Fastify pour le typage schéma + perf)
- MongoDB, MySQL, Redis (PostgreSQL uniquement pour rester aligné avec woxxapp-core)
- Sessions côté serveur stateful (stateless JWT uniquement)
- WebSockets sauf si explicitement justifié
- Comptes utilisateurs applicatifs (l'auth est gérée côté WoxxApp, l'app reçoit les headers `X-User-ID`, `X-User-Email` injectés par le proxy)

### Bibliothèques back-end (N3)

```json
{
  "dependencies": {
    "fastify": "^5.0.0",
    "@fastify/cors": "^10.0.0",
    "@fastify/helmet": "^12.0.0",
    "prisma": "^5.20.0",
    "@prisma/client": "^5.20.0",
    "zod": "^3.23.0"
  }
}
```

### docker-compose.yml (N3)

Deux services. Le front (nginx statique) et le back (Fastify) sur le même réseau.

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${SITE_NAME}-site
    restart: always
    expose:
      - "80"
    environment:
      - NODE_ENV=production
      - VITE_API_URL=/api
    depends_on:
      - api
    networks:
      - woxxapp-network

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: ${SITE_NAME}-api
    restart: always
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@woxxapp-db:5432/${SITE_NAME}
      - JWT_SECRET=${JWT_SECRET}
    networks:
      - woxxapp-network

networks:
  woxxapp-network:
    external: true
```

Le service `app` (nginx) doit proxy `/api/*` vers `api:3000` au niveau nginx (cf. `deploiement-docker.md` pour le nginx.conf correspondant).

### Schéma de décision

```
Questionnaire → mention d'édition contenu ?
  ├─ non  → N1
  └─ oui  → N2
         → mention de logique métier custom / temps réel ?
            ├─ non  → reste N2
            └─ oui  → alternatives externes couvrent le besoin ?
               ├─ oui → reste N2 (intégration externe)
               └─ non → demander validation humaine → N3
```
