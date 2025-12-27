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
            stage
        } = data;

        // Basic validation
        const targetId = maintenanceFor === 'Work Center' ? workCenterId : equipmentId;
        if (!subject || (!targetId && maintenanceFor !== 'None') || !teamId || !maintenanceType || !priority) {
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
            UPDATE maintenance_requests SET 
                subject = ?, 
                description = ?, 
                maintenance_for = ?, 
                maintenance_type = ?, 
                category = ?,
                priority = ?, 
                equipment_id = ?, 
                work_center_id = ?,
                maintenance_team_id = ?, 
                technician_id = ?,
                requested_by_id = ?,
                scheduled_date = ?,
                duration_hours = ?,
                stage = ?
            WHERE id = ?
        `;

        const values = [
            subject || '',
            description || '',
            maintenanceFor || 'Equipment',
            maintenanceType || 'corrective',
            category || null,
            priority || 0,
            maintenanceFor === 'Equipment' ? (equipmentId || null) : null,
            maintenanceFor === 'Work Center' ? (workCenterId || null) : null,
            teamId || null,
            technicianId || null,
            requestedById || null,
            scheduledDate || null,
            durationHours || 0,
            stage || 'new',
            id
        ];

        await pool.execute(query, values);

        // If stage is 'scrap' and this is for equipment, update the equipment's is_scrapped status
        if (stage === 'scrap' && maintenanceFor === 'Equipment' && equipmentId) {
            await pool.execute(
                'UPDATE equipment SET is_scrapped = 1, scrap_date = CURDATE() WHERE id = ?',
                [equipmentId]
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Maintenance request updated successfully'
        });

    } catch (error: any) {
        console.error('Update maintenance request error:', error);
        return NextResponse.json({
            error: 'Failed to update maintenance request',
            details: error.message
        }, { status: 500 });
    }
}
