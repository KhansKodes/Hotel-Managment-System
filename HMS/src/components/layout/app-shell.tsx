'use client';

import { Sidebar } from './sidebar';
import { AppHeader } from './app-header';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-[240px] transition-all duration-300">
        <AppHeader title={title} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

