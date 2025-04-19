
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, PlusCircle } from 'lucide-react';
import { NewExpenseDialogProps } from '../../types';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { SupplierManagementDialog } from '../SupplierManagementDialog';

export const NewExpenseDialog = ({
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
  fetchSuppliers
}: NewExpenseDialogProps) => {
  const [showSupplierDialog, setShowSupplierDialog] = React.useState(false);

  return (
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
            <div className="flex justify-between items-center">
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => setShowSupplierDialog(true)}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Novo Fornecedor
              </Button>
            </div>
            <Select value={formValues.fornecedor} onValueChange={(value) => handleSelectChange('fornecedor', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_supplier">Selecione um fornecedor</SelectItem>
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
            <Select value={formValues.category} onValueChange={(value) => handleSelectChange('category', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aluguel">Aluguel</SelectItem>
                <SelectItem value="Despesa Operacional">Despesa Operacional</SelectItem>
                <SelectItem value="Materiais">Materiais</SelectItem>
                <SelectItem value="Serviços">Serviços</SelectItem>
                <SelectItem value="Impostos">Impostos</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
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
                <SelectItem value="pending">Pendente</SelectItem>
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

      <SupplierManagementDialog
        isOpen={showSupplierDialog}
        onClose={() => setShowSupplierDialog(false)}
        onSupplierAdded={() => {
          fetchSuppliers();
          setShowSupplierDialog(false);
        }}
      />
    </Dialog>
  );
};
