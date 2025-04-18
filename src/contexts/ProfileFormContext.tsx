
import React, { createContext, useContext, useState } from 'react';

interface ProfileFormContextType {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  editForm: {
    name: string;
    email: string;
    phone: string;
    birth_date: string;
  };
  setEditForm: (form: any) => void;
}

const ProfileFormContext = createContext<ProfileFormContextType | undefined>(undefined);

export const ProfileFormProvider = ({ children }: { children: React.ReactNode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: ''
  });

  return (
    <ProfileFormContext.Provider
      value={{
        isEditing,
        setIsEditing,
        editForm,
        setEditForm
      }}
    >
      {children}
    </ProfileFormContext.Provider>
  );
};

export const useProfileForm = () => {
  const context = useContext(ProfileFormContext);
  if (context === undefined) {
    throw new Error('useProfileForm must be used within a ProfileFormProvider');
  }
  return context;
};
