# keepTrack Backend

De backend van de keepTrack applicatie.

keepTrack is bedoeld voor freelancers om onder andere:

- business partners te beheren
- contracten te beheren
- projecten te beheren
- uren te registreren
- facturen te maken

## Stack

- Node.js
- Express
- Prisma
- PostgreSQL
- Redis
- Vitest

## Architectuur in het kort

De codebasis is grofweg opgezet in lagen:

- `src/application`: use cases en poorten
- `src/domain`: domeinregels, validatie en fouten
- `src/infrastructure`: Prisma, Redis, email, hashing, token services
- `src/interface`: HTTP controllers/routers en CLI
- `src/tests`: unit- en integratietests

## Tenant routing

De backend gebruikt path-based tenant routing.

Frontend routes:

- `/t/:tenantSlug/login`
- `/t/:tenantSlug/accept-invite`
- `/t/:tenantSlug/reset-password`
- `/t/:tenantSlug/app`

Backend routes:

- `/api/system/health`
- `/api/t/:tenantSlug/auth/login`
- `/api/t/:tenantSlug/auth/me`
- `/api/t/:tenantSlug/auth/logout`
- `/api/t/:tenantSlug/auth/accept-invite`
- `/api/t/:tenantSlug/auth/forgot-password`
- `/api/t/:tenantSlug/auth/reset-password`
- `/api/t/:tenantSlug/users`
- `/api/t/:tenantSlug/users/:userId`
- `/api/t/:tenantSlug/roles`
- `/api/t/:tenantSlug/role-assignments`

Mail-links voor invite en reset-password wijzen ook naar frontend path-routes onder `/t/:tenantSlug/...`.

## Lokaal starten

### 1. Dependencies installeren

```bash
npm install
```

### 2. Zorg voor PostgreSQL en Redis

Minimaal nodig:

- een PostgreSQL database
- een Redis instance voor sessies

Voor lokaal testen gebruikt dit project standaard:

- PostgreSQL op `localhost:5433`
- Redis op `localhost:6379`

Pas dit aan in je `.env` en `.env.test` als jouw setup anders is.

### 3. Environment instellen

Maak lokaal een `.env` aan voor development. De belangrijkste variabelen zijn:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://postgres:password@localhost:5433/keepTrack_dev_local?schema=public"
REDIS_URL="redis://localhost:6379"

SESSION_TTL_SECONDS=86400
SESSION_COOKIE_NAME=sid
SESSION_KEY_PREFIX=sess:

EMAIL_PROVIDER=mock

APP_PROTOCOL=https
APP_BASE_DOMAIN=localhost
```

Voor integratietests gebruikt het project `.env.test`.

Belangrijk:

- `APP_PROTOCOL` en `APP_BASE_DOMAIN` zijn nodig voor tenant-aware invite/reset links
- `EMAIL_PROVIDER=mock` is handig voor lokaal en test
- `PORT` is verplicht via `appConfig`

### 4. Database migreren

Voor development:

```bash
npx prisma migrate deploy
```

Voor testdatabase:

```bash
npm run db:migrate:test
```

Als Prisma Client nog niet gegenereerd is:

```bash
npx prisma generate
```

### 5. Server starten

```bash
node app.js
```

De server start standaard op de `PORT` uit je `.env`.

## Tests

### Unit tests

```bash
npm run test:unit
```

### Integratietests

```bash
npm run test:int
```

Integratietests gebruiken:

- `.env.test`
- een echte testdatabase
- Redis

Voordat integratietests draaien, moet je testdatabase bereikbaar zijn en moeten de migraties daarop zijn toegepast.

## Provision tenant

Er is een CLI om een tenant plus eerste admin-gebruiker te provisionen:

```bash
npm run provision:tenant -- --name="Acme" --slug="acme" --type="CLIENT" --adminEmail="admin@acme.nl"
```

Deze flow maakt onder andere aan:

- tenant
- tenant-rollen
- eerste admin user
- admin role assignment
- invite token voor de admin user

## Handige ontwikkelnotities

- Auth en publieke tokenflows zitten onder `/auth`
- Role assignments lopen via `/api/t/:tenantSlug/role-assignments`
- Integratietests gebruiken expliciet het tenant-path contract, zonder legacy route rewrites
- `forgot-password` rolt reset-token state terug als mailverzending faalt

## Scripts

```bash
npm run test:unit
npm run test:int
npm run test:watch
npm run db:migrate:test
npm run provision:tenant -- --name="..." --slug="..." --type="CLIENT" --adminEmail="..."
```
