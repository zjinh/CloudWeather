<template>
	<div class="cloud-weather-main">
		<windowHeader :config="headerConfig"></windowHeader>
		<weatherAnim></weatherAnim>
		<div class="head" :class="platform">
			<div class="logo">C-WEATHER</div>
			<div class="control">
				<Tooltip content="关于">
					<div class="icon sf-icon-info-circle" @click="showAbout"></div>
				</Tooltip>
				<Tooltip content="问题反馈">
					<div class="icon sf-icon-comment-alt-edit" @click="showFeedBack"></div>
				</Tooltip>
				<Tooltip content="刷新">
					<div class="icon sf-icon-redo"></div>
				</Tooltip>
				<input type="text" placeholder="搜索" />
			</div>
		</div>
		<div class="container-bg" :style="{ background: 'url(' + backgroundUrl + ')' }"></div>
		<div class="container" id="weatherContainer">
			<p class="city-name">{{ city }}</p>
			<ul class="today-info">
				<li class="img">
					<img draggable="false" :src="todayWeather.dayPictureUrl" />
				</li>
				<li class="temperate">{{ temperate }}</li>
				<li class="unit">
					<span>C</span>
				</li>
			</ul>
			<p class="today-weather">{{ todayWeather.weather }}</p>
			<p class="today-wind">
				<span class="sf-icon-paper-plane"></span>
				风力&nbsp;&nbsp;{{ todayWeather.wind }}<br />pm2.5指数&nbsp;&nbsp;{{ pm25 }}
			</p>
			<p class="title">未来</p>
			<ul class="weather-card">
				<li v-for="(item, index) in weatherList" :key="index">
					<img draggable="false" :src="item.dayPictureUrl" />
					<div class="info">
						<p class="time">{{ item.date }}</p>
						<p>{{ item.temperature }}</p>
						<p>{{ item.weather }}</p>
						<p>{{ item.wind }}</p>
					</div>
				</li>
			</ul>
			<p class="title">未来趋势</p>
			<canvas ref="weatherTread" width="550" height="233"></canvas>
			<p class="title" v-if="tipsData.length">今日指数</p>
			<ul class="tips-card">
				<li v-for="(item, index) in tipsData" :key="index">
					<p>
						{{ item.tipt }}
						<span>{{ item.zs }}</span>
					</p>
					<div>
						{{ item.des }}
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
import weatherAnim from '../components/weatherAnim';
export default {
	name: 'weather',
	components: {
		weatherAnim,
	},
	mounted() {
		this.$nextTick(() => {
			this.$refs.weatherTread.setAttribute('width', document.getElementById('weatherContainer').offsetWidth - 100);
		});
		this.loadData();
	},
	data() {
		return {
			platform: this.$projectInfo.env || process.platform,
			headerConfig: {
				background: (this.$projectInfo.env || process.platform) === 'browser' ? 'transparent' : 'rgba(0, 0, 0, 0.2)',
				color: '#fff',
				title: '',
				resize: false,
				mini: true,
			},
			city: '深圳',
			backgroundUrl: require('../assets/bg/bg_fog.png'),
			temperate: '0°', //当天温度
			todayWeather: {},
			pm25: '1',
			weatherList: [],
			tipsData: [],
			weatherIcon: ['duoyun.png', 'fuchen.png', 'mai.png', 'qing.png', 'wu.png', 'zhenxue.png', 'zhenyu.png'],
		};
	},
	methods: {
		loadData() {
			this.$api.weather.get('深圳', (rs) => {
				let data = rs.data.results[0].weather_data;
				let tipsData = rs.data.results[0].index;
				this.temperate = data[0].date.slice(data[0].date.lastIndexOf('(') + 4, data[0].date.lastIndexOf(')') - 1) + '°';
				data.forEach((list) => {
					list.date = list.date.substr(0, 2);
					let icon = list.nightPictureUrl.split('/')[6];
					let folder = this.weatherIcon.includes(icon) ? list.dayPictureUrl.split('/')[5] : 'normal';
					this.weatherBackGround(icon);
					list.dayPictureUrl = require('../assets/' + folder + '/' + icon);
				});
				this.tipsData = tipsData;
				this.weatherList = data;
				this.todayWeather = data[0];
				this.pm25 = rs.data.results[0].pm25;
				this.city = rs.data.results[0].currentCity;
				this.showTread(rs.data.results[0]);
			});
		},
		weatherBackGround(icon) {
			if (icon.includes('xue')) {
				this.backgroundUrl = require('../assets/bg/bg_snow.png');
			} else if (icon.includes('yu')) {
				this.backgroundUrl = require('../assets/bg/bg_rain.png');
			} else if (icon.includes('qing')) {
				this.backgroundUrl = require('../assets/bg/bg_sunny.png');
			} else if (icon.includes('wu')) {
				this.backgroundUrl = require('../assets/bg/bg_fog.png');
			} else if (icon.includes('fuchen')) {
				this.backgroundUrl = require('../assets/bg/bg_haze.png');
			} else if (icon.includes('yin') || icon.includes('leizhenyu')) {
				this.backgroundUrl = require('../assets/bg/bg_cloudy.png');
			} else {
				this.backgroundUrl = require('../assets/bg/bg_sunny.png');
			}
		},
		showTread(data) {
			let dateData = this.weatherCandler(new Date().getFullYear() + '-' + new Date().getMonth() + 1 + '-' + new Date().getDay());
			let trendData = [], // 趋势数据
				weather = [],
				weekData = [],
				trendText,
				weatherText;
			for (let i = 0, len = data.weather_data.length; i < len; i++) {
				// 更新天气详情
				weekData[i] = data.weather_data[i].date.slice(0, 2);
			}
			for (let i = 0, len = data.weather_data.length; i < len; i++) {
				trendText = data.weather_data[i].temperature;
				weatherText = data.weather_data[i].weather;
				trendData[i] = [];
				weather[i] = [];
				if (/\~/.test(trendText)) {
					trendData[i][0] = trendText.slice(0, trendText.indexOf('~') - 1);
					trendData[i][1] = trendText.slice(trendText.indexOf('~') + 2, trendText.length - 1);
				} else if (realtext !== '') {
					trendData[i][0] = realtext.slice(0, realtext.length - 1);
					trendData[i][1] = trendText.slice(0, trendText.length - 1);
					if (trendData[i][0] * 1 < trendData[i][1] * 1) {
						let temp = trendData[i][0];
						trendData[i][0] = trendData[i][1];
						trendData[i][1] = temp;
					}
				} else {
					trendData[i][0] = trendText.slice(0, trendText.length - 1);
					trendData[i][1] = trendData[i][0];
				}
				if (/\转/.test(weatherText)) {
					weather[i][0] = weatherText.slice(0, weatherText.indexOf('转'));
					weather[i][1] = weatherText.slice(weatherText.indexOf('转') + 1);
				} else {
					weather[i][0] = weatherText;
					weather[i][1] = weatherText;
				}
			}
			trendData.push(weather);
			trendData.push(dateData);
			trendData.push(weekData);
			let canvas = this.$refs.weatherTread,
				ctx = canvas.getContext('2d'),
				box = {
					width: canvas.width,
					height: canvas.height,
				},
				average = box.width / 8,
				max = Number(trendData[0][0]),
				min = Number(trendData[0][1]),
				center = 0,
				radius = 6,
				proportion,
				date,
				week,
				len = trendData.length;
			for (let i = 0; i < 4; i++) {
				if (Number(trendData[i][0]) > max) {
					max = Number(trendData[i][0]);
				}
				if (Number(trendData[i][1]) < min) {
					min = Number(trendData[i][1]);
				}
			}
			center = max - min; // 温差
			if (center <= 10) {
				proportion = 10;
			} else if (center <= 18) {
				proportion = 8;
			} else if (center <= 30) {
				proportion = 5;
			} else {
				proportion = 2;
			}
			center = (max + min) / 2;
			ctx.clearRect(0, 0, box.width, box.height);
			ctx.strokeStyle = '#fff';
			ctx.font = 'normal 14px Microsoft YaHei';
			ctx.fillStyle = '#fff';
			ctx.lineWidth = 1;
			ctx.textAlign = 'center';
			for (let i = 1; i <= 4; i++) {
				date = trendData[len - 2][i - 1];
				week = trendData[len - 1][i - 1];
				ctx.beginPath();
				//ctx.fillText(/*date[0] + '/' + date[1] + ' ' + */week, average*(2*i - 1), box.height-30);显示日期
			}
			ctx.beginPath();
			ctx.save();
			ctx.translate(0, box.height / 2);
			ctx.lineWidth = 2;
			ctx.textAlign = 'center';
			ctx.font = 'normal 16px Microsoft YaHei';
			for (let i = 0; i < len - 3; i++) {
				ctx.beginPath();
				ctx.strokeStyle = '#fff';
				ctx.fillStyle = '#fff';
				ctx.fillText(trendData[i][1] + '°', average * (2 * i + 1), (center - trendData[i][1]) * proportion + 35);
				ctx.fillText(trendData[4][i][1], average * (2 * i + 1), (center - trendData[i][1]) * proportion + 55);
				ctx.arc(average * (2 * i + 1), (center - trendData[i][1]) * proportion, radius, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.moveTo(average * (2 * i + 1), (center - trendData[i][1]) * proportion);
				ctx.lineTo(average * (2 * i + 3), (center - trendData[i + 1][1]) * proportion);
				ctx.stroke();
				ctx.beginPath();
				ctx.strokeStyle = '#b1f71a';
				ctx.fillStyle = '#b1f71a';
				ctx.fillText(trendData[i][0] + '°', average * (2 * i + 1), (center - trendData[i][0]) * proportion - 20);
				ctx.fillText(trendData[4][i][0], average * (2 * i + 1), (center - trendData[i][0]) * proportion - 40);
				ctx.arc(average * (2 * i + 1), (center - trendData[i][0]) * proportion, radius, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.moveTo(average * (2 * i + 1), (center - trendData[i][0]) * proportion);
				ctx.lineTo(average * (2 * i + 3), (center - trendData[i + 1][0]) * proportion);
				ctx.stroke();
			}
			ctx.restore();
		},
		weatherCandler(dateString) {
			let date = [],
				nonleap = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
				leap = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
				year,
				month,
				theDate;
			year = dateString.slice(0, dateString.indexOf('-'));
			month = dateString.slice(dateString.indexOf('-') + 1, dateString.lastIndexOf('-'));
			theDate = dateString.slice(dateString.lastIndexOf('-') + 1);
			if (year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)) {
				var monthNum = leap[Number(month)];
			} else {
				var monthNum = nonleap[Number(month)];
			}
			for (let i = 0; i < 4; i++) {
				date[i] = [];
				date[i][0] = Number(month);
				date[i][1] = theDate++;
				if (date[i][1] > monthNum) {
					if (++month > 12) {
						month = 1;
						date[i][0] = month;
					} else {
						date[i][0] = month;
					}
					theDate = 1;
					date[i][1] = theDate++;
				}
			}
			return date;
		},
		showFeedBack() {
			this.$feedBack();
		},
		showAbout() {
			this.$about();
		},
	},
};
</script>

<style lang="scss" scoped>
.darwin {
	flex-direction: row-reverse;
	.logo,
	.control {
		flex-direction: row-reverse;
		input {
			margin-left: 0 !important;
			margin-right: 15px;
		}
	}
}
.browser {
	.logo,
	.control {
		margin-top: -30px !important;
		position: relative;
		z-index: 1;
	}
}
.cloud-weather-main {
	width: 100%;
	height: 100%;
	overflow: hidden;
	.head {
		width: 100%;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 15px;
		color: #fff;
		-webkit-app-region: drag;
		//background-color: rgba(0, 0, 0, 0.03);
		.logo {
			font-family: 'zk-font';
			font-size: 18px;
			margin-top: -80px;
			z-index: 1;
			position: relative;
		}
		.control {
			display: flex;
			align-items: center;
			-webkit-app-region: no-drag;
			.icon {
				width: 35px;
				height: 35px;
				line-height: 35px;
				text-align: center;
				cursor: pointer;
			}
			.icon:hover {
				background: rgba(255, 255, 255, 0.1);
				border-radius: 5px;
			}
			input {
				width: 200px;
				height: 32px;
				border-radius: 5px;
				background: rgba(255, 255, 255, 0.1);
				padding: 0 5px;
				color: #fff;
				margin-left: 15px;
			}
			input::-webkit-input-placeholder {
				color: #f8f8f8;
			}
		}
	}
	.container {
		width: 100%;
		height: calc(100% - 80px);
		overflow: auto;
		position: relative;
		z-index: 1;
		padding: 0 50px 20px 50px;
		color: #fff;
		canvas {
			background: rgba(255, 255, 255, 0.1);
			border-radius: 10px;
		}
		.city-name {
			width: 100%;
			text-align: center;
			font-size: 32px;
			font-weight: lighter;
		}
		.today-info {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-left: -20px;
			.img {
				width: 70px;
				margin-right: 10px;
				img {
					width: 100%;
				}
			}
			.temperate {
				font-size: 60px;
			}
			.unit {
				display: flex;
				align-items: center;
				justify-content: flex-start;
				flex-direction: column;
				font-size: 22px;
				width: 30px;
				height: 66px;
			}
		}
		.today-weather {
			width: 100%;
			text-align: center;
			font-size: 20px;
		}
		.today-wind {
			width: 100%;
			text-align: center;
			font-size: 14px;
			margin-top: 10px;
		}
		.title {
			width: 100%;
			font-size: 20px;
			margin: 20px auto;
		}
		.weather-card {
			display: flex;
			align-items: center;
			justify-content: space-between;
			li {
				background: rgba(255, 255, 255, 0.1);
				border-radius: 10px;
				display: flex;
				align-items: center;
				padding: 15px 10px;
				img {
					width: 60px;
				}
				.info {
					width: 130px;
					padding-left: 20px;
					font-size: 14px;
				}
			}
		}
		.tips-card {
			li {
				background: rgba(255, 255, 255, 0.1);
				border-radius: 10px;
				display: flex;
				align-items: center;
				padding: 15px 10px;
				flex-direction: column;
				margin-bottom: 10px;
				p {
					width: 100%;
					font-size: 16px;
				}
				span {
					font-weight: bold;
					float: right;
				}
				div {
					width: 100%;
					font-size: 14px;
					text-align: left;
					margin-top: 15px;
				}
			}
		}
	}
	.container-bg {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		background-size: cover !important;
		transition: background 0.4s ease-in-out;
		animation-duration: 0.5s;
		animation-fill-mode: both;
		z-index: -1;
		//filter: blur(50px);
	}
}
</style>
