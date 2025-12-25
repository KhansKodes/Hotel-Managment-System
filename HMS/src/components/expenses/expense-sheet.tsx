'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useHMS } from '@/context/hms-context';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { DEFAULT_EXPENSE_CATEGORIES, type Expense, type PaymentMethod } from '@/lib/types';

const expenseSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.string().optional(),
  expenseDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
}

export function ExpenseSheet({ open, onOpenChange, expense }: ExpenseSheetProps) {
  const { addExpense, updateExpense } = useHMS();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      category: '',
      amount: 0,
      paymentMethod: '',
      expenseDate: new Date().toISOString(),
      notes: '',
    },
  });

  useEffect(() => {
    if (expense) {
      form.reset({
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        paymentMethod: expense.paymentMethod || '',
        expenseDate: expense.expenseDate,
        notes: expense.notes || '',
      });
    } else {
      form.reset({
        title: '',
        category: '',
        amount: 0,
        paymentMethod: '',
        expenseDate: new Date().toISOString(),
        notes: '',
      });
    }
  }, [expense, open, form]);

  const onSubmit = async (values: ExpenseFormValues) => {
    const data = {
      ...values,
      paymentMethod: (values.paymentMethod || undefined) as PaymentMethod | undefined,
      notes: values.notes || undefined,
    };

    if (expense) {
      await updateExpense(expense.id, data);
    } else {
      await addExpense(data as any);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="center" className="w-full sm:max-w-lg">
        <SheetHeader className="mb-4 sm:mb-6">
          <SheetTitle className="text-lg sm:text-xl">{expense ? 'Edit Expense' : 'Add Expense'}</SheetTitle>
          <SheetDescription className="text-xs sm:text-sm">
            {expense ? 'Update expense details' : 'Record a new operating expense'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Monthly Rent, Electricity Bill" className="h-9 sm:h-10 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Amount (PKR) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" className="h-9 sm:h-10 text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expenseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full h-9 sm:h-10 justify-start text-left font-normal text-sm',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {field.value ? format(parseISO(field.value), 'PPP') : 'Pick a date'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? parseISO(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString() || '')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional details..." className="text-sm min-h-[60px] sm:min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4 sm:pt-6 flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-9 sm:h-10 text-sm">
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto h-9 sm:h-10 text-sm">
                {form.formState.isSubmitting ? 'Saving...' : expense ? 'Update' : 'Add Expense'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
