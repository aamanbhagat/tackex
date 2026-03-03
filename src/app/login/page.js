'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed');
                return;
            }

            if (data.needsOnboarding) {
                router.push('/onboarding');
            } else {
                router.push('/');
            }
        } catch (err) {
            setError('Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%' }}
            >
                <div className="onboarding-logo">🎯</div>
                <h1 className="onboarding-title">Welcome Back</h1>
                <p className="onboarding-subtitle">Sign in to continue tracking your progress</p>

                <form onSubmit={handleLogin} className="onboarding-form">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'rgba(255, 69, 58, 0.1)',
                                border: '1px solid rgba(255, 69, 58, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                padding: '12px 16px',
                                marginBottom: 16,
                                fontSize: 14,
                                color: 'var(--accent-red)',
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="input-group">
                        <label className="label">Email</label>
                        <input
                            className="input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="input-group">
                        <label className="label">Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading || !email || !password}
                        style={{ marginTop: 8 }}
                    >
                        {loading ? (
                            <span className="flex-center gap-sm">
                                <span className="spinner" /> Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>
                        Sign Up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
