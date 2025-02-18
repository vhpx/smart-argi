import AdvancedAnalytics from './advanced-analytics';
import AuroraActions from './aurora-actions';
import CommodityComparison from './commodity-comparison';
import Dashboard from './dashboard';
import PricePredictionChart from './price-prediction-chart';
import {
  fetchAuroraForecast,
  fetchAuroraMLMetrics,
  fetchAuroraStatisticalMetrics,
} from '@/lib/aurora';
import { getCurrentSupabaseUser } from '@/lib/user-helper';
import { getWorkspace } from '@/lib/workspace-helper';
import FeatureSummary from '@tutur3u/ui/custom/feature-summary';
import { Separator } from '@tutur3u/ui/separator';
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

  const user = await getCurrentSupabaseUser();
  const workspace = await getWorkspace(wsId);

  const forecast = await fetchAuroraForecast();
  const mlMetrics = await fetchAuroraMLMetrics();
  const statsMetrics = await fetchAuroraStatisticalMetrics();

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

      <Separator className="my-4" />
      <div className="grid grid-cols-1 gap-4">
        {user?.email?.endsWith('@tuturuuu.com') && <AuroraActions />}
        <Dashboard data={forecast} />
        <PricePredictionChart data={forecast} />
        <CommodityComparison data={forecast} />
        <AdvancedAnalytics
          mlMetrics={mlMetrics}
          statisticalMetrics={statsMetrics}
        />
      </div>
    </>
  );
}
