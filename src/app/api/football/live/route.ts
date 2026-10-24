import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_URL = "https://v3.football.api-sports.io/fixtures?live=all";

export async function GET() {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Live scores are not configured yet.",
        code: "API_KEY_MISSING",
        matches: [],
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const upstream = await fetch(API_URL, {
      method: "GET",
      headers: { "x-apisports-key": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: "The football data provider could not return live fixtures.",
          code: "PROVIDER_ERROR",
          matches: [],
        },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const payload = (await upstream.json()) as {
      errors?: Record<string, unknown> | unknown[];
      response?: unknown[];
    };

    const hasErrors = Array.isArray(payload.errors)
      ? payload.errors.length > 0
      : Boolean(payload.errors && Object.keys(payload.errors).length > 0);

    if (hasErrors) {
      return NextResponse.json(
        {
          error: "The football data provider rejected the request. Check your API key and plan.",
          code: "PROVIDER_REJECTED",
          matches: [],
        },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { matches: payload.response ?? [], updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Live scores are temporarily unavailable. Please try again.",
        code: "UPSTREAM_UNAVAILABLE",
        matches: [],
      },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
