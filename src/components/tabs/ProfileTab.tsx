
import React, { useEffect, useState } from "react";
import { LogOut, User, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User as UserType } from "@/types";

interface ProfileTabProps {
  onSignOut: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ onSignOut }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setProfile({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            avatar_url: data.avatar_url,
            avatarUrl: data.avatar_url,
            created_at: data.created_at,
            phone: data.phone,
            birth_date: data.birth_date,
            status: "Ativo",
            plan: data.role === "student" ? "Mensal" : "N/A"
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user?.id]);
  
  const initials = profile?.name ? profile.name.substring(0, 2).toUpperCase() : user?.email ? user.email.substring(0, 2).toUpperCase() : "U";
  const name = profile?.name || (user?.email ? user.email.split("@")[0] : "Usuário");
  const userId = user?.id || "demo-user";
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Janeiro 2023";
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return "Janeiro 2023";
    }
  };
  
  return (
    <div className="space-y-6">
      <div 
        className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm cursor-pointer" 
        onClick={() => navigate(`/profile/${userId}`)}
      >
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={profile?.avatarUrl || "https://api.dicebear.com/6.x/avataaars/svg"} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold">{name}</h2>
        <p className="text-gray-500">Membro desde {formatDate(profile?.created_at)}</p>
        
        <div className="flex w-full gap-2 mt-4">
          <Button variant="outline" className="flex-1">
            <User className="mr-2 h-4 w-4" />
            Ver Perfil
          </Button>
          <Button variant="outline" className="flex-1">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-blue-600 text-2xl font-bold">12</div>
            <div className="text-gray-600 text-sm">Check-ins este mês</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-blue-600 text-2xl font-bold">75%</div>
            <div className="text-gray-600 text-sm">Taxa de Frequência</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-blue-600 text-2xl font-bold">3</div>
            <div className="text-gray-600 text-sm">Treinos por semana</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-blue-600 text-2xl font-bold">45</div>
            <div className="text-gray-600 text-sm">Total de check-ins</div>
          </div>
        </CardContent>
      </Card>
      
      <Button variant="destructive" className="w-full" onClick={onSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </div>
  );
};

export default ProfileTab;
