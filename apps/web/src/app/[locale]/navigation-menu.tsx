'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@repo/ui/components/ui/badge';
import { NavigationMenuLink } from '@repo/ui/components/ui/navigation-menu';
import * as React from 'react';

export function MainNavigationMenu() {
  return <></>;
}

const ListItem = React.forwardRef<
  React.ComponentRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & {
    title: string;
    icon: React.ReactNode;
    badge?: string;
    disabled?: boolean;
  }
>(({ className, title, icon, badge, disabled, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'outline-hidden group relative block h-full select-none space-y-1 rounded-md p-4 leading-none no-underline transition-all duration-300',
            'via-primary/10 to-primary/5 hover:bg-gradient-to-br',
            'opacity-90 hover:opacity-100',
            'hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
          {...props}
        >
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="text-primary transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
                {icon}
              </div>
              <div className="text-sm font-semibold leading-none">{title}</div>
              {badge && (
                <Badge
                  variant="secondary"
                  className="ml-auto flex-none animate-pulse text-xs"
                >
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-snug opacity-80 transition-opacity duration-300 group-hover:opacity-100">
              {children}
            </p>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
