import { createClient } from '@tuturuuu/supabase/next/server';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  const supabase = await createClient();

  const json = await req.json();

  const { error } = await supabase
    .from('healthcare_vitals')
    .upsert(json?.data || []);

  if (error) {
    console.log(error);
    return NextResponse.json(
      { message: 'Error migrating workspace users' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'success' });
}
