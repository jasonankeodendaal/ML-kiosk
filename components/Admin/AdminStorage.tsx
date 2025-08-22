import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ServerStackIcon, ChevronDownIcon, ArchiveBoxArrowDownIcon } from '../Icons';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';

const CodeBracketIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
);


const ProviderCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    children?: React.ReactNode;
    disabled?: boolean;
}> = ({ icon, title, description, children, disabled = false }) => (
    <div className={`bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50 flex flex-col items-center text-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-2xl bg-gray-800 dark:bg-gray-700 text-white mb-4">
            {icon}
        </div>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">{title}</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex-grow">{description}</p>
        <div className="mt-6 w-full">
            {children}
        </div>
    </div>
);

const ConnectedCard: React.FC<{ icon: React.ReactNode; title: string; onDisconnect: () => void; name?: string; }> = ({ icon, title, onDisconnect, name }) => {
    
    return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border border-green-300 dark:border-green-700">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-2xl bg-green-600 text-white">
                {icon}
            </div>
            <div className="flex-grow min-w-0">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Connected to {title}</h4>
                <p className="mt-1 text-sm text-green-700 dark:text-green-400 font-medium truncate" title={name}>
                    {name ? `Folder: ${name}` : `Your assets are managed by ${title}.`}
                </p>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button onClick={onDisconnect} className="btn btn-destructive">
                    Disconnect
                </button>
            </div>
        </div>
    </div>
    )
};

const SetupInstruction: React.FC<{ title: string, children: React.ReactNode, id?: string }> = ({ title, children, id }) => (
    <details id={id} className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg overflow-hidden border dark:border-gray-700/50">
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">{title}</h4>
            <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                <ChevronDownIcon className="w-5 h-5"/>
            </div>
        </summary>
        <div className="px-5 py-4 border-t border-gray-200/80 dark:border-gray-700/50">
            {children}
        </div>
    </details>
);

const AdminStorage: React.FC = () => {
    const { 
        connectToLocalProvider,
        connectToCloudProvider,
        disconnectFromStorage,
        storageProvider,
        directoryHandle,
        loggedInUser
    } = useAppContext();

    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPotentiallyRestricted, setIsPotentiallyRestricted] = useState(false);
    
    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageSystem;

    useEffect(() => {
        if (window.self !== window.top) {
            setIsPotentiallyRestricted(true);
        }
    }, []);

    if (!canManage) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage system settings.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }
    
    const handleLocalConnect = async () => {
        setIsLoading(true);
        await connectToLocalProvider();
        setIsLoading(false);
    };

    const handleDownloadGuide = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
    
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.backgroundColor = '#ffffff';
        container.style.color = '#1f2937'; // Explicitly set a dark text color for the render context.

        try {
            const response = await fetch('/README.md');
            if (!response.ok) throw new Error('README.md not found');
            const markdown = await response.text();
            
            const sanitizedHtml = window.DOMPurify.sanitize(window.marked.parse(markdown));
            
            const professionalStyles = `
                body { margin: 0; }
                #pdf-render-container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #333; }
                #pdf-render-container h1, #pdf-render-container h2, #pdf-render-container h3, #pdf-render-container h4 { font-weight: 600; color: #111; margin-top: 1.5em; margin-bottom: 0.7em; line-height: 1.3; }
                #pdf-render-container h1 { font-size: 26pt; font-weight: 800; margin-top: 0; padding-bottom: 0.3em; border-bottom: 2px solid #e5e7eb; }
                #pdf-render-container h2 { font-size: 18pt; font-weight: 700; padding-bottom: 0.25em; border-bottom: 1px solid #e5e7eb; }
                #pdf-render-container h3 { font-size: 14pt; }
                #pdf-render-container h4 { font-size: 12pt; text-transform: uppercase; color: #4b5563; }
                #pdf-render-container p { margin-bottom: 1em; }
                #pdf-render-container ul, #pdf-render-container ol { margin-bottom: 1em; padding-left: 1.5em; }
                #pdf-render-container li { margin-bottom: 0.5em; }
                #pdf-render-container code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; background-color: #f3f4f6; padding: 0.2em 0.4em; margin: 0; font-size: 85%; border-radius: 6px; }
                #pdf-render-container pre { background-color: #f3f4f6; border-radius: 8px; padding: 1em; white-space: pre-wrap; word-break: break-all; font-size: 10pt; }
                #pdf-render-container pre code { background-color: transparent; padding: 0; font-size: inherit; }
                #pdf-render-container blockquote { border-left: 3px solid #d1d5db; padding-left: 1em; margin: 1.5em 0; color: #4b5563; font-style: italic; }
                #pdf-render-container a { color: #2563eb; text-decoration: none; } #pdf-render-container a:hover { text-decoration: underline; }
                #pdf-render-container hr { border: none; border-top: 1px solid #e5e7eb; margin: 2em 0; }
            `;
            
            // 1. Render full content in a measuring container to get element dimensions
            const measuringContainer = document.createElement('div');
            measuringContainer.style.width = '780px';
            measuringContainer.innerHTML = `<style>${professionalStyles}</style><div id="pdf-render-container" style="padding: 40px; box-sizing: border-box;">${sanitizedHtml}</div>`;
            container.appendChild(measuringContainer);
            document.body.appendChild(container);

            const contentToRender = container.querySelector('#pdf-render-container');
            if (!contentToRender) throw new Error("Could not find content to render.");

            // 2. Group elements into pages based on their rendered height
            const A4_WIDTH_PX = 780;
            const A4_HEIGHT_PX = Math.floor(A4_WIDTH_PX * 1.414);
            const PAGE_PADDING = 40;
            const A4_TARGET_CONTENT_HEIGHT = A4_HEIGHT_PX - (PAGE_PADDING * 2);
    
            const elements = Array.from(contentToRender.children) as HTMLElement[];
            const pages: HTMLElement[][] = [];
            let currentPageElements: HTMLElement[] = [];
            let currentPageHeight = 0;
    
            elements.forEach(el => {
                const isHeading = el.tagName === 'H1' || el.tagName === 'H2';
                const isPageBreak = el.tagName === 'HR';
    
                if ((isHeading && currentPageElements.length > 0) || isPageBreak) {
                    if (currentPageElements.length > 0) pages.push(currentPageElements);
                    currentPageElements = [];
                    currentPageHeight = 0;
                    if(isPageBreak) return;
                }
                
                const style = window.getComputedStyle(el);
                const margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
                const elHeight = el.offsetHeight + margin;
    
                if (elHeight > A4_TARGET_CONTENT_HEIGHT && currentPageElements.length > 0) {
                    pages.push(currentPageElements);
                    currentPageElements = [];
                    currentPageHeight = 0;
                }
    
                if (currentPageElements.length > 0 && currentPageHeight + elHeight > A4_TARGET_CONTENT_HEIGHT) {
                    pages.push(currentPageElements);
                    currentPageElements = [el];
                    currentPageHeight = elHeight;
                } else {
                    currentPageElements.push(el);
                    currentPageHeight += elHeight;
                }
            });
            if (currentPageElements.length > 0) pages.push(currentPageElements);
            
            // 3. Render each page to a canvas and add to zip
            const zip = new JSZip();
            for (let i = 0; i < pages.length; i++) {
                const pageContent = document.createElement('div');
                pageContent.style.width = `${A4_WIDTH_PX}px`;
                pageContent.style.height = `${A4_HEIGHT_PX}px`;
                pageContent.style.backgroundColor = '#ffffff';
                pageContent.style.display = 'flex';
                pageContent.style.flexDirection = 'column';
                pageContent.innerHTML = `<style>${professionalStyles}</style>`;
                
                const pageInner = document.createElement('div');
                pageInner.style.padding = `${PAGE_PADDING}px`;
                pageInner.style.boxSizing = 'border-box';
                pageInner.style.flexGrow = '1';
                
                pages[i].forEach(el => pageInner.appendChild(el.cloneNode(true)));
                pageContent.appendChild(pageInner);
                container.appendChild(pageContent);

                const canvas = await window.html2canvas(pageContent, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                const blob = await new Promise<Blob|null>(resolve => canvas.toBlob(resolve, 'image/png'));
                if (blob) {
                    zip.file(`guide-page-${String(i + 1).padStart(2, '0')}.png`, blob);
                }
                container.removeChild(pageContent);
            }

            // 4. Generate and download zip
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "Kiosk-Setup-Guide-Images.zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Image generation failed:", error);
            alert("Failed to generate guide images.");
        } finally {
            document.body.removeChild(container);
            setIsDownloading(false);
        }
    };
    
    const getProviderDetails = () => {
        switch (storageProvider) {
            case 'local':
                return {
                    icon: <ServerStackIcon className="h-8 w-8" />,
                    title: 'Local or Network Folder',
                    name: directoryHandle?.name,
                };
            case 'customApi':
                return {
                    icon: <CodeBracketIcon className="h-8 w-8" />,
                    title: 'Custom API Sync',
                    name: 'Remote cloud sync active',
                };
            default: return null;
        }
    }

    const renderProviderSelection = () => (
        <>
            <div>
                <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Storage Provider</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Choose how to store your kiosk data and media assets. You can only connect to one provider at a time.
                </p>
            </div>
             {isPotentiallyRestricted && (
                 <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-300 p-4 rounded-r-lg">
                    <p className="font-bold">Potential Restriction Detected</p>
                    <p className="text-sm mt-1">
                       It looks like this app is running in an embedded window. Due to browser security, "Local Folder" storage might be disabled.
                    </p>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <ProviderCard
                    icon={<ServerStackIcon className="h-8 w-8" />}
                    title="Local or Network Folder"
                    description="Store all assets and data in a folder on your computer or a shared network drive. Ideal for offline use or manual syncing."
                    disabled={isPotentiallyRestricted || isLoading}
                >
                        <button onClick={handleLocalConnect} className="btn btn-primary w-full max-w-xs mx-auto" disabled={isPotentiallyRestricted || isLoading}>
                        {isLoading ? 'Connecting...' : 'Connect to Folder'}
                    </button>
                </ProviderCard>
                 <ProviderCard
                    icon={<CodeBracketIcon className="h-8 w-8" />}
                    title="Custom API Sync"
                    description="For advanced users. Sync data with your own backend API (e.g., Node.js with Redis, MongoDB, etc.)."
                    disabled={isLoading}
                >
                    <button onClick={() => connectToCloudProvider('customApi')} className="btn btn-primary w-full max-w-xs mx-auto" disabled={isLoading}>
                        Connect
                    </button>
                </ProviderCard>
            </div>
        </>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-2xl bg-gray-800 dark:bg-gray-700 text-white">
                    <ArchiveBoxArrowDownIcon className="h-8 w-8" />
                </div>
                <div className="flex-grow text-center sm:text-left">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Complete Setup Guide</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Download the full step-by-step documentation as a collection of images for offline use.</p>
                </div>
                <button onClick={handleDownloadGuide} disabled={isDownloading} className="btn btn-primary mt-2 sm:mt-0 flex-shrink-0">
                    {isDownloading ? 'Generating...' : 'Download Guide as Images'}
                </button>
            </div>
            
            {storageProvider !== 'none' ? <ConnectedCard {...getProviderDetails()!} onDisconnect={disconnectFromStorage} /> : renderProviderSelection()}
            
            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading text-center">
                    Setup Instructions
                </h3>

                <SetupInstruction title="How to use a Local or Network Folder">
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>Click the <strong>"Connect to Folder"</strong> button above.</li>
                        <li>Your browser will ask you to select a folder. Choose a folder on your computer or a shared network drive accessible by other kiosks. Grant permission when prompted.</li>
                        <li>Once connected, go to the <strong>"Backup & Restore"</strong> tab.</li>
                        <li>Click <strong>"Save to Drive"</strong> to create a `database.json` file and save all your current product data and assets to the selected folder.</li>
                        <li>On other kiosks, connect to the same folder and use the <strong>"Load from Drive"</strong> button to get the latest data.</li>
                    </ol>
                </SetupInstruction>
                
                <SetupInstruction id="custom-api-local-json-setup" title="How to use Custom API (Node.js + Local JSON)">
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:bg-gray-200 prose-code:dark:bg-gray-700 prose-code:p-1 prose-code:rounded-md prose-code:font-mono prose-strong:text-gray-800 dark:prose-strong:text-gray-100">
                        <p>This method uses a simple Node.js server that stores data in a local <code>data.json</code> file. We recommend using Cloudflare Tunnel to make it accessible online.</p>
                        
                        <h4>✅ Step 1: Set Up Your API Server</h4>
                        <ol>
                            <li>Find the example server code in the <strong><code>server_examples/custom_api_local_json</code></strong> folder.</li>
                            <li>In your terminal, navigate to that folder and run <code>npm install</code>.</li>
                            <li>Create a <strong><code>.env</code></strong> file in that folder and add your API key: <code>API_KEY=your-secret-key-here</code>.</li>
                            <li>Start the server by running <code>node server.js</code>. It will run on <code>http://localhost:3001</code>.</li>
                        </ol>

                        <h4>🌐 Step 2: Expose API with Cloudflare Tunnel</h4>
                         <ol>
                            <li>In a new terminal, expose your local server by running: <br/>
                                <code>cloudflared tunnel --url http://localhost:3001</code>
                            </li>
                            <li>Copy the public HTTPS URL provided by Cloudflare (e.g., <code>https://random-name.trycloudflare.com</code>).</li>
                        </ol>

                        <h4>🔌 Step 3: Connect Kiosk to API</h4>
                        <ol>
                            <li>In this app, go to <strong>Settings &gt; API Integrations</strong>.</li>
                            <li>Paste the Cloudflare URL from Step 2 into the "Custom API URL" field. <strong>Important:</strong> Add <code>/data</code> to the end of the URL.</li>
                            <li>Enter the same secret API key from Step 1 into the "Custom API Auth Key" field. Save changes.</li>
                            <li>Return to this Storage tab, click <strong>"Connect"</strong> on the "Custom API Sync" card.</li>
                            <li>Finally, go to the <strong>"Cloud Sync"</strong> tab and click <strong>"Push to Cloud"</strong> to upload your data.</li>
                        </ol>

                        <h4>🔁 (Optional) Step 4: Auto-Start Server on Boot</h4>
                        <p>To keep your server running permanently, use PM2:</p>
                        <ol>
                            <li>Install PM2 globally: <code>npm install -g pm2</code></li>
                            <li>In your server folder, start the server with PM2: <code>pm2 start server.js</code></li>
                            <li>Save the process list: <code>pm2 save</code></li>
                            <li>Create a startup script: <code>pm2 startup</code> (and run the command it gives you).</li>
                        </ol>
                    </div>
                </SetupInstruction>
                
                <SetupInstruction title="How to Use a Local/External Hard Drive as an API">
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:bg-gray-200 prose-code:dark:bg-gray-700 prose-code:p-1 prose-code:rounded-md prose-code:font-mono prose-strong:text-gray-800 dark:prose-strong:text-gray-100">
                        <p>Yes, you can use a local or external hard drive as your main storage point and expose it via an API so your kiosk can access it globally. Here’s the general concept and how it applies to this app.</p>
                        
                        <h4>The Concept</h4>
                        <p>You run a small server program on a computer where the hard drive is connected (e.g., a PC, Mac, or Raspberry Pi). This server has API endpoints (URLs) that the kiosk can call to get or save data. To make it accessible from anywhere, you use a tool like Cloudflare Tunnel or ngrok.</p>
                        
                        <h4>How It Works with This App</h4>
                        <p>For this kiosk application, the server needs to handle one main file: a <strong><code>database.json</code></strong> file that contains all your brands, products, and settings. The server example provided in the <a href="#custom-api-local-json-setup">"Node.js + Local JSON"</a> guide above does exactly this. You can run that server from a folder located on your external hard drive to achieve this.</p>
                        
                        <h4>Alternative Tools (For Advanced Users)</h4>
                        <p>While the provided server example is recommended for this app, other tools can achieve similar results if you are willing to customize them:</p>
                        <ul>
                            <li><strong>Nginx + autoindex:</strong> Good for simple, read-only file listing (not suitable for saving data back from the kiosk).</li>
                            <li><strong>Nextcloud/ownCloud:</strong> Full-featured private cloud solutions that have APIs you could integrate with.</li>
                            <li><strong>MinIO:</strong> A self-hosted, S3-compatible object storage system for professional, large-scale use cases.</li>
                        </ul>
                        
                        <h4>Key Considerations</h4>
                        <ul>
                            <li><strong>Security:</strong> Always protect your API with an API key and run it over HTTPS (Cloudflare Tunnel provides this for free).</li>
                            <li><strong>Uptime:</strong> The computer hosting the server and drive must be always on and connected to the internet for the kiosks to sync.</li>
                            <li><strong>Backups:</strong> Regularly back up the data on your hard drive itself.</li>
                        </ul>
                    </div>
                </SetupInstruction>

                <SetupInstruction title="How to use Custom API (with Node.js + Redis)">
                     <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>Set up and deploy your own API server. An example using Node.js and Redis is provided in the <strong>`server_examples/custom_api_redis`</strong> folder.</li>
                         <li>Go to the <strong>Settings</strong> tab, then click on <strong>API Integrations</strong>.</li>
                        <li>Enter your server's endpoint URL into the "Custom API URL" field. If your API requires a key, enter it in the "Custom API Auth Key" field. Click "Save Changes".</li>
                         <li>Come back to this tab and click the <strong>"Connect"</strong> button under "Custom API Sync" above.</li>
                        <li>Once connected, go to the <strong>"Cloud Sync"</strong> tab and click <strong>"Push to Cloud"</strong> to upload your data to your server.</li>
                    </ol>
                </SetupInstruction>
            </div>

        </div>
    );
};

export default AdminStorage;