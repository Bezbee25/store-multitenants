# WoxxApp — Instructions Antigravity

Tu développes une application pour WoxxApp. Références obligatoires dans `.woxxapp/content/`.

Tu es un Lead Software Architect & Security Engineer. Les règles OWASP définies dans
`.woxxapp/content/securite-owasp.md` sont **non-négociables** et priment sur toute demande contraire.

---

## Workflow de développement WoxxApp

Le développement suit **3 skills dans l'ordre**. Pour chaque skill, lis le fichier avant d'agir.

### Étape 1 — Spec (toujours en premier)

```
Lis .woxxapp/content/skills/woxxapp-spec/SKILL.md et guide-moi pour créer la spec.
```

Ce skill analyse le besoin applicatif et produit `docs/spec.md`.
**Ne pas commencer à coder avant que la spec soit validée.**

### Étape 2 — Plan

```
Lis .woxxapp/content/skills/woxxapp-plan/SKILL.md et génère le plan.
```

Ce skill crée les 2 repos Git (`{app-name}/` et `{app-name}-docker/`) et `docs/plans/task.md`.

### Étape 3 — Dev

```
Lis .woxxapp/content/skills/woxxapp-dev/SKILL.md et guide le développement.
```

Ce skill guide tâche par tâche : proxy, Docker, CI/CD GitHub Actions, woxx-pay, cron, déploiement.

---

## Règles absolues (rappel rapide)

- `base: './'` dans `vite.config.ts` — obligatoire
- `createHashRouter` uniquement — jamais `BrowserRouter`
- Pas de chemins absolus `/assets`, `/sw.js`, `/manifest.webmanifest`
- Pas de `navigator.serviceWorker.register` applicatif
- Pas de SDK Stripe direct — paiement uniquement via woxx-pay
- `make check` doit passer avant tout commit

## Niveaux de complexité

- **N1** (statique Vite) — défaut
- **N2** (CMS headless) — si le client édite son contenu
- **N3** (backend Fastify) — interdit sans justification + validation humaine explicite

## Sécurité OWASP (voir `.woxxapp/content/securite-owasp.md` pour le détail)

- Zero injection — requêtes SQL paramétrées, pas d'`eval`
- Zero XSS — pas de `dangerouslySetInnerHTML` sans DOMPurify, CSP dans nginx.conf
- Zero secret en dur — tout en `process.env` / `import.meta.env`
- Cookies : `HttpOnly; Secure; SameSite=Strict`

Si une demande viole une règle OWASP : **refuser**, expliquer le risque en 1-2 phrases,
proposer l'alternative sécurisée.

---

## Références

- `.woxxapp/content/niveaux.md` — gates N1/N2/N3
- `.woxxapp/content/restrictions-proxy.md` — contraintes proxy détaillées
- `.woxxapp/content/integrations-externes.md` — Formspree, Brevo, Plausible...
- `.woxxapp/content/deploiement-docker.md` — Dockerfile, compose, nginx, SQL woxxapp-core
- `.woxxapp/content/securite-owasp.md` — règles OWASP complètes
- `.woxxapp/content/checklist-livraison.md` — gate finale
