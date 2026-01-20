import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = await kv.get('dashboard_shared_data');
        if (!data) {
            return NextResponse.json({ message: 'No data found' }, { status: 404 });
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to fetch data from KV:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Basic validation: ensure it has the expected version or structure
        if (!data || !data.departamentos) {
            return NextResponse.json({ error: 'Invalid data structure' }, { status: 400 });
        }

        await kv.set('dashboard_shared_data', data);
        return NextResponse.json({ message: 'Data updated successfully' });
    } catch (error) {
        console.error('Failed to save data to KV:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
