
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Clock } from "lucide-react";

interface CheckInSettingsProps {
  settings: {
    enableLimitedCheckins: boolean;
    enableReservation: boolean;
    openCheckInMinutes: number;
    closeCheckInMinutes: number;
    closeCheckInWhen: 'before' | 'after';
    cancelMinutes: number;
    enableAutoCancel: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

const CheckInSettings: React.FC<CheckInSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const handleToggleChange = (field: string) => (checked: boolean) => {
    onSettingsChange({ ...settings, [field]: checked });
  };

  const handleNumberChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onSettingsChange({ ...settings, [field]: value });
    }
  };

  const handleSelectChange = (field: string) => (value: string) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6 mt-6 border-t pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-medium text-blue-800">Reservas & Check-in</h3>
        </div>
        <p className="text-sm text-gray-500">Configure se a classe terá reserva e suas configurações.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="limited-checkins" className="cursor-pointer">Não contar checkin em adesões limitadas</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-60">Quando ativado, os check-ins desta aula não serão contabilizados para alunos com planos de adesão limitada.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch
            id="limited-checkins"
            checked={settings.enableLimitedCheckins}
            onCheckedChange={handleToggleChange('enableLimitedCheckins')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="enable-reservation" className="cursor-pointer">Habilitar reserva</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-60">Quando ativado, os alunos poderão reservar vagas nesta aula antecipadamente.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch
            id="enable-reservation"
            checked={settings.enableReservation}
            onCheckedChange={handleToggleChange('enableReservation')}
          />
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Limite de check-ins</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="w-24 text-sm">Abrir check-in</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  className="w-20"
                  value={settings.openCheckInMinutes}
                  onChange={handleNumberChange('openCheckInMinutes')}
                />
                <Select
                  value="minutos"
                  disabled
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutos">minutos</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm">antes da aula.</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Quantos minutos antes do início da aula o check-in estará disponível.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="w-24 text-sm">Fechar check-in</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  className="w-20"
                  value={settings.closeCheckInMinutes}
                  onChange={handleNumberChange('closeCheckInMinutes')}
                />
                <Select
                  value="minutos"
                  disabled
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutos">minutos</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={settings.closeCheckInWhen}
                  onValueChange={handleSelectChange('closeCheckInWhen')}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">antes</SelectItem>
                    <SelectItem value="after">depois</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm">da aula.</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Quando o check-in será fechado em relação ao horário da aula.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="w-24 text-sm">Cancelamento</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  className="w-20"
                  value={settings.cancelMinutes}
                  onChange={handleNumberChange('cancelMinutes')}
                />
                <Select
                  value="minutos"
                  disabled
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutos">minutos</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm">antes da aula.</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Até quantos minutos antes do início da aula o aluno poderá cancelar seu check-in.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Cancelamento automático</h4>
              <p className="text-xs text-gray-500">Programe para que a classe seja cancelada caso não tenha nenhuma reserva/check-in.</p>
            </div>
            <Switch
              id="auto-cancel"
              checked={settings.enableAutoCancel}
              onCheckedChange={handleToggleChange('enableAutoCancel')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInSettings;
