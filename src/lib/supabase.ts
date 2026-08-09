import { createClient } from '@supabase/supabase-js'

// ponytail: cliente Supabase com suporte a variáveis de ambiente Vercel/Railway e fallback gracioso
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ovehjqfxamdvixckpwjm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('escolas').select('count', { count: 'exact', head: true })
    if (error) return { connected: false, message: error.message }
    return { connected: true, message: 'Conectado ao Supabase Cloud ( sa-east-1 )' }
  } catch (err: any) {
    return { connected: false, message: err.message || 'Erro ao conectar ao Supabase' }
  }
}
