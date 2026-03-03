import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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
            const entry = await FinanceEntry.findOne({ userId, date });
            return NextResponse.json({ entry });
        }

        if (month) {
            const entries = await FinanceEntry.find({
                userId,
                date: { $regex: `^${month}` }
            }).sort({ date: 1 });
            return NextResponse.json({ entries });
        }

        const entries = await FinanceEntry.find({ userId }).sort({ date: -1 }).limit(30);
        return NextResponse.json({ entries });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { userId, date, income, incomeSource, expenses, investments } = body;

        const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
        const totalInvestments = investments?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0;
        const savings = (income || 0) - totalExpenses - totalInvestments;

        const existing = await FinanceEntry.findOne({ userId, date });

        if (existing) {
            existing.income = income !== undefined ? income : existing.income;
            existing.incomeSource = incomeSource || existing.incomeSource;
            existing.expenses = expenses || existing.expenses;
            existing.investments = investments || existing.investments;
            existing.savings = savings;
            existing.savedAt = new Date();
            await existing.save();
            return NextResponse.json({ entry: existing });
        }

        const entry = await FinanceEntry.create({
            userId, date, income, incomeSource, expenses, investments, savings,
        });

        return NextResponse.json({ entry }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
