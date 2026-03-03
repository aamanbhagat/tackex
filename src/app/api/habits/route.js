import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Habit from '@/models/Habit';

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const habits = await Habit.find({ userId }).sort({ createdAt: -1 });
        return NextResponse.json({ habits });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();

        if (body.action === 'toggle') {
            const habit = await Habit.findById(body.habitId);
            if (!habit) return NextResponse.json({ error: 'Habit not found' }, { status: 404 });

            const dateStr = body.date;
            const existing = habit.completions.find(c => c.date === dateStr);

            if (existing) {
                existing.completed = !existing.completed;
                existing.time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            } else {
                habit.completions.push({ date: dateStr, completed: true, time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) });
            }

            // Calculate streak
            let streak = 0;
            const today = new Date();
            for (let i = 0; i < 365; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const ds = d.toISOString().split('T')[0];
                const comp = habit.completions.find(c => c.date === ds);
                if (comp && comp.completed) {
                    streak++;
                } else {
                    break;
                }
            }
            habit.streak = streak;

            await habit.save();
            return NextResponse.json({ habit });
        }

        if (body.action === 'delete') {
            await Habit.findByIdAndDelete(body.habitId);
            return NextResponse.json({ success: true });
        }

        const habit = await Habit.create(body);
        return NextResponse.json({ habit }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
