import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        await kv.set('auth_security_active', false);
        return NextResponse.json({ message: 'All sessions revoked' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
