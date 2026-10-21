"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Player = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: -1 | 1;
  jumping: boolean;
  jumpVelocity: number;
  crouching: boolean;
};

type Ball = { x: number; y: number; vx: number; vy: number; z: number; vz: number };
type Keys = Set<string>;

const FIELD_ASPECT = 16 / 9;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function ArcadeFootballGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<Keys>(new Set());
  const playerRef = useRef<Player>({ x: 0.24, y: 0.76, vx: 0, vy: 0, facing: 1, jumping: false, jumpVelocity: 0, crouching: false });
  const ballRef = useRef<Ball>({ x: 0.33, y: 0.79, vx: 0, vy: 0, z: 0, vz: 0 });
  const dimensionsRef = useRef({ width: 960, height: 540, dpr: 1 });
  const pausedRef = useRef(false);
  const lastTimeRef = useRef(0);
  const kickTimerRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [message, setMessage] = useState("Ready to play");
  const [shots, setShots] = useState(0);
  const [passes, setPasses] = useState(0);

  const setPause = useCallback((next: boolean) => {
    pausedRef.current = next;
    setPaused(next);
    setMessage(next ? "Match paused" : "Kick-off — let's play!");
    lastTimeRef.current = 0;
  }, []);

  const resetBall = useCallback(() => {
    const p = playerRef.current;
    ballRef.current = { x: clamp(p.x + p.facing * 0.07, 0.05, 0.95), y: clamp(p.y + 0.025, 0.14, 0.9), vx: 0, vy: 0, z: 0, vz: 0 };
  }, []);

  const shoot = useCallback((power = 1) => {
    const p = playerRef.current;
    const b = ballRef.current;
    const dx = b.x - p.x;
    const dy = b.y - p.y;
    if (Math.abs(dx) < 0.12 && Math.abs(dy) < 0.12) {
      b.vx = p.facing * (1.15 + power * 0.8);
      b.vy = (p.y - b.y) * 1.5;
      b.vz = power * 0.8;
      setShots((value) => value + 1);
      setMessage("Shot away!");
      kickTimerRef.current = 0.18;
    } else {
      b.vx += p.facing * 0.28;
      b.vy -= 0.08;
      setMessage("Move close to the ball to shoot");
    }
  }, []);

  const pass = useCallback(() => {
    const p = playerRef.current;
    const b = ballRef.current;
    if (Math.abs(b.x - p.x) < 0.14 && Math.abs(b.y - p.y) < 0.14) {
      b.vx = p.facing * 0.88;
      b.vy = (0.5 - b.y) * 0.55;
      b.vz = 0.22;
      setPasses((value) => value + 1);
      setMessage("Pass played");
      kickTimerRef.current = 0.12;
    } else {
      setMessage("Get near the ball to pass");
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const stage = stageRef.current;
    if (!stage) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await stage.requestFullscreen();
      }
    } catch {
      setMessage("Fullscreen is unavailable in this browser");
    }
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(220, Math.min(width / FIELD_ASPECT, window.innerHeight * 0.78));
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

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (isTyping) return;
      const key = event.key.toLowerCase();
      const gameKeys = ["arrowleft", "arrowright", "arrowup", "arrowdown", " ", "w", "a", "s", "d", "j", "e", "p", "f", "shift"];
      if (gameKeys.includes(key) && (document.activeElement === canvas || stage.contains(document.activeElement))) event.preventDefault();
      if (event.repeat && [" ", "j", "p", "f", "e"].includes(key)) return;
      keysRef.current.add(key);
      if (key === " " && !pausedRef.current) shoot(1);
      if (key === "j" && !pausedRef.current) pass();
      if (key === "p") setPause(!pausedRef.current);
      if (key === "f") void toggleFullscreen();
      if (key === "e") setMessage("Only one player is available in Phase 1");
    };
    const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.key.toLowerCase());
    const onBlur = () => keysRef.current.clear();
    const onFullscreenChange = () => {
      setFullscreen(Boolean(document.fullscreenElement));
      requestAnimationFrame(resize);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    let frame = 0;
    const draw = (time: number) => {
      const { width: w, height: h } = dimensionsRef.current;
      const dt = lastTimeRef.current ? Math.min((time - lastTimeRef.current) / 1000, 0.04) : 0;
      lastTimeRef.current = time;
      if (!pausedRef.current) {
        const p = playerRef.current;
        const b = ballRef.current;
        const keys = keysRef.current;
        const left = keys.has("a") || keys.has("arrowleft");
        const right = keys.has("d") || keys.has("arrowright");
        const up = keys.has("w") || keys.has("arrowup");
        const down = keys.has("s") || keys.has("arrowdown");
        const sprint = keys.has("shift");
        const speed = sprint ? 0.78 : 0.52;
        const friction = Math.pow(0.08, dt);
        p.vx = (right ? 1 : 0) - (left ? 1 : 0);
        p.vy = (down ? 1 : 0) - (up ? 1 : 0);
        const length = Math.hypot(p.vx, p.vy) || 1;
        p.x += (p.vx / length) * speed * dt;
        p.y += (p.vy / length) * speed * dt;
        if (p.vx) p.facing = p.vx < 0 ? -1 : 1;
        p.x = clamp(p.x, 0.055, 0.945);
        p.y = clamp(p.y, 0.13, 0.91);
        p.crouching = down && !left && !right;
        if (keys.has("w") && !p.jumping) {
          p.jumping = true;
          p.jumpVelocity = 0.95;
        }
        if (p.jumping) {
          p.jumpVelocity -= 2.6 * dt;
          if (p.jumpVelocity <= 0) {
            p.jumping = false;
            p.jumpVelocity = 0;
          }
        }
        const isNearBall = Math.abs(b.x - p.x) < 0.065 && Math.abs(b.y - p.y) < 0.07;
        if (isNearBall && Math.hypot(b.vx, b.vy) < 0.35 && kickTimerRef.current <= 0) {
          b.x = p.x + p.facing * 0.045;
          b.y = p.y + 0.025;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.z += b.vz * dt;
        b.vz -= 1.9 * dt;
        if (b.z < 0) { b.z = 0; b.vz = 0; }
        b.vx *= friction;
        b.vy *= friction;
        if (Math.abs(b.vx) < 0.012) b.vx = 0;
        if (Math.abs(b.vy) < 0.012) b.vy = 0;
        if (b.x < 0.035 || b.x > 0.965) {
          const goalLane = b.y > 0.42 && b.y < 0.78 && b.z < 0.09;
          if (goalLane) setMessage("Goal-line reached — goal detection comes in Phase 2");
          b.x = clamp(b.x, 0.035, 0.965);
          b.vx *= -0.35;
        }
        if (b.y < 0.115 || b.y > 0.925) {
          b.y = clamp(b.y, 0.115, 0.925);
          b.vy *= -0.45;
        }
        kickTimerRef.current = Math.max(0, kickTimerRef.current - dt);
      }

      ctx.clearRect(0, 0, w, h);
      const sx = w / 960;
      const sy = h / 540;
      ctx.save();
      ctx.scale(sx, sy);

      const sky = ctx.createLinearGradient(0, 0, 0, 540);
      sky.addColorStop(0, "#0b2018");
      sky.addColorStop(1, "#07110f");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 960, 540);
      ctx.fillStyle = "#10291f";
      ctx.fillRect(0, 52, 960, 440);

      // Stadium glow and stands.
      for (let i = 0; i < 24; i++) {
        const x = i * 42;
        ctx.fillStyle = i % 2 ? "#1b392b" : "#152f24";
        ctx.fillRect(x, 15, 34, 32);
        ctx.fillStyle = "#b8ff54";
        ctx.globalAlpha = 0.18 + (i % 3) * 0.08;
        ctx.fillRect(x + 9, 20, 3, 4);
        ctx.globalAlpha = 1;
      }

      // Pitch, mowing stripes, and touchlines.
      const field = { x: 32, y: 72, w: 896, h: 400 };
      ctx.fillStyle = "#165738";
      ctx.fillRect(field.x, field.y, field.w, field.h);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? "#1b6641" : "#17613c";
        ctx.fillRect(field.x + i * field.w / 8, field.y, field.w / 8, field.h);
      }
      ctx.strokeStyle = "#d7f5d8";
      ctx.lineWidth = 2;
      ctx.strokeRect(field.x + 10, field.y + 10, field.w - 20, field.h - 20);
      ctx.beginPath(); ctx.moveTo(480, field.y + 10); ctx.lineTo(480, field.y + field.h - 10); ctx.stroke();
      ctx.beginPath(); ctx.arc(480, 272, 64, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#eaffea"; ctx.beginPath(); ctx.arc(480, 272, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeRect(42, 174, 106, 196);
      ctx.strokeRect(812, 174, 106, 196);
      ctx.strokeRect(42, 220, 40, 104);
      ctx.strokeRect(878, 220, 40, 104);
      // Goals protrude beyond the goal line.
      ctx.strokeStyle = "#f3f5ed"; ctx.lineWidth = 5;
      ctx.strokeRect(18, 230, 24, 84);
      ctx.strokeRect(918, 230, 24, 84);
      ctx.lineWidth = 1;
      for (let gx of [18, 918]) {
        ctx.strokeStyle = "#ffffff72";
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath(); ctx.moveTo(gx + (gx < 100 ? i * 6 : i * 6), 230); ctx.lineTo(gx + i * 6, 314); ctx.stroke();
        }
        for (let y = 244; y < 314; y += 14) {
          ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + 24, y); ctx.stroke();
        }
      }

      const p = playerRef.current;
      const b = ballRef.current;
      const px = field.x + p.x * field.w;
      const py = field.y + p.y * field.h;
      const bx = field.x + b.x * field.w;
      const by = field.y + b.y * field.h - b.z * 70;

      // Ball shadow is offset when airborne.
      ctx.fillStyle = "#07120d88";
      ctx.beginPath(); ctx.ellipse(field.x + b.x * field.w, field.y + b.y * field.h + 5, 9 + b.z * 4, 4, 0, 0, Math.PI * 2); ctx.fill();
      // Player shadow.
      ctx.beginPath(); ctx.ellipse(px, py + 15, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
      // Simple arcade player sprite.
      const hop = p.jumping ? Math.sin((0.95 - p.jumpVelocity) * 2) * 20 + 8 : 0;
      ctx.save(); ctx.translate(px, py - hop); ctx.scale(p.facing, 1);
      ctx.fillStyle = "#b8ff54";
      ctx.beginPath(); ctx.roundRect(-13, -29, 26, 29, 8); ctx.fill();
      ctx.fillStyle = "#eef9e5";
      ctx.beginPath(); ctx.arc(0, -38, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#193322";
      ctx.beginPath(); ctx.arc(3, -39, 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#b8ff54"; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(-11, 10); ctx.moveTo(5, -4); ctx.lineTo(12, 8); ctx.stroke();
      ctx.restore();

      // Ball with panel patches.
      ctx.fillStyle = "#07110f";
      ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f4f7f3";
      ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#24382e";
      ctx.beginPath(); ctx.moveTo(bx - 3, by - 4); ctx.lineTo(bx + 2, by - 5); ctx.lineTo(bx + 5, by); ctx.lineTo(bx, by + 3); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(bx - 4, by + 3, 2, 0, Math.PI * 2); ctx.fill();

      ctx.restore();
      if (pausedRef.current) {
        ctx.fillStyle = "#07110fbb"; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#f4f7f3"; ctx.font = "800 32px Arial"; ctx.textAlign = "center"; ctx.fillText("PAUSED", w / 2, h / 2);
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [pass, setPause, shoot, toggleFullscreen]);

  return (
    <div className={`arcade-game ${fullscreen ? "arcade-game--fullscreen" : ""}`}>
      <div className="arcade-game__topbar">
        <div>
          <span className="arcade-eyebrow">ARCADE MODE · PHASE 1</span>
          <h2>Kick-off Club</h2>
          <p>One player. One ball. Your first touch starts here.</p>
        </div>
        <div className="arcade-game__actions">
          <button className="arcade-button arcade-button--quiet" onClick={() => setPause(!paused)}>{paused ? "▶ Resume" : "Ⅱ Pause"} <kbd>P</kbd></button>
          <button className="arcade-button" onClick={() => void toggleFullscreen()}>{fullscreen ? "↙ Exit full screen" : "⛶ Full screen"} <kbd>F</kbd></button>
        </div>
      </div>
      <div ref={stageRef} className="arcade-stage" tabIndex={0} role="application" aria-label="Arcade football game. Focus here and use WASD or arrow keys to move. Space to shoot, J to pass, P to pause, F for full screen.">
        <canvas ref={canvasRef} className="arcade-canvas" aria-label="Horizontal football pitch with a controllable player and ball" />
        {paused && <div className="arcade-stage__overlay"><div><strong>Match paused</strong><span>Press P or Resume when you're ready.</span><button className="arcade-button" onClick={() => setPause(false)}>Resume match</button></div></div>}
        <div className="arcade-stage__live" aria-live="polite">{message}</div>
      </div>
      <div className="arcade-game__footer">
        <div className="arcade-stats"><span><b>{shots}</b> SHOTS</span><span><b>{passes}</b> PASSES</span><span><i className={paused ? "arcade-status arcade-status--paused" : "arcade-status"} />{paused ? "PAUSED" : "IN PLAY"}</span></div>
        <div className="arcade-hint">Click the pitch to focus controls · F for fullscreen</div>
      </div>
      <div className="arcade-controls">
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>A</kbd><kbd>D</kbd> <span>or</span> <kbd>←</kbd><kbd>→</kbd></span><span>Move</span></div>
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>W</kbd><kbd>S</kbd> <span>or</span> <kbd>↑</kbd><kbd>↓</kbd></span><span>Move up / down</span></div>
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>SHIFT</kbd></span><span>Sprint</span></div>
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>SPACE</kbd></span><span>Shoot</span></div>
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>J</kbd></span><span>Pass</span></div>
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>P</kbd></span><span>Pause</span></div>
        <div className="arcade-control"><span className="arcade-control__keys"><kbd>F</kbd></span><span>Full screen</span></div>
      </div>
      <p className="arcade-note">Phase 1 is a movement prototype: goal detection, teammates, and computer opponents arrive in later phases.</p>
    </div>
  );
}
