import React, { useState } from 'react';
import { QuestRoute, Landmark, Language } from '../types/stepRace';
import { 
  validateRouteName, 
  validateLocation, 
  validateDistanceKm, 
  validateLandmarkFact 
} from '../utils/validation';
import { 
  calculateStepsFromDistanceKm, 
  calculateDistanceKmFromSteps 
} from '../utils/stepRaceStorage';
import { 
  X, 
  MapPin, 
  Compass, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Navigation, 
  Flag,
  Sparkles
} from 'lucide-react';

interface RouteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRouteId: string;
  routesLibrary: QuestRoute[];
  lang: Language;
  onSelectActiveRoute: (routeId: string) => void;
  onSaveRoute: (updatedRoute: QuestRoute) => void;
  onDeleteRoute: (routeId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const LANDMARK_ICONS = ['🏛️', '⛰️', '🏖️', '⛵', '🛕', '🏰', '🕌', '🚩', '🍊', '🌾', '🏕️', '🦇', '🌳', '🌊', '🏡', '🎒'];

export const RouteEditorModal: React.FC<RouteEditorModalProps> = ({
  isOpen,
  onClose,
  activeRouteId,
  routesLibrary,
  lang,
  onSelectActiveRoute,
  onSaveRoute,
  onDeleteRoute,
  onShowToast
}) => {
  const [viewMode, setViewMode] = useState<'library' | 'editor'>('library');
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  // Editor form state
  const [title, setTitle] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [description, setDescription] = useState('');
  const [distanceKm, setDistanceKm] = useState<string>('30');
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Open editor with empty form for a new custom route
  const handleStartNewRoute = () => {
    setEditingRouteId(null);
    setTitle('');
    setStartLocation('Visakhapatnam, AP');
    setEndLocation('');
    setDescription('Custom family walking journey');
    setDistanceKm('25');
    setLandmarks([
      {
        id: `lm-start-${Date.now()}`,
        title: 'Starting Point',
        distanceKm: 0,
        stepsRequired: 0,
        funFact: 'Our family departure mark!',
        badgeIcon: '🏡',
        unlocked: true
      },
      {
        id: `lm-dest-${Date.now()}`,
        title: 'Destination Landmark',
        distanceKm: 25,
        stepsRequired: calculateStepsFromDistanceKm(25),
        funFact: 'The grand finish line for our family!',
        badgeIcon: '🚩',
        unlocked: false
      }
    ]);
    setFormErrors({});
    setViewMode('editor');
  };

  // Open editor with existing route
  const handleEditRoute = (route: QuestRoute) => {
    setEditingRouteId(route.id);
    setTitle(route.title);
    setStartLocation(route.startLocation);
    setEndLocation(route.endLocation);
    setDescription(route.description);
    setDistanceKm(route.totalDistanceKm.toString());
    setLandmarks(JSON.parse(JSON.stringify(route.landmarks)));
    setFormErrors({});
    setViewMode('editor');
  };

  // Duplicate route as custom editable copy
  const handleDuplicateRoute = (route: QuestRoute) => {
    const copyId = `route-custom-${Date.now()}`;
    const duplicate: QuestRoute = {
      ...JSON.parse(JSON.stringify(route)),
      id: copyId,
      title: `${route.title} (Custom Copy)`,
      isCustom: true,
      currentSteps: 0,
      completed: false,
      memberContributions: {}
    };
    onSaveRoute(duplicate);
    onShowToast(
      lang === 'te' 
        ? 'రూట్ కాపీ సృష్టించబడింది!' 
        : `Created custom copy of "${route.title}"!`,
      'success'
    );
  };

  // Add a new milestone landmark
  const handleAddLandmark = () => {
    const totalDist = parseFloat(distanceKm) || 10;
    const nextKm = Math.min(totalDist, Math.round(totalDist * 0.5));
    const newLm: Landmark = {
      id: `lm-${Date.now()}`,
      title: `Milestone Stop #${landmarks.length + 1}`,
      distanceKm: nextKm,
      stepsRequired: calculateStepsFromDistanceKm(nextKm),
      funFact: 'Memorable family stop along the trail.',
      badgeIcon: '✨',
      unlocked: false
    };
    setLandmarks([...landmarks, newLm]);
  };

  // Remove a landmark
  const handleRemoveLandmark = (idx: number) => {
    if (landmarks.length <= 2) {
      onShowToast(
        lang === 'te' 
          ? 'రూట్‌కు కనీసం 2 ల్యాండ్‌మార్క్‌లు (ప్రారంభం & ముగింపు) ఉండాలి!' 
          : 'A route must have at least 2 landmarks (Start & Destination)!', 
        'error'
      );
      return;
    }
    const updated = landmarks.filter((_, i) => i !== idx);
    setLandmarks(updated);
  };

  // Update landmark property
  const handleUpdateLandmark = (idx: number, field: keyof Landmark, val: any) => {
    const updated = [...landmarks];
    const item = { ...updated[idx], [field]: val };
    if (field === 'distanceKm') {
      const numKm = parseFloat(val) || 0;
      item.stepsRequired = calculateStepsFromDistanceKm(numKm);
    }
    updated[idx] = item;
    setLandmarks(updated);
  };

  // Form submission & validation
  const handleSaveRouteForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const routeTitleVal = validateRouteName(title);
    if (!routeTitleVal.valid) errors.title = routeTitleVal.error || 'Invalid title';

    const startVal = validateLocation(startLocation, 'Start location');
    if (!startVal.valid) errors.start = startVal.error || 'Invalid start location';

    const endVal = validateLocation(endLocation, 'End location');
    if (!endVal.valid) errors.end = endVal.error || 'Invalid end location';

    const distVal = validateDistanceKm(distanceKm);
    if (!distVal.valid) errors.distance = distVal.error || 'Invalid distance';

    const totalDist = distVal.valid ? (distVal.sanitizedValue as number) : 0;

    // Validate landmarks
    if (landmarks.length < 2) {
      errors.landmarks = 'At least 2 landmarks are required (start & finish).';
    }

    landmarks.forEach((lm, i) => {
      if (!lm.title.trim()) {
        errors[`lm_title_${i}`] = `Landmark #${i + 1} name cannot be empty.`;
      }
      if (lm.distanceKm < 0 || lm.distanceKm > totalDist) {
        errors[`lm_dist_${i}`] = `Marker must be between 0 and ${totalDist} km.`;
      }
      const factVal = validateLandmarkFact(lm.funFact);
      if (!factVal.valid) {
        errors[`lm_fact_${i}`] = factVal.error || 'Fun fact too long.';
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      onShowToast(
        lang === 'te' ? 'దయచేసి ఫారమ్ లోపాలను సరిదిద్దండి.' : 'Please fix the errors in the form.',
        'error'
      );
      return;
    }

    // Sort landmarks by distanceKm ascending
    const sortedLandmarks = [...landmarks].sort((a, b) => a.distanceKm - b.distanceKm);
    // Recalculate step markers
    const finalLandmarks = sortedLandmarks.map((lm, idx) => ({
      ...lm,
      title: lm.title.trim(),
      funFact: lm.funFact.trim(),
      stepsRequired: calculateStepsFromDistanceKm(lm.distanceKm),
      unlocked: idx === 0 ? true : lm.unlocked
    }));

    const totalSteps = calculateStepsFromDistanceKm(totalDist);
    const existing = editingRouteId ? routesLibrary.find(r => r.id === editingRouteId) : null;

    const savedRoute: QuestRoute = {
      id: editingRouteId || `custom-route-${Date.now()}`,
      title: routeTitleVal.sanitizedValue,
      startLocation: startVal.sanitizedValue,
      endLocation: endVal.sanitizedValue,
      description: description.trim() || `${startVal.sanitizedValue} to ${endVal.sanitizedValue}`,
      totalDistanceKm: totalDist,
      totalStepsRequired: totalSteps,
      currentSteps: existing ? existing.currentSteps : 0,
      completed: existing ? existing.completed : false,
      isCustom: existing?.isCustom !== undefined ? existing.isCustom : true,
      memberContributions: existing ? existing.memberContributions : {},
      landmarks: finalLandmarks
    };

    onSaveRoute(savedRoute);
    onShowToast(
      lang === 'te' 
        ? `"${savedRoute.title}" భద్రపరచబడింది!` 
        : `Route "${savedRoute.title}" saved successfully!`,
      'success'
    );
    setViewMode('library');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="route-modal-title"
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl">
              🗺️
            </div>
            <div>
              <h2 id="route-modal-title" className="text-xl sm:text-2xl font-black text-slate-900">
                {lang === 'te' ? 'రూట్ లైబ్రరీ & ఎడిటర్' : 'Route Library & Editor'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {lang === 'te'
                  ? 'మీ కుటుంబం నడవడానికి కస్టమ్ మార్గాలను సృష్టించండి లేదా టెంప్లేట్‌లను ఉపయోగించండి.'
                  : 'Customize routes, set your own landmarks, and choose your family journey.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close route modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* View Switcher / Sub-header */}
        <div className="flex items-center justify-between my-5">
          {viewMode === 'library' ? (
            <>
              <span className="text-xs sm:text-sm font-bold text-slate-600">
                {routesLibrary.length} {lang === 'te' ? 'అందుబాటులో ఉన్న మార్గాలు' : 'Available Quest Routes'}
              </span>
              <button
                onClick={handleStartNewRoute}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                {lang === 'te' ? '+ కొత్త కస్టమ్ రూట్' : '+ Create Custom Route'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setViewMode('library')}
              className="text-xs sm:text-sm font-bold text-brand-700 hover:underline flex items-center gap-1"
            >
              ← {lang === 'te' ? 'రూట్ లైబ్రరీకి తిరిగి వెళ్ళు' : 'Back to Routes Library'}
            </button>
          )}
        </div>

        {/* MODE 1: ROUTES LIBRARY */}
        {viewMode === 'library' && (
          <div className="space-y-4">
            {routesLibrary.map(route => {
              const isActive = route.id === activeRouteId;
              return (
                <div 
                  key={route.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isActive 
                      ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-200' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-black text-slate-900 text-base sm:text-lg">
                          {route.title}
                        </h3>
                        {isActive && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-brand-600 text-white flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {lang === 'te' ? 'ప్రస్తుత యాక్టివ్' : 'Active Quest'}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          route.isCustom 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {route.isCustom 
                            ? (lang === 'te' ? 'కస్టమ్ రూట్' : 'Custom') 
                            : (lang === 'te' ? 'టెంప్లేట్' : 'Template')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{route.startLocation}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <Flag className="w-4 h-4 text-brand-600 shrink-0" />
                        <span>{route.endLocation}</span>
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <div className="text-sm sm:text-base font-black text-slate-900">
                        {route.totalDistanceKm.toLocaleString()} km
                      </div>
                      <div className="text-xs text-slate-500 font-bold">
                        {route.totalStepsRequired.toLocaleString()} steps
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                    {route.description}
                  </p>

                  {/* Landmarks previews */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 mr-1">
                      {route.landmarks.length} Landmarks:
                    </span>
                    {route.landmarks.map(lm => (
                      <span 
                        key={lm.id}
                        title={`${lm.title} (${lm.distanceKm} km)`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700"
                      >
                        <span>{lm.badgeIcon}</span>
                        <span className="truncate max-w-[120px]">{lm.title}</span>
                      </span>
                    ))}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
                    <div className="flex items-center gap-2">
                      {!isActive && (
                        <button
                          onClick={() => onSelectActiveRoute(route.id)}
                          className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          {lang === 'te' ? 'ఈ మార్గంలో నడవండి' : 'Select for Family Quest'}
                        </button>
                      )}
                      <button
                        onClick={() => handleEditRoute(route)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                        {lang === 'te' ? 'సవరించు' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDuplicateRoute(route)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                        {lang === 'te' ? 'డూప్లికేట్' : 'Duplicate'}
                      </button>
                    </div>

                    {route.isCustom && (
                      <button
                        onClick={() => {
                          if (window.confirm(lang === 'te' ? 'ఈ రూట్‌ను తొలగించాలనుకుంటున్నారా?' : `Delete route "${route.title}"?`)) {
                            onDeleteRoute(route.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {lang === 'te' ? 'తొలగించు' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODE 2: ROUTE EDITOR FORM */}
        {viewMode === 'editor' && (
          <form onSubmit={handleSaveRouteForm} className="space-y-6">
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Compass className="w-5 h-5 text-brand-600" />
                {editingRouteId 
                  ? (lang === 'te' ? 'రూట్ వివరాలు సవరించండి' : 'Edit Route Details') 
                  : (lang === 'te' ? 'కొత్త కస్టమ్ రూట్ రూపొందించండి' : 'Create Custom Route')}
              </h3>

              {/* Route Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {lang === 'te' ? 'రూట్ పేరు (2-60 అక్షరాలు)' : 'Route Name (2-60 chars)'} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={60}
                  className={`w-full px-4 py-2.5 rounded-xl border font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                    formErrors.title ? 'border-rose-400 ring-rose-300' : 'border-slate-300 focus:ring-brand-500'
                  }`}
                  placeholder="e.g. Home to Grandma's Village in Anakapalle"
                />
                {formErrors.title && (
                  <p className="flex items-center gap-1 text-xs text-rose-600 font-bold mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Start & End Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {lang === 'te' ? 'ప్రారంభ స్థలం' : 'Start Location'} *
                  </label>
                  <input
                    type="text"
                    value={startLocation}
                    onChange={e => setStartLocation(e.target.value)}
                    maxLength={50}
                    className={`w-full px-4 py-2.5 rounded-xl border font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                      formErrors.start ? 'border-rose-400 ring-rose-300' : 'border-slate-300 focus:ring-brand-500'
                    }`}
                    placeholder="e.g. MVP Colony, Visakhapatnam"
                  />
                  {formErrors.start && (
                    <p className="flex items-center gap-1 text-xs text-rose-600 font-bold mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.start}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {lang === 'te' ? 'గమ్యస్థానం' : 'End Destination'} *
                  </label>
                  <input
                    type="text"
                    value={endLocation}
                    onChange={e => setEndLocation(e.target.value)}
                    maxLength={50}
                    className={`w-full px-4 py-2.5 rounded-xl border font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                      formErrors.end ? 'border-rose-400 ring-rose-300' : 'border-slate-300 focus:ring-brand-500'
                    }`}
                    placeholder="e.g. Grandma's Garden House, Anakapalle"
                  />
                  {formErrors.end && (
                    <p className="flex items-center gap-1 text-xs text-rose-600 font-bold mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.end}
                    </p>
                  )}
                </div>
              </div>

              {/* Total Distance & Auto Step Conversion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {lang === 'te' ? 'మొత్తం దూరం (కి.మీ)' : 'Total Distance (km)'} *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50000"
                    value={distanceKm}
                    onChange={e => setDistanceKm(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                      formErrors.distance ? 'border-rose-400 ring-rose-300' : 'border-slate-300 focus:ring-brand-500'
                    }`}
                  />
                  {formErrors.distance && (
                    <p className="flex items-center gap-1 text-xs text-rose-600 font-bold mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.distance}
                    </p>
                  )}
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-center">
                  <span className="text-xs font-bold text-slate-500">
                    {lang === 'te' ? 'లెక్కింపు: అవసరమైన కుటుంబ స్టెప్స్' : 'Calculated Steps (0.75m / step)'}
                  </span>
                  <span className="text-lg font-black text-brand-700">
                    {calculateStepsFromDistanceKm(parseFloat(distanceKm) || 0).toLocaleString()} steps
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {lang === 'te' ? 'రూట్ వివరణ' : 'Route Description'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="Why this route is special to our family..."
                />
              </div>
            </div>

            {/* LANDMARKS BUILDER */}
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    {lang === 'te' ? 'ల్యాండ్‌మార్క్‌లు & మైలురాళ్ళు' : 'Landmarks & Milestones'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddLandmark}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {lang === 'te' ? '+ మైలురాయిని చేర్చు' : '+ Add Landmark'}
                </button>
              </div>

              {formErrors.landmarks && (
                <p className="flex items-center gap-1 text-xs text-rose-600 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.landmarks}
                </p>
              )}

              <div className="space-y-4">
                {landmarks.map((lm, idx) => (
                  <div 
                    key={lm.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {idx === 0 
                            ? (lang === 'te' ? 'ప్రారంభం' : 'Start Point') 
                            : idx === landmarks.length - 1 
                            ? (lang === 'te' ? 'గమ్యం' : 'Destination') 
                            : (lang === 'te' ? 'స్టాప్' : 'Interim Stop')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveLandmark(idx)}
                        disabled={landmarks.length <= 2}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors p-1"
                        title="Delete landmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          {lang === 'te' ? 'ల్యాండ్‌మార్క్ పేరు' : 'Landmark Name'} *
                        </label>
                        <input
                          type="text"
                          value={lm.title}
                          onChange={e => handleUpdateLandmark(idx, 'title', e.target.value)}
                          maxLength={50}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="e.g. RK Beach Submarine Museum"
                        />
                        {formErrors[`lm_title_${idx}`] && (
                          <p className="text-xs text-rose-600 font-bold mt-0.5">
                            {formErrors[`lm_title_${idx}`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          {lang === 'te' ? 'మార్కర్ (కి.మీ)' : 'Marker (km)'} *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max={distanceKm}
                          value={lm.distanceKm}
                          onChange={e => handleUpdateLandmark(idx, 'distanceKm', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        {formErrors[`lm_dist_${idx}`] && (
                          <p className="text-xs text-rose-600 font-bold mt-0.5">
                            {formErrors[`lm_dist_${idx}`]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Fun fact & badge icon */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-start">
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          {lang === 'te' ? 'సరదా విషయం / జ్ఞాపకం (గరిష్టం 250 అక్షరాలు)' : 'Fun Fact or Story (max 250 chars)'}
                        </label>
                        <input
                          type="text"
                          value={lm.funFact}
                          onChange={e => handleUpdateLandmark(idx, 'funFact', e.target.value)}
                          maxLength={250}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Why this place is memorable..."
                        />
                        {formErrors[`lm_fact_${idx}`] && (
                          <p className="text-xs text-rose-600 font-bold mt-0.5">
                            {formErrors[`lm_fact_${idx}`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          {lang === 'te' ? 'బ్యాడ్జ్ ఐకాన్' : 'Badge Icon'}
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={lm.badgeIcon}
                            onChange={e => handleUpdateLandmark(idx, 'badgeIcon', e.target.value)}
                            maxLength={4}
                            className="w-12 px-2 py-1 text-center text-lg rounded-lg border border-slate-300 font-bold"
                          />
                          <div className="flex gap-1 overflow-x-auto max-w-[120px]">
                            {LANDMARK_ICONS.slice(0, 4).map(icon => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => handleUpdateLandmark(idx, 'badgeIcon', icon)}
                                className="w-7 h-7 text-sm rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0"
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Optional Image URL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        {lang === 'te' ? 'ఐచ్ఛిక ఫోటో URL' : 'Optional Landmark Photo URL'}
                      </label>
                      <input
                        type="url"
                        value={lm.imageUrl || ''}
                        onChange={e => handleUpdateLandmark(idx, 'imageUrl', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewMode('library')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                {lang === 'te' ? 'రద్దు' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                <Check className="w-4 h-4" />
                {lang === 'te' ? 'రూట్ భద్రపరచు' : 'Save Route'}
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        {viewMode === 'library' && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow transition-colors"
            >
              {lang === 'te' ? 'పూర్తయింది' : 'Done & Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
