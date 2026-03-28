# 📚 Pocketbook

Pocketbook is a modern, self-hosted web application (with an upcoming native mobile app) for managing, reading, and discovering EPUB books.

Built as a Turborepo monorepo, Pocketbook provides a seamless and beautiful reading experience across devices with deep customization, progress tracking, and an integrated public library. The planned React Native mobile app will natively bring this reading experience to iOS and Android, ensuring your library is always at your fingertips.

## ✨ Features

- **📖 Interactive EPUB Reader**: Read your books directly in the browser with `react-reader` and `epub.js`.
- **🌗 Dark Mode**: Full systemic dark/light mode support, beautifully integrated into the app and the reading canvas.
- **📚 Library Management**: Upload your own EPUBs or browse and add public books to your personal library.
- **👀 Live Book Previews**: Skim through the first few pages of any public book beautifully rendered in a slide-out panel before adding it to your collection.
- **📊 Progress Tracking**: Your reading position and progress are securely synced with the backend so you can pick up where you left off.
- **🔎 Debounced Search**: Fast and performant local library queries.
- **🔒 Secure Authentication**: Industry-standard JWT access/refresh token cycle paired with optimized Bcrypt hashing.

## 🛠 Tech Stack

Pocketbook is structured as a full-stack monorepo powered by **[Turborepo](https://turbo.build/)** and **[pnpm workspaces](https://pnpm.io/)**.

### Frontend (`apps/web`)
- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS (with custom Slate Blue & Warm Amber palette)
- **State Management**: Zustand (Local theme persistence) & TanStack React Query (Server state)
- **Routing**: React Router DOM
- **Reader Engine**: React Reader / epub.js

### Backend (`apps/api`)
- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL 16 (Managed via Prisma ORM)
- **Caching/Session**: Redis 7
- **Auth**: Passport, JWT

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- Node.js (`>=20.0.0`)
- `pnpm` (`v9.x`)
- Docker & Docker Compose (for running the database and cache)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/alperengokbak/pocketbook.git
   cd pocketbook
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

### Infrastructure Setup

Pocketbook cleanly relies on local Docker containers for PostgreSQL and Redis to get you running fast.

1. **Start the database services:**
   ```bash
   docker-compose up -d
   ```
   *(This spins up `pocketbook-postgres` on port `5433` and `pocketbook-redis` on port `6380`)*

2. **Set your environment variables:**
   Duplicate the example env file in `apps/api`:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   *(The default values in `.env.example` perfectly match the `docker-compose.yml` config.)*

3. **Initialize the Database:**
   Push the Prisma schema to set up the SQL tables.
   ```bash
   cd apps/api
   pnpm prisma db push
   cd ../..
   ```

### Running the App

Start the development servers for both the web frontend and API backend simultaneously using Turborepo:

```bash
pnpm dev
```

- Web UI: http://localhost:5173
- API: http://localhost:3001

## 📂 Repository Structure

```text
├── apps
│   ├── api              # NestJS Backend API
│   │   ├── prisma       # Database schema & migrations
│   │   └── src          # Controllers, Modules, Services
│   └── web              # React Frontend
│       └── src          # Components, Hooks, UI views
├── docker-compose.yml   # PostgreSQL & Redis infrastructure
├── turbo.json           # Turborepo build pipeline
└── package.json         # Workspace definitions
```

## 🗺 Roadmap

- **📱 Mobile App**: A dedicated mobile application (React Native/Expo) is planned to bring Pocketbook's reading experience natively to iOS and Android, allowing for offline reading, native notifications, and seamless device synchronization.

## 📜 License

[MIT License](LICENSE)
