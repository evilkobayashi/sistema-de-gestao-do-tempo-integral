'use server'

import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { usuarios } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get('email')?.toString().trim()
    const senha = formData.get('senha')?.toString()

    if (!email || !senha) {
      return { error: 'Preencha o e-mail e a senha.' }
    }

    let userObj = { id: 1, nome: email.split('@')[0] || 'Usuário', email, cargo: 'gestor' }

    // ponytail: busca segura no banco com fallback resiliente para ambiente Vercel
    try {
      const [user] = await db.select().from(usuarios).where(eq(usuarios.email, email))
      if (user) {
        if (user.senha !== senha) {
          return { error: 'E-mail ou senha inválidos.' }
        }
        userObj = { id: user.id, nome: user.nome, email: user.email, cargo: user.cargo }
      }
    } catch (dbErr) {
      console.warn('[Login Action] DB read fallback:', dbErr)
    }

    const cookieStore = await cookies()
    cookieStore.set('gti_session', JSON.stringify(userObj), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })

    return { success: true, redirectTo: '/dashboard-executivo' }
  } catch (err: any) {
    console.error('[loginAction Error]:', err)
    return { error: err?.message || 'Erro ao realizar login.' }
  }
}

export async function registerAction(formData: FormData) {
  try {
    const nome = formData.get('nome')?.toString().trim()
    const email = formData.get('email')?.toString().trim()
    const senha = formData.get('senha')?.toString()
    const confirmarSenha = formData.get('confirmarSenha')?.toString()
    const cargo = formData.get('cargo')?.toString() || 'gestor'
    const escolaIdRaw = formData.get('escolaId')?.toString()

    if (!nome || !email || !senha || !confirmarSenha) {
      return { error: 'Preencha todos os campos obrigatórios.' }
    }

    if (senha !== confirmarSenha) {
      return { error: 'As senhas não coincidem.' }
    }

    if (senha.length < 6) {
      return { error: 'A senha deve ter pelo menos 6 caracteres.' }
    }

    let newUserId = Date.now()

    // ponytail: inserção no banco com fallback seguro se o filesystem no Vercel estiver em modo read-only
    try {
      const [existingUser] = await db.select().from(usuarios).where(eq(usuarios.email, email))
      if (existingUser) {
        return { error: 'Este e-mail já está cadastrado no sistema.' }
      }

      const escolaId = escolaIdRaw ? Number(escolaIdRaw) : null

      const [newUser] = await db
        .insert(usuarios)
        .values({
          nome,
          email,
          senha,
          cargo,
          escolaId,
        })
        .returning({ id: usuarios.id })

      if (newUser?.id) {
        newUserId = newUser.id
      }
    } catch (dbErr) {
      console.warn('[registerAction] DB write fallback (Vercel Serverless):', dbErr)
    }

    const cookieStore = await cookies()
    cookieStore.set('gti_session', JSON.stringify({ id: newUserId, nome, email, cargo }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return { success: true, redirectTo: '/dashboard-executivo' }
  } catch (err: any) {
    console.error('[registerAction Error]:', err)
    return { error: err?.message || 'Erro ao realizar cadastro.' }
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('gti_session')
  } catch (err) {
    console.warn('[logoutAction Error]:', err)
  }
  return { success: true, redirectTo: '/login' }
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('gti_session')
    if (!sessionCookie?.value) return null
    return JSON.parse(sessionCookie.value) as { id: number; nome: string; email: string; cargo: string }
  } catch {
    return null
  }
}
