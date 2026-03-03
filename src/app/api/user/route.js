import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

export async function GET(request) {
    try {
        await connectDB();

        // Try auth first
        const cookieHeader = request.headers.get('cookie');
        const token = getTokenFromCookies(cookieHeader);

        if (token) {
            const decoded = verifyToken(token);
            if (decoded && decoded.userId) {
                const user = await User.findById(decoded.userId);
                if (user) {
                    return NextResponse.json({ user, authenticated: true });
                }
            }
        }

        // Fallback: no auth - redirect to login
        return NextResponse.json({ user: null, authenticated: false });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();

        // Try auth
        const cookieHeader = request.headers.get('cookie');
        const token = getTokenFromCookies(cookieHeader);

        if (token) {
            const decoded = verifyToken(token);
            if (decoded && decoded.userId) {
                const updated = await User.findByIdAndUpdate(
                    decoded.userId,
                    { ...body, weight: Number(body.weight), height: Number(body.height), age: Number(body.age), updatedAt: new Date() },
                    { new: true }
                );
                return NextResponse.json({ user: updated });
            }
        }

        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
