"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createInitialState, DEFAULT_MATCH_SECONDS } from "@/game/constants";
import { emptyInput, passBall, resetKickoff, shootBall, switchControlledPlayer, tickGame, type GameCommand, type InputState } from "@/game/engine";
import { playGameSound } from "@/game/audio";
import type { Difficulty, GamePlayer, GameState, MatchStatus } from "@/game/types";

const BASE = { w: 960, h: 540 };
const formatTime = (seconds: number) => {
  const remaining = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
};

export default function ArcadeFootballGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef(new Set<string>());
  const inputRef = useRef<InputState>(emptyInput());
  const stateRef = useRef<GameState>(createInitialState(DEFAULT_MATCH_SECONDS));
  const statusRef = useRef<MatchStatus>("menu");
  const dimensionsRef = useRef({ width: 960, height: 540, dpr: 1 });
  const lastFrameRef = useRef(0);
  const lastHudRef = useRef(0);
  const rafRef = useRef(0);
  const shotStartedRef = useRef<number | null>(null);

  const [status, setStatus] = useState<MatchStatus>("menu");
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [timeLeft, setTimeLeft] = useState(DEFAULT_MATCH_SECONDS);
  const [message, setMessage] = useState("Set up your match");
  const [fullscreen, setFullscreen] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [duration, setDuration] = useState(DEFAULT_MATCH_SECONDS);
  const [muted, setMuted] = useState(false);
  const [shots, setShots] = useState(0);
  const [passes, setPasses] = useState(0);

  const publishStatus = useCallback((next: MatchStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const beginMatch = useCallback(() => {
    const state = createInitialState(duration);
    state.difficulty = difficulty;
    state.muted = muted;
    state.status = "playing";
    stateRef.current = state;
    inputRef.current = emptyInput();
    keysRef.current.clear();
    shotStartedRef.current = null;
    lastFrameRef.current = 0;
    publishStatus("playing");
    setScore({ home: 0, away: 0 });
    setTimeLeft(duration);
    setShots(0);
    setPasses(0);
    setMessage("Kick-off! Keep possession and attack the right goal.");
  }, [difficulty, duration, muted, publishStatus]);

  const pauseMatch = useCallback(() => {
    const state = stateRef.current;
    if (state.status === "playing") {
      state.status = "paused";
      publishStatus("paused");
      setMessage("Match paused");
    } else if (state.status === "paused") {
      state.status = "playing";
      publishStatus("playing");
      setMessage("Back in play");
    }
    keysRef.current.clear();
    inputRef.current = emptyInput();
    shotStartedRef.current = null;
    lastFrameRef.current = 0;
  }, [publishStatus]);

  const restartMatch = useCallback(() => {
    const state = createInitialState(duration);
    state.difficulty = difficulty;
    state.muted = muted;
    stateRef.current = state;
    publishStatus("menu");
    setScore({ home: 0, away: 0 });
    setTimeLeft(duration);
    setShots(0);
    setPasses(0);
    setMessage("Match reset. Ready for kick-off?");
    inputRef.current = emptyInput();
    keysRef.current.clear();
    shotStartedRef.current = null;
    lastFrameRef.current = 0;
  }, [difficulty, duration, muted, publishStatus]);

  const toggleFullscreen = useCallback(async () => {
    const target = gameRef.current;
    if (!target) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await target.requestFullscreen();
    } catch {
      setMessage("Full screen is not available in this browser.");
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(220, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dimensionsRef.current = { width, height, dpr };
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    resize();

    const keyMap: Record<string, GameCommand> = {
      a: "left", arrowleft: "left",
      d: "right", arrowright: "right",
      w: "up", arrowup: "up",
      s: "down", arrowdown: "down",
      shift: "sprint",
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) return;
      const ownsFocus = stage.contains(document.activeElement);
      if (!ownsFocus) return;
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", " ", "w", "a", "s", "d", "j", "e", "p", "f", "shift"].includes(key)) event.preventDefault();
      if (event.repeat && [" ", "j", "p", "f", "e"].includes(key)) return;
      if (key in keyMap) {
        keysRef.current.add(key);
        const command = keyMap[key];
        if (command === "left") inputRef.current.left = true;
        if (command === "right") inputRef.current.right = true;
        if (command === "up") inputRef.current.up = true;
        if (command === "down") inputRef.current.down = true;
        if (command === "sprint") inputRef.current.sprint = true;
      }
      if (key === " ") {
        if (statusRef.current === "playing") shotStartedRef.current = performance.now();
      } else if (key === "j") {
        if (passBall(stateRef.current)) {
          setPasses((value) => value + 1);
          setMessage("Pass played");
          playGameSound("kick", stateRef.current.muted);
        } else setMessage("Get close to the ball to pass");
      } else if (key === "e") {
        const next = switchControlledPlayer(stateRef.current);
        if (next) setMessage(`Now controlling ${next.role}`);
      } else if (key === "p") {
        if (statusRef.current === "playing" || statusRef.current === "paused") pauseMatch();
      } else if (key === "f") {
        void toggleFullscreen();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keysRef.current.delete(key);
      const command = keyMap[key];
      if (command === "left") inputRef.current.left = false;
      if (command === "right") inputRef.current.right = false;
      if (command === "up") inputRef.current.up = false;
      if (command === "down") inputRef.current.down = false;
      if (command === "sprint") inputRef.current.sprint = false;
      if (key === " ") {
        const started = shotStartedRef.current;
        shotStartedRef.current = null;
        if (started !== null && statusRef.current === "playing") {
          const chargeSeconds = Math.max(0, Math.min(0.9, (performance.now() - started) / 1000));
          if (shootBall(stateRef.current, chargeSeconds)) {
            setShots((value) => value + 1);
            setMessage(chargeSeconds > 0.45 ? "Power shot!" : "Shot away!");
            playGameSound("kick", stateRef.current.muted);
          } else setMessage("Get near the ball to shoot");
        }
      }
    };

    const clearKeys = () => {
      keysRef.current.clear();
      inputRef.current = emptyInput();
      shotStartedRef.current = null;
      lastFrameRef.current = 0;
    };
    const onFullscreenChange = () => {
      setFullscreen(Boolean(document.fullscreenElement));
      requestAnimationFrame(resize);
    };
    const onVisibility = () => clearKeys();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearKeys);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibility);

    const drawPitch = (width: number, height: number, state: GameState) => {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.scale(width / BASE.w, height / BASE.h);

      const sky = ctx.createLinearGradient(0, 0, 0, BASE.h);
      sky.addColorStop(0, "#0b2018");
      sky.addColorStop(1, "#07110f");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, BASE.w, BASE.h);
      ctx.fillStyle = "#10291f";
      ctx.fillRect(0, 52, BASE.w, 440);

      for (let i = 0; i < 24; i++) {
        const x = i * 42;
        ctx.fillStyle = i % 2 ? "#1b392b" : "#152f24";
        ctx.fillRect(x, 15, 34, 32);
        ctx.fillStyle = "#b8ff54";
        ctx.globalAlpha = 0.18 + (i % 3) * 0.08;
        ctx.fillRect(x + 9, 20, 3, 4);
        ctx.globalAlpha = 1;
      }

      const field = { x: 32, y: 72, w: 896, h: 400 };
      ctx.fillStyle = "#165738";
      ctx.fillRect(field.x, field.y, field.w, field.h);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? "#1b6641" : "#17613c";
        ctx.fillRect(field.x + i * field.w / 8, field.y, field.w / 8, field.h);
      }

      ctx.strokeStyle = "#d7f5d8";
      ctx.lineWidth = 2;
      ctx.strokeRect(42, 82, 876, 380);
      ctx.beginPath();
      ctx.moveTo(480, 82);
      ctx.lineTo(480, 462);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(480, 272, 64, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#eaffea";
      ctx.beginPath();
      ctx.arc(480, 272, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeRect(42, 174, 106, 196);
      ctx.strokeRect(812, 174, 106, 196);
      ctx.strokeRect(42, 220, 40, 104);
      ctx.strokeRect(878, 220, 40, 104);
      ctx.strokeStyle = "#f3f5ed";
      ctx.lineWidth = 5;
      ctx.strokeRect(18, 230, 24, 84);
      ctx.strokeRect(918, 230, 24, 84);
      ctx.lineWidth = 1;
      for (const goalX of [18, 918]) {
        ctx.strokeStyle = "#ffffff72";
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.moveTo(goalX + i * 6, 230);
          ctx.lineTo(goalX + i * 6, 314);
          ctx.stroke();
        }
        for (let y = 244; y < 314; y += 14) {
          ctx.beginPath();
          ctx.moveTo(goalX, y);
          ctx.lineTo(goalX + 24, y);
          ctx.stroke();
        }
      }

      const playerPixels = (player: GamePlayer) => ({ x: field.x + player.x * field.w, y: field.y + player.y * field.h });
      for (const player of state.players) {
        const point = playerPixels(player);
        const home = player.team === "home";
        const selected = player.id === state.controlledPlayerId;
        const walking = player.mode === "run";
        const stride = walking ? Math.sin(performance.now() / 75 + point.x) * 4 : 0;

        ctx.fillStyle = "#06120c88";
        ctx.beginPath();
        ctx.ellipse(point.x, point.y + 12, 15, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(point.x, point.y - (player.mode === "jump" ? 14 : 0));
        ctx.scale(player.facing, 1);
        ctx.fillStyle = home ? "#b8ff54" : "#fafaf6";
        if (player.role === "goalkeeper") ctx.fillStyle = home ? "#4de0a5" : "#ffb65b";
        if (selected) {
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, -17, 21, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.roundRect(-12, -28, 24, 28, 7);
        ctx.fill();
        ctx.fillStyle = "#f0f5ed";
        ctx.beginPath();
        ctx.arc(0, -36, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#193322";
        ctx.beginPath();
        ctx.arc(3, -37, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = home ? "#b8ff54" : "#fafaf6";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-5, -3);
        ctx.lineTo(-10, 9 + stride);
        ctx.moveTo(5, -3);
        ctx.lineTo(10, 9 - stride);
        ctx.stroke();
        ctx.restore();
      }

      const ball = state.ball;
      const bx = field.x + ball.x * field.w;
      const by = field.y + ball.y * field.h - ball.z * 70;
      ctx.fillStyle = "#07120d88";
      ctx.beginPath();
      ctx.ellipse(field.x + ball.x * field.w, field.y + ball.y * field.h + 4, 8 + ball.z * 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#07110f";
      ctx.beginPath();
      ctx.arc(bx, by, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f4f7f3";
      ctx.beginPath();
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#24382e";
      ctx.beginPath();
      ctx.moveTo(bx - 3, by - 4);
      ctx.lineTo(bx + 2, by - 5);
      ctx.lineTo(bx + 5, by);
      ctx.lineTo(bx, by + 3);
      ctx.closePath();
      ctx.fill();

      if (state.status === "goal") {
        ctx.fillStyle = "#07110fd9";
        ctx.fillRect(0, 0, BASE.w, BASE.h);
        ctx.textAlign = "center";
        ctx.fillStyle = "#b8ff54";
        ctx.font = "900 48px Arial";
        ctx.fillText("GOOOAL!", BASE.w / 2, BASE.h / 2 - 12);
        ctx.fillStyle = "#f4f7f3";
        ctx.font = "700 18px Arial";
        ctx.fillText(`${state.score.home} — ${state.score.away}`, BASE.w / 2, BASE.h / 2 + 28);
      } else if (state.status === "paused" || state.status === "menu" || state.status === "finished") {
        ctx.fillStyle = "#07110fcc";
        ctx.fillRect(0, 0, BASE.w, BASE.h);
        ctx.textAlign = "center";
        ctx.fillStyle = "#b8ff54";
        ctx.font = "900 34px Arial";
        ctx.fillText(state.status === "paused" ? "PAUSED" : state.status === "finished" ? "FULL TIME" : "KICK-OFF CLUB", BASE.w / 2, BASE.h / 2);
      }
      ctx.restore();
    };

    const frame = (now: number) => {
      const state = stateRef.current;
      const dt = lastFrameRef.current ? Math.min((now - lastFrameRef.current) / 1000, 0.033) : 0;
      lastFrameRef.current = now;
      const oldStatus = state.status;
      const oldScore = state.score.home + state.score.away;

      if (state.status === "playing") tickGame(state, inputRef.current, dt);
      if (state.status === "goal") {
        if (oldStatus !== "goal") {
          setMessage(state.lastScorer === "home" ? "GOAL! Great finish." : "The computer scores!");
          playGameSound("goal", state.muted);
        }
        state.goalTimer -= dt;
        if (state.goalTimer <= 0) {
          resetKickoff(state, true);
          setMessage("Kick-off! Play on.");
        }
      }
      if (state.status === "finished" && oldStatus !== "finished") {
        setMessage("Full time — match complete.");
        playGameSound("whistle", state.muted);
      }
      const newScore = state.score.home + state.score.away;
      if (newScore !== oldScore || state.status === "goal") setScore({ ...state.score });

      if (statusRef.current !== state.status) publishStatus(state.status);
      if (now - lastHudRef.current > 160) {
        lastHudRef.current = now;
        setTimeLeft(Math.max(0, state.duration - state.elapsed));
        setScore({ ...state.score });
      }

      drawPitch(dimensionsRef.current.width, dimensionsRef.current.height, state);
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearKeys);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [publishStatus, toggleFullscreen]);

  return (
    <div ref={gameRef} className={`arcade-game ${fullscreen ? "arcade-game--fullscreen" : ""}`}>
      <div className="arcade-game__topbar">
        <div><span className="arcade-eyebrow">ARCADE MODE · SMALL-SIDED MATCH</span><h2>Kick-off Club</h2><p>Build attacks with your teammates and face computer-controlled opponents.</p></div>
        <div className="arcade-game__actions">
          <button className="arcade-button arcade-button--quiet" onClick={pauseMatch}>{status === "paused" ? "▶ Resume" : "Ⅱ Pause"} <kbd>P</kbd></button>
          <button className="arcade-button" onClick={() => void toggleFullscreen()}>{fullscreen ? "↙ Exit full screen" : "⛶ Full screen"} <kbd>F</kbd></button>
          <button className="arcade-button arcade-button--quiet" onClick={restartMatch}>↻ Restart</button>
        </div>
      </div>

      <div className="arcade-scoreboard">
        <div><span className="arcade-team-dot arcade-team-dot--home" /><b>YOU</b><strong>{score.home}</strong></div>
        <span className="arcade-scoreboard__time">{formatTime(timeLeft)}<small>{status === "playing" ? "LIVE" : status.toUpperCase()}</small></span>
        <div><strong>{score.away}</strong><b>CPU</b><span className="arcade-team-dot arcade-team-dot--away" /></div>
      </div>

      <div ref={stageRef} className="arcade-stage" tabIndex={0} role="application" aria-label="Arcade football. Focus this pitch, use WASD or arrow keys to move, hold Space to charge a shot, J to pass, E to switch player, P to pause and F for fullscreen.">
        <canvas ref={canvasRef} className="arcade-canvas" aria-label="Side-view football match with players, ball and goals" onPointerDown={() => stageRef.current?.focus()} />
        {status === "menu" && <div className="arcade-stage__overlay"><div><strong>Ready for kick-off?</strong><span>Choose your difficulty and match length, then start.</span><button className="arcade-button" onClick={beginMatch}>▶ Start match</button></div></div>}
        {status === "paused" && <div className="arcade-stage__overlay"><div><strong>Match paused</strong><span>Your match is paused. Resume when ready.</span><button className="arcade-button" onClick={pauseMatch}>▶ Resume match</button></div></div>}
        {status === "finished" && <div className="arcade-stage__overlay"><div><strong>Full time</strong><span>Final score: {score.home} — {score.away}</span><button className="arcade-button" onClick={beginMatch}>↻ Play again</button></div></div>}
        <div className="arcade-stage__live" aria-live="polite">{message}</div>
      </div>

      <div className="arcade-game__footer"><div className="arcade-stats"><span><b>{shots}</b> SHOTS</span><span><b>{passes}</b> PASSES</span><span><i className={status === "paused" ? "arcade-status arcade-status--paused" : "arcade-status"} />{status.toUpperCase()}</span></div><div className="arcade-hint">Click the pitch to focus controls · F for fullscreen</div></div>
      <div className="arcade-match-options">
        <label>Difficulty<select disabled={status === "playing" || status === "paused" || status === "goal"} value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}><option value="easy">Easy</option><option value="normal">Normal</option><option value="hard">Hard</option></select></label>
        <label>Match length<select disabled={status === "playing" || status === "paused" || status === "goal"} value={duration} onChange={(event) => setDuration(Number(event.target.value))}><option value={60}>1 minute</option><option value={120}>2 minutes</option><option value={180}>3 minutes</option></select></label>
        <button className="arcade-button arcade-button--quiet" onClick={() => { const next = !muted; setMuted(next); stateRef.current.muted = next; }}>{muted ? "🔇 Sound off" : "🔊 Sound on"}</button>
      </div>

      <div className="arcade-controls">
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>A</kbd><kbd>D</kbd><span>or</span><kbd>←</kbd><kbd>→</kbd></span><span>Move</span></div>
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>W</kbd><kbd>S</kbd><span>or</span><kbd>↑</kbd><kbd>↓</kbd></span><span>Move up / down</span></div>
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>SHIFT</kbd></span><span>Sprint</span></div>
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>SPACE</kbd></span><span>Hold to charge shot</span></div>
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>J</kbd></span><span>Pass to teammate</span></div>
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>E</kbd></span><span>Switch player</span></div>
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>P</kbd></span><span>Pause / resume</span></div>
      </div>
      <p className="arcade-note">Small-sided arcade football with a simplified physics model and rule-based AI. Please test the match in a browser before publishing.</p>
    </div>
  );
}
