import React, { useState } from 'react';
import { ScreenType, Language, UserPersona, MemberProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { 
  ShieldCheck, 
  Home, 
  Footprints,
  Compass,
  MessageCircle,
  Trophy,
  Gamepad2,
  Sliders, 
  Smartphone, 
  BarChart3, 
  Info, 
  Globe, 
  Trash2, 
  Menu, 
  X, 
  ChevronDown,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  lang: Language;
  onToggleLang: () => void;
  onClearData: () => void;
  currentPersona: UserPersona;
  currentChildId: string;
  onSelectPersona: (persona: UserPersona, childId?: string) => void;
  pendingApprovalsCount: number;
  members?: MemberProfile[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  lang,
  onToggleLang,
  onClearData,
  currentPersona,
  currentChildId,
  onSelectPersona,
  pendingApprovalsCount,
  members
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const navItems: { id: ScreenType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: t.navHome, icon: <Home className="w-4 h-4" /> },
    { id: 'step-race', label: t.navStepRace, icon: <Footprints className="w-4 h-4" /> },
    { id: 'games', label: t.navGames, icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'coop', label: t.navCoop, icon: <Compass className="w-4 h-4" /> },
    { id: 'social', label: t.navSocial, icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'tournaments', label: t.navTournaments, icon: <Trophy className="w-4 h-4" /> },
    { id: 'about', label: t.navAbout, icon: <Info className="w-4 h-4" /> },
  ];

  const getPersonaLabel = () => {
    if (members && members.length > 0) {
      if (currentPersona === 'parent') {
        const m = members.find(m => m.id === 'member-amma') || members[0];
        return { 
          title: m.name, 
          sub: m.nickname ? `(${m.nickname})` : m.relation, 
          avatar: m.avatar 
        };
      }
      if (currentPersona === 'grandparent') {
        const m = members.find(m => m.id === 'member-nani') || members[2];
        return { 
          title: m.name, 
          sub: m.nickname ? `(${m.nickname})` : m.relation, 
          avatar: m.avatar 
        };
      }
      if (currentChildId === 'child-anna') {
        const m = members.find(m => m.id === 'member-anna') || members[3];
        return { 
          title: m.name, 
          sub: m.nickname ? `(${m.nickname})` : m.relation, 
          avatar: m.avatar 
        };
      }
      const m = members.find(m => m.id === 'member-chinni') || members[4];
      return { 
        title: m.name, 
        sub: m.nickname ? `(${m.nickname})` : m.relation, 
        avatar: m.avatar 
      };
    }
    if (currentPersona === 'parent') return { title: 'Parent', sub: 'Amma/Nanna', avatar: '👨‍👩‍👧' };
    if (currentPersona === 'grandparent') return { title: 'Grandparent', sub: 'Nani', avatar: '👵' };
    if (currentChildId === 'child-anna') return { title: 'Anna', sub: '16 yrs', avatar: '🧑‍💻' };
    return { title: 'Chinni', sub: '10 yrs', avatar: '👧' };
  };

  const personaInfo = getPersonaLabel();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl p-1 shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-warmth-200" />
            </div>
            <div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors">
                {t.appName}
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Vizag
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors relative ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* "Who is using the phone now?" Selector & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-xs sm:text-sm font-bold text-slate-800 transition-all shadow-2xs"
                title={t.whoUsingLabel}
                aria-haspopup="listbox"
                aria-expanded={personaDropdownOpen}
              >
                <span className="text-base sm:text-lg leading-none">{personaInfo.avatar}</span>
                <div className="text-left hidden xs:block">
                  <span className="block leading-tight font-extrabold">{personaInfo.title}</span>
                  <span className="text-[10px] font-medium text-slate-500 block leading-tight">{personaInfo.sub}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {personaDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    {t.whoUsingLabel}
                  </div>

                  <button
                    onClick={() => {
                      onSelectPersona('parent');
                      setPersonaDropdownOpen(false);
                      onNavigate('parent');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm transition-colors text-left ${
                      currentPersona === 'parent' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">👨‍👩‍👧</span>
                      <div>
                        <span className="block font-bold">{t.personaParent}</span>
                        <span className="text-[11px] text-slate-400">Full control & schedule locks</span>
                      </div>
                    </div>
                    {currentPersona === 'parent' && <UserCheck className="w-4 h-4 text-brand-600" />}
                  </button>

                  <button
                    onClick={() => {
                      onSelectPersona('grandparent');
                      setPersonaDropdownOpen(false);
                      onNavigate('parent');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm transition-colors text-left ${
                      currentPersona === 'grandparent' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">👵</span>
                      <div>
                        <span className="block font-bold">{t.personaGrandparent}</span>
                        <span className="text-[11px] text-slate-400">Can approve requests</span>
                      </div>
                    </div>
                    {currentPersona === 'grandparent' && <UserCheck className="w-4 h-4 text-brand-600" />}
                  </button>

                  <div className="px-3.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100">
                    Children Mode
                  </div>

                  <button
                    onClick={() => {
                      onSelectPersona('child', 'child-anna');
                      setPersonaDropdownOpen(false);
                      onNavigate('child');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm transition-colors text-left ${
                      currentPersona === 'child' && currentChildId === 'child-anna'
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">🧑‍💻</span>
                      <div>
                        <span className="block font-bold">Anna (16)</span>
                        <span className="text-[11px] text-slate-400">Class 11 • Tuition 5-7 PM</span>
                      </div>
                    </div>
                    {currentPersona === 'child' && currentChildId === 'child-anna' && (
                      <UserCheck className="w-4 h-4 text-brand-600" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onSelectPersona('child', 'child-chinni');
                      setPersonaDropdownOpen(false);
                      onNavigate('child');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm transition-colors text-left ${
                      currentPersona === 'child' && currentChildId === 'child-chinni'
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">👧</span>
                      <div>
                        <span className="block font-bold">Chinni (10)</span>
                        <span className="text-[11px] text-slate-400">Class 5 • Tuition 5-7 PM</span>
                      </div>
                    </div>
                    {currentPersona === 'child' && currentChildId === 'child-chinni' && (
                      <UserCheck className="w-4 h-4 text-brand-600" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-brand-700 bg-white hover:bg-brand-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Switch Language / భాషను మార్చుకోండి"
            >
              <Globe className="w-3.5 h-3.5 text-brand-600" />
              <span>{t.langToggle}</span>
            </button>

            {/* Clear Data */}
            <button
              onClick={onClearData}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors"
              title={t.clearData}
              aria-label={t.clearData}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-left transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
