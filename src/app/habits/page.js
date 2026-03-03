'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['✅', '💪', '📚', '🏃', '🧘', '💊', '🚰', '🎯', '📝', '🌅', '😴', '🧹', '🎸', '💻', '🍎', '🏋️'];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemAnim = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function HabitsPage() {
    const [habits, setHabits] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newHabit, setNewHabit] = useState({ name: '', icon: '✅', color: '#6C63FF' });
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [toast, setToast] = useState('');
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const userRes = await fetch('/api/user');
            const userData = await userRes.json();
            if (!userData.user) return;
            setUser(userData.user);

            const habitsRes = await fetch(`/api/habits?userId=${userData.user._id}`);
            const habitsData = await habitsRes.json();
            setHabits(habitsData.habits || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleHabit = async (habitId) => {
        try {
            const res = await fetch('/api/habits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle', habitId, date: today }),
            });
            const data = await res.json();
            setHabits(prev => prev.map(h => h._id === habitId ? data.habit : h));
            showToast('Habit updated! ✨');
        } catch (err) {
            console.error(err);
        }
    };

    const addHabit = async () => {
        if (!newHabit.name.trim()) return;
        try {
            const res = await fetch('/api/habits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newHabit, userId: user._id }),
            });
            const data = await res.json();
            setHabits(prev => [data.habit, ...prev]);
            setNewHabit({ name: '', icon: '✅', color: '#6C63FF' });
            setShowAdd(false);
            showToast('Habit added! 🎉');
        } catch (err) {
            console.error(err);
        }
    };

    const deleteHabit = async (habitId) => {
        try {
            await fetch('/api/habits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', habitId }),
            });
            setHabits(prev => prev.filter(h => h._id !== habitId));
            showToast('Habit deleted');
        } catch (err) {
            console.error(err);
        }
    };

    const getAISuggestion = async () => {
        if (!user) return;
        setAiLoading(true);
        try {
            const res = await fetch('/api/ai/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'habit',
                    userId: user._id,
                    date: today,
                    context: {
                        habits: habits.map(h => ({
                            name: h.name,
                            streak: h.streak,
                            completedToday: h.completions?.find(c => c.date === today)?.completed || false,
                        })),
                    },
                }),
            });
            const data = await res.json();
            setAiSuggestion(data.suggestion || 'No suggestion available');
        } catch (err) {
            setAiSuggestion('Failed to get suggestion. Try again.');
        } finally {
            setAiLoading(false);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2500);
    };

    const completedCount = habits.filter(h => {
        const comp = h.completions?.find(c => c.date === today);
        return comp && comp.completed;
    }).length;

    if (loading) {
        return (
            <div className="page-container flex-center" style={{ minHeight: '80vh' }}>
                <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className="toast"
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        style={{ background: 'rgba(48,209,88,0.15)', border: '1px solid rgba(48,209,88,0.3)' }}
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex-between" style={{ marginBottom: 4 }}>
                    <h1 className="page-title">Habits</h1>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
                        + Add
                    </button>
                </div>
                <p className="page-subtitle">{completedCount}/{habits.length} completed today</p>

                {/* Progress */}
                {habits.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                        <div className="progress-bar" style={{ height: 8 }}>
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${habits.length > 0 ? (completedCount / habits.length) * 100 : 0}%`,
                                    background: 'var(--gradient-green)',
                                }}
                            />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Habit List */}
            <motion.div variants={container} initial="hidden" animate="show" className="flex-col gap-sm">
                {habits.length === 0 ? (
                    <div className="empty-state">
                        <div className="emoji">📋</div>
                        <div className="title">No habits yet</div>
                        <div className="text">Start building your daily routine by adding your first habit.</div>
                        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                            + Add Your First Habit
                        </button>
                    </div>
                ) : (
                    habits.map((habit) => {
                        const comp = habit.completions?.find(c => c.date === today);
                        const isDone = comp && comp.completed;
                        return (
                            <motion.div
                                key={habit._id}
                                variants={itemAnim}
                                className={`habit-item ${isDone ? 'completed' : ''}`}
                                layout
                            >
                                <motion.div
                                    className="habit-check"
                                    onClick={() => toggleHabit(habit._id)}
                                    whileTap={{ scale: 0.85 }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {isDone && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            style={{ fontSize: 14, color: 'white' }}
                                        >
                                            ✓
                                        </motion.span>
                                    )}
                                </motion.div>
                                <span className="habit-name" style={{ textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.6 : 1 }}>
                                    {habit.icon} {habit.name}
                                </span>
                                {habit.streak > 0 && (
                                    <span className="habit-streak">🔥 {habit.streak}</span>
                                )}
                                <button
                                    className="btn btn-icon btn-outline btn-sm"
                                    onClick={() => deleteHabit(habit._id)}
                                    style={{ width: 28, height: 28, fontSize: 12, padding: 0 }}
                                >
                                    ✕
                                </button>
                            </motion.div>
                        );
                    })
                )}
            </motion.div>

            {/* AI Suggestion Button */}
            {habits.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: 20 }}>
                    <button className="btn btn-purple btn-full" onClick={getAISuggestion} disabled={aiLoading}>
                        {aiLoading ? (
                            <span className="flex-center gap-sm">
                                <span className="loading-dots"><span /><span /><span /></span>
                                AI is thinking...
                            </span>
                        ) : (
                            '🤖 Get AI Suggestion'
                        )}
                    </button>

                    <AnimatePresence>
                        {aiSuggestion && (
                            <motion.div
                                className="ai-box"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ marginTop: 16 }}
                            >
                                <div className="ai-box-title">🤖 Habit Coach</div>
                                <div className="ai-box-content">{aiSuggestion}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Add Habit Modal */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAdd(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-handle" />
                            <h2 className="section-title">Add New Habit</h2>

                            <div className="input-group">
                                <label className="label">Habit Name</label>
                                <input
                                    className="input"
                                    placeholder="e.g., Meditate for 10 min"
                                    value={newHabit.name}
                                    onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                                    autoFocus
                                />
                            </div>

                            <div className="input-group">
                                <label className="label">Icon</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {EMOJIS.map(e => (
                                        <button
                                            key={e}
                                            onClick={() => setNewHabit(prev => ({ ...prev, icon: e }))}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                fontSize: 20,
                                                background: newHabit.icon === e ? 'rgba(0,122,255,0.2)' : 'var(--bg-glass)',
                                                border: newHabit.icon === e ? '2px solid var(--accent-blue)' : '1px solid var(--bg-glass-border)',
                                                borderRadius: 10,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-sm" style={{ marginTop: 16 }}>
                                <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                    onClick={addHabit}
                                    disabled={!newHabit.name.trim()}
                                >
                                    Add Habit
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
