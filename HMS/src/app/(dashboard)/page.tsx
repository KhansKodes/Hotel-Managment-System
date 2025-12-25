'use client';

import { useHMS } from '@/context/hms-context';
import { AppHeader } from '@/components/layout/app-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, getMonth, getYear, setMonth, setYear } from 'date-fns';

export default function DashboardPage() {
  const { loading, monthlySummary, dashboardKPIs, currentDate, setCurrentDate, employees } = useHMS();

  const handleMonthChange = (month: string) => {
    const newDate = setMonth(currentDate, parseInt(month));
    setCurrentDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = setYear(currentDate, parseInt(year));
    setCurrentDate(newDate);
  };

  const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: format(new Date(0, i), 'MMMM'),
  }));

  if (loading) {
    return (
      <>
        <AppHeader />
        <main className="p-3 sm:p-6">
          <Skeleton className="h-8 w-48 mb-4 sm:mb-6" />
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 sm:h-32" />
            ))}
          </div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-4 sm:mb-6">
            <Skeleton className="h-60 sm:h-80" />
            <Skeleton className="h-60 sm:h-80" />
          </div>
        </main>
      </>
    );
  }

  const summary = monthlySummary;
  const kpis = dashboardKPIs;

  return (
    <>
      <AppHeader />
      <main className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Overview for {format(currentDate, 'MMMM yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(getMonth(currentDate))} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[110px] sm:w-[140px] h-8 sm:h-10 text-xs sm:text-sm">
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
              <SelectTrigger className="w-[80px] sm:w-[100px] h-8 sm:h-10 text-xs sm:text-sm">
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
          </div>
        </div>

        {/* KPI Cards - 2 columns on mobile, 4 on desktop */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Revenue Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Revenue</CardTitle>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{formatCurrency(summary?.totalRevenue || 0)}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center mt-0.5 sm:mt-1">
                <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">From all sources</span>
                <span className="sm:hidden">All sources</span>
              </p>
            </CardContent>
          </Card>

          {/* Expenses Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Expenses</CardTitle>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Receipt className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{formatCurrency(summary?.totalExpenses || 0)}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center mt-0.5 sm:mt-1">
                <ArrowDownRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">Operating expenses</span>
                <span className="sm:hidden">Operating</span>
              </p>
            </CardContent>
          </Card>

          {/* Purchases Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Purchases</CardTitle>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{formatCurrency(summary?.totalPurchases || 0)}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                <span className="hidden sm:inline">Inventory costs</span>
                <span className="sm:hidden">Inventory</span>
              </p>
            </CardContent>
          </Card>

          {/* Salaries Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">Salaries</CardTitle>
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{formatCurrency(summary?.totalSalaries || 0)}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                {kpis?.employeeCount || 0} employees
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profit/Loss Card */}
        <Card className={summary && summary.netProfit >= 0 ? 'border-green-200 dark:border-green-900' : 'border-red-200 dark:border-red-900'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
            <div>
              <CardTitle className="text-base sm:text-lg">Net {summary && summary.netProfit >= 0 ? 'Profit' : 'Loss'}</CardTitle>
              <CardDescription className="text-[10px] sm:text-sm">Revenue - (Expenses + Purchases + Salaries)</CardDescription>
            </div>
            {summary && summary.netProfit >= 0 ? (
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            ) : (
              <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            )}
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className={`text-2xl sm:text-3xl font-bold ${summary && summary.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(summary?.netProfit || 0)}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Profit margin: {(summary?.profitMargin || 0).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Revenue Breakdown */}
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Revenue by Category</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Income sources breakdown</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {summary && summary.revenueByCategory.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {summary.revenueByCategory.map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-xs sm:text-sm font-medium">{item.category}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 sm:h-32 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                  No revenue recorded this month
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expenses Breakdown */}
          <Card>
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Expenses by Category</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Where your money is going</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {summary && summary.expensesByCategory.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {summary.expensesByCategory.map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-2 w-2 rounded-full bg-destructive" />
                        <span className="text-xs sm:text-sm font-medium">{item.category}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 sm:h-32 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                  No expenses recorded this month
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Employees Overview */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Team Overview</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your active employees</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {employees.length > 0 ? (
              <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {employees.slice(0, 6).map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card"
                  >
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs sm:text-sm font-semibold text-primary shrink-0">
                      {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{employee.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{employee.designation}</p>
                    </div>
                    <Badge variant="secondary" className={`${getStatusColor(employee.status)} text-[10px] sm:text-xs shrink-0`}>
                      {employee.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 sm:h-32 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                No employees added yet
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
