
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useDeleteUser = (userId: string) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const deleteUser = async () => {
    if (user?.id === userId) {
      toast.error('Você não pode deletar sua própria conta de administrador');
      return;
    }

    setIsDeleting(true);
    try {
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
        navigate('/teacher-dashboard', { replace: true });
        return;
      }

      // Delete all related data in the correct order
      await Promise.all([
        supabase.from('checkins').delete().eq('user_id', userId),
        supabase.from('payments').delete().eq('user_id', userId),
        supabase.from('bank_invoices').delete().eq('user_id', userId),
        supabase.from('subscriptions').delete().eq('user_id', userId),
      ]);

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        throw profileError;
      }

      // Delete the auth user using admin API
      const { error: authError } = await supabase.auth.admin.deleteUser(
        userId
      );

      if (authError) {
        throw authError;
      }

      toast.success('Usuário deletado com sucesso');
      
      // Navigate after a slight delay to prevent UI issues
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

  return { deleteUser, isDeleting };
};
