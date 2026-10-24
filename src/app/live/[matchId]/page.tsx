"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Team = { id: number; name: string; logo: string | null };
type Match = {
  fixture: { id: number; date: string; venue?: { name: string | null; city: string | null }; referee?: string | null; status: { short: string; long: string; elapsed: number | null } };
  league: { name: string; country: string; logo: string | null; round?: string };
  teams: { home: Team; away: Team };
  goals: { home: number | null; away: number | null };
  score?: { halftime?: { home: number | null; away: number | null }; fulltime?: { home: number | null; away: number | null }; extratime?: { home: number | null; away: number | null }; penalty?: { home: number | null; away: number | null } };
};
type Event = { time?: { elapsed: number | null; extra?: number | null }; team?: { name: string }; player?: { name: string | null }; assist?: { name: string | null }; type: string; detail: string; comments?: string | null };
type Stat = { type: string; value: string | number | null };
type TeamStats = { team: { id: number; name: string; logo: string | null }; statistics: Stat[] };
type DetailData = { fixture: Match | null; events: Event[]; statistics: TeamStats[]; error?: string; code?: string };

function prettyStatus(match: Match) {
  const { short, long, elapsed } = match.fixture.status;
  if (short === "HT") return "Half-time";
  if (["FT", "AET", "PEN"].includes(short)) return "Full-time";
  if (["1H", "2H", "ET", "LIVE"].includes(short)) return elapsed == null ? long : `${elapsed}'`;
  return long;
}

function Crest({ team }: { team: Team }) {
  return <div className="match-centre-team">
    {team.logo ? <img src={team.logo} alt="" width={54} height={54} onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} /> : <span className="match-centre-crest" aria-hidden="true">⚽</span>}
    <strong>{team.name}</strong>
  </div>;
}

const valueLabel = (value: string | number | null) => value == null ? "—" : String(value);

export default function MatchCentrePage({ params }: { params: Promise<{ matchId: string }> }) {
  const [matchId, setMatchId] = useState("");
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { void params.then(({ matchId: id }) => setMatchId(id)); }, [params]);

  const load = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/football/matches/${matchId}`, { cache: "no-store" });
      const payload = await response.json() as DetailData;
      if (!response.ok) throw new Error(payload.error || "Could not load this match.");
      if (payload.code === "API_KEY_MISSING") throw new Error("Configure API_FOOTBALL_KEY to view live match details.");
      if (!payload.fixture) throw new Error("Match not found or not available from the provider.");
      setData(payload);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Match details are unavailable.");
    } finally { setLoading(false); }
  }, [matchId]);

  useEffect(() => { if (matchId) void load(); }, [matchId, load]);
  useEffect(() => {
    const status = data?.fixture?.fixture.status.short;
    if (!matchId || !status || !["1H", "2H", "ET", "LIVE", "HT"].includes(status)) return;
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [matchId, data?.fixture?.fixture.status.short, load]);

  const match = data?.fixture ?? null;
  const events = data?.events ?? [];
  const statistics = data?.statistics ?? [];

  return <div className="live-page match-centre-page">
    <div className="live-page__breadcrumb"><Link href="/live">← Back to matches</Link><span>/</span><span>Match centre</span></div>
    {loading && <div className="live-state"><div className="live-state__icon">⚽</div><h2>Loading match centre…</h2><p>Fetching score, timeline, cards and statistics.</p></div>}
    {error && !loading && <div className="live-state live-state--error" role="alert"><div><h2>Could not load match details</h2><p>{error}</p></div><button className="arcade-button" onClick={() => void load()}>Try again</button></div>}
    {!loading && match && <>
      <section className="match-centre-hero">
        <div className="match-centre-competition">{match.league.logo && <img src={match.league.logo} alt="" width={24} height={24} />}<span>{match.league.name} · {match.league.country}</span></div>
        <div className="match-centre-score">
          <Crest team={match.teams.home} />
          <div className="match-centre-score__middle">
            <div className="match-centre-score__goals"><strong>{match.goals.home ?? "–"}</strong><span>:</span><strong>{match.goals.away ?? "–"}</strong></div>
            <span className={["1H","2H","LIVE","ET"].includes(match.fixture.status.short) ? "match-centre-status is-live" : "match-centre-status"}>{prettyStatus(match)}</span>
            <span className="small">{new Date(match.fixture.date).toLocaleString()}</span>
          </div>
          <Crest team={match.teams.away} />
        </div>
        <div className="match-centre-meta">
          <span>{match.league.round ?? "Fixture"}</span>
          {match.fixture.venue?.name && <span>📍 {match.fixture.venue.name}{match.fixture.venue.city ? `, ${match.fixture.venue.city}` : ""}</span>}
          {match.fixture.referee && <span>🧑‍⚖️ {match.fixture.referee}</span>}
        </div>
      </section>

      <section className="match-centre-section">
        <div className="match-centre-section__head"><div><div className="eyebrow">Match timeline</div><h2>Goals, cards & substitutions</h2></div><span className="badge">{events.length} events</span></div>
        {events.length === 0 ? <div className="live-state"><h2>No events available yet</h2><p>Events may not be published for this fixture or may not be included in your API plan.</p></div> : <div className="match-timeline">{events.map((event, index) => {
          const minute = event.time?.elapsed == null ? "—" : `${event.time.elapsed}${event.time.extra ? `+${event.time.extra}` : ""}'`;
          const icon = /goal/i.test(event.type) ? "⚽" : /card/i.test(event.type) ? (/red/i.test(event.detail) ? "🟥" : "🟨") : /subst/i.test(event.type) ? "🔁" : "•";
          return <article className="match-timeline__event" key={`${minute}-${event.team?.name ?? "event"}-${index}`}>
            <span className="match-timeline__minute">{minute}</span><span className="match-timeline__icon" aria-hidden="true">{icon}</span>
            <div><strong>{event.player?.name ?? event.type}</strong><p>{event.detail}{event.assist?.name ? ` · Assist: ${event.assist.name}` : ""}</p>{event.team?.name && <span>{event.team.name}</span>}</div>
          </article>;
        })}</div>}
      </section>

      <section className="match-centre-section">
        <div className="match-centre-section__head"><div><div className="eyebrow">Team comparison</div><h2>Match statistics</h2></div></div>
        {statistics.length < 2 ? <div className="live-state"><h2>Statistics not available</h2><p>This provider does not currently return statistics for this match, or the competition is not covered by your plan.</p></div> : <div className="match-statistics">
          <div className="match-statistics__teams"><span>{statistics[0]?.team?.name ?? match.teams.home.name}</span><span>Metric</span><span>{statistics[1]?.team?.name ?? match.teams.away.name}</span></div>
          {statistics[0].statistics.map((stat) => {
            const away = statistics[1]?.statistics.find((item) => item.type === stat.type);
            const homeNumeric = Number(String(stat.value ?? "").replace("%", ""));
            const awayNumeric = Number(String(away?.value ?? "").replace("%", ""));
            const total = homeNumeric + awayNumeric;
            const homeWidth = Number.isFinite(total) && total > 0 ? Math.max(0, Math.min(100, homeNumeric / total * 100)) : 50;
            const awayWidth = 100 - homeWidth;
            return <div className="match-stat-row" key={stat.type}>
              <strong>{valueLabel(stat.value)}</strong><div className="match-stat-row__middle"><div className="match-stat-row__label">{stat.type}</div><div className="match-stat-row__bar"><span style={{ width: `${homeWidth}%` }} /><span style={{ width: `${awayWidth}%` }} /></div></div><strong>{valueLabel(away?.value ?? null)}</strong>
            </div>;
          })}
        </div>}
      </section>

      <section className="match-centre-section">
        <div className="match-centre-section__head"><div><div className="eyebrow">Final score details</div><h2>Score by period</h2></div></div>
        <div className="period-score-grid">
          {(["halftime","fulltime","extratime","penalty"] as const).map((period) => {
            const score = match.score?.[period];
            if (!score || (score.home == null && score.away == null)) return null;
            return <div className="period-score" key={period}><span>{period === "halftime" ? "Half-time" : period === "fulltime" ? "Full-time" : period === "extratime" ? "Extra time" : "Penalties"}</span><strong>{score.home ?? "–"} : {score.away ?? "–"}</strong></div>;
          })}
        </div>
      </section>
    </>}
    <p className="live-disclaimer">Match data is supplied by the football data provider and may be delayed or incomplete. Event and statistics coverage varies by competition and subscription.</p>
  </div>;
}
