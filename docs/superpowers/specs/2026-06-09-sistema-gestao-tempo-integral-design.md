# Sistema de Gestão – Tempo Integral: Design Spec

**Date:** 2026-06-09  
**Stack:** Next.js 16 + TypeScript + Tailwind + Bun + SQLite (Drizzle ORM)  
**Auth:** None (open access for now)  
**PDF:** Client-side (jsPDF + html2canvas)

---

## 1. Architecture

App Router with server components as the default. Each section maps to a route. A shared layout wraps every page with a sidebar and header.

```
/                    → Dashboard (KPIs + 4 charts)
/lotacoes            → Cadastro de Lotações (main data entry table)
/oficineiros         → Oficineiros (auto-derived from lotações)
/escolas             → Escolas – Equipe da Unidade
/resumo-escolas      → Resumo das Escolas
/resumo-oficineiros  → Resumo dos Oficineiros
/relatorios          → PDF report generation
/configuracoes       → Lookup table management
```

Server components fetch directly from SQLite — no client waterfalls. Mutations go through server actions which revalidate affected paths. Charts are client components that receive pre-shaped data as props.

---

## 2. Database Schema (Drizzle + SQLite)

```ts
escolas:      id, nome
oficinas:     id, nome
oficineiros:  id, nome
turnos:       id, nome  // Manhã | Tarde | Noite

lotacoes:     id, escola_id, turno_id, turma, oficina_id,
              oficineiro_id, horas_aula, horas_planejamento,
              dias  // e.g. "Seg/Qui"
              // carga_horaria = horas_aula + horas_planejamento (computed)
```

`lotacoes` is the sole input table. All derived views (KPIs, resumos, charts) are SQL aggregations over it. Lookup tables (escolas, oficinas, oficineiros, turnos) are managed via the Configurações page.

---

## 3. Component & Folder Structure

```
src/
  app/
    layout.tsx                  ← sidebar + header shell (server)
    page.tsx                    ← dashboard
    lotacoes/page.tsx
    oficineiros/page.tsx
    escolas/page.tsx
    resumo-escolas/page.tsx
    resumo-oficineiros/page.tsx
    relatorios/page.tsx
    configuracoes/page.tsx
    actions/
      lotacoes.ts               ← server actions: create, update, delete
      configuracoes.ts          ← server actions: CRUD for lookup tables

  components/
    layout/
      Sidebar.tsx
      Header.tsx
    ui/
      StatCard.tsx              ← KPI card (icon, label, value)
      DataTable.tsx             ← reusable client-side sortable/filterable table
      Modal.tsx                 ← add/edit form modal
    charts/
      BarChartCargaHoraria.tsx  ← horizontal bar: carga horária por escola
      DonutChartOficinas.tsx    ← donut: oficinas por escola
      BarChartOficineiros.tsx   ← bar: carga horária por oficineiro
      DonutChartTurnos.tsx      ← donut: turmas por turno
    pdf/
      ReportGenerator.tsx       ← jsPDF + html2canvas orchestration

  lib/
    db.ts                       ← Drizzle client + better-sqlite3 connection
    schema.ts                   ← Drizzle table definitions
    queries.ts                  ← reusable query functions (aggregations)
```

---

## 4. Data Flow & Key Behaviors

### Mutations
- **Lotações:** create, update, delete — `revalidatePath` on `/`, `/lotacoes`, and all derived pages
- **Configurações:** CRUD for escolas, oficinas, oficineiros, turnos

### Fetching
- All page components are server components — read directly from SQLite
- Charts receive pre-shaped arrays as props (no client fetches)
- `DataTable` is a client component for sorting/filtering only

### Validation
- `horas_aula + horas_planejamento ≤ 40h` per oficineiro per week — warn on exceed (non-blocking)
- Duplicate guard: block same escola + turno + turma + oficina combination

### PDF Export
- Each report type has a printable `<div id="report-*">` rendered off-screen
- "Gerar PDF" button: `html2canvas(div)` → `jsPDF.addImage()` → trigger download
- 3 report types: por oficineiro, por escola, relatório geral

### Dashboard KPIs (7 cards)
All derived from `lotacoes`:
- Escolas Atendidas → `COUNT DISTINCT escola_id`
- Oficineiros → `COUNT DISTINCT oficineiro_id`
- Oficinas → `COUNT DISTINCT oficina_id`
- Turmas → `COUNT DISTINCT (escola_id, turno_id, turma)`
- Horas Aula → `SUM horas_aula`
- Horas Planejamento → `SUM horas_planejamento`
- Carga Horária Total → `SUM (horas_aula + horas_planejamento)`

---

## 5. Dependencies to Install

```bash
bun add drizzle-orm better-sqlite3 recharts jspdf html2canvas
bun add -d drizzle-kit @types/better-sqlite3
```

---

## 6. Out of Scope (for now)

- Authentication / user roles
- Server-side PDF (Puppeteer)
- Real-time updates
- Export to Excel/CSV
