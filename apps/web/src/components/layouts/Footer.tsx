'use client';

import { DEV_MODE } from '@/constants/common';
import { CommonFooter } from '@tuturuuu/ui/custom/common-footer';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const t = useTranslations();

  if (pathname.endsWith('/pitch')) return null;
<<<<<<< HEAD

  return (
    <div className="w-full text-center">
      <Separator className="bg-foreground/5" />
      <div className="text-balance p-4 text-center text-sm opacity-80 md:px-32 xl:px-64">
        {t('common.copyright')}
      </div>
    </div>
  );
=======
  return <CommonFooter t={t} devMode={DEV_MODE} />;
>>>>>>> main
}
