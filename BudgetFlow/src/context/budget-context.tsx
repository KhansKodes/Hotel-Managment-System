'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { format, subMonths, addMonths, startOfMonth } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import type { BudgetData, CalculatedData, Expense } from '@/lib/types';
import { calculateFinancials } from '@/lib/calculations';
import { useAuth } from './auth-context';

interface BudgetContextType {
  budgetData: BudgetData;
  calculatedData: CalculatedData | null;
  loading: boolean;
  currentDate: Date;
  currentMonthId: string;
  updateBudgetCap: (newCap: number) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  importData: (data: BudgetData) => Promise<void>;
  goToDate: (date: Date) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [budgetData, setBudgetData] = useState<BudgetData>({ budgetCap: 0, expenses: [] });
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  
  const currentMonthId = useMemo(() => format(currentDate, 'yyyy-MM'), [currentDate]);

  const goToDate = (date: Date) => {
    const newDate = startOfMonth(date);
    if (newDate > startOfMonth(new Date())) {
      setCurrentDate(startOfMonth(new Date()));
       toast({
        variant: "destructive",
        title: "Invalid Date",
        description: "You cannot select a future month.",
      });
    } else {
      setCurrentDate(newDate);
    }
  };

  const getDbRef = useCallback(() => {
    if (!user) return null;
    return ref(db, `users/${user.uid}/budgets/${currentMonthId}`);
  }, [user, currentMonthId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setBudgetData({ budgetCap: 0, expenses: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const dbRef = getDbRef();
    if (!dbRef) return;

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const expenses = data.expenses ? Object.values(data.expenses) as Expense[] : [];
        const sortedExpenses = expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBudgetData({ budgetCap: data.budgetCap || 0, expenses: sortedExpenses });
      } else {
        // Create initial data for the new month
        const initialData = { budgetCap: 0, expenses: [] };
        set(dbRef, initialData);
        setBudgetData(initialData);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching budget data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch budget data.",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentMonthId, toast, user, authLoading, getDbRef]);
  
  const saveData = useCallback(async (data: BudgetData) => {
    const dbRef = getDbRef();
    if (!dbRef) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to save data." });
      return;
    };
    try {
      // RTDB doesn't like arrays, so we convert expenses to an object
      const expensesObject = data.expenses.reduce((acc, exp) => {
        acc[exp.id] = exp;
        return acc;
      }, {} as {[key: string]: Expense});

      await set(dbRef, {
        budgetCap: data.budgetCap,
        expenses: expensesObject,
      });
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save data to the cloud.",
      });
    }
  }, [getDbRef, toast]);

  const updateBudgetCap = async (newCap: number) => {
    const newData = { ...budgetData, budgetCap: newCap };
    await saveData(newData);
    toast({ title: "Success", description: "Budget cap updated." });
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: uuidv4() };
    const newData = { ...budgetData, expenses: [newExpense, ...budgetData.expenses] };
    await saveData(newData);
    toast({ title: "Success", description: "Expense added." });
  };

  const updateExpense = async (updatedExpense: Expense) => {
    const expenses = budgetData.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e);
    const newData = { ...budgetData, expenses };
    await saveData(newData);
    toast({ title: "Success", description: "Expense updated." });
  };

  const deleteExpense = async (expenseId: string) => {
    const expenses = budgetData.expenses.filter(e => e.id !== expenseId);
    const newData = { ...budgetData, expenses };
    await saveData(newData);
    toast({ title: "Success", description: "Expense deleted." });
  };

  const importData = async (data: BudgetData) => {
    await saveData(data);
    toast({ title: "Success", description: "Data imported successfully." });
  };

  const calculatedData = useMemo(() => {
    return calculateFinancials(budgetData, currentDate);
  }, [budgetData, currentDate]);

  const value = {
    budgetData,
    calculatedData,
    loading: loading || authLoading,
    currentDate,
    currentMonthId,
    updateBudgetCap,
    addExpense,
    updateExpense,
    deleteExpense,
    importData,
    goToDate,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
