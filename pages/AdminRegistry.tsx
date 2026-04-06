import React, { useEffect, useState, memo, useMemo } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, updateDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db, collections, firebaseConfig } from '../services/firebase';
import { User, UserRole, Subject } from '../types';
import { Trash2, Plus, Settings, Shield, GraduationCap, X, Loader2, ShieldAlert, AlertTriangle, User as UserIcon, DollarSign, Users, Search, Filter } from 'lucide-react';
import { superAdminHardDelete } from '../services/adminTools';
import { useAuth } from '../contexts/AuthContext';
import { usePlatform } from '../contexts/PlatformContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import { Skeleton } from '../components/Skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const getRoleIcon = (role: UserRole) => {
    switch(role) {
        case 'admin': return <ShieldAlert size={14} className="text-danger" />;
        case 'teacher': return <Shield size={14} className="text-primary" />;
        case 'student': return <GraduationCap size={14} className="text-success" />;
        case 'economic': return <DollarSign size={14} className="text-warning" />;
        default: return <AlertTriangle size={14} />;
    }
};

const getRoleBadgeClass = (role: UserRole) => {
    switch(role) {
        case 'admin': return 'badge-danger';
        case 'teacher': return 'badge-primary';
        case 'student': return 'badge-success';
        case 'economic': return 'badge-warning';
        default: return 'badge-muted';
    }
};


const UserRow = memo(({ index, style, data }: { index: number, style: React.CSSProperties, data: any }) => {
    const { users, isMobile, t, navigate, setEditingUser, setIsModalOpen, handleDeleteClick, processingId } = data;
    const u = users[index];

    if (isMobile) {
        return (
            <div style={style} className="px-1 py-2">
                <div className="card p-5 text-start hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${u.role === 'admin' ? 'bg-danger' : (u.role === 'teacher' ? 'bg-primary' : 'bg-emerald-500')}`}>
                            {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-text truncate">{u.name}</p>
                            <p className="text-[11px] font-medium text-text-secondary truncate">{u.email}</p>
                        </div>
                        <div className={`${getRoleBadgeClass(u.role)} shrink-0`}>
                            {getRoleIcon(u.role)}
                            <span>{u.role}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                        <button onClick={() => { setEditingUser(u); setIsModalOpen(true); }} className="btn-ghost flex-col gap-1 py-2 h-auto text-[10px]"><Settings size={14} />{t('admin.manage')}</button>
                        <button onClick={() => navigate(`/profile/${u.id}`)} className="btn-ghost flex-col gap-1 py-2 h-auto text-[10px] text-primary"><UserIcon size={14} />{t('admin.profile')}</button>
                        <button onClick={() => handleDeleteClick(u.id)} className="btn-ghost flex-col gap-1 py-2 h-auto text-[10px] text-danger border-transparent bg-danger/10 hover:bg-danger hover:text-white">
                            {processingId === u.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} {t('common.delete')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={style} className="grid grid-cols-[1.5fr_1.5fr_1fr_0.5fr_140px] px-6 border-b border-border items-center hover:bg-elevated transition-colors text-start group">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${u.role === 'admin' ? 'bg-danger' : (u.role === 'teacher' ? 'bg-primary' : 'bg-emerald-500')}`}>
                    {u.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-sm text-text truncate">{u.name}</span>
            </div>
            <div className="text-[13px] font-medium text-text-secondary truncate pr-4">{u.email}</div>
            <div className="flex items-center">
                <div className={getRoleBadgeClass(u.role)}>
                    {getRoleIcon(u.role)}
                    <span>{u.role}</span>
                </div>
            </div>
            <div className="text-[11px] font-mono text-muted truncate pr-2 opacity-50 group-hover:opacity-100 transition-opacity">{u.id.substring(0, 8)}...</div>
            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => navigate(`/profile/${u.id}`)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-primary hover:bg-[var(--primary-light)] transition-all" title={t('admin.profile')}><UserIcon size={14} /></button>
                <button onClick={() => { setEditingUser(u); setIsModalOpen(true); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text hover:bg-elevated border border-transparent hover:border-border transition-all" title={t('admin.manage')}><Settings size={14} /></button>
                <button onClick={() => handleDeleteClick(u.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-danger hover:bg-danger hover:text-white transition-all shadow-sm">
                    {processingId === u.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
            </div>
        </div>
    );
});

const AdminRegistry: React.FC = () => {
    const { user: currentUser, logout } = useAuth();
    const { isMobile } = usePlatform();
    const { t, isRTL } = useLanguage();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [tempPassword, setTempPassword] = useState<string | null>(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [newSubject, setNewSubject] = useState('');
    const [editData, setEditData] = useState<Partial<User>>({});

    useEffect(() => {
        if (editingUser) {
            setEditData({ ...editingUser });
        } else {
            setEditData({});
        }
    }, [editingUser]);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, collections.users), (snap) => {
            const fetchedUsers = snap.docs
                .map(d => ({ id: d.id, ...d.data() } as any))
                .filter(u => u.status !== 'deleted')
                .map(u => u as User);
            setUsers(fetchedUsers);
            setLoading(false);
        });
        const unsubSubjects = onSnapshot(collection(db, collections.subjects), (snap) => {
            const fetchedSubjects = snap.docs
                .map(d => ({ id: d.id, ...d.data() } as Subject));
            setSubjects(fetchedSubjects);
        });
        return () => { unsub(); unsubSubjects(); };
    }, []);

    const addSubject = async () => {
        if (!newSubject.trim()) return;
        const subjectRef = doc(collection(db, collections.subjects));
        await setDoc(subjectRef, { name: newSubject });
        setNewSubject('');
    };

    const deleteSubject = async (id: string) => {
        await updateDoc(doc(db, collections.subjects, id), { status: 'deleted' });
    };

    const performHardDelete = async (targetUserId: string) => {
        setProcessingId(targetUserId);
        try {
            setUsers(prev => prev.filter(u => u.id !== targetUserId));
            await superAdminHardDelete(targetUserId);
            if (currentUser?.id === targetUserId) {
                alert(t('admin.accountDeleted'));
                logout();
                return;
            }
        } catch (error: any) {
            console.error("Deletion Failed", error);
            alert(t('common.error'));
            const snap = await getDocs(collection(db, collections.users));
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(u => u.status !== 'deleted'));
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteClick = (userId: string) => {
        const isSelf = currentUser?.id === userId;
        const confirmMsg = isSelf ? t('admin.idWarning') : t('admin.deleteUser');
        if (window.confirm(confirmMsg)) performHardDelete(userId);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const role = formData.get('role') as UserRole;
        const subjectsTaughtIds = editData.subjectsTaughtIds || [];
        const id = editingUser ? editingUser.id : (formData.get('id') as string);

        try {
            // Update UI optimistically if possible
            if (editingUser) {
                const updates: any = {};
                if (name !== editingUser.name) updates.name = name;
                if (role !== editingUser.role) updates.role = role;
                if (JSON.stringify(subjectsTaughtIds) !== JSON.stringify(editingUser.subjectsTaughtIds || [])) updates.subjectsTaughtIds = subjectsTaughtIds;
                
                if (email && email !== editingUser.email) {
                    updates.email = email;
                }
                if (password && password.trim() !== '') {
                    updates.password = password;
                }

                if (Object.keys(updates).length > 0) {
                    await updateDoc(doc(db, collections.users, id), updates);
                }
            } else {
                if (!password) throw new Error("Password required");
                

                const secondaryAppName = `SecondaryApp_${Date.now()}`;
                const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
                const secondaryAuth = getAuth(secondaryApp);
                
                try {
                    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
                    const uid = userCredential.user.uid;
                    
                    const newUser = {
                        id: uid,
                        name,
                        email,
                        password,
                        role,
                        subjectsTaughtIds,
                        lastSeen: null,
                        createdAt: Timestamp.now(),
                        accountStatus: 'active',
                        mustChangePassword: role === 'economic'
                    };
                    
                    await setDoc(doc(db, collections.users, uid), newUser);
                    if (role === 'economic') setTempPassword(password);
                    

                    await signOut(secondaryAuth);
                    await deleteApp(secondaryApp);
                } catch (authError: any) {
                    await deleteApp(secondaryApp);
                    throw authError;
                }
            }
            if (role !== 'economic' || editingUser) setIsModalOpen(false);
            setEditingUser(null);
        } catch (error: any) {
            console.error("Save failed", error);
            alert(error.message || t('common.error'));
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  u.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'all' || u.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    const stats = useMemo(() => {
        return {
            total: users.length,
            students: users.filter(u => u.role === 'student').length,
            teachers: users.filter(u => u.role === 'teacher').length,
            staff: users.filter(u => u.role === 'admin' || u.role === 'economic').length,
        };
    }, [users]);

    const pieData = useMemo(() => [
<<<<<<< HEAD
        { name: t('roles.student'), value: stats.students, color: '#10b981' }, 
        { name: t('roles.teacher'), value: stats.teachers, color: '#007A3E' }, 
        { name: t('roles.admin') + ' & ' + t('roles.economic'), value: stats.staff, color: '#f43f5e' }, 
=======
        { name: t('roles.student'), value: stats.students, color: '#10b981' }, // success
        { name: t('roles.teacher'), value: stats.teachers, color: '#3b82f6' }, // primary
        { name: t('roles.admin') + ' / ' + t('roles.economic'), value: stats.staff, color: '#ef4444' }, // danger
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
    ].filter(d => d.value > 0), [stats, t]);

    const itemData = { users: filteredUsers, isMobile, t, navigate, setEditingUser, setIsModalOpen, handleDeleteClick, processingId };

    const renderContent = () => {
        if (loading) {
            return isMobile ? (
                <div className="space-y-4">
<<<<<<< HEAD
                    {[...Array(5)].map((_, i) => <div key={i} className="shimmer h-[160px] w-full rounded-2xl" />)}
                </div>
            ) : (
                <div className="card overflow-hidden">
                     <div className="grid grid-cols-[1.5fr_1.5fr_1fr_0.5fr_140px] p-6 border-b border-border bg-elevated/50 font-bold text-[10px] uppercase tracking-widest text-muted text-start">
=======
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[150px] w-full rounded-2xl" />)}
                </div>
            ) : (
                <div className="card-edu bg-surface dark:bg-institutional-950 border border-institutional-300 dark:border-institutional-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
                     <div className={`grid grid-cols-[1.5fr_1.5fr_1fr_0.5fr_100px] p-6 border-b border-institutional-200 dark:border-institutional-800 bg-institutional-100 dark:bg-institutional-950 font-black text-[10px] uppercase tracking-widest text-institutional-600 text-start`}>
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                        <div>{t('admin.legalName')}</div>
                        <div>{t('admin.email')}</div>
                        <div>{t('admin.permissions')}</div>
                        <div>{t('admin.systemId')}</div>
                        <div className="text-end">{t('admin.manage')}</div>
                    </div>
<<<<<<< HEAD
                    {[...Array(5)].map((_, i) => <div key={i} className="shimmer h-[81px] w-full border-b border-border/50" />)}
=======
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[81px] w-full" />)}
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<<<<<<< HEAD
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="stat-card col-span-1 sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="section-title mb-0">Total Users</h3>
                                <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-primary shadow-sm">
                                    <Users size={14} />
                                </div>
                            </div>
                            <p className="text-3xl font-display text-text">{stats.total}</p>
                        </div>
                        <div className="card p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="section-title mb-0">Students</h3>
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm">
                                    <GraduationCap size={14} />
                                </div>
                            </div>
                            <p className="text-3xl font-display text-text">{stats.students}</p>
                        </div>
                        <div className="card p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="section-title mb-0">Teachers</h3>
                                <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-primary shadow-sm">
                                    <Shield size={14} />
                                </div>
                            </div>
                            <p className="text-3xl font-display text-text">{stats.teachers}</p>
                        </div>
                        <div className="card p-5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="section-title mb-0">Staff</h3>
                                <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-danger shadow-sm">
                                    <ShieldAlert size={14} />
                                </div>
                            </div>
                            <p className="text-3xl font-display text-text">{stats.staff}</p>
                        </div>
                    </div>
                    <div className="card p-6 flex flex-col items-center">
                        <h3 className="section-title self-start mb-0">Role Distribution</h3>
                        <div className="flex-1 w-full min-h-[160px] mx-auto">
=======
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                        <div className="bg-surface dark:bg-institutional-950 border border-institutional-200 dark:border-institutional-800 p-6 rounded-[1.5rem] shadow-soft flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-institutional-600">Total Users</h3>
                                <div className="w-8 h-8 rounded-full bg-institutional-200 dark:bg-institutional-900 flex items-center justify-center text-institutional-600">
                                    <Users size={16} />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-institutional-900 dark:text-institutional-50">{stats.total}</p>
                        </div>
                        <div className="bg-institutional-50 dark:bg-institutional-950 border border-institutional-200 dark:border-institutional-800 p-6 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-institutional-600">Students</h3>
                                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success">
                                    <GraduationCap size={16} />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-institutional-900 dark:text-institutional-50">{stats.students}</p>
                        </div>
                        <div className="bg-institutional-50 dark:bg-institutional-950 border border-institutional-200 dark:border-institutional-800 p-6 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-institutional-600">Teachers</h3>
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <Shield size={16} />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-institutional-900 dark:text-institutional-50">{stats.teachers}</p>
                        </div>
                        <div className="bg-institutional-50 dark:bg-institutional-950 border border-institutional-200 dark:border-institutional-800 p-6 rounded-[1.5rem] shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-institutional-600">Staff</h3>
                                <div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center text-danger">
                                    <ShieldAlert size={16} />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-institutional-900 dark:text-institutional-50">{stats.staff}</p>
                        </div>
                    </div>
                    <div className="bg-surface dark:bg-institutional-950 border border-institutional-200 dark:border-institutional-800 p-6 rounded-[1.5rem] shadow-soft flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-institutional-600 mb-4">Role Distribution</h3>
                        <div className="flex-1 min-h-[200px]">
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
<<<<<<< HEAD
                                        innerRadius={50}
                                        outerRadius={70}
=======
                                        innerRadius={60}
                                        outerRadius={80}
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
<<<<<<< HEAD
                                        contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
=======
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
<<<<<<< HEAD
                <div className="card p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-surface">
                    <div className="input-wrapper w-full md:w-96">
                        <Search size={18} className={`input-icon ${isRTL ? 'right-4' : 'left-4'}`} />
=======
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface dark:bg-institutional-950 border border-institutional-200 dark:border-institutional-800 p-4 rounded-[1.5rem] shadow-soft">
                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-institutional-600" />
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                        <input 
                            type="text" 
                            placeholder="Search by name, email, or ID..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
<<<<<<< HEAD
                            className={`input-field bg-body ${isRTL ? 'pr-11' : 'pl-11'}`}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scroll-hide">
                        <Filter size={16} className="text-muted shrink-0" />
=======
                            className="w-full bg-institutional-50 dark:bg-institutional-950 border border-institutional-200 dark:border-institutional-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-institutional-900 dark:text-institutional-50 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Filter size={16} className="text-institutional-600 shrink-0" />
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                        <div className="flex gap-2">
                            {(['all', 'student', 'teacher', 'admin', 'economic'] as const).map(role => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
<<<<<<< HEAD
                                    className={`px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all shadow-sm ${
                                        roleFilter === role 
                                            ? 'bg-text text-body' 
                                            : 'bg-elevated text-text-secondary hover:text-text border border-border hover:border-text/30'
=======
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                                        roleFilter === role 
                                            ? 'bg-institutional-900 dark:bg-institutional-50 text-institutional-50 dark:text-institutional-900' 
                                            : 'bg-institutional-50 dark:bg-institutional-950 text-institutional-600 hover:bg-institutional-100 dark:hover:bg-institutional-800'
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                                    }`}
                                >
                                    {role === 'all' ? 'All Roles' : t(`roles.${role}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Subject Management */}
<<<<<<< HEAD
                <div className="card p-6">
                    <h3 className="section-title">{t('admin.manageSubjects')}</h3>
                    <div className="flex gap-3 mb-5">
=======
                <div className="bg-surface dark:bg-institutional-950 border border-institutional-200 dark:border-institutional-800 p-6 rounded-[1.5rem] shadow-soft">
                    <h3 className="text-xs font-black uppercase tracking-widest text-institutional-600 mb-4">{t('admin.manageSubjects')}</h3>
                    <div className="flex gap-2 mb-4">
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                        <input 
                            type="text" 
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            placeholder="New subject name..."
<<<<<<< HEAD
                            className="input-field max-w-sm"
                        />
                        <button onClick={addSubject} className="btn-primary px-6 rounded-xl shrink-0"><Plus size={16} /> Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {subjects.map(s => (
                            <div key={s.id} className="inline-flex items-center gap-2 bg-elevated border border-border pl-3 pr-1 py-1 rounded-full text-xs font-semibold text-text shadow-sm">
                                {s.name}
                                <button onClick={() => deleteSubject(s.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-colors"><X size={14} /></button>
=======
                            className="flex-1 bg-institutional-50 dark:bg-institutional-950 border border-institutional-200 dark:border-institutional-800 rounded-xl py-3 px-4 text-sm font-bold text-institutional-900 dark:text-institutional-50 focus:outline-none focus:border-primary transition-colors"
                        />
                        <button onClick={addSubject} className="bg-primary text-institutional-50 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest"><Plus size={16} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {subjects.map(s => (
                            <div key={s.id} className="flex items-center gap-2 bg-institutional-100 dark:bg-institutional-800 px-3 py-1 rounded-full text-xs font-bold">
                                {s.name}
                                <button onClick={() => deleteSubject(s.id)} className="text-danger"><X size={14} /></button>
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                            </div>
                        ))}
                    </div>
                </div>

                {/* Registry List */}
                {isMobile ? (
                    <List
<<<<<<< HEAD
                        height={window.innerHeight - 400}
                        itemCount={filteredUsers.length}
                        itemSize={165}
=======
                        height={window.innerHeight - 400} // Adjust height as needed
                        itemCount={filteredUsers.length}
                        itemSize={180} // Approximate height of a card
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                        width="100%"
                        itemData={itemData}
                    >
                        {UserRow}
                    </List>
                ) : (
<<<<<<< HEAD
                    <div className="card overflow-hidden shadow-strong">
                        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_0.5fr_140px] p-5 lg:px-6 border-b border-border bg-elevated/80 text-[10px] font-bold uppercase tracking-widest text-muted text-start">
=======
                    <div className="academic-card rounded-[1.5rem] overflow-hidden shadow-strong">
                        <div className={`grid grid-cols-[1.5fr_1.5fr_1fr_0.5fr_100px] p-6 border-b border-institutional-200 dark:border-institutional-800 bg-institutional-100 dark:bg-institutional-950 font-black text-[10px] uppercase tracking-widest text-institutional-600 text-start`}>
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                            <div>{t('admin.legalName')}</div>
                            <div>{t('admin.email')}</div>
                            <div>{t('admin.permissions')}</div>
                            <div>{t('admin.systemId')}</div>
                            <div className="text-end">{t('admin.manage')}</div>
                        </div>
                        {filteredUsers.length > 0 ? (
                            <List
<<<<<<< HEAD
                                height={Math.min(filteredUsers.length * 70, window.innerHeight - 350)}
                                itemCount={filteredUsers.length}
                                itemSize={70}
                                width="100%"
                                itemData={itemData}
                                className="no-scrollbar"
=======
                                height={Math.min(filteredUsers.length * 81, window.innerHeight - 400)} // Dynamic height
                                itemCount={filteredUsers.length}
                                itemSize={81} // Height of a row
                                width="100%"
                                itemData={itemData}
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                            >
                                {UserRow}
                            </List>
                        ) : (
<<<<<<< HEAD
                            <div className="p-16 text-center text-muted flex flex-col items-center gap-4 bg-surface">
                                <div className="w-16 h-16 rounded-full bg-elevated border border-border flex items-center justify-center shadow-sm">
                                    <Search size={24} className="opacity-50" />
                                </div>
                                <p className="text-sm font-semibold">{t('admin.registryEmpty')}</p>
=======
                            <div className="p-12 text-center text-institutional-600 text-xs font-black uppercase tracking-widest flex flex-col items-center gap-4">
                                <Search size={32} className="opacity-20" />
                                {t('admin.registryEmpty')}
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
<<<<<<< HEAD
        <div className="fade-in max-w-7xl mx-auto pb-24">
            <div className={`mb-8 flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'}`}>
                <div className="text-start">
                    <h2 className="text-3xl lg:text-4xl font-display text-text">{t('nav.registry')}</h2>
                    <p className="section-title mt-1.5">{t('admin.systemManagement')}</p>
                </div>
                <button 
                    onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                    className={`btn-primary ${isMobile ? 'w-full' : ''}`}
=======
        <div className="fade-in max-w-7xl mx-auto">
            <div className={`mb-8 flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'}`}>
                <div className="text-start">
                    <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-institutional-900 dark:text-institutional-50">{t('nav.registry')} Dashboard</h2>
                    <p className="text-[10px] font-bold text-danger uppercase tracking-widest mt-1">{t('admin.systemManagement')}</p>
                </div>
                <button 
                    onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                    className={`bg-institutional-900 dark:bg-institutional-50 text-institutional-50 dark:text-institutional-900 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 ${isMobile ? 'w-full py-4' : 'px-6 py-3 hover:scale-105 transition-transform'}`}
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                >
                    <Plus size={16} /> {t('admin.addUser')}
                </button>
            </div>

            {renderContent()}

            {isModalOpen && (
<<<<<<< HEAD
                <div className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center ${isMobile ? 'p-0 items-end' : 'p-4'} fade-in`}>
                    <div className={`bg-surface border border-border shadow-2xl relative max-h-[90vh] overflow-y-auto ${isMobile ? 'w-full rounded-t-[2rem] p-6 pb-10 slide-up' : 'max-w-xl w-full p-8 rounded-[2rem] slide-up'}`}>
                        <button onClick={() => setIsModalOpen(false)} className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} w-8 h-8 rounded-full bg-elevated border border-border flex items-center justify-center text-muted hover:text-text transition-colors`}><X size={18} /></button>
                        
                        <h3 className="text-2xl font-display text-text mb-8 pr-10">
                            {editingUser ? t('admin.updateProfile') : t('admin.newAccount')}
                        </h3>
                        
                        {tempPassword ? (
                            <div className="bg-warning/10 border border-warning/30 p-6 rounded-2xl mb-8 text-center slide-up">
                                <p className="section-title text-warning mb-2">{t('economic.tempPassword')}</p>
                                <p className="text-3xl font-display text-text font-mono tracking-wider">{tempPassword}</p>
                                <p className="text-[11px] font-bold text-warning mt-4 uppercase">Copy this password now. It will not be shown again.</p>
                                <button 
                                    onClick={() => { setTempPassword(null); setIsModalOpen(false); }}
                                    className="btn-primary w-full py-3.5 mt-6"
=======
                <div className={`fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center ${isMobile ? 'p-0 items-end' : 'p-4'}`}>
                    <div className={`bg-surface dark:bg-institutional-900 shadow-2xl relative border border-institutional-200 dark:border-institutional-800 max-h-[90vh] overflow-y-auto ${isMobile ? 'w-full rounded-t-[2.5rem] p-6 pb-10' : 'max-w-lg w-full p-10 rounded-[2rem] card-edu'}`}>
                        <button onClick={() => setIsModalOpen(false)} className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-institutional-600`}><X size={24} /></button>
                        <h3 className="text-xl font-black mb-8 uppercase tracking-tight text-institutional-900 dark:text-institutional-50">
                            {editingUser ? t('admin.updateProfile') : t('admin.newAccount')}
                        </h3>
                        {tempPassword ? (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 p-6 rounded-2xl mb-8 text-center animate-in zoom-in-95 duration-300">
                                <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest mb-2">{t('economic.tempPassword')}</p>
                                <p className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono tracking-wider">{tempPassword}</p>
                                <p className="text-[9px] font-bold text-amber-500 mt-4 uppercase">Copy this password now. It will not be shown again.</p>
                                <button 
                                    onClick={() => { setTempPassword(null); setIsModalOpen(false); }}
                                    className="mt-6 w-full bg-amber-600 text-institutional-50 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-700 transition-colors"
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                                >
                                    {t('common.confirm')}
                                </button>
                            </div>
                        ) : (
<<<<<<< HEAD
                            <form onSubmit={handleSave} className="space-y-5 text-start">
                                <div className="space-y-1.5">
                                    <label className="section-title mb-0">{t('admin.legalName')}</label>
                                    <input name="name" defaultValue={editingUser?.name} placeholder="e.g. John Doe" className="input-field" required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="section-title mb-0">{t('admin.email')}</label>
                                        <input name="email" type="email" defaultValue={editingUser?.email} placeholder="name@edu.alg" className="input-field" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="section-title mb-0">{t('admin.passcode')}</label>
                                        <input name="password" type="password" placeholder={editingUser ? "Leave blank to keep" : "••••••••"} className="input-field" required={!editingUser} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="section-title mb-0">{t('admin.permissions')}</label>
                                        <div className="relative">
                                            <select name="role" defaultValue={editingUser?.role || 'student'} className="input-field appearance-none cursor-pointer">
                                                <option value="student">{t('roles.student')}</option>
                                                <option value="teacher">{t('roles.teacher')}</option>
                                                <option value="admin">{t('roles.admin')}</option>
                                                <option value="economic">{t('roles.economic')}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="section-title mb-0">{t('admin.subjects')}</label>
                                        <div className="input-field max-h-40 overflow-y-auto no-scrollbar space-y-2 p-3 bg-body cursor-text">
                                            {subjects.map(s => (
                                                <label key={s.id} className="flex items-center gap-3 p-1 cursor-pointer group">
                                                    <div className="relative flex items-center justify-center">
                                                        <input type="checkbox" name="subjects" value={s.id} checked={editData.subjectsTaughtIds?.includes(s.id) || false} onChange={(e) => {
                                                            const newSubjects = e.target.checked 
                                                                ? [...(editData.subjectsTaughtIds || []), s.id]
                                                                : (editData.subjectsTaughtIds || []).filter(id => id !== s.id);
                                                            setEditData({ ...editData, subjectsTaughtIds: newSubjects });
                                                        }} className="peer appearance-none w-4 h-4 border border-border rounded bg-surface checked:bg-primary checked:border-primary transition-colors" />
                                                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    </div>
                                                    <span className="text-sm font-semibold text-text group-hover:text-primary transition-colors">{s.name}</span>
                                                </label>
                                            ))}
                                            {subjects.length === 0 && <p className="text-xs text-muted italic">No subjects available</p>}
                                        </div>
                                    </div>
                                </div>
                                {editingUser && (
                                    <div className="space-y-1.5">
                                        <label className="section-title mb-0">{t('admin.systemId')}</label>
                                        <input name="id" defaultValue={editingUser?.id} className="input-field opacity-60 cursor-not-allowed bg-body" readOnly required />
                                    </div>
                                )}
                                <button type="submit" className="btn-primary w-full mt-6 py-4">
                                    <Shield size={18} />
                                    {t('admin.confirmChanges')}
                                </button>
                            </form>
=======
                            <form onSubmit={handleSave} className="space-y-4 text-start">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-institutional-600">{t('admin.legalName')}</label>
                                <input name="name" defaultValue={editingUser?.name} placeholder="..." className="w-full bg-institutional-100 dark:bg-institutional-800 p-4 rounded-xl border-2 border-institutional-200 dark:border-institutional-700 font-bold focus:border-primary outline-none" required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-institutional-600">{t('admin.email')}</label>
                                    <input name="email" type="email" defaultValue={editingUser?.email} placeholder="name@edu.alg" className="w-full bg-institutional-100 dark:bg-institutional-800 p-4 rounded-xl border-2 border-institutional-200 dark:border-institutional-700 font-bold focus:border-primary outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-institutional-600">{t('admin.passcode')}</label>
                                    <input name="password" type="password" placeholder={editingUser ? "---" : "***"} className="w-full bg-institutional-100 dark:bg-institutional-800 p-4 rounded-xl border-2 border-institutional-200 dark:border-institutional-700 font-bold focus:border-primary outline-none" required={!editingUser} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-institutional-600">{t('admin.permissions')}</label>
                                    <select name="role" defaultValue={editingUser?.role || 'student'} className="w-full bg-institutional-100 dark:bg-institutional-800 p-4 rounded-xl border-2 border-institutional-200 dark:border-institutional-700 font-bold focus:border-primary outline-none">
                                        <option value="student">{t('roles.student')}</option>
                                        <option value="teacher">{t('roles.teacher')}</option>
                                        <option value="admin">{t('roles.admin')}</option>
                                        <option value="economic">{t('roles.economic')}</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-institutional-600">{t('admin.subjects')}</label>
                                    <div className="w-full bg-institutional-100 dark:bg-institutional-800 p-4 rounded-xl border-2 border-institutional-200 dark:border-institutional-700 font-bold focus:border-primary outline-none max-h-40 overflow-y-auto">
                                        {subjects.map(s => (
                                            <label key={s.id} className="flex items-center gap-2">
                                                <input type="checkbox" name="subjects" value={s.id} checked={editData.subjectsTaughtIds?.includes(s.id) || false} onChange={(e) => {
                                                    const newSubjects = e.target.checked 
                                                        ? [...(editData.subjectsTaughtIds || []), s.id]
                                                        : (editData.subjectsTaughtIds || []).filter(id => id !== s.id);
                                                    setEditData({ ...editData, subjectsTaughtIds: newSubjects });
                                                }} />
                                                {s.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {editingUser && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-institutional-600">{t('admin.systemId')}</label>
                                    <input name="id" defaultValue={editingUser?.id} placeholder="ID_000" className="w-full bg-institutional-100 dark:bg-institutional-800 p-4 rounded-xl border-2 border-institutional-200 dark:border-institutional-700 font-bold outline-none opacity-50" readOnly required />
                                </div>
                            )}
                            <button type="submit" className="w-full bg-institutional-900 dark:bg-institutional-50 text-institutional-50 dark:text-institutional-900 p-4 rounded-xl font-black uppercase tracking-widest shadow-xl mt-4">{t('admin.confirmChanges')}</button>
                        </form>
>>>>>>> b2a5dce9 (feat: initialize project structure with core layout, authentication, and notification systems)
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRegistry;
