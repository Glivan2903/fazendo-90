
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock } from 'lucide-react';

interface UserHistory {
  date: string;
  class_name: string;
  coach_name: string;
  checked_in_at: string;
}

interface UserHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  history: UserHistory[];
}

const UserHistoryDialog: React.FC<UserHistoryDialogProps> = ({
  isOpen,
  onClose,
  userName,
  history
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Histórico de Check-ins - {userName}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Aula</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Horário do Check-in</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {format(new Date(item.date), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell>{item.class_name}</TableCell>
                  <TableCell>{item.coach_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {format(new Date(item.checked_in_at), 'HH:mm', { locale: ptBR })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserHistoryDialog;
