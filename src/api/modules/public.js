import { request, config } from '../request';
export default {
	check(url, callback, error) {
		return request({
			url: url,
			method: 'get',
			data: [],
			success: callback,
			error: error,
		});
	},
	verifyCode() {
		return config.url + '/user/code' + '?' + Math.random();
	},
	server(key) {
		return config[key] + '/';
	},
};
