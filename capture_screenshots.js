import { app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, 'images');
// Use the dev server URL
const BASE_URL = 'http://localhost:5173/#';

const PAGES = [
    { route: '/focus', name: 'focus_preview.png' },
    { route: '/tasks', name: 'tasks_preview.png' },
    { route: '/projects', name: 'projects_preview.png' },
    { route: '/habits', name: 'habits_preview.png' },
    { route: '/inspiration', name: 'inspiration_preview.png' }
];

async function captureScreenshots() {
    console.log('Starting screenshot capture...');
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    for (const page of PAGES) {
        const fullUrl = BASE_URL + page.route;
        console.log(`Navigating to ${fullUrl}...`);

        try {
            await win.loadURL(fullUrl);
            console.log(`Loaded ${page.name}, waiting for render...`);

            // Wait for animations/loading - increased delay
            await new Promise(resolve => setTimeout(resolve, 5000));

            const image = await win.webContents.capturePage();
            if (image.isEmpty()) {
                console.error(`Warning: Captured empty image for ${page.name}`);
            } else {
                fs.writeFileSync(path.join(OUTPUT_DIR, page.name), image.toPNG());
                console.log(`Saved ${page.name}`);
            }
        } catch (e) {
            console.error(`Failed to capture ${page.name}:`, e);
        }
    }

    console.log('All screenshots captured.');
    app.quit();
}

app.whenReady().then(() => {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
    }
    // Add a small delay for Electron to be fully ready
    setTimeout(captureScreenshots, 1000);
});
