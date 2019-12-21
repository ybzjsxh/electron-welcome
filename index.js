const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const fs = require('fs');
const { debug, content } = require('./config.json');

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win;

function createWindow() {
  // 创建浏览器窗口。
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    autoHideMenuBar: !debug,
    fullscreen: !debug,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // 加载index.html文件
  win.loadFile('index.html');

  // 打开开发者工具
  debug ? win.webContents.openDevTools() : null;

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null;
  });
  // win.webContents.on('did-finish-load', );
}

ipcMain.on('get-content', () => {
  console.log('receive', content, win.webContents.content)
  win.webContents.content = content
  console.log(win.webContents.content)
})

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow);

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow();
  }
});

ipcMain.on('click', () => {
  let pid = win.webContents.getOSProcessId();
  console.log(pid);
  fs.writeFile('./pid.txt', pid, err => {
    if (!err) {
      console.log('success');
    } else {
      console.log('fail');
    }
  });
});