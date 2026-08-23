import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default storage keys
export const STORAGE_KEY_SUPABASE_URL = 'plant2_supabase_url';
export const STORAGE_KEY_SUPABASE_ANON = 'plant2_supabase_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  tablesFound?: string[];
  missingTables?: string[];
  errorDetail?: string;
  rowCount?: number;
  hasRlsIssue?: boolean;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  const url = (localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || (import.meta.env.VITE_SUPABASE_URL as string) || '').trim();
  const anonKey = (localStorage.getItem(STORAGE_KEY_SUPABASE_ANON) || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '').trim();
  return { 
    url, 
    anonKey, 
    isConfigured: Boolean(url && anonKey && url.startsWith('http')) 
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  const trimmedUrl = url ? url.trim() : '';
  const trimmedKey = anonKey ? anonKey.trim() : '';

  if (trimmedUrl) {
    localStorage.setItem(STORAGE_KEY_SUPABASE_URL, trimmedUrl);
  } else {
    localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);
  }
  
  if (trimmedKey) {
    localStorage.setItem(STORAGE_KEY_SUPABASE_ANON, trimmedKey);
  } else {
    localStorage.removeItem(STORAGE_KEY_SUPABASE_ANON);
  }

  resetSupabaseClient();
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getStoredSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export const getSupabaseClient = getSupabase;

export function resetSupabaseClient() {
  supabaseInstance = null;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<ConnectionTestResult> {
  const cleanUrl = url?.trim() || '';
  const cleanKey = anonKey?.trim() || '';

  if (!cleanUrl || !cleanKey) {
    return {
      success: false,
      message: 'Project URL dan Anon Key Supabase wajib diisi.'
    };
  }

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return {
      success: false,
      message: 'Format Project URL tidak valid. Harus diawali dengan https:// (contoh: https://xyz.supabase.co)'
    };
  }

  try {
    const client = createClient(cleanUrl, cleanKey);
    const expectedTables = [
      'code_units',
      'profiles',
      'baps',
      'daily_rigid',
      'daily_artic',
      'backlogs',
      'aktivitas',
      'hm_logs'
    ];

    const results = await Promise.allSettled(
      expectedTables.map(async (tableName) => {
        const { count, error } = await client
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          throw new Error(`${tableName}: ${error.message} (${error.code || ''})`);
        }
        return { table: tableName, count: count || 0 };
      })
    );

    const tablesFound: string[] = [];
    const missingTables: string[] = [];
    let totalRows = 0;

    let hasRlsIssue = false;
    let firstErrorMsg = '';

    results.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        tablesFound.push(expectedTables[idx]);
        totalRows += res.value.count;
      } else {
        missingTables.push(expectedTables[idx]);
        const errMsg = res.reason?.message || '';
        if (!firstErrorMsg) firstErrorMsg = errMsg;
        if (errMsg.includes('row-level security') || errMsg.includes('42501') || errMsg.includes('permission denied')) {
          hasRlsIssue = true;
        }
      }
    });

    if (tablesFound.length > 0) {
      if (missingTables.length === 0) {
        return {
          success: true,
          message: `Koneksi Supabase BERHASIL! Seluruh 8 tabel database terhubung sempurna dan siap digunakan.`,
          tablesFound,
          missingTables: [],
          rowCount: totalRows,
          hasRlsIssue
        };
      } else {
        return {
          success: true,
          message: `Koneksi Supabase terhubung! ${tablesFound.length} dari 8 tabel aktif. Tabel belum terdeteksi: ${missingTables.join(', ')}.`,
          tablesFound,
          missingTables,
          rowCount: totalRows,
          hasRlsIssue
        };
      }
    } else {
      return {
        success: false,
        message: hasRlsIssue 
          ? 'Koneksi terhubung tapi akses ditolak oleh Row Level Security (RLS). Jalankan Skrip SQL Fix di Supabase SQL Editor.'
          : 'Koneksi ke server Supabase berhasil, tetapi tabel belum dibuat. Silakan jalankan skrip SQL Schema di Supabase SQL Editor.',
        errorDetail: firstErrorMsg || 'Tabel tidak ditemukan',
        missingTables: expectedTables,
        hasRlsIssue
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: 'Gagal terhubung ke Supabase. Periksa kembali Project URL dan Anon Key.',
      errorDetail: err?.message || String(err)
    };
  }
}
