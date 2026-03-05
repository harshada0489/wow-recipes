# Wow Recipes

A full-stack recipe website with an admin panel for managing recipes, categories, and legal/informational pages.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui components
- **Backend**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express (backend)
- **State**: TanStack React Query for server state
- **Auth**: Session-based with express-session + memorystore
- **File Upload**: multer (images stored in `/uploads`)

## Database Schema

- `users` - Admin accounts (seeded: admin / password123)
- `categories` - Recipe categories (name, slug, description)
- `recipes` - Recipes (title, description, ingredients[], instructions[], imageUrl, categoryId, prepTime, cookTime, servings)
- `legal_pages` - Legal/info pages (title, slug, content)

## API Routes

All prefixed with `/api`:

- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user
- `GET/POST /api/categories` - List/create categories
- `PATCH/DELETE /api/categories/:id` - Update/delete category
- `GET/POST /api/recipes` - List/create recipes
- `PATCH/DELETE /api/recipes/:id` - Update/delete recipe
- `POST /api/upload` - Image upload (multipart/form-data)
- `GET/POST /api/pages` - List/create legal pages
- `GET /api/pages/by-slug/:slug` - Get page by slug
- `PATCH/DELETE /api/pages/:id` - Update/delete page

## Frontend Pages

- `/` - Home page with recipe grid
- `/recipe/:id` - Recipe detail with ingredients checkboxes
- `/category/:slug` - Category filtered recipes (planned)
- `/page/:slug` - Dynamic legal/info pages
- `/admin` - Protected admin dashboard (login required)

## Key Files

- `shared/schema.ts` - Drizzle schema + Zod validation
- `server/routes.ts` - Express API routes
- `server/storage.ts` - Database CRUD operations
- `server/seed.ts` - Database seeding (admin user, categories, legal pages)
- `server/db.ts` - Database connection
- `client/src/App.tsx` - Frontend router
- `client/src/pages/admin/` - Admin login + dashboard
- `client/src/components/layout/` - Header + Footer
