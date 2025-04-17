
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { createSubscription } from "@/api/subscriptionApi";
import { toast } from "sonner";
import { fetchUsers } from "@/api/userApi";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface NewSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  userId: string;
  startDate: Date;
  plan: string;
}

const NewSubscriptionDialog: React.FC<NewSubscriptionDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      startDate: new Date(),
      plan: "Mensal"
    },
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setError(null);
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Erro ao carregar usuários");
        setError("Erro ao carregar usuários");
      }
    };

    if (open) {
      loadUsers();
      form.reset({
        startDate: new Date(),
        plan: "Mensal"
      });
    }
  }, [open, form]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!data.userId) {
        setError("Por favor, selecione um aluno");
        setLoading(false);
        return;
      }
      
      // First update the user's plan
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ plan: data.plan })
        .eq('id', data.userId);
        
      if (updateError) {
        console.error("Error updating user plan:", updateError);
        throw new Error("Erro ao atualizar plano do usuário");
      }
      
      // Then create the subscription
      await createSubscription(data.userId, data.startDate);
      toast.success("Adesão criada com sucesso");
      onSuccess();
    } catch (error) {
      console.error("Error creating subscription:", error);
      setError("Erro ao criar assinatura para o usuário");
      toast.error("Erro ao criar adesão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Adesão</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Aluno</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={field.value ? "" : "text-muted-foreground"}
                        >
                          {field.value
                            ? users.find((user) => user.id === field.value)?.name || "Selecione um aluno"
                            : "Selecione um aluno"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar aluno..." />
                        <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                        <CommandGroup>
                          {users.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.name}
                              onSelect={() => {
                                form.setValue("userId", user.id);
                              }}
                            >
                              <Check
                                className={user.id === field.value ? "opacity-100 mr-2 h-4 w-4" : "opacity-0 mr-2 h-4 w-4"}
                              />
                              {user.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Plano</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Mensal">Mensal - R$ 100,00</SelectItem>
                      <SelectItem value="Trimestral">Trimestral - R$ 270,00</SelectItem>
                      <SelectItem value="Anual">Anual - R$ 960,00</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Início</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={field.value ? "" : "text-muted-foreground"}
                        >
                          {field.value ? (
                            format(field.value, "P", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Adesão"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewSubscriptionDialog;
