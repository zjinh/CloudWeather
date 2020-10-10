/*这个文件是所有模块通用的*/
import Vue from 'vue';
const path = require('path');
import api from '../api/index';
const packageInfo = require('../../package.json');
const projectInfo = require('./projectInfo').default;
const projectName = projectInfo.projectName;
packageInfo.name = projectName;
require('./tool'); //引入工具函数
import cloudWindow from './cloudWindow'; //引入窗口组件
Vue.api = Vue.prototype.$api = api; //全局注册api;
// 引入插件
import '../plugins/iview.js';
import '../plugins/element.js';
/*开始自动化引入公用组件*/
const requireComponent = require.context('../components/public', true, /\.vue$/);
requireComponent.keys().forEach((fileName) => {
	// 获取组件配置
	const componentConfig = requireComponent(fileName);
	// 剥去文件名开头的 `./` 和`.vue`结尾的扩展名
	const componentName = path.basename(fileName).replace(/\.vue$/, '');
	// 全局注册组件
	Vue.component(componentName.replace(/\//, '-'), componentConfig.default || componentConfig);
});
Vue.path = Vue.prototype.$path = path; //注册path
Vue.packageInfo = Vue.prototype.$packageInfo = packageInfo; //注册packageInfo
let debounceTimeout = null; //定义一个定时器
Vue.debounce = Vue.prototype.$debounce = function (fn, wait) {
	if (debounceTimeout) {
		clearTimeout(debounceTimeout);
	}
	debounceTimeout = setTimeout(() => {
		fn();
		clearTimeout(debounceTimeout);
	}, wait);
}; //防抖
Vue.notify = Vue.prototype.$notify = function (msg, name) {
	const notification = {
		title: name || projectName,
		body: msg,
		icon: projectInfo.logo,
	};
	return new window.Notification(notification.title, notification);
}; //通知接口
Vue.isElectron = Vue.prototype.$isElectron = !!process.versions; //是否是electron
if (Vue.isElectron) {
	const electron = require('electron');
	const ipcRenderer = electron.ipcRenderer;
	//引入electron接口
	Vue.electron = Vue.prototype.$electron = electron; //electron
	Vue.ipc = Vue.prototype.$ipc = ipcRenderer; //ipc接口
	Vue.ipc.on('about', function () {
		Vue.about();
	});
	Vue.ipc.on('feedBack', function () {
		Vue.feedBack();
	});
}
Vue.cloudWindow = Vue.prototype.$cloudWindow = cloudWindow;
let about = null; //关于窗口
let feedBack = null; //问题反馈窗口
Vue.about = Vue.prototype.$about = function () {
	if (about) {
		return about.active();
	}
	about = Vue.cloudWindow({
		width: 600,
		height: 330,
		only: true,
		name: 'about',
		url: 'about',
		title: '关于' + projectName,
		frame: false, //
		maximizable: false,
		minimizable: false,
		resizable: false,
		component: require('../views/aboutWindow'),
		close: function () {
			about = false;
		},
	});
};
Vue.feedBack = Vue.prototype.$feedBack = function () {
	if (feedBack) {
		return feedBack.active();
	}
	feedBack = Vue.cloudWindow({
		width: 500,
		height: 350,
		only: true,
		name: 'feedBack',
		url: 'feedBack',
		title: '问题反馈' + projectName,
		frame: false, //
		maximizable: false,
		minimizable: false,
		resizable: false,
		component: require('../views/feedBackWindow'),
		close: function () {
			feedBack = false;
		},
	});
};
Vue.disableDrag = Vue.prototype.$disableDrag = function () {
	window.addEventListener(
		'dragenter',
		function (e) {
			e.preventDefault();
		},
		false
	);
	window.addEventListener(
		'dragover',
		function (e) {
			e.preventDefault();
		},
		false
	);
	window.addEventListener(
		'dragleave',
		function (e) {
			e.preventDefault();
		},
		false
	);
	window.addEventListener(
		'drop',
		function (e) {
			e.preventDefault();
		},
		false
	);
};
Vue.copyRight = Vue.prototype.$copyRight = `©2014-2020 CloudSeries ${projectInfo.logoText} All rights reserved ZJINH`; //版权信息
Vue.projectInfo = Vue.prototype.$projectInfo = projectInfo;
Vue.projectEnv = Vue.prototype.$projectEnv = projectInfo.env || process.platform;
