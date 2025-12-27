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
                mt.id,
                mt.name,
                mt.description,
                mt.team_leader_id,
                u.username as team_leader_name,
                mt.created_at
            FROM maintenance_teams mt
            LEFT JOIN users u ON mt.team_leader_id = u.id
            ORDER BY mt.name ASC
        `;

        const [teams]: any = await pool.execute(query);

        return NextResponse.json({
            success: true,
            teams
        });

    } catch (error: any) {
        console.error('Fetch teams error:', error);
        return NextResponse.json({
            error: 'Failed to fetch teams',
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { name, description, teamLeaderId } = data;

        if (!name) {
            return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
        }

        const query = `
            INSERT INTO maintenance_teams (
                name,
                description,
                team_leader_id
            ) VALUES (?, ?, ?)
        `;

        const values = [
            name,
            description || null,
            teamLeaderId ? parseInt(teamLeaderId) : null
        ];

        const [result]: any = await pool.execute(query, values);

        return NextResponse.json({
            success: true,
            message: 'Team created successfully',
            teamId: result.insertId
        });

    } catch (error: any) {
        console.error('Create team error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({
                error: 'A team with this name already exists'
            }, { status: 400 });
        }
        return NextResponse.json({
            error: 'Failed to create team',
            details: error.message
        }, { status: 500 });
    }
}
