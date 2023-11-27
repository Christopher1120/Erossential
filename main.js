var { app, BrowserWindow, ipcMain, dialog } = require("electron");
var path = require("node:path");

let server = require("./server");


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

        }
    })
})



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})
