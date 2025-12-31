# Database Seeding Scripts

This directory contains scripts for populating the Dream Census database with initial data and test data.

## Available Scripts

### Production Data Seeds

#### `seed-all.ts`
Master script that runs all seeders in the correct order.

```bash
cd app
npx tsx scripts/seed-all.ts
```

#### `seed-chapters.ts`
Seeds the census chapter structure (required first).

#### `seed-from-typeform.ts`
Imports census questions from Typeform export data.

#### `seed-stream-questions.ts`
Creates the initial pool of questions for the Stream exploration interface.

### Test Data Seeds

#### `seed-dream-data.ts`
**NEW** - Creates mock dream entries with emotions and symbols for testing the Data Observatory.

```bash
cd app
npx tsx scripts/seed-dream-data.ts
```

**What it creates:**
- 12 test users (`dreamer1@test.local` through `dreamer12@test.local`)
- 15 emotions with valence/arousal values
- 34 symbols across 6 taxonomies (people, places, animals, objects, actions, themes)
- 100 dream entries spread across the last 72 hours
- Realistic emotion and symbol associations
- Calculated aggregate statistics

**Use cases:**
- Testing the Data Observatory (`/data` page)
- Verifying Dream Weather visualization
- Testing symbol frequency and emotion distribution
- Development without real user data

### Verification Scripts

#### `verify-dream-data.ts`
Checks that seeded dream data is properly accessible and displays summary statistics.

```bash
cd app
npx tsx scripts/verify-dream-data.ts
```

## Migration Scripts

#### `migrate-chapters-v2.ts`
Updates chapter structure to v2 schema.

#### `migrate-to-postgres.ts`
Migration helper for moving from SQLite to PostgreSQL.

#### `check-step-order.ts`
Validates census step ordering and hierarchy.

## Usage Patterns

### Fresh Database Setup
```bash
cd app
npx tsx scripts/seed-all.ts
```

### Add Test Data for Development
```bash
cd app
npx tsx scripts/seed-dream-data.ts
npx tsx scripts/verify-dream-data.ts
```

### Reset Test Data
To reset test data, delete the test users and their associated dreams, then re-run the seed script:

```sql
-- In your database client
DELETE FROM "DreamEntry" WHERE "userId" IN (
  SELECT id FROM "User" WHERE email LIKE 'dreamer%@test.local'
);
DELETE FROM "User" WHERE email LIKE 'dreamer%@test.local';
```

Then run:
```bash
npx tsx scripts/seed-dream-data.ts
```

## Architecture Notes

All seed scripts follow these patterns:
- Use `PrismaClient` from `../src/generated/prisma`
- Check for existing records before creating (idempotent)
- Provide progress feedback via console
- Disconnect Prisma client in `finally` block
- Exit with code 1 on error

## Environment Requirements

- `DATABASE_URL` must be set in `.env`
- Database must be migrated (`npx prisma migrate deploy`)
- Node.js 20+ with TypeScript support (via tsx)

