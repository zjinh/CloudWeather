//时间工具函数
Date.prototype.format = function (fmt) {
	const o = {
		'y+': this.getFullYear(),
		'M+': this.getMonth() + 1,
		'd+': this.getDate(),
		'H+': this.getHours(),
		'm+': this.getMinutes(),
		's+': this.getSeconds(),
		'S+': this.getMilliseconds(),
		'q+': Math.floor(this.getMonth() / 3) + 1,
		'h+': (() => {
			const hour = this.getHours() % 12;
			return hour === 0 ? 12 : hour;
		})(),
		'E+': (() => {
			const week = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
			return week[this.getDay() + ''];
		})(),
		/*
    "e+": (()=>{
        const week = {"0":"Sun","1":"Mon","2":"Tue","3":"Wed","4":"Thu","5":"Fri","6":"Sat"};
        return week[this.getDay()+""];
    })(),
    */
		x1: (() => {
			const week = { 0: '周日', 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六' };
			return week[this.getDay() + ''];
		})(),
		x2: (() => {
			const hour = ['凌晨', '早上', '下午', '晚上'];
			const h = this.getHours();
			if (h === 12) return '中午';
			return hour[parseInt(h / 6)];
		})(),
	};
	for (let k in o) {
		if (new RegExp('(' + k + ')', 'g').test(fmt)) {
			const len = RegExp.$1.length;
			fmt = fmt.replace(RegExp.$1, len === 1 ? o[k] : ('00' + o[k]).substr(-len));
		}
	}
	return fmt;
};
Date.prototype.getDays = function (time, len, diretion) {
	let tt = new Date(time);
	let getDay = function (day) {
		let t = new Date(time);
		t.setDate(t.getDate() + day);
		return t.format('yyyy-MM-dd');
	};
	let arr = [];
	if (diretion === 1) {
		for (let i = 1; i < len; i++) {
			arr.unshift(getDay(-i));
		}
	} else if (diretion === 2) {
		for (let i = 1; i < len; i++) {
			arr.push(getDay(i));
		}
	} else {
		for (let i = 1; i < len; i++) {
			arr.unshift(getDay(-i));
		}
		arr.push(tt.getFullYear() + '-' + (tt.getMonth() + 1) + '-' + tt.getDate());
		for (let i = 1; i < len; i++) {
			arr.push(getDay(i));
		}
	}
	let result = tt.format('yyyy-MM-dd');
	return diretion === 1 ? arr.concat([result]) : diretion === 2 ? [result].concat(arr) : arr;
};
Date.prototype.getAllDate = function (start, end) {
	let dateArr = [];
	let startArr = new Date(start).format('yyyy-MM-dd').split('-');
	let endArr = new Date(end).format('yyyy-MM-dd').split('-');
	let db = new Date();
	db.setUTCFullYear(startArr[0], startArr[1] - 1, startArr[2]);
	let de = new Date();
	de.setUTCFullYear(endArr[0], endArr[1] - 1, endArr[2]);
	let unixDb = db.getTime();
	let unixDe = de.getTime();
	let stamp;
	const oneDay = 24 * 60 * 60 * 1000;
	for (stamp = unixDb; stamp <= unixDe; ) {
		dateArr.push(new Date(parseInt(stamp)).format('yyyy-MM-dd'));
		stamp = stamp + oneDay;
	}
	return dateArr;
};
Date.prototype.age = function (birth) {
	birth = Date.parse(birth ? birth : ''.replace('/-/g', '/'));
	return parseInt((this - new Date(birth)) / (1000 * 60 * 60 * 24 * 365));
};
//字符串工具函数
String.prototype.Before = function (substr) {
	return this.substring(this.lastIndexOf(substr) + 1, this.length);
};
String.prototype.Exist = function (substr) {
	if (substr === '|*|') {
		return true;
	}
	for (let i = 0; i < substr.split(',').length; i++) {
		if (this.indexOf(substr.split(',')[i]) >= 0) {
			return true;
		}
	}
	return false;
};
//json工具函数
JSON.handle = function (data) {
	return JSON.parse(JSON.stringify(data));
};
