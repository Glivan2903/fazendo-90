import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarRange, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentTable } from './PaymentTable';
import { PaymentFilters } from './PaymentFilters';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import NewPaymentDialog from './NewPaymentDialog';

const PaymentHistory = () => {
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const {
    payments,
    isLoading,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    statusFilter,
    setStatusFilter,
    refetch
  } = usePaymentHistory();

  const handleNewPayment = () => {
    setIsNewPaymentOpen(true);
  };

  const paymentCount = payments?.length || 0;
  const showingStart = paymentCount > 0 ? 1 : 0;
  const showingEnd = paymentCount;

  if (isLoading) {
    return (
      <div className="space-y-4 w-full">
        <h2 className="text-lg sm:text-xl font-semibold">Histórico de Pagamentos</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Pagamentos dos Alunos</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Exibindo {showingStart}-{showingEnd} de {paymentCount} itens
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none text-sm items-center justify-center"
          >
            <CalendarRange className="h-4 w-4 mr-2" />
            {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
          </Button>
          <Button 
            className="flex-1 sm:flex-none text-sm items-center justify-center" 
            onClick={handleNewPayment}
          >
            <Plus className="h-4 w-4 mr-2" /> Novo
          </Button>
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-2 sm:p-6">
          <PaymentFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            className="w-full px-1 sm:px-0"
          />
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <PaymentTable payments={payments} />
          </div>
        </CardContent>
      </Card>

      <NewPaymentDialog 
        open={isNewPaymentOpen}
        onOpenChange={setIsNewPaymentOpen}
        onPaymentCreated={refetch}
      />
    </div>
  );
};

export default PaymentHistory;
