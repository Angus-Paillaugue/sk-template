# Svelte 5 Template — Fullstack Auth & I18n

This is a modern Svelte 5 template featuring Tailwind CSS, PostgreSQL, and robust authentication (username/password, TOTP, passkey). It includes a manual i18n implementation, database migration tooling, and a comprehensive set of pre-styled UI components based on shadcn-svelte.

## Features

- **Svelte 5 & SvelteKit**: Leverages the latest features of Svelte for building reactive, high-performance web applications.
- **Fullstack Authentication**: Robust and secure authentication system supporting:
  - Username & Password
  - Time-based One-Time Password (TOTP) for 2FA
  - Passkeys (WebAuthn/FIDO2) for passwordless login
  - OICD support (experimental)
- **Database**:
  - **PostgreSQL**: A powerful, open-source object-relational database system.
  - **Simple Migrations**: Includes scripts to create and apply database migrations.
- **Styling**:
  - **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
  - **shadcn-svelte**: A rich, accessible, and customizable component library.
- **Internationalization (i18n)**: A custom, lightweight i18n setup with JSON-based translation files and a script to check for missing keys.
- **Docker Support**: Comes with `Dockerfile` and `docker-compose.yaml` for containerized development and deployment with PostgreSQL and Valkey.
- **Tooling**:
  - **ESLint & Prettier**: For consistent code style and quality.
  - **Husky**: For running pre-commit hooks (i.e., linting and translation checks).
  - **CLI**: A command-line interface to bootstrap new projects from this template.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (or npm/yarn)
- [Docker](https://www.docker.com/) and Docker Compose
- A code editor (VS Code recommended)

### Initial Setup

1. **Create a new project from this template:**

```bash
npx sk-template create
```

Follow the prompts to configure your project name, website name, and origin URL.

2. **Navigate to your project and install dependencies:**

```bash
cd your-project-name
bun install
```

3. **Start the services:**

```bash
# Start database and cache (for local development)
docker compose -f docker-compose.dev.yaml up -d
```

4. **Run database migrations:**

```bash
bun run db:migrate
```

5. **Start the dev server:**

```bash
bun run dev
```

Your app is now running at [http://localhost:5173](http://localhost:5173).

---

## Project Structure

```
sk-template/
├── src/
│   ├── routes/                # SvelteKit routes & pages
│   │   ├── auth/              # Authentication pages (login, signup, etc.)
│   │   ├── app/               # Protected app routes
│   │   ├── api/               # API endpoints
│   │   └── +layout.svelte     # Root layout
│   │
│   ├── lib/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # shadcn-svelte components
│   │   │   ├── Toast/         # Toast notification system
│   │   │   └── ...            # Other components
│   │   │
│   │   ├── server/            # Server-only code
│   │   │   ├── auth.ts        # JWT & auth utilities
│   │   │   ├── db/            # Database access objects (DAOs)
│   │   │   ├── mail/          # Email sending
│   │   │   ├── oauth/         # OAuth/OIDC handling
│   │   │   ├── totp/          # TOTP 2FA logic
│   │   │   └── db.ts          # Database pool
│   │   │
│   │   ├── i18n/              # Internationalization
│   │   │   ├── config.ts      # i18n configuration
│   │   │   ├── messages/      # Translation files
│   │   │   └── i18n.svelte.ts # i18n class
│   │   │
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   └── assets/            # Images
│   │
│   ├── app.css                # Global styles
│   ├── app.d.ts               # Global type declarations
│   └── hooks.server.ts        # SvelteKit server hooks
│
├── scripts/                   # Utility scripts
│   ├── db/                    # Database scripts
│   │   ├── migrate.ts         # Run migrations
│   │   ├── createMigration.ts # Create new migration
│   │   └── makeAdmin.ts       # Promote user to admin
│   └── checkTranslations.ts   # Validate i18n keys
│
├── sql/
│   ├── init.sql               # Initial database schema
│   └── migrations/            # Migration files
│
├── config.json                # App configuration
├── .env.example               # Environment template
├── docker-compose.yaml        # Production compose
├── docker-compose.dev.yaml    # Development compose
└── package.json
```

---

## Configuration

### Main Config File: config.json

```json
{
  "project_name": "my-app",
  "website": {
    "name": "My App",
    "description": "My awesome app"
  },
  "origin": "http://localhost:5173"
}
```

**Key settings:**

- `project_name`: Used in emails, OAuth, and TOTP setup
- `website.name`: Displayed in UI and email templates
- `origin`: Your app's URL (used for OAuth redirects and security)
- `loaders`: Supported languages and text directions

## Authentication

The template supports **4 authentication methods**:

### 1. Username & Password

**Files:**

- Routes: [`src/routes/auth/sign-up`](src/routes/auth/sign-up) and [`src/routes/auth/log-in`](src/routes/auth/log-in)
- Server logic: [auth.ts](src/lib/server/auth.ts)
- Database: User credentials stored in `users` table (hashed with bcryptjs)

**How it works:**

1. User submits username/password via form
2. Server hashes the password and compares with DB
3. If valid, JWT token is created and stored in secure HTTP-only cookie
4. User is redirected to `/app`

### 2. TOTP (2FA)

**Files:**

- Server: [index.ts](src/lib/server/totp/index.ts)
- UI: [totp.svelte](src/routes/app/account/settings/totp.svelte)
- API: [totp](src/routes/api/auth/totp/)

**Setup:**

1. User navigates to account settings → TOTP tab
2. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
3. Confirm by entering 6-digit code
4. Secret is stored encrypted in DB

**Login with TOTP:**

1. Enter username/password
2. If TOTP enabled, prompt for 6-digit code
3. Validate with [`speakeasy`](src/lib/server/totp/index.ts) library
4. Grant access

### 3. Passkeys (WebAuthn/FIDO2)

**Files:**

- Server: [passkey.ts](src/lib/server/db/passkey.ts)
- UI: [passkey.svelte](src/routes/app/account/settings/passkey.svelte)
- API: [auth](src/routes/api/auth/)

**How it works:**

1. User registers a passkey (fingerprint, face, hardware key)
2. Challenge is generated and stored in Valkey (10-minute TTL)
3. Authenticator signs the challenge
4. Server verifies the signature
5. Passkey credential is stored in DB

### 4. OAuth/OIDC

**Files:**

- Server: [oauth.ts](src/lib/server/oauth/oauth.ts)
- Client: [client.ts](src/lib/server/oauth/client.ts)

**Supports:**

- Authorization Code flow (with optional PKCE)
- Token refresh
- User info retrieval
- Admin role mapping from OAuth groups

**Configuration:**
Set `OAUTH_ENABLED=true` in [.env](.env) and provide OAuth provider details.

### Session Management

**Token storage:**

- JWT tokens stored in HTTP-only cookies (path: `/`)
- Secure flag enabled in production
- Max age configurable per auth method

**Protected routes:**
All routes under `/app` require authentication. Check [hooks.server.ts](src/hooks.server.ts) for the auth middleware.

---

## Database

### Schema Overview

Key tables:

- **users**: User credentials, profile, roles
- **passkey**: WebAuthn credential info
- **migrations**: Migration history

### Creating Migrations

1. **Generate a new migration file:**

```bash
bun run db:create-migration
```

Creates: [`sql/migrations/migration.<TIMESTAMP>.sql`](sql/migrations/)

1. **Edit the file with your SQL:**

```sql
-- Migration created at 2025-01-01T12:00:00Z

ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
CREATE INDEX idx_users_last_login ON users(last_login);
```

3. **Apply migrations:**

```bash
bun run db:migrate
```

The system tracks applied migrations in the `migrations` table.

### Database Access (DAOs)

Data Access Objects handle all database queries. Examples:

- [`UserDAO`](src/lib/server/db/user.ts): User CRUD operations
- [`PasskeyDAO`](src/lib/server/db/passkey.ts): Passkey management
- [`Valkey`](src/lib/server/db/caching.ts): Cache operations

**Usage example:**

```typescript
import { UserDAO } from '$lib/server/db/user';

// Get user by username
const user = await UserDAO.getUserByUsername('john_doe');

// Create user
await UserDAO.createUser({
  username: 'jane_doe',
  email: 'jane@example.com',
  passwordHash: hashedPassword,
});
```

### Connection Pool

Database connection pooling is configured in [index.ts](src/lib/server/db/index.ts) using the `pg` library.

---

## Internationalization (i18n)

### Adding a New Language

1. **Create a translation file:**

Create `src/lib/i18n/messages/fr.json` (copy from [en.json](src/lib/i18n/messages/en.json) and translate)

2. **Register the loader:**

Edit config.ts:

```typescript
export const config: Config<Translations> = {
  defaultLocale: 'en',
  loaders: [
    {
      locale: 'en',
      loader: async () => (await import('./messages/en.json')).default,
    },
    {
      locale: 'fr',
      dir: 'ltr', // or 'rtl' for right-to-left languages
      loader: async () => (await import('./messages/fr.json')).default,
    },
  ],
};
```

3. **Validate translations:**

```bash
bun run i18n:check
```

This ensures all keys are present in all language files.

### Using Translations in Code

**In Svelte components:**

```svelte
<script lang="ts">
  import i18n from '$lib/i18n';
</script>

<h1>{i18n.t('auth.logIn.title')}</h1><p>{i18n.t('auth.welcome', { name: 'John' })}</p>
```

**Switching languages:**

```svelte
<button onclick={() => i18n.setLocale('fr')}>Français</button>
```

The locale is saved in a cookie and persists across sessions.

---

## Styling & UI Components

### Tailwind CSS

The template uses **Tailwind CSS v4** with a custom theme. Theme variables are defined in CSS custom properties:

**Main theme file:** [sleek-black.css](src/css/sleek-black.css)

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  /* ... more variables ... */
}
```

**Switching themes:**
Edit the import in [app.css](src/app.css):

```css
@import './css/sleek-black'; /* Change this */
```

### shadcn-svelte Components

Pre-styled components from [shadcn-svelte](https://www.shadcn-svelte.com/) are in [ui](src/lib/components/ui/).

**Common components:**

- Button, Input, Label, Checkbox
- Dialog, Alert, Tabs, Card
- DataTable, Pagination, Carousel
- Form components (with Svelte Form Lib)

**Usage:**

```svelte
<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Hello</Card.Title>
  </Card.Header>
  <Card.Content>
    <Button>Click me</Button>
  </Card.Content>
</Card.Root>
```

### Toast Notifications

Use the [`Toaster`](src/lib/components/Toast/toast.ts) class for notifications:

```typescript
import { Toaster } from '$lib/components/Toast/toast';

Toaster.success('Saved successfully!');
Toaster.error('Something went wrong');
Toaster.warning('Are you sure?');
Toaster.info('FYI...');
```

---

## Development

### Common Commands

```bash
# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Format code
bun run format

# Lint & check code quality
bun run lint

# Type checking
bun run check

# Check translations for missing keys
bun run i18n:check

# Create database migration
bun run db:create-migration

# Run pending migrations
bun run db:migrate

# Promote user to admin
bun run db:make-admin <USERNAME>
```

### Code Quality

**Pre-commit hooks** (via Husky):

- Prettier formatting
- ESLint checks
- Translation validation

Commits are blocked if:

- Code doesn't match Prettier format
- ESLint finds errors
- Translation keys are missing

---

## Deployment

### Docker

1. **Build the image:**

```bash
docker build -t your-username/my-app:latest .
```

2. **Run with Docker Compose:**

```bash
docker compose up -d
```

Services:

- `web`: SvelteKit app (port 4173)
- `db`: PostgreSQL (port 5432)
- `valkey`: Valkey cache (port 6379)

### Environment for Production

Update [.env](.env) with production values:

```bash
# Use a strong JWT secret (32+ chars)
JWT_SECRET=your-production-secret-key-minimum-32-characters

# Database
POSTGRES_HOST=db  # Use service name when in Docker
POSTGRES_USER=...
POSTGRES_PASSWORD=...

# Valkey
VALKEY_HOST=valkey

# Email
SMTP_HOST=your-smtp-server
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...

# OAuth (if enabled)
OAUTH_ENABLED=true
OAUTH_CLIENT_ID=...
# ... rest of OAuth config
```

### Performance Tips

- Valkey caching reduces database queries (used for OAuth state, TOTP challenges)
- Database indexing on frequently queried columns (see migrations)
- HTTP-only cookies prevent XSS attacks
- JWT tokens are stateless (no session storage needed)

---

## Troubleshooting

### Database connection errors

1. Check Docker is running: `docker ps`
2. Verify credentials in [.env](.env) match [docker-compose.dev.yaml](docker-compose.dev.yaml) or [docker-compose.yaml](docker-compose.yaml)
3. Wait for database to be ready: `docker logs db`

### Migrations fail

1. Check migration SQL syntax
2. Review database error: `bun run db:migrate` shows full error
3. Ensure database user has necessary permissions

### i18n key missing

Run `bun run i18n:check` to see which translations are missing, then add them to all language files.

### OAuth not working

1. Verify `OAUTH_ENABLED=true` in [.env](.env)
2. Check OAuth provider credentials are correct
3. Ensure `ORIGIN` matches OAuth redirect URI
4. Check Valkey is running (`docker logs valkey`)

---

## Next Steps

- Customize [UI](src/lib/components/ui/) in ui
- Add new auth methods in [auth.ts](src/lib/server/auth.ts)
- Create database migrations as your schema evolves
- Add new languages to [messages](src/lib/i18n/messages/)
- Deploy to your hosting platform

Good luck!
