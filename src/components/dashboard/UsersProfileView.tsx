import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import UserProfileForm from '@/components/profile/admin/UserProfileForm';
import UserProfileActions from '@/components/profile/admin/UserProfileActions';
import UserProfileNotes from '@/components/profile/admin/UserProfileNotes';
import { CalendarX, Clock, AlertTriangle } from 'lucide-react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserHistoryDialog from './attendance/UserHistoryDialog';
import UserPlansManagement from './users/UserPlansManagement';
import UserCheckinHistory from './users/UserCheckinHistory';
import UserBankInvoices from './users/UserBankInvoices';
import UserSales from './users/UserSales';

interface UserProfileViewProps {
  userId: string | null;
  onClose: () => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ userId, onClose }) => {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkinsCount, setCheckinsCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCheckinHistory, setShowCheckinHistory] = useState(false);
  const [userCheckinHistory, setUserCheckinHistory] = useState<any[]>([]);
  const { subscription, isLoading: subscriptionLoading } = useSubscriptionStatus(userId || undefined);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchCheckinsCount();
      fetchUserCheckins();
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

  const fetchUserCheckins = async () => {
    try {
      if (!userId) return;

      const { data, error } = await supabase
        .from('checkins')
        .select(`
          id,
          checked_in_at,
          status,
          classes (
            date,
            start_time,
            programs (name)
          )
        `)
        .eq('user_id', userId)
        .order('checked_in_at', { ascending: false });

      if (error) throw error;

      const formattedCheckins = data?.map(checkin => ({
        date: checkin.classes?.date || '',
        class_name: checkin.classes?.programs?.name || 'CrossFit',
        coach_name: 'Coach', // Poderia buscar do banco, mas não temos essa informação diretamente
        checked_in_at: checkin.checked_in_at,
        status: checkin.status
      })) || [];

      setUserCheckinHistory(formattedCheckins);
    } catch (error) {
      console.error('Error fetching user checkins:', error);
    }
  };

  const handleSave = async (updatedProfile: any) => {
    try {
      console.log('Updating profile with:', updatedProfile);

      // Handle empty birth_date to prevent PostgreSQL date format errors
      if (updatedProfile.birth_date === '') {
        updatedProfile.birth_date = null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', userId);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      setProfile(prev => ({ ...prev, ...updatedProfile }));
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  if (loading) {
    return null;
  }

  if (!profile) {
    return null;
  }

  const memberSince = profile.created_at ? 
    format(new Date(profile.created_at), "dd/MM/yyyy", { locale: ptBR }) : 
    "N/A";
    
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

      <div className="border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="bank-invoices">Faturas</TabsTrigger>
            <TabsTrigger value="checkins">Check-ins</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Avatar className="w-32 h-32 mx-auto mb-4">
                        <AvatarImage src={profile.avatar_url} alt={profile.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>

                      <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                      <Badge 
                        className={`mb-4 ${
                          profile.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
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

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-3">Assinatura</h3>
                    
                    {subscriptionLoading ? (
                      <div className="text-center py-3">Carregando dados da assinatura...</div>
                    ) : subscription ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Plano atual</p>
                            <p className="font-semibold">{subscription.plans?.name || "N/A"}</p>
                          </div>
                          
                          {subscription.isExpired ? (
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                              <CalendarX className="w-3.5 h-3.5 mr-1" />
                              Vencido
                            </Badge>
                          ) : subscription.daysUntilExpiration !== null && subscription.daysUntilExpiration <= 7 ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              {subscription.daysUntilExpiration} dias
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              Ativo
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Início</p>
                            <p>{subscription.formattedStartDate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Término</p>
                            <p>{subscription.formattedEndDate}</p>
                          </div>
                        </div>
                        
                        {subscription.hasUnpaidPayments && (
                          <div className="flex items-center bg-amber-50 text-amber-800 p-2 rounded-md text-sm mt-2">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            <span>Possui pagamentos pendentes</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-3 text-muted-foreground">
                        Sem assinatura ativa
                      </div>
                    )}
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
          </TabsContent>

          <TabsContent value="plans" className="mt-0">
            <UserPlansManagement userId={userId} />
          </TabsContent>

          <TabsContent value="sales" className="mt-0">
            <UserSales userId={userId} userName={profile.name} />
          </TabsContent>

          <TabsContent value="bank-invoices" className="mt-0">
            <UserBankInvoices userId={userId} />
          </TabsContent>

          <TabsContent value="checkins" className="mt-0">
            <UserCheckinHistory userId={userId} checkins={userCheckinHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfileView;
