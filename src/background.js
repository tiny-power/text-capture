import { app, protocol, BrowserWindow, ipcMain, clipboard, Tray, nativeImage, Menu, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'
import path from 'path'
const child_process = require('child_process')
const Store = require('electron-store')
const store = new Store()

protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true } }
])

let mainWindow = null
let tray = null
async function createMainWindow() {
    if (!app.requestSingleInstanceLock()) {
        app.quit()
        return
    }

    mainWindow = new BrowserWindow({
        width: 146,
        height: 92,
        show: false,
        resizable: false,
        maximizable: true,
        autoHideMenuBar: true,
        useContentSize: true,
        transparent: true,
        frame: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
    } else {
        createProtocol('app')
        mainWindow.loadURL('app://./index.html')
    }
}

ipcMain.handle('writeText', async (event, args) => {
    clipboard.writeText(args)
    mainWindow.show()
    setTimeout(() => {
        mainWindow.hide()
    }, 2000)
})

function createTray() {
    tray = new Tray(nativeImage.createFromPath(path.join(__static + '/trayTemplate.png')))
    tray.setContextMenu(setContextMenu())
}

function setContextMenu() {
    let speech = store.get('speech') || false
    store.set('speech', speech)
    let launch = store.get('launch') || false
    store.set('launch', launch)
    let lang = store.get('lang') || 'eng'

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Capture Text',
            accelerator: 'Shift+CmdOrCtrl+1',
            click: () => {
                screencapture()
            }
        },
        { type: 'separator' },
        {
            label: 'Text to Speech',
            type: 'checkbox',
            checked: speech,
            click: () => {
                let speech = store.get('speech')
                store.set('speech', !speech)
            }
        },
        { type: 'separator' },
        {
            label: 'launch at Login',
            type: 'checkbox',
            checked: launch,
            click: () => {
                let launch = store.get('launch')
                store.set('launch', !launch)
                if (!launch) {
                    app.setLoginItemSettings({
                        openAtLogin: true
                    })
                } else {
                    app.setLoginItemSettings({
                        openAtLogin: false
                    })
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Recognition Language',
            submenu: [
                {
                    label: 'English',
                    type: 'checkbox',
                    checked: lang === 'eng',
                    click: () => {
                        store.set('lang', 'eng')
                        tray.setContextMenu(setContextMenu())
                    }
                },
                {
                    label: 'English+Chinese',
                    type: 'checkbox',
                    checked: lang === 'chi_sim+eng',
                    click: () => {
                        store.set('lang', 'chi_sim+eng')
                        tray.setContextMenu(setContextMenu())
                    }
                },
                {
                    label: 'Spanish',
                    type: 'checkbox',
                    checked: lang === 'spa',
                    click: () => {
                        store.set('lang', 'spa')
                        tray.setContextMenu(setContextMenu())
                    }
                },
                {
                    label: 'German',
                    type: 'checkbox',
                    checked: lang === 'deu',
                    click: () => {
                        store.set('lang', 'deu')
                        tray.setContextMenu(setContextMenu())
                    }
                },
                {
                    label: 'French',
                    type: 'checkbox',
                    checked: lang === 'fra',
                    click: () => {
                        store.set('lang', 'fra')
                        tray.setContextMenu(setContextMenu())
                    }
                },
                {
                    label: 'Italian',
                    type: 'checkbox',
                    checked: lang === 'ita',
                    click: () => {
                        store.set('lang', 'ita')
                        tray.setContextMenu(setContextMenu())
                    }
                },
                {
                    label: 'Portuguese',
                    type: 'checkbox',
                    checked: lang === 'por',
                    click: () => {
                        store.set('lang', 'por')
                        tray.setContextMenu(setContextMenu())
                    }
                },
                {
                    label: 'Chinese Simplified',
                    type: 'checkbox',
                    checked: lang === 'chi_sim',
                    click: () => {
                        store.set('lang', 'chi_sim')
                        tray.setContextMenu(setContextMenu())
                    }
                },
                {
                    label: 'Chinese Traditional',
                    type: 'checkbox',
                    checked: lang === 'chi_tra',
                    click: () => {
                        store.set('lang', 'chi_tra')
                        tray.setContextMenu(setContextMenu())
                    }
                },
                {
                    label: 'Japanese',
                    type: 'checkbox',
                    checked: lang === 'jpn',
                    click: () => {
                        store.set('lang', 'jpn')
                        tray.setContextMenu(setContextMenu())
                    }
                },
                {
                    label: 'Korean',
                    type: 'checkbox',
                    checked: lang === 'kor',
                    click: () => {
                        store.set('lang', 'kor')
                        tray.setContextMenu(setContextMenu())
                    }
                },
                {
                    label: 'Ukrainian',
                    type: 'checkbox',
                    checked: lang === 'ukr',
                    click: () => {
                        store.set('lang', 'ukr')
                        tray.setContextMenu(setContextMenu())
                    }
                },
                {
                    label: 'Russian',
                    type: 'checkbox',
                    checked: lang === 'rus',
                    click: () => {
                        store.set('lang', 'rus')
                        tray.setContextMenu(setContextMenu())
                    }
                }
            ]
        },
        { type: 'separator' },
        // {
        //     label: 'Preferences...',
        //     click: () => {}
        // },
        // { type: 'separator' },
        {
            label: 'Quit TextCapture',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
                app.quit()
            }
        }
    ])
    return contextMenu
}

function screencapture() {
    let license = store.get('license') || false
    if (license) {
        child_process.exec(`screencapture -i -x -c`, error => {
            if (!error) {
                let img = clipboard.readImage()
                let dataUrl = img.toDataURL()
                mainWindow.webContents.send('recognize', dataUrl)
            }
        })
    } else {
        createLicenseWindow()
    }
}

let licenseWindow = null
async function createLicenseWindow() {
    licenseWindow = new BrowserWindow({
        title: 'Activate License',
        width: 480,
        height: 180,
        resizable: false,
        maximizable: true,
        autoHideMenuBar: true,
        useContentSize: true,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        await licenseWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '#/license')
    } else {
        licenseWindow.loadURL('app://./index.html#/license')
    }
}

ipcMain.handle('closeLicense', async (event, args) => {
    if (licenseWindow != null) {
        licenseWindow.close()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
})

app.on('ready', async () => {
    if (process.platform == 'darwin') {
        app.dock.hide()
    }
    await createMainWindow()
    createTray()
    globalShortcut.register('CmdOrCtrl+Q', () => {
        app.quit()
    })
    globalShortcut.register('Shift+CmdOrCtrl+1', () => {
        screencapture()
    })
})

if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', data => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}

if (app.isPackaged) {
    let launch = store.get('launch') || false
    if (launch) {
        app.setLoginItemSettings({
            openAtLogin: true
        })
    }
}
