
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import NewSaleDialog from "@/components/financial/NewSaleDialog";
import { useSales } from "@/hooks/useSales";

interface UserSalesProps {
  userId: string;
  userName: string;
}

const UserSales: React.FC<UserSalesProps> = ({ userId, userName }) => {
  const [showNewSale, setShowNewSale] = React.useState(false);
  const { sales, isLoading, refetch } = useSales(userId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vendas</h2>
        <Button onClick={() => setShowNewSale(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      {sales?.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma venda encontrada
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sales?.map((sale) => (
            <Card key={sale.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Venda #{sale.sale_code}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sale.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(sale.total)}</p>
                    <p className="text-sm text-muted-foreground">{sale.status}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Items */}
                  <div>
                    <h4 className="font-medium mb-2">Itens</h4>
                    <div className="space-y-2">
                      {sale.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.description}</span>
                          <span>{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payments */}
                  <div>
                    <h4 className="font-medium mb-2">Pagamentos</h4>
                    <div className="space-y-2">
                      {sale.payments.map((payment: any) => (
                        <div key={payment.id} className="flex justify-between text-sm">
                          <span>
                            {format(new Date(payment.due_date), 'dd/MM/yyyy')} - 
                            {payment.payment_method}
                          </span>
                          <span>{formatCurrency(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NewSaleDialog
        open={showNewSale}
        onOpenChange={setShowNewSale}
        userId={userId}
        userName={userName}
        onSuccess={refetch}
      />
    </div>
  );
};

export default UserSales;
