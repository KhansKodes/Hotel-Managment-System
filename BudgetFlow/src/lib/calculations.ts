import {
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  getDate,
  isSameMonth,
  parseISO,
  format,
  isAfter,
  isToday,
} from "date-fns";
import type { Expense, BudgetData, CalculatedData } from "./types";

export const calculateFinancials = (
  budgetData: BudgetData,
  currentDate: Date
): CalculatedData => {
  const { budgetCap, expenses } = budgetData;
  const today = new Date();
  const selectedMonth = startOfMonth(currentDate);

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const daysInMonth = getDaysInMonth(selectedMonth);
  
  // Determine daysElapsed correctly.
  // If the selected month is a past month, daysElapsed is the total days in that month.
  // If it's the current month, it's the current date.
  let daysElapsed: number;
  if (isSameMonth(selectedMonth, today)) {
    daysElapsed = getDate(today);
  } else if (isAfter(today, selectedMonth)) {
    daysElapsed = daysInMonth;
  } else {
    daysElapsed = 0; // Future month
  }

  const daysLeft = daysInMonth - daysElapsed;

  const relevantExpenses = expenses.filter(e => isSameMonth(parseISO(e.date), selectedMonth));

  const totalExpenses = relevantExpenses.reduce((sum, e) => sum + e.amount, 0);

  const remainingBudget = budgetCap - totalExpenses;

  const dailyAllowance = daysLeft > 0 && remainingBudget > 0 ? remainingBudget / daysLeft : 0;

  const avgDailySpend = daysElapsed > 0 ? totalExpenses / daysElapsed : 0;

  const projectedSpend = avgDailySpend * daysInMonth;

  const categoryTotals = relevantExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  const categories = Object.entries(categoryTotals)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
  
  const spendByDayMap = relevantExpenses.reduce((acc, expense) => {
    const day = format(parseISO(expense.date), 'yyyy-MM-dd');
    acc[day] = (acc[day] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const spendByDay = Array.from({ length: daysInMonth }, (_, i) => {
    const date = format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i + 1), 'yyyy-MM-dd');
    return {
      date: format(new Date(date), 'dd'),
      amount: spendByDayMap[date] || 0,
    };
  });


  const progress = budgetCap > 0 ? (totalExpenses / budgetCap) * 100 : 0;

  return {
    totalExpenses,
    remainingBudget,
    dailyAllowance,
    avgDailySpend,
    projectedSpend,
    categories,
    spendByDay,
    progress,
  };
};
