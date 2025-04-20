import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Home, LogOut, CheckCircle, UserCheck, Menu, X, Calendar, BarChart2, UserCircle } from 'lucide-react';
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
import BottomNavigation from '@/components/BottomNavigation';
import { useCheckInPage } from '@/hooks/useCheckInPage';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState(0);
  const [expiringSubscriptions, setExpiringSubscriptions] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile();
  
  const getActiveTabFromLocation = () => {
    const path = location.pathname;
    if (path.includes('profile')) return 'perfil';
    if (path.includes('check-in')) return 'inicio';
    if (path.includes('aulas')) return 'aulas';
    if (path.includes('treinos')) return 'treinos';
    return 'inicio';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTabFromLocation());
  
  useEffect(() => {
    setActiveTab(getActiveTabFromLocation());
  }, [location]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'inicio') navigate('/check-in');
    else if (tab === 'perfil' && user) navigate(`/profile/${user.id}`);
    else if (tab === 'aulas') navigate('/check-in'); // Temporary until aulas page is implemented
    else if (tab === 'treinos') navigate('/check-in'); // Temporary until treinos page is implemented
  };

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
      checkExpiringSubscriptions();

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

  const checkExpiringSubscriptions = async () => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const { data, error } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('status', 'active')
      .lt('end_date', threeDaysFromNow.toISOString())
      .gt('end_date', new Date().toISOString());

    if (!error && data) {
      setExpiringSubscriptions(data.length);
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const totalNotifications = pendingUsers + expiringSubscriptions;

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    toast({
      title: "Logout realizado com sucesso",
      duration: 2000,
    });
  };

  const desktopSidebarContent = (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <div className="flex flex-col items-center space-y-2">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{getInitials(user?.user_metadata?.name || 'User')}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-medium">{user?.user_metadata?.name || 'User'}</p>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{user?.email}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="space-y-1 p-2">
          <Button
            variant={activeTab === "inicio" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => navigate('/check-in')}
          >
            <Home className="mr-2 h-4 w-4" />
            Início
          </Button>

          <Button
            variant={activeTab === "aulas" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleTabChange('aulas')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Aulas
          </Button>

          <Button
            variant={activeTab === "treinos" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => handleTabChange('treinos')}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Treinos
          </Button>

          <Button
            variant={activeTab === "perfil" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => navigate(`/profile/${user?.id}`)}
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Meu Perfil
          </Button>

          {(userRole === 'admin' || userRole === 'coach') && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/teacher-dashboard')}
            >
              <Bell className="mr-2 h-4 w-4" />
              Dashboard
              {userRole === 'admin' && totalNotifications > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {totalNotifications}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );

  const mobileMenuContent = (
    <div className="flex flex-col h-full">
      <header className="border-b p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Menu className="h-6 w-6 md:hidden" />
          Check-in
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(false)} aria-label="Fechar menu">
          <X className="h-5 w-5" />
        </Button>
      </header>
      
      <div className="flex items-center space-x-4 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name || 'User'} />
          <AvatarFallback>{getInitials(user?.user_metadata?.name || 'User')}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user?.user_metadata?.name || 'User'}</p>
          <p className="text-sm text-muted-foreground truncate max-w-[180px]">{user?.email}</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                activeTab === "inicio" && "bg-accent text-accent-foreground"
              )}
              onClick={() => {
                navigate('/check-in');
                setShowMobileMenu(false);
              }}
            >
              <Home className="mr-2 h-5 w-5" />
              Início
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                activeTab === "aulas" && "bg-accent text-accent-foreground"
              )}
              onClick={() => {
                handleTabChange('aulas');
                setShowMobileMenu(false);
              }}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Aulas
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                activeTab === "treinos" && "bg-accent text-accent-foreground"
              )}
              onClick={() => {
                handleTabChange('treinos');
                setShowMobileMenu(false);
              }}
            >
              <BarChart2 className="mr-2 h-5 w-5" />
              Treinos
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                activeTab === "perfil" && "bg-accent text-accent-foreground"
              )}
              onClick={() => {
                navigate(`/profile/${user?.id}`);
                setShowMobileMenu(false);
              }}
            >
              <UserCircle className="mr-2 h-5 w-5" />
              Meu Perfil
            </Button>
          </li>
          
          {(userRole === 'admin' || userRole === 'coach') && (
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate('/teacher-dashboard');
                  setShowMobileMenu(false);
                }}
              >
                <Bell className="mr-2 h-5 w-5" />
                Dashboard
                {userRole === 'admin' && totalNotifications > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {totalNotifications}
                  </Badge>
                )}
              </Button>
            </li>
          )}
        </ul>
      </nav>
      
      <div className="border-t p-4 mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex w-64 border-r overflow-hidden">
        {desktopSidebarContent}
      </div>

      {!showMobileMenu && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50 p-2"
          onClick={() => setShowMobileMenu(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetContent
          side="left"
          className="p-0 w-72"
          aria-label="Menu lateral do aplicativo"
        >
          {mobileMenuContent}
        </SheetContent>
      </Sheet>

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto p-4 md:p-6 pb-20">
          {children}
        </div>
      </div>

      <div className="md:hidden">
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};

export default SidebarLayout;
