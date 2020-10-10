/*开始自动化引入公用组件*/
const api = {};
const path = require('path');
const requireComponent = require.context('./modules', true, /\.js$/);
const modules = requireComponent.keys().filter((item) => {
	if (process.versions) {
		return item;
	} else {
		if (!item.includes('localFile')) {
			return item;
		}
	}
});
modules.forEach((fileName) => {
	// 剥去文件名开头的 `./` 和`.vue`结尾的扩展名
	let moduleFile = path.basename(fileName);
	const apiModule = moduleFile.replace(/\.js$/, '');
	api[apiModule] = require('./modules/' + moduleFile).default; //按模块添加
});
export default api;
