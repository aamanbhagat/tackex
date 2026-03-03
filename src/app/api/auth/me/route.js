import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

export async function GET(request) {
    try {
        const cookieHeader = request.headers.get('cookie');
        const token = getTokenFromCookies(cookieHeader);

        if (!token) {
            return NextResponse.json({ authenticated: false });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ authenticated: false });
        }

        return NextResponse.json({
            authenticated: true,
            userId: decoded.userId,
            accountId: decoded.accountId,
        });
    } catch {
        return NextResponse.json({ authenticated: false });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });
    return response;
}
