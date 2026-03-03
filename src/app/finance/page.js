'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
const INVESTMENT_TYPES = ['Stocks', 'Mutual Funds', 'Fixed Deposit', 'Crypto', 'Real Estate', 'Gold', 'SIP', 'Other'];

export default function FinancePage() {
    const [user, setUser] = useState(null);
    const [entry, setEntry] = useState(null);
    const [income, setIncome] = useState(0);
    const [incomeSource, setIncomeSource] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddInvestment, setShowAddInvestment] = useState(false);
    const [newExpense, setNewExpense] = useState({ category: 'Food', amount: '', note: '' });
    const [newInvestment, setNewInvestment] = useState({ type: 'Stocks', amount: '', note: '' });
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

            const finRes = await fetch(`/api/finance?userId=${userData.user._id}&date=${today}`);
            const finData = await finRes.json();
            if (finData.entry) {
                setEntry(finData.entry);
                setIncome(finData.entry.income || 0);
                setIncomeSource(finData.entry.incomeSource || '');
                setExpenses(finData.entry.expenses || []);
                setInvestments(finData.entry.investments || []);
                setAiSuggestion(finData.entry.aiSuggestion || '');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const totalInvestments = investments.reduce((s, i) => s + (i.amount || 0), 0);
    const netSavings = income - totalExpenses - totalInvestments;

    const saveData = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await fetch('/api/finance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, date: today, income, incomeSource, expenses, investments }),
            });
            showToast('Data saved! ✅');
        } catch (err) {
            showToast('Error saving');
        } finally {
            setSaving(false);
        }
    };

    const getAISuggestion = async () => {
        if (!user) return;
        setAiLoading(true);
        try {
            await saveData();

            const monthRes = await fetch(`/api/finance?userId=${user._id}&month=${today.substring(0, 7)}`);
            const monthData = await monthRes.json();

            const res = await fetch('/api/ai/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'finance',
                    userId: user._id,
                    date: today,
                    context: {
                        income,
                        expenses,
                        investments,
                        savings: netSavings,
                        monthlyData: monthData.entries?.slice(-7) || [],
                    },
                }),
            });
            const data = await res.json();
            setAiSuggestion(data.suggestion || 'No suggestion available');
        } catch (err) {
            setAiSuggestion('Failed to get suggestion.');
        } finally {
            setAiLoading(false);
        }
    };

    const addExpense = () => {
        if (!newExpense.amount) return;
        setExpenses(prev => [...prev, { ...newExpense, amount: Number(newExpense.amount) }]);
        setNewExpense({ category: 'Food', amount: '', note: '' });
        setShowAddExpense(false);
    };

    const addInvestment = () => {
        if (!newInvestment.amount) return;
        setInvestments(prev => [...prev, { ...newInvestment, amount: Number(newInvestment.amount) }]);
        setNewInvestment({ type: 'Stocks', amount: '', note: '' });
        setShowAddInvestment(false);
    };

    const removeExpense = (idx) => setExpenses(prev => prev.filter((_, i) => i !== idx));
    const removeInvestment = (idx) => setInvestments(prev => prev.filter((_, i) => i !== idx));

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const categoryEmojis = { Food: '🍕', Transport: '🚗', Shopping: '🛍️', Bills: '📃', Entertainment: '🎬', Health: '💊', Education: '📚', Other: '📦' };
    const investEmojis = { Stocks: '📈', 'Mutual Funds': '📊', 'Fixed Deposit': '🏦', Crypto: '₿', 'Real Estate': '🏠', Gold: '🥇', SIP: '💰', Other: '📦' };

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
                <h1 className="page-title">Finance</h1>
                <p className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </motion.div>

            {/* Summary Cards */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="finance-summary-cards">
                <div className="finance-card income">
                    <div className="label" style={{ color: 'var(--text-secondary)' }}>💰 Income</div>
                    <div className="amount">₹{income.toLocaleString()}</div>
                </div>
                <div className="finance-card expense">
                    <div className="label" style={{ color: 'var(--text-secondary)' }}>💸 Expenses</div>
                    <div className="amount">₹{totalExpenses.toLocaleString()}</div>
                </div>
                <div className="finance-card investment">
                    <div className="label" style={{ color: 'var(--text-secondary)' }}>📈 Invested</div>
                    <div className="amount">₹{totalInvestments.toLocaleString()}</div>
                </div>
                <div className="finance-card savings">
                    <div className="label" style={{ color: 'var(--text-secondary)' }}>🏦 Savings</div>
                    <div className="amount" style={{ color: netSavings >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        ₹{netSavings.toLocaleString()}
                    </div>
                </div>
            </motion.div>

            {/* Income Input */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card" style={{ marginBottom: 16 }}>
                <h3 className="section-title" style={{ fontSize: 15 }}>💰 Today&apos;s Income</h3>
                <div className="grid-2">
                    <div className="input-group">
                        <label className="label">Amount (₹)</label>
                        <input className="input" type="number" placeholder="0" value={income || ''} onChange={(e) => setIncome(Number(e.target.value) || 0)} />
                    </div>
                    <div className="input-group">
                        <label className="label">Source</label>
                        <input className="input" placeholder="e.g., Salary" value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)} />
                    </div>
                </div>
            </motion.div>

            {/* Expenses */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ marginBottom: 16 }}>
                <div className="flex-between" style={{ marginBottom: 12 }}>
                    <h3 className="section-title" style={{ fontSize: 15, marginBottom: 0 }}>💸 Expenses</h3>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowAddExpense(true)}>+ Add</button>
                </div>

                {expenses.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: 12 }}>
                        No expenses logged today
                    </p>
                ) : (
                    expenses.map((exp, idx) => (
                        <div key={idx} className="food-item">
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 500 }}>
                                    {categoryEmojis[exp.category] || '📦'} {exp.category}
                                    {exp.note && <span style={{ color: 'var(--text-tertiary)', fontSize: 12, marginLeft: 8 }}>— {exp.note}</span>}
                                </div>
                            </div>
                            <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>₹{exp.amount}</span>
                                <button onClick={() => removeExpense(idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}>✕</button>
                            </div>
                        </div>
                    ))
                )}
            </motion.div>

            {/* Investments */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card" style={{ marginBottom: 16 }}>
                <div className="flex-between" style={{ marginBottom: 12 }}>
                    <h3 className="section-title" style={{ fontSize: 15, marginBottom: 0 }}>📈 Investments</h3>
                    <button className="btn btn-outline btn-sm" onClick={() => setShowAddInvestment(true)}>+ Add</button>
                </div>

                {investments.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: 12 }}>
                        No investments logged today
                    </p>
                ) : (
                    investments.map((inv, idx) => (
                        <div key={idx} className="food-item">
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 500 }}>
                                    {investEmojis[inv.type] || '📦'} {inv.type}
                                    {inv.note && <span style={{ color: 'var(--text-tertiary)', fontSize: 12, marginLeft: 8 }}>— {inv.note}</span>}
                                </div>
                            </div>
                            <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>₹{inv.amount}</span>
                                <button onClick={() => removeInvestment(idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}>✕</button>
                            </div>
                        </div>
                    ))
                )}
            </motion.div>

            {/* Action Buttons */}
            <div className="flex-col gap-sm" style={{ marginTop: 8 }}>
                <button className="btn btn-success btn-full" onClick={saveData} disabled={saving}>
                    {saving ? '💾 Saving...' : '💾 Save Finance Data'}
                </button>
                <button className="btn btn-purple btn-full" onClick={getAISuggestion} disabled={aiLoading}>
                    {aiLoading ? (
                        <span className="flex-center gap-sm">
                            <span className="loading-dots"><span /><span /><span /></span>
                            AI is analyzing...
                        </span>
                    ) : (
                        '🤖 Get Financial Advice'
                    )}
                </button>
            </div>

            {aiSuggestion && (
                <motion.div className="ai-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16 }}>
                    <div className="ai-box-title">🤖 Financial Advisor</div>
                    <div className="ai-box-content">{aiSuggestion}</div>
                </motion.div>
            )}

            {/* Add Expense Modal */}
            <AnimatePresence>
                {showAddExpense && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddExpense(false)}>
                        <motion.div className="modal-content" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-handle" />
                            <h2 className="section-title">Add Expense</h2>
                            <div className="input-group">
                                <label className="label">Category</label>
                                <select className="select" value={newExpense.category} onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}>
                                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{categoryEmojis[c]} {c}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="label">Amount (₹)</label>
                                <input className="input" type="number" placeholder="0" value={newExpense.amount} onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))} autoFocus />
                            </div>
                            <div className="input-group">
                                <label className="label">Note (optional)</label>
                                <input className="input" placeholder="e.g., Lunch at cafe" value={newExpense.note} onChange={(e) => setNewExpense(prev => ({ ...prev, note: e.target.value }))} />
                            </div>
                            <button className="btn btn-primary btn-full" onClick={addExpense} disabled={!newExpense.amount}>Add Expense</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Investment Modal */}
            <AnimatePresence>
                {showAddInvestment && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddInvestment(false)}>
                        <motion.div className="modal-content" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-handle" />
                            <h2 className="section-title">Add Investment</h2>
                            <div className="input-group">
                                <label className="label">Type</label>
                                <select className="select" value={newInvestment.type} onChange={(e) => setNewInvestment(prev => ({ ...prev, type: e.target.value }))}>
                                    {INVESTMENT_TYPES.map(t => <option key={t} value={t}>{investEmojis[t]} {t}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="label">Amount (₹)</label>
                                <input className="input" type="number" placeholder="0" value={newInvestment.amount} onChange={(e) => setNewInvestment(prev => ({ ...prev, amount: e.target.value }))} autoFocus />
                            </div>
                            <div className="input-group">
                                <label className="label">Note (optional)</label>
                                <input className="input" placeholder="e.g., NIFTY 50 index" value={newInvestment.note} onChange={(e) => setNewInvestment(prev => ({ ...prev, note: e.target.value }))} />
                            </div>
                            <button className="btn btn-primary btn-full" onClick={addInvestment} disabled={!newInvestment.amount}>Add Investment</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
