# GitHub Copilot Custom Instructions

## How should GitHub Copilot behave in this repository?

- Use Next.js (React, TypeScript) conventions for all code.
- Place new pages in the correct subfolder of `src/app/` (`(public)`, `(protected)`, or `api`).
- Use `.tsx` for React components and prefer functional components.
- Use Tailwind CSS for all styling.
- For database access, use Prisma ORM with the schema in `prisma/schema.prisma`.
- For authentication, use AuthJS (Next-Auth) and follow the config in `src/server/auth/config.ts`.
- For APIs, use tRPC and add new procedures to `src/server/api/router.ts` and related files.
- Use TypeScript for all new code.
- Follow the established folder structure and naming conventions.
- Use ESLint and Prettier for code style and formatting.
- Add comments to explain complex logic.
- Prefer server components unless client interactivity is required.
- For protected routes, use `protectedProcedure` in tRPC or place pages in `(protected)`.
- Use environment variables from `.env` or `.env.local` for secrets and DB connection strings.

## What language style and formatting should Copilot use?

- TypeScript for all code.
- Functional React components.
- Tailwind CSS for styling.
- Consistent with ESLint and Prettier settings in this repo.
- Use clear, concise variable and function names.
- Add JSDoc comments for exported functions and components.

## Example prompts for this repository

- Add a new protected page for user profile.
- Create a tRPC procedure to fetch all users.
- Add a new Prisma model for 'Event' with fields name, date, and location.
- Show an example of using AuthJS session in a React component.

---

For more details, see the main [README.md](../web/README.md).
