
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Search, DollarSign, Download, Check, X, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface Payment {
  id: string;
  amount: number;
  payment_date: string | null;
  due_date: string;
  status: string;
  payment_method: string | null;
  subscription_id: string;
  user_id: string;
  profiles: {
    name: string;
    email: string;
  } | null;
}

interface NewPaymentData {
  category: string;
  description: string;
  client: string;
  account: string;
  competence_date: string;
  due_date: string;
  amount: string;
  payment_method: string;
  notes: string;
  received: boolean;
  payment_date: string;
  tax: string;
  interest: string;
  value_to_receive: string;
  user_id: string | null;
}

const FinancesTab = () => {
  const [currentTab, setCurrentTab] = useState("extrato");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [dateRange, setDateRange] = useState("01/04/2025 - 30/04/2025");
  const [showNewPaymentDialog, setShowNewPaymentDialog] = useState(false);
  const [showNewReceiptDialog, setShowNewReceiptDialog] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  
  const [newPayment, setNewPayment] = useState<NewPaymentData>({
    category: "Adesões",
    description: "",
    client: "",
    account: "Musculação",
    competence_date: format(new Date(), "yyyy-MM-dd"),
    due_date: format(new Date(), "yyyy-MM-dd"),
    amount: "",
    payment_method: "Dinheiro",
    notes: "",
    received: false,
    payment_date: format(new Date(), "yyyy-MM-dd"),
    tax: "0.00",
    interest: "0.00",
    value_to_receive: "",
    user_id: null
  });

  useEffect(() => {
    loadPayments();
    loadUsers();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchTerm, payments, showOnlyActive]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles:user_id (
            name,
            email
          )
        `)
        .order('due_date', { ascending: false });

      if (error) throw error;

      setPayments(data || []);
      
      // Calcular totais
      const total = data?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      const pending = data?.reduce((sum, payment) => 
        payment.status === 'pending' ? sum + Number(payment.amount) : sum, 0
      ) || 0;
      
      setTotalRevenue(total);
      setPendingRevenue(pending);
      setFilteredPayments(data || []);
    } catch (error) {
      console.error("Error loading payments:", error);
      toast.error("Erro ao carregar pagamentos");
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];
    
    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar apenas usuários ativos
    if (showOnlyActive) {
      filtered = filtered.filter(payment => payment.status === 'paid');
    }
    
    setFilteredPayments(filtered);
  };

  const handleUserActivation = async (userId: string) => {
    try {
      // Atualizar status do usuário para ativo
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'Ativo' })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success("Usuário ativado com sucesso!");
      loadPayments();
    } catch (error) {
      console.error("Erro ao ativar usuário:", error);
      toast.error("Erro ao ativar usuário");
    }
  };

  const handleSavePayment = async () => {
    if (!newPayment.client || !newPayment.amount) {
      toast.error("Cliente e valor são obrigatórios");
      return;
    }

    try {
      const selectedUserId = newPayment.user_id;
      if (!selectedUserId) {
        toast.error("Selecione um cliente válido");
        return;
      }

      // Encontrar a assinatura mais recente do usuário
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', selectedUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subError) {
        toast.error("Erro ao encontrar assinatura do usuário");
        return;
      }

      // Criar novo pagamento
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          subscription_id: subscriptionData.id,
          user_id: selectedUserId,
          amount: Number(newPayment.amount),
          payment_date: newPayment.received ? newPayment.payment_date : null,
          due_date: newPayment.due_date,
          status: newPayment.received ? 'paid' : 'pending',
          payment_method: newPayment.payment_method,
          notes: newPayment.notes
        }]);

      if (paymentError) throw paymentError;

      // Se recebido, ativar usuário
      if (newPayment.received) {
        await handleUserActivation(selectedUserId);
      }

      toast.success("Pagamento registrado com sucesso!");
      setShowNewPaymentDialog(false);
      loadPayments();
      
      // Reset form
      setNewPayment({
        category: "Adesões",
        description: "",
        client: "",
        account: "Musculação",
        competence_date: format(new Date(), "yyyy-MM-dd"),
        due_date: format(new Date(), "yyyy-MM-dd"),
        amount: "",
        payment_method: "Dinheiro",
        notes: "",
        received: false,
        payment_date: format(new Date(), "yyyy-MM-dd"),
        tax: "0.00",
        interest: "0.00",
        value_to_receive: "",
        user_id: null
      });
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast.error("Erro ao registrar pagamento");
    }
  };

  const handleMarkAsPaid = async (payment: Payment) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'paid', 
          payment_date: format(new Date(), "yyyy-MM-dd") 
        })
        .eq('id', payment.id);
      
      if (error) throw error;
      
      // Ativar usuário
      await handleUserActivation(payment.user_id);
      
      toast.success("Pagamento marcado como recebido!");
      loadPayments();
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      toast.error("Erro ao atualizar pagamento");
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-xl font-bold uppercase">ENTRADAS E SAÍDAS</h1>
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm">
            <span className="text-blue-500 font-bold mr-1">?</span> CENTRAL DE AJUDA
          </Button>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-4 max-w-md">
          <TabsTrigger value="extrato">Extrato</TabsTrigger>
          <TabsTrigger value="recebimentos">Recebimentos</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de caixa</TabsTrigger>
        </TabsList>
        
        <div className="mt-4 flex justify-between">
          <div className="flex gap-2">
            <Button onClick={() => setShowNewReceiptDialog(true)} className="bg-green-500 hover:bg-green-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo recebimento
            </Button>
            <Button onClick={() => setShowNewPaymentDialog(true)} className="bg-red-500 hover:bg-red-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo pagamento
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="relative">
            <Select defaultValue="all">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Conta(s)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="musculacao">Musculação</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {currentTab === "recebimentos" && (
            <div className="relative">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Forma pagto(s)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="relative">
            <Select defaultValue="all">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Exibir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Select defaultValue="all">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="export">Exportar</SelectItem>
                <SelectItem value="delete">Excluir</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative text-sm bg-white border border-input rounded-md px-3 py-2">
            {dateRange}
          </div>
          
          <div className="relative">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative flex items-center gap-2 ml-2">
            <input type="radio" id="vencimento" name="filterType" defaultChecked />
            <label htmlFor="vencimento" className="text-sm">Vencimento</label>
            
            <input type="radio" id="recebimento" name="filterType" className="ml-3" />
            <label htmlFor="recebimento" className="text-sm">Recebimento</label>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar cliente..."
              className="pl-8 w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox id="active-users" 
                checked={showOnlyActive} 
                onCheckedChange={(checked) => setShowOnlyActive(!!checked)} 
              />
              <label htmlFor="active-users" className="text-sm">
                Apenas atletas ativos
              </label>
            </div>
            
            <Button variant="outline">
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </Button>
          </div>
        </div>
        
        <TabsContent value="extrato" className="mt-4">
          <div className="text-sm text-gray-500">
            Exibindo 1-{filteredPayments.length} de {filteredPayments.length} itens.
          </div>
          
          <div className="rounded-md border mt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Data vencto</TableHead>
                  <TableHead>Forma pago</TableHead>
                  <TableHead>Venda</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Desc Parcela</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.due_date), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{payment.payment_method || "Dinheiro"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          #{payment.id.substring(0, 4)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-sky-100 text-sky-800">
                          Vendas
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <a href="#" className="text-blue-600 hover:underline">
                          {payment.profiles?.name || "N/A"}
                        </a>
                      </TableCell>
                      <TableCell className="text-right">0,00</TableCell>
                      <TableCell className="text-right text-red-500">0,00</TableCell>
                      <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        {payment.status === 'paid' ? (
                          <Badge className="bg-green-100 text-green-800">RECEBIDO</Badge>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleMarkAsPaid(payment)}
                            >
                              Receber
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <p>Nenhum pagamento encontrado</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="recebimentos" className="mt-4">
          <div className="text-sm text-gray-500">
            Exibindo 1-{filteredPayments.length} de {filteredPayments.length} itens.
          </div>
          
          <div className="rounded-md border mt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Data vencto</TableHead>
                  <TableHead>Forma pago</TableHead>
                  <TableHead>Venda</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Desc Parcela</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.due_date), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{payment.payment_method || "Dinheiro"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          #{payment.id.substring(0, 4)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-sky-100 text-sky-800">
                          Vendas
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <a href="#" className="text-blue-600 hover:underline">
                          {payment.profiles?.name || "N/A"}
                        </a>
                      </TableCell>
                      <TableCell className="text-right">0,00</TableCell>
                      <TableCell className="text-right text-red-500">0,00</TableCell>
                      <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        {payment.status === 'paid' ? (
                          <Badge className="bg-green-100 text-green-800">RECEBIDO</Badge>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleMarkAsPaid(payment)}
                            >
                              Receber
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <p>Nenhum pagamento encontrado</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo para novo pagamento */}
      <Dialog open={showNewPaymentDialog} onOpenChange={setShowNewPaymentDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Novo pagamento</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categorias</label>
              <Select value={newPayment.category} onValueChange={(value) => setNewPayment({...newPayment, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adesões">Adesões</SelectItem>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input 
                value={newPayment.description}
                onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                placeholder="Descrição do pagamento"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select 
                value={newPayment.user_id || ""}
                onValueChange={(value) => {
                  const user = users.find(u => u.id === value);
                  setNewPayment({
                    ...newPayment, 
                    user_id: value,
                    client: user?.name || ""
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Conta</label>
              <Select value={newPayment.account} onValueChange={(value) => setNewPayment({...newPayment, account: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Musculação">Musculação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data competência</label>
              <Input 
                type="date"
                value={newPayment.competence_date}
                onChange={(e) => setNewPayment({...newPayment, competence_date: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data vencto</label>
              <Input 
                type="date"
                value={newPayment.due_date}
                onChange={(e) => setNewPayment({...newPayment, due_date: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor</label>
              <Input 
                value={newPayment.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewPayment({
                    ...newPayment, 
                    amount: value,
                    value_to_receive: value // Atualizar também o valor a receber
                  })
                }}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de pagamento</label>
              <Select 
                value={newPayment.payment_method} 
                onValueChange={(value) => setNewPayment({...newPayment, payment_method: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Cartão">Cartão</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Observações</label>
              <Textarea 
                value={newPayment.notes}
                onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                placeholder="Observações adicionais"
              />
            </div>
            
            <div className="flex items-center space-x-2 col-span-2">
              <Checkbox 
                id="recebido" 
                checked={newPayment.received}
                onCheckedChange={(checked) => setNewPayment({...newPayment, received: !!checked})}
              />
              <label htmlFor="recebido" className="font-medium">
                Recebido
              </label>
            </div>
            
            {newPayment.received && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data do pagamento</label>
                  <Input 
                    type="date"
                    value={newPayment.payment_date}
                    onChange={(e) => setNewPayment({...newPayment, payment_date: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Juros</label>
                  <Input 
                    value={newPayment.interest}
                    onChange={(e) => setNewPayment({...newPayment, interest: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Taxa</label>
                  <Input 
                    value={newPayment.tax}
                    onChange={(e) => setNewPayment({...newPayment, tax: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor a receber</label>
                  <Input 
                    value={newPayment.value_to_receive || newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, value_to_receive: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPaymentDialog(false)}>
              Fechar
            </Button>
            <Button onClick={handleSavePayment} className="bg-blue-500 hover:bg-blue-600">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para novo recebimento - similar ao de pagamento */}
      <Dialog open={showNewReceiptDialog} onOpenChange={setShowNewReceiptDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Novo recebimento</DialogTitle>
          </DialogHeader>
          
          {/* Conteúdo igual ao do diálogo de pagamento */}
          <div className="grid grid-cols-2 gap-4">
            {/* Mesmos campos do diálogo de pagamento */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categorias</label>
              <Select defaultValue="Adesões">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adesões">Adesões</SelectItem>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Outros campos idênticos */}
            {/* ... */}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewReceiptDialog(false)}>
              Fechar
            </Button>
            <Button onClick={() => setShowNewReceiptDialog(false)} className="bg-blue-500 hover:bg-blue-600">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancesTab;
