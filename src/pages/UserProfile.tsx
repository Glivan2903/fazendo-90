
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import ProfileForm from "@/components/ProfileForm";
import { User } from "@/types";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
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
            status: data.role === "admin" ? "Ativo" : "Ativo",
            plan: data.role === "student" ? "Mensal" : "N/A"
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Erro ao carregar perfil do usuário");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId]);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Usuário não encontrado</h2>
        <Button variant="link" onClick={handleGoBack} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-8">
      <header className="py-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          className="rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex-1 ml-4">Perfil do Usuário</h1>
      </header>
      
      <ProfileForm user={profile} readOnly={true} />
    </div>
  );
};

export default UserProfile;
