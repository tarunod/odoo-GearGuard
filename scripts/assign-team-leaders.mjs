import mysql from 'mysql2/promise';

async function assignLeaders() {
    try {
        console.log('Connecting to MySQL RDS...');
        const connection = await mysql.createConnection({
            host: 'odoo-gearguard.cgrg22gy4ttk.us-east-1.rds.amazonaws.com',
            user: 'admin',
            password: 'm[eA6`?9D1Wj',
            port: 3306,
            database: 'gearguard_db'
        });

        console.log('Connected successfully! Assigning team leaders...');

        // HVAC Team (ID 1) -> tech_john (ID 2)
        // Electrical Team (ID 2) -> tech_sarah (ID 3)

        await connection.execute('UPDATE maintenance_teams SET team_leader_id = 2 WHERE id = 1');
        await connection.execute('UPDATE maintenance_teams SET team_leader_id = 3 WHERE id = 2');

        console.log('Team leaders assigned successfully');

        await connection.end();
    } catch (err) {
        console.error('Operation failed:', err.message);
        process.exit(1);
    }
}

assignLeaders();
