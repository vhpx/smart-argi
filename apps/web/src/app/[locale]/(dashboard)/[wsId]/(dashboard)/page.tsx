import AdvancedAnalytics from './advanced-analytics';
import CommodityComparison from './commodity-comparison';
import DashboardChart from './dashboard';
import PricePredictionChart from './price-prediction-chart';
import { getWorkspace } from '@/lib/workspace-helper';
import FeatureSummary from '@repo/ui/components/ui/custom/feature-summary';
import { Separator } from '@repo/ui/components/ui/separator';
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
            <span className="text-foreground font-semibold underline">
              {workspace.name || t('common.untitled')}
            </span>{' '}
            {t('ws-home.description_p2')}
          </>
        }
      />

      <Separator className="my-4" />
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-4">
          <DashboardChart />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PricePredictionChart />
            <CommodityComparison />
          </div>
          <AdvancedAnalytics />
        </div>
      </div>
    </>
  );
}
