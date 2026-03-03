'use client';

import { motion } from 'framer-motion';

export default function ScoreRing({ score = 0, size = 120, strokeWidth = 8, color }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(score, 0), 100);
    const offset = circumference - (progress / 100) * circumference;

    const getColor = () => {
        if (color) return color;
        if (score >= 80) return 'var(--accent-green)';
        if (score >= 50) return 'var(--accent-orange)';
        return 'var(--accent-red)';
    };

    return (
        <div className="score-ring" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={strokeWidth}
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                />
            </svg>
            <div className="value">
                <motion.span
                    className="number"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ color: getColor() }}
                >
                    {score}
                </motion.span>
                <span className="label">Score</span>
            </div>
        </div>
    );
}
