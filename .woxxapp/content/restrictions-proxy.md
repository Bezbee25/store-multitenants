# Restrictions du mode proxy WoxxApp

En mode proxy (mode actif par défaut), les sites WoxxApp sont servis via :

```
https://store.woxxapp.de/{contextSlug}/{appSlug}/...
```

Le backend `routes/proxy.ts` de `woxxapp-core` reste le point d'entrée obligatoire. Il vérifie l'accès (session JWT, appartenance au contexte, permission applicative, partage anonyme valide), puis forward la requête HTTP vers le container interne (`http://${SITE_NAME}-site`).

L'application cible est donc **servie comme une page web proxifiée**. Elle ne contrôle pas son origine navigateur, son nom de domaine, ni la racine de son URL. Le code doit rester portable entre la racine `/` (mode sous-domaine futur) et un préfixe arbitraire `/{contextSlug}/{appSlug}/` (mode proxy actuel).

Toutes les contraintes ci-dessous découlent de ce fait. Elles sont non négociables et vérifiées par `make check` avant tout build.

## 1. `base: './'` obligatoire dans Vite

`vite.config.ts` doit contenir `base: './'`. Sans cela, Vite produit des URLs absolues (`/assets/index-xxxx.js`) dans `dist/index.html`. En mode proxy, ces URLs résolvent vers `https://store.woxxapp.de/assets/...`, qui n'existe pas — le navigateur obtient des 404 et l'app ne charge pas.

Avec `base: './'`, Vite produit des URLs relatives (`./assets/index-xxxx.js`) qui résolvent correctement quel que soit le préfixe `/{contextSlug}/{appSlug}/`.

```ts
// vite.config.ts — conforme
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
})
```

## 2. `createHashRouter` obligatoire (React Router v7)

Jamais `BrowserRouter`. Jamais `MemoryRouter` en production.

Le routeur browser parse `window.location.pathname` pour décider quelle route afficher. En mode proxy, le pathname est `/my-context/my-app/products/42`. Si l'app déclare une route `/products/:id`, le matcher échoue car il ne sait pas qu'il doit ignorer le préfixe `/my-context/my-app`.

Le routeur hash lit `window.location.hash` (`#/products/42`), qui est indépendant du préfixe pathname. Toute la logique de routing se passe dans le hash, insensible au préfixe proxy.

```ts
// src/main.tsx — conforme
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { routes } from './routes'

const router = createHashRouter(routes)

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
```

Lien interne vers une page : toujours avec `#` :

```tsx
<a href="#/contact">Contact</a>
// ou via React Router :
<Link to="/contact">Contact</Link>
```

Ne jamais écrire `<a href="/contact">` — en mode proxy cela sort du préfixe et casse la navigation.

## 3. Aucun chemin absolu vers les ressources

Dans le code source comme dans `index.html` :

- ❌ `/assets/logo.png`
- ❌ `/sw.js`
- ❌ `/manifest.webmanifest`
- ❌ `/favicon.ico`
- ❌ `import.meta.env.BASE_URL + '/foo.png'` (BASE_URL vaut `'./'`, ça peut marcher, mais c'est fragile — préférer des imports explicites)

✅ Importer les assets depuis le JS :

```ts
import logo from './assets/logo.png' // Vite génère l'URL relative correcte
```

✅ En HTML, utiliser des chemins relatifs :

```html
<link rel="icon" href="./favicon.ico" />
```

## 4. Pas de Service Worker applicatif en mode proxy

Ne pas appeler `navigator.serviceWorker.register(...)` dans le code applicatif.

Pourquoi : en mode proxy, le SW serait enregistré avec un scope `/{contextSlug}/{appSlug}/`, mais le store WoxxApp a déjà son propre Service Worker au scope `/`. Deux SW sur des scopes qui se chevauchent génèrent des conflits de cache, des interceptions de fetch inattendues, et des bugs de navigation très difficiles à diagnostiquer.

La PWA autonome (manifest + SW applicatif) est réservée au **mode sous-domaine futur** (`https://{appSlug}.woxxapp.de/`), qui n'est pas encore déployé.

## 5. Détection du préfixe proxy

Si un même code peut servir en mode proxy **et** en mode sous-domaine futur, il doit détecter dynamiquement le mode et désactiver manifest + SW en mode proxy.

Le préfixe proxy se calcule ainsi :

```ts
// src/lib/woxxapp-context.tsx
export function detectWoxxAppPrefix(pathname: string): string {
  // pathname typique en mode proxy : /{contextSlug}/{appSlug}/...
  // En mode sous-domaine : pathname commence par la route (ex: /products/42)
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length < 2) return ''
  return '/' + segments.slice(0, 2).join('/')
}
```

Le template expose aussi un hook `useWoxxApp()` qui fournit `{ prefix, isProxied }`. Quand `isProxied` est vrai :

- Ne pas injecter `<link rel="manifest" href="./manifest.webmanifest">`.
- Ne pas appeler `navigator.serviceWorker.register(...)`.

Le template `site-base` n'embarque ni SW ni manifest. Cette section s'applique surtout au template `pwa-base`.

## 6. Le mode sous-domaine est piloté par l'infra, pas par l'app

Le passage au mode sous-domaine dédié (`https://{appSlug}.woxxapp.de/`) est une opération d'infrastructure :

- DNS (enregistrement A/CNAME pour `{appSlug}.woxxapp.de`),
- reverse proxy / TLS ( certificat, SNI),
- configuration Docker / réseau,
- contrat d'authentification (launch token, header injecté par le proxy, etc.).

L'application ne décide **pas** de son mode d'exposition. Elle doit juste rester compatible avec les deux. Aucun code ne doit supposer « je suis sur tel domaine » ou « je suis à la racine ».

## Récapitulatif avant commit

| Contrainte | Vérification |
|---|---|
| `base: './'` dans vite.config.ts | `grep "base: './'" vite.config.ts` |
| `createHashRouter` dans main.tsx | `grep createHashRouter src/main.tsx` |
| Pas de `BrowserRouter` | `grep -r BrowserRouter src/` doit être vide |
| Pas de `/assets`, `/sw.js`, `/manifest.webmanifest` absolus | `grep -rE '(src\|href)="/' dist/index.html src/` doit être vide |
| Pas de `navigator.serviceWorker.register` | `grep -r navigator.serviceWorker.register src/` doit être vide |

`make check` exécute toutes ces vérifications automatiquement. Ne pas commit si `make check` échoue.
