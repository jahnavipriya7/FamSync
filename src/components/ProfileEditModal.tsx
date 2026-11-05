import React, { useState, useEffect } from 'react';
import { MemberProfile, FamilyGroup, Language } from '../types/stepRace';
import { 
  validateMemberName, 
  validateNickname, 
  validateGroupName 
} from '../utils/validation';
import { getMemberDisplayName } from '../utils/stepRaceStorage';
import { X, User, Shield, Check, AlertCircle, Crown, Smile, Sparkles } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMemberId: string;
  members: MemberProfile[];
  group: FamilyGroup;
  lang: Language;
  onSaveMember: (updatedMember: MemberProfile) => void;
  onSaveAllMembers: (updatedMembers: MemberProfile[]) => void;
  onSaveGroup: (updatedGroup: FamilyGroup) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const AVATAR_PRESETS = ['👩‍🏫', '👨‍💼', '👵', '🧑‍💻', '👧', '🏃', '🏃‍♀️', '🚴', '🧘', '⚡', '🌟', '👑', '🦁', '🐯', '🦅', '🌸', '🏆'];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentMemberId,
  members,
  group,
  lang,
  onSaveMember,
  onSaveAllMembers,
  onSaveGroup,
  onShowToast
}) => {
  const currentMember = members.find(m => m.id === currentMemberId) || members[0];
  const isAdmin = currentMemberId === group.adminMemberId;

  // Active member profile form state
  const [name, setName] = useState(currentMember?.name || '');
  const [nickname, setNickname] = useState(currentMember?.nickname || '');
  const [avatar, setAvatar] = useState(currentMember?.avatar || '🏃');
  const [nameError, setNameError] = useState('');
  const [nickError, setNickError] = useState('');

  // Admin group form state
  const [groupName, setGroupName] = useState(group.name);
  const [groupReward, setGroupReward] = useState(group.customReward);
  const [groupGoal, setGroupGoal] = useState(group.dailyStepGoal);
  const [selectedAdminId, setSelectedAdminId] = useState(group.adminMemberId);
  const [groupNameError, setGroupNameError] = useState('');

  // Admin edit other member state
  const [adminTargetMemberId, setAdminTargetMemberId] = useState(members[0]?.id || '');
  const [adminTargetName, setAdminTargetName] = useState('');
  const [adminTargetNickname, setAdminTargetNickname] = useState('');
  const [adminTargetAvatar, setAdminTargetAvatar] = useState('🏃');
  const [adminMemberError, setAdminMemberError] = useState('');

  // Reset form when modal opens or active member changes
  useEffect(() => {
    if (currentMember) {
      setName(currentMember.name);
      setNickname(currentMember.nickname || '');
      setAvatar(currentMember.avatar);
      setNameError('');
      setNickError('');
    }
    setGroupName(group.name);
    setGroupReward(group.customReward);
    setGroupGoal(group.dailyStepGoal);
    setSelectedAdminId(group.adminMemberId);
    setGroupNameError('');

    if (members.length > 0) {
      const target = members[0];
      setAdminTargetMemberId(target.id);
      setAdminTargetName(target.name);
      setAdminTargetNickname(target.nickname || '');
      setAdminTargetAvatar(target.avatar);
      setAdminMemberError('');
    }
  }, [isOpen, currentMemberId, currentMember, group, members]);

  // When admin selects a different member to edit
  const handleAdminSelectMember = (memberId: string) => {
    setAdminTargetMemberId(memberId);
    const target = members.find(m => m.id === memberId);
    if (target) {
      setAdminTargetName(target.name);
      setAdminTargetNickname(target.nickname || '');
      setAdminTargetAvatar(target.avatar);
      setAdminMemberError('');
    }
  };

  if (!isOpen) return null;

  // Save active member profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const nameVal = validateMemberName(name);
    if (!nameVal.valid) {
      setNameError(nameVal.error || 'Invalid name');
      return;
    }
    const nickVal = validateNickname(nickname);
    if (!nickVal.valid) {
      setNickError(nickVal.error || 'Invalid nickname');
      return;
    }

    const updated: MemberProfile = {
      ...currentMember,
      name: nameVal.sanitizedValue,
      nickname: nickVal.sanitizedValue,
      avatar: avatar.trim() || '🏃'
    };

    onSaveMember(updated);
    onShowToast(
      lang === 'te' 
        ? 'మీ ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది!' 
        : 'Profile updated! Changes reflected everywhere.', 
      'success'
    );
  };

  // Save group settings (Admin only)
  const handleSaveGroupSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const groupVal = validateGroupName(groupName);
    if (!groupVal.valid) {
      setGroupNameError(groupVal.error || 'Invalid group name');
      return;
    }

    const updatedGroup: FamilyGroup = {
      ...group,
      name: groupVal.sanitizedValue,
      customReward: groupReward.trim() || group.customReward,
      dailyStepGoal: Number(groupGoal) || 10000,
      adminMemberId: selectedAdminId
    };

    onSaveGroup(updatedGroup);
    onShowToast(
      lang === 'te'
        ? 'కుటుంబ గ్రూప్ సెట్టింగ్‌లు భద్రపరచబడ్డాయి!'
        : 'Family group settings saved successfully!',
      'success'
    );
  };

  // Admin saves another member's profile
  const handleAdminSaveOtherMember = (e: React.FormEvent) => {
    e.preventDefault();
    const nameVal = validateMemberName(adminTargetName);
    if (!nameVal.valid) {
      setAdminMemberError(nameVal.error || 'Invalid name');
      return;
    }
    const nickVal = validateNickname(adminTargetNickname);
    if (!nickVal.valid) {
      setAdminMemberError(nickVal.error || 'Invalid nickname');
      return;
    }

    const updatedList = members.map(m => {
      if (m.id === adminTargetMemberId) {
        return {
          ...m,
          name: nameVal.sanitizedValue,
          nickname: nickVal.sanitizedValue,
          avatar: adminTargetAvatar.trim() || m.avatar
        };
      }
      return m;
    });

    onSaveAllMembers(updatedList);
    onShowToast(
      lang === 'te'
        ? `${nameVal.sanitizedValue} వివరాలు నవీకరించబడ్డాయి!`
        : `Updated member profile for ${nameVal.sanitizedValue}!`,
      'success'
    );
    setAdminMemberError('');
  };

  const adminName = getMemberDisplayName(members, group.adminMemberId, 'Family Admin');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-xl">
              ⚙️
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-xl sm:text-2xl font-black text-slate-900">
                {lang === 'te' ? 'ప్రొఫైల్ & గ్రూప్ సెట్టింగ్‌లు' : 'Profile & Family Group Settings'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {lang === 'te' 
                  ? 'పేర్లు, నిక్‌నేమ్‌లు మరియు అవతార్‌లను మార్చండి. పాత రికార్డులు సురక్షితంగా ఉంటాయి.'
                  : 'Customize display names, nicknames, and avatars without losing past history.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-8 mt-6">
          {/* SECTION 1: ACTIVE MEMBER PROFILE */}
          <section className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {lang === 'te' ? 'నా ప్రొఫైల్ (యాక్టివ్ వాకర్)' : 'My Profile (Active Walker)'}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-brand-100 text-brand-800">
                ID: {currentMember.id}
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {lang === 'te' ? 'డిస్‌ప్లే పేరు (2-30 అక్షరాలు)' : 'Display Name (2-30 characters)'} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  maxLength={30}
                  className={`w-full px-4 py-2.5 rounded-xl border font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                    nameError ? 'border-rose-400 ring-rose-300' : 'border-slate-300 focus:ring-brand-500'
                  }`}
                  placeholder="e.g. Amma, Padma Sundaram"
                />
                {nameError && (
                  <p className="flex items-center gap-1 text-xs text-rose-600 font-bold mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {nameError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {lang === 'te' ? 'నిక్‌నేమ్ (ఐచ్ఛికం, గరిష్టం 20)' : 'Nickname (Optional, max 20 chars)'}
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => {
                    setNickname(e.target.value);
                    if (nickError) setNickError('');
                  }}
                  maxLength={20}
                  className={`w-full px-4 py-2.5 rounded-xl border font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                    nickError ? 'border-rose-400 ring-rose-300' : 'border-slate-300 focus:ring-brand-500'
                  }`}
                  placeholder="e.g. SuperMom, Speedster, Rocket"
                />
                {nickError && (
                  <p className="flex items-center gap-1 text-xs text-rose-600 font-bold mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {nickError}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'te' 
                    ? 'నిక్‌నేమ్ బ్రాకెట్లలో ప్రదర్శించబడుతుంది, ఉదా. "పద్మ (SuperMom)"'
                    : 'Nickname is shown in parentheses alongside your name, e.g. "Padma (SuperMom)".'}
                </p>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {lang === 'te' ? 'అవతార్ ఐకాన్ ఎంచుకోండి' : 'Choose Avatar Icon'}
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {AVATAR_PRESETS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAvatar(emoji)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        avatar === emoji 
                          ? 'bg-brand-600 text-white scale-110 shadow-md ring-2 ring-brand-300' 
                          : 'bg-white hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {lang === 'te' ? 'లేదా అనుకూల ఎమోజి టైప్ చేయండి:' : 'Or custom emoji:'}
                  </span>
                  <input
                    type="text"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    maxLength={4}
                    className="w-16 px-2 py-1 text-center text-lg rounded-lg border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {lang === 'te' ? 'నా ప్రొఫైల్ సేవ్ చేయి' : 'Save My Profile'}
                </button>
              </div>
            </form>
          </section>

          {/* SECTION 2: FAMILY GROUP & ADMIN SETTINGS */}
          <section className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {lang === 'te' ? 'కుటుంబ గ్రూప్ & అడ్మిన్ నిర్వహణ' : 'Family Group & Admin Controls'}
                </h3>
              </div>
              {isAdmin ? (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-900">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  {lang === 'te' ? 'మీరు అడ్మిన్' : 'You are Admin'}
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-200 text-slate-700">
                  Admin: {adminName}
                </span>
              )}
            </div>

            {isAdmin ? (
              <form onSubmit={handleSaveGroupSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {lang === 'te' ? 'కుటుంబ గ్రూప్ పేరు (2-50 అక్షరాలు)' : 'Family Group Name (2-50 chars)'} *
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={e => {
                      setGroupName(e.target.value);
                      if (groupNameError) setGroupNameError('');
                    }}
                    maxLength={50}
                    className={`w-full px-4 py-2.5 rounded-xl border font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                      groupNameError ? 'border-rose-400 ring-rose-300' : 'border-slate-300 focus:ring-brand-500'
                    }`}
                  />
                  {groupNameError && (
                    <p className="flex items-center gap-1 text-xs text-rose-600 font-bold mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {groupNameError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {lang === 'te' ? 'డైలీ విన్నర్ రివార్డ్ వివరణ' : 'Daily Winner Reward Description'}
                  </label>
                  <input
                    type="text"
                    value={groupReward}
                    onChange={e => setGroupReward(e.target.value)}
                    maxLength={100}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g. Winner chooses dinner and gets tea served!"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {lang === 'te' ? 'రోజువారీ స్టెప్స్ లక్ష్యం' : 'Daily Step Goal'}
                    </label>
                    <input
                      type="number"
                      step={500}
                      min={5000}
                      max={30000}
                      value={groupGoal}
                      onChange={e => setGroupGoal(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {lang === 'te' ? 'గ్రూప్ అడ్మిన్ హోదా బదిలీ' : 'Transfer Admin Privileges'}
                    </label>
                    <select
                      value={selectedAdminId}
                      onChange={e => setSelectedAdminId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.avatar} {m.name} {m.nickname ? `(${m.nickname})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    {lang === 'te' ? 'గ్రూప్ సెట్టింగ్‌లు సేవ్ చేయి' : 'Save Group Settings'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{lang === 'te' ? 'గ్రూప్ పేరు:' : 'Group Name:'}</span>
                  <span className="font-bold text-slate-900">{group.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{lang === 'te' ? 'రోజువారీ రివార్డ్:' : 'Daily Reward:'}</span>
                  <span className="font-bold text-slate-900 text-right max-w-xs">{group.customReward}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{lang === 'te' ? 'గ్రూప్ అడ్మిన్:' : 'Group Admin:'}</span>
                  <span className="font-bold text-amber-800">{adminName}</span>
                </div>
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                  {lang === 'te' 
                    ? 'గ్రూప్ పేరు మరియు ఇతర సభ్యుల పేర్లను మార్చడానికి అడ్మిన్ అనుమతి అవసరం.'
                    : 'To change family group settings or rename other members, please switch to the Admin profile.'}
                </p>
              </div>
            )}
          </section>

          {/* SECTION 3: ADMIN MEMBER RENAMING TOOL (ADMIN ONLY) */}
          {isAdmin && (
            <section className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  {lang === 'te' ? 'ఇతర కుటుంబ సభ్యుల పేర్లను మార్చండి' : 'Admin: Rename Any Member'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                {lang === 'te'
                  ? 'అడ్మిన్‌గా మీరు పిల్లల లేదా పెద్దల ప్రొఫైల్ పేర్లు మరియు అవతార్‌లను నేరుగా నవీకరించవచ్చు.'
                  : 'As the group admin, you can edit display names and nicknames for any family member.'}
              </p>

              <form onSubmit={handleAdminSaveOtherMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {lang === 'te' ? 'సభ్యుడిని ఎంచుకోండి' : 'Select Family Member'}
                  </label>
                  <select
                    value={adminTargetMemberId}
                    onChange={e => handleAdminSelectMember(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.avatar} {m.name} {m.nickname ? `(${m.nickname})` : ''} - {m.relation}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {lang === 'te' ? 'సభ్యుడి పేరు' : 'Member Display Name'} *
                    </label>
                    <input
                      type="text"
                      value={adminTargetName}
                      onChange={e => setAdminTargetName(e.target.value)}
                      maxLength={30}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {lang === 'te' ? 'సభ్యుడి నిక్‌నేమ్' : 'Member Nickname'}
                    </label>
                    <input
                      type="text"
                      value={adminTargetNickname}
                      onChange={e => setAdminTargetNickname(e.target.value)}
                      maxLength={20}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Avatar selection for targeted member */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {lang === 'te' ? 'సభ్యుడి అవతార్ ఐకాన్' : 'Member Avatar Icon'}
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {AVATAR_PRESETS.slice(0, 10).map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAdminTargetAvatar(emoji)}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                          adminTargetAvatar === emoji 
                            ? 'bg-purple-600 text-white scale-110 shadow-md ring-2 ring-purple-300' 
                            : 'bg-white hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {adminMemberError && (
                  <p className="flex items-center gap-1 text-xs text-rose-600 font-bold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {adminMemberError}
                  </p>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    {lang === 'te' ? 'ఈ సభ్యుడిని నవీకరించు' : 'Update Member Profile'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow transition-colors"
          >
            {lang === 'te' ? 'పూర్తయింది' : 'Done & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
