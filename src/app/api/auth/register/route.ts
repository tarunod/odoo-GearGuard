import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { username, email, password, department } = await req.json();

        if (!username || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const hashed = await hashPassword(password);

        const [result]: any = await pool.execute(
            'INSERT INTO users (username, email, password, department) VALUES (?, ?, ?, ?)',
            [username, email, hashed, department || 'General']
        );

        return NextResponse.json({ message: 'User registered successfully', userId: result.insertId }, { status: 201 });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 });
        }
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
    }
}
