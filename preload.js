// Jembatan aman antara halaman Lembar dan sistem berkas komputer
const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('lembar', {
  open: () => ipcRenderer.invoke('open-dialog'),
  save: opts => ipcRenderer.invoke('save', opts),
  pdf: opts => ipcRenderer.invoke('pdf', opts),
  setTitle: title => ipcRenderer.send('set-title', title),
  ready: () => ipcRenderer.send('ready'),
  pathOf: file => { try { return webUtils.getPathForFile(file) || null; } catch { return null; } },
  onMenu: cb => ipcRenderer.on('menu', (_e, cmd) => cb(cmd)),
  onOpenFile: cb => ipcRenderer.on('open-file', (_e, f) => cb(f)),
});
