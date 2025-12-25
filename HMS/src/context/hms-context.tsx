'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { format, startOfMonth, endOfMonth, isSameMonth, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth-context';
import { removeUndefined } from '@/lib/utils';
import type {
  Employee,
  EmployeeFormData,
  Expense,
  ExpenseFormData,
  Purchase,
  PurchaseFormData,
  Revenue,
  RevenueFormData,
  MonthlySummary,
  DashboardKPIs,
} from '@/lib/types';

interface HMSContextType {
  // Loading states
  loading: boolean;
  
  // Current date for filtering
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  
  // Employees
  employees: Employee[];
  addEmployee: (data: EmployeeFormData) => Promise<void>;
  updateEmployee: (id: string, data: Partial<EmployeeFormData>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  
  // Expenses
  expenses: Expense[];
  addExpense: (data: ExpenseFormData) => Promise<void>;
  updateExpense: (id: string, data: Partial<ExpenseFormData>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Purchases
  purchases: Purchase[];
  addPurchase: (data: PurchaseFormData) => Promise<void>;
  updatePurchase: (id: string, data: Partial<PurchaseFormData>) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  
  // Revenue
  revenues: Revenue[];
  addRevenue: (data: RevenueFormData) => Promise<void>;
  updateRevenue: (id: string, data: Partial<RevenueFormData>) => Promise<void>;
  deleteRevenue: (id: string) => Promise<void>;
  
  // Computed data
  monthlySummary: MonthlySummary | null;
  dashboardKPIs: DashboardKPIs | null;
  
  // Filtered data for current month
  monthlyExpenses: Expense[];
  monthlyPurchases: Purchase[];
  monthlyRevenues: Revenue[];
}

const HMSContext = createContext<HMSContextType | undefined>(undefined);

export const HMSProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  
  // Data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);

  // Helper to get user ref
  const getUserRef = useCallback((path: string) => {
    if (!user) return null;
    return ref(db, `users/${user.uid}/${path}`);
  }, [user]);

  // Fetch all data
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setEmployees([]);
      setExpenses([]);
      setPurchases([]);
      setRevenues([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const unsubscribers: (() => void)[] = [];

    // Fetch employees
    const employeesRef = getUserRef('employees');
    if (employeesRef) {
      const unsubEmployees = onValue(employeesRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.entries(data).map(([id, value]) => ({
            ...(value as Employee),
            id,
          }));
          setEmployees(list.sort((a, b) => b.createdAt - a.createdAt));
        } else {
          setEmployees([]);
        }
      });
      unsubscribers.push(unsubEmployees);
    }

    // Fetch expenses
    const expensesRef = getUserRef('expenses');
    if (expensesRef) {
      const unsubExpenses = onValue(expensesRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.entries(data).map(([id, value]) => ({
            ...(value as Expense),
            id,
          }));
          setExpenses(list.sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()));
        } else {
          setExpenses([]);
        }
      });
      unsubscribers.push(unsubExpenses);
    }

    // Fetch purchases
    const purchasesRef = getUserRef('purchases');
    if (purchasesRef) {
      const unsubPurchases = onValue(purchasesRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.entries(data).map(([id, value]) => ({
            ...(value as Purchase),
            id,
          }));
          setPurchases(list.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()));
        } else {
          setPurchases([]);
        }
      });
      unsubscribers.push(unsubPurchases);
    }

    // Fetch revenues
    const revenuesRef = getUserRef('revenues');
    if (revenuesRef) {
      const unsubRevenues = onValue(revenuesRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.entries(data).map(([id, value]) => ({
            ...(value as Revenue),
            id,
          }));
          setRevenues(list.sort((a, b) => new Date(b.revenueDate).getTime() - new Date(a.revenueDate).getTime()));
        } else {
          setRevenues([]);
        }
        setLoading(false);
      });
      unsubscribers.push(unsubRevenues);
    } else {
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [user, authLoading, getUserRef]);

  // CRUD Operations for Employees
  const addEmployee = async (data: EmployeeFormData) => {
    const employeesRef = getUserRef('employees');
    if (!employeesRef || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    
    const id = uuidv4();
    const now = Date.now();
    const newEmployee = removeUndefined({
      ...data,
      id,
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    });
    
    await set(ref(db, `users/${user.uid}/employees/${id}`), newEmployee);
    toast({ title: 'Success', description: 'Employee added successfully.' });
  };

  const updateEmployee = async (id: string, data: Partial<EmployeeFormData>) => {
    if (!user) return;
    const employeeRef = ref(db, `users/${user.uid}/employees/${id}`);
    await update(employeeRef, removeUndefined({ ...data, updatedAt: Date.now() }));
    toast({ title: 'Success', description: 'Employee updated successfully.' });
  };

  const deleteEmployee = async (id: string) => {
    if (!user) return;
    await remove(ref(db, `users/${user.uid}/employees/${id}`));
    toast({ title: 'Success', description: 'Employee deleted successfully.' });
  };

  // CRUD Operations for Expenses
  const addExpense = async (data: ExpenseFormData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    
    const id = uuidv4();
    const now = Date.now();
    const newExpense = removeUndefined({
      ...data,
      id,
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    });
    
    await set(ref(db, `users/${user.uid}/expenses/${id}`), newExpense);
    toast({ title: 'Success', description: 'Expense added successfully.' });
  };

  const updateExpense = async (id: string, data: Partial<ExpenseFormData>) => {
    if (!user) return;
    await update(ref(db, `users/${user.uid}/expenses/${id}`), removeUndefined({ ...data, updatedAt: Date.now() }));
    toast({ title: 'Success', description: 'Expense updated successfully.' });
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;
    await remove(ref(db, `users/${user.uid}/expenses/${id}`));
    toast({ title: 'Success', description: 'Expense deleted successfully.' });
  };

  // CRUD Operations for Purchases
  const addPurchase = async (data: PurchaseFormData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    
    const id = uuidv4();
    const now = Date.now();
    const totalCost = data.quantity * data.unitCost;
    const newPurchase = removeUndefined({
      ...data,
      id,
      userId: user.uid,
      totalCost,
      createdAt: now,
      updatedAt: now,
    });
    
    await set(ref(db, `users/${user.uid}/purchases/${id}`), newPurchase);
    toast({ title: 'Success', description: 'Purchase added successfully.' });
  };

  const updatePurchase = async (id: string, data: Partial<PurchaseFormData>) => {
    if (!user) return;
    const updateData: any = { ...data, updatedAt: Date.now() };
    if (data.quantity !== undefined && data.unitCost !== undefined) {
      updateData.totalCost = data.quantity * data.unitCost;
    }
    await update(ref(db, `users/${user.uid}/purchases/${id}`), removeUndefined(updateData));
    toast({ title: 'Success', description: 'Purchase updated successfully.' });
  };

  const deletePurchase = async (id: string) => {
    if (!user) return;
    await remove(ref(db, `users/${user.uid}/purchases/${id}`));
    toast({ title: 'Success', description: 'Purchase deleted successfully.' });
  };

  // CRUD Operations for Revenue
  const addRevenue = async (data: RevenueFormData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    
    const id = uuidv4();
    const now = Date.now();
    const newRevenue = removeUndefined({
      ...data,
      id,
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    });
    
    await set(ref(db, `users/${user.uid}/revenues/${id}`), newRevenue);
    toast({ title: 'Success', description: 'Revenue added successfully.' });
  };

  const updateRevenue = async (id: string, data: Partial<RevenueFormData>) => {
    if (!user) return;
    await update(ref(db, `users/${user.uid}/revenues/${id}`), removeUndefined({ ...data, updatedAt: Date.now() }));
    toast({ title: 'Success', description: 'Revenue updated successfully.' });
  };

  const deleteRevenue = async (id: string) => {
    if (!user) return;
    await remove(ref(db, `users/${user.uid}/revenues/${id}`));
    toast({ title: 'Success', description: 'Revenue deleted successfully.' });
  };

  // Filter data by current month
  const monthlyExpenses = useMemo(() => {
    return expenses.filter((e) => isSameMonth(parseISO(e.expenseDate), currentDate));
  }, [expenses, currentDate]);

  const monthlyPurchases = useMemo(() => {
    return purchases.filter((p) => isSameMonth(parseISO(p.purchaseDate), currentDate));
  }, [purchases, currentDate]);

  const monthlyRevenues = useMemo(() => {
    return revenues.filter((r) => isSameMonth(parseISO(r.revenueDate), currentDate));
  }, [revenues, currentDate]);

  // Calculate monthly summary
  const monthlySummary = useMemo((): MonthlySummary | null => {
    const totalRevenue = monthlyRevenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPurchases = monthlyPurchases.reduce((sum, p) => sum + p.totalCost, 0);
    
    // Calculate salaries for active employees
    const activeEmployees = employees.filter((e) => e.status === 'active');
    const totalSalaries = activeEmployees.reduce((sum, e) => sum + e.salaryMonthly, 0);
    
    const netProfit = totalRevenue - (totalExpenses + totalPurchases + totalSalaries);
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Group by categories
    const revenueByCategory = monthlyRevenues.reduce((acc, r) => {
      const existing = acc.find((item) => item.category === r.category);
      if (existing) {
        existing.amount += r.amount;
      } else {
        acc.push({ category: r.category, amount: r.amount });
      }
      return acc;
    }, [] as { category: string; amount: number }[]);

    const expensesByCategory = monthlyExpenses.reduce((acc, e) => {
      const existing = acc.find((item) => item.category === e.category);
      if (existing) {
        existing.amount += e.amount;
      } else {
        acc.push({ category: e.category, amount: e.amount });
      }
      return acc;
    }, [] as { category: string; amount: number }[]);

    const purchasesByCategory = monthlyPurchases.reduce((acc, p) => {
      const cat = p.itemCategory || 'Other';
      const existing = acc.find((item) => item.category === cat);
      if (existing) {
        existing.amount += p.totalCost;
      } else {
        acc.push({ category: cat, amount: p.totalCost });
      }
      return acc;
    }, [] as { category: string; amount: number }[]);

    return {
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      totalRevenue,
      revenueByCategory,
      totalExpenses,
      expensesByCategory,
      totalPurchases,
      purchasesByCategory,
      totalSalaries,
      netProfit,
      profitMargin,
    };
  }, [monthlyRevenues, monthlyExpenses, monthlyPurchases, employees, currentDate]);

  // Calculate dashboard KPIs
  const dashboardKPIs = useMemo((): DashboardKPIs | null => {
    if (!monthlySummary) return null;

    const recentTransactions = [
      ...monthlyExpenses.slice(0, 5).map((e) => ({ ...e, type: 'expense' as const })),
      ...monthlyRevenues.slice(0, 5).map((r) => ({ ...r, type: 'revenue' as const })),
      ...monthlyPurchases.slice(0, 5).map((p) => ({ ...p, type: 'purchase' as const })),
    ]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    return {
      totalRevenue: monthlySummary.totalRevenue,
      totalExpenses: monthlySummary.totalExpenses,
      totalPurchases: monthlySummary.totalPurchases,
      totalSalaries: monthlySummary.totalSalaries,
      netProfit: monthlySummary.netProfit,
      employeeCount: employees.filter((e) => e.status === 'active').length,
      recentTransactions,
      monthlyTrend: [], // TODO: Calculate last 6 months trend
    };
  }, [monthlySummary, monthlyExpenses, monthlyRevenues, monthlyPurchases, employees]);

  const value: HMSContextType = {
    loading: loading || authLoading,
    currentDate,
    setCurrentDate,
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    purchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
    revenues,
    addRevenue,
    updateRevenue,
    deleteRevenue,
    monthlySummary,
    dashboardKPIs,
    monthlyExpenses,
    monthlyPurchases,
    monthlyRevenues,
  };

  return <HMSContext.Provider value={value}>{children}</HMSContext.Provider>;
};

export const useHMS = () => {
  const context = useContext(HMSContext);
  if (context === undefined) {
    throw new Error('useHMS must be used within an HMSProvider');
  }
  return context;
};

