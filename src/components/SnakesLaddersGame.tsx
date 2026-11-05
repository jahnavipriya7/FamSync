import React, { useState } from 'react';
import { 
  SnakePlayer, 
  DEFAULT_LADDERS, 
  DEFAULT_SNAKES, 
  rollDice, 
  calculateNewPosition,
  BoardModifier
} from '../utils/snakesLaddersEngine';
import { MemberProfile, Language } from '../types';
import { getMemberDisplayName, getMemberAvatar } from '../utils/stepRaceStorage';
import { RotateCcw, Play, Trophy, Sparkles, AlertCircle, Bot, Users } from 'lucide-react';

interface SnakesLaddersGameProps {
  currentMember: MemberProfile;
  allMembers: MemberProfile[];
  lang: Language;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SnakesLaddersGame: React.FC<SnakesLaddersGameProps> = ({
  currentMember,
  allMembers,
  lang,
  onShowToast
}) => {
  const [players, setPlayers] = useState<SnakePlayer[]>([
    {
      id: currentMember.id,
      name: currentMember.name,
      avatar: currentMember.avatar,
      position: 1,
      isAi: false
    },
    {
      id: 'player-bot',
      name: 'Vizag AI Bot',
      avatar: '🤖',
      position: 1,
      isAi: true
    }
  ]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [lastDice, setLastDice] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState<SnakePlayer | null>(null);
  const [lastEvent, setLastEvent] = useState<{ message: string; type: 'ladder' | 'snake' | 'move' } | null>(null);
  const [isAiMode, setIsAiMode] = useState(true);

  const activePlayer = players[activePlayerIndex];

  // Configure players
  const handleSwitchOpponent = (memberId: string) => {
    const opp = allMembers.find(m => m.id === memberId);
    if (!opp) return;

    setPlayers([
      {
        id: currentMember.id,
        name: currentMember.name,
        avatar: currentMember.avatar,
        position: 1,
        isAi: false
      },
      {
        id: opp.id,
        name: opp.name,
        avatar: opp.avatar,
        position: 1,
        isAi: false
      }
    ]);
    setIsAiMode(false);
    handleResetGame();
  };

  const handleSetAiOpponent = () => {
    setPlayers([
      {
        id: currentMember.id,
        name: currentMember.name,
        avatar: currentMember.avatar,
        position: 1,
        isAi: false
      },
      {
        id: 'player-bot',
        name: 'Vizag AI Bot',
        avatar: '🤖',
        position: 1,
        isAi: true
      }
    ]);
    setIsAiMode(true);
    handleResetGame();
  };

  const handleRoll = () => {
    if (isRolling || winner) return;

    setIsRolling(true);

    let rollsCount = 0;
    const rollInterval = setInterval(() => {
      setLastDice(rollDice());
      rollsCount++;
      if (rollsCount > 6) {
        clearInterval(rollInterval);
        const rolled = rollDice();
        setLastDice(rolled);
        setIsRolling(false);
        processTurn(rolled);
      }
    }, 60);
  };

  const processTurn = (dice: number) => {
    const p = players[activePlayerIndex];
    const { finalPos, modifier, won } = calculateNewPosition(p.position, dice);

    let eventMsg = `${p.name} rolled a ${dice} and moved from ${p.position} to ${finalPos}`;
    let eventType: 'ladder' | 'snake' | 'move' = 'move';

    if (modifier) {
      if (modifier.type === 'ladder') {
        eventType = 'ladder';
        eventMsg = `🪜 Ladder Boost! ${p.name} ${modifier.label} and climbed to ${finalPos}!`;
        onShowToast(`🪜 Climbed ladder to square ${finalPos}!`, 'success');
      } else {
        eventType = 'snake';
        eventMsg = `🐍 Snake Bite! ${p.name} ${modifier.label} and slid down to ${finalPos}!`;
        onShowToast(`🐍 Slid down to square ${finalPos}!`, 'info');
      }
    }

    setLastEvent({ message: eventMsg, type: eventType });

    const updatedPlayers = players.map((pl, idx) => {
      if (idx === activePlayerIndex) {
        return { ...pl, position: finalPos };
      }
      return pl;
    });

    setPlayers(updatedPlayers);

    if (won) {
      setWinner(p);
      onShowToast(`🏆 Victory! ${p.name} reached square 100 first!`, 'success');
      return;
    }

    // Next turn
    const nextIdx = (activePlayerIndex + 1) % players.length;
    setActivePlayerIndex(nextIdx);

    // If next player is AI, trigger auto-roll
    if (updatedPlayers[nextIdx].isAi) {
      setTimeout(() => {
        autoRollAi(nextIdx, updatedPlayers);
      }, 900);
    }
  };

  const autoRollAi = (aiIdx: number, currentPlayers: SnakePlayer[]) => {
    if (winner) return;
    setIsRolling(true);

    setTimeout(() => {
      const rolled = rollDice();
      setLastDice(rolled);
      setIsRolling(false);

      const aiPlayer = currentPlayers[aiIdx];
      const { finalPos, modifier, won } = calculateNewPosition(aiPlayer.position, rolled);

      let eventMsg = `🤖 AI Bot rolled a ${rolled} and moved to ${finalPos}`;
      let eventType: 'ladder' | 'snake' | 'move' = 'move';

      if (modifier) {
        if (modifier.type === 'ladder') {
          eventType = 'ladder';
          eventMsg = `🪜 AI Bot climbed ladder to ${finalPos}!`;
        } else {
          eventType = 'snake';
          eventMsg = `🐍 AI Bot slid down snake to ${finalPos}!`;
        }
      }

      setLastEvent({ message: eventMsg, type: eventType });

      const updated = currentPlayers.map((pl, idx) => (idx === aiIdx ? { ...pl, position: finalPos } : pl));
      setPlayers(updated);

      if (won) {
        setWinner(aiPlayer);
        onShowToast(`🤖 AI Bot won the race! Try again!`, 'info');
        return;
      }

      setActivePlayerIndex(0);
    }, 700);
  };

  const handleResetGame = () => {
    setPlayers(prev => prev.map(p => ({ ...p, position: 1 })));
    setActivePlayerIndex(0);
    setLastDice(null);
    setWinner(null);
    setLastEvent(null);
    setIsRolling(false);
  };

  // 100-cell Board grid construction
  // Row 0 is 100..91, Row 1 is 81..90, Row 2 is 80..71, etc.
  const rows: number[][] = [];
  for (let r = 0; r < 10; r++) {
    const rowNumbers: number[] = [];
    const isEvenFromTop = r % 2 === 0;
    const startNum = 100 - r * 10;
    for (let c = 0; c < 10; c++) {
      if (isEvenFromTop) {
        rowNumbers.push(startNum - c);
      } else {
        rowNumbers.push(startNum - 9 + c);
      }
    }
    rows.push(rowNumbers);
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>🪜 Snakes & Ladders: Family Virtue Climb 🐍</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {lang === 'te'
              ? 'మంచి పనులు నిచ్చెనలను ఎక్కిస్తాయి; అలసత్వం పాముల ద్వారా జారదీస్తుంది!'
              : 'Climb ladders with positive household habits; avoid domestic snakes on the race to 100!'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSetAiOpponent}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              isAiMode ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Vs AI Bot</span>
          </button>

          <select
            value={!isAiMode ? players[1]?.id : ''}
            onChange={e => handleSwitchOpponent(e.target.value)}
            className="text-xs font-bold border border-slate-300 rounded-xl px-2.5 py-1.5 bg-white text-slate-800"
          >
            <option value="" disabled={!isAiMode}>
              {lang === 'te' ? 'కుటుంబ సభ్యుడితో ఆడు' : 'Vs Family Member...'}
            </option>
            {allMembers.filter(m => m.id !== currentMember.id).map(m => (
              <option key={m.id} value={m.id}>
                {m.avatar} {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Players Progress Bar */}
      <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        {players.map((p, idx) => {
          const isTurn = activePlayerIndex === idx && !winner;
          return (
            <div
              key={p.id}
              className={`p-3 rounded-xl transition-all ${
                isTurn ? 'bg-white border-2 border-brand-400 shadow-sm' : 'bg-white/60 border border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{p.avatar}</span>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 truncate max-w-[120px]">
                      {p.name}
                    </div>
                    {isTurn && (
                      <span className="text-[10px] font-black text-brand-600 animate-pulse">
                        Rolling Turn 🎲
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-black text-slate-900">
                    Square {p.position}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-bold">/ 100</span>
                </div>
              </div>

              {/* Position Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${p.position}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dice Roller & Event Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md">
        <div className="flex items-center gap-4">
          {/* Animated 3D/SVG Dice */}
          <div className="w-16 h-16 rounded-2xl bg-white text-slate-900 flex items-center justify-center font-mono text-3xl font-black shadow-lg border-2 border-amber-300 select-none">
            {isRolling ? (
              <span className="animate-spin text-2xl">🎲</span>
            ) : lastDice !== null ? (
              lastDice
            ) : (
              '?'
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-amber-300 block uppercase tracking-wider">
              {winner ? 'Game Completed' : `${activePlayer.name}'s Turn`}
            </span>
            <div className="text-xs sm:text-sm font-semibold text-slate-200 max-w-md">
              {lastEvent ? lastEvent.message : 'Roll the dice to advance on the board!'}
            </div>
          </div>
        </div>

        <button
          onClick={handleRoll}
          disabled={isRolling || Boolean(winner) || activePlayer.isAi}
          className="px-7 py-3 rounded-xl bg-growth-500 hover:bg-growth-600 disabled:bg-slate-700 text-slate-950 font-black text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>{isRolling ? 'Rolling...' : 'Roll Dice (1-6)'}</span>
        </button>
      </div>

      {/* 100-Cell Board Visualizer */}
      <div className="flex flex-col items-center select-none py-1 overflow-x-auto">
        <div className="border-4 border-slate-800 rounded-2xl overflow-hidden shadow-xl bg-slate-900 min-w-[320px] max-w-full">
          {rows.map((rowArr, rIdx) => (
            <div key={rIdx} className="flex">
              {rowArr.map(num => {
                const isLadderStart = DEFAULT_LADDERS.find(l => l.from === num);
                const isLadderEnd = DEFAULT_LADDERS.find(l => l.to === num);
                const isSnakeStart = DEFAULT_SNAKES.find(s => s.from === num);
                const isSnakeEnd = DEFAULT_SNAKES.find(s => s.to === num);

                const playersHere = players.filter(p => p.position === num);
                const isFinal100 = num === 100;

                return (
                  <div
                    key={num}
                    className={`w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 border border-slate-700/60 flex flex-col items-center justify-between p-0.5 sm:p-1 relative transition-colors ${
                      isFinal100
                        ? 'bg-amber-400 text-slate-900'
                        : isLadderStart
                        ? 'bg-emerald-800/80 text-emerald-100'
                        : isSnakeStart
                        ? 'bg-rose-900/80 text-rose-100'
                        : (num % 2 === 0)
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-850 text-slate-400'
                    }`}
                  >
                    <span className="text-[8px] sm:text-[10px] font-mono font-black opacity-80 self-start">
                      {num}
                    </span>

                    {/* Icons for special tiles */}
                    {isLadderStart && (
                      <span className="text-[10px] sm:text-xs text-emerald-300 font-bold" title={`Ladder to ${isLadderStart.to}`}>
                        🪜➔{isLadderStart.to}
                      </span>
                    )}
                    {isSnakeStart && (
                      <span className="text-[10px] sm:text-xs text-rose-400 font-bold" title={`Snake to ${isSnakeStart.to}`}>
                        🐍➔{isSnakeStart.to}
                      </span>
                    )}
                    {isFinal100 && (
                      <span className="text-xs sm:text-sm">👑</span>
                    )}

                    {/* Player tokens on this square */}
                    {playersHere.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center gap-0.5 pointer-events-none bg-black/20 rounded">
                        {playersHere.map(p => (
                          <span key={p.id} className="text-sm sm:text-lg animate-bounce drop-shadow" title={p.name}>
                            {p.avatar}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Reset & Legend */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <span className="text-base">🪜</span> Ladder: Positive Habit Climb
          </span>
          <span className="flex items-center gap-1">
            <span className="text-base">🐍</span> Snake: Household Mistake Slide
          </span>
        </div>

        <button
          onClick={handleResetGame}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Race</span>
        </button>
      </div>
    </div>
  );
};
