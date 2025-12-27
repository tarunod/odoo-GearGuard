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
            subject,
            description,
            maintenanceFor,
            maintenanceType,
            category,
            priority,
            equipmentId,
            workCenterId,
            teamId,
            technicianId,
            requestedById,
            scheduledDate,
            duration,
        } = data;

        // Basic validation
        const targetId = maintenanceFor === 'Work Center' ? workCenterId : equipmentId;
        if (!subject || !targetId || !teamId || !maintenanceType || !priority) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Convert duration (HH:MM) to decimal hours
        let durationHours = 0;
        if (duration && typeof duration === 'string' && duration.includes(':')) {
            const [hours, minutes] = duration.split(':').map(Number);
            durationHours = (hours || 0) + (minutes || 0) / 60;
        } else if (typeof duration === 'number') {
            durationHours = duration;
        }

        const query = `
            INSERT INTO maintenance_requests (
                subject, 
                description, 
                maintenance_for, 
                maintenance_type, 
                category,
                priority, 
                equipment_id, 
                work_center_id,
                maintenance_team_id, 
                technician_id,
                requested_by_id,
                created_by, 
                company_id,
                scheduled_date,
                duration_hours,
                stage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            subject,
            description || '',
            maintenanceFor || 'Equipment',
            maintenanceType,
            category || null,
            parseInt(priority) || 0,
            maintenanceFor === 'Equipment' ? (equipmentId ? parseInt(equipmentId) : null) : null,
            maintenanceFor === 'Work Center' ? (workCenterId ? parseInt(workCenterId) : null) : null,
            teamId ? parseInt(teamId) : null,
            technicianId ? parseInt(technicianId) : null,
            requestedById ? parseInt(requestedById) : session.user.id,
            session.user.id,
            1, // company_id default to 1
            scheduledDate || null,
            durationHours,
            'new'
        ];

        console.log('Saving maintenance request with values:', values);

        const [result]: any = await pool.execute(query, values);

        return NextResponse.json({
            success: true,
            requestId: result.insertId
        }, { status: 201 });

    } catch (error: any) {
        console.error('Save maintenance request error:', error);
        return NextResponse.json({
            error: 'Failed to save maintenance request',
            details: error.message
        }, { status: 500 });
    }
}
