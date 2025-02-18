import AdvancedAnalytics from './advanced-analytics';
<<<<<<< HEAD
=======
import AuroraActions from './aurora-actions';
import { InventoryCategoryStatistics } from './categories/inventory';
import { UsersCategoryStatistics } from './categories/users';
>>>>>>> main
import CommodityComparison from './commodity-comparison';
import DashboardChart from './dashboard';
import PricePredictionChart from './price-prediction-chart';
<<<<<<< HEAD
import { getWorkspace } from '@/lib/workspace-helper';
import FeatureSummary from '@repo/ui/components/ui/custom/feature-summary';
import { Separator } from '@repo/ui/components/ui/separator';
=======
import {
  BatchesStatistics,
  InventoryProductsStatistics,
  ProductCategoriesStatistics,
  ProductsStatistics,
  PromotionsStatistics,
  SuppliersStatistics,
  UnitsStatistics,
  UserGroupTagsStatistics,
  UserGroupsStatistics,
  UserReportsStatistics,
  UsersStatistics,
  WarehousesStatistics,
} from './statistics';
import LoadingStatisticCard from '@/components/loading-statistic-card';
import { getCurrentSupabaseUser } from '@/lib/user-helper';
import {
  getPermissions,
  getWorkspace,
  verifySecret,
} from '@/lib/workspace-helper';
import FeatureSummary from '@tutur3u/ui/custom/feature-summary';
import { Separator } from '@tutur3u/ui/separator';
>>>>>>> main
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

<<<<<<< HEAD
      <Separator className="my-4" />
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-4">
          <DashboardChart />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PricePredictionChart />
            <CommodityComparison />
=======
      {(await verifySecret({
        forceAdmin: true,
        wsId,
        name: 'ENABLE_AI',
        value: 'true',
      })) &&
        containsPermission('ai_lab') && (
          <>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 gap-4">
              {user?.email?.endsWith('@tuturuuu.com') && <AuroraActions />}
              <DashboardChart />
              <PricePredictionChart />
              <CommodityComparison />
              <AdvancedAnalytics />
            </div>
          </>
        )}

      {ENABLE_AI_ONLY || (
        <>
          {' '}
          <Separator className="my-4" />
          <FinanceStatistics wsId={wsId} searchParams={searchParams} />
          <InventoryCategoryStatistics wsId={wsId} />
          <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Suspense fallback={<LoadingStatisticCard />}>
              <ProductsStatistics wsId={wsId} />
            </Suspense>

            <Suspense fallback={<LoadingStatisticCard />}>
              <InventoryProductsStatistics wsId={wsId} />
            </Suspense>

            <Suspense fallback={<LoadingStatisticCard />}>
              <ProductCategoriesStatistics wsId={wsId} />
            </Suspense>

            <Suspense fallback={<LoadingStatisticCard />}>
              <BatchesStatistics wsId={wsId} />
            </Suspense>

            <Suspense fallback={<LoadingStatisticCard />}>
              <WarehousesStatistics wsId={wsId} />
            </Suspense>

            <Suspense fallback={<LoadingStatisticCard />}>
              <UnitsStatistics wsId={wsId} />
            </Suspense>

            <Suspense fallback={<LoadingStatisticCard />}>
              <SuppliersStatistics wsId={wsId} />
            </Suspense>

            <Suspense fallback={<LoadingStatisticCard />}>
              <PromotionsStatistics wsId={wsId} />
            </Suspense>
>>>>>>> main
          </div>
          <AdvancedAnalytics />
        </div>
      </div>
    </>
  );
}
