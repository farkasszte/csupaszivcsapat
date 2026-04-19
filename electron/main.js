const { app, BrowserWindow, screen, session } = require('electron');
const path = require('path');
const serve = require('electron-serve');
const isPackaged = app.isPackaged || process.env.NODE_ENV === 'production';

// Support both ESM and CommonJS exports
const serveFn = typeof serve === 'function' ? serve : serve.default;
const loadURL = serveFn ? serveFn({ directory: 'out' }) : null;

function createWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    
    const win = new BrowserWindow({
        width: Math.min(1440, screenWidth * 0.9),
        height: Math.min(900, screenHeight * 0.9),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, '../public/icons/icon-512x512.png'),
        autoHideMenuBar: true,
        title: "Csupaszív Kalandok",
        backgroundColor: '#F9FBF8',
    });

    if (app.isPackaged || process.env.NODE_ENV === 'production') {
        loadURL(win);
    } else {
        win.loadURL('http://localhost:3000');
        // win.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    // Fix OpenStreetMap 403 Forbidden error (Referer is required by tile usage policy)
    session.defaultSession.webRequest.onBeforeSendHeaders(
        { urls: ['*://*.tile.openstreetmap.org/*', '*://*.openstreetmap.org/*'] },
        (details, callback) => {
            details.requestHeaders['Referer'] = 'https://csupaszivkalandok.hu/';
            callback({ requestHeaders: details.requestHeaders });
        }
    );
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
