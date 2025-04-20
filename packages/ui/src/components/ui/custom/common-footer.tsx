import { Separator } from '../separator';

export function CommonFooter({ t }: { t: any; devMode: boolean }) {
  return (
    <div className="w-full text-center">
      {/* {pathname.startsWith('/contact') || (
            <>
              <Separator className="bg-foreground/5 mb-8" />
              <div className="flex flex-col items-center">
                <Slogan />
              </div>
            </>
          )} */}

      <Separator className="mt-8 bg-foreground/5" />
      <div className="p-4 text-center text-sm text-balance opacity-80 md:px-32 xl:px-64">
        {t('common.copyright')}
      </div>
    </div>
  );
}
