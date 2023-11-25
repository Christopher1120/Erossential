var { app, BrowserWindow, ipcMain, autoUpdater, dialog } = require("electron");
const gotTheLock = app.requestSingleInstanceLock()
var path = require("node:path");


let server = require("./server");

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
        width: 1200,
        height: 700,
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

        }
    })
})



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})