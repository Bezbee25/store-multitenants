---
name: woxxapp-plan
description: >
  Transforme une spec validée (docs/spec.md) en plan d'implémentation ordonné
  avec les 2 repos Git et un task.md bite-sized. À utiliser après woxxapp-spec
  et avant woxxapp-dev.
---

# woxxapp-plan — De la spec au plan d'implémentation

## Quand utiliser ce skill

Quand `docs/spec.md` est écrite et validée par le développeur.
Ce skill crée les **2 repos Git** et génère le **plan d'implémentation** étape par étape.

**Pré-requis** : avoir complété `woxxapp-spec` et avoir un `docs/spec.md` validé.

---

## Les 2 repos WoxxApp — Pourquoi et comment

Chaque app WoxxApp vit dans **2 repos séparés dans le woxxcluster** :

| Repo | Rôle | Contenu |
|---|---|---|
| `{app-name}/` | Développement | Code source, tests, CI, Dockerfile(s) |
| `{app-name}-docker/` | Déploiement | docker-compose.yml, .env.example, Makefile, README ops |

**Pourquoi 2 repos ?**
- Le repo `-docker` peut être mis à jour (nouvelles images) sans toucher au code
- L'opérateur peut gérer le déploiement sans avoir accès au code source
- Le CI/CD pousse des images sur ghcr.io ; le repo `-docker` les pull via `image:` plutôt que de builder

---

## Étape 1 — Créer les 2 repos Git

Exécuter ces commandes depuis `woxxcluster/` :

```bash
# Lire le slug depuis docs/spec.md
APP="{app-slug}"   # ex: boutique-bijou

# ── Repo de développement ──────────────────────────────────────────
mkdir -p "$APP"
cd "$APP"
git init
git checkout -b main

# Créer la structure de base
mkdir -p docs/plans frontend/src/{pages,components,content,lib} nginx

# Copier le template depuis woxxapp-skills
bash ../woxxapp-skills/scripts/new-project.sh . --no-interactive

cd ..

# ── Repo de déploiement ────────────────────────────────────────────
mkdir -p "${APP}-docker"
cd "${APP}-docker"
git init
git checkout -b main
```

### Structure du repo DEV `{app-name}/`

```
{app-name}/
├── docs/
│   ├── spec.md                 ← spec validée (woxxapp-spec)
│   └── plans/
│       └── task.md             ← plan généré par ce skill
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── routes.ts
│   │   ├── pages/
│   │   ├── components/
│   │   ├── content/            ← données statiques TypeScript
│   │   └── lib/
│   │       └── woxxapp-context.tsx
│   ├── public/
│   │   └── favicon.svg
│   ├── index.html
│   ├── vite.config.ts          ← base: './' OBLIGATOIRE
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
├── [N3] backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   └── plugins/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docker-compose.dev.yml      ← pour dev local avec ports exposés
├── Makefile
└── .env.example
```

### Structure du repo DEPLOIEMENT `{app-name}-docker/`

```
{app-name}-docker/
├── docker-compose.yml          <- images depuis ghcr.io + ports exposes
├── .env.example                <- toutes les vars d'environnement
├── Makefile                    <- make start / update / cron-install / cron-remove
├── scripts/
│   └── update.sh               <- script cron : pull + restart si nouvelle image
└── README.md                   <- instructions ops (pas de code ici)
```

---

## Étape 2 — Créer les fichiers de base du repo `-docker`

### `docker-compose.yml` (template — à adapter selon la spec)

```yaml
# {app-name}-docker/docker-compose.yml
services:

  frontend:
    image: ghcr.io/{org}/{app-name}-frontend:latest
    container_name: {app-name}-site      # ← ce nom est l'hostname DNS sur woxxapp-network
    restart: always
    ports:
      - "{PORT_FRONTEND}:80"             # ← 1 seul port exposé sur l'hôte (woxxapp proxy ce port)
    environment:
      NODE_ENV: production
      VITE_FORMSPREE_ID: ${VITE_FORMSPREE_ID}
      # ... autres vars front
    networks:
      - woxxapp-network

  # [Si N3] backend interne — pas exposé publiquement via woxxapp
  # backend:
  #   image: ghcr.io/{org}/{app-name}-backend:latest
  #   container_name: {app-name}-api
  #   restart: always
  #   ports:
  #     - "{PORT_BACKEND}:3000"          # port local pour debug seulement
  #   environment:
  #     DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
  #     JWT_SECRET: ${JWT_SECRET}
  #     # [Si woxx-pay]
  #     WOXX_PAY_API_URL: ${WOXX_PAY_API_URL}
  #     WOXX_PAY_M2M_CLIENT_ID: ${WOXX_PAY_M2M_CLIENT_ID}
  #     WOXX_PAY_M2M_CLIENT_SECRET: ${WOXX_PAY_M2M_CLIENT_SECRET}
  #   networks:
  #     - woxxapp-network
  #     - woxxpay_private_api             # [Si woxx-pay] réseau privé vers woxx-pay

  # [Si DB] base de données — jamais exposée sur l'hôte en production
  # postgres:
  #   image: postgres:15-alpine
  #   container_name: {app-name}-postgres
  #   restart: always
  #   environment:
  #     POSTGRES_USER: ${POSTGRES_USER}
  #     POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  #     POSTGRES_DB: ${POSTGRES_DB}
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   # PAS de ports: en production — DB accessible seulement sur le réseau Docker

networks:
  woxxapp-network:
    external: true                       # créé par l'infra woxxapp, pas par cette app
  # woxxpay_private_api:
  #   external: true                     # [Si woxx-pay] réseau privé vers woxx-pay

# volumes:
#   postgres_data:
#     name: {app-name}_postgres_data
#     external: true
```

> **Règle des ports** :
> - **`{PORT_FRONTEND}`** : 1 seul port exposé sur l'hôte, woxxapp le reverse-proxy
> - Services internes (backend, DB) : pas de `ports:` en production ; accessible uniquement sur le réseau Docker
> - En local dev : on peut ajouter des `ports:` pour déboguer, mais pas sur le serveur

### `Makefile` du repo `-docker`

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
	@echo "  make login          Authentification ghcr.io"
	@echo "  make start          Lance les containers"
	@echo "  make stop           Arrete les containers"
	@echo "  make restart        Redémarre les containers"
	@echo "  make logs           Logs en temps reel"
	@echo "  make status         Etat des containers"
	@echo "  make update         Pull nouvelles images + relance"
	@echo "  make down           Arrete et supprime les containers"
	@echo "  make cron-install   Active la mise a jour automatique (6h)"
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

### `.env.example` du repo `-docker`

```bash
# {app-name}-docker/.env.example
# Copier en .env et remplir les valeurs

# ── Identité du container ──────────────────────────────────────────
SITE_NAME={app-name}
PORT_FRONTEND=XXXX        # ex: 3335 — port exposé sur l'hôte (woxxapp proxy ce port)

# ── Intégrations front ─────────────────────────────────────────────
VITE_FORMSPREE_ID=
VITE_PLAUSIBLE_DOMAIN=

# ── [Si N3] Backend ────────────────────────────────────────────────
# PORT_BACKEND=XXXX
# JWT_SECRET=             # openssl rand -hex 32
# POSTGRES_USER=
# POSTGRES_PASSWORD=
# POSTGRES_DB=

# ── [Si woxx-pay] ─────────────────────────────────────────────────
# WOXX_PAY_API_URL=http://woxx-pay-api:8000
# WOXX_PAY_M2M_CLIENT_ID=
# WOXX_PAY_M2M_CLIENT_SECRET=
# WOXX_PAY_PUBLIC_KEY=    # clé publique Ed25519 pour vérification des callbacks
```

---

## Étape 3 — Générer le plan `docs/plans/task.md`

Utiliser ce prompt pour générer le plan depuis la spec :

```
Tu es un architecte WoxxApp. Lis la spec suivante et génère un plan
d'implémentation ordonné au format task.md.

Règles :
- 1 tâche = 1 étape atomique avec critère de validation mesurable
- Ordre strict : ne pas paralléliser
- Marquer les étapes conditionnelles : [SI N3], [SI woxx-pay], [SI multitenant]
- Chaque tâche a : ID, titre, description courte, commande ou fichier à produire, critère de validation

[coller le contenu de docs/spec.md]
```

### Template `docs/plans/task.md`

```markdown
# Plan d'implémentation — {Nom de l'app}

Spec : `docs/spec.md` | Type : {indépendante|multitenant} | Niveau : N{1|2|3}

## Progression

| ID | Tâche | Statut |
|---|---|---|
| T01 | Init repo dev + GitHub remote | ⬜ |
| T02 | Init repo déploiement + GitHub remote | ⬜ |
| T03 | Setup CI/CD GitHub Actions (docker-publish.yml) | ⬜ |
| T04 | Setup frontend (Vite + React) | ⬜ |
| T05 | Implémenter page : Accueil | ⬜ |
| T06 | Implémenter page : {Page 2} | ⬜ |
| ... | ... | ... |
| T10 | Implémenter intégration : Formspree | ⬜ |
| T11 | [SI N3] Setup backend Fastify | ⬜ |
| T12 | [SI woxx-pay] Intégrer woxx-pay | ⬜ |
| T13 | [SI multitenant] Middleware tenant_id | ⬜ |
| T14 | Configurer Docker (Dockerfile + nginx.conf) | ⬜ |
| T15 | Configurer repo -docker (docker-compose image: ghcr.io + .env) | ⬜ |
| T15b | Créer scripts/update.sh dans le repo -docker | ⬜ |
| T16 | Premier push main → vérifier GitHub Actions vert | ⬜ |
| T17 | Gate conformité : make check | ⬜ |
| T18 | Déploiement serveur : make update dans -docker | ⬜ |
| T19 | Activer le cron : make cron-install dans -docker | ⬜ |
| T20 | Enregistrement dans woxxapp-core (SQL) | ⬜ |

## Détail des tâches

### T01 — Init repo dev
**Commandes** :
```bash
mkdir {app-name} && cd {app-name} && git init && git checkout -b main
# Créer le repo sur GitHub : https://github.com/new → {app-name}
git remote add origin https://github.com/{org}/{app-name}.git
```
**Validation** : `git remote -v` affiche l'origin

### T02 — Init repo déploiement
```bash
mkdir {app-name}-docker && cd {app-name}-docker && git init && git checkout -b main
# Créer le repo sur GitHub : https://github.com/new → {app-name}-docker
git remote add origin https://github.com/{org}/{app-name}-docker.git
```
**Validation** : `git remote -v` affiche l'origin

### T03 — Setup CI/CD GitHub Actions
**Fichier à créer** : `{app-name}/.github/workflows/docker-publish.yml`
Utiliser le template de la Section H de `woxxapp-dev`.
**Validation** : fichier présent, premier `git push main` → GitHub Actions vert ✅
→ package visible sur `github.com/{org}/{app-name}/pkgs/container/{app-name}-frontend`

### T04 — Setup frontend
**Fichiers à produire** : vite.config.ts (`base: './'`), package.json, tailwind.config.ts, src/main.tsx (`createHashRouter`), src/routes.ts
**Validation** : `npm run dev` démarre sans erreur, page s'affiche sur localhost

### T15 — Configurer repo -docker
**Règle** : le docker-compose.yml utilise `image: ghcr.io/{org}/{app-name}-frontend:latest`
**PAS** de `build:` — les images sont buildées par GitHub Actions, pas sur le serveur
**Validation** : `docker compose pull` réussit, image téléchargée depuis ghcr.io

### T16 — Premier push → vérifier CI/CD
```bash
git push origin main
# Attendre 2-5 min → vérifier :
# github.com/{org}/{app-name}/actions → run vert ✅
# github.com/{org}/{app-name}/pkgs/container/{app-name}-frontend → image présente
```
**Si les packages sont privés** : aller dans Package Settings → rendre public
OU configurer `docker login ghcr.io` sur le serveur.

### T18 — Déploiement serveur
```bash
# Depuis le repo -docker sur le serveur
make update   # docker compose pull + up -d --force-recreate
make logs     # vérifier que le container est Up et stable
```
**Validation** : `docker ps | grep {app-name}-site` → Up

...
```

---

## Étape 4 — Vérifier le plan avant de coder

Avant de passer à `woxxapp-dev`, confirmer :

- [ ] Les 2 repos Git sont initialisés dans `woxxcluster/`
- [ ] `docs/plans/task.md` liste toutes les tâches
- [ ] Les tâches conditionnelles [SI N3], [SI woxx-pay], [SI multitenant] sont correctement marquées
- [ ] Les ports dans le template docker-compose sont choisis (vérifier qu'ils sont libres sur le serveur)
- [ ] Le développeur a lu le plan et confirme qu'il est complet

> ✅ **Gate** : Annoncer au développeur :
> *"Plan prêt. Vérifie que les ports {PORT_FRONTEND} sont libres sur le serveur. Lance `woxxapp-dev` pour commencer le développement."*

---

## Références

- `content/niveaux.md` — règles N1/N2/N3
- `content/deploiement-docker.md` — pattern Docker complet
- `content/restrictions-proxy.md` — contraintes proxy (base: './', createHashRouter...)
- **Skill précédent** : `woxxapp-spec`
- **Skill suivant** : `woxxapp-dev`
