import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'

// Use DRIZZLE_DB_URL (server-only). The old NEXT_PUBLIC_ name exposed the
// connection string in the browser bundle — never use NEXT_PUBLIC_ for secrets.
const sql = neon(process.env.DRIZZLE_DB_URL ?? process.env.NEXT_PUBLIC_DRIZZLE_DB_URL!);
export const db = drizzle(sql, { schema });

