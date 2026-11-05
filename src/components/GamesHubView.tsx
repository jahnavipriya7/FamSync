import React, { useState } from 'react';
import { MemberProfile, Language, FamilyGameChallenge } from '../types';
import { getTodayGameChallenge, generateRandomGameChallenge, DAILY_GAMES_ROTATION } from '../utils/localGame';
import { fetchDailyFamilyGame } from '../services/api';
import { ChessGame } from './ChessGame';
import { TicTacToeGame } from './TicTacToeGame';
import { SnakesLaddersGame } from './SnakesLaddersGame';
import { getMemberDisplayName, getMemberAvatar } from '../utils/stepRaceStorage';
import { 
  Gamepad2, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Trophy, 
  Clock, 
  Users, 
  HelpCircle,
  Calendar,
  Gift,
  ShieldCheck
} from 'lucide-react';

interface GamesHubViewProps {
  currentMemberId: string;
  allMembers: MemberProfile[];
  lang: Language;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const GamesHubView: React.FC<GamesHubViewProps> = ({
  currentMemberId,
  allMembers,
  lang,
  onShowToast
}) => {
  const currentMember = allMembers.find(m => m.id === currentMemberId) || allMembers[0];
  const [activeGameTab, setActiveGameTab] = useState<'chess' | 'tictactoe' | 'snakes' | 'ai-challenge' | 'rotation'>('tictactoe');
  const [dailyGame, setDailyGame] = useState<FamilyGameChallenge>(() => getTodayGameChallenge());
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const activeMemberName = getMemberDisplayName(allMembers, currentMember.id, currentMember.name);
  const activeMemberAvatar = getMemberAvatar(allMembers, currentMember.id, currentMember.avatar);

  // AI Game Generator Handler
  const handleGenerateAiGame = async () => {
    setIsGeneratingAi(true);
    try {
      const generated = await fetchDailyFamilyGame(activeMemberName);
      setDailyGame(generated);
      onShowToast(
        lang === 'te' 
          ? `AI గేమ్ రూపొందించబడింది: "${generated.title}"! ✨` 
          : `AI generated new game: "${generated.title}"! ✨`, 
        'success'
      );
    } catch (e) {
      const localGen = generateRandomGameChallenge(activeMemberName);
      setDailyGame(localGen);
      onShowToast(`New random game: "${localGen.title}"!`, 'info');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleLaunchGameFromCard = (gameType: string) => {
    if (gameType === 'Chess') {
      setActiveGameTab('chess');
    } else if (gameType === 'Tic-Tac-Toe') {
      setActiveGameTab('tictactoe');
    } else if (gameType === 'Snakes & Ladders') {
      setActiveGameTab('snakes');
    } else {
      onShowToast(`Rules & twist loaded for ${gameType}! Gather the family!`, 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-6 animate-in fade-in duration-150">
      {/* 1. Hero AI Games Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">🎮</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-400/30">
                {lang === 'te' ? 'కుటుంబ ఆటల వేదిక' : 'FamSync Family Game Arena'}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-white/10 text-slate-200">
                Player: {activeMemberAvatar} {activeMemberName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {lang === 'te' ? 'AI రాండమ్ గేమ్స్ & క్లాసిక్ బోర్డ్ గేమ్స్' : 'AI-Generated Random Games & Classics'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              {lang === 'te'
                ? 'చెస్, టిక్-టాక్-టో, వైకుంఠపాళి (స్నేక్స్ & లాడర్స్) ఆడండి. ప్రతిరోజూ AI ద్వారా సరికొత్త ఆటలు మరియు సరదా ట్విస్టులు రూపొందించబడతాయి!'
                : 'Play interactive Speed Chess, Tic-Tac-Toe, Snakes & Ladders, or generate daily AI twists and chores for the family!'}
            </p>
          </div>

          {/* AI Generator Action Button */}
          <button
            onClick={handleGenerateAiGame}
            disabled={isGeneratingAi}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95 shrink-0 self-start md:self-auto"
          >
            <Sparkles className={`w-4 h-4 text-slate-950 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAi ? 'AI Generating Game...' : (lang === 'te' ? '✨ AI రాండమ్ గేమ్ సృష్టించు' : '✨ AI Generate New Game')}</span>
          </button>
        </div>
      </div>

      {/* 2. Today's AI Challenge Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-2.5 rounded-2xl bg-amber-50 border border-amber-200">
              {dailyGame.icon}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                  {dailyGame.dayLabel}
                </span>
                <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {dailyGame.durationMin} mins
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                {dailyGame.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => handleLaunchGameFromCard(dailyGame.gameType)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-colors self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{lang === 'te' ? 'ఈ ఆట ఆడండి' : `Play ${dailyGame.gameType}`}</span>
          </button>
        </div>

        {/* Suggested Pairings & Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-500" />
              Suggested Players
            </span>
            <p className="font-bold text-slate-800">{dailyGame.suggestedPlayers}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              AI Daily Twist
            </span>
            <p className="font-medium text-amber-950">{dailyGame.funTwist}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1">
            <span className="text-[10px] font-black uppercase text-rose-700 flex items-center gap-1">
              <Gift className="w-3 h-3 text-rose-600" />
              Loser Friendly Chore
            </span>
            <p className="font-medium text-rose-950">{dailyGame.loserChore}</p>
          </div>
        </div>

        {/* Quick Rules */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
          <span className="font-bold text-slate-900 block mb-1">
            {lang === 'te' ? 'ఆట నియమాలు (Quick Rules):' : 'Quick Rules:'}
          </span>
          <ul className="list-disc list-inside space-y-1 font-medium">
            {dailyGame.quickRules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. Interactive Games Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
        <button
          onClick={() => setActiveGameTab('tictactoe')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all shrink-0 ${
            activeGameTab === 'tictactoe'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span className="text-base">⭕❌</span>
          <span>Tic-Tac-Toe Arena</span>
        </button>

        <button
          onClick={() => setActiveGameTab('chess')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all shrink-0 ${
            activeGameTab === 'chess'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span className="text-base">♟️</span>
          <span>Speed Chess (8x8)</span>
        </button>

        <button
          onClick={() => setActiveGameTab('snakes')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all shrink-0 ${
            activeGameTab === 'snakes'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span className="text-base">🪜🐍</span>
          <span>Snakes & Ladders (100)</span>
        </button>

        <button
          onClick={() => setActiveGameTab('rotation')}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all shrink-0 ${
            activeGameTab === 'rotation'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span className="text-base">📅</span>
          <span>7-Day Games Library</span>
        </button>
      </div>

      {/* 4. Active Interactive Game Component */}
      {activeGameTab === 'tictactoe' && (
        <TicTacToeGame
          currentMember={currentMember}
          allMembers={allMembers}
          lang={lang}
          onShowToast={onShowToast}
        />
      )}

      {activeGameTab === 'chess' && (
        <ChessGame
          currentMember={currentMember}
          allMembers={allMembers}
          lang={lang}
          onShowToast={onShowToast}
        />
      )}

      {activeGameTab === 'snakes' && (
        <SnakesLaddersGame
          currentMember={currentMember}
          allMembers={allMembers}
          lang={lang}
          onShowToast={onShowToast}
        />
      )}

      {activeGameTab === 'rotation' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              <span>7-Day Family Game Schedule & Traditions</span>
            </h3>
            <p className="text-xs text-slate-500">
              Middle-class urban family game rotation ensuring non-screen evening bonding.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {DAILY_GAMES_ROTATION.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-extrabold text-sm text-slate-900">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {item.dayLabel}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Players:</strong> {item.suggestedPlayers}</div>
                  <div className="text-amber-800"><strong>Twist:</strong> {item.funTwist}</div>
                  <div className="text-rose-800"><strong>Loser Chore:</strong> {item.loserChore}</div>
                </div>

                <button
                  onClick={() => handleLaunchGameFromCard(item.gameType)}
                  className="w-full mt-2 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Select & Play</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
