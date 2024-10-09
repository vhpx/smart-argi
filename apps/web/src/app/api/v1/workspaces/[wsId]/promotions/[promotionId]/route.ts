import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

interface Params {
  params: {
    promotionId: string;
  };
}

export async function PUT(req: Request, { params }: Params) {
  const supabase = await createClient();
  const data = await req.json();
  const { promotionId } = params;

  const { error } = await supabase
    .from('workspace_promotions')
    .update({
      ...data,
      // TODO: better handling boolean value, as expand to further units
      unit: undefined,
      use_ratio: data.unit === 'percentage' ? true : false,
    })
    .eq('id', promotionId);

  if (error) {
    // TODO: logging
    console.log(error);
    return NextResponse.json(
      { message: 'Error updating promotion' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'success' });
}

export async function DELETE(_: Request, { params }: Params) {
  const supabase = await createClient();
  const { promotionId } = params;

  const { error } = await supabase
    .from('workspace_promotions')
    .delete()
    .eq('ws_id', promotionId);

  if (error) {
    console.log(error);
    return NextResponse.json(
      { message: 'Error deleting workspace user' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'success' });
}
