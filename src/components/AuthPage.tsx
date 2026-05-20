import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface AuthPageProps {
  onLogin: () => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (login === 'admin' && password === 'admin') {
      onLogin();
    } else {
      setError('Неверный логин или пароль. Попробуйте admin / admin');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(220,28%,9%) 0%, hsl(220,22%,14%) 50%, hsl(24,40%,12%) 100%)' }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, hsl(24,95%,53%) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, hsl(24,95%,53%) 0%, transparent 70%)' }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(hsl(220,15%,40%) 1px, transparent 1px), linear-gradient(90deg, hsl(220,15%,40%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Floating tech icons */}
      <div className="absolute top-20 left-10 opacity-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
        <Icon name="Monitor" size={48} className="text-orange-400" />
      </div>
      <div className="absolute top-40 right-16 opacity-10 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
        <Icon name="Laptop" size={40} className="text-orange-400" />
      </div>
      <div className="absolute bottom-32 left-20 opacity-10 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
        <Icon name="Cpu" size={44} className="text-orange-400" />
      </div>
      <div className="absolute bottom-20 right-32 opacity-10 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}>
        <Icon name="HardDrive" size={36} className="text-orange-400" />
      </div>

      <div className="w-full max-w-md px-4 animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 orange-glow" style={{ background: 'linear-gradient(135deg, hsl(24,95%,53%) 0%, hsl(24,85%,42%) 100%)' }}>
            <Icon name="Wrench" size={36} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white tracking-wide mb-1">АИС Ремонт</h1>
          <p className="text-sm" style={{ color: 'hsl(220,15%,55%)' }}>Автоматизированная информационная система</p>
          <p className="text-xs mt-1" style={{ color: 'hsl(220,15%,40%)' }}>Управление ремонтом компьютерной техники</p>
        </div>

        <Card className="border-0 shadow-2xl" style={{ background: 'hsl(220,22%,16%)', borderColor: 'hsl(220,20%,22%)' }}>
          <CardHeader className="pb-4 pt-8 px-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 rounded-full bg-orange-500" />
              <h2 className="font-display text-xl font-semibold text-white">Вход в систему</h2>
            </div>
            <p className="text-xs pl-3" style={{ color: 'hsl(220,15%,50%)' }}>Введите учётные данные для доступа</p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: 'hsl(220,15%,70%)' }}>Логин</Label>
                <div className="relative">
                  <Icon name="User" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(220,15%,45%)' }} />
                  <Input
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    placeholder="Введите логин"
                    className="pl-9 border-0 text-white placeholder:text-slate-500"
                    style={{ background: 'hsl(220,25%,12%)', color: 'white' }}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: 'hsl(220,15%,70%)' }}>Пароль</Label>
                <div className="relative">
                  <Icon name="Lock" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(220,15%,45%)' }} />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="pl-9 pr-10 border-0 text-white placeholder:text-slate-500"
                    style={{ background: 'hsl(220,25%,12%)', color: 'white' }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity"
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {error && (
                <Alert className="border-red-500/30 bg-red-500/10 animate-fade-in">
                  <Icon name="AlertCircle" size={16} className="text-red-400" />
                  <AlertDescription className="text-red-300 text-sm ml-1">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-display font-semibold text-base tracking-wide text-white transition-all hover:shadow-lg"
                style={{ background: loading ? 'hsl(220,20%,25%)' : 'linear-gradient(135deg, hsl(24,95%,53%) 0%, hsl(24,85%,42%) 100%)', border: 'none' }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Проверка...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Icon name="LogIn" size={18} />
                    Войти
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t flex items-center justify-center gap-2" style={{ borderColor: 'hsl(220,20%,22%)' }}>
              <Icon name="Info" size={14} style={{ color: 'hsl(220,15%,40%)' }} />
              <span className="text-xs" style={{ color: 'hsl(220,15%,40%)' }}>Демо: логин <span className="text-orange-400 font-mono">admin</span> / пароль <span className="text-orange-400 font-mono">admin</span></span>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs mt-6" style={{ color: 'hsl(220,15%,35%)' }}>
          © 2026 АИС Ремонт — Все права защищены
        </p>
      </div>
    </div>
  );
}
