/// /api/_lib/supabase.ts
import { createClient } from "@supabase/supabase-js"

declare const process: {
  env: {
    SUPABASE_URL?: string
    SUPABASE_SERVICE_ROLE_KEY?: string
    VITE_SUPABASE_URL?: string
    VITE_SUPABASE_ANNON_KEY?: string
  }
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANNON_KEY

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL or VITE_SUPABASE_URL is required.')
}
if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANNON_KEY is required.')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)