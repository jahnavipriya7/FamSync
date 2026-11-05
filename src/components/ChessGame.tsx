import React, { useState, useEffect } from 'react';
import { 
  ChessBoard, 
  PieceColor, 
  createInitialBoard, 
  getLegalMoves, 
  getAllLegalMoves,
  isKingInCheck, 
  makeMove, 
  getChessAiMove,
  squareToAlgebraic,
  PIECE_SYMBOLS,
  ChessPiece
} from '../utils/chessEngine';
import { MemberProfile, Language } from '../types';
import { getMemberDisplayName, getMemberAvatar } from '../utils/stepRaceStorage';
import { RotateCcw, Bot, Users, Trophy, Undo2, Sparkles, RefreshCw } from 'lucide-react';

interface ChessGameProps {
  currentMember: MemberProfile;
  allMembers: MemberProfile[];
  lang: Language;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ChessGame: React.FC<ChessGameProps> = ({
  currentMember,
  allMembers,
  lang,
  onShowToast
}) => {
  const [board, setBoard] = useState<ChessBoard>(createInitialBoard);
  const [turn, setTurn] = useState<PieceColor>('w');
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [legalDestinations, setLegalDestinations] = useState<[number, number][]>([]);
  const [gameMode, setGameMode] = useState<'ai' | 'pass-and-play'>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'smart'>('smart');
  const [opponentMemberId, setOpponentMemberId] = useState<string>(
    allMembers.find(m => m.id === 'member-nanna')?.id || allMembers[1]?.id || allMembers[0]?.id
  );
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [boardHistory, setBoardHistory] = useState<ChessBoard[]>([]);
  const [capturedPieces, setCapturedPieces] = useState<{ w: string[]; b: string[] }>({ w: [], b: [] });
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('White to move');
  const [gameOver, setGameOver] = useState<boolean>(false);

  const whitePlayerName = getMemberDisplayName(allMembers, currentMember.id, currentMember.name);
  const whitePlayerAvatar = getMemberAvatar(allMembers, currentMember.id, currentMember.avatar);

  const opponentMember = allMembers.find(m => m.id === opponentMemberId);
  const blackPlayerName = gameMode === 'ai'
    ? (aiDifficulty === 'smart' ? 'Vizag Chess AI 🤖' : 'Friendly Nani AI 🤖')
    : getMemberDisplayName(allMembers, opponentMemberId, opponentMember?.name || 'Black Player');
  const blackPlayerAvatar = gameMode === 'ai' ? '🤖' : getMemberAvatar(allMembers, opponentMemberId, opponentMember?.avatar || '♟️');

  // Check Game State (Check, Checkmate, Stalemate) after every move
  useEffect(() => {
    const inCheck = isKingInCheck(board, turn);
    const legalMoves = getAllLegalMoves(board, turn);

    if (legalMoves.length === 0) {
      setGameOver(true);
      if (inCheck) {
        const winnerColor: PieceColor = turn === 'w' ? 'b' : 'w';
        const winnerName = winnerColor === 'w' ? whitePlayerName : blackPlayerName;
        setStatusMessage(`Checkmate! ${winnerName} Wins! 👑`);
        onShowToast(
          lang === 'te' 
            ? `చెక్మేట్! విజేత: ${winnerName}! 🏆` 
            : `Checkmate! ${winnerName} Wins the match! 🏆`, 
          'success'
        );
      } else {
        setStatusMessage('Stalemate! Match Drawn 🤝');
        onShowToast(lang === 'te' ? 'స్టేల్‌మేట్! డ్రా 🤝' : 'Stalemate! Game is a draw 🤝', 'info');
      }
    } else if (inCheck) {
      setStatusMessage(`${turn === 'w' ? 'White' : 'Black'} is in CHECK! ⚠️`);
    } else {
      setStatusMessage(`${turn === 'w' ? `${whitePlayerName} (White)` : `${blackPlayerName} (Black)`}'s turn`);
    }
  }, [board, turn]);

  // AI Turn Handling
  useEffect(() => {
    if (gameMode === 'ai' && turn === 'b' && !gameOver && !isAiThinking) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getChessAiMove(board, 'b', aiDifficulty);
        if (aiMove) {
          executeMove(aiMove.from, aiMove.to);
        }
        setIsAiThinking(false);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, gameOver, board, aiDifficulty]);

  const executeMove = (from: [number, number], to: [number, number]) => {
    // Save history for undo
    setBoardHistory(prev => [...prev, board]);

    const { nextBoard, capturedPiece, notation } = makeMove(board, from, to);

    if (capturedPiece) {
      const capturerColor: PieceColor = capturedPiece.color === 'w' ? 'b' : 'w';
      setCapturedPieces(prev => ({
        ...prev,
        [capturerColor]: [...prev[capturerColor], PIECE_SYMBOLS[capturedPiece.color][capturedPiece.type]]
      }));
    }

    setMoveHistory(prev => [...prev, notation]);
    setBoard(nextBoard);
    setTurn(prev => (prev === 'w' ? 'b' : 'w'));
    setSelectedSquare(null);
    setLegalDestinations([]);
  };

  const handleSquareClick = (r: number, c: number) => {
    if (gameOver || isAiThinking) return;
    if (gameMode === 'ai' && turn !== 'w') return;

    // If destination clicked
    if (selectedSquare) {
      const isDestination = legalDestinations.some(([dr, dc]) => dr === r && dc === c);
      if (isDestination) {
        executeMove(selectedSquare, [r, c]);
        return;
      }
    }

    // Selecting a piece
    const piece = board[r][c];
    if (piece && piece.color === turn) {
      setSelectedSquare([r, c]);
      const moves = getLegalMoves(board, r, c);
      setLegalDestinations(moves);
    } else {
      setSelectedSquare(null);
      setLegalDestinations([]);
    }
  };

  const handleUndo = () => {
    if (boardHistory.length === 0 || isAiThinking) return;
    const stepsBack = gameMode === 'ai' && boardHistory.length >= 2 ? 2 : 1;
    const targetBoard = boardHistory[boardHistory.length - stepsBack];
    const newBoardHist = boardHistory.slice(0, boardHistory.length - stepsBack);
    const newMoveHist = moveHistory.slice(0, moveHistory.length - stepsBack);

    setBoard(targetBoard);
    setBoardHistory(newBoardHist);
    setMoveHistory(newMoveHist);
    setTurn('w');
    setGameOver(false);
    setSelectedSquare(null);
    setLegalDestinations([]);
    onShowToast('Move undone.', 'info');
  };

  const handleResetGame = () => {
    setBoard(createInitialBoard());
    setTurn('w');
    setSelectedSquare(null);
    setLegalDestinations([]);
    setMoveHistory([]);
    setBoardHistory([]);
    setCapturedPieces({ w: [], b: [] });
    setGameOver(false);
    setIsAiThinking(false);
    setStatusMessage('White to move');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header & Mode Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>♟️ Family Speed Chess Arena ♚</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {lang === 'te'
              ? 'చెస్ గేమ్: నియమాలు, AI పాశ్చాత్య ఎత్తులు మరియు 2-ప్లేయర్ డ్యుయల్.'
              : 'Interactive 8x8 chessboard with legal moves, check detection, and AI opponent!'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => {
                setGameMode('ai');
                handleResetGame();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                gameMode === 'ai' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-brand-600" />
              <span>{lang === 'te' ? 'AI తో ఆడు' : 'Vs AI Bot'}</span>
            </button>
            <button
              onClick={() => {
                setGameMode('pass-and-play');
                handleResetGame();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                gameMode === 'pass-and-play' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'te' ? 'ఫ్యామిలీ డ్యుయల్' : '2-Player Duel'}</span>
            </button>
          </div>

          {gameMode === 'ai' && (
            <select
              value={aiDifficulty}
              onChange={e => {
                setAiDifficulty(e.target.value as 'easy' | 'smart');
                handleResetGame();
              }}
              className="text-xs font-bold border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white text-slate-800"
            >
              <option value="smart">Smart AI (Positional)</option>
              <option value="easy">Casual AI (Friendly)</option>
            </select>
          )}

          {gameMode === 'pass-and-play' && (
            <select
              value={opponentMemberId}
              onChange={e => {
                setOpponentMemberId(e.target.value);
                handleResetGame();
              }}
              className="text-xs font-bold border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white text-slate-800"
            >
              {allMembers.filter(m => m.id !== currentMember.id).map(m => (
                <option key={m.id} value={m.id}>
                  {m.avatar} {m.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Players Header & Turn Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        {/* White Player */}
        <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
          turn === 'w' && !gameOver ? 'bg-white shadow-xs border border-brand-300' : 'opacity-80'
        }`}>
          <span className="text-3xl">{whitePlayerAvatar}</span>
          <div>
            <div className="font-extrabold text-xs sm:text-sm text-slate-900">
              {whitePlayerName}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              White Pieces ♔
            </span>
            <div className="text-xs font-mono text-slate-600 mt-0.5">
              Captured: {capturedPieces.w.join(' ') || 'none'}
            </div>
          </div>
        </div>

        {/* Center Status Banner */}
        <div className="text-center px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs sm:text-sm font-black text-slate-900">
            {isAiThinking ? (
              <span className="text-indigo-600 animate-pulse flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                AI is calculating...
              </span>
            ) : (
              statusMessage
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            Moves played: {moveHistory.length}
          </span>
        </div>

        {/* Black Player */}
        <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
          turn === 'b' && !gameOver ? 'bg-white shadow-xs border border-amber-300' : 'opacity-80'
        }`}>
          <div className="text-right">
            <div className="font-extrabold text-xs sm:text-sm text-slate-900">
              {blackPlayerName}
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Black Pieces ♚
            </span>
            <div className="text-xs font-mono text-slate-600 mt-0.5">
              Captured: {capturedPieces.b.join(' ') || 'none'}
            </div>
          </div>
          <span className="text-3xl">{blackPlayerAvatar}</span>
        </div>
      </div>

      {/* 8x8 Chessboard */}
      <div className="flex flex-col items-center select-none py-1">
        <div className="border-4 border-slate-800 rounded-2xl overflow-hidden shadow-xl bg-slate-900">
          {board.map((row, r) => (
            <div key={r} className="flex">
              {row.map((piece, c) => {
                const isLight = (r + c) % 2 === 0;
                const isSelected = selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c;
                const isLegalDest = legalDestinations.some(([dr, dc]) => dr === r && dc === c);

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSquareClick(r, c)}
                    className={`w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl transition-all relative ${
                      isSelected
                        ? 'bg-amber-300'
                        : isLegalDest
                        ? isLight ? 'bg-emerald-200' : 'bg-emerald-400'
                        : isLight
                        ? 'bg-amber-50 hover:bg-amber-100'
                        : 'bg-amber-800 hover:bg-amber-900'
                    }`}
                  >
                    {/* Destination marker dot if empty */}
                    {isLegalDest && !piece && (
                      <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-700/60 pointer-events-none" />
                    )}

                    {/* Destination border if capture */}
                    {isLegalDest && piece && (
                      <span className="absolute inset-0 border-2 border-rose-500 rounded pointer-events-none animate-pulse" />
                    )}

                    {/* Chess piece glyph */}
                    {piece && (
                      <span className={`transform transition-transform active:scale-90 font-mono ${
                        piece.color === 'w' 
                          ? 'text-slate-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]' 
                          : 'text-slate-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]'
                      }`}>
                        {PIECE_SYMBOLS[piece.color][piece.type]}
                      </span>
                    )}

                    {/* Algebraic coordinate label on edge squares */}
                    {c === 0 && (
                      <span className="absolute top-0.5 left-0.5 text-[8px] font-black opacity-40 text-slate-900 pointer-events-none">
                        {8 - r}
                      </span>
                    )}
                    {r === 7 && (
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-black opacity-40 text-slate-900 pointer-events-none">
                        {String.fromCharCode('a'.charCodeAt(0) + c)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Move History / Notation Log */}
      {moveHistory.length > 0 && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-24 overflow-y-auto">
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono font-bold text-slate-700">
            <span className="text-[10px] uppercase font-black text-slate-400">Moves:</span>
            {moveHistory.map((mv, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-white rounded border border-slate-200">
                {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}{mv}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Game Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
        <button
          onClick={handleUndo}
          disabled={boardHistory.length === 0 || isAiThinking}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs transition-colors"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>{lang === 'te' ? 'వెనక్కి (Undo)' : 'Undo Move'}</span>
        </button>

        <button
          onClick={handleResetGame}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'te' ? 'కొత్త గేమ్ ప్రారంభించు' : 'New Chess Match'}</span>
        </button>
      </div>
    </div>
  );
};
