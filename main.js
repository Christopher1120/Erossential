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

autoUpdater.on("update-downloaded", (_event, releaseName, releaseNotes) => {
    const dialogOpts = {
        type: "info",
        buttons: ['Restart', "Later"],
        title: "Erossential has new updates!",
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: "A new version has been downloaded, Restart the application to apply changes!"
    }
    dialog.showMessageBox(dialogOpts, (response) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
    })
    log.info(releaseName,releaseNotes)
})

autoUpdater.on("error", (err) => {
    log.info("Error in auto-updater. " + err);
})





app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})
