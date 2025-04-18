
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  date: string;
  due_date: string;
  payment_date: string | null;
  description: string;
  amount: number;
  payment_method: string | null;
  category: string;
  client_id: string | null;
  client_name: string | null;
  status: 'pending' | 'paid' | 'received' | 'cancelled';
}

const CashFlowPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('extract');
  const [newIncomeDialogOpen, setNewIncomeDialogOpen] = useState(false);
  const [newExpenseDialogOpen, setNewExpenseDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['transactions', dateRange],
    queryFn: async () => {
      // In a real implementation, we would fetch transactions from Supabase
      // For now, return sample data
      const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
      const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';
      
      // We'll pretend this is coming from the database
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'income',
          date: '2025-04-01',
          due_date: '2025-04-01',
          payment_date: '2025-04-01',
          description: 'Pagamento de mensalidade',
          amount: 100.00,
          payment_method: 'Dinheiro',
          category: 'Vendas',
          client_id: '1',
          client_name: 'Ana Paula Rios',
          status: 'received'
        },
        {
          id: '2',
          type: 'income',
          date: '2025-04-01',
          due_date: '2025-04-01',
          payment_date: '2025-04-01',
          description: 'Pagamento de mensalidade',
          amount: 100.00,
          payment_method: 'Dinheiro',
          category: 'Vendas',
          client_id: '2',
          client_name: 'Carlos Borges',
          status: 'received'
        },
        {
          id: '3',
          type: 'expense',
          date: '2025-04-02',
          due_date: '2025-04-05',
          payment_date: null,
          description: 'Aluguel',
          amount: 1500.00,
          payment_method: 'Transferência',
          category: 'Administrativo',
          client_id: null,
          client_name: 'Imobiliária',
          status: 'pending'
        },
        {
          id: '4',
          type: 'income',
          date: '2025-04-04',
          due_date: '2025-04-04',
          payment_date: '2025-04-04',
          description: 'Pagamento de mensalidade',
          amount: 100.00,
          payment_method: 'Dinheiro',
          category: 'Vendas',
          client_id: '3',
          client_name: 'Jairo Prestes',
          status: 'received'
        },
      ];
      
      return mockTransactions;
    }
  });

  const filteredTransactions = transactions.filter(t => {
    if (!searchTerm) return true;
    return (
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.payment_method?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
  const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
  
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ENTRADAS E SAÍDAS</h1>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="extract">Extrato</TabsTrigger>
          <TabsTrigger value="incomes">Recebimentos</TabsTrigger>
          <TabsTrigger value="expenses">Pagamentos</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de caixa</TabsTrigger>
        </TabsList>

        <div className="my-4 flex flex-row gap-2">
          {activeTab === 'incomes' && (
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setNewIncomeDialogOpen(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
              Novo recebimento
            </Button>
          )}

          {activeTab === 'expenses' && (
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => setNewExpenseDialogOpen(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
              Novo pagamento
            </Button>
          )}

          <div className="flex flex-1 justify-end gap-2">
            <Select defaultValue="filter">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Conta(s)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="filter">Conta(s)</SelectItem>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="main">Principal</SelectItem>
                <SelectItem value="cash">Caixa</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="method">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Forma pgto(s)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="method">Forma pgto(s)</SelectItem>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="credit">Cartão de Crédito</SelectItem>
                <SelectItem value="debit">Cartão de Débito</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="show">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Exibir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="show">Exibir</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="actions">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="actions">Ações</SelectItem>
                <SelectItem value="export">Exportar</SelectItem>
                <SelectItem value="print">Imprimir</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[250px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                      </>
                    ) : (
                      format(dateRange.from, 'dd/MM/yyyy')
                    )
                  ) : (
                    <span>Selecione um período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="relative">
          <Input
            className="pl-10 mb-4"
            type="search"
            placeholder="Pesquisar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg 
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <TabsContent value="extract" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs font-medium text-gray-500">
                    <tr>
                      <th className="w-10 p-2">
                        <Checkbox />
                      </th>
                      <th className="p-2 text-left">Data vecto</th>
                      <th className="p-2 text-left">Forma pgto</th>
                      <th className="p-2 text-left">Venda</th>
                      <th className="p-2 text-left">Observação</th>
                      <th className="p-2 text-left">Cliente / Fornecedor</th>
                      <th className="p-2 text-left">Desc Parcela</th>
                      <th className="p-2 text-right">Taxa</th>
                      <th className="p-2 text-right">Valor</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTransactions.map(transaction => (
                      <tr key={transaction.id} className="bg-white">
                        <td className="p-2">
                          <Checkbox />
                        </td>
                        <td className="p-2">{format(new Date(transaction.due_date), 'dd/MM/yyyy')}</td>
                        <td className="p-2">{transaction.payment_method}</td>
                        <td className="p-2">
                          <a href="#" className="text-blue-600">{transaction.id}</a>
                        </td>
                        <td className="p-2">
                          <Badge 
                            variant="outline" 
                            className={
                              transaction.type === 'income' 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {transaction.type === 'income' ? 'Vendas' : transaction.category}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <a href="#" className="text-blue-600">{transaction.client_name}</a>
                        </td>
                        <td className="p-2">0,00</td>
                        <td className="p-2 text-right text-red-500">0,00</td>
                        <td className="p-2 text-right">{transaction.amount.toFixed(2)}</td>
                        <td className="p-2 text-center">
                          {transaction.status === 'received' || transaction.status === 'paid' ? (
                            <Badge className="bg-green-100 text-green-800 uppercase">RECEBIDO</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 uppercase">PENDENTE</Badge>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <Button variant="ghost" size="sm">
                            <svg 
                              className="w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t">
                <div className="flex space-x-2 justify-start">
                  <Button variant="outline" size="sm" className="h-8 w-8">«</Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 bg-blue-600 text-white">1</Button>
                  <Button variant="outline" size="sm" className="h-8 w-8">2</Button>
                  <Button variant="outline" size="sm" className="h-8 w-8">3</Button>
                  <Button variant="outline" size="sm" className="h-8 w-8">4</Button>
                  <Button variant="outline" size="sm" className="h-8 w-8">»</Button>
                </div>
              </div>
              
              <div className="p-4 space-y-2 bg-gray-50">
                <h3 className="font-medium">Total de pagamentos no período</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>Pagas (R$)</div>
                  <div className="text-right">0,00</div>
                  
                  <div>A pagar (R$)</div>
                  <div className="text-right">0,00</div>
                  
                  <div>A pagar vencidas (R$)</div>
                  <div className="text-right">0,00</div>
                  
                  <div>Total de pagamentos (R$)</div>
                  <div className="text-right">0,00</div>
                  
                  <div>Taxa TED (R$)</div>
                  <div className="text-right">0,00</div>
                </div>
                
                <h3 className="font-medium mt-4">Total de recebimentos no período</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>Recebidas (R$)</div>
                  <div className="text-right">{totalIncome.toFixed(2)}</div>
                  
                  <div>A receber (R$)</div>
                  <div className="text-right">0,00</div>
                  
                  <div>A receber vencidas (R$)</div>
                  <div className="text-right">0,00</div>
                  
                  <div>Total de recebimentos (R$)</div>
                  <div className="text-right">{totalIncome.toFixed(2)}</div>
                  
                  <div>Taxas (R$)</div>
                  <div className="text-right">0,00</div>
                </div>
                
                <h3 className="font-medium mt-4">Saldo final</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>Recebimentos - pagamentos (R$)</div>
                  <div className="text-right">{balance.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incomes" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs font-medium text-gray-500">
                    <tr>
                      <th className="w-10 p-2">
                        <Checkbox />
                      </th>
                      <th className="p-2 text-left">Data vecto</th>
                      <th className="p-2 text-left">Forma pgto</th>
                      <th className="p-2 text-left">Venda</th>
                      <th className="p-2 text-left">Observação</th>
                      <th className="p-2 text-left">Cliente</th>
                      <th className="p-2 text-left">Desc Parcela</th>
                      <th className="p-2 text-right">Taxa</th>
                      <th className="p-2 text-right">Valor</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {incomeTransactions.map(transaction => (
                      <tr key={transaction.id} className="bg-white">
                        <td className="p-2">
                          <Checkbox />
                        </td>
                        <td className="p-2">{format(new Date(transaction.due_date), 'dd/MM/yyyy')}</td>
                        <td className="p-2">{transaction.payment_method}</td>
                        <td className="p-2">
                          <a href="#" className="text-blue-600">{transaction.id}</a>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Vendas
                          </Badge>
                        </td>
                        <td className="p-2">
                          <a href="#" className="text-blue-600">{transaction.client_name}</a>
                        </td>
                        <td className="p-2">0,00</td>
                        <td className="p-2 text-right text-red-500">0,00</td>
                        <td className="p-2 text-right">{transaction.amount.toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <Badge className="bg-green-100 text-green-800 uppercase">RECEBIDO</Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Button variant="ghost" size="sm">
                            <svg 
                              className="w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 space-y-2 bg-gray-50">
                <h3 className="font-medium">Total no período</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>Recebidas (R$)</div>
                  <div className="text-right">{totalIncome.toFixed(2)}</div>
                  
                  <div>A receber (R$)</div>
                  <div className="text-right">0,00</div>
                  
                  <div>Vencidas (R$)</div>
                  <div className="text-right">0,00</div>
                  
                  <div>Total de recebimentos (R$)</div>
                  <div className="text-right">{totalIncome.toFixed(2)}</div>
                  
                  <div>Taxas (R$)</div>
                  <div className="text-right">0,00</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs font-medium text-gray-500">
                    <tr>
                      <th className="w-10 p-2">
                        <Checkbox />
                      </th>
                      <th className="p-2 text-left">Data vecto</th>
                      <th className="p-2 text-left">Forma pgto</th>
                      <th className="p-2 text-left">Documento</th>
                      <th className="p-2 text-left">Categoria</th>
                      <th className="p-2 text-left">Fornecedor</th>
                      <th className="p-2 text-left">Desc Parcela</th>
                      <th className="p-2 text-right">Taxa</th>
                      <th className="p-2 text-right">Valor</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {expenseTransactions.map(transaction => (
                      <tr key={transaction.id} className="bg-white">
                        <td className="p-2">
                          <Checkbox />
                        </td>
                        <td className="p-2">{format(new Date(transaction.due_date), 'dd/MM/yyyy')}</td>
                        <td className="p-2">{transaction.payment_method}</td>
                        <td className="p-2">
                          <a href="#" className="text-blue-600">{transaction.id}</a>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            {transaction.category}
                          </Badge>
                        </td>
                        <td className="p-2">{transaction.client_name}</td>
                        <td className="p-2">0,00</td>
                        <td className="p-2 text-right text-red-500">0,00</td>
                        <td className="p-2 text-right">{transaction.amount.toFixed(2)}</td>
                        <td className="p-2 text-center">
                          {transaction.payment_date ? (
                            <Badge className="bg-green-100 text-green-800 uppercase">PAGO</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 uppercase">PENDENTE</Badge>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <Button variant="ghost" size="sm">
                            <svg 
                              className="w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 space-y-2 bg-gray-50">
                <h3 className="font-medium">Total no período</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>Pagas (R$)</div>
                  <div className="text-right">0,00</div>
                  
                  <div>A pagar (R$)</div>
                  <div className="text-right">{totalExpense.toFixed(2)}</div>
                  
                  <div>A pagar vencidas (R$)</div>
                  <div className="text-right">0,00</div>
                  
                  <div>Total de pagamentos (R$)</div>
                  <div className="text-right">{totalExpense.toFixed(2)}</div>
                  
                  <div>Taxa TED (R$)</div>
                  <div className="text-right">0,00</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">Fluxo de caixa</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="text-sm text-blue-700 font-medium">RECEITAS</div>
                    <div className="text-xl font-bold">R$ {totalIncome.toFixed(2)}</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-md">
                    <div className="text-sm text-red-700 font-medium">DESPESAS</div>
                    <div className="text-xl font-bold">R$ {totalExpense.toFixed(2)}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="text-sm text-green-700 font-medium">SALDO</div>
                    <div className="text-xl font-bold">R$ {balance.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="h-80 bg-gray-100 flex items-center justify-center rounded-md">
                  <div className="text-gray-400">
                    Gráfico de fluxo de caixa seria exibido aqui
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <IncomeDialog 
        open={newIncomeDialogOpen} 
        onOpenChange={setNewIncomeDialogOpen}
        onSuccess={() => {
          refetch();
          toast.success("Recebimento adicionado com sucesso");
        }}
      />
      
      <ExpenseDialog
        open={newExpenseDialogOpen}
        onOpenChange={setNewExpenseDialogOpen}
        onSuccess={() => {
          refetch();
          toast.success("Pagamento adicionado com sucesso");
        }}
      />
    </div>
  );
};

interface IncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const IncomeDialog: React.FC<IncomeDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [form, setForm] = useState({
    category: 'Adesões',
    description: '',
    client: '',
    account: 'Musculação',
    competenceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    value: '',
    paymentMethod: 'Transferência PIX',
    notes: '',
    repeat: false,
    received: false,
    paymentDate: new Date().toISOString().split('T')[0],
    interest: '',
    fee: '',
    receivableAmount: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real implementation, we would save the transaction to Supabase
    setTimeout(() => {
      onSuccess();
      onOpenChange(false);
      setLoading(false);
    }, 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="bg-blue-600 text-white p-4 -mx-6 -my-2">Novo recebimento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Categorias</label>
              <Select 
                value={form.category} 
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adesões">Adesões</SelectItem>
                  <SelectItem value="Mensalidades">Mensalidades</SelectItem>
                  <SelectItem value="Produtos">Produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Descrição</label>
              <Input 
                placeholder="Defina um nome" 
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Cliente</label>
              <Select 
                value={form.client} 
                onValueChange={(value) => setForm({ ...form, client: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ana Paula Rios</SelectItem>
                  <SelectItem value="2">Carlos Borges</SelectItem>
                  <SelectItem value="3">Jairo Prestes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Conta</label>
              <Select 
                value={form.account} 
                onValueChange={(value) => setForm({ ...form, account: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Musculação">Musculação</SelectItem>
                  <SelectItem value="Crossfit">Crossfit</SelectItem>
                  <SelectItem value="Pilates">Pilates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Data competência</label>
              <Input 
                type="date" 
                value={form.competenceDate}
                onChange={(e) => setForm({ ...form, competenceDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Data vencto</label>
              <Input 
                type="date" 
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Valor</label>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="0,00"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm">Forma de pagamento</label>
            <Select 
              value={form.paymentMethod} 
              onValueChange={(value) => setForm({ ...form, paymentMethod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                <SelectItem value="Transferência PIX">Transferência PIX</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm">Observações</label>
            <Textarea 
              placeholder="Observações adicionais..." 
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="repeat" 
              checked={form.repeat}
              onCheckedChange={(checked) => setForm({ ...form, repeat: checked as boolean })}
            />
            <label htmlFor="repeat" className="text-sm">Repetir</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="received" 
              checked={form.received}
              onCheckedChange={(checked) => setForm({ ...form, received: checked as boolean })}
            />
            <label htmlFor="received" className="text-sm">Recebido</label>
          </div>
          
          {form.received && (
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm">Data do pagamento</label>
                <Input 
                  type="date" 
                  value={form.paymentDate}
                  onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">Juros</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00"
                  value={form.interest}
                  onChange={(e) => setForm({ ...form, interest: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">Taxa</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">Valor a receber</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00"
                  value={form.receivableAmount}
                  onChange={(e) => setForm({ ...form, receivableAmount: e.target.value })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="submit" 
              className="bg-blue-600 text-white" 
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [form, setForm] = useState({
    category: '',
    description: '',
    supplier: '',
    account: 'Musculação',
    competenceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    value: '',
    paymentMethod: '',
    notes: '',
    paid: false,
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real implementation, we would save the transaction to Supabase
    setTimeout(() => {
      onSuccess();
      onOpenChange(false);
      setLoading(false);
    }, 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="bg-blue-600 text-white p-4 -mx-6 -my-2">Novo pagamento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Categorias</label>
              <Select 
                value={form.category} 
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                  <SelectItem value="Folha de pagamento">Folha de pagamento</SelectItem>
                  <SelectItem value="Boleto bancário">Boleto bancário</SelectItem>
                  <SelectItem value="Coaches">Coaches</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                  <SelectItem value="13º">13º</SelectItem>
                  <SelectItem value="Férias">Férias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Descrição</label>
              <Input 
                placeholder="Defina um nome" 
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Fornecedor</label>
              <Select 
                value={form.supplier} 
                onValueChange={(value) => setForm({ ...form, supplier: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Imobiliária</SelectItem>
                  <SelectItem value="2">Fornecedor de Equipamentos</SelectItem>
                  <SelectItem value="3">Serviços de Limpeza</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Conta</label>
              <Select 
                value={form.account} 
                onValueChange={(value) => setForm({ ...form, account: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Musculação">Musculação</SelectItem>
                  <SelectItem value="Crossfit">Crossfit</SelectItem>
                  <SelectItem value="Pilates">Pilates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Data competência</label>
              <Input 
                type="date" 
                value={form.competenceDate}
                onChange={(e) => setForm({ ...form, competenceDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Data vencto</label>
              <Input 
                type="date" 
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Valor</label>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="0,00"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm">Forma de pagamento</label>
            <Select 
              value={form.paymentMethod} 
              onValueChange={(value) => setForm({ ...form, paymentMethod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                <SelectItem value="Transferência PIX">Transferência PIX</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm">Observações</label>
            <Textarea 
              placeholder="Observações adicionais..." 
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="paid" 
              checked={form.paid}
              onCheckedChange={(checked) => setForm({ ...form, paid: checked as boolean })}
            />
            <label htmlFor="paid" className="text-sm">Pago</label>
          </div>
          
          {form.paid && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm">Data do pagamento</label>
                <Input 
                  type="date" 
                  value={form.paymentDate}
                  onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="submit" 
              className="bg-blue-600 text-white" 
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CashFlowPage;
