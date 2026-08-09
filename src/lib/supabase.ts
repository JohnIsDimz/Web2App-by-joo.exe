import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EncryptedPayload, encryptData } from './crypto';

// Default / fallback Supabase endpoint credentials for Web2App Encrypted Vault
const DEFAULT_SUPABASE_URL = 'https://web2app-vault.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYjJhcHAiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.demo_vault_key';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient {
  const url = customUrl || localStorage.getItem('web2app_supabase_url') || DEFAULT_SUPABASE_URL;
  const key = customKey || localStorage.getItem('web2app_supabase_key') || DEFAULT_SUPABASE_ANON_KEY;
  
  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseClient;
}

export interface SupabaseConfigRecord {
  id?: string;
  user_id: string;
  app_name: string;
  encrypted_payload: EncryptedPayload;
  hmac_signature: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Saves or syncs an encrypted app configuration payload to Supabase database
 */
export async function syncConfigToSupabase(
  userId: string,
  appName: string,
  configData: any,
  customSupabaseUrl?: string,
  customSupabaseKey?: string
): Promise<{ success: boolean; recordId?: string; error?: string }> {
  try {
    const client = getSupabaseClient(customSupabaseUrl, customSupabaseKey);
    
    // Encrypt configuration payload with AES-256 before storing
    const encryptedPayload = encryptData(configData);

    const record: SupabaseConfigRecord = {
      user_id: userId,
      app_name: appName,
      encrypted_payload: encryptedPayload,
      hmac_signature: encryptedPayload.hmac,
      updated_at: new Date().toISOString(),
    };

    // Attempt insert into user_web2app_configs table
    const { data, error } = await client
      .from('user_web2app_configs')
      .upsert(record, { onConflict: 'user_id,app_name' })
      .select();

    if (error) {
      console.warn('Supabase remote sync warning (using local encrypted fallback):', error.message);
      // Save locally in encrypted format as fallback
      const localVault = JSON.parse(localStorage.getItem('web2app_encrypted_vault') || '[]');
      localVault.push(record);
      localStorage.setItem('web2app_encrypted_vault', JSON.stringify(localVault.slice(-20)));
      
      return { 
        success: true, 
        recordId: `local-vault-${Date.now()}`,
        error: `Synced to local encrypted vault (${error.message})`
      };
    }

    return { success: true, recordId: data?.[0]?.id || `sp-${Date.now()}` };
  } catch (err: any) {
    console.error('Supabase Sync Error:', err);
    return { success: false, error: err.message || 'Supabase connection failed' };
  }
}
