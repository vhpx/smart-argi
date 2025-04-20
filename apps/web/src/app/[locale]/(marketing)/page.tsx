import MarketingClientPage from './client-page';
import {
  fetchAuroraForecast,
  fetchAuroraMLMetrics,
  fetchAuroraStatisticalMetrics,
} from '@/lib/aurora';

export default async function MarketingPage() {
  const forecast = await fetchAuroraForecast();
  const mlMetrics = await fetchAuroraMLMetrics();
  const statsMetrics = await fetchAuroraStatisticalMetrics();

  if (!forecast || !mlMetrics || !statsMetrics) {
    return <div>Error loading data</div>;
  }

  return (
    <MarketingClientPage
      forecast={forecast}
      mlMetrics={mlMetrics}
      statsMetrics={statsMetrics}
    />
  );
}
