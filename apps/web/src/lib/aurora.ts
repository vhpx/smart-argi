import { API_URL } from "@/constants/common";
import type {
  AuroraForecast,
  AuroraMLMetrics,
  AuroraStatisticalMetrics,
} from "@tuturuuu/types/db";

const AURORA_API_KEY = process.env.AURORA_API_KEY;

export async function fetchAuroraForecast(): Promise<AuroraForecast | null> {
  const res = await fetch(
    `${API_URL}/v1/aurora/forecast?key=${AURORA_API_KEY}`,
  );
  if (!res.ok) return null;
  return res.json();
}

export async function fetchAuroraStatisticalMetrics(): Promise<
  AuroraStatisticalMetrics[] | null
> {
  const res = await fetch(
    `${API_URL}/v1/aurora/statistical-metrics?key=${AURORA_API_KEY}`,
  );
  if (!res.ok) return null;
  return res.json();
}

export async function fetchAuroraMLMetrics(): Promise<
  AuroraMLMetrics[] | null
> {
  const res = await fetch(
    `${API_URL}/v1/aurora/ml-metrics?key=${AURORA_API_KEY}`,
  );
  if (!res.ok) return null;
  return res.json();
}
