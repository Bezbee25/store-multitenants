# Plan d'implémentation — Woxx Store Multitenants

Spec : `docs/spec.md` | Type : multitenant | Niveau : N3 | woxx-pay : oui

---

## Progression des Tâches

| ID | Tâche | Statut |
|---|---|---|
| **T01** | Initialiser les 2 dépôts Git (`store-multitenants` et `store-multitenants-docker`) | ✅ |
| **T02** | Configurer l'arborescence globale (Frontend, Backend Fastify, Nginx, Makefile) | ✅ |
| **T03** | [N3] Backend Fastify : Setup base de données PostgreSQL + Schéma Prisma complet | ✅ |
| **T04** | [N3] Backend Fastify : Seed Prisma (Presets thématiques, Super-Admin, Tenant démo) | ✅ |
| **T05** | [N3] Backend Fastify : Middleware de résolution du sous-domaine / Tenant (`X-Tenant-Slug`) | ✅ |
| **T06** | [N3] Backend Fastify : Authentification & Sécurité (Google OAuth, Email/Password, JWT, Rôles) | ✅ |
| **T07** | [N3] Backend Fastify : Moteur de créneaux Click & Collect & Jauges max par tranche | ✅ |
| **T08** | [N3] Backend Fastify : Service SMTP Global & Envoi d'emails transactionnels | ✅ |
| **T09** | [SI woxx-pay] Backend Fastify : Intégration WoxxPay (Client M2M & Webhooks Ed25519) | ✅ |
| **T10** | [N3] Backend Fastify : API Espace Gérant (Kanban temps réel, Produits/Stock, CMS, Horaires) | ✅ |
| **T11** | [N3] Backend Fastify : API Espace Super-Admin (Gestion des Tenants, Monitoring, SMTP global) | ✅ |
| **T12** | Frontend Vite : Initialisation React 18 + TypeScript + `createHashRouter` + Tailwind CSS | ✅ |
| **T13** | Frontend : Système de thèmes dynamiques et Presets métiers (Burger, Kebab, Fleuriste, Bijou...) | ✅ |
| **T14** | Frontend : Pages Vitrine & Boutique / Catalogue produits (Filtres, Recherche, Panier) | ✅ |
| **T15** | Frontend : Tunnel Click & Collect (Sélecteur de créneau, Option paiement en ligne vs sur place) | ✅ |
| **T16** | Frontend : Espace Client (Connexion, Inscription avec téléphone, Suivi commande direct) | ✅ |
| **T17** | Frontend : Espace Gérant — Kanban interactif des commandes (Gestion statuts, minuterie) | ✅ |
| **T18** | Frontend : Espace Gérant — Gestion des Produits, Stocks, Plages d'ouverture & Quotas | ✅ |
| **T19** | Frontend : Espace Gérant — Éditeur CMS (Images de fond, Couleurs, Textes) | ✅ |
| **T20** | Frontend : Espace Gérant — Page de Documentation WoxxPay / Stripe détaillée et interactive | ✅ |
| **T21** | Frontend : Espace Super-Admin — Dashboard tous tenants, Provisioning sous-domaine, SMTP | ✅ |
| **T22** | Routage Nginx & Multi-Tenant (Configuration Nginx avec proxy API et fallback 404) | ✅ |
| **T23** | CI/CD GitHub Actions (`.github/workflows/docker-publish.yml`) | ✅ |
| **T24** | Repo Déploiement `store-multitenants-docker` (`docker-compose.yml`, Makefile, `.env.example`) | ✅ |
| **T25** | Gate de conformité globale (`make check`, tests, audit sécurité OWASP) | ✅ |
