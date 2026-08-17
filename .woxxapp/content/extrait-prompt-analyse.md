# Extrait du prompt d'analyse — section 12

Le prompt d'analyse woxxapp (`backend/src/lib/ai-prompts.ts`, fonction `buildAnalysisPrompt`) génère pour chaque projet un rapport commercial complet en 13 sections. La **section 12** est celle qui nous intéresse : elle produit un **prompt directement utilisable par Claude Code ou Codex** pour développer le site.

Le skill `woxxapp-site` reçoit en entrée le texte de cette section 12 (collé par le dev). Son boulot est de le **parser** et d'agir en conséquence, en appliquant les restrictions et niveaux WoxxApp.

## Format attendu de la section 12

Le prompt d'analyse demande à l'IA génératrice de produire les 11 champs suivants, dans cet ordre :

1. **Objectif du projet**
2. **Stack supposée**
3. **Structure des pages**
4. **Composants à créer**
5. **Contraintes responsive**
6. **Contraintes SEO**
7. **Intégrations externes**
8. **Variables d'environnement**
9. **Structure de fichiers souhaitée**
10. **Critères d'acceptation**
11. **Éléments explicitement exclus**

Le prompt ajoute : *« Le prompt doit demander une réalisation simple, maintenable, sans sur-ingénierie, sans paiement intégré, sans compte utilisateur, sauf demande contraire explicite dans le questionnaire. »*

L'output réel de l'IA génératrice peut varier en format (Markdown, sections numérotées, bullet list, etc.). Le skill doit être tolérant : **chercher des sections par mot-clé**, ne pas exiger un format strict.

## Comment le skill parse chaque champ

### 1. Objectif du projet

**Que chercher** : une section commençant par `Objectif`, `Objectif du projet`, `## Objectif`, etc.

**Comment l'utiliser** : sert de **pitch court** pour orienter toutes les décisions. L'objectif doit rester affiché pendant tout le dev. Si l'IA génératrice mentionne un back-office, un paiement, un compte utilisateur → signal d'alarme (à valider avec la gate N2/N3).

**Exemple** :

> Landing page pour une boulangerie artisanale à Lyon. Objectif : présenter les produits, afficher horaires et adresse, permettre le contact via formulaire. Pas de vente en ligne.

### 2. Stack supposée

**Que chercher** : `Stack`, `Technos`, `Technologies`.

**Comment l'utiliser** : si la stack proposée par l'IA génératrice contredit les règles WoxxApp (Next.js au lieu de Vite, BrowserRouter, paiement intégré), **ignorer la proposition de l'IA et appliquer la stack WoxxApp** (Vite + React 18 + React Router v7 hash + Tailwind). L'IA génératrice peut proposer des technos génériques sans connaître les contraintes proxy.

**Stack par défaut à imposer** (cf. design spec) :

- Vite + React 18 + TypeScript
- React Router v7 (`createHashRouter`)
- Tailwind CSS + Framer Motion
- Lucide React

Monter à N2 ou N3 uniquement si la section 12 justifie clairement un back-office ou un back-end, cf. `niveaux.md`.

### 3. Structure des pages

**Que chercher** : `Pages`, `Structure des pages`, `Arborescence`.

**Comment l'utiliser** : chaque page listée devient une route dans `src/pages/`. Une page = un fichier `.tsx`. La home est toujours `src/pages/Home.tsx`.

Traduire en `routes.ts` :

```ts
// src/routes.ts
import Home from './pages/Home'
import Products from './pages/Products'
import Contact from './pages/Contact'

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/products', element: <Products /> },
  { path: '/contact', element: <Contact /> },
]
```

### 4. Composants à créer

**Que chercher** : `Composants`, `Components`, `Composants à créer`.

**Comment l'utiliser** : chaque composant devient un fichier dans `src/components/`. Le template `site-base` fournit déjà `Hero`, `Section`, `Form` — réutiliser si possible plutôt que de dupliquer.

Convention de nommage WoxxApp : PascalCase, un fichier par composant, suffixe fonctionnel (ex: `ProductCard.tsx`, `NewsletterSignup.tsx`, `ContactMap.tsx`).

### 5. Contraintes responsive

**Que chercher** : `Responsive`, `Mobile`, `Breakpoints`.

**Comment l'utiliser** : mapper vers les breakpoints Tailwind par défaut :

- `sm` = 640px
- `md` = 768px
- `lg` = 1024px
- `xl` = 1280px
- `2xl` = 1536px

Si le prompt demande des breakpoints custom, **les ignorer** et utiliser les breakpoints Tailwind standard. Les contraintes responsive se traduisent en classes Tailwind (`md:grid-cols-2`, `lg:flex-row`).

### 6. Contraintes SEO

**Que chercher** : `SEO`, `Référencement`, `Mots-clés`, `Meta`.

**Comment l'utiliser** : générer pour chaque page un `<title>` et un `<meta description>` uniques. Si l'IA propose des mots-clés, les inclure dans la description et les `<h1>`. **Pas de keyword stuffing**, pas de meta keywords tag (obsolète).

Vérifier la checklist SEO dans `checklist-livraison.md`.

### 7. Intégrations externes

**Que chercher** : `Intégrations`, `Intégrations externes`, `Services`, `Tiers`.

**Comment l'utiliser** : pour chaque intégration mentionnée, vérifier qu'elle est dans le catalogue `integrations-externes.md`. Si oui, suivre le snippet du catalogue. Si non (paiement intégré, compte utilisateur custom, back-end maison), c'est un signal N3 ou un rejet — cf. `niveaux.md`.

**Mapper les besoins communs** :

- Besoin de « formulaire de contact » → Formspree (défaut)
- Besoin de « newsletter » → Mailchimp ou Brevo
- Besoin de « réservation » → Calendly ou Cal.com
- Besoin de « paiement » → **lien externe Stripe / Shopify** (jamais intégré)
- Besoin de « stats » → Plausible (défaut)

### 8. Variables d'environnement

**Que chercher** : `Variables d'environnement`, `Env`, `Configuration`.

**Comment l'utiliser** : pour chaque intégration, une variable `VITE_*` doit exister dans `.env.example` avec un commentaire. Le skill génère le `.env.example` à partir de cette liste croisée avec `integrations-externes.md`.

Convention WoxxApp : préfixer toutes les vars exposées au front avec `VITE_` (requis par Vite). Ne jamais stocker de secret côté front.

### 9. Structure de fichiers souhaitée

**Que chercher** : `Structure de fichiers`, `Arborescence de fichiers`, `Organization`.

**Comment l'utiliser** : si la structure proposée respecte les conventions du template `site-base` (`src/pages/`, `src/components/`, `src/lib/`, `src/content/`), la suivre. Sinon, ignorer et appliquer la structure template.

**Structure imposée par le template** :

```
src/
├── main.tsx
├── routes.ts
├── lib/
│   └── woxxapp-context.tsx
├── components/
├── pages/
├── content/
└── assets/
public/
├── favicon.svg
└── (admin/ si Decap)
```

### 10. Critères d'acceptation

**Que chercher** : `Critères d'acceptation`, `Definition of Done`, `DoD`.

**Comment l'utiliser** : transformer chaque critère en case à cocher dans `checklist-livraison.md`. Le projet n'est pas livrable tant que tous les critères ne sont pas validés.

Exemples typiques :

- « La page d'accueil charge en moins de 2s sur 3G simulée »
- « Le formulaire de contact envoie un email au boulanger »
- « Le plan Google Maps affiche l'adresse de la boulangerie » → **mapper vers OpenStreetMap** (cf. `integrations-externes.md`).

### 11. Éléments explicitement exclus

**Que chercher** : `Exclusions`, `Hors périmètre`, `Éléments exclus`, `Ne pas faire`.

**Comment l'utiliser** : cette liste est **protectrice**. Si le dev ou le client demande plus tard une de ces features, refuser en renvoyant à la section 12 du prompt d'analyse. C'est le contrat de base.

Exemples typiques :

- « Pas de vente en ligne »
- « Pas d'espace membre »
- « Pas de blog » (mais un blog dans un second temps est OK si le client le demande explicitement plus tard)
- « Pas de multi-langue » (mais le contenu peut être en plusieurs langues statiquement)

## Exemple de section 12 (projet fictif : boulangerie)

Voici un exemple typique de section 12 telle que générée par woxxapp, et la façon dont le skill `woxxapp-site` l'interprète.

### Extrait généré

```markdown
# 12. Prompt Claude Code / Codex

## Objectif
Landing page vitrine pour la Boulangerie Dupont (Lyon 6e). Cible : clients de
proximité, particuliers et entreprises pour commandes groupées. Objectif :
présenter le savoir-faire, l'équipe, les horaires, et capter des leads via
formulaire de contact et inscription newsletter.

## Stack supposée
- Vite + React + TypeScript
- Tailwind CSS
- React Router (hash router pour compatibilité proxy WoxxApp)
- Pas de backend. Formulaires via Formspree, newsletter via Brevo.

## Structure des pages
1. Accueil — hero, produits phares, avis clients, CTA contact
2. Produits — grille de produits avec photos, filtre par catégorie
3. Équipe — portraits courts, parcours
4. Contact — adresse, horaires, plan, formulaire
5. Mentions légales — contenu légal

## Composants à créer
- <Hero /> : titre, sous-titre, image, CTA
- <ProductGrid /> : grille de cartes produits
- <ProductCard /> : image, nom, prix, description courte
- <TeamMember /> : photo, nom, rôle, bio courte
- <ContactForm /> : nom, email, message, anti-spam
- <NewsletterSignup /> : email + bouton
- <OpeningHours /> : tableau horaires par jour
- <Map /> : OpenStreetMap embed avec marker

## Contraintes responsive
- Mobile-first
- Grille produits : 1 colonne < 768px, 2 colonnes 768-1024px, 3 colonnes > 1024px
- Hero : image en background mobile, split-screen desktop

## Contraintes SEO
- Mots-clés : boulangerie lyon 6, pain artisanal, viennoiserie, pâtisserie
- Title pages : "Boulangerie Dupont | {page}"
- Description : 150 caractères max, inclure "Lyon 6e"

## Intégrations externes
- Formspree pour formulaire de contact (form ID à configurer)
- Brevo pour newsletter (form ID à configurer)
- OpenStreetMap embed pour la carte (pas de Google Maps)
- Plausible pour analytics (domaine à configurer)

## Variables d'environnement
- VITE_FORMSPREE_ID — ID du formulaire Formspree
- VITE_BREVO_FORM_ID — ID du formulaire Brevo
- VITE_PLAUSIBLE_DOMAIN — domaine Plausible (ex: boulangerie-dupont.woxxapp.de)

## Structure de fichiers souhaitée
src/
  pages/
    Home.tsx
    Products.tsx
    Team.tsx
    Contact.tsx
    LegalNotice.tsx
  components/
    Hero.tsx
    ProductGrid.tsx
    ProductCard.tsx
    TeamMember.tsx
    ContactForm.tsx
    NewsletterSignup.tsx
    OpeningHours.tsx
    Map.tsx
  content/
    products.ts
    team.ts
    hours.ts

## Critères d'acceptation
- Page d'accueil Lighthouse > 90 en performance
- Formulaire de contact envoie un email à contact@boulangerie-dupont.fr
- Carte affiche 45.7589° N, 4.8414° E (adresse de la boulangerie)
- Site responsive validé sur iPhone SE, iPad, desktop
- Pas de console.log en production

## Éléments explicitement exclus
- Pas de vente en ligne
- Pas de compte utilisateur
- Pas de blog
- Pas de paiement intégré
- Pas de multi-langue (français uniquement)
- Pas de réservation en ligne
```

### Interprétation du skill

1. **Gate niveau** : N1 (aucune mention d'édition de contenu par le client, aucune mention de logique métier custom). ✅
2. **Stack** : conforme (Vite + React + hash router + Tailwind). Pas de Next.js à corriger. ✅
3. **Pages** : 5 routes à créer dans `src/pages/`.
4. **Composants** : 8 composants. Réutiliser `Hero`, `Form` du template ; créer les 6 autres.
5. **Intégrations** : Formspree + Brevo + OpenStreetMap + Plausible — tous dans le catalogue. ✅
6. **Env vars** : générer `.env.example` avec 3 vars.
7. **SEO** : titles + descriptions à coder par page.
8. **Exclusions** : pas de vente en ligne, pas de compte, pas de paiement → cohérent avec N1. ✅
9. **Critères** : ajouter à `checklist-livraison.md` : Lighthouse > 90, formulaire envoie email, carte avec coords exactes.

### Snippet de code à générer

Le skill produit, à partir de la section 12, des snippets comme :

```ts
// src/content/hours.ts
export const openingHours = [
  { day: 'Lundi', open: 'Fermé', close: '' },
  { day: 'Mardi', open: '06:30', close: '19:30' },
  // ...
]

// src/components/Map.tsx
export function Map() {
  const lat = 45.7589
  const lng = 4.8414
  const bbox = `${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}`
  return (
    <iframe
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`}
      style={{ width: '100%', height: 400, border: 0 }}
      title="Localisation"
    />
  )
}
```

## Robustesse du parsing

Le skill doit tolérer :

- **Formats variés** : Markdown avec `##`, sans `##`, avec `1.`/`2.`, avec bullets `-`.
- **Variations de libellés** : `Stack` / `Stack supposée` / `Technos utilisées`.
- **Sections manquantes** : si une section est absente, ne pas crasher ; demander au dev de compléter.
- **Langue** : la section 12 est toujours en français (cf. `ai-prompts.ts`), mais tolérer les Anglicismes (`components`, `responsive`).

**Stratégie** : pour chaque champ, rechercher plusieurs patterns (regex insensible à la casse). Si aucun ne matche, demander au dev : *« Section X manquante dans le prompt d'analyse. La fournir ou confirmer qu'elle n'est pas applicable ? »*

## Pièges à éviter

- **Ne pas suivre aveuglément la stack proposée** par l'IA génératrice : elle peut suggérer Next.js, BrowserRouter, ou un paiement intégré sans connaître les contraintes proxy. Toujours réimposer la stack WoxxApp.
- **Ne pas inventer de contenu** : si la section 12 mentionne « 5 produits phares » mais ne les liste pas, demander au dev. Le skill ne génère pas de textes ni d'images (cf. design spec, YAGNI).
- **Ne pas supposer l'absence d'une intégration** : si le prompt ne mentionne pas la newsletter, ne pas en ajouter une « au cas où ». Respecter strictement la section 12.
- **Croiser avec `niveaux.md`** : une section 12 qui mentionne « compte utilisateur » ou « tableau de bord admin » n'est pas compatible N1. Déclencher la gate N2/N3 et demander validation.
