
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApproveUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onApproved: () => void;
}

export default function ApproveUserDialog({ 
  open, 
  onOpenChange, 
  userId,
  userName,
  onApproved
}: ApproveUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [plans, setPlans] = useState<any[]>([]);

  React.useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('active', true)
        .order('amount');

      if (error) throw error;
      setPlans(data || []);
      // Auto select the first plan
      if (data && data.length > 0) {
        setSelectedPlanId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Erro ao carregar planos disponíveis");
    }
  };

  const handleApprove = async () => {
    try {
      if (!selectedPlanId) {
        toast.error("Por favor, selecione um plano");
        return;
      }

      setLoading(true);

      // 1. Update user status to active
      const { error: statusError } = await supabase
        .from('profiles')
        .update({ status: 'Ativo' })
        .eq('id', userId);

      if (statusError) throw statusError;

      // 2. Create subscription for user based on selected plan
      const selectedPlan = plans.find(p => p.id === selectedPlanId);
      if (!selectedPlan) throw new Error("Plano não encontrado");
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + selectedPlan.days_validity);
      
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: userId,
          plan_id: selectedPlanId,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active'
        }]);

      if (subscriptionError) throw subscriptionError;

      toast.success(`Usuário ${userName} aprovado com sucesso!`);
      onApproved();
      onOpenChange(false);

    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Erro ao aprovar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Aprovar Novo Usuário</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você está aprovando o acesso para <strong>{userName}</strong>. Selecione um plano para o usuário.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="plan">Selecione um Plano</Label>
            <Select 
              value={selectedPlanId} 
              onValueChange={setSelectedPlanId}
              disabled={loading || plans.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - R$ {plan.amount.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedPlanId && (
            <Alert className="bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Uma fatura será gerada automaticamente para este usuário.
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={loading || !selectedPlanId}
            >
              {loading ? "Aprovando..." : "Aprovar Usuário"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
