import LocalWorkspaceSelect from './local-workspace-select';
import NavbarActions from './navbar-actions';
import NavbarSeparator from './navbar-separator';
import { MainNavigationMenu } from './navigation-menu';
import ServerMenu from './server-menu';
<<<<<<< HEAD
import WorkspaceSelect from './workspace-select';
import { cn } from '@tutur3u/utils/format';
import Link from 'next/link';
=======
import { LogoTitle } from '@tuturuuu/ui/custom/logo-title';
import { Navbar as SharedNavbar } from '@tuturuuu/ui/navbar';
>>>>>>> main
import { Suspense } from 'react';

export default async function Navbar({
  hideMetadata = false,
  onlyOnMobile = false,
}: {
  hideMetadata?: boolean;
  onlyOnMobile?: boolean;
}) {
  const renderServerMenu = () => (
    <Suspense>
      <ServerMenu />
    </Suspense>
  );

  const renderNavbarActions = () => (
    <Suspense
      fallback={
        <div className="bg-foreground/5 h-10 w-[88px] animate-pulse rounded-lg" />
      }
    >
<<<<<<< HEAD
      <div
        id="navbar-content"
        className="bg-transparent px-4 py-2 font-semibold backdrop-blur-md md:px-8 lg:px-16 xl:px-32"
      >
        <div className="relative flex items-center justify-between gap-2 md:gap-4">
          <div className="flex w-full items-center gap-2">
            <Link href="/" className="flex flex-none items-center gap-2">
              {/* <Image
                src="/media/logos/transparent.png"
                className="h-8 w-8"
                width={32}
                height={32}
                alt="logo"
              /> */}
              <LogoTitle />
            </Link>
=======
      <NavbarActions hideMetadata={hideMetadata} />
    </Suspense>
  );
>>>>>>> main

  return (
    <SharedNavbar
      logo="/media/logos/transparent.png"
      title={<LogoTitle />}
      afterTitle={
        <Suspense
          fallback={
            <div className="bg-foreground/5 h-10 w-32 animate-pulse rounded-lg" />
          }
        >
          <LocalWorkspaceSelect />
        </Suspense>
      }
      navigationMenu={<MainNavigationMenu />}
      actions={
        <>
          {renderServerMenu()}
          {renderNavbarActions()}
        </>
      }
      separator={<NavbarSeparator />}
      onlyOnMobile={onlyOnMobile}
    />
  );
}
