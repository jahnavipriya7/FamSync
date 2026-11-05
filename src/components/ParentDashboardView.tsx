import React, { useState } from 'react';
import { ChildProfile, EarnRequest, Language, UserPersona, ScreenCategory } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  Sliders, 
  Clock, 
  ShieldCheck, 
  Check, 
  X, 
  Lock, 
  Flame, 
  Plus, 
  UserPlus, 
  AlertCircle,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  Bell
} from 'lucide-react';

interface ParentDashboardViewProps {
  childrenList: ChildProfile[];
  onUpdateChildLimit: (id: string, limit: number) => void;
  onToggleExamMode: (id: string) => void;
  onAddChild: (child: ChildProfile) => void;
  earnRequests: EarnRequest[];
  onApproveRequest: (reqId: string, approvedBy: string) => void;
  onDeclineRequest: (reqId: string) => void;
  currentPersona: UserPersona;
  lang: Language;
  trialDaysLeft: number;
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({
  childrenList,
  onUpdateChildLimit,
  onToggleExamMode,
  onAddChild,
  earnRequests,
  onApproveRequest,
  onDeclineRequest,
  currentPersona,
  lang,
  trialDaysLeft,
}) => {
  const t = TRANSLATIONS[lang];
  const isGrandparent = currentPersona === 'grandparent';

  // Modal State for adding a child
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState<number | ''>(11);
  const [newChildLimit, setNewChildLimit] = useState<number | ''>(90);
  const [addError, setAddError] = useState('');

  // Subscribe Demo Modal
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [hasSubscribedDemo, setHasSubscribedDemo] = useState(false);

  const pendingRequests = earnRequests.filter(r => r.status === 'pending');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) {
      setAddError('Please enter a name');
      return;
    }
    const ageNum = Number(newChildAge);
    if (!ageNum || ageNum < 5 || ageNum > 18) {
      setAddError('Age must be between 5 and 18');
      return;
    }

    const newChild: ChildProfile = {
      id: `child-${Date.now()}`,
      name: newChildName.trim(),
      age: ageNum,
      avatar: ageNum > 13 ? '🧑‍🎓' : '🧒',
      dailyLimitMin: Number(newChildLimit) || 90,
      usedTodayMin: 0,
      bonusEarnedTodayMin: 0,
      categorySplitToday: { study: 0, games: 0, videos: 0, social: 0 },
      schoolLock: { start: '08:30', end: '15:30', enabled: true },
      tuitionLock: { start: '17:00', end: '19:00', enabled: true },
      bedtimeLock: { start: '21:30', end: '06:30', enabled: true },
      examMode: { enabled: false, daysRemaining: 0 },
      streakDays: 1,
      choresCompletedCount: 0,
      isSample: false
    };

    onAddChild(newChild);
    setNewChildName('');
    setNewChildAge(11);
    setNewChildLimit(90);
    setAddError('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-8 animate-in fade-in duration-150">
      {/* 1. Trial Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-indigo-700 to-brand-800 text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold text-white">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.trialDaysLeft}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold">
            {hasSubscribedDemo ? 'Annual Subscription Active' : 'First month ₹0. Full household access.'}
          </h2>
          <p className="text-xs text-brand-100">
            {t.pricingNote}
          </p>
        </div>

        <button
          onClick={() => setShowSubscribeModal(true)}
          className="px-5 py-2.5 rounded-xl bg-warmth-500 hover:bg-warmth-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-colors shrink-0"
        >
          {hasSubscribedDemo ? 'Subscribed (₹999/yr)' : t.subscribeBtn}
        </button>
      </div>

      {/* Grandparent Role Alert if Grandparent is active */}
      {isGrandparent && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold flex items-center gap-3">
          <span className="text-2xl">👵</span>
          <span>{t.grandparentNotice}</span>
        </div>
      )}

      {/* Header and Add Child Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.dashboardTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.dashboardSubtitle}
          </p>
        </div>

        {!isGrandparent && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addChildBtn}</span>
          </button>
        )}
      </div>

      {/* 2. Approval Inbox Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            <h3 className="font-extrabold text-lg text-slate-900">
              {t.inboxTitle} ({pendingRequests.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Reviewed by {isGrandparent ? 'Nani' : 'Amma/Nanna'}
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-slate-400 py-3 italic">{t.inboxEmpty}</p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div
                key={req.id}
                className="p-4 rounded-2xl border border-brand-200 bg-brand-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm sm:text-base">
                      {req.childName} finished: {req.title}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-growth-100 text-growth-800">
                      +{req.requestedMin} min
                    </span>
                  </div>
                  {req.note && (
                    <p className="text-xs text-slate-600 italic">
                      "{req.note}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onApproveRequest(req.id, isGrandparent ? 'Nani' : 'Parent')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-growth-600 hover:bg-growth-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.approveBtn}</span>
                  </button>
                  <button
                    onClick={() => onDeclineRequest(req.id)}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                  >
                    {t.declineBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Live Child Cards & Controls */}
      <div className="space-y-6">
        <h3 className="font-extrabold text-lg text-slate-900">
          {t.liveChildStatus}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {childrenList.map(child => {
            const totalAllowed = child.dailyLimitMin + child.bonusEarnedTodayMin;
            const remaining = Math.max(0, totalAllowed - child.usedTodayMin);
            const totalUsed = child.usedTodayMin;
            const isExam = child.examMode?.enabled;

            return (
              <div
                key={child.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs hover:border-brand-300 transition-colors"
              >
                {/* Child Name & Avatar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{child.avatar}</span>
                    <div>
                      <h4 className="font-black text-lg text-slate-900">{child.name}</h4>
                      <span className="text-xs text-slate-500">{child.age} years old</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-2xl font-black ${remaining <= 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {remaining}m
                    </span>
                    <span className="text-[11px] text-slate-400 block font-semibold">{t.timeLeft}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        remaining <= 5 ? 'bg-rose-500' : isExam ? 'bg-amber-500' : 'bg-growth-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.round((totalUsed / Math.max(1, totalAllowed)) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>Used: {totalUsed}m</span>
                    <span>Allowed: {totalAllowed}m (+{child.bonusEarnedTodayMin}m earned)</span>
                  </div>
                </div>

                {/* Category Split Pills */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    {t.categorySplit}
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                    <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                      <span className="block text-[10px] font-bold text-blue-700 uppercase">{t.catStudy}</span>
                      <strong className="text-blue-900 text-xs font-black">{child.categorySplitToday.study}m</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-50 border border-purple-100">
                      <span className="block text-[10px] font-bold text-purple-700 uppercase">{t.catGames}</span>
                      <strong className="text-purple-900 text-xs font-black">{child.categorySplitToday.games}m</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                      <span className="block text-[10px] font-bold text-rose-700 uppercase">{t.catVideos}</span>
                      <strong className="text-rose-900 text-xs font-black">{child.categorySplitToday.videos}m</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="block text-[10px] font-bold text-emerald-700 uppercase">{t.catSocial}</span>
                      <strong className="text-emerald-900 text-xs font-black">{child.categorySplitToday.social}m</strong>
                    </div>
                  </div>
                </div>

                {/* Exam Mode Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-xs font-extrabold text-slate-900 block flex items-center gap-1.5">
                      <Flame className={`w-3.5 h-3.5 ${isExam ? 'text-amber-500' : 'text-slate-400'}`} />
                      {t.examModeTitle}
                    </strong>
                    <span className="text-[11px] text-slate-500 block">
                      {isExam ? t.examModeActive : t.examModeInactive} (30m max entertainment)
                    </span>
                  </div>

                  <button
                    disabled={isGrandparent}
                    onClick={() => onToggleExamMode(child.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      isGrandparent
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : isExam
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {isExam ? 'Turn Off' : 'Turn On'}
                  </button>
                </div>

                {/* Schedule Locks Info */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    {t.scheduleLocksTitle}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      {t.lockTuition}
                    </span>
                    <span className="font-bold text-growth-700">Protected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      {t.lockBedtime}
                    </span>
                    <span className="font-bold text-slate-700">9:30 PM Lock</span>
                  </div>
                </div>

                {/* Limit Buttons (Parents Only) */}
                {!isGrandparent && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-600">{t.dailyLimit}:</span>
                    <div className="flex items-center gap-1.5">
                      {[45, 60, 90, 120].map(limit => (
                        <button
                          key={limit}
                          onClick={() => onUpdateChildLimit(child.id, limit)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            child.dailyLimitMin === limit
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {limit}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">{t.addChildBtn}</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  {t.childNameLabel} *
                </label>
                <input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="e.g. Chinni, Anna, Karthik"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  {t.childAgeLabel} *
                </label>
                <input
                  type="number"
                  min={5}
                  max={18}
                  value={newChildAge}
                  onChange={(e) => setNewChildAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  {t.childLimitLabel} (Minutes)
                </label>
                <input
                  type="number"
                  step={15}
                  min={30}
                  max={180}
                  value={newChildLimit}
                  onChange={(e) => setNewChildLimit(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {addError && <p className="text-xs text-rose-600 font-bold">{addError}</p>}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs"
                >
                  {t.saveChildBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscribe Demo Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 text-center animate-in fade-in zoom-in-95">
            <span className="text-4xl block">🎉</span>
            <h3 className="text-xl font-black text-slate-900">FamSync Household Plan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              First month free, then ₹999/year (about ₹83/month). Covers all children, Gemini Coach insights, and unlimited schedule locks.
            </p>
            <div className="p-3 bg-brand-50 rounded-2xl border border-brand-100 text-xs font-bold text-brand-900">
              Demo Simulation: No real payment required.
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setHasSubscribedDemo(true);
                  setShowSubscribeModal(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black shadow-md"
              >
                Activate Subscription (Demo)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
