
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Mail, Phone, MapPin, Calendar, User2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import UserProfileForm from '@/components/profile/admin/UserProfileForm';
import UserProfileActions from '@/components/profile/admin/UserProfileActions';
import UserProfileNotes from '@/components/profile/admin/UserProfileNotes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface UserProfileViewProps {
  userId: string | null;
  onClose: () => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ userId, onClose }) => {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkinsCount, setCheckinsCount] = useState<number>(0);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchCheckinsCount();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      if (!userId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Erro ao carregar perfil do usuário');
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckinsCount = async () => {
    try {
      if (!userId) return;

      const { data, error } = await supabase
        .from('user_checkin_counts')
        .select('total_checkins')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setCheckinsCount(data?.total_checkins || 0);
    } catch (error) {
      console.error('Error fetching checkins count:', error);
    }
  };

  const handleSave = async (updatedProfile: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', userId);

      if (error) throw error;

      setProfile(prev => ({ ...prev, ...updatedProfile }));
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  if (!profile) {
    return null;
  }

  const memberSince = format(new Date(profile.created_at), "dd/MM/yyyy", { locale: ptBR });
  const initials = profile.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Perfil do Usuário</h2>
        <Button variant="outline" onClick={onClose}>Voltar</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Profile info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage src={profile.avatar_url} alt={profile.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                <Badge variant={profile.status === 'Ativo' ? 'default' : 'secondary'} className="mb-4">
                  {profile.status}
                </Badge>

                <div className="text-sm text-gray-500 mb-6">
                  Membro desde {memberSince}
                </div>

                <Button
                  variant={isEditing ? 'destructive' : 'default'}
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full"
                >
                  {isEditing ? 'Cancelar Edição' : 'Editar Perfil'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <UserProfileActions userId={userId} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{checkinsCount}</div>
                <div className="text-sm text-gray-600">Total de check-ins</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{memberSince}</div>
                <div className="text-sm text-gray-600">Membro desde</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column - Form and Notes */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <UserProfileForm
                profile={profile}
                isEditing={isEditing}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <UserProfileNotes
                notes={profile.notes}
                isEditing={isEditing}
                onSave={(notes) => handleSave({ notes })}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
