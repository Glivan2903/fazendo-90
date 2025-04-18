
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MovementsHeaderProps {
  onNewMovement?: () => void;
}

const MovementsHeader: React.FC<MovementsHeaderProps> = ({ onNewMovement }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-xl font-bold">Movimentações</div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">
          Exibir
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Ações
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onNewMovement}>
              <FilePlus className="mr-2 h-4 w-4" />
              Nova movimentação
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MovementsHeader;
