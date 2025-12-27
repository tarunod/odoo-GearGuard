import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

        // Basic validation
        if (!name || !serialNumber || !maintenanceTeamId || !defaultTechnicianId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const query = `
            INSERT INTO equipment (
                name,
                serial_number,
                equipment_category_id,
                used_by_type,
                used_by_employee_id,
                maintenance_team_id,
                default_technician_id,
                employee_id,
                assigned_date,
                description,
                purchase_date,
                warranty_end_date,
                location,
                work_center_id,
                is_scrapped,
                scrap_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            name,
            serialNumber,
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
            scrapDate || null
        ];

        const [result]: any = await pool.execute(query, values);

        return NextResponse.json({
            success: true,
            message: 'Equipment created successfully',
            equipmentId: result.insertId
        });

    } catch (error: any) {
        console.error('Create equipment error:', error);
        return NextResponse.json({
            error: 'Failed to create equipment',
            details: error.message
        }, { status: 500 });
    }
}
