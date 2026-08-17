# Checklist de livraison WoxxApp

À exécuter **intégralement** avant de déclarer un site « done ». Toute case non cochée = blocage.

## Conformité proxy

- [ ] `make check` passe sans erreur (vérifications `scripts/check-conformite.sh`)
- [ ] `base: './'` présent dans `vite.config.ts`
- [ ] `createHashRouter` utilisé, aucun `BrowserRouter` dans `src/`
- [ ] Aucun `navigator.serviceWorker.register` dans `src/` (sauf template PWA + conditionnel)
- [ ] Aucun chemin absolu `/assets`, `/sw.js`, `/manifest.webmanifest` dans `src/` ni dans `index.html`
- [ ] `dist/index.html` ne contient pas de chemins absolus : `grep -E '(src|href)="/' dist/index.html` retourne vide

## Build

- [ ] `make build` réussit (build Docker complet, sans warning bloquant)
- [ ] `npm run build` réussit en local sans erreur TypeScript
- [ ] `npm run build` réussit sans erreur ESLint (warnings acceptés)
- [ ] Image Docker buildée : `docker images | grep ${SITE_NAME}-site` retourne une ligne
- [ ] `make start` démarre sans erreur

## Formulaires & intégrations

- [ ] Chaque formulaire est testé avec une soumission réelle (Formspree/Tally/Planeup)
- [ ] Si pas de réseau en dev : mock soumis avec succès (formulaire simulé qui affiche confirmation)
- [ ] Redirection ou message de confirmation fonctionnel après submit
- [ ] Variable d'environnement de chaque intégration listée dans `.env.example`
- [ ] `.env.example` a une valeur commentée ou placeholder, jamais une vraie clé

## Responsive

- [ ] Test viewport 375px (Chrome devtools iPhone SE)
- [ ] Test viewport 768px (iPad portrait)
- [ ] Test viewport 1280px (desktop)
- [ ] Test viewport 1920px (desktop large)
- [ ] Pas de scroll horizontal involontaire à 375px
- [ ] Pas d'élément chevauchant à 375px
- [ ] Toutes les `touch targets` font au moins 44x44px (`a`, `button`)

## Performance

- [ ] Lighthouse > 80 en Performance
- [ ] Lighthouse > 80 en Accessibility
- [ ] Lighthouse > 90 en Best Practices
- [ ] Lighthouse > 90 en SEO
- [ ] Images optimisées (WebP / AVIF pour photos, SVG pour logos/icônes)
- [ ] Pas d'image > 200 ko en first load
- [ ] Polices préchargées (`<link rel="preload">` pour les woff2 critiques)
- [ ] Bundle JS first-load < 200 ko gzippé (sinon code-split)

## SEO & méta

- [ ] `<title>` unique par page, < 60 caractères
- [ ] `<meta name="description">` unique par page, 140-160 caractères
- [ ] `OpenGraph` tags (og:title, og:description, og:image) pour page d'accueil
- [ ] `og:image` fait au moins 1200x630px
- [ ] Favicon présent en SVG + PNG 32x32 + PNG 180x180 (apple-touch-icon)
- [ ] Sitemap.xml généré (ou page unique si single-page) — pour SPA hash, déclarer juste `/`
- [ ] `robots.txt` présent (permissive pour site public)
- [ ] `lang` attribute sur `<html>` (ex: `<html lang="fr">`)
- [ ] URLs canoniques (`<link rel="canonical">`) si doublons possibles

## Légal & contenu

- [ ] Mentions légales présentes (page `#/mentions-legales`)
- [ ] Politique de confidentialité présente si collecte de données (form, analytics, newsletter)
- [ ] Bannière cookies **non requise** si utilisation exclusive de Plausible/Fathom sans cookies
- [ ] CGV / CGU présentes si vente (lien vers boutique externe OK)
- [ ] Coordonnées de contact visibles (email et/ou téléphone et/ou adresse)
- [ ] Numéro SIRET / RCS si activité commerciale (vérifier avec le client)
- [ ] Droits d'auteur images vérifiés (licences, sources documentées)

## Accessibilité

- [ ] Tous les éléments interactifs sont atteignables au clavier (Tab)
- [ ] Focus visible (outline non supprimé sans remplacement)
- [ ] Tous les `<img>` ont un `alt` descriptif (ou `alt=""` si décoratif)
- [ ] Tous les `<button>` ont un libellé texte ou `aria-label`
- [ ] Contrastes WCAG AA (4.5:1 texte normal, 3:1 texte large)
- [ ] Hiérarchie de titres `<h1>` → `<h2>` → `<h3>` cohérente
- [ ] Pas de `<div onClick>` ; utiliser `<button>`

## Code & propreté

- [ ] Pas de `console.log` en production (grep `console.log src/` doit être vide)
- [ ] Pas de `TODO` / `FIXME` / `XXX` non résolus (grep ou accepter et documenter)
- [ ] Pas de `eslint-disable` sans justification en commentaire
- [ ] Pas de code commenté en bloc (mort)
- [ ] Pas de secret en dur (clé API, token) — grep pour `sk_`, `pk_`, `Bearer `, `password`
- [ ] Pas d'URL `http://` hardcodée (sauf `localhost` en dev commenté) — HTTPS-ready
- [ ] `.gitignore` exclut `.env`, `node_modules/`, `dist/`, `.DS_Store`

## Sécurité OWASP — cf. `securite-owasp.md`

- [ ] Aucune entrée utilisateur interpolée dans SQL/shell/HTML
- [ ] Tous les payloads entrants validés par Zod/Valibot côté backend (N3)
- [ ] Aucun `dangerouslySetInnerHTML` / `innerHTML =` sans DOMPurify (grep doit être vide ou justifié)
- [ ] CSP stricte présente dans `nginx.conf` (`default-src 'self'` minimum)
- [ ] HSTS présent (`Strict-Transport-Security: max-age=31536000; includeSubDomains`)
- [ ] `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` présents
- [ ] Aucun secret en dur dans `src/` (pattern `sk_live_`, `AKIA`, `ghp_`, PEM private key)
- [ ] Aucun token (jwt/auth/api_key/refresh) en `localStorage` / `sessionStorage`
- [ ] Cookies de session avec `HttpOnly; Secure; SameSite=Strict` (N3 auth)
- [ ] Routes API protégées vérifient l'autorisation côté backend (RBAC + IDOR) (N3)
- [ ] Rate-limiting sur login/register/password-reset/paiement/envoi mail (N3)
- [ ] Erreurs 500 renvoient un message générique sans stack trace ni SQL error
- [ ] `npm audit` ne signale pas de `critical`/`high` non patché (ou décision documentée)
- [ ] Aucun `eval()`, `new Function()`, `child_process.exec()` avec entrée utilisateur

## Documentation projet

- [ ] `README.md` documente : `npm install`, `npm run dev`, `make build`, `make start`
- [ ] `.env.example` liste toutes les variables attendues avec commentaires
- [ ] Variables obligatoires vs optionnelles distinguées dans `.env.example`
- [ ] Page d'administration (si Decap/TinaCMS/Sanity) documentée dans `README.md`

## Déploiement

- [ ] `make check` vert
- [ ] `make build` vert
- [ ] `make start` vert
- [ ] Container `http://${SITE_NAME}-site` répond 200 sur `/`
- [ ] URL interne `http://${SITE_NAME}-site` enregistrée dans la table `applications` de `woxxapp-core` (colonne `internalUrl`) et associée au contexte via `context_applications`
- [ ] Test navigateur : `https://store.woxxapp.de/{contextSlug}/{appSlug}/` charge correctement
- [ ] Pas de mixed content (HTTPS → HTTP) dans la console
- [ ] Pas d'erreur 404 dans la console au first load

## Après livraison

- [ ] Variables d'environnement production déployées (si Secret Manager)
- [ ] Webhook CMS → rebuild documenté si N2
- [ ] Backup DB configuré si N3
- [ ] Monitoring uptime (UptimeRobot, BetterStack) pointé sur l'URL publique
- [ ] Logs d'erreur tracking (Sentry / Plausible) branché si besoin

---

## Commandes utiles pour la checklist

```bash
# Chemins absolus dans dist/
grep -E '(src|href)="/' dist/index.html

# console.log oubliés
grep -rn "console\.log" src/

# TODO / FIXME
grep -rn -E "(TODO|FIXME|XXX)" src/

# Secrets potentiels
grep -rnE "(sk_|pk_|Bearer\s|password\s*=)" src/

# BrowserRouter interdit
grep -rn "BrowserRouter" src/

# Service Worker register interdit
grep -rn "navigator\.serviceWorker\.register" src/

# Liens http:// hardcodés
grep -rnE "https?://(localhost|127\.0\.0\.1)" src/
```

Si toutes les cases ci-dessus sont cochées, le site est conforme pour livraison WoxxApp. Sinon, corriger avant d'annoncer « done ».
