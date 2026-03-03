'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ScoreRing from '@/components/ScoreRing';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [dietEntry, setDietEntry] = useState(null);
  const [financeEntry, setFinanceEntry] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userRes = await fetch('/api/user');
      const userData = await userRes.json();

      if (!userData.authenticated) {
        router.push('/login');
        return;
      }

      if (!userData.user || userData.user.weight === 0 || userData.user.age === 0) {
        router.push('/onboarding');
        return;
      }

      setUser(userData.user);
      const userId = userData.user._id;

      const [habitsRes, dietRes, financeRes, summaryRes] = await Promise.all([
        fetch(`/api/habits?userId=${userId}`),
        fetch(`/api/diet?userId=${userId}&date=${today}`),
        fetch(`/api/finance?userId=${userId}&date=${today}`),
        fetch(`/api/summary?userId=${userId}&date=${today}`),
      ]);

      const [habitsData, dietData, financeData, summaryData] = await Promise.all([
        habitsRes.json(),
        dietRes.json(),
        financeRes.json(),
        summaryRes.json(),
      ]);

      setHabits(habitsData.habits || []);
      setDietEntry(dietData.entry);
      setFinanceEntry(financeData.entry);
      setSummary(summaryData.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex-center" style={{ minHeight: '80vh' }}>
        <div className="flex-col flex-center gap-md">
          <div className="spinner" style={{ width: 32, height: 32 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading your data...</p>
        </div>
      </div>
    );
  }

  const completedHabits = habits.filter(h => {
    const comp = h.completions?.find(c => c.date === today);
    return comp && comp.completed;
  }).length;

  const habitPercent = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0;
  const caloriesConsumed = dietEntry?.totals?.calories || 0;
  const caloriesGoal = user?.goals?.calories || 2000;
  const caloriesPercent = Math.min(Math.round((caloriesConsumed / caloriesGoal) * 100), 100);
  const proteinConsumed = dietEntry?.totals?.protein || 0;
  const proteinGoal = user?.goals?.protein || 50;

  const totalExpenses = financeEntry?.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
  const totalIncome = financeEntry?.income || 0;
  const totalInvestments = financeEntry?.investments?.reduce((s, i) => s + i.amount, 0) || 0;

  const overallScore = summary?.overallScore || Math.round(
    (habitPercent * 0.4) + (caloriesPercent * 0.3) + (totalIncome > 0 ? 15 : 0) + 15
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="page-container">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Header */}
        <motion.div variants={item} className="flex-between" style={{ marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{greeting()} 👋</p>
            <h1 className="page-title">{user?.name || 'User'}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <ScoreRing score={overallScore} size={80} strokeWidth={6} />
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={item} className="grid-2" style={{ marginBottom: 20 }}>
          <Link href="/habits" style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div style={{ fontSize: 24, marginBottom: 4 }}>✅</div>
              <div className="stat-value" style={{ background: 'var(--gradient-green)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {completedHabits}/{habits.length}
              </div>
              <div className="stat-label">Habits Done</div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div className="progress-fill" style={{ width: `${habitPercent}%`, background: 'var(--gradient-green)' }} />
              </div>
            </div>
          </Link>

          <Link href="/diet" style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div style={{ fontSize: 24, marginBottom: 4 }}>🔥</div>
              <div className="stat-value" style={{ background: 'var(--gradient-orange)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {caloriesConsumed}
              </div>
              <div className="stat-label">Calories / {caloriesGoal}</div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div className="progress-fill" style={{ width: `${caloriesPercent}%`, background: 'var(--gradient-orange)' }} />
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={item} className="grid-2" style={{ marginBottom: 20 }}>
          <Link href="/diet" style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div style={{ fontSize: 24, marginBottom: 4 }}>💪</div>
              <div className="stat-value" style={{ background: 'var(--gradient-purple)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {proteinConsumed}g
              </div>
              <div className="stat-label">Protein / {proteinGoal}g</div>
              <div className="progress-bar" style={{ marginTop: 8 }}>
                <div className="progress-fill" style={{ width: `${Math.min(Math.round((proteinConsumed / proteinGoal) * 100), 100)}%`, background: 'var(--gradient-purple)' }} />
              </div>
            </div>
          </Link>

          <Link href="/finance" style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div style={{ fontSize: 24, marginBottom: 4 }}>💰</div>
              <div className="stat-value" style={{ background: 'var(--gradient-teal)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ₹{totalIncome - totalExpenses}
              </div>
              <div className="stat-label">Net Today</div>
            </div>
          </Link>
        </motion.div>

        {/* Today's Habits Quick View */}
        <motion.div variants={item} style={{ marginBottom: 20 }}>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>Today&apos;s Habits</h3>
            <Link href="/habits" style={{ color: 'var(--accent-blue)', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
              See All →
            </Link>
          </div>
          {habits.length === 0 ? (
            <div className="glass-card-sm" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No habits yet. <Link href="/habits" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Add one!</Link></p>
            </div>
          ) : (
            <div className="flex-col gap-sm">
              {habits.slice(0, 4).map((habit) => {
                const comp = habit.completions?.find(c => c.date === today);
                const isDone = comp && comp.completed;
                return (
                  <motion.div
                    key={habit._id}
                    className={`habit-item ${isDone ? 'completed' : ''}`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="habit-check">
                      {isDone && <span style={{ fontSize: 14 }}>✓</span>}
                    </div>
                    <span className="habit-name">
                      {habit.icon} {habit.name}
                    </span>
                    {habit.streak > 0 && (
                      <span className="habit-streak">
                        🔥 {habit.streak}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} style={{ marginBottom: 20 }}>
          <h3 className="section-title">Quick Actions</h3>
          <div className="grid-2">
            <Link href="/diet" style={{ textDecoration: 'none' }}>
              <motion.div className="glass-card-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🍽️</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Log Meal</div>
              </motion.div>
            </Link>
            <Link href="/finance" style={{ textDecoration: 'none' }}>
              <motion.div className="glass-card-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>💸</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Log Expense</div>
              </motion.div>
            </Link>
            <Link href="/calendar" style={{ textDecoration: 'none' }}>
              <motion.div className="glass-card-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Calendar</div>
              </motion.div>
            </Link>
            <Link href="/summary" style={{ textDecoration: 'none' }}>
              <motion.div className="glass-card-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Summary</div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* AI Feedback from summary */}
        {summary?.aiFeedback && (
          <motion.div variants={item} className="ai-box" style={{ marginBottom: 20 }}>
            <div className="ai-box-title">🤖 Today&apos;s AI Feedback</div>
            <div className="ai-box-content">{summary.aiFeedback}</div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
