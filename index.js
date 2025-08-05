// index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Ensure the db.js file exists and exports a 'pool' object
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple route to confirm the backend is running
app.get('/', (req, res) => {
    res.send('🚦 TRICYPAY backend is running!');
});

// ✅ New API Endpoint to Submit Report
app.post('/submit-report', async (req, res) => {
    try {
        console.log('📥 Received report:');
        console.log('Request body:', req.body);

        // Check if the request body is empty
        if (Object.keys(req.body).length === 0) {
            console.error('❌ Request body is empty.');
            return res.status(400).json({ error: "Empty request body." });
        }

        // Extract and validate data from the request body,
        // using the snake_case keys that the mobile app is now sending.
        const {
            user_id,
            driver_id,
            operator_name,
            plate_number,
            parking_obstruction_violations,
            traffic_movement_violations,
            driver_behavior_violations,
            licensing_documentation_violations,
            attire_fare_violations,
            image_description,
            image_url,
        } = req.body;

        // Ensure required fields are present and not empty
        if (!user_id || !driver_id || !plate_number) {
            console.error('❌ Missing required fields: user_id, driver_id, or plate_number.');
            return res.status(400).json({ error: "Missing required fields: user_id, driver_id, or plate_number." });
        }

        // The corrected and more robust SQL query
        const query = `
            INSERT INTO reports (
                user_id,
                driver_id,
                operator_name,
                plate_number,
                parking_obstruction_violations,
                traffic_movement_violations,
                driver_behavior_violations,
                licensing_documentation_violations,
                attire_fare_violations,
                image_description,
                image_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;

        const values = [
            user_id,
            driver_id,
            operator_name,
            plate_number,
            parking_obstruction_violations,
            traffic_movement_violations,
            driver_behavior_violations,
            licensing_documentation_violations,
            attire_fare_violations,
            image_description,
            image_url,
        ];

        // Log the query and values before executing for debugging
        console.log('Executing query:', query);
        console.log('With values:', values);

        const result = await pool.query(query, values);
        console.log('✅ Report saved to database. Row:', result.rows[0]);
        
        // Send a success response
        res.status(201).json({ message: "Report submitted successfully." });
    } catch (err) {
        console.error('❌ Error executing query or processing request:', err);
        // Send a detailed error response
        res.status(500).json({ error: "Failed to submit report", details: err.message, stack: err.stack });
    }
});

// A robust server start function
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    }).on('error', (err) => {
        console.error('❌ Server startup error:', err);
        // Attempt to restart or handle the error gracefully
        process.exit(1);
    });
};

// Check database connection before starting the server
const checkDatabaseConnection = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful.');
        startServer();
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        console.log('Attempting to reconnect...');
        // Retry connection after a delay
        setTimeout(checkDatabaseConnection, 5000);
    }
};

checkDatabaseConnection();
