import mysql from 'mysql2/promise';

async function updateSchema() {
    try {
        console.log('Connecting to MySQL RDS...');
        const connection = await mysql.createConnection({
            host: 'odoo-gearguard.cgrg22gy4ttk.us-east-1.rds.amazonaws.com',
            user: 'admin',
            password: 'm[eA6`?9D1Wj',
            port: 3306,
            database: 'gearguard_db'
        });

        console.log('Connected successfully! Updating maintenance_requests table...');

        // 1. Make equipment_id nullable
        await connection.execute('ALTER TABLE maintenance_requests MODIFY COLUMN equipment_id BIGINT NULL;');
        console.log('- Made equipment_id nullable');

        // 2. Add work_center_id column
        // First check if it exists
        const [columns] = await connection.execute('DESCRIBE maintenance_requests;');
        const hasWorkCenterId = columns.some(col => col.Field === 'work_center_id');

        if (!hasWorkCenterId) {
            await connection.execute('ALTER TABLE maintenance_requests ADD COLUMN work_center_id BIGINT NULL AFTER equipment_id;');
            console.log('- Added work_center_id column');

            await connection.execute('ALTER TABLE maintenance_requests ADD FOREIGN KEY (work_center_id) REFERENCES work_centers(id) ON DELETE CASCADE;');
            console.log('- Added foreign key for work_center_id');
        } else {
            console.log('- work_center_id column already exists');
        }

        // 3. Add category column
        const hasCategory = columns.some(col => col.Field === 'category');
        if (!hasCategory) {
            await connection.execute('ALTER TABLE maintenance_requests ADD COLUMN category VARCHAR(100) NULL AFTER maintenance_type;');
            console.log('- Added category column');
        } else {
            console.log('- category column already exists');
        }

        // 4. Add team_leader_id to maintenance_teams
        const [teamCols] = await connection.execute('DESCRIBE maintenance_teams;');
        const hasTeamLeader = teamCols.some(col => col.Field === 'team_leader_id');
        if (!hasTeamLeader) {
            await connection.execute('ALTER TABLE maintenance_teams ADD COLUMN team_leader_id BIGINT NULL AFTER description;');
            await connection.execute('ALTER TABLE maintenance_teams ADD FOREIGN KEY (team_leader_id) REFERENCES users(id) ON DELETE SET NULL;');
            console.log('- Added team_leader_id to maintenance_teams');
        } else {
            console.log('- team_leader_id already exists in maintenance_teams');
        }

        // 5. Add requested_by_id to maintenance_requests
        const hasRequestedBy = columns.some(col => col.Field === 'requested_by_id');
        if (!hasRequestedBy) {
            await connection.execute('ALTER TABLE maintenance_requests ADD COLUMN requested_by_id BIGINT NULL AFTER completed_at;');
            await connection.execute('ALTER TABLE maintenance_requests ADD FOREIGN KEY (requested_by_id) REFERENCES users(id) ON DELETE SET NULL;');
            console.log('- Added requested_by_id to maintenance_requests');
        } else {
            console.log('- requested_by_id already exists in maintenance_requests');
        }

        await connection.end();
    } catch (err) {
        console.error('Operation failed:', err.message);
        process.exit(1);
    }
}

updateSchema();
