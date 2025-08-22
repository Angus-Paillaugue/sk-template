# Svelte 5 Template — Fullstack Auth & I18n

This is a modern Svelte 5 template featuring Tailwind CSS, PostgreSQL, and robust authentication (username/password, TOTP, passkey). It includes a manual i18n implementation, database migration tooling, and a set of pre-styled UI components.

## Features

- **Svelte 5**: Latest Svelte framework for reactive, fast UI.
- **Tailwind CSS**: Utility-first CSS for rapid styling.
- **PostgreSQL**: Relational database for user and session data.
- **Authentication**:
  - Username & password
  - TOTP (Time-based One-Time Password, 2FA)
  - Passkey (WebAuthn/FIDO2)
- **Manual i18n**: Custom internationalization system with translation loaders ([src/lib/i18n](src/lib/i18n)).
- **Database migrations**: Simple migration scripts ([scripts/db](scripts/db), [sql/migrations](sql/migrations)).
- **Styled Components**: Ready-to-use UI elements ([src/lib/components](src/lib/components)).
- **Docker Support**: Containerized development and deployment.

## Getting Started

### 1. Install dependencies

Install the dependencies with your favourite package manager (mine is bun).

```sh
bun install
```

### 2. Configure project

You can use the `init.sh` that will walk you thru configuring the project and automate some tasks

```sh
./scripts/init.sh
```

### 3. Start Postgres and Redis

Start the Postgres database and Redis servers.

```sh
docker compose up db redis
```

### 4. Run database migrations

Run newly created database migrations against the Postgres database.

```sh
bun run db:migrate
```

### 5. Start development server

Start the SvelteKit dev server.

```sh
bun run dev
```

## Authentication

- **Username/Password**: Standard login and registration.
- **TOTP**: Two-factor authentication via authenticator apps.
- **Passkey**: Passwordless login using WebAuthn/FIDO2.
- **Internationalization** (i18n)
- **Translations** are loaded manually from JSON files ([`src/lib/i18n/messages`](src/lib/i18n/messages)). Add new languages by extending the config in [`src/lib/i18n/config.ts`](src/lib/i18n/config.ts).

## Database Migrations

### Create a migration

You can create a new Postgres database migration file with the following.

```sh
bun run db:create-migration
```

Once ran, a new migration file will be created in [`sql/migrations/`](sql/migrations/) directory.

### Apply migrations:

Run newly created database migrations against the Postgres database.

```sh
bun run db:migrate
```

## Docker

The app is packages in a docker image that can be used to deploy it easley.

### Release

Build and run the app in Docker:

```sh
./scripts/build-image.sh
```

### Deploy

Deploy the newly created image to a remote server (be sure to set all of the required `SSH_*` env variables for it to work).

```sh
./scripts/deploy.sh
```
