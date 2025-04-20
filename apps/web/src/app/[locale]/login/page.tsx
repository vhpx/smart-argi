import LoginForm from './form';
import { getTranslations } from 'next-intl/server';
<<<<<<< HEAD
import Link from 'next/link';
=======
import Image from 'next/image';
>>>>>>> main
import { Suspense } from 'react';

export default async function Login() {
  const t = await getTranslations();

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center p-8 py-16 lg:py-32">
      <div className="grid max-w-md gap-2">
        {/* <div className="flex items-center justify-center">
          <h1 className="relative flex w-fit items-center gap-2">
            <Image
              src="/media/logos/transparent.png"
              width={128}
              height={128}
              alt="Smart Agri Logo"
            />
          </h1>
        </div> */}

        <Suspense fallback={<div>{t('common.loading')}...</div>}>
          <LoginForm />
        </Suspense>
<<<<<<< HEAD

        <Separator className="mt-2" />
        <div className="text-center text-sm font-semibold text-balance text-foreground/50">
          {t('auth.notice-p1')}{' '}
          <Link
            href="https://smartargi.ai/terms"
            target="_blank"
            className="text-foreground/70 underline decoration-foreground/70 underline-offset-2 transition hover:text-foreground hover:decoration-foreground"
          >
            {t('auth.tos')}
          </Link>{' '}
          {t('common.and')}{' '}
          <Link
            href="https://smartargi.ai/privacy"
            target="_blank"
            className="text-foreground/70 underline decoration-foreground/70 underline-offset-2 transition hover:text-foreground hover:decoration-foreground"
          >
            {t('auth.privacy')}
          </Link>{' '}
          {t('auth.notice-p2')}.
        </div>
=======
>>>>>>> main
      </div>
    </div>
  );
}
