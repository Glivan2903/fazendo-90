
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface CheckIn {
  date: string;
  class_name: string;
  coach_name: string;
  checked_in_at: string;
  status: string;
}

interface UserCheckinHistoryProps {
  userId: string | null;
  checkins: CheckIn[];
}

const UserCheckinHistory: React.FC<UserCheckinHistoryProps> = ({ userId, checkins }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(checkins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCheckins = checkins.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: ptBR });
    } catch (error) {
      return '--:--';
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'confirmed' || status === 'check-in') {
      return (
        <Badge className="bg-green-100 text-green-800">CHECK-IN</Badge>
      );
    } else if (status === 'canceled') {
      return (
        <Badge variant="destructive">CANCELAMENTO</Badge>
      );
    } else if (status === 'late_cancel') {
      return (
        <Badge className="bg-gray-100 text-gray-800">CANCELAMENTO TARDIO</Badge>
      );
    } else {
      return (
        <Badge variant="outline">{status.toUpperCase()}</Badge>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Histórico de Check-ins</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-blue-600 text-white">
              <TableRow>
                <TableHead className="text-white">Data da classe</TableHead>
                <TableHead className="text-white">Programa</TableHead>
                <TableHead className="text-white">Início</TableHead>
                <TableHead className="text-white">Origem</TableHead>
                <TableHead className="text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCheckins.length > 0 ? (
                currentCheckins.map((checkin, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatDate(checkin.date)}
                      </div>
                    </TableCell>
                    <TableCell>{checkin.class_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatTime(checkin.checked_in_at)}
                      </div>
                    </TableCell>
                    <TableCell>Aplicativo</TableCell>
                    <TableCell>{getStatusBadge(checkin.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Nenhum check-in registrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Lógica para mostrar apenas algumas páginas quando há muitas
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                  }
                  
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Mostrando {startIndex + 1} a {Math.min(endIndex, checkins.length)} de {checkins.length} registros
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCheckinHistory;
