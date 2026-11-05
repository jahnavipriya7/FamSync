import React, { useState, useEffect } from 'react';
import { ChildProfile, EarnRequest, Language, ScreenCategory, FamilyGameChallenge } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { WEEKEND_QUIZ_QUESTIONS } from '../data/sampleData';
import { getTodayGameChallenge } from '../utils/localGame';
import { fetchDailyFamilyGame } from '../services/api';
import { 
  Clock, 
  Play, 
  Square, 
  AlertTriangle, 
  Lock, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  Gamepad2, 
  Video, 
  MessageSquare, 
  Award,
  Send,
  RotateCcw,
  Check,
  Dices,
  Trophy,
  Users,
  Flame,
  RefreshCw
} from 'lucide-react';

// Digital Dice Face Renderer
const DiceDots: React.FC<{ value: number; isRolling: boolean }> = ({ value, isRolling }) => {
  const dotPositions: Record<number, number[][]> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
  };

  const dots = dotPositions[value] || dotPositions[1];

  return (
    <div
      className={`w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl border-2 border-slate-300 shadow-md flex items-center justify-center transition-all select-none ${
        isRolling ? 'animate-spin scale-110' : 'hover:scale-105'
      }`}
    >
      <svg className="w-full h-full p-2" viewBox="0 0 100 100">
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="9" fill="#0f172a" />
        ))}
      </svg>
    </div>
  );
};

interface ChildViewProps {
  currentChild: ChildProfile;
  onUpdateScreenTime: (childId: string, usedDelta: number, category: ScreenCategory) => void;
  onSubmitEarnRequest: (req: EarnRequest) => void;
  lang: Language;
}

export const ChildView: React.FC<ChildViewProps> = ({
  currentChild,
  onUpdateScreenTime,
  onSubmitEarnRequest,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  // Timer State
  const [activeCategory, setActiveCategory] = useState<ScreenCategory>('study');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [readingTimerActive, setReadingTimerActive] = useState(false);
  const [readingSecondsLeft, setReadingSecondsLeft] = useState(10 * 60);

  // Elder skill request input
  const [elderSkillNote, setElderSkillNote] = useState('');
  const [showElderModal, setShowElderModal] = useState(false);

  // Household chore request input
  const [choreTitle, setChoreTitle] = useState('Fold clean school uniforms');
  const [showChoreModal, setShowChoreModal] = useState(false);

  // Weekend Challenge Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [choreCompleted, setChoreCompleted] = useState(false);

  // Daily Family Board Game State
  const [dailyGame, setDailyGame] = useState<FamilyGameChallenge>(() => getTodayGameChallenge());
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [activeChallengeMode, setActiveChallengeMode] = useState<'boardGame' | 'quiz'>('boardGame');

  // Interactive Digital Dice Roller State
  const [diceNumber, setDiceNumber] = useState(6);
  const [isRollingDice, setIsRollingDice] = useState(false);

  // Match Outcome & Chore State
  const [matchWinner, setMatchWinner] = useState(currentChild.name);
  const [matchLoser, setMatchLoser] = useState(currentChild.name === 'Chinni' ? 'Anna (16)' : 'Chinni (10)');
  const [isMatchSaved, setIsMatchSaved] = useState(false);
  const [gameChoreCompleted, setGameChoreCompleted] = useState(false);

  // Calculated values
  const totalAllowed = currentChild.dailyLimitMin + currentChild.bonusEarnedTodayMin;
  const remaining = Math.max(0, totalAllowed - currentChild.usedTodayMin);
  const isCapReached = currentChild.bonusEarnedTodayMin >= 30;

  // Active Screen Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && remaining > 0) {
      interval = setInterval(() => {
        onUpdateScreenTime(currentChild.id, 1, activeCategory);
      }, 60000); // 1 minute ticks in real life, or 10s for simulation
    } else if (remaining <= 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, remaining, activeCategory, currentChild.id]);

  // Reading Timer (10 minutes)
  useEffect(() => {
    let interval: any = null;
    if (readingTimerActive) {
      interval = setInterval(() => {
        setReadingSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setReadingTimerActive(false);
            submitReadingEarnRequest();
            return 10 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [readingTimerActive]);

  const submitReadingEarnRequest = () => {
    const req: EarnRequest = {
      id: `req-${Date.now()}`,
      childId: currentChild.id,
      childName: currentChild.name,
      type: 'reading',
      title: 'Read textbook/storybook for 10 minutes',
      requestedMin: 10,
      note: 'Completed full 10-minute focus reading timer.',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    onSubmitEarnRequest(req);
  };

  const handleQuickReadingComplete = () => {
    setReadingTimerActive(false);
    setReadingSecondsLeft(10 * 60);
    submitReadingEarnRequest();
  };

  const submitElderSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderSkillNote.trim()) return;

    const req: EarnRequest = {
      id: `req-${Date.now()}`,
      childId: currentChild.id,
      childName: currentChild.name,
      type: 'elder_skill',
      title: 'Learned practical skill from elder',
      requestedMin: 15,
      note: elderSkillNote.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onSubmitEarnRequest(req);
    setElderSkillNote('');
    setShowElderModal(false);
  };

  const submitChoreHelp = () => {
    const req: EarnRequest = {
      id: `req-${Date.now()}`,
      childId: currentChild.id,
      childName: currentChild.name,
      type: 'chore',
      title: choreTitle,
      requestedMin: 10,
      note: 'Helped at home without arguing.',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onSubmitEarnRequest(req);
    setShowChoreModal(false);
  };

  // Check Schedule Locks
  // In our app, we simulate or check if current local time is in tuition hours (5-7 PM)
  const currentHour = new Date().getHours();
  const isTuitionHour = currentHour >= 17 && currentHour < 19;
  const isBedtimeHour = currentHour >= 22 || currentHour < 6;

  // Entertainment lock logic
  const isEntertainmentLocked = isTuitionHour && activeCategory !== 'study';

  // Quiz submission
  const handleAnswerQuestion = () => {
    if (selectedOption === null) return;
    if (selectedOption === WEEKEND_QUIZ_QUESTIONS[quizIndex].answer_index) {
      setQuizScore(prev => prev + 1);
    }
    if (quizIndex + 1 < WEEKEND_QUIZ_QUESTIONS.length) {
      setQuizIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  // Dice Roller Handler
  const handleRollDice = () => {
    if (isRollingDice) return;
    setIsRollingDice(true);
    let counter = 0;
    const rollInterval = setInterval(() => {
      setDiceNumber(Math.floor(Math.random() * 6) + 1);
      counter++;
      if (counter > 8) {
        clearInterval(rollInterval);
        const finalVal = Math.floor(Math.random() * 6) + 1;
        setDiceNumber(finalVal);
        setIsRollingDice(false);
      }
    }, 60);
  };

  // AI Game Generation Handler
  const handleGenerateAiGame = async () => {
    setIsLoadingGame(true);
    try {
      const newGame = await fetchDailyFamilyGame(currentChild.name);
      setDailyGame(newGame);
      setIsMatchSaved(false);
      setGameChoreCompleted(false);
    } catch (e) {
      console.error('Error generating game:', e);
    } finally {
      setIsLoadingGame(false);
    }
  };

  // Save Match Outcome & Award Points / Chores
  const handleSaveMatch = () => {
    setIsMatchSaved(true);
    if (matchWinner === currentChild.name) {
      const winReq: EarnRequest = {
        id: `req-win-${Date.now()}`,
        childId: currentChild.id,
        childName: currentChild.name,
        type: 'elder_skill',
        title: `Won ${dailyGame.title} (+15m Bonus)`,
        requestedMin: 15,
        note: `Played ${dailyGame.gameType} Family Challenge with family! Winner of the duel.`,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      onSubmitEarnRequest(winReq);
    }
  };

  // Mark Loser Chore Completed
  const handleMarkGameChoreDone = () => {
    setGameChoreCompleted(true);
    if (matchLoser.includes(currentChild.name)) {
      const choreReq: EarnRequest = {
        id: `req-chore-${Date.now()}`,
        childId: currentChild.id,
        childName: currentChild.name,
        type: 'chore',
        title: dailyGame.loserChore,
        requestedMin: 10,
        note: `Completed assigned family challenge chore honestly.`,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      onSubmitEarnRequest(choreReq);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 space-y-8 animate-in fade-in duration-150">
      {/* 1. Header with Active Child Card */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{currentChild.avatar}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentChild.name}'s Screen Agreement
            </h1>
            <span className="text-xs text-slate-500 font-semibold">
              Age {currentChild.age} • Streak: 🔥 {currentChild.streakDays} days
            </span>
          </div>
        </div>
      </div>

      {/* 2. Gentle 5-Minute Warning Banner */}
      {remaining > 0 && remaining <= 5 && (
        <div className="p-4 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 text-sm font-bold flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
          <span>{t.warning5Min}</span>
        </div>
      )}

      {/* 3. Tuition Lock Screen or Bedtime Lock Screen */}
      {isEntertainmentLocked ? (
        <div className="bg-white rounded-3xl border border-indigo-200 p-8 text-center space-y-3 shadow-xs">
          <span className="text-4xl block">📚</span>
          <h2 className="text-xl font-black text-slate-900">{t.lockTuitionScreen}</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {t.lockTuitionDesc}
          </p>
          <button
            onClick={() => setActiveCategory('study')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            Switch to Study Mode
          </button>
        </div>
      ) : isBedtimeHour ? (
        <div className="bg-slate-900 text-white rounded-3xl p-8 text-center space-y-3 shadow-xl">
          <span className="text-4xl block">🌙</span>
          <h2 className="text-xl font-black text-white">{t.lockBedtimeScreen}</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            {t.lockBedtimeDesc}
          </p>
        </div>
      ) : remaining <= 0 ? (
        <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-3 shadow-xs">
          <span className="text-4xl block">⌛</span>
          <h2 className="text-xl font-black text-slate-900">{t.lockLimitScreen}</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {t.lockLimitDesc}
          </p>
        </div>
      ) : (
        /* Active Screen Time Timer Card */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-center">
          {/* Big Circular Progress Ring */}
          <div className="relative w-48 h-48 mx-auto flex flex-col items-center justify-center rounded-full border-8 border-slate-100 bg-slate-50/60 shadow-inner">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {remaining}
            </span>
            <span className="text-xs font-black uppercase text-slate-400 mt-1">
              min left
            </span>
          </div>

          {/* Quick summary below ring */}
          <div className="flex justify-center gap-6 text-xs sm:text-sm font-semibold text-slate-600">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase">Daily Allowance</span>
              <strong className="text-slate-900">{totalAllowed}m</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase">Used Today</span>
              <strong className="text-slate-900">{currentChild.usedTodayMin}m</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase">Bonus Earned</span>
              <strong className="text-growth-700">+{currentChild.bonusEarnedTodayMin}m</strong>
            </div>
          </div>

          {/* Category Picker */}
          <div className="space-y-2 pt-2 text-left">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 text-center">
              {t.pickCategoryPrompt}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'study', label: t.catStudy, icon: <GraduationCap className="w-4 h-4" /> },
                { id: 'games', label: t.catGames, icon: <Gamepad2 className="w-4 h-4" /> },
                { id: 'videos', label: t.catVideos, icon: <Video className="w-4 h-4" /> },
                { id: 'social', label: t.catSocial, icon: <MessageSquare className="w-4 h-4" /> },
              ].map(cat => (
                <button
                  key={cat.id}
                  disabled={isTimerRunning}
                  onClick={() => setActiveCategory(cat.id as ScreenCategory)}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                    activeCategory === cat.id
                      ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start / Stop Button */}
          <div className="pt-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2.5 mx-auto ${
                isTimerRunning
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/25 active:scale-95'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>{t.stopTimerBtn}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{t.startTimerBtn}</span>
                </>
              )}
            </button>
            {isTimerRunning && (
              <p className="text-xs font-bold text-brand-700 mt-2">{t.timerRunning}</p>
            )}
          </div>
        </div>
      )}

      {/* 4. "EARN MORE TIME" CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-growth-600" />
            <span>{t.earnMoreTitle}</span>
          </h2>
          {isCapReached && (
            <span className="text-xs font-bold text-growth-800 bg-growth-100 px-2.5 py-0.5 rounded-full">
              {t.earnCapReached}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card A: Read for 10 min */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📖</span>
                <span className="text-xs font-black text-growth-800 bg-growth-100 px-2.5 py-0.5 rounded-full">
                  {t.read10Reward}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{t.read10Title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{t.read10Desc}</p>
            </div>

            {readingTimerActive ? (
              <div className="p-3 bg-growth-50 rounded-2xl border border-growth-200 text-center space-y-1">
                <span className="text-xs font-bold text-growth-800">{t.readingRunning}</span>
                <div className="text-xl font-mono font-black text-slate-900">
                  {Math.floor(readingSecondsLeft / 60)}:{(readingSecondsLeft % 60).toString().padStart(2, '0')}
                </div>
                <button
                  onClick={handleQuickReadingComplete}
                  className="text-[11px] font-bold text-brand-700 underline"
                >
                  {t.quickCompleteDemo}
                </button>
              </div>
            ) : (
              <button
                disabled={isCapReached}
                onClick={() => setReadingTimerActive(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-growth-600 hover:bg-growth-700 disabled:bg-slate-200 text-white font-bold text-xs shadow-xs transition-colors"
              >
                {t.startReadingTimer}
              </button>
            )}
          </div>

          {/* Card B: Learn a skill from an elder */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">👵</span>
                <span className="text-xs font-black text-brand-800 bg-brand-100 px-2.5 py-0.5 rounded-full">
                  {t.elderSkillReward}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{t.elderSkillTitle}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{t.elderSkillDesc}</p>
            </div>

            <button
              disabled={isCapReached}
              onClick={() => setShowElderModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Submit Skill (+15m)
            </button>
          </div>

          {/* Card C: Help with household task */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🧹</span>
                <span className="text-xs font-black text-warmth-800 bg-warmth-100 px-2.5 py-0.5 rounded-full">
                  {t.choreHelpReward}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{t.choreHelpTitle}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{t.choreHelpDesc}</p>
            </div>

            <button
              disabled={isCapReached}
              onClick={() => setShowChoreModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-warmth-600 hover:bg-warmth-700 disabled:bg-slate-200 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Submit Help (+10m)
            </button>
          </div>
        </div>
      </div>

      {/* 5. DAILY & WEEKEND FAMILY GAME CHALLENGE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Dices className="w-5 h-5 text-warmth-600" />
              <span>{t.weekendQuizTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.weekendQuizDesc}</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setActiveChallengeMode('boardGame')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeChallengeMode === 'boardGame'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎲 {dailyGame.gameType}
            </button>
            <button
              onClick={() => setActiveChallengeMode('quiz')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeChallengeMode === 'quiz'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ❓ 5-Q Quiz
            </button>
          </div>
        </div>

        {/* Tab 1: Daily Board Game Challenge */}
        {activeChallengeMode === 'boardGame' ? (
          <div className="space-y-6">
            {/* Top Game Bar: Day Badge, Duration & AI Generator Button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-warmth-100 text-warmth-900 border border-warmth-200">
                  {dailyGame.dayLabel}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  ⏱️ {dailyGame.durationMin} min
                </span>
              </div>

              <button
                onClick={handleGenerateAiGame}
                disabled={isLoadingGame}
                className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-200 font-bold text-xs flex items-center gap-2 transition-all shadow-2xs active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-700 ${isLoadingGame ? 'animate-spin' : ''}`} />
                <span>{isLoadingGame ? t.generatingGame : t.generateAiGameBtn}</span>
              </button>
            </div>

            {isLoadingGame ? (
              <div className="p-10 text-center rounded-2xl bg-brand-50/60 border border-brand-200 space-y-3 animate-pulse">
                <div className="text-4xl animate-bounce">🎲</div>
                <h4 className="font-extrabold text-sm text-brand-900">{t.generatingGame}</h4>
                <p className="text-xs text-brand-700">Rotating through Ludo, Chess, Snakes & Ladders, Carrom, and Ashta Chamma...</p>
              </div>
            ) : (
              <>
                {/* Game Title & Suggested Players */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border border-amber-200/80 space-y-3">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl sm:text-5xl shrink-0 p-2 bg-white rounded-2xl shadow-xs border border-amber-100">
                      {dailyGame.icon}
                    </span>
                    <div className="space-y-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                        {dailyGame.gameType} Challenge
                      </span>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                        {dailyGame.title}
                      </h4>
                      <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 pt-1">
                        <Users className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span><strong>{t.suggestedPlayersLabel}:</strong> {dailyGame.suggestedPlayers}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quick Rules */}
                  <div className="pt-2 border-t border-amber-100/80 space-y-1.5">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide block">
                      {t.rulesLabel}:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {dailyGame.quickRules.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-growth-600 font-bold shrink-0">✓</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Fun Twist & Loser Chore Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Fun Twist */}
                    <div className="p-3.5 rounded-xl bg-amber-100/60 border border-amber-300/80 space-y-1">
                      <span className="text-[11px] font-black uppercase text-amber-900 flex items-center gap-1">
                        ✨ {t.twistLabel}
                      </span>
                      <p className="text-xs text-amber-950 font-medium leading-relaxed">
                        {dailyGame.funTwist}
                      </p>
                    </div>

                    {/* Loser Chore */}
                    <div className="p-3.5 rounded-xl bg-warmth-50 border border-warmth-300 space-y-1">
                      <span className="text-[11px] font-black uppercase text-warmth-900 flex items-center gap-1">
                        🧹 {t.choreLabel}
                      </span>
                      <p className="text-xs text-warmth-950 font-medium leading-relaxed">
                        {dailyGame.loserChore}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Digital Dice Roller Component */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <DiceDots value={diceNumber} isRolling={isRollingDice} />
                    <div className="space-y-0.5 text-center sm:text-left">
                      <div className="text-xs font-black uppercase text-slate-500">
                        {isRollingDice ? t.rollingDice : t.diceRollResult}
                      </div>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                        {isRollingDice ? '...' : diceNumber}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Tap below if playing physical Ludo, Snakes & Ladders, or Ashta Chamma!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRollDice}
                    disabled={isRollingDice}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
                  >
                    <span>{isRollingDice ? t.rollingDice : t.rollDiceBtn}</span>
                  </button>
                </div>

                {/* Match Outcome Recording */}
                <div className="p-5 rounded-2xl bg-brand-50/50 border border-brand-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-warmth-600" />
                        <span>{t.recordGameResult}</span>
                      </h5>
                      <p className="text-xs text-slate-500">
                        Record who won today's family match and assign the chore.
                      </p>
                    </div>
                  </div>

                  {!isMatchSaved ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Winner Select */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {t.winnerSelectLabel}
                          </label>
                          <select
                            value={matchWinner}
                            onChange={(e) => setMatchWinner(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="Amma">Amma</option>
                            <option value="Nanna">Nanna</option>
                            <option value="Nani">Nani (Grandmother)</option>
                            <option value="Anna">Anna (16)</option>
                            <option value="Chinni">Chinni (10)</option>
                          </select>
                        </div>

                        {/* Loser Select */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {t.loserSelectLabel}
                          </label>
                          <select
                            value={matchLoser}
                            onChange={(e) => setMatchLoser(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="Anna (16)">Anna (16)</option>
                            <option value="Chinni (10)">Chinni (10)</option>
                            <option value="Amma">Amma</option>
                            <option value="Nanna">Nanna</option>
                            <option value="Nani">Nani (Grandmother)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleSaveMatch}
                        className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        {t.markMatchDoneBtn}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white border border-brand-200 space-y-3">
                      <div className="flex items-center gap-2 text-growth-800 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-growth-600 shrink-0" />
                        <span>{t.gameRecordedToast}</span>
                      </div>
                      <div className="text-xs text-slate-700 space-y-1">
                        <div>
                          🏆 <strong>Winner:</strong> <span className="font-bold text-slate-900">{matchWinner}</span>
                        </div>
                        <div>
                          🧹 <strong>Assigned Chore ({matchLoser}):</strong>{' '}
                          <span className="font-bold text-warmth-900">{dailyGame.loserChore}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {gameChoreCompleted ? (
                          <span className="text-xs font-bold text-growth-700 bg-growth-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {t.choreCompletedToast}
                          </span>
                        ) : (
                          <button
                            onClick={handleMarkGameChoreDone}
                            className="px-4 py-2 rounded-xl bg-warmth-600 hover:bg-warmth-700 text-white text-xs font-bold shadow-xs"
                          >
                            {t.markChoreDoneBtn}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setIsMatchSaved(false);
                            setGameChoreCompleted(false);
                          }}
                          className="text-xs text-slate-500 hover:underline font-semibold"
                        >
                          Play Another Round
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Tab 2: 5-Question Quiz Duel */
          <div className="space-y-4">
            {!quizStarted ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  {t.weekendQuizDesc}
                </p>
                <button
                  onClick={() => {
                    setQuizStarted(true);
                    setQuizIndex(0);
                    setSelectedOption(null);
                    setQuizScore(0);
                    setQuizFinished(false);
                  }}
                  className="px-8 py-3 rounded-2xl bg-warmth-600 hover:bg-warmth-700 text-white font-black text-sm shadow-md transition-colors"
                >
                  {t.startQuizBtn}
                </button>
              </div>
            ) : !quizFinished ? (
              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold text-warmth-700 uppercase">
                  {t.questionLabel} {quizIndex + 1} of {WEEKEND_QUIZ_QUESTIONS.length}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                  {WEEKEND_QUIZ_QUESTIONS[quizIndex].q}
                </h4>

                <div className="space-y-2">
                  {WEEKEND_QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOption(i)}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                        selectedOption === i
                          ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleAnswerQuestion}
                  disabled={selectedOption === null}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 text-white font-bold text-xs"
                >
                  {quizIndex + 1 === WEEKEND_QUIZ_QUESTIONS.length ? t.submitAnswer : t.nextQuestion}
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-warmth-50 border border-warmth-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 text-base">{t.quizOutcomeTitle}</h4>
                <p className="text-xs text-slate-600">
                  Score: <strong>{quizScore} / {WEEKEND_QUIZ_QUESTIONS.length}</strong>.
                </p>
                <div className="p-3 bg-white rounded-xl border border-warmth-200 text-xs text-slate-700 space-y-1">
                  <strong>🧹 {t.lowestScorerNotice}</strong>
                  <p className="text-sm font-bold text-slate-900">"{dailyGame.loserChore}"</p>
                  <p className="text-xs text-slate-500">Wash hands thoroughly after completing the chore.</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {choreCompleted ? (
                    <span className="text-xs font-bold text-growth-700 bg-growth-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {t.choreCompletedToast}
                    </span>
                  ) : (
                    <button
                      onClick={() => setChoreCompleted(true)}
                      className="px-5 py-2 rounded-xl bg-warmth-600 hover:bg-warmth-700 text-white text-xs font-bold"
                    >
                      {t.markChoreDoneBtn}
                    </button>
                  )}
                  <button
                    onClick={() => setQuizStarted(false)}
                    className="text-xs text-slate-500 hover:underline font-semibold"
                  >
                    Close Challenge
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Elder Skill Modal */}
      {showElderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900">{t.elderSkillTitle}</h3>
            <p className="text-xs text-slate-600">
              Submit what you learned from Nani, Nanna, or Amma. They will review and approve +15 minutes.
            </p>

            <form onSubmit={submitElderSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.elderSkillNoteLabel}
                </label>
                <textarea
                  rows={3}
                  value={elderSkillNote}
                  onChange={(e) => setElderSkillNote(e.target.value)}
                  placeholder={t.elderSkillPlaceholder}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowElderModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
                >
                  Send for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chore Help Modal */}
      {showChoreModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900">{t.choreHelpTitle}</h3>
            <p className="text-xs text-slate-600">
              Pick a chore you finished to send for approval (+10 min):
            </p>

            <div className="space-y-2">
              {[
                'Fold clean school uniforms into cupboard',
                'Water balcony tulsi & flowering plants',
                'Arrange dining plates and wipe table',
                'Organize footwear neatly on shoe rack'
              ].map(c => (
                <button
                  key={c}
                  onClick={() => setChoreTitle(c)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition-colors ${
                    choreTitle === c ? 'bg-warmth-50 border-warmth-500 text-warmth-900' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowChoreModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitChoreHelp}
                className="px-5 py-2 text-xs font-bold text-white bg-warmth-600 hover:bg-warmth-700 rounded-xl shadow-xs"
              >
                Send for Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
