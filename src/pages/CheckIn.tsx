
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LogOut, User, Home, Calendar, BarChart2, UserCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CalendarSelector from "../components/CalendarSelector";
import ClassItem from "../components/ClassItem";
import LoadingSpinner from "../components/LoadingSpinner";
import { Class } from "../types";
import { fetchClasses } from "../api/classApi";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CheckIn = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("aulas");
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();

  useEffect(() => {
    const getClasses = async () => {
      setLoading(true);
      try {
        const fetchedClasses = await fetchClasses(selectedDate);
        setClasses(fetchedClasses);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    getClasses();
  }, [selectedDate]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleClassClick = (classId: string) => {
    navigate(`/class/${classId}`);
  };

  const dayLabel = format(selectedDate, "d 'de' MMMM", { locale: ptBR });
  
  const renderProfile = () => {
    const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : "U";
    const name = user?.email ? user.email.split("@")[0] : "Usuário";
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src="https://api.dicebear.com/6.x/avataaars/svg" />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-gray-500">Membro desde Janeiro 2023</p>
          
          <div className="w-full mt-4 space-y-3">
            <div className="flex items-center text-gray-700">
              <span className="flex-1">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="flex-1">Telefone</span>
              <span>(11) 98765-4321</span>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="flex-1">Data de Nascimento</span>
              <span>15/05/1990</span>
            </div>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-blue-600 text-2xl font-bold">12</div>
              <div className="text-gray-600 text-sm">Check-ins este mês</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-blue-600 text-2xl font-bold">75%</div>
              <div className="text-gray-600 text-sm">Taxa de Frequência</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-blue-600 text-2xl font-bold">3</div>
              <div className="text-gray-600 text-sm">Treinos por semana</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-blue-600 text-2xl font-bold">45</div>
              <div className="text-gray-600 text-sm">Total de check-ins</div>
            </div>
          </CardContent>
        </Card>
        
        <Button variant="destructive" className="w-full" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    );
  };

  const renderDashboard = () => {
    const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : "U";
    
    return (
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo à Cross Box Fênix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Próxima aula</h3>
                <Button variant="link" size="sm" className="text-blue-600 p-0" onClick={() => setActiveTab("aulas")}>
                  Ver todas
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="mt-2 flex items-center border-l-4 border-blue-600 pl-3">
                <div className="flex-1">
                  <h4 className="font-bold">CrossFit</h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    18:00 - 19:00
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    Bruna Rojo
                  </div>
                </div>
                <Button>Check-in</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setActiveTab("aulas")}>
                <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-bold">Aulas</h3>
                <p className="text-sm text-gray-500">Veja e faça check-in</p>
              </div>
              <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setActiveTab("treinos")}>
                <BarChart2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-bold">Treinos</h3>
                <p className="text-sm text-gray-500">Acompanhe seu progresso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Performance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho Recente</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8 text-gray-500">
            <p>Você ainda não tem dados de desempenho.</p>
            <p>Comece a fazer check-in nas aulas!</p>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderTrainings = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Treinos</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8 text-gray-500">
            <p>Você ainda não tem treinos registrados.</p>
            <p>Comece a fazer check-in nas aulas!</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderClasses = () => {
    return (
      <>
        <h1 className="text-2xl font-bold text-center">Check-in</h1>
        <p className="text-center text-gray-600 mt-1 mb-4">{dayLabel}</p>
        
        <CalendarSelector
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />

        <div className="space-y-4">
          {loading ? (
            <LoadingSpinner />
          ) : classes.length > 0 ? (
            classes.map((cls) => (
              <ClassItem
                key={cls.id}
                classData={cls}
                onClick={() => handleClassClick(cls.id)}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Não há aulas disponíveis neste dia.</p>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-20">
      <header className="py-6 flex justify-between items-center">
        <div className="flex-1"></div>
        <div className="text-center flex-1">
          <h1 className="text-xl font-bold">Cross Box Fênix</h1>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setActiveTab("aulas")}
            >
              Check-in
            </DropdownMenuItem>
            
            {(userRole === "admin" || userRole === "coach") && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate("/teacher-dashboard")}
              >
                Dashboard
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem
              className="cursor-pointer text-red-500"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Tab content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="inicio">
          {renderDashboard()}
        </TabsContent>
        <TabsContent value="aulas">
          {renderClasses()}
        </TabsContent>
        <TabsContent value="treinos">
          {renderTrainings()}
        </TabsContent>
        <TabsContent value="perfil">
          {renderProfile()}
        </TabsContent>
      </Tabs>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-10">
        <Button 
          variant="ghost" 
          className="flex flex-col items-center text-xs" 
          onClick={() => setActiveTab("inicio")}
        >
          <Home className={`h-5 w-5 ${activeTab === "inicio" ? "text-blue-600" : "text-gray-500"}`} />
          <span className={activeTab === "inicio" ? "text-blue-600" : "text-gray-500"}>Início</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center text-xs" 
          onClick={() => setActiveTab("aulas")}
        >
          <Calendar className={`h-5 w-5 ${activeTab === "aulas" ? "text-blue-600" : "text-gray-500"}`} />
          <span className={activeTab === "aulas" ? "text-blue-600" : "text-gray-500"}>Aulas</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center text-xs" 
          onClick={() => setActiveTab("treinos")}
        >
          <BarChart2 className={`h-5 w-5 ${activeTab === "treinos" ? "text-blue-600" : "text-gray-500"}`} />
          <span className={activeTab === "treinos" ? "text-blue-600" : "text-gray-500"}>Treinos</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center text-xs" 
          onClick={() => setActiveTab("perfil")}
        >
          <UserCircle className={`h-5 w-5 ${activeTab === "perfil" ? "text-blue-600" : "text-gray-500"}`} />
          <span className={activeTab === "perfil" ? "text-blue-600" : "text-gray-500"}>Perfil</span>
        </Button>
      </div>
    </div>
  );
};

export default CheckIn;
