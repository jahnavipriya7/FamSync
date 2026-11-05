import test from 'node:test';
import assert from 'node:assert/strict';

import {
  checkTicTacToeWinner,
  getAvailableTicTacToeMoves,
  getTicTacToeAiMove,
  TicTacToeBoard
} from '../utils/ticTacToeEngine.ts';

import {
  createInitialBoard,
  getLegalMoves,
  getAllLegalMoves,
  makeMove,
  isKingInCheck,
  getChessAiMove,
  squareToAlgebraic,
  ChessBoard
} from '../utils/chessEngine.ts';

import {
  rollDice,
  calculateNewPosition,
  getModifierAtPosition,
  DEFAULT_LADDERS,
  DEFAULT_SNAKES
} from '../utils/snakesLaddersEngine.ts';

/* ========================================================================== */
/* TIC-TAC-TOE TESTS                                                          */
/* ========================================================================== */

test('Tic-Tac-Toe: Detects horizontal row wins', () => {
  const board: TicTacToeBoard = [
    'X', 'X', 'X',
    null, 'O', null,
    'O', null, null
  ];
  const result = checkTicTacToeWinner(board);
  assert.equal(result.winner, 'X');
  assert.deepEqual(result.winningLine, [0, 1, 2]);
});

test('Tic-Tac-Toe: Detects vertical column wins', () => {
  const board: TicTacToeBoard = [
    'X', 'O', null,
    'X', 'O', null,
    null, 'O', 'X'
  ];
  const result = checkTicTacToeWinner(board);
  assert.equal(result.winner, 'O');
  assert.deepEqual(result.winningLine, [1, 4, 7]);
});

test('Tic-Tac-Toe: Detects diagonal wins', () => {
  const board: TicTacToeBoard = [
    'X', 'O', null,
    null, 'X', 'O',
    null, null, 'X'
  ];
  const result = checkTicTacToeWinner(board);
  assert.equal(result.winner, 'X');
  assert.deepEqual(result.winningLine, [0, 4, 8]);
});

test('Tic-Tac-Toe: Detects draw when board is full with no winner', () => {
  const board: TicTacToeBoard = [
    'X', 'O', 'X',
    'X', 'O', 'O',
    'O', 'X', 'X'
  ];
  const result = checkTicTacToeWinner(board);
  assert.equal(result.winner, 'draw');
  assert.equal(result.winningLine, null);
});

test('Tic-Tac-Toe: Identifies available moves accurately', () => {
  const board: TicTacToeBoard = [
    'X', null, 'O',
    null, 'X', null,
    null, null, null
  ];
  const available = getAvailableTicTacToeMoves(board);
  assert.deepEqual(available, [1, 3, 5, 6, 7, 8]);
});

test('Tic-Tac-Toe Minimax AI: AI takes immediate winning move', () => {
  // O can win at index 2
  const board: TicTacToeBoard = [
    'O', 'O', null,
    'X', 'X', null,
    null, null, null
  ];
  const move = getTicTacToeAiMove(board, 'O', 'smart');
  assert.equal(move, 2, 'AI should take winning square index 2');
});

test('Tic-Tac-Toe Minimax AI: AI blocks opponent winning move', () => {
  // X is threatening to win at index 2
  const board: TicTacToeBoard = [
    'X', 'X', null,
    'O', null, null,
    null, null, null
  ];
  const move = getTicTacToeAiMove(board, 'O', 'smart');
  assert.equal(move, 2, 'AI should block opponent at square index 2');
});

/* ========================================================================== */
/* CHESS ENGINE TESTS                                                         */
/* ========================================================================== */

test('Chess Engine: Sets up standard 8x8 initial board', () => {
  const board = createInitialBoard();
  assert.equal(board.length, 8);
  assert.equal(board[0].length, 8);

  // Black back rank
  assert.deepEqual(board[0][0], { type: 'r', color: 'b' });
  assert.deepEqual(board[0][4], { type: 'k', color: 'b' });

  // Black pawns on row 1
  assert.deepEqual(board[1][3], { type: 'p', color: 'b' });

  // White back rank
  assert.deepEqual(board[7][4], { type: 'k', color: 'w' });
  assert.deepEqual(board[7][7], { type: 'r', color: 'w' });

  // White pawns on row 6
  assert.deepEqual(board[6][4], { type: 'p', color: 'w' });

  // Middle squares empty
  assert.equal(board[3][3], null);
  assert.equal(board[4][4], null);
});

test('Chess Engine: Pawn legal initial double-step and single-step', () => {
  const board = createInitialBoard();
  // White e-pawn at row 6, col 4
  const moves = getLegalMoves(board, 6, 4);
  const algebraicDests = moves.map(([r, c]) => squareToAlgebraic(r, c));
  assert.ok(algebraicDests.includes('e3'));
  assert.ok(algebraicDests.includes('e4'));
  assert.equal(moves.length, 2);
});

test('Chess Engine: Knight legal moves over pawns', () => {
  const board = createInitialBoard();
  // White Knight at b1 (row 7, col 1)
  const moves = getLegalMoves(board, 7, 1);
  const algebraicDests = moves.map(([r, c]) => squareToAlgebraic(r, c));
  assert.ok(algebraicDests.includes('a3'));
  assert.ok(algebraicDests.includes('c3'));
  assert.equal(moves.length, 2);
});

test('Chess Engine: Executes move and produces standard algebraic notation', () => {
  const board = createInitialBoard();
  // Move e2 to e4 (from 6,4 to 4,4)
  const { nextBoard, notation } = makeMove(board, [6, 4], [4, 4]);
  assert.equal(notation, 'e4');
  assert.equal(nextBoard[6][4], null);
  assert.deepEqual(nextBoard[4][4], { type: 'p', color: 'w' });
});

test('Chess Engine: Pawn promotion on back rank', () => {
  const board: ChessBoard = Array(8).fill(null).map(() => Array(8).fill(null));
  // White pawn at 7th rank (row 1, col 3 = d7)
  board[1][3] = { type: 'p', color: 'w' };
  board[7][4] = { type: 'k', color: 'w' };
  board[0][4] = { type: 'k', color: 'b' };

  // Move pawn to row 0 (d8)
  const { nextBoard, notation } = makeMove(board, [1, 3], [0, 3]);
  assert.ok(notation.includes('=Q'));
  assert.deepEqual(nextBoard[0][3], { type: 'q', color: 'w' });
});

test('Chess Engine: Detects king check state', () => {
  const board: ChessBoard = Array(8).fill(null).map(() => Array(8).fill(null));
  // Black king at e8 (0,4)
  board[0][4] = { type: 'k', color: 'b' };
  // White king at e1 (7,4)
  board[7][4] = { type: 'k', color: 'w' };
  // White rook at e5 (3,4) delivering check along e-file
  board[3][4] = { type: 'r', color: 'w' };

  assert.equal(isKingInCheck(board, 'b'), true);
  assert.equal(isKingInCheck(board, 'w'), false);
});

test('Chess Engine: AI generates a legal move', () => {
  const board = createInitialBoard();
  const aiMove = getChessAiMove(board, 'b', 'smart');
  assert.ok(aiMove !== null);
  assert.ok(aiMove.from[0] >= 0 && aiMove.from[0] < 8);
  assert.ok(aiMove.to[0] >= 0 && aiMove.to[0] < 8);
});

/* ========================================================================== */
/* SNAKES & LADDERS TESTS                                                     */
/* ========================================================================== */

test('Snakes & Ladders: Dice rolls integer between 1 and 6', () => {
  for (let i = 0; i < 20; i++) {
    const roll = rollDice();
    assert.ok(roll >= 1 && roll <= 6 && Number.isInteger(roll));
  }
});

test('Snakes & Ladders: Climbing a ladder promotes family positive habits', () => {
  // Ladder at pos 4 climbs to 25 ("Helped Nani fold all laundry")
  const result = calculateNewPosition(1, 3); // 1 + 3 = 4
  assert.equal(result.finalPos, 25);
  assert.ok(result.modifier);
  assert.equal(result.modifier.type, 'ladder');
  assert.equal(result.modifier.label, 'Helped Nani fold all laundry');
  assert.equal(result.won, false);
});

test('Snakes & Ladders: Sliding down a snake reflects domestic carelessness', () => {
  // Snake at pos 28 slides to 10 ("Forgot to fill dinner water bottles")
  const result = calculateNewPosition(25, 3); // 25 + 3 = 28
  assert.equal(result.finalPos, 10);
  assert.ok(result.modifier);
  assert.equal(result.modifier.type, 'snake');
  assert.equal(result.modifier.label, 'Forgot to fill dinner water bottles');
});

test('Snakes & Ladders: Bounce back on target overshoot', () => {
  // From 98, rolling 5 = target 103 -> overshoot by 3 -> bounces back to 97
  const result = calculateNewPosition(98, 5);
  assert.equal(result.finalPos, 97);
  assert.equal(result.won, false);
});

test('Snakes & Ladders: Exact landing on 100 wins the game', () => {
  // From 96, rolling 4 lands exactly on 100
  const result = calculateNewPosition(96, 4);
  assert.equal(result.finalPos, 100);
  assert.equal(result.won, true);
});
