import mysql from 'mysql2/promise';

async function createWorkCentersTable() {
    try {
        console.log('Connecting to MySQL RDS...');
        const connection = await mysql.createConnection({
            host: 'odoo-gearguard.cgrg22gy4ttk.us-east-1.rds.amazonaws.com',
            user: 'admin',
            password: 'm[eA6`?9D1Wj',
            port: 3306,
            database: 'gearguard_db'
        });

        console.log('Connected successfully! Creating work_centers table...');

        const query = `
            CREATE TABLE IF NOT EXISTS work_centers (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                code VARCHAR(50) UNIQUE NOT NULL,
                tag VARCHAR(100),
                cost_per_hour DECIMAL(10,2) DEFAULT 0.00,
                capacity_time_efficiency DECIMAL(5,2) DEFAULT 100.00,
                oee_target DECIMAL(5,2),
                is_active BOOLEAN DEFAULT TRUE,
                company_id BIGINT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT chk_capacity_efficiency CHECK (capacity_time_efficiency BETWEEN 0 AND 100),
                CONSTRAINT chk_oee_target CHECK (oee_target BETWEEN 0 AND 100)
            );
        `;

        await connection.execute(query);
        console.log('work_centers table created successfully');

        // Verify columns
        console.log('\nListing columns in work_centers:');
        const [columns] = await connection.execute('DESCRIBE work_centers;');
        columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type}`);
        });

        await connection.end();
    } catch (err) {
        console.error('Operation failed:', err.message);
        process.exit(1);
    }
}

createWorkCentersTable();
