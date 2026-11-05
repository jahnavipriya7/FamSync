import React, { useState, useEffect } from 'react';
import { 
  TicTacToeBoard, 
  checkTicTacToeWinner, 
  getTicTacToeAiMove 
} from '../utils/ticTacToeEngine';
import { MemberProfile, Language } from '../types';
import { getMemberDisplayName, getMemberAvatar } from '../utils/stepRaceStorage';
import { RotateCcw, Bot, Users, Trophy, Sparkles, RefreshCw } from 'lucide-react';

interface TicTacToeGameProps {
  currentMember: MemberProfile;
  allMembers: MemberProfile[];
  lang: Language;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const TicTacToeGame: React.FC<TicTacToeGameProps> = ({
  currentMember,
  allMembers,
  lang,
  onShowToast
}) => {
  const [board, setBoard] = useState<TicTacToeBoard>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [gameMode, setGameMode] = useState<'ai' | 'pass-and-play'>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'smart'>('smart');
  const [opponentMemberId, setOpponentMemberId] = useState<string>(
    allMembers.find(m => m.id !== currentMember.id)?.id || allMembers[0]?.id
  );
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winnerInfo, setWinnerInfo] = useState<{ winner: 'X' | 'O' | 'draw' | null; winningLine: number[] | null }>({
    winner: null,
    winningLine: null
  });
  const [isAiThinking, setIsAiThinking] = useState(false);

  const playerXName = getMemberDisplayName(allMembers, currentMember.id, currentMember.name);
  const playerXAvatar = getMemberAvatar(allMembers, currentMember.id, currentMember.avatar);

  const opponentMember = allMembers.find(m => m.id === opponentMemberId);
  const playerOName = gameMode === 'ai' 
    ? (aiDifficulty === 'smart' ? 'Vizag AI Master 🤖' : 'Friendly AI Bot 🤖') 
    : getMemberDisplayName(allMembers, opponentMemberId, opponentMember?.name || 'Player 2');
  const playerOAvatar = gameMode === 'ai' ? '🤖' : getMemberAvatar(allMembers, opponentMemberId, opponentMember?.avatar || '🏃');

  // Check winner on board update
  useEffect(() => {
    const outcome = checkTicTacToeWinner(board);
    setWinnerInfo(outcome);

    if (outcome.winner) {
      if (outcome.winner === 'draw') {
        setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        onShowToast(lang === 'te' ? 'ఆట డ్రాగా ముగిసింది! 🤝' : "It's a draw! Well played both! 🤝", 'info');
      } else {
        const winnerName = outcome.winner === 'X' ? playerXName : playerOName;
        setScores(prev => ({
          ...prev,
          [outcome.winner as 'X' | 'O']: prev[outcome.winner as 'X' | 'O'] + 1
        }));
        onShowToast(
          lang === 'te' 
            ? `విజేత: ${winnerName}! 🏆` 
            : `Winner: ${winnerName}! 🏆`, 
          'success'
        );
      }
    }
  }, [board]);

  // Handle AI turn
  useEffect(() => {
    if (gameMode === 'ai' && turn === 'O' && !winnerInfo.winner && !isAiThinking) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getTicTacToeAiMove(board, 'O', aiDifficulty);
        if (aiMove !== -1) {
          const nextBoard = [...board];
          nextBoard[aiMove] = 'O';
          setBoard(nextBoard);
          setTurn('X');
        }
        setIsAiThinking(false);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, winnerInfo.winner, board, aiDifficulty]);

  const handleCellClick = (idx: number) => {
    if (board[idx] || winnerInfo.winner || isAiThinking) return;

    if (gameMode === 'ai' && turn !== 'X') return;

    const nextBoard = [...board];
    nextBoard[idx] = turn;
    setBoard(nextBoard);
    setTurn(turn === 'X' ? 'O' : 'X');
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinnerInfo({ winner: null, winningLine: null });
    setIsAiThinking(false);
  };

  const resetMatchScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
    resetGame();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>⭕ Tic-Tac-Toe Family Arena ❌</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {lang === 'te' 
              ? 'AI రోబోట్ లేదా కుటుంబ సభ్యులతో నేరుగా సరదాగా ఆడండి!' 
              : 'Classic quick duel vs Minimax AI or 2-player family pass-and-play!'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => {
                setGameMode('ai');
                resetGame();
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
                resetGame();
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
                resetGame();
              }}
              className="text-xs font-bold border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white text-slate-800"
            >
              <option value="smart">Smart AI (Minimax)</option>
              <option value="easy">Casual AI (Friendly)</option>
            </select>
          )}

          {gameMode === 'pass-and-play' && (
            <select
              value={opponentMemberId}
              onChange={e => {
                setOpponentMemberId(e.target.value);
                resetGame();
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

      {/* Players Banner & Scoreboard */}
      <div className="grid grid-cols-3 gap-3 items-center text-center p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
        {/* Player X */}
        <div className={`p-2.5 rounded-xl transition-all ${
          turn === 'X' && !winnerInfo.winner 
            ? 'bg-brand-50 border border-brand-300 shadow-xs' 
            : 'bg-white border border-slate-200'
        }`}>
          <div className="text-2xl mb-1">{playerXAvatar}</div>
          <div className="font-black text-xs sm:text-sm text-slate-900 truncate">
            {playerXName}
          </div>
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-100 text-brand-800">
            Player X (You)
          </span>
          <div className="mt-1 font-mono font-black text-lg text-brand-700">
            {scores.X} wins
          </div>
        </div>

        {/* Status / VS center */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Match Status
          </span>
          {winnerInfo.winner ? (
            <div className="text-sm font-black text-amber-600 animate-bounce">
              {winnerInfo.winner === 'draw' 
                ? 'Draw Match! 🤝' 
                : `${winnerInfo.winner === 'X' ? playerXName : playerOName} Wins! 👑`}
            </div>
          ) : (
            <div className="text-xs sm:text-sm font-black text-slate-700">
              {isAiThinking ? (
                <span className="text-indigo-600 animate-pulse flex items-center justify-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  AI thinking...
                </span>
              ) : (
                <span>Turn: <strong>{turn === 'X' ? playerXName : playerOName}</strong></span>
              )}
            </div>
          )}
          <div className="text-[11px] font-semibold text-slate-500">
            Ties: {scores.draws}
          </div>
        </div>

        {/* Player O */}
        <div className={`p-2.5 rounded-xl transition-all ${
          turn === 'O' && !winnerInfo.winner 
            ? 'bg-amber-50 border border-amber-300 shadow-xs' 
            : 'bg-white border border-slate-200'
        }`}>
          <div className="text-2xl mb-1">{playerOAvatar}</div>
          <div className="font-black text-xs sm:text-sm text-slate-900 truncate">
            {playerOName}
          </div>
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
            Player O
          </span>
          <div className="mt-1 font-mono font-black text-lg text-amber-700">
            {scores.O} wins
          </div>
        </div>
      </div>

      {/* 3x3 Tic Tac Toe Grid */}
      <div className="flex justify-center py-2">
        <div className="grid grid-cols-3 gap-3 w-72 sm:w-80 h-72 sm:h-80 select-none">
          {board.map((cell, idx) => {
            const isWinningCell = winnerInfo.winningLine?.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCellClick(idx)}
                disabled={Boolean(cell || winnerInfo.winner || isAiThinking)}
                className={`h-full w-full rounded-2xl flex items-center justify-center font-black text-4xl sm:text-5xl transition-all transform active:scale-95 shadow-sm border-2 ${
                  isWinningCell
                    ? 'bg-amber-100 border-amber-400 text-amber-700 ring-2 ring-amber-300 animate-pulse'
                    : cell === 'X'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : cell === 'O'
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>
      </div>

      {/* Game Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
        <button
          onClick={resetMatchScores}
          className="text-xs text-slate-400 hover:text-slate-600 font-bold"
        >
          {lang === 'te' ? 'స్కోర్‌లను రీసెట్ చేయి' : 'Reset Match Score'}
        </button>

        <button
          onClick={resetGame}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'te' ? 'కొత్త రౌండ్ ప్రారంభించు' : 'New Round'}</span>
        </button>
      </div>
    </div>
  );
};
