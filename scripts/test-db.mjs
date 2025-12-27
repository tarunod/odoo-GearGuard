import mysql from 'mysql2/promise';

async function testConnection() {
    try {
        console.log('Connecting to MySQL RDS...');

        const connection = await mysql.createConnection({
            host: 'odoo-gearguard.cgrg22gy4ttk.us-east-1.rds.amazonaws.com',
            user: 'admin',
            password: 'm[eA6`?9D1Wj',
            port: 3306,
        });

        console.log('Connected successfully!');

        const [rows] = await connection.execute('SELECT NOW() AS now, VERSION() AS version;');
        console.log(rows[0]);

        await connection.end();
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}

testConnection();
