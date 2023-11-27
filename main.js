var { app, BrowserWindow, ipcMain, dialog } = require("electron");
var { autoUpdater } = require("electron-updater");
var path = require("node:path");
const log = require("electron-log");

let server = require("./server");

log.transports.file.resolvePath = () => path.join(__dirname, "logs")

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
}


app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            ipcMain.handle('ping', () => 'pong')
            createWindow();
            autoUpdater.checkForUpdatesAndNotify();
        }
    })
})



autoUpdater.on("update-available", () => {
    log.info("update-vailable");
})

autoautoUpdater.on("checking-for-updates", () => {
    log.info("checking-for-updates");
})

autoautoUpdater.on("download-progress", () => {
    log.info("download-progress");
})

autoautoUpdater.on("update-downloaded", () => {
    log.info("update-downloaded");
})



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})
