import mysql from 'mysql2/promise';

async function createCategoriesTable() {
    try {
        console.log('Connecting to MySQL RDS...');
        const connection = await mysql.createConnection({
            host: 'odoo-gearguard.cgrg22gy4ttk.us-east-1.rds.amazonaws.com',
            user: 'admin',
            password: 'm[eA6`?9D1Wj',
            port: 3306,
            database: 'gearguard_db'
        });

        console.log('Connected successfully! Creating equipment_categories table...');

        // Create equipment_categories table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS equipment_categories (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                company_id BIGINT DEFAULT 1,
                responsible_technician_id BIGINT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (responsible_technician_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('- equipment_categories table created');

        await connection.end();
        console.log('\nTable creation completed successfully!');
    } catch (err) {
        console.error('Operation failed:', err.message);
        process.exit(1);
    }
}

createCategoriesTable();
