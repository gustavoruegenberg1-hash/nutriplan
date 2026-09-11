import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MacroChartProps {
  protein: number;
  carbs: number;
  fat: number;
}

export const MacroChart: React.FC<MacroChartProps> = ({ protein, carbs, fat }) => {
  const proteinCal = protein * 4;
  const carbsCal = carbs * 4;
  const fatCal = fat * 9;
  const totalCal = proteinCal + carbsCal + fatCal;

  const data = [
    { name: 'Proteína', value: proteinCal, grams: protein, color: '#F43F5E' },
    { name: 'Carboidratos', value: carbsCal, grams: carbs, color: '#3B82F6' },
    { name: 'Gorduras', value: fatCal, grams: fat, color: '#F59E0B' },
  ];

  if (totalCal === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-slate-500">
        Nenhum alimento adicionado
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const pct = totalCal > 0 ? Math.round((item.value / totalCal) * 100) : 0;
                  return (
                    <div className="bg-surface border border-surface-border p-2.5 rounded-xl shadow-2xl text-xs">
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-slate-300">
                        {Math.round(item.grams * 10) / 10}g ({Math.round(item.value)} kcal)
                      </p>
                      <p className="text-emerald-400 font-semibold">{pct}% das calorias</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs mt-1">
        {data.map((item) => {
          const pct = totalCal > 0 ? Math.round((item.value / totalCal) * 100) : 0;
          return (
            <div key={item.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300">{item.name}:</span>
              <span className="font-semibold text-white">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
