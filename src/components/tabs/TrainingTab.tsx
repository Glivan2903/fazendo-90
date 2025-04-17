
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const TrainingTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Treinos</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-gray-500">
          <p>Você ainda não tem treinos registrados.</p>
          <p>Comece a fazer check-in nas aulas!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingTab;
