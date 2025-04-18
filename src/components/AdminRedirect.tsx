
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AdminRedirect: React.FC = () => {
  const { userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && userRole === 'admin') {
      navigate('/teacher-dashboard');
    }
  }, [userRole, isLoading, navigate]);
  
  return null;
};

export default AdminRedirect;
