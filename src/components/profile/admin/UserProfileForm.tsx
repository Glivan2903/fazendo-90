
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
} from '@/components/ui/form';
import { Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import AvatarUpload from '@/components/profile/AvatarUpload';
import UserProfilePersonalInfo from './forms/UserProfilePersonalInfo';
import UserProfileSystemInfo from './forms/UserProfileSystemInfo';
import UserProfileAddressInfo from './forms/UserProfileAddressInfo';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UserProfileSubscription from './forms/UserProfileSubscription';
import { format, addDays } from 'date-fns';

interface UserProfileFormProps {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    birth_date: string | null;
    gender: string;
    address: string | null;
    plan: string | null;
    status: string;
    role: string;
    avatar_url: string | null;
    subscription_id?: string | null;
  };
  isEditing: boolean;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  profile,
  isEditing,
  onSave,
  onCancel,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [subscriptionDates, setSubscriptionDates] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: addDays(new Date(), 30).toISOString().split('T')[0],
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm({
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      birth_date: profile.birth_date || '',
      gender: profile.gender || 'Outro',
      address: profile.address || '',
      plan: profile.plan || '',
      status: profile.status || 'Ativo',
      role: profile.role || 'student',
      avatar_url: profile.avatar_url,
      subscription_id: profile.subscription_id || null,
    },
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['plans-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data;
    },
  });

  const { data: currentSubscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['user-subscription', profile.id],
    queryFn: async () => {
      if (!profile.subscription_id) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans (
            id,
            name,
            amount,
            periodicity,
            days_validity,
            check_in_limit_type
          )
        `)
        .eq('id', profile.subscription_id)
        .single();
        
      if (error) return null;
      return data;
    },
    enabled: !!profile.subscription_id,
  });

  const handleAvatarUpdate = (url: string) => {
    form.setValue('avatar_url', url);
  };

  const handlePlanChange = (planId: string | null) => {
    setSelectedPlan(planId);
    
    if (planId) {
      const plan = plans?.find(p => p.id === planId);
      if (plan) {
        // Calculate end date based on plan days_validity
        const startDate = new Date();
        const endDate = addDays(startDate, plan.days_validity || 30);
        
        setSubscriptionDates({
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
        });
      }
    }
  };

  const createPayment = async (userId: string, subscriptionId: string, planData: any) => {
    try {
      // Get the plan price
      const amount = planData.amount;
      const dueDate = new Date();
      
      const paymentData = {
        user_id: userId,
        subscription_id: subscriptionId,
        amount: amount,
        status: 'pending',
        due_date: format(dueDate, 'yyyy-MM-dd'),
        payment_date: null,
        payment_method: null,
        notes: `Pagamento automático - Plano ${planData.name}`
      };
      
      const { error } = await supabase
        .from('payments')
        .insert([paymentData]);
        
      if (error) throw error;
      
      console.log("Payment created for subscription", subscriptionId);
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Erro ao criar pagamento para a assinatura");
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsProcessing(true);
      let updatedData = { ...data };
      
      // If a new plan was selected, create a subscription
      if (selectedPlan) {
        const selectedPlanData = plans?.find(p => p.id === selectedPlan);
        
        if (!selectedPlanData) {
          toast.error("Plano selecionado não encontrado");
          setIsProcessing(false);
          return;
        }
        
        console.log("Creating new subscription with plan:", selectedPlanData);
        console.log("Subscription dates:", subscriptionDates);
        
        const { data: newSubscription, error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: profile.id,
            plan_id: selectedPlan,
            start_date: subscriptionDates.start_date,
            end_date: subscriptionDates.end_date,
            status: 'active'
          }])
          .select('id')
          .single();
          
        if (subscriptionError) {
          console.error("Error creating subscription:", subscriptionError);
          throw subscriptionError;
        }
        
        console.log("New subscription created:", newSubscription);
        
        // Update the subscription_id in the form data
        updatedData.subscription_id = newSubscription.id;
        updatedData.plan = selectedPlanData.name;
        updatedData.status = 'Ativo'; // Set user to active when a new subscription is created
        
        // Create payment entry for the new subscription
        await createPayment(profile.id, newSubscription.id, selectedPlanData);
      }
      
      // Update profile in Supabase
      console.log('Form submitted with data:', updatedData);
      await onSave(updatedData);
      
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error('Error saving profile with subscription:', error);
      toast.error(`Erro ao salvar perfil: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const userInitials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  // Check if the current subscription is expired
  const isSubscriptionExpired = currentSubscription && 
    currentSubscription.status === 'expired' ||
    (currentSubscription?.end_date && new Date(currentSubscription.end_date) < new Date());

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-center mb-6">
          <AvatarUpload
            avatarUrl={profile.avatar_url}
            userId={profile.id}
            userInitials={userInitials}
            onAvatarUpdate={handleAvatarUpdate}
          />
        </div>

        {isSubscriptionExpired && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Este usuário possui uma assinatura vencida. Atualize o plano para reativar o acesso.</span>
          </div>
        )}

        <UserProfilePersonalInfo form={form} isEditing={isEditing} />
        <UserProfileSystemInfo form={form} isEditing={isEditing} />
        <UserProfileAddressInfo form={form} isEditing={isEditing} />
        
        <UserProfileSubscription 
          profile={profile}
          currentSubscription={currentSubscription}
          plans={plans || []}
          isLoading={plansLoading || subscriptionLoading}
          onPlanChange={handlePlanChange}
          subscriptionData={subscriptionDates}
          setSubscriptionData={setSubscriptionDates}
        />

        {isEditing && (
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isProcessing}>
              <Save className="w-4 h-4 mr-2" />
              {isProcessing ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default UserProfileForm;
