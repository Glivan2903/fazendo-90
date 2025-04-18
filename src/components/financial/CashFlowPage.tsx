import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  PlusCircle, Search, FileText, ArrowDown, ArrowUp, 
  Calendar, Edit2, Trash2, Filter, Download, ArrowUpDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: string;
  payment_method: string;
  fornecedor?: string;
  bank_account?: string;
  transaction_type: 'income' | 'expense';
}

const CashFlowPage = () => {
  const [activeTab, setActiveTab] = useState("extract");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showNewIncomeDialog, setShowNewIncomeDialog] = useState(false);
  const [showNewExpenseDialog, setShowNewExpenseDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [suppliers, setSuppliers] = useState<{id: string, name: string}[]>([]);
  const [users, setUsers] = useState<{id: string, name: string, email: string}[]>([]);

  const [formValues, setFormValues] = useState({
    date: new Date(),
    category: "",
    description: "",
    amount: "",
    status: "pending",
    payment_method: "",
    fornecedor: "",
    user_id: "",
    bank_account: "Nubank"
  });

  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchSuppliers();
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = [...transactions];
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.fornecedor && t.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    
    if (dateFilter === "today") {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(t => t.date.startsWith(today));
    } else if (dateFilter === "thisWeek") {
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startOfWeek;
      });
    } else if (dateFilter === "thisMonth") {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startOfMonth;
      });
    }
    
    if (activeTab === "income") {
      filtered = filtered.filter(t => t.transaction_type === "income");
    } else if (activeTab === "expenses") {
      filtered = filtered.filter(t => t.transaction_type === "expense");
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter, categoryFilter, dateFilter, activeTab]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_invoices')
        .select('*')
        .order('due_date', { ascending: false });
        
      if (error) throw error;
      
      const formattedData = data.map(item => ({
        id: item.id,
        date: item.due_date,
        category: item.category || 'Sem categoria',
        description: item.buyer_name || 'Sem descrição',
        amount: item.total_amount,
        status: item.status,
        payment_method: item.payment_method || 'Não definido',
        fornecedor: item.fornecedor || null,
        bank_account: item.bank_account || 'Conta Principal',
        transaction_type: item.transaction_type || 'income'
      }));
      
      setTransactions(formattedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Não foi possível carregar as transações');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .order('name');
        
      if (error) {
        console.error('Error fetching suppliers:', error);
        setSuppliers([
          { id: '1', name: 'Imobiliária' },
          { id: '2', name: 'Serviços de Limpeza' },
          { id: '3', name: 'Fornecedor de Equipamentos' }
        ]);
        return;
      }
      
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([
        { id: '1', name: 'Imobiliária' },
        { id: '2', name: 'Serviços de Limpeza' },
        { id: '3', name: 'Fornecedor de Equipamentos' }
      ]);
    }
  };
  
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .order('name');
        
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bank_invoices')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Transação excluída com sucesso');
      fetchTransactions();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Erro ao excluir transação');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setFormValues({
      date: new Date(transaction.date),
      category: transaction.category || "",
      description: transaction.description || "",
      amount: transaction.amount.toString(),
      status: transaction.status,
      payment_method: transaction.payment_method || "",
      fornecedor: transaction.fornecedor || "",
      user_id: "",
      bank_account: transaction.bank_account || "Nubank"
    });
    setShowEditDialog(true);
  };

  const handleDelete2 = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setShowDeleteDialog(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormValues({
      ...formValues,
      [name]: value
    });
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormValues({
        ...formValues,
        date
      });
      setCalendarOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, type: 'income' | 'expense') => {
    e.preventDefault();
    
    try {
      const newTransaction = {
        buyer_name: type === 'income' ? formValues.description : null,
        due_date: format(formValues.date, 'yyyy-MM-dd'),
        payment_date: formValues.status === 'paid' ? format(formValues.date, 'yyyy-MM-dd') : null,
        total_amount: parseFloat(formValues.amount),
        discount_amount: 0,
        status: formValues.status,
        payment_method: formValues.payment_method,
        invoice_number: await generateInvoiceNumber(),
        transaction_type: type,
        category: formValues.category,
        fornecedor: type === 'expense' ? formValues.fornecedor : null,
        bank_account: formValues.bank_account,
        user_id: type === 'income' ? formValues.user_id || null : null
      };
      
      const { data, error } = await supabase
        .from('bank_invoices')
        .insert([newTransaction])
        .select();
        
      if (error) throw error;
      
      toast.success(`${type === 'income' ? 'Recebimento' : 'Despesa'} cadastrado com sucesso`);
      fetchTransactions();
      
      if (type === 'income') {
        setShowNewIncomeDialog(false);
      } else {
        setShowNewExpenseDialog(false);
      }
      
      setFormValues({
        date: new Date(),
        category: "",
        description: "",
        amount: "",
        status: "pending",
        payment_method: "",
        fornecedor: "",
        user_id: "",
        bank_account: "Nubank"
      });
      
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error(`Erro ao cadastrar ${type === 'income' ? 'recebimento' : 'despesa'}`);
    }
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('generate_invoice_number');
      
      if (error) throw error;
      return data || "1";
    } catch (error) {
      console.error("Error generating invoice number:", error);
      return Date.now().toString().substring(5);
    }
  };

  const updateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTransaction) return;
    
    try {
      const updatedTransaction = {
        buyer_name: formValues.description,
        due_date: format(formValues.date, 'yyyy-MM-dd'),
        payment_date: formValues.status === 'paid' ? format(formValues.date, 'yyyy-MM-dd') : null,
        total_amount: parseFloat(formValues.amount),
        status: formValues.status,
        payment_method: formValues.payment_method,
        category: formValues.category,
        fornecedor: formValues.fornecedor,
        bank_account: formValues.bank_account
      };
      
      const { error } = await supabase
        .from('bank_invoices')
        .update(updatedTransaction)
        .eq('id', currentTransaction.id);
        
      if (error) throw error;
      
      toast.success('Transação atualizada com sucesso');
      fetchTransactions();
      setShowEditDialog(false);
      
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Erro ao atualizar transação');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'income') {
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    } else {
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    }
  };

  const calculateIncomeTotal = () => {
    return filteredTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateExpenseTotal = () => {
    return filteredTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateBalance = () => {
    return calculateIncomeTotal() - calculateExpenseTotal();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isValid(date)) {
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
      }
      return 'Data inválida';
    } catch (error) {
      return 'Data inválida';
    }
  };

  const renderTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Forma de Pagamento</TableHead>
            <TableHead>Conta</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{getTypeIcon(transaction.transaction_type)}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {transaction.description}
                  {transaction.fornecedor && <div className="text-xs text-gray-500">Fornecedor: {transaction.fornecedor}</div>}
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.payment_method || '-'}</TableCell>
                <TableCell>{transaction.bank_account || 'Conta Principal'}</TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(transaction)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete2(transaction)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-10">
                {loading ? (
                  <div className="flex justify-center">
                    <div className="h-6 w-6 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                  </div>
                ) : (
                  'Nenhuma transação encontrada'
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderFilters = () => (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar transações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="paid">Pagos</SelectItem>
          <SelectItem value="pending">Pendentes</SelectItem>
          <SelectItem value="overdue">Atrasados</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          <SelectItem value="Mensalidade">Mensalidade</SelectItem>
          <SelectItem value="Adesão">Adesão</SelectItem>
          <SelectItem value="Aluguel">Aluguel</SelectItem>
          <SelectItem value="Despesa Operacional">Despesa Operacional</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={dateFilter} onValueChange={setDateFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por data" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as datas</SelectItem>
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="thisWeek">Esta semana</SelectItem>
          <SelectItem value="thisMonth">Este mês</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Entradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(calculateIncomeTotal())}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Saídas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(calculateExpenseTotal())}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Saldo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${calculateBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(calculateBalance())}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNewIncomeDialog = () => (
    <Dialog open={showNewIncomeDialog} onOpenChange={setShowNewIncomeDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Recebimento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={(e) => handleSubmit(e, 'income')} className="space-y-4">
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
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formValues.date}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user_id">Cliente</Label>
            <Select value={formValues.user_id} onValueChange={(value) => handleSelectChange('user_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Selecione um cliente</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
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
                <SelectItem value="Mensalidade">Mensalidade</SelectItem>
                <SelectItem value="Adesão">Adesão</SelectItem>
                <SelectItem value="Taxa extra">Taxa extra</SelectItem>
                <SelectItem value="Produto">Produto</SelectItem>
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
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowNewIncomeDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderNewExpenseDialog = () => (
    <Dialog open={showNewExpenseDialog} onOpenChange={setShowNewExpenseDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Despesa</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={(e) => handleSubmit(e, 'expense')} className="space-y-4">
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
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formValues.date}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fornecedor">Fornecedor</Label>
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
            <Button type="button" variant="outline" onClick={() => setShowNewExpenseDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderEditDialog = () => (
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={updateTransaction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_date">Data</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formValues.date && "text-muted-foreground"
                  )}
                  id="edit_date"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formValues.date ? (
                    format(formValues.date, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formValues.date}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit_description">Descrição</Label>
            <Input
              id="edit_description"
              name="description"
              value={formValues.description}
              onChange={handleFormChange}
              required
            />
          </div>
          
          {currentTransaction?.transaction_type === 'expense' && (
            <div className="space-y-2">
              <Label htmlFor="edit_fornecedor">Fornecedor</Label>
              <Select value={formValues.fornecedor} onValueChange={(value) => handleSelectChange('fornecedor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem fornecedor</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="edit_category">Categoria</Label>
            <Select value={formValues.category} onValueChange={(value) => handleSelectChange('category', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {currentTransaction?.transaction_type === 'income' ? (
                  <>
                    <SelectItem value="Mensalidade">Mensalidade</SelectItem>
                    <SelectItem value="Adesão">Adesão</SelectItem>
                    <SelectItem value="Taxa extra">Taxa extra</SelectItem>
                    <SelectItem value="Produto">Produto</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Despesa Operacional">Despesa Operacional</SelectItem>
                    <SelectItem value="Materiais">Materiais</SelectItem>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Impostos">Impostos</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit_amount">Valor (R$)</Label>
            <Input
              id="edit_amount"
              name="amount"
              type="number"
              step="0.01"
              value={formValues.amount}
              onChange={handleFormChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit_status">Status</Label>
            <Select value={formValues.status} onValueChange={(value) => handleSelectChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                {currentTransaction?.transaction_type === 'income' && (
                  <SelectItem value="overdue">Atrasado</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit_payment_method">Forma de pagamento</Label>
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
            <Label htmlFor="edit_bank_account">Conta</Label>
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
            <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderDeleteDialog = () => (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Transação</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p>Tem certeza que deseja excluir esta transação? Esta ação não poderá ser desfeita.</p>
          
          {currentTransaction && (
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <div><strong>Descrição:</strong> {currentTransaction.description}</div>
              <div><strong>Data:</strong> {formatDate(currentTransaction.date)}</div>
              <div><strong>Valor:</strong> {formatCurrency(currentTransaction.amount)}</div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => currentTransaction && handleDelete(currentTransaction.id)}
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="extract" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="extract" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              <span>Extrato</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center">
              <ArrowUp className="w-4 h-4 mr-2" />
              <span>Entradas</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center">
              <ArrowDown className="w-4 h-4 mr-2" />
              <span>Saídas</span>
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="flex items-center">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <span>Fluxo de Caixa</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            {activeTab === 'income' || activeTab === 'extract' ? (
              <Button 
                variant="default"
                onClick={() => setShowNewIncomeDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Novo Recebimento
              </Button>
            ) : null}
            
            {activeTab === 'expenses' || activeTab === 'extract' ? (
              <Button 
                variant="outline" 
                onClick={() => setShowNewExpenseDialog(true)}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Nova Despesa
              </Button>
            ) : null}
          </div>
        </div>

        <TabsContent value="extract">
          {renderSummaryCards()}
          {renderFilters()}
          {renderTable()}
        </TabsContent>
        
        <TabsContent value="income">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total de Entradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(calculateIncomeTotal())}</div>
            </CardContent>
          </Card>
          
          {renderFilters()}
          {renderTable()}
        </TabsContent>
        
        <TabsContent value="expenses">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total de Saídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(calculateExpenseTotal())}</div>
            </CardContent>
          </Card>
          
          {renderFilters()}
          {renderTable()}
        </TabsContent>
        
        <TabsContent value="cashflow">
          <div className="flex justify-end mb-4 space-x-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar por Período
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
          
          {renderSummaryCards()}
          
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa Mensal</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-80 w-full">
                <div className="flex justify-center items-center h-full">
                  <p>Gráfico de fluxo de caixa será implementado aqui</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {renderNewIncomeDialog()}
      {renderNewExpenseDialog()}
      {renderEditDialog()}
      {renderDeleteDialog()}
    </div>
  );
};

export default CashFlowPage;
