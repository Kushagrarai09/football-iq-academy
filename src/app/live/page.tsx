"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/SiteShell";

type LiveMatch = {
  fixture: { id: number; date: string; status: { short: string; long: string; elapsed: number | null } };
  league: { id: number; name: string; country: string; logo: string | null };
  teams: { home: { name: string; logo: string | null }; away: { name: string; logo: string | null } };
  goals: { home: number | null; away: number | null };
};
type LiveResponse = { matches?: LiveMatch[]; error?: string; code?: string; updatedAt?: string };
type MatchTab = "live" | "upcoming" | "finished";

function statusLabel(match: LiveMatch) {
  const status = match.fixture.status;
  if (status.short === "HT") return "HALF-TIME";
  if (status.short === "BT") return "BREAK";
  if (status.short === "P") return "PENALTIES";
  if (status.short === "ET") return status.elapsed == null ? "EXTRA TIME" : `ET ${status.elapsed}'`;
  if (["LIVE", "1H", "2H"].includes(status.short)) return status.elapsed == null ? "LIVE" : `${status.elapsed}'`;
  if (status.short === "INT") return "INTERRUPTED";
  if (["FT", "AET", "PEN"].includes(status.short)) return "FULL-TIME";
  return status.long || "LIVE";
}

function TeamBadge({ name, logo }: { name: string; logo: string | null }) {
  return <div className="live-team">
    {logo ? <img src={logo} alt="" width={34} height={34} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span className="live-team__placeholder" aria-hidden="true">⚽</span>}
    <span>{name}</span>
  </div>;
}

export default function LiveScoresPage() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<MatchTab>("live");
  const [leagueFilter, setLeagueFilter] = useState("all");

  const loadMatches = useCallback(async (quiet = false, requestedTab: MatchTab = tab) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await fetch(`/api/football/live?type=${requestedTab}`, { cache: "no-store" });
      const data = await response.json() as LiveResponse;
      if (data.code === "API_KEY_MISSING") { setSetupRequired(true); setError(""); setMatches([]); return; }
      if (!response.ok) throw new Error(data.error || "Unable to load matches.");
      setSetupRequired(false); setError(""); setMatches(data.matches ?? []);
      setUpdatedAt(data.updatedAt ?? new Date().toISOString());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load football matches.");
    } finally { setLoading(false); setRefreshing(false); }
  }, [tab]);

  useEffect(() => { void loadMatches(false, tab); }, [loadMatches, tab]);
  useEffect(() => {
    if (tab !== "live") return;
    const timer = window.setInterval(() => void loadMatches(true, "live"), 60_000);
    return () => window.clearInterval(timer);
  }, [loadMatches, tab]);

  const leagues = useMemo(() => [...new Map(matches.map((match) => [match.league.id, match.league])).values()].sort((a, b) => a.name.localeCompare(b.name)), [matches]);
  const visibleMatches = useMemo(() => matches.filter((match) => leagueFilter === "all" || String(match.league.id) === leagueFilter), [matches, leagueFilter]);

  function changeTab(next: MatchTab) { setTab(next); setLeagueFilter("all"); }

  return <div className="live-page">
    <div className="live-page__breadcrumb"><Link href="/">Home</Link><span>/</span><span>Live scores</span></div>
    <PageHeader eyebrow="Worldwide match centre" title="Live football scores" description="Follow football fixtures and results from competitions around the world. Coverage depends on your football data provider." />
    <div className="match-list-controls">
      <div className="match-tabs" role="tablist" aria-label="Match status">
        {(["live", "upcoming", "finished"] as const).map((value) => <button key={value} role="tab" aria-selected={tab === value} className={tab === value ? "match-tab is-active" : "match-tab"} onClick={() => changeTab(value)}>{value === "live" ? "🔴 Live now" : value === "upcoming" ? "Upcoming" : "Finished"}</button>)}
      </div>
      <label className="league-filter">League
        <select value={leagueFilter} onChange={(event) => setLeagueFilter(event.target.value)} disabled={!leagues.length}>
          <option value="all">All competitions ({matches.length})</option>
          {leagues.map((league) => <option key={league.id} value={String(league.id)}>{league.name} · {league.country}</option>)}
        </select>
      </label>
      <div className="match-list-refresh">{updatedAt && <span>Updated {new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}<button className="arcade-button arcade-button--quiet" type="button" onClick={() => void loadMatches(false, tab)} disabled={refreshing || loading}>{refreshing ? "Refreshing…" : "↻ Refresh"}</button></div>
    </div>

    {setupRequired && <section className="live-state live-state--setup" role="status"><div className="live-state__icon">🔑</div><div><h2>Connect your football data API</h2><p>Fixtures and match details appear after you add an API-Football key as a server-side environment variable.</p><ol><li>Create an account at <a href="https://www.api-football.com/" target="_blank" rel="noreferrer">API-Football ↗</a> and check its plan and coverage.</li><li>Add <code>API_FOOTBALL_KEY</code> to local <code>.env.local</code>.</li><li>Add the same variable to Vercel environment settings, then redeploy.</li></ol><p className="small">Keep the key private and never commit it to Git.</p></div></section>}
    {error && !setupRequired && <section className="live-state live-state--error" role="alert"><div><h2>Matches unavailable</h2><p>{error}</p></div><button className="arcade-button arcade-button--quiet" type="button" onClick={() => void loadMatches(false, tab)}>Try again</button></section>}
    {loading && !setupRequired && <div className="live-match-grid" aria-label="Loading fixtures">{Array.from({ length: 3 }, (_, i) => <div className="live-skeleton" key={i}><span /><span /><span /></div>)}</div>}
    {!loading && !error && !setupRequired && visibleMatches.length === 0 && <section className="live-state" role="status"><div className="live-state__icon">{tab === "upcoming" ? "🗓️" : tab === "finished" ? "🏁" : "🌍"}</div><h2>{tab === "upcoming" ? "No upcoming matches returned" : tab === "finished" ? "No finished matches returned" : "No live matches returned right now"}</h2><p>Try another competition or check again later. The provider's fixtures and subscription coverage determine what can be displayed.</p><button className="arcade-button" type="button" onClick={() => void loadMatches(false, tab)}>Check again</button></section>}
    {!setupRequired && visibleMatches.length > 0 && <section className="live-match-grid" aria-label="Football fixtures">{visibleMatches.map((match) => <article className="live-match-card" key={match.fixture.id}>
      <div className="live-match-card__competition">{match.league.logo ? <img src={match.league.logo} alt="" width={22} height={22} loading="lazy" /> : <span>🏆</span>}<div><strong>{match.league.name}</strong><span>{match.league.country}</span></div><span className="live-status">{statusLabel(match)}</span></div>
      <Link href={`/live/${match.fixture.id}`} className="live-match-card__link" aria-label={`View match centre for ${match.teams.home.name} versus ${match.teams.away.name}`}>
        <div className="live-match-card__teams"><TeamBadge name={match.teams.home.name} logo={match.teams.home.logo} /><div className="live-score" aria-label={`Score ${match.goals.home ?? "unknown"} to ${match.goals.away ?? "unknown"}`}><strong>{match.goals.home ?? "–"}</strong><span>:</span><strong>{match.goals.away ?? "–"}</strong></div><TeamBadge name={match.teams.away.name} logo={match.teams.away.logo} /></div>
        <div className="live-match-card__footer"><span>{tab === "upcoming" ? new Date(match.fixture.date).toLocaleString() : match.fixture.status.long}</span><span>Match Centre ↗</span></div>
      </Link>
    </article>)}</section>}
    <p className="live-disclaimer">Scores and match details are provided by API-Football and may be delayed or incomplete. Details and competition coverage vary by subscription. This page does not stream live video.</p>
  </div>;
}
