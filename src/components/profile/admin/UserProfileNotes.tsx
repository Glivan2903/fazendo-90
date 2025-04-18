
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface UserProfileNotesProps {
  notes: string | null;
  isEditing: boolean;
  onSave: (notes: string) => void;
}

const UserProfileNotes: React.FC<UserProfileNotesProps> = ({
  notes,
  isEditing,
  onSave,
}) => {
  const [currentNotes, setCurrentNotes] = useState(notes || '');

  const handleSave = () => {
    onSave(currentNotes);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Anotações</h3>
      <Textarea
        value={currentNotes}
        onChange={(e) => setCurrentNotes(e.target.value)}
        disabled={!isEditing}
        className="min-h-[200px]"
        placeholder="Adicione anotações sobre o aluno..."
      />
      {isEditing && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Anotações
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserProfileNotes;
