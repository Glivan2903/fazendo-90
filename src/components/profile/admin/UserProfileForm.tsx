
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
} from '@/components/ui/form';
import { Save } from 'lucide-react';
import AvatarUpload from '@/components/profile/AvatarUpload';
import UserProfilePersonalInfo from './forms/UserProfilePersonalInfo';
import UserProfileSystemInfo from './forms/UserProfileSystemInfo';
import UserProfileAddressInfo from './forms/UserProfileAddressInfo';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UserProfileSubscription from './forms/UserProfileSubscription';

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
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  });

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
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + (plan.days_validity || 30));
        
        setSubscriptionDates({
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        });
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      let updatedData = { ...data };
      
      // If a new plan was selected, create a subscription
      if (selectedPlan) {
        const { data: newSubscription, error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: profile.id,
            plan_id: selectedPlan,
            start_date: new Date(subscriptionDates.start_date).toISOString(),
            end_date: new Date(subscriptionDates.end_date).toISOString(),
            status: 'active'
          }])
          .select('id')
          .single();
          
        if (subscriptionError) throw subscriptionError;
        
        // Update the subscription_id in the form data
        updatedData.subscription_id = newSubscription.id;
        
        // Get plan name to update profile.plan
        const selectedPlanData = plans?.find(p => p.id === selectedPlan);
        if (selectedPlanData) {
          updatedData.plan = selectedPlanData.name;
        }
      }
      
      console.log('Form submitted with data:', updatedData);
      onSave(updatedData);
    } catch (error) {
      console.error('Error saving profile with subscription:', error);
    }
  };

  const userInitials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

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

        <UserProfilePersonalInfo form={form} isEditing={isEditing} />
        <UserProfileSystemInfo form={form} isEditing={isEditing} />
        <UserProfileAddressInfo form={form} isEditing={isEditing} />
        
        {isEditing && (
          <UserProfileSubscription 
            profile={profile}
            currentSubscription={currentSubscription}
            plans={plans || []}
            isLoading={plansLoading || subscriptionLoading}
            onPlanChange={handlePlanChange}
            subscriptionData={subscriptionDates}
            setSubscriptionData={setSubscriptionDates}
          />
        )}

        {isEditing && (
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default UserProfileForm;
