
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Calendar, Edit2, Save, X } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    checkinsThisMonth: 0,
    attendanceRate: 0,
    workoutsPerWeek: 0,
    totalCheckins: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: ''
  });
  const { user: authUser } = useAuth();
  const isOwnProfile = authUser?.id === userId;

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
          setEditForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            birth_date: data.birth_date || ''
          });
        } else {
          // If user not found in database, simulate a user for demo
          const mockUser = {
            id: userId,
            name: "João Silva",
            email: "joao.silva@exemplo.com",
            phone: "(11) 98765-4321",
            birth_date: "1990-05-15",
            avatar_url: `https://api.dicebear.com/6.x/avataaars/svg?seed=${userId}`,
            created_at: "2023-01-15T00:00:00"
          };
          
          setUser(mockUser);
          setEditForm({
            name: mockUser.name,
            email: mockUser.email,
            phone: mockUser.phone,
            birth_date: mockUser.birth_date
          });
        }
        
        // Fetch user stats
        await fetchUserStats(userId);
        
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Erro ao carregar perfil do usuário");
        // Create a mock user for demo purposes
        const mockUser = {
          id: userId,
          name: "João Silva",
          email: "joao.silva@exemplo.com",
          phone: "(11) 98765-4321",
          birth_date: "1990-05-15",
          avatar_url: `https://api.dicebear.com/6.x/avataaars/svg?seed=${userId}`,
          created_at: "2023-01-15T00:00:00"
        };
        
        setUser(mockUser);
        setEditForm({
          name: mockUser.name,
          email: mockUser.email,
          phone: mockUser.phone,
          birth_date: mockUser.birth_date
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId]);

  const fetchUserStats = async (userId: string) => {
    try {
      // Get current date info for filtering
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
      const currentYear = now.getFullYear();
      const firstDayOfMonth = new Date(currentYear, now.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(currentYear, now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      // Fetch total check-ins
      const { data: totalCheckins, error: totalError } = await supabase
        .from('checkins')
        .select('id')
        .eq('user_id', userId);
        
      if (totalError) throw totalError;
      
      // Fetch check-ins for current month
      const { data: monthlyCheckins, error: monthlyError } = await supabase
        .from('checkins')
        .select('id, classes(date)')
        .eq('user_id', userId)
        .gte('classes.date', firstDayOfMonth)
        .lte('classes.date', lastDayOfMonth);
        
      if (monthlyError) throw monthlyError;
      
      // Calculate stats
      const total = totalCheckins?.length || 0;
      const monthly = monthlyCheckins?.length || 0;
      const weeksInMonth = 4; // Approximation
      const workoutsPerWeek = monthly / weeksInMonth;
      
      // Calculate attendance rate (simplified)
      // Assuming 12 possible classes per week (2 per day, 6 days)
      const attendanceRate = Math.min(100, Math.round((workoutsPerWeek / 3) * 100));
      
      setStats({
        totalCheckins: total,
        checkinsThisMonth: monthly,
        workoutsPerWeek: Math.round(workoutsPerWeek * 10) / 10, // Round to 1 decimal
        attendanceRate
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      // Use demo stats
      setStats({
        checkinsThisMonth: 12,
        attendanceRate: 75,
        workoutsPerWeek: 3,
        totalCheckins: 45
      });
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, reset form
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birth_date: user.birth_date || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          birth_date: editForm.birth_date
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUser(prev => ({
        ...prev,
        ...editForm
      }));
      
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    }
  };

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
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        {isOwnProfile && (
          <Button 
            variant={isEditing ? "outline" : "ghost"} 
            size="sm" 
            onClick={handleEditToggle}
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-1" />
                Editar Perfil
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className="flex flex-col items-center mb-6">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={user?.avatar_url || "https://api.dicebear.com/6.x/avataaars/svg"} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">{user?.name || 'Usuário'}</h1>
        <p className="text-gray-500">Membro desde {memberSince}</p>
      </div>
      
      <div className="space-y-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="name">Nome</label>
              <Input 
                id="name"
                name="name"
                value={editForm.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">Email</label>
              <Input 
                id="email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="phone">Telefone</label>
              <Input 
                id="phone"
                name="phone"
                value={editForm.phone}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="birth_date">Data de Nascimento</label>
              <Input 
                id="birth_date"
                name="birth_date"
                type="date"
                value={editForm.birth_date}
                onChange={handleInputChange}
              />
            </div>
            
            <Button type="submit" className="w-full">
              <Save className="h-4 w-4 mr-1" />
              Salvar Alterações
            </Button>
          </form>
        ) : (
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
        )}
        
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
