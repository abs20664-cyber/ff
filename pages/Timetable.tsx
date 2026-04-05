import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, where, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db, collections } from '../services/firebase';
import { RecurringSession, DAYS_OF_WEEK, HOURS_OF_DAY, User, Group } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, X, Trash2, CalendarCheck, Clock, MapPin, Loader2, User as UserIcon } from 'lucide-react';

const Timetable: React.FC = () => {
    const { user } = useAuth();
    const { t, isRTL } = useLanguage();
    
    const [sessions, setSessions] = useState<RecurringSession[]>([]);
    const [linkedTeachers, setLinkedTeachers] = useState<string[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    
    // Modal state for Economic users
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch teachers list once for the dropdown (only needed for economic or admin, but cheap enough to just grab)
        if (user?.role === 'economic' || user?.role === 'admin') {
            const qTeachers = query(collection(db, collections.users), where('role', '==', 'teacher'));
            getDocs(qTeachers).then(snap => {
                setTeachers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
            });
        }
    }, [user?.role]);

    useEffect(() => {
        let unsubSessions: () => void;
        let unsubGroups: () => void;

        const loadSessions = (allowedTeacherIds: string[] | null) => {
            unsubSessions = onSnapshot(collection(db, 'recurring_sessions'), (snap) => {
                let allSessions = snap.docs.map(d => ({ id: d.id, ...d.data() } as RecurringSession));
                
                // Filter logic
                if (user?.role === 'student' && allowedTeacherIds) {
                    allSessions = allSessions.filter(s => allowedTeacherIds.includes(s.teacherId));
                } else if (user?.role === 'teacher') {
                    allSessions = allSessions.filter(s => s.teacherId === user.id);
                }
                
                setSessions(allSessions);
                setLoading(false);
            });
        };

        if (user?.role === 'student') {
            // Find which teachers this student is linked to via groups
            const qGroups = query(collection(db, 'groups'), where('participantIds', 'array-contains', user.id));
            unsubGroups = onSnapshot(qGroups, (snap) => {
                const groups = snap.docs.map(d => d.data() as Group);
                const teacherIds = Array.from(new Set(groups.map(g => g.creatorId)));
                setLinkedTeachers(teacherIds);
                // Reload sessions with explicit linked teachers to avoid race condition delays
                loadSessions(teacherIds);
            });
        } else {
            // Economic, Admin, Teacher
            loadSessions(null);
        }

        return () => {
            if (unsubSessions) unsubSessions();
            if (unsubGroups) unsubGroups();
        };
    }, [user?.role, user?.id]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to remove this recurring session?")) return;
        try {
            await deleteDoc(doc(db, 'recurring_sessions', id));
        } catch (error) {
            console.error(error);
            alert("Error removing session");
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData(e.currentTarget);
            
            const teacherId = formData.get('teacherId') as string;
            const selectedTeacher = teachers.find(t => t.id === teacherId);
            
            const data: Omit<RecurringSession, 'id'> = {
                name: formData.get('name') as string,
                dayOfWeek: formData.get('dayOfWeek') as string,
                startTime: formData.get('startTime') as string,
                endTime: formData.get('endTime') as string,
                room: formData.get('room') as string,
                type: formData.get('type') as any,
                teacherId: teacherId,
                teacherName: selectedTeacher?.name || 'Unknown Faculty'
            };
            
            await addDoc(collection(db, 'recurring_sessions'), data);
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Failed to add session");
        } finally {
            setIsSaving(false);
        }
    };

    const getSessionForSlot = (day: string, hour: string) => {
        return sessions.find(s => s.dayOfWeek === day && s.startTime === hour);
    };

    if (loading && user?.role === 'student') {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="fade-in max-w-7xl mx-auto px-4 xl:px-0">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-10">
                <div className="text-start">
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase text-text leading-none flex items-center gap-4">
                        <CalendarCheck size={40} className="text-primary hidden md:block" /> 
                        Global Timetable
                    </h2>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <p className="text-[11px] font-black text-text-secondary uppercase tracking-[0.3em]">
                            {user?.role === 'student' ? 'Your Associated Classes' : 
                             user?.role === 'teacher' ? 'Your Scheduled Program' : 
                             'Institutional Weekly Programming'}
                        </p>
                    </div>
                </div>
                {user?.role === 'economic' && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="group bg-primary text-institutional-50 px-8 py-5 rounded-3xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:bg-primary/90 hover:scale-[1.03] active:scale-95 transition-all"
                    >
                        <Plus size={20} className="transition-transform group-hover:rotate-90" /> Add Session
                    </button>
                )}
            </div>

            {/* Timetable Grid */}
            <div className="bg-surface dark:bg-background border border-border rounded-[2.5rem] overflow-hidden shadow-xl p-4 md:p-8 overflow-x-auto scroll-smooth custom-scrollbar">
                <table className="w-full text-start border-collapse min-w-[800px]">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-surface dark:bg-background border-b border-border">
                            <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-text-secondary text-center w-24">Time Blocks</th>
                            {DAYS_OF_WEEK.map(day => (
                                <th key={day} className="px-4 py-6 text-[11px] font-black uppercase tracking-widest text-text text-center border-l border-border/50">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {HOURS_OF_DAY.map(hour => (
                            <tr key={hour} className="hover:bg-muted/5 transition-colors">
                                <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-primary text-center align-top relative">
                                    <div className="absolute top-4 left-0 right-0 border-t border-dashed border-border/50 pointer-events-none" />
                                    <span className="bg-surface dark:bg-background px-2 relative z-10">{hour}</span>
                                </td>
                                {DAYS_OF_WEEK.map(day => {
                                    const session = getSessionForSlot(day, hour);
                                    return (
                                        <td key={`${day}-${hour}`} className="p-2 border-l border-border/50 align-top min-w-[160px] h-24">
                                            {session ? (
                                                <div className="h-full bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-2xl p-4 transition-all relative group cursor-default shadow-sm hover:shadow-md">
                                                    <div className="text-start">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="badge-primary !py-0.5 !px-2 text-[9px] uppercase tracking-wider">{session.type}</span>
                                                            {user?.role === 'economic' && (
                                                                <button 
                                                                    onClick={() => handleDelete(session.id)}
                                                                    className="text-text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-all ml-2"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <h4 className="font-extrabold text-xs text-text leading-tight mb-2 line-clamp-2">{session.name}</h4>
                                                        
                                                        <div className="space-y-1 mt-auto">
                                                            <p className="text-[10px] font-bold text-text-secondary flex items-center gap-1.5 truncate">
                                                                <Clock size={10} className="text-primary/70" /> {session.startTime} - {session.endTime}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-text-secondary flex items-center gap-1.5 truncate">
                                                                <MapPin size={10} className="text-primary/70" /> {session.room}
                                                            </p>
                                                            {(user?.role === 'economic' || user?.role === 'student' || user?.role === 'admin') && (
                                                                <p className="text-[10px] font-bold text-text-secondary flex items-center gap-1.5 truncate">
                                                                    <UserIcon size={10} className="text-primary/70" /> {session.teacherName}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full w-full rounded-2xl border border-transparent hover:border-dashed hover:border-border/80 transition-all flex items-center justify-center text-border/20 hover:text-border/80">
                                                    <Plus size={16} />
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Economic Add Modal */}
            {isModalOpen && user?.role === 'economic' && (
                <div className="fixed inset-0 z-[200] bg-institutional-950/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
                    <div className="bg-sidebar rounded-[2rem] md:rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] max-w-2xl w-full p-6 md:p-12 relative overflow-hidden border border-border max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => setIsModalOpen(false)} className={`absolute top-6 md:top-10 ${isRTL ? 'left-6 md:left-10' : 'right-6 md:right-10'} p-3 bg-background rounded-2xl text-text-secondary hover:text-danger transition-all border border-border`}><X size={24} /></button>
                        
                        <div className="text-start mb-8 md:mb-12 pr-12">
                            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-text">New Session</h3>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mt-2">Initialize Recurring Institutional Block</p>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8 text-start">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest px-2">Session Subject / Title</label>
                                <input name="name" placeholder="e.g. Advanced Mathematics" className="w-full bg-background p-5 rounded-3xl border border-border font-bold focus:border-primary outline-none shadow-inner transition-all text-text" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest px-2">Assigned Teacher</label>
                                <select name="teacherId" className="w-full bg-background p-5 rounded-3xl border border-border font-bold outline-none shadow-inner cursor-pointer appearance-none text-text" required>
                                    <option value="" disabled selected>Select Faculty Member</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest px-2">Day of the Week</label>
                                    <select name="dayOfWeek" className="w-full bg-background p-5 rounded-3xl border border-border font-bold outline-none shadow-inner cursor-pointer appearance-none text-text" required>
                                        {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest px-2">Assigned Hall/Room</label>
                                    <input name="room" placeholder="e.g. Hall A1" className="w-full bg-background p-5 rounded-3xl border border-border font-bold outline-none shadow-inner text-text" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest px-2">Start Block</label>
                                    <select name="startTime" className="w-full bg-background p-5 rounded-3xl border border-border font-bold outline-none shadow-inner cursor-pointer appearance-none text-text">
                                        {HOURS_OF_DAY.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest px-2">End Block</label>
                                    <select name="endTime" className="w-full bg-background p-5 rounded-3xl border border-border font-bold outline-none shadow-inner cursor-pointer appearance-none text-text">
                                        {HOURS_OF_DAY.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest px-2">Session Form Factor</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['Cours', 'TD', 'Exam'].map(tp => (
                                        <label key={tp} className="relative group cursor-pointer">
                                            <input type="radio" name="type" value={tp} defaultChecked={tp === 'Cours'} className="peer hidden" />
                                            <div className="p-5 text-center rounded-3xl border-2 border-border font-black text-[11px] uppercase tracking-widest peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all group-hover:border-primary/50 text-text-secondary">
                                                {tp}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={isSaving} className="w-full bg-primary text-institutional-50 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(99,102,241,0.3)] hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                                {isSaving && <Loader2 size={18} className="animate-spin" />}
                                {isSaving ? 'REGISTERING...' : 'REGISTER SESSION'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Timetable;
