import mysql from 'mysql2/promise';

async function seedWorkCenters() {
    try {
        console.log('Connecting to MySQL RDS...');
        const connection = await mysql.createConnection({
            host: 'odoo-gearguard.cgrg22gy4ttk.us-east-1.rds.amazonaws.com',
            user: 'admin',
            password: 'm[eA6`?9D1Wj',
            port: 3306,
            database: 'gearguard_db'
        });

        console.log('Connected successfully!');

        const sampleData = [
            ['CNC Machine 01', 'CNC-01', 'Machining', 150.00, 95.00, 85.00, 1],
            ['Assembly Line A', 'ASM-A', 'Assembly', 80.00, 90.00, 80.00, 1],
            ['Quality Control Lab', 'QC-LAB', 'Inspection', 120.00, 100.00, 90.00, 1],
            ['Packaging Station', 'PKG-01', 'Logistics', 50.00, 98.00, 85.00, 1]
        ];

        const query = `
            INSERT INTO work_centers (name, code, tag, cost_per_hour, capacity_time_efficiency, oee_target, company_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            tag = VALUES(tag),
            cost_per_hour = VALUES(cost_per_hour),
            capacity_time_efficiency = VALUES(capacity_time_efficiency),
            oee_target = VALUES(oee_target),
            company_id = VALUES(company_id);
        `;

        console.log('Seeding sample data...');

        for (const record of sampleData) {
            await connection.execute(query, record);
            console.log(`  - Inserted/Updated: ${record[0]} (${record[1]})`);
        }

        console.log('\nSeeding completed successfully!');

        // Verify counts
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM work_centers');
        console.log(`Total records in work_centers: ${rows[0].count}`);

        await connection.end();
    } catch (err) {
        console.error('Operation failed:', err.message);
        process.exit(1);
    }
}

seedWorkCenters();
