import Vue from 'vue';
import cloudWindowComponent from '../components/public/cloudWindow.vue';
// 通过Vue.extend将组件包装成一个子类
let allCloudWindow = {};
const cloudWindowConstructor = Vue.extend({
	...cloudWindowComponent,
	destroyed: function (e) {
		delete allCloudWindow[this.id];
	},
});
cloudWindowConstructor.prototype.closeAll = function () {
	for (let i in allCloudWindow) {
		allCloudWindow[i].close();
	}
	allCloudWindow = {};
};
const cloudWindow = (options = {}) => {
	if (!!process.versions) {
		//如果是electron
		if (!options.name) {
			throw '缺少name参数作为electron窗口变量';
			return;
		}
		if (!options.url) {
			throw '缺少url参数作为electron窗口打开的链接';
			return;
		}
		if (options.eleCallback) {
			if (typeof options.eleCallback !== 'string') {
				throw 'eleCallback为electron窗口回调函数，需要是在主进程定义的方法名';
				return;
			}
		}
		if (options.eleClose) {
			if (typeof options.eleClose !== 'string') {
				throw 'eleClose为electron窗口关闭函数，需要是在主进程定义的方法名';
				return;
			}
		}
		delete options.closeAnim;
		delete options.openAnim;
		Vue.ipc.send('system', 'cloudWindow', JSON.handle(options));
		return;
	}
	// 如果组件已渲染，则返回即可
	// 要挂载的元素
	const parent = document.body;
	// 组件属性
	/*const opts = {
		text: '',
		...options,
	};*/
	// 通过构造函数初始化组件 相当于 new Vue()
	const instance = new cloudWindowConstructor({
		el: document.createElement('div'),
		//data: opts,
	});
	// 将元素挂在到parent上面
	parent.appendChild(instance.$el);
	// 显示
	Vue.nextTick(() => {
		let id = instance.init(options);
		allCloudWindow[id || 'close'] = instance;
	});
	// 将组件实例赋值给
	return instance;
};

export default cloudWindow;
