import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle, ChevronDown, GraduationCap, Globe, UserPlus, LogIn } from 'lucide-react';
import { collection, getDocs, query, where, doc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db, collections, auth } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { User, UserRole, AppLanguage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../components/Logo';

const Login: React.FC = () => {
    const { login } = useAuth();
    const { t, language, setLanguage, isRTL } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('student');
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
                
                const u = { id: snap.docs[0].id, ...snap.docs[0].data() } as User;

                if (u.mustChangePassword) {
                    setPendingUser(u);
                    setIsSubmitting(false);
                } else {
                    await login(email, password);
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
                    <div className="mt-8 flex p-1.5 bg-secondary-900/5 dark:bg-white/5 rounded-full border border-border shadow-sm mx-auto w-fit">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${language === lang.code ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text'}`}
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
                            className="mb-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold shadow-sm"
                        >
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </motion.div>
                    )}
                    
                    <AnimatePresence mode="wait">
                        {pendingUser ? (
                            <motion.form 
                                key="password-change"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
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
                                >
                                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                                    <span>{t('login.updateAndLogin')}</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setPendingUser(null)}
                                    className="w-full mt-4 text-[10px] font-bold uppercase text-text-secondary tracking-widest hover:text-text transition-all"
                                >
                                    {t('common.cancel')}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="login-form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
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
                                                    onChange={(e) => setRole(e.target.value as UserRole)}
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
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />)}
                                    <span>{isSubmitting ? t('login.verifying') : (isSignUp ? 'Sign Up' : t('login.authenticate'))}</span>
                                </button>
                                
                                <div className="pt-2 text-center">
                                    <button 
                                        type="button"
                                        onClick={() => setIsSignUp(!isSignUp)}
                                        className="text-xs font-semibold text-text-secondary hover:text-primary transition-all"
                                    >
                                        {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-8 pt-6 border-t border-border text-center"
                    >
                        <button 
                            onClick={() => setShowCredentials(!showCredentials)}
                            className="text-xs font-bold text-primary hover:text-primary-hover transition-all flex items-center justify-center gap-2 mx-auto py-2"
                        >
                            {showCredentials ? t('common.close') : t('login.demoAccounts')}
                            <ChevronDown size={14} className={`transition-transform duration-300 ${showCredentials ? 'rotate-180' : ''}`} />
                        </button>
                    </motion.div>

                    <AnimatePresence>
                        {showCredentials && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 max-h-[300px] overflow-y-auto scroll-hide space-y-3"
                            >
                                {availableUsers.map((u) => (
                                    <button 
                                        key={u.id}
                                        onClick={() => fillCredentials(u)}
                                        className="w-full text-left bg-elevated hover:bg-primary-light p-4 rounded-2xl border border-border hover:border-primary/30 transition-all group active:scale-[0.98] shadow-sm flex items-center gap-4"
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${u.role === 'admin' ? 'bg-rose-500' : u.role === 'teacher' ? 'bg-primary' : 'bg-emerald-500'}`}>
                                            {u.role.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-text font-bold text-sm truncate">{u.name}</p>
                                            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">{u.role}</p>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                </div>
            </div>
        </div>
    );
};

export default Login;
