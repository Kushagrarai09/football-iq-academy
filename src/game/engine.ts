import type { GamePlayer, GameState, TeamId } from "./types";
import { createPlayers, GOAL_CELEBRATION_SECONDS } from "./constants";
import { clamp, distance, givePossession, kickBall, keeperAI, moveToward, releasePossession, updateBall } from "./physics";

export type GameCommand = "left" | "right" | "up" | "down" | "sprint" | "shoot" | "pass" | "switch" | "jump";
export type InputState = Record<GameCommand, boolean>;

export function emptyInput(): InputState {
  return { left: false, right: false, up: false, down: false, sprint: false, shoot: false, pass: false, switch: false, jump: false };
}

const teammates = (state: GameState, team: TeamId) =>
  state.players.filter((p) => p.team === team && p.role !== "goalkeeper");
const outfield = (state: GameState) => state.players.filter((p) => p.role !== "goalkeeper");
const attackDirection = (team: TeamId): -1 | 1 => team === "home" ? 1 : -1;

export function resetKickoff(state: GameState, preserveScore = true) {
  const score = preserveScore ? { ...state.score } : { home: 0, away: 0 };
  const elapsed = preserveScore ? state.elapsed : 0;
  const players = createPlayers();
  const holder = players.find((p) => p.id === "home-striker")!;
  holder.hasPossession = true;
  Object.assign(state, {
    players,
    ball: {
      x: holder.x + 0.04, y: holder.y + 0.03, vx: 0, vy: 0, z: 0, vz: 0,
      gravity: 1.9, friction: 1.3, bounce: 0.38,
      possession: holder.id, lastTouch: holder.id, lastTouchTeam: "home" as const,
    },
    score, elapsed, status: "playing", lastScorer: null, goalTimer: 0,
    controlledPlayerId: holder.id,
  });
}

export function switchControlledPlayer(state: GameState) {
  const players = teammates(state, "home");
  const index = players.findIndex((p) => p.id === state.controlledPlayerId);
  const next = players[(index + 1) % players.length];
  if (next) state.controlledPlayerId = next.id;
  return next;
}

export function shootBall(state: GameState, chargeSeconds = 0) {
  if (state.status !== "playing") return false;
  const player = state.players.find((p) => p.id === state.controlledPlayerId);
  if (!player || player.role === "goalkeeper") return false;
  const ball = state.ball;
  if (ball.possession !== player.id) {
    if (ball.possession || ball.z > 0.12 || distance(player, ball) > 0.055) return false;
    givePossession(state, player);
  }
  const power = clamp(chargeSeconds / 0.65, 0, 1);
  const targetY = clamp(0.5 + (Math.random() - 0.5) * 0.08, 0.42, 0.58);
  const goalDistance = Math.abs((player.team === "home" ? 0.965 : 0.035) - player.x);
  const speed = clamp(1.22 + power * 0.78 + (1 - goalDistance) * 0.22, 1.15, 2.1);
  const travelX = Math.abs((player.team === "home" ? 0.965 : 0.035) - player.x);
  const verticalSpeed = clamp((targetY - (player.y + 0.015)) * speed / Math.max(travelX, 0.12), -0.72, 0.72);
  kickBall(state, player, attackDirection(player.team) * speed, verticalSpeed, 0.13 + power * 0.06);
  player.actionCooldown = 0.34;
  return true;
}

export function passBall(state: GameState) {
  if (state.status !== "playing") return false;
  const player = state.players.find((p) => p.id === state.controlledPlayerId);
  if (!player || state.ball.possession !== player.id) return false;
  const candidates = teammates(state, player.team).filter((p) => p.id !== player.id);
  const forward = attackDirection(player.team);
  candidates.sort((a, b) => {
    const forwardA = (a.x - player.x) * forward;
    const forwardB = (b.x - player.x) * forward;
    return (forwardB - forwardA) * 0.55 + (distance(player, a) - distance(player, b)) * 0.45;
  });
  const target = candidates[0];
  if (!target) return false;
  const d = distance(player, target);
  const error = state.difficulty === "easy" ? 0.028 : state.difficulty === "hard" ? 0.006 : 0.015;
  const targetX = target.x + (Math.random() - 0.5) * error;
  const targetY = target.y + (Math.random() - 0.5) * error;
  const speed = clamp(0.72 + d * 2.0, 0.92, 1.65);
  kickBall(state, player, (targetX - player.x) * speed / Math.max(d, 0.02), (targetY - player.y) * speed / Math.max(d, 0.02), 0.035);
  player.actionCooldown = 0.3;
  return true;
}

function nearestPlayer(players: GamePlayer[], target: { x: number; y: number }) {
  return [...players].sort((a, b) => distance(a, target) - distance(b, target))[0];
}

function updateControlledPlayer(state: GameState, input: InputState, dt: number) {
  const player = state.players.find((p) => p.id === state.controlledPlayerId);
  if (!player) return;
  const dx = Number(input.right) - Number(input.left);
  const dy = Number(input.down) - Number(input.up);
  const length = Math.hypot(dx, dy) || 1;
  if (dx || dy) {
    const speed = player.speed * (input.sprint ? 1.5 : 1);
    player.vx = dx / length * speed;
    player.vy = dy / length * speed;
    player.x = clamp(player.x + player.vx * dt, 0.035, 0.965);
    player.y = clamp(player.y + player.vy * dt, 0.12, 0.91);
    if (dx) player.facing = dx < 0 ? -1 : 1;
    player.mode = "run";
  } else {
    player.vx = 0;
    player.vy = 0;
    if (player.mode === "run") player.mode = "idle";
  }
  player.actionCooldown = Math.max(0, player.actionCooldown - dt);
  if (player.actionCooldown === 0 && player.mode === "kick") player.mode = "idle";
  if (input.jump) player.mode = "jump";
  else if (player.mode === "jump") player.mode = "idle";

  const ball = state.ball;
  if (ball.possession !== player.id && !ball.possession && ball.z < 0.12 && distance(player, ball) < 0.038 && Math.hypot(ball.vx, ball.vy) < 0.45) {
    givePossession(state, player);
  }

  if (ball.possession && ball.possession !== player.id) {
    const holder = state.players.find((p) => p.id === ball.possession);
    if (holder && holder.team !== player.team && distance(holder, player) < 0.04 && Math.random() < dt * (state.difficulty === "hard" ? 2.2 : 1.1)) {
      givePossession(state, player);
      player.actionCooldown = 0.35;
    }
  }

  if (ball.possession === player.id) {
    const challenger = nearestPlayer(state.players.filter((p) => p.team !== player.team && p.role !== "goalkeeper"), player);
    if (challenger && distance(challenger, player) < 0.032 && Math.random() < dt * 0.8) {
      releasePossession(state);
      ball.vx = attackDirection(challenger.team) * 0.12;
      ball.vy = (player.y - challenger.y) * 1.2;
      ball.lastTouch = challenger.id;
      ball.lastTouchTeam = challenger.team;
    }
  }
}

function updateOutfieldAI(state: GameState, dt: number) {
  const ball = state.ball;
  for (const player of state.players) {
    if (player.id === state.controlledPlayerId || player.role === "goalkeeper") continue;
    player.actionCooldown = Math.max(0, player.actionCooldown - dt);
    if (player.actionCooldown === 0 && player.mode === "kick") player.mode = "idle";
    const holder = ball.possession ? state.players.find((p) => p.id === ball.possession) : null;
    const ownPossession = holder?.team === player.team;
    const opponentPossession = holder && holder.team !== player.team;
    const loose = !holder;
    const teamPlayers = teammates(state, player.team);
    const closestTeammate = nearestPlayer(teamPlayers, ball);
    const isClosest = closestTeammate?.id === player.id;
    const dir = attackDirection(player.team);
    let tx = player.homeX;
    let ty = player.homeY;

    if (player.role === "defender") {
      tx = player.homeX + (ball.x - player.homeX) * 0.15;
      ty = player.homeY + (ball.y - player.homeY) * 0.22;
      if ((loose || ownPossession) && isClosest) { tx = ball.x - dir * 0.035; ty = ball.y; }
    } else if (player.role === "midfielder") {
      if (ownPossession) {
        tx = clamp(ball.x + dir * 0.12, 0.08, 0.92);
        ty = clamp(player.homeY + (ball.y - 0.5) * 0.45, 0.18, 0.82);
      } else if (opponentPossession || loose) {
        tx = player.homeX + (ball.x - player.homeX) * 0.32;
        ty = player.homeY + (ball.y - player.homeY) * 0.3;
        if (isClosest) { tx = ball.x; ty = ball.y; }
      }
    } else if (player.role === "striker" || player.role === "winger") {
      if (ownPossession) {
        tx = clamp(ball.x + dir * (player.role === "winger" ? 0.2 : 0.16), 0.08, 0.94);
        ty = clamp(player.homeY, 0.18, 0.84);
      } else if (opponentPossession || loose) {
        tx = clamp(ball.x - dir * 0.06, 0.08, 0.92);
        ty = clamp(ball.y + (player.homeY - 0.5) * 0.5, 0.18, 0.84);
        if (loose && isClosest) { tx = ball.x; ty = ball.y; }
      }
    }

    const skill = player.team !== "away" ? 1 : state.difficulty === "hard" ? 1.2 : state.difficulty === "easy" ? 0.78 : 1;
    moveToward(player, tx, ty, player.speed * skill, dt);

    if (!ball.possession && ball.z < 0.12 && distance(player, ball) < 0.034 && isClosest) {
      givePossession(state, player);
    }

    if (ball.possession === player.id) {
      const goalX = player.team === "home" ? 0.965 : 0.035;
      const toGoal = Math.abs(goalX - player.x);
      if (toGoal < (state.difficulty === "hard" ? 0.42 : 0.34) && player.actionCooldown <= 0) {
        player.aiMode = "shooting";
        const targetY = clamp(0.5 + (Math.random() - 0.5) * (state.difficulty === "hard" ? 0.04 : 0.12), 0.4, 0.6);
        const shotSpeed = state.difficulty === "hard" ? 1.7 : 1.35;
        const verticalSpeed = clamp((targetY - (player.y + 0.015)) * shotSpeed / Math.max(toGoal, 0.12), -0.72, 0.72);
        kickBall(state, player, dir * shotSpeed, verticalSpeed, 0.1);
        player.actionCooldown = 0.55;
      } else {
        player.aiMode = "attacking";
        if (player.actionCooldown <= 0) {
          moveToward(player, clamp(player.x + dir * 0.12, 0.05, 0.95), clamp(player.y, 0.15, 0.85), player.speed, dt);
        }
      }
    } else {
      player.aiMode = ownPossession ? "attacking" : opponentPossession ? "defending" : "reposition";
    }
  }
}

function keepBallInBounds(state: GameState) {
  const ball = state.ball;
  const goalLane = ball.y >= 0.395 && ball.y <= 0.605 && ball.z <= 0.1;
  if (ball.x < 0.035 && !goalLane) { ball.x = 0.035; ball.vx = Math.abs(ball.vx) * 0.42; }
  if (ball.x > 0.965 && !goalLane) { ball.x = 0.965; ball.vx = -Math.abs(ball.vx) * 0.42; }
}

function detectGoal(state: GameState) {
  const ball = state.ball;
  if (ball.z > 0.1 || ball.y < 0.395 || ball.y > 0.605) return false;
  if (ball.x < 0.035 && ball.vx < 0) { state.score.away += 1; state.lastScorer = "away"; }
  else if (ball.x > 0.965 && ball.vx > 0) { state.score.home += 1; state.lastScorer = "home"; }
  else return false;
  state.status = "goal";
  state.goalTimer = GOAL_CELEBRATION_SECONDS;
  return true;
}

export function tickGame(state: GameState, input: InputState, dt: number) {
  if (state.status !== "playing") return;
  const step = Math.min(Math.max(dt, 0), 0.033);
  state.elapsed += step;
  updateControlledPlayer(state, input, step);
  updateOutfieldAI(state, step);
  for (const keeper of state.players.filter((p) => p.role === "goalkeeper")) {
    keeper.actionCooldown = Math.max(0, keeper.actionCooldown - step);
    keeperAI(state, step, keeper);
    if (state.ball.possession === keeper.id && keeper.actionCooldown <= 0) {
      const dir = attackDirection(keeper.team);
      kickBall(state, keeper, dir * 1.05, (0.5 - state.ball.y) * 0.45, 0.08);
      keeper.actionCooldown = 0.8;
    }
  }
  updateBall(state, step);
  if (detectGoal(state)) return;
  keepBallInBounds(state);
  if (state.elapsed >= state.duration) state.status = "finished";
}
