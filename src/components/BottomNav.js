'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const navItems = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/habits', label: 'Habits', icon: 'check' },
    { href: '/diet', label: 'Diet', icon: 'apple' },
    { href: '/finance', label: 'Money', icon: 'wallet' },
    { href: '/calendar', label: 'Calendar', icon: 'calendar' },
];

const icons = {
    home: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    check: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    apple: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C9 2 7 4 7 4S5 2 3 4s0 6 4 10c2.5 2.5 4 4 5 5 1-1 2.5-2.5 5-5 4-4 6-8 4-10S15 2 12 2z" />
            <path d="M12 2c0 3-2 5-2 5" />
        </svg>
    ),
    wallet: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
            <circle cx="18" cy="15" r="1.5" />
        </svg>
    ),
    calendar: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
};

export default function BottomNav() {
    const pathname = usePathname();

    if (pathname === '/onboarding' || pathname === '/login' || pathname === '/signup') return null;

    return (
        <nav className="bottom-nav">
            <ul className="nav-items">
                {navItems.map((item) => {
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                    return (
                        <li key={item.href}>
                            <Link href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">{icons[item.icon]}</span>
                                <span>{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: 20,
                                            height: 2,
                                            borderRadius: 1,
                                            background: 'var(--accent-blue)',
                                        }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
