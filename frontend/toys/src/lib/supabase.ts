import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANNON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  price: number
  currency: string
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProductImage = {
  id: string
  product_id: string
  image_url: string
  position: number
  is_main: boolean
  created_at: string
}

export type Profile = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  role: string
  created_at: string
  updated_at: string
}