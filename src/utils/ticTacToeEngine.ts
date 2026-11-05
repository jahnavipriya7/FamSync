export type CellValue = 'X' | 'O' | null;
export type TicTacToeBoard = CellValue[];

export interface TicTacToeState {
  board: TicTacToeBoard;
  turn: 'X' | 'O';
  winner: 'X' | 'O' | 'draw' | null;
  winningLine: number[] | null;
  scores: { X: number; O: number; draws: number };
}

export const WINNING_COMBINATIONS = [
  [0, 1, 2], // row 1
  [3, 4, 5], // row 2
  [6, 7, 8], // row 3
  [0, 3, 6], // col 1
  [1, 4, 7], // col 2
  [2, 5, 8], // col 3
  [0, 4, 8], // diagonal \
  [2, 4, 6]  // diagonal /
];

export function checkTicTacToeWinner(board: TicTacToeBoard): { winner: 'X' | 'O' | 'draw' | null; winningLine: number[] | null } {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as 'X' | 'O', winningLine: combo };
    }
  }

  const isFull = board.every(cell => cell !== null);
  if (isFull) {
    return { winner: 'draw', winningLine: null };
  }

  return { winner: null, winningLine: null };
}

export function getAvailableTicTacToeMoves(board: TicTacToeBoard): number[] {
  return board
    .map((val, idx) => (val === null ? idx : null))
    .filter((idx): idx is number => idx !== null);
}

/**
 * Minimax algorithm for unbeatable or smart AI in Tic-Tac-Toe
 */
function minimax(
  board: TicTacToeBoard,
  depth: number,
  isMaximizing: boolean,
  aiSymbol: 'X' | 'O'
): { score: number; move?: number } {
  const humanSymbol: 'X' | 'O' = aiSymbol === 'O' ? 'X' : 'O';
  const { winner } = checkTicTacToeWinner(board);

  if (winner === aiSymbol) return { score: 10 - depth };
  if (winner === humanSymbol) return { score: depth - 10 };
  if (winner === 'draw') return { score: 0 };

  const available = getAvailableTicTacToeMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = available[0];
    for (const move of available) {
      board[move] = aiSymbol;
      const result = minimax(board, depth + 1, false, aiSymbol);
      board[move] = null;
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
    return { score: bestScore, move: bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove = available[0];
    for (const move of available) {
      board[move] = humanSymbol;
      const result = minimax(board, depth + 1, true, aiSymbol);
      board[move] = null;
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
    }
    return { score: bestScore, move: bestMove };
  }
}

/**
 * Generates the AI move for Tic-Tac-Toe based on difficulty
 */
export function getTicTacToeAiMove(
  board: TicTacToeBoard,
  aiSymbol: 'X' | 'O' = 'O',
  difficulty: 'easy' | 'smart' = 'smart'
): number {
  const available = getAvailableTicTacToeMoves(board);
  if (available.length === 0) return -1;

  if (difficulty === 'easy') {
    // 60% chance random move, 40% smart
    if (Math.random() < 0.6) {
      return available[Math.floor(Math.random() * available.length)];
    }
  }

  // Smart Minimax
  const result = minimax([...board], 0, true, aiSymbol);
  return result.move !== undefined ? result.move : available[0];
}
