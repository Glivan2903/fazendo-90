
import React from 'react';

export interface UserInfoProps {
  user: {
    name?: string;
    email?: string;
    phone?: string | null;
    birth_date?: string | null;
  };
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  // Format date string
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return '-';
    }
  };
  
  return (
    <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium">Informações Pessoais</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-sm font-medium">{user?.email || '-'}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Telefone</p>
          <p className="text-sm font-medium">{user?.phone || '-'}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Data de Nascimento</p>
          <p className="text-sm font-medium">{formatDate(user?.birth_date)}</p>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
