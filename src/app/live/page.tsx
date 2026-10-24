"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/SiteShell";

type LiveMatch = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string; elapsed: number | null };
  };
  league: { id: number; name: string; country: string; logo: string | null };
  teams: {
    home: { name: string; logo: string | null };
    away: { name: string; logo: string | null };
  };
  goals: { home: number | null; away: number | null };
};

type LiveResponse = {
  matches?: LiveMatch[];
  error?: string;
  code?: string;
  updatedAt?: string;
};

function statusLabel(match: LiveMatch) {
  const status = match.fixture.status;
  if (status.short === "HT") return "HALF-TIME";
  if (status.short === "BT") return "BREAK";
  if (status.short === "P") return "PENALTIES";
  if (status.short === "ET") return status.elapsed == null ? "EXTRA TIME" : `ET ${status.elapsed}'`;
  if (status.short === "LIVE" || status.short === "1H" || status.short === "2H") {
    return status.elapsed == null ? "LIVE" : `${status.elapsed}'`;
  }
  if (status.short === "INT") return "INTERRUPTED";
  return status.long || "LIVE";
}

function TeamBadge({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="live-team">
      {logo ? (
        // Provider-supplied crest URL. An onError fallback prevents broken images.
        <img
          src={logo}
          alt=""
          width={34}
          height={34}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className="live-team__placeholder" aria-hidden="true">⚽</span>
      )}
      <span>{name}</span>
    </div>
  );
}

export default function LiveScoresPage() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await fetch("/api/football/live", { cache: "no-store" });
      const data = (await response.json()) as LiveResponse;

      if (data.code === "API_KEY_MISSING") {
        setSetupRequired(true);
        setError("");
        setMatches([]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to load live scores.");
      }

      setSetupRequired(false);
      setError("");
      setMatches(data.matches ?? []);
      setUpdatedAt(data.updatedAt ?? new Date().toISOString());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load live scores.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMatches();
    const timer = window.setInterval(() => void loadMatches(true), 60_000);
    return () => window.clearInterval(timer);
  }, [loadMatches]);

  return (
    <div className="live-page">
      <div className="live-page__breadcrumb">
        <Link href="/">Home</Link><span>/</span><span>Live scores</span>
      </div>

      <PageHeader
        eyebrow="Worldwide match centre"
        title="Live football scores"
        description="Follow live scores from competitions around the world. Match availability and details depend on your football data provider's coverage."
      />

      <section className="live-toolbar" aria-label="Live score controls">
        <div className="live-toolbar__title">
          <span className="live-pulse" aria-hidden="true" />
          <div>
            <strong>Live now</strong>
            <p>{matches.length} {matches.length === 1 ? "match" : "matches"} currently returned by the provider</p>
          </div>
        </div>
        <div className="live-toolbar__actions">
          {updatedAt && (
            <span className="live-updated">
              Updated {new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button className="arcade-button arcade-button--quiet" type="button" onClick={() => void loadMatches(true)} disabled={refreshing || loading}>
            {refreshing ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>
      </section>

      {setupRequired && (
        <section className="live-state live-state--setup" role="status">
          <div className="live-state__icon">🔑</div>
          <div>
            <h2>Connect your football data API</h2>
            <p>Live scores will appear here after you add your API-Football key as a server-side environment variable.</p>
            <ol>
              <li>Create or sign in to an account at <a href="https://www.api-football.com/" target="_blank" rel="noreferrer">API-Football ↗</a> and review its plan and coverage.</li>
              <li>Add <code>API_FOOTBALL_KEY</code> to your local <code>.env.local</code> file.</li>
              <li>Add the same variable under your Vercel project's environment variables, then redeploy.</li>
            </ol>
            <p className="small">Never add the key to client-side code or commit it to Git.</p>
          </div>
        </section>
      )}

      {error && !setupRequired && (
        <section className="live-state live-state--error" role="alert">
          <div><h2>Live scores unavailable</h2><p>{error}</p></div>
          <button className="arcade-button arcade-button--quiet" type="button" onClick={() => void loadMatches()}>Try again</button>
        </section>
      )}

      {loading && !setupRequired && (
        <div className="live-match-grid" aria-label="Loading live matches">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="live-skeleton" key={index}><span /><span /><span /></div>
          ))}
        </div>
      )}

      {!loading && !error && !setupRequired && matches.length === 0 && (
        <section className="live-state" role="status">
          <div className="live-state__icon">🌍</div>
          <h2>No live matches returned right now</h2>
          <p>There may be no matches in progress, or the provider may not cover a competition at this moment. Check again closer to kick-off.</p>
          <button className="arcade-button" type="button" onClick={() => void loadMatches()}>Check again</button>
        </section>
      )}

      {!setupRequired && matches.length > 0 && (
        <section className="live-match-grid" aria-label="Live football matches">
          {matches.map((match) => (
            <article className="live-match-card" key={match.fixture.id}>
              <div className="live-match-card__competition">
                {match.league.logo ? <img src={match.league.logo} alt="" width={22} height={22} loading="lazy" /> : <span>🏆</span>}
                <div><strong>{match.league.name}</strong><span>{match.league.country}</span></div>
                <span className="live-status">{statusLabel(match)}</span>
              </div>
              <div className="live-match-card__teams">
                <TeamBadge name={match.teams.home.name} logo={match.teams.home.logo} />
                <div className="live-score" aria-label={`Score ${match.goals.home ?? 0} to ${match.goals.away ?? 0}`}>
                  <strong>{match.goals.home ?? "–"}</strong><span>:</span><strong>{match.goals.away ?? "–"}</strong>
                </div>
                <TeamBadge name={match.teams.away.name} logo={match.teams.away.logo} />
              </div>
              <div className="live-match-card__footer">
                <span>{match.fixture.status.long}</span>
                <span>Match ID {match.fixture.id}</span>
              </div>
            </article>
          ))}
        </section>
      )}

      <p className="live-disclaimer">
        Scores are supplied by API-Football and may be delayed. Coverage, update frequency and available match details depend on the provider plan. This site does not stream live video.
      </p>
    </div>
  );
}
