
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from 'lucide-react';

interface UserProfileActionsProps {
  userId: string;
}

const UserProfileActions: React.FC<UserProfileActionsProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteUser = async () => {
    // Prevent deleting your own admin account
    if (user?.id === userId) {
      toast.error('Você não pode deletar sua própria conta de administrador');
      return;
    }

    setIsDeleting(true);
    try {
      // Delete all data in the correct order to respect foreign key constraints
      
      // First, check if user exists
      const { data: userExists, error: userCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (userCheckError && userCheckError.code !== 'PGRST116') {
        throw userCheckError;
      }
      
      if (!userExists) {
        toast.error('Usuário não encontrado ou já foi deletado');
        setIsDeleteDialogOpen(false);
        navigate('/teacher-dashboard', { replace: true });
        return;
      }
      
      // 1. Delete checkins first
      const { error: checkinError } = await supabase
        .from('checkins')
        .delete()
        .eq('user_id', userId);
        
      if (checkinError) {
        console.error('Error deleting checkins:', checkinError);
      }
      
      // 2. Delete payments
      const { error: paymentError } = await supabase
        .from('payments')
        .delete()
        .eq('user_id', userId);
        
      if (paymentError) {
        console.error('Error deleting payments:', paymentError);
      }
      
      // 3. Delete bank invoices
      const { error: invoiceError } = await supabase
        .from('bank_invoices')
        .delete()
        .eq('user_id', userId);
        
      if (invoiceError) {
        console.error('Error deleting bank invoices:', invoiceError);
      }
      
      // 4. Delete subscriptions
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId);
        
      if (subscriptionError) {
        console.error('Error deleting subscriptions:', subscriptionError);
      }
      
      // 5. Finally delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        throw profileError;
      }

      toast.success('Usuário deletado com sucesso');
      setIsDeleteDialogOpen(false);
      
      // First set dialog to closed, then navigate with slight delay to prevent UI issues
      setTimeout(() => {
        navigate('/teacher-dashboard', { replace: true });
      }, 100);
      
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao deletar usuário');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPassword = () => {
    toast.info('Funcionalidade em desenvolvimento');
  };

  const handleSendNotification = () => {
    toast.info('Funcionalidade em desenvolvimento');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full mt-4">
            <MoreVertical className="w-4 h-4 mr-2" />
            Ações
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Ações do Usuário</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleResetPassword}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Resetar Senha
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendNotification}>
            <Mail className="w-4 h-4 mr-2" />
            Enviar Notificação
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Deletar Usuário
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário
              e todos os dados associados a ele.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteUser();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Sim, deletar usuário'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserProfileActions;
