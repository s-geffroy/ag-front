# Public site — deploy runbook + Hostinger DNS

`apps/public` (Astro) is served publicly at **https://www.applied-geopolitics.com** by Caddy on the
VPS (public IP **`72.61.101.1`**), automatic HTTPS. Decision: [ADR 0010](decisions/0010-public-deploy-caddy.md).

## Deploy / update (Docker-only)

```bash
# 1. build the static site
docker compose -f docker/docker-compose.yml run --rm tools npm --workspace @ag/public run build
# 2. (re)start the public web server
docker compose -f docker/docker-compose.yml up -d public
```

Caddy serves `apps/public/dist` and obtains/renews the Let's Encrypt cert automatically once DNS points
here. To publish new content: rebuild (step 1) — Caddy picks up the new files from the mounted `dist`.

## DNS at Hostinger (one-time)

The domain `applied-geopolitics.com` is managed at Hostinger and must be repointed from the old IP
(`148.230.117.243`) to this VPS (`72.61.101.1`).

1. **hPanel → Domains → applied-geopolitics.com → DNS / Nameservers** (DNS Zone editor).
   The domain must use **Hostinger nameservers** for this zone editor to apply.
2. **Edit the A records** (replace the old IP):

   | Type | Name (Host) | Value / Points to | TTL                           |
   | ---- | ----------- | ----------------- | ----------------------------- |
   | A    | `@`         | `72.61.101.1`     | 3600 (or lower while testing) |
   | A    | `www`       | `72.61.101.1`     | 3600                          |

3. **Delete** any existing `A` records for `@` and `www` pointing to `148.230.117.243`, and any
   **CNAME** on `www` (a host can't have both A and CNAME).
4. **Do not add AAAA (IPv6)** for now — Caddy is bound to IPv4 only; an AAAA record without IPv6
   serving would break IPv6 visitors. (We can enable IPv6 later.)
5. **Leave MX / email (TXT/SPF/DKIM) records untouched** — they are unrelated to web hosting.
6. **Firewall:** ensure inbound **TCP 80 and 443** are open to the VPS (Hostinger VPS firewall / any
   cloud firewall). Port 80 is required for the ACME HTTP-01 challenge.

### After the change

- Propagation takes minutes to a few hours (bounded by the old TTL). Check:

  ```bash
  dig +short www.applied-geopolitics.com      # must return 72.61.101.1
  ```

- Within ~1 minute of correct DNS, Caddy issues the certificate and the site goes live on HTTPS.
  Watch it:

  ```bash
  docker compose -f docker/docker-compose.yml logs -f public   # look for "certificate obtained"
  curl -sI https://www.applied-geopolitics.com | head -1        # HTTP/2 200
  ```

## Notes

- Apex `applied-geopolitics.com` 301-redirects to `www` (single canonical origin).
- The contact form currently opens the visitor's mail client (`mailto:`); wiring it to the
  self-hosted lead endpoint is ADR 0006 (pending the API contract).
