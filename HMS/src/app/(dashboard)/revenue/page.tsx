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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/utils';
import { DollarSign, MoreHorizontal, Edit, Trash2, Download, Search, X } from 'lucide-react';
import { RevenueSheet } from '@/components/revenue/revenue-sheet';
import { format, getMonth, getYear, setMonth, setYear } from 'date-fns';
import { DEFAULT_REVENUE_CATEGORIES, type Revenue } from '@/lib/types';

export default function RevenuePage() {
  const { monthlyRevenues, loading, deleteRevenue, currentDate, setCurrentDate } = useHMS();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter revenues based on search and category
  const filteredRevenues = useMemo(() => {
    return monthlyRevenues.filter((revenue) => {
      const matchesSearch =
        searchQuery === '' ||
        revenue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (revenue.customerName && revenue.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (revenue.notes && revenue.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || revenue.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [monthlyRevenues, searchQuery, categoryFilter]);

  const handleEdit = (revenue: Revenue) => {
    setEditingRevenue(revenue);
    setIsSheetOpen(true);
  };

  const handleAdd = () => {
    setEditingRevenue(undefined);
    setIsSheetOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteRevenue(deleteId);
      setDeleteId(null);
    }
  };

  const handleExport = () => {
    exportToCSV(
      filteredRevenues.map((r) => ({
        Description: r.description,
        Category: r.category,
        Amount: r.amount,
        Customer: r.customerName || '',
        'Payment Method': r.paymentMethod || '',
        Date: formatDate(r.revenueDate),
        Notes: r.notes || '',
      })),
      `sales-${format(currentDate, 'yyyy-MM')}`
    );
  };

  const handleMonthChange = (month: string) => {
    setCurrentDate(setMonth(currentDate, parseInt(month)));
  };

  const handleYearChange = (year: string) => {
    setCurrentDate(setYear(currentDate, parseInt(year)));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'all';

  const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i),
    label: format(new Date(0, i), 'MMMM'),
  }));

  const totalRevenue = filteredRevenues.reduce((sum, r) => sum + r.amount, 0);

  if (loading) {
    return (
      <>
        <AppHeader />
        <main className="p-3 sm:p-6">
          <Skeleton className="h-8 w-48 mb-4 sm:mb-6" />
          <div className="space-y-3 sm:hidden">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
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
          title="Sales & Revenue"
          description={`${format(currentDate, 'MMM yyyy')} • Total: ${formatCurrency(totalRevenue)}`}
          action={{ label: 'Add Sale', onClick: handleAdd }}
        >
          <Select value={String(getMonth(currentDate))} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[100px] sm:w-[130px] h-8 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(getYear(currentDate))} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[70px] sm:w-[90px] h-8 sm:h-10 text-xs sm:text-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {monthlyRevenues.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport} className="h-8 sm:h-9">
              <Download className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
        </PageHeader>

        {/* Search and Filters */}
        {monthlyRevenues.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by description, customer, or notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>

                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[150px] h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {DEFAULT_REVENUE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
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
                  Showing {filteredRevenues.length} of {monthlyRevenues.length} sales
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {monthlyRevenues.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={DollarSign}
                title="No sales yet"
                description="Record your restaurant's income from dine-in, takeaway, delivery, and catering orders."
                action={{ label: 'Add Sale', onClick: handleAdd }}
              />
            </CardContent>
          </Card>
        ) : filteredRevenues.length === 0 ? (
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
              {filteredRevenues.map((revenue) => (
                <Card key={revenue.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm truncate">{revenue.description}</h3>
                          <Badge variant="outline" className="mt-1 text-[10px] h-5 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200">
                            {revenue.category}
                          </Badge>
                          {revenue.customerName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {revenue.customerName}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(revenue)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(revenue.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-2 pt-2 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{formatDate(revenue.revenueDate)}</span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">+{formatCurrency(revenue.amount)}</span>
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
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="hidden md:table-cell">Customer</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRevenues.map((revenue) => (
                        <TableRow key={revenue.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{revenue.description}</div>
                              {revenue.notes && (
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {revenue.notes}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground md:hidden">
                                {formatDate(revenue.revenueDate)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200">
                              {revenue.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="text-xs text-muted-foreground">
                              {revenue.customerName || '—'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600 dark:text-green-400 text-sm">
                            +{formatCurrency(revenue.amount)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{formatDate(revenue.revenueDate)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(revenue)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteId(revenue.id)}
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

      <RevenueSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        revenue={editingRevenue}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Sale"
        description="Are you sure you want to delete this sale record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </>
  );
}
