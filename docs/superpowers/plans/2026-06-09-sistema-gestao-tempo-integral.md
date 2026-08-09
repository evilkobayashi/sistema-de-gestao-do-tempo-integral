# Sistema de Gestão – Tempo Integral Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full municipal school workshop management dashboard with SQLite persistence, 8 routes, charts, and client-side PDF export.

**Architecture:** Next.js 16 App Router with server components reading directly from SQLite via Drizzle ORM. Mutations via Server Actions with `revalidatePath`. Charts are `'use client'` components receiving pre-shaped data as props from server pages.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Bun, Drizzle ORM, better-sqlite3, Recharts, jsPDF, html2canvas

> **Breaking change (Next.js 16):** `params` and `searchParams` are Promises — always `await` them. `PageProps`/`LayoutProps` are global type helpers, no import needed.

---

### Task 1: Install dependencies and configure Drizzle

**Files:**
- Modify: `package.json`
- Create: `src/lib/db.ts`
- Create: `src/lib/schema.ts`
- Create: `drizzle.config.ts`

- [ ] **Step 1: Install packages**

```bash
cd sistema-de-gestao-do-tempo-integral
bun add drizzle-orm better-sqlite3 recharts jspdf html2canvas
bun add -d drizzle-kit @types/better-sqlite3
```

Expected output: packages added, no errors.

- [ ] **Step 2: Create `src/lib/schema.ts`**

```ts
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core'

export const escolas = sqliteTable('escolas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
})

export const oficinas = sqliteTable('oficinas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
})

export const oficineiros = sqliteTable('oficineiros', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
})

export const turnos = sqliteTable('turnos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
})

export const lotacoes = sqliteTable('lotacoes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  escolaId: integer('escola_id').notNull().references(() => escolas.id),
  turnoId: integer('turno_id').notNull().references(() => turnos.id),
  turma: text('turma').notNull(),
  oficinaId: integer('oficina_id').notNull().references(() => oficinas.id),
  oficineiroId: integer('oficineiro_id').notNull().references(() => oficineiros.id),
  horasAula: real('horas_aula').notNull(),
  horasPlanejamento: real('horas_planejamento').notNull(),
  dias: text('dias').notNull(),
})
```

- [ ] **Step 3: Create `src/lib/db.ts`**

```ts
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const sqlite = new Database('gestao.db')
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
```

- [ ] **Step 4: Create `drizzle.config.ts`**

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: { url: './gestao.db' },
})
```

- [ ] **Step 5: Generate and run migration**

```bash
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

Expected: `drizzle/` folder created, `gestao.db` created with tables.

- [ ] **Step 6: Create `src/lib/seed.ts` and run it**

```ts
import { db } from './db'
import { escolas, oficinas, oficineiros, turnos } from './schema'

await db.insert(turnos).values([
  { nome: 'Manhã' },
  { nome: 'Tarde' },
  { nome: 'Noite' },
])
await db.insert(escolas).values([
  { nome: 'EM José de Anchieta' },
  { nome: 'EM Machado de Assis' },
  { nome: 'EM Dom Pedro I' },
])
await db.insert(oficinas).values([
  { nome: 'Robótica' },
  { nome: 'Teatro' },
  { nome: 'Música' },
  { nome: 'Capoeira' },
  { nome: 'Artes Visuais' },
])
await db.insert(oficineiros).values([
  { nome: 'João da Silva Souza' },
  { nome: 'Maria Lima Nunes' },
  { nome: 'Carlos Alberto Santos' },
])
console.log('Seed complete')
process.exit(0)
```

```bash
bun src/lib/seed.ts
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Drizzle schema, db client, and seed data"
```

---

### Task 2: Create shared layout (Sidebar + Header)

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Header.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create `src/components/layout/Sidebar.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/lotacoes', label: 'Cadastro de Lotações' },
  { href: '/oficineiros', label: 'Oficineiros' },
  { href: '/escolas', label: 'Escolas' },
  { href: '/resumo-escolas', label: 'Resumo das Escolas' },
  { href: '/resumo-oficineiros', label: 'Resumo dos Oficineiros' },
  { href: '/relatorios', label: 'Relatórios' },
  { href: '/configuracoes', label: 'Configurações' },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 min-h-screen bg-blue-900 text-white flex flex-col">
      <div className="p-4 font-bold text-sm border-b border-blue-700">
        Prefeitura de Queimados
      </div>
      <nav className="flex-1 py-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-4 py-3 text-sm hover:bg-blue-700 transition-colors ${
              pathname === link.href ? 'bg-blue-600 font-semibold' : ''
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-700">
        <span className="text-sm text-blue-300">Sair</span>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create `src/components/layout/Header.tsx`**

```tsx
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold tracking-wide">
          SISTEMA DE GESTÃO – TEMPO INTEGRAL
        </h1>
        <p className="text-xs text-gray-300">LOTAÇÃO DE OFICINEIROS</p>
      </div>
      <nav className="flex gap-2">
        {[
          { href: '/', label: 'Dashboard' },
          { href: '/oficineiros', label: 'Oficineiros' },
          { href: '/escolas', label: 'Escolas' },
          { href: '/relatorios', label: 'Relatórios' },
          { href: '/configuracoes', label: 'Configurações' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/relatorios"
        className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-500"
      >
        GERAR RELATÓRIOS PDF
      </Link>
    </header>
  )
}
```

- [ ] **Step 3: Update `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Gestão – Tempo Integral',
  description: 'Gestão de lotação de oficineiros',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.className} bg-gray-100`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify dev server starts without errors**

```bash
bun dev
```

Open `http://localhost:3000` — should see sidebar + header layout.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add sidebar and header layout"
```

---

### Task 3: Create `src/lib/queries.ts` (all aggregation queries)

**Files:**
- Create: `src/lib/queries.ts`

- [ ] **Step 1: Create `src/lib/queries.ts`**

```ts
import { db } from './db'
import { lotacoes, escolas, oficinas, oficineiros, turnos } from './schema'
import { eq, sql } from 'drizzle-orm'

export async function getKpis() {
  const rows = await db
    .select({
      escolaId: lotacoes.escolaId,
      oficineiroId: lotacoes.oficineiroId,
      oficinaId: lotacoes.oficinaId,
      turnoId: lotacoes.turnoId,
      turma: lotacoes.turma,
      horasAula: lotacoes.horasAula,
      horasPlanejamento: lotacoes.horasPlanejamento,
    })
    .from(lotacoes)

  const escolasCount = new Set(rows.map((r) => r.escolaId)).size
  const oficineirosCount = new Set(rows.map((r) => r.oficineiroId)).size
  const oficinasCount = new Set(rows.map((r) => r.oficinaId)).size
  const turmasCount = new Set(rows.map((r) => `${r.escolaId}-${r.turnoId}-${r.turma}`)).size
  const horasAula = rows.reduce((s, r) => s + r.horasAula, 0)
  const horasPlanejamento = rows.reduce((s, r) => s + r.horasPlanejamento, 0)

  return {
    escolasCount,
    oficineirosCount,
    oficinasCount,
    turmasCount,
    horasAula,
    horasPlanejamento,
    cargaTotal: horasAula + horasPlanejamento,
  }
}

export async function getCargaHorariaPorEscola() {
  return db
    .select({
      escola: escolas.nome,
      total: sql<number>`sum(${lotacoes.horasAula} + ${lotacoes.horasPlanejamento})`,
    })
    .from(lotacoes)
    .innerJoin(escolas, eq(lotacoes.escolaId, escolas.id))
    .groupBy(escolas.nome)
    .orderBy(sql`sum(${lotacoes.horasAula} + ${lotacoes.horasPlanejamento}) desc`)
}

export async function getOficinasPorEscola() {
  return db
    .select({
      escola: escolas.nome,
      count: sql<number>`count(distinct ${lotacoes.oficinaId})`,
    })
    .from(lotacoes)
    .innerJoin(escolas, eq(lotacoes.escolaId, escolas.id))
    .groupBy(escolas.nome)
}

export async function getCargaHorariaPorOfineiro() {
  return db
    .select({
      oficineiro: oficineiros.nome,
      total: sql<number>`sum(${lotacoes.horasAula} + ${lotacoes.horasPlanejamento})`,
    })
    .from(lotacoes)
    .innerJoin(oficineiros, eq(lotacoes.oficineiroId, oficineiros.id))
    .groupBy(oficineiros.nome)
}

export async function getTurmasPorTurno() {
  return db
    .select({
      turno: turnos.nome,
      count: sql<number>`count(distinct ${lotacoes.turma})`,
    })
    .from(lotacoes)
    .innerJoin(turnos, eq(lotacoes.turnoId, turnos.id))
    .groupBy(turnos.nome)
}

export async function getLotacoesCompletas() {
  return db
    .select({
      id: lotacoes.id,
      escola: escolas.nome,
      turno: turnos.nome,
      turma: lotacoes.turma,
      oficina: oficinas.nome,
      oficineiro: oficineiros.nome,
      horasAula: lotacoes.horasAula,
      horasPlanejamento: lotacoes.horasPlanejamento,
      dias: lotacoes.dias,
    })
    .from(lotacoes)
    .innerJoin(escolas, eq(lotacoes.escolaId, escolas.id))
    .innerJoin(turnos, eq(lotacoes.turnoId, turnos.id))
    .innerJoin(oficinas, eq(lotacoes.oficinaId, oficinas.id))
    .innerJoin(oficineiros, eq(lotacoes.oficineiroId, oficineiros.id))
    .orderBy(escolas.nome, turnos.nome, lotacoes.turma)
}

export async function getResumoEscolas() {
  return db
    .select({
      escola: escolas.nome,
      nOficinas: sql<number>`count(distinct ${lotacoes.oficinaId})`,
      nOficineiros: sql<number>`count(distinct ${lotacoes.oficineiroId})`,
      horasAula: sql<number>`sum(${lotacoes.horasAula})`,
      turmas: sql<number>`count(distinct ${lotacoes.turma})`,
    })
    .from(lotacoes)
    .innerJoin(escolas, eq(lotacoes.escolaId, escolas.id))
    .groupBy(escolas.nome)
    .orderBy(escolas.nome)
}

export async function getResumoOficineiros() {
  return db
    .select({
      oficineiro: oficineiros.nome,
      oficina: oficinas.nome,
      cargaTotal: sql<number>`sum(${lotacoes.horasAula} + ${lotacoes.horasPlanejamento})`,
      horasAula: sql<number>`sum(${lotacoes.horasAula})`,
      horasPlanejamento: sql<number>`sum(${lotacoes.horasPlanejamento})`,
    })
    .from(lotacoes)
    .innerJoin(oficineiros, eq(lotacoes.oficineiroId, oficineiros.id))
    .innerJoin(oficinas, eq(lotacoes.oficinaId, oficinas.id))
    .groupBy(oficineiros.nome, oficinas.nome)
    .orderBy(oficineiros.nome)
}

export async function getLookups() {
  const [allEscolas, allOficinas, allOficineiros, allTurnos] = await Promise.all([
    db.select().from(escolas).orderBy(escolas.nome),
    db.select().from(oficinas).orderBy(oficinas.nome),
    db.select().from(oficineiros).orderBy(oficineiros.nome),
    db.select().from(turnos),
  ])
  return { escolas: allEscolas, oficinas: allOficinas, oficineiros: allOficineiros, turnos: allTurnos }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat: add all aggregation queries"
```

---

### Task 4: Create reusable UI components

**Files:**
- Create: `src/components/ui/StatCard.tsx`
- Create: `src/components/ui/DataTable.tsx`
- Create: `src/components/ui/Modal.tsx`

- [ ] **Step 1: Create `src/components/ui/StatCard.tsx`**

```tsx
interface StatCardProps {
  label: string
  value: string | number
  sub?: string
}

export default function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-1 min-w-0">
      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</span>
      <span className="text-2xl font-bold text-gray-800">{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/ui/DataTable.tsx`**

```tsx
'use client'

import { useState } from 'react'

interface Column<T> {
  key: keyof T
  label: string
  render?: (val: T[keyof T], row: T) => React.ReactNode
}

interface DataTableProps<T extends { id: number }> {
  columns: Column<T>[]
  data: T[]
  onEdit?: (row: T) => void
  onDelete?: (id: number) => void
}

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const [filter, setFilter] = useState('')

  const filtered = filter
    ? data.filter((row) =>
        Object.values(row).some((v) =>
          String(v).toLowerCase().includes(filter.toLowerCase())
        )
      )
    : data

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-3 border-b">
        <input
          className="w-full border rounded px-3 py-1 text-sm"
          placeholder="Filtrar..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className="px-3 py-2 text-left font-medium">
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-3 py-2" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-3 py-2">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-3 py-2 flex gap-2 justify-end">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Excluir
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-6 text-center text-gray-400">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/ui/Modal.tsx`**

```tsx
'use client'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add StatCard, DataTable, Modal UI components"
```

---

### Task 5: Create chart components

**Files:**
- Create: `src/components/charts/BarChartCargaHoraria.tsx`
- Create: `src/components/charts/DonutChartOficinas.tsx`
- Create: `src/components/charts/BarChartOficineiros.tsx`
- Create: `src/components/charts/DonutChartTurnos.tsx`

- [ ] **Step 1: Create `src/components/charts/BarChartCargaHoraria.tsx`**

```tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { escola: string; total: number }[]
}

export default function BarChartCargaHoraria({ data }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-xs font-semibold text-gray-600 uppercase mb-3">Carga Horária por Escola</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}h`} />
          <YAxis type="category" dataKey="escola" tick={{ fontSize: 11 }} width={80} />
          <Tooltip formatter={(v) => [`${v}h`, 'Carga Horária']} />
          <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/charts/DonutChartOficinas.tsx`**

```tsx
'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4']

interface Props {
  data: { escola: string; count: number }[]
}

export default function DonutChartOficinas({ data }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-xs font-semibold text-gray-600 uppercase mb-3">Oficinas por Escola</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="escola" innerRadius={50} outerRadius={80}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v, name) => [v, name]} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/charts/BarChartOficineiros.tsx`**

```tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { oficineiro: string; total: number }[]
}

export default function BarChartOficineiros({ data }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-xs font-semibold text-gray-600 uppercase mb-3">Carga Horária por Oficineiro</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ bottom: 40 }}>
          <XAxis dataKey="oficineiro" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}h`} />
          <Tooltip formatter={(v) => [`${v}h`, 'Carga Horária']} />
          <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/charts/DonutChartTurnos.tsx`**

```tsx
'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981']

interface Props {
  data: { turno: string; count: number }[]
}

export default function DonutChartTurnos({ data }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-xs font-semibold text-gray-600 uppercase mb-3">Turmas por Turno</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="turno" innerRadius={50} outerRadius={80}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Recharts chart components"
```

---

### Task 6: Dashboard page (`/`)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
import StatCard from '@/components/ui/StatCard'
import BarChartCargaHoraria from '@/components/charts/BarChartCargaHoraria'
import DonutChartOficinas from '@/components/charts/DonutChartOficinas'
import BarChartOficineiros from '@/components/charts/BarChartOficineiros'
import DonutChartTurnos from '@/components/charts/DonutChartTurnos'
import {
  getKpis,
  getCargaHorariaPorEscola,
  getOficinasPorEscola,
  getCargaHorariaPorOfineiro,
  getTurmasPorTurno,
} from '@/lib/queries'

export default async function DashboardPage() {
  const [kpis, cargaEscola, oficinasEscola, cargaOfineiro, turmasTurno] = await Promise.all([
    getKpis(),
    getCargaHorariaPorEscola(),
    getOficinasPorEscola(),
    getCargaHorariaPorOfineiro(),
    getTurmasPorTurno(),
  ])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard label="Escolas Atendidas" value={kpis.escolasCount} />
        <StatCard label="Oficineiros" value={kpis.oficineirosCount} />
        <StatCard label="Oficinas" value={kpis.oficinasCount} />
        <StatCard label="Turmas" value={kpis.turmasCount} />
        <StatCard label="Horas Aula" value={`${kpis.horasAula}h`} />
        <StatCard label="Horas Planejamento" value={`${kpis.horasPlanejamento}h`} />
        <StatCard label="Carga Horária Total" value={`${kpis.cargaTotal}h`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <BarChartCargaHoraria data={cargaEscola} />
        <DonutChartOficinas data={oficinasEscola} />
        <BarChartOficineiros data={cargaOfineiro} />
        <DonutChartTurnos data={turmasTurno} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify dashboard renders — run `bun dev`, open `http://localhost:3000`**

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: dashboard page with KPI cards and charts"
```

---

### Task 7: Server Actions for mutations

**Files:**
- Create: `src/app/actions/lotacoes.ts`
- Create: `src/app/actions/configuracoes.ts`

- [ ] **Step 1: Create `src/app/actions/lotacoes.ts`**

```ts
'use server'

import { db } from '@/lib/db'
import { lotacoes } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createLotacao(formData: FormData) {
  const escolaId = Number(formData.get('escolaId'))
  const turnoId = Number(formData.get('turnoId'))
  const turma = String(formData.get('turma'))
  const oficinaId = Number(formData.get('oficinaId'))
  const oficineiroId = Number(formData.get('oficineiroId'))
  const horasAula = Number(formData.get('horasAula'))
  const horasPlanejamento = Number(formData.get('horasPlanejamento'))
  const dias = String(formData.get('dias'))

  const existing = await db
    .select()
    .from(lotacoes)
    .where(
      and(
        eq(lotacoes.escolaId, escolaId),
        eq(lotacoes.turnoId, turnoId),
        eq(lotacoes.turma, turma),
        eq(lotacoes.oficinaId, oficinaId)
      )
    )
  if (existing.length > 0) {
    return { error: 'Lotação duplicada: mesma escola, turno, turma e oficina já existe.' }
  }

  await db.insert(lotacoes).values({
    escolaId, turnoId, turma, oficinaId, oficineiroId,
    horasAula, horasPlanejamento, dias,
  })

  revalidatePath('/')
  revalidatePath('/lotacoes')
  revalidatePath('/oficineiros')
  revalidatePath('/escolas')
  revalidatePath('/resumo-escolas')
  revalidatePath('/resumo-oficineiros')
  return { success: true }
}

export async function deleteLotacao(id: number) {
  await db.delete(lotacoes).where(eq(lotacoes.id, id))
  revalidatePath('/')
  revalidatePath('/lotacoes')
  revalidatePath('/oficineiros')
  revalidatePath('/escolas')
  revalidatePath('/resumo-escolas')
  revalidatePath('/resumo-oficineiros')
}
```

- [ ] **Step 2: Create `src/app/actions/configuracoes.ts`**

```ts
'use server'

import { db } from '@/lib/db'
import { escolas, oficinas, oficineiros } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createEscola(formData: FormData) {
  await db.insert(escolas).values({ nome: String(formData.get('nome')) })
  revalidatePath('/configuracoes')
  revalidatePath('/lotacoes')
}

export async function deleteEscola(id: number) {
  await db.delete(escolas).where(eq(escolas.id, id))
  revalidatePath('/configuracoes')
}

export async function createOficina(formData: FormData) {
  await db.insert(oficinas).values({ nome: String(formData.get('nome')) })
  revalidatePath('/configuracoes')
  revalidatePath('/lotacoes')
}

export async function deleteOficina(id: number) {
  await db.delete(oficinas).where(eq(oficinas.id, id))
  revalidatePath('/configuracoes')
}

export async function createOfineiro(formData: FormData) {
  await db.insert(oficineiros).values({ nome: String(formData.get('nome')) })
  revalidatePath('/configuracoes')
  revalidatePath('/lotacoes')
}

export async function deleteOfineiro(id: number) {
  await db.delete(oficineiros).where(eq(oficineiros.id, id))
  revalidatePath('/configuracoes')
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add server actions for lotacoes and configuracoes"
```

---

### Task 8: Lotações page (`/lotacoes`)

**Files:**
- Create: `src/app/lotacoes/page.tsx`
- Create: `src/app/lotacoes/LotacoesClient.tsx`

- [ ] **Step 1: Create `src/app/lotacoes/LotacoesClient.tsx`**

```tsx
'use client'

import { useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import { createLotacao, deleteLotacao } from '@/app/actions/lotacoes'

type Lookup = { id: number; nome: string }
type Lotacao = {
  id: number
  escola: string
  turno: string
  turma: string
  oficina: string
  oficineiro: string
  horasAula: number
  horasPlanejamento: number
  dias: string
}

interface Props {
  lotacoes: Lotacao[]
  escolas: Lookup[]
  oficinas: Lookup[]
  oficineiros: Lookup[]
  turnos: Lookup[]
}

const columns = [
  { key: 'escola' as const, label: 'Escola' },
  { key: 'turno' as const, label: 'Turno' },
  { key: 'turma' as const, label: 'Turma' },
  { key: 'oficina' as const, label: 'Oficina' },
  { key: 'oficineiro' as const, label: 'Oficineiro' },
  { key: 'horasAula' as const, label: 'H. Aula', render: (v: number) => `${v}h` },
  { key: 'horasPlanejamento' as const, label: 'H. Plan.', render: (v: number) => `${v}h` },
  { key: 'dias' as const, label: 'Dias' },
]

export default function LotacoesClient({ lotacoes, escolas, oficinas, oficineiros, turnos }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(formData: FormData) {
    const result = await createLotacao(formData)
    if (result?.error) {
      setError(result.error)
      return
    }
    setOpen(false)
    setError(null)
  }

  async function handleDelete(id: number) {
    if (!confirm('Excluir esta lotação?')) return
    await deleteLotacao(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">Cadastro de Lotações</h2>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-500"
        >
          + Nova Lotação
        </button>
      </div>

      <DataTable columns={columns} data={lotacoes} onDelete={handleDelete} />

      {open && (
        <Modal title="Nova Lotação" onClose={() => { setOpen(false); setError(null) }}>
          <form action={handleCreate} className="space-y-3">
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <select name="escolaId" required className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Escola...</option>
              {escolas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
            <select name="turnoId" required className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Turno...</option>
              {turnos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
            <input name="turma" placeholder="Turma (ex: 1A)" required className="w-full border rounded px-3 py-2 text-sm" />
            <select name="oficinaId" required className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Oficina...</option>
              {oficinas.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
            <select name="oficineiroId" required className="w-full border rounded px-3 py-2 text-sm">
              <option value="">Oficineiro...</option>
              {oficineiros.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input name="horasAula" type="number" step="0.5" placeholder="Horas Aula" required className="border rounded px-3 py-2 text-sm" />
              <input name="horasPlanejamento" type="number" step="0.5" placeholder="Horas Plan." required className="border rounded px-3 py-2 text-sm" />
            </div>
            <input name="dias" placeholder="Dias (ex: Seg/Qui)" required className="w-full border rounded px-3 py-2 text-sm" />
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded text-sm">Salvar</button>
              <button type="button" onClick={() => { setOpen(false); setError(null) }} className="flex-1 py-2 bg-gray-200 rounded text-sm">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/lotacoes/page.tsx`**

```tsx
import { getLotacoesCompletas, getLookups } from '@/lib/queries'
import LotacoesClient from './LotacoesClient'

export default async function LotacoesPage() {
  const [lotacoes, lookups] = await Promise.all([
    getLotacoesCompletas(),
    getLookups(),
  ])
  return <LotacoesClient lotacoes={lotacoes} {...lookups} />
}
```

- [ ] **Step 3: Verify at `http://localhost:3000/lotacoes` — table renders, modal opens**

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: lotacoes page with create/delete"
```

---

### Task 9: Derived read-only pages

**Files:**
- Create: `src/app/oficineiros/page.tsx`
- Create: `src/app/escolas/page.tsx`
- Create: `src/app/resumo-escolas/page.tsx`
- Create: `src/app/resumo-oficineiros/page.tsx`

- [ ] **Step 1: Create `src/app/oficineiros/page.tsx`**

```tsx
import DataTable from '@/components/ui/DataTable'
import { getResumoOficineiros } from '@/lib/queries'

export default async function OficeirosPage() {
  const data = await getResumoOficineiros()
  const columns = [
    { key: 'oficineiro' as const, label: 'Oficineiro' },
    { key: 'oficina' as const, label: 'Oficina' },
    { key: 'horasAula' as const, label: 'H. Aula', render: (v: number) => `${v}h` },
    { key: 'horasPlanejamento' as const, label: 'H. Plan.', render: (v: number) => `${v}h` },
    { key: 'cargaTotal' as const, label: 'Carga Total', render: (v: number) => `${v}h` },
  ]
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Oficineiros</h2>
      <DataTable columns={columns} data={data.map((r, i) => ({ ...r, id: i + 1 }))} />
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/escolas/page.tsx`**

```tsx
import DataTable from '@/components/ui/DataTable'
import { getLotacoesCompletas } from '@/lib/queries'

export default async function EscolasPage() {
  const data = await getLotacoesCompletas()
  const columns = [
    { key: 'escola' as const, label: 'Escola' },
    { key: 'oficineiro' as const, label: 'Oficineiro' },
    { key: 'oficina' as const, label: 'Oficina' },
    { key: 'horasAula' as const, label: 'Carga Horária', render: (v: number) => `${v}h` },
  ]
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Escolas – Equipe da Unidade</h2>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
```

- [ ] **Step 3: Create `src/app/resumo-escolas/page.tsx`**

```tsx
import DataTable from '@/components/ui/DataTable'
import { getResumoEscolas } from '@/lib/queries'

export default async function ResumoEscolasPage() {
  const data = await getResumoEscolas()
  const columns = [
    { key: 'escola' as const, label: 'Escola' },
    { key: 'nOficinas' as const, label: 'Nº Oficinas' },
    { key: 'nOficineiros' as const, label: 'Nº Oficineiros' },
    { key: 'horasAula' as const, label: 'Horas Aula', render: (v: number) => `${v}h` },
    { key: 'turmas' as const, label: 'Turmas' },
  ]
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Resumo das Escolas</h2>
      <DataTable columns={columns} data={data.map((r, i) => ({ ...r, id: i + 1 }))} />
    </div>
  )
}
```

- [ ] **Step 4: Create `src/app/resumo-oficineiros/page.tsx`**

```tsx
import DataTable from '@/components/ui/DataTable'
import { getResumoOficineiros } from '@/lib/queries'

export default async function ResumoOficeirosPage() {
  const data = await getResumoOficineiros()
  const columns = [
    { key: 'oficineiro' as const, label: 'Oficineiro' },
    { key: 'oficina' as const, label: 'Oficina' },
    { key: 'cargaTotal' as const, label: 'CH Total', render: (v: number) => `${v}h` },
    { key: 'horasAula' as const, label: 'CH Aula', render: (v: number) => `${v}h` },
    { key: 'horasPlanejamento' as const, label: 'CH Plan.', render: (v: number) => `${v}h` },
    {
      key: 'cargaTotal' as const,
      label: 'Saldo',
      render: (v: number) => {
        const saldo = 40 - v
        return <span className={saldo < 0 ? 'text-red-600 font-semibold' : ''}>{saldo}h</span>
      },
    },
  ]
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Resumo dos Oficineiros</h2>
      <p className="text-xs text-gray-400">* Saldo baseado na carga máxima de 40h semanais</p>
      <DataTable columns={columns} data={data.map((r, i) => ({ ...r, id: i + 1 }))} />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: derived read-only pages (oficineiros, escolas, resumos)"
```

---

### Task 10: Configurações page

**Files:**
- Create: `src/app/configuracoes/page.tsx`
- Create: `src/app/configuracoes/ConfiguracoesClient.tsx`

- [ ] **Step 1: Create `src/app/configuracoes/ConfiguracoesClient.tsx`**

```tsx
'use client'

import { useState } from 'react'
import {
  createEscola, deleteEscola,
  createOficina, deleteOficina,
  createOfineiro, deleteOfineiro,
} from '@/app/actions/configuracoes'

type Item = { id: number; nome: string }

function LookupSection({
  title,
  items,
  onCreate,
  onDelete,
}: {
  title: string
  items: Item[]
  onCreate: (fd: FormData) => Promise<void>
  onDelete: (id: number) => Promise<void>
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <form action={onCreate} className="flex gap-2">
        <input name="nome" placeholder={`Novo ${title.toLowerCase()}...`} required className="flex-1 border rounded px-3 py-1 text-sm" />
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white text-sm rounded">Adicionar</button>
      </form>
      <ul className="divide-y text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between items-center py-1">
            <span>{item.nome}</span>
            <button onClick={() => onDelete(item.id)} className="text-red-500 text-xs hover:underline">Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface Props {
  escolas: Item[]
  oficinas: Item[]
  oficineiros: Item[]
}

export default function ConfiguracoesClient({ escolas, oficinas, oficineiros }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700">Configurações</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LookupSection title="Escolas" items={escolas} onCreate={createEscola} onDelete={deleteEscola} />
        <LookupSection title="Oficinas" items={oficinas} onCreate={createOficina} onDelete={deleteOficina} />
        <LookupSection title="Oficineiros" items={oficineiros} onCreate={createOfineiro} onDelete={deleteOfineiro} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/configuracoes/page.tsx`**

```tsx
import { getLookups } from '@/lib/queries'
import ConfiguracoesClient from './ConfiguracoesClient'

export default async function ConfiguracoesPage() {
  const { escolas, oficinas, oficineiros } = await getLookups()
  return <ConfiguracoesClient escolas={escolas} oficinas={oficinas} oficineiros={oficineiros} />
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: configuracoes page with lookup table CRUD"
```

---

### Task 11: PDF ReportGenerator + Relatórios page

**Files:**
- Create: `src/components/pdf/ReportGenerator.tsx`
- Create: `src/app/relatorios/page.tsx`
- Create: `src/app/relatorios/RelatoriosClient.tsx`

- [ ] **Step 1: Create `src/components/pdf/ReportGenerator.tsx`**

```tsx
'use client'

interface Props {
  targetId: string
  filename: string
  label: string
}

export default function ReportGenerator({ targetId, filename, label }: Props) {
  async function generate() {
    const { default: html2canvas } = await import('html2canvas')
    const { default: jsPDF } = await import('jspdf')

    const el = document.getElementById(targetId)
    if (!el) return

    const canvas = await html2canvas(el, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
    pdf.save(filename)
  }

  return (
    <button
      onClick={generate}
      className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-500 flex items-center gap-2"
    >
      📄 {label}
    </button>
  )
}
```

- [ ] **Step 2: Create `src/app/relatorios/RelatoriosClient.tsx`**

```tsx
'use client'

import ReportGenerator from '@/components/pdf/ReportGenerator'

type Lotacao = {
  id: number
  escola: string
  turno: string
  turma: string
  oficina: string
  oficineiro: string
  horasAula: number
  horasPlanejamento: number
  dias: string
}

interface Props {
  lotacoes: Lotacao[]
}

export default function RelatoriosClient({ lotacoes }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap">
        <ReportGenerator targetId="report-geral" filename="relatorio-geral.pdf" label="Relatório Geral" />
        <ReportGenerator targetId="report-por-escola" filename="relatorio-escolas.pdf" label="Por Escola" />
        <ReportGenerator targetId="report-por-oficineiro" filename="relatorio-oficineiros.pdf" label="Por Oficineiro" />
      </div>

      <div id="report-geral" className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">Relatório Geral – Lotação de Oficineiros</h2>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {['Escola','Turno','Turma','Oficina','Oficineiro','H. Aula','H. Plan.','Dias'].map((h) => (
                <th key={h} className="border px-2 py-1 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lotacoes.map((row) => (
              <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                <td className="border px-2 py-1">{row.escola}</td>
                <td className="border px-2 py-1">{row.turno}</td>
                <td className="border px-2 py-1">{row.turma}</td>
                <td className="border px-2 py-1">{row.oficina}</td>
                <td className="border px-2 py-1">{row.oficineiro}</td>
                <td className="border px-2 py-1">{row.horasAula}h</td>
                <td className="border px-2 py-1">{row.horasPlanejamento}h</td>
                <td className="border px-2 py-1">{row.dias}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div id="report-por-escola" className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">Relatório por Escola</h2>
        {Array.from(new Set(lotacoes.map((l) => l.escola))).map((escola) => (
          <div key={escola} className="mb-4">
            <h3 className="font-semibold text-sm mb-1">{escola}</h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {['Turno','Turma','Oficina','Oficineiro','H. Aula','Dias'].map((h) => (
                    <th key={h} className="border px-2 py-1 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lotacoes.filter((l) => l.escola === escola).map((row) => (
                  <tr key={row.id}>
                    <td className="border px-2 py-1">{row.turno}</td>
                    <td className="border px-2 py-1">{row.turma}</td>
                    <td className="border px-2 py-1">{row.oficina}</td>
                    <td className="border px-2 py-1">{row.oficineiro}</td>
                    <td className="border px-2 py-1">{row.horasAula}h</td>
                    <td className="border px-2 py-1">{row.dias}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div id="report-por-oficineiro" className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">Relatório por Oficineiro</h2>
        {Array.from(new Set(lotacoes.map((l) => l.oficineiro))).map((ofic) => (
          <div key={ofic} className="mb-4">
            <h3 className="font-semibold text-sm mb-1">{ofic}</h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {['Escola','Turno','Turma','Oficina','H. Aula','H. Plan.','Dias'].map((h) => (
                    <th key={h} className="border px-2 py-1 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lotacoes.filter((l) => l.oficineiro === ofic).map((row) => (
                  <tr key={row.id}>
                    <td className="border px-2 py-1">{row.escola}</td>
                    <td className="border px-2 py-1">{row.turno}</td>
                    <td className="border px-2 py-1">{row.turma}</td>
                    <td className="border px-2 py-1">{row.oficina}</td>
                    <td className="border px-2 py-1">{row.horasAula}h</td>
                    <td className="border px-2 py-1">{row.horasPlanejamento}h</td>
                    <td className="border px-2 py-1">{row.dias}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/app/relatorios/page.tsx`**

```tsx
import { getLotacoesCompletas } from '@/lib/queries'
import RelatoriosClient from './RelatoriosClient'

export default async function RelatoriosPage() {
  const lotacoes = await getLotacoesCompletas()
  return <RelatoriosClient lotacoes={lotacoes} />
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: relatorios page with client-side PDF export"
```

---

### Task 12: Final smoke test and cleanup

- [ ] **Step 1: Run dev server**

```bash
bun dev
```

- [ ] **Step 2: Verify all routes load without errors**

Visit each route and confirm no console errors:
- `http://localhost:3000/` — KPI cards + 4 charts
- `http://localhost:3000/lotacoes` — table + add/delete modal
- `http://localhost:3000/oficineiros` — summary table
- `http://localhost:3000/escolas` — equipe table
- `http://localhost:3000/resumo-escolas` — summary table
- `http://localhost:3000/resumo-oficineiros` — summary with saldo
- `http://localhost:3000/configuracoes` — 3 lookup CRUD panels
- `http://localhost:3000/relatorios` — PDF buttons + printable divs

- [ ] **Step 3: Add a lotação via the modal, verify KPIs update on dashboard**

- [ ] **Step 4: Generate one PDF, verify download triggers**

- [ ] **Step 5: Remove `src/lib/seed.ts`**

```bash
rm src/lib/seed.ts
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete sistema de gestao do tempo integral MVP"
```
