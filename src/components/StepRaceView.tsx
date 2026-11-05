import React, { useState, useEffect } from 'react';
import { 
  FamilyGroup, 
  MemberProfile, 
  DailyChallenge, 
  Language, 
  MysteryChallenge 
} from '../types/stepRace';
import { TRANSLATIONS } from '../data/translations';
import { 
  getTimeUntilLocalMidnight, 
  rankMembers, 
  determineDailyWinner,
  checkCounterattackTrigger
} from '../utils/raceEngine';
import { validateStepEntry, applyStepMultipliers } from '../utils/stepTracking';
import { 
  Footprints, 
  Trophy, 
  Clock, 
  Flame, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  Plus, 
  RefreshCw, 
  Users, 
  Gift, 
  CheckCircle2, 
  Share2, 
  Eye, 
  HelpCircle,
  Copy,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { getMemberDisplayName } from '../utils/stepRaceStorage';
import { ProfileEditModal } from './ProfileEditModal';

interface StepRaceViewProps {
  group: FamilyGroup;
  members: MemberProfile[];
  challenge: DailyChallenge;
  mystery: MysteryChallenge;
  currentMemberId: string;
  lang: Language;
  onUpdateChallenge: (updated: DailyChallenge) => void;
  onUpdateMembers: (updated: MemberProfile[]) => void;
  onUpdateGroup: (updated: FamilyGroup) => void;
  onUpdateMystery: (updated: MysteryChallenge) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const StepRaceView: React.FC<StepRaceViewProps> = ({
  group,
  members,
  challenge,
  mystery,
  currentMemberId,
  lang,
  onUpdateChallenge,
  onUpdateMembers,
  onUpdateGroup,
  onUpdateMystery,
  onShowToast
}) => {
  const t = TRANSLATIONS[lang];

  // UI States
  const [handicapMode, setHandicapMode] = useState(group.handicapModeEnabled);
  const [countdown, setCountdown] = useState(getTimeUntilLocalMidnight().formatted);
  const [manualStepsInput, setManualStepsInput] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [walkAndTalkActive, setWalkAndTalkActive] = useState(false);
  const [walkAndTalkPartner, setWalkAndTalkPartner] = useState<string>('member-chinni');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Midnight countdown timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilLocalMidnight().formatted);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate ranks
  const rankedProgress = rankMembers(challenge.membersProgress, handicapMode);
  const currentMember = members.find(m => m.id === currentMemberId) || members[0];
  const winner = members.find(m => m.id === challenge.winnerMemberId);

  // Check if counterattack is currently active for current member
  const now = new Date();
  const isCounterattackActive = Boolean(
    currentMember.counterattackUntil && new Date(currentMember.counterattackUntil) > now
  );

  // Sync steps handler with Anti-Cheat & Multipliers
  const handleSyncSteps = (stepsDelta: number = 850, isManual: boolean = false) => {
    setIsSyncing(true);

    setTimeout(() => {
      setIsSyncing(false);

      // 1. Anti-cheat validation
      const validation = validateStepEntry(
        stepsDelta, 
        challenge.lastSyncTimestamp, 
        isManual
      );

      if (!validation.valid) {
        onShowToast(`⚠️ Anti-Cheat: ${validation.reason}`, 'error');
        return;
      }

      // 2. Apply multipliers (Counterattack 1.5x, Walk-and-talk 1.2x)
      const { effectiveSteps, multiplierDescription } = applyStepMultipliers(
        stepsDelta,
        isCounterattackActive,
        walkAndTalkActive
      );

      // Old ranks for counterattack checking
      const oldRanks: Record<string, number> = {};
      rankedProgress.forEach(r => { oldRanks[r.memberId] = r.rank; });

      // 3. Update member's progress in challenge
      const memberProgress = challenge.membersProgress[currentMemberId] || {
        memberId: currentMemberId,
        steps: 0,
        rawSteps: 0,
        percentage: 0,
        isGoalReached: false,
        rank: 5
      };

      const newSteps = memberProgress.steps + effectiveSteps;
      const targetGoal = handicapMode ? currentMember.personalGoal : group.dailyStepGoal;
      const newPercentage = Math.round((newSteps / targetGoal) * 1000) / 10;
      const reachedNow = newPercentage >= 100 && !memberProgress.isGoalReached;

      const updatedProgress = {
        ...challenge.membersProgress,
        [currentMemberId]: {
          ...memberProgress,
          steps: newSteps,
          rawSteps: memberProgress.rawSteps + stepsDelta,
          percentage: newPercentage,
          reachedGoalAt: reachedNow ? new Date().toISOString() : memberProgress.reachedGoalAt,
          isGoalReached: newPercentage >= 100
        }
      };

      const newChallengeState: DailyChallenge = {
        ...challenge,
        membersProgress: updatedProgress,
        lastSyncTimestamp: new Date().toISOString()
      };

      // 4. Winner determination
      const winnerResult = determineDailyWinner(newChallengeState, handicapMode);
      if (winnerResult.winnerId && !challenge.winnerMemberId) {
        newChallengeState.winnerMemberId = winnerResult.winnerId;
        newChallengeState.winnerReachedAt = winnerResult.winnerReachedAt;
        const wonMember = members.find(m => m.id === winnerResult.winnerId);
        onShowToast(`🎉 Champion! ${wonMember?.name || 'Someone'} reached the goal first today!`, 'success');
      }

      onUpdateChallenge(newChallengeState);

      // 5. Check if anyone was overtaken to trigger Steal the Lead Counterattack
      const newRanksList = rankMembers(updatedProgress, handicapMode);
      const newRanks: Record<string, number> = {};
      newRanksList.forEach(r => { newRanks[r.memberId] = r.rank; });

      const updatedMembers = members.map(m => {
        if (m.id !== currentMemberId) {
          const trigger = checkCounterattackTrigger(oldRanks, newRanks, m);
          if (trigger.triggered) {
            onShowToast(`⚡ Counterattack! ${m.name} was passed & gets 1.5x steps for 1 hour!`, 'info');
            return {
              ...m,
              counterattackUntil: trigger.counterattackUntil,
              counterattackUsedToday: true
            };
          }
        }
        return m;
      });
      onUpdateMembers(updatedMembers);

      const boostMsg = multiplierDescription ? ` (${multiplierDescription})` : '';
      onShowToast(`Synced +${effectiveSteps} steps!${boostMsg}`, 'success');
    }, 400);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(manualStepsInput, 10);
    if (isNaN(count) || count <= 0) return;
    handleSyncSteps(count, true);
    setManualStepsInput('');
    setShowManualModal(false);
  };

  // Copy invite code
  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(group.inviteCode);
    onShowToast(`Invite code ${group.inviteCode} copied to clipboard!`, 'info');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Card with Invite Code & Midnight Countdown */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">🏃‍♂️</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {group.name}
              </span>
              <button
                onClick={handleCopyInvite}
                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
                title="Copy Invite Code"
              >
                <span>Code: {group.inviteCode}</span>
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1 rounded-full border border-amber-400/30 transition-colors shadow-2xs"
                title="Edit Names & Family Group"
              >
                <span>⚙️ {lang === 'te' ? 'పేర్లు & గ్రూప్ సెట్టింగ్‌లు' : 'Edit Names & Group'}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t.stepRaceTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              {t.stepRaceSubtitle}
            </p>
          </div>

          {/* Midnight Reset Clock & Daily Goal */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0 backdrop-blur-xs">
            <div className="text-center sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-center sm:justify-end gap-1">
                <Clock className="w-3 h-3 text-brand-400" />
                {t.midnightReset}
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-amber-300">
                {countdown}
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {t.dailyGoalLabel}
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-growth-400">
                {group.dailyStepGoal.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Real-World Family Reward Banner */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-amber-200">
            <Gift className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>{t.customRewardLabel}:</strong> {group.customReward}
            </span>
          </div>
          {winner && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-400 text-slate-900 font-extrabold text-xs shadow-md animate-bounce">
              <Trophy className="w-4 h-4" />
              <span>Today's Winner: {getMemberDisplayName(members, winner.id, winner.name)}! 👑</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Active Multiplier / Counterattack Alert (if active) */}
      {isCounterattackActive && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500 text-amber-950 flex items-center justify-between gap-3 shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900">{t.counterattackActive}</h4>
              <p className="text-xs text-amber-800">
                You were passed on the leaderboard! All steps synced for the next hour gain a 1.5x multiplier.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Leaderboard Controls (Raw Steps vs Handicap Mode) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Live Race Leaderboard</span>
            </h2>
            <p className="text-xs text-slate-500">
              Rankings update live as steps are synced. Ties are broken by the earliest finish time.
            </p>
          </div>

          {/* Handicap Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setHandicapMode(false)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                !handicapMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.rawStepsTab}
            </button>
            <button
              onClick={() => setHandicapMode(true)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                handicapMode ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
              <span>{t.handicapTab}</span>
            </button>
          </div>
        </div>

        {handicapMode && (
          <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
            <span>{t.handicapNotice}</span>
          </div>
        )}

        {/* Leaderboard Cards */}
        <div className="space-y-3">
          {rankedProgress.map((prog) => {
            const member = members.find(m => m.id === prog.memberId);
            if (!member) return null;

            const isCurrent = member.id === currentMemberId;
            const isWinner = challenge.winnerMemberId === member.id;
            const targetGoal = handicapMode ? member.personalGoal : group.dailyStepGoal;
            const percentClamped = Math.min(100, prog.percentage);

            return (
              <div
                key={member.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isWinner
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400 shadow-sm'
                    : isCurrent
                    ? 'bg-brand-50/40 border-brand-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-black text-sm text-slate-400">
                      #{prog.rank}
                    </span>
                    <span className="text-2xl sm:text-3xl">{member.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900">
                          {member.name} {member.nickname ? <span className="text-slate-500 text-xs font-semibold">({member.nickname})</span> : null}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                            You
                          </span>
                        )}
                        {isWinner && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 flex items-center gap-0.5 shadow-2xs">
                            👑 Champion
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        Goal: {targetGoal.toLocaleString()} steps {handicapMode && `(${member.handicapMultiplier}x)`}
                        {prog.reachedGoalAt && (
                          <span className="text-growth-700 font-bold ml-1.5">
                            • Reached at {new Date(prog.reachedGoalAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base sm:text-xl font-black text-slate-900 font-mono">
                      {prog.steps.toLocaleString()}
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {prog.percentage}%
                    </span>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isWinner
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : percentClamped >= 100
                        ? 'bg-growth-500'
                        : 'bg-gradient-to-r from-brand-500 to-indigo-600'
                    }`}
                    style={{ width: `${percentClamped}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sync & Manual Entry Action Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSyncSteps(1200, false)}
              disabled={isSyncing}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white font-extrabold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : t.syncStepsBtn} (+1,200)</span>
            </button>

            <button
              onClick={() => setShowManualModal(true)}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addStepsBtn}</span>
            </button>
          </div>

          {/* Quick Counterattack / Walk & Talk triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWalkAndTalkActive(!walkAndTalkActive)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                walkAndTalkActive
                  ? 'bg-growth-100 border-growth-300 text-growth-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>🤝 Walk & Talk (1.2x)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mystery Challenge of the Morning */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-amber-50 rounded-2xl border border-amber-200">
              {mystery.icon}
            </span>
            <div>
              <span className="text-[11px] font-black uppercase text-amber-700 tracking-wider">
                {t.mysteryChallengeTitle}
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {mystery.title}
              </h3>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900">
            +{mystery.bonusPoints} Tournament Pts
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {mystery.description}
        </p>
      </div>

      {/* Manual Steps Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900">Log Manual Steps</h3>
            <p className="text-xs text-slate-600">
              Phone pedometer offline? Enter steps walked manually (capped at 5,000 steps per log):
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Steps Count
                </label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  step="50"
                  value={manualStepsInput}
                  onChange={(e) => setManualStepsInput(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
                >
                  Save Steps
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Profile & Family Group Settings Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentMemberId={currentMemberId}
        members={members}
        group={group}
        lang={lang}
        onSaveMember={(updated) => {
          const updatedList = members.map(m => m.id === updated.id ? updated : m);
          onUpdateMembers(updatedList);
        }}
        onSaveAllMembers={(updatedList) => {
          onUpdateMembers(updatedList);
        }}
        onSaveGroup={(updatedGroup) => {
          onUpdateGroup(updatedGroup);
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
