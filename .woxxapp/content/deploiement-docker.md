# Déploiement Docker WoxxApp

Tous les sites et PWAs WoxxApp sont déployés via Docker. Un seul réseau externe `woxxapp-network` partagé avec `woxxapp-core`. nginx sert le build statique Vite. Fastify (N3 uniquement) en service additionnel.

## Dockerfile (N1/N2 — statique)

Multi-stage : build Vite sur `node:22-alpine`, puis copie de `dist/` dans `nginx:alpine`. Image finale < 50 Mo.

```dockerfile
# Dockerfile
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Pour N3, voir [Dockerfile N3](#dockerfile-n3) plus bas.

## nginx.conf

Template unique pour tous les sites statiques. Sert `/usr/share/nginx/html`, fallback `index.html` pour le hash router (utile si un user tape `https://store.woxxapp.de/{ctx}/{app}/` directement), cache headers pour les assets hashés.

```nginx
# nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/javascript application/xml+rss image/svg+xml;
    gzip_min_length 1024;

    # Cache headers pour assets hashés (Vite génère /assets/index-[hash].js)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Pas de cache pour index.html (sinon les users ne voient jamais les mises à jour)
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Fallback pour hash router : toute route inconnue renvoie index.html
    # (utile pour le first load si l'user tape directement une URL)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Sécurité : pas de .htaccess, pas de fichiers cachés
    location ~ /\. {
        deny all;
    }
}
```

## docker-compose.yml (N1/N2)

```yaml
# docker-compose.yml
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

Points clés :

- `expose` (pas `ports`) : le container n'est pas publié sur l'hôte. Il n'est joignable que depuis `woxxapp-network`, par `woxxapp-core` via `http://${SITE_NAME}-site`.
- `container_name: ${SITE_NAME}-site` : c'est ce nom qui sert d'hostname DNS dans le réseau Docker. `woxxapp-core` proxy vers cette URL.
- `woxxapp-network` est **external** : il doit exister avant le `make start`. C'est l'infra WoxxApp qui le crée, pas le site.

## Enregistrement dans woxxapp-core

Après `make start`, le container est joignable sur le réseau Docker mais pas encore routé par le proxy WoxxApp. Pour l'enregistrer, deux écritures sont nécessaires :

1. Une ligne dans `applications` (l'app elle-même, identique quel que soit le contexte)
2. Une ligne dans `context_applications` (rend l'app disponible dans un contexte donné)

Les colonnes publiques (URL proxy, slug) vivent dans `applications`. La visibilité publique d'une app dans un contexte se pilote via `context_applications.is_public` (et plus finement via `anonymousShares` / `group_application_permissions`).

```sql
-- SQL à exécuter sur la DB woxxapp-core
-- 1) Créer l'application (appSlug est unique globalement)
INSERT INTO applications (display_name, app_slug, internal_url, icon_url, created_by)
VALUES (
  'My App',
  'my-app',
  'http://my-app-site',
  'https://store.woxxapp.de/icons/my-app.png',  -- placeholder: URL de l'icône à fournir
  '<uuid-users-id>'                              -- obligatoire: UUID du user créateur
)
RETURNING id;

-- 2) L'associer au contexte cible (remplacer les <uuid-...>)
INSERT INTO context_applications (context_id, application_id, is_active, is_public, added_by)
VALUES (
  '<uuid-contexts-id>',     -- id du contexte qui héberge l'app
  '<uuid-applications-id>', -- id renvoyé par l'INSERT ci-dessus
  true,
  false,                    -- true = accessible sans auth (landing page) ; false sinon
  '<uuid-users-id>'         -- obligatoire: UUID du user qui ajoute l'app
);

-- ── CAS DU CATALOGUE D'APPLICATIONS (SUR ÉTAGÈRE) ───────────────────────────
-- Si l'application est disponible dans le catalogue global, elle doit être
-- enregistrée dans la table `catalog_applications` pour être disponible aux clients.
--
-- Enregistrer l'application catalogue :
INSERT INTO catalog_applications (name, slug, description, internal_url, icon_url)
VALUES (
  'My Catalog App',
  'my-catalog-app',
  'Description complète de l\'application du catalogue.',
  'http://my-catalog-app-site',
  'https://store.woxxapp.de/icons/my-app.png'
);
```

Adapter :

- `display_name` : nom affiché dans le store
- `app_slug` : slug de l'app (unique globalement, utilisé dans l'URL)
- `internal_url` : `http://${SITE_NAME}-site` (le nom exact du container Docker)
- `icon_url` : URL de l'icône (placeholder à remplacer par l'opérateur ; nullable en DB mais recommandé pour le rendu store)
- `created_by` / `added_by` : UUID d'un user existant dans `users.id` (champ obligatoire, pas de défaut DB)
- `context_id` : UUID du contexte hébergeant l'app (résoudre via `SELECT id FROM contexts WHERE slug = 'my-context';`)
- `is_public` : `true` si l'app est accessible sans auth (landing page), `false` sinon

L'URL publique devient : `https://store.woxxapp.de/{context_slug}/{app_slug}/`.

Pour mettre à jour l'URL interne d'une app existante :

```sql
UPDATE applications
SET internal_url = 'http://my-app-v2-site'
WHERE app_slug = 'my-app';
```

Pour retirer une app d'un contexte sans la supprimer :

```sql
DELETE FROM context_applications
WHERE application_id = (SELECT id FROM applications WHERE app_slug = 'my-app')
  AND context_id     = (SELECT id FROM contexts WHERE slug = 'my-context');
```

## Dockerfile N3

Pour un back-end Fastify séparé. Le repo a deux Dockerfiles :

```
./Dockerfile           # front nginx (identique N1/N2)
./api/Dockerfile       # back Fastify
```

**`api/Dockerfile`** :

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app

COPY api/package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY api/ ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## docker-compose.yml (N3)

Deux services. Le service `app` (nginx) proxy `/api/*` vers `api:3000` via nginx.

```yaml
# docker-compose.yml (N3)
services:
  app:
    build: .
    container_name: ${SITE_NAME}-site
    restart: always
    expose:
      - "80"
    environment:
      - NODE_ENV=production
      - VITE_API_PREFIX=/api
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
      - PORT=3000
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    networks:
      - woxxapp-network

networks:
  woxxapp-network:
    external: true
```

**nginx.conf N3** (ajout du proxy `/api`) :

```nginx
# À ajouter dans le server block nginx.conf (avant le location /)
location /api/ {
    proxy_pass http://api:3000/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Headers injectés par woxxapp-core proxy (forward au back-end)
    proxy_pass_request_headers on;
}
```

Le service `api` n'est pas exposé directement au proxy woxxapp-core. Tout passe par nginx, qui lui-même proxy `/api/*`. C'est plus simple pour l'opérateur (une seule URL interne `http://${SITE_NAME}-site`).

## Variables d'environnement

Documentées dans `.env.example` à la racine du repo. Exemple N2 :

```bash
# .env.example
SITE_NAME=my-bakery

# Front
VITE_FORMSPREE_ID=xxxx
VITE_PLAUSIBLE_DOMAIN=my-bakery.woxxapp.de

# Sanity (N2)
VITE_SANITY_PROJECT_ID=xxxx
VITE_SANITY_DATASET=production
VITE_SANITY_API_TOKEN=skxxxx

# N3 (commenté par défaut)
# DATABASE_URL=postgresql://user:pass@woxxapp-db:5432/my-bakery
# JWT_SECRET=generate-with-openssl-rand-hex-32
```

`.env.example` ne contient **jamais** de vraie clé. Les valeurs réelles sont dans `.env` (gitignored).

## Makefile — cibles

Le Makefile WoxxApp est **verrouillé**. Ne pas le modifier. Toutes les variations passent par `.env`.

| Cible | Commande équivalente | Quand l'utiliser |
|---|---|---|
| `make help` | — | Liste des cibles |
| `make build` | `docker compose build` | Premier build, ou après changement de Dockerfile / nginx.conf / code source |
| `make rebuild` | `docker compose build --no-cache && docker compose up -d --force-recreate` | After modification de `package.json`, problèmes de cache, comportement inattendu |
| `make start` | `docker compose up -d` | Premier lancement, ou après `make stop` |
| `make stop` | `docker compose stop` | Couper le container sans supprimer (volumes conservés) |
| `make restart` | `docker compose restart` | Forcer un redémarrage sans rebuild |
| `make down` | `docker compose down` | Supprimer complètement le container (garde l'image) |
| `make logs` | `docker compose logs -f` | Déboguer un crash au démarrage, suivre en temps réel |
| `make check` | `bash scripts/check-conformite.sh` | Avant chaque commit, vérifie la conformité proxy |

### Workflow type

```bash
# Premier démarrage
cp .env.example .env
# éditer .env
make build
make start
make logs

# Itération dev local (sans Docker)
npm install
npm run dev

# Mise à jour de prod
git pull
make rebuild
make logs

# Diagnostic
make check          # conformité proxy
make logs           # logs nginx/api
docker compose exec app sh   # shell dans le container nginx
```

## Bonnes pratiques opérationnelles

- **Healthcheck** : nginx répond toujours 200 sur `/`, pas besoin de healthcheck Docker custom.
- **Logs** : nginx loggue dans stdout/stderr (`access_log /dev/stdout;`), capturé par Docker. `make logs` les montre.
- **Restart policy** : `restart: always` dans le compose. Le container survit à un reboot de l'hôte.
- **Image size** : nginx:alpine + dist statique = ~25 Mo. Si l'image dépasse 100 Mo, il y a un problème (vite bundle trop lourd, deps oubliées en prod).
- **Mise à jour de l'image base** : `make rebuild` périodiquement pour tirer la dernière `nginx:alpine` (sécurité).

## Diagnostic des problèmes courants

### `make start` échoue : `network woxxapp-network not found`

Le réseau n'existe pas encore. Le créer côté `woxxapp-core` :

```bash
docker network create woxxapp-network
```

En principe, l'infra WoxxApp le fait une fois pour toutes.

### Container démarre mais page blanche

Vérifier dans le navigateur (console network) :

- Si les assets `/assets/index-*.js` sont en 404 → `base: './'` manquant dans Vite.
- Si `index.html` est servi mais routes cassées → `BrowserRouter` au lieu de `createHashRouter`.

### nginx retourne 404 sur `/api/...` (N3)

- Vérifier que `api` est dans le compose et `make start` réussit
- Vérifier le `location /api/` dans `nginx.conf` avec `proxy_pass http://api:3000/;` (avec le `/` final)
- `docker compose exec app wget -qO- http://api:3000/health` doit répondre depuis le container nginx

### Proxy woxxapp-core ne route pas

Vérifier les tables `applications` et `context_applications` :

```sql
SELECT a.app_slug, a.internal_url, c.slug AS context_slug, ca.is_active, ca.is_public
FROM applications a
JOIN context_applications ca ON ca.application_id = a.id
JOIN contexts c             ON c.id = ca.context_id
WHERE a.app_slug = 'my-app';
```

- `internal_url` doit être `http://${SITE_NAME}-site` exactement (pas de trailing slash, pas de port, le nom Docker)
- `is_active` doit être `true` dans `context_applications` pour le contexte visé
- Le container doit être `Up` côté `docker ps`
- Le container doit être sur `woxxapp-network` : `docker network inspect woxxapp-network | grep ${SITE_NAME}`
