import mysql from 'mysql2/promise';

async function seedCategories() {
    try {
        console.log('Connecting to MySQL RDS...');
        const connection = await mysql.createConnection({
            host: 'odoo-gearguard.cgrg22gy4ttk.us-east-1.rds.amazonaws.com',
            user: 'admin',
            password: 'm[eA6`?9D1Wj',
            port: 3306,
            database: 'gearguard_db'
        });

        console.log('Connected successfully! Seeding categories...');

        // Get user IDs
        const [users] = await connection.execute('SELECT id, username FROM users');
        const userMap = Object.fromEntries(users.map(u => [u.username, u.id]));

        // Seed default categories
        const categories = [
            ['HVAC', userMap['tech_john'] || null],
            ['Electrical', userMap['tech_sarah'] || null],
            ['Mechanical', userMap['tech_john'] || null],
            ['Plumbing', null],
            ['IT Equipment', null]
        ];

        for (const [name, techId] of categories) {
            await connection.execute(
                'INSERT INTO equipment_categories (name, company_id, responsible_technician_id) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE name=name',
                [name, techId]
            );
        }
        console.log('- Categories seeded');

        // Update existing equipment to use category IDs instead of names
        console.log('- Updating equipment table...');

        // Get category IDs
        const [cats] = await connection.execute('SELECT id, name FROM equipment_categories');
        const catMap = Object.fromEntries(cats.map(c => [c.name, c.id]));

        // Update equipment records
        await connection.execute(`
            UPDATE equipment 
            SET category_name = 'HVAC' 
            WHERE category_name LIKE '%HVAC%' OR category_name LIKE '%AHU%' OR category_name LIKE '%Chiller%'
        `);

        await connection.execute(`
            UPDATE equipment 
            SET category_name = 'Electrical' 
            WHERE category_name LIKE '%Generator%' OR category_name LIKE '%Power%' OR category_name LIKE '%Electrical%'
        `);

        console.log('- Equipment updated');

        await connection.end();
        console.log('\nSeeding completed successfully!');
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exit(1);
    }
}

seedCategories();
