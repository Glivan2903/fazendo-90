
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Histórico de Pagamentos</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const paymentCount = payments?.length || 0;
  const pendingCount = payments?.filter(p => p.status === 'pending' || p.status === 'overdue').length || 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Histórico de Pagamentos</h2>
          <p className="text-sm text-gray-500">
            {paymentCount} pagamentos encontrados 
            {pendingCount > 0 && ` • ${pendingCount} pendentes`}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center">
            <CalendarRange className="h-4 w-4 mr-2" />
            {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
          </Button>
          <Button className="flex items-center" onClick={handleNewPayment}>
            <Plus className="h-4 w-4 mr-2" /> Novo Pagamento
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <PaymentFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
          <PaymentTable payments={payments} />
        </CardContent>
      </Card>

      <NewPaymentDialog 
        isOpen={isNewPaymentOpen}
        onClose={() => setIsNewPaymentOpen(false)}
        onPaymentCreated={refetch}
      />
    </div>
  );
};

export default PaymentHistory;
