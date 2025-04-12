
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const ClassDetailRedirect: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Função para verificar se um ID é um UUID válido
    const isValidUUID = (id: string) => {
      if (!id) return false;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(id);
    };
    
    try {
      // Se o classId não for um UUID válido, redirecionamos para a página de check-in
      if (classId && !isValidUUID(classId)) {
        console.log("ID de classe inválido, redirecionando para check-in");
        navigate("/check-in", { replace: true });
        return;
      }
      
      // Se for um UUID válido, continuamos para a página de detalhes
      navigate(`/class/${classId}/${crypto.randomUUID()}`, { replace: true });
    } catch (error) {
      console.error("Erro ao redirecionar:", error);
      navigate("/check-in", { replace: true });
    }
  }, [classId, navigate]);
  
  return (
    <div className="flex justify-center items-center h-screen">
      <LoadingSpinner />
    </div>
  );
};

export default ClassDetailRedirect;
