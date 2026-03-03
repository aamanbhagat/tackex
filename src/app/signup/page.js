'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Signup failed');
                return;
            }

            router.push('/onboarding');
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
                <h1 className="onboarding-title">Create Account</h1>
                <p className="onboarding-subtitle">Start your journey to a better lifestyle</p>

                <form onSubmit={handleSignup} className="onboarding-form">
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
                        <label className="label">Full Name</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="input-group">
                        <label className="label">Email</label>
                        <input
                            className="input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="label">Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="Min 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="input-group">
                        <label className="label">Confirm Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-success btn-full"
                        disabled={loading || !name || !email || !password || !confirmPassword}
                        style={{ marginTop: 8 }}
                    >
                        {loading ? (
                            <span className="flex-center gap-sm">
                                <span className="spinner" /> Creating account...
                            </span>
                        ) : (
                            '✨ Create Account'
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
