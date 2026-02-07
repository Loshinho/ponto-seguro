export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  password?: string; // Simplistic password for demo
  position?: string;
}

export interface TimeLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: string; // ISO string
  type: 'ENTRADA' | 'SAIDA';
  method: 'QR' | 'MANUAL';
  synced: boolean;
}

export interface AppConfig {
  sheetApiUrl: string; // Google Apps Script Web App URL
}

export interface QRCodeData {
  code: string;
  timestamp: number;
  validUntil: number;
}