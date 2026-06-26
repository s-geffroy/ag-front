# 0033 — HDDE : surface publique authentifiée (`hdde.applied-geopolitics.com`)

- **Statut :** accepté
- **Date :** 2026-06-26
- **Contexte connexe :** ADR 0009 (cockpit Tailscale-only), 0010 (public Caddy), 0013 (tainted
  internal-only), 0032 (HDDE port TS).

## Contexte

HDDE doit être accessible aux analystes **depuis Internet** (déplacements, missions client), pas
seulement depuis le tailnet. C'est donc une **3ᵉ surface**, distincte :

- `www.applied-geopolitics.com` — public, statique (Astro).
- cockpit — **Tailscale-only**, jamais public (ADR 0009).
- **`hdde.applied-geopolitics.com`** — **public-Internet derrière authentification**.

Les cas HDDE contiennent des **données client confidentielles** → l'auth et la sécurité de session
sont critiques (≠ cockpit qui se reposait sur l'isolation réseau Tailscale).

## Décision

- **Comptes analystes individuels** : email + mot de passe haché **bcrypt** ; **pas d'auto-inscription**
  (`ALLOW_SIGNUP=false`) ; création de compte via **script de seeding admin** (CLI, Docker).
- **Sessions** : cookie **httpOnly + Secure + SameSite=Strict**, identifiant de session opaque stocké
  en table `sessions` (SQLite), expiration + révocation à la déconnexion.
- **Durcissement** (ADR + skill `owasp-security`) : rate-limit sur `/api/auth/login`, validation zod
  stricte de toute entrée, en-têtes de sécurité, pas de fuite de stack trace, **isolation des cas**
  (un analyste ne voit que ses cas sauf rôle admin), contrôle type/taille des pièces jointes.
- **Exposition** : `hdde-api` bind **loopback** `127.0.0.1` ; **Caddy** front le vhost
  `hdde.applied-geopolitics.com` en HTTPS (Let's Encrypt) et `reverse_proxy` vers le service. TLS
  obligatoire (cookies `Secure`).

## Justification

Surface publique + données confidentielles ⇒ on ne peut pas se reposer sur le réseau comme le cockpit.
Comptes individuels (vs login partagé) ⇒ **traçabilité** : on sait qui a validé quel packet, exigence
de la méthode (séparation des registres, responsabilité analyste).

## Conséquences

- Un `SESSION_SECRET` fort et un `OPENAI_API_KEY` (ADR 0034) vivent en env, jamais commités.
- DNS : A record `hdde` → `PUBLIC_IP` requis avant émission du certificat.
- Accès **client** en lecture seule = V2 (RBAC + isolation par client), hors V1.
