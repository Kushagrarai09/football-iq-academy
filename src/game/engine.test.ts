import { describe, expect, it } from "vitest";
import { createInitialState, DEFAULT_MATCH_SECONDS } from "./constants";
import { emptyInput, resetKickoff, shootBall, tickGame, passBall, switchControlledPlayer } from "./engine";

describe("arcade football simulation", () => {
  it("starts with a controlled home striker in possession", () => {
    const state = createInitialState();
    expect(state.duration).toBe(DEFAULT_MATCH_SECONDS);
    expect(state.ball.possession).toBe("home-striker");
    expect(state.players).toHaveLength(8);
  });

  it("moves the controlled player within field bounds", () => {
    const state = createInitialState();
    state.status = "playing";
    const start = state.players.find(p => p.id === state.controlledPlayerId)!.x;
    const input = emptyInput();
    input.right = true;
    tickGame(state, input, 0.033);
    expect(state.players.find(p => p.id === state.controlledPlayerId)!.x).toBeGreaterThan(start);
  });

  it("switches to a teammate", () => {
    const state = createInitialState();
    const before = state.controlledPlayerId;
    const next = switchControlledPlayer(state);
    expect(next?.id).not.toBe(before);
    expect(state.controlledPlayerId).toBe(next?.id);
  });

  it("passes to a teammate and releases possession", () => {
    const state = createInitialState();
    state.status = "playing";
    expect(passBall(state)).toBe(true);
    expect(state.ball.possession).toBeNull();
    expect(state.ball.lastTouch).toBe("home-striker");
  });

  it("shoots and records ball touch", () => {
    const state = createInitialState();
    state.status = "playing";
    expect(shootBall(state, 0.5)).toBe(true);
    expect(state.ball.possession).toBeNull();
    expect(state.ball.vx).toBeGreaterThan(0);
  });

  it("resets a kickoff without resetting the score when preserving score", () => {
    const state = createInitialState();
    state.score.home = 2;
    state.score.away = 1;
    state.status = "goal";
    resetKickoff(state, true);
    expect(state.score).toEqual({ home: 2, away: 1 });
    expect(state.status).toBe("playing");
    expect(state.ball.possession).toBe("home-striker");
  });

  it("does not simulate when paused", () => {
    const state = createInitialState();
    state.status = "paused";
    const before = state.elapsed;
    tickGame(state, emptyInput(), 0.033);
    expect(state.elapsed).toBe(before);
  });
});
