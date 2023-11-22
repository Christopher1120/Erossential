const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('version', {
    node: () => process.version.node,
    chrome: () => process.version.chrome,
    electron: () => process.version.electron,
    ping: () => ipcRenderer.invoke('ping')
})