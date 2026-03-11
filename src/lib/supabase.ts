import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Usamos la secreta para el ejercicio

export const supabase = createClient(supabaseUrl, supabaseKey)