# Software Catalog

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7772438606b746fbac8563d1738d0e51)](https://app.codacy.com/gh/ucdavis/software-catalog/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![CodeQL Advanced](https://github.com/ucdavis/software-catalog/actions/workflows/codeql.yml/badge.svg)](https://github.com/ucdavis/software-catalog/actions/workflows/codeql.yml)
[![Development Environment Test](https://github.com/ucdavis/software-catalog/actions/workflows/dev-environment-test.yml/badge.svg)](https://github.com/ucdavis/software-catalog/actions/workflows/dev-environment-test.yml)

A modern software catalog built with the [T3 Stack](https://create.t3.gg/) - Next.js, TypeScript, Prisma, TailwindCSS, and tRPC.

## 🚀 Quick Start

### DevContainers (Recommended)

```bash
git clone https://github.com/ucdavis/software-catalog.git
cd software-catalog
npm run devcontainer:setup
```

This automatically sets up Docker, VS Code extensions, and opens the project in a DevContainer.

### Local Development

```bash
git clone https://github.com/ucdavis/software-catalog.git
cd software-catalog
npm install
cp .env.example .env  # Edit with your settings
npm run generate:auth-secret
npm run db:generate
npm run dev
```

### Docker Compose

```bash
cp .env.example .env  # Edit with your settings
npm run dev:setup     # Development
npm run dev:setup:prod  # Production testing
```

## ⚙️ Environment Setup

1. Copy the environment template: `cp .env.example .env`
2. Generate an auth secret: `npm run generate:auth-secret`
3. Configure your database URL and OAuth credentials in `.env`

**Key Environment Variables:**

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Generated automatically with the script above
- `AUTH_DISCORD_ID` & `AUTH_DISCORD_SECRET` - Discord OAuth credentials

## 📜 Available Scripts

**Core Development:**

```bash
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run spell                  # Check spelling
```

**Database Management:**

```bash
npm run db:generate            # Generate Prisma client
npm run db:push                # Push schema changes
npm run db:studio              # Open Prisma Studio
npm run db:start               # Start database container
```

**Environment Setup:**

```bash
npm run generate:auth-secret   # Generate AUTH_SECRET
npm run devcontainer:setup     # Setup DevContainer
npm run dev:setup              # Start with Docker Compose
npm run dev:setup:clean        # Cleanup containers
```

> **💡 Tip:** Run `npm run` to see all available scripts

## 🛠️ Tech Stack

- **[Next.js](https://nextjs.org)** - React framework with App Router
- **[TypeScript](https://typescriptlang.org)** - Type-safe JavaScript
- **[Prisma](https://prisma.io)** - Database ORM and migrations
- **[TailwindCSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[tRPC](https://trpc.io)** - End-to-end typesafe APIs
- **[NextAuth.js](https://next-auth.js.org)** - Authentication

**Learn more:** [T3 Stack Documentation](https://create.t3.gg/)

## 🐳 DevContainer Features

### Included Extensions

The DevContainer comes pre-configured with essential VS Code extensions:

- **TypeScript & JavaScript**: Enhanced IntelliSense and debugging
- **Tailwind CSS**: Auto-completion and syntax highlighting
- **ESLint & Prettier**: Code linting and formatting
- **Prisma**: Database schema management
- **Git**: Advanced Git integration with GitLens
- **Docker**: Container management from within VS Code
- **Testing**: Jest test runner integration

### Port Forwarding

The following ports are automatically forwarded:

- `3000` - Next.js development server
- `3001` - Next.js preview server
- `5000` - Alternative development port
- `5555` - Prisma Studio (when running)
- `8080` - General purpose port

### Common Issues

**DevContainer won't start:** Ensure Docker is running, try `npm run devcontainer:setup`

**Database issues:** Check `.env` file, run `npm run db:push` to sync schema

**Performance:** Increase Docker memory allocation, use WSL2 on Windows

**Files not visible:** Run `npm run test:workspace-mounting`, try rebuilding container

## 🚀 Deployment

**Docker:**

```bash
docker build -t software-catalog .
docker run -p 3000:3000 -e DATABASE_URL="your-db-url" software-catalog
```

**Docker Compose:**

```bash
npm run dev:setup:prod
```

**Other platforms:** [Vercel](https://create.t3.gg/en/deployment/vercel) | [Netlify](https://create.t3.gg/en/deployment/netlify) | [Docker Guide](https://create.t3.gg/en/deployment/docker)

## 🤝 Contributing

When contributing to this project:

1. **Use DevContainers** for consistent development environment
2. **Follow the coding standards** enforced by ESLint and Prettier
3. **Test your changes** in both development and production containers
4. **Update documentation** as needed

**Quick contribution setup:**

1. Fork the repository
2. Open in VS Code with DevContainers
3. Make your changes
4. Test with `npm run dev:setup`
5. Submit a pull request
