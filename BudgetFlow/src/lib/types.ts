export interface Expense {
  id: string;
  date: string; // ISO string
  amount: number;
  category: string;
  description: string;
}

export interface BudgetData {
  budgetCap: number;
  expenses: Expense[];
}

export type CalculatedData = {
  totalExpenses: number;
  remainingBudget: number;
  dailyAllowance: number;
  avgDailySpend: number;
  projectedSpend: number;
  categories: { name: string; amount: number; percentage: number }[];
  spendByDay: { date: string; amount: number }[];
  progress: number;
};
