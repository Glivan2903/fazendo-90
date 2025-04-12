
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const ClassDetailRedirect: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Função para verificar se um ID é um UUID válido
    const isValidUUID = (id: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(id);
    };
    
    // Se o classId não for um UUID válido, geramos um novo e redirecionamos
    if (classId && !isValidUUID(classId)) {
      const newClassId = crypto.randomUUID();
      navigate(`/class/${newClassId}`, { replace: true });
    }
  }, [classId, navigate]);
  
  return (
    <div className="flex justify-center items-center h-screen">
      <LoadingSpinner />
    </div>
  );
};

export default ClassDetailRedirect;
