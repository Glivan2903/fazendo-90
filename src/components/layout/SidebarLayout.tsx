
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Home, LogOut, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (userRole === 'admin') {
      const channel = supabase
        .channel('pending-users')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: 'status=eq.Pendente'
          },
          () => {
            checkPendingUsers();
          }
        )
        .subscribe();

      checkPendingUsers();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userRole]);

  const checkPendingUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('status', 'Pendente');

    if (!error && data) {
      setPendingUsers(data.length);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    toast({
      title: "Logout realizado com sucesso",
      duration: 2000,
    });
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name} />
            <AvatarFallback>{user?.user_metadata?.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-medium">{user?.user_metadata?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/check-in')}
          >
            <Home className="mr-2 h-5 w-5" />
            Início
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate(`/profile/${user?.id}`)}
          >
            <Clock className="mr-2 h-5 w-5" />
            Meu Perfil
          </Button>
        </div>
      </div>

      <Button
        variant="ghost"
        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-5 w-5" />
        Sair
      </Button>
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 border-r bg-white overflow-hidden">
        {sidebarContent}
      </div>

      {/* Mobile Menu Button */}
      {!showMobileMenu && (
        <Button variant="ghost" className="md:hidden fixed top-4 left-4 z-50 p-2"
          onClick={() => setShowMobileMenu(true)}>
          <Home className="h-5 w-5" />
        </Button>
      )}

      {/* Mobile Sidebar */}
      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetContent side="left" className="w-64 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
