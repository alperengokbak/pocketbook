# Pocketbook - Change Tracking

## Git Commits

### 1. `0bac7d8` - First commit
- Initial project scaffold: Turbo monorepo with pnpm workspaces
- NestJS API (port 3001) with Prisma + PostgreSQL + Redis
- React + Vite web app (port 3000) with Tailwind CSS
- Shared packages: shared-types, validators, api-client, tsconfig
- Auth module: register, login, refresh token rotation, logout
- Books module: EPUB/PDF upload (Multer), public library, user library
- Reader: EPUB rendering with ReactReader, word click translation, progress tracking
- Translations: 3-tier caching (Redis -> PostgreSQL -> MyMemory API)
- Vocabulary: save/list/delete words, SM-2 spaced repetition
- Quiz: flashcards + multiple choice from saved vocabulary
- Dashboard: reading stats, continue reading, review prompts
- Docker Compose: PostgreSQL (5433) + Redis (6380)
- Seed data: 5 public domain EPUB books, 20 EN->TR translations, test user

### 2. `1502766` - Added verification for My Books page
- Added validation/verification logic for the My Books tab in the library

### 3. `7a77b39` - Dark mode added
- Full dark mode support across all pages and components
- Theme store (Zustand) for managing light/dark/system preference

### 4. `fc1788c` - Modified secondary colour palette
- Refactored secondary colour palette for better visual consistency

## Unstaged Changes

### Library Page Enhancements (`apps/web/src/routes/library/index.tsx`)
- **Book Preview Modal (Redesigned)**: Clean 3-section layout: top info bar, EPUB reader, bottom action bar
  - Top: Book icon, title, author, format badge, file size, close button
  - Middle: Embedded EPUB reader with 5-page preview limit and navigation arrows
  - Bottom: Progress dots (1-5/5) and "Add to Library" button
  - Lock overlay with blur effect when preview limit reached
  - Escape key and backdrop click to close
  - Dark mode support throughout
- **Improved Book Cards**: Enhanced card styling with hover effects, animations, format badges
- **Public Library UX**: Click-to-preview instead of direct "Add to Library" button

## Verified (2026-03-29)

- [x] API server starts and responds on port 3001
- [x] Login works with test@pocketbook.dev / password123
- [x] Public library returns 5 seeded books (Frankenstein, Sherlock Holmes, Great Gatsby, etc.)
- [x] EPUB files served correctly via /uploads/books/
- [x] Translation endpoint works: "adventure" -> "macera" (from DB cache)
- [x] Vocabulary list returns 8 seeded words with mastery levels
- [x] Quiz generation works (FLASHCARD type tested)
- [x] Vocabulary stats endpoint: {total: 8, toReview: 8, mastered: 0}
- [x] Add book to library and reader content endpoint work

## Pending / Known Issues

- [ ] PDF rendering is placeholder only ("coming soon")
- [ ] Unstaged changes need to be committed (BookPreviewModal in library)
