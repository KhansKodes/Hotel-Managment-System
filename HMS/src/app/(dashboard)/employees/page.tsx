'use client';

import { useState, useMemo } from 'react';
import { useHMS } from '@/context/hms-context';
import { AppHeader } from '@/components/layout/app-header';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate, getStatusColor, exportToCSV } from '@/lib/utils';
import { Users, MoreHorizontal, Edit, Trash2, Download, Phone, Mail, Search, X } from 'lucide-react';
import { EmployeeSheet } from '@/components/employees/employee-sheet';
import type { Employee } from '@/lib/types';

export default function EmployeesPage() {
  const { employees, loading, deleteEmployee } = useHMS();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter employees based on search and status
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        searchQuery === '' ||
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (employee.email && employee.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (employee.phone && employee.phone.includes(searchQuery));

      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, searchQuery, statusFilter]);

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsSheetOpen(true);
  };

  const handleAdd = () => {
    setEditingEmployee(undefined);
    setIsSheetOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteEmployee(deleteId);
      setDeleteId(null);
    }
  };

  const handleExport = () => {
    exportToCSV(
      filteredEmployees.map((e) => ({
        Name: e.name,
        Designation: e.designation,
        'Monthly Salary': e.salaryMonthly,
        Phone: e.phone || '',
        Email: e.email || '',
        'Joining Date': e.joiningDate ? formatDate(e.joiningDate) : '',
        Status: e.status,
      })),
      'employees'
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all';

  if (loading) {
    return (
      <>
        <AppHeader />
        <main className="p-3 sm:p-6">
          <Skeleton className="h-8 w-48 mb-4 sm:mb-6" />
          <div className="space-y-3 sm:hidden">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96 hidden sm:block" />
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="p-3 sm:p-6">
        <PageHeader
          title="Employees"
          description="Manage your restaurant staff"
          action={{ label: 'Add Employee', onClick: handleAdd }}
        >
          {employees.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport} className="h-8 sm:h-9">
              <Download className="mr-1.5 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">CSV</span>
            </Button>
          )}
        </PageHeader>

        {/* Search and Filters */}
        {employees.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, designation, email or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px] h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                    <X className="mr-1 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Results count */}
              {hasActiveFilters && (
                <p className="text-xs text-muted-foreground mt-2">
                  Showing {filteredEmployees.length} of {employees.length} employees
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {employees.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={Users}
                title="No employees yet"
                description="Start by adding your first employee to manage your restaurant staff."
                action={{ label: 'Add Employee', onClick: handleAdd }}
              />
            </CardContent>
          </Card>
        ) : filteredEmployees.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={Search}
                title="No results found"
                description="Try adjusting your search or filter to find what you're looking for."
                action={{ label: 'Clear Filters', onClick: clearFilters }}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="space-y-3 sm:hidden">
              {filteredEmployees.map((employee) => (
                <Card key={employee.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                        {employee.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-sm truncate">{employee.name}</h3>
                            <p className="text-xs text-muted-foreground">{employee.designation}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(employee)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(employee.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {employee.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {employee.phone}
                            </span>
                          )}
                          {employee.email && (
                            <span className="flex items-center gap-1 truncate max-w-[150px]">
                              <Mail className="h-3 w-3" />
                              {employee.email}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-semibold">{formatCurrency(employee.salaryMonthly)}/mo</span>
                          <Badge variant="secondary" className={`${getStatusColor(employee.status)} text-[10px]`}>
                            {employee.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden sm:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="hidden md:table-cell">Designation</TableHead>
                        <TableHead className="hidden lg:table-cell">Contact</TableHead>
                        <TableHead className="text-right">Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                                {employee.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-sm truncate">{employee.name}</div>
                                <div className="text-xs text-muted-foreground md:hidden">{employee.designation}</div>
                                {employee.joiningDate && (
                                  <div className="text-xs text-muted-foreground hidden lg:block">
                                    Joined {formatDate(employee.joiningDate)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{employee.designation}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="space-y-1">
                              {employee.phone && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {employee.phone}
                                </div>
                              )}
                              {employee.email && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-[150px]">{employee.email}</span>
                                </div>
                              )}
                              {!employee.phone && !employee.email && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium text-sm">
                            {formatCurrency(employee.salaryMonthly)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${getStatusColor(employee.status)} text-xs`}>
                              {employee.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(employee)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteId(employee.id)}
                                  className="text-destructive"
                                >
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
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <EmployeeSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        employee={editingEmployee}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </>
  );
}
