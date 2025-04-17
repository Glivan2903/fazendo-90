
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Settings, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { DialogClose } from "@radix-ui/react-dialog";

interface Program {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

const ProgramsTab = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#1971c2",
    description: "",
    isOnline: false,
    enableReservations: false,
    enableCancellation: false,
    openCheckInMinutes: 10,
    closeCheckInMinutes: 10,
    cancellationMinutes: 10,
    autoCancellation: false
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      
      setPrograms(data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Erro ao carregar programas");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProgram = (program: Program) => {
    setSelectedProgram(program);
    setFormData({
      name: program.name,
      color: program.color || "#1971c2",
      description: program.description || "",
      isOnline: false,
      enableReservations: false,
      enableCancellation: false,
      openCheckInMinutes: 10,
      closeCheckInMinutes: 10,
      cancellationMinutes: 10,
      autoCancellation: false
    });
    setIsEditDialogOpen(true);
  };

  const handleNewProgram = () => {
    setSelectedProgram(null);
    setFormData({
      name: "",
      color: "#1971c2",
      description: "",
      isOnline: false,
      enableReservations: false,
      enableCancellation: false,
      openCheckInMinutes: 10,
      closeCheckInMinutes: 10,
      cancellationMinutes: 10,
      autoCancellation: false
    });
    setIsNewDialogOpen(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProgram = async () => {
    if (!formData.name.trim()) {
      toast.error("O nome do programa é obrigatório");
      return;
    }
    
    try {
      setSaveLoading(true);
      
      const programData = {
        name: formData.name.trim(),
        color: formData.color,
        description: formData.description.trim() || null
      };
      
      if (selectedProgram) {
        // Update existing program
        const { error } = await supabase
          .from("programs")
          .update(programData)
          .eq("id", selectedProgram.id);
          
        if (error) throw error;
        
        toast.success("Programa atualizado com sucesso");
      } else {
        // Create new program
        const { error } = await supabase
          .from("programs")
          .insert([programData]);
          
        if (error) throw error;
        
        toast.success("Programa criado com sucesso");
      }
      
      // Refresh programs list
      await fetchPrograms();
      
      // Close dialogs
      setIsEditDialogOpen(false);
      setIsNewDialogOpen(false);
      
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error("Erro ao salvar programa");
    } finally {
      setSaveLoading(false);
    }
  };

  const renderProgramDialog = (isNew: boolean) => {
    return (
      <Dialog 
        open={isNew ? isNewDialogOpen : isEditDialogOpen} 
        onOpenChange={isNew ? setIsNewDialogOpen : setIsEditDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isNew ? "Novo Programa" : "Editar Programa"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium flex items-center mb-2">
                <Settings className="w-4 h-4 mr-1" />
                Configurações básicas
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Faça a configuração básica do programa
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-right">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="col-span-3"
                  />
                  {!formData.name && (
                    <p className="text-xs text-red-500">O campo nome é obrigatório</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-right">
                    Cor <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="color"
                      value={formData.color}
                      onChange={(e) => handleFormChange("color", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.color}
                      onChange={(e) => handleFormChange("color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="online"
                    checked={formData.isOnline}
                    onCheckedChange={(checked) => handleFormChange("isOnline", checked)}
                  />
                  <Label htmlFor="online">Aula online</Label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M5 22h14"></path>
                  <path d="M5 2h14"></path>
                  <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                  <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
                </svg>
                Reservas & Check-in
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Configure se a classe terá reserva e suas configurações.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableReservations"
                    checked={formData.enableReservations}
                    onCheckedChange={(checked) => handleFormChange("enableReservations", checked)}
                  />
                  <Label htmlFor="enableReservations">Habilitar reserva</Label>
                </div>
                
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Label htmlFor="openCheckIn">Abrir check-in</Label>
                  <Input
                    id="openCheckIn"
                    type="number"
                    min="1"
                    value={formData.openCheckInMinutes}
                    onChange={(e) => handleFormChange("openCheckInMinutes", parseInt(e.target.value))}
                  />
                  <span className="text-sm text-gray-500">minutos antes da aula</span>
                  
                  <Label htmlFor="closeCheckIn">Fechar check-in</Label>
                  <Input
                    id="closeCheckIn"
                    type="number"
                    min="1"
                    value={formData.closeCheckInMinutes}
                    onChange={(e) => handleFormChange("closeCheckInMinutes", parseInt(e.target.value))}
                  />
                  <span className="text-sm text-gray-500">minutos depois da aula</span>
                  
                  <Label htmlFor="cancellation">Cancelamento</Label>
                  <Input
                    id="cancellation"
                    type="number"
                    min="1"
                    value={formData.cancellationMinutes}
                    onChange={(e) => handleFormChange("cancellationMinutes", parseInt(e.target.value))}
                  />
                  <span className="text-sm text-gray-500">minutos antes da aula</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                  <line x1="16" x2="16" y1="2" y2="6"></line>
                  <line x1="8" x2="8" y1="2" y2="6"></line>
                  <line x1="3" x2="21" y1="10" y2="10"></line>
                </svg>
                Cancelamento automático
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Programe para que a classe seja cancelada caso não tenha nenhuma reserva/check-in.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoCancellation"
                    checked={formData.autoCancellation}
                    onCheckedChange={(checked) => handleFormChange("autoCancellation", checked)}
                  />
                  <Label htmlFor="autoCancellation">Habilitar</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <div>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  CANCELAR
                </Button>
              </DialogClose>
            </div>
            
            <Button 
              onClick={handleSaveProgram}
              disabled={saveLoading || !formData.name.trim()}
            >
              {saveLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  SALVAR
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle>Programas</CardTitle>
          <Button 
            variant="default" 
            onClick={handleNewProgram}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Programa
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.length > 0 ? (
                  programs.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: program.color || '#1971c2' }}
                        />
                        {program.name}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditProgram(program)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8">
                      Nenhum programa cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Create/Edit Program Dialog */}
      {renderProgramDialog(true)}
      {renderProgramDialog(false)}
    </div>
  );
};

export default ProgramsTab;
