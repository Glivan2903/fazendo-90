
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Trash, X } from "lucide-react";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NewSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onSuccess?: () => void;
}

const NewSaleDialog: React.FC<NewSaleDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isLoading, setIsLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [installments, setInstallments] = useState(1);

  const form = useForm({
    defaultValues: {
      itemType: 'Adesão',
      planId: '',
      quantity: 1,
    }
  });

  React.useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from('plans')
        .select('*')
        .eq('active', true)
        .order('amount', { ascending: true });
      
      setPlans(data || []);
    };

    fetchPlans();
  }, []);

  const handlePlanSelect = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    setSelectedPlan(plan);
    
    // Calculate end date based on plan periodicity
    const start = new Date(startDate);
    const end = addMonths(start, plan.days_validity / 30);
    setStartDate(format(start, 'yyyy-MM-dd'));
  };

  const calculateInstallments = (total: number, installments: number) => {
    const installmentAmount = total / installments;
    const newPayments = [];
    
    for (let i = 0; i < installments; i++) {
      const dueDate = addMonths(new Date(startDate), i);
      newPayments.push({
        amount: installmentAmount,
        due_date: format(dueDate, 'yyyy-MM-dd'),
        payment_method: paymentMethod,
        status: 'PENDENTE'
      });
    }

    setPayments(newPayments);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!selectedPlan) {
        toast.error('Selecione um plano');
        return;
      }

      const { data: saleCode } = await supabase
        .rpc('generate_sale_code');

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: userId,
          sale_code: saleCode,
          seller_name: 'Sistema',
          total_amount: selectedPlan.amount,
          discount_amount: 0,
          total: selectedPlan.amount
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale item
      const { error: itemError } = await supabase
        .from('sales_items')
        .insert({
          sale_id: sale.id,
          item_type: 'Adesão',
          description: selectedPlan.name,
          unit_price: selectedPlan.amount,
          subtotal: selectedPlan.amount,
          total: selectedPlan.amount,
          plan_id: selectedPlan.id,
          period_start: startDate,
          period_end: format(addMonths(new Date(startDate), selectedPlan.days_validity / 30), 'yyyy-MM-dd')
        });

      if (itemError) throw itemError;

      // Create payments
      const { error: paymentsError } = await supabase
        .from('sales_payments')
        .insert(payments.map(payment => ({
          ...payment,
          sale_id: sale.id
        })));

      if (paymentsError) throw paymentsError;

      toast.success('Venda realizada com sucesso!');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Erro ao realizar venda');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nova Venda - {userName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 ? (
            // Step 1: Select items
            <div className="space-y-4">
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Item</Label>
                    <Select 
                      value={form.watch('itemType')} 
                      onValueChange={value => form.setValue('itemType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Adesão">Adesão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Plano</Label>
                    <Select onValueChange={handlePlanSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map(plan => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.amount)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Data de Início</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setStep(2)} disabled={!selectedPlan}>
                  Próximo
                </Button>
              </div>
            </div>
          ) : (
            // Step 2: Payment details
            <div className="space-y-4">
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Forma de Pagamento</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                        <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Parcelas</Label>
                    <Select 
                      value={String(installments)} 
                      onValueChange={(value) => {
                        const num = parseInt(value);
                        setInstallments(num);
                        calculateInstallments(selectedPlan.amount, num);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                          <SelectItem key={num} value={String(num)}>
                            {num}x
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Parcelas</Label>
                  <div className="space-y-2 mt-2">
                    {payments.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>
                          {format(new Date(payment.due_date), 'dd/MM/yyyy')} - 
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)}
                        </span>
                        <span className="text-sm text-gray-500">{payment.payment_method}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Processando...' : 'Finalizar Venda'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewSaleDialog;
