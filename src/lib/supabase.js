import { createClient } from '@supabase/supabase-js';
import { checkEnvVariables } from '../utils/env';

const vars = checkEnvVariables();
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials:');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseKey ? 'exists' : 'missing');
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection
supabase.from('saved_tweets').select('count', { count: 'exact', head: true })
  .then(() => console.log('Supabase connection successful'))
  .catch(err => console.error('Supabase connection failed:', err)); 