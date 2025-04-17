
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, User as UserIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { fetchAttendance, fetchClassAttendees } from "@/api/attendanceApi";

interface AttendanceTabProps {
  attendanceData: any[];
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({ attendanceData: initialData }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [programs, setPrograms] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState<boolean>(false);
  
  useEffect(() => {
    fetchPrograms();
    loadAttendanceData();
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
      toast.error("Erro ao carregar programas");
    }
  };
  
  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const data = await fetchAttendance(selectedDate);
      setAttendanceData(data);
    } catch (error) {
      console.error("Erro ao carregar dados de presença:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setLoading(true);
      fetchAttendance(date).then(data => {
        setAttendanceData(data);
        setLoading(false);
      });
    }
  };
  
  const handleProgramChange = (value: string) => {
    setSelectedProgram(value);
    setLoading(true);
    
    // Filtrar os dados localmente se já tivermos os dados
    if (selectedProgram === "all") {
      fetchAttendance(selectedDate).then(data => {
        setAttendanceData(data);
        setLoading(false);
      });
    } else {
      fetchAttendance(selectedDate).then(data => {
        const filtered = data.filter(item => 
          item.programName === programs.find(p => p.id === value)?.name
        );
        setAttendanceData(filtered);
        setLoading(false);
      });
    }
  };
  
  const handleViewDetails = async (classItem: any) => {
    setSelectedClass(classItem);
    setIsDialogOpen(true);
    setAttendeesLoading(true);
    
    try {
      const attendeesData = await fetchClassAttendees(classItem.id);
      setAttendees(attendeesData);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setAttendeesLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
                  attendanceData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{item.class}</TableCell>
                      <TableCell>{item.coach}</TableCell>
                      <TableCell>{item.present}</TableCell>
                      <TableCell>{item.absent}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${item.rate > 70 ? 'bg-green-500' : item.rate > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${item.rate}%` }}
                            />
                          </div>
                          <span>{item.rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewDetails(item)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalhes da Aula</DialogTitle>
            <DialogDescription>
              {selectedClass && (
                <div className="text-foreground font-medium py-2">
                  {format(new Date(selectedClass.date), 'dd/MM/yyyy')} • {selectedClass.startTime?.substring(0, 5)}-{selectedClass.endTime?.substring(0, 5)} • {selectedClass.programName}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {attendeesLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium">Professor:</span>
                </div>
                <span>{selectedClass?.coach}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Alunos</h3>
                <div className="bg-blue-50 px-2 py-1 rounded">
                  {selectedClass?.present}/{selectedClass?.total} presentes
                </div>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {attendees.length > 0 ? (
                  attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={attendee.avatarUrl} />
                          <AvatarFallback>{getInitials(attendee.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{attendee.name}</span>
                      </div>
                      <div className={`h-3 w-3 rounded-full ${attendee.status === 'confirmed' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Nenhum aluno confirmou presença ainda.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceTab;
