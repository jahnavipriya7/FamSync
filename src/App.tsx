import React, { useState, useEffect } from 'react';
import { 
  ScreenType, 
  Language, 
  UserPersona,
  FamilyGroup,
  MemberProfile,
  DailyChallenge,
  WinnerRecord,
  WeeklyTournament,
  QuestRoute,
  RelayChallenge,
  BossMonster,
  PhotoPost,
  MysteryChallenge,
  SeasonalEvent,
  Reaction,
  TauntMessage
} from './types';
import { TRANSLATIONS } from './data/translations';
import { 
  loadStepRaceData,
  SAMPLE_FAMILY_GROUP,
  SAMPLE_MEMBERS,
  getInitialDailyChallenge,
  SAMPLE_WINNERS,
  SAMPLE_TOURNAMENT,
  SAMPLE_QUEST,
  DEFAULT_ROUTES_TEMPLATES,
  SAMPLE_RELAY,
  SAMPLE_BOSS,
  SAMPLE_PHOTOS,
  SAMPLE_MYSTERY,
  SAMPLE_EVENTS,
  SAMPLE_REACTIONS,
  SAMPLE_TAUNTS,
  STORAGE_KEY_STEP_GROUP,
  STORAGE_KEY_STEP_MEMBERS,
  STORAGE_KEY_STEP_CHALLENGE,
  STORAGE_KEY_STEP_WINNERS,
  STORAGE_KEY_STEP_TOURNAMENT,
  STORAGE_KEY_STEP_QUEST,
  STORAGE_KEY_STEP_ROUTES_LIBRARY,
  STORAGE_KEY_STEP_RELAY,
  STORAGE_KEY_STEP_BOSS,
  STORAGE_KEY_STEP_PHOTOS,
  STORAGE_KEY_STEP_MYSTERY,
  STORAGE_KEY_STEP_EVENTS,
  STORAGE_KEY_STEP_REACTIONS,
  STORAGE_KEY_STEP_TAUNTS
} from './utils/stepRaceStorage';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { StepRaceView } from './components/StepRaceView';
import { GamesHubView } from './components/GamesHubView';
import { CooperativeHubView } from './components/CooperativeHubView';
import { SocialFeedView } from './components/SocialFeedView';
import { TournamentHistoryView } from './components/TournamentHistoryView';
import { AboutView } from './components/AboutView';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const STORAGE_KEY_LANG = 'famsync_lang_v3';
const STORAGE_KEY_ACTIVE_MEMBER = 'famsync_active_member_v3';

export const App: React.FC = () => {
  // Navigation & Language
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [lang, setLang] = useState<Language>('en');

  // Active Member Persona
  const [currentPersona, setCurrentPersona] = useState<UserPersona>('parent');
  const [currentMemberId, setCurrentMemberId] = useState<string>('member-anna');

  // Step Race Feature States
  const [group, setGroup] = useState<FamilyGroup>(SAMPLE_FAMILY_GROUP);
  const [members, setMembers] = useState<MemberProfile[]>(SAMPLE_MEMBERS);
  const [challenge, setChallenge] = useState<DailyChallenge>(getInitialDailyChallenge());
  const [winners, setWinners] = useState<WinnerRecord[]>(SAMPLE_WINNERS);
  const [tournament, setTournament] = useState<WeeklyTournament>(SAMPLE_TOURNAMENT);
  const [quest, setQuest] = useState<QuestRoute>(SAMPLE_QUEST);
  const [routesLibrary, setRoutesLibrary] = useState<QuestRoute[]>(DEFAULT_ROUTES_TEMPLATES);
  const [relay, setRelay] = useState<RelayChallenge>(SAMPLE_RELAY);
  const [boss, setBoss] = useState<BossMonster>(SAMPLE_BOSS);
  const [photos, setPhotos] = useState<PhotoPost[]>(SAMPLE_PHOTOS);
  const [mystery, setMystery] = useState<MysteryChallenge>(SAMPLE_MYSTERY);
  const [events, setEvents] = useState<SeasonalEvent[]>(SAMPLE_EVENTS);
  const [reactions, setReactions] = useState<Reaction[]>(SAMPLE_REACTIONS);
  const [taunts, setTaunts] = useState<TauntMessage[]>(SAMPLE_TAUNTS);

  // Global Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as Language | null;
    if (savedLang === 'en' || savedLang === 'te') setLang(savedLang);

    const savedMember = localStorage.getItem(STORAGE_KEY_ACTIVE_MEMBER);
    if (savedMember) setCurrentMemberId(savedMember);

    // Load full Step Race dataset
    const loaded = loadStepRaceData();
    setGroup(loaded.group);
    setMembers(loaded.members);
    setChallenge(loaded.challenge);
    setWinners(loaded.winners);
    setTournament(loaded.tournament);
    setQuest(loaded.quest);
    setRoutesLibrary(loaded.routesLibrary);
    setRelay(loaded.relay);
    setBoss(loaded.boss);
    setPhotos(loaded.photos);
    setMystery(loaded.mystery);
    setEvents(loaded.events);
    setReactions(loaded.reactions);
    setTaunts(loaded.taunts);
  }, []);

  // Sync state helpers
  const handleUpdateGroup = (updated: FamilyGroup) => {
    setGroup(updated);
    localStorage.setItem(STORAGE_KEY_STEP_GROUP, JSON.stringify(updated));
  };

  const handleUpdateChallenge = (updated: DailyChallenge) => {
    setChallenge(updated);
    localStorage.setItem(STORAGE_KEY_STEP_CHALLENGE, JSON.stringify(updated));
  };

  const handleUpdateMembers = (updated: MemberProfile[]) => {
    setMembers(updated);
    localStorage.setItem(STORAGE_KEY_STEP_MEMBERS, JSON.stringify(updated));
  };

  const handleUpdateQuest = (updated: QuestRoute) => {
    setQuest(updated);
    localStorage.setItem(STORAGE_KEY_STEP_QUEST, JSON.stringify(updated));
  };

  const handleSelectActiveRoute = (routeId: string) => {
    const found = routesLibrary.find(r => r.id === routeId);
    if (found) {
      setQuest(found);
      localStorage.setItem(STORAGE_KEY_STEP_QUEST, JSON.stringify(found));
      showToast(`Active family quest set to ${found.title}!`, 'success');
    }
  };

  const handleSaveRoute = (updatedRoute: QuestRoute) => {
    const exists = routesLibrary.some(r => r.id === updatedRoute.id);
    const nextLibrary = exists
      ? routesLibrary.map(r => r.id === updatedRoute.id ? updatedRoute : r)
      : [...routesLibrary, updatedRoute];
    setRoutesLibrary(nextLibrary);
    localStorage.setItem(STORAGE_KEY_STEP_ROUTES_LIBRARY, JSON.stringify(nextLibrary));

    if (quest.id === updatedRoute.id) {
      setQuest(updatedRoute);
      localStorage.setItem(STORAGE_KEY_STEP_QUEST, JSON.stringify(updatedRoute));
    }
  };

  const handleDeleteRoute = (routeId: string) => {
    const target = routesLibrary.find(r => r.id === routeId);
    if (!target) return;
    if (!target.isCustom) {
      showToast('Default route templates cannot be deleted.', 'error');
      return;
    }
    const nextLibrary = routesLibrary.filter(r => r.id !== routeId);
    setRoutesLibrary(nextLibrary);
    localStorage.setItem(STORAGE_KEY_STEP_ROUTES_LIBRARY, JSON.stringify(nextLibrary));
    if (quest.id === routeId) {
      const fallback = nextLibrary[0] || DEFAULT_ROUTES_TEMPLATES[0];
      setQuest(fallback);
      localStorage.setItem(STORAGE_KEY_STEP_QUEST, JSON.stringify(fallback));
    }
    showToast(`Route "${target.title}" deleted.`, 'info');
  };

  const handleUpdateRelay = (updated: RelayChallenge) => {
    setRelay(updated);
    localStorage.setItem(STORAGE_KEY_STEP_RELAY, JSON.stringify(updated));
  };

  const handleUpdateBoss = (updated: BossMonster) => {
    setBoss(updated);
    localStorage.setItem(STORAGE_KEY_STEP_BOSS, JSON.stringify(updated));
  };

  const handleUpdatePhotos = (updated: PhotoPost[]) => {
    setPhotos(updated);
    localStorage.setItem(STORAGE_KEY_STEP_PHOTOS, JSON.stringify(updated));
  };

  const handleUpdateTaunts = (updated: TauntMessage[]) => {
    setTaunts(updated);
    localStorage.setItem(STORAGE_KEY_STEP_TAUNTS, JSON.stringify(updated));
  };

  const handleUpdateMystery = (updated: MysteryChallenge) => {
    setMystery(updated);
    localStorage.setItem(STORAGE_KEY_STEP_MYSTERY, JSON.stringify(updated));
  };

  // Toggle Language
  const handleToggleLang = () => {
    const next: Language = lang === 'en' ? 'te' : 'en';
    setLang(next);
    localStorage.setItem(STORAGE_KEY_LANG, next);
  };

  // Select Persona from Navbar
  const handleSelectPersona = (persona: UserPersona, childId?: string) => {
    setCurrentPersona(persona);
    let targetMemberId = 'member-anna';

    if (persona === 'parent') {
      targetMemberId = 'member-amma';
    } else if (persona === 'grandparent') {
      targetMemberId = 'member-nani';
    } else if (childId === 'child-chinni') {
      targetMemberId = 'member-chinni';
    } else {
      targetMemberId = 'member-anna';
    }

    setCurrentMemberId(targetMemberId);
    localStorage.setItem(STORAGE_KEY_ACTIVE_MEMBER, targetMemberId);

    const memberName = members.find(m => m.id === targetMemberId)?.name || 'Family Member';
    showToast(`Active walker switched to ${memberName}`, 'info');
  };

  // Clear All Data
  const handleClearData = () => {
    const t = TRANSLATIONS[lang];
    if (window.confirm(t.clearConfirm)) {
      localStorage.removeItem(STORAGE_KEY_STEP_GROUP);
      localStorage.removeItem(STORAGE_KEY_STEP_MEMBERS);
      localStorage.removeItem(STORAGE_KEY_STEP_CHALLENGE);
      localStorage.removeItem(STORAGE_KEY_STEP_WINNERS);
      localStorage.removeItem(STORAGE_KEY_STEP_TOURNAMENT);
      localStorage.removeItem(STORAGE_KEY_STEP_QUEST);
      localStorage.removeItem(STORAGE_KEY_STEP_ROUTES_LIBRARY);
      localStorage.removeItem(STORAGE_KEY_STEP_RELAY);
      localStorage.removeItem(STORAGE_KEY_STEP_BOSS);
      localStorage.removeItem(STORAGE_KEY_STEP_PHOTOS);
      localStorage.removeItem(STORAGE_KEY_STEP_TAUNTS);

      const freshChallenge = getInitialDailyChallenge();
      setGroup(SAMPLE_FAMILY_GROUP);
      setMembers(SAMPLE_MEMBERS);
      setChallenge(freshChallenge);
      setWinners([]);
      setTournament(SAMPLE_TOURNAMENT);
      setQuest(SAMPLE_QUEST);
      setRoutesLibrary(DEFAULT_ROUTES_TEMPLATES);
      setRelay(SAMPLE_RELAY);
      setBoss(SAMPLE_BOSS);
      setPhotos([]);
      setTaunts([]);
      showToast(t.dataCleared, 'info');
    }
  };

  // Restore Sample Data
  const handleRestoreSampleData = () => {
    const t = TRANSLATIONS[lang];
    setGroup(SAMPLE_FAMILY_GROUP);
    setMembers(SAMPLE_MEMBERS);
    const freshChallenge = getInitialDailyChallenge();
    setChallenge(freshChallenge);
    setWinners(SAMPLE_WINNERS);
    setTournament(SAMPLE_TOURNAMENT);
    setQuest(SAMPLE_QUEST);
    setRoutesLibrary(DEFAULT_ROUTES_TEMPLATES);
    setRelay(SAMPLE_RELAY);
    setBoss(SAMPLE_BOSS);
    setPhotos(SAMPLE_PHOTOS);
    setMystery(SAMPLE_MYSTERY);
    setEvents(SAMPLE_EVENTS);
    setReactions(SAMPLE_REACTIONS);
    setTaunts(SAMPLE_TAUNTS);

    localStorage.setItem(STORAGE_KEY_STEP_GROUP, JSON.stringify(SAMPLE_FAMILY_GROUP));
    localStorage.setItem(STORAGE_KEY_STEP_MEMBERS, JSON.stringify(SAMPLE_MEMBERS));
    localStorage.setItem(STORAGE_KEY_STEP_CHALLENGE, JSON.stringify(freshChallenge));
    localStorage.setItem(STORAGE_KEY_STEP_WINNERS, JSON.stringify(SAMPLE_WINNERS));
    localStorage.setItem(STORAGE_KEY_STEP_TOURNAMENT, JSON.stringify(SAMPLE_TOURNAMENT));
    localStorage.setItem(STORAGE_KEY_STEP_QUEST, JSON.stringify(SAMPLE_QUEST));
    localStorage.setItem(STORAGE_KEY_STEP_ROUTES_LIBRARY, JSON.stringify(DEFAULT_ROUTES_TEMPLATES));
    localStorage.setItem(STORAGE_KEY_STEP_RELAY, JSON.stringify(SAMPLE_RELAY));
    localStorage.setItem(STORAGE_KEY_STEP_BOSS, JSON.stringify(SAMPLE_BOSS));
    localStorage.setItem(STORAGE_KEY_STEP_PHOTOS, JSON.stringify(SAMPLE_PHOTOS));
    localStorage.setItem(STORAGE_KEY_STEP_MYSTERY, JSON.stringify(SAMPLE_MYSTERY));
    localStorage.setItem(STORAGE_KEY_STEP_EVENTS, JSON.stringify(SAMPLE_EVENTS));

    showToast(t.sampleRestored, 'success');
  };

  // Dummy list for HomeView compat
  const demoChildren = [
    { id: 'child-anna', name: 'Anna (16)', age: 16, avatar: '🧑‍💻', dailyLimitMin: 90, usedTodayMin: 45, bonusEarnedTodayMin: 15, categorySplitToday: { study: 30, games: 15, videos: 0, social: 0 }, schoolLock: { start: '', end: '', enabled: false }, tuitionLock: { start: '', end: '', enabled: false }, bedtimeLock: { start: '', end: '', enabled: false }, examMode: { enabled: false, daysRemaining: 0 }, streakDays: 8, choresCompletedCount: 4 },
    { id: 'child-chinni', name: 'Chinni (10)', age: 10, avatar: '👧', dailyLimitMin: 60, usedTodayMin: 20, bonusEarnedTodayMin: 10, categorySplitToday: { study: 15, games: 5, videos: 0, social: 0 }, schoolLock: { start: '', end: '', enabled: false }, tuitionLock: { start: '', end: '', enabled: false }, bedtimeLock: { start: '', end: '', enabled: false }, examMode: { enabled: false, daysRemaining: 0 }, streakDays: 7, choresCompletedCount: 3 }
  ];

  return (
    <div className={`min-h-screen flex flex-col text-slate-900 ${lang === 'te' ? 'font-telugu' : ''}`} style={{ backgroundColor: '#fdf4f0' }}>
      {/* Top Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        lang={lang}
        onToggleLang={handleToggleLang}
        onClearData={handleClearData}
        currentPersona={currentPersona}
        currentChildId={currentMemberId === 'member-chinni' ? 'child-chinni' : 'child-anna'}
        onSelectPersona={handleSelectPersona}
        pendingApprovalsCount={0}
        members={members}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-6 sm:pt-8">
        {currentScreen === 'home' && (
          <HomeView
            onSetUpFamily={() => setCurrentScreen('step-race')}
            lang={lang}
            childrenList={demoChildren}
          />
        )}

        {currentScreen === 'step-race' && (
          <StepRaceView
            group={group}
            members={members}
            challenge={challenge}
            mystery={mystery}
            currentMemberId={currentMemberId}
            lang={lang}
            onUpdateChallenge={handleUpdateChallenge}
            onUpdateMembers={handleUpdateMembers}
            onUpdateGroup={handleUpdateGroup}
            onUpdateMystery={handleUpdateMystery}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'games' && (
          <GamesHubView
            currentMemberId={currentMemberId}
            allMembers={members}
            lang={lang}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'coop' && (
          <CooperativeHubView
            quest={quest}
            routesLibrary={routesLibrary}
            relay={relay}
            boss={boss}
            members={members}
            currentMemberId={currentMemberId}
            lang={lang}
            onUpdateQuest={handleUpdateQuest}
            onSelectActiveRoute={handleSelectActiveRoute}
            onSaveRoute={handleSaveRoute}
            onDeleteRoute={handleDeleteRoute}
            onUpdateRelay={handleUpdateRelay}
            onUpdateBoss={handleUpdateBoss}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'social' && (
          <SocialFeedView
            photos={photos}
            reactions={reactions}
            taunts={taunts}
            members={members}
            challenge={challenge}
            quest={quest}
            boss={boss}
            currentMemberId={currentMemberId}
            lang={lang}
            onUpdatePhotos={handleUpdatePhotos}
            onUpdateReactions={setReactions}
            onUpdateTaunts={handleUpdateTaunts}
            onUpdateMembers={handleUpdateMembers}
            onShowToast={showToast}
          />
        )}

        {currentScreen === 'tournaments' && (
          <TournamentHistoryView
            tournament={tournament}
            winners={winners}
            events={events}
            members={members}
            lang={lang}
          />
        )}

        {currentScreen === 'about' && (
          <AboutView lang={lang} />
        )}
      </main>

      {/* Global Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4"
        >
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold border ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-brand-700 text-white border-brand-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-growth-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-warmth-300" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-brand-200" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} FamSync • Family Step Race • Team J&Anni • Visakhapatnam, AP</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRestoreSampleData}
              className="font-bold text-brand-700 hover:underline"
            >
              {TRANSLATIONS[lang].restoreSample}
            </button>
            <span>•</span>
            <button
              onClick={handleClearData}
              className="text-slate-400 hover:text-rose-600"
            >
              {TRANSLATIONS[lang].clearData}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
