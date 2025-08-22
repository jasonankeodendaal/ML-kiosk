
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('redis');

// Load environment variables. 
// This must be done before accessing process.env.
const dotenvResult = require('dotenv').config();

if (dotenvResult.error) {
    if (dotenvResult.error.code === 'ENOENT') {
        console.error("FATAL ERROR: .env file not found. Please create a '.env' file in the same directory as this server.js file.");
        console.error("The .env file should contain lines like: \nAPI_KEY=your-secret-key-here\nREDIS_URL=redis://localhost:6379");
    } else {
        console.error("FATAL ERROR: Could not parse .env file.", dotenvResult.error);
    }
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const apiKey = process.env.API_KEY;
const REDIS_KEY = 'kiosk_data';

if (!apiKey) {
    console.error("FATAL ERROR: API_KEY is not defined in your .env file.");
    console.error("Please make sure your .env file contains a line like: API_KEY=your-secret-key-here");
    process.exit(1);
}
if (!process.env.REDIS_URL) {
    console.warn("WARNING: REDIS_URL is not defined in .env file. Falling back to default 'redis://localhost:6379'.");
}


// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for potentially large data blobs

// API Key Authentication Middleware
const authenticateKey = (req, res, next) => {
    const providedKey = req.header('x-api-key');
    if (!providedKey || providedKey !== apiKey) {
        return res.status(401).send('Unauthorized: Invalid API Key');
    }
    next();
};

// Initialize Redis Client
const redisClient = createClient({ url: redisUrl });
redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
    console.error("\nCould not connect to Redis. Please ensure Redis is running and the REDIS_URL in your .env file is correct.");
    process.exit(1);
});

(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis.');
    } catch(err) {
        // The 'error' event listener will handle logging the detailed error.
        // We just need to prevent the app from continuing.
        return;
    }
})();

// --- API Endpoints ---

// GET /data - Retrieve the entire database
app.get('/data', authenticateKey, async (req, res) => {
    try {
        const data = await redisClient.get(REDIS_KEY);
        if (data) {
            res.status(200).json(JSON.parse(data));
        } else {
            res.status(404).send('No data found. Push data from the kiosk first.');
        }
    } catch (err) {
        console.error('Error getting data from Redis:', err);
        res.status(500).send('Server error');
    }
});

// POST /data - Overwrite the entire database
app.post('/data', authenticateKey, async (req, res) => {
    try {
        const dataToStore = JSON.stringify(req.body);
        await redisClient.set(REDIS_KEY, dataToStore);
        res.status(200).send('Data saved successfully.');
    } catch (err) {
        console.error('Error setting data in Redis:', err);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
