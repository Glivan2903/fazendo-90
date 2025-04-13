
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    checkinsThisMonth: 12,
    attendanceRate: 75,
    workoutsPerWeek: 3,
    totalCheckins: 45
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        if (!userId) {
          throw new Error("User ID is required");
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setUser(data);
        } else {
          // If user not found in database, simulate a user for demo
          setUser({
            id: userId,
            name: "João Silva",
            email: "joao.silva@exemplo.com",
            phone: "(11) 98765-4321",
            birth_date: "1990-05-15",
            avatar_url: `https://api.dicebear.com/6.x/avataaars/svg?seed=${userId}`,
            created_at: "2023-01-15T00:00:00"
          });
        }
        
        // We would normally fetch real stats here
        // For demo purposes, we use hardcoded values
        
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Erro ao carregar perfil do usuário");
        // Create a mock user for demo purposes
        setUser({
          id: userId,
          name: "João Silva",
          email: "joao.silva@exemplo.com",
          phone: "(11) 98765-4321",
          birth_date: "1990-05-15",
          avatar_url: `https://api.dicebear.com/6.x/avataaars/svg?seed=${userId}`,
          created_at: "2023-01-15T00:00:00"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR').format(date);
    } catch (error) {
      return dateStr;
    }
  };
  
  const memberSince = user?.created_at 
    ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(user.created_at))
    : 'Janeiro 2023';
    
  const initials = user?.name 
    ? user.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
    : 'JS';

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <Button variant="ghost" size="icon" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-6 w-6" />
      </Button>
      
      <div className="flex flex-col items-center mb-6">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={user?.avatar_url || "https://api.dicebear.com/6.x/avataaars/svg"} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">{user?.name || 'Usuário'}</h1>
        <p className="text-gray-500">Membro desde {memberSince}</p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-500 mr-4" />
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div>{user?.email || 'joao.silva@exemplo.com'}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-gray-500 mr-4" />
            <div>
              <div className="text-sm text-gray-500">Telefone</div>
              <div>{user?.phone || '(11) 98765-4321'}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-500 mr-4" />
            <div>
              <div className="text-sm text-gray-500">Data de Nascimento</div>
              <div>{user?.birth_date ? formatDate(user.birth_date) : '15/05/1990'}</div>
            </div>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-blue-600 text-2xl font-bold">{stats.checkinsThisMonth}</div>
              <div className="text-gray-600 text-sm">Check-ins este mês</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-blue-600 text-2xl font-bold">{stats.attendanceRate}%</div>
              <div className="text-gray-600 text-sm">Taxa de Frequência</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-blue-600 text-2xl font-bold">{stats.workoutsPerWeek}</div>
              <div className="text-gray-600 text-sm">Treinos por semana</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-blue-600 text-2xl font-bold">{stats.totalCheckins}</div>
              <div className="text-gray-600 text-sm">Total de check-ins</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
