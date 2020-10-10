'use strict';
import { app, protocol, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
let { appId, projectName } = require('./common/projectInfo').default;
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);
const projectMain = require('./modules/' + projectName + '/background.js').default; //获取对应应用的主进程文件
global.windowObject = {}; //全局窗口变量
function CheckUpdate(event) {
	let message = {
		appName: projectName,
		error: '检查更新出错, 请联系开发人员',
		checking: '正在检查更新……',
		updateAva: '检测到新版本，正在下载……',
		updateNotAva: '现在使用的就是最新版本，不用更新',
		downloaded: '最新版本已下载，点击安装进行更新',
	};
	autoUpdater.removeAllListeners();
	//当开始检查更新的时候触发
	autoUpdater.on('checking-for-update', function () {
		event.sender.send('check-for-update', message.checking); //返回一条信息
	});
	//当发现一个可用更新的时候触发，更新包下载会自动开始
	autoUpdater.on('update-available', function (info) {
		event.sender.send('update-down-success', info);
		event.sender.send('check-for-update', message.updateAva); //返回一条信息
	});
	//当没有可用更新的时候触发
	autoUpdater.on('update-not-available', function () {
		event.sender.send('check-for-update', message.updateNotAva); //返回一条信息
	});
	autoUpdater.on('error', function () {
		event.sender.send('check-for-update', message.error); //返回一条信息
	});
	// 更新下载进度事件
	autoUpdater.on('download-progress', (progressObj) => {
		event.sender.send('download-progress', progressObj);
	});
	autoUpdater.on('update-downloaded', function () {
		event.sender.send('check-for-update', message.downloaded); //返回一条信息
		//通过main进程发送事件给renderer进程，提示更新信息
	});
}
/*初始化ipc*/
function bindIpc() {
	/*系统操作事件*/
	ipcMain.on('system', (event, type, data) => {
		switch (type) {
			case 'cloudWindow': //用于创建小型窗口
				projectMain.cloudWindow(data);
				break;
			case 'about':
				event.sender.send('about', ''); //返回一条信息
				break;
			case 'about-close':
				autoUpdater.removeAllListeners();
				break;
			case 'feedback':
				event.sender.send('feedBack', ''); //返回一条信息
				break;
			case 'check-for-update' /*检查更新*/:
				autoUpdater.setFeedURL(data); //设置检查url
				CheckUpdate(event);
				autoUpdater.checkForUpdates();
				break;
			case 'update' /*安装更新*/:
				autoUpdater.quitAndInstall();
				break;
			case 'auto-launch': //开机自启
				app.setLoginItemSettings({
					openAtLogin: data,
				});
				break;
			case 'exit':
				for (let win in global.windowObject) {
					global.windowObject[win] && global.windowObject[win].close();
				}
				app.quit();
				break;
		}
	});
}
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
	app.quit();
} else {
	app.on('second-instance', () => {
		projectMain.second && projectMain.second();
	});
	app.on('ready', function () {
		bindIpc(); //初始化ipc
		createProtocol('app');
		app.setAppUserModelId(appId);
		app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
		projectMain.ready && projectMain.ready();
	});
}
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
app.on('activate', () => {
	projectMain.activate && projectMain.activate();
});
