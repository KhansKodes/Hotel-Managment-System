'use client';

import { useHMS } from '@/context/hms-context';
import { AppHeader } from '@/components/layout/app-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, exportToCSV } from '@/lib/utils';
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  ShoppingCart,
  Users,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { format, getMonth, getYear, setMonth, setYear } from 'date-fns';

export default function ReportsPage() {
  const {
    loading,
    monthlySummary,
    currentDate,
    setCurrentDate,
    monthlyExpenses,
    monthlyPurchases,
    monthlyRevenues,
    employees,
  } = useHMS();

  const handleMonthChange = (month: string) => {
    setCurrentDate(setMonth(currentDate, parseInt(month)));
  };

  const handleYearChange = (year: string) => {
    setCurrentDate(setYear(currentDate, parseInt(year)));
  };

  const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: format(new Date(0, i), 'MMMM'),
  }));

  const handleExportSummary = () => {
    if (!monthlySummary) return;

    const summaryData = [
      { Category: 'Total Revenue', Amount: monthlySummary.totalRevenue },
      { Category: 'Total Expenses', Amount: monthlySummary.totalExpenses },
      { Category: 'Total Purchases', Amount: monthlySummary.totalPurchases },
      { Category: 'Total Salaries', Amount: monthlySummary.totalSalaries },
      { Category: 'Net Profit/Loss', Amount: monthlySummary.netProfit },
      { Category: 'Profit Margin (%)', Amount: monthlySummary.profitMargin.toFixed(2) },
    ];

    exportToCSV(summaryData, `monthly-report-${format(currentDate, 'yyyy-MM')}`);
  };

  const handleExportDetailed = () => {
    const allTransactions = [
      ...monthlyRevenues.map((r) => ({
        Type: 'Revenue',
        Description: r.description,
        Category: r.category,
        Amount: r.amount,
        Date: r.revenueDate,
      })),
      ...monthlyExpenses.map((e) => ({
        Type: 'Expense',
        Description: e.title,
        Category: e.category,
        Amount: -e.amount,
        Date: e.expenseDate,
      })),
      ...monthlyPurchases.map((p) => ({
        Type: 'Purchase',
        Description: p.itemName,
        Category: p.itemCategory || 'Other',
        Amount: -p.totalCost,
        Date: p.purchaseDate,
      })),
    ].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());

    exportToCSV(allTransactions, `detailed-transactions-${format(currentDate, 'yyyy-MM')}`);
  };

  if (loading) {
    return (
      <>
        <AppHeader />
        <main className="p-3 sm:p-6">
          <Skeleton className="h-8 w-48 mb-4 sm:mb-6" />
          <Skeleton className="h-32 sm:h-40 mb-4 sm:mb-6" />
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 sm:h-32" />
            ))}
          </div>
          <Skeleton className="h-64 sm:h-96" />
        </main>
      </>
    );
  }

  const summary = monthlySummary;
  const totalOutflow = (summary?.totalExpenses || 0) + (summary?.totalPurchases || 0) + (summary?.totalSalaries || 0);
  const revenuePercentage = summary && totalOutflow > 0 ? Math.min(100, ((summary.totalRevenue / totalOutflow) * 100)) : 0;

  return (
    <>
      <AppHeader />
      <main className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Monthly Report</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Financial summary for {format(currentDate, 'MMMM yyyy')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={String(getMonth(currentDate))} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[100px] sm:w-[130px] h-8 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(getYear(currentDate))} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[70px] sm:w-[90px] h-8 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExportSummary} className="h-8 sm:h-9 text-xs sm:text-sm">
              <Download className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Summary</span>
              <span className="sm:hidden">Sum</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportDetailed} className="h-8 sm:h-9 text-xs sm:text-sm">
              <Download className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Details</span>
              <span className="sm:hidden">All</span>
            </Button>
          </div>
        </div>

        {/* Profit/Loss Hero Card */}
        <Card className={`border-2 ${summary && summary.netProfit >= 0 ? 'border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20' : 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'}`}>
          <CardContent className="p-4 sm:pt-6 sm:p-6">
            <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Net {summary && summary.netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                <div className="flex items-center gap-2 sm:gap-3">
                  {summary && summary.netProfit >= 0 ? (
                    <TrendingUp className="h-7 w-7 sm:h-10 sm:w-10 text-green-600" />
                  ) : (
                    <TrendingDown className="h-7 w-7 sm:h-10 sm:w-10 text-red-600" />
                  )}
                  <span className={`text-2xl sm:text-4xl font-bold ${summary && summary.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(summary?.netProfit || 0)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Margin: <span className="font-semibold">{(summary?.profitMargin || 0).toFixed(1)}%</span>
                </p>
              </div>
              <div className="flex-1 max-w-full md:max-w-md space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Revenue vs Outflow</span>
                  <span>{revenuePercentage.toFixed(0)}%</span>
                </div>
                <Progress value={revenuePercentage} className="h-2 sm:h-3" />
                <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                  <span>In: {formatCurrency(summary?.totalRevenue || 0)}</span>
                  <span>Out: {formatCurrency(totalOutflow)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards - 2x2 on mobile, 4 cols on desktop */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(summary?.totalRevenue || 0)}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                {monthlyRevenues.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Expenses</CardTitle>
              <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold text-red-600">{formatCurrency(summary?.totalExpenses || 0)}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                {monthlyExpenses.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Purchases</CardTitle>
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">{formatCurrency(summary?.totalPurchases || 0)}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                {monthlyPurchases.length} items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Salaries</CardTitle>
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{formatCurrency(summary?.totalSalaries || 0)}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                {employees.filter(e => e.status === 'active').length} employees
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown Sections */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Revenue Breakdown */}
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                Revenue Breakdown
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Income sources</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {summary && summary.revenueByCategory.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {summary.revenueByCategory.map((item, index) => {
                    const percentage = (item.amount / summary.totalRevenue) * 100;
                    return (
                      <div key={index} className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium">{item.category}</span>
                          <span className="text-xs sm:text-sm font-semibold">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="h-1.5 sm:h-2 flex-1" />
                          <span className="text-[10px] sm:text-xs text-muted-foreground w-10 sm:w-12 text-right">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-24 sm:h-32 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                  No revenue recorded
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expenses Breakdown */}
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                Expenses Breakdown
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Operating costs</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {summary && summary.expensesByCategory.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {summary.expensesByCategory.map((item, index) => {
                    const percentage = (item.amount / summary.totalExpenses) * 100;
                    return (
                      <div key={index} className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium">{item.category}</span>
                          <span className="text-xs sm:text-sm font-semibold">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="h-1.5 sm:h-2 flex-1" indicatorClassName="bg-destructive" />
                          <span className="text-[10px] sm:text-xs text-muted-foreground w-10 sm:w-12 text-right">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-24 sm:h-32 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                  No expenses recorded
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Purchases Breakdown */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" />
              Purchase Categories
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Inventory spending breakdown</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {summary && summary.purchasesByCategory.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {summary.purchasesByCategory.map((item, index) => {
                  const percentage = (item.amount / summary.totalPurchases) * 100;
                  return (
                    <div key={index} className="p-3 sm:p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium">{item.category}</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="text-base sm:text-lg font-bold">{formatCurrency(item.amount)}</div>
                      <Progress value={percentage} className="h-1 sm:h-1.5 mt-1.5 sm:mt-2" indicatorClassName="bg-orange-500" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-24 sm:h-32 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                No purchases recorded
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calculation Summary */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Calculation Summary</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Net profit/loss breakdown</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between py-1.5 sm:py-2 border-b">
                <span className="text-xs sm:text-sm text-green-600 font-medium">Total Revenue</span>
                <span className="text-xs sm:text-sm font-semibold text-green-600">+{formatCurrency(summary?.totalRevenue || 0)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 sm:py-2 border-b">
                <span className="text-xs sm:text-sm text-red-600">Operating Expenses</span>
                <span className="text-xs sm:text-sm font-semibold text-red-600">-{formatCurrency(summary?.totalExpenses || 0)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 sm:py-2 border-b">
                <span className="text-xs sm:text-sm text-orange-600">Purchase Costs</span>
                <span className="text-xs sm:text-sm font-semibold text-orange-600">-{formatCurrency(summary?.totalPurchases || 0)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 sm:py-2 border-b">
                <span className="text-xs sm:text-sm text-blue-600">Employee Salaries</span>
                <span className="text-xs sm:text-sm font-semibold text-blue-600">-{formatCurrency(summary?.totalSalaries || 0)}</span>
              </div>
              <div className="flex items-center justify-between py-2 sm:py-3 bg-muted/50 rounded-lg px-2 sm:px-3 mt-3 sm:mt-4">
                <span className="font-bold text-sm sm:text-lg">Net {summary && summary.netProfit >= 0 ? 'Profit' : 'Loss'}</span>
                <span className={`font-bold text-base sm:text-xl ${summary && summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary?.netProfit || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
