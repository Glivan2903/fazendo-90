
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ClassDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classData: {
    date: string;
    programName: string;
    startTime: string;
    endTime: string;
    coachName: string;
    attendees: Array<{
      id: string;
      name: string;
      avatarUrl?: string;
    }>;
    maxCapacity: number;
  };
}

const ClassDetailsDialog: React.FC<ClassDetailsDialogProps> = ({
  isOpen,
  onClose,
  classData
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Aula</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-lg font-semibold">
              {format(new Date(classData.date), 'dd/MM/yyyy', { locale: ptBR })} • {classData.startTime}-{classData.endTime} • {classData.programName}
            </p>
          </div>

          <div className="bg-muted/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground">Professor:</div>
              <div className="font-medium">{classData.coachName}</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">Alunos</h3>
              <span className="text-muted-foreground">
                {classData.attendees.length}/{classData.maxCapacity} presentes
              </span>
            </div>

            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <div className="space-y-4">
                {classData.attendees.map((attendee) => (
                  <div key={attendee.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(attendee.name)}</AvatarFallback>
                    </Avatar>
                    <span>{attendee.name}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDetailsDialog;
