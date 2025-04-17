
import { Mail, Phone, Calendar } from "lucide-react";

interface UserInfoProps {
  email: string;
  phone: string;
  birthDate: string;
  formatDate: (date: string) => string;
}

const UserInfo = ({ email, phone, birthDate, formatDate }: UserInfoProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <div className="flex items-center">
        <Mail className="h-5 w-5 text-gray-500 mr-4" />
        <div>
          <div className="text-sm text-gray-500">Email</div>
          <div>{email}</div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Phone className="h-5 w-5 text-gray-500 mr-4" />
        <div>
          <div className="text-sm text-gray-500">Telefone</div>
          <div>{phone}</div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Calendar className="h-5 w-5 text-gray-500 mr-4" />
        <div>
          <div className="text-sm text-gray-500">Data de Nascimento</div>
          <div>{formatDate(birthDate)}</div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
