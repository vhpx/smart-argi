import { SectionProps } from './index';
import { getInitials } from '@/utils/name-helper';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@tutur3u/supabase/next/client';
import { WorkspaceUser } from '@tutur3u/types/primitives/WorkspaceUser';
import { Avatar, AvatarFallback, AvatarImage } from '@tutur3u/ui/avatar';
import { Button } from '@tutur3u/ui/button';
import SearchBar from '@tutur3u/ui/custom/search-bar';
import { cn } from '@tutur3u/utils/format';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function RoleFormMembersSection({
  wsId,
  roleId,
  form,
  onUpdate,
}: SectionProps & {
  onUpdate: React.Dispatch<React.SetStateAction<number>>;
}) {
  const t = useTranslations();
  const [query, setQuery] = useState('');

  const workspaceMembersQuery = useQuery({
    queryKey: ['workspaces', wsId, 'members'],
    queryFn: () => getWorkspaceUsers(wsId),
  });

  const roleMembersQuery = useQuery({
    queryKey: ['workspaces', wsId, 'roles', roleId, 'members', { query }],
    queryFn: roleId ? () => getUsers(roleId, query) : undefined,
    enabled: !!roleId,
  });

  const users = workspaceMembersQuery.data?.data || [];
  const roleUsers = roleMembersQuery.data?.data || [];

  useEffect(() => {
    if (roleMembersQuery.isFetched) onUpdate(roleMembersQuery.data?.count || 0);
  }, [roleMembersQuery.isFetched, roleMembersQuery.data?.count, onUpdate]);

  // const handleNewMembers = async (memberIds: string[]) => {
  //   const res = await fetch(
  //     `/api/v1/workspaces/${wsId}/roles/${roleId}/members`,
  //     {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ memberIds }),
  //     }
  //   );

  //   if (res.ok) {
  //     roleMembersQuery.refetch();
  //   }
  // };

  const handleRemoveMember = async (memberId: string) => {
    const res = await fetch(
      `/api/v1/workspaces/${wsId}/roles/${roleId}/members/${memberId}`,
      {
        method: 'DELETE',
      }
    );

    if (res.ok) {
      roleMembersQuery.refetch();
    }
  };

  return (
    <>
      <div className="mb-2 rounded-md border border-dynamic-blue/20 bg-dynamic-blue/10 p-2 text-center font-bold text-dynamic-blue">
        {form.watch('name') || '-'}
      </div>
      <div className="flex items-center gap-2">
        <SearchBar t={t} className={cn('w-full')} onSearch={setQuery} />
      </div>
      {roleUsers.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-2">
          {roleUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-start justify-between gap-2 rounded-md border p-2"
            >
              <div className="flex items-center gap-2 p-2">
                <Avatar className="relative h-12 w-12 overflow-visible font-semibold">
                  <AvatarImage
                    src={user?.avatar_url ?? undefined}
                    className="overflow-clip rounded-full border border-foreground/50"
                  />
                  <AvatarFallback className="border border-foreground/50 font-semibold">
                    {user?.display_name
                      ? getInitials(user?.display_name)
                      : null}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="font-semibold">
                    {users.find((u) => u.id === user.id)?.display_name ||
                      'No name'}
                  </div>
                  <div className="text-foreground/50">
                    {users.find((u) => u.id === user.id)?.email}
                  </div>
                </div>
              </div>
              <Button
                size="xs"
                type="button"
                variant="destructive"
                onClick={() => handleRemoveMember(user.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded border border-dashed p-4 text-center font-semibold text-foreground/50 md:p-8">
          This role has no members yet.
        </div>
      )}
    </>
  );
}

async function getWorkspaceUsers(wsId: string) {
  const supabase = createClient();

  const queryBuilder = supabase
    .from('workspace_members')
    .select(
      'id:user_id, ...users(display_name, ...user_private_details(email))',
      {
        count: 'exact',
      }
    )
    .eq('ws_id', wsId)
    .order('user_id');

  const { data, error, count } = await queryBuilder;
  if (error) throw error;

  return { data, count } as { data: WorkspaceUser[]; count: number };
}

async function getUsers(roleId: string, query?: string) {
  const supabase = createClient();

  const queryBuilder = supabase
    .from('workspace_role_members')
    .select('...users!inner(*)', {
      count: 'exact',
    })
    .eq('role_id', roleId);

  if (query) queryBuilder.ilike('users.display_name', `%${query}%`);

  const { data, count, error } = await queryBuilder;
  if (error) throw error;

  return { data, count } as { data: WorkspaceUser[]; count: number };
}
