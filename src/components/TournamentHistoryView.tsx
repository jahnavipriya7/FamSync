import { 
  WeeklyTournament, 
  WinnerRecord, 
  SeasonalEvent, 
  MemberProfile, 
  Language 
} from '../types/stepRace';
import { getMemberDisplayName, getMemberAvatar } from '../utils/stepRaceStorage';
import { TRANSLATIONS } from '../data/translations';
import { 
  Trophy, 
  Medal, 
  Calendar, 
  Sparkles, 
  Flame, 
  Gift, 
  CheckCircle2, 
  Clock,
  Award
} from 'lucide-react';

interface TournamentHistoryViewProps {
  tournament: WeeklyTournament;
  winners: WinnerRecord[];
  events: SeasonalEvent[];
  members: MemberProfile[];
  lang: Language;
}

export const TournamentHistoryView: React.FC<TournamentHistoryViewProps> = ({
  tournament,
  winners,
  events,
  members,
  lang
}) => {
  const t = TRANSLATIONS[lang];
  const champion = members.find(m => m.id === tournament.championMemberId) || members[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-6 animate-in fade-in duration-150">
      {/* 1. Champion of the Week Hero Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="text-5xl sm:text-6xl p-3 bg-white/20 rounded-3xl border border-white/20 shadow-inner">
            {getMemberAvatar(members, champion.id, champion.avatar)}
          </span>
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-amber-200">
              Crown of the Week (Monday - Sunday)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Champion of the Week: {getMemberDisplayName(members, champion.id, champion.name)} 👑
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 max-w-md">
              Leading the weekly standings with {champion.tournamentPoints} points and {champion.totalWins} daily wins!
            </p>
          </div>
        </div>

        <div className="bg-white/10 p-4 rounded-2xl border border-white/20 text-center sm:text-right shrink-0">
          <span className="text-xs text-amber-200 font-bold block uppercase">Points System</span>
          <div className="text-xs text-white/90 space-y-0.5 mt-1 font-semibold">
            <div>🥇 1st Place: <strong>10 pts</strong></div>
            <div>🥈 2nd Place: <strong>6 pts</strong></div>
            <div>🥉 3rd Place: <strong>3 pts</strong></div>
            <div>🎯 Goal Hit: <strong>+2 pts</strong></div>
          </div>
        </div>
      </div>

      {/* 2. Current Week Tournament Standings */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Weekly Tournament Standings ({tournament.weekId})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Active tournament running from Monday 00:00 to Sunday 23:59.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {tournament.standings.map((stand, idx) => (
            <div 
              key={stand.memberId}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                idx === 0 
                  ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400' 
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-black text-base text-slate-400">
                  #{idx + 1}
                </span>
                <span className="text-2xl">{getMemberAvatar(members, stand.memberId, stand.avatar)}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-900">
                      {getMemberDisplayName(members, stand.memberId, stand.memberName)}
                    </span>
                    {idx === 0 && <span className="text-xs">👑</span>}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Wins: {stand.dailyWins} • Goals Reached: {stand.goalsReached} • Total: {stand.totalSteps.toLocaleString()} steps
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg sm:text-xl font-mono font-black text-brand-700">
                  {stand.totalPoints} pts
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Seasonal Events Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-warmth-600" />
            <span>Seasonal Family Events</span>
          </h3>
          <p className="text-xs text-slate-500">
            Special themed seasonal step-a-thons with unique family badges!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map(ev => (
            <div 
              key={ev.id}
              className={`p-5 rounded-2xl border space-y-3 ${
                ev.isActive 
                  ? 'bg-gradient-to-br from-amber-50/60 to-orange-50/40 border-amber-300 ring-2 ring-amber-400' 
                  : 'bg-slate-50 border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{ev.theme.icon}</span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  ev.isActive ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-600'
                }`}>
                  {ev.isActive ? 'Active Festival Event' : 'Upcoming'}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-900">{ev.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {ev.challengeDescription}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Badge: {ev.badgeName}</span>
                <span className="font-mono font-black text-amber-700">
                  {ev.currentFamilySteps.toLocaleString()} / {ev.targetFamilySteps.toLocaleString()} steps
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Past Daily Winners Log */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            <span>Past Daily Winners & Custom Rewards</span>
          </h3>
          <p className="text-xs text-slate-500">
            History of who reached 10,000 steps first each day and the custom family reward awarded.
          </p>
        </div>

        <div className="space-y-2.5">
          {winners.map(win => (
            <div key={win.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getMemberAvatar(members, win.memberId, win.memberAvatar)}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {getMemberDisplayName(members, win.memberId, win.memberName)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">• {win.date}</span>
                    {win.handicapApplied && (
                      <span className="text-[9px] font-black bg-brand-100 text-brand-800 px-1.5 py-0.2 rounded-full">
                        Handicap
                      </span>
                    )}
                  </div>
                  <div className="text-amber-800 font-bold mt-0.5 flex items-center gap-1">
                    <Gift className="w-3 h-3 text-amber-600" />
                    <span>Reward: {win.rewardTitle}</span>
                  </div>
                </div>
              </div>

              <div className="text-right sm:text-right shrink-0">
                <div className="font-mono font-black text-slate-900">
                  {win.steps.toLocaleString()} steps
                </div>
                <span className="text-[10px] text-slate-400">
                  Finished: {new Date(win.reachedGoalAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
