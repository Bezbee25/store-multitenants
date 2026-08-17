---
name: woxxapp-spec
description: >
  Transforme un besoin applicatif (texte libre, brief, cahier des charges)
  en une spec structurée WoxxApp prête à planifier. À activer en tout premier,
  avant de toucher au code ou de créer les repos.
---

# woxxapp-spec — Analyser le besoin et produire la spec

## Quand utiliser ce skill

Dès qu'un développeur reçoit un **besoin applicatif** à réaliser pour WoxxApp :
- Une nouvelle app indépendante commandée pour un client précis
- Une nouvelle app multitenant à ajouter au catalogue WoxxApp
- Un besoin en texte libre, brief, ou section 12 du prompt d'analyse woxxapp

**Ne pas sauter cette étape.** La spec validée conditionne les 2 repos, la stack, et le mode de déploiement.

---

## Comprendre l'écosystème WoxxApp avant de speccer

### Architecture globale

```
woxxcluster/
├── woxxapp/           ← le store (core) — gère le proxy, les contextes, les users
├── woxx-pay/          ← webservice paiement Stripe (API interne)
├── {app-name}/        ← repo DEV de ton app  (tu codes ici, en LOCAL)
└── {app-name}-docker/ ← repo DÉPLOIEMENT  (docker-compose, ports, images)
```

**Règle fondamentale : le développement se fait toujours en LOCAL.**
Le serveur ne sert qu'à faire tourner les containers Docker. On ne code pas sur le serveur.

### Comment une app est exposée

```
Navigateur → https://store.woxxapp.de/{contextSlug}/{appSlug}/
                          ↓
                    woxxapp (proxy)
                          ↓ réseau Docker interne
              http://{app-name}-site:{port}   ← ton container
```

L'app est **proxiée** par woxxapp. Elle ne contrôle pas son domaine ni la racine de son URL.
Cela impose des contraintes techniques incontournables (cf. `restrictions-proxy.md`).

### Deux types d'apps dans WoxxApp

| Type | Définition | Enregistrement DB |
|---|---|---|
| **Indépendante** | App développée pour un client/contexte précis | `applications` + `context_applications` |
| **Multitenant** | App sur étagère, 1 instance partagée entre N clients (isolation par `tenant_id`) | `catalog_applications` |

---

## Étape 1 — Lire et comprendre le besoin applicatif

Colle le besoin applicatif (texte libre, brief, section 12…) et utilise ce prompt pour le faire analyser :

```
Tu es un architecte logiciel spécialisé WoxxApp. Analyse le besoin applicatif suivant
et produis une spec structurée en français, en respectant strictement ce format.

BESOIN APPLICATIF :
[coller le texte ici]

CONTEXTE WOXXAPP :
- L'app sera servie via un proxy WoxxApp à l'URL https://store.woxxapp.de/{ctx}/{slug}/
- Le routeur DOIT être createHashRouter (jamais BrowserRouter)
- Le build DOIT avoir base: './' dans vite.config.ts
- Pas de SDK Stripe direct — paiement uniquement via woxx-pay si nécessaire
- Stack par défaut : Vite + React 18 + TypeScript + React Router v7 + Tailwind CSS
- Niveau de complexité : N1 (statique) par défaut, N2 (CMS) ou N3 (backend) si justifié

Produis le document spec.md suivant ce template exact (ne rien inventer,
demander si une information est manquante).
```

---

## Étape 2 — Template `docs/spec.md` à générer

```markdown
# Spec — {Nom de l'application}

## Métadonnées

- **Slug** : {app-slug}           ← identifiant unique, kebab-case, ex: boutique-bijou
- **Type** : indépendante | multitenant
- **Niveau** : N1 | N2 | N3
- **Justification niveau** : {pourquoi N1/N2/N3 — citation du besoin}
- **woxx-pay** : oui | non
- **Date spec** : {date}

## 1. Objectif du projet

{description courte — 2 à 5 phrases max. Cible, but principal, ce que l'app fait.}

## 2. Stack technique

- Vite + React 18 + TypeScript
- React Router v7 (createHashRouter — obligatoire)
- Tailwind CSS + Framer Motion
- {autres libs justifiées par le besoin}
- [N2] CMS : Decap | TinaCMS | Sanity
- [N3] Backend : Fastify + Prisma + PostgreSQL

## 3. Structure des pages / vues

- `/` — Accueil : {description}
- `/page-2` — {Nom} : {description}
- ...

## 4. Composants à créer

- `<Hero />` : {rôle}
- `<ProductGrid />` : {rôle}
- ...

## 5. Contraintes responsive

- Mobile-first
- {breakpoints Tailwind utilisés et comportement}

## 6. Contraintes SEO

- Title format : "{Nom App} | {Page}"
- Meta description par page : {exemple}
- Mots-clés : {liste}

## 7. Intégrations externes

| Besoin | Service | Env var |
|---|---|---|
| Formulaire contact | Formspree | VITE_FORMSPREE_ID |
| Newsletter | Brevo | VITE_BREVO_FORM_ID |
| Analytics | Plausible | VITE_PLAUSIBLE_DOMAIN |
| [Si paiement] | woxx-pay | WOXX_PAY_API_URL, WOXX_PAY_M2M_CLIENT_ID... |

## 8. Variables d'environnement

SITE_NAME={app-slug}

# Intégrations front
VITE_FORMSPREE_ID=
VITE_PLAUSIBLE_DOMAIN=

# [Si woxx-pay]
WOXX_PAY_API_URL=http://woxx-pay-api:8000
WOXX_PAY_M2M_CLIENT_ID=
WOXX_PAY_M2M_CLIENT_SECRET=
WOXX_PAY_PUBLIC_KEY=

## 9. Structure de fichiers cible

{app-name}/
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── routes.ts
│   │   ├── pages/
│   │   ├── components/
│   │   ├── content/
│   │   └── lib/
│   ├── vite.config.ts    ← base: './' obligatoire
│   └── Dockerfile
├── [N3] backend/
│   ├── src/
│   ├── prisma/
│   └── Dockerfile
└── nginx/
    └── nginx.conf

## 10. Critères d'acceptation

- [ ] make check passe sans erreur
- [ ] App charge correctement via le proxy woxxapp
- [ ] {critères métier spécifiques}

## 11. Éléments hors périmètre

- {ce qui est explicitement exclu}

## [Si multitenant] 12. Architecture multitenant

- Isolation : toutes les tables métier ont `tenant_id uuid NOT NULL`
- Le proxy woxxapp injecte le header `X-Tenant-ID` à chaque requête
- Enregistrement : `catalog_applications`
- Chaque client active l'app depuis son contexte WoxxApp

## [Si woxx-pay] 13. Flux de paiement

- Backend appelle `POST /v1/checkouts` sur woxx-pay avec JWT M2M
- Frontend redirige vers le `checkout_url` retourné
- Callback webhook signé Ed25519 reçu sur `POST /webhooks/woxx-pay`
```

---

## Étape 3 — Gate niveau (obligatoire)

| Question | Réponse → Niveau |
|---|---|
| Le client doit-il éditer le contenu lui-même ? | Oui → N2 |
| Y a-t-il de la logique métier custom non couvrable par un service tiers ? | Oui → N3 |
| Sinon | N1 (défaut) |

> ⚠️ **Si N3 est proposé** : afficher ce message et attendre la réponse :
> ```
> ⚠️ Passage N3 proposé.
> Justification : « [citation du besoin] »
> Alternatives externes écartées : [liste]
> Valider le passage en N3 ? (oui/non)
> ```

---

## Étape 4 — Détection woxx-pay

Si le besoin mentionne : *paiement, payer, acheter, panier, checkout, abonnement, commande, facture*
→ intégration woxx-pay requise : ajouter section 13 + `woxx-pay: oui` dans les métadonnées.

**Rappel absolu** : jamais de SDK Stripe directement dans l'app. Tout passe par woxx-pay.

---

## Étape 5 — Validation de la spec

Écrire `docs/spec.md` puis **relire avec le développeur** et cocher :

- [ ] Slug unique, kebab-case
- [ ] Type d'app clairement défini (indépendante / multitenant)
- [ ] Niveau N1/N2/N3 justifié par une citation du besoin
- [ ] Intégrations mappées vers le catalogue (pas de services inventés)
- [ ] woxx-pay : oui | non confirmé
- [ ] Critères d'acceptation vérifiables
- [ ] Éléments hors périmètre listés

> ✅ **Gate obligatoire** : Ne pas passer à `woxxapp-plan` sans la validation humaine de cette spec.

---

## Références

- `content/niveaux.md` — règles N1/N2/N3
- `content/restrictions-proxy.md` — contraintes techniques du proxy
- `content/integrations-externes.md` — catalogue des services tiers autorisés
- `content/deploiement-docker.md` — pattern Docker et enregistrement woxxapp
- **Skill suivant** : `woxxapp-plan` → générer le plan d'implémentation
