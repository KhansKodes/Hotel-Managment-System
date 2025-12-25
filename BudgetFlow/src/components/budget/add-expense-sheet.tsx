'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { useBudget } from '@/context/budget-context';
import { useState, useEffect, useMemo } from 'react';
import type { Expense } from '@/lib/types';
import { CalendarIcon, ChevronsUpDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface AddExpenseSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  expense?: Expense;
}

export function AddExpenseSheet({ isOpen, setIsOpen, expense }: AddExpenseSheetProps) {
  const { budgetData, addExpense, updateExpense } = useBudget();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  useEffect(() => {
    if (expense) {
      setDate(parseISO(expense.date));
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setDescription(expense.description);
    } else {
      setDate(new Date());
      setAmount('');
      setCategory('');
      setDescription('');
    }
  }, [expense, isOpen]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(budgetData.expenses.map((e) => e.category));
    return Array.from(categories);
  }, [budgetData.expenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount || !category) return;

    const expenseData = {
      date: date.toISOString(),
      amount: Number(amount),
      category,
      description,
    };

    if (expense) {
      updateExpense({ ...expenseData, id: expense.id });
    } else {
      addExpense(expenseData);
    }
    setIsOpen(false);
  };
  
  const handleCategorySelect = (currentValue: string) => {
    setCategory(currentValue === category ? "" : currentValue);
    setIsCategoryOpen(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-md w-full">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>{expense ? 'Edit Expense' : 'Add Expense'}</SheetTitle>
            <SheetDescription>
              Log a new transaction to track your spending.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 py-4 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCategoryOpen}
                    className="w-full justify-between font-normal"
                  >
                    {category || "Select a category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search or add category..." onValueChange={setCategory}/>
                    <CommandList>
                      <CommandEmpty>No category found. Type to add.</CommandEmpty>
                      <CommandGroup>
                        {uniqueCategories.map((cat) => (
                          <CommandItem
                            key={cat}
                            value={cat}
                            onSelect={handleCategorySelect}
                          >
                            {cat}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Groceries from the market"
                required
              />
            </div>
             <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            </div>
          </div>
          <SheetFooter>
            <Button type="submit">Save Expense</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
