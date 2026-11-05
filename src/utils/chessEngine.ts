export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export type ChessBoard = (ChessPiece | null)[][]; // 8x8 grid: [row][col] (0,0 is a8, 7,7 is h1)

export interface ChessMove {
  from: [number, number];
  to: [number, number];
  captured?: ChessPiece | null;
  promotion?: PieceType;
  notation?: string;
}

export interface ChessGameState {
  board: ChessBoard;
  turn: PieceColor;
  moveHistory: ChessMove[];
  capturedPieces: { w: PieceType[]; b: PieceType[] };
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  winner: PieceColor | 'draw' | null;
}

export const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙'
  },
  b: {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟'
  }
};

export const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

export function createInitialBoard(): ChessBoard {
  const board: ChessBoard = Array(8).fill(null).map(() => Array(8).fill(null));

  // Black pieces (row 0 & 1)
  const blackBackRank: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: blackBackRank[c], color: 'b' };
    board[1][c] = { type: 'p', color: 'b' };
  }

  // White pieces (row 6 & 7)
  const whiteBackRank: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  for (let c = 0; c < 8; c++) {
    board[6][c] = { type: 'p', color: 'w' };
    board[7][c] = { type: whiteBackRank[c], color: 'w' };
  }

  return board;
}

export function cloneBoard(board: ChessBoard): ChessBoard {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

export function isWithinBoard(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

/**
 * Generates pseudo-legal moves for a specific piece ignoring check
 */
export function getPseudoLegalMoves(
  board: ChessBoard,
  r: number,
  c: number
): [number, number][] {
  const piece = board[r][c];
  if (!piece) return [];

  const moves: [number, number][] = [];
  const color = piece.color;
  const enemyColor: PieceColor = color === 'w' ? 'b' : 'w';

  switch (piece.type) {
    case 'p': {
      const direction = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;

      // Advance 1
      const forward1 = r + direction;
      if (isWithinBoard(forward1, c) && !board[forward1][c]) {
        moves.push([forward1, c]);
        // Advance 2 from start row
        const forward2 = r + direction * 2;
        if (r === startRow && isWithinBoard(forward2, c) && !board[forward2][c]) {
          moves.push([forward2, c]);
        }
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const diagR = r + direction;
        const diagC = c + dc;
        if (isWithinBoard(diagR, diagC)) {
          const target = board[diagR][diagC];
          if (target && target.color === enemyColor) {
            moves.push([diagR, diagC]);
          }
        }
      }
      break;
    }

    case 'n': {
      const knightDeltas = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of knightDeltas) {
        const nr = r + dr;
        const nc = c + dc;
        if (isWithinBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!target || target.color === enemyColor) {
            moves.push([nr, nc]);
          }
        }
      }
      break;
    }

    case 'b': {
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of directions) {
        let nr = r + dr;
        let nc = c + dc;
        while (isWithinBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!target) {
            moves.push([nr, nc]);
          } else {
            if (target.color === enemyColor) moves.push([nr, nc]);
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'r': {
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of directions) {
        let nr = r + dr;
        let nc = c + dc;
        while (isWithinBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!target) {
            moves.push([nr, nc]);
          } else {
            if (target.color === enemyColor) moves.push([nr, nc]);
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'q': {
      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
      ];
      for (const [dr, dc] of directions) {
        let nr = r + dr;
        let nc = c + dc;
        while (isWithinBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!target) {
            moves.push([nr, nc]);
          } else {
            if (target.color === enemyColor) moves.push([nr, nc]);
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'k': {
      const kingDeltas = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];
      for (const [dr, dc] of kingDeltas) {
        const nr = r + dr;
        const nc = c + dc;
        if (isWithinBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!target || target.color === enemyColor) {
            moves.push([nr, nc]);
          }
        }
      }
      break;
    }
  }

  return moves;
}

export function findKing(board: ChessBoard, color: PieceColor): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'k' && piece.color === color) {
        return [r, c];
      }
    }
  }
  return null;
}

/**
 * Checks if a specific color's king is currently under check
 */
export function isKingInCheck(board: ChessBoard, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const enemyColor: PieceColor = color === 'w' ? 'b' : 'w';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === enemyColor) {
        const moves = getPseudoLegalMoves(board, r, c);
        if (moves.some(([mr, mc]) => mr === kingPos[0] && mc === kingPos[1])) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Gets all strictly legal moves for a piece that do not leave the king in check
 */
export function getLegalMoves(board: ChessBoard, r: number, c: number): [number, number][] {
  const piece = board[r][c];
  if (!piece) return [];

  const pseudoMoves = getPseudoLegalMoves(board, r, c);
  const legalMoves: [number, number][] = [];

  for (const [tr, tc] of pseudoMoves) {
    const nextBoard = cloneBoard(board);
    // Execute pseudo move
    nextBoard[tr][tc] = nextBoard[r][c];
    nextBoard[r][c] = null;

    // Check if mover's king is in check after this move
    if (!isKingInCheck(nextBoard, piece.color)) {
      legalMoves.push([tr, tc]);
    }
  }

  return legalMoves;
}

export function getAllLegalMoves(board: ChessBoard, color: PieceColor): { from: [number, number]; to: [number, number] }[] {
  const allMoves: { from: [number, number]; to: [number, number] }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const moves = getLegalMoves(board, r, c);
        for (const to of moves) {
          allMoves.push({ from: [r, c], to });
        }
      }
    }
  }
  return allMoves;
}

/**
 * Converts row/col to algebraic square name (e.g. 7,4 -> "e1")
 */
export function squareToAlgebraic(r: number, c: number): string {
  const colLetter = String.fromCharCode('a'.charCodeAt(0) + c);
  const rowNumber = 8 - r;
  return `${colLetter}${rowNumber}`;
}

/**
 * Executes a move on the board and returns the updated state
 */
export function makeMove(
  board: ChessBoard,
  from: [number, number],
  to: [number, number]
): { nextBoard: ChessBoard; capturedPiece: ChessPiece | null; notation: string } {
  const nextBoard = cloneBoard(board);
  const piece = nextBoard[from[0]][from[1]];
  if (!piece) throw new Error('No piece at source square');

  const capturedPiece = nextBoard[to[0]][to[1]];

  // Move piece
  nextBoard[to[0]][to[1]] = piece;
  nextBoard[from[0]][from[1]] = null;

  // Pawn promotion to Queen on back rank
  let isPromoted = false;
  if (piece.type === 'p' && (to[0] === 0 || to[0] === 7)) {
    nextBoard[to[0]][to[1]] = { type: 'q', color: piece.color };
    isPromoted = true;
  }

  // Generate readable notation
  const piecePrefix = piece.type === 'p' ? '' : piece.type.toUpperCase();
  const captureMark = capturedPiece ? (piece.type === 'p' ? `${squareToAlgebraic(from[0], from[1])[0]}x` : 'x') : '';
  const dest = squareToAlgebraic(to[0], to[1]);
  const promoMark = isPromoted ? '=Q' : '';
  const notation = `${piecePrefix}${captureMark}${dest}${promoMark}`;

  return { nextBoard, capturedPiece, notation };
}

/**
 * AI Move selector with positional heuristic and capture priority
 */
export function getChessAiMove(
  board: ChessBoard,
  color: PieceColor = 'b',
  difficulty: 'easy' | 'smart' = 'smart'
): { from: [number, number]; to: [number, number] } | null {
  const legalMoves = getAllLegalMoves(board, color);
  if (legalMoves.length === 0) return null;

  if (difficulty === 'easy') {
    // 50% random, 50% priority capture
    const captureMoves = legalMoves.filter(m => board[m.to[0]][m.to[1]] !== null);
    if (captureMoves.length > 0 && Math.random() < 0.5) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Smart Heuristic Search (1-ply evaluate with material & center control)
  let bestScore = -Infinity;
  let bestMove = legalMoves[0];

  for (const move of legalMoves) {
    const { nextBoard, capturedPiece } = makeMove(board, move.from, move.to);

    let score = 0;

    // Material gain
    if (capturedPiece) {
      score += PIECE_VALUES[capturedPiece.type] * 1.5;
    }

    // Center board preference (d4, d5, e4, e5, c4, c5, f4, f5)
    const [tr, tc] = move.to;
    if ((tr === 3 || tr === 4) && (tc === 3 || tc === 4)) {
      score += 35;
    } else if (tr >= 2 && tr <= 5 && tc >= 2 && tc <= 5) {
      score += 15;
    }

    // Check bonus
    const opponentColor: PieceColor = color === 'w' ? 'b' : 'w';
    if (isKingInCheck(nextBoard, opponentColor)) {
      score += 40;
    }

    // Penalty if moved piece becomes immediately capturable by enemy
    const enemyReplies = getAllLegalMoves(nextBoard, opponentColor);
    const movedPiece = nextBoard[tr][tc];
    const wouldBeCaptured = enemyReplies.some(r => r.to[0] === tr && r.to[1] === tc);
    if (wouldBeCaptured && movedPiece) {
      score -= PIECE_VALUES[movedPiece.type] * 0.9;
    }

    // Small random jitter to prevent predictable repetition
    score += Math.random() * 8;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
