# Custom API Server: Node.js + Local JSON

This example provides a self-hosted API server using Node.js and a simple `data.json` file for storage. It's designed to work with the "Custom API" storage provider in the Interactive Kiosk.

---

## ✅ Step 1: Set Up Your API Server

### 1. Navigate to the Server Directory
In your terminal, change to this specific directory. If your project is on your Desktop, the command might look like this:
```bash
cd ~/Desktop/your-project-folder/server_examples/custom_api_local_json
```

### 2. Install Dependencies
Copy and paste this command into your terminal:
```bash
npm install
```

### 3. Configure Environment Variables
In this directory, create a new file named `.env`. Open it in a text editor and add the following content, replacing `your-super-secret-api-key-here` with your own secret key:
```
# The port the server will run on
PORT=3001

# A long, secret key to protect your API endpoints.
# The kiosk app must use this same key in its settings.
API_KEY=your-super-secret-api-key-here
```

### 4. Run the Server
Copy and paste this command to start the local server:
```bash
node server.js
```
The server will be running at `http://localhost:3001`. Keep this terminal window open.

---

## 🌐 Step 2: Expose API Globally with Cloudflare Tunnel

To connect your kiosk to this server (especially if they are not on the same machine), you need to expose your local server to the internet. Cloudflare Tunnel is a free and secure way to do this.

### 1. Install Cloudflare Tunnel
Follow the official instructions to install the `cloudflared` CLI tool for your operating system:
[Cloudflare Docs: Install cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)

### 2. Expose Your Server
In a **new terminal window**, copy and paste the following command:
```bash
cloudflared tunnel --url http://localhost:3001
```

### 3. Get Your Public URL
Cloudflare will give you a public HTTPS URL, for example: `https://cute-koala-lime.trycloudflare.com`. **Keep this terminal window running.** Your API is now publicly available at this URL.

---

## 🔌 Step 3: Connect the Kiosk

1.  In the Interactive Kiosk app, navigate to **Admin > Settings > API Integrations**.
2.  Paste your public Cloudflare URL into the **"Custom API URL"** field.
3.  **IMPORTANT:** Add `/data` to the end of the URL (e.g., `https://cute-koala-lime.trycloudflare.com/data`).
4.  Enter the secret `API_KEY` you created in Step 1 into the **"Custom API Auth Key"** field.
5.  Click **"Save Changes"**.
6.  Navigate to **Admin > Storage**, click **"Connect"** on the "Custom API Sync" card.
7.  Go to the **"Cloud Sync"** tab and click **"Push to Cloud"** to send your kiosk's data to the server for the first time.

---

## 🔁 (Optional) Step 4: Auto-Start Server on Boot with PM2

To ensure your Node.js server restarts automatically if it crashes or the machine reboots, you can use PM2, a production process manager.

### 1. Install PM2
Copy and paste this command into your terminal:
```bash
npm install -g pm2
```

### 2. Start Server with PM2
In your server directory (`server_examples/custom_api_local_json`), run:
```bash
pm2 start server.js --name kiosk-api
```

### 3. Configure Auto-Startup
Run the following commands to have PM2 start on boot:
```bash
pm2 save
pm2 startup
```
PM2 will give you a command to copy and paste, which you must run to complete the setup.

---

## 🧪 (Optional) Step 5: Test the Setup

You can test your API endpoint using a tool like `curl` or Postman.

```bash
# Replace with your URL and API Key
curl -H "x-api-key: your-super-secret-api-key-here" https://cute-koala-lime.trycloudflare.com/data
```
This should return the contents of your `data.json` file (or a "No data found" error if you haven't pushed yet).