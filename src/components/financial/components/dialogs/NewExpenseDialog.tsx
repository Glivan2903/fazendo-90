
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { NewSupplierDialog } from "./NewSupplierDialog";

interface NewExpenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formValues: {
    date: Date;
    fornecedor: string;
    description: string;
    category: string;
    amount: string;
    status: string;
    payment_method: string;
    bank_account: string;
  };
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (date: Date | undefined) => void;
  suppliers: any[];
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  fetchSuppliers: () => void;
  categories?: string[];
}

export const NewExpenseDialog: React.FC<NewExpenseDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formValues,
  handleFormChange,
  handleSelectChange,
  handleDateChange,
  suppliers,
  calendarOpen,
  setCalendarOpen,
  fetchSuppliers,
  categories = []
}) => {
  const [showNewSupplierDialog, setShowNewSupplierDialog] = React.useState(false);

  const handleSupplierAdded = () => {
    fetchSuppliers();
    setShowNewSupplierDialog(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formValues.date && "text-muted-foreground"
                    )}
                    id="date"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formValues.date ? (
                      format(formValues.date, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formValues.date}
                    onSelect={handleDateChange}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => setShowNewSupplierDialog(true)}
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Novo
                </Button>
              </div>
              <Select value={formValues.fornecedor} onValueChange={(value) => handleSelectChange('fornecedor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Selecione um fornecedor</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                name="description"
                value={formValues.description}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={formValues.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sem categoria">Sem categoria</SelectItem>
                  <SelectItem value="Aluguel">Aluguel</SelectItem>
                  <SelectItem value="Salários">Salários</SelectItem>
                  <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Serviços">Serviços</SelectItem>
                  <SelectItem value="Impostos">Impostos</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  {categories.map((category, index) => {
                    // Only add categories that aren't already in the default list
                    if (!['Aluguel', 'Salários', 'Equipamentos', 'Manutenção', 'Serviços', 'Impostos', 'Marketing', 'Sem categoria'].includes(category)) {
                      return <SelectItem key={index} value={category}>{category}</SelectItem>;
                    }
                    return null;
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formValues.amount}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formValues.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pagamento</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_method">Forma de pagamento</Label>
              <Select value={formValues.payment_method} onValueChange={(value) => handleSelectChange('payment_method', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bank_account">Conta</Label>
              <Select value={formValues.bank_account} onValueChange={(value) => handleSelectChange('bank_account', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nubank">Nubank</SelectItem>
                  <SelectItem value="Bradesco">Bradesco</SelectItem>
                  <SelectItem value="Conta Principal">Conta Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <NewSupplierDialog 
        isOpen={showNewSupplierDialog}
        onClose={() => setShowNewSupplierDialog(false)}
        onSuccess={handleSupplierAdded}
      />
    </>
  );
};
