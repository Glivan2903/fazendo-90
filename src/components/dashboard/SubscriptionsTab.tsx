
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, RefreshCw, Search, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchSubscriptions, renewSubscription } from "@/api/subscriptionApi";
import { toast } from "sonner";
import NewSubscriptionDialog from "./NewSubscriptionDialog";
import { Subscription } from "@/api/subscriptionApi";

const SubscriptionsTab = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);

  const loadSubscriptions = async () => {
    try {
      const data = await fetchSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      toast.error("Erro ao carregar adesões");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleRenewSubscription = async (userId: string) => {
    try {
      await renewSubscription(userId);
      toast.success("Adesão renovada com sucesso");
      loadSubscriptions();
    } catch (error) {
      toast.error("Erro ao renovar adesão");
    }
  };

  const getStatusBadge = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const isExpired = end < today;

    if (isExpired) {
      return (
        <div className="flex items-center text-red-500">
          <XCircle className="w-4 h-4 mr-1" />
          Vencido
        </div>
      );
    }

    return (
      <div className="flex items-center text-green-500">
        <CheckCircle2 className="w-4 h-4 mr-1" />
        Ativo
      </div>
    );
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const today = new Date();
    const endDate = new Date(sub.end_date);
    const isActive = endDate >= today;

    switch (filter) {
      case "active":
        return matchesSearch && isActive;
      case "expired":
        return matchesSearch && !isActive;
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="expired">Vencidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Adesão
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>{sub.profiles?.name}</TableCell>
                <TableCell>
                  {format(new Date(sub.start_date), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {format(new Date(sub.end_date), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {getStatusBadge(sub.end_date)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRenewSubscription(sub.user_id)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Renovar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredSubscriptions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>Nenhuma adesão encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewSubscriptionDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={() => {
          loadSubscriptions();
          setShowNewDialog(false);
        }}
      />
    </div>
  );
};

export default SubscriptionsTab;
