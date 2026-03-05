# Wow Recipes

A full-stack recipe website with an admin panel for managing recipes, categories, legal pages, monetization (affiliate links, ads), and community features (comments & ratings).

## Architecture

- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui components
- **Backend**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express (backend)
- **State**: TanStack React Query for server state (staleTime: Infinity, always invalidate after mutations)
- **Auth**: Session-based with express-session + memorystore
- **File Upload**: multer (images stored in `/uploads`)

## Design

- Fonts: Playfair Display (serif headings) + Inter (body)
- Primary color: terracotta (`12 76% 61%`)
- Warm off-white background
- Wouter v3: `Link` renders its own `<a>` tag — do NOT wrap content in `<a>` inside `<Link>`

## Database Schema

- `users` - Admin accounts (seeded: admin / password123)
- `categories` - Recipe categories (name, slug, description)
- `recipes` - Recipes (title, description, ingredients[], instructions[], imageUrl, categoryId, prepTime, cookTime, servings, showAds)
- `legal_pages` - Legal/info pages (title, slug, content)
- `affiliate_links` - Product recommendations tied to recipes (title, url, imageUrl, recipeId)
- `comments` - User reviews with ratings (authorName, text, rating 1-5, adminReply, recipeId, isApproved, createdAt)
- `ad_placements` - Ad network scripts (title, scriptCode, isActive, location: sidebar/below-recipe/above-comments/header-banner)

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
- `GET /api/affiliate-links` - All affiliate links
- `GET /api/affiliate-links/recipe/:recipeId` - Links for a recipe
- `POST /api/affiliate-links` - Create (auth required)
- `PATCH/DELETE /api/affiliate-links/:id` - Update/delete (auth required)
- `GET /api/comments` - All comments (auth required, admin moderation)
- `GET /api/comments/recipe/:recipeId` - Approved comments for a recipe (public)
- `POST /api/comments` - Submit a comment (public, needs approval)
- `PATCH /api/comments/:id/approve` - Approve comment (auth required)
- `PATCH /api/comments/:id/reply` - Admin reply (auth required)
- `DELETE /api/comments/:id` - Delete comment (auth required)
- `GET /api/ad-placements` - All ad placements
- `GET /api/ad-placements/active` - Active placements only
- `POST /api/ad-placements` - Create (auth required)
- `PATCH/DELETE /api/ad-placements/:id` - Update/delete (auth required)

## Frontend Pages

- `/` - Home page with recipe grid
- `/recipe/:id` - Recipe detail with ingredients, instructions, affiliate links, comments/ratings, ad slots
- `/category/:slug` - Category filtered recipes
- `/page/:slug` - Dynamic legal/info pages
- `/admin` - Protected admin dashboard with tabs: Recipes, Categories, Pages, Comments, Ads

## Key Files

- `shared/schema.ts` - Drizzle schema + Zod validation
- `server/routes.ts` - Express API routes
- `server/storage.ts` - Database CRUD operations
- `server/seed.ts` - Database seeding (admin user, categories, legal pages)
- `server/db.ts` - Database connection
- `client/src/App.tsx` - Frontend router
- `client/src/lib/mock-data.ts` - TypeScript type definitions
- `client/src/pages/admin/dashboard.tsx` - Admin dashboard (Recipes, Categories, Pages, Comments, Ads tabs)
- `client/src/pages/recipe-detail.tsx` - Recipe detail with affiliate links, comments, ads
- `client/src/components/layout/` - Header + Footer
