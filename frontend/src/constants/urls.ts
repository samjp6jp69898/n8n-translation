/**
 * API URLs 常數
 */

// N8N 伺服器基礎 URL
export const N8N_BASE_URL = 'https://n8n-translation.onrender.com';

// Webhook 端點
export const WEBHOOK_UPLOAD_URL = `${N8N_BASE_URL}/webhook/upload-csv`;

// 檔案下載 URLs
export const FILE_URLS = {
  CONSISTENT: `${N8N_BASE_URL}/files/consistent.csv`,
  INCONSISTENT: `${N8N_BASE_URL}/files/inconsistent.csv`,
};
