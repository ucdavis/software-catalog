# Software Catalog

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## 🚀 Getting Started

### Development Setup Options

You can develop this application using several methods:

#### Option 1: DevContainers (Recommended)

**Prerequisites:**

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

**Setup:**

**Quick Setup (Recommended):**
```bash
# Clone the repository
git clone <repository-url>
cd software-catalog

# Run the setup script
./setup-devcontainer.sh
```

This script will:
- ✅ Check Docker installation
- ✅ Install required VS Code extensions
- ✅ Create `.env` file from `.env.example` if needed
- ✅ Open the project in VS Code

**Manual Setup:**
1. Clone the repository
2. Open the project in VS Code
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "Dev Containers: Reopen in Container" and select it
5. VS Code will build the development container and reopen the project inside it

**Features included in DevContainer:**

- Node.js 20 with all dependencies pre-installed
- TypeScript, Prisma, and Next.js tooling
- Pre-configured VS Code extensions for optimal development
- Git integration and GitHub CLI
- Docker-in-Docker support
- Hot reload and live development

#### Option 2: Docker Compose

**For development with hot reload:**

```bash
# Copy environment variables
cp .env.example .env
# Edit .env with your database URL

# Start development environment
./dev-setup.sh dev
# OR
docker-compose up --build app-dev
```

**For production testing:**

```bash
./dev-setup.sh prod
# OR
docker-compose up --build app
```

#### Option 3: Local Development

**Prerequisites:**

- Node.js 20+
- npm or yarn

**Setup:**

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database URL

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file based on `.env.example` and configure:

- `DATABASE_URL` - Your database connection string
- `AUTH_SECRET` - Random secret for NextAuth.js authentication
- `AUTH_DISCORD_ID` - Discord application ID for OAuth
- `AUTH_DISCORD_SECRET` - Discord application secret for OAuth
- Other environment-specific variables

#### Generating AUTH_SECRET in DevContainers

When developing in devcontainers, you can use the included script to automatically generate a secure AUTH_SECRET in your `.env` file:

```bash
# Inside the DevContainer terminal
./generate-auth-secret.sh
```

This script will:
1. Generate a cryptographically secure AUTH_SECRET using `npx auth secret`
2. Move the secret from `.env.local` to your main `.env` file
3. Clean up the temporary `.env.local` file

**Note:** The `auth` package is included as a devDependency specifically for this purpose in devcontainer environments.

### Available Scripts

**Development Scripts:**
- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Database Scripts:**
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open Prisma Studio

**Setup Scripts:**
- `./setup-devcontainer.sh` - Set up DevContainer environment
- `./validate-devcontainer.sh` - Validate DevContainer setup
- `./generate-auth-secret.sh` - Generate AUTH_SECRET in .env file
- `./test-workspace-mounting.sh` - Test workspace file mounting
- `./test-package-json.sh` - Verify package.json accessibility
- `./test-npm-permissions.sh` - Test npm install permissions
- `./dev-setup.sh dev` - Start development with Docker Compose
- `./dev-setup.sh prod` - Start production with Docker Compose

### Spellchecking

This project uses [cspell](https://cspell.org/) for spell checking across the codebase to maintain code quality and consistency.

**Running spell check:**

```bash
# Check spelling in all files
npm run spell
```

**Configuration:**

- Custom words and project-specific terms can be added to `cspell.config.json`
- Common technical terms, library names, and project vocabulary are pre-configured
- Spell check runs on TypeScript, JavaScript, Markdown, and JSON files

**Adding custom words:**

If you encounter legitimate words that cspell flags as misspelled:

1. Add them to the `words` array in `cspell.json`
2. Or use inline comments for one-off cases:
   ```typescript
   // cspell:disable-next-line
   const myCustomVariable = "someValue";
   ```

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

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

### Troubleshooting DevContainers

**Container won't start:**

1. Ensure Docker Desktop is running
2. Check Docker resources (memory/CPU)
3. Try the setup script: `./setup-devcontainer.sh`
4. Try rebuilding: `Ctrl+Shift+P` → "Dev Containers: Rebuild Container"

**Slow performance:**

- Increase Docker Desktop memory allocation
- Use volume mounts for node_modules (already configured)
- Consider using Docker Desktop with WSL2 on Windows

**Database connection issues:**

1. Ensure `.env` file exists and contains valid `DATABASE_URL`
2. Check if database is accessible from container
3. Try running `npm run db:push` to sync schema

**Extension not working:**

1. Run the setup script: `./setup-devcontainer.sh`
2. Reload VS Code window: `Ctrl+R` (or `Cmd+R` on Mac)
3. Check if extension is enabled in container
4. Rebuild container if persistent

**Setup script troubleshooting:**

If `./setup-devcontainer.sh` fails:
- Ensure Docker Desktop is running
- Make sure you have permission to execute the script: `chmod +x setup-devcontainer.sh`
- Check that VS Code is installed and the `code` command is available
- Manually install the Dev Containers extension if needed

**Files not visible in DevContainer:**

If your project files aren't visible in the DevContainer:
1. Ensure you're opening the project from the correct directory
2. Check that the DevContainer opened in the right workspace folder
3. Run `./test-workspace-mounting.sh` to verify host directory structure
4. Try rebuilding the container: `Ctrl+Shift+P` → "Dev Containers: Rebuild Container"

### Working with Databases

**Using Prisma Studio:**

```bash
# Inside the DevContainer terminal
npm run db:studio
```

Then navigate to `http://localhost:5555` in your browser.

**Database migrations:**

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# Reset database (development only)
npm run db:push
```

## 🚀 How do I deploy this?

### Docker Deployment

This project includes optimized Docker configurations for production deployment:

**Building the production image:**

```bash
# Build the production image
docker build -t software-catalog .

# Run the production container
docker run -p 3000:3000 -e DATABASE_URL="your-database-url" software-catalog
```

**Using Docker Compose:**

```bash
# Update docker-compose.yml with your environment variables
# Then run:
docker-compose up --build app
```

**Docker Features:**

- Multi-stage build for minimal image size
- Distroless runtime for security
- Standalone Next.js output
- Non-root user execution
- Optimized layer caching

### Other Deployment Options

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

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
4. Test with `./dev-setup.sh dev`
5. Submit a pull request
