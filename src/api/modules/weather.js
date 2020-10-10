import { request } from '../request';
export default {
	get: function (data, callback, error) {
		let url = '/weather/get/';
		url = url + (data ? data : '深圳');
		return request({
			url: url,
			method: 'get',
			callback: callback,
			error: error,
		});
	},
	getHotCity: function (callback, error) {
		return request({
			url: '/weather/city/hot',
			method: 'get',
			callback: callback,
			error: error,
		});
	},
	searchCity: function (name, callback, error) {
		return request({
			url: '/weather/city/search',
			data: {
				name: name,
			},
			method: 'get',
			callback: callback,
			error: error,
		});
	},
	now: function (location, callback, error) {
		return request({
			url: '/weather/now',
			data: {
				location: location,
			},
			method: 'get',
			callback: callback,
			error: error,
		});
	},
	get3days: function (location, callback, error) {
		return request({
			url: '/weather/get3days',
			data: {
				location: location,
			},
			method: 'get',
			callback: callback,
			error: error,
		});
	},
	get7days: function (location, callback, error) {
		return request({
			url: '/weather/get7days',
			data: {
				location: location,
			},
			method: 'get',
			callback: callback,
			error: error,
		});
	},
	future24h: function (location, callback, error) {
		return request({
			url: '/weather/future24h',
			data: {
				location: location,
			},
			method: 'get',
			callback: callback,
			error: error,
		});
	},
	indices: function (location, callback, error) {
		return request({
			url: '/weather/indices',
			data: {
				location: location,
			},
			method: 'get',
			callback: callback,
			error: error,
		});
	},
	warning: function (location, callback, error) {
		return request({
			url: '/weather/warning',
			data: {
				location: location,
			},
			method: 'get',
			callback: callback,
			error: error,
		});
	},
};
