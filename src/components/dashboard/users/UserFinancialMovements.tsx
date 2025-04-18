
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useMovements } from '@/hooks/useMovements';
import { MovementsTable } from './components/MovementsTable';
import MovementsHeader from './components/MovementsHeader';
import SalesDetailDialog from '@/components/financial/SalesDetailDialog';

interface UserFinancialMovementsProps {
  userId: string | null;
}

const UserFinancialMovements: React.FC<UserFinancialMovementsProps> = ({ userId }) => {
  const { movements, loading, formatCurrency } = useMovements(userId);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isSalesDialogOpen, setIsSalesDialogOpen] = useState(false);

  const handleSaleClick = (movement: any) => {
    setSelectedSale(movement);
    setIsSalesDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <MovementsHeader />
      </CardHeader>
      <CardContent>
        {loading ? (
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
    </Card>
  );
};

export default UserFinancialMovements;
