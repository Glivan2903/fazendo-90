
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceTabProps {
  attendanceData: any[];
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({ attendanceData: initialData }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [programs, setPrograms] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    fetchPrograms();
    fetchAttendanceData(selectedDate, selectedProgram);
  }, []);
  
  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("id, name");
        
      if (error) throw error;
      
      setPrograms(data || []);
    } catch (error) {
      console.error("Erro ao buscar programas:", error);
    }
  };
  
  const fetchAttendanceData = async (date: Date, programId: string) => {
    setLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      let query = supabase
        .from('classes')
        .select(`
          id,
          date,
          start_time,
          end_time,
          max_capacity,
          programs (id, name),
          profiles!coach_id (id, name),
          checkins (id, status)
        `)
        .eq('date', formattedDate);
        
      if (programId !== "all") {
        query = query.eq('program_id', programId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data for display
      const transformedData = (data || []).map(cls => {
        const confirmedCheckIns = cls.checkins?.filter(ci => ci.status === 'confirmed') || [];
        const total = cls.max_capacity;
        const present = confirmedCheckIns.length;
        const absent = total - present;
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return {
          id: cls.id,
          date: cls.date,
          class: `${cls.start_time.substring(0, 5)} - ${cls.programs?.name || 'CrossFit'}`,
          coach: cls.profiles?.name || 'Não atribuído',
          present,
          absent,
          total,
          rate
        };
      });
      
      setAttendanceData(transformedData);
    } catch (error) {
      console.error("Erro ao buscar dados de presença:", error);
      toast.error("Erro ao buscar dados de presença");
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      fetchAttendanceData(date, selectedProgram);
    }
  };
  
  const handleProgramChange = (value: string) => {
    setSelectedProgram(value);
    fetchAttendanceData(selectedDate, value);
  };
  
  const handleViewDetails = (classId: string) => {
    // Navigate to class detail page
    window.open(`/class/${classId}`, '_blank');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Controle de Presença</h2>
          <p className="text-gray-500">Registros de presença dos alunos</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Select value={selectedProgram} onValueChange={handleProgramChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Todas as aulas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as aulas</SelectItem>
              {programs.map(program => (
                <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full md:w-[180px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Aula</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Presentes</TableHead>
                  <TableHead>Ausentes</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.length > 0 ? (
                  attendanceData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{item.class}</TableCell>
                      <TableCell>{item.coach}</TableCell>
                      <TableCell>{item.present}</TableCell>
                      <TableCell>{item.absent}</TableCell>
                      <TableCell>{item.rate}%</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewDetails(item.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Nenhum registro de presença encontrado para esta data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTab;
