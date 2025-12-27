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
                e.id,
                e.name,
                e.serial_number,
                e.equipment_category_id,
                ec.name as category_name,
                e.used_by_type,
                e.used_by_employee_id,
                e.location,
                e.purchase_date,
                e.warranty_end_date,
                e.is_scrapped,
                e.maintenance_team_id,
                e.default_technician_id,
                e.employee_id,
                e.assigned_date,
                e.description,
                e.work_center_id,
                e.scrap_date,
                mt.name as maintenance_team_name,
                u_assigned.username as assigned_employee_name,
                u_tech.username as default_technician_name,
                u_used_by.username as used_by_employee_name
            FROM equipment e
            LEFT JOIN equipment_categories ec ON e.equipment_category_id = ec.id
            LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
            LEFT JOIN users u_assigned ON e.employee_id = u_assigned.id
            LEFT JOIN users u_tech ON e.default_technician_id = u_tech.id
            LEFT JOIN users u_used_by ON e.used_by_employee_id = u_used_by.id
            ORDER BY e.name ASC
        `;

        const [equipment]: any = await pool.execute(query);

        return NextResponse.json({
            success: true,
            equipment
        });

    } catch (error: any) {
        console.error('Fetch equipment error:', error);
        return NextResponse.json({
            error: 'Failed to fetch equipment',
            details: error.message
        }, { status: 500 });
    }
}
