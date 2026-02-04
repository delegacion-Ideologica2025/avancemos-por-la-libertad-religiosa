import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // We can check a global "kill switch" in KV
        const isSecurityActive = await kv.get('auth_security_active');

        // If the key doesn't exist, we assume it's active (default)
        if (isSecurityActive === false) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({ authenticated: true });
    } catch (error) {
        console.error('Auth validation failed:', error);
        // On error, let them stay for now to avoid locking people out on network issues
        return NextResponse.json({ authenticated: true });
    }
}
