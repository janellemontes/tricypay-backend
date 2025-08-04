const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db'); // Import the database pool from db.js

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <-- IMPORTANT: Add this for form-urlencoded data

// Simple route to confirm the backend is running
app.get('/', (req, res) => {
    res.send('🚦 TRICYPAY backend is running!');
});

// ✅ New API Endpoint to Submit Report
app.post('/submit-report', async (req, res) => {
    try {
        console.log('📥 Received report:');
        console.log('Request body:', req.body); // Log the received data

        // Extract data from the request body
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

        // Ensure required fields are present
        if (!user_id || !driver_id || !plate_number) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // Construct and execute the SQL query using a parameterized approach
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
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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

        const result = await pool.query(query, values);
        console.log('✅ Report saved to database. Row:', result.rows[0]);
        
        // Send a success response
        res.status(201).json({ message: "Report submitted successfully." });
    } catch (err) {
        console.error('❌ DB Error:', err.message);
        // Send a detailed error response
        res.status(500).json({ error: "Failed to submit report", details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});