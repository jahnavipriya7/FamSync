import React, { useState } from 'react';
import { ChildProfile, DayUsageLog, AIParentInsight, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { fetchParentInsight } from '../services/api';
import { 
  BarChart3, 
  Share2, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Flame, 
  TrendingUp, 
  RotateCw, 
  AlertCircle,
  Award,
  BookOpen,
  HeartHandshake
} from 'lucide-react';

interface WeeklyReportViewProps {
  childrenList: ChildProfile[];
  usageLogs: DayUsageLog[];
  insight: AIParentInsight | null;
  onSaveInsight: (insight: AIParentInsight) => void;
  lang: Language;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({
  childrenList,
  usageLogs,
  insight,
  onSaveInsight,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedChildId, setSelectedChildId] = useState(childrenList[0]?.id || 'child-anna');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const selectedChild = childrenList.find(c => c.id === selectedChildId) || childrenList[0];
  const childLogs = usageLogs.filter(l => l.childId === selectedChild.id);

  // Totals for this child
  const totalStudyMin = childLogs.reduce((sum, l) => sum + l.studyMin, 0);
  const totalEntMin = childLogs.reduce((sum, l) => sum + l.entertainmentMin, 0);
  const totalBonusMin = childLogs.reduce((sum, l) => sum + l.bonusEarnedMin, 0);
  const totalChores = childLogs.reduce((sum, l) => sum + l.choresDone, 0);

  const handleFetchAiInsight = async () => {
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const result = await fetchParentInsight(childrenList);
      onSaveInsight(result);
    } catch (e: any) {
      setAiError(e.message || 'Could not fetch AI insight. Try again.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = [
      `📊 *FamSync Weekly Family Report (Visakhapatnam)*`,
      `👨‍👩‍👧 *Child:* ${selectedChild.name} (Age ${selectedChild.age})`,
      `🔥 *Streak:* ${selectedChild.streakDays} days within limits`,
      `📚 *Study vs Fun:* ${totalStudyMin}m Study | ${totalEntMin}m Entertainment`,
      `⭐ *Minutes Earned:* +${totalBonusMin}m (via reading & elder skills)`,
      `🧹 *Chores Done:* ${totalChores} tasks completed`,
      `💬 *AI Coach Note:* "Screen time without the fights! Tuition hours (5-7 PM) protected."`,
      `👉 Track honestly at FamSync`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.reportTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.reportSubtitle}
          </p>
        </div>

        {/* Share on WhatsApp Button */}
        <button
          onClick={handleShareWhatsApp}
          className="px-5 py-2.5 rounded-2xl bg-growth-600 hover:bg-growth-700 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Share2 className="w-4 h-4" />
          <span>{copiedWhatsApp ? t.whatsAppCopied : t.shareWhatsAppBtn}</span>
        </button>
      </div>

      {/* Child Switcher Tabs for Reports */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/70 rounded-2xl max-w-sm">
        {childrenList.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedChildId(c.id)}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              selectedChildId === c.id
                ? 'bg-white text-slate-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{c.avatar}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {t.streakCardTitle}
          </span>
          <div className="text-2xl font-black text-brand-700 flex items-center gap-1">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>{selectedChild.streakDays} days</span>
          </div>
          <span className="text-[10px] text-slate-500 block">{t.daysInRow}</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Study vs Fun
          </span>
          <div className="text-2xl font-black text-slate-900">
            {Math.round((totalStudyMin / Math.max(1, totalStudyMin + totalEntMin)) * 100)}%
          </div>
          <span className="text-[10px] text-slate-500 block">{totalStudyMin}m study time</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Earned Minutes
          </span>
          <div className="text-2xl font-black text-growth-700">
            +{totalBonusMin}m
          </div>
          <span className="text-[10px] text-slate-500 block">Via reading & skills</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Chores Done
          </span>
          <div className="text-2xl font-black text-warmth-700">
            {totalChores} tasks
          </div>
          <span className="text-[10px] text-slate-500 block">Helped at home</span>
        </div>
      </div>

      {/* 7-Day Usage Trend Bars */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
          7-Day Screen Time vs Allowance ({selectedChild.name})
        </h3>

        <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center pt-2">
          {childLogs.map((log, i) => {
            const heightPct = Math.min(100, Math.round((log.totalUsedMin / 100) * 100));
            const isOver = log.totalUsedMin > log.limitMin;

            return (
              <div key={i} className="flex flex-col items-center justify-end space-y-2">
                <span className="text-[10px] font-bold text-slate-500">{log.totalUsedMin}m</span>
                <div className="w-full bg-slate-100 rounded-xl h-32 flex items-end p-1">
                  <div
                    className={`w-full rounded-lg transition-all ${
                      isOver ? 'bg-rose-500' : 'bg-brand-600'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-700">{log.dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Parent Insight Card */}
      <div className="bg-white rounded-3xl border border-brand-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="font-black text-lg text-slate-900">{t.aiInsightTitle}</h3>
              <p className="text-xs text-slate-500">Calm, non-judgmental guidance for Vizag parents</p>
            </div>
          </div>

          <button
            onClick={handleFetchAiInsight}
            disabled={isLoadingAi}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
            <span>{isLoadingAi ? t.aiInsightLoading : t.aiInsightBtn}</span>
          </button>
        </div>

        {/* Loading state */}
        {isLoadingAi && (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2 animate-pulse">
            <p className="text-xs font-bold text-slate-500">{t.aiInsightLoading}</p>
          </div>
        )}

        {/* Error state */}
        {aiError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center justify-between">
            <span>{aiError}</span>
            <button onClick={handleFetchAiInsight} className="font-bold underline ml-2">{t.tryAgainBtn}</button>
          </div>
        )}

        {/* Insight content */}
        {insight && !isLoadingAi && (
          <div className="space-y-4 pt-2">
            {/* Summary */}
            <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-100 text-xs sm:text-sm font-semibold text-brand-950 leading-relaxed">
              "{insight.summary}"
            </div>

            {/* Watchouts */}
            <div className="space-y-1.5">
              <strong className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                {t.concernsTitle}
              </strong>
              <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-1">
                {insight.concerns.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Recommended Habit Tasks */}
            <div className="space-y-2">
              <strong className="text-xs font-bold uppercase tracking-wider text-growth-800 block">
                {t.earnTasksTitle}
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insight.earn_tasks.map((task, idx) => (
                  <div key={idx} className="p-3 bg-growth-50/60 rounded-xl border border-growth-200 text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <strong className="font-bold text-growth-900">{task.title}</strong>
                      <span className="font-extrabold text-growth-700">+{task.bonus_min}m</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{task.why}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dinner conversation starter */}
            <div className="p-4 rounded-2xl bg-warmth-50 border border-warmth-200 space-y-1 text-xs">
              <strong className="text-warmth-900 font-extrabold block">
                💬 {t.convoStarterTitle}
              </strong>
              <p className="text-slate-800 font-medium">"{insight.conversation_starter}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
