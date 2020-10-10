'use strict';
import windowControl from '../../common/main/windowControl';
let mainWindow;
function createWindow() {
	if (mainWindow) {
		return windowControl.active(mainWindow, '');
	}
	mainWindow = windowControl.create({
		url: 'index',
		title: 'C-WEATHER',
		width: 1200,
		height: 620,
		maximizable: false,
		resizable: true,
		onclose: () => {
			mainWindow = null;
		},
	});
}
export default {
	activate() {
		if (mainWindow === null) {
			createWindow();
		}
	},
	ready() {
		createWindow();
	},
	second() {
		if (mainWindow) {
			mainWindow.show();
			mainWindow.restore();
			mainWindow.focus();
		}
	},
	cloudWindow: function (options) {
		windowControl.cloudWindow(
			options,
			() => {
				options.eleCallback && eval(options.eleCallback);
			},
			() => {
				options.eleClose && eval(options.eleClose);
			}
		);
	},
};
