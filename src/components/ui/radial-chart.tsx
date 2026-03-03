"use client";

import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis } from "recharts";

interface RadialChartProps {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  className?: string;
}

export function RadialChart({ data, className }: RadialChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="20%"
        outerRadius="90%"
        barSize={10}
        data={data}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar
          {...({ minAngle: 15, background: true, clockWise: true, dataKey: 'value' } as any)}
        />
        <Legend
          iconSize={10}
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ paddingLeft: '10px' }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

