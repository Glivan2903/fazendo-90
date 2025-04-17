
import React, { useState } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { updateUser } from "@/api/userApi";

interface ProfileFormProps {
  user: User;
  readOnly?: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user: initialUser, readOnly = false }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (readOnly) return;
    
    try {
      setIsLoading(true);
      await updateUser(user);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "U";
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatarUrl || user.avatar_url} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.role === "admin" ? "Administrador" : user.role === "coach" ? "Professor" : "Aluno"}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                value={user.name}
                onChange={handleChange}
                disabled={readOnly || isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={user.email}
                onChange={handleChange}
                disabled={readOnly || isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={user.phone || ""}
                onChange={handleChange}
                disabled={readOnly || isLoading}
                placeholder={readOnly && !user.phone ? "Não informado" : ""}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                name="birth_date"
                type="date"
                value={user.birth_date || ""}
                onChange={handleChange}
                disabled={readOnly || isLoading}
                placeholder={readOnly && !user.birth_date ? "Não informada" : ""}
              />
            </div>
            
            {user.plan && (
              <div className="space-y-2">
                <Label htmlFor="plan">Plano</Label>
                <Input
                  id="plan"
                  value={user.plan}
                  disabled={true}
                  readOnly
                />
              </div>
            )}
            
            {user.status && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  value={user.status}
                  disabled={true}
                  readOnly
                  className={user.status === "Ativo" ? "text-green-600" : "text-red-600"}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="created_at">Membro desde</Label>
              <Input
                id="created_at"
                value={new Date(user.created_at).toLocaleDateString("pt-BR")}
                disabled={true}
                readOnly
              />
            </div>
          </div>
          
          {!readOnly && (
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          )}
          
          {readOnly && (
            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Voltar
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
