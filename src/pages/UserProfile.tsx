
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

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
        
        setProfile(data);
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
  
  // Use optional chaining to safely access phone and birth_date
  const phoneDisplay = profile?.phone || "Não informado";
  const birthDateDisplay = profile?.birth_date || "Não informada";

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
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
      
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="rounded-full w-20 h-20 bg-gray-300 overflow-hidden">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-2xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-gray-600">{profile.role}</p>
          </div>
        </div>
        
        <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm">
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Email</h3>
            <p>{profile.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Telefone</h3>
            <p>{phoneDisplay}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Data de Nascimento</h3>
            <p>{birthDateDisplay}</p>
          </div>
          
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Membro desde</h3>
            <p>{new Date(profile.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={handleGoBack}>
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
