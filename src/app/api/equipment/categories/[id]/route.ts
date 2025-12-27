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
        const { name, responsibleTechnicianId } = data;

        if (!name) {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        const query = `
            UPDATE equipment_categories 
            SET name = ?, responsible_technician_id = ?
            WHERE id = ?
        `;

        await pool.execute(query, [name, responsibleTechnicianId || null, id]);

        return NextResponse.json({
            success: true,
            message: 'Category updated successfully'
        });

    } catch (error: any) {
        console.error('Update category error:', error);
        return NextResponse.json({
            error: 'Failed to update category',
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

        // Delete the category
        const query = 'DELETE FROM equipment_categories WHERE id = ?';
        await pool.execute(query, [id]);

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete category error:', error);
        return NextResponse.json({
            error: 'Failed to delete category',
            details: error.message
        }, { status: 500 });
    }
}
