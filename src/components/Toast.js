'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, type = 'success', duration = 3000 }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
    }, [duration]);

    const bgColors = {
        success: 'rgba(48, 209, 88, 0.15)',
        error: 'rgba(255, 69, 58, 0.15)',
        info: 'rgba(0, 122, 255, 0.15)',
    };

    const borderColors = {
        success: 'rgba(48, 209, 88, 0.3)',
        error: 'rgba(255, 69, 58, 0.3)',
        info: 'rgba(0, 122, 255, 0.3)',
    };

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="toast"
                    initial={{ opacity: 0, y: -20, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -20, x: '-50%' }}
                    style={{
                        background: bgColors[type],
                        borderColor: borderColors[type],
                        border: `1px solid ${borderColors[type]}`,
                    }}
                >
                    {icons[type]} {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
