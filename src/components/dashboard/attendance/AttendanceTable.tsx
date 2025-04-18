
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  class_name: string;
  coach_name: string;
  present: number;
  absent: number;
  total: number;
  rate: number;
}

interface AttendanceTableProps {
  data: AttendanceRecord[];
  onViewDetails: (classId: string) => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ data, onViewDetails }) => {
  return (
    <Card className="mb-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Aula</TableHead>
              <TableHead>Professor</TableHead>
              <TableHead>Presentes</TableHead>
              <TableHead>Ausentes</TableHead>
              <TableHead>Taxa</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {format(new Date(record.date), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>{record.class_name}</TableCell>
                <TableCell>{record.coach_name}</TableCell>
                <TableCell>{record.present}</TableCell>
                <TableCell>{record.absent}</TableCell>
                <TableCell>{record.rate}%</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(record.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default AttendanceTable;
