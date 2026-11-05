import React, { useState } from 'react';
import { Language, ChildProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  ArrowRight,
  Footprints,
  Flame,
  Leaf,
  BookOpen,
  Lightbulb,
  Wind,
  ShoppingBag,
  Recycle,
  Smile,
  Dices,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Sun,
  Moon,
  Users,
  Zap
} from 'lucide-react';

interface HomeViewProps {
  onSetUpFamily: () => void;
  lang: Language;
  childrenList?: ChildProfile[];
}

interface EcoFeature {
  icon: React.ReactNode;
  color: string;
  badge: string;
  badgeColor: string;
  title: string;
  titleTe: string;
  time: string;
  desc: string;
  descTe: string;
  why: string;
  whyTe: string;
}

const ECO_FEATURES: EcoFeature[] = [
  {
    icon: <Moon className="w-6 h-6" />,
    color: 'bg-amber-100 text-amber-800',
    badge: '8:30 PM',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    title: 'Analog Sunset',
    titleTe: 'అనలాగ్ సన్‌సెట్',
    time: '8:30 PM daily',
    desc: 'At 8:30 PM the app dims into warm amber mode. Light a traditional Deepam/Diya instead of your main room light. Cuts peak-hour grid load and naturally boosts melatonin for better sleep.',
    descTe: 'రాత్రి 8:30 కి యాప్ వెచ్చని అంబర్ రంగులోకి మారుతుంది. మీ ప్రధాన గది లైటుకు బదులు సాంప్రదాయ దీపం / దివ్వె వెలిగించండి.',
    why: '⚡ Saves peak-grid electricity in Vizag • 🌙 Protects melatonin for deeper sleep',
    whyTe: '⚡ విజాగ్ పీక్-గ్రిడ్ వినియోగాన్ని తగ్గిస్తుంది • 🌙 మెలటోనిన్ రక్షించి మంచి నిద్ర పొందండి',
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    color: 'bg-green-100 text-green-800',
    badge: 'Green Bonus',
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
    title: 'Zero-Watt Hour',
    titleTe: 'జీరో-వాట్ అవర్',
    time: 'Earn Green Minutes',
    desc: 'Children unlock Green Bonus Minutes through zero-electricity activities: sweeping the balcony garden, watering plants using recycled kitchen greywater, or hand-folding laundry without an iron.',
    descTe: 'పిల్లలు జీరో-కరెంట్ పనుల ద్వారా గ్రీన్ బోనస్ మినిట్లు సంపాదిస్తారు: బాల్కనీ తుడవడం, కిచెన్ నీటితో మొక్కలకు నీళ్ళు పోయడం, లేదా ఇస్త్రీ లేకుండా బట్టలు మడతపెట్టడం.',
    why: '🌊 Water-scarce AP summers demand conscious use • 💪 Builds physical self-reliance',
    whyTe: '🌊 ఆంధ్రప్రదేశ్ నీటి ఎద్దడికి స్పందించండి • 💪 శారీరక స్వాతంత్ర్యం పెంచుతుంది',
  },
  {
    icon: <Wind className="w-6 h-6" />,
    color: 'bg-sky-100 text-sky-800',
    badge: '6:30–7:30 PM',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    title: 'Silent Family Hour',
    titleTe: 'సైలెంట్ ఫ్యామిలీ అవర్',
    time: '60-min Device Vault',
    desc: 'All household devices — including parents\' phones and laptops — go into the FamSync Vault for 60 minutes. Parents read or prep bills, Nani rests, children finish homework. No blue-light distractions.',
    descTe: 'తల్లిదండ్రుల ఫోన్లు, ల్యాప్‌టాప్లు సహా అన్ని పరికరాలు 60 నిమిషాల FamSync వాల్ట్‌లోకి వెళ్తాయి. తల్లిదండ్రులు పుస్తకాలు చదువుతారు, నాని విశ్రాంతి తీసుకుంటారు, పిల్లలు హోంవర్క్ పూర్తి చేస్తారు.',
    why: '🔌 Cuts phantom standby power • 🧠 Models real focus habits for children',
    whyTe: '🔌 స్టాండ్‌బై పవర్ వినియోగాన్ని తగ్గిస్తుంది • 🧠 పిల్లలకు ఏకాగ్రత అలవాటు అవుతుంది',
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    color: 'bg-orange-100 text-orange-800',
    badge: 'Eco Ledger',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    title: 'Eco-Errand & Rythu Bazaar',
    titleTe: 'ఎకో-ఎరాండ్ & రైతు బజార్',
    time: 'Walk, don\'t order',
    desc: 'Log an Eco-Errand when a child walks to the local vegetable vendor or Rythu Bazaar instead of ordering via Instamart/Zepto. FamSync calculates plastic bags saved and CO₂ emissions avoided.',
    descTe: 'పిల్లలు ఇన్స్టామార్ట్/జెప్టో బదులు రైతు బజార్ నడిచి వెళ్ళినప్పుడు ఎకో-ఎరాండ్ నమోదు చేయండి. FamSync ఆదా అయిన ప్లాస్టిక్ బ్యాగ్లు మరియు CO₂ తగ్గింపు లెక్కిస్తుంది.',
    why: '🛍️ Reduces single-use plastic • 🚶 Keeps children connected to neighbourhood micro-commerce',
    whyTe: '🛍️ ప్లాస్టిక్ వాడకం తగ్గిస్తుంది • 🚶 పిల్లలను పరిసర వ్యాపారులతో అనుసంధానిస్తుంది',
  },
  {
    icon: <Recycle className="w-6 h-6" />,
    color: 'bg-lime-100 text-lime-800',
    badge: 'Weekly Quest',
    badgeColor: 'bg-lime-100 text-lime-800 border-lime-200',
    title: 'Kitchen Zero-Waste Quest',
    titleTe: 'కిచెన్ జీరో-వేస్ట్ క్వెస్ట్',
    time: 'Weekly family challenge',
    desc: 'Segregate food scraps and vegetable peels into the balcony composter or flowerpot base. Nani verifies the compost layer. FamSync logs it as an Earth Stewardship Task for the whole family.',
    descTe: 'వంటగది చెత్తను మరియు కూరగాయల తొక్కలను బాల్కనీ కంపోస్ట్‌లో వేయండి. నానమ్మ కంపోస్ట్ పొరను తనిఖీ చేస్తారు. మొత్తం కుటుంబానికి ఎర్త్ స్టీవార్డ్‌షిప్ టాస్క్ నమోదవుతుంది.',
    why: '🪴 Reduces municipal landfill in Visakhapatnam • 🌱 Bridges intergenerational gardening knowledge',
    whyTe: '🪴 విశాఖపట్నం మ్యూనిసిపల్ చెత్తను తగ్గిస్తుంది • 🌱 తాతయ్య-నానమ్మ జ్ఞానాన్ని పిల్లలకు అందిస్తుంది',
  },
  {
    icon: <Smile className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-800',
    badge: 'Boredom Cure',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    title: 'Mindful Boredom Roulette',
    titleTe: 'మైండ్‌ఫుల్ బోర్‌డమ్ రూలెట్',
    time: 'Tap "I\'m Bored"',
    desc: 'Instead of more media, tapping "I\'m Bored" spins the low-tech offline activity wheel: Sketch what\'s outside the window, write a handwritten letter to a relative, rearrange your bookshelf, or breathe on the balcony.',
    descTe: '"విసుగు వచ్చింది" నొక్కినప్పుడు నేరుగా మీడియా కాదు — ఆఫ్‌లైన్ యాక్టివిటీ వీల్ స్పిన్ అవుతుంది: కిటికీ బయట చూసి స్కెచ్ వేయండి, బంధువులకు చేత్తో ఉత్తరం రాయండి, పుస్తకాల అర సర్దండి.',
    why: '🧘 Breaks dopamine loops • 💡 Encourages creative problem-solving during idle hours',
    whyTe: '🧘 డోపమైన్ లూప్‌లను బ్రేక్ చేస్తుంది • 💡 ఖాళీ సమయంలో సృజనాత్మకతను ప్రోత్సహిస్తుంది',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({ onSetUpFamily, lang, childrenList }) => {
  const t = TRANSLATIONS[lang];
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const toggle = (i: number) => setExpandedFeature(prev => prev === i ? null : i);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 max-w-5xl mx-auto px-4 sm:px-6">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="text-center pt-6 sm:pt-12 pb-6 relative overflow-hidden">
        {/* Background aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-72
          bg-gradient-to-r from-green-100/60 via-brand-100/40 to-amber-100/40
          blur-3xl -z-10 rounded-full pointer-events-none" />

        {/* Location badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
          bg-green-50 border border-green-200 text-green-900
          text-xs sm:text-sm font-semibold mb-6 shadow-2xs">
          <MapPin className="w-4 h-4 text-green-600" />
          <span>Visakhapatnam, AP</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900
          tracking-tight leading-[1.15] mb-3">
          {t.homeHeadline}
        </h1>
        <p className="text-base sm:text-xl font-bold text-green-700 mb-6">
          {(t as any).homeTagline ?? 'Share the work. Share the wisdom. Save the planet.'}
        </p>

        {/* Problem / pitch */}
        <div className="max-w-2xl mx-auto mb-6 bg-green-50/90 border border-green-200
          rounded-2xl p-4 sm:p-5 text-sm sm:text-base font-semibold text-slate-900 shadow-2xs">
          <p className="leading-relaxed">{t.homeProblem}</p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs font-bold text-slate-600">
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-full shadow-2xs">
            {(t as any).pillStepsRace ?? '🏃 Daily Step Race'}
          </span>
          <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-800 rounded-full shadow-2xs">
            {(t as any).pillEcoHabits ?? '🌿 Eco-Habits & Green Bonus'}
          </span>
          <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full shadow-2xs">
            {(t as any).pillElderWisdom ?? '👵 Elder Wisdom Sessions'}
          </span>
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-full shadow-2xs">
            🎮 Family Games
          </span>
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-full shadow-2xs">
            🗺️ Co-op Quests
          </span>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onSetUpFamily}
            className="w-full sm:w-auto px-10 py-4 text-lg font-black text-white
              bg-green-600 hover:bg-green-700 active:scale-[0.98] rounded-2xl
              shadow-xl shadow-green-600/30 flex items-center justify-center gap-3
              transition-all focus:ring-4 focus:ring-green-200"
          >
            <Leaf className="w-5 h-5" />
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing note */}
        <div className="mt-4 max-w-md mx-auto text-xs font-semibold text-slate-500
          bg-slate-100/80 py-2 px-3 rounded-xl border border-slate-200/60">
          💰 {t.pricingNote}
        </div>
      </section>

      {/* ── 6 Eco Feature Cards ─────────────────────────────── */}
      <section className="space-y-4">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase
            tracking-widest text-green-700 bg-green-50 border border-green-200
            px-3 py-1.5 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" /> 6 Green Family Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            Your home, your playground.<br />
            <span className="text-green-600">Every habit counts.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ECO_FEATURES.map((f, i) => {
            const isOpen = expandedFeature === i;
            const title = lang === 'te' ? f.titleTe : f.title;
            const desc = lang === 'te' ? f.descTe : f.desc;
            const why = lang === 'te' ? f.whyTe : f.why;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs
                  hover:border-green-300 hover:shadow-md transition-all overflow-hidden"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center gap-3 p-5 text-left"
                >
                  <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center shrink-0`}>
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-black text-sm text-slate-900">{title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${f.badgeColor}`}>
                        {f.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{f.time}</p>
                  </div>
                  <div className="shrink-0 text-slate-400">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 space-y-3 border-t border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed mt-3">{desc}</p>
                    <div className="text-xs font-bold text-green-700 bg-green-50 rounded-xl px-3 py-2 leading-relaxed">
                      {why}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Core Features Quick Grid ─────────────────────────── */}
      <section className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-600" /> Everything your family needs
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: <Footprints className="w-4 h-4" />, label: 'Daily Step Race', color: 'text-brand-700 bg-brand-50 border-brand-200' },
            { icon: <Dices className="w-4 h-4" />, label: 'Family Games (AI)', color: 'text-purple-700 bg-purple-50 border-purple-200' },
            { icon: <Leaf className="w-4 h-4" />, label: 'Green Eco-Habits', color: 'text-green-700 bg-green-50 border-green-200' },
            { icon: <MapPin className="w-4 h-4" />, label: 'Co-op Quest Routes', color: 'text-orange-700 bg-orange-50 border-orange-200' },
            { icon: <BookOpen className="w-4 h-4" />, label: 'Elder Wisdom', color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { icon: <Users className="w-4 h-4" />, label: 'Social Family Feed', color: 'text-sky-700 bg-sky-50 border-sky-200' },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-xs font-bold ${item.color}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our commitment card ───────────────────────────────── */}
      <section className="bg-green-50 border border-green-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              {t.honestLimitTitle}
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {t.honestLimitDesc}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
