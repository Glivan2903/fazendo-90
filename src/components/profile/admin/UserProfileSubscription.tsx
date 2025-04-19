
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  CalendarIcon,
  Loader2,
  CreditCard,
  RefreshCw,
  Clock,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProfileSubscriptionProps {
  profile: {
    id: string;
    plan: string | null;
    subscription_id?: string | null;
  };
  currentSubscription: any | null;
  plans: Array<{
    id: string;
    name: string;
    amount: number;
    periodicity: string;
    days_validity?: number;
    check_in_limit_type?: string;
    description?: string;
    enrollment_fee?: number;
  }>;
  isLoading: boolean;
  onPlanChange: (planId: string | null) => void;
  subscriptionData: {
    start_date: string;
    end_date: string;
  };
  setSubscriptionData: React.Dispatch<React.SetStateAction<{
    start_date: string;
    end_date: string;
  }>>;
}

const UserProfileSubscription: React.FC<UserProfileSubscriptionProps> = ({
  profile,
  currentSubscription,
  plans,
  isLoading,
  onPlanChange,
  subscriptionData,
  setSubscriptionData
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Informações de Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Informações de Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentSubscription ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between bg-muted/50 p-4 rounded-lg">
              <div>
                <h3 className="font-medium">Plano Atual</h3>
                <p className="text-xl font-semibold">{currentSubscription.plans?.name}</p>
                <div className="flex items-center mt-2">
                  <Badge className="mr-2">
                    {currentSubscription.plans?.periodicity}
                  </Badge>
                  <Badge variant="outline" className={
                    currentSubscription.status === 'active' ? 
                    'bg-green-100 text-green-800' : 
                    'bg-amber-100 text-amber-800'
                  }>
                    {currentSubscription.status === 'active' ? 'Ativo' : 'Pendente'}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 text-right space-y-1">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">Valor</span>
                  <span className="font-medium">R$ {currentSubscription.plans?.amount?.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-end text-sm">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatDate(currentSubscription.start_date)} - {formatDate(currentSubscription.end_date)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Label className="text-sm font-medium mb-2 block">Alterar Plano</Label>
              <Select 
                onValueChange={(value) => onPlanChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - R$ {plan.amount.toFixed(2)} ({plan.periodicity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.plan ? (
              <div className="flex items-center justify-center p-4 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="h-5 w-5 mr-2" />
                <p>
                  Este usuário possui um plano ({profile.plan}) mas não tem uma assinatura ativa. 
                  Você pode adicionar uma nova assinatura abaixo.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center p-4 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                <XCircle className="h-5 w-5 mr-2" />
                <p>Este usuário não possui um plano ou assinatura ativa</p>
              </div>
            )}

            <div className="pt-2">
              <Label className="text-sm font-medium mb-2 block">Adicionar Assinatura</Label>
              <Select 
                onValueChange={(value) => onPlanChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - R$ {plan.amount.toFixed(2)} ({plan.periodicity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Date controls for new subscription */}
        {subscriptionData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {subscriptionData.start_date ? (
                      format(new Date(subscriptionData.start_date), 'PPP', { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={new Date(subscriptionData.start_date)}
                    onSelect={(date) => {
                      if (date) {
                        setSubscriptionData({
                          ...subscriptionData,
                          start_date: date.toISOString().split('T')[0]
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">Data de término</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {subscriptionData.end_date ? (
                      format(new Date(subscriptionData.end_date), 'PPP', { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={new Date(subscriptionData.end_date)}
                    onSelect={(date) => {
                      if (date) {
                        setSubscriptionData({
                          ...subscriptionData,
                          end_date: date.toISOString().split('T')[0]
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfileSubscription;
