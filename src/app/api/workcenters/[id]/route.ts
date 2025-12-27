import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams.id;
        const data = await request.json();
        const { name, code, tag, costPerHour, capacityTimeEfficiency, oeeTarget, isActive } = data;

        if (!name || !code) {
            return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
        }

        const query = `
            UPDATE work_centers 
            SET name = ?, 
                code = ?, 
                tag = ?, 
                cost_per_hour = ?, 
                capacity_time_efficiency = ?, 
                oee_target = ?, 
                is_active = ?
            WHERE id = ?
        `;

        const values = [
            name,
            code,
            tag || null,
            costPerHour || 0,
            capacityTimeEfficiency || 100,
            oeeTarget || null,
            isActive !== undefined ? isActive : true,
            id
        ];

        await pool.execute(query, values);

        return NextResponse.json({
            success: true,
            message: 'Work center updated successfully'
        });

    } catch (error: any) {
        console.error('Update work center error:', error);
        return NextResponse.json({
            error: 'Failed to update work center',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams.id;

        // Delete the work center
        const query = 'DELETE FROM work_centers WHERE id = ?';
        await pool.execute(query, [id]);

        return NextResponse.json({
            success: true,
            message: 'Work center deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete work center error:', error);
        return NextResponse.json({
            error: 'Failed to delete work center',
            details: error.message
        }, { status: 500 });
    }
}
