'use client';

import { Button } from '../button';
import { LoadingIndicator } from './loading-indicator';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LanguageToggle({
  forceDisplay = false,
  currentLocale,
}: {
  forceDisplay?: boolean;
  currentLocale: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateLocale = async () => {
    setLoading(true);

    const res = await fetch('/api/v1/infrastructure/languages', {
      method: 'POST',
      body: JSON.stringify({ locale: currentLocale === 'en' ? 'vi' : 'en' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) router.refresh();
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={updateLocale}
      className={forceDisplay ? 'flex-none' : 'hidden flex-none md:flex'}
    >
      {loading ? <LoadingIndicator /> : currentLocale}
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}
