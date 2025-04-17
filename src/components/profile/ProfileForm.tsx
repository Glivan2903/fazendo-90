
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface ProfileFormProps {
  editForm: {
    name: string;
    email: string;
    phone: string;
    birth_date: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const ProfileForm = ({ editForm, handleInputChange, handleSubmit }: ProfileFormProps) => {
  return (
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
  );
};

export default ProfileForm;
