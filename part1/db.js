var mysql = require('mysql2/promise');

let db;
let connection;

(async () => {
    try {

        connection = await mysql.createConnection({
            host: 'localhost'
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS DogsDB');
        await connection.end();

        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            database: 'DogsDB'
        });

        console.log("got here!");

        await db.execute(`
            CREATE TABLE IF NOT EXISTS Users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('owner', 'walker') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("and here!");

        await db.execute(`
            CREATE TABLE IF NOT EXISTS Dogs (
            dog_id INT AUTO_INCREMENT PRIMARY KEY,
            owner_id INT NOT NULL,
            name VARCHAR(50) NOT NULL,
            size ENUM('small', 'medium', 'large') NOT NULL,
            FOREIGN KEY (owner_id) REFERENCES Users(user_id)
            );
        `);

        console.log("and also here!");

        const [rows] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
        if (rows[0].count === 0) {
            await db.execute(`
                INSERT INTO Users (username, email, password_hash, role)
                VALUES
                ('alice123', 'alice@example.com', 'hashed123', 'owner'),
                ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
                ('carol123', 'carol@example.com', 'hashed789', 'owner'),
                ('de_nice', 'dennis@example.com', 'hashed111', 'walker'),
                ('ayayron', 'aaron@example.com', 'hashed666', 'owner');
            `);

            await db.execute(`
                INSERT INTO Dogs (owner_id, name, size)
                VALUES
                ('1', 'Max', 'medium'),
                ('3', 'Bella', 'small'),
                ('4', 'Gordon Ramsey 2', 'large'),
                ('2', 'Whoodlegarden Pombungledungus', 'medium'),
                ('5', 'Xanthor', 'medium');
            `);
            console.log("In theory, it should now be set up.");
        }

        console.log("got here!");

    } catch (error) {
        console.error('Error setting up database! Error is as follows:', error);
    }
})();

module.exports = connection;
