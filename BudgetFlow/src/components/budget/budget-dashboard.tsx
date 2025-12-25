'use client';

import { useState } from 'react';
import { useBudget } from '@/context/budget-context';
import { Header } from '@/components/layout/header';
import { SummarySection } from '@/components/budget/summary-section';
import { ExpenseList } from '@/components/budget/expense-list';
import { ChartsSection } from '@/components/budget/charts-section';
import { AddExpenseSheet } from '@/components/budget/add-expense-sheet';
import { SetBudgetDialog } from '@/components/budget/set-budget-dialog';
import { Button } from '@/components/ui/button';
import { Download, PlusCircle, Upload, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, getYear, getMonth, setYear, setMonth } from 'date-fns';
import type { Expense, BudgetData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function BudgetDashboard() {
  const {
    loading,
    budgetData,
    calculatedData,
    currentMonthId,
    importData,
    goToDate,
    currentDate,
  } = useBudget();
  const { toast } = useToast();

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSetBudgetOpen, setIsSetBudgetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddExpenseOpen(true);
  };

  const handleAddNewExpense = () => {
    setEditingExpense(undefined);
    setIsAddExpenseOpen(true);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(budgetData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `flowqet_${currentMonthId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({ title: 'Success', description: 'Data exported successfully.' });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('File is not a valid text file.');
        const imported = JSON.parse(text) as BudgetData;
        // basic validation
        if (typeof imported.budgetCap !== 'number' || !Array.isArray(imported.expenses)) {
            throw new Error('Invalid file format.');
        }
        await importData(imported);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`});
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  
  const handleMonthChange = (month: string) => {
    const newDate = setMonth(currentDate, parseInt(month));
    goToDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = setYear(currentDate, parseInt(year));
    goToDate(newDate);
  };
  
  const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: format(new Date(0, i), 'MMMM'),
  }));


  if (loading) {
    return (
      <>
        <Header />
        <div className="container max-w-screen-2xl py-8 space-y-8">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container max-w-screen-2xl py-8">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
               <Select value={String(getMonth(currentDate))} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
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
                <SelectTrigger className="w-full sm:w-[120px]">
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
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsSetBudgetOpen(true)} variant="outline" className="w-full sm:w-auto">
                <Settings className="mr-2 h-4 w-4" />
                Set Budget
              </Button>
              <Button onClick={handleAddNewExpense} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
              <div className="hidden sm:flex">
                <Button onClick={handleExport} variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                <Button asChild variant="ghost" size="icon">
                  <label htmlFor="import-file" className="cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <input type="file" id="import-file" className="hidden" accept=".json" onChange={handleImport} />
                  </label>
                </Button>
              </div>
            </div>
          </div>
          
          <SummarySection budgetData={budgetData} calculatedData={calculatedData} />
          <ChartsSection calculatedData={calculatedData} />
          <ExpenseList onEditExpense={handleEditExpense} />
        </div>
      </main>

      <AddExpenseSheet
        isOpen={isAddExpenseOpen}
        setIsOpen={setIsAddExpenseOpen}
        expense={editingExpense}
      />
      <SetBudgetDialog isOpen={isSetBudgetOpen} setIsOpen={setIsSetBudgetOpen} />
    </>
  );
}
