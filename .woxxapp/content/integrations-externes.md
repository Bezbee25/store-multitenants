# Intégrations externes WoxxApp

Catalogue des services tiers recommandés. Principe : **toujours privilégier une intégration externe à du code custom**. Avant d'écrire la moindre logique back-end, vérifier qu'aucune option ci-dessous ne couvre le besoin.

## Sommaire

- [Formulaires](#formulaires)
- [Newsletter](#newsletter)
- [Réservation / scheduling](#réservation--scheduling)
- [CMS headless (N2)](#cms-headless-n2)
- [Paiement](#paiement)
- [Analytics](#analytics)
- [Cartes](#cartes)

---

## Formulaires

Les formulaires de contact, devis, inscription, etc. passent toujours par un service tiers. Pas de POST vers un endpoint maison (sauf N3 validé).

### Formspree

Recommandé par défaut. Plan gratuit : 50 soumissions/mois.

**Setup HTML** :

```html
<form action="https://formspree.io/f/{form_id}" method="POST">
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>

  <!-- anti-spam -->
  <input type="text" name="_gotcha" style="display:none" />

  <!-- redirection après envoi -->
  <input type="hidden" name="_next" value="#/merci" />

  <button type="submit">Envoyer</button>
</form>
```

**Setup React (avec fetch)** :

```tsx
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const form = e.currentTarget
  const formData = new FormData(form)
  await fetch('https://formspree.io/f/' + import.meta.env.VITE_FORMSPREE_ID, {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' },
  })
  window.location.hash = '#/merci'
}
```

**Env vars** : `VITE_FORMSPREE_ID`

**Fallback** : si pas de réseau (mode dev offline), logger les données et afficher un message « réessayez plus tard ». Ne jamais crasher.

### Tally

Pour formulaires longs, sondages, multi-step. Plan gratuit généreux.

**Setup** (embed) :

```html
<div data-tally-source="https://tally.so/embed/{form_id}"></div>
<script async src="https://tally.so/widgets/embed.js"></script>
```

Ou popup :

```tsx
<button onClick={() => window.open(`https://tally.so/r/${import.meta.env.VITE_TALLY_ID}`, '_blank')}>
  Ouvrir le formulaire
</button>
```

**Env vars** : `VITE_TALLY_ID`

### Planeup

Pour formulaires liés à la gestion client (CRM léger). À privilégier si le client est déjà sur Planeup pour son activité.

Setup similaire à Formspree, URL d'action fournie par Planeup dans l'interface d'admin.

**Env vars** : `VITE_PLANEUP_ENDPOINT`

---

## Newsletter

### Mailchimp

Standard de l'industrie. Plan gratuit : 500 contacts.

**Embed** :

```html
<form action="https://{user}.list-manage.com/subscribe/post?u={user_id}&amp;id={list_id}" method="POST" novalidate>
  <input type="email" name="EMAIL" placeholder="Votre email" required />
  <input type="text" name="b_{user_id}_{list_id}" tabindex="-1" value="" style="display:none" />
  <button type="submit">S'inscrire</button>
</form>
```

**Env vars** : `VITE_MAILCHIMP_USER`, `VITE_MAILCHIMP_LIST_ID`

### Brevo (ex-Sendinblue)

Alternative FR. Plan gratuit : 300 emails/jour. Préférer pour les clients FR soucieux de souveraineté.

```html
<form action="https://sibforms.com/serve/{form_id}" method="POST">
  <input type="email" name="EMAIL" required />
  <button type="submit">S'inscrire</button>
</form>
```

**Env vars** : `VITE_BREVO_FORM_ID`

### ConvertKit

Pour créateurs de contenu / blog. Plan gratuit : 10000 emails/mois.

```html
<form action="https://app.convertkit.com/forms/{form_id}/subscriptions" method="POST">
  <input type="email" name="email_address" required />
  <button type="submit">S'inscrire</button>
</form>
```

**Env vars** : `VITE_CONVERTKIT_FORM_ID`

---

## Réservation / scheduling

### Calendly

Standard. Plan gratuit : 1 type d'événement.

```html
<div class="calendly-inline-widget" data-url="https://calendly.com/{user}/{event}" style="min-width:320px;height:630px;"></div>
<script src="https://assets.calendly.com/assets/external/widget.js" async></script>
```

Ou popup :

```tsx
<a href={`https://calendly.com/${import.meta.env.VITE_CALENDLY_USER}/${import.meta.env.VITE_CALENDLY_EVENT}`}>
  Réserver un créneau
</a>
```

**Env vars** : `VITE_CALENDLY_USER`, `VITE_CALENDLY_EVENT`

### Cal.com

Alternative open-source, self-hostable. Plan cloud gratuit.

```html
<iframe src="https://cal.com/{user}/{event}" style="width:100%;height:630px;border:0"></iframe>
```

**Env vars** : `VITE_CALCOM_USER`, `VITE_CALCOM_EVENT`

---

## CMS headless (N2)

Voir `niveaux.md` pour la gate N2. Trois options, par ordre de préférence :

### Decap CMS

Pour contenu Markdown simple, occasionnel. Le contenu vit dans Git. Zéro coût.

```
public/admin/
├── index.html
└── config.yml
```

```yaml
# public/admin/config.yml
backend:
  name: github
  repo: {org}/{repo}
  branch: main
collections:
  - name: "posts"
    label: "Articles"
    folder: "src/content/posts"
    create: true
    fields:
      - { label: "Titre", name: "title", widget: "string" }
      - { label: "Date", name: "date", widget: "datetime" }
      - { label: "Corps", name: "body", widget: "markdown" }
```

Le client accède à `/admin/` (mappé à `public/admin/index.html`), s'authentifie via GitHub, édite, le contenu part en PR.

### TinaCMS

Pour visual editing. Contenu dans Git + overlay visuel. Plan gratuit jusqu'à 2 users.

```bash
npx @tinacms/cli@latest init
```

### Sanity

Pour contenu volumineux, multi-langue, types complexes. Studio hosted par Sanity.

```ts
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: true,
  token: import.meta.env.VITE_SANITY_API_TOKEN,
})

const posts = await client.fetch(`*[_type == "post"]{ title, slug, body }`)
```

**Env vars** : `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`, `VITE_SANITY_API_TOKEN`

---

## Paiement

**Ne jamais intégrer un paiement directement dans l'app.**

Pas de Stripe.js inline, pas de Stripe Checkout, pas de Shopify Storefront API, pas de PayPal SDK, pas de Mollie. Toujours un **lien externe** vers une page de paiement hébergée.

### Pourquoi

- **Coût** : une intégration inline demande gestion des webhooks, idempotence, retries, tests, monitoring. Charge de maintenance significative.
- **Complexité** : chaque edge case (3DS, remboursements, litiges, taxes par pays) est à coder.
- **RGPD / PCI-DSS** : héberger le formulaire de paiement expose le client à des audits de conformité. Un lien externe déplace cette responsabilité vers le processeur.
- **Sécurité** : aucune carte ne transite par nos serveurs, aucun token à stocker.

### Patterns autorisés

- Lien vers une **Stripe Payment Link** : `https://buy.stripe.com/{link_id}` (généré dans le dashboard Stripe).
- Lien vers une **boutique Shopify** : `https://{shop}.myshopify.com/products/{slug}` ou `https://{shop}.com/products/{slug}`.
- Lien vers un **panier Shopify** : `https://{shop}.com/cart/{variant_id}:1`.

### Setup (simple lien)

```tsx
<a
  href={`https://buy.stripe.com/${import.meta.env.VITE_STRIPE_PRICE_LINK}`}
  className="button-primary"
>
  Acheter
</a>
```

**Env vars** : `VITE_STRIPE_PRICE_LINK` ou `VITE_SHOPIFY_PRODUCT_URL`

### Cas d'exception

Si le client demande une expérience « panier sur place » ou des paiements récurrents complexes (abonnements avec grille, essais gratuits, coupons dynamiques), c'est un signal N3. Demander validation humaine (cf. `niveaux.md`). Encore une fois : privilégier d'abord une boutique Shopify ou un Stripe Payment Link avec plusieurs quantités configurées.

---

## Analytics

Toujours **privacy-first**. Pas de Google Analytics (RGPD lourd, bannière de consentement obligatoire, script volumineux).

### Plausible

Self-hostable ou SaaS. Pas de cookies, pas de bannière RGPD requise (selon la CNIL, sous conditions).

```html
<script defer data-domain="{domain}" src="https://plausible.io/js/script.js"></script>
```

Ou en self-hosted :

```html
<script defer data-domain="{domain}" src="https://analytics.woxxapp.de/js/script.js"></script>
```

**Env vars** : `VITE_PLAUSIBLE_DOMAIN`, `VITE_PLAUSIBLE_SRC` (optionnel)

### Fathom

Alternative commerciale, simple. Plan à partir de 9$/mois.

```html
<script src="https://cdn.usefathom.com/script.js" data-site="{site_id}" defer></script>
```

**Env vars** : `VITE_FATHOM_SITE_ID`

---

## Cartes

Éviter Google Maps (coût, RGPD). Préférer :

### MapLibre

Open-source, gratuit, basé sur OpenStreetMap.

```tsx
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

useEffect(() => {
  const map = new maplibregl.Map({
    container: mapRef.current!,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [lng, lat],
    zoom: 12,
  })
  new maplibregl.Marker().setLngLat([lng, lat]).addTo(map)
  return () => map.remove()
}, [])
```

Tiles : utiliser un provider gratuit (OpenStreetMap raster, Stadia Maps free tier) ou self-hosted.

**Env vars** : `VITE_MAPTILER_KEY` (optionnel, pour tiles stylées)

### OpenStreetMap embed

Pour afficher un point fixe sans interaction, le plus simple :

```html
<iframe
  src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
  style="width:100%;height:400px;border:0"
/>
```

Aucune dépendance, aucun coût, aucune key.

---

## Checklist intégrations

Avant de commit une intégration :

- [ ] URL endpoint / form ID en **variable d'environnement** (`VITE_*`), pas hardcodée
- [ ] Variable documentée dans `.env.example` avec commentaire
- [ ] Fallback si service indisponible (loader, message d'erreur, pas de crash)
- [ ] Lien `target="_blank"` + `rel="noopener noreferrer"` pour sorties de domaine
- [ ] Testé en local avec `npm run dev`
- [ ] Testé après build (`make build && make start`) — certains services valident l'origin
