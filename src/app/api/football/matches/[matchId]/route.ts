import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const API_BASE = "https://v3.football.api-sports.io";

export async function GET(
  _request: Request,
  context: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await context.params;
  if (!/^\d+$/.test(matchId)) {
    return NextResponse.json({ error: "Invalid match ID." }, { status: 400 });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Live scores are not configured yet.", code: "API_KEY_MISSING" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const endpoints = [
    ["fixture", `${API_BASE}/fixtures?id=${matchId}`],
    ["events", `${API_BASE}/fixtures/events?fixture=${matchId}`],
    ["statistics", `${API_BASE}/fixtures/statistics?fixture=${matchId}`],
  ] as const;

  try {
    const values = await Promise.all(endpoints.map(async ([key, endpoint]) => {
      const response = await fetch(endpoint, {
        headers: { "x-apisports-key": apiKey },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Provider request failed");
      const payload = await response.json() as { errors?: Record<string, unknown> | unknown[]; response?: unknown[] };
      const hasErrors = Array.isArray(payload.errors) ? payload.errors.length > 0 : Boolean(payload.errors && Object.keys(payload.errors).length);
      if (hasErrors) throw new Error("Provider rejected request");
      return [key, payload.response ?? []] as const;
    }));

    const data = Object.fromEntries(values);
    return NextResponse.json({
      fixture: (data.fixture as unknown[])[0] ?? null,
      events: data.events ?? [],
      statistics: data.statistics ?? [],
      updatedAt: new Date().toISOString(),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Match details are temporarily unavailable. Check provider coverage and API usage." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
