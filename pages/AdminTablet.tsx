import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Clock } from '../components/Clock';
import { storageService } from '../services/storageService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { QRCodeData, UserRole, User } from '../types';
import { Settings, LogOut, Users, FileSpreadsheet, Pause, Play, RefreshCw, X, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GOOGLE_SCRIPT_TEMPLATE } from '../constants';

export const AdminTablet: React.FC = () => {
  const navigate = useNavigate();
  const [currentCode, setCurrentCode] = useState<string>('----');
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Settings State
  const [sheetUrl, setSheetUrl] = useState('');
  
  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ id: '', name: '', password: '', position: '' });

  useEffect(() => {
    // Load config
    const config = storageService.getConfig();
    setSheetUrl(config.sheetApiUrl);
    setUsers(storageService.getUsers());
    generateNewCode();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          generateNewCode();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const generateNewCode = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setCurrentCode(randomCode);
    setTimeLeft(300);
  };

  const getQRData = (): string => {
    const data: QRCodeData = {
      code: currentCode,
      timestamp: Date.now(),
      validUntil: Date.now() + (timeLeft * 1000)
    };
    return JSON.stringify(data);
  };

  const handleSaveSettings = () => {
    storageService.saveConfig({ sheetApiUrl: sheetUrl });
    setShowSettings(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      storageService.addUser({
        ...newUser,
        role: UserRole.EMPLOYEE
      });
      setUsers(storageService.getUsers());
      setNewUser({ id: '', name: '', password: '', position: '' });
      alert('Usuário cadastrado com sucesso!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    storageService.logout();
    navigate('/');
  };

  const formatTimeLeft = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar Controls */}
      <div className="md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between z-10">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-8">Painel Tablet</h2>
          <div className="space-y-3">
            <Button variant="outline" fullWidth onClick={() => setShowUsers(true)} className="flex items-center gap-2 justify-start">
              <Users size={18} /> Funcionários
            </Button>
            <Button variant="outline" fullWidth onClick={() => setShowSettings(true)} className="flex items-center gap-2 justify-start">
              <Settings size={18} /> Configurações
            </Button>
          </div>
        </div>
        <Button variant="secondary" onClick={handleLogout} className="flex items-center gap-2 justify-center mt-4">
          <LogOut size={18} /> Sair
        </Button>
      </div>

      {/* Main Kiosk Area */}
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
             <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
             <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
         </div>

         <div className="mb-12 w-full max-w-3xl z-0">
           <Clock />
         </div>

         <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full max-w-4xl">
            {/* QR Code Section */}
            <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center border border-gray-100">
               <h3 className="text-lg font-semibold text-gray-600 mb-4">Escaneie para registrar</h3>
               <div className="bg-white p-2 rounded-lg shadow-inner">
                 <QRCodeSVG value={getQRData()} size={256} level="H" />
               </div>
               <div className="mt-4 text-sm text-gray-400 font-mono">
                 Atualiza em: <span className="text-gray-800 font-bold">{formatTimeLeft(timeLeft)}</span>
               </div>
            </div>

            {/* Manual Code Section */}
            <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center border border-gray-100 min-w-[300px]">
               <h3 className="text-lg font-semibold text-gray-600 mb-6">Código Manual</h3>
               
               <div className="text-7xl font-mono font-bold text-blue-600 tracking-widest mb-8">
                 {currentCode}
               </div>

               <div className="flex gap-4 w-full">
                 <Button 
                    variant={isPaused ? "primary" : "outline"} 
                    fullWidth 
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex items-center justify-center gap-2"
                 >
                   {isPaused ? <Play size={20} /> : <Pause size={20} />}
                   {isPaused ? "Retomar" : "Pausar"}
                 </Button>
                 <Button 
                    variant="secondary" 
                    onClick={() => { generateNewCode(); setIsPaused(false); }}
                    className="flex items-center justify-center"
                 >
                   <RefreshCw size={20} />
                 </Button>
               </div>
            </div>
         </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileSpreadsheet className="text-green-600" /> Configuração do Planilhas
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                <X />
              </button>
            </div>
            
            <div className="space-y-6">
               <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700 space-y-2">
                 <h4 className="font-bold text-blue-800">Passo a Passo:</h4>
                 <ol className="list-decimal pl-4 space-y-1">
                   <li>Crie uma nova planilha no Google Sheets (sheets.new).</li>
                   <li>Vá em <strong>Extensões</strong> {'>'} <strong>Apps Script</strong>.</li>
                   <li>Apague todo o código lá e cole o código abaixo.</li>
                   <li>Clique em <strong>Implantar (Deploy)</strong> {'>'} <strong>Nova implantação</strong>.</li>
                   <li>Selecione o tipo: <strong>App da Web</strong>.</li>
                   <li>Em "Executar como", escolha: <strong>Eu</strong>.</li>
                   <li>Em "Quem pode acessar", escolha: <strong>Qualquer pessoa</strong>.</li>
                   <li>Clique em Implantar, autorize o acesso e copie a URL gerada.</li>
                   <li>Cole a URL no campo abaixo.</li>
                 </ol>
               </div>

               <Input 
                 label="URL do Apps Script (Web App)" 
                 value={sheetUrl}
                 onChange={(e) => setSheetUrl(e.target.value)}
                 placeholder="https://script.google.com/macros/s/..."
               />
               
               <div className="border rounded-lg overflow-hidden">
                 <div className="flex justify-between items-center bg-gray-100 p-2 border-b">
                   <span className="text-xs font-bold text-gray-500 uppercase px-2">Código do Script</span>
                   <button 
                     onClick={handleCopyCode}
                     className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md transition-colors"
                   >
                     {copied ? <Check size={14} /> : <Copy size={14} />}
                     {copied ? 'Copiado!' : 'Copiar Código'}
                   </button>
                 </div>
                 <pre className="p-3 text-xs bg-gray-900 text-green-400 overflow-x-auto h-40">
                   {GOOGLE_SCRIPT_TEMPLATE}
                 </pre>
               </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={handleSaveSettings}>Salvar Configuração</Button>
            </div>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUsers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Users className="text-blue-600" /> Gerenciar Funcionários
              </h3>
              <button onClick={() => setShowUsers(false)} className="text-gray-400 hover:text-gray-600">
                <X />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input 
                 placeholder="ID (ex: 004)" 
                 value={newUser.id} 
                 onChange={(e) => setNewUser({...newUser, id: e.target.value})} 
                 required
               />
               <Input 
                 placeholder="Nome Completo" 
                 value={newUser.name} 
                 onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
                 required
               />
               <Input 
                 placeholder="Cargo / Função" 
                 value={newUser.position} 
                 onChange={(e) => setNewUser({...newUser, position: e.target.value})} 
               />
               <Input 
                 placeholder="Senha Simples" 
                 value={newUser.password} 
                 onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                 required
               />
               <div className="md:col-span-2">
                 <Button type="submit" fullWidth variant="primary">Adicionar Funcionário</Button>
               </div>
            </form>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 font-semibold">ID</th>
                    <th className="p-3 font-semibold">Nome</th>
                    <th className="p-3 font-semibold">Cargo</th>
                    <th className="p-3 font-semibold">Senha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-600">{u.id}</td>
                      <td className="p-3 font-medium">{u.name}</td>
                      <td className="p-3 text-gray-500">{u.position}</td>
                      <td className="p-3 text-gray-400">****</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};