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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";

interface Program {
  id: string;
  name: string;
  color?: string;
  description?: string;
  amount: number;
  periodicity: string;
  days_validity: number;
  enrollment_fee: number;
  active?: boolean;
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
    amount: 0,
    periodicity: "Mensal",
    days_validity: 30,
    enrollment_fee: 0,
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
        .from("plans")
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
      amount: program.amount,
      periodicity: program.periodicity,
      days_validity: program.days_validity,
      enrollment_fee: program.enrollment_fee,
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
      amount: 0,
      periodicity: "Mensal",
      days_validity: 30,
      enrollment_fee: 0,
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
      [field]: field === "amount" || field === "enrollment_fee" || field === "days_validity" 
        ? parseFloat(value) 
        : value
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
        description: formData.description.trim() || null,
        amount: formData.amount,
        periodicity: formData.periodicity,
        days_validity: formData.days_validity,
        enrollment_fee: formData.enrollment_fee
      };
      
      if (selectedProgram) {
        const { error } = await supabase
          .from("plans")
          .update(programData)
          .eq("id", selectedProgram.id);
          
        if (error) throw error;
        
        toast.success("Plano atualizado com sucesso");
      } else {
        const { error } = await supabase
          .from("plans")
          .insert([programData]);
          
        if (error) throw error;
        
        toast.success("Plano criado com sucesso");
      }
      
      await fetchPrograms();
      setIsEditDialogOpen(false);
      setIsNewDialogOpen(false);
      
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Erro ao salvar plano");
    } finally {
      setSaveLoading(false);
    }
  };

  const renderProgramDialog = (isNew: boolean) => (
    <Dialog 
      open={isNew ? isNewDialogOpen : isEditDialogOpen} 
      onOpenChange={isNew ? setIsNewDialogOpen : setIsEditDialogOpen}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Novo Plano" : "Editar Plano"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium flex items-center mb-2">
              <Settings className="w-4 h-4 mr-1" />
              Configurações básicas
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Configure as informações básicas do plano
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor Mensal (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleFormChange("amount", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollment_fee">Taxa de Matrícula (R$)</Label>
                <Input
                  id="enrollment_fee"
                  type="number"
                  step="0.01"
                  value={formData.enrollment_fee}
                  onChange={(e) => handleFormChange("enrollment_fee", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="days_validity">Dias de Validade</Label>
                <Input
                  id="days_validity"
                  type="number"
                  min="1"
                  value={formData.days_validity}
                  onChange={(e) => handleFormChange("days_validity", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodicity">Periodicidade</Label>
                <Select
                  value={formData.periodicity}
                  onValueChange={(value) => handleFormChange("periodicity", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a periodicidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Trimestral">Trimestral</SelectItem>
                    <SelectItem value="Semestral">Semestral</SelectItem>
                    <SelectItem value="Anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={isNew ? () => setIsNewDialogOpen(false) : () => setIsEditDialogOpen(false)}>
            Cancelar
          </Button>
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
                Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle>Planos</CardTitle>
          <Button 
            variant="default" 
            onClick={handleNewProgram}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
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
                  <TableHead>Valor</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs?.length > 0 ? (
                  programs.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>R$ {plan.amount?.toFixed(2)}</TableCell>
                      <TableCell>{plan.days_validity} dias</TableCell>
                      <TableCell>
                        <Badge 
                          variant={plan.active ? "secondary" : "outline"}
                          className={plan.active ? "bg-green-100 text-green-800" : ""}
                        >
                          {plan.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditProgram(plan)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Nenhum plano cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {renderProgramDialog(true)}
      {renderProgramDialog(false)}
    </div>
  );
};

export default ProgramsTab;
