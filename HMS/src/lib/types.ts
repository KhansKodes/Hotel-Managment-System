// ============================================
// Hotel Management System - Type Definitions
// ============================================

// Base entity with common fields
export interface BaseEntity {
  id: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

// ============================================
// EMPLOYEES
// ============================================
export type EmployeeStatus = 'active' | 'inactive' | 'on-leave';

export interface Employee extends BaseEntity {
  name: string;
  designation: string;
  salaryMonthly: number;
  phone?: string;
  email?: string;
  joiningDate?: string;
  status: EmployeeStatus;
}

export type EmployeeFormData = Omit<Employee, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// ============================================
// EXPENSE CATEGORIES
// ============================================
export const DEFAULT_EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Maintenance',
  'Salaries',
  'Supplies',
  'Marketing',
  'Insurance',
  'Miscellaneous',
] as const;

export type ExpenseCategoryType = typeof DEFAULT_EXPENSE_CATEGORIES[number] | string;

export interface ExpenseCategory extends BaseEntity {
  name: string;
}

// ============================================
// EXPENSES (Operating Expenses)
// ============================================
export type PaymentMethod = 'cash' | 'bank' | 'card' | 'other';

export interface Expense extends BaseEntity {
  category: ExpenseCategoryType;
  title: string;
  amount: number;
  expenseDate: string; // ISO string
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export type ExpenseFormData = Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// ============================================
// SUPPLIERS
// ============================================
export interface Supplier extends BaseEntity {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export type SupplierFormData = Omit<Supplier, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// ============================================
// PURCHASES (Restaurant Inventory)
// ============================================
export const PURCHASE_CATEGORIES = [
  'Meat & Poultry',
  'Seafood',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Spices',
  'Beverages',
  'Bakery',
  'Frozen',
  'Dry Goods',
  'Cleaning Supplies',
  'Other',
] as const;

export type PurchaseCategoryType = typeof PURCHASE_CATEGORIES[number] | string;

export const PURCHASE_UNITS = ['kg', 'g', 'liter', 'ml', 'pcs', 'dozen', 'box', 'pack', 'bag'] as const;
export type PurchaseUnit = typeof PURCHASE_UNITS[number];

export interface Purchase extends BaseEntity {
  supplierId?: string;
  supplierName?: string;
  itemName: string;
  itemCategory?: PurchaseCategoryType;
  quantity: number;
  unit: PurchaseUnit;
  unitCost: number;
  totalCost: number; // auto-calculated: quantity * unitCost
  purchaseDate: string; // ISO string
  notes?: string;
}

export type PurchaseFormData = Omit<Purchase, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'totalCost'>;

// ============================================
// REVENUE CATEGORIES (Restaurant-specific)
// ============================================
export const DEFAULT_REVENUE_CATEGORIES = [
  'Dine-in',
  'Takeaway',
  'Delivery',
  'Catering',
  'Event/Party',
  'Other',
] as const;

export type RevenueCategoryType = typeof DEFAULT_REVENUE_CATEGORIES[number] | string;

export interface RevenueCategory extends BaseEntity {
  name: string;
}

// ============================================
// REVENUE (Earnings from Customers)
// ============================================
export interface Revenue extends BaseEntity {
  category: RevenueCategoryType;
  description: string;
  amount: number;
  revenueDate: string; // ISO string
  paymentMethod?: PaymentMethod;
  customerName?: string;
  tableNumber?: string;
  orderNumber?: string;
  notes?: string;
}

export type RevenueFormData = Omit<Revenue, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// ============================================
// SALARY RECORDS
// ============================================
export type SalaryStatus = 'pending' | 'paid' | 'cancelled';

export interface SalaryRecord extends BaseEntity {
  employeeId: string;
  employeeName: string;
  month: number; // 0-11
  year: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number; // baseSalary + bonus - deductions
  status: SalaryStatus;
  paidAt?: number;
  notes?: string;
}

export type SalaryFormData = Omit<SalaryRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'netSalary'>;

// ============================================
// MONTHLY SUMMARY (Computed)
// ============================================
export interface MonthlySummary {
  month: number;
  year: number;
  totalRevenue: number;
  revenueByCategory: { category: string; amount: number }[];
  totalExpenses: number;
  expensesByCategory: { category: string; amount: number }[];
  totalPurchases: number;
  purchasesByCategory: { category: string; amount: number }[];
  totalSalaries: number;
  netProfit: number; // totalRevenue - (totalExpenses + totalPurchases + totalSalaries)
  profitMargin: number; // (netProfit / totalRevenue) * 100
}

// ============================================
// DASHBOARD KPIS
// ============================================
export interface DashboardKPIs {
  totalRevenue: number;
  totalExpenses: number;
  totalPurchases: number;
  totalSalaries: number;
  netProfit: number;
  employeeCount: number;
  recentTransactions: (Expense | Revenue | Purchase)[];
  monthlyTrend: { month: string; revenue: number; expenses: number; profit: number }[];
}

// ============================================
// LEGACY SUPPORT (Budget System)
// ============================================
export interface LegacyExpense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
}

export interface LegacyBudgetData {
  budgetCap: number;
  expenses: LegacyExpense[];
}

// ============================================
// UTILITY TYPES
// ============================================
export type TransactionType = 'expense' | 'revenue' | 'purchase' | 'salary';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface FilterOptions {
  dateRange?: DateRange;
  category?: string;
  searchTerm?: string;
  status?: string;
}
