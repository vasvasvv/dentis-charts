import React from 'react';
import { useClinic } from '@/context/ClinicContext';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Stethoscope, LogOut, User, Shield } from 'lucide-react';
export function Header() {
  const {
    clinicName,
  } = useClinic();
  const {
    currentUser,
    logout
  } = useAuth();
  const getRoleBadge = (role: string) => {
    const variants: Record<string, {
      label: string;
      variant: 'default' | 'secondary' | 'outline';
    }> = {
      'super-admin': {
        label: 'Супер Адмін',
        variant: 'default'
      },
      'doctor': {
        label: 'Лікар',
        variant: 'secondary'
      },
      'administrator': {
        label: 'Адміністратор',
        variant: 'outline'
      }
    };
    return variants[role] || {
      label: role,
      variant: 'outline' as const
    };
  };
  const roleInfo = currentUser ? getRoleBadge(currentUser.role) : null;
  return <header className="header-gradient text-primary-foreground shadow-lg">
      <div className="flex items-center justify-between h-14 md:h-16 px-3 md:px-6 text-destructive-foreground bg-[#137a7c]">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-base md:text-lg leading-none">{clinicName}</h1>
              <p className="text-[10px] md:text-xs opacity-80 hidden sm:block">Стоматологічна клініка</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-4">
          {/* User Menu */}
          {currentUser && <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 md:gap-2 hover:bg-white/10 px-1 md:px-2">
                  <Avatar className="w-7 h-7 md:w-8 md:h-8">
                    <AvatarFallback className="bg-white/20 text-primary-foreground text-xs md:text-sm">
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <Badge variant={roleInfo?.variant} className="mt-0.5 text-[10px] h-4 bg-white/20 text-primary-foreground border-white/30">
                      {roleInfo?.label}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">@{currentUser.username}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <User className="w-4 h-4" />
                  Профіль
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Shield className="w-4 h-4" />
                  <div className="flex items-center justify-between flex-1">
                    <span>Роль</span>
                    <Badge variant="outline" className="text-[10px]">{roleInfo?.label}</Badge>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-destructive" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                  Вийти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>}
        </div>
      </div>
    </header>;
}