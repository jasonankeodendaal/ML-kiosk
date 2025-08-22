# Interactive Kiosk System

Welcome to your Interactive Kiosk System – a self-contained digital catalogue and product display tool. This guide covers setup for all scenarios, from a single offline kiosk to a fleet of cloud-synced devices.

## Table of Contents

1.  [**Scenario A: Setup for a Single, Offline Kiosk**](#scenario-a-setup-for-a-single-offline-kiosk)
2.  [**Scenario B: Setup for Multiple Kiosks in One Store (Local Network Sync)**](#scenario-b-setup-for-multiple-kiosks-in-one-store-local-network-sync)
3.  [**Scenario C: Setup for Multiple Kiosks in Different Locations (Cloud Sync)**](#scenario-c-setup-for-multiple-kiosks-in-different-locations-cloud-sync)
4.  [**Advanced Topics**](#advanced-topics)
    - [Packaging the App for Distribution (.exe, .apk)](#packaging-for-distribution-exe-and-apk)
    - [Keeping Your Server Running with PM2](#keeping-your-server-running-with-pm2)
5.  [**Core Features**](#features)

---

## Scenario A: Setup for a Single, Offline Kiosk

> **Use this scenario if:** You have one computer or kiosk and you don't need to share data with other devices.

This is the simplest way to get up and running. Data will be stored directly in the browser.

### Step 1: Install Node.js
*If you already have Node.js, you can skip this step.*
1.  Download the **"LTS"** version of Node.js from [nodejs.org](https://nodejs.org/).
2.  Run the installer and follow the on-screen instructions.
3.  To confirm it's installed, open a new terminal (or PowerShell) and run: `node -v`. You should see a version number.

### Step 2: Start the Application Server
> **Why?** For security reasons, modern web apps must be run from a web server, not by opening the `index.html` file directly.
1.  Unzip and open the project folder containing `index.html`.
2.  Open a terminal directly in this folder:
    - **Windows:** Hold `Shift` + Right-click inside the folder and choose "Open PowerShell window here" or "Open in Terminal".
    - **Mac:** Open the Terminal app, type `cd `, then drag the project folder into the terminal window and press `Enter`.
3.  Install the `serve` tool (you only need to do this once):
    ```bash
    npm install -g serve
    ```
4.  Start the server:
    ```bash
    serve .
    ```
5.  Your terminal will show a **"Local"** URL (e.g., `http://localhost:3000`). Copy this URL.

### Step 3: Use and Configure the Kiosk
1.  Open your web browser (like Chrome or Edge) and paste the URL from the previous step. The app is now running.
2.  To add your products, navigate to the **"Admin Login"** link in the footer.
3.  Log in with the default Main Admin PIN: `1723`.
4.  Use the Admin Dashboard to add brands, products, and customize settings. All changes are saved automatically to this browser's storage.

### Step 4: (Recommended) Backup Your Data
Since the data is stored in the browser, it could be lost if the browser cache is cleared.
1.  Periodically go to `Admin > Backup & Restore`.
2.  Click **"Download Backup File"**.
3.  Save the downloaded `.json` file in a safe place. You can use this file to restore your setup on any computer.

---

## Scenario B: Setup for Multiple Kiosks in One Store (Local Network Sync)

> **Use this scenario if:** You have multiple kiosks in the same location (e.g., one store) and want them all to show the exact same content.

This method uses a shared folder on your local network to keep all kiosks in sync. One computer will act as the "main" computer.

### Step 1: Create a Shared Network Folder
1.  On your main computer or a local server, create a new folder (e.g., `Kiosk_Data`).
2.  Right-click the folder, go to **Properties > Sharing**, and share it on your network.
3.  **Crucially, you must give it "Read/Write" permissions** so the kiosk application can save files to it.

### Step 2: Set Up the Main Kiosk
1.  On your main computer, follow **Steps 1 and 2** from [Scenario A](#scenario-a-setup-for-a-single-offline-kiosk) to get the application running via a local server.
2.  Open the app in your browser and log in to the **Admin Dashboard** (default PIN: `1723`).
3.  Add all your brands, products, and customize your settings. This is the master copy of your data.
4.  Navigate to `Admin > Storage`.
5.  Click **"Connect to Local or Network Folder"**. In the file dialog, select the shared network folder you created in Step 1.
6.  Navigate to `Admin > Backup & Restore`.
7.  Click **"Save to Drive"**. This will create a `database.json` file and other asset files inside your shared folder. The main kiosk is now set up.

### Step 3: Set Up Additional Kiosks
For each additional kiosk computer, follow these steps:
1.  Ensure the computer is connected to the same local network.
2.  Follow **Steps 1 and 2** from [Scenario A](#scenario-a-setup-for-a-single-offline-kiosk) to get the application running on this kiosk.
3.  Open the app and log in to the **Admin Dashboard**.
4.  Navigate to `Admin > Storage`.
5.  Click **"Connect to Local or Network Folder"** and select the **exact same shared network folder** you used for the main kiosk.
6.  The kiosk will now automatically load its content from the shared folder. To force an immediate update, go to `Admin > Backup & Restore` and click **"Load from Drive"**.

### Step 4: How to Update Content for All Kiosks
1.  Make all your content changes (adding products, changing settings, etc.) on **only one computer** (preferably your main computer).
2.  When you are finished, go to `Admin > Backup & Restore` on that computer and click **"Save to Drive"**.
3.  The other kiosks will automatically detect the changes and update in the background. To see changes immediately on other kiosks, simply refresh them or use the "Load from Drive" button.

---

## Scenario C: Setup for Multiple Kiosks in Different Locations (Cloud Sync)

> **Use this scenario if:** You want to manage multiple kiosks across different locations from a central, online server. This is an advanced setup.

This method requires running a small server application that your kiosks will connect to over the internet. We provide two easy-to-use server examples.

### Option A: Node.js Server with a JSON File (Recommended)
This is the simplest cloud method. A server runs on one computer and uses a single `data.json` file as its database.

#### Part 1: Set Up the Server
1.  On the computer that will act as your server, open a terminal.
2.  Navigate to the server example directory: `cd server_examples/custom_api_local_json`.
3.  Install its dependencies. **Make sure you are in the `custom_api_local_json` directory before running this command:**
    ```bash
    npm install
    ```
4.  In the same folder, create a new file named `.env` (the name starts with a dot). Open it in a text editor and add the following line, replacing the placeholder with your own secret key:
    ```
    API_KEY=your-super-secret-api-key-here
    ```
5.  Start the server: `node server.js`. It will now be running locally on `http://localhost:3001`.

#### Part 2: Make the Server Public with Cloudflare Tunnel
1.  Install the `cloudflared` tool from the [official Cloudflare docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/).
2.  Open a **new, separate terminal**. Run the tunnel command to expose your local server to the internet:
    ```bash
    cloudflared tunnel --url http://localhost:3001
    ```
3.  Cloudflare will give you a public URL (e.g., `https://random-name.trycloudflare.com`). **Copy this URL** and keep both terminal windows running.

#### Part 3: Configure Your Kiosks
1.  On any kiosk computer, run the application using the steps from [Scenario A](#scenario-a-setup-for-a-single-offline-kiosk).
2.  Log in to the **Admin Dashboard**.
3.  Navigate to `Admin > Settings > API Integrations`.
4.  Paste the Cloudflare URL into the "Custom API URL" field and **add `/data` to the end of it**.
5.  Enter the same secret `API_KEY` you created in Part 1 into the "Custom API Auth Key" field and save your settings.
6.  Navigate to `Admin > Storage` and click **"Connect"** on the "Custom API Sync" card.
7.  Finally, go to the `Admin > Cloud Sync` tab and click **"Push to Cloud"** to upload your data for the first time. All kiosks connected to this API will now share the same data.

### Option B: Node.js Server with a Redis Database (High-Performance)
This method is for users who want a more robust database. It's faster but requires running a Redis server program.

#### Part 1: Install and Run Redis
You need to install Redis on your server computer.

- **For macOS (using Homebrew):**
  1.  Install: `brew install redis`
  2.  Start: `brew services start redis`
- **For Windows (using WSL 2):**
  1.  Open PowerShell as Administrator and run `wsl --install`, then restart.
  2.  In the Linux terminal that opens, run: `sudo apt update && sudo apt install redis-server && sudo service redis-server start`
- **For Linux (Ubuntu/Debian):**
  1.  Run: `sudo apt update && sudo apt install redis-server`
- **Verify it's running:** In a terminal, run `redis-cli ping`. It should reply with `PONG`.

#### Part 2: Set Up the API Server
1.  In a terminal, navigate to the Redis server example directory: `cd server_examples/custom_api_redis`.
2.  Install dependencies. **Make sure you are in the `custom_api_redis` directory before running this command:**
    ```bash
    npm install
    ```
3.  In the same folder, create a new file named `.env`. Open it in a text editor and add the following content, replacing the placeholder API key:
    ```
    API_KEY=your-super-secret-api-key-here
    REDIS_URL=redis://localhost:6379
    ```
4.  Start the server: `node server.js`.

#### Part 3: Make Server Public and Configure Kiosks
Follow **Part 2** and **Part 3** from the **"Option A"** guide above. The steps to expose the server with Cloudflare and configure the kiosk are exactly the same.

---

## Advanced Topics

### Packaging for Distribution (.exe and .apk)
This application is a **Progressive Web App (PWA)**, which means it can be "installed" on most devices for a native-like experience. For creating distributable installer files, use the following methods.

-   **For Android (.apk):** Use **PWABuilder** ([www.pwabuilder.com](https://www.pwabuilder.com)). Host your app online (e.g., on Netlify), paste the URL into PWABuilder, and it will package an Android app for you to submit to the Google Play Store.

-   **For Desktop (.exe for Windows):**
    1.  **Easiest Method (PWA Install):** Open the running app in Chrome or Edge. An "Install" icon will appear in the address bar. Clicking this will add the app to your Start Menu and Desktop, running in its own window.
    2.  **True Installer (.exe):** Use a framework like **Tauri** to create a very small and fast installer. Follow the [Tauri official guide](https://tauri.app/v1/guides/getting-started/prerequisites) to set it up in your project folder.

### Keeping Your Server Running with PM2
If you are running a server for Scenario C, you need it to run continuously. PM2 is a tool that manages this for you.
1.  Install PM2 globally: `npm install -g pm2`
2.  In your server directory (e.g., `custom_api_local_json`), start the app with PM2:
    ```bash
    pm2 start server.js --name kiosk-api
    ```
3.  To make PM2 start automatically when the computer reboots, run `pm2 startup` and follow the instructions it provides.

---

## Features

- **Rich Product Display**: Showcase products with multiple images, videos, and detailed specifications.
- **Brand-Centric Browsing**: Organize your catalogue by brand, each with its own logo and product set.
- **Digital Catalogues & Pamphlets**: Display PDF catalogues and time-sensitive promotional pamphlets in-app.
- **Dynamic Screensaver**: Turns idle screens into advertising space with image and video ads.
- **Powerful Admin Panel**: Manage all content, customize appearance, and configure kiosk behavior.
- **Bulk Content Management**: Quickly import product data from a CSV file or a structured Zip archive containing images and details.
- **Flexible Data Storage**: Choose your preferred data strategy:
  - **Local Storage**: Works offline out-of-the-box.
  - **Shared Network Drive**: Automatically sync data across kiosks on a local network with file-locking protection.
  - **Cloud Sync (Custom API)**: Connect to your own self-hosted backend (e.g., using Node.js and Redis) for full control.
- **Fully Customizable**: Control fonts, colors, layouts, and more to match your brand identity.
- **PWA Ready**: Can be installed on devices like a native app for a full-screen, offline-capable experience.