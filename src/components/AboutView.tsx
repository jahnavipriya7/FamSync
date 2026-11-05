import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { MapPin, ShieldCheck, HeartHandshake, BookOpen, Clock, TrendingUp } from 'lucide-react';

interface AboutViewProps {
  lang: Language;
}

export const AboutView: React.FC<AboutViewProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-10 animate-in fade-in duration-150">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 uppercase tracking-wider">
          Mission & Context
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t.aboutTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          {t.aboutSubtitle}
        </p>
      </div>

      {/* The Team Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-700 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-md shrink-0">
            J&A
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.teamTitle}</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-warmth-600" />
              <span>Visakhapatnam, Andhra Pradesh, India</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed font-medium">
          {t.teamBio}
        </p>
      </div>

      {/* Research & Indian Household Reality */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-warmth-50 text-warmth-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">{t.mospiTitle}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t.mospiText}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-growth-50 text-growth-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900">{t.pricingDetailsTitle}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t.pricingDetailsText}
          </p>
        </div>
      </div>

      {/* Honest Commitment */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
        <span className="text-xs font-bold text-warmth-400 uppercase tracking-wider">Our Ethics</span>
        <h3 className="text-xl font-bold text-white">Why an Agreement Beats Spyware</h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Middle class Indian parents often install aggressive spyware blockers that create resentment, sneakiness, and broken trust between parents and teenagers. FamSync builds mutual respect: children own their time, tuition hours remain safe, and learning practical skills earns extra freedom without shouting.
        </p>
      </div>
    </div>
  );
};
