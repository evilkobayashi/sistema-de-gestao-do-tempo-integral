import path from 'path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { sqlite: Database.Database | undefined }

const dbPath = path.join(process.cwd(), 'gestao.db')
const sqlite = globalForDb.sqlite ?? new Database(dbPath)
if (process.env.NODE_ENV !== 'production') globalForDb.sqlite = sqlite

sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
