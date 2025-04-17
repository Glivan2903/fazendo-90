
import React from "react";
import { FinancialPlan } from "@/types";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PlansListProps {
  plans: FinancialPlan[];
  loading: boolean;
}

const PlansList: React.FC<PlansListProps> = ({ plans, loading }) => {
  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Duração (dias)</TableHead>
            <TableHead>Descrição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell>{plan.nome}</TableCell>
              <TableCell>R$ {plan.valor.toFixed(2)}</TableCell>
              <TableCell>{plan.duracao_dias}</TableCell>
              <TableCell>{plan.descricao || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default PlansList;
