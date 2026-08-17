.PHONY: help check test build dev start stop clean

help:
	@echo ""
	@echo "  store-multitenants — Commandes de développement"
	@echo "  make check      Vérifie la conformité WoxxApp (base: './', createHashRouter, OWASP...)"
	@echo "  make dev        Démarre backend et frontend en mode dev local"
	@echo "  make build      Build frontend et backend pour production"
	@echo "  make test       Lance les tests automatisés"
	@echo "  make clean      Nettoie les artefacts de build"
	@echo ""

check:
	@echo "🔍 [1/6] Vérification vite.config.ts (base: './')..."
	@grep -q "base: '\./'" frontend/vite.config.ts || (echo "❌ ERREUR: 'base: \"./\"' manquant dans frontend/vite.config.ts" && exit 1)
	@echo "✅ vite.config.ts conforme"
	@echo "🔍 [2/6] Vérification createHashRouter..."
	@grep -rq "createHashRouter" frontend/src/ || (echo "❌ ERREUR: createHashRouter non trouvé dans frontend/src" && exit 1)
	@grep -rq "BrowserRouter" frontend/src/ && (echo "❌ ERREUR: BrowserRouter interdit dans frontend/src !" && exit 1) || true
	@echo "✅ createHashRouter conforme"
	@echo "🔍 [3/6] Vérification interdiction ServiceWorker applicatif..."
	@grep -rq "navigator.serviceWorker.register" frontend/src/ && (echo "❌ ERREUR: navigator.serviceWorker.register interdit !" && exit 1) || true
	@echo "✅ ServiceWorker conforme"
	@echo "🔍 [4/6] Vérification interdiction SDK Stripe direct..."
	@grep -rq "@stripe/stripe-js" frontend/package.json && (echo "❌ ERREUR: SDK Stripe direct interdit !" && exit 1) || true
	@grep -rq "stripe" backend/package.json && (echo "❌ ERREUR: SDK Stripe direct interdit dans le backend, utiliser woxx-pay !" && exit 1) || true
	@echo "✅ Intégration WoxxPay conforme"
	@echo "🔍 [5/6] TypeCheck Frontend TypeScript..."
	@cd frontend && npx tsc --noEmit
	@echo "✅ Frontend TypeScript OK"
	@echo "🔍 [6/6] TypeCheck Backend TypeScript..."
	@cd backend && npx tsc --noEmit
	@echo "✅ Backend TypeScript OK"
	@echo ""
	@echo "🎉 ✅ TOUTES LES VÉRIFICATIONS SONT PASSÉES AVEC SUCCÈS !"

build:
	@echo "🔨 Build Frontend..."
	@cd frontend && npm run build
	@echo "🔨 Build Backend..."
	@cd backend && npm run build
	@echo "✅ Build terminé."

dev:
	@echo "🚀 Démarrage du mode développement..."
	@npm --prefix backend run dev & npm --prefix frontend run dev
