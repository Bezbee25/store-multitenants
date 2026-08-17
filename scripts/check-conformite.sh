#!/usr/bin/env bash
# Usage: check-conformite.sh [PROJECT_DIR]
# Default PROJECT_DIR = parent dir of this script (project root)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${1:-$(dirname "$SCRIPT_DIR")}"
cd "$PROJECT_DIR"

fail() { echo "FAIL: $1" >&2; exit 1; }
ok()   { echo "OK:   $1"; }

# Check 1: vite.config.ts has base: './'
if ! grep -qE "base\s*:\s*['\"]\.\/['\"]" vite.config.ts 2>/dev/null; then
  fail "vite.config.ts missing base: './'"
fi
ok "vite.config.ts base: './'"

# Check 2: createHashRouter used, not BrowserRouter
if grep -rqE "BrowserRouter" src/ 2>/dev/null; then
  fail "BrowserRouter found in src/ — use createHashRouter"
fi
if ! grep -rqE "createHashRouter" src/ 2>/dev/null; then
  fail "createHashRouter not found in src/"
fi
ok "Hash router in use"

# Check 3: no absolute paths to /assets, /sw.js, /manifest.webmanifest
if grep -rqE "(src|href)\s*=\s*[\"']/assets" src/ public/ 2>/dev/null; then
  fail "absolute /assets path found"
fi
# /sw.js and /manifest.webmanifest are allowed only when gated on detectWoxxAppPrefix
# (subdomain-only PWA registration — proxy mode forbids them).
guarded=$(grep -rlE "woxxappPrefix\s*===\s*['\"]['\"]" src/ 2>/dev/null || true)
if grep -rqE "[\"']/sw\.js" src/ public/ 2>/dev/null; then
  if [ -z "$guarded" ]; then
    fail "absolute /sw.js reference found without prefix guard"
  fi
fi
if grep -rqE "[\"']/manifest\.webmanifest" src/ public/ 2>/dev/null; then
  if [ -z "$guarded" ]; then
    fail "absolute /manifest.webmanifest reference found without prefix guard"
  fi
fi
ok "No absolute proxy-breaking paths"

# Check 4: no unconditional service worker registration
if grep -rqE "navigator\.serviceWorker\.register" src/ 2>/dev/null; then
  # Allow only if gated on detectWoxxAppPrefix returning empty
  if ! grep -rqE "detectWoxxAppPrefix.*===\s*['\"]['\"]|woxxappPrefix\s*===\s*['\"]['\"]" src/ 2>/dev/null; then
    fail "navigator.serviceWorker.register found without prefix guard"
  fi
  ok "SW registration gated on prefix"
else
  ok "No app-side SW registration"
fi

# Check 5: build passes
if [ -f package.json ]; then
  if ! npm run build >/dev/null 2>&1; then
    fail "npm run build failed"
  fi
  ok "npm run build passes"

  # Check 6: dist/index.html no absolute paths
  if grep -qE "(src|href)\s*=\s*[\"]/" dist/index.html 2>/dev/null; then
    fail "dist/index.html contains absolute paths"
  fi
  ok "dist/index.html uses relative paths"
fi

# ── Sécurité (OWASP) ────────────────────────────────────────────────────────

# Check 7: pas de dangerouslySetInnerHTML sans DOMPurify
if grep -rqE "dangerouslySetInnerHTML" src/ 2>/dev/null; then
  if ! grep -rqE "DOMPurify|sanitize" src/ 2>/dev/null; then
    fail "dangerouslySetInnerHTML utilisé sans DOMPurify/sanitize (risque XSS)"
  fi
  ok "dangerouslySetInnerHTML assaini par DOMPurify/sanitize"
else
  ok "Pas de dangerouslySetInnerHTML"
fi

# Check 8: pas d'affectation innerHTML directe
if grep -rqE "\.innerHTML\s*=" src/ 2>/dev/null; then
  fail "Affectation .innerHTML trouvée (utiliser textContent ou React)"
fi
ok "Pas d'innerHTML direct"

# Check 9: pas de eval / new Function
if grep -rqE "\beval\s*\(|new Function\s*\(" src/ 2>/dev/null; then
  fail "eval() ou new Function() trouvé (injection de code)"
fi
ok "Pas d'eval ni new Function"

# Check 10: pas de tokens dans localStorage / sessionStorage
if grep -rqE "localStorage\.(set|setItem)\s*\(|sessionStorage\.(set|setItem)\s*\(" src/ 2>/dev/null; then
  token_pattern='(token|jwt|auth|password|secret|api[_-]?key|refresh)'
  if grep -rqEi "localStorage\.(set|setItem)\s*\(['\"]${token_pattern}" src/ 2>/dev/null \
    || grep -rqEi "sessionStorage\.(set|setItem)\s*\(['\"]${token_pattern}" src/ 2>/dev/null; then
    fail "Token/secret stocké dans localStorage/sessionStorage (risque XSS = fuite)"
  fi
  ok "localStorage/sessionStorage utilisé sans token sensible"
else
  ok "Pas de localStorage/sessionStorage critique"
fi

# Check 11: pas de commande shell avec entrée utilisateur
if grep -rqE "child_process|execSync|exec\(|system\(" src/ 2>/dev/null; then
  fail "Appel shell (child_process/exec/system) trouvé — interdit côté app cliente"
fi
ok "Pas d'appel shell"

# Check 12: pas de secret en dur dans src/ (heuristique conservative)
secret_pattern='(sk_live_|sk_test_|AKIA|ghp_|gho_|-----BEGIN (RSA |EC )?PRIVATE KEY)'
if grep -rqE "$secret_pattern" src/ 2>/dev/null; then
  fail "Pattern de secret détecté dans src/ (clé Stripe, AWS, GitHub, PEM)"
fi
ok "Pas de secret en dur détecté"

# Check 13: nginx.conf contient CSP (si fichier présent)
if [ -f nginx.conf ]; then
  if ! grep -q "Content-Security-Policy" nginx.conf 2>/dev/null; then
    fail "nginx.conf manque l'en-tête Content-Security-Policy"
  fi
  if ! grep -q "Strict-Transport-Security" nginx.conf 2>/dev/null; then
    fail "nginx.conf manque l'en-tête Strict-Transport-Security (HSTS)"
  fi
  ok "nginx.conf a CSP + HSTS"
fi

echo "Conformity check: PASS"
