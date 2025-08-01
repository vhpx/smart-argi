import NavbarActions from '../../navbar-actions';
import { UserNav } from '../../user-nav';
import InvitationCard from './invitation-card';
import { Structure } from './structure';
import type { NavLink } from '@/components/navigation';
import {
  MAIN_CONTENT_SIZE_COOKIE_NAME,
  SIDEBAR_COLLAPSED_COOKIE_NAME,
  SIDEBAR_SIZE_COOKIE_NAME,
} from '@/constants/common';
import { getPermissions, getWorkspace } from '@/lib/workspace-helper';
import {
  ChartArea,
  Clock,
  Cog,
  Database,
  HardDrive,
  ScanSearch,
} from '@tuturuuu/ui/icons';
import { getCurrentUser } from '@tuturuuu/utils/user-helper';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

interface LayoutProps {
  params: Promise<{
    wsId: string;
  }>;
  children: ReactNode;
}

export default async function Layout({ children, params }: LayoutProps) {
  const t = await getTranslations();
  const { wsId } = await params;

  const { withoutPermission } = await getPermissions({
    wsId,
  });

  const navLinks: (NavLink | null)[] = [
    {
      title: t('common.dashboard'),
      href: `/${wsId}`,
      icon: <ChartArea className="h-4 w-4" />,
      matchExact: true,
      shortcut: 'D',
    },
    null,
    // {
    //   title: t('sidebar_tabs.models'),
    //   href: `/${wsId}/models`,
    //   icon: <Box className="h-4 w-4" />,
    //   disabled: withoutPermission('ai_lab'),
    // },
    {
      title: t('sidebar_tabs.datasets'),
      href: `/${wsId}/datasets`,
      icon: <Database className="h-4 w-4" />,
      disabled: withoutPermission('ai_lab'),
    },
    // {
    //   title: t('sidebar_tabs.pipelines'),
    //   href: `/${wsId}/pipelines`,
    //   icon: <Play className="h-4 w-4" />,
    //   disabled: withoutPermission('ai_lab'),
    // },
    {
      title: t('sidebar_tabs.crawlers'),
      href: `/${wsId}/crawlers`,
      icon: <ScanSearch className="h-4 w-4" />,
      disabled: withoutPermission('ai_lab'),
    },
    {
      title: t('sidebar_tabs.cron'),
      href: `/${wsId}/cron`,
      icon: <Clock className="h-4 w-4" />,
      disabled: withoutPermission('ai_lab'),
    },
    // {
    //   title: t('sidebar_tabs.queues'),
    //   href: `/${wsId}/queues`,
    //   icon: <Logs className="h-4 w-4" />,
    //   disabled: withoutPermission('ai_lab'),
    // },
    {
      title: t('sidebar_tabs.drive'),
      href: `/${wsId}/drive`,
      icon: <HardDrive className="h-4 w-4" />,
      disabled: withoutPermission('manage_drive'),
      shortcut: 'R',
    },
    null,
    {
      title: t('common.settings'),
      href: `/${wsId}/settings`,
      icon: <Cog className="h-4 w-4" />,
      aliases: [
        `/${wsId}/members`,
        `/${wsId}/teams`,
        `/${wsId}/secrets`,
        `/${wsId}/infrastructure`,
        `/${wsId}/migrations`,
        `/${wsId}/activities`,
      ],
      shortcut: ',',
    },
  ];

  const workspace = await getWorkspace(wsId);
  const user = await getCurrentUser();

  const sidebarSize = (await cookies()).get(SIDEBAR_SIZE_COOKIE_NAME);
  const mainSize = (await cookies()).get(MAIN_CONTENT_SIZE_COOKIE_NAME);

  const collapsed = (await cookies()).get(SIDEBAR_COLLAPSED_COOKIE_NAME);

  const defaultLayout =
    sidebarSize !== undefined && mainSize !== undefined
      ? [JSON.parse(sidebarSize.value), JSON.parse(mainSize.value)]
      : undefined;

  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  if (!workspace) redirect('/onboarding');
  if (!workspace?.joined)
    return (
      <div className="flex h-screen w-screen items-center justify-center p-2 md:p-4">
        <InvitationCard workspace={workspace} />
      </div>
    );

  return (
    <Structure
      wsId={wsId}
      user={user}
      workspace={workspace}
      defaultLayout={defaultLayout}
      defaultCollapsed={defaultCollapsed}
      navCollapsedSize={4}
      links={navLinks}
      actions={
        <Suspense
          fallback={
            <div className="h-10 w-[88px] animate-pulse rounded-lg bg-foreground/5" />
          }
        >
          <NavbarActions />
        </Suspense>
      }
      userPopover={
        <Suspense
          fallback={
            <div className="h-10 w-10 animate-pulse rounded-lg bg-foreground/5" />
          }
        >
          <UserNav hideMetadata />
        </Suspense>
      }
    >
      {children}
    </Structure>
  );
}
