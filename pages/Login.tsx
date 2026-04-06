import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle, ChevronDown, GraduationCap, Globe, UserPlus, LogIn } from 'lucide-react';
import { collection, getDocs, query, where, doc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db, collections, auth } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { User, AppLanguage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../components/Logo';

const Login: React.FC = () => {
    const { login } = useAuth();
    const { t, language, setLanguage, isRTL } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
<<<<<<< HEAD
    const [role, setRole] = useState<any>('student');
=======
    const [role, setRole] = useState<UserRole>('student');
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [showCredentials, setShowCredentials] = useState(false);
    const [pendingUser, setPendingUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snap = await getDocs(collection(db, collections.users));
                const users = snap.docs.map(d => d.data() as User);
                setAvailableUsers(users);
            } catch (e) { console.error("Failed to load users", e); }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, collections.users, userCredential.user.uid), {
                    email,
                    name,
                    role,
                    createdAt: Timestamp.now()
                });
                await login(email, password);
            } else {
                const q = query(collection(db, collections.users), where('email', '==', email));
                const snap = await getDocs(q);
                if (snap.empty) throw new Error("Invalid email or password.");
<<<<<<< HEAD
                
=======

>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                const u = { id: snap.docs[0].id, ...snap.docs[0].data() } as User;

                if (u.mustChangePassword) {
                    setPendingUser(u);
                    setIsSubmitting(false);
                } else {
<<<<<<< HEAD
                    await login(email, password); 
=======
                    await login(email, password);
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                }
            }
        } catch (err: any) {
            setError(err.message || "Authentication failed.");
            setIsSubmitting(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pendingUser) return;
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
<<<<<<< HEAD
        
=======

>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
        setIsSubmitting(true);
        try {
            await updateDoc(doc(db, collections.users, pendingUser.id), {
                password: newPassword,
                mustChangePassword: false
            });
            await login(pendingUser.email, newPassword);
        } catch (err: any) {
            setError("Failed to update password.");
            setIsSubmitting(false);
        }
    };

    const fillCredentials = (u: User) => {
        setEmail(u.email);
        if (u.password) setPassword(u.password);
    };

    const languages: { code: AppLanguage; label: string; flag: string }[] = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'ar', label: 'العربية', flag: '🇩🇿' }
    ];

    return (
<<<<<<< HEAD
        <div className={`min-h-[100dvh] flex items-center justify-center p-6 sm:p-12 bg-body relative overflow-hidden ${isRTL ? 'font-arabic' : ''}`}>
            
            {/* Ambient Background Blobs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none fade-in" style={{ animation: 'blob-drift 20s infinite alternate ease-in-out' }} />
            <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[80px] pointer-events-none fade-in" style={{ animation: 'blob-drift 15s infinite alternate-reverse ease-in-out' }} />

            <div className="w-full max-w-md relative z-10 mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-10 text-center flex flex-col items-center"
                >
                    <div className="mb-6 float">
                        <Logo size="lg" />
                    </div>
                    
                    <h2 className="text-3xl font-display font-bold text-text tracking-tight mb-2">
                        {pendingUser ? t('economic.changePassword') : t('login.welcome')}
                    </h2>
                    <p className="text-text-secondary text-sm font-medium">
                        {pendingUser ? t('login.updatePasswordPrompt') : t('login.enterDetailsPrompt')}
                    </p>

                    {/* Modern Language Pill */}
                    <div className="mt-8 flex p-1.5 bg-elevated rounded-full border border-border shadow-sm mx-auto w-fit">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${language === lang.code ? 'bg-[var(--primary-light)] text-primary shadow-sm' : 'text-text-secondary hover:text-text'}`}
                            >
                                {lang.code}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <div className="glass p-6 sm:p-10 rounded-3xl shadow-strong w-full relative slide-up animation-delay-200">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-4 bg-[var(--color-danger-light)] border border-[var(--color-danger-light)] rounded-xl flex items-center gap-3 text-danger text-sm font-bold shadow-sm"
=======
        <div className={`min-h-screen flex bg-institutional-50 relative overflow-hidden ${isRTL ? 'font-arabic' : ''}`}>
            <div className="w-full flex items-center justify-center p-6 sm:p-12 bg-institutional-50 relative">
                {/* Subtle Background Detail for Right Side */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,#000_0%,transparent_50%)]" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-16"
                    >
                        <div className="flex items-center justify-between mb-12">
                            <Logo size="lg" />

                            {/* Language Switcher - Modern Pill */}
                            <div className="flex p-1 bg-institutional-50 rounded-full border border-institutional-100">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLanguage(lang.code)}
                                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${language === lang.code ? 'bg-institutional-50 text-primary shadow-sm' : 'text-institutional-600 hover:text-institutional-600'}`}
                                    >
                                        {lang.code}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <h2 className="text-4xl font-serif text-institutional-900 tracking-tight leading-tight mb-3">
                            {pendingUser ? t('economic.changePassword') : t('login.welcome')}
                        </h2>
                        <p className="text-institutional-600 text-sm font-medium">
                            {pendingUser ? t('login.updatePasswordPrompt') : t('login.enterDetailsPrompt')}
                        </p>
                    </motion.div>


                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold"
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                        >
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </motion.div>
                    )}
<<<<<<< HEAD
                    
                    <AnimatePresence mode="wait">
                        {pendingUser ? (
                            <motion.form 
=======

                    <AnimatePresence mode="wait">
                        {pendingUser ? (
                            <motion.form
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                                key="password-change"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
<<<<<<< HEAD
                                onSubmit={handlePasswordChange} 
                                className="space-y-5"
                            >
                                <div className="input-wrapper">
                                    <label className="section-title mb-1 block">{t('login.newPassword')}</label>
                                    <div className="relative">
                                        <Lock className={`input-icon ${isRTL ? 'right-4' : 'left-4'}`} size={20} />
                                        <input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder={t('login.minCharacters')} 
                                            className={`input-field ${isRTL ? 'pr-12' : 'pl-12'}`}
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="input-wrapper mt-4">
                                    <label className="section-title mb-1 block">{t('login.confirmPassword')}</label>
                                    <div className="relative">
                                        <Lock className={`input-icon ${isRTL ? 'right-4' : 'left-4'}`} size={20} />
                                        <input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder={t('login.repeatPassword')} 
                                            className={`input-field ${isRTL ? 'pr-12' : 'pl-12'}`}
                                            required 
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="btn-primary w-full mt-6 py-4"
=======
                                onSubmit={handlePasswordChange}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="text-[10px] font-black uppercase text-institutional-600 tracking-[0.2em] mb-2 block px-1">{t('login.newPassword')}</label>
                                    <div className="relative group">
                                        <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-institutional-600 group-focus-within:text-primary transition-colors`} size={20} />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder={t('login.minCharacters')}
                                            className={`w-full bg-institutional-50 ${isRTL ? 'pr-12' : 'pl-12'} p-4 rounded-2xl border-2 border-institutional-100 font-bold focus:border-primary focus:bg-institutional-50 outline-none text-sm transition-all`}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-institutional-600 tracking-[0.2em] mb-2 block px-1">{t('login.confirmPassword')}</label>
                                    <div className="relative group">
                                        <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-institutional-600 group-focus-within:text-primary transition-colors`} size={20} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder={t('login.repeatPassword')}
                                            className={`w-full bg-institutional-50 ${isRTL ? 'pr-12' : 'pl-12'} p-4 rounded-2xl border-2 border-institutional-100 font-bold focus:border-primary focus:bg-institutional-50 outline-none text-sm transition-all`}
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary text-institutional-50 p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                                >
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                                    <span>{t('login.updateAndLogin')}</span>
                                </button>
<<<<<<< HEAD
                                <button 
                                    type="button"
                                    onClick={() => setPendingUser(null)}
                                    className="w-full mt-4 text-[10px] font-bold uppercase text-text-secondary tracking-widest hover:text-text transition-all"
=======
                                <button
                                    type="button"
                                    onClick={() => setPendingUser(null)}
                                    className="w-full text-[10px] font-black uppercase text-institutional-600 tracking-widest hover:text-institutional-600 transition-all"
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                                >
                                    {t('common.cancel')}
                                </button>
                            </motion.form>
                        ) : (
<<<<<<< HEAD
                            <motion.form 
=======
                            <motion.form
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                                key="login-form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
<<<<<<< HEAD
                                onSubmit={handleSubmit} 
                                className="space-y-5"
                            >
                                {isSignUp && (
                                    <>
                                        <div className="input-wrapper">
                                            <label className="section-title mb-1 block">Name</label>
                                            <div className="relative">
                                                <UserPlus className={`input-icon ${isRTL ? 'right-4' : 'left-4'}`} size={18} />
                                                <input 
                                                    type="text" 
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Full Name" 
                                                    className={`input-field ${isRTL ? 'pr-11' : 'pl-11'}`}
                                                    required 
                                                />
                                            </div>
                                        </div>
                                        <div className="input-wrapper mt-4">
                                            <label className="section-title mb-1 block">{t('profile.role')}</label>
                                            <div className="relative">
                                                <GraduationCap className={`input-icon ${isRTL ? 'right-4' : 'left-4'}`} size={18} />
                                                <select 
                                                    value={role}
                                                    onChange={(e) => setRole(e.target.value)}
                                                    className={`input-field appearance-none cursor-pointer ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                                                    required
                                                >
                                                    <option value="student">{t('roles.student')}</option>
                                                    <option value="teacher">{t('roles.teacher')}</option>
                                                    <option value="admin">{t('roles.admin')}</option>
                                                    <option value="economic">{t('roles.economic')}</option>
                                                </select>
                                                <ChevronDown className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-muted pointer-events-none`} size={16} />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="input-wrapper mt-4">
                                    <label className="section-title mb-1 block">{t('login.email')}</label>
                                    <div className="relative">
                                        <Mail className={`input-icon ${isRTL ? 'right-4' : 'left-4'}`} size={18} />
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@institution.edu.dz" 
                                            className={`input-field ${isRTL ? 'pr-11' : 'pl-11'}`}
                                            required 
                                        />
                                    </div>
                                </div>
                                
                                <div className="input-wrapper mt-4">
                                    <label className="section-title mb-1 block">{t('login.password')}</label>
                                    <div className="relative">
                                        <Lock className={`input-icon ${isRTL ? 'right-4' : 'left-4'}`} size={18} />
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••" 
                                            className={`input-field ${isRTL ? 'pr-11' : 'pl-11'}`}
                                            required 
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="btn-primary w-full mt-8 py-3.5"
=======
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <div className="space-y-6">
                                    {isSignUp && (
                                        <>
                                            <div>
                                                <label className="text-xs font-semibold text-institutional-600 dark:text-institutional-400 mb-2 block px-1">Name</label>
                                                <div className="relative group">
                                                    <UserPlus className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-institutional-600 group-focus-within:text-primary transition-colors`} size={20} />
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        placeholder="Full Name"
                                                        className={`w-full bg-institutional-50 ${isRTL ? 'pr-12' : 'pl-12'} p-4 rounded-xl border border-institutional-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all`}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-institutional-600 dark:text-institutional-400 mb-2 block px-1">{t('profile.role')}</label>
                                                <div className="relative group">
                                                    <GraduationCap className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-institutional-600 group-focus-within:text-primary transition-colors`} size={20} />
                                                    <select
                                                        value={role}
                                                        onChange={(e) => setRole(e.target.value as UserRole)}
                                                        className={`w-full bg-institutional-50 ${isRTL ? 'pr-12' : 'pl-12'} p-4 rounded-xl border border-institutional-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all appearance-none cursor-pointer`}
                                                        required
                                                    >
                                                        <option value="student">{t('roles.student')}</option>
                                                        <option value="teacher">{t('roles.teacher')}</option>
                                                        <option value="admin">{t('roles.admin')}</option>
                                                        <option value="economic">{t('roles.economic')}</option>
                                                    </select>
                                                    <ChevronDown className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-institutional-600 pointer-events-none`} size={16} />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <label className="text-xs font-semibold text-institutional-600 mb-2 block px-1">{t('login.email')}</label>
                                        <div className="relative group">
                                            <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-institutional-600 group-focus-within:text-primary transition-colors`} size={20} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@institution.edu.dz"
                                                className={`w-full bg-institutional-50 ${isRTL ? 'pr-12' : 'pl-12'} p-4 rounded-xl border border-institutional-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-institutional-600 mb-2 block px-1">{t('login.password')}</label>
                                        <div className="relative group">
                                            <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-institutional-600 group-focus-within:text-primary transition-colors`} size={20} />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className={`w-full bg-institutional-50 ${isRTL ? 'pr-12' : 'pl-12'} p-4 rounded-xl border border-institutional-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all`}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary text-institutional-50 p-4 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />)}
                                    <span>{isSubmitting ? t('login.verifying') : (isSignUp ? 'Sign Up' : t('login.authenticate'))}</span>
                                </button>
<<<<<<< HEAD
                                
                                <div className="pt-2 text-center">
                                    <button 
                                        type="button"
                                        onClick={() => setIsSignUp(!isSignUp)}
                                        className="text-xs font-semibold text-text-secondary hover:text-primary transition-all"
=======
                                <div className="mt-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => setIsSignUp(!isSignUp)}
                                        className="text-xs font-medium text-institutional-600 hover:text-primary transition-all"
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                                    >
                                        {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

<<<<<<< HEAD
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-8 pt-6 border-t border-border text-center"
                    >
                        <button 
                            onClick={() => setShowCredentials(!showCredentials)}
                            className="text-xs font-semibold text-text-secondary hover:text-primary transition-all flex items-center justify-center gap-2 mx-auto"
=======
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-12 text-center"
                    >
                        <button
                            onClick={() => setShowCredentials(!showCredentials)}
                            className="text-xs font-medium text-institutional-600 hover:text-primary transition-all flex items-center justify-center gap-2 mx-auto py-2"
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                        >
                            {showCredentials ? t('common.close') : t('login.demoAccounts')}
                            <ChevronDown size={14} className={`transition-transform duration-300 ${showCredentials ? 'rotate-180' : ''}`} />
                        </button>
                    </motion.div>

                    <AnimatePresence>
                        {showCredentials && (
<<<<<<< HEAD
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 max-h-[220px] overflow-y-auto scroll-hide space-y-2"
                            >
                                {availableUsers.map((u) => (
                                    <button 
                                        key={u.id}
                                        onClick={() => fillCredentials(u)}
                                        className="w-full text-left bg-elevated hover:bg-[var(--primary-light)] p-3 rounded-xl border border-border hover:border-primary/30 transition-all group flex items-center gap-3"
                                    >
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${u.role === 'admin' ? 'bg-rose-500' : u.role === 'teacher' ? 'bg-primary' : 'bg-emerald-500'}`}>
                                            {u.role.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-text font-bold text-sm truncate">{u.name}</p>
                                            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">{u.role}</p>
=======
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 max-h-[300px] overflow-y-auto scroll-hide space-y-3"
                            >
                                {availableUsers.map((u) => (
                                    <button
                                        key={u.id}
                                        onClick={() => fillCredentials(u)}
                                        className="w-full text-left bg-institutional-50 hover:bg-institutional-50 p-4 rounded-xl border border-institutional-200 transition-all group active:scale-[0.98] shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-institutional-50 shadow-sm ${u.role === 'admin' ? 'bg-rose-500' : u.role === 'teacher' ? 'bg-primary' : 'bg-emerald-500'}`}>
                                                    {u.role.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-institutional-900 font-semibold text-sm">{u.name}</p>
                                                    <p className="text-xs text-institutional-600 capitalize">{u.role}</p>
                                                </div>
                                            </div>
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
<<<<<<< HEAD
                </div>
                
                <div className="mt-10 flex flex-col items-center justify-center gap-3 text-muted">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                        الجمهورية الجزائرية الديمقراطية الشعبية
                    </p>
                    <div className="flex items-center gap-6 opacity-70">
                        <div className="flex items-center gap-2">
                            <Globe size={14} />
                            <span className="text-[11px] font-semibold tracking-wide">MESRS Platform</span>
                        </div>
                        <div className="w-1 h-1 bg-border rounded-full" />
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} />
                            <span className="text-[11px] font-semibold tracking-wide">Secure Access</span>
                        </div>
                    </div>
=======

>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                </div>
            </div>
        </div>
    );
};

export default Login;
