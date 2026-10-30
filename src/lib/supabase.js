import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const supabaseConfig = {
  url: supabaseUrl || '',
  publishableKey: supabasePublishableKey || '',
  isConfigured: Boolean(supabaseUrl && supabasePublishableKey),
}

export const supabase = supabaseConfig.isConfigured
  ? createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
