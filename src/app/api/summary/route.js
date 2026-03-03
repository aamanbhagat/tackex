import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DailySummary from '@/models/DailySummary';
import Habit from '@/models/Habit';
import DietEntry from '@/models/DietEntry';
import FinanceEntry from '@/models/FinanceEntry';

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const date = searchParams.get('date');
        const month = searchParams.get('month');

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        if (date) {
            const summary = await DailySummary.findOne({ userId, date });
            return NextResponse.json({ summary });
        }

        if (month) {
            const summaries = await DailySummary.find({
                userId,
                date: { $regex: `^${month}` }
            }).sort({ date: 1 });
            return NextResponse.json({ summaries });
        }

        const summaries = await DailySummary.find({ userId }).sort({ date: -1 }).limit(30);
        return NextResponse.json({ summaries });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { userId, date, sleepHours, wakeUpTime, bedTime } = body;

        // Gather data from other collections
        const habits = await Habit.find({ userId });
        const habitsTotal = habits.length;
        const habitsCompleted = habits.filter(h => {
            const comp = h.completions.find(c => c.date === date);
            return comp && comp.completed;
        }).length;

        const dietEntry = await DietEntry.findOne({ userId, date });
        const financeEntry = await FinanceEntry.findOne({ userId, date });

        const summaryData = {
            userId,
            date,
            habitsCompleted,
            habitsTotal,
            caloriesConsumed: dietEntry?.totals?.calories || 0,
            proteinConsumed: dietEntry?.totals?.protein || 0,
            carbsConsumed: dietEntry?.totals?.carbs || 0,
            fatConsumed: dietEntry?.totals?.fat || 0,
            waterIntake: dietEntry?.waterIntake || 0,
            sleepHours: sleepHours || 0,
            wakeUpTime: wakeUpTime || '',
            bedTime: bedTime || '',
            incomeTotal: financeEntry?.income || 0,
            expenseTotal: financeEntry?.expenses?.reduce((s, e) => s + e.amount, 0) || 0,
            investmentTotal: financeEntry?.investments?.reduce((s, i) => s + i.amount, 0) || 0,
        };

        // Calculate overall score
        let score = 0;
        if (habitsTotal > 0) score += (habitsCompleted / habitsTotal) * 40;
        if (dietEntry) score += 30;
        if (financeEntry) score += 15;
        if (sleepHours >= 7) score += 15;
        summaryData.overallScore = Math.round(score);

        const existing = await DailySummary.findOne({ userId, date });
        if (existing) {
            Object.assign(existing, summaryData);
            await existing.save();
            return NextResponse.json({ summary: existing });
        }

        const summary = await DailySummary.create(summaryData);
        return NextResponse.json({ summary }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
