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
import type { Employee, EmployeeStatus } from '@/lib/types';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  designation: z.string().min(2, 'Designation is required'),
  salaryMonthly: z.coerce.number().min(0, 'Salary must be a positive number'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  joiningDate: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on-leave'] as const),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee;
}

export function EmployeeSheet({ open, onOpenChange, employee }: EmployeeSheetProps) {
  const { addEmployee, updateEmployee } = useHMS();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      designation: '',
      salaryMonthly: 0,
      phone: '',
      email: '',
      joiningDate: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name,
        designation: employee.designation,
        salaryMonthly: employee.salaryMonthly,
        phone: employee.phone || '',
        email: employee.email || '',
        joiningDate: employee.joiningDate || '',
        status: employee.status,
      });
    } else {
      form.reset({
        name: '',
        designation: '',
        salaryMonthly: 0,
        phone: '',
        email: '',
        joiningDate: '',
        status: 'active',
      });
    }
  }, [employee, open, form]);

  const onSubmit = async (values: EmployeeFormValues) => {
    const data = {
      ...values,
      email: values.email || undefined,
      phone: values.phone || undefined,
      joiningDate: values.joiningDate || undefined,
    };

    if (employee) {
      await updateEmployee(employee.id, data);
    } else {
      await addEmployee(data as any);
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="center" className="w-full sm:max-w-lg">
        <SheetHeader className="mb-4 sm:mb-6">
          <SheetTitle className="text-lg sm:text-xl">{employee ? 'Edit Employee' : 'Add Employee'}</SheetTitle>
          <SheetDescription className="text-xs sm:text-sm">
            {employee ? 'Update employee information' : 'Add a new employee to your restaurant staff'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="h-9 sm:h-10 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Designation *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Manager, Chef, Waiter" className="h-9 sm:h-10 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salaryMonthly"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Monthly Salary (PKR) *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50000" className="h-9 sm:h-10 text-sm" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+92 300 1234567" className="h-9 sm:h-10 text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" className="h-9 sm:h-10 text-sm" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="joiningDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Joining Date</FormLabel>
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 sm:h-10 text-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on-leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4 sm:pt-6 flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-9 sm:h-10 text-sm">
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto h-9 sm:h-10 text-sm">
                {form.formState.isSubmitting ? 'Saving...' : employee ? 'Update' : 'Add Employee'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
