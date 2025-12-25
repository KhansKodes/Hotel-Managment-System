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
import { ShoppingCart, MoreHorizontal, Edit, Trash2, Download, Package, Search, X } from 'lucide-react';
import { PurchaseSheet } from '@/components/purchases/purchase-sheet';
import { format, getMonth, getYear, setMonth, setYear } from 'date-fns';
import { PURCHASE_CATEGORIES, type Purchase } from '@/lib/types';

export default function PurchasesPage() {
  const { monthlyPurchases, loading, deletePurchase, currentDate, setCurrentDate } = useHMS();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter purchases based on search and category
  const filteredPurchases = useMemo(() => {
    return monthlyPurchases.filter((purchase) => {
      const matchesSearch =
        searchQuery === '' ||
        purchase.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (purchase.supplierName && purchase.supplierName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || purchase.itemCategory === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [monthlyPurchases, searchQuery, categoryFilter]);

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setIsSheetOpen(true);
  };

  const handleAdd = () => {
    setEditingPurchase(undefined);
    setIsSheetOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deletePurchase(deleteId);
      setDeleteId(null);
    }
  };

  const handleExport = () => {
    exportToCSV(
      filteredPurchases.map((p) => ({
        'Item Name': p.itemName,
        Category: p.itemCategory || '',
        Quantity: p.quantity,
        Unit: p.unit,
        'Unit Cost': p.unitCost,
        'Total Cost': p.totalCost,
        Supplier: p.supplierName || '',
        Date: formatDate(p.purchaseDate),
        Notes: p.notes || '',
      })),
      `purchases-${format(currentDate, 'yyyy-MM')}`
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

  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.totalCost, 0);

  if (loading) {
    return (
      <>
        <AppHeader />
        <main className="p-3 sm:p-6">
          <Skeleton className="h-8 w-48 mb-4 sm:mb-6" />
          <div className="space-y-3 sm:hidden">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
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
          title="Purchases"
          description={`${format(currentDate, 'MMM yyyy')} • Total: ${formatCurrency(totalPurchases)}`}
          action={{ label: 'Add Purchase', onClick: handleAdd }}
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
          {monthlyPurchases.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport} className="h-8 sm:h-9">
              <Download className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
        </PageHeader>

        {/* Search and Filters */}
        {monthlyPurchases.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by item name or supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>

                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {PURCHASE_CATEGORIES.map((cat) => (
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
                  Showing {filteredPurchases.length} of {monthlyPurchases.length} purchases
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {monthlyPurchases.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={ShoppingCart}
                title="No purchases yet"
                description="Track your restaurant inventory purchases to monitor costs."
                action={{ label: 'Add Purchase', onClick: handleAdd }}
              />
            </CardContent>
          </Card>
        ) : filteredPurchases.length === 0 ? (
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
              {filteredPurchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm truncate">{purchase.itemName}</h3>
                          <p className="text-xs text-muted-foreground">
                            {purchase.quantity} {purchase.unit} @ {formatCurrency(purchase.unitCost)}
                          </p>
                          {purchase.itemCategory && (
                            <Badge variant="outline" className="mt-1.5 text-[10px] h-5">
                              {purchase.itemCategory}
                            </Badge>
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
                          <DropdownMenuItem onClick={() => handleEdit(purchase)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(purchase.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-2 pt-2 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{formatDate(purchase.purchaseDate)}</span>
                      <span className="text-sm font-semibold">{formatCurrency(purchase.totalCost)}</span>
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
                        <TableHead>Item</TableHead>
                        <TableHead className="hidden md:table-cell">Category</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right hidden lg:table-cell">Unit Cost</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{purchase.itemName}</div>
                              {purchase.supplierName && (
                                <div className="text-xs text-muted-foreground">
                                  From: {purchase.supplierName}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground md:hidden">
                                {formatDate(purchase.purchaseDate)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {purchase.itemCategory ? (
                              <Badge variant="outline" className="text-xs">{purchase.itemCategory}</Badge>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {purchase.quantity} {purchase.unit}
                          </TableCell>
                          <TableCell className="text-right text-sm hidden lg:table-cell">
                            {formatCurrency(purchase.unitCost)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-sm">
                            {formatCurrency(purchase.totalCost)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{formatDate(purchase.purchaseDate)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(purchase)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteId(purchase.id)}
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

      <PurchaseSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        purchase={editingPurchase}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Purchase"
        description="Are you sure you want to delete this purchase record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </>
  );
}
