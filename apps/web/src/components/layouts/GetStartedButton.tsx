'use client';

<<<<<<< HEAD
import { cn } from '@/lib/utils';
import { Button } from '@repo/ui/components/ui/button';
=======
import { Button } from '../components/ui/Button';
import { cn } from '@tutur3u/utils/format';
>>>>>>> main
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
            'text-foreground/50 pointer-events-none select-none opacity-50'
        )}
      >
        {t('common.get-started')}
      </Button>
    </Link>
  );
}
