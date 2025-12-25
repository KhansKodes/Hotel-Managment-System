
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useMemo } from 'react';
import type { CalculatedData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface ChartsSectionProps {
  calculatedData: CalculatedData | null;
}

export function ChartsSection({ calculatedData }: ChartsSectionProps) {
  const chartData = useMemo(() => {
    if (!calculatedData) return { pieData: [], barData: [], maxBarAmount: 0 };
    
    const pieData = calculatedData.categories.slice(0, 5).map((c,i) => ({
      name: c.name,
      value: c.amount,
      fill: `hsl(var(--chart-${i+1}))`,
    }));
    
    const maxBarAmount = Math.max(...calculatedData.spendByDay.map(d => d.amount), 0);

    return { pieData, barData: calculatedData.spendByDay, maxBarAmount };
  }, [calculatedData]);

  const chartConfig = useMemo(() => {
    if (!calculatedData) return {};
    const config: any = {};
    calculatedData.categories.slice(0, 5).forEach((c, i) => {
      config[c.name] = {
        label: c.name,
        color: `hsl(var(--chart-${i + 1}))`,
      };
    });
    return config;
  }, [calculatedData]);

  if (!calculatedData || calculatedData.totalExpenses === 0) {
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <TrendingUp className="mx-auto h-12 w-12" />
                    <p>Log some expenses to see your spending analytics.</p>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 mt-4">
      <Card>
        <CardHeader className="items-center pb-0">
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
           <ResponsiveContainer width="100%" height={350}>
              <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full">
                <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="name" />}
                />
                <Pie
                    data={chartData.pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    strokeWidth={5}
                >
                    {chartData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/2 [&>*]:justify-center sm:[&>*]:basis-1/3"
                />
                </PieChart>
            </ChartContainer>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Daily Spending</CardTitle>
        </CardHeader>
        <CardContent>
           <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData.barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} interval={2} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${formatCurrency(value)}`} domain={[0, 'dataMax']} />
                <Tooltip
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <p className="text-sm font-bold">{`Day ${label}`}</p>
                                    <p className="text-sm text-muted-foreground">{`Spent: ${formatCurrency(payload[0].value as number)}`}</p>
                                </div>
                            )
                        }
                        return null
                    }}
                 />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
}
