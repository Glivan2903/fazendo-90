
import React from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface AttendanceTabProps {
  attendanceData: any[];
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({ attendanceData }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Controle de Presença</h2>
          <p className="text-gray-500">Registros de presença dos alunos</p>
        </div>
        <div className="flex gap-2">
          <select className="p-2 border rounded">
            <option>Todas as aulas</option>
            <option>CrossFit</option>
            <option>Musculation</option>
          </select>
          <input type="date" className="p-2 border rounded" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
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
              {attendanceData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{item.class}</TableCell>
                  <TableCell>{item.coach}</TableCell>
                  <TableCell>{item.present}</TableCell>
                  <TableCell>{item.absent}</TableCell>
                  <TableCell>{Math.round((item.present / item.total) * 100)}%</TableCell>
                  <TableCell>
                    <button className="p-1 text-blue-600 hover:text-blue-800">Detalhes</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTab;
