import { NextRequest, NextResponse } from 'next/server';

const PREDICT_BASE =
  process.env.PREDICT_API_URL ?? 'http://localhost:8000';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const upstream = await fetch(`${PREDICT_BASE}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
