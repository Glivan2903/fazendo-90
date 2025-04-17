
import React, { useState, useEffect } from "react";
import { format, isAfter, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, RefreshCw, Search, CheckCircle2, XCircle, AlertCircle, DollarSign, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchSubscriptions, renewSubscription } from "@/api/subscriptionApi";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NewSubscriptionDialog from "./NewSubscriptionDialog";
import { Badge } from "@/components/ui/badge";

interface Profile {
  name: string;
  email: string;
  plan?: string;
}

interface Payment {
  id: string;
  status: string;
}

interface Subscription {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  profiles?: Profile | null;
}

interface EnhancedSubscription extends Subscription {
  payments?: Payment[];
  hasValidPayment?: boolean;
}

const SubscriptionsTab = () => {
  const [subscriptions, setSubscriptions] = useState<EnhancedSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<EnhancedSubscription | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [paymentMethod, setPaymentMethod] = useState("pix");

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await fetchSubscriptions();
      
      // Fetch all profiles to get plan information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, plan');
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }
      
      // Map profiles to user_id for quicker lookup
      const profileMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.id, profile);
        });
      }
      
      // Fetch payment information for each subscription
      const enhancedData = await Promise.all(data.map(async (sub) => {
        const { data: payments, error } = await supabase
          .from('payments')
          .select('id, status')
          .eq('subscription_id', sub.id);
          
        if (error) {
          console.error("Error fetching payments for subscription:", error);
          return { ...sub, payments: [], hasValidPayment: false };
        }
        
        const hasValidPayment = payments?.some(p => p.status === 'paid') || false;
        
        // Get profile information from the profileMap
        const profile = profileMap.get(sub.user_id);
        const enhancedSub = { 
          ...sub, 
          payments, 
          hasValidPayment,
          profiles: profile || sub.profiles 
        };
        
        console.log("Enhanced subscription:", enhancedSub);
        return enhancedSub;
      }));
      
      setSubscriptions(enhancedData);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Erro ao carregar adesões");
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleRenewSubscription = async (userId: string) => {
    try {
      await renewSubscription(userId);
      toast.success("Adesão renovada com sucesso");
      loadSubscriptions();
    } catch (error) {
      console.error("Error renewing subscription:", error);
      toast.error("Erro ao renovar adesão");
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedSubscription) return;
    
    try {
      // Insert payment record
      const { error } = await supabase
        .from('payments')
        .insert([
          {
            subscription_id: selectedSubscription.id,
            user_id: selectedSubscription.user_id,
            amount: getAmountByPlan(selectedSubscription.profiles?.plan || 'Mensal'),
            status: paymentStatus,
            payment_method: paymentMethod,
            due_date: selectedSubscription.end_date
          }
        ]);
        
      if (error) throw error;
      
      // If payment is successful, update user status to active
      if (paymentStatus === 'paid') {
        await supabase
          .from('profiles')
          .update({ status: 'Ativo' })
          .eq('id', selectedSubscription.user_id);
      }
      
      toast.success("Pagamento registrado com sucesso");
      setShowPaymentDialog(false);
      loadSubscriptions();
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Erro ao processar pagamento");
    }
  };
  
  const getAmountByPlan = (plan: string): number => {
    switch (plan) {
      case 'Trimestral':
        return 270.00;
      case 'Anual':
        return 960.00;
      default: // Mensal
        return 100.00;
    }
  };

  const openPaymentDialog = (subscription: EnhancedSubscription) => {
    setSelectedSubscription(subscription);
    setShowPaymentDialog(true);
  };

  const getStatusBadge = (subscription: EnhancedSubscription) => {
    const today = new Date();
    const end = new Date(subscription.end_date);
    const isExpired = end < today;
    const hasValidPayment = subscription.hasValidPayment;

    if (isExpired) {
      return (
        <div className="flex items-center text-red-500">
          <XCircle className="w-4 h-4 mr-1" />
          Vencido
          {!hasValidPayment && <Ban className="w-3 h-3 ml-1" />}
        </div>
      );
    }

    if (!hasValidPayment) {
      return (
        <div className="flex items-center text-yellow-500">
          <AlertCircle className="w-4 h-4 mr-1" />
          Pendente
        </div>
      );
    }

    return (
      <div className="flex items-center text-green-500">
        <CheckCircle2 className="w-4 h-4 mr-1" />
        Ativo
      </div>
    );
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    // Make sure we have a valid subscription with profiles data
    if (!sub || !sub.profiles) return false;
    
    const matchesSearch = sub.profiles.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const today = new Date();
    const endDate = new Date(sub.end_date);
    const isActive = endDate >= today;
    const hasValidPayment = sub.hasValidPayment;

    switch (filter) {
      case "active":
        return matchesSearch && isActive && hasValidPayment;
      case "pending":
        return matchesSearch && isActive && !hasValidPayment;
      case "expired":
        return matchesSearch && !isActive;
      default:
        return matchesSearch;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <AlertCircle className="h-8 w-8 mb-2 animate-pulse text-blue-500" />
        <p className="text-muted-foreground ml-2">Carregando adesões...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="expired">Vencidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Adesão
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.profiles?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={sub.profiles?.plan === 'Anual' ? 'default' : 
                            sub.profiles?.plan === 'Trimestral' ? 'secondary' : 'outline'}>
                      {sub.profiles?.plan || 'Mensal'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(sub.start_date), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(sub.end_date), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(sub)}
                  </TableCell>
                  <TableCell>
                    {sub.hasValidPayment ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Pago</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {!sub.hasValidPayment && (
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => openPaymentDialog(sub)}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Pagamento
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRenewSubscription(sub.user_id)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Renovar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>Nenhuma adesão encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewSubscriptionDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={() => {
          loadSubscriptions();
          setShowNewDialog(false);
        }}
      />
      
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              {selectedSubscription?.profiles?.name} - {selectedSubscription?.profiles?.plan || "Mensal"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-2">R$</span>
                <Input 
                  className="pl-10" 
                  value={selectedSubscription ? getAmountByPlan(selectedSubscription.profiles?.plan || 'Mensal').toFixed(2) : "0.00"} 
                  readOnly 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status do Pagamento</label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status do Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Método de Pagamento</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Método de Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="debit">Cartão de Débito</SelectItem>
                  <SelectItem value="credit">Cartão de Crédito</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancelar</Button>
            <Button onClick={handleProcessPayment}>Confirmar Pagamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionsTab;
