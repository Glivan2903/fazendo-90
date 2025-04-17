import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Search, Download, Edit, ChevronLeft, ChevronRight, X } from "lucide-react";
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
  notes: string | null;
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
  repeat: boolean;
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
  const [showNewReceiptDialog, setShowNewReceiptDialog] = useState(false);
  const [showEditPaymentDialog, setShowEditPaymentDialog] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [categories, setCategories] = useState([
    "Selecione", "Adesões", "Drop-in", "Vendas", "Transferência", 
    "Patrocinadores", "Aluguel (sublocação)", "Internet (Novidades em breve)"
  ]);
  
  const [newPayment, setNewPayment] = useState<NewPaymentData>({
    category: "Adesões",
    description: "",
    client: "",
    account: "Musculação",
    competence_date: format(new Date(), "yyyy-MM-dd"),
    due_date: format(new Date(), "yyyy-MM-dd"),
    amount: "0,00",
    payment_method: "Dinheiro",
    notes: "",
    received: false,
    payment_date: format(new Date(), "yyyy-MM-dd"),
    tax: "0,00",
    interest: "0,00",
    value_to_receive: "0,00",
    user_id: null,
    repeat: false
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
        payment.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
    try {
      if (!newPayment.client || !newPayment.amount || newPayment.amount === "0,00") {
        toast.error("Cliente e valor são obrigatórios");
        return;
      }

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
        // Se não encontrar assinatura, criar uma nova
        const start = new Date();
        const end = new Date();
        end.setMonth(end.getMonth() + 1);
        
        const { data: newSub, error: newSubError } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: selectedUserId,
            start_date: start.toISOString().split('T')[0],
            end_date: end.toISOString().split('T')[0]
          }])
          .select()
          .single();
          
        if (newSubError) {
          toast.error("Erro ao criar assinatura para o usuário");
          return;
        }
        
        const subscriptionId = newSub.id;
        
        // Converter montante para número
        const amountValue = Number(newPayment.amount.replace(/\./g, '').replace(',', '.'));
        
        // Criar novo pagamento
        const { error: paymentError } = await supabase
          .from('payments')
          .insert([{
            subscription_id: subscriptionId,
            user_id: selectedUserId,
            amount: amountValue,
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
        setShowNewReceiptDialog(false);
        loadPayments();
      } else {
        // Usar a assinatura existente
        const subscriptionId = subscriptionData.id;
        
        // Converter montante para número
        const amountValue = Number(newPayment.amount.replace(/\./g, '').replace(',', '.'));
        
        // Criar novo pagamento
        const { error: paymentError } = await supabase
          .from('payments')
          .insert([{
            subscription_id: subscriptionId,
            user_id: selectedUserId,
            amount: amountValue,
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
        setShowNewReceiptDialog(false);
        loadPayments();
      }
      
      // Reset form
      setNewPayment({
        category: "Adesões",
        description: "",
        client: "",
        account: "Musculação",
        competence_date: format(new Date(), "yyyy-MM-dd"),
        due_date: format(new Date(), "yyyy-MM-dd"),
        amount: "0,00",
        payment_method: "Dinheiro",
        notes: "",
        received: false,
        payment_date: format(new Date(), "yyyy-MM-dd"),
        tax: "0,00",
        interest: "0,00",
        value_to_receive: "0,00",
        user_id: null,
        repeat: false
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

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowEditPaymentDialog(true);
  };

  const handleUpdatePayment = async () => {
    if (!selectedPayment) return;
    
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          payment_date: format(new Date(), "yyyy-MM-dd")
        })
        .eq('id', selectedPayment.id);
        
      if (error) throw error;
      
      // Ativar usuário
      await handleUserActivation(selectedPayment.user_id);
      
      toast.success("Pagamento atualizado com sucesso!");
      setShowEditPaymentDialog(false);
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
                  <TableHead>Forma pagto</TableHead>
                  <TableHead>Venda</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Desc Parcela</TableHead>
                  <TableHead className="text-right">Taxa</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
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
                            <Button size="sm" variant="outline" onClick={() => handleEditPayment(payment)}>
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
                  <TableHead>Forma pagto</TableHead>
                  <TableHead>Venda</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Desc Parcela</TableHead>
                  <TableHead className="text-right">Taxa</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
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
                            <Button size="sm" variant="outline" onClick={() => handleEditPayment(payment)}>
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

      {/* Diálogo para novo recebimento */}
      <Dialog open={showNewReceiptDialog} onOpenChange={setShowNewReceiptDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="bg-blue-600 text-white p-4 -mt-5 -mx-6 rounded-t-lg flex justify-between items-center">
              Novo recebimento
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700 h-8 w-8 p-0" onClick={() => setShowNewReceiptDialog(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categorias</label>
              <Select value={newPayment.category} onValueChange={(value) => setNewPayment({...newPayment, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category, index) => (
                    <SelectItem key={index} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input 
                value={newPayment.description}
                onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                placeholder="Defina um nome"
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
                placeholder="0,00"
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
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="repeat" 
                checked={newPayment.repeat}
                onCheckedChange={(checked) => setNewPayment({...newPayment, repeat: !!checked})}
              />
              <label htmlFor="repeat" className="font-medium">
                Repetir
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
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
                    placeholder="0,00"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Taxa</label>
                  <Input 
                    value={newPayment.tax}
                    onChange={(e) => setNewPayment({...newPayment, tax: e.target.value})}
                    placeholder="0,00"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor a receber</label>
                  <Input 
                    value={newPayment.value_to_receive || newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, value_to_receive: e.target.value})}
                    placeholder="0,00"
                  />
                  {parseFloat(newPayment.value_to_receive.replace(',', '.')) === 0 && (
                    <p className="text-red-500 text-xs">
                      "Valor" não pode ficar em branco.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowNewReceiptDialog(false)} variant="outline">
              Fechar
            </Button>
            <Button onClick={handleSavePayment} className="bg-blue-600 hover:bg-blue-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar pagamento */}
      <Dialog open={showEditPaymentDialog} onOpenChange={setShowEditPaymentDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="bg-blue-600 text-white p-4 -mt-5 -mx-6 rounded-t-lg flex justify-between items-center">
              Editar lançamento
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700 h-8 w-8 p-0" onClick={() => setShowEditPaymentDialog(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categorias</label>
                <Select defaultValue="Vendas">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vendas">Vendas</SelectItem>
                    <SelectItem value="Adesões">Adesões</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Input defaultValue={`Venda ${selectedPayment.id.substring(0, 4)}`} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente</label>
                <Input defaultValue={selectedPayment.profiles?.name || ""} readOnly />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Desc Parcela</label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Selecione</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Conta</label>
                <Select defaultValue="Musculação">
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
                  defaultValue={selectedPayment.due_date}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data vencto</label>
                <Input 
                  type="date"
                  defaultValue={selectedPayment.due_date}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor</label>
                <Input defaultValue={selectedPayment.amount.toFixed(2).replace('.', ',')} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Forma de pagamento</label>
                <Select defaultValue={selectedPayment.payment_method || "Dinheiro"}>
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
                <Textarea defaultValue={selectedPayment.notes || ""} className="min-h-[100px]" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data do pagamento</label>
                <Input 
                  type="date"
                  defaultValue={selectedPayment.payment_date || format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data do recebimento</label>
                <Input 
                  type="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Juros</label>
                <Input defaultValue="0,00" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Taxa</label>
                <Input defaultValue="0,00" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor a receber</label>
                <Input defaultValue={selectedPayment.amount.toFixed(2).replace('.', ',')} />
              </div>
              
              <div className="col-span-2 text-xs text-gray-500 mt-4">
                Criado em: {selectedPayment.payment_date ? format(new Date(selectedPayment.payment_date), "dd/MM/yyyy HH:mm") : "N/A"} por: Cross Box Fênix
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPaymentDialog(false)}>
              Fechar
            </Button>
            <Button onClick={handleUpdatePayment} className="bg-blue-600 hover:bg-blue-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancesTab;
