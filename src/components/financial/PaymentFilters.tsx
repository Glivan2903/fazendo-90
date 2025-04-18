
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface PaymentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const PaymentFilters = ({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange
}: PaymentFiltersProps) => {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por nome ou plano..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select
        value={dateRange}
        onValueChange={onDateRangeChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current">Mês Atual</SelectItem>
          <SelectItem value="previous">Mês Anterior</SelectItem>
          <SelectItem value="next">Próximo Mês</SelectItem>
          <SelectItem value="last3">Últimos 3 Meses</SelectItem>
          <SelectItem value="all">Todos</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={statusFilter}
        onValueChange={onStatusFilterChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status">
            {statusFilter === "all" && "Todos os Status"}
            {statusFilter === "paid" && 
              <div className="flex items-center">
                <Badge className="bg-green-100 text-green-800 mr-2">Pago</Badge>
                Status
              </div>
            }
            {statusFilter === "pending" && 
              <div className="flex items-center">
                <Badge className="bg-amber-100 text-amber-800 mr-2">Pendente</Badge>
                Status
              </div>
            }
            {statusFilter === "overdue" && 
              <div className="flex items-center">
                <Badge className="bg-red-100 text-red-800 mr-2">Atrasado</Badge>
                Status
              </div>
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="paid">Pagos</SelectItem>
          <SelectItem value="pending">Pendentes</SelectItem>
          <SelectItem value="overdue">Atrasados</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
