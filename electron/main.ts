import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, Notification } from 'electron'
import Store from 'electron-store'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let tray: Tray | null
let widgetWin: BrowserWindow | null = null

const store = new Store()

ipcMain.on('toggle-widget', () => {
  if (widgetWin) {
    widgetWin.close()
    widgetWin = null
  } else {
    createWidgetWindow()
  }
})

ipcMain.on('electron-store-get', async (event, val) => {
  event.returnValue = store.get(val)
})

ipcMain.on('electron-store-set', async (_event, key, val) => {
  store.set(key, val)
})

ipcMain.on('electron-store-delete', async (_event, key) => {
  store.delete(key)
})

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'OmniDo',
    titleBarStyle: 'hidden',
    ...(process.platform === 'win32' ? {
      titleBarOverlay: {
        color: '#ffffff',
        symbolColor: '#1c1c1e',
        height: 32
      }
    } : {}),
    icon: path.join(process.env.VITE_PUBLIC, 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

function createWidgetWindow() {
  widgetWin = new BrowserWindow({
    width: 320,
    height: 480,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: false,
    skipTaskbar: true,
    hasShadow: false,
    type: 'desktop', // macOS specific behavior (stays behind windows)
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // macOS specific: Prevent window from appearing in mission control and pin to desktop
  if (process.platform === 'darwin') {
    widgetWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    widgetWin.setWindowButtonVisibility(false)
  }

  if (VITE_DEV_SERVER_URL) {
    widgetWin.loadURL(`${VITE_DEV_SERVER_URL}#/widget`)
  } else {
    widgetWin.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: 'widget' })
  }

  widgetWin.on('closed', () => {
    widgetWin = null
  })
}

function createTray() {
  const iconPath = path.join(process.env.VITE_PUBLIC, 'logo.png')
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show OmniDo', click: () => win?.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ])
  tray.setToolTip('OmniDo')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (win?.isVisible()) {
      win.hide()
    } else {
      win?.show()
    }
  })
}

function showNotification(title: string, body: string) {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body,
      silent: false,
    }).show()
  }
}

function checkReminders() {
  const tasks = store.get('omnido_tasks') as any[] || []
  const sentReminders = store.get('sent_reminders') as Record<string, string[]> || {}
  const now = new Date()

  let changed = false

  tasks.forEach(task => {
    if (task.completed || !task.date) return

    const taskDate = new Date(task.date)
    const diffMs = taskDate.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    const taskId = task.id
    if (!sentReminders[taskId]) sentReminders[taskId] = []

    // 1 day reminder (between 23 and 24 hours before)
    if (diffHours > 23 && diffHours <= 24 && !sentReminders[taskId].includes('1d')) {
      showNotification('Reminder: Task due in 1 day', task.title)
      sentReminders[taskId].push('1d')
      changed = true
    }
    // 1 hour reminder (between 0 and 1 hour before)
    else if (diffHours > 0 && diffHours <= 1 && !sentReminders[taskId].includes('1h')) {
      showNotification('Reminder: Task due in 1 hour', task.title)
      sentReminders[taskId].push('1h')
      changed = true
    }
  })

  if (changed) {
    store.set('sent_reminders', sentReminders)
  }

  // Cleanup old reminders to prevent store bloat
  // Remove taskId if task no longer exists or is completed
  const currentTaskIds = new Set(tasks.map(t => t.id))
  let cleanupPerformed = false
  Object.keys(sentReminders).forEach(id => {
    const task = tasks.find(t => t.id === id)
    if (!currentTaskIds.has(id) || (task && task.completed)) {
      delete sentReminders[id]
      cleanupPerformed = true
    }
  })

  if (cleanupPerformed) {
    store.set('sent_reminders', sentReminders)
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
  createTray()

  // Initial check
  checkReminders()
  // Set up interval for reminders (every 5 minutes)
  setInterval(checkReminders, 5 * 60 * 1000)
})
