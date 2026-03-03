'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreRing from '@/components/ScoreRing';

export default function SummaryPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('daily');
    const [dailySummary, setDailySummary] = useState(null);
    const [monthlySummaries, setMonthlySummaries] = useState([]);
    const [sleepHours, setSleepHours] = useState('');
    const [wakeUpTime, setWakeUpTime] = useState('');
    const [bedTime, setBedTime] = useState('');
    const [generating, setGenerating] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [toast, setToast] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const userRes = await fetch('/api/user');
            const userData = await userRes.json();
            if (!userData.user) return;
            setUser(userData.user);
            const userId = userData.user._id;

            const [dailyRes, monthlyRes] = await Promise.all([
                fetch(`/api/summary?userId=${userId}&date=${today}`),
                fetch(`/api/summary?userId=${userId}&month=${currentMonth}`),
            ]);

            const [dailyData, monthlyData] = await Promise.all([dailyRes.json(), monthlyRes.json()]);

            if (dailyData.summary) {
                setDailySummary(dailyData.summary);
                setSleepHours(dailyData.summary.sleepHours || '');
                setWakeUpTime(dailyData.summary.wakeUpTime || '');
                setBedTime(dailyData.summary.bedTime || '');
            }
            setMonthlySummaries(monthlyData.summaries || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generateDailySummary = async () => {
        if (!user) return;
        setGenerating(true);
        try {
            const res = await fetch('/api/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    date: today,
                    sleepHours: Number(sleepHours) || 0,
                    wakeUpTime,
                    bedTime,
                }),
            });
            const data = await res.json();
            setDailySummary(data.summary);
            showToastMsg('Summary generated! 📊');
        } catch (err) {
            showToastMsg('Error generating summary');
        } finally {
            setGenerating(false);
        }
    };

    const getAIFeedback = async () => {
        if (!user || !dailySummary) return;
        setAiLoading(true);
        try {
            const res = await fetch('/api/ai/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'daily_summary',
                    userId: user._id,
                    date: today,
                    context: {
                        userProfile: { weight: user.weight, height: user.height, gender: user.gender, age: user.age },
                        habitsCompleted: dailySummary.habitsCompleted,
                        habitsTotal: dailySummary.habitsTotal,
                        dietTotals: {
                            calories: dailySummary.caloriesConsumed,
                            protein: dailySummary.proteinConsumed,
                            carbs: dailySummary.carbsConsumed,
                            fat: dailySummary.fatConsumed,
                        },
                        goals: user.goals,
                        income: dailySummary.incomeTotal,
                        expenses: dailySummary.expenseTotal,
                        investments: dailySummary.investmentTotal,
                        sleepHours: dailySummary.sleepHours,
                        wakeUpTime: dailySummary.wakeUpTime,
                        bedTime: dailySummary.bedTime,
                        waterIntake: dailySummary.waterIntake,
                    },
                }),
            });
            const data = await res.json();
            setDailySummary(prev => ({ ...prev, aiFeedback: data.suggestion }));
            showToastMsg('AI feedback received! 🤖');
        } catch (err) {
            showToastMsg('Error getting feedback');
        } finally {
            setAiLoading(false);
        }
    };

    const showToastMsg = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    // Monthly aggregates
    const monthlyAvgScore = monthlySummaries.length > 0
        ? Math.round(monthlySummaries.reduce((s, d) => s + (d.overallScore || 0), 0) / monthlySummaries.length)
        : 0;
    const monthlyTotalCalories = monthlySummaries.reduce((s, d) => s + (d.caloriesConsumed || 0), 0);
    const monthlyTotalIncome = monthlySummaries.reduce((s, d) => s + (d.incomeTotal || 0), 0);
    const monthlyTotalExpense = monthlySummaries.reduce((s, d) => s + (d.expenseTotal || 0), 0);
    const monthlyAvgSleep = monthlySummaries.length > 0
        ? (monthlySummaries.reduce((s, d) => s + (d.sleepHours || 0), 0) / monthlySummaries.length).toFixed(1)
        : 0;
    const totalHabitsCompleted = monthlySummaries.reduce((s, d) => s + (d.habitsCompleted || 0), 0);

    if (loading) {
        return (
            <div className="page-container flex-center" style={{ minHeight: '80vh' }}>
                <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
        );
    }

    return (
        <div className="page-container">
            <AnimatePresence>
                {toast && (
                    <motion.div className="toast" initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
                        style={{ background: 'rgba(48,209,88,0.15)', border: '1px solid rgba(48,209,88,0.3)' }}>
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="page-title">Summary</h1>
                <p className="page-subtitle">Your progress at a glance</p>
            </motion.div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>Daily</button>
                <button className={`tab ${activeTab === 'monthly' ? 'active' : ''}`} onClick={() => setActiveTab('monthly')}>Monthly</button>
            </div>

            {activeTab === 'daily' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Sleep/Timing Input */}
                    <div className="glass-card" style={{ marginBottom: 16 }}>
                        <h3 className="section-title" style={{ fontSize: 15 }}>😴 Sleep & Timing</h3>
                        <div className="grid-3">
                            <div className="input-group">
                                <label className="label">Sleep (hrs)</label>
                                <input className="input" type="number" step="0.5" placeholder="8" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="label">Wake Up</label>
                                <input className="input" type="time" value={wakeUpTime} onChange={(e) => setWakeUpTime(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="label">Bed Time</label>
                                <input className="input" type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Generate Summary Button */}
                    <button className="btn btn-primary btn-full" onClick={generateDailySummary} disabled={generating} style={{ marginBottom: 16 }}>
                        {generating ? '📊 Generating...' : '📊 Generate Today\'s Summary'}
                    </button>

                    {dailySummary && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                            {/* Score */}
                            <div className="flex-center" style={{ marginBottom: 20 }}>
                                <ScoreRing score={dailySummary.overallScore || 0} size={140} strokeWidth={10} />
                            </div>

                            {/* Detail Cards */}
                            <div className="grid-2" style={{ marginBottom: 16 }}>
                                <div className="stat-card">
                                    <div style={{ fontSize: 20, marginBottom: 4 }}>✅</div>
                                    <div className="stat-value" style={{ fontSize: 20 }}>
                                        {dailySummary.habitsCompleted}/{dailySummary.habitsTotal}
                                    </div>
                                    <div className="stat-label">Habits</div>
                                </div>
                                <div className="stat-card">
                                    <div style={{ fontSize: 20, marginBottom: 4 }}>🔥</div>
                                    <div className="stat-value" style={{ fontSize: 20, background: 'var(--gradient-orange)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        {dailySummary.caloriesConsumed}
                                    </div>
                                    <div className="stat-label">Calories</div>
                                </div>
                                <div className="stat-card">
                                    <div style={{ fontSize: 20, marginBottom: 4 }}>💪</div>
                                    <div className="stat-value" style={{ fontSize: 20, background: 'var(--gradient-purple)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        {dailySummary.proteinConsumed}g
                                    </div>
                                    <div className="stat-label">Protein</div>
                                </div>
                                <div className="stat-card">
                                    <div style={{ fontSize: 20, marginBottom: 4 }}>💧</div>
                                    <div className="stat-value" style={{ fontSize: 20, background: 'var(--gradient-teal)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        {dailySummary.waterIntake}L
                                    </div>
                                    <div className="stat-label">Water</div>
                                </div>
                            </div>

                            <div className="grid-3" style={{ marginBottom: 16 }}>
                                <div className="stat-card" style={{ padding: 12 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>😴 Sleep</div>
                                    <div style={{ fontSize: 18, fontWeight: 700 }}>{dailySummary.sleepHours}h</div>
                                </div>
                                <div className="stat-card" style={{ padding: 12 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>💰 Income</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-green)' }}>₹{dailySummary.incomeTotal}</div>
                                </div>
                                <div className="stat-card" style={{ padding: 12 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>💸 Spent</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-red)' }}>₹{dailySummary.expenseTotal}</div>
                                </div>
                            </div>

                            {/* Get AI Feedback */}
                            <button className="btn btn-purple btn-full" onClick={getAIFeedback} disabled={aiLoading} style={{ marginBottom: 16 }}>
                                {aiLoading ? (
                                    <span className="flex-center gap-sm">
                                        <span className="loading-dots"><span /><span /><span /></span>
                                        AI analyzing your day...
                                    </span>
                                ) : (
                                    '🤖 Get AI Day Feedback & Suggestions'
                                )}
                            </button>

                            {dailySummary.aiFeedback && (
                                <motion.div className="ai-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="ai-box-title">🤖 AI Daily Review</div>
                                    <div className="ai-box-content">{dailySummary.aiFeedback}</div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            )}

            {activeTab === 'monthly' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="glass-card" style={{ marginBottom: 16 }}>
                        <h3 className="section-title" style={{ fontSize: 15 }}>
                            📅 {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>

                        <div className="flex-center" style={{ marginBottom: 20 }}>
                            <ScoreRing score={monthlyAvgScore} size={120} strokeWidth={8} />
                        </div>

                        <div className="grid-2" style={{ gap: 8 }}>
                            <div className="stat-card" style={{ padding: 10 }}>
                                <div className="stat-value" style={{ fontSize: 18 }}>{monthlySummaries.length}</div>
                                <div className="stat-label">Days Tracked</div>
                            </div>
                            <div className="stat-card" style={{ padding: 10 }}>
                                <div className="stat-value" style={{ fontSize: 18 }}>{totalHabitsCompleted}</div>
                                <div className="stat-label">Habits Done</div>
                            </div>
                            <div className="stat-card" style={{ padding: 10 }}>
                                <div className="stat-value" style={{ fontSize: 18 }}>{monthlyAvgSleep}h</div>
                                <div className="stat-label">Avg Sleep</div>
                            </div>
                            <div className="stat-card" style={{ padding: 10 }}>
                                <div className="stat-value" style={{ fontSize: 18, background: 'var(--gradient-orange)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {Math.round(monthlyTotalCalories / Math.max(monthlySummaries.length, 1))}
                                </div>
                                <div className="stat-label">Avg Calories</div>
                            </div>
                        </div>
                    </div>

                    {/* Finance Monthly Summary */}
                    <div className="glass-card" style={{ marginBottom: 16 }}>
                        <h3 className="section-title" style={{ fontSize: 15 }}>💰 Monthly Finance</h3>
                        <div className="grid-3">
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Total Income</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-green)' }}>₹{monthlyTotalIncome.toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Total Expenses</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-red)' }}>₹{monthlyTotalExpense.toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Net Savings</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: (monthlyTotalIncome - monthlyTotalExpense) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                    ₹{(monthlyTotalIncome - monthlyTotalExpense).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Daily Log */}
                    {monthlySummaries.length > 0 && (
                        <div>
                            <h3 className="section-title">Daily Log</h3>
                            <div className="flex-col gap-sm">
                                {[...monthlySummaries].reverse().map((s, idx) => (
                                    <motion.div
                                        key={s._id}
                                        className="glass-card-sm flex-between"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>
                                                {new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                                {s.habitsCompleted}/{s.habitsTotal} habits · {s.caloriesConsumed} cal · 😴 {s.sleepHours}h
                                            </div>
                                        </div>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 18,
                                            background: s.overallScore >= 70 ? 'rgba(48,209,88,0.15)' : s.overallScore >= 40 ? 'rgba(255,159,10,0.15)' : 'rgba(255,69,58,0.15)',
                                            color: s.overallScore >= 70 ? 'var(--accent-green)' : s.overallScore >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 13, fontWeight: 700,
                                        }}>
                                            {s.overallScore}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
