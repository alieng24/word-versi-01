// Lembar — proses utama aplikasi desktop (Electron)
const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs/promises');

const OPENABLE = /\.(docx|html?|txt|md)$/i;
let win = null;
let rendererReady = false;
let pendingPath = null;

/* ---------- Jendela ---------- */
function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 720,
    minHeight: 500,
    title: 'Lembar',
    backgroundColor: '#e6e9ef',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
    },
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  // Tautan web dibuka di peramban, bukan di dalam aplikasi
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (url !== win.webContents.getURL()) {
      e.preventDefault();
      if (/^https?:/i.test(url)) shell.openExternal(url);
    }
  });
  // Pemeriksa ejaan: bahasa Indonesia + Inggris (Windows; di Mac memakai kamus sistem)
  try { win.webContents.session.setSpellCheckerLanguages(['id', 'en-US']); } catch {}

  win.on('closed', () => { win = null; rendererReady = false; });
}

/* ---------- Membuka file ---------- */
async function readForRenderer(p) {
  return { path: p, name: path.basename(p), data: await fs.readFile(p) };
}
async function sendOpen(p) {
  if (!p) return;
  if (!win || !rendererReady) { pendingPath = p; return; }
  try {
    win.webContents.send('open-file', await readForRenderer(p));
    if (win.isMinimized()) win.restore();
    win.focus();
  } catch {
    dialog.showErrorBox('Lembar', `File tidak bisa dibuka:\n${p}`);
  }
}
const fileFromArgs = argv => argv.slice(1).find(a => !a.startsWith('-') && OPENABLE.test(a));

// macOS: file dibuka lewat "Open With" atau diseret ke ikon Dock
app.on('open-file', (e, p) => { e.preventDefault(); sendOpen(p); });

// Windows: hanya satu jendela; file kedua diteruskan ke jendela yang sudah terbuka
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    const p = fileFromArgs(argv);
    if (p) sendOpen(p);
    else if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
}

/* ---------- IPC dari halaman ---------- */
const FILTERS = {
  docx: [{ name: 'Dokumen Word', extensions: ['docx'] }],
  html: [{ name: 'Halaman web', extensions: ['html'] }],
  txt: [{ name: 'Teks biasa', extensions: ['txt', 'md'] }],
  pdf: [{ name: 'PDF', extensions: ['pdf'] }],
};

ipcMain.on('ready', () => {
  rendererReady = true;
  if (pendingPath) { const p = pendingPath; pendingPath = null; sendOpen(p); }
});

ipcMain.on('set-title', (_e, title) => { if (win) win.setTitle(String(title || 'Lembar')); });

ipcMain.handle('open-dialog', async () => {
  const r = await dialog.showOpenDialog(win, {
    title: 'Buka dokumen',
    properties: ['openFile'],
    filters: [
      { name: 'Dokumen', extensions: ['docx', 'html', 'htm', 'txt', 'md'] },
      { name: 'Semua file', extensions: ['*'] },
    ],
  });
  if (r.canceled || !r.filePaths[0]) return null;
  return readForRenderer(r.filePaths[0]);
});

ipcMain.handle('save', async (_e, { data, name, kind, path: target }) => {
  let p = target;
  if (!p) {
    const r = await dialog.showSaveDialog(win, {
      title: 'Simpan dokumen',
      defaultPath: path.join(app.getPath('documents'), name || 'Dokumen.docx'),
      filters: FILTERS[kind] || FILTERS.docx,
    });
    if (r.canceled || !r.filePath) return null;
    p = r.filePath;
  }
  await fs.writeFile(p, typeof data === 'string' ? data : Buffer.from(data));
  app.addRecentDocument(p);
  return { path: p, name: path.basename(p) };
});

ipcMain.handle('pdf', async (_e, { name }) => {
  const r = await dialog.showSaveDialog(win, {
    title: 'Ekspor PDF',
    defaultPath: path.join(app.getPath('documents'), name || 'Dokumen.pdf'),
    filters: FILTERS.pdf,
  });
  if (r.canceled || !r.filePath) return null;
  const pdf = await win.webContents.printToPDF({ printBackground: true, preferCSSPageSize: true });
  await fs.writeFile(r.filePath, pdf);
  return { path: r.filePath, name: path.basename(r.filePath) };
});

/* ---------- Menu ---------- */
const send = cmd => () => { if (win) win.webContents.send('menu', cmd); };
function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{
      label: 'Lembar',
      submenu: [
        { role: 'about', label: 'Tentang Lembar' },
        { type: 'separator' },
        { role: 'hide', label: 'Sembunyikan Lembar' },
        { role: 'hideOthers', label: 'Sembunyikan yang lain' },
        { role: 'unhide', label: 'Tampilkan semua' },
        { type: 'separator' },
        { role: 'quit', label: 'Keluar dari Lembar' },
      ],
    }] : []),
    {
      label: 'Berkas',
      submenu: [
        { label: 'Dokumen baru', accelerator: 'CmdOrCtrl+N', click: send('new') },
        { label: 'Buka…', accelerator: 'CmdOrCtrl+O', click: send('open') },
        { type: 'separator' },
        { label: 'Simpan', accelerator: 'CmdOrCtrl+S', click: send('save') },
        { label: 'Simpan sebagai…', accelerator: 'Shift+CmdOrCtrl+S', click: send('saveAs') },
        { type: 'separator' },
        { label: 'Ekspor PDF…', accelerator: 'Shift+CmdOrCtrl+E', click: send('pdf') },
        { label: 'Cetak…', accelerator: 'CmdOrCtrl+P', click: send('print') },
        ...(isMac ? [] : [{ type: 'separator' }, { role: 'quit', label: 'Keluar' }]),
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo', label: 'Urungkan' },
        { role: 'redo', label: 'Ulangi' },
        { type: 'separator' },
        { role: 'cut', label: 'Potong' },
        { role: 'copy', label: 'Salin' },
        { role: 'paste', label: 'Tempel' },
        { role: 'pasteAndMatchStyle', label: 'Tempel tanpa format' },
        { role: 'selectAll', label: 'Pilih semua' },
        { type: 'separator' },
        { label: 'Cari dan ganti…', accelerator: 'CmdOrCtrl+F', click: send('find') },
      ],
    },
    {
      label: 'Tampilan',
      submenu: [
        { role: 'togglefullscreen', label: 'Layar penuh' },
      ],
    },
    {
      role: 'window',
      label: 'Jendela',
      submenu: [
        { role: 'minimize', label: 'Perkecil' },
        { role: 'close', label: 'Tutup jendela' },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ---------- Siklus hidup ---------- */
app.whenReady().then(() => {
  app.setAboutPanelOptions({ applicationName: 'Lembar', applicationVersion: app.getVersion(), copyright: 'Perangkat lunak sumber terbuka (MIT)' });
  buildMenu();
  createWindow();
  const p = fileFromArgs(process.argv);
  if (p) sendOpen(p);
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
