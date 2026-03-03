import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata = {
  title: 'HabitFlow — Track Your Life',
  description: 'Track daily habits, nutrition, finances, and health with AI-powered insights',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎯</text></svg>" />
      </head>
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
