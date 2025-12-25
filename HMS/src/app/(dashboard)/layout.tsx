'use client';

import { useAuth } from '@/context/auth-context';
import { HMSProvider } from '@/context/hms-context';
import { Sidebar, SidebarProvider, SidebarPlaceholder, useSidebar } from '@/components/layout/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          'lg:pl-[240px]',
          collapsed && 'lg:pl-[70px]'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col lg:flex-row">
        {/* Desktop Sidebar Skeleton */}
        <div className="hidden lg:block w-[240px] border-r border-border bg-card p-4 shrink-0">
          <Skeleton className="h-10 w-full mb-6" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        {/* Mobile Header Skeleton */}
        <div className="lg:hidden h-14 border-b border-border bg-card px-3 flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-20" />
        </div>
        {/* Main Content Skeleton */}
        <div className="flex-1 p-4 sm:p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 sm:h-32" />
            ))}
          </div>
          <Skeleton className="h-64 sm:h-96" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Auth context will redirect to login
  }

  return (
    <HMSProvider>
      <SidebarProvider>
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </HMSProvider>
  );
}
