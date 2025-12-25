'use client';

import { useBudget } from '@/context/budget-context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import type { Expense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ExpenseListProps {
  onEditExpense: (expense: Expense) => void;
}

export function ExpenseList({ onEditExpense }: ExpenseListProps) {
  const { budgetData, calculatedData, deleteExpense } = useBudget();

  if (!calculatedData || calculatedData.totalExpenses === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent className="h-48 flex items-center justify-center">
                <p className="text-muted-foreground">No expenses logged for this month yet.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[40px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {budgetData.expenses.map((expense) => (
                <TableRow key={expense.id}>
                    <TableCell className="hidden sm:table-cell">{format(parseISO(expense.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-muted-foreground sm:hidden">{format(parseISO(expense.date), 'MMM dd, yyyy')}</div>
                    </TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditExpense(expense)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteExpense(expense.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
