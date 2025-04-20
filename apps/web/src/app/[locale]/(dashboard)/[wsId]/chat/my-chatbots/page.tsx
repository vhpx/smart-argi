import { groupTagColumns } from './columns';
import { CustomDataTable } from '@/components/custom-data-table';
import { createClient } from '@tuturuuu/supabase/next/server';
import { UserGroupTag } from '@tuturuuu/types/primitives/UserGroupTag';
import { Button } from '@tuturuuu/ui/button';
import FeatureSummary from '@tuturuuu/ui/custom/feature-summary';
import { Bot } from '@tuturuuu/ui/icons';
import { Separator } from '@tuturuuu/ui/separator';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface Props {
  params: Promise<{
    wsId: string;
  }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function WorkspaceUserGroupTagsPage({
  params,
  searchParams,
}: Props) {
  const { wsId } = await params;
  const { data, count } = await getGroupTags(wsId, await searchParams);
  const t = await getTranslations();

  const tags = data.map((tag) => ({
    ...tag,
    href: `/${wsId}/users/group-tags/${tag.id}`,
  }));

  return (
    <>
      <FeatureSummary
        pluralTitle={t('ai_chat.my_chatbots')}
        singularTitle={t('ws-ai-chatbots.singular')}
        description={t('ai_chat.my_chatbots_description')}
        createTitle={t('ws-ai-chatbots.create')}
        createDescription={t('ws-ai-chatbots.create_description')}
        action={
          <Link href={`/${wsId}/chat/my-chatbots/new`}>
            <Button>
              <Bot />
              {t('ws-ai-chatbots.create')}
            </Button>
          </Link>
        }
      />
      <Separator className="my-4" />
      <CustomDataTable
        columnGenerator={groupTagColumns}
        namespace="user-group-tag-data-table"
        data={tags}
        count={count}
        defaultVisibility={{
          id: false,
          color: false,
          created_at: false,
        }}
      />
    </>
  );
}

async function getGroupTags(
  wsId: string,
  {
    q,
    page = '1',
    pageSize = '10',
  }: { q?: string; page?: string; pageSize?: string }
) {
  const supabase = await createClient();

  const queryBuilder = supabase
    .from('workspace_user_group_tags')
    .select('*, group_ids:workspace_user_group_tag_groups(group_id)', {
      count: 'exact',
    })
    .eq('ws_id', wsId)
    .order('created_at', { ascending: false });

  if (q) queryBuilder.ilike('name', `%${q}%`);

  if (page && pageSize) {
    const parsedPage = parseInt(page);
    const parsedSize = parseInt(pageSize);
    const start = (parsedPage - 1) * parsedSize;
    const end = parsedPage * parsedSize;
    queryBuilder.range(start, end).limit(parsedSize);
  }

  const { data, error, count } = await queryBuilder;
  if (error) throw error;

  return {
    data: data.map(({ group_ids, ...tag }) => ({
      ...tag,
      group_ids: group_ids.map((group) => group.group_id),
    })),
    count,
  } as { data: UserGroupTag[]; count: number };
}
