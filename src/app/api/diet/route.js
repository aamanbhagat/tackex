import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DietEntry from '@/models/DietEntry';

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const date = searchParams.get('date');
        const month = searchParams.get('month'); // YYYY-MM

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        if (date) {
            const entry = await DietEntry.findOne({ userId, date });
            return NextResponse.json({ entry });
        }

        if (month) {
            const entries = await DietEntry.find({
                userId,
                date: { $regex: `^${month}` }
            }).sort({ date: 1 });
            return NextResponse.json({ entries });
        }

        const entries = await DietEntry.find({ userId }).sort({ date: -1 }).limit(30);
        return NextResponse.json({ entries });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { userId, date, meals, waterIntake, isDayFinalized } = body;

        // Calculate totals
        let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        if (meals) {
            meals.forEach(meal => {
                meal.foods?.forEach(food => {
                    totals.calories += food.calories || 0;
                    totals.protein += food.protein || 0;
                    totals.carbs += food.carbs || 0;
                    totals.fat += food.fat || 0;
                    totals.fiber += food.fiber || 0;
                });
            });
        }

        const existing = await DietEntry.findOne({ userId, date });

        if (existing) {
            existing.meals = meals || existing.meals;
            existing.waterIntake = waterIntake !== undefined ? waterIntake : existing.waterIntake;
            existing.totals = totals;
            existing.isDayFinalized = isDayFinalized || existing.isDayFinalized;
            existing.savedAt = new Date();
            await existing.save();
            return NextResponse.json({ entry: existing });
        }

        const entry = await DietEntry.create({
            userId,
            date,
            meals: meals || [],
            waterIntake: waterIntake || 0,
            totals,
            isDayFinalized: isDayFinalized || false,
        });

        return NextResponse.json({ entry }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
