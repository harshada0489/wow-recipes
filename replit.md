# Wow Recipes

A full-stack recipe website with an admin panel for managing recipes, categories, legal pages, monetization (affiliate links, ads), and community features (comments & ratings).

## Architecture

- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui components
- **Backend**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express (backend)
- **State**: TanStack React Query for server state (staleTime: Infinity, always invalidate after mutations)
- **Auth**: Session-based with express-session + memorystore, bcryptjs for password hashing
- **File Upload**: multer (images stored in `/uploads`)

## Design

- Fonts: Playfair Display (serif headings) + Inter (body)
- Primary color: terracotta (`12 76% 61%`)
- Warm off-white background
- Wouter v3: `Link` renders its own `<a>` tag — do NOT wrap content in `<a>` inside `<Link>`

## Admin Access

- Default credentials: admin / SecureAdmin2026!
- Admin URL: `/admin` (no public links — must type URL manually)
- Password hashed with bcryptjs (12 rounds)
- All mutating API routes protected with `requireAuth` middleware
- Admin panel uses separate sidebar layout (AdminLayout.tsx)
- Admin can change password at `/admin/settings`

## Database Schema

- `users` - Admin accounts (password stored as bcrypt hash)
- `categories` - Recipe categories (name, slug, description)
- `recipes` - Recipes (title, description, ingredients[], instructions[], imageUrl, categoryId, prepTime, cookTime, servings, showAds)
- `legal_pages` - Legal/info pages (title, slug, content)
- `affiliate_links` - Product recommendations tied to recipes (title, url, imageUrl, recipeId)
- `comments` - User reviews with ratings (authorName, text, rating 1-5, adminReply, recipeId, isApproved, createdAt)
- `ad_placements` - Ad network scripts (title, scriptCode, isActive, location: sidebar/below-recipe/above-comments/header-banner)

## API Routes

All prefixed with `/api`. Routes marked (auth) require session authentication.

- `POST /api/auth/login` - Admin login (bcrypt.compare)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user
- `POST /api/auth/change-password` (auth) - Change admin password
- `GET /api/categories` - List categories
- `POST /api/categories` (auth) - Create category
- `PATCH/DELETE /api/categories/:id` (auth) - Update/delete category
- `GET /api/recipes` - List recipes
- `POST /api/recipes` (auth) - Create recipe
- `PATCH/DELETE /api/recipes/:id` (auth) - Update/delete recipe
- `POST /api/upload` (auth) - Image upload
- `GET /api/pages` - List pages
- `GET /api/pages/by-slug/:slug` - Get page by slug
- `POST /api/pages` (auth) - Create page
- `PATCH/DELETE /api/pages/:id` (auth) - Update/delete page
- `GET /api/affiliate-links` (auth) - All affiliate links
- `GET /api/affiliate-links/recipe/:recipeId` - Links for a recipe (public)
- `POST /api/affiliate-links` (auth) - Create link
- `PATCH/DELETE /api/affiliate-links/:id` (auth) - Update/delete link
- `GET /api/comments` (auth) - All comments (admin moderation)
- `GET /api/comments/recipe/:recipeId` - Approved comments (public)
- `POST /api/comments` - Submit comment (public, needs approval)
- `PATCH /api/comments/:id/approve` (auth) - Approve comment
- `PATCH /api/comments/:id/reply` (auth) - Admin reply
- `DELETE /api/comments/:id` (auth) - Delete comment
- `GET /api/ad-placements` (auth) - All ad placements
- `GET /api/ad-placements/active` - Active placements (public)
- `POST /api/ad-placements` (auth) - Create placement
- `PATCH/DELETE /api/ad-placements/:id` (auth) - Update/delete placement

## Frontend Pages

### Public
- `/` - Home page with recipe grid
- `/recipe/:id` - Recipe detail with ingredients, instructions, affiliate links, comments/ratings, ad slots
- `/category/:slug` - Category filtered recipes
- `/page/:slug` - Dynamic legal/info pages

### Admin (sidebar layout, auth required)
- `/admin` - Login page (redirects to dashboard if authenticated)
- `/admin/dashboard` - Recipe management
- `/admin/categories` - Category management
- `/admin/pages` - Legal page management
- `/admin/comments` - Comment moderation (approve/reply/delete)
- `/admin/ads` - Ad placement management
- `/admin/settings` - Change password

## Key Files

- `shared/schema.ts` - Drizzle schema + Zod validation
- `server/routes.ts` - Express API routes (with requireAuth middleware)
- `server/storage.ts` - Database CRUD operations
- `server/seed.ts` - Database seeding (admin with bcrypt hash, categories, legal pages)
- `server/db.ts` - Database connection
- `client/src/App.tsx` - Frontend router
- `client/src/lib/mock-data.ts` - TypeScript type definitions
- `client/src/components/layout/AdminLayout.tsx` - Admin sidebar layout
- `client/src/components/layout/Header.tsx` - Public header (no admin links)
- `client/src/components/layout/Footer.tsx` - Public footer
- `client/src/pages/admin/index.tsx` - Admin router with auth guards
- `client/src/pages/admin/dashboard.tsx` - Recipe management
- `client/src/pages/admin/categories.tsx` - Category management
- `client/src/pages/admin/pages-admin.tsx` - Page management
- `client/src/pages/admin/comments.tsx` - Comment moderation
- `client/src/pages/admin/ads.tsx` - Ad management
- `client/src/pages/admin/settings.tsx` - Change password
- `client/src/pages/admin/login.tsx` - Admin login form
- `client/src/pages/recipe-detail.tsx` - Recipe detail with affiliate links, comments, ads
