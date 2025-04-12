import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Users, 
  BarChart, 
  LayoutDashboard,
  Clock,
  UserCheck,
  Loader2,
  CalendarDays,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { fetchClasses } from "../api/classApi";
import { format, addDays, parseISO } from "date-fns";
import { Class, User } from "../types";
import EditUserDialog from "@/components/EditUserDialog";
import { fetchUsers, updateUser } from "@/api/userApi";
import { fetchAttendance } from "@/api/attendanceApi";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [todayClasses, setTodayClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [scheduleClasses, setScheduleClasses] = useState<Class[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userEditLoading, setUserEditLoading] = useState(false);
  const navigate = useNavigate();
  const { signOut, userRole } = useAuth();
  
  useEffect(() => {
    if (userRole !== "admin" && userRole !== "coach") {
      toast.error("Você não tem permissão para acessar essa página");
      navigate("/check-in");
    }
  }, [userRole, navigate]);
  
  useEffect(() => {
    const fetchTodayClasses = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const classes = await fetchClasses(today);
        setTodayClasses(classes);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("Erro ao carregar aulas de hoje");
      } finally {
        setLoading(false);
      }
    };

    fetchTodayClasses();
  }, []);
  
  useEffect(() => {
    if (activeTab === "schedule") {
      const fetchWeeklySchedule = async () => {
        setLoading(true);
        try {
          const today = new Date();
          let allClasses: Class[] = [];
          
          for (let i = 0; i < 7; i++) {
            const date = addDays(today, i);
            const classes = await fetchClasses(date);
            allClasses = [...allClasses, ...classes];
          }
          
          setScheduleClasses(allClasses);
        } catch (error) {
          console.error("Error fetching weekly schedule:", error);
          toast.error("Erro ao carregar grade horária");
        } finally {
          setLoading(false);
        }
      };
      
      fetchWeeklySchedule();
    }
  }, [activeTab]);
  
  useEffect(() => {
    if (activeTab === "users") {
      const loadUsers = async () => {
        setLoading(true);
        try {
          const userData = await fetchUsers();
          setUsers(userData);
        } catch (error) {
          console.error("Error fetching users:", error);
          toast.error("Erro ao carregar usuários");
        } finally {
          setLoading(false);
        }
      };
      
      loadUsers();
    }
  }, [activeTab]);
  
  useEffect(() => {
    if (activeTab === "attendance") {
      const loadAttendance = async () => {
        setLoading(true);
        try {
          const attendanceData = await fetchAttendance();
          setAttendance(attendanceData);
        } catch (error) {
          console.error("Error fetching attendance:", error);
          toast.error("Erro ao carregar dados de presença");
        } finally {
          setLoading(false);
        }
      };
      
      loadAttendance();
    }
  }, [activeTab]);
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };
  
  const handleSaveUser = async (userData: User) => {
    if (!selectedUser) return;
    
    setUserEditLoading(true);
    try {
      await updateUser(userData);
      setUsers(users.map(u => u.id === userData.id ? userData : u));
      toast.success("Usuário atualizado com sucesso!");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erro ao atualizar usuário");
    } finally {
      setUserEditLoading(false);
    }
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <h2 className="text-xl font-bold">CrossBox Fênix</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("overview")} isActive={activeTab === "overview"}>
                  <LayoutDashboard size={20} />
                  <span>Visão Geral</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("schedule")} isActive={activeTab === "schedule"}>
                  <Calendar size={20} />
                  <span>Grade Horária</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("users")} isActive={activeTab === "users"}>
                  <Users size={20} />
                  <span>Usuários</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("attendance")} isActive={activeTab === "attendance"}>
                  <UserCheck size={20} />
                  <span>Presença</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/schedule-editor")}>
                  <CalendarDays size={20} />
                  <span>Editor de Grade</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/check-in")}>
                  <Clock size={20} />
                  <span>Check-in</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Painel de Controle</h1>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/check-in")}
                >
                  Check-in
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/schedule-editor")}
                >
                  Editor de Grade
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-red-500"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {loading && activeTab !== "overview" && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}
          
          {activeTab === "overview" && (
            <OverviewTab classes={todayClasses} loading={loading} />
          )}
          
          {activeTab === "schedule" && !loading && (
            <ScheduleTab classes={scheduleClasses} />
          )}
          
          {activeTab === "users" && !loading && (
            <UsersTab users={users} onEditUser={handleEditUser} />
          )}
          
          {activeTab === "attendance" && !loading && (
            <AttendanceTab attendanceData={attendance} />
          )}
        </main>
      </div>
      
      <EditUserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
        isLoading={userEditLoading}
      />
    </SidebarProvider>
  );
};

const OverviewTab = ({ classes, loading }: { classes: Class[], loading: boolean }) => {
  const totalStudents = 128;
  const classesCount = classes.length;
  const completedClasses = classes.filter(c => 
    new Date(c.startTime) < new Date()
  ).length;
  
  const attendanceRate = classes.length > 0 
    ? Math.round((classes.reduce((sum, c) => sum + c.attendeeCount, 0) / 
        (classes.reduce((sum, c) => sum + c.maxCapacity, 0)) * 100))
    : 0;
    
  const nextClass = classes.find(c => new Date(c.startTime) > new Date());
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
          <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Aulas Esta Semana</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{classesCount}</div>
          <p className="text-xs text-muted-foreground">{Math.round(classesCount/7)} aulas por dia em média</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Presença</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{attendanceRate}%</div>
          <p className="text-xs text-muted-foreground">Baseado nas aulas de hoje</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Próxima Aula</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {nextClass ? (
            <>
              <div className="text-2xl font-bold">
                {format(new Date(nextClass.startTime), "HH:mm")}
              </div>
              <p className="text-xs text-muted-foreground">
                {nextClass.programName} - {nextClass.attendeeCount} alunos
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">--:--</div>
              <p className="text-xs text-muted-foreground">
                Nenhuma aula programada
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Aulas de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : classes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horário</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Alunos</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => {
                  const startTime = new Date(cls.startTime);
                  const endTime = new Date(cls.endTime);
                  const now = new Date();
                  let status = "Agendada";
                  let statusClass = "bg-gray-100 text-gray-800";
                  
                  if (now > endTime) {
                    status = "Concluída";
                    statusClass = "bg-green-100 text-green-800";
                  } else if (now >= startTime) {
                    status = "Em progresso";
                    statusClass = "bg-yellow-100 text-yellow-800";
                  } else if (startTime.getTime() - now.getTime() < 3600000) {
                    status = "Em breve";
                    statusClass = "bg-yellow-100 text-yellow-800";
                  }
                  
                  return (
                    <TableRow key={cls.id}>
                      <TableCell>
                        {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
                      </TableCell>
                      <TableCell>{cls.programName}</TableCell>
                      <TableCell>{cls.coachName}</TableCell>
                      <TableCell>{cls.attendeeCount}/{cls.maxCapacity}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full ${statusClass}`}>
                          {status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhuma aula agendada para hoje
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ScheduleTab = ({ classes }: { classes: Class[] }) => {
  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  const hours = ["06:00", "07:00", "08:00", "09:00", "17:00", "18:00", "19:00"];
  
  const getClassDataForDayAndHour = (day: number, hour: string) => {
    return classes.filter(cls => {
      const classDate = new Date(cls.startTime);
      const classHour = format(classDate, "HH:mm");
      const dayOfWeek = (classDate.getDay() + 6) % 7;
      return dayOfWeek === day && classHour === hour;
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grade Horária Semanal</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Horário</TableHead>
                  {days.map((day, index) => (
                    <TableHead key={index}>{day}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {hours.map((hour) => (
                  <TableRow key={hour}>
                    <TableCell className="font-medium">{hour}</TableCell>
                    {days.map((_, dayIndex) => {
                      const classesForCell = getClassDataForDayAndHour(dayIndex, hour);
                      return (
                        <TableCell key={dayIndex}>
                          {classesForCell.length > 0 && (
                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                              {classesForCell.map((cls, idx) => (
                                <div key={idx} className="mb-2 last:mb-0">
                                  <div className="font-medium text-blue-800">{cls.programName}</div>
                                  <div className="text-sm">{cls.coachName}</div>
                                  <div className="text-xs text-gray-500">{cls.attendeeCount}/{cls.maxCapacity}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const UsersTab = ({ users, onEditUser }: { users: User[], onEditUser: (user: User) => void }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-bold">Usuários</h2>
          <p className="text-gray-500">Gerenciar alunos e professores</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Novo Usuário
        </button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.plan || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full ${
                      user.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-blue-600 hover:text-blue-800"
                        onClick={() => onEditUser(user)}
                      >
                        Editar
                      </button>
                      <button className="p-1 text-red-600 hover:text-red-800">
                        Excluir
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const AttendanceTab = ({ attendanceData }: { attendanceData: any[] }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Controle de Presença</h2>
          <p className="text-gray-500">Registros de presença dos alunos</p>
        </div>
        <div className="flex gap-2">
          <select className="p-2 border rounded">
            <option>Todas as aulas</option>
            <option>CrossFit</option>
            <option>Musculation</option>
          </select>
          <input type="date" className="p-2 border rounded" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
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
              {attendanceData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{item.class}</TableCell>
                  <TableCell>{item.coach}</TableCell>
                  <TableCell>{item.present}</TableCell>
                  <TableCell>{item.absent}</TableCell>
                  <TableCell>{Math.round((item.present / item.total) * 100)}%</TableCell>
                  <TableCell>
                    <button className="p-1 text-blue-600 hover:text-blue-800">Detalhes</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
