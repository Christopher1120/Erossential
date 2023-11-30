var { app, BrowserWindow, ipcMain, dialog, session } = require("electron");
var { autoUpdater } = require("electron-updater");
var isDev = require("electron-is-dev");
var path = require("node:path");
const log = require("electron-log");
const gotTheLock = app.requestSingleInstanceLock();


let server = require("./server");

log.resolvePath = () => path.join("C:\Users\chris\Desktop\Erossential\package.json", "logs/main.log")
log.log("Application version " + app.getVersion())

function AppUpdate() {
    const options = {
        provider: "github.com",
        url:"https://github.com/Christopher1120/Erossential",
    }
}

let mainWindow;
function sendStatusToWindow(text) {
    log.info(text);
    mainWindow.webContents.send('message', text);
}

if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('electron-fiddle', process.execPath, [path.resolve(process.argv[1])])
    }
} else {
    app.setAsDefaultProtocolClient('electron-fiddle')
}

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
        // the commandLine is array of strings in which last element is deep link url
        dialog.showErrorBox('Welcome Back', `You arrived from: ${commandLine.pop()}`)
    })

    // Create mainWindow, load the rest of the app, etc...
    app.whenReady().then(() => {
        createWindow()
    })
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 800,
        resizable: true,
        autoHideMenuBar: true,
        icon: "favicon.ico",
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js")
        },
    });
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadURL("http://localhost:80/");
    mainWindow.on("closed", function () {
        mainWindow = null;
    })

    if (isDev) {
        mainWindow.webContents.openDevTools({ mode: "detach" });
        autoUpdater.checkForUpdates();
        
    }
    if (!isDev) {
        autoUpdater.checkForUpdates();

    }


}




app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            ipcMain.handle('ping', () => 'pong')
            createWindow();
        }
    })
})

autoUpdater.on('checking-for-update', () => {
    const dialogOpts = {
        type: "info",
        buttons: ['Ok'],
        title: "Erossentail Business Management",
        detail: "Checking For Updates"
    }
    dialog.showMessageBox(dialogOpts, (response) => {

    })
})

autoUpdater.on('update-not-available', (info) => {
    const dialogOpts = {
        type: "info",
        buttons: ['Ok'],
        title: "Erossentail Business Management",
        detail: "No Updates Available"
    }
    dialog.showMessageBox(dialogOpts, (response) => {

    })
})

autoUpdater.on("update-available", (_event,releaseName,releaseNotes) => {
    const dialogOpts = {
        type: "info",
        buttons: ['Ok'],
        title: "Erossential has new updates!",
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail:"A new version of the app is available."
    }
    dialog.showMessageBox(dialogOpts, (response) => {

    })
    log.info(releaseName, releaseNotes)
})

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})

autoUpdater.on("update-downloaded", (_event, releaseName, releaseNotes) => {
    const dialogOpts = {
        type: "info",
        buttons: ['Restart', "Later"],
        title: "Erossential has new updates!",
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: "A new version has been downloaded, Restart the application to apply changes!"
    }
    dialog.showMessageBox(dialogOpts, (response) => {
        if (response === 0) {
            autoUpdater.quitAndInstall()
        };

    })
    log.info(releaseName, releaseNotes)
    sendStatusToWindow('Update downloaded');
})

autoUpdater.on("error", (err) => {
    log.info("Error in auto-updater. " + err);
})





app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})

