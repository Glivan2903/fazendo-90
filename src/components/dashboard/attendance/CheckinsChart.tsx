
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CheckinsChartProps {
  data: Array<{ check_date: string; checkin_count: number }>;
}

const CheckinsChart: React.FC<CheckinsChartProps> = ({ data }) => {
  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.check_date), 'dd/MM', { locale: ptBR }),
  }));

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Check-ins nos Últimos 30 Dias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="checkin_count"
                stroke="#8884d8"
                fill="#8884d8"
                name="Check-ins"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckinsChart;
