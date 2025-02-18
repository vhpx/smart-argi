'use client';

import { AuthButton } from './auth-button';
import { ThemeToggle } from './theme-toggle';
import type { SupabaseUser } from '@tutur3u/supabase/next/user';
import { WorkspaceUser } from '@tutur3u/types/primitives/WorkspaceUser';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@tutur3u/ui/sheet';
import { cn } from '@tutur3u/utils/format';
import { MenuIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface MenuProps {
  sbUser: SupabaseUser | null;
  user: WorkspaceUser | null;
  t?: any;
}

interface NavLinkProps {
  item: NavItem;
  onClick?: () => void;
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  external?: boolean;
  badge?: string;
}

const navItems = (t: any) => {
  return [{ href: '/', label: t('common.home') }] as NavItem[];
};

const NavLink: React.FC<NavLinkProps> = ({ item, onClick, className }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  const linkProps = {
    href: item.href,
    className: cn(
      'transition-opacity duration-200',
      isActive ? 'opacity-100' : 'opacity-50 hover:opacity-100',
      className
    ),
    onClick: onClick,
    ...(item.external && { target: '_blank', rel: 'noopener noreferrer' }),
  };

  return (
    <Link {...linkProps}>
      <span className="flex items-center gap-2">
        {item.label}
        {item.badge && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {item.badge}
          </span>
        )}
      </span>
    </Link>
  );
};

const MobileNavLink: React.FC<NavLinkProps> = ({
  item,
  className,
  onClick,
}) => <NavLink item={item} className={className} onClick={onClick} />;

const MobileMenu: React.FC<MenuProps> = ({ sbUser, user, t }) => {
  const [isOpened, setIsOpened] = useState(false);
  const closeMenu = () => setIsOpened(false);

  const items = navItems(t);
  const mainLinks = items.slice(0, 1); // Only home
  const products = items.filter(
    (item) =>
      item.href === '/meet-together' || item.href.startsWith('/products')
  );
  const solutions = items.filter((item) => item.href.startsWith('/solutions'));
  const resources = items.filter(
    (item) =>
      item.href.startsWith('/blog') ||
      item.href.startsWith('/changelog') ||
      item.href.startsWith('/pitch') ||
      item.href.startsWith('/branding') ||
      item.href.startsWith('https://')
  );
  const company = items.filter((item) =>
    ['/pricing', '/about', '/careers', '/contact'].includes(item.href)
  );

  return (
    <Sheet open={isOpened} onOpenChange={setIsOpened}>
      <SheetTrigger className="rounded-lg p-2 transition-all hover:bg-accent active:bg-accent/80">
        <MenuIcon className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-full border-l p-0 md:hidden">
        <SheetTitle />
        <div className="flex h-full flex-col">
          {/* Header with Auth and Theme */}
          <div className="border-b px-6 py-6">
            <div className={cn('items-center gap-3', user ? 'grid' : 'flex')}>
              <AuthButton
                user={sbUser}
                className="w-full items-center justify-center"
                onClick={closeMenu}
              />
              {!user && <ThemeToggle forceDisplay />}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col space-y-4 py-6">
              {/* Main Links */}
              <div className="px-6">
                <div className="grid gap-2 font-medium">
                  {mainLinks.map((item) => (
                    <MobileNavLink
                      key={item.href}
                      item={item}
                      onClick={closeMenu}
                      className="rounded-lg px-4 py-2.5 transition-all hover:bg-accent active:bg-accent/80"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const Menu: React.FC<MenuProps> = ({ sbUser, user }) => {
  const t = useTranslations();

  return (
    <>
      <div className="flex gap-2 md:hidden">
        <MobileMenu sbUser={sbUser} user={user} t={t} />
      </div>
    </>
  );
};

export default Menu;
