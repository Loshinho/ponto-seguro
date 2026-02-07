import { User, UserRole } from './types';

export const ADMIN_ID = '000';
export const ADMIN_PASS = '111';

export const INITIAL_USERS: User[] = [
  { id: '000', name: 'Administrador Tablet', role: UserRole.ADMIN, password: '111', position: 'Supervisor' },
  { id: '001', name: 'João Silva', role: UserRole.EMPLOYEE, password: '123', position: 'Desenvolvedor' },
  { id: '002', name: 'Maria Souza', role: UserRole.EMPLOYEE, password: '123', position: 'Designer' },
];

export const GOOGLE_SCRIPT_TEMPLATE = `
// CÓDIGO DO GOOGLE APPS SCRIPT
// Cole este código no editor de script da sua planilha (Extensões > Apps Script)

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();
    
    // Cria cabeçalho se a planilha for nova
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Data/Hora", "ID", "Nome", "Tipo (Entrada/Saida)", "Método", "Data ISO"]);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    if (data.action === 'log') {
      var date = new Date();
      
      sheet.appendRow([
        date.toLocaleString("pt-BR"), // Data formatada para leitura humana
        "'"+data.userId,              // Força formato texto para o ID
        data.userName, 
        data.type, 
        data.method,
        data.timestamp                // Data ISO para sistema
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({result: 'success'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({result: 'error', message: 'Unknown action'}))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({result: 'error', error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
`;