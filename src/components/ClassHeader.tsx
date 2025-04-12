
import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Clock } from "lucide-react";
import { ClassDetail } from "../types";

interface ClassHeaderProps {
  classData: ClassDetail;
  className?: string;
}

const ClassHeader: React.FC<ClassHeaderProps> = ({ classData, className }) => {
  const navigate = useNavigate();
  
  const formattedDate = format(classData.startTime, "d 'de' MMMM", {
    locale: ptBR,
  });
  const startTimeFormatted = format(classData.startTime, "HH:mm");
  const endTimeFormatted = format(classData.endTime, "HH:mm");

  return (
    <header className={`py-4 ${className || ''}`}>
      <button
        className="flex items-center text-blue-500 mb-4"
        onClick={() => navigate("/check-in")}
      >
        <ArrowLeft size={18} className="mr-1" />
        Voltar
      </button>
      <h1 className="text-2xl font-bold">{classData.program.name}</h1>
      <div className="flex items-center gap-1 text-gray-600 mt-1">
        <Clock size={16} />
        <span>{formattedDate} • {startTimeFormatted} - {endTimeFormatted}</span>
      </div>
    </header>
  );
};

export default ClassHeader;
