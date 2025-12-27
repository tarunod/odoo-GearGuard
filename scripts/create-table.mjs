import mysql from 'mysql2/promise';

async function createTable() {
    try {
        console.log('Connecting to MySQL RDS...');
        const connection = await mysql.createConnection({
            host: 'odoo-gearguard.cgrg22gy4ttk.us-east-1.rds.amazonaws.com',
            user: 'admin',
            password: 'm[eA6`?9D1Wj',
            port: 3306,
        });

        console.log('Connected successfully! Ensuring database and table exist...');

        // Create database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS gearguard_db;');
        await connection.query('USE gearguard_db;');

        // Drop tables if they exist to allow for schema updates (drop junction/dependent tables first)
        await connection.execute('DROP TABLE IF EXISTS maintenance_logs;');
        await connection.execute('DROP TABLE IF EXISTS maintenance_requests;');
        await connection.execute('DROP TABLE IF EXISTS maintenance_team_members;');
        await connection.execute('DROP TABLE IF EXISTS equipment;');
        await connection.execute('DROP TABLE IF EXISTS maintenance_teams;');
        await connection.execute('DROP TABLE IF EXISTS users;');

        await connection.execute(`
      CREATE TABLE users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
        console.log('- Users table created');

        await connection.execute(`
      CREATE TABLE maintenance_teams (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
        console.log('- Maintenance teams table created');

        await connection.execute(`
      CREATE TABLE equipment (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        serial_number VARCHAR(100) UNIQUE NOT NULL,
        category_name text NOT NULL,
        department_name text NOT NULL,
        assigned_employee_id BIGINT NULL,
        maintenance_team_id BIGINT NOT NULL,
        default_technician_id BIGINT NOT NULL,
        purchase_date DATE,
        warranty_end_date DATE,
        location VARCHAR(255),
        is_scrapped BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_employee_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (maintenance_team_id) REFERENCES maintenance_teams(id) ON DELETE CASCADE,
        FOREIGN KEY (default_technician_id) REFERENCES users(id) ON DELETE RESTRICT
      );
    `);
        console.log('- Equipment table created');

        await connection.execute(`
      CREATE TABLE maintenance_team_members (
        team_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        PRIMARY KEY (team_id, user_id),
        FOREIGN KEY (team_id) REFERENCES maintenance_teams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
        console.log('- Maintenance team members table created');

        await connection.execute(`
      CREATE TABLE maintenance_requests (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        description TEXT,
        
        -- Maintenance classification
        maintenance_for VARCHAR(100), 
        maintenance_type VARCHAR(20) NOT NULL,
        CONSTRAINT chk_maintenance_type CHECK (maintenance_type IN ('corrective', 'preventive')),

        -- Priority: 1 (Low), 2 (Medium), 3 (High)
        priority SMALLINT NOT NULL,
        CONSTRAINT chk_priority CHECK (priority IN (1, 2, 3)),

        -- Workflow stage
        stage VARCHAR(20) NOT NULL DEFAULT 'new',
        CONSTRAINT chk_stage CHECK (stage IN ('new', 'in_progress', 'repaired', 'scrap')),

        -- Relations
        equipment_id BIGINT NOT NULL,
        maintenance_team_id BIGINT NOT NULL,
        technician_id BIGINT,
        company_id BIGINT NOT NULL,

        -- Scheduling & execution
        scheduled_date DATE,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        duration_hours DECIMAL(5,2),

        -- Audit
        created_by BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
        FOREIGN KEY (maintenance_team_id) REFERENCES maintenance_teams(id) ON DELETE RESTRICT,
        FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
      );
    `);
        console.log('- Maintenance requests table created');

        await connection.execute(`
      CREATE TABLE maintenance_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        request_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        action VARCHAR(100) NOT NULL, -- status_change / comment / scrap
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
        console.log('- Maintenance logs table created');

        // List columns for confirmation
        const tables = [
            'users',
            'maintenance_teams',
            'equipment',
            'maintenance_team_members',
            'maintenance_requests',
            'maintenance_logs'
        ];
        for (const table of tables) {
            console.log(`\nListing columns in ${table}:`);
            const [columns] = await connection.execute(`DESCRIBE ${table};`);
            columns.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type}`);
            });
        }

        await connection.end();
    } catch (err) {
        console.error('Operation failed:', err.message);
        process.exit(1);
    }
}

createTable();
