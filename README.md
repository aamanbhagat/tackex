# 🎯 HabitFlow — Daily Life Tracker with AI

A comprehensive Next.js app to track daily habits, nutrition, finances, and health metrics with AI-powered suggestions via Grok.

## ✨ Features

- **🔐 Auth** — Email/password signup & login with JWT
- **✅ Habits** — Add, toggle, delete habits with streak tracking
- **🍽️ Diet** — Log meals with macro & micro-nutrient tracking (vitamins, minerals)
- **🤖 AI Food Lookup** — Enter food name + weight, AI returns full nutrition data
- **💰 Finance** — Track income, expenses (8 categories), investments (8 types)
- **📅 Calendar** — Monthly grid with color-coded day status
- **📊 Summary** — Daily/monthly stats with score ring and AI feedback
- **🎨 iOS-style UI** — Dark theme, glassmorphism, smooth animations

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/aamanbhagat/tackex.git
cd tackex
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with:

| Variable | Where to get it |
|----------|----------------|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) — Create a free cluster |
| `GROK_API_KEY` | [xAI Console](https://console.x.ai) — Get an API key |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start tracking!

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** MongoDB Atlas + Mongoose
- **AI:** Grok (grok-4-1-fast-non-reasoning) via xAI API
- **UI:** Custom CSS with glassmorphism, Framer Motion animations
- **Auth:** JWT + bcrypt + httpOnly cookies

## 📁 Project Structure

```
src/
├── app/
│   ├── api/          # API routes (auth, habits, diet, finance, summary, AI)
│   ├── login/        # Login page
│   ├── signup/       # Signup page
│   ├── onboarding/   # User setup (weight, height, goals)
│   ├── habits/       # Habit tracking
│   ├── diet/         # Diet & nutrition logging
│   ├── finance/      # Income, expenses, investments
│   ├── calendar/     # Monthly progress calendar
│   ├── summary/      # Daily & monthly summaries
│   └── page.js       # Dashboard
├── components/       # Reusable UI components
├── lib/              # MongoDB connection, auth helpers
└── models/           # Mongoose schemas
```
