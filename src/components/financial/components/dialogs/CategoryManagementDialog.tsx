
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CategoryManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onCategoryCreated: () => void;
}

const CategoryManagementDialog: React.FC<CategoryManagementDialogProps> = ({
  isOpen,
  onClose,
  categories,
  onCategoryCreated
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      toast.error('Digite um nome para a categoria');
      return;
    }

    setIsAdding(true);
    try {
      // Create a dummy transaction with the new category to establish it
      const dummyTransaction = {
        due_date: new Date().toISOString(),
        total_amount: 0,
        discount_amount: 0,
        status: 'draft',
        buyer_name: 'Sistema',
        user_id: '00000000-0000-0000-0000-000000000000', // Placeholder user ID
        invoice_number: `CAT-${Date.now()}`,
        transaction_type: 'system',
        category: newCategory.trim(),
        description: 'Categoria criada pelo sistema',
        sale_date: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase
        .from('bank_invoices')
        .insert([dummyTransaction]);

      if (error) throw error;

      toast.success('Categoria criada com sucesso!');
      setNewCategory('');
      onCategoryCreated();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Erro ao criar categoria');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleAddCategory} className="flex space-x-2">
            <div className="flex-grow">
              <Label htmlFor="newCategory" className="sr-only">Nova Categoria</Label>
              <Input
                id="newCategory"
                placeholder="Nova categoria..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </form>

          <div className="border rounded-md">
            <div className="py-2 px-4 bg-gray-50 border-b font-medium">
              Categorias existentes
            </div>
            <div className="p-2 max-h-[250px] overflow-y-auto">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border-b last:border-0">
                    <span>{category}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma categoria encontrada
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManagementDialog;
