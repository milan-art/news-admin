# Daily Pulse Backend

## Goals
- Provide REST APIs for the admin panel and the public-facing Daily Pulse site.
- Persist news content, categories, users, media, and analytics metadata in MySQL.
- Offer secure authentication and role-based authorization for admins, editors, and journalists.
- Supply high-performance public endpoints for trending stories, article detail pages, and category feeds.

## High-Level Architecture
- **Runtime**: Node.js 20+, Express 4.
- **Database**: MySQL 8 with Prisma ORM for schema management, migrations, and type-safe queries.
- **Auth**: JWT access + refresh tokens, BCrypt password hashing, role guard middleware.
- **Storage**: Local/uploads directory initially, abstracted to allow S3 migration.
- **Validation**: Zod schemas.
- **Tooling**: ESLint, Prettier, nodemon for dev, vitest + supertest for integration tests.

```
backend/
  src/
    app.ts            # Express app
    server.ts         # Entry point
    config/           # Env and logger
    middleware/       # Auth, error handling
    modules/
      auth/
      articles/
      categories/
      users/
      analytics/
      media/
    utils/
  prisma/
    schema.prisma
  tests/
  .env.example
```

## Data Model (initial draft)
- `User`: id, name, email, password_hash, role (`ADMIN | EDITOR | JOURNALIST`), status, last_login_at, created_at.
- `Category`: id, name, slug, color, description, order, created_at, updated_at.
- `Article`: id, title, slug, excerpt, content_html, status (`DRAFT | PUBLISHED`), hero_image_url, published_at, scheduled_at, author_id → `User`, category_id → `Category`, created_at, updated_at.
- `ArticleTag`: id, name, slug.
- `ArticleTagMap`: article_id, tag_id.
- `ArticleView`: daily aggregated counts per article (for analytics dashboard).
- `MediaAsset`: id, original_filename, mime_type, url, created_by.
- `Notification`: id, type, payload, seen, created_at (for future real-time features).

## Core API Surfaces

### Admin Panel APIs
- `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.
- `GET /dashboard/summary` – totals, charts driven by views + article metadata.
- **Articles**
  - `GET /articles` – filters by status, category, search, pagination.
  - `POST /articles` – create draft/published article (supports scheduling).
  - `GET /articles/:id`, `PATCH /articles/:id`, `DELETE /articles/:id`.
  - `POST /articles/:id/publish`, `POST /articles/:id/unpublish`.
  - `POST /articles/:id/media` – upload cover image.
  - `POST /articles/bulk` – bulk actions (publish/unpublish/delete/change-category).
- **Categories**
  - CRUD endpoints with slug validation.
- **Users**
  - CRUD + role updates, invite workflow, status toggling.
- **Analytics**
  - `GET /analytics/performance` – funnel + retention data.
  - `GET /analytics/top-contributors`.
- **Settings**
  - `GET/PUT /settings/preferences` – editorial toggles stored in DB.

### Public Website APIs
- `GET /v1/home` – trending, latest per category, hero stories.
- `GET /v1/articles` – search + pagination.
- `GET /v1/articles/:slug` – detail view with related articles, increments view count.
- `GET /v1/categories/:slug` – category feed.
- `GET /v1/tags/:slug` – tag feed.
- `POST /v1/newsletter/subscribe` – integration placeholder.

## Integration Plan
1. Scaffold Express app with Prisma + MySQL connection.
2. Implement migrations & seed data that matches existing mock content.
3. Replace admin panel mock data with API calls via React Query/RTK Query (per feature slice).
4. Add `.env` to admin panel for API base URL; configure axios client.
5. Provide Postman collection + docs in `backend/README.md` (future update).

## Outstanding Questions
- Do we need server-side rendering for the public site? Currently assuming SPA consumes REST.
- Media storage: confirm whether to use S3 or remain on disk.
- Email delivery for invites/newsletter – placeholder service for now.

> This document will evolve as we build the backend. The next step is to initialize the Node.js project and Prisma schema.

