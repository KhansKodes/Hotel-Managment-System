'use client';
import { BudgetDashboard } from "@/components/budget/budget-dashboard";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/header";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
       <>
        <Header />
        <div className="container max-w-screen-2xl py-8 space-y-8">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </>
    )
  }

  return <BudgetDashboard />;
}
