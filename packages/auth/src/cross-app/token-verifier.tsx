import { TokenVerifierCore } from './token-verifier-core';
import { LoadingIndicator } from '@tuturuuu/ui/custom/loading-indicator';
import Image from 'next/image';
import { Suspense } from 'react';

export function TokenVerifier() {
  return (
    <div className="fixed inset-0 flex h-screen w-screen flex-col items-center justify-center gap-2">
      <div className="flex items-center justify-center">
        <h1 className="relative flex w-fit items-center gap-2">
          <Image
            src="/media/logos/transparent.png"
            width={128}
            height={128}
            alt="Tuturuuu Logo"
          />
        </h1>
      </div>
      <Suspense
        fallback={
          <div className="mt-4 flex h-fit w-full items-center justify-center">
            <LoadingIndicator className="h-10 w-10" />
          </div>
        }
      >
        <TokenVerifierCore />
      </Suspense>
    </div>
  );
}
