<<<<<<< HEAD
import { type NextRequest, NextResponse } from "next/server";
=======
import { createClient } from '@tuturuuu/supabase/next/server';
import { NextResponse } from 'next/server';
>>>>>>> main

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const key = searchParams.get("key");

  if (key !== process.env.AURORA_API_KEY) {
    return NextResponse.json(
      { message: "Invalid API key" },
      { status: 401 },
    );
  }

  const res = await fetch(`${process.env.AURORA_EXTERNAL_URL}/health`);

  if (!res.ok) {
    return NextResponse.json(
      { message: "Error fetching health" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Success" });
}
