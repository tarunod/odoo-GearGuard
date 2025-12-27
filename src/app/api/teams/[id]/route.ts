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
        const { name, description, teamLeaderId } = data;

        if (!name) {
            return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
        }

        const query = `
            UPDATE maintenance_teams 
            SET name = ?, 
                description = ?, 
                team_leader_id = ?
            WHERE id = ?
        `;

        const values = [
            name,
            description || null,
            teamLeaderId ? parseInt(teamLeaderId) : null,
            id
        ];

        await pool.execute(query, values);

        return NextResponse.json({
            success: true,
            message: 'Team updated successfully'
        });

    } catch (error: any) {
        console.error('Update team error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({
                error: 'A team with this name already exists'
            }, { status: 400 });
        }
        return NextResponse.json({
            error: 'Failed to update team',
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

        // Check if team is being used by equipment or maintenance requests
        const [equipmentCheck]: any = await pool.execute(
            'SELECT COUNT(*) as count FROM equipment WHERE maintenance_team_id = ?',
            [id]
        );

        const [requestsCheck]: any = await pool.execute(
            'SELECT COUNT(*) as count FROM maintenance_requests WHERE maintenance_team_id = ?',
            [id]
        );

        if (equipmentCheck[0].count > 0 || requestsCheck[0].count > 0) {
            return NextResponse.json({
                error: 'Cannot delete team that is assigned to equipment or maintenance requests'
            }, { status: 400 });
        }

        // Delete the team
        const query = 'DELETE FROM maintenance_teams WHERE id = ?';
        await pool.execute(query, [id]);

        return NextResponse.json({
            success: true,
            message: 'Team deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete team error:', error);
        return NextResponse.json({
            error: 'Failed to delete team',
            details: error.message
        }, { status: 500 });
    }
}
