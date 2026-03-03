import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
    try {
        await connectDB();
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const account = await Account.findOne({ email });
        if (!account) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const isMatch = await account.comparePassword(password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const user = await User.findById(account.userId);
        const needsOnboarding = !user || user.weight === 0 || user.age === 0;

        const token = signToken({ accountId: account._id, userId: account.userId });

        const response = NextResponse.json({
            success: true,
            user,
            needsOnboarding,
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
