import { User, TimeLog, AppConfig } from '../types';
import { INITIAL_USERS } from '../constants';

const KEYS = {
  USERS: 'ponto_users',
  LOGS: 'ponto_logs',
  CONFIG: 'ponto_config',
  USER_SESSION: 'ponto_session'
};

export const storageService = {
  // --- Users ---
  getUsers: (): User[] => {
    const stored = localStorage.getItem(KEYS.USERS);
    if (!stored) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(stored);
  },

  addUser: (user: User) => {
    const users = storageService.getUsers();
    if (users.find(u => u.id === user.id)) throw new Error('ID já existe');
    const newUsers = [...users, user];
    localStorage.setItem(KEYS.USERS, JSON.stringify(newUsers));
  },

  // --- Logs ---
  getLogs: (): TimeLog[] => {
    const stored = localStorage.getItem(KEYS.LOGS);
    return stored ? JSON.parse(stored) : [];
  },

  addLog: async (log: TimeLog): Promise<void> => {
    const logs = storageService.getLogs();
    const newLogs = [log, ...logs]; // Prepend
    localStorage.setItem(KEYS.LOGS, JSON.stringify(newLogs));

    // Try to sync with Google Sheets
    try {
      const config = storageService.getConfig();
      if (config.sheetApiUrl) {
        await fetch(config.sheetApiUrl, {
          method: 'POST',
          mode: 'no-cors', // Important for Google Apps Script Web App simple usage
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'log',
            ...log
          })
        });
        // Note: with no-cors we can't read response, so we optimistically mark synced locally if no error thrown
        storageService.markLogSynced(log.id);
      }
    } catch (e) {
      console.error("Failed to sync with Google Sheets", e);
      // It stays marked as synced: false in local storage
    }
  },

  markLogSynced: (logId: string) => {
    const logs = storageService.getLogs();
    const updated = logs.map(l => l.id === logId ? { ...l, synced: true } : l);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(updated));
  },

  // --- Session ---
  login: (user: User) => {
    localStorage.setItem(KEYS.USER_SESSION, JSON.stringify(user));
  },
  
  logout: () => {
    localStorage.removeItem(KEYS.USER_SESSION);
  },

  getSession: (): User | null => {
    const stored = localStorage.getItem(KEYS.USER_SESSION);
    return stored ? JSON.parse(stored) : null;
  },

  // --- Config ---
  getConfig: (): AppConfig => {
    const stored = localStorage.getItem(KEYS.CONFIG);
    return stored ? JSON.parse(stored) : { sheetApiUrl: '' };
  },

  saveConfig: (config: AppConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  }
};