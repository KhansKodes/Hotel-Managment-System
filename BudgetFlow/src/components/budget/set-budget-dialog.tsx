'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBudget } from '@/context/budget-context';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface SetBudgetDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function SetBudgetDialog({ isOpen, setIsOpen }: SetBudgetDialogProps) {
  const { budgetData, updateBudgetCap } = useBudget();
  const [budget, setBudget] = useState(budgetData.budgetCap);

  useEffect(() => {
    if(isOpen) {
        setBudget(budgetData.budgetCap);
    }
  }, [isOpen, budgetData.budgetCap]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudgetCap(Number(budget));
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Monthly Budget</DialogTitle>
            <DialogDescription>
              Enter your total budget cap for this month. You can change this at any time.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget Cap
              </Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="col-span-3"
                placeholder="e.g., 250000"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
