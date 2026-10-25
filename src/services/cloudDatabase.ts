import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface CloudDbConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

const STORAGE_KEY = 'td_erp_supabase_config';

/**
 * Mendapatkan konfigurasi Supabase dari Environment Variables Vercel
 * atau dari konfigurasi lokal yang disimpan pengguna.
 */
export function getCloudDbConfig(): CloudDbConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        supabaseUrl: envUrl || parsed.supabaseUrl || '',
        supabaseAnonKey: envKey || parsed.supabaseAnonKey || '',
        autoSync: parsed.autoSync ?? true,
        lastSyncedAt: parsed.lastSyncedAt,
      };
    } catch {
      // ignore
    }
  }

  return {
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey,
    autoSync: true,
  };
}

export function saveCloudDbConfig(config: Partial<CloudDbConfig>): void {
  const current = getCloudDbConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

/**
 * Menginisialisasi Supabase Client secara otomatis
 */
export function getSupabaseClient(): SupabaseClient | null {
  const { supabaseUrl, supabaseAnonKey } = getCloudDbConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Jika URL atau Key berubah, reset client
  if (cachedClient && (lastUsedUrl !== supabaseUrl || lastUsedKey !== supabaseAnonKey)) {
    cachedClient = null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      lastUsedUrl = supabaseUrl;
      lastUsedKey = supabaseAnonKey;
    } catch (err) {
      console.warn('Gagal menginisialisasi Supabase client:', err);
      return null;
    }
  }

  return cachedClient;
}

/**
 * Uji koneksi ke database Supabase
 */
export async function testCloudConnection(): Promise<{
  success: boolean;
  message: string;
  tableExists?: boolean;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'URL atau Anon Key Supabase belum diatur.',
    };
  }

  try {
    // Coba query sederhana ke tabel osis_sync_store
    const { data, error } = await client
      .from('osis_sync_store')
      .select('key')
      .limit(1);

    if (error) {
      // Jika tabel belum ada (kode 42P01 di postgres)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: true,
          tableExists: false,
          message: 'Koneksi ke Supabase berhasil! Tabel `osis_sync_store` belum dibuat. Silakan salin & jalankan SQL Schema 1-klik di SQL Editor Supabase.',
        };
      }
      return {
        success: false,
        message: `Koneksi gagal: ${error.message}`,
      };
    }

    return {
      success: true,
      tableExists: true,
      message: 'Koneksi Supabase aktif & tabel siap digunakan!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menghubungi server Supabase: ${err?.message || 'Periksa jaringan internet'}`,
    };
  }
}

/**
 * Sinkronisasi data lokal ke Supabase Cloud
 */
export async function pushDataToCloud(key: string, data: any): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('osis_sync_store')
      .upsert(
        {
          key,
          data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.warn(`Gagal sinkron data [${key}] ke cloud:`, error.message);
      return false;
    }

    saveCloudDbConfig({ lastSyncedAt: new Date().toLocaleTimeString('id-ID') });
    return true;
  } catch (err) {
    console.warn(`Error sinkron data [${key}]:`, err);
    return false;
  }
}

/**
 * Mengambil data dari Supabase Cloud
 */
export async function pullDataFromCloud(key: string): Promise<any | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('osis_sync_store')
      .select('data')
      .eq('key', key)
      .single();

    if (error || !data) {
      return null;
    }

    return data.data;
  } catch (err) {
    return null;
  }
}

/**
 * SQL Schema 1-Klik yang dibutuhkan oleh Supabase
 */
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- SKRIP OTOMATIS DATABASE ERP OSIS SMK TRIDHARMA GORONTALO
-- Salin dan jalankan skrip ini di menu 'SQL Editor' pada Supabase
-- ========================================================

-- 1. Buat tabel penyimpanan sinkronisasi otomatis
CREATE TABLE IF NOT EXISTS public.osis_sync_store (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.osis_sync_store ENABLE ROW LEVEL SECURITY;

-- 3. Berikan akses baca dan tulis untuk aplikasi OSIS (anon key)
DROP POLICY IF EXISTS "Akses Publik ERP OSIS" ON public.osis_sync_store;
CREATE POLICY "Akses Publik ERP OSIS" 
  ON public.osis_sync_store 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 4. Aktifkan Realtime Replication secara aman (kebal error bila sudah terdaftar)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.osis_sync_store;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- Selesai! Tabel siap digunakan secara otomatis oleh sistem ERP OSIS.
`;
