import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
    try {
        await connectDB();
        const { email, password, name } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Email, password and name are required' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Check if account already exists
        const existing = await Account.findOne({ email });
        if (existing) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }

        // Create user profile first
        const user = await User.create({
            name,
            weight: 0,
            height: 0,
            gender: 'other',
            age: 0,
            goals: {},
        });

        // Create account
        const account = await Account.create({
            email,
            password,
            userId: user._id,
        });

        // Generate token
        const token = signToken({ accountId: account._id, userId: user._id });

        const response = NextResponse.json({
            success: true,
            user,
            needsOnboarding: true,
        }, { status: 201 });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
