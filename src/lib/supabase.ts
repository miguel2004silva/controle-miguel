import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variáveis de ambiente fornecidas pelo usuário
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Validação se as chaves foram devidamente configuradas pelo usuário
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('seu-projeto') &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey.length > 20 &&
  !supabaseAnonKey.includes('sua-chave')
);

// Instância segura do cliente Supabase (usando APENAS a chave pública/anon)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
