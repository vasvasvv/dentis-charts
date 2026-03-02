import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ROLES = [
  { id: 2, value: 'doctor',        label: 'Лікар',          badge: 'secondary' as const },
  { id: 3, value: 'administrator', label: 'Адміністратор',  badge: 'outline'   as const },
];

export function AddUserModal({ open, onOpenChange, onSuccess }: AddUserModalProps) {
  const { token, currentUser } = useAuth();

  const [lastName,  setLastName]  = useState('');
  const [firstName, setFirstName] = useState('');
  const [roleId,    setRoleId]    = useState<number>(2);
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);

  // Тільки superadmin та doctor можуть додавати
  const canAdd = currentUser?.role === 'super-admin'
    || currentUser?.role === 'superadmin'
    || currentUser?.role === 'doctor';

  if (!canAdd) return null;

  const reset = () => {
    setLastName('');
    setFirstName('');
    setRoleId(2);
    setEmail('');
    setPassword('');
    setShowPass(false);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lastName.trim() || !firstName.trim() || !email.trim() || !password.trim()) {
      toast.error("Заповніть усі поля");
      return;
    }
    if (password.length < 6) {
      toast.error("Пароль — мінімум 6 символів");
      return;
    }

    setLoading(true);
    try {
      const fullName = `${lastName.trim()} ${firstName.trim()}`;
      await api.createUser({ email: email.trim(), password, fullName, roleId }, token!);

      toast.success(`Користувача "${fullName}" успішно додано`);
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Помилка при створенні користувача');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Додати нового користувача
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Прізвище + Ім'я */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Прізвище *</Label>
              <Input
                id="lastName"
                placeholder="Іваненко"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Ім'я *</Label>
              <Input
                id="firstName"
                placeholder="Іван"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </div>
          </div>

          {/* Роль */}
          <div className="space-y-1.5">
            <Label>Роль *</Label>
            <div className="flex gap-2">
              {ROLES.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoleId(r.id)}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    roleId === r.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Електронна пошта *</Label>
            <Input
              id="email"
              type="email"
              placeholder="ivan@clinic.ua"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Пароль */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Пароль *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Мінімум 6 символів"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Скасувати
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Збереження...' : 'Додати користувача'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
