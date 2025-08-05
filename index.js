// Import required modules
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Set up the PostgreSQL connection pool using the DATABASE_URL environment variable from Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Required for secure connections to Railway's PostgreSQL database
    rejectUnauthorized: false
  }
});

// Test the database connection on startup
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client from pool', err.stack);
  }
  console.log('✅ Connected to PostgreSQL database!');
  client.release();
});

// A simple root endpoint to confirm the server is running
app.get('/', (req, res) => {
  res.send('Tricypay Backend is running!');
});

// Endpoint to submit a new report
app.post('/submit-report', async (req, res) => {
  const {
    userId,
    driverId,
    operatorName,
    plateNumber,
    parkingObstructionViolations,
    trafficMovementViolations,
    driverBehaviorViolations,
    licensingDocumentationViolations,
    attireFareViolations,
    imageDescription,
    imageUrl, // This can be null
  } = req.body;

  // Log the received data for debugging
  console.log('Received report data:', req.body);

  // Validate that required fields are not empty
  if (!driverId) {
    return res.status(400).json({ error: 'Driver ID is required.' });
  }

  // Define the SQL INSERT query with placeholders for security
  const insertQuery = `
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

  // Define the values to be inserted, mapping them to the placeholders
  const values = [
    userId,
    driverId,
    operatorName,
    plateNumber,
    parkingObstructionViolations,
    trafficMovementViolations,
    driverBehaviorViolations,
    licensingDocumentationViolations,
    attireFareViolations,
    imageDescription,
    imageUrl
  ];

  try {
    // Execute the query using the connection pool
    const result = await pool.query(insertQuery, values);
    
    // Log the successful insertion result
    console.log('✅ Successfully inserted report:', result.rows[0]);

    // Send a success response
    res.status(200).json({
      message: 'Report submitted successfully!',
      report: result.rows[0]
    });
  } catch (err) {
    // Log the error and send an error response
    console.error('❌ Error saving report to database:', err.stack);
    res.status(500).json({
      error: 'Failed to save report to database.',
      details: err.message
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
