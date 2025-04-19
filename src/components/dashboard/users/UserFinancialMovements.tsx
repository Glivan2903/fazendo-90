
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMovements } from '@/hooks/useMovements';
import { MovementsTable } from './components/MovementsTable';
import MovementsHeader from './components/MovementsHeader';
import SalesDetailDialog from '@/components/financial/SalesDetailDialog';
import NewPaymentDialog from '@/components/financial/NewPaymentDialog';
import { AlertCircle, BadgeDollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserFinancialMovementsProps {
  userId: string | null;
}

const UserFinancialMovements: React.FC<UserFinancialMovementsProps> = ({ userId }) => {
  const { movements, loading, formatCurrency, refreshMovements, error } = useMovements(userId);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isSalesDialogOpen, setIsSalesDialogOpen] = useState(false);
  const [isNewPaymentDialogOpen, setIsNewPaymentDialogOpen] = useState(false);

  const handleSaleClick = (movement: any) => {
    setSelectedSale(movement);
    setIsSalesDialogOpen(true);
  };
  
  const handleNewMovement = () => {
    setIsNewPaymentDialogOpen(true);
  };
  
  const handlePaymentCreated = () => {
    refreshMovements();
  };
  
  const pendingPayments = movements.filter(m => m.status === 'pending' || m.status === 'overdue').length;
  const totalPayments = movements.length;
  
  const pendingAmount = movements
    .filter(m => m.status === 'pending' || m.status === 'overdue')
    .reduce((sum, m) => sum + m.amount, 0);

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl flex items-center">
              <BadgeDollarSign className="mr-2 h-5 w-5 text-blue-600" />
              Movimentações Financeiras
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {totalPayments > 0 
                ? `${totalPayments} movimentações encontradas${pendingPayments > 0 ? ` • ${pendingPayments} pendentes` : ''}`
                : 'Nenhuma movimentação registrada'}
            </p>
          </div>
          <MovementsHeader onNewMovement={handleNewMovement} />
        </div>
        
        {pendingPayments > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
              <div>
                <p className="text-amber-800 font-medium">Pagamentos pendentes</p>
                <p className="text-sm text-amber-700">
                  Este aluno possui {pendingPayments} {pendingPayments === 1 ? 'pagamento pendente' : 'pagamentos pendentes'} 
                  no valor total de {formatCurrency(pendingAmount)}
                </p>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-800">
              {formatCurrency(pendingAmount)}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-2" />
            <h3 className="text-lg font-medium">Erro ao carregar movimentações</h3>
            <p className="text-gray-500">{error.message}</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <MovementsTable 
            movements={movements}
            onSaleClick={handleSaleClick}
            formatCurrency={formatCurrency}
          />
        )}
      </CardContent>

      {selectedSale && (
        <SalesDetailDialog 
          open={isSalesDialogOpen}
          onOpenChange={setIsSalesDialogOpen}
          salesData={selectedSale}
        />
      )}
      
      {userId && (
        <NewPaymentDialog
          open={isNewPaymentDialogOpen}
          onOpenChange={setIsNewPaymentDialogOpen}
          userId={userId}
          onPaymentCreated={handlePaymentCreated}
          selectedUserOnly={true}
        />
      )}
    </Card>
  );
};

export default UserFinancialMovements;
