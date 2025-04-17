
import React from "react";
import { CashFlowEntry } from "@/types";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CashFlowProps {
  entries: CashFlowEntry[];
  loading: boolean;
}

const CashFlow: React.FC<CashFlowProps> = ({ entries, loading }) => {
  if (loading) {
    return <div>Carregando...</div>;
  }

  const total = entries.reduce((acc, entry) => {
    return acc + (entry.tipo === "entrada" ? entry.valor : -entry.valor);
  }, 0);

  return (
    <Card className="space-y-4">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Saldo Total: R$ {total.toFixed(2)}</h3>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                {format(new Date(entry.data_movimento), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell>{entry.tipo}</TableCell>
              <TableCell>{entry.descricao}</TableCell>
              <TableCell>{entry.categoria || "-"}</TableCell>
              <TableCell className={entry.tipo === "entrada" ? "text-green-600" : "text-red-600"}>
                R$ {entry.valor.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CashFlow;
