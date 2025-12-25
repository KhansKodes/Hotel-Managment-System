'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
      {/* Title and Description */}
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold truncate">{title}</h1>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {action && (
          <Button onClick={action.onClick} size="sm" className="sm:h-9">
            <PlusCircle className="mr-1.5 sm:mr-2 h-4 w-4" />
            <span className="sm:inline">{action.label}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
