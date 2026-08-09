import path from 'path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { db: ReturnType<typeof drizzle> | undefined }

function initDb() {
  const dbPath = path.join(process.cwd(), 'gestao.db')
  const isVercel = Boolean(process.env.VERCEL)

  try {
    // ponytail: no Vercel (read-only filesystem), abre em modo readonly para não falhar ao criar WAL
    const sqlite = new Database(dbPath, { readonly: isVercel })
    if (!isVercel) {
      try {
        sqlite.pragma('journal_mode = WAL')
        sqlite.pragma('foreign_keys = ON')
      } catch (pragmaErr) {
        console.warn('[DB Pragma Warning]:', pragmaErr)
      }
    }
    return drizzle(sqlite, { schema })
  } catch (err) {
    console.warn('[DB Init Fallback to Memory]:', err)
    // Fallback seguro em memória se a leitura de arquivo falhar na Vercel
    const memorySqlite = new Database(':memory:')
    return drizzle(memorySqlite, { schema })
  }
}

export const db = globalForDb.db ?? initDb()
if (process.env.NODE_ENV !== 'production') globalForDb.db = db
