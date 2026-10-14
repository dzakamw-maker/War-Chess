import { describe, it, expect } from 'vitest';
import { ChessClock } from '../src/clock.js';

describe('Chess Clock - LG-04', () => {
  it('initializes with correct preset time', () => {
    const clock = new ChessClock('blitz_3_2');
    const state = clock.getState();

    expect(state.whiteTimeMs).toBe(180 * 1000);
    expect(state.blackTimeMs).toBe(180 * 1000);
    expect(state.isRunning).toBe(false);
    expect(state.isFlagFallen).toBe(false);
  });

  it('ticks down active color correctly', () => {
    const clock = new ChessClock('bullet_1_0'); // 60s
    const startTime = 100000;
    clock.start('w', startTime);

    // Advance 5 seconds
    const state = clock.tick(startTime + 5000);
    expect(state.whiteTimeMs).toBe(55000);
    expect(state.blackTimeMs).toBe(60000);
  });

  it('switches turn and applies Fischer increment', () => {
    const clock = new ChessClock('blitz_3_2'); // 180s + 2s increment
    const t0 = 100000;
    clock.start('w', t0);

    // White spends 10 seconds: 180 - 10 = 170s, plus 2s increment = 172s (172000 ms)
    const state = clock.switchTurn('b', t0 + 10000);
    expect(state.whiteTimeMs).toBe(172000);
    expect(state.blackTimeMs).toBe(180000);
    expect(state.activeColor).toBe('b');
  });

  it('detects flag fall when time runs out', () => {
    const clock = new ChessClock('bullet_1_0'); // 60s
    const t0 = 100000;
    clock.start('w', t0);

    // White runs out of time after 61 seconds
    const state = clock.tick(t0 + 61000);
    expect(state.whiteTimeMs).toBe(0);
    expect(state.isFlagFallen).toBe(true);
    expect(state.loser).toBe('w');
    expect(state.isRunning).toBe(false);
  });
});
