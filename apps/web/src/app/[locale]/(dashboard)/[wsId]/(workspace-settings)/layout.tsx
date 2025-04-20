import { NavLink, Navigation } from '@/components/navigation';
import { getPermissions, getWorkspace } from '@/lib/workspace-helper';
import { getCurrentUser } from '@tuturuuu/utils/user-helper';
import { getTranslations } from 'next-intl/server';
import React from 'react';

interface LayoutProps {
  params: Promise<{
    wsId: string;
  }>;
  children: React.ReactNode;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { wsId } = await params;
  const { withoutPermission } = await getPermissions({
    wsId,
  });

  const t = await getTranslations();

  const workspace = await getWorkspace(wsId);
  const user = await getCurrentUser();

  const navLinks: NavLink[] = [
    {
      title: t('workspace-settings-layout.workspace'),
      href: `/${wsId}/settings`,
      matchExact: true,
    },
    {
      title: t('workspace-settings-layout.members'),
      href: `/${wsId}/members`,
      disabled: withoutPermission('manage_workspace_members'),
    },
    {
      title: t('workspace-settings-layout.roles'),
      href: `/${wsId}/roles`,
      disabled: withoutPermission('manage_workspace_roles'),
    },
    {
      title: t('workspace-settings-layout.api_keys'),
      href: `/${wsId}/api-keys`,
      disabled: withoutPermission('manage_workspace_security'),
    },
    {
      title: t('workspace-settings-layout.secrets'),
      href: `/${wsId}/secrets`,
      disabled: withoutPermission('manage_workspace_secrets'),
      requireRootMember: true,
    },
  ];

  return (
    <div>
      <Navigation
        currentWsId={wsId}
        currentRole={workspace?.role}
        currentUser={user}
        navLinks={navLinks}
      />
      {children}
    </div>
  );
}
