const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('your-project-id') || url.includes('example.com') || url.includes('YOUR_')) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

const isValidKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  if (key.includes('your-service-role-secret-key') || key.includes('YOUR_') || key === 'your-anon-key') return false;
  return key.trim().length > 10;
};

const getValidUrl = () => {
  if (isValidUrl(process.env.SUPABASE_URL)) return process.env.SUPABASE_URL;
  if (isValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)) return process.env.NEXT_PUBLIC_SUPABASE_URL;
  return '';
};

const getValidKey = () => {
  if (isValidKey(process.env.SUPABASE_SECRET_KEY)) return process.env.SUPABASE_SECRET_KEY;
  if (isValidKey(process.env.SUPABASE_SERVICE_KEY)) return process.env.SUPABASE_SERVICE_KEY;
  if (isValidKey(process.env.SUPABASE_ANON_KEY)) return process.env.SUPABASE_ANON_KEY;
  if (isValidKey(process.env.SUPABASE_PUBLISHABLE_KEY)) return process.env.SUPABASE_PUBLISHABLE_KEY;
  if (isValidKey(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (isValidKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return '';
};

const supabaseUrl = getValidUrl();
const supabaseServiceKey = getValidKey();

let supabase = null;

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log(`[Supabase Config] Initialized Supabase client for ${supabaseUrl}`);
  } catch (err) {
    console.error('[Supabase Config Error] Failed to initialize Supabase client:', err.message);
  }
} else {
  console.warn('[Supabase Config Warning] Supabase credentials missing or invalid in environment variables.');
}

module.exports = { supabase };
