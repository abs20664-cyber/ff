import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Subject } from '../types';
import { db, collections } from '../services/firebase';
import { collection, onSnapshot, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar, 
  Clock, 
  Edit3, 
  Save, 
  X, 
  BookOpen, 
  Briefcase, 
  UserCircle,
  ChevronLeft,
  Camera,
  DollarSign
} from 'lucide-react';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);
<<<<<<< HEAD
  
  // Avatar Picker State
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const DICEBEAR_STYLES = ['lorelei', 'adventurer', 'fun-emoji', 'bottts', 'micah', 'thumbs'];
  const [avatarStyle, setAvatarStyle] = useState('lorelei');
  const [avatarSeed, setAvatarSeed] = useState(id || 'default');
=======
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)

  const isOwnProfile = currentUser?.id === id;
  const isAdmin = currentUser?.role === 'admin';
  const isEconomic = currentUser?.role === 'economic';
  const isRTL = language === 'ar';

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, collections.users, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as User;
          setProfileUser({ ...data, id: docSnap.id });
          setEditData(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubSubjects = onSnapshot(collection(db, collections.subjects), (snap) => {
        const fetchedSubjects = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as Subject));
        setSubjects(fetchedSubjects);
    });

    fetchProfile();
    return () => unsubSubjects();
  }, [id]);

  const handleSave = async () => {
    if (!id || !isOwnProfile) return;
    setSaving(true);
    try {
      const docRef = doc(db, collections.users, id);
      
      // Only save non-credential profile fields
      const profileUpdates = {
        avatar: editData.avatar,
        fieldOfStudy: editData.fieldOfStudy,
        subjectsTaughtIds: editData.subjectsTaughtIds,
        age: editData.age,
        bio: editData.bio
      };

      await updateDoc(docRef, profileUpdates);
      setProfileUser(prev => prev ? { ...prev, ...profileUpdates } : null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const calculateDuration = (timestamp: any) => {
    if (!timestamp) return t('common.justNow');
    const date = timestamp.toDate ? timestamp.toDate() : new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      const remainingMonths = diffMonths % 12;
      return `${diffYears} ${t('profile.years')}${remainingMonths > 0 ? `, ${remainingMonths} ${t('profile.months')}` : ''}`;
    }
    if (diffMonths > 0) {
      const remainingDays = diffDays % 30;
      return `${diffMonths} ${t('profile.months')}${remainingDays > 0 ? `, ${remainingDays} ${t('profile.days')}` : ''}`;
    }
    return `${diffDays} ${t('profile.days')}`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '---';
    const date = timestamp.toDate ? timestamp.toDate() : new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <UserCircle size={64} className="text-institutional-600" />
        <p className="text-institutional-600 font-bold uppercase tracking-widest">User Not Found</p>
        <button onClick={() => navigate(-1)} className="text-primary font-bold flex items-center gap-2">
          <ChevronLeft size={16} /> {t('common.back')}
        </button>
      </div>
    );
  }

<<<<<<< HEAD
  const defaultAvatar = `https://api.dicebear.com/9.x/lorelei/svg?seed=${profileUser.id}`;
  const displayAvatar = (isEditing && editData.avatar) ? editData.avatar : (profileUser.avatar || defaultAvatar);

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Avatar Chooser Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-[200] bg-institutional-950/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-background rounded-[2rem] shadow-2xl max-w-3xl w-full p-6 md:p-8 relative border border-border">
            <button onClick={() => setShowAvatarPicker(false)} className="absolute top-6 right-6 p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-xl transition-all">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black uppercase text-text mb-6">Choose Your Avatar</h3>
            
            <div className="flex gap-4 overflow-x-auto pb-4 mb-6 custom-scrollbar">
              {DICEBEAR_STYLES.map(style => (
                <button 
                  key={style}
                  onClick={() => { setAvatarStyle(style); setAvatarSeed(Math.random().toString(36).substring(7)); }}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all shrink-0 ${avatarStyle === style ? 'bg-primary text-white shadow-lg' : 'bg-muted/30 text-text-secondary hover:bg-muted/50'}`}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8 h-64 overflow-y-auto pr-2 custom-scrollbar">
              {Array.from({ length: 18 }).map((_, i) => {
                const url = `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${avatarSeed}_${i}`;
                return (
                  <button 
                    key={i}
                    onClick={() => {
                        setEditData({ ...editData, avatar: url });
                        setShowAvatarPicker(false);
                    }}
                    className="aspect-square rounded-2xl bg-muted/20 border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all p-2 flex items-center justify-center"
                  >
                    <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-contain" />
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center">
              <button 
                onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}
                className="px-8 py-4 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-accent/90 transition-all shadow-lg"
              >
                Shuffle Generation
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface dark:bg-institutional-800 text-text-secondary hover:text-primary transition-all shadow-sm hover:shadow-md border border-border"
          >
            <ChevronLeft size={24} className={isRTL ? 'rotate-180' : ''} />
          </button>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-text drop-shadow-sm">
              {t('profile.title')}
            </h1>
            <div className="flex items-center gap-3 mt-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <p className="text-[11px] font-bold text-text-secondary uppercase tracking-[0.2em]">User Identity Management</p>
            </div>
          </div>
=======
  return (
    <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-institutional-100 dark:bg-institutional-800 text-institutional-600 hover:text-primary transition-colors"
          >
            <ChevronLeft size={20} className={isRTL ? 'rotate-180' : ''} />
          </button>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-institutional-900 dark:text-institutional-50">
            {t('profile.title')}
          </h1>
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
        </div>
        
        {isOwnProfile && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
<<<<<<< HEAD
            className="group flex flex-col md:flex-row items-center justify-center md:gap-3 px-6 py-4 bg-primary text-institutional-50 rounded-3xl font-black text-[11px] md:text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:bg-primary/95 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Edit3 size={18} className="mb-1 md:mb-0 group-hover:-translate-y-1 transition-transform" />
            <span>{t('profile.editProfile')}</span>
=======
            className="flex items-center gap-2 px-4 py-2 bg-primary text-institutional-50 rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
          >
            <Edit3 size={18} />
            <span className="hidden sm:inline">{t('profile.editProfile')}</span>
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
          </button>
        )}
      </div>

<<<<<<< HEAD
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="card border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/80 to-accent opacity-90"></div>
            <div className="absolute top-0 left-0 w-full h-32 bg-white/10 backdrop-blur-md"></div>
            
            <div className="relative pt-16 pb-8 px-6 flex flex-col items-center">
              <div className="relative inline-block mb-6 group-hover:scale-105 transition-transform duration-500">
                <div className="w-36 h-36 rounded-[2.5rem] bg-surface dark:bg-background flex items-center justify-center shadow-2xl overflow-hidden border-4 border-surface dark:border-background ring-4 ring-primary/20 z-10 relative">
                  <img src={displayAvatar} alt={profileUser.name} className="w-full h-full object-cover" />
                </div>
                {isEditing && (
                  <button 
                    onClick={() => setShowAvatarPicker(true)}
                    className="absolute -bottom-4 right-2 w-12 h-12 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20 hover:rotate-6"
                  >
                    <Camera size={20} />
                  </button>
                )}
              </div>
              
              <h2 className="text-2xl font-black text-text mb-2 text-center drop-shadow-sm">
                {profileUser.name}
              </h2>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Shield size={14} />
                {t(`roles.${profileUser.role}`)}
              </div>

              <div className="w-full mt-8 space-y-4 text-start bg-muted/20 p-5 rounded-3xl border border-border/50">
                <div className="flex items-center gap-4 text-text-secondary group/item">
                  <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center shadow-sm text-primary group-hover/item:scale-110 transition-transform">
                    <Mail size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary/70 mb-0.5">Email Address</p>
                    <p className="text-sm font-bold text-text truncate">{profileUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-text-secondary group/item">
                  <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center shadow-sm text-primary group-hover/item:scale-110 transition-transform">
                    <UserIcon size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary/70 mb-0.5">System ID</p>
                    <p className="text-sm font-bold text-text truncate">{profileUser.id}</p>
                  </div>
                </div>
=======
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface border-2 border-institutional-200 dark:border-institutional-800 rounded-3xl p-6 text-center shadow-sm">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full bg-institutional-100 dark:bg-institutional-800 flex items-center justify-center border-4 border-white dark:border-institutional-900 shadow-xl overflow-hidden">
                {profileUser.avatar ? (
                  <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-institutional-600">
                    {profileUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                )}
              </div>
              {isEditing && (
                <button 
                  onClick={() => {
                    const url = prompt('Enter image URL:', editData.avatar || '');
                    if (url !== null) setEditData({ ...editData, avatar: url });
                  }}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-institutional-50 rounded-full border-4 border-white dark:border-institutional-900 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Camera size={18} />
                </button>
              )}
            </div>
            
            <h2 className="text-xl font-black text-institutional-900 dark:text-institutional-50 mb-1">
              {profileUser.name}
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-institutional-100 dark:bg-institutional-800 text-institutional-600 text-xs font-black uppercase tracking-widest mb-4">
              <Shield size={12} />
              {t(`roles.${profileUser.role}`)}
            </div>

            <div className="space-y-3 text-left" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-3 text-institutional-600 dark:text-institutional-400 text-sm">
                <Mail size={16} className="shrink-0" />
                <span className="truncate">{profileUser.email}</span>
              </div>
              <div className="flex items-center gap-3 text-institutional-600 dark:text-institutional-400 text-sm">
                <Clock size={16} className="shrink-0" />
                <span>{profileUser.id}</span>
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
              </div>
            </div>
          </div>

          {/* Platform Metadata */}
<<<<<<< HEAD
          <div className="bg-gradient-to-br from-surface to-muted/10 border border-border rounded-[2.5rem] p-8 shadow-lg">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text mb-6 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              {t('profile.platformMetadata')}
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-[1.25rem] bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">{t('profile.memberSince')}</p>
                  <p className="text-base font-bold text-text">{formatDate(profileUser.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-[1.25rem] bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/30">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">{t('profile.timeOnPlatform')}</p>
                  <p className="text-base font-bold text-text">{calculateDuration(profileUser.createdAt)}</p>
=======
          <div className="bg-institutional-50 dark:bg-institutional-950/50 border-2 border-institutional-100 dark:border-institutional-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-institutional-600 mb-2">
              {t('profile.platformMetadata')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-institutional-50 dark:bg-institutional-800 flex items-center justify-center text-primary shadow-sm">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-institutional-600 leading-none mb-1">{t('profile.memberSince')}</p>
                  <p className="text-sm font-bold text-institutional-700 dark:text-institutional-300">{formatDate(profileUser.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-institutional-50 dark:bg-institutional-800 flex items-center justify-center text-primary shadow-sm">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-institutional-600 leading-none mb-1">{t('profile.timeOnPlatform')}</p>
                  <p className="text-sm font-bold text-institutional-700 dark:text-institutional-300">{calculateDuration(profileUser.createdAt)}</p>
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Edit Form */}
<<<<<<< HEAD
        <div className="lg:col-span-8 space-y-8">
          {/* Academic Information */}
          <div className="card p-8 md:p-10 border-none shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center shadow-lg shadow-primary/20">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-text uppercase tracking-tight">
                  {t('profile.academicInfo')}
                </h3>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mt-1">Institutional Data Access</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 relative z-10">
              {profileUser.role === 'student' && !isEconomic && (
                <div className="bg-muted/10 p-6 rounded-[2rem] border border-border/50">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-primary mb-3">
=======
        <div className="md:col-span-2 space-y-6">
          {/* Academic Information */}
          <div className="bg-surface border-2 border-institutional-200 dark:border-institutional-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <h3 className="text-lg font-black text-institutional-900 dark:text-institutional-50 uppercase tracking-tight">
                {t('profile.academicInfo')}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {profileUser.role === 'student' && !isEconomic && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-600 mb-2">
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                    {t('profile.fieldOfStudy')}
                  </label>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={editData.fieldOfStudy || ''}
                      onChange={(e) => setEditData({ ...editData, fieldOfStudy: e.target.value })}
                      placeholder={t('profile.fieldPlaceholder')}
<<<<<<< HEAD
                      className="w-full bg-surface p-5 rounded-2xl border-2 border-border font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner text-text"
                    />
                  ) : (
                    <p className="text-text font-black text-xl">
                      {profileUser.fieldOfStudy || <span className="text-text-secondary/50 font-medium italic">Unspecified Target...</span>}
=======
                      className="w-full bg-institutional-100 dark:bg-institutional-800 p-4 rounded-xl border-2 border-institutional-200 dark:border-institutional-700 font-bold focus:border-primary outline-none transition-all"
                    />
                  ) : (
                    <p className="text-institutional-700 dark:text-institutional-300 font-bold text-lg">
                      {profileUser.fieldOfStudy || '---'}
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                    </p>
                  )}
                </div>
              )}

              {profileUser.role === 'teacher' && !isEconomic && (
<<<<<<< HEAD
                <div className="bg-muted/10 p-6 rounded-[2rem] border border-border/50">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                    {t('profile.subjects')}
                  </label>
                  {isEditing ? (
                    <div className="w-full bg-surface p-6 rounded-2xl border-2 border-border font-bold focus:border-primary outline-none max-h-64 overflow-y-auto custom-scrollbar shadow-inner text-text flex flex-col gap-4">
                        {subjects.map(s => (
                            <label key={s.id} className="flex items-center gap-4 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" checked={editData.subjectsTaughtIds?.includes(s.id)} onChange={(e) => {
                                        const newSubjects = e.target.checked 
                                            ? [...(editData.subjectsTaughtIds || []), s.id]
                                            : (editData.subjectsTaughtIds || []).filter(id => id !== s.id);
                                        setEditData({ ...editData, subjectsTaughtIds: newSubjects });
                                    }} className="peer sr-only" />
                                    <div className="w-6 h-6 rounded-lg border-2 border-border peer-checked:bg-primary peer-checked:border-primary transition-all group-hover:border-primary/50"></div>
                                    <svg className="absolute w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <span className="group-hover:text-primary transition-colors text-sm">{s.name}</span>
=======
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-600 mb-2">
                    {t('profile.subjects')}
                  </label>
                  {isEditing ? (
                    <div className="w-full bg-institutional-100 dark:bg-institutional-800 p-4 rounded-xl border-2 border-institutional-200 dark:border-institutional-700 font-bold focus:border-primary outline-none max-h-40 overflow-y-auto">
                        {subjects.map(s => (
                            <label key={s.id} className="flex items-center gap-2">
                                <input type="checkbox" checked={editData.subjectsTaughtIds?.includes(s.id)} onChange={(e) => {
                                    const newSubjects = e.target.checked 
                                        ? [...(editData.subjectsTaughtIds || []), s.id]
                                        : (editData.subjectsTaughtIds || []).filter(id => id !== s.id);
                                    setEditData({ ...editData, subjectsTaughtIds: newSubjects });
                                }} />
                                {s.name}
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                            </label>
                        ))}
                    </div>
                  ) : (
<<<<<<< HEAD
                    <div className="flex flex-wrap gap-2">
                        {profileUser.subjectsTaughtIds?.map(id => {
                            const subj = subjects.find(s => s.id === id);
                            if (!subj) return null;
                            return (
                                <span key={id} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold">
                                    {subj.name}
                                </span>
                            );
                        }) || <span className="text-text-secondary/50 font-medium italic">Unspecified Subjects...</span>}
                    </div>
=======
                    <p className="text-institutional-700 dark:text-institutional-300 font-bold text-lg">
                      {profileUser.subjectsTaughtIds?.map(id => subjects.find(s => s.id === id)?.name).filter(Boolean).join(', ') || '---'}
                    </p>
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                  )}
                </div>
              )}

              {(profileUser.role === 'admin' || isEconomic) && (
<<<<<<< HEAD
                <div className="p-6 bg-warning/5 rounded-[2rem] border-2 border-dashed border-warning/30 flex items-center gap-4">
                  <div className="p-3 bg-warning/20 rounded-full text-warning">
                    <Shield size={24} />
                  </div>
                  <p className="text-warning-hover text-sm font-bold italic">
                    {isEconomic && !isOwnProfile ? "Financial oversight role: Academic data restricted." : "Administrative accounts strictly manage access control. No public academic data associated."}
=======
                <div className="p-4 bg-institutional-50 dark:bg-institutional-900/50 rounded-2xl border border-dashed border-institutional-200 dark:border-institutional-800">
                  <p className="text-institutional-600 text-sm italic">
                    {isEconomic && !isOwnProfile ? "Financial oversight role: Academic data restricted." : "Administrative accounts do not display public academic data."}
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
<<<<<<< HEAD
          <div className="card p-8 md:p-10 border-none shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-muted/20 text-text flex items-center justify-center shadow-inner border border-white/20">
                <Briefcase size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-text uppercase tracking-tight">
                  {t('profile.personalInfo')}
                </h3>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mt-1">Demographics & Bio</p>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="bg-muted/10 p-6 rounded-[2rem] border border-border/50">
                <label className="block text-[10px] font-black uppercase tracking-widest text-primary mb-3">
=======
          <div className="bg-surface border-2 border-institutional-200 dark:border-institutional-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-institutional-100 dark:bg-institutional-800 text-institutional-600 dark:text-institutional-300 flex items-center justify-center">
                <Briefcase size={20} />
              </div>
              <h3 className="text-lg font-black text-institutional-900 dark:text-institutional-50 uppercase tracking-tight">
                {t('profile.personalInfo')}
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-600 mb-2">
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                  {t('profile.age')}
                </label>
                {isEditing ? (
                  <input 
                    type="number"
                    value={editData.age || ''}
                    onChange={(e) => setEditData({ ...editData, age: parseInt(e.target.value) || 0 })}
<<<<<<< HEAD
                    className="w-full sm:w-48 bg-surface p-5 rounded-2xl border-2 border-border font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner text-text"
                  />
                ) : (
                  <p className="text-text font-black text-xl">
                    {profileUser.age ? `${profileUser.age} ${t('profile.years')}` : <span className="text-text-secondary/50 font-medium italic">Unspecified...</span>}
=======
                    className="w-32 bg-institutional-100 dark:bg-institutional-800 p-4 rounded-xl border-2 border-institutional-200 dark:border-institutional-700 font-bold focus:border-primary outline-none transition-all"
                  />
                ) : (
                  <p className="text-institutional-700 dark:text-institutional-300 font-bold text-lg">
                    {profileUser.age ? `${profileUser.age} ${t('profile.years')}` : '---'}
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                  </p>
                )}
              </div>

<<<<<<< HEAD
              <div className="bg-muted/10 p-6 rounded-[2rem] border border-border/50">
                <label className="block text-[10px] font-black uppercase tracking-widest text-primary mb-3">
=======
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-600 mb-2">
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                  {t('profile.bio')}
                </label>
                {isEditing ? (
                  <textarea 
                    value={editData.bio || ''}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder={t('profile.bioPlaceholder')}
<<<<<<< HEAD
                    rows={5}
                    className="w-full bg-surface p-6 rounded-2xl border-2 border-border font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none shadow-inner text-text"
                  />
                ) : (
                  <p className="text-text-secondary leading-relaxed font-medium text-lg min-h-[100px]">
                    {profileUser.bio || <span className="opacity-50 italic">This user hasn't written a biography yet.</span>}
=======
                    rows={4}
                    className="w-full bg-institutional-100 dark:bg-institutional-800 p-4 rounded-xl border-2 border-institutional-200 dark:border-institutional-700 font-bold focus:border-primary outline-none transition-all resize-none"
                  />
                ) : (
                  <p className="text-institutional-600 dark:text-institutional-400 leading-relaxed">
                    {profileUser.bio || '---'}
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons for Editing */}
          {isEditing && (
<<<<<<< HEAD
            <div className="sticky bottom-6 md:static flex flex-col sm:flex-row items-center gap-4 pt-6 z-50 animate-in slide-in-from-bottom-4">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-accent text-white p-5 md:p-6 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-2xl shadow-primary/30"
              >
                {saving ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={22} />
=======
            <div className="sticky bottom-4 md:static flex items-center gap-4 pt-4 z-50">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-institutional-50 p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-primary-hover transition-all disabled:opacity-50 shadow-lg shadow-primary/20 backdrop-blur-sm"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                    {t('profile.saveChanges')}
                  </>
                )}
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditData(profileUser);
                }}
                disabled={saving}
<<<<<<< HEAD
                className="w-full sm:w-auto px-8 py-5 md:py-6 bg-surface text-text rounded-[2rem] font-black uppercase tracking-widest hover:bg-muted transition-all shadow-lg border border-border flex items-center justify-center gap-2"
              >
                <X size={20} />
                Cancel
=======
                className="px-6 py-4 bg-institutional-100 dark:bg-institutional-800 text-institutional-600 dark:text-institutional-300 rounded-2xl font-black uppercase tracking-widest hover:bg-institutional-200 dark:hover:bg-institutional-700 transition-all"
              >
                <X size={20} />
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
