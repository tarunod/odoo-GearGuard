import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const [equipment]: any = await pool.execute(`
            SELECT 
                e.id, 
                e.name, 
                ec.name as category_name, 
                e.maintenance_team_id 
            FROM equipment e
            LEFT JOIN equipment_categories ec ON e.equipment_category_id = ec.id
            WHERE e.is_scrapped = 0
        `);
        const [teams]: any = await pool.execute(`
            SELECT mt.id, mt.name, mt.team_leader_id, u.username as team_leader_name 
            FROM maintenance_teams mt
            LEFT JOIN users u ON mt.team_leader_id = u.id
        `);
        const [workCenters]: any = await pool.execute('SELECT id, name FROM work_centers WHERE is_active = 1');
        const [users]: any = await pool.execute('SELECT id, username FROM users');

        return NextResponse.json({
            equipment,
            teams,
            workCenters,
            users
        });
    } catch (error) {
        console.error('Metadata fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch maintenance metadata' }, { status: 500 });
    }
}
