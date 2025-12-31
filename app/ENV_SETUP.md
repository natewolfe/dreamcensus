# Environment Configuration Guide

## Database Configuration

### Development (SQLite)
```env
DATABASE_URL="file:./prisma/dev.db"
```

### Production (PostgreSQL)
```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

#### Example PostgreSQL Connection Strings

**Vercel Postgres:**
```env
DATABASE_URL="postgresql://user:pass@region.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
```

**Supabase:**
```env
DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"
```

**Railway:**
```env
DATABASE_URL="postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway"
```

## Application Configuration

```env
NODE_ENV="development"  # or "production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Your app URL
```

## Optional Configuration

### Session Duration
```env
SESSION_DURATION_MS=2592000000  # 30 days in milliseconds (default)
```

## Migration from SQLite to PostgreSQL

1. **Set up PostgreSQL database** with your hosting provider

2. **Update environment variables:**
   ```bash
   # Keep SQLite URL for migration source
   SQLITE_URL="file:./prisma/dev.db"
   
   # Set PostgreSQL as target
   DATABASE_URL="postgresql://..."
   ```

3. **Run Prisma migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Run data migration script:**
   ```bash
   SQLITE_URL="file:./prisma/dev.db" \
   DATABASE_URL="postgresql://..." \
   npx tsx scripts/migrate-to-postgres.ts
   ```

5. **Verify migration:**
   ```bash
   npx prisma studio
   ```

6. **Update production environment** to use PostgreSQL URL only

## Security Notes

- **Never commit** `.env` files to version control
- Use **strong passwords** for production databases
- Enable **SSL/TLS** connections in production (`?sslmode=require`)
- **Rotate credentials** regularly
- Use **environment-specific** connection strings
- Consider using **connection pooling** (PgBouncer or Prisma Accelerate) for production

## Troubleshooting

### Connection Issues
- Verify firewall rules allow database connections
- Check SSL/TLS requirements
- Ensure credentials are correct
- Verify database exists and is accessible

### Migration Issues
- Ensure both databases are accessible
- Check for sufficient disk space
- Verify Prisma schema is up to date
- Review migration logs for specific errors

