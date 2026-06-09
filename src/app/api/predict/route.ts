import { NextRequest, NextResponse } from 'next/server';

const RAILWAY_URL = process.env.PREDICT_API_URL;

export async function POST(request: NextRequest) {
  if (!RAILWAY_URL) {
    return NextResponse.json(
      { error: 'PREDICT_API_URL environment variable is not set.' },
      { status: 503 },
    );
  }

  const body = await request.json();

  const upstream = await fetch(`${RAILWAY_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
