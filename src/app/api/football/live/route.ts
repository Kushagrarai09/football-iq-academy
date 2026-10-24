import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const API_BASE = "https://v3.football.api-sports.io";

export async function GET(request: Request) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Live scores are not configured yet.", code: "API_KEY_MISSING", matches: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "live";
  const league = url.searchParams.get("league");
  if (!["live", "upcoming", "finished"].includes(type)) {
    return NextResponse.json({ error: "Unsupported fixture type." }, { status: 400 });
  }

  const params = new URLSearchParams();
  if (type === "live") {
    params.set("live", "all");
  } else {
    const today = new Date().toISOString().slice(0, 10);
    const defaultFrom = type === "finished"
      ? new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
      : today;
    const defaultTo = type === "finished"
      ? today
      : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    params.set("from", url.searchParams.get("from") ?? defaultFrom);
    params.set("to", url.searchParams.get("to") ?? defaultTo);
    params.set("status", type === "finished" ? "FT-AET-PEN" : "NS-TBD");
  }
  if (league && /^\d+$/.test(league)) params.set("league", league);

  try {
    const upstream = await fetch(`${API_BASE}/fixtures?${params.toString()}`, {
      headers: { "x-apisports-key": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: "The football data provider could not return fixtures.", code: "PROVIDER_ERROR", matches: [] }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }

    const payload = await upstream.json() as { errors?: Record<string, unknown> | unknown[]; response?: unknown[] };
    const hasErrors = Array.isArray(payload.errors) ? payload.errors.length > 0 : Boolean(payload.errors && Object.keys(payload.errors).length);
    if (hasErrors) {
      return NextResponse.json({ error: "The provider rejected the request. Check your API key, plan and query limits.", code: "PROVIDER_REJECTED", matches: [] }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ matches: payload.response ?? [], updatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Football data is temporarily unavailable.", code: "UPSTREAM_UNAVAILABLE", matches: [] }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
