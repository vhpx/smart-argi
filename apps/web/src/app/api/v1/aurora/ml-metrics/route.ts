import type { AuroraMLMetrics } from '../types';
import { createClient } from '@tutur3u/supabase/next/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const { data: ml_metrics } = await supabase
    .from('aurora_ml_metrics')
    .select('*');

  return NextResponse.json({ ml_metrics });
}

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  if (!user.email?.endsWith('@tuturuu.com')) {
    return NextResponse.json(
      { message: 'Unauthorized email domain' },
      { status: 403 }
    );
  }

  const res = await fetch(`${process.env.AURORA_EXTERNAL_URL}/ml_metrics`);

  if (!res.ok) {
    return NextResponse.json(
      { message: 'Error fetching forecast' },
      { status: 500 }
    );
  }

  const data = (await res.json()) as AuroraMLMetrics;

  const { error } = await supabase.from('aurora_ml_metrics').insert(
    Object.entries(data).map(([model, prediction]) => ({
      ws_id: process.env.AURORA_EXTERNAL_WSID!,
      model,
      rmse: prediction.RMSE,
      directional_accuracy: prediction.Directional_Accuracy,
      turning_point_accuracy: prediction.Turning_Point_Accuracy,
      weighted_score: prediction.Weighted_Score,
    }))
  );

  if (error)
    return NextResponse.json(
      { message: 'Error creating ML metrics' },
      { status: 500 }
    );

  return NextResponse.json({ message: 'Success', data });
}
