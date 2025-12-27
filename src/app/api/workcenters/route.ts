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
                id,
                name,
                code,
                tag,
                cost_per_hour,
                capacity_time_efficiency,
                oee_target,
                is_active,
                company_id,
                created_at
            FROM work_centers
            ORDER BY name ASC
        `;

        const [workCenters]: any = await pool.execute(query);

        return NextResponse.json({
            success: true,
            workCenters
        });

    } catch (error: any) {
        console.error('Fetch work centers error:', error);
        return NextResponse.json({
            error: 'Failed to fetch work centers',
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
        const { name, code, tag, costPerHour, capacityTimeEfficiency, oeeTarget, isActive } = data;

        if (!name || !code) {
            return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
        }

        const query = `
            INSERT INTO work_centers (
                name,
                code,
                tag,
                cost_per_hour,
                capacity_time_efficiency,
                oee_target,
                is_active,
                company_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `;

        const values = [
            name,
            code,
            tag || null,
            costPerHour || 0,
            capacityTimeEfficiency || 100,
            oeeTarget || null,
            isActive !== undefined ? isActive : true
        ];

        const [result]: any = await pool.execute(query, values);

        return NextResponse.json({
            success: true,
            message: 'Work center created successfully',
            workCenterId: result.insertId
        });

    } catch (error: any) {
        console.error('Create work center error:', error);
        return NextResponse.json({
            error: 'Failed to create work center',
            details: error.message
        }, { status: 500 });
    }
}
