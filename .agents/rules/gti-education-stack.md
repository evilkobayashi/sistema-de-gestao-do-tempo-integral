# GTI Educação — Project Rules & Stack Conventions

## 📌 Project Overview
- **Domain**: B2G Educational SaaS (Gestão de Alocação e Lotação de Oficineiros de Tempo Integral - 1º ao 9º ano).
- **Primary Stack**: Next.js 16 (App Router, React 19), Tailwind CSS v4, Lucide React, Recharts.
- **Database**: Drizzle ORM + `better-sqlite3` (`gestao.db`) / Supabase.
- **Export Engines**: `jspdf` + `jspdf-autotable`, `xlsx`, `html2canvas`.

## 🛠️ Development Guidelines
1. **Next.js 16 / React 19 Compatibility**:
   - Check Next.js 16 App Router async params/props conventions.
   - Keep Server and Client Components strictly separated (`'use client'`).
2. **Drizzle ORM Guidelines**:
   - Keep schema definitions clear in `src/db/schema.ts` (or `src/lib/db/`).
   - Use type-safe Drizzle queries and migrations via `drizzle-kit`.
3. **Reports & Exports**:
   - Ensure PDF and Excel exports generate clean formatted documents with headers suited for Municipal Secretariats (SME).
4. **Ponytail Simplicity**:
   - Avoid bloated abstractions. Build clean, readable components and direct database queries.
