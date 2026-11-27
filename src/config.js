// Public Supabase settings for the optional accounts (task 22). Both values are meant to be public:
// the publishable key only identifies this web app, and row level security in
// supabase/migrations/0001_accounts.sql decides what each caller may read or write.
// Never put a secret key (sb_secret_...) or the service role key here.
//
// If either value is empty, every account feature is hidden and the app behaves exactly as it did
// before accounts existed. Tests check that path by passing an override to supabaseConfig().

export const SUPABASE_URL = 'https://agnjopogyzhityagifwb.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_E3pxQWBx8NI8giWw-UDOOg_qKiqYsno';

// { enabled, url, key }. `override` is for tests only; the app always calls supabaseConfig().
// The URL must be https (http only for localhost), so a typo cannot send tokens in clear text.
export function supabaseConfig(override) {
  const url = String(override ? override.url ?? '' : SUPABASE_URL).trim().replace(/\/+$/, '');
  const key = String(override ? override.key ?? '' : SUPABASE_ANON_KEY).trim();
  let ok = false;
  try {
    const u = new URL(url);
    ok = u.protocol === 'https:' || (u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname));
  } catch { ok = false; }
  const enabled = Boolean(url && key && ok);
  return { enabled, url: enabled ? url : '', key: enabled ? key : '' };
}
