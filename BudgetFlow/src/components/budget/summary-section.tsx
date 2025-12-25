import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import type { BudgetData, CalculatedData } from '@/lib/types';
import { ArrowDown, ArrowUp, DollarSign, Target, Scale, TrendingUp } from 'lucide-react';

interface SummarySectionProps {
  budgetData: BudgetData;
  calculatedData: CalculatedData | null;
}

export function SummarySection({ budgetData, calculatedData }: SummarySectionProps) {
  if (!calculatedData) return null;

  const { budgetCap } = budgetData;
  const { totalExpenses, remainingBudget, dailyAllowance, avgDailySpend, projectedSpend, progress } = calculatedData;
  
  const progressColor =
    progress < 70
      ? 'bg-accent'
      : progress <= 100
      ? 'bg-yellow-500'
      : 'bg-destructive';

  return (
    <section>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget Cap</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(budgetCap)}</div>
            <p className="text-xs text-muted-foreground">Your total budget for this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Sum of all expenses this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            {remainingBudget >= 0 ? <ArrowDown className="h-4 w-4 text-accent" /> : <ArrowUp className="h-4 w-4 text-destructive" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-destructive' : ''}`}>{formatCurrency(remainingBudget)}</div>
            <p className="text-xs text-muted-foreground">{Math.round(100 - progress)}% of budget left</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Spend</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgDailySpend, 2)}</div>
             <p className="text-xs text-muted-foreground">Daily average so far</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} indicatorClassName={progressColor} />
           <div className="mt-2 flex justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(totalExpenses)} spent</span>
            <span>{formatCurrency(budgetCap)} cap</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Allowance</CardTitle>
            <p className="text-xs text-muted-foreground">(For rest of month)</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dailyAllowance, 2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Spend</CardTitle>
             <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(projectedSpend)}</div>
          </CardContent>
        </Card>
      </div>

    </section>
  );
}
