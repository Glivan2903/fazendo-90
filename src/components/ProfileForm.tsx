
import React, { useState } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { updateUser } from "@/api/userApi";
import { format } from "date-fns";

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

  const handleSelectChange = (field: string, value: string) => {
    setUser(prev => ({
      ...prev,
      [field]: value
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
            <p className="text-gray-500">
              {user.role === "admin" ? "Administrador" : 
               user.role === "coach" ? "Professor" : "Aluno"}
            </p>
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
              <Label htmlFor="gender">Gênero</Label>
              <Select
                value={user.gender || ""}
                onValueChange={(value) => handleSelectChange("gender", value)}
                disabled={readOnly || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                value={user.weight || ""}
                onChange={handleChange}
                disabled={readOnly || isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                value={user.address || ""}
                onChange={handleChange}
                disabled={readOnly || isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="membership_date">Membro desde</Label>
              <Input
                id="membership_date"
                value={user.membership_date ? 
                  format(new Date(user.membership_date), 'dd/MM/yyyy') : 
                  format(new Date(user.created_at), 'dd/MM/yyyy')}
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
