# Sécurité — Règles OWASP obligatoires

Ces règles s'appliquent à **tous les niveaux** (N1/N2/N3) et à **tous les types** (site web, PWA, back-end).
Toute violation doit être signalée à l'utilisateur avant d'être corrigée, et toute demande contraire doit être refusée avec proposition d'alternative sécurisée.

L'objectif est de couvrir au moins 90% des vulnérabilités courantes dès la phase de génération du code.

---

## 1. Injections & bases de données (SQL / NoSQL / Command Injection)

### Règles

- **Zero Raw Query** : interdiction stricte de concaténer ou d'interpoler des variables utilisateur dans des requêtes SQL, NoSQL ou commandes système.
- **Paramétrage** : utiliser 100% de requêtes préparées ou un ORM/Query Builder typé (Prisma, Drizzle, SQLAlchemy, Kysely).
- **Validation des entrées** : valider et typer tout payload entrant côté backend avec Zod, Valibot, Pydantic ou DTOs équivalents. Ne jamais faire confiance à `req.body` brut.
- **Shell** : interdiction d'utiliser `eval()`, `new Function()`, `child_process.exec()`, `execSync()` avec une entrée utilisateur. Si un appel système est inévitable, utiliser `execFile()` avec des arguments tableau (pas de shell).

### Application par niveau

- **N1 (statique)** : pas de backend, règle moins exposée. Mais valider côté formulaire que les données ont un format attendu (email, téléphone) avant envoi à Formspree/Tally.
- **N2 (CMS headless)** : si un webhook Sanity/Decap reçoit des données, valider la signature HMAC et le schéma du payload avant traitement.
- **N3 (back-end dédié)** : 100% requêtes paramétrées via Drizzle/Prisma. Validation Zod sur chaque handler Fastify/Express. Schema Fastify `schema.body` obligatoire.

---

## 2. Failles XSS (Cross-Site Scripting) & sécurité PWA/Web

### Règles

- **Échappement & sanitization** : échapper automatiquement toutes les sorties HTML/JS. React échappe par défaut — ne JAMAIS utiliser `dangerouslySetInnerHTML` avec du contenu non sanitized.
- **Sanitizer** : si du HTML riche doit être affiché (CMS, markdown), utiliser DOMPurify côté client et/ou `sanitize-html` côté serveur. Configurer une allow-list stricte (balises, attributs, protocoles).
- **CSP stricte** : tout site livré doit inclure une en-tête `Content-Security-Policy: default-src 'self'; ...` dans nginx.conf. Voir template nginx.conf du projet.
- **Service Workers (PWA)** : interdiction d'évaluer du code dynamique dans le Service Worker (`eval`, import dynamique de strings, `new Function`). Le SW ne doit charger que des scripts statiques bundlelés par Vite/Workbox.
- **CacheStorage** : ne JAMAIS stocker tokens d'auth, clés API, données personnelles identifiantes dans `caches.open()` ou `localStorage`. Le cache SW est réservé aux assets statiques (JS, CSS, images, polices).
- **URLs** : valider les URLs saisies par l'utilisateur (formulaire contact, liens CMS) contre une allow-list de protocoles (`http:`, `https:`, `mailto:`). Refuser `javascript:`, `data:` hors images.

### Application par niveau

- **N1** : CSP stricte dans nginx.conf. React échappe tout par défaut. Si intégration Tally/Formspree via iframe, s'assurer que le domaine est dans `frame-src`.
- **N2** : tout contenu CMS doit passer par DOMPurify avant rendu. Si markdown, utiliser `react-markdown` avec `rehype-sanitize`.
- **N3** : idem N2 + valider les URLs des webhooks entrants.

---

## 3. Gestion des secrets & authentification (CSRF / Session Hijacking)

### Règles

- **Zero secret en dur** : aucun mot de passe, clé API, token JWT, certificat privé ne doit apparaître en dur dans le code, les commentaires, ou les commits. Utiliser `process.env` côté serveur et `import.meta.env.VITE_*` côté client (préfixe `VITE_` uniquement pour les valeurs non sensibles).
- **Stockage client** : ne JAMAIS placer de JWT, token d'accès, refresh token, ou clé API dans `localStorage` ou `sessionStorage`. Ces stores sont accessibles à tout script tiers (XSS = fuite immédiate).
- **Cookies sécurisés** : pour les sessions Web/PWA, utiliser exclusivement des cookies avec `HttpOnly; Secure; SameSite=Strict; Path=/`. HttpOnly empêche l'accès JS, Secure force HTTPS, SameSite=Strict bloque CSRF.
- **Mobile & coffre-fort matériel** : pour applications mobiles, utiliser Android Keystore / iOS Keychain via `expo-secure-store` (React Native) ou `flutter_secure_storage` (Flutter). Jamais SharedPreferences ou UserDefaults pour des tokens.
- **.env.example** : lister toutes les variables attendues, sans valeurs réelles. Le fichier `.env` réel ne doit jamais être commité (vérifier `.gitignore`).
- **MFA** : si auth (N3 uniquement), proposer MFA TOTP (`otplib` ou équivalent). Ne pas inventer de schéma maison.

### Application par niveau

- **N1** : aucune secret côté serveur. Les clés Formspree/Tally/Plausible sont publiques par design (frontend). Pas de localStorage. CSP bloque les exfiltrations.
- **N2** : si le client admin CMS s'authentifie (Sanity Studio, Decap), c'est géré par le CMS lui-même — ne pas réinventer. Les tokens CMS (preview, webhook signing) vivent en variables d'environnement serveur.
- **N3** : JWT en cookie HttpOnly. Refresh token en cookie séparé `Secure; HttpOnly; SameSite=Strict; Path=/auth/refresh`. Rotation du refresh à chaque usage. Blacklist en DB pour les sessions révoquées.

---

## 4. Contrôle d'accès & infrastructure

### Règles

- **Moindre privilège** : vérifier l'autorisation et le rôle de l'utilisateur (RBAC) côté serveur pour chaque route d'API protégée. Ne jamais se fier uniquement au front-end pour cacher un bouton ou une page.
- **IDOR** : toute route `/api/resources/:id` doit vérifier que l'utilisateur authentifié possède la ressource (ownership) ou a un rôle admin. Ne jamais faire confiance à un ID client sans vérification.
- **Rate-limiting** : ajouter un middleware de limitation de débit sur toutes les routes sensibles (login, register, reset password, paiement, envoi mail). Ex : `@fastify/rate-limit` 5 req/min sur `/auth/login`.
- **Erreurs** : ne jamais renvoyer de stack traces brutes, SQL errors, ou détails d'infrastructure aux clients sur les erreurs 500. Logger côté serveur (structuré), renvoyer un message générique au client.
- **Dépendances** : `npm audit` en CI. Refuser les vulnérabilités `critical` et `high`. Si patch impossible, documenter la décision.
- **HTTPS-only** : tout site livré doit forcer HTTPS (redirection 301 nginx, HSTS header `Strict-Transport-Security: max-age=31536000; includeSubDomains`).
- **Headers de sécurité** : nginx.conf doit inclure `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (ou CSP `frame-ancestors`), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: ()` restrictive.

### Application par niveau

- **N1** : rate-limiting côté Formspree/Tally (leur responsabilité). Headers de sécurité obligatoires dans nginx.conf. HSTS obligatoire.
- **N2** : idem N1 + rate-limiting sur les webhooks Sanity/Decap (vérification signature + throttle).
- **N3** : full middleware d'auth, rate-limiting sur toutes les routes sensibles, RBAC, IDOR checks, logs structurés sans données sensibles.

---

## Checklist d'auto-vérification (avant chaque commit)

Répondre mentalement à chaque point. Si un "non" apparaît, corriger avant de livrer.

1. Aucune entrée utilisateur n'est interpolée dans SQL/shell/HTML ?
2. Tous les payloads entrants sont validés par un schéma (Zod/Valibot) ?
3. Aucun `dangerouslySetInnerHTML`/`v-html`/`innerHTML =` sans sanitization DOMPurify ?
4. CSP stricte est présente dans nginx.conf ?
5. Aucun secret en dur dans le code ou les commits ?
6. Aucun token dans `localStorage`/`sessionStorage` ?
7. Cookies de session ont `HttpOnly; Secure; SameSite=Strict` ?
8. Toute route serveur protégée vérifie l'autorisation côté backend ?
9. Rate-limiting présent sur login/register/password-reset ?
10. Erreurs 500 renvoient un message générique sans stack trace ?
11. `npm audit` ne signale pas de critical/high non patché ?
12. HTTPS forcé + HSTS + headers de sécurité présents ?

## Si l'utilisateur demande quelque chose qui viole ces règles

Refuser poliment, expliquer le risque en 1-2 phrases, et proposer l'alternative sécurisée. Exemples :

- "Stocke le JWT dans localStorage pour simplifier" → refuser : XSS = fuite immédiate. Alternative : cookie HttpOnly.
- "Désactive la CSP, elle bloque mon script tiers" → refuser. Alternative : ajouter le domaine à `script-src` avec justification.
- "Écris la requête SQL directement pour gagner du temps" → refuser. Alternative : Drizzle/Prisma paramétré.

La sécurité n'est pas négociable. Si la demande est structurellement incompatible avec ces règles, escalader vers l'utilisateur avec un autre schéma (souvent N1 ou N2) qui satisfait le besoin sans compromis.
