import axios from 'axios';
import vue from 'vue';
import { Message } from 'view-design';
import configFile from '../../config/request.json';
const config = configFile[process.env.NODE_ENV];
// http request 拦截器
axios.interceptors.request.use(
	(config) => {
		if (localStorage.token) {
			// 判断是否存在token，如果存在的话，则每个http header都加上token
			config.headers.Authorization = `${localStorage.token}`;
		}
		return config;
	},
	(err) => {
		return Promise.reject(err);
	}
);
// http response 拦截器
axios.interceptors.response.use(
	(response) => {
		if (response.headers.authorization) {
			localStorage.token = response.headers.authorization;
		}
		return response;
	},
	(error) => {
		let message = '';
		if (error.response) {
			switch (error.response.status) {
				case 400:
					message = '请求错误(400)';
					break;
				case 401:
					message = '未授权，请重新登录(401)';
					localStorage && localStorage.removeItem('token');
					if (vue.isElectron) {
						vue.ipc.send('system', 'logoff');
					} else {
						if (router.currentRoute.fullPath !== '/login') {
							router.push({
								path: '/login',
							});
						}
					}
					break;
				case 403:
					message = '拒绝访问(403)';
					break;
				case 404:
					message = '请求出错(404)';
					break;
				case 408:
					message = '请求超时(408)';
					break;
				case 500:
					message = '服务器错误(500)';
					break;
				case 501:
					message = '服务未实现(501)';
					break;
				case 502:
					message = '网络错误(502)';
					break;
				case 503:
					message = '服务不可用(503)';
					break;
				case 504:
					message = '网络超时(504)';
					break;
				case 505:
					message = 'HTTP版本不受支持(505)';
					break;
				default:
					message = `连接出错(${error.response.status})!`;
			}
		} else {
			message = '无法连接服务器';
		}
		Message.error(message);
		return Promise.reject(error.response ? error.response.data : error); // 返回接口返回的错误信息
	}
);
function request(options) {
	let url = config.url;
	if (options.url.indexOf('http') === 0) {
		url = options.url;
	} else {
		url = url + options.url;
	}
	let params = new URLSearchParams();
	let method = options.method ? options.method.toUpperCase() : 'POST';
	let data = options.data || {};
	if (method === 'POST' || method === 'DELETE') {
		if (options.upload) {
			params = data;
		} else {
			for (let name in data) {
				if (data.hasOwnProperty(name)) {
					params.append(name, data[name]);
				}
			}
		}
	} else if (method === 'GET') {
		data = Object.keys(data)
			.map(function (key) {
				return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
			})
			.join('&');
		params = {};
		if (data) {
			url = url + '?' + data;
		}
	}
	return new Promise((resolve, reject) => {
		axios({
			url: url,
			method: method,
			data: params,
			emulateJSON: true,
		}).then(
			(response) => {
				response = response.data;
				options.callback && typeof options.callback === 'function' ? options.callback(response) : '';
				resolve(response);
				if (response.code !== 0) {
					options.error && typeof options.error === 'function' ? options.error(response) : '';
				}
			},
			(error) => {
				requestError(options, error);
				reject(error);
			}
		);
	}).catch((e) => {
		options.error && typeof options.error === 'function' ? options.error(e) : '';
	});
}
function requestError(options, error) {}
export { request, config };
