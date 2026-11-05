import React, { useState, useRef } from 'react';
import { 
  PhotoPost, 
  MemberProfile, 
  Reaction, 
  TauntMessage, 
  DailyChallenge, 
  QuestRoute, 
  BossMonster, 
  Language 
} from '../types/stepRace';
import { PRESET_TAUNTS, getMemberDisplayName, getMemberAvatar } from '../utils/stepRaceStorage';
import { TRANSLATIONS } from '../data/translations';
import { 
  Camera, 
  Heart, 
  Trash2, 
  Send, 
  Share2, 
  MessageCircle, 
  Sparkles, 
  MapPin, 
  Trophy, 
  Volume2, 
  VolumeX,
  Copy,
  Check
} from 'lucide-react';

interface SocialFeedViewProps {
  photos: PhotoPost[];
  reactions: Reaction[];
  taunts: TauntMessage[];
  members: MemberProfile[];
  challenge: DailyChallenge;
  quest: QuestRoute;
  boss: BossMonster;
  currentMemberId: string;
  lang: Language;
  onUpdatePhotos: (updated: PhotoPost[]) => void;
  onUpdateReactions: (updated: Reaction[]) => void;
  onUpdateTaunts: (updated: TauntMessage[]) => void;
  onUpdateMembers: (updated: MemberProfile[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const SocialFeedView: React.FC<SocialFeedViewProps> = ({
  photos,
  reactions,
  taunts,
  members,
  challenge,
  quest,
  boss,
  currentMemberId,
  lang,
  onUpdatePhotos,
  onUpdateReactions,
  onUpdateTaunts,
  onUpdateMembers,
  onShowToast
}) => {
  const t = TRANSLATIONS[lang];
  const currentMember = members.find(m => m.id === currentMemberId) || members[0];

  // Post form state
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('RK Beach Road, Visakhapatnam');
  const [selectedTaunt, setSelectedTaunt] = useState(PRESET_TAUNTS[0]);
  const [tauntTargetId, setTauntTargetId] = useState(members[1]?.id || members[0].id);
  const [mutedTaunts, setMutedTaunts] = useState(false);
  const [recapCopied, setRecapCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image to < 100KB using HTML5 Canvas
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress to JPEG with 0.6 quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);

        const newPost: PhotoPost = {
          id: `photo-${Date.now()}`,
          memberId: currentMember.id,
          memberName: currentMember.name,
          avatar: currentMember.avatar,
          caption: caption.trim() || 'Enjoying my morning walk!',
          location: location.trim() || 'Visakhapatnam',
          photoUrl: compressedBase64,
          timestamp: new Date().toISOString(),
          likes: []
        };

        onUpdatePhotos([newPost, ...photos]);
        setCaption('');
        onShowToast('Walk photo uploaded to family feed!', 'success');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Like photo
  const handleLikePhoto = (photoId: string) => {
    const updated = photos.map(p => {
      if (p.id === photoId) {
        const alreadyLiked = p.likes.includes(currentMemberId);
        const newLikes = alreadyLiked 
          ? p.likes.filter(id => id !== currentMemberId) 
          : [...p.likes, currentMemberId];
        return { ...p, likes: newLikes };
      }
      return p;
    });
    onUpdatePhotos(updated);
  };

  // Delete own photo
  const handleDeletePhoto = (photoId: string) => {
    const updated = photos.filter(p => p.id !== photoId);
    onUpdatePhotos(updated);
    onShowToast('Photo removed from feed.', 'info');
  };

  // Send Taunt
  const handleSendTaunt = () => {
    if (currentMember.tauntsRemainingToday <= 0) {
      onShowToast(t.tauntLimitReached, 'error');
      return;
    }

    const targetMember = members.find(m => m.id === tauntTargetId);
    const newTaunt: TauntMessage = {
      id: `taunt-${Date.now()}`,
      fromMemberId: currentMember.id,
      fromMemberName: currentMember.name,
      toMemberId: tauntTargetId,
      toMemberName: targetMember?.name || 'Family',
      message: selectedTaunt,
      timestamp: new Date().toISOString()
    };

    onUpdateTaunts([newTaunt, ...taunts]);

    // Decrement taunts remaining today
    const updatedMembers = members.map(m => {
      if (m.id === currentMember.id) {
        return { ...m, tauntsRemainingToday: Math.max(0, m.tauntsRemainingToday - 1) };
      }
      return m;
    });
    onUpdateMembers(updatedMembers);

    onShowToast(`Taunt sent to ${targetMember?.name}! ⚡`, 'info');
  };

  // Share 9 PM Daily Recap
  const handleShareRecap = () => {
    const winner = members.find(m => m.id === challenge.winnerMemberId);
    const recapText = `🏃‍♂️ *FamSync Daily Step Race Recap (9 PM)*
👑 Daily Champion: ${winner ? `${getMemberDisplayName(members, winner.id, winner.name)} (${challenge.membersProgress[winner.id]?.steps.toLocaleString()} steps)` : 'Still in race!'}
🔥 Family Quest Progress: ${Math.round((quest.currentSteps * 0.75) / 1000)} km traversed!
🦥 Boss HP: ${boss.currentHp.toLocaleString()} / ${boss.totalHp.toLocaleString()} HP
Join the Vizag Family Step Race!`;

    if (navigator.share) {
      navigator.share({
        title: 'FamSync Daily 9 PM Recap',
        text: recapText
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(recapText);
      setRecapCopied(true);
      setTimeout(() => setRecapCopied(false), 2500);
      onShowToast(t.copiedToClipboard, 'success');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-6 animate-in fade-in duration-150">
      {/* 1. 9:00 PM Daily Recap Card */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-200">
              Evening Summary
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {t.dailyRecapTitle}
            </h2>
            <p className="text-xs text-amber-100 max-w-md">
              Share today’s family walking champion, streaks, and boss quest status on WhatsApp!
            </p>
          </div>

          <button
            onClick={handleShareRecap}
            className="px-6 py-3 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto"
          >
            {recapCopied ? <Check className="w-4 h-4 text-growth-600" /> : <Share2 className="w-4 h-4" />}
            <span>{recapCopied ? 'Copied to WhatsApp' : t.shareWhatsApp}</span>
          </button>
        </div>
      </div>

      {/* 2. Photo Check-Ins Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-brand-600" />
              <span>Photo Check-Ins & Walking Trail</span>
            </h2>
            <p className="text-xs text-slate-500">
              Snap a picture during your walk at RK Beach, Simhachalam trail, or terrace.
            </p>
          </div>
        </div>

        {/* Upload form */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption (e.g. Morning sea breeze at RK Beach!)"
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. RK Beach Road, Vizag)"
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 transition-colors shadow-xs"
            >
              <Camera className="w-4 h-4" />
              <span>Take or Select Photo</span>
            </button>
            <span className="text-[11px] text-slate-400 font-semibold">
              Auto-compressed to &lt;100KB for fast syncing
            </span>
          </div>
        </div>

        {/* Photo Feed List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {photos.map(photo => {
            const isLiked = photo.likes.includes(currentMemberId);
            const isOwner = photo.memberId === currentMemberId;

            return (
              <div key={photo.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  {photo.photoUrl ? (
                    <img 
                      src={photo.photoUrl} 
                      alt={photo.caption} 
                      className="w-full h-48 object-cover bg-slate-100" 
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-tr from-brand-600 to-indigo-700 flex flex-col items-center justify-center text-white p-4 text-center">
                      <Camera className="w-8 h-8 mb-2 opacity-80" />
                      <span className="text-xs font-black uppercase tracking-wider">{photo.location}</span>
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getMemberAvatar(members, photo.memberId, photo.avatar)}</span>
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 block">
                            {getMemberDisplayName(members, photo.memberId, photo.memberName)}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            {photo.location}
                          </span>
                        </div>
                      </div>

                      {isOwner && (
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {photo.caption}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100">
                  <button
                    onClick={() => handleLikePhoto(photo.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                      isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{photo.likes.length} Likes</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {new Date(photo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Friendly Taunts & Trash Talk */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-amber-500" />
              <span>Friendly Taunts & Encouragement</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pick a friendly preset message to cheer or taunt your family rival! (Rate limit: 3/day)
            </p>
          </div>

          <button
            onClick={() => setMutedTaunts(!mutedTaunts)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            title={mutedTaunts ? 'Unmute Taunts' : 'Mute Taunts'}
          >
            {mutedTaunts ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Taunt sender */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Target Family Member:
              </label>
              <select
                value={tauntTargetId}
                onChange={(e) => setTauntTargetId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                {members.filter(m => m.id !== currentMemberId).map(m => (
                  <option key={m.id} value={m.id}>
                    {getMemberDisplayName(members, m.id, m.name)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Friendly Message:
              </label>
              <select
                value={selectedTaunt}
                onChange={(e) => setSelectedTaunt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white"
              >
                {PRESET_TAUNTS.map((t, idx) => (
                  <option key={idx} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-amber-900 font-bold">
              Remaining today: {currentMember.tauntsRemainingToday} / 3
            </span>
            <button
              onClick={handleSendTaunt}
              disabled={currentMember.tauntsRemainingToday <= 0}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-900 font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Friendly Taunt</span>
            </button>
          </div>
        </div>

        {/* Taunts Feed */}
        <div className="space-y-2">
          {taunts.map(taunt => (
            <div key={taunt.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-slate-900">
                  {getMemberDisplayName(members, taunt.fromMemberId, taunt.fromMemberName)}
                </span>
                <span className="text-slate-400 mx-1.5">➔</span>
                <span className="font-extrabold text-slate-900">
                  {getMemberDisplayName(members, taunt.toMemberId, taunt.toMemberName)}:
                </span>
                <span className="text-slate-700 font-medium ml-1.5">{taunt.message}</span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                {new Date(taunt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
