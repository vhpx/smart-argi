'use client';

import { Button } from '@tuturuuu/ui/button';
import { cn } from '@tuturuuu/utils/format';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GetStartedButton() {
  const t = useTranslations();
  const pathname = usePathname();

  const hidden = pathname === '/login';

  return (
    <Link
      href={`/login${pathname !== '/' ? `?nextUrl=${encodeURIComponent(pathname)}` : ''}`}
    >
      <Button
        className={cn(
          hidden &&
            'pointer-events-none text-foreground/50 opacity-50 select-none'
        )}
      >
        {t('common.get-started')}
      </Button>
    </Link>
  );
}
