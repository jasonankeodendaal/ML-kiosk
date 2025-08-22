
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

// Load environment variables. 
// This must be done before accessing process.env.
const dotenvResult = require('dotenv').config();

if (dotenvResult.error) {
    if (dotenvResult.error.code === 'ENOENT') {
        console.error("FATAL ERROR: .env file not found. Please create a '.env' file in the same directory as this server.js file.");
        console.error("The .env file should contain a line like: API_KEY=your-secret-key-here");
    } else {
        console.error("FATAL ERROR: Could not parse .env file.", dotenvResult.error);
    }
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;
const dbFilePath = path.join(__dirname, 'data.json');
const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.error("FATAL ERROR: API_KEY is not defined in your .env file.");
    console.error("Please make sure your .env file contains a line like: API_KEY=your-secret-key-here");
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for potentially large data blobs

// API Key Auth Middleware
const authenticateKey = (req, res, next) => {
    if (req.header('x-api-key') !== apiKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
    next();
};

app.use('/data', authenticateKey);

// Utility functions
const readData = () => {
    try {
        if (!fs.existsSync(dbFilePath)) {
            // If the file doesn't exist, create it with an empty object
            fs.writeFileSync(dbFilePath, JSON.stringify({}, null, 2));
            return {};
        }
        const rawData = fs.readFileSync(dbFilePath);
        // If file is empty, return empty object
        if (rawData.length === 0) {
            return {};
        }
        return JSON.parse(rawData);
    } catch (error) {
        console.error("Error reading data file:", error);
        return {};
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing data file:", error);
    }
};

// API Endpoints
// GET /data - Retrieve the entire database
app.get('/data', (req, res) => {
    const data = readData();
    // Check if data is empty object
    if (Object.keys(data).length === 0) {
       return res.status(404).send('No data found. Push data from the kiosk first.');
    }
    res.json(data);
});

// POST /data - Overwrite the entire database
app.post('/data', (req, res) => {
    const newData = req.body;
    writeData(newData);
    res.status(200).json({ message: 'Data saved successfully' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log('Protecting endpoints with API_KEY.');
});
