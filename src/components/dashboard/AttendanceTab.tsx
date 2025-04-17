
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
import { CalendarIcon, Eye, CheckCircle, XCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

interface AttendanceTabProps {
  attendanceData: any[];
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({ attendanceData: initialData }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [programs, setPrograms] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState<boolean>(false);
  
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
          startTime: cls.start_time,
          endTime: cls.end_time,
          class: `${cls.start_time.substring(0, 5)} - ${cls.programs?.name || 'CrossFit'}`,
          coach: cls.profiles?.name || 'Não atribuído',
          present,
          absent,
          total,
          rate,
          programName: cls.programs?.name || 'CrossFit'
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
  
  const handleViewDetails = async (classItem: any) => {
    setSelectedClass(classItem);
    setIsDialogOpen(true);
    await fetchClassAttendees(classItem.id);
  };

  const fetchClassAttendees = async (classId: string) => {
    setAttendeesLoading(true);
    try {
      const { data, error } = await supabase
        .from('checkins')
        .select(`
          id,
          status,
          profiles!user_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('class_id', classId);

      if (error) throw error;
      
      // Transform data for display
      const transformedData = (data || []).map(checkin => ({
        id: checkin.profiles.id,
        name: checkin.profiles.name,
        avatarUrl: checkin.profiles.avatar_url,
        status: checkin.status
      }));
      
      setAttendees(transformedData);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      toast.error("Erro ao buscar alunos");
      setAttendees([]);
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
                  {format(new Date(selectedClass.date), 'dd/MM/yyyy')} • {selectedClass.startTime.substring(0, 5)}-{selectedClass.endTime.substring(0, 5)} • {selectedClass.programName}
                </div>
              )}
            </DialogHeader>

          {attendeesLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
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
                      <CheckCircle className="h-5 w-5 text-green-500" />
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
