var { app, BrowserWindow, ipcMain, dialog } = require("electron");
var { autoUpdater } = require("electron-updater");
var isDev = require("electron-is-dev");
var path = require("node:path");
const log = require("electron-log");


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

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1500,
        height: 800,
        resizable: false,
        autoHideMenuBar: true,
        icon: "favicon.ico",
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js")
        },
    });
    mainWindow.loadURL("http://localhost:80");
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
