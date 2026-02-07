import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { storageService } from '../services/storageService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Lock, User as UserIcon } from 'lucide-react';

export const Login: React.FC = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = storageService.getUsers();
    const user = users.find(u => u.id === id && u.password === password);

    if (user) {
      storageService.login(user);
      if (user.role === UserRole.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">PontoSeguro</h1>
          <p className="text-blue-100">Bem-vindo ao sistema</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute top-3.5 left-3 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="ID do Usuário (ex: 000)" 
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute top-3.5 left-3 w-5 h-5 text-gray-400" />
              <Input 
                type="password"
                placeholder="Senha (ex: 111)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" fullWidth>
            Entrar no Sistema
          </Button>
        </form>
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
           ID: 000 | Senha: 111 (Admin/Tablet)
        </div>
      </div>
    </div>
  );
};