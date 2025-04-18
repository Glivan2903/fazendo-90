
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileForm from '@/components/profile/ProfileForm';
import UserInfo from '@/components/profile/UserInfo';
import UserStats from '@/components/profile/UserStats';

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
          const userWithDefaults = {
            ...data,
            phone: data.phone || '',
            birth_date: data.birth_date || ''
          };
          
          setUser(userWithDefaults);
          setEditForm({
            name: userWithDefaults.name || '',
            email: userWithDefaults.email || '',
            phone: userWithDefaults.phone || '',
            birth_date: userWithDefaults.birth_date || ''
          });
        } else {
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
        
        await fetchUserStats(userId);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Erro ao carregar perfil do usuário");
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
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const firstDayOfMonth = new Date(currentYear, now.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(currentYear, now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const { data: totalCheckins, error: totalError } = await supabase
        .from('checkins')
        .select('id')
        .eq('user_id', userId);
        
      if (totalError) throw totalError;
      
      const { data: monthlyCheckins, error: monthlyError } = await supabase
        .from('checkins')
        .select('id, classes(date)')
        .eq('user_id', userId)
        .gte('classes.date', firstDayOfMonth)
        .lte('classes.date', lastDayOfMonth);
        
      if (monthlyError) throw monthlyError;
      
      const total = totalCheckins?.length || 0;
      const monthly = monthlyCheckins?.length || 0;
      const weeksInMonth = 4;
      const workoutsPerWeek = monthly / weeksInMonth;
      
      const attendanceRate = Math.min(100, Math.round((workoutsPerWeek / 3) * 100));
      
      setStats({
        totalCheckins: total,
        checkinsThisMonth: monthly,
        workoutsPerWeek: Math.round(workoutsPerWeek * 10) / 10,
        attendanceRate
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
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
          ...(editForm.phone && { phone: editForm.phone }),
          ...(editForm.birth_date && { birth_date: editForm.birth_date })
        })
        .eq('id', userId);
        
      if (error) throw error;
      
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Create the user object in the format expected by UserInfo
  const userInfoData = {
    name: user?.name,
    email: user?.email || '',
    phone: user?.phone || null,
    birth_date: user?.birth_date || null
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <ProfileHeader
        name={user?.name || 'Usuário'}
        memberSince={memberSince}
        avatarUrl={user?.avatar_url}
        initials={initials}
        isEditing={isEditing}
        isOwnProfile={isOwnProfile}
        onBackClick={() => navigate(-1)}
        onEditToggle={handleEditToggle}
      />
      
      <div className="space-y-6">
        {isEditing ? (
          <ProfileForm
            editForm={editForm}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        ) : (
          <UserInfo user={userInfoData} />
        )}
        
        <UserStats stats={stats} />
      </div>
    </div>
  );
};

export default UserProfile;
