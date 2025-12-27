import mysql from 'mysql2/promise';

async function updateEquipmentSchema() {
    try {
        console.log('Connecting to MySQL RDS...');
        const connection = await mysql.createConnection({
            host: 'odoo-gearguard.cgrg22gy4ttk.us-east-1.rds.amazonaws.com',
            user: 'admin',
            password: 'm[eA6`?9D1Wj',
            port: 3306,
            database: 'gearguard_db'
        });

        console.log('Connected successfully! Updating equipment table...');

        // Get current columns
        const [columns] = await connection.execute('DESCRIBE equipment;');
        const columnNames = columns.map(col => col.Field);

        // Add equipment_category_id
        if (!columnNames.includes('equipment_category_id')) {
            await connection.execute(`
                ALTER TABLE equipment 
                ADD COLUMN equipment_category_id BIGINT NULL AFTER category_name,
                ADD FOREIGN KEY (equipment_category_id) REFERENCES equipment_categories(id) ON DELETE SET NULL
            `);
            console.log('- Added equipment_category_id');
        }

        // Add used_by_type
        if (!columnNames.includes('used_by_type')) {
            await connection.execute(`
                ALTER TABLE equipment 
                ADD COLUMN used_by_type ENUM('employee', 'department') NULL AFTER equipment_category_id
            `);
            console.log('- Added used_by_type');
        }

        // Add used_by_employee_id
        if (!columnNames.includes('used_by_employee_id')) {
            await connection.execute(`
                ALTER TABLE equipment 
                ADD COLUMN used_by_employee_id BIGINT NULL AFTER used_by_type,
                ADD FOREIGN KEY (used_by_employee_id) REFERENCES users(id) ON DELETE SET NULL
            `);
            console.log('- Added used_by_employee_id');
        }

        // Add assigned_date
        if (!columnNames.includes('assigned_date')) {
            await connection.execute(`
                ALTER TABLE equipment 
                ADD COLUMN assigned_date DATE NULL AFTER maintenance_team_id
            `);
            console.log('- Added assigned_date');
        }

        // Add description
        if (!columnNames.includes('description')) {
            await connection.execute(`
                ALTER TABLE equipment 
                ADD COLUMN description TEXT NULL AFTER assigned_date
            `);
            console.log('- Added description');
        }

        // Skip technician_id as default_technician_id already exists
        console.log('- Skipping technician_id (default_technician_id exists)');

        // Add employee_id (separate from assigned_employee_id)
        if (!columnNames.includes('employee_id')) {
            await connection.execute(`
                ALTER TABLE equipment 
                ADD COLUMN employee_id BIGINT NULL AFTER default_technician_id,
                ADD FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL
            `);
            console.log('- Added employee_id');
        }

        // Add scrap_date
        if (!columnNames.includes('scrap_date')) {
            await connection.execute(`
                ALTER TABLE equipment 
                ADD COLUMN scrap_date DATE NULL AFTER is_scrapped
            `);
            console.log('- Added scrap_date');
        }

        // Add work_center_id
        if (!columnNames.includes('work_center_id')) {
            await connection.execute(`
                ALTER TABLE equipment 
                ADD COLUMN work_center_id BIGINT NULL AFTER location,
                ADD FOREIGN KEY (work_center_id) REFERENCES work_centers(id) ON DELETE SET NULL
            `);
            console.log('- Added work_center_id');
        }

        await connection.end();
        console.log('\nSchema update completed successfully!');
    } catch (err) {
        console.error('Operation failed:', err.message);
        process.exit(1);
    }
}

updateEquipmentSchema();
