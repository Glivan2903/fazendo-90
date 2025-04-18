
import React from 'react';
import { Mail, Phone, Calendar } from 'lucide-react';

export interface UserInfoProps {
  user: {
    email: string;
    phone?: string | null;
    birth_date?: string | null;
  };
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  return (
    <div className="space-y-4 bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center space-x-2">
        <Mail className="w-4 h-4 text-gray-500" />
        <span>{user.email}</span>
      </div>
      
      {user.phone && (
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <span>{user.phone}</span>
        </div>
      )}
      
      {user.birth_date && (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{user.birth_date}</span>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
