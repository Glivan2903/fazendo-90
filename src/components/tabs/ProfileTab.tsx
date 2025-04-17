
import React from "react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileTabProps {
  onSignOut: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ onSignOut }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : "U";
  const name = user?.email ? user.email.split("@")[0] : "Usuário";
  const userId = user?.id || "demo-user";
  
  return (
    <div className="space-y-6">
      <div 
        className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm cursor-pointer" 
        onClick={() => navigate(`/profile/${userId}`)}
      >
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src="https://api.dicebear.com/6.x/avataaars/svg" />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold">{name}</h2>
        <p className="text-gray-500">Membro desde Janeiro 2023</p>
        
        <Button variant="outline" className="mt-4 w-full">
          Ver Perfil Completo
        </Button>
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
