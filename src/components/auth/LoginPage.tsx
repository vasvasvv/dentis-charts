import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Stethoscope, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = await login(username, password);
    if (!result.success) {
      setError(result.error || 'Помилка входу');
    }
    
    setIsLoading(false);
  };

return (
    <div className="min-h-screen flex items-center justify-center     bg-gradient-to-br 
              from-[hsl(40,25%,97%)] 
              via-[hsl(38,30%,95%)] 
              to-[hsl(36,28%,93%)] p-4 relative overflow-hidden">

      {/* ─── Фонова картинка 400×400 по центру, напівпрозора ─── */}
      <div
        className="
          absolute inset-0 
          flex items-center justify-center pointer-events-none
        "
      >
        <div
          className="
            w-[400px] h-[400px] 
            bg-[url('/src/assets/favicon.png')]   
            bg-no-repeat bg-center bg-contain     
            opacity-70                           
            transition-opacity duration-700
          "
        />
      </div>

      {/* ─── Основний контент (форма) ─── */}
      <div className="w-full max-w-md animate-fade-in  
              shadow-2xl 
              border border-border/40
              rounded-2xl
              bg-gradient-to-tl 
    from-[#fdfaf5]
    via-[#fbf7f0]
    to-[#f8f3ea]
                     
              backdrop-blur-[2px]               
              overflow-hidden
              relativ
              z-10">
        {/* Logo */}
        <div className="text-center mb-8">
         <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent overflow-hidden shadow-lg mb-4 mt-10">
           <img 
             src="/src/assets/logo.png"          
             alt="Dentis Logo"
             className="w-full h-full object-cover"  
            />
         </div>
           <h1 className="font-heading text-2xl font-bold text-foreground">Dentis</h1>
           <p className="text-muted-foreground mt-1">Стоматологічна клініка</p>
        </div>
        <Card className="shadow-medium border-0 bg-muted/3e">         
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-heading text-xl">Ласкаво просимо</CardTitle>
            <CardDescription>Увійдіть для доступу до системи</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Логін</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введіть логін"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введіть пароль"
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full btn-gradient" disabled={isLoading}>
                {isLoading ? 'Вхід...' : 'Увійти'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mb-3 mt-3">
         • Працює онлайн • Дані не зберігаються локально • 
        </p>
      </div>
    </div>
  );
}
