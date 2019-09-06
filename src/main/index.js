import { app, BrowserWindow,ipcMain } from 'electron'
const path = require('path');
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
let version=require("../../package.json").version;
let MainWindow;
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow () {
  MainWindow = new BrowserWindow({
    height: 600,
    width: 1100,
    frame:false,
    maximizable:false,
    resizable:false,
    backgroundColor:'#1f8cda',
    webPreferences:{
      nodeIntegration:true,
      webSecurity:false
    }
  });
  MainWindow.setMenu(null);
  MainWindow.loadURL(winURL);

  MainWindow.on('closed', () => {
    MainWindow = null
  })
}
function BindIpc(){
  ipcMain.on('mini', function () {
    MainWindow.minimize();
  });
  ipcMain.on('close', function () {
    app.quit()
  });
}
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (MainWindow) {
      MainWindow.show();
      MainWindow.restore();
      MainWindow.focus()
    }
  });
  app.on('ready', function (){
    app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
    BindIpc();
    createWindow();
  });
}
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
app.on('activate', () => {
  if (MainWindow === null) {
    createWindow()
  }
});
