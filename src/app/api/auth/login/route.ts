import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyPassword, login } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        const [rows]: any = await pool.execute(
            'SELECT id, username, password, role FROM users WHERE username = ?',
            [username]
        );

        const user = rows[0];

        if (!user || !(await verifyPassword(password, user.password))) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }

        await login({ id: user.id, username: user.username, role: user.role });

        return NextResponse.json({ message: 'Logged in successfully' });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
    }
}
