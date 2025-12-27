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
        const {
            name,
            serialNumber,
            equipmentCategoryId,
            usedByType,
            usedByEmployeeId,
            maintenanceTeamId,
            defaultTechnicianId,
            employeeId,
            assignedDate,
            description,
            purchaseDate,
            warrantyEndDate,
            location,
            workCenterId,
            isScrapped,
            scrapDate
        } = data;

        const query = `
            UPDATE equipment SET 
                name = ?,
                serial_number = ?,
                equipment_category_id = ?,
                used_by_type = ?,
                used_by_employee_id = ?,
                maintenance_team_id = ?,
                default_technician_id = ?,
                employee_id = ?,
                assigned_date = ?,
                description = ?,
                purchase_date = ?,
                warranty_end_date = ?,
                location = ?,
                work_center_id = ?,
                is_scrapped = ?,
                scrap_date = ?
            WHERE id = ?
        `;

        const values = [
            name || '',
            serialNumber || '',
            equipmentCategoryId ? parseInt(equipmentCategoryId) : null,
            usedByType || null,
            usedByEmployeeId ? parseInt(usedByEmployeeId) : null,
            maintenanceTeamId ? parseInt(maintenanceTeamId) : null,
            defaultTechnicianId ? parseInt(defaultTechnicianId) : null,
            employeeId ? parseInt(employeeId) : null,
            assignedDate || null,
            description || null,
            purchaseDate || null,
            warrantyEndDate || null,
            location || null,
            workCenterId ? parseInt(workCenterId) : null,
            isScrapped ? 1 : 0,
            scrapDate || null,
            id
        ];

        await pool.execute(query, values);

        return NextResponse.json({
            success: true,
            message: 'Equipment updated successfully'
        });

    } catch (error: any) {
        console.error('Update equipment error:', error);
        return NextResponse.json({
            error: 'Failed to update equipment',
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

        // Delete the equipment
        const query = 'DELETE FROM equipment WHERE id = ?';
        await pool.execute(query, [id]);

        return NextResponse.json({
            success: true,
            message: 'Equipment deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete equipment error:', error);
        return NextResponse.json({
            error: 'Failed to delete equipment',
            details: error.message
        }, { status: 500 });
    }
}
