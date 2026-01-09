# The Dream Census v3

> A ritual-first dream reflection app with research-grade data collection

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# Initialize database
pnpm db:generate
pnpm db:migrate

# Start development
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

See the [docs/](./docs/) directory for complete specifications:

### Core
- [Architecture](./docs/architecture.md) - System design and technology choices
- [Database Schema](./docs/schema.prisma.md) - Complete Prisma schema
- [Build Roadmap](./docs/build-roadmap.md) - 8-week implementation plan

### Design System
- [Components](./docs/components.md) - UI component specifications
- [UX Enhancements](./docs/ux-enhancements.md) - Visual design, interactions, rewards
- [Patterns](./docs/patterns.md) - Code conventions and CSS patterns

### User Flows
- [Onboarding](./docs/flows/onboarding.md) - 4-screen onboarding flow
- [Morning Mode](./docs/flows/morning-mode.md) - Dream capture ritual
- [Night Mode](./docs/flows/night-mode.md) - Pre-sleep check-in
- [Day Loop](./docs/flows/day-loop.md) - Daily prompts and reflection

## Project Structure

```
dreamcensus-v3/
├── docs/              # Documentation
├── prisma/            # Database schema and migrations
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities and services
│   └── generated/     # Auto-generated code (Prisma)
└── public/            # Static assets
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run tests with Vitest
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: React 19 (Server Components)
- **Language**: TypeScript 5
- **Database**: PostgreSQL + Prisma 6
- **Styling**: Tailwind CSS 4
- **Animation**: Motion 11
- **Validation**: Zod 4
- **Testing**: Vitest + Testing Library

## License

Private - All rights reserved
