import { TokenVerifierCore } from './token-verifier-core';
import { LoadingIndicator } from '@tuturuuu/ui/custom/loading-indicator';
import { Suspense } from 'react';

export function TokenVerifier() {
  return (
    <div className="fixed inset-0 flex h-screen w-screen flex-col items-center justify-center gap-2">
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
