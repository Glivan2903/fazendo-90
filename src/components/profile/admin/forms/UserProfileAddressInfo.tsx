
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface UserProfileAddressInfoProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

const UserProfileAddressInfo: React.FC<UserProfileAddressInfoProps> = ({
  form,
  isEditing,
}) => {
  return (
    <FormField
      control={form.control}
      name="address"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Endereço</FormLabel>
          <FormControl>
            <Input {...field} disabled={!isEditing} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default UserProfileAddressInfo;
