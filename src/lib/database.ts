// Full Relational SQL Database Module with AES-256 Encryption
import { syncConfigToSqlDatabase, sqlDatabaseInstance } from './sqlDatabase';

export { syncConfigToSqlDatabase, sqlDatabaseInstance };

/**
 * Syncs application configuration payload directly to the Full Encrypted SQL Database
 */
export async function syncConfigToDatabase(
  userId: string,
  appName: string,
  configData: any
): Promise<{ success: boolean; recordId?: string; error?: string }> {
  return syncConfigToSqlDatabase(userId, appName, configData);
}

/**
 * Client accessor for the Encrypted SQL Database Vault
 */
export function getDatabaseClient() {
  console.log('[SQL Database Engine] Operating on Full Relational SQL Vault (AES-256 encrypted)');
  return sqlDatabaseInstance;
}

// Backward compatibility aliases
export const syncConfigToSupabase = syncConfigToDatabase;
export const getSupabaseClient = getDatabaseClient;

