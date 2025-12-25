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
import { cn, formatCurrency } from '@/lib/utils';
import { PURCHASE_CATEGORIES, PURCHASE_UNITS, type Purchase, type PurchaseUnit } from '@/lib/types';

const purchaseSchema = z.object({
  itemName: z.string().min(2, 'Item name is required'),
  itemCategory: z.string().optional(),
  supplierName: z.string().optional(),
  quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  unitCost: z.coerce.number().min(0, 'Unit cost must be a positive number'),
  purchaseDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

interface PurchaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase?: Purchase;
}

export function PurchaseSheet({ open, onOpenChange, purchase }: PurchaseSheetProps) {
  const { addPurchase, updatePurchase } = useHMS();

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      itemName: '',
      itemCategory: '',
      supplierName: '',
      quantity: 1,
      unit: 'kg',
      unitCost: 0,
      purchaseDate: new Date().toISOString(),
      notes: '',
    },
  });

  const quantity = form.watch('quantity');
  const unitCost = form.watch('unitCost');
  const totalCost = (quantity || 0) * (unitCost || 0);

  useEffect(() => {
    if (purchase) {
      form.reset({
        itemName: purchase.itemName,
        itemCategory: purchase.itemCategory || '',
        supplierName: purchase.supplierName || '',
        quantity: purchase.quantity,
        unit: purchase.unit,
        unitCost: purchase.unitCost,
        purchaseDate: purchase.purchaseDate,
        notes: purchase.notes || '',
      });
    } else {
      form.reset({
        itemName: '',
        itemCategory: '',
        supplierName: '',
        quantity: 1,
        unit: 'kg',
        unitCost: 0,
        purchaseDate: new Date().toISOString(),
        notes: '',
      });
    }
  }, [purchase, open, form]);

  const onSubmit = async (values: PurchaseFormValues) => {
    const data = {
      ...values,
      unit: values.unit as PurchaseUnit,
      itemCategory: values.itemCategory || undefined,
      supplierName: values.supplierName || undefined,
      notes: values.notes || undefined,
    };

    if (purchase) {
      await updatePurchase(purchase.id, data);
    } else {
      await addPurchase(data as any);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="center" className="w-full sm:max-w-lg">
        <SheetHeader className="mb-4 sm:mb-6">
          <SheetTitle className="text-lg sm:text-xl">{purchase ? 'Edit Purchase' : 'Add Purchase'}</SheetTitle>
          <SheetDescription className="text-xs sm:text-sm">
            {purchase ? 'Update purchase details' : 'Record a new inventory purchase'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Item Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chicken Breast, Tomatoes" className="h-9 sm:h-10 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="itemCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PURCHASE_CATEGORIES.map((cat) => (
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
                name="supplierName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Supplier/Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Metro, Imtiaz" className="h-9 sm:h-10 text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Qty *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" className="h-9 sm:h-10 text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Unit *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PURCHASE_UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
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
                name="unitCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Cost *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" className="h-9 sm:h-10 text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Total Cost Display */}
            <div className="p-2.5 sm:p-3 bg-muted rounded-lg">
              <div className="text-[10px] sm:text-sm text-muted-foreground">Total Cost</div>
              <div className="text-lg sm:text-xl font-bold">{formatCurrency(totalCost)}</div>
            </div>

            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Purchase Date *</FormLabel>
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
                {form.formState.isSubmitting ? 'Saving...' : purchase ? 'Update' : 'Add Purchase'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
