
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
}

export const PaymentFilters = ({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange
}: PaymentFiltersProps) => {
  return (
    <div className="flex space-x-4 mb-4">
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
        </SelectContent>
      </Select>
    </div>
  );
};
