'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        weight: '',
        height: '',
        gender: '',
        age: '',
        activityLevel: 'moderate',
        goals: {
            calories: 2000,
            protein: 50,
            carbs: 250,
            fat: 65,
            water: 3,
            sleep: 8,
            steps: 10000,
        },
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateGoal = (field, value) => {
        setFormData(prev => ({
            ...prev,
            goals: { ...prev.goals, [field]: Number(value) || 0 },
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    weight: Number(formData.weight),
                    height: Number(formData.height),
                    age: Number(formData.age),
                }),
            });
            const data = await res.json();
            if (data.user) {
                router.push('/');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        // Step 0: Welcome
        <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
        >
            <div className="onboarding-logo">🎯</div>
            <h1 className="onboarding-title">HabitFlow</h1>
            <p className="onboarding-subtitle">
                Track your habits, nutrition, finances & health — all in one place with AI-powered insights.
            </p>
            <button className="btn btn-primary btn-full" onClick={() => setStep(1)}>
                Get Started
            </button>
        </motion.div>,

        // Step 1: Personal Info
        <motion.div
            key="personal"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%' }}
        >
            <h2 className="section-title" style={{ fontSize: 22, marginBottom: 8 }}>About You</h2>
            <p className="page-subtitle">Let us personalize your experience</p>

            <div className="input-group">
                <label className="label">Your Name</label>
                <input
                    className="input"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                />
            </div>

            <div className="input-group">
                <label className="label">Gender</label>
                <div className="gender-options">
                    {[{ val: 'male', emoji: '👨', text: 'Male' }, { val: 'female', emoji: '👩', text: 'Female' }, { val: 'other', emoji: '🧑', text: 'Other' }].map(opt => (
                        <button
                            key={opt.val}
                            className={`gender-option ${formData.gender === opt.val ? 'selected' : ''}`}
                            onClick={() => updateField('gender', opt.val)}
                        >
                            <span className="emoji">{opt.emoji}</span>
                            <span className="text">{opt.text}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid-2">
                <div className="input-group">
                    <label className="label">Age</label>
                    <input
                        className="input"
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={(e) => updateField('age', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="label">Activity Level</label>
                    <select
                        className="select"
                        value={formData.activityLevel}
                        onChange={(e) => updateField('activityLevel', e.target.value)}
                    >
                        <option value="sedentary">Sedentary</option>
                        <option value="light">Light</option>
                        <option value="moderate">Moderate</option>
                        <option value="active">Active</option>
                        <option value="very_active">Very Active</option>
                    </select>
                </div>
            </div>

            <div className="grid-2">
                <div className="input-group">
                    <label className="label">Weight (kg)</label>
                    <input
                        className="input"
                        type="number"
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) => updateField('weight', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="label">Height (cm)</label>
                    <input
                        className="input"
                        type="number"
                        placeholder="175"
                        value={formData.height}
                        onChange={(e) => updateField('height', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex gap-sm" style={{ marginTop: 8 }}>
                <button className="btn btn-outline" onClick={() => setStep(0)}>Back</button>
                <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => setStep(2)}
                    disabled={!formData.name || !formData.gender || !formData.age || !formData.weight || !formData.height}
                >
                    Continue
                </button>
            </div>
        </motion.div>,

        // Step 2: Goals
        <motion.div
            key="goals"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%' }}
        >
            <h2 className="section-title" style={{ fontSize: 22, marginBottom: 8 }}>Daily Goals</h2>
            <p className="page-subtitle">Set your daily targets</p>

            <div className="grid-2">
                <div className="input-group">
                    <label className="label">🔥 Calories (kcal)</label>
                    <input
                        className="input"
                        type="number"
                        value={formData.goals.calories}
                        onChange={(e) => updateGoal('calories', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="label">💪 Protein (g)</label>
                    <input
                        className="input"
                        type="number"
                        value={formData.goals.protein}
                        onChange={(e) => updateGoal('protein', e.target.value)}
                    />
                </div>
            </div>

            <div className="grid-2">
                <div className="input-group">
                    <label className="label">🍞 Carbs (g)</label>
                    <input
                        className="input"
                        type="number"
                        value={formData.goals.carbs}
                        onChange={(e) => updateGoal('carbs', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="label">🥑 Fat (g)</label>
                    <input
                        className="input"
                        type="number"
                        value={formData.goals.fat}
                        onChange={(e) => updateGoal('fat', e.target.value)}
                    />
                </div>
            </div>

            <div className="grid-2">
                <div className="input-group">
                    <label className="label">💧 Water (liters)</label>
                    <input
                        className="input"
                        type="number"
                        step="0.5"
                        value={formData.goals.water}
                        onChange={(e) => updateGoal('water', e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="label">😴 Sleep (hours)</label>
                    <input
                        className="input"
                        type="number"
                        value={formData.goals.sleep}
                        onChange={(e) => updateGoal('sleep', e.target.value)}
                    />
                </div>
            </div>

            <div className="input-group">
                <label className="label">🚶 Steps goal</label>
                <input
                    className="input"
                    type="number"
                    value={formData.goals.steps}
                    onChange={(e) => updateGoal('steps', e.target.value)}
                />
            </div>

            <div className="flex gap-sm" style={{ marginTop: 8 }}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                <button
                    className="btn btn-success"
                    style={{ flex: 1 }}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex-center gap-sm">
                            <span className="spinner" /> Saving...
                        </span>
                    ) : (
                        '✨ Start Tracking'
                    )}
                </button>
            </div>
        </motion.div>,
    ];

    return (
        <div className="onboarding-container">
            {/* Progress dots */}
            <div className="flex gap-sm" style={{ marginBottom: 32 }}>
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        style={{
                            width: step === i ? 24 : 8,
                            height: 8,
                            borderRadius: 4,
                            background: step >= i ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
                            transition: 'all 0.3s ease',
                        }}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {steps[step]}
            </AnimatePresence>
        </div>
    );
}
