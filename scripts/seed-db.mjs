import mysql from 'mysql2/promise';

async function seedData() {
    try {
        console.log('Connecting to MySQL RDS...');
        const connection = await mysql.createConnection({
            host: 'odoo-gearguard.cgrg22gy4ttk.us-east-1.rds.amazonaws.com',
            user: 'admin',
            password: 'm[eA6`?9D1Wj',
            port: 3306,
            database: 'gearguard_db'
        });

        console.log('Connected successfully! Seeding data...');

        // 1. Seed Users
        const users = [
            ['admin', 'admin@gearguard.com', 'password123', 'admin', 'Management'],
            ['tech_john', 'john@gearguard.com', 'password123', 'user', 'Maintenance'],
            ['tech_sarah', 'sarah@gearguard.com', 'password123', 'user', 'Maintenance'],
            ['staff_alice', 'alice@gearguard.com', 'password123', 'user', 'Operations']
        ];

        for (const user of users) {
            await connection.execute(
                'INSERT INTO users (username, email, password, role, department) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE username=username;',
                user
            );
        }
        console.log('- Users seeded');

        // Get user IDs for later
        const [userRows] = await connection.execute('SELECT id, username FROM users');
        const userMap = Object.fromEntries(userRows.map(u => [u.username, u.id]));

        // 2. Seed Maintenance Teams
        const teams = [
            ['HVAC Team', 'Specialized in heating, ventilation, and air conditioning maintenance.'],
            ['Electrical Team', 'Handles all electrical infrastructure and power systems.']
        ];

        for (const team of teams) {
            await connection.execute(
                'INSERT INTO maintenance_teams (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE name=name;',
                team
            );
        }
        console.log('- Maintenance teams seeded');

        // Get team IDs
        const [teamRows] = await connection.execute('SELECT id, name FROM maintenance_teams');
        const teamMap = Object.fromEntries(teamRows.map(t => [t.name, t.id]));

        // 3. Seed Maintenance Team Members
        const members = [
            [teamMap['HVAC Team'], userMap['tech_john']],
            [teamMap['Electrical Team'], userMap['tech_sarah']]
        ];

        for (const member of members) {
            await connection.execute(
                'INSERT IGNORE INTO maintenance_team_members (team_id, user_id) VALUES (?, ?);',
                member
            );
        }
        console.log('- Maintenance team members seeded');

        // 4. Seed Equipment
        const equipment = [
            ['Main AHU-01', 'SN-HVAC-001', 1, 1, userMap['staff_alice'], teamMap['HVAC Team'], userMap['tech_john'], '2023-01-15', '2025-01-15', 'Roof Block A'],
            ['Backup Generator GEN-22', 'SN-PWR-022', 2, 1, null, teamMap['Electrical Team'], userMap['tech_sarah'], '2022-06-10', '2024-06-10', 'Basement'],
            ['Chiller Unit CH-05', 'SN-HVAC-005', 1, 1, userMap['staff_alice'], teamMap['HVAC Team'], userMap['tech_john'], '2023-03-20', '2026-03-20', 'Ground Floor']
        ];

        for (const eq of equipment) {
            await connection.execute(
                `INSERT INTO equipment 
                (name, serial_number, category_id, department_id, assigned_employee_id, maintenance_team_id, default_technician_id, purchase_date, warranty_end_date, location) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE serial_number=serial_number;`,
                eq
            );
        }
        console.log('- Equipment seeded');

        console.log('\nDatabase seeding completed successfully!');
        await connection.end();
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exit(1);
    }
}

seedData();
