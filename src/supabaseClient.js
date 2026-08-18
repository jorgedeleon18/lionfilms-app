import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si todavía no configuraste las variables de entorno (ver .env.example),
// dejamos supabase en null: el login de Gaby simplemente no va a funcionar
// hasta que las completes, pero el resto de la app sigue andando normal.
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
