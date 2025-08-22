# Kiosk - Custom API Server Example (Node.js + Redis)

This is an example backend server for the Interactive Kiosk application, designed for users who want to host their own data backend.

It uses:
- **Node.js** and **Express** to create a simple API server.
- **Redis** as a fast, in-memory database to store the entire kiosk data structure as a single JSON string.

## Features
- A `GET /data` endpoint to retrieve the entire kiosk database.
- A `POST /data` endpoint to overwrite the entire kiosk database.
- Simple API key authentication to protect your endpoints.

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or newer)
- [Redis](https://redis.io/docs/getting-started/installation/) installed and running on your machine or a cloud service.

## Setup Instructions

1.  **Navigate to the Server Directory:**
    - Open your terminal and navigate to this specific directory.
    - Example: `cd path/to/your/project/server_examples/custom_api_redis`
    
2.  **Install Dependencies:**
    - Run the following command:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    - In this directory, create a new file named `.env`.
    - Open the `.env` file in a text editor and add the following content. Replace `your-super-secret-api-key-here` with a long, random string.

    ```
    # The port the server will run on
    PORT=3001

    # Your Redis connection string. For a local install, this is usually all you need.
    # For cloud providers like Redis Labs or Upstash, get the connection URL from their dashboard.
    REDIS_URL=redis://localhost:6379

    # A long, secret key to protect your API endpoints.
    # The kiosk app must use this same key in its settings.
    API_KEY=your-super-secret-api-key-here
    ```

4.  **Start the Server:**
    - Run the following command:
    ```bash
    node server.js
    ```
    - You should see a message like: `Server listening on port 3001`. Keep this terminal running.

5.  **Configure Your Kiosk Application:**
    - Open your Interactive Kiosk application.
    - Navigate to `Admin > Settings > API Integrations`.
    - In the **"Custom API URL"** field, enter the URL of your new server (e.g., `http://localhost:3001/data` if running locally).
    - In the **"Custom API Auth Key"** field, enter the exact `API_KEY` you set in your `.env` file.
    - Click **"Save Changes"**.

6.  **Connect and Sync:**
    - Navigate to `Admin > Storage`.
    - Click the **"Connect"** button under the "Custom API Sync" card.
    - Go to the `Admin > Cloud Sync` tab.
    - Click **"Push to Cloud"** to upload your initial data to your Redis database via your new API.

You are now running a self-hosted backend for your kiosk system!