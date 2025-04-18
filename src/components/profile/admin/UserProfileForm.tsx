
import React from 'react';
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
    },
  });

  const handleAvatarUpdate = (url: string) => {
    form.setValue('avatar_url', url);
  };

  const onSubmit = (data: any) => {
    console.log('Form submitted with data:', data);
    onSave(data);
  };

  const userInitials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
