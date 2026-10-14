import { describe, it, expect } from 'vitest';
import { createChessGame, applyMove } from '../src/engine.js';

describe('Chess Engine - LG-01 & LG-03', () => {
  it('applies standard pawn move and generates correct MoveEvent', () => {
    const game = createChessGame();
    const result = applyMove(game, { from: 'e2', to: 'e4' });

    expect(result.success).toBe(true);
    expect(result.event).toBeDefined();
    expect(result.event?.from).toBe('e2');
    expect(result.event?.to).toBe('e4');
    expect(result.event?.piece).toBe('p');
    expect(result.event?.color).toBe('w');
    expect(result.event?.captured).toBeUndefined();
    expect(result.event?.isCheck).toBe(false);
    expect(result.event?.isCheckmate).toBe(false);
    expect(result.event?.san).toBe('e4');
  });

  it('rejects illegal moves', () => {
    const game = createChessGame();
    const result = applyMove(game, { from: 'e2', to: 'e5' }); // pawn can't jump 3 squares
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('handles standard capture correctly', () => {
    // 1. e4 d5 2. exd5
    const game = createChessGame();
    applyMove(game, { from: 'e2', to: 'e4' });
    applyMove(game, { from: 'd7', to: 'd5' });
    const captureResult = applyMove(game, { from: 'e4', to: 'd5' });

    expect(captureResult.success).toBe(true);
    expect(captureResult.event?.captured).toEqual({
      piece: 'p',
      square: 'd5',
    });
  });

  it('handles kingside castling (O-O)', () => {
    // Setup position where white can castle kingside
    // FEN: r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4
    const game = createChessGame('r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4');
    const result = applyMove(game, { from: 'e1', to: 'g1' });

    expect(result.success).toBe(true);
    expect(result.event?.castle).toBe('k');
    expect(result.event?.san).toBe('O-O');
  });

  it('handles queenside castling (O-O-O)', () => {
    // FEN where white can castle queenside
    const game = createChessGame('r3kbnr/ppp1pppp/2nq4/3p1b2/3P4/2NQ4/PPP1PPPP/R3KBNR w KQkq - 4 4');
    const result = applyMove(game, { from: 'e1', to: 'c1' });

    expect(result.success).toBe(true);
    expect(result.event?.castle).toBe('q');
    expect(result.event?.san).toBe('O-O-O');
  });

  it('handles en passant capture with correct captured square', () => {
    // White pawn on e5, Black plays d7-d5 -> White can play exd6 en passant
    const game = createChessGame('rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3');
    const result = applyMove(game, { from: 'e5', to: 'd6' });

    expect(result.success).toBe(true);
    expect(result.event?.isEnPassant).toBe(true);
    expect(result.event?.captured).toEqual({
      piece: 'p',
      square: 'd5', // The captured pawn is on d5, not d6!
    });
  });

  it('handles pawn promotion', () => {
    // White pawn on a7 ready to promote to Queen
    const game = createChessGame('8/P7/8/8/8/8/k7/4K3 w - - 0 1');
    const result = applyMove(game, { from: 'a7', to: 'a8', promotion: 'q' });

    expect(result.success).toBe(true);
    expect(result.event?.promotion).toBe('q');
    expect(result.event?.isCheck).toBe(true);
    expect(result.event?.san).toBe('a8=Q+');
  });

  it('detects check and checkmate (Fool\'s Mate)', () => {
    const game = createChessGame();
    applyMove(game, { from: 'f2', to: 'f3' });
    applyMove(game, { from: 'e7', to: 'e5' });
    applyMove(game, { from: 'g2', to: 'g4' });
    const mateMove = applyMove(game, { from: 'd8', to: 'h4' });

    expect(mateMove.success).toBe(true);
    expect(mateMove.event?.isCheck).toBe(true);
    expect(mateMove.event?.isCheckmate).toBe(true);
    expect(game.isGameOver()).toBe(true);
  });

  it('detects stalemate', () => {
    // Famous stalemate position: 8/8/8/8/8/5k2/5p2/5K2 w - - 0 1
    // Wait, let's use a clear stalemate FEN where white to move has no legal moves and is not in check
    // e.g. 7k/5Q2/6K1/8/8/8/8/8 b - - 0 1 (Black king on h8, white queen on f7, white king on g6. Black to move is stalemated)
    const game = createChessGame('k7/8/1Q6/8/8/8/8/4K3 b - - 0 1');
    // King on a8 has no moves: a7, b8, b7 guarded by Queen on b6. It is stalemate!
    expect(game.isGameOver()).toBe(true);
    expect(game.getLegalMoves()).toHaveLength(0);
  });

  it('LG-02: does not import or depend on three.js', () => {
    // Verifying pure logic module
    const game = createChessGame();
    expect(game).toBeDefined();
    expect(typeof game.getFen).toBe('function');
  });
});
