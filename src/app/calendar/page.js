'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
    const [user, setUser] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [summaries, setSummaries] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedSummary, setSelectedSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => { loadData(); }, [monthStr]);

    const loadData = async () => {
        try {
            const userRes = await fetch('/api/user');
            const userData = await userRes.json();
            if (!userData.user) return;
            setUser(userData.user);

            const summaryRes = await fetch(`/api/summary?userId=${userData.user._id}&month=${monthStr}`);
            const summaryData = await summaryRes.json();
            setSummaries(summaryData.summaries || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = () => {
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        const days = [];

        // Empty slots before first day
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null, date: null });
        }

        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const summary = summaries.find(s => s.date === dateStr);
            days.push({ day: d, date: dateStr, summary });
        }

        return days;
    };

    const getStatusColor = (summary) => {
        if (!summary) return null;
        const score = summary.overallScore || 0;
        if (score >= 70) return 'green';
        if (score >= 40) return 'yellow';
        return 'red';
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDay(null);
        setSelectedSummary(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDay(null);
        setSelectedSummary(null);
    };

    const selectDay = (dayObj) => {
        if (!dayObj.day) return;
        setSelectedDay(dayObj.date);
        setSelectedSummary(dayObj.summary || null);
    };

    const days = getDaysInMonth();

    // Month stats
    const totalTrackedDays = summaries.length;
    const avgScore = totalTrackedDays > 0 ? Math.round(summaries.reduce((s, d) => s + (d.overallScore || 0), 0) / totalTrackedDays) : 0;
    const bestDay = summaries.length > 0 ? summaries.reduce((best, s) => (s.overallScore || 0) > (best.overallScore || 0) ? s : best, summaries[0]) : null;
    const totalCalories = summaries.reduce((s, d) => s + (d.caloriesConsumed || 0), 0);

    if (loading) {
        return (
            <div className="page-container flex-center" style={{ minHeight: '80vh' }}>
                <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
        );
    }

    return (
        <div className="page-container">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="page-title">Calendar</h1>
                <p className="page-subtitle">Track your daily progress over time</p>
            </motion.div>

            {/* Month Navigation */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex-between glass-card-sm" style={{ marginBottom: 20 }}>
                <button className="btn btn-outline btn-sm" onClick={prevMonth}>←</button>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{MONTHS[month]} {year}</h3>
                <button className="btn btn-outline btn-sm" onClick={nextMonth}>→</button>
            </motion.div>

            {/* Calendar Grid */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="glass-card" style={{ marginBottom: 20 }}>
                <div className="calendar-grid">
                    {DAYS.map(d => (
                        <div key={d} className="calendar-header-cell">{d}</div>
                    ))}
                    {days.map((dayObj, idx) => (
                        <motion.div
                            key={idx}
                            className={`calendar-day ${!dayObj.day ? 'empty' : ''} ${dayObj.date === today ? 'today' : ''} ${dayObj.date === selectedDay ? 'selected' : ''}`}
                            onClick={() => selectDay(dayObj)}
                            whileTap={dayObj.day ? { scale: 0.9 } : {}}
                            style={{ color: !dayObj.day ? 'transparent' : undefined }}
                        >
                            {dayObj.day || '.'}
                            {dayObj.summary && (
                                <span className={`dot ${getStatusColor(dayObj.summary)}`} />
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex-center gap-md" style={{ marginTop: 16, fontSize: 11, color: 'var(--text-tertiary)' }}>
                    <span className="flex gap-xs" style={{ alignItems: 'center' }}>
                        <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent-green)', display: 'inline-block' }} /> Great
                    </span>
                    <span className="flex gap-xs" style={{ alignItems: 'center' }}>
                        <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent-orange)', display: 'inline-block' }} /> Okay
                    </span>
                    <span className="flex gap-xs" style={{ alignItems: 'center' }}>
                        <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent-red)', display: 'inline-block' }} /> Missed
                    </span>
                </div>
            </motion.div>

            {/* Selected Day Details */}
            {selectedDay && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ marginBottom: 20 }}>
                    <h3 className="section-title" style={{ fontSize: 15 }}>
                        📅 {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>

                    {selectedSummary ? (
                        <div>
                            <div className="grid-2" style={{ marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Score</div>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: selectedSummary.overallScore >= 70 ? 'var(--accent-green)' : selectedSummary.overallScore >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)' }}>
                                        {selectedSummary.overallScore}/100
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Habits</div>
                                    <div style={{ fontSize: 24, fontWeight: 700 }}>
                                        {selectedSummary.habitsCompleted}/{selectedSummary.habitsTotal}
                                    </div>
                                </div>
                            </div>

                            <div className="grid-3" style={{ marginBottom: 12 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Calories</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedSummary.caloriesConsumed}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Income</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-green)' }}>₹{selectedSummary.incomeTotal}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Expenses</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-red)' }}>₹{selectedSummary.expenseTotal}</div>
                                </div>
                            </div>

                            {selectedSummary.aiFeedback && (
                                <div className="ai-box" style={{ padding: 12 }}>
                                    <div className="ai-box-title" style={{ fontSize: 12 }}>🤖 AI Feedback</div>
                                    <div className="ai-box-content" style={{ fontSize: 12 }}>{selectedSummary.aiFeedback}</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: 12 }}>
                            No data recorded for this day.
                        </p>
                    )}
                </motion.div>
            )}

            {/* Monthly Stats */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 className="section-title">Monthly Overview</h3>
                <div className="grid-2">
                    <div className="stat-card">
                        <div className="stat-value">{totalTrackedDays}</div>
                        <div className="stat-label">Days Tracked</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ background: 'var(--gradient-green)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {avgScore}
                        </div>
                        <div className="stat-label">Avg Score</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
