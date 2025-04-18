
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye } from 'lucide-react';
import ClassDetailsDialog from './ClassDetailsDialog';
import { supabase } from '@/integrations/supabase/client';

interface AttendanceRecord {
  id: string;
  date: string;
  class: string;
  coach: string;
  present: number;
  absent: number;
  rate: number;
  total: number;
}

interface AttendanceTableProps {
  data: AttendanceRecord[];
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ data }) => {
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = async (record: AttendanceRecord) => {
    // Fetch detailed class information including attendees
    const { data: classDetails } = await supabase
      .from('checkins')
      .select(`
        id,
        classes!inner (
          id,
          date,
          start_time,
          end_time,
          max_capacity,
          programs (name),
          profiles!coach_id (name)
        ),
        profiles!user_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('classes.id', record.id);

    if (classDetails && classDetails[0]) {
      const classData = {
        date: record.date,
        programName: record.class,
        startTime: classDetails[0].classes.start_time,
        endTime: classDetails[0].classes.end_time,
        coachName: record.coach,
        maxCapacity: record.total,
        attendees: classDetails.map(checkin => ({
          id: checkin.profiles.id,
          name: checkin.profiles.name,
          avatarUrl: checkin.profiles.avatar_url
        }))
      };
      setSelectedClass(classData);
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Aula</TableHead>
            <TableHead>Professor</TableHead>
            <TableHead className="text-center">Presentes</TableHead>
            <TableHead className="text-center">Ausentes</TableHead>
            <TableHead className="text-center">Taxa</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record) => (
            <TableRow key={`${record.date}-${record.class}`}>
              <TableCell>
                {format(new Date(record.date), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell>{record.class}</TableCell>
              <TableCell>{record.coach}</TableCell>
              <TableCell className="text-center">{record.present}</TableCell>
              <TableCell className="text-center">{record.absent}</TableCell>
              <TableCell className="text-center">{record.rate}%</TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(record)}
                >
                  <Eye className="h-4 w-4" />
                  Detalhes
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedClass && (
        <ClassDetailsDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedClass(null);
          }}
          classData={selectedClass}
        />
      )}
    </>
  );
};

export default AttendanceTable;
