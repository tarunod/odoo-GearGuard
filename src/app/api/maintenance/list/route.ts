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
                mr.id,
                mr.subject,
                mr.description,
                mr.maintenance_for,
                mr.maintenance_type,
                mr.category,
                mr.priority,
                mr.stage,
                mr.scheduled_date,
                mr.duration_hours,
                mr.created_at,
                mr.equipment_id,
                mr.work_center_id,
                mr.maintenance_team_id,
                mr.technician_id,
                mr.requested_by_id,
                e.name as equipment_name,
                wc.name as work_center_name,
                mt.name as team_name,
                u_tech.username as technician_name,
                u_creator.username as creator_name,
                u_req.username as requested_employee_name
            FROM maintenance_requests mr
            LEFT JOIN equipment e ON mr.equipment_id = e.id
            LEFT JOIN work_centers wc ON mr.work_center_id = wc.id
            LEFT JOIN maintenance_teams mt ON mr.maintenance_team_id = mt.id
            LEFT JOIN users u_tech ON mr.technician_id = u_tech.id
            LEFT JOIN users u_creator ON mr.created_by = u_creator.id
            LEFT JOIN users u_req ON mr.requested_by_id = u_req.id
            ORDER BY mr.created_at DESC
        `;

        const [requests]: any = await pool.execute(query);

        return NextResponse.json({
            success: true,
            requests
        });

    } catch (error: any) {
        console.error('Fetch maintenance requests error:', error);
        return NextResponse.json({
            error: 'Failed to fetch maintenance requests',
            details: error.message
        }, { status: 500 });
    }
}
