import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const query = `
            SELECT 
                ec.id,
                ec.name,
                ec.company_id,
                ec.responsible_technician_id,
                u.username as responsible_technician_name,
                ec.created_at
            FROM equipment_categories ec
            LEFT JOIN users u ON ec.responsible_technician_id = u.id
            ORDER BY ec.name ASC
        `;

        const [categories]: any = await pool.execute(query);

        return NextResponse.json({
            success: true,
            categories
        });

    } catch (error: any) {
        console.error('Fetch categories error:', error);
        return NextResponse.json({
            error: 'Failed to fetch categories',
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { name, responsibleTechnicianId } = data;

        if (!name) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const query = `
            INSERT INTO equipment_categories (
                name,
                company_id,
                responsible_technician_id
            ) VALUES (?, 1, ?)
        `;

        const values = [name, responsibleTechnicianId || null];

        const [result]: any = await pool.execute(query, values);

        return NextResponse.json({
            success: true,
            message: 'Category created successfully',
            categoryId: result.insertId
        });

    } catch (error: any) {
        console.error('Create category error:', error);
        return NextResponse.json({
            error: 'Failed to create category',
            details: error.message
        }, { status: 500 });
    }
}
