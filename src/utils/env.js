export function checkEnvVariables() {
  console.log('Checking environment variables...');
  const variables = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'exists' : 'missing'
  };
  
  console.log('Environment variables:', variables);
  return variables;
} 