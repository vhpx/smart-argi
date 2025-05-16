import LoginForm from './form';
import { Separator } from '@tuturuuu/ui/separator';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function Login() {
  const t = await getTranslations();

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center p-8 py-16 lg:py-32">
      <div className="grid max-w-md gap-2">
        <Suspense fallback={<div>{t('common.loading')}...</div>}>
          <LoginForm />
        </Suspense>

        <Separator className="mt-2" />
        <div className="text-foreground/50 text-balance text-center text-sm font-semibold">
          {t('auth.notice-p1')}{' '}
          <Link
            href="https://smartargi.ai/terms"
            target="_blank"
            className="text-foreground/70 decoration-foreground/70 hover:text-foreground hover:decoration-foreground underline underline-offset-2 transition"
          >
            {t('auth.tos')}
          </Link>{' '}
          {t('common.and')}{' '}
          <Link
            href="https://smartargi.ai/privacy"
            target="_blank"
            className="text-foreground/70 decoration-foreground/70 hover:text-foreground hover:decoration-foreground underline underline-offset-2 transition"
          >
            {t('auth.privacy')}
          </Link>{' '}
          {t('auth.notice-p2')}.
        </div>
      </div>
    </div>
  );
}
