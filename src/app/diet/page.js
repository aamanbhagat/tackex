'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const COMMON_FOODS = [
    { name: 'Rice (1 cup)', calories: 206, protein: 4, carbs: 45, fat: 0.4, fiber: 0.6, sugar: 0, vitamins: { B1: 0.2, B3: 2.3 }, minerals: { iron: 1.9, magnesium: 24 } },
    { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, vitamins: { B3: 13, B6: 0.6 }, minerals: { iron: 1, zinc: 1, potassium: 256 } },
    { name: 'Egg (1 large)', calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, sugar: 0, vitamins: { A: 80, B12: 0.5, D: 1 }, minerals: { iron: 0.9, calcium: 28, zinc: 0.7 } },
    { name: 'Dal/Lentils (1 cup)', calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 15, sugar: 3, vitamins: { B1: 0.3, B6: 0.4, C: 3 }, minerals: { iron: 6.6, magnesium: 71, potassium: 731, zinc: 2.5 } },
    { name: 'Milk (1 cup)', calories: 103, protein: 8, carbs: 12, fat: 2.4, fiber: 0, sugar: 12, vitamins: { A: 149, B12: 1.2, D: 2.9 }, minerals: { calcium: 305, potassium: 366 } },
    { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14, vitamins: { B6: 0.4, C: 10 }, minerals: { potassium: 422, magnesium: 32 } },
    { name: 'Paneer (100g)', calories: 265, protein: 18, carbs: 1, fat: 21, fiber: 0, sugar: 0, vitamins: { A: 82, B12: 0.9 }, minerals: { calcium: 476, potassium: 100 } },
    { name: 'Roti (1 medium)', calories: 104, protein: 3, carbs: 18, fat: 3, fiber: 1.5, sugar: 0, vitamins: { B1: 0.1, B3: 1 }, minerals: { iron: 1.5, magnesium: 20 } },
    { name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugar: 19, vitamins: { C: 8.4, K: 4 }, minerals: { potassium: 195 } },
    { name: 'Yogurt (1 cup)', calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, sugar: 6, vitamins: { B12: 1.4, B2: 0.5 }, minerals: { calcium: 300, potassium: 573 } },
    { name: 'Oats (1 cup cooked)', calories: 158, protein: 6, carbs: 27, fat: 3.2, fiber: 4, sugar: 1, vitamins: { B1: 0.2, B6: 0.1 }, minerals: { iron: 2.1, magnesium: 56, zinc: 2.3 } },
    { name: 'Salad (mixed greens)', calories: 20, protein: 2, carbs: 3, fat: 0.2, fiber: 2, sugar: 1, vitamins: { A: 200, C: 15, K: 100 }, minerals: { iron: 1, calcium: 40 } },
];

export default function DietPage() {
    const [user, setUser] = useState(null);
    const [entry, setEntry] = useState(null);
    const [meals, setMeals] = useState([]);
    const [waterIntake, setWaterIntake] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddFood, setShowAddFood] = useState(null); // meal index
    const [customFood, setCustomFood] = useState({ name: '', weight: '100' });
    const [foodLookupLoading, setFoodLookupLoading] = useState(false);
    const [foodLookupError, setFoodLookupError] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [mealAiSuggestions, setMealAiSuggestions] = useState({});
    const [dayAiSuggestion, setDayAiSuggestion] = useState('');
    const [finalizing, setFinalizing] = useState(false);
    const [toast, setToast] = useState('');
    const [activeTab, setActiveTab] = useState('meals');
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const userRes = await fetch('/api/user');
            const userData = await userRes.json();
            if (!userData.user) return;
            setUser(userData.user);

            const dietRes = await fetch(`/api/diet?userId=${userData.user._id}&date=${today}`);
            const dietData = await dietRes.json();
            if (dietData.entry) {
                setEntry(dietData.entry);
                setMeals(dietData.entry.meals || []);
                setWaterIntake(dietData.entry.waterIntake || 0);
                setDayAiSuggestion(dietData.entry.aiDaySuggestion || '');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getTotals = () => {
        let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        meals.forEach(meal => {
            meal.foods?.forEach(food => {
                totals.calories += food.calories || 0;
                totals.protein += food.protein || 0;
                totals.carbs += food.carbs || 0;
                totals.fat += food.fat || 0;
                totals.fiber += food.fiber || 0;
            });
        });
        return totals;
    };

    const getVitaminTotals = () => {
        let vitamins = { A: 0, B1: 0, B2: 0, B3: 0, B6: 0, B12: 0, C: 0, D: 0, E: 0, K: 0 };
        meals.forEach(meal => {
            meal.foods?.forEach(food => {
                if (food.vitamins) {
                    Object.keys(vitamins).forEach(v => {
                        vitamins[v] += food.vitamins[v] || 0;
                    });
                }
            });
        });
        return vitamins;
    };

    const getMineralTotals = () => {
        let minerals = { iron: 0, calcium: 0, zinc: 0, magnesium: 0, potassium: 0, sodium: 0 };
        meals.forEach(meal => {
            meal.foods?.forEach(food => {
                if (food.minerals) {
                    Object.keys(minerals).forEach(m => {
                        minerals[m] += food.minerals[m] || 0;
                    });
                }
            });
        });
        return minerals;
    };

    const addMealSlot = (mealType) => {
        setMeals(prev => [...prev, { name: mealType, time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }), foods: [] }]);
    };

    const addFoodToMeal = (mealIndex, food) => {
        setMeals(prev => {
            const updated = [...prev];
            updated[mealIndex] = {
                ...updated[mealIndex],
                foods: [...(updated[mealIndex].foods || []), food],
            };
            return updated;
        });
        setShowAddFood(null);
        setCustomFood({ name: '', weight: '100' });
        setFoodLookupError('');
    };

    const removeFoodFromMeal = (mealIndex, foodIndex) => {
        setMeals(prev => {
            const updated = [...prev];
            updated[mealIndex] = {
                ...updated[mealIndex],
                foods: updated[mealIndex].foods.filter((_, i) => i !== foodIndex),
            };
            return updated;
        });
    };

    const saveMeals = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await fetch('/api/diet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, date: today, meals, waterIntake }),
            });
            showToastMsg('Meals saved! ✅');
        } catch (err) {
            showToastMsg('Error saving');
        } finally {
            setSaving(false);
        }
    };

    const getMealSuggestion = async (mealIndex) => {
        if (!user) return;
        setAiLoading(true);
        try {
            // Save first
            await saveMeals();

            const res = await fetch('/api/ai/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'diet_meal',
                    userId: user._id,
                    date: today,
                    context: {
                        userProfile: { weight: user.weight, height: user.height, gender: user.gender, age: user.age, activityLevel: user.activityLevel },
                        meal: meals[mealIndex],
                        dayTotals: getTotals(),
                        goals: user.goals,
                    },
                }),
            });
            const data = await res.json();
            setMealAiSuggestions(prev => ({ ...prev, [mealIndex]: data.suggestion || 'No suggestion' }));
        } catch (err) {
            setMealAiSuggestions(prev => ({ ...prev, [mealIndex]: 'Failed to get suggestion' }));
        } finally {
            setAiLoading(false);
        }
    };

    const finalizeDayAndGetSummary = async () => {
        if (!user) return;
        setFinalizing(true);
        try {
            // Save meals first
            await fetch('/api/diet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, date: today, meals, waterIntake, isDayFinalized: true }),
            });

            // Get AI day summary
            const res = await fetch('/api/ai/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'diet_day',
                    userId: user._id,
                    date: today,
                    context: {
                        userProfile: { weight: user.weight, height: user.height, gender: user.gender, age: user.age },
                        meals: meals,
                        dayTotals: getTotals(),
                        goals: user.goals,
                    },
                }),
            });
            const data = await res.json();
            setDayAiSuggestion(data.suggestion || 'Summary not available');
            showToastMsg('Day finalized! 🎉');
        } catch (err) {
            showToastMsg('Error finalizing day');
        } finally {
            setFinalizing(false);
        }
    };

    const showToastMsg = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const totals = getTotals();
    const vitamins = getVitaminTotals();
    const minerals = getMineralTotals();
    const goals = user?.goals || {};

    // Vitamin daily recommended values (approximate)
    const vitaminDV = { A: 900, B1: 1.2, B2: 1.3, B3: 16, B6: 1.7, B12: 2.4, C: 90, D: 20, E: 15, K: 120 };
    const mineralDV = { iron: 18, calcium: 1000, zinc: 11, magnesium: 400, potassium: 4700, sodium: 2300 };

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
                <h1 className="page-title">Diet & Nutrition</h1>
                <p className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </motion.div>

            {/* Macro Overview */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid-4" style={{ marginBottom: 20 }}>
                {[
                    { label: 'Calories', val: totals.calories, goal: goals.calories || 2000, unit: '', color: 'var(--gradient-orange)' },
                    { label: 'Protein', val: totals.protein, goal: goals.protein || 50, unit: 'g', color: 'var(--gradient-blue)' },
                    { label: 'Carbs', val: totals.carbs, goal: goals.carbs || 250, unit: 'g', color: 'var(--gradient-purple)' },
                    { label: 'Fat', val: totals.fat, goal: goals.fat || 65, unit: 'g', color: 'var(--gradient-pink)' },
                ].map((s) => (
                    <div key={s.label} className="stat-card" style={{ padding: '12px 8px' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, background: s.color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {Math.round(s.val)}{s.unit}
                        </div>
                        <div className="stat-label" style={{ fontSize: 10 }}>{s.label}</div>
                        <div className="progress-bar" style={{ marginTop: 6, height: 3 }}>
                            <div className="progress-fill" style={{ width: `${Math.min((s.val / s.goal) * 100, 100)}%`, background: s.color }} />
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Water Tracker */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card-sm flex-between" style={{ marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>💧 Water Intake</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{waterIntake}L <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>/ {goals.water || 3}L</span></div>
                </div>
                <div className="flex gap-xs">
                    <button className="btn btn-outline btn-sm" onClick={() => setWaterIntake(prev => Math.max(0, prev - 0.25))}>−</button>
                    <button className="btn btn-primary btn-sm" onClick={() => setWaterIntake(prev => prev + 0.25)}>+0.25L</button>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'meals' ? 'active' : ''}`} onClick={() => setActiveTab('meals')}>Meals</button>
                <button className={`tab ${activeTab === 'nutrients' ? 'active' : ''}`} onClick={() => setActiveTab('nutrients')}>Nutrients</button>
            </div>

            {activeTab === 'meals' && (
                <>
                    {/* Add Meal Buttons */}
                    <div className="flex gap-sm" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
                        {MEAL_TYPES.map(type => (
                            <button key={type} className="btn btn-outline btn-sm" onClick={() => addMealSlot(type)}>
                                + {type}
                            </button>
                        ))}
                    </div>

                    {/* Meals */}
                    {meals.length === 0 ? (
                        <div className="empty-state">
                            <div className="emoji">🍽️</div>
                            <div className="title">No meals logged</div>
                            <div className="text">Tap a meal type above to start logging your food intake.</div>
                        </div>
                    ) : (
                        meals.map((meal, mealIdx) => (
                            <motion.div
                                key={mealIdx}
                                className="meal-card"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: mealIdx * 0.1 }}
                            >
                                <div className="meal-header">
                                    <div className="meal-title">
                                        {meal.name === 'Breakfast' ? '🌅' : meal.name === 'Lunch' ? '☀️' : meal.name === 'Dinner' ? '🌙' : '🍿'}
                                        {meal.name}
                                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 400, marginLeft: 8 }}>{meal.time}</span>
                                    </div>
                                    <button className="btn btn-outline btn-sm" onClick={() => setShowAddFood(mealIdx)}>+ Food</button>
                                </div>

                                {meal.foods?.length === 0 && (
                                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: '8px 0' }}>
                                        No foods added yet
                                    </p>
                                )}

                                {meal.foods?.map((food, foodIdx) => (
                                    <div key={foodIdx} className="food-item">
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 500 }}>{food.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                                {food.calories}cal · {food.protein}g P · {food.carbs}g C · {food.fat}g F
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFoodFromMeal(mealIdx, foodIdx)}
                                            style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: 16 }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                {/* Per-meal Action Buttons */}
                                <div className="flex gap-sm" style={{ marginTop: 12 }}>
                                    <button className="btn btn-purple btn-sm" style={{ flex: 1 }} onClick={() => getMealSuggestion(mealIdx)} disabled={aiLoading || (meal.foods?.length || 0) === 0}>
                                        {aiLoading ? '...' : '🤖 Get Suggestion'}
                                    </button>
                                </div>

                                {mealAiSuggestions[mealIdx] && (
                                    <motion.div className="ai-box" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 12, padding: 14 }}>
                                        <div className="ai-box-title" style={{ fontSize: 12 }}>🤖 Suggestion</div>
                                        <div className="ai-box-content" style={{ fontSize: 13 }}>{mealAiSuggestions[mealIdx]}</div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))
                    )}

                    {/* Save & Finalize Buttons */}
                    {meals.length > 0 && (
                        <div className="flex-col gap-sm" style={{ marginTop: 16 }}>
                            <button className="btn btn-success btn-full" onClick={saveMeals} disabled={saving}>
                                {saving ? '💾 Saving...' : '💾 Save Meals'}
                            </button>
                            <button className="btn btn-primary btn-full" onClick={finalizeDayAndGetSummary} disabled={finalizing}>
                                {finalizing ? (
                                    <span className="flex-center gap-sm">
                                        <span className="loading-dots"><span /><span /><span /></span>
                                        Finalizing...
                                    </span>
                                ) : (
                                    '📊 Save Day & Get Summary'
                                )}
                            </button>
                        </div>
                    )}

                    {/* Day AI Summary */}
                    {dayAiSuggestion && (
                        <motion.div className="ai-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16 }}>
                            <div className="ai-box-title">🤖 Day Summary & Feedback</div>
                            <div className="ai-box-content">{dayAiSuggestion}</div>
                        </motion.div>
                    )}
                </>
            )}

            {activeTab === 'nutrients' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3 className="section-title">Vitamins</h3>
                    <div className="glass-card" style={{ marginBottom: 16 }}>
                        {Object.entries(vitamins).map(([key, val]) => (
                            <div key={key} className="nutrient-row">
                                <span className="nutrient-label">Vitamin {key}</span>
                                <div className="nutrient-bar">
                                    <div className="nutrient-fill" style={{ width: `${Math.min((val / vitaminDV[key]) * 100, 100)}%`, background: val >= vitaminDV[key] ? 'var(--accent-green)' : 'var(--accent-orange)' }} />
                                </div>
                                <span className="nutrient-value">{Math.round(val * 10) / 10}/{vitaminDV[key]}</span>
                            </div>
                        ))}
                    </div>

                    <h3 className="section-title">Minerals</h3>
                    <div className="glass-card">
                        {Object.entries(minerals).map(([key, val]) => (
                            <div key={key} className="nutrient-row">
                                <span className="nutrient-label" style={{ textTransform: 'capitalize' }}>{key}</span>
                                <div className="nutrient-bar">
                                    <div className="nutrient-fill" style={{ width: `${Math.min((val / mineralDV[key]) * 100, 100)}%`, background: val >= mineralDV[key] ? 'var(--accent-green)' : 'var(--accent-teal)' }} />
                                </div>
                                <span className="nutrient-value">{Math.round(val)}/{mineralDV[key]}mg</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Add Food Modal */}
            <AnimatePresence>
                {showAddFood !== null && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddFood(null)}>
                        <motion.div className="modal-content" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()}
                            style={{ maxHeight: '90vh' }}>
                            <div className="modal-handle" />
                            <h2 className="section-title">Add Food to {meals[showAddFood]?.name}</h2>

                            {/* Common Foods */}
                            <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Quick Add</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                                {COMMON_FOODS.map((food, i) => (
                                    <button
                                        key={i}
                                        className="btn btn-outline btn-sm"
                                        onClick={() => addFoodToMeal(showAddFood, food)}
                                        style={{ fontSize: 12 }}
                                    >
                                        {food.name}
                                    </button>
                                ))}
                            </div>

                            <div className="divider" />

                            {/* AI-Powered Custom Food */}
                            <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>🤖 AI Food Lookup</h4>
                            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 12 }}>Enter food name & weight — AI will calculate full nutrition including vitamins & minerals</p>
                            <div className="grid-2">
                                <div className="input-group">
                                    <label className="label">Food Name</label>
                                    <input className="input" placeholder="e.g., Chicken curry" value={customFood.name} onChange={(e) => setCustomFood(prev => ({ ...prev, name: e.target.value }))} />
                                </div>
                                <div className="input-group">
                                    <label className="label">Weight (grams)</label>
                                    <input className="input" type="number" placeholder="100" value={customFood.weight} onChange={(e) => setCustomFood(prev => ({ ...prev, weight: e.target.value }))} />
                                </div>
                            </div>

                            {foodLookupError && (
                                <div style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 12, fontSize: 12, color: 'var(--accent-red)' }}>
                                    {foodLookupError}
                                </div>
                            )}

                            <button
                                className="btn btn-purple btn-full"
                                onClick={async () => {
                                    if (!customFood.name) return;
                                    setFoodLookupLoading(true);
                                    setFoodLookupError('');
                                    try {
                                        const res = await fetch('/api/ai/nutrition', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ foodName: customFood.name, weight: customFood.weight || '100' }),
                                        });
                                        const data = await res.json();
                                        if (data.error) {
                                            setFoodLookupError(data.error);
                                        } else if (data.nutrition) {
                                            addFoodToMeal(showAddFood, data.nutrition);
                                            showToastMsg(`✅ Added ${customFood.name} with AI nutrition data`);
                                        }
                                    } catch (err) {
                                        setFoodLookupError('Failed to lookup nutrition. Try again.');
                                    } finally {
                                        setFoodLookupLoading(false);
                                    }
                                }}
                                disabled={!customFood.name || foodLookupLoading}
                            >
                                {foodLookupLoading ? (
                                    <span className="flex-center gap-sm">
                                        <span className="loading-dots"><span /><span /><span /></span>
                                        AI analyzing nutrition...
                                    </span>
                                ) : (
                                    '🤖 Lookup & Add Food'
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
