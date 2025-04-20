import { getWorkspace } from '@/lib/workspace-helper';
import FeatureSummary from '@tuturuuu/ui/custom/feature-summary';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{
    wsId: string;
  }>;
}

export default async function WorkspaceHomePage({ params }: Props) {
  const t = await getTranslations();
  const { wsId } = await params;

  const workspace = await getWorkspace(wsId);

  if (!workspace) notFound();

  return (
    <>
      <FeatureSummary
        pluralTitle={t('ws-home.home')}
        description={
          <>
            {t('ws-home.description_p1')}{' '}
            <span className="font-semibold text-foreground underline">
              {workspace.name || t('common.untitled')}
            </span>{' '}
            {t('ws-home.description_p2')}
          </>
        }
      />
    </>
  );
}
