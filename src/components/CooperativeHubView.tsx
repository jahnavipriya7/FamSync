import React, { useState } from 'react';
import { 
  QuestRoute, 
  RelayChallenge, 
  BossMonster, 
  MemberProfile, 
  Language 
} from '../types/stepRace';
import { TRANSLATIONS } from '../data/translations';
import { updateRelayProgress, applyBossDamage } from '../utils/raceEngine';
import { 
  Compass, 
  Flag, 
  Zap, 
  Shield, 
  Trophy, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Flame,
  Swords,
  Plus
} from 'lucide-react';
import { getMemberDisplayName } from '../utils/stepRaceStorage';
import { RouteEditorModal } from './RouteEditorModal';

interface CooperativeHubViewProps {
  quest: QuestRoute;
  routesLibrary: QuestRoute[];
  relay: RelayChallenge;
  boss: BossMonster;
  members: MemberProfile[];
  currentMemberId: string;
  lang: Language;
  onUpdateQuest: (updated: QuestRoute) => void;
  onSelectActiveRoute: (routeId: string) => void;
  onSaveRoute: (updatedRoute: QuestRoute) => void;
  onDeleteRoute: (routeId: string) => void;
  onUpdateRelay: (updated: RelayChallenge) => void;
  onUpdateBoss: (updated: BossMonster) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const CooperativeHubView: React.FC<CooperativeHubViewProps> = ({
  quest,
  routesLibrary,
  relay,
  boss,
  members,
  currentMemberId,
  lang,
  onUpdateQuest,
  onSelectActiveRoute,
  onSaveRoute,
  onDeleteRoute,
  onUpdateRelay,
  onUpdateBoss,
  onShowToast
}) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'quest' | 'relay' | 'boss'>('quest');
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);

  const currentMember = members.find(m => m.id === currentMemberId) || members[0];

  // 1. Family Quest Step Addition
  const handleAddQuestSteps = (steps: number = 2500) => {
    const newSteps = quest.currentSteps + steps;
    const completed = newSteps >= quest.totalStepsRequired;

    // Check newly unlocked landmarks
    const updatedLandmarks = quest.landmarks.map(lm => {
      const unlocked = newSteps >= lm.stepsRequired;
      if (unlocked && !lm.unlocked) {
        onShowToast(`🚩 Landmark Unlocked: ${lm.title}! ${lm.funFact}`, 'success');
      }
      return { ...lm, unlocked };
    });

    const newContrib = {
      ...quest.memberContributions,
      [currentMemberId]: (quest.memberContributions[currentMemberId] || 0) + steps
    };

    const updatedQuest: QuestRoute = {
      ...quest,
      currentSteps: newSteps,
      completed,
      landmarks: updatedLandmarks,
      memberContributions: newContrib
    };

    onUpdateQuest(updatedQuest);
    onShowToast(`Contributed +${steps.toLocaleString()} steps towards ${quest.title}!`, 'success');
  };

  // 2. Relay Step Progress
  const handleAddRelaySteps = (steps: number = 1000) => {
    const updated = updateRelayProgress(relay, currentMemberId, steps);
    onUpdateRelay(updated);

    if (updated.teamCompleted && !relay.teamCompleted) {
      onShowToast(`🏆 Relay Completed! The family finished all legs before midnight!`, 'success');
    } else {
      onShowToast(`Relay leg advanced by +${steps} steps!`, 'success');
    }
  };

  // 3. Boss Battle Attack
  const handleAttackBoss = (steps: number = 1800) => {
    const { boss: updatedBoss, damageDealt } = applyBossDamage(
      boss, 
      currentMember.id, 
      currentMember.name, 
      steps
    );

    onUpdateBoss(updatedBoss);
    if (updatedBoss.defeated && !boss.defeated) {
      onShowToast(`⚔️ VICTORY! The family defeated ${boss.name}! '${boss.badgeName}' unlocked! 🏆`, 'success');
    } else {
      onShowToast(`💥 Dealt ${damageDealt.toLocaleString()} step damage to ${boss.name}!`, 'info');
    }
  };

  const questDistanceKm = Math.round((quest.currentSteps * 0.75) / 1000);
  const questPercent = Math.min(100, Math.round((quest.currentSteps / quest.totalStepsRequired) * 100));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-6 animate-in fade-in duration-150">
      {/* Header with 3 Cooperative Modes Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
              <Compass className="w-6 h-6 text-brand-600" />
              <span>Cooperative Family Modes</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Combine your family steps to accomplish shared virtual journeys, relays, and boss battles!
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('quest')}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeTab === 'quest' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-brand-600" />
              <span>Family Quest</span>
            </button>
            <button
              onClick={() => setActiveTab('relay')}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeTab === 'relay' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flag className="w-3.5 h-3.5 text-warmth-600" />
              <span>Relay Challenge</span>
            </button>
            <button
              onClick={() => setActiveTab('boss')}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeTab === 'boss' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-rose-600" />
              <span>Boss Battle</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: FAMILY QUEST (Hyderabad to Delhi ~1,500 km) */}
      {activeTab === 'quest' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase text-brand-300 tracking-wider">
                    Virtual Walking Route
                  </span>
                  <button
                    onClick={() => setIsRouteModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/20 transition-colors shadow-2xs"
                    title="Change route or customize landmarks"
                  >
                    <span>🗺️ {lang === 'te' ? 'రూట్ లైబ్రరీ & ఎడిటర్' : 'Route Library & Editor'}</span>
                  </button>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {quest.title}
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{quest.startLocation}</span>
                  <ArrowRight className="w-3 h-3 text-white/50" />
                  <Flag className="w-3.5 h-3.5 text-growth-400 shrink-0" />
                  <span>{quest.endLocation}</span>
                </div>
                <p className="text-xs text-slate-300 max-w-lg mt-1">
                  {quest.description}
                </p>
              </div>

              <div className="text-right bg-white/10 p-4 rounded-2xl border border-white/10 shrink-0">
                <span className="text-xs text-slate-400 block uppercase font-bold">Progress</span>
                <div className="text-2xl font-mono font-black text-amber-300">
                  {questDistanceKm} / {quest.totalDistanceKm} km
                </div>
                <span className="text-xs font-bold text-growth-400">
                  {questPercent}% Complete
                </span>
              </div>
            </div>

            {/* Route Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/20">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-brand-400 to-growth-400 transition-all duration-500 rounded-full"
                  style={{ width: `${questPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-300 font-semibold overflow-x-auto gap-2 py-1">
                {quest.landmarks.map(lm => (
                  <span key={lm.id} className="whitespace-nowrap shrink-0 flex items-center gap-1">
                    <span>{lm.badgeIcon}</span>
                    <span>{lm.title.split(',')[0]}</span>
                    <span className="text-slate-400">({lm.distanceKm} km)</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Action to contribute steps */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <span className="text-xs text-slate-300 font-medium">
                Active Member: <strong>{currentMember.name}</strong>
              </span>
              <button
                onClick={() => handleAddQuestSteps(2500)}
                className="px-6 py-2.5 rounded-xl bg-growth-500 hover:bg-growth-600 text-slate-900 font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add 2,500 Steps to Quest</span>
              </button>
            </div>
          </div>

          {/* Landmarks Unlocked */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              <span>Route Milestones & Facts</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {quest.landmarks.map((lm) => (
                <div 
                  key={lm.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    lm.unlocked 
                      ? 'bg-growth-50/60 border-growth-300 text-slate-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{lm.badgeIcon}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      lm.unlocked ? 'bg-growth-200 text-growth-900' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {lm.unlocked ? 'Unlocked ✓' : `${lm.distanceKm} km`}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">{lm.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {lm.funFact}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Member Contribution Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Who Contributed the Most Steps?</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {members.map(m => {
                const steps = quest.memberContributions[m.id] || 0;
                return (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-2xl block mb-1">{m.avatar}</span>
                    <span className="text-xs font-bold text-slate-900 block truncate">{m.name}</span>
                    <span className="text-xs font-mono font-black text-brand-700">
                      {steps.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: RELAY CHALLENGE */}
      {activeTab === 'relay' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Flag className="w-5 h-5 text-warmth-600" />
              <span>Daily Family Baton Relay</span>
            </h2>
            <p className="text-xs text-slate-500">
              Each runner has an assigned target. The next runner unlocks only after the previous one finishes. Finish all legs before midnight!
            </p>
          </div>

          {/* Relay Legs Sequence */}
          <div className="space-y-3">
            {relay.legs.map((leg, idx) => {
              const isCurrent = leg.status === 'running';
              const isDone = leg.status === 'completed';
              const percent = Math.min(100, Math.round((leg.currentSteps / leg.targetSteps) * 100));

              return (
                <div
                  key={leg.legNumber}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCurrent 
                      ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400' 
                      : isDone 
                      ? 'bg-growth-50/50 border-growth-200' 
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                        {leg.legNumber}
                      </span>
                      <div>
                        <span className="font-extrabold text-sm text-slate-900">
                          {getMemberDisplayName(members, leg.runnerMemberId, leg.runnerName)}
                        </span>
                        {isCurrent && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900 animate-pulse">
                            Holding Baton 🏃
                          </span>
                        )}
                        {isDone && (
                          <span className="ml-2 text-xs font-bold text-growth-700">
                            ✓ Finished
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-xs font-mono font-bold">
                      {leg.currentSteps.toLocaleString()} / {leg.targetSteps.toLocaleString()} steps ({percent}%)
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone ? 'bg-growth-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-600">
              Logged in as: <strong>{currentMember.name}</strong>
            </span>
            <button
              onClick={() => handleAddRelaySteps(1000)}
              className="px-6 py-2.5 rounded-xl bg-warmth-600 hover:bg-warmth-700 text-white font-extrabold text-xs shadow-xs"
            >
              Advance My Relay Leg (+1,000 steps)
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: BOSS BATTLE */}
      {activeTab === 'boss' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <span className="text-5xl p-2 bg-white/10 rounded-2xl border border-white/10">
                {boss.avatar}
              </span>
              <div>
                <span className="text-[11px] font-black uppercase text-rose-400 tracking-wider">
                  Weekly Monster Clashing
                </span>
                <h3 className="text-xl font-black text-white">{boss.name}</h3>
                <p className="text-xs text-slate-300">{boss.title}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-bold block">Monster Health</span>
              <div className="text-2xl font-mono font-black text-rose-400">
                {boss.currentHp.toLocaleString()} / {boss.totalHp.toLocaleString()} HP
              </div>
              <span className="text-xs text-slate-300">
                1 step = 1 damage dealt
              </span>
            </div>
          </div>

          {/* Boss HP Bar */}
          <div className="space-y-1">
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-300">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500 rounded-full"
                style={{ width: `${Math.round((boss.currentHp / boss.totalHp) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
              <span>0 HP (Defeated)</span>
              <span>{Math.round((boss.currentHp / boss.totalHp) * 100)}% Remaining</span>
              <span>{boss.totalHp.toLocaleString()} HP Max</span>
            </div>
          </div>

          {/* Attack Action */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-600">
              Attacker: <strong>{currentMember.name}</strong>
            </span>
            <button
              onClick={() => handleAttackBoss(1800)}
              disabled={boss.defeated}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Swords className="w-4 h-4" />
              <span>Attack Monster with 1,800 Steps!</span>
            </button>
          </div>

          {/* Recent Damage Log */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Recent Damage Log:
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {boss.damageLog.map((log, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800">
                    💥 {getMemberDisplayName(members, log.memberId, log.memberName)} dealt <strong>{log.damage.toLocaleString()}</strong> damage!
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Route Library & Editor Modal */}
      <RouteEditorModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        activeRouteId={quest.id}
        routesLibrary={routesLibrary}
        lang={lang}
        onSelectActiveRoute={onSelectActiveRoute}
        onSaveRoute={onSaveRoute}
        onDeleteRoute={onDeleteRoute}
        onShowToast={onShowToast}
      />
    </div>
  );
};
