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
- **Docker Support**: Comes with `Dockerfile` and `docker-compose.yaml` for containerized development and deployment with PostgreSQL and Redis.
- **Tooling**:
  - **ESLint & Prettier**: For consistent code style and quality.
  - **Husky**: For running pre-commit hooks (i.e., linting and translation checks).
  - **CLI**: A command-line interface to bootstrap new projects from this template.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (or another Node.js package manager like npm/yarn)
- [Docker](https://www.docker.com/) and Docker Compose

### Installation

1.  **Clone the Repository**
    To create a new project based on this template, you can use the provided CLI tool.

    ```bash
    npx sk-template
    ```

    This command will guide you through the setup process, cloning the template and configuring project-specific variables.

2.  **Install Dependencies**
    Navigate to your new project directory and install the dependencies.

    ```bash
    cd your-project-name
    bun install
    ```

3.  **Set Up Environment Variables**
    The CLI tool creates a `.env` file from `.env.example`. Review it and ensure the values are correct for your local setup.

4.  **Start Services**
    Start the PostgreSQL and Redis containers using Docker Compose.

    ```bash
    docker compose up -d db redis
    ```

    For local email testing, you can also start MailHog:

    ```bash
    docker compose -f docker-compose.dev.yaml up db redis mailhog
    ```

5.  **Run Database Migrations**
    Apply the initial database schema and any subsequent migrations.

    ```bash
    bun run db:migrate
    ```

6.  **Run the Development Server**
    Start the SvelteKit development server.

    ```bash
    bun run dev
    ```

    Your application should now be running at `http://localhost:5173`.

## Core Concepts

### Authentication

The template provides a complete authentication solution out of the box, located in `src/routes/auth`. It handles user registration, login, session management, and password recovery. The server-side logic in `src/lib/server/auth.ts` uses JWT for token-based authentication.

### Database Migrations

You can manage your database schema using simple SQL migration files.

- **Create a Migration**:

  ```bash
  bun run db:create-migration
  ```

  This creates a new timestamped `.sql` file in the `sql/migrations` directory.

- **Apply Migrations**:
  ```bash
  bun run db:migrate
  ```
  This script executes any new migrations against your database.

### Internationalization (i18n)

The i18n system is configured in `src/lib/i18n`.

- **Translation Files**: Add or edit language files in `src/lib/i18n/messages`.
- **Configuration**: Register new locales in `src/lib/i18n/config.ts`.
- **Check Translations**: A pre-commit hook runs `bun run i18n:check` to ensure all translation keys are present across all language files.

## Deployment with Docker

The application is configured for deployment using Docker.

1.  **Build the Docker Image**:
    The provided `Dockerfile` builds the application and sets up a production-ready Node.js server.

    ```bash
    docker build -t your-docker-username/your-project-name:latest .
    ```

2.  **Run the Container**:
    Use the `docker-compose.yaml` file to run your application along with its database and cache services. Make sure your `.env` file is configured with your production settings.

    ```bash
    docker-compose up -d
    ```

    This will start the `web` service (your app), the `db` (PostgreSQL), and `redis` services.
