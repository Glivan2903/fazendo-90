
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Users, 
  BarChart, 
  LayoutDashboard,
  Clock,
  UserCheck
} from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
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
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="text-sm text-gray-500">Versão 1.0</div>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Painel de Controle</h1>
          
          {activeTab === "overview" && (
            <OverviewTab />
          )}
          
          {activeTab === "schedule" && (
            <ScheduleTab />
          )}
          
          {activeTab === "users" && (
            <UsersTab />
          )}
          
          {activeTab === "attendance" && (
            <AttendanceTab />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

const OverviewTab = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">128</div>
          <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Aulas Esta Semana</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">3 aulas por dia em média</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Presença</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">87%</div>
          <p className="text-xs text-muted-foreground">+3% em relação ao mês anterior</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Próxima Aula</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">15:00</div>
          <p className="text-xs text-muted-foreground">CrossFit - 12 alunos</p>
        </CardContent>
      </Card>
      
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Aulas de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
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
              <TableRow>
                <TableCell>06:00 - 07:00</TableCell>
                <TableCell>CrossFit</TableCell>
                <TableCell>João Silva</TableCell>
                <TableCell>12/20</TableCell>
                <TableCell><span className="px-2 py-1 rounded-full bg-green-100 text-green-800">Concluída</span></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>07:00 - 08:00</TableCell>
                <TableCell>CrossFit</TableCell>
                <TableCell>João Silva</TableCell>
                <TableCell>18/20</TableCell>
                <TableCell><span className="px-2 py-1 rounded-full bg-green-100 text-green-800">Concluída</span></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>08:00 - 09:00</TableCell>
                <TableCell>Musculation</TableCell>
                <TableCell>Maria Santos</TableCell>
                <TableCell>8/15</TableCell>
                <TableCell><span className="px-2 py-1 rounded-full bg-green-100 text-green-800">Concluída</span></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>15:00 - 16:00</TableCell>
                <TableCell>CrossFit</TableCell>
                <TableCell>Carlos Oliveira</TableCell>
                <TableCell>12/20</TableCell>
                <TableCell><span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Em breve</span></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>17:00 - 18:00</TableCell>
                <TableCell>CrossFit</TableCell>
                <TableCell>João Silva</TableCell>
                <TableCell>15/20</TableCell>
                <TableCell><span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">Agendada</span></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>18:00 - 19:00</TableCell>
                <TableCell>CrossFit</TableCell>
                <TableCell>Maria Santos</TableCell>
                <TableCell>20/20</TableCell>
                <TableCell><span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">Agendada</span></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const ScheduleTab = () => {
  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const hours = ["06:00", "07:00", "08:00", "09:00", "17:00", "18:00", "19:00"];
  
  // Dados simulados das aulas
  const classes = [
    { day: 0, hour: "06:00", program: "CrossFit", coach: "João Silva", capacity: "15/20" },
    { day: 0, hour: "07:00", program: "CrossFit", coach: "Maria Santos", capacity: "12/20" },
    { day: 0, hour: "18:00", program: "CrossFit", coach: "Carlos Oliveira", capacity: "18/20" },
    { day: 1, hour: "06:00", program: "CrossFit", coach: "João Silva", capacity: "14/20" },
    { day: 1, hour: "19:00", program: "Musculation", coach: "Ana Costa", capacity: "10/15" },
    { day: 2, hour: "07:00", program: "CrossFit", coach: "João Silva", capacity: "20/20" },
    { day: 2, hour: "08:00", program: "CrossFit", coach: "Maria Santos", capacity: "18/20" },
    { day: 2, hour: "18:00", program: "CrossFit", coach: "Carlos Oliveira", capacity: "17/20" },
    { day: 3, hour: "06:00", program: "CrossFit", coach: "Maria Santos", capacity: "16/20" },
    { day: 3, hour: "17:00", program: "Musculation", coach: "Ana Costa", capacity: "12/15" },
    { day: 4, hour: "06:00", program: "CrossFit", coach: "João Silva", capacity: "18/20" },
    { day: 4, hour: "07:00", program: "CrossFit", coach: "Carlos Oliveira", capacity: "15/20" },
    { day: 4, hour: "18:00", program: "CrossFit", coach: "Maria Santos", capacity: "20/20" },
    { day: 5, hour: "09:00", program: "CrossFit", coach: "João Silva", capacity: "10/20" },
  ];
  
  const getClassData = (day: number, hour: string) => {
    return classes.find(c => c.day === day && c.hour === hour);
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
                      const classData = getClassData(dayIndex, hour);
                      return (
                        <TableCell key={dayIndex}>
                          {classData ? (
                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                              <div className="font-medium text-blue-800">{classData.program}</div>
                              <div className="text-sm">{classData.coach}</div>
                              <div className="text-xs text-gray-500">{classData.capacity}</div>
                            </div>
                          ) : null}
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

const UsersTab = () => {
  const users = [
    { id: 1, name: "Ana Silva", email: "ana.silva@email.com", role: "Aluno", plan: "Mensal", status: "Ativo" },
    { id: 2, name: "Bruno Costa", email: "bruno.costa@email.com", role: "Aluno", plan: "Trimestral", status: "Ativo" },
    { id: 3, name: "Carla Oliveira", email: "carla.oliveira@email.com", role: "Aluno", plan: "Anual", status: "Ativo" },
    { id: 4, name: "Daniel Santos", email: "daniel.santos@email.com", role: "Aluno", plan: "Mensal", status: "Inativo" },
    { id: 5, name: "Eduardo Lima", email: "eduardo.lima@email.com", role: "Aluno", plan: "Mensal", status: "Ativo" },
    { id: 6, name: "Fernanda Alves", email: "fernanda.alves@email.com", role: "Aluno", plan: "Trimestral", status: "Ativo" },
    { id: 7, name: "Gabriel Mendes", email: "gabriel.mendes@email.com", role: "Aluno", plan: "Mensal", status: "Ativo" },
    { id: 8, name: "Helena Martins", email: "helena.martins@email.com", role: "Aluno", plan: "Anual", status: "Ativo" },
    { id: 9, name: "João Silva", email: "joao.silva@email.com", role: "Professor", plan: "N/A", status: "Ativo" },
    { id: 10, name: "Maria Santos", email: "maria.santos@email.com", role: "Professor", plan: "N/A", status: "Ativo" },
  ];

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
                  <TableCell>{user.plan}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full ${
                      user.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button className="p-1 text-blue-600 hover:text-blue-800">Editar</button>
                      <button className="p-1 text-red-600 hover:text-red-800">Excluir</button>
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

const AttendanceTab = () => {
  const attendanceData = [
    { date: "2023-04-10", class: "06:00 - CrossFit", coach: "João Silva", present: 15, absent: 3, total: 18 },
    { date: "2023-04-10", class: "07:00 - CrossFit", coach: "Maria Santos", present: 12, absent: 2, total: 14 },
    { date: "2023-04-10", class: "18:00 - CrossFit", coach: "Carlos Oliveira", present: 18, absent: 0, total: 18 },
    { date: "2023-04-11", class: "06:00 - CrossFit", coach: "João Silva", present: 14, absent: 1, total: 15 },
    { date: "2023-04-11", class: "19:00 - Musculation", coach: "Ana Costa", present: 10, absent: 3, total: 13 },
  ];

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
          <input type="date" className="p-2 border rounded" defaultValue="2023-04-11" />
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
                  <TableCell>{item.date}</TableCell>
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
