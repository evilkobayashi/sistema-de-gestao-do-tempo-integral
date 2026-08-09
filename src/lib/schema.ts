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

export const usuarios = sqliteTable('usuarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  senha: text('senha').notNull(),
  cargo: text('cargo').notNull(), // 'admin' | 'gestor' | 'oficineiro'
  escolaId: integer('escola_id').references(() => escolas.id),
})

